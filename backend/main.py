from fastapi import FastAPI, UploadFile, File, HTTPException, Form
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import shutil
import os
from datetime import datetime
import pytz # Import pytz for timezone handling

# Import your utility functions
import utils.preprocess_solves as pf
import monthly_breakdown
#import time_spent_cubing # Commented out in original, keeping it that way
import longest_cubing_period
import max_time_spent_cubing_in_a_day
import most_solves_in_a_day
import pbs_per_day
import total_time_spent_solving
import plot_improvement
import solve_level
import average_period_duration
import most_active_time_of_day
import consistency

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "https://cstimer-data-visualiser.onrender.com"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

loaded_sessions = []
global_stats_cache = {}

class SessionIndexRequest(BaseModel):
    session_index: int

# Helper function to convert a date string to a localized string
def _localize_date_string(date_str: str, target_timezone_str: str) -> str:
    """
    Attempts to parse a date/datetime string (assumed to be naive or UTC)
    and localize it to the target timezone.

    Args:
        date_str (str): The date string (e.g., "YYYY-MM-DD" or "YYYY-MM-DD HH:MM:SS").
        target_timezone_str (str): The IANA timezone string (e.g., "America/New_York").

    Returns:
        str: The localized and formatted date string, or the original string
             if parsing/localization fails.
    """
    try:
        target_tz = pytz.timezone(target_timezone_str)
    except pytz.UnknownTimeZoneError:
        return f"{date_str} (Invalid Timezone: {target_timezone_str})"

    dt_obj = None
    # Try parsing as a full datetime first (assuming UTC if it includes time)
    try:
        dt_obj = datetime.strptime(date_str, '%Y-%m-%d %H:%M:%S').replace(tzinfo=pytz.utc)
    except ValueError:
        # If it's just a date, assume start of the day in UTC for consistency
        try:
            dt_obj = datetime.strptime(date_str, '%Y-%m-%d').replace(tzinfo=pytz.utc)
        except ValueError:
            # If still fails, return original string
            return date_str

    if dt_obj:
        localized_dt = dt_obj.astimezone(target_tz)
        # Format based on whether original string included time
        if ' ' in date_str:
            return localized_dt.strftime('%Y-%m-%d %H:%M:%S %Z%z') # Includes timezone abbreviation and offset
        else:
            return localized_dt.strftime('%Y-%m-%d')
    return date_str # Fallback


@app.post("/upload-solves/")
async def upload_solves(file: UploadFile = File(...), timezone: str = Form(...)): # Add timezone parameter
    global loaded_sessions, global_stats_cache

    upload_folder = "uploads"
    os.makedirs(upload_folder, exist_ok=True)
    file_location = f"{upload_folder}/{file.filename}"

    with open(file_location, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    # In a real application, you might modify `pf.load_all_sessions`
    # to interpret timestamps based on the provided timezone if the raw data
    # lacks timezone information. For this example, we assume it loads naive
    # datetimes that we'll then localize for display strings.
    loaded_sessions = pf.load_all_sessions(file_location)
    os.remove(file_location) 

    if not loaded_sessions:
        raise HTTPException(status_code=400, detail="No sessions found in the uploaded file.")

    # Compute global stats ONCE
    longest_period, max_duration_hours = longest_cubing_period.longest_cubing_period(loaded_sessions)
    max_date, max_time_hours = max_time_spent_cubing_in_a_day.max_time_spent_cubing_in_day(loaded_sessions)
    max_solves_date, max_solves = most_solves_in_a_day.most_solves_in_a_day(loaded_sessions)
    date_pbs, counts = pbs_per_day.most_pbs_in_a_day(loaded_sessions) # Renamed 'date' to 'date_pbs' to avoid conflict
    total_solves, event_times = total_time_spent_solving.time_spent_breakup(loaded_sessions)
    average_period_duration_stats = average_period_duration.average_time_per_day(loaded_sessions)
    days_dict, hours_dict = most_active_time_of_day.cubing_time_stats_dict(loaded_sessions)
    consistency_stats = consistency.consistency(loaded_sessions)
    monthly_breakdown_stats = monthly_breakdown.plot_monthly_event_time_breakdown(loaded_sessions)

    # Localize date strings before putting them into the cache
    localized_longest_period_start_date = _localize_date_string(longest_period.solves[0].date, timezone)
    localized_longest_period_end_date = _localize_date_string(longest_period.solves[-1].date, timezone)
    localized_max_date = _localize_date_string(max_date, timezone)
    localized_max_solves_date = _localize_date_string(max_solves_date, timezone)
    localized_date_pbs = _localize_date_string(date_pbs, timezone)


    global_stats_cache = {
        "longest_cubing_period_stats": (
            f"Longest time spent cubing at a stretch: {longest_period.session_name} with {len(longest_period.solves)} solves\n"
            f"Duration: {max_duration_hours:.2f} hours\n"
            f"Scramble Event: {longest_period.scramble_event}\n"
            f"Start Date: {localized_longest_period_start_date}\n" # Use localized date
            f"End Date: {localized_longest_period_end_date}"       # Use localized date
        ),
        "monthly_breakdown_stats": monthly_breakdown_stats,
        "max_time_spent_cubing_in_a_day_stats": f"{max_time_hours:.2f} hours on {localized_max_date}", # Use localized date
        "most_solves_in_a_day_stats": f"Day with the most solves: {localized_max_solves_date} with {max_solves} solves", # Use localized date
        "most_pbs_in_a_day_stats": f"Date with most PBs: {localized_date_pbs}, Counts: {counts[date_pbs]}", # Use localized date
        "pb_stats": counts, # This dictionary still contains original date strings as keys
        "total_solves_stats": total_solves,
        "event_times_stats": event_times,
        "average_period_duration_stats": f"Average time spent per day: {average_period_duration_stats:.2f} minutes",
        "days_dict_stats": days_dict, # These dictionaries would ideally be timezone-aware from their source utilities
        "hours_dict_stats": hours_dict, # Same as above
        "consistency_stats": consistency_stats,
        "session_names": [session.name for session in loaded_sessions],
    }

    return {
        "message": "File uploaded and global stats calculated",
        **global_stats_cache,
    }


@app.post("/session-stats/")
async def session_stats(request: SessionIndexRequest):
    global loaded_sessions
    if not loaded_sessions:
        raise HTTPException(status_code=400, detail="No sessions loaded. Please upload file first.")

    idx = request.session_index
    if idx < 0 or idx >= len(loaded_sessions):
        raise HTTPException(status_code=400, detail="Session index out of range.")

    session = loaded_sessions[idx]

    ao100_dict = plot_improvement.create_avg_dict(session, 100)
    ao100_pb_dict = plot_improvement.create_pb_dict(session, 100)
    solve_levels = solve_level.solve_levels_from_sessions([session])  # Pass list with one session

    # Note: For ao100_dict and ao100_pb_dict, if their keys are date strings,
    # and you want them localized, their respective utility functions
    # (plot_improvement.py) would need to be updated to handle timezones,
    # or you'd need to iterate and localize keys here if they are strings.
    # For now, assuming they are numerical or already handled by the plotting library.

    response = {
        "session_name": session.name,
        "ao100_progression": ao100_dict,
        "ao100_pb_progression": ao100_pb_dict,
        "solve_levels_stats": solve_levels,
    }

    return response
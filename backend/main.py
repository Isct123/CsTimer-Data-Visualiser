from fastapi import FastAPI, UploadFile, File, HTTPException, Form # <-- Ensure Form is imported
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import shutil
import os

import utils.preprocess_solves as pf
import monthly_breakdown
#import time_spent_cubing
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

@app.post("/upload-solves/")
# --- FIX 1: Add timezone as a Form parameter ---
async def upload_solves(file: UploadFile = File(...), timezone: str = Form(...)):
    global loaded_sessions, global_stats_cache

    upload_folder = "uploads"
    os.makedirs(upload_folder, exist_ok=True)
    file_location = f"{upload_folder}/{file.filename}"

    # --- FIX 2: Remove the incorrect timezone assignment ---
    # The 'timezone' variable now comes directly from the function arguments (Form data)
    # No need for: timezone = f"{upload_folder}/timezone"

    with open(file_location, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    # Pass the timezone string received from the frontend to load_all_sessions
    loaded_sessions = pf.load_all_sessions(file_location, timezone)
    os.remove(file_location) 

    if not loaded_sessions:
        raise HTTPException(status_code=400, detail="No sessions found in the uploaded file.")

    # Compute global stats ONCE
    # These functions now receive 'loaded_sessions' where each Solve.date is a timezone-aware datetime object.
    # It's crucial that these utility functions (longest_cubing_period, max_time_spent_cubing_in_a_day, etc.)
    # are updated to correctly handle and return datetime objects or formatted strings as discussed.
    longest_period, max_duration_hours = longest_cubing_period.longest_cubing_period(loaded_sessions)
    max_date_dt, max_time_hours = max_time_spent_cubing_in_a_day.max_time_spent_cubing_in_day(loaded_sessions) # Renamed to max_date_dt
    max_solves_date_dt, max_solves = most_solves_in_a_day.most_solves_in_a_day(loaded_sessions) # Renamed to max_solves_date_dt
    pbs_date_dt, counts = pbs_per_day.most_pbs_in_a_day(loaded_sessions) # Renamed to pbs_date_dt
    total_solves, event_times = total_time_spent_solving.time_spent_breakup(loaded_sessions)
    average_period_duration_stats = average_period_duration.average_time_per_day(loaded_sessions)
    days_dict, hours_dict = most_active_time_of_day.cubing_time_stats_dict(loaded_sessions)
    consistency_stats = consistency.consistency(loaded_sessions)
    monthly_breakdown_stats = monthly_breakdown.plot_monthly_event_time_breakdown(loaded_sessions)

    global_stats_cache = {
        "longest_cubing_period_stats": (
            # --- FIX 3: Explicitly format datetime objects for display ---
            f"Longest time spent cubing at a stretch: {longest_period.session_name} with {len(longest_period.solves)} solves\n"
            f"Duration: {max_duration_hours:.2f} hours\n"
            f"Scramble Event: {longest_period.scramble_event}\n"
            f"Start Date: {longest_period.solves[0].date.strftime('%Y-%m-%d %H:%M:%S %Z%z')}\n" # Format with timezone
            f"End Date: {longest_period.solves[-1].date.strftime('%Y-%m-%d %H:%M:%S %Z%z')}"    # Format with timezone
        ) if longest_period and longest_period.solves else "No longest period data available.", # Handle cases where longest_period might be None or empty

        "monthly_breakdown_stats": monthly_breakdown_stats,
        # --- FIX 3 (continued): Format other date objects for display ---
        # Assuming max_date_dt, max_solves_date_dt, pbs_date_dt are now datetime objects
        "max_time_spent_cubing_in_a_day_stats": f"{max_time_hours:.2f} hours on {max_date_dt.strftime('%Y-%m-%d %Z%z')}",
        "most_solves_in_a_day_stats": f"Day with the most solves: {max_solves_date_dt.strftime('%Y-%m-%d %Z%z')} with {max_solves} solves",
        # --- FIX 4: Address potential KeyError for counts[date] ---
        # Assuming pbs_date_dt is the datetime object, and counts uses a string key.
        # You MUST ensure that pbs_per_day.py returns keys in 'counts' that match this format.
        # If 'pbs_date_dt' is the datetime object, then 'counts[pbs_date_dt.strftime('%Y-%m-%d')]' might be needed.
        # For now, using 'pbs_date_dt' directly for string formatting in message, but be aware of the 'counts' key issue.
        "most_pbs_in_a_day_stats": f"Date with most PBs: {pbs_date_dt.strftime('%Y-%m-%d %Z%z')}, Counts: {counts.get(pbs_date_dt.strftime('%Y-%m-%d'), 'N/A')}", # Using .get() for safety
        "pb_stats": counts, # This dictionary itself might need keys to be formatted dates if used elsewhere
        "total_solves_stats": total_solves,
        "event_times_stats": event_times,
        "average_period_duration_stats": f"Average time spent per day: {average_period_duration_stats:.2f} minutes",
        "days_dict_stats": days_dict, # These should ideally be adjusted by timezone in their source for accurate daily counts
        "hours_dict_stats": hours_dict, # Same for hourly counts
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

    # These functions will now receive Solve objects with timezone-aware datetimes
    ao100_dict = plot_improvement.create_avg_dict(session, 100)
    ao100_pb_dict = plot_improvement.create_pb_dict(session, 100)
    solve_levels = solve_level.solve_levels_from_sessions([session]) 

    response = {
        "session_name": session.name,
        "ao100_progression": ao100_dict,
        "ao100_pb_progression": ao100_pb_dict,
        "solve_levels_stats": solve_levels,
    }

    return response
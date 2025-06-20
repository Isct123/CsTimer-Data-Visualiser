from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import shutil
import os

# Import all custom analysis modules
import utils.preprocess_solves as pf
import monthly_breakdown
import time_spent_cubing
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
from time_distribution import time_distribution

# Initialize FastAPI app
app = FastAPI()

# Enable CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "https://cstimer-data-visualiser.onrender.com"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global state
loaded_sessions = []
global_stats_cache = {}

# Pydantic model for session-specific requests
class SessionIndexRequest(BaseModel):
    session_index: int

@app.post("/upload-solves/")
async def upload_solves(
    file: UploadFile = File(...),
    timezone: str = Form(...)
):
    global loaded_sessions, global_stats_cache

    if not timezone:
        raise HTTPException(status_code=400, detail="Timezone not provided.")

    # Save uploaded file
    upload_folder = "uploads"
    os.makedirs(upload_folder, exist_ok=True)
    file_location = os.path.join(upload_folder, file.filename)

    with open(file_location, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    # Load sessions
    loaded_sessions = pf.load_all_sessions(file_location, timezone_str=timezone)

    if not loaded_sessions:
        raise HTTPException(status_code=400, detail="No sessions found in the uploaded file.")

    # Compute global stats once
    longest_period, max_duration_hours = longest_cubing_period.longest_cubing_period(loaded_sessions)
    max_date, max_time_hours = max_time_spent_cubing_in_a_day.max_time_spent_cubing_in_day(loaded_sessions)
    max_solves_date, max_solves = most_solves_in_a_day.most_solves_in_a_day(loaded_sessions)
    date, counts = pbs_per_day.most_pbs_in_a_day(loaded_sessions)
    total_solves, event_times = total_time_spent_solving.time_spent_breakup(loaded_sessions)
    average_period_duration_stats = average_period_duration.average_time_per_day(loaded_sessions)
    days_dict, hours_dict = most_active_time_of_day.cubing_time_stats_dict(loaded_sessions)
    consistency_stats = consistency.consistency(loaded_sessions)
    monthly_breakdown_stats = monthly_breakdown.plot_monthly_event_time_breakdown(loaded_sessions)

    # Prepare cache
    global_stats_cache = {
        "longest_cubing_period_stats": (
            f"Longest time spent cubing at a stretch: {longest_period.session_name} with {len(longest_period.solves)} solves\n"
            f"Duration: {max_duration_hours:.2f} hours\n"
            f"Scramble Event: {longest_period.scramble_event}\n"
            f"Start Date: {longest_period.solves[0].date}\n"
            f"End Date: {longest_period.solves[-1].date}"
        ),
        "max_time_spent_cubing_in_a_day_stats": f"{max_time_hours:.2f} hours on {max_date}",
        "most_solves_in_a_day_stats": f"Day with the most solves: {max_solves_date} with {max_solves} solves",
        "most_pbs_in_a_day_stats": f"Date with most PBs: {date}, Counts: {counts[date]}",
        "pb_stats": counts,
        "total_solves_stats": total_solves,
        "event_times_stats": event_times,
        "average_period_duration_stats": f"Average time spent per day: {average_period_duration_stats:.2f} minutes",
        "days_dict_stats": days_dict,
        "hours_dict_stats": hours_dict,
        "consistency_stats": consistency_stats,
        "session_names": [session.name for session in loaded_sessions],
        "monthly_breakdown_stats": monthly_breakdown_stats,
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
    solve_levels = solve_level.solve_levels_from_sessions([session])
    time_distribution_dict = time_distribution(session)

    return {
        "session_name": session.name,
        "ao100_progression": ao100_dict,
        "ao100_pb_progression": ao100_pb_dict,
        "solve_levels_stats": solve_levels,
        "time_distribution_dict":time_distribution_dict,
    }

from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
import time_spent_cubing as time_spent_cubing
import monthly_breakdown as monthly_breakdown
import max_time_spent_cubing_in_a_day as max_time_spent_cubing_in_a_day
import most_solves_in_a_day as most_solves_in_a_day
import shutil
import os
import longest_cubing_period as longest_cubing_period
import plot_improvement as plot_improvement
import pbs_per_day as pbs_per_day

app = FastAPI()

# Allow CORS so your React app (usually running on localhost:3000) can access the API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # React dev server origin
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Example upload endpoint
@app.post("/upload-solves/")
async def upload_solves(file: UploadFile = File(...)):
    # Save uploaded file temporarily
    upload_folder = "uploads"
    os.makedirs(upload_folder, exist_ok=True)
    file_location = f"{upload_folder}/{file.filename}"
    
    with open(file_location, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    # Now, load and process this file with your feature modules
    # For example, you can import your preprocessing function here
    from features.utils.preprocess_solves import load_all_sessions


    sessions = load_all_sessions(file_location)
    
    
    # Instead of plotting, you may want just the data:
    monthly_stats = monthly_breakdown.plot_monthly_event_time_breakdown(sessions)
    time_spent_cubing_stats = time_spent_cubing.time_spent_breakup(sessions)
    longest_period, max_duration_hours = longest_cubing_period.longest_cubing_period(sessions)
    max_date, max_time_hours = max_time_spent_cubing_in_a_day.max_time_spent_cubing_in_day(sessions)
    max_solves_date, max_solves = most_solves_in_a_day.most_solves_in_a_day(sessions)
    date, counts = pbs_per_day.most_pbs_in_a_day(sessions)
    most_pbs_in_a_day_stats = f"Date with most PBs: {date}, Counts: {counts[date]}"
    

    #TODO: Format the response string to be more attractive.
    response_str = (
        f"Longest cubing period: {longest_period.session_name} with {len(longest_period.solves)} solves\n"
        f"Duration: {max_duration_hours:.2f} hours\n"
        f"Scramble Event: {longest_period.scramble_event}\n"
        f"Multiple Events: {longest_period.multiple_events}\n"
        f"Start Date: {longest_period.solves[0].date}\n"
        f"End Date: {longest_period.solves[-1].date}"
    )

# Now response_str is a string you can return or send as a response

    
    # You can call other feature functions similarly and collect all results
    # For example:
    # feature1_stats = feature1.process(sessions)
    # feature2_stats = feature2.process(sessions)
    ao100_dict = plot_improvement.create_avg_dict(sessions[0], 100)
    ao100_pb_dict = plot_improvement.create_pb_dict(sessions[0], 100)
    # Return a JSON response with all stats
    response = {
        "monthly_stats": monthly_stats,
        "time_spent_stats": time_spent_cubing_stats,
        "longest_cubing_period_stats": response_str,
        "max_time_spent_cubing_in_a_day_stats": f"{max_time_hours:.2f} hours on {max_date}",
        "most_solves_in_a_day_stats": f"Day with the most solves: {max_solves_date} with {max_solves} solves",
        "ao100_progression": ao100_dict,
        "ao100_pb_progression": ao100_pb_dict,
        "most_pbs_in_a_day_stats": most_pbs_in_a_day_stats,
        "pb_stats":counts,
        #Add other feature stats here as needed
    }
    #print(time_spent_cubing_stats)
    return response

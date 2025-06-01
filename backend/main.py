from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
import time_spent_cubing
import monthly_breakdown
import shutil
import os

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
    from utils.preprocess_solves import load_all_sessions


    sessions = load_all_sessions(file_location)
    
    
    # Instead of plotting, you may want just the data:
    monthly_stats = monthly_breakdown.plot_monthly_event_time_breakdown(sessions)
    #time_spent_cubing_stats = time_spent_cubing.time_spent_breakup(sessions)
    
    # You can call other feature functions similarly and collect all results
    # For example:
    # feature1_stats = feature1.process(sessions)
    # feature2_stats = feature2.process(sessions)
    
    # Return a JSON response with all stats
    return {
        "monthly_stats": monthly_stats,
        #"time_spent_stats": time_spent_cubing_stats,
        # "feature1_stats": feature1_stats,
        # "feature2_stats": feature2_stats,
    }

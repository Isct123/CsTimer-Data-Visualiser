# Cubing Analytics App

This is a full-stack cubing analytics web app built with **ReactJS** (frontend) and **FastAPI** (backend). It allows speedcubers to upload solve data (e.g., from csTimer), visualize trends, detect tilt/fatigue, track PBs, and more.

The project aims to help cubers understand their performance through charts, models, and intelligent analytics.

---

## ✅ Features Implemented

- [x] Time spent cubing and session breakdown via pie chart
- [x] Improvement in times per event
- [x] Max time spent cubing in a day
- [x] Max solves in a day
- [x] Most PBs in a day
- [x] Most improvement in a session
- [x] Heatmap of which events you enjoyed when (session-wise)
- [x] Favorite event per month (by time spent)
- [x] Standard deviation-based consistency metric
- [x] Monthly cubing time analysis
- [x] PB count by the month
- [x] Average session duration and trend analysis
- [x] Most active time of day for cubing
- [x] Average duration of a cubing period

---

## 🚧 Features TODO

- [ ] Make the stats rendered server side and use Python only for machine learning models backend.
- [ ] Solve streaks – longest streaks of sub-X solves
- [ ] Most frequently occurring solve time
- [ ] Time spent to reach milestones (single, Ao5, Ao12, etc.)
- [ ] Motivation score (based on percentile and cubing time)
- [ ] Tilt detection – sessions where performance dropped the most
- [ ] ML-based goal projections and PB prediction
- [ ] Target/achievement tracker
- [ ] Time-between-solves histogram (including scrambling time)
- [ ] Hour-of-day performance heatmap
- [ ] Metric to score solve quality
- [ ] Day-of-week performance heatmap
- [ ] Ao5/Ao12 progression trend graphs and predictions
- [ ] Timeline of every PB achieved
- [ ] Hall of fame sessions (best PB runs, improvements, etc.)
- [ ] Daily graph of time spent cubing
- [ ] Most PBs broken in a day/week/month
- [ ] LLM interface for querying stats using natural language
- [ ] Graph of best Ao5/Ao12 per session
- [ ] Graph of fastest single per session
- [ ] Longest daily streak
- [ ] Longest session by time or solve count
- [ ] “Cool moments” – e.g., 0.01 PB difference
- [ ] LLM-based goal tracking
- [ ] PB pace projections and future estimates
- [ ] Comeback detection – fastest recovery after a slump
- [ ] Session with biggest improvement
- [ ] Session with worst tilt
- [ ] Fatigue detection – performance drop in long sessions
- [ ] Best time of day to cube analysis
- [ ] Habit detection (e.g., cubing every Friday night)
- [ ] GitHub-style daily solve heatmap
- [ ] PB timeline
- [ ] Monthly PB bar chart
- [ ] “Close calls” tracker – nearly missed PBs
- [ ] Range-based solve time distribution graph
- [ ] React-based solve filtering
- [ ] Manual session–event mapping
- [ ] Event-wise and session-wise analytics
- [ ] Longest session analysis
- [ ] Filter by event and session (multi-select)
- [ ] Total number of sessions
- [ ] Time frequency histogram
- [ ] WCA API integration to compare PBs with rankings

---

## Project Structure

```
root/
├── backend/ # FastAPI backend
│ ├── features/ # Core analysis modules
│ ├── utils/ # Data preprocessing and helpers
│ ├── uploads/ # Uploaded solve files
│ └── main.py # FastAPI app entry point
│
├── frontend/ # ReactJS frontend
│ ├── src/ # App components
│ └── public/ # Static assets
│
└── .gitignore
```

---

## Getting Started

### Prerequisites

- Node.js and npm (for frontend)
- Python 3.10+ with `pip` (for backend)
- Git

---

### Backend Setup (FastAPI)

```bash
cd backend
python -m venv venv
source venv/bin/activate       # For Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload      # Runs on http://localhost:8000
```

### Frontend Setup (React)

```bash
cd frontend
npm install
npm start
```

### Notes from me:

This project isn't nearly as professional as I would like it to be so I am working on fine tuning a lot of features, removing default stuff and implementing better programming practices.

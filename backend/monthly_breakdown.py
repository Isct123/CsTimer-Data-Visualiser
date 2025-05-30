# utils/plot_monthly_breakdown.py

from collections import defaultdict
from datetime import datetime
import matplotlib.pyplot as plt
from dateutil.relativedelta import relativedelta
import utils.preprocess_solves as pf
from utils.preprocess_solves import get_cubing_periods
import numpy as np

def month_key(date: datetime) -> str:
    """Helper to convert a datetime into a 'YYYY-MM' key."""
    return date.strftime('%Y-%m')

def plot_monthly_event_time_breakdown(sessions):
    # monthly_event_times[month][event] = total duration (in seconds)
    monthly_event_times = defaultdict(lambda: defaultdict(float))
    all_dates = []

    for session in sessions:
        periods = get_cubing_periods(session)
        for period in periods:
            if not period.solves:
                continue

            # Use the time_spent method, which returns minutes spent
            duration_minutes = period.time_spent()
            # Fix negative or zero duration: if duration < 0 or 0, fallback to minimal duration (e.g., 1 minute)
            if duration_minutes <= 0:
                # This can happen if only one solve or timestamp issues,
                # We can approximate duration by adding a minimal default like 1 minute per solve
                duration_minutes = max(1, len(period.solves))  # at least 1 minute per solve

            first_time = datetime.strptime(period.solves[0].date, '%Y-%m-%d %H:%M:%S')
            month = month_key(first_time)
            event = period.scramble_event
            monthly_event_times[month][event] += duration_minutes
            all_dates.append(first_time)

    if not all_dates:
        print("No cubing data found.")
        return {}

    # Ensure all months are represented
    min_month = datetime(min(all_dates).year, min(all_dates).month, 1)
    max_month = datetime(max(all_dates).year, max(all_dates).month, 1)

    months = []
    current = min_month
    while current <= max_month:
        months.append(month_key(current))
        current += relativedelta(months=1)

    # Get all event types
    all_events = sorted({event for month in monthly_event_times for event in monthly_event_times[month]})

    # Prepare data for stacked bar chart (convert minutes to hours)
    event_data = {event: [] for event in all_events}
    for month in months:
        for event in all_events:
            event_data[event].append(monthly_event_times[month].get(event, 0) / 60)

    # Color palette for events
    colors = plt.cm.get_cmap('tab20', len(all_events))
    
    fig, ax = plt.subplots(figsize=(12, 6))
    bottom = np.zeros(len(months))
    for i, event in enumerate(all_events):
        values = event_data[event]
        ax.bar(months, values, bottom=bottom, label=event, color=colors(i))
        bottom += values

    ax.set_xlabel("Month")
    ax.set_ylabel("Time Spent (hours)")
    ax.set_title("Monthly Cubing Time Breakdown by Event")
    ax.legend(title="WCA Event", bbox_to_anchor=(1.05, 1), loc='upper left')
    plt.xticks(rotation=45)
    plt.tight_layout()
    plt.grid(axis='y', linestyle='--', alpha=0.6)
    plt.show()

    # Return raw dictionary (converted to hours)
    monthly_hours = {
        month: {event: monthly_event_times[month].get(event, 0) / 60 for event in all_events}
        for month in months
    }
    return monthly_hours

if __name__ == "__main__":
    # Example usage with real data file path
    sessions = pf.load_all_sessions(filepath="data/suku.txt")
    monthly_breakdown = plot_monthly_event_time_breakdown(sessions)
    print(monthly_breakdown)

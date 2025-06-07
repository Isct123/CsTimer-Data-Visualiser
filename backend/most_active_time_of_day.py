from datetime import datetime, timedelta
from collections import defaultdict
import calendar
from utils.preprocess_solves import load_all_sessions, load_all_cubing_periods

def cubing_time_stats_dict(sessions):
    cubing_periods = load_all_cubing_periods(sessions)
    time_per_hour = defaultdict(float)     # key: int hour 0-23, value: hours (float)
    time_per_weekday = defaultdict(float)  # key: weekday int (0=Mon), value: hours (float)

    for period in cubing_periods:
        if not period.solves:
            continue
        start_dt = datetime.strptime(period.solves[0].date, '%Y-%m-%d %H:%M:%S')
        end_dt = datetime.strptime(period.solves[-1].date, '%Y-%m-%d %H:%M:%S')

        current = start_dt
        while current < end_dt:
            # next hour mark (start of next hour)
            next_hour = (current + timedelta(hours=1)).replace(minute=0, second=0, microsecond=0)
            if next_hour > end_dt:
                next_hour = end_dt

            seconds_in_hour = (next_hour - current).total_seconds()
            hours_spent = seconds_in_hour / 3600

            hour_key = current.hour
            weekday_key = current.weekday()  # Monday=0, Sunday=6

            time_per_hour[hour_key] += hours_spent
            time_per_weekday[weekday_key] += hours_spent

            current = next_hour

    # Convert weekday keys from int to string names
    time_per_weekday_named = {calendar.day_name[k].lower(): round(v, 2) for k, v in time_per_weekday.items()}

    # For hours, keys as ints 0-23, values rounded hours
    time_per_hour_rounded = {k: round(v, 2) for k, v in sorted(time_per_hour.items())}

    return time_per_weekday_named, time_per_hour_rounded

if __name__ == "__main__":
    sessions = load_all_sessions("data/suku.txt")
    cubing_periods = load_all_cubing_periods(sessions)

    days_dict, hours_dict = cubing_time_stats_dict(cubing_periods)
    print("Time spent per day of week (hours):", days_dict)
    print("Time spent per hour of day (hours):", hours_dict)

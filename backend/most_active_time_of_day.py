from datetime import datetime, timedelta
from collections import defaultdict, OrderedDict
import calendar
from utils.preprocess_solves import load_all_sessions, load_all_cubing_periods
import platform


def cubing_time_stats_dict(sessions):
    cubing_periods = load_all_cubing_periods(sessions)
    time_per_hour = defaultdict(float)     # key: int hour 0-23
    time_per_weekday = defaultdict(float)  # key: weekday int (0=Monday)

    for period in cubing_periods:
        if not period.solves:
            continue
        start_dt = datetime.strptime(period.solves[0].date, '%Y-%m-%d %H:%M:%S')
        end_dt = datetime.strptime(period.solves[-1].date, '%Y-%m-%d %H:%M:%S')

        current = start_dt
        while current < end_dt:
            next_hour = (current + timedelta(hours=1)).replace(minute=0, second=0, microsecond=0)
            if next_hour > end_dt:
                next_hour = end_dt

            seconds_in_hour = (next_hour - current).total_seconds()
            hours_spent = seconds_in_hour / 3600

            time_per_hour[current.hour] += hours_spent
            time_per_weekday[current.weekday()] += hours_spent

            current = next_hour

    # Convert weekday int (0–6) to names like "monday"
    time_per_weekday_named = {
        calendar.day_name[k].lower(): round(v, 2) for k, v in sorted(time_per_weekday.items())
    }

    # Convert 0–23 to "12 AM", "1 AM", ..., "11 PM", sorted chronologically
    

    def format_hour_label(hour):
        dt = datetime.strptime(str(hour), "%H")
        if platform.system() == "Windows":
            return dt.strftime("%#I %p")  # Windows: removes leading 0
        else:
            return dt.strftime("%-I %p")  # Linux/macOS: removes leading 0

    time_per_hour_named = OrderedDict()
    for hour in range(24):  # Sorted from 0 to 23
        if hour in time_per_hour:
            time_per_hour_named[format_hour_label(hour)] = round(time_per_hour[hour], 2)

    return time_per_weekday_named, time_per_hour_named


if __name__ == "__main__":
    sessions = load_all_sessions("data/suku.txt")
    days_dict, hours_dict = cubing_time_stats_dict(sessions)
    print("Time spent per weekday (hours):", days_dict)
    print("Time spent per hour of day (hours):", hours_dict)

import utils.preprocess_solves as pf
from datetime import datetime

def average_time_per_day(sessions):
    cubing_periods = pf.load_all_cubing_periods(sessions)
    total_duration = 0  # in minutes
    min_date = None
    max_date = None

    for period in cubing_periods:
        if not period.solves:
            continue

        total_duration += period.time_spent()

        first_solve_date = datetime.strptime(period.solves[0].date, '%Y-%m-%d %H:%M:%S')
        last_solve_date = datetime.strptime(period.solves[-1].date, '%Y-%m-%d %H:%M:%S')

        if min_date is None or first_solve_date < min_date:
            min_date = first_solve_date
        if max_date is None or last_solve_date > max_date:
            max_date = last_solve_date

    if min_date is None or max_date is None or min_date == max_date:
        return 0  # Avoid division by zero

    days_between = (max_date - min_date).days + 1  # inclusive of both ends
    return total_duration / days_between


if __name__ == "__main__":
    sessions = pf.load_all_sessions("data/real.txt")  # use actual path
    avg_duration = average_time_per_day(sessions)
    print(f"Average cubing time per day: {avg_duration:.2f} minutes")

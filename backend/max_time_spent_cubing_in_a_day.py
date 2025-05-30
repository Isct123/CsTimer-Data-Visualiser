import utils.preprocess_solves as pf

def max_time_spent_cubing_in_day(cubing_periods=pf.load_all_cubing_periods(filepath="data/real.txt")):
    """Calculate the maximum time spent cubing in a single day from the provided cubing periods.

    Args:
        cubing_periods (list): List of CubingPeriod objects containing solves.
    """
    daily_time_spent = {}

    for period in cubing_periods:
        date = period.solves[0].date.split(" ")[0]  # extract only the date part "YYYY-MM-DD"
        time_spent = period.time_spent() * 60  # convert minutes to seconds

        if date not in daily_time_spent:
            daily_time_spent[date] = 0
        daily_time_spent[date] += time_spent

    max_time = max(daily_time_spent.values())
    max_date = [date for date, time in daily_time_spent.items() if time == max_time][0]

    return max_date, max_time / 3600  # return date and time in hours

if __name__ == "__main__":
    cubing_periods = pf.load_all_cubing_periods(filepath="data/suku.txt")
    max_date, max_time_hours = max_time_spent_cubing_in_day(cubing_periods)
    print(f"Maximum time spent cubing in a single day: {max_time_hours:.2f} hours on {max_date}")
import utils.preprocess_solves as pf

def most_solves_in_a_day(sessions):
    """Calculate the day with the most solves from the provided cubing periods.

    Args:
        cubing_periods (list): List of CubingPeriod objects containing solves.
    """
    daily_solve_count = {}
    cubing_periods = pf.load_all_cubing_periods(sessions)
    for period in cubing_periods:
        date = period.solves[0].date.split(" ")[0]  # extract only the date part "YYYY-MM-DD"
        solve_count = len(period.solves)

        if date not in daily_solve_count:
            daily_solve_count[date] = 0
        daily_solve_count[date] += solve_count

    max_solves = max(daily_solve_count.values())
    max_date = [date for date, count in daily_solve_count.items() if count == max_solves][0]

    return max_date, max_solves  # return date and number of solves

if __name__ == "__main__":
    cubing_periods = pf.load_all_cubing_periods(pf.load_all_sessions(filepath="data/real.txt"))
    max_date, max_solves = most_solves_in_a_day(cubing_periods)
    print(f"Day with the most solves: {max_date} with {max_solves} solves")
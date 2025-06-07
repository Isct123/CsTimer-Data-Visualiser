import utils.preprocess_solves as pf

def longest_cubing_period(sessions):
    """Find the longest cubing period from the provided cubing periods.

    Args:
        periods (list): List of CubingPeriod objects containing solves.
    """
    periods = pf.load_all_cubing_periods(sessions)
    longest_period = None
    max_duration = 0

    for period in periods:
        duration = period.time_spent() * 60  # convert minutes to seconds
        if duration > max_duration:
            max_duration = duration
            longest_period = period

    return longest_period, max_duration / 3600  # return period and duration in hours

if __name__ == "__main__":  
    longest_period, max_duration_hours = longest_cubing_period(sessions = pf.load_all_sessions("data/suku.txt"))
    print(f"Longest cubing period: {longest_period.session_name} with {len(longest_period.solves)} solves")
    print(f"Duration: {max_duration_hours:.2f} hours")
    print(f"Scramble Event: {longest_period.scramble_event}")
    print(f"Multiple Events: {longest_period.multiple_events}")
    print(f"Start Date: {longest_period.solves[0].date}")
    print(f"End Date: {longest_period.solves[-1].date}")
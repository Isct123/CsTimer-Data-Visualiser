import utils.preprocess_solves as pf
from datetime import datetime

def time_spent_breakup(sessions):
    """Calculate the total time spent on solves for each event in the provided cubing periods.
    
    Args:
        cubing_periods (list): List of CubingPeriod objects containing solves.
    """
    cubing_periods = pf.load_all_cubing_periods(sessions)
    event_times = {}

    for period in cubing_periods:
        local_total = period.time_spent() / 60  # convert minutes to seconds
        event = period.scramble_event
        if event not in event_times:
            event_times[event] = 0
        event_times[event] += local_total

    return event_times


def seconds_to_days_hours_minutes(seconds):
    """Convert seconds to days, hours, and minutes."""
    days = seconds // (24 * 3600)
    seconds %= (24 * 3600)
    hours = seconds // 3600
    seconds %= 3600
    minutes = seconds // 60
    return days, hours, minutes

if __name__ == "__main__":
    #cubing_periods = pf.load_all_cubing_periods(pf.load_all_sessions(filepath="data/sample.txt"))
    sessions = pf.load_all_sessions(filepath="data/suku.txt")
    print(type(sessions))
    total_time = time_spent_breakup(sessions)
    for event, total in total_time.items():
        days, hours, minutes = seconds_to_days_hours_minutes(total)
        print(f"Event: {event}, {days} days, {hours} hours, and {minutes} minutes spent on solves")
    print(f"Total time spent on all events: {sum(total_time.values()) / (24 * 3600):.2f} days")
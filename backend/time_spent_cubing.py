import utils.preprocess_solves as pf
from datetime import datetime

def time_spent_breakup(sessions = pf.load_all_sessions(filepath="data/suku.txt")):
    """Calculate the total time spent on solves for each event in the provided cubing periods.
    
    Args:
        cubing_periods (list): List of CubingPeriod objects containing solves.
    """
    for s in sessions:
        cubing_periods = pf.get_cubing_periods(s)
    event_times = {}
    cstimer_event_map = {
        "3x3": "3x3x3 Rubik's Cube",
        "222so": "2x2x2 Single Official",
        "333oh": "3x3x3 One-Handed",
        "333ni": "3x3x3 No Inspection",
        "skbso": "Skewb Single Official",
        "sqrs": "Square-1",
        "pyrso": "Pyraminx Single Official",
        "444wca": "4x4x4 WCA Official",
        "333fm": "3x3x3 Fewest Moves",
        "555wca": "5x5x5 WCA Official",
        "mgmp": "Megaminx Practice",
        "2gen": "2-Generator Scramble",
        "r3ni": "Roux 3x3x3 No Inspection",
        "ll": "Last Layer Practice",
        "easyxc": "Easy Cross Practice",
        "r3": "Roux 3x3x3 Practice"
    }

    for period in cubing_periods:
        local_total = period.time_spent() * 60  # convert minutes to seconds
        event = cstimer_event_map.get(period.scramble_event, period.scramble_event)
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
    cubing_periods = pf.load_all_cubing_periods(filepath="data/suku.txt")
    total_time = time_spent_breakup(cubing_periods)
    for event, total in total_time.items():
        days, hours, minutes = seconds_to_days_hours_minutes(total)
        print(f"Event: {event}, {days} days, {hours} hours, and {minutes} minutes spent on solves")
    print(f"Total time spent on all events: {sum(total_time.values()) / (24 * 3600):.2f} days")
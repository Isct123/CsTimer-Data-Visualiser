import utils.preprocess_solves as pf 

def time_spent_breakup(sessions = pf.load_all_sessions()):
    """Calculate the total time spent on solves for each event in the provided sessions.
    Args:
        sessions (list): List of Session objects containing solves. """
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

    for session in sessions:
        local_total = 0
        for solve in session.solves:
            local_total += solve.time
        if cstimer_event_map[session.scramble_event] not in event_times:
            event_times[cstimer_event_map[session.scramble_event]] = 0
        event_times[cstimer_event_map[session.scramble_event]] += local_total
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
    sessions = pf.load_all_sessions()
    total_time = time_spent_breakup(sessions)
    for event, total in total_time.items():
        print(f"Event: %s, %i days %i hours and %i minutes spent on solves"%(
            event,
            int(total // (24 * 3600)),
            int((total % (24 * 3600)) // 3600),
            int((total % (24 * 3600) % 3600) // 60)
        ))
    print(f"Total time spent on all events: {sum(total_time.values()) / (24 * 3600):.2f} days")
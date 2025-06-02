import utils.preprocess_solves as pf 

def time_spent_breakup(sessions):
    """Calculate the total time spent on solves for each event in the provided sessions.
    Args:
        sessions (list): List of Session objects containing solves. """
    event_times = {}

    total_solves = 0
    for session in sessions:
        total_solves += len(session.solves)
        local_total = 0
        for solve in session.solves:
            if(solve.time != float('inf')):
                local_total += (solve.time/3600)
        if session.scramble_event not in event_times:
            event_times[session.scramble_event] = 0
        event_times[session.scramble_event] += local_total
    return total_solves, sum(event_times.values())



if __name__ == "__main__":  
    sessions = pf.load_all_sessions("data/suku.txt")
    total_solves, event_times = time_spent_breakup(sessions)
    total_time = time_spent_breakup(sessions)
    print(total_solves, event_times)
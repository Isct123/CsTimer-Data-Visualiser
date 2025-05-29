import json
from datetime import datetime

class Solve:
    def __init__(self, time, date, scramble, penalty, comment):
        self.time = time
        self.date = date
        self.scramble = scramble
        self.penalty = penalty
        self.comment = comment

    def __str__(self):
        return f"Time: {self.time}s, Date: {self.date}, Scramble: {self.scramble}, Penalty: {self.penalty}, Comment: {self.comment}"

    def __repr__(self):
        return str(self)

class Session:
    def __init__(self, name, session_id, scramble_event, solves, multiple_events=False):
        self.name = name
        self.id = session_id
        self.scramble_event = scramble_event
        self.solves = solves
        self.multiple_events = multiple_events

    

    def __str__(self):
        return f"Session: {self.name}, Solves: {len(self.solves)} for {self.scramble_event}, ID: {self.id}, Multiple Events: {self.multiple_events}"

    def __repr__(self):
        return str(self)
    
class CubingPeriod:
    def __init__(self, session_name, scramble_event, solves, multiple_events=False):
        self.session_name = session_name
        self.scramble_event = scramble_event
        self.solves = solves
        self.multiple_events = multiple_events

    def __str__(self):
        return f"CubingPeriod: {self.session_name}, Solves: {len(self.solves)} for {self.scramble_event}, Multiple Events: {self.multiple_events} from {self.solves[0].date} to {self.solves[-1].date}"

    def __repr__(self):
        return str(self)
    
    def time_spent(self):
        """Calculate the total time spent on solves in this cubing period."""
        first_solve = datetime.strptime(self.solves[0].date, '%Y-%m-%d %H:%M:%S')
        last_solve = datetime.strptime(self.solves[-1].date, '%Y-%m-%d %H:%M:%S')
        return (last_solve - first_solve).total_seconds() / 60

def unix_to_time(unix_time):
    return datetime.fromtimestamp(unix_time).strftime('%Y-%m-%d %H:%M:%S')

def create_solve(raw_solve):
    penalty = raw_solve[0][0]
    time = raw_solve[0][1] / 1000  # ms to s
    scramble = raw_solve[1]
    comment = raw_solve[2]
    date = unix_to_time(raw_solve[3])
    return Solve(time, date, scramble, penalty, comment)

def load_solves_for_session(data, session_key):
    solve_entries = data.get(session_key, [])
    return [create_solve(s) for s in solve_entries]

def get_cubing_periods(session):
    """Partition sessions into cubing periods based on the assumption that a cubing period has solves within a 20 minute window."""
    cubing_periods = []  
    current_period = CubingPeriod(
        session_name=session.name,
        scramble_event=session.scramble_event,
        solves=[],
        multiple_events=session.multiple_events
    )
    for solve in session.solves:
        if not current_period.solves:
            current_period.solves.append(solve)
            continue
        
        last_solve_time = datetime.strptime(current_period.solves[-1].date, '%Y-%m-%d %H:%M:%S')
        current_solve_time = datetime.strptime(solve.date, '%Y-%m-%d %H:%M:%S')
        
        if (current_solve_time - last_solve_time).total_seconds() <= 1200:  # 20 minutes in seconds
            current_period.solves.append(solve)
        else:
            cubing_periods.append(current_period)
            current_period = CubingPeriod(
                session_name=session.name,
                scramble_event=session.scramble_event,
                solves=[solve],
                multiple_events=session.multiple_events
            )


    return cubing_periods

def seconds_to_days_hours_minutes(seconds):
    """Convert seconds to days, hours, and minutes."""
    days = seconds // (24 * 3600)
    seconds %= (24 * 3600)
    hours = seconds // 3600
    seconds %= 3600
    minutes = seconds // 60
    return days, hours, minutes

def load_all_sessions(filepath):
    with open(filepath, 'r') as f:
        raw_data = json.load(f)

    session_data = json.loads(raw_data['properties']['sessionData'])
    sessions = []

    for session_id_str, metadata in session_data.items():
        session_key = f"session{session_id_str}"
        name = str(metadata.get('name', f'Session {session_id_str}'))
        scramble_event = metadata.get('opt', {}).get('scrType', '3x3')
        solves = load_solves_for_session(raw_data, session_key)
        session = Session(
            name=f"Session {name}",
            session_id=int(session_id_str),
            scramble_event=scramble_event,
            solves=solves,
            multiple_events=False
        )
        sessions.append(session)

    return sessions

def load_all_cubing_periods(filepath):
    """Load all cubing periods from the provided sessions."""
    cubing_periods = []
    sessions = load_all_sessions(filepath)
    for session in sessions:
        cubing_periods.extend(get_cubing_periods(session))
    return cubing_periods

if __name__ == "__main__":
    sessions = load_all_sessions()
    print(get_cubing_periods(sessions[0])[0])  # Print the first cubing period of the first session
    print()
    print(get_cubing_periods(sessions[0])[2])  # Print the first cubing period of the first session
    print()
    print(get_cubing_periods(sessions[0])[2].time_spent())  # Print the first cubing period of the first session
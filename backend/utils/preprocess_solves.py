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

    def add_solve(self, solve):
        self.solves.append(solve)

    def __str__(self):
        return f"Session: {self.name}, Solves: {len(self.solves)} for {self.scramble_event}, ID: {self.id}, Multiple Events: {self.multiple_events}"

    def __repr__(self):
        return str(self)

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

def load_all_sessions(filepath='data/sample.txt'):
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

if __name__ == "__main__":
    sessions = load_all_sessions("data/real.txt")
    for session in sessions:
        print(session)
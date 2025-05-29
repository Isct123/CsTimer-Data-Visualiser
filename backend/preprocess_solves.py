import json
from datetime import datetime

class solve:
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


def UnixToTime(unix_time):
    """Convert Unix timestamp to human-readable time."""
    
    return datetime.fromtimestamp(unix_time).strftime('%Y-%m-%d %H:%M:%S')

def create_object(s):
    penalty = s[0][0]
    time = s[0][1]/1000
    scramble = s[1]
    date = UnixToTime(int(s[3]))
    comment = s[2]
    obj = solve(time, date, scramble, penalty, comment)
    return obj

def load_session_solves(file_path, session_name):
    """    Load solves from a JSON file for a specific session.
    Args:
        file_path (str): Path to the JSON file containing solves.
        session_name (str): Name of the session to load solves for.   Returns: An object that contains the solves for the specified session.
    """
    with open(file_path, 'r') as file:
        solves = json.load(file)

    solves_list = []
    
    for s in solves[session_name]:
        solves_list.append(create_object(s))
        #print(create_object(s))
    return solves_list

print(load_session_solves('data/sample.txt', 'session1'))
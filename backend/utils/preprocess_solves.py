import json
from datetime import datetime
import utils.scramble_codes as sc
import pytz # Import pytz for timezone handling

class Solve:
    def __init__(self, time, date, scramble, penalty, comment):
        self.time = time
        # date is now a timezone-aware datetime object
        self.date = date
        self.scramble = scramble
        self.penalty = penalty
        self.comment = comment

    def __str__(self):
        # Format date for display here, including timezone info
        return f"Time: {self.time}s, Date: {self.date.strftime('%Y-%m-%d %H:%M:%S %Z%z')}, Scramble: {self.scramble}, Penalty: {self.penalty}, Comment: {self.comment}"

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
        # Ensure dates are formatted with timezone for display
        start_date_str = self.solves[0].date.strftime('%Y-%m-%d %H:%M:%S %Z%z') if self.solves else 'N/A'
        end_date_str = self.solves[-1].date.strftime('%Y-%m-%d %H:%M:%S %Z%z') if self.solves else 'N/A'
        return f"CubingPeriod: {self.session_name}, Solves: {len(self.solves)} for {self.scramble_event}, Multiple Events: {self.multiple_events} from {start_date_str} to {end_date_str}"

    def __repr__(self):
        return str(self)

    def time_spent(self):
        """Calculate the total time spent on solves in this cubing period.
           Uses timezone-aware datetime objects directly.
        """
        if not self.solves:
            return 0.0 # Or raise an error, depending on desired behavior for empty periods
        first_solve_dt = self.solves[0].date
        last_solve_dt = self.solves[-1].date
        return (last_solve_dt - first_solve_dt).total_seconds() / 60

# --- MODIFIED FUNCTION ---
def unix_to_time(unix_time: float, target_timezone_str: str) -> datetime:
    """
    Converts a Unix timestamp (assumed UTC) to a naive datetime object
    representing the time in the specified target timezone.

    WARNING: This function removes timezone information after conversion.
             The returned datetime object is 'naive' (no tzinfo).
    """
    try:
        target_tz = pytz.timezone(target_timezone_str)
    except pytz.UnknownTimeZoneError:
        print(f"Warning: Unknown timezone '{target_timezone_str}'. Falling back to UTC then making naive.")
        target_tz = pytz.utc

    # 1. Create a timezone-aware datetime object in UTC from the timestamp
    dt_object_utc = datetime.fromtimestamp(unix_time, tz=pytz.utc)
    
    # 2. Localize the UTC datetime object to the target timezone (still timezone-aware)
    dt_object_localized_aware = dt_object_utc.astimezone(target_tz)
    
    # 3. Create a NEW naive datetime object from the components of the localized aware object.
    # This effectively "strips" the timezone information.
    dt_object_naive_local = datetime(
        dt_object_localized_aware.year,
        dt_object_localized_aware.month,
        dt_object_localized_aware.day,
        dt_object_localized_aware.hour,
        dt_object_localized_aware.minute,
        dt_object_localized_aware.second,
        dt_object_localized_aware.microsecond
    )
    
    return dt_object_naive_local # Return naive datetime object

# --- MODIFIED FUNCTION ---
def create_solve(raw_solve, timezone_str: str): # Added timezone_str parameter
    penalty = raw_solve[0][0]
    time = raw_solve[0][1] / 1000  # ms to s
    scramble = raw_solve[1]
    comment = raw_solve[2]
    
    # Pass the timezone_str to unix_to_time
    date = unix_to_time(raw_solve[3], timezone_str)
    
    if(penalty == -1):
        time = float('inf')  # Handle DNF as infinity
    elif(penalty == 2000):
        time += 2  # Handle +2 penalty
    return Solve(time, date, scramble, penalty, comment)

# --- MODIFIED FUNCTION ---
def load_solves_for_session(data, session_key, timezone_str: str): # Added timezone_str parameter
    solve_entries = data.get(session_key, [])
    # Pass the timezone_str to create_solve for each solve
    return [create_solve(s, timezone_str) for s in solve_entries]

# --- MODIFIED FUNCTION ---
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

        # Now using timezone-aware datetime objects directly from solve.date
        last_solve_time = current_period.solves[-1].date
        current_solve_time = solve.date

        if (current_solve_time - last_solve_time).total_seconds() <= 1200:  # 20 minutes in seconds
            current_period.solves.append(solve)
        else:
            if current_period.solves: # Ensure current_period is not empty before appending
                cubing_periods.append(current_period)
            current_period = CubingPeriod(
                session_name=session.name,
                scramble_event=session.scramble_event,
                solves=[solve],
                multiple_events=session.multiple_events
            )
    if current_period.solves: # Add the last period if it contains solves
        cubing_periods.append(current_period)

    return cubing_periods

def seconds_to_days_hours_minutes(seconds):
    """Convert seconds to days, hours, and minutes."""
    days = seconds // (24 * 3600)
    seconds %= (24 * 3600)
    hours = seconds // 3600
    seconds %= 3600
    minutes = seconds // 60
    return days, hours, minutes

# --- MODIFIED FUNCTION ---
def load_all_sessions(filepath, timezone_str: str): # Added timezone_str parameter
    with open(filepath, 'r') as f:
        raw_data = json.load(f)

    session_data = json.loads(raw_data['properties']['sessionData'])
    sessions = []

    for session_id_str, metadata in session_data.items():
        session_key = f"session{session_id_str}"
        name = str(metadata.get('name', f'Session {session_id_str}'))
        scramble_event = metadata.get('opt', {}).get('scrType', '333')
        
        # Pass the timezone_str down to load_solves_for_session
        solves = load_solves_for_session(raw_data, session_key, timezone_str)
        
        session = Session(
            name=f"Session {name}",
            session_id=int(session_id_str),
            scramble_event=sc.get_scramble_name(scramble_event),
            solves=solves,
            multiple_events=False
        )
        sessions.append(session)

    return sessions

def load_all_cubing_periods(sessions):
    """Load all cubing periods from the provided sessions."""
    cubing_periods = []
    for session in sessions:
        cubing_periods.extend(get_cubing_periods(session))
    return cubing_periods

# The seconds_to_days_hours_minutes function is duplicated, keeping only one.
# def seconds_to_days_hours_minutes(seconds):
#     """Convert seconds to days, hours, and minutes."""
#     days = seconds // (24 * 3600)
#     seconds %= (24 * 3600)
#     hours = seconds // 3600
#     seconds %= 3600
#     minutes = seconds // 60
#     return days, hours, minutes

if __name__ == "__main__":
    # Example usage with a specific timezone
    # Make sure 'data/sample.txt' exists and contains valid cstimer data
    # Use your local timezone or a known one for testing
    user_timezone = "Asia/Kolkata" # Example: Bengaluru timezone

    sessions = load_all_sessions("data/sample.txt", user_timezone)
    
    if sessions:
        if get_cubing_periods(sessions[0]):
            first_period = get_cubing_periods(sessions[0])[0]
            print(first_period)
            print()
            # If there are more periods
            if len(get_cubing_periods(sessions[0])) > 2:
                third_period = get_cubing_periods(sessions[0])[2]
                print(third_period)
                print()
                print(f"Time spent in third period: {third_period.time_spent():.2f} minutes")
        else:
            print("No cubing periods found for the first session.")
    else:
        print("No sessions loaded from the file.")
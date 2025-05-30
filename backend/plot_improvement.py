import pb_checker
import utils.preprocess_solves as pf
from datetime import datetime
import matplotlib.pyplot as plt

def plot_improvement(avg_dict, title="Average Over Time", ylabel="Average Time (s)"):
    """Generic plot function for any average (aoX, singles, etc)."""
    avg_dict = avg_dict.copy()
    timestamps = sorted(avg_dict.keys())
    dates = [datetime.strptime(ts, "%Y-%m-%d %H:%M:%S") for ts in timestamps]
    values = [avg_dict[ts] for ts in timestamps]

    plt.figure(figsize=(12, 6))
    plt.plot(dates, values, linewidth=1.5)
    plt.title(title)
    plt.xlabel("Date")
    plt.ylabel(ylabel)
    plt.grid(True)
    plt.tight_layout()
    plt.gcf().autofmt_xdate()
    plt.show()

def compute_trimmed_average(times, n):
    """Trimmed average according to WCA rules."""
    trim_count = 1 if n in [5, 12] else 5 if n == 100 else int(n * 0.05)
    if 2 * trim_count >= len(times):
        raise ValueError("Too few solves to compute a trimmed average.")
    sorted_times = sorted(times)
    trimmed = sorted_times[trim_count:-trim_count]
    return sum(trimmed) / len(trimmed)

def create_avg_dict(session, n):
    """Create a dictionary of aoN averages with timestamps, using proper trimming."""
    averages = {}
    for i in range(len(session.solves) - n + 1):
        solves = session.solves[i:i + n]
        when = solves[-1].date
        times = [s.time for s in solves]
        try:
            avg = compute_trimmed_average(times, n)
            averages[when] = avg
        except ValueError:
            continue
    return averages

def create_single_dict(session):
    """Create a dictionary of single solve times with timestamps."""
    return {solve.date: solve.time for solve in session.solves}

def create_single_pb_dict(session):
    """Create a dictionary of single solve PBs with timestamps."""
    solves = session.solves
    best_time = float('inf')
    pb_dict = {}
    for s in solves:
        if s.time < best_time:
            best_time = s.time
            pb_dict[s.date] = s.time
    return pb_dict

def create_pb_dict(session, n):
    """Create a dictionary of personal best aoN averages with timestamps."""
    if n == 5:
        pbs = pb_checker.ao5PBs([session])
    elif n == 12:
        pbs = pb_checker.ao12PBs([session])
    elif n == 100:
        pbs = pb_checker.ao100PBs([session])
    else:
        raise ValueError("Unsupported average length for PBs.")

    return {pb[0][-1].date: pb[1] for pb in pbs}

def most_improved(sessions):
    improvement_dict = {}
    for session in sessions:
        if(len(session.solves) > 100):
            first100times = [i.time for i in session.solves[:100]]
            last100times = [i.time for i in session.solves[-100:]]
            improvement_dict[session.name] = {
                "firstao100": compute_trimmed_average(first100times, 100),
                "lastao100": compute_trimmed_average(last100times, 100),
                "improvement": (compute_trimmed_average(first100times, 100) - compute_trimmed_average(last100times, 100))/compute_trimmed_average(first100times, 100) * 100
            }

    return sorted(improvement_dict.items(), key=lambda x: x[1]["improvement"], reverse=True)

# --- MAIN --- #

if __name__ == "__main__":
    session = pf.load_all_sessions("data/suku.txt")[0]
    print(most_improved(pf.load_all_sessions("data/real.txt")))

    # Singles
    single_dict = create_single_dict(session)
    plot_improvement(single_dict, title="Single Solve Times", ylabel="Single Time (s)")

    # Single PBs
    single_pb_dict = create_single_pb_dict(session)
    plot_improvement(single_pb_dict, title="Single Solve PBs", ylabel="Single Time (s)")

    # ao5
    ao5_dict = create_avg_dict(session, 5)
    plot_improvement(ao5_dict, title="ao5 Over Time", ylabel="ao5 Time (s)")

    # ao5 PBs
    ao5_pb_dict = create_pb_dict(session, 5)
    plot_improvement(ao5_pb_dict, title="ao5 PBs Over Time", ylabel="ao5 Time (s)")

    # ao12
    ao12_dict = create_avg_dict(session, 12)
    plot_improvement(ao12_dict, title="ao12 Over Time", ylabel="ao12 Time (s)")

    # ao12 PBs
    ao12_pb_dict = create_pb_dict(session, 12)
    plot_improvement(ao12_pb_dict, title="ao12 PBs Over Time", ylabel="ao12 Time (s)")

    # ao100
    ao100_dict = create_avg_dict(session, 100)
    plot_improvement(ao100_dict, title="ao100 Over Time", ylabel="ao100 Time (s)")

    # ao100 PBs
    ao100_pb_dict = create_pb_dict(session, 100)
    plot_improvement(ao100_pb_dict, title="ao100 PBs Over Time", ylabel="ao100 Time (s)")

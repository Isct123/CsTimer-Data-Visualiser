import pb_checker
import utils.preprocess_solves as pf
from datetime import datetime
import matplotlib.pyplot as plt

def plot_improvement(dict):
    from datetime import datetime
    dict = dict.copy()  # Avoid modifying the original dictionary

    # Step 1: Sort and parse the dictionary
    timestamps = sorted(dict.keys())
    dates = [datetime.strptime(ts, "%Y-%m-%d %H:%M:%S") for ts in timestamps]
    ao5_values = [dict[ts] for ts in timestamps]

    # Step 2: Plot
    plt.figure(figsize=(12, 6))
    plt.plot(dates, ao5_values, linewidth=1.5)
    plt.title("ao5 Over Time (Improvement)")
    plt.xlabel("Date")
    plt.ylabel("ao5 Time (s)")
    plt.grid(True)
    plt.tight_layout()
    plt.gcf().autofmt_xdate()  # Auto-format x-axis for dates
    return plt.show()
    

def create_ao5_dict(session):
    """Create a dictionary of ao5 averages with timestamps."""
    averages = {}
    averages.clear()  # Clear previous data
    for i in range(len(session.solves)-4):
        solves = session.solves[i:i+5]
        when = solves[-1].date
        ao5 = [i.time for i in solves]
        ao5 = sorted(ao5)
        averages.update({when: sum(ao5[1:-1]) / 3})
    return averages 

def create_ao5_pb_dict(session):
    """Create a dictionary of pb ao5 averages with timestamps."""
    ao5_pbs = pb_checker.ao5PBs([session])
    ao5_pb_dict = {}
    for pb in ao5_pbs:
        date = pb[0][-1].date
        time = pb[1]
        print(time, date)
        ao5_pb_dict.update({date:time})
    return ao5_pb_dict

if __name__ == "__main__":
    session = pf.load_all_sessions("data/suku.txt")[0]  # Load the first session
    ao5_pbs = pb_checker.ao5PBs([session])
    ao5_pb_dict = create_ao5_pb_dict(session)
    print(ao5_pb_dict)
    plot_improvement(ao5_pb_dict)

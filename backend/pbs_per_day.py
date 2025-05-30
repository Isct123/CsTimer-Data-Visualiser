import utils.preprocess_solves as pf
import pb_checker
import plot_improvement as plot_imp
from datetime import datetime
import matplotlib.pyplot as plt

def plot_counts_over_time(data: dict):
    """
    Plots counts over time from a dictionary where:
    - keys are date strings in 'YYYY-MM-DD' format
    - values are integers (counts)

    Args:
        data (dict): Dictionary of date-count pairs
    """
    if not data:
        print("Empty data dictionary.")
        return

    # Convert and sort dates
    dates = sorted([datetime.strptime(date, "%Y-%m-%d") for date in data])
    values = [data[date.strftime("%Y-%m-%d")] for date in dates]

    # Plotting
    plt.figure(figsize=(12, 6))
    plt.plot(dates, values, marker='o', linestyle='-', color='blue')
    plt.title("Counts Over Time")
    plt.xlabel("Date")
    plt.ylabel("Count")
    plt.grid(True)
    plt.gcf().autofmt_xdate()
    plt.tight_layout()
    plt.show()

def most_pbs_in_a_day(sessions):
    """Find the day with the most personal bests (PBs) across all sessions."""
    pb_counts = {}
    
    for session in sessions:
        pbs = pb_checker.singlePBs([session])
        for solve, _ in pbs:
            date = solve.date.split(' ')[0]
            if date not in pb_counts:
                pb_counts[date] = 1
            pb_counts[date] += 1

        pbs = pb_checker.ao5PBs([session])

        for average, _ in pbs:
            solve = average[-1]
            # Assuming the last solve in the average is the one that counts for the date
            date = solve.date.split(' ')[0]  # Extract date part
            if date not in pb_counts:
                pb_counts[date] = 0
            pb_counts[date] += 1

        pbs = pb_checker.ao12PBs([session])

        for average, _ in pbs:
            solve = average[-1]
            # Assuming the last solve in the average is the one that counts for the date
            date = solve.date.split(' ')[0]  # Extract date part
            if date not in pb_counts:
                pb_counts[date] = 0
            pb_counts[date] += 1

        pbs = pb_checker.ao100PBs([session])

        for average, _ in pbs:
            solve = average[-1]
            # Assuming the last solve in the average is the one that counts for the date
            date = solve.date.split(' ')[0]  # Extract date part
            if date not in pb_counts:
                pb_counts[date] = 0
            pb_counts[date] += 1
    
    # Find the date with the maximum PB count
    max_date = max(pb_counts, key=pb_counts.get)
    return max_date, pb_counts 
# Example usage:
if __name__ == "__main__":
    sessions = pf.load_all_sessions("data/suku.txt")  # Load all sessions from the file
    date, counts = most_pbs_in_a_day(sessions)
    print(f"Date with most PBs: {date}, Counts: {counts[date]}")
    print("All counts:", counts)
    plot_counts_over_time(counts) # Plot the PB counts over time
# This code finds the date with the most personal bests (PBs) across all sessions and plots the counts over time.
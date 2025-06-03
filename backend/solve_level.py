import numpy as np

import utils.preprocess_solves as pf

def percentile(solve, cubing_period):
    """ Returns the percentile of the solve in the list of all solves. """
    solve_time = solve.time
    solve_list = []
    for i in cubing_period.solves:
        solve_list.append(i.time)

    solve_list.sort()
    if solve_time in solve_list:
        index = solve_list.index(solve_time)
        percentile = (index + 1) / len(solve_list) * 100
    else:
        # If the solve time is not in the list, we can assume it's better than the worst solve
        percentile = (len(solve_list) + 1) / len(solve_list) * 100

    return percentile

def solve_levels_from_period(cubing_period):
    """ Returns a list of solve levels for all solves in the cubing period. """
    levels = []
    for solve in cubing_period.solves:
        levels.append(percentile(solve, cubing_period))
    return levels

def plot_solve_levels_from_period(list):
    """ Plots the average solve level (percentile) for each 10% chunk of solves. """
    import matplotlib.pyplot as plt

    n = len(list)
    chunk_size = max(1, n // 10)
    avg_percentiles = []
    chunk_indices = []

    for i in range(0, n, chunk_size):
        chunk = list[i:i+chunk_size]
        avg = np.mean(chunk)
        avg_percentiles.append(avg)
        chunk_indices.append(i + chunk_size // 2)

    plt.plot(chunk_indices, avg_percentiles, marker='o')
    plt.xlabel('Solve Index (Chunk Center)')
    plt.ylabel('Average Solve Level (Percentile)')
    plt.title('Average Solve Levels (Percentile) per 10% of Solves')
    plt.grid(True)
    plt.show()

if __name__ == "__main__":
    # Example usage
    sessions = pf.load_all_sessions("data/suku.txt")
    period = pf.load_all_cubing_periods(sessions)

    plot_solve_levels_from_period(solve_levels_from_period(period[1]))
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

def solve_levels_from_period(cubing_periods):
    """Returns a 10-index list where each index is the average percentile of the corresponding 10% chunk across all cubing periods."""

    # Initialize a list of 10 lists to hold chunk percentiles
    chunk_percentiles = [[] for _ in range(10)]

    for cubing_period in cubing_periods:
        solves = cubing_period.solves
        n = len(solves)
        if n == 0:
            continue

        # Determine chunk sizes (10 chunks)
        for i in range(10):
            start = i * n // 10
            end = (i + 1) * n // 10 if i < 9 else n  # Ensure last chunk includes any remainder
            chunk = solves[start:end]

            if chunk:
                avg = sum(percentile(solve, cubing_period) for solve in chunk) / len(chunk)
                chunk_percentiles[i].append(avg)

    # Compute the final average percentile for each chunk across all periods
    result = [
        sum(chunk) / len(chunk) if chunk else 0  # Handle empty chunk cases
        for chunk in chunk_percentiles
    ]

    return result


import matplotlib.pyplot as plt

def plot_solve_levels(levels):
    """
    Plots the 10-index solve levels list.
    
    Args:
        levels (list of float): A list of 10 average percentile values.
    """
    if len(levels) != 10:
        raise ValueError("Input list must have exactly 10 elements.")

    deciles = [f"{i*10}-{(i+1)*10}%" for i in range(10)]

    plt.figure(figsize=(10, 5))
    plt.plot(deciles, levels, marker='o', linestyle='-', color='blue', linewidth=2)
    plt.title("Average Percentile by Solve Decile")
    plt.xlabel("Decile of Solve in Period")
    plt.ylabel("Average Percentile")
    plt.ylim(0, 100)  # assuming percentile range
    plt.grid(True, linestyle='--', alpha=0.5)
    plt.tight_layout()
    plt.show()


if __name__ == "__main__":
    # Example usage
    sessions = pf.load_all_sessions("data/real.txt")
    period = pf.load_all_cubing_periods(sessions)
    print(solve_levels_from_period(period))
    plot_solve_levels(solve_levels_from_period(period))
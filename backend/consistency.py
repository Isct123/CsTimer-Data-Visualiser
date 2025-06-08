import utils.preprocess_solves as pf
import statistics

def consistency(sessions):
    std_dict = {}
    for session in sessions:
        solve_times = []
        for solve in session.solves:
            if(solve.time == float('inf') or solve.time == 0):
                continue
            solve_times.append(solve.time)
            #print(solve_times)
        if len(solve_times) > 100:
            std_dict[session.name] = statistics.stdev(solve_times)
    std_dict = dict(sorted(std_dict.items(), key=lambda item: item[1], reverse=False))
    return std_dict

if __name__ == "__main__":
    # Example usage
    sessions = pf.load_all_sessions("data/suku.txt")
    std_devs = consistency(sessions)
    print(std_devs)
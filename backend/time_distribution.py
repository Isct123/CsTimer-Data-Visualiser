import utils.preprocess_solves as pf
import math

def time_distribution(session):
    time_dict = {}
    dnf_count = 0
    for solve in session.solves:
        
        if solve.time != float('inf'):
            time = math.floor(solve.time)
        else:
            dnf_count += 1
            continue
        if time not in time_dict:
            time_dict[time] = 1
        else:
            time_dict[time] += 1
    time_dict = dict(sorted(time_dict.items(), key=lambda item: item[0]))
    time_dict["DNF"] = dnf_count
    return time_dict 

if __name__ == "__main__":
    session = pf.load_all_sessions("data/suku.txt")[0]
    print(time_distribution(session))
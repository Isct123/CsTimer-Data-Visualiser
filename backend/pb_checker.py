import utils.preprocess_solves as pf

def ao5PBs(sessions):
    pb_list = []
    for s in sessions:
        current_pb = float('inf')
        for i in range(len(s.solves) - 4):  # need 5 solves
            ao5_solves = s.solves[i:i+5]
            times = [solve.time for solve in ao5_solves if solve.time > 0]
            if len(times) < 5:
                continue

            sorted_times = sorted(times)
            avg = sum(sorted_times[1:-1]) / 3  # remove best and worst

            if avg < current_pb:
                current_pb = avg
                pb_list.append((ao5_solves, avg))
    return pb_list

def ao12PBs(sessions):
    pb_list = []
    for s in sessions:
        current_pb = float('inf')
        for i in range(len(s.solves) - 11):  # need 5 solves
            ao12_solves = s.solves[i:i+12]
            times = [solve.time for solve in ao12_solves if solve.time > 0]
            if len(times) < 12:
                continue

            sorted_times = sorted(times)
            avg = sum(sorted_times[1:-1]) / 10  # remove best and worst

            if avg < current_pb:
                current_pb = avg
                pb_list.append((ao12_solves, avg))
    return pb_list

def ao100PBs(sessions):
    pb_list = []
    for s in sessions:
        current_pb = float('inf')
        for i in range(len(s.solves) - 99):  # need 100 solves
            ao100_solves = s.solves[i:i+100]
            times = [solve.time for solve in ao100_solves if solve.time > 0]
            if len(times) < 100:
                continue

            sorted_times = sorted(times)
            avg = sum(sorted_times[5:-5]) / 90  # remove top 5 and bottom 5

            if avg < current_pb:
                current_pb = avg
                pb_list.append((ao100_solves, avg))
    return pb_list

if __name__ == "__main__":
    sessions = [pf.load_all_sessions("data/suku.txt")[0]]
    pb_list = ao100PBs(sessions)

    for i, (ao100, avg) in enumerate(pb_list, 1):
        print(f"\nPB #{i} - Avg: {avg:.2f}s")
        for solve in ao100:
            print(f"  {solve}")

    print(f"\nTotal AO100 PBs found: {len(pb_list)}")

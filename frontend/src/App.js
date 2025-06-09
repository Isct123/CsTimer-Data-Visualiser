import React, { useState, useCallback } from "react";
import BarGraph from "./Components/BarGraph";
import SplitBarGraph from "./Components/SplitBarGraph";
import DotPlot from "./Components/DotPlot";
import ScatterPlot from "./Components/ScatterPlot";
import SolveLevelChart from "./Components/SolveLevelChart";
import SelectSession from "./Components/SelectSession";

export default function App() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  // Global stats state
  const [longestPeriod, setLongestPeriod] = useState(null);
  const [maxCubingTime, setMaxCubingTime] = useState(null);
  const [mostSolvesDay, setMostSolvesDay] = useState(null);
  const [mostPbsDay, setMostPbsDay] = useState(null);
  const [totalSolves, setTotalSolves] = useState(null);
  const [eventTimes, setEventTimes] = useState(null);
  const [averagePeriodDuration, setAveragePeriodDuration] = useState(null);
  const [daysDict, setDaysDict] = useState({});
  const [hoursDict, setHoursDict] = useState({});
  const [consistency, setConsistency] = useState(null);
  const [pbStats, setPbStats] = useState(null);
  const [sessionNames, setSessionNames] = useState([]);

  // Session-specific stats
  const [ao100Progression, setAo100Progression] = useState(null);
  const [ao100PbProgression, setAo100PbProgression] = useState(null);
  const [solveLevel, setSolveLevel] = useState(null);

  const handleFileChange = (e) => setFile(e.target.files[0]);

  const handleUpload = useCallback(async () => {
    if (!file) {
      alert("Please select a file first!");
      return;
    }
    setLoading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch(
        `${process.env.REACT_APP_API_URL}/upload-solves/`,
        {
          method: "POST",
          body: formData,
        }
      );
      if (!res.ok) throw new Error("Upload failed");
      const data = await res.json();

      setLongestPeriod(data.longest_cubing_period_stats);
      setMaxCubingTime(data.max_time_spent_cubing_in_a_day_stats);
      setMostSolvesDay(data.most_solves_in_a_day_stats);
      setMostPbsDay(data.most_pbs_in_a_day_stats);
      setTotalSolves(data.total_solves_stats);
      setEventTimes(data.event_times_stats);
      setAveragePeriodDuration(data.average_period_duration_stats);
      setDaysDict(data.days_dict_stats);
      setHoursDict(data.hours_dict_stats);
      setConsistency(data.consistency_stats);
      setPbStats(data.pb_stats);
      setSessionNames(data.session_names);

      alert("File uploaded successfully!");
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  }, [file]);

  // Handle when a session is selected (callback from SelectSession)
  const handleSessionSelect = (sessionData) => {
    setAo100Progression(sessionData.ao100_progression);
    setAo100PbProgression(sessionData.ao100_pb_progression);
    setSolveLevel(sessionData.solve_levels_stats);
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        width: "100vw",
        background: "linear-gradient(120deg, #f6d365 0%, #fda085 100%)",
        fontFamily: "'Segoe UI', 'Roboto', 'Arial', sans-serif",
        overflowX: "hidden",
        paddingBottom: 40,
      }}
    >
      {/* Header */}
      <header
        style={{
          background: "#fff",
          boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
          padding: "24px 0 16px",
          textAlign: "center",
          fontWeight: 700,
          fontSize: 32,
          letterSpacing: 1,
          color: "#333",
          marginBottom: 40,
        }}
      >
        Yearly Roundup: Upload Solve Stats
      </header>

      {/* File Upload Section */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <h2 style={{ fontWeight: 600, fontSize: 24, marginBottom: 24 }}>
          Upload Your Solve Stats File
        </h2>

        <div
          style={{
            display: "flex",
            gap: 16,
            marginBottom: 32,
            justifyContent: "center",
            flexWrap: "wrap",
          }}
        >
          <label
            htmlFor="file-upload"
            style={{
              background: "#f1f3f6",
              borderRadius: 8,
              padding: "10px 18px",
              border: "1px solid #e0e0e0",
              cursor: "pointer",
              fontWeight: 500,
              color: "#555",
              maxWidth: 350,
              textAlign: "center",
            }}
          >
            {file ? file.name : "Choose File"}
            <input
              id="file-upload"
              type="file"
              onChange={handleFileChange}
              style={{ display: "none" }}
            />
          </label>

          <button
            onClick={handleUpload}
            disabled={loading}
            style={{
              background: loading
                ? "#bdbdbd"
                : "linear-gradient(90deg, #43e97b 0%, #38f9d7 100%)",
              color: "#fff",
              border: "none",
              borderRadius: 8,
              padding: "10px 28px",
              fontWeight: 600,
              fontSize: 16,
              cursor: loading ? "not-allowed" : "pointer",
            }}
          >
            {loading ? "Uploading..." : "Upload"}
          </button>
        </div>

        {/* Display global stats only if data loaded */}
        {longestPeriod && (
          <div style={{ width: "95%", maxWidth: 1000 }}>
            <Section title="Interesting Stats">
              <h4>{longestPeriod}</h4>
              <h4>Longest time spent cubing in a day: {maxCubingTime}</h4>
              <h4>{mostSolvesDay}</h4>
              <h4>{mostPbsDay}</h4>
              <h4>Total solves: {totalSolves}</h4>
              <h4>Time spent solving: {eventTimes}</h4>
              <h4>{averagePeriodDuration}</h4>
              <h4>
                Total time cubing:{" "}
                {Object.values(hoursDict)
                  .reduce((acc, val) => acc + val, 0)
                  .toFixed(2)}{" "}
                hours
              </h4>
            </Section>

            <Section title="PB Distribution by Date">
              <ScatterPlot dataDict={pbStats} />
            </Section>

            <Section title="Activity by Day">
              <BarGraph stats={daysDict} />
            </Section>
            <Section title="Activity by Hour">
              <BarGraph stats={hoursDict} />
            </Section>

            <Section title="Consistency Stats">
              <BarGraph stats={consistency} />
            </Section>

            <Section title="Session/Event Specific Stats:">
              <SelectSession
                session_names={sessionNames}
                onSessionSelect={handleSessionSelect}
              />
            </Section>

            {ao100Progression && (
              <>
                <Section title="Ao100 Progression">
                  <ScatterPlot dataDict={ao100Progression} />
                </Section>

                <Section title="Ao100 PB Progression">
                  <DotPlot
                    data={ao100PbProgression}
                    title="Ao100 PB Progression"
                    ylabel="Ao100 Time (s)"
                    xlabel="Date"
                  />
                </Section>

                <Section title="Solve Level Percentile by Decile">
                  <SolveLevelChart levels={solveLevel} />
                </Section>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

const Section = ({ title, children }) => (
  <section style={{ marginTop: 60 }}>
    {title && (
      <h3
        style={{
          marginBottom: 24,
          fontWeight: 600,
          fontSize: 20,
          textAlign: "center",
        }}
      >
        {title}
      </h3>
    )}
    <div>{children}</div>
  </section>
);

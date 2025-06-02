import React, { useState, useMemo, useCallback } from "react";
import BarGraph from "./Components/BarGraph";
import SplitBarGraph from "./Components/SplitBarGraph";
import DotPlot from "./Components/DotPlot";
import ScatterPlot from "./Components/ScatterPlot";

export default function App() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  // Splitting stats into separate states
  const [monthlyStats, setMonthlyStats] = useState(null);
  const [timeSpentStats, setTimeSpentStats] = useState(null);
  const [pbStats, setPbStats] = useState(null);
  const [ao100Progression, setAo100Progression] = useState(null);
  const [ao100PbProgression, setAo100PbProgression] = useState(null);
  const [longestPeriod, setLongestPeriod] = useState(null);
  const [maxCubingTime, setMaxCubingTime] = useState(null);
  const [mostSolvesDay, setMostSolvesDay] = useState(null);
  const [mostPbsDay, setMostPbsDay] = useState(null);
  const [totalSolves, setTotalSolves] = useState(null);
  const [eventTimes, setEventTimes] = useState(null);

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
      const res = await fetch("http://localhost:8000/upload-solves/", {
        method: "POST",
        body: formData,
      });
      if (!res.ok) throw new Error("Upload failed");
      const data = await res.json();

      // Store individual slices of data
      setMonthlyStats(data.monthly_stats);
      setTimeSpentStats(data.time_spent_stats);
      setPbStats(data.pb_stats);
      setAo100Progression(data.ao100_progression);
      setAo100PbProgression(data.ao100_pb_progression);
      setLongestPeriod(data.longest_cubing_period_stats);
      setMaxCubingTime(data.max_time_spent_cubing_in_a_day_stats);
      setMostSolvesDay(data.most_solves_in_a_day_stats);
      setMostPbsDay(data.most_pbs_in_a_day_stats);
      setTotalSolves(data.total_solves_stats);
      setEventTimes(data.event_times_stats);
      alert("File uploaded successfully!");
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  }, [file]);

  return (
    <div
      style={{
        minHeight: "100vh",
        width: "100vw",
        background: "linear-gradient(120deg, #f6d365 0%, #fda085 100%)",
        fontFamily: "'Segoe UI', 'Roboto', 'Arial', sans-serif",
        margin: 0,
        padding: 0,
        boxSizing: "border-box",
        overflowX: "hidden",
      }}
    >
      <header
        style={{
          background: "#fff",
          boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
          padding: "24px 0 16px 0",
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

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          width: "100%",
        }}
      >
        <h2 style={{ fontWeight: 600, fontSize: 24, marginBottom: 24 }}>
          Upload Your Solve Stats File
        </h2>

        <div
          style={{
            display: "flex",
            gap: 16,
            marginBottom: 24,
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

        {monthlyStats && (
          <>
            <h3
              style={{
                marginTop: 40,
                marginBottom: 20,
                fontWeight: 600,
                fontSize: 20,
              }}
            >
              Monthly Time Breakdown Chart
            </h3>
            <SplitBarGraph stats={monthlyStats} />

            <h3
              style={{
                marginTop: 40,
                marginBottom: 20,
                fontWeight: 600,
                fontSize: 20,
              }}
            >
              Time spent on each event
            </h3>
            <BarGraph stats={timeSpentStats} />

            <h3>{longestPeriod}</h3>
            <h3>Longest time spent cubing in a day: {maxCubingTime}</h3>
            <h3>{mostSolvesDay}</h3>
            <h3>{mostPbsDay}</h3>
            <h3>Total solves: {totalSolves}</h3>
            <h3>Time spent solving: {eventTimes}</h3>
            <h3>
              Time spent cubing:{" "}
              {timeSpentStats &&
                Object.values(timeSpentStats)
                  .reduce((acc, val) => acc + val, 0)
                  .toFixed(2)}{" "}
              hours
            </h3>

            <h2>PB Distribution by date</h2>
            <ScatterPlot dataDict={pbStats} />

            <ScatterPlot dataDict={ao100Progression} />
            <DotPlot
              data={ao100PbProgression}
              title="Ao100 PB Progression"
              ylabel="Ao100 Time (s)"
              xlabel="Date"
            />
          </>
        )}

        <div style={{ height: 60 }} />
      </div>
    </div>
  );
}

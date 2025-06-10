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

  // Global stats
  const [stats, setStats] = useState({
    longestPeriod: null,
    maxCubingTime: null,
    mostSolvesDay: null,
    mostPbsDay: null,
    totalSolves: null,
    eventTimes: null,
    averagePeriodDuration: null,
    daysDict: {},
    hoursDict: {},
    consistency: null,
    pbStats: null,
    sessionNames: [],
    monthlyBreakdown: {},
  });

  // Session-specific stats
  const [sessionStats, setSessionStats] = useState({
    ao100Progression: null,
    ao100PbProgression: null,
    solveLevel: null,
  });

  const handleFileChange = (e) => setFile(e.target.files[0]);

  const handleUpload = useCallback(async () => {
    if (!file) {
      alert("Please select a file first!");
      return;
    }

    setLoading(true);

    const formData = new FormData();
    formData.append("file", file);

    // Detect user's timezone
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    formData.append("timezone", timezone);

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

      // Set global stats
      setStats({
        longestPeriod: data.longest_cubing_period_stats,
        maxCubingTime: data.max_time_spent_cubing_in_a_day_stats,
        mostSolvesDay: data.most_solves_in_a_day_stats,
        mostPbsDay: data.most_pbs_in_a_day_stats,
        totalSolves: data.total_solves_stats,
        eventTimes: data.event_times_stats,
        averagePeriodDuration: data.average_period_duration_stats,
        daysDict: data.days_dict_stats,
        hoursDict: data.hours_dict_stats,
        consistency: data.consistency_stats,
        pbStats: data.pb_stats,
        sessionNames: data.session_names,
        monthlyBreakdown: data.monthly_breakdown_stats,
      });

      alert("File uploaded successfully!");
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  }, [file]);

  const handleSessionSelect = (sessionData) => {
    setSessionStats({
      ao100Progression: sessionData.ao100_progression,
      ao100PbProgression: sessionData.ao100_pb_progression,
      solveLevel: sessionData.solve_levels_stats,
    });
  };

  const {
    longestPeriod,
    maxCubingTime,
    mostSolvesDay,
    mostPbsDay,
    totalSolves,
    eventTimes,
    averagePeriodDuration,
    daysDict,
    hoursDict,
    consistency,
    pbStats,
    sessionNames,
    monthlyBreakdown,
  } = stats;

  const { ao100Progression, ao100PbProgression, solveLevel } = sessionStats;

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
      <Header />

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <UploadSection
          file={file}
          loading={loading}
          onFileChange={handleFileChange}
          onUpload={handleUpload}
        />

        {longestPeriod && (
          <div style={{ width: "95%", maxWidth: 1000 }}>
            <Section title="Monthly Cubing Breakdown">
              <SplitBarGraph stats={monthlyBreakdown} />
            </Section>

            <Section title="Interesting Stats">
              <StatBlock
                label="Longest Period"
                value={longestPeriod}
              />
              <StatBlock
                label="Longest time spent cubing in a day"
                value={maxCubingTime}
              />
              <StatBlock
                label="Most solves in a day"
                value={mostSolvesDay}
              />
              <StatBlock
                label="Most PBs in a day"
                value={mostPbsDay}
              />
              <StatBlock
                label="Total solves"
                value={totalSolves}
              />
              <StatBlock
                label="Time spent solving"
                value={eventTimes}
              />
              <StatBlock
                label="Avg cubing period duration"
                value={averagePeriodDuration}
              />
              <StatBlock
                label="Total time cubing"
                value={`${Object.values(hoursDict)
                  .reduce((acc, val) => acc + val, 0)
                  .toFixed(2)} hours`}
              />
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

            <Section title="Session/Event Specific Stats">
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

const Header = () => (
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
);

const UploadSection = ({ file, loading, onFileChange, onUpload }) => (
  <>
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
          onChange={onFileChange}
          style={{ display: "none" }}
        />
      </label>

      <button
        onClick={onUpload}
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
  </>
);

const Section = ({ title, children }) => (
  <section style={{ marginTop: 60 }}>
    {title && (
      <h2
        style={{
          fontSize: 22,
          fontWeight: 600,
          marginBottom: 20,
          borderBottom: "2px solid #ddd",
          paddingBottom: 8,
          color: "#333",
        }}
      >
        {title}
      </h2>
    )}
    <div>{children}</div>
  </section>
);

const StatBlock = ({ label, value }) => (
  <div
    style={{
      backgroundColor: "#ffffffcc",
      border: "1px solid #e0e0e0",
      borderRadius: 12,
      padding: "16px 20px",
      margin: "10px 0",
      fontSize: 16,
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
    }}
  >
    <span style={{ fontWeight: 500, color: "#333" }}>{label}</span>
    <span style={{ fontWeight: 600, color: "#111" }}>
      {typeof value === "object" ? JSON.stringify(value) : value}
    </span>
  </div>
);

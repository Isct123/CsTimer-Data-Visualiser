import React, { useState, useCallback } from "react";
import BarGraph from "./Components/BarGraph";
import SplitBarGraph from "./Components/SplitBarGraph";
import DotPlot from "./Components/DotPlot";
import ScatterPlot from "./Components/ScatterPlot";
import SolveLevelChart from "./Components/SolveLevelChart";
import SelectSession from "./Components/SelectSession";
import { FaGithub } from "react-icons/fa";

export default function App() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [globalStats, setGlobalStats] = useState({});
  const [sessionStats, setSessionStats] = useState({});

  const handleFileChange = (e) => setFile(e.target.files[0]);

  const handleUpload = useCallback(async () => {
    if (!file) {
      alert("Please select a file first!");
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append(
      "timezone",
      Intl.DateTimeFormat().resolvedOptions().timeZone
    );

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

      setGlobalStats(data);
      alert("File uploaded successfully!");
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  }, [file]);

  const handleSessionSelect = (sessionData) => setSessionStats(sessionData);

  const globalFeatureMap = {
    monthly_breakdown_stats: {
      title: "Monthly Cubing Breakdown",
      Component: SplitBarGraph,
      propKey: "stats",
    },
    most_solves_in_a_day_stats: { label: "Most solves in a day" },
    most_pbs_in_a_day_stats: { label: "Most PBs in a day" },
    longest_cubing_period_stats: { label: "Longest Period" },
    max_time_spent_cubing_in_a_day_stats: {
      label: "Longest time spent cubing in a day",
    },
    total_solves_stats: { label: "Total solves" },
    event_times_stats: { label: "Time spent solving" },
    average_period_duration_stats: { label: "Avg cubing period duration" },
    pb_stats: {
      title: "PB Distribution by Date",
      Component: ScatterPlot,
      propKey: "dataDict",
    },
    days_dict_stats: {
      title: "Activity by Day",
      Component: BarGraph,
      propKey: "stats",
    },
    hours_dict_stats: {
      title: "Activity by Hour",
      Component: BarGraph,
      propKey: "stats",
    },
    consistency_stats: {
      title: "Consistency Stats",
      Component: BarGraph,
      propKey: "stats",
    },
  };

  const sessionFeatureMap = {
    ao100_progression: {
      title: "Ao100 Progression",
      Component: ScatterPlot,
      propKey: "dataDict",
    },
    ao100_pb_progression: {
      title: "Ao100 PB Progression",
      Component: DotPlot,
      props: (data) => ({
        data,
        title: "Ao100 PB Progression",
        ylabel: "Ao100 Time (s)",
        xlabel: "Date",
      }),
    },
    solve_levels_stats: {
      title: "Solve Level Percentile by Decile",
      Component: SolveLevelChart,
      propKey: "levels",
    },
    time_distribution_dict: {
      title: "Times Distribution",
      Component: BarGraph,
      propKey: "stats",
    },
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

        {globalStats && globalStats.session_names && (
          <div style={{ width: "95%", maxWidth: 1000 }}>
            {Object.entries(globalFeatureMap).map(([key, config]) => {
              const value = globalStats[key];
              if (!value) return null;
              if (config.Component) {
                const props = config.props
                  ? config.props(value)
                  : { [config.propKey || "data"]: value };
                return (
                  <Section
                    key={key}
                    title={config.title}
                  >
                    <config.Component {...props} />
                  </Section>
                );
              } else if (config.label) {
                return (
                  <StatBlock
                    key={key}
                    label={config.label}
                    value={value}
                  />
                );
              }
              return null;
            })}

            <Section title="Session/Event Specific Stats">
              <SelectSession
                session_names={globalStats.session_names}
                onSessionSelect={handleSessionSelect}
              />
            </Section>

            {Object.entries(sessionStats).map(([key, value]) => {
              const config = sessionFeatureMap[key];
              if (!config || !value) return null;
              const props = config.props
                ? config.props(value)
                : { [config.propKey || "data"]: value };
              return (
                <Section
                  key={key}
                  title={config.title}
                >
                  <config.Component {...props} />
                </Section>
              );
            })}
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
      position: "relative",
    }}
  >
    Yearly Roundup: Upload Solve Stats
    <a
      href="https://github.com/Isct123/CsTimer-Data-Visualiser"
      target="_blank"
      rel="noopener noreferrer"
      style={{
        position: "absolute",
        top: 24,
        right: 24,
        color: "#000",
        textDecoration: "none",
        fontSize: 28,
      }}
      title="View on GitHub"
    >
      <FaGithub />
    </a>
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

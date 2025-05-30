import React, { useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

// Brighter, modern color palette
const COLORS = [
  "#FF6B6B",
  "#FFD93D",
  "#6BCB77",
  "#4D96FF",
  "#FF6F91",
  "#6A4C93",
  "#43E6FC",
  "#FFB26B",
  "#A3FFD6",
  "#FF61A6",
];

function transformData(monthlyStats) {
  const eventsSet = new Set();
  Object.values(monthlyStats).forEach((eventData) => {
    Object.keys(eventData).forEach((event) => eventsSet.add(event));
  });
  const allEvents = Array.from(eventsSet);
  const data = Object.entries(monthlyStats).map(([month, eventData]) => {
    const entry = { month };
    allEvents.forEach((event) => {
      entry[event] = eventData[event] || 0;
    });
    return entry;
  });
  return { data, allEvents };
}

export default function UploadSolves() {
  const [file, setFile] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e) => setFile(e.target.files[0]);

  const handleUpload = async () => {
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
      setStats(data);
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const chartData = stats
    ? transformData(stats.monthly_stats)
    : { data: [], allEvents: [] };

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
      }}
    >
      {/* Header Bar */}
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

      {/* Main Content Full Width */}
      <div
        style={{
          width: "100%",
          maxWidth: "100vw",
          margin: 0,
          background: "transparent",
          borderRadius: 0,
          boxShadow: "none",
          padding: "0 0 0 0",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <h2
          style={{
            fontWeight: 600,
            fontSize: 24,
            marginBottom: 24,
            color: "#222",
            letterSpacing: 0.5,
          }}
        >
          Upload Your Solve Stats File
        </h2>
        <div
          style={{
            width: "100%",
            maxWidth: 600,
            display: "flex",
            gap: 16,
            marginBottom: 24,
            justifyContent: "center",
          }}
        >
          <label
            htmlFor="file-upload"
            style={{
              flex: 1,
              background: "#f1f3f6",
              borderRadius: 8,
              padding: "10px 18px",
              border: "1px solid #e0e0e0",
              cursor: "pointer",
              fontWeight: 500,
              color: "#555",
              transition: "background 0.2s",
              textAlign: "center",
              maxWidth: 350,
            }}
            onMouseOver={(e) => (e.currentTarget.style.background = "#e9ecef")}
            onMouseOut={(e) => (e.currentTarget.style.background = "#f1f3f6")}
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
              boxShadow: "0 2px 8px rgba(67,233,123,0.08)",
              transition: "background 0.2s, box-shadow 0.2s",
            }}
          >
            {loading ? "Uploading..." : "Upload"}
          </button>
        </div>

        <h3
          style={{
            marginTop: 40,
            marginBottom: 20,
            fontWeight: 600,
            fontSize: 20,
            color: "#333",
          }}
        >
          Monthly Time Breakdown Chart
        </h3>
        <div
          style={{
            width: "100%",
            maxWidth: 1200,
            minHeight: 420,
            background: "#f8fafc",
            borderRadius: 12,
            boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
            padding: 16,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 40,
          }}
        >
          {chartData.data.length > 0 ? (
            <ResponsiveContainer
              width="100%"
              height={380}
            >
              <BarChart
                data={chartData.data}
                margin={{ top: 20, right: 30, left: 20, bottom: 80 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="month"
                  angle={-45}
                  textAnchor="end"
                  interval={0}
                  height={60}
                  style={{ fontWeight: 500, fontSize: 14 }}
                />
                <YAxis
                  label={{
                    value: "Hours",
                    angle: -90,
                    position: "insideLeft",
                    style: { fontWeight: 600 },
                  }}
                  style={{ fontWeight: 500, fontSize: 14 }}
                />
                <Tooltip
                  contentStyle={{
                    background: "#fff",
                    borderRadius: 8,
                    border: "1px solid #eee",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                    fontWeight: 500,
                  }}
                />
                <Legend
                  verticalAlign="top"
                  height={36}
                  wrapperStyle={{ fontWeight: 500, fontSize: 14 }}
                />
                {chartData.allEvents.map((event, idx) => (
                  <Bar
                    key={event}
                    dataKey={event}
                    stackId="a"
                    fill={COLORS[idx % COLORS.length]}
                    radius={[4, 4, 0, 0]}
                  />
                ))}
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p
              style={{
                color: "#888",
                fontWeight: 500,
                fontSize: 16,
                margin: 0,
              }}
            >
              No chart data available.
            </p>
          )}
        </div>
      </div>
      {/* Add some bottom spacing */}
      <div style={{ height: 60 }} />
    </div>
  );
}

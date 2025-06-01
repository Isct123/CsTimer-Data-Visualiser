import React, { useState } from "react";
import BarGraph from "./Components/BarGraph";
import SplitBarGraph from "./Components/SplitBarGraph";

export default function App() {
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
        <SplitBarGraph stats={stats?.monthly_stats} />
        <h3
          style={{
            marginTop: 40,
            marginBottom: 20,
            fontWeight: 600,
            fontSize: 20,
            color: "#333",
          }}
        >
          Time spent on each event
        </h3>
        <BarGraph stats={stats?.time_spent_stats} />
        <h3>{stats?.longest_cubing_period_stats}</h3>
        <h3>{stats?.max_time_spent_cubing_in_a_day_stats}</h3>
        <h3>{stats?.most_solves_in_a_day_stats}</h3>
      </div>

      <div style={{ height: 60 }} />
    </div>
  );
}

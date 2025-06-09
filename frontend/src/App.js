import React, { useState, useCallback } from "react";
import BarGraph from "./Components/BarGraph";
import SplitBarGraph from "./Components/SplitBarGraph";
import DotPlot from "./Components/DotPlot";
import ScatterPlot from "./Components/ScatterPlot";
import SolveLevelChart from "./Components/SolveLevelChart";
import SelectSession from "./Components/SelectSession";
import GitHubIconLink from "./Components/GithubIconLink";
import TimeOfTheDayGraph from "./Components/TimeOfTheDayGraph";
import { DateTime } from "luxon";

export default function App() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const [monthlyBreakdown, setMonthlyBreakdown] = useState(null);
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

  const [ao100Progression, setAo100Progression] = useState(null);
  const [ao100PbProgression, setAo100PbProgression] = useState(null);
  const [solveLevel, setSolveLevel] = useState(null);

  const convertToLocal = (isoString) => {
    return DateTime.fromISO(isoString, { zone: "America/Los_Angeles" }) // Oregon timezone
      .setZone(DateTime.local().zoneName) // convert to user's local timezone
      .toISO();
  };

  const recursivelyConvertTimestamps = (data) => {
    if (Array.isArray(data)) {
      return data.map(recursivelyConvertTimestamps);
    } else if (data !== null && typeof data === "object") {
      const newObj = {};
      for (const [key, value] of Object.entries(data)) {
        if (
          typeof value === "string" &&
          /\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(value)
        ) {
          newObj[key] = convertToLocal(value);
        } else {
          newObj[key] = recursivelyConvertTimestamps(value);
        }
      }
      return newObj;
    } else {
      return data;
    }
  };

  const handleFileChange = (e) => setFile(e.target.files[0]);

  const handleUpload = useCallback(async () => {
    if (!file) return alert("Please select a file first!");
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

      const rawData = await res.json();
      const data = recursivelyConvertTimestamps(rawData);

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
      setMonthlyBreakdown(data.monthly_breakdown_stats);
      alert("File uploaded successfully!");
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  }, [file]);

  const handleSessionSelect = (sessionData) => {
    const session = recursivelyConvertTimestamps(sessionData);
    setAo100Progression(session.ao100_progression);
    setAo100PbProgression(session.ao100_pb_progression);
    setSolveLevel(session.solve_levels_stats);
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #fceabb 0%, #f8b500 100%)",
        fontFamily: "'Segoe UI', sans-serif",
        overflowX: "hidden",
        paddingBottom: 50,
        position: "relative",
      }}
    >
      <div style={{ position: "absolute", top: 20, right: 20 }}>
        <GitHubIconLink />
      </div>
      <header
        style={{
          background: "#fff",
          boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
          padding: "32px 0 24px",
          textAlign: "center",
          fontSize: 36,
          fontWeight: 700,
          color: "#222",
          marginBottom: 50,
        }}
      >
        Yearly Cubing Roundup
      </header>
      <section
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <h2 style={{ fontSize: 26, marginBottom: 24 }}>
          Upload Your Solve Stats
        </h2>
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 16,
            justifyContent: "center",
            marginBottom: 40,
          }}
        >
          <label
            htmlFor="file-upload"
            style={{
              background: "#fff",
              border: "1px solid #ccc",
              borderRadius: 8,
              padding: "12px 20px",
              cursor: "pointer",
              fontWeight: 500,
              minWidth: 200,
              textAlign: "center",
              transition: "all 0.3s",
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
                ? "#ccc"
                : "linear-gradient(90deg, #00c9ff 0%, #92fe9d 100%)",
              color: "#fff",
              border: "none",
              borderRadius: 8,
              padding: "12px 28px",
              fontSize: 16,
              fontWeight: 600,
              cursor: loading ? "not-allowed" : "pointer",
              transition: "background 0.3s",
            }}
          >
            {loading ? "Uploading..." : "Upload"}
          </button>
        </div>
        {longestPeriod && (
          <div style={{ width: "95%", maxWidth: 1100 }}>
            <Section title="Cubing monthly breakups">
              <Stat>
                <SplitBarGraph stats={monthlyBreakdown} />
              </Stat>
            </Section>
            <Section title="Interesting Stats">
              <Stat>{longestPeriod}</Stat>
              <Stat>Longest time spent cubing in a day: {maxCubingTime}</Stat>
              <Stat>{mostSolvesDay}</Stat>
              <Stat>{mostPbsDay}</Stat>
              <Stat>Total solves: {totalSolves}</Stat>
              <Stat>Time spent solving: {eventTimes}</Stat>
              <Stat>{averagePeriodDuration}</Stat>
              <Stat>
                Total time cubing:{" "}
                {Object.values(hoursDict)
                  .reduce((acc, val) => acc + val, 0)
                  .toFixed(2)}{" "}
                hours
              </Stat>
            </Section>
            <Section title="PB Distribution by Date">
              <ScatterPlot dataDict={pbStats} />
            </Section>
            <Section title="Activity by Day">
              <BarGraph stats={daysDict} />
            </Section>
            <Section title="Activity by Hour (Sorry I'm still working on this because timezones really mess this feature up)">
              <TimeOfTheDayGraph stats={hoursDict} />
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
                <Section title="Solve Level Percentile by part of the session- A session is any time spent cubing continuously. Decile- First 10% of solves, etc. (It assumes that two solves 20 minutes apart are part of different sesssions)">
                  <SolveLevelChart levels={solveLevel} />
                </Section>
              </>
            )}
          </div>
        )}
      </section>
    </div>
  );
}

const Section = ({ title, children }) => (
  <section style={{ marginTop: 60 }}>
    {title && (
      <h3
        style={{
          marginBottom: 24,
          fontSize: 22,
          fontWeight: 600,
          textAlign: "center",
          color: "#222",
        }}
      >
        {title}
      </h3>
    )}
    <div>{children}</div>
  </section>
);

const Stat = ({ children }) => (
  <p
    style={{
      fontSize: 16,
      fontWeight: 500,
      color: "#333",
      marginBottom: 10,
      lineHeight: 1.4,
    }}
  >
    {children}
  </p>
);

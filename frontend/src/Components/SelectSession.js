import React, { useState } from "react";

function SelectSession({ session_names, onSessionSelect }) {
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    const form = event.target;
    const selectedSessionName = form.session.value;

    // Find the index of the selected session
    const selectedIndex = session_names.indexOf(selectedSessionName);
    if (selectedIndex === -1) {
      console.error("Selected session not found in session_names");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("http://localhost:8000/session-stats/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ session_index: selectedIndex }),
      });

      if (!response.ok) {
        throw new Error(`Server error: ${response.statusText}`);
      }

      const data = await response.json();
      // Pass data back to parent
      onSessionSelect(data);
    } catch (error) {
      console.error("Error fetching session stats:", error);
      alert("Failed to fetch session stats");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ padding: "16px" }}>
      <form onSubmit={handleSubmit}>
        <label
          htmlFor="session"
          style={{ display: "block", marginBottom: "8px" }}
        >
          Choose a session:
        </label>
        <select
          id="session"
          name="session"
          style={{
            width: "100%",
            padding: "8px",
            marginBottom: "12px",
            border: "1px solid #ccc",
            borderRadius: "4px",
          }}
        >
          {session_names.map((name, index) => (
            <option
              key={index}
              value={name}
            >
              {name}
            </option>
          ))}
        </select>
        <button
          type="submit"
          disabled={loading}
          style={{
            padding: "8px 16px",
            backgroundColor: loading ? "#bdbdbd" : "#007bff",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: loading ? "not-allowed" : "pointer",
          }}
        >
          {loading ? "Loading..." : "Submit"}
        </button>
      </form>
    </div>
  );
}

export default SelectSession;

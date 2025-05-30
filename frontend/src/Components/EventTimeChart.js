// EventTimeChart.js
import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

function transformTimeSpentData(timeSpentStats) {
  return Object.entries(timeSpentStats).map(([event, monthlyData]) => ({
    event,
    ...monthlyData,
  }));
}

export default function EventTimeChart({ stats }) {
  if (!stats || !stats.time_spent_stats) return null;

  const data = transformTimeSpentData(stats.time_spent_stats);

  return (
    <div
      style={{
        width: "100%",
        maxWidth: 1200,
        minHeight: 420,
        background: "#f0f4f8",
        borderRadius: 12,
        boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
        padding: 16,
        marginBottom: 40,
      }}
    >
      <h3
        style={{
          textAlign: "center",
          fontWeight: 600,
          fontSize: 20,
          color: "#333",
          marginBottom: 20,
        }}
      >
        Total Time Spent Per Event
      </h3>
      <ResponsiveContainer
        width="100%"
        height={360}
      >
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="event"
            style={{ fontWeight: 500, fontSize: 14 }}
            interval={0}
          />
          <YAxis
            label={{
              value: "Total Hours",
              angle: -90,
              position: "insideLeft",
              style: { fontWeight: 600 },
            }}
            style={{ fontWeight: 500, fontSize: 14 }}
          />
          <Tooltip />
          <Bar
            dataKey="total_time"
            fill="#8884d8"
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

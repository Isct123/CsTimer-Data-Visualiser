import React from "react";
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

// Color palette
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

export default function BarGraph({ stats }) {
  if (!stats) {
    return (
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
    );
  }

  const { data, allEvents } = transformData(stats);

  return (
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
      <ResponsiveContainer
        width="100%"
        height={380}
      >
        <BarChart
          data={data}
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
          {allEvents.map((event, idx) => (
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
    </div>
  );
}

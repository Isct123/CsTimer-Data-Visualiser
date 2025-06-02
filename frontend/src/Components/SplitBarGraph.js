"use client";

import React, { useMemo } from "react";
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

const COLORS = [
  "#8884d8",
  "#82ca9d",
  "#ffc658",
  "#ff7f50",
  "#a4de6c",
  "#d0ed57",
  "#8dd1e1",
  "#ffbb28",
  "#ff8042",
  "#00C49F",
];

// Transform data function (non-hook, synchronous)
function transformData(stats) {
  if (!stats) return { data: [], allEvents: [] };

  const allEventsSet = new Set();
  const data = Object.entries(stats).map(([month, events]) => {
    const dataEntry = { month };
    for (const [event, value] of Object.entries(events)) {
      dataEntry[event] = value;
      allEventsSet.add(event);
    }
    return dataEntry;
  });

  return { data, allEvents: Array.from(allEventsSet) };
}

export default function SplitBarGraph({ stats }) {
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
          barCategoryGap="20%"
          barGap={4}
          maxBarSize={60}
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

import React, { useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

// Memoized data transformation function
export function useBarGraphData(stats) {
  return useMemo(() => {
    if (!stats) return [];
    return Object.entries(stats).map(([month, value]) => ({
      name: month,
      value,
    }));
  }, [stats]);
}

export default function BarGraph({ stats }) {
  const data = useBarGraphData(stats);

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
            dataKey="name"
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
            formatter={(value) => `${value} hours`}
            contentStyle={{
              background: "#fff",
              borderRadius: 8,
              border: "1px solid #eee",
              boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
              fontWeight: 500,
            }}
          />
          <Bar
            dataKey="value"
            fill="#4D96FF"
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

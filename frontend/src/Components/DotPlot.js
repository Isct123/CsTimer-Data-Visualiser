import React from "react";
import {
  ResponsiveContainer,
  ScatterChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Scatter,
} from "recharts";

// Convert string timestamp to Date object
const parseDate = (dateStr) => new Date(dateStr);

const DotPlot = ({ data, title = "", ylabel = "", xlabel = "Date" }) => {
  if (!data || typeof data !== "object") return null;

  const plotData = Object.entries(data).map(([timestamp, value]) => ({
    date: parseDate(timestamp).getTime(),
    value: parseFloat(value),
  }));

  return (
    <div style={{ width: "100%", height: "450px", padding: "1rem 0" }}>
      <h2 style={{ textAlign: "center", marginBottom: "1rem" }}>{title}</h2>
      <ResponsiveContainer
        width="100%"
        height="100%"
      >
        <ScatterChart margin={{ top: 20, right: 30, bottom: 20, left: 20 }}>
          <CartesianGrid />
          <XAxis
            dataKey="date"
            name={xlabel}
            type="number"
            scale="time"
            domain={["auto", "auto"]}
            tickFormatter={(date) => new Date(date).toLocaleDateString()}
          />
          <YAxis
            dataKey="value"
            name={ylabel}
            unit="s"
            allowDecimals={true}
          />
          <Tooltip
            formatter={(value) => [`${value.toFixed(2)}s`, ylabel]}
            labelFormatter={(label) => new Date(label).toLocaleString()}
          />
          <Scatter
            name={ylabel}
            data={plotData}
            fill="#8884d8"
            line
            shape="circle"
          />
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  );
};

export default DotPlot;

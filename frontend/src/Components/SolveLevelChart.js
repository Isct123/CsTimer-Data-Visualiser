import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

const SolveLevelChart = ({ levels }) => {
  if (!levels || levels.length !== 10) {
    return <p>Error: Expected levels to be an array of 10 numbers.</p>;
  }

  // Format data for the chart
  const data = levels.map((value, index) => ({
    decile: `${index * 10}-${(index + 1) * 10}%`,
    percentile: value,
  }));

  return (
    <ResponsiveContainer
      width="100%"
      height={300}
    >
      <LineChart
        data={data}
        margin={{ top: 20, right: 30, bottom: 20, left: 10 }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="decile" />
        <YAxis domain={[0, 100]} />
        <Tooltip />
        <Legend />
        <Line
          type="monotone"
          dataKey="percentile"
          stroke="#8884d8"
          strokeWidth={2}
          activeDot={{ r: 6 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default SolveLevelChart;

import React from "react";
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const ScatterPlot = ({ dataDict }) => {
  // Convert dictionary to array of objects for Recharts
  const data = Object.keys(dataDict).map((key) => ({
    x: key,
    y: dataDict[key],
  }));

  return (
    <ResponsiveContainer
      width="100%"
      height={400}
    >
      <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
        <CartesianGrid />
        <XAxis
          dataKey="x"
          type="category"
          name="Key"
          label={{ value: "Keys", position: "insideBottom", offset: -5 }}
        />
        <YAxis
          dataKey="y"
          type="number"
          name="Value"
          label={{ value: "Values", angle: -90, position: "insideLeft" }}
        />
        <Tooltip cursor={{ strokeDasharray: "3 3" }} />
        <Scatter
          name="Data"
          data={data}
          fill="#8884d8"
        />
      </ScatterChart>
    </ResponsiveContainer>
  );
};

export default ScatterPlot;

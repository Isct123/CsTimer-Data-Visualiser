import React, { useMemo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const ScatterPlot = ({ dataDict }) => {
  // Transform and sort data by key (assuming keys are numeric or sortable strings)
  const data = useMemo(() => {
    if (!dataDict || typeof dataDict !== "object") return [];
    return Object.entries(dataDict)
      .map(([x, y]) => ({ x, y: Number(y) }))
      .sort((a, b) => (a.x > b.x ? 1 : -1));
  }, [dataDict]);

  return (
    <ResponsiveContainer
      width="100%"
      height={400}
    >
      <LineChart
        data={data}
        margin={{ top: 20, right: 20, bottom: 40, left: 40 }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis
          dataKey="x"
          type="category"
          name="Key"
          label={{ value: "Keys", position: "insideBottom", offset: -10 }}
          angle={-45}
          textAnchor="end"
          interval={0}
          height={60}
        />
        <YAxis
          dataKey="y"
          type="number"
          name="Value"
          label={{
            value: "Values",
            angle: -90,
            position: "insideLeft",
            offset: 10,
          }}
        />
        <Tooltip />
        <Line
          type="monotone"
          dataKey="y"
          stroke="#8884d8"
          strokeWidth={2}
          dot={false} // No dots at each point
          isAnimationActive={false} // Disable animation for performance
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default ScatterPlot;

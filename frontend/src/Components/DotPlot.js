"use client";

import React from "react";
import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  LinearScale,
  TimeScale,
  Tooltip,
  Title,
  Legend,
  Filler,
} from "chart.js";
import { Line } from "react-chartjs-2";
import "chartjs-adapter-date-fns";

// Register required Chart.js components
ChartJS.register(
  LineElement,
  PointElement,
  LinearScale,
  TimeScale,
  Tooltip,
  Title,
  Legend,
  Filler
);

export default function DotPlot({
  data,
  title = "",
  ylabel = "",
  xlabel = "Date",
}) {
  if (!data || typeof data !== "object") return null;

  const plotData = Object.entries(data)
    .map(([timestamp, value]) => ({
      x: new Date(timestamp),
      y: parseFloat(value),
    }))
    .sort((a, b) => a.x - b.x);

  const chartData = {
    datasets: [
      {
        label: ylabel || "Value",
        data: plotData,
        backgroundColor: "#8884d8",
        borderColor: "#8884d8",
        showLine: true,
        tension: 0.3,
        pointRadius: 3,
        pointHoverRadius: 5,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      title: {
        display: !!title,
        text: title,
        font: { size: 18, weight: "600" },
        padding: { bottom: 20 },
      },
      tooltip: {
        callbacks: {
          title: (context) => new Date(context[0].parsed.x).toLocaleString(),
          label: (context) => `${ylabel}: ${context.parsed.y.toFixed(2)}s`,
        },
        backgroundColor: "#fff",
        titleColor: "#000",
        bodyColor: "#000",
        borderColor: "#eee",
        borderWidth: 1,
      },
      legend: { display: false },
    },
    scales: {
      x: {
        type: "time",
        time: {
          tooltipFormat: "PPpp",
          unit: "day",
        },
        title: {
          display: true,
          text: xlabel,
          font: { weight: "600" },
        },
        ticks: {
          maxRotation: 45,
          minRotation: 45,
        },
      },
      y: {
        beginAtZero: false,
        title: {
          display: !!ylabel,
          text: ylabel,
          font: { weight: "600" },
        },
      },
    },
  };

  return (
    <div
      style={{
        width: "100%",
        height: "450px",
        padding: "1rem 0",
        background: "#f8fafc",
        borderRadius: 12,
        boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
        paddingInline: 16,
      }}
    >
      <Line
        data={chartData}
        options={options}
      />
    </div>
  );
}

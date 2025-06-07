"use client";

import React from "react";
import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Tooltip,
  Title,
  Legend,
} from "chart.js";
import { Line } from "react-chartjs-2";

// Register Chart.js components
ChartJS.register(
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Tooltip,
  Title,
  Legend
);

export default function SolveLevelChart({ levels }) {
  if (!levels || levels.length !== 10) {
    return <p>Error: Expected levels to be an array of 10 numbers.</p>;
  }

  const decileLabels = Array.from(
    { length: 10 },
    (_, i) => `${i * 10}-${(i + 1) * 10}%`
  );

  const chartData = {
    labels: decileLabels,
    datasets: [
      {
        label: "Percentile",
        data: levels,
        borderColor: "#8884d8",
        backgroundColor: "#8884d8",
        fill: false,
        tension: 0.3,
        pointRadius: 4,
        pointHoverRadius: 6,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      tooltip: {
        callbacks: {
          label: (context) => `Percentile: ${context.parsed.y}%`,
        },
      },
      legend: {
        display: true,
        position: "top",
        labels: { font: { size: 14, weight: "500" } },
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: "Decile",
          font: { weight: "600" },
        },
      },
      y: {
        min: 0,
        max: 100,
        title: {
          display: true,
          text: "Percentile",
          font: { weight: "600" },
        },
        ticks: {
          stepSize: 10,
        },
      },
    },
  };

  return (
    <div
      style={{
        width: "100%",
        height: "300px",
        background: "#f8fafc",
        borderRadius: 12,
        boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
        padding: 16,
      }}
    >
      <Line
        data={chartData}
        options={options}
      />
    </div>
  );
}

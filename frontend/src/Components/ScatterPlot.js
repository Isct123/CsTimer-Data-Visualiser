"use client";

import React from "react";
import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Title,
  Legend,
} from "chart.js";
import { Line } from "react-chartjs-2";

// Register components
ChartJS.register(
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Title,
  Legend
);

export default function ScatterPlot({ dataDict }) {
  if (!dataDict || typeof dataDict !== "object")
    return <p>No data available.</p>;

  const sortedData = Object.entries(dataDict)
    .map(([x, y]) => ({ x, y: Number(y) }))
    .sort((a, b) => (a.x > b.x ? 1 : -1));

  const chartData = {
    labels: sortedData.map((point) => point.x),
    datasets: [
      {
        label: "Value",
        data: sortedData.map((point) => point.y),
        borderColor: "#8884d8",
        borderWidth: 2,
        fill: false,
        tension: 0.3,
        pointRadius: 0, // no visible points
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: "index",
      intersect: false,
    },
    scales: {
      x: {
        ticks: {
          maxRotation: 45,
          minRotation: 45,
        },
        title: {
          display: true,
          text: "Keys",
          font: { size: 14, weight: "600" },
        },
      },
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: "Values",
          font: { size: 14, weight: "600" },
        },
      },
    },
    plugins: {
      tooltip: {
        backgroundColor: "#fff",
        titleColor: "#000",
        bodyColor: "#000",
        borderColor: "#eee",
        borderWidth: 1,
        titleFont: { weight: "600" },
        bodyFont: { weight: "500" },
      },
      legend: {
        display: false,
      },
    },
  };

  return (
    <div
      style={{
        width: "100%",
        maxWidth: 1200,
        height: 400,
        background: "#f8fafc",
        borderRadius: 12,
        boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
        padding: 16,
        marginBottom: 40,
      }}
    >
      <Line
        data={chartData}
        options={options}
      />
    </div>
  );
}

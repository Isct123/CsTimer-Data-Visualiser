"use client";

import React from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

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

function transformData(stats) {
  if (!stats) return { labels: [], datasets: [] };

  // Extract all event names
  const allEventsSet = new Set();
  Object.values(stats).forEach((events) => {
    Object.keys(events).forEach((event) => allEventsSet.add(event));
  });
  const allEvents = Array.from(allEventsSet);

  // Extract months (x-axis labels)
  const labels = Object.keys(stats);

  // Create datasets for each event
  const datasets = allEvents.map((event, idx) => ({
    label: event,
    data: labels.map((month) => stats[month][event] ?? 0),
    backgroundColor: COLORS[idx % COLORS.length],
    borderRadius: 4,
    stack: "stack1",
  }));

  return { labels, datasets };
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

  const chartData = transformData(stats);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: "index",
      intersect: false,
    },
    scales: {
      x: {
        stacked: true,
        ticks: {
          maxRotation: 45,
          minRotation: 45,
          font: { weight: "500", size: 14 },
        },
        grid: { display: false },
      },
      y: {
        stacked: true,
        beginAtZero: true,
        title: {
          display: true,
          text: "Hours",
          font: { weight: "600", size: 14 },
        },
        ticks: {
          font: { weight: "500", size: 14 },
        },
        grid: { borderDash: [3, 3] },
      },
    },
    plugins: {
      tooltip: {
        backgroundColor: "#fff",
        titleColor: "#000",
        bodyColor: "#000",
        titleFont: { weight: "600" },
        bodyFont: { weight: "500" },
        padding: 8,
        borderColor: "#eee",
        borderWidth: 1,
        boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
        callbacks: {
          label: (context) =>
            `${context.dataset.label}: ${context.parsed.y} hours`,
        },
      },
      legend: {
        position: "top",
        labels: { font: { weight: "500", size: 14 } },
      },
      title: {
        display: false,
      },
    },
  };

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
        marginBottom: 40,
      }}
    >
      <Bar
        data={chartData}
        options={options}
        height={380}
      />
    </div>
  );
}

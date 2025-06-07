import React from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

export default function BarGraph({ stats }) {
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

  const labels = Object.keys(stats);
  const dataValues = Object.values(stats);

  const data = {
    labels,
    datasets: [
      {
        label: "Hours",
        data: dataValues,
        backgroundColor: "#4D96FF",
        borderRadius: 4,
      },
    ],
  };

  const options = {
    maintainAspectRatio: false,
    responsive: true,
    scales: {
      x: {
        ticks: {
          maxRotation: 45,
          minRotation: 45,
          font: {
            weight: "500",
            size: 14,
          },
        },
        grid: {
          display: false,
        },
      },
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: "Hours",
          font: {
            weight: "600",
            size: 14,
          },
        },
        ticks: {
          font: {
            weight: "500",
            size: 14,
          },
        },
        grid: {
          borderDash: [3, 3],
        },
      },
    },
    plugins: {
      tooltip: {
        backgroundColor: "#fff",
        titleColor: "#000", // Black title text
        bodyColor: "#000", // Black body text
        titleFont: { weight: "600" },
        bodyFont: { weight: "500" },
        padding: 8,
        borderColor: "#eee",
        borderWidth: 1,
        boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
        callbacks: {
          label: (context) => {
            const val = context.parsed.y ?? context.parsed;
            return `${val} hours`;
          },
        },
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
      <div style={{ width: "100%", height: 380 }}>
        <Bar
          data={data}
          options={options}
        />
      </div>
    </div>
  );
}

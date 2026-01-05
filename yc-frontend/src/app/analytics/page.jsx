"use client";

import { useEffect, useState } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar, Pie } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Tooltip,
  Legend
);

export default function AnalyticsPage() {
  const [data, setData] = useState(null);

  useEffect(() => {
    fetch("/api/analytics")
      .then((res) => res.json())
      .then(setData);
  }, []);

  if (!data) return <p>Loading analytics…</p>;

  /* ---------- Charts ---------- */

  const batchChart = {
    labels: data.companies_per_batch.map((b) => b.batch),
    datasets: [
      {
        label: "Companies per Batch",
        data: data.companies_per_batch.map((b) => Number(b.count)),
      },
    ],
  };

  const stageChart = {
    labels: data.stage_distribution.map((s) => s.stage),
    datasets: [
      {
        label: "Stage Distribution",
        data: data.stage_distribution.map((s) => Number(s.count)),
      },
    ],
  };

  const locationChart = {
    labels: data.top_locations.map((l) => l.location),
    datasets: [
      {
        label: "Top Locations",
        data: data.top_locations.map((l) => Number(l.count)),
      },
    ],
  };

  const tagChart = {
    labels: data.top_tags.map((t) => t.tag),
    datasets: [
      {
        label: "Top Tags",
        data: data.top_tags.map((t) => Number(t.count)),
      },
    ],
  };

  return (
    <main style={{ padding: "20px", fontFamily: "sans-serif" }}>
      <h1>Analytics Dashboard</h1>

      <h2>Companies per Batch</h2>
      <Bar data={batchChart} />

      <h2>Stage Distribution</h2>
      <Pie data={stageChart} />

      <h2>Top Locations</h2>
      <Bar data={locationChart} />

      <h2>Top Tags</h2>
      <Bar data={tagChart} />
    </main>
  );
}

"use client";

import { shortChartLabel } from "@/lib/admin-metrics";

interface ChartPoint {
  date: string;
  value: number;
}

function buildPath(
  points: ChartPoint[],
  width: number,
  height: number,
  maxValue: number
): string {
  if (points.length === 0) return "";

  const step = width / Math.max(points.length - 1, 1);

  return points
    .map((point, index) => {
      const x = index * step;
      const y = height - (point.value / maxValue) * (height - 8) - 4;
      return `${index === 0 ? "M" : "L"} ${x} ${y}`;
    })
    .join(" ");
}

export function AdminLineChart({
  data,
  color = "#A0522D",
}: {
  data: ChartPoint[];
  color?: string;
}) {
  const width = 640;
  const height = 180;
  const maxValue = Math.max(...data.map((point) => point.value), 1);
  const path = buildPath(data, width, height, maxValue);

  return (
    <div className="admin-chart-wrap">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full h-[180px]"
        role="img"
        aria-label="Graphique linéaire"
      >
        {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
          const y = height - ratio * (height - 8) - 4;
          return (
            <line
              key={ratio}
              x1="0"
              y1={y}
              x2={width}
              y2={y}
              stroke="rgba(255,255,255,0.06)"
              strokeDasharray="4 4"
            />
          );
        })}
        <path
          d={path}
          fill="none"
          stroke={color}
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ filter: "drop-shadow(0 0 8px rgba(160, 82, 45, 0.45))" }}
        />
      </svg>
      <div className="admin-chart-labels">
        {data
          .filter((_, index) => index % 5 === 0 || index === data.length - 1)
          .map((point) => (
            <span key={point.date}>{shortChartLabel(point.date)}</span>
          ))}
      </div>
    </div>
  );
}

export function AdminBarChart({
  data,
  color = "#A0522D",
}: {
  data: ChartPoint[];
  color?: string;
}) {
  const width = 640;
  const height = 180;
  const maxValue = Math.max(...data.map((point) => point.value), 1);
  const barWidth = width / data.length - 2;

  return (
    <div className="admin-chart-wrap">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full h-[180px]"
        role="img"
        aria-label="Graphique en barres"
      >
        {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
          const y = height - ratio * (height - 8) - 4;
          return (
            <line
              key={ratio}
              x1="0"
              y1={y}
              x2={width}
              y2={y}
              stroke="rgba(255,255,255,0.06)"
              strokeDasharray="4 4"
            />
          );
        })}
        {data.map((point, index) => {
          const barHeight = (point.value / maxValue) * (height - 16);
          const x = index * (width / data.length) + 1;
          const y = height - barHeight - 8;
          return (
            <rect
              key={point.date}
              x={x}
              y={y}
              width={barWidth}
              height={barHeight}
              rx="3"
              fill={color}
              opacity={0.85}
            />
          );
        })}
      </svg>
      <div className="admin-chart-labels">
        {data
          .filter((_, index) => index % 5 === 0 || index === data.length - 1)
          .map((point) => (
            <span key={point.date}>{shortChartLabel(point.date)}</span>
          ))}
      </div>
    </div>
  );
}

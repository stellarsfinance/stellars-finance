import { useMemo } from "react";

interface SparklineChartProps {
  data?: number[];
  width?: number;
  height?: number;
  className?: string;
  positive?: boolean;
}

export const SparklineChart = ({
  data,
  width = 80,
  height = 24,
  className = "",
  positive = true,
}: SparklineChartProps) => {
  const points = useMemo(() => {
    if (!data || data.length === 0) {
      // Generate random sparkline data for demo
      const randomData = Array.from({ length: 20 }, (_, i) => {
        const trend = positive ? 1 : -1;
        return 50 + trend * (i * 2) + (Math.random() - 0.5) * 20;
      });
      return generatePath(randomData, width, height);
    }
    return generatePath(data, width, height);
  }, [data, width, height, positive]);

  return (
    <svg
      width={width}
      height={height}
      className={className}
      viewBox={`0 0 ${width} ${height}`}
    >
      <path
        d={points}
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

function generatePath(data: number[], width: number, height: number): string {
  if (data.length === 0) return "";

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;

  const xStep = width / (data.length - 1);
  const padding = 2;

  const points = data.map((value, index) => {
    const x = index * xStep;
    const y = height - padding - ((value - min) / range) * (height - padding * 2);
    return `${x.toFixed(2)},${y.toFixed(2)}`;
  });

  return `M ${points.join(" L ")}`;
}

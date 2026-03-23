"use client";

import { LineChart, Line } from 'recharts';

interface MiniSparklineProps {
  data: number[];
  status: 'healthy' | 'attention' | 'risk';
  width?: number;
  height?: number;
  strokeWidth?: number;
  lineOpacity?: number;
}

export function MiniSparkline({
  data,
  status,
  width = 80,
  height = 32,
  strokeWidth = 1.5,
  lineOpacity = 1,
}: MiniSparklineProps) {
  const chartData = data.map((value, index) => ({ value, index }));

  const colorMap = {
    healthy: '#10b981',
    attention: '#f59e0b',
    risk: '#ef4444',
  };

  return (
    <LineChart width={width} height={height} data={chartData}>
      <Line
        type="monotone"
        dataKey="value"
        stroke={colorMap[status]}
        strokeWidth={strokeWidth}
        strokeOpacity={lineOpacity}
        dot={false}
        isAnimationActive={false}
      />
    </LineChart>
  );
}

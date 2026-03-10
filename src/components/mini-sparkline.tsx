import { LineChart, Line } from 'recharts';

interface MiniSparklineProps {
  data: number[];
  status: 'healthy' | 'attention' | 'risk';
}

export function MiniSparkline({ data, status }: MiniSparklineProps) {
  const chartData = data.map((value, index) => ({ value, index }));
  
  const colorMap = {
    healthy: '#10b981',
    attention: '#f59e0b',
    risk: '#ef4444',
  };

  return (
    <LineChart width={80} height={32} data={chartData}>
      <Line
        type="monotone"
        dataKey="value"
        stroke={colorMap[status]}
        strokeWidth={1.5}
        dot={false}
        isAnimationActive={false}
      />
    </LineChart>
  );
}

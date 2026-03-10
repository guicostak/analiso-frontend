import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer } from 'recharts';

interface PillarRadarProps {
  pillars: {
    growth: number;
    profitability: number;
    debt: number;
    valuation: number;
    momentum: number;
  };
}

export function PillarRadar({ pillars }: PillarRadarProps) {
  const data = [
    { metric: 'Growth', value: pillars.growth },
    { metric: 'Profit', value: pillars.profitability },
    { metric: 'Debt', value: pillars.debt },
    { metric: 'Value', value: pillars.valuation },
    { metric: 'Momentum', value: pillars.momentum },
  ];

  return (
    <ResponsiveContainer width="100%" height={240}>
      <RadarChart data={data}>
        <PolarGrid stroke="#e5e7eb" />
        <PolarAngleAxis 
          dataKey="metric" 
          tick={{ fill: '#6b7280', fontSize: 12 }}
        />
        <Radar
          dataKey="value"
          stroke="#34d399"
          fill="#34d399"
          fillOpacity={0.25}
          strokeWidth={2}
        />
      </RadarChart>
    </ResponsiveContainer>
  );
}

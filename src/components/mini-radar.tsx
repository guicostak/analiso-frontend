interface MiniRadarProps {
  pillars: {
    growth: number;
    profitability: number;
    debt: number;
    valuation: number;
    momentum: number;
  };
}

export function MiniRadar({ pillars }: MiniRadarProps) {
  const getColor = (value: number) => {
    if (value >= 70) return 'bg-emerald-500';
    if (value >= 50) return 'bg-amber-500';
    return 'bg-red-500';
  };

  const getSize = (value: number) => {
    if (value >= 70) return 'w-2 h-2';
    if (value >= 50) return 'w-1.5 h-1.5';
    return 'w-1.5 h-1.5';
  };

  const pillarValues = [
    pillars.growth,
    pillars.profitability,
    pillars.debt,
    pillars.valuation,
    pillars.momentum,
  ];

  return (
    <div className="flex items-center gap-1.5">
      {pillarValues.map((value, index) => (
        <div
          key={index}
          className={`rounded-full ${getColor(value)} ${getSize(value)}`}
          title={`${Object.keys(pillars)[index]}: ${value}`}
        />
      ))}
    </div>
  );
}

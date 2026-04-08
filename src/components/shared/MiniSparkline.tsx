"use client";

import { useState } from 'react';
import { createPortal } from 'react-dom';
import { LineChart, Line, YAxis } from 'recharts';

interface MiniSparklineProps {
  data: number[];
  status: 'healthy' | 'attention' | 'risk';
  width?: number;
  height?: number;
  strokeWidth?: number;
  lineOpacity?: number;
}

const colorMap = {
  healthy: '#10b981',
  attention: '#f59e0b',
  risk: '#ef4444',
};

export function MiniSparkline({
  data,
  status,
  width = 80,
  height = 32,
  strokeWidth = 1.5,
  lineOpacity = 1,
}: MiniSparklineProps) {
  const chartData = data.map((value, index) => ({ value, index }));
  const color = colorMap[status];
  const [tooltip, setTooltip] = useState<{ clientX: number; clientY: number; value: number } | null>(null);

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    if (!data.length) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const relX = e.clientX - rect.left;
    const index = Math.min(
      data.length - 1,
      Math.max(0, Math.round((relX / rect.width) * (data.length - 1)))
    );
    setTooltip({ clientX: e.clientX, clientY: e.clientY, value: data[index] });
  }

  return (
    <>
      {tooltip && typeof document !== 'undefined' && createPortal(
        <div
          style={{
            position: 'fixed',
            left: tooltip.clientX,
            top: tooltip.clientY - 36,
            transform: 'translateX(-50%)',
            pointerEvents: 'none',
            zIndex: 99999,
            background: '#fff',
            border: '1px solid #e2e8f0',
            borderRadius: 8,
            padding: '2px 8px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            whiteSpace: 'nowrap',
          }}
        >
          <span style={{ fontSize: 11, fontWeight: 600, color }}>
            {tooltip.value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        </div>,
        document.body
      )}
      <div
        style={{ width, height, cursor: 'crosshair' }}
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setTooltip(null)}
      >
        <LineChart
          width={width}
          height={height}
          data={chartData}
          margin={{ top: 0, right: 0, bottom: 0, left: 0 }}
        >
          <YAxis domain={['dataMin', 'dataMax']} hide />
          <Line
            type="monotone"
            dataKey="value"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeOpacity={lineOpacity}
            dot={false}
            isAnimationActive={false}
          />
        </LineChart>
      </div>
    </>
  );
}

"use client";

import { useState } from 'react';
import { createPortal } from 'react-dom';
import { LineChart, Line, YAxis } from 'recharts';

interface MiniSparklineProps {
  data: number[];
  /**
   * Labels paralelos aos valores (mesmo length). Ex.: ["12/03", "13/03", ...].
   * Quando informado, o tooltip mostra o label acima do valor.
   * Quando null/omisso ou length ≠ data.length, o tooltip mostra só o valor.
   */
  labels?: (string | null)[];
  status: 'healthy' | 'attention' | 'risk';
  width?: number;
  height?: number;
  strokeWidth?: number;
  lineOpacity?: number;
  /**
   * Formatter custom para o valor no tooltip. Default: 2 casas decimais pt-BR.
   */
  valueFormatter?: (value: number) => string;
}

const colorMap = {
  healthy: '#10b981',
  attention: '#f59e0b',
  risk: '#ef4444',
};

const defaultValueFormatter = (v: number) =>
  v.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export function MiniSparkline({
  data,
  labels,
  status,
  width = 80,
  height = 32,
  strokeWidth = 1.5,
  lineOpacity = 1,
  valueFormatter = defaultValueFormatter,
}: MiniSparklineProps) {
  const chartData = data.map((value, index) => ({ value, index }));
  const color = colorMap[status];
  const [tooltip, setTooltip] = useState<
    { clientX: number; clientY: number; value: number; label: string | null } | null
  >(null);

  const labelsUsable = Array.isArray(labels) && labels.length === data.length;

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    if (!data.length) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const relX = e.clientX - rect.left;
    const index = Math.min(
      data.length - 1,
      Math.max(0, Math.round((relX / rect.width) * (data.length - 1)))
    );
    setTooltip({
      clientX: e.clientX,
      clientY: e.clientY,
      value: data[index],
      label: labelsUsable ? (labels![index] ?? null) : null,
    });
  }

  return (
    <>
      {tooltip && typeof document !== 'undefined' && createPortal(
        <div
          style={{
            position: 'fixed',
            left: tooltip.clientX,
            top: tooltip.clientY - (tooltip.label ? 48 : 36),
            transform: 'translateX(-50%)',
            pointerEvents: 'none',
            zIndex: 99999,
            // Tokens semânticos — herda dark mode automaticamente.
            background: 'var(--card)',
            border: '1px solid var(--border)',
            borderRadius: 8,
            padding: tooltip.label ? '4px 10px' : '2px 8px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            whiteSpace: 'nowrap',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: tooltip.label ? 2 : 0,
          }}
        >
          {tooltip.label && (
            <span
              style={{
                fontSize: 10,
                fontWeight: 500,
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
                color: 'var(--muted-foreground)',
              }}
            >
              {tooltip.label}
            </span>
          )}
          <span style={{ fontSize: 11, fontWeight: 600, color, fontVariantNumeric: 'tabular-nums' }}>
            {valueFormatter(tooltip.value)}
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

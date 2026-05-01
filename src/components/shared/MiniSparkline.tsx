"use client";

import { useState, useMemo, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { AreaChart, Area, YAxis, ReferenceLine, ReferenceDot } from 'recharts';

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
  /**
   * Exibe baseline horizontal tracejada no valor inicial (primeiro ponto).
   * Referência visual pra "subiu ou caiu no total do período". Default: true.
   */
  showBaseline?: boolean;
  /**
   * Exibe dot destacado no último ponto ("você está aqui"). Default: true.
   */
  showEndpoint?: boolean;
  /**
   * Preenche a área abaixo da linha com gradient sutil da cor do status.
   * Dá sensação de densidade sem roubar atenção da linha. Default: true.
   */
  showArea?: boolean;
}

const colorMap = {
  healthy: '#10b981',
  attention: '#f59e0b',
  risk: '#ef4444',
};

const defaultValueFormatter = (v: number) =>
  v.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

let _gradientCounter = 0;
const nextGradientId = () => `mini-spark-grad-${++_gradientCounter}`;

export function MiniSparkline({
  data,
  labels,
  status,
  width = 80,
  height = 32,
  strokeWidth = 1.5,
  lineOpacity = 1,
  valueFormatter = defaultValueFormatter,
  showBaseline = true,
  showEndpoint = true,
  showArea = true,
}: MiniSparklineProps) {
  const chartData = useMemo(() => data.map((value, index) => ({ value, index })), [data]);
  const color = colorMap[status];
  const [tooltip, setTooltip] = useState<
    { clientX: number; clientY: number; value: number; label: string | null } | null
  >(null);

  // ID estável por instância para o gradient do fill.
  const gradientId = useMemo(() => nextGradientId(), []);

  /**
   * Dismissal defensivo do tooltip.
   *
   * `onMouseLeave` só dispara se o mouse SE MOVER pra fora do elemento. Mas se o
   * usuário rola a página (scroll/wheel), redimensiona a janela ou troca de aba
   * sem mexer o mouse, o sparkline desliza pra fora do cursor SEM disparar o
   * leave — e o tooltip `position: fixed` fica preso flutuando na tela.
   *
   * Solução: enquanto houver tooltip ativo, escutamos qualquer evento que
   * invalide a posição do sparkline em relação ao cursor e limpamos.
   */
  useEffect(() => {
    if (!tooltip) return;
    const dismiss = () => setTooltip(null);
    // capture=true garante que capturamos scroll de QUALQUER ancestral rolável.
    window.addEventListener('scroll', dismiss, true);
    window.addEventListener('wheel', dismiss, { passive: true });
    window.addEventListener('resize', dismiss);
    window.addEventListener('blur', dismiss);
    document.addEventListener('visibilitychange', dismiss);
    return () => {
      window.removeEventListener('scroll', dismiss, true);
      window.removeEventListener('wheel', dismiss);
      window.removeEventListener('resize', dismiss);
      window.removeEventListener('blur', dismiss);
      document.removeEventListener('visibilitychange', dismiss);
    };
  }, [tooltip]);

  const labelsUsable = Array.isArray(labels) && labels.length === data.length;
  const hasEnoughData = data.length >= 2;
  const firstValue = hasEnoughData ? data[0] : null;
  const lastIndex = hasEnoughData ? data.length - 1 : -1;
  const lastValue = hasEnoughData ? data[lastIndex] : null;

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
        <AreaChart
          width={width}
          height={height}
          data={chartData}
          margin={{ top: 2, right: 2, bottom: 2, left: 2 }}
        >
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%"   stopColor={color} stopOpacity={showArea ? 0.24 : 0} />
              <stop offset="100%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>

          <YAxis domain={['dataMin', 'dataMax']} hide />

          {/* Baseline — referência horizontal no valor inicial */}
          {showBaseline && firstValue != null && (
            <ReferenceLine
              y={firstValue}
              stroke="currentColor"
              strokeOpacity={0.25}
              strokeWidth={1}
              strokeDasharray="2 3"
              className="text-muted-foreground"
              ifOverflow="extendDomain"
            />
          )}

          {/* Área sutil abaixo da linha — dá densidade sem poluir */}
          <Area
            type="monotone"
            dataKey="value"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeOpacity={lineOpacity}
            fill={showArea ? `url(#${gradientId})` : 'transparent'}
            fillOpacity={1}
            dot={false}
            isAnimationActive={false}
          />

          {/* Endpoint "você está aqui" */}
          {showEndpoint && lastValue != null && (
            <ReferenceDot
              x={lastIndex}
              y={lastValue}
              r={2.5}
              fill={color}
              stroke="var(--card)"
              strokeWidth={1}
              isFront
            />
          )}
        </AreaChart>
      </div>
    </>
  );
}

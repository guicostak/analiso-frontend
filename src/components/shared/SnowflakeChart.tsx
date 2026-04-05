"use client";

/**
 * SnowflakeChart — Round radar chart with alternating ring bands.
 *
 * Inspired by Simply Wall St snowflake:
 * - Alternating filled bands between concentric rings (target/bullseye)
 * - Bright solid data shape fill
 * - Axis spokes + labels uppercase around the edge
 * - Dark mode: dark bands; Light mode: subtle gray bands
 * - Framer Motion entry animations
 * - Interactive hover/click
 */

import { useState, useId } from 'react';
import { motion, AnimatePresence } from 'motion/react';

/* ── Types ────────────────────────────────────────────────────────────────── */

export interface SnowflakeDimension {
  label: string;
  value: number;       // 0-100
  color?: string;
  why?: string;
  metric?: string;
  tooltip?: string;
}

export interface SnowflakeChartProps {
  dimensions: SnowflakeDimension[];
  size?: 'large' | 'small';
  status?: 'healthy' | 'attention' | 'risk';
  className?: string;
  onSelect?: (label: string) => void;
  activeLabel?: string;
  showTooltip?: boolean;
}

/* ── Constants ────────────────────────────────────────────────────────────── */

// Solid, vibrant fill colors matching the app palette
const STATUS_COLORS = {
  healthy:   '#2EAA8A',  // teal green (COLORS.past)
  attention: '#D4913B',  // warm amber (COLORS.health)
  risk:      '#C74B4B',  // soft coral (COLORS.negative)
};

const LEVELS = 4;

/* ── Geometry helpers ─────────────────────────────────────────────────────── */

function polarToXY(cx: number, cy: number, r: number, angleDeg: number): [number, number] {
  const rad = (angleDeg * Math.PI) / 180;
  return [cx + r * Math.cos(rad), cy + r * Math.sin(rad)];
}

function getAngle(index: number, total: number): number {
  return (360 / total) * index - 90;
}

/** Smooth closed bezier curve through data points (Catmull-Rom) */
function smoothClosedPath(points: [number, number][], tension = 0.35): string {
  const n = points.length;
  if (n < 3) return '';

  const parts: string[] = [];
  parts.push(`M ${points[0][0]},${points[0][1]}`);

  for (let i = 0; i < n; i++) {
    const p0 = points[(i - 1 + n) % n];
    const p1 = points[i];
    const p2 = points[(i + 1) % n];
    const p3 = points[(i + 2) % n];

    const cp1x = p1[0] + (p2[0] - p0[0]) * tension / 3;
    const cp1y = p1[1] + (p2[1] - p0[1]) * tension / 3;
    const cp2x = p2[0] - (p3[0] - p1[0]) * tension / 3;
    const cp2y = p2[1] - (p3[1] - p1[1]) * tension / 3;

    parts.push(`C ${cp1x},${cp1y} ${cp2x},${cp2y} ${p2[0]},${p2[1]}`);
  }

  return parts.join(' ') + ' Z';
}

/* ── Component ────────────────────────────────────────────────────────────── */

export function SnowflakeChart({
  dimensions,
  size = 'large',
  status = 'healthy',
  className = '',
  onSelect,
  activeLabel,
  showTooltip = true,
}: SnowflakeChartProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const uid = useId().replace(/:/g, '');

  const isLarge = size === 'large';
  const svgSize = isLarge ? 280 : 140;
  const cx = svgSize / 2;
  const cy = svgSize / 2;
  const maxR = isLarge ? 95 : 48;
  const n = dimensions.length;

  const accent = STATUS_COLORS[status];

  // Data points
  const dataPoints: [number, number][] = dimensions.map((d, i) => {
    const frac = Math.max(d.value / 100, 0.05);
    return polarToXY(cx, cy, maxR * frac, getAngle(i, n));
  });

  const dataPath = smoothClosedPath(dataPoints, 0.35);

  return (
    <div className={`relative ${className}`}>
      <svg
        width={svgSize}
        height={svgSize}
        viewBox={`0 0 ${svgSize} ${svgSize}`}
        className="overflow-visible"
        role="img"
        aria-label={`Radar chart: ${dimensions.map(d => `${d.label} ${d.value}`).join(', ')}`}
      >
        {/* ── Alternating ring bands (bullseye stripes) ──
             Draw from outermost to innermost. Each circle covers
             the center of the previous one, creating visible bands.
             Band A (darker) / Band B (lighter) alternate. */}
        <g>
          {Array.from({ length: LEVELS }, (_, idx) => {
            // Draw outer → inner so inner covers center of outer
            const lvl = LEVELS - idx;
            const r = (maxR / LEVELS) * lvl;
            const isDark = lvl % 2 === 0;
            return (
              <circle
                key={`band-${lvl}`}
                cx={cx}
                cy={cy}
                r={r}
                // Dark band: foreground @ 6% — Light band: foreground @ 2.5%
                fill="var(--foreground)"
                fillOpacity={isDark ? 0.06 : 0.025}
                stroke="none"
              />
            );
          })}
        </g>

        {/* ── Ring outlines between bands ── */}
        <g>
          {Array.from({ length: LEVELS }, (_, lvl) => {
            const r = (maxR / LEVELS) * (lvl + 1);
            return (
              <circle
                key={`ring-${lvl}`}
                cx={cx}
                cy={cy}
                r={r}
                fill="none"
                className="stroke-border"
                strokeWidth="0.75"
                opacity={0.3}
              />
            );
          })}
        </g>

        {/* ── Axis spokes ── */}
        <g>
          {dimensions.map((_, i) => {
            const [ex, ey] = polarToXY(cx, cy, maxR, getAngle(i, n));
            return (
              <line
                key={i}
                x1={cx} y1={cy} x2={ex} y2={ey}
                className="stroke-border"
                strokeWidth="0.75"
                opacity={0.3}
              />
            );
          })}
        </g>

        {/* ── Invisible sector hit areas (for hover by region) ── */}
        <g>
          {dimensions.map((_, i) => {
            const halfSector = (360 / n) / 2;
            const angPrev = getAngle(i, n) - halfSector;
            const angNext = getAngle(i, n) + halfSector;
            const r = maxR;
            const startRad = (angPrev * Math.PI) / 180;
            const endRad = (angNext * Math.PI) / 180;
            const x1 = cx + r * Math.cos(startRad);
            const y1 = cy + r * Math.sin(startRad);
            const x2 = cx + r * Math.cos(endRad);
            const y2 = cy + r * Math.sin(endRad);
            const sectorPath = `M ${cx},${cy} L ${x1},${y1} A ${r} ${r} 0 0 1 ${x2},${y2} Z`;

            return (
              <path
                key={`hit-${i}`}
                d={sectorPath}
                fill="transparent"
                className={onSelect ? 'cursor-pointer' : undefined}
                onMouseEnter={() => setHoveredIndex(i)}
                onMouseLeave={() => setHoveredIndex(null)}
                onClick={() => onSelect?.(dimensions[i].label)}
              />
            );
          })}
        </g>

        {/* ── Hover sector highlight ── */}
        {hoveredIndex !== null && (
          <motion.path
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.1 }}
            exit={{ opacity: 0 }}
            d={(() => {
              const halfSector = (360 / n) / 2;
              const angPrev = getAngle(hoveredIndex, n) - halfSector;
              const angNext = getAngle(hoveredIndex, n) + halfSector;
              const r = maxR;
              const startRad = (angPrev * Math.PI) / 180;
              const endRad = (angNext * Math.PI) / 180;
              const x1 = cx + r * Math.cos(startRad);
              const y1 = cy + r * Math.sin(startRad);
              const x2 = cx + r * Math.cos(endRad);
              const y2 = cy + r * Math.sin(endRad);
              return `M ${cx},${cy} L ${x1},${y1} A ${r} ${r} 0 0 1 ${x2},${y2} Z`;
            })()}
            fill={accent}
            className="pointer-events-none"
          />
        )}

        {/* ── Data shape: solid fill ── */}
        <motion.path
          d={dataPath}
          fill={accent}
          fillOpacity={0.45}
          stroke="none"
          className="pointer-events-none"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 160, damping: 20, delay: 0.05 }}
          style={{ transformOrigin: `${cx}px ${cy}px` }}
        />

        {/* ── Data shape: solid stroke ── */}
        <motion.path
          d={dataPath}
          fill="none"
          stroke={accent}
          strokeWidth={isLarge ? '2' : '1.25'}
          strokeLinejoin="round"
          className="pointer-events-none"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.6, ease: 'easeOut', delay: 0.1 }}
        />

        {/* ── Center dot ── */}
        <circle cx={cx} cy={cy} r={isLarge ? 2 : 1.5} className="fill-muted-foreground pointer-events-none" opacity="0.2" />

        {/* ── Axis labels (large only) ── */}
        {isLarge && dimensions.map((dim, i) => {
          const labelR = maxR + 18;
          const ang = getAngle(i, n);
          const [lx, ly] = polarToXY(cx, cy, labelR, ang);

          const isLeft = lx < cx - 15;
          const isRight = lx > cx + 15;
          const anchor = isLeft ? 'end' : isRight ? 'start' : 'middle';
          const isHovered = hoveredIndex === i;
          const dimColor = dim.color ?? accent;

          return (
            <g
              key={`lbl-${i}`}
              onMouseEnter={() => setHoveredIndex(i)}
              onMouseLeave={() => setHoveredIndex(null)}
              onClick={() => onSelect?.(dim.label)}
              className={onSelect ? 'cursor-pointer' : undefined}
              role="button"
              tabIndex={0}
              aria-label={`${dim.label}: ${dim.value.toFixed(0)} de 100`}
            >
              {/* Hit area */}
              <circle cx={lx} cy={ly} r={20} fill="transparent" />

              {/* Label text */}
              <text
                x={lx}
                y={ly}
                textAnchor={anchor}
                dominantBaseline="middle"
                className="fill-foreground select-none pointer-events-none"
                style={{
                  fontSize: 9.5,
                  fontWeight: 700,
                  letterSpacing: '0.05em',
                  textTransform: 'uppercase' as const,
                  opacity: isHovered ? 1 : 0.6,
                  transition: 'opacity 200ms ease',
                }}
              >
                {dim.label}
              </text>
            </g>
          );
        })}
      </svg>

      {/* ── Tooltip ── */}
      <AnimatePresence>
        {showTooltip && hoveredIndex !== null && isLarge && (dimensions[hoveredIndex].why || dimensions[hoveredIndex].tooltip) && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full left-1/2 -translate-x-1/2 mt-3 w-72 bg-card border border-border rounded-xl p-4 shadow-lg z-20"
          >
            <div className="flex items-start gap-3">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: `color-mix(in srgb, ${dimensions[hoveredIndex].color ?? accent} 15%, transparent)` }}
              >
                <span className="text-xs font-bold" style={{ color: dimensions[hoveredIndex].color ?? accent }}>
                  {dimensions[hoveredIndex].value.toFixed(0)}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-semibold text-foreground">{dimensions[hoveredIndex].label}</h4>
                {dimensions[hoveredIndex].metric && (
                  <p className="text-xs font-medium mt-0.5" style={{ color: dimensions[hoveredIndex].color ?? accent }}>
                    {dimensions[hoveredIndex].metric}
                  </p>
                )}
                {(dimensions[hoveredIndex].tooltip || dimensions[hoveredIndex].why) && (
                  <p className="text-[11px] text-muted-foreground leading-relaxed mt-1.5">
                    {dimensions[hoveredIndex].tooltip ?? dimensions[hoveredIndex].why}
                  </p>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ── Mini variant alias ──────────────────────────────────────────────────── */

export function SnowflakeChartMini({
  dimensions,
  status = 'healthy',
  className = '',
}: Omit<SnowflakeChartProps, 'size'>) {
  return (
    <SnowflakeChart
      dimensions={dimensions}
      size="small"
      status={status}
      className={className}
      showTooltip={false}
    />
  );
}

"use client";

import type { CompareEnrichedCompany } from "../../interfaces";

/* ── Types ────────────────────────────────────────────────────────────────── */

interface GrowthIslandProps {
  a: CompareEnrichedCompany;
  b: CompareEnrichedCompany;
  formatNumber: (value: number, digits?: number) => string;
}

/* ── Horizontal Bar ───────────────────────────────────────────────────────── */

function HBar({
  label,
  value,
  maxVal,
  color,
  formatNumber,
}: {
  label: string;
  value: number;
  maxVal: number;
  color: string;
  formatNumber: (value: number, digits?: number) => string;
}) {
  const widthPct = maxVal === 0 ? 0 : Math.max((Math.abs(value) / maxVal) * 100, 2);

  return (
    <div className="flex items-center gap-3">
      <span className="w-20 text-right text-[11px] text-muted-foreground truncate">
        {label}
      </span>
      <div className="relative flex-1 h-5 rounded bg-muted">
        <div
          className="h-full rounded"
          style={{
            width: `${widthPct}%`,
            backgroundColor: color,
            opacity: 0.7,
          }}
        />
      </div>
      <span className="w-14 text-left text-[11px] font-medium text-foreground">
        {formatNumber(value, 1)}%
      </span>
    </div>
  );
}

/* ── Growth Bar Group ─────────────────────────────────────────────────────── */

function GrowthBarGroup({
  title,
  a,
  b,
  industry,
  market,
  tickerA,
  tickerB,
  formatNumber,
}: {
  title: string;
  a: number;
  b: number;
  industry: number;
  market: number;
  tickerA: string;
  tickerB: string;
  formatNumber: (value: number, digits?: number) => string;
}) {
  const maxVal = Math.max(Math.abs(a), Math.abs(b), Math.abs(industry), Math.abs(market), 1);

  return (
    <div className="space-y-2">
      <h4 className="text-[12px] font-semibold text-foreground uppercase tracking-wider">
        {title}
      </h4>
      <div className="space-y-1.5">
        <HBar label={tickerA} value={a} maxVal={maxVal} color="var(--brand)" formatNumber={formatNumber} />
        <HBar label={tickerB} value={b} maxVal={maxVal} color="var(--compare-b)" formatNumber={formatNumber} />
        <HBar label="Industria" value={industry} maxVal={maxVal} color="#94A3B8" formatNumber={formatNumber} />
        <HBar label="Mercado" value={market} maxVal={maxVal} color="#64748B" formatNumber={formatNumber} />
      </div>
    </div>
  );
}

/* ── EPS Forecast Line ────────────────────────────────────────────────────── */

function EpsForecastChart({
  company,
  side,
}: {
  company: CompareEnrichedCompany;
  side: "a" | "b";
}) {
  const series = company.growthData.epsSeries;
  if (!series.length) return null;

  const values = series.map((s) => s.value);
  const minVal = Math.min(...values);
  const maxVal = Math.max(...values);
  const range = maxVal - minVal || 1;

  const svgW = 280;
  const svgH = 100;
  const padX = 24;
  const padY = 12;
  const plotW = svgW - padX * 2;
  const plotH = svgH - padY * 2;

  const lineColor = side === "a" ? "var(--brand)" : "var(--compare-b)";

  function toXY(i: number, val: number): { x: number; y: number } {
    const x = padX + (i / Math.max(series.length - 1, 1)) * plotW;
    const y = padY + plotH - ((val - minVal) / range) * plotH;
    return { x, y };
  }

  // Build path segments: solid for historical, dashed for forecast
  const historicalPts: string[] = [];
  const forecastPts: string[] = [];
  let lastHistorical: { x: number; y: number } | null = null;

  series.forEach((s, i) => {
    const { x, y } = toXY(i, s.value);
    if (s.type === "historical") {
      historicalPts.push(`${i === 0 ? "M" : "L"} ${x},${y}`);
      lastHistorical = { x, y };
    } else {
      if (forecastPts.length === 0 && lastHistorical) {
        forecastPts.push(`M ${lastHistorical.x},${lastHistorical.y}`);
      }
      forecastPts.push(`L ${x},${y}`);
    }
  });

  return (
    <div className="space-y-2">
      <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
        {company.ticker} - EPS
      </span>
      <svg
        viewBox={`0 0 ${svgW} ${svgH}`}
        className="w-full"
        preserveAspectRatio="xMidYMid meet"
      >
        {/* Historical line */}
        {historicalPts.length > 1 && (
          <path
            d={historicalPts.join(" ")}
            fill="none"
            stroke={lineColor}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )}
        {/* Forecast line */}
        {forecastPts.length > 1 && (
          <path
            d={forecastPts.join(" ")}
            fill="none"
            stroke={lineColor}
            strokeWidth="2"
            strokeDasharray="4 3"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity="0.6"
          />
        )}
        {/* Dots */}
        {series.map((s, i) => {
          const { x, y } = toXY(i, s.value);
          return (
            <circle
              key={i}
              cx={x}
              cy={y}
              r="3"
              fill={lineColor}
              opacity={s.type === "forecast" ? 0.5 : 1}
            />
          );
        })}
        {/* Year labels */}
        {series.map((s, i) => {
          const { x } = toXY(i, s.value);
          return (
            <text
              key={`lbl-${i}`}
              x={x}
              y={svgH - 2}
              textAnchor="middle"
              className="fill-muted-foreground"
              style={{ fontSize: 8 }}
            >
              {s.year}
            </text>
          );
        })}
      </svg>
    </div>
  );
}

/* ── Main Component ───────────────────────────────────────────────────────── */

export function GrowthIsland({ a, b, formatNumber }: GrowthIslandProps) {
  return (
    <div className="compare-island compare-surface p-6 scroll-mt-[160px] space-y-6">
      <h3 className="text-base font-semibold text-foreground">
        Crescimento futuro
      </h3>

      {/* ── Growth bar comparison ── */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <GrowthBarGroup
          title="Lucro"
          a={a.growthData.earningsGrowth}
          b={b.growthData.earningsGrowth}
          industry={a.growthData.industryEarningsGrowth}
          market={a.growthData.marketEarningsGrowth}
          tickerA={a.ticker}
          tickerB={b.ticker}
          formatNumber={formatNumber}
        />
        <GrowthBarGroup
          title="Receita"
          a={a.growthData.revenueGrowth}
          b={b.growthData.revenueGrowth}
          industry={a.growthData.industryEarningsGrowth}
          market={a.growthData.marketEarningsGrowth}
          tickerA={a.ticker}
          tickerB={b.ticker}
          formatNumber={formatNumber}
        />
      </div>

      {/* ── EPS Forecast charts ── */}
      <div className="compare-side-grid">
        <EpsForecastChart company={a} side="a" />
        <EpsForecastChart company={b} side="b" />
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import type { CompareEnrichedCompany } from "../../interfaces";
import { CompareReadingCard } from "../shared/CompareReadingCard";
import { CompareDimensionCheckCard } from "../shared/CompareDimensionCheckCard";
import { CompareSectionCriteria } from "../shared/CompareSectionCriteria";

type GrowthSeriesKey = "revenue" | "earnings" | "fcl" | "fco";
type GrowthSeriesVisibility = Record<GrowthSeriesKey, boolean>;

/* ── Types ────────────────────────────────────────────────────────────────── */

interface GrowthIslandProps {
  a: CompareEnrichedCompany;
  b: CompareEnrichedCompany;
  formatNumber: (value: number, digits?: number) => string;
}

/* ── Helpers ──────────────────────────────────────────────────────────────── */

function clamp(v: number, min: number, max: number) {
  return Math.min(Math.max(v, min), max);
}

/* ── Section 1: Crescimento de Lucro vs Receita ──────────────────────────── */

function GrowthBarRow({
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
  formatNumber: (v: number, d?: number) => string;
}) {
  const isNeg = value < 0;
  const widthPct = maxVal === 0 ? 0 : Math.max((Math.abs(value) / maxVal) * 100, 3);

  return (
    <div className="flex items-center gap-2 group">
      <span className="w-24 text-right text-[11px] text-muted-foreground truncate font-medium">
        {label}
      </span>
      <div className="relative flex-1 h-7 rounded-md bg-muted/50 overflow-hidden">
        <div
          className="absolute inset-y-0 left-0 rounded-md transition-all duration-700 ease-out"
          style={{ width: `${widthPct}%`, backgroundColor: color, opacity: 0.8 }}
        />
        <div
          className="absolute inset-y-0 left-0 rounded-md transition-all duration-700 ease-out"
          style={{
            width: `${widthPct}%`,
            background: `linear-gradient(90deg, ${color}22, ${color}55)`,
          }}
        />
        {/* Value label inside bar if wide enough, else outside */}
        <span
          className="absolute top-1/2 -translate-y-1/2 text-[11px] font-semibold whitespace-nowrap"
          style={{
            left: widthPct > 30 ? `${widthPct - 2}%` : `${widthPct + 1}%`,
            transform: widthPct > 30
              ? "translate(-100%, -50%)"
              : "translate(0, -50%)",
            color: widthPct > 30 ? "white" : "var(--foreground)",
          }}
        >
          {isNeg ? "" : "+"}{formatNumber(value, 1)}%
        </span>
      </div>
    </div>
  );
}

function GrowthBarSection({
  title,
  aVal,
  bVal,
  industry,
  market,
  tickerA,
  tickerB,
  formatNumber,
}: {
  title: string;
  aVal: number;
  bVal: number;
  industry: number;
  market: number;
  tickerA: string;
  tickerB: string;
  formatNumber: (v: number, d?: number) => string;
}) {
  const maxVal = Math.max(
    Math.abs(aVal),
    Math.abs(bVal),
    Math.abs(industry),
    Math.abs(market),
    1,
  );

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <div className="w-1 h-4 rounded-full bg-muted-foreground/30" />
        <h4 className="text-[13px] font-semibold text-foreground tracking-wide">
          {title}
        </h4>
      </div>
      <div className="space-y-2">
        <GrowthBarRow label={tickerA} value={aVal} maxVal={maxVal} color="var(--brand)" formatNumber={formatNumber} />
        <GrowthBarRow label={tickerB} value={bVal} maxVal={maxVal} color="var(--compare-b)" formatNumber={formatNumber} />
        <GrowthBarRow label="Indústria" value={industry} maxVal={maxVal} color="#94A3B8" formatNumber={formatNumber} />
        <GrowthBarRow label="Mercado" value={market} maxVal={maxVal} color="#64748B" formatNumber={formatNumber} />
      </div>
    </div>
  );
}

/* ── Section 2: EPS Histórico + Projeção ─────────────────────────────────── */

function EpsAreaChart({
  company,
  side,
  formatNumber,
}: {
  company: CompareEnrichedCompany;
  side: "a" | "b";
  formatNumber: (v: number, d?: number) => string;
}) {
  const series = company.growthData.epsSeries;
  if (!series.length) {
    return (
      <div className="flex items-center justify-center h-40 text-[12px] text-muted-foreground">
        Dados indisponíveis
      </div>
    );
  }

  const values = series.map((s) => s.value);
  const minVal = Math.min(...values);
  const maxVal = Math.max(...values);
  const buffer = (maxVal - minVal) * 0.15 || 1;
  const yMin = minVal - buffer;
  const yMax = maxVal + buffer;
  const range = yMax - yMin;

  const svgW = 360;
  const svgH = 160;
  const padL = 36;
  const padR = 12;
  const padT = 16;
  const padB = 28;
  const plotW = svgW - padL - padR;
  const plotH = svgH - padT - padB;

  const lineColor = side === "a" ? "var(--brand)" : "var(--compare-b)";
  const fillColor = side === "a" ? "var(--brand-surface)" : "var(--compare-b-surface)";
  const gradientId = `eps-grad-${side}`;

  function toXY(i: number, val: number) {
    const x = padL + (i / Math.max(series.length - 1, 1)) * plotW;
    const y = padT + plotH - ((val - yMin) / range) * plotH;
    return { x, y };
  }

  // Find transition index
  const transitionIdx = series.findIndex((s) => s.type === "forecast");

  // Build polyline for all points
  const allPts = series.map((s, i) => toXY(i, s.value));
  const historicalPts = allPts.filter((_, i) => series[i].type === "historical");
  const forecastStartPts = transitionIdx > 0 ? [allPts[transitionIdx - 1]] : [];
  const forecastPts = [
    ...forecastStartPts,
    ...allPts.filter((_, i) => series[i].type === "forecast"),
  ];

  // Historical area fill path
  const histAreaPath = historicalPts.length > 1
    ? `M ${historicalPts[0].x},${padT + plotH} ` +
      historicalPts.map((p) => `L ${p.x},${p.y}`).join(" ") +
      ` L ${historicalPts[historicalPts.length - 1].x},${padT + plotH} Z`
    : "";

  // Historical line path
  const histLinePath = historicalPts.length > 1
    ? historicalPts.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x},${p.y}`).join(" ")
    : "";

  // Forecast line path
  const forecastLinePath = forecastPts.length > 1
    ? forecastPts.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x},${p.y}`).join(" ")
    : "";

  // Y-axis ticks
  const yTicks = 4;
  const yTickValues = Array.from({ length: yTicks + 1 }, (_, i) =>
    yMin + (range * i) / yTicks,
  );

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <div
          className="w-2.5 h-2.5 rounded-full"
          style={{ backgroundColor: lineColor }}
        />
        <span className="text-[12px] font-semibold text-foreground">
          {company.ticker}
        </span>
        <span className="text-[11px] text-muted-foreground">EPS (R$/ação)</span>
      </div>
      <svg
        viewBox={`0 0 ${svgW} ${svgH}`}
        className="w-full max-w-[380px] mx-auto"
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={lineColor} stopOpacity="0.25" />
            <stop offset="100%" stopColor={lineColor} stopOpacity="0.02" />
          </linearGradient>
        </defs>

        {/* Grid lines */}
        {yTickValues.map((v, i) => {
          const y = padT + plotH - ((v - yMin) / range) * plotH;
          return (
            <g key={`grid-${i}`}>
              <line
                x1={padL}
                y1={y}
                x2={svgW - padR}
                y2={y}
                stroke="var(--border)"
                strokeWidth="0.5"
                strokeDasharray="3 3"
                opacity="0.5"
              />
              <text
                x={padL - 4}
                y={y + 3}
                textAnchor="end"
                className="fill-muted-foreground"
                style={{ fontSize: 8 }}
              >
                {v.toFixed(1)}
              </text>
            </g>
          );
        })}

        {/* Historical area */}
        {histAreaPath && (
          <path d={histAreaPath} fill={`url(#${gradientId})`} />
        )}

        {/* Historical line */}
        {histLinePath && (
          <path
            d={histLinePath}
            fill="none"
            stroke={lineColor}
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )}

        {/* Transition marker */}
        {transitionIdx > 0 && (
          <line
            x1={allPts[transitionIdx - 1].x}
            y1={padT}
            x2={allPts[transitionIdx - 1].x}
            y2={padT + plotH}
            stroke="var(--border)"
            strokeWidth="1"
            strokeDasharray="4 2"
            opacity="0.6"
          />
        )}

        {/* Forecast line */}
        {forecastLinePath && (
          <path
            d={forecastLinePath}
            fill="none"
            stroke={lineColor}
            strokeWidth="2.5"
            strokeDasharray="6 4"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity="0.65"
          />
        )}

        {/* Data dots */}
        {series.map((s, i) => {
          const { x, y } = allPts[i];
          const isForecast = s.type === "forecast";
          return (
            <g key={`dot-${i}`}>
              {/* Hover ring */}
              <circle
                cx={x}
                cy={y}
                r="8"
                fill="transparent"
                className="cursor-pointer"
              />
              {/* Outer ring */}
              <circle
                cx={x}
                cy={y}
                r="4.5"
                fill="var(--card)"
                stroke={lineColor}
                strokeWidth="2"
                opacity={isForecast ? 0.55 : 1}
              />
              {/* Inner fill */}
              <circle
                cx={x}
                cy={y}
                r="2"
                fill={lineColor}
                opacity={isForecast ? 0.55 : 1}
              />
            </g>
          );
        })}

        {/* Year labels */}
        {series.map((s, i) => {
          const { x } = allPts[i];
          return (
            <text
              key={`yr-${i}`}
              x={x}
              y={svgH - 6}
              textAnchor="middle"
              className="fill-muted-foreground"
              style={{ fontSize: 8, fontWeight: s.type === "forecast" ? 600 : 400 }}
            >
              {s.year}
            </text>
          );
        })}

        {/* Legend labels */}
        {transitionIdx > 0 && (
          <>
            <text
              x={padL + 4}
              y={padT - 4}
              className="fill-muted-foreground"
              style={{ fontSize: 7 }}
            >
              Histórico
            </text>
            <text
              x={allPts[transitionIdx].x}
              y={padT - 4}
              className="fill-muted-foreground"
              style={{ fontSize: 7, fontStyle: "italic" }}
            >
              Projeção
            </text>
          </>
        )}
      </svg>
    </div>
  );
}

/* ── Section 3: Receita e Lucro Projetados ───────────────────────────────── */

function RevenueEarningsChart({
  company,
  side,
  formatNumber,
  visible,
}: {
  company: CompareEnrichedCompany;
  side: "a" | "b";
  formatNumber: (v: number, d?: number) => string;
  visible: GrowthSeriesVisibility;
}) {
  const revSeries = company.growthData.revenueSeries;
  const earnSeries = company.growthData.earningsSeries;
  const fclSeries = company.growthData.freeCashFlowSeries ?? [];
  const fcoSeries = company.growthData.operatingCashFlowSeries ?? [];

  if (!revSeries.length && !earnSeries.length) {
    return (
      <div className="flex items-center justify-center h-40 text-[12px] text-muted-foreground">
        Dados indisponíveis
      </div>
    );
  }

  // Merge years from all visible series
  const years = Array.from(
    new Set([
      ...revSeries.map((s) => s.year),
      ...earnSeries.map((s) => s.year),
      ...(visible.fcl ? fclSeries.map((s) => s.year) : []),
      ...(visible.fco ? fcoSeries.map((s) => s.year) : []),
    ]),
  ).sort();

  const revByYear = Object.fromEntries(revSeries.map((s) => [s.year, s]));
  const earnByYear = Object.fromEntries(earnSeries.map((s) => [s.year, s]));
  const fclByYear = Object.fromEntries(fclSeries.map((s) => [s.year, s]));
  const fcoByYear = Object.fromEntries(fcoSeries.map((s) => [s.year, s]));

  const allRevValues = visible.revenue ? revSeries.map((s) => s.value) : [];
  const allEarnValues = visible.earnings ? earnSeries.map((s) => s.value) : [];
  const allFclValues = visible.fcl ? fclSeries.map((s) => s.value) : [];
  const allFcoValues = visible.fco ? fcoSeries.map((s) => s.value) : [];
  const allValues = [...allRevValues, ...allEarnValues, ...allFclValues, ...allFcoValues];
  const dataMax = Math.max(...allValues, 1);
  const dataMin = Math.min(...allValues, 0);
  const yMax = dataMax * 1.15;
  const yMin = Math.min(dataMin * (dataMin < 0 ? 1.15 : 0.85), 0);
  const range = yMax - yMin || 1;

  const svgW = 360;
  const svgH = 180;
  const padL = 44;
  const padR = 12;
  const padT = 16;
  const padB = 28;
  const plotW = svgW - padL - padR;
  const plotH = svgH - padT - padB;

  const barColor = side === "a" ? "var(--brand)" : "var(--compare-b)";
  const lineColor = side === "a" ? "var(--brand)" : "var(--compare-b)";
  const fclColor = "#10B981"; // emerald
  const fcoColor = "#0EA5E9"; // sky
  const barWidth = Math.min(plotW / years.length * 0.55, 32);

  function toY(val: number) {
    return padT + plotH - ((val - yMin) / range) * plotH;
  }

  function toX(i: number) {
    return padL + (i + 0.5) / years.length * plotW;
  }

  const zeroY = toY(0);

  // Earnings line
  const earnPoints = years
    .map((yr, i) => {
      const e = earnByYear[yr];
      if (!e) return null;
      return { x: toX(i), y: toY(e.value), type: e.type };
    })
    .filter(Boolean) as { x: number; y: number; type: string }[];

  const earnLinePath = earnPoints
    .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x},${p.y}`)
    .join(" ");

  // FCL line
  const fclPoints = years
    .map((yr, i) => {
      const f = fclByYear[yr];
      if (!f) return null;
      return { x: toX(i), y: toY(f.value), type: f.type };
    })
    .filter(Boolean) as { x: number; y: number; type: string }[];
  const fclLinePath = fclPoints.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x},${p.y}`).join(" ");

  // FCO line
  const fcoPoints = years
    .map((yr, i) => {
      const f = fcoByYear[yr];
      if (!f) return null;
      return { x: toX(i), y: toY(f.value), type: f.type };
    })
    .filter(Boolean) as { x: number; y: number; type: string }[];
  const fcoLinePath = fcoPoints.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x},${p.y}`).join(" ");

  // Y ticks
  const yTicks = 4;
  const yTickVals = Array.from({ length: yTicks + 1 }, (_, i) =>
    yMin + (range * i) / yTicks,
  );

  // Format large numbers compactly
  function shortNum(v: number): string {
    const abs = Math.abs(v);
    if (abs >= 1e9) return (v / 1e9).toFixed(1) + "B";
    if (abs >= 1e6) return (v / 1e6).toFixed(1) + "M";
    if (abs >= 1e3) return (v / 1e3).toFixed(1) + "K";
    return v.toFixed(0);
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div
            className="w-2.5 h-2.5 rounded-full"
            style={{ backgroundColor: barColor }}
          />
          <span className="text-[12px] font-semibold text-foreground">
            {company.ticker}
          </span>
        </div>
        <div className="flex items-center flex-wrap gap-x-3 gap-y-1 text-[10px] text-muted-foreground">
          {visible.revenue && (
            <span className="flex items-center gap-1">
              <span
                className="inline-block w-3 h-3 rounded-[3px] opacity-35"
                style={{ backgroundColor: barColor }}
              />
              Receita
            </span>
          )}
          {visible.earnings && (
            <span className="flex items-center gap-1">
              <span
                className="inline-block w-4 h-0.5 rounded"
                style={{ backgroundColor: lineColor }}
              />
              Lucro
            </span>
          )}
          {visible.fcl && fclSeries.length > 0 && (
            <span className="flex items-center gap-1">
              <span
                className="inline-block w-4 h-0.5 rounded"
                style={{ backgroundColor: fclColor }}
              />
              FCL
            </span>
          )}
          {visible.fco && fcoSeries.length > 0 && (
            <span className="flex items-center gap-1">
              <span
                className="inline-block w-4 h-0.5 rounded"
                style={{ backgroundColor: fcoColor }}
              />
              FCO
            </span>
          )}
        </div>
      </div>
      <svg
        viewBox={`0 0 ${svgW} ${svgH}`}
        className="w-full max-w-[380px] mx-auto"
        preserveAspectRatio="xMidYMid meet"
      >
        {/* Grid lines */}
        {yTickVals.map((v, i) => {
          const y = toY(v);
          return (
            <g key={`rg-${i}`}>
              <line
                x1={padL}
                y1={y}
                x2={svgW - padR}
                y2={y}
                stroke="var(--border)"
                strokeWidth="0.5"
                strokeDasharray="3 3"
                opacity="0.4"
              />
              <text
                x={padL - 4}
                y={y + 3}
                textAnchor="end"
                className="fill-muted-foreground"
                style={{ fontSize: 7 }}
              >
                {shortNum(v)}
              </text>
            </g>
          );
        })}

        {/* Zero line */}
        <line
          x1={padL}
          y1={zeroY}
          x2={svgW - padR}
          y2={zeroY}
          stroke="var(--border)"
          strokeWidth="0.8"
          opacity="0.6"
        />

        {/* Revenue bars */}
        {visible.revenue && years.map((yr, i) => {
          const r = revByYear[yr];
          if (!r) return null;
          const x = toX(i) - barWidth / 2;
          const y = toY(r.value);
          const barH = Math.abs(y - zeroY);
          const isForecast = r.type === "forecast";

          return (
            <g key={`bar-${yr}`}>
              <rect
                x={x}
                y={Math.min(y, zeroY)}
                width={barWidth}
                height={Math.max(barH, 1)}
                rx={3}
                fill={barColor}
                opacity={isForecast ? 0.2 : 0.3}
              />
              {isForecast && (
                <rect
                  x={x}
                  y={Math.min(y, zeroY)}
                  width={barWidth}
                  height={Math.max(barH, 1)}
                  rx={3}
                  fill="none"
                  stroke={barColor}
                  strokeWidth="1"
                  strokeDasharray="3 2"
                  opacity="0.5"
                />
              )}
            </g>
          );
        })}

        {/* FCL line (behind main line) */}
        {visible.fcl && fclLinePath && (
          <>
            <path
              d={fclLinePath}
              fill="none"
              stroke={fclColor}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeDasharray="4 3"
              opacity="0.85"
            />
            {fclPoints.map((p, i) => (
              <circle
                key={`fcl-${i}`}
                cx={p.x}
                cy={p.y}
                r="2.5"
                fill="var(--card)"
                stroke={fclColor}
                strokeWidth="1.5"
                opacity={p.type === "forecast" ? 0.6 : 1}
              />
            ))}
          </>
        )}

        {/* FCO line */}
        {visible.fco && fcoLinePath && (
          <>
            <path
              d={fcoLinePath}
              fill="none"
              stroke={fcoColor}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeDasharray="2 2"
              opacity="0.85"
            />
            {fcoPoints.map((p, i) => (
              <circle
                key={`fco-${i}`}
                cx={p.x}
                cy={p.y}
                r="2.5"
                fill="var(--card)"
                stroke={fcoColor}
                strokeWidth="1.5"
                opacity={p.type === "forecast" ? 0.6 : 1}
              />
            ))}
          </>
        )}

        {/* Earnings line */}
        {visible.earnings && earnLinePath && (
          <path
            d={earnLinePath}
            fill="none"
            stroke={lineColor}
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )}

        {/* Earnings dots */}
        {visible.earnings && earnPoints.map((p, i) => (
          <circle
            key={`ed-${i}`}
            cx={p.x}
            cy={p.y}
            r="3.5"
            fill="var(--card)"
            stroke={lineColor}
            strokeWidth="2"
            opacity={p.type === "forecast" ? 0.6 : 1}
          />
        ))}

        {/* Year labels */}
        {years.map((yr, i) => (
          <text
            key={`yr-${i}`}
            x={toX(i)}
            y={svgH - 6}
            textAnchor="middle"
            className="fill-muted-foreground"
            style={{ fontSize: 8 }}
          >
            {yr}
          </text>
        ))}
      </svg>
    </div>
  );
}

/* ── Section 4: ROE Futuro (Semi-circular gauge) ─────────────────────────── */

function ROEGauge({
  company,
  side,
  industryROE,
  formatNumber,
}: {
  company: CompareEnrichedCompany;
  side: "a" | "b";
  industryROE: number;
  formatNumber: (v: number, d?: number) => string;
}) {
  const roe = company.growthData.futureROE;
  const gaugeMin = 0;
  const gaugeMax = 40;
  const cx = 120;
  const cy = 110;
  const radius = 85;
  const strokeW = 14;

  const mainColor = side === "a" ? "var(--brand)" : "var(--compare-b)";

  // Angle mapping: 180deg = left to right (PI to 0)
  function valueToAngle(v: number): number {
    const clamped = clamp(v, gaugeMin, gaugeMax);
    const ratio = (clamped - gaugeMin) / (gaugeMax - gaugeMin);
    return Math.PI * (1 - ratio); // PI (left) -> 0 (right)
  }

  function polarToXY(angle: number, r: number) {
    return {
      x: cx + r * Math.cos(angle),
      y: cy - r * Math.sin(angle),
    };
  }

  function describeArc(startAngle: number, endAngle: number, r: number) {
    const start = polarToXY(startAngle, r);
    const end = polarToXY(endAngle, r);
    const largeArc = Math.abs(startAngle - endAngle) > Math.PI ? 1 : 0;
    // Arc goes clockwise in SVG (decreasing angle from left to right)
    return `M ${start.x},${start.y} A ${r},${r} 0 ${largeArc} 1 ${end.x},${end.y}`;
  }

  // Colored segments: red (0-10), yellow (10-20), green (20-40)
  const segments = [
    { from: 0, to: 10, color: "#EF4444" },
    { from: 10, to: 20, color: "#EAB308" },
    { from: 20, to: 40, color: "#22C55E" },
  ];

  // Needle for company value
  const needleAngle = valueToAngle(roe);
  const needleTip = polarToXY(needleAngle, radius - strokeW / 2 - 6);
  const needleBase1 = polarToXY(needleAngle + 0.08, 10);
  const needleBase2 = polarToXY(needleAngle - 0.08, 10);

  // Industry marker
  const indAngle = valueToAngle(industryROE);
  const indOuter = polarToXY(indAngle, radius + 4);
  const indInner = polarToXY(indAngle, radius - strokeW - 4);

  // Scale labels
  const scaleLabels = [0, 10, 20, 30, 40];

  return (
    <div className="space-y-1">
      <div className="flex items-center gap-2">
        <div
          className="w-2.5 h-2.5 rounded-full"
          style={{ backgroundColor: mainColor }}
        />
        <span className="text-[12px] font-semibold text-foreground">
          {company.ticker}
        </span>
        <span className="text-[11px] text-muted-foreground">ROE Futuro</span>
      </div>

      <svg
        viewBox="0 0 240 140"
        className="w-full max-w-[280px] mx-auto"
        preserveAspectRatio="xMidYMid meet"
      >
        {/* Background arc (track) */}
        <path
          d={describeArc(Math.PI, 0, radius)}
          fill="none"
          stroke="var(--border)"
          strokeWidth={strokeW}
          strokeLinecap="round"
          opacity="0.3"
        />

        {/* Colored segments */}
        {segments.map((seg, i) => {
          const startA = valueToAngle(seg.from);
          const endA = valueToAngle(seg.to);
          return (
            <path
              key={`seg-${i}`}
              d={describeArc(startA, endA, radius)}
              fill="none"
              stroke={seg.color}
              strokeWidth={strokeW}
              strokeLinecap={i === 0 ? "round" : i === segments.length - 1 ? "round" : "butt"}
              opacity="0.35"
            />
          );
        })}

        {/* Active arc from 0 to ROE value */}
        {roe > 0 && (
          <path
            d={describeArc(valueToAngle(0), valueToAngle(Math.min(roe, gaugeMax)), radius)}
            fill="none"
            stroke={mainColor}
            strokeWidth={strokeW}
            strokeLinecap="round"
            opacity="0.85"
          />
        )}

        {/* Needle */}
        <polygon
          points={`${needleTip.x},${needleTip.y} ${needleBase1.x},${needleBase1.y} ${needleBase2.x},${needleBase2.y}`}
          fill={mainColor}
          opacity="0.9"
        />
        <circle cx={cx} cy={cy} r="6" fill={mainColor} opacity="0.9" />
        <circle cx={cx} cy={cy} r="3" fill="var(--card)" />

        {/* Industry marker */}
        <line
          x1={indOuter.x}
          y1={indOuter.y}
          x2={indInner.x}
          y2={indInner.y}
          stroke="#64748B"
          strokeWidth="2.5"
          strokeLinecap="round"
          opacity="0.8"
        />

        {/* Scale labels */}
        {scaleLabels.map((v) => {
          const angle = valueToAngle(v);
          const pos = polarToXY(angle, radius + 16);
          return (
            <text
              key={`sc-${v}`}
              x={pos.x}
              y={pos.y + 3}
              textAnchor="middle"
              className="fill-muted-foreground"
              style={{ fontSize: 7 }}
            >
              {v}%
            </text>
          );
        })}

        {/* Value text */}
        <text
          x={cx}
          y={cy + 2}
          textAnchor="middle"
          className="fill-foreground"
          style={{ fontSize: 18, fontWeight: 700 }}
        >
          {formatNumber(roe, 1)}%
        </text>
      </svg>

      {/* Legend below gauge */}
      <div className="flex items-center justify-center gap-4 text-[10px] text-muted-foreground">
        <span className="flex items-center gap-1">
          <span className="inline-block w-2 h-2 rounded-full" style={{ backgroundColor: mainColor }} />
          {company.ticker}
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block w-3 h-0.5 rounded bg-slate-500" />
          Indústria ({formatNumber(industryROE, 1)}%)
        </span>
      </div>
    </div>
  );
}

/* ── Main Component ───────────────────────────────────────────────────────── */

export function GrowthIsland({ a, b, formatNumber }: GrowthIslandProps) {
  const [growthVisible, setGrowthVisible] = useState<GrowthSeriesVisibility>({
    revenue: true,
    earnings: true,
    fcl: true,
    fco: false,
  });
  const hasFclData =
    (a.growthData.freeCashFlowSeries?.length ?? 0) > 0 ||
    (b.growthData.freeCashFlowSeries?.length ?? 0) > 0;
  const hasFcoData =
    (a.growthData.operatingCashFlowSeries?.length ?? 0) > 0 ||
    (b.growthData.operatingCashFlowSeries?.length ?? 0) > 0;
  function toggleSeries(k: GrowthSeriesKey) {
    setGrowthVisible((prev) => ({ ...prev, [k]: !prev[k] }));
  }
  return (
    <div className="space-y-8">
      <h3 className="text-base font-semibold text-foreground">Crescimento Futuro</h3>

      <CompareReadingCard
        a={a.readings.future}
        b={b.readings.future}
        tickerA={a.ticker}
        tickerB={b.ticker}
        dimension="future"
      />

      <CompareDimensionCheckCard
        a={a.dimensionChecks.future}
        b={b.dimensionChecks.future}
        tickerA={a.ticker}
        tickerB={b.ticker}
      />

      <CompareSectionCriteria
        a={a.growthData.analystForecastCriteria ?? []}
        b={b.growthData.analystForecastCriteria ?? []}
        tickerA={a.ticker}
        tickerB={b.ticker}
        title="Criterios de previsao de analistas"
      />

      {/* ── Section 1: Crescimento de Lucro vs Receita ── */}
      <div>
        <h4 className="text-[13px] font-semibold text-foreground mb-4 flex items-center gap-2">
          <svg viewBox="0 0 16 16" className="w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M2 14 L6 6 L10 9 L14 2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Crescimento de Lucro vs Receita
        </h4>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <GrowthBarSection
            title="Lucro"
            aVal={a.growthData.earningsGrowth}
            bVal={b.growthData.earningsGrowth}
            industry={a.growthData.industryEarningsGrowth}
            market={a.growthData.marketEarningsGrowth}
            tickerA={a.ticker}
            tickerB={b.ticker}
            formatNumber={formatNumber}
          />
          <GrowthBarSection
            title="Receita"
            aVal={a.growthData.revenueGrowth}
            bVal={b.growthData.revenueGrowth}
            industry={a.growthData.industryRevenueGrowth}
            market={a.growthData.marketRevenueGrowth}
            tickerA={a.ticker}
            tickerB={b.ticker}
            formatNumber={formatNumber}
          />
        </div>
      </div>

      {/* ── Section 2: EPS Histórico + Projeção ── */}
      <div>
        <h4 className="text-[13px] font-semibold text-foreground mb-4 flex items-center gap-2">
          <svg viewBox="0 0 16 16" className="w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" strokeWidth="1.5">
            <rect x="1" y="3" width="14" height="10" rx="1.5" />
            <path d="M1 8 L5 5 L9 7 L15 3" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          EPS Histórico + Projeção
        </h4>
        <div className="compare-side-grid">
          <EpsAreaChart company={a} side="a" formatNumber={formatNumber} />
          <EpsAreaChart company={b} side="b" formatNumber={formatNumber} />
        </div>
      </div>

      {/* ── Section 3: Receita e Lucro Projetados ── */}
      <div>
        <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
          <h4 className="text-[13px] font-semibold text-foreground flex items-center gap-2">
            <svg viewBox="0 0 16 16" className="w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" strokeWidth="1.5">
              <rect x="2" y="8" width="3" height="6" rx="0.5" />
              <rect x="6.5" y="5" width="3" height="9" rx="0.5" />
              <rect x="11" y="2" width="3" height="12" rx="0.5" />
            </svg>
            Receita, Lucro e Fluxo de Caixa Projetados
          </h4>
          <div className="flex items-center gap-1 text-[10px]">
            {(
              [
                { k: "revenue" as const, label: "Receita", enabled: true },
                { k: "earnings" as const, label: "Lucro", enabled: true },
                { k: "fcl" as const, label: "FCL", enabled: hasFclData },
                { k: "fco" as const, label: "FCO", enabled: hasFcoData },
              ] as const
            )
              .filter((item) => item.enabled)
              .map((item) => (
                <button
                  key={item.k}
                  type="button"
                  onClick={() => toggleSeries(item.k)}
                  className={`px-2 py-0.5 rounded border transition-colors ${
                    growthVisible[item.k]
                      ? "bg-foreground text-background border-foreground"
                      : "bg-transparent text-muted-foreground border-border hover:text-foreground"
                  }`}
                >
                  {item.label}
                </button>
              ))}
          </div>
        </div>
        <div className="compare-side-grid">
          <RevenueEarningsChart company={a} side="a" formatNumber={formatNumber} visible={growthVisible} />
          <RevenueEarningsChart company={b} side="b" formatNumber={formatNumber} visible={growthVisible} />
        </div>
      </div>

      {/* ── Section 4: ROE Futuro ── */}
      <div>
        <h4 className="text-[13px] font-semibold text-foreground mb-4 flex items-center gap-2">
          <svg viewBox="0 0 16 16" className="w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" strokeWidth="1.5">
            <circle cx="8" cy="8" r="6" />
            <path d="M8 8 L8 4" strokeLinecap="round" />
            <path d="M8 8 L11 10" strokeLinecap="round" />
          </svg>
          ROE Futuro
        </h4>
        <div className="compare-side-grid">
          <ROEGauge
            company={a}
            side="a"
            industryROE={a.growthData.futureROEIndustry}
            formatNumber={formatNumber}
          />
          <ROEGauge
            company={b}
            side="b"
            industryROE={b.growthData.futureROEIndustry}
            formatNumber={formatNumber}
          />
        </div>
      </div>

      {/* ── Section 5: Informacoes-chave ── */}
      <div>
        <h4 className="text-[13px] font-semibold text-foreground mb-4">
          Informacoes-chave
        </h4>
        <KeyInformationCard a={a} b={b} formatNumber={formatNumber} />
      </div>
    </div>
  );
}

/* ── KeyInformationCard ───────────────────────────────────────────────────── */

function KeyInformationCard({
  a,
  b,
  formatNumber,
}: {
  a: CompareEnrichedCompany;
  b: CompareEnrichedCompany;
  formatNumber: (v: number, d?: number) => string;
}) {
  const lastEpsA = a.growthData.epsSeries[a.growthData.epsSeries.length - 1]?.value ?? 0;
  const lastEpsB = b.growthData.epsSeries[b.growthData.epsSeries.length - 1]?.value ?? 0;
  const lastEarnA =
    a.growthData.earningsSeries[a.growthData.earningsSeries.length - 1]?.value ?? 0;
  const lastEarnB =
    b.growthData.earningsSeries[b.growthData.earningsSeries.length - 1]?.value ?? 0;
  const lastRevA =
    a.growthData.revenueSeries[a.growthData.revenueSeries.length - 1]?.value ?? 0;
  const lastRevB =
    b.growthData.revenueSeries[b.growthData.revenueSeries.length - 1]?.value ?? 0;

  const rows: { label: string; aVal: string; bVal: string }[] = [
    { label: "Lucro projetado", aVal: formatNumber(lastEarnA, 0), bVal: formatNumber(lastEarnB, 0) },
    { label: "Receita projetada", aVal: formatNumber(lastRevA, 0), bVal: formatNumber(lastRevB, 0) },
    { label: "Cresc. lucro mercado", aVal: `${formatNumber(a.growthData.marketEarningsGrowth, 1)}%`, bVal: `${formatNumber(b.growthData.marketEarningsGrowth, 1)}%` },
    { label: "Cresc. receita mercado", aVal: `${formatNumber(a.growthData.marketRevenueGrowth, 1)}%`, bVal: `${formatNumber(b.growthData.marketRevenueGrowth, 1)}%` },
    { label: "ROE esperado", aVal: `${formatNumber(a.growthData.futureROE, 1)}%`, bVal: `${formatNumber(b.growthData.futureROE, 1)}%` },
    { label: "LPA projetado", aVal: formatNumber(lastEpsA, 2), bVal: formatNumber(lastEpsB, 2) },
    {
      label: "Cobertura analistas",
      aVal: a.growthData.analystCoverage ?? "—",
      bVal: b.growthData.analystCoverage ?? "—",
    },
    {
      label: "Ultima atualizacao",
      aVal: a.growthData.lastUpdated ?? a.updatedAt,
      bVal: b.growthData.lastUpdated ?? b.updatedAt,
    },
  ];

  return (
    <div className="rounded-2xl border border-border bg-card overflow-hidden">
      <div className="grid grid-cols-[1fr_1.4fr_1fr] gap-0 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground bg-muted/50 px-4 py-2.5">
        <span className="text-center">{a.ticker}</span>
        <span className="text-center">Metrica</span>
        <span className="text-center">{b.ticker}</span>
      </div>
      {rows.map((row, i) => (
        <div
          key={row.label}
          className={`grid grid-cols-[1fr_1.4fr_1fr] gap-0 px-4 py-2 text-[12px] items-center ${
            i % 2 === 0 ? "" : "bg-muted/20"
          }`}
        >
          <span className="text-center font-semibold text-brand-text">{row.aVal}</span>
          <span className="text-center text-xs text-muted-foreground">{row.label}</span>
          <span className="text-center font-semibold text-compare-b-text">{row.bVal}</span>
        </div>
      ))}
    </div>
  );
}

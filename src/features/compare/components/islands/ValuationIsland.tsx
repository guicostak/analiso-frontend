"use client";

import { useMemo, useState } from "react";
import type { CompareEnrichedCompany } from "../../interfaces";
import { CompareReadingCard } from "../shared/CompareReadingCard";
import { CompareDimensionCheckCard } from "../shared/CompareDimensionCheckCard";

/* ── Types ────────────────────────────────────────────────────────────────── */

interface ValuationIslandProps {
  a: CompareEnrichedCompany;
  b: CompareEnrichedCompany;
  formatNumber: (value: number, digits?: number) => string;
}

type Side = "a" | "b";

/* ── Helpers ──────────────────────────────────────────────────────────────── */

function sideColor(side: Side) {
  return side === "a" ? "var(--brand)" : "var(--compare-b)";
}

function sideSurface(side: Side) {
  return side === "a" ? "var(--brand-surface)" : "var(--compare-b-surface)";
}

function sideBorderClass(side: Side) {
  return side === "a" ? "border-brand-border" : "border-compare-b-border";
}

function sideTextClass(side: Side) {
  return side === "a" ? "text-brand-text" : "text-compare-b-text";
}

function clamp(v: number, min: number, max: number) {
  return Math.max(min, Math.min(max, v));
}

/* ── 1. Preco vs Valor Justo ─────────────────────────────────────────────── */

function FairValueBar({
  company,
  formatNumber,
  side,
}: {
  company: CompareEnrichedCompany;
  formatNumber: (v: number, d?: number) => string;
  side: Side;
}) {
  const { valuation } = company;
  const isBelowFair = valuation.currentPrice <= valuation.fairValue;

  const minVal = Math.min(valuation.currentPrice, valuation.fairValue) * 0.8;
  const maxVal = Math.max(valuation.currentPrice, valuation.fairValue) * 1.2;
  const range = maxVal - minVal || 1;

  const pricePct = clamp(((valuation.currentPrice - minVal) / range) * 100, 2, 98);
  const fairPct = clamp(((valuation.fairValue - minVal) / range) * 100, 2, 98);

  return (
    <div className={`rounded-2xl border ${sideBorderClass(side)} bg-card p-4 space-y-3`}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-foreground">{company.ticker}</span>
        <span className="inline-flex items-center rounded-full border border-border bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
          {valuation.model}
        </span>
      </div>

      {/* Bar */}
      <div className="relative h-10 w-full rounded-lg bg-muted overflow-hidden">
        {/* Gradient background: danger (left) → neutral → success (right) */}
        <div
          className="absolute inset-0 rounded-lg"
          style={{
            background:
              "linear-gradient(90deg, rgba(239,68,68,0.18) 0%, rgba(148,163,184,0.12) 50%, rgba(34,197,94,0.18) 100%)",
          }}
        />
        {/* Colored fill from left to price position */}
        <div
          className="absolute inset-y-0 left-0 rounded-lg"
          style={{
            width: `${pricePct}%`,
            backgroundColor: isBelowFair
              ? "var(--color-success)"
              : "var(--color-danger)",
            opacity: 0.18,
          }}
        />
        {/* Fair value marker */}
        <div
          className="absolute top-0 bottom-0 w-0.5 bg-muted-foreground/50"
          style={{ left: `${fairPct}%` }}
        />
        <span
          className="absolute -top-5 text-[9px] font-medium text-muted-foreground -translate-x-1/2 whitespace-nowrap"
          style={{ left: `${fairPct}%` }}
        >
          Justo: R$ {formatNumber(valuation.fairValue, 2)}
        </span>

        {/* Current price dot */}
        <div
          className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-4 h-4 rounded-full border-2 border-white shadow-md"
          style={{ left: `${pricePct}%`, backgroundColor: sideColor(side) }}
        />
      </div>

      {/* Labels */}
      <div className="flex items-center justify-between mt-1">
        <div>
          <p className="text-[10px] text-muted-foreground">Preco atual</p>
          <p className="text-sm font-semibold text-foreground">
            R$ {formatNumber(valuation.currentPrice, 2)}
          </p>
        </div>
        <div
          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold ${
            isBelowFair
              ? "bg-success-surface text-success-text border border-success-border"
              : "bg-danger-surface text-danger-text border border-danger-border"
          }`}
        >
          {isBelowFair ? "▼" : "▲"} {formatNumber(Math.abs(valuation.discountPercent), 1)}%
          {isBelowFair ? " abaixo" : " acima"}
        </div>
      </div>
    </div>
  );
}

/* ── 2. Multiplos Comparados ─────────────────────────────────────────────── */

type MultipleRowDef = {
  label: string;
  keyA: number;
  keyB: number;
  industry: number;
  direction: "lower-better" | "higher-better";
};

function MultiplesTable({
  a,
  b,
  rows,
  formatNumber,
}: {
  a: CompareEnrichedCompany;
  b: CompareEnrichedCompany;
  rows: MultipleRowDef[];
  formatNumber: (v: number, d?: number) => string;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card overflow-hidden">
      {/* Header */}
      <div className="grid grid-cols-4 gap-0 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground bg-muted/50 px-4 py-2.5">
        <span className="text-center">{a.ticker}</span>
        <span className="text-center">Multiplo</span>
        <span className="text-center">{b.ticker}</span>
        <span className="text-center">Industria</span>
      </div>

      {rows.map((row, i) => {
        const aWins =
          row.direction === "lower-better"
            ? row.keyA < row.keyB
            : row.keyA > row.keyB;
        const bWins = !aWins && row.keyA !== row.keyB;

        return (
          <div
            key={row.label}
            className={`grid grid-cols-4 gap-0 px-4 py-3 text-sm items-center ${
              i % 2 === 0 ? "" : "bg-muted/20"
            }`}
          >
            {/* Company A */}
            <span
              className="text-center font-semibold rounded-lg py-1 mx-1"
              style={{
                backgroundColor: aWins ? "var(--brand-surface)" : undefined,
                color: aWins ? undefined : undefined,
              }}
            >
              <span className={aWins ? "text-brand-text" : "text-foreground"}>
                {formatNumber(row.keyA, 1)}x
              </span>
            </span>

            {/* Label */}
            <span className="text-center text-xs font-medium text-muted-foreground">
              {row.label}
            </span>

            {/* Company B */}
            <span
              className="text-center font-semibold rounded-lg py-1 mx-1"
              style={{
                backgroundColor: bWins ? "var(--compare-b-surface)" : undefined,
              }}
            >
              <span className={bWins ? "text-compare-b-text" : "text-foreground"}>
                {formatNumber(row.keyB, 1)}x
              </span>
            </span>

            {/* Industry */}
            <span className="text-center text-xs text-muted-foreground">
              {formatNumber(row.industry, 1)}x
            </span>
          </div>
        );
      })}
    </div>
  );
}

/* ── 3. Cenarios de Preco ────────────────────────────────────────────────── */

function PriceScenarioScale({
  company,
  formatNumber,
  side,
}: {
  company: CompareEnrichedCompany;
  formatNumber: (v: number, d?: number) => string;
  side: Side;
}) {
  const scenarios = company.priceScenarios;
  if (!scenarios.length) return null;

  const sorted = [...scenarios].sort((a, b) => a.value - b.value);
  const currentPrice = company.valuation.currentPrice;
  const allValues = [...sorted.map((s) => s.value), currentPrice];
  const minV = Math.min(...allValues);
  const maxV = Math.max(...allValues);
  const range = maxV - minV || 1;
  const color = sideColor(side);

  const svgH = 220;
  const trackTop = 20;
  const trackBottom = svgH - 20;
  const trackH = trackBottom - trackTop;

  function yPos(value: number) {
    // Invert: higher price = higher on the chart (lower y)
    return trackBottom - ((value - minV) / range) * trackH;
  }

  const priceLine = yPos(currentPrice);

  return (
    <div className={`rounded-2xl border ${sideBorderClass(side)} bg-card p-4 space-y-2`}>
      <span className="text-xs font-semibold text-foreground">{company.ticker}</span>

      <svg width="100%" viewBox={`0 0 240 ${svgH}`} className="overflow-visible max-w-[300px] mx-auto">
        {/* Vertical track */}
        <line
          x1="60" y1={trackTop} x2="60" y2={trackBottom}
          stroke="currentColor" strokeOpacity={0.15} strokeWidth={2}
        />

        {/* Current price reference line */}
        <line
          x1="30" y1={priceLine} x2="200" y2={priceLine}
          stroke="currentColor" strokeOpacity={0.3} strokeWidth={1}
          strokeDasharray="4,3"
        />
        <text
          x="205" y={priceLine + 3}
          fontSize={9} fill="currentColor" opacity={0.5}
        >
          Atual
        </text>
        <text
          x="205" y={priceLine + 14}
          fontSize={9} fill="currentColor" opacity={0.5}
        >
          R$ {formatNumber(currentPrice, 2)}
        </text>

        {/* Scenario dots */}
        {sorted.map((s, i) => {
          const y = yPos(s.value);
          const isPositive = s.gapPercent >= 0;
          return (
            <g key={s.key}>
              {/* Connecting line to label */}
              <line
                x1="60" y1={y} x2="90" y2={y}
                stroke={color} strokeWidth={1} strokeOpacity={0.4}
              />
              {/* Dot */}
              <circle cx={60} cy={y} r={6} fill={color} />
              <circle cx={60} cy={y} r={3} fill="white" />
              {/* Label */}
              <text x="96" y={y - 5} fontSize={10} fontWeight={600} fill="currentColor">
                R$ {formatNumber(s.value, 2)}
              </text>
              <text x="96" y={y + 8} fontSize={9} fill="currentColor" opacity={0.6}>
                {s.label} ({isPositive ? "+" : ""}{formatNumber(s.gapPercent, 1)}%)
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

/* ── 4. Sensibilidade DCF ────────────────────────────────────────────────── */

function DCFHeatmap({
  company,
  formatNumber,
  side,
}: {
  company: CompareEnrichedCompany;
  formatNumber: (v: number, d?: number) => string;
  side: Side;
}) {
  const cells = company.dcfSensitivity;
  if (!cells.length) return null;

  const { waccSet, growthSet, grid, minFV, maxFV } = useMemo(() => {
    const waccVals = [...new Set(cells.map((c) => c.wacc))].sort((a, b) => a - b);
    const growthVals = [...new Set(cells.map((c) => c.terminalGrowth))].sort((a, b) => a - b);

    const g = new Map<string, number>();
    let lo = Infinity;
    let hi = -Infinity;
    for (const c of cells) {
      const key = `${c.wacc}-${c.terminalGrowth}`;
      g.set(key, c.fairValue);
      if (c.fairValue < lo) lo = c.fairValue;
      if (c.fairValue > hi) hi = c.fairValue;
    }
    return { waccSet: waccVals, growthSet: growthVals, grid: g, minFV: lo, maxFV: hi };
  }, [cells]);

  const fvRange = maxFV - minFV || 1;

  const actualWacc = company.valuation.discountRate;
  const actualGrowth = company.valuation.terminalGrowthRate;

  function cellColor(fv: number): string {
    const t = (fv - minFV) / fvRange;
    // Green for high fair value, red for low
    const r = Math.round(220 - t * 170);
    const g = Math.round(60 + t * 170);
    const b = Math.round(60);
    return `rgb(${r}, ${g}, ${b})`;
  }

  function isHighlighted(wacc: number, growth: number): boolean {
    return (
      Math.abs(wacc - actualWacc) < 0.005 &&
      Math.abs(growth - actualGrowth) < 0.005
    );
  }

  return (
    <div className={`rounded-2xl border ${sideBorderClass(side)} bg-card p-4 space-y-3`}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-foreground">{company.ticker}</span>
        <span className="text-[10px] text-muted-foreground">
          WACC: {formatNumber(actualWacc * 100, 1)}% | g: {formatNumber(actualGrowth * 100, 1)}%
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-[10px]">
          <thead>
            <tr>
              <th className="py-1 px-1 text-muted-foreground font-medium text-left">
                WACC \ g
              </th>
              {growthSet.map((g) => (
                <th key={g} className="py-1 px-1 text-center text-muted-foreground font-medium">
                  {formatNumber(g * 100, 1)}%
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {waccSet.map((w) => (
              <tr key={w}>
                <td className="py-1 px-1 text-muted-foreground font-medium whitespace-nowrap">
                  {formatNumber(w * 100, 1)}%
                </td>
                {growthSet.map((g) => {
                  const fv = grid.get(`${w}-${g}`) ?? 0;
                  const highlighted = isHighlighted(w, g);
                  return (
                    <td
                      key={`${w}-${g}`}
                      className={`py-1.5 px-1 text-center font-semibold rounded ${
                        highlighted ? "ring-2 ring-foreground" : ""
                      }`}
                      style={{
                        backgroundColor: cellColor(fv),
                        color: "white",
                        textShadow: "0 1px 2px rgba(0,0,0,0.5)",
                      }}
                    >
                      {formatNumber(fv, 0)}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center gap-2 text-[9px] text-muted-foreground">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded" style={{ backgroundColor: cellColor(minFV) }} />
          <span>Menor</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded" style={{ backgroundColor: cellColor(maxFV) }} />
          <span>Maior</span>
        </div>
        <span className="ml-auto">■ = parametros atuais</span>
      </div>
    </div>
  );
}

/* ── 5. Tendencia Historica P/L ──────────────────────────────────────────── */

function PLTrendChart({
  company,
  formatNumber,
  side,
}: {
  company: CompareEnrichedCompany;
  formatNumber: (v: number, d?: number) => string;
  side: Side;
}) {
  const plTrend = company.ratioTrends.find((t) => t.metric === "P/L");
  if (!plTrend || !plTrend.series.length) return null;

  const series = plTrend.series;
  const color = sideColor(side);

  const svgW = 280;
  const svgH = 140;
  const padL = 35;
  const padR = 10;
  const padT = 15;
  const padB = 25;
  const plotW = svgW - padL - padR;
  const plotH = svgH - padT - padB;

  const allVals = series.flatMap((s) => [s.company, s.industry]);
  const minV = Math.min(...allVals) * 0.9;
  const maxV = Math.max(...allVals) * 1.1;
  const valRange = maxV - minV || 1;
  const n = series.length;

  function x(i: number) {
    return padL + (n === 1 ? plotW / 2 : (i / (n - 1)) * plotW);
  }

  function y(v: number) {
    return padT + plotH - ((v - minV) / valRange) * plotH;
  }

  const companyPath = series
    .map((s, i) => `${i === 0 ? "M" : "L"} ${x(i)} ${y(s.company)}`)
    .join(" ");

  const industryPath = series
    .map((s, i) => `${i === 0 ? "M" : "L"} ${x(i)} ${y(s.industry)}`)
    .join(" ");

  return (
    <div className={`rounded-2xl border ${sideBorderClass(side)} bg-card p-4 space-y-2`}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-foreground">{company.ticker}</span>
        <div className="flex items-center gap-3 text-[9px] text-muted-foreground">
          <span className="flex items-center gap-1">
            <span
              className="inline-block w-3 h-0.5 rounded"
              style={{ backgroundColor: color }}
            />
            Empresa
          </span>
          <span className="flex items-center gap-1">
            <span className="inline-block w-3 h-0.5 rounded bg-muted-foreground/40 border-dashed" />
            Industria
          </span>
        </div>
      </div>

      <svg width="100%" viewBox={`0 0 ${svgW} ${svgH}`} className="overflow-visible max-w-[340px] mx-auto">
        {/* Grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((t) => {
          const yy = padT + plotH * (1 - t);
          const val = minV + valRange * t;
          return (
            <g key={t}>
              <line
                x1={padL} y1={yy} x2={svgW - padR} y2={yy}
                stroke="currentColor" strokeOpacity={0.07} strokeWidth={1}
              />
              <text
                x={padL - 4} y={yy + 3}
                fontSize={8} fill="currentColor" opacity={0.4} textAnchor="end"
              >
                {formatNumber(val, 0)}
              </text>
            </g>
          );
        })}

        {/* Industry line (dashed, behind) */}
        <path
          d={industryPath}
          fill="none"
          stroke="currentColor"
          strokeOpacity={0.3}
          strokeWidth={1.5}
          strokeDasharray="4,3"
        />

        {/* Company line */}
        <path
          d={companyPath}
          fill="none"
          stroke={color}
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Company dots */}
        {series.map((s, i) => (
          <circle
            key={`dot-${i}`}
            cx={x(i)} cy={y(s.company)}
            r={3} fill={color}
          />
        ))}

        {/* X-axis labels */}
        {series.map((s, i) => (
          <text
            key={`label-${i}`}
            x={x(i)} y={svgH - 4}
            fontSize={8} fill="currentColor" opacity={0.5} textAnchor="middle"
          >
            {s.year}
          </text>
        ))}
      </svg>

      {/* Last values */}
      <div className="flex items-center gap-4 text-[10px]">
        <span className={sideTextClass(side)}>
          Atual: {formatNumber(series[series.length - 1].company, 1)}x
        </span>
        <span className="text-muted-foreground">
          Industria: {formatNumber(series[series.length - 1].industry, 1)}x
        </span>
      </div>
    </div>
  );
}

/* ── 6. P/E vs Peers ────────────────────────────────────────────────────── */

function PEVsPeersChart({
  a,
  b,
  formatNumber,
}: {
  a: CompareEnrichedCompany;
  b: CompareEnrichedCompany;
  formatNumber: (v: number, d?: number) => string;
}) {
  type PointType = "a" | "b" | "peer";
  type ChartPoint = { ticker: string; pe: number; growth: number; type: PointType };

  // Merge competitors from both companies + the companies themselves
  const allPoints: ChartPoint[] = ([
    { ticker: a.ticker, pe: a.valuation.pe, growth: a.growthData.earningsGrowth, type: "a" as PointType },
    { ticker: b.ticker, pe: b.valuation.pe, growth: b.growthData.earningsGrowth, type: "b" as PointType },
    ...a.competitors.map((c): ChartPoint => ({
      ticker: c.ticker,
      pe: c.pe,
      growth: c.earningsGrowth,
      type: "peer",
    })),
    ...b.competitors
      .filter((c) => !a.competitors.some((ac) => ac.ticker === c.ticker))
      .map((c): ChartPoint => ({
        ticker: c.ticker,
        pe: c.pe,
        growth: c.earningsGrowth,
        type: "peer",
      })),
  ] as ChartPoint[]).filter((p) => p.pe > 0 && isFinite(p.pe));

  if (allPoints.length < 2) return null;

  const svgW = 320;
  const svgH = 200;
  const padL = 40;
  const padR = 16;
  const padT = 20;
  const padB = 30;
  const plotW = svgW - padL - padR;
  const plotH = svgH - padT - padB;

  const peVals = allPoints.map((p) => p.pe);
  const growthVals = allPoints.map((p) => p.growth);
  const peMin = Math.min(...peVals) * 0.85;
  const peMax = Math.max(...peVals) * 1.15;
  const growthMin = Math.min(...growthVals, 0) * 1.15;
  const growthMax = Math.max(...growthVals) * 1.15;
  const peRange = peMax - peMin || 1;
  const growthRange = growthMax - growthMin || 1;

  function toX(pe: number) {
    return padL + ((pe - peMin) / peRange) * plotW;
  }
  function toY(growth: number) {
    return padT + plotH - ((growth - growthMin) / growthRange) * plotH;
  }

  return (
    <div className="space-y-2">
      <svg
        viewBox={`0 0 ${svgW} ${svgH}`}
        className="w-full max-w-[400px] mx-auto"
        preserveAspectRatio="xMidYMid meet"
      >
        {/* Grid */}
        {[0, 0.25, 0.5, 0.75, 1].map((t) => {
          const yy = padT + plotH * (1 - t);
          const gVal = growthMin + growthRange * t;
          return (
            <g key={`gy-${t}`}>
              <line
                x1={padL} y1={yy} x2={svgW - padR} y2={yy}
                stroke="currentColor" strokeOpacity={0.07} strokeWidth={1}
              />
              <text x={padL - 4} y={yy + 3} fontSize={7} fill="currentColor" opacity={0.4} textAnchor="end">
                {formatNumber(gVal, 0)}%
              </text>
            </g>
          );
        })}
        {[0, 0.25, 0.5, 0.75, 1].map((t) => {
          const xx = padL + plotW * t;
          const peVal = peMin + peRange * t;
          return (
            <g key={`gx-${t}`}>
              <line
                x1={xx} y1={padT} x2={xx} y2={padT + plotH}
                stroke="currentColor" strokeOpacity={0.07} strokeWidth={1}
              />
              <text x={xx} y={svgH - 8} fontSize={7} fill="currentColor" opacity={0.4} textAnchor="middle">
                {formatNumber(peVal, 0)}x
              </text>
            </g>
          );
        })}

        {/* Axis labels */}
        <text
          x={padL + plotW / 2} y={svgH - 1}
          fontSize={8} fill="currentColor" opacity={0.5} textAnchor="middle"
        >
          P/L
        </text>
        <text
          x={6} y={padT + plotH / 2}
          fontSize={8} fill="currentColor" opacity={0.5} textAnchor="middle"
          transform={`rotate(-90, 6, ${padT + plotH / 2})`}
        >
          Cresc. Lucro (%)
        </text>

        {/* Peer dots (behind) */}
        {allPoints
          .filter((p) => p.type === "peer")
          .map((p) => {
            const cx = toX(p.pe);
            const cy = toY(p.growth);
            return (
              <g key={p.ticker}>
                <circle cx={cx} cy={cy} r={4} fill="#94A3B8" opacity={0.4} />
                <text x={cx + 6} y={cy + 3} fontSize={7} fill="#94A3B8" opacity={0.7}>
                  {p.ticker}
                </text>
              </g>
            );
          })}

        {/* Company A dot */}
        {allPoints
          .filter((p) => p.type === "a")
          .map((p) => {
            const cx = toX(p.pe);
            const cy = toY(p.growth);
            return (
              <g key={p.ticker}>
                <circle cx={cx} cy={cy} r={7} fill="var(--brand)" opacity={0.85} />
                <circle cx={cx} cy={cy} r={3.5} fill="white" />
                <text x={cx + 10} y={cy - 3} fontSize={9} fontWeight={600} fill="var(--brand)">
                  {p.ticker}
                </text>
                <text x={cx + 10} y={cy + 7} fontSize={7} fill="currentColor" opacity={0.5}>
                  P/L {formatNumber(p.pe, 1)}x | +{formatNumber(p.growth, 0)}%
                </text>
              </g>
            );
          })}

        {/* Company B dot */}
        {allPoints
          .filter((p) => p.type === "b")
          .map((p) => {
            const cx = toX(p.pe);
            const cy = toY(p.growth);
            return (
              <g key={p.ticker}>
                <circle cx={cx} cy={cy} r={7} fill="var(--compare-b)" opacity={0.85} />
                <circle cx={cx} cy={cy} r={3.5} fill="white" />
                <text x={cx + 10} y={cy - 3} fontSize={9} fontWeight={600} fill="var(--compare-b)">
                  {p.ticker}
                </text>
                <text x={cx + 10} y={cy + 7} fontSize={7} fill="currentColor" opacity={0.5}>
                  P/L {formatNumber(p.pe, 1)}x | +{formatNumber(p.growth, 0)}%
                </text>
              </g>
            );
          })}
      </svg>

      {/* Legend */}
      <div className="flex items-center justify-center gap-4 text-[10px] text-muted-foreground">
        <span className="flex items-center gap-1">
          <span className="inline-block w-2.5 h-2.5 rounded-full" style={{ backgroundColor: "var(--brand)" }} />
          {a.ticker}
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block w-2.5 h-2.5 rounded-full" style={{ backgroundColor: "var(--compare-b)" }} />
          {b.ticker}
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block w-2 h-2 rounded-full bg-slate-400 opacity-50" />
          Peers
        </span>
      </div>
    </div>
  );
}

/* ── 7. Fair PE Gauge ─────────────────────────────────────────────────────── */

function FairPEGauge({
  company,
  formatNumber,
  side,
}: {
  company: CompareEnrichedCompany;
  formatNumber: (v: number, d?: number) => string;
  side: Side;
}) {
  const pe = company.valuation.pe;
  const fairPE = company.valuation.fairPE ?? company.valuation.peIndustry;
  if (!pe || !fairPE) return null;
  const color = sideColor(side);
  const max = Math.max(pe, fairPE) * 1.4 || 30;
  const peAngle = Math.min(180, (pe / max) * 180);
  const fairAngle = Math.min(180, (fairPE / max) * 180);

  const cx = 80;
  const cy = 80;
  const r = 60;

  function polar(angle: number, radius: number) {
    const a = ((180 - angle) * Math.PI) / 180;
    return { x: cx + radius * Math.cos(a), y: cy - radius * Math.sin(a) };
  }

  const arcPath = `M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`;
  const peEnd = polar(peAngle, r - 4);
  const fairEnd = polar(fairAngle, r - 4);

  return (
    <div className={`rounded-2xl border ${sideBorderClass(side)} bg-card p-4 space-y-2`}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-foreground">{company.ticker}</span>
        <span className="text-[10px] text-muted-foreground">P/L Justo</span>
      </div>
      <svg viewBox="0 0 160 100" className="w-full max-w-[260px] mx-auto" preserveAspectRatio="xMidYMid meet">
        <path d={arcPath} stroke="currentColor" strokeOpacity={0.12} strokeWidth={10} fill="none" strokeLinecap="round" />
        {/* fair marker */}
        <line x1={cx} y1={cy} x2={fairEnd.x} y2={fairEnd.y} stroke="#f59e0b" strokeWidth={3} strokeLinecap="round" />
        <circle cx={fairEnd.x} cy={fairEnd.y} r={3} fill="#f59e0b" />
        {/* current pe marker */}
        <line x1={cx} y1={cy} x2={peEnd.x} y2={peEnd.y} stroke={color} strokeWidth={4} strokeLinecap="round" />
        <circle cx={cx} cy={cy} r={4} fill={color} />
      </svg>
      <div className="flex items-center justify-around text-[10px]">
        <span className={sideTextClass(side)}>P/L atual {formatNumber(pe, 1)}x</span>
        <span className="text-amber-600">P/L justo {formatNumber(fairPE, 1)}x</span>
      </div>
    </div>
  );
}

/* ── 8. Key Valuation Metric Donut ────────────────────────────────────────── */

function KeyValuationMetricDonut({
  company,
  formatNumber,
  side,
}: {
  company: CompareEnrichedCompany;
  formatNumber: (v: number, d?: number) => string;
  side: Side;
}) {
  const [metric, setMetric] = useState<"P/L" | "P/VP" | "P/S">("P/L");
  const value =
    metric === "P/L"
      ? company.valuation.pe
      : metric === "P/VP"
      ? company.valuation.pvp
      : company.valuation.ps ?? 0;
  const industry =
    metric === "P/L"
      ? company.valuation.peIndustry
      : metric === "P/VP"
      ? company.valuation.pvpIndustry
      : 0;

  const color = sideColor(side);
  const cx = 60;
  const cy = 60;
  const r = 44;
  const stroke = 12;
  const C = 2 * Math.PI * r;

  // Compare ratio: how much company differs from industry. Show as ring fill.
  const diff = industry > 0 ? Math.min(2, value / industry) : 1;
  const filled = Math.min(1, diff / 2) * C; // 0..C

  return (
    <div className={`rounded-2xl border ${sideBorderClass(side)} bg-card p-4 space-y-2`}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-foreground">{company.ticker}</span>
        <div className="flex items-center gap-1">
          {(["P/L", "P/VP", "P/S"] as const).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setMetric(m)}
              className={`text-[9px] px-1.5 py-0.5 rounded ${
                metric === m
                  ? "bg-foreground text-background"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {m}
            </button>
          ))}
        </div>
      </div>
      <svg viewBox="0 0 120 120" className="w-full max-w-[180px] mx-auto" preserveAspectRatio="xMidYMid meet">
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="currentColor" strokeOpacity={0.12} strokeWidth={stroke} />
        <circle
          cx={cx}
          cy={cy}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeDasharray={`${filled} ${C - filled}`}
          strokeDashoffset={C / 4}
          strokeLinecap="round"
        />
        <text x={cx} y={cy - 2} textAnchor="middle" fontSize={16} fontWeight={700} fill="currentColor">
          {formatNumber(value, 1)}x
        </text>
        <text x={cx} y={cy + 14} textAnchor="middle" fontSize={8} fill="currentColor" opacity={0.5}>
          {metric}
        </text>
      </svg>
      <div className="text-center text-[10px] text-muted-foreground">
        Industria: {formatNumber(industry, 1)}x
      </div>
      {/* Interpretation line */}
      <div className="rounded-lg bg-muted/40 border border-border/60 px-3 py-2 text-[10px] text-muted-foreground leading-snug">
        {industry > 0 && value > 0 ? (
          value < industry * 0.9 ? (
            <>
              <span className={`font-semibold ${sideTextClass(side)}`}>{formatNumber(((industry - value) / industry) * 100, 0)}% abaixo</span>{" "}
              da industria — possivel desconto em {metric}.
            </>
          ) : value > industry * 1.1 ? (
            <>
              <span className="font-semibold text-amber-600">{formatNumber(((value - industry) / industry) * 100, 0)}% acima</span>{" "}
              da industria — premio em {metric}.
            </>
          ) : (
            <>Alinhada com a industria ({metric}).</>
          )
        ) : (
          <>Sem referencia de industria disponivel para {metric}.</>
        )}
      </div>
    </div>
  );
}

/* ── 9. P/E vs Industry histogram ─────────────────────────────────────────── */

function PEVsIndustryChart({
  company,
  formatNumber,
  side,
}: {
  company: CompareEnrichedCompany;
  formatNumber: (v: number, d?: number) => string;
  side: Side;
}) {
  const dist = company.valuation.peIndustryDistribution;
  if (!dist || !dist.bins || dist.bins.length === 0) {
    // Fallback: synthetic single-bar visual highlighting company vs industry
    const pe = company.valuation.pe;
    const ind = company.valuation.peIndustry;
    if (!pe || !ind) return null;
    const max = Math.max(pe, ind) * 1.5;
    return (
      <div className={`rounded-2xl border ${sideBorderClass(side)} bg-card p-4 space-y-2`}>
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-foreground">{company.ticker}</span>
          <span className="text-[10px] text-muted-foreground">P/L vs setor</span>
        </div>
        <svg viewBox="0 0 220 80" className="w-full max-w-[340px] mx-auto" preserveAspectRatio="xMidYMid meet">
          <line x1={10} y1={50} x2={210} y2={50} stroke="currentColor" strokeOpacity={0.2} strokeWidth={1} />
          <circle cx={10 + (ind / max) * 200} cy={50} r={5} fill="#f59e0b" />
          <text x={10 + (ind / max) * 200} y={70} fontSize={8} fill="currentColor" opacity={0.6} textAnchor="middle">
            Ind {formatNumber(ind, 1)}x
          </text>
          <circle cx={10 + (pe / max) * 200} cy={50} r={6} fill={sideColor(side)} />
          <text x={10 + (pe / max) * 200} y={30} fontSize={9} fontWeight={600} fill={sideColor(side)} textAnchor="middle">
            {formatNumber(pe, 1)}x
          </text>
        </svg>
      </div>
    );
  }

  const max = Math.max(...dist.bins.map((bin) => bin.count)) || 1;
  const w = 240;
  const h = 100;
  const padL = 10;
  const padR = 10;
  const padT = 10;
  const padB = 22;
  const plotW = w - padL - padR;
  const plotH = h - padT - padB;
  const allEdges = [
    ...dist.bins.map((bin) => bin.lower),
    ...dist.bins.map((bin) => bin.upper),
  ];
  const lo = Math.min(...allEdges);
  const hi = Math.max(...allEdges);
  const range = hi - lo || 1;
  function xPos(v: number) {
    return padL + ((v - lo) / range) * plotW;
  }

  return (
    <div className={`rounded-2xl border ${sideBorderClass(side)} bg-card p-4 space-y-2`}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-foreground">{company.ticker}</span>
        <span className="text-[10px] text-muted-foreground">Distribuicao P/L</span>
      </div>
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full max-w-[340px] mx-auto" preserveAspectRatio="xMidYMid meet">
        {/* P25-P75 band */}
        <rect
          x={xPos(dist.p25)}
          y={padT}
          width={Math.max(0, xPos(dist.p75) - xPos(dist.p25))}
          height={plotH}
          fill="currentColor"
          opacity={0.06}
        />
        {/* bars */}
        {dist.bins.map((bin, i) => {
          const x1 = xPos(bin.lower);
          const x2 = xPos(bin.upper);
          const barH = (bin.count / max) * plotH;
          return (
            <rect
              key={i}
              x={x1 + 1}
              y={padT + plotH - barH}
              width={Math.max(1, x2 - x1 - 2)}
              height={barH}
              fill="currentColor"
              opacity={0.3}
              rx={1}
            />
          );
        })}
        {/* industry median */}
        <line x1={xPos(dist.industryMedian)} y1={padT} x2={xPos(dist.industryMedian)} y2={padT + plotH} stroke="#f59e0b" strokeWidth={1.5} strokeDasharray="3,2" />
        {/* company position */}
        <line x1={xPos(dist.companyPE)} y1={padT - 2} x2={xPos(dist.companyPE)} y2={padT + plotH + 2} stroke={sideColor(side)} strokeWidth={2} />
        <circle cx={xPos(dist.companyPE)} cy={padT - 2} r={3} fill={sideColor(side)} />
      </svg>
      <div className="flex items-center justify-around text-[9px] text-muted-foreground">
        <span className={sideTextClass(side)}>Empresa {formatNumber(dist.companyPE, 1)}x</span>
        <span className="text-amber-600">Mediana {formatNumber(dist.industryMedian, 1)}x</span>
      </div>
    </div>
  );
}

/* ── 10. Ratio Trend (P/L + P/VP tabs) ────────────────────────────────────── */

function RatioTrendChart({
  company,
  formatNumber,
  side,
  metric,
  period,
}: {
  company: CompareEnrichedCompany;
  formatNumber: (v: number, d?: number) => string;
  side: Side;
  metric: "P/L" | "P/VP";
  period: "1A" | "3A" | "5A" | "Max";
}) {
  const trend = company.ratioTrends.find((t) => t.metric === metric);
  if (!trend || !trend.series.length) {
    return (
      <div className={`rounded-2xl border ${sideBorderClass(side)} bg-card p-4`}>
        <div className="text-xs font-semibold text-foreground">{company.ticker}</div>
        <div className="text-[10px] text-muted-foreground/60 text-center py-6">
          Dados de {metric} indisponiveis
        </div>
      </div>
    );
  }

  // Slice series by period: 1A=1 pt, 3A=3 pts, 5A=5 pts, Max=all
  const periodCount = period === "1A" ? 2 : period === "3A" ? 3 : period === "5A" ? 5 : trend.series.length;
  const series = trend.series.slice(-Math.max(2, periodCount));
  const color = sideColor(side);
  const svgW = 280;
  const svgH = 140;
  const padL = 35;
  const padR = 10;
  const padT = 15;
  const padB = 25;
  const plotW = svgW - padL - padR;
  const plotH = svgH - padT - padB;
  const allVals = series.flatMap((s) => [s.company, s.industry]);
  const minV = Math.min(...allVals) * 0.9;
  const maxV = Math.max(...allVals) * 1.1;
  const valRange = maxV - minV || 1;
  const n = series.length;
  const xx = (i: number) => padL + (n === 1 ? plotW / 2 : (i / (n - 1)) * plotW);
  const yy = (v: number) => padT + plotH - ((v - minV) / valRange) * plotH;
  const cPath = series.map((s, i) => `${i === 0 ? "M" : "L"} ${xx(i)} ${yy(s.company)}`).join(" ");
  const iPath = series.map((s, i) => `${i === 0 ? "M" : "L"} ${xx(i)} ${yy(s.industry)}`).join(" ");
  // Area path (closed polygon below company line)
  const areaPath =
    cPath + ` L ${xx(series.length - 1)} ${padT + plotH} L ${xx(0)} ${padT + plotH} Z`;
  const gradId = `ratioGrad-${side}-${metric.replace("/", "")}`;

  const last = series[series.length - 1];
  const first = series[0];
  const deltaPct = first.company > 0 ? ((last.company - first.company) / first.company) * 100 : 0;

  return (
    <div className={`rounded-2xl border ${sideBorderClass(side)} bg-card p-4 space-y-2`}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-foreground">{company.ticker}</span>
        <span className="text-[10px] text-muted-foreground">{metric} · {period}</span>
      </div>
      <svg viewBox={`0 0 ${svgW} ${svgH}`} className="w-full max-w-[340px] mx-auto" preserveAspectRatio="xMidYMid meet">
        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.35} />
            <stop offset="100%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        {[0, 0.5, 1].map((t) => {
          const y = padT + plotH * (1 - t);
          const v = minV + valRange * t;
          return (
            <g key={t}>
              <line x1={padL} y1={y} x2={svgW - padR} y2={y} stroke="currentColor" strokeOpacity={0.07} />
              <text x={padL - 4} y={y + 3} fontSize={8} fill="currentColor" opacity={0.4} textAnchor="end">
                {formatNumber(v, 0)}
              </text>
            </g>
          );
        })}
        {/* Area fill under company line */}
        <path d={areaPath} fill={`url(#${gradId})`} />
        {/* Industry line (dashed, behind) */}
        <path d={iPath} fill="none" stroke="currentColor" strokeOpacity={0.3} strokeWidth={1.5} strokeDasharray="4,3" />
        {/* Company line */}
        <path d={cPath} fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
        {series.map((s, i) => (
          <circle key={i} cx={xx(i)} cy={yy(s.company)} r={3} fill={color} />
        ))}
        {/* X-axis year labels (first, mid, last) */}
        {[0, Math.floor((series.length - 1) / 2), series.length - 1]
          .filter((idx, i, arr) => arr.indexOf(idx) === i)
          .map((idx) => (
            <text
              key={`lbl-${idx}`}
              x={xx(idx)}
              y={svgH - 4}
              fontSize={8}
              fill="currentColor"
              opacity={0.5}
              textAnchor="middle"
            >
              {series[idx].year}
            </text>
          ))}
      </svg>
      <div className="flex items-center justify-between text-[10px]">
        <span className={sideTextClass(side)}>
          Atual {formatNumber(last.company, 1)}x
        </span>
        <span className={`font-medium ${deltaPct >= 0 ? "text-amber-600" : "text-emerald-600"}`}>
          {deltaPct >= 0 ? "+" : ""}
          {formatNumber(deltaPct, 1)}% no periodo
        </span>
        <span className="text-muted-foreground">
          Ind {formatNumber(last.industry, 1)}x
        </span>
      </div>
    </div>
  );
}

/* ── 11. Valuation Scenarios (Horizontal Bars) ────────────────────────────── */

function ValuationScenariosBars({
  company,
  formatNumber,
  side,
}: {
  company: CompareEnrichedCompany;
  formatNumber: (v: number, d?: number) => string;
  side: Side;
}) {
  const scenarios = company.priceScenarios;
  if (!scenarios.length) return null;

  const currentPrice = company.valuation.currentPrice;
  const sorted = [...scenarios].sort((a, b) => a.value - b.value);
  const maxV = Math.max(currentPrice, ...sorted.map((s) => s.value)) * 1.05;
  const color = sideColor(side);

  function toneFor(gap: number) {
    if (gap > 5) return { bar: "var(--color-success)", text: "text-emerald-600", bg: "bg-success-surface", border: "border-success-border" };
    if (gap < -5) return { bar: "var(--color-danger)", text: "text-red-600", bg: "bg-danger-surface", border: "border-danger-border" };
    return { bar: "#94a3b8", text: "text-muted-foreground", bg: "bg-muted", border: "border-border" };
  }

  return (
    <div className={`rounded-2xl border ${sideBorderClass(side)} bg-card p-4 space-y-3`}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-foreground">{company.ticker}</span>
        <span className="text-[10px] text-muted-foreground">
          Atual R$ {formatNumber(currentPrice, 2)}
        </span>
      </div>

      <div className="space-y-2.5">
        {sorted.map((s) => {
          const widthPct = (s.value / maxV) * 100;
          const currentPct = (currentPrice / maxV) * 100;
          const tone = toneFor(s.gapPercent);
          const isPositive = s.gapPercent >= 0;
          return (
            <div key={s.key} className="space-y-1">
              <div className="flex items-center justify-between text-[10px]">
                <span className="font-medium text-foreground">{s.label}</span>
                <span className={`font-semibold ${tone.text}`}>
                  R$ {formatNumber(s.value, 2)}{" "}
                  <span className="opacity-70">
                    ({isPositive ? "+" : ""}
                    {formatNumber(s.gapPercent, 1)}%)
                  </span>
                </span>
              </div>
              <div className="relative h-5 w-full rounded bg-muted/60 overflow-hidden">
                {/* Scenario bar */}
                <div
                  className="absolute inset-y-0 left-0 rounded"
                  style={{
                    width: `${widthPct}%`,
                    backgroundColor: tone.bar,
                    opacity: 0.55,
                  }}
                />
                {/* Current price marker */}
                <div
                  className="absolute top-0 bottom-0 w-0.5"
                  style={{
                    left: `${currentPct}%`,
                    backgroundColor: color,
                  }}
                />
                <div
                  className="absolute top-1/2 -translate-y-1/2 w-2 h-2 rounded-full border border-white"
                  style={{
                    left: `calc(${currentPct}% - 4px)`,
                    backgroundColor: color,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex items-center gap-3 pt-1 border-t border-border/50 text-[9px] text-muted-foreground">
        <span className="flex items-center gap-1">
          <span className="inline-block w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
          Preco atual
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block w-3 h-1.5 rounded" style={{ backgroundColor: "var(--color-success)", opacity: 0.55 }} />
          Upside
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block w-3 h-1.5 rounded" style={{ backgroundColor: "var(--color-danger)", opacity: 0.55 }} />
          Downside
        </span>
      </div>
    </div>
  );
}

/* ── Main Component ───────────────────────────────────────────────────────── */

export function ValuationIsland({ a, b, formatNumber }: ValuationIslandProps) {
  const [trendMetric, setTrendMetric] = useState<"P/L" | "P/VP">("P/L");
  const [trendPeriod, setTrendPeriod] = useState<"1A" | "3A" | "5A" | "Max">("5A");

  const multipleRows: MultipleRowDef[] = [
    {
      label: "P/L",
      keyA: a.valuation.pe,
      keyB: b.valuation.pe,
      industry: a.valuation.peIndustry,
      direction: "lower-better",
    },
    {
      label: "P/VP",
      keyA: a.valuation.pvp,
      keyB: b.valuation.pvp,
      industry: a.valuation.pvpIndustry,
      direction: "lower-better",
    },
    {
      label: "PEG",
      keyA: a.valuation.pegRatio,
      keyB: b.valuation.pegRatio,
      industry: 1, // PEG = 1 is fair benchmark
      direction: "lower-better",
    },
  ];

  return (
    <div className="compare-island compare-surface p-6 scroll-mt-[160px] space-y-8">
      <h3 className="text-base font-semibold text-foreground">Valuation</h3>

      {/* ── Leitura da dimensao ── */}
      <CompareReadingCard
        a={a.readings.value}
        b={b.readings.value}
        tickerA={a.ticker}
        tickerB={b.ticker}
        dimension="value"
      />

      {/* ── Criterios da dimensao ── */}
      <CompareDimensionCheckCard
        a={a.dimensionChecks.value}
        b={b.dimensionChecks.value}
        tickerA={a.ticker}
        tickerB={b.ticker}
      />

      {/* ── 1. Preco vs Valor Justo ── */}
      <div className="space-y-2">
        <h4 className="text-[12px] font-semibold text-muted-foreground uppercase tracking-wider">
          Preco vs Valor Justo
        </h4>
        <div className="compare-side-grid pt-4">
          <FairValueBar company={a} formatNumber={formatNumber} side="a" />
          <FairValueBar company={b} formatNumber={formatNumber} side="b" />
        </div>
      </div>

      {/* ── 2. Multiplos Comparados ── */}
      <div className="space-y-2">
        <h4 className="text-[12px] font-semibold text-muted-foreground uppercase tracking-wider">
          Multiplos Comparados
        </h4>
        <MultiplesTable a={a} b={b} rows={multipleRows} formatNumber={formatNumber} />
      </div>

      {/* ── 3. Cenarios de Preco ── */}
      <div className="space-y-2">
        <h4 className="text-[12px] font-semibold text-muted-foreground uppercase tracking-wider">
          Cenarios de Preco
        </h4>
        <div className="compare-side-grid">
          <PriceScenarioScale company={a} formatNumber={formatNumber} side="a" />
          <PriceScenarioScale company={b} formatNumber={formatNumber} side="b" />
        </div>
      </div>

      {/* ── 4. Sensibilidade DCF ── */}
      <div className="space-y-2">
        <h4 className="text-[12px] font-semibold text-muted-foreground uppercase tracking-wider">
          Sensibilidade DCF
        </h4>
        <div className="compare-side-grid">
          <DCFHeatmap company={a} formatNumber={formatNumber} side="a" />
          <DCFHeatmap company={b} formatNumber={formatNumber} side="b" />
        </div>
      </div>

      {/* ── 5. Tendencia Historica (P/L | P/VP) com periodo ── */}
      <div className="space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h4 className="text-[12px] font-semibold text-muted-foreground uppercase tracking-wider">
            Tendencia Historica
          </h4>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              {(["P/L", "P/VP"] as const).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setTrendMetric(m)}
                  className={`text-[10px] px-2 py-0.5 rounded ${
                    trendMetric === m
                      ? "bg-foreground text-background"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-1 border-l border-border pl-3">
              {(["1A", "3A", "5A", "Max"] as const).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setTrendPeriod(p)}
                  className={`text-[10px] px-2 py-0.5 rounded ${
                    trendPeriod === p
                      ? "bg-foreground text-background"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="compare-side-grid">
          <RatioTrendChart company={a} formatNumber={formatNumber} side="a" metric={trendMetric} period={trendPeriod} />
          <RatioTrendChart company={b} formatNumber={formatNumber} side="b" metric={trendMetric} period={trendPeriod} />
        </div>
      </div>

      {/* ── 5b. Cenarios de Preco (barras horizontais) ── */}
      <div className="space-y-2">
        <h4 className="text-[12px] font-semibold text-muted-foreground uppercase tracking-wider">
          Cenarios de Preco (barras)
        </h4>
        <div className="compare-side-grid">
          <ValuationScenariosBars company={a} formatNumber={formatNumber} side="a" />
          <ValuationScenariosBars company={b} formatNumber={formatNumber} side="b" />
        </div>
      </div>

      {/* ── 6. P/L vs Industria (Histograma) ── */}
      <div className="space-y-2">
        <h4 className="text-[12px] font-semibold text-muted-foreground uppercase tracking-wider">
          P/L vs Industria
        </h4>
        <div className="compare-side-grid">
          <PEVsIndustryChart company={a} formatNumber={formatNumber} side="a" />
          <PEVsIndustryChart company={b} formatNumber={formatNumber} side="b" />
        </div>
      </div>

      {/* ── 7. P/L Justo (Gauge) ── */}
      <div className="space-y-2">
        <h4 className="text-[12px] font-semibold text-muted-foreground uppercase tracking-wider">
          P/L Justo vs Atual
        </h4>
        <div className="compare-side-grid">
          <FairPEGauge company={a} formatNumber={formatNumber} side="a" />
          <FairPEGauge company={b} formatNumber={formatNumber} side="b" />
        </div>
      </div>

      {/* ── 8. Multiplos-chave (Donut) ── */}
      <div className="space-y-2">
        <h4 className="text-[12px] font-semibold text-muted-foreground uppercase tracking-wider">
          Multiplos-chave
        </h4>
        <div className="compare-side-grid">
          <KeyValuationMetricDonut company={a} formatNumber={formatNumber} side="a" />
          <KeyValuationMetricDonut company={b} formatNumber={formatNumber} side="b" />
        </div>
      </div>

      {/* ── 9. P/E vs Peers ── */}
      <div className="space-y-2">
        <h4 className="text-[12px] font-semibold text-muted-foreground uppercase tracking-wider">
          P/E vs Peers
        </h4>
        <PEVsPeersChart a={a} b={b} formatNumber={formatNumber} />
      </div>
    </div>
  );
}

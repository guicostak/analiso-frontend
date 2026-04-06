"use client";

import type { CompareEnrichedCompany, CompareDiagnosis } from "../../interfaces";
import { CompareReadingCard } from "../shared/CompareReadingCard";
import { CompareDimensionCheckCard } from "../shared/CompareDimensionCheckCard";

/* ── Types ────────────────────────────────────────────────────────────────── */

interface DividendIslandProps {
  a: CompareEnrichedCompany;
  b: CompareEnrichedCompany;
  formatNumber: (value: number, digits?: number) => string;
}

/* ── Helpers ──────────────────────────────────────────────────────────────── */

type Side = "a" | "b";

function sideColor(side: Side) {
  return side === "a" ? "var(--brand)" : "var(--compare-b)";
}
function sideSurface(side: Side) {
  return side === "a" ? "var(--brand-surface)" : "var(--compare-b-surface)";
}
function sideTextClass(side: Side) {
  return side === "a" ? "text-brand-text" : "text-compare-b-text";
}
function sideBorderClass(side: Side) {
  return side === "a" ? "border-brand-border" : "border-compare-b-border";
}

/** Pick winner for a "higher is better" metric. Returns "a" | "b" | null (tie). */
function pickWinner(va: number, vb: number): Side | null {
  if (va > vb) return "a";
  if (vb > va) return "b";
  return null;
}

/* ── 1. KPIs de Dividendos (comparative table) ──────────────────────────── */

function KpiTable({
  a,
  b,
  formatNumber,
}: {
  a: CompareEnrichedCompany;
  b: CompareEnrichedCompany;
  formatNumber: (v: number, d?: number) => string;
}) {
  const da = a.dividendData;
  const db = b.dividendData;

  const rows: {
    label: string;
    va: string;
    vb: string;
    winner: Side | null;
  }[] = [
    {
      label: "Yield Atual",
      va: `${formatNumber(da.currentYield, 2)}%`,
      vb: `${formatNumber(db.currentYield, 2)}%`,
      winner: pickWinner(da.currentYield, db.currentYield),
    },
    {
      label: "Anos sem Interrupção",
      va: `${da.yearsWithoutInterruption}`,
      vb: `${db.yearsWithoutInterruption}`,
      winner: pickWinner(da.yearsWithoutInterruption, db.yearsWithoutInterruption),
    },
    {
      label: "CAGR 5 anos",
      va: `${formatNumber(da.cagr5y, 1)}%`,
      vb: `${formatNumber(db.cagr5y, 1)}%`,
      winner: pickWinner(da.cagr5y, db.cagr5y),
    },
    {
      label: "Payout Médio 5a",
      va: `${formatNumber(da.avgPayout5y, 0)}%`,
      vb: `${formatNumber(db.avgPayout5y, 0)}%`,
      // lower payout is generally healthier, but display-wise we just highlight difference
      winner: pickWinner(db.avgPayout5y, da.avgPayout5y), // lower wins
    },
    {
      label: "Retorno Total ao Acionista",
      va: `${formatNumber(da.totalShareholderReturn, 2)}%`,
      vb: `${formatNumber(db.totalShareholderReturn, 2)}%`,
      winner: pickWinner(da.totalShareholderReturn, db.totalShareholderReturn),
    },
  ];

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border">
            <th className="py-2 pr-4 text-left text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
              Métrica
            </th>
            <th className={`py-2 px-4 text-center text-[11px] font-medium uppercase tracking-wider ${sideTextClass("a")}`}>
              {a.ticker}
            </th>
            <th className={`py-2 pl-4 text-center text-[11px] font-medium uppercase tracking-wider ${sideTextClass("b")}`}>
              {b.ticker}
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.label} className="border-b border-border/50">
              <td className="py-2.5 pr-4 text-[12px] text-muted-foreground whitespace-nowrap">
                {r.label}
              </td>
              <td
                className="py-2.5 px-4 text-center text-[13px] font-semibold text-foreground rounded-lg"
                style={{
                  backgroundColor: r.winner === "a" ? sideSurface("a") : undefined,
                }}
              >
                {r.va}
              </td>
              <td
                className="py-2.5 pl-4 text-center text-[13px] font-semibold text-foreground rounded-lg"
                style={{
                  backgroundColor: r.winner === "b" ? sideSurface("b") : undefined,
                }}
              >
                {r.vb}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ── 2. Histórico DPA + Payout (rich SVG) ────────────────────────────────── */

function DpaChart({
  company,
  side,
  formatNumber,
}: {
  company: CompareEnrichedCompany;
  side: Side;
  formatNumber: (v: number, d?: number) => string;
}) {
  const series = company.dividendData.dpaSeries;
  if (!series.length) return null;

  const svgW = 340;
  const svgH = 180;
  const padL = 40;
  const padR = 44;
  const padT = 16;
  const padB = 28;
  const plotW = svgW - padL - padR;
  const plotH = svgH - padT - padB;

  const maxDpa = Math.max(...series.map((s) => s.dpa), 0.01);
  const payoutValues = series.filter((s) => s.payout !== null).map((s) => s.payout!);
  const maxPayout = Math.max(...payoutValues, 1);

  const barGap = 4;
  const barW = Math.min((plotW / series.length) - barGap, 28);
  const barColor = sideColor(side);
  const payoutLineColor = "#D4913B";

  // Find the first forecast index for divider
  const firstForecastIdx = series.findIndex((s) => s.type === "forecast");

  // Y-axis ticks for DPA (left)
  const dpaSteps = 4;
  const dpaTickValues = Array.from({ length: dpaSteps + 1 }, (_, i) => (maxDpa / dpaSteps) * i);

  // Y-axis ticks for Payout (right)
  const payoutSteps = 4;
  const payoutTickValues = Array.from({ length: payoutSteps + 1 }, (_, i) => (maxPayout / payoutSteps) * i);

  return (
    <div className="space-y-2">
      <span className={`text-[11px] font-medium ${sideTextClass(side)} uppercase tracking-wider`}>
        {company.ticker} - Dividendo por Ação + Payout
      </span>
      <svg
        viewBox={`0 0 ${svgW} ${svgH}`}
        className="w-full max-w-[380px] mx-auto"
        preserveAspectRatio="xMidYMid meet"
      >
        {/* Grid lines */}
        {dpaTickValues.map((v, i) => {
          const y = padT + plotH - (v / maxDpa) * plotH;
          return (
            <line
              key={`grid-${i}`}
              x1={padL}
              x2={svgW - padR}
              y1={y}
              y2={y}
              stroke="currentColor"
              className="text-border"
              strokeWidth="0.5"
              strokeDasharray={i === 0 ? undefined : "3 3"}
              opacity="0.5"
            />
          );
        })}

        {/* Left Y-axis labels (DPA) */}
        {dpaTickValues.map((v, i) => {
          const y = padT + plotH - (v / maxDpa) * plotH;
          return (
            <text
              key={`yl-${i}`}
              x={padL - 4}
              y={y + 3}
              textAnchor="end"
              className="fill-muted-foreground"
              style={{ fontSize: 8 }}
            >
              {formatNumber(v, 2)}
            </text>
          );
        })}

        {/* Right Y-axis labels (Payout %) */}
        {payoutTickValues.map((v, i) => {
          const y = padT + plotH - (v / maxPayout) * plotH;
          return (
            <text
              key={`yr-${i}`}
              x={svgW - padR + 4}
              y={y + 3}
              textAnchor="start"
              className="fill-muted-foreground"
              style={{ fontSize: 8 }}
            >
              {formatNumber(v, 0)}%
            </text>
          );
        })}

        {/* Axis labels */}
        <text
          x={4}
          y={padT + plotH / 2}
          textAnchor="middle"
          className="fill-muted-foreground"
          style={{ fontSize: 7 }}
          transform={`rotate(-90, 4, ${padT + plotH / 2})`}
        >
          DPA (R$)
        </text>
        <text
          x={svgW - 4}
          y={padT + plotH / 2}
          textAnchor="middle"
          className="fill-muted-foreground"
          style={{ fontSize: 7 }}
          transform={`rotate(90, ${svgW - 4}, ${padT + plotH / 2})`}
        >
          Payout (%)
        </text>

        {/* Forecast divider */}
        {firstForecastIdx > 0 && (() => {
          const divX = padL + (firstForecastIdx / series.length) * plotW - barGap / 2;
          return (
            <>
              <line
                x1={divX}
                x2={divX}
                y1={padT}
                y2={padT + plotH}
                stroke="currentColor"
                className="text-muted-foreground"
                strokeWidth="0.8"
                strokeDasharray="4 3"
                opacity="0.6"
              />
              <text
                x={divX + 3}
                y={padT + 8}
                className="fill-muted-foreground"
                style={{ fontSize: 7, fontStyle: "italic" }}
              >
                Projeção
              </text>
            </>
          );
        })()}

        {/* DPA bars */}
        {series.map((s, i) => {
          const cx = padL + ((i + 0.5) / series.length) * plotW;
          const x = cx - barW / 2;
          const barH = Math.max((s.dpa / maxDpa) * plotH, 1);
          const y = padT + plotH - barH;
          const isForecast = s.type === "forecast";
          return (
            <g key={`bar-${i}`}>
              <rect
                x={x}
                y={y}
                width={barW}
                height={barH}
                rx={3}
                fill={isForecast ? "none" : barColor}
                opacity={isForecast ? 1 : 0.7}
                stroke={isForecast ? barColor : "none"}
                strokeWidth={isForecast ? 1.5 : 0}
                strokeDasharray={isForecast ? "4 2" : undefined}
              />
              {/* Value label on top of bar */}
              <text
                x={cx}
                y={y - 3}
                textAnchor="middle"
                className="fill-foreground"
                style={{ fontSize: 7, fontWeight: 600 }}
              >
                {formatNumber(s.dpa, 2)}
              </text>
            </g>
          );
        })}

        {/* Payout line overlay */}
        {(() => {
          const pts = series
            .map((s, i) => {
              if (s.payout === null) return null;
              const x = padL + ((i + 0.5) / series.length) * plotW;
              const y = padT + plotH - (s.payout / maxPayout) * plotH;
              return { x, y, val: s.payout };
            })
            .filter(Boolean) as { x: number; y: number; val: number }[];

          if (pts.length < 2) return null;

          const d = pts
            .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x},${p.y}`)
            .join(" ");

          return (
            <>
              <path
                d={d}
                fill="none"
                stroke={payoutLineColor}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                opacity="0.8"
              />
              {pts.map((p, i) => (
                <g key={`pdot-${i}`}>
                  <circle cx={p.x} cy={p.y} r="3.5" fill="white" />
                  <circle cx={p.x} cy={p.y} r="2.5" fill={payoutLineColor} />
                  <text
                    x={p.x}
                    y={p.y - 6}
                    textAnchor="middle"
                    fill={payoutLineColor}
                    style={{ fontSize: 7, fontWeight: 600 }}
                  >
                    {formatNumber(p.val, 0)}%
                  </text>
                </g>
              ))}
            </>
          );
        })()}

        {/* Year labels */}
        {series.map((s, i) => {
          const cx = padL + ((i + 0.5) / series.length) * plotW;
          return (
            <text
              key={`yr-${i}`}
              x={cx}
              y={svgH - 6}
              textAnchor="middle"
              className="fill-muted-foreground"
              style={{ fontSize: 8, fontWeight: s.type === "forecast" ? 400 : 500 }}
            >
              {s.year}
            </text>
          );
        })}
      </svg>

      {/* Legend */}
      <div className="flex items-center gap-5 text-[10px] text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <span
            className="inline-block h-3 w-3 rounded-sm"
            style={{ backgroundColor: barColor, opacity: 0.7 }}
          />
          DPA Histórico
        </span>
        <span className="flex items-center gap-1.5">
          <span
            className="inline-block h-3 w-3 rounded-sm border-2 border-dashed"
            style={{ borderColor: barColor }}
          />
          DPA Projeção
        </span>
        <span className="flex items-center gap-1.5">
          <span
            className="inline-block h-0.5 w-4 rounded-full"
            style={{ backgroundColor: payoutLineColor }}
          />
          <span
            className="inline-block h-2 w-2 rounded-full"
            style={{ backgroundColor: payoutLineColor }}
          />
          Payout (%)
        </span>
      </div>
    </div>
  );
}

/* ── 3. Yield vs Mercado (dot plot) ──────────────────────────────────────── */

function YieldDotPlot({
  company,
  side,
  formatNumber,
}: {
  company: CompareEnrichedCompany;
  side: Side;
  formatNumber: (v: number, d?: number) => string;
}) {
  const d = company.dividendData;
  const allVals = [
    d.currentYield,
    d.sectorMedianYield,
    d.marketMedianYield,
    d.marketYield25th,
    d.marketYield75th,
  ];
  const minVal = 0;
  const maxVal = Math.max(...allVals, 1) * 1.2;

  const svgW = 320;
  const svgH = 110;
  const padL = 8;
  const padR = 60;
  const padT = 14;
  const rowH = 26;
  const plotW = svgW - padL - padR;

  function xPos(v: number) {
    return padL + ((v - minVal) / (maxVal - minVal)) * plotW;
  }

  const p25x = xPos(d.marketYield25th);
  const p75x = xPos(d.marketYield75th);
  const medianX = xPos(d.marketMedianYield);
  const accentColor = sideColor(side);

  const lanes = [
    {
      label: company.ticker,
      value: d.currentYield,
      r: 7,
      fill: accentColor,
      textColor: accentColor,
      fontWeight: 700,
    },
    {
      label: "Setor",
      value: d.sectorMedianYield,
      r: 5,
      fill: "#94A3B8",
      textColor: "#94A3B8",
      fontWeight: 500,
    },
    {
      label: "Mercado",
      value: d.marketMedianYield,
      r: 4,
      fill: "#64748B",
      textColor: "#64748B",
      fontWeight: 500,
    },
  ];

  return (
    <div className="space-y-2">
      <span className={`text-[11px] font-medium ${sideTextClass(side)} uppercase tracking-wider`}>
        {company.ticker} - Yield vs Mercado
      </span>
      <svg
        viewBox={`0 0 ${svgW} ${svgH}`}
        className="w-full max-w-[380px] mx-auto"
        preserveAspectRatio="xMidYMid meet"
      >
        {/* P25-P75 band */}
        <rect
          x={p25x}
          y={padT}
          width={p75x - p25x}
          height={rowH * 3}
          rx={4}
          fill="currentColor"
          className="text-muted-foreground"
          opacity="0.07"
        />
        {/* Band labels */}
        <text
          x={p25x}
          y={padT - 3}
          textAnchor="middle"
          className="fill-muted-foreground"
          style={{ fontSize: 7 }}
        >
          P25 ({formatNumber(d.marketYield25th, 1)}%)
        </text>
        <text
          x={p75x}
          y={padT - 3}
          textAnchor="middle"
          className="fill-muted-foreground"
          style={{ fontSize: 7 }}
        >
          P75 ({formatNumber(d.marketYield75th, 1)}%)
        </text>

        {/* Market median reference line */}
        <line
          x1={medianX}
          x2={medianX}
          y1={padT}
          y2={padT + rowH * 3}
          stroke="#64748B"
          strokeWidth="1"
          strokeDasharray="3 2"
          opacity="0.5"
        />

        {/* Lanes */}
        {lanes.map((lane, i) => {
          const cy = padT + rowH * i + rowH / 2;
          const cx = xPos(lane.value);
          const delta = lane.value - d.marketMedianYield;
          return (
            <g key={lane.label}>
              {/* Connecting line from origin */}
              <line
                x1={padL}
                x2={cx}
                y1={cy}
                y2={cy}
                stroke={lane.fill}
                strokeWidth="1.5"
                opacity="0.25"
              />
              {/* Dot */}
              <circle cx={cx} cy={cy} r={lane.r + 1} fill="white" opacity="0.8" />
              <circle cx={cx} cy={cy} r={lane.r} fill={lane.fill} />
              {/* Label on left of dot */}
              <text
                x={padL}
                y={cy - lane.r - 3}
                className="fill-muted-foreground"
                style={{ fontSize: 8, fontWeight: lane.fontWeight }}
              >
                {lane.label}
              </text>
              {/* Value + delta on right */}
              <text
                x={svgW - padR + 6}
                y={cy - 2}
                style={{ fontSize: 9, fontWeight: 600, fill: lane.textColor }}
              >
                {formatNumber(lane.value, 2)}%
              </text>
              {i === 0 && (
                <text
                  x={svgW - padR + 6}
                  y={cy + 9}
                  style={{
                    fontSize: 7,
                    fill: delta >= 0 ? "#16A34A" : "#DC2626",
                    fontWeight: 500,
                  }}
                >
                  {delta >= 0 ? "+" : ""}{formatNumber(delta, 2)}pp vs mercado
                </text>
              )}
            </g>
          );
        })}

        {/* Percentile badge */}
        <text
          x={svgW - padR + 6}
          y={padT + rowH * 3 + 10}
          className="fill-muted-foreground"
          style={{ fontSize: 8 }}
        >
          Percentil mercado: {formatNumber(d.marketPercentile, 0)}%
        </text>
      </svg>
    </div>
  );
}

/* ── 4. Cobertura de Dividendos ──────────────────────────────────────────── */

function CoverageBar({
  company,
  side,
  formatNumber,
}: {
  company: CompareEnrichedCompany;
  side: Side;
  formatNumber: (v: number, d?: number) => string;
}) {
  const d = company.dividendData;

  const svgW = 320;
  const svgH = 100;
  const padL = 8;
  const padR = 8;
  const barH = 20;
  const plotW = svgW - padL - padR;

  // Scale: 0 to max(150, payoutRatio, cashPayoutRatio)
  const maxScale = Math.max(150, d.payoutRatio * 1.15, d.cashPayoutRatio * 1.15);

  function xPos(v: number) {
    return padL + Math.min(v / maxScale, 1) * plotW;
  }

  const zones = [
    { from: 0, to: 75, color: "#16A34A", label: "Sustentável" },
    { from: 75, to: 100, color: "#EAB308", label: "Atenção" },
    { from: 100, to: maxScale, color: "#DC2626", label: "Risco" },
  ];

  const bars = [
    { label: "Payout Ratio", value: d.payoutRatio, y: 24 },
    { label: "Cash Payout Ratio", value: d.cashPayoutRatio, y: 60 },
  ];

  const accentColor = sideColor(side);

  return (
    <div className="space-y-2">
      <span className={`text-[11px] font-medium ${sideTextClass(side)} uppercase tracking-wider`}>
        {company.ticker} - Cobertura de Dividendos
      </span>
      <svg
        viewBox={`0 0 ${svgW} ${svgH}`}
        className="w-full max-w-[380px] mx-auto"
        preserveAspectRatio="xMidYMid meet"
      >
        {/* Zone backgrounds - drawn once at top */}
        {zones.map((z) => {
          const x1 = xPos(z.from);
          const x2 = xPos(z.to);
          return (
            <g key={z.label}>
              {/* Zone for bar 1 */}
              <rect
                x={x1}
                y={bars[0].y}
                width={x2 - x1}
                height={barH}
                fill={z.color}
                opacity="0.12"
                rx={z.from === 0 ? 4 : z.to >= maxScale ? 4 : 0}
              />
              {/* Zone for bar 2 */}
              <rect
                x={x1}
                y={bars[1].y}
                width={x2 - x1}
                height={barH}
                fill={z.color}
                opacity="0.12"
                rx={z.from === 0 ? 4 : z.to >= maxScale ? 4 : 0}
              />
            </g>
          );
        })}

        {/* Zone labels at top */}
        {zones.map((z) => {
          const midX = (xPos(z.from) + xPos(Math.min(z.to, maxScale))) / 2;
          return (
            <text
              key={`zl-${z.label}`}
              x={midX}
              y={16}
              textAnchor="middle"
              style={{ fontSize: 7, fill: z.color, fontWeight: 600 }}
            >
              {z.label}
            </text>
          );
        })}

        {/* Threshold lines */}
        {[75, 100].map((v) => {
          const x = xPos(v);
          return (
            <line
              key={`th-${v}`}
              x1={x}
              x2={x}
              y1={20}
              y2={bars[1].y + barH + 2}
              stroke="#94A3B8"
              strokeWidth="0.8"
              strokeDasharray="3 2"
              opacity="0.6"
            />
          );
        })}

        {/* Bars */}
        {bars.map((bar) => {
          const w = xPos(Math.min(bar.value, maxScale)) - padL;
          const fillColor =
            bar.value <= 75
              ? "#16A34A"
              : bar.value <= 100
              ? "#EAB308"
              : "#DC2626";
          return (
            <g key={bar.label}>
              {/* Filled bar */}
              <rect
                x={padL}
                y={bar.y}
                width={Math.max(w, 2)}
                height={barH}
                rx={4}
                fill={fillColor}
                opacity="0.6"
              />
              {/* Accent left edge */}
              <rect
                x={padL}
                y={bar.y}
                width={3}
                height={barH}
                rx={1.5}
                fill={accentColor}
              />
              {/* Value label */}
              <text
                x={padL + Math.max(w, 2) + 5}
                y={bar.y + barH / 2 + 3}
                style={{ fontSize: 10, fontWeight: 700 }}
                className="fill-foreground"
              >
                {formatNumber(bar.value, 1)}%
              </text>
              {/* Bar label */}
              <text
                x={padL + 8}
                y={bar.y + barH / 2 + 3}
                style={{ fontSize: 8, fontWeight: 500 }}
                fill="white"
              >
                {bar.label}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

/* ── 5. Retorno ao Acionista (stacked horizontal bars) ───────────────────── */

function ShareholderReturn({
  a,
  b,
  formatNumber,
}: {
  a: CompareEnrichedCompany;
  b: CompareEnrichedCompany;
  formatNumber: (v: number, d?: number) => string;
}) {
  const da = a.dividendData;
  const db = b.dividendData;

  const maxTotal = Math.max(
    Math.abs(da.totalShareholderReturn),
    Math.abs(db.totalShareholderReturn),
    1,
  ) * 1.25;

  const svgW = 400;
  const svgH = 100;
  const padL = 70;
  const padR = 80;
  const plotW = svgW - padL - padR;
  const rowH = 32;
  const barH = 22;

  const companies = [
    { company: a, div: da, side: "a" as Side, y: 10 },
    { company: b, div: db, side: "b" as Side, y: 10 + rowH + 8 },
  ];

  return (
    <div className="space-y-3">
      <h4 className="text-[12px] font-semibold text-foreground uppercase tracking-wider">
        Retorno ao Acionista
      </h4>
      <svg
        viewBox={`0 0 ${svgW} ${svgH}`}
        className="w-full max-w-[460px] mx-auto"
        preserveAspectRatio="xMidYMid meet"
      >
        {companies.map(({ company, div, side, y }) => {
          const divWidth = (Math.abs(div.currentYield) / maxTotal) * plotW;
          const buybackWidth = (Math.abs(div.buybackYield) / maxTotal) * plotW;
          const accentColor = sideColor(side);
          const cy = y + barH / 2;

          return (
            <g key={company.ticker}>
              {/* Ticker label */}
              <text
                x={padL - 6}
                y={cy + 3}
                textAnchor="end"
                style={{ fontSize: 10, fontWeight: 600, fill: accentColor }}
              >
                {company.ticker}
              </text>

              {/* Dividend yield bar */}
              <rect
                x={padL}
                y={y}
                width={Math.max(divWidth, 2)}
                height={barH}
                rx={4}
                fill={accentColor}
                opacity="0.7"
              />
              {divWidth > 30 && (
                <text
                  x={padL + divWidth / 2}
                  y={cy + 3}
                  textAnchor="middle"
                  fill="white"
                  style={{ fontSize: 8, fontWeight: 600 }}
                >
                  Dividendo {formatNumber(div.currentYield, 2)}%
                </text>
              )}

              {/* Buyback yield bar (stacked) */}
              <rect
                x={padL + divWidth}
                y={y}
                width={Math.max(buybackWidth, 2)}
                height={barH}
                rx={4}
                fill={accentColor}
                opacity="0.35"
              />
              {buybackWidth > 30 && (
                <text
                  x={padL + divWidth + buybackWidth / 2}
                  y={cy + 3}
                  textAnchor="middle"
                  className="fill-foreground"
                  style={{ fontSize: 8, fontWeight: 500 }}
                >
                  Recompra {formatNumber(div.buybackYield, 2)}%
                </text>
              )}

              {/* Total label on right */}
              <text
                x={padL + divWidth + buybackWidth + 6}
                y={cy - 1}
                className="fill-foreground"
                style={{ fontSize: 11, fontWeight: 700 }}
              >
                {formatNumber(div.totalShareholderReturn, 2)}%
              </text>
              <text
                x={padL + divWidth + buybackWidth + 6}
                y={cy + 9}
                className="fill-muted-foreground"
                style={{ fontSize: 7 }}
              >
                retorno total
              </text>
            </g>
          );
        })}
      </svg>

      {/* Legend */}
      <div className="flex items-center gap-5 text-[10px] text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-3 w-6 rounded-sm bg-foreground opacity-50" />
          Dividend Yield
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-3 w-6 rounded-sm bg-foreground opacity-20" />
          Buyback Yield
        </span>
      </div>
    </div>
  );
}

/* ── Main Component ───────────────────────────────────────────────────────── */

function diagnosisTone(status: CompareDiagnosis["status"] | undefined): string {
  if (!status) return "bg-muted text-muted-foreground border-border";
  if (status === "COVERED" || status === "OK")
    return "bg-success-surface text-success-text border-success-border";
  if (status === "PRESSURED" || status === "WARN")
    return "bg-warning-surface text-warning-text border-warning-border";
  return "bg-danger-surface text-danger-text border-danger-border";
}

function CoverageDiagnosisBlock({
  ticker,
  payout,
  cash,
}: {
  ticker: string;
  payout?: CompareDiagnosis;
  cash?: CompareDiagnosis;
}) {
  if (!payout && !cash) return null;
  return (
    <div className="rounded-2xl border border-border bg-card p-3 space-y-2">
      <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
        {ticker}
      </div>
      {payout && (
        <div className={`rounded-md border px-2.5 py-1.5 text-[11px] ${diagnosisTone(payout.status)}`}>
          <div className="font-semibold">Payout</div>
          <div className="opacity-90">{payout.text}</div>
        </div>
      )}
      {cash && (
        <div className={`rounded-md border px-2.5 py-1.5 text-[11px] ${diagnosisTone(cash.status)}`}>
          <div className="font-semibold">Cash payout</div>
          <div className="opacity-90">{cash.text}</div>
        </div>
      )}
    </div>
  );
}

export function DividendIsland({ a, b, formatNumber }: DividendIslandProps) {
  return (
    <div className="compare-island compare-surface p-6 scroll-mt-[160px] space-y-8">
      <h3 className="text-base font-semibold text-foreground">Proventos</h3>

      <CompareReadingCard
        a={a.readings.dividend}
        b={b.readings.dividend}
        tickerA={a.ticker}
        tickerB={b.ticker}
        dimension="dividend"
      />

      <CompareDimensionCheckCard
        a={a.dimensionChecks.dividend}
        b={b.dimensionChecks.dividend}
        tickerA={a.ticker}
        tickerB={b.ticker}
      />

      {/* ── 1. KPIs de Dividendos ── */}
      <div className="space-y-3">
        <h4 className="text-[12px] font-semibold text-foreground uppercase tracking-wider">
          KPIs de Dividendos
        </h4>
        <KpiTable a={a} b={b} formatNumber={formatNumber} />
      </div>

      {/* ── 2. Histórico DPA + Payout ── */}
      <div className="space-y-3">
        <h4 className="text-[12px] font-semibold text-foreground uppercase tracking-wider">
          Histórico DPA + Payout
        </h4>
        <div className="compare-side-grid">
          <DpaChart company={a} side="a" formatNumber={formatNumber} />
          <DpaChart company={b} side="b" formatNumber={formatNumber} />
        </div>
      </div>

      {/* ── 3. Yield vs Mercado ── */}
      <div className="space-y-3">
        <h4 className="text-[12px] font-semibold text-foreground uppercase tracking-wider">
          Yield vs Mercado
        </h4>
        <div className="compare-side-grid">
          <YieldDotPlot company={a} side="a" formatNumber={formatNumber} />
          <YieldDotPlot company={b} side="b" formatNumber={formatNumber} />
        </div>
      </div>

      {/* ── 4. Cobertura de Dividendos ── */}
      <div className="space-y-3">
        <h4 className="text-[12px] font-semibold text-foreground uppercase tracking-wider">
          Cobertura de Dividendos
        </h4>
        <div className="compare-side-grid">
          <CoverageBar company={a} side="a" formatNumber={formatNumber} />
          <CoverageBar company={b} side="b" formatNumber={formatNumber} />
        </div>
        <div className="compare-side-grid">
          <CoverageDiagnosisBlock
            ticker={a.ticker}
            payout={a.dividendData.payoutRatioDiagnosis}
            cash={a.dividendData.cashPayoutRatioDiagnosis}
          />
          <CoverageDiagnosisBlock
            ticker={b.ticker}
            payout={b.dividendData.payoutRatioDiagnosis}
            cash={b.dividendData.cashPayoutRatioDiagnosis}
          />
        </div>
      </div>

      {/* ── 5. Retorno ao Acionista ── */}
      <ShareholderReturn a={a} b={b} formatNumber={formatNumber} />
    </div>
  );
}

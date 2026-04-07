"use client";

import { useState } from "react";
import type { CompareEnrichedCompany, CompareNarrative } from "../../interfaces";
import { CompareReadingCard } from "../shared/CompareReadingCard";
import { CompareDimensionCheckCard } from "../shared/CompareDimensionCheckCard";
import { CompareSectionCriteria } from "../shared/CompareSectionCriteria";
import { CompareBalanceSheetStructure } from "../shared/CompareBalanceSheetStructure";
import { CompareNarrativeBlock } from "../shared/CompareNarrativeBlock";

type PastSeriesKey = "revenue" | "earnings" | "fcl" | "fco" | "opex";
type PastSeriesVisibility = Record<PastSeriesKey, boolean>;

/* ── Types ────────────────────────────────────────────────────────────────── */

interface PastIslandProps {
  a: CompareEnrichedCompany;
  b: CompareEnrichedCompany;
  formatNumber: (value: number, digits?: number) => string;
  narrative?: CompareNarrative | null;
}

type Side = "a" | "b";

/* ── Helpers ──────────────────────────────────────────────────────────────── */

function sideColor(side: Side) {
  return side === "a" ? "var(--brand)" : "var(--compare-b)";
}
function sideSurface(side: Side) {
  return side === "a" ? "var(--brand-surface)" : "var(--compare-b-surface)";
}
function sideTextClass(side: Side) {
  return side === "a" ? "text-brand-text" : "text-compare-b-text";
}

/** Compact BRL label: R$ 1,2 bi / R$ 350 mi / R$ 900 mil */
function compactBRL(value: number): string {
  const abs = Math.abs(value);
  const sign = value < 0 ? "-" : "";
  if (abs >= 1e9) return `${sign}R$ ${(abs / 1e9).toFixed(1).replace(".", ",")} bi`;
  if (abs >= 1e6) return `${sign}R$ ${(abs / 1e6).toFixed(0)} mi`;
  if (abs >= 1e3) return `${sign}R$ ${(abs / 1e3).toFixed(0)} mil`;
  return `${sign}R$ ${abs.toFixed(0)}`;
}

/* ═══════════════════════════════════════════════════════════════════════════
   1. RECEITA E LUCRO HISTORICOS (side-by-side bar + line SVG)
   ═══════════════════════════════════════════════════════════════════════════ */

function RevEarningsChart({
  company,
  side,
  visible,
}: {
  company: CompareEnrichedCompany;
  side: Side;
  visible: PastSeriesVisibility;
}) {
  const { revenueSeries, earningsSeries } = company.pastData;
  const fclSeries = company.pastData.freeCashFlowSeries ?? [];
  const fcoSeries = company.pastData.operatingCashFlowSeries ?? [];
  const opexSeries = company.pastData.operatingExpensesSeries ?? [];
  if (!revenueSeries.length) return null;

  const W = 340;
  const H = 200;
  const PAD_L = 50;
  const PAD_R = 12;
  const PAD_T = 24;
  const PAD_B = 28;
  const plotW = W - PAD_L - PAD_R;
  const plotH = H - PAD_T - PAD_B;

  // Use a single unified axis so all line series share the same scale as revenue bars
  const allVals: number[] = [];
  if (visible.revenue) allVals.push(...revenueSeries.map((s) => s.value));
  if (visible.earnings) allVals.push(...earningsSeries.map((s) => s.value));
  if (visible.fcl) allVals.push(...fclSeries.map((s) => s.value));
  if (visible.fco) allVals.push(...fcoSeries.map((s) => s.value));
  if (visible.opex) allVals.push(...opexSeries.map((s) => s.value));
  if (!allVals.length) allVals.push(0, 1);

  const maxVal = Math.max(...allVals, 1);
  const minVal = Math.min(0, ...allVals);
  const rangeVal = maxVal - minVal || 1;

  const n = revenueSeries.length;
  const barGap = 4;
  const barW = Math.min(28, (plotW / n) - barGap);
  const step = plotW / n;

  const color = sideColor(side);
  const lineColor = side === "a" ? "#0B7A6E" : "#3965B8";
  const fclColor = "#10B981";
  const fcoColor = "#0EA5E9";
  const opexColor = "#F97316";

  function toY(v: number) {
    return PAD_T + plotH - ((v - minVal) / rangeVal) * plotH;
  }
  const revToY = toY;
  const earnToY = toY;

  // Build line points for any series by year index
  function buildPoints(series: { year: string; value: number }[]) {
    const byYear = Object.fromEntries(series.map((s) => [s.year, s.value]));
    return revenueSeries
      .map((r, i) => {
        const v = byYear[r.year];
        if (v === undefined) return null;
        return { x: PAD_L + step * i + step / 2, y: toY(v), value: v };
      })
      .filter(Boolean) as { x: number; y: number; value: number }[];
  }

  // Earnings line path
  const earningsPoints = buildPoints(earningsSeries);
  const linePath = earningsPoints
    .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x},${p.y}`)
    .join(" ");

  const fclPoints = buildPoints(fclSeries);
  const fclPath = fclPoints.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x},${p.y}`).join(" ");

  const fcoPoints = buildPoints(fcoSeries);
  const fcoPath = fcoPoints.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x},${p.y}`).join(" ");

  const opexPoints = buildPoints(opexSeries);
  const opexPath = opexPoints.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x},${p.y}`).join(" ");

  // Y-axis ticks (unified axis)
  const tickCount = 4;
  const ticks = Array.from({ length: tickCount + 1 }, (_, i) => {
    const val = minVal + (rangeVal / tickCount) * i;
    return { val, y: toY(val) };
  });

  return (
    <div className="space-y-2">
      <span className={`text-[11px] font-semibold uppercase tracking-wider ${sideTextClass(side)}`}>
        {company.ticker} — Receita & Lucro
      </span>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full max-w-[380px] mx-auto" preserveAspectRatio="xMidYMid meet">
        {/* Grid lines + Y labels */}
        {ticks.map((t, i) => (
          <g key={i}>
            <line
              x1={PAD_L}
              y1={t.y}
              x2={W - PAD_R}
              y2={t.y}
              stroke="var(--border)"
              strokeWidth={0.5}
              strokeDasharray={i === 0 ? undefined : "3,3"}
            />
            <text
              x={PAD_L - 4}
              y={t.y + 3}
              textAnchor="end"
              className="fill-muted-foreground"
              style={{ fontSize: 7 }}
            >
              {compactBRL(t.val).replace("R$ ", "")}
            </text>
          </g>
        ))}

        {/* Revenue bars */}
        {visible.revenue && revenueSeries.map((s, i) => {
          const x = PAD_L + step * i + (step - barW) / 2;
          const barH = Math.max(((s.value - minVal) / rangeVal) * plotH, 1);
          const y = PAD_T + plotH - barH;
          return (
            <g key={`bar-${i}`}>
              <rect x={x} y={y} width={barW} height={barH} rx={3} fill={color} opacity={0.25} />
              <rect x={x} y={y} width={barW} height={Math.min(barH, 3)} rx={1.5} fill={color} opacity={0.55} />
            </g>
          );
        })}

        {/* OpEx line (drawn first so it sits behind) */}
        {visible.opex && opexPath && (
          <>
            <path d={opexPath} fill="none" stroke={opexColor} strokeWidth="1.8" strokeDasharray="1 3" strokeLinecap="round" opacity="0.85" />
            {opexPoints.map((p, i) => (
              <circle key={`opex-${i}`} cx={p.x} cy={p.y} r="2" fill="var(--card)" stroke={opexColor} strokeWidth="1.2" />
            ))}
          </>
        )}

        {/* FCO line */}
        {visible.fco && fcoPath && (
          <>
            <path d={fcoPath} fill="none" stroke={fcoColor} strokeWidth="1.8" strokeDasharray="2 2" strokeLinecap="round" opacity="0.85" />
            {fcoPoints.map((p, i) => (
              <circle key={`fco-${i}`} cx={p.x} cy={p.y} r="2" fill="var(--card)" stroke={fcoColor} strokeWidth="1.2" />
            ))}
          </>
        )}

        {/* FCL line */}
        {visible.fcl && fclPath && (
          <>
            <path d={fclPath} fill="none" stroke={fclColor} strokeWidth="2" strokeDasharray="4 3" strokeLinecap="round" opacity="0.9" />
            {fclPoints.map((p, i) => (
              <circle key={`fcl-${i}`} cx={p.x} cy={p.y} r="2.5" fill="var(--card)" stroke={fclColor} strokeWidth="1.3" />
            ))}
          </>
        )}

        {/* Earnings area fill */}
        {visible.earnings && earningsPoints.length > 1 && (
          <path
            d={`${linePath} L ${earningsPoints[earningsPoints.length - 1].x},${PAD_T + plotH} L ${earningsPoints[0].x},${PAD_T + plotH} Z`}
            fill={lineColor}
            opacity={0.08}
          />
        )}

        {/* Earnings line */}
        {visible.earnings && linePath && (
          <path
            d={linePath}
            fill="none"
            stroke={lineColor}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )}

        {/* Earnings dots + values */}
        {visible.earnings && earningsPoints.map((p, i) => (
          <g key={`dot-${i}`}>
            <circle cx={p.x} cy={p.y} r="3" fill="var(--card)" stroke={lineColor} strokeWidth="1.5" />
            <text
              x={p.x}
              y={p.y - 7}
              textAnchor="middle"
              fill={lineColor}
              style={{ fontSize: 6.5, fontWeight: 600 }}
            >
              {compactBRL(p.value)}
            </text>
          </g>
        ))}

        {/* Year labels */}
        {revenueSeries.map((s, i) => {
          const x = PAD_L + step * i + step / 2;
          return (
            <text
              key={`yr-${i}`}
              x={x}
              y={H - 6}
              textAnchor="middle"
              className="fill-muted-foreground"
              style={{ fontSize: 8 }}
            >
              {s.year}
            </text>
          );
        })}
      </svg>

      {/* Legend */}
      <div className="flex items-center flex-wrap gap-x-4 gap-y-1 text-[10px] text-muted-foreground">
        {visible.revenue && (
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-3 w-3 rounded" style={{ backgroundColor: color, opacity: 0.3 }} />
            Receita
          </span>
        )}
        {visible.earnings && (
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-0.5 w-4 rounded-full" style={{ backgroundColor: lineColor }} />
            Lucro
          </span>
        )}
        {visible.fcl && fclSeries.length > 0 && (
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-0.5 w-4 rounded-full" style={{ backgroundColor: fclColor }} />
            FCL
          </span>
        )}
        {visible.fco && fcoSeries.length > 0 && (
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-0.5 w-4 rounded-full" style={{ backgroundColor: fcoColor }} />
            FCO
          </span>
        )}
        {visible.opex && opexSeries.length > 0 && (
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-0.5 w-4 rounded-full" style={{ backgroundColor: opexColor }} />
            OpEx
          </span>
        )}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   2. WATERFALL FCF (side-by-side)
   ═══════════════════════════════════════════════════════════════════════════ */

function WaterfallFCF({
  company,
  side,
}: {
  company: CompareEnrichedCompany;
  side: Side;
}) {
  const wf = company.pastData.cashFlowWaterfall;
  if (!wf) {
    return (
      <div className="flex items-center justify-center rounded-xl border border-dashed border-border p-8">
        <span className="text-xs text-muted-foreground">Dados de FCF indisponíveis para {company.ticker}</span>
      </div>
    );
  }

  const items: { label: string; value: number; isTotal: boolean }[] = [
    { label: "Lucro\nLíquido", value: wf.earnings, isTotal: false },
    { label: "Deprec.", value: wf.depreciation, isTotal: false },
    { label: "SBC", value: wf.stockBasedComp, isTotal: false },
    { label: "Cap.\nGiro", value: wf.netWorkingCapital, isTotal: false },
    { label: "Outros", value: wf.others, isTotal: false },
    { label: "FCF", value: wf.freeCashFlow, isTotal: true },
  ];

  const W = 340;
  const H = 220;
  const PAD_L = 12;
  const PAD_R = 12;
  const PAD_T = 30;
  const PAD_B = 40;
  const plotW = W - PAD_L - PAD_R;
  const plotH = H - PAD_T - PAD_B;

  // Compute running totals for waterfall positioning
  const cumulativeStart: number[] = [];
  const cumulativeEnd: number[] = [];
  let running = 0;
  for (let i = 0; i < items.length; i++) {
    if (items[i].isTotal) {
      cumulativeStart.push(0);
      cumulativeEnd.push(items[i].value);
    } else {
      cumulativeStart.push(running);
      running += items[i].value;
      cumulativeEnd.push(running);
    }
  }

  const allVals = [...cumulativeStart, ...cumulativeEnd];
  const maxVal = Math.max(...allVals, 0);
  const minVal = Math.min(0, ...allVals);
  const range = maxVal - minVal || 1;

  const n = items.length;
  const step = plotW / n;
  const barW = Math.min(36, step - 10);

  function valToY(v: number) {
    return PAD_T + plotH - ((v - minVal) / range) * plotH;
  }

  const zeroY = valToY(0);
  const color = sideColor(side);

  return (
    <div className="space-y-2">
      <span className={`text-[11px] font-semibold uppercase tracking-wider ${sideTextClass(side)}`}>
        {company.ticker} — Waterfall FCF
      </span>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full max-w-[380px] mx-auto" preserveAspectRatio="xMidYMid meet">
        {/* Zero line */}
        <line x1={PAD_L} y1={zeroY} x2={W - PAD_R} y2={zeroY} stroke="var(--border)" strokeWidth={0.5} />

        {items.map((item, i) => {
          const startY = valToY(cumulativeStart[i]);
          const endY = valToY(cumulativeEnd[i]);
          const topY = Math.min(startY, endY);
          const barH = Math.max(Math.abs(startY - endY), 1);
          const x = PAD_L + step * i + (step - barW) / 2;
          const isPositive = item.value >= 0;

          let fillColor: string;
          if (item.isTotal) {
            fillColor = color;
          } else if (isPositive) {
            fillColor = "#22C55E";
          } else {
            fillColor = "#EF4444";
          }

          // Connector dashed line from end of this bar to start of next
          const connectorLine =
            i < items.length - 1 && !items[i + 1].isTotal ? (
              <line
                x1={x + barW}
                y1={endY}
                x2={PAD_L + step * (i + 1) + (step - barW) / 2}
                y2={endY}
                stroke="var(--muted-foreground)"
                strokeWidth={0.7}
                strokeDasharray="2,2"
                opacity={0.4}
              />
            ) : null;

          return (
            <g key={i}>
              {/* Bar */}
              <rect
                x={x}
                y={topY}
                width={barW}
                height={barH}
                rx={3}
                fill={fillColor}
                opacity={item.isTotal ? 0.85 : 0.65}
              />
              {/* Value label */}
              <text
                x={x + barW / 2}
                y={topY - 5}
                textAnchor="middle"
                fill={fillColor}
                style={{ fontSize: 7, fontWeight: 600 }}
              >
                {compactBRL(item.value)}
              </text>
              {/* Column label */}
              {item.label.split("\n").map((line, li) => (
                <text
                  key={li}
                  x={x + barW / 2}
                  y={H - PAD_B + 12 + li * 10}
                  textAnchor="middle"
                  className="fill-muted-foreground"
                  style={{ fontSize: 7.5 }}
                >
                  {line}
                </text>
              ))}
              {/* +/- indicator */}
              {!item.isTotal && (
                <text
                  x={x + barW / 2}
                  y={topY - 13}
                  textAnchor="middle"
                  fill={isPositive ? "#22C55E" : "#EF4444"}
                  style={{ fontSize: 8, fontWeight: 700 }}
                >
                  {isPositive ? "+" : "−"}
                </text>
              )}
              {connectorLine}
            </g>
          );
        })}
      </svg>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   3. CRESCIMENTO HISTORICO (comparative grouped bars)
   ═══════════════════════════════════════════════════════════════════════════ */

function GrowthBars({
  a,
  b,
  formatNumber,
}: {
  a: CompareEnrichedCompany;
  b: CompareEnrichedCompany;
  formatNumber: (value: number, digits?: number) => string;
}) {
  const groups = [
    {
      label: "Lucro",
      aVal: a.pastData.earningsGrowthRate,
      bVal: b.pastData.earningsGrowthRate,
      indVal: a.pastData.industryGrowth,
    },
    {
      label: "Receita",
      aVal: a.pastData.revenueGrowthRate,
      bVal: b.pastData.revenueGrowthRate,
      indVal: a.pastData.industryGrowth,
    },
  ];

  const maxAbs = Math.max(
    ...groups.flatMap((g) => [Math.abs(g.aVal), Math.abs(g.bVal), Math.abs(g.indVal)]),
    1,
  );

  return (
    <div className="space-y-4">
      <h4 className="text-[12px] font-semibold text-foreground uppercase tracking-wider">
        Crescimento Histórico
      </h4>
      {groups.map((g) => (
        <div key={g.label} className="space-y-2">
          <span className="text-[11px] font-medium text-muted-foreground">{g.label}</span>
          <div className="space-y-1.5">
            {/* Company A */}
            <div className="flex items-center gap-2">
              <span className="w-16 text-right text-[10px] text-brand-text font-medium truncate">{a.ticker}</span>
              <div className="relative flex-1 h-5 rounded-md bg-muted overflow-hidden">
                <div
                  className="absolute top-0 h-full rounded-md transition-all"
                  style={{
                    width: `${Math.min((Math.abs(g.aVal) / maxAbs) * 100, 100)}%`,
                    backgroundColor: "var(--brand)",
                    opacity: 0.55,
                    left: g.aVal >= 0 ? 0 : undefined,
                    right: g.aVal < 0 ? 0 : undefined,
                  }}
                />
                <span className="absolute inset-0 flex items-center justify-end pr-2 text-[10px] font-semibold text-foreground">
                  {formatNumber(g.aVal, 1)}%
                </span>
              </div>
            </div>
            {/* Company B */}
            <div className="flex items-center gap-2">
              <span className="w-16 text-right text-[10px] text-compare-b-text font-medium truncate">{b.ticker}</span>
              <div className="relative flex-1 h-5 rounded-md bg-muted overflow-hidden">
                <div
                  className="absolute top-0 h-full rounded-md transition-all"
                  style={{
                    width: `${Math.min((Math.abs(g.bVal) / maxAbs) * 100, 100)}%`,
                    backgroundColor: "var(--compare-b)",
                    opacity: 0.55,
                  }}
                />
                <span className="absolute inset-0 flex items-center justify-end pr-2 text-[10px] font-semibold text-foreground">
                  {formatNumber(g.bVal, 1)}%
                </span>
              </div>
            </div>
            {/* Industry */}
            <div className="flex items-center gap-2">
              <span className="w-16 text-right text-[10px] text-muted-foreground font-medium">Indústria</span>
              <div className="relative flex-1 h-5 rounded-md bg-muted overflow-hidden">
                <div
                  className="absolute top-0 h-full rounded-md transition-all"
                  style={{
                    width: `${Math.min((Math.abs(g.indVal) / maxAbs) * 100, 100)}%`,
                    backgroundColor: "var(--muted-foreground)",
                    opacity: 0.3,
                  }}
                />
                <span className="absolute inset-0 flex items-center justify-end pr-2 text-[10px] font-semibold text-muted-foreground">
                  {formatNumber(g.indVal, 1)}%
                </span>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   4. MARGENS (comparative table with proportional bars + winner highlight)
   ═══════════════════════════════════════════════════════════════════════════ */

function MarginsTable({
  a,
  b,
  formatNumber,
}: {
  a: CompareEnrichedCompany;
  b: CompareEnrichedCompany;
  formatNumber: (value: number, digits?: number) => string;
}) {
  const rows = [
    { label: "Bruta", aVal: a.pastData.grossMargin, bVal: b.pastData.grossMargin },
    { label: "Operacional", aVal: a.pastData.operatingMargin, bVal: b.pastData.operatingMargin },
    { label: "Líquida", aVal: a.pastData.netMargin, bVal: b.pastData.netMargin },
  ];

  const maxAbs = Math.max(...rows.flatMap((r) => [Math.abs(r.aVal), Math.abs(r.bVal)]), 1);

  return (
    <div className="space-y-3">
      <h4 className="text-[12px] font-semibold text-foreground uppercase tracking-wider">
        Margens
      </h4>
      <div className="overflow-hidden rounded-xl border border-border">
        {/* Header */}
        <div className="grid grid-cols-[1fr_80px_1fr] bg-muted/50 px-3 py-2">
          <span className="text-[10px] font-semibold text-brand-text uppercase">{a.ticker}</span>
          <span className="text-[10px] font-semibold text-muted-foreground uppercase text-center">Margem</span>
          <span className="text-[10px] font-semibold text-compare-b-text uppercase text-right">{b.ticker}</span>
        </div>

        {rows.map((row) => {
          const aWins = row.aVal > row.bVal;
          const bWins = row.bVal > row.aVal;
          const aBarW = (Math.abs(row.aVal) / maxAbs) * 100;
          const bBarW = (Math.abs(row.bVal) / maxAbs) * 100;

          return (
            <div key={row.label} className="grid grid-cols-[1fr_80px_1fr] items-center px-3 py-2.5 border-t border-border">
              {/* Company A cell */}
              <div className="flex items-center gap-2">
                <div className="relative flex-1 h-5 rounded bg-muted overflow-hidden">
                  <div
                    className="absolute right-0 top-0 h-full rounded transition-all"
                    style={{
                      width: `${aBarW}%`,
                      backgroundColor: "var(--brand)",
                      opacity: aWins ? 0.45 : 0.2,
                    }}
                  />
                </div>
                <span
                  className={`text-[11px] font-semibold min-w-[44px] text-right ${aWins ? "text-brand-text" : "text-muted-foreground"}`}
                >
                  {formatNumber(row.aVal, 1)}%
                </span>
                {aWins && (
                  <svg width="10" height="10" viewBox="0 0 10 10" className="shrink-0">
                    <circle cx="5" cy="5" r="4" fill="var(--brand)" opacity={0.8} />
                    <path d="M3 5.2 L4.5 6.5 L7 3.8" stroke="white" strokeWidth="1.2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </div>

              {/* Center label */}
              <span className="text-[11px] font-medium text-foreground text-center">{row.label}</span>

              {/* Company B cell */}
              <div className="flex items-center gap-2 justify-end">
                {bWins && (
                  <svg width="10" height="10" viewBox="0 0 10 10" className="shrink-0">
                    <circle cx="5" cy="5" r="4" fill="var(--compare-b)" opacity={0.8} />
                    <path d="M3 5.2 L4.5 6.5 L7 3.8" stroke="white" strokeWidth="1.2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
                <span
                  className={`text-[11px] font-semibold min-w-[44px] text-left ${bWins ? "text-compare-b-text" : "text-muted-foreground"}`}
                >
                  {formatNumber(row.bVal, 1)}%
                </span>
                <div className="relative flex-1 h-5 rounded bg-muted overflow-hidden">
                  <div
                    className="absolute left-0 top-0 h-full rounded transition-all"
                    style={{
                      width: `${bBarW}%`,
                      backgroundColor: "var(--compare-b)",
                      opacity: bWins ? 0.45 : 0.2,
                    }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   5. ROE & ROCE (semi-circular gauge pairs)
   ═══════════════════════════════════════════════════════════════════════════ */

function SemiGauge({
  value,
  benchmark,
  label,
  benchmarkLabel,
  color,
  maxScale,
}: {
  value: number;
  benchmark: number;
  label: string;
  benchmarkLabel: string;
  color: string;
  maxScale: number;
}) {
  const W = 120;
  const H = 72;
  const cx = W / 2;
  const cy = 58;
  const r = 42;

  // Angle range: PI (180 degrees, left to right)
  const startAngle = Math.PI;
  const endAngle = 0;

  function valueToAngle(v: number) {
    const clamped = Math.max(0, Math.min(v, maxScale));
    const ratio = clamped / maxScale;
    return startAngle - ratio * Math.PI;
  }

  function angleToXY(angle: number, radius: number) {
    return {
      x: cx + radius * Math.cos(angle),
      y: cy - radius * Math.sin(angle),
    };
  }

  // Arc path helper
  function describeArc(startA: number, endA: number, radius: number) {
    const start = angleToXY(startA, radius);
    const end = angleToXY(endA, radius);
    const largeArc = Math.abs(startA - endA) > Math.PI ? 1 : 0;
    return `M ${start.x},${start.y} A ${radius},${radius} 0 ${largeArc} 1 ${end.x},${end.y}`;
  }

  const valAngle = valueToAngle(value);
  const benchAngle = valueToAngle(benchmark);

  // Needle endpoint
  const needleLen = r - 6;
  const needle = angleToXY(valAngle, needleLen);

  // Benchmark tick
  const benchOuter = angleToXY(benchAngle, r + 3);
  const benchInner = angleToXY(benchAngle, r - 8);

  return (
    <div className="flex flex-col items-center">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full max-w-[120px]">
        {/* Background arc */}
        <path
          d={describeArc(startAngle, endAngle, r)}
          fill="none"
          stroke="var(--muted)"
          strokeWidth="7"
          strokeLinecap="round"
        />
        {/* Filled arc up to value */}
        <path
          d={describeArc(startAngle, valAngle, r)}
          fill="none"
          stroke={color}
          strokeWidth="7"
          strokeLinecap="round"
          opacity={0.7}
        />
        {/* Benchmark tick */}
        <line
          x1={benchInner.x}
          y1={benchInner.y}
          x2={benchOuter.x}
          y2={benchOuter.y}
          stroke="var(--muted-foreground)"
          strokeWidth="1.5"
          strokeDasharray="2,1"
        />
        {/* Needle */}
        <line
          x1={cx}
          y1={cy}
          x2={needle.x}
          y2={needle.y}
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
        />
        <circle cx={cx} cy={cy} r="3" fill={color} />
        {/* Value text */}
        <text
          x={cx}
          y={cy - 12}
          textAnchor="middle"
          fill={color}
          style={{ fontSize: 13, fontWeight: 700 }}
        >
          {value.toFixed(1)}%
        </text>
        {/* Min / Max */}
        <text x={cx - r - 2} y={cy + 10} textAnchor="middle" className="fill-muted-foreground" style={{ fontSize: 6 }}>
          0
        </text>
        <text x={cx + r + 2} y={cy + 10} textAnchor="middle" className="fill-muted-foreground" style={{ fontSize: 6 }}>
          {maxScale}%
        </text>
      </svg>
      <span className="text-[11px] font-semibold text-foreground mt-0.5">{label}</span>
      <span className="text-[9px] text-muted-foreground">
        Indústria: {benchmark.toFixed(1)}% <span className="opacity-50">({benchmarkLabel})</span>
      </span>
    </div>
  );
}

function ReturnGauges({
  company,
  side,
}: {
  company: CompareEnrichedCompany;
  side: Side;
}) {
  const pd = company.pastData;
  const color = sideColor(side);

  // Scale max: at least 30, or max value + 10 rounded up
  const allVals = [pd.roe, pd.roce, pd.roa, pd.industryROE, pd.industryROCE, pd.industryROA];
  const maxScale = Math.max(30, Math.ceil((Math.max(...allVals.map(Math.abs)) + 10) / 10) * 10);

  return (
    <div className="space-y-3">
      <span className={`text-[11px] font-semibold uppercase tracking-wider ${sideTextClass(side)}`}>
        {company.ticker} — Retorno
      </span>
      <div className="grid grid-cols-3 gap-3">
        <SemiGauge
          value={pd.roe}
          benchmark={pd.industryROE}
          label="ROE"
          benchmarkLabel="ind."
          color={color}
          maxScale={maxScale}
        />
        <SemiGauge
          value={pd.roa}
          benchmark={pd.industryROA}
          label="ROA"
          benchmarkLabel="ind."
          color={color}
          maxScale={maxScale}
        />
        <SemiGauge
          value={pd.roce}
          benchmark={pd.industryROCE}
          label="ROCE"
          benchmarkLabel="ind."
          color={color}
          maxScale={maxScale}
        />
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════════════════════════ */

export function PastIsland({ a, b, formatNumber, narrative }: PastIslandProps) {
  const [pastVisible, setPastVisible] = useState<PastSeriesVisibility>({
    revenue: true,
    earnings: true,
    fcl: true,
    fco: false,
    opex: false,
  });
  const hasFcl =
    (a.pastData.freeCashFlowSeries?.length ?? 0) > 0 ||
    (b.pastData.freeCashFlowSeries?.length ?? 0) > 0;
  const hasFco =
    (a.pastData.operatingCashFlowSeries?.length ?? 0) > 0 ||
    (b.pastData.operatingCashFlowSeries?.length ?? 0) > 0;
  const hasOpex =
    (a.pastData.operatingExpensesSeries?.length ?? 0) > 0 ||
    (b.pastData.operatingExpensesSeries?.length ?? 0) > 0;
  function togglePast(k: PastSeriesKey) {
    setPastVisible((prev) => ({ ...prev, [k]: !prev[k] }));
  }

  return (
    <div className="space-y-8">
      <h3 className="text-base font-semibold text-foreground">
        Desempenho Passado
      </h3>

      <CompareNarrativeBlock narrative={narrative ?? null} variant="section" />

      <CompareReadingCard
        a={a.readings.past}
        b={b.readings.past}
        tickerA={a.ticker}
        tickerB={b.ticker}
        dimension="past"
      />

      <CompareDimensionCheckCard
        a={a.dimensionChecks.past}
        b={b.dimensionChecks.past}
        tickerA={a.ticker}
        tickerB={b.ticker}
      />

      {/* 1 ─ Receita, Lucro e Fluxo de Caixa Históricos */}
      <section className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h4 className="text-[12px] font-semibold text-foreground uppercase tracking-wider">
            Receita, Lucro e Fluxo de Caixa Históricos
          </h4>
          <div className="flex items-center gap-1 text-[10px]">
            {(
              [
                { k: "revenue" as const, label: "Receita", enabled: true },
                { k: "earnings" as const, label: "Lucro", enabled: true },
                { k: "fcl" as const, label: "FCL", enabled: hasFcl },
                { k: "fco" as const, label: "FCO", enabled: hasFco },
                { k: "opex" as const, label: "OpEx", enabled: hasOpex },
              ] as const
            )
              .filter((item) => item.enabled)
              .map((item) => (
                <button
                  key={item.k}
                  type="button"
                  onClick={() => togglePast(item.k)}
                  className={`px-2 py-0.5 rounded border transition-colors ${
                    pastVisible[item.k]
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
          <RevEarningsChart company={a} side="a" visible={pastVisible} />
          <RevEarningsChart company={b} side="b" visible={pastVisible} />
        </div>
        <CompareSectionCriteria
          a={a.pastData.earningsQualityCriteria ?? []}
          b={b.pastData.earningsQualityCriteria ?? []}
          tickerA={a.ticker}
          tickerB={b.ticker}
          title="Qualidade dos lucros"
        />
      </section>

      {/* 2 ─ Waterfall FCF */}
      <section className="space-y-3">
        <h4 className="text-[12px] font-semibold text-foreground uppercase tracking-wider">
          Waterfall FCF
        </h4>
        <div className="compare-side-grid">
          <WaterfallFCF company={a} side="a" />
          <WaterfallFCF company={b} side="b" />
        </div>
        <CompareSectionCriteria
          a={a.pastData.fcfCriteria ?? []}
          b={b.pastData.fcfCriteria ?? []}
          tickerA={a.ticker}
          tickerB={b.ticker}
          title="Fluxo de caixa livre"
        />
      </section>

      {/* 3 ─ Crescimento Histórico */}
      <GrowthBars a={a} b={b} formatNumber={formatNumber} />
      <CompareSectionCriteria
        a={a.pastData.growthCriteria ?? []}
        b={b.pastData.growthCriteria ?? []}
        tickerA={a.ticker}
        tickerB={b.ticker}
        title="Crescimento vs setor"
      />

      {/* 4 ─ Margens */}
      <MarginsTable a={a} b={b} formatNumber={formatNumber} />

      {/* 5 ─ ROE e ROCE */}
      <section className="space-y-3">
        <h4 className="text-[12px] font-semibold text-foreground uppercase tracking-wider">
          ROE e ROCE
        </h4>
        <div className="compare-side-grid">
          <ReturnGauges company={a} side="a" />
          <ReturnGauges company={b} side="b" />
        </div>
      </section>

      {/* 6 ─ Estrutura do Balanço */}
      <CompareBalanceSheetStructure
        a={a.pastData.balanceSheet}
        b={b.pastData.balanceSheet}
        tickerA={a.ticker}
        tickerB={b.ticker}
        formatNumber={formatNumber}
      />
    </div>
  );
}

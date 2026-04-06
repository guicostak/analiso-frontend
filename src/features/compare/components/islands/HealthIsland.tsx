"use client";

import { Check, X } from "lucide-react";
import type { CompareEnrichedCompany } from "../../interfaces";
import { CompareReadingCard } from "../shared/CompareReadingCard";
import { CompareDimensionCheckCard } from "../shared/CompareDimensionCheckCard";
import { CompareSectionCriteria } from "../shared/CompareSectionCriteria";
import { CompareBalanceSheetStructure } from "../shared/CompareBalanceSheetStructure";

/* ── Types ────────────────────────────────────────────────────────────────── */

interface HealthIslandProps {
  a: CompareEnrichedCompany;
  b: CompareEnrichedCompany;
  formatNumber: (value: number, digits?: number) => string;
}

type Side = "a" | "b";

/* ── Helpers ──────────────────────────────────────────────────────────────── */

function accent(side: Side) {
  return {
    color: side === "a" ? "var(--brand)" : "var(--compare-b)",
    surface: side === "a" ? "var(--brand-surface)" : "var(--compare-b-surface)",
    text: side === "a" ? "text-brand-text" : "text-compare-b-text",
    border: side === "a" ? "border-brand-border" : "border-compare-b-border",
  };
}

function fmtBRL(v: number, formatNumber: (v: number, d?: number) => string): string {
  const abs = Math.abs(v);
  if (abs >= 1e9) return `R$ ${formatNumber(v / 1e9, 1)} bi`;
  if (abs >= 1e6) return `R$ ${formatNumber(v / 1e6, 0)} M`;
  if (abs >= 1e3) return `R$ ${formatNumber(v / 1e3, 0)} mil`;
  return `R$ ${formatNumber(v, 0)}`;
}

/* ── 1. Posição Financeira ────────────────────────────────────────────────── */

function FinancialPositionCard({
  company,
  side,
  formatNumber,
}: {
  company: CompareEnrichedCompany;
  side: Side;
  formatNumber: (v: number, d?: number) => string;
}) {
  const a = accent(side);
  const h = company.healthData;

  const stRatio = h.shortTermLiabilities > 0 ? h.shortTermAssets / h.shortTermLiabilities : 0;
  const ltRatio = h.longTermLiabilities > 0 ? h.longTermAssets / h.longTermLiabilities : 0;

  // Cores: Ativos usa a cor do side (brand/compare-b), Passivos usa variante clara
  const assetColor = a.color;
  const liabColor = side === "a" ? "var(--brand-surface-strong, #bae6fd)" : "var(--compare-b-surface-strong, #fcd7d3)";
  const assetTextColor = "#FFFFFF";
  const liabTextColor = "#262E3A";

  // Escala global: maior valor entre todos define a altura maxima
  const maxVal = Math.max(
    h.shortTermAssets,
    h.shortTermLiabilities,
    h.longTermAssets,
    h.longTermLiabilities,
    1,
  );

  // SVG layout: duas secoes lado a lado (curto / longo), cada uma com 2 barras
  const svgW = 340;
  const svgH = 180;
  const padT = 28; // espaco para valores no topo
  const padB = 36; // espaco para labels embaixo
  const maxBarH = svgH - padT - padB;
  const sectionW = svgW / 2;
  const barW = 52;
  const gapBetween = 14;

  function renderSection(
    title: string,
    assetVal: number,
    liabVal: number,
    ratio: number,
    xOffset: number,
  ) {
    const assetBarH = (assetVal / maxVal) * maxBarH;
    const liabBarH = (liabVal / maxVal) * maxBarH;
    const baseline = svgH - padB;
    // Centraliza as duas barras dentro da secao
    const totalGroupW = barW * 2 + gapBetween;
    const groupStartX = xOffset + (sectionW - totalGroupW) / 2;
    const assetX = groupStartX;
    const liabX = groupStartX + barW + gapBetween;
    const assetY = baseline - assetBarH;
    const liabY = baseline - liabBarH;
    const covers = assetVal >= liabVal;

    return (
      <g key={title}>
        {/* Asset bar */}
        <rect
          x={assetX}
          y={assetY}
          width={barW}
          height={Math.max(assetBarH, 1)}
          rx={3}
          fill={assetColor}
        />
        <text
          x={assetX + barW / 2}
          y={assetY - 6}
          textAnchor="middle"
          fontSize={10}
          fontWeight={600}
          fill="currentColor"
          className="fill-foreground"
        >
          {fmtBRL(assetVal, formatNumber)}
        </text>
        <text
          x={assetX + 6}
          y={assetY + 14}
          fontSize={10}
          fontWeight={600}
          fill={assetTextColor}
        >
          Ativos
        </text>

        {/* Liability bar */}
        <rect
          x={liabX}
          y={liabY}
          width={barW}
          height={Math.max(liabBarH, 1)}
          rx={3}
          fill={liabColor}
        />
        <text
          x={liabX + barW / 2}
          y={liabY - 6}
          textAnchor="middle"
          fontSize={10}
          fontWeight={600}
          fill="currentColor"
          className="fill-foreground"
        >
          {fmtBRL(liabVal, formatNumber)}
        </text>
        <text
          x={liabX + 6}
          y={liabY + 14}
          fontSize={10}
          fontWeight={600}
          fill={liabTextColor}
        >
          Passivos
        </text>

        {/* Baseline */}
        <line
          x1={xOffset + 8}
          y1={baseline}
          x2={xOffset + sectionW - 8}
          y2={baseline}
          stroke="var(--border)"
          strokeWidth={1}
        />

        {/* Section title + ratio */}
        <text
          x={xOffset + sectionW / 2}
          y={svgH - 16}
          textAnchor="middle"
          fontSize={11}
          fontWeight={600}
          fill="currentColor"
          className="fill-foreground"
        >
          {title}
        </text>
        <text
          x={xOffset + sectionW / 2}
          y={svgH - 3}
          textAnchor="middle"
          fontSize={9}
          fill="currentColor"
          className={covers ? "fill-emerald-600" : "fill-rose-600"}
          fontWeight={600}
        >
          {formatNumber(ratio, 2)}x cobertura
        </text>
      </g>
    );
  }

  return (
    <div className={`rounded-2xl border ${a.border} bg-card p-4 space-y-3`}>
      <div className="flex items-center justify-between">
        <span className={`text-[11px] font-semibold ${a.text} uppercase tracking-wider`}>
          {company.ticker}
        </span>
        <span className="text-[10px] text-muted-foreground">Ativos vs Passivos</span>
      </div>
      <svg
        viewBox={`0 0 ${svgW} ${svgH}`}
        className="w-full max-w-[400px] mx-auto"
        preserveAspectRatio="xMidYMid meet"
      >
        {/* Divider vertical entre as duas secoes */}
        <line
          x1={sectionW}
          y1={padT - 10}
          x2={sectionW}
          y2={svgH - padB + 4}
          stroke="var(--border)"
          strokeWidth={0.5}
          strokeDasharray="3 3"
          opacity={0.6}
        />
        {renderSection("Curto prazo", h.shortTermAssets, h.shortTermLiabilities, stRatio, 0)}
        {renderSection("Longo prazo", h.longTermAssets, h.longTermLiabilities, ltRatio, sectionW)}
      </svg>
      {/* Legend */}
      <div className="flex items-center justify-center gap-4 text-[10px] text-muted-foreground pt-1 border-t border-border/50">
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-3 w-3 rounded" style={{ backgroundColor: assetColor }} />
          Ativos
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-3 w-3 rounded" style={{ backgroundColor: liabColor }} />
          Passivos
        </span>
      </div>
    </div>
  );
}

/* ── 2. Histórico de Dívida (SVG Area Chart) ─────────────────────────────── */

function DebtHistoryChart({
  company,
  side,
  formatNumber,
}: {
  company: CompareEnrichedCompany;
  side: Side;
  formatNumber: (v: number, d?: number) => string;
}) {
  const a = accent(side);
  const series = company.healthData.debtSeries;

  if (!series || series.length === 0) {
    return (
      <div className={`rounded-2xl border ${a.border} bg-card p-4`}>
        <span className={`text-[11px] font-semibold ${a.text} uppercase tracking-wider`}>
          {company.ticker}
        </span>
        <p className="mt-4 text-[12px] text-muted-foreground text-center">Dados indisponíveis</p>
      </div>
    );
  }

  const W = 280;
  const H = 140;
  const padL = 4;
  const padR = 4;
  const padT = 8;
  const padB = 20;
  const chartW = W - padL - padR;
  const chartH = H - padT - padB;

  const maxVal = Math.max(
    ...series.flatMap((d) => [d.debt, d.equity, d.cash]),
    1,
  );

  const xStep = series.length > 1 ? chartW / (series.length - 1) : 0;

  function buildPath(key: "debt" | "equity" | "cash") {
    const points = series.map((d, i) => ({
      x: padL + i * xStep,
      y: padT + chartH - (d[key] / maxVal) * chartH,
    }));
    const line = points.map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`).join(" ");
    const area = `${line} L${points[points.length - 1].x},${padT + chartH} L${points[0].x},${padT + chartH} Z`;
    return { line, area };
  }

  const debt = buildPath("debt");
  const equity = buildPath("equity");
  const cash = buildPath("cash");

  const colors = {
    debt: { stroke: "var(--danger-text)", fill: "var(--danger-text)" },
    equity: { stroke: a.color, fill: a.color },
    cash: { stroke: "var(--success-text)", fill: "var(--success-text)" },
  };

  return (
    <div className={`rounded-2xl border ${a.border} bg-card p-4 space-y-3`}>
      <span className={`text-[11px] font-semibold ${a.text} uppercase tracking-wider`}>
        {company.ticker}
      </span>

      <svg viewBox={`0 0 ${W} ${H}`} className="w-full max-w-[340px] mx-auto" preserveAspectRatio="xMidYMid meet">
        {/* Grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((frac) => (
          <line
            key={frac}
            x1={padL}
            y1={padT + chartH * (1 - frac)}
            x2={padL + chartW}
            y2={padT + chartH * (1 - frac)}
            stroke="var(--border)"
            strokeWidth="0.5"
            strokeDasharray="3,3"
          />
        ))}

        {/* Area fills */}
        <path d={debt.area} fill={colors.debt.fill} opacity="0.12" />
        <path d={equity.area} fill={colors.equity.fill} opacity="0.12" />
        <path d={cash.area} fill={colors.cash.fill} opacity="0.12" />

        {/* Lines */}
        <path d={debt.line} fill="none" stroke={colors.debt.stroke} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d={equity.line} fill="none" stroke={colors.equity.stroke} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d={cash.line} fill="none" stroke={colors.cash.stroke} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />

        {/* Endpoint dots */}
        {series.length > 0 && (() => {
          const last = series.length - 1;
          const lx = padL + last * xStep;
          return (
            <>
              <circle cx={lx} cy={padT + chartH - (series[last].debt / maxVal) * chartH} r="3" fill={colors.debt.stroke} />
              <circle cx={lx} cy={padT + chartH - (series[last].equity / maxVal) * chartH} r="3" fill={colors.equity.stroke} />
              <circle cx={lx} cy={padT + chartH - (series[last].cash / maxVal) * chartH} r="3" fill={colors.cash.stroke} />
            </>
          );
        })()}

        {/* X-axis labels */}
        {series.map((d, i) => (
          <text
            key={d.year}
            x={padL + i * xStep}
            y={H - 2}
            textAnchor="middle"
            fontSize="8"
            fill="var(--muted-foreground)"
          >
            {d.year}
          </text>
        ))}
      </svg>

      {/* Legend */}
      <div className="flex items-center justify-center gap-4 text-[10px]">
        <span className="flex items-center gap-1">
          <span className="inline-block h-2 w-2 rounded-full" style={{ backgroundColor: colors.debt.stroke }} />
          Dívida
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block h-2 w-2 rounded-full" style={{ backgroundColor: colors.equity.stroke }} />
          Patrimônio
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block h-2 w-2 rounded-full" style={{ backgroundColor: colors.cash.stroke }} />
          Caixa
        </span>
      </div>
    </div>
  );
}

/* ── 3. Tendência D/E (SVG Line Chart) ────────────────────────────────────── */

function DETrendChart({
  company,
  side,
  formatNumber,
}: {
  company: CompareEnrichedCompany;
  side: Side;
  formatNumber: (v: number, d?: number) => string;
}) {
  const ac = accent(side);
  const h = company.healthData;
  const series = h.debtToEquitySeries;
  const improving = h.debtToEquity < h.debtToEquity5yAgo;

  const W = 280;
  const H = 90;
  const padL = 4;
  const padR = 4;
  const padT = 8;
  const padB = 18;
  const chartW = W - padL - padR;
  const chartH = H - padT - padB;

  const hasSeries = series && series.length > 1;
  const vals = hasSeries ? series.map((d) => d.value) : [h.debtToEquity5yAgo, h.debtToEquity];
  const minVal = Math.min(...vals) * 0.85;
  const maxVal = Math.max(...vals) * 1.15 || 1;
  const range = maxVal - minVal || 1;

  const xStep = hasSeries
    ? chartW / (series.length - 1)
    : chartW;

  const points = hasSeries
    ? series.map((d, i) => ({
        x: padL + i * xStep,
        y: padT + chartH - ((d.value - minVal) / range) * chartH,
      }))
    : [
        { x: padL, y: padT + chartH - ((h.debtToEquity5yAgo - minVal) / range) * chartH },
        { x: padL + chartW, y: padT + chartH - ((h.debtToEquity - minVal) / range) * chartH },
      ];

  const linePath = points.map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`).join(" ");
  const areaPath = `${linePath} L${points[points.length - 1].x},${padT + chartH} L${points[0].x},${padT + chartH} Z`;
  const lineColor = improving ? "var(--success-text)" : "var(--danger-text)";
  const fillColor = improving ? "var(--success-text)" : "var(--danger-text)";

  return (
    <div className={`rounded-2xl border ${ac.border} bg-card p-4 space-y-3`}>
      <div className="flex items-center justify-between">
        <span className={`text-[11px] font-semibold ${ac.text} uppercase tracking-wider`}>
          {company.ticker} - D/E
        </span>
        <span
          className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-medium ${
            improving
              ? "border-success-border bg-success-surface text-success-text"
              : "border-danger-border bg-danger-surface text-danger-text"
          }`}
        >
          {improving ? "Melhorando" : "Piorando"}
        </span>
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} className="w-full max-w-[340px] mx-auto" preserveAspectRatio="xMidYMid meet">
        {/* Gradient fill under line */}
        <defs>
          <linearGradient id={`deGrad-${side}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={fillColor} stopOpacity="0.2" />
            <stop offset="100%" stopColor={fillColor} stopOpacity="0.02" />
          </linearGradient>
        </defs>
        <path d={areaPath} fill={`url(#deGrad-${side})`} />
        <path d={linePath} fill="none" stroke={lineColor} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

        {/* Dots at start & end */}
        <circle cx={points[0].x} cy={points[0].y} r="3.5" fill="var(--card)" stroke={lineColor} strokeWidth="2" />
        <circle cx={points[points.length - 1].x} cy={points[points.length - 1].y} r="3.5" fill="var(--card)" stroke={lineColor} strokeWidth="2" />

        {/* Year labels */}
        {hasSeries &&
          series.map((d, i) => {
            if (i === 0 || i === series.length - 1 || i % Math.ceil(series.length / 5) === 0) {
              return (
                <text
                  key={d.year}
                  x={padL + i * xStep}
                  y={H - 2}
                  textAnchor="middle"
                  fontSize="8"
                  fill="var(--muted-foreground)"
                >
                  {d.year}
                </text>
              );
            }
            return null;
          })}
        {!hasSeries && (
          <>
            <text x={padL} y={H - 2} textAnchor="start" fontSize="8" fill="var(--muted-foreground)">5a atrás</text>
            <text x={padL + chartW} y={H - 2} textAnchor="end" fontSize="8" fill="var(--muted-foreground)">Atual</text>
          </>
        )}
      </svg>

      {/* Badges */}
      <div className="flex items-center justify-between">
        <div className="rounded-lg bg-muted px-2.5 py-1">
          <p className="text-[9px] text-muted-foreground">5 anos atrás</p>
          <p className="text-sm font-semibold text-foreground">{formatNumber(h.debtToEquity5yAgo, 2)}x</p>
        </div>
        <svg viewBox="0 0 40 16" className="h-4 w-10 flex-shrink-0">
          <line
            x1="2" y1={improving ? "4" : "12"}
            x2="38" y2={improving ? "12" : "4"}
            stroke={lineColor}
            strokeWidth="2"
            strokeLinecap="round"
            markerEnd=""
          />
          <polygon
            points={improving ? "34,14 38,12 34,10" : "34,2 38,4 34,6"}
            fill={lineColor}
          />
        </svg>
        <div className="rounded-lg bg-muted px-2.5 py-1 text-right">
          <p className="text-[9px] text-muted-foreground">Atual</p>
          <p className="text-sm font-semibold text-foreground">{formatNumber(h.debtToEquity, 2)}x</p>
        </div>
      </div>
    </div>
  );
}

/* ── 4. Critérios de Saúde (Comparative Table) ────────────────────────────── */

function HealthCriteriaTable({
  a,
  b,
}: {
  a: CompareEnrichedCompany;
  b: CompareEnrichedCompany;
}) {
  const ha = a.healthData;
  const hb = b.healthData;

  const criteria: { label: string; passesA: boolean; passesB: boolean }[] = [
    {
      label: "Caixa > Dívida Total",
      passesA: ha.cash > ha.totalDebt,
      passesB: hb.cash > hb.totalDebt,
    },
    {
      label: "D/E em tendência de queda",
      passesA: ha.debtToEquity < ha.debtToEquity5yAgo,
      passesB: hb.debtToEquity < hb.debtToEquity5yAgo,
    },
    {
      label: "FCO/Dívida adequado",
      passesA: ha.totalDebt > 0 ? ha.operatingCashFlow / ha.totalDebt > 0.2 : true,
      passesB: hb.totalDebt > 0 ? hb.operatingCashFlow / hb.totalDebt > 0.2 : true,
    },
    {
      label: "EBIT/Juros > 3x",
      passesA: ha.interestExpense !== 0 ? Math.abs(ha.ebit / ha.interestExpense) > 3 : true,
      passesB: hb.interestExpense !== 0 ? Math.abs(hb.ebit / hb.interestExpense) > 3 : true,
    },
  ];

  function StatusIcon({ passes }: { passes: boolean }) {
    return (
      <div
        className={`flex h-6 w-6 items-center justify-center rounded-full ${
          passes
            ? "bg-success-surface text-success-text"
            : "bg-danger-surface text-danger-text"
        }`}
      >
        {passes ? <Check className="h-3.5 w-3.5" /> : <X className="h-3.5 w-3.5" />}
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-border bg-card overflow-hidden">
      {/* Header */}
      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 border-b border-border bg-muted/50 px-4 py-2.5">
        <span className="text-[11px] font-semibold text-brand-text uppercase tracking-wider text-center">
          {a.ticker}
        </span>
        <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider text-center">
          Critério
        </span>
        <span className="text-[11px] font-semibold text-compare-b-text uppercase tracking-wider text-center">
          {b.ticker}
        </span>
      </div>

      {/* Rows */}
      {criteria.map((c, i) => (
        <div
          key={c.label}
          className={`grid grid-cols-[1fr_auto_1fr] items-center gap-2 px-4 py-3 ${
            i < criteria.length - 1 ? "border-b border-border" : ""
          }`}
        >
          <div className="flex justify-center">
            <StatusIcon passes={c.passesA} />
          </div>
          <span className="text-[12px] text-foreground text-center min-w-[140px]">
            {c.label}
          </span>
          <div className="flex justify-center">
            <StatusIcon passes={c.passesB} />
          </div>
        </div>
      ))}

      {/* Footer summary */}
      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 border-t border-border bg-muted/30 px-4 py-2.5">
        <span className="text-[12px] font-semibold text-foreground text-center">
          {criteria.filter((c) => c.passesA).length}/4
        </span>
        <span className="text-[10px] text-muted-foreground text-center">aprovados</span>
        <span className="text-[12px] font-semibold text-foreground text-center">
          {criteria.filter((c) => c.passesB).length}/4
        </span>
      </div>
    </div>
  );
}

/* ── 5. Resumo de Endividamento (Comparative KPIs) ────────────────────────── */

function DebtSummaryKPIs({
  a,
  b,
  formatNumber,
}: {
  a: CompareEnrichedCompany;
  b: CompareEnrichedCompany;
  formatNumber: (v: number, d?: number) => string;
}) {
  const ha = a.healthData;
  const hb = b.healthData;

  const deA = ha.debtToEquity;
  const deB = hb.debtToEquity;

  const cashDebtA = ha.totalDebt > 0 ? ha.cash / ha.totalDebt : ha.cash > 0 ? 999 : 0;
  const cashDebtB = hb.totalDebt > 0 ? hb.cash / hb.totalDebt : hb.cash > 0 ? 999 : 0;

  const intCovA = ha.interestExpense !== 0 ? Math.abs(ha.ebit / ha.interestExpense) : 999;
  const intCovB = hb.interestExpense !== 0 ? Math.abs(hb.ebit / hb.interestExpense) : 999;

  const metrics: {
    label: string;
    valA: number;
    valB: number;
    fmtA: string;
    fmtB: string;
    lowerBetter: boolean;
  }[] = [
    {
      label: "Dívida/Patrimônio",
      valA: deA,
      valB: deB,
      fmtA: `${formatNumber(deA, 2)}x`,
      fmtB: `${formatNumber(deB, 2)}x`,
      lowerBetter: true,
    },
    {
      label: "Caixa/Dívida",
      valA: cashDebtA,
      valB: cashDebtB,
      fmtA: cashDebtA >= 999 ? "N/A" : `${formatNumber(cashDebtA, 2)}x`,
      fmtB: cashDebtB >= 999 ? "N/A" : `${formatNumber(cashDebtB, 2)}x`,
      lowerBetter: false,
    },
    {
      label: "Cobertura de Juros",
      valA: intCovA,
      valB: intCovB,
      fmtA: intCovA >= 999 ? "N/A" : `${formatNumber(intCovA, 1)}x`,
      fmtB: intCovB >= 999 ? "N/A" : `${formatNumber(intCovB, 1)}x`,
      lowerBetter: false,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
      {metrics.map((m) => {
        const aWins = m.lowerBetter ? m.valA < m.valB : m.valA > m.valB;
        const bWins = m.lowerBetter ? m.valB < m.valA : m.valB > m.valA;
        const tie = m.valA === m.valB;

        return (
          <div key={m.label} className="rounded-2xl border border-border bg-card p-4 space-y-3">
            <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider text-center">
              {m.label}
            </p>
            <div className="flex items-center justify-between gap-2">
              {/* Company A */}
              <div
                className={`flex-1 rounded-xl px-3 py-2 text-center transition-colors ${
                  aWins && !tie
                    ? "bg-success-surface border border-success-border"
                    : "bg-muted"
                }`}
              >
                <p className="text-[10px] text-brand-text font-medium">{a.ticker}</p>
                <p className={`text-sm font-bold ${aWins && !tie ? "text-success-text" : "text-foreground"}`}>
                  {m.fmtA}
                </p>
              </div>

              {/* VS divider */}
              <span className="text-[10px] text-muted-foreground font-medium flex-shrink-0">vs</span>

              {/* Company B */}
              <div
                className={`flex-1 rounded-xl px-3 py-2 text-center transition-colors ${
                  bWins && !tie
                    ? "bg-success-surface border border-success-border"
                    : "bg-muted"
                }`}
              >
                <p className="text-[10px] text-compare-b-text font-medium">{b.ticker}</p>
                <p className={`text-sm font-bold ${bWins && !tie ? "text-success-text" : "text-foreground"}`}>
                  {m.fmtB}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ── Main Component ───────────────────────────────────────────────────────── */

export function HealthIsland({ a, b, formatNumber }: HealthIslandProps) {
  return (
    <div className="compare-island compare-surface p-6 scroll-mt-[160px] space-y-8">
      <h3 className="text-base font-semibold text-foreground">Saúde Financeira</h3>

      <CompareReadingCard
        a={a.readings.health}
        b={b.readings.health}
        tickerA={a.ticker}
        tickerB={b.ticker}
        dimension="health"
      />

      <CompareDimensionCheckCard
        a={a.dimensionChecks.health}
        b={b.dimensionChecks.health}
        tickerA={a.ticker}
        tickerB={b.ticker}
      />

      {/* ── 1. Posição Financeira ── */}
      <section className="space-y-3">
        <h4 className="text-[12px] font-semibold text-muted-foreground uppercase tracking-wider">
          Posição Financeira
        </h4>
        <div className="compare-side-grid">
          <FinancialPositionCard company={a} side="a" formatNumber={formatNumber} />
          <FinancialPositionCard company={b} side="b" formatNumber={formatNumber} />
        </div>
        <CompareSectionCriteria
          a={a.healthData.positionCriteria ?? []}
          b={b.healthData.positionCriteria ?? []}
          tickerA={a.ticker}
          tickerB={b.ticker}
          title="Cobertura de passivos"
        />
      </section>

      {/* ── Estrutura do Balanço ── */}
      <CompareBalanceSheetStructure
        a={a.healthData.balanceSheet}
        b={b.healthData.balanceSheet}
        tickerA={a.ticker}
        tickerB={b.ticker}
        formatNumber={formatNumber}
      />

      {/* ── 2. Histórico de Dívida ── */}
      <section className="space-y-3">
        <h4 className="text-[12px] font-semibold text-muted-foreground uppercase tracking-wider">
          Histórico de Dívida
        </h4>
        <div className="compare-side-grid">
          <DebtHistoryChart company={a} side="a" formatNumber={formatNumber} />
          <DebtHistoryChart company={b} side="b" formatNumber={formatNumber} />
        </div>
      </section>

      {/* ── 3. Tendência D/E ── */}
      <section className="space-y-3">
        <h4 className="text-[12px] font-semibold text-muted-foreground uppercase tracking-wider">
          Tendência D/E
        </h4>
        <div className="compare-side-grid">
          <DETrendChart company={a} side="a" formatNumber={formatNumber} />
          <DETrendChart company={b} side="b" formatNumber={formatNumber} />
        </div>
      </section>

      {/* ── 4. Critérios de Endividamento ── */}
      <section className="space-y-3">
        <h4 className="text-[12px] font-semibold text-muted-foreground uppercase tracking-wider">
          Critérios de Endividamento
        </h4>
        <CompareSectionCriteria
          a={a.healthData.debtCriteria ?? []}
          b={b.healthData.debtCriteria ?? []}
          tickerA={a.ticker}
          tickerB={b.ticker}
          title="Nivel, reducao, cobertura de divida e juros"
        />
        <HealthCriteriaTable a={a} b={b} />
      </section>

      {/* ── 5. Cobertura de Juros ── */}
      <section className="space-y-3">
        <h4 className="text-[12px] font-semibold text-muted-foreground uppercase tracking-wider">
          Cobertura de Juros
        </h4>
        <div className="compare-side-grid">
          <InterestCoverageBar company={a} side="a" formatNumber={formatNumber} />
          <InterestCoverageBar company={b} side="b" formatNumber={formatNumber} />
        </div>
      </section>

      {/* ── 6. Resumo de Endividamento ── */}
      <section className="space-y-3">
        <h4 className="text-[12px] font-semibold text-muted-foreground uppercase tracking-wider">
          Resumo de Endividamento
        </h4>
        <DebtSummaryKPIs a={a} b={b} formatNumber={formatNumber} />
      </section>
    </div>
  );
}

/* ── InterestCoverageBar ──────────────────────────────────────────────────── */

function InterestCoverageBar({
  company,
  side,
  formatNumber,
}: {
  company: CompareEnrichedCompany;
  side: "a" | "b";
  formatNumber: (v: number, d?: number) => string;
}) {
  const ebit = company.healthData.ebit ?? 0;
  const interest = company.healthData.interestExpense ?? 0;
  const ratio = interest > 0 ? ebit / interest : 0;
  const diag = company.healthData.interestCoverageDiagnosis;

  // Bar zones: 0..2 risk, 2..5 warn, 5..15 ok
  const max = 15;
  const clamped = Math.min(max, ratio);
  const pct = (clamped / max) * 100;
  const borderColor = side === "a" ? "border-brand-border" : "border-compare-b-border";

  const tone =
    diag?.status === "OK" || ratio >= 5
      ? "bg-success-surface text-success-text border-success-border"
      : diag?.status === "WARN" || ratio >= 2
      ? "bg-warning-surface text-warning-text border-warning-border"
      : "bg-danger-surface text-danger-text border-danger-border";

  return (
    <div className={`rounded-2xl border ${borderColor} bg-card p-4 space-y-3`}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-foreground">{company.ticker}</span>
        <span className="text-[10px] text-muted-foreground">EBIT / juros</span>
      </div>

      <div className="relative h-6 w-full rounded-md overflow-hidden border border-border">
        {/* zones */}
        <div className="absolute inset-y-0 left-0 bg-red-500/20" style={{ width: "13.3%" }} />
        <div className="absolute inset-y-0 bg-amber-500/20" style={{ left: "13.3%", width: "20%" }} />
        <div className="absolute inset-y-0 bg-emerald-500/20" style={{ left: "33.3%", right: 0 }} />
        {/* marker */}
        <div
          className="absolute top-0 bottom-0 w-1 bg-foreground"
          style={{ left: `calc(${pct}% - 2px)` }}
        />
      </div>

      <div className="flex items-center justify-between">
        <span className="text-sm font-bold text-foreground">{formatNumber(ratio, 1)}x</span>
        <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold ${tone}`}>
          {diag?.text ?? (ratio >= 5 ? "Saudavel" : ratio >= 2 ? "Atencao" : "Risco")}
        </span>
      </div>
    </div>
  );
}

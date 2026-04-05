"use client";

import { Check, X } from "lucide-react";
import type { CompareEnrichedCompany } from "../../interfaces";

/* ── Types ────────────────────────────────────────────────────────────────── */

interface HealthIslandProps {
  a: CompareEnrichedCompany;
  b: CompareEnrichedCompany;
  formatNumber: (value: number, digits?: number) => string;
}

/* ── Financial Position Bars ──────────────────────────────────────────────── */

function PositionBar({
  company,
  side,
  formatNumber,
}: {
  company: CompareEnrichedCompany;
  side: "a" | "b";
  formatNumber: (value: number, digits?: number) => string;
}) {
  const { shortTermAssets, shortTermLiabilities } = company.healthData;
  const total = shortTermAssets + shortTermLiabilities;
  const assetsPct = total > 0 ? (shortTermAssets / total) * 100 : 50;
  const liabPct = total > 0 ? (shortTermLiabilities / total) * 100 : 50;
  const ratio = shortTermLiabilities > 0 ? shortTermAssets / shortTermLiabilities : 0;

  const accentColor = side === "a" ? "var(--brand)" : "var(--compare-b)";
  const accentText = side === "a" ? "text-brand-text" : "text-compare-b-text";

  return (
    <div className="space-y-2">
      <span className={`text-[11px] font-medium ${accentText} uppercase tracking-wider`}>
        {company.ticker}
      </span>
      <div className="flex h-6 w-full overflow-hidden rounded-full">
        <div
          className="flex items-center justify-center text-[9px] font-medium text-white"
          style={{ width: `${assetsPct}%`, backgroundColor: accentColor }}
        >
          Ativos CP
        </div>
        <div
          className="flex items-center justify-center text-[9px] font-medium text-white bg-danger-text"
          style={{ width: `${liabPct}%` }}
        >
          Passivos CP
        </div>
      </div>
      <div className="flex justify-between text-[10px] text-muted-foreground">
        <span>R$ {formatNumber(shortTermAssets / 1e6, 0)}M</span>
        <span className="font-medium text-foreground">
          Ratio: {formatNumber(ratio, 2)}x
        </span>
        <span>R$ {formatNumber(shortTermLiabilities / 1e6, 0)}M</span>
      </div>
    </div>
  );
}

/* ── Debt Trend Cards ─────────────────────────────────────────────────────── */

function DebtTrendCard({
  company,
  side,
  formatNumber,
}: {
  company: CompareEnrichedCompany;
  side: "a" | "b";
  formatNumber: (value: number, digits?: number) => string;
}) {
  const { debtToEquity, debtToEquity5yAgo } = company.healthData;
  const improving = debtToEquity < debtToEquity5yAgo;
  const borderClass = side === "a" ? "border-brand-border" : "border-compare-b-border";
  const accentText = side === "a" ? "text-brand-text" : "text-compare-b-text";

  return (
    <div className={`rounded-2xl border ${borderClass} bg-card p-4 space-y-3`}>
      <span className={`text-[11px] font-medium ${accentText} uppercase tracking-wider`}>
        {company.ticker} - D/E
      </span>
      <div className="flex items-end gap-4">
        <div>
          <p className="text-[10px] text-muted-foreground">5 anos atras</p>
          <p className="text-sm font-medium text-foreground">
            {formatNumber(debtToEquity5yAgo, 2)}x
          </p>
        </div>
        <div className="flex-1 flex items-end justify-center">
          <svg viewBox="0 0 60 24" className="h-6 w-15">
            <line
              x1="2"
              y1={improving ? "6" : "18"}
              x2="58"
              y2={improving ? "18" : "6"}
              stroke={improving ? "var(--success-text)" : "var(--danger-text)"}
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </div>
        <div>
          <p className="text-[10px] text-muted-foreground">Atual</p>
          <p className="text-sm font-semibold text-foreground">
            {formatNumber(debtToEquity, 2)}x
          </p>
        </div>
      </div>
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
  );
}

/* ── Coverage Criteria ────────────────────────────────────────────────────── */

function CriteriaItem({
  label,
  passes,
}: {
  label: string;
  passes: boolean;
}) {
  return (
    <div className="flex items-center gap-2 py-1">
      <div
        className={`flex h-5 w-5 items-center justify-center rounded-full ${
          passes
            ? "bg-success-surface text-success-text"
            : "bg-danger-surface text-danger-text"
        }`}
      >
        {passes ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
      </div>
      <span className="text-[12px] text-foreground">{label}</span>
    </div>
  );
}

function CoverageChecks({
  company,
  side,
}: {
  company: CompareEnrichedCompany;
  side: "a" | "b";
}) {
  const h = company.healthData;
  const cashGtDebt = h.cash > h.totalDebt;
  const deTrendingDown = h.debtToEquity < h.debtToEquity5yAgo;
  const fcoDebt =
    h.totalDebt > 0 ? h.operatingCashFlow / h.totalDebt > 0.2 : true;
  const interestCoverage =
    h.interestExpense !== 0
      ? Math.abs(h.ebit / h.interestExpense) > 3
      : true;

  const accentText = side === "a" ? "text-brand-text" : "text-compare-b-text";

  return (
    <div className="space-y-1">
      <span className={`text-[11px] font-medium ${accentText} uppercase tracking-wider`}>
        {company.ticker}
      </span>
      <CriteriaItem label="Caixa > Divida total" passes={cashGtDebt} />
      <CriteriaItem label="D/E em tendencia de queda" passes={deTrendingDown} />
      <CriteriaItem label="FCO/Divida adequado" passes={fcoDebt} />
      <CriteriaItem label="EBIT/Juros > 3x" passes={interestCoverage} />
    </div>
  );
}

/* ── Main Component ───────────────────────────────────────────────────────── */

export function HealthIsland({ a, b, formatNumber }: HealthIslandProps) {
  return (
    <div className="compare-island compare-surface p-6 scroll-mt-[160px] space-y-6">
      <h3 className="text-base font-semibold text-foreground">
        Saude financeira
      </h3>

      {/* ── Financial position bars ── */}
      <div className="compare-side-grid">
        <PositionBar company={a} side="a" formatNumber={formatNumber} />
        <PositionBar company={b} side="b" formatNumber={formatNumber} />
      </div>

      {/* ── Debt trend ── */}
      <div className="compare-side-grid">
        <DebtTrendCard company={a} side="a" formatNumber={formatNumber} />
        <DebtTrendCard company={b} side="b" formatNumber={formatNumber} />
      </div>

      {/* ── Coverage checks ── */}
      <div className="compare-side-grid">
        <CoverageChecks company={a} side="a" />
        <CoverageChecks company={b} side="b" />
      </div>
    </div>
  );
}

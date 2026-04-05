"use client";

import { TrendingDown, TrendingUp } from "lucide-react";
import type { CompareEnrichedCompany } from "../../interfaces";

/* ── Types ────────────────────────────────────────────────────────────────── */

interface ValuationIslandProps {
  a: CompareEnrichedCompany;
  b: CompareEnrichedCompany;
  formatNumber: (value: number, digits?: number) => string;
}

/* ── Sub-components ───────────────────────────────────────────────────────── */

function DcfCard({
  company,
  formatNumber,
  side,
}: {
  company: CompareEnrichedCompany;
  formatNumber: (value: number, digits?: number) => string;
  side: "a" | "b";
}) {
  const { valuation } = company;
  const isBelowFair = valuation.currentPrice < valuation.fairValue;
  const borderClass = side === "a" ? "border-brand-border" : "border-compare-b-border";
  const accentBg = isBelowFair ? "bg-success-surface" : "bg-danger-surface";
  const accentText = isBelowFair ? "text-success-text" : "text-danger-text";
  const Icon = isBelowFair ? TrendingDown : TrendingUp;

  return (
    <div className={`rounded-2xl border ${borderClass} ${accentBg} p-4 space-y-3`}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
          {company.ticker}
        </span>
        <span className="inline-flex items-center gap-1 rounded-full border border-border bg-card px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
          {valuation.model}
        </span>
      </div>

      <div className="space-y-1">
        <p className="text-[11px] text-muted-foreground">Valor justo</p>
        <p className="text-xl font-semibold text-foreground">
          R$ {formatNumber(valuation.fairValue, 2)}
        </p>
      </div>

      <div className="flex items-center gap-3">
        <div className="space-y-0.5">
          <p className="text-[11px] text-muted-foreground">Preco atual</p>
          <p className="text-sm font-medium text-foreground">
            R$ {formatNumber(valuation.currentPrice, 2)}
          </p>
        </div>
        <div className={`flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-semibold ${accentText} ${isBelowFair ? "border-success-border" : "border-danger-border"}`}>
          <Icon className="h-3 w-3" />
          {formatNumber(Math.abs(valuation.discountPercent), 1)}%
          {isBelowFair ? " abaixo" : " acima"}
        </div>
      </div>
    </div>
  );
}

function ScenarioDumbbell({
  company,
  formatNumber,
  side,
}: {
  company: CompareEnrichedCompany;
  formatNumber: (value: number, digits?: number) => string;
  side: "a" | "b";
}) {
  const scenarios = company.priceScenarios;
  if (!scenarios.length) return null;

  const values = scenarios.map((s) => s.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;

  const dotColor = side === "a" ? "var(--brand)" : "var(--compare-b)";

  return (
    <div className="space-y-2">
      <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
        {company.ticker} - Cenarios
      </span>
      <div className="relative h-8 w-full rounded-full bg-muted">
        {/* Track bar */}
        <div
          className="absolute top-1/2 h-1 -translate-y-1/2 rounded-full opacity-30"
          style={{
            left: "4%",
            right: "4%",
            backgroundColor: dotColor,
          }}
        />
        {/* Scenario dots */}
        {scenarios.map((s) => {
          const pos = 4 + ((s.value - min) / range) * 92;
          return (
            <div
              key={s.key}
              className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center"
              style={{ left: `${pos}%` }}
            >
              <div
                className="h-4 w-4 rounded-full border-2 border-white"
                style={{ backgroundColor: dotColor }}
              />
              <span className="mt-1 text-[9px] font-medium text-muted-foreground whitespace-nowrap">
                {s.label}
              </span>
            </div>
          );
        })}
      </div>
      <div className="flex justify-between text-[10px] text-muted-foreground">
        <span>R$ {formatNumber(min, 2)}</span>
        <span>R$ {formatNumber(max, 2)}</span>
      </div>
    </div>
  );
}

function MultipleCard({
  label,
  valueA,
  valueB,
  tickerA,
  tickerB,
  formatNumber,
  direction = "lower-better" as "higher-better" | "lower-better",
}: {
  label: string;
  valueA: number;
  valueB: number;
  tickerA: string;
  tickerB: string;
  formatNumber: (value: number, digits?: number) => string;
  direction?: "higher-better" | "lower-better";
}) {
  const aWins =
    direction === "lower-better" ? valueA < valueB : valueA > valueB;
  const bWins =
    direction === "lower-better" ? valueB < valueA : valueB > valueA;

  return (
    <div className="rounded-2xl border border-border bg-card p-4 space-y-3">
      <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
        {label}
      </span>
      <div className="flex items-center justify-between gap-3">
        {/* A */}
        <div
          className={`flex-1 rounded-xl p-2.5 text-center ${
            aWins
              ? "border border-brand-border bg-brand-surface"
              : "border border-border bg-muted/50"
          }`}
        >
          <p className="text-[10px] text-muted-foreground">{tickerA}</p>
          <p className={`text-sm font-semibold ${aWins ? "text-brand-text" : "text-foreground"}`}>
            {formatNumber(valueA, 1)}x
          </p>
        </div>

        <span className="text-[10px] text-muted-foreground">vs</span>

        {/* B */}
        <div
          className={`flex-1 rounded-xl p-2.5 text-center ${
            bWins
              ? "border border-compare-b-border bg-compare-b-surface"
              : "border border-border bg-muted/50"
          }`}
        >
          <p className="text-[10px] text-muted-foreground">{tickerB}</p>
          <p className={`text-sm font-semibold ${bWins ? "text-compare-b-text" : "text-foreground"}`}>
            {formatNumber(valueB, 1)}x
          </p>
        </div>
      </div>
    </div>
  );
}

/* ── Main Component ───────────────────────────────────────────────────────── */

export function ValuationIsland({ a, b, formatNumber }: ValuationIslandProps) {
  return (
    <div className="compare-island compare-surface p-6 scroll-mt-[160px] space-y-6">
      <h3 className="text-base font-semibold text-foreground">Valuation</h3>

      {/* ── DCF Cards ── */}
      <div className="compare-side-grid">
        <DcfCard company={a} formatNumber={formatNumber} side="a" />
        <DcfCard company={b} formatNumber={formatNumber} side="b" />
      </div>

      {/* ── Price Scenarios ── */}
      <div className="compare-side-grid">
        <ScenarioDumbbell company={a} formatNumber={formatNumber} side="a" />
        <ScenarioDumbbell company={b} formatNumber={formatNumber} side="b" />
      </div>

      {/* ── Multiples comparison ── */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <MultipleCard
          label="P/L"
          valueA={a.valuation.pe}
          valueB={b.valuation.pe}
          tickerA={a.ticker}
          tickerB={b.ticker}
          formatNumber={formatNumber}
          direction="lower-better"
        />
        <MultipleCard
          label="EV/EBITDA"
          valueA={a.valuation.evEbitda}
          valueB={b.valuation.evEbitda}
          tickerA={a.ticker}
          tickerB={b.ticker}
          formatNumber={formatNumber}
          direction="lower-better"
        />
        <MultipleCard
          label="P/VP"
          valueA={a.valuation.pvp}
          valueB={b.valuation.pvp}
          tickerA={a.ticker}
          tickerB={b.ticker}
          formatNumber={formatNumber}
          direction="lower-better"
        />
      </div>
    </div>
  );
}

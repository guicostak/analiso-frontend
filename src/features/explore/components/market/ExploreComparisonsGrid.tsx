"use client";

/**
 * Grid de métricas derivadas (IBOV em USD, IBOV vs S&P YTD, Correlação EM).
 * Cada comparação recebida é renderizada como card uniforme.
 */

import { Globe } from "lucide-react";
import { MiniSparkline } from "@/src/components/shared/MiniSparkline";
import type { Comparison, MarketTimeRange } from "../../interfaces/market.interfaces";
import { SparklineRangeBadge } from "./SparklineRangeBadge";
import { resolveSparklineLabels } from "../../utils/sparklineLabels";
import { InfoTooltip } from "@/src/components/shared/InfoTooltip";
import { COMPARISON_INFO } from "../../utils/marketInfoCopy";
import { SectionCategoryTag } from "./SectionCategoryTag";

interface ExploreComparisonsGridProps {
  comparisons: Comparison[];
  range?: MarketTimeRange;
}

function ComparisonCard({ comp, range }: { comp: Comparison; range?: MarketTimeRange }) {
  const toneClass =
    comp.trend === "up"
      ? "text-success-text"
      : comp.trend === "down"
      ? "text-danger-text"
      : "text-muted-foreground";

  const sparklineStatus =
    comp.trend === "up" ? "healthy" : comp.trend === "down" ? "risk" : "attention";

  return (
    <article
      className="
        flex min-h-[140px] flex-col gap-2 rounded-2xl border border-border bg-card p-5
        shadow-sm dark:shadow-none
        transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md dark:hover:shadow-none
      "
    >
      <header className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="inline-flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
            {comp.label}
            {COMPARISON_INFO[comp.key] && (
              <InfoTooltip label={comp.label} content={COMPARISON_INFO[comp.key]} />
            )}
          </p>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-2xl font-semibold tabular-nums text-foreground">
              {comp.valuePrefix && (
                <span className="mr-1 text-[14px] font-medium text-muted-foreground">{comp.valuePrefix}</span>
              )}
              {comp.value ?? "—"}
              {comp.valueSuffix && (
                <span className="ml-1 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">{comp.valueSuffix}</span>
              )}
            </span>
            {comp.changePct && (
              <span className={`text-xs font-medium tabular-nums ${toneClass}`}>
                {comp.changePct}
              </span>
            )}
          </div>
          {comp.formula && (
            <p className="mt-1 font-mono text-[10px] uppercase tracking-wider text-muted-foreground/80">
              {comp.formula}
            </p>
          )}
        </div>
        {comp.sparkline && comp.sparkline.length > 1 && (
          <div className="flex shrink-0 flex-col items-end gap-1">
            {/* IBOV vs S&P YTD tem janela fixa "YTD" independente do toggle — usa fixed */}
            {comp.key === "ibov_vs_spx_ytd"
              ? <SparklineRangeBadge fixed="YTD" />
              : <SparklineRangeBadge range={range} />}
            <MiniSparkline
              data={comp.sparkline}
              labels={resolveSparklineLabels({
                dates: comp.sparklineDates,
                range: comp.key === "ibov_vs_spx_ytd" ? null : range,
                count: comp.sparkline.length,
                flavor: "daily",
              })}
              valueFormatter={(v) => {
                const n = v.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
                const pref = comp.valuePrefix ? `${comp.valuePrefix} ` : "";
                const suf  = comp.valueSuffix ? ` ${comp.valueSuffix}` : "";
                // Fallbacks para chaves específicas sem prefix/suffix explícitos.
                if (!pref && !suf && comp.key === "ibov_vs_spx_ytd") return `${n}%`;
                return `${pref}${n}${suf}`;
              }}
              status={sparklineStatus}
              width={80}
              height={32}
            />
          </div>
        )}
      </header>
      {comp.description && (
        <p className="text-[11px] leading-relaxed text-muted-foreground">
          {comp.description}
        </p>
      )}
    </article>
  );
}

export function ExploreComparisonsGrid({ comparisons, range }: ExploreComparisonsGridProps) {
  if (!comparisons.length) return null;
  return (
    <section className="space-y-4" aria-label="Comparações derivadas">
      <header className="space-y-1.5">
        <SectionCategoryTag icon={Globe} label="Contexto" categoryId="contexto-mercado" />
        <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
          Visões comparativas
        </p>
        <h3 className="text-lg font-semibold tracking-tight text-foreground">
          Comparações derivadas
        </h3>
      </header>
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {comparisons.map((c) => (
          <ComparisonCard key={c.key} comp={c} range={range} />
        ))}
      </div>
    </section>
  );
}

"use client";

/**
 * Grid de métricas derivadas (IBOV em USD, IBOV vs S&P YTD, Correlação EM).
 * Cada comparação recebida é renderizada como card uniforme.
 */

import { MiniSparkline } from "@/src/components/shared/MiniSparkline";
import type { Comparison, MarketTimeRange } from "../../interfaces/market.interfaces";
import { SparklineRangeBadge } from "./SparklineRangeBadge";

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
        <div>
          <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
            {comp.label}
          </p>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-2xl font-semibold tabular-nums text-foreground">
              {comp.value ?? "—"}
            </span>
            {comp.changePct && (
              <span className={`text-xs font-medium tabular-nums ${toneClass}`}>
                {comp.changePct}
              </span>
            )}
          </div>
        </div>
        {comp.sparkline && comp.sparkline.length > 1 && (
          <div className="flex shrink-0 flex-col items-end gap-1">
            {/* IBOV vs S&P YTD tem janela fixa "YTD" independente do toggle — usa fixed */}
            {comp.key === "ibov_vs_spx_ytd"
              ? <SparklineRangeBadge fixed="YTD" />
              : <SparklineRangeBadge range={range} />}
            <MiniSparkline
              data={comp.sparkline}
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
      <header>
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

"use client";

/**
 * Card do Ciclo Econômico (Merrill Lynch Investment Clock).
 *
 * Reutiliza o relógio SVG compartilhado em components/shared/MarketCycleClock
 * (mesmo visual usado em analysis/MarketCycleSection). Consistência cross-feature
 * sem duplicação de código.
 */

import { MarketCycleClock, type MarketCyclePhase } from "@/src/components/shared/MarketCycleClock";
import type { EconomicCycle } from "../../interfaces/market.interfaces";

interface ExploreEconomicCycleCardProps {
  cycle: EconomicCycle | null;
}

const VALID_PHASES: readonly MarketCyclePhase[] = [
  "RECOVERY",
  "OVERHEAT",
  "STAGFLATION",
  "REFLATION",
] as const;

function isValidPhase(key: string | null | undefined): key is MarketCyclePhase {
  return !!key && (VALID_PHASES as readonly string[]).includes(key);
}

export function ExploreEconomicCycleCard({ cycle }: ExploreEconomicCycleCardProps) {
  if (!cycle || !isValidPhase(cycle.phaseKey)) {
    return (
      <article className="flex min-h-[160px] flex-col justify-center rounded-2xl border border-dashed border-border bg-card p-5 text-center">
        <p className="text-sm text-muted-foreground">
          Ciclo econômico indisponível
        </p>
      </article>
    );
  }

  return (
    <article
      className="
        flex flex-col gap-3 rounded-2xl border border-border bg-card p-5
        shadow-sm dark:shadow-none
      "
      aria-label={`Ciclo econômico: ${cycle.phaseLabel}`}
    >
      <header>
        <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
          Ciclo econômico
        </p>
        <h4 className="mt-1 text-base font-semibold text-foreground">
          {cycle.phaseLabel}
        </h4>
        <p className="mt-0.5 text-[11px] text-muted-foreground">
          ML Investment Clock · Confiança: {cycle.confidence}
        </p>
      </header>

      <div className="-mx-2">
        <MarketCycleClock currentPhase={cycle.phaseKey} />
      </div>

      {cycle.description && (
        <p className="text-[12px] leading-relaxed text-muted-foreground line-clamp-2">
          {cycle.description}
        </p>
      )}

      {cycle.metaLine && (
        <footer className="mt-auto text-[10px] uppercase tracking-wide text-muted-foreground/70">
          {cycle.metaLine}
        </footer>
      )}
    </article>
  );
}

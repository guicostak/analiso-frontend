"use client";

/**
 * Card do Ciclo Econômico (Merrill Lynch Investment Clock).
 * Exibe a fase atual em formato de quadrante visual 2x2 (crescimento × inflação),
 * com a célula ativa destacada.
 */

import type { EconomicCycle } from "../../interfaces/market.interfaces";

interface ExploreEconomicCycleCardProps {
  cycle: EconomicCycle | null;
}

// Matrix quadrante (ordem visual): topo-esq topo-dir / base-esq base-dir
// Crescimento (eixo Y): ABOVE_TREND em cima, BELOW_TREND embaixo
// Inflação (eixo X):   FALLING à esq,     RISING à dir
const QUADRANTS: Array<{ phase: string; label: string; growth: "ABOVE_TREND" | "BELOW_TREND"; inflation: "FALLING" | "RISING" }> = [
  { phase: "RECOVERY",    label: "Recuperação",       growth: "ABOVE_TREND", inflation: "FALLING" },
  { phase: "OVERHEAT",    label: "Superaquecimento",  growth: "ABOVE_TREND", inflation: "RISING"  },
  { phase: "REFLATION",   label: "Reflação",          growth: "BELOW_TREND", inflation: "FALLING" },
  { phase: "STAGFLATION", label: "Estagflação",       growth: "BELOW_TREND", inflation: "RISING"  },
];

export function ExploreEconomicCycleCard({ cycle }: ExploreEconomicCycleCardProps) {
  if (!cycle) {
    return (
      <article className="flex min-h-[160px] flex-col justify-center rounded-2xl border border-dashed border-border bg-card p-5 text-center">
        <p className="text-sm text-muted-foreground">
          Ciclo econômico indisponível
        </p>
      </article>
    );
  }

  const activeKey = cycle.phaseKey;

  return (
    <article
      className="
        flex min-h-[160px] flex-col gap-3 rounded-2xl border border-border bg-card p-5
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

      <div className="grid grid-cols-2 gap-1 rounded-lg border border-border p-1">
        {QUADRANTS.map((q) => {
          const isActive = q.phase === activeKey;
          return (
            <div
              key={q.phase}
              className={`
                rounded-md px-2 py-2 text-center text-[10px] font-medium transition-colors
                ${isActive
                  ? "bg-brand text-primary-foreground shadow-sm"
                  : "bg-muted text-muted-foreground"}
              `}
              aria-current={isActive ? "true" : undefined}
            >
              {q.label}
            </div>
          );
        })}
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

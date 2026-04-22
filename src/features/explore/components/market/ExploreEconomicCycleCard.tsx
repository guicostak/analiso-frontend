"use client";

/**
 * Card do Ciclo Econômico (Merrill Lynch Investment Clock).
 *
 * Composição interna em 2 colunas a partir de lg:
 *  - Esquerda: clock SVG (âncora visual)
 *  - Direita:  título grande + confiança + descrição + meta
 *
 * Mobile (< lg): empilhado — título, clock, descrição, meta.
 */

import { Globe } from "lucide-react";
import { MarketCycleClock, type MarketCyclePhase } from "@/src/components/shared/MarketCycleClock";
import type { EconomicCycle } from "../../interfaces/market.interfaces";
import { InfoTooltip } from "@/src/components/shared/InfoTooltip";
import { ECONOMIC_CYCLE_INFO } from "../../utils/marketInfoCopy";
import { SectionCategoryTag } from "./SectionCategoryTag";

interface ExploreEconomicCycleCardProps {
  cycle: EconomicCycle | null;
}

const VALID_PHASES: readonly MarketCyclePhase[] = [
  "RECOVERY",
  "OVERHEAT",
  "STAGFLATION",
  "REFLATION",
] as const;

const CONFIDENCE_CHIP: Record<string, { label: string; classes: string }> = {
  high:   { label: "Alta",     classes: "bg-success-surface border-success-border text-success-text" },
  medium: { label: "Moderada", classes: "bg-warning-surface border-warning-border text-warning-text" },
  low:    { label: "Baixa",    classes: "bg-muted border-border text-muted-foreground" },
};

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

  const conf = CONFIDENCE_CHIP[cycle.confidence] ?? CONFIDENCE_CHIP.medium;

  return (
    <article
      className="
        overflow-hidden rounded-2xl border border-border bg-card
        shadow-sm dark:shadow-none
      "
      aria-label={`Ciclo econômico: ${cycle.phaseLabel}`}
    >
      <div
        className="
          grid gap-6 p-5
          lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]
          lg:items-center lg:gap-8 lg:p-6
        "
      >
        {/* ── Coluna esquerda: clock ─────────────────────────────── */}
        <div className="flex justify-center lg:justify-start">
          <MarketCycleClock currentPhase={cycle.phaseKey} maxWidth={460} />
        </div>

        {/* ── Coluna direita: título + confiança + descrição ─────── */}
        <div className="flex flex-col gap-4 lg:max-w-md">
          <header className="space-y-1">
            <p className="inline-flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
              <SectionCategoryTag icon={Globe} label="Contexto" categoryId="contexto-mercado" />
              Ciclo econômico
              <InfoTooltip label="Ciclo econômico" content={ECONOMIC_CYCLE_INFO} />
            </p>
            <h4 className="text-2xl font-semibold tracking-tight text-foreground">
              {cycle.phaseLabel}
            </h4>
            <p className="text-[12px] text-muted-foreground">
              Merrill Lynch Investment Clock
            </p>
          </header>

          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
              Confiança do sinal
            </span>
            <span
              className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-medium ${conf.classes}`}
            >
              <span className="h-1.5 w-1.5 rounded-full bg-current" />
              {conf.label}
            </span>
          </div>

          {cycle.description && (
            <p className="text-[13px] leading-relaxed text-foreground/90">
              {cycle.description}
            </p>
          )}

          {cycle.metaLine && (
            <p className="mt-auto text-[10px] uppercase tracking-wide text-muted-foreground/70">
              {cycle.metaLine}
            </p>
          )}
        </div>
      </div>
    </article>
  );
}

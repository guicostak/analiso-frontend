"use client";

/**
 * Grid "Macro Brasil" — Selic, IPCA, IBC-Br e Ciclo Econômico lado a lado.
 * Wrapper puramente composicional.
 */

import type { MacroIndicatorsBundle } from "../../interfaces/market.interfaces";
import { ExploreMacroCard } from "./ExploreMacroCard";
import { ExploreEconomicCycleCard } from "./ExploreEconomicCycleCard";

interface ExploreMacroBrGridProps {
  bundle: MacroIndicatorsBundle | null;
}

export function ExploreMacroBrGrid({ bundle }: ExploreMacroBrGridProps) {
  if (!bundle) return null;

  return (
    <section className="space-y-4" aria-label="Macro Brasil">
      <header>
        <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
          Contexto macroeconômico
        </p>
        <h3 className="text-lg font-semibold tracking-tight text-foreground">
          Macro Brasil
        </h3>
      </header>
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <ExploreMacroCard indicator={bundle.selic} />
        <ExploreMacroCard indicator={bundle.ipca} />
        <ExploreMacroCard indicator={bundle.ibcBr} />
        <ExploreEconomicCycleCard cycle={bundle.economicCycle} />
      </div>
    </section>
  );
}

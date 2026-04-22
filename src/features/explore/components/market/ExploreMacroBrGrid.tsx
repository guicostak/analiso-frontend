"use client";

/**
 * Grid "Macro Brasil".
 *
 * Layout em 2 faixas verticais:
 *  1. 3 indicadores escalares (Selic / IPCA / IBC-Br) lado a lado.
 *  2. Ciclo Econômico full-width (clock SVG + contexto em 2-col interno).
 *
 * Motivo: o relógio é infográfico e se beneficia de espaço horizontal
 * generoso (labels dos eixos + tooltip contextual). Os 3 indicadores
 * são escalares densos, ficam bem em cards quadrados no topo.
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

      {/* 3 indicadores no topo */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <ExploreMacroCard indicator={bundle.selic} />
        <ExploreMacroCard indicator={bundle.ipca}  />
        <ExploreMacroCard indicator={bundle.ibcBr} />
      </div>

      {/* Ciclo econômico full-width — clock SVG + contexto lado a lado internamente */}
      <ExploreEconomicCycleCard cycle={bundle.economicCycle} />
    </section>
  );
}

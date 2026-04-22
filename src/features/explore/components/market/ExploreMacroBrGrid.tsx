"use client";

/**
 * Grid "Macro Brasil" — Selic, IPCA, IBC-Br + Ciclo Econômico.
 *
 * Layout:
 *  - sm:  2 colunas (2 indicadores por linha + ciclo em nova linha full)
 *  - lg:  3 indicadores numa linha (grid-cols-3) + ciclo em linha própria full
 *
 * Motivo: o card de ciclo hospeda o Investment Clock SVG que precisa de
 * largura pra ficar legível (quadrantes + labels dos eixos). Esticar em
 * full-width na sua própria linha deixa o relógio respirar.
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

      {/* Linha 1: 3 indicadores escalares */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        <ExploreMacroCard indicator={bundle.selic} />
        <ExploreMacroCard indicator={bundle.ipca}  />
        <ExploreMacroCard indicator={bundle.ibcBr} />
      </div>

      {/* Linha 2: ciclo econômico (SVG interativo) — centralizado com max-width
          confortável pra o relógio respirar sem esticar num desktop largo. */}
      <div className="mx-auto w-full max-w-2xl">
        <ExploreEconomicCycleCard cycle={bundle.economicCycle} />
      </div>
    </section>
  );
}

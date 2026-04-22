"use client";

/**
 * Grid "Macro Brasil" — Ciclo Econômico + Selic / IPCA / IBC-Br.
 *
 * Composição assimétrica (refactoring-ui §7):
 *  - Ciclo (clock SVG) = âncora visual à esquerda em lg+
 *  - 3 indicadores = coluna direita, empilhados 1×3 no lg e 3×1 no xl
 *
 * Breakpoints:
 *  - mobile (< sm): tudo em 1 coluna — ciclo primeiro, depois indicadores
 *  - sm ... md    : ciclo full-width; indicadores em grid-cols-3 abaixo
 *  - lg+          : split 2 colunas — ciclo ancorado à esquerda, os 3
 *                   indicadores à direita em grid-cols-3 (horizontal)
 *
 * Motivo: o relógio precisa de largura mínima (labels dos eixos); os
 * 3 indicadores escalares escalam bem tanto verticais quanto horizontais.
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

      <div
        className="
          grid gap-4
          grid-cols-1
          lg:grid-cols-[minmax(360px,420px)_minmax(0,1fr)]
        "
      >
        {/* Coluna 1 (lg+): ciclo econômico — âncora visual */}
        <ExploreEconomicCycleCard cycle={bundle.economicCycle} />

        {/* Coluna 2 (lg+): 3 indicadores escalares sempre horizontais em sm+.
            Dimensões quadradas ficam melhores do que retangulares alongadas. */}
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
          <ExploreMacroCard indicator={bundle.selic} />
          <ExploreMacroCard indicator={bundle.ipca}  />
          <ExploreMacroCard indicator={bundle.ibcBr} />
        </div>
      </div>
    </section>
  );
}

"use client";

/**
 * PrioridadeDoDiaIsland (4×2)
 *
 * Item-âncora pré-selecionado com CTA "leitura guiada". Default Effect:
 * o usuário não escolhe entre alternativas — o sistema sugere onde
 * começar.
 */

import { ChevronRight, Target } from "lucide-react";
import type { IslandProps } from "../../interfaces/island.types";
import { useIslandData } from "../../hooks/useIslandData";
import { IslandShell } from "../shared/IslandShell";

export function PrioridadeDoDiaIsland(_props: IslandProps) {
  const { priorityItem, focusInboxRecentImpact, leadingPillarMovement } = useIslandData();

  const headline = priorityItem
    ? `${priorityItem.ticker} é o melhor ponto de entrada para entender o que mudou hoje.`
    : `O pilar ${leadingPillarMovement.pillar.toLowerCase()} concentra o melhor ponto de leitura.`;

  return (
    <IslandShell
      icon={<Target className="h-4 w-4 text-muted-foreground" />}
      title="Prioridade do dia"
      info="Item-âncora pré-selecionado pela curadoria do dia. Abre uma leitura guiada com o contexto e o que mudou."
    >
      <div className="flex flex-1 flex-col justify-between">
        <p className="max-w-[28ch] text-[15px] font-semibold leading-[1.35] tracking-[-0.01em] text-foreground">
          {headline}
        </p>

        <button
          type="button"
          onClick={focusInboxRecentImpact}
          className="mt-3 inline-flex items-center justify-center gap-2 self-start rounded-[12px] bg-brand px-4 py-2 text-[12.5px] font-semibold text-white transition hover:bg-brand-hover"
        >
          Abrir leitura guiada
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </IslandShell>
  );
}

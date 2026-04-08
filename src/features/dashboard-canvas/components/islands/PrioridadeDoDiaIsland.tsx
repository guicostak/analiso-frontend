"use client";

/**
 * PrioridadeDoDiaIsland (4×2)
 *
 * CTA "Sessão guiada" pré-selecionada no item de maior prioridade.
 */

import { ChevronRight } from "lucide-react";
import type { IslandProps } from "../../interfaces/island.types";
import { useIslandData } from "../../hooks/useIslandData";

export function PrioridadeDoDiaIsland(_props: IslandProps) {
  const { priorityItem, focusInboxRecentImpact, leadingPillarMovement } = useIslandData();

  return (
    /* Viés: Default Effect — o CTA já vem com o item-âncora pré-selecionado.
       Não exigimos que o usuário escolha entre alternativas. */
    <article className="flex h-full w-full flex-col justify-between rounded-[20px] border border-border bg-card p-5">
      <div>
        <p className="text-[12px] font-medium uppercase text-muted-foreground">Prioridade do dia</p>
        <h2 className="mt-2 max-w-[20ch] text-[16px] font-semibold leading-[1.3] tracking-[-0.02em] text-foreground">
          {priorityItem
            ? `${priorityItem.ticker} é o melhor ponto de entrada para entender o que mudou hoje.`
            : `O pilar ${leadingPillarMovement.pillar.toLowerCase()} concentra o melhor ponto de leitura.`}
        </h2>
      </div>

      <button
        type="button"
        onClick={focusInboxRecentImpact}
        className="mt-3 inline-flex items-center justify-center gap-2 rounded-[14px] bg-brand px-4 py-2.5 text-[13px] font-semibold text-white transition hover:bg-brand-hover"
      >
        Abrir leitura guiada
        <ChevronRight className="h-4 w-4" />
      </button>
    </article>
  );
}

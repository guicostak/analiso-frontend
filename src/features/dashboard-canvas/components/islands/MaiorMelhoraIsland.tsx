"use client";

/**
 * MaiorMelhoraIsland (4×2)
 *
 * Recuperação mais relevante da watchlist hoje.
 */

import type { IslandProps } from "../../interfaces/island.types";
import { useIslandData } from "../../hooks/useIslandData";

export function MaiorMelhoraIsland(_props: IslandProps) {
  const { topImproveItem, openInboxItem, focusInboxRecentImpact, todayHealthyCount } = useIslandData();

  return (
    /* Viés: Reciprocity — celebrar pequenas vitórias mantém o usuário
       investido na leitura mesmo em sessões neutras. */
    <button
      type="button"
      onClick={() => (topImproveItem ? openInboxItem(topImproveItem) : focusInboxRecentImpact())}
      className="relative flex h-full w-full flex-col justify-between overflow-hidden rounded-[20px] border border-success-border bg-card px-5 py-5 text-left transition hover:shadow-[0_14px_26px_rgba(18,165,148,0.10)] dark:hover:shadow-none"
    >
      <div className="absolute inset-x-0 top-0 h-[44px] rounded-t-[20px] bg-brand-surface" />
      <p className="absolute left-5 top-4 text-sm font-medium leading-5 text-brand">Maior melhora</p>

      <div className="mt-9">
        <p className="text-[18px] font-semibold leading-[1.2] text-foreground">
          {topImproveItem ? topImproveItem.ticker : "Sem melhora nova"}
        </p>
        <p className="mt-2 line-clamp-2 text-[13px] leading-5 text-muted-foreground">
          {topImproveItem
            ? topImproveItem.benefitNow ?? topImproveItem.whyItMatters
            : "Ainda não apareceu uma recuperação relevante o suficiente."}
        </p>
      </div>

      <div className="mt-3 flex items-center justify-between text-[12px]">
        <span className="text-muted-foreground">
          {topImproveItem?.entryReason ?? "Recuperação com leitura mais limpa"}
        </span>
        <span className="font-semibold text-brand">
          {topImproveItem?.priorityRank ?? todayHealthyCount}
        </span>
      </div>
    </button>
  );
}

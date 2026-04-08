"use client";

/**
 * MaiorAtencaoIsland (4×2)
 *
 * Item de maior risco entrando na watchlist hoje. Tom amber/danger
 * controlado, sem cor gritante.
 */

import type { IslandProps } from "../../interfaces/island.types";
import { useIslandData } from "../../hooks/useIslandData";

export function MaiorAtencaoIsland(_props: IslandProps) {
  const { topRiskItem, openInboxItem, focusInboxRecentImpact, todayRiskCount } = useIslandData();

  return (
    /* Viés: Loss Aversion — destaca o que pode dar errado, mas com tom
       contido (danger-text + danger-border, sem vermelho gritante). */
    <button
      type="button"
      onClick={() => (topRiskItem ? openInboxItem(topRiskItem) : focusInboxRecentImpact())}
      className="relative flex h-full w-full flex-col justify-between overflow-hidden rounded-[20px] border border-danger-border bg-card px-5 py-5 text-left transition hover:shadow-[0_14px_26px_rgba(181,71,104,0.10)] dark:hover:shadow-none"
    >
      <div className="absolute inset-x-0 top-0 h-[44px] rounded-t-[20px] bg-danger-surface" />
      <p className="absolute left-5 top-4 text-sm font-medium leading-5 text-danger-text">
        Maior atenção
      </p>

      <div className="mt-9">
        <p className="text-[18px] font-semibold leading-[1.2] text-foreground">
          {topRiskItem ? topRiskItem.ticker : "Sem risco novo"}
        </p>
        <p className="mt-2 line-clamp-2 text-[13px] leading-5 text-muted-foreground">
          {topRiskItem
            ? topRiskItem.benefitNow ?? topRiskItem.whyItMatters
            : "Nenhum sinal crítico novo entrou na watchlist nas últimas 24h."}
        </p>
      </div>

      <div className="mt-3 flex items-center justify-between text-[12px]">
        <span className="text-muted-foreground">
          {topRiskItem?.entryReason ?? "Pressão concentrada no topo da leitura"}
        </span>
        <span className="font-semibold text-danger-text">
          {topRiskItem?.priorityRank ?? todayRiskCount}
        </span>
      </div>
    </button>
  );
}

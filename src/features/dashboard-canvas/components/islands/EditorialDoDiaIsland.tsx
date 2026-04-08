"use client";

/**
 * EditorialDoDiaIsland (12×1)
 *
 * Faixa horizontal com sugestão editorial: por onde começar. Reaproveita
 * o tom do `quick-action-cards` (componente embrião) mas em formato
 * editorial mais conciso.
 */

import { ChevronRight } from "lucide-react";
import type { IslandProps } from "../../interfaces/island.types";
import { useIslandData } from "../../hooks/useIslandData";

export function EditorialDoDiaIsland(_props: IslandProps) {
  const { priorityItem, leadingPillarMovement, focusInboxRecentImpact } = useIslandData();

  const text = priorityItem
    ? `${priorityItem.ticker} abre sua sessão hoje. Depois, siga para ${leadingPillarMovement.pillar.toLowerCase()} para confirmar se a pressão ficou concentrada ou já se espalhou.`
    : `${leadingPillarMovement.pillar} reúne o principal contexto do dia. Comece pelo feed e use os blocos laterais para confirmar.`;

  return (
    /* Viés: Authority — uma sugestão editorial curada reduz a paralisia
       de "por onde começo?" no início da sessão. */
    <section className="flex h-full w-full items-center justify-between gap-4 rounded-[20px] border border-border bg-muted px-5 py-4 dark:bg-muted/30">
      <div className="min-w-0">
        <p className="text-[12px] font-medium uppercase text-blue-500 dark:text-blue-400">Por onde começar</p>
        <p className="mt-1 truncate text-[14px] font-semibold leading-6 text-foreground">{text}</p>
      </div>
      <button
        type="button"
        onClick={focusInboxRecentImpact}
        className="inline-flex shrink-0 items-center gap-2 rounded-full bg-card px-4 py-2 text-[13px] font-semibold text-foreground transition hover:bg-hover"
      >
        Ir para o feed
        <ChevronRight className="h-4 w-4 text-muted-foreground" />
      </button>
    </section>
  );
}

"use client";

/**
 * WatchlistResumoIsland (4×3)
 *
 * Saúde da watchlist: quantos seguem estáveis vs em pressão.
 */

import type { IslandProps } from "../../interfaces/island.types";
import { useIslandData } from "../../hooks/useIslandData";

export function WatchlistResumoIsland(_props: IslandProps) {
  const {
    healthyWatchlistCount,
    totalWatchlistCount,
    todayHealthyCount,
    todayAttentionCount,
  } = useIslandData();

  const safeTotal = Math.max(totalWatchlistCount, 1);
  const healthyPct  = (healthyWatchlistCount / safeTotal) * 100;
  const attentionPct = (todayAttentionCount / safeTotal) * 100;
  const restPct = Math.max(100 - healthyPct - attentionPct, 0);

  return (
    /* Viés: Goal Gradient — mostrar quanto da watchlist está "ok" reforça
       o senso de progresso (ex.: "10 de 12 estáveis"). */
    <article className="flex h-full w-full flex-col rounded-[20px] border border-border bg-muted dark:bg-muted/30 p-6">
      <p className="text-[12px] font-medium uppercase text-blue-500 dark:text-blue-400">
        Saúde da watchlist
      </p>
      <h3 className="mt-2 text-[20px] font-semibold tracking-[-0.02em] text-foreground">
        {healthyWatchlistCount} de {totalWatchlistCount} seguem estáveis
      </h3>
      <p className="mt-2 text-[13px] leading-5 text-muted-foreground">
        A pressão está concentrada em poucos nomes — fácil priorizar a leitura.
      </p>

      <div className="mt-auto space-y-3 pt-4">
        <div className="h-2.5 overflow-hidden rounded-full bg-card">
          <div className="flex h-full">
            <div className="h-full bg-blue-500 dark:bg-blue-400" style={{ width: `${healthyPct}%` }} />
            <div className="h-full bg-blue-200 dark:bg-blue-700" style={{ width: `${attentionPct}%` }} />
            <div className="h-full bg-blue-100 dark:bg-blue-900/50" style={{ width: `${restPct}%` }} />
          </div>
        </div>
        <div className="flex items-center justify-between text-[12px]">
          <span className="text-muted-foreground">Hoje</span>
          <span className="font-semibold text-blue-700 dark:text-blue-400">
            {todayHealthyCount} sinais positivos
          </span>
        </div>
      </div>
    </article>
  );
}

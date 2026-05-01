"use client";

/**
 * FeedMudancasIsland (12×3)
 *
 * Feed curado de mudanças relevantes nas empresas da watchlist. Usa
 * `inboxRows` já consumido pelo `useDashboardInbox` — zero fetch novo.
 *
 * Information Foraging: linha enxuta com "scent" claro (ticker, título,
 * por que importa) deixa o usuário decidir rápido qual abrir.
 */

import { Activity, ChevronRight } from "lucide-react";
import { Avatar, AvatarFallback } from "@/src/components/ui/avatar";
import type { IslandProps } from "../../interfaces/island.types";
import { useIslandData } from "../../hooks/useIslandData";
import { IslandShell } from "../shared/IslandShell";

const VISIBLE_COUNT = 6;

export function FeedMudancasIsland(_props: IslandProps) {
  const { inboxRows, openInboxItem, isRefreshing } = useIslandData();
  const visible = inboxRows.slice(0, VISIBLE_COUNT);

  return (
    <IslandShell
      icon={<Activity className="h-4 w-4 text-muted-foreground" />}
      title="Mudanças que importam"
      info="Feed curado de mudanças nas empresas da watchlist. Cada item mostra ticker, título e por que aquilo importa pra você. Clique pra abrir."
    >
      <div className="flex-1 min-h-0 overflow-y-auto pr-1">
        {isRefreshing ? (
          <ul className="space-y-3">
            {[1, 2, 3].map((i) => (
              <li key={i} className="h-16 animate-pulse rounded-[14px] bg-muted" />
            ))}
          </ul>
        ) : visible.length === 0 ? (
          <p className="py-6 text-center text-[12.5px] text-muted-foreground">
            Nenhuma atualização relevante no período.
          </p>
        ) : (
          <ul className="space-y-2">
            {visible.map((item) => (
              <li key={item.id}>
                <button
                  type="button"
                  onClick={() => openInboxItem(item)}
                  className="flex w-full items-start gap-3 rounded-[14px] border border-transparent bg-muted/40 px-3 py-3 text-left transition hover:border-border hover:bg-muted"
                >
                  <Avatar className="h-9 w-9 rounded-[10px] border border-border bg-card">
                    <AvatarFallback className="bg-card text-[10px] text-muted-foreground">
                      {item.ticker.slice(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <p className="text-[11.5px] font-medium text-muted-foreground">
                      {item.ticker} · {item.companyName}
                    </p>
                    <p className="mt-0.5 truncate text-[13.5px] font-semibold text-foreground">
                      {item.title}
                    </p>
                    <p className="mt-1 line-clamp-1 text-[11.5px] text-muted-foreground">
                      {item.whyItMatters}
                    </p>
                  </div>
                  <ChevronRight className="mt-3 h-4 w-4 shrink-0 text-muted-foreground" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </IslandShell>
  );
}

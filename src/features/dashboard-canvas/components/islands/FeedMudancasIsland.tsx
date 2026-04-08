"use client";

/**
 * FeedMudancasIsland (8×3)
 *
 * Reaproveita o markup de feed curado do `changes-feed-card.tsx` (componente
 * embrião). Aqui usamos diretamente o `inboxRows` já consumido pelo
 * `useDashboardInbox` — zero fetch novo.
 */

import { ChevronRight } from "lucide-react";
import { Avatar, AvatarFallback } from "@/src/components/ui/avatar";
import type { IslandProps } from "../../interfaces/island.types";
import { useIslandData } from "../../hooks/useIslandData";

export function FeedMudancasIsland(_props: IslandProps) {
  const { inboxRows, openInboxItem, isRefreshing } = useIslandData();

  const visible = inboxRows.slice(0, 6);

  return (
    /* Viés: Information Foraging — feed enxuto com "scent" claro (ticker,
       título, contexto) deixa o usuário decidir rápido qual abrir. */
    <article className="flex h-full w-full flex-col overflow-hidden rounded-[20px] border border-border bg-card">
      <header className="border-b border-border px-5 py-4">
        <p className="text-[12px] font-medium uppercase text-muted-foreground">
          Mudanças que importam
        </p>
        <h2 className="mt-1 text-[16px] font-semibold leading-[1.3] tracking-[-0.02em] text-foreground">
          Feed curado da sua watchlist
        </h2>
      </header>

      <div className="flex-1 overflow-y-auto px-5 py-3">
        {isRefreshing ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 animate-pulse rounded-[18px] bg-muted" />
            ))}
          </div>
        ) : visible.length === 0 ? (
          <p className="py-6 text-center text-[13px] text-muted-foreground">
            Nenhuma atualização relevante no período.
          </p>
        ) : (
          <ul className="space-y-2">
            {visible.map((item) => (
              <li key={item.id}>
                <button
                  type="button"
                  onClick={() => openInboxItem(item)}
                  className="flex w-full items-start gap-3 rounded-[16px] border border-transparent bg-muted/40 px-3 py-3 text-left transition hover:border-border hover:bg-muted"
                >
                  <Avatar className="h-9 w-9 rounded-[10px] border border-border bg-card">
                    <AvatarFallback className="bg-card text-[10px] text-muted-foreground">
                      {item.ticker.slice(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <p className="text-[12px] font-medium text-muted-foreground">
                      {item.ticker} · {item.companyName}
                    </p>
                    <p className="mt-0.5 truncate text-[14px] font-semibold text-foreground">
                      {item.title}
                    </p>
                    <p className="mt-1 line-clamp-1 text-[12px] text-muted-foreground">
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
    </article>
  );
}

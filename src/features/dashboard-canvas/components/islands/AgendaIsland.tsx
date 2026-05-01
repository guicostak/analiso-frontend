"use client";

/**
 * AgendaIsland (4×2)
 *
 * Próximos eventos relevantes da watchlist (resultados, ex-dividendos,
 * assembleias, etc). Reaproveita `useAgenda()` que já consome
 * `/api/agenda?dateFrom=...&dateTo=...`.
 */

import Link from "next/link";
import { Calendar, ChevronRight } from "lucide-react";
import { useAgenda } from "@/src/features/agenda/hooks/useAgenda";
import type { IslandProps } from "../../interfaces/island.types";
import { IslandShell } from "../shared/IslandShell";

const VISIBLE_COUNT = 4;

export function AgendaIsland(_props: IslandProps) {
  const { allEvents, loading } = useAgenda();
  const upcoming = allEvents.filter((e) => !e.isPast).slice(0, VISIBLE_COUNT);

  return (
    <IslandShell
      icon={<Calendar className="h-4 w-4 text-muted-foreground" />}
      title="Agenda"
      right={
        <Link
          href="/agenda"
          className="text-[11px] font-semibold text-brand hover:underline"
        >
          Ver tudo
        </Link>
      }
      info="Eventos corporativos próximos das empresas da sua watchlist (resultados, ex-dividendos, assembleias)."
    >
      <ul className="flex-1 min-h-0 space-y-2 overflow-y-auto pr-1">
        {loading && [0, 1, 2].map((i) => (
          <li key={i} className="h-10 animate-pulse rounded-[10px] bg-muted" />
        ))}
        {!loading && upcoming.length === 0 && (
          <li className="px-1 py-3 text-[12px] text-muted-foreground">
            Nenhum evento próximo na sua watchlist.
          </li>
        )}
        {!loading && upcoming.map((event) => (
          <li
            key={event.id}
            className="flex items-center justify-between gap-2 rounded-[10px] bg-muted px-3 py-2"
          >
            <div className="min-w-0">
              <p className="truncate text-[12.5px] font-semibold text-foreground">
                {event.ticker} · {event.title}
              </p>
              <p className="text-[10.5px] text-muted-foreground">{event.formattedDate}</p>
            </div>
            <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
          </li>
        ))}
      </ul>
    </IslandShell>
  );
}

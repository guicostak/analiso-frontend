"use client";

/**
 * AgendaIsland (4×2)
 *
 * Próximos eventos relevantes da watchlist. Reaproveita `useAgenda()`.
 */

import Link from "next/link";
import { Calendar, ChevronRight } from "lucide-react";
import { useAgenda } from "@/src/features/agenda/hooks/useAgenda";
import type { IslandProps } from "../../interfaces/island.types";

const VISIBLE_COUNT = 3;

export function AgendaIsland(_props: IslandProps) {
  const { allEvents, loading } = useAgenda();
  const upcoming = allEvents.filter((e) => !e.isPast).slice(0, VISIBLE_COUNT);

  return (
    /* Viés: Anticipation — eventos futuros próximos criam compromisso
       implícito de voltar ao painel para acompanhar. */
    <article className="flex h-full w-full flex-col rounded-[20px] border border-border bg-card p-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <h3 className="text-[13px] font-semibold text-foreground">Agenda</h3>
        </div>
        <Link href="/agenda" className="text-[11px] font-semibold text-brand">
          Ver tudo
        </Link>
      </div>

      <ul className="mt-3 flex-1 space-y-2">
        {loading && [0, 1, 2].map((i) => (
          <li key={i} className="h-10 animate-pulse rounded-[12px] bg-muted" />
        ))}
        {!loading && upcoming.length === 0 && (
          <p className="py-4 text-[12px] text-muted-foreground">
            Nenhum evento próximo na sua watchlist.
          </p>
        )}
        {!loading && upcoming.map((event) => (
          <li key={event.id} className="flex items-center justify-between gap-2 rounded-[12px] bg-muted px-3 py-2">
            <div className="min-w-0">
              <p className="truncate text-[13px] font-semibold text-foreground">
                {event.ticker} · {event.title}
              </p>
              <p className="text-[11px] text-muted-foreground">{event.formattedDate}</p>
            </div>
            <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
          </li>
        ))}
      </ul>
    </article>
  );
}

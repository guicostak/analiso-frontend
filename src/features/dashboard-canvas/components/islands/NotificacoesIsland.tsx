"use client";

/**
 * NotificacoesIsland (4×2)
 *
 * Resumo de notificações: contador de não lidas + 3 últimas com link pra
 * `/notifications`. Fonte: `useNotifications` (polling 5min).
 */

import Link from "next/link";
import { Bell } from "lucide-react";

import { useNotifications } from "@/src/features/notifications/hooks/useNotifications";
import type { IslandProps } from "../../interfaces/island.types";
import { IslandShell } from "../shared/IslandShell";

const VISIBLE_COUNT = 3;

function fmtRelative(iso: string): string {
  const d = new Date(iso);
  const diffMs = Date.now() - d.getTime();
  const min = Math.floor(diffMs / 60000);
  if (min < 1)    return "agora";
  if (min < 60)   return `${min}m`;
  const hr = Math.floor(min / 60);
  if (hr < 24)    return `${hr}h`;
  const day = Math.floor(hr / 24);
  if (day < 7)    return `${day}d`;
  return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
}

export function NotificacoesIsland(_props: IslandProps) {
  const { items, unreadCount, isLoading } = useNotifications();
  const recent = items.slice(0, VISIBLE_COUNT);

  return (
    <IslandShell
      icon={<Bell className="h-4 w-4 text-muted-foreground" />}
      title="Notificações"
      right={
        !isLoading && unreadCount > 0 ? (
          <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10.5px] font-semibold text-amber-700 dark:bg-amber-950/40 dark:text-amber-300">
            {unreadCount} não lida{unreadCount === 1 ? "" : "s"}
          </span>
        ) : undefined
      }
      info="Suas últimas notificações. O badge mostra quantas ainda não foram lidas."
    >
      <ul className="flex-1 min-h-0 space-y-1.5 overflow-y-auto pr-1">
        {isLoading && [0, 1, 2].map((i) => (
          <li key={i} className="h-9 animate-pulse rounded-[10px] bg-muted" />
        ))}
        {!isLoading && recent.length === 0 && (
          <li className="px-1 py-3 text-[12px] text-muted-foreground">
            Sem notificações no momento.
          </li>
        )}
        {!isLoading && recent.map((n) => (
          <li key={n.id}>
            <Link
              href="/notifications"
              className="flex items-start gap-2 rounded-[10px] bg-muted px-3 py-2 text-[12.5px] transition-colors duration-150 ease-out hover:bg-hover"
            >
              <span
                className={`mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full ${
                  n.read ? "bg-muted-foreground/40" : "bg-amber-500"
                }`}
                aria-hidden
              />
              <span className="flex-1 truncate font-medium text-foreground">{n.title}</span>
              <span className="flex-shrink-0 text-[10.5px] text-muted-foreground">
                {fmtRelative(n.timestamp)}
              </span>
            </Link>
          </li>
        ))}
      </ul>

      {!isLoading && items.length > VISIBLE_COUNT && (
        <Link
          href="/notifications"
          className="mt-2 block text-center text-[11px] font-medium text-brand hover:underline"
        >
          Ver todas →
        </Link>
      )}
    </IslandShell>
  );
}

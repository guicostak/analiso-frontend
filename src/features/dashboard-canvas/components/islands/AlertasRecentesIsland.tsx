"use client";

/**
 * AlertasRecentesIsland (3×1)
 *
 * Resumo compacto das notificações recentes do usuário.
 * Toda notificação (notícias, contexto e movimentações de mercado) é tratada
 * como "alerta" — não há mais distinção por tipo.
 */

import Link from "next/link";
import { Bell } from "lucide-react";
import { useNotifications } from "@/src/features/notifications/hooks/useNotifications";
import type { IslandProps } from "../../interfaces/island.types";

export function AlertasRecentesIsland(_props: IslandProps) {
  const { items, unreadCount, isLoading } = useNotifications();

  return (
    /* Viés: Salience — número discreto mas visível mantém o usuário ciente
       sem virar uma badge intrusiva. */
    <Link
      href="/notifications"
      className="flex h-full w-full items-center gap-3 rounded-[20px] border border-border bg-card px-4 py-3 transition hover:bg-hover"
    >
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300">
        <Bell className="h-4 w-4" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-[12px] font-medium uppercase text-muted-foreground">Alertas</p>
        <p className="text-[14px] font-semibold text-foreground">
          {isLoading ? "Carregando…" : `${items.length} no histórico · ${unreadCount} não lido(s)`}
        </p>
      </div>
    </Link>
  );
}

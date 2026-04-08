"use client";

/**
 * ContinueIsland (4×1)
 *
 * Retoma a última leitura interrompida. Vínculo Zeigarnik: tarefas em
 * aberto puxam a atenção mais que tarefas concluídas.
 */

import { PlayCircle, ArrowRight } from "lucide-react";
import type { IslandProps } from "../../interfaces/island.types";
import { useIslandData } from "../../hooks/useIslandData";

export function ContinueIsland(_props: IslandProps) {
  const { inboxRows, viewedInboxItemIds, openInboxItem } = useIslandData();
  const lastUnread = inboxRows.find((item) => !viewedInboxItemIds.includes(item.id));

  return (
    /* Viés: Zeigarnik — destacamos a leitura interrompida ou pendente,
       sinalizando ao usuário que algo "fica em aberto" se não voltar. */
    <button
      type="button"
      onClick={() => lastUnread && openInboxItem(lastUnread)}
      disabled={!lastUnread}
      className="flex h-full w-full items-center gap-3 rounded-[20px] border border-border bg-card px-4 py-3 text-left transition hover:bg-hover disabled:cursor-not-allowed"
    >
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-surface text-brand">
        <PlayCircle className="h-5 w-5" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-[12px] font-medium uppercase text-muted-foreground">Continuar</p>
        <p className="truncate text-[13px] font-semibold text-foreground">
          {lastUnread ? `${lastUnread.ticker} · ${lastUnread.title}` : "Nada em aberto"}
        </p>
      </div>
      <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground" />
    </button>
  );
}

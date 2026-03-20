"use client";

import { GitCompare, Plus } from "lucide-react";

interface WatchlistHeaderProps {
  activeTab: "updates" | "list";
}

export function WatchlistHeader({ activeTab }: WatchlistHeaderProps) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div className="flex flex-col gap-0.5">
        <h1 className="text-2xl font-semibold text-foreground">Monitorados</h1>
        <p className="text-sm text-muted-foreground">
          {activeTab === "updates"
            ? "Triagem primeiro, organização depois. Foque no que mudou."
            : "Organize sua watchlist e acompanhe o estado atual de cada empresa."}
        </p>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <button className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2 text-sm font-medium text-dim hover:bg-hover transition-colors">
          <Plus className="w-4 h-4" />
          Adicionar empresa
        </button>
        <button className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2 text-sm text-muted-foreground hover:bg-hover transition-colors">
          <GitCompare className="w-4 h-4" />
          Comparar
        </button>
      </div>
    </div>
  );
}

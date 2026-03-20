"use client";

import type { AlertItem } from "../../types/watchlist";

const alertStyles: Record<AlertItem["severity"], string> = {
  Risco: "bg-rose-100 text-rose-900 border-rose-300",
  "Atenção": "bg-amber-100 text-amber-900 border-amber-300",
  "Saudável": "bg-emerald-100 text-emerald-900 border-emerald-300",
};

interface WatchlistSidebarProps {
  summaryAttentionCount: number;
  summaryRiskCount: number;
  summaryChanges30dCount: number;
  alertsToShow: AlertItem[];
  showAlertActionOnly: boolean;
  applySummaryAttentionFilter: () => void;
  applySummaryRiskFilter: () => void;
  applySummaryChangesWindow: () => void;
  setShowAlertActionOnly: (v: boolean) => void;
}

export function WatchlistSidebar({
  summaryAttentionCount,
  summaryRiskCount,
  summaryChanges30dCount,
  alertsToShow,
  showAlertActionOnly,
  applySummaryAttentionFilter,
  applySummaryRiskFilter,
  applySummaryChangesWindow,
  setShowAlertActionOnly,
}: WatchlistSidebarProps) {
  return (
    <aside className="lg:col-span-3 space-y-3">
      <div className="lg:sticky lg:top-16 space-y-4">
        <div className="rounded-2xl border border-border bg-muted p-3">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Panorama rápido</h3>
            <span className="text-[11px] text-muted-foreground">Hoje</span>
          </div>
          <p className="text-[11px] text-dim">
            Hoje a watchlist segue mais carregada em atenção do que em estabilidade.
          </p>
          <div className="mt-1.5 grid grid-cols-3 gap-1 text-[11px] text-muted-foreground">
            <button
              onClick={applySummaryAttentionFilter}
              className="rounded-md border border-border bg-card p-1 text-center hover:bg-hover transition-colors"
            >
              <p className="text-sm font-semibold text-foreground">{summaryAttentionCount}</p>
              <p>em atenção</p>
            </button>
            <button
              onClick={applySummaryRiskFilter}
              className="rounded-md border border-border bg-card p-1 text-center hover:bg-hover transition-colors"
            >
              <p className="text-sm font-semibold text-foreground">{summaryRiskCount}</p>
              <p>em risco</p>
            </button>
            <button
              onClick={applySummaryChangesWindow}
              className="rounded-md border border-border bg-card p-1 text-center hover:bg-hover transition-colors"
            >
              <p className="text-sm font-semibold text-foreground">{summaryChanges30dCount}</p>
              <p>mudanças 30d</p>
            </button>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-muted p-3.5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-foreground">Alertas</h3>
            <button
              onClick={() => setShowAlertActionOnly(!showAlertActionOnly)}
              className={`text-xs px-2 py-1 rounded-full border ${
                showAlertActionOnly
                  ? "border-brand-border bg-brand-surface text-brand-text"
                  : "border-border text-muted-foreground"
              }`}
            >
              {showAlertActionOnly ? "Filtro ativo · Ação agora" : "Mostrando todos"}
            </button>
          </div>
          <div className="space-y-2">
            {alertsToShow.map((alert) => (
              <div key={alert.id} className={`rounded-xl border p-3 ${alert.severity === "Risco" ? "border-brand-border bg-brand-surface" : "border-border bg-muted"}`}>
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold text-foreground">{alert.title}</p>
                  <span className={`px-2 py-0.5 rounded-full border text-[10px] ${alertStyles[alert.severity]}`}>
                    {alert.severity}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">{alert.summary}</p>
                <p className="text-[11px] text-muted-foreground mt-2">{alert.time}</p>
              </div>
            ))}
          </div>
          <button className="mt-3 w-full px-3 py-2 rounded-xl border border-border text-xs text-muted-foreground hover:bg-hover">
            Configurar alertas
          </button>
        </div>
      </div>
    </aside>
  );
}

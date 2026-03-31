"use client";

import { AlertTriangle, Bell, Plus, Trash2, ToggleLeft, ToggleRight } from "lucide-react";
import { Sidebar } from "@/src/components/layout/Sidebar";
import { AppTopBar } from "@/src/components/layout/AppTopBar";
import { MainContent } from "@/src/components/layout/MainContent";
import { mockActiveAlerts } from "@/src/data/dashboard-feed";

// Dados mock para a página completa de alertas
const mockAllAlerts = [
  ...mockActiveAlerts.map((a) => ({ ...a, active: true, triggered: true })),
  {
    id: "a3",
    ticker: "PETR4",
    condition: "DY > 8%",
    triggeredAt: "há 5 dias",
    active: true,
    triggered: false,
  },
  {
    id: "a4",
    ticker: "WEGE3",
    condition: "P/L < 20x",
    triggeredAt: "há 7 dias",
    active: false,
    triggered: false,
  },
  {
    id: "a5",
    ticker: "ITUB4",
    condition: "Score saúde > 80",
    triggeredAt: "há 10 dias",
    active: true,
    triggered: false,
  },
];

export function AlertsPage() {
  const triggeredAlerts = mockAllAlerts.filter((a) => a.triggered);
  const pendingAlerts = mockAllAlerts.filter((a) => !a.triggered);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Sidebar currentPage="alertas" />
      <AppTopBar />

      <MainContent className="px-5 pb-8 pt-20 xl:px-7 xl:pt-20">
        <div className="mx-auto max-w-3xl">
          {/* Header */}
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-100 dark:bg-orange-900/30">
                <Bell className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <h1 className="text-lg font-semibold text-foreground">Alertas</h1>
                <p className="text-xs text-muted-foreground">{mockAllAlerts.length} alertas configurados</p>
              </div>
            </div>
            <button className="flex items-center gap-2 rounded-lg bg-foreground px-3 py-2 text-xs font-medium text-card transition-opacity hover:opacity-90">
              <Plus className="h-3.5 w-3.5" />
              Novo alerta
            </button>
          </div>

          {/* Disparados */}
          {triggeredAlerts.length > 0 && (
            <section className="mb-6">
              <div className="mb-3 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-danger-text" />
                <h2 className="text-sm font-semibold text-foreground">Disparados</h2>
                <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-danger-surface px-1.5 text-[10px] font-bold text-danger-text">
                  {triggeredAlerts.length}
                </span>
              </div>
              <div className="space-y-2">
                {triggeredAlerts.map((alert) => (
                  <AlertRow key={alert.id} alert={alert} />
                ))}
              </div>
            </section>
          )}

          {/* Monitorando */}
          <section>
            <h2 className="mb-3 text-sm font-semibold text-foreground">Monitorando</h2>
            <div className="space-y-2">
              {pendingAlerts.map((alert) => (
                <AlertRow key={alert.id} alert={alert} />
              ))}
            </div>
          </section>
        </div>
      </MainContent>
    </div>
  );
}

function AlertRow({
  alert,
}: {
  alert: {
    id: string;
    ticker: string;
    condition: string;
    triggeredAt: string;
    active: boolean;
    triggered: boolean;
  };
}) {
  return (
    <div
      className={`flex items-center justify-between rounded-xl border p-4 transition-colors ${
        alert.triggered
          ? "border-danger-border bg-danger-surface"
          : "border-border bg-card"
      }`}
    >
      <div className="flex items-start gap-3">
        <div
          className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
            alert.triggered ? "bg-danger-surface" : "bg-muted"
          }`}
        >
          {alert.triggered ? (
            <AlertTriangle className="h-4 w-4 text-danger-text" />
          ) : (
            <Bell className="h-4 w-4 text-muted-foreground" />
          )}
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-foreground">{alert.ticker}</span>
            {alert.triggered && (
              <span className="rounded-full bg-danger-surface px-2 py-0.5 text-[10px] font-medium text-danger-text">
                Disparado
              </span>
            )}
          </div>
          <p className="mt-0.5 text-xs text-muted-foreground">{alert.condition}</p>
          <p className="mt-0.5 text-[11px] text-muted-foreground/70">{alert.triggeredAt}</p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          aria-label={alert.active ? "Desativar alerta" : "Ativar alerta"}
          className="text-muted-foreground transition-colors hover:text-foreground"
        >
          {alert.active ? (
            <ToggleRight className="h-5 w-5 text-brand" />
          ) : (
            <ToggleLeft className="h-5 w-5" />
          )}
        </button>
        <button
          aria-label="Remover alerta"
          className="text-muted-foreground transition-colors hover:text-danger-text"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

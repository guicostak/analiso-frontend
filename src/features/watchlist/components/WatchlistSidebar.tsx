"use client";

import { useState } from "react";
import Link from "next/link";
import { Settings } from "lucide-react";
import type { AlertItem } from "../interfaces";
import type { WatchlistQuickOverviewDto } from "../services";

const NOTIFICATION_CATEGORIES = [
  { key: "all", label: "Todas" },
  { key: "risco", label: "Risco" },
  { key: "atencao", label: "Atenção" },
  { key: "oportunidade", label: "Oportunidade" },
  { key: "dividendo", label: "Dividendo" },
] as const;

type NotificationCategory = (typeof NOTIFICATION_CATEGORIES)[number]["key"];

function getAlertStyle(severity: AlertItem["severity"]) {
  if (severity === "Risco") {
    return {
      shell: "border-danger-border bg-danger-surface dark:bg-danger-surface",
      badge: "border-danger-border bg-danger-surface/80 text-danger-text",
      accent: "bg-danger-surface",
    };
  }

  if (severity === "Atenção") {
    return {
      shell: "border-warning-border bg-warning-surface dark:bg-warning-surface",
      badge: "border-warning-border bg-warning-surface/80 text-warning-text",
      accent: "bg-warning-surface",
    };
  }

  return {
    shell: "border-success-border bg-success-surface dark:bg-success-surface",
    badge: "border-success-border bg-success-surface/80 text-success-text",
    accent: "bg-success-surface",
  };
}

interface WatchlistSidebarProps {
  quickOverview: WatchlistQuickOverviewDto | null;
  alertsPanelHeader: { title: string; body: string; ctaLabel: string } | null;
  alertsToShow: AlertItem[];
  showAlertActionOnly: boolean;
  applySummaryAttentionFilter: () => void;
  applySummaryRiskFilter: () => void;
  applySummaryChangesWindow: () => void;
  setShowAlertActionOnly: (v: boolean) => void;
}

export function WatchlistSidebar({
  alertsPanelHeader,
  alertsToShow,
  showAlertActionOnly,
  setShowAlertActionOnly,
}: WatchlistSidebarProps) {
  const [activeCategory, setActiveCategory] = useState<NotificationCategory>("all");

  const filteredAlerts = activeCategory === "all"
    ? alertsToShow
    : alertsToShow.filter((a) => {
        if (activeCategory === "risco") return a.severity === "Risco";
        if (activeCategory === "atencao") return a.severity === "Atenção";
        return a.severity === "Saudável";
      });

  return (
    <aside className="space-y-6 lg:col-span-4">
      <div className="space-y-6 lg:sticky lg:top-24">
        {/* ── Notificações ── */}
        <div className="rounded-[28px] border border-border bg-card p-6 shadow-[0_18px_40px_rgba(15,23,40,0.05)] dark:shadow-none">
          <div>
            <p className="text-[12px] font-medium uppercase text-muted-foreground">
              Alertas
            </p>
            <p className="mt-2 text-[15px] leading-6 text-muted-foreground">
              {alertsPanelHeader?.body ?? "Acompanhe alertas e mudanças relevantes."}
            </p>
          </div>

          {/* ── Filtro por categoria + ordenação ── */}
          <div className="mt-4 flex flex-wrap items-center gap-1.5">
            {NOTIFICATION_CATEGORIES.map((cat) => (
              <button
                key={cat.key}
                onClick={() => setActiveCategory(cat.key)}
                className={`rounded-full border px-3 py-1.5 text-[11px] font-medium transition ${
                  activeCategory === cat.key
                    ? "border-brand/30 bg-brand-surface text-brand"
                    : "border-border bg-muted text-muted-foreground hover:bg-card"
                }`}
              >
                {cat.label}
              </button>
            ))}
            <span className="mx-1 hidden h-4 w-px bg-border sm:block" />
            <select
              value={showAlertActionOnly ? "relevancia" : "data"}
              onChange={(e) => setShowAlertActionOnly(e.target.value === "relevancia")}
              className="h-7 appearance-none rounded-full border border-border bg-muted px-3 pr-6 text-[11px] font-medium text-muted-foreground outline-none transition hover:bg-card"
            >
              <option value="data">Ordenar por: Data</option>
              <option value="relevancia">Ordenar por: Relevância</option>
            </select>
          </div>

          {/* ── Lista de alertas ── */}
          <div className="mt-5 space-y-3">
            {filteredAlerts.length === 0 ? (
              <p className="py-6 text-center text-[13px] text-muted-foreground">
                Nenhum alerta nesta categoria
              </p>
            ) : (
              filteredAlerts.slice(0, 5).map((alert, index) => {
                const style = getAlertStyle(alert.severity);

                return (
                  <div
                    key={alert.id}
                    className={`overflow-hidden rounded-[20px] border ${style.shell} ${
                      index === 0
                        ? "p-5 shadow-[0_20px_44px_rgba(15,23,40,0.08)] dark:shadow-none"
                        : "p-4 shadow-[0_10px_24px_rgba(15,23,40,0.03)] dark:shadow-none"
                    }`}
                  >
                    <div className={`mb-3 h-1 ${index === 0 ? "w-16" : "w-10"} rounded-full ${style.accent}`} />
                    <div className="flex items-start justify-between gap-3">
                      <p className={`${index === 0 ? "text-[15px]" : "text-[14px]"} font-semibold leading-6 text-foreground`}>
                        {alert.title}
                      </p>
                      <span className={`rounded-full border px-2.5 py-1 text-[11px] font-medium ${style.badge}`}>
                        {alert.severity}
                      </span>
                    </div>
                    <p className={`mt-1.5 text-muted-foreground ${index === 0 ? "text-[13px] leading-6" : "text-[12px] leading-5"}`}>
                      {alert.summary}
                    </p>
                    <div className="mt-3 text-[11px] text-muted-foreground">
                      <span>{alert.time}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <div className="mt-8 flex justify-center border-t border-border pt-5">
            <Link
              href="/perfil?tab=alertas"
              className="inline-flex items-center gap-1.5 rounded-full border border-border bg-muted px-4 py-1.5 text-[11px] font-medium text-muted-foreground transition hover:bg-card hover:text-foreground"
            >
              <Settings className="h-3.5 w-3.5" />
              {alertsPanelHeader?.ctaLabel ?? "Configurar alertas"}
            </Link>
          </div>
        </div>
      </div>
    </aside>
  );
}

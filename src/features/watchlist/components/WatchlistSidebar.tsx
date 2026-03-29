"use client";

import type { AlertItem } from "../interfaces";
import type { WatchlistQuickOverviewDto } from "../services";

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
  quickOverview,
  alertsPanelHeader,
  alertsToShow,
  showAlertActionOnly,
  applySummaryAttentionFilter,
  applySummaryRiskFilter,
  applySummaryChangesWindow,
  setShowAlertActionOnly,
}: WatchlistSidebarProps) {
  const metricHandlers = [applySummaryAttentionFilter, applySummaryRiskFilter, applySummaryChangesWindow];

  return (
    <aside className="space-y-6 lg:col-span-4">
      <div className="space-y-6 lg:sticky lg:top-24">
        <div className="rounded-[28px] border border-border bg-card p-6 shadow-[0_18px_40px_rgba(15,23,40,0.05)] dark:shadow-none">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[12px] font-medium uppercase tracking-[0.08em] text-muted-foreground">
                {quickOverview?.title ?? "Panorama rápido"}
              </p>
              <h3 className="mt-2 text-[20px] font-semibold leading-[26px] tracking-[-0.02em] text-foreground">
                Hoje
              </h3>
            </div>
            <span className="rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-[11px] font-medium text-blue-700 dark:border-blue-800/50 dark:bg-blue-900/30 dark:text-blue-300">
              {quickOverview?.metrics.length ?? 0}
            </span>
          </div>

          {quickOverview && (
            <>
              <p className="mt-3 text-[15px] leading-6 text-muted-foreground">{quickOverview.body}</p>
              <div className="mt-5 grid grid-cols-3 gap-3">
                {quickOverview.metrics.map((metric, index) => (
                  <button
                    key={metric.label}
                    onClick={metricHandlers[index]}
                    className="rounded-[20px] border border-border bg-card px-3 py-4 text-left transition hover:bg-muted"
                  >
                    <p className="text-[24px] font-semibold leading-none tracking-[-0.03em] text-foreground">
                      {metric.value}
                    </p>
                    <p className="mt-2 text-[12px] leading-4 text-muted-foreground">{metric.label}</p>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        <div className="rounded-[28px] border border-border bg-card p-6 shadow-[0_18px_40px_rgba(15,23,40,0.05)] dark:shadow-none">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[12px] font-medium uppercase tracking-[0.08em] text-muted-foreground">
                {alertsPanelHeader?.title ?? "Alertas"}
              </p>
              <p className="mt-2 text-[15px] leading-6 text-muted-foreground">
                {alertsPanelHeader?.body ?? ""}
              </p>
            </div>
            <button
              onClick={() => setShowAlertActionOnly(!showAlertActionOnly)}
              className={`shrink-0 rounded-full border px-3 py-1.5 text-[12px] font-medium ${
                showAlertActionOnly
                  ? "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-800/50 dark:bg-blue-900/30 dark:text-blue-300"
                  : "border-border bg-muted text-muted-foreground"
              }`}
            >
              {showAlertActionOnly ? "Filtro ativo · Ação agora" : "Mostrando todos"}
            </button>
          </div>

          <div className="mt-5 space-y-3">
            {alertsToShow.slice(0, 3).map((alert, index) => {
              const style = getAlertStyle(alert.severity);

              return (
                <div
                  key={alert.id}
                  className={`overflow-hidden rounded-[24px] border ${style.shell} ${
                    index === 0
                      ? "p-5 shadow-[0_20px_44px_rgba(15,23,40,0.08)] dark:shadow-none"
                      : index === 1
                        ? "p-4 shadow-[0_14px_34px_rgba(15,23,40,0.05)] dark:shadow-none"
                        : "p-4 shadow-[0_10px_24px_rgba(15,23,40,0.03)] dark:shadow-none"
                  }`}
                >
                  <div className={`mb-4 h-1.5 ${index === 0 ? "w-20" : "w-14"} rounded-full ${style.accent}`} />
                  <div className="flex items-start justify-between gap-3">
                    <p className={`${index === 0 ? "text-[16px]" : "text-[15px]"} font-semibold leading-6 text-foreground`}>
                      {alert.title}
                    </p>
                    <span className={`rounded-full border px-2.5 py-1 text-[11px] font-medium ${style.badge}`}>
                      {alert.severity}
                    </span>
                  </div>
                  <p className={`mt-2 text-muted-foreground ${index === 0 ? "text-[14px] leading-6" : "text-[13px] leading-6"}`}>
                    {alert.summary}
                  </p>
                  <div className="mt-4 flex items-center justify-between gap-3 text-[11px] text-muted-foreground">
                    <span>{alert.time}</span>
                  </div>
                </div>
              );
            })}
          </div>

          <button className="mt-5 inline-flex w-full items-center justify-center rounded-[18px] border border-border bg-muted px-4 py-3 text-[13px] font-semibold text-foreground transition hover:bg-muted">
            {alertsPanelHeader?.ctaLabel ?? "Configurar alertas"}
          </button>
        </div>
      </div>
    </aside>
  );
}

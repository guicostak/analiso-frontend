"use client";

import type { AlertItem } from "../interfaces";
import type { WatchlistQuickOverviewDto } from "../services";

function getAlertStyle(severity: AlertItem["severity"]) {
  if (severity === "Risco") {
    return {
      shell: "border-[#F2D8DE] bg-[linear-gradient(180deg,#FDEFF2_0%,#FFF8FA_100%)]",
      badge: "border-[#F2D8DE] bg-white/80 text-[#B54768]",
      accent: "bg-[#F4D7DE]",
    };
  }

  if (severity === "Atenção") {
    return {
      shell: "border-[#F4E1B8] bg-[linear-gradient(180deg,#FFF6E8_0%,#FFFBF4_100%)]",
      badge: "border-[#F4E1B8] bg-white/80 text-[#B27300]",
      accent: "bg-[#F2E4C5]",
    };
  }

  return {
    shell: "border-[#D8EEE4] bg-[linear-gradient(180deg,#EFFAF6_0%,#F9FCFB_100%)]",
    badge: "border-[#D8EEE4] bg-white/80 text-[#17825B]",
    accent: "bg-[#D6EFE3]",
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
        <div className="rounded-[28px] border border-[#E7EEF5] bg-white p-6 shadow-[0_18px_40px_rgba(15,23,40,0.05)]">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[12px] font-medium uppercase tracking-[0.08em] text-[#98A2B3]">
                {quickOverview?.title ?? "Panorama rápido"}
              </p>
              <h3 className="mt-2 text-[20px] font-semibold leading-[26px] tracking-[-0.02em] text-[#0F1728]">
                Hoje
              </h3>
            </div>
            <span className="rounded-full border border-[#D9E8FF] bg-[#EEF6FF] px-3 py-1 text-[11px] font-medium text-[#3965B8]">
              {quickOverview?.metrics.length ?? 0}
            </span>
          </div>

          {quickOverview && (
            <>
              <p className="mt-3 text-[15px] leading-6 text-[#667085]">{quickOverview.body}</p>
              <div className="mt-5 grid grid-cols-3 gap-3">
                {quickOverview.metrics.map((metric, index) => (
                  <button
                    key={metric.label}
                    onClick={metricHandlers[index]}
                    className="rounded-[20px] border border-[#E7EEF5] bg-[linear-gradient(180deg,#FFFFFF_0%,#F8FBFD_100%)] px-3 py-4 text-left transition hover:bg-[#F8FBFD]"
                  >
                    <p className="text-[24px] font-semibold leading-none tracking-[-0.03em] text-[#0F1728]">
                      {metric.value}
                    </p>
                    <p className="mt-2 text-[12px] leading-4 text-[#98A2B3]">{metric.label}</p>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        <div className="rounded-[28px] border border-[#E7EEF5] bg-white p-6 shadow-[0_18px_40px_rgba(15,23,40,0.05)]">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[12px] font-medium uppercase tracking-[0.08em] text-[#98A2B3]">
                {alertsPanelHeader?.title ?? "Alertas"}
              </p>
              <p className="mt-2 text-[15px] leading-6 text-[#667085]">
                {alertsPanelHeader?.body ?? ""}
              </p>
            </div>
            <button
              onClick={() => setShowAlertActionOnly(!showAlertActionOnly)}
              className={`shrink-0 rounded-full border px-3 py-1.5 text-[12px] font-medium ${
                showAlertActionOnly
                  ? "border-[#D9E8FF] bg-[#EEF6FF] text-[#3965B8]"
                  : "border-[#E7EEF5] bg-[#F8FBFD] text-[#667085]"
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
                      ? "p-5 shadow-[0_20px_44px_rgba(15,23,40,0.08)]"
                      : index === 1
                        ? "p-4 shadow-[0_14px_34px_rgba(15,23,40,0.05)]"
                        : "p-4 shadow-[0_10px_24px_rgba(15,23,40,0.03)]"
                  }`}
                >
                  <div className={`mb-4 h-1.5 ${index === 0 ? "w-20" : "w-14"} rounded-full ${style.accent}`} />
                  <div className="flex items-start justify-between gap-3">
                    <p className={`${index === 0 ? "text-[16px]" : "text-[15px]"} font-semibold leading-6 text-[#0F1728]`}>
                      {alert.title}
                    </p>
                    <span className={`rounded-full border px-2.5 py-1 text-[11px] font-medium ${style.badge}`}>
                      {alert.severity}
                    </span>
                  </div>
                  <p className={`mt-2 text-[#516071] ${index === 0 ? "text-[14px] leading-6" : "text-[13px] leading-6"}`}>
                    {alert.summary}
                  </p>
                  <div className="mt-4 flex items-center justify-between gap-3 text-[11px] text-[#98A2B3]">
                    <span>{alert.time}</span>
                  </div>
                </div>
              );
            })}
          </div>

          <button className="mt-5 inline-flex w-full items-center justify-center rounded-[18px] border border-[#E7EEF5] bg-[#F8FBFD] px-4 py-3 text-[13px] font-semibold text-[#0F1728] transition hover:bg-[#F1F6FA]">
            {alertsPanelHeader?.ctaLabel ?? "Configurar alertas"}
          </button>
        </div>
      </div>
    </aside>
  );
}

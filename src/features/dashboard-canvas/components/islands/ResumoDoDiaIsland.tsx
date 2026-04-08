"use client";

/**
 * ResumoDoDiaIsland (12×2)
 *
 * Hero do dia com headline e contexto. Reaproveita o markup do "Resumo do
 * dia" original do `DashboardPage`.
 */

import { RotateCcw } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { cn } from "@/src/components/ui/utils";
import type { IslandProps } from "../../interfaces/island.types";
import { useIslandData } from "../../hooks/useIslandData";

export function ResumoDoDiaIsland(_props: IslandProps) {
  const {
    dashboardData,
    todayRiskCount,
    todayAttentionCount,
    todayHealthyCount,
    priorityItem,
    refreshInboxNow,
    focusInboxRecentImpact,
    renderedLabel,
  } = useIslandData();

  const headline =
    dashboardData?.summary.headline ??
    (todayRiskCount > 0 || todayAttentionCount > 0
      ? `Hoje sua watchlist teve ${todayRiskCount} mudança(s) de risco e ${todayHealthyCount} melhora(s).`
      : "Sua watchlist está estável hoje, sem pioras críticas novas.");

  const body =
    dashboardData?.summary.body ??
    (priorityItem
      ? `Comece por ${priorityItem.ticker} e valide o impacto antes de revisar o resto.`
      : "Revise primeiro os itens de maior impacto para confirmar se o contexto segue estável.");

  return (
    /* Viés: Anchoring + Primacy — primeira coisa que o usuário lê define
       o tom da sessão. Aqui ancoramos no headline curado pelo backend. */
    <article
      className={cn(
        "relative h-full w-full overflow-hidden rounded-[24px] border border-border bg-card",
        "shadow-[0_14px_30px_rgba(15,23,40,0.04)] dark:shadow-none",
      )}
    >
      <div className="absolute inset-x-0 top-0 h-[44px] rounded-t-[24px] bg-brand-surface dark:bg-brand-surface" />
      <span className="absolute left-6 top-4 text-sm font-medium leading-5 text-brand">
        Resumo do dia
      </span>

      <div className="relative grid h-full gap-4 px-6 pb-5 pt-[60px] xl:items-end xl:grid-cols-[minmax(0,1.6fr)_auto]">
        <div className="space-y-2">
          <h1 className="max-w-[32ch] text-[22px] font-semibold leading-[1.12] tracking-[-0.03em] text-foreground">
            {headline}
          </h1>
          <p className="max-w-[80ch] text-[14px] leading-6 text-muted-foreground">{body}</p>
        </div>

        <div className="flex flex-col items-start gap-2 xl:items-end">
          <span className="text-[12px] font-medium text-muted-foreground">
            Referência {dashboardData?.referenceDate ?? "—"}
          </span>
          <div className="flex items-center gap-3">
            <Button
              onClick={focusInboxRecentImpact}
              className="h-9 rounded-[18px] bg-brand px-4 text-[13px] font-semibold text-white hover:bg-brand-hover"
            >
              {dashboardData?.summary.ctaPrimary ?? "Abrir leitura"}
            </Button>
            <button
              type="button"
              onClick={refreshInboxNow}
              className="text-muted-foreground transition-colors hover:text-brand"
              aria-label="Atualizar"
            >
              <RotateCcw className="h-3.5 w-3.5" />
            </button>
            <span className="text-[12px] text-muted-foreground">{renderedLabel}</span>
          </div>
        </div>
      </div>
    </article>
  );
}

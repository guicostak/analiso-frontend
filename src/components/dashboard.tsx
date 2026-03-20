"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { AppTopBar } from "./app-top-bar";
import {
  Activity,
  ChevronDown,
  ChevronRight,
  Database,
  Ellipsis,
  FileText,
} from "lucide-react";

import { useDashboardInbox } from "../hooks/useDashboardInbox";
import type { InboxItem, Status, Pillar } from "../types/dashboard";

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Sheet, SheetContent, SheetTrigger } from "./ui/sheet";
import { cn } from "./ui/utils";
import { Sidebar } from "./dashboard/sidebar";

import logoItau from "../assets/logos/itau.png";
import logoMrv from "../assets/logos/mrv.jpg";
import logoRenner from "../assets/logos/renner.png";
import logoTaesa from "../assets/logos/taesa.png";
import logoVale from "../assets/logos/vale.png";
import logoWeg from "../assets/logos/weg.jpeg";


const logoByTicker: Record<string, string> = {
  VALE3: logoVale.src,
  LREN3: logoRenner.src,
  ITUB4: logoItau.src,
  MRVE3: logoMrv.src,
  TAEE11: logoTaesa.src,
  WEGE3: logoWeg.src,
};


const statusClasses: Record<Status, string> = {
  Saudável: "border-emerald-300 bg-emerald-100 text-emerald-900",
  Atenção: "border-amber-300 bg-amber-100 text-amber-900",
  Risco: "border-rose-300 bg-rose-100 text-rose-900",
};

function pluralize(value: number, singular: string, plural: string) {
  return `${value} ${value === 1 ? singular : plural}`;
}

function StatusBadge({ status }: { status: Status }) {
  return (
    <Badge className={cn("inline-flex h-7 min-w-[82px] items-center justify-center rounded-full border px-3 text-xs font-semibold", statusClasses[status])}>
      {status}
    </Badge>
  );
}

function SegmentedHealthBar({ healthy, attention, risk }: { healthy: number; attention: number; risk: number }) {
  const total = Math.max(healthy + attention + risk, 1);
  const healthyW = (healthy / total) * 100;
  const attentionW = (attention / total) * 100;
  const riskW = (risk / total) * 100;

  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
      <div className="h-full bg-emerald-500" style={{ width: `${healthyW}%`, float: "left" }} />
      <div className="h-full bg-amber-400" style={{ width: `${attentionW}%`, float: "left" }} />
      <div className="h-full bg-rose-500" style={{ width: `${riskW}%`, float: "left" }} />
    </div>
  );
}

function ReadingProgressStep({
  label,
  status,
  isDarkMode,
}: {
  label: string;
  status: "done" | "current" | "upcoming";
  isDarkMode: boolean;
}) {
  return (
    <div
      className={cn(
        "rounded-xl border px-3 py-2",
        status === "current"
          ? "border-brand-border bg-brand-surface"
          : status === "done"
            ? "border-border-strong bg-muted"
            : "border-border bg-card",
      )}
    >
      <div className="flex items-center gap-2">
        <span
          className={cn(
            "inline-flex h-5 w-5 items-center justify-center rounded-full border text-[10px] font-semibold",
            status === "current"
              ? "border-mint-600 bg-mint-600 text-white"
              : status === "done"
                ? "border-brand-border bg-card text-brand-text"
                : "border-border bg-muted text-muted-foreground",
          )}
        >
          {status === "done" ? "OK" : ""}
        </span>
        <p
          className={cn(
            "text-[12px] font-medium",
            status === "current" ? "text-foreground" : "text-muted-foreground",
          )}
        >
          {label}
        </p>
      </div>
    </div>
  );
}

export function Dashboard() {
  const router = useRouter();

  const {
    dashboardData, dashboardLoading, dashboardError,
    inboxFilters, inboxMode, filtersOpen, isRefreshing, refreshError, inboxError,
    realtimeItems, newBadgeUntil, viewedInboxItemIds, clockTick, isDarkMode,
    inboxRows, inboxItems, todayItems, priorityItem,
    todayRiskCount, todayAttentionCount, todayHealthyCount,
    topRiskItem, topImproveItem, focusedPillar,
    leadingPillarMovement, visiblePillarMovements,
    pillarMovements: pillarMovementsData,
    hasAnyFilterOverride, showFiltersCount, advancedFiltersCount,
    healthyWatchlistCount, totalWatchlistCount,
    activeSeverities, activePillars, activeSources,
    hasSeverityFilter, hasPillarFilter, hasSourceFilter, hasPeriodFilter,
    refreshLabel,
    setInboxFilters, setInboxMode, setFiltersOpen,
    toggleFilterSeverity, toggleFilterPillar, toggleFilterSource,
    setFilterPeriod, setFilterSortBy,
    refreshInboxNow, openInboxItem, markItemViewed,
    applySinglePillarFilter, focusInboxRecentImpact,
    setImpactMode, setRealTimeMode, clearInboxFilters,
    inboxRef,
  } = useDashboardInbox();

  // pillarMovements renomeado para evitar shadowing com a variável local
  const pillarMovements = pillarMovementsData;
  const secondPillarMovement = [...pillarMovements].sort((a, b) => b.events - a.events)[1];

  const pillarInsight: Record<Pillar, string> = {
    Dívida: "concentrou mais sinais de pressão hoje",
    Margens: "teve volume alto de mudanças com viés de atenção",
    Caixa: "perdeu força em parte da watchlist",
    Proventos: "seguiu mais estável, com poucos sinais de risco",
    Retorno: "ficou mais estável e com baixa dispersão",
  };

  const feedCtaLabel = (item: InboxItem, isPriority: boolean) => {
    if (isPriority) return "Abrir prioridade";
    if (item.eventType === "evento_futuro") return "Entender impacto";
    if (item.severity === "Risco" || item.severity === "Atenção") return "Ler analise";
    return "Ver contexto";
  };

  const supportCards = [
    {
      title: "Maior risco hoje",
      value: topRiskItem ? topRiskItem.ticker : "Sem risco novo",
      logoTicker: topRiskItem ? topRiskItem.ticker : null,
      subtitle: topRiskItem
        ? "A alavancagem subiu alem do limite interno e virou o principal ponto de pressao do dia."
        : "Nenhum sinal critico novo nas ultimas 24h.",
      delta: topRiskItem
        ? `${pluralize(todayRiskCount, "sinal critico", "sinais criticos")} nas ultimas 24h`
        : "Watchlist sem piora critica nova hoje",
      ctaLabel: "Ver análise completa",
      action: () => (topRiskItem ? openInboxItem(topRiskItem) : focusInboxRecentImpact()),
      accent: "border-rose-200 bg-rose-50 text-rose-800",
    },
    {
      title: "Maior melhora",
      value: topImproveItem ? topImproveItem.ticker : "Sem melhora nova",
      logoTicker: topImproveItem ? topImproveItem.ticker : null,
      subtitle: topImproveItem
        ? "O retorno segue estavel mesmo com ruido no dia e sustenta a leitura positiva do pilar."
        : "Sem recuperacao relevante registrada hoje.",
      delta: `${pluralize(todayHealthyCount, "sinal positivo", "sinais positivos")} relevantes hoje`,
      ctaLabel: "Ver análise completa",
      action: () => (topImproveItem ? openInboxItem(topImproveItem) : focusInboxRecentImpact()),
      accent: "border-emerald-200 bg-emerald-50 text-emerald-800",
    },
    {
      title: "Pilar mais movimentado",
      value: leadingPillarMovement.pillar,
      logoTicker: null,
      subtitle: `${leadingPillarMovement.pillar} concentrou os principais sinais do dia e merece prioridade de leitura.`,
      delta: `${leadingPillarMovement.events} eventos no dia`,
      ctaLabel: "Filtrar por pilar",
      action: () => applySinglePillarFilter(leadingPillarMovement.pillar),
      accent: "border-amber-200 bg-amber-50 text-amber-800",
    },
    {
      title: "Saúde da watchlist",
      value: `${healthyWatchlistCount} de ${totalWatchlistCount} estáveis`,
      logoTicker: null,
      subtitle: "A maior parte da watchlist segue estável hoje, com pressão concentrada em poucos nomes.",
      delta: `${healthyWatchlistCount} de ${totalWatchlistCount} sem sinais relevantes · +2,1 p.p. vs semana passada`,
      ctaLabel: "Ver composição por grupo",
      action: () => router.push("/watchlist?filtro=saude"),
      accent: "border-slate-300 bg-slate-50 text-slate-700",
    },
  ];

  const feedSectionLabel = (item: InboxItem, index: number) => {
    if (index === 0) return "Prioridade do dia";
    if (item.severity === "Risco" || item.severity === "Atenção" || item.eventType === "evento_futuro") return "Acompanhamento relevante";
    return "Estaveis e positivos";
  };

  const hasDominantPillar = leadingPillarMovement.events - (secondPillarMovement?.events ?? 0) >= 3;
  const hasClearPriority = Boolean(priorityItem && priorityItem.impactScore >= 85);
  const hasNearTermFollowUp = todayItems.some((item) => item.eventType === "evento_futuro");
  const showSessionClosing = hasClearPriority || hasDominantPillar || hasNearTermFollowUp;
  const followUpItem = inboxRows.find((item, index) => feedSectionLabel(item, index) === "Acompanhamento relevante");
  const stableItem = inboxRows.find((item, index) => feedSectionLabel(item, index) === "Estaveis e positivos");
  const progressStates = [
    { label: "Prioridade do dia", done: priorityItem ? viewedInboxItemIds.includes(priorityItem.id) : true },
    { label: "Acompanhamentos relevantes", done: followUpItem ? viewedInboxItemIds.includes(followUpItem.id) : false },
    { label: "Itens estaveis", done: stableItem ? viewedInboxItemIds.includes(stableItem.id) : false },
  ];
  const completedSteps = progressStates.filter((item) => item.done).length;
  const currentProgressStep = progressStates.findIndex((item) => !item.done);
  const progressHeadlineStep = currentProgressStep === -1 ? progressStates.length : currentProgressStep + 1;

  const activeFilterChips = [
    hasSeverityFilter ? activeSeverities : [],
    hasPillarFilter ? activePillars : [],
    hasSourceFilter ? activeSources : [],
    hasPeriodFilter ? [`${inboxFilters.period}`] : [],
  ].flat();

  const orderLabel = inboxMode === "tempo-real" ? "tempo real" : "impacto";

  return (
    <div
      className="min-h-screen bg-background text-foreground"
      style={{ fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif' }}
    >
      <div className="hidden md:fixed md:inset-y-0 md:left-0 md:z-30 md:block md:w-[88px]">
        <Sidebar currentPage="dashboard" />
      </div>

      <div className="md:pl-[88px]">
              <AppTopBar />


        <main className="space-y-5 px-6 pb-10 pt-5">
          <section className="flex flex-wrap items-start justify-between gap-3">
            <div className="space-y-1">
              <div className="flex items-center gap-3">
                <h1 className={cn("text-[24px] font-semibold", "text-foreground")}>Sua watchlist hoje</h1>
                <span className={cn("rounded-full border px-2.5 py-1 text-[12px]", "border-border bg-card text-muted-foreground")}>Atualizado {refreshLabel}</span>
              </div>
              <p className={cn("text-[13px]", "text-muted-foreground")}>Leitura das últimas 24h</p>
            </div>
            <Button variant="ghost" className={cn("h-8 rounded-lg px-2 text-[12px] font-medium", "text-muted-foreground hover:bg-hover")}>
              + Criar alerta
            </Button>
          </section>

          <section>
            <Card className={cn("rounded-2xl border", isDarkMode ? "border-brand-border bg-brand-surface" : "border-mint-200 bg-gradient-to-r from-[#ECFDF9] to-white")}>
              <CardContent className="p-4">
                {dashboardLoading ? (
                  /* Skeleton while API loads */
                  <div className="space-y-2 animate-pulse">
                    <div className={cn("h-3 w-24 rounded", isDarkMode ? "bg-brand-border" : "bg-mint-100")} />
                    <div className={cn("h-6 w-3/4 rounded", isDarkMode ? "bg-brand-border" : "bg-mint-100")} />
                    <div className={cn("h-4 w-1/2 rounded", isDarkMode ? "bg-brand-border" : "bg-mint-100")} />
                  </div>
                ) : dashboardError === "not_ready" ? (
                  <div className="space-y-2">
                    <p className={cn("text-[11px] font-semibold uppercase tracking-[0.08em]", "text-brand-text")}>Resumo de hoje</p>
                    <p className={cn("text-[20px] font-semibold leading-tight", "text-foreground")}>
                      Preparando seu dashboard...
                    </p>
                    <p className={cn("text-[14px] leading-relaxed", "text-dim")}>
                      Estamos analisando sua watchlist pela primeira vez. Isso leva menos de um minuto.
                    </p>
                    <div className="flex items-center gap-2 pt-1">
                      <div className="w-4 h-4 border-2 border-brand border-t-transparent rounded-full animate-spin" />
                      <span className={cn("text-[13px]", "text-brand-text")}>
                        Atualizando automaticamente...
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                    <div className="max-w-3xl space-y-1.5">
                      <p className={cn("text-[11px] font-semibold uppercase tracking-[0.08em]", "text-brand-text")}>Resumo de hoje</p>
                      <p className={cn("text-[20px] font-semibold leading-tight", "text-foreground")}>
                        {dashboardData?.summary.headline ??
                          (todayRiskCount > 0 || todayAttentionCount > 0
                            ? `Hoje sua watchlist teve ${pluralize(todayRiskCount, "mudança de risco", "mudanças de risco")} e ${pluralize(todayHealthyCount, "melhora importante", "melhoras importantes")}.`
                            : "Sua watchlist está estável hoje, sem pioras críticas novas.")}
                      </p>
                      <p className={cn("text-[14px] leading-relaxed", "text-dim")}>
                        {dashboardData?.summary.body ??
                          dashboardData?.nextStep.headline ??
                          (priorityItem
                            ? `Comece por ${priorityItem.ticker} e valide o impacto antes de revisar os acompanhamentos relevantes e os itens estaveis.`
                            : "Revise primeiro os itens de maior impacto para confirmar se o contexto da watchlist segue estável.")}
                      </p>
                    </div>
                    <div className="flex flex-col items-start gap-2 lg:items-end">
                      <Button onClick={focusInboxRecentImpact} className="h-9 rounded-lg bg-mint-600 px-3 text-[12px] font-semibold text-white hover:bg-mint-700">
                        {dashboardData?.summary.ctaPrimary ?? "Abrir prioridade 1"}
                      </Button>
                      <button onClick={focusInboxRecentImpact} className={cn("text-[12px] font-medium", "text-brand-text hover:text-foreground")}>
                        Ver todas as atualizações
                      </button>
                      <span
                        className={cn(
                          "inline-flex items-center gap-1.5 rounded-full border px-2 py-1 text-[11px]",
                          "border-border bg-card/60 text-muted-foreground",
                        )}
                      >
                        <Database className="h-3 w-3" />
                        Dados oficiais · CVM / B3 / RI
                      </span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </section>

          <section ref={inboxRef} className="space-y-3">
            <Card className={cn("rounded-2xl border", "border-border bg-card")}>
              <CardContent className="space-y-3 p-4">
                <div className="flex flex-col gap-1">
                  <p className={cn("text-[12px] font-semibold uppercase tracking-[0.08em]", "text-brand-text")}>
                    Leitura de hoje: {progressHeadlineStep} de {progressStates.length} etapas
                  </p>
                  <p className={cn("text-[13px]", "text-muted-foreground")}>
                    {completedSteps === progressStates.length
                      ? "Fluxo principal concluido. Se quiser, revise os blocos de apoio antes de encerrar."
                      : "Siga a ordem sugerida para reduzir ruido e concluir a sessao com mais contexto."}
                  </p>
                </div>
                <div className="grid gap-2 md:grid-cols-3">
                  {progressStates.map((step, index) => (
                    <ReadingProgressStep
                      key={step.label}
                      label={step.label}
                      isDarkMode={isDarkMode}
                      status={step.done ? "done" : index === currentProgressStep ? "current" : "upcoming"}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className={cn("rounded-2xl border", "border-border bg-muted")}>
              <CardHeader className="space-y-3 px-4 pt-4">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                  <div className="max-w-2xl">
                    <CardTitle className={cn("text-[16px] font-semibold", "text-foreground")}>Atualizações da watchlist</CardTitle>
                    <CardDescription className={cn("text-[14px]", "text-muted-foreground")}>
                      Fluxo guiado: comece pelo primeiro item, avance nos relevantes e finalize nos estaveis.
                    </CardDescription>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 text-[12px]">
                    <div className={cn("inline-flex rounded-lg border p-0.5", "border-border bg-muted")}>
                      <button
                        onClick={setImpactMode}
                        className={cn(
                          "rounded-md px-2.5 py-1.5 text-[12px] font-semibold transition",
                          inboxMode === "top-impacto" ? "bg-mint-600 text-white" : "text-muted-foreground hover:bg-hover",
                        )}
                      >
                        Top impacto
                      </button>
                      <button
                        onClick={setRealTimeMode}
                        className={cn(
                          "rounded-md px-2.5 py-1.5 text-[12px] font-semibold transition",
                          inboxMode === "tempo-real" ? "bg-mint-600 text-white" : "text-muted-foreground hover:bg-hover",
                        )}
                      >
                        Tempo real
                      </button>
                    </div>
                    <button
                      onClick={refreshInboxNow}
                      className={cn("font-medium", "text-muted-foreground hover:text-foreground")}
                      disabled={isRefreshing}
                    >
                      {isRefreshing ? "Atualizando..." : "Atualizar agora"}
                    </button>
                  </div>
                </div>

                <div className={cn("rounded-xl border p-3", "border-border bg-muted")}>
                  <div className="flex flex-wrap items-center gap-2">
                    <p className={cn("text-[12px] font-medium", "text-muted-foreground")}>Período</p>
                    {(["24h", "7d", "30d"] as WindowRange[]).map((range) => (
                      <button
                        key={range}
                        onClick={() => setInboxFilters((prev) => ({ ...prev, period: range }))}
                        className={cn(
                          "h-7 rounded-full border px-3 text-[11px] font-medium",
                          inboxFilters.period === range
                            ? "border-brand bg-brand text-white"
                            : "border-border bg-card text-muted-foreground hover:bg-hover",
                        )}
                      >
                        {range}
                      </button>
                    ))}
                    <button
                      onClick={() => setFiltersOpen((prev) => !prev)}
                      className={cn(
                        "ml-auto rounded-lg border px-3 py-1.5 text-[12px] font-medium",
                        "border-border bg-card text-dim hover:bg-hover",
                      )}
                    >
                      {showFiltersCount ? `Filtros (${advancedFiltersCount})` : "Filtros"}
                    </button>
                  </div>

                  <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-[12px]">
                    <p className={cn("text-muted-foreground")}>
                      {inboxRows.length} atualizações · ordenado por {orderLabel}
                    </p>
                    <p className={cn("text-muted-foreground")}>Última leitura sincronizada {refreshLabel}</p>
                  </div>

                  {refreshError && <p className="mt-2 text-[12px] font-medium text-danger-text">{refreshError}</p>}

                  {filtersOpen && (
                    <div className={cn("mt-3 space-y-2 rounded-lg border p-3", "border-border bg-muted")}>
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-[12px] font-medium text-slate-500">Severidade</p>
                        {allStatuses.map((status) => (
                          <button
                            key={status}
                            onClick={() => setInboxFilters((prev) => ({ ...prev, severities: toggleInArray(prev.severities, status) }))}
                            className={cn(
                              "h-7 rounded-full border px-3 text-[11px] font-medium",
                              activeSeverities.includes(status)
                                ? "border-brand bg-brand-surface text-brand-text"
                                : "border-border bg-card text-muted-foreground hover:bg-hover",
                            )}
                          >
                            {status}
                          </button>
                        ))}
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-[12px] font-medium text-slate-500">Pilar</p>
                        {allPillars.map((pillar) => (
                          <button
                            key={pillar}
                            onClick={() => setInboxFilters((prev) => ({ ...prev, pillars: toggleInArray(prev.pillars, pillar) }))}
                            className={cn(
                              "h-7 rounded-full border px-3 text-[11px] font-medium",
                              activePillars.includes(pillar)
                                ? "border-brand bg-brand-surface text-brand-text"
                                : "border-border bg-card text-muted-foreground hover:bg-hover",
                            )}
                          >
                            {pillar}
                          </button>
                        ))}
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-[12px] font-medium text-slate-500">Fonte</p>
                        {allSources.map((source) => (
                          <button
                            key={source}
                            onClick={() => setInboxFilters((prev) => ({ ...prev, sources: toggleInArray(prev.sources, source) }))}
                            className={cn(
                              "h-7 rounded-full border px-3 text-[11px] font-medium",
                              activeSources.includes(source)
                                ? "border-brand bg-brand-surface text-brand-text"
                                : "border-border bg-card text-muted-foreground hover:bg-hover",
                            )}
                          >
                            {source}
                          </button>
                        ))}
                      </div>

                      <div className="flex justify-end">
                        <button onClick={clearInboxFilters} className="text-[12px] font-semibold text-mint-600 hover:text-mint-700">
                          Limpar
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </CardHeader>

              <CardContent className="space-y-2 px-4 pb-4">
                {hasAnyFilterOverride && (
                  <div className={cn("rounded-xl border px-3 py-2", "border-border bg-muted")}>
                    <div className="flex flex-wrap items-center gap-2">
                      {activeFilterChips.map((chip) => (
                        <span key={chip} className={cn("inline-flex h-[22px] items-center rounded-full border px-2 text-[11px]", "border-border bg-card text-dim")}>
                          {chip}
                        </span>
                      ))}
                      <button onClick={clearInboxFilters} className="ml-auto text-[12px] font-semibold text-mint-600 hover:text-mint-700">
                        Limpar filtros
                      </button>
                    </div>
                  </div>
                )}

                {isRefreshing ? (
                  <div className="space-y-2">
                    {[1, 2, 3, 4].map((item) => (
                      <div key={item} className="h-16 animate-pulse rounded-xl border border-slate-200 bg-slate-50" />
                    ))}
                  </div>
                ) : inboxError ? (
                  <div className="rounded-xl border border-danger-border bg-danger-surface px-3 py-4">
                    <p className="text-[14px] font-medium text-danger-text">Não foi possível carregar atualizações.</p>
                    <button onClick={refreshInboxNow} className="mt-2 text-[12px] font-medium text-danger-text underline">
                      Tentar novamente
                    </button>
                  </div>
                ) : inboxRows.length === 0 ? (
                  <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-4">
                    <p className="text-[14px] text-slate-500">Nenhuma atualização relevante no período.</p>
                    <button
                      onClick={() => setInboxFilters((prev) => ({ ...prev, period: "7d" }))}
                      className="mt-2 text-[12px] font-medium text-mint-600 hover:text-mint-700"
                    >
                      Ampliar para 7 dias
                    </button>
                  </div>
                ) : (
                  <>
                    {inboxMode === "top-impacto" && priorityItem && (
                      <div className={cn("rounded-xl border px-3 py-2", "border-brand-border bg-brand-surface")}>
                        <p className={cn("text-[12px] font-semibold", "text-brand-text")}>
                          Comece por aqui: {priorityItem.ticker}
                          {priorityItem.pillarKey ? ` em ${priorityItem.pillarKey}` : ""}
                        </p>
                      </div>
                    )}
                    {inboxRows.map((item, index) => {
                      const isNew = (newBadgeUntil[item.id] ?? 0) > Date.now();
                      const isPriority = index === 0 && inboxMode === "top-impacto";
                      const sectionLabel = feedSectionLabel(item, index);
                      const isStablePositive = sectionLabel === "Estaveis e positivos";
                      return (
                        <button
                          key={item.id}
                        onClick={() => openInboxItem(item)}
                        className={cn(
                          "w-full cursor-default rounded-xl border border-transparent text-left transition hover:border-border-strong hover:bg-hover hover:shadow-[inset_3px_0_0_var(--brand)]",
                          isStablePositive ? "p-1.5" : "p-3",
                          isNew && (isDarkMode ? "border-blue-700 bg-muted" : "border-blue-200 bg-blue-50"),
                          isPriority && ("border-brand-border bg-brand-surface hover:bg-brand-surface hover:border-brand/60"),
                        )}
                      >
                        <div className={cn("flex items-start justify-between", isStablePositive ? "gap-1" : "gap-3")}>
                            <div className={cn("flex min-w-0 flex-1 items-start", isStablePositive ? "gap-1.5" : "gap-2.5")}>
                              <Avatar className={cn("rounded-md", isStablePositive ? "h-6 w-6" : "h-8 w-8")}>
                                <AvatarImage src={logoByTicker[item.ticker]} alt={item.ticker} className="object-cover" />
                                <AvatarFallback className="rounded-md text-[10px]">{item.ticker.slice(0, 2)}</AvatarFallback>
                              </Avatar>
                              <div className="min-w-0">
                                {isPriority && (
                                  <span className={cn("mb-1 inline-flex h-[22px] items-center rounded-full border px-2 text-[10px] font-semibold uppercase tracking-[0.04em]", "border-brand-border bg-brand-surface text-brand-text")}>
                                    Comece por aqui
                                  </span>
                                )}
                                {!isPriority && !isStablePositive && (
                                  <span className={cn("mb-1 inline-flex h-[20px] items-center rounded-full border px-2 text-[10px] font-semibold uppercase tracking-[0.04em]", "border-border bg-muted text-dim")}>
                                    {sectionLabel}
                                  </span>
                                )}
                                <p className={cn("truncate font-semibold", isStablePositive ? "text-[12px]" : "text-[13px]", "text-dim")}>
                                  {isStablePositive ? item.ticker : `${item.ticker} · ${item.companyName}`}
                                </p>
                                <p className={cn(isStablePositive ? "text-[12px]" : "text-[14px]", "truncate font-semibold", "text-foreground")}>{item.title}</p>
                                {!isStablePositive && (
                                  <p className={cn("mt-1 line-clamp-1 text-[12px]", "text-muted-foreground")}>Por que isso importa: {item.whyItMatters}</p>
                                )}
                                <div className={cn("flex flex-wrap gap-1", isStablePositive ? "mt-0" : "mt-1")}>
                                  {item.pillarKey && (
                                    <span className={cn("inline-flex h-[22px] items-center rounded-full border px-2 text-[11px]", "border-border bg-muted text-dim")}>
                                      {item.pillarKey}
                                    </span>
                                  )}
                                  {item.source && (
                                    <span className={cn("inline-flex h-[22px] items-center rounded-full border px-2 text-[11px]", "border-border bg-muted text-dim")}>
                                      {item.source}
                                    </span>
                                  )}
                                  <span className={cn("inline-flex h-[22px] items-center rounded-full border px-2 text-[11px]", "border-border bg-muted text-dim")}>
                                    {item.relativeTime}
                                  </span>
                                  {isNew && <span className="inline-flex h-[22px] items-center rounded-full border border-sky-300 bg-sky-100 px-2 text-[11px] font-semibold text-sky-900">Novo</span>}
                                </div>
                              </div>
                            </div>

                            <div className="flex shrink-0 flex-col items-end gap-1.5">
                              {!isStablePositive && <StatusBadge status={item.severity} />}
                              <div className="flex items-center gap-1.5">
                                <span className={cn("font-semibold text-mint-600", isStablePositive ? "text-[11px]" : "text-[12px]")}>{feedCtaLabel(item, isPriority)}</span>
                                <ChevronRight className={cn("h-4 w-4", "text-muted-foreground")} />
                              </div>
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </>
                )}
              </CardContent>
            </Card>

          </section>

          <section className="grid items-start gap-4 xl:grid-cols-[minmax(0,1.6fr)_minmax(300px,0.8fr)]">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className={cn("text-[14px] font-semibold", "text-dim")}>Blocos de apoio</h2>
                <p className={cn("text-[12px]", "text-muted-foreground")}>Apoiam a leitura, mas nao substituem o fluxo principal.</p>
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                {supportCards.map((card) => (
                  <button
                    key={card.title}
                    onClick={card.action}
                    className={cn(
                      "group rounded-2xl border p-3 text-left transition-all duration-150",
                      isDarkMode
                        ? "border-border bg-muted hover:border-border-strong hover:shadow-[0_2px_10px_rgba(0,0,0,0.25)]"
                        : "border-border bg-card hover:border-border-strong hover:shadow-[0_2px_10px_rgba(16,24,40,0.05)]",
                    )}
                  >
                    <p className="mb-2 text-[11px] font-medium text-muted-foreground">{card.title}</p>
                    <div className="flex min-h-[36px] items-center gap-2">
                      {card.logoTicker && logoByTicker[card.logoTicker] ? (
                        <Avatar className="h-7 w-7 rounded-md">
                          <AvatarImage src={logoByTicker[card.logoTicker]} alt={card.logoTicker} className="object-cover" />
                          <AvatarFallback className="rounded-md text-[10px]">{card.logoTicker.slice(0, 2)}</AvatarFallback>
                        </Avatar>
                      ) : null}
                      <p className={cn("text-[16px] font-semibold", "text-foreground")}>{card.value}</p>
                    </div>
                    <p className={cn("mt-1.5 line-clamp-2 min-h-[34px] text-[12px] leading-snug", "text-dim")}>{card.subtitle}</p>
                    <p className={cn("mt-2.5 rounded-lg border px-2.5 py-1.5 text-[11px] font-medium", card.accent)}>{card.delta}</p>
                    <div className="mt-2.5 flex items-center justify-between">
                      <span className="text-[12px] font-semibold text-mint-600">{card.ctaLabel}</span>
                      <ChevronRight className={cn("h-4 w-4", "text-muted-foreground")} />
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <Card className={cn("rounded-2xl border", "border-border bg-card")}>
              <CardHeader className="space-y-1 px-4 pt-4">
                <CardTitle className={cn("text-[14px] font-semibold", "text-foreground")}>Pilares em movimento</CardTitle>
                <CardDescription className={cn("text-[12px]", "text-muted-foreground")}>
                  Apoio de leitura. Use depois da prioridade e do feed principal.
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-1 px-4 pb-3">
                {isRefreshing ? (
                  <div className="space-y-2">
                    {[1, 2].map((item) => (
                      <div key={item} className="h-12 animate-pulse rounded-xl border border-slate-200 bg-slate-50" />
                    ))}
                  </div>
                ) : (
                  visiblePillarMovements.map((item, idx) => (
                    <button
                      key={item.pillar}
                      onClick={() => applySinglePillarFilter(item.pillar)}
                      className={cn(
                        "w-full rounded-xl border border-transparent p-2 text-left transition",
                        "hover:border-border hover:bg-hover",
                        idx > 0 && "border-t border-t-[#F2F4F7]",
                      )}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="min-w-0">
                          <p className={cn("text-[13px] font-medium", "text-foreground")}>{item.pillar}</p>
                          <p className={cn("mt-0.5 text-[11px]", "text-muted-foreground")}>{item.pillar} {pillarInsight[item.pillar]}.</p>
                          <div className="mt-1.5">
                            <SegmentedHealthBar healthy={item.healthy} attention={item.attention} risk={item.risk} />
                            <div className="mt-1 flex flex-wrap items-center gap-3 text-[10px]">
                              <span className={cn("text-muted-foreground")}>{item.events} eventos</span>
                              <span className="text-rose-600">Risco {item.risk}</span>
                              <span className="text-amber-600">Atenção {item.attention}</span>
                              <span className="text-emerald-600">Saudável {item.healthy}</span>
                            </div>
                          </div>
                        </div>
                        <ChevronRight className={cn("h-4 w-4", "text-muted-foreground")} />
                      </div>
                    </button>
                  ))
                )}
              </CardContent>

              <CardFooter className={cn("flex items-center justify-between border-t px-4 py-3", "border-border")}>
                <p className={cn("text-[11px]", "text-muted-foreground")}>Fontes: CVM / B3 / RI</p>
                <button onClick={() => applySinglePillarFilter(focusedPillar)} className="text-[12px] font-semibold text-mint-600 hover:text-mint-700">
                  Filtrar pilar
                </button>
              </CardFooter>
            </Card>
          </section>

          {showSessionClosing && (
            <section>
              <Card className={cn("rounded-2xl border", "border-border bg-card")}>
                <CardContent className="space-y-2 p-4">
                  <p className={cn("text-[12px] font-semibold uppercase tracking-[0.08em]", "text-brand-text")}>Fechamento da sessao</p>
                  <p className={cn("text-[14px] font-semibold", "text-foreground")}>
                    {priorityItem
                      ? `Nas proximas horas, acompanhe ${priorityItem.ticker} e os sinais em ${leadingPillarMovement.pillar} para confirmar se a pressao persiste.`
                      : `O pilar ${leadingPillarMovement.pillar} segue como principal frente de monitoramento nas proximas horas.`}
                  </p>
                  <p className={cn("text-[12px]", "text-muted-foreground")}>Reveja o feed por impacto antes de encerrar sua leitura.</p>
                </CardContent>
              </Card>
            </section>
          )}
        </main>
      </div>
    </div>
  );
}

export default Dashboard;






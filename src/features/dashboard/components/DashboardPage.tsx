"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import {
  ChevronRight,
  Check,
  Database,
  LayoutGrid,
  GitCompare,
  RotateCcw,
  Search,
} from "lucide-react";
import { Sidebar } from "@/src/components/layout/Sidebar";
import { AppTopBar } from "@/src/components/layout/AppTopBar";
import { MainContent } from "@/src/components/layout/MainContent";
import { Avatar, AvatarFallback, AvatarImage } from "@/src/components/ui/avatar";
import { cn } from "@/src/components/ui/utils";
import { useDashboardInbox, allPillars, allSources, allStatuses } from "../hooks/useDashboardInbox";
import { useDashboardPrefetch } from "../hooks/useDashboardPrefetch";
import type { InboxItem, Pillar, Status, WindowRange } from "../interfaces";
import { statusBadgeClasses, SURFACE_BASE, SURFACE_MEDIUM } from "../mappers/dashboard.mapper";
import { DashboardCanvas } from "@/src/features/dashboard-canvas/components/DashboardCanvas";

import logoItau from "@/src/assets/logos/itau.png";
import logoMrv from "@/src/assets/logos/mrv.jpg";
import logoRenner from "@/src/assets/logos/renner.png";
import logoTaesa from "@/src/assets/logos/taesa.png";
import logoVale from "@/src/assets/logos/vale.png";
import logoWeg from "@/src/assets/logos/weg.jpeg";

const logoByTicker: Record<string, string> = {
  VALE3: logoVale.src,
  LREN3: logoRenner.src,
  ITUB4: logoItau.src,
  MRVE3: logoMrv.src,
  TAEE11: logoTaesa.src,
  WEGE3: logoWeg.src,
};

const surfaceBase = SURFACE_BASE;
const mediumSurface = SURFACE_MEDIUM;
const statusClasses = statusBadgeClasses;

function pluralize(value: number, singular: string, plural: string) {
  return `${value} ${value === 1 ? singular : plural}`;
}

function StatusBadge({ status }: { status: Status }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-semibold tracking-[-0.01em]",
        statusClasses[status],
      )}
    >
      {status}
    </span>
  );
}

function SegmentedHealthBar({
  healthy,
  attention,
  risk,
}: {
  healthy: number;
  attention: number;
  risk: number;
}) {
  const total = Math.max(healthy + attention + risk, 1);

  return (
    <div className="h-2.5 w-full overflow-hidden rounded-full bg-muted">
      <div className="h-full bg-emerald-500" style={{ width: `${(healthy / total) * 100}%`, float: "left" }} />
      <div className="h-full bg-amber-400" style={{ width: `${(attention / total) * 100}%`, float: "left" }} />
      <div className="h-full bg-rose-400" style={{ width: `${(risk / total) * 100}%`, float: "left" }} />
    </div>
  );
}

type SummaryTone = "balanced" | "positive" | "pressure";

function getSummaryTone({
  riskCount,
  attentionCount,
  healthyCount,
}: {
  riskCount: number;
  attentionCount: number;
  healthyCount: number;
}): SummaryTone {
  const negativeScore = riskCount * 2 + attentionCount;
  const positiveScore = healthyCount * 1.5;

  if (negativeScore >= positiveScore + 2) return "pressure";
  if (positiveScore >= negativeScore + 2) return "positive";
  return "balanced";
}

const summaryToneStyles: Record<
  SummaryTone,
  {
    shell: string;
    glow: string;
    pill: string;
  }
> = {
  balanced: {
    shell: "from-muted via-card to-card",
    glow: "bg-[radial-gradient(circle_at_top_left,rgba(91,141,239,0.22),transparent_58%)]",
    pill: "bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-400",
  },
  positive: {
    shell: "from-brand-surface/30 via-card to-card",
    glow: "bg-[radial-gradient(circle_at_top_left,rgba(18,165,148,0.20),transparent_58%)]",
    pill: "bg-brand-surface text-brand",
  },
  pressure: {
    shell: "from-danger-surface via-card to-card",
    glow: "bg-[radial-gradient(circle_at_top_left,rgba(214,85,121,0.16),transparent_56%)]",
    pill: "bg-danger-surface text-danger-text",
  },
};

export function Dashboard() {
  const router = useRouter();
  const inbox = useDashboardInbox();
  // Dispara em paralelo TODAS as chamadas de rede que as ilhas vão precisar
  // (notícias, explore, performance, read-news). A loading screen abaixo
  // espera POR ISSO antes de transitar pro dashboard — assim quando o
  // usuário vê o painel, os dados já estão prontos (sem skeletons piscando
  // ilha por ilha enquanto entram em viewport).
  const { prefetched } = useDashboardPrefetch();
  const {
    dashboardData,
    dashboardLoading,
    dashboardError,
    inboxFilters,
    inboxMode,
    filtersOpen,
    isRefreshing,
    refreshError,
    inboxError,
    newBadgeUntil,
    viewedInboxItemIds,
    inboxRows,
    todayItems,
    priorityItem,
    todayRiskCount,
    todayAttentionCount,
    todayHealthyCount,
    topRiskItem,
    topImproveItem,
    focusedPillar,
    leadingPillarMovement,
    visiblePillarMovements,
    pillarMovements: pillarMovementsData,
    hasAnyFilterOverride,
    showFiltersCount,
    advancedFiltersCount,
    healthyWatchlistCount,
    totalWatchlistCount,
    activeSeverities,
    activePillars,
    activeSources,
    hasSeverityFilter,
    hasPillarFilter,
    hasSourceFilter,
    hasPeriodFilter,
    refreshLabel,
    renderedLabel,
    setInboxFilters,
    setFiltersOpen,
    toggleFilterSeverity,
    toggleFilterPillar,
    toggleFilterSource,
    refreshInboxNow,
    openInboxItem,
    applySinglePillarFilter,
    focusInboxRecentImpact,
    setImpactMode,
    setRealTimeMode,
    clearInboxFilters,
    inboxRef,
  } = inbox;

  // ─── Animação de pipeline ────────────────────────────────────────────────────
  const [animStep,     setAnimStep]     = useState(0);
  const [animDone,     setAnimDone]     = useState(false);
  const [dataResolved, setDataResolved] = useState(false);

  // Marca quando TUDO respondeu: tanto a API principal do dashboard
  // quanto o prefetch das ilhas em paralelo. Só transitamos da loading
  // screen pro dashboard quando ambos terminam.
  useEffect(() => {
    if (!dashboardLoading && prefetched) setDataResolved(true);
  }, [dashboardLoading, prefetched]);

  // Avança os passos: 1400ms durante loading, 350ms após dados chegarem,
  // 150ms se não houver dados (fast-forward para o estado vazio)
  useEffect(() => {
    if (animDone) return;
    const delay = !dataResolved ? 1400 : dashboardData ? 350 : 150;
    const timer = setTimeout(() => {
      if (animStep >= 2) {
        setAnimDone(true);
      } else {
        setAnimStep((s) => s + 1);
      }
    }, delay);
    return () => clearTimeout(timer);
  }, [animStep, animDone, dataResolved, dashboardData]);

  const stepLabels   = ["Carregando Watchlist", "Fazendo Análise", "Montando Painel"];
  const stepSubtitles = [
    "Carregando sua watchlist...",
    "Processando análises das ações...",
    "Montando seu painel...",
  ];

  const isProcessing = !animDone;
  const isEmpty      = animDone && !dashboardData;

  const [isRetrySpin, setIsRetrySpin] = useState(false);

  const pillarMovements = pillarMovementsData;
  const secondPillarMovement = [...pillarMovements].sort((a, b) => b.events - a.events)[1];

  const pillarInsight: Record<Pillar, string> = {
    D\u00edvida: "concentrou mais sinais de press\u00e3o hoje",
    Margens: "teve volume alto de mudan\u00e7as com vi\u00e9s de aten\u00e7\u00e3o",
    Caixa: "perdeu for\u00e7a em parte da watchlist",
    Proventos: "seguiu mais est\u00e1vel, com poucos sinais de risco",
    Retorno: "ficou mais est\u00e1vel e com baixa dispers\u00e3o",
  };

  const feedSectionLabel = (item: InboxItem, index: number) => {
    if (index === 0) return "Prioridade do dia";
    if (item.severity === "Risco" || item.severity === "Aten\u00e7\u00e3o" || item.eventType === "evento_futuro") {
      return "Acompanhamento relevante";
    }
    return "Est\u00e1veis e positivos";
  };

  const feedCtaLabel = (item: InboxItem, isPriority: boolean) =>
    item.ctaLabel ??
    (isPriority
      ? "Abrir prioridade"
      : item.eventType === "evento_futuro"
        ? "Entender impacto"
        : item.severity === "Risco" || item.severity === "Aten\u00e7\u00e3o"
          ? "Ler an\u00e1lise"
          : "Ver contexto");

  const hasDominantPillar = leadingPillarMovement.events - (secondPillarMovement?.events ?? 0) >= 3;
  const hasClearPriority = Boolean(priorityItem && priorityItem.impactScore >= 85);
  const hasNearTermFollowUp = todayItems.some((item) => item.eventType === "evento_futuro");
  const showSessionClosing = hasClearPriority || hasDominantPillar || hasNearTermFollowUp;
  const followUpItem = inboxRows.find((item, index) => feedSectionLabel(item, index) === "Acompanhamento relevante");
  const stableItem = inboxRows.find((item, index) => feedSectionLabel(item, index) === "Est\u00e1veis e positivos");
  const progressStates = [
    { label: "Prioridade do dia", done: priorityItem ? viewedInboxItemIds.includes(priorityItem.id) : true },
    { label: "Acompanhamentos", done: followUpItem ? viewedInboxItemIds.includes(followUpItem.id) : false },
    { label: "Itens est\u00e1veis", done: stableItem ? viewedInboxItemIds.includes(stableItem.id) : false },
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

  const summaryTone = getSummaryTone({
    riskCount: todayRiskCount,
    attentionCount: todayAttentionCount,
    healthyCount: todayHealthyCount,
  });
  const summaryToneStyle = summaryToneStyles[summaryTone];

  const editorialText = priorityItem
    ? `${priorityItem.ticker} abre sua sess\u00e3o hoje. Depois disso, siga para ${leadingPillarMovement.pillar.toLowerCase()} para confirmar se a press\u00e3o ficou concentrada ou j\u00e1 se espalhou.`
    : `${leadingPillarMovement.pillar} re\u00fane o principal contexto do dia. Comece pelo feed e use os blocos laterais para confirmar o diagn\u00f3stico.`;

  return (
    <div
      className="min-h-screen bg-background text-foreground"
      data-day-template={dashboardData?.dayTemplate ?? "fallback"}
      data-manifest-version={dashboardData?.manifestVersion ?? "fallback"}
    >
      <Sidebar currentPage="dashboard" />
      <AppTopBar sidebarOffsetClassName="left-0 xl:left-[240px]" />

      <MainContent className="px-5 pb-8 pt-20 xl:px-7 xl:pt-20">
<div className="mx-auto max-w-[1480px] space-y-5">
          {(isProcessing || isEmpty) && (
          <section>
            <article
              className={cn(
                "rounded-[24px] border border-border bg-card shadow-[0_14px_30px_rgba(15,23,40,0.04)] dark:shadow-none",
                "relative min-h-[196px] overflow-hidden bg-card",
              )}
            >
              <div className="absolute inset-x-0 top-0 h-[44px] rounded-t-[24px] bg-brand-surface dark:bg-brand-surface" />
              {!isProcessing && !isEmpty && (
                <span className="absolute left-6 top-4 text-sm font-medium leading-5 text-brand">Resumo do dia</span>
              )}

              <div className={cn(
                "relative grid h-full gap-6 px-6 pb-5 pt-[60px] xl:items-end",
                (isProcessing || isEmpty) ? "" : "xl:grid-cols-[minmax(0,1.6fr)_auto]",
              )}>
                <div>
                  {isProcessing ? (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <h1 className="text-[24px] font-semibold leading-[1.12] tracking-[-0.03em] text-foreground">
                          Preparando seu painel
                        </h1>
                        <p className="max-w-[40ch] text-[14px] leading-6 text-muted-foreground">
                          {stepSubtitles[animStep]}
                        </p>
                      </div>

                      {/* Pipeline de passos */}
                      <div className="flex items-start pt-1">
                        {stepLabels.map((label, i) => {
                          const isCompleted   = i < animStep;
                          const isActive      = i === animStep;
                          const isPending     = i > animStep;
                          const connectorDone = i > 0 && i - 1 < animStep;
                          const connectorAnim = i > 0 && i - 1 === animStep;
                          return (
                            <div key={label} className="flex items-start">
                              {i > 0 && (
                                <div className="relative mx-2 mt-[7px] h-px w-12 overflow-hidden rounded-full bg-border">
                                  {connectorDone && (
                                    <div className="absolute inset-0 rounded-full bg-brand" />
                                  )}
                                  {connectorAnim && (
                                    <div
                                      key={`conn-${animStep}`}
                                      className="absolute inset-y-0 left-0 rounded-full bg-brand"
                                      style={{ animation: "connector-fill 1400ms linear forwards" }}
                                    />
                                  )}
                                </div>
                              )}
                              <div className="flex flex-col items-center gap-1.5">
                                <div className={cn(
                                  "flex h-5 w-5 items-center justify-center rounded-full transition-all duration-500",
                                  isCompleted ? "bg-brand/10"
                                  : isActive   ? "animate-pulse bg-brand/10"
                                             : "bg-muted",
                                )}>
                                  {isCompleted && (
                                    <Check size={11} className="text-brand" strokeWidth={3} />
                                  )}
                                  {isActive && (
                                    <div
                                      className="h-3 w-3 rounded-full border-2"
                                      style={{
                                        borderColor: "color-mix(in srgb, var(--brand) 25%, transparent)",
                                        borderTopColor: "var(--brand)",
                                        animation: "step-spin 700ms linear infinite",
                                      }}
                                    />
                                  )}
                                  {isPending && (
                                    <div className="h-2 w-2 rounded-full border border-border" />
                                  )}
                                </div>
                                <span className={cn(
                                  "whitespace-nowrap text-[11px] transition-colors duration-500",
                                  isCompleted || isActive
                                    ? "font-semibold text-brand"
                                    : "font-normal text-muted-foreground",
                                )}>
                                  {label}
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Barra de progresso */}
                      <div className="h-0.5 w-full overflow-hidden rounded-full bg-brand/10">
                        <div
                          className="h-full rounded-full bg-brand transition-[width] duration-[600ms] ease-[cubic-bezier(0.4,0,0.2,1)]"
                          style={{ width: `${((animStep + 1) / 3) * 100}%` }}
                        />
                      </div>
                    </div>
                  ) : isEmpty ? (
                    <div className="space-y-2">
                      <h1 className="text-[24px] font-semibold leading-[1.12] tracking-[-0.03em] text-foreground">
                        Seu painel está esperando por você
                      </h1>
                      <p className="max-w-[44ch] text-[14px] leading-6 text-muted-foreground">
                        Adicione ações à sua watchlist e comece a acompanhar o que importa para você.
                      </p>
                      <div className="flex items-center gap-3 pt-3">
                        <button
                          onClick={() => { setIsRetrySpin(true); refreshInboxNow(); }}
                          className="inline-flex h-9 items-center gap-2 rounded-[12px] border border-border bg-card px-4 text-[12px] font-medium text-foreground shadow-[0_2px_6px_rgba(15,23,40,0.04)] transition active:scale-[0.97] hover:border-brand/40 hover:text-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring dark:shadow-none"
                        >
                          <RotateCcw
                            size={14}
                            style={isRetrySpin ? { animation: 'spin-once 600ms ease-out forwards' } : undefined}
                            onAnimationEnd={() => setIsRetrySpin(false)}
                          />
                          Recarregar dados
                        </button>
                        <span className="text-[11px] text-muted-foreground">Atualizado {renderedLabel}</span>
                      </div>
                    </div>
                  ) : null}
                </div>
              </div>
            </article>
          </section>
          )}

          {!isProcessing && !isEmpty && <DashboardCanvas inbox={inbox} />}

          {isEmpty ? (
            /* ── Empty state — 4 action cards ───────────────────────────── */
            <section className="animate-[dashboard-fade-in_0.5s_ease-out]">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                {([
                  {
                    icon: LayoutGrid,
                    title: "Adicionar à Watchlist",
                    desc: "Monitore as empresas que importam para você",
                    cta: "Ir para Watchlist",
                    href: "/watchlist",
                  },
                  {
                    icon: GitCompare,
                    title: "Criar uma comparação",
                    desc: "Compare empresas lado a lado",
                    cta: "Comparar",
                    href: "/comparar",
                  },
                  {
                    icon: Search,
                    title: "Buscar ações",
                    desc: "Descubra empresas e oportunidades",
                    cta: "Buscar",
                    href: "/buscar",
                  },
                ] as const).map(({ icon: Icon, title, desc, cta, href }) => (
                  <button
                    key={title}
                    onClick={() => router.push(href)}
                    className="dash-empty-card text-left"
                  >
                    <div className="dash-empty-scan-line" />
                    <div className="dash-empty-icon-wrap">
                      <Icon className="h-4 w-4 text-brand" />
                    </div>
                    <p className="mb-1 text-[14px] font-semibold leading-[1.3] text-foreground">{title}</p>
                    <p className="mb-4 text-[13px] leading-5 text-muted-foreground">{desc}</p>
                    <div className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-brand">
                      {cta}
                      <ChevronRight className="h-3.5 w-3.5" />
                    </div>
                  </button>
                ))}
              </div>
            </section>
          ) : isProcessing ? (
            <section className="grid grid-cols-1 gap-5 xl:grid-cols-12">
              <div className="col-span-1 grid gap-5 xl:col-span-5">
                {/* Skeleton: Maior atenção */}
                <div className="relative min-h-[164px] overflow-hidden rounded-[20px] border border-border bg-card px-5 py-5">
                  <div className="absolute inset-x-0 top-0 h-[46px] rounded-t-[20px] bg-muted" />
                  <div className="mt-9 space-y-3">
                    <div className="h-5 w-20 animate-pulse rounded-full bg-muted" />
                    <div className="h-4 w-3/4 animate-pulse rounded-full bg-muted" />
                    <div className="h-3 w-1/2 animate-pulse rounded-full bg-muted" />
                  </div>
                </div>
                {/* Skeleton: Maior melhora */}
                <div className="relative min-h-[164px] overflow-hidden rounded-[20px] border border-border bg-card px-5 py-5">
                  <div className="absolute inset-x-0 top-0 h-[46px] rounded-t-[20px] bg-muted" />
                  <div className="mt-9 space-y-3">
                    <div className="h-5 w-24 animate-pulse rounded-full bg-muted" />
                    <div className="h-4 w-2/3 animate-pulse rounded-full bg-muted" />
                    <div className="h-3 w-1/2 animate-pulse rounded-full bg-muted" />
                  </div>
                </div>
              </div>
              {/* Skeleton: Prioridade do dia */}
              <div className={cn(surfaceBase, "col-span-1 min-h-[224px] bg-card p-5 xl:col-span-7")}>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="h-3 w-24 animate-pulse rounded-full bg-muted" />
                    <div className="h-6 w-3/4 animate-pulse rounded-full bg-muted" />
                    <div className="h-6 w-1/2 animate-pulse rounded-full bg-muted" />
                  </div>
                  <div className="space-y-2">
                    <div className="h-4 w-full animate-pulse rounded-full bg-muted" />
                    <div className="h-4 w-5/6 animate-pulse rounded-full bg-muted" />
                  </div>
                  <div className="h-20 animate-pulse rounded-[18px] bg-muted" />
                </div>
              </div>
            </section>
          ) : null}
        </div>
      </MainContent>
    </div>
  );
}

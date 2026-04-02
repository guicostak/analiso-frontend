"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import {
  ChevronRight,
  Check,
  Database,
  LayoutGrid,
  GitCompare,
  Compass,
  RotateCcw,
} from "lucide-react";
import { Sidebar } from "@/src/components/layout/Sidebar";
import { AppTopBar } from "@/src/components/layout/AppTopBar";
import { MainContent } from "@/src/components/layout/MainContent";
import { Avatar, AvatarFallback, AvatarImage } from "@/src/components/ui/avatar";
import { Button } from "@/src/components/ui/button";
import { cn } from "@/src/components/ui/utils";
import { useDashboardInbox, allPillars, allSources, allStatuses } from "../hooks/useDashboardInbox";
import { useSubscription } from "@/src/features/assinatura/hooks/SubscriptionContext";
import { GoogleAdBanner } from "@/src/components/ads/GoogleAdBanner";
import type { InboxItem, Pillar, Status, WindowRange } from "../interfaces";
import { statusBadgeClasses, SURFACE_BASE, SURFACE_MEDIUM } from "../mappers/dashboard.mapper";

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
  const { planSlug } = useSubscription();
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
  } = useDashboardInbox();

  // ─── Animação de pipeline ────────────────────────────────────────────────────
  const [animStep,     setAnimStep]     = useState(0);
  const [animDone,     setAnimDone]     = useState(false);
  const [dataResolved, setDataResolved] = useState(false);

  // Marca quando a API respondeu (com ou sem dados)
  useEffect(() => {
    if (!dashboardLoading) setDataResolved(true);
  }, [dashboardLoading]);

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

  const stepLabels   = ["Carregando Favoritas", "Fazendo Análise", "Montando Painel"];
  const stepSubtitles = [
    "Carregando suas ações favoritas...",
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

  const heroHeadline =
    dashboardData?.summary.headline ??
    (todayRiskCount > 0 || todayAttentionCount > 0
      ? `Hoje sua watchlist teve ${pluralize(todayRiskCount, "mudan\u00e7a de risco", "mudan\u00e7as de risco")} e ${pluralize(todayHealthyCount, "melhora importante", "melhoras importantes")}.`
      : "Sua watchlist est\u00e1 est\u00e1vel hoje, sem pioras cr\u00edticas novas.");

  const heroBody =
    dashboardData?.summary.body ??
    dashboardData?.nextStep.headline ??
    (priorityItem
      ? `Comece por ${priorityItem.ticker} e valide o impacto antes de revisar os acompanhamentos relevantes.`
      : "Revise primeiro os itens de maior impacto para confirmar se o contexto da watchlist segue est\u00e1vel.");

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
        {planSlug === "free" && (
          <div className="mx-auto mb-4 max-w-[1480px]">
            <GoogleAdBanner
              slot="5384268434"
              format="horizontal"
              className="min-h-[90px] w-full overflow-hidden rounded-xl border border-border bg-card"
            />
          </div>
        )}
        <div className="mx-auto max-w-[1480px] space-y-5">
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
                        Adicione suas ações favoritas e comece a acompanhar o que importa para você.
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
                  ) : (
                    <div className="animate-[dashboard-fade-in_0.4s_ease-out] space-y-3">
                      <h1 className="max-w-[32ch] text-[25px] font-semibold leading-[1.08] tracking-[-0.04em] text-foreground">
                        {heroHeadline}
                      </h1>
                      <p className="max-w-[96ch] text-[14px] leading-6 text-dim">{heroBody}</p>
                    </div>
                  )}
                </div>

                {!isProcessing && !isEmpty && (
                  <div className="flex flex-col items-start gap-3 xl:items-end">
                    <span className="text-[12px] font-medium text-muted-foreground">
                      Referência {dashboardData?.referenceDate}
                    </span>

                    <div className="flex items-center gap-3">
                      <Button
                        onClick={focusInboxRecentImpact}
                        className="h-10 rounded-[18px] bg-brand px-4 text-[13px] font-semibold text-white shadow-[0_12px_24px_rgba(18,165,148,0.18)] dark:shadow-brand/20 hover:bg-brand-hover"
                      >
                        {dashboardData?.summary.ctaPrimary}
                      </Button>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[12px] font-medium text-muted-foreground">Atualizado {renderedLabel}</span>
                        <button
                          onClick={() => { setIsRetrySpin(true); refreshInboxNow(); }}
                          className="cursor-pointer text-muted-foreground transition-colors hover:text-brand"
                          aria-label="Atualizar"
                        >
                          <RotateCcw
                            size={14}
                            style={isRetrySpin ? { animation: 'spin-once 600ms ease-out forwards' } : undefined}
                            onAnimationEnd={() => setIsRetrySpin(false)}
                          />
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </article>
          </section>

          {isEmpty ? (
            /* ── Empty state — 4 action cards ───────────────────────────── */
            <section className="animate-[dashboard-fade-in_0.5s_ease-out]">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                {([
                  {
                    icon: LayoutGrid,
                    title: "Adicionar às Favoritas",
                    desc: "Monitore as empresas que importam para você",
                    cta: "Ir para Favoritas",
                    href: "/favoritas",
                  },
                  {
                    icon: GitCompare,
                    title: "Criar uma comparação",
                    desc: "Compare empresas lado a lado",
                    cta: "Comparar",
                    href: "/comparar",
                  },
                  {
                    icon: Compass,
                    title: "Explorar mercado",
                    desc: "Descubra empresas e oportunidades",
                    cta: "Explorar",
                    href: "/explorar",
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
          ) : (
          <section className="grid grid-cols-1 gap-5 xl:grid-cols-12">
            <div className="col-span-1 grid gap-5 xl:col-span-5">
              <button
                onClick={() => (topRiskItem ? openInboxItem(topRiskItem) : focusInboxRecentImpact())}
                className="relative flex min-h-[164px] flex-col justify-between overflow-hidden rounded-[20px] border border-danger-border bg-card px-5 py-5 text-left transition hover:shadow-[0_14px_26px_rgba(181,71,104,0.10)] dark:hover:shadow-none"
              >
                <div className="absolute inset-x-0 top-0 h-[46px] rounded-t-[20px] bg-[linear-gradient(180deg,#F7D9E2_0%,#FCECEF_100%)] dark:bg-[linear-gradient(180deg,rgba(239,68,68,0.15)_0%,transparent_100%)]" />
                <p className="absolute left-5 top-4 text-sm font-medium leading-5 text-danger-text">Maior atenção</p>
                <div className="absolute right-4 top-4 h-16 w-16 rounded-full bg-[rgba(181,71,104,0.08)] blur-2xl" />
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1 pr-2">
                    <p className="mt-9 text-[18px] font-semibold leading-[1.2] text-foreground">
                      {topRiskItem ? topRiskItem.ticker : "Sem risco novo"}
                    </p>
                  </div>
                  {topRiskItem?.extraBadge ? (
                    <span className="rounded-full bg-card/80 px-3 py-1 text-[11px] font-semibold text-danger-text">
                      {topRiskItem.extraBadge}
                    </span>
                  ) : topRiskItem ? <StatusBadge status={topRiskItem.severity} /> : null}
                </div>
                <p className="max-w-none pr-2 text-[13px] leading-5 text-muted-foreground">
                  {topRiskItem
                    ? topRiskItem.benefitNow ?? topRiskItem.whyItMatters
                    : "Nenhum sinal cr\u00edtico novo entrou na watchlist nas \u00faltimas 24h."}
                </p>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-[12px]">
                    <span className="text-muted-foreground">{topRiskItem?.entryReason ?? "Press\u00e3o concentrada no topo da leitura"}</span>
                    <span className="font-semibold text-danger-text">{topRiskItem?.priorityRank ?? todayRiskCount}</span>
                  </div>
                </div>
              </button>

              <button
                onClick={() => (topImproveItem ? openInboxItem(topImproveItem) : focusInboxRecentImpact())}
                className="relative flex min-h-[164px] flex-col justify-between overflow-hidden rounded-[20px] border border-success-border bg-card px-5 py-5 text-left transition hover:shadow-[0_14px_26px_rgba(18,165,148,0.10)] dark:hover:shadow-none"
              >
                <div className="absolute inset-x-0 top-0 h-[46px] rounded-t-[20px] bg-[linear-gradient(180deg,#D9EFE8_0%,#ECF8F4_100%)] dark:bg-[linear-gradient(180deg,rgba(16,185,129,0.15)_0%,transparent_100%)]" />
                <p className="absolute left-5 top-4 text-sm font-medium leading-5 text-brand">Maior melhora</p>
                <div className="absolute right-4 top-4 h-16 w-16 rounded-full bg-[rgba(18,165,148,0.08)] blur-2xl" />
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1 pr-2">
                    <p className="mt-9 text-[18px] font-semibold leading-[1.2] text-foreground">
                      {topImproveItem ? topImproveItem.ticker : "Sem melhora nova"}
                    </p>
                  </div>
                  {topImproveItem?.extraBadge ? (
                    <span className="rounded-full bg-card/80 px-3 py-1 text-[11px] font-semibold text-brand">
                      {topImproveItem.extraBadge}
                    </span>
                  ) : topImproveItem ? <StatusBadge status={topImproveItem.severity} /> : null}
                </div>
                <p className="max-w-none pr-2 text-[13px] leading-5 text-muted-foreground">
                  {topImproveItem
                    ? topImproveItem.benefitNow ?? topImproveItem.whyItMatters
                    : "Ainda n\u00e3o apareceu uma recupera\u00e7\u00e3o relevante suficiente para liderar a sess\u00e3o."}
                </p>
                <div className="flex items-center justify-between text-[12px]">
                  <span className="text-muted-foreground">{topImproveItem?.entryReason ?? "Recupera\u00e7\u00e3o com leitura mais limpa"}</span>
                  <span className="font-semibold text-brand">{topImproveItem?.priorityRank ?? todayHealthyCount}</span>
                </div>
              </button>
            </div>

            <article className={cn(surfaceBase, "col-span-1 min-h-[224px] bg-card p-5 xl:col-span-7")}>
              <div className="space-y-5">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-[14px] font-medium text-muted-foreground">Prioridade do dia</p>
                      <h2 className="max-w-[20ch] text-[18px] font-semibold leading-[1.3] tracking-[-0.02em] text-foreground">
                        {priorityItem
                          ? `${priorityItem.ticker} \u00e9 o melhor ponto de entrada para entender o que mudou hoje.`
                          : `O pilar ${leadingPillarMovement.pillar.toLowerCase()} concentra o melhor ponto de leitura do dia.`}
                      </h2>
                    </div>
                    <span className="rounded-full bg-brand-surface px-3 py-1 text-[11px] font-semibold text-brand">{"Sess\u00e3o guiada"}</span>
                  </div>

                  <p className="max-w-[46ch] text-[14px] leading-6 text-muted-foreground">
                    {dashboardData?.nextStep.headline ??
                      (priorityItem
                        ? `Abra ${priorityItem.ticker}, confirme o impacto no pilar ${priorityItem.pillarKey ?? leadingPillarMovement.pillar} e depois avance para os acompanhamentos relevantes.`
                        : `Use o feed principal para confirmar onde a aten\u00e7\u00e3o est\u00e1 concentrada e deixe os blocos laterais como apoio.`)}
                  </p>
                  {dashboardData?.nextStep.body ? (
                    <p className="max-w-[42ch] text-[13px] leading-5 text-muted-foreground">{dashboardData.nextStep.body}</p>
                  ) : null}

                  <div className="rounded-[18px] bg-muted p-3">
                    <div className="grid gap-3 md:grid-cols-3">
                      {progressStates.map((step, index) => {
                        const isCurrent = index === currentProgressStep;
                        return (
                          <div
                            key={step.label}
                            className={cn(
                              "rounded-[18px] p-3.5",
                              step.done
                                ? "bg-muted"
                                : isCurrent
                                  ? "bg-muted dark:bg-muted/50"
                                  : "bg-card",
                            )}
                          >
                            <div className="flex items-center gap-2">
                              <span
                                className={cn(
                                  "inline-flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-semibold",
                                  step.done
                                    ? "bg-card text-brand"
                                    : isCurrent
                                      ? "bg-card text-blue-500 dark:text-blue-400"
                                      : "bg-card text-muted-foreground",
                                )}
                              >
                                {step.done ? "OK" : index + 1}
                              </span>
                              <p className="text-[13px] font-medium text-foreground">{step.label}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
                    <button
                      onClick={focusInboxRecentImpact}
                      className="inline-flex items-center gap-2 rounded-[18px] bg-muted px-4 py-2.5 text-[13px] font-semibold text-foreground transition hover:bg-hover"
                    >
                      Abrir leitura guiada
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </button>
                    <button className="text-[13px] font-medium text-brand transition hover:text-brand">Ver fontes do dia</button>
                  </div>
              </div>
            </article>
          </section>
          )}

          {isProcessing ? (
            <div className="rounded-[20px] border border-border bg-muted dark:bg-muted/50 px-5 py-4">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div className="space-y-2">
                  <div className="h-3 w-24 animate-pulse rounded-full bg-border" />
                  <div className="h-5 w-64 animate-pulse rounded-full bg-border" />
                </div>
                <div className="h-8 w-28 animate-pulse rounded-full bg-border" />
              </div>
            </div>
          ) : !isEmpty ? (
          <section className="rounded-[20px] border border-border bg-muted dark:bg-muted/50 px-5 py-4 shadow-[0_10px_20px_rgba(91,141,239,0.05)]">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-[12px] font-medium uppercase text-blue-500 dark:text-blue-400">{"Por onde come\u00e7ar"}</p>
                <p className="mt-1 text-[15px] font-semibold leading-6 text-foreground">{editorialText}</p>
              </div>
              <button
                onClick={focusInboxRecentImpact}
                className="inline-flex items-center gap-2 self-start rounded-full bg-card px-4 py-2 text-[13px] font-semibold text-foreground transition hover:bg-hover lg:self-auto"
              >
                Ir para o feed
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </button>
            </div>
          </section>
          ) : null}

          {!isEmpty && (<><section ref={inboxRef} className="grid grid-cols-1 gap-5 xl:grid-cols-12">
            <article className={cn(surfaceBase, "col-span-1 min-h-[540px] overflow-hidden xl:col-span-7")}>
              <div className="border-b border-border px-6 py-5">
                <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                  <div className="max-w-[44ch]">
                    <p className="text-[12px] font-medium uppercase text-muted-foreground">{"Explora\u00e7\u00e3o principal"}</p>
                    <h2 className="mt-2 text-[18px] font-semibold leading-[1.3] tracking-[-0.02em] text-foreground">
                      {"Atualiza\u00e7\u00f5es da watchlist"}
                    </h2>
                    <p className="mt-2 text-[14px] leading-6 text-muted-foreground">
                      {"Triagem primeiro. Organiza\u00e7\u00e3o depois. O item principal abre a leitura e o restante ajuda a confirmar o contexto."}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <div className="inline-flex rounded-full bg-muted p-1">
                      <button
                        onClick={setImpactMode}
                        className={cn(
                          "rounded-full px-3.5 py-2 text-[12px] font-semibold transition",
                          inboxMode === "top-impacto" ? "bg-card text-foreground" : "text-muted-foreground hover:text-foreground",
                        )}
                      >
                        Top impacto
                      </button>
                      <button
                        onClick={setRealTimeMode}
                        className={cn(
                          "rounded-full px-4 py-2 text-[13px] font-semibold transition",
                          inboxMode === "tempo-real" ? "bg-card text-foreground" : "text-muted-foreground hover:text-foreground",
                        )}
                      >
                        Tempo real
                      </button>
                    </div>
                    <button
                      onClick={refreshInboxNow}
                      disabled={isRefreshing}
                      className="rounded-full bg-muted px-3.5 py-2 text-[12px] font-medium text-muted-foreground transition hover:text-foreground"
                    >
                      {isRefreshing ? "Atualizando..." : "Atualizar agora"}
                    </button>
                  </div>
                </div>

                <div className="mt-5 flex flex-col gap-3">
                  <div className="flex flex-wrap items-center gap-2">
                    {(["24h", "7d", "30d"] as WindowRange[]).map((range) => (
                      <button
                        key={range}
                        onClick={() => setInboxFilters((prev) => ({ ...prev, period: range }))}
                        className={cn(
                          "rounded-full px-4 py-2 text-[13px] font-medium transition",
                          inboxFilters.period === range
                            ? "bg-brand-surface text-brand"
                            : "bg-muted text-muted-foreground hover:text-foreground",
                        )}
                      >
                        {range}
                      </button>
                    ))}
                    <button
                      onClick={() => setFiltersOpen(!filtersOpen)}
                      className="ml-auto rounded-full bg-muted px-4 py-2 text-[13px] font-medium text-muted-foreground transition hover:text-foreground"
                    >
                      {showFiltersCount ? `Filtros (${advancedFiltersCount})` : "Filtros"}
                    </button>
                  </div>
                  <div className="flex flex-wrap items-center justify-between gap-2 text-[12px] text-muted-foreground">
                    <p>
                      {inboxRows.length}{" atualiza\u00e7\u00f5es \u00b7 ordenado por "}{inboxMode === "tempo-real" ? "tempo real" : "impacto"}
                    </p>
                    <p>{"\u00daltima leitura sincronizada "}{refreshLabel}</p>
                  </div>

                  {refreshError ? <p className="text-[12px] font-medium text-danger-text">{refreshError}</p> : null}

                  {filtersOpen ? (
                    <div className="rounded-[20px] bg-muted p-4">
                      <div className="space-y-3">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="text-[12px] font-medium text-muted-foreground">Severidade</p>
                          {allStatuses.map((status) => (
                            <button
                              key={status}
                              onClick={() => toggleFilterSeverity(status)}
                              className={cn(
                                "rounded-full px-3.5 py-2 text-[12px] font-medium transition",
                                activeSeverities.includes(status)
                                  ? "bg-card text-foreground"
                                  : "text-muted-foreground hover:bg-card hover:text-foreground",
                              )}
                            >
                              {status}
                            </button>
                          ))}
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                          <p className="text-[12px] font-medium text-muted-foreground">Pilar</p>
                          {allPillars.map((pillar) => (
                            <button
                              key={pillar}
                              onClick={() => toggleFilterPillar(pillar)}
                              className={cn(
                                "rounded-full px-3.5 py-2 text-[12px] font-medium transition",
                                activePillars.includes(pillar)
                                  ? "bg-card text-foreground"
                                  : "text-muted-foreground hover:bg-card hover:text-foreground",
                              )}
                            >
                              {pillar}
                            </button>
                          ))}
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                          <p className="text-[12px] font-medium text-muted-foreground">Fonte</p>
                          {allSources.map((source) => (
                            <button
                              key={source}
                              onClick={() => toggleFilterSource(source)}
                              className={cn(
                                "rounded-full px-3.5 py-2 text-[12px] font-medium transition",
                                activeSources.includes(source)
                                  ? "bg-card text-foreground"
                                  : "text-muted-foreground hover:bg-card hover:text-foreground",
                              )}
                            >
                              {source}
                            </button>
                          ))}
                        </div>

                        <div className="flex justify-end">
                          <button onClick={clearInboxFilters} className="text-[12px] font-semibold text-brand">
                            Limpar
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : null}
                </div>
              </div>

              <div className="px-7 pb-7 pt-5">
                {hasAnyFilterOverride ? (
                  <div className="mb-4 flex flex-wrap items-center gap-2 rounded-[20px] bg-muted p-3.5">
                    {activeFilterChips.map((chip) => (
                      <span key={chip} className="rounded-full bg-card px-3 py-1.5 text-[12px] font-medium text-muted-foreground">
                        {chip}
                      </span>
                    ))}
                    <button onClick={clearInboxFilters} className="ml-auto text-[12px] font-semibold text-brand">
                      Limpar filtros
                    </button>
                  </div>
                ) : null}

                {isRefreshing ? (
                  <div className="space-y-3">
                    {[1, 2, 3, 4].map((item) => (
                      <div key={item} className="h-20 animate-pulse rounded-[22px] bg-muted" />
                    ))}
                  </div>
                ) : inboxError ? (
                  <div className="rounded-[24px] bg-danger-surface px-5 py-5">
                    <p className="text-[15px] font-medium text-danger-text">{"N\u00e3o foi poss\u00edvel carregar atualiza\u00e7\u00f5es."}</p>
                    <button onClick={refreshInboxNow} className="mt-2 text-[13px] font-semibold text-danger-text underline">
                      Tentar novamente
                    </button>
                  </div>
                ) : inboxRows.length === 0 ? (
                  <div className="rounded-[24px] bg-muted px-5 py-5">
                    <p className="text-[15px] text-muted-foreground">{"Nenhuma atualiza\u00e7\u00e3o relevante no per\u00edodo."}</p>
                    <button
                      onClick={() => setInboxFilters((prev) => ({ ...prev, period: "7d" }))}
                      className="mt-2 text-[13px] font-semibold text-brand"
                    >
                      Ampliar para 7 dias
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {inboxRows.map((item, index) => {
                      const isNew = (newBadgeUntil[item.id] ?? 0) > Date.now();
                      const isPriority = index === 0;
                      const sectionLabel = feedSectionLabel(item, index);
                      const isRelevant = sectionLabel === "Acompanhamento relevante";
                      const isStablePositive = sectionLabel === "Est\u00e1veis e positivos";

                      return (
                        <button
                          key={item.id}
                          onClick={() => openInboxItem(item)}
                          className={cn(
                            "w-full text-left transition",
                            isPriority
                              ? "rounded-[24px] border border-success-border bg-brand-surface/30 dark:bg-brand-surface/10 p-5 shadow-[0_16px_32px_rgba(18,165,148,0.06)] dark:shadow-none"
                              : isRelevant
                                ? "rounded-[20px] border border-transparent bg-card px-4 py-4 hover:border-border hover:bg-card"
                                : "border-t border-border px-1 py-3 hover:bg-card",
                          )}
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex min-w-0 flex-1 items-start gap-3.5">
                              <Avatar className={cn("border border-border bg-card", isPriority ? "h-11 w-11 rounded-[14px]" : isRelevant ? "h-10 w-10 rounded-[12px]" : "h-8 w-8 rounded-[12px]")}>
                                <AvatarImage src={logoByTicker[item.ticker]} alt={item.ticker} className="object-cover" />
                                <AvatarFallback className="bg-card text-[10px] text-muted-foreground">
                                  {item.ticker.slice(0, 2)}
                                </AvatarFallback>
                              </Avatar>

                              <div className="min-w-0 flex-1">
                                <div className="flex flex-wrap items-center gap-2">
                                  <span
                                    className={cn(
                                      "rounded-full px-3 py-1 text-[11px] font-semibold",
                                      isPriority ? "bg-card text-brand" : "bg-muted text-muted-foreground",
                                    )}
                                  >
                                    {item.badge ?? (isPriority ? "Prioridade do dia" : sectionLabel)}
                                  </span>
                                  {isNew ? (
                                    <span className="rounded-full bg-blue-50 dark:bg-blue-950/30 px-3 py-1 text-[11px] font-semibold text-blue-700 dark:text-blue-400">
                                      Novo
                                    </span>
                                  ) : null}
                                </div>

                                <p className="mt-2 text-[13px] font-medium text-muted-foreground">
                                  {item.ticker} {!isStablePositive ? `\u00b7 ${item.companyName}` : ""}
                                </p>
                                <p className={cn("mt-1 font-semibold text-foreground", isPriority ? "text-[18px] leading-7" : isRelevant ? "text-[15px] leading-6" : "text-[14px] leading-5")}>
                                  {item.title}
                                </p>
                                <p className={cn("mt-2 max-w-[70ch] text-muted-foreground", isStablePositive ? "text-[13px] leading-5" : "text-[14px] leading-6")}>
                                  Por que isso importa: {item.whyItMatters}
                                </p>
                                {item.entryReason ? (
                                  <p className="mt-2 text-[12px] leading-5 text-muted-foreground">{item.entryReason}</p>
                                ) : null}
                                {item.extraLine ? (
                                  <p className="mt-1 text-[12px] leading-5 text-warning-text">{item.extraLine}</p>
                                ) : null}

                                <div className="mt-3 flex flex-wrap gap-2">
                                  {item.pillarKey ? (
                                    <span className="rounded-full bg-card px-3 py-1.5 text-[12px] font-medium text-muted-foreground">
                                      {item.pillarKey}
                                    </span>
                                  ) : null}
                                  {item.source ? (
                                    <span className="rounded-full bg-card px-3 py-1.5 text-[12px] font-medium text-muted-foreground">
                                      {item.source}
                                    </span>
                                  ) : null}
                                  <span className="rounded-full bg-card px-3 py-1.5 text-[12px] font-medium text-muted-foreground">
                                    {item.relativeTime}
                                  </span>
                                  {item.extraBadge ? (
                                    <span className="rounded-full bg-card px-3 py-1.5 text-[12px] font-medium text-muted-foreground">
                                      {item.extraBadge}
                                    </span>
                                  ) : null}
                                </div>
                              </div>
                            </div>

                            <div className="flex shrink-0 flex-col items-end gap-3">
                              <StatusBadge status={item.severity} />
                              <span className="inline-flex items-center gap-1 text-[13px] font-semibold text-brand">
                                {feedCtaLabel(item, isPriority)}
                                <ChevronRight className="h-4 w-4 text-muted-foreground" />
                              </span>
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </article>

            <div className="col-span-1 self-start space-y-6 xl:sticky xl:top-6 xl:col-span-5">
              <article className={cn(surfaceBase, "min-h-[232px] p-6")}>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-[12px] font-medium uppercase text-muted-foreground">Pilar em movimento</p>
                    <h3 className="mt-2 text-[20px] font-semibold tracking-[-0.02em] text-foreground">
                      {leadingPillarMovement.pillar}
                    </h3>
                    <p className="mt-2 max-w-[34ch] text-[14px] leading-6 text-muted-foreground">
                      {leadingPillarMovement.pillar} {pillarInsight[leadingPillarMovement.pillar]}.
                    </p>
                  </div>
                  <button
                    onClick={() => applySinglePillarFilter(leadingPillarMovement.pillar)}
                    className="rounded-full bg-muted px-3 py-2 text-[12px] font-semibold text-foreground"
                  >
                    Filtrar pilar
                  </button>
                </div>

                <div className="mt-6 space-y-4">
                  {visiblePillarMovements.map((item) => (
                    <button
                      key={item.pillar}
                      onClick={() => applySinglePillarFilter(item.pillar)}
                      className="w-full rounded-[22px] border border-border bg-muted/50 p-4 text-left transition hover:bg-hover"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="text-[15px] font-semibold text-foreground">{item.pillar}</p>
                          <p className="mt-1 text-[13px] text-muted-foreground">{item.events} eventos no dia</p>
                        </div>
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <div className="mt-3 rounded-[16px] bg-card/80 p-3">
                        <SegmentedHealthBar healthy={item.healthy} attention={item.attention} risk={item.risk} />
                        <div className="mt-1.5 flex items-center gap-2.5 text-[11px]">
                          <span className="text-success-text">{"Saud\u00e1vel "}{item.healthy}</span>
                          <span className="text-warning-text">{"Aten\u00e7\u00e3o "}{item.attention}</span>
                          <span className="text-danger-text">{"Risco "}{item.risk}</span>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </article>

              <article className={cn(mediumSurface, "min-h-[170px] bg-muted dark:bg-muted/30 p-6")}>
                <p className="text-[12px] font-medium uppercase text-blue-500 dark:text-blue-400">{"Sa\u00fade da watchlist"}</p>
                <h3 className="mt-2 text-[20px] font-semibold tracking-[-0.02em] text-foreground">
                  {healthyWatchlistCount} de {totalWatchlistCount} seguem estáveis
                </h3>
                <p className="mt-2 text-[14px] leading-6 text-muted-foreground">
                  {"A press\u00e3o est\u00e1 concentrada em poucos nomes, o que ajuda a priorizar a leitura sem espalhar aten\u00e7\u00e3o demais."}
                </p>
                <div className="mt-5 grid grid-cols-[1fr_auto] gap-3 rounded-[18px] bg-card/80 p-3">
                  <div>
                    <div className="h-2.5 overflow-hidden rounded-full bg-muted">
                      <div className="flex h-full w-full">
                        <div className="h-full bg-blue-500 dark:bg-blue-400" style={{ width: `${(healthyWatchlistCount / Math.max(totalWatchlistCount, 1)) * 100}%` }} />
                        <div className="h-full bg-blue-200 dark:bg-blue-700" style={{ width: `${(todayAttentionCount / Math.max(totalWatchlistCount, 1)) * 100}%` }} />
                        <div className="h-full bg-blue-100 dark:bg-blue-900" style={{ width: `${(Math.max(totalWatchlistCount - healthyWatchlistCount - todayAttentionCount, 0) / Math.max(totalWatchlistCount, 1)) * 100}%` }} />
                      </div>
                    </div>
                    <div className="mt-2 flex items-center justify-between text-[12px]">
                      <span className="text-muted-foreground">{"Base mais est\u00e1vel da sess\u00e3o"}</span>
                      <span className="font-semibold text-blue-700 dark:text-blue-400">{healthyWatchlistCount}/{totalWatchlistCount}</span>
                    </div>
                  </div>
                  <div className="flex w-[68px] flex-col justify-between rounded-[14px] bg-blue-50 dark:bg-blue-950/50 px-3 py-2 text-right">
                    <span className="text-[10px] uppercase text-muted-foreground">Hoje</span>
                    <span className="text-[18px] font-semibold text-blue-700 dark:text-blue-400">{todayHealthyCount}</span>
                    <span className="text-[11px] text-muted-foreground">sinais positivos</span>
                  </div>
                </div>
              </article>

              <article
                className={cn(
                  mediumSurface,
                  "min-h-[210px] overflow-hidden bg-brand-surface/20 dark:bg-brand-surface/10 p-6",
                )}
              >
                <p className="relative text-[12px] font-medium uppercase text-brand">{"Pr\u00f3xima leitura"}</p>
                <h3 className="relative mt-2 max-w-[18ch] text-[20px] font-semibold tracking-[-0.02em] text-foreground">
                  {dashboardData?.sessionClosing.headline ??
                    (completedSteps === progressStates.length
                      ? "Fluxo principal conclu\u00eddo. Feche a sess\u00e3o com uma revis\u00e3o r\u00e1pida."
                      : "Conclua a leitura principal antes de expandir para itens est\u00e1veis.")}
                </h3>
                <p className="relative mt-2 max-w-[30ch] text-[14px] leading-6 text-dim">
                  {dashboardData?.sessionClosing.body ??
                    (completedSteps === progressStates.length
                      ? "A sess\u00e3o j\u00e1 est\u00e1 organizada. Agora vale revisar rastreabilidade e contexto antes de encerrar."
                      : "Siga a ordem proposta para reduzir ru\u00eddo e validar primeiro o que realmente mudou.")}
                </p>

                <div className="relative mt-5 rounded-[20px] bg-card/80 p-4 shadow-[0_12px_24px_rgba(15,23,40,0.04)] dark:shadow-none">
                  <div className="flex flex-wrap gap-2">
                    <span className="rounded-full bg-brand-surface px-3 py-1.5 text-[12px] font-medium text-brand-text">
                      {"Sess\u00e3o em "}{progressHeadlineStep}{" de "}{progressStates.length}
                    </span>
                    <span className="rounded-full bg-muted px-3 py-1.5 text-[12px] font-medium text-muted-foreground">
                      {pluralize(completedSteps, "etapa conclu\u00edda", "etapas conclu\u00eddas")}
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-full bg-muted px-3 py-1.5 text-[12px] font-medium text-muted-foreground">
                      <Database className="h-3.5 w-3.5" />
                      {"Manifesto "}{dashboardData?.manifestVersion ?? "\u2014"}
                    </span>
                  </div>

                  <div className="mt-4 flex flex-wrap items-center gap-3">
                    <button
                      onClick={() => router.push("/watchlist")}
                      className="rounded-full bg-brand px-4 py-2.5 text-[13px] font-semibold text-white shadow-[0_14px_26px_rgba(18,165,148,0.18)] dark:shadow-none transition hover:bg-brand-hover"
                    >
                      Ver watchlist completa
                    </button>
                    <button
                      onClick={() => applySinglePillarFilter(focusedPillar)}
                      className="rounded-full bg-muted px-4 py-2.5 text-[13px] font-semibold text-foreground"
                    >
                      Filtrar pilar
                    </button>
                  </div>
                </div>
              </article>
            </div>
          </section>

          <section className="rounded-[28px] border border-border bg-card px-7 py-10 shadow-[0_18px_40px_rgba(15,23,40,0.04)] dark:shadow-none">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-[12px] font-medium uppercase text-muted-foreground">{"Fechamento da sess\u00e3o"}</p>
                <div className="mt-3 h-px w-20 bg-[linear-gradient(90deg,var(--brand),var(--brand-border))]" />
                <p className="mt-3 max-w-[72ch] text-[18px] font-semibold leading-7 text-foreground">
                  {showSessionClosing
                    ? "A sess\u00e3o j\u00e1 est\u00e1 organizada. Use este bloco como leitura final antes de sair do fluxo."
                    : "Encerramento calmo: a base segue est\u00e1vel e sem concentra\u00e7\u00e3o cr\u00edtica nova nesta sess\u00e3o."}
                </p>
                <p className="mt-2 max-w-[62ch] text-[14px] leading-6 text-muted-foreground">
                  {showSessionClosing
                    ? "A prioridade do dia j\u00e1 foi destacada acima. Se quiser aprofundar, siga pela watchlist completa ou filtre a leitura por pilar."
                    : "Voc\u00ea pode encerrar aqui ou seguir para uma explora\u00e7\u00e3o mais ampla sem perder o contexto j\u00e1 constru\u00eddo."}
                </p>
              </div>

              <div className="flex items-center gap-3 rounded-[20px] bg-card/80 px-4 py-3 shadow-[0_12px_24px_rgba(15,23,40,0.04)] dark:shadow-none">
                <span className="rounded-full bg-brand-surface px-3 py-1.5 text-[12px] font-medium text-brand-text">
                  {pluralize(todayItems.length, "item lido", "itens lidos")}
                </span>
                <span className="text-[13px] font-medium text-muted-foreground">Fluxo encerrado com rastreabilidade preservada</span>
              </div>
            </div>
          </section>
        </>)}
        </div>
      </MainContent>
    </div>
  );
}

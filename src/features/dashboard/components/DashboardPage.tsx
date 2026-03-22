"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Activity,
  Bell,
  Bookmark,
  Building2,
  CalendarDays,
  ChevronRight,
  Compass,
  Database,
  GitCompare,
  Home,
  LayoutGrid,
  NotebookPen,
  Search,
  Settings,
  Sparkles,
  UserCircle2,
  Users,
} from "lucide-react";
import { useAuth } from "@/src/features/auth/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/src/components/ui/avatar";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { cn } from "@/src/components/ui/utils";
import { useDashboardInbox, allPillars, allSources, allStatuses } from "../hooks/useDashboardInbox";
import type { InboxItem, Pillar, Status, WindowRange } from "../interfaces";

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

const surfaceBase =
  "rounded-[28px] border border-[#E8EEF5] bg-white shadow-[0_18px_40px_rgba(15,23,40,0.04)]";
const mediumSurface = "rounded-[24px] border border-[#E8EEF5] bg-white";

const statusClasses: Record<Status, string> = {
  "Saud\u00e1vel": "border-[#CDECDD] bg-[#EAF9F0] text-[#17825B]",
  "Aten\u00e7\u00e3o": "border-[#F8E1B1] bg-[#FFF4DE] text-[#B27300]",
  Risco: "border-[#F4D7DE] bg-[#FDECEF] text-[#B54768]",
};

const sidebarGroups = [
  {
    title: "Geral",
    items: [
      { id: "dashboard", label: "Painel de hoje", href: "/dashboard", icon: Home },
      { id: "explorar", label: "Explorar mercado", href: "/explorar", icon: Compass },
      { id: "watchlist", label: "Watchlist", href: "/watchlist", icon: LayoutGrid },
      { id: "comparar", label: "Comparar empresas", href: "/comparar", icon: GitCompare },
    ],
  },
  {
    title: "Apoios",
    items: [
      { id: "agenda", label: "Agenda", href: "#", icon: CalendarDays },
      { id: "notas", label: "Notas", href: "#", icon: NotebookPen },
      { id: "empresas", label: "Empresas", href: "#", icon: Building2 },
      { id: "time", label: "Time", href: "#", icon: Users },
      { id: "bookmarks", label: "Salvos", href: "#", icon: Bookmark },
    ],
  },
];

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
    <div className="h-2.5 w-full overflow-hidden rounded-full bg-[#EEF2F6]">
      <div className="h-full bg-[#1FA971]" style={{ width: `${(healthy / total) * 100}%`, float: "left" }} />
      <div className="h-full bg-[#F3B746]" style={{ width: `${(attention / total) * 100}%`, float: "left" }} />
      <div className="h-full bg-[#E6728C]" style={{ width: `${(risk / total) * 100}%`, float: "left" }} />
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
    shell: "from-[#EEF7FF] via-[#F7FBFF] to-white",
    glow: "bg-[radial-gradient(circle_at_top_left,rgba(91,141,239,0.22),transparent_58%)]",
    pill: "bg-[#EAF2FF] text-[#3965B8]",
  },
  positive: {
    shell: "from-[#F3FAF8] via-[#F9FCFB] to-white",
    glow: "bg-[radial-gradient(circle_at_top_left,rgba(18,165,148,0.20),transparent_58%)]",
    pill: "bg-[#DDF6F0] text-[#0F9485]",
  },
  pressure: {
    shell: "from-[#FDEFF1] via-[#FFF8FA] to-white",
    glow: "bg-[radial-gradient(circle_at_top_left,rgba(214,85,121,0.16),transparent_56%)]",
    pill: "bg-[#FDECEF] text-[#B54768]",
  },
};

function DashboardShell() {
  const { user, logout } = useAuth();

  return (
    <>
      <div className="hidden xl:block">
        <aside className="fixed inset-y-0 left-0 z-20 w-[240px] border-r border-[#EEF2F6] bg-white">
          <div className="flex h-full flex-col px-5 py-6">
            <button className="flex items-center justify-between rounded-[18px] border border-[#EEF2F6] bg-[#FAFCFD] px-4 py-3 text-left">
              <div>
                <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-[#98A2B3]">Contexto</p>
                <p className="mt-0.5 text-[15px] font-semibold text-[#0F1728]">Minha watchlist</p>
              </div>
              <Sparkles className="h-4 w-4 text-[#12A594]" />
            </button>

            <div className="mt-8 space-y-8">
              {sidebarGroups.map((group) => (
                <div key={group.title}>
                  <p className="mb-3 text-[11px] font-medium uppercase tracking-[0.08em] text-[#98A2B3]">
                    {group.title}
                  </p>
                  <div className="space-y-1.5">
                    {group.items.map((item) => {
                      const Icon = item.icon;
                      const isActive = item.id === "dashboard";
                      const content = (
                        <span
                          className={cn(
                            "flex items-center gap-3 rounded-[16px] px-3.5 py-3 text-[14px] transition",
                            isActive
                              ? "bg-[#F3FAF8] text-[#0F1728]"
                              : "text-[#667085] hover:bg-[#F8FBFD] hover:text-[#0F1728]",
                          )}
                        >
                          <span
                            className={cn(
                              "grid h-8 w-8 place-items-center rounded-full",
                              isActive ? "bg-white text-[#12A594]" : "bg-[#F7FAFC] text-[#98A2B3]",
                            )}
                          >
                            <Icon className="h-4 w-4" />
                          </span>
                          <span className={cn("font-medium", isActive && "font-semibold")}>{item.label}</span>
                        </span>
                      );

                      if (item.href.startsWith("/")) {
                        return (
                          <Link key={item.id} href={item.href}>
                            {content}
                          </Link>
                        );
                      }

                      return (
                        <button key={item.id} className="w-full text-left">
                          {content}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={logout}
              className="mt-auto flex items-center gap-3 rounded-[18px] bg-[#F8FBFD] px-3.5 py-3 text-left transition hover:bg-[#F1F6FA]"
            >
              <Avatar className="h-10 w-10 border border-[#E8EEF5]">
                <AvatarImage src={user?.picture} alt={user?.name ?? "Perfil"} className="object-cover" />
                <AvatarFallback className="bg-white text-[#667085]">
                  <UserCircle2 className="h-5 w-5" />
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <p className="truncate text-[14px] font-semibold text-[#0F1728]">{user?.name ?? "Sua conta"}</p>
                <p className="truncate text-[12px] text-[#98A2B3]">Sair</p>
              </div>
            </button>
          </div>
        </aside>
      </div>

      <div className="xl:hidden">
        <div className="border-b border-[#EEF2F6] bg-white px-5 py-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-[12px] font-medium uppercase tracking-[0.08em] text-[#98A2B3]">Dashboard</p>
              <p className="text-[18px] font-semibold text-[#0F1728]">Minha watchlist</p>
            </div>
            <Avatar className="h-10 w-10 border border-[#E8EEF5]">
              <AvatarImage src={user?.picture} alt={user?.name ?? "Perfil"} className="object-cover" />
              <AvatarFallback className="bg-white text-[#667085]">
                <UserCircle2 className="h-5 w-5" />
              </AvatarFallback>
            </Avatar>
          </div>
        </div>
      </div>
    </>
  );
}

export function Dashboard() {
  const router = useRouter();
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
      className="min-h-screen bg-[#F7FAFC] text-[#0F1728]"
      style={{ fontFamily: "Inter, sans-serif" }}
      data-day-template={dashboardData?.dayTemplate ?? "fallback"}
      data-manifest-version={dashboardData?.manifestVersion ?? "fallback"}
    >
      <DashboardShell />

      <main className="px-5 pb-10 pt-5 xl:ml-[240px] xl:px-8 xl:pt-6">
        <div className="mx-auto max-w-[1680px] space-y-6">
          <section className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex w-full max-w-[520px] items-center gap-3">
              <div className="relative w-full">
                <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#98A2B3]" />
                <Input
                  className="h-12 rounded-2xl border-[#E8EEF5] bg-white pl-11 text-[15px] text-[#0F1728] placeholder:text-[#98A2B3] focus-visible:ring-[#DDF6F0]"
                  placeholder={"Busque empresa, ticker ou um ponto da sess\u00e3o"}
                />
              </div>
              <span className="hidden rounded-full bg-white px-3 py-2 text-[12px] font-medium text-[#98A2B3] lg:inline-flex">
                Atualizado {refreshLabel}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <button className="grid h-11 w-11 place-items-center rounded-2xl bg-white text-[#667085] shadow-[0_8px_24px_rgba(15,23,42,0.04)] transition hover:text-[#0F1728]">
                <Bell className="h-4 w-4" />
              </button>
              <button className="grid h-11 w-11 place-items-center rounded-2xl bg-white text-[#667085] shadow-[0_8px_24px_rgba(15,23,42,0.04)] transition hover:text-[#0F1728]">
                <Settings className="h-4 w-4" />
              </button>
              <Button
                onClick={() => router.push("/watchlist?criar-alerta=1")}
                className="h-11 rounded-2xl bg-[#12A594] px-5 text-[14px] font-semibold text-white shadow-[0_14px_30px_rgba(18,165,148,0.18)] hover:bg-[#0F9485]"
              >
                Criar alerta
              </Button>
            </div>
          </section>

          <section className="grid grid-cols-1 gap-6 xl:grid-cols-12">
            <article
              className={cn(
                surfaceBase,
                "relative col-span-1 min-h-[252px] overflow-hidden xl:col-span-4",
                "bg-gradient-to-b",
                summaryToneStyle.shell,
              )}
            >
              <div className="absolute inset-x-0 top-0 h-[112px] bg-[linear-gradient(135deg,rgba(91,141,239,0.24),rgba(18,165,148,0.08)_58%,transparent_100%)]" />
              <div className={cn("absolute inset-x-0 top-0 h-[42%]", summaryToneStyle.glow)} />
              <div className="absolute -left-6 top-4 h-28 w-28 rounded-full bg-white/50 blur-3xl" />
              <div className="absolute right-10 top-8 h-20 w-32 rounded-full bg-[rgba(255,255,255,0.24)] blur-2xl" />
              <div className="absolute left-7 top-7 h-16 w-24 rounded-[22px] border border-white/40 bg-[linear-gradient(145deg,rgba(255,255,255,0.42),rgba(255,255,255,0.08))]" />
              <div className="absolute left-20 top-12 h-[2px] w-28 bg-[linear-gradient(90deg,rgba(255,255,255,0),rgba(255,255,255,0.75),rgba(255,255,255,0))]" />
              <div className="absolute right-6 top-6">
                <span className={cn("inline-flex rounded-full px-3 py-1 text-[11px] font-semibold", summaryToneStyle.pill)}>
                  {"Resumo da sess\u00e3o"}
                </span>
              </div>

              <div className="relative flex h-full flex-col justify-between p-7">
                <div className="space-y-5">
                  <div className="inline-flex h-12 w-12 items-center justify-center rounded-[18px] bg-white/80 text-[#12A594] shadow-[0_10px_30px_rgba(18,165,148,0.08)]">
                    <Activity className="h-5 w-5" />
                  </div>
                  {dashboardLoading ? (
                    <div className="space-y-3">
                      <div className="h-4 w-32 animate-pulse rounded-full bg-white/80" />
                      <div className="h-8 w-4/5 animate-pulse rounded-full bg-white/80" />
                      <div className="h-5 w-3/4 animate-pulse rounded-full bg-white/70" />
                    </div>
                  ) : dashboardError === "not_ready" ? (
                    <div className="space-y-2.5">
                      <h1 className="text-[28px] font-semibold leading-[1.15] tracking-[-0.03em] text-[#0F1728]">
                        Preparando seu dashboard
                      </h1>
                      <p className="max-w-[30ch] text-[15px] leading-6 text-[#667085]">
                        Estamos analisando sua watchlist pela primeira vez. Isso costuma levar menos de um minuto.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <p className="text-[12px] font-medium uppercase tracking-[0.08em] text-[#98A2B3]">{"Abertura da sess\u00e3o"}</p>
                      <h1 className="max-w-[18ch] text-[28px] font-semibold leading-[1.05] tracking-[-0.04em] text-[#0F1728]">
                        {heroHeadline}
                      </h1>
                      <p className="max-w-[31ch] text-[15px] leading-6 text-[#526070]">{heroBody}</p>
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <div className="flex flex-wrap gap-2">
                    <span className="inline-flex rounded-full bg-white/80 px-3 py-1.5 text-[12px] font-medium text-[#0F1728]">
                      {pluralize(todayRiskCount, "risco novo", "riscos novos")}
                    </span>
                    <span className="inline-flex rounded-full bg-white/80 px-3 py-1.5 text-[12px] font-medium text-[#0F1728]">
                      {pluralize(todayHealthyCount, "melhora", "melhoras")}
                    </span>
                    <span className="inline-flex rounded-full bg-white/80 px-3 py-1.5 text-[12px] font-medium text-[#0F1728]">
                      {"Refer\u00eancia "}{dashboardData?.referenceDate ?? "ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â"}
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-3 rounded-[20px] bg-white/55 px-3 py-3 backdrop-blur-sm">
                    <Button
                      onClick={focusInboxRecentImpact}
                      className="h-11 rounded-2xl bg-[#12A594] px-5 text-[14px] font-semibold text-white shadow-[0_14px_30px_rgba(18,165,148,0.18)] hover:bg-[#0F9485]"
                    >
                      {dashboardData?.summary.ctaPrimary ?? "Abrir prioridade"}
                    </Button>
                    <span className="text-[12px] font-medium text-[#98A2B3]">Renderizado {renderedLabel}</span>
                  </div>
                </div>
              </div>
            </article>

            <div className="col-span-1 grid gap-6 xl:col-span-3">
              <button
                onClick={() => (topRiskItem ? openInboxItem(topRiskItem) : focusInboxRecentImpact())}
                className="relative flex min-h-[128px] flex-col justify-between overflow-hidden rounded-[24px] border border-[#F0CCD7] bg-[linear-gradient(180deg,#FCECEF_0%,#FFF6F8_100%)] p-5 text-left transition hover:shadow-[0_14px_30px_rgba(181,71,104,0.10)]"
              >
                <div className="absolute right-4 top-4 h-16 w-16 rounded-full bg-[rgba(181,71,104,0.08)] blur-2xl" />
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-[12px] font-medium uppercase tracking-[0.08em] text-[#B54768]">Maior risco</p>
                    <p className="mt-1 text-[20px] font-semibold leading-[1.2] text-[#0F1728]">
                      {topRiskItem ? topRiskItem.ticker : "Sem risco novo"}
                    </p>
                  </div>
                  {topRiskItem?.extraBadge ? (
                    <span className="rounded-full bg-white/80 px-3 py-1 text-[11px] font-semibold text-[#B54768]">
                      {topRiskItem.extraBadge}
                    </span>
                  ) : topRiskItem ? <StatusBadge status={topRiskItem.severity} /> : null}
                </div>
                <p className="max-w-[25ch] text-[14px] leading-5 text-[#5F6673]">
                  {topRiskItem
                    ? topRiskItem.benefitNow ?? topRiskItem.whyItMatters
                    : "Nenhum sinal cr\u00edtico novo entrou na watchlist nas \u00faltimas 24h."}
                </p>
                <div className="space-y-2">
                  <div className="h-1.5 overflow-hidden rounded-full bg-white/70">
                    <div className="h-full w-[72%] rounded-full bg-[#C95C7A]" />
                  </div>
                  <div className="flex items-center justify-between text-[12px]">
                    <span className="text-[#7E5A66]">{topRiskItem?.entryReason ?? "Press\u00e3o concentrada no topo da leitura"}</span>
                    <span className="font-semibold text-[#B54768]">{topRiskItem?.priorityRank ?? todayRiskCount}</span>
                  </div>
                </div>
              </button>

              <button
                onClick={() => (topImproveItem ? openInboxItem(topImproveItem) : focusInboxRecentImpact())}
                className="relative flex min-h-[128px] flex-col justify-between overflow-hidden rounded-[24px] border border-[#CFE9E2] bg-[linear-gradient(180deg,#ECF8F4_0%,#F8FCFB_100%)] p-5 text-left transition hover:shadow-[0_14px_30px_rgba(18,165,148,0.10)]"
              >
                <div className="absolute right-4 top-4 h-16 w-16 rounded-full bg-[rgba(18,165,148,0.08)] blur-2xl" />
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-[12px] font-medium uppercase tracking-[0.08em] text-[#0F9485]">Maior melhora</p>
                    <p className="mt-1 text-[20px] font-semibold leading-[1.2] text-[#0F1728]">
                      {topImproveItem ? topImproveItem.ticker : "Sem melhora nova"}
                    </p>
                  </div>
                  {topImproveItem?.extraBadge ? (
                    <span className="rounded-full bg-white/80 px-3 py-1 text-[11px] font-semibold text-[#0F9485]">
                      {topImproveItem.extraBadge}
                    </span>
                  ) : topImproveItem ? <StatusBadge status={topImproveItem.severity} /> : null}
                </div>
                <p className="max-w-[25ch] text-[14px] leading-5 text-[#56666A]">
                  {topImproveItem
                    ? topImproveItem.benefitNow ?? topImproveItem.whyItMatters
                    : "Ainda n\u00e3o apareceu uma recupera\u00e7\u00e3o relevante suficiente para liderar a sess\u00e3o."}
                </p>
                <div className="space-y-2">
                  <div className="h-1.5 overflow-hidden rounded-full bg-white/75">
                    <div className="h-full w-[64%] rounded-full bg-[#239F86]" />
                  </div>
                  <div className="flex items-center justify-between text-[12px]">
                    <span className="text-[#5F7476]">{topImproveItem?.entryReason ?? "Recupera\u00e7\u00e3o com leitura mais limpa"}</span>
                    <span className="font-semibold text-[#0F9485]">{topImproveItem?.priorityRank ?? todayHealthyCount}</span>
                  </div>
                </div>
              </button>
            </div>

            <article className={cn(surfaceBase, "col-span-1 min-h-[252px] bg-[linear-gradient(180deg,#FFFFFF_0%,#FAFCFD_100%)] p-7 xl:col-span-5")}>
              <div className="flex h-full flex-col justify-between">
                <div className="space-y-5">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-[12px] font-medium uppercase tracking-[0.08em] text-[#98A2B3]">Prioridade do dia</p>
                      <h2 className="mt-2 max-w-[20ch] text-[20px] font-semibold leading-[1.3] tracking-[-0.02em] text-[#0F1728]">
                        {priorityItem
                          ? `${priorityItem.ticker} \u00e9 o melhor ponto de entrada para entender o que mudou hoje.`
                          : `O pilar ${leadingPillarMovement.pillar.toLowerCase()} concentra o melhor ponto de leitura do dia.`}
                      </h2>
                    </div>
                    <span className="rounded-full bg-[#F3FAF8] px-3 py-1 text-[11px] font-semibold text-[#0F9485]">{"Sess\u00e3o guiada"}</span>
                  </div>

                  <p className="max-w-[46ch] text-[15px] leading-6 text-[#667085]">
                    {dashboardData?.nextStep.headline ??
                      (priorityItem
                        ? `Abra ${priorityItem.ticker}, confirme o impacto no pilar ${priorityItem.pillarKey ?? leadingPillarMovement.pillar} e depois avance para os acompanhamentos relevantes.`
                        : `Use o feed principal para confirmar onde a aten\u00e7\u00e3o est\u00e1 concentrada e deixe os blocos laterais como apoio.`)}
                  </p>
                  {dashboardData?.nextStep.body ? (
                    <p className="max-w-[42ch] text-[13px] leading-5 text-[#667085]">{dashboardData.nextStep.body}</p>
                  ) : null}

                  <div className="rounded-[22px] bg-[#F5F9FC] p-3">
                    <div className="grid gap-3 md:grid-cols-3">
                    {progressStates.map((step, index) => {
                      const isCurrent = index === currentProgressStep;
                      return (
                        <div
                          key={step.label}
                          className={cn(
                            "rounded-[20px] p-4",
                            step.done
                              ? "bg-[#F7FAFC]"
                              : isCurrent
                                ? "bg-[#EEF7FF]"
                                : "bg-[#FAFCFD]",
                          )}
                        >
                          <div className="flex items-center gap-2">
                            <span
                              className={cn(
                                "inline-flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-semibold",
                                step.done
                                  ? "bg-white text-[#12A594]"
                                  : isCurrent
                                    ? "bg-white text-[#5B8DEF]"
                                    : "bg-white text-[#98A2B3]",
                              )}
                            >
                              {step.done ? "OK" : index + 1}
                            </span>
                            <p className="text-[13px] font-medium text-[#0F1728]">{step.label}</p>
                          </div>
                        </div>
                      );
                    })}
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
                  <button
                    onClick={focusInboxRecentImpact}
                    className="inline-flex items-center gap-2 rounded-2xl bg-[#F7FAFC] px-4 py-3 text-[14px] font-semibold text-[#0F1728] transition hover:bg-[#EEF2F6]"
                  >
                    Abrir leitura guiada
                    <ChevronRight className="h-4 w-4 text-[#98A2B3]" />
                  </button>
                  <button className="text-[13px] font-medium text-[#12A594] transition hover:text-[#0F9485]">Ver fontes do dia</button>
                </div>
              </div>
            </article>
          </section>

          <section className="rounded-[24px] border border-[#E8EEF5] bg-[#EEF7FF] px-6 py-5 shadow-[0_12px_24px_rgba(91,141,239,0.05)]">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-start gap-4">
                <div className="grid h-10 w-10 place-items-center rounded-full bg-white text-[#5B8DEF]">
                  <Sparkles className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-[12px] font-medium uppercase tracking-[0.08em] text-[#5B8DEF]">{"Por onde come\u00e7ar"}</p>
                  <p className="mt-1 text-[16px] font-semibold leading-6 text-[#0F1728]">{editorialText}</p>
                </div>
              </div>

              <button
                onClick={focusInboxRecentImpact}
                className="inline-flex items-center gap-2 self-start rounded-full bg-white px-4 py-2 text-[13px] font-semibold text-[#0F1728] transition hover:bg-[#F8FBFD] lg:self-auto"
              >
                Ir para o feed
                <ChevronRight className="h-4 w-4 text-[#98A2B3]" />
              </button>
            </div>
          </section>

          <section ref={inboxRef} className="grid grid-cols-1 gap-6 xl:grid-cols-12">
            <article className={cn(surfaceBase, "col-span-1 min-h-[580px] overflow-hidden xl:col-span-7")}>
              <div className="border-b border-[#EEF2F6] px-7 py-6">
                <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                  <div className="max-w-[44ch]">
                    <p className="text-[12px] font-medium uppercase tracking-[0.08em] text-[#98A2B3]">{"Explora\u00e7\u00e3o principal"}</p>
                    <h2 className="mt-2 text-[20px] font-semibold leading-[1.3] tracking-[-0.02em] text-[#0F1728]">
                      {"Atualiza\u00e7\u00f5es da watchlist"}
                    </h2>
                    <p className="mt-2 text-[15px] leading-6 text-[#667085]">
                      {"Triagem primeiro. Organiza\u00e7\u00e3o depois. O item principal abre a leitura e o restante ajuda a confirmar o contexto."}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <div className="inline-flex rounded-full bg-[#F7FAFC] p-1">
                      <button
                        onClick={setImpactMode}
                        className={cn(
                          "rounded-full px-4 py-2 text-[13px] font-semibold transition",
                          inboxMode === "top-impacto" ? "bg-white text-[#0F1728]" : "text-[#667085] hover:text-[#0F1728]",
                        )}
                      >
                        Top impacto
                      </button>
                      <button
                        onClick={setRealTimeMode}
                        className={cn(
                          "rounded-full px-4 py-2 text-[13px] font-semibold transition",
                          inboxMode === "tempo-real" ? "bg-white text-[#0F1728]" : "text-[#667085] hover:text-[#0F1728]",
                        )}
                      >
                        Tempo real
                      </button>
                    </div>
                    <button
                      onClick={refreshInboxNow}
                      disabled={isRefreshing}
                      className="rounded-full bg-[#F7FAFC] px-4 py-2 text-[13px] font-medium text-[#667085] transition hover:text-[#0F1728]"
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
                            ? "bg-[#DDF6F0] text-[#0F9485]"
                            : "bg-[#F7FAFC] text-[#667085] hover:text-[#0F1728]",
                        )}
                      >
                        {range}
                      </button>
                    ))}
                    <button
                      onClick={() => setFiltersOpen(!filtersOpen)}
                      className="ml-auto rounded-full bg-[#F7FAFC] px-4 py-2 text-[13px] font-medium text-[#667085] transition hover:text-[#0F1728]"
                    >
                      {showFiltersCount ? `Filtros (${advancedFiltersCount})` : "Filtros"}
                    </button>
                  </div>
                  <div className="flex flex-wrap items-center justify-between gap-2 text-[12px] text-[#98A2B3]">
                    <p>
                      {inboxRows.length}{" atualiza\u00e7\u00f5es \u00b7 ordenado por "}{inboxMode === "tempo-real" ? "tempo real" : "impacto"}
                    </p>
                    <p>{"\u00daltima leitura sincronizada "}{refreshLabel}</p>
                  </div>

                  {refreshError ? <p className="text-[12px] font-medium text-[#B54768]">{refreshError}</p> : null}

                  {filtersOpen ? (
                    <div className="rounded-[20px] bg-[#F7FAFC] p-4">
                      <div className="space-y-3">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="text-[12px] font-medium text-[#98A2B3]">Severidade</p>
                          {allStatuses.map((status) => (
                            <button
                              key={status}
                              onClick={() => toggleFilterSeverity(status)}
                              className={cn(
                                "rounded-full px-3.5 py-2 text-[12px] font-medium transition",
                                activeSeverities.includes(status)
                                  ? "bg-white text-[#0F1728]"
                                  : "text-[#667085] hover:bg-white hover:text-[#0F1728]",
                              )}
                            >
                              {status}
                            </button>
                          ))}
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                          <p className="text-[12px] font-medium text-[#98A2B3]">Pilar</p>
                          {allPillars.map((pillar) => (
                            <button
                              key={pillar}
                              onClick={() => toggleFilterPillar(pillar)}
                              className={cn(
                                "rounded-full px-3.5 py-2 text-[12px] font-medium transition",
                                activePillars.includes(pillar)
                                  ? "bg-white text-[#0F1728]"
                                  : "text-[#667085] hover:bg-white hover:text-[#0F1728]",
                              )}
                            >
                              {pillar}
                            </button>
                          ))}
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                          <p className="text-[12px] font-medium text-[#98A2B3]">Fonte</p>
                          {allSources.map((source) => (
                            <button
                              key={source}
                              onClick={() => toggleFilterSource(source)}
                              className={cn(
                                "rounded-full px-3.5 py-2 text-[12px] font-medium transition",
                                activeSources.includes(source)
                                  ? "bg-white text-[#0F1728]"
                                  : "text-[#667085] hover:bg-white hover:text-[#0F1728]",
                              )}
                            >
                              {source}
                            </button>
                          ))}
                        </div>

                        <div className="flex justify-end">
                          <button onClick={clearInboxFilters} className="text-[12px] font-semibold text-[#12A594]">
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
                  <div className="mb-4 flex flex-wrap items-center gap-2 rounded-[20px] bg-[#F7FAFC] p-3.5">
                    {activeFilterChips.map((chip) => (
                      <span key={chip} className="rounded-full bg-white px-3 py-1.5 text-[12px] font-medium text-[#667085]">
                        {chip}
                      </span>
                    ))}
                    <button onClick={clearInboxFilters} className="ml-auto text-[12px] font-semibold text-[#12A594]">
                      Limpar filtros
                    </button>
                  </div>
                ) : null}

                {isRefreshing ? (
                  <div className="space-y-3">
                    {[1, 2, 3, 4].map((item) => (
                      <div key={item} className="h-20 animate-pulse rounded-[22px] bg-[#F7FAFC]" />
                    ))}
                  </div>
                ) : inboxError ? (
                  <div className="rounded-[24px] bg-[#FDECEF] px-5 py-5">
                    <p className="text-[15px] font-medium text-[#B54768]">{"N\u00e3o foi poss\u00edvel carregar atualiza\u00e7\u00f5es."}</p>
                    <button onClick={refreshInboxNow} className="mt-2 text-[13px] font-semibold text-[#B54768] underline">
                      Tentar novamente
                    </button>
                  </div>
                ) : inboxRows.length === 0 ? (
                  <div className="rounded-[24px] bg-[#F7FAFC] px-5 py-5">
                    <p className="text-[15px] text-[#667085]">{"Nenhuma atualiza\u00e7\u00e3o relevante no per\u00edodo."}</p>
                    <button
                      onClick={() => setInboxFilters((prev) => ({ ...prev, period: "7d" }))}
                      className="mt-2 text-[13px] font-semibold text-[#12A594]"
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
                              ? "rounded-[24px] border border-[#DDEADF] bg-[linear-gradient(180deg,#F2FBF7_0%,#FAFDFC_100%)] p-5 shadow-[0_16px_32px_rgba(18,165,148,0.06)]"
                              : isRelevant
                                ? "rounded-[20px] border border-transparent bg-[#FAFCFD] px-4 py-4 hover:border-[#E8EEF5] hover:bg-white"
                                : "border-t border-[#F1F5F9] px-1 py-3 hover:bg-[#FAFCFD]",
                          )}
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex min-w-0 flex-1 items-start gap-3.5">
                              <Avatar className={cn("border border-[#E8EEF5] bg-white", isPriority ? "h-11 w-11 rounded-[14px]" : isRelevant ? "h-10 w-10 rounded-[12px]" : "h-8 w-8 rounded-[12px]")}>
                                <AvatarImage src={logoByTicker[item.ticker]} alt={item.ticker} className="object-cover" />
                                <AvatarFallback className="bg-white text-[10px] text-[#667085]">
                                  {item.ticker.slice(0, 2)}
                                </AvatarFallback>
                              </Avatar>

                              <div className="min-w-0 flex-1">
                                <div className="flex flex-wrap items-center gap-2">
                                  <span
                                    className={cn(
                                      "rounded-full px-3 py-1 text-[11px] font-semibold",
                                      isPriority ? "bg-white text-[#12A594]" : "bg-[#F7FAFC] text-[#667085]",
                                    )}
                                  >
                                    {item.badge ?? (isPriority ? "Prioridade do dia" : sectionLabel)}
                                  </span>
                                  {isNew ? (
                                    <span className="rounded-full bg-[#EAF2FF] px-3 py-1 text-[11px] font-semibold text-[#3965B8]">
                                      Novo
                                    </span>
                                  ) : null}
                                </div>

                                <p className="mt-2 text-[13px] font-medium text-[#98A2B3]">
                                  {item.ticker} {!isStablePositive ? `\u00b7 ${item.companyName}` : ""}
                                </p>
                                <p className={cn("mt-1 font-semibold text-[#0F1728]", isPriority ? "text-[18px] leading-7" : isRelevant ? "text-[15px] leading-6" : "text-[14px] leading-5")}>
                                  {item.title}
                                </p>
                                <p className={cn("mt-2 max-w-[70ch] text-[#667085]", isStablePositive ? "text-[13px] leading-5" : "text-[14px] leading-6")}>
                                  Por que isso importa: {item.whyItMatters}
                                </p>
                                {item.entryReason ? (
                                  <p className="mt-2 text-[12px] leading-5 text-[#98A2B3]">{item.entryReason}</p>
                                ) : null}
                                {item.extraLine ? (
                                  <p className="mt-1 text-[12px] leading-5 text-[#B27300]">{item.extraLine}</p>
                                ) : null}

                                <div className="mt-3 flex flex-wrap gap-2">
                                  {item.pillarKey ? (
                                    <span className="rounded-full bg-white px-3 py-1.5 text-[12px] font-medium text-[#667085]">
                                      {item.pillarKey}
                                    </span>
                                  ) : null}
                                  {item.source ? (
                                    <span className="rounded-full bg-white px-3 py-1.5 text-[12px] font-medium text-[#667085]">
                                      {item.source}
                                    </span>
                                  ) : null}
                                  <span className="rounded-full bg-white px-3 py-1.5 text-[12px] font-medium text-[#667085]">
                                    {item.relativeTime}
                                  </span>
                                  {item.extraBadge ? (
                                    <span className="rounded-full bg-white px-3 py-1.5 text-[12px] font-medium text-[#667085]">
                                      {item.extraBadge}
                                    </span>
                                  ) : null}
                                </div>
                              </div>
                            </div>

                            <div className="flex shrink-0 flex-col items-end gap-3">
                              <StatusBadge status={item.severity} />
                              <span className="inline-flex items-center gap-1 text-[13px] font-semibold text-[#12A594]">
                                {feedCtaLabel(item, isPriority)}
                                <ChevronRight className="h-4 w-4 text-[#98A2B3]" />
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
                    <p className="text-[12px] font-medium uppercase tracking-[0.08em] text-[#98A2B3]">Pilar em movimento</p>
                    <h3 className="mt-2 text-[20px] font-semibold tracking-[-0.02em] text-[#0F1728]">
                      {leadingPillarMovement.pillar}
                    </h3>
                    <p className="mt-2 max-w-[34ch] text-[14px] leading-6 text-[#667085]">
                      {leadingPillarMovement.pillar} {pillarInsight[leadingPillarMovement.pillar]}.
                    </p>
                  </div>
                  <button
                    onClick={() => applySinglePillarFilter(leadingPillarMovement.pillar)}
                    className="rounded-full bg-[#F7FAFC] px-3 py-2 text-[12px] font-semibold text-[#0F1728]"
                  >
                    Filtrar pilar
                  </button>
                </div>

                <div className="mt-6 space-y-4">
                  {visiblePillarMovements.map((item) => (
                    <button
                      key={item.pillar}
                      onClick={() => applySinglePillarFilter(item.pillar)}
                      className="w-full rounded-[22px] border border-[#EDF2F7] bg-[linear-gradient(180deg,#FBFDFE_0%,#F5F9FC_100%)] p-4 text-left transition hover:bg-[#F1F6FA]"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="text-[15px] font-semibold text-[#0F1728]">{item.pillar}</p>
                          <p className="mt-1 text-[13px] text-[#667085]">{item.events} eventos no dia</p>
                        </div>
                        <ChevronRight className="h-4 w-4 text-[#98A2B3]" />
                      </div>
                      <div className="mt-3 rounded-[16px] bg-white/85 p-3">
                        <SegmentedHealthBar healthy={item.healthy} attention={item.attention} risk={item.risk} />
                        <div className="mt-1.5 flex items-center gap-2.5 text-[11px]">
                          <span className="text-[#17825B]">{"Saud\u00e1vel "}{item.healthy}</span>
                          <span className="text-[#B27300]">{"Aten\u00e7\u00e3o "}{item.attention}</span>
                          <span className="text-[#B54768]">{"Risco "}{item.risk}</span>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </article>

              <article className={cn(mediumSurface, "min-h-[170px] bg-[linear-gradient(180deg,#EEF7FF_0%,#F7FBFF_100%)] p-6")}>
                <p className="text-[12px] font-medium uppercase tracking-[0.08em] text-[#5B8DEF]">{"Sa\u00fade da watchlist"}</p>
                <h3 className="mt-2 text-[20px] font-semibold tracking-[-0.02em] text-[#0F1728]">
                  {healthyWatchlistCount} de {totalWatchlistCount} seguem estáveis
                </h3>
                <p className="mt-2 text-[14px] leading-6 text-[#667085]">
                  {"A press\u00e3o est\u00e1 concentrada em poucos nomes, o que ajuda a priorizar a leitura sem espalhar aten\u00e7\u00e3o demais."}
                </p>
                <div className="mt-5 grid grid-cols-[1fr_auto] gap-3 rounded-[18px] bg-white/80 p-3">
                  <div>
                    <div className="h-2.5 overflow-hidden rounded-full bg-[#DCE8F8]">
                      <div className="flex h-full w-full">
                        <div className="h-full bg-[#5B8DEF]" style={{ width: `${(healthyWatchlistCount / Math.max(totalWatchlistCount, 1)) * 100}%` }} />
                        <div className="h-full bg-[#A9C3F7]" style={{ width: `${(todayAttentionCount / Math.max(totalWatchlistCount, 1)) * 100}%` }} />
                        <div className="h-full bg-[#D9E5FB]" style={{ width: `${(Math.max(totalWatchlistCount - healthyWatchlistCount - todayAttentionCount, 0) / Math.max(totalWatchlistCount, 1)) * 100}%` }} />
                      </div>
                    </div>
                    <div className="mt-2 flex items-center justify-between text-[12px]">
                      <span className="text-[#667085]">{"Base mais est\u00e1vel da sess\u00e3o"}</span>
                      <span className="font-semibold text-[#3965B8]">{healthyWatchlistCount}/{totalWatchlistCount}</span>
                    </div>
                  </div>
                      <span className="font-semibold text-[#3965B8]">{healthyWatchlistCount}/{totalWatchlistCount}</span>
                  <div className="flex w-[68px] flex-col justify-between rounded-[14px] bg-[linear-gradient(180deg,#F4F8FF_0%,#E8F1FF_100%)] px-3 py-2 text-right">
                    <span className="text-[10px] uppercase tracking-[0.08em] text-[#98A2B3]">Hoje</span>
                    <span className="text-[18px] font-semibold text-[#3965B8]">{todayHealthyCount}</span>
                    <span className="text-[11px] text-[#667085]">sinais positivos</span>
                  </div>
                </div>
              </article>

              <article
                className={cn(
                  mediumSurface,
                  "min-h-[210px] overflow-hidden bg-[linear-gradient(180deg,#FFFFFF_0%,#F3FAF8_100%)] p-6",
                )}
              >
                <div className="pointer-events-none absolute inset-x-6 top-0 h-16 rounded-b-[24px] bg-[linear-gradient(90deg,rgba(18,165,148,0.12),rgba(91,141,239,0.04),rgba(255,255,255,0))]" />
                <p className="relative text-[12px] font-medium uppercase tracking-[0.08em] text-[#12A594]">{"Pr\u00f3xima leitura"}</p>
                <h3 className="relative mt-2 max-w-[18ch] text-[20px] font-semibold tracking-[-0.02em] text-[#0F1728]">
                  {dashboardData?.sessionClosing.headline ??
                    (completedSteps === progressStates.length
                      ? "Fluxo principal conclu\u00eddo. Feche a sess\u00e3o com uma revis\u00e3o r\u00e1pida."
                      : "Conclua a leitura principal antes de expandir para itens est\u00e1veis.")}
                </h3>
                <p className="relative mt-2 max-w-[30ch] text-[14px] leading-6 text-[#516071]">
                  {dashboardData?.sessionClosing.body ??
                    (completedSteps === progressStates.length
                      ? "A sess\u00e3o j\u00e1 est\u00e1 organizada. Agora vale revisar rastreabilidade e contexto antes de encerrar."
                      : "Siga a ordem proposta para reduzir ru\u00eddo e validar primeiro o que realmente mudou.")}
                </p>

                <div className="relative mt-5 rounded-[20px] bg-white/80 p-4 shadow-[0_12px_24px_rgba(15,23,40,0.04)]">
                  <div className="flex flex-wrap gap-2">
                    <span className="rounded-full bg-[#F3FAF8] px-3 py-1.5 text-[12px] font-medium text-[#127A6E]">
                      {"Sess\u00e3o em "}{progressHeadlineStep}{" de "}{progressStates.length}
                    </span>
                    <span className="rounded-full bg-[#F7FAFC] px-3 py-1.5 text-[12px] font-medium text-[#667085]">
                      {pluralize(completedSteps, "etapa conclu\u00edda", "etapas conclu\u00eddas")}
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-full bg-[#F7FAFC] px-3 py-1.5 text-[12px] font-medium text-[#667085]">
                      <Database className="h-3.5 w-3.5" />
                      {"Manifesto "}{dashboardData?.manifestVersion ?? "\u2014"}
                    </span>
                  </div>

                  <div className="mt-4 flex flex-wrap items-center gap-3">
                    <button
                      onClick={() => router.push("/watchlist")}
                      className="rounded-full bg-[#12A594] px-4 py-2.5 text-[13px] font-semibold text-white shadow-[0_14px_26px_rgba(18,165,148,0.18)] transition hover:bg-[#0F9485]"
                    >
                      Ver watchlist completa
                    </button>
                    <button
                      onClick={() => applySinglePillarFilter(focusedPillar)}
                      className="rounded-full bg-[#F7FAFC] px-4 py-2.5 text-[13px] font-semibold text-[#0F1728]"
                    >
                      Filtrar pilar
                    </button>
                  </div>
                </div>
              </article>
            </div>
          </section>

          <section className="rounded-[28px] border border-[#E8EEF5] bg-[linear-gradient(180deg,#FFFFFF_0%,#F8FBFD_100%)] px-7 py-10 shadow-[0_18px_40px_rgba(15,23,40,0.04)]">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-[12px] font-medium uppercase tracking-[0.08em] text-[#98A2B3]">{"Fechamento da sess\u00e3o"}</p>
                <div className="mt-3 h-px w-20 bg-[linear-gradient(90deg,#12A594,#DCEFEA)]" />
                <p className="mt-3 max-w-[72ch] text-[18px] font-semibold leading-7 text-[#0F1728]">
                  {showSessionClosing
                    ? "A sess\u00e3o j\u00e1 est\u00e1 organizada. Use este bloco como leitura final antes de sair do fluxo."
                    : "Encerramento calmo: a base segue est\u00e1vel e sem concentra\u00e7\u00e3o cr\u00edtica nova nesta sess\u00e3o."}
                </p>
                <p className="mt-2 max-w-[62ch] text-[14px] leading-6 text-[#667085]">
                  {showSessionClosing
                    ? "A prioridade do dia j\u00e1 foi destacada acima. Se quiser aprofundar, siga pela watchlist completa ou filtre a leitura por pilar."
                    : "Voc\u00ea pode encerrar aqui ou seguir para uma explora\u00e7\u00e3o mais ampla sem perder o contexto j\u00e1 constru\u00eddo."}
                </p>
              </div>

              <div className="flex items-center gap-3 rounded-[20px] bg-white/80 px-4 py-3 shadow-[0_12px_24px_rgba(15,23,40,0.04)]">
                <span className="rounded-full bg-[#F3FAF8] px-3 py-1.5 text-[12px] font-medium text-[#127A6E]">
                  {pluralize(todayItems.length, "item lido", "itens lidos")}
                </span>
                <span className="text-[13px] font-medium text-[#667085]">Fluxo encerrado com rastreabilidade preservada</span>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

"use client";

import {
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
  Moon,
  NotebookPen,
  Search,
  Settings,
  Sparkles,
  UserCircle2,
  Users,
} from "lucide-react";

// ─── Static mock data ───────────────────────────────────────────────────────

const MOCK = {
  headline: "Hoje sua watchlist teve 2 mudanças de risco e 3 melhoras importantes.",
  body: "Comece por VALE3 e valide o impacto antes de revisar os acompanhamentos relevantes.",
  referenceDate: "21 de mar / 2025",
  renderedLabel: "agora pouco",
  editorialText:
    "VALE3 abre sua sessão hoje. Depois disso, siga para margens para confirmar se a pressão ficou concentrada ou já se espalhou.",
  topRisk: {
    ticker: "VALE3",
    severity: "Risco" as const,
    whyItMatters: "Resultados abaixo do esperado no segmento de minério de ferro.",
    entryReason: "Pressão concentrada no topo da leitura",
    priorityRank: 2,
  },
  topImprove: {
    ticker: "WEGE3",
    severity: "Saudável" as const,
    whyItMatters: "Margens operacionais expandidas e guidance mantido para 2025.",
    entryReason: "Recuperação com leitura mais limpa",
    priorityRank: 3,
  },
  priorityTicker: "VALE3",
  leadingPillar: "Margens",
  healthyWatchlistCount: 4,
  totalWatchlistCount: 6,
  todayHealthyCount: 3,
  todayRiskCount: 2,
  todayAttentionCount: 1,
  progressStates: [
    { label: "Prioridade do dia", done: false, isCurrent: true },
    { label: "Acompanhamentos", done: false, isCurrent: false },
    { label: "Itens estáveis", done: false, isCurrent: false },
  ],
  visiblePillarMovements: [
    { pillar: "Margens", events: 8, healthy: 1, attention: 3, risk: 4 },
    { pillar: "Dívida", events: 5, healthy: 2, attention: 2, risk: 1 },
    { pillar: "Caixa", events: 3, healthy: 2, attention: 1, risk: 0 },
  ],
  inboxRows: [
    {
      id: "1",
      ticker: "VALE3",
      companyName: "Vale S.A.",
      title: "Queda nas margens operacionais no 4T24",
      whyItMatters: "Pressão nos custos impacta diretamente a geração de caixa do trimestre.",
      severity: "Risco" as const,
      pillarKey: "Margens",
      source: "ITR",
      relativeTime: "há 2h",
      badge: "Prioridade do dia",
      isPriority: true,
    },
    {
      id: "2",
      ticker: "ITUB4",
      companyName: "Itaú Unibanco",
      title: "Crescimento do crédito desacelerou no trimestre",
      whyItMatters: "Inadimplência controlada mas expansão abaixo do esperado pressiona ROE.",
      severity: "Atenção" as const,
      pillarKey: "Retorno",
      source: "Release",
      relativeTime: "há 4h",
      isPriority: false,
    },
    {
      id: "3",
      ticker: "WEGE3",
      companyName: "Weg S.A.",
      title: "Expansão internacional mantida no ritmo previsto",
      whyItMatters: "Receita externa cresceu 18% a.a., compensando pressão cambial.",
      severity: "Saudável" as const,
      pillarKey: "Margens",
      source: "Release",
      relativeTime: "há 6h",
      isPriority: false,
    },
  ],
};

const statusClasses = {
  Saudável: "border-[#CDECDD] bg-[#EAF9F0] text-[#17825B]",
  Atenção: "border-[#F8E1B1] bg-[#FFF4DE] text-[#B27300]",
  Risco: "border-[#F4D7DE] bg-[#FDECEF] text-[#B54768]",
};

function StatusBadge({ status }: { status: keyof typeof statusClasses }) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-semibold tracking-[-0.01em] ${statusClasses[status]}`}
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
      <div
        className="h-full bg-[#1FA971]"
        style={{ width: `${(healthy / total) * 100}%`, float: "left" }}
      />
      <div
        className="h-full bg-[#F3B746]"
        style={{ width: `${(attention / total) * 100}%`, float: "left" }}
      />
      <div
        className="h-full bg-[#E6728C]"
        style={{ width: `${(risk / total) * 100}%`, float: "left" }}
      />
    </div>
  );
}

// ─── Sidebar ──────────────────────────────────────────────────────────────

const sidebarGroups = [
  {
    title: "Geral",
    items: [
      { id: "dashboard", label: "Painel de hoje", icon: Home },
      { id: "explorar", label: "Explorar mercado", icon: Compass },
      { id: "watchlist", label: "Watchlist", icon: LayoutGrid },
      { id: "comparar", label: "Comparar empresas", icon: GitCompare },
    ],
  },
  {
    title: "Apoios",
    items: [
      { id: "agenda", label: "Agenda", icon: CalendarDays },
      { id: "notas", label: "Notas", icon: NotebookPen },
      { id: "empresas", label: "Empresas", icon: Building2 },
      { id: "time", label: "Time", icon: Users },
      { id: "bookmarks", label: "Salvos", icon: Bookmark },
    ],
  },
];

function MockSidebar() {
  return (
    <aside className="w-[240px] shrink-0 border-r border-[#EEF2F6] bg-white">
      <div className="flex h-full flex-col px-5 py-7">
        <div className="pb-6">
          <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#B0B0B0]">
            Contexto
          </p>
          <p className="mt-2 text-[15px] font-semibold text-[#171717]">Minha watchlist</p>
        </div>

        <div className="space-y-8">
          {sidebarGroups.map((group) => (
            <div key={group.title}>
              <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.08em] text-[#B0B0B0]">
                {group.title}
              </p>
              <div className="space-y-1">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = item.id === "dashboard";
                  return (
                    <span
                      key={item.id}
                      className="relative flex items-center gap-3 rounded-[12px] px-3 py-2.5 text-[14px] transition hover:bg-[#FAFAFA]"
                    >
                      {isActive && (
                        <span className="absolute left-0 top-1/2 h-4 w-[3px] -translate-y-1/2 rounded-full bg-[#12A594]" />
                      )}
                      <span className={isActive ? "text-[#171717]" : "text-[#8A8A8A]"}>
                        <Icon className="h-[18px] w-[18px]" />
                      </span>
                      <span
                        className={
                          isActive ? "font-semibold text-[#171717]" : "font-medium text-[#7A7A7A]"
                        }
                      >
                        {item.label}
                      </span>
                    </span>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Plan card */}
        <div className="mt-auto pt-6">
          <div className="rounded-[20px] border border-[#E7EEF5] bg-[linear-gradient(180deg,#FFFFFF_0%,#FBFCFE_100%)] p-4 shadow-[0_14px_30px_rgba(15,23,40,0.05)]">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[13px] font-semibold text-[#0F1728]">Plano</p>
                <p className="mt-1 text-[12px] text-[#667085]">Renovação em 12/11</p>
              </div>
              <span className="inline-flex items-center rounded-full bg-[#EEF6FF] px-2.5 py-1 text-[11px] font-semibold text-[#3965B8]">
                PRO
              </span>
            </div>
            <div className="mt-4 flex h-11 w-full items-center justify-center rounded-[14px] bg-[#F3F4F6] text-[13px] font-semibold text-[#111827]">
              Atualizar plano
            </div>
          </div>
          <div className="mt-5 space-y-1 text-[11px] leading-5 text-[#98A2B3]">
            <p>Todos direitos reservado</p>
            <p>Analiso - ©2025</p>
          </div>
        </div>
      </div>
    </aside>
  );
}

// ─── Top bar ─────────────────────────────────────────────────────────────

function MockTopBar() {
  return (
    <header className="h-14 shrink-0 border-b border-[#E5E7EB] bg-white">
      <div className="flex h-full items-center justify-between px-6">
        {/* Search */}
        <div className="flex min-w-0 flex-1 items-center gap-2">
          <div className="flex h-9 w-full max-w-[430px] items-center rounded-lg border border-[#E5E7EB] bg-[#F9FAFB] px-3">
            <Search className="h-4 w-4 text-[#9CA3AF]" />
            <span className="ml-2 text-[13px] text-[#9CA3AF]">Busque empresa ou ticker...</span>
          </div>
        </div>
        {/* Actions */}
        <div className="flex items-center gap-1">
          <div className="relative flex h-9 w-9 items-center justify-center rounded-lg text-[#6B7280]">
            <Bell className="h-[18px] w-[18px]" />
            <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-rose-500" />
          </div>
          <div className="flex h-9 w-9 items-center justify-center rounded-lg text-[#6B7280]">
            <Settings className="h-[18px] w-[18px]" />
          </div>
          <div className="flex h-9 w-9 items-center justify-center rounded-lg text-[#6B7280]">
            <Moon className="h-[18px] w-[18px]" />
          </div>
          <div className="ml-1 flex h-8 w-8 items-center justify-center overflow-hidden rounded-full border border-[#D1D5DB] bg-white">
            <UserCircle2 className="h-5 w-5 text-[#9CA3AF]" />
          </div>
        </div>
      </div>
    </header>
  );
}

// ─── Main dashboard content ───────────────────────────────────────────────

function MockDashboardMain() {
  return (
    <main className="flex-1 overflow-hidden px-7 pb-8 pt-5">
      <div className="mx-auto max-w-[1480px] space-y-5">
        {/* Row 1: 3 summary cards */}
        <section className="grid grid-cols-12 gap-5">
          {/* Summary card */}
          <article className="relative col-span-4 min-h-[224px] overflow-hidden rounded-[24px] border border-[#C9DFFA] bg-white shadow-[0_14px_30px_rgba(15,23,40,0.04)]">
            <div className="absolute inset-x-0 top-0 h-[64px] rounded-t-[24px] bg-[linear-gradient(180deg,#DCEBFF_0%,#EAF3FF_100%)]" />
            <span className="absolute left-6 top-4 text-sm font-medium leading-5 text-[#2F6FD6]">
              Resumo do dia
            </span>
            <div className="relative flex h-full flex-col justify-between p-4.5">
              <div className="pt-[64px]">
                <div className="space-y-3">
                  <h1 className="max-w-[18ch] text-[24px] font-semibold leading-[1.06] tracking-[-0.04em] text-[#0F1728]">
                    {MOCK.headline}
                  </h1>
                  <p className="max-w-[34ch] text-[14px] leading-6 text-[#526070]">{MOCK.body}</p>
                </div>
              </div>
              <div className="flex items-center justify-between gap-3 border-t border-[#EEF3F7] pt-3.5">
                <span className="text-[12px] font-medium text-[#98A2B3]">
                  Referência {MOCK.referenceDate}
                </span>
                <div className="flex items-center gap-3">
                  <div className="h-10 rounded-[18px] bg-[#12A594] px-4 flex items-center text-[13px] font-semibold text-white shadow-[0_12px_24px_rgba(18,165,148,0.18)]">
                    Abrir prioridade
                  </div>
                  <span className="text-[12px] font-medium text-[#98A2B3]">
                    Renderizado {MOCK.renderedLabel}
                  </span>
                </div>
              </div>
            </div>
          </article>

          {/* Risk + Improve cards */}
          <div className="col-span-3 grid gap-5">
            {/* Top risk */}
            <div className="relative flex min-h-[100px] flex-col justify-between overflow-hidden rounded-[20px] border border-[#F0CCD7] bg-white p-4.5 text-left">
              <div className="absolute inset-x-0 top-0 h-[46px] rounded-t-[20px] bg-[linear-gradient(180deg,#F7D9E2_0%,#FCECEF_100%)]" />
              <p className="absolute left-5 top-4 text-sm font-medium leading-5 text-[#B54768]">
                Maior risco
              </p>
              <div className="absolute right-4 top-4 h-16 w-16 rounded-full bg-[rgba(181,71,104,0.08)] blur-2xl" />
              <div className="flex items-start justify-between gap-3">
                <p className="mt-9 text-[18px] font-semibold leading-[1.2] text-[#0F1728]">
                  {MOCK.topRisk.ticker}
                </p>
                <StatusBadge status={MOCK.topRisk.severity} />
              </div>
              <p className="max-w-[25ch] text-[13px] leading-5 text-[#5F6673]">
                {MOCK.topRisk.whyItMatters}
              </p>
              <div className="flex items-center justify-between text-[12px]">
                <span className="text-[#7E5A66]">{MOCK.topRisk.entryReason}</span>
                <span className="font-semibold text-[#B54768]">{MOCK.topRisk.priorityRank}</span>
              </div>
            </div>

            {/* Top improve */}
            <div className="relative flex min-h-[100px] flex-col justify-between overflow-hidden rounded-[20px] border border-[#CFE9E2] bg-white p-4.5 text-left">
              <div className="absolute inset-x-0 top-0 h-[46px] rounded-t-[20px] bg-[linear-gradient(180deg,#D9EFE8_0%,#ECF8F4_100%)]" />
              <p className="absolute left-5 top-4 text-sm font-medium leading-5 text-[#0F9485]">
                Maior melhora
              </p>
              <div className="absolute right-4 top-4 h-16 w-16 rounded-full bg-[rgba(18,165,148,0.08)] blur-2xl" />
              <div className="flex items-start justify-between gap-3">
                <p className="mt-9 text-[18px] font-semibold leading-[1.2] text-[#0F1728]">
                  {MOCK.topImprove.ticker}
                </p>
                <StatusBadge status={MOCK.topImprove.severity} />
              </div>
              <p className="max-w-[25ch] text-[13px] leading-5 text-[#56666A]">
                {MOCK.topImprove.whyItMatters}
              </p>
              <div className="flex items-center justify-between text-[12px]">
                <span className="text-[#5F7476]">{MOCK.topImprove.entryReason}</span>
                <span className="font-semibold text-[#0F9485]">{MOCK.topImprove.priorityRank}</span>
              </div>
            </div>
          </div>

          {/* Session guide card */}
          <article className="col-span-5 min-h-[224px] rounded-[24px] border border-[#E8EEF5] bg-white bg-[linear-gradient(180deg,#FFFFFF_0%,#FAFCFD_100%)] p-6 shadow-[0_14px_30px_rgba(15,23,40,0.04)]">
            <div className="flex h-full flex-col justify-between">
              <div className="space-y-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-[12px] font-medium uppercase tracking-[0.08em] text-[#98A2B3]">
                      Prioridade do dia
                    </p>
                    <h2 className="mt-2 max-w-[20ch] text-[18px] font-semibold leading-[1.3] tracking-[-0.02em] text-[#0F1728]">
                      {MOCK.priorityTicker} é o melhor ponto de entrada para entender o que mudou hoje.
                    </h2>
                  </div>
                  <span className="rounded-full bg-[#F3FAF8] px-3 py-1 text-[11px] font-semibold text-[#0F9485]">
                    Sessão guiada
                  </span>
                </div>

                <p className="max-w-[46ch] text-[14px] leading-6 text-[#667085]">
                  Abra {MOCK.priorityTicker}, confirme o impacto no pilar{" "}
                  {MOCK.leadingPillar.toLowerCase()} e depois avance para os acompanhamentos
                  relevantes.
                </p>

                <div className="rounded-[18px] bg-[#F5F9FC] p-3">
                  <div className="grid gap-3 grid-cols-3">
                    {MOCK.progressStates.map((step, index) => (
                      <div
                        key={step.label}
                        className={`rounded-[18px] p-3.5 ${
                          step.done
                            ? "bg-[#F7FAFC]"
                            : step.isCurrent
                              ? "bg-[#EEF7FF]"
                              : "bg-[#FAFCFD]"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span
                            className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-semibold ${
                              step.done
                                ? "bg-white text-[#12A594]"
                                : step.isCurrent
                                  ? "bg-white text-[#5B8DEF]"
                                  : "bg-white text-[#98A2B3]"
                            }`}
                          >
                            {step.done ? "OK" : index + 1}
                          </span>
                          <p className="text-[13px] font-medium text-[#0F1728]">{step.label}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
                <div className="inline-flex items-center gap-2 rounded-[18px] bg-[#F7FAFC] px-4 py-2.5 text-[13px] font-semibold text-[#0F1728]">
                  Abrir leitura guiada
                  <ChevronRight className="h-4 w-4 text-[#98A2B3]" />
                </div>
                <span className="text-[13px] font-medium text-[#12A594]">Ver fontes do dia</span>
              </div>
            </div>
          </article>
        </section>

        {/* Editorial bar */}
        <section className="rounded-[20px] border border-[#E8EEF5] bg-[#EEF7FF] px-5 py-4 shadow-[0_10px_20px_rgba(91,141,239,0.05)]">
          <div className="flex items-start gap-4">
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-white text-[#5B8DEF]">
              <Sparkles className="h-4 w-4" />
            </div>
            <div className="flex-1">
              <p className="text-[12px] font-medium uppercase tracking-[0.08em] text-[#5B8DEF]">
                Por onde começar
              </p>
              <p className="mt-1 text-[15px] font-semibold leading-6 text-[#0F1728]">
                {MOCK.editorialText}
              </p>
            </div>
            <div className="inline-flex items-center gap-2 self-center rounded-full bg-white px-4 py-2 text-[13px] font-semibold text-[#0F1728]">
              Ir para o feed
              <ChevronRight className="h-4 w-4 text-[#98A2B3]" />
            </div>
          </div>
        </section>

        {/* Feed + Right rail */}
        <section className="grid grid-cols-12 gap-5">
          {/* Feed */}
          <article className="col-span-7 min-h-[540px] overflow-hidden rounded-[24px] border border-[#E8EEF5] bg-white shadow-[0_14px_30px_rgba(15,23,40,0.04)]">
            <div className="border-b border-[#EEF2F6] px-6 py-5">
              <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                <div className="max-w-[44ch]">
                  <p className="text-[12px] font-medium uppercase tracking-[0.08em] text-[#98A2B3]">
                    Exploração principal
                  </p>
                  <h2 className="mt-2 text-[18px] font-semibold leading-[1.3] tracking-[-0.02em] text-[#0F1728]">
                    Atualizações da watchlist
                  </h2>
                  <p className="mt-2 text-[14px] leading-6 text-[#667085]">
                    Triagem primeiro. Organização depois. O item principal abre a leitura e o
                    restante ajuda a confirmar o contexto.
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <div className="inline-flex rounded-full bg-[#F7FAFC] p-1">
                    <div className="rounded-full bg-white px-3.5 py-2 text-[12px] font-semibold text-[#0F1728]">
                      Top impacto
                    </div>
                    <div className="rounded-full px-4 py-2 text-[13px] font-semibold text-[#667085]">
                      Tempo real
                    </div>
                  </div>
                  <div className="rounded-full bg-[#F7FAFC] px-3.5 py-2 text-[12px] font-medium text-[#667085]">
                    Atualizar agora
                  </div>
                </div>
              </div>
              <div className="mt-5 flex flex-col gap-3">
                <div className="flex flex-wrap items-center gap-2">
                  {(["24h", "7d", "30d"] as const).map((range) => (
                    <div
                      key={range}
                      className={`rounded-full px-4 py-2 text-[13px] font-medium ${
                        range === "24h"
                          ? "bg-[#DDF6F0] text-[#0F9485]"
                          : "bg-[#F7FAFC] text-[#667085]"
                      }`}
                    >
                      {range}
                    </div>
                  ))}
                  <div className="ml-auto rounded-full bg-[#F7FAFC] px-4 py-2 text-[13px] font-medium text-[#667085]">
                    Filtros
                  </div>
                </div>
                <div className="flex items-center justify-between text-[12px] text-[#98A2B3]">
                  <p>3 atualizações · ordenado por impacto</p>
                  <p>Última leitura sincronizada agora pouco</p>
                </div>
              </div>
            </div>

            <div className="px-7 pb-7 pt-5">
              <div className="space-y-3">
                {MOCK.inboxRows.map((item, index) => {
                  const isPriority = index === 0;
                  const isRelevant = index === 1;
                  return (
                    <div
                      key={item.id}
                      className={
                        isPriority
                          ? "w-full rounded-[24px] border border-[#DDEADF] bg-[linear-gradient(180deg,#F2FBF7_0%,#FAFDFC_100%)] p-5 shadow-[0_16px_32px_rgba(18,165,148,0.06)]"
                          : isRelevant
                            ? "w-full rounded-[20px] border border-transparent bg-[#FAFCFD] px-4 py-4"
                            : "w-full border-t border-[#F1F5F9] px-1 py-3"
                      }
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex min-w-0 flex-1 items-start gap-3.5">
                          <div
                            className={`flex shrink-0 items-center justify-center rounded-[12px] border border-[#E8EEF5] bg-white text-[10px] font-semibold text-[#667085] ${
                              isPriority ? "h-11 w-11" : isRelevant ? "h-10 w-10" : "h-8 w-8"
                            }`}
                          >
                            {item.ticker.slice(0, 2)}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <span
                                className={`rounded-full px-3 py-1 text-[11px] font-semibold ${
                                  isPriority
                                    ? "bg-white text-[#12A594]"
                                    : "bg-[#F7FAFC] text-[#667085]"
                                }`}
                              >
                                {item.badge ?? (isPriority ? "Prioridade do dia" : isRelevant ? "Acompanhamento relevante" : "Estáveis e positivos")}
                              </span>
                            </div>
                            <p className="mt-2 text-[13px] font-medium text-[#98A2B3]">
                              {item.ticker} · {item.companyName}
                            </p>
                            <p
                              className={`mt-1 font-semibold text-[#0F1728] ${
                                isPriority
                                  ? "text-[18px] leading-7"
                                  : isRelevant
                                    ? "text-[15px] leading-6"
                                    : "text-[14px] leading-5"
                              }`}
                            >
                              {item.title}
                            </p>
                            <p
                              className={`mt-2 max-w-[70ch] text-[#667085] ${
                                isPriority ? "text-[14px] leading-6" : "text-[13px] leading-5"
                              }`}
                            >
                              Por que isso importa: {item.whyItMatters}
                            </p>
                            <div className="mt-3 flex flex-wrap gap-2">
                              {item.pillarKey && (
                                <span className="rounded-full bg-white px-3 py-1.5 text-[12px] font-medium text-[#667085]">
                                  {item.pillarKey}
                                </span>
                              )}
                              {item.source && (
                                <span className="rounded-full bg-white px-3 py-1.5 text-[12px] font-medium text-[#667085]">
                                  {item.source}
                                </span>
                              )}
                              <span className="rounded-full bg-white px-3 py-1.5 text-[12px] font-medium text-[#667085]">
                                {item.relativeTime}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex shrink-0 flex-col items-end gap-3">
                          <StatusBadge status={item.severity} />
                          <span className="inline-flex items-center gap-1 text-[13px] font-semibold text-[#12A594]">
                            {isPriority ? "Abrir prioridade" : isRelevant ? "Ler análise" : "Ver contexto"}
                            <ChevronRight className="h-4 w-4 text-[#98A2B3]" />
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </article>

          {/* Right rail */}
          <div className="col-span-5 space-y-6 self-start">
            {/* Pillar card */}
            <article className="min-h-[232px] rounded-[24px] border border-[#E8EEF5] bg-white p-6 shadow-[0_14px_30px_rgba(15,23,40,0.04)]">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[12px] font-medium uppercase tracking-[0.08em] text-[#98A2B3]">
                    Pilar em movimento
                  </p>
                  <h3 className="mt-2 text-[20px] font-semibold tracking-[-0.02em] text-[#0F1728]">
                    {MOCK.leadingPillar}
                  </h3>
                  <p className="mt-2 max-w-[34ch] text-[14px] leading-6 text-[#667085]">
                    {MOCK.leadingPillar} teve volume alto de mudanças com viés de atenção.
                  </p>
                </div>
                <div className="rounded-full bg-[#F7FAFC] px-3 py-2 text-[12px] font-semibold text-[#0F1728]">
                  Filtrar pilar
                </div>
              </div>
              <div className="mt-6 space-y-4">
                {MOCK.visiblePillarMovements.map((item) => (
                  <div
                    key={item.pillar}
                    className="w-full rounded-[22px] border border-[#EDF2F7] bg-[linear-gradient(180deg,#FBFDFE_0%,#F5F9FC_100%)] p-4 text-left"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-[15px] font-semibold text-[#0F1728]">{item.pillar}</p>
                        <p className="mt-1 text-[13px] text-[#667085]">{item.events} eventos no dia</p>
                      </div>
                      <ChevronRight className="h-4 w-4 text-[#98A2B3]" />
                    </div>
                    <div className="mt-3 rounded-[16px] bg-white/85 p-3">
                      <SegmentedHealthBar
                        healthy={item.healthy}
                        attention={item.attention}
                        risk={item.risk}
                      />
                      <div className="mt-1.5 flex items-center gap-2.5 text-[11px]">
                        <span className="text-[#17825B]">Saudável {item.healthy}</span>
                        <span className="text-[#B27300]">Atenção {item.attention}</span>
                        <span className="text-[#B54768]">Risco {item.risk}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </article>

            {/* Watchlist health card */}
            <article className="rounded-[20px] border border-[#E8EEF5] bg-[linear-gradient(180deg,#EEF7FF_0%,#F7FBFF_100%)] p-6">
              <p className="text-[12px] font-medium uppercase tracking-[0.08em] text-[#5B8DEF]">
                Saúde da watchlist
              </p>
              <h3 className="mt-2 text-[20px] font-semibold tracking-[-0.02em] text-[#0F1728]">
                {MOCK.healthyWatchlistCount} de {MOCK.totalWatchlistCount} seguem estáveis
              </h3>
              <p className="mt-2 text-[14px] leading-6 text-[#667085]">
                A pressão está concentrada em poucos nomes, o que ajuda a priorizar a leitura sem
                espalhar atenção demais.
              </p>
              <div className="mt-5 grid grid-cols-[1fr_auto] gap-3 rounded-[18px] bg-white/80 p-3">
                <div>
                  <div className="h-2.5 overflow-hidden rounded-full bg-[#DCE8F8]">
                    <div className="flex h-full w-full">
                      <div
                        className="h-full bg-[#5B8DEF]"
                        style={{
                          width: `${(MOCK.healthyWatchlistCount / MOCK.totalWatchlistCount) * 100}%`,
                        }}
                      />
                      <div
                        className="h-full bg-[#A9C3F7]"
                        style={{
                          width: `${(MOCK.todayAttentionCount / MOCK.totalWatchlistCount) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                  <div className="mt-2 flex items-center justify-between text-[12px]">
                    <span className="text-[#667085]">Base mais estável da sessão</span>
                    <span className="font-semibold text-[#3965B8]">
                      {MOCK.healthyWatchlistCount}/{MOCK.totalWatchlistCount}
                    </span>
                  </div>
                </div>
                <div className="flex w-[68px] flex-col justify-between rounded-[14px] bg-[linear-gradient(180deg,#F4F8FF_0%,#E8F1FF_100%)] px-3 py-2 text-right">
                  <span className="text-[10px] uppercase tracking-[0.08em] text-[#98A2B3]">
                    Hoje
                  </span>
                  <span className="text-[18px] font-semibold text-[#3965B8]">
                    {MOCK.todayHealthyCount}
                  </span>
                  <span className="text-[11px] text-[#667085]">sinais positivos</span>
                </div>
              </div>
            </article>
          </div>
        </section>
      </div>
    </main>
  );
}

// ─── Hero wrapper ────────────────────────────────────────────────────────

export function HeroDashboardMock() {
  return (
    <div
      className="relative mx-auto mt-16 w-full max-w-[1080px] overflow-hidden rounded-[22px] border border-[#e6efff] bg-white shadow-[0_30px_80px_rgba(93,144,224,0.18)]"
      style={{ height: 420 }}
    >
      {/* Bottom fade */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-[22%] bg-[linear-gradient(180deg,rgba(255,255,255,0)_0%,#ffffff_100%)]" />

      {/* Scaled dashboard */}
      <div
        style={{
          width: 1440,
          transformOrigin: "top left",
          transform: "scale(0.75)",
          height: `${420 / 0.75}px`,
        }}
      >
        <div className="flex h-full bg-[#F7FAFC]" style={{ fontFamily: "Inter, sans-serif" }}>
          <MockSidebar />
          <div className="flex min-w-0 flex-1 flex-col">
            <MockTopBar />
            <MockDashboardMain />
          </div>
        </div>
      </div>
    </div>
  );
}

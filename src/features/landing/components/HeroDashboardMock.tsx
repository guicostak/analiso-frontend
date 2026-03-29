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
    <aside className="w-[240px] shrink-0 border-r border-border bg-card">
      <div className="flex h-full flex-col px-5 py-7">
        <div className="pb-6">
          <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
            Contexto
          </p>
          <p className="mt-2 text-[15px] font-semibold text-foreground">Minha watchlist</p>
        </div>

        <div className="space-y-8">
          {sidebarGroups.map((group) => (
            <div key={group.title}>
              <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
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
                      <span className={isActive ? "text-foreground" : "text-[#8A8A8A]"}>
                        <Icon className="h-[18px] w-[18px]" />
                      </span>
                      <span
                        className={
                          isActive ? "font-semibold text-foreground" : "font-medium text-muted-foreground"
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
          <div className="rounded-[20px] border border-border bg-[linear-gradient(180deg,#FFFFFF_0%,#FBFCFE_100%)] p-4 shadow-[0_14px_30px_rgba(15,23,40,0.05)]">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[13px] font-semibold text-foreground">Plano</p>
                <p className="mt-1 text-[12px] text-muted-foreground">Renovação em 12/11</p>
              </div>
              <span className="inline-flex items-center rounded-full bg-[#EEF6FF] px-2.5 py-1 text-[11px] font-semibold text-[#3965B8]">
                PRO
              </span>
            </div>
            <div className="mt-4 flex h-11 w-full items-center justify-center rounded-[14px] bg-[#F3F4F6] text-[13px] font-semibold text-[#111827]">
              Atualizar plano
            </div>
          </div>
          <div className="mt-5 space-y-1 text-[11px] leading-5 text-muted-foreground">
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
    <header className="h-14 shrink-0 border-b border-border bg-card">
      <div className="flex h-full items-center justify-between px-6">
        {/* Search */}
        <div className="flex min-w-0 flex-1 items-center gap-2">
          <div className="flex h-9 w-full max-w-[430px] items-center rounded-lg border border-border bg-[#F9FAFB] px-3">
            <Search className="h-4 w-4 text-[#9CA3AF]" />
            <span className="ml-2 text-[13px] text-[#9CA3AF]">Busque empresa ou ticker...</span>
          </div>
        </div>
        {/* Actions */}
        <div className="flex items-center gap-1">
          <div className="relative flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground">
            <Bell className="h-[18px] w-[18px]" />
            <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-rose-500" />
          </div>
          <div className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground">
            <Settings className="h-[18px] w-[18px]" />
          </div>
          <div className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground">
            <Moon className="h-[18px] w-[18px]" />
          </div>
          <div className="ml-1 flex h-8 w-8 items-center justify-center overflow-hidden rounded-full border border-[#D1D5DB] bg-card">
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
          <article className="relative col-span-4 min-h-[224px] overflow-hidden rounded-[24px] border border-[#C9DFFA] bg-card shadow-[0_14px_30px_rgba(15,23,40,0.04)]">
            <div className="absolute inset-x-0 top-0 h-[64px] rounded-t-[24px] bg-[linear-gradient(180deg,#DCEBFF_0%,#EAF3FF_100%)]" />
            <span className="absolute left-6 top-4 text-sm font-medium leading-5 text-[#2F6FD6]">
              Resumo do dia
            </span>
            <div className="relative flex h-full flex-col justify-between p-4.5">
              <div className="pt-[64px]">
                <div className="space-y-3">
                  <h1 className="max-w-[18ch] text-[24px] font-semibold leading-[1.06] tracking-[-0.04em] text-foreground">
                    {MOCK.headline}
                  </h1>
                  <p className="max-w-[34ch] text-[14px] leading-6 text-[#526070]">{MOCK.body}</p>
                </div>
              </div>
              <div className="flex items-center justify-between gap-3 border-t border-[#EEF3F7] pt-3.5">
                <span className="text-[12px] font-medium text-muted-foreground">
                  Referência {MOCK.referenceDate}
                </span>
                <div className="flex items-center gap-3">
                  <div className="h-10 rounded-[18px] bg-[#12A594] px-4 flex items-center text-[13px] font-semibold text-white shadow-[0_12px_24px_rgba(18,165,148,0.18)]">
                    Abrir prioridade
                  </div>
                  <span className="text-[12px] font-medium text-muted-foreground">
                    Renderizado {MOCK.renderedLabel}
                  </span>
                </div>
              </div>
            </div>
          </article>

          {/* Risk + Improve cards */}
          <div className="col-span-3 grid gap-5">
            {/* Top risk */}
            <div className="relative flex min-h-[100px] flex-col justify-between overflow-hidden rounded-[20px] border border-[#F0CCD7] bg-card p-4.5 text-left">
              <div className="absolute inset-x-0 top-0 h-[46px] rounded-t-[20px] bg-[linear-gradient(180deg,#F7D9E2_0%,#FCECEF_100%)]" />
              <p className="absolute left-5 top-4 text-sm font-medium leading-5 text-[#B54768]">
                Maior risco
              </p>
              <div className="absolute right-4 top-4 h-16 w-16 rounded-full bg-[rgba(181,71,104,0.08)] blur-2xl" />
              <div className="flex items-start justify-between gap-3">
                <p className="mt-9 text-[18px] font-semibold leading-[1.2] text-foreground">
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
            <div className="relative flex min-h-[100px] flex-col justify-between overflow-hidden rounded-[20px] border border-[#CFE9E2] bg-card p-4.5 text-left">
              <div className="absolute inset-x-0 top-0 h-[46px] rounded-t-[20px] bg-[linear-gradient(180deg,#D9EFE8_0%,#ECF8F4_100%)]" />
              <p className="absolute left-5 top-4 text-sm font-medium leading-5 text-[#0F9485]">
                Maior melhora
              </p>
              <div className="absolute right-4 top-4 h-16 w-16 rounded-full bg-[rgba(18,165,148,0.08)] blur-2xl" />
              <div className="flex items-start justify-between gap-3">
                <p className="mt-9 text-[18px] font-semibold leading-[1.2] text-foreground">
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
          <article className="col-span-5 min-h-[224px] rounded-[24px] border border-border bg-card bg-[linear-gradient(180deg,#FFFFFF_0%,#FAFCFD_100%)] p-6 shadow-[0_14px_30px_rgba(15,23,40,0.04)]">
            <div className="flex h-full flex-col justify-between">
              <div className="space-y-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-[12px] font-medium uppercase tracking-[0.08em] text-muted-foreground">
                      Prioridade do dia
                    </p>
                    <h2 className="mt-2 max-w-[20ch] text-[18px] font-semibold leading-[1.3] tracking-[-0.02em] text-foreground">
                      {MOCK.priorityTicker} é o melhor ponto de entrada para entender o que mudou hoje.
                    </h2>
                  </div>
                  <span className="rounded-full bg-[#F3FAF8] px-3 py-1 text-[11px] font-semibold text-[#0F9485]">
                    Sessão guiada
                  </span>
                </div>

                <p className="max-w-[46ch] text-[14px] leading-6 text-muted-foreground">
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
                                ? "bg-card text-[#12A594]"
                                : step.isCurrent
                                  ? "bg-card text-[#5B8DEF]"
                                  : "bg-card text-muted-foreground"
                            }`}
                          >
                            {step.done ? "OK" : index + 1}
                          </span>
                          <p className="text-[13px] font-medium text-foreground">{step.label}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
                <div className="inline-flex items-center gap-2 rounded-[18px] bg-[#F7FAFC] px-4 py-2.5 text-[13px] font-semibold text-foreground">
                  Abrir leitura guiada
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </div>
                <span className="text-[13px] font-medium text-[#12A594]">Ver fontes do dia</span>
              </div>
            </div>
          </article>
        </section>

        {/* Editorial bar */}
        <section className="rounded-[20px] border border-border bg-[#EEF7FF] px-5 py-4 shadow-[0_10px_20px_rgba(91,141,239,0.05)]">
          <div className="flex items-start gap-4">
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-card text-[#5B8DEF]">
              <Sparkles className="h-4 w-4" />
            </div>
            <div className="flex-1">
              <p className="text-[12px] font-medium uppercase tracking-[0.08em] text-[#5B8DEF]">
                Por onde começar
              </p>
              <p className="mt-1 text-[15px] font-semibold leading-6 text-foreground">
                {MOCK.editorialText}
              </p>
            </div>
            <div className="inline-flex items-center gap-2 self-center rounded-full bg-card px-4 py-2 text-[13px] font-semibold text-foreground">
              Ir para o feed
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </div>
          </div>
        </section>

        {/* Feed + Right rail */}
        <section className="grid grid-cols-12 gap-5">
          {/* Feed */}
          <article className="col-span-7 min-h-[540px] overflow-hidden rounded-[24px] border border-border bg-card shadow-[0_14px_30px_rgba(15,23,40,0.04)]">
            <div className="border-b border-border px-6 py-5">
              <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                <div className="max-w-[44ch]">
                  <p className="text-[12px] font-medium uppercase tracking-[0.08em] text-muted-foreground">
                    Exploração principal
                  </p>
                  <h2 className="mt-2 text-[18px] font-semibold leading-[1.3] tracking-[-0.02em] text-foreground">
                    Atualizações da watchlist
                  </h2>
                  <p className="mt-2 text-[14px] leading-6 text-muted-foreground">
                    Triagem primeiro. Organização depois. O item principal abre a leitura e o
                    restante ajuda a confirmar o contexto.
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <div className="inline-flex rounded-full bg-[#F7FAFC] p-1">
                    <div className="rounded-full bg-card px-3.5 py-2 text-[12px] font-semibold text-foreground">
                      Top impacto
                    </div>
                    <div className="rounded-full px-4 py-2 text-[13px] font-semibold text-muted-foreground">
                      Tempo real
                    </div>
                  </div>
                  <div className="rounded-full bg-[#F7FAFC] px-3.5 py-2 text-[12px] font-medium text-muted-foreground">
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
                          : "bg-[#F7FAFC] text-muted-foreground"
                      }`}
                    >
                      {range}
                    </div>
                  ))}
                  <div className="ml-auto rounded-full bg-[#F7FAFC] px-4 py-2 text-[13px] font-medium text-muted-foreground">
                    Filtros
                  </div>
                </div>
                <div className="flex items-center justify-between text-[12px] text-muted-foreground">
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
                            className={`flex shrink-0 items-center justify-center rounded-[12px] border border-border bg-card text-[10px] font-semibold text-muted-foreground ${
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
                                    ? "bg-card text-[#12A594]"
                                    : "bg-[#F7FAFC] text-muted-foreground"
                                }`}
                              >
                                {item.badge ?? (isPriority ? "Prioridade do dia" : isRelevant ? "Acompanhamento relevante" : "Estáveis e positivos")}
                              </span>
                            </div>
                            <p className="mt-2 text-[13px] font-medium text-muted-foreground">
                              {item.ticker} · {item.companyName}
                            </p>
                            <p
                              className={`mt-1 font-semibold text-foreground ${
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
                              className={`mt-2 max-w-[70ch] text-muted-foreground ${
                                isPriority ? "text-[14px] leading-6" : "text-[13px] leading-5"
                              }`}
                            >
                              Por que isso importa: {item.whyItMatters}
                            </p>
                            <div className="mt-3 flex flex-wrap gap-2">
                              {item.pillarKey && (
                                <span className="rounded-full bg-card px-3 py-1.5 text-[12px] font-medium text-muted-foreground">
                                  {item.pillarKey}
                                </span>
                              )}
                              {item.source && (
                                <span className="rounded-full bg-card px-3 py-1.5 text-[12px] font-medium text-muted-foreground">
                                  {item.source}
                                </span>
                              )}
                              <span className="rounded-full bg-card px-3 py-1.5 text-[12px] font-medium text-muted-foreground">
                                {item.relativeTime}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex shrink-0 flex-col items-end gap-3">
                          <StatusBadge status={item.severity} />
                          <span className="inline-flex items-center gap-1 text-[13px] font-semibold text-[#12A594]">
                            {isPriority ? "Abrir prioridade" : isRelevant ? "Ler análise" : "Ver contexto"}
                            <ChevronRight className="h-4 w-4 text-muted-foreground" />
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
            <article className="min-h-[232px] rounded-[24px] border border-border bg-card p-6 shadow-[0_14px_30px_rgba(15,23,40,0.04)]">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[12px] font-medium uppercase tracking-[0.08em] text-muted-foreground">
                    Pilar em movimento
                  </p>
                  <h3 className="mt-2 text-[20px] font-semibold tracking-[-0.02em] text-foreground">
                    {MOCK.leadingPillar}
                  </h3>
                  <p className="mt-2 max-w-[34ch] text-[14px] leading-6 text-muted-foreground">
                    {MOCK.leadingPillar} teve volume alto de mudanças com viés de atenção.
                  </p>
                </div>
                <div className="rounded-full bg-[#F7FAFC] px-3 py-2 text-[12px] font-semibold text-foreground">
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
                        <p className="text-[15px] font-semibold text-foreground">{item.pillar}</p>
                        <p className="mt-1 text-[13px] text-muted-foreground">{item.events} eventos no dia</p>
                      </div>
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="mt-3 rounded-[16px] bg-card/85 p-3">
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
            <article className="rounded-[20px] border border-border bg-[linear-gradient(180deg,#EEF7FF_0%,#F7FBFF_100%)] p-6">
              <p className="text-[12px] font-medium uppercase tracking-[0.08em] text-[#5B8DEF]">
                Saúde da watchlist
              </p>
              <h3 className="mt-2 text-[20px] font-semibold tracking-[-0.02em] text-foreground">
                {MOCK.healthyWatchlistCount} de {MOCK.totalWatchlistCount} seguem estáveis
              </h3>
              <p className="mt-2 text-[14px] leading-6 text-muted-foreground">
                A pressão está concentrada em poucos nomes, o que ajuda a priorizar a leitura sem
                espalhar atenção demais.
              </p>
              <div className="mt-5 grid grid-cols-[1fr_auto] gap-3 rounded-[18px] bg-card/80 p-3">
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
                    <span className="text-muted-foreground">Base mais estável da sessão</span>
                    <span className="font-semibold text-[#3965B8]">
                      {MOCK.healthyWatchlistCount}/{MOCK.totalWatchlistCount}
                    </span>
                  </div>
                </div>
                <div className="flex w-[68px] flex-col justify-between rounded-[14px] bg-[linear-gradient(180deg,#F4F8FF_0%,#E8F1FF_100%)] px-3 py-2 text-right">
                  <span className="text-[10px] uppercase tracking-[0.08em] text-muted-foreground">
                    Hoje
                  </span>
                  <span className="text-[18px] font-semibold text-[#3965B8]">
                    {MOCK.todayHealthyCount}
                  </span>
                  <span className="text-[11px] text-muted-foreground">sinais positivos</span>
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
  const scale = 0.8;
  const naturalHeight = 560;

  return (
    <div
      className="relative ml-[60px] w-full max-w-[1148px] overflow-hidden rounded-[22px] border border-[#e6efff] bg-card shadow-[0_30px_80px_rgba(93,144,224,0.18)] max-xl:ml-0 max-xl:min-w-[1138px] max-xl:max-w-none max-md:ml-[5%] max-md:w-[160%] max-md:min-w-0 max-md:max-w-none"
      style={{ height: Math.round(naturalHeight * scale) }}
    >
      {/* Scaled dashboard */}
      <div
        style={{
          width: 1440,
          transformOrigin: "top left",
          transform: `scale(${scale})`,
          height: naturalHeight,
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

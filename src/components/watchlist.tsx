"use client";

import {
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  GitCompare,
  MoreHorizontal,
  Plus,
  Search,
} from "lucide-react";
import Link from "next/link";
import { GlossaryText } from "./glossary/glossary-text";
import { Sidebar } from "./dashboard/sidebar";
import { AppTopBar } from "./app-top-bar";

import { useRouter } from "next/navigation";

import { useWatchlist } from "../hooks/useWatchlist";
import { getStatusFromScores, watchlistCompanies, suggestedCompanies } from "../services/watchlist";
import type { Pillar, FeedItem, PriorityItem, WatchlistCompany, AlertItem, WatchlistSortBy } from "../types/watchlist";

const pillars: Pillar[] = ["Dívida", "Caixa", "Margens", "Retorno", "Proventos"];

const badgeStyles: Record<PriorityItem["badge"], string> = {
  Risco: "bg-rose-100 text-rose-900 border-rose-300",
  "Atenção": "bg-amber-100 text-amber-900 border-amber-300",
  "Saudável": "bg-emerald-100 text-emerald-900 border-emerald-300",
};

const clickableItemStyles: Record<PriorityItem["badge"], string> = {
  Risco: "border-l-rose-400 hover:border-border-strong hover:bg-hover hover:shadow-[inset_3px_0_0_var(--brand)]",
  Atenção: "border-l-amber-400 hover:border-border-strong hover:bg-hover hover:shadow-[inset_3px_0_0_var(--brand)]",
  Saudável: "border-l-emerald-400 hover:border-border-strong hover:bg-hover hover:shadow-[inset_3px_0_0_var(--brand)]",
};

const alertStyles: Record<AlertItem["severity"], string> = {
  Risco: "bg-rose-100 text-rose-900 border-rose-300",
  "Atenção": "bg-amber-100 text-amber-900 border-amber-300",
  "Saudável": "bg-emerald-100 text-emerald-900 border-emerald-300",
};

const freshnessBadgeStyles: Record<"Atualizado" | "Dados pendentes" | "Sem dados", string> = {
  Atualizado: "bg-emerald-50 text-emerald-700 border-emerald-100",
  "Dados pendentes": "bg-amber-50 text-amber-700 border-amber-100",
  "Sem dados": "bg-hover text-dim border-border",
};

const pillarTagStyles: Record<Pillar, string> = {
  "Dívida": "bg-rose-50 text-rose-700 border-rose-100",
  Caixa: "bg-amber-50 text-amber-700 border-amber-100",
  Margens: "bg-emerald-50 text-emerald-700 border-emerald-100",
  Retorno: "bg-sky-50 text-sky-700 border-sky-100",
  Proventos: "bg-teal-50 text-teal-700 border-teal-100",
};

const rangeOptions: Array<"7d" | "30d" | "90d" | "Todos"> = ["7d", "30d", "90d", "Todos"];
const priorityRankingLabels = ["Maior piora relativa do dia", "Maior pressão estrutural", "Maior sinal de atenção"] as const;

export function WatchlistPage() {
  const router = useRouter();
  const {
    activeTab, setActiveTab,
    activeRange, setActiveRange,
    activePillars, togglePillar,
    severityFilter, setSeverityFilter,
    sourceFilter, setSourceFilter,
    showAdvancedFeedFilters, setShowAdvancedFeedFilters,
    listSearch, setListSearch,
    sortBy, setSortBy,
    filters, setFilters,
    showListFilters, setShowListFilters,
    listSeverityFilter, setListSeverityFilter,
    listSourceFilter, setListSourceFilter,
    listDensity, setListDensity,
    unseenOnly, setUnseenOnly,
    seenTickers, toggleSeenTicker,
    showAlertActionOnly, setShowAlertActionOnly,
    expandedTicker, setExpandedTicker,
    quickActionsTicker, setQuickActionsTicker,
    uiState,
    filteredFeedItems,
    filteredCompanies,
    priorityItems,
    alerts,
    sourceByTicker,
  } = useWatchlist();

  // UI-derived computed values
  const activeListFiltersCount =
    (filters.sector !== "Todos" ? 1 : 0) +
    (filters.tags !== "Todos" ? 1 : 0) +
    (filters.pillar !== "Todos" ? 1 : 0) +
    (listSeverityFilter !== "Todos" ? 1 : 0) +
    (listSourceFilter !== "Todas" ? 1 : 0);

  const summaryAttentionCount = watchlistCompanies.filter((c) => {
    const s = getStatusFromScores(c.scores);
    return s === "Risco" || s === "Atenção";
  }).length;
  const summaryRiskCount = watchlistCompanies.filter((c) => getStatusFromScores(c.scores) === "Risco").length;
  const summaryHealthyCount = watchlistCompanies.filter((c) => getStatusFromScores(c.scores) === "Saudável").length;
  const summaryChanges30dCount = watchlistCompanies.filter((c) => c.lastChangeDays <= 30).length;

  const alertsToShow = showAlertActionOnly ? alerts.filter((a) => a.severity !== "Saudável") : alerts;
  const watchlistExecutiveSummary =
    summaryAttentionCount > summaryHealthyCount
      ? "Hoje sua watchlist concentra mais sinais de atenção do que de estabilidade."
      : "Hoje sua watchlist está mais estável, com menos sinais críticos na triagem.";

  const pillarToSlug = (pillar: Pillar) =>
    pillar.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

  const buildCompanyDeepLink = (ticker: string, pillar: Pillar, evidenceId?: string) => {
    const params = new URLSearchParams({ pilar: pillarToSlug(pillar) });
    if (evidenceId) params.set("evidencia", evidenceId);
    return `/empresa/${ticker}?${params.toString()}`;
  };

  const defaultEvidenceByPillar: Record<Pillar, string> = {
    Dívida: "divida-1",
    Caixa: "caixa-1",
    Margens: "margens-1",
    Retorno: "retorno-1",
    Proventos: "proventos-1",
  };

  const getWhyItMatters = (company: WatchlistCompany) => {
    const minScore = Math.min(...company.scores);
    const minIndex = company.scores.findIndex((score) => score === minScore);
    const pillar = pillars[minIndex];
    if (minScore < 50) return `${pillar} em risco pode pressionar o plano da empresa no curto prazo.`;
    if (minScore < 70) return `${pillar} pede monitoramento para evitar piora dos próximos trimestres.`;
    return "Sem sinais críticos no momento; mantenha o acompanhamento periódico.";
  };

  const applySummaryAttentionFilter = () => { setActiveTab("list"); setListSeverityFilter("Atenção"); };
  const applySummaryRiskFilter = () => { setActiveTab("list"); setListSeverityFilter("Risco"); };
  const applySummaryChangesWindow = () => { setActiveTab("updates"); setActiveRange("30d"); };

  const getFeedCTA = (item: FeedItem | PriorityItem) =>
    ("source" in item && item.source === "CVM" ? "Ver evidência" : "Ver análise");

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Sidebar currentPage="watchlist" />
      <AppTopBar />

      <main className="ml-[88px] pt-12">
        <div className="px-8 py-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex flex-col gap-0.5">
              <h1 className="text-2xl font-semibold text-foreground">Watchlist</h1>
              <p className="text-sm text-muted-foreground">
                {activeTab === "updates"
                  ? "Triagem primeiro, organização depois. Foque no que mudou."
                  : "Organize sua watchlist e acompanhe o estado atual de cada empresa."}
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <button className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2 text-sm font-medium text-dim hover:bg-hover transition-colors">
                <Plus className="w-4 h-4" />
                Adicionar empresa
              </button>
              <button className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2 text-sm text-muted-foreground hover:bg-hover transition-colors">
                <GitCompare className="w-4 h-4" />
                Comparar
              </button>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-1 lg:grid-cols-12 gap-6">
            <section className="lg:col-span-9 space-y-3">
              <div className="flex items-center gap-2">
                {[
                  { key: "updates", label: "Atualizações" },
                  { key: "list", label: "Lista" },
                ].map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key as "updates" | "list")}
                    className={`px-4 py-2 rounded-xl text-sm font-medium border transition-colors ${
                      activeTab === tab.key
                        ? "border-brand-border bg-brand-surface text-brand-text"
                        : "border-border text-muted-foreground hover:bg-hover"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {uiState === "empty" ? (
                <div className="bg-card rounded-2xl border border-border shadow-sm p-8">
                  <h2 className="text-lg font-semibold text-foreground">Comece pela sua primeira watchlist</h2>
                  <p className="text-sm text-muted-foreground mt-2">
                    Escolha 3 empresas para acompanhar mudanças sem ruído.
                  </p>
                  <div className="mt-6 flex flex-col sm:flex-row gap-3">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <input
                        type="text"
                        placeholder="Buscar empresa ou ticker..."
                        className="w-full pl-10 pr-3 py-2 rounded-xl border border-border text-sm text-dim focus:outline-none focus:ring-2 focus:ring-mint-100"
                      />
                    </div>
                    <Link
                      href="/explorar"
                      className="px-4 py-2 rounded-xl bg-mint-500 text-white text-sm font-medium text-center"
                    >
                      Explorar mercado
                    </Link>
                  </div>
                  <div className="mt-6 flex flex-wrap gap-2">
                    {suggestedCompanies.map((ticker) => (
                      <button
                        key={ticker}
                        className="px-3 py-2 rounded-xl border border-border text-xs text-muted-foreground hover:bg-hover"
                      >
                        {ticker}
                      </button>
                    ))}
                  </div>
                </div>
              ) : uiState === "loading" ? (
                <div className="space-y-4">
                  <div className="bg-card rounded-2xl border border-border shadow-sm p-5 space-y-3">
                    <div className="h-4 w-32 bg-hover rounded" />
                    <div className="h-3 w-full bg-hover rounded" />
                    <div className="h-3 w-3/4 bg-hover rounded" />
                  </div>
                  <div className="bg-card rounded-2xl border border-border shadow-sm p-5 space-y-3">
                    <div className="h-4 w-40 bg-hover rounded" />
                    <div className="h-3 w-full bg-hover rounded" />
                    <div className="h-3 w-2/3 bg-hover rounded" />
                  </div>
                  <div className="bg-card rounded-2xl border border-border shadow-sm p-5">
                    <div className="h-10 w-full bg-hover rounded" />
                  </div>
                </div>
              ) : activeTab === "updates" ? (
                <div className="space-y-5">
                  <section className="rounded-2xl border border-brand-border bg-brand-surface p-3.5">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-[11px] font-semibold uppercase tracking-wide text-brand-text">Estado da watchlist hoje</p>
                        <p className="mt-1 text-sm font-semibold text-foreground">{watchlistExecutiveSummary}</p>
                        <p className="mt-1 text-xs text-dim">
                          {summaryRiskCount} em risco, {summaryAttentionCount - summaryRiskCount} em atenção e {summaryHealthyCount} saudáveis.
                        </p>
                      </div>
                      <span className="rounded-full border border-brand-border bg-card px-2 py-1 text-[11px] font-medium text-brand-text">
                        {summaryChanges30dCount} mudanças em 30d
                      </span>
                    </div>
                  </section>

                  <section className="bg-card rounded-2xl border border-border shadow-sm p-5">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h2 className="text-base font-semibold text-foreground">Prioridade</h2>
                        <p className="text-xs text-muted-foreground">
                          Ordenado pelo que mais merece sua atenção agora: severidade, recência e impacto potencial.
                        </p>
                      </div>
                      <span className="text-xs text-muted-foreground">{Math.min(priorityItems.length, 3)} itens</span>
                    </div>

                    <div className="space-y-2">
                      {priorityItems.slice(0, 3).map((item, index) => (
                        <div
                          key={item.id}
                          role="button"
                          tabIndex={0}
                          onClick={() => router.push(buildCompanyDeepLink(item.ticker, item.pillar))}
                          onKeyDown={(event) => {
                            if (event.key === "Enter" || event.key === " ") {
                              event.preventDefault();
                              router.push(buildCompanyDeepLink(item.ticker, item.pillar));
                            }
                          }}
                          className={`rounded-xl border border-l-4 p-3 flex flex-col gap-2 cursor-pointer transition-colors ${clickableItemStyles[item.badge]} ${
                            index === 0
                              ? "border-brand-border bg-brand-surface shadow-[0_6px_16px_rgba(16,185,129,0.08)]"
                              : "border-border bg-muted"
                          }`}
                        >
                          {index === 0 && (
                            <div className="mb-1 flex items-center justify-between rounded-lg border border-brand-border bg-brand-surface px-2 py-1 text-[11px] text-brand-text">
                              <span className="font-semibold">Comece por aqui</span>
                              <span className="rounded-full border border-brand-border bg-card px-2 py-0.5 font-semibold text-foreground">Prioridade 1</span>
                            </div>
                          )}
                          <div className="flex items-center justify-between gap-3">
                            <div>
                              <p className="text-sm font-semibold text-foreground">
                                {item.company} <span className="text-muted-foreground">({item.ticker})</span>
                              </p>
                              <p className="text-xs text-muted-foreground">{item.sector}</p>
                              <p className="mt-1 text-[11px] font-medium text-dim">{priorityRankingLabels[index]}</p>
                            </div>
                            <span
                              className={`px-2 py-1 rounded-full border text-[11px] font-medium ${badgeStyles[item.badge]}`}
                            >
                              {item.badge}
                            </span>
                          </div>
                          <div className="grid gap-1">
                            <div>
                              <p className="text-[11px] text-muted-foreground">O que mudou</p>
                              <p className="text-sm text-foreground">{item.change}</p>
                            </div>
                            <p className="text-xs text-dim">
                              <span className="font-medium">Por que importa:</span> {item.why}
                            </p>
                          </div>
                          <div className="flex items-center justify-between gap-3 text-[11px] text-muted-foreground">
                            <span>{item.evidence}</span>
                            <Link
                              href={buildCompanyDeepLink(item.ticker, item.pillar, item.evidenceId)}
                              onClick={(event) => event.stopPropagation()}
                              className="inline-flex items-center rounded-md border border-brand-border bg-brand-surface px-2 py-1 text-xs font-medium text-brand-text hover:text-foreground"
                            >
                              {getFeedCTA(item)}
                            </Link>
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>

                  <section className="bg-card rounded-2xl border border-border shadow-sm p-5">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h2 className="text-base font-semibold text-foreground">Atualizações</h2>
                        <p className="text-xs text-muted-foreground">Feed contínuo com foco no que pede ação agora.</p>
                      </div>
                      <span className="text-xs text-muted-foreground">{filteredFeedItems.length} atualizações</span>
                    </div>

                    <div className="sticky top-12 z-0 bg-card">
                      <div className="flex flex-wrap items-center gap-2 pb-3">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[11px] font-medium text-muted-foreground">Período:</span>
                          {rangeOptions.map((range) => (
                            <button
                              key={range}
                              onClick={() => setActiveRange(range)}
                              className={`px-3 py-2 rounded-xl text-xs font-medium border ${
                                activeRange === range
                                  ? "border-brand-border bg-brand-surface text-brand-text"
                                  : "border-border text-muted-foreground"
                              }`}
                            >
                              {range === "Todos" ? "Todos" : range}
                            </button>
                          ))}
                        </div>

                        <div className="flex items-center gap-1.5">
                          <span className="text-[11px] font-medium text-muted-foreground">Severidade:</span>
                          {(["Risco", "Atenção", "Saudável"] as const).map((option) => (
                            <button
                              key={option}
                              onClick={() => setSeverityFilter(option)}
                              className={`px-3 py-2 rounded-xl text-xs font-medium border ${
                                severityFilter === option
                                  ? "border-brand-border bg-brand-surface text-brand-text"
                                  : "border-border text-muted-foreground"
                              }`}
                            >
                              {option}
                            </button>
                          ))}
                          <button
                            onClick={() => setSeverityFilter("Todos")}
                            className={`px-3 py-2 rounded-xl text-xs font-medium border ${
                              severityFilter === "Todos"
                                ? "border-brand-border bg-brand-surface text-brand-text"
                                : "border-border text-muted-foreground"
                            }`}
                          >
                            Todas
                          </button>
                        </div>
                        <button
                          onClick={() => setShowAdvancedFeedFilters(!showAdvancedFeedFilters)}
                          className={`px-3 py-2 rounded-xl text-xs font-medium border ${
                            showAdvancedFeedFilters
                              ? "border-brand-border bg-brand-surface text-brand-text"
                              : "border-border text-muted-foreground"
                          }`}
                        >
                          Filtros avançados: {showAdvancedFeedFilters ? "ON" : "OFF"}
                        </button>
                      </div>

                      <div className="border-y border-border py-2 text-xs text-muted-foreground">
                        {filteredFeedItems.length} atualizações · Fonte: {sourceFilter.toLowerCase()}
                      </div>

                      {showAdvancedFeedFilters && (
                        <div className="mt-2 rounded-xl border border-border bg-muted p-2.5">
                          <div className="flex flex-col gap-2">
                          <div className="flex items-center gap-2">
                            <span className="text-[11px] font-medium text-muted-foreground">Fonte:</span>
                            {(["Todas", "CVM", "B3", "RI"] as const).map((option) => (
                              <button
                                key={option}
                                onClick={() => setSourceFilter(option)}
                                className={`px-3 py-2 rounded-xl text-xs font-medium border ${
                                  sourceFilter === option
                                    ? "border-brand-border bg-brand-surface text-brand-text"
                                    : "border-border text-muted-foreground"
                                }`}
                              >
                                {option}
                              </button>
                            ))}
                          </div>

                          <div className="flex flex-wrap gap-2">
                            <span className="self-center text-[11px] font-medium text-muted-foreground">Pilar:</span>
                            {pillars.map((pillar) => (
                              <button
                                key={pillar}
                                onClick={() => togglePillar(pillar)}
                                className={`px-3 py-2 rounded-xl text-xs font-medium border ${
                                  activePillars.includes(pillar)
                                    ? "border-brand-border bg-brand-surface text-brand-text"
                                    : "border-border text-muted-foreground hover:bg-hover"
                                }`}
                              >
                                {pillar}
                              </button>
                            ))}
                          </div>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="mt-4 space-y-3">
                      {filteredFeedItems.map((item) => (
                        <div
                          key={item.id}
                          role="button"
                          tabIndex={0}
                          onClick={() => router.push(buildCompanyDeepLink(item.ticker, item.pillar))}
                          onKeyDown={(event) => {
                            if (event.key === "Enter" || event.key === " ") {
                              event.preventDefault();
                              router.push(buildCompanyDeepLink(item.ticker, item.pillar));
                            }
                          }}
                          className={`rounded-xl border border-border border-l-4 bg-muted cursor-pointer transition-colors ${clickableItemStyles[item.severity]} ${
                            item.severity === "Risco"
                              ? "p-3 space-y-2"
                              : item.severity === "Atenção"
                                ? "p-2.5 space-y-1.5"
                                : "p-2 space-y-1"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <h3 className="text-sm font-semibold text-foreground">{item.headline}</h3>
                            <div className="flex items-center gap-2">
                              <span
                                className={`px-2 py-1 rounded-full border text-[11px] font-medium ${badgeStyles[item.severity]}`}
                              >
                                {item.severity}
                              </span>
                              <span
                                className={`px-2 py-1 rounded-full border text-[11px] font-medium ${pillarTagStyles[item.pillar]}`}
                              >
                                {item.pillar}
                              </span>
                            </div>
                          </div>
                          <div className="text-sm text-foreground">
                            <GlossaryText text={item.detail} />
                            {item.severity !== "Saudável" && (
                              <p className="mt-1 text-dim">
                                <GlossaryText text={item.detailTwo} />
                              </p>
                            )}
                          </div>
                          <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                            <span>{item.evidence}</span>
                            <Link
                              href={buildCompanyDeepLink(item.ticker, item.pillar, item.evidenceId)}
                              onClick={(event) => event.stopPropagation()}
                              className="inline-flex items-center rounded-md border border-brand-border bg-brand-surface px-2 py-1 text-xs font-medium text-brand-text hover:text-foreground"
                            >
                              Ver análise
                            </Link>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="mt-4 rounded-xl border border-border bg-muted p-3">
                      <p className="text-xs font-medium text-foreground">Fechamento da sessão</p>
                      <p className="mt-1 text-xs text-dim">
                        Nas próximas horas, acompanhe CSAN3 e MRVE3 para confirmar se a pressão em dívida e margens persiste.
                      </p>
                    </div>
                  </section>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="bg-card rounded-2xl border border-border shadow-sm p-4">
                    <div className="flex flex-col lg:flex-row lg:items-center gap-3">
                      <div className="relative flex-[1.8]">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <input
                          type="text"
                          placeholder="Buscar empresa ou ticker..."
                          value={listSearch}
                          onChange={(event) => setListSearch(event.target.value)}
                          className="w-full pl-10 pr-3 py-2 rounded-xl border border-border text-sm text-dim focus:outline-none focus:ring-2 focus:ring-mint-100"
                        />
                      </div>
                      <div className="relative flex-1">
                        <select
                          value={sortBy}
                          onChange={(event) => setSortBy(event.target.value as WatchlistSortBy)}
                          className="w-full px-3 py-2 rounded-xl border border-border text-xs text-muted-foreground bg-card focus:outline-none focus:ring-2 focus:ring-mint-100"
                        >
                          {[
                            "Mudou recentemente",
                            "Atenção primeiro",
                            "Melhor qualidade (score geral)",
                              ].map((option) => (
                                <option key={option} value={option}>
                                  Ordenar: {option}
                            </option>
                          ))}
                        </select>
                        <ChevronDown className="w-3.5 h-3.5 text-muted-foreground absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                      </div>
                      <div className="flex items-center gap-2 flex-wrap">
                        {(["Compacto", "Detalhado"] as const).map((mode) => (
                          <button
                            key={mode}
                            onClick={() => setListDensity(mode)}
                            className={`px-3 py-2 rounded-xl text-xs font-medium border ${
                              listDensity === mode
                                ? "border-brand-border bg-brand-surface text-brand-text"
                                : "border-border bg-card text-muted-foreground"
                            }`}
                          >
                            {mode}
                          </button>
                        ))}
                        <button
                          onClick={() => setShowListFilters(!showListFilters)}
                          className={`px-3 py-2 rounded-xl text-xs font-medium border ${
                            showListFilters
                              ? "border-neutral-300 bg-hover text-dim"
                              : "border-border bg-card text-muted-foreground"
                          }`}
                        >
                          Filtros ({activeListFiltersCount})
                        </button>
                        <button
                          onClick={() => setUnseenOnly(!unseenOnly)}
                          className={`px-3 py-2 rounded-xl text-xs font-medium border ${
                            unseenOnly
                              ? "border-neutral-300 bg-hover text-dim"
                              : "border-border bg-card text-muted-foreground"
                          }`}
                        >
                          Não vistos
                        </button>
                      </div>
                    </div>

                    {showListFilters && (
                      <div className="mt-3 grid grid-cols-1 gap-2 md:grid-cols-2 xl:grid-cols-3">
                        {[
                          {
                            label: "Setor",
                            key: "sector",
                            options: ["Todos", "Bancos", "Energia", "Indústria", "Saúde", "Consumo", "Construção", "Varejo"],
                          },
                          {
                            label: "Tags",
                            key: "tags",
                            options: ["Todos", "Qualidade", "Defensiva", "Dividendos", "Risco", "Cíclica", "Renda", "Atenção"],
                          },
                          {
                            label: "Pilar em atenção",
                            key: "pillar",
                            options: ["Todos", ...pillars],
                          },
                        ].map((filter) => (
                          <div key={filter.key} className="relative">
                            <select
                              value={filters[filter.key as keyof typeof filters]}
                              onChange={(event) =>
                                setFilters({ ...filters, [filter.key]: event.target.value })
                              }
                              className="w-full px-3 py-2 rounded-xl border border-border text-xs text-dim bg-card focus:outline-none focus:ring-2 focus:ring-mint-100"
                            >
                              {filter.options.map((option) => (
                                <option key={option} value={option}>
                                  {filter.label}: {option}
                                </option>
                              ))}
                            </select>
                            <ChevronDown className="w-3.5 h-3.5 text-muted-foreground absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                          </div>
                        ))}
                        <div className="relative">
                          <select
                            value={listSeverityFilter}
                            onChange={(event) => setListSeverityFilter(event.target.value as typeof listSeverityFilter)}
                            className="w-full px-3 py-2 rounded-xl border border-border text-xs text-dim bg-card focus:outline-none focus:ring-2 focus:ring-mint-100"
                          >
                            {["Todos", "Risco", "Atenção", "Saudável"].map((option) => (
                              <option key={option} value={option}>
                                Severidade: {option}
                              </option>
                            ))}
                          </select>
                          <ChevronDown className="w-3.5 h-3.5 text-muted-foreground absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                        </div>
                        <div className="relative">
                          <select
                            value={listSourceFilter}
                            onChange={(event) => setListSourceFilter(event.target.value as typeof listSourceFilter)}
                            className="w-full px-3 py-2 rounded-xl border border-border text-xs text-dim bg-card focus:outline-none focus:ring-2 focus:ring-mint-100"
                          >
                            {["Todas", "CVM", "B3", "RI"].map((option) => (
                              <option key={option} value={option}>
                                Fonte: {option}
                              </option>
                            ))}
                          </select>
                          <ChevronDown className="w-3.5 h-3.5 text-muted-foreground absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="space-y-3">
                    {filteredCompanies.map((company) => {
                      const isExpanded = expandedTicker === company.ticker;
                      const showDetails = listDensity === "Detalhado" || isExpanded;
                      const isCompactCard = listDensity === "Compacto" && !isExpanded;
                      const scoreTotal = Math.round(
                        company.scores.reduce((sum, value) => sum + value, 0) / company.scores.length
                      );
                      const status = getStatusFromScores(company.scores);
                      const minScore = Math.min(...company.scores);
                      const minIndex = company.scores.findIndex((score) => score === minScore);
                      const keyPillar = pillars[minIndex];
                      const freshnessBadge =
                        company.freshness === "Atual"
                          ? "Atualizado"
                          : company.freshness === "Falha"
                            ? "Dados pendentes"
                            : "Sem dados";
                      const whyItMatters = getWhyItMatters(company);
                      return (
                        <div
                          key={company.ticker}
                          role="button"
                          tabIndex={0}
                          onClick={() => router.push(buildCompanyDeepLink(company.ticker, company.attentionPillar))}
                          onKeyDown={(event) => {
                            if (event.key === "Enter" || event.key === " ") {
                              event.preventDefault();
                              router.push(buildCompanyDeepLink(company.ticker, company.attentionPillar));
                            }
                          }}
                          className={`bg-card rounded-2xl border border-border border-l-4 shadow-sm cursor-pointer transition-colors ${clickableItemStyles[status]} ${
                            isCompactCard ? "p-2.5" : "p-3.5"
                          }`}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0 flex-1">
                              <div className="flex items-start gap-3">
                                <div className="h-9 w-9 rounded-full border border-border bg-muted text-xs font-semibold text-muted-foreground flex items-center justify-center">
                                  {company.ticker.slice(0, 2)}
                                </div>
                                <div className="min-w-0">
                                  <p className="text-sm font-semibold text-foreground truncate">
                                    {company.name} <span className="text-muted-foreground">({company.ticker})</span>
                                  </p>
                                  <p className="text-xs text-muted-foreground">{company.sector}</p>
                                  <div className="mt-1.5 flex items-center gap-2">
                                    <span className={`px-2 py-1 rounded-full border text-[11px] font-medium ${badgeStyles[status]}`}>
                                      {status}
                                    </span>
                                  </div>
                                  <p className="mt-1 text-sm font-medium text-foreground">
                                    {minScore >= 70 ? "Sem pilar crítico no momento" : `${keyPillar} em atenção`}{" "}
                                    <span className="text-muted-foreground">({minScore}/100)</span>
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="mt-2.5 flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              {!isCompactCard && <p className="text-xs text-muted-foreground">{whyItMatters}</p>}
                              <p className="mt-1 text-[11px] text-muted-foreground">
                                Fonte: {sourceByTicker[company.ticker] ?? "CVM"} • Última mudança: {company.lastChangeDays}d
                                <span
                                  className={`ml-2 inline-flex px-1.5 py-0.5 rounded-full border text-[10px] font-medium align-middle ${freshnessBadgeStyles[freshnessBadge]}`}
                                >
                                  {freshnessBadge}
                                </span>
                              </p>
                            </div>
                            <div className="relative flex items-center gap-1.5 flex-wrap justify-end">
                              <button
                                onClick={(event) => {
                                  event.stopPropagation();
                                  router.push(buildCompanyDeepLink(company.ticker, company.attentionPillar));
                                }}
                                className="inline-flex items-center rounded-lg bg-mint-500 px-2.5 py-1.5 text-xs font-medium text-white hover:bg-mint-600 whitespace-nowrap"
                              >
                                Ver detalhes
                              </button>
                              {!isCompactCard && (
                                <Link
                                  href={buildCompanyDeepLink(company.ticker, company.attentionPillar, defaultEvidenceByPillar[company.attentionPillar])}
                                  onClick={(event) => event.stopPropagation()}
                                  className="inline-flex items-center rounded-md border border-brand-border bg-brand-surface px-2 py-1 text-xs font-medium text-brand-text hover:text-foreground whitespace-nowrap"
                                >
                                  Ver evidência
                                </Link>
                              )}
                              <button
                                title={seenTickers.includes(company.ticker) ? "Marcar como não visto" : "Marcar visto"}
                                onClick={(event) => {
                                  event.stopPropagation();
                                  toggleSeenTicker(company.ticker);
                                }}
                                className={`inline-flex items-center gap-1 rounded-md border px-2 py-1 text-xs whitespace-nowrap ${
                                  seenTickers.includes(company.ticker)
                                    ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                                    : "border-border bg-muted text-muted-foreground hover:text-foreground"
                                }`}
                              >
                                <CheckCircle2 className="h-3.5 w-3.5" />
                                {seenTickers.includes(company.ticker) ? "Visto" : isCompactCard ? "Marcar" : "Marcar visto"}
                              </button>
                              <button
                                title="Mais ações"
                                aria-label="Mais ações"
                                onClick={(event) => {
                                  event.stopPropagation();
                                  setQuickActionsTicker(quickActionsTicker === company.ticker ? null : company.ticker);
                                }}
                                className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-border bg-muted text-muted-foreground hover:bg-hover hover:text-muted-foreground"
                              >
                                <MoreHorizontal className="h-3.5 w-3.5" />
                              </button>
                              {quickActionsTicker === company.ticker && (
                                <div
                                  onClick={(event) => event.stopPropagation()}
                                  className="absolute right-0 top-8 z-10 w-44 rounded-lg border border-border bg-card p-1.5 shadow-lg"
                                >
                                  <button
                                    title="Favoritar"
                                    onClick={() => {
                                      setQuickActionsTicker(null);
                                    }}
                                    className="w-full rounded-md px-2 py-1.5 text-left text-xs text-dim hover:bg-hover"
                                  >
                                    Favoritar
                                  </button>
                                  <button
                                    title="Criar alerta"
                                    onClick={() => {
                                      setQuickActionsTicker(null);
                                    }}
                                    className="w-full rounded-md px-2 py-1.5 text-left text-xs text-dim hover:bg-hover"
                                  >
                                    Criar alerta
                                  </button>
                                  <button
                                    title={isExpanded ? "Recolher detalhes" : "Expandir detalhes"}
                                    onClick={() => {
                                      setQuickActionsTicker(null);
                                      setExpandedTicker(expandedTicker === company.ticker ? null : company.ticker);
                                    }}
                                    className="w-full rounded-md px-2 py-1.5 text-left text-xs text-dim hover:bg-hover"
                                  >
                                    {isExpanded ? "Recolher detalhes" : "Expandir detalhes"}
                                  </button>
                                  <button
                                    title="Marcar visto"
                                    onClick={() => {
                                      setQuickActionsTicker(null);
                                      toggleSeenTicker(company.ticker);
                                    }}
                                    className="w-full rounded-md px-2 py-1.5 text-left text-xs text-dim hover:bg-hover"
                                  >
                                    {seenTickers.includes(company.ticker) ? "Marcar como não visto" : "Marcar visto"}
                                  </button>
                                  <button
                                    title="Remover da watchlist"
                                    onClick={() => setQuickActionsTicker(null)}
                                    className="w-full rounded-md px-2 py-1.5 text-left text-xs text-rose-600 hover:bg-hover"
                                  >
                                    Remover da watchlist
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>

                          {showDetails && (
                            <div className="mt-4 rounded-xl border border-border bg-muted p-3 space-y-3">
                              <div className="flex items-center justify-between text-xs text-muted-foreground">
                                <span>Diagnóstico por pilar</span>
                                <span>Score geral: {scoreTotal}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                {company.scores.map((score, index) => (
                                  <div key={`${company.ticker}-${pillars[index]}`} className="flex-1">
                                    <div
                                      className={`h-2 rounded-full ${
                                        score >= 70 ? "bg-emerald-400" : score >= 50 ? "bg-amber-400" : "bg-rose-400"
                                      }`}
                                    />
                                    <div className="mt-1 text-[10px] text-muted-foreground flex items-center justify-between">
                                      <span>{pillars[index]}</span>
                                      <span>{score}</span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-muted-foreground">
                                <div className="flex items-center justify-between rounded-lg border border-border bg-card px-2 py-1.5">
                                  <span>Última mudança</span>
                                  <span>{company.lastChangeDays} dias</span>
                                </div>
                                {company.volatility && (
                                  <div className="flex items-center justify-between rounded-lg border border-border bg-card px-2 py-1.5 sm:col-span-2">
                                    <span>Volatilidade</span>
                                    <span>{company.volatility}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </section>

            <aside className="lg:col-span-3 space-y-3">
              <div className="lg:sticky lg:top-16 space-y-4">
              <div className="rounded-2xl border border-border bg-muted p-3">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Panorama rápido</h3>
                  <span className="text-[11px] text-muted-foreground">Hoje</span>
                </div>
                <p className="text-[11px] text-dim">
                  Hoje a watchlist segue mais carregada em atenção do que em estabilidade.
                </p>
                <div className="mt-1.5 grid grid-cols-3 gap-1 text-[11px] text-muted-foreground">
                  <button
                    onClick={applySummaryAttentionFilter}
                    className="rounded-md border border-border bg-card p-1 text-center hover:bg-hover transition-colors"
                  >
                    <p className="text-sm font-semibold text-foreground">{summaryAttentionCount}</p>
                    <p>em atenção</p>
                  </button>
                  <button
                    onClick={applySummaryRiskFilter}
                    className="rounded-md border border-border bg-card p-1 text-center hover:bg-hover transition-colors"
                  >
                    <p className="text-sm font-semibold text-foreground">{summaryRiskCount}</p>
                    <p>em risco</p>
                  </button>
                  <button
                    onClick={applySummaryChangesWindow}
                    className="rounded-md border border-border bg-card p-1 text-center hover:bg-hover transition-colors"
                  >
                    <p className="text-sm font-semibold text-foreground">{summaryChanges30dCount}</p>
                    <p>mudanças 30d</p>
                  </button>
                </div>
              </div>

              <div className="rounded-2xl border border-border bg-muted p-3.5">
                <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-semibold text-foreground">Alertas</h3>
                  <button
                    onClick={() => setShowAlertActionOnly(!showAlertActionOnly)}
                  className={`text-xs px-2 py-1 rounded-full border ${
                    showAlertActionOnly
                      ? "border-brand-border bg-brand-surface text-brand-text"
                      : "border-border text-muted-foreground"
                  }`}
                >
                    {showAlertActionOnly ? "Filtro ativo · Ação agora" : "Mostrando todos"}
                  </button>
                </div>
                <div className="space-y-2">
                  {alertsToShow.map((alert) => (
                    <div key={alert.id} className={`rounded-xl border p-3 ${alert.severity === "Risco" ? "border-brand-border bg-brand-surface" : "border-border bg-muted"}`}>
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-semibold text-foreground">{alert.title}</p>
                        <span className={`px-2 py-0.5 rounded-full border text-[10px] ${alertStyles[alert.severity]}`}>
                          {alert.severity}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">{alert.summary}</p>
                      <p className="text-[11px] text-muted-foreground mt-2">{alert.time}</p>
                    </div>
                  ))}
                </div>
                <button className="mt-3 w-full px-3 py-2 rounded-xl border border-border text-xs text-muted-foreground hover:bg-hover">
                  Configurar alertas
                </button>
              </div>
              </div>
            </aside>
          </div>
        </div>
      </main>

    </div>
  );
}

export default WatchlistPage;

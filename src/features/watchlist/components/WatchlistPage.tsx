"use client";

import Link from "next/link";
import { Search } from "lucide-react";
import { Sidebar } from "@/src/components/layout/Sidebar";
import { AppTopBar } from "@/src/components/layout/AppTopBar";
import { MainContent } from "@/src/components/layout/MainContent";
import { useWatchlist } from "../hooks/useWatchlist";
import { suggestedCompanies } from "../services";
import type { Pillar, WatchlistCompany, WatchlistStatus } from "../interfaces";
import { WatchlistHeader } from "./WatchlistHeader";
import { WatchlistUpdatesTab } from "./WatchlistUpdatesTab";
import { WatchlistListTab } from "./WatchlistListTab";
import { WatchlistSidebar } from "./WatchlistSidebar";

const pillars = ["Dívida", "Caixa", "Margens", "Retorno", "Proventos"] as Pillar[];
const attentionStatus = "Atenção" as WatchlistStatus;

export function WatchlistPage() {
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
    pageHeader,
    stateBlock,
    prioritySection,
    updatesSectionHeader,
    quickOverview,
    alertsPanelHeader,
    sessionClosing,
    sourceByTicker,
  } = useWatchlist();

  const activeListFiltersCount =
    (filters.sector !== "Todos" ? 1 : 0) +
    (filters.tags !== "Todos" ? 1 : 0) +
    (filters.pillar !== "Todos" ? 1 : 0) +
    (listSeverityFilter !== "Todos" ? 1 : 0) +
    (listSourceFilter !== "Todas" ? 1 : 0);

  const alertsToShow = showAlertActionOnly ? alerts.filter((a) => a.severity !== "Saudável") : alerts;

  const pillarToSlug = (pillar: Pillar) =>
    pillar.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

  const buildCompanyDeepLink = (ticker: string, pillar: Pillar, evidenceId?: string) => {
    const params = new URLSearchParams({ pilar: pillarToSlug(pillar) });
    if (evidenceId) params.set("evidencia", evidenceId);
    return `/empresa/${ticker}?${params.toString()}`;
  };

  const getDefaultEvidenceId = (pillar: Pillar) => {
    if (pillar === pillars[0]) return "divida-1";
    if (pillar === "Caixa") return "caixa-1";
    if (pillar === "Margens") return "margens-1";
    if (pillar === "Retorno") return "retorno-1";
    return "proventos-1";
  };

  const getWhyItMatters = (company: WatchlistCompany) => {
    const minScore = Math.min(...company.scores);
    const minIndex = company.scores.findIndex((score) => score === minScore);
    const pillar = pillars[minIndex];
    if (minScore < 50) return `${pillar} em risco pode pressionar o plano da empresa no curto prazo.`;
    if (minScore < 70) return `${pillar} pede monitoramento para evitar piora dos próximos trimestres.`;
    return "Sem sinais críticos no momento; mantenha o acompanhamento periódico.";
  };

  const applySummaryAttentionFilter = () => {
    setActiveTab("list");
    setListSeverityFilter(attentionStatus);
  };

  const applySummaryRiskFilter = () => {
    setActiveTab("list");
    setListSeverityFilter("Risco");
  };

  const applySummaryChangesWindow = () => {
    setActiveTab("updates");
    setActiveRange("30d");
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Sidebar currentPage="watchlist" />
      <AppTopBar sidebarOffsetClassName="left-0 xl:left-[240px]" />

      <MainContent className="relative overflow-hidden pt-20">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-[14%] top-0 h-80 w-80 rounded-full bg-[radial-gradient(circle,rgba(91,141,239,0.09)_0%,rgba(91,141,239,0)_72%)]" />
          <div className="absolute right-[10%] top-44 h-72 w-72 rounded-full bg-[radial-gradient(circle,rgba(18,165,148,0.08)_0%,rgba(18,165,148,0)_72%)]" />
        </div>

        <div className="relative px-7 pb-8 pt-5">
          <div className="mx-auto max-w-[1480px]">
            <WatchlistHeader
              activeTab={activeTab}
              title={pageHeader?.title ?? "Monitorados"}
              subtitle={pageHeader?.subtitle}
            />

            <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-12">
              <section className="space-y-5 lg:col-span-8">
                <div className="flex flex-wrap items-center gap-3">
                  {[
                    { key: "updates", label: "Atualizações" },
                    { key: "list", label: "Lista" },
                  ].map((tab) => (
                    <button
                      key={tab.key}
                      onClick={() => setActiveTab(tab.key as "updates" | "list")}
                      className={`rounded-full border px-4.5 py-2 text-[12px] font-semibold transition ${
                        activeTab === tab.key
                          ? "border-border bg-muted text-blue-700 dark:text-blue-400"
                          : "border-border bg-card text-muted-foreground hover:bg-hover hover:text-foreground"
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                {uiState === "empty" ? (
                  <div className="rounded-[24px] border border-border bg-card p-7 shadow-[0_14px_30px_rgba(15,23,40,0.04)] dark:shadow-none">
                    <h2 className="text-[24px] font-semibold leading-[30px] tracking-[-0.02em] text-foreground">
                      Comece pela sua primeira watchlist
                    </h2>
                    <p className="mt-3 text-[14px] leading-6 text-muted-foreground">
                      Escolha 3 empresas para acompanhar mudanças sem ruído.
                    </p>
                    <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                      <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <input
                          type="text"
                          placeholder="Buscar empresa ou ticker..."
                          className="h-11 w-full rounded-[18px] border border-border bg-muted pl-10 pr-3 text-[13px] text-foreground outline-none transition focus:ring-2 focus:ring-brand-border"
                        />
                      </div>
                      <Link
                        href="/explorar"
                        className="inline-flex h-11 items-center justify-center rounded-[18px] bg-brand px-4.5 text-[13px] font-semibold text-white shadow-[0_12px_24px_rgba(18,165,148,0.18)] dark:shadow-none"
                      >
                        Explorar mercado
                      </Link>
                    </div>
                    <div className="mt-5 flex flex-wrap gap-2">
                      {suggestedCompanies.map((ticker) => (
                        <button
                          key={ticker}
                          className="rounded-full border border-border bg-muted px-3.5 py-2 text-[11px] font-medium text-muted-foreground transition hover:bg-card"
                        >
                          {ticker}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : uiState === "loading" ? (
                  <div className="space-y-4">
                    <div className="space-y-4 rounded-[24px] border border-border bg-card p-5 shadow-[0_14px_30px_rgba(15,23,40,0.04)] dark:shadow-none">
                      <div className="h-4 w-32 rounded bg-muted" />
                      <div className="h-10 w-4/5 rounded-full bg-muted" />
                      <div className="h-4 w-3/4 rounded-full bg-muted" />
                    </div>
                    <div className="space-y-4 rounded-[24px] border border-border bg-card p-5 shadow-[0_14px_30px_rgba(15,23,40,0.04)] dark:shadow-none">
                      <div className="h-4 w-40 rounded bg-muted" />
                      <div className="h-20 w-full rounded-[20px] bg-muted" />
                    </div>
                    <div className="rounded-[24px] border border-border bg-card p-5 shadow-[0_14px_30px_rgba(15,23,40,0.04)] dark:shadow-none">
                      <div className="h-14 w-full rounded-[18px] bg-muted" />
                    </div>
                  </div>
                ) : activeTab === "updates" ? (
                  <WatchlistUpdatesTab
                    stateBlock={stateBlock}
                    prioritySection={prioritySection}
                    updatesSectionHeader={updatesSectionHeader}
                    priorityItems={priorityItems}
                    filteredFeedItems={filteredFeedItems}
                    sessionClosing={sessionClosing}
                    activeRange={activeRange}
                    severityFilter={severityFilter}
                    sourceFilter={sourceFilter}
                    showAdvancedFeedFilters={showAdvancedFeedFilters}
                    activePillars={activePillars}
                    buildCompanyDeepLink={buildCompanyDeepLink}
                    setActiveRange={setActiveRange}
                    setSeverityFilter={setSeverityFilter}
                    setSourceFilter={setSourceFilter}
                    setShowAdvancedFeedFilters={setShowAdvancedFeedFilters}
                    togglePillar={togglePillar}
                  />
                ) : (
                  <WatchlistListTab
                    filteredCompanies={filteredCompanies}
                    listSearch={listSearch}
                    sortBy={sortBy}
                    listDensity={listDensity}
                    showListFilters={showListFilters}
                    activeListFiltersCount={activeListFiltersCount}
                    unseenOnly={unseenOnly}
                    seenTickers={seenTickers}
                    expandedTicker={expandedTicker}
                    quickActionsTicker={quickActionsTicker}
                    listSeverityFilter={listSeverityFilter}
                    listSourceFilter={listSourceFilter}
                    filters={filters}
                    sourceByTicker={sourceByTicker}
                    getWhyItMatters={getWhyItMatters}
                    buildCompanyDeepLink={buildCompanyDeepLink}
                    getDefaultEvidenceId={getDefaultEvidenceId}
                    setListSearch={setListSearch}
                    setSortBy={setSortBy}
                    setListDensity={setListDensity}
                    setShowListFilters={setShowListFilters}
                    setUnseenOnly={setUnseenOnly}
                    setListSeverityFilter={setListSeverityFilter}
                    setListSourceFilter={setListSourceFilter}
                    setFilters={setFilters}
                    toggleSeenTicker={toggleSeenTicker}
                    setExpandedTicker={setExpandedTicker}
                    setQuickActionsTicker={setQuickActionsTicker}
                  />
                )}
              </section>

              <WatchlistSidebar
                quickOverview={quickOverview}
                alertsPanelHeader={alertsPanelHeader}
                alertsToShow={alertsToShow}
                showAlertActionOnly={showAlertActionOnly}
                applySummaryAttentionFilter={applySummaryAttentionFilter}
                applySummaryRiskFilter={applySummaryRiskFilter}
                applySummaryChangesWindow={applySummaryChangesWindow}
                setShowAlertActionOnly={setShowAlertActionOnly}
              />
            </div>
          </div>
        </div>
      </MainContent>
    </div>
  );
}

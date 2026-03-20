"use client";

import Link from "next/link";
import { Search } from "lucide-react";
import { Sidebar } from "@/src/components/layout/Sidebar";
import { AppTopBar } from "@/src/components/layout/AppTopBar";
import { useWatchlist } from "../hooks/useWatchlist";
import { getStatusFromScores, suggestedCompanies } from "../services";
import type { Pillar, WatchlistCompany } from "../interfaces";
import { WatchlistHeader } from "./WatchlistHeader";
import { WatchlistUpdatesTab } from "./WatchlistUpdatesTab";
import { WatchlistListTab } from "./WatchlistListTab";
import { WatchlistSidebar } from "./WatchlistSidebar";

const pillars: Pillar[] = ["Dívida", "Caixa", "Margens", "Retorno", "Proventos"];

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
    companies,
    priorityItems,
    alerts,
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

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Sidebar currentPage="watchlist" />
      <AppTopBar />

      <main className="ml-[88px] pt-12">
        <div className="px-8 py-6">
          <WatchlistHeader activeTab={activeTab} />

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
                  defaultEvidenceByPillar={defaultEvidenceByPillar}
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
      </main>
    </div>
  );
}

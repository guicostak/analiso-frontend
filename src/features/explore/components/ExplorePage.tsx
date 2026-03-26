"use client";

import { ExternalLink } from "lucide-react";
import { Sidebar } from "@/src/components/layout/Sidebar";
import { AppTopBar } from "@/src/components/layout/AppTopBar";
import { useExplore } from "../hooks/useExplore";
import { ExploreHighlightsSection } from "./ExploreHighlightsSection";
import { ExploreCompanyCatalog } from "./ExploreCompanyCatalog";
import { ExploreMarketContext } from "./ExploreMarketContext";
import { ExploreMovementsPanel } from "./ExploreMovementsPanel";
import { ExploreCompareBar } from "./ExploreCompareBar";
import { ExploreDrawer } from "./ExploreDrawer";

export function ExplorePage() {
  const {
    selectedTab,
    selectedEntryPoints,
    compareTickers,
    searchQuery,
    summaryScope,
    summaryState,
    activePreset,
    appliedChips,
    selectedSource,
    showAllHighlights,
    showAdvancedFilters,
    showAllMovements,
    showVolatilityInfo,
    showVolatilityDetails,
    showContextPanel,
    filters,
    isLoading,
    filteredCompanies,
    sortedHighlights,
    staleCount,
    showStaleBanner,
    hasSectorSelected,
    hasWatchlist,
    volatilityIsStale,
    indexCards,
    movers,
    movementInsights,
    movementSummary,
    movementDominant,
    volatility,
    thesisCollections,
    sectorCollections,
    pillars,
    highlights,
    getCompanyLogo,
    setSelectedTab,
    setSearchQuery,
    setSummaryScope,
    setSummaryState,
    setSelectedSource,
    setShowAllHighlights,
    setShowAdvancedFilters,
    setShowAllMovements,
    setShowVolatilityInfo,
    setShowVolatilityDetails,
    setShowContextPanel,
    setFilters,
    toggleEntryPoint,
    clearEntryPoints,
    applyHighlightPreset,
    clearPreset,
    toggleCompare,
    resetFilters,
  } = useExplore();

  return (
    <div className="min-h-screen bg-[#F6FAFC] text-[#0F1728]">
      <Sidebar currentPage="explorar" contextLabel="Explorar mercado" />

      <AppTopBar sidebarOffsetClassName="left-0 xl:left-[240px]" />

      <main className="relative overflow-hidden pt-20 xl:ml-[240px]">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-[18%] top-0 h-80 w-80 rounded-full bg-[radial-gradient(circle,rgba(91,141,239,0.10)_0%,rgba(91,141,239,0)_72%)]" />
          <div className="absolute right-[10%] top-40 h-72 w-72 rounded-full bg-[radial-gradient(circle,rgba(18,165,148,0.08)_0%,rgba(18,165,148,0)_72%)]" />
        </div>

        <div className="relative px-6 pb-8 pt-5">
          <div className="mx-auto max-w-[1380px]">
            <header className="mb-4 space-y-2">
              <p className="text-[12px] font-medium uppercase tracking-[0.08em] text-[#98A2B3]">Explorar mercado</p>
              <div className="max-w-[640px] space-y-2">
                <h1 className="text-[30px] font-semibold leading-[34px] tracking-[-0.04em] text-[#0F1728]">Explorar</h1>
                <p className="text-[13px] leading-6 text-[#667085]">
                  Descubra empresas e movimentos com uma leitura guiada, priorizando o que merece abertura agora e deixando a exploração mais leve ao longo da página.
                </p>
              </div>
            </header>

            <div className="space-y-4">
              <ExploreHighlightsSection
                summaryScope={summaryScope}
                summaryState={summaryState}
                hasSectorSelected={hasSectorSelected}
                hasWatchlist={hasWatchlist}
                sortedHighlights={sortedHighlights}
                highlights={highlights}
                showAllHighlights={showAllHighlights}
                getCompanyLogo={getCompanyLogo}
                setSummaryScope={setSummaryScope}
                setSummaryState={setSummaryState}
                setSelectedSource={setSelectedSource}
                setShowAllHighlights={setShowAllHighlights}
                applyHighlightPreset={applyHighlightPreset}
              />

              <div className="grid grid-cols-1 gap-5">
                <ExploreCompanyCatalog
                  isLoading={isLoading}
                  filteredCompanies={filteredCompanies}
                  filters={filters}
                  searchQuery={searchQuery}
                  showAdvancedFilters={showAdvancedFilters}
                  activePreset={activePreset}
                  appliedChips={appliedChips}
                  showStaleBanner={showStaleBanner}
                  staleCount={staleCount}
                  selectedEntryPoints={selectedEntryPoints}
                  thesisCollections={thesisCollections}
                  compareTickers={compareTickers}
                  getCompanyLogo={getCompanyLogo}
                  setSearchQuery={setSearchQuery}
                  setFilters={setFilters}
                  setShowAdvancedFilters={setShowAdvancedFilters}
                  toggleEntryPoint={toggleEntryPoint}
                  clearEntryPoints={clearEntryPoints}
                  clearPreset={clearPreset}
                  toggleCompare={toggleCompare}
                  resetFilters={resetFilters}
                />

                <ExploreMarketContext
                  isLoading={isLoading}
                  showContextPanel={showContextPanel}
                  showVolatilityInfo={showVolatilityInfo}
                  indexCards={indexCards}
                  volatility={volatility}
                  volatilityIsStale={volatilityIsStale}
                  setShowContextPanel={setShowContextPanel}
                  setShowVolatilityInfo={setShowVolatilityInfo}
                  setShowVolatilityDetails={setShowVolatilityDetails}
                />

                <ExploreMovementsPanel
                  selectedTab={selectedTab}
                  movers={movers}
                  movementInsights={movementInsights}
                  showAllMovements={showAllMovements}
                  movementSummary={movementSummary}
                  movementDominant={movementDominant}
                  getCompanyLogo={getCompanyLogo}
                  setSelectedTab={setSelectedTab}
                  setShowAllMovements={setShowAllMovements}
                />
              </div>
            </div>
          </div>
        </div>
      </main>

      <ExploreCompareBar compareTickers={compareTickers} toggleCompare={toggleCompare} />

      {/* Source drawer */}
      <ExploreDrawer open={!!selectedSource} onClose={() => setSelectedSource(null)} title="Fonte e rastreabilidade">
        {selectedSource && (() => {
          const sd = selectedSource.sourceDetail;
          const stateLabel: Record<string, string> = { RISK: "Risco", ATTENTION: "Atenção", HEALTHY: "Saudável" };
          const recencyLabel = sd && sd.sourceRecencyDays > 0
            ? sd.sourceRecencyDays === 1 ? "Ontem"
            : sd.sourceRecencyDays < 7   ? `${sd.sourceRecencyDays} dias atrás`
            : sd.sourceRecencyDays < 30  ? `${Math.floor(sd.sourceRecencyDays / 7)} sem atrás`
            : "Último dado disponível"
            : null;

          return (
            <div className="space-y-5">
              {/* Cabeçalho da empresa */}
              <div className="flex items-center gap-3 rounded-[16px] border border-[#E7EEF5] bg-[#F8FBFD] p-4">
                {(selectedSource.logoUrl) && (
                  <img src={selectedSource.logoUrl} alt={selectedSource.ticker} className="h-10 w-10 rounded-[12px] border border-white bg-white object-cover p-1 shadow-sm" />
                )}
                <div>
                  <p className="text-[15px] font-semibold text-[#0F1728]">{selectedSource.companyName}</p>
                  <p className="text-[12px] text-[#98A2B3]">{selectedSource.ticker}</p>
                </div>
              </div>

              {/* O que mudou */}
              {sd && (
                <div className="rounded-[16px] border border-[#E7EEF5] bg-white p-4 space-y-3">
                  <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-[#98A2B3]">O que mudou</p>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-[11px] text-[#98A2B3]">Pilar afetado</p>
                      <p className="mt-0.5 text-[14px] font-semibold text-[#0F1728]">{sd.pillar}</p>
                    </div>
                    <div>
                      <p className="text-[11px] text-[#98A2B3]">Leitura atual</p>
                      <p className={`mt-0.5 text-[14px] font-semibold ${sd.catalogState === 'RISK' ? 'text-[#B54768]' : sd.catalogState === 'ATTENTION' ? 'text-[#B36A11]' : 'text-[#027A48]'}`}>
                        {stateLabel[sd.catalogState] ?? sd.catalogState}
                      </p>
                    </div>
                    <div>
                      <p className="text-[11px] text-[#98A2B3]">Score do pilar</p>
                      <p className="mt-0.5 text-[14px] font-semibold text-[#0F1728]">{sd.currentScore}<span className="text-[11px] font-normal text-[#98A2B3]">/100</span></p>
                    </div>
                    {sd.periodLabel && (
                      <div>
                        <p className="text-[11px] text-[#98A2B3]">Período analisado</p>
                        <p className="mt-0.5 text-[14px] font-semibold text-[#0F1728]">{sd.periodLabel}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* De onde veio */}
              <div className="rounded-[16px] border border-[#E7EEF5] bg-white p-4 space-y-3">
                <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-[#98A2B3]">De onde veio</p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-[11px] text-[#98A2B3]">Fonte</p>
                    <p className="mt-0.5 text-[14px] font-semibold text-[#0F1728]">{sd?.sourceName ?? selectedSource.source.name}</p>
                  </div>
                  <div>
                    <p className="text-[11px] text-[#98A2B3]">Documento</p>
                    <p className="mt-0.5 text-[14px] font-semibold text-[#0F1728]">{selectedSource.source.docLabel}</p>
                  </div>
                  {recencyLabel && (
                    <div>
                      <p className="text-[11px] text-[#98A2B3]">Dado coletado</p>
                      <p className="mt-0.5 text-[14px] font-semibold text-[#0F1728]">{recencyLabel}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-[11px] text-[#98A2B3]">Atualizado em</p>
                    <p className="mt-0.5 text-[14px] font-semibold text-[#0F1728]">{selectedSource.source.updatedAt}</p>
                  </div>
                </div>
                {selectedSource.source.url && (
                  <a href={selectedSource.source.url} className="mt-2 inline-flex items-center gap-1.5 text-[12px] font-medium text-[#0E9384] hover:text-[#0F1728]">
                    Ver documento externo <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                )}
              </div>

              {/* Nota educacional */}
              <p className="text-[11px] leading-5 text-[#98A2B3]">
                Este sinal é gerado automaticamente a partir de dados públicos (CVM, B3, RI). Não constitui recomendação de compra ou venda.
              </p>
            </div>
          );
        })()}
      </ExploreDrawer>

      {/* Volatility drawer */}
      <ExploreDrawer open={showVolatilityDetails} onClose={() => setShowVolatilityDetails(false)} title="Detalhes da volatilidade">
        <div className="space-y-4 text-sm text-foreground/80">
          <p>Volatilidade é a medida de quanto os preços oscilam em um período. Níveis mais altos indicam variações maiores no curto prazo.</p>
          <p>O score combina amplitude média de movimentos e dispersão diária, com referência à mediana dos últimos 12 meses.</p>
          <div>
            <p className="text-xs text-muted-foreground">Fontes e atualização</p>
            <p className="font-medium text-foreground">B3 . Atualização diária (D+1)</p>
          </div>
          <p className="text-xs text-muted-foreground">Este indicador é educacional e não representa recomendação de compra ou venda.</p>
        </div>
      </ExploreDrawer>
    </div>
  );
}

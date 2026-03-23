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

        <div className="relative px-7 pb-8 pt-5">
          <div className="mx-auto max-w-[1480px]">
            <header className="mb-5 space-y-2.5">
              <p className="text-[12px] font-medium uppercase tracking-[0.08em] text-[#98A2B3]">Explorar mercado</p>
              <div className="max-w-[700px] space-y-2.5">
                <h1 className="text-[34px] font-semibold leading-[38px] tracking-[-0.04em] text-[#0F1728]">Explorar</h1>
                <p className="text-[14px] leading-6 text-[#667085]">
                  Descubra empresas e movimentos com uma leitura guiada, priorizando o que merece abertura agora e deixando a exploração mais leve ao longo da página.
                </p>
              </div>
            </header>

            <div className="space-y-5">
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
      <ExploreDrawer open={!!selectedSource} onClose={() => setSelectedSource(null)} title="Detalhes da fonte">
        {selectedSource && (
          <div className="space-y-4 text-sm text-foreground/80">
            <div>
              <p className="text-xs text-muted-foreground">Fonte</p>
              <p className="font-medium text-foreground">{selectedSource.source.name}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Documento</p>
              <p className="font-medium text-foreground">{selectedSource.source.docLabel}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Data de referência</p>
              <p className="font-medium text-foreground">{selectedSource.source.updatedAt}</p>
            </div>
            {selectedSource.source.url && (
              <a href={selectedSource.source.url} className="inline-flex items-center gap-2 text-xs text-[#0E9384] hover:text-foreground">
                Ver documento externo
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
          </div>
        )}
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

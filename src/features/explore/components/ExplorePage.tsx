"use client";

import { useEffect, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { ExternalLink } from "lucide-react";
import { Sidebar } from "@/src/components/layout/Sidebar";
import { AppTopBar } from "@/src/components/layout/AppTopBar";
import { MainContent } from "@/src/components/layout/MainContent";
import { useExplore } from "../hooks/useExplore";
import { useCompanySearch } from "../hooks/useCompanySearch";
import { ExploreHighlightsSection } from "./ExploreHighlightsSection";
import { ExploreCompanyCatalog } from "./ExploreCompanyCatalog";
import { ExploreMarketContext } from "./ExploreMarketContext";
import { ExploreMovementsPanel } from "./ExploreMovementsPanel";
import { ExploreCompareBar } from "./ExploreCompareBar";
import { ExploreDrawer } from "./ExploreDrawer";
import type { CompanyCard } from "../interfaces";
import type { CompanySearchFilters, CompanySearchItem } from "../services/search.service";

/**
 * Mapeia query params do URL (snake_case do Luiz) para CompanySearchFilters (camelCase da API).
 */
function parseUrlFilters(params: URLSearchParams): CompanySearchFilters | null {
  const mapping: Record<string, keyof CompanySearchFilters> = {
    pl_min: "plMin",
    pl_max: "plMax",
    pvp_min: "pvpMin",
    pvp_max: "pvpMax",
    dy_min: "dyMin",
    dy_max: "dyMax",
    roe_min: "roeMin",
    roe_max: "roeMax",
    roic_min: "roicMin",
    margem_min: "margemMin",
    divida_ebitda_max: "dividaEbitdaMax",
    ev_ebitda_max: "evEbitdaMax",
    setor: "sector",
    query: "query",
  };

  const filters: CompanySearchFilters = {};
  let hasFilter = false;

  for (const [urlKey, filterKey] of Object.entries(mapping)) {
    const value = params.get(urlKey);
    if (value != null && value !== "") {
      hasFilter = true;
      if (filterKey === "sector" || filterKey === "query") {
        (filters as Record<string, unknown>)[filterKey] = value;
      } else {
        (filters as Record<string, unknown>)[filterKey] = Number(value);
      }
    }
  }

  return hasFilter ? filters : null;
}

/**
 * Converte CompanySearchItem da API em CompanyCard para o catálogo.
 */
/** Resolve métrica tentando chave snake_case e display name. */
function pick(m: Record<string, number>, ...keys: string[]): number | null {
  for (const k of keys) if (m[k] != null) return m[k];
  return null;
}

function mapSearchItemToCard(item: CompanySearchItem): CompanyCard {
  const m = item.metrics ?? {};
  return {
    name: item.companyName,
    ticker: item.ticker,
    sector: "—",
    size: "Grande",
    status: "Saudável",
    pillarsScores: [50, 50, 50, 50, 50],
    shortDiagnosis: "",
    freshnessStatus: "Atualizado",
    updatedAt: new Date().toISOString(),
    source: "API",
    highlightPillar: "Caixa",
    financials: {
      pl: pick(m, "pl", "P/L"),
      pvp: pick(m, "pvp", "P/VP"),
      dividendYield: pick(m, "dy", "Dividend Yield"),
      roe: pick(m, "roe", "ROE"),
      roic: pick(m, "roic", "ROIC"),
      margemLiquida: pick(m, "margem_liquida", "Margem Líquida"),
      margemEbitda: pick(m, "margem_ebitda", "Margem EBITDA"),
      dividaLiquidaEbitda: pick(m, "divida_ebitda", "Dívida Líquida/EBITDA"),
      evEbitda: pick(m, "ev_ebitda", "EV/EBITDA"),
      lpa: pick(m, "lpa", "LPA"),
    },
  };
}

export function ExplorePage() {
  const searchParams = useSearchParams();
  const companySearch = useCompanySearch();

  // Lê filtros do URL e dispara busca na API quando há params
  useEffect(() => {
    const urlFilters = parseUrlFilters(searchParams);
    if (urlFilters) {
      companySearch.search(urlFilters);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

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

  // Quando há resultados da API, mapeia para CompanyCard[]; senão usa mock local
  const hasApiResults = companySearch.items.length > 0 || companySearch.isLoading;
  const catalogCompanies = useMemo<CompanyCard[]>(() => {
    if (hasApiResults) return companySearch.items.map(mapSearchItemToCard);
    return filteredCompanies;
  }, [hasApiResults, companySearch.items, filteredCompanies]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Sidebar currentPage="explorar" />

      <AppTopBar sidebarOffsetClassName="left-0 xl:left-[240px]" />

      <MainContent className="relative overflow-hidden pt-20">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-[18%] top-0 h-80 w-80 rounded-full bg-[radial-gradient(circle,rgba(91,141,239,0.10)_0%,rgba(91,141,239,0)_72%)]" />
          <div className="absolute right-[10%] top-40 h-72 w-72 rounded-full bg-[radial-gradient(circle,rgba(18,165,148,0.08)_0%,rgba(18,165,148,0)_72%)]" />
        </div>

        <div className="relative px-6 pb-8 pt-5">
          <div className="mx-auto max-w-[1380px]">
            <header className="mb-4 space-y-2">
              <p className="text-[12px] font-medium uppercase tracking-[0.08em] text-muted-foreground">Explorar mercado</p>
              <div className="max-w-[640px] space-y-2">
                <h1 className="text-[30px] font-semibold leading-[34px] tracking-[-0.04em] text-foreground">Explorar</h1>
                <p className="text-[13px] leading-6 text-muted-foreground">
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
                  isLoading={isLoading || companySearch.isLoading}
                  filteredCompanies={catalogCompanies}
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
      </MainContent>

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
              <a href={selectedSource.source.url} className="inline-flex items-center gap-2 text-xs text-brand hover:text-foreground">
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

"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ExternalLink, Globe, Newspaper, Search } from "lucide-react";
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
import { useFavorites } from "@/src/features/favoritas";
import { useSavedSearches } from "@/src/features/saved-searches";

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
 * Serializa CompanySearchFilters + page para query string do URL /explorar.
 */
function buildExploreUrl(filters: CompanySearchFilters, page: number): string {
  const params = new URLSearchParams();
  params.set("tab", "busca");
  if (filters.query)              params.set("query",             filters.query);
  if (filters.sector)             params.set("setor",             filters.sector);
  if (filters.plMin        != null) params.set("pl_min",          String(filters.plMin));
  if (filters.plMax        != null) params.set("pl_max",          String(filters.plMax));
  if (filters.pvpMin       != null) params.set("pvp_min",         String(filters.pvpMin));
  if (filters.pvpMax       != null) params.set("pvp_max",         String(filters.pvpMax));
  if (filters.evEbitdaMax  != null) params.set("ev_ebitda_max",   String(filters.evEbitdaMax));
  if (filters.dyMin        != null) params.set("dy_min",          String(filters.dyMin));
  if (filters.dyMax        != null) params.set("dy_max",          String(filters.dyMax));
  if (filters.roeMin       != null) params.set("roe_min",         String(filters.roeMin));
  if (filters.roeMax       != null) params.set("roe_max",         String(filters.roeMax));
  if (filters.roicMin      != null) params.set("roic_min",        String(filters.roicMin));
  if (filters.margemMin    != null) params.set("margem_min",      String(filters.margemMin));
  if (filters.dividaEbitdaMax != null) params.set("divida_ebitda_max", String(filters.dividaEbitdaMax));
  if (page > 0)                   params.set("page",              String(page));
  const qs = params.toString();
  return `/explorar?${qs}`;
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
      price: pick(m, "price", "Preço"),
    },
  };
}

export function ExplorePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const companySearch = useCompanySearch();
  const favorites = useFavorites();
  const savedSearches = useSavedSearches();
  const [apiTriggered, setApiTriggered] = useState(false);
  // Tab padrão: "mercado", mas troca para "busca" se URL tem filtros/tab=busca
  const initialTab = (() => {
    const tabParam = searchParams.get("tab");
    if (tabParam === "busca" || tabParam === "noticias") return tabParam;
    const urlFilters = parseUrlFilters(searchParams);
    const page = parseInt(searchParams.get("page") ?? "0", 10) || 0;
    if (urlFilters || page > 0) return "busca" as const;
    return "mercado" as const;
  })();
  const [sectionTab, setSectionTab] = useState<"busca" | "mercado" | "noticias">(initialTab);

  // Dispara busca sempre no mount — sem filtros traz todos os resultados
  useEffect(() => {
    const urlFilters = parseUrlFilters(searchParams);
    const page = parseInt(searchParams.get("page") ?? "0", 10) || 0;
    setApiTriggered(true);
    companySearch.search({ ...(urlFilters ?? {}), page });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

  // Usa resultados da API quando disponíveis; fallback para mock local
  const isSearchActive = apiTriggered && companySearch.items.length > 0;
  const catalogCompanies = useMemo<CompanyCard[]>(() => {
    if (isSearchActive) return companySearch.items.map(mapSearchItemToCard);
    return filteredCompanies;
  }, [isSearchActive, companySearch.items, filteredCompanies]);

  // Wrappers que sincronizam paginação e filtros com o URL (para compartilhamento)
  function handleGoToPage(page: number) {
    router.push(buildExploreUrl(companySearch.filters, page), { scroll: false });
    companySearch.goToPage(page);
  }

  const urlDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleUpdateFilters = useCallback(
    (partial: Partial<CompanySearchFilters>) => {
      // Atualiza filtros imediatamente (hook faz debounce interno da API)
      companySearch.updateFilters(partial);

      // Debounce da URL — sincroniza endereço após o usuário parar de digitar
      if (urlDebounceRef.current) clearTimeout(urlDebounceRef.current);
      urlDebounceRef.current = setTimeout(() => {
        const merged = { ...companySearch.filters, ...partial };
        router.push(buildExploreUrl(merged, 0), { scroll: false });
      }, 800);
    },
    [companySearch, router],
  );

  function handleClearFilters() {
    if (urlDebounceRef.current) clearTimeout(urlDebounceRef.current);
    router.push("/explorar", { scroll: false });
    companySearch.clearFilters();
  }

  function handleLoadSavedSearch(filters: CompanySearchFilters) {
    router.push(buildExploreUrl(filters, 0), { scroll: false });
    companySearch.search({ ...filters, page: 0 });
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Sidebar currentPage="explorar" />

      <AppTopBar sidebarOffsetClassName="left-0 xl:left-[240px]" />

      <MainContent className="relative overflow-hidden pt-20">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-[18%] top-0 h-80 w-80 rounded-full bg-[radial-gradient(circle,rgba(91,141,239,0.10)_0%,rgba(91,141,239,0)_72%)]" />
          <div className="absolute right-[10%] top-40 h-72 w-72 rounded-full bg-[radial-gradient(circle,rgba(18,165,148,0.08)_0%,rgba(18,165,148,0)_72%)]" />
        </div>

        <div className="relative px-6 pb-20 pt-5">
          <div className="mx-auto max-w-[1380px]">
            <header className="mb-4 space-y-2">
              <p className="text-[12px] font-medium uppercase text-muted-foreground">Explorar mercado</p>
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

              {/* ── Navegação entre seções ── */}
              <div className="pt-6">
                <div className="mb-6 flex gap-8 border-b border-border">
                  {(
                    [
                      { key: "mercado",    label: "Contexto de mercado", icon: Globe },
                      { key: "busca",      label: "Buscar ações",        icon: Search },
                      { key: "noticias",   label: "Notícias",            icon: Newspaper },
                    ] as const
                  ).map(({ key, label, icon: Icon }) => (
                    <button
                      key={key}
                      onClick={() => setSectionTab(key)}
                      className={`relative flex items-center gap-2 pb-4 text-sm font-medium transition-colors active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 ${
                        sectionTab === key
                          ? "text-foreground"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      {label}
                      <span className={`absolute inset-x-0 bottom-0 h-0.5 rounded-full bg-brand transition-opacity duration-200 ${sectionTab === key ? "opacity-100" : "opacity-0"}`} />
                    </button>
                  ))}
                </div>

                {sectionTab === "busca" && (
                  <div className="space-y-5">
                    <div>
                      <p className="text-[12px] font-medium uppercase text-muted-foreground">Catálogo de empresas</p>
                      <h2 className="mt-2 text-[24px] font-semibold leading-7 tracking-[-0.03em] text-foreground">Buscar ações</h2>
                    </div>
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
                    isSearchActive={isSearchActive}
                    totalItems={companySearch.totalItems}
                    totalPages={companySearch.totalPages}
                    page={companySearch.page}
                    companySearchFilters={companySearch.filters}
                    goToPage={handleGoToPage}
                    updateFilters={handleUpdateFilters}
                    clearApiFilters={handleClearFilters}
                    favoriteTickers={favorites.tickers}
                    onToggleFavorite={favorites.toggle}
                    savedSearches={savedSearches.items}
                    onSaveSearch={savedSearches.create}
                    onDeleteSavedSearch={savedSearches.remove}
                    onLoadSavedSearch={handleLoadSavedSearch}
                  />
                  </div>
                )}

                {sectionTab === "mercado" && (
                  <ExploreMarketContext
                    isLoading={isLoading}
                    showVolatilityInfo={showVolatilityInfo}
                    indexCards={indexCards}
                    volatility={volatility}
                    volatilityIsStale={volatilityIsStale}
                    setShowVolatilityInfo={setShowVolatilityInfo}
                    setShowVolatilityDetails={setShowVolatilityDetails}
                  />
                )}

                {sectionTab === "noticias" && (
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
                )}
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

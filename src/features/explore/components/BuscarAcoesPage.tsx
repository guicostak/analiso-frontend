"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ExternalLink } from "lucide-react";
import { Sidebar } from "@/src/components/layout/Sidebar";
import { AppTopBar } from "@/src/components/layout/AppTopBar";
import { MainContent } from "@/src/components/layout/MainContent";
import { useExplore } from "../hooks/useExplore";
import { useCompanySearch } from "../hooks/useCompanySearch";
import { ExploreCompanyCatalog } from "./ExploreCompanyCatalog";
import { ExploreCompareBar } from "./ExploreCompareBar";
import { ExploreDrawer } from "./ExploreDrawer";
import type { CompanyCard } from "../interfaces";
import type { CompanySearchFilters, CompanySearchItem } from "../services/search.service";
import { useFavorites } from "@/src/features/favoritas";
import { useSavedSearches } from "@/src/features/saved-searches";

/**
 * Mapeia query params do URL (snake_case) para CompanySearchFilters (camelCase).
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
 * Serializa CompanySearchFilters + page para query string do URL /buscar.
 */
function buildBuscarUrl(filters: CompanySearchFilters, page: number): string {
  const params = new URLSearchParams();
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
  return `/buscar${qs ? `?${qs}` : ""}`;
}

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
    logoUrl: item.logoUrl ?? undefined,
    sector: item.sectorLabel ?? "—",
    size: "Grande",
    status: (item.status as CompanyCard["status"]) ?? "Atenção",
    pillarsScores: [],
    headline: item.headline ?? "",
    shortDiagnosis: item.supportLine ?? "",
    whyOpen: item.whyOpen ?? null,
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

export function BuscarAcoesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const companySearch = useCompanySearch();
  const favorites = useFavorites();
  const savedSearches = useSavedSearches();
  const [apiTriggered, setApiTriggered] = useState(false);

  const {
    getCompanyLogo,
    setSelectedSource,
    selectedSource,
    selectedEntryPoints,
    compareTickers,
    searchQuery,
    appliedChips,
    showAdvancedFilters,
    filters,
    isLoading,
    allCompanies,
    filteredCompanies,
    staleCount,
    thesisCollections,
    setSearchQuery,
    setFilters,
    setShowAdvancedFilters,
    toggleEntryPoint,
    clearEntryPoints,
    clearPreset,
    toggleCompare,
    resetFilters,
  } = useExplore();

  // Dispara busca sempre no mount
  useEffect(() => {
    const urlFilters = parseUrlFilters(searchParams);
    const page = parseInt(searchParams.get("page") ?? "0", 10) || 0;
    setApiTriggered(true);
    companySearch.search({ ...(urlFilters ?? {}), page });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const isSearchActive = apiTriggered && companySearch.items.length > 0;

  const exploreLookup = useMemo<Map<string, CompanyCard>>(() => {
    const map = new Map<string, CompanyCard>();
    for (const c of allCompanies) map.set(c.ticker, c);
    return map;
  }, [allCompanies]);

  const catalogCompanies = useMemo<CompanyCard[]>(() => {
    if (isSearchActive) {
      return companySearch.items.map((item) => {
        const base = mapSearchItemToCard(item);
        const enriched = exploreLookup.get(item.ticker);
        if (enriched) {
          return {
            ...base,
            status: enriched.status,
            sector: enriched.sector,
            highlightPillar: enriched.highlightPillar,
            headline: enriched.headline,
            shortDiagnosis: enriched.shortDiagnosis,
            whyOpen: enriched.whyOpen,
            freshnessStatus: enriched.freshnessStatus,
            updatedAt: enriched.updatedAt,
            logoUrl: base.logoUrl ?? enriched.logoUrl,
          };
        }
        return base;
      });
    }
    return filteredCompanies;
  }, [isSearchActive, companySearch.items, filteredCompanies, exploreLookup]);

  function handleGoToPage(page: number) {
    router.push(buildBuscarUrl(companySearch.filters, page), { scroll: false });
    companySearch.goToPage(page);
  }

  const urlDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleUpdateFilters = useCallback(
    (partial: Partial<CompanySearchFilters>) => {
      companySearch.updateFilters(partial);
      if (urlDebounceRef.current) clearTimeout(urlDebounceRef.current);
      urlDebounceRef.current = setTimeout(() => {
        const merged = { ...companySearch.filters, ...partial };
        router.push(buildBuscarUrl(merged, 0), { scroll: false });
      }, 800);
    },
    [companySearch, router],
  );

  function handleClearFilters() {
    if (urlDebounceRef.current) clearTimeout(urlDebounceRef.current);
    router.push("/buscar", { scroll: false });
    companySearch.clearFilters();
  }

  function handleLoadSavedSearch(filters: CompanySearchFilters) {
    router.push(buildBuscarUrl(filters, 0), { scroll: false });
    companySearch.search({ ...filters, page: 0 });
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Sidebar currentPage="buscar" />

      <AppTopBar sidebarOffsetClassName="left-0 xl:left-[240px]" />

      <MainContent className="relative overflow-hidden pt-20">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-[18%] top-0 h-80 w-80 rounded-full bg-[radial-gradient(circle,rgba(91,141,239,0.10)_0%,rgba(91,141,239,0)_72%)]" />
          <div className="absolute right-[10%] top-40 h-72 w-72 rounded-full bg-[radial-gradient(circle,rgba(18,165,148,0.08)_0%,rgba(18,165,148,0)_72%)]" />
        </div>

        <div className="relative px-6 pb-20 pt-5">
          <div className="mx-auto max-w-[1380px]">
            <header className="mb-4 space-y-2">
              <p className="text-[12px] font-medium uppercase text-muted-foreground">Catálogo de empresas</p>
              <div className="max-w-[640px] space-y-2">
                <h1 className="text-[30px] font-semibold leading-[34px] tracking-[-0.04em] text-foreground">Buscar ações</h1>
                <p className="text-[13px] leading-6 text-muted-foreground">
                  Encontre empresas com filtros avançados e descubra oportunidades de investimento.
                </p>
              </div>
            </header>

            <div className="space-y-4">
              <div>
                <ExploreCompanyCatalog
                  isLoading={isLoading || companySearch.isLoading}
                  filteredCompanies={catalogCompanies}
                  filters={filters}
                  searchQuery={searchQuery}
                  showAdvancedFilters={showAdvancedFilters}
                  activePreset={null}
                  appliedChips={appliedChips}
                  showStaleBanner={false}
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
    </div>
  );
}

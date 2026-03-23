"use client";

/**
 * useExplore
 *
 * Centraliza todo o estado e a lógica da página Explore:
 *  - Filtros de empresas (setor, status, pilar, tamanho, frescor, ordenação)
 *  - Controle de tabs de movimentos (altas / baixas / negociadas)
 *  - Seleção de tickers para comparação
 *  - Aplicação e limpeza de preset de destaque
 *  - Controle de painéis de UI (drawer de fonte, volatilidade, contexto)
 *  - Dados derivados (empresas filtradas, destaques ordenados)
 *
 * O componente ExplorePage só precisa destructurar o retorno e renderizar o JSX.
 */

import { useCallback, useMemo, useState } from "react";

import {
  companies,
  highlights,
  movers as mockMovers,
  indexCards,
  volatility,
  thesisCollections,
  sectorCollections,
  pillars,
  movementInsights,
  getCompanyLogo,
  getPresetChipLabels,
  getSortedHighlights,
  pillarLabelMap,
  mapMoversFromInsights,
} from "../services";

import type { ExploreMovementInsightsDto, ExploreResponse } from "../services";

import type {
  MoverType,
  HighlightItem,
  HighlightPreset,
  HighlightScopeLabel,
  CompanyCard,
  Filters,
  FilterKey,
  IndexCard,
  MoverRow,
  MovementInsight,
  Volatility,
} from "../interfaces";

// ─── Tipo de retorno do hook ──────────────────────────────────────────────────

export interface UseExploreReturn {
  // Estado da UI
  selectedTab:           MoverType;
  selectedEntryPoints:   string[];
  compareTickers:        string[];
  searchQuery:           string;
  summaryScope:          HighlightScopeLabel;
  summaryState:          "loading" | "ready" | "empty" | "error";
  activePreset:          HighlightPreset | null;
  appliedChips:          string[];
  selectedSource:        HighlightItem | null;
  showAllHighlights:     boolean;
  showAdvancedFilters:   boolean;
  showAllMovements:      boolean;
  showVolatilityInfo:    boolean;
  showVolatilityDetails: boolean;
  showContextPanel:      boolean;
  filters:               Filters;
  isLoading:             boolean;

  // Dados derivados
  filteredCompanies: CompanyCard[];
  sortedHighlights:  HighlightItem[];
  staleCount:        number;
  showStaleBanner:   boolean;
  hasSectorSelected: boolean;
  hasWatchlist:      boolean;
  volatilityIsStale: boolean;

  // Dados estáticos expostos ao componente
  indexCards:          IndexCard[];
  movers:              MoverRow[];
  movementInsights:    Record<string, MovementInsight>;
  movementInsightsDto: ExploreMovementInsightsDto | null;
  movementSummary:     ExploreMovementInsightsDto['summary'];
  movementDominant:    ExploreMovementInsightsDto['dominantInsight'];
  volatility:          Volatility;
  thesisCollections:  string[];
  sectorCollections:  string[];
  pillars:            readonly string[];
  highlights:         HighlightItem[];

  // Helpers expostos
  getCompanyLogo: (ticker: string) => string | undefined;

  // Ações
  setSelectedTab:         (tab: MoverType) => void;
  setSearchQuery:         (q: string) => void;
  setSummaryScope:        (scope: HighlightScopeLabel) => void;
  setSummaryState:        (state: "loading" | "ready" | "empty" | "error") => void;
  setSelectedSource:      (item: HighlightItem | null) => void;
  setShowAllHighlights:   (v: boolean | ((prev: boolean) => boolean)) => void;
  setShowAdvancedFilters: (v: boolean | ((prev: boolean) => boolean)) => void;
  setShowAllMovements:    (v: boolean | ((prev: boolean) => boolean)) => void;
  setShowVolatilityInfo:  (v: boolean | ((prev: boolean) => boolean)) => void;
  setShowVolatilityDetails: (v: boolean) => void;
  setShowContextPanel:    (v: boolean | ((prev: boolean) => boolean)) => void;
  setFilters:             (updater: Filters | ((prev: Filters) => Filters)) => void;
  toggleEntryPoint:       (entry: string) => void;
  clearEntryPoints:       () => void;
  applyHighlightPreset:   (preset: HighlightPreset) => void;
  clearPreset:            () => void;
  toggleCompare:          (ticker: string) => void;
  resetFilters:           () => void;
}

// ─── Valores iniciais ─────────────────────────────────────────────────────────

const DEFAULT_FILTERS: Filters = {
  sector:    "Todos",
  size:      "Todos",
  status:    "Todos",
  freshness: "Todos",
  pillar:    "Todos",
  sort:      "Mais atualizadas",
};

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useExplore(): UseExploreReturn {
  const [selectedTab,           setSelectedTab]           = useState<MoverType>("altas");
  const [selectedEntryPoints,   setSelectedEntryPoints]   = useState<string[]>([]);
  const [compareTickers,        setCompareTickers]        = useState<string[]>([]);
  const [searchQuery,           setSearchQuery]           = useState("");
  const [summaryScope,          setSummaryScope]          = useState<HighlightScopeLabel>("Mercado");
  const [summaryState,          setSummaryState]          = useState<"loading" | "ready" | "empty" | "error">("ready");
  const [activePreset,          setActivePreset]          = useState<HighlightPreset | null>(null);
  const [appliedChips,          setAppliedChips]          = useState<string[]>([]);
  const [selectedSource,        setSelectedSource]        = useState<HighlightItem | null>(null);
  const [showAllHighlights,     setShowAllHighlights]     = useState(false);
  const [showAdvancedFilters,   setShowAdvancedFilters]   = useState(false);
  const [showAllMovements,      setShowAllMovements]      = useState(false);
  const [showVolatilityInfo,    setShowVolatilityInfo]    = useState(false);
  const [showVolatilityDetails, setShowVolatilityDetails] = useState(false);
  const [showContextPanel,      setShowContextPanel]      = useState(false);
  const [filters,               setFilters]               = useState<Filters>(DEFAULT_FILTERS);

  const isLoading = false; // pronto para ligar quando vier API

  // Dados da API (null até haver chamada HTTP real)
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
  const exploreData = null as ExploreResponse | null;

  // ─── Dados derivados ───────────────────────────────────────────────────────

  const filteredCompanies = useMemo<CompanyCard[]>(() => {
    return companies
      .filter((company) => {
        if (searchQuery) {
          const query = searchQuery.toLowerCase();
          if (
            !company.name.toLowerCase().includes(query) &&
            !company.ticker.toLowerCase().includes(query)
          ) {
            return false;
          }
        }

        if (activePreset) {
          const pillarMatch = company.highlightPillar === pillarLabelMap[activePreset.pillar];
          if (!pillarMatch) return false;
          if (activePreset.severity === "forte"    && company.status !== "Risco")    return false;
          if (activePreset.severity === "moderada" && company.status === "Saudável") return false;
        }

        if (filters.sector    !== "Todos" && company.sector           !== filters.sector)    return false;
        if (filters.size      !== "Todos" && company.size             !== filters.size)      return false;
        if (filters.status    !== "Todos" && company.status           !== filters.status)    return false;
        if (filters.freshness !== "Todos" && company.freshnessStatus  !== filters.freshness) return false;
        if (filters.pillar    !== "Todos" && company.highlightPillar  !== filters.pillar)    return false;

        return true;
      })
      .sort((a, b) => {
        if (filters.sort === "Mais relevantes para este destaque") {
          if (a.status === "Risco" && b.status !== "Risco") return -1;
          if (b.status === "Risco" && a.status !== "Risco") return 1;
          return a.updatedAt < b.updatedAt ? 1 : -1;
        }
        if (filters.sort === "Mais atualizadas")  return a.updatedAt < b.updatedAt ? 1 : -1;
        if (filters.sort === "Mudanças recentes") return a.status === "Risco" ? -1 : 1;
        if (filters.sort === "Maior consistência") return a.status === "Saudável" ? -1 : 1;
        return 0;
      });
  }, [filters, searchQuery, activePreset]);

  const sortedHighlights = useMemo<HighlightItem[]>(
    () => getSortedHighlights(highlights),
    [],
  );

  const movers = useMemo<MoverRow[]>(() => {
    const dto = exploreData?.movementInsights ?? null;
    if (dto?.groups) {
      const highs      = mapMoversFromInsights(dto, 'highs');
      const lows       = mapMoversFromInsights(dto, 'lows');
      const mostTraded = mapMoversFromInsights(dto, 'mostTraded');
      return [...highs, ...lows, ...mostTraded];
    }
    return mockMovers;
  }, [exploreData]);

  const staleCount        = filteredCompanies.filter((c) => c.freshnessStatus === "Antigo").length;
  const showStaleBanner   = staleCount >= 2;
  const hasSectorSelected = filters.sector !== "Todos";
  const hasWatchlist      = false;
  const volatilityIsStale = false;

  // ─── Ações ─────────────────────────────────────────────────────────────────

  const toggleEntryPoint = useCallback((entry: string) => {
    setSelectedEntryPoints((prev) =>
      prev.includes(entry) ? prev.filter((item) => item !== entry) : [...prev, entry],
    );
    if (entry.startsWith("Setor: "))
      setFilters((prev) => ({ ...prev, sector: entry.replace("Setor: ", "") }));
    if (entry === "Dados atualizados")
      setFilters((prev) => ({ ...prev, freshness: "Atualizado" }));
  }, []);

  const clearEntryPoints = useCallback(() => {
    setSelectedEntryPoints([]);
    setFilters((prev) => ({ ...prev, sector: "Todos", freshness: "Todos" }));
  }, []);

  const applyHighlightPreset = useCallback((preset: HighlightPreset) => {
    setActivePreset(preset);
    setAppliedChips(getPresetChipLabels(preset));
    setSummaryScope(
      preset.scope === "mercado"
        ? "Mercado"
        : preset.scope === "setor"
        ? "Setor"
        : "Minha watchlist",
    );
    setFilters((prev) => ({
      ...prev,
      sort:   "Mais relevantes para este destaque",
      pillar: pillarLabelMap[preset.pillar],
    }));
  }, []);

  const clearPreset = useCallback(() => {
    setActivePreset(null);
    setAppliedChips([]);
    setFilters((prev) => ({ ...prev, sort: "Mais atualizadas", pillar: "Todos" }));
  }, []);

  const toggleCompare = useCallback((ticker: string) => {
    setCompareTickers((prev) => {
      if (prev.includes(ticker)) return prev.filter((item) => item !== ticker);
      if (prev.length >= 4)      return prev;
      return [...prev, ticker];
    });
  }, []);

  const resetFilters = useCallback(() => {
    setSearchQuery("");
    setActivePreset(null);
    setAppliedChips([]);
    setSelectedEntryPoints([]);
    setFilters(DEFAULT_FILTERS);
  }, []);

  // ─── Retorno ───────────────────────────────────────────────────────────────

  return {
    // Estado da UI
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

    // Dados derivados
    filteredCompanies,
    sortedHighlights,
    staleCount,
    showStaleBanner,
    hasSectorSelected,
    hasWatchlist,
    volatilityIsStale,

    // Dados estáticos
    indexCards,
    movers,
    movementInsights,
    movementInsightsDto: exploreData?.movementInsights ?? null,
    movementSummary:     exploreData?.movementInsights?.summary ?? null,
    movementDominant:    exploreData?.movementInsights?.dominantInsight ?? null,
    volatility,
    thesisCollections,
    sectorCollections,
    pillars,
    highlights,

    // Helpers
    getCompanyLogo,

    // Ações
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
  };
}

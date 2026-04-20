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

import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import { normalizeApiError } from "@/src/lib/errors";
import { useAuth } from "../../auth/AuthContext";

import {
  pillars,
  movementInsights,
  getCompanyLogo,
  getPresetChipLabels,
  getSortedHighlights,
  pillarLabelMap,
  mapMoversFromInsights,
  mapIndexCardDto,
  mapMarketContextDetailToVolatility,
  mapCatalogItemDto,
  mapCurationItemToHighlight,
  getExplore,
} from "../services";

import type { ExploreMovementInsightsDto, ExploreMarketContextDto, ExploreResponse } from "../services";

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

import type { MarketExtras, MarketTimeRange } from "../interfaces/market.interfaces";
import { mapMarketExtras } from "../mappers/market.mappers";

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
  allCompanies:      CompanyCard[];
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
  marketContextDto:    ExploreMarketContextDto | null;
  movementInsightsDto: ExploreMovementInsightsDto | null;
  movementSummary:     ExploreMovementInsightsDto['summary'];
  movementDominant:    ExploreMovementInsightsDto['dominantInsight'];
  volatility:          Volatility;
  thesisCollections:  string[];
  sectorCollections:  string[];
  pillars:            readonly string[];
  highlights:         HighlightItem[];
  referenceDate:      string | null;

  // Market extras (Fase 2) — novos blocos da aba Contexto
  timeRange:     MarketTimeRange;
  marketExtras:  MarketExtras | null;

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

  // Market extras
  setTimeRange:           (range: MarketTimeRange) => void;
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
  const { token, isLoading: authLoading } = useAuth();

  const [selectedTab,           setSelectedTab]           = useState<MoverType>("altas");
  const [selectedEntryPoints,   setSelectedEntryPoints]   = useState<string[]>([]);
  const [compareTickers,        setCompareTickers]        = useState<string[]>([]);
  const [searchQuery,           setSearchQuery]           = useState("");
  const [summaryScope,          setSummaryScope]          = useState<HighlightScopeLabel>("Mercado");
  const [summaryState,          setSummaryState]          = useState<"loading" | "ready" | "empty" | "error">("loading");
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
  const [isLoading,             setIsLoading]             = useState(true);
  const [exploreData,           setExploreData]           = useState<ExploreResponse | null>(null);
  const [timeRange,             setTimeRange]             = useState<MarketTimeRange>("1D");

  useEffect(() => {
    // Aguarda o AuthContext terminar de restaurar a sessão antes de chamar a API
    if (authLoading) return;

    setIsLoading(true);
    setSummaryState("loading");
    getExplore(token, { range: timeRange })
      .then((data) => {
        setExploreData(data);
        setSummaryState("ready");
      })
      .catch((err) => {
        console.error("[useExplore] Falha ao carregar /api/explore:", err);
        const { message } = normalizeApiError(err);
        setSummaryState("error");
        toast.error(message);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [token, authLoading, timeRange]);

  // ─── Dados derivados ───────────────────────────────────────────────────────

  const allCompanies = useMemo<CompanyCard[]>(() => {
    if (exploreData?.catalogItems?.length) {
      return exploreData.catalogItems.map(mapCatalogItemDto);
    }
    return [];
  }, [exploreData]);

  const resolvedHighlights = useMemo<HighlightItem[]>(() => {
    const items = exploreData?.heroCuration?.items;
    if (items?.length) return items.map(mapCurationItemToHighlight);
    return [];
  }, [exploreData]);

  const resolvedThesisCollections = useMemo<string[]>(() => {
    if (exploreData?.catalogItems?.length) {
      const labels = exploreData.catalogItems
        .map(i => i.thesisLabel)
        .filter(Boolean);
      return [...new Set(labels)];
    }
    return [];
  }, [exploreData]);

  const resolvedSectorCollections = useMemo<string[]>(() => {
    if (exploreData?.catalogItems?.length) {
      const sectors = exploreData.catalogItems
        .map(i => i.sectorLabel)
        .filter((s): s is string => !!s);
      return [...new Set(sectors)].sort();
    }
    return [];
  }, [exploreData]);

  const filteredCompanies = useMemo<CompanyCard[]>(() => {
    return allCompanies
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
  }, [allCompanies, filters, searchQuery, activePreset]);

  const sortedHighlights = useMemo<HighlightItem[]>(
    () => getSortedHighlights(resolvedHighlights),
    [resolvedHighlights],
  );

  const movers = useMemo<MoverRow[]>(() => {
    const dto = exploreData?.movementInsights ?? null;
    if (dto?.groups) {
      const highs      = mapMoversFromInsights(dto, 'highs');
      const lows       = mapMoversFromInsights(dto, 'lows');
      const mostTraded = mapMoversFromInsights(dto, 'mostTraded');
      return [...highs, ...lows, ...mostTraded];
    }
    return [];
  }, [exploreData]);

  const resolvedIndexCards = useMemo<IndexCard[]>(() => {
    if (exploreData?.indexCards?.length) {
      return exploreData.indexCards.map(mapIndexCardDto);
    }
    return [];
  }, [exploreData]);

  const resolvedVolatility = useMemo<Volatility>(() => {
    const detail = exploreData?.marketContext?.detail;
    if (detail) return mapMarketContextDetailToVolatility(detail);
    return { value: 0, label: "Moderada", updatedAt: "", source: "" };
  }, [exploreData]);

  const resolvedMarketExtras = useMemo<MarketExtras | null>(() => {
    return mapMarketExtras(exploreData?.marketExtras);
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
    allCompanies,
    filteredCompanies,
    sortedHighlights,
    staleCount,
    showStaleBanner,
    hasSectorSelected,
    hasWatchlist,
    volatilityIsStale,

    // Dados estáticos
    indexCards:          resolvedIndexCards,
    movers,
    movementInsights,
    marketContextDto:    exploreData?.marketContext ?? null,
    movementInsightsDto: exploreData?.movementInsights ?? null,
    movementSummary:     exploreData?.movementInsights?.summary ?? null,
    movementDominant:    exploreData?.movementInsights?.dominantInsight ?? null,
    volatility:          resolvedVolatility,
    thesisCollections:   resolvedThesisCollections,
    sectorCollections:   resolvedSectorCollections,
    pillars,
    highlights:          resolvedHighlights,
    referenceDate:       exploreData?.referenceDate ?? null,

    // Market extras (Fase 2)
    timeRange,
    marketExtras:        resolvedMarketExtras,

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

    // Market extras
    setTimeRange,
  };
}

"use client";

/**
 * useWatchlist
 *
 * Centraliza todo o estado e a lógica da página de Watchlist:
 *  - Busca de dados via API (modo UPDATES e LIST em paralelo)
 *  - Filtros do feed (período, pilar, severidade, fonte)
 *  - Filtros da lista de empresas (busca, ordenação, densidade, etc.)
 *  - Controle de tickers vistos/não vistos
 *  - Cálculos derivados (listas filtradas e ordenadas)
 *  - Navegação para página de empresa
 *
 * O componente WatchlistPage só precisa destructurar o retorno
 * e renderizar o JSX.
 */

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { useAuth } from "@/src/features/auth/AuthContext";
import {
  getWatchlist,
  mapPriorityItemDto,
  mapFeedItemDto,
  mapListItemDto,
  mapAlertItemDto,
  sourceByTicker,
  getStatusFromScores,
  type WatchlistHeaderDto,
  type WatchlistStateBlockDto,
  type WatchlistPrioritySectionDto,
  type WatchlistQuickOverviewDto,
  type WatchlistSessionClosingDto,
} from "../services";

import type {
  Pillar,
  FeedSeverity,
  FeedSource,
  FeedRangeOrAll,
  WatchlistStatus,
  WatchlistDensity,
  WatchlistSortBy,
  WatchlistFilters,
  PriorityItem,
  FeedItem,
  WatchlistCompany,
  AlertItem,
} from "../interfaces";

// ─── Tipo de retorno do hook ──────────────────────────────────────────────────

export interface UseWatchlistReturn {
  // Estado do feed
  activeTab:               "updates" | "list";
  activeRange:             FeedRangeOrAll;
  activePillars:           Pillar[];
  severityFilter:          "Todos" | FeedSeverity;
  sourceFilter:            "Todas" | FeedSource;
  showAdvancedFeedFilters: boolean;

  // Estado da lista de empresas
  listSearch:        string;
  sortBy:            WatchlistSortBy;
  filters:           WatchlistFilters;
  showListFilters:   boolean;
  listSeverityFilter: "Todos" | WatchlistStatus;
  listSourceFilter:  "Todas" | FeedSource;
  listDensity:       WatchlistDensity;
  unseenOnly:        boolean;
  seenTickers:       string[];
  showAlertActionOnly: boolean;
  expandedTicker:    string | null;
  quickActionsTicker: string | null;
  uiState:           "ready" | "loading" | "empty";

  // Dados derivados
  filteredFeedItems:  FeedItem[];
  filteredCompanies:  WatchlistCompany[];
  companies:          WatchlistCompany[];
  priorityItems:      PriorityItem[];
  alerts:             AlertItem[];

  // Ações do feed
  setActiveTab:               (tab: "updates" | "list") => void;
  setActiveRange:             (range: FeedRangeOrAll) => void;
  togglePillar:               (pillar: Pillar) => void;
  setSeverityFilter:          (f: "Todos" | FeedSeverity) => void;
  setSourceFilter:            (f: "Todas" | FeedSource) => void;
  setShowAdvancedFeedFilters: (show: boolean) => void;

  // Ações da lista
  setListSearch:        (q: string) => void;
  setSortBy:            (s: WatchlistSortBy) => void;
  setFilters:           (f: WatchlistFilters) => void;
  setShowListFilters:   (show: boolean) => void;
  setListSeverityFilter:(f: "Todos" | WatchlistStatus) => void;
  setListSourceFilter:  (f: "Todas" | FeedSource) => void;
  setListDensity:       (d: WatchlistDensity) => void;
  setUnseenOnly:        (v: boolean) => void;
  toggleSeenTicker:     (ticker: string) => void;
  setShowAlertActionOnly:(v: boolean) => void;
  setExpandedTicker:    (ticker: string | null) => void;
  setQuickActionsTicker:(ticker: string | null) => void;

  // Navegação
  navigateToCompany: (ticker: string, pillar: Pillar) => void;

  // Blocos do endpoint (zonas da tela)
  pageHeader:           WatchlistHeaderDto | null;
  stateBlock:           WatchlistStateBlockDto | null;
  prioritySection:      WatchlistPrioritySectionDto | null;
  updatesSectionHeader: { title: string; body: string } | null;
  quickOverview:        WatchlistQuickOverviewDto | null;
  alertsPanelHeader:    { title: string; body: string; ctaLabel: string } | null;
  sessionClosing:       WatchlistSessionClosingDto | null;

  // Helpers expostos
  getStatusFromScores: (scores: number[]) => WatchlistStatus;
  sourceByTicker:      Record<string, "CVM" | "B3" | "RI">;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useWatchlist(): UseWatchlistReturn {
  const router    = useRouter();
  const { token } = useAuth();

  // — Dados da API —
  const [apiPriorityItems,       setApiPriorityItems]       = useState<PriorityItem[]>([]);
  const [apiFeedItems,           setApiFeedItems]           = useState<FeedItem[]>([]);
  const [apiCompanies,           setApiCompanies]           = useState<WatchlistCompany[]>([]);
  const [apiAlerts,              setApiAlerts]              = useState<AlertItem[]>([]);
  const [apiPageHeader,          setApiPageHeader]          = useState<WatchlistHeaderDto | null>(null);
  const [apiStateBlock,          setApiStateBlock]          = useState<WatchlistStateBlockDto | null>(null);
  const [apiPrioritySection,     setApiPrioritySection]     = useState<WatchlistPrioritySectionDto | null>(null);
  const [apiUpdatesSectionHeader, setApiUpdatesSectionHeader] = useState<{ title: string; body: string } | null>(null);
  const [apiQuickOverview,       setApiQuickOverview]       = useState<WatchlistQuickOverviewDto | null>(null);
  const [apiAlertsPanelHeader,   setApiAlertsPanelHeader]   = useState<{ title: string; body: string; ctaLabel: string } | null>(null);
  const [apiSessionClosing,      setApiSessionClosing]      = useState<WatchlistSessionClosingDto | null>(null);

  // — Estado do feed —
  const [activeTab,               setActiveTab]               = useState<"updates" | "list">("updates");
  const [activeRange,             setActiveRange]             = useState<FeedRangeOrAll>("30d");
  const [activePillars,           setActivePillars]           = useState<Pillar[]>([]);
  const [severityFilter,          setSeverityFilter]          = useState<"Todos" | FeedSeverity>("Todos");
  const [sourceFilter,            setSourceFilter]            = useState<"Todas" | FeedSource>("Todas");
  const [showAdvancedFeedFilters, setShowAdvancedFeedFilters] = useState(false);

  // — Estado da lista de empresas —
  const [listSearch,          setListSearch]          = useState("");
  const [sortBy,              setSortBy]              = useState<WatchlistSortBy>("Mudou recentemente");
  const [filters,             setFilters]             = useState<WatchlistFilters>({ sector: "Todos", tags: "Todos", pillar: "Todos" });
  const [showListFilters,     setShowListFilters]     = useState(false);
  const [listSeverityFilter,  setListSeverityFilter]  = useState<"Todos" | WatchlistStatus>("Todos");
  const [listSourceFilter,    setListSourceFilter]    = useState<"Todas" | FeedSource>("Todas");
  const [listDensity,         setListDensity]         = useState<WatchlistDensity>("Compacto");
  const [unseenOnly,          setUnseenOnly]          = useState(true);
  const [seenTickers,         setSeenTickers]         = useState<string[]>([]);
  const [showAlertActionOnly, setShowAlertActionOnly] = useState(true);
  const [expandedTicker,      setExpandedTicker]      = useState<string | null>(null);
  const [quickActionsTicker,  setQuickActionsTicker]  = useState<string | null>(null);
  const [uiState,             setUiState]             = useState<"ready" | "loading" | "empty">("loading");

  // — Busca de dados da API —
  useEffect(() => {
    if (!token) return;

    setUiState("loading");

    Promise.all([
      getWatchlist("UPDATES", token),
      getWatchlist("LIST", token),
    ])
      .then(([updatesData, listData]) => {
        const priority  = (updatesData.priorityItems         ?? []).map(mapPriorityItemDto);
        const feed      = (updatesData.updatesSection?.items ?? []).map(mapFeedItemDto);
        const alerts    = (updatesData.alertsPanel?.items    ?? []).map(mapAlertItemDto);
        const companies = (listData.listSection?.items       ?? []).map(mapListItemDto);

        setApiPriorityItems(priority);
        setApiFeedItems(feed);
        setApiAlerts(alerts);
        setApiCompanies(companies);
        setApiPageHeader(updatesData.header ?? null);
        setApiStateBlock(updatesData.stateBlock ?? null);
        setApiPrioritySection(updatesData.prioritySection ?? null);
        setApiUpdatesSectionHeader(
          updatesData.updatesSection
            ? { title: updatesData.updatesSection.title, body: updatesData.updatesSection.body }
            : null,
        );
        setApiQuickOverview(updatesData.quickOverview ?? null);
        setApiAlertsPanelHeader(
          updatesData.alertsPanel
            ? { title: updatesData.alertsPanel.title, body: updatesData.alertsPanel.body, ctaLabel: updatesData.alertsPanel.ctaLabel }
            : null,
        );
        setApiSessionClosing(updatesData.sessionClosing ?? null);
        setUiState(priority.length === 0 && companies.length === 0 ? "empty" : "ready");
      })
      .catch((err) => {
        console.error("[watchlist] erro ao buscar dados:", err);
        setUiState("empty");
      });
  }, [token]);

  // — Ações —
  const togglePillar = useCallback((pillar: Pillar) => {
    setActivePillars((prev) =>
      prev.includes(pillar) ? prev.filter((p) => p !== pillar) : [...prev, pillar],
    );
  }, []);

  const toggleSeenTicker = useCallback((ticker: string) => {
    setSeenTickers((prev) =>
      prev.includes(ticker) ? prev.filter((t) => t !== ticker) : [...prev, ticker],
    );
  }, []);

  const navigateToCompany = useCallback(
    (ticker: string, pillar: Pillar) => {
      const pillarKey = pillar.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      router.push(`/empresa/${ticker}?pilar=${pillarKey}&expand=${pillarKey}&tab=pilares&foco=pilar`);
    },
    [router],
  );

  // — Dados derivados: feed filtrado —
  const filteredFeedItems = useMemo<FeedItem[]>(() => {
    return apiFeedItems.filter((item) => {
      if (activeRange !== "Todos" && item.range !== activeRange) return false;
      if (activePillars.length > 0 && !activePillars.includes(item.pillar)) return false;
      if (severityFilter !== "Todos" && item.severity !== severityFilter) return false;
      if (sourceFilter  !== "Todas" && item.source   !== sourceFilter)    return false;
      return true;
    });
  }, [apiFeedItems, activePillars, activeRange, severityFilter, sourceFilter]);

  // — Dados derivados: lista de empresas filtrada e ordenada —
  const filteredCompanies = useMemo<WatchlistCompany[]>(() => {
    const statusWeight: Record<WatchlistStatus, number> = { Risco: 0, Atenção: 1, Saudável: 2 };

    return apiCompanies
      .filter((company) => {
        const companyStatus = getStatusFromScores(company.scores);
        const companySource = sourceByTicker[company.ticker] ?? "CVM";
        const query = listSearch.toLowerCase();

        if (query && !company.name.toLowerCase().includes(query) && !company.ticker.toLowerCase().includes(query)) return false;
        if (unseenOnly && seenTickers.includes(company.ticker)) return false;
        if (filters.sector !== "Todos" && company.sector !== filters.sector) return false;
        if (filters.tags   !== "Todos" && !company.tags.includes(filters.tags)) return false;
        if (filters.pillar !== "Todos" && company.attentionPillar !== filters.pillar) return false;
        if (listSeverityFilter !== "Todos" && companyStatus !== listSeverityFilter) return false;
        if (listSourceFilter   !== "Todas" && companySource !== listSourceFilter)   return false;
        return true;
      })
      .sort((a, b) => {
        if (sortBy === "Mudou recentemente") return a.lastChangeDays - b.lastChangeDays;
        if (sortBy === "Atenção primeiro") {
          return statusWeight[getStatusFromScores(a.scores)] - statusWeight[getStatusFromScores(b.scores)];
        }
        // "Pilar crítico": ordena pelo score mínimo ascendente
        return Math.min(...a.scores) - Math.min(...b.scores);
      });
  }, [
    apiCompanies, listSearch, unseenOnly, seenTickers, filters,
    listSeverityFilter, listSourceFilter, sortBy,
  ]);

  return {
    // Estado do feed
    activeTab,
    activeRange,
    activePillars,
    severityFilter,
    sourceFilter,
    showAdvancedFeedFilters,

    // Estado da lista
    listSearch,
    sortBy,
    filters,
    showListFilters,
    listSeverityFilter,
    listSourceFilter,
    listDensity,
    unseenOnly,
    seenTickers,
    showAlertActionOnly,
    expandedTicker,
    quickActionsTicker,
    uiState,

    // Dados derivados
    filteredFeedItems,
    filteredCompanies,
    companies: apiCompanies,
    priorityItems: apiPriorityItems,
    alerts: apiAlerts,

    // Ações do feed
    setActiveTab,
    setActiveRange,
    togglePillar,
    setSeverityFilter,
    setSourceFilter,
    setShowAdvancedFeedFilters,

    // Ações da lista
    setListSearch,
    setSortBy,
    setFilters,
    setShowListFilters,
    setListSeverityFilter,
    setListSourceFilter,
    setListDensity,
    setUnseenOnly,
    toggleSeenTicker,
    setShowAlertActionOnly,
    setExpandedTicker,
    setQuickActionsTicker,

    // Blocos do endpoint (zonas da tela)
    pageHeader:           apiPageHeader,
    stateBlock:           apiStateBlock,
    prioritySection:      apiPrioritySection,
    updatesSectionHeader: apiUpdatesSectionHeader,
    quickOverview:        apiQuickOverview,
    alertsPanelHeader:    apiAlertsPanelHeader,
    sessionClosing:       apiSessionClosing,

    // Navegação
    navigateToCompany,

    // Helpers
    getStatusFromScores,
    sourceByTicker,
  };
}

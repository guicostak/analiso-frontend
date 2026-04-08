"use client";

/**
 * useDashboardInbox
 *
 * Centraliza todo o estado e a lógica do inbox do dashboard:
 *  - Busca de dados na API (com retry automático para "not_ready")
 *  - Persistência de filtros e modo no localStorage
 *  - Simulação de itens em tempo-real (modo "tempo-real")
 *  - Cálculos derivados (contagens, item prioritário, movimentos por pilar)
 *  - Ações expostas ao componente (refresh, abrir item, limpar filtros, etc.)
 *
 * O componente Dashboard só precisa destructurar o retorno deste hook
 * e renderizar o JSX.
 *
 * Internamente, a lógica está particionada em 4 sub-hooks que também são
 * exportados para uso isolado pelas ilhas do `dashboard-canvas` (Fase 2):
 *   - useDashboardSummary    → estado da API + item prioritário/topRisk/topImprove
 *   - useReadingProgress     → ids vistos + helpers
 *   - useInbox               → filtros, modo, refresh, ações
 *   - usePillarMovements     → movimentos derivados por pilar
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import { useTheme } from "next-themes";

import { useAuth } from "@/src/features/auth/AuthContext";
import { getDashboard, mapApiItemsToInboxSeed } from "../services";
import { ApiError } from "@/src/lib/api";

import type {
  Status,
  Pillar,
  WindowRange,
  InboxSource,
  InboxSort,
  InboxMode,
  InboxSeedItem,
  InboxItem,
  InboxFilters,
  PillarMovement,
} from "../interfaces";
import type { DashboardResponse } from "../services";

// ─── Constantes ───────────────────────────────────────────────────────────────

const INBOX_FILTERS_STORAGE_KEY    = "dashboard-inbox-filters:v1";
const INBOX_MODE_STORAGE_KEY       = "dashboard-inbox-mode:v1";
const READING_PROGRESS_STORAGE_KEY = "dashboard-reading-progress:v1";

export const allStatuses: Status[]      = ["Risco", "Atenção", "Saudável"];
export const allPillars: Pillar[]       = ["Dívida", "Caixa", "Margens", "Retorno", "Proventos"];
export const allSources: InboxSource[]  = ["CVM", "B3", "RI"];

// ─── Helpers (sem dependências de React) ─────────────────────────────────────

function toggleInArray<T>(arr: T[], value: T): T[] {
  return arr.includes(value) ? arr.filter((item) => item !== value) : [...arr, value];
}

function includesAll<T>(selected: T[], all: T[]): boolean {
  if (selected.length === 0) return true;
  return selected.length === all.length && all.every((item) => selected.includes(item));
}

export function getPeriodLimitMinutes(period: WindowRange): number {
  if (period === "24h") return 24 * 60;
  if (period === "7d")  return 7 * 24 * 60;
  return 30 * 24 * 60;
}

export function relativeFromMinutes(minutes: number): string {
  if (minutes < 60) return `há ${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `há ${hours} h`;
  return `há ${Math.floor(hours / 24)} d`;
}

export function relativeFromTimestamp(timestamp: number): string {
  const deltaMs = Date.now() - timestamp;
  const minutes = Math.max(0, Math.floor(deltaMs / 60_000));
  if (minutes < 1) return "há 0 min";
  if (minutes < 60) return `há ${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `há ${hours} h`;
  return `há ${Math.floor(hours / 24)} d`;
}

export function toPillarQueryKey(pillar?: Pillar): string {
  if (!pillar) return "";
  const map: Record<Pillar, string> = {
    "Dívida":   "divida",
    "Caixa":    "caixa",
    "Margens":  "margens",
    "Retorno":  "retorno",
    "Proventos":"proventos",
  };
  return map[pillar];
}

function defaultInboxFilters(): InboxFilters {
  return {
    period: "24h",
    severities: allStatuses,
    pillars: allPillars,
    sources: allSources,
    sortBy: "Impacto",
  };
}

function loadInboxFilters(): InboxFilters {
  const fallback = defaultInboxFilters();
  try {
    const raw = window.localStorage.getItem(INBOX_FILTERS_STORAGE_KEY);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw) as Partial<InboxFilters>;
    return {
      period:     parsed.period     ?? fallback.period,
      severities: parsed.severities?.length ? parsed.severities : fallback.severities,
      pillars:    parsed.pillars?.length    ? parsed.pillars    : fallback.pillars,
      sources:    parsed.sources?.length    ? parsed.sources    : fallback.sources,
      sortBy:     parsed.sortBy     ?? fallback.sortBy,
    };
  } catch {
    return fallback;
  }
}

function loadInboxMode(): InboxMode {
  try {
    const raw = window.localStorage.getItem(INBOX_MODE_STORAGE_KEY);
    if (raw === "tempo-real" || raw === "top-impacto") return raw;
  } catch {
    // ignore storage errors
  }
  return loadInboxFilters().sortBy === "Mais recente" ? "tempo-real" : "top-impacto";
}

function loadViewedInboxItemIds(): string[] {
  try {
    const raw = window.localStorage.getItem(READING_PROGRESS_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed)
      ? parsed.filter((item): item is string => typeof item === "string")
      : [];
  } catch {
    return [];
  }
}

// ─── Sub-hook: useDashboardSummary ────────────────────────────────────────────
//
// Responsável pelo estado da API do dashboard. Faz o fetch, expõe o estado de
// loading/erro e os itens do inbox vindos da API já mapeados para o formato
// de seed.

export interface UseDashboardSummaryReturn {
  dashboardData:    DashboardResponse | null;
  dashboardLoading: boolean;
  dashboardError:   string | null;
  apiInboxItems:    InboxSeedItem[];
}

export function useDashboardSummary(): UseDashboardSummaryReturn {
  const { token, logout } = useAuth();

  const [dashboardData,    setDashboardData]    = useState<DashboardResponse | null>(null);
  const [dashboardLoading, setDashboardLoading] = useState(true);
  const [dashboardError,   setDashboardError]   = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setDashboardLoading(false);
      setDashboardError("no_token");
      return;
    }

    let cancelled = false;

    setDashboardLoading(true);
    setDashboardError(null);

    getDashboard(token)
      .then((data) => {
        if (!cancelled) {
          setDashboardData(data);
          setDashboardLoading(false);
        }
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setDashboardLoading(false);
        if (err instanceof ApiError && err.code === "dashboard_not_ready") {
          setDashboardError("not_ready");
        } else if (err instanceof ApiError && err.status === 401) {
          logout();
        } else {
          setDashboardError("error");
        }
      });

    return () => { cancelled = true; };
  }, [token, logout]);

  const apiInboxItems = useMemo<InboxSeedItem[]>(() => {
    if (!dashboardData) return [];
    return mapApiItemsToInboxSeed(dashboardData.items);
  }, [dashboardData]);

  return { dashboardData, dashboardLoading, dashboardError, apiInboxItems };
}

// ─── Sub-hook: useReadingProgress ─────────────────────────────────────────────
//
// Mantém os ids dos itens de inbox que o usuário já abriu (persistidos em
// localStorage) e fornece a ação `markItemViewed`.

export interface UseReadingProgressReturn {
  viewedInboxItemIds:    string[];
  setViewedInboxItemIds: React.Dispatch<React.SetStateAction<string[]>>;
  markItemViewed:        (id: string) => void;
}

export function useReadingProgress(): UseReadingProgressReturn {
  const [viewedInboxItemIds, setViewedInboxItemIds] = useState<string[]>(() => loadViewedInboxItemIds());

  useEffect(() => {
    try { window.localStorage.setItem(READING_PROGRESS_STORAGE_KEY, JSON.stringify(viewedInboxItemIds)); }
    catch { /* ignore */ }
  }, [viewedInboxItemIds]);

  const markItemViewed = useCallback((id: string) => {
    setViewedInboxItemIds((prev) => (prev.includes(id) ? prev : [...prev, id]));
  }, []);

  return { viewedInboxItemIds, setViewedInboxItemIds, markItemViewed };
}

// ─── Sub-hook: useInbox ───────────────────────────────────────────────────────
//
// Estado e ações do inbox: filtros, modo, refresh, lista derivada de items,
// contagens e a ação de abrir um item. Recebe os items vindos da API e o
// router como dependências para permitir uso isolado.

export interface UseInboxParams {
  apiInboxItems: InboxSeedItem[];
  router:        AppRouterInstance;
  markItemViewed: (id: string) => void;
}

export interface UseInboxReturn {
  // Estado
  inboxFilters:   InboxFilters;
  inboxMode:      InboxMode;
  filtersOpen:    boolean;
  isRefreshing:   boolean;
  refreshError:   string | null;
  inboxError:     boolean;
  realtimeItems:  InboxSeedItem[];
  newBadgeUntil:  Record<string, number>;
  clockTick:      number;
  lastRefreshAt:  number;

  // Derivados
  inboxItems:           InboxItem[];
  inboxRows:            InboxItem[];
  todayItems:           InboxItem[];
  priorityItem:         InboxItem | undefined;
  todayRiskCount:       number;
  todayAttentionCount:  number;
  todayHealthyCount:    number;
  topRiskItem:          InboxItem | undefined;
  topImproveItem:       InboxItem | undefined;
  healthyWatchlistCount: number;
  totalWatchlistCount:   number;
  activeSeverities:     Status[];
  activePillars:        Pillar[];
  activeSources:        InboxSource[];
  hasSeverityFilter:    boolean;
  hasPillarFilter:      boolean;
  hasSourceFilter:      boolean;
  hasPeriodFilter:      boolean;
  hasAnyFilterOverride: boolean;
  showFiltersCount:     boolean;
  advancedFiltersCount: number;
  refreshLabel:         string;

  // Ações
  setInboxFilters:        React.Dispatch<React.SetStateAction<InboxFilters>>;
  setInboxMode:           (mode: InboxMode) => void;
  setFiltersOpen:         (open: boolean) => void;
  toggleFilterSeverity:   (s: Status) => void;
  toggleFilterPillar:     (p: Pillar) => void;
  toggleFilterSource:     (s: InboxSource) => void;
  setFilterPeriod:        (p: WindowRange) => void;
  setFilterSortBy:        (s: InboxSort) => void;
  refreshInboxNow:        () => void;
  openInboxItem:          (item: InboxItem) => void;
  focusInboxRecentImpact: () => void;
  setImpactMode:          () => void;
  setRealTimeMode:        () => void;
  clearInboxFilters:      () => void;

  // Refs
  inboxRef: React.RefObject<HTMLElement | null>;
}

export function useInbox({ apiInboxItems, router, markItemViewed }: UseInboxParams): UseInboxReturn {
  const [inboxError,    setInboxError]    = useState(false);
  const [inboxFilters,  setInboxFilters]  = useState<InboxFilters>(() => loadInboxFilters());
  const [inboxMode,     setInboxModeState]= useState<InboxMode>(() => loadInboxMode());
  const [filtersOpen,   setFiltersOpen]   = useState(false);
  const [lastRefreshAt, setLastRefreshAt] = useState(() => Date.now());
  const [isRefreshing,  setIsRefreshing]  = useState(false);
  const [refreshError,  setRefreshError]  = useState<string | null>(null);
  const [clockTick,     setClockTick]     = useState(0);
  const [realtimeItems, setRealtimeItems] = useState<InboxSeedItem[]>([]);
  const [newBadgeUntil, setNewBadgeUntil] = useState<Record<string, number>>({});

  const inboxRef = useRef<HTMLElement | null>(null);

  // Persistência em localStorage
  useEffect(() => {
    try { window.localStorage.setItem(INBOX_FILTERS_STORAGE_KEY, JSON.stringify(inboxFilters)); }
    catch { /* ignore */ }
  }, [inboxFilters]);

  useEffect(() => {
    try { window.localStorage.setItem(INBOX_MODE_STORAGE_KEY, inboxMode); }
    catch { /* ignore */ }
  }, [inboxMode]);

  // Sincroniza sortBy com o modo
  useEffect(() => {
    setInboxFilters((prev) => {
      const expectedSort: InboxSort = inboxMode === "tempo-real" ? "Mais recente" : "Impacto";
      if (prev.sortBy === expectedSort) return prev;
      return { ...prev, sortBy: expectedSort };
    });
  }, [inboxMode]);

  // Clock para atualizar timestamps relativos a cada segundo
  useEffect(() => {
    const timer = window.setInterval(() => setClockTick((prev) => prev + 1), 1_000);
    return () => window.clearInterval(timer);
  }, []);

  // Expira badges de "novo"
  useEffect(() => {
    const now = Date.now();
    setNewBadgeUntil((prev) => {
      const next = Object.fromEntries(
        Object.entries(prev).filter(([, expiresAt]) => expiresAt > now),
      );
      return Object.keys(next).length === Object.keys(prev).length ? prev : next;
    });
  }, [clockTick]);

  // Limpa badges ao interagir com a página
  useEffect(() => {
    const clear = () => setNewBadgeUntil((prev) => (Object.keys(prev).length ? {} : prev));
    window.addEventListener("scroll",     clear, { passive: true });
    window.addEventListener("pointerdown",clear, { passive: true });
    window.addEventListener("keydown",    clear);
    window.addEventListener("touchstart", clear, { passive: true });
    return () => {
      window.removeEventListener("scroll",     clear);
      window.removeEventListener("pointerdown",clear);
      window.removeEventListener("keydown",    clear);
      window.removeEventListener("touchstart", clear);
    };
  }, []);

  const baseInboxItems = apiInboxItems;

  const inboxItems = useMemo<InboxItem[]>(
    () =>
      [...realtimeItems, ...baseInboxItems].map((item) => ({
        ...item,
        ageMinutes:   item.ageMinutes,
        timestamp:    new Date(lastRefreshAt - item.ageMinutes * 60_000).toISOString(),
        relativeTime: relativeFromMinutes(item.ageMinutes),
      })),
    [lastRefreshAt, realtimeItems, baseInboxItems],
  );

  // Filtros derivados
  const activeSeverities    = inboxFilters.severities.length ? inboxFilters.severities : allStatuses;
  const activePillarsFilter = inboxFilters.pillars.length    ? inboxFilters.pillars    : allPillars;
  const activeSources       = inboxFilters.sources.length    ? inboxFilters.sources    : allSources;

  const hasSeverityFilter    = !includesAll(inboxFilters.severities, allStatuses);
  const hasPillarFilter      = !includesAll(inboxFilters.pillars, allPillars);
  const hasSourceFilter      = !includesAll(inboxFilters.sources, allSources);
  const hasPeriodFilter      = inboxFilters.period !== "24h";
  const hasAnyFilterOverride = hasSeverityFilter || hasPillarFilter || hasSourceFilter || hasPeriodFilter;
  const advancedFiltersCount = Number(hasSeverityFilter) + Number(hasPillarFilter) + Number(hasSourceFilter);
  const showFiltersCount     = advancedFiltersCount > 0;

  const inboxRows = useMemo(() => {
    const limit = getPeriodLimitMinutes(inboxFilters.period);
    return inboxItems
      .filter((item) => item.ageMinutes <= limit)
      .filter((item) => activeSeverities.includes(item.severity))
      .filter((item) => (item.pillarKey ? activePillarsFilter.includes(item.pillarKey) : true))
      .filter((item) => (item.source    ? activeSources.includes(item.source)           : true))
      .sort((a, b) =>
        inboxFilters.sortBy === "Impacto"
          ? b.impactScore - a.impactScore
          : new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
      );
  }, [activePillarsFilter, activeSeverities, activeSources, inboxFilters, inboxItems]);

  const todayItems = useMemo(
    () => inboxItems.filter((item) => item.ageMinutes <= 24 * 60),
    [inboxItems],
  );

  const todayRiskCount      = todayItems.filter((i) => i.severity === "Risco").length;
  const todayAttentionCount = todayItems.filter((i) => i.severity === "Atenção").length;
  const todayHealthyCount   = todayItems.filter((i) => i.severity === "Saudável").length;

  const distinctTickers = useMemo(
    () => Array.from(new Set(inboxItems.map((item) => item.ticker))),
    [inboxItems],
  );
  const distinctHealthyTickers = useMemo(
    () =>
      Array.from(
        new Set(
          todayItems
            .filter((item) => item.severity === "Saudável")
            .map((item) => item.ticker),
        ),
      ),
    [todayItems],
  );

  const topRiskItem    = todayItems.filter((i) => i.severity === "Risco").sort((a, b) => b.impactScore - a.impactScore)[0];
  const topImproveItem = todayItems.filter((i) => i.severity === "Saudável").sort((a, b) => b.impactScore - a.impactScore)[0];

  const priorityItem = inboxRows[0];

  // Auto-refresh em modo tempo-real
  const refreshInboxNow = useCallback(() => {
    try {
      setIsRefreshing(true);
      setLastRefreshAt(Date.now());
      setRefreshError(null);
      setInboxError(false);
    } catch {
      setRefreshError("Falha ao atualizar. Tentar novamente.");
      setInboxError(true);
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    if (inboxMode !== "tempo-real") return;
    const timer = window.setInterval(() => {
      if (document.visibilityState !== "visible") return;
      refreshInboxNow();
    }, 30_000);
    return () => window.clearInterval(timer);
  }, [inboxMode, refreshInboxNow]);

  // Ações expostas
  const setInboxMode = useCallback((mode: InboxMode) => setInboxModeState(mode), []);

  const toggleFilterSeverity = useCallback((s: Status) => {
    setInboxFilters((prev) => ({ ...prev, severities: toggleInArray(prev.severities, s) }));
  }, []);

  const toggleFilterPillar = useCallback((p: Pillar) => {
    setInboxFilters((prev) => ({ ...prev, pillars: toggleInArray(prev.pillars, p) }));
  }, []);

  const toggleFilterSource = useCallback((s: InboxSource) => {
    setInboxFilters((prev) => ({ ...prev, sources: toggleInArray(prev.sources, s) }));
  }, []);

  const setFilterPeriod = useCallback((p: WindowRange) => {
    setInboxFilters((prev) => ({ ...prev, period: p }));
  }, []);

  const setFilterSortBy = useCallback((s: InboxSort) => {
    setInboxFilters((prev) => ({ ...prev, sortBy: s }));
  }, []);

  const openInboxItem = useCallback((item: InboxItem) => {
    markItemViewed(item.id);
    const params = new URLSearchParams();
    if (item.pillarKey) {
      params.set("pilar",  toPillarQueryKey(item.pillarKey));
      params.set("expand", toPillarQueryKey(item.pillarKey));
    }
    if (item.eventType === "evento_futuro") {
      params.set("tab",  "eventos");
      params.set("foco", "agenda");
    } else if (item.pillarKey) {
      params.set("tab",  "pilares");
      params.set("foco", "pilar");
    } else {
      params.set("tab",  "mudancas");
      params.set("foco", "mudancas");
    }
    router.push(`/analysis/${item.ticker}?${params.toString()}`);
  }, [markItemViewed, router]);

  const focusInboxRecentImpact = useCallback(() => {
    setInboxModeState("top-impacto");
    setInboxFilters((prev) => ({ ...prev, period: "24h", sortBy: "Impacto" }));
    inboxRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  const setImpactMode = useCallback(() => {
    setInboxModeState("top-impacto");
    setInboxFilters((prev) => ({ ...prev, period: "24h", sortBy: "Impacto" }));
  }, []);

  const setRealTimeMode = useCallback(() => {
    setInboxModeState("tempo-real");
    setInboxFilters((prev) => ({ ...prev, period: "24h", sortBy: "Mais recente" }));
    refreshInboxNow();
  }, [refreshInboxNow]);

  const clearInboxFilters = useCallback(() => {
    setInboxModeState("top-impacto");
    setInboxFilters(defaultInboxFilters());
    setRealtimeItems([]);
    setNewBadgeUntil({});
  }, []);

  const refreshLabel = useMemo(
    () => relativeFromTimestamp(lastRefreshAt),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [lastRefreshAt, clockTick],
  );

  return {
    inboxFilters,
    inboxMode,
    filtersOpen,
    isRefreshing,
    refreshError,
    inboxError,
    realtimeItems,
    newBadgeUntil,
    clockTick,
    lastRefreshAt,

    inboxItems,
    inboxRows,
    todayItems,
    priorityItem,
    todayRiskCount,
    todayAttentionCount,
    todayHealthyCount,
    topRiskItem,
    topImproveItem,
    healthyWatchlistCount: distinctHealthyTickers.length,
    totalWatchlistCount:   distinctTickers.length,
    activeSeverities,
    activePillars: activePillarsFilter,
    activeSources,
    hasSeverityFilter,
    hasPillarFilter,
    hasSourceFilter,
    hasPeriodFilter,
    hasAnyFilterOverride,
    showFiltersCount,
    advancedFiltersCount,
    refreshLabel,

    setInboxFilters,
    setInboxMode,
    setFiltersOpen,
    toggleFilterSeverity,
    toggleFilterPillar,
    toggleFilterSource,
    setFilterPeriod,
    setFilterSortBy,
    refreshInboxNow,
    openInboxItem,
    focusInboxRecentImpact,
    setImpactMode,
    setRealTimeMode,
    clearInboxFilters,

    inboxRef,
  };
}

// ─── Sub-hook: usePillarMovements ─────────────────────────────────────────────
//
// Deriva os movimentos por pilar a partir dos itens da API e calcula o pilar
// em foco. Também expõe a ação `applySinglePillarFilter`.

export interface UsePillarMovementsParams {
  apiInboxItems:   InboxSeedItem[];
  inboxFilters:    InboxFilters;
  setInboxFilters: React.Dispatch<React.SetStateAction<InboxFilters>>;
  inboxRef:        React.RefObject<HTMLElement | null>;
}

export interface UsePillarMovementsReturn {
  pillarMovements:         PillarMovement[];
  leadingPillarMovement:   PillarMovement;
  visiblePillarMovements:  PillarMovement[];
  focusedPillar:           Pillar;
  applySinglePillarFilter: (pillar: Pillar) => void;
}

export function usePillarMovements({
  apiInboxItems,
  inboxFilters,
  setInboxFilters,
  inboxRef,
}: UsePillarMovementsParams): UsePillarMovementsReturn {
  const pillarMovements = useMemo<PillarMovement[]>(() => {
    return allPillars.map((pillar) => {
      const items     = apiInboxItems.filter((i) => i.pillarKey === pillar);
      const risk      = items.filter((i) => i.severity === "Risco").length;
      const attention = items.filter((i) => i.severity === "Atenção").length;
      const healthy   = items.filter((i) => i.severity === "Saudável").length;
      return { pillar, events: items.length, trendLabel: "", trendUp: false, risk, attention, healthy };
    }).filter((p) => p.events > 0);
  }, [apiInboxItems]);

  const sortedPillarMovements  = useMemo(() => [...pillarMovements].sort((a, b) => b.events - a.events), [pillarMovements]);
  const leadingPillarMovement  = sortedPillarMovements[0] ?? { pillar: "Dívida" as Pillar, events: 0, trendLabel: "", trendUp: false, risk: 0, attention: 0, healthy: 0 };
  const visiblePillarMovements = sortedPillarMovements.slice(0, 2);
  const focusedPillar          = inboxFilters.pillars.length === 1
    ? inboxFilters.pillars[0]
    : (sortedPillarMovements[0]?.pillar ?? "Dívida");

  const applySinglePillarFilter = useCallback((pillar: Pillar) => {
    setInboxFilters((prev) => ({ ...prev, pillars: [pillar] }));
    inboxRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [setInboxFilters, inboxRef]);

  return {
    pillarMovements,
    leadingPillarMovement,
    visiblePillarMovements,
    focusedPillar,
    applySinglePillarFilter,
  };
}

// ─── Tipo de retorno do hook ──────────────────────────────────────────────────

export interface UseDashboardInboxReturn {
  // Estado da API
  dashboardData:    DashboardResponse | null;
  dashboardLoading: boolean;
  dashboardError:   string | null;

  // Estado do inbox
  inboxFilters:       InboxFilters;
  inboxMode:          InboxMode;
  filtersOpen:        boolean;
  isRefreshing:       boolean;
  refreshError:       string | null;
  inboxError:         boolean;
  realtimeItems:      InboxSeedItem[];
  newBadgeUntil:      Record<string, number>;
  viewedInboxItemIds: string[];
  clockTick:          number;
  isDarkMode:         boolean;
  lastRefreshAt:      number;

  // Dados derivados
  inboxRows:                InboxItem[];
  inboxItems:               InboxItem[];
  todayItems:               InboxItem[];
  priorityItem:             InboxItem | undefined;
  todayRiskCount:           number;
  todayAttentionCount:      number;
  todayHealthyCount:        number;
  topRiskItem:              InboxItem | undefined;
  topImproveItem:           InboxItem | undefined;
  focusedPillar:            Pillar;
  leadingPillarMovement:    PillarMovement;
  visiblePillarMovements:   PillarMovement[];
  pillarMovements:          PillarMovement[];
  hasAnyFilterOverride:     boolean;
  showFiltersCount:         boolean;
  advancedFiltersCount:     number;
  healthyWatchlistCount:    number;
  totalWatchlistCount:      number;
  // Filtros efetivos (após fallback para "todos")
  activeSeverities:         Status[];
  activePillars:            Pillar[];
  activeSources:            InboxSource[];
  hasSeverityFilter:        boolean;
  hasPillarFilter:          boolean;
  hasSourceFilter:          boolean;
  hasPeriodFilter:          boolean;
  refreshLabel:             string;
  renderedLabel:            string;

  // Ações
  setInboxFilters:         React.Dispatch<React.SetStateAction<InboxFilters>>;
  setInboxMode:            (mode: InboxMode) => void;
  setFiltersOpen:          (open: boolean) => void;
  toggleFilterSeverity:    (s: Status) => void;
  toggleFilterPillar:      (p: Pillar) => void;
  toggleFilterSource:      (s: InboxSource) => void;
  setFilterPeriod:         (p: WindowRange) => void;
  setFilterSortBy:         (s: InboxSort) => void;
  refreshInboxNow:         () => void;
  openInboxItem:           (item: InboxItem) => void;
  markItemViewed:          (id: string) => void;
  applySinglePillarFilter: (pillar: Pillar) => void;
  focusInboxRecentImpact:  () => void;
  setImpactMode:           () => void;
  setRealTimeMode:         () => void;
  clearInboxFilters:       () => void;

  // Refs
  inboxRef: React.RefObject<HTMLElement | null>;
}

// ─── Hook composto ────────────────────────────────────────────────────────────
//
// Compõe os 4 sub-hooks acima para preservar o shape histórico consumido por
// `DashboardPage`. Esta composição é o ponto de extensão da Fase 2: as ilhas
// do `dashboard-canvas` poderão consumir os sub-hooks isoladamente.

export function useDashboardInbox(): UseDashboardInboxReturn {
  const router            = useRouter();
  const { resolvedTheme } = useTheme();
  const isDarkMode        = resolvedTheme === "dark";

  const summary  = useDashboardSummary();
  const progress = useReadingProgress();
  const inbox    = useInbox({
    apiInboxItems:  summary.apiInboxItems,
    router,
    markItemViewed: progress.markItemViewed,
  });
  const pillars  = usePillarMovements({
    apiInboxItems:   summary.apiInboxItems,
    inboxFilters:    inbox.inboxFilters,
    setInboxFilters: inbox.setInboxFilters,
    inboxRef:        inbox.inboxRef,
  });

  const renderedLabel = useMemo(
    () => (summary.dashboardData?.renderedAt
      ? relativeFromTimestamp(new Date(summary.dashboardData.renderedAt).getTime())
      : inbox.refreshLabel),
    [summary.dashboardData?.renderedAt, inbox.refreshLabel],
  );

  return {
    // Estado da API
    dashboardData:    summary.dashboardData,
    dashboardLoading: summary.dashboardLoading,
    dashboardError:   summary.dashboardError,

    // Estado do inbox
    inboxFilters:       inbox.inboxFilters,
    inboxMode:          inbox.inboxMode,
    filtersOpen:        inbox.filtersOpen,
    isRefreshing:       inbox.isRefreshing,
    refreshError:       inbox.refreshError,
    inboxError:         inbox.inboxError,
    realtimeItems:      inbox.realtimeItems,
    newBadgeUntil:      inbox.newBadgeUntil,
    viewedInboxItemIds: progress.viewedInboxItemIds,
    clockTick:          inbox.clockTick,
    isDarkMode,
    lastRefreshAt:      inbox.lastRefreshAt,

    // Dados derivados
    inboxRows:              inbox.inboxRows,
    inboxItems:             inbox.inboxItems,
    todayItems:             inbox.todayItems,
    priorityItem:           inbox.priorityItem,
    todayRiskCount:         inbox.todayRiskCount,
    todayAttentionCount:    inbox.todayAttentionCount,
    todayHealthyCount:      inbox.todayHealthyCount,
    topRiskItem:            inbox.topRiskItem,
    topImproveItem:         inbox.topImproveItem,
    focusedPillar:          pillars.focusedPillar,
    leadingPillarMovement:  pillars.leadingPillarMovement,
    visiblePillarMovements: pillars.visiblePillarMovements,
    pillarMovements:        pillars.pillarMovements,
    hasAnyFilterOverride:   inbox.hasAnyFilterOverride,
    showFiltersCount:       inbox.showFiltersCount,
    advancedFiltersCount:   inbox.advancedFiltersCount,
    healthyWatchlistCount:  inbox.healthyWatchlistCount,
    totalWatchlistCount:    inbox.totalWatchlistCount,
    activeSeverities:       inbox.activeSeverities,
    activePillars:          inbox.activePillars,
    activeSources:          inbox.activeSources,
    hasSeverityFilter:      inbox.hasSeverityFilter,
    hasPillarFilter:        inbox.hasPillarFilter,
    hasSourceFilter:        inbox.hasSourceFilter,
    hasPeriodFilter:        inbox.hasPeriodFilter,
    refreshLabel:           inbox.refreshLabel,
    renderedLabel,

    // Ações
    setInboxFilters:         inbox.setInboxFilters,
    setInboxMode:            inbox.setInboxMode,
    setFiltersOpen:          inbox.setFiltersOpen,
    toggleFilterSeverity:    inbox.toggleFilterSeverity,
    toggleFilterPillar:      inbox.toggleFilterPillar,
    toggleFilterSource:      inbox.toggleFilterSource,
    setFilterPeriod:         inbox.setFilterPeriod,
    setFilterSortBy:         inbox.setFilterSortBy,
    refreshInboxNow:         inbox.refreshInboxNow,
    openInboxItem:           inbox.openInboxItem,
    markItemViewed:          progress.markItemViewed,
    applySinglePillarFilter: pillars.applySinglePillarFilter,
    focusInboxRecentImpact:  inbox.focusInboxRecentImpact,
    setImpactMode:           inbox.setImpactMode,
    setRealTimeMode:         inbox.setRealTimeMode,
    clearInboxFilters:       inbox.clearInboxFilters,

    // Refs
    inboxRef: inbox.inboxRef,
  };
}

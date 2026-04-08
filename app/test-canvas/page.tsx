"use client";

/**
 * Página de debug temporária — testa o DashboardCanvas isolado.
 */

import { Component, useRef, type ReactNode } from "react";
import Link from "next/link";
import { DashboardCanvas } from "@/src/features/dashboard-canvas/components/DashboardCanvas";
import type { UseDashboardInboxReturn } from "@/src/features/dashboard/hooks/useDashboardInbox";
import { EditModeToggle } from "@/src/features/dashboard-canvas/components/EditModeToggle";

class DebugErrorBoundary extends Component<{ children: ReactNode }, { err: Error | null }> {
  state = { err: null as Error | null };
  static getDerivedStateFromError(err: Error) { return { err }; }
  render() {
    if (this.state.err) {
      return (
        <pre id="debug-err" style={{ whiteSpace: "pre-wrap", fontSize: 11, padding: 12, background: "#fee" }}>
          {this.state.err.message}
          {"\n\n"}
          {this.state.err.stack}
        </pre>
      );
    }
    return this.props.children;
  }
}

export default function TestCanvasPage() {
  // Patch fetch para mockar o backend de layout (apenas nesta página).
  const patchedRef = useRef(false);
  if (typeof window !== "undefined" && !patchedRef.current) {
    patchedRef.current = true;
    const orig = window.fetch;
    window.fetch = function (input: RequestInfo | URL, init?: RequestInit) {
      const url = typeof input === "string" ? input : input instanceof URL ? input.toString() : input.url;
      if (url.includes("/api/me/dashboard-layout")) {
        return Promise.resolve(
          new Response(
            JSON.stringify({
              version: 1,
              items: [
                { id: "i1", kind: "sinais_watchlist", order: 0, config: {} },
                { id: "i2", kind: "qualidade_dados", order: 1, config: {} },
              ],
            }),
            { status: 200, headers: { "Content-Type": "application/json" } },
          ),
        );
      }
      if (url.includes("/api/me/notifications")) {
        return Promise.resolve(
          new Response(JSON.stringify({ items: [], unreadCount: 0 }), { status: 200, headers: { "Content-Type": "application/json" } }),
        );
      }
      if (url.includes("/api/")) {
        return Promise.resolve(
          new Response(JSON.stringify({ items: [] }), { status: 200, headers: { "Content-Type": "application/json" } }),
        );
      }
      return orig.call(window, input as RequestInfo, init);
    };
  }

  // Stub mínimo do inbox: as ilhas que consomem dados verão arrays vazios.
  const inboxStub = {
    dashboardData: null,
    dashboardLoading: false,
    dashboardError: null,
    inboxFilters: { severities: [], pillars: [], sources: [], period: "24h", sortBy: "Impacto" },
    inboxMode: "impacto",
    filtersOpen: false,
    isRefreshing: false,
    refreshError: null,
    inboxError: false,
    realtimeItems: [],
    newBadgeUntil: {},
    viewedInboxItemIds: [],
    clockTick: 0,
    isDarkMode: false,
    lastRefreshAt: Date.now(),
    inboxRows: [],
    inboxItems: [],
    todayItems: [],
    priorityItem: undefined,
    todayRiskCount: 0,
    todayAttentionCount: 0,
    todayHealthyCount: 0,
    topRiskItem: undefined,
    topImproveItem: undefined,
    focusedPillar: "Dívida",
    leadingPillarMovement: { pillar: "Dívida", events: 0, trendLabel: "", trendUp: false, risk: 0, attention: 0, healthy: 0 },
    visiblePillarMovements: [],
    pillarMovements: [],
    hasAnyFilterOverride: false,
    showFiltersCount: false,
    advancedFiltersCount: 0,
    healthyWatchlistCount: 0,
    totalWatchlistCount: 0,
    activeSeverities: [],
    activePillars: [],
    activeSources: [],
    hasSeverityFilter: false,
    hasPillarFilter: false,
    hasSourceFilter: false,
    hasPeriodFilter: false,
    refreshLabel: "agora",
    renderedLabel: "agora",
    setInboxFilters: () => {},
    setInboxMode: () => {},
    setFiltersOpen: () => {},
    toggleFilterSeverity: () => {},
    toggleFilterPillar: () => {},
    toggleFilterSource: () => {},
    setFilterPeriod: () => {},
    setFilterSortBy: () => {},
    refreshInboxNow: () => {},
    openInboxItem: () => {},
    markItemViewed: () => {},
    applySinglePillarFilter: () => {},
    focusInboxRecentImpact: () => {},
    setImpactMode: () => {},
    setRealTimeMode: () => {},
    clearInboxFilters: () => {},
    inboxRef: { current: null },
  } as unknown as UseDashboardInboxReturn;

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-lg font-bold">Test Canvas (debug)</h1>
        <Link href="/painel" id="goto-painel">→ /painel</Link>
        <EditModeToggle />
      </div>
      <DebugErrorBoundary>
        <DashboardCanvas inbox={inboxStub} />
      </DebugErrorBoundary>
    </div>
  );
}

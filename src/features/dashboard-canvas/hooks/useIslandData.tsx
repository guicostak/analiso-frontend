"use client";

/**
 * useIslandData / DashboardCanvasContext
 *
 * Distribui para todas as ilhas o `useDashboardInbox()` (já consumido pelo
 * `DashboardPage` e passado como prop ao `DashboardCanvas`) sem precisar de
 * prop-drilling. Cada ilha lê apenas a fatia que precisa.
 *
 * Regra crítica (Fase 2): zero duplicação de fetch. Ilhas que dependem do
 * `dashboardData` consomem este contexto. Ilhas com fonte própria
 * (empresas/buscas/comparações/agenda) usam seus services dedicados —
 * disparados lazy via `useInViewLazyFetch`.
 */

import { createContext, useContext, type ReactNode } from "react";

import type { UseDashboardInboxReturn } from "@/src/features/dashboard/hooks/useDashboardInbox";

const DashboardCanvasDataContext = createContext<UseDashboardInboxReturn | null>(null);

export interface DashboardCanvasDataProviderProps {
  inbox: UseDashboardInboxReturn;
  children: ReactNode;
}

export function DashboardCanvasDataProvider({
  inbox,
  children,
}: DashboardCanvasDataProviderProps) {
  return (
    <DashboardCanvasDataContext.Provider value={inbox}>
      {children}
    </DashboardCanvasDataContext.Provider>
  );
}

/** Hook genérico — devolve toda a fatia de dados do dashboard. */
export function useIslandData(): UseDashboardInboxReturn {
  const ctx = useContext(DashboardCanvasDataContext);
  if (!ctx) {
    throw new Error(
      "useIslandData must be used inside <DashboardCanvasDataProvider>",
    );
  }
  return ctx;
}

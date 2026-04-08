"use client";

/**
 * DashboardLayoutContext
 *
 * Compartilha a instância única de `useDashboardLayout()` entre os
 * componentes filhos do `DashboardCanvas`. Sem isso, o `CanvasGrid` e os
 * controles de edição (FAB de adicionar, dialog de reset) acabariam
 * chamando `useDashboardLayout()` separadamente — cada um com seu próprio
 * estado e seu próprio fetch.
 */

import { createContext, useContext, type ReactNode } from "react";

import { useDashboardLayout, type UseDashboardLayoutReturn } from "./useDashboardLayout";

const DashboardLayoutContext = createContext<UseDashboardLayoutReturn | null>(null);

export function DashboardLayoutProvider({ children }: { children: ReactNode }) {
  const value = useDashboardLayout();
  return (
    <DashboardLayoutContext.Provider value={value}>
      {children}
    </DashboardLayoutContext.Provider>
  );
}

export function useDashboardLayoutContext(): UseDashboardLayoutReturn {
  const ctx = useContext(DashboardLayoutContext);
  if (!ctx) {
    throw new Error(
      "useDashboardLayoutContext must be used inside <DashboardLayoutProvider>",
    );
  }
  return ctx;
}

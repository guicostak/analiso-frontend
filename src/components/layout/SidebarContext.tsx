"use client";

import { createContext, useContext, useState } from "react";

interface SidebarCtx {
  isCollapsed: boolean;
  toggle: () => void;
}

const SidebarContext = createContext<SidebarCtx | null>(null);

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  return (
    <SidebarContext.Provider value={{ isCollapsed, toggle: () => setIsCollapsed((p) => !p) }}>
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebar() {
  const ctx = useContext(SidebarContext);
  if (!ctx) throw new Error("useSidebar must be used within SidebarProvider");
  return ctx;
}

"use client";

import { useSidebar } from "./SidebarContext";

interface MainContentProps {
  className?: string;
  children: React.ReactNode;
}

/** Wrapper do conteúdo principal que ajusta a margem ao colapso do Sidebar. */
export function MainContent({ className = "", children }: MainContentProps) {
  const { isCollapsed } = useSidebar();
  return (
    <main
      className={`transition-[margin] duration-200 ${
        isCollapsed ? "xl:ml-[64px]" : "xl:ml-[240px]"
      } ${className}`}
    >
      {children}
    </main>
  );
}

"use client";

import {
  Bookmark,
  Building2,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Compass,
  GitCompare,
  Home,
  LayoutGrid,
  NotebookPen,
  SearchCheck,
  Users,
} from "lucide-react";
import Link from "next/link";
import type { ComponentType } from "react";
import { SidebarPlanCard } from "./SidebarPlanCard";
import { useSidebar } from "./SidebarContext";

// ─── Tipos e config ────────────────────────────────────────────────────────────

interface SidebarProps {
  currentPage?: string;
}

interface NavItem {
  id: string;
  label: string;
  href: string;
  icon: ComponentType<{ className?: string }>;
}

type NavGroup = { items: NavItem[] };

const GROUPS: NavGroup[] = [
  {
    items: [
      { id: "dashboard", label: "Painel de hoje",    href: "/dashboard", icon: Home },
      { id: "explorar",  label: "Explorar mercado",  href: "/explorar",  icon: Compass },
      { id: "watchlist", label: "Watchlist",          href: "/watchlist", icon: LayoutGrid },
      { id: "comparar",  label: "Comparar empresas", href: "/comparar",  icon: GitCompare },
      { id: "busca",     label: "Busca avançada",    href: "/busca",     icon: SearchCheck },
    ],
  },
  {
    items: [
      { id: "agenda",    label: "Agenda",   href: "#", icon: CalendarDays },
      { id: "notas",     label: "Notas",    href: "#", icon: NotebookPen },
      { id: "empresas",  label: "Empresas", href: "#", icon: Building2 },
      { id: "time",      label: "Time",     href: "#", icon: Users },
      { id: "bookmarks", label: "Salvos",   href: "#", icon: Bookmark },
    ],
  },
];

// ─── Item de navegação ─────────────────────────────────────────────────────────

function NavItemRow({
  item,
  isActive,
  isCollapsed,
}: {
  item: NavItem;
  isActive: boolean;
  isCollapsed: boolean;
}) {
  const Icon = item.icon;

  const inner = (
    <span
      title={isCollapsed ? item.label : undefined}
      className={`group relative flex items-center rounded-[10px] py-2 transition-all duration-150
        ${isActive
          ? "bg-brand-surface"
          : "hover:bg-hover hover:shadow-[0_1px_3px_rgba(0,0,0,0.05)]"}
        ${isCollapsed ? "justify-center px-2" : "gap-3 px-3"}
      `}
    >
      {isActive && !isCollapsed && (
        <span className="absolute left-0 top-1/2 h-4 w-[3px] -translate-y-1/2 rounded-full bg-brand" />
      )}
      <span className={`transition-colors ${isActive ? "text-brand" : "text-muted-foreground group-hover:text-foreground"}`}>
        <Icon className="h-[17px] w-[17px] shrink-0" />
      </span>
      {!isCollapsed && (
        <span className={`text-[13px] transition-colors ${isActive ? "font-semibold text-foreground" : "font-medium text-muted-foreground group-hover:text-foreground"}`}>
          {item.label}
        </span>
      )}
    </span>
  );

  if (item.href.startsWith("/")) {
    return <Link href={item.href}>{inner}</Link>;
  }
  return <button className="w-full text-left">{inner}</button>;
}

// ─── Sidebar ───────────────────────────────────────────────────────────────────

export function Sidebar({ currentPage = "dashboard" }: SidebarProps) {
  const { isCollapsed, toggle } = useSidebar();

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-30 hidden overflow-y-auto border-r border-sidebar-border bg-sidebar transition-[width] duration-200 xl:block
        ${isCollapsed ? "w-[64px]" : "w-[240px]"}`}
    >
      <div className="flex min-h-full flex-col">

        {/* ── Topo minimalista com botão de colapso ── */}
        <div
          className={`sticky top-0 z-10 flex h-14 shrink-0 items-center border-b border-sidebar-border bg-sidebar
            ${isCollapsed ? "justify-center px-0" : "justify-end px-3"}`}
        >
          <button
            onClick={toggle}
            title={isCollapsed ? "Expandir menu" : "Recolher menu"}
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-hover hover:text-foreground"
          >
            {isCollapsed
              ? <ChevronRight className="h-4 w-4" />
              : <ChevronLeft className="h-4 w-4" />}
          </button>
        </div>

        {/* ── Nav ── */}
        <nav className={`flex-1 py-4 ${isCollapsed ? "px-2" : "px-3"}`}>
          <div className="flex flex-col gap-0.5">
            {GROUPS.flatMap((group) => group.items).map((item) => (
              <NavItemRow
                key={item.id}
                item={item}
                isActive={item.id === currentPage}
                isCollapsed={isCollapsed}
              />
            ))}
          </div>
        </nav>

        {/* ── Plano — sticky no rodapé ── */}
        {!isCollapsed && (
          <div className="sticky bottom-0 shrink-0 border-t border-sidebar-border bg-sidebar px-3 py-3">
            <SidebarPlanCard />
          </div>
        )}

      </div>
    </aside>
  );
}

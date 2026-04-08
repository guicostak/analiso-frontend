"use client";

import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  GitCompare,
  Globe,
  Home,
  LayoutGrid,
  Radar,
  Search,
} from "lucide-react";
import Link from "next/link";
import logoImage from "@/src/assets/logos/logo.png";
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
      { id: "dashboard",  label: "Meu Painel",           href: "/painel",     icon: LayoutGrid },
      { id: "mercado",   label: "Mercado",              href: "/mercado",    icon: Globe },
      { id: "buscar",    label: "Buscar ações",        href: "/buscar",     icon: Search },
      { id: "watchlist",  label: "Watchlist",             href: "/watchlist",  icon: Radar },
      { id: "comparar",  label: "Comparar empresas",   href: "/comparar",   icon: GitCompare },
    ],
  },
  {
    items: [
      { id: "agenda", label: "Agenda", href: "/agenda", icon: CalendarDays },
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
      className={`group relative flex items-center rounded-[10px] py-2 transition-[background-color,box-shadow] duration-150 ease-[var(--ease-out)]
        ${isActive
          ? "bg-brand-surface"
          : "hover:bg-hover hover:shadow-[0_1px_3px_rgba(0,0,0,0.05)]"}
        ${isCollapsed ? "justify-center px-2" : "gap-3 px-3"}
      `}
    >
      {isActive && !isCollapsed && (
        <span className="absolute left-0 top-1/2 h-4 w-[3px] -translate-y-1/2 rounded-full bg-brand" />
      )}
      <span className={`transition-colors duration-150 ease-[var(--ease-out)] ${isActive ? "text-brand" : "text-muted-foreground group-hover:text-foreground"}`}>
        <Icon className="h-[15px] w-[15px] shrink-0" />
      </span>
      {!isCollapsed && (
        <span className={`text-[14px] transition-colors duration-150 ease-[var(--ease-out)] ${isActive ? "font-semibold text-foreground" : "font-medium text-muted-foreground group-hover:text-foreground"}`}>
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
      className={`fixed inset-y-0 left-0 z-30 hidden overflow-y-auto border-r border-sidebar-border bg-sidebar transition-[width] duration-200 ease-[var(--ease-out)] xl:block
        ${isCollapsed ? "w-[64px]" : "w-[240px]"}`}
    >
      <div className="flex min-h-full flex-col">

        {/* ── Topo: logo + botão de colapso ── */}
        <div
          className={`sticky top-0 z-10 flex h-14 shrink-0 items-center border-b border-sidebar-border bg-sidebar
            ${isCollapsed ? "justify-center px-0" : "justify-between px-4"}`}
        >
          {!isCollapsed && (
            <img
              src={logoImage.src}
              alt="Analiso"
              className="h-[34px] w-auto"
              draggable="false"
            />
          )}
          <button
            onClick={toggle}
            title={isCollapsed ? "Expandir menu" : "Recolher menu"}
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-[background-color,color] duration-150 ease-[var(--ease-out)] hover:bg-hover hover:text-foreground"
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

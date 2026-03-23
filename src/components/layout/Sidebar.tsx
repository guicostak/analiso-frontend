"use client";

import {
  Bookmark,
  Building2,
  CalendarDays,
  Compass,
  GitCompare,
  Home,
  LayoutGrid,
  NotebookPen,
  Users,
} from "lucide-react";
import Link from "next/link";
import type { ComponentType } from "react";
import { SidebarPlanCard } from "./SidebarPlanCard";

interface SidebarProps {
  currentPage?: string;
  contextLabel?: string;
}

type SidebarGroup = {
  title: string;
  items: Array<{
    id: string;
    label: string;
    href: string;
    icon: ComponentType<{ className?: string }>;
  }>;
};

const sidebarGroups: SidebarGroup[] = [
  {
    title: "Geral",
    items: [
      { id: "dashboard", label: "Painel de hoje", href: "/dashboard", icon: Home },
      { id: "explorar", label: "Explorar mercado", href: "/explorar", icon: Compass },
      { id: "watchlist", label: "Watchlist", href: "/watchlist", icon: LayoutGrid },
      { id: "comparar", label: "Comparar empresas", href: "/comparar", icon: GitCompare },
    ],
  },
  {
    title: "Apoios",
    items: [
      { id: "agenda", label: "Agenda", href: "#", icon: CalendarDays },
      { id: "notas", label: "Notas", href: "#", icon: NotebookPen },
      { id: "empresas", label: "Empresas", href: "#", icon: Building2 },
      { id: "time", label: "Time", href: "#", icon: Users },
      { id: "bookmarks", label: "Salvos", href: "#", icon: Bookmark },
    ],
  },
];

export function Sidebar({
  currentPage = "dashboard",
  contextLabel = "Minha watchlist",
}: SidebarProps) {
  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-[240px] border-r border-[#EEF2F6] bg-white xl:block">
      <div className="flex h-full flex-col px-5 py-7">
        <div className="pb-6">
          <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#B0B0B0]">Contexto</p>
          <p className="mt-2 text-[15px] font-semibold text-[#171717]">{contextLabel}</p>
        </div>

        <div className="space-y-8">
          {sidebarGroups.map((group) => (
            <div key={group.title}>
              <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.08em] text-[#B0B0B0]">
                {group.title}
              </p>
              <div className="space-y-1">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = item.id === currentPage;
                  const content = (
                    <span className="relative flex items-center gap-3 rounded-[12px] px-3 py-2.5 text-[14px] transition hover:bg-[#FAFAFA]">
                      {isActive ? (
                        <span className="absolute left-0 top-1/2 h-4 w-[3px] -translate-y-1/2 rounded-full bg-[#12A594]" />
                      ) : null}
                      <span className={`${isActive ? "text-[#171717]" : "text-[#8A8A8A]"}`}>
                        <Icon className="h-[18px] w-[18px]" />
                      </span>
                      <span className={isActive ? "font-semibold text-[#171717]" : "font-medium text-[#7A7A7A]"}>
                        {item.label}
                      </span>
                    </span>
                  );

                  if (item.href.startsWith("/")) {
                    return (
                      <Link key={item.id} href={item.href}>
                        {content}
                      </Link>
                    );
                  }

                  return (
                    <button key={item.id} className="w-full text-left">
                      {content}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        <SidebarPlanCard />
      </div>
    </aside>
  );
}

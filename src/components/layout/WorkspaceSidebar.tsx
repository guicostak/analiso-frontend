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
  Sparkles,
  Users,
} from "lucide-react";
import Link from "next/link";
import type { ComponentType } from "react";

interface WorkspaceSidebarProps {
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

export function WorkspaceSidebar({
  currentPage = "dashboard",
  contextLabel = "Minha watchlist",
}: WorkspaceSidebarProps) {
  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-[240px] border-r border-[#EEF2F6] bg-white xl:block">
      <div className="flex h-full flex-col px-5 py-6">
        <button className="flex items-center justify-between rounded-[18px] border border-[#EEF2F6] bg-[#FAFCFD] px-4 py-3 text-left">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-[#98A2B3]">Contexto</p>
            <p className="mt-0.5 text-[15px] font-semibold text-[#0F1728]">{contextLabel}</p>
          </div>
          <Sparkles className="h-4 w-4 text-[#12A594]" />
        </button>

        <div className="mt-8 space-y-8">
          {sidebarGroups.map((group) => (
            <div key={group.title}>
              <p className="mb-3 text-[11px] font-medium uppercase tracking-[0.08em] text-[#98A2B3]">
                {group.title}
              </p>
              <div className="space-y-1.5">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = item.id === currentPage;
                  const content = (
                    <span
                      className={`flex items-center gap-3 rounded-[16px] px-3.5 py-3 text-[14px] transition ${
                        isActive
                          ? "bg-[#F3FAF8] text-[#0F1728]"
                          : "text-[#667085] hover:bg-[#F8FBFD] hover:text-[#0F1728]"
                      }`}
                    >
                      <span
                        className={`grid h-8 w-8 place-items-center rounded-full ${
                          isActive ? "bg-white text-[#12A594]" : "bg-[#F7FAFC] text-[#98A2B3]"
                        }`}
                      >
                        <Icon className="h-4 w-4" />
                      </span>
                      <span className={isActive ? "font-semibold" : "font-medium"}>{item.label}</span>
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
      </div>
    </aside>
  );
}

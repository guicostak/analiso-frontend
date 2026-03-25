"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Bookmark,
  Building2,
  CalendarDays,
  Compass,
  GitCompare,
  Home,
  LayoutGrid,
  Menu,
  NotebookPen,
  Users,
} from "lucide-react";
import type { ComponentType } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/src/components/ui/sheet";
import { SidebarPlanCard } from "./SidebarPlanCard";

interface MobileNavProps {
  currentPage?: string;
  contextLabel?: string;
}

type NavGroup = {
  title: string;
  items: Array<{
    id: string;
    label: string;
    href: string;
    icon: ComponentType<{ className?: string }>;
  }>;
};

const navGroups: NavGroup[] = [
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

export function MobileNav({
  currentPage = "dashboard",
  contextLabel = "Minha watchlist",
}: MobileNavProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        className="flex h-9 w-9 items-center justify-center rounded-lg transition-colors hover:bg-hover xl:hidden"
        onClick={() => setOpen(true)}
        aria-label="Abrir menu"
      >
        <Menu className="h-5 w-5 text-muted-foreground" />
      </button>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="left" className="w-[280px] p-0">
          <SheetHeader className="border-b border-border px-5 py-5">
            <SheetTitle className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#B0B0B0]">
              Contexto
            </SheetTitle>
            <p className="text-[15px] font-semibold text-[#171717]">{contextLabel}</p>
          </SheetHeader>

          <nav className="flex-1 overflow-y-auto px-5 py-4">
            <div className="space-y-8">
              {navGroups.map((group) => (
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
                          {isActive && (
                            <span className="absolute left-0 top-1/2 h-4 w-[3px] -translate-y-1/2 rounded-full bg-[#12A594]" />
                          )}
                          <span className={isActive ? "text-[#171717]" : "text-[#8A8A8A]"}>
                            <Icon className="h-[18px] w-[18px]" />
                          </span>
                          <span className={isActive ? "font-semibold text-[#171717]" : "font-medium text-[#7A7A7A]"}>
                            {item.label}
                          </span>
                        </span>
                      );

                      if (item.href.startsWith("/")) {
                        return (
                          <Link key={item.id} href={item.href} onClick={() => setOpen(false)}>
                            {content}
                          </Link>
                        );
                      }

                      return (
                        <button key={item.id} className="w-full text-left" onClick={() => setOpen(false)}>
                          {content}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </nav>

          <div className="border-t border-border px-5 py-4">
            <SidebarPlanCard />
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}

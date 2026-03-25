"use client";

import { Bell, Moon, Search, Settings, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { UserNavMenu } from "./UserNavMenu";
import { MobileNav } from "./MobileNav";

interface AppTopBarProps {
  sidebarOffsetClassName?: string;
}

export function AppTopBar({ sidebarOffsetClassName = "left-[88px]" }: AppTopBarProps) {
  const { setTheme, resolvedTheme } = useTheme();

  return (
    <header className={`fixed top-0 right-0 z-20 h-14 border-b border-border bg-card ${sidebarOffsetClassName}`}>
      <div className="flex h-full items-center justify-between px-6">

        {/* Mobile menu + Search */}
        <div className="flex min-w-0 flex-1 items-center gap-2">
          <MobileNav />
          <div className="hidden h-9 w-full max-w-[430px] items-center rounded-lg border border-border bg-muted px-3 md:flex">
            <Search className="h-4 w-4 text-muted-foreground" />
            <input
              className="h-full w-full border-0 bg-transparent px-2 text-[13px] text-foreground outline-none placeholder:text-muted-foreground"
              placeholder="Busque empresa ou ticker..."
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1">

          {/* Notificações */}
          <button
            className="relative flex h-9 w-9 items-center justify-center rounded-lg transition-colors hover:bg-hover"
            aria-label="Notificações"
          >
            <Bell className="h-[18px] w-[18px] text-muted-foreground" />
            <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-notification" />
          </button>

          {/* Configurações */}
          <button
            className="flex h-9 w-9 items-center justify-center rounded-lg transition-colors hover:bg-hover"
            aria-label="Configurações"
          >
            <Settings className="h-[18px] w-[18px] text-muted-foreground" />
          </button>

          {/* Alternar tema */}
          <button
            className="flex h-9 w-9 items-center justify-center rounded-lg transition-colors hover:bg-hover"
            onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
            aria-label="Alternar tema"
          >
            {/* Sun visível apenas no dark, Moon visível apenas no light */}
            <Sun className="hidden h-[18px] w-[18px] text-gold dark:block" />
            <Moon className="block h-[18px] w-[18px] text-muted-foreground dark:hidden" />
          </button>

          {/* Avatar / Sair */}
          <UserNavMenu />

        </div>
      </div>
    </header>
  );
}

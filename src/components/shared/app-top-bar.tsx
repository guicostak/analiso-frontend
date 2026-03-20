"use client";

import { Bell, Moon, Search, Settings, Sun, UserCircle2 } from "lucide-react";
import { useTheme } from "next-themes";
import { useAuth } from "../../contexts/AuthContext";

export function AppTopBar() {
  const { setTheme, resolvedTheme } = useTheme();
  const { user, logout } = useAuth();

  return (
    <header className="fixed top-0 left-[88px] right-0 z-20 h-12 border-b border-border bg-card">
      <div className="flex h-full items-center justify-between px-6">

        {/* Search */}
        <div className="flex min-w-0 flex-1 items-center gap-2">
          <div className="hidden h-8 w-full max-w-[430px] items-center rounded-lg border border-border-strong bg-muted px-3 md:flex">
            <Search className="h-4 w-4 text-muted-foreground" />
            <input
              className="h-7 w-full border-0 bg-transparent px-2 text-[13px] text-foreground outline-none placeholder:text-muted-foreground"
              placeholder="Busque empresa ou ticker..."
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1">

          {/* Notificações */}
          <button
            className="relative flex h-8 w-8 items-center justify-center rounded-full transition-colors hover:bg-hover"
            aria-label="Notificações"
          >
            <Bell className="h-5 w-5 text-muted-foreground" />
            <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-notification" />
          </button>

          {/* Configurações */}
          <button
            className="flex h-8 w-8 items-center justify-center rounded-full transition-colors hover:bg-hover"
            aria-label="Configurações"
          >
            <Settings className="h-5 w-5 text-muted-foreground" />
          </button>

          {/* Alternar tema */}
          <button
            className="flex h-8 w-8 items-center justify-center rounded-full transition-colors hover:bg-hover"
            onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
            aria-label="Alternar tema"
          >
            {/* Sun visível apenas no dark, Moon visível apenas no light */}
            <Sun className="hidden h-5 w-5 text-gold dark:block" />
            <Moon className="block h-5 w-5 text-muted-foreground dark:hidden" />
          </button>

          {/* Avatar / Sair */}
          <button
            onClick={logout}
            title="Sair"
            className="h-8 w-8 overflow-hidden rounded-full border border-border-strong transition-opacity hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-brand/40"
          >
            {user?.picture ? (
              <img src={user.picture} alt={user.name ?? "Perfil"} className="h-full w-full object-cover" />
            ) : (
              <UserCircle2 className="m-auto h-5 w-5 text-muted-foreground" />
            )}
          </button>

        </div>
      </div>
    </header>
  );
}

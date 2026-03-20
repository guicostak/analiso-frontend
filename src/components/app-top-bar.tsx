"use client";

import { Bell, Moon, Search, Settings, Sun, UserCircle2 } from "lucide-react";
import { useTheme } from "next-themes";
import { useAuth } from "../contexts/AuthContext";
import { cn } from "./ui/utils";

export function AppTopBar() {
  const { resolvedTheme, setTheme } = useTheme();
  const isDarkMode = resolvedTheme === "dark";
  const { user, logout } = useAuth();

  return (
    <header
      className={cn(
        "fixed top-0 left-[88px] right-0 z-20 h-12 border-b",
        isDarkMode ? "border-[#1F2937] bg-[#0B1220]" : "border-slate-200 bg-white",
      )}
    >
      <div className="flex h-full items-center justify-between px-6">
        {/* Search */}
        <div className="flex min-w-0 flex-1 items-center gap-2">
          <div
            className={cn(
              "hidden h-8 w-full max-w-[430px] items-center rounded-lg border px-3 md:flex",
              isDarkMode ? "border-[#334155] bg-[#0F172A]" : "border-slate-200 bg-slate-50",
            )}
          >
            <Search className="h-4 w-4 text-slate-400" />
            <input
              className={cn(
                "h-7 w-full border-0 bg-transparent px-2 text-[13px] outline-none placeholder:text-slate-400",
                isDarkMode ? "text-[#E5E7EB]" : "text-slate-900",
              )}
              placeholder="Busque empresa ou ticker..."
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1">
          {/* Bell */}
          <button
            className={cn(
              "relative flex h-8 w-8 items-center justify-center rounded-full transition-colors",
              isDarkMode ? "hover:bg-[#1F2937]" : "hover:bg-slate-100",
            )}
            aria-label="Notificações"
          >
            <Bell className={cn("h-5 w-5", isDarkMode ? "text-slate-400" : "text-slate-500")} />
            <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-[#DC2626]" />
          </button>

          {/* Settings */}
          <button
            className={cn(
              "flex h-8 w-8 items-center justify-center rounded-full transition-colors",
              isDarkMode ? "hover:bg-[#1F2937]" : "hover:bg-slate-100",
            )}
            aria-label="Configurações"
          >
            <Settings className={cn("h-5 w-5", isDarkMode ? "text-slate-400" : "text-slate-500")} />
          </button>

          {/* Theme toggle */}
          <button
            className={cn(
              "flex h-8 w-8 items-center justify-center rounded-full transition-colors",
              isDarkMode ? "hover:bg-[#1F2937]" : "hover:bg-slate-100",
            )}
            onClick={() => setTheme(isDarkMode ? "light" : "dark")}
            aria-label={isDarkMode ? "Ativar modo claro" : "Ativar modo escuro"}
          >
            {isDarkMode
              ? <Sun className="h-5 w-5 text-[#FBBF24]" />
              : <Moon className="h-5 w-5 text-slate-500" />
            }
          </button>

          {/* User avatar */}
          <button
            onClick={logout}
            title="Sair"
            className={cn(
              "h-8 w-8 overflow-hidden rounded-full border transition-opacity hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-[#0E9384]/40",
              isDarkMode ? "border-[#334155]" : "border-slate-200",
            )}
          >
            {user?.picture ? (
              <img src={user.picture} alt={user.name ?? "Perfil"} className="h-full w-full object-cover" />
            ) : (
              <UserCircle2
                className={cn("m-auto h-5 w-5", isDarkMode ? "text-slate-400" : "text-slate-500")}
              />
            )}
          </button>
        </div>
      </div>
    </header>
  );
}

"use client";

import { Bell, CreditCard, LogOut, Moon, Search, Settings, Sliders, Sun, User, UserCircle2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useTheme } from "next-themes";
import { useAuth } from "@/src/features/auth/AuthContext";
import { Button } from "@/src/components/ui/button";

export function AppTopBar() {
  const { setTheme, resolvedTheme } = useTheme();
  const { user, logout } = useAuth();
  const [profileOpen, setProfileOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    }
    if (profileOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [profileOpen]);

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
          <Button variant="ghost" size="icon-round" aria-label="Notificações" className="relative">
            <Bell className="h-5 w-5 text-muted-foreground" />
            <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-notification" />
          </Button>

          {/* Configurações */}
          <Button variant="ghost" size="icon-round" aria-label="Configurações">
            <Settings className="h-5 w-5 text-muted-foreground" />
          </Button>

          {/* Alternar tema */}
          <Button
            variant="ghost"
            size="icon-round"
            onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
            aria-label="Alternar tema"
          >
            <Sun className="hidden h-5 w-5 text-gold dark:block" />
            <Moon className="block h-5 w-5 text-muted-foreground dark:hidden" />
          </Button>

          {/* Avatar + dropdown de perfil */}
          <div ref={dropdownRef} className="relative">
            <button
              onClick={() => setProfileOpen((prev) => !prev)}
              aria-label="Menu de perfil"
              className="h-8 w-8 overflow-hidden rounded-full border border-border-strong transition-opacity hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-brand/40"
            >
              {user?.picture ? (
                <img src={user.picture} alt={user.name ?? "Perfil"} className="h-full w-full object-cover" />
              ) : (
                <UserCircle2 className="m-auto h-5 w-5 text-muted-foreground" />
              )}
            </button>

            {profileOpen && (
              <div className="absolute right-0 top-10 z-50 w-52 rounded-xl border border-border bg-card shadow-lg">
                {/* Cabeçalho com nome */}
                <div className="border-b border-border px-4 py-3">
                  <p className="text-[13px] font-medium text-foreground truncate">{user?.name ?? "Minha conta"}</p>
                  <p className="text-[11px] text-muted-foreground truncate">{user?.email ?? ""}</p>
                </div>

                {/* Itens */}
                <div className="p-1">
                  <Button variant="menu-item" size="sm" onClick={() => setProfileOpen(false)}>
                    <User className="h-4 w-4 text-muted-foreground" />
                    Perfil
                  </Button>
                  <Button variant="menu-item" size="sm" onClick={() => setProfileOpen(false)}>
                    <Sliders className="h-4 w-4 text-muted-foreground" />
                    Preferências
                  </Button>
                  <Button variant="menu-item" size="sm" onClick={() => setProfileOpen(false)}>
                    <CreditCard className="h-4 w-4 text-muted-foreground" />
                    Cobrança
                  </Button>
                </div>

                <div className="border-t border-border p-1">
                  <Button
                    variant="menu-item-destructive"
                    size="sm"
                    onClick={() => { setProfileOpen(false); logout(); }}
                  >
                    <LogOut className="h-4 w-4" />
                    Sair
                  </Button>
                </div>
              </div>
            )}
          </div>

        </div>
      </div>
    </header>
  );
}

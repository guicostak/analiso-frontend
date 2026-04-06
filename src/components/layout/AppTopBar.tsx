"use client";

import { Moon, Search, SlidersHorizontal, Sun } from "lucide-react";
import { NotificationsBell, NotificationsDropdown } from "@/src/features/notifications/components";
import { useTheme } from "next-themes";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { useAnimatedPlaceholder } from "@/src/hooks/useAnimatedPlaceholder";
import { SearchAutocomplete, type SuggestResult } from "@/src/components/shared/SearchAutocomplete";
import { BuscaFiltersPanel } from "@/src/features/busca/components/BuscaFiltersPanel";
import type { CompanySearchFilters } from "@/src/features/explore/services/search.service";
import { UserNavMenu } from "./UserNavMenu";
import { MobileNav } from "./MobileNav";
import { LuizNavbarButton } from "@/src/features/luiz/components";
import { useSidebar } from "./SidebarContext";

// ─── Serializa filtros → URL ─────────────────────────────────────────────────

function buildSearchUrl(query: string, filters: CompanySearchFilters): string {
  const params = new URLSearchParams();
  if (query) params.set("query", query);
  if (filters.sector) params.set("setor", filters.sector);

  const numericMap: Array<[keyof CompanySearchFilters, string]> = [
    ["plMin",           "pl_min"],
    ["plMax",           "pl_max"],
    ["pvpMin",          "pvp_min"],
    ["pvpMax",          "pvp_max"],
    ["dyMin",           "dy_min"],
    ["dyMax",           "dy_max"],
    ["roeMin",          "roe_min"],
    ["roeMax",          "roe_max"],
    ["roicMin",         "roic_min"],
    ["margemMin",       "margem_min"],
    ["dividaEbitdaMax", "divida_ebitda_max"],
    ["evEbitdaMax",     "ev_ebitda_max"],
  ];

  for (const [key, param] of numericMap) {
    const v = filters[key];
    if (v != null) params.set(param, String(v));
  }

  const qs = params.toString();
  return `/buscar${qs ? `?${qs}` : ""}`;
}

const SKIP_COUNT_KEYS = new Set(["page", "size", "sortBy", "sortOrder", "query", "sector"]);

function countActiveFilters(filters: CompanySearchFilters): number {
  return Object.entries(filters).filter(
    ([k, v]) => v != null && v !== "" && !SKIP_COUNT_KEYS.has(k),
  ).length;
}

// ─── Componente ───────────────────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface AppTopBarProps {
  /** @deprecated offset is now computed from SidebarContext */
  sidebarOffsetClassName?: string;
}

export function AppTopBar(_props: AppTopBarProps) {
  const { setTheme, resolvedTheme } = useTheme();
  const { isCollapsed } = useSidebar();
  const offsetClass = isCollapsed ? "left-0 xl:left-[64px]" : "left-0 xl:left-[240px]";
  const router = useRouter();

  const [query,           setQuery]       = useState("");
  const [showDropdown,    setDropdown]    = useState(false);
  const [filterOpen,      setFilterOpen]  = useState(false);
  const [searchFilters,   setSearchFilters] = useState<CompanySearchFilters>({});

  const searchContainerRef = useRef<HTMLDivElement>(null);
  const inputRef           = useRef<HTMLInputElement>(null);

  const activeFilterCount   = countActiveFilters(searchFilters);
  const [notifOpen, setNotifOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  const closeNotif = useCallback(() => setNotifOpen(false), []);
  const [isFocused, setFocused] = useState(false);
  const animatedPlaceholder = useAnimatedPlaceholder(!query && !isFocused);

  // Fecha painel de filtros ao clicar fora do container de busca
  useEffect(() => {
    function handlePointerDown(e: PointerEvent) {
      if (
        filterOpen &&
        searchContainerRef.current &&
        !searchContainerRef.current.contains(e.target as Node)
      ) {
        setFilterOpen(false);
      }
    }
    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [filterOpen]);

  function navigate(q: string) {
    setDropdown(false);
    setFilterOpen(false);
    router.push(buildSearchUrl(q, searchFilters));
  }

  function handleSelect(item: SuggestResult) {
    setQuery(item.ticker);
    navigate(item.ticker);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" && query.trim()) {
      navigate(query.trim());
    }
  }

  function clearAllFilters() {
    setSearchFilters({});
  }

  return (
    <header className={`fixed top-0 right-0 z-20 h-14 border-b border-border bg-card transition-[left] duration-200 ease-[var(--ease-out)] ${offsetClass}`}>
      <div className="flex h-full items-center justify-between px-6">

        {/* Mobile menu + Search */}
        <div className="flex min-w-0 flex-1 items-center gap-2">
          <MobileNav />

          {/* Container de busca (input + filtros) */}
          <div
            ref={searchContainerRef}
            className="relative hidden w-full max-w-[460px] md:block"
          >
            {/* Linha do input */}
            <div className="flex h-9 w-full items-center rounded-lg border border-border bg-muted px-3">
              <Search className="h-4 w-4 shrink-0 text-muted-foreground" />

              <input
                ref={inputRef}
                value={query}
                onChange={(e) => { setQuery(e.target.value); setDropdown(true); }}
                onFocus={() => { setFocused(true); if (query) setDropdown(true); }}
                onBlur={() => setFocused(false)}
                onKeyDown={handleKeyDown}
                className="h-full w-full border-0 bg-transparent px-2 text-[13px] text-foreground outline-none placeholder:text-muted-foreground"
                placeholder={animatedPlaceholder ? `Procurar por ${animatedPlaceholder}` : "Procurar por"}
                autoComplete="off"
              />

              {/* Separador */}
              <div className="mx-2 h-4 w-px shrink-0 bg-border" />

              {/* Botão de filtros avançados */}
              <button
                type="button"
                onClick={() => { setFilterOpen((p) => !p); setDropdown(false); }}
                aria-label="Filtros avançados"
                className={`relative flex h-6 w-6 shrink-0 items-center justify-center rounded transition-colors duration-150 ease-[var(--ease-out)] ${
                  filterOpen || activeFilterCount > 0
                    ? "text-brand"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <SlidersHorizontal className="h-3.5 w-3.5" />
                {activeFilterCount > 0 && (
                  <span className="absolute -right-0.5 -top-0.5 flex h-3.5 min-w-[14px] items-center justify-center rounded-full bg-brand px-0.5 text-[9px] font-bold leading-none text-white">
                    {activeFilterCount}
                  </span>
                )}
              </button>
            </div>

            {/* Dropdown de autocomplete */}
            {showDropdown && (
              <SearchAutocomplete
                query={query}
                onSelect={handleSelect}
                onClose={() => setDropdown(false)}
              />
            )}

            {/* Painel de filtros avançados */}
            {filterOpen && (
              <div className="absolute left-0 right-0 top-[calc(100%+6px)] z-50 rounded-xl border border-border bg-card shadow-[0_8px_32px_rgba(0,0,0,0.12)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.5)] animate-in fade-in-0 zoom-in-[0.97] duration-150 ease-[var(--ease-out)] origin-top">
                {/* Cabeçalho */}
                <div className="flex items-center justify-between border-b border-border px-4 py-2.5">
                  <span className="text-[13px] font-semibold text-foreground">Filtros avançados</span>
                  {activeFilterCount > 0 && (
                    <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-brand px-1.5 text-[10px] font-bold text-white">
                      {activeFilterCount}
                    </span>
                  )}
                </div>

                {/* Filtros — sem scroll */}
                <div className="p-3">
                  <BuscaFiltersPanel
                    filters={searchFilters}
                    isLoading={false}
                    onUpdateFilters={(partial) =>
                      setSearchFilters((prev) => ({ ...prev, ...partial }))
                    }
                    onClearFilters={clearAllFilters}
                    isOpen={true}
                  />
                </div>

                {/* Rodapé — sempre visível */}
                <div className="flex gap-2 border-t border-border p-3">
                  <button
                    type="button"
                    onClick={clearAllFilters}
                    className="flex-1 rounded-lg border border-border bg-muted py-2 text-[13px] font-semibold text-foreground transition-[background-color,color] duration-150 ease-[var(--ease-out)] hover:bg-hover"
                  >
                    Limpar filtros
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate(query)}
                    className="flex-1 rounded-lg bg-brand py-2 text-[13px] font-semibold text-white transition-[background-color,opacity] duration-150 ease-[var(--ease-out)] hover:bg-brand-hover"
                  >
                    Aplicar filtros
                  </button>
                </div>
              </div>
            )}
          </div>

          <LuizNavbarButton />
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1">

          <div ref={notifRef} className="relative">
            <NotificationsBell
              open={notifOpen}
              onToggle={() => { setNotifOpen((p) => !p); setFilterOpen(false); setDropdown(false); }}
            />
            <NotificationsDropdown open={notifOpen} onClose={closeNotif} />
          </div>

          <button
            className="flex h-9 w-9 items-center justify-center rounded-lg transition-[background-color,color] duration-150 ease-[var(--ease-out)] hover:bg-hover"
            onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
            aria-label="Alternar tema"
          >
            <Sun className="hidden h-[18px] w-[18px] text-gold dark:block" />
            <Moon className="block h-[18px] w-[18px] text-muted-foreground dark:hidden" />
          </button>

          <UserNavMenu />
        </div>
      </div>
    </header>
  );
}

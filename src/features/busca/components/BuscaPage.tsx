"use client";

/**
 * BuscaPage
 *
 * Página de busca avançada de empresas com filtros por métricas
 * fundamentalistas e paginação via API GET /api/search.
 *
 * Segue architecture_skill.md: lógica no hook, HTTP no service, UI no componente.
 * Segue design_skill.md: tokens semânticos, tipografia, espaçamento 4px.
 * Segue responsive_skill.md: mobile-first, breakpoints Tailwind.
 */

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Search } from "lucide-react";
import { Sidebar } from "@/src/components/layout/Sidebar";
import { AppTopBar } from "@/src/components/layout/AppTopBar";
import { MainContent } from "@/src/components/layout/MainContent";
import { useCompanySearch } from "@/src/features/explore/hooks/useCompanySearch";
import type { CompanySearchFilters } from "@/src/features/explore/services/search.service";
import { BuscaFiltersPanel } from "./BuscaFiltersPanel";
import { BuscaResultsGrid } from "./BuscaResultsGrid";

/**
 * Mapeia query params do URL (snake_case do Luiz) para CompanySearchFilters.
 */
function parseUrlFilters(params: URLSearchParams): CompanySearchFilters {
  const mapping: Record<string, keyof CompanySearchFilters> = {
    query: "query",
    setor: "sector",
    pl_min: "plMin",
    pl_max: "plMax",
    pvp_min: "pvpMin",
    pvp_max: "pvpMax",
    dy_min: "dyMin",
    dy_max: "dyMax",
    roe_min: "roeMin",
    roe_max: "roeMax",
    roic_min: "roicMin",
    margem_min: "margemMin",
    divida_ebitda_max: "dividaEbitdaMax",
    ev_ebitda_max: "evEbitdaMax",
  };

  const filters: CompanySearchFilters = {};

  for (const [urlKey, filterKey] of Object.entries(mapping)) {
    const value = params.get(urlKey);
    if (value != null && value !== "") {
      if (filterKey === "sector" || filterKey === "query") {
        (filters as Record<string, unknown>)[filterKey] = value;
      } else {
        (filters as Record<string, unknown>)[filterKey] = Number(value);
      }
    }
  }

  return filters;
}

export function BuscaPage() {
  const searchParams = useSearchParams();
  const {
    items,
    page,
    totalPages,
    totalItems,
    isLoading,
    error,
    filters,
    search,
    goToPage,
    updateFilters,
    clearFilters,
  } = useCompanySearch();

  // Lê filtros do URL na montagem e dispara busca inicial
  useEffect(() => {
    const urlFilters = parseUrlFilters(searchParams);
    search({ ...urlFilters, page: 0, size: 20 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Sidebar currentPage="busca" />

      <AppTopBar sidebarOffsetClassName="left-0 xl:left-[240px]" />

      <MainContent className="relative overflow-hidden pt-20">
        {/* Decoração de fundo */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-[15%] top-0 h-80 w-80 rounded-full bg-[radial-gradient(circle,rgba(14,147,132,0.08)_0%,rgba(14,147,132,0)_72%)]" />
          <div className="absolute right-[8%] top-32 h-64 w-64 rounded-full bg-[radial-gradient(circle,rgba(91,141,239,0.06)_0%,rgba(91,141,239,0)_72%)]" />
        </div>

        <div className="relative px-4 pb-10 pt-5 sm:px-6">
          <div className="mx-auto max-w-[1380px]">
            {/* Header */}
            <header className="mb-6 space-y-2">
              <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-muted-foreground sm:text-[12px]">
                Busca avançada
              </p>
              <div className="max-w-[640px] space-y-2">
                <h1 className="text-[24px] font-semibold leading-[30px] tracking-[-0.04em] text-foreground sm:text-[30px] sm:leading-[34px]">
                  Buscar empresas
                </h1>
                <p className="text-[12px] leading-5 text-muted-foreground sm:text-[13px] sm:leading-6">
                  Filtre empresas por indicadores fundamentalistas e encontre oportunidades de investimento com base em métricas financeiras.
                </p>
              </div>
            </header>

            {/* Barra de busca por texto */}
            <div className="mb-6">
              <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Buscar por nome ou ticker..."
                  defaultValue={filters.query ?? ""}
                  onChange={(e) => {
                    const val = e.target.value.trim();
                    updateFilters({ query: val || undefined });
                  }}
                  className="h-10 w-full rounded-lg border border-border bg-card pl-10 pr-4 text-[13px] text-foreground placeholder:text-muted-foreground focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
                />
              </div>
            </div>

            {/* Filtros + Resultados */}
            <div className="flex flex-col gap-6 lg:flex-row">
              {/* Painel de filtros */}
              <aside className="w-full shrink-0 lg:w-[280px] xl:w-[300px]">
                <BuscaFiltersPanel
                  filters={filters}
                  isLoading={isLoading}
                  onUpdateFilters={updateFilters}
                  onClearFilters={clearFilters}
                />
              </aside>

              {/* Grid de resultados */}
              <div className="min-w-0 flex-1">
                <BuscaResultsGrid
                  items={items}
                  page={page}
                  totalPages={totalPages}
                  totalItems={totalItems}
                  isLoading={isLoading}
                  error={error}
                  onGoToPage={goToPage}
                  onRetry={() => search(filters)}
                />
              </div>
            </div>
          </div>
        </div>
      </MainContent>
    </div>
  );
}

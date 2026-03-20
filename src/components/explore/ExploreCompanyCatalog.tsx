"use client";

import { ChevronDown, Filter, ListFilter, Search, Star, X } from "lucide-react";
import Link from "next/link";
import type { CompanyCard, FilterKey, Filters, HighlightPreset } from "../../types/explore";

const statusColors: Record<CompanyCard["status"], string> = {
  Saudável: "bg-emerald-50 text-emerald-700 border-emerald-100",
  Atenção:  "bg-amber-50 text-amber-700 border-amber-100",
  Risco:    "bg-rose-50 text-rose-700 border-rose-100",
};

const freshnessColors: Record<CompanyCard["freshnessStatus"], string> = {
  Atualizado: "bg-emerald-50 text-emerald-700 border-emerald-100",
  Antigo:     "bg-amber-50 text-amber-700 border-amber-100",
};

const freshnessLabelMap: Record<CompanyCard["freshnessStatus"], string> = {
  Atualizado: "Fonte atualizada",
  Antigo:     "Fonte atrasada",
};

const pillars = ["Dívida", "Caixa", "Margens", "Retorno", "Proventos"];

interface ExploreCompanyCatalogProps {
  isLoading: boolean;
  filteredCompanies: CompanyCard[];
  filters: Filters;
  searchQuery: string;
  showAdvancedFilters: boolean;
  activePreset: HighlightPreset | null;
  appliedChips: string[];
  showStaleBanner: boolean;
  staleCount: number;
  selectedEntryPoints: string[];
  thesisCollections: string[];
  compareTickers: string[];
  getCompanyLogo: (ticker: string) => string | undefined;
  setSearchQuery: (q: string) => void;
  setFilters: (fn: ((prev: Filters) => Filters) | Filters) => void;
  setShowAdvancedFilters: (fn: ((prev: boolean) => boolean) | boolean) => void;
  toggleEntryPoint: (entry: string) => void;
  clearEntryPoints: () => void;
  clearPreset: () => void;
  toggleCompare: (ticker: string) => void;
  resetFilters: () => void;
}

export function ExploreCompanyCatalog({
  isLoading,
  filteredCompanies,
  filters,
  searchQuery,
  showAdvancedFilters,
  activePreset,
  appliedChips,
  showStaleBanner,
  staleCount,
  selectedEntryPoints,
  thesisCollections,
  compareTickers,
  getCompanyLogo,
  setSearchQuery,
  setFilters,
  setShowAdvancedFilters,
  toggleEntryPoint,
  clearEntryPoints,
  clearPreset,
  toggleCompare,
  resetFilters,
}: ExploreCompanyCatalogProps) {
  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold text-foreground">Empresas para você analisar</h3>
          <p className="text-xs text-muted-foreground">Catálogo explorável para aprofundar após abrir os destaques do dia.</p>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Filter className="w-4 h-4" />
          {filteredCompanies.length} empresas
        </div>
      </div>

      <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">Descobrir por tese</p>
      <div className="flex flex-wrap items-center gap-2">
        {thesisCollections.map((entry) => (
          <button
            key={entry}
            onClick={() => toggleEntryPoint(entry)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
              selectedEntryPoints.includes(entry)
                ? "border-brand-border bg-brand-surface text-brand-text"
                : "border-border text-muted-foreground hover:text-foreground hover:bg-hover"
            }`}
          >
            {entry}
          </button>
        ))}
        {selectedEntryPoints.length > 0 ? (
          <button onClick={clearEntryPoints} className="ml-auto text-xs text-muted-foreground hover:text-foreground/80">
            Limpar seleção
          </button>
        ) : null}
      </div>
      {activePreset && (
        <div className="flex flex-wrap items-center gap-2 rounded-xl border border-border bg-background px-3 py-2 text-xs text-foreground/80">
          {appliedChips.map((chip) => (
            <span key={chip} className="inline-flex items-center gap-1 rounded-full border border-border bg-card px-2 py-1 text-[11px] text-foreground/80">
              {chip}
              <button onClick={clearPreset} className="text-muted-foreground/60 hover:text-foreground/80">
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
          <button onClick={clearPreset} className="ml-auto text-[11px] text-[#0E9384] hover:text-foreground">
            Limpar
          </button>
        </div>
      )}

      {showStaleBanner && (
        <div className="flex flex-wrap items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-3 py-1.5 text-[11px] text-amber-700">
          <span>Qualidade dos dados: {staleCount} empresas com fonte atrasada.</span>
          <button onClick={() => setFilters((p) => ({ ...p, freshness: "Antigo" }))} className="font-semibold hover:text-amber-900">
            Ver apenas antigas
          </button>
        </div>
      )}

      <p className="pt-1 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">Refinar catálogo</p>
      <div className="bg-card rounded-2xl border border-border shadow-sm p-3 flex flex-wrap gap-3 items-center">
        <div className="relative w-full sm:hidden">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/60" />
          <input
            type="text"
            placeholder="Buscar dentro dos resultados"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            className="w-full pl-10 pr-3 py-2 rounded-xl border border-border text-sm text-foreground/80 focus:outline-none focus:ring-2 focus:ring-mint-100"
          />
        </div>

        {(
          [
            {
              label: "Setor",
              key: "sector",
              options: ["Todos", "Bancos", "Energia", "Indústria", "Saúde", "Consumo", "Construção"],
            },
            { label: "Status", key: "status", options: ["Todos", "Saudável", "Atenção", "Risco"] },
            { label: "Pilar em destaque", key: "pillar", options: ["Todos", ...pillars] },
          ] as Array<{ label: string; key: FilterKey; options: string[] }>
        ).map((filter) => (
          <div key={filter.key} className="relative">
            <select
              value={filters[filter.key]}
              onChange={(event) => setFilters((prev) => ({ ...prev, [filter.key]: event.target.value }))}
              className="appearance-none px-3 py-2 rounded-xl border border-border text-xs text-foreground/70 bg-card focus:outline-none focus:ring-2 focus:ring-mint-100"
            >
              {filter.options.map((option) => (
                <option key={option} value={option}>
                  {filter.label}: {option}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-muted-foreground/60 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        ))}

        <button
          onClick={() => setShowAdvancedFilters((prev) => !prev)}
          className="px-3 py-2 rounded-xl border border-border text-xs text-foreground/70 hover:bg-hover"
        >
          {showAdvancedFilters ? "Menos filtros" : "Mais filtros"}
        </button>

        <div className="flex items-center gap-2">
          <ListFilter className="w-4 h-4 text-muted-foreground/60" />
          <select
            value={filters.sort}
            onChange={(event) => setFilters((prev) => ({ ...prev, sort: event.target.value }))}
            className="appearance-none px-3 py-2 rounded-xl border border-border text-xs text-foreground/70 bg-card focus:outline-none focus:ring-2 focus:ring-mint-100"
          >
            {[
              ...(activePreset ? ["Mais relevantes para este destaque"] : []),
              "Mais atualizadas",
              "Mudanças recentes",
              "Maior consistência",
            ].map((option) => (
              <option key={option} value={option}>
                Ordenar: {option}
              </option>
            ))}
          </select>
        </div>

        {showAdvancedFilters && (
          <div className="w-full flex flex-wrap gap-3 border-t border-border pt-3">
            {(
              [
                { label: "Tamanho", key: "size", options: ["Todos", "Grande", "Média", "Pequena"] },
                { label: "Frescor", key: "freshness", options: ["Todos", "Atualizado", "Antigo"] },
              ] as Array<{ label: string; key: FilterKey; options: string[] }>
            ).map((filter) => (
              <div key={filter.key} className="relative">
                <select
                  value={filters[filter.key]}
                  onChange={(event) => setFilters((prev) => ({ ...prev, [filter.key]: event.target.value }))}
                  className="appearance-none px-3 py-2 rounded-xl border border-border text-xs text-foreground/70 bg-card focus:outline-none focus:ring-2 focus:ring-mint-100"
                >
                  {filter.options.map((option) => (
                    <option key={option} value={option}>
                      {filter.label}: {option}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-muted-foreground/60 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            ))}
          </div>
        )}
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((item) => (
            <div key={item} className="bg-card rounded-2xl border border-border shadow-sm p-5">
              <div className="h-4 w-32 bg-muted rounded mb-3" />
              <div className="h-3 w-24 bg-muted rounded mb-4" />
              <div className="h-16 bg-muted rounded mb-4" />
              <div className="h-3 w-40 bg-muted rounded" />
            </div>
          ))}
        </div>
      ) : filteredCompanies.length === 0 ? (
        <div className="bg-card rounded-2xl border border-border shadow-sm p-8 text-center">
          <p className="text-sm text-foreground/70 mb-3">Nenhuma empresa encontrada com esses filtros.</p>
          <div className="flex items-center justify-center gap-3">
            <button onClick={resetFilters} className="px-4 py-2 rounded-xl border border-border text-sm text-foreground/70 hover:bg-hover">
              Limpar filtros
            </button>
            <button
              onClick={() => setFilters((p) => ({ ...p, sector: "Bancos" }))}
              className="px-4 py-2 rounded-xl bg-mint-500 text-white text-sm hover:bg-mint-600"
            >
              Explorar por setor
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filteredCompanies.map((company) => (
            <div key={company.ticker} className="group bg-card rounded-2xl border border-border shadow-sm p-4 hover:shadow-md transition-shadow">
              <div className="mb-3 flex items-start justify-between gap-3">
                <div className="min-w-0 flex items-center gap-3">
                  {getCompanyLogo(company.ticker) && (
                    <img
                      src={getCompanyLogo(company.ticker)}
                      alt={`Logo ${company.ticker}`}
                      className="h-10 w-10 rounded-full border border-border object-cover bg-card"
                    />
                  )}
                  <div className="min-w-0">
                    <h4 className="truncate text-sm font-semibold text-foreground">
                      {company.name} <span className="text-muted-foreground/60">•</span> {company.ticker}
                    </h4>
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs border border-border text-muted-foreground">
                      {company.sector}
                    </span>
                  </div>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-1">
                  <span className={`px-2 py-1 rounded-full text-xs border ${statusColors[company.status]}`}>{company.status}</span>
                  <span className={`rounded-full border px-2 py-0.5 text-[10px] ${freshnessColors[company.freshnessStatus]}`}>
                    {freshnessLabelMap[company.freshnessStatus]}
                  </span>
                </div>
              </div>

              <p className="text-sm text-foreground/70 mb-3">{company.shortDiagnosis}</p>

              <div className="mb-3 flex flex-wrap items-center gap-2 text-[11px]">
                <span className="rounded-full border border-border px-2 py-0.5 text-foreground/70">Pilar em foco: {company.highlightPillar}</span>
              </div>

              <div className="flex items-center justify-between text-[11px] text-muted-foreground/60 mb-4">
                <span>Fonte: {company.source} • Atualizado em {company.updatedAt}</span>
              </div>

              <div className="flex flex-col gap-2">
                <Link
                  href={`/empresa/${company.ticker}`}
                  className="px-4 py-2 rounded-xl bg-[#0E9384] text-white text-xs font-medium hover:opacity-90 w-fit"
                >
                  Abrir análise
                </Link>
                <div className="flex items-center gap-3 text-[11px] text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100">
                  <Link href={`/empresa/${company.ticker}`} className="hover:text-foreground/80">
                    Ver pilares
                  </Link>
                  <button
                    onClick={() => toggleCompare(company.ticker)}
                    className={`transition-colors ${
                      compareTickers.includes(company.ticker) ? "text-[#0E9384] font-medium" : "text-muted-foreground hover:text-foreground/80"
                    }`}
                  >
                    Comparar
                  </button>
                  <button className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground/80">
                    <Star className="w-3.5 h-3.5" />
                    Favoritar
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

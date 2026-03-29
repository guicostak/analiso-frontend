"use client";

import { ChevronDown, Filter, ListFilter, Search, Star, X } from "lucide-react";
import Link from "next/link";
import type { CompanyCard, FilterKey, Filters, HighlightPreset } from "../interfaces";

const statusColors: Record<CompanyCard["status"], string> = {
  Saudável: "border-success-border bg-success-surface text-success-text",
  Atenção: "border-warning-border bg-warning-surface text-warning-text",
  Risco: "border-danger-border bg-danger-surface text-danger-text",
};

const freshnessColors: Record<CompanyCard["freshnessStatus"], string> = {
  Atualizado: "border-success-border bg-success-surface text-success-text",
  Antigo: "border-warning-border bg-warning-surface text-warning-text",
};

function getCardShellColor(status: CompanyCard["status"]) {
  const statusText = String(status);
  if (statusText.startsWith("R")) return "bg-card";
  if (statusText.startsWith("S")) return "bg-card";
  return "bg-card";
}

function getCardAccentColor(status: CompanyCard["status"]) {
  const statusText = String(status);
  if (statusText.startsWith("R")) return "bg-[linear-gradient(90deg,#FADCE5_0%,rgba(250,220,229,0)_88%)] dark:bg-[linear-gradient(90deg,rgba(250,220,229,0.1)_0%,rgba(250,220,229,0)_88%)]";
  if (statusText.startsWith("S")) return "bg-[linear-gradient(90deg,#DDF6EC_0%,rgba(221,246,236,0)_88%)] dark:bg-[linear-gradient(90deg,rgba(221,246,236,0.1)_0%,rgba(221,246,236,0)_88%)]";
  return "bg-[linear-gradient(90deg,#FFEACC_0%,rgba(255,234,204,0)_88%)] dark:bg-[linear-gradient(90deg,rgba(255,234,204,0.1)_0%,rgba(255,234,204,0)_88%)]";
}

function getCardAccentVariant(index: number) {
  if (index % 3 === 0) {
    return {
      band: "h-[78px]",
      shape: "left-5 top-3 h-10 w-24 rounded-[28px_18px_22px_16px/18px_22px_16px_20px]",
      divider: "bg-[linear-gradient(90deg,rgba(152,162,179,0),rgba(152,162,179,0.18),rgba(152,162,179,0))]",
    };
  }
  if (index % 3 === 1) {
    return {
      band: "h-[64px]",
      shape: "left-8 top-4 h-8 w-20 rounded-[18px_28px_16px_24px/20px_18px_22px_16px]",
      divider: "bg-[linear-gradient(90deg,rgba(152,162,179,0),rgba(152,162,179,0.14),rgba(152,162,179,0))]",
    };
  }
  return {
    band: "h-[72px]",
    shape: "left-6 top-2 h-9 w-16 rounded-[22px_16px_24px_18px/16px_20px_18px_22px]",
    divider: "bg-[linear-gradient(90deg,rgba(152,162,179,0),rgba(152,162,179,0.16),rgba(152,162,179,0))]",
  };
}

const freshnessLabelMap: Record<CompanyCard["freshnessStatus"], string> = {
  Atualizado: "Fonte atualizada",
  Antigo: "Fonte atrasada",
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
    <section className="space-y-5">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-[12px] font-medium uppercase tracking-[0.08em] text-muted-foreground">Descoberta guiada</p>
          <h2 className="mt-2 text-[24px] font-semibold leading-7 tracking-[-0.03em] text-foreground">
            Empresas para você analisar
          </h2>
          <p className="mt-2.5 max-w-[720px] text-[14px] leading-6 text-muted-foreground">
            Catálogo para aprofundar a leitura depois da curadoria principal, mantendo foco em tese, qualidade de fonte e pilar mais relevante.
          </p>
        </div>
        <div className="inline-flex items-center gap-2 rounded-full bg-card px-4 py-2 text-[11px] font-medium text-muted-foreground shadow-[0_10px_28px_rgba(15,23,40,0.05)] dark:shadow-none">
          <Filter className="h-4 w-4" />
          {filteredCompanies.length} empresas
        </div>
      </div>

      <div className="space-y-3">
        <p className="text-[12px] font-medium uppercase tracking-[0.08em] text-muted-foreground">Descobrir por tese</p>
        <div className="flex flex-wrap items-center gap-2.5">
          {thesisCollections.map((entry) => (
            <button
              key={entry}
              onClick={() => toggleEntryPoint(entry)}
              className={`rounded-full border px-4 py-2.5 text-[12px] font-medium transition ${
                selectedEntryPoints.includes(entry)
                  ? "border-success-border bg-success-surface text-brand shadow-[0_10px_24px_rgba(15,23,40,0.05)] dark:shadow-none"
                  : "border-border bg-card text-muted-foreground hover:border-border hover:text-foreground"
              }`}
            >
              {entry}
            </button>
          ))}
          {selectedEntryPoints.length > 0 ? (
            <button onClick={clearEntryPoints} className="text-[13px] font-medium text-muted-foreground transition hover:text-foreground">
              Limpar seleção
            </button>
          ) : null}
        </div>
      </div>

      {activePreset && (
        <div className="flex flex-wrap items-center gap-2 rounded-[22px] border border-border bg-card px-4 py-3.5 shadow-[0_14px_34px_rgba(15,23,40,0.04)] dark:shadow-none">
          {appliedChips.map((chip) => (
            <span
              key={chip}
              className="inline-flex items-center gap-2 rounded-full border border-blue-200 dark:border-blue-800/50 bg-blue-50 dark:bg-blue-900/30 px-4 py-2 text-[12px] font-medium text-blue-700 dark:text-blue-300"
            >
              {chip}
              <button onClick={clearPreset} className="text-muted-foreground transition hover:text-foreground" aria-label={`Remover ${chip}`}>
                <X className="h-3.5 w-3.5" />
              </button>
            </span>
          ))}
          <button onClick={clearPreset} className="ml-auto text-[12px] font-semibold text-brand transition hover:text-foreground">
            Limpar
          </button>
        </div>
      )}

      {showStaleBanner && (
        <div className="flex flex-col gap-3 rounded-[18px] border border-warning-border bg-warning-surface px-5 py-4 text-[13px] leading-6 text-warning-text lg:flex-row lg:items-center lg:justify-between">
          <p>Qualidade dos dados: {staleCount} empresas com fonte atrasada. Vale confirmar antes de comparar decisões recentes.</p>
          <button onClick={() => setFilters((p) => ({ ...p, freshness: "Antigo" }))} className="text-left font-semibold transition hover:text-warning-text">
            Ver apenas antigas
          </button>
        </div>
      )}

      <div className="rounded-[22px] border border-border bg-card p-4 shadow-[0_18px_40px_rgba(15,23,40,0.04)] dark:shadow-none">
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-3 xl:flex-row xl:items-center">
            <label className="relative block xl:min-w-[260px] xl:flex-1">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Buscar empresa ou ticker"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                className="h-11 w-full rounded-[14px] border border-border bg-muted pl-11 pr-4 text-[13px] text-foreground outline-none transition placeholder:text-muted-foreground focus:border-blue-200 dark:focus:border-blue-800/50"
              />
            </label>

            <div className="flex flex-1 flex-wrap items-center gap-3">
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
                <div key={filter.key} className="relative min-w-[152px] flex-1">
                  <select
                    value={filters[filter.key]}
                    onChange={(event) => setFilters((prev) => ({ ...prev, [filter.key]: event.target.value }))}
                    className="h-11 w-full appearance-none rounded-[14px] border border-border bg-muted px-4 pr-10 text-[12px] font-medium text-foreground outline-none transition focus:border-blue-200 dark:focus:border-blue-800/50"
                  >
                    {filter.options.map((option) => (
                      <option key={option} value={option}>
                        {filter.label}: {option}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-3 border-t border-border pt-3 xl:flex-row xl:items-center xl:justify-between">
            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={() => setShowAdvancedFilters((prev) => !prev)}
                className="inline-flex h-10 items-center rounded-[14px] border border-border bg-muted px-4 text-[12px] font-medium text-foreground transition hover:bg-muted"
              >
                {showAdvancedFilters ? "Menos filtros" : "Mais filtros"}
              </button>

              {showAdvancedFilters && (
                <>
                  {(
                    [
                      { label: "Tamanho", key: "size", options: ["Todos", "Grande", "Média", "Pequena"] },
                      { label: "Frescor", key: "freshness", options: ["Todos", "Atualizado", "Antigo"] },
                    ] as Array<{ label: string; key: FilterKey; options: string[] }>
                  ).map((filter) => (
                    <div key={filter.key} className="relative min-w-[152px]">
                      <select
                        value={filters[filter.key]}
                        onChange={(event) => setFilters((prev) => ({ ...prev, [filter.key]: event.target.value }))}
                        className="h-10 appearance-none rounded-[14px] border border-border bg-muted px-4 pr-10 text-[12px] font-medium text-foreground outline-none transition focus:border-blue-200 dark:focus:border-blue-800/50"
                      >
                        {filter.options.map((option) => (
                          <option key={option} value={option}>
                            {filter.label}: {option}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    </div>
                  ))}
                </>
              )}
            </div>

            <div className="flex items-center gap-3">
              <div className="h-6 w-px bg-border" />
              <div className="relative min-w-[204px]">
                <ListFilter className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <select
                  value={filters.sort}
                  onChange={(event) => setFilters((prev) => ({ ...prev, sort: event.target.value }))}
                  className="h-10 w-full appearance-none rounded-[14px] border border-border bg-muted px-11 pr-10 text-[12px] font-medium text-foreground outline-none transition focus:border-blue-200 dark:focus:border-blue-800/50"
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
                <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          {[1, 2, 3, 4].map((item) => (
            <div key={item} className="min-h-[212px] rounded-[22px] border border-border bg-card p-5 shadow-[0_18px_40px_rgba(15,23,40,0.04)] dark:shadow-none">
              <div className="h-4 w-32 rounded bg-muted" />
              <div className="mt-4 h-3 w-28 rounded bg-border" />
              <div className="mt-6 h-20 rounded-[18px] bg-muted" />
              <div className="mt-6 h-3 w-40 rounded bg-border" />
            </div>
          ))}
        </div>
      ) : filteredCompanies.length === 0 ? (
        <div className="rounded-[28px] border border-border bg-card px-8 py-10 text-center shadow-[0_18px_40px_rgba(15,23,40,0.04)] dark:shadow-none">
          <p className="text-[15px] leading-7 text-muted-foreground">Nenhuma empresa encontrada com esses filtros.</p>
          <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
            <button onClick={resetFilters} className="rounded-[16px] border border-border bg-muted px-4 py-2.5 text-[14px] font-medium text-foreground">
              Limpar filtros
            </button>
            <button
              onClick={() => setFilters((p) => ({ ...p, sector: "Bancos" }))}
              className="rounded-[16px] bg-brand px-4 py-2.5 text-[14px] font-semibold text-white"
            >
              Explorar por setor
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          {filteredCompanies.map((company, index) => {
            const accentVariant = getCardAccentVariant(index);

            return (
            <article
              key={company.ticker}
              className={`group relative flex min-h-[212px] flex-col justify-between overflow-hidden rounded-[22px] border border-border p-5 shadow-[0_18px_40px_rgba(15,23,40,0.04)] dark:shadow-none transition hover:-translate-y-0.5 hover:shadow-[0_24px_48px_rgba(15,23,40,0.08)] dark:shadow-none ${getCardShellColor(company.status)}`}
            >
              <div className={`pointer-events-none absolute inset-x-0 top-0 ${accentVariant.band} ${getCardAccentColor(company.status)} opacity-90`} />
              <div className={`pointer-events-none absolute ${accentVariant.shape} ${getCardAccentColor(company.status)} opacity-45`} />
              <div className={`pointer-events-none absolute inset-x-6 top-[86px] h-px ${accentVariant.divider}`} />
              <div className="relative">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex min-w-0 items-start gap-4">
                    {(company.logoUrl ?? getCompanyLogo(company.ticker)) && (
                      <img
                        src={company.logoUrl ?? getCompanyLogo(company.ticker)}
                        alt={`Logo ${company.ticker}`}
                        className="h-12 w-12 rounded-[18px] border border-border bg-muted object-cover p-1"
                      />
                    )}
                    <div className="min-w-0">
                      <h3 className="truncate text-[20px] font-semibold leading-7 text-foreground">
                        {company.name} <span className="text-muted-foreground">{company.ticker}</span>
                      </h3>
                      <p className="mt-1 text-[13px] font-medium text-muted-foreground">{company.sector}</p>
                    </div>
                  </div>

                  <div className="flex shrink-0 flex-col items-end gap-2 pt-1">
                    <span className={`inline-flex rounded-full border px-3 py-1 text-[11px] font-semibold shadow-[inset_0_1px_0_rgba(255,255,255,0.35)] ${statusColors[company.status]}`}>
                      {company.status}
                    </span>
                    <span className={`inline-flex rounded-full border px-3 py-1 text-[11px] font-medium shadow-[inset_0_1px_0_rgba(255,255,255,0.28)] ${freshnessColors[company.freshnessStatus]}`}>
                      {freshnessLabelMap[company.freshnessStatus]}
                    </span>
                  </div>
                </div>

                <p className="mt-6 text-[15px] leading-7 text-muted-foreground">{company.shortDiagnosis}</p>

                <div className="mt-6 flex flex-wrap items-center gap-2">
                  <span className="inline-flex rounded-full border border-blue-200 dark:border-blue-800/50 bg-blue-50 dark:bg-blue-900/30 px-3 py-1 text-[11px] font-medium text-blue-700 dark:text-blue-300">
                    Pilar em foco: {company.highlightPillar}
                  </span>
                  <span className="inline-flex rounded-full border border-border bg-muted px-3 py-1 text-[11px] font-medium text-muted-foreground">
                    Porte: {company.size}
                  </span>
                </div>
              </div>

              <div className="relative mt-7 flex flex-col gap-4 border-t border-border pt-5">
                <div className="flex flex-wrap items-center justify-between gap-3 text-[12px] text-muted-foreground">
                  <span>
                    Fonte: {company.source} . Atualizado em {company.updatedAt}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <Link
                    href={`/empresa/${company.ticker}`}
                    className="inline-flex h-11 items-center rounded-[16px] bg-brand px-4 text-[14px] font-semibold text-white shadow-[0_12px_30px_rgba(14,147,132,0.18)] transition group-hover:-translate-y-0.5 group-hover:px-5 group-hover:shadow-[0_18px_36px_rgba(14,147,132,0.22)] dark:shadow-none hover:opacity-90"
                  >
                    Abrir análise
                  </Link>
                  <Link
                    href={`/empresa/${company.ticker}`}
                    className="text-[13px] font-medium text-muted-foreground transition hover:text-foreground"
                  >
                    Ver pilares
                  </Link>
                  <button
                    onClick={() => toggleCompare(company.ticker)}
                    className={`text-[13px] font-medium transition ${
                      compareTickers.includes(company.ticker) ? "text-brand" : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    Comparar
                  </button>
                  <button className="inline-flex items-center gap-1 text-[13px] font-medium text-muted-foreground transition hover:text-foreground">
                    <Star className="h-3.5 w-3.5" />
                    Favoritar
                  </button>
                </div>
              </div>
            </article>
          )})}
        </div>
      )}
    </section>
  );
}

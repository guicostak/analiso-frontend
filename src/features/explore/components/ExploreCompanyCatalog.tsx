"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Bookmark, BookmarkPlus, ChevronDown, Clock, Link2, ListFilter, Search, Share2, SlidersHorizontal, Trash2, X } from "lucide-react";
import type { CompanyCard as CompanyCardData, CompanyFinancials, Filters, HighlightPreset } from "../interfaces";
import type { CompanySearchFilters } from "../services/search.service";
import { SearchAutocomplete, type SuggestResult } from "@/src/components/shared/SearchAutocomplete";
import { BuscaFiltersPanel } from "@/src/features/busca/components/BuscaFiltersPanel";
import { PaginationBar } from "@/src/components/shared/PaginationBar";
import { CompanyCard } from "@/src/components/shared/CompanyCard";
import { useAnimatedPlaceholder } from "@/src/hooks/useAnimatedPlaceholder";
import type { SavedSearch } from "@/src/features/saved-searches";
import { useSearchHistory } from "@/src/features/search-history";

// ─── Cores de status / frescor ───────────────────────────────────────────────


const pillars = ["Dívida", "Caixa", "Margens", "Retorno", "Proventos"];

// ─── Chips de filtros de métricas ─────────────────────────────────────────────

const METRIC_CHIP_LABELS: Record<string, { label: string; prefix: string }> = {
  plMin:           { label: "P/L",         prefix: "≥" },
  plMax:           { label: "P/L",         prefix: "≤" },
  pvpMin:          { label: "P/VP",        prefix: "≥" },
  pvpMax:          { label: "P/VP",        prefix: "≤" },
  evEbitdaMax:     { label: "EV/EBITDA",   prefix: "≤" },
  roeMin:          { label: "ROE",         prefix: "≥" },
  roeMax:          { label: "ROE",         prefix: "≤" },
  roicMin:         { label: "ROIC",        prefix: "≥" },
  margemMin:       { label: "Mg.Líq.",     prefix: "≥" },
  dividaEbitdaMax: { label: "Dív/EBITDA",  prefix: "≤" },
  dyMin:           { label: "DY",          prefix: "≥" },
  dyMax:           { label: "DY",          prefix: "≤" },
};

/** Converte CompanyFinancials para Record<string, number> usado pelo CompanyCard. */
function financialsToMetrics(fin: CompanyFinancials): Record<string, number> {
  const m: Record<string, number> = {};
  if (fin.pl != null) m["pl"] = fin.pl;
  if (fin.pvp != null) m["pvp"] = fin.pvp;
  if (fin.dividendYield != null) m["dy"] = fin.dividendYield;
  if (fin.roe != null) m["roe"] = fin.roe;
  if (fin.roic != null) m["roic"] = fin.roic;
  if (fin.margemLiquida != null) m["margem_liquida"] = fin.margemLiquida;
  if (fin.dividaLiquidaEbitda != null) m["divida_ebitda"] = fin.dividaLiquidaEbitda;
  if (fin.evEbitda != null) m["ev_ebitda"] = fin.evEbitda;
  return m;
}

const SKIP_FILTER_KEYS = new Set(["page", "size", "sortBy", "sortOrder", "query", "sector"]);

// ─── Props ───────────────────────────────────────────────────────────────────

interface ExploreCompanyCatalogProps {
  isLoading: boolean;
  filteredCompanies: CompanyCardData[];
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
  // props de busca via API
  isSearchActive: boolean;
  totalItems: number;
  totalPages: number;
  page: number;
  companySearchFilters: CompanySearchFilters;
  goToPage: (page: number) => void;
  updateFilters: (partial: Partial<CompanySearchFilters>) => void;
  clearApiFilters: () => void;
  // favoritos
  favoriteTickers: Set<string>;
  onToggleFavorite: (ticker: string) => void;
  // pesquisas salvas
  savedSearches: SavedSearch[];
  onSaveSearch: (name: string, filters: string) => Promise<SavedSearch | null>;
  onDeleteSavedSearch: (id: number) => void;
  onLoadSavedSearch: (filters: CompanySearchFilters) => void;
}

// ─── Componente ───────────────────────────────────────────────────────────────

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
  isSearchActive,
  totalItems,
  totalPages,
  page,
  companySearchFilters,
  goToPage,
  updateFilters,
  clearApiFilters,
  favoriteTickers,
  onToggleFavorite,
  savedSearches,
  onSaveSearch,
  onDeleteSavedSearch,
  onLoadSavedSearch,
}: ExploreCompanyCatalogProps) {
  const [localQuery, setLocalQuery]         = useState(searchQuery);
  const [showAutocomplete, setAutocomplete] = useState(false);
  const [isFocused, setFocused]             = useState(false);
  const [showMetricFilters, setMetricFilters] = useState(false);
  const [showSaveModal, setShowSaveModal]   = useState(false);
  const [saveName, setSaveName]             = useState("");
  const [showSavedList, setShowSavedList]   = useState(false);
  const savedListRef = useRef<HTMLDivElement>(null);
  const [showHistory, setShowHistory]         = useState(false);
  const [shareSearchOpen, setShareSearchOpen] = useState(false);
  const searchHistory = useSearchHistory();

  const animatedPlaceholder = useAnimatedPlaceholder(!localQuery && !isFocused);

  // Chips de filtros de métricas ativos
  const activeMetricChips = useMemo(() => {
    return Object.entries(companySearchFilters)
      .filter(([key, val]) => val != null && val !== "" && !SKIP_FILTER_KEYS.has(key))
      .map(([key, val]) => ({ key, val, ...METRIC_CHIP_LABELS[key] }))
      .filter((c) => c.label);
  }, [companySearchFilters]);

  const hasActiveQuery = !!companySearchFilters.query;
  const hasActiveMetrics = activeMetricChips.length > 0;
  const hasAnyApiFilter = hasActiveQuery || hasActiveMetrics;

  const hasLocalSectorFilter = filters.sector !== "Todos";
  const hasLocalPillarFilter = filters.pillar !== "Todos";
  const localFilterCount = (hasLocalSectorFilter ? 1 : 0) + (hasLocalPillarFilter ? 1 : 0);
  const hasLocalFilters = localFilterCount > 0;
  const totalAdvancedCount = activeMetricChips.length + localFilterCount;

  const displayCount = isSearchActive && totalItems > 0 ? totalItems : filteredCompanies.length;

  function handleSelect(item: SuggestResult) {
    setLocalQuery(item.ticker);
    setAutocomplete(false);
    setSearchQuery(item.ticker);
    updateFilters({ query: item.ticker });
  }

  function handleQueryChange(value: string) {
    setLocalQuery(value);
    setSearchQuery(value);
    setAutocomplete(value.length > 0);
    if (!value) updateFilters({ query: undefined });
    else searchHistory.recordSearch(value);
  }

  function removeMetricChip(key: string) {
    updateFilters({ [key]: undefined });
  }

  function triggerSearch() {
    setAutocomplete(false);
    setShowHistory(false);
    updateFilters({ query: localQuery || undefined });
    if (localQuery) searchHistory.recordSearch(localQuery);
  }

  return (
    <section className="space-y-5">
      {/* ── Chips de preset ativo ── */}
      {activePreset && (
        <div className="flex flex-wrap items-center gap-2 rounded-[22px] border border-border bg-card px-4 py-3.5 shadow-[0_14px_34px_rgba(15,23,40,0.04)] dark:shadow-none">
          {appliedChips.map((chip) => (
            <span
              key={chip}
              className="inline-flex items-center gap-2 rounded-full border border-brand/20 bg-brand/8 px-4 py-2 text-[12px] font-medium text-brand"
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

      {/* ── Banner de dados antigos ── */}
      {showStaleBanner && (
        <div className="flex flex-col gap-3 rounded-[18px] border border-warning-border bg-warning-surface px-5 py-4 text-[13px] leading-6 text-warning-text lg:flex-row lg:items-center lg:justify-between">
          <p>Qualidade dos dados: {staleCount} empresas com fonte atrasada. Vale confirmar antes de comparar decisões recentes.</p>
          <button onClick={() => setFilters((p) => ({ ...p, freshness: "Antigo" }))} className="text-left font-semibold transition hover:text-warning-text">
            Ver apenas antigas
          </button>
        </div>
      )}

      {/* ── Painel de filtros ── */}
      <div className="rounded-[22px] border border-border bg-card p-6 shadow-[0_18px_40px_rgba(15,23,40,0.04)] dark:shadow-none">
        <div className="flex flex-col gap-4">

          {/* Linha 1: input de busca full-width */}
          <div className="relative">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder={animatedPlaceholder ? `Procurar por ${animatedPlaceholder}` : "Procurar por"}
              value={localQuery}
              onChange={(e) => handleQueryChange(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); triggerSearch(); } }}
              onFocus={() => { setFocused(true); if (localQuery) setAutocomplete(true); else setShowHistory(true); }}
              onBlur={() => { setFocused(false); setTimeout(() => setShowHistory(false), 150); }}
              autoComplete="off"
              className="h-11 w-full rounded-[14px] border border-border bg-muted pl-11 pr-4 text-[13px] text-foreground outline-none transition placeholder:text-muted-foreground focus:border-brand/50"
            />
            {showAutocomplete && (
              <SearchAutocomplete
                query={localQuery}
                onSelect={handleSelect}
                onClose={() => setAutocomplete(false)}
              />
            )}
            {showHistory && !localQuery && searchHistory.items.length > 0 && (
              <div className="absolute left-0 top-full z-30 mt-1.5 w-full rounded-[16px] border border-border bg-card p-2 shadow-[0_12px_32px_rgba(15,23,40,0.10)]">
                <div className="flex items-center justify-between px-3 pb-1 pt-0.5">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Buscas recentes</p>
                  <button
                    onClick={() => { searchHistory.clearAll(); setShowHistory(false); }}
                    className="text-[10px] text-muted-foreground transition hover:text-foreground"
                  >
                    Limpar
                  </button>
                </div>
                {searchHistory.items.map((item) => (
                  <div key={item.id} className="group flex w-full items-center gap-2 rounded-[12px] px-3 py-2 hover:bg-muted">
                    <button
                      onClick={() => { setLocalQuery(item.query); setSearchQuery(item.query); updateFilters({ query: item.query }); setShowHistory(false); }}
                      className="flex flex-1 items-center gap-2 text-left text-[13px] text-foreground"
                    >
                      <Clock className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                      {item.query}
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); searchHistory.removeItem(item.id); }}
                      className="opacity-0 transition group-hover:opacity-100 text-muted-foreground hover:text-foreground"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Linha 2: Filtros avançados + Ordenar por (esquerda) | Buscar (direita) */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            {/* Botão Filtros avançados */}
            <button
              onClick={() => setMetricFilters((p) => !p)}
              className={`inline-flex h-11 items-center gap-2 rounded-[14px] border px-4 text-[12px] font-medium shadow-[0_2px_6px_rgba(15,23,40,0.04)] transition hover:shadow-[0_4px_12px_rgba(15,23,40,0.08)] dark:shadow-none ${
                showMetricFilters || hasActiveMetrics || hasLocalFilters
                  ? "border-brand/30 bg-brand/8 text-brand"
                  : "border-border bg-card text-muted-foreground hover:border-brand/30 hover:text-foreground"
              }`}
            >
              <SlidersHorizontal className="h-3.5 w-3.5" />
              Filtros avançados
              {(hasActiveMetrics || hasLocalFilters) && (
                <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-brand px-1 text-[10px] font-bold text-white">
                  {totalAdvancedCount}
                </span>
              )}
            </button>

            {/* Ordenar por */}
            <div className="relative">
              <ListFilter className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <select
                value={filters.sort}
                onChange={(e) => setFilters((prev) => ({ ...prev, sort: e.target.value }))}
                className="h-11 appearance-none rounded-[14px] border border-border bg-card pl-11 pr-9 text-[12px] font-medium text-foreground shadow-[0_2px_6px_rgba(15,23,40,0.04)] outline-none transition hover:border-brand/30 focus:border-brand/50 dark:shadow-none"
              >
                {[
                  "Nome (A-Z)",
                  "Nome (Z-A)",
                  "Maior preço",
                  "Menor preço",
                  ...(activePreset ? ["Mais relevantes para este destaque"] : []),
                ].map((opt) => (
                  <option key={opt} value={opt}>Ordenar por: {opt}</option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            </div>

            {/* Botão Buscar */}
            <button
              type="button"
              onClick={triggerSearch}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-[12px] border border-brand bg-brand px-14 text-[13px] font-semibold text-white shadow-[0_2px_6px_rgba(15,23,40,0.08)] transition hover:bg-brand/90 sm:ml-auto"
            >
              <Search className="h-4 w-4" />
              Buscar
            </button>
          </div>

          {/* Painel de filtros avançados */}
          {showMetricFilters && (
            <div className="flex flex-col gap-4 border-t border-border pt-4">

              {/* Setor e Pilar */}
              <div className="grid grid-cols-2 gap-3">
                {/* Setor */}
                <div className="relative">
                  <select
                    value={filters.sector}
                    onChange={(e) => setFilters((prev) => ({ ...prev, sector: e.target.value }))}
                    className={`h-10 w-full appearance-none rounded-[12px] border px-3 pr-9 text-[13px] font-medium outline-none transition focus:border-brand/50 ${
                      hasLocalSectorFilter
                        ? "border-brand/30 bg-brand/8 text-brand"
                        : "border-border bg-muted text-foreground"
                    }`}
                  >
                    <option value="Todos">Todos os setores</option>
                    {["Bancos", "Energia", "Indústria", "Saúde", "Consumo", "Construção"].map((opt) => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                </div>

                {/* Pilar em destaque */}
                <div className="relative">
                  <select
                    value={filters.pillar}
                    onChange={(e) => setFilters((prev) => ({ ...prev, pillar: e.target.value }))}
                    className={`h-10 w-full appearance-none rounded-[12px] border px-3 pr-9 text-[13px] font-medium outline-none transition focus:border-brand/50 ${
                      hasLocalPillarFilter
                        ? "border-brand/30 bg-brand/8 text-brand"
                        : "border-border bg-muted text-foreground"
                    }`}
                  >
                    <option value="Todos">Todos os pilares</option>
                    {pillars.map((opt) => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                </div>
              </div>

              {/* Métricas */}
              <BuscaFiltersPanel
                filters={companySearchFilters}
                isLoading={isLoading}
                onUpdateFilters={updateFilters}
                onClearFilters={clearApiFilters}
                isOpen={true}
              />
            </div>
          )}

          {/* Chips de filtros ativos */}
          {hasAnyApiFilter && (
            <div className="flex flex-wrap items-center gap-2 border-t border-border pt-3">
              {hasActiveQuery && (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-brand/20 bg-brand/8 px-3 py-1 text-[12px] font-medium text-brand">
                  Busca: {companySearchFilters.query}
                  <button
                    onClick={() => { setLocalQuery(""); setSearchQuery(""); updateFilters({ query: undefined }); }}
                    className="opacity-60 transition hover:opacity-100"
                    aria-label="Remover busca"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}
              {activeMetricChips.map((chip) => (
                <span
                  key={chip.key}
                  className="inline-flex items-center gap-1.5 rounded-full border border-brand/20 bg-brand/8 px-3 py-1 text-[12px] font-medium text-brand"
                >
                  {chip.label} {chip.prefix} {chip.val}
                  <button
                    onClick={() => removeMetricChip(chip.key)}
                    className="opacity-60 transition hover:opacity-100"
                    aria-label={`Remover filtro ${chip.label}`}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
              <button
                onClick={() => { setLocalQuery(""); setSearchQuery(""); clearApiFilters(); }}
                className="ml-auto text-[12px] font-medium text-muted-foreground transition hover:text-foreground"
              >
                Limpar filtros
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ── Contagem de resultados + pesquisas salvas ── */}
      {!isLoading && (
        <div className="flex items-center justify-between px-1">
          <span className="text-[12px] text-muted-foreground">
            {displayCount} {displayCount === 1 ? "resultado encontrado" : "resultados encontrados"}
          </span>

          <div className="flex items-center gap-2">
            {/* Botão salvar pesquisa atual */}
            <button
              onClick={() => { setShowSavedList(true); setShowSaveModal(true); }}
              className="inline-flex items-center gap-1.5 rounded-[10px] border border-border bg-card px-3 py-1.5 text-[11px] font-medium text-muted-foreground shadow-[0_1px_2px_rgba(15,23,40,0.04)] transition hover:border-brand/30 hover:text-brand dark:shadow-none"
            >
              <Bookmark className="h-3.5 w-3.5" />
              Salvar pesquisa
            </button>

            {/* Share search button */}
            <div className="relative">
              <button
                onClick={() => setShareSearchOpen((v) => !v)}
                className="inline-flex h-9 items-center gap-1.5 rounded-[12px] border border-border bg-card px-3 text-[13px] text-muted-foreground transition hover:border-brand hover:text-brand"
                title="Compartilhar busca"
              >
                <Share2 className="h-4 w-4" />
                Compartilhar
              </button>
              {shareSearchOpen && (
                <div className="absolute right-0 z-40 mt-2 w-[200px] rounded-[18px] border border-border bg-card p-2 shadow-[0_16px_40px_rgba(15,23,40,0.12)]">
                  <p className="px-3 pb-1.5 pt-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Compartilhar busca</p>
                  <button onClick={() => { window.open(`https://wa.me/?text=${encodeURIComponent("Veja essa busca no Analiso: " + window.location.href)}`, "_blank"); setShareSearchOpen(false); }} className="flex w-full items-center gap-2 rounded-[12px] px-3 py-2 text-left text-[12px] text-muted-foreground transition hover:bg-muted">
                    <svg className="h-3.5 w-3.5 text-[#25D366]" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                    WhatsApp
                  </button>
                  <button onClick={() => { window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent("Veja essa busca no Analiso!")}&url=${encodeURIComponent(window.location.href)}`, "_blank"); setShareSearchOpen(false); }} className="flex w-full items-center gap-2 rounded-[12px] px-3 py-2 text-left text-[12px] text-muted-foreground transition hover:bg-muted">
                    <svg className="h-3.5 w-3.5 text-foreground" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.736l7.733-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                    X (Twitter)
                  </button>
                  <button onClick={() => { navigator.clipboard.writeText(window.location.href); setShareSearchOpen(false); }} className="flex w-full items-center gap-2 rounded-[12px] px-3 py-2 text-left text-[12px] text-muted-foreground transition hover:bg-muted">
                    <Link2 className="h-3.5 w-3.5" />
                    Copiar link
                  </button>
                </div>
              )}
            </div>

            {/* Dropdown de pesquisas salvas */}
            <div className="relative" ref={savedListRef}>
              <button
                onClick={() => setShowSavedList((p) => !p)}
                className="inline-flex items-center gap-1.5 rounded-[10px] border border-border bg-card px-3 py-1.5 text-[11px] font-medium text-muted-foreground shadow-[0_1px_2px_rgba(15,23,40,0.04)] transition hover:border-brand/30 hover:text-foreground dark:shadow-none"
              >
                <BookmarkPlus className="h-3.5 w-3.5" />
                Pesquisas salvas
                {savedSearches.length > 0 && (
                  <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-brand px-1 text-[9px] font-bold text-white">
                    {savedSearches.length}
                  </span>
                )}
                <ChevronDown className={`h-3 w-3 transition-transform ${showSavedList ? "rotate-180" : ""}`} />
              </button>

              {showSavedList && (
                <div className="absolute right-0 top-[calc(100%+4px)] z-50 w-72 overflow-hidden rounded-xl border border-border bg-card shadow-[0_8px_32px_rgba(0,0,0,0.12)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.5)]">
                  <div className="border-b border-border px-3 py-2.5">
                    <p className="text-[12px] font-semibold text-foreground">Pesquisas salvas</p>
                  </div>

                  {savedSearches.length === 0 ? (
                    <div className="px-3 py-4 text-center text-[12px] text-muted-foreground">
                      Nenhuma pesquisa salva ainda
                    </div>
                  ) : (
                    <div className="max-h-52 overflow-y-auto">
                      {savedSearches.map((s) => (
                        <div
                          key={s.id}
                          className="flex items-center justify-between gap-2 px-3 py-2 transition hover:bg-muted/60"
                        >
                          <button
                            onClick={() => {
                              try {
                                const parsed = JSON.parse(s.filters);
                                onLoadSavedSearch(parsed);
                                setShowSavedList(false);
                              } catch { /* filtros inválidos */ }
                            }}
                            className="min-w-0 flex-1 text-left"
                          >
                            <p className="truncate text-[12px] font-medium text-foreground">{s.name}</p>
                            <p className="truncate text-[10px] text-muted-foreground">
                              {new Date(s.createdAt).toLocaleDateString("pt-BR")}
                            </p>
                          </button>
                          <button
                            onClick={() => onDeleteSavedSearch(s.id)}
                            className="shrink-0 rounded-md p-1 text-muted-foreground transition hover:bg-danger-surface hover:text-danger-text"
                            aria-label="Excluir pesquisa"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Salvar pesquisa atual */}
                  <div className="border-t border-border px-3 py-2.5">
                    {showSaveModal ? (
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={saveName}
                          onChange={(e) => setSaveName(e.target.value)}
                          placeholder="Nome da pesquisa"
                          autoFocus
                          className="h-8 flex-1 rounded-[8px] border border-border bg-muted px-2.5 text-[12px] text-foreground outline-none placeholder:text-muted-foreground focus:border-brand/50"
                          onKeyDown={(e) => {
                            if (e.key === "Enter" && saveName.trim()) {
                              onSaveSearch(saveName.trim(), JSON.stringify(companySearchFilters));
                              setSaveName("");
                              setShowSaveModal(false);
                            }
                            if (e.key === "Escape") setShowSaveModal(false);
                          }}
                        />
                        <button
                          onClick={() => {
                            if (saveName.trim()) {
                              onSaveSearch(saveName.trim(), JSON.stringify(companySearchFilters));
                              setSaveName("");
                              setShowSaveModal(false);
                            }
                          }}
                          disabled={!saveName.trim()}
                          className="h-8 rounded-[8px] bg-brand px-3 text-[11px] font-semibold text-white transition hover:opacity-90 disabled:opacity-40"
                        >
                          Salvar
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setShowSaveModal(true)}
                        className="flex w-full items-center justify-center gap-1.5 rounded-[8px] border border-dashed border-border py-1.5 text-[11px] font-medium text-muted-foreground transition hover:border-brand/30 hover:text-brand"
                      >
                        <BookmarkPlus className="h-3.5 w-3.5" />
                        Salvar pesquisa atual
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Grid de cards / loading / vazio ── */}
      {isLoading ? (
        <div className="grid grid-cols-1 gap-5">
          {[1, 2, 3].map((item) => (
            <div key={item} className="flex flex-col gap-4 rounded-[18px] border border-l-[3px] border-border border-l-muted bg-card p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3.5">
                  <div className="h-10 w-10 shrink-0 animate-pulse rounded-[14px] bg-muted" />
                  <div className="space-y-2">
                    <div className="h-4 w-40 animate-pulse rounded bg-muted" />
                    <div className="h-3 w-24 animate-pulse rounded bg-muted" />
                  </div>
                </div>
                <div className="flex gap-2">
                  <div className="h-5 w-16 animate-pulse rounded-full bg-muted" />
                  <div className="h-5 w-20 animate-pulse rounded-full bg-muted" />
                </div>
              </div>
              <div className="flex gap-6 border-t border-border pt-3">
                {[1, 2, 3, 4, 5].map((m) => (
                  <div key={m} className="space-y-1">
                    <div className="h-2.5 w-10 animate-pulse rounded bg-muted" />
                    <div className="h-3.5 w-14 animate-pulse rounded bg-muted" />
                  </div>
                ))}
              </div>
              <div className="flex gap-2.5">
                <div className="h-7 w-24 animate-pulse rounded-[10px] bg-muted" />
                <div className="h-7 w-20 animate-pulse rounded-[10px] bg-muted" />
              </div>
            </div>
          ))}
        </div>
      ) : filteredCompanies.length === 0 ? (
        <div className="rounded-[28px] border border-border bg-card px-8 py-10 text-center shadow-[0_18px_40px_rgba(15,23,40,0.04)] dark:shadow-none">
          <p className="text-[15px] leading-7 text-muted-foreground">Nenhuma empresa encontrada para os filtros</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-5">
            {filteredCompanies.map((company) => (
              <CompanyCard
                key={company.ticker}
                ticker={company.ticker}
                companyName={company.name}
                logoUrl={company.logoUrl ?? getCompanyLogo(company.ticker)}
                href={`/analysis/${company.ticker}`}
                price={company.financials.price}
                status={company.status}
                sector={company.sector}
                headline={company.headline}
                shortDiagnosis={company.shortDiagnosis}
                whyOpen={company.whyOpen}
                metrics={financialsToMetrics(company.financials)}
                updatedAt={company.updatedAt}
                isComparing={compareTickers.includes(company.ticker)}
                isFavorite={favoriteTickers.has(company.ticker)}
                onToggleCompare={() => toggleCompare(company.ticker)}
                onToggleFavorite={() => onToggleFavorite(company.ticker)}
                onAlert={() => {}}
              />
            ))}
          </div>

          {totalPages > 1 && (
            <PaginationBar page={page} totalPages={totalPages} onGoToPage={goToPage} />
          )}
        </>
      )}
    </section>
  );
}

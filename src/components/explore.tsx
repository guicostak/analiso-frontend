"use client";

import { type ReactNode } from "react";
import {
  AlertTriangle,
  ChevronDown,
  Dot,
  ExternalLink,
  FileText,
  Filter,
  Info,
  LineChart as LineIcon,
  ListFilter,
  Search,
  Star,
  X,
} from "lucide-react";
import Link from "next/link";
import { GlossaryText } from "./glossary/glossary-text";

import { Sidebar } from "./dashboard/sidebar";
import { AppTopBar } from "./app-top-bar";
import { MiniSparkline } from "./mini-sparkline";

import { useExplore } from "../hooks/useExplore";

import type {
  CompanyCard,
  FilterKey,
  Filters,
  HighlightItem,
  HighlightPreset,
  IndexCard,
} from "../types/explore";
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

const severityStyles: Record<HighlightItem["severity"], string> = {
  Leve:     "bg-muted text-foreground/80 border-border",
  Moderada: "bg-amber-50 text-amber-700 border-amber-100",
  Forte:    "bg-rose-50 text-rose-700 border-rose-100",
};

const priorityLabelMap: Record<HighlightItem["severity"], string> = {
  Leve:     "Prioridade baixa",
  Moderada: "Prioridade média",
  Forte:    "Prioridade alta",
};

const getTrendColor = (trend: IndexCard["trend"]) => {
  if (trend === "up")   return "text-emerald-600";
  if (trend === "down") return "text-rose-600";
  return "text-muted-foreground";
};

const getTrendStatus = (trend: IndexCard["trend"]) => {
  if (trend === "up")   return "healthy";
  if (trend === "down") return "risk";
  return "attention";
};

// ─── Sub-component ────────────────────────────────────────────────────────────

function Drawer({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-20">
      <button className="absolute inset-0 bg-black/20" onClick={onClose} aria-label="Fechar" />
      <div
        role="dialog"
        aria-modal="true"
        className="absolute inset-0 bg-card p-6 md:inset-y-0 md:right-0 md:left-auto md:w-[420px] md:shadow-xl"
      >
        <div className="flex items-center justify-between mb-6">
          <h4 className="text-base font-semibold text-foreground">{title}</h4>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full border border-border flex items-center justify-center hover:border-[#D0D5DD]"
          >
            <X className="w-4 h-4 text-foreground/80" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

// ─── Page component ───────────────────────────────────────────────────────────

export function ExplorePage() {
  const {
    selectedTab,
    selectedEntryPoints,
    compareTickers,
    searchQuery,
    summaryScope,
    summaryState,
    activePreset,
    appliedChips,
    selectedSource,
    showAllHighlights,
    showAdvancedFilters,
    showAllMovements,
    showVolatilityInfo,
    showVolatilityDetails,
    showContextPanel,
    filters,
    isLoading,
    filteredCompanies,
    sortedHighlights,
    staleCount,
    showStaleBanner,
    hasSectorSelected,
    hasWatchlist,
    volatilityIsStale,
    indexCards,
    movers,
    movementInsights,
    volatility,
    thesisCollections,
    sectorCollections,
    pillars,
    highlights,
    getCompanyLogo,
    setSelectedTab,
    setSearchQuery,
    setSummaryScope,
    setSummaryState,
    setSelectedSource,
    setShowAllHighlights,
    setShowAdvancedFilters,
    setShowAllMovements,
    setShowVolatilityInfo,
    setShowVolatilityDetails,
    setShowContextPanel,
    setFilters,
    toggleEntryPoint,
    clearEntryPoints,
    applyHighlightPreset,
    clearPreset,
    toggleCompare,
    resetFilters,
  } = useExplore();

  const renderMovementsPanel = (compact = false) => (
    <section className={`bg-card rounded-2xl border border-border ${compact ? "p-4" : "p-5"}`}>
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold text-foreground">Movimentos que pedem contexto hoje</h3>
          <p className="text-xs text-muted-foreground">Use como apoio: primeiro a interpretação, depois o movimento de preço.</p>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Dot className="w-4 h-4 text-amber-400" />
          Interpretado pela Analiso
        </div>
      </div>
      <div className="flex items-center gap-2 mb-4">
        {[
          { label: "Altas", value: "altas" },
          { label: "Baixas", value: "baixas" },
          { label: "Fluxo", value: "negociadas" },
        ].map((tab) => (
          <button
            key={tab.value}
            onClick={() => {
              setSelectedTab(tab.value as typeof selectedTab);
              setShowAllMovements(false);
            }}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
              selectedTab === tab.value ? "bg-brand-surface text-brand-text" : "text-muted-foreground hover:text-foreground hover:bg-hover"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className="space-y-3">
        {movers
          .filter((row) => row.type === selectedTab)
          .slice(0, showAllMovements ? 6 : compact ? 4 : 3)
          .map((row) => {
            const insight = movementInsights[row.ticker];
            const impactPillars = insight?.impactPillars ?? "Caixa e Margens";
            const whyOpenNow = insight?.why ?? "Vale confirmar se o movimento altera a leitura dos fundamentos.";
            return (
              <article key={`${row.ticker}-${row.type}`} className="w-full rounded-xl border border-border p-3">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      {getCompanyLogo(row.ticker) && (
                        <img
                          src={getCompanyLogo(row.ticker)}
                          alt={`Logo ${row.ticker}`}
                          className="h-7 w-7 rounded-full border border-border object-cover bg-card"
                        />
                      )}
                      <span className="text-sm font-semibold text-foreground">{row.ticker}</span>
                      <span className="text-xs text-muted-foreground">{row.name}</span>
                    </div>
                    <p className="mt-1 text-sm font-medium text-foreground">{row.note}</p>
                    <p className="mt-1 text-xs text-foreground/70">Por que merece leitura: {whyOpenNow}</p>
                    <p className="mt-1 text-xs text-muted-foreground">Pilares afetados: {impactPillars}</p>
                  </div>
                  <div className="min-w-[72px] text-right pt-1">
                    <p className="text-[10px] text-muted-foreground/40">Preço</p>
                    <p className="text-[11px] text-muted-foreground/40">{row.price}</p>
                    <p className="text-[11px] font-normal text-muted-foreground/40">{row.changePct}</p>
                  </div>
                </div>
                <div className="mt-3 flex items-center gap-2">
                  <Link href={`/empresa/${row.ticker}`} className="px-3 py-1.5 rounded-xl bg-[#0E9384] text-white text-xs font-medium hover:opacity-90">
                    Abrir análise
                  </Link>
                  <button className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground/80">
                    <ExternalLink className="w-3 h-3" />
                    Ver contexto
                  </button>
                </div>
              </article>
            );
          })}
      </div>
      {movers.filter((row) => row.type === selectedTab).length > 3 ? (
        <button onClick={() => setShowAllMovements((prev) => !prev)} className="mt-3 text-xs text-muted-foreground hover:text-foreground/80">
          {showAllMovements ? "Ver menos movimentos" : "Ver mais movimentos"}
        </button>
      ) : null}
      <div className="mt-4 text-[11px] text-muted-foreground/60">Fonte: B3 . Atualizado em 05/02</div>
    </section>
  );

  return (
    <div className="min-h-screen bg-background">
      <div className="fixed inset-y-0 left-0 z-30 w-[88px]">
        <Sidebar currentPage="explorar" />
      </div>

      <AppTopBar />

      <main className="ml-[88px] pt-12">
        <div className="p-8">
            <div className="max-w-[1560px] space-y-5">
              <div className="grid grid-cols-1">
              {/* Hero curado */}
              <section className="bg-card rounded-2xl border border-border p-6">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <h3 className="text-base font-semibold text-foreground">O que vale ver hoje</h3>
                    <p className="text-xs text-muted-foreground">Curadoria com contexto para priorizar empresas que merecem análise hoje.</p>
                    <p className="mt-1 text-xs text-foreground/80">Eixo principal do dia: o que mudou, por que importa e qual pilar merece atenção primeiro.</p>
                  </div>

                  <div className="rounded-xl border border-border bg-background px-3 py-2">
                    <p className="mb-1 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">Lente da curadoria</p>
                    <p className="mb-2 text-[11px] text-muted-foreground">
                      {summaryScope === "Setor" ? "Mostra destaques do setor selecionado." : "Mostra os destaques mais relevantes do mercado."}
                    </p>
                    <div className="flex items-center gap-1.5">
                    {[
                      { label: "Mercado", enabled: true },
                      { label: "Setor", enabled: hasSectorSelected, tooltip: "Selecione um setor para ativar." },
                      { label: "Minha watchlist", enabled: hasWatchlist, tooltip: "Adicione empresas à watchlist para ativar." },
                    ]
                      .filter((option) => option.label !== "Minha watchlist" || hasWatchlist)
                      .map((option) => (
                        <button
                          key={option.label}
                          onClick={() => option.enabled && setSummaryScope(option.label as typeof summaryScope)}
                          title={!option.enabled ? option.tooltip : undefined}
                          className={`px-2.5 py-1 rounded-full text-[11px] font-medium border transition-colors ${
                            summaryScope === option.label
                              ? "border-[#0E9384] bg-[#E7F6F3] text-[#0E9384]"
                              : option.enabled
                              ? "border-border text-foreground/80 hover:border-[#D0D5DD]"
                              : "border-border text-muted-foreground/60 cursor-not-allowed"
                          }`}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-4 flex flex-col gap-3">
                  {summaryState === "loading" && (
                    <div className="space-y-3">
                      <div className="h-4 w-40 bg-muted rounded" />
                      {[1, 2, 3].map((item) => (
                        <div key={item} className="h-16 rounded-2xl bg-muted" />
                      ))}
                    </div>
                  )}

                  {summaryState === "error" && (
                    <div className="rounded-2xl border border-border bg-background p-4 text-sm text-foreground/80">
                      <p>Não foi possível carregar os destaques agora. Tente novamente.</p>
                      <button
                        onClick={() => setSummaryState("ready")}
                        className="mt-3 inline-flex items-center gap-2 text-xs font-medium text-[#0E9384] focus:outline-none focus:ring-2 focus:ring-[#0E9384]/30"
                      >
                        Tentar novamente
                      </button>
                    </div>
                  )}

                  {summaryState === "empty" && (
                    <div className="rounded-2xl border border-border bg-background p-4 text-sm text-foreground/80">
                      <p>Ainda não temos destaques para exibir hoje.</p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        <button className="px-3 py-2 rounded-xl border border-border text-xs text-foreground/80 hover:border-[#D0D5DD] focus:outline-none focus:ring-2 focus:ring-[#0E9384]/30">
                          Explorar por tese
                        </button>
                        <button className="px-3 py-2 rounded-xl bg-[#0E9384] text-white text-xs hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-[#0E9384]/30">
                          Ver empresas para analisar
                        </button>
                      </div>
                    </div>
                  )}

                  {summaryState === "ready" && (
                    <>
                      <div className="space-y-3">
                        {sortedHighlights.map((item, index) => (
                          <div
                            key={item.id}
                            className={`flex flex-col gap-4 rounded-2xl border border-border p-4 md:flex-row md:items-center md:justify-between ${
                              !showAllHighlights && index >= 3 ? "hidden" : ""
                            }`}
                          >
                            <div className="flex items-start gap-3">
                              {getCompanyLogo(item.ticker) && (
                                <img
                                  src={getCompanyLogo(item.ticker)}
                                  alt={`Logo ${item.ticker}`}
                                  className="h-9 w-9 rounded-full border border-border object-cover bg-card self-center"
                                />
                              )}
                              <div className="flex flex-col gap-1">
                                <span className={`inline-flex w-fit items-center rounded-full border px-2 py-0.5 text-[11px] font-medium ${severityStyles[item.severity]}`}>
                                  {priorityLabelMap[item.severity]}
                                </span>
                                <p className="text-sm font-semibold text-foreground">
                                  {item.companyName} ({item.ticker})
                                </p>
                                <p className="text-xs text-muted-foreground">Entrou hoje porque: {item.changeTitle}</p>
                                <p className="text-xs text-foreground/80">Ganho ao abrir agora: {item.whyItMatters}</p>
                                <p className="text-xs text-muted-foreground">
                                  Impacta: {item.pillar} . {item.timeframeLabel}
                                </p>
                              </div>
                            </div>

                            <div className="flex flex-col items-start gap-2 md:items-end">
                              <Link
                                href={`/empresa/${item.ticker}`}
                                className="px-3 py-2 rounded-xl bg-[#0E9384] text-white text-xs font-medium hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-[#0E9384]/30"
                              >
                                Abrir análise
                              </Link>

                              <button
                                onClick={() => setSelectedSource(item)}
                                className="inline-flex items-center gap-1 text-[11px] text-muted-foreground/60 hover:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[#0E9384]/20"
                              >
                                <FileText className="h-3 w-3" />
                                Ver fonte
                              </button>

                              <button onClick={() => applyHighlightPreset(item.filterPreset)} className="text-xs text-foreground/80 hover:text-foreground">
                                Ver empresas relacionadas
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>

                      {highlights.length > 3 && (
                        <button onClick={() => setShowAllHighlights((prev) => !prev)} className="self-start text-xs text-foreground/80 hover:text-foreground">
                          {showAllHighlights ? "Ver menos" : "Ver mais"}
                        </button>
                      )}
                    </>
                  )}
                </div>

                <div className="mt-4 flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground">
                  <span>Última atualização: 05/02</span>
                  <span>.</span>
                  <span>Fontes: CVM, B3, RI</span>
                </div>
                <p className="mt-3 text-[11px] text-muted-foreground">Isto é um resumo educacional. Não é recomendação de compra ou venda.</p>
              </section>
              </div>

              <div className="grid grid-cols-1">
                <div className="space-y-5">
              {/* Empresas */}
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

              {/* Contexto e Volatilidade */}
              <section className="space-y-3">
                <button
                  onClick={() => setShowContextPanel((prev) => !prev)}
                  className="flex w-full items-center justify-between rounded-2xl border border-border bg-card px-4 py-2.5 text-left"
                >
                  <div>
                    <h2 className="text-base font-semibold text-foreground">Contexto de mercado hoje</h2>
                    <p className="text-xs text-muted-foreground">Bloco de apoio para leitura. Não substitui a curadoria principal.</p>
                  </div>
                  <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${showContextPanel ? "rotate-180" : ""}`} />
                </button>
                {showContextPanel ? (
                  <div className="grid grid-cols-1 gap-2.5">
                    <div>
                      <div className="mb-2 rounded-2xl border border-border bg-card p-2 text-xs text-foreground/80">
                        Mercado em tom misto, small caps reagindo melhor e volatilidade em nível moderado. Use esse contexto para priorizar leitura por tese.
                      </div>
                      {isLoading ? (
                        <div className="flex gap-3 overflow-x-auto pb-1 lg:grid lg:grid-cols-5 lg:overflow-visible">
                          {[1, 2, 3, 4, 5].map((item) => (
                            <div key={item} className="min-w-[170px] bg-card rounded-2xl border border-border p-2.5">
                              <div className="h-3 w-24 bg-muted rounded mb-2" />
                              <div className="h-4 w-16 bg-muted rounded mb-4" />
                              <div className="h-6 w-20 bg-muted rounded" />
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="flex gap-2 overflow-x-auto pb-1 lg:grid lg:grid-cols-5 lg:overflow-visible">
                          {indexCards.map((card) => (
                            <div key={card.symbol} className="min-w-[150px] bg-card rounded-xl border border-border p-2">
                              <div className="mb-1 flex items-center justify-between">
                                <div>
                                  <p className="text-[11px] text-muted-foreground">{card.name}</p>
                                  <p className="text-xs font-semibold text-foreground">{card.symbol}</p>
                                </div>
                                <MiniSparkline data={card.sparkline} status={getTrendStatus(card.trend)} />
                              </div>
                              <div className="flex items-end justify-between">
                                <div>
                                  <p className="text-sm font-semibold text-foreground">{card.value}</p>
                                  <div className="text-[10px] text-muted-foreground">
                                    {card.changeAbs} ({card.changePct})
                                  </div>
                                </div>
                                <span className="text-[10px] text-muted-foreground/60">1D</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="bg-card rounded-2xl border border-border p-3">
                      <div className="mb-2 flex items-center justify-between">
                        <div>
                          <h3 className="text-sm font-semibold text-foreground">Volatilidade do mercado</h3>
                          <p className="text-xs text-muted-foreground">Sinal de contexto para ajustar comportamento de risco.</p>
                        </div>
                        <button
                          onClick={() => setShowVolatilityInfo((prev) => !prev)}
                          className="w-8 h-8 rounded-full border border-border flex items-center justify-center hover:border-neutral-300 focus:outline-none focus:ring-2 focus:ring-mint-100"
                          aria-label="Informações sobre volatilidade"
                        >
                          <Info className="w-4 h-4 text-muted-foreground" />
                        </button>
                      </div>
                      {showVolatilityInfo ? (
                        <div className="mb-3 rounded-xl border border-border bg-card p-3 text-xs text-foreground/70">
                          Volatilidade: medida de oscilação de preços. Maior volatilidade = preços variam mais.
                        </div>
                      ) : null}
                      <div className="space-y-2">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <div className="flex items-baseline gap-3">
                              <p className="text-2xl font-semibold text-foreground">{volatility.value}</p>
                              <span
                                className={`px-2 py-1 rounded-full text-xs border ${
                                  volatility.label === "Baixa"
                                    ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                                    : volatility.label === "Moderada"
                                    ? "bg-amber-50 text-amber-700 border-amber-100"
                                    : "bg-rose-50 text-rose-700 border-rose-100"
                                }`}
                              >
                                {volatility.label}
                              </span>
                            </div>
                            <p className="text-sm text-foreground/70 mt-1.5">
                              Oscilações tendem a aumentar no curto prazo, o que pede mais cuidado na leitura dos movimentos.
                            </p>
                          </div>
                          <button onClick={() => setShowVolatilityDetails(true)} className="text-xs text-muted-foreground hover:text-foreground/80">
                            Ver detalhes
                          </button>
                        </div>
                        <div className="flex items-center justify-between text-[11px] text-muted-foreground/60">
                          <span>
                            Fonte: {volatility.source} . Atualizado em {volatility.updatedAt}
                          </span>
                          {volatilityIsStale ? (
                            <span className="px-2 py-0.5 rounded-full border border-amber-200 bg-amber-50 text-amber-700">Desatualizado</span>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="rounded-2xl border border-border bg-card px-4 py-3 text-xs text-foreground/70">
                    Resumo rápido: mercado em tom misto, small caps reagindo melhor e volatilidade moderada.
                  </div>
                )}
              </section>

              {/* Movimentos com contexto */}
              <section>{renderMovementsPanel(false)}</section>
              </div>
              </div>
            </div>
        </div>
      </main>

      {/* Compare bar */}
      {compareTickers.length > 0 && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-card border border-border shadow-lg rounded-2xl px-4 py-3 flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Comparar:</span>
            {compareTickers.map((ticker) => (
              <span key={ticker} className="flex items-center gap-1 px-2 py-1 rounded-full bg-muted text-xs text-foreground/80">
                {ticker}
                <button onClick={() => toggleCompare(ticker)}>
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
          <button className="px-3 py-2 rounded-xl bg-mint-500 text-white text-xs font-medium hover:bg-mint-600">
            Comparar ({compareTickers.length}/4)
          </button>
        </div>
      )}

      {/* Source drawer */}
      <Drawer open={!!selectedSource} onClose={() => setSelectedSource(null)} title="Detalhes da fonte">
        {selectedSource && (
          <div className="space-y-4 text-sm text-foreground/80">
            <div>
              <p className="text-xs text-muted-foreground">Fonte</p>
              <p className="font-medium text-foreground">{selectedSource.source.name}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Documento</p>
              <p className="font-medium text-foreground">{selectedSource.source.docLabel}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Data de referência</p>
              <p className="font-medium text-foreground">{selectedSource.source.updatedAt}</p>
            </div>
            {selectedSource.source.url && (
              <a href={selectedSource.source.url} className="inline-flex items-center gap-2 text-xs text-[#0E9384] hover:text-foreground">
                Ver documento externo
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
          </div>
        )}
      </Drawer>

      {/* Volatility drawer */}
      <Drawer open={showVolatilityDetails} onClose={() => setShowVolatilityDetails(false)} title="Detalhes da volatilidade">
        <div className="space-y-4 text-sm text-foreground/80">
          <p>Volatilidade é a medida de quanto os preços oscilam em um período. Níveis mais altos indicam variações maiores no curto prazo.</p>
          <p>O score combina amplitude média de movimentos e dispersão diária, com referência à mediana dos últimos 12 meses.</p>
          <div>
            <p className="text-xs text-muted-foreground">Fontes e atualização</p>
            <p className="font-medium text-foreground">B3 . Atualização diária (D+1)</p>
          </div>
          <p className="text-xs text-muted-foreground">Este indicador é educacional e não representa recomendação de compra ou venda.</p>
        </div>
      </Drawer>
    </div>
  );
}

export default ExplorePage;

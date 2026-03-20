"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronDown, CheckCircle2, MoreHorizontal, Search } from "lucide-react";
import type { Pillar, WatchlistCompany, WatchlistSortBy, WatchlistStatus, FeedSource } from "../interfaces";
import { getStatusFromScores } from "../services";

const badgeStyles: Record<"Risco" | "Atenção" | "Saudável", string> = {
  Risco: "bg-rose-100 text-rose-900 border-rose-300",
  "Atenção": "bg-amber-100 text-amber-900 border-amber-300",
  "Saudável": "bg-emerald-100 text-emerald-900 border-emerald-300",
};

const clickableItemStyles: Record<"Risco" | "Atenção" | "Saudável", string> = {
  Risco: "border-l-rose-400 hover:border-border-strong hover:bg-hover hover:shadow-[inset_3px_0_0_var(--brand)]",
  Atenção: "border-l-amber-400 hover:border-border-strong hover:bg-hover hover:shadow-[inset_3px_0_0_var(--brand)]",
  Saudável: "border-l-emerald-400 hover:border-border-strong hover:bg-hover hover:shadow-[inset_3px_0_0_var(--brand)]",
};

const freshnessBadgeStyles: Record<"Atualizado" | "Dados pendentes" | "Sem dados", string> = {
  Atualizado: "bg-emerald-50 text-emerald-700 border-emerald-100",
  "Dados pendentes": "bg-amber-50 text-amber-700 border-amber-100",
  "Sem dados": "bg-hover text-dim border-border",
};

const pillars: Pillar[] = ["Dívida", "Caixa", "Margens", "Retorno", "Proventos"];

interface WatchlistListTabProps {
  filteredCompanies: WatchlistCompany[];
  listSearch: string;
  sortBy: WatchlistSortBy;
  listDensity: "Compacto" | "Detalhado";
  showListFilters: boolean;
  activeListFiltersCount: number;
  unseenOnly: boolean;
  seenTickers: string[];
  expandedTicker: string | null;
  quickActionsTicker: string | null;
  listSeverityFilter: "Todos" | WatchlistStatus;
  listSourceFilter: "Todas" | FeedSource;
  filters: { sector: string; tags: string; pillar: string };
  sourceByTicker: Record<string, string>;
  getWhyItMatters: (company: WatchlistCompany) => string;
  buildCompanyDeepLink: (ticker: string, pillar: Pillar, evidenceId?: string) => string;
  defaultEvidenceByPillar: Record<Pillar, string>;
  setListSearch: (v: string) => void;
  setSortBy: (v: WatchlistSortBy) => void;
  setListDensity: (v: "Compacto" | "Detalhado") => void;
  setShowListFilters: (v: boolean) => void;
  setUnseenOnly: (v: boolean) => void;
  setListSeverityFilter: (v: "Todos" | WatchlistStatus) => void;
  setListSourceFilter: (v: "Todas" | FeedSource) => void;
  setFilters: (v: { sector: string; tags: string; pillar: string }) => void;
  toggleSeenTicker: (ticker: string) => void;
  setExpandedTicker: (ticker: string | null) => void;
  setQuickActionsTicker: (ticker: string | null) => void;
}

export function WatchlistListTab({
  filteredCompanies,
  listSearch,
  sortBy,
  listDensity,
  showListFilters,
  activeListFiltersCount,
  unseenOnly,
  seenTickers,
  expandedTicker,
  quickActionsTicker,
  listSeverityFilter,
  listSourceFilter,
  filters,
  sourceByTicker,
  getWhyItMatters,
  buildCompanyDeepLink,
  defaultEvidenceByPillar,
  setListSearch,
  setSortBy,
  setListDensity,
  setShowListFilters,
  setUnseenOnly,
  setListSeverityFilter,
  setListSourceFilter,
  setFilters,
  toggleSeenTicker,
  setExpandedTicker,
  setQuickActionsTicker,
}: WatchlistListTabProps) {
  const router = useRouter();

  return (
    <div className="space-y-4">
      <div className="bg-card rounded-2xl border border-border shadow-sm p-4">
        <div className="flex flex-col lg:flex-row lg:items-center gap-3">
          <div className="relative flex-[1.8]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Buscar empresa ou ticker..."
              value={listSearch}
              onChange={(event) => setListSearch(event.target.value)}
              className="w-full pl-10 pr-3 py-2 rounded-xl border border-border text-sm text-dim focus:outline-none focus:ring-2 focus:ring-mint-100"
            />
          </div>
          <div className="relative flex-1">
            <select
              value={sortBy}
              onChange={(event) => setSortBy(event.target.value as WatchlistSortBy)}
              className="w-full px-3 py-2 rounded-xl border border-border text-xs text-muted-foreground bg-card focus:outline-none focus:ring-2 focus:ring-mint-100"
            >
              {[
                "Mudou recentemente",
                "Atenção primeiro",
                "Melhor qualidade (score geral)",
              ].map((option) => (
                <option key={option} value={option}>
                  Ordenar: {option}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-muted-foreground absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {(["Compacto", "Detalhado"] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setListDensity(mode)}
                className={`px-3 py-2 rounded-xl text-xs font-medium border ${
                  listDensity === mode
                    ? "border-brand-border bg-brand-surface text-brand-text"
                    : "border-border bg-card text-muted-foreground"
                }`}
              >
                {mode}
              </button>
            ))}
            <button
              onClick={() => setShowListFilters(!showListFilters)}
              className={`px-3 py-2 rounded-xl text-xs font-medium border ${
                showListFilters
                  ? "border-neutral-300 bg-hover text-dim"
                  : "border-border bg-card text-muted-foreground"
              }`}
            >
              Filtros ({activeListFiltersCount})
            </button>
            <button
              onClick={() => setUnseenOnly(!unseenOnly)}
              className={`px-3 py-2 rounded-xl text-xs font-medium border ${
                unseenOnly
                  ? "border-neutral-300 bg-hover text-dim"
                  : "border-border bg-card text-muted-foreground"
              }`}
            >
              Não vistos
            </button>
          </div>
        </div>

        {showListFilters && (
          <div className="mt-3 grid grid-cols-1 gap-2 md:grid-cols-2 xl:grid-cols-3">
            {[
              {
                label: "Setor",
                key: "sector",
                options: ["Todos", "Bancos", "Energia", "Indústria", "Saúde", "Consumo", "Construção", "Varejo"],
              },
              {
                label: "Tags",
                key: "tags",
                options: ["Todos", "Qualidade", "Defensiva", "Dividendos", "Risco", "Cíclica", "Renda", "Atenção"],
              },
              {
                label: "Pilar em atenção",
                key: "pillar",
                options: ["Todos", ...pillars],
              },
            ].map((filter) => (
              <div key={filter.key} className="relative">
                <select
                  value={filters[filter.key as keyof typeof filters]}
                  onChange={(event) =>
                    setFilters({ ...filters, [filter.key]: event.target.value })
                  }
                  className="w-full px-3 py-2 rounded-xl border border-border text-xs text-dim bg-card focus:outline-none focus:ring-2 focus:ring-mint-100"
                >
                  {filter.options.map((option) => (
                    <option key={option} value={option}>
                      {filter.label}: {option}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-muted-foreground absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            ))}
            <div className="relative">
              <select
                value={listSeverityFilter}
                onChange={(event) => setListSeverityFilter(event.target.value as "Todos" | WatchlistStatus)}
                className="w-full px-3 py-2 rounded-xl border border-border text-xs text-dim bg-card focus:outline-none focus:ring-2 focus:ring-mint-100"
              >
                {["Todos", "Risco", "Atenção", "Saudável"].map((option) => (
                  <option key={option} value={option}>
                    Severidade: {option}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-muted-foreground absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
            <div className="relative">
              <select
                value={listSourceFilter}
                onChange={(event) => setListSourceFilter(event.target.value as "Todas" | FeedSource)}
                className="w-full px-3 py-2 rounded-xl border border-border text-xs text-dim bg-card focus:outline-none focus:ring-2 focus:ring-mint-100"
              >
                {["Todas", "CVM", "B3", "RI"].map((option) => (
                  <option key={option} value={option}>
                    Fonte: {option}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-muted-foreground absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>
        )}
      </div>

      <div className="space-y-3">
        {filteredCompanies.map((company) => {
          const isExpanded = expandedTicker === company.ticker;
          const showDetails = listDensity === "Detalhado" || isExpanded;
          const isCompactCard = listDensity === "Compacto" && !isExpanded;
          const scoreTotal = Math.round(
            company.scores.reduce((sum, value) => sum + value, 0) / company.scores.length
          );
          const status = getStatusFromScores(company.scores);
          const minScore = Math.min(...company.scores);
          const minIndex = company.scores.findIndex((score) => score === minScore);
          const keyPillar = pillars[minIndex];
          const freshnessBadge =
            company.freshness === "Atual"
              ? "Atualizado"
              : company.freshness === "Falha"
                ? "Dados pendentes"
                : "Sem dados";
          const whyItMatters = getWhyItMatters(company);
          return (
            <div
              key={company.ticker}
              role="button"
              tabIndex={0}
              onClick={() => router.push(buildCompanyDeepLink(company.ticker, company.attentionPillar))}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  router.push(buildCompanyDeepLink(company.ticker, company.attentionPillar));
                }
              }}
              className={`bg-card rounded-2xl border border-border border-l-4 shadow-sm cursor-pointer transition-colors ${clickableItemStyles[status]} ${
                isCompactCard ? "p-2.5" : "p-3.5"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-start gap-3">
                    <div className="h-9 w-9 rounded-full border border-border bg-muted text-xs font-semibold text-muted-foreground flex items-center justify-center">
                      {company.ticker.slice(0, 2)}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-foreground truncate">
                        {company.name} <span className="text-muted-foreground">({company.ticker})</span>
                      </p>
                      <p className="text-xs text-muted-foreground">{company.sector}</p>
                      <div className="mt-1.5 flex items-center gap-2">
                        <span className={`px-2 py-1 rounded-full border text-[11px] font-medium ${badgeStyles[status]}`}>
                          {status}
                        </span>
                      </div>
                      <p className="mt-1 text-sm font-medium text-foreground">
                        {minScore >= 70 ? "Sem pilar crítico no momento" : `${keyPillar} em atenção`}{" "}
                        <span className="text-muted-foreground">({minScore}/100)</span>
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-2.5 flex items-start justify-between gap-3">
                <div className="min-w-0">
                  {!isCompactCard && <p className="text-xs text-muted-foreground">{whyItMatters}</p>}
                  <p className="mt-1 text-[11px] text-muted-foreground">
                    Fonte: {sourceByTicker[company.ticker] ?? "CVM"} • Última mudança: {company.lastChangeDays}d
                    <span
                      className={`ml-2 inline-flex px-1.5 py-0.5 rounded-full border text-[10px] font-medium align-middle ${freshnessBadgeStyles[freshnessBadge]}`}
                    >
                      {freshnessBadge}
                    </span>
                  </p>
                </div>
                <div className="relative flex items-center gap-1.5 flex-wrap justify-end">
                  <button
                    onClick={(event) => {
                      event.stopPropagation();
                      router.push(buildCompanyDeepLink(company.ticker, company.attentionPillar));
                    }}
                    className="inline-flex items-center rounded-lg bg-mint-500 px-2.5 py-1.5 text-xs font-medium text-white hover:bg-mint-600 whitespace-nowrap"
                  >
                    Ver detalhes
                  </button>
                  {!isCompactCard && (
                    <Link
                      href={buildCompanyDeepLink(company.ticker, company.attentionPillar, defaultEvidenceByPillar[company.attentionPillar])}
                      onClick={(event) => event.stopPropagation()}
                      className="inline-flex items-center rounded-md border border-brand-border bg-brand-surface px-2 py-1 text-xs font-medium text-brand-text hover:text-foreground whitespace-nowrap"
                    >
                      Ver evidência
                    </Link>
                  )}
                  <button
                    title={seenTickers.includes(company.ticker) ? "Marcar como não visto" : "Marcar visto"}
                    onClick={(event) => {
                      event.stopPropagation();
                      toggleSeenTicker(company.ticker);
                    }}
                    className={`inline-flex items-center gap-1 rounded-md border px-2 py-1 text-xs whitespace-nowrap ${
                      seenTickers.includes(company.ticker)
                        ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                        : "border-border bg-muted text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    {seenTickers.includes(company.ticker) ? "Visto" : isCompactCard ? "Marcar" : "Marcar visto"}
                  </button>
                  <button
                    title="Mais ações"
                    aria-label="Mais ações"
                    onClick={(event) => {
                      event.stopPropagation();
                      setQuickActionsTicker(quickActionsTicker === company.ticker ? null : company.ticker);
                    }}
                    className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-border bg-muted text-muted-foreground hover:bg-hover hover:text-muted-foreground"
                  >
                    <MoreHorizontal className="h-3.5 w-3.5" />
                  </button>
                  {quickActionsTicker === company.ticker && (
                    <div
                      onClick={(event) => event.stopPropagation()}
                      className="absolute right-0 top-8 z-10 w-44 rounded-lg border border-border bg-card p-1.5 shadow-lg"
                    >
                      <button
                        title="Favoritar"
                        onClick={() => { setQuickActionsTicker(null); }}
                        className="w-full rounded-md px-2 py-1.5 text-left text-xs text-dim hover:bg-hover"
                      >
                        Favoritar
                      </button>
                      <button
                        title="Criar alerta"
                        onClick={() => { setQuickActionsTicker(null); }}
                        className="w-full rounded-md px-2 py-1.5 text-left text-xs text-dim hover:bg-hover"
                      >
                        Criar alerta
                      </button>
                      <button
                        title={isExpanded ? "Recolher detalhes" : "Expandir detalhes"}
                        onClick={() => {
                          setQuickActionsTicker(null);
                          setExpandedTicker(expandedTicker === company.ticker ? null : company.ticker);
                        }}
                        className="w-full rounded-md px-2 py-1.5 text-left text-xs text-dim hover:bg-hover"
                      >
                        {isExpanded ? "Recolher detalhes" : "Expandir detalhes"}
                      </button>
                      <button
                        title="Marcar visto"
                        onClick={() => {
                          setQuickActionsTicker(null);
                          toggleSeenTicker(company.ticker);
                        }}
                        className="w-full rounded-md px-2 py-1.5 text-left text-xs text-dim hover:bg-hover"
                      >
                        {seenTickers.includes(company.ticker) ? "Marcar como não visto" : "Marcar visto"}
                      </button>
                      <button
                        title="Remover da watchlist"
                        onClick={() => setQuickActionsTicker(null)}
                        className="w-full rounded-md px-2 py-1.5 text-left text-xs text-rose-600 hover:bg-hover"
                      >
                        Remover da watchlist
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {showDetails && (
                <div className="mt-4 rounded-xl border border-border bg-muted p-3 space-y-3">
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>Diagnóstico por pilar</span>
                    <span>Score geral: {scoreTotal}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {company.scores.map((score, index) => (
                      <div key={`${company.ticker}-${pillars[index]}`} className="flex-1">
                        <div
                          className={`h-2 rounded-full ${
                            score >= 70 ? "bg-emerald-400" : score >= 50 ? "bg-amber-400" : "bg-rose-400"
                          }`}
                        />
                        <div className="mt-1 text-[10px] text-muted-foreground flex items-center justify-between">
                          <span>{pillars[index]}</span>
                          <span>{score}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-muted-foreground">
                    <div className="flex items-center justify-between rounded-lg border border-border bg-card px-2 py-1.5">
                      <span>Última mudança</span>
                      <span>{company.lastChangeDays} dias</span>
                    </div>
                    {company.volatility && (
                      <div className="flex items-center justify-between rounded-lg border border-border bg-card px-2 py-1.5 sm:col-span-2">
                        <span>Volatilidade</span>
                        <span>{company.volatility}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

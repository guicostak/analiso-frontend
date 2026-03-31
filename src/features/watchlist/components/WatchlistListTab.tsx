"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Bookmark, ChevronDown, CheckCircle2, MoreHorizontal, Search } from "lucide-react";
import type { Pillar, WatchlistCompany, WatchlistSortBy, WatchlistStatus, FeedSource } from "../interfaces";
import { getStatusFromScores } from "../services";

function getBadgeStyle(status: WatchlistStatus) {
  if (status === "Risco") return "border-danger-border bg-card/72 text-danger-text";
  if (status === "Atenção") return "border-warning-border bg-card/72 text-warning-text";
  return "border-success-border bg-card/72 text-success-text";
}

function getSurfaceStyle(status: WatchlistStatus) {
  if (status === "Risco") {
    return {
      shell: "border-danger-border bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.8)_0%,rgba(255,255,255,0)_30%),linear-gradient(180deg,var(--danger-surface)_0%,var(--card)_100%)] dark:bg-card",
      hover: "hover:border-danger-border hover:shadow-[0_18px_40px_rgba(15,23,40,0.05)] dark:shadow-none",
      glow: "bg-[radial-gradient(circle,rgba(181,71,104,0.12)_0%,rgba(181,71,104,0)_74%)]",
      band: "bg-[linear-gradient(90deg,rgba(181,71,104,0.18)_0%,rgba(181,71,104,0.06)_52%,rgba(181,71,104,0)_100%)]",
    };
  }

  if (status === "Atenção") {
    return {
      shell: "border-warning-border bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.8)_0%,rgba(255,255,255,0)_30%),linear-gradient(180deg,var(--warning-surface)_0%,var(--card)_100%)] dark:bg-card",
      hover: "hover:border-warning-border hover:shadow-[0_18px_40px_rgba(15,23,40,0.05)] dark:shadow-none",
      glow: "bg-[radial-gradient(circle,rgba(178,115,0,0.12)_0%,rgba(178,115,0,0)_74%)]",
      band: "bg-[linear-gradient(90deg,rgba(178,115,0,0.18)_0%,rgba(178,115,0,0.06)_52%,rgba(178,115,0,0)_100%)]",
    };
  }

  return {
    shell: "border-success-border bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.8)_0%,rgba(255,255,255,0)_30%),linear-gradient(180deg,var(--success-surface)_0%,var(--card)_100%)] dark:bg-card",
    hover: "hover:border-success-border hover:shadow-[0_18px_40px_rgba(15,23,40,0.05)] dark:shadow-none",
    glow: "bg-[radial-gradient(circle,rgba(23,130,91,0.1)_0%,rgba(23,130,91,0)_74%)]",
    band: "bg-[linear-gradient(90deg,rgba(23,130,91,0.16)_0%,rgba(23,130,91,0.05)_52%,rgba(23,130,91,0)_100%)]",
  };
}

const freshnessBadgeStyles: Record<"Atualizado" | "Dados pendentes" | "Sem dados", string> = {
  Atualizado: "border-success-border bg-success-surface text-success-text",
  "Dados pendentes": "border-warning-border bg-warning-surface text-warning-text",
  "Sem dados": "border-border bg-muted text-muted-foreground",
};

const pillars = ["Dívida", "Caixa", "Margens", "Retorno", "Proventos"] as Pillar[];

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
  getDefaultEvidenceId: (pillar: Pillar) => string;
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
  favoriteTickers: Set<string>;
  onToggleFavorite: (ticker: string) => void;
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
  getDefaultEvidenceId,
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
  favoriteTickers,
  onToggleFavorite,
}: WatchlistListTabProps) {
  const router = useRouter();

  return (
    <div className="space-y-6">
      <div className="rounded-[24px] border border-border bg-card p-5 shadow-[0_18px_40px_rgba(15,23,40,0.04)] dark:shadow-none">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
          <div className="relative flex-[1.8]">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Buscar empresa ou ticker..."
              value={listSearch}
              onChange={(event) => setListSearch(event.target.value)}
              className="h-12 w-full rounded-[18px] border border-border bg-muted pl-10 pr-3 text-[14px] text-foreground outline-none focus:ring-2 focus:ring-brand-border"
            />
          </div>

          <div className="relative flex-1">
            <select
              value={sortBy}
              onChange={(event) => setSortBy(event.target.value as WatchlistSortBy)}
              className="h-12 w-full rounded-[18px] border border-border bg-muted px-4 text-[13px] font-medium text-muted-foreground outline-none focus:ring-2 focus:ring-brand-border"
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
            <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {(["Compacto", "Detalhado"] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setListDensity(mode)}
                className={`rounded-full border px-4 py-2 text-[12px] font-semibold transition ${
                  listDensity === mode
                    ? "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-800/50 dark:bg-blue-900/30 dark:text-blue-300"
                    : "border-border bg-card text-muted-foreground hover:bg-muted"
                }`}
              >
                {mode}
              </button>
            ))}

            <button
              onClick={() => setShowListFilters(!showListFilters)}
              className={`rounded-full border px-4 py-2 text-[12px] font-semibold transition ${
                showListFilters
                  ? "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-800/50 dark:bg-blue-900/30 dark:text-blue-300"
                  : "border-border bg-card text-muted-foreground hover:bg-muted"
              }`}
            >
              Filtros ({activeListFiltersCount})
            </button>

            <button
              onClick={() => setUnseenOnly(!unseenOnly)}
              className={`rounded-full border px-4 py-2 text-[12px] font-semibold transition ${
                unseenOnly
                  ? "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-800/50 dark:bg-blue-900/30 dark:text-blue-300"
                  : "border-border bg-card text-muted-foreground hover:bg-muted"
              }`}
            >
              Não vistos
            </button>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-3 border-t border-border pt-4 text-[12px] text-muted-foreground">
          <span>{filteredCompanies.length} itens</span>
          <span>Ordenar: {sortBy}</span>
          <span>{unseenOnly ? "Não vistos" : "Todos"}</span>
        </div>

        {showListFilters && (
          <div className="mt-4 grid grid-cols-1 gap-3 rounded-[20px] border border-border bg-muted p-4 md:grid-cols-2 xl:grid-cols-3">
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
                  onChange={(event) => setFilters({ ...filters, [filter.key]: event.target.value })}
                  className="h-12 w-full rounded-[18px] border border-border bg-card px-4 text-[13px] font-medium text-muted-foreground outline-none focus:ring-2 focus:ring-brand-border"
                >
                  {filter.options.map((option) => (
                    <option key={option} value={option}>
                      {filter.label}: {option}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              </div>
            ))}

            <div className="relative">
              <select
                value={listSeverityFilter}
                onChange={(event) => setListSeverityFilter(event.target.value as "Todos" | WatchlistStatus)}
                className="h-12 w-full rounded-[18px] border border-border bg-card px-4 text-[13px] font-medium text-muted-foreground outline-none focus:ring-2 focus:ring-brand-border"
              >
                {["Todos", "Risco", "Atenção", "Saudável"].map((option) => (
                  <option key={option} value={option}>
                    Severidade: {option}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            </div>

            <div className="relative">
              <select
                value={listSourceFilter}
                onChange={(event) => setListSourceFilter(event.target.value as "Todas" | FeedSource)}
                className="h-12 w-full rounded-[18px] border border-border bg-card px-4 text-[13px] font-medium text-muted-foreground outline-none focus:ring-2 focus:ring-brand-border"
              >
                {["Todas", "CVM", "B3", "RI"].map((option) => (
                  <option key={option} value={option}>
                    Fonte: {option}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            </div>
          </div>
        )}
      </div>

      <div className="space-y-4">
        {filteredCompanies.map((company, index) => {
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
          const tone = getSurfaceStyle(status);
          const cardMass =
            index === 0
              ? "rounded-[28px] px-6 py-6"
              : index === 1
                ? "rounded-[26px] px-5.5 py-5.5"
                : "rounded-[24px] px-5 py-5";

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
              className={`group relative cursor-pointer overflow-hidden border shadow-[0_16px_38px_rgba(15,23,40,0.045)] dark:shadow-none transition ${cardMass} ${tone.shell} ${tone.hover}`}
            >
              <div className="pointer-events-none absolute inset-x-0 top-0 h-14 bg-[linear-gradient(180deg,var(--card)/0.54_0%,transparent_100%)] dark:bg-none" />
              <div className={`pointer-events-none absolute left-4 top-3 h-14 w-24 rounded-full opacity-70 blur-xl ${tone.glow}`} />
              <div className={`pointer-events-none absolute inset-x-0 top-0 h-2.5 ${tone.band}`} />

              <div className="relative flex items-start gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[16px] border border-border bg-card/84 text-[12px] font-semibold text-muted-foreground shadow-[0_8px_18px_rgba(15,23,40,0.04)] dark:shadow-none">
                  {company.ticker.slice(0, 2)}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="truncate text-[20px] font-semibold leading-[26px] tracking-[-0.02em] text-foreground">
                          {company.name}
                        </p>
                        <span className="text-[14px] font-medium text-muted-foreground">{company.ticker}</span>
                      </div>

                      <div className="mt-2 flex flex-wrap items-center gap-2">
                        <span className={`rounded-full border px-3 py-1 text-[11px] font-medium ${getBadgeStyle(status)}`}>
                          {status}
                        </span>
                        {!seenTickers.includes(company.ticker) && (
                          <span className="rounded-full border border-border bg-card/70 px-2.5 py-1 text-[10px] font-medium text-muted-foreground">
                            Não visto
                          </span>
                        )}
                      </div>

                      <p className="mt-2 text-[13px] text-muted-foreground">{company.sector}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="relative mt-5 rounded-[22px] border border-border bg-card/72 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.62)] dark:shadow-none">
                <p className={`${index === 0 ? "text-[17px]" : "text-[16px]"} font-medium leading-7 text-foreground`}>
                  {minScore >= 70 ? "Sem pilar crítico no momento" : `${keyPillar} em atenção`}{" "}
                  <span className="text-muted-foreground">({minScore}/100)</span>
                </p>
                {!isCompactCard && (
                  <p className="mt-3 max-w-[65ch] text-[15px] leading-7 text-muted-foreground">{whyItMatters}</p>
                )}
              </div>

              <div className="relative mt-4 flex flex-col gap-3 border-t border-border pt-4 xl:flex-row xl:items-end xl:justify-between">
                <div className="min-w-0">
                  <p className="text-[12px] text-muted-foreground">
                    Fonte: {sourceByTicker[company.ticker] ?? "CVM"} • Última mudança: {company.lastChangeDays}d
                    <span className={`ml-2 inline-flex rounded-full border px-2 py-0.5 text-[10px] font-medium align-middle ${freshnessBadgeStyles[freshnessBadge]}`}>
                      {freshnessBadge}
                    </span>
                  </p>
                </div>

                <div className="relative flex flex-wrap items-center gap-1.5 rounded-[18px] border border-border bg-card/82 p-1.5 shadow-[0_10px_24px_rgba(15,23,40,0.035)] dark:shadow-none">
                  <button
                    onClick={(event) => {
                      event.stopPropagation();
                      router.push(buildCompanyDeepLink(company.ticker, company.attentionPillar));
                    }}
                    className="inline-flex h-9 items-center rounded-full bg-brand px-3.5 text-[12px] font-semibold whitespace-nowrap text-white shadow-[0_12px_24px_rgba(18,165,148,0.18)] hover:bg-brand-dark"
                  >
                    Ver detalhes
                  </button>

                  {!isCompactCard && (
                    <Link
                      href={buildCompanyDeepLink(company.ticker, company.attentionPillar, getDefaultEvidenceId(company.attentionPillar))}
                      onClick={(event) => event.stopPropagation()}
                      className="inline-flex h-9 items-center rounded-full border border-border bg-card/86 px-3.5 text-[12px] font-semibold whitespace-nowrap text-foreground hover:bg-card"
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
                    className={`inline-flex h-9 items-center gap-1 rounded-full border px-3 text-[12px] font-medium whitespace-nowrap ${
                      seenTickers.includes(company.ticker)
                        ? "border-success-border bg-card/82 text-success-text"
                        : "border-border bg-card/82 text-muted-foreground hover:text-foreground"
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
                    className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border bg-card/82 text-muted-foreground hover:bg-card hover:text-foreground"
                  >
                    <MoreHorizontal className="h-3.5 w-3.5" />
                  </button>

                  {quickActionsTicker === company.ticker && (
                    <div
                      onClick={(event) => event.stopPropagation()}
                      className="absolute right-0 top-12 z-10 w-48 rounded-[18px] border border-border bg-card p-2 shadow-[0_18px_40px_rgba(15,23,40,0.08)]"
                    >
                      <button
                        title={favoriteTickers.has(company.ticker) ? "Remover dos favoritos" : "Favoritar"}
                        onClick={() => {
                          onToggleFavorite(company.ticker);
                          setQuickActionsTicker(null);
                        }}
                        className={`flex w-full items-center gap-2 rounded-[12px] px-3 py-2 text-left text-[12px] hover:bg-muted ${
                          favoriteTickers.has(company.ticker) ? "text-brand" : "text-muted-foreground"
                        }`}
                      >
                        <Bookmark className={`h-3.5 w-3.5 ${favoriteTickers.has(company.ticker) ? "fill-brand" : ""}`} />
                        {favoriteTickers.has(company.ticker) ? "Remover dos favoritos" : "Favoritar"}
                      </button>
                      <button
                        title="Criar alerta"
                        onClick={() => setQuickActionsTicker(null)}
                        className="w-full rounded-[12px] px-3 py-2 text-left text-[12px] text-muted-foreground hover:bg-muted"
                      >
                        Criar alerta
                      </button>
                      <button
                        title={isExpanded ? "Recolher detalhes" : "Expandir detalhes"}
                        onClick={() => {
                          setQuickActionsTicker(null);
                          setExpandedTicker(expandedTicker === company.ticker ? null : company.ticker);
                        }}
                        className="w-full rounded-[12px] px-3 py-2 text-left text-[12px] text-muted-foreground hover:bg-muted"
                      >
                        {isExpanded ? "Recolher detalhes" : "Expandir detalhes"}
                      </button>
                      <button
                        title="Marcar visto"
                        onClick={() => {
                          setQuickActionsTicker(null);
                          toggleSeenTicker(company.ticker);
                        }}
                        className="w-full rounded-[12px] px-3 py-2 text-left text-[12px] text-muted-foreground hover:bg-muted"
                      >
                        {seenTickers.includes(company.ticker) ? "Marcar como não visto" : "Marcar visto"}
                      </button>
                      <button
                        title="Remover dos favoritos"
                        onClick={() => {
                          if (favoriteTickers.has(company.ticker)) {
                            onToggleFavorite(company.ticker);
                          }
                          setQuickActionsTicker(null);
                        }}
                        className="w-full rounded-[12px] px-3 py-2 text-left text-[12px] text-danger-text hover:bg-danger-surface"
                      >
                        Remover dos favoritos
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {showDetails && (
                <div className="mt-4 space-y-4 rounded-[22px] border border-border bg-card/65 p-4">
                  <div className="flex items-center justify-between text-[12px] text-muted-foreground">
                    <span>Diagnóstico por pilar</span>
                    <span className="font-medium text-foreground">Score geral: {scoreTotal}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    {company.scores.map((score, scoreIndex) => (
                      <div key={`${company.ticker}-${pillars[scoreIndex]}`} className="flex-1">
                        <div
                          className={`h-2 rounded-full ${
                            score >= 70 ? "bg-emerald-400" : score >= 50 ? "bg-amber-400" : "bg-rose-400"
                          }`}
                        />
                        <div className="mt-1 flex items-center justify-between text-[10px] text-muted-foreground">
                          <span>{pillars[scoreIndex]}</span>
                          <span>{score}</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="grid grid-cols-1 gap-2 text-[12px] text-muted-foreground sm:grid-cols-2">
                    <div className="flex items-center justify-between rounded-[16px] border border-border bg-card px-3 py-2">
                      <span>Última mudança</span>
                      <span className="font-medium text-foreground">{company.lastChangeDays} dias</span>
                    </div>
                    {company.volatility && (
                      <div className="flex items-center justify-between rounded-[16px] border border-border bg-card px-3 py-2 sm:col-span-2">
                        <span>Volatilidade</span>
                        <span className="font-medium text-foreground">{company.volatility}</span>
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

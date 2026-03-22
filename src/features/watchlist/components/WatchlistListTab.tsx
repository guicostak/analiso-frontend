"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronDown, CheckCircle2, MoreHorizontal, Search } from "lucide-react";
import type { Pillar, WatchlistCompany, WatchlistSortBy, WatchlistStatus, FeedSource } from "../interfaces";
import { getStatusFromScores } from "../services";

function getBadgeStyle(status: WatchlistStatus) {
  if (status === "Risco") return "border-[#F3D6DE] bg-white/72 text-[#B54768]";
  if (status === "Atenção") return "border-[#F3E0B5] bg-white/72 text-[#B27300]";
  return "border-[#D7EDE3] bg-white/72 text-[#17825B]";
}

function getSurfaceStyle(status: WatchlistStatus) {
  if (status === "Risco") {
    return {
      shell: "border-[#F2D8DE] bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.8)_0%,rgba(255,255,255,0)_30%),linear-gradient(180deg,#FFF8FA_0%,#FFFDFE_100%)]",
      hover: "hover:border-[#E7C5CE] hover:shadow-[0_18px_40px_rgba(15,23,40,0.05)]",
      glow: "bg-[radial-gradient(circle,rgba(181,71,104,0.12)_0%,rgba(181,71,104,0)_74%)]",
      band: "bg-[linear-gradient(90deg,rgba(181,71,104,0.18)_0%,rgba(181,71,104,0.06)_52%,rgba(181,71,104,0)_100%)]",
    };
  }

  if (status === "Atenção") {
    return {
      shell: "border-[#F4E1B8] bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.8)_0%,rgba(255,255,255,0)_30%),linear-gradient(180deg,#FFF9EF_0%,#FFFDFC_100%)]",
      hover: "hover:border-[#E8CF93] hover:shadow-[0_18px_40px_rgba(15,23,40,0.05)]",
      glow: "bg-[radial-gradient(circle,rgba(178,115,0,0.12)_0%,rgba(178,115,0,0)_74%)]",
      band: "bg-[linear-gradient(90deg,rgba(178,115,0,0.18)_0%,rgba(178,115,0,0.06)_52%,rgba(178,115,0,0)_100%)]",
    };
  }

  return {
    shell: "border-[#D8EEE4] bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.8)_0%,rgba(255,255,255,0)_30%),linear-gradient(180deg,#F7FCFA_0%,#FEFFFF_100%)]",
    hover: "hover:border-[#C8E5D7] hover:shadow-[0_18px_40px_rgba(15,23,40,0.05)]",
    glow: "bg-[radial-gradient(circle,rgba(23,130,91,0.1)_0%,rgba(23,130,91,0)_74%)]",
    band: "bg-[linear-gradient(90deg,rgba(23,130,91,0.16)_0%,rgba(23,130,91,0.05)_52%,rgba(23,130,91,0)_100%)]",
  };
}

const freshnessBadgeStyles: Record<"Atualizado" | "Dados pendentes" | "Sem dados", string> = {
  Atualizado: "border-[#D8EEE4] bg-[#EFFAF6] text-[#17825B]",
  "Dados pendentes": "border-[#F4E1B8] bg-[#FFF6E8] text-[#B27300]",
  "Sem dados": "border-[#E7EEF5] bg-[#F8FBFD] text-[#667085]",
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
}: WatchlistListTabProps) {
  const router = useRouter();

  return (
    <div className="space-y-6">
      <div className="rounded-[24px] border border-[#E7EEF5] bg-[linear-gradient(180deg,#FFFFFF_0%,#FBFDFE_100%)] p-5 shadow-[0_18px_40px_rgba(15,23,40,0.04)]">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
          <div className="relative flex-[1.8]">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#98A2B3]" />
            <input
              type="text"
              placeholder="Buscar empresa ou ticker..."
              value={listSearch}
              onChange={(event) => setListSearch(event.target.value)}
              className="h-12 w-full rounded-[18px] border border-[#E7EEF5] bg-[#F8FBFD] pl-10 pr-3 text-[14px] text-[#0F1728] outline-none focus:ring-2 focus:ring-[#DDF6F0]"
            />
          </div>

          <div className="relative flex-1">
            <select
              value={sortBy}
              onChange={(event) => setSortBy(event.target.value as WatchlistSortBy)}
              className="h-12 w-full rounded-[18px] border border-[#E7EEF5] bg-[#F8FBFD] px-4 text-[13px] font-medium text-[#667085] outline-none focus:ring-2 focus:ring-[#DDF6F0]"
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
            <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#98A2B3]" />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {(["Compacto", "Detalhado"] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setListDensity(mode)}
                className={`rounded-full border px-4 py-2 text-[12px] font-semibold transition ${
                  listDensity === mode
                    ? "border-[#D9E8FF] bg-[#EEF6FF] text-[#3965B8]"
                    : "border-[#E7EEF5] bg-white text-[#667085] hover:bg-[#F8FBFD]"
                }`}
              >
                {mode}
              </button>
            ))}

            <button
              onClick={() => setShowListFilters(!showListFilters)}
              className={`rounded-full border px-4 py-2 text-[12px] font-semibold transition ${
                showListFilters
                  ? "border-[#D9E8FF] bg-[#EEF6FF] text-[#3965B8]"
                  : "border-[#E7EEF5] bg-white text-[#667085] hover:bg-[#F8FBFD]"
              }`}
            >
              Filtros ({activeListFiltersCount})
            </button>

            <button
              onClick={() => setUnseenOnly(!unseenOnly)}
              className={`rounded-full border px-4 py-2 text-[12px] font-semibold transition ${
                unseenOnly
                  ? "border-[#D9E8FF] bg-[#EEF6FF] text-[#3965B8]"
                  : "border-[#E7EEF5] bg-white text-[#667085] hover:bg-[#F8FBFD]"
              }`}
            >
              Não vistos
            </button>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-3 border-t border-[#EEF3F7] pt-4 text-[12px] text-[#98A2B3]">
          <span>{filteredCompanies.length} itens</span>
          <span>Ordenar: {sortBy}</span>
          <span>{unseenOnly ? "Não vistos" : "Todos"}</span>
        </div>

        {showListFilters && (
          <div className="mt-4 grid grid-cols-1 gap-3 rounded-[20px] border border-[#E7EEF5] bg-[#F8FBFD] p-4 md:grid-cols-2 xl:grid-cols-3">
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
                  className="h-12 w-full rounded-[18px] border border-[#E7EEF5] bg-white px-4 text-[13px] font-medium text-[#667085] outline-none focus:ring-2 focus:ring-[#DDF6F0]"
                >
                  {filter.options.map((option) => (
                    <option key={option} value={option}>
                      {filter.label}: {option}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#98A2B3]" />
              </div>
            ))}

            <div className="relative">
              <select
                value={listSeverityFilter}
                onChange={(event) => setListSeverityFilter(event.target.value as "Todos" | WatchlistStatus)}
                className="h-12 w-full rounded-[18px] border border-[#E7EEF5] bg-white px-4 text-[13px] font-medium text-[#667085] outline-none focus:ring-2 focus:ring-[#DDF6F0]"
              >
                {["Todos", "Risco", "Atenção", "Saudável"].map((option) => (
                  <option key={option} value={option}>
                    Severidade: {option}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#98A2B3]" />
            </div>

            <div className="relative">
              <select
                value={listSourceFilter}
                onChange={(event) => setListSourceFilter(event.target.value as "Todas" | FeedSource)}
                className="h-12 w-full rounded-[18px] border border-[#E7EEF5] bg-white px-4 text-[13px] font-medium text-[#667085] outline-none focus:ring-2 focus:ring-[#DDF6F0]"
              >
                {["Todas", "CVM", "B3", "RI"].map((option) => (
                  <option key={option} value={option}>
                    Fonte: {option}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#98A2B3]" />
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
              className={`group relative cursor-pointer overflow-hidden border shadow-[0_16px_38px_rgba(15,23,40,0.045)] transition ${cardMass} ${tone.shell} ${tone.hover}`}
            >
              <div className="pointer-events-none absolute inset-x-0 top-0 h-14 bg-[linear-gradient(180deg,rgba(255,255,255,0.54)_0%,rgba(255,255,255,0)_100%)]" />
              <div className={`pointer-events-none absolute left-4 top-3 h-14 w-24 rounded-full opacity-70 blur-xl ${tone.glow}`} />
              <div className={`pointer-events-none absolute inset-x-0 top-0 h-2.5 ${tone.band}`} />

              <div className="relative flex items-start gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[16px] border border-white/80 bg-white/84 text-[12px] font-semibold text-[#667085] shadow-[0_8px_18px_rgba(15,23,40,0.04)]">
                  {company.ticker.slice(0, 2)}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="truncate text-[20px] font-semibold leading-[26px] tracking-[-0.02em] text-[#0F1728]">
                          {company.name}
                        </p>
                        <span className="text-[14px] font-medium text-[#98A2B3]">{company.ticker}</span>
                      </div>

                      <div className="mt-2 flex flex-wrap items-center gap-2">
                        <span className={`rounded-full border px-3 py-1 text-[11px] font-medium ${getBadgeStyle(status)}`}>
                          {status}
                        </span>
                        {!seenTickers.includes(company.ticker) && (
                          <span className="rounded-full border border-[#E3EBF5] bg-white/70 px-2.5 py-1 text-[10px] font-medium text-[#7C8A9B]">
                            Não visto
                          </span>
                        )}
                      </div>

                      <p className="mt-2 text-[13px] text-[#98A2B3]">{company.sector}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="relative mt-5 rounded-[22px] border border-white/75 bg-white/72 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.62)]">
                <p className={`${index === 0 ? "text-[17px]" : "text-[16px]"} font-medium leading-7 text-[#0F1728]`}>
                  {minScore >= 70 ? "Sem pilar crítico no momento" : `${keyPillar} em atenção`}{" "}
                  <span className="text-[#98A2B3]">({minScore}/100)</span>
                </p>
                {!isCompactCard && (
                  <p className="mt-3 max-w-[65ch] text-[15px] leading-7 text-[#516071]">{whyItMatters}</p>
                )}
              </div>

              <div className="relative mt-4 flex flex-col gap-3 border-t border-white/70 pt-4 xl:flex-row xl:items-end xl:justify-between">
                <div className="min-w-0">
                  <p className="text-[12px] text-[#98A2B3]">
                    Fonte: {sourceByTicker[company.ticker] ?? "CVM"} • Última mudança: {company.lastChangeDays}d
                    <span className={`ml-2 inline-flex rounded-full border px-2 py-0.5 text-[10px] font-medium align-middle ${freshnessBadgeStyles[freshnessBadge]}`}>
                      {freshnessBadge}
                    </span>
                  </p>
                </div>

                <div className="relative flex flex-wrap items-center gap-1.5 rounded-[18px] border border-white/75 bg-white/82 p-1.5 shadow-[0_10px_24px_rgba(15,23,40,0.035)]">
                  <button
                    onClick={(event) => {
                      event.stopPropagation();
                      router.push(buildCompanyDeepLink(company.ticker, company.attentionPillar));
                    }}
                    className="inline-flex h-9 items-center rounded-full bg-[#12A594] px-3.5 text-[12px] font-semibold whitespace-nowrap text-white shadow-[0_12px_24px_rgba(18,165,148,0.18)] hover:bg-[#0F9485]"
                  >
                    Ver detalhes
                  </button>

                  {!isCompactCard && (
                    <Link
                      href={buildCompanyDeepLink(company.ticker, company.attentionPillar, getDefaultEvidenceId(company.attentionPillar))}
                      onClick={(event) => event.stopPropagation()}
                      className="inline-flex h-9 items-center rounded-full border border-[#E7EEF5] bg-white/86 px-3.5 text-[12px] font-semibold whitespace-nowrap text-[#0F1728] hover:bg-white"
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
                        ? "border-[#D8EEE4] bg-white/82 text-[#17825B]"
                        : "border-[#E7EEF5] bg-white/82 text-[#667085] hover:text-[#0F1728]"
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
                    className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[#E7EEF5] bg-white/82 text-[#667085] hover:bg-white hover:text-[#0F1728]"
                  >
                    <MoreHorizontal className="h-3.5 w-3.5" />
                  </button>

                  {quickActionsTicker === company.ticker && (
                    <div
                      onClick={(event) => event.stopPropagation()}
                      className="absolute right-0 top-12 z-10 w-48 rounded-[18px] border border-[#E7EEF5] bg-white p-2 shadow-[0_18px_40px_rgba(15,23,40,0.08)]"
                    >
                      <button
                        title="Favoritar"
                        onClick={() => setQuickActionsTicker(null)}
                        className="w-full rounded-[12px] px-3 py-2 text-left text-[12px] text-[#516071] hover:bg-[#F8FBFD]"
                      >
                        Favoritar
                      </button>
                      <button
                        title="Criar alerta"
                        onClick={() => setQuickActionsTicker(null)}
                        className="w-full rounded-[12px] px-3 py-2 text-left text-[12px] text-[#516071] hover:bg-[#F8FBFD]"
                      >
                        Criar alerta
                      </button>
                      <button
                        title={isExpanded ? "Recolher detalhes" : "Expandir detalhes"}
                        onClick={() => {
                          setQuickActionsTicker(null);
                          setExpandedTicker(expandedTicker === company.ticker ? null : company.ticker);
                        }}
                        className="w-full rounded-[12px] px-3 py-2 text-left text-[12px] text-[#516071] hover:bg-[#F8FBFD]"
                      >
                        {isExpanded ? "Recolher detalhes" : "Expandir detalhes"}
                      </button>
                      <button
                        title="Marcar visto"
                        onClick={() => {
                          setQuickActionsTicker(null);
                          toggleSeenTicker(company.ticker);
                        }}
                        className="w-full rounded-[12px] px-3 py-2 text-left text-[12px] text-[#516071] hover:bg-[#F8FBFD]"
                      >
                        {seenTickers.includes(company.ticker) ? "Marcar como não visto" : "Marcar visto"}
                      </button>
                      <button
                        title="Remover da watchlist"
                        onClick={() => setQuickActionsTicker(null)}
                        className="w-full rounded-[12px] px-3 py-2 text-left text-[12px] text-[#B54768] hover:bg-[#FDEFF2]"
                      >
                        Remover da watchlist
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {showDetails && (
                <div className="mt-4 space-y-4 rounded-[22px] border border-white/80 bg-white/65 p-4">
                  <div className="flex items-center justify-between text-[12px] text-[#98A2B3]">
                    <span>Diagnóstico por pilar</span>
                    <span className="font-medium text-[#0F1728]">Score geral: {scoreTotal}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    {company.scores.map((score, scoreIndex) => (
                      <div key={`${company.ticker}-${pillars[scoreIndex]}`} className="flex-1">
                        <div
                          className={`h-2 rounded-full ${
                            score >= 70 ? "bg-emerald-400" : score >= 50 ? "bg-amber-400" : "bg-rose-400"
                          }`}
                        />
                        <div className="mt-1 flex items-center justify-between text-[10px] text-[#98A2B3]">
                          <span>{pillars[scoreIndex]}</span>
                          <span>{score}</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="grid grid-cols-1 gap-2 text-[12px] text-[#667085] sm:grid-cols-2">
                    <div className="flex items-center justify-between rounded-[16px] border border-[#E7EEF5] bg-white px-3 py-2">
                      <span>Última mudança</span>
                      <span className="font-medium text-[#0F1728]">{company.lastChangeDays} dias</span>
                    </div>
                    {company.volatility && (
                      <div className="flex items-center justify-between rounded-[16px] border border-[#E7EEF5] bg-white px-3 py-2 sm:col-span-2">
                        <span>Volatilidade</span>
                        <span className="font-medium text-[#0F1728]">{company.volatility}</span>
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

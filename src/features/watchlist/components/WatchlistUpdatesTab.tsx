"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { GlossaryText } from "@/src/features/glossary/components/glossary-text";
import type { FeedItem, PriorityItem, Pillar, AlertItem, FeedSeverity, FeedSource } from "../interfaces";

const badgeStyles: Record<PriorityItem["badge"], string> = {
  Risco: "bg-rose-100 text-rose-900 border-rose-300",
  "Atenção": "bg-amber-100 text-amber-900 border-amber-300",
  "Saudável": "bg-emerald-100 text-emerald-900 border-emerald-300",
};

const clickableItemStyles: Record<PriorityItem["badge"], string> = {
  Risco: "border-l-rose-400 hover:border-border-strong hover:bg-hover hover:shadow-[inset_3px_0_0_var(--brand)]",
  Atenção: "border-l-amber-400 hover:border-border-strong hover:bg-hover hover:shadow-[inset_3px_0_0_var(--brand)]",
  Saudável: "border-l-emerald-400 hover:border-border-strong hover:bg-hover hover:shadow-[inset_3px_0_0_var(--brand)]",
};

const pillarTagStyles: Record<Pillar, string> = {
  "Dívida": "bg-rose-50 text-rose-700 border-rose-100",
  Caixa: "bg-amber-50 text-amber-700 border-amber-100",
  Margens: "bg-emerald-50 text-emerald-700 border-emerald-100",
  Retorno: "bg-sky-50 text-sky-700 border-sky-100",
  Proventos: "bg-teal-50 text-teal-700 border-teal-100",
};

const rangeOptions: Array<"7d" | "30d" | "90d" | "Todos"> = ["7d", "30d", "90d", "Todos"];
const priorityRankingLabels = ["Maior piora relativa do dia", "Maior pressão estrutural", "Maior sinal de atenção"] as const;

const pillars: Pillar[] = ["Dívida", "Caixa", "Margens", "Retorno", "Proventos"];

interface WatchlistUpdatesTabProps {
  watchlistExecutiveSummary: string;
  summaryRiskCount: number;
  summaryAttentionCount: number;
  summaryHealthyCount: number;
  summaryChanges30dCount: number;
  priorityItems: PriorityItem[];
  filteredFeedItems: FeedItem[];
  activeRange: "7d" | "30d" | "90d" | "Todos";
  severityFilter: "Todos" | FeedSeverity;
  sourceFilter: "Todas" | FeedSource;
  showAdvancedFeedFilters: boolean;
  activePillars: Pillar[];
  buildCompanyDeepLink: (ticker: string, pillar: Pillar, evidenceId?: string) => string;
  getFeedCTA: (item: FeedItem | PriorityItem) => string;
  setActiveRange: (range: "7d" | "30d" | "90d" | "Todos") => void;
  setSeverityFilter: (v: "Todos" | FeedSeverity) => void;
  setSourceFilter: (v: "Todas" | FeedSource) => void;
  setShowAdvancedFeedFilters: (v: boolean) => void;
  togglePillar: (pillar: Pillar) => void;
}

export function WatchlistUpdatesTab({
  watchlistExecutiveSummary,
  summaryRiskCount,
  summaryAttentionCount,
  summaryHealthyCount,
  summaryChanges30dCount,
  priorityItems,
  filteredFeedItems,
  activeRange,
  severityFilter,
  sourceFilter,
  showAdvancedFeedFilters,
  activePillars,
  buildCompanyDeepLink,
  getFeedCTA,
  setActiveRange,
  setSeverityFilter,
  setSourceFilter,
  setShowAdvancedFeedFilters,
  togglePillar,
}: WatchlistUpdatesTabProps) {
  const router = useRouter();

  return (
    <div className="space-y-5">
      <section className="rounded-2xl border border-brand-border bg-brand-surface p-3.5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wide text-brand-text">Estado da watchlist hoje</p>
            <p className="mt-1 text-sm font-semibold text-foreground">{watchlistExecutiveSummary}</p>
            <p className="mt-1 text-xs text-dim">
              {summaryRiskCount} em risco, {summaryAttentionCount - summaryRiskCount} em atenção e {summaryHealthyCount} saudáveis.
            </p>
          </div>
          <span className="rounded-full border border-brand-border bg-card px-2 py-1 text-[11px] font-medium text-brand-text">
            {summaryChanges30dCount} mudanças em 30d
          </span>
        </div>
      </section>

      <section className="bg-card rounded-2xl border border-border shadow-sm p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-semibold text-foreground">Prioridade</h2>
            <p className="text-xs text-muted-foreground">
              Ordenado pelo que mais merece sua atenção agora: severidade, recência e impacto potencial.
            </p>
          </div>
          <span className="text-xs text-muted-foreground">{Math.min(priorityItems.length, 3)} itens</span>
        </div>

        <div className="space-y-2">
          {priorityItems.slice(0, 3).map((item, index) => (
            <div
              key={item.id}
              role="button"
              tabIndex={0}
              onClick={() => router.push(buildCompanyDeepLink(item.ticker, item.pillar))}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  router.push(buildCompanyDeepLink(item.ticker, item.pillar));
                }
              }}
              className={`rounded-xl border border-l-4 p-3 flex flex-col gap-2 cursor-pointer transition-colors ${clickableItemStyles[item.badge]} ${
                index === 0
                  ? "border-brand-border bg-brand-surface shadow-[0_6px_16px_rgba(16,185,129,0.08)]"
                  : "border-border bg-muted"
              }`}
            >
              {index === 0 && (
                <div className="mb-1 flex items-center justify-between rounded-lg border border-brand-border bg-brand-surface px-2 py-1 text-[11px] text-brand-text">
                  <span className="font-semibold">Comece por aqui</span>
                  <span className="rounded-full border border-brand-border bg-card px-2 py-0.5 font-semibold text-foreground">Prioridade 1</span>
                </div>
              )}
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    {item.company} <span className="text-muted-foreground">({item.ticker})</span>
                  </p>
                  <p className="text-xs text-muted-foreground">{item.sector}</p>
                  <p className="mt-1 text-[11px] font-medium text-dim">{priorityRankingLabels[index]}</p>
                </div>
                <span className={`px-2 py-1 rounded-full border text-[11px] font-medium ${badgeStyles[item.badge]}`}>
                  {item.badge}
                </span>
              </div>
              <div className="grid gap-1">
                <div>
                  <p className="text-[11px] text-muted-foreground">O que mudou</p>
                  <p className="text-sm text-foreground">{item.change}</p>
                </div>
                <p className="text-xs text-dim">
                  <span className="font-medium">Por que importa:</span> {item.why}
                </p>
              </div>
              <div className="flex items-center justify-between gap-3 text-[11px] text-muted-foreground">
                <span>{item.evidence}</span>
                <Link
                  href={buildCompanyDeepLink(item.ticker, item.pillar, item.evidenceId)}
                  onClick={(event) => event.stopPropagation()}
                  className="inline-flex items-center rounded-md border border-brand-border bg-brand-surface px-2 py-1 text-xs font-medium text-brand-text hover:text-foreground"
                >
                  {getFeedCTA(item)}
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-card rounded-2xl border border-border shadow-sm p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-semibold text-foreground">Atualizações</h2>
            <p className="text-xs text-muted-foreground">Feed contínuo com foco no que pede ação agora.</p>
          </div>
          <span className="text-xs text-muted-foreground">{filteredFeedItems.length} atualizações</span>
        </div>

        <div className="sticky top-12 z-0 bg-card">
          <div className="flex flex-wrap items-center gap-2 pb-3">
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-medium text-muted-foreground">Período:</span>
              {rangeOptions.map((range) => (
                <button
                  key={range}
                  onClick={() => setActiveRange(range)}
                  className={`px-3 py-2 rounded-xl text-xs font-medium border ${
                    activeRange === range
                      ? "border-brand-border bg-brand-surface text-brand-text"
                      : "border-border text-muted-foreground"
                  }`}
                >
                  {range === "Todos" ? "Todos" : range}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-medium text-muted-foreground">Severidade:</span>
              {(["Risco", "Atenção", "Saudável"] as const).map((option) => (
                <button
                  key={option}
                  onClick={() => setSeverityFilter(option)}
                  className={`px-3 py-2 rounded-xl text-xs font-medium border ${
                    severityFilter === option
                      ? "border-brand-border bg-brand-surface text-brand-text"
                      : "border-border text-muted-foreground"
                  }`}
                >
                  {option}
                </button>
              ))}
              <button
                onClick={() => setSeverityFilter("Todos")}
                className={`px-3 py-2 rounded-xl text-xs font-medium border ${
                  severityFilter === "Todos"
                    ? "border-brand-border bg-brand-surface text-brand-text"
                    : "border-border text-muted-foreground"
                }`}
              >
                Todas
              </button>
            </div>
            <button
              onClick={() => setShowAdvancedFeedFilters(!showAdvancedFeedFilters)}
              className={`px-3 py-2 rounded-xl text-xs font-medium border ${
                showAdvancedFeedFilters
                  ? "border-brand-border bg-brand-surface text-brand-text"
                  : "border-border text-muted-foreground"
              }`}
            >
              Filtros avançados: {showAdvancedFeedFilters ? "ON" : "OFF"}
            </button>
          </div>

          <div className="border-y border-border py-2 text-xs text-muted-foreground">
            {filteredFeedItems.length} atualizações · Fonte: {sourceFilter.toLowerCase()}
          </div>

          {showAdvancedFeedFilters && (
            <div className="mt-2 rounded-xl border border-border bg-muted p-2.5">
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-medium text-muted-foreground">Fonte:</span>
                  {(["Todas", "CVM", "B3", "RI"] as const).map((option) => (
                    <button
                      key={option}
                      onClick={() => setSourceFilter(option)}
                      className={`px-3 py-2 rounded-xl text-xs font-medium border ${
                        sourceFilter === option
                          ? "border-brand-border bg-brand-surface text-brand-text"
                          : "border-border text-muted-foreground"
                      }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>

                <div className="flex flex-wrap gap-2">
                  <span className="self-center text-[11px] font-medium text-muted-foreground">Pilar:</span>
                  {pillars.map((pillar) => (
                    <button
                      key={pillar}
                      onClick={() => togglePillar(pillar)}
                      className={`px-3 py-2 rounded-xl text-xs font-medium border ${
                        activePillars.includes(pillar)
                          ? "border-brand-border bg-brand-surface text-brand-text"
                          : "border-border text-muted-foreground hover:bg-hover"
                      }`}
                    >
                      {pillar}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="mt-4 space-y-3">
          {filteredFeedItems.map((item) => (
            <div
              key={item.id}
              role="button"
              tabIndex={0}
              onClick={() => router.push(buildCompanyDeepLink(item.ticker, item.pillar))}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  router.push(buildCompanyDeepLink(item.ticker, item.pillar));
                }
              }}
              className={`rounded-xl border border-border border-l-4 bg-muted cursor-pointer transition-colors ${clickableItemStyles[item.severity]} ${
                item.severity === "Risco"
                  ? "p-3 space-y-2"
                  : item.severity === "Atenção"
                    ? "p-2.5 space-y-1.5"
                    : "p-2 space-y-1"
              }`}
            >
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-foreground">{item.headline}</h3>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-1 rounded-full border text-[11px] font-medium ${badgeStyles[item.severity]}`}>
                    {item.severity}
                  </span>
                  <span className={`px-2 py-1 rounded-full border text-[11px] font-medium ${pillarTagStyles[item.pillar]}`}>
                    {item.pillar}
                  </span>
                </div>
              </div>
              <div className="text-sm text-foreground">
                <GlossaryText text={item.detail} />
                {item.severity !== "Saudável" && (
                  <p className="mt-1 text-dim">
                    <GlossaryText text={item.detailTwo} />
                  </p>
                )}
              </div>
              <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                <span>{item.evidence}</span>
                <Link
                  href={buildCompanyDeepLink(item.ticker, item.pillar, item.evidenceId)}
                  onClick={(event) => event.stopPropagation()}
                  className="inline-flex items-center rounded-md border border-brand-border bg-brand-surface px-2 py-1 text-xs font-medium text-brand-text hover:text-foreground"
                >
                  Ver análise
                </Link>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 rounded-xl border border-border bg-muted p-3">
          <p className="text-xs font-medium text-foreground">Fechamento da sessão</p>
          <p className="mt-1 text-xs text-dim">
            Nas próximas horas, acompanhe CSAN3 e MRVE3 para confirmar se a pressão em dívida e margens persiste.
          </p>
        </div>
      </section>
    </div>
  );
}

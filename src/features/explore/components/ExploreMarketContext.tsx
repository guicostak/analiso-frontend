"use client";

import { Globe, Info } from "lucide-react";
import { MiniSparkline } from "@/src/components/shared/MiniSparkline";
import type { IndexCard, Volatility } from "../interfaces";
import type { MarketTimeRange } from "../interfaces/market.interfaces";
import type { ExploreMarketContextDto } from "../services";
import { SparklineRangeBadge } from "./market/SparklineRangeBadge";
import { SectionCategoryTag } from "./market/SectionCategoryTag";
import { resolveSparklineLabels } from "../utils/sparklineLabels";
import { unitFor, sparklineValueFormatter } from "../utils/tickerUnits";
import { InfoTooltip } from "@/src/components/shared/InfoTooltip";
import { TICKER_INFO } from "../utils/marketInfoCopy";

const getTrendStatus = (trend: IndexCard["trend"]) => {
  if (trend === "up") return "healthy";
  if (trend === "down") return "risk";
  return "attention";
};

const trendTone: Record<IndexCard["trend"], string> = {
  up: "text-success-text",
  down: "text-danger-text",
  neutral: "text-warning-text",
};

const indexCardGlow: Record<IndexCard["trend"], string> = {
  up: "bg-[radial-gradient(circle,rgba(31,169,113,0.10)_0%,rgba(31,169,113,0)_72%)]",
  down: "bg-[radial-gradient(circle,rgba(230,114,140,0.10)_0%,rgba(230,114,140,0)_72%)]",
  neutral: "bg-[radial-gradient(circle,rgba(243,183,70,0.10)_0%,rgba(243,183,70,0)_72%)]",
};

interface ExploreMarketContextProps {
  isLoading: boolean;
  showVolatilityInfo: boolean;
  indexCards: IndexCard[];
  volatility: Volatility;
  volatilityIsStale: boolean;
  marketContextDto?: ExploreMarketContextDto | null;
  setShowVolatilityInfo: (fn: ((prev: boolean) => boolean) | boolean) => void;
  setShowVolatilityDetails: (v: boolean) => void;
  /** Oculta o cabeçalho interno (usado quando a página já tem seu próprio header). */
  hideHeader?: boolean;
  /** Oculta o bloco de resumo (hero "Contexto macro" + cards de índices). */
  hideContextSummary?: boolean;
  /** Range ativo do toggle — exibido como badge nas sparklines dos B3 cards. */
  timeRange?: MarketTimeRange;
}

export function ExploreMarketContext({
  isLoading,
  showVolatilityInfo,
  indexCards,
  volatility,
  volatilityIsStale,
  marketContextDto,
  setShowVolatilityInfo,
  setShowVolatilityDetails,
  hideHeader = false,
  timeRange,
}: ExploreMarketContextProps) {
  const summary = marketContextDto?.summary;
  const detail = marketContextDto?.detail;
  return (
    <section className="space-y-6">
      {!hideHeader && (
        <div className="space-y-2">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Leitura de ambiente</p>
          <h2 className="text-2xl font-semibold leading-tight tracking-[-0.025em] text-foreground">
            Contexto de mercado hoje
          </h2>
        </div>
      )}

      <>
          <div className="space-y-5">
            {/* Hero principal: headline + interpretação + o que observar */}
            <article className="mercado-elev-lg relative overflow-hidden rounded-3xl border border-border bg-card p-6 md:p-7">
              <div className="relative flex h-full flex-col justify-between gap-6">
                <div className="flex items-center gap-2">
                  <SectionCategoryTag icon={Globe} label="Contexto" categoryId="contexto-mercado" />
                  <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Panorama do dia
                  </span>
                </div>
                <div className="max-w-[820px] space-y-3">
                  <h3 className="text-2xl font-semibold leading-[1.2] tracking-[-0.025em] text-foreground md:text-[28px] md:leading-9">
                    {summary?.body || "Mercado em tom misto, com small caps reagindo melhor e volatilidade em nivel moderado."}
                  </h3>
                </div>

                <div className="relative grid gap-4 lg:grid-cols-[minmax(0,1.18fr)_240px]">
                  <div className="mercado-elev-md relative rounded-2xl border border-border bg-card p-4">
                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      Interpretação principal
                    </p>
                    <p className="mt-2.5 max-w-[95%] text-sm leading-6 text-foreground">
                      {detail?.interpretation || "O dia favorece leitura seletiva: fluxo e reacao ainda importam, mas o contexto pede confirmacao por tese antes de concluir tendencia."}
                    </p>
                  </div>
                  <div className="mercado-elev-sm relative rounded-2xl border border-border bg-card p-4">
                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      O que observar
                    </p>
                    <p className="mt-2.5 text-sm leading-6 text-muted-foreground">
                      {detail?.subtitle || "Small caps com reacao melhor e volatilidade moderada sugerem priorizar contexto antes de escala."}
                    </p>
                  </div>
                </div>
              </div>
            </article>

            {/* Mini-cards dos índices BR */}
            <aside className="mercado-elev-md rounded-3xl border border-border bg-card p-5">
              <div className="mb-4 flex flex-col gap-1 lg:flex-row lg:items-end lg:justify-between lg:gap-6">
                <div className="space-y-1.5">
                  <p className="inline-flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    <SectionCategoryTag icon={Globe} label="Contexto" categoryId="contexto-mercado" />
                    Resumo dos índices
                  </p>
                  <p className="mt-1 max-w-[640px] text-sm leading-6 text-muted-foreground">
                    Mini cards para sentir direção, ritmo e dispersão sem cara de terminal.
                  </p>
                </div>
              </div>

              {isLoading ? (
                <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-5">
                  {[1, 2, 3, 4, 5].map((item) => (
                    <div key={item} className="min-h-[108px] animate-pulse rounded-2xl bg-muted" />
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-5">
                  {indexCards.map((card) => {
                    const unit = unitFor(card.symbol);
                    return (
                    <div
                      key={card.symbol}
                      className="mercado-elev-sm mercado-island-hover relative overflow-hidden rounded-2xl border border-border bg-card p-3.5"
                    >
                      <div className={`pointer-events-none absolute -right-5 -top-6 h-16 w-16 rounded-full ${indexCardGlow[card.trend]}`} />
                      {/* data-attr mantido, visual silenciado: o header da ilha já identifica a seção */}
                      <SectionCategoryTag icon={Globe} label="Contexto" categoryId="contexto-mercado" silent />
                      <div className="flex items-start justify-between gap-3">
                        <div className="relative">
                          <p className="inline-flex items-center gap-1.5 text-xs font-semibold tracking-[-0.01em] text-foreground">
                            {card.name}
                            {TICKER_INFO[card.symbol] && (
                              <InfoTooltip label={card.name} content={TICKER_INFO[card.symbol]} />
                            )}
                          </p>
                          <p className="mt-1 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">{card.symbol}</p>
                        </div>
                        <div className="flex shrink-0 flex-col items-end gap-1">
                          <SparklineRangeBadge range={timeRange} />
                          <MiniSparkline
                            data={card.sparkline}
                            labels={resolveSparklineLabels({
                              dates: card.sparklineDates,
                              range: timeRange,
                              count: card.sparkline.length,
                            })}
                            valueFormatter={sparklineValueFormatter(card.symbol)}
                            status={getTrendStatus(card.trend)}
                            width={72}
                            height={28}
                            strokeWidth={1.25}
                            lineOpacity={0.9}
                          />
                        </div>
                      </div>
                      <p className="relative mt-3 text-xl font-semibold tracking-[-0.025em] text-foreground tabular-nums">
                        {unit?.prefix && (
                          <span className="mr-1 text-sm font-medium text-muted-foreground">{unit.prefix}</span>
                        )}
                        {card.value}
                        {unit?.suffix && (
                          <span className="ml-1 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">{unit.suffix}</span>
                        )}
                      </p>
                      <p className={`relative mt-1 text-xs font-medium ${trendTone[card.trend]}`}>
                        {card.changeAbs} ({card.changePct})
                      </p>
                    </div>
                    );
                  })}
                </div>
              )}
            </aside>
          </div>

          {/* Volatilidade do dia — leitura macro (Fear & Greed dentro do Risk Panel é indicador externo, aqui é a leitura da Analiso) */}
          <div className="mercado-elev-md rounded-3xl border border-border bg-card p-5 md:p-6">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
              <div className="max-w-[760px] space-y-3">
                <p className="inline-flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  <SectionCategoryTag icon={Globe} label="Contexto" categoryId="contexto-mercado" />
                  Leitura de volatilidade
                </p>
                <div className="flex items-center gap-3">
                  <span className="inline-flex rounded-full border border-warning-border bg-warning-surface px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-warning-text">
                    Volatilidade {volatility.label.toLowerCase()}
                  </span>
                  <button
                    onClick={() => setShowVolatilityInfo((prev) => !prev)}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-warning-border bg-card/80 text-muted-foreground transition-colors duration-200 hover:text-foreground"
                    aria-label="Informações sobre volatilidade"
                    aria-expanded={showVolatilityInfo}
                  >
                    <Info className="h-4 w-4" />
                  </button>
                </div>
                <p className="mt-2 text-[32px] font-semibold leading-[1.05] tracking-[-0.025em] text-foreground tabular-nums md:text-[36px]">
                  {volatility.value}
                </p>
                <p className="text-sm leading-6 text-muted-foreground">
                  {detail?.description || "Oscilacoes tendem a aumentar no curto prazo, entao vale combinar leitura de preco com confirmacao dos pilares antes de avancar."}
                </p>
                {showVolatilityInfo && (
                  <div className="mt-2 rounded-2xl border border-border bg-muted/40 p-4 text-sm leading-6 text-muted-foreground">
                    Volatilidade mede quanto os preços oscilam. Níveis maiores pedem mais cuidado para diferenciar ruído de mudança estrutural.
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-3 lg:min-w-[240px] lg:items-end">
                <button
                  onClick={() => setShowVolatilityDetails(true)}
                  className="mercado-elev-sm inline-flex h-10 items-center rounded-xl border border-border bg-card px-4 text-sm font-semibold text-foreground transition-colors duration-200 hover:bg-accent"
                >
                  Ver detalhes
                </button>
                <p className="text-xs leading-5 text-muted-foreground lg:text-right">
                  {detail?.metaLine || `Fonte: ${volatility.source} · Atualizado em ${volatility.updatedAt}`}
                </p>
                {volatilityIsStale ? (
                  <span className="inline-flex rounded-full border border-warning-border bg-warning-surface px-3 py-1 text-[11px] font-medium uppercase tracking-wide text-warning-text">
                    Desatualizado
                  </span>
                ) : null}
              </div>
            </div>
          </div>
        </>
    </section>
  );
}

"use client";

import { Info } from "lucide-react";
import { MiniSparkline } from "@/src/components/shared/MiniSparkline";
import type { IndexCard, Volatility } from "../interfaces";
import type { ExploreMarketContextDto } from "../services";

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
}: ExploreMarketContextProps) {
  const summary = marketContextDto?.summary;
  const detail = marketContextDto?.detail;
  return (
    <section className="space-y-4">
      {!hideHeader && (
        <div>
          <p className="text-[12px] font-medium uppercase text-muted-foreground">Leitura de ambiente</p>
          <h2 className="mt-2 text-[24px] font-semibold leading-7 tracking-[-0.03em] text-foreground">Contexto de mercado hoje</h2>
        </div>
      )}

      <>
          <div className="space-y-5">
            <article className="relative overflow-hidden rounded-[26px] border border-border bg-card p-6 shadow-[0_24px_50px_rgba(15,23,40,0.07)] dark:shadow-none">
              <div className="relative flex h-full flex-col justify-between gap-6">
                <div className="max-w-[820px]">
                  <span className="inline-flex rounded-full bg-card/80 px-3 py-1 text-[11px] font-medium uppercase text-blue-700 dark:text-blue-300">
                    Contexto macro
                  </span>
                  <h3 className="mt-4 text-[24px] font-semibold leading-[1.15] tracking-[-0.03em] text-foreground">
                    {summary?.title || "Mercado em tom misto, com small caps reagindo melhor e volatilidade em nivel moderado."}
                  </h3>
                  <p className="mt-3 text-[14px] leading-6 text-muted-foreground">
                    {summary?.body || "Use este ambiente como apoio visual para decidir onde aprofundar a leitura, sem deixar o pano de fundo competir com a curadoria principal."}
                  </p>
                </div>

                <div className="relative grid gap-4 lg:grid-cols-[minmax(0,1.18fr)_216px]">
                  <div className="relative rounded-[22px] border border-border bg-card p-4 shadow-[0_14px_32px_rgba(15,23,40,0.05)] dark:shadow-none">
                    <p className="text-[12px] font-medium uppercase text-muted-foreground">Interpretacao principal</p>
                    <p className="mt-2.5 max-w-[95%] text-[14px] leading-6 text-foreground">
                      {detail?.description || "O dia favorece leitura seletiva: fluxo e reacao ainda importam, mas o contexto pede confirmacao por tese antes de concluir tendencia."}
                    </p>
                  </div>
                  <div className="relative rounded-[22px] border border-border bg-card p-4 shadow-[0_10px_24px_rgba(15,23,40,0.04)] dark:shadow-none">
                    <p className="text-[12px] font-medium uppercase text-muted-foreground">O que observar</p>
                    <p className="mt-2.5 text-[13px] leading-5 text-muted-foreground">
                      {detail?.subtitle || "Small caps com reacao melhor e volatilidade moderada sugerem priorizar contexto antes de escala."}
                    </p>
                  </div>
                </div>
              </div>
            </article>

            <aside className="rounded-[26px] border border-border bg-card p-5 shadow-[0_18px_40px_rgba(15,23,40,0.05)] dark:shadow-none">
              <div className="mb-4 flex flex-col gap-1 lg:flex-row lg:items-end lg:justify-between lg:gap-6">
                <div>
                  <p className="text-[12px] font-medium uppercase text-muted-foreground">Resumo dos indices</p>
                  <p className="mt-2 text-[14px] leading-6 text-muted-foreground">Mini cards para sentir direcao, ritmo e dispersao sem cara de terminal.</p>
                </div>
              </div>

              {isLoading ? (
                <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-5">
                  {[1, 2, 3, 4, 5].map((item) => (
                    <div key={item} className="min-h-[108px] rounded-[20px] bg-muted" />
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-5">
                  {indexCards.map((card) => (
                    <div
                      key={card.symbol}
                      className={`relative overflow-hidden rounded-[18px] border border-border bg-card p-3.5 shadow-[0_10px_24px_rgba(15,23,40,0.03)] dark:shadow-none`}
                    >
                      <div className={`pointer-events-none absolute -right-5 -top-6 h-16 w-16 rounded-full ${indexCardGlow[card.trend]}`} />
                      <div className="flex items-start justify-between gap-3">
                        <div className="relative">
                          <p className="text-[12px] font-semibold tracking-[-0.01em] text-muted-foreground">{card.name}</p>
                          <p className="mt-1 text-[12px] font-medium uppercase tracking-[0.04em] text-muted-foreground">{card.symbol}</p>
                        </div>
                        <div className="relative rounded-full border border-border bg-card px-2.5 py-1.5 shadow-[0_8px_18px_rgba(15,23,40,0.04)] dark:shadow-none">
                          <MiniSparkline
                            data={card.sparkline}
                            status={getTrendStatus(card.trend)}
                            width={72}
                            height={28}
                            strokeWidth={1.25}
                            lineOpacity={0.9}
                          />
                        </div>
                      </div>
                      <p className="relative mt-3 text-[19px] font-semibold tracking-[-0.03em] text-foreground">{card.value}</p>
                      <p className={`relative mt-1 text-[12px] font-medium ${trendTone[card.trend]}`}>
                        {card.changeAbs} ({card.changePct})
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </aside>
          </div>

          <div className="rounded-[26px] border border-border bg-card p-5 shadow-[0_18px_40px_rgba(15,23,40,0.04)] dark:shadow-none">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
              <div className="max-w-[760px]">
                <div className="flex items-center gap-3">
                  <span className="inline-flex rounded-full border border-warning-border bg-warning-surface px-3 py-1 text-[11px] font-semibold text-warning-text">
                    Volatilidade {volatility.label.toLowerCase()}
                  </span>
                  <button
                    onClick={() => setShowVolatilityInfo((prev) => !prev)}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-warning-border bg-card/80 text-muted-foreground transition hover:text-foreground"
                    aria-label="Informacoes sobre volatilidade"
                  >
                    <Info className="h-4 w-4" />
                  </button>
                </div>
                <p className="mt-4 text-[28px] font-semibold leading-8 tracking-[-0.03em] text-foreground">{volatility.value}</p>
                <p className="mt-3 text-[14px] leading-6 text-muted-foreground">
                  {detail?.description || "Oscilacoes tendem a aumentar no curto prazo, entao vale combinar leitura de preco com confirmacao dos pilares antes de avancar."}
                </p>
                {showVolatilityInfo && (
                  <div className="mt-4 rounded-[20px] bg-card/80 p-4 text-[14px] leading-6 text-muted-foreground">
                    Volatilidade mede quanto os precos oscilam. Niveis maiores pedem mais cuidado para diferenciar ruido de mudanca estrutural.
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-3 lg:min-w-[240px] lg:items-end">
                <button
                  onClick={() => setShowVolatilityDetails(true)}
                  className="inline-flex h-10 items-center rounded-[14px] bg-card px-4 text-[13px] font-semibold text-foreground shadow-[0_12px_30px_rgba(15,23,40,0.06)] dark:shadow-none transition hover:bg-card"
                >
                  Ver detalhes
                </button>
                <p className="text-[12px] text-muted-foreground">
                  {detail?.metaLine || `Fonte: ${volatility.source} . Atualizado em ${volatility.updatedAt}`}
                </p>
                {volatilityIsStale ? (
                  <span className="inline-flex rounded-full border border-warning-border bg-warning-surface px-3 py-1 text-[11px] font-medium text-warning-text">
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

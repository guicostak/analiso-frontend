"use client";

import { ChevronDown, Info } from "lucide-react";
import { MiniSparkline } from "@/src/components/shared/MiniSparkline";
import type { IndexCard, Volatility } from "../interfaces";

const getTrendStatus = (trend: IndexCard["trend"]) => {
  if (trend === "up") return "healthy";
  if (trend === "down") return "risk";
  return "attention";
};

const trendTone: Record<IndexCard["trend"], string> = {
  up: "text-[#17825B]",
  down: "text-[#B54768]",
  neutral: "text-[#B27300]",
};

const indexCardSurface: Record<IndexCard["trend"], string> = {
  up: "bg-[linear-gradient(180deg,#F8FCFA_0%,#FFFFFF_100%)]",
  down: "bg-[linear-gradient(180deg,#FFF8FA_0%,#FFFFFF_100%)]",
  neutral: "bg-[linear-gradient(180deg,#FFFDF7_0%,#FFFFFF_100%)]",
};

const indexCardGlow: Record<IndexCard["trend"], string> = {
  up: "bg-[radial-gradient(circle,rgba(31,169,113,0.10)_0%,rgba(31,169,113,0)_72%)]",
  down: "bg-[radial-gradient(circle,rgba(230,114,140,0.10)_0%,rgba(230,114,140,0)_72%)]",
  neutral: "bg-[radial-gradient(circle,rgba(243,183,70,0.10)_0%,rgba(243,183,70,0)_72%)]",
};

interface ExploreMarketContextProps {
  isLoading: boolean;
  showContextPanel: boolean;
  showVolatilityInfo: boolean;
  indexCards: IndexCard[];
  volatility: Volatility;
  volatilityIsStale: boolean;
  setShowContextPanel: (fn: ((prev: boolean) => boolean) | boolean) => void;
  setShowVolatilityInfo: (fn: ((prev: boolean) => boolean) | boolean) => void;
  setShowVolatilityDetails: (v: boolean) => void;
}

export function ExploreMarketContext({
  isLoading,
  showContextPanel,
  showVolatilityInfo,
  indexCards,
  volatility,
  volatilityIsStale,
  setShowContextPanel,
  setShowVolatilityInfo,
  setShowVolatilityDetails,
}: ExploreMarketContextProps) {
  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[12px] font-medium uppercase tracking-[0.08em] text-[#98A2B3]">Leitura de ambiente</p>
          <h2 className="mt-2 text-[24px] font-semibold leading-7 tracking-[-0.03em] text-[#0F1728]">Contexto de mercado hoje</h2>
        </div>
        <button
          onClick={() => setShowContextPanel((prev) => !prev)}
          className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-[11px] font-medium text-[#667085] shadow-[0_10px_28px_rgba(15,23,40,0.05)]"
        >
          {showContextPanel ? "Recolher contexto" : "Expandir contexto"}
          <ChevronDown className={`h-4 w-4 transition-transform ${showContextPanel ? "rotate-180" : ""}`} />
        </button>
      </div>

      {showContextPanel ? (
        <>
          <div className="grid gap-5 xl:grid-cols-12">
            <article className="relative overflow-hidden rounded-[26px] border border-[#DDE9F5] bg-[linear-gradient(135deg,#EEF6FF_0%,#F2F8FF_28%,#F7FBFF_62%,#FFFFFF_100%)] p-6 shadow-[0_24px_50px_rgba(15,23,40,0.07)] xl:col-span-8 xl:min-h-[228px]">
              <div className="pointer-events-none absolute inset-0">
                <div className="absolute -left-10 -top-12 h-64 w-64 rounded-full bg-[radial-gradient(circle,rgba(91,141,239,0.20)_0%,rgba(91,141,239,0.06)_36%,rgba(91,141,239,0)_72%)] blur-2xl" />
                <div className="absolute left-[10%] top-5 h-24 w-40 rounded-[48%_52%_40%_60%/58%_38%_62%_42%] bg-[linear-gradient(135deg,rgba(255,255,255,0.42),rgba(255,255,255,0.12))]" />
                <div className="absolute right-14 top-10 h-24 w-24 rounded-full border border-white/65 bg-[linear-gradient(180deg,rgba(255,255,255,0.34),rgba(255,255,255,0.16))]" />
                <div className="absolute inset-x-0 bottom-0 h-[112px] bg-[linear-gradient(180deg,rgba(238,246,255,0),rgba(238,246,255,0.34))]" />
              </div>

              <div className="relative flex h-full flex-col justify-between gap-6">
                <div className="max-w-[72%]">
                  <span className="inline-flex rounded-full bg-white/80 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.08em] text-[#3965B8]">
                    Contexto macro
                  </span>
                  <h3 className="mt-4 text-[24px] font-semibold leading-[1.15] tracking-[-0.03em] text-[#0F1728]">
                    Mercado em tom misto, com small caps reagindo melhor e volatilidade em nivel moderado.
                  </h3>
                  <p className="mt-3 text-[14px] leading-6 text-[#475467]">
                    Use este ambiente como apoio visual para decidir onde aprofundar a leitura, sem deixar o pano de fundo competir com a curadoria principal.
                  </p>
                </div>

                <div className="relative grid gap-4 lg:grid-cols-[minmax(0,1.18fr)_216px]">
                  <div className="pointer-events-none absolute inset-0 rounded-[28px] bg-[linear-gradient(90deg,rgba(255,255,255,0.16),rgba(255,255,255,0))]" />
                  <div className="relative rounded-[22px] border border-white/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.88),rgba(255,255,255,0.66))] p-4 shadow-[0_14px_32px_rgba(15,23,40,0.05)]">
                    <div className="pointer-events-none absolute inset-x-0 top-0 h-12 rounded-t-[24px] bg-[linear-gradient(180deg,rgba(255,255,255,0.44),rgba(255,255,255,0))]" />
                    <p className="text-[12px] font-medium uppercase tracking-[0.08em] text-[#98A2B3]">Interpretacao principal</p>
                    <p className="mt-2.5 max-w-[95%] text-[14px] leading-6 text-[#0F1728]">
                      O dia favorece leitura seletiva: fluxo e reacao ainda importam, mas o contexto pede confirmacao por tese antes de concluir tendencia.
                    </p>
                  </div>
                  <div className="relative rounded-[22px] border border-white/72 bg-[linear-gradient(180deg,rgba(255,255,255,0.76),rgba(255,255,255,0.56))] p-4 shadow-[0_10px_24px_rgba(15,23,40,0.04)]">
                    <div className="pointer-events-none absolute inset-x-0 top-0 h-10 rounded-t-[24px] bg-[linear-gradient(180deg,rgba(255,255,255,0.34),rgba(255,255,255,0))]" />
                    <p className="text-[12px] font-medium uppercase tracking-[0.08em] text-[#98A2B3]">O que observar</p>
                    <p className="mt-2.5 text-[13px] leading-5 text-[#475467]">
                      Small caps com reacao melhor e volatilidade moderada sugerem priorizar contexto antes de escala.
                    </p>
                  </div>
                </div>
              </div>
            </article>

            <aside className="rounded-[26px] border border-[#E7EEF5] bg-white p-5 shadow-[0_18px_40px_rgba(15,23,40,0.05)] xl:col-span-4">
              <div className="mb-4">
                <p className="text-[12px] font-medium uppercase tracking-[0.08em] text-[#98A2B3]">Resumo dos indices</p>
                <p className="mt-2 text-[14px] leading-6 text-[#667085]">Mini cards para sentir direcao, ritmo e dispersao sem cara de terminal.</p>
              </div>

              {isLoading ? (
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {[1, 2, 3, 4].map((item) => (
                    <div key={item} className="min-h-[108px] rounded-[20px] bg-[#F4F8FB]" />
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {indexCards.map((card) => (
                    <div
                      key={card.symbol}
                      className={`relative overflow-hidden rounded-[18px] border border-[#EEF3F7] p-3.5 shadow-[0_10px_24px_rgba(15,23,40,0.03)] ${indexCardSurface[card.trend]}`}
                    >
                      <div className={`pointer-events-none absolute inset-x-0 top-0 h-10 bg-[linear-gradient(180deg,rgba(255,255,255,0.34),rgba(255,255,255,0))]`} />
                      <div className={`pointer-events-none absolute -right-5 -top-6 h-16 w-16 rounded-full ${indexCardGlow[card.trend]}`} />
                      <div className="flex items-start justify-between gap-3">
                        <div className="relative">
                          <p className="text-[12px] font-semibold tracking-[-0.01em] text-[#475467]">{card.name}</p>
                          <p className="mt-1 text-[12px] font-medium uppercase tracking-[0.04em] text-[#98A2B3]">{card.symbol}</p>
                        </div>
                        <div className="relative rounded-full border border-white/75 bg-[linear-gradient(180deg,rgba(255,255,255,0.9),rgba(255,255,255,0.72))] px-2.5 py-1.5 shadow-[0_8px_18px_rgba(15,23,40,0.04)]">
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
                      <p className="relative mt-3 text-[19px] font-semibold tracking-[-0.03em] text-[#0F1728]">{card.value}</p>
                      <p className={`relative mt-1 text-[12px] font-medium ${trendTone[card.trend]}`}>
                        {card.changeAbs} ({card.changePct})
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </aside>
          </div>

          <div className="rounded-[26px] border border-[#E7EEF5] bg-[linear-gradient(135deg,#FFF5E8_0%,#FFFFFF_78%)] p-5 shadow-[0_18px_40px_rgba(15,23,40,0.04)]">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
              <div className="max-w-[760px]">
                <div className="flex items-center gap-3">
                  <span className="inline-flex rounded-full border border-[#F1D8AC] bg-[#FFF0D7] px-3 py-1 text-[11px] font-semibold text-[#B27300]">
                    Volatilidade {volatility.label.toLowerCase()}
                  </span>
                  <button
                    onClick={() => setShowVolatilityInfo((prev) => !prev)}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[#F1E6D3] bg-white/80 text-[#667085] transition hover:text-[#0F1728]"
                    aria-label="Informacoes sobre volatilidade"
                  >
                    <Info className="h-4 w-4" />
                  </button>
                </div>
                <p className="mt-4 text-[28px] font-semibold leading-8 tracking-[-0.03em] text-[#0F1728]">{volatility.value}</p>
                <p className="mt-3 text-[14px] leading-6 text-[#475467]">
                  Oscilacoes tendem a aumentar no curto prazo, entao vale combinar leitura de preco com confirmacao dos pilares antes de avancar.
                </p>
                {showVolatilityInfo && (
                  <div className="mt-4 rounded-[20px] bg-white/80 p-4 text-[14px] leading-6 text-[#667085]">
                    Volatilidade mede quanto os precos oscilam. Niveis maiores pedem mais cuidado para diferenciar ruido de mudanca estrutural.
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-3 lg:min-w-[240px] lg:items-end">
                <button
                  onClick={() => setShowVolatilityDetails(true)}
                  className="inline-flex h-10 items-center rounded-[14px] bg-white px-4 text-[13px] font-semibold text-[#0F1728] shadow-[0_12px_30px_rgba(15,23,40,0.06)] transition hover:bg-[#FCFDFE]"
                >
                  Ver detalhes
                </button>
                <p className="text-[12px] text-[#98A2B3]">
                  Fonte: {volatility.source} . Atualizado em {volatility.updatedAt}
                </p>
                {volatilityIsStale ? (
                  <span className="inline-flex rounded-full border border-[#F0D7A8] bg-[#FFF7E8] px-3 py-1 text-[11px] font-medium text-[#B27300]">
                    Desatualizado
                  </span>
                ) : null}
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className="rounded-[24px] border border-[#E7EEF5] bg-white px-5 py-4 text-[14px] leading-6 text-[#667085] shadow-[0_14px_34px_rgba(15,23,40,0.04)]">
          Resumo rapido: mercado em tom misto, small caps reagindo melhor e volatilidade moderada.
        </div>
      )}
    </section>
  );
}

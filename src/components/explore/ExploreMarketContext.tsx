"use client";

import { ChevronDown, Info } from "lucide-react";
import { MiniSparkline } from "../mini-sparkline";
import type { IndexCard, Volatility } from "../../types/explore";

const getTrendStatus = (trend: IndexCard["trend"]) => {
  if (trend === "up")   return "healthy";
  if (trend === "down") return "risk";
  return "attention";
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
  );
}

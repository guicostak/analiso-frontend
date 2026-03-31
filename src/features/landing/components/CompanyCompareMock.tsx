"use client";

import { ArrowDown, ArrowUp, Minus } from "lucide-react";
import logoVale from "@/src/assets/logos/vale.png";
import logoWeg from "@/src/assets/logos/weg.jpeg";

type CompareTrend = "melhorando" | "estavel" | "piorando";

const pair = {
  a: { ticker: "WEGE3", name: "WEG", logo: logoWeg.src, updatedAt: "23/03/2026" },
  b: { ticker: "VALE3", name: "Vale", logo: logoVale.src, updatedAt: "23/03/2026" },
};

const pillarDiffs = [
  { pillar: "Margens", a: 8.4, b: 6.9, winner: "WEGE3" },
  { pillar: "Retorno", a: 8.1, b: 6.8, winner: "WEGE3" },
  { pillar: "Dívida", a: 7.0, b: 5.9, winner: "WEGE3" },
  { pillar: "Caixa", a: 7.4, b: 7.9, winner: "VALE3" },
];

const metricRows = [
  {
    name: "Margem EBIT",
    definition: "Ajuda a comparar eficiência operacional e capacidade de sustentar resultado com qualidade.",
    aValue: "16,4%",
    bValue: "11,2%",
    aTrend: "piorando" as CompareTrend,
    bTrend: "melhorando" as CompareTrend,
    winner: "a",
    insight: "WEGE3 segue superior, mas a vantagem recente ficou um pouco menor.",
  },
  {
    name: "ROIC",
    definition: "Mostra qual empresa converte melhor capital investido em retorno operacional.",
    aValue: "22,3%",
    bValue: "15,6%",
    aTrend: "estavel" as CompareTrend,
    bTrend: "melhorando" as CompareTrend,
    winner: "a",
    insight: "WEGE3 mantém retorno estruturalmente mais forte.",
  },
  {
    name: "Dívida líquida / EBITDA",
    definition: "Ajuda a comparar conforto financeiro e risco de alavancagem.",
    aValue: "0,8x",
    bValue: "1,3x",
    aTrend: "estavel" as CompareTrend,
    bTrend: "piorando" as CompareTrend,
    winner: "a",
    insight: "WEGE3 segue com estrutura de capital mais confortável.",
  },
];

function trendIcon(trend: CompareTrend) {
  if (trend === "melhorando") return <ArrowUp className="h-3 w-3" />;
  if (trend === "piorando") return <ArrowDown className="h-3 w-3" />;
  return <Minus className="h-3 w-3" />;
}

function trendLabel(trend: CompareTrend) {
  if (trend === "melhorando") return "Melhorando";
  if (trend === "piorando") return "Piorando";
  return "Estável";
}

export function CompanyCompareMock() {
  return (
    <div className="flex h-full flex-col overflow-hidden rounded-[20px] border border-border bg-[#F7FAFC] shadow-[0px_1px_2px_0px_rgba(228,229,231,0.24)]">
      <div className="border-b border-border bg-card px-6 py-4">
        <p className="text-[10px] font-semibold uppercase text-brand">Comparação</p>
        <div className="mt-2 flex items-end justify-between gap-4">
          <div>
            <h3 className="text-[20px] font-semibold text-foreground">Compare empresas com veredito antes do detalhe</h3>
            <p className="mt-1 text-[13px] text-muted-foreground">
              Veja quem está melhor hoje, onde está a maior diferença e qual ponto merece leitura mais cuidadosa.
            </p>
          </div>
          <button
            type="button"
            className="rounded-[18px] bg-[#12A594] px-4 py-2 text-[13px] font-semibold text-white shadow-[0_12px_24px_rgba(18,165,148,0.18)]"
          >
            Abrir comparação
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <div className="space-y-5">
          <section className="rounded-[24px] border border-border bg-card p-5 shadow-[0_14px_30px_rgba(15,23,40,0.04)]">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-3 rounded-[18px] border border-[#DDF6F0] bg-[#F6FEFB] px-4 py-3">
                  <img src={pair.a.logo} alt={pair.a.ticker} className="h-10 w-10 rounded-full object-cover" />
                  <div>
                    <p className="text-[12px] font-medium text-muted-foreground">{pair.a.ticker}</p>
                    <p className="text-[14px] font-semibold text-foreground">{pair.a.name}</p>
                  </div>
                </div>
                <div className="text-[13px] font-medium text-muted-foreground">vs</div>
                <div className="flex items-center gap-3 rounded-[18px] border border-[#D9E8FF] bg-[#F8FBFF] px-4 py-3">
                  <img src={pair.b.logo} alt={pair.b.ticker} className="h-10 w-10 rounded-full object-cover" />
                  <div>
                    <p className="text-[12px] font-medium text-muted-foreground">{pair.b.ticker}</p>
                    <p className="text-[14px] font-semibold text-foreground">{pair.b.name}</p>
                  </div>
                </div>
              </div>
              <span className="text-[12px] font-medium text-muted-foreground">Atualizado em {pair.a.updatedAt}</span>
            </div>

            <div className="mt-4 rounded-[20px] border border-border bg-[linear-gradient(135deg,#F3FAF8_0%,#FFFFFF_100%)] p-5">
              <p className="text-[11px] font-semibold uppercase text-brand">Veredito</p>
              <h4 className="mt-1 text-[22px] font-semibold leading-[1.18] text-foreground">
                WEGE3 aparece melhor hoje, com vantagem mais clara em margens, retorno e dívida.
              </h4>
              <p className="mt-2 max-w-[72ch] text-[13px] leading-6 text-[#526070]">
                Vale ainda sustenta caixa competitivo, mas WEG entrega diagnóstico mais equilibrado quando olhamos qualidade do resultado e conforto financeiro.
              </p>
            </div>
          </section>

          <section className="rounded-[24px] border border-border bg-card p-5 shadow-[0_14px_30px_rgba(15,23,40,0.04)]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] font-semibold uppercase text-muted-foreground">Placar dos pilares</p>
                <h4 className="mt-1 text-[16px] font-semibold text-foreground">Onde está a maior diferença</h4>
              </div>
              <span className="rounded-full border border-border bg-card px-3 py-1.5 text-[11px] font-medium text-muted-foreground">
                4 pilares comparados
              </span>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-4">
              {pillarDiffs.map((item) => (
                <article key={item.pillar} className="rounded-[20px] border border-border bg-card p-4">
                  <div className="flex items-center justify-between">
                    <p className="text-[14px] font-semibold text-foreground">{item.pillar}</p>
                    <span className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold ${
                      item.winner === pair.a.ticker
                        ? "border-[#DDF6F0] bg-[#EFFAF6] text-[#0F8C7D]"
                        : "border-[#D9E8FF] bg-[#EEF6FF] text-[#3965B8]"
                    }`}>
                      {item.winner}
                    </span>
                  </div>
                  <div className="mt-3 flex items-center gap-3">
                    <div className="flex-1 rounded-[16px] border border-border bg-card px-3 py-2">
                      <p className="text-[11px] text-muted-foreground">{pair.a.ticker}</p>
                      <p className="mt-1 text-[17px] font-semibold text-[#12A594]">{item.a.toFixed(1)}</p>
                    </div>
                    <div className="flex-1 rounded-[16px] border border-border bg-card px-3 py-2">
                      <p className="text-[11px] text-muted-foreground">{pair.b.ticker}</p>
                      <p className="mt-1 text-[17px] font-semibold text-[#5B8DEF]">{item.b.toFixed(1)}</p>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>

          <section className="rounded-[24px] border border-border bg-card p-5 shadow-[0_14px_30px_rgba(15,23,40,0.04)]">
            <div>
              <p className="text-[11px] font-semibold uppercase text-muted-foreground">Métricas comparadas</p>
              <h4 className="mt-1 text-[16px] font-semibold text-foreground">Leitura guiada das diferenças</h4>
            </div>

            <div className="mt-4 space-y-4">
              {metricRows.map((row) => (
                <article key={row.name} className="rounded-[20px] border border-border bg-card p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-[15px] font-semibold text-foreground">{row.name}</p>
                      <p className="mt-1 max-w-[70ch] text-[13px] leading-6 text-muted-foreground">{row.definition}</p>
                    </div>
                    <button
                      type="button"
                      className="rounded-full border border-border bg-card px-3 py-1.5 text-[11px] font-medium text-muted-foreground"
                    >
                      Fonte
                    </button>
                  </div>

                  <div className="mt-4 grid grid-cols-[1fr_1fr_auto] gap-3">
                    <div className={`rounded-[18px] border p-4 ${
                      row.winner === "a" ? "border-[#DDF6F0] bg-[#F6FEFB]" : "border-border bg-card"
                    }`}>
                      <p className="text-[11px] font-semibold uppercase text-muted-foreground">{pair.a.ticker}</p>
                      <p className="mt-2 text-[20px] font-semibold text-foreground">{row.aValue}</p>
                      <p className="mt-2 inline-flex items-center gap-1 text-[11px] font-medium text-muted-foreground">
                        {trendIcon(row.aTrend)}
                        {trendLabel(row.aTrend)}
                      </p>
                    </div>
                    <div className={`rounded-[18px] border p-4 ${
                      row.winner === "b" ? "border-[#D9E8FF] bg-[#F8FBFF]" : "border-border bg-card"
                    }`}>
                      <p className="text-[11px] font-semibold uppercase text-muted-foreground">{pair.b.ticker}</p>
                      <p className="mt-2 text-[20px] font-semibold text-foreground">{row.bValue}</p>
                      <p className="mt-2 inline-flex items-center gap-1 text-[11px] font-medium text-muted-foreground">
                        {trendIcon(row.bTrend)}
                        {trendLabel(row.bTrend)}
                      </p>
                    </div>
                    <div className="flex items-center">
                      <div className="rounded-[16px] border border-border bg-card px-3 py-2 text-[11px] font-medium text-muted-foreground">
                        {row.insight}
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>

          <section className="rounded-[24px] border border-[#DDF6F0] bg-[linear-gradient(135deg,#F3FAF8_0%,#FFFFFF_100%)] p-5 shadow-[0_14px_30px_rgba(15,23,40,0.04)]">
            <p className="text-[11px] font-semibold uppercase text-brand">Fechar a leitura</p>
            <h4 className="mt-1 text-[16px] font-semibold text-foreground">Transforme a comparação em próximo passo útil</h4>
            <div className="mt-4 flex flex-wrap gap-3">
              <button
                type="button"
                className="rounded-[16px] bg-[#12A594] px-4 py-2 text-[13px] font-semibold text-white shadow-[0_12px_24px_rgba(18,165,148,0.18)]"
              >
                Abrir veredito completo
              </button>
              <button
                type="button"
                className="rounded-[16px] border border-[#D7F3ED] bg-card px-4 py-2 text-[13px] font-medium text-foreground"
              >
                Criar alerta da principal diferença
              </button>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import { Check, CircleHelp, MoreHorizontal } from "lucide-react";
import logoWeg from "@/src/assets/logos/weg.jpeg";

const company = {
  ticker: "WEGE3",
  name: "WEG",
  sector: "Bens Industriais",
  updatedAt: "23 mar 2026",
};

const valuationScenarios = [
  {
    scenario: "Conservador",
    estimatedValue: "R$ 42,80",
    differenceVsCurrent: "-11,2%",
    reading: "Exige desaceleração de crescimento e pressão mais persistente em margens.",
  },
  {
    scenario: "Base",
    estimatedValue: "R$ 48,60",
    differenceVsCurrent: "+1,0%",
    reading: "Preço atual próximo do valor estimado no cenário central.",
  },
  {
    scenario: "Otimista",
    estimatedValue: "R$ 56,40",
    differenceVsCurrent: "+17,2%",
    reading: "Depende de retomada de margem com crescimento ainda forte.",
  },
];

const sensitivityDrivers = [
  {
    driver: "Margem operacional",
    value: "Cada +1 p.p. na margem aumenta materialmente o valor estimado.",
    impact: "Driver mais sensível da leitura atual.",
  },
  {
    driver: "WACC",
    value: "Redução no custo de capital amplia o valor presente dos fluxos.",
    impact: "Alta sensibilidade em cenários de juros menores.",
  },
  {
    driver: "Crescimento terminal",
    value: "Maior crescimento de longo prazo sustenta preço justo mais alto.",
    impact: "Mais relevante quando a tese depende de expansão durável.",
  },
  {
    driver: "Capex / reinvestimento",
    value: "Mais reinvestimento reduz caixa no curto prazo, mas pode sustentar crescimento.",
    impact: "Impacto moderado no cenário-base.",
  },
];

const multiples = [
  {
    metric: "P/L",
    current: "27,4x",
    sector: "22,1x",
    historical: "25,3x",
    insight: "Mercado ainda paga prêmio por qualidade e consistência.",
  },
  {
    metric: "EV/EBIT",
    current: "18,8x",
    sector: "15,2x",
    historical: "17,5x",
    insight: "Acima do histórico, com margem menor para erro operacional.",
  },
  {
    metric: "EV/Receita",
    current: "3,1x",
    sector: "2,6x",
    historical: "2,8x",
    insight: "Prêmio permanece, mas já mais exigente do que a média recente.",
  },
];

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export function CompanyAnalysisPriceMock() {
  const [showMethodology, setShowMethodology] = useState(false);

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-[20px] border border-border bg-muted shadow-[0px_1px_2px_0px_rgba(228,229,231,0.24)]">
      <div className="border-b border-border bg-card px-6 py-4">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full border border-[#D8EEE9] bg-brand-surface px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.08em] text-brand">
                Análise da empresa
              </span>
              <span className="rounded-full border border-border bg-muted px-2.5 py-1 text-[10px] font-medium text-muted-foreground">
                Atualizado em {company.updatedAt}
              </span>
            </div>
            <div className="mt-3 flex items-center gap-3">
              <div className="flex h-14 w-14 items-center justify-center overflow-hidden">
                <img src={logoWeg.src} alt="WEG" className="h-full w-full object-contain" />
              </div>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-[18px] font-semibold text-foreground">{company.name}</h3>
                  <span className="text-[12px] font-medium text-muted-foreground">{company.ticker}</span>
                </div>
                <p className="text-[12px] text-muted-foreground">{company.sector}</p>
              </div>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              className="inline-flex items-center gap-1.5 rounded-xl border border-brand bg-brand px-3.5 py-2 text-[12px] font-semibold text-white transition-all hover:opacity-90"
            >
              <Check className="h-3.5 w-3.5" />
              Na Watchlist
            </button>
            <button
              type="button"
              className="rounded-xl border border-border bg-card px-3.5 py-2 text-[12px] font-medium text-dim transition-all hover:bg-muted"
            >
              Criar alerta
            </button>
            <button
              type="button"
              className="rounded-xl border border-border bg-card px-3.5 py-2 text-[12px] text-muted-foreground transition-all hover:bg-muted"
            >
              Comparar
            </button>
            <button
              type="button"
              className="grid h-9 w-9 place-items-center rounded-full border border-border bg-card text-muted-foreground transition-all hover:bg-muted"
            >
              <MoreHorizontal className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-0 overflow-x-auto border-b border-border bg-card px-6">
        {["Resumo", "Pilares", "O que mudou (4)", "Agenda (2)", "Preço", "Fontes"].map((tab, index) => (
          <button
            key={tab}
            type="button"
            className={cx(
              "flex-shrink-0 border-b-2 px-4 py-3.5 text-[13px] font-medium transition-all duration-150",
              index === 4
                ? "border-brand text-foreground"
                : "border-transparent text-[#8494A9] hover:border-[#D0DDE8] hover:text-dim",
            )}
          >
            {tab}
          </button>
        ))}
      </div>

      <section className="flex-1 overflow-y-auto px-6 py-5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <div className="space-y-4">
          <article className="rounded-2xl border border-border bg-card p-6 shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">Preço vs valor estimado</p>
                <h2 className="mt-1 text-[18px] font-bold text-foreground">Leitura por DCF</h2>
                <p className="mt-1 text-[13px] text-muted-foreground">Não é recomendação de compra ou venda.</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="rounded-full border border-warning-border bg-warning-surface px-3 py-1 text-[13px] font-semibold text-warning-text">
                  Próximo do valor justo
                </span>
                <button
                  type="button"
                  onClick={() => setShowMethodology((value) => !value)}
                  className="inline-flex cursor-pointer items-center gap-1 rounded-xl border border-border px-2.5 py-1.5 text-[12px] text-muted-foreground hover:bg-muted"
                >
                  <CircleHelp className="h-3.5 w-3.5" />
                  Aprender
                </button>
              </div>
            </div>
            <p className="mt-3 text-[11px] text-[#B0BAC8]">Fonte: DCF próprio + CVM + RI · Atualizado em: {company.updatedAt}</p>

            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-border bg-muted p-4">
                <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">Preço atual</p>
                <p className="mt-1 text-[22px] font-bold text-foreground">R$ 48,10</p>
              </div>
              <div className="rounded-2xl border border-border bg-muted p-4">
                <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">Preço justo estimado</p>
                <p className="mt-1 text-[22px] font-bold text-foreground">R$ 48,60</p>
              </div>
              <div className="rounded-2xl border border-border bg-muted p-4">
                <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">Diferença vs atual</p>
                <p className="mt-1 text-[22px] font-bold text-foreground">+1,0%</p>
              </div>
            </div>

            <div className="mt-4 rounded-xl border border-[#99F6E4] bg-brand-surface p-4">
              <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[#0F766E]">Por que isso importa</p>
              <p className="mt-1 text-[14px] text-dim">
                O mercado ainda precifica a empresa em linha com um cenário de boa execução. Isso reduz a margem para erro e torna mais importante acompanhar margens e reinvestimento.
              </p>
            </div>
          </article>

          <section className="rounded-2xl border border-border bg-card p-5 shadow-sm">
            <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">Régua de valuation</p>
            <div className="mt-3 rounded-xl border border-border bg-[#F8FAFD] p-4">
              <div className="mb-2 flex items-center justify-between text-[12px] font-medium text-muted-foreground">
                <span>R$ 34</span>
                <span>Posição do preço atual vs. preço justo estimado</span>
                <span>R$ 60</span>
              </div>
              <div className="relative pt-9">
                <div className="pointer-events-none absolute left-0 right-0 top-0">
                  <div className="absolute left-[56%] -translate-x-1/2 whitespace-nowrap rounded-xl border border-[#CFE9E1] bg-card px-2 py-1 text-[13px] font-semibold text-[#0F766E] shadow-sm">
                    Preço justo estimado R$ 48,60
                  </div>
                </div>
                <div className="pointer-events-none absolute bottom-0 top-0 z-[1]" style={{ left: "54%" }}>
                  <div className="-ml-[1.5px] h-full w-[3px] rounded-full bg-[#0B1220]/95 shadow-[0_0_0_2px_#ffffff]" />
                  <div className="absolute -top-5 -translate-x-1/2 whitespace-nowrap rounded-xl border border-[#CBD5E1] bg-card px-2 py-1 text-[13px] font-semibold text-foreground shadow-sm">
                    <span>Preço atual</span>
                    <span className="ml-1 text-dim">R$ 48,10</span>
                  </div>
                </div>
                <div className="h-9 overflow-hidden rounded-full border border-[#DCE4EE] bg-[#F8FAFD]">
                  <div className="flex h-full w-full">
                    <div className="h-full bg-[#E9F8F4]" style={{ width: "45%" }} />
                    <div className="h-full border-x border-[#F2D28A] bg-[#FFF4DB]" style={{ width: "16%" }} />
                    <div className="h-full bg-[#FDEBE7]" style={{ width: "39%" }} />
                  </div>
                </div>
              </div>
              <div className="mt-3 grid gap-2 text-[12px] text-[#5B6472] sm:grid-cols-3">
                <p><span className="inline-block h-2 w-2 rounded-full bg-[#A6E7D6]" /> <span className="ml-1 font-medium text-dim">Abaixo do preço justo</span></p>
                <p><span className="inline-block h-2 w-2 rounded-full bg-[#F2C86B]" /> <span className="ml-1 font-medium text-dim">Próximo do preço justo</span></p>
                <p><span className="inline-block h-2 w-2 rounded-full bg-[#F1B4A8]" /> <span className="ml-1 font-medium text-dim">Acima do preço justo</span></p>
              </div>
              <div className="mt-2">
                <p className="text-[13px] font-medium text-dim">
                  A régua mostra que o preço atual está praticamente em linha com o cenário-base estimado.
                </p>
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-border bg-card p-5 shadow-sm">
            <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">Cenários do valuation</p>
            <div className="mt-3 grid grid-cols-4 border-b border-border pb-2.5 text-[10px] font-semibold uppercase tracking-[0.06em] text-muted-foreground">
              <span>Cenário</span>
              <span>Valor estimado</span>
              <span>Diferença vs atual</span>
              <span>Leitura</span>
            </div>
            {valuationScenarios.map((scenario) => (
              <div key={scenario.scenario} className="grid grid-cols-4 border-b border-border py-3.5 text-[13px] text-dim">
                <span className="font-medium">{scenario.scenario}</span>
                <span>{scenario.estimatedValue}</span>
                <span>{scenario.differenceVsCurrent}</span>
                <span className="text-muted-foreground">{scenario.reading}</span>
              </div>
            ))}
          </section>

          <section className="rounded-2xl border border-border bg-card p-5 shadow-sm">
            <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">Sensibilidade do valuation</p>
            <p className="mt-1 text-[13px] text-muted-foreground">Drivers principais: crescimento terminal, WACC, margem operacional e capex/reinvestimento.</p>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              {sensitivityDrivers.map((driver) => (
                <div key={driver.driver} className="rounded-xl border border-border bg-muted p-3">
                  <p className="text-[13px] font-semibold text-foreground">{driver.driver}</p>
                  <p className="mt-1 text-[13px] text-dim">{driver.value}</p>
                  <p className="mt-1 text-[12px] text-muted-foreground">{driver.impact}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
            <div className="border-b border-border bg-muted px-5 py-3">
              <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">Múltiplos de apoio</p>
            </div>
            <div className="grid grid-cols-5 border-b border-border px-5 py-2.5 text-[10px] font-semibold uppercase tracking-[0.06em] text-muted-foreground">
              <span>Métrica</span>
              <span>Atual</span>
              <span>Setor</span>
              <span>Histórico 5a</span>
              <span>Leitura</span>
            </div>
            {multiples.map((row) => (
              <div key={row.metric} className="grid grid-cols-5 border-b border-border px-5 py-3 text-[13px] text-dim hover:bg-muted">
                <span className="font-medium">{row.metric}</span>
                <span>{row.current}</span>
                <span>{row.sector}</span>
                <span>{row.historical}</span>
                <span className="text-muted-foreground">{row.insight}</span>
              </div>
            ))}
            <div className="border-t border-border px-5 py-3">
              <p className="text-[12px] italic text-muted-foreground">
                Múltiplos ajudam a contextualizar a leitura de valuation, sem substituir o cenário-base de DCF.
              </p>
            </div>
          </section>

          {showMethodology && (
            <section className="rounded-2xl border border-border bg-card p-5 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Metodologia</p>
                  <h3 className="mt-1 text-[16px] font-semibold text-foreground">Como calculamos o valuation</h3>
                </div>
                <button
                  type="button"
                  className="rounded-md border border-border px-2.5 py-1 text-[12px] text-dim hover:bg-[#F8FAFC]"
                  onClick={() => setShowMethodology(false)}
                >
                  Fechar
                </button>
              </div>
              <div className="mt-4 space-y-4 text-[13px] text-dim">
                <p>Projetamos a geração de caixa futura da empresa e trazemos esses fluxos para o valor presente usando uma taxa de desconto.</p>
                <section className="rounded-lg border border-border bg-muted p-3">
                  <p className="font-semibold text-foreground">Em termos simples</p>
                  <p className="mt-1">A empresa vale o quanto consegue gerar de caixa no futuro, ajustado pelo risco e pelo custo de capital.</p>
                </section>
                <section className="rounded-lg border border-border bg-muted p-3">
                  <p className="font-semibold text-foreground">O que mais influencia o resultado</p>
                  <p className="mt-1">Margem operacional, crescimento, WACC, reinvestimento e crescimento terminal.</p>
                </section>
              </div>
            </section>
          )}
        </div>
      </section>
    </div>
  );
}

"use client";

import { useState } from "react";
import {
  BarChart3,
  Check,
  ChevronDown,
  ChevronUp,
  MoreHorizontal,
  Share2,
  TriangleAlert,
} from "lucide-react";
import logoWeg from "@/src/assets/logos/weg.jpeg";

type PillarTone = "healthy" | "attention" | "risk";

type PillarCard = {
  name: string;
  score: number;
  statusLabel: string;
  deltaLabel: string;
  accent: string;
  badgeClass: string;
  summary: string;
  meaning: string;
  monitorItems: string[];
  evidenceLabel: string;
  evidenceMetric: string;
  evidenceValue: string;
  evidenceDate: string;
  reference: string;
  source: string;
  signalTone: PillarTone;
  signalLabel: string;
  signalTitle: string;
  signalBody: string;
  cta: string;
  chart: { year: string; value: string; active?: boolean }[];
};

const company = {
  ticker: "WEGE3",
  name: "WEG",
  sector: "Bens Industriais",
  updatedAt: "23 mar 2026",
};

const pillarCards: PillarCard[] = [
  {
    name: "Dívida",
    score: 78,
    statusLabel: "Saudável",
    deltaLabel: "+2 vs trimestre anterior",
    accent: "#0E9384",
    badgeClass: "border-[#AEE3D8] bg-[#F1FCF9] text-[#0E9384]",
    summary: "Alavancagem segue sob controle e sem pressionar o diagnóstico geral.",
    meaning: "A estrutura de capital ainda parece confortável para o estágio atual da empresa, sem sinal dominante de pressão financeira.",
    monitorItems: [
      "Custo médio da dívida no próximo trimestre",
      "Evolução do caixa líquido frente ao CAPEX",
    ],
    evidenceLabel: "Evidência principal",
    evidenceMetric: "Dívida líquida / EBITDA",
    evidenceValue: "0,8x",
    evidenceDate: "ITR 4T25",
    reference: "Ref. 5 anos: 1,1x",
    source: "CVM · 23 mar 2026",
    signalTone: "healthy",
    signalLabel: "Ponto forte",
    signalTitle: "Estrutura de capital continua disciplinada",
    signalBody: "Mesmo com expansão recente, a empresa preserva folga financeira e não depende de alavancagem para sustentar execução.",
    cta: "Ver fonte da dívida",
    chart: [
      { year: "2021", value: "1,0x" },
      { year: "2022", value: "0,9x" },
      { year: "2023", value: "0,9x" },
      { year: "2024", value: "0,8x" },
      { year: "2025", value: "0,8x", active: true },
    ],
  },
  {
    name: "Margens",
    score: 64,
    statusLabel: "Atenção",
    deltaLabel: "-6 vs trimestre anterior",
    accent: "#D97706",
    badgeClass: "border-[#F6DEA9] bg-[#FFFBEB] text-[#D97706]",
    summary: "Margens perderam fôlego recente e pedem leitura com mais contexto.",
    meaning: "A operação continua saudável, mas a compressão recente tira parte do conforto e precisa ser confirmada nos próximos resultados.",
    monitorItems: [
      "Repasse de preço por linha de produto",
      "Eficiência operacional no próximo resultado",
    ],
    evidenceLabel: "Evidência principal",
    evidenceMetric: "Margem EBIT",
    evidenceValue: "16,4%",
    evidenceDate: "Release 4T25",
    reference: "Ref. 5 anos: 18,1%",
    source: "RI + CVM · 23 mar 2026",
    signalTone: "attention",
    signalLabel: "Ponto de atenção",
    signalTitle: "Compressão recente exige confirmação",
    signalBody: "O recuo de margem ainda não muda o diagnóstico por completo, mas já merece acompanhamento porque afeta a qualidade do resultado.",
    cta: "Ver impacto em margens",
    chart: [
      { year: "2021", value: "17,1%" },
      { year: "2022", value: "18,0%" },
      { year: "2023", value: "18,4%" },
      { year: "2024", value: "17,5%" },
      { year: "2025", value: "16,4%", active: true },
    ],
  },
  {
    name: "Retorno",
    score: 81,
    statusLabel: "Saudável",
    deltaLabel: "+1 vs trimestre anterior",
    accent: "#0E9384",
    badgeClass: "border-[#AEE3D8] bg-[#F1FCF9] text-[#0E9384]",
    summary: "Retorno sobre capital segue em patamar forte para a leitura atual.",
    meaning: "A empresa continua convertendo capital em resultado de forma eficiente, o que reforça a qualidade da execução e sustenta o diagnóstico.",
    monitorItems: [
      "ROIC ajustado após novos investimentos",
      "Sustentação da rentabilidade em ciclos mais fracos",
    ],
    evidenceLabel: "Evidência principal",
    evidenceMetric: "ROIC",
    evidenceValue: "22,3%",
    evidenceDate: "Release 4T25",
    reference: "Ref. 5 anos: 20,4%",
    source: "RI · 23 mar 2026",
    signalTone: "healthy",
    signalLabel: "Ponto forte",
    signalTitle: "Rentabilidade ainda acima do histórico",
    signalBody: "Mesmo com alguma pressão operacional, o retorno continua acima da média histórica e reforça a consistência da tese.",
    cta: "Ver fonte do retorno",
    chart: [
      { year: "2021", value: "19,0%" },
      { year: "2022", value: "20,2%" },
      { year: "2023", value: "21,4%" },
      { year: "2024", value: "22,0%" },
      { year: "2025", value: "22,3%", active: true },
    ],
  },
];

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function signalClasses(tone: PillarTone) {
  if (tone === "risk") return "border-[#FECACA] bg-[#FEF2F2] text-[#DC2626]";
  if (tone === "attention") return "border-[#FDE68A] bg-[#FFFBEB] text-[#D97706]";
  return "border-[#99F6E4] bg-[#F0FDFA] text-[#0E9384]";
}

export function CompanyAnalysisPillarsMock() {
  const [expanded, setExpanded] = useState<string>("Margens");

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-[20px] border border-[#E2EDF5] bg-[#F8FBFD] shadow-[0px_1px_2px_0px_rgba(228,229,231,0.24)]">
      <div className="border-b border-[#E2EDF5] bg-white px-6 py-4">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full border border-[#D8EEE9] bg-[#F0FDFA] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.08em] text-[#0E9384]">
                Análise da empresa
              </span>
              <span className="rounded-full border border-[#E2EDF5] bg-[#F6FAFC] px-2.5 py-1 text-[10px] font-medium text-[#64748B]">
                Atualizado em {company.updatedAt}
              </span>
            </div>
            <div className="mt-3 flex items-center gap-3">
              <div className="flex h-14 w-14 items-center justify-center overflow-hidden">
                <img src={logoWeg.src} alt="WEG" className="h-full w-full object-contain" />
              </div>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-[18px] font-semibold text-[#111827]">{company.name}</h3>
                  <span className="text-[12px] font-medium text-[#64748B]">{company.ticker}</span>
                </div>
                <p className="text-[12px] text-[#64748B]">{company.sector}</p>
              </div>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              className="inline-flex items-center gap-1.5 rounded-xl border border-[#0E9384] bg-[#0E9384] px-3.5 py-2 text-[12px] font-semibold text-white transition-all hover:opacity-90"
            >
              <Check className="h-3.5 w-3.5" />
              Na Watchlist
            </button>
            <button
              type="button"
              className="rounded-xl border border-[#E2EDF5] bg-white px-3.5 py-2 text-[12px] font-medium text-[#374151] transition-all hover:bg-[#F6FAFC]"
            >
              Criar alerta
            </button>
            <button
              type="button"
              className="rounded-xl border border-[#E2EDF5] bg-white px-3.5 py-2 text-[12px] text-[#6B7280] transition-all hover:bg-[#F6FAFC]"
            >
              Comparar
            </button>
            <button
              type="button"
              className="grid h-9 w-9 place-items-center rounded-full border border-[#E2EDF5] bg-white text-[#6B7280] transition-all hover:bg-[#F6FAFC]"
            >
              <MoreHorizontal className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-0 overflow-x-auto border-b border-[#E2EDF5] bg-white px-6">
        {["Resumo", "Pilares", "O que mudou (4)", "Agenda (2)", "Preço", "Fontes"].map((tab, index) => (
          <button
            key={tab}
            type="button"
            className={cx(
              "flex-shrink-0 border-b-2 px-4 py-3.5 text-[13px] font-medium transition-all duration-150",
              index === 1
                ? "border-[#0E9384] text-[#0B1220]"
                : "border-transparent text-[#8494A9] hover:border-[#D0DDE8] hover:text-[#374151]",
            )}
          >
            {tab}
          </button>
        ))}
      </div>

      <section className="flex-1 overflow-y-auto px-6 py-5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <div className="space-y-4">
          <article className="rounded-2xl border border-[#E2EDF5] bg-white p-5 shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#94A3B8]">Síntese dos pilares</p>
                <h2 className="mt-1 text-[18px] font-bold text-[#111827]">Diagnóstico por pilares</h2>
              </div>
              <div className="flex flex-wrap items-center gap-2 text-[12px]">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-[#99F6E4] bg-[#F0FDFA] px-3 py-1 font-semibold text-[#0E9384]">
                  3 saudáveis
                </span>
                <span className="rounded-full border border-[#FDE68A] bg-[#FFFBEB] px-3 py-1 font-semibold text-[#D97706]">
                  2 atenção
                </span>
              </div>
            </div>
            <div className="mt-3 flex flex-wrap gap-2 text-[12px] text-[#374151]">
              <span className="rounded-full border border-[#E2EDF5] bg-[#F6FAFC] px-2.5 py-1">
                Principal risco: Margens
              </span>
              <span className="rounded-full border border-[#E2EDF5] bg-[#F6FAFC] px-2.5 py-1">
                Principal sustentação: Caixa e Retorno
              </span>
            </div>
          </article>

          {pillarCards.map((pillar) => {
            const isOpen = expanded === pillar.name;
            return (
              <article
                key={pillar.name}
                className="overflow-hidden rounded-2xl border border-[#E2EDF5] bg-white shadow-sm"
                style={{ borderTopWidth: "3px", borderTopColor: pillar.accent }}
              >
                <button
                  type="button"
                  onClick={() => setExpanded(isOpen ? "" : pillar.name)}
                  className="flex w-full items-center justify-between gap-3 p-5 text-left"
                >
                  <div className="flex flex-1 flex-wrap items-center gap-x-3 gap-y-1">
                    <div
                      className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl"
                      style={{ backgroundColor: `${pillar.accent}18` }}
                    >
                      <span className="text-[13px] font-bold tabular-nums" style={{ color: pillar.accent }}>
                        {pillar.score}
                      </span>
                    </div>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="text-[16px] font-bold text-[#111827]">{pillar.name}</h2>
                        <span className={cx("rounded-full border px-2.5 py-0.5 text-[11px] font-semibold", pillar.badgeClass)}>
                          {pillar.statusLabel}
                        </span>
                        <span className="text-[12px] text-[#6B7280]">{pillar.deltaLabel}</span>
                      </div>
                      <p className="mt-0.5 text-[13px] text-[#64748B]">{pillar.summary}</p>
                    </div>
                  </div>
                  <div className="ml-2 flex-shrink-0">
                    {isOpen ? <ChevronUp className="h-4 w-4 text-[#94A3B8]" /> : <ChevronDown className="h-4 w-4 text-[#94A3B8]" />}
                  </div>
                </button>

                <div className={cx("overflow-hidden transition-all duration-300", isOpen ? "max-h-[2000px] opacity-100" : "max-h-0 opacity-0")}>
                  <div className="border-t border-[#E2EDF5]" />
                  <div className="grid gap-0 lg:grid-cols-12">
                    <div className="space-y-0 border-b border-[#E2EDF5] p-5 lg:col-span-4 lg:border-b-0 lg:border-r">
                      <div>
                        <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[#94A3B8]">O que isso significa</p>
                        <p className="mt-2 text-[14px] leading-relaxed text-[#1F2937]">{pillar.meaning}</p>
                      </div>
                      <div className="mt-4 border-t border-[#E2EDF5] pt-4">
                        <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[#94A3B8]">O que monitorar</p>
                        <ul className="mt-2 space-y-2">
                          {pillar.monitorItems.map((item) => (
                            <li key={item} className="flex items-start gap-2 text-[13px] text-[#4B5563]">
                              <span className="mt-[5px] h-1.5 w-1.5 flex-shrink-0 rounded-full bg-[#94A3B8]" />
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      <p className="mt-4 text-[11px] text-[#B0BAC8]">Fonte: {pillar.source}</p>
                    </div>

                    <div className="p-5 lg:col-span-8">
                      <section className="rounded-xl border border-[#E2EDF5] bg-[#F6FAFC] p-4">
                        <div className="grid gap-4 lg:grid-cols-2">
                          <div>
                            <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[#94A3B8]">{pillar.evidenceLabel}</p>
                            <p className="mt-1 text-[12px] text-[#94A3B8]">Indicador: {pillar.evidenceMetric}</p>
                            <p className="mt-2 text-[32px] font-bold leading-none text-[#111827]">{pillar.evidenceValue}</p>
                            <p className="mt-1 text-[12px] text-[#94A3B8]">Data: {pillar.evidenceDate}</p>
                            <p className="mt-2 text-[13px] text-[#1F2937]">
                              <span className="font-semibold">Histórico:</span>{" "}
                              <span className="font-medium text-[#64748B]">{pillar.reference}</span>
                            </p>
                          </div>
                          <div>
                            <div className="mb-2 flex justify-end">
                              <div className="inline-flex rounded-full bg-[#F6FAFC] p-0.5">
                                {["5a", "10a"].map((windowOption, index) => (
                                  <button
                                    key={windowOption}
                                    type="button"
                                    className={cx(
                                      "rounded-full px-3 py-1 text-[11px]",
                                      index === 0
                                        ? "border border-[#99F6E4] bg-[#F0FDFA] font-semibold text-[#0E9384]"
                                        : "text-[#6B7280]",
                                    )}
                                  >
                                    {windowOption}
                                  </button>
                                ))}
                              </div>
                            </div>
                            <div className="flex h-[126px] items-end gap-2 rounded-2xl border border-[#E2EDF5] bg-white px-3 pb-3 pt-4">
                              {pillar.chart.map((point) => (
                                <div key={point.year} className="flex flex-1 flex-col items-center gap-2">
                                  <div className="flex h-[82px] w-full items-end rounded-[12px] bg-[#EEF5F8] px-1.5 pb-1.5">
                                    <div
                                      className="w-full rounded-[10px]"
                                      style={{
                                        height: `${Math.max(28, Number.parseFloat(point.value.replace(",", ".")) * 3.3)}px`,
                                        backgroundColor: point.active ? pillar.accent : `${pillar.accent}55`,
                                      }}
                                    />
                                  </div>
                                  <div className="text-center">
                                    <p className="text-[10px] font-medium text-[#64748B]">{point.year}</p>
                                    <p className="text-[10px] font-semibold text-[#111827]">{point.value}</p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </section>

                      <section className={cx("mt-3 rounded-xl border p-4", signalClasses(pillar.signalTone))}>
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1">
                            <span className={cx("rounded-full border px-2.5 py-0.5 text-[11px] font-semibold", signalClasses(pillar.signalTone))}>
                              {pillar.signalLabel}
                            </span>
                            <p className="mt-2 text-[14px] font-semibold text-[#111827]">{pillar.signalTitle}</p>
                            <p className="mt-1 text-[13px] text-[#4B5563]">{pillar.signalBody}</p>
                          </div>
                          <button type="button" className="flex-shrink-0 text-[12px] text-[#0E9384] hover:underline">
                            Ver fonte
                          </button>
                        </div>
                        <p className="mt-2 text-[11px] text-[#B0BAC8]">Fonte: {pillar.source}</p>
                      </section>

                      <section className="mt-3 rounded-xl border border-[#99F6E4] bg-gradient-to-br from-[#F0FDFA] to-[#F6FAFC] p-4">
                        <p className="text-[13px] text-[#374151]">Feche a leitura deste pilar com uma ação útil e verificável.</p>
                        <div className="mt-2 flex flex-wrap items-center gap-2">
                          <button
                            type="button"
                            className="rounded-xl border border-[#0E9384] bg-[#0E9384] px-4 py-2 text-[13px] font-semibold text-white transition-opacity hover:opacity-90"
                          >
                            {pillar.cta}
                          </button>
                          <button
                            type="button"
                            className="rounded-xl border border-[#D1FAE5] bg-white px-4 py-2 text-[13px] font-medium text-[#1F2937] hover:bg-[#F0FDF4]"
                          >
                            Comparar este pilar
                          </button>
                        </div>
                      </section>
                    </div>
                  </div>
                </div>
              </article>
            );
          })}

          <p className="py-2 text-center text-[13px] text-[#6B7280]">
            Sentiu falta de algum indicador?{" "}
            <button type="button" className="text-[12px] font-medium text-[#0E9384] hover:underline">
              Sugerir indicador
            </button>
          </p>
        </div>
      </section>
    </div>
  );
}

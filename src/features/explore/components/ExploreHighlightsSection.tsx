"use client";

import { ExternalLink, FileText } from "lucide-react";
import Link from "next/link";
import type { HighlightItem, HighlightPreset } from "../interfaces";

const severityTone: Record<
  HighlightItem["severity"],
  { shell: string; pill: string; accent: string; glow: string; topBand: string; topShape: string; cardShadow: string }
> = {
  Leve: {
    shell: "bg-[linear-gradient(180deg,#FFFFFF_0%,#FBFDFE_100%)] border-[#E7EEF5]",
    pill: "bg-[#EEF6FF] text-[#3965B8] border-[#D9E8FF]",
    accent: "bg-[#F5F9FD]",
    glow: "bg-[radial-gradient(circle,rgba(91,141,239,0.07)_0%,rgba(91,141,239,0)_72%)]",
    topBand: "bg-[linear-gradient(180deg,rgba(238,246,255,0.58),rgba(238,246,255,0.10))]",
    topShape: "rounded-[22px_32px_18px_26px/20px_24px_18px_22px] bg-[linear-gradient(135deg,rgba(255,255,255,0.72),rgba(255,255,255,0.16))]",
    cardShadow: "shadow-[0_12px_28px_rgba(15,23,40,0.04)]",
  },
  Moderada: {
    shell: "bg-white border-[#F2D5A6]",
    pill: "bg-[#FFF1DD] text-[#B36A11] border-[#F2D5A6]",
    accent: "bg-transparent",
    glow: "bg-[rgba(243,183,70,0.08)] blur-2xl",
    topBand: "bg-[linear-gradient(180deg,#FFE4BE_0%,#FFF3E1_100%)]",
    topShape: "hidden",
    cardShadow: "shadow-[0_12px_28px_rgba(15,23,40,0.04)]",
  },
  Forte: {
    shell: "bg-[linear-gradient(180deg,#FDEFF2_0%,#FFF9FB_100%)] border-[#F2D8DE]",
    pill: "bg-[#F9DFE7] text-[#B54768] border-[#EDC4D1]",
    accent: "bg-[#F8DCE5]",
    glow: "bg-[radial-gradient(circle,rgba(181,71,104,0.14)_0%,rgba(181,71,104,0)_72%)]",
    topBand: "bg-[linear-gradient(180deg,rgba(248,220,229,0.82),rgba(248,220,229,0.14))]",
    topShape: "rounded-[26px_28px_18px_30px/24px_18px_26px_20px] bg-[linear-gradient(135deg,rgba(255,255,255,0.56),rgba(255,240,245,0.14))]",
    cardShadow: "shadow-[0_14px_30px_rgba(15,23,40,0.05)]",
  },
};

const priorityLabelMap: Record<HighlightItem["severity"], string> = {
  Leve: "Prioridade baixa",
  Moderada: "Prioridade media",
  Forte: "Prioridade alta",
};

type SummaryScope = "Mercado" | "Setor" | "Minha watchlist";
type SummaryState = "loading" | "error" | "empty" | "ready";

interface ExploreHighlightsSectionProps {
  summaryScope: SummaryScope;
  summaryState: SummaryState;
  hasSectorSelected: boolean;
  hasWatchlist: boolean;
  hideSummaryCard?: boolean;
  sortedHighlights: HighlightItem[];
  highlights: HighlightItem[];
  showAllHighlights: boolean;
  getCompanyLogo: (ticker: string) => string | undefined;
  setSummaryScope: (scope: SummaryScope) => void;
  setSummaryState: (state: SummaryState) => void;
  setSelectedSource: (item: HighlightItem | null) => void;
  setShowAllHighlights: (fn: ((prev: boolean) => boolean) | boolean) => void;
  applyHighlightPreset: (preset: HighlightPreset) => void;
}

function HighlightPriorityCard({
  item,
  getCompanyLogo,
  setSelectedSource,
  applyHighlightPreset,
}: {
  item: HighlightItem;
  getCompanyLogo: (ticker: string) => string | undefined;
  setSelectedSource: (item: HighlightItem | null) => void;
  applyHighlightPreset: (preset: HighlightPreset) => void;
}) {
  const tone = severityTone[item.severity];

  return (
    <article className={`relative flex h-full min-h-[132px] flex-col justify-between overflow-hidden rounded-[22px] border p-4 ${tone.shell} ${tone.cardShadow}`}>
      <div className={`pointer-events-none absolute inset-x-0 top-0 h-12 ${tone.topBand}`} />
      <div className={`pointer-events-none absolute left-4 top-3 h-8 w-20 ${tone.topShape}`} />
      <div className={`pointer-events-none absolute -right-8 -top-10 h-28 w-28 rounded-full ${tone.glow}`} />
      <div className={`pointer-events-none absolute inset-x-0 top-0 h-[1px] ${tone.accent} opacity-80`} />
      <div className="flex items-start justify-between gap-4">
        <div className="relative flex min-w-0 items-start gap-3">
          {getCompanyLogo(item.ticker) && (
            <img
              src={getCompanyLogo(item.ticker)}
              alt={`Logo ${item.ticker}`}
              className="h-11 w-11 rounded-[16px] border border-white/70 bg-white object-cover p-1 shadow-[0_10px_30px_rgba(15,23,40,0.06)]"
            />
          )}
          <div className="min-w-0">
            <span className={`inline-flex rounded-full border px-3 py-1 text-[11px] font-medium ${tone.pill}`}>
              {priorityLabelMap[item.severity]}
            </span>
            <p className="mt-2.5 text-[16px] font-semibold leading-6 text-[#0F1728]">
              {item.companyName} <span className="text-[#98A2B3]">{item.ticker}</span>
            </p>
            <p className="mt-1.5 text-[13px] leading-5 text-[#667085]">{item.changeTitle}</p>
          </div>
        </div>
        <button
          onClick={() => setSelectedSource(item)}
          className="relative inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/88 text-[#667085] transition hover:text-[#0F1728]"
          aria-label={`Ver fonte de ${item.companyName}`}
        >
          <FileText className="h-4 w-4" />
        </button>
      </div>

      <div className="relative mt-4 flex items-end justify-between gap-4">
        <div className="min-w-0">
          <p className="text-[12px] font-medium uppercase tracking-[0.08em] text-[#98A2B3]">Impacto e pilar</p>
          <p className="mt-1 text-[13px] leading-5 text-[#0F1728]">{item.whyItMatters}</p>
          <p className="mt-2 text-[12px] font-medium text-[#667085]">
            {item.pillar} . {item.timeframeLabel}
          </p>
        </div>
        <button
          onClick={() => applyHighlightPreset(item.filterPreset)}
          className="inline-flex shrink-0 rounded-full bg-white px-3.5 py-2 text-[12px] font-semibold text-[#0E9384] shadow-[0_8px_22px_rgba(15,23,40,0.06)] transition hover:opacity-90"
        >
          Ver relacionadas
        </button>
      </div>
    </article>
  );
}

export function ExploreHighlightsSection({
  summaryScope,
  summaryState,
  hasSectorSelected,
  hasWatchlist,
  hideSummaryCard = false,
  sortedHighlights,
  highlights,
  showAllHighlights,
  getCompanyLogo,
  setSummaryScope,
  setSummaryState,
  setSelectedSource,
  setShowAllHighlights,
  applyHighlightPreset,
}: ExploreHighlightsSectionProps) {
  const featuredHighlight = sortedHighlights[0];
  const priorityHighlights = sortedHighlights.slice(1, 4);
  const overflowHighlights = sortedHighlights.slice(4);

  return (
    <section className="space-y-5">
      {summaryState === "loading" && (
        <div className="grid gap-6 xl:grid-cols-12">
          <div className="xl:col-span-8 h-[340px] rounded-[28px] bg-[#EAF1F7]" />
          <div className="xl:col-span-4 h-[340px] rounded-[28px] bg-white" />
          {[1, 2, 3].map((item) => (
            <div key={item} className="h-[148px] rounded-[24px] bg-white xl:col-span-4" />
          ))}
        </div>
      )}

      {summaryState === "error" && (
        <div className="rounded-[28px] border border-[#E7EEF5] bg-white p-8 shadow-[0_18px_40px_rgba(15,23,40,0.04)]">
          <p className="text-[15px] leading-6 text-[#475467]">Nao foi possivel carregar os destaques agora.</p>
          <button
            onClick={() => setSummaryState("ready")}
            className="mt-4 inline-flex rounded-[16px] bg-[#0E9384] px-4 py-2.5 text-[14px] font-semibold text-white"
          >
            Tentar novamente
          </button>
        </div>
      )}

      {summaryState === "empty" && (
        <div className="rounded-[28px] border border-[#E7EEF5] bg-white p-8 shadow-[0_18px_40px_rgba(15,23,40,0.04)]">
          <p className="text-[15px] leading-6 text-[#475467]">Ainda nao temos destaques para exibir hoje.</p>
          <div className="mt-5 flex flex-wrap gap-3">
            <button className="rounded-[16px] border border-[#E7EEF5] bg-[#F8FBFD] px-4 py-2.5 text-[14px] font-medium text-[#0F1728]">
              Explorar por tese
            </button>
            <button className="rounded-[16px] bg-[#0E9384] px-4 py-2.5 text-[14px] font-semibold text-white">
              Ver empresas para analisar
            </button>
          </div>
        </div>
      )}

      {summaryState === "ready" && featuredHighlight && (
        <>
          <div className={`grid gap-5 ${hideSummaryCard ? "" : "xl:grid-cols-12"}`}>
            <article className={`relative overflow-hidden rounded-[26px] border border-[#DDE9F5] bg-[linear-gradient(140deg,#EAF4FF_0%,#EDF6FF_24%,#F4F9FF_54%,#FBFDFF_78%,#FFFFFF_100%)] p-6 shadow-[0_24px_50px_rgba(15,23,40,0.07)] ${hideSummaryCard ? "" : "xl:col-span-8 xl:min-h-[312px]"}`}>
              <div className="pointer-events-none absolute inset-0">
                <div className="absolute -left-12 -top-20 h-80 w-80 rounded-full bg-[radial-gradient(circle,rgba(91,141,239,0.24)_0%,rgba(91,141,239,0.10)_28%,rgba(91,141,239,0)_72%)] blur-3xl" />
                <div className="absolute left-10 top-8 h-32 w-52 rounded-[55%_45%_58%_42%/48%_35%_65%_52%] bg-[linear-gradient(135deg,rgba(255,255,255,0.58),rgba(255,255,255,0.08))]" />
                <div className="absolute left-[16%] top-3 h-24 w-24 rounded-[38%_62%_58%_42%/52%_35%_65%_48%] border border-white/65 bg-[linear-gradient(180deg,rgba(255,255,255,0.28),rgba(255,255,255,0.12))]" />
                <div className="absolute right-10 top-10 h-28 w-28 rounded-full border border-white/60 bg-[linear-gradient(180deg,rgba(255,255,255,0.34),rgba(255,255,255,0.18))]" />
                <div className="absolute left-7 top-[118px] h-44 w-[54%] rounded-[34px] bg-[linear-gradient(180deg,rgba(255,255,255,0.52),rgba(255,255,255,0.10))] shadow-[0_20px_50px_rgba(15,23,40,0.05)]" />
                <div className="absolute inset-x-0 top-0 h-[120px] bg-[linear-gradient(180deg,rgba(255,255,255,0.22),rgba(255,255,255,0))]" />
              </div>

              <div className="relative grid h-full gap-6 lg:grid-cols-[minmax(0,1.2fr)_260px]">
                <div className="flex flex-col justify-between">
                  <div>
                    <span className="inline-flex rounded-full bg-white/80 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.08em] text-[#3965B8]">
                      Curadoria principal
                    </span>
                    <h2 className="mt-4 max-w-[680px] text-[24px] font-semibold leading-[1.15] tracking-[-0.03em] text-[#0F1728]">
                      {featuredHighlight.changeTitle}
                    </h2>
                    <p className="mt-3 max-w-[620px] text-[14px] leading-6 text-[#475467]">{featuredHighlight.whyItMatters}</p>

                    <div className="relative mt-6 rounded-[22px] border border-white/75 bg-[linear-gradient(180deg,rgba(255,255,255,0.88),rgba(255,255,255,0.72))] p-4 shadow-[0_18px_40px_rgba(15,23,40,0.06)]">
                      <div className="pointer-events-none absolute inset-x-0 top-0 h-14 rounded-t-[24px] bg-[linear-gradient(180deg,rgba(255,255,255,0.62),rgba(255,255,255,0))]" />
                      <div className="pointer-events-none absolute inset-y-3 left-0 w-px bg-[linear-gradient(180deg,rgba(91,141,239,0),rgba(91,141,239,0.18),rgba(91,141,239,0))]" />
                      <div className="flex items-start gap-4">
                        {getCompanyLogo(featuredHighlight.ticker) && (
                          <img
                            src={getCompanyLogo(featuredHighlight.ticker)}
                            alt={`Logo ${featuredHighlight.ticker}`}
                            className="h-12 w-12 rounded-[18px] border border-white bg-white object-cover p-1 shadow-[0_12px_30px_rgba(15,23,40,0.08)]"
                          />
                        )}
                        <div className="min-w-0">
                          <p className="text-[18px] font-semibold leading-6 text-[#0F1728]">
                            {featuredHighlight.companyName} <span className="text-[#98A2B3]">{featuredHighlight.ticker}</span>
                          </p>
                          <p className="mt-1 text-[13px] leading-5 text-[#667085]">Entrou hoje porque {featuredHighlight.changeTitle.toLowerCase()}.</p>
                          <div className="mt-3 flex flex-wrap gap-2">
                            <span className={`inline-flex rounded-full border px-3 py-1 text-[11px] font-medium ${severityTone[featuredHighlight.severity].pill}`}>
                              {priorityLabelMap[featuredHighlight.severity]}
                            </span>
                            <span className="inline-flex rounded-full border border-[#D9E8FF] bg-white px-3 py-1 text-[11px] font-medium text-[#3965B8]">
                              Pilar: {featuredHighlight.pillar}
                            </span>
                            <span className="inline-flex rounded-full border border-[#E7EEF5] bg-white px-3 py-1 text-[11px] font-medium text-[#667085]">
                              {featuredHighlight.timeframeLabel}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 flex flex-wrap gap-3">
                    <Link
                      href={`/empresa/${featuredHighlight.ticker}`}
                      className="inline-flex items-center rounded-[15px] bg-[#0E9384] px-4 py-2.5 text-[13px] font-semibold text-white shadow-[0_12px_30px_rgba(14,147,132,0.18)] transition hover:opacity-90"
                    >
                      Abrir analise
                    </Link>
                    <button
                      onClick={() => applyHighlightPreset(featuredHighlight.filterPreset)}
                      className="inline-flex items-center rounded-[15px] border border-[#DDE9F5] bg-white/80 px-4 py-2.5 text-[13px] font-semibold text-[#0F1728] transition hover:bg-white"
                    >
                      Ver empresas relacionadas
                    </button>
                  </div>
                </div>

                <aside className="relative flex flex-col justify-between rounded-[22px] border border-[rgba(221,233,245,0.92)] bg-[linear-gradient(180deg,rgba(255,255,255,0.92),rgba(248,251,253,0.96))] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.55)]">
                  <div className="pointer-events-none absolute inset-x-0 top-0 h-16 rounded-t-[24px] bg-[linear-gradient(180deg,rgba(234,244,255,0.72),rgba(234,244,255,0))]" />
                  <div>
                    <p className="text-[12px] font-medium uppercase tracking-[0.08em] text-[#98A2B3]">Por que abrir agora</p>
                    <p className="mt-3 text-[15px] leading-7 text-[#0F1728]">{featuredHighlight.whyItMatters}</p>
                  </div>

                  <div className="space-y-4">
                    <div className="rounded-[20px] border border-[#EEF3F7] bg-[linear-gradient(180deg,#F8FBFD_0%,#FFFFFF_100%)] p-4">
                      <p className="text-[12px] font-medium uppercase tracking-[0.08em] text-[#98A2B3]">Fonte e rastreabilidade</p>
                      <p className="mt-2 text-[14px] font-semibold text-[#0F1728]">{featuredHighlight.source.name}</p>
                      <p className="mt-1 text-[13px] leading-6 text-[#667085]">{featuredHighlight.source.docLabel}</p>
                      <p className="mt-1 text-[12px] text-[#98A2B3]">Atualizado em {featuredHighlight.source.updatedAt}</p>
                    </div>

                    <div className="flex flex-col gap-2">
                      <button
                        onClick={() => setSelectedSource(featuredHighlight)}
                        className="inline-flex items-center gap-2 text-[13px] font-medium text-[#0E9384] transition hover:text-[#0F1728]"
                      >
                        <FileText className="h-4 w-4" />
                        Ver fonte
                      </button>
                      {featuredHighlight.source.url && (
                        <a
                          href={featuredHighlight.source.url}
                          className="inline-flex items-center gap-2 text-[13px] font-medium text-[#667085] transition hover:text-[#0F1728]"
                        >
                          <ExternalLink className="h-4 w-4" />
                          Documento externo
                        </a>
                      )}
                    </div>
                  </div>
                </aside>
              </div>
            </article>

            {!hideSummaryCard && <aside className="relative overflow-hidden rounded-[28px] border border-[#E7EEF5] bg-[linear-gradient(180deg,#FFFFFF_0%,#FBFDFE_100%)] p-7 shadow-[0_18px_40px_rgba(15,23,40,0.05)] xl:col-span-4 xl:min-h-[340px]">
              <div className="absolute right-0 top-0 h-40 w-40 rounded-full bg-[radial-gradient(circle,rgba(18,165,148,0.10)_0%,rgba(18,165,148,0)_68%)]" />
              <div className="absolute inset-x-0 top-0 h-20 bg-[linear-gradient(180deg,rgba(239,250,246,0.72),rgba(239,250,246,0))]" />

              <div className="relative flex h-full flex-col justify-between">
                <div>
                  <p className="text-[12px] font-medium uppercase tracking-[0.08em] text-[#98A2B3]">Lente da curadoria</p>
                  <h3 className="mt-3 text-[20px] font-semibold leading-7 text-[#0F1728]">{summaryScope}</h3>
                  <p className="mt-3 text-[15px] leading-7 text-[#667085]">
                    {summaryScope === "Setor"
                      ? "Mostra destaques do setor selecionado com leitura mais concentrada."
                      : "Mostra os sinais mais relevantes do mercado para guiar o que abrir primeiro."}
                  </p>
                </div>

                <div className="mt-8 space-y-5">
                  <div className="inline-flex rounded-full bg-[#F4F8FB] p-1">
                    {[
                      { label: "Mercado", enabled: true },
                      { label: "Setor", enabled: hasSectorSelected, tooltip: "Selecione um setor para ativar." },
                      { label: "Minha watchlist", enabled: hasWatchlist, tooltip: "Adicione empresas a watchlist para ativar." },
                    ]
                      .filter((option) => option.label !== "Minha watchlist" || hasWatchlist)
                      .map((option) => (
                        <button
                          key={option.label}
                          onClick={() => option.enabled && setSummaryScope(option.label as SummaryScope)}
                          title={!option.enabled ? option.tooltip : undefined}
                          className={`rounded-full px-4 py-2 text-[12px] font-medium transition ${
                            summaryScope === option.label
                              ? "bg-[#EFFAF6] text-[#0E9384] shadow-[0_8px_18px_rgba(15,23,40,0.06)]"
                              : option.enabled
                                ? "text-[#667085] hover:text-[#0F1728]"
                                : "cursor-not-allowed text-[#98A2B3]"
                          }`}
                        >
                          {option.label}
                        </button>
                      ))}
                  </div>

                  <div className="rounded-[24px] border border-[#EEF3F7] bg-[linear-gradient(180deg,#F8FBFD_0%,#FFFFFF_100%)] p-5">
                    <p className="text-[12px] font-medium uppercase tracking-[0.08em] text-[#98A2B3]">Como ler este bloco</p>
                    <p className="mt-3 text-[14px] leading-6 text-[#475467]">
                      Primeiro abra a leitura principal. Depois use a lente para expandir por setor ou por empresas relacionadas.
                    </p>
                  </div>
                </div>
              </div>
            </aside>}
          </div>

          {priorityHighlights.length > 0 && (
            <div className={`grid gap-5 ${hideSummaryCard ? "md:grid-cols-2" : "xl:grid-cols-3"}`}>
              {priorityHighlights.map((item) => (
                <HighlightPriorityCard
                  key={item.id}
                  item={item}
                  getCompanyLogo={getCompanyLogo}
                  setSelectedSource={setSelectedSource}
                  applyHighlightPreset={applyHighlightPreset}
                />
              ))}
            </div>
          )}

          {overflowHighlights.length > 0 && showAllHighlights && (
            <div className={`grid gap-5 ${hideSummaryCard ? "md:grid-cols-2" : "xl:grid-cols-3"}`}>
              {overflowHighlights.map((item) => (
                <HighlightPriorityCard
                  key={item.id}
                  item={item}
                  getCompanyLogo={getCompanyLogo}
                  setSelectedSource={setSelectedSource}
                  applyHighlightPreset={applyHighlightPreset}
                />
              ))}
            </div>
          )}

          <div className="flex flex-col gap-4 rounded-[24px] border border-[#E7EEF5] bg-white px-6 py-5 shadow-[0_14px_34px_rgba(15,23,40,0.04)] lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-wrap items-center gap-3 text-[13px] text-[#667085]">
              <span>Ultima atualizacao: 05/02</span>
              <span className="hidden h-1 w-1 rounded-full bg-[#CBD5E1] lg:block" />
              <span>Fontes: CVM, B3, RI</span>
              <span className="hidden h-1 w-1 rounded-full bg-[#CBD5E1] lg:block" />
              <span>Resumo educacional, sem recomendacao de compra ou venda.</span>
            </div>
            {highlights.length > 4 && (
              <button
                onClick={() => setShowAllHighlights((prev) => !prev)}
                className="inline-flex w-fit rounded-full bg-[#F4F8FB] px-4 py-2 text-[12px] font-semibold text-[#0F1728] transition hover:bg-[#EAF1F7]"
              >
                {showAllHighlights ? "Ver menos prioridades" : "Ver mais prioridades"}
              </button>
            )}
          </div>
        </>
      )}
    </section>
  );
}

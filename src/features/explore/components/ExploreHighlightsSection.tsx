"use client";

import { ExternalLink, TrendingUp } from "lucide-react";
import Link from "next/link";
import type { HighlightItem, HighlightPreset } from "../interfaces";
import { MiniSparkline } from "@/src/components/shared/MiniSparkline";
import { SectionCategoryTag } from "./market/SectionCategoryTag";

const MOVIMENTOS_CATEGORY_ID = "movimentos";

/** Heurística trend→status do MiniSparkline baseada no delta entre extremos da sparkline. */
function sparklineStatus(points: number[] | null | undefined): "healthy" | "attention" | "risk" {
  if (!points || points.length < 2) return "attention";
  const first = points[0];
  const last = points[points.length - 1];
  if (!Number.isFinite(first) || !Number.isFinite(last) || first === 0) return "attention";
  const delta = (last - first) / Math.abs(first);
  if (delta > 0.005) return "healthy";  // +0,5% fim vs início
  if (delta < -0.005) return "risk";
  return "attention";
}

const severityTone: Record<
  HighlightItem["severity"],
  { shell: string; pill: string; accent: string; glow: string; topBand: string; topShape: string; cardShadow: string }
> = {
  Leve: {
    shell: "bg-card border-border",
    pill: "bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800/50",
    accent: "bg-transparent",
    glow: "bg-transparent",
    topBand: "bg-transparent",
    topShape: "hidden",
    cardShadow: "mercado-elev-sm",
  },
  Moderada: {
    shell: "bg-card border-warning-border",
    pill: "bg-warning-surface text-warning-text border-warning-border",
    accent: "bg-transparent",
    glow: "bg-transparent",
    topBand: "bg-transparent",
    topShape: "hidden",
    cardShadow: "mercado-elev-sm",
  },
  Forte: {
    shell: "bg-card border-danger-border",
    pill: "bg-danger-surface text-danger-text border-danger-border",
    accent: "bg-transparent",
    glow: "bg-transparent",
    topBand: "bg-transparent",
    topShape: "hidden",
    cardShadow: "mercado-elev-md",
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
  setShowAllHighlights: (fn: ((prev: boolean) => boolean) | boolean) => void;
  applyHighlightPreset: (preset: HighlightPreset) => void;
}

function HighlightPriorityCard({
  item,
  getCompanyLogo,
}: {
  item: HighlightItem;
  getCompanyLogo: (ticker: string) => string | undefined;
}) {
  const tone = severityTone[item.severity];

  return (
    <article
      className={`mercado-island-hover relative flex h-full min-h-[132px] flex-col justify-between overflow-hidden rounded-3xl border p-5 ${tone.shell} ${tone.cardShadow}`}
    >
      {/* Tag silenciosa — seção Movimentos já identificada no header */}
      <SectionCategoryTag icon={TrendingUp} label="Movimentos" categoryId={MOVIMENTOS_CATEGORY_ID} silent />
      <div className={`pointer-events-none absolute inset-x-0 top-0 h-12 ${tone.topBand}`} />
      <div className={`pointer-events-none absolute left-4 top-3 h-8 w-20 ${tone.topShape}`} />
      <div className={`pointer-events-none absolute -right-8 -top-10 h-28 w-28 rounded-full ${tone.glow}`} />
      <div className={`pointer-events-none absolute inset-x-0 top-0 h-[1px] ${tone.accent} opacity-80`} />
      <div className="flex items-start justify-between gap-4">
        <div className="relative flex min-w-0 items-start gap-3">
          {(item.logoUrl ?? getCompanyLogo(item.ticker)) && (
            <img
              src={(item.logoUrl ?? getCompanyLogo(item.ticker))!}
              alt={`Logo ${item.ticker}`}
              className="mercado-elev-sm h-11 w-11 rounded-2xl border border-border bg-card object-cover p-1"
            />
          )}
          <div className="min-w-0">
            <span className={`inline-flex rounded-full border px-3 py-1 text-[11px] font-medium ${tone.pill}`}>
              {priorityLabelMap[item.severity]}
            </span>
            <p className="mt-2.5 text-base font-semibold leading-6 text-foreground">
              {item.companyName} <span className="text-muted-foreground">{item.ticker}</span>
            </p>
            <p className="mt-1.5 text-sm leading-5 text-muted-foreground">{item.changeTitle}</p>
          </div>
        </div>

        {item.sparkline && item.sparkline.length >= 2 && (
          <div className="shrink-0 pt-1" aria-hidden="true">
            <MiniSparkline
              data={item.sparkline}
              status={sparklineStatus(item.sparkline)}
              width={72}
              height={28}
              strokeWidth={1.25}
            />
          </div>
        )}
      </div>

      <div className="relative mt-4 flex items-end justify-between gap-4">
        <div className="min-w-0">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Impacto e pilar</p>
          <p className="mt-1 text-sm leading-5 text-foreground">{item.whyItMatters}</p>
          <p className="mt-2 text-xs font-medium text-muted-foreground">
            {item.pillar} · {item.timeframeLabel}
          </p>
        </div>
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
          <div className="xl:col-span-8 h-[340px] animate-pulse rounded-3xl bg-muted" />
          <div className="xl:col-span-4 h-[340px] animate-pulse rounded-3xl bg-card" />
          {[1, 2, 3].map((item) => (
            <div key={item} className="h-[148px] animate-pulse rounded-3xl bg-card xl:col-span-4" />
          ))}
        </div>
      )}

      {summaryState === "error" && (
        <div className="mercado-elev-md rounded-3xl border border-border bg-card p-8">
          <p className="text-base leading-6 text-muted-foreground">Não foi possível carregar os destaques agora.</p>
          <button
            onClick={() => setSummaryState("ready")}
            className="mt-4 inline-flex rounded-xl bg-brand px-4 py-2.5 text-sm font-semibold text-white transition-opacity duration-200 hover:opacity-90"
          >
            Tentar novamente
          </button>
        </div>
      )}

      {summaryState === "empty" && (
        <div className="mercado-elev-md rounded-3xl border border-border bg-card p-8">
          <p className="text-base leading-6 text-muted-foreground">Ainda não temos destaques para exibir hoje.</p>
          <div className="mt-5 flex flex-wrap gap-3">
            <button className="rounded-xl border border-border bg-muted px-4 py-2.5 text-sm font-medium text-foreground transition-colors duration-200 hover:bg-accent">
              Explorar por tese
            </button>
            <button className="rounded-xl bg-brand px-4 py-2.5 text-sm font-semibold text-white transition-opacity duration-200 hover:opacity-90">
              Ver empresas para analisar
            </button>
          </div>
        </div>
      )}

      {summaryState === "ready" && featuredHighlight && (
        <>
          <div className="grid gap-5">
            <article className="mercado-elev-lg relative overflow-hidden rounded-3xl border border-border bg-card p-6 md:p-7">
              <div className="relative grid h-full gap-6 lg:grid-cols-[minmax(0,1.2fr)_260px]">
                <div className="flex flex-col justify-between">
                  <div>
                    <span className="inline-flex rounded-full bg-blue-50 dark:bg-blue-900/30 px-3 py-1 text-[11px] font-medium uppercase tracking-wide text-blue-700 dark:text-blue-300">
                      Curadoria principal
                    </span>
                    <h2 className="mt-4 max-w-[680px] text-2xl font-semibold leading-[1.15] tracking-[-0.025em] text-foreground md:text-[28px] md:leading-9">
                      {featuredHighlight.changeTitle}
                    </h2>
                    <p className="mt-3 max-w-[620px] text-sm leading-6 text-muted-foreground">{featuredHighlight.whyItMatters}</p>

                    <div className="mercado-elev-md relative mt-6 rounded-2xl border border-border bg-card p-4">
                      <div className="flex items-start gap-4">
                        {(featuredHighlight.logoUrl ?? getCompanyLogo(featuredHighlight.ticker)) && (
                          <img
                            src={(featuredHighlight.logoUrl ?? getCompanyLogo(featuredHighlight.ticker))!}
                            alt={`Logo ${featuredHighlight.ticker}`}
                            className="mercado-elev-sm h-12 w-12 rounded-2xl border border-border bg-card object-cover p-1"
                          />
                        )}
                        <div className="min-w-0">
                          <p className="text-lg font-semibold leading-6 text-foreground">
                            {featuredHighlight.companyName} <span className="text-muted-foreground">{featuredHighlight.ticker}</span>
                          </p>
                          <p className="mt-1 text-sm leading-5 text-muted-foreground">Entrou hoje porque {featuredHighlight.changeTitle.toLowerCase()}.</p>
                          <div className="mt-3 flex flex-wrap gap-2">
                            <span className={`inline-flex rounded-full border px-3 py-1 text-[11px] font-medium ${severityTone[featuredHighlight.severity].pill}`}>
                              {priorityLabelMap[featuredHighlight.severity]}
                            </span>
                            <span className="inline-flex rounded-full border border-blue-200 dark:border-blue-800/50 bg-card px-3 py-1 text-[11px] font-medium text-blue-700 dark:text-blue-300">
                              Pilar: {featuredHighlight.pillar}
                            </span>
                            <span className="inline-flex rounded-full border border-border bg-card px-3 py-1 text-[11px] font-medium text-muted-foreground">
                              {featuredHighlight.timeframeLabel}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 flex flex-wrap gap-3">
                    <Link
                      href={`/analysis/${featuredHighlight.ticker}`}
                      className="mercado-elev-sm inline-flex items-center rounded-xl bg-brand px-4 py-2.5 text-sm font-semibold text-white transition-opacity duration-200 hover:opacity-90"
                    >
                      Abrir análise
                    </Link>
                  </div>
                </div>

                <aside className="relative flex flex-col justify-between rounded-2xl border border-border bg-muted/30 p-4">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Por que abrir agora</p>
                    <p className="mt-3 text-[15px] leading-7 text-foreground">{featuredHighlight.whyItMatters}</p>
                  </div>

                  <div className="mt-4 space-y-4">
                    <div className="rounded-2xl border border-border bg-card p-4">
                      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Fonte e rastreabilidade</p>
                      <p className="mt-2 text-sm font-semibold text-foreground">{featuredHighlight.source.name}</p>
                      <p className="mt-1 text-sm leading-6 text-muted-foreground">{featuredHighlight.source.docLabel}</p>
                      <p className="mt-1 text-xs text-muted-foreground">Atualizado em {featuredHighlight.source.updatedAt}</p>
                    </div>

                    {featuredHighlight.source.url && (
                      <div className="flex flex-col gap-2">
                        <a
                          href={featuredHighlight.source.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors duration-200 hover:text-foreground"
                        >
                          <ExternalLink className="h-4 w-4" />
                          Documento externo
                        </a>
                      </div>
                    )}
                  </div>
                </aside>
              </div>
            </article>

          </div>

          {priorityHighlights.length > 0 && (
            <div className={`grid gap-5 ${hideSummaryCard ? "md:grid-cols-2" : "xl:grid-cols-3"}`}>
              {priorityHighlights.map((item) => (
                <HighlightPriorityCard
                  key={item.id}
                  item={item}
                  getCompanyLogo={getCompanyLogo}
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
                />
              ))}
            </div>
          )}

          {/*
            Disclosure "Ver mais destaques" — antes o estado existia mas o
            botão que disparava `setShowAllHighlights` não estava renderizado
            (prop órfã). Skill: progressive disclosure — o default exibe o
            protagonista + 3 destaques; se houver mais, o usuário pode expandir
            sob demanda sem competir com os principais.
          */}
          {overflowHighlights.length > 0 && (
            <div className="flex justify-center pt-1">
              <button
                type="button"
                onClick={() => setShowAllHighlights((prev) => !prev)}
                aria-expanded={showAllHighlights}
                className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm font-medium text-muted-foreground transition-colors duration-200 hover:text-foreground"
              >
                {showAllHighlights
                  ? "Mostrar menos destaques"
                  : `Ver mais ${overflowHighlights.length} destaques`}
              </button>
            </div>
          )}

        </>
      )}
    </section>
  );
}

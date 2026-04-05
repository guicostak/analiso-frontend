"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useState } from "react";
import {
  Bookmark,
  History,
  Link2,
  Plus,
  Share2,
  X,
} from "lucide-react";
import { Sidebar } from "@/src/components/layout/Sidebar";
import { AppTopBar } from "@/src/components/layout/AppTopBar";
import { MainContent } from "@/src/components/layout/MainContent";
import { AddCompanyModal } from "@/src/features/watchlist/components/AddCompanyModal";
import { useCompare } from "../hooks/useCompare";
import { PILLARS } from "../services";
import { CompareEvidenceDrawer } from "./CompareEvidenceDrawer";
import {
  CompareHeader,
  SnowflakeDual,
  VerdictIsland,
  TopFactorsIsland,
  MetricsTableIsland,
  SourcesIsland,
} from "./islands";

// Lazy-load heavier islands below the fold
const ValuationIsland = dynamic(
  () => import("./islands/ValuationIsland").then((m) => ({ default: m.ValuationIsland })),
  { ssr: false },
);
const GrowthIsland = dynamic(
  () => import("./islands/GrowthIsland").then((m) => ({ default: m.GrowthIsland })),
  { ssr: false },
);
const PastIsland = dynamic(
  () => import("./islands/PastIsland").then((m) => ({ default: m.PastIsland })),
  { ssr: false },
);
const HealthIsland = dynamic(
  () => import("./islands/HealthIsland").then((m) => ({ default: m.HealthIsland })),
  { ssr: false },
);
const DividendIsland = dynamic(
  () => import("./islands/DividendIsland").then((m) => ({ default: m.DividendIsland })),
  { ssr: false },
);
const TimelineIsland = dynamic(
  () => import("./islands/TimelineIsland").then((m) => ({ default: m.TimelineIsland })),
  { ssr: false },
);

/* ── Section definitions ─────────────────────────────────────────────────── */

const SECTIONS = [
  { id: "snowflake", label: "Visão geral" },
  { id: "veredito", label: "Veredito" },
  { id: "fatores", label: "Fatores" },
  { id: "valuation", label: "Valuation" },
  { id: "crescimento", label: "Crescimento" },
  { id: "passado", label: "Passado" },
  { id: "saude", label: "Saúde" },
  { id: "dividendos", label: "Dividendos" },
  { id: "metricas", label: "Métricas" },
  { id: "timeline", label: "Timeline" },
  { id: "fontes", label: "Fontes" },
] as const;

/* ── Loading skeleton ────────────────────────────────────────────────────── */

function LoadingBlocks() {
  return (
    <div className="space-y-8">
      <div className="h-[160px] animate-pulse rounded-[28px] border border-border bg-card" />
      <div className="h-[280px] animate-pulse rounded-[28px] border border-border bg-card" />
      <div className="h-[360px] animate-pulse rounded-[28px] border border-border bg-card" />
    </div>
  );
}

/* ── Main page ───────────────────────────────────────────────────────────── */

export function ComparePage() {
  const {
    detailRef,
    verdictRef,
    activePillar,
    range,
    refreshing,
    evidence,
    toast,
    compactSticky,
    comparisonHistory,
    historyOpen,
    setHistoryOpen,
    selected,
    pair,
    a,
    b,
    enrichedA,
    enrichedB,
    canCompare,
    scoreboard,
    topPillarDiffs,
    otherPillarDiffs,
    verdict,
    tableRows,
    activePillarWinnerSummary,
    recentEvents,
    qualityTone,
    selectedTickers,
    setSelectedTickers,
    addTicker,
    swapCompanies,
    selectPillar,
    setRange,
    setEvidence,
    setToast,
    openEvidence,
    copyShareLink,
    saveComparison,
    PILLAR_LABEL,
    RANGES,
    formatMetric,
    metricDelta,
    metricWinner,
    evidenceReadLabel,
    pillarInsight,
    trendContext,
    formatNumber,
  } = useCompare();

  const [showAddModal, setShowAddModal] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<string>(SECTIONS[0].id);

  // ── Scroll-based section tracking ──
  useEffect(() => {
    if (!canCompare) return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        }
      },
      { rootMargin: "-30% 0px -60% 0px", threshold: 0 },
    );
    for (const s of SECTIONS) {
      const el = document.getElementById(s.id);
      if (el) observer.observe(el);
    }
    return () => observer.disconnect();
  }, [canCompare, enrichedA, enrichedB]);

  const navigateToSection = useCallback((id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground" style={{ fontFamily: "Inter, sans-serif" }}>
      <Sidebar currentPage="comparar" />
      <AppTopBar sidebarOffsetClassName="left-0 xl:left-[240px]" />
      <AddCompanyModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSelect={(ticker) => addTicker(ticker)}
        excludeTickers={new Set(selectedTickers)}
        searchPlaceholder="Buscar empresa para comparar..."
        footerText={`${selectedTickers.length} de 4 empresas selecionadas`}
      />
      <MainContent className="relative overflow-hidden pt-20">
        {/* Background gradients */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-[8%] top-0 h-80 w-80 rounded-full bg-[radial-gradient(circle,rgba(91,141,239,0.10)_0%,rgba(91,141,239,0)_72%)]" />
          <div className="absolute right-[6%] top-40 h-[24rem] w-[24rem] rounded-full bg-[radial-gradient(circle,rgba(18,165,148,0.09)_0%,rgba(18,165,148,0)_72%)]" />
        </div>

        <div className="relative px-8 pb-12 pt-6">
          <div className="mx-auto max-w-[1560px]">
            {/* ── Page title ── */}
            <div className="mb-6 space-y-3">
              <p className="text-[12px] font-medium uppercase text-muted-foreground">Análise comparativa</p>
              <h1 className="text-[32px] font-semibold tracking-[-0.03em] text-foreground">Comparar empresas</h1>
              <p className="text-[15px] text-muted-foreground">Compare empresas lado a lado por pilar.</p>
            </div>

            {/* ── Header island (sticky) ── */}
            {enrichedA && enrichedB ? (
              <CompareHeader
                a={enrichedA}
                b={enrichedB}
                activePillar={activePillar}
                range={range}
                onSelectPillar={selectPillar}
                onSetRange={setRange}
                onSwap={swapCompanies}
                PILLAR_LABEL={PILLAR_LABEL}
                RANGES={RANGES}
                PILLARS={PILLARS}
                compactSticky={compactSticky}
              />
            ) : (
              /* Fallback: company selector only */
              <section className="sticky top-14 z-10 mb-2 rounded-[28px] border border-border bg-[rgba(255,255,255,0.94)] p-6 shadow-[0_16px_36px_rgba(15,23,40,0.07)] backdrop-blur dark:bg-[rgba(15,23,40,0.94)] dark:shadow-none">
                <div className="flex flex-wrap items-center gap-2">
                  {selected.map((company) => (
                    <span
                      key={company.ticker}
                      className="inline-flex shrink-0 items-center gap-2 rounded-full border border-border bg-card px-3.5 py-2 text-[13px] font-medium text-foreground"
                    >
                      <span className="inline-flex h-[22px] w-[22px] items-center justify-center rounded-full border border-border bg-muted text-[10px] font-semibold text-muted-foreground">
                        {company.ticker.slice(0, 1)}
                      </span>
                      {company.ticker}
                      <button
                        onClick={() => setSelectedTickers((c) => c.filter((t) => t !== company.ticker))}
                        className="rounded-full p-0.5 text-muted-foreground transition hover:bg-hover hover:text-foreground"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </span>
                  ))}
                  {selected.length < 4 && (
                    <button
                      onClick={() => setShowAddModal(true)}
                      className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-dashed border-border bg-card px-3.5 py-2 text-[13px] font-medium text-muted-foreground transition hover:border-brand hover:text-foreground"
                    >
                      <Plus className="h-4 w-4" />
                      Adicionar
                    </button>
                  )}
                </div>
              </section>
            )}

            {/* ── Secondary actions ── */}
            {canCompare && (
              <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
                <div>
                  <button
                    onClick={() => setHistoryOpen((v) => !v)}
                    className={`inline-flex h-8 items-center gap-1.5 rounded-full border px-3 text-[12px] font-medium transition ${historyOpen ? "border-brand bg-brand/10 text-brand" : "border-border bg-card text-muted-foreground hover:border-brand hover:text-foreground"}`}
                  >
                    <History className="h-3.5 w-3.5" />
                    Histórico
                    {comparisonHistory.length > 0 && (
                      <span className="inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-brand px-1 text-[10px] font-bold text-white">
                        {comparisonHistory.length}
                      </span>
                    )}
                  </button>
                  {historyOpen && (
                    <div className="mt-2 rounded-[18px] border border-border bg-card p-4 shadow-[0_8px_24px_rgba(15,23,40,0.06)] dark:shadow-none">
                      <p className="mb-3 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Comparações recentes</p>
                      {comparisonHistory.length === 0 ? (
                        <p className="py-2 text-[12px] text-muted-foreground">Nenhuma comparação salva ainda</p>
                      ) : (
                        <div className="flex flex-wrap gap-2">
                          {comparisonHistory.slice(0, 4).map((item, i) => (
                            <button
                              key={i}
                              onClick={() => { setSelectedTickers(item.tickers); setHistoryOpen(false); }}
                              className="flex flex-col rounded-[12px] border border-border bg-muted px-3.5 py-2.5 text-left transition hover:border-brand hover:bg-brand/5"
                            >
                              <span className="text-[13px] font-medium text-foreground">{item.label}</span>
                              <span className="text-[11px] text-muted-foreground">{item.savedAt}</span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={saveComparison}
                    className="inline-flex h-8 items-center gap-1.5 rounded-full border border-border bg-card px-3 text-[12px] font-medium text-muted-foreground transition hover:border-brand hover:text-foreground"
                  >
                    <Bookmark className="h-3.5 w-3.5" />
                    Salvar
                  </button>
                  <div className="relative">
                    <button
                      onClick={() => setShareOpen((v) => !v)}
                      className="inline-flex h-8 items-center gap-1.5 rounded-full border border-border bg-card px-3 text-[12px] font-medium text-muted-foreground transition hover:border-brand hover:text-foreground"
                    >
                      <Share2 className="h-3.5 w-3.5" />
                      Compartilhar
                    </button>
                    {shareOpen && (
                      <div className="absolute right-0 z-40 mt-2 w-[200px] rounded-[18px] border border-border bg-card p-2 shadow-[0_20px_40px_rgba(15,23,40,0.12)]">
                        <button
                          onClick={() => { const text = `Comparei ${selectedTickers.join(" vs ")} no Analiso! `; window.open(`https://wa.me/?text=${encodeURIComponent(text + window.location.href)}`, "_blank"); setShareOpen(false); }}
                          className="flex w-full items-center gap-2 rounded-[12px] px-3 py-2 text-left text-[12px] text-muted-foreground transition hover:bg-muted"
                        >
                          WhatsApp
                        </button>
                        <button
                          onClick={() => { navigator.clipboard.writeText(`Comparei ${selectedTickers.join(" vs ")} no Analiso!\n${window.location.href}`).then(() => { setShareOpen(false); setToast("Link copiado!"); }); }}
                          className="flex w-full items-center gap-2 rounded-[12px] px-3 py-2 text-left text-[12px] text-muted-foreground transition hover:bg-muted"
                        >
                          <Link2 className="h-3.5 w-3.5" />
                          Copiar link
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* ── Empty state ── */}
            {!canCompare ? (
              <section className="compare-island compare-surface p-10 text-center">
                <h2 className="text-[28px] font-semibold tracking-[-0.02em] text-foreground">
                  Selecione duas empresas para comparar
                </h2>
                <p className="mx-auto mt-3 max-w-[640px] text-[15px] leading-7 text-muted-foreground">
                  Adicione Empresa A e Empresa B para ver quem está melhor hoje, onde está o risco e como confirmar.
                </p>
                <div className="mt-6 flex flex-wrap justify-center gap-2">
                  {["WEGE3", "VALE3", "ITUB4"].map((ticker) => (
                    <button
                      key={ticker}
                      onClick={() => addTicker(ticker)}
                      className="rounded-full border border-border bg-muted px-4 py-2 text-[12px] font-medium text-muted-foreground transition hover:bg-card"
                    >
                      {ticker}
                    </button>
                  ))}
                </div>
              </section>
            ) : refreshing ? (
              <LoadingBlocks />
            ) : enrichedA && enrichedB && a && b ? (
              <div className="space-y-8">
                {/* ── Section navigation (sticky horizontal) ── */}
                <nav className="sticky top-[120px] z-20 -mx-2 mb-2">
                  <div className="flex items-center gap-1 overflow-x-auto rounded-2xl border border-border bg-card/95 px-2 py-1.5 shadow-sm backdrop-blur-sm scrollbar-hide">
                    {SECTIONS.map((s) => (
                      <button
                        key={s.id}
                        onClick={() => navigateToSection(s.id)}
                        className={`shrink-0 rounded-lg px-3 py-1.5 text-[11px] font-medium transition-colors ${
                          activeSection === s.id
                            ? "bg-brand/10 text-brand"
                            : "text-muted-foreground hover:bg-muted hover:text-foreground"
                        }`}
                      >
                        {s.label}
                      </button>
                    ))}
                  </div>
                </nav>

                {/* ── ILHA 1: Snowflake Dual ── */}
                {scoreboard && (
                  <section id="snowflake" className="compare-island compare-stagger-1 scroll-mt-[160px]">
                    <SnowflakeDual a={enrichedA} b={enrichedB} scoreboard={scoreboard} />
                  </section>
                )}

                {/* ── ILHA 2: Veredito Inteligente ── */}
                {verdict && scoreboard && (
                  <section id="veredito" ref={verdictRef} className="compare-island compare-stagger-2 scroll-mt-[160px]">
                    <VerdictIsland verdict={verdict} scoreboard={scoreboard} formatNumber={formatNumber} />
                  </section>
                )}

                {/* ── ILHA 3: Top 3 Fatores Separadores ── */}
                <section id="fatores" className="compare-island compare-stagger-3 scroll-mt-[160px]">
                  <TopFactorsIsland
                    a={enrichedA}
                    b={enrichedB}
                    topPillarDiffs={topPillarDiffs}
                    PILLAR_LABEL={PILLAR_LABEL}
                    formatNumber={formatNumber}
                    pillarInsight={pillarInsight}
                    trendContext={trendContext}
                    activePillar={activePillar}
                    onSelectPillar={selectPillar}
                  />
                </section>

                {/* ── ILHA 4: Valuation Side-by-Side ── */}
                <section id="valuation" className="compare-island compare-stagger-4 compare-surface p-6 scroll-mt-[160px]">
                  <ValuationIsland a={enrichedA} b={enrichedB} formatNumber={formatNumber} />
                </section>

                {/* ── ILHA 5: Crescimento Futuro ── */}
                <section id="crescimento" className="compare-island compare-stagger-5 compare-surface p-6 scroll-mt-[160px]">
                  <GrowthIsland a={enrichedA} b={enrichedB} formatNumber={formatNumber} />
                </section>

                {/* ── ILHA 6: Desempenho Passado ── */}
                <section id="passado" className="compare-island compare-stagger-6 compare-surface p-6 scroll-mt-[160px]">
                  <PastIsland a={enrichedA} b={enrichedB} formatNumber={formatNumber} />
                </section>

                {/* ── ILHA 7: Saúde Financeira ── */}
                <section id="saude" className="compare-island compare-surface p-6 scroll-mt-[160px]">
                  <HealthIsland a={enrichedA} b={enrichedB} formatNumber={formatNumber} />
                </section>

                {/* ── ILHA 8: Dividendos ── */}
                <section id="dividendos" className="compare-island compare-surface p-6 scroll-mt-[160px]">
                  <DividendIsland a={enrichedA} b={enrichedB} formatNumber={formatNumber} />
                </section>

                {/* ── ILHA 9: Métricas Detalhadas ── */}
                <section id="metricas" ref={detailRef} className="compare-island compare-surface p-6 scroll-mt-[160px]">
                  <MetricsTableIsland
                    a={enrichedA}
                    b={enrichedB}
                    tableRows={tableRows}
                    activePillar={activePillar}
                    PILLAR_LABEL={PILLAR_LABEL}
                    formatMetric={formatMetric}
                    formatNumber={formatNumber}
                    metricWinner={metricWinner}
                    metricDelta={metricDelta}
                    evidenceReadLabel={evidenceReadLabel}
                    openEvidence={openEvidence}
                    activePillarWinnerSummary={activePillarWinnerSummary}
                  />
                </section>

                {/* ── ILHA 10: Timeline de Eventos ── */}
                <section id="timeline" className="compare-island compare-surface p-6 scroll-mt-[160px]">
                  <TimelineIsland
                    a={enrichedA}
                    b={enrichedB}
                    events={recentEvents}
                    PILLAR_LABEL={PILLAR_LABEL}
                  />
                </section>

                {/* ── ILHA 11: Fontes & Qualidade ── */}
                <section id="fontes" className="compare-island compare-surface p-6 scroll-mt-[160px]">
                  <SourcesIsland a={enrichedA} b={enrichedB} qualityTone={qualityTone} />
                </section>
              </div>
            ) : null}
          </div>
        </div>
      </MainContent>

      <CompareEvidenceDrawer data={evidence} onClose={() => setEvidence(null)} formatMetric={formatMetric} />

      {toast ? (
        <div className="fixed bottom-5 right-5 z-50 rounded-full border border-brand-border bg-card px-4 py-2 text-[12px] font-medium text-brand-text shadow-[0_18px_36px_rgba(15,23,40,0.12)] dark:shadow-none">
          {toast}
        </div>
      ) : null}
    </div>
  );
}

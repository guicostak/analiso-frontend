'use client';

import React, { useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import { useParams } from 'next/navigation';
import { AlertTriangle, FileDown, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { fetchAnalysisCoreData, trackAnalysis } from '../services';
import { downloadAnalysisReport } from '../services/pdfReport';
import type { SectionName } from '../services';
import { TABS, DIMENSION_COLORS } from '../constants/colors';
import { useAnalysis } from '../hooks/useAnalysis';
import { useAnalysisNav } from '../hooks/useAnalysisNav';
import { useAnalysisPageState } from '../hooks/useAnalysisPageState';
import { Sidebar } from '@/src/components/layout/Sidebar';
import { AppTopBar } from '@/src/components/layout/AppTopBar';
import { MainContent } from '@/src/components/layout/MainContent';
import { OverviewTab } from './OverviewTab';
import { ScoreChecks, ScoreIndicator, getScoreColor } from './ScoreDots';
import { AnalysisActionButtons } from './AnalysisActionButtons';
import { LoadingState } from '@/src/components/feedback';

// Lazy-load heavy tabs — only OverviewTab is eagerly loaded (first visible section)
const ValueTab = dynamic(() => import('./ValueTab').then(m => ({ default: m.ValueTab })), { ssr: false });
const FutureTab = dynamic(() => import('./FutureTab').then(m => ({ default: m.FutureTab })), { ssr: false });
const PastTab = dynamic(() => import('./PastTab').then(m => ({ default: m.PastTab })), { ssr: false });
const HealthTab = dynamic(() => import('./HealthTab').then(m => ({ default: m.HealthTab })), { ssr: false });
const DividendTab = dynamic(() => import('./DividendTab').then(m => ({ default: m.DividendTab })), { ssr: false });
const SourcesTab = dynamic(() => import('./SourcesTab').then(m => ({ default: m.SourcesTab })), { ssr: false });

// DESIGN CHANGE — Section divider with dimension-colored accent bar, gradient line, and score meter
function SectionDivider({ label, dimensionId, score, total = 6 }: { label: string; dimensionId?: string; score?: number; total?: number }) {
  const accentColor = dimensionId ? DIMENSION_COLORS[dimensionId] : undefined;
  return (
    <div className="analysis-divider mb-8">
      {accentColor && (
        <div
          className="analysis-section-accent"
          style={{ backgroundColor: accentColor }}
        />
      )}
      <div className="flex items-center gap-4">
        <h2
          className="text-lg font-bold uppercase tracking-wide whitespace-nowrap"
          style={{ color: accentColor ?? 'var(--muted-foreground)', letterSpacing: '0.06em' }}
        >
          {label}
        </h2>
        {score != null && (
          <ScoreChecks score={score} total={total} size="md" showLabel />
        )}
      </div>
    </div>
  );
}

// ─── Main Page Component ─────────────────────────────────────────────────────

// Map tab IDs to section API names
const TAB_TO_SECTION: Record<string, SectionName> = {
  value: 'value',
  future: 'future',
  past: 'past',
  health: 'health',
  dividend: 'dividend',
};

// Skeleton placeholder for sections that haven't loaded yet
function SectionSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="h-4 bg-muted rounded w-3/4" />
      <div className="h-32 bg-muted rounded" />
      <div className="h-4 bg-muted rounded w-1/2" />
      <div className="h-24 bg-muted rounded" />
    </div>
  );
}

export function AnalysisPage() {
  const params = useParams();
  const ticker = (params?.ticker as string ?? '').toUpperCase();

  // ── Data fetching with loading / error states ──────────────────────────
  const { data, loading, error, sectionsLoaded, fetchSection, ensureAllSectionsLoaded, setData, setLoading, setError } = useAnalysis(ticker);

  // ── Centralized UI state for all tabs ────────────────────────────────
  const pageState = useAnalysisPageState();

  // ── Active section tracking + scroll navigation ───────────────────────
  const { activeSection, companyCardPassed, companyCardRef, navAlignRef, sectionRefs, scrollToSection } = useAnalysisNav(!!data);

  // ── PDF report download ───────────────────────────────────────────────
  // Captures the rendered DOM section by section and assembles a PDF that
  // mirrors what the user is seeing. Forces light mode + waits for lazy
  // sections to mount and chart animations to settle before capturing.
  const [pdfLoading, setPdfLoading] = useState(false);

  const waitFrames = (n = 2) =>
    new Promise<void>(resolve => {
      const tick = (i: number) => {
        if (i <= 0) return resolve();
        requestAnimationFrame(() => tick(i - 1));
      };
      tick(n);
    });

  const sleep = (ms: number) => new Promise<void>(r => setTimeout(r, ms));

  const waitForSectionsRendered = async (ids: string[], timeoutMs = 6000) => {
    const start = Date.now();
    while (Date.now() - start < timeoutMs) {
      const allReady = ids.every(id => {
        const el = sectionRefs.current[id];
        // 240px ~ taller than the loading skeleton placeholder (~200px)
        return el && el.offsetHeight > 240;
      });
      if (allReady) return true;
      await sleep(120);
    }
    return false;
  };

  const handleDownloadPdf = async () => {
    if (pdfLoading || !data) return;
    setPdfLoading(true);
    trackAnalysis('analysis_pdf_clicked', { ticker });
    const toastId = toast.loading('Gerando relatório em PDF…');

    const html = document.documentElement;
    const wasDark = html.classList.contains('dark');

    try {
      // 1. Ensure all sections have data
      const fullData = (await ensureAllSectionsLoaded()) ?? data;

      // 2. Force light mode for capture so colors are correct on white paper
      if (wasDark) {
        html.classList.remove('dark');
        html.classList.add('light');
        await waitFrames(3);
      }

      // 3. Wait for lazy-loaded tab components to mount and render
      await waitForSectionsRendered(['value', 'future', 'past', 'health', 'dividend']);

      // 4. Extra delay so Recharts/Tremor finish their entrance animations
      await sleep(1600);
      await waitFrames(2);

      // 5. Capture and build the PDF
      const sections = ['overview', 'value', 'future', 'past', 'health', 'dividend', 'sources']
        .map(id => ({ id, el: sectionRefs.current[id] ?? null }));

      await downloadAnalysisReport({ data: fullData, sections });
      toast.success('Relatório baixado', { id: toastId });
      trackAnalysis('analysis_pdf_success', { ticker });
    } catch (err) {
      console.error('[AnalysisPage] PDF generation failed', err);
      toast.error('Não foi possível gerar o relatório', { id: toastId });
      trackAnalysis('analysis_pdf_failed', { ticker, error: String(err) });
    } finally {
      // Restore dark mode if it was active
      if (wasDark) {
        html.classList.add('dark');
        html.classList.remove('light');
      }
      setPdfLoading(false);
    }
  };

  // ── Telemetria: tab selecionada muda quando o user scrolla/clica ──────
  useEffect(() => {
    if (!data) return;
    trackAnalysis('analysis_tab_selected', { ticker, tab: activeSection });
  }, [activeSection, data, ticker]);

  // ── Trigger section fetches when sections come into view ──────────────
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    if (!data) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (!entry.isIntersecting) return;
          const id = entry.target.id.replace('section-', '');
          const section = TAB_TO_SECTION[id];
          if (section) fetchSection(section);
        });
      },
      { rootMargin: '200px 0px', threshold: 0 } // trigger 200px before visible
    );

    const sections = ['value', 'future', 'past', 'health', 'dividend'];
    sections.forEach(id => {
      const el = sectionRefs.current[id];
      if (el) observerRef.current!.observe(el);
    });

    return () => observerRef.current?.disconnect();
  }, [data, fetchSection, sectionRefs]);

  // ── Guard: loading or error before data arrives ───────────────────────
  if (loading || !data) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        {error ? (
          // DESIGN CHANGE — Refined error state with scale-in animation
          <div className="text-center space-y-5 max-w-sm mx-auto px-4 analysis-enter-scale">
            <div className="w-14 h-14 rounded-2xl bg-danger-surface border border-danger-border flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6 text-danger-text" />
            </div>
            <div className="space-y-1.5">
              <p className="text-base font-semibold text-foreground">Falha ao carregar análise</p>
              <p className="text-sm text-muted-foreground leading-relaxed">{error}</p>
            </div>
            <button
              onClick={() => { setError(null); setLoading(true); fetchAnalysisCoreData(ticker).then(r => { setData(r as typeof data); setLoading(false); }).catch(e => { setError(String(e?.message ?? e)); setLoading(false); }); }}
              className="px-5 py-2.5 rounded-xl bg-brand text-white text-sm font-medium hover:bg-brand-hover transition-colors"
            >
              Tentar novamente
            </button>
          </div>
        ) : (
          <LoadingState label={`Carregando análise de ${ticker}…`} inline />
        )}
      </div>
    );
  }

  // Map snowflake entries by dimension for section dividers
  const sfMap = Object.fromEntries(
    (data.snowflake ?? []).map(d => [d.dimension, d])
  );

  return (
    <div className="min-h-screen bg-background">

      <Sidebar currentPage="analysis" />
      <AppTopBar sidebarOffsetClassName="left-0 xl:left-[240px]" />

      {/* DESIGN CHANGE — Increased top padding for breathing room, refined spacing */}
      <MainContent className="px-4 pb-12 pt-20 xl:px-8">

      {/* ── Body ────────────────────────────────────────────────────────── */}
      <div className="max-w-[1400px] mx-auto py-8 flex gap-8 items-start">

        <aside
          className="w-48 flex-shrink-0 sticky top-[80px] self-start hidden xl:block"
        >
          {/* Company header — fades in when company card scrolls out of view */}
          {companyCardPassed && (
          <div
            className="px-3 pt-2 pb-3 mb-2 border-b border-border will-change-transform"
            style={{
              animation: 'sidebar-header-in 200ms ease both',
            }}
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 flex items-center justify-center flex-shrink-0">
                {data.company.logo
                  ? <img src={data.company.logo} alt={data.company.ticker} className="w-10 h-10 rounded-full object-cover" />
                  : <span className="text-[10px] font-bold text-muted-foreground font-mono">{data.company.ticker.slice(0, 4)}</span>
                }
              </div>
              <div className="min-w-0">
                <div className="text-[13px] font-bold text-foreground truncate leading-tight">{data.company.name}</div>
                <div className="text-[11px] text-muted-foreground font-mono">{data.company.ticker}</div>
              </div>
            </div>
            {/* Action buttons — toggle watchlist, share link, ir p/ compare, opt-in alerts */}
            <AnalysisActionButtons ticker={ticker} variant="compact" />
          </div>
          )}

          {/* Section navigation */}
          <div className="relative flex">
            <nav className="flex flex-col gap-0.5 flex-1">
              {TABS.map(tab => {
                const isActive = activeSection === tab.id;
                const dimColor = DIMENSION_COLORS[tab.id];
                const dimScore = data.snowflake?.find(d => d.dimension === tab.id);
                return (
                  <button
                    key={tab.id}
                    onClick={() => {
                      const section = TAB_TO_SECTION[tab.id];
                      if (section) fetchSection(section);
                      scrollToSection(tab.id);
                    }}
                    className="analysis-nav-item group"
                    style={{
                      ['--dim-color' as string]: dimColor ?? 'var(--muted-foreground)',
                      ...(isActive && dimColor
                        ? { backgroundColor: `${dimColor}18`, color: dimColor, fontWeight: 600 }
                        : {}),
                    }}
                  >
                    <span className="flex items-center justify-between gap-1.5 w-full">
                      <span className="truncate">{tab.label}</span>
                      {dimScore != null && (
                        <ScoreIndicator score={dimScore.score} total={dimScore.checks?.length ?? 6} size={16} />
                      )}
                    </span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* DESIGN CHANGE — Prominent brand-colored CTA below the section progress.
              Intentionally NOT grouped with the compact action buttons so it gets
              clear visual weight as a primary action. */}
          <button
            type="button"
            onClick={handleDownloadPdf}
            disabled={pdfLoading}
            className="mt-4 w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-brand text-white text-[13px] font-semibold shadow-sm hover:bg-brand-hover hover:shadow-md transition-all disabled:opacity-70 disabled:cursor-wait"
            aria-label="Baixar relatório em PDF"
          >
            {pdfLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Gerando…</span>
              </>
            ) : (
              <>
                <FileDown className="w-4 h-4" />
                <span>Baixar relatório (PDF)</span>
              </>
            )}
          </button>
        </aside>

        {/* DESIGN CHANGE — Main content with increased section gap for visual breathing room */}
        <div className="flex-1 min-w-0 space-y-24" style={{ maxWidth: 960 }}>

          {/* Overview — no divider, first section */}
          <section
            ref={el => { sectionRefs.current['overview'] = el; }}
            id="section-overview"
            className="analysis-enter"
          >
            <OverviewTab data={data} onSelectTab={scrollToSection} companyCardRef={companyCardRef} navAlignRef={navAlignRef} state={pageState.overview} />
          </section>

          {/* Each section loads its data independently via scroll trigger */}
          <section
            ref={el => { sectionRefs.current['value'] = el; }}
            id="section-value"
            className="analysis-enter analysis-stagger-1"
          >
            <SectionDivider label="Valuation" dimensionId="value" score={sfMap['value']?.score} total={sfMap['value']?.checks?.length ?? 6} />
            {sectionsLoaded.has('value') ? <ValueTab data={data} state={pageState.value} /> : <SectionSkeleton />}
          </section>

          <section
            ref={el => { sectionRefs.current['future'] = el; }}
            id="section-future"
            className="analysis-enter analysis-stagger-2"
          >
            <SectionDivider label="Crescimento Futuro" dimensionId="future" score={sfMap['future']?.score} total={sfMap['future']?.checks?.length ?? 6} />
            {sectionsLoaded.has('future') ? <FutureTab data={data} state={pageState.future} /> : <SectionSkeleton />}
          </section>

          <section
            ref={el => { sectionRefs.current['past'] = el; }}
            id="section-past"
            className="analysis-enter analysis-stagger-3"
          >
            <SectionDivider label="Performance Passada" dimensionId="past" score={sfMap['past']?.score} total={sfMap['past']?.checks?.length ?? 6} />
            {sectionsLoaded.has('past') ? <PastTab data={data} state={pageState.past} /> : <SectionSkeleton />}
          </section>

          <section
            ref={el => { sectionRefs.current['health'] = el; }}
            id="section-health"
            className="analysis-enter analysis-stagger-4"
          >
            <SectionDivider label="Saúde Financeira" dimensionId="health" score={sfMap['health']?.score} total={sfMap['health']?.checks?.length ?? 6} />
            {sectionsLoaded.has('health') ? <HealthTab data={data} state={pageState.health} /> : <SectionSkeleton />}
          </section>

          <section
            ref={el => { sectionRefs.current['dividend'] = el; }}
            id="section-dividend"
            className="analysis-enter analysis-stagger-5"
          >
            <SectionDivider label="Dividendos" dimensionId="dividend" score={sfMap['dividend']?.score} total={sfMap['dividend']?.checks?.length ?? 6} />
            {sectionsLoaded.has('dividend') ? <DividendTab data={data} state={pageState.dividend} /> : <SectionSkeleton />}
          </section>

          <section
            ref={el => { sectionRefs.current['sources'] = el; }}
            id="section-sources"
            className="analysis-enter analysis-stagger-6"
          >
            <SectionDivider label="Fontes de dados" dimensionId="sources" />
            <SourcesTab data={data} />
          </section>

        </div>
      </div>

      </MainContent>
    </div>
  );
}

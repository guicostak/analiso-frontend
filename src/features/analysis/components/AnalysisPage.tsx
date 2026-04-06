'use client';

import React, { useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import { useParams } from 'next/navigation';
import { AlertTriangle, Share2, GitCompareArrows, Bell, Bookmark } from 'lucide-react';
import { fetchAnalysisCoreData } from '../services';
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
  const { data, loading, error, sectionsLoaded, fetchSection, setData, setLoading, setError } = useAnalysis(ticker);

  // ── Centralized UI state for all tabs ────────────────────────────────
  const pageState = useAnalysisPageState();

  // ── Active section tracking + scroll navigation ───────────────────────
  const { activeSection, companyCardPassed, companyCardRef, navAlignRef, sectionRefs, scrollToSection } = useAnalysisNav(!!data);

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
          // DESIGN CHANGE — Chart skeleton loading animation
          <div className="text-center space-y-8 analysis-enter" style={{ width: 320 }}>
            {/* Skeleton chart bars */}
            <div className="relative flex items-end justify-center gap-2.5" style={{ height: 120 }}>
              {[65, 85, 45, 100, 55, 75, 90].map((h, i) => (
                <div
                  key={i}
                  className="analysis-skeleton-bar"
                  style={{ width: 24, height: `${h}%`, transformOrigin: 'bottom' }}
                />
              ))}
              <div className="analysis-skeleton-line" />
            </div>

            {/* Skeleton text lines */}
            <div className="space-y-3 px-4">
              <div className="analysis-skeleton-shimmer mx-auto" style={{ height: 14, width: '70%' }} />
              <div className="analysis-skeleton-shimmer mx-auto" style={{ height: 10, width: '50%' }} />
            </div>

            <p className="text-sm text-muted-foreground font-medium">Carregando análise de {ticker}…</p>
          </div>
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
            {/* Action buttons */}
            <div className="flex items-center gap-0.5">
              {[
                { icon: Bookmark, title: 'Watchlist' },
                { icon: Share2, title: 'Compartilhar' },
                { icon: GitCompareArrows, title: 'Comparar' },
                { icon: Bell, title: 'Alertas' },
              ].map(({ icon: Icon, title }) => (
                <button
                  key={title}
                  className="flex items-center justify-center w-8 h-8 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                  title={title}
                >
                  <Icon className="w-4 h-4" />
                </button>
              ))}
            </div>
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

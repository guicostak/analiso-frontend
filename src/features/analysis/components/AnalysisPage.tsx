'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import { ArrowLeft, AlertTriangle, MoreHorizontal } from 'lucide-react';
import Link from 'next/link';
import { fetchAnalysisData } from '../services';
import { TABS } from '../constants/colors';
import { useAnalysis } from '../hooks/useAnalysis';
import { useAnalysisNav } from '../hooks/useAnalysisNav';
import { FavoriteButton, pillarStatus } from './AnalysisShared';
import { OverviewTab } from './OverviewTab';
import { ValueTab } from './ValueTab';
import { FutureTab } from './FutureTab';
import { PastTab } from './PastTab';
import { HealthTab } from './HealthTab';
import { DividendTab } from './DividendTab';

// ─── Section Divider ─────────────────────────────────────────────────────────

function SectionDivider({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-4 mb-6">
      <h2 className="text-[13px] font-semibold text-neutral-400 uppercase tracking-widest whitespace-nowrap">
        {label}
      </h2>
      <div className="flex-1 h-px bg-neutral-200" />
    </div>
  );
}

// ─── Main Page Component ─────────────────────────────────────────────────────

export function AnalysisPage() {
  const params = useParams();
  const ticker = (params?.ticker as string ?? '').toUpperCase();

  // ── Data fetching with loading / error states ──────────────────────────
  const { data, loading, error, setData, setLoading, setError } = useAnalysis(ticker);

  // ── Active section tracking + scroll navigation ───────────────────────
  const { activeSection, companyCardPassed, sidebarMarginTop, companyCardRef, sectionRefs, scrollToSection } = useAnalysisNav(!!data);

  // ── Guard: loading or error before data arrives ───────────────────────
  if (loading || !data) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        {error ? (
          <div className="text-center space-y-4 max-w-sm mx-auto px-4">
            <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6 text-red-500" />
            </div>
            <p className="text-sm font-semibold text-foreground">Falha ao carregar análise</p>
            <p className="text-sm text-muted-foreground">{error}</p>
            <button
              onClick={() => { setError(null); setLoading(true); fetchAnalysisData(ticker).then(r => { setData(r); setLoading(false); }).catch(e => { setError(String(e?.message ?? e)); setLoading(false); }); }}
              className="px-4 py-2 rounded-lg bg-teal-600 text-white text-sm font-medium hover:bg-teal-700 transition-colors"
            >
              Tentar novamente
            </button>
          </div>
        ) : (
          <div className="text-center space-y-3">
            <div className="w-10 h-10 border-4 border-teal-200 border-t-teal-600 rounded-full animate-spin mx-auto" />
            <p className="text-sm text-muted-foreground font-medium">Carregando análise de {ticker}…</p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">

      {/* ── Top Bar ─────────────────────────────────────────────────────── */}
      <div className="sticky top-0 z-30 bg-card/80 backdrop-blur-md border-b border-border">
        <div className="max-w-[1400px] mx-auto px-4 py-3">
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="text-muted-foreground hover:text-neutral-700 transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center text-white font-bold text-xs">
                {ticker.slice(0, 2)}
              </div>
              <div>
                <div className="font-semibold text-foreground text-sm">{data.company.name}</div>
                <div className="text-xs text-muted-foreground">{data.company.exchange}:{ticker}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Body ────────────────────────────────────────────────────────── */}
      <div className="max-w-[1400px] mx-auto px-4 py-6 flex gap-6 items-start">

        {/* Left Sidebar — sticky nav */}
        <aside
          className="w-48 flex-shrink-0 sticky top-[64px] self-start"
          style={{ marginTop: sidebarMarginTop }}
        >
          {/* Mini company header — aparece ao scrollar */}
          <div
            className="transition-all duration-300"
            style={{
              opacity: companyCardPassed ? 1 : 0,
              transform: companyCardPassed ? 'translateY(0)' : 'translateY(-8px)',
              pointerEvents: companyCardPassed ? 'auto' : 'none',
              visibility: companyCardPassed ? 'visible' : 'hidden',
            }}
          >
            <div className="px-4 pt-4 pb-3 border-b border-border mb-1">
              {/* Logo + nome */}
              <div className="flex items-center gap-3 mb-3">
                <div className="w-11 h-11 rounded-xl bg-muted flex items-center justify-center overflow-hidden flex-shrink-0">
                  {data.company.logo
                    ? <img src={data.company.logo} alt={data.company.ticker} className="w-9 h-9 object-contain" />
                    : <span className="text-[10px] font-bold text-muted-foreground font-mono">{data.company.ticker.slice(0, 4)}</span>
                  }
                </div>
                <div className="min-w-0">
                  <div className="text-[13px] font-bold text-foreground truncate">{data.company.name}</div>
                  <div className="text-[11px] text-muted-foreground font-mono">{data.company.ticker}</div>
                </div>
              </div>
              <div className="flex items-center gap-1.5 relative">
                <FavoriteButton ticker={data.company.ticker} />
                <button
                  className="flex items-center justify-center w-8 h-8 rounded-lg text-muted-foreground hover:text-neutral-700 hover:bg-hover transition-colors"
                  title="Mais opções"
                >
                  <MoreHorizontal className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          <nav className="flex flex-col">
            {TABS.map(tab => {
              const isActive = activeSection === tab.id;
              const dim = tab.id !== 'overview'
                ? data.snowflake.find(d => d.dimension === tab.id)
                : null;
              const status = dim ? pillarStatus(dim.score) : null;
              return (
                <button
                  key={tab.id}
                  onClick={() => scrollToSection(tab.id)}
                  className={`flex items-center justify-between pl-4 pr-3 py-2.5 text-sm font-medium transition-all text-left border-l-2 ${
                    isActive
                      ? 'border-brand text-foreground bg-brand-surface/60'
                      : 'border-transparent text-muted-foreground hover:text-neutral-800 hover:bg-hover'
                  }`}
                >
                  <span className="truncate">{tab.label}</span>
                  {status && (
                    <span
                      className={`w-2 h-2 rounded-full flex-shrink-0 ${status.dot}`}
                      title={status.label}
                    />
                  )}
                </button>
              );
            })}
          </nav>
        </aside>

        {/* Main Content — all sections stacked in scroll */}
        <div className="flex-1 min-w-0 space-y-20" style={{ maxWidth: 960 }}>

          <section
            ref={el => { sectionRefs.current['overview'] = el; }}
            id="section-overview"
          >
            <OverviewTab data={data} onSelectTab={scrollToSection} companyCardRef={companyCardRef} />
          </section>

          <section
            ref={el => { sectionRefs.current['value'] = el; }}
            id="section-value"
          >
            <SectionDivider label="Valuation" />
            <ValueTab data={data} />
          </section>

          <section
            ref={el => { sectionRefs.current['future'] = el; }}
            id="section-future"
          >
            <SectionDivider label="Crescimento Futuro" />
            <FutureTab data={data} />
          </section>

          <section
            ref={el => { sectionRefs.current['past'] = el; }}
            id="section-past"
          >
            <SectionDivider label="Performance Passada" />
            <PastTab data={data} />
          </section>

          <section
            ref={el => { sectionRefs.current['health'] = el; }}
            id="section-health"
          >
            <SectionDivider label="Saúde Financeira" />
            <HealthTab data={data} />
          </section>

          <section
            ref={el => { sectionRefs.current['dividend'] = el; }}
            id="section-dividend"
          >
            <SectionDivider label="Dividendos" />
            <DividendTab data={data} />
          </section>

        </div>
      </div>
    </div>
  );
}

'use client';

/**
 * AnalysisPreviewPage — pre-login showcase of the /analysis experience.
 *
 * Renders a real analysis (same data source as the logged-in page) but only
 * the "free" sections are visible. The deeper sections (DCF detail, growth
 * detail, health, dividends) stay blurred behind a signup CTA.
 *
 * Mounted by:
 *   - /analysis             → uses DEFAULT_TICKER (WEGE3) as showcase
 *   - /analysis/[ticker]    → when the visitor is NOT authenticated
 *
 * Pre-login screen → forces light theme via ForceLightTheme.
 */

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowRight,
  ArrowUpRight,
  CheckCircle2,
  Loader2,
  Lock,
  Minus,
  Search,
  Shield,
  Sparkles,
  TrendingDown,
  TrendingUp,
} from 'lucide-react';
import { AreaChart } from '@tremor/react';
import { ForceLightTheme } from '@/src/components/layout/ForceLightTheme';
import { LandingNav } from '@/src/components/layout/LandingNav';
import { SnowflakeChart, type SnowflakeDimension } from '@/src/components/shared/SnowflakeChart';
import { useAuth } from '@/src/features/auth/AuthContext';
import { fetchAnalysisCoreData } from '../services';
import type { AnalysisData } from '../interfaces';
import { DIMENSION_COLORS } from '../constants/colors';

export const DEFAULT_PREVIEW_TICKER = 'WEGE3';

// Long labels for the pillar list (full description), short labels for the
// snowflake chart axes (single words so they don't overflow the SVG box).
const PILLAR_LABELS: Record<string, string> = {
  value:    'Valuation',
  future:   'Crescimento Futuro',
  past:     'Performance Passada',
  health:   'Saúde Financeira',
  dividend: 'Dividendos',
};

const PILLAR_LABELS_SHORT: Record<string, string> = {
  value:    'Valuation',
  future:   'Futuro',
  past:     'Passado',
  health:   'Saúde',
  dividend: 'Dividendos',
};

// ─── Building blocks ─────────────────────────────────────────────────────────

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-[#D8EEE9] bg-brand-surface px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-brand">
      {children}
    </span>
  );
}

function PrimaryCta({ label = 'Criar conta grátis', className = '' }: { label?: string; className?: string }) {
  return (
    <a
      href="/login"
      className={`inline-flex items-center justify-center gap-2 rounded-2xl border border-[#0f9f8f] bg-[#0f9f8f] px-6 py-3.5 text-[14px] font-semibold text-white shadow-sm transition-all duration-200 hover:border-[#18b6a4] hover:bg-[#18b6a4] hover:shadow-md focus:outline-none focus:ring-2 focus:ring-[#bfeee6] focus:ring-offset-2 active:scale-[0.98] ${className}`}
    >
      {label}
      <ArrowRight className="h-4 w-4" />
    </a>
  );
}

/**
 * BlurredSection — wraps content with a heavy blur and overlays a centered
 * CTA card. Inner content stays in the DOM (helps SEO + layout) but is fully
 * non-interactive: pointer-events-none, aria-hidden, tabIndex -1.
 *
 * The section has a fixed min-height so the CTA card always sits inside its
 * own bounds (and never visually leaks into the next section).
 */
function BlurredSection({
  badge,
  title,
  description,
  ctaLabel = 'Desbloquear análise completa',
  children,
}: {
  badge: string;
  title: string;
  description: string;
  ctaLabel?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="relative min-h-[360px] overflow-hidden rounded-3xl border border-border bg-card shadow-sm max-md:min-h-[420px]">
      {/* Blurred preview content underneath */}
      <div
        aria-hidden
        tabIndex={-1}
        className="pointer-events-none absolute inset-0 select-none overflow-hidden p-6 [filter:blur(8px)] [transform:translateZ(0)]"
      >
        <div className="mx-auto max-w-[640px]">{children}</div>
      </div>

      {/* Top/bottom fade so the blurred content melts into the card edges */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-card to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-card to-transparent" />

      {/* Centered CTA card */}
      <div className="relative z-10 flex min-h-[360px] items-center justify-center px-4 py-8 max-md:min-h-[420px]">
        <div className="w-full max-w-[440px] rounded-2xl border border-border bg-card/95 px-6 py-6 text-center shadow-[0_10px_40px_-12px_rgba(15,159,143,0.25)] backdrop-blur-sm">
          <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-brand-surface text-brand">
            <Lock className="h-5 w-5" />
          </div>
          <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-brand">{badge}</span>
          <h3 className="mt-1 text-[18px] font-bold text-foreground">{title}</h3>
          <p className="mt-2 text-[13px] leading-relaxed text-muted-foreground">{description}</p>
          <PrimaryCta label={ctaLabel} className="mt-4 w-full" />
          <p className="mt-2.5 text-[11px] text-muted-foreground">Grátis para sempre. Sem cartão de crédito.</p>
        </div>
      </div>
    </section>
  );
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatBRL(v: number | undefined | null): string {
  if (v == null || Number.isNaN(v)) return '—';
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function formatPct(v: number | undefined | null, withSign = true): string {
  if (v == null || Number.isNaN(v)) return '—';
  const sign = withSign && v > 0 ? '+' : '';
  return `${sign}${v.toFixed(1)}%`;
}

// ─── Main page ───────────────────────────────────────────────────────────────

export interface AnalysisPreviewPageProps {
  ticker?: string;
}

export function AnalysisPreviewPage({ ticker: tickerProp }: AnalysisPreviewPageProps = {}) {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuth();

  const ticker = (tickerProp ?? DEFAULT_PREVIEW_TICKER).toUpperCase();

  // Authenticated users get bounced into the real analysis page
  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      router.replace(`/analysis/${ticker}`);
    }
  }, [authLoading, isAuthenticated, router, ticker]);

  // ── Fetch real core data for the requested ticker ────────────────────
  const [data, setData] = useState<Partial<AnalysisData> | null>(null);
  const [loading, setLoading] = useState(true);
  const [errored, setErrored] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setErrored(false);
    fetchAnalysisCoreData(ticker)
      .then(d => { if (!cancelled) { setData(d); setLoading(false); } })
      .catch(() => { if (!cancelled) { setErrored(true); setLoading(false); } });
    return () => { cancelled = true; };
  }, [ticker]);

  // ── Derive view-model from real data with safe fallbacks ─────────────
  const company = data?.company;
  const valuation = data?.valuation;
  const priceHistory = data?.priceHistory;

  const snowflakeForChart: SnowflakeDimension[] = useMemo(() => {
    const items = data?.snowflake ?? [];
    if (!items.length) {
      return [
        { label: 'Valuation',  value: 50 },
        { label: 'Futuro',     value: 50 },
        { label: 'Passado',    value: 50 },
        { label: 'Saúde',      value: 50 },
        { label: 'Dividendos', value: 50 },
      ];
    }
    // Use SHORT labels here so they don't overflow the SVG box.
    return items.map(d => ({
      label: PILLAR_LABELS_SHORT[d.dimension] ?? d.displayName ?? d.dimension,
      value: d.normalizedScore ?? (d.score / 6) * 100,
    }));
  }, [data?.snowflake]);

  const priceSeries = useMemo(() => {
    const series = priceHistory?.series ?? [];
    if (!series.length) return [];
    const step = Math.max(1, Math.floor(series.length / 24));
    return series
      .filter((_, i) => i % step === 0)
      .map(p => ({ date: p.date, Preço: p.price }));
  }, [priceHistory?.series]);

  const oneYearReturn = priceHistory?.return1y;
  const fairValue = valuation?.fairValue;
  const currentPrice = valuation?.currentPrice;
  // Compute the gap ourselves — backend's `discountPercent` was sometimes
  // returning a decimal (e.g. -0.67) which rendered as "-0.7%" instead of -67%.
  const discountPct = useMemo(() => {
    if (!fairValue || !currentPrice) return null;
    return ((fairValue - currentPrice) / currentPrice) * 100;
  }, [fairValue, currentPrice]);

  // ── Real data for the visible "taste" charts ─────────────────────────
  const priceScenarios = useMemo(() => {
    const list = data?.priceScenarios ?? [];
    if (!list.length || !currentPrice) return [];
    const sorted = [...list].sort((a, b) => a.estimatedValue - b.estimatedValue);
    const min = Math.min(currentPrice, ...sorted.map(s => s.estimatedValue));
    const max = Math.max(currentPrice, ...sorted.map(s => s.estimatedValue));
    const range = Math.max(max - min, 1);
    return sorted.map(s => ({
      ...s,
      pct: ((s.estimatedValue - min) / range) * 100,
      gap: ((s.estimatedValue - currentPrice) / currentPrice) * 100,
    }));
  }, [data?.priceScenarios, currentPrice]);

  const currentPricePct = useMemo(() => {
    if (!priceScenarios.length || !currentPrice) return 0;
    const min = Math.min(currentPrice, ...priceScenarios.map(s => s.estimatedValue));
    const max = Math.max(currentPrice, ...priceScenarios.map(s => s.estimatedValue));
    const range = Math.max(max - min, 1);
    return ((currentPrice - min) / range) * 100;
  }, [priceScenarios, currentPrice]);

  const rewards = (data?.rewardsAndRisks ?? []).filter(r => r.type === 'reward').slice(0, 3);
  const risks   = (data?.rewardsAndRisks ?? []).filter(r => r.type === 'risk').slice(0, 3);

  // ── Auth still loading: render nothing (matches LandingPage pattern) ─
  if (authLoading || isAuthenticated) return null;

  return (
    <div className="min-h-screen bg-card text-foreground">
      <ForceLightTheme />
      <LandingNav />

      <main className="mx-auto max-w-[1100px] px-5 pb-24 pt-10 max-md:px-4 max-md:pt-6">

        {/* ─── Hero ──────────────────────────────────────────────────────── */}
        <section className="text-center">
          <Badge>
            <Sparkles className="h-3 w-3" />
            Prévia gratuita
          </Badge>
          <h1 className="mx-auto mt-4 max-w-[720px] text-[44px] font-semibold leading-[1.05] tracking-[-0.02em] text-foreground max-md:text-[32px]">
            Análise de <span className="text-brand">{ticker}</span> em segundos
          </h1>
          <p className="mx-auto mt-4 max-w-[560px] text-[16px] leading-relaxed text-muted-foreground">
            Esta é uma amostra real de como a Analiso entrega 5 pilares fundamentalistas, gráficos e leitura
            guiada. Crie uma conta grátis para desbloquear a análise completa.
          </p>

          <a
            href="/login"
            className="mx-auto mt-7 flex max-w-[460px] items-center gap-3 rounded-2xl border border-border bg-muted/60 px-4 py-3 text-left shadow-sm transition-all hover:border-[#0f9f8f]/40 hover:bg-card hover:shadow-md"
          >
            <Search className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
            <span className="flex-1 text-[13px] text-muted-foreground">Buscar PETR4, VALE3, ITUB4…</span>
            <span className="rounded-lg bg-brand px-2.5 py-1 text-[11px] font-semibold text-white">Entrar</span>
          </a>
        </section>

        {/* ─── Sample company card ──────────────────────────────────────── */}
        <section className="mt-12 rounded-3xl border border-border bg-card p-6 shadow-sm max-md:p-5">
          {loading ? (
            <div className="flex items-center justify-center py-16 text-muted-foreground">
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Carregando análise de {ticker}…
            </div>
          ) : errored || !company ? (
            <div className="py-12 text-center">
              <p className="text-[14px] font-semibold text-foreground">Não foi possível carregar a análise de {ticker}.</p>
              <p className="mt-2 text-[13px] text-muted-foreground">
                Crie uma conta grátis para acessar análises de mais de 400 ações da B3.
              </p>
              <PrimaryCta className="mt-5" />
            </div>
          ) : (
            <>
              <div className="flex flex-wrap items-start justify-between gap-x-6 gap-y-4 border-b border-border pb-5">
                <div className="flex min-w-0 items-center gap-4">
                  <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-border bg-muted">
                    {company.logo
                      ? <img src={company.logo} alt={company.name} className="h-full w-full object-contain" />
                      : <span className="font-mono text-[13px] font-bold text-muted-foreground">{company.ticker.slice(0, 4)}</span>
                    }
                  </div>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-[20px] font-bold text-foreground max-md:text-[18px]">{company.name}</h2>
                      <span className="rounded-md bg-muted px-2 py-0.5 font-mono text-[11px] font-semibold text-muted-foreground">
                        {company.ticker}
                      </span>
                    </div>
                    <p className="text-[12px] text-muted-foreground">
                      {company.sector}{company.industry ? ` · ${company.industry}` : ''}
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap items-start gap-x-6 gap-y-3 max-md:w-full">
                  <div className="max-md:flex-1">
                    <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Preço</p>
                    <p className="text-[18px] font-bold text-foreground">{formatBRL(currentPrice)}</p>
                  </div>
                  <div className="max-md:flex-1">
                    <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Preço justo</p>
                    <div className="flex flex-wrap items-center gap-x-1.5 gap-y-1">
                      <span className="text-[18px] font-bold text-foreground">{formatBRL(fairValue)}</span>
                      {discountPct != null && (
                        <span
                          className={`inline-flex items-center gap-0.5 rounded-md px-1.5 py-0.5 text-[11px] font-semibold ${
                            discountPct > 5
                              ? 'bg-success-surface text-success-text'
                              : discountPct < -5
                              ? 'bg-danger-surface text-danger-text'
                              : 'bg-warning-surface text-warning-text'
                          }`}
                        >
                          {discountPct > 0 ? <TrendingUp className="h-3 w-3" /> : discountPct < 0 ? <TrendingDown className="h-3 w-3" /> : <Minus className="h-3 w-3" />}
                          {formatPct(discountPct)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Snowflake + pillars summary */}
              <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(280px,320px)_1fr] lg:gap-10">
                <div className="flex flex-col items-center justify-center px-6 lg:px-2">
                  <div className="w-full overflow-visible">
                    <SnowflakeChart dimensions={snowflakeForChart} size="large" status="healthy" className="mx-auto" />
                  </div>
                  <p className="mt-3 text-center text-[11px] text-muted-foreground">5 pilares fundamentalistas</p>
                </div>

                <div className="space-y-3">
                  {(data?.snowflake ?? []).map((p) => {
                    const color = DIMENSION_COLORS[p.dimension] ?? '#0f9f8f';
                    const total = p.checks?.length ?? 6;
                    return (
                      <div
                        key={p.dimension}
                        className="rounded-2xl border border-border bg-muted/40 px-4 py-3 transition-colors hover:bg-muted/70"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-2">
                            <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: color }} />
                            <span className="text-[13px] font-semibold text-foreground">
                              {PILLAR_LABELS[p.dimension] ?? p.displayName}
                            </span>
                          </div>
                          <span className="font-mono text-[12px] font-semibold" style={{ color }}>
                            {p.score}/{total}
                          </span>
                        </div>
                        {p.summary && (
                          <p className="mt-1 pl-[18px] text-[12px] leading-relaxed text-muted-foreground line-clamp-2">
                            {p.summary}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          )}
        </section>

        {/* ─── Visible: price chart + key metrics ───────────────────────── */}
        {!loading && !errored && data && (
          <>
            <section className="mt-10 rounded-3xl border border-border bg-card p-6 shadow-sm">
              <div className="mb-3 flex items-center justify-between gap-3">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">Histórico de preço</p>
                  <h3 className="mt-1 text-[15px] font-bold text-foreground">{ticker} no último período</h3>
                </div>
                {oneYearReturn != null && (
                  <span
                    className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-[11px] font-semibold ${
                      oneYearReturn >= 0
                        ? 'bg-brand-surface text-brand'
                        : 'bg-danger-surface text-danger-text'
                    }`}
                  >
                    <TrendingUp className="h-3 w-3" />
                    {formatPct(oneYearReturn)} em 12m
                  </span>
                )}
              </div>
              {priceSeries.length > 0 ? (
                <AreaChart
                  data={priceSeries}
                  index="date"
                  categories={['Preço']}
                  colors={['teal']}
                  showLegend={false}
                  showYAxis={false}
                  showGridLines={false}
                  valueFormatter={(v: number) => formatBRL(v)}
                  className="h-56"
                />
              ) : (
                <div className="flex h-56 items-center justify-center text-[13px] text-muted-foreground">
                  Sem histórico de preço disponível.
                </div>
              )}
            </section>

            <section className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
                <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Preço atual</p>
                <p className="mt-1 text-[22px] font-bold text-foreground">{formatBRL(currentPrice)}</p>
                <p className="mt-0.5 text-[11px] text-muted-foreground">{company?.exchange ?? 'B3'}</p>
              </div>
              <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
                <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Preço justo</p>
                <p className="mt-1 text-[22px] font-bold text-foreground">{formatBRL(fairValue)}</p>
                <p className="mt-0.5 text-[11px] text-muted-foreground">Modelo {valuation?.model ?? 'DCF'}</p>
              </div>
              <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
                <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Retorno 12m</p>
                <p className="mt-1 text-[22px] font-bold text-foreground">{formatPct(oneYearReturn)}</p>
                <p className="mt-0.5 text-[11px] text-muted-foreground">vs Ibovespa {formatPct(priceHistory?.marketReturn1y)}</p>
              </div>
              <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
                <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Market cap</p>
                <p className="mt-1 text-[22px] font-bold text-foreground">{company?.marketCap ?? '—'}</p>
                <p className="mt-0.5 text-[11px] text-muted-foreground">{company?.currency ?? 'BRL'}</p>
              </div>
            </section>

            {/* ─── Price scenarios (real DCF data) ────────────────────── */}
            {priceScenarios.length > 0 && (
              <section className="mt-6 rounded-3xl border border-border bg-card p-6 shadow-sm">
                <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">Cenários de valuation</p>
                    <h3 className="mt-1 text-[15px] font-bold text-foreground">DCF — preço justo por cenário</h3>
                  </div>
                  <span className="rounded-lg bg-muted px-2.5 py-1 text-[11px] font-medium text-muted-foreground">
                    Modelo {valuation?.model ?? 'DCF'}
                  </span>
                </div>

                {/* Bullet bar with conservative / base / optimistic markers + current price */}
                <div className="relative px-2 pt-8 pb-2">
                  {/* Current price marker on top */}
                  <div
                    className="pointer-events-none absolute top-0 z-[2] -translate-x-1/2 whitespace-nowrap rounded-md border border-border bg-card px-2 py-0.5 text-[11px] font-semibold text-foreground shadow-sm"
                    style={{ left: `${Math.min(Math.max(currentPricePct, 4), 96)}%` }}
                  >
                    Atual {formatBRL(currentPrice)}
                  </div>
                  {/* Track */}
                  <div className="relative h-3 rounded-full bg-gradient-to-r from-danger-surface via-warning-surface to-success-surface">
                    {/* Vertical line for current price */}
                    <div
                      className="absolute -top-1 h-5 w-0.5 -translate-x-1/2 rounded-full bg-foreground"
                      style={{ left: `${Math.min(Math.max(currentPricePct, 0), 100)}%` }}
                    />
                    {/* Scenario dots */}
                    {priceScenarios.map((s) => (
                      <div
                        key={s.key}
                        className="absolute top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-card bg-foreground shadow"
                        style={{ left: `${s.pct}%` }}
                        title={`${s.label}: ${formatBRL(s.estimatedValue)}`}
                      />
                    ))}
                  </div>
                </div>

                <div className="mt-5 grid gap-3 sm:grid-cols-3">
                  {priceScenarios.map((s) => {
                    const isPositive = s.gap >= 0;
                    return (
                      <div key={s.key} className="rounded-2xl border border-border bg-muted/40 p-4">
                        <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">{s.label}</p>
                        <p className="mt-1 text-[20px] font-bold text-foreground">{formatBRL(s.estimatedValue)}</p>
                        <p
                          className={`mt-1 inline-flex items-center gap-0.5 text-[11px] font-semibold ${
                            isPositive ? 'text-success-text' : 'text-danger-text'
                          }`}
                        >
                          {isPositive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                          {formatPct(s.gap)} vs atual
                        </p>
                      </div>
                    );
                  })}
                </div>
              </section>
            )}

            {/* ─── Rewards & risks (real data, side by side) ──────────── */}
            {(rewards.length > 0 || risks.length > 0) && (
              <section className="mt-6 grid gap-4 md:grid-cols-2">
                <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
                  <div className="mb-3 flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-success-surface text-success-text">
                      <Sparkles className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">Recompensas</p>
                      <h3 className="text-[14px] font-bold text-foreground">Pontos fortes</h3>
                    </div>
                  </div>
                  <ul className="space-y-2.5">
                    {rewards.length > 0 ? rewards.map((r, i) => (
                      <li key={i} className="flex gap-2 text-[13px] leading-relaxed text-foreground">
                        <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-success-text" />
                        <span>{r.text}</span>
                      </li>
                    )) : (
                      <li className="text-[13px] text-muted-foreground">Sem recompensas mapeadas.</li>
                    )}
                  </ul>
                </div>

                <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
                  <div className="mb-3 flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-warning-surface text-warning-text">
                      <Shield className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">Riscos</p>
                      <h3 className="text-[14px] font-bold text-foreground">Pontos de atenção</h3>
                    </div>
                  </div>
                  <ul className="space-y-2.5">
                    {risks.length > 0 ? risks.map((r, i) => (
                      <li key={i} className="flex gap-2 text-[13px] leading-relaxed text-foreground">
                        <Shield className="mt-0.5 h-4 w-4 flex-shrink-0 text-warning-text" />
                        <span>{r.text}</span>
                      </li>
                    )) : (
                      <li className="text-[13px] text-muted-foreground">Sem riscos mapeados.</li>
                    )}
                  </ul>
                </div>
              </section>
            )}
          </>
        )}

        {/* ─── Soft separator into the locked content ───────────────────── */}
        <div className="mt-14 flex items-center justify-center gap-3">
          <div className="h-px flex-1 bg-border" />
          <span className="rounded-full border border-border bg-card px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
            Análise completa
          </span>
          <div className="h-px flex-1 bg-border" />
        </div>

        {/* ─── Locked sections ──────────────────────────────────────────── */}
        <div className="mt-8 space-y-6">

          <BlurredSection
            badge="Valuation completo"
            title="Sensibilidade, múltiplos e pares"
            description="Tabela de sensibilidade ao WACC e crescimento, comparação de múltiplos com o setor e histórico do P/L."
          >
            <h4 className="text-[16px] font-bold">Sensibilidade ao WACC e crescimento</h4>
            <p className="mt-2 text-[13px]">Como o preço justo muda quando você varia os principais drivers do modelo.</p>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-border bg-muted p-3"><p>WACC -1pp</p><p className="text-[18px] font-bold">R$ 56,40</p></div>
              <div className="rounded-xl border border-border bg-muted p-3"><p>WACC +1pp</p><p className="text-[18px] font-bold">R$ 42,80</p></div>
              <div className="rounded-xl border border-border bg-muted p-3"><p>g terminal -0,5pp</p><p className="text-[18px] font-bold">R$ 45,10</p></div>
              <div className="rounded-xl border border-border bg-muted p-3"><p>g terminal +0,5pp</p><p className="text-[18px] font-bold">R$ 52,90</p></div>
            </div>
          </BlurredSection>

          <BlurredSection
            badge="Crescimento futuro"
            title="Projeções e expectativas dos analistas"
            description="Receita, lucro e margem projetados, consenso de analistas, metas de preço e os principais drivers do crescimento."
          >
            <h4 className="text-[16px] font-bold">Receita projetada</h4>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-border bg-muted p-3"><p>2026E</p><p className="text-[18px] font-bold">R$ 39,2 bi</p></div>
              <div className="rounded-xl border border-border bg-muted p-3"><p>2027E</p><p className="text-[18px] font-bold">R$ 43,1 bi</p></div>
            </div>
            <p className="mt-4 text-[13px]">Consenso dos analistas projeta crescimento robusto nos próximos cinco anos.</p>
          </BlurredSection>

          <BlurredSection
            badge="Saúde financeira"
            title="Endividamento, caixa e cobertura"
            description="Estrutura de capital, cobertura de juros, evolução do endividamento líquido e a robustez do balanço."
          >
            <h4 className="text-[16px] font-bold">Estrutura de capital</h4>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-border bg-muted p-3"><p>Dív. líq./EBITDA</p><p className="text-[18px] font-bold">0,3x</p></div>
              <div className="rounded-xl border border-border bg-muted p-3"><p>Cobertura juros</p><p className="text-[18px] font-bold">28,4x</p></div>
            </div>
          </BlurredSection>

          <BlurredSection
            badge="Dividendos"
            title="Histórico, cobertura e sustentabilidade"
            description="Yield atual, payout, histórico de pagamentos, calendário do próximo provento e se os dividendos estão cobertos pelo lucro."
          >
            <h4 className="text-[16px] font-bold">Histórico de proventos</h4>
            <p className="mt-2 text-[13px]">Pagamentos consistentes com payout sustentável.</p>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-border bg-muted p-3"><p>Yield</p><p className="text-[18px] font-bold">1,8%</p></div>
              <div className="rounded-xl border border-border bg-muted p-3"><p>Payout</p><p className="text-[18px] font-bold">48%</p></div>
            </div>
          </BlurredSection>

        </div>

        {/* ─── Final big CTA ────────────────────────────────────────────── */}
        <section
          className="mt-16 overflow-hidden rounded-3xl border border-[#cfece4] px-8 py-12 text-center shadow-sm"
          style={{ background: 'linear-gradient(180deg, #FFFFFF 0%, #F4FBF9 50%, #DFF3EC 100%)' }}
        >
          <Badge>
            <Sparkles className="h-3 w-3" />
            Comece agora
          </Badge>
          <h2 className="mx-auto mt-4 max-w-[600px] text-[36px] font-semibold leading-[1.1] tracking-[-0.02em] text-foreground max-md:text-[26px]">
            Análises completas de qualquer ação da B3
          </h2>
          <p className="mx-auto mt-4 max-w-[480px] text-[15px] leading-relaxed text-muted-foreground">
            Em segundos. De graça. Sem cartão de crédito. Crie sua conta e analise empresas com a profundidade de um profissional.
          </p>

          <ul className="mx-auto mt-6 flex max-w-[520px] flex-wrap justify-center gap-x-6 gap-y-2 text-[13px] text-dim">
            {['5 pilares fundamentalistas', 'Mais de 400 ações', 'Atualizações diárias', 'Watchlists e alertas'].map((f) => (
              <li key={f} className="inline-flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-brand" />
                {f}
              </li>
            ))}
          </ul>

          <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
            <PrimaryCta label="Criar conta grátis" />
            <a
              href="/como-funciona"
              className="inline-flex items-center gap-1 text-[13px] font-semibold text-dim transition-colors hover:text-brand"
            >
              Como funciona
              <ArrowUpRight className="h-3.5 w-3.5" />
            </a>
          </div>
        </section>

      </main>
    </div>
  );
}

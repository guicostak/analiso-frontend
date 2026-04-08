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
  Search,
  Sparkles,
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

const PILLAR_LABELS: Record<string, string> = {
  value:    'Valuation',
  future:   'Crescimento Futuro',
  past:     'Performance Passada',
  health:   'Saúde Financeira',
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
    <section className="relative overflow-hidden rounded-3xl border border-border bg-card shadow-sm">
      <div
        aria-hidden
        tabIndex={-1}
        className="pointer-events-none select-none px-6 py-7 [filter:blur(7px)] [transform:translateZ(0)]"
      >
        {children}
      </div>
      <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-card to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-card to-transparent" />

      <div className="absolute inset-0 flex items-center justify-center px-4">
        <div className="max-w-[440px] rounded-2xl border border-border bg-card/95 px-6 py-6 text-center shadow-[0_10px_40px_-12px_rgba(15,159,143,0.25)] backdrop-blur-sm">
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
      // Placeholder so the chart still renders something during loading / error
      return [
        { label: 'Valuation',  value: 50 },
        { label: 'Futuro',     value: 50 },
        { label: 'Passado',    value: 50 },
        { label: 'Saúde',      value: 50 },
        { label: 'Dividendos', value: 50 },
      ];
    }
    return items.map(d => ({
      label: PILLAR_LABELS[d.dimension] ?? d.displayName ?? d.dimension,
      value: d.normalizedScore ?? (d.score / 6) * 100,
    }));
  }, [data?.snowflake]);

  const priceSeries = useMemo(() => {
    const series = priceHistory?.series ?? [];
    if (!series.length) return [];
    // Trim to ~24 points for a clean preview chart
    const step = Math.max(1, Math.floor(series.length / 24));
    return series
      .filter((_, i) => i % step === 0)
      .map(p => ({ date: p.date, Preço: p.price }));
  }, [priceHistory?.series]);

  const oneYearReturn = priceHistory?.return1y;
  const fairValue = valuation?.fairValue;
  const currentPrice = valuation?.currentPrice;
  const discountPct = valuation?.discountPercent;

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
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-5">
                <div className="flex items-center gap-4">
                  <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-2xl border border-border bg-muted">
                    {company.logo
                      ? <img src={company.logo} alt={company.name} className="h-full w-full object-contain" />
                      : <span className="font-mono text-[13px] font-bold text-muted-foreground">{company.ticker.slice(0, 4)}</span>
                    }
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-[20px] font-bold text-foreground">{company.name}</h2>
                      <span className="rounded-md bg-muted px-2 py-0.5 font-mono text-[11px] font-semibold text-muted-foreground">
                        {company.ticker}
                      </span>
                    </div>
                    <p className="text-[12px] text-muted-foreground">
                      {company.sector}{company.industry ? ` · ${company.industry}` : ''}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-6 text-right">
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Preço</p>
                    <p className="text-[18px] font-bold text-foreground">{formatBRL(currentPrice)}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Preço justo</p>
                    <p className="flex items-center justify-end gap-1 text-[18px] font-bold text-foreground">
                      {formatBRL(fairValue)}
                      {discountPct != null && (
                        <span
                          className={`rounded-md px-1.5 py-0.5 text-[11px] font-semibold ${
                            discountPct > 5
                              ? 'bg-success-surface text-success-text'
                              : discountPct < -5
                              ? 'bg-danger-surface text-danger-text'
                              : 'bg-warning-surface text-warning-text'
                          }`}
                        >
                          {formatPct(discountPct)}
                        </span>
                      )}
                    </p>
                  </div>
                </div>
              </div>

              {/* Snowflake + pillars summary */}
              <div className="mt-6 grid gap-8 lg:grid-cols-[280px_1fr]">
                <div className="flex flex-col items-center justify-center">
                  <SnowflakeChart dimensions={snowflakeForChart} size="large" status="healthy" />
                  <p className="mt-2 text-center text-[11px] text-muted-foreground">5 pilares fundamentalistas</p>
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
            badge="Valuation"
            title="DCF, múltiplos e cenários"
            description="Veja o cálculo do preço justo, sensibilidade aos drivers, comparação com pares do setor e o histórico do múltiplo."
          >
            <h4 className="text-[16px] font-bold">Régua de valuation de {ticker}</h4>
            <p className="mt-2 text-[13px]">Preço justo estimado por fluxo de caixa descontado considerando crescimento, margem operacional e custo de capital específicos.</p>
            <div className="mt-4 grid grid-cols-3 gap-3">
              <div className="rounded-xl border border-border bg-muted p-3"><p>Conservador</p><p className="text-[20px] font-bold">R$ 42,80</p></div>
              <div className="rounded-xl border border-border bg-muted p-3"><p>Base</p><p className="text-[20px] font-bold">R$ 48,60</p></div>
              <div className="rounded-xl border border-border bg-muted p-3"><p>Otimista</p><p className="text-[20px] font-bold">R$ 56,40</p></div>
            </div>
          </BlurredSection>

          <BlurredSection
            badge="Crescimento futuro"
            title="Projeções e expectativas dos analistas"
            description="Receita, lucro e margem projetados, consenso de analistas, metas de preço e os principais drivers do crescimento."
          >
            <h4 className="text-[16px] font-bold">Receita projetada vs realizada</h4>
            <div className="mt-4 grid grid-cols-4 gap-3">
              <div className="rounded-xl border border-border bg-muted p-3"><p>2026E</p><p className="text-[18px] font-bold">R$ 39,2 bi</p></div>
              <div className="rounded-xl border border-border bg-muted p-3"><p>2027E</p><p className="text-[18px] font-bold">R$ 43,1 bi</p></div>
              <div className="rounded-xl border border-border bg-muted p-3"><p>2028E</p><p className="text-[18px] font-bold">R$ 47,5 bi</p></div>
              <div className="rounded-xl border border-border bg-muted p-3"><p>2029E</p><p className="text-[18px] font-bold">R$ 52,0 bi</p></div>
            </div>
            <p className="mt-4 text-[13px]">Consenso dos analistas projeta crescimento médio anual robusto nos próximos cinco anos.</p>
          </BlurredSection>

          <BlurredSection
            badge="Saúde financeira"
            title="Endividamento, caixa e cobertura"
            description="Estrutura de capital, cobertura de juros, evolução do endividamento líquido e a robustez do balanço."
          >
            <h4 className="text-[16px] font-bold">Estrutura de capital</h4>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-border bg-muted p-3"><p>Dívida líquida / EBITDA</p><p className="text-[18px] font-bold">0,3x</p></div>
              <div className="rounded-xl border border-border bg-muted p-3"><p>Cobertura de juros</p><p className="text-[18px] font-bold">28,4x</p></div>
              <div className="rounded-xl border border-border bg-muted p-3"><p>Caixa</p><p className="text-[18px] font-bold">R$ 8,2 bi</p></div>
              <div className="rounded-xl border border-border bg-muted p-3"><p>Liquidez corrente</p><p className="text-[18px] font-bold">2,1x</p></div>
            </div>
          </BlurredSection>

          <BlurredSection
            badge="Dividendos"
            title="Histórico, cobertura e sustentabilidade"
            description="Yield atual, payout, histórico de pagamentos, calendário do próximo provento e se os dividendos estão cobertos pelo lucro."
          >
            <h4 className="text-[16px] font-bold">Histórico de proventos</h4>
            <p className="mt-2 text-[13px]">Pagamentos consistentes nos últimos anos, com payout sustentável. Próximo provento previsto.</p>
            <div className="mt-4 grid grid-cols-3 gap-3">
              <div className="rounded-xl border border-border bg-muted p-3"><p>Yield</p><p className="text-[18px] font-bold">1,8%</p></div>
              <div className="rounded-xl border border-border bg-muted p-3"><p>Payout</p><p className="text-[18px] font-bold">48%</p></div>
              <div className="rounded-xl border border-border bg-muted p-3"><p>Crescimento 5a</p><p className="text-[18px] font-bold">+11% a.a.</p></div>
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

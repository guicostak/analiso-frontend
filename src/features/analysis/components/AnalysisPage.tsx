"use client";

import { useState, useMemo } from 'react';
import { useParams } from 'next/navigation';
import { motion } from 'motion/react';
import {
  TrendingUp, Shield, DollarSign, BarChart3,
  CheckCircle2, XCircle, ArrowLeft, Users, Activity,
  Calendar, ArrowUpRight, ArrowDownRight, Minus, Star, AlertTriangle, ChevronRight,
} from 'lucide-react';
import {
  AreaChart as TremorArea,
  BarChart as TremorBar,
  LineChart as TremorLine,
  DonutChart,
  type CustomTooltipProps,
} from '@tremor/react';

import Link from 'next/link';
import { SnowflakeChart, type SnowflakeDimension } from '@/src/components/shared/SnowflakeChart';
import { getAnalysisData } from '../services';
import type {
  AnalysisData, AnalysisTab, DimensionScore, MetricDistribution, TimelineEvent,
  DCFSensitivityCell, RatioTrend, MarginSeries, ReturnComparison, InsiderSentimentPoint, DividendVsEarnings,
  RewardRisk, Competitor, AnalystTarget, EarningsRevenueSeries, CommunityFairValue,
} from '../interfaces';

// ─── Colors ──────────────────────────────────────────────────────────────────
// Palette based on color theory: muted saturation (45-65%) for professionalism,
// analogous harmony (blue-teal-green) for cohesion, split-complementary accents.
// Inspired by Stripe/Linear/Bloomberg — 60-30-10 rule: neutral/primary/accent.

const COLORS = {
  value: '#5B6AC0',       // Muted indigo — trust, analytical depth
  future: '#3E8ED0',      // Steel blue — forward-looking, clarity
  past: '#2EAA8A',        // Teal green — grounded, historical
  health: '#D4913B',      // Warm amber — attention without alarm
  dividend: '#8B6CDB',    // Soft violet — income, reward
  positive: '#2D9F6F',    // Forest green — muted success
  negative: '#C74B4B',    // Soft coral — risk without aggression
  neutral: '#8A8F9C',     // Cool gray
  muted: '#E8EBF0',       // Light cool gray
  forecast: '#8CBAE0',    // Pastel steel blue
  historical: '#3E8ED0',  // Matches future
  bg: '#F7F8FA',          // Near-white with cool undertone
};

const DIMENSION_COLORS: Record<string, string> = {
  value: COLORS.value,
  future: COLORS.future,
  past: COLORS.past,
  health: COLORS.health,
  dividend: COLORS.dividend,
};

// ─── Tab Config ──────────────────────────────────────────────────────────────

const TABS: { id: AnalysisTab; label: string; icon: React.ReactNode }[] = [
  { id: 'overview', label: 'Visão Geral', icon: <Activity className="w-4 h-4" /> },
  { id: 'value', label: 'Valuation', icon: <DollarSign className="w-4 h-4" /> },
  { id: 'future', label: 'Crescimento Futuro', icon: <TrendingUp className="w-4 h-4" /> },
  { id: 'past', label: 'Performance Passada', icon: <BarChart3 className="w-4 h-4" /> },
  { id: 'health', label: 'Saúde Financeira', icon: <Shield className="w-4 h-4" /> },
  { id: 'dividend', label: 'Dividendos', icon: <DollarSign className="w-4 h-4" /> },
  { id: 'ownership', label: 'Composição Acionária', icon: <Users className="w-4 h-4" /> },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatNumber(n: number): string {
  if (Math.abs(n) >= 1e9) return `${(n / 1e9).toFixed(1)}B`;
  if (Math.abs(n) >= 1e6) return `${(n / 1e6).toFixed(1)}M`;
  if (Math.abs(n) >= 1e3) return `${(n / 1e3).toFixed(1)}K`;
  return n.toFixed(1);
}

function ScoreBar({ score, max = 6, color }: { score: number; max?: number; color: string }) {
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: max }).map((_, i) => (
        <div
          key={i}
          className="h-2 w-4 rounded-sm"
          style={{ backgroundColor: i < score ? color : '#e5e7eb' }}
        />
      ))}
      <span className="ml-2 text-sm font-semibold" style={{ color }}>{score}/{max}</span>
    </div>
  );
}

function SectionCard({ id, title, subtitle, children, className = '' }: { id?: string; title: string; subtitle?: string; children: React.ReactNode; className?: string }) {
  return (
    <div id={id} className={`bg-white rounded-2xl shadow-sm p-6 scroll-mt-24 ${className}`}>
      <div className="mb-5">
        <h3 className="text-base font-semibold text-neutral-900">{title}</h3>
        {subtitle && <p className="text-xs text-neutral-400 mt-0.5">{subtitle}</p>}
      </div>
      {children}
    </div>
  );
}

// ─── Dimension intro texts ────────────────────────────────────────────────────

const DIMENSION_INTRO: Record<string, string> = {
  value: 'A empresa está negociando com desconto em relação ao que vale? Esta leitura combina fluxo de caixa descontado, múltiplos comparativos e expectativas de mercado para responder essa pergunta com precisão.',
  future: 'Avalia o potencial de crescimento de lucros e receita nos próximos anos, com base em projeções de analistas e na qualidade das estimativas históricas. Empresas com alta previsibilidade de crescimento tendem a ser mais seguras para investimentos de longo prazo.',
  past: 'Examina o histórico operacional da empresa — se ela entregou crescimento consistente de lucro, manteve margens saudáveis e gerou retorno real sobre o capital investido. O passado não garante o futuro, mas padrões consistentes são difíceis de forjar.',
  health: 'Verifica se a empresa tem capital suficiente para honrar suas obrigações, financiar operações e navegar por períodos adversos. Inclui análise de dívida, cobertura de juros e qualidade do fluxo de caixa operacional.',
  dividend: 'Avalia se os dividendos pagos são atrativos, consistentes e sustentáveis. Um alto rendimento sem cobertura adequada pelo lucro é um sinal de alerta — dividendos futuros dependem de geração de caixa real.',
};

function DimensionIntroCard({ dimension, title, icon, color }: {
  dimension: string; title: string; icon: React.ReactNode; color: string;
}) {
  return (
    <div className="bg-white rounded-2xl shadow-sm px-6 py-5">
      <div className="flex items-center gap-2.5 mb-2">
        <div className="w-6 h-6 rounded-lg flex items-center justify-center opacity-70" style={{ backgroundColor: `${color}20` }}>
          <span className="scale-75" style={{ color }}>{icon}</span>
        </div>
        <h2 className="text-base font-semibold text-neutral-800">{title}</h2>
      </div>
      <p className="text-sm text-neutral-400 leading-6">{DIMENSION_INTRO[dimension]}</p>
    </div>
  );
}

function DimensionScoreCard({ label, score, max = 6, checks, color, anchors }: {
  label: string; score: number; max?: number; checks: DimensionScore['checks']; color: string;
  anchors?: (string | null)[];
}) {
  const scrollTo = (id: string | null) => {
    if (!id) return;
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
      {/* Score header */}
      <div className="flex items-center justify-between px-6 pt-6 pb-5">
        <div>
          <p className="text-[10px] font-medium uppercase text-neutral-400">
            Nota de {label}
          </p>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-4xl font-bold text-neutral-900">{score}</span>
            <span className="text-sm text-neutral-300 font-light ml-0.5">de {max}</span>
          </div>
        </div>
        <div className="flex gap-1.5">
          {Array.from({ length: max }).map((_, i) => (
            <div
              key={i}
              className="w-3 h-3 rounded-full transition-all"
              style={{
                backgroundColor: i < score ? color : '#f3f4f6',
                boxShadow: i < score ? `0 0 0 2px ${color}25` : 'none',
              }}
            />
          ))}
        </div>
      </div>

      <div className="border-t border-neutral-50 mx-6" />

      {/* Checks */}
      <div className="pb-2">
        {checks.map((check, idx) => {
          const anchor = anchors?.[idx] ?? null;
          return (
            <button
              key={check.id}
              type="button"
              onClick={() => scrollTo(anchor)}
              disabled={!anchor}
              className={`w-full flex items-center gap-4 px-6 py-3.5 text-left transition-colors ${
                anchor ? 'hover:bg-neutral-50/80 cursor-pointer' : 'cursor-default'
              }`}
            >
              <div className={`w-5 h-5 rounded-full flex-shrink-0 flex items-center justify-center ${
                check.passed ? 'bg-teal-50' : 'bg-rose-50'
              }`}>
                {check.passed
                  ? <CheckCircle2 className="w-4 h-4 text-teal-500" />
                  : <XCircle className="w-4 h-4 text-rose-400" />
                }
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm text-neutral-800">{check.label}</span>
                  {check.value && (
                    <span className={`text-xs font-mono px-1.5 py-0.5 rounded ${
                      check.passed ? 'bg-teal-50 text-teal-700' : 'bg-rose-50 text-rose-500'
                    }`}>
                      {check.value}
                    </span>
                  )}
                  {check.threshold && (
                    <span className="text-xs text-neutral-300">{check.threshold}</span>
                  )}
                </div>
                {check.description && (
                  <p className="text-[11px] text-neutral-400 mt-0.5 leading-5">{check.description}</p>
                )}
              </div>
              {anchor && <ChevronRight className="w-3.5 h-3.5 text-neutral-200 flex-shrink-0" />}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function CheckList({ checks }: { checks: DimensionScore['checks'] }) {
  return (
    <div className="space-y-2">
      {checks.map((check) => (
        <div key={check.id} className="flex items-start gap-3 py-2 px-3 rounded-lg hover:bg-neutral-50 transition-colors">
          {check.passed ? (
            <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
          ) : (
            <XCircle className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
          )}
          <div className="flex-1 min-w-0">
            <div className="flex items-baseline gap-2 flex-wrap">
              <span className="text-sm font-medium text-neutral-900">{check.label}</span>
              {check.value && (
                <span className={`text-xs font-mono px-1.5 py-0.5 rounded ${check.passed ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'}`}>
                  {check.value}
                </span>
              )}
              {check.threshold && (
                <span className="text-xs text-neutral-400">{check.threshold}</span>
              )}
            </div>
            <p className="text-xs text-neutral-500 mt-0.5">{check.description}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

const DIMENSION_PRIORITY: Record<string, number> = {
  dividend: 1,
  health: 2,
  past: 3,
  future: 4,
  value: 5,
};

const DIMENSION_CONTEXT: Record<string, string> = {
  value: 'preco e margem de seguranca',
  future: 'crescimento e previsibilidade',
  past: 'historico operacional',
  health: 'balanco e cobertura financeira',
  dividend: 'proventos e consistencia',
};

function getTopDimension(dimensions: DimensionScore[]) {
  return [...dimensions].sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return DIMENSION_PRIORITY[a.dimension] - DIMENSION_PRIORITY[b.dimension];
  })[0];
}

function getBottomDimension(dimensions: DimensionScore[]) {
  return [...dimensions].sort((a, b) => {
    if (a.score !== b.score) return a.score - b.score;
    return DIMENSION_PRIORITY[a.dimension] - DIMENSION_PRIORITY[b.dimension];
  })[0];
}

function buildOverviewNarrative(data: AnalysisData) {
  const bestDimension = getTopDimension(data.snowflake);
  const weakestDimension = getBottomDimension(data.snowflake);
  const topReward = data.rewardsAndRisks.find((item) => item.type === 'reward');
  const topRisk = data.rewardsAndRisks.find((item) => item.type === 'risk');
  const hasDiscount = data.valuation.discountPercent > 0;
  const betterThanMarketLongTerm = data.returnComparison[data.returnComparison.length - 1]?.stock > data.returnComparison[data.returnComparison.length - 1]?.market;

  const headline = [
    `${data.company.name} combina forca em ${DIMENSION_CONTEXT[bestDimension.dimension]}`,
    hasDiscount ? 'com espaco para reprecificacao' : 'com leitura mais dependente de execucao',
    topRisk ? `, mas carrega pressao em ${DIMENSION_CONTEXT[weakestDimension.dimension]}` : '',
  ].join('');

  const subheadline = [
    topReward?.text ?? `A melhor leitura hoje esta em ${bestDimension.displayName.toLowerCase()}.`,
    topRisk?.text ? `O principal ponto de atencao esta em ${topRisk.text.toLowerCase()}.` : '',
    betterThanMarketLongTerm ? 'No horizonte longo, a tese ainda preserva sustentacao relativa.' : 'No curto prazo, o mercado ainda pede confirmacao da tese.',
  ].filter(Boolean).join(' ');

  const quickRead = [
    `Tese ${bestDimension.score - weakestDimension.score >= 2 ? 'desequilibrada para os pontos fortes' : 'equilibrada'},`,
    `com destaque para ${bestDimension.displayName.toLowerCase()}`,
    `e maior vigilancia em ${weakestDimension.displayName.toLowerCase()}.`,
  ].join(' ');

  return { bestDimension, weakestDimension, topReward, topRisk, headline, subheadline, quickRead };
}

function buildPriceInsight(data: AnalysisData) {
  const oneYearVsMarket = data.priceHistory.return1y - data.priceHistory.marketReturn1y;
  const fiveYearTrend = data.priceHistory.return5y;

  if (data.priceHistory.return1y < 0 && fiveYearTrend > 0) {
    return 'Depois de um periodo mais pressionado no curto prazo, a acao ainda preserva ganho acumulado no horizonte mais longo, mas sem uma recuperacao convincente o suficiente para eliminar a cautela.';
  }

  if (oneYearVsMarket > 0) {
    return 'O papel vem sustentando desempenho acima do mercado no recorte recente, o que reforca a leitura de que a tese ainda encontra apoio em preco.';
  }

  return 'O comportamento recente do papel segue mais de confirmacao do que de aceleracao: ha sinais mistos no preco e o usuario ainda precisa acompanhar os gatilhos que podem destravar ou enfraquecer a tese.';
}

function buildReturnInsight(data: AnalysisData) {
  const shortTerm = data.returnComparison.slice(0, 4);
  const longTerm = data.returnComparison.slice(4);
  const shortUnderperformance = shortTerm.filter((item) => item.stock < item.market).length;
  const longOutperformance = longTerm.filter((item) => item.stock > item.market).length;

  if (shortUnderperformance >= 3 && longOutperformance >= 1) {
    return `${data.company.name} ficou abaixo do Ibovespa nos recortes mais curtos, mas ainda preserva vantagem relativa nos horizontes mais longos.`;
  }

  if (shortUnderperformance >= 3) {
    return `${data.company.name} vem perdendo para o Ibovespa na maior parte dos recortes recentes, sinal de que o mercado ainda cobra confirmacao adicional da tese.`;
  }

  return `${data.company.name} mostra leitura relativa mais equilibrada contra o Ibovespa, sem uma dominancia clara nem no curto nem no longo prazo.`;
}

function inferTimelineImpact(event: TimelineEvent) {
  const text = `${event.title} ${event.description ?? ''}`.toLowerCase();

  if (text.includes('divid')) return 'Dividendos';
  if (text.includes('marg') || text.includes('resultado') || text.includes('lucro')) return 'Margens';
  if (text.includes('barrag') || text.includes('jurid') || text.includes('process')) return 'Juridico';
  if (text.includes('miner') || text.includes('commodity') || text.includes('china')) return 'Commodity';
  if (text.includes('cfo') || text.includes('gest')) return 'Gestao';
  return 'Operacao';
}

function getCompetitorSummary(comp: Competitor) {
  const entries = Object.entries(comp.scores).sort((a, b) => b[1] - a[1]);
  const best = entries[0];
  const worst = entries[entries.length - 1];
  const average = entries.reduce((sum, [, value]) => sum + value, 0) / entries.length;

  let synthesis = 'mais equilibrada';
  if (average < 50) synthesis = 'mais pressionada';
  else if (best[1] - worst[1] >= 25) synthesis = 'maior assimetria risco-retorno';

  return {
    synthesis,
    differential: `Destaque em ${DIMENSION_CONTEXT[best[0]]}; pede cuidado em ${DIMENSION_CONTEXT[worst[0]]}.`,
  };
}

// ─── Reusable Chart Components (data-to-viz optimized) ──────────────────────

/**
 * BULLET CHART — data-to-viz recommendation for comparing a value against ranges.
 * Replaces gauges/progress bars. Encodes by position (most accurate per data-to-viz).
 */
function BulletChart({
  value, target, ranges, label, unit = '', domain,
}: {
  value: number; target: number; ranges: [number, number, number]; label: string; unit?: string;
  domain: [number, number];
}) {
  const [min, max] = domain;
  const pct = (v: number) => ((v - min) / (max - min)) * 100;

  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs text-neutral-500">
        <span>{label}</span>
        <span className="font-mono font-medium text-neutral-700">{value}{unit}</span>
      </div>
      <div className="relative h-8 rounded-lg overflow-hidden">
        {/* Background ranges: poor → fair → good */}
        <div className="absolute inset-0 flex">
          <div className="h-full bg-rose-50" style={{ width: `${pct(ranges[0])}%` }} />
          <div className="h-full bg-amber-50" style={{ width: `${pct(ranges[1]) - pct(ranges[0])}%` }} />
          <div className="h-full bg-teal-50" style={{ width: `${100 - pct(ranges[1])}%` }} />
        </div>
        {/* Actual value bar */}
        <div
          className="absolute top-1.5 left-0 h-5 rounded bg-neutral-600"
          style={{ width: `${Math.min(pct(value), 100)}%` }}
        />
        {/* Target marker */}
        <div
          className="absolute top-0 w-px h-full bg-neutral-400"
          style={{ left: `${pct(target)}%` }}
        />
        <div
          className="absolute -top-0.5 w-2 h-2 bg-neutral-400 rounded-full transform -translate-x-1/2"
          style={{ left: `${pct(target)}%` }}
        />
      </div>
      <div className="flex justify-between text-[10px] text-neutral-400">
        <span>{min}{unit}</span>
        <span>Referência: {target}{unit}</span>
        <span>{max}{unit}</span>
      </div>
    </div>
  );
}

function PEVsIndustryChart({ data }: { data: AnalysisData }) {
  const [activeRatio, setActiveRatio] = useState<'pe' | 'ps' | 'pb'>('pe');
  const myTicker = data.company.ticker;
  const myPE = data.relativeValuation.peRatio;
  const myGrowth = data.growth.earningsGrowthRate;

  const allRows = [
    { ticker: myTicker, company: data.company.name, pe: myPE, earningsGrowth: myGrowth, marketCap: data.company.marketCap, isMain: true },
    ...data.competitors
      .filter(c => c.pe != null)
      .map(c => ({ ticker: c.ticker, company: c.name, pe: c.pe as number, earningsGrowth: c.earningsGrowth ?? null, marketCap: c.marketCap, isMain: false })),
  ].sort((a, b) => a.pe - b.pe);

  const bins = Array.from({ length: 20 }, (_, index) => {
    const start = index * 5;
    const end = start + 5;
    return {
      key: `${start}-${end}`,
      label: `PE ${start.toLocaleString('pt-BR', { minimumFractionDigits: 1 })}-${end.toLocaleString('pt-BR', { minimumFractionDigits: 1 })}`,
      start,
      end,
    };
  }).concat([{ key: '100+', label: 'PE 100+', start: 100, end: Infinity }]);

  const getBinIndex = (value: number) => {
    const found = bins.findIndex(bin => value >= bin.start && value < bin.end);
    return found === -1 ? bins.length - 1 : found;
  };

  const [selectedBinIndex, setSelectedBinIndex] = useState(() => getBinIndex(myPE));
  const [showAllCompanies, setShowAllCompanies] = useState(false);
  const selectedBin = bins[selectedBinIndex];
  const rowsInBin = allRows.filter(row => row.pe >= selectedBin.start && row.pe < selectedBin.end);
  const displayRows = rowsInBin.slice(0, 4);
  const counts = bins.map(bin => allRows.filter(row => row.pe >= bin.start && row.pe < bin.end).length);
  const maxCount = Math.max(...counts, 1);
  const industryRows = allRows.filter(row => !row.isMain);
  const industryAvg = industryRows.length ? industryRows.reduce((sum, row) => sum + row.pe, 0) / industryRows.length : myPE;
  const domainMax = Math.max(100, Math.ceil(Math.max(myPE, industryAvg, ...allRows.map(row => row.pe)) / 20) * 20);
  const chartLeft = 27;
  const chartWidth = 801;
  const companyX = chartLeft + (Math.min(myPE, domainMax) / domainMax) * chartWidth;
  const industryX = chartLeft + (Math.min(industryAvg, domainMax) / domainMax) * chartWidth;

  const ratioOptions = {
    pe: 'Relação preço/lucro',
    ps: 'Relação preço/vendas',
    pb: 'Preço para reserva',
  };

  const marketCapCompact = (value: string) => value.replace('R$ ', 'R$').replace(' ', '');
  const marketCapVerbose = (value: string) => value.replace('R$', 'US$');
  const growthLabel = (value: number | null) => (value == null ? 'n/a' : `${value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}%`);
  const companyIsExpensive = myPE > industryAvg;
  const statementTone = companyIsExpensive ? 'text-rose-600' : 'text-teal-700';
  const statementBg = companyIsExpensive ? 'bg-rose-50 border-rose-200' : 'bg-teal-50 border-teal-200';
  const visibleRows = showAllCompanies ? rowsInBin : displayRows;

  return (
    <div>
      <p className="mb-5 text-sm leading-relaxed text-neutral-600">
        Como se compara o índice P/L da {myTicker} com o de outras empresas do setor {data.company.industry.toLowerCase()} global?
      </p>

      <div className="rounded-2xl border border-neutral-200 bg-neutral-50/70 p-4">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div className="relative">
            <button type="button" className="inline-flex items-center gap-2 rounded-full border border-neutral-300 bg-white px-4 py-2 text-sm font-medium text-neutral-700 shadow-sm">
              <svg className="h-4 w-4 fill-amber-400 text-amber-400" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M11.0496 5.90475C11.3502 4.98605 12.6498 4.98605 12.9504 5.90475L14.1246 9.49342H17.9049C18.8753 9.49342 19.2769 10.7366 18.49 11.3044L15.4377 13.5066L16.6073 17.0812C16.9083 18.0012 15.8568 18.7695 15.0718 18.2031L12 15.9868L8.92824 18.2031C8.14316 18.7695 7.09168 18.0012 7.39272 17.0812L8.56231 13.5066L5.51002 11.3044C4.72306 10.7366 5.12471 9.49342 6.09512 9.49342H9.87539L11.0496 5.90475Z" />
              </svg>
              <span>{ratioOptions[activeRatio]}</span>
              <svg className="h-4 w-4 text-neutral-500" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path fillRule="evenodd" clipRule="evenodd" d="M16.9497 9.0474C16.5592 8.65688 15.9261 8.65688 15.5355 9.0474L12 12.5829L8.46447 9.0474C8.07394 8.65688 7.44078 8.65688 7.05025 9.0474C6.65973 9.43793 6.65973 10.0711 7.05025 10.4616L11.2929 14.7043C11.6834 15.0948 12.3166 15.0948 12.7071 14.7043L16.9497 10.4616C17.3403 10.0711 17.3403 9.43793 16.9497 9.0474Z" />
              </svg>
            </button>
            <select value={activeRatio} onChange={e => setActiveRatio(e.target.value as 'pe' | 'ps' | 'pb')} className="absolute inset-0 cursor-pointer opacity-0" aria-label="Selecionar múltiplo versus setor">
              <option value="pe">Relação preço/lucro</option>
              <option value="ps">Relação preço/vendas</option>
              <option value="pb">Preço para reserva</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <div className="min-w-[860px]">
            <svg viewBox="0 0 860 324" className="h-auto w-full">
              <defs>
                <linearGradient id="industryNoirGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#111827" stopOpacity="0.92" />
                  <stop offset="100%" stopColor="#111827" stopOpacity="0.72" />
                </linearGradient>
              </defs>

              <rect x={chartLeft} y="36" width={`${(industryAvg / domainMax) * chartWidth}`} height="252" fill="#86efac" fillOpacity="0.85" />
              <rect x={chartLeft + (industryAvg / domainMax) * chartWidth} y="36" width={`${chartWidth - (industryAvg / domainMax) * chartWidth}`} height="252" fill="#fee2e2" />

              <rect x={industryX} y="36" width="2" height="252" fill="#9ca3af" />
              <g transform={`translate(${industryX},17)`}>
                <polygon points="0 0,11 0,11 19,9 19,0 0" fill="#9ca3af" transform="translate(-9 0)" />
                <rect x="-157" y="-17" width="159" height="25" rx="2" fill="#9ca3af" />
                <text x="-149" y="0" fill="#1b222d" fontSize="13">Industry Avg. {industryAvg.toFixed(1)}x</text>
              </g>

              <rect x={companyX} y="36" width="1" height="252" fill="#0ea5e9" />
              <g transform={`translate(${companyX},17)`}>
                <polygon points="0 0,11 0,11 19,10 19,0 0" fill="#0ea5e9" transform="translate(11 0) scale(-1,1)" />
                <rect x="0" y="-17" width="128" height="25" rx="2" fill="#0ea5e9" />
                <text x="9" y="0" fill="#ffffff" fontSize="13">{myTicker} {myPE.toFixed(1)}x</text>
              </g>

              {[44, 105, 166, 227].map(y => (
                <rect key={y} width="100%" height="1" y={y} fill="rgba(148,163,184,0.28)" />
              ))}

              <text x="15" y="280" fill="#64748b" fontSize="11" transform="rotate(-90 15 280)">No. of Companies</text>
              <text x="12" y="56" fill="#334155" fontSize="11">{maxCount}</text>
              <rect width="100%" y="288" height="1" fill="rgba(148,163,184,0.35)" />
              <text x="8" y="308" fill="#475569" fontSize="11">PE</text>

              {Array.from({ length: Math.floor(domainMax / 20) + 1 }, (_, idx) => {
                const value = idx * 20;
                const x = chartLeft + (value / domainMax) * chartWidth;
                return (
                  <g key={value} transform={`translate(${x},0)`}>
                    <rect y="289" width="1" height="4" fill="rgba(148,163,184,0.35)" transform="translate(-1,0)" />
                    <text y="308" fill="#475569" fontSize="11">{value === domainMax ? `${value}+` : value}</text>
                  </g>
                );
              })}

              {counts.map((count, index) => {
                const x = chartLeft + (index / bins.length) * chartWidth;
                const width = chartWidth / bins.length - 2;
                const height = (count / maxCount) * 244;
                const y = 288 - height;
                const isSelected = index === selectedBinIndex;
                return (
                  <g key={bins[index].key} transform={`translate(${x},0)`}>
                    <rect fill={isSelected ? '#0ea5e9' : 'url(#industryNoirGradient)'} y={y} width={width} height={height} />
                    <rect fill="rgba(15,23,42,0.65)" y={y} width={width} height="2" />
                  </g>
                );
              })}
            </svg>

            <div className="mt-3 overflow-x-auto">
              <div className="inline-flex min-w-full border-b border-neutral-200 bg-white">
                {bins.map((bin, index) => (
                  <button
                    key={bin.key}
                    type="button"
                    onClick={() => {
                      setSelectedBinIndex(index);
                      setShowAllCompanies(false);
                    }}
                    className={`relative px-3 py-2 text-xs whitespace-nowrap ${index === selectedBinIndex ? 'font-semibold text-neutral-900' : 'text-neutral-500'}`}
                  >
                    {bin.label}
                    {index === selectedBinIndex && <span className="absolute inset-x-0 bottom-0 h-0.5 bg-neutral-900" />}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-4 overflow-hidden rounded-xl border border-neutral-200 bg-white">
              <table className="w-full text-sm">
                <thead className="bg-neutral-50 text-left text-neutral-500">
                  <tr>
                    <th className="px-4 py-3 font-medium">{rowsInBin.length} empresas</th>
                    <th className="px-4 py-3 font-medium">Preço/Lucro</th>
                    <th className="px-4 py-3 font-medium">Crescimento estimado</th>
                    <th className="px-4 py-3 font-medium">capitalização de mercado</th>
                  </tr>
                </thead>
                <tbody>
                  {visibleRows.map(row => (
                    <tr key={row.ticker} className={`border-t border-neutral-100 ${row.isMain ? 'bg-sky-50/70' : ''}`}>
                      <td className="px-4 py-3">
                        <div className="flex flex-col">
                          <span className="font-semibold text-neutral-900">{row.ticker}</span>
                          <span className="text-xs text-neutral-500">{row.company}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 font-medium text-neutral-900">{row.pe.toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}x</td>
                      <td className={`px-4 py-3 font-medium ${row.earningsGrowth != null && row.earningsGrowth < 0 ? 'text-rose-600' : 'text-neutral-700'}`}>{growthLabel(row.earningsGrowth)}</td>
                      <td className="px-4 py-3 text-neutral-700">{marketCapCompact(row.marketCap)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {rowsInBin.length > displayRows.length && !showAllCompanies && (
                <div className="border-t border-neutral-100 px-4 py-3 text-center">
                  <button
                    type="button"
                    onClick={() => setShowAllCompanies(true)}
                    className="text-sm font-medium text-neutral-700"
                  >
                    Mostrar todas as {rowsInBin.length} empresas
                  </button>
                </div>
              )}
            </div>

            {showAllCompanies && (
              <div className="mt-4 overflow-hidden rounded-2xl border border-neutral-200 bg-white">
                <div className="overflow-x-auto border-b border-neutral-200">
                  <div className="inline-flex min-w-full border-b border-neutral-200 bg-white">
                    {bins.map((bin, index) => (
                      <button
                        key={`${bin.key}-expanded`}
                        type="button"
                        onClick={() => {
                          setSelectedBinIndex(index);
                          setShowAllCompanies(true);
                        }}
                        className={`relative px-3 py-2 text-xs whitespace-nowrap ${index === selectedBinIndex ? 'font-semibold text-neutral-900' : 'text-neutral-500'}`}
                      >
                        {bin.label}
                        {index === selectedBinIndex && <span className="absolute inset-x-0 bottom-0 h-0.5 bg-neutral-900" />}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="max-h-[28rem] overflow-y-auto">
                  <table className="w-full text-sm">
                    <thead className="sticky top-0 bg-white text-left text-neutral-500">
                      <tr>
                        <th className="px-4 py-3 font-medium">{rowsInBin.length} empresas</th>
                        <th className="px-4 py-3 font-medium"></th>
                        <th className="px-4 py-3 font-medium">Crescimento estimado</th>
                        <th className="px-4 py-3 font-medium">capitalização de mercado</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rowsInBin.map(row => (
                        <tr key={`${row.ticker}-expanded`} className="border-t border-neutral-100">
                          <td className="px-4 py-3">
                            <div className="flex flex-col">
                              <span className="font-semibold text-neutral-900">{row.ticker}</span>
                              <span className="text-xs text-neutral-500">{row.company}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3 font-medium text-neutral-900">{row.pe.toFixed(1)}x</td>
                          <td className={`px-4 py-3 font-medium ${row.earningsGrowth != null && row.earningsGrowth < 0 ? 'text-rose-600' : 'text-neutral-700'}`}>{growthLabel(row.earningsGrowth)}</td>
                          <td className="px-4 py-3 text-neutral-700">{marketCapVerbose(row.marketCap)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="border-t border-neutral-200 px-4 py-3 text-center">
                  <button
                    type="button"
                    onClick={() => setShowAllCompanies(false)}
                    className="text-sm font-medium text-neutral-700"
                  >
                    Chega de empresas
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="mt-4 flex items-center justify-end gap-2">
          <button type="button" className="inline-flex h-8 items-center justify-center gap-2 rounded-md border border-neutral-300 bg-white px-3 text-xs font-normal text-neutral-700 transition hover:bg-neutral-50">
            <svg className="h-4 w-4 fill-current opacity-75" viewBox="0 0 24 24" aria-hidden="true">
              <path fillRule="evenodd" clipRule="evenodd" d="M5 12C5 15.866 8.13401 19 12 19C15.866 19 19 15.866 19 12C19 8.13401 15.866 5 12 5C8.13401 5 5 8.13401 5 12ZM12 4C7.58172 4 4 7.58172 4 12C4 16.4183 7.58172 20 12 20C16.4183 20 20 16.4183 20 12C20 7.58172 16.4183 4 12 4ZM13 8V10H11V8H13ZM13 16V11H11V16H13Z" />
            </svg>
            <span className="hidden md:inline">Aprender</span>
          </button>
          <button type="button" className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-neutral-300 bg-white text-neutral-600 transition hover:bg-neutral-50" aria-label="Mais">
            <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24" aria-hidden="true">
              <path fillRule="evenodd" clipRule="evenodd" d="M6 12C6 11.4477 6.44772 11 7 11C7.55228 11 8 11.4477 8 12C8 12.5523 7.55228 13 7 13C6.44772 13 6 12.5523 6 12ZM11 12C11 11.4477 11.4477 11 12 11C12.5523 11 13 11.4477 13 12C13 12.5523 12.5523 13 12 13C11.4477 13 11 12.5523 11 12ZM17 11C16.4477 11 16 11.4477 16 12C16 12.5523 16.4477 13 17 13C17.5523 13 18 12.5523 18 12C18 11.4477 17.5523 11 17 11Z" />
            </svg>
          </button>
        </div>
      </div>

      <blockquote className={`mt-5 rounded-xl border px-4 py-3 ${statementBg}`}>
        <p className="text-sm leading-relaxed text-neutral-700">
          <span className={`font-semibold ${statementTone}`}>Relação Preço/Lucro vs. Pares: </span>
          A {myTicker} {companyIsExpensive ? 'está cara' : 'apresenta bom valor'} com base em sua relação preço/lucro ({myPE.toFixed(1)}x) em comparação com a média dos pares ({industryAvg.toFixed(1)}x).
        </p>
      </blockquote>
    </div>
  );
}

/**
 * HISTOGRAM WITH MARKERS — data-to-viz recommendation for distribution + position markers.
 * Uses bars for distribution + vertical reference lines for current value and sector median.
 */
function DistributionHistogram({ distribution }: { distribution: MetricDistribution }) {
  return (
    <div>
      <div className="flex items-center gap-4 mb-2 text-xs">
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-sky-500" />
          <span className="text-neutral-600">{distribution.metric} da empresa: <strong>{distribution.currentValue}x</strong></span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
          <span className="text-neutral-600">Mediana setor: <strong>{distribution.sectorMedian}x</strong></span>
        </div>
      </div>
      <div className="h-60">
        <TremorBar
          data={distribution.buckets.map(b => ({
            ...b,
            label: b.label,
            value: b.value,
          }))}
          index="label"
          categories={["value"]}
          colors={["sky"]}
          showLegend={false}
          yAxisWidth={48}
        />
      </div>
    </div>
  );
}

/**
 * LOLLIPOP CHART — data-to-viz recommendation over bar charts.
 * Cleaner than bars (avoids Moiré effect), better with many categories.
 * Horizontal layout avoids vertical label issues (caveat #19).
 */
function LollipopComparison({
  items,
}: {
  items: { name: string; value: number; color: string; isHighlight?: boolean }[];
}) {
  const maxValue = Math.max(...items.map(i => i.value));

  return (
    <div className="space-y-3">
      {items.map((item) => (
        <div key={item.name} className="flex items-center gap-3">
          <span className={`text-sm w-24 text-right ${item.isHighlight ? 'font-bold text-neutral-900' : 'text-neutral-600'}`}>
            {item.name}
          </span>
          <div className="flex-1 relative h-6 flex items-center">
            {/* Stem */}
            <div
              className="h-0.5 rounded"
              style={{
                width: `${(item.value / maxValue) * 100}%`,
                backgroundColor: item.color,
              }}
            />
            {/* Dot */}
            <div
              className="absolute w-4 h-4 rounded-full border-2 border-white shadow-sm"
              style={{
                left: `calc(${(item.value / maxValue) * 100}% - 8px)`,
                backgroundColor: item.color,
              }}
            />
            {/* Label */}
            <span
              className="absolute text-xs font-mono font-bold"
              style={{
                left: `calc(${(item.value / maxValue) * 100}% + 12px)`,
                color: item.color,
              }}
            >
              {item.value}x
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * DUMBBELL CHART — data-to-viz: Range Plot.
 * Shows min-max range with a specific point. Perfect for price scenarios.
 */
function DumbbellScenarios({
  scenarios, currentPrice
}: {
  scenarios: { label: string; value: number; gap: number }[];
  currentPrice: number;
}) {
  const allValues = [...scenarios.map(s => s.value), currentPrice];
  const min = Math.min(...allValues) * 0.85;
  const max = Math.max(...allValues) * 1.1;
  const pct = (v: number) => ((v - min) / (max - min)) * 100;

  return (
    <div className="space-y-5">
      {scenarios.map((s) => {
        const isUpside = s.value >= currentPrice;
        const leftVal = Math.min(currentPrice, s.value);
        const rightVal = Math.max(currentPrice, s.value);

        return (
          <div key={s.label} className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="font-medium text-neutral-700">{s.label}</span>
              <span className={`font-mono font-bold ${isUpside ? 'text-teal-600' : 'text-rose-500'}`}>
                R$ {s.value.toFixed(2)} ({isUpside ? '+' : ''}{s.gap.toFixed(1)}%)
              </span>
            </div>
            <div className="relative h-6">
              {/* Track */}
              <div className="absolute top-2.5 left-0 right-0 h-0.5 bg-neutral-200 rounded" />
              {/* Connection line */}
              <div
                className="absolute top-2.5 h-1 rounded"
                style={{
                  left: `${pct(leftVal)}%`,
                  width: `${pct(rightVal) - pct(leftVal)}%`,
                  backgroundColor: isUpside ? '#99f6e4' : '#fecdd3',
                }}
              />
              {/* Current price dot */}
              <div
                className="absolute top-0.5 w-4 h-4 rounded-full bg-neutral-500 border-2 border-white shadow"
                style={{ left: `calc(${pct(currentPrice)}% - 8px)` }}
              />
              {/* Scenario dot */}
              <div
                className="absolute top-0.5 w-4 h-4 rounded-full border-2 border-white shadow"
                style={{
                  left: `calc(${pct(s.value)}% - 8px)`,
                  backgroundColor: isUpside ? '#14b8a6' : '#fb7185',
                }}
              />
            </div>
          </div>
        );
      })}
      <div className="flex items-center gap-4 text-xs text-neutral-400 mt-2">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-neutral-500" />
          <span>Preço atual</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-teal-400" />
          <span>Potencial de alta</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-rose-400" />
          <span>Potencial de baixa</span>
        </div>
      </div>
    </div>
  );
}

/**
 * TIMELINE — data-to-viz: Annotated timeline for events.
 * Vertical layout with color-coded impact markers.
 */
function EventTimeline({ events }: { events: TimelineEvent[] }) {
  const impactConfig = {
    positive: { color: '#16a34a', bg: 'bg-green-50', icon: <ArrowUpRight className="w-3.5 h-3.5" /> },
    negative: { color: '#dc2626', bg: 'bg-red-50', icon: <ArrowDownRight className="w-3.5 h-3.5" /> },
    neutral: { color: '#6b7280', bg: 'bg-neutral-50', icon: <Minus className="w-3.5 h-3.5" /> },
  };

  return (
    <div className="relative">
      {/* Vertical line */}
      <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-neutral-200" />

      <div className="space-y-0">
        {events.map((event, idx) => {
          const config = impactConfig[event.expectedImpact];
          return (
            <div key={idx} className="relative flex gap-4 py-3">
              {/* Dot on timeline */}
              <div
                className="relative z-10 w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 border-2 border-white shadow-sm"
                style={{ backgroundColor: config.color }}
              >
                <span className="text-white">{config.icon}</span>
              </div>
              {/* Content */}
              <div className={`flex-1 p-3 rounded-xl ${config.bg} border border-neutral-100`}>
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span className="text-sm font-semibold text-neutral-900">{event.title}</span>
                  <span className="text-xs text-neutral-400 flex items-center gap-1 flex-shrink-0">
                    <Calendar className="w-3 h-3" />
                    {event.date}
                  </span>
                </div>
                {event.description && (
                  <p className="text-xs text-neutral-600">{event.description}</p>
                )}
                <div className="mt-2 flex items-center justify-between gap-3">
                  <span className="inline-flex items-center rounded-full bg-white/80 px-2 py-1 text-[10px] font-medium text-neutral-600">
                    Impacta: {inferTimelineImpact(event)}
                  </span>
                  <span className="text-[10px] text-neutral-400 block">Fonte: {event.source}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/**
 * SENSITIVITY RANKING — Numbered list ordered by impact severity.
 * Color-coded dots: rose = high, amber = medium, neutral = low.
 */
function SensitivityChart({ drivers }: { drivers: { key: string; label: string; impact: 'high' | 'medium' | 'low' }[] }) {
  const impactWeight = { high: 3, medium: 2, low: 1 };
  const impactDot: Record<string, string> = { high: 'bg-rose-400', medium: 'bg-amber-400', low: 'bg-neutral-300' };
  const impactLabel = { high: 'Alto', medium: 'Médio', low: 'Baixo' };
  const impactText: Record<string, string> = { high: 'text-rose-500', medium: 'text-amber-500', low: 'text-neutral-400' };
  const sorted = [...drivers].sort((a, b) => impactWeight[b.impact] - impactWeight[a.impact]);

  return (
    <div className="space-y-1">
      {sorted.map((d, idx) => (
        <div key={d.key} className="flex items-center gap-4 px-3 py-2.5 rounded-lg hover:bg-neutral-50 transition-colors">
          <span className="text-[11px] font-mono text-neutral-300 w-5 text-right flex-shrink-0">{idx + 1}</span>
          <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${impactDot[d.impact]}`} />
          <span className="text-sm text-neutral-800 flex-1">{d.label}</span>
          <span className={`text-[11px] font-medium ${impactText[d.impact]}`}>{impactLabel[d.impact]}</span>
        </div>
      ))}
    </div>
  );
}

/**
 * STACKED HORIZONTAL BAR — data-to-viz recommendation over Pie Chart.
 * Position encoding >> angle encoding. Single bar shows proportions clearly.
 */
function StackedOwnershipBar({ items }: { items: { name: string; value: number; color: string }[] }) {
  const total = items.reduce((sum, i) => sum + i.value, 0);

  return (
    <div className="space-y-3">
      {/* The bar */}
      <div className="h-10 rounded-xl overflow-hidden flex">
        {items.map((item) => (
          <div
            key={item.name}
            className="h-full flex items-center justify-center text-white text-xs font-bold"
            style={{ width: `${(item.value / total) * 100}%`, backgroundColor: item.color }}
          >
            {item.value >= 10 && `${item.value}%`}
          </div>
        ))}
      </div>
      {/* Legend below */}
      <div className="flex gap-6">
        {items.map((item) => (
          <div key={item.name} className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
            <span className="text-sm text-neutral-600">{item.name}</span>
            <span className="text-sm font-bold text-neutral-900">{item.value}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * DCF SENSITIVITY HEATMAP — data-to-viz: Heatmap for numeric matrix.
 * Shows fair value across WACC × Terminal Growth combinations.
 * Color encodes magnitude: green = above current price, red = below.
 */
function DCFSensitivityHeatmap({
  cells, currentPrice, baseWacc, baseGrowth,
}: {
  cells: DCFSensitivityCell[]; currentPrice: number; baseWacc: number; baseGrowth: number;
}) {
  const waccValues = [...new Set(cells.map(c => c.wacc))].sort((a, b) => a - b);
  const growthValues = [...new Set(cells.map(c => c.terminalGrowth))].sort((a, b) => a - b);

  const getColor = (fv: number) => {
    if (fv >= currentPrice * 1.2) return { bg: 'bg-teal-100', text: 'text-teal-800' };
    if (fv >= currentPrice) return { bg: 'bg-teal-50', text: 'text-teal-700' };
    if (fv >= currentPrice * 0.9) return { bg: 'bg-amber-50', text: 'text-amber-700' };
    return { bg: 'bg-rose-50', text: 'text-rose-600' };
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm border-separate border-spacing-1">
        <thead>
          <tr>
            <th className="p-2 text-left text-neutral-400 text-[11px] font-medium">WACC ↓ / Cresc. →</th>
            {growthValues.map(g => (
              <th key={g} className={`p-2 text-center text-[11px] font-medium rounded ${g === baseGrowth ? 'text-indigo-600 bg-indigo-50' : 'text-neutral-400'}`}>
                {g}%
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {waccValues.map(w => (
            <tr key={w}>
              <td className={`p-2 text-[11px] font-mono rounded ${w === baseWacc ? 'font-semibold text-indigo-600 bg-indigo-50' : 'text-neutral-500'}`}>
                {w}%
              </td>
              {growthValues.map(g => {
                const cell = cells.find(c => c.wacc === w && c.terminalGrowth === g);
                const fv = cell?.fairValue ?? 0;
                const { bg, text } = getColor(fv);
                const isBase = w === baseWacc && g === baseGrowth;
                return (
                  <td key={g} className={`p-2.5 text-center font-mono text-[11px] rounded ${bg} ${text} ${isBase ? 'ring-2 ring-indigo-400 ring-inset font-bold' : ''}`}>
                    R${fv.toFixed(0)}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
      <div className="flex items-center gap-4 mt-4 text-[11px] text-neutral-400">
        <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded bg-teal-100" />Forte desconto (+20%)</div>
        <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded bg-teal-50" />Acima do preço</div>
        <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded bg-amber-50" />Próximo do preço</div>
        <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded bg-rose-50" />Abaixo do preço</div>
        <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded ring-2 ring-indigo-400" />Base</div>
      </div>
    </div>
  );
}

/**
 * RATIO TREND MULTI-LINE — data-to-viz: Line Chart for ordered numeric.
 * Shows company valuation multiples vs industry over time.
 * Uses small multiples pattern to avoid spaghetti (caveat #3).
 */
function RatioTrendSmallMultiples({ trends }: { trends: RatioTrend[] }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {trends.map((trend) => (
        <div key={trend.metric} className="bg-neutral-50 rounded-xl p-4">
          <h4 className="text-sm font-semibold text-neutral-700 mb-2">{trend.metric}</h4>
          <div className="h-40">
            <TremorLine
              data={trend.series}
              index="year"
              categories={["company", "industry"]}
              colors={["blue", "slate"]}
              valueFormatter={(v: number) => `${v}x`}
              showLegend={false}
              curveType="monotone"
              yAxisWidth={36}
            />
          </div>
          <div className="flex items-center gap-3 mt-2 text-[10px] text-neutral-500">
            <div className="flex items-center gap-1"><div className="w-3 h-0.5 bg-blue-500 rounded" />Empresa</div>
            <div className="flex items-center gap-1"><div className="w-3 h-0.5 bg-neutral-400 rounded border-dashed" />Indústria</div>
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * MARGIN AREA CHART — data-to-viz: Stacked area for multiple ordered numerics.
 * Shows margin evolution (gross, operating, net) as layered areas.
 */
function MarginEvolution({ series }: { series: MarginSeries[] }) {
  return (
    <div className="h-full min-h-[180px]">
      <TremorArea
        data={series}
        index="year"
        categories={["grossMargin", "operatingMargin", "netMargin"]}
        colors={["teal", "sky", "violet"]}
        valueFormatter={(v: number) => `${v}%`}
        showLegend={true}
        showGridLines={true}
        curveType="monotone"
        yAxisWidth={48}
      />
    </div>
  );
}

/**
 * DIVERGING BAR CHART — data-to-viz: Diverging bar for stock vs market returns.
 * Center axis = 0, bars extend left (negative) or right (positive).
 * Color: stock in blue, market in gray.
 */
function ReturnComparisonChart({ data }: { data: ReturnComparison[] }) {
  const chartData = data.map(d => ({
    period: d.period,
    stock: d.stock,
    market: d.market,
  }));

  return (
    <div className="h-80">
      <TremorBar
        data={chartData}
        index="period"
        categories={["stock", "market"]}
        colors={["blue", "slate"]}
        valueFormatter={(v: number) => `${v.toFixed(1)}%`}
        layout="vertical"
        showLegend={true}
        yAxisWidth={48}
      />
    </div>
  );
}

/**
 * INSIDER SENTIMENT BAR — data-to-viz: Diverging bar for net insider trading.
 * Positive = net buying (bullish), Negative = net selling (bearish).
 */
function InsiderSentimentChart({ data }: { data: InsiderSentimentPoint[] }) {
  return (
    <div className="h-72">
      <TremorBar
        data={data}
        index="quarter"
        categories={["netValue"]}
        colors={["teal"]}
        valueFormatter={(v: number) => `R$ ${(v / 1e6).toFixed(1)}M`}
        showLegend={false}
        showGridLines={true}
        yAxisWidth={56}
      />
    </div>
  );
}

/**
 * DIVIDEND vs EARNINGS — data-to-viz: Grouped Bar Chart.
 * Shows dividend sustainability: earnings should always cover dividends.
 */
function DividendVsEarningsChart({ data }: { data: DividendVsEarnings[] }) {
  return (
    <div className="h-72">
      <TremorBar
        data={data}
        index="year"
        categories={["earnings", "dividend"]}
        colors={["sky", "violet"]}
        valueFormatter={(v: number) => `R$ ${v.toFixed(2)}`}
        showLegend={true}
        showGridLines={true}
        yAxisWidth={48}
      />
    </div>
  );
}

/**
 * REWARDS & RISK ANALYSIS — SimplyWall.St style star/warning list.
 * Shows investment highlights (green stars) and risk factors (orange warnings).
 */
function RewardsAndRisks({ items }: { items: RewardRisk[] }) {
  const rewards = items.filter(i => i.type === 'reward').slice(0, 3);
  const risks = items.filter(i => i.type === 'risk').slice(0, 3);
  const leadReward = rewards[0];
  const leadRisk = risks[0];

  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4">
        <p className="text-sm font-semibold text-neutral-900">
          {leadReward?.text ?? 'A tese tem pontos fortes relevantes'}
          {leadRisk ? `, mas pede cuidado com ${leadRisk.text.toLowerCase()}.` : '.'}
        </p>
        <p className="mt-2 text-sm text-neutral-600">
          {leadReward?.detail ?? 'Os fundamentos positivos aparecem de forma consistente na leitura atual.'}
          {leadRisk?.detail ? ` O principal ponto de atencao hoje vem de ${leadRisk.detail.toLowerCase()}.` : ''}
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div>
        <h4 className="text-sm font-semibold text-green-700 mb-3 flex items-center gap-1.5">
          <Star className="w-4 h-4 fill-green-500 text-green-500" />
          Principais forcas
        </h4>
        <div className="space-y-2.5">
          {rewards.map((r, i) => (
            <div key={i} className="flex items-start gap-2.5 group">
              <Star className="w-4 h-4 flex-shrink-0 mt-0.5 fill-amber-400 text-amber-400" />
              <div>
                <p className="text-sm text-neutral-800 font-medium">{r.text}</p>
                {r.detail && <p className="text-xs text-neutral-500 mt-0.5">{r.detail}</p>}
              </div>
            </div>
          ))}
        </div>
      </div>
      <div>
        <h4 className="text-sm font-semibold text-red-700 mb-3 flex items-center gap-1.5">
          <AlertTriangle className="w-4 h-4 text-red-500" />
          Principais riscos
        </h4>
        <div className="space-y-2.5">
          {risks.map((r, i) => (
            <div key={i} className="flex items-start gap-2.5 group">
              <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5 text-orange-500" />
              <div>
                <p className="text-sm text-neutral-800 font-medium">{r.text}</p>
                {r.detail && <p className="text-xs text-neutral-500 mt-0.5">{r.detail}</p>}
              </div>
            </div>
          ))}
        </div>
      </div>
      </div>
    </div>
  );
}

/**
 * COMPETITOR SNOWFLAKE GRID — SimplyWall.St competitors with mini snowflakes.
 * Uses small multiples pattern (data-to-viz best practice).
 */
function CompetitorGrid({ competitors }: { competitors: Competitor[] }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {competitors.map((comp) => {
        const dims: SnowflakeDimension[] = [
          { label: 'Valor', value: comp.scores.value, color: COLORS.value, why: '', metric: '' },
          { label: 'Futuro', value: comp.scores.future, color: COLORS.future, why: '', metric: '' },
          { label: 'Passado', value: comp.scores.past, color: COLORS.past, why: '', metric: '' },
          { label: 'Saúde', value: comp.scores.health, color: COLORS.health, why: '', metric: '' },
          { label: 'Dividendo', value: comp.scores.dividend, color: COLORS.dividend, why: '', metric: '' },
        ];
        const avg = Object.values(comp.scores).reduce((a, b) => a + b, 0) / 5;
        const status = avg >= 60 ? 'healthy' : avg >= 40 ? 'attention' : 'risk';
        const summary = getCompetitorSummary(comp);

        return (
          <div key={comp.ticker} className="bg-neutral-50 rounded-xl p-4 hover:bg-neutral-100 transition-colors cursor-pointer border border-transparent hover:border-neutral-200">
            <div className="flex justify-center mb-2">
              <SnowflakeChart dimensions={dims} size="small" status={status as any} />
            </div>
            <div className="text-sm font-bold text-neutral-900">{comp.name}</div>
            <div className="text-xs text-neutral-500 font-mono">{comp.exchange}:{comp.ticker}</div>
            <div className="mt-3 rounded-xl bg-white/80 p-3 text-left">
              <div className="text-xs font-semibold uppercase text-neutral-500">Sintese</div>
              <div className="mt-1 text-sm font-semibold text-neutral-900">{summary.synthesis}</div>
              <div className="mt-1 text-xs text-neutral-600">{summary.differential}</div>
            </div>
            <div className="text-xs text-neutral-400 mt-2">{comp.marketCap}</div>
          </div>
        );
      })}
    </div>
  );
}

/**
 * SWS-style donut: dark ring (#3E4855) + colored data slice.
 * Uses stroke-dasharray on circle — same visual as SWS SVG path approach.
 */
function SWSDonut({
  value, total, sliceColor, centerLabel, centerValue,
  sliceLabel, sliceDisplayValue, size = 180,
}: {
  value: number; total: number; sliceColor: string;
  centerLabel: string; centerValue: string;
  sliceLabel?: string; sliceDisplayValue?: string; size?: number;
}) {
  const cx = size / 2;
  const cy = size / 2;
  const scale = size / 200;
  const r  = 74 * scale;
  const sw = 36 * scale;
  const outerR = 92 * scale; // outer edge of ring

  const circumference = 2 * Math.PI * r;
  const pct  = Math.min(Math.max(value / total, 0), 1);
  const dash = pct * circumference;

  // Annotation: line from midpoint of slice outward
  const midAngleDeg = -90 + (pct * 360) / 2;
  const midAngleRad = (midAngleDeg * Math.PI) / 180;
  const lineLen = 28 * scale;
  const lx1 = cx + outerR * Math.cos(midAngleRad);
  const ly1 = cy + outerR * Math.sin(midAngleRad);
  const lx2 = cx + (outerR + lineLen) * Math.cos(midAngleRad);
  const ly2 = cy + (outerR + lineLen) * Math.sin(midAngleRad);
  const isRight = lx2 >= cx;
  const textX = lx2 + (isRight ? 6 : -6);
  const anchor = isRight ? 'start' : 'end';

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} overflow="visible">
      {/* Background ring */}
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="#3E4855" strokeWidth={sw} />
      {/* Data slice — starts at top */}
      {pct > 0 && (
        <circle
          cx={cx} cy={cy} r={r}
          fill="none" stroke={sliceColor}
          strokeWidth={sw}
          strokeDasharray={`${dash} ${circumference}`}
          strokeLinecap="butt"
          transform={`rotate(-90 ${cx} ${cy})`}
        />
      )}
      {/* Annotation line + dot + labels */}
      {pct > 0 && sliceLabel && (
        <>
          <line x1={lx1} y1={ly1} x2={lx2} y2={ly2} stroke={sliceColor} strokeWidth={1} />
          <circle cx={lx2} cy={ly2} r={2.5 * scale} fill={sliceColor} />
          <text x={textX} y={ly2 - 8 * scale} textAnchor={anchor}
            fontSize={16 * scale} fontWeight="600" fill="#94a3b8" fontFamily="Inter,sans-serif">
            {sliceLabel}
          </text>
          <text x={textX} y={ly2 + 10 * scale} textAnchor={anchor}
            fontSize={13 * scale} fill="#475569" fontFamily="Inter,sans-serif">
            {sliceDisplayValue}
          </text>
        </>
      )}
      {/* Center labels */}
      <text x={cx} y={cy - 5} textAnchor="middle" fontSize={10 * scale + 2} fill="#94a3b8" fontFamily="Inter,sans-serif">
        {centerLabel}
      </text>
      <text x={cx} y={cy + 13 * scale} textAnchor="middle" fontSize={12 * scale + 1} fontWeight="600" fill="#1e293b" fontFamily="Inter,sans-serif">
        {centerValue}
      </text>
    </svg>
  );
}

/**
 * KEY VALUATION METRIC — Simply Wall St style.
 * Tabs: PE | PS | PB | Outros. Star callout + donut + big ratio number.
 */
function KeyValuationMetric({ data }: { data: AnalysisData }) {
  const [activeTab, setActiveTab] = useState<'pe' | 'ps' | 'pb'>('pe');
  const rv = data.relativeValuation;
  const comp = data.marketCapComposition;

  const tabs = [
    { id: 'pe' as const, label: 'P/L' },
    { id: 'ps' as const, label: 'P/S' },
    { id: 'pb' as const, label: 'P/VP' },
  ];

  const metricConfig = {
    pe: {
      ratio: rv.peRatio,
      label: 'Índice P/L',
      desc: `Como a empresa é lucrativa, usamos o Índice Preço/Lucro para análise de valuation relativo.`,
      sliceValue: comp.earnings,
      sliceLabel: 'Lucro',
      sliceColor: '#38bdf8', // sky-400
    },
    ps: {
      ratio: comp.psRatio,
      label: 'Índice P/S',
      desc: `Preço da ação em relação à receita gerada — útil para empresas em crescimento.`,
      sliceValue: comp.revenue,
      sliceLabel: 'Receita',
      sliceColor: '#a78bfa', // violet-400
    },
    pb: {
      ratio: rv.pbRatio,
      label: 'Índice P/VP',
      desc: `Preço da ação em relação ao valor patrimonial contábil por ação.`,
      sliceValue: comp.earnings * 4,
      sliceLabel: 'Patrimônio',
      sliceColor: '#2dd4bf', // teal-400
    },
  };

  const active = metricConfig[activeTab];

  return (
    <div>
      {/* Tabs */}
      <div className="flex gap-1 mb-4">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? 'bg-neutral-900 text-white'
                : 'text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-5">
        {/* Callout cinza — ocupa o espaço restante à esquerda */}
        <div className="bg-neutral-200/60 rounded-xl p-3 flex-1">
          <div className="flex items-start gap-2">
            <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-neutral-600 leading-relaxed">
              <span className="font-semibold text-neutral-800">Métrica principal: </span>
              {active.desc}
            </p>
          </div>
        </div>

        {/* Donut + ratio — juntos à direita */}
        <div className="flex items-center gap-5 flex-shrink-0">
          <div className="flex flex-col items-center gap-2">
            <SWSDonut
              value={active.sliceValue}
              total={comp.marketCap}
              sliceColor={active.sliceColor}
              centerLabel="Cap. de Mercado"
              centerValue={`R$ ${formatNumber(comp.marketCap)}M`}
              sliceLabel={active.sliceLabel}
              sliceDisplayValue={`R$ ${formatNumber(active.sliceValue)}M`}
              size={180}
            />
          </div>

          <div className="pl-5 border-l border-neutral-100">
            <div className="text-[3rem] font-bold leading-none text-neutral-900">{active.ratio}x</div>
            <div className="text-xs text-neutral-400 mt-1.5">{active.label}</div>
          </div>
        </div>
      </div>

      {/* Botões de ação */}
      <div className="flex gap-2 mt-5 pt-4 border-t border-neutral-100 justify-end">
        <button className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium bg-neutral-100 text-neutral-700 hover:bg-neutral-200 transition-colors">
          <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
            <rect x="2" y="3" width="12" height="10" rx="1.5" />
            <path d="M5 7h6M5 10h4" strokeLinecap="round" />
          </svg>
          Dados
        </button>
        <button className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium bg-neutral-100 text-neutral-700 hover:bg-neutral-200 transition-colors">
          <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
            <circle cx="8" cy="8" r="6" />
            <path d="M8 7v4M8 5.5v.5" strokeLinecap="round" />
          </svg>
          Aprender
        </button>
      </div>
    </div>
  );
}

/**
 * HISTORICAL RATIO CHART — SWS-style historical PE/PS/PB line chart with period tabs.
 */
function HistoricalRatioChart({ data }: { data: AnalysisData }) {
  const [activeRatio, setActiveRatio] = useState<'pe' | 'ps' | 'pb'>('pe');
  const [activePeriod, setActivePeriod] = useState<'3M' | '1Y' | '3Y' | '5Y'>('5Y');

  const rv = data.relativeValuation;
  const ticker = data.company.ticker;

  const currentValues = { pe: rv.peRatio, ps: rv.peRatio * 0.6, pb: rv.pbRatio };
  const baseVal = currentValues[activeRatio];
  const months = { '3M': 3, '1Y': 12, '3Y': 36, '5Y': 60 };
  const n = months[activePeriod];
  const points = Math.min(n, 30);

  const chartData = Array.from({ length: points }, (_, i) => {
    const t = i / (points - 1);
    const wave = Math.sin(i * 0.9) * baseVal * 0.12 + Math.cos(i * 1.5) * baseVal * 0.06;
    const trend = (1 - t) * baseVal * 0.28;
    const val = Math.max(0.5, baseVal - trend + wave);
    const d = new Date();
    d.setMonth(d.getMonth() - Math.round((n - i - 1) * (n / points)));
    const label = d.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' });
    return { data: label, Índice: parseFloat(val.toFixed(1)), _year: d.getFullYear() };
  });

  // Year boundary labels for inside-chart overlay
  const yearLabels: { pct: number; year: number }[] = [];
  let lastYear = -1;
  chartData.forEach((pt, i) => {
    if (pt._year !== lastYear) {
      yearLabels.push({ pct: (i / (points - 1)) * 100, year: pt._year });
      lastYear = pt._year;
    }
  });
  const visibleYearCount = { '3M': 1, '1Y': 1, '3Y': 3, '5Y': 5 }[activePeriod];
  const visibleYearLabels = yearLabels.slice(-visibleYearCount);

  const ratioLabels = { pe: 'Relação preço/lucro', ps: 'Relação preço/vendas', pb: 'Preço para reserva' };
  const periodLabels: Record<string, string> = { '3M': '3M', '1Y': '1 ano', '3Y': '3 anos', '5Y': '5 anos' };
  const companyLabel = data.company.name?.split(' ')[0]?.toUpperCase() || ticker.replace(/\d+$/, '');

  function HistoricalRatioTooltip({ active, payload }: CustomTooltipProps) {
    if (!active || !payload?.[0]?.payload) return null;

    const point = payload[0].payload as { data?: string };
    const rawValue = typeof payload[0].value === 'number' ? payload[0].value : Number(payload[0].value);
    if (rawValue == null) return null;

    const tooltipDate = (() => {
      const parsed = point.data ? new Date(`01 ${point.data}`) : null;
      if (!parsed || Number.isNaN(parsed.getTime())) return point.data ?? '';
      return parsed.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
    })();

    return (
      <div className="w-[340px] rounded-md border border-neutral-200 bg-white shadow-sm">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th colSpan={2} className="border-b border-neutral-200 px-3 py-2 text-left text-sm font-semibold text-neutral-800">
                {tooltipDate}
              </th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="px-3 py-2 text-sm font-semibold text-neutral-800">{companyLabel}</td>
              <td className="px-3 py-2 text-right text-sm font-semibold text-sky-600">
                {rawValue.toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}x
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    );
  }

  return (
    <div>
      <p className="text-sm text-neutral-500 leading-relaxed mb-5">
        O Índice Preço/Lucro Histórico compara o preço de uma ação com seus lucros ao longo do tempo. Índices mais altos indicam que os investidores estão dispostos a pagar mais pela ação.
      </p>

      {/* Controls row */}
      <div className="flex items-center justify-between mb-4">
        {/* Ratio dropdown */}
        <div className="relative inline-block">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-neutral-200 text-sm text-neutral-700 cursor-pointer hover:bg-neutral-50 select-none">
            <svg className="w-4 h-4 text-amber-400 fill-amber-400" viewBox="0 0 24 24"><path d="M11.0496 5.90475C11.3502 4.98605 12.6498 4.98605 12.9504 5.90475L14.1246 9.49342H17.9049C18.8753 9.49342 19.2769 10.7366 18.49 11.3044L15.4377 13.5066L16.6073 17.0812C16.9083 18.0012 15.8568 18.7695 15.0718 18.2031L12 15.9868L8.92824 18.2031C8.14316 18.7695 7.09168 18.0012 7.39272 17.0812L8.56231 13.5066L5.51002 11.3044C4.72306 10.7366 5.12471 9.49342 6.09512 9.49342H9.87539L11.0496 5.90475Z"/></svg>
            <span>{ratioLabels[activeRatio]}</span>
            <svg className="w-4 h-4 text-neutral-400" viewBox="0 0 24 24" fill="currentColor"><path fillRule="evenodd" clipRule="evenodd" d="M16.9497 9.0474C16.5592 8.65688 15.9261 8.65688 15.5355 9.0474L12 12.5829L8.46447 9.0474C8.07394 8.65688 7.44078 8.65688 7.05025 9.0474C6.65973 9.43793 6.65973 10.0711 7.05025 10.4616L11.2929 14.7043C11.6834 15.0948 12.3166 15.0948 12.7071 14.7043L16.9497 10.4616C17.3403 10.0711 17.3403 9.43793 16.9497 9.0474Z"/></svg>
          </div>
          {/* Hidden select for actual interactivity */}
          <select
            value={activeRatio}
            onChange={e => setActiveRatio(e.target.value as 'pe' | 'ps' | 'pb')}
            className="absolute inset-0 opacity-0 cursor-pointer w-full"
          >
            <option value="pe">Relação preço/lucro</option>
            <option value="ps">Relação preço/vendas</option>
            <option value="pb">Preço para reserva</option>
          </select>
        </div>

        {/* Period tabs */}
        <div className="flex rounded-lg border border-neutral-200 overflow-hidden divide-x divide-neutral-200 text-xs">
          {(['3M', '1Y', '3Y', '5Y'] as const).map(p => (
            <button
              key={p}
              onClick={() => setActivePeriod(p)}
              className={`px-3 py-1.5 transition-colors ${activePeriod === p ? 'bg-neutral-900 text-white font-medium' : 'bg-white text-neutral-500 hover:bg-neutral-50'}`}
            >
              {periodLabels[p]}
            </button>
          ))}
        </div>
      </div>

      {/* Chart — dark themed */}
      <div
        className="rounded-xl overflow-hidden border border-neutral-200 bg-white [&_.recharts-area-curve]:stroke-[hsl(204,73%,46%)] [&_.recharts-area-curve]:stroke-[2px] [&_.recharts-area-area]:fill-[hsl(204,75%,51%)] [&_.recharts-area-area]:fill-opacity-25"
      >
        <div className="h-64">
          <TremorArea
            data={chartData}
            index="data"
            categories={['Índice']}
            colors={['sky']}
            customTooltip={HistoricalRatioTooltip}
            showLegend={false}
            showGridLines={true}
            showXAxis={true}
            showYAxis={true}
            curveType="monotone"
            yAxisWidth={36}
            valueFormatter={(v: number) => `${v}x`}
          />
        </div>
      </div>
      <div className="relative mx-10 h-6">
        {visibleYearLabels.map(label => (
          <span
            key={label.year}
            className="absolute -translate-x-1/2 text-xs font-semibold text-neutral-600"
            style={{ left: `${label.pct}%` }}
          >
            {label.year}
          </span>
        ))}
      </div>

      {/* Bottom legend + actions */}
      <div className="flex items-center justify-between mt-3">
        {/* Ticker legend */}
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-sky-400 inline-block" />
          <span className="text-xs text-neutral-500 font-medium">BOVESPA:{ticker}</span>
        </div>
        {/* Action buttons */}
        <div className="flex items-center gap-2">
          <button className="inline-flex items-center gap-1.5 h-8 px-3 text-xs font-normal border border-solid border-neutral-300 rounded-md bg-white text-neutral-600 hover:bg-neutral-50 hover:border-neutral-400 transition-colors select-none">
            <svg className="w-5 h-5 opacity-75 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path fillRule="evenodd" clipRule="evenodd" d="M6 8V7H18V8H13H12H10H9H6ZM6 9V11H9V9H6ZM6 12V14H9V12H6ZM6 15V17H9V15H6ZM10 17H12V15H10V17ZM13 17H18V15H13V17ZM18 14V12H13V14H18ZM18 11V9H13V11H18ZM5 6.5C5 6.22386 5.22386 6 5.5 6H18.5C18.7761 6 19 6.22386 19 6.5V17.5C19 17.7761 18.7761 18 18.5 18H5.5C5.22386 18 5 17.7761 5 17.5V6.5ZM12 14H10V12H12V14ZM12 9H10V11H12V9Z" />
            </svg>
            Dados
          </button>
          <button className="inline-flex items-center justify-center h-8 w-8 border border-solid border-neutral-300 rounded-md bg-white text-neutral-600 hover:bg-neutral-50 hover:border-neutral-400 transition-colors select-none text-sm font-medium">
            ···
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * PE VS PEERS — SWS-style horizontal bar chart comparing PE ratio with peers.
 */
function HistoricalRatioChartExact({ data }: { data: AnalysisData }) {
  const [activeRatio, setActiveRatio] = useState<'pe' | 'ps' | 'pb'>('pe');
  const [activePeriod, setActivePeriod] = useState<'3M' | '1Y' | '3Y' | '5Y'>('5Y');

  const rv = data.relativeValuation;
  const ticker = data.company.ticker;
  const currentValues = { pe: rv.peRatio, ps: rv.peRatio * 0.6, pb: rv.pbRatio };
  const baseVal = currentValues[activeRatio];
  const months = { '3M': 3, '1Y': 12, '3Y': 36, '5Y': 60 };
  const n = months[activePeriod];
  const points = Math.min(Math.max(Math.round(n / 1.8), 18), 34);
  const chartWidth = 640;
  const chartHeight = 252;
  const plotLeft = 28;
  const plotTop = 42;
  const plotWidth = 580;
  const plotHeight = 158;
  const plotBottom = plotTop + plotHeight;

  const ratioLabels = {
    pe: 'Relação preço/lucro',
    ps: 'Relação preço/vendas',
    pb: 'Preço para reserva',
  };

  const seriesLabel = activeRatio === 'pe' ? ticker.replace(/\d+$/, '') : activeRatio === 'ps' ? 'Receita' : 'Reserva';

  const chartData = useMemo(() => Array.from({ length: points }, (_, i) => {
    const t = i / Math.max(points - 1, 1);
    const wave = Math.sin(i * 0.47) * baseVal * 0.16 + Math.cos(i * 0.89) * baseVal * 0.08;
    const trend = (1 - t) * baseVal * 0.32;
    const val = Math.max(1, baseVal - trend + wave);
    const d = new Date();
    d.setMonth(d.getMonth() - Math.round((n - i - 1) * (n / points)));
    return { date: d, year: d.getFullYear(), value: parseFloat(val.toFixed(1)) };
  }), [baseVal, n, points]);

  const peak = Math.max(...chartData.map(point => point.value));
  const chartMax = Math.ceil((peak + 4) / 10) * 10;
  const gridValues = [chartMax, chartMax * 0.66, chartMax * 0.33, 0];

  const coordinates = chartData.map((point, index) => {
    const x = plotLeft + (index / Math.max(chartData.length - 1, 1)) * plotWidth;
    const y = plotTop + (1 - point.value / chartMax) * plotHeight;
    return { ...point, x, y };
  });

  const buildSmoothPath = (pts: typeof coordinates) => {
    if (pts.length < 2) return '';
    const parts = [`M${pts[0].x},${pts[0].y}`];
    for (let i = 0; i < pts.length - 1; i += 1) {
      const current = pts[i];
      const next = pts[i + 1];
      const cx = (current.x + next.x) / 2;
      parts.push(`C${cx},${current.y} ${cx},${next.y} ${next.x},${next.y}`);
    }
    return parts.join(' ');
  };

  const linePath = buildSmoothPath(coordinates);
  const areaPath = `${linePath} L${coordinates[coordinates.length - 1].x},${plotBottom} L${coordinates[0].x},${plotBottom} Z`;
  const focusIndex = Math.max(1, Math.round(coordinates.length * (activePeriod === '5Y' ? 0.82 : 0.58)));
  const focusPoint = coordinates[Math.min(focusIndex, coordinates.length - 1)];

  const yearTicks = useMemo(() => {
    const years = new Map<number, number>();
    chartData.forEach((point, index) => {
      if (!years.has(point.year) && point.year >= 2022) years.set(point.year, index);
    });
    return Array.from(years.entries()).map(([year, index]) => ({
      year,
      x: plotLeft + (index / Math.max(chartData.length - 1, 1)) * plotWidth,
    }));
  }, [chartData]);

  const tooltipDate = focusPoint.date.toLocaleDateString('pt-BR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <div>
      <p className="text-sm leading-relaxed text-neutral-600">
        O Índice Preço/Lucro Histórico compara o preço de uma ação com seus lucros ao longo do tempo. Índices mais altos indicam que os investidores estão dispostos a pagar mais pela ação.
      </p>

      <div className="mt-4 rounded-2xl border border-neutral-200 bg-neutral-50/70 p-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="relative">
            <button type="button" className="inline-flex items-center gap-2 rounded-full border border-neutral-300 bg-white px-4 py-2 text-sm font-medium text-neutral-700 shadow-sm">
              <svg className="h-4 w-4 fill-amber-400 text-amber-400" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M11.0496 5.90475C11.3502 4.98605 12.6498 4.98605 12.9504 5.90475L14.1246 9.49342H17.9049C18.8753 9.49342 19.2769 10.7366 18.49 11.3044L15.4377 13.5066L16.6073 17.0812C16.9083 18.0012 15.8568 18.7695 15.0718 18.2031L12 15.9868L8.92824 18.2031C8.14316 18.7695 7.09168 18.0012 7.39272 17.0812L8.56231 13.5066L5.51002 11.3044C4.72306 10.7366 5.12471 9.49342 6.09512 9.49342H9.87539L11.0496 5.90475Z" />
              </svg>
              <span>{ratioLabels[activeRatio]}</span>
              <svg className="h-4 w-4 text-neutral-500" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path fillRule="evenodd" clipRule="evenodd" d="M16.9497 9.0474C16.5592 8.65688 15.9261 8.65688 15.5355 9.0474L12 12.5829L8.46447 9.0474C8.07394 8.65688 7.44078 8.65688 7.05025 9.0474C6.65973 9.43793 6.65973 10.0711 7.05025 10.4616L11.2929 14.7043C11.6834 15.0948 12.3166 15.0948 12.7071 14.7043L16.9497 10.4616C17.3403 10.0711 17.3403 9.43793 16.9497 9.0474Z" />
              </svg>
            </button>
            <select value={activeRatio} onChange={e => setActiveRatio(e.target.value as 'pe' | 'ps' | 'pb')} className="absolute inset-0 cursor-pointer opacity-0" aria-label="Selecionar relação histórica">
              <option value="pe">Relação preço/lucro</option>
              <option value="ps">Relação preço/vendas</option>
              <option value="pb">Preço para reserva</option>
            </select>
          </div>

          <div className="inline-flex w-fit items-center rounded-md bg-neutral-100 p-1">
            {[['3M', '3M'], ['1Y', '1 ano'], ['3Y', '3 anos'], ['5Y', '5 anos']].map(period => (
              <button
                key={period[0]}
                type="button"
                disabled={activePeriod === period[0]}
                onClick={() => setActivePeriod(period[0] as '3M' | '1Y' | '3Y' | '5Y')}
                className={`rounded-md px-3 py-2 text-sm font-medium transition ${activePeriod === period[0] ? 'bg-neutral-900 text-white' : 'text-neutral-600 hover:bg-white'}`}
              >
                {period[1]}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-4 rounded-xl bg-[linear-gradient(180deg,rgba(251,252,253,1)_0%,rgba(244,247,250,1)_100%)] px-1 pt-2">
          <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="h-auto w-full">
            <defs>
              <linearGradient id="historical-chart-area" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#1f9cf0" stopOpacity="0.25" />
                <stop offset="100%" stopColor="#1f9cf0" stopOpacity="0.06" />
              </linearGradient>
            </defs>

            {gridValues.map((value, index) => {
              const y = plotTop + (1 - value / chartMax) * plotHeight;
              return (
                <g key={value}>
                  <rect y={y} height="1" width={chartWidth} fill="#cbd5e1" fillOpacity={index === 0 || index === gridValues.length - 1 ? 0.45 : 0.24} />
                  {(index === 0 || index === gridValues.length - 1) && (
                    <text x="6" y={index === 0 ? y - 6 : y - 2} fill="#334155" textAnchor="start" fontSize="12" fontWeight="700">
                      {Math.round(value)}
                    </text>
                  )}
                </g>
              );
            })}

            {yearTicks.map(tick => (
              <g key={tick.year} transform={`translate(${tick.x},${plotBottom + 1})`}>
                <rect width="1" height="4" fill="#cbd5e1" fillOpacity="0.45" />
                <text x="0" y="18" fill="#475569" textAnchor="middle" fontSize="12" fontWeight="600">{tick.year}</text>
              </g>
            ))}

            <path d={areaPath} fill="url(#historical-chart-area)" />
            <path d={linePath} fill="transparent" stroke="#1f9cf0" strokeWidth="3" strokeLinecap="round" />
            <rect y={plotTop} x={focusPoint.x} width="1" height={plotHeight} fill="#94a3b8" fillOpacity="0.5" />
            <circle cx={focusPoint.x} cy={focusPoint.y} r="4" fill="#1f9cf0" stroke="#ffffff" strokeWidth="1" />

            <g transform={`translate(${Math.min(Math.max(focusPoint.x - 90, 90), 360)}, 6)`}>
              <rect width="220" height="48" rx="4" fill="#ffffff" fillOpacity="0.96" />
              <text x="10" y="18" fill="#111827" fontSize="12" fontWeight="700">{tooltipDate}</text>
              <line x1="10" x2="210" y1="26" y2="26" stroke="#e5e7eb" />
              <text x="10" y="40" fill="#111827" fontSize="12" fontWeight="700">{seriesLabel}</text>
              <text x="74" y="40" fill="#1f9cf0" fontSize="12" fontWeight="700">
                {focusPoint.value.toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}x
              </text>
            </g>
          </svg>

          <div className="mt-2 flex items-center">
            <button type="button" className="inline-flex items-center rounded-md border border-neutral-200 bg-neutral-100 px-3 py-1.5 text-[11px] font-medium text-neutral-600">
              BOVESPA:{ticker}
            </button>
          </div>
        </div>

        <div className="mt-3 flex items-center justify-end gap-2">
          <button type="button" className="inline-flex h-8 items-center justify-center gap-2 rounded-md border border-neutral-300 bg-white px-3 text-xs font-normal text-neutral-700 transition hover:bg-neutral-50">
            <svg className="h-4 w-4 fill-current opacity-75" viewBox="0 0 24 24" aria-hidden="true">
              <path fillRule="evenodd" clipRule="evenodd" d="M6 8V7H18V8H13H12H10H9H6ZM6 9V11H9V9H6ZM6 12V14H9V12H6ZM6 15V17H9V15H6ZM10 17H12V15H10V17ZM13 17H18V15H13V17ZM18 14V12H13V14H18ZM18 11V9H13V11H18ZM5 6.5C5 6.22386 5.22386 6 5.5 6H18.5C18.7761 6 19 6.22386 19 6.5V17.5C19 17.7761 18.7761 18 18.5 18H5.5C5.22386 18 5 17.7761 5 17.5V6.5ZM12 14H10V12H12V14ZM12 9H10V11H12V9Z" />
            </svg>
            <span className="hidden md:inline">Dados</span>
          </button>
          <button type="button" className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-neutral-300 bg-white text-neutral-600 transition hover:bg-neutral-50" aria-label="Mais">
            <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24" aria-hidden="true">
              <path fillRule="evenodd" clipRule="evenodd" d="M6 12C6 11.4477 6.44772 11 7 11C7.55228 11 8 11.4477 8 12C8 12.5523 7.55228 13 7 13C6.44772 13 6 12.5523 6 12ZM11 12C11 11.4477 11.4477 11 12 11C12.5523 11 13 11.4477 13 12C13 12.5523 12.5523 13 12 13C11.4477 13 11 12.5523 11 12ZM17 11C16.4477 11 16 11.4477 16 12C16 12.5523 16.4477 13 17 13C17.5523 13 18 12.5523 18 12C18 11.4477 17.5523 11 17 11Z" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

function PEVsPeersChart({ data }: { data: AnalysisData }) {
  const myPE = data.relativeValuation.peRatio;
  const myName = data.company.ticker;

  const myEG = data.growth.earningsGrowthRate;

  // Build rows: company + peers, sorted descending by PE
  const rows = [
    { name: myName, pe: myPE, earningsGrowth: myEG, isMain: true },
    ...data.competitors
      .filter(c => c.pe != null)
      .map(c => ({ name: c.ticker, pe: c.pe as number, earningsGrowth: c.earningsGrowth ?? null, isMain: false })),
  ].sort((a, b) => b.pe - a.pe);

  const allPEs = rows.map(r => r.pe);
  const peerPEs = rows.filter(r => !r.isMain).map(r => r.pe);
  const peerAvg = peerPEs.length ? peerPEs.reduce((s, v) => s + v, 0) / peerPEs.length : myPE;
  const maxPE = Math.ceil(Math.max(...allPEs) * 1.15 / 10) * 10;

  // X-axis ticks
  const ticks = [0, 0.25, 0.5, 0.75, 1].map(t => Math.round(t * maxPE));
  const peerAvgPct = (peerAvg / maxPE) * 100;

  const BAR_H = 44;
  const GAP = 8;
  const totalH = rows.length * (BAR_H + GAP) - GAP;

  return (
    <div>
      <div className="flex gap-0 items-start" style={{ paddingTop: 40 }}>
      {/* Chart area */}
      <div className="flex-1 relative" style={{ height: totalH + 24, overflow: 'visible' }}>
        {/* Background zones */}
        <div className="absolute inset-0 flex" style={{ bottom: 24 }}>
          <div className="h-full" style={{ width: `${peerAvgPct}%`, background: '#bbf7d0' }} />
          <div className="h-full" style={{ width: `${100 - peerAvgPct}%`, background: '#fecaca' }} />
        </div>

        {/* Peer avg vertical line */}
        <div
          className="absolute top-0 z-10"
          style={{ left: `${peerAvgPct}%`, bottom: 24 }}
        >
          <div className="w-0.5 h-full" style={{ background: '#f59e0b' }} />
        </div>

        {/* Avg label badge — sits right at the top of the chart line */}
        <div className="absolute z-20" style={{ left: `${peerAvgPct}%`, top: 0 }}>
          {/* Badge: extends left from line, bottom at chart top */}
          <div
            style={{
              position: 'absolute',
              right: 0,
              top: 0,
              transform: 'translateY(calc(-100% - 6px))',
              background: '#f59e0b',
              color: '#1c1917',
              borderRadius: 2,
              fontSize: 11,
              fontWeight: 600,
              padding: '4px 8px',
              whiteSpace: 'nowrap',
            }}
          >
            Média {peerAvg.toFixed(1)}x
          </div>
          {/* Triangle pointing down into the chart */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              transform: 'translateX(-50%)',
              width: 0,
              height: 0,
              borderLeft: '5px solid transparent',
              borderRight: '5px solid transparent',
              borderTop: '6px solid #f59e0b',
            }}
          />
        </div>

        {/* Bars */}
        <div className="absolute inset-x-0 z-10" style={{ top: 0, bottom: 24 }}>
          {rows.map((row, i) => {
            const pct = (row.pe / maxPE) * 100;
            const top = i * (BAR_H + GAP);
            return (
              <div key={row.name} className="absolute inset-x-0" style={{ top, height: BAR_H }}>
                <div className="relative h-full">
                  {/* Bar */}
                  <div
                    className="absolute left-0 top-0 h-full rounded-sm overflow-hidden"
                    style={{ width: `${pct}%` }}
                  >
                    {/* Green base (full bar) */}
                    <div
                      className="absolute inset-0"
                      style={{ background: row.isMain ? '#166534' : '#15803d' }}
                    />
                    {/* Dark overlay only on the portion exceeding peer average */}
                    {row.pe > peerAvg && (
                      <div
                        className="absolute top-0 bottom-0"
                        style={{
                          left: `${(peerAvgPct / pct) * 100}%`,
                          right: 0,
                          background: 'rgba(0,0,0,0.38)',
                        }}
                      />
                    )}
                    {/* Right-edge white marker */}
                    <div className="absolute right-0 top-0 w-0.5 h-full bg-white/70" />
                    {/* Value + name — on top of everything */}
                    <div className="absolute left-2 top-0 bottom-0 flex flex-col justify-center gap-0.5 z-10" style={{ WebkitFontSmoothing: 'antialiased' }}>
                      <span style={{ fontSize: 12, fontWeight: 600, color: '#ffffff', lineHeight: 1 }}>
                        {row.pe.toFixed(1)}x
                      </span>
                      <span style={{ fontSize: 12, fontWeight: 400, color: 'rgba(255,255,255,0.7)', lineHeight: 1 }}>
                        {row.name}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* X-axis */}
        <div className="absolute inset-x-0 bottom-0 flex border-t border-neutral-200/60" style={{ height: 24 }}>
          {ticks.map((tick, i) => (
            <div
              key={tick}
              className="absolute flex flex-col items-center"
              style={{ left: `${(tick / maxPE) * 100}%` }}
            >
              <div className="w-px h-1 bg-neutral-300" />
              <span
                className="text-[10px] text-neutral-400 mt-0.5"
                style={{
                  transform: i === 0 ? 'translateX(0)' : i === ticks.length - 1 ? 'translateX(-100%)' : 'translateX(-50%)',
                }}
              >
                {i === 0 ? 'P/L' : tick}
              </span>
            </div>
          ))}
        </div>
      </div>

        {/* Right column — Crescimento de Lucro */}
        <div className="flex-shrink-0 w-24 flex flex-col" style={{ height: totalH + 24 }}>
          {/* Data rows — aligns directly with bars (no top offset) */}
          <div className="rounded-sm flex flex-col relative" style={{ background: '#f1f5f9', height: totalH }}>
            {/* Column header floated above, matching the badge area */}
            <div
              className="absolute right-2 text-[9px] uppercase font-medium text-neutral-400 leading-none whitespace-nowrap"
              style={{ bottom: '100%', paddingBottom: 6 }}
            >
              Cresc. Lucro
            </div>
            {rows.map((row, i) => {
              const eg = row.earningsGrowth;
              const egLabel = eg != null ? eg.toFixed(1) + '%' : '—';
              const mb = i < rows.length - 1 ? GAP : 0;
              return (
                <div
                  key={row.name}
                  className="flex items-center justify-end pr-2"
                  style={{ height: BAR_H, marginBottom: mb }}
                >
                  <span style={{ fontSize: 12, fontWeight: 600, color: '#111827', lineHeight: 1 }}>
                    {egLabel}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-5 mt-3 text-[10px] text-neutral-400">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-sm" style={{ background: '#166534' }} />
          <span>{myName} (empresa)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-sm" style={{ background: 'rgba(20,83,45,0.6)' }} />
          <span>Pares do setor</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-1 rounded-full" style={{ background: '#f59e0b' }} />
          <span>Média dos pares</span>
        </div>
      </div>

      {/* Summary insight */}
      <div className="flex items-start gap-2.5 mt-4 pt-4 border-t border-neutral-100">
        <svg className="w-5 h-5 flex-shrink-0 mt-0.5" viewBox="0 0 24 24" fill="#16a34a">
          <path fillRule="evenodd" clipRule="evenodd" d="M12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12C22 17.5228 17.5228 22 12 22ZM0 12C0 5.37258 5.37258 0 12 0C18.6274 0 24 5.37258 24 12C24 18.6274 18.6274 24 12 24C5.37258 24 0 18.6274 0 12ZM5.70711 13.7071L9.29289 17.2929C9.68342 17.6834 10.3166 17.6834 10.7071 17.2929L18.2929 9.70711C18.6834 9.31658 18.6834 8.68342 18.2929 8.29289L17.7071 7.70711C17.3166 7.31658 16.6834 7.31658 16.2929 7.70711L10 14L7.70711 11.7071C7.31658 11.3166 6.68342 11.3166 6.29289 11.7071L5.70711 12.2929C5.31658 12.6834 5.31658 13.3166 5.70711 13.7071Z" />
        </svg>
        <p className="text-sm text-neutral-600 leading-relaxed">
          <span className="font-semibold text-green-700">Preço/Lucro vs Pares: </span>
          {myName} apresenta bom valor com base no seu Índice Preço/Lucro ({myPE.toFixed(1)}x) comparado à média dos pares ({peerAvg.toFixed(1)}x).
        </p>
      </div>
    </div>
  );
}

/**
 * FAIR PE GAUGE — SWS-style semicircular gauge comparing current PE vs fair PE.
 * Uses the same translate(cx, cy) coordinate system as the original SWS SVG.
 */
function FairPEGauge({ data }: { data: AnalysisData }) {
  const currentPE = Math.round(data.relativeValuation.peRatio * 10) / 10;
  const rawFair   = currentPE * (data.valuation.fairValue / data.valuation.currentPrice);
  const fairPE    = Math.round(rawFair * 10) / 10;
  const maxPE     = fairPE * 2;  // fair PE always at top (π/2)
  const isGood    = currentPE <= fairPE;

  /* ─── Geometry matching SWS SVG exactly ─── */
  const W = 320, H = 240, cx = 160, cy = 205;
  const outerR = 120, innerR = 108, centerR = 12;

  const f = (n: number) => +n.toFixed(2);

  // Angle CCW from right (+x axis): v=0→0 (right), v=fairPE→π/2 (top), v=maxPE→π (left)
  const valToAngle = (v: number) => Math.PI * v / maxPE;
  const currentAngle = valToAngle(currentPE);

  // Point on arc in SVG center-relative coords (y flipped)
  const px = (r: number, a: number) => f(r * Math.cos(a));
  const py = (r: number, a: number) => f(-r * Math.sin(a));

  // Needle rotation: vertical needle (pointing up = negative y) rotated to currentAngle
  // Clockwise from vertical: 90° - angle_in_degrees
  const needleRotDeg = f(90 - currentAngle * 180 / Math.PI);

  // Tip of needle on the outer arc
  const tipX = px(outerR, currentAngle);
  const tipY = py(outerR, currentAngle);

  /* ── Outer donut ring: STATIC halves (from actual SWS SVG paths) ── */
  // Left half = bad (overvalued / red): from top → left → inner-left → inner-top
  const badHalf  = `M0,${-outerR}A${outerR},${outerR},0,0,0,${-outerR},0L${-innerR},0A${innerR},${innerR},0,0,1,0,${-innerR}Z`;
  // Right half = good (undervalued / green): from top → right → inner-right → inner-top
  const goodHalf = `M0,${-outerR}A${outerR},${outerR},0,0,1,${outerR},0L${innerR},0A${innerR},${innerR},0,0,0,0,${-innerR}Z`;

  /* ── Inner fill zones (low opacity, same colors) ── */
  const innerBad  = `M0,${-innerR}A${innerR},${innerR},0,0,0,${-innerR},0L${-centerR},0A${centerR},${centerR},0,0,1,0,${-centerR}Z`;
  const innerGood = `M0,${-innerR}A${innerR},${innerR},0,0,1,${innerR},0L${centerR},0A${centerR},${centerR},0,0,0,0,${-centerR}Z`;

  /* ── Colors ── */
  const badColor     = '#ef4444';
  const goodColor    = '#22c55e';
  const fairColor    = '#f59e0b';   // amber
  const currentColor = '#3b82f6';   // blue

  /* ── Card placement logic ──
     Fair PE is always at top (0, -outerR).
     Current PE needle swings from right (good) to left (bad).
     If current is on the right (PE < fair) → fair card goes LEFT, current card goes RIGHT.
     If current is on the left (PE > fair) → fair card goes RIGHT, current card goes LEFT.
  */
  const currentOnRight = tipX >= 0; // needle is in the good (right) zone
  const fairCardAnchorX = currentOnRight ? -70 : 0;   // rect x of fair card
  const fairTextOffX    = currentOnRight ? -60 : 10;

  /* ── Axis labels: 0x at right edge, maxPE at left edge ── */
  const axisPoints = [
    { v: 0,           anchor: 'start'  as const },
    { v: maxPE / 4,   anchor: 'middle' as const },
    { v: maxPE * 3/4, anchor: 'middle' as const },
    { v: maxPE,       anchor: 'end'    as const },
  ];

  /* ── SWS pin path (12px wide × 128px tall, centered at x=6) ── */
  const pinPath = 'M2.92971 2.99917C2.96879 1.33152 4.3319 0 6 0C7.6681 0 9.03121 1.33153 9.07029 2.99918L11.8594 122.002C11.9365 125.291 9.29072 128 6 128C2.70928 128 0.0634816 125.291 0.140587 122.002L2.92971 2.99917Z';

  return (
    <>
      <div className="flex flex-row items-center gap-6">
      {/* ── Left: gauge ── */}
      <div className="shrink-0 w-[280px]">
        <svg width="100%" viewBox={`0 0 ${W} ${H}`} height={H} style={{ overflow: 'visible' }}>
          <g transform={`translate(${cx} ${cy})`}>

            {/* ── Outer ring: static half-circles ── */}
            <path d={badHalf}  fill={badColor} />
            <path d={goodHalf} fill={goodColor} />

            {/* ── Inner fill zones (lighter) ── */}
            <path d={innerBad}  fill={badColor}  fillOpacity={0.15} />
            <path d={innerGood} fill={goodColor} fillOpacity={0.2} />

            {/* ── Fair PE: amber vertical marker at top ── */}
            {/* Connector line from arc tip upward */}
            <line x1={0} y1={-outerR} x2={0} y2={-(outerR + 18)} stroke={fairColor} strokeWidth={2} />
            {/* Card */}
            <g transform={`translate(0, ${-(outerR + 20)})`}>
              <rect x={fairCardAnchorX} y={-46} width={70} height={42} rx={3} fill={fairColor} />
              <text x={fairTextOffX} y={-30} fontSize={10} fill="#1c1917" fontWeight="500">Fair P/L</text>
              <text x={fairTextOffX} y={-13} fontSize={14} fontWeight="700" fill="#1c1917">{fairPE.toFixed(1)}x</text>
            </g>

            {/* ── Current PE: rotated pin needle ── */}
            <g transform={`rotate(${needleRotDeg})`}>
              {/* Pin path: tip at y=0, base at y=128 → translate(-6,-128) puts base at center, tip at top */}
              <path
                d={pinPath}
                transform="translate(-6,-128)"
                fill={currentColor}
              />
            </g>
            {/* Center circle (covers pin base) */}
            <circle cx={0} cy={0} r={centerR} fill="white" stroke="#e5e7eb" strokeWidth={1.5} />

            {/* Current PE card — near needle tip, flipped based on side */}
            <g transform={`translate(${tipX}, ${tipY})`}>
              <line x1={0} y1={0} x2={currentOnRight ? 12 : -12} y2={-14} stroke={currentColor} strokeWidth={1.5} />
              <rect
                x={currentOnRight ? 12 : -82} y={-54}
                width={70} height={42} rx={3} fill={currentColor}
              />
              <text x={currentOnRight ? 20 : -74} y={-38} fontSize={10} fill="white" fontWeight="500">P/L Atual</text>
              <text x={currentOnRight ? 20 : -74} y={-21} fontSize={14} fontWeight="700" fill="white">{currentPE.toFixed(1)}x</text>
            </g>

            {/* ── Axis labels ── */}
            {axisPoints.map(({ v, anchor }, i) => {
              const safeV = v <= 0 ? 0.005 * maxPE : v >= maxPE ? maxPE * 0.995 : v;
              const a     = valToAngle(safeV);
              const lx    = px(outerR + 16, a);
              const ly    = py(outerR + 16, a);
              const label = Number.isInteger(v) ? `${v}x` : `${v.toFixed(1)}x`;
              return (
                <text key={i} x={lx} y={ly} textAnchor={anchor} dominantBaseline="middle"
                  fontSize={10} fill="#9ca3af">
                  {label}
                </text>
              );
            })}

          </g>
        </svg>

        {/* Actions row */}
        <div className="flex items-center justify-end gap-2 px-4 pb-2">
          <button className="relative inline-flex select-none items-center gap-1.5 rounded-md border border-neutral-200 bg-white px-3 text-xs font-normal text-neutral-600 hover:bg-neutral-50 h-8 leading-8">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="opacity-75">
              <path fillRule="evenodd" clipRule="evenodd" d="M6 8V7H18V8H13H12H10H9H6ZM6 9V11H9V9H6ZM6 12V14H9V12H6ZM6 15V17H9V15H6ZM10 17H12V15H10V17ZM13 17H18V15H13V17ZM18 14V12H13V14H18ZM18 11V9H13V11H18ZM5 6.5C5 6.22386 5.22386 6 5.5 6H18.5C18.7761 6 19 6.22386 19 6.5V17.5C19 17.7761 18.7761 18 18.5 18H5.5C5.22386 18 5 17.7761 5 17.5V6.5ZM12 14H10V12H12V14ZM12 9H10V11H12V9Z" />
            </svg>
            Dados
          </button>
          <button className="relative inline-flex select-none items-center gap-1.5 rounded-md border border-neutral-200 bg-white px-3 text-xs font-normal text-neutral-600 hover:bg-neutral-50 h-8 leading-8">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="opacity-75">
              <path fillRule="evenodd" clipRule="evenodd" d="M5 12C5 15.866 8.13401 19 12 19C15.866 19 19 15.866 19 12C19 8.13401 15.866 5 12 5C8.13401 5 5 8.13401 5 12ZM12 4C7.58172 4 4 7.58172 4 12C4 16.4183 7.58172 20 12 20C16.4183 20 20 16.4183 20 12C20 7.58172 16.4183 4 12 4ZM13 8V10H11V8H13ZM13 16V11H11V16H13Z" />
            </svg>
            Aprender
          </button>
          <button className="relative inline-flex select-none items-center rounded-md border border-neutral-200 bg-white px-2 text-xs font-normal text-neutral-600 hover:bg-neutral-50 h-8">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path fillRule="evenodd" clipRule="evenodd" d="M6 12C6 11.4477 6.44772 11 7 11C7.55228 11 8 11.4477 8 12C8 12.5523 7.55228 13 7 13C6.44772 13 6 12.5523 6 12ZM11 12C11 11.4477 11.4477 11 12 11C12.5523 11 13 11.4477 13 12C13 12.5523 12.5523 13 12 13C11.4477 13 11 12.5523 11 12ZM17 11C16.4477 11 16 11.4477 16 12C16 12.5523 16.4477 13 17 13C17.5523 13 18 12.5523 18 12C18 11.4477 17.5523 11 17 11Z" />
            </svg>
          </button>
        </div>
      </div>

      {/* ── Right: insight text ── */}
      <div className="flex items-start gap-3 flex-1">
        {isGood ? (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="#16a34a" className="shrink-0 mt-0.5">
            <path fillRule="evenodd" clipRule="evenodd" d="M12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12C22 17.5228 17.5228 22 12 22ZM0 12C0 5.37258 5.37258 0 12 0C18.6274 0 24 5.37258 24 12C24 18.6274 18.6274 24 12 24C5.37258 24 0 18.6274 0 12ZM17.5303 8.46967C17.8232 8.76256 17.8232 9.23744 17.5303 9.53033L10.5303 16.5303C10.2374 16.8232 9.76256 16.8232 9.46967 16.5303L6.46967 13.5303C6.17678 13.2374 6.17678 12.7626 6.46967 12.4697C6.76256 12.1768 7.23744 12.1768 7.53033 12.4697L10 14.9393L16.4697 8.46967C16.7626 8.17678 17.2374 8.17678 17.5303 8.46967Z" />
          </svg>
        ) : (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="#dc2626" className="shrink-0 mt-0.5">
            <path fillRule="evenodd" clipRule="evenodd" d="M12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12C22 17.5228 17.5228 22 12 22ZM0 12C0 5.37258 5.37258 0 12 0C18.6274 0 24 5.37258 24 12C24 18.6274 18.6274 24 12 24C5.37258 24 0 18.6274 0 12ZM12 10L8.70711 6.70711C8.31658 6.31658 7.68342 6.31658 7.29289 6.70711L6.70711 7.29289C6.31658 7.68342 6.31658 8.31658 6.70711 8.70711L10 12L6.70711 15.2929C6.31658 15.6834 6.31658 16.3166 6.70711 16.7071L7.29289 17.2929C7.68342 17.6834 8.31658 17.6834 8.70711 17.2929L12 14L15.2929 17.2929C15.6834 17.6834 16.3166 17.6834 16.7071 17.2929L17.2929 16.7071C17.6834 16.3166 17.6834 15.6834 17.2929 15.2929L14 12L17.2929 8.70711C17.6834 8.31658 17.6834 7.68342 17.2929 7.29289L16.7071 6.70711C16.3166 6.31658 15.6834 6.31658 15.2929 6.70711L12 10Z" />
          </svg>
        )}
        <p className="text-sm text-neutral-600 leading-relaxed">
          <span className={`font-semibold ${isGood ? 'text-green-700' : 'text-red-700'}`}>
            Relação Preço/Lucro vs. Preço Justo:{' '}
          </span>
          {isGood
            ? `${data.company.name} está barata com base na sua relação preço/lucro (${currentPE.toFixed(1)}x) em comparação com a relação preço/lucro justa estimada (${fairPE.toFixed(1)}x).`
            : `${data.company.name} está cara com base na sua relação preço/lucro (${currentPE.toFixed(1)}x) em comparação com a relação preço/lucro justa estimada (${fairPE.toFixed(1)}x).`
          }
        </p>
      </div>

      </div>{/* end flex row */}
    </>
  );
}

/**
 * DCF WIDGET — Simply Wall St style price chart with fair value overlay.
 * Header stats row + area chart (price history) + flat fair value line.
 */
function DCFWidget({ data }: { data: AnalysisData }) {
  const v = data.valuation;
  const last = data.analystTargets[data.analystTargets.length - 1];
  const isOver = v.currentPrice > v.fairValue;
  const discountAbs = Math.abs(v.discountPercent);

  const chartData = data.analystTargets.map(t => ({
    date: t.date,
    Preço: t.price,
    'Valor Justo': v.fairValue,
  }));

  return (
    <div>
      {/* Stats header — same grid pattern as SWS */}
      <div className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-0 md:grid-cols-[auto_1fr_auto_auto] md:gap-x-8 mb-4">
        {/* Current price */}
        <div>
          <div className="flex items-center gap-1.5 text-xs text-neutral-400 mb-0.5">
            <div className="w-1.5 h-1.5 rounded-full bg-teal-500" />
            <span>{last?.date ?? '—'}</span>
          </div>
          <div className="text-sm font-semibold text-neutral-900">R$ {v.currentPrice.toFixed(2)}</div>
        </div>

        {/* Fair value + discount */}
        <div>
          <div className="flex items-center gap-1.5 text-xs text-neutral-400 mb-0.5">
            <div className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
            <span>Valor Justo pelo Fluxo de Caixa</span>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-semibold text-neutral-900">R$ {v.fairValue.toFixed(2)}</span>
            <span className={`text-xs font-medium ${isOver ? 'text-rose-500' : 'text-teal-600'}`}>
              {discountAbs.toFixed(1)}% {isOver ? 'sobrevalorizado' : 'subvalorizado'}
            </span>
          </div>
        </div>

        {/* 1Y return */}
        <div className="hidden md:block">
          <div className="text-xs text-neutral-400 mb-0.5">1A</div>
          <span className={`text-xs font-medium ${data.priceHistory.return1y >= 0 ? 'text-teal-600' : 'text-rose-500'}`}>
            {data.priceHistory.return1y >= 0 ? '+' : ''}{data.priceHistory.return1y}%
          </span>
        </div>

        {/* WACC */}
        <div className="hidden md:block">
          <div className="text-xs text-neutral-400 mb-0.5">WACC</div>
          <span className="text-xs font-medium text-neutral-700">{v.discountRate}%</span>
        </div>
      </div>

      {/* Price chart */}
      <div className="h-52 overflow-hidden">
        <TremorArea
          data={chartData}
          index="date"
          categories={['Preço', 'Valor Justo']}
          colors={['teal', 'indigo']}
          valueFormatter={(val: number) => `R$ ${val.toFixed(2)}`}
          showLegend={false}
          showGridLines={false}
          curveType="monotone"
          yAxisWidth={44}
          showXAxis={false}
        />
      </div>

      {/* Model params footer */}
      <div className="mt-4 flex items-center gap-6 text-xs text-neutral-400 border-t border-neutral-50 pt-3">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-0.5 bg-teal-400 rounded" />
          <span>Preço</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-0.5 bg-indigo-400 rounded" />
          <span>Valor Justo (DCF)</span>
        </div>
        <span className="ml-auto">{v.model} · crescimento terminal {v.terminalGrowthRate}%</span>
      </div>
    </div>
  );
}

/**
 * SHARE PRICE vs FAIR VALUE — SWS-style horizontal bar chart.
 * Two rows: Current Price (top) and Cash Flow Value (bottom), both starting from left.
 * Background zones: green (undervalued) → neutral (about right) → red (overvalued).
 * Thin top connector bar shows the gap between fair value and current price.
 */
function SharePriceVsFairValue({ currentPrice, fairValue }: { currentPrice: number; fairValue: number }) {
  const isOvervalued  = currentPrice > fairValue;
  const diffPct       = (currentPrice - fairValue) / fairValue * 100;
  const absDiffPct    = Math.abs(diffPct);
  const isAboutRight  = absDiffPct <= 20;

  // ── Scale: always place the two values at fixed target positions ──
  // Smaller value → 17% from left; larger value → 78% from left.
  const P_NEAR = 0.17, P_FAR = 0.78;
  const nearVal = isOvervalued ? fairValue    : currentPrice;
  const farVal  = isOvervalued ? currentPrice : fairValue;
  const ratio   = P_FAR / P_NEAR;                          // ≈ 4.588
  const minVal  = (ratio * nearVal - farVal) / (ratio - 1);
  const maxVal  = minVal + (farVal - minVal) / P_FAR;
  const range   = maxVal - minVal;

  const VW = 500;
  const toX = (v: number) => Math.round(Math.max(0, Math.min(VW, (v - minVal) / range * VW)));

  const cpX = toX(currentPrice);
  const fvX = toX(fairValue);
  const uX  = toX(fairValue * 0.8);
  const oX  = Math.min(VW, toX(fairValue * 1.2));

  // ── Colors ──
  const badColor      = '#ef4444';
  const goodColor     = '#22c55e';
  const neutralColor  = '#6b7280';
  const brandColor    = '#3b82f6';
  const textColor     = '#111827';
  const labelColor    = isAboutRight ? neutralColor : isOvervalued ? badColor : goodColor;
  const connectorColor = isOvervalued ? badColor : goodColor;
  const labelText     = isAboutRight
    ? 'Dentro do Valor Justo'
    : isOvervalued ? 'Sobrevalorizada' : 'Subvalorizada';

  // ── Layout constants (ViewBox space, all in px within VW=500) ──
  const mainY = 43;  // y of main chart group
  const bgY   = 24;  // y of background rects inside main group
  const bgH   = 216; // height of background zone
  const row1Y = 24;  // y of Current Price bar inside main group
  const row2Y = 120; // y of Fair Value bar inside main group
  const rowH  = 72;  // height of each bar
  const mainH = 240; // total height of main chart group

  return (
    <div className="w-full">
      <svg
        width="100%"
        height="340"
        viewBox={`0 0 ${VW} 283`}
        style={{ overflow: 'visible', shapeRendering: 'crispEdges' } as React.CSSProperties}
      >
        {/* ── Top: overvaluation % label aligned to the "far" marker ── */}
        <text x={isOvervalued ? cpX : fvX} y={14} fill={labelColor}
          textAnchor="start" fontSize={16} fontWeight="700">
          {absDiffPct.toFixed(1)}%
        </text>
        <text x={isOvervalued ? cpX : fvX} y={32} fill={labelColor}
          textAnchor="start" fontSize={12}>
          {labelText}
        </text>

        {/* ── Main chart area ── */}
        <g transform={`translate(0, ${mainY})`}>

          {/* Background zones (layered rects) */}
          <rect x={0} y={bgY} width={VW} height={bgH} fill="rgba(239,68,68,0.12)" />
          <rect x={0} y={bgY} width={oX} height={bgH} fill="rgba(156,163,175,0.2)" />
          <rect x={0} y={bgY} width={uX} height={bgH} fill="rgba(34,197,94,0.25)" />

          {/* Row 1: Current Price bar */}
          <rect x={0} y={row1Y} width={cpX} height={rowH} fill="#f9fafb" />
          <line x1={cpX} x2={cpX} y1={row1Y} y2={row1Y + rowH}
            stroke={brandColor} strokeWidth={2} />

          {/* Row 2: Fair Value bar (gradient overlay) */}
          <defs>
            <linearGradient id="fvBarGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%"   stopColor="white" stopOpacity={0.35} />
              <stop offset="100%" stopColor="white" stopOpacity={0.85} />
            </linearGradient>
          </defs>
          <rect x={0} y={row2Y} width={fvX} height={rowH} fill="url(#fvBarGrad)" />
          <line x1={fvX} x2={fvX} y1={row2Y} y2={row2Y + rowH}
            stroke={textColor} strokeWidth={2} />

          {/* Vertical connector lines (full chart height, faint) */}
          <line x1={cpX} x2={cpX} y1={0} y2={row2Y}
            stroke={textColor} strokeOpacity={0.25} strokeWidth={1} />
          <line x1={fvX} x2={fvX} y1={0} y2={mainH}
            stroke={textColor} strokeOpacity={0.25} strokeWidth={1} />

          {/* Top horizontal connector bar (shows the spread) */}
          <rect
            x={Math.min(cpX, fvX)} y={0}
            width={Math.abs(cpX - fvX)} height={2}
            fill={connectorColor}
          />

          {/* Current Price label (to the LEFT of the cp line) */}
          <text x={cpX - 10} y={row1Y + 30}
            fill={textColor} textAnchor="end" fontSize={12}>
            Preço Atual
          </text>
          <text x={cpX - 10} y={row1Y + 50}
            fill={textColor} textAnchor="end" fontSize={14} fontWeight="600">
            R$ {currentPrice.toFixed(2)}
          </text>

          {/* Fair Value label (to the RIGHT of the fv line) */}
          <text x={fvX + 10} y={row2Y + 30}
            fill={textColor} textAnchor="start" fontSize={12}>
            Valor pelo Fluxo de Caixa
          </text>
          <text x={fvX + 10} y={row2Y + 50}
            fill={textColor} textAnchor="start" fontSize={14} fontWeight="600">
            R$ {fairValue.toFixed(2)}
          </text>
        </g>

        {/* ── Bottom tick labels (rotated −35°) ── */}
        <g transform={`translate(0, ${mainY + mainH + 6})`}>
          {uX > 5 && (
            <g transform={`translate(${uX}, 4)`}>
              <text transform="rotate(-35, 0, 0)" fill={goodColor} textAnchor="end" fontSize={11}>
                <tspan x={0} dy="0.71em">20% Subvalorizado</tspan>
              </text>
            </g>
          )}
          <g transform={`translate(${fvX}, 4)`}>
            <text transform="rotate(-35, 0, 0)" fill={neutralColor} textAnchor="end" fontSize={11}>
              <tspan x={0} dy="0.71em">Correto</tspan>
            </text>
          </g>
          {oX < VW - 5 && (
            <g transform={`translate(${oX}, 4)`}>
              <text transform="rotate(-35, 0, 0)" fill={badColor} textAnchor="end" fontSize={11}>
                <tspan x={0} dy="0.71em">20% Sobrevalorizado</tspan>
              </text>
            </g>
          )}
        </g>
      </svg>
    </div>
  );
}

/**
 * MARKET CAP DONUT — SimplyWall.St style donut showing earnings/revenue vs market cap.
 */
function MarketCapDonut({ composition }: { composition: AnalysisData['marketCapComposition'] }) {
  const donutData = [
    { name: 'Lucro', value: composition.earnings },
    { name: 'Outros', value: composition.revenue - composition.earnings },
  ];

  return (
    <div className="flex items-center gap-8">
      <div className="w-48 h-48 relative">
        <DonutChart
          data={donutData}
          category="value"
          index="name"
          colors={["teal", "sky"]}
          valueFormatter={(v: number) => `R$ ${formatNumber(v)}M`}
          showLabel={false}
          showAnimation={true}
        />
        {/* Center label */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-center">
            <div className="text-[10px] text-neutral-500">Cap. de Mercado</div>
            <div className="text-sm font-bold text-neutral-900">R$ {formatNumber(composition.marketCap)}M</div>
          </div>
        </div>
      </div>
      <div className="space-y-3">
        <div>
          <div className="flex items-center gap-2 text-sm">
            <div className="w-3 h-3 rounded-full bg-teal-500" />
            <span className="text-neutral-600">Lucro</span>
          </div>
          <div className="text-lg font-bold text-neutral-900 ml-5">R$ {formatNumber(composition.earnings)}M</div>
        </div>
        <div>
          <div className="flex items-center gap-2 text-sm">
            <div className="w-3 h-3 rounded-full bg-sky-500" />
            <span className="text-neutral-600">Receita</span>
          </div>
          <div className="text-lg font-bold text-neutral-900 ml-5">R$ {formatNumber(composition.revenue)}M</div>
        </div>
        <div className="border-t border-neutral-200 pt-3 grid grid-cols-2 gap-4">
          <div>
            <div className="text-2xl font-bold text-neutral-900">{composition.peRatio}x</div>
            <div className="text-xs text-neutral-500">Índice P/L</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-neutral-900">{composition.psRatio}x</div>
            <div className="text-xs text-neutral-500">Índice P/S</div>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * EARNINGS & REVENUE GROUPED BAR — SimplyWall.St style with forecast distinction.
 */
function EarningsRevenueChart({ series }: { series: EarningsRevenueSeries[] }) {
  return (
    <div className="h-72">
      <TremorBar
        data={series}
        index="year"
        categories={["revenue", "earnings"]}
        colors={["sky", "teal"]}
        valueFormatter={(v: number) => `R$ ${formatNumber(v)}M`}
        showLegend={true}
        showGridLines={true}
        yAxisWidth={56}
      />
    </div>
  );
}

/**
 * ANALYST PRICE TARGET — Line chart with consensus band.
 * SimplyWall.St shows price vs consensus target with dispersion.
 */
function AnalystPriceTarget({ targets }: { targets: AnalystTarget[] }) {
  return (
    <div className="h-72">
      <TremorLine
        data={targets}
        index="date"
        categories={["price", "consensusTarget", "high", "low"]}
        colors={["sky", "violet", "slate", "rose"]}
        valueFormatter={(v: number) => `R$ ${v.toFixed(2)}`}
        showLegend={true}
        curveType="monotone"
        yAxisWidth={48}
      />
    </div>
  );
}

/**
 * COMMUNITY FAIR VALUES HISTOGRAM — SimplyWall.St style bar histogram
 * with "Last Share Price" marker line.
 */
function CommunityFairValuesChart({ buckets, lastPrice }: { buckets: CommunityFairValue[]; lastPrice: number }) {
  return (
    <div className="h-64">
      <TremorBar
        data={buckets}
        index="priceRange"
        categories={["count"]}
        colors={["violet"]}
        showLegend={false}
        showGridLines={true}
        yAxisWidth={36}
      />
      <div className="flex items-center gap-2 mt-2 text-xs">
        <div className="w-3 h-3 bg-indigo-600 rounded-sm" />
        <span className="text-neutral-600">Último Preço: <strong className="text-indigo-700">R$ {lastPrice.toFixed(2)}</strong></span>
        <span className="text-neutral-400 ml-2">|</span>
        <span className="text-neutral-500">{buckets.reduce((s, b) => s + b.count, 0)} estimativas da comunidade</span>
      </div>
    </div>
  );
}

/**
 * PRICE CHART WITH EVENT DOTS — Enhanced price chart with colored category dots.
 * SimplyWall.St shows dividend/financial/management/strategy/other events as dots.
 */
const EVENT_COLORS: Record<string, string> = {
  dividend: '#10b981',
  financial: '#d946ef',
  management: '#8b5cf6',
  strategy: '#f59e0b',
  other: '#6366f1',
};

const EVENT_LABELS: Record<string, string> = {
  dividend: 'Dividendo',
  financial: 'Financeiro',
  management: 'Gestão',
  strategy: 'Estratégia',
  other: 'Outro',
};

// ─── Overview Tab ────────────────────────────────────────────────────────────

function OverviewTab({ data, onSelectTab }: { data: AnalysisData; onSelectTab: (tab: AnalysisTab) => void }) {
  const snowflakeDims: SnowflakeDimension[] = data.snowflake.map((d) => ({
    label: d.displayName,
    value: d.normalizedScore,
    color: DIMENSION_COLORS[d.dimension],
    why: d.summary,
    metric: `${d.score}/6 critérios`,
  }));

  const totalScore = data.snowflake.reduce((sum, d) => sum + d.score, 0);
  const overallStatus = totalScore >= 20 ? 'healthy' : totalScore >= 12 ? 'attention' : 'risk';
  const { bestDimension, weakestDimension, topReward, topRisk, headline, subheadline, quickRead } = buildOverviewNarrative(data);
  const priceInsight = buildPriceInsight(data);
  const returnInsight = buildReturnInsight(data);

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl shadow-sm p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
            {data.company.ticker.slice(0, 2)}
          </div>
          <div className="flex-1">
            <div className="flex items-baseline gap-3 flex-wrap">
              <h1 className="text-xl font-bold text-neutral-900">{data.company.name}</h1>
              <span className="text-xs font-mono text-neutral-400 bg-neutral-100 px-2 py-0.5 rounded">
                {data.company.exchange}:{data.company.ticker}
              </span>
            </div>
            <p className="text-xs text-neutral-400 mt-1">{data.company.sector} · {data.company.industry} · Cap. {data.company.marketCap}</p>
          </div>
          <div className="text-right flex-shrink-0">
            <div className="text-2xl font-bold text-neutral-900">R$ {data.valuation.currentPrice.toFixed(2)}</div>
            <div className={`text-sm font-medium ${data.priceHistory.return1y >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {data.priceHistory.return1y >= 0 ? '+' : ''}{data.priceHistory.return1y}% (1 ano)
            </div>
          </div>
        </div>
        <div className="mt-5 pt-5 border-t border-neutral-100">
          <div className="text-[10px] font-semibold uppercase text-teal-600">Tese resumida</div>
          <h2 className="mt-2 max-w-3xl text-lg font-semibold leading-snug text-neutral-900">{headline}</h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-neutral-500">{subheadline}</p>
        </div>
      </div>

      <SectionCard id="panorama-tese" title="Panorama da tese">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_1fr] lg:items-center">
          <div className="flex flex-col items-center">
            <SnowflakeChart dimensions={snowflakeDims} size="large" status={overallStatus} />
            <div className="mt-3 text-center">
              <div className="text-2xl font-bold text-neutral-900">{totalScore}/30</div>
              <p className="text-xs text-neutral-400">Score geral</p>
            </div>
          </div>
          <div className="space-y-4">
            <p className="text-sm leading-6 text-neutral-600">{data.company.description}</p>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="p-4 bg-neutral-50 rounded-xl border-l-2 border-teal-400">
                <div className="text-[10px] font-semibold uppercase text-teal-600">Maior força</div>
                <div className="mt-1.5 text-sm font-semibold text-neutral-900">{topReward?.text ?? bestDimension.displayName}</div>
                <div className="mt-1 text-xs text-neutral-500 leading-5">
                  {topReward?.detail ?? `A tese hoje se apoia mais em ${DIMENSION_CONTEXT[bestDimension.dimension]}.`}
                </div>
              </div>
              <div className="p-4 bg-neutral-50 rounded-xl border-l-2 border-amber-400">
                <div className="text-[10px] font-semibold uppercase text-amber-600">Maior fragilidade</div>
                <div className="mt-1.5 text-sm font-semibold text-neutral-900">{topRisk?.text ?? weakestDimension.displayName}</div>
                <div className="mt-1 text-xs text-neutral-500 leading-5">
                  {topRisk?.detail ?? `O ponto mais sensível hoje está em ${DIMENSION_CONTEXT[weakestDimension.dimension]}.`}
                </div>
              </div>
            </div>
            <div className="p-4 bg-neutral-50 rounded-xl">
              <div className="text-[10px] font-semibold uppercase text-neutral-400">Leitura rápida</div>
              <p className="mt-1.5 text-sm leading-6 text-neutral-600">{quickRead}</p>
            </div>
          </div>
        </div>
      </SectionCard>

      <SectionCard id="resumo-dimensoes" title="Resumo por dimensão" subtitle="Ponto de partida para aprofundar em cada eixo da análise">
        <div className="mb-4 grid grid-cols-1 gap-3 md:grid-cols-2">
          <div className="p-4 bg-teal-50 rounded-xl border-l-2 border-teal-400">
            <div className="text-[10px] font-semibold uppercase text-teal-600">Melhor dimensão hoje</div>
            <div className="mt-1.5 text-sm font-semibold text-teal-900">{bestDimension.displayName}</div>
            <div className="mt-1 text-xs text-teal-700 leading-5">{bestDimension.summary}</div>
          </div>
          <div className="p-4 bg-amber-50 rounded-xl border-l-2 border-amber-400">
            <div className="text-[10px] font-semibold uppercase text-amber-600">Mais pressionada hoje</div>
            <div className="mt-1.5 text-sm font-semibold text-amber-900">{weakestDimension.displayName}</div>
            <div className="mt-1 text-xs text-amber-700 leading-5">{weakestDimension.summary}</div>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-2 md:grid-cols-5">
          {data.snowflake.map((dim) => (
            <button
              key={dim.dimension}
              type="button"
              onClick={() => onSelectTab(dim.dimension)}
              className="p-3 rounded-xl hover:bg-neutral-50 transition-colors text-left border-l-2"
              style={{ borderLeftColor: DIMENSION_COLORS[dim.dimension] }}
            >
              <span className="font-medium text-neutral-800 text-sm block mb-2">{dim.displayName}</span>
              <ScoreBar score={dim.score} color={DIMENSION_COLORS[dim.dimension]} />
              <p className="text-xs text-neutral-400 mt-2 line-clamp-2 leading-5">{dim.summary}</p>
            </button>
          ))}
        </div>
      </SectionCard>

      <SectionCard id="forcas-riscos" title="Forças e riscos da tese">
        <RewardsAndRisks items={data.rewardsAndRisks} />
      </SectionCard>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SectionCard title="Visao de mercado">
          <MarketCapDonut composition={data.marketCapComposition} />
        </SectionCard>

        <SectionCard title="Receita e lucro">
          <EarningsRevenueChart series={data.earningsRevenueSeries} />
          <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-sky-500" /><span className="text-neutral-500">Receita (historico)</span>
              <div className="w-3 h-3 rounded bg-sky-300 ml-2" /><span className="text-neutral-500">Receita (est.)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-teal-500" /><span className="text-neutral-500">Lucro (historico)</span>
              <div className="w-3 h-3 rounded bg-teal-300 ml-2" /><span className="text-neutral-500">Lucro (est.)</span>
            </div>
          </div>
        </SectionCard>
      </div>

      <SectionCard
        id="mercado-eventos"
        title="Preco, retorno e eventos recentes"
        subtitle="Conecte o que aconteceu, quando aconteceu e como isso apareceu no comportamento do papel"
      >
        <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          <div>
            <div className="rounded-2xl bg-neutral-50 p-4 text-sm leading-6 text-neutral-700">{priceInsight}</div>
            <div className="mt-4 h-72">
              <TremorArea
                data={data.priceHistory.series}
                index="date"
                categories={["price"]}
                colors={["teal"]}
                valueFormatter={(v: number) => `R$ ${v.toFixed(2)}`}
                showGridLines={true}
                showLegend={false}
                curveType="monotone"
              />
            </div>
            <div className="flex gap-6 mt-4 text-sm flex-wrap">
              <div>
                <span className="text-neutral-500">Retorno 1a:</span>{' '}
                <span className={data.priceHistory.return1y >= 0 ? 'text-green-600 font-semibold' : 'text-red-600 font-semibold'}>
                  {data.priceHistory.return1y >= 0 ? '+' : ''}{data.priceHistory.return1y}%
                </span>
              </div>
              <div>
                <span className="text-neutral-500">Retorno 5a:</span>{' '}
                <span className={data.priceHistory.return5y >= 0 ? 'text-green-600 font-semibold' : 'text-red-600 font-semibold'}>
                  {data.priceHistory.return5y >= 0 ? '+' : ''}{data.priceHistory.return5y}%
                </span>
              </div>
              <div>
                <span className="text-neutral-500">Mercado 1a:</span>{' '}
                <span className="font-semibold text-neutral-700">{data.priceHistory.marketReturn1y >= 0 ? '+' : ''}{data.priceHistory.marketReturn1y}%</span>
              </div>
              <div>
                <span className="text-neutral-500">Beta:</span>{' '}
                <span className="font-semibold text-neutral-700">{data.priceHistory.volatilityBeta}</span>
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-neutral-100">
              <div className="flex items-center gap-1 mb-2 flex-wrap">
                {data.priceEvents.map((evt, idx) => (
                  <div
                    key={idx}
                    className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                    style={{ backgroundColor: EVENT_COLORS[evt.category] }}
                    title={`${evt.date}: ${evt.title}`}
                  />
                ))}
              </div>
              <div className="flex flex-wrap gap-3 text-[10px] text-neutral-500">
                {Object.entries(EVENT_LABELS).map(([key, label]) => (
                  <span key={key} className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: EVENT_COLORS[key] }} />
                    {label}
                  </span>
                ))}
              </div>
            </div>
          </div>
          <div>
            <div className="rounded-2xl bg-neutral-50 p-4 text-sm leading-6 text-neutral-700">{returnInsight}</div>
            <div className="mt-4">
              <ReturnComparisonChart data={data.returnComparison} />
            </div>
            <div className="mt-6 border-t border-neutral-100 pt-6">
              <div className="mb-3">
                <h4 className="text-sm font-semibold text-neutral-900">Timeline recente</h4>
                <p className="text-xs text-neutral-500">Use esta leitura para conectar evento, data e pilar mais afetado.</p>
              </div>
              <EventTimeline events={data.timelineEvents.slice(0, 4)} />
            </div>
          </div>
        </div>
      </SectionCard>

      <SectionCard title="Comparacao com competidores" subtitle="O radar segue como apoio visual, mas a leitura principal vem da sintese textual">
        <CompetitorGrid competitors={data.competitors} />
      </SectionCard>

      <SectionCard
        title="Percepção da comunidade sobre valor justo"
        subtitle={`Veja o que ${data.communityFairValues.reduce((s, b) => s + b.count, 0)} pessoas estimam, sem substituir a leitura fundamentalista`}
      >
        <div className="mb-4 rounded-2xl bg-amber-50 p-4 text-sm leading-6 text-amber-900">
          Este bloco mostra percepcao agregada da comunidade. Ele ajuda a entender expectativas, mas nao deve ancorar sozinho a leitura da tese.
        </div>
        <CommunityFairValuesChart buckets={data.communityFairValues} lastPrice={data.valuation.currentPrice} />
      </SectionCard>
    </div>
  );
}

// ─── Value Tab ───────────────────────────────────────────────────────────────

function ValueTab({ data }: { data: AnalysisData }) {
  const dim = data.snowflake.find(d => d.dimension === 'value')!;
  const { valuation: v, relativeValuation: rv } = data;

  return (
    <div className="space-y-6">
      <DimensionIntroCard dimension="value" title="Valuation" icon={<DollarSign className="w-5 h-5" />} color={COLORS.value} />
      <DimensionScoreCard
        label="Valuation"
        score={dim.score}
        checks={dim.checks}
        color={COLORS.value}
        anchors={['val-dcf', 'val-dcf', 'val-pe', 'val-pe', 'val-peg', 'val-pe']}
      />

      {/* Share Price vs Fair Value */}
      <SectionCard title="Preço da ação vs valor justo" subtitle="Posicionamento do preço atual em relação ao valor intrínseco calculado">
        <SharePriceVsFairValue currentPrice={v.currentPrice} fairValue={v.fairValue} />
      </SectionCard>

      {/* DCF Widget — SWS style */}
      <SectionCard id="val-dcf" title="Preço da Ação vs Valor pelo Fluxo de Caixa">
        <DCFWidget data={data} />
      </SectionCard>

      {/* Key Valuation Metric — SWS style */}
      <SectionCard id="val-pe" title="Múltiplo de Valuation Principal" subtitle="Qual métrica é mais adequada para avaliar o valuation relativo?">
        <KeyValuationMetric data={data} />
      </SectionCard>

      <SectionCard
        title="Relação preço/lucro em comparação com os pares"
        subtitle={`Como o índice P/L da ${data.company.ticker} se compara com empresas parecidas?`}
      >
        <PEVsPeersChart data={data} />
      </SectionCard>

      {/* Historical ratio chart */}
      <SectionCard title="Relação preço/lucro histórica">
        <HistoricalRatioChart data={data} />
      </SectionCard>

      {/* PE vs Peers */}
      <SectionCard
        title="Relação preço/lucro versus setor"
        subtitle={`Como se compara o índice P/L da ${data.company.ticker} com o de outras empresas do setor ${data.company.industry.toLowerCase()} global?`}
      >
        <PEVsIndustryChart data={data} />
      </SectionCard>

      {/* Fair PE Gauge */}
      <SectionCard
        title="Relação Preço/Lucro vs. Relação Justa"
        subtitle={`Qual é o índice P/L (Preço/Lucro) da ${data.company.ticker} em comparação com seu índice P/L justo? Este é o índice P/L esperado, levando em consideração a previsão de crescimento dos lucros da empresa, as margens de lucro e outros fatores de risco.`}
      >
        <FairPEGauge data={data} />
      </SectionCard>

    </div>
  );
}

// ─── Future Growth Tab ───────────────────────────────────────────────────────

function FutureTab({ data }: { data: AnalysisData }) {
  const dim = data.snowflake.find(d => d.dimension === 'future')!;
  const g = data.growth;

  return (
    <div className="space-y-6">
      <DimensionIntroCard dimension="future" title="Crescimento Futuro" icon={<TrendingUp className="w-5 h-5" />} color={COLORS.future} />
      <DimensionScoreCard
        label="Crescimento Futuro"
        score={dim.score}
        checks={dim.checks}
        color={COLORS.future}
        anchors={['fut-earnings', 'fut-earnings', 'fut-revenue', 'fut-earnings', 'fut-revenue', 'fut-roe']}
      />

      {/* Taxas de crescimento — lollipop compacto */}
      <SectionCard
        title="Taxas de Crescimento vs Mercado"
        subtitle="Crescimento anual estimado de lucro e receita"
      >
        <div className="grid grid-cols-2 gap-8">
          <div>
            <p className="text-xs font-medium text-neutral-400 uppercase mb-3">Lucro (a.a.)</p>
            <LollipopComparison
              items={[
                { name: data.company.ticker, value: g.earningsGrowthRate, color: COLORS.future, isHighlight: true },
                { name: 'Mercado', value: g.marketEarningsGrowth, color: '#94a3b8' },
              ]}
            />
          </div>
          <div>
            <p className="text-xs font-medium text-neutral-400 uppercase mb-3">Receita (a.a.)</p>
            <LollipopComparison
              items={[
                { name: data.company.ticker, value: g.revenueGrowthRate, color: COLORS.future, isHighlight: true },
                { name: 'Mercado', value: g.marketRevenueGrowth, color: '#94a3b8' },
              ]}
            />
          </div>
        </div>
      </SectionCard>

      {/* Projeção de Lucro + Receita — side by side */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <SectionCard id="fut-earnings" title="Projeção de Lucro Líquido" subtitle="Histórico e consenso dos analistas">
          <div className="h-56">
            <TremorBar
              data={g.earningsSeries}
              index="year"
              categories={["value"]}
              colors={["sky"]}
              valueFormatter={(val: number) => `R$ ${formatNumber(val)}M`}
              showLegend={false}
              showGridLines={true}
              yAxisWidth={48}
            />
          </div>
        </SectionCard>

        <SectionCard id="fut-revenue" title="Projeção de Receita" subtitle="Histórico e consenso dos analistas">
          <div className="h-56">
            <TremorBar
              data={g.revenueSeries}
              index="year"
              categories={["value"]}
              colors={["teal"]}
              valueFormatter={(val: number) => `R$ ${formatNumber(val)}M`}
              showLegend={false}
              showGridLines={true}
              yAxisWidth={48}
            />
          </div>
        </SectionCard>
      </div>

      {/* ROE futuro */}
      <SectionCard
        id="fut-roe"
        title="ROE Estimado (3 anos)"
        subtitle="ROE projetado vs benchmark de 20%"
      >
        <BulletChart
          value={g.futureROE}
          target={20}
          ranges={[10, 20, 40]}
          label="ROE estimado"
          unit="%"
          domain={[0, 45]}
        />
        <p className="mt-3 text-xs text-neutral-400 leading-5">
          ROE de {g.futureROE}% {g.futureROE >= 20 ? 'acima' : 'abaixo'} do benchmark de 20%.
        </p>
      </SectionCard>
    </div>
  );
}

// ─── Past Performance Tab ────────────────────────────────────────────────────

function PastTab({ data }: { data: AnalysisData }) {
  const dim = data.snowflake.find(d => d.dimension === 'past')!;
  const p = data.pastPerformance;

  return (
    <div className="space-y-6">
      <DimensionIntroCard dimension="past" title="Performance Passada" icon={<BarChart3 className="w-5 h-5" />} color={COLORS.past} />
      <DimensionScoreCard
        label="Performance Passada"
        score={dim.score}
        checks={dim.checks}
        color={COLORS.past}
        anchors={['past-eps', 'past-eps', 'past-eps', 'past-roe', 'past-roce', 'past-returns']}
      />

      {/* LPA + ROE — side by side */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <SectionCard id="past-eps" title="LPA — Lucro por Ação" subtitle="Evolução histórica">
          <div className="h-52">
            <TremorArea
              data={p.epsSeries}
              index="year"
              categories={["value"]}
              colors={["teal"]}
              valueFormatter={(v: number) => `R$ ${v.toFixed(1)}`}
              showLegend={false}
              showGridLines={true}
              curveType="monotone"
              yAxisWidth={44}
            />
          </div>
        </SectionCard>

        <SectionCard id="past-roe" title="ROE — Retorno sobre Patrimônio" subtitle="Histórico anual">
          <div className="h-52">
            <TremorBar
              data={p.roeSeries}
              index="year"
              categories={["value"]}
              colors={["emerald"]}
              valueFormatter={(v: number) => `${v}%`}
              showLegend={false}
              showGridLines={true}
              yAxisWidth={36}
            />
          </div>
        </SectionCard>
      </div>

      {/* ROCE + KPIs — dentro do mesmo card */}
      <SectionCard id="past-roce" title="ROCE e Indicadores de Retorno" subtitle="Eficiência no uso do capital empregado">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-6 items-start">
          <div className="h-52">
            <TremorLine
              data={p.roceSeries}
              index="year"
              categories={["value"]}
              colors={["emerald"]}
              valueFormatter={(v: number) => `${v}%`}
              showLegend={false}
              curveType="monotone"
              yAxisWidth={36}
            />
          </div>
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-1 lg:w-40">
            {[
              { label: 'ROE atual', value: `${p.currentROE}%`, color: p.currentROE >= 20 ? COLORS.positive : COLORS.negative },
              { label: 'ROCE atual', value: `${p.currentROCE}%`, color: p.currentROCE >= 20 ? COLORS.positive : COLORS.health },
              { label: 'ROA atual', value: `${p.currentROA}%`, color: p.currentROA >= p.industryROA ? COLORS.positive : COLORS.negative },
              { label: 'Cresc. LPA 5a', value: `${p.epsGrowth5y}% a.a.`, color: COLORS.past },
            ].map((m) => (
              <div key={m.label} className="pl-3 border-l-2 border-neutral-100">
                <div className="text-[10px] uppercase text-neutral-400 mb-0.5">{m.label}</div>
                <div className="text-base font-bold" style={{ color: m.color }}>{m.value}</div>
              </div>
            ))}
          </div>
        </div>
      </SectionCard>

      {/* Margens + Retornos comparados — side by side */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <SectionCard title="Evolução das Margens (5 anos)" subtitle="Bruta, operacional e líquida">
          <div className="h-52">
            <MarginEvolution series={data.marginSeries} />
          </div>
        </SectionCard>

        <SectionCard id="past-returns" title="Retornos vs Referência" subtitle="ROE, ROCE e ROA vs benchmarks">
          <LollipopComparison
            items={[
              { name: `ROE ${p.currentROE}%`, value: p.currentROE, color: p.currentROE >= 20 ? COLORS.positive : COLORS.negative, isHighlight: true },
              { name: 'ROE ref.', value: 20, color: '#94a3b8' },
              { name: `ROCE ${p.currentROCE}%`, value: p.currentROCE, color: p.currentROCE >= 20 ? COLORS.positive : COLORS.health, isHighlight: true },
              { name: 'ROCE ref.', value: 20, color: '#94a3b8' },
              { name: `ROA ${p.currentROA}%`, value: p.currentROA, color: p.currentROA >= p.industryROA ? COLORS.positive : COLORS.negative, isHighlight: true },
              { name: `ROA ind. ${p.industryROA}%`, value: p.industryROA, color: '#94a3b8' },
            ]}
          />
        </SectionCard>
      </div>
    </div>
  );
}

// ─── Health Tab ──────────────────────────────────────────────────────────────

function HealthTab({ data }: { data: AnalysisData }) {
  const dim = data.snowflake.find(d => d.dimension === 'health')!;
  const h = data.health;

  // data-to-viz: Grouped bar (assets vs liabilities) instead of 4 separate bars
  const balanceGrouped = [
    { name: 'Curto Prazo', ativos: h.assetsVsLiabilities.shortTermAssets, passivos: h.assetsVsLiabilities.shortTermLiabilities },
    { name: 'Longo Prazo', ativos: h.assetsVsLiabilities.longTermAssets, passivos: h.assetsVsLiabilities.longTermLiabilities },
  ];

  return (
    <div className="space-y-6">
      <DimensionIntroCard dimension="health" title="Saúde Financeira" icon={<Shield className="w-5 h-5" />} color={COLORS.health} />
      <DimensionScoreCard
        label="Saúde Financeira"
        score={dim.score}
        checks={dim.checks}
        color={COLORS.health}
        anchors={['health-balance', 'health-balance', 'health-debt', 'health-debt', 'health-coverage', 'health-coverage']}
      />

      {/* Assets vs Liabilities — GROUPED BAR */}
      <SectionCard
        id="health-balance"
        title="Ativos vs Passivos"
        subtitle="Comparação de ativos e passivos de curto e longo prazo"
      >
        <div className="h-80">
          <TremorBar
            data={balanceGrouped}
            index="name"
            categories={["ativos", "passivos"]}
            colors={["teal", "rose"]}
            valueFormatter={(val: number) => `R$ ${formatNumber(val)}M`}
            showLegend={true}
            showGridLines={true}
            yAxisWidth={56}
          />
        </div>
        <div className="mt-4 grid grid-cols-2 gap-4">
          <div className="pl-3 border-l-2 border-teal-200">
            <div className="text-[10px] uppercase text-neutral-400 mb-0.5">Total Ativos</div>
            <div className="text-base font-bold text-teal-700">
              R$ {formatNumber(h.assetsVsLiabilities.shortTermAssets + h.assetsVsLiabilities.longTermAssets)}M
            </div>
          </div>
          <div className="pl-3 border-l-2 border-rose-200">
            <div className="text-[10px] uppercase text-neutral-400 mb-0.5">Total Passivos</div>
            <div className="text-base font-bold text-rose-600">
              R$ {formatNumber(h.assetsVsLiabilities.shortTermLiabilities + h.assetsVsLiabilities.longTermLiabilities)}M
            </div>
          </div>
        </div>
      </SectionCard>

      {/* D/E Trend + Beta — side by side */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <SectionCard id="health-debt" title="Dívida/Patrimônio — 5 anos" subtitle="Trajetória de endividamento relativo">
          <div className="h-52">
            <TremorArea
              data={h.debtToEquitySeries}
              index="year"
              categories={["value"]}
              colors={["amber"]}
              valueFormatter={(v: number) => `${v}%`}
              showLegend={false}
              showGridLines={true}
              curveType="monotone"
              yAxisWidth={44}
            />
          </div>
          <p className="mt-3 text-xs text-neutral-400 leading-5">
            D/E caiu de {h.debtToEquity5yAgo}% para {h.debtToEquity}% — tendência positiva.
          </p>
        </SectionCard>

        <SectionCard title="Perfil de Risco (Beta)" subtitle="Volatilidade vs Ibovespa">
          <BulletChart
            value={data.priceHistory.volatilityBeta}
            target={1.0}
            ranges={[0.5, 1.0, 2.0]}
            label="Beta vs Ibovespa"
            domain={[0, 2.5]}
          />
          <p className="mt-3 text-xs text-neutral-400 leading-5">
            Beta {data.priceHistory.volatilityBeta} — a ação é{' '}
            {data.priceHistory.volatilityBeta > 1.2 ? 'significativamente mais volátil' :
             data.priceHistory.volatilityBeta > 1.0 ? 'ligeiramente mais volátil' :
             data.priceHistory.volatilityBeta > 0.8 ? 'próxima em volatilidade' : 'menos volátil'}
            {' '}que o Ibovespa.
          </p>
        </SectionCard>
      </div>

      {/* Cobertura — side by side */}
      <div id="health-coverage" className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <SectionCard title="Cobertura de Dívida" subtitle="FCO / Dívida Total">
          <BulletChart
            value={Math.round((h.operatingCashFlow / h.totalDebt) * 100)}
            target={20}
            ranges={[10, 20, 50]}
            label="FCO / Dívida Total"
            unit="%"
            domain={[0, 60]}
          />
        </SectionCard>

        <SectionCard title="Cobertura de Juros" subtitle="EBIT / Despesa de Juros">
          <BulletChart
            value={Number((h.ebit / h.interestExpense).toFixed(1))}
            target={5}
            ranges={[2, 5, 15]}
            label="EBIT / Juros"
            unit="x"
            domain={[0, 16]}
          />
        </SectionCard>
      </div>
    </div>
  );
}

// ─── Dividend Tab ────────────────────────────────────────────────────────────

function DividendTab({ data }: { data: AnalysisData }) {
  const dim = data.snowflake.find(d => d.dimension === 'dividend')!;
  const d = data.dividend;

  return (
    <div className="space-y-6">
      <DimensionIntroCard dimension="dividend" title="Dividendos" icon={<DollarSign className="w-5 h-5" />} color={COLORS.dividend} />
      <DimensionScoreCard
        label="Dividendos"
        score={dim.score}
        checks={dim.checks}
        color={COLORS.dividend}
        anchors={['div-yield', 'div-yield', 'div-history', 'div-history', 'div-payout', 'div-payout']}
      />

      {/* Yield — Bullet Chart with market percentiles (replaces gauge) */}
      <SectionCard
        id="div-yield"
        title="Rendimento de Dividendos — Posição no Mercado"
        subtitle="Posição do rendimento atual em relação à distribuição do mercado"
      >
        <div className="flex items-center gap-6 mb-4">
          <div className="text-center">
            <div className="text-4xl font-bold" style={{ color: COLORS.dividend }}>
              {d.currentYield}%
            </div>
            <div className="text-sm text-neutral-500 mt-1">Rendimento atual</div>
          </div>
          <div className="flex-1">
            <BulletChart
              value={d.currentYield}
              target={d.marketYield75th}
              ranges={[d.marketYield25th, d.marketYield75th, 12]}
              label="Posição relativa ao mercado"
              unit="%"
              domain={[0, 13]}
            />
          </div>
        </div>
      </SectionCard>

      {/* Histórico + Payout — side by side */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <SectionCard id="div-history" title="Histórico de dividendos por ação" subtitle="Última década">
          <div className="h-52">
            <TremorBar
              data={d.dividendSeries}
              index="year"
              categories={["value"]}
              colors={["violet"]}
              valueFormatter={(v: number) => `R$ ${v.toFixed(1)}`}
              showLegend={false}
              showGridLines={true}
              yAxisWidth={44}
            />
          </div>
          {!d.isStable && (
            <p className="mt-3 text-xs text-amber-600 leading-5">
              Queda superior a 10% em algum dos últimos 10 anos — instabilidade detectada.
            </p>
          )}
        </SectionCard>

        <SectionCard id="div-payout" title="Índice de Payout — Evolução" subtitle="% do lucro distribuído como dividendo">
          <div className="h-52">
            <TremorArea
              data={d.payoutSeries}
              index="year"
              categories={["value"]}
              colors={["violet"]}
              valueFormatter={(v: number) => `${v}%`}
              showLegend={false}
              showGridLines={true}
              curveType="monotone"
              yAxisWidth={36}
            />
          </div>
          <div className="mt-3 grid grid-cols-2 gap-4">
            <div className="pl-3 border-l-2 border-teal-200">
              <div className="text-[10px] uppercase text-neutral-400 mb-0.5">Payout atual</div>
              <div className="text-base font-bold text-teal-700">{d.payoutRatio}%</div>
            </div>
            <div className={`pl-3 border-l-2 ${d.futurePayoutRatio <= 90 ? 'border-teal-200' : 'border-rose-300'}`}>
              <div className="text-[10px] uppercase text-neutral-400 mb-0.5">Estimado 3a</div>
              <div className={`text-base font-bold ${d.futurePayoutRatio <= 90 ? 'text-teal-700' : 'text-rose-600'}`}>{d.futurePayoutRatio}%</div>
            </div>
          </div>
        </SectionCard>
      </div>

      {/* Dividendo vs Lucro */}
      <SectionCard
        title="Dividendo vs Lucro por Ação"
        subtitle="LPA deve sempre superar DPA para sustentabilidade"
      >
        <DividendVsEarningsChart data={data.dividendVsEarnings} />
        <p className="mt-3 text-xs text-neutral-400 leading-5">
          A barra azul (LPA) deve sempre ser maior que a roxa (DPA). Quando convergem, o payout pode tornar-se insustentável.
        </p>
      </SectionCard>
    </div>
  );
}

// ─── Ownership Tab ───────────────────────────────────────────────────────────

function OwnershipTab({ data }: { data: AnalysisData }) {
  const o = data.ownership;

  const ownershipItems = [
    { name: 'Institucional', value: o.institutionalOwnership, color: '#3b82f6' },
    { name: 'Público', value: o.publicOwnership, color: '#6b7280' },
    { name: 'Insiders', value: o.insiderOwnership, color: '#8b5cf6' },
  ];

  return (
    <div className="space-y-6">
      {/* STACKED BAR replaces PIE — data-to-viz caveat #4 */}
      <SectionCard
        title="Composição Acionária"
        subtitle="Distribuição entre investidores institucionais, insiders e público geral"
      >
        <StackedOwnershipBar items={ownershipItems} />
      </SectionCard>

      {/* Top Shareholders — Table (best for precise values per data-to-viz) */}
      <SectionCard title="Maiores acionistas" subtitle="Principais detentores e seus percentuais de participação">
        <div className="overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-neutral-200">
                <th className="text-left py-3 px-2 font-medium text-neutral-500">Acionista</th>
                <th className="text-right py-3 px-2 font-medium text-neutral-500">Participação</th>
                <th className="text-right py-3 px-2 font-medium text-neutral-500">Tipo</th>
              </tr>
            </thead>
            <tbody>
              {o.topShareholders.map((sh) => (
                <tr key={sh.name} className="border-b border-neutral-100 hover:bg-neutral-50 transition-colors">
                  <td className="py-3 px-2 font-medium text-neutral-900">{sh.name}</td>
                  <td className="py-3 px-2 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <div className="w-16 h-1.5 rounded-full bg-neutral-100 overflow-hidden">
                        <div className="h-full rounded-full bg-indigo-500" style={{ width: `${sh.percentage * 2}%` }} />
                      </div>
                      <span className="font-mono w-12 text-right">{sh.percentage}%</span>
                    </div>
                  </td>
                  <td className="py-3 px-2 text-right">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      sh.type === 'institution' ? 'bg-blue-50 text-blue-700' :
                      sh.type === 'insider' ? 'bg-violet-50 text-violet-700' :
                      'bg-neutral-100 text-neutral-600'
                    }`}>
                      {sh.type === 'institution' ? 'Institucional' : sh.type === 'insider' ? 'Insider' : 'Público'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>

      {/* Insider Transactions */}
      <SectionCard title="Transações de Insiders (12 meses)">
        <div className="flex items-center gap-6 mb-4 p-4 rounded-xl bg-neutral-50">
          <div className="text-center">
            <div className="text-sm text-neutral-500">Compras</div>
            <div className="text-xl font-bold text-green-600">R$ {formatNumber(o.insiderBuys)}</div>
          </div>
          <div className="text-2xl text-neutral-300">vs</div>
          <div className="text-center">
            <div className="text-sm text-neutral-500">Vendas</div>
            <div className="text-xl font-bold text-red-600">R$ {formatNumber(o.insiderSells)}</div>
          </div>
          <div className="flex-1 text-right">
            <span className={`text-sm font-medium px-3 py-1 rounded-full ${
              o.insiderBuys > o.insiderSells ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
            }`}>
              {o.insiderBuys > o.insiderSells ? 'Compra líquida (positivo)' : 'Venda líquida (negativo)'}
            </span>
          </div>
        </div>

        <div className="space-y-2">
          {o.insiderTransactions.map((tx, idx) => (
            <div key={idx} className="flex items-center gap-3 py-2 px-3 rounded-lg hover:bg-neutral-50 transition-colors">
              <div className={`w-2 h-2 rounded-full ${tx.type === 'buy' ? 'bg-green-500' : 'bg-red-500'}`} />
              <span className="text-sm text-neutral-500 w-20">{tx.date}</span>
              <span className="text-sm font-medium text-neutral-900 flex-1">{tx.name}</span>
              <span className={`text-sm font-medium ${tx.type === 'buy' ? 'text-green-600' : 'text-red-600'}`}>
                {tx.type === 'buy' ? 'Compra' : 'Venda'}
              </span>
              <span className="text-sm font-mono text-neutral-700 w-28 text-right">
                R$ {formatNumber(tx.value)}
              </span>
            </div>
          ))}
        </div>
      </SectionCard>

      {/* NEW: Insider Sentiment Trend */}
      <SectionCard
        title="Sentimento Insider (Trimestral)"
        subtitle="Saldo trimestral de compras e vendas de insiders — positivo indica maior confiança da gestão"
      >
        <InsiderSentimentChart data={data.insiderSentiment} />
        <div className="mt-3 p-3 rounded-lg bg-neutral-50 text-sm text-neutral-600">
          <strong>Leitura:</strong> Barras verdes indicam que insiders estão comprando mais que vendendo (sinal positivo).
          Barras vermelhas indicam venda líquida. Padrão de compra consistente sugere confiança da gestão.
        </div>
      </SectionCard>
    </div>
  );
}

// ─── Main Page Component ─────────────────────────────────────────────────────

export function AnalysisPage() {
  const params = useParams();
  const ticker = (params?.ticker as string) ?? 'VALE3';
  const [activeTab, setActiveTab] = useState<AnalysisTab>('overview');

  const data = useMemo(() => getAnalysisData(ticker), [ticker]);

  const renderTab = () => {
    switch (activeTab) {
      case 'overview': return <OverviewTab data={data} onSelectTab={setActiveTab} />;
      case 'value': return <ValueTab data={data} />;
      case 'future': return <FutureTab data={data} />;
      case 'past': return <PastTab data={data} />;
      case 'health': return <HealthTab data={data} />;
      case 'dividend': return <DividendTab data={data} />;
      case 'ownership': return <OwnershipTab data={data} />;
      default: return <OverviewTab data={data} onSelectTab={setActiveTab} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Top Bar */}
      <div className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="text-neutral-400 hover:text-neutral-700 transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center text-white font-bold text-xs">
                {ticker.slice(0, 2)}
              </div>
              <div>
                <div className="font-semibold text-neutral-900 text-sm">{data.company.name}</div>
                <div className="text-xs text-neutral-500">{data.company.exchange}:{ticker}</div>
              </div>
            </div>
            <div className="ml-auto flex items-center gap-2 text-sm">
              <span className="font-bold text-neutral-900">R$ {data.valuation.currentPrice.toFixed(2)}</span>
              <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                data.priceHistory.return1y >= 0 ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
              }`}>
                {data.priceHistory.return1y >= 0 ? '+' : ''}{data.priceHistory.return1y}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="max-w-7xl mx-auto px-4 py-6 flex gap-6 items-start">
        {/* Left Sidebar — Tab Navigation */}
        <aside className="w-48 flex-shrink-0 sticky top-[57px] self-start">
          <nav className="flex flex-col">
            {TABS.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center pl-4 pr-3 py-2.5 text-sm font-medium transition-all text-left border-l-2 ${
                    isActive
                      ? 'border-teal-500 text-neutral-900 bg-teal-50/60'
                      : 'border-transparent text-neutral-500 hover:text-neutral-800 hover:bg-neutral-100'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </aside>

        {/* Main Content */}
        <div className="flex-1 min-w-0">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
          >
            {renderTab()}
          </motion.div>

        </div>
      </div>
    </div>
  );
}


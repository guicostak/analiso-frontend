'use client';

import React from 'react';
import { createPortal } from 'react-dom';
import type { HealthTabState } from '../hooks/useAnalysisPageState';
import {
  AreaChart as TremorArea,
  BarChart as TremorBar,
  LineChart as TremorLine,
} from '@tremor/react';
import type { AnalysisData } from '../interfaces';
import { COLORS } from '../constants/colors';
import { safeN, safeNbr, formatNumber, fmtBRL, formatDate } from '../utils/formatters';
import { SectionCard, CheckList, CriteriaIcon, ChartInfoButton, AGFC_H, AGFC_MAX_BAR, AGFC_TOP_PAD } from './AnalysisShared';
import { DimensionCheckCard } from './ScoreDots';

function BalanceBarChart({ title, bars }: {
  title: string;
  bars: { label: string; value: number; color: string; textColor: string }[];
}) {
  const normalizedBars = bars.map((bar) => ({
    ...bar,
    value: Number.isFinite(bar.value) ? bar.value : 0,
  }));
  const maxVal = Math.max(...normalizedBars.map((bar) => Math.abs(bar.value)), 0.01);
  const n = bars.length;
  const pct = 100 / n;
  const fmt = (v: number | null | undefined) => {
    if (typeof v !== 'number' || !Number.isFinite(v)) return '—';
    const abs = Math.abs(v);
    if (abs >= 1e9) return `R$${(v / 1e9).toFixed(1)}bi`;
    if (abs >= 1e6) return `R$${(v / 1e6).toFixed(1)}mi`;
    return `R$${v.toFixed(0)}`;
  };
  return (
    <div className="flex-1">
      <div className="relative" style={{ height: AGFC_H }}>
        <svg width="100%" height={AGFC_H} shapeRendering="crispEdges" style={{ position: 'absolute', top: 0, left: 0 }}>
          <rect x="0" y={AGFC_H - 1} width="100%" height="1" fill="#e5e7eb" />
        </svg>
        <svg
          width="100%"
          height={AGFC_H}
          shapeRendering="crispEdges"
          role="document"
          aria-label={title}
          style={{ position: 'absolute', top: 0, left: 0 }}
        >
          {normalizedBars.map((bar, i) => {
            const barH = (Math.abs(bar.value) / maxVal) * AGFC_MAX_BAR;
            const ty = AGFC_H - barH;
            return (
              <svg key={bar.label} x={`${i * pct}%`} y="0" width={`${pct}%`} height={AGFC_H}>
                <g transform={`translate(0,${ty})`}>
                  <rect x="0" y="0" width="100%" height={barH} fill={bar.color} />
                  <rect x="0" y={barH - 1} width="100%" height="1" fill="#e5e7eb" />
                  <rect x="0" y={-AGFC_TOP_PAD} width="100%" height={AGFC_TOP_PAD} fill="transparent" tabIndex={0} />
                  <svg x="8" y="8" overflow="visible">
                    <text y="0" fill={bar.textColor} fontSize="12" textAnchor="start">
                      <tspan x="0" dy="0.71em">{bar.label}</tspan>
                    </text>
                  </svg>
                  <svg x="8" y="-8" overflow="visible">
                    <text y="0" fill="#374151" fontSize="12" textAnchor="start">
                      <tspan x="0" dy="0em">{fmt(bar.value)}</tspan>
                    </text>
                  </svg>
                </g>
              </svg>
            );
          })}
        </svg>
      </div>
      <h4 className="text-xs font-medium text-muted-foreground mt-2 text-center">{title}</h4>
    </div>
  );
}

function FinancialPositionSection({ data }: { data: AnalysisData }) {
  const h = data.health ?? {} as typeof data.health;
  const ticker = data.company.ticker;
  const avlDefault = { shortTermAssets: 0, shortTermLiabilities: 0, longTermAssets: 0, longTermLiabilities: 0 };
  const avl = h.assetsVsLiabilities ?? avlDefault;

  const shortTermBars = [
    { label: 'Ativos',   value: avl.shortTermAssets,      color: '#3b82f6', textColor: '#FFFFFF' },
    { label: 'Passivos', value: avl.shortTermLiabilities, color: '#bae6fd', textColor: '#262E3A' },
  ];

  const longTermBars = [
    { label: 'Ativos',   value: avl.longTermAssets,       color: '#3b82f6', textColor: '#FFFFFF' },
    { label: 'Passivos', value: avl.longTermLiabilities,  color: '#bae6fd', textColor: '#262E3A' },
  ];

  const stA = avl.shortTermAssets;
  const stL = avl.shortTermLiabilities;
  const ltL = avl.longTermLiabilities;

  const fmt = (v: number) => {
    const abs = Math.abs(v);
    if (abs >= 1e9) return `R$ ${(v / 1e9).toFixed(2).replace('.', ',')} bi`;
    if (abs >= 1e6) return `R$ ${(v / 1e6).toFixed(1).replace('.', ',')} mi`;
    return `R$ ${v.toFixed(0)}`;
  };

  const checks: { id: string; passed: boolean; label: string; content: React.ReactNode }[] = [
    {
      id: 'health-short-term',
      passed: stA > stL,
      label: 'Passivos de curto prazo:',
      content: (
        <span>
          {ticker} ativos de curto prazo ({fmt(stA)}) {stA > stL ? 'excedem' : 'não cobrem'} seu passivos de curto prazo ({fmt(stL)}).
        </span>
      ),
    },
    {
      id: 'health-long-term',
      passed: stA > ltL,
      label: 'Passivo de longo prazo:',
      content: (
        <span>
          Os ativos de curto prazo da {ticker} ({fmt(stA)}) {stA > ltL ? 'superam' : 'não cobrem'} seus passivos de longo prazo ({fmt(ltL)}).
        </span>
      ),
    },
  ];

  return (
    <section data-section="health" id="health-balance">
      <div className="flex items-start gap-2 mb-4">
        <h3 className="text-[15px] font-semibold text-foreground tracking-tight">
          Análise da Posição Financeira
        </h3>
        <ChartInfoButton>
          As barras comparam <b>ativos vs. passivos</b> em duas janelas: <b>curto prazo</b> (próximos 12 meses)
          e <b>longo prazo</b>. Ativos maiores que passivos indica capacidade de honrar compromissos.
        </ChartInfoButton>
      </div>
      <div className="analysis-card p-6">
        <div className="flex gap-6">
          <BalanceBarChart title="Curto prazo" bars={shortTermBars} />
          <BalanceBarChart title="Longo prazo" bars={longTermBars} />
        </div>
        <div className="mt-4">
          {checks.map(check => (
            <blockquote key={check.id} className="flex items-start gap-3 py-2.5 border-t border-border first:border-0">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-0.5">
                  <CriteriaIcon passed={check.passed} size={24} />
                </div>
                <p className="text-xs leading-5 text-foreground">
                  <span className={`font-semibold ${check.passed ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {check.label}{' '}
                  </span>
                  {check.content}
                </p>
              </div>
            </blockquote>
          ))}
        </div>
      </div>
    </section>
  );
}

const DEBT_CHART_SERIES: { key: string; color: string; hex: string }[] = [
  { key: 'Dívida',                    color: 'rose',   hex: '#f43f5e' },
  { key: 'Patrimônio Líquido',        color: 'blue',   hex: '#3b82f6' },
  { key: 'Dinheiro e equivalentes',   color: 'teal',   hex: '#14b8a6' },
];

function DebtHistorySection({ data, activeKeys, setActiveKeys }: {
  data: AnalysisData;
  activeKeys: Set<string>;
  setActiveKeys: React.Dispatch<React.SetStateAction<Set<string>>>;
}) {
  const h = data.health;

  const chartData = (h.debtHistorySeries ?? []).map(d => ({
    year: d.year,
    'Dívida':                   d.debt,
    'Patrimônio Líquido':        d.equity,
    'Dinheiro e equivalentes':  d.cash,
  }));

  const activeSeries = DEBT_CHART_SERIES.filter(s => activeKeys.has(s.key));

  const toggleKey = (key: string) =>
    setActiveKeys(prev => {
      const next = new Set(prev);
      if (next.has(key)) { if (next.size > 1) next.delete(key); }
      else next.add(key);
      return next;
    });

  return (
    <section>
      <div className="flex items-start gap-2 mb-4">
        <h3 className="text-[15px] font-semibold text-foreground tracking-tight">
          Histórico e análise da relação dívida/patrimônio líquido
        </h3>
        <ChartInfoButton>
          A área mostra a <b>evolução da dívida</b> em relação ao patrimônio ao longo dos anos.
          Tendência de queda é positiva; subidas rápidas indicam alavancagem crescente.
        </ChartInfoButton>
      </div>
      <div className="analysis-card p-5">
        <div className="h-[360px] [&_.recharts-cartesian-axis-tick_text]:text-[10px] [&_.recharts-cartesian-axis-tick_text]:fill-neutral-400">
          <TremorArea
            data={chartData}
            index="year"
            categories={activeSeries.map(s => s.key)}
            colors={activeSeries.map(s => s.color)}
            valueFormatter={(v: number) => { const a = Math.abs(v); return a >= 1e9 ? `R$ ${(v/1e9).toFixed(1)}bi` : a >= 1e6 ? `R$ ${(v/1e6).toFixed(1)}mi` : `R$ ${v.toFixed(0)}`; }}
            showLegend={false}
            showGridLines={true}
            yAxisWidth={56}
            /* fill="gradient" */
            curveType="monotone"
          />
        </div>
        <div className="flex gap-2 flex-wrap mt-3">
          {DEBT_CHART_SERIES.map(s => (
            <button
              key={s.key}
              onClick={() => toggleKey(s.key)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all border border-border bg-muted text-muted-foreground hover:bg-hover ${
                activeKeys.has(s.key) ? 'opacity-100' : 'opacity-40'
              }`}
            >
              <span
                className="w-2.5 h-2.5 rounded-full flex-shrink-0 border"
                style={activeKeys.has(s.key)
                  ? { backgroundColor: s.hex, borderColor: s.hex }
                  : { backgroundColor: 'transparent', borderColor: s.hex }}
              />
              {s.key}
            </button>
          ))}
        </div>
        <div className="mt-4">
          {[
            {
              id: 'debt-level',
              passed: true,
              label: 'Nível de endividamento:',
              content: 'A WEGE3 possui mais caixa do que sua dívida total.',
            },
            {
              id: 'debt-reduction',
              passed: false,
              label: 'Redução da dívida:',
              content: 'A relação dívida/patrimônio líquido da WEGE3 aumentou de 14,1% para 24,7% nos últimos 5 anos.',
            },
            {
              id: 'debt-coverage',
              passed: true,
              label: 'Cobertura da dívida:',
              content: 'A dívida da WEGE3 é bem coberta por fluxo de caixa operacional (140,5%).',
            },
            {
              id: 'interest-coverage',
              passed: true,
              label: 'Cobertura de juros:',
              content: 'O WEGE3 rende mais juros do que paga, portanto, a cobertura de pagamentos de juros não é motivo de preocupação.',
            },
          ].map(check => (
            <blockquote key={check.id} className="flex items-start gap-3 py-2.5 border-t border-border first:border-0">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-0.5">
                  <CriteriaIcon passed={check.passed} size={24} />
                </div>
                <p className="text-xs leading-5 text-foreground">
                  <span className={`font-semibold ${check.passed ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {check.label}{' '}
                  </span>
                  {check.content}
                </p>
              </div>
            </blockquote>
          ))}
        </div>
      </div>
    </section>
  );
}

const AXIS_W  = 36; // px — center axis column width
const BS_BAR_H  = 80;
const BS_ANNOT_H = 44; // annotation strip height for small segments
const BS_MIN_PCT = 10; // % below which inline label is replaced by external annotation

function BalanceSheetSection({ data }: { data: AnalysisData }) {
  const bs    = data.health?.balanceSheet;
  if (!bs?.assets || !bs?.liabilities) return null;
  const safeValue = (value: number | null | undefined): number => (
    typeof value === 'number' && Number.isFinite(value) ? value : 0
  );
  const assets = {
    cash: safeValue(bs.assets.cash),
    receivables: safeValue(bs.assets.receivables),
    inventory: safeValue(bs.assets.inventory),
    physicalAssets: safeValue(bs.assets.physicalAssets),
    longTermAssets: safeValue(bs.assets.longTermAssets),
  };
  const liabilities = {
    accountsPayable: safeValue(bs.liabilities.accountsPayable),
    debt: safeValue(bs.liabilities.debt),
    otherLiabilities: safeValue(bs.liabilities.otherLiabilities),
    equity: safeValue(bs.liabilities.equity),
  };
  const assetsSum = assets.cash + assets.receivables + assets.inventory +
                assets.physicalAssets + assets.longTermAssets;
  const liabilitiesSum = liabilities.accountsPayable + liabilities.debt +
                liabilities.otherLiabilities + liabilities.equity;
  // Use the larger side so both bars are proportioned on the same scale
  const totalRaw = Math.max(assetsSum, liabilitiesSum);
  const total = totalRaw > 0 ? totalRaw : 1;

  const fmt = (v: number | null | undefined) => {
    if (typeof v !== 'number' || !Number.isFinite(v)) return '—';
    const abs = Math.abs(v);
    if (abs >= 1e9) return `R$${(v / 1e9).toFixed(1)}bi`;
    if (abs >= 1e6) return `R$${(v / 1e6).toFixed(1)}mi`;
    return `R$${v.toFixed(0)}`;
  };
  const pct = (v: number | null | undefined) => `${((safeValue(v) / total) * 100).toFixed(1)}%`;

  // first = rightmost (flex-row-reverse → most liquid at center).
  // Blues: wider luminosity steps for scannability — light at center, dark at edge.
  const assetSegments = [
    { label: 'Caixa e Invest. de Curto Prazo', short: 'Caixa & CP',  value: assets.cash,               color: '#93c5fd', textDark: true,  key: true  },
    { label: 'Recebíveis',                     short: 'Recebíveis',  value: assets.receivables,        color: '#3b82f6', textDark: false, key: false },
    { label: 'Estoques',                       short: 'Estoques',    value: assets.inventory,           color: '#1d4ed8', textDark: false, key: false },
    { label: 'Ativos Físicos',                 short: 'Ativos Fís.', value: assets.physicalAssets,     color: '#1e40af', textDark: false, key: false },
    { label: 'Ativos de LP e Outros',          short: 'LP & Outros', value: assets.longTermAssets,     color: '#1e3a8a', textDark: false, key: true  },
  ];

  // first = leftmost (most urgent at center). Red for debt, orange for others, green for equity.
  const liabilitySegments = [
    { label: 'Contas a Pagar',     short: 'A Pagar',     value: liabilities.accountsPayable,      color: '#f97316', textDark: false, key: false },
    { label: 'Dívida',             short: 'Dívida',       value: liabilities.debt,                 color: '#dc2626', textDark: false, key: true  },
    { label: 'Outros Passivos',    short: 'Outros Pass.', value: liabilities.otherLiabilities,     color: '#fb923c', textDark: false, key: false },
    { label: 'Patrimônio Líquido', short: 'Patrim. L.',   value: liabilities.equity,               color: '#15803d', textDark: false, key: true  },
  ];

  type Seg = typeof assetSegments[number];

  // Annotation strip: same flex layout as bar — renders callout for segments < BS_MIN_PCT
  const AnnotStrip = ({ segments, reverse }: { segments: Seg[]; reverse: boolean }) => (
    <div className={`flex-1 flex ${reverse ? 'flex-row-reverse' : ''}`}>
      {segments.map((seg) => {
        const w = Math.max(0, (seg.value / total) * 100);
        return (
          <div key={seg.label} style={{ width: `${w}%` }} className="relative flex flex-col items-center justify-end">
            {w < BS_MIN_PCT && (
              <div className="flex flex-col items-center" style={{ overflow: 'visible', whiteSpace: 'nowrap' }}>
                <span className="font-medium text-muted-foreground" style={{ fontSize: 8 }}>{seg.short}</span>
                <span className="font-bold text-foreground" style={{ fontSize: 9 }}>{fmt(seg.value)}</span>
                <div className="w-px bg-border" style={{ height: 7, marginTop: 2 }} />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );

  // Bar: inline label only when w >= BS_MIN_PCT
  const BarSide = ({ segments, reverse }: { segments: Seg[]; reverse: boolean }) => (
    <div className={`flex-1 flex ${reverse ? 'flex-row-reverse' : ''} overflow-hidden ${reverse ? 'rounded-l-lg' : 'rounded-r-lg'}`}>
      {segments.map((seg) => {
        const w = Math.max(0, (seg.value / total) * 100);
        const tc = seg.textDark ? '#1e3a8a' : '#ffffff';
        return (
          <div
            key={seg.label}
            className="relative flex flex-col items-center justify-center overflow-hidden"
            style={{ width: `${w}%`, backgroundColor: seg.color }}
          >
            {w >= BS_MIN_PCT && (
              <div className="text-center px-1 select-none">
                <div style={{ fontSize: 9, color: tc }} className="font-semibold leading-tight">{seg.short}</div>
                <div style={{ fontSize: seg.key ? 13 : 11, color: tc }} className="font-bold">{fmt(seg.value)}</div>
                <div style={{ fontSize: 9, color: tc, opacity: 0.65 }}>{pct(seg.value)}</div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );

  // Legend row — accent left border for key metrics, tabular-nums, no zebra bg
  const LegendRow = ({ seg }: { seg: Seg }) => (
    <div
      className="flex items-center gap-2 py-1.5 border-b border-border/50 last:border-0"
      style={seg.key ? { borderLeft: `3px solid ${seg.color}`, paddingLeft: 6 } : { paddingLeft: 0 }}
    >
      <div className="w-2.5 h-2.5 rounded-sm flex-shrink-0" style={{ backgroundColor: seg.color }} />
      <span className={`flex-1 text-xs truncate ${seg.key ? 'font-semibold text-foreground' : 'text-muted-foreground'}`}>
        {seg.label}
      </span>
      <span className="text-xs font-semibold text-foreground tabular-nums ml-2">{fmt(seg.value)}</span>
      <span className="text-[10px] text-muted-foreground tabular-nums w-12 text-right">{pct(seg.value)}</span>
    </div>
  );

  return (
    <section>
      <div className="flex items-start gap-2 mb-4">
        <h3 className="text-[15px] font-semibold text-foreground tracking-tight">
          Balanço Patrimonial
        </h3>
        <ChartInfoButton>
          As barras horizontais comparam <b>ativos</b> (à esquerda, do menos para o mais líquido) com
          <b> passivos e patrimônio</b> (à direita). A largura é proporcional ao valor financeiro de cada item.
        </ChartInfoButton>
      </div>
      <div className="analysis-card p-6">

        {/* Headers */}
        <div className="flex mb-1 items-end">
          <div className="flex-1">
            <div className="text-[11px] font-semibold uppercase tracking-normal text-foreground">Ativos</div>
            <div className="text-xs text-muted-foreground mt-0.5">menos líquido → mais líquido</div>
          </div>
          <div style={{ width: AXIS_W }} />
          <div className="flex-1">
            <div className="text-[11px] font-semibold uppercase tracking-normal text-foreground">Passivo + Patrimônio Líquido</div>
            <div className="text-xs text-muted-foreground mt-0.5">mais exigível → menos exigível</div>
          </div>
        </div>

        {/* Annotation strip — callouts for segments below inline-label threshold */}
        <div className="flex" style={{ height: BS_ANNOT_H }}>
          <AnnotStrip segments={assetSegments} reverse />
          <div style={{ width: AXIS_W }} />
          <AnnotStrip segments={liabilitySegments} reverse={false} />
        </div>

        {/* Mirrored stacked bar */}
        <div className="flex" style={{ height: BS_BAR_H }}>
          <BarSide segments={assetSegments} reverse />
          {/* Center axis — the accounting pivot */}
          <div className="flex-shrink-0 flex flex-col items-center" style={{ width: AXIS_W }}>
            <div className="h-full" style={{ width: 4, backgroundColor: 'var(--foreground)', borderRadius: 3 }} />
          </div>
          <BarSide segments={liabilitySegments} reverse={false} />
        </div>

        {/* Totals — "=" anchored exactly to axis center */}
        <div className="flex items-baseline mt-2">
          <div className="flex-1 text-right">
            <span className="text-sm font-bold text-foreground tabular-nums">{fmt(assetsSum > 0 ? assetsSum : null)}</span>
            <span className="text-[10px] text-muted-foreground ml-1">total</span>
          </div>
          <div style={{ width: AXIS_W }} className="text-center">
            <span className="text-xs text-muted-foreground font-light" style={{ letterSpacing: 1 }}>=</span>
          </div>
          <div className="flex-1">
            <span className="text-sm font-bold text-foreground tabular-nums">{fmt(liabilitiesSum > 0 ? liabilitiesSum : null)}</span>
            <span className="text-[10px] text-muted-foreground ml-1">total</span>
          </div>
        </div>

        {/* Legend */}
        <div className="mt-5 grid grid-cols-2 gap-x-10">
          <div>
            <div className="text-[10px] font-semibold uppercase tracking-normal text-muted-foreground mb-2 pb-1 border-b border-border">
              Ativos — por liquidez
            </div>
            {assetSegments.map(seg => <LegendRow key={seg.label} seg={seg} />)}
          </div>
          <div>
            <div className="text-[10px] font-semibold uppercase tracking-normal text-muted-foreground mb-2 pb-1 border-b border-border">
              Passivo + PL — por exigibilidade
            </div>
            {liabilitySegments.map(seg => <LegendRow key={seg.label} seg={seg} />)}
          </div>
        </div>
      </div>
    </section>
  );
}

function HealthReadingCard({ data }: { data: AnalysisData }) {
  const h = data.health ?? {} as typeof data.health;
  const hdte   = h.debtToEquity ?? 0;
  const hdte5y = h.debtToEquity5yAgo ?? 0;
  const hsta   = h.shortTermAssets ?? 0;
  const hstl   = h.shortTermLiabilities ?? 0;
  const hocf   = h.operatingCashFlow ?? 0;
  const hltl   = h.longTermLiabilities ?? 0;
  const heq    = h.equity ?? 0;
  const interestCoverage = (h.ebit != null && h.interestExpense != null && h.interestExpense !== 0)
    ? h.ebit / h.interestExpense
    : null;

  type Strength = 'saudavel' | 'moderado' | 'alavancado';
  const strength: Strength =
    hdte < 40 && (interestCoverage ?? 0) > 5 && hsta > hstl
      ? 'saudavel'
      : hdte < 100 && (interestCoverage ?? 0) > 2
        ? 'moderado'
        : 'alavancado';

  const thesis = {
    saudavel: {
      headline:  'Balanço sólido, com baixa dívida e boa capacidade de pagamento',
      sub:       `Dívida em relação ao patrimônio de ${safeN(hdte)}% e capacidade de pagar juros de ${interestCoverage != null ? safeN(interestCoverage) + 'x' : '—'} indicam estrutura financeira conservadora.`,
      badge:     'Saúde forte',
      badgeBg:   'var(--brand-surface)',
      badgeColor:'#1D4ED8',
      badgeDot:  '#3B82F6',
      synthesis: `A estrutura financeira é conservadora, com folga para suportar períodos difíceis e capacidade de investir sem pressão excessiva sobre o caixa.`,
    },
    moderado: {
      headline:  'Estrutura financeira adequada, com pontos de atenção',
      sub:       `Dívida em relação ao patrimônio de ${safeN(hdte)}% e capacidade de pagar juros de ${interestCoverage != null ? safeN(interestCoverage) + 'x' : '—'}, dentro de limites aceitáveis.`,
      badge:     'Saúde moderada',
      badgeBg:   '#F0FDF4',
      badgeColor:'#0F766E',
      badgeDot:  '#14B8A6',
      synthesis: `Saúde financeira dentro dos parâmetros, mas com pontos que merecem acompanhamento. Fique de olho na evolução da dívida e na capacidade de pagar juros.`,
    },
    alavancado: {
      headline:  'Endividamento elevado, estrutura financeira sob pressão',
      sub:       `Dívida em relação ao patrimônio de ${safeN(hdte)}% e capacidade de pagar juros de ${interestCoverage != null ? safeN(interestCoverage) + 'x' : '—'} sinalizam pressão financeira.`,
      badge:     'Atenção',
      badgeBg:   '#FFF7ED',
      badgeColor:'#C2410C',
      badgeDot:  '#F97316',
      synthesis: `O nível de endividamento atual exige atenção. Uma dívida alta em relação ao patrimônio pode limitar a capacidade da empresa de reagir a cenários adversos.`,
    },
  }[strength];

  type EvidenceRow = { criterion: string; observed: string; reference: string; micro: string };
  type LimitRow    = { criterion: string; observed: string; reference: string; micro: string };

  const evidences: EvidenceRow[] = [];
  if (hsta > hstl) {
    evidences.push({
      criterion: 'Ativos de curto prazo cobrem passivos imediatos',
      observed:  `${fmtBRL(hsta)} em ativos`,
      reference: `Passivos ${fmtBRL(hstl)}`,
      micro:     'Liquidez de curto prazo adequada para honrar obrigações imediatas.',
    });
  }
  if (interestCoverage != null && interestCoverage > 3) {
    evidences.push({
      criterion: 'Cobertura de juros confortável',
      observed:  `${safeN(interestCoverage)}x`,
      reference: 'Referência > 3x',
      micro:     'EBIT cobre os juros com folga relevante.',
    });
  }
  if (hdte < hdte5y) {
    evidences.push({
      criterion: 'Dívida/PL em queda',
      observed:  `${safeN(hdte)}%`,
      reference: `5a atrás ${safeN(hdte5y)}%`,
      micro:     'Tendência de desalavancagem ao longo dos anos.',
    });
  }
  if (evidences.length < 2 && hocf > 0) {
    evidences.push({
      criterion: 'Fluxo de caixa operacional positivo',
      observed:  fmtBRL(hocf),
      reference: 'FCO > 0',
      micro:     'Geração de caixa operacional suporta o serviço da dívida.',
    });
  }

  const limitations: LimitRow[] = [];
  if (hdte > 80) {
    limitations.push({
      criterion: 'Alavancagem acima do confortável',
      observed:  `${safeN(hdte)}%`,
      reference: 'Ideal < 80%',
      micro:     'Nível de dívida em relação ao PL limita flexibilidade financeira.',
    });
  }
  if (interestCoverage != null && interestCoverage < 3) {
    limitations.push({
      criterion: 'Cobertura de juros limitada',
      observed:  `${safeN(interestCoverage)}x`,
      reference: 'Ideal > 3x',
      micro:     'Folga para cobrir despesas financeiras está abaixo do recomendável.',
    });
  }
  if (hltl > heq) {
    limitations.push({
      criterion: 'Passivos de longo prazo superam o PL',
      observed:  `${fmtBRL(hltl)} em passivos LP`,
      reference: `PL ${fmtBRL(heq)}`,
      micro:     'Obrigações de longo prazo superam o patrimônio líquido.',
    });
  }

  return (
    <div className="space-y-4">
      <div className="analysis-card overflow-hidden">

        {/* ── 1. Header ── */}
        <div className="px-7 pt-7 pb-6 flex items-start justify-between gap-6">
          <div className="flex-1 min-w-0">
            <h2 className="text-[22px] font-bold text-foreground leading-snug mb-2">
              {thesis.headline}
            </h2>
            <p className="text-[14px] text-muted-foreground leading-relaxed max-w-xl">
              {thesis.sub}
            </p>
          </div>
          <div
            className="shrink-0 flex items-center gap-2 px-3.5 py-2 rounded-full text-[12px] font-semibold mt-1"
            style={{ backgroundColor: thesis.badgeBg, color: thesis.badgeColor }}
          >
            <span className="relative flex w-2 h-2">
              {strength === 'moderado' && (
                <span
                  className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"
                  style={{ backgroundColor: thesis.badgeDot }}
                />
              )}
              <span
                className="relative inline-flex rounded-full w-2 h-2"
                style={{ backgroundColor: thesis.badgeDot }}
              />
            </span>
            {thesis.badge}
          </div>
        </div>

        {/* ── 2. Evidences + Limitations ── */}
        <div className="border-t border-border grid grid-cols-2 divide-x divide-border">
          <div className="px-7 py-6">
            <div className="text-[10.5px] font-semibold text-muted-foreground uppercase mb-5">
              O que reforça essa conclusão
            </div>
            <div className="space-y-5">
              {evidences.slice(0, 3).map((e, i) => (
                <div key={i} className="flex gap-3.5">
                  <div className="w-[3px] rounded-full bg-[#355CDE] shrink-0 self-stretch" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-2 flex-wrap">
                      <span className="text-[15px] font-bold text-foreground tabular-nums">{e.observed}</span>
                      {e.reference && <span className="text-[11px] text-muted-foreground">{e.reference}</span>}
                    </div>
                    <div className="text-[12px] font-medium text-muted-foreground mt-0.5">{e.criterion}</div>
                    <div className="text-[11px] text-muted-foreground mt-0.5">{e.micro}</div>
                  </div>
                </div>
              ))}
              {evidences.length === 0 && (
                <div className="text-[12px] text-muted-foreground italic">Sem evidências de saúde financeira robusta.</div>
              )}
            </div>
          </div>
          <div className="px-7 py-6">
            <div className="text-[10.5px] font-semibold text-muted-foreground uppercase mb-5">
              O que limita essa leitura
            </div>
            <div className="space-y-5">
              {limitations.slice(0, 2).map((l, i) => (
                <div key={i} className="flex gap-3.5">
                  <div className="w-[3px] rounded-full bg-amber-400 shrink-0 self-stretch" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-2 flex-wrap">
                      <span className="text-[15px] font-bold text-foreground tabular-nums">{l.observed}</span>
                      <span className="text-[11px] text-muted-foreground">{l.reference}</span>
                    </div>
                    <div className="text-[12px] font-medium text-muted-foreground mt-0.5">{l.criterion}</div>
                    <div className="text-[11px] text-muted-foreground mt-0.5">{l.micro}</div>
                  </div>
                </div>
              ))}
              {limitations.length === 0 && (
                <div className="text-[12px] text-muted-foreground italic">Nenhum limitador relevante identificado.</div>
              )}
            </div>
          </div>
        </div>

        {/* ── 3. Synthesis ── */}
        <div className="border-t border-border px-7 py-4 bg-muted/50 flex items-center gap-3">
          <div className="w-1 h-5 rounded-full bg-border shrink-0" />
          <p className="text-[12.5px] text-muted-foreground leading-relaxed">
            {thesis.synthesis}
          </p>
        </div>
      </div>
    </div>
  );
}

export function HealthTab({ data, state }: { data: AnalysisData; state: HealthTabState }) {
  const h = data.health ?? {} as typeof data.health;
  const { drawerOpen, setDrawerOpen, activeKeys, setActiveKeys } = state;
  const nf  = (n: number | null | undefined, d = 1) => n == null ? '—' : n.toFixed(d);
  const nfp = (n: number | null | undefined, d = 1) => n == null ? '—' : `${n.toFixed(d)}%`;

  const interestCoverageRaw = (h.ebit != null && h.interestExpense != null && h.interestExpense !== 0)
    ? h.ebit / h.interestExpense
    : null;
  const interestCoverage = interestCoverageRaw != null ? `${safeN(interestCoverageRaw)}x` : '—';
  const avl = h.assetsVsLiabilities ?? { shortTermAssets: 0, longTermAssets: 0, shortTermLiabilities: 0, longTermLiabilities: 0 };
  const totalAssets = (avl.shortTermAssets ?? 0) + (avl.longTermAssets ?? 0);
  const totalLiabilities = (avl.shortTermLiabilities ?? 0) + (avl.longTermLiabilities ?? 0);

  return (
    <div className="space-y-6">

      {/* ── Reading Card — same pattern as ValuationReadingCard ── */}
      <HealthReadingCard data={data} />
      <DimensionCheckCard dimension="health" data={data} />

      {/* Key Information + Recent Updates — side by side */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

        {/* Key Information */}
        <div className="analysis-card p-5">
          <h3 className="text-sm font-semibold text-foreground mb-4">Informações chave</h3>
          <div className="flex gap-6 mb-4">
            <div className="flex gap-2 items-start">
              <div className="w-1 rounded-full bg-amber-500 self-stretch mt-0.5" />
              <div>
                <p className="text-lg font-bold text-foreground">{nfp(h.debtToEquity, 2)}</p>
                <p className="text-xs text-muted-foreground">Dívida em relação ao patrimônio</p>
              </div>
            </div>
            <div className="flex gap-2 items-start">
              <div className="w-1 rounded-full bg-amber-500 self-stretch mt-0.5" />
              <div>
                <p className="text-lg font-bold text-foreground">{fmtBRL(h.totalDebt)}</p>
                <p className="text-xs text-muted-foreground">Dívida total</p>
              </div>
            </div>
          </div>
          <table className="w-full text-xs">
            <tbody>
              {[
                { label: 'Capacidade de pagar juros', value: interestCoverage },
                { label: 'Caixa disponível', value: fmtBRL(h.cash) },
                { label: 'Patrimônio líquido', value: fmtBRL(h.equity) },
                { label: 'Total de dívidas e obrigações', value: fmtBRL(totalLiabilities) },
                { label: 'Total de bens e direitos', value: fmtBRL(totalAssets) },
              ].map((row) => (
                <tr key={row.label} className="border-t border-border">
                  <td className="py-2 text-muted-foreground pr-4">{row.label}</td>
                  <td className="py-2 text-right font-medium text-foreground">{row.value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Recent Health Updates */}
        <div className="analysis-card p-5 flex flex-col">
          <h3 className="text-sm font-semibold text-foreground mb-3">Atualizações recentes de saúde financeira</h3>
          <div className="flex-1">
            <ul className="space-y-0">
              {(data.healthUpdates ?? []).slice(0, 5).map((item) => {
                const iconColor = item.sentiment === 'good' ? 'text-teal-500' : item.sentiment === 'bad' ? 'text-rose-500' : 'text-muted-foreground';
                const bgColor = item.sentiment === 'good' ? 'bg-success-surface' : item.sentiment === 'bad' ? 'bg-danger-surface' : 'bg-muted';
                return (
                  <li key={item.id} className="flex items-start gap-3 py-2.5 border-b border-border/50">
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${bgColor}`}>
                      {item.sentiment === 'good' && (
                        <svg className={`w-5 h-5 ${iconColor}`} viewBox="0 0 24 24" fill="currentColor"><path fillRule="evenodd" clipRule="evenodd" d="M17 3a.5.5 0 000 1h2.207l-4.2 3.817A6.478 6.478 0 0011 6.02V4.5a.5.5 0 00-1 0v1.519A6.501 6.501 0 004.019 12H2.5a.5.5 0 000 1h1.519A6.501 6.501 0 0010 18.981V20.5a.5.5 0 001 0v-1.519A6.501 6.501 0 0016.981 13H18.5a.5.5 0 000-1h-1.519a6.467 6.467 0 00-1.308-3.436L20 4.63V7a.5.5 0 001 0V3h-4z" /></svg>
                      )}
                      {item.sentiment === 'bad' && (
                        <svg className={`w-5 h-5 ${iconColor}`} viewBox="0 0 24 24" fill="currentColor"><path fillRule="evenodd" clipRule="evenodd" d="M10 3.5a.5.5 0 011 0v1.519A6.501 6.501 0 0116.981 11H18.5a.5.5 0 010 1h-1.519a6.468 6.468 0 01-1.308 3.436L20 19.37V17a.5.5 0 011 0v4h-4a.5.5 0 010-1h2.207l-4.2-3.817A6.478 6.478 0 0111 17.98V19.5a.5.5 0 01-1 0v-1.519A6.501 6.501 0 014.019 12H2.5a.5.5 0 010-1h1.519A6.501 6.501 0 0110 5.019V3.5z" /></svg>
                      )}
                      {item.sentiment === 'neutral' && (
                        <svg className={`w-5 h-5 ${iconColor}`} viewBox="0 0 24 24" fill="currentColor"><path fillRule="evenodd" clipRule="evenodd" d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10zm-1-7h2V7h-2v8zm0 4h2v-2h-2v2z" /></svg>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-foreground leading-5 line-clamp-2">{item.title}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{formatDate(item.date)}</p>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
          <button
            onClick={() => setDrawerOpen(true)}
            className="mt-3 w-full rounded-lg bg-brand-surface hover:bg-brand-surface/80 text-brand-text text-xs font-semibold py-2 text-center transition-colors"
          >
            Mostrar todas as atualizações
          </button>
        </div>
      </div>

      {/* ── Drawer lateral de atualizações ── */}
      {drawerOpen && typeof document !== 'undefined' && createPortal(
        <>
          <div
            className="fixed inset-0 bg-black/30 z-40"
            onClick={() => setDrawerOpen(false)}
          />
          <div className="fixed right-0 top-0 h-full w-full max-w-md bg-card shadow-2xl z-50 flex flex-col">
            <div className="flex items-center justify-between px-6 py-5 border-b border-border">
              <h2 className="text-sm font-semibold text-foreground">Atualizações recentes de saúde financeira</h2>
              <button
                onClick={() => setDrawerOpen(false)}
                className="p-1.5 rounded hover:bg-hover transition-colors text-muted-foreground hover:text-foreground"
                aria-label="Fechar"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-6 py-2">
              <ul className="space-y-0">
                {(data.healthUpdates ?? []).map((item) => {
                  const iconColor = item.sentiment === 'good' ? 'text-teal-500' : item.sentiment === 'bad' ? 'text-rose-500' : 'text-muted-foreground';
                  const bgColor = item.sentiment === 'good' ? 'bg-success-surface' : item.sentiment === 'bad' ? 'bg-danger-surface' : 'bg-muted';
                  return (
                    <li key={item.id} className="flex items-start gap-3 py-3 border-b border-border/50 last:border-0">
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${bgColor}`}>
                        {item.sentiment === 'good' && (
                          <svg className={`w-5 h-5 ${iconColor}`} viewBox="0 0 24 24" fill="currentColor"><path fillRule="evenodd" clipRule="evenodd" d="M17 3a.5.5 0 000 1h2.207l-4.2 3.817A6.478 6.478 0 0011 6.02V4.5a.5.5 0 00-1 0v1.519A6.501 6.501 0 004.019 12H2.5a.5.5 0 000 1h1.519A6.501 6.501 0 0010 18.981V20.5a.5.5 0 001 0v-1.519A6.501 6.501 0 0016.981 13H18.5a.5.5 0 000-1h-1.519a6.467 6.467 0 00-1.308-3.436L20 4.63V7a.5.5 0 001 0V3h-4z" /></svg>
                        )}
                        {item.sentiment === 'bad' && (
                          <svg className={`w-5 h-5 ${iconColor}`} viewBox="0 0 24 24" fill="currentColor"><path fillRule="evenodd" clipRule="evenodd" d="M10 3.5a.5.5 0 011 0v1.519A6.501 6.501 0 0116.981 11H18.5a.5.5 0 010 1h-1.519a6.468 6.468 0 01-1.308 3.436L20 19.37V17a.5.5 0 011 0v4h-4a.5.5 0 010-1h2.207l-4.2-3.817A6.478 6.478 0 0111 17.98V19.5a.5.5 0 01-1 0v-1.519A6.501 6.501 0 014.019 12H2.5a.5.5 0 010-1h1.519A6.501 6.501 0 0110 5.019V3.5z" /></svg>
                        )}
                        {item.sentiment === 'neutral' && (
                          <svg className={`w-5 h-5 ${iconColor}`} viewBox="0 0 24 24" fill="currentColor"><path fillRule="evenodd" clipRule="evenodd" d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10zm-1-7h2V7h-2v8zm0 4h2v-2h-2v2z" /></svg>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-foreground leading-5">{item.title}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{formatDate(item.date)}</p>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        </>,
        document.body
      )}

      {/* Análise da Posição Financeira */}
      <FinancialPositionSection data={data} />

      <DebtHistorySection data={data} activeKeys={activeKeys} setActiveKeys={setActiveKeys} />
      <BalanceSheetSection data={data} />

    </div>
  );
}

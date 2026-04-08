'use client';

import React, { useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import type { FutureTabState } from '../hooks/useAnalysisPageState';
import {
  AreaChart as TremorArea,
  BarChart as TremorBar,
  LineChart as TremorLine,
} from '@tremor/react';
import type { AnalysisData } from '../interfaces';
import { COLORS } from '../constants/colors';
import { safeN, safeNbr, formatNumber, formatDate } from '../utils/formatters';
import { SectionCard, CheckList, CriteriaIcon, GrowthBarChart, ChartInfoButton, GAUGE_SEGMENT_PATHS, gaugeSegmentColor, gaugePolar, gaugeSectorPath, GAUGE_AXIS_TICKS } from './AnalysisShared';
import { DimensionCheckCard } from './ScoreDots';

const EARNINGS_CHART_SERIES: { key: string; color: string; hex: string }[] = [
  { key: 'Receita',                                              color: 'blue',   hex: '#3b82f6' },
  { key: 'Ganhos',                                               color: 'teal',   hex: '#14b8a6' },
  { key: 'Fluxo de Caixa Livre',                                 color: 'orange', hex: '#f97316' },
  { key: 'Fluxo de Caixa das Atividades Operacionais (FCO)',     color: 'violet', hex: '#8b5cf6' },
];

function EarningsRevenueGrowthSection({ data, activeKeys, setActiveKeys }: {
  data: AnalysisData;
  activeKeys: Set<string>;
  setActiveKeys: React.Dispatch<React.SetStateAction<Set<string>>>;
}) {
  const g = data.growth ?? {} as typeof data.growth;

  const earningsSeries = g.earningsSeries ?? [];
  const revenueSeries = g.revenueSeries ?? [];
  const freeCashFlowSeries = g.freeCashFlowSeries ?? [];
  const cashFromOpSeries = g.cashFromOpSeries ?? [];

  const chartData = earningsSeries.map((e, i) => ({
    year: e.year,
    'Receita': revenueSeries[i]?.value ?? 0,
    'Ganhos': e.value,
    'Fluxo de Caixa Livre': freeCashFlowSeries[i]?.value ?? 0,
    'Fluxo de Caixa das Atividades Operacionais (FCO)': cashFromOpSeries[i]?.value ?? 0,
  }));

  const activeSeries = EARNINGS_CHART_SERIES.filter(s => activeKeys.has(s.key));

  const toggleKey = (key: string) =>
    setActiveKeys(prev => {
      const next = new Set(prev);
      if (next.has(key)) { if (next.size > 1) next.delete(key); }
      else next.add(key);
      return next;
    });

  const fmtBrl = (v: number) => {
    const a = Math.abs(v);
    const s = v < 0 ? '-' : '';
    if (a >= 1e9) return `${s}R$ ${(a / 1e9).toFixed(2).replace('.', ',')} bi`;
    if (a >= 1e6) return `${s}R$ ${(a / 1e6).toFixed(1).replace('.', ',')} mi`;
    if (a >= 1e3) return `${s}R$ ${(a / 1e3).toFixed(1).replace('.', ',')} mil`;
    return `${s}R$ ${a.toFixed(0)}`;
  };

  function EarningsGrowthTooltip({ active, payload }: CustomTooltipProps) {
    if (!active || !payload?.length) return null;
    const point = payload[0]?.payload as Record<string, unknown> | undefined;
    if (!point) return null;
    const year = point.year as string | undefined;
    return (
      <div className="rounded-lg overflow-hidden shadow-lg text-xs" style={{ backgroundColor: 'hsl(0 0% 13%)' }}>
        <table className="border-collapse">
          <thead>
            <tr>
              <th colSpan={2} className="px-3 py-1.5 text-left font-semibold text-white border-b border-white/10">
                Dez {year}
              </th>
            </tr>
          </thead>
          <tbody>
            {payload.map((entry, idx: number) => (
              <tr key={idx} className={idx > 0 ? 'border-t border-white/10' : ''}>
                <td className="px-3 py-1.5 text-white/80 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: entry.color }} />
                  {String(entry.name ?? '')}
                </td>
                <td className="px-3 py-1.5 font-medium text-white text-right">{fmtBrl(Number(entry.value ?? 0))}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  return (
    <section data-cy-id="report-sub-section-earnings-and-revenue-growth-forecasts" data-section="future">
      <div className="flex flex-row">
        <h3
          data-cy-id="report-sub-section-title-earnings-and-revenue-growth-forecasts"
          className="text-[15px] font-semibold text-foreground tracking-tight mb-4"
        >
          Previsões de crescimento de lucros e receitas
        </h3>
      </div>
      <span
        data-cy-id="earnings-and-revenue-growth-forecasts-description"
        className="inline text-[10px] font-normal text-muted-foreground"
      ></span>
      <div role="feed" aria-hidden="false">
        <div data-cy-id="future-earnings-revenue-growth-chart-wrapper">
          <div className="h-[360px] [&_.recharts-cartesian-axis-tick_text]:text-[10px] [&_.recharts-cartesian-axis-tick_text]:fill-neutral-400 [&_.recharts-area-dots_circle]:[display:none] [&_.stroke-blue-500_circle]:[fill:#3b82f6] [&_.stroke-teal-500_circle]:[fill:#14b8a6] [&_.stroke-orange-500_circle]:[fill:#f97316] [&_.stroke-violet-500_circle]:[fill:#8b5cf6]">
            <TremorArea
              data={chartData}
              index="year"
              categories={activeSeries.map(s => s.key)}
              colors={activeSeries.map(s => s.color)}
              valueFormatter={(v: number) => { const a = Math.abs(v); return a >= 1e9 ? `R$ ${(v/1e9).toFixed(1)}bi` : a >= 1e6 ? `R$ ${(v/1e6).toFixed(1)}mi` : `R$ ${v.toFixed(0)}`; }}
              customTooltip={EarningsGrowthTooltip}
              showLegend={false}
              showGridLines={true}
              yAxisWidth={56}
              curveType="monotone"
            />
          </div>
          <div data-cy-id="timeseries-legend" className="flex gap-2 flex-wrap">
            {EARNINGS_CHART_SERIES.map(s => (
              <button
                key={s.key}
                data-focus="dashed"
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
        </div>
      </div>
    </section>
  );
}

function AnalystFutureGrowthSection({ data }: { data: AnalysisData }) {
  const g = data.growth ?? {} as typeof data.growth;
  const ticker = data.company.ticker;

  const earningsBars = [
    { label: 'Empresa', value: g.earningsGrowthRate,     color: '#3b82f6', textColor: '#FFFFFF' },
    { label: 'Setor',   value: g.industryEarningsGrowth, color: '#bae6fd', textColor: '#262E3A' },
    { label: 'Mercado', value: g.marketEarningsGrowth,   color: '#6366f1', textColor: '#FFFFFF' },
  ];

  const revenueBars = [
    { label: 'Empresa', value: g.revenueGrowthRate,     color: '#3b82f6', textColor: '#FFFFFF' },
    { label: 'Setor',   value: g.industryRevenueGrowth, color: '#bae6fd', textColor: '#262E3A' },
    { label: 'Mercado', value: g.marketRevenueGrowth,   color: '#6366f1', textColor: '#FFFFFF' },
  ];

  const checks: { id: string; passed: boolean; label: string; content: React.ReactNode }[] = [
    {
      id: 'isExpectedProfitGrowthAboveRiskFreeRate',
      passed: g.earningsGrowthRate > g.savingsRate,
      label: 'Lucros vs Taxa de Poupança:',
      content: (
        <>
          <span>O crescimento previsto de lucros de {ticker} ({g.earningsGrowthRate}% ao ano) está {g.earningsGrowthRate > g.savingsRate ? 'acima' : 'abaixo'} da </span>
          <span tabIndex={0} className="underline decoration-dotted cursor-help">taxa de poupança</span>
          <span> ({g.savingsRate}%).</span>
        </>
      ),
    },
    {
      id: 'isExpectedAnnualProfitGrowthAboveMarket',
      passed: g.earningsGrowthRate > g.marketEarningsGrowth,
      label: 'Lucros vs Mercado:',
      content: (
        <span>Os lucros de {ticker} ({g.earningsGrowthRate}% ao ano) têm previsão de crescer {g.earningsGrowthRate > g.marketEarningsGrowth ? 'mais rápido' : 'mais devagar'} que o mercado BR ({g.marketEarningsGrowth}% ao ano).</span>
      ),
    },
    {
      id: 'isExpectedAnnualProfitGrowthHigh',
      passed: g.earningsGrowthRate > 20,
      label: 'Alto Crescimento de Lucros:',
      content: g.earningsGrowthRate > 20
        ? <span>Os lucros de {ticker} têm previsão de crescer significativamente.</span>
        : (
          <>
            <span>Os lucros de {ticker} têm previsão de crescer, mas não </span>
            <span tabIndex={0} className="underline decoration-dotted cursor-help">significativamente</span>
            <span>.</span>
          </>
        ),
    },
    {
      id: 'isExpectedRevenueGrowthAboveMarket',
      passed: g.revenueGrowthRate > g.marketRevenueGrowth,
      label: 'Receita vs Mercado:',
      content: (
        <span>A receita de {ticker} ({g.revenueGrowthRate}% ao ano) tem previsão de crescer {g.revenueGrowthRate > g.marketRevenueGrowth ? 'mais rápido' : 'mais devagar'} que o mercado BR ({g.marketRevenueGrowth}% ao ano).</span>
      ),
    },
    {
      id: 'isExpectedRevenueGrowthHigh',
      passed: g.revenueGrowthRate > 20,
      label: 'Alto Crescimento de Receita:',
      content: g.revenueGrowthRate > 20
        ? <span>A receita de {ticker} tem previsão de crescer significativamente.</span>
        : <span>A receita de {ticker} ({g.revenueGrowthRate}% ao ano) tem previsão de crescer abaixo de 20% ao ano.</span>,
    },
  ];

  return (
    <section data-cy-id="report-sub-section-analyst-future-growth-forecasts" data-section="future">
      <div>
        <div className="flex items-start gap-2 mb-4">
          <h3
            data-cy-id="report-sub-section-title-analyst-future-growth-forecasts"
            className="text-[15px] font-semibold text-foreground tracking-tight"
          >
            Previsões de Crescimento Futuro dos Analistas
          </h3>
          <ChartInfoButton>
            Cada barra mostra a <b>taxa anual esperada</b> para os próximos anos, segundo o consenso dos analistas.
            Compare lucros e receita lado a lado: lucro crescendo mais rápido que receita indica ganho de margem.
          </ChartInfoButton>
        </div>
      </div>
      <span data-cy-id="analyst-future-growth-forecasts-description" />

      <div role="feed" aria-hidden="false">
        <div className="analysis-card p-6">
          {/* Two bar charts side by side */}
          <div data-cy-id="future-analyst-future-growth-chart-wrapper">
            <div className="flex gap-6">
              <GrowthBarChart title="Crescimento Anual Previsto de Lucros" bars={earningsBars} />
              <GrowthBarChart title="Crescimento Anual Previsto de Receita" bars={revenueBars} />
            </div>
          </div>

          {/* Blockquote statements */}
          <div className="mt-4">
            {checks.map(check => (
              <blockquote
                key={check.id}
                data-cy-id={`report-statement-${check.id}`}
                className="flex items-start gap-3 py-2.5 border-t border-border first:border-0"
              >
                <div id={check.id} className="sr-only" />
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
      </div>
    </section>
  );
}

const EPS_SERIES = [
  { key: 'LPA',          color: 'blue' as const, hex: '#3b82f6' },
  { key: 'LPA Estimado', color: 'teal' as const, hex: '#14b8a6' },
];

function EPSGrowthSection({ data, lpaActive, setLpaActive }: {
  data: AnalysisData;
  lpaActive: boolean;
  setLpaActive: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const g   = data.growth ?? {} as typeof data.growth;
  const pts = g.epsCombinedSeries ?? [];

  const [containerWidth, setContainerWidth] = React.useState(0);
  const [mouseX, setMouseX]                = React.useState<number | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Mede a largura real do container
  useEffect(() => {
    const el = wrapperRef.current;
    if (!el) return;
    const obs = new ResizeObserver(entries => setContainerWidth(entries[0].contentRect.width));
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const lastHistYear = [...pts].reverse().find(p => p.type === 'historical')?.year ?? '';

  const chartData = pts.map(pt => ({
    year:           pt.year,
    'LPA':          pt.type === 'historical' ? pt.value : null,
    'LPA Estimado': (pt.type === 'forecast' || pt.year === lastHistYear) ? pt.value : null,
  }));

  const fmtEPS      = (v: number) => `R$${v.toFixed(3)}`;
  const activeSeries = lpaActive ? EPS_SERIES : [];

  // ── Constantes recharts ──────────────────────────────────────────────────
  const Y_AXIS_W     = 56;
  const RIGHT_PAD    = 5;
  const TOTAL_POINTS = chartData.length;
  const TRANS_INDEX  = chartData.findIndex(d => d.year === lastHistYear);
  const chartAreaW   = containerWidth > 0 ? containerWidth - Y_AXIS_W - RIGHT_PAD : 0;
  const slotW        = chartAreaW > 0 ? chartAreaW / TOTAL_POINTS : 0;

  // Posição X fixa do ponto de transição
  const transX = containerWidth > 0
    ? Y_AXIS_W + (TRANS_INDEX + 0.5) * slotW
    : null;

  // Slot ativo para o retângulo de hover
  const activeSlot = mouseX !== null && slotW > 0 && mouseX >= Y_AXIS_W
    ? Math.min(Math.floor((mouseX - Y_AXIS_W) / slotW), TOTAL_POINTS - 1)
    : -1;


  function EPSTooltip({ active, payload }: CustomTooltipProps) {
    if (!active || !payload?.length) return null;
    const point = payload[0]?.payload as { year?: string } | undefined;
    if (!point) return null;
    const pt = pts.find(p => p.year === point.year);
    if (!pt) return null;
    return (
      <div className="rounded-lg overflow-hidden shadow-lg text-xs" style={{ backgroundColor: 'hsl(0 0% 13%)' }}>
        <table className="border-collapse">
          <thead>
            <tr>
              <th colSpan={2} className="px-3 py-1.5 text-left font-semibold text-white border-b border-white/10">
                Dec 30 {point.year}
              </th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="px-3 py-1.5 text-white/80">LPA</td>
              <td className="px-3 py-1.5 font-medium text-white">{fmtEPS(pt.value)}</td>
            </tr>
            {pt.type === 'forecast' && (
              <tr className="border-t border-white/10">
                <td className="px-3 py-1.5 text-white/80">Faixa de LPA</td>
                <td className="px-3 py-1.5 font-medium text-white">
                  <div>{fmtEPS(pt.low)} – {fmtEPS(pt.high)}</div>
                  {pt.forecastSource === 'sgr'
                    ? <div className="text-white/60">Projeção modelo (SGR)</div>
                    : pt.analysts > 0
                      ? <div className="text-white/60">{pt.analysts} {pt.analysts === 1 ? 'Analista' : 'Analistas'}</div>
                      : null
                  }
                  {pt.confirmedDate && <div className="text-white/60">Confirmado em {formatDate(pt.confirmedDate)}</div>}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    );
  }

  return (
    <section data-cy-id="report-sub-section-earnings-per-share-growth-forecasts" data-section="future">
      <div>
        <div className="flex items-start gap-2 mb-4">
          <h3
            data-cy-id="report-sub-section-title-earnings-per-share-growth-forecasts"
            className="text-[15px] font-semibold text-foreground tracking-tight"
          >
            Previsões de Crescimento do Lucro Por Ação (LPA)
          </h3>
          <ChartInfoButton>
            A linha sólida é o <b>LPA realizado</b> e a linha tracejada é a <b>projeção dos analistas</b>.
            O ponto onde as duas se encontram marca o último resultado conhecido — depois dele tudo é estimativa.
          </ChartInfoButton>
        </div>
      </div>
      <span data-cy-id="earnings-per-share-growth-forecasts-description" />

      <div role="feed" aria-hidden="false">
        <div data-cy-id="earnings-per-share-growth-wrapper" className="analysis-card p-6">
          <div
            ref={wrapperRef}
            className="relative"
            onMouseMove={e => {
              const rect = wrapperRef.current?.getBoundingClientRect();
              if (rect) setMouseX(e.clientX - rect.left);
            }}
            onMouseLeave={() => setMouseX(null)}
          >
            {/* Labels fixos no ponto de transição entre as duas linhas */}
            {transX !== null && (
              <div className="absolute top-2 inset-x-0 pointer-events-none z-20">
                <span
                  className="absolute text-[10px] font-medium text-muted-foreground whitespace-nowrap"
                  style={{ right: `calc(100% - ${transX - 8}px)` }}
                >
                  Atual
                </span>
                <span
                  className="absolute text-[10px] font-medium text-muted-foreground whitespace-nowrap"
                  style={{ left: transX + 8 }}
                >
                  Previsão dos Analistas
                </span>
              </div>
            )}

            {/* Wrapper com overflow:clip para conter o retângulo sem cortar o tooltip */}
            <div
              className="h-[360px] [&_.recharts-cartesian-axis-tick_text]:text-[10px] [&_.recharts-cartesian-axis-tick_text]:fill-neutral-400"
              style={{ position: 'relative' }}
            >
              <TremorArea
                data={chartData}
                index="year"
                categories={activeSeries.map(s => s.key)}
                colors={activeSeries.map(s => s.color)}
                valueFormatter={fmtEPS}
                customTooltip={EPSTooltip}
                showLegend={false}
                showGridLines={true}
                yAxisWidth={Y_AXIS_W}
                /* fill="gradient" */
                curveType="monotone"
              />

              {/* Retângulo de hover — confinado à área de dados (exclui eixo X) */}
              {activeSlot >= 0 && slotW > 0 && (
                <div
                  className="pointer-events-none"
                  style={{
                    position: 'absolute',
                    top:    5,    // margem top do recharts
                    height: 320,  // altura da área de dados
                    left:   Y_AXIS_W + activeSlot * slotW,
                    width:  slotW,
                    background: 'linear-gradient(to bottom, rgba(0,0,0,0.03) 0%, rgba(0,0,0,0.06) 50%, rgba(0,0,0,0.03) 100%)',
                    borderLeft:  '1px solid rgba(0,0,0,0.07)',
                    borderRight: '1px solid rgba(0,0,0,0.07)',
                  }}
                />
              )}
            </div>
          </div>

          <div data-cy-id="timeseries-legend" className="flex gap-2 flex-wrap mt-1">
            <button
              data-focus="dashed"
              onClick={() => setLpaActive(v => !v)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all border border-border bg-muted text-muted-foreground hover:bg-hover ${
                lpaActive ? 'opacity-100' : 'opacity-40'
              }`}
            >
              <span className="relative flex items-center w-5 h-2.5 flex-shrink-0">
                <span
                  className="absolute left-0 w-2.5 h-2.5 rounded-full border"
                  style={lpaActive
                    ? { backgroundColor: '#3b82f6', borderColor: '#3b82f6' }
                    : { backgroundColor: 'transparent', borderColor: '#3b82f6' }}
                />
                <span
                  className="absolute left-[7px] w-2.5 h-2.5 rounded-full border"
                  style={lpaActive
                    ? { backgroundColor: '#14b8a6', borderColor: '#14b8a6' }
                    : { backgroundColor: 'transparent', borderColor: '#14b8a6' }}
                />
              </span>
              LPA
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

function FutureROESection({ data }: { data: AnalysisData }) {
  const g            = data.growth ?? {} as typeof data.growth;
  const companyROE   = g.futureROE;          // 26.9
  const industryROE  = g.futureROEIndustry;  // 9.1

  // gauge angle: -90° at 0%, +90° at 40%
  const toAngle = (pct: number) => -90 + (pct / 40) * 180;
  const companyAngle  = toAngle(companyROE);
  const industryAngle = toAngle(industryROE);

  const companySector  = gaugeSectorPath(102, 90, companyAngle);
  const industrySector = gaugeSectorPath(84,  72, industryAngle);

  return (
    <section className="analysis-card overflow-hidden">
      <div className="px-6 pt-5 pb-4">
        <div className="flex items-start gap-2">
          <h3 className="text-[15px] font-semibold text-foreground tracking-tight">
            Retorno Futuro sobre o Patrimônio
          </h3>
          <ChartInfoButton>
            O ponteiro mostra o <b>ROE projetado</b> da empresa contra a média do setor.
            Quanto mais à direita, maior o retorno esperado para cada real investido pelos acionistas.
          </ChartInfoButton>
        </div>
      </div>

      <div className="px-6 pb-6">
        {/* Gauge (left) + statement (right) */}
        <div className="flex flex-row items-stretch gap-6">

          {/* Left: gauge + legend stacked */}
          <div className="flex flex-col items-center flex-shrink-0">

          {/* SVG gauge */}
          <div className="w-[320px]">
            <svg
              width="100%"
              height="240"
              viewBox="0 0 300 158"
              role="document"
              aria-label="ROE Futuro (3 anos)"
              style={{ display: 'block' }}
            >
              {/* Hidden path symbols for pins */}
              <defs>
                <path
                  id="roe-pin-large"
                  d="M2.91895 2.99891C2.96406 1.32971 4.33019 0 6 0C7.66981 0 9.03594 1.32971 9.08105 2.9989L11.8379 105.002C11.9267 108.288 9.28716 111 6 111C2.71284 111 0.0732933 108.288 0.162103 105.002L2.91895 2.99891Z"
                />
                <path
                  id="roe-pin-medium"
                  d="M2.43209 2.49908C2.46989 1.10803 3.60844 0 5 0C6.39156 0 7.53011 1.10803 7.56791 2.49908L9.86418 87.0018C9.93859 89.74 7.73918 92 5 92C2.26082 92 0.0614128 89.74 0.135819 87.0018L2.43209 2.49908Z"
                />
              </defs>

              <g transform="translate(150 150)">

                {/* ── Gauge body: red left half, green right half ── */}
                <path
                  d="M0,-120A120,120,0,0,0,-97.082,70.534L-87.374,63.481A108,108,0,0,1,0,-108Z"
                  fill="hsl(0,77%,58%)"
                  fillOpacity="0.5"
                />
                <path
                  d="M0,-120A120,120,0,0,1,97.082,70.534L87.374,63.481A108,108,0,0,0,0,-108Z"
                  fill="hsl(151,63%,48%)"
                  fillOpacity="0.5"
                />
                {/* 90 gradient colour segments */}
                {GAUGE_SEGMENT_PATHS.map((d, i) => (
                  <path key={i} d={d} fill={gaugeSegmentColor(i)} />
                ))}

                {/* ── Shaded sector: company range (r=102/90) ── */}
                <path d={companySector}  fill="#3b82f6" fillOpacity="0.12" />

                {/* ── Shaded sector: industry range (r=84/72) ── */}
                <path d={industrySector} fill="#14b8a6" fillOpacity="0.12" />

                {/* ── Centre hub ── */}
                <circle cx="0" cy="0" r="12" fill="#d1d5db" fillOpacity="0.35" />

                {/* ── Company (large) pin ── */}
                <g transform={`translate(-6,-104.5) rotate(${companyAngle.toFixed(3)}, 6, 104.5)`}>
                  <use href="#roe-pin-large" fill="#3b82f6" />
                </g>

                {/* ── Industry (medium) pin ── */}
                <g transform={`translate(-5,-86.5) rotate(${industryAngle.toFixed(3)}, 5, 86.5)`}>
                  <use href="#roe-pin-medium" fill="#14b8a6" />
                </g>

                {/* ── Axis ticks & labels ── */}
                {GAUGE_AXIS_TICKS.map(({ label, angleDeg }) => {
                  const lp = gaugePolar(angleDeg, 136);
                  const to = gaugePolar(angleDeg, 120);
                  const ti = gaugePolar(angleDeg, 106);
                  return (
                    <g key={angleDeg}>
                      <text
                        x={lp.x}
                        y={lp.y}
                        textAnchor="middle"
                        dominantBaseline="middle"
                        fontSize="9.5"
                        fill="#9ca3af"
                        fontFamily="Inter, sans-serif"
                      >
                        {label}
                      </text>
                      <line
                        x1={to.x} y1={to.y}
                        x2={ti.x} y2={ti.y}
                        stroke="#d1d5db"
                        strokeWidth="1.5"
                        strokeOpacity="0.8"
                      />
                    </g>
                  );
                })}

              </g>
            </svg>
          </div>

          {/* Legend table — right below the gauge */}
          <div className="-mt-5 w-[160px]">
            <table className="text-xs border-collapse w-full">
              <thead>
                <tr>
                  <th
                    colSpan={2}
                    className="pb-1.5 text-left font-semibold text-muted-foreground text-[11px] whitespace-nowrap"
                  >
                    ROE Futuro (3 anos)
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="pr-6 py-0.5 text-[11px]" style={{ color: '#3b82f6' }}>
                    Empresa
                  </td>
                  <td className="font-semibold text-foreground text-[11px]">
                    {companyROE}%
                  </td>
                </tr>
                <tr>
                  <td className="pr-6 py-0.5 text-[11px]" style={{ color: '#14b8a6' }}>
                    Setor
                  </td>
                  <td className="font-semibold text-foreground text-[11px]">
                    {industryROE}%
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          </div>{/* end left column */}

          {/* Right: statement */}
          <div className="flex-1 flex items-center self-stretch">
          <blockquote className="w-full flex items-start gap-3 rounded-xl border border-border bg-muted/60 px-4 py-4">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              className="flex-shrink-0 mt-0.5"
              fill="hsl(151,63%,48%)"
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12C22 17.5228 17.5228 22 12 22ZM0 12C0 5.37258 5.37258 0 12 0C18.6274 0 24 5.37258 24 12C24 18.6274 18.6274 24 12 24C5.37258 24 0 18.6274 0 12ZM5.70711 13.7071L9.29289 17.2929C9.68342 17.6834 10.3166 17.6834 10.7071 17.2929L18.2929 9.70711C18.6834 9.31658 18.6834 8.68342 18.2929 8.29289L17.7071 7.70711C17.3166 7.31658 16.6834 7.31658 16.2929 7.70711L10 14L7.70711 11.7071C7.31658 11.3166 6.68342 11.3166 6.29289 11.7071L5.70711 12.2929C5.31658 12.6834 5.31658 13.3166 5.70711 13.7071Z"
              />
            </svg>
            <p className="text-sm text-foreground leading-6 break-words">
              <span className="font-semibold text-foreground">ROE Futuro: </span>
              O Retorno sobre o Patrimônio da{' '}
              <span className="font-medium">{data.company.ticker}</span>
              {' '}está previsto para ser alto em 3 anos ({companyROE}%)
            </p>
          </blockquote>
          </div>

        </div>{/* end flex row */}
      </div>
    </section>
  );
}

function FutureReadingCard({ data }: { data: AnalysisData }) {
  const dim = data.snowflake?.find(d => d.dimension === 'future') ?? { checks: [], score: 0, summary: '', displayName: 'Crescimento Futuro', dimension: 'future', max: 6 };
  const g   = data.growth ?? {} as typeof data.growth;
  const eg  = g.earningsGrowthRate ?? 0;
  const meg = g.marketEarningsGrowth ?? 0;

  // ── Thesis strength ──────────────────────────────────────────────────────
  type Strength = 'forte' | 'moderado' | 'pressionado';
  const strength: Strength =
    eg > meg * 1.5 && eg > 15
      ? 'forte'
      : eg > meg
        ? 'moderado'
        : 'pressionado';

  const thesis = {
    forte: {
      headline:  'Crescimento forte projetado, acima do mercado',
      sub:       `Lucros projetados para crescer ${eg}% ao ano, ${(eg - meg).toFixed(1)} pontos acima da média do mercado.`,
      badge:     'Crescimento forte',
      badgeBg:   'var(--brand-surface)',
      badgeColor:'#1D4ED8',
      badgeDot:  '#3B82F6',
      synthesis: `As projeções indicam crescimento acima do mercado. O lucro deve crescer ${eg}% ao ano segundo analistas. Projeções são estimativas e podem ser revisadas.`,
    },
    moderado: {
      headline:  'Crescimento moderado, em linha com o setor',
      sub:       `Lucros projetados para crescer ${eg}% ao ano, próximo da média do mercado de ${meg}%.`,
      badge:     'Crescimento moderado',
      badgeBg:   '#F0FDF4',
      badgeColor:'#0F766E',
      badgeDot:  '#14B8A6',
      synthesis: `O crescimento projetado é positivo, mas próximo da média do mercado. A diferença depende de execução consistente da empresa nos próximos trimestres.`,
    },
    pressionado: {
      headline:  'Crescimento abaixo do mercado nas projeções atuais',
      sub:       `Lucros projetados para crescer ${eg}% ao ano, abaixo da média do mercado de ${meg}%.`,
      badge:     'Pressionado',
      badgeBg:   '#FFF7ED',
      badgeColor:'#C2410C',
      badgeDot:  '#F97316',
      synthesis: `As projeções atuais não mostram crescimento diferenciado. Acompanhe revisões dos analistas antes de tomar decisões com base no crescimento esperado.`,
    },
  }[strength];

  // ── Evidence rows derived from growth data ───────────────────────────────
  type EvidenceRow = { criterion: string; observed: string; reference: string; micro: string };
  type LimitRow    = { criterion: string; observed: string; reference: string; micro: string };

  const rg  = g.revenueGrowthRate ?? 0;
  const mrg = g.marketRevenueGrowth ?? 0;
  const froe = g.futureROE ?? 0;
  const froeI = g.futureROEIndustry ?? 0;
  const epsg = g.epsGrowthRate ?? 0;

  const evidences: EvidenceRow[] = [];
  if (eg > meg) {
    evidences.push({
      criterion: 'Crescimento do lucro acima do mercado',
      observed:  `${eg}% ao ano`,
      reference: `Mercado ${meg}%`,
      micro:     'Projeções apontam para expansão acima da média.',
    });
  }
  if (rg > mrg) {
    evidences.push({
      criterion: 'Crescimento da receita projetada',
      observed:  `${rg}% ao ano`,
      reference: `Mercado ${mrg}%`,
      micro:     'Receita esperada supera crescimento médio do mercado.',
    });
  }
  if (froe > froeI) {
    evidences.push({
      criterion: 'ROE futuro acima do setor',
      observed:  `${froe}%`,
      reference: `Setor ${froeI}%`,
      micro:     'Retorno sobre patrimônio futuro acima da média setorial.',
    });
  }
  if (evidences.length < 2 && epsg > 10) {
    evidences.push({
      criterion: 'Crescimento por ação relevante',
      observed:  `${epsg}% ao ano`,
      reference: 'LPA crescente',
      micro:     'Crescimento do EPS sugere criação real de valor ao acionista.',
    });
  }
  const finalEvidences = evidences.slice(0, 3);

  const limitations: LimitRow[] = [];
  if (eg <= meg) {
    limitations.push({
      criterion: 'Crescimento do lucro abaixo do mercado',
      observed:  `${eg}% ao ano`,
      reference: `Mercado ${meg}%`,
      micro:     'Crescimento abaixo da média limita convicção na tese.',
    });
  }
  if (g.analystCoverage !== 'Good') {
    const coverageLabel = ({ Good: 'Boa', Fair: 'Moderada', Poor: 'Limitada' } as Record<string, string>)[g.analystCoverage] ?? '—';
    limitations.push({
      criterion: `Cobertura de analistas ${g.analystCoverage === 'Fair' ? 'moderada' : 'limitada'}`,
      observed:  coverageLabel,
      reference: 'Ideal: Boa',
      micro:     'Cobertura reduzida diminui confiança nas projeções.',
    });
  }
  if (rg <= mrg) {
    limitations.push({
      criterion: 'Receita não supera o crescimento do mercado',
      observed:  `${rg}% ao ano`,
      reference: `Mercado ${mrg}%`,
      micro:     'Receita projetada não supera a média do mercado.',
    });
  }
  const finalLimitations = limitations.slice(0, 2);

  // suppress unused dim warning — used for future check mapping if needed
  void dim;

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

        {/* ── 2. Evidences + Limitations — equal-weight grid ── */}
        <div className="border-t border-border grid grid-cols-2 divide-x divide-border">

          {/* Left: evidences */}
          <div className="px-7 py-6">
            <div className="text-[10.5px] font-semibold text-muted-foreground uppercase mb-5">
              O que reforça essa conclusão
            </div>
            <div className="space-y-5">
              {finalEvidences.map((e, i) => (
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
              {finalEvidences.length === 0 && (
                <div className="text-[12px] text-muted-foreground italic">Sem evidências de crescimento diferenciado no momento.</div>
              )}
            </div>
          </div>

          {/* Right: limitations */}
          <div className="px-7 py-6">
            <div className="text-[10.5px] font-semibold text-muted-foreground uppercase mb-5">
              O que limita essa leitura
            </div>
            <div className="space-y-5">
              {finalLimitations.map((l, i) => (
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
              {finalLimitations.length === 0 && (
                <div className="text-[12px] text-muted-foreground italic">Nenhum limitador estrutural identificado.</div>
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

export function FutureTab({ data, state }: { data: AnalysisData; state: FutureTabState }) {
  const g = data.growth ?? {} as typeof data.growth;
  const { drawerOpen, setDrawerOpen, earningsActiveKeys, setEarningsActiveKeys, lpaActive, setLpaActive } = state;
  // Null-safe number formatter: returns "—" for null/undefined, else formatted number
  const nf  = (n: number | null | undefined, d = 1) => n == null ? '—' : n.toFixed(d);
  // Null-safe percentage: returns "—" for null, else "X.X%"
  const nfp = (n: number | null | undefined, d = 1) => n == null ? '—' : `${n.toFixed(d)}%`;

  return (
    <div className="space-y-6">

      {/* ── Reading Card — same pattern as ValuationReadingCard ── */}
      <FutureReadingCard data={data} />
      <DimensionCheckCard dimension="future" data={data} />

      {/* ── Informações chave + Atualizações recentes ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

        {/* Informações chave */}
        <div className="analysis-card p-5">
          <h3 className="text-sm font-semibold text-foreground mb-4">Informações chave</h3>
          <div className="flex gap-6 mb-4">
            <div className="flex gap-2 items-start">
              <div className="w-1 rounded-full bg-blue-500 self-stretch mt-0.5" />
              <div>
                <p className="text-lg font-bold text-foreground">{nfp(g.earningsGrowthRate)}</p>
                <p className="text-xs text-muted-foreground">Lucro projetado (% ao ano)</p>
              </div>
            </div>
            <div className="flex gap-2 items-start">
              <div className="w-1 rounded-full bg-blue-500 self-stretch mt-0.5" />
              <div>
                <p className="text-lg font-bold text-foreground">{nfp(g.revenueGrowthRate)}</p>
                <p className="text-xs text-muted-foreground">Receita projetada (% ao ano)</p>
              </div>
            </div>
          </div>
          <table className="w-full text-xs">
            <tbody>
              {[
                { label: 'Média do mercado (lucro)',              value: nfp(g.marketEarningsGrowth) },
                { label: 'Média do mercado (receita)',           value: nfp(g.marketRevenueGrowth) },
                { label: 'Retorno sobre patrimônio esperado',    value: nfp(g.futureROE) },
                { label: 'Retorno do setor (comparação)',        value: nfp(g.futureROEIndustry) },
                { label: 'Lucro por ação projetado (% ao ano)',  value: nfp(g.epsGrowthRate) },
                { label: 'Cobertura de analistas',               value: ({ Good: 'Boa', Fair: 'Moderada', Poor: 'Limitada' } as Record<string, string>)[g.analystCoverage] ?? '—' },
                { label: 'Última atualização',                   value: formatDate(g.lastUpdated) },
              ].map((row) => (
                <tr key={row.label} className="border-t border-border">
                  <td className="py-2 text-muted-foreground pr-4">{row.label}</td>
                  <td className="py-2 text-right font-medium text-foreground">{row.value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Atualizações recentes */}
        <div className="analysis-card p-5 flex flex-col">
          <h3 className="text-sm font-semibold text-foreground mb-3">Atualizações recentes</h3>
          <div className="flex-1">
            <ul className="space-y-0">
              {(data.futureUpdates ?? []).slice(0, 5).map((item) => {
                const iconColor = item.sentiment === 'good' ? 'text-teal-500' : item.sentiment === 'bad' ? 'text-rose-500' : 'text-muted-foreground';
                const bgColor   = item.sentiment === 'good' ? 'bg-success-surface'   : item.sentiment === 'bad' ? 'bg-danger-surface'   : 'bg-muted';
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
              <h2 className="text-sm font-semibold text-foreground">Atualizações de crescimento futuro</h2>
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
                {(data.futureUpdates ?? []).map((item) => {
                  const iconColor = item.sentiment === 'good' ? 'text-teal-500' : item.sentiment === 'bad' ? 'text-rose-500' : 'text-muted-foreground';
                  const bgColor   = item.sentiment === 'good' ? 'bg-success-surface'   : item.sentiment === 'bad' ? 'bg-danger-surface'   : 'bg-muted';
                  return (
                    <li key={item.id} className="flex items-start gap-3 py-3 border-b border-border/50">
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

      {/* ── Chart sections ── */}
      <EarningsRevenueGrowthSection data={data} activeKeys={earningsActiveKeys} setActiveKeys={setEarningsActiveKeys} />

      <AnalystFutureGrowthSection data={data} />
      <EPSGrowthSection data={data} lpaActive={lpaActive} setLpaActive={setLpaActive} />
      <FutureROESection data={data} />

    </div>
  );
}

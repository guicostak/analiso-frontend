'use client';

import React, { useMemo } from 'react';
import type { ValueTabState } from '../hooks/useAnalysisPageState';
import {
  AreaChart as TremorArea,
  BarChart as TremorBar,
  LineChart as TremorLine,
  type CustomTooltipProps,
} from '@tremor/react';
import type {
  AnalysisData, RatioTrend,
} from '../interfaces';
import { COLORS } from '../constants/colors';
import { safeN, safeNbr, formatNumber, fmtBRL } from '../utils/formatters';
import { SectionCard, CheckList, SWSDonut } from './AnalysisShared';
import { DimensionCheckCard } from './ScoreDots';

function PEVsIndustryChart({ data }: { data: AnalysisData }) {
  const myTicker = data.company.ticker;
  const myPE     = data.relativeValuation?.peRatio ?? 0;
  const myGrowth = data.growth?.earningsGrowthRate ?? 0;

  // Use real competitors or synthetic industry/market PE as fallback
  let peerPEs = (data.competitors ?? []).filter(c => c.pe != null).map(c => c.pe as number);
  if (peerPEs.length === 0) {
    const rv = data.relativeValuation ?? {};
    if (rv.peIndustry && rv.peIndustry !== myPE) peerPEs.push(rv.peIndustry);
    if (rv.peMarket && rv.peMarket !== myPE) peerPEs.push(rv.peMarket);
  }
  const allPEs  = [myPE, ...peerPEs].filter(pe => pe > 0);

  const BIN_SIZE = 10;
  const rawMax   = Math.max(...allPEs);
  const numBins  = Math.max(6, Math.min(14, Math.ceil(rawMax / BIN_SIZE) + 1));
  const domainMax = numBins * BIN_SIZE;

  const getBinIdx = (pe: number) => Math.min(Math.floor(pe / BIN_SIZE), numBins - 1);
  const counts = Array.from({ length: numBins }, (_, i) =>
    allPEs.filter(pe => getBinIdx(pe) === i).length
  );
  const maxCount   = Math.max(...counts, 1);
  const myBinIdx   = getBinIdx(myPE);
  const modalBinIdx = counts.indexOf(Math.max(...counts));

  const sortedPeers = [...peerPEs].sort((a, b) => a - b);
  const lerp = (arr: number[], p: number) => {
    if (!arr.length) return myPE;
    const idx = p * (arr.length - 1);
    const lo = Math.floor(idx), hi = Math.ceil(idx);
    return arr[lo] + (arr[hi] - arr[lo]) * (idx - lo);
  };
  const p25 = lerp(sortedPeers, 0.25);
  const p75 = lerp(sortedPeers, 0.75);
  const sectorMedian = lerp(sortedPeers, 0.5);
  const industryAvg  = peerPEs.length
    ? peerPEs.reduce((a, b) => a + b, 0) / peerPEs.length
    : myPE;

  // ── SVG layout ────────────────────────────────────────────────────────────
  // MT: space for VALE3 floating label | MB: x-axis ticks + avg dot+label
  const VW = 560, ML = 8, MR = 8, MT = 36, PH = 104, MB = 30;
  const VH    = MT + PH + MB;
  const PW    = VW - ML - MR;
  const axisY = MT + PH;
  const slotW = PW / numBins;

  const toX    = (pe: number) => ML + (Math.min(pe, domainMax) / domainMax) * PW;
  const slotCX = (i: number)  => ML + (i + 0.5) * slotW;

  const avgX = toX(industryAvg);
  const p25x = toX(p25);
  const p75x = toX(p75);
  const myCX = slotCX(myBinIdx);
  const myBarTop = axisY - (counts[myBinIdx] / maxCount) * PH;

  // Bar widths: slim peers, wider protagonist
  const peerW = slotW * 0.42;
  const mainW = slotW * 0.70;

  // VALE3 floating label (no balloon)
  const LABEL_Y  = 7;
  const labelX   = Math.max(ML + 36, Math.min(VW - MR - 36, myCX));
  const stemTop  = LABEL_Y + 13;
  const stemBot  = myBarTop - 3;

  // Avg label clamped
  const avgLabelX = Math.max(ML + 36, Math.min(VW - MR - 36, avgX));

  // Footer — one punchy sentence
  const above   = myPE > sectorMedian;
  const inModal = myBinIdx === modalBinIdx;
  const modalRange    = `${modalBinIdx * BIN_SIZE}–${(modalBinIdx + 1) * BIN_SIZE}x`;
  const modalBinLabel = `${modalBinIdx * BIN_SIZE}–${(modalBinIdx + 1) * BIN_SIZE}x`;
  const footerText = inModal
    ? `${myTicker} negocia dentro da faixa mais comum do setor (${modalRange}), sem prêmio ou desconto relevante em relação aos pares.`
    : above
      ? `${myTicker} negocia acima da faixa mais comum do setor (${modalRange}), carregando um prêmio que exige crescimento superior para se justificar.`
      : `${myTicker} negocia abaixo da faixa mais comum do setor (${modalRange}), sugerindo desconto relativo — mas o múltiplo sozinho não elimina riscos operacionais.`;

  const headline = above
    ? `${myTicker} negocia a ${myPE.toFixed(1)}x — acima da mediana setorial de ${sectorMedian.toFixed(1)}x`
    : `${myTicker} negocia a ${myPE.toFixed(1)}x — abaixo da mediana setorial de ${sectorMedian.toFixed(1)}x`;

  return (
    <div>
      <div className="mb-4">
        <p className="text-[13px] font-semibold text-foreground leading-snug">{headline}</p>
        <p className="mt-0.5 text-[11.5px] text-muted-foreground">
          {allPEs.length} empresas · setor {data.company.industry}
        </p>
      </div>

      <div className="rounded-2xl border border-border bg-card p-4">
        <svg viewBox={`0 0 ${VW} ${VH}`} className="w-full h-auto" style={{ overflow: 'visible' }}>
          <defs>
            {/* Main bar: 3-stop gradient — deep top, tapers to near-transparent */}
            <linearGradient id="peMainGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%"   stopColor="#3E66E8" stopOpacity="0.72" />
              <stop offset="45%"  stopColor="#355CDE" stopOpacity="0.52" />
              <stop offset="100%" stopColor="#5B7EF4" stopOpacity="0.18" />
            </linearGradient>
            {/* Avg line: subtle amber warmth */}
            <filter id="peAvgGlow" x="-60%" y="-5%" width="220%" height="110%">
              <feDropShadow dx="0" dy="0" stdDeviation="1.5"
                floodColor="#B86A1F" floodOpacity="0.22" />
            </filter>
          </defs>

          {/* ── Layer 1: structural guides (whisper-faint) ───────────────── */}
          {[0.34, 0.67].map(f => (
            <line key={f}
              x1={ML} y1={MT + PH * (1 - f)} x2={VW - MR} y2={MT + PH * (1 - f)}
              stroke="#F3F6FA" strokeWidth="0.6" />
          ))}

          {/* ── L2: IQR zone — elegant context band ─────────────────── */}
          {p75x > p25x && (
            <>
              <rect x={p25x} y={MT} width={p75x - p25x} height={PH}
                fill="rgba(245,158,11,0.09)" rx={2} />
              {/* Delicate side borders */}
              <rect x={p25x}       y={MT} width={1} height={PH} fill="rgba(245,158,11,0.26)" />
              <rect x={p75x - 1}   y={MT} width={1} height={PH} fill="rgba(245,158,11,0.26)" />
            </>
          )}

          {/* ── L3: Peers — marcadores discretos, lollipop sem conexão ──── */}
          {counts.map((count, i) => {
            if (count === 0 || i === myBinIdx) return null;
            const bh = (count / maxCount) * PH;
            const by = axisY - bh;
            const cx = slotCX(i);
            const isModal = i === modalBinIdx;
            return (
              <g key={i}>
                {/* Stick — refined neutral line */}
                <line x1={cx} y1={axisY} x2={cx} y2={by}
                  stroke={isModal ? '#C2CBD8' : '#DCE2EA'}
                  strokeWidth={isModal ? 1.0 : 0.7} />
                {/* Head — refined data dot */}
                <circle cx={cx} cy={by} r={isModal ? 2.2 : 1.5}
                  fill={isModal ? '#9BAAB8' : '#C2CBD8'}
                  opacity={isModal ? 0.82 : 0.58} />
              </g>
            );
          })}

          {/* ── L4: VALE3 — gradient clean, sem skeuomorfismo ────────────── */}
          {(() => {
            const bh = (counts[myBinIdx] / maxCount) * PH;
            const by = axisY - bh;
            const bx = myCX - mainW / 2;
            return (
              <g>
                {/* Gradient column — sem borda, sem glow, sem highlights */}
                <rect x={bx} y={by} width={mainW} height={bh}
                  fill="url(#peMainGrad)" rx={3} />
              </g>
            );
          })()}

          {/* ── Layer 4: axis ───────────────────────────────────────────── */}
          <line x1={ML} y1={axisY} x2={VW - MR} y2={axisY}
            stroke="#E8EDF4" strokeWidth="0.6" />

          {/* X-axis tick labels — whisper faint, every 20 */}
          {Array.from({ length: Math.floor(domainMax / 20) + 1 }, (_, i) => i * 20).map(val => (
            <text key={val} x={toX(val)} y={axisY + 12} textAnchor="middle"
              fontSize="8" fill="#CDD4DC">
              {val}
            </text>
          ))}

          {/* ── Layer 5: annotations (always rendered on top) ───────────── */}

          {/* "FAIXA TÍPICA" — delicate label inside band */}
          {p75x > p25x && p75x - p25x > 48 && (
            <text x={(p25x + p75x) / 2} y={MT + 11} textAnchor="middle"
              fontSize="6.5" fill="#C07620" fillOpacity="0.60"
              fontWeight="600" letterSpacing="1.1">
              FAIXA TÍPICA
            </text>
          )}

          {/* Sector avg line — refined amber reference */}
          <line x1={avgX} y1={MT} x2={avgX} y2={axisY + 4}
            stroke="#B86A1F" strokeWidth="1.2" strokeDasharray="3,3"
            strokeLinecap="round" filter="url(#peAvgGlow)" />
          <circle cx={avgX} cy={axisY + 4} r={2.2} fill="#B86A1F" fillOpacity="0.78" />
          <text x={avgLabelX} y={axisY + 21} textAnchor="middle"
            fontSize="8" fill="#B86A1F" fontWeight="600" fillOpacity="0.80">
            Média {industryAvg.toFixed(1)}x
          </text>

          {/* Company precision dot — outer ring very faint, clean center */}
          <circle cx={toX(myPE)} cy={axisY} r={6.5} fill="#355CDE" fillOpacity="0.05" />
          <circle cx={toX(myPE)} cy={axisY} r={3}   fill="#355CDE" fillOpacity="0.85" />

          {/* Company stem — barely visible anchor */}
          {stemBot > stemTop && (
            <line x1={myCX} y1={stemTop} x2={myCX} y2={stemBot}
              stroke="#355CDE" strokeWidth="0.65" strokeDasharray="2,2"
              strokeOpacity="0.24" strokeLinecap="round" />
          )}

          {/* Company label — confident, clean */}
          <text x={labelX} y={LABEL_Y + 9} textAnchor="middle"
            fontSize="10.5" fill="#2D52C8" fontWeight="700" letterSpacing="0.3">
            {myTicker} · {myPE.toFixed(1)}x
          </text>
        </svg>

        {/* Support stats */}
        <div className="mt-2 grid grid-cols-4 gap-3 border-t border-border pt-3">
          {[
            { label: 'P/L ' + myTicker, value: myPE.toFixed(1) + 'x', accent: true },
            { label: 'Faixa mais comum', value: modalBinLabel },
            { label: 'Média do setor',   value: industryAvg.toFixed(1) + 'x' },
            { label: 'Cresc. lucro',     value: (myGrowth >= 0 ? '+' : '') + myGrowth.toFixed(0) + '%' },
          ].map(s => (
            <div key={s.label} className="flex flex-col gap-1">
              <span className="text-[10px] uppercase tracking-wide text-muted-foreground leading-none">
                {s.label}
              </span>
              <span className={`text-[13px] font-semibold leading-none ${s.accent ? 'text-[#355CDE]' : 'text-foreground'}`}>
                {s.value}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Footer — leitura fechada, não nota de rodapé */}
      <div className="mt-4 rounded-r-xl bg-muted px-4 py-3"
        style={{ borderLeft: '2.5px solid #355CDE' }}>
        <p className="text-[12px] text-muted-foreground leading-relaxed">{footerText}</p>
      </div>
    </div>
  );

}

function KeyValuationMetric({ data, activeTab, setActiveTab }: {
  data: AnalysisData;
  activeTab: 'pe' | 'ps' | 'pb';
  setActiveTab: React.Dispatch<React.SetStateAction<'pe' | 'ps' | 'pb'>>;
}) {
  const rv = data.relativeValuation ?? {} as typeof data.relativeValuation;
  const comp = data.marketCapComposition ?? {} as typeof data.marketCapComposition;

  const tabs = [
    { id: 'pe' as const, label: 'P/L' },
    { id: 'ps' as const, label: 'P/S' },
    { id: 'pb' as const, label: 'P/VP' },
  ];

  const metricConfig = {
    pe: {
      ratio: rv.peRatio ?? 0,
      label: 'Índice P/L',
      desc: `Como a empresa é lucrativa, usamos o Índice Preço/Lucro para análise de valuation relativo.`,
      sliceValue: comp.earnings,
      sliceLabel: 'Lucro',
      sliceColor: '#38bdf8', // sky-400
    },
    ps: {
      ratio: comp.psRatio ?? 0,
      label: 'Índice P/S',
      desc: `Preço da ação em relação à receita gerada — útil para empresas em crescimento.`,
      sliceValue: comp.revenue ?? 0,
      sliceLabel: 'Receita',
      sliceColor: '#a78bfa', // violet-400
    },
    pb: {
      ratio: rv.pbRatio ?? 0,
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
                ? 'bg-foreground text-white'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-5">
        {/* Callout cinza — ocupa o espaço restante à esquerda */}
        <div className="bg-neutral-200/60 rounded-xl p-3 flex-1">
          <p className="text-xs text-muted-foreground leading-relaxed">
            <span className="font-semibold text-foreground">Métrica principal: </span>
            {active.desc}
          </p>
        </div>

        {/* Donut + ratio — juntos à direita */}
        <div className="flex items-center gap-5 flex-shrink-0">
          <div className="flex flex-col items-center gap-2">
            <SWSDonut
              value={active.sliceValue}
              total={comp.marketCap}
              sliceColor={active.sliceColor}
              centerLabel="Cap. de Mercado"
              centerValue={`R$ ${formatNumber(comp.marketCap)}`}
              sliceLabel={active.sliceLabel}
              sliceDisplayValue={`R$ ${formatNumber(active.sliceValue)}`}
              size={180}
            />
          </div>

          <div className="pl-5 border-l border-border">
            <div className="text-[3rem] font-bold leading-none text-foreground">{active.ratio}x</div>
            <div className="text-xs text-muted-foreground mt-1.5">{active.label}</div>
          </div>
        </div>
      </div>

    </div>
  );
}

function HistoricalRatioChartExact({ data, activeRatio, setActiveRatio, activePeriod, setActivePeriod }: {
  data: AnalysisData;
  activeRatio: 'pe' | 'ps' | 'pb';
  setActiveRatio: React.Dispatch<React.SetStateAction<'pe' | 'ps' | 'pb'>>;
  activePeriod: '3M' | '1Y' | '3Y' | '5Y';
  setActivePeriod: React.Dispatch<React.SetStateAction<'3M' | '1Y' | '3Y' | '5Y'>>;
}) {
  // Map tab key → backend metric name; ps has no backend data yet
  const METRIC_MAP: Record<'pe' | 'ps' | 'pb', string | null> = {
    pe: 'P/L',
    ps: null,
    pb: 'P/VP',
  };

  const ticker = data.company.ticker;
  const chartWidth = 640;
  const chartHeight = 252;
  const plotLeft = 28;
  const plotTop = 42;
  const plotWidth = 580;
  const plotHeight = 158;
  const plotBottom = plotTop + plotHeight;

  const ratioLabels: Record<'pe' | 'ps' | 'pb', string> = {
    pe: 'Relação preço/lucro',
    ps: 'Relação preço/vendas',
    pb: 'Preço para reserva',
  };

  const seriesLabel = activeRatio === 'pe' ? ticker.replace(/\d+$/, '') : activeRatio === 'ps' ? 'Receita' : 'Reserva';

  // --- Real data from ratioTrends ---
  const periodMonths = { '3M': 3, '1Y': 12, '3Y': 36, '5Y': 60 };

  const chartData = useMemo(() => {
    const metricName = METRIC_MAP[activeRatio];
    const trendEntry = metricName
      ? data.ratioTrends?.find(t => t.metric === metricName)
      : null;

    if (!trendEntry || trendEntry.series.length < 3) return null;

    const cutoff = periodMonths[activePeriod];
    const sliced = trendEntry.series.slice(-cutoff);

    return sliced.map(pt => {
      // pt.year is "YYYY-MM"
      const [y, m] = pt.year.split('-').map(Number);
      const d = new Date(y, m - 1, 15);
      return {
        date: d,
        year: d.getFullYear(),
        value: pt.company as number,
        industry: pt.industry as number,
      };
    });
  }, [data.ratioTrends, activeRatio, activePeriod]);

  // Guard: no data → null (caller hides the card)
  if (!chartData) return null;

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

  const yearTicks = (() => {
    const years = new Map<number, number>();
    chartData.forEach((point, index) => {
      if (!years.has(point.year)) years.set(point.year, index);
    });
    return Array.from(years.entries()).map(([year, index]) => ({
      year,
      x: plotLeft + (index / Math.max(chartData.length - 1, 1)) * plotWidth,
    }));
  })();

  const tooltipDate = focusPoint.date.toLocaleDateString('pt-BR', {
    month: 'long',
    year: 'numeric',
  });

  // Tabs: only show ratios that have backend data
  const availableRatios = (['pe', 'pb'] as const).filter(key => {
    const metric = METRIC_MAP[key];
    return metric && data.ratioTrends?.find(t => t.metric === metric && t.series.length >= 3);
  });

  return (
    <div>
      <p className="text-sm leading-relaxed text-muted-foreground">
        O índice histórico compara o preço da ação com seus fundamentos ao longo do tempo. Valores mais altos indicam que o mercado está pagando mais caro pelo papel.
      </p>

      <div className="mt-4 rounded-2xl border border-border bg-muted/70 p-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          {/* Ratio selector — only show available tabs */}
          <div className="flex gap-1">
            {availableRatios.map(key => (
              <button
                key={key}
                type="button"
                onClick={() => setActiveRatio(key)}
                className={`rounded-full border px-4 py-1.5 text-sm font-medium transition ${
                  activeRatio === key
                    ? 'border-neutral-900 bg-foreground text-white'
                    : 'border-border bg-card text-muted-foreground hover:bg-muted'
                }`}
              >
                {ratioLabels[key]}
              </button>
            ))}
          </div>

          <div className="inline-flex w-fit items-center rounded-md bg-muted p-1">
            {[['3M', '3M'], ['1Y', '1 ano'], ['3Y', '3 anos'], ['5Y', '5 anos']].map(period => (
              <button
                key={period[0]}
                type="button"
                disabled={activePeriod === period[0]}
                onClick={() => setActivePeriod(period[0] as '3M' | '1Y' | '3Y' | '5Y')}
                className={`rounded-md px-3 py-2 text-sm font-medium transition ${activePeriod === period[0] ? 'bg-foreground text-white' : 'text-muted-foreground hover:bg-card'}`}
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
              <text x="10" y="18" fill="var(--foreground)" fontSize="12" fontWeight="700">{tooltipDate}</text>
              <line x1="10" x2="210" y1="26" y2="26" stroke="#e5e7eb" />
              <text x="10" y="40" fill="var(--foreground)" fontSize="12" fontWeight="700">{seriesLabel}</text>
              <text x="74" y="40" fill="#1f9cf0" fontSize="12" fontWeight="700">
                {focusPoint.value.toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}x
              </text>
            </g>
          </svg>

          <div className="mt-2 flex items-center">
            <span className="inline-flex items-center rounded-md border border-border bg-muted px-3 py-1.5 text-[11px] font-medium text-muted-foreground">
              BOVESPA:{ticker}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * PEVsPeersChart — Premium Dot Plot
 * Companies listed vertically (desc P/E), each mapped to a dot on a shared
 * horizontal P/E axis. VALE3 as protagonist; peers discrete; amber avg line.
 */
function PEVsPeersChart({ data }: { data: AnalysisData }) {
  const myPE   = data.relativeValuation?.peRatio ?? 0;
  const myName = data.company.ticker;
  const myEG   = data.growth?.earningsGrowthRate ?? 0;

  // Build peer rows: real competitors + synthetic industry/market if no competitors
  const realPeers = (data.competitors ?? [])
    .filter(c => c.pe != null)
    .map(c => ({ name: c.ticker, pe: c.pe as number, eg: c.earningsGrowth ?? null, isMain: false }));

  const syntheticPeers: typeof realPeers = [];
  if (realPeers.length === 0) {
    const rv = data.relativeValuation ?? {};
    if (rv.peIndustry && rv.peIndustry !== myPE) syntheticPeers.push({ name: 'Indústria', pe: rv.peIndustry, eg: null, isMain: false });
    if (rv.peMarket && rv.peMarket !== myPE) syntheticPeers.push({ name: 'Mercado', pe: rv.peMarket, eg: null, isMain: false });
  }

  const allRows = [
    { name: myName, pe: myPE, eg: myEG, isMain: true },
    ...realPeers,
    ...syntheticPeers,
  ].sort((a, b) => b.pe - a.pe);

  const peerSorted = allRows.filter(r => !r.isMain).map(r => r.pe).sort((a, b) => a - b);
  const peerAvg    = peerSorted.length ? peerSorted.reduce((s, v) => s + v, 0) / peerSorted.length : myPE;

  const lerp = (arr: number[], t: number) => {
    const i = (arr.length - 1) * t;
    const lo = Math.floor(i), hi = Math.ceil(i);
    return arr[lo] + (i - lo) * ((arr[hi] ?? arr[lo]) - arr[lo]);
  };
  const p25 = lerp(peerSorted, 0.25);
  const p75 = lerp(peerSorted, 0.75);
  const scaleMax = Math.ceil(Math.max(...allRows.map(r => r.pe)) * 1.12 / 5) * 5;

  // ── Layout ────────────────────────────────────────────────────────────────
  const VW      = 520;
  const LBL_W   = 68;
  const PLT_GAP = 14;
  const PLT_X   = LBL_W + PLT_GAP;   // = 82
  const PLT_W   = 290;
  const PLT_END = PLT_X + PLT_W;     // = 372
  const PE_X    = PLT_END + 14;      // P/E value column = 386
  const GRW_X   = VW;
  const ROW_H   = 26;                // breathing room for premium elements
  const TOP     = 16;
  const AXIS_H  = 20;
  const VH      = TOP + allRows.length * ROW_H + AXIS_H;

  const xOf  = (pe: number) => PLT_X + (pe / scaleMax) * PLT_W;
  const rowY = (i: number)  => TOP + i * ROW_H + ROW_H / 2;
  const botY = TOP + allRows.length * ROW_H;

  const avgX = xOf(peerAvg);
  const p25x = xOf(p25);
  const p75x = xOf(p75);
  const bandH = allRows.length * ROW_H + 8;
  const bandY = TOP - 4;

  const step  = scaleMax <= 40 ? 10 : 15;
  const ticks = Array.from({ length: Math.floor(scaleMax / step) + 1 }, (_, k) => k * step);
  if (ticks[ticks.length - 1] < scaleMax) ticks.push(scaleMax);

  const discPct    = Math.round(Math.abs((myPE - peerAvg) / peerAvg) * 100);
  const multiplier = (peerAvg / myPE).toFixed(1);
  const headline   = `${myName} negocia a ${myPE.toFixed(1)}x P/L — bem abaixo da média dos pares (${peerAvg.toFixed(1)}x)`;
  const footer     = `Com múltiplo ${multiplier}× menor que a média dos pares, o rendimento de lucro implícito é substancialmente mais elevado.`;

  return (
    <div>
      {/* Headline */}
      <p className="text-[13px] font-semibold text-foreground leading-snug mb-5">{headline}</p>

      {/* ── SVG dot plot ──────────────────────────────────────────────────── */}
      <svg viewBox={`0 0 ${VW} ${VH}`} width="100%" style={{ overflow: 'visible', display: 'block' }}>
        <defs>
          {/* VALE3 dot glow */}
          <filter id="peMainGlow" x="-100%" y="-100%" width="300%" height="300%">
            <feGaussianBlur stdDeviation="2" result="b" />
            <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          {/* Band gradient: slightly more opaque at centre */}
          <linearGradient id="bandGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor="#CBD5E1" stopOpacity="0.08" />
            <stop offset="50%"  stopColor="#CBD5E1" stopOpacity="0.18" />
            <stop offset="100%" stopColor="#CBD5E1" stopOpacity="0.08" />
          </linearGradient>
        </defs>

        {/* ── P25–P75 band: open-ended premium style ── */}
        <rect x={p25x} y={bandY} width={p75x - p25x} height={bandH} fill="url(#bandGrad)" />
        {/* Top edge line */}
        <line x1={p25x} y1={bandY} x2={p75x} y2={bandY} stroke="#CBD5E1" strokeWidth="0.75" />
        {/* Bottom edge line */}
        <line x1={p25x} y1={bandY + bandH} x2={p75x} y2={bandY + bandH} stroke="#CBD5E1" strokeWidth="0.75" />

        {/* ── Peer average line ── */}
        <line
          x1={avgX} y1={TOP - 8} x2={avgX} y2={botY + 5}
          stroke="#B86A1F" strokeWidth="1.2"
          strokeDasharray="3.5,2.5" strokeLinecap="round"
        />
        {/* Anchor dot at axis */}
        <circle cx={avgX} cy={botY + 5} r={2.5} fill="#B86A1F" />
        {/* Label */}
        <text x={avgX + 5} y={TOP - 9} fontSize="8.5" fontWeight="600" fill="#B86A1F">
          Média {peerAvg.toFixed(1)}x
        </text>

        {/* Growth header */}
        <text x={GRW_X} y={TOP - 9} textAnchor="end" fontSize="8" fontWeight="600" fill="#CBD5E1">
          CRESC.
        </text>

        {/* ── Rows ── */}
        {allRows.map((row, i) => {
          const cy     = rowY(i);
          const cx     = xOf(row.pe);
          const isMain = row.isMain;

          return (
            <g key={row.name}>

              {/* Thin separator (peers only, not at VALE3 boundary) */}
              {i > 0 && !allRows[i - 1].isMain && !isMain && (
                <line
                  x1={PLT_X} y1={TOP + i * ROW_H}
                  x2={PLT_END + 80} y2={TOP + i * ROW_H}
                  stroke="#F1F5F9" strokeWidth="1"
                />
              )}

              {/* VALE3 row: very subtle highlight strip + left accent */}
              {isMain && (
                <>
                  <rect
                    x={4} y={TOP + i * ROW_H + 1}
                    width={VW - 4} height={ROW_H - 2}
                    fill="rgba(53,92,222,0.025)" rx={2}
                  />
                  <rect
                    x={0} y={TOP + i * ROW_H + 6}
                    width={2} height={ROW_H - 12}
                    fill="#355CDE" rx={1}
                  />
                </>
              )}

              {/* Connector */}
              <line
                x1={PLT_X} y1={cy}
                x2={cx - (isMain ? 11 : 5)} y2={cy}
                stroke={isMain ? 'rgba(53,92,222,0.15)' : 'rgba(203,213,225,0.5)'}
                strokeWidth="1"
              />

              {/* Ticker */}
              <text
                x={LBL_W} y={cy}
                textAnchor="end" dominantBaseline="middle"
                fontSize={isMain ? 11 : 9.5}
                fontWeight={isMain ? 700 : 400}
                fill={isMain ? '#1E3A8A' : '#94A3B8'}
              >
                {row.name}
              </text>

              {/* ── Dot ── */}
              {isMain ? (
                <>
                  {/* Outer halo */}
                  <circle cx={cx} cy={cy} r={11} fill="rgba(53,92,222,0.06)" />
                  {/* Stroke ring */}
                  <circle cx={cx} cy={cy} r={7.5} fill="none" stroke="rgba(53,92,222,0.22)" strokeWidth="1.5" />
                  {/* Core */}
                  <circle cx={cx} cy={cy} r={5} fill="#355CDE" filter="url(#peMainGlow)" />
                  {/* Highlight */}
                  <circle cx={cx} cy={cy} r={1.8} fill="rgba(255,255,255,0.80)" />
                </>
              ) : (
                <>
                  {/* Subtle outer halo for depth */}
                  <circle cx={cx} cy={cy} r={5.5} fill="rgba(148,163,184,0.08)" />
                  <circle cx={cx} cy={cy} r={3.5} fill="#F8FAFC" stroke="#94A3B8" strokeWidth="1.2" />
                </>
              )}

              {/* P/E value */}
              <text
                x={PE_X} y={cy}
                dominantBaseline="middle"
                fontSize={isMain ? 12 : 10} fontWeight={isMain ? 700 : 400}
                fill={isMain ? '#1E3A8A' : '#94A3B8'}
              >
                {safeN(row.pe)}x
              </text>

              {/* Growth (secondary) */}
              <text
                x={GRW_X} y={cy}
                textAnchor="end" dominantBaseline="middle"
                fontSize={isMain ? 9.5 : 9}
                fontWeight={isMain ? 500 : 400}
                fill={isMain ? 'rgba(53,92,222,0.8)' : '#CBD5E1'}
              >
                {row.eg != null ? (row.eg > 0 ? '+' : '') + row.eg.toFixed(1) + '%' : '—'}
              </text>
            </g>
          );
        })}

        {/* ── X axis ── */}
        <line x1={PLT_X} y1={botY + 1} x2={PLT_END} y2={botY + 1} stroke="#E9EEF4" strokeWidth="1" />
        {ticks.map((tick, i) => {
          const tx = xOf(tick);
          if (tx < PLT_X - 1 || tx > PLT_END + 1) return null;
          return (
            <g key={tick}>
              <line x1={tx} y1={botY + 1} x2={tx} y2={botY + 4} stroke="#E9EEF4" strokeWidth="1" />
              <text
                x={tx} y={botY + AXIS_H - 3}
                textAnchor={i === 0 ? 'start' : i === ticks.length - 1 ? 'end' : 'middle'}
                fontSize="9" fill="#CBD5E1"
              >
                {i === 0 ? 'P/L' : `${tick}x`}
              </text>
            </g>
          );
        })}
      </svg>

      {/* ── Legend ───────────────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-5 mt-3 text-[10px] text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <svg width="12" height="12" viewBox="0 0 12 12">
            <circle cx="6" cy="6" r="5.5" fill="#355CDE" />
            <circle cx="6" cy="6" r="2.5" fill="white" />
          </svg>
          <span>{myName}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <svg width="12" height="12" viewBox="0 0 12 12">
            <circle cx="6" cy="6" r="4.5" fill="white" stroke="#94A3B8" strokeWidth="1.5" />
          </svg>
          <span>Par do setor</span>
        </div>
        <div className="flex items-center gap-1.5">
          <svg width="18" height="8" viewBox="0 0 18 8">
            <line x1="0" y1="4" x2="18" y2="4" stroke="#B86A1F" strokeWidth="1.5" strokeDasharray="5,3" strokeLinecap="round" />
          </svg>
          <span>Média dos pares</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-sm" style={{ background: 'rgba(203,213,225,0.25)', border: '1px solid #CBD5E1' }} />
          <span>Faixa P25–P75</span>
        </div>
      </div>

      {/* ── Footer ───────────────────────────────────────────────────────── */}
      <div className="mt-4 pt-3 border-t border-border pl-3" style={{ borderLeftWidth: 2, borderLeftColor: '#355CDE', borderLeftStyle: 'solid', paddingLeft: 10 }}>
        <p className="text-[11.5px] text-muted-foreground leading-relaxed">{footer}</p>
      </div>
    </div>
  );
}

function FairPEGauge({ data }: { data: AnalysisData }) {
  const currentPE = Math.round((data.relativeValuation.peRatio ?? 0) * 10) / 10;
  const rawFair   = currentPE * ((data.valuation.fairValue ?? 0) / (data.valuation.currentPrice || 1));
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
        <p className="text-sm text-muted-foreground leading-relaxed">
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

function ValuationScenariosChart({ data }: { data: AnalysisData }) {
  const cp  = data.valuation?.currentPrice ?? 0;
  const scn = [...(data.priceScenarios ?? [])].sort((a, b) => a.estimatedValue - b.estimatedValue);

  if (scn.length < 3) {
    return (
      <div className="flex items-center justify-center h-32 text-sm text-muted-foreground">
        Cenários de preço não disponíveis para esta empresa.
      </div>
    );
  }

  const fmt    = (n: number | null | undefined, dec = 2) =>
    n == null ? '—' : n.toFixed(dec).replace('.', ',');
  const fmtPct = (n: number | null | undefined) =>
    n == null ? '—' : `${n > 0 ? '+' : ''}${n.toFixed(1).replace('.', ',')}%`;

  // ── Scale ──
  const allVals  = [...scn.map(s => s.estimatedValue), cp].filter(v => v > 0);
  const rawMin   = Math.min(...allVals);
  const rawMax   = Math.max(...allVals);
  const span     = rawMax - rawMin;
  const scaleMin = rawMin - span * 0.30;
  const scaleMax = rawMax + span * 0.10;
  const toP      = (v: number) => Math.max(1, Math.min(99, (v - scaleMin) / (scaleMax - scaleMin) * 100));

  const cpPct = toP(cp);
  const pcts  = scn.map(s => toP(s.estimatedValue));

  // ── Interpretive sentence — ① dry, one line ──
  const closingSentence =
    cp < scn[0].estimatedValue
      ? 'Preço abaixo até do cenário conservador — toda a faixa estimada aponta upside.'
      : cp < scn[1].estimatedValue
      ? 'Preço abaixo do cenário base, com upside relevante mesmo na hipótese moderada.'
      : cp < scn[2].estimatedValue
      ? 'Preço dentro da faixa estimada, acima do cenário base.'
      : 'Preço acima de toda a faixa estimada.';

  // ── SVG ruler ──
  const VW = 800, VH = 76;
  const PL = 20, PR = 20;
  const rX1 = PL, rX2 = VW - PR, rW = rX2 - rX1;
  const rY  = 46, rH = 6, rR = 3;
  const xOf = (p: number) => rX1 + p / 100 * rW;

  const cpX = xOf(cpPct);
  const sXs = pcts.map(xOf);

  return (
    <div className="space-y-6">

      {/* ── Closing sentence ── */}
      <div className="flex items-start gap-2.5">
        <div className="w-[3px] h-5 rounded-full bg-[#355CDE] shrink-0 mt-0.5" />
        <p className="text-[13.5px] font-semibold text-foreground leading-snug">{closingSentence}</p>
      </div>

      {/* ── SVG Ruler ── */}
      <svg width="100%" viewBox={`0 0 ${VW} ${VH}`} style={{ display: 'block', overflow: 'visible' }}>
        <defs>
          {/* Subtle range zone fill between conservador and otimista */}
          <linearGradient id="svRangeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%"    stopColor="#CBD5E1" stopOpacity={0.5} />
            <stop offset="45%"   stopColor="#A5B4FC" stopOpacity={0.55} />
            <stop offset="100%"  stopColor="#6EE7B7" stopOpacity={0.5} />
          </linearGradient>
        </defs>

        {/* ── Current price: compact label, tight to ruler ── ③ */}
        <text x={cpX} y={12} textAnchor="middle" fontSize={11.5} fill="#355CDE" fontWeight="700">
          R$ {fmt(cp)}
        </text>
        <text x={cpX} y={23} textAnchor="middle" fontSize={9} fill="#94A3B8">
          Preço atual
        </text>
        <line x1={cpX} y1={25} x2={cpX} y2={rY - 1}
          stroke="#355CDE" strokeWidth={1.5} strokeDasharray="2,2" />

        {/* ── Ruler: neutral base track ── */}
        <rect x={rX1} y={rY} width={rW} height={rH} rx={rR} fill="#E2E8F0" />

        {/* Range zone from conservador to otimista */}
        <rect
          x={sXs[0]} y={rY}
          width={sXs[2] - sXs[0]} height={rH}
          rx={0}
          fill="url(#svRangeGrad)"
          style={{ mixBlendMode: 'multiply' } as React.CSSProperties}
        />

        {/* ── Scenario stems (below ruler) ── */}
        <line x1={sXs[0]} y1={rY + rH} x2={sXs[0]} y2={rY + rH + 18} stroke="#CBD5E1" strokeWidth={1} />
        <line x1={sXs[1]} y1={rY + rH} x2={sXs[1]} y2={rY + rH + 18} stroke="#93C5FD" strokeWidth={1.5} />
        <line x1={sXs[2]} y1={rY + rH} x2={sXs[2]} y2={rY + rH + 18} stroke="#6EE7B7" strokeWidth={1} />

        {/* ── Scenario markers ── */}
        {/* ② Conservador — slightly more presence: r=6, darker stroke */}
        <circle cx={sXs[0]} cy={rY + rH / 2} r={6}
          fill="white" stroke="#64748B" strokeWidth={2} />
        {/* Base — larger, inner filled, protagonist */}
        <circle cx={sXs[1]} cy={rY + rH / 2} r={7}
          fill="white" stroke="#355CDE" strokeWidth={2} />
        <circle cx={sXs[1]} cy={rY + rH / 2} r={3} fill="#355CDE" />
        {/* Otimista — small, secondary */}
        <circle cx={sXs[2]} cy={rY + rH / 2} r={5}
          fill="white" stroke="#16A34A" strokeWidth={1.5} />

        {/* ── Current price: thin vertical cut + smaller dot ── */}
        <line x1={cpX} y1={rY - 1} x2={cpX} y2={rY + rH + 1}
          stroke="white" strokeWidth={2.5} />
        <circle cx={cpX} cy={rY + rH / 2} r={7}
          fill="#355CDE" stroke="white" strokeWidth={2.5} />
      </svg>

      {/* ── Scenario columns — no boxes, editorial layout ── */}
      <div className="grid grid-cols-3 pt-1">

        {/* Conservador — ② slightly more present */}
        <div className="pr-6 border-r border-border">
          <div className="flex items-center gap-1.5 mb-2">
            <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground" />
            <span className="text-[10.5px] font-semibold text-muted-foreground">Conservador</span>
          </div>
          <div className="text-[19px] font-bold tabular-nums text-foreground">
            R$ {fmt(scn[0].estimatedValue)}
          </div>
          <div className="text-[11px] text-muted-foreground mt-0.5">
            {fmtPct(scn[0].gapVsCurrent)} vs. atual
          </div>
          {scn[0].wacc && (
            <div className="text-[10.5px] text-muted-foreground mt-2">
              WACC {fmt(scn[0].wacc, 1)}% · g {fmt(scn[0].growthRate ?? 0, 1)}%
            </div>
          )}
          {scn[0].note && (
            <div className="text-[11px] text-muted-foreground mt-1 leading-snug">{scn[0].note}</div>
          )}
        </div>

        {/* Base — protagonist */}
        <div className="px-6 border-r border-border">
          <div className="flex items-center gap-1.5 mb-2">
            <div className="w-2 h-2 rounded-full bg-[#355CDE]" />
            <span className="text-[10.5px] font-semibold text-[#355CDE]">Base</span>
          </div>
          <div className="text-[24px] font-bold tabular-nums text-foreground">
            R$ {fmt(scn[1].estimatedValue)}
          </div>
          <div
            className="inline-flex text-[11px] font-semibold px-2 py-0.5 rounded-full mt-1"
            style={{ backgroundColor: 'var(--brand-surface)', color: 'var(--brand)' }}
          >
            {fmtPct(scn[1].gapVsCurrent)} vs. atual
          </div>
          {scn[1].wacc && (
            <div className="text-[10.5px] text-muted-foreground mt-2">
              WACC {fmt(scn[1].wacc, 1)}% · g {fmt(scn[1].growthRate ?? 0, 1)}%
            </div>
          )}
          {scn[1].note && (
            <div className="text-[11px] text-muted-foreground mt-1 leading-snug">{scn[1].note}</div>
          )}
        </div>

        {/* Otimista — secondary */}
        <div className="pl-6">
          <div className="flex items-center gap-1.5 mb-2">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span className="text-[10.5px] font-medium text-muted-foreground">Otimista</span>
          </div>
          <div className="text-[19px] font-bold tabular-nums text-foreground">
            R$ {fmt(scn[2].estimatedValue)}
          </div>
          <div className="text-[11px] text-muted-foreground mt-0.5">
            {fmtPct(scn[2].gapVsCurrent)} vs. atual
          </div>
          {scn[2].wacc && (
            <div className="text-[10.5px] text-muted-foreground mt-2">
              WACC {fmt(scn[2].wacc, 1)}% · g {fmt(scn[2].growthRate ?? 0, 1)}%
            </div>
          )}
          {scn[2].note && (
            <div className="text-[11px] text-muted-foreground mt-1 leading-snug">{scn[2].note}</div>
          )}
        </div>
      </div>

      {/* ── Footnote ── ⑤ contrast raised */}
      <div className="text-[10.5px] text-muted-foreground border-t border-border pt-3">
        Estimativas baseadas em DCF com variação de WACC e crescimento terminal. Sujeitas a revisão.
      </div>

    </div>
  );
}

function SharePriceVsFairValue({ currentPrice, fairValue }: { currentPrice: number | null; fairValue: number | null }) {
  const cp         = currentPrice ?? 0;
  const fv         = fairValue ?? 0;
  const diffPct    = fv > 0 ? (cp - fv) / fv * 100 : 0;
  const absDiffPct = Math.abs(diffPct);
  const isOver     = diffPct > 10;
  const isUnder    = diffPct < -10;

  // ── Design tokens (semantic, dark-mode safe) ──
  const accent      = isUnder ? 'var(--success-text)' : isOver ? 'var(--danger-text)' : 'var(--muted-foreground)';
  const accentAlpha = isUnder ? 'rgba(15,118,110,0.12)' : isOver ? 'rgba(185,28,28,0.10)' : 'rgba(71,85,105,0.08)';
  const accentBand  = isUnder ? 'rgba(15,118,110,0.18)' : isOver ? 'rgba(185,28,28,0.18)' : 'rgba(71,85,105,0.12)';
  const accentHalo  = isUnder ? 'rgba(20,184,166,0.25)' : isOver ? 'rgba(185,28,28,0.20)' : 'rgba(71,85,105,0.15)';

  const chipBg    = isUnder ? 'var(--success-surface)' : isOver ? 'var(--danger-surface)' : 'var(--muted)';
  const chipColor = isUnder ? 'var(--success-text)' : isOver ? 'var(--danger-text)' : 'var(--muted-foreground)';
  const chipDot   = isUnder ? '#14B8A6' : isOver ? '#EF4444' : 'var(--muted-foreground)';
  // ① More analytical chip label
  const chipLabel = isUnder ? 'Abaixo do valor estimado' : isOver ? 'Acima do valor estimado' : 'Próximo do valor estimado';

  // ① Portuguese decimal format helper (comma, not dot)
  const fmtPct = (n: number) => n.toFixed(1).replace('.', ',');

  // Split headline: bold part vs rest
  const headlineBold   = isUnder || isOver ? `${fmtPct(absDiffPct)}%` : '≈ Par';
  const headlinePrefix = isUnder ? 'Negociando ' : isOver ? 'Negociando ' : '';
  const headlineSuffix = isUnder
    ? ' abaixo do valor estimado'
    : isOver ? ' acima do valor estimado' : ' do valor estimado';

  // ④ Pill text — self-explanatory
  const pillText = isUnder
    ? `Desconto de ${fmtPct(absDiffPct)}%`
    : isOver
    ? `Prêmio de ${fmtPct(absDiffPct)}%`
    : `${fmtPct(Math.abs(diffPct))}% do valor justo`;

  // ── Scale ──
  const lo  = Math.min(cp, fv) * 0.84;
  const hi  = Math.max(cp, fv) * 1.16;
  const rng = hi - lo || 1;
  const pct = (v: number) => Math.max(3, Math.min(97, ((v - lo) / rng) * 100));

  const cpPct    = pct(cp);
  const fvPct    = pct(fv);
  const bandLeft = Math.min(cpPct, fvPct);
  const bandW    = Math.abs(fvPct - cpPct);

  // ── Tick labels: keep them from colliding ──
  const tooClose = Math.abs(cpPct - fvPct) < 18;
  const cpBelow  = cpPct < fvPct; // current price is to the left

  return (
    <div className="w-full">
      <div
        className="rounded-2xl overflow-hidden"
        style={{ background: isUnder ? 'linear-gradient(160deg, var(--success-surface) 0%, var(--card) 55%)' : isOver ? 'linear-gradient(160deg, var(--danger-surface) 0%, var(--card) 55%)' : 'linear-gradient(160deg, var(--muted) 0%, var(--card) 55%)' }}
      >
        {/* ③ Top stripe — removed (was ornamental, not informational) */}

        <div className="p-6 space-y-7">

          {/* ── Headline block ── */}
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="text-[11px] font-medium text-muted-foreground mb-2 uppercase">
                Posicionamento de preço
              </div>
              {/* Full-sentence headline with % bold */}
              <div className="text-[22px] font-bold leading-snug text-foreground">
                {headlinePrefix}
                <span style={{ color: accent }}>{headlineBold}</span>
                {headlineSuffix}
              </div>
            </div>
            {/* Status chip */}
            <div
              className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-semibold mt-1"
              style={{ backgroundColor: chipBg, color: chipColor }}
            >
              <span className="relative flex w-1.5 h-1.5">
                {isUnder && (
                  <span
                    className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"
                    style={{ backgroundColor: chipDot }}
                  />
                )}
                <span
                  className="relative inline-flex rounded-full w-1.5 h-1.5"
                  style={{ backgroundColor: chipDot }}
                />
              </span>
              {chipLabel}
            </div>
          </div>

          {/* ── Ruler section ── */}
          <div className="space-y-1.5">
            {/* Track */}
            <div className="relative h-[10px] rounded-full" style={{ backgroundColor: 'var(--border)' }}>

              {/* Gap band — filled distance between price and fair value */}
              <div
                className="absolute top-0 h-full rounded-full"
                style={{
                  left: `${bandLeft}%`,
                  width: `${bandW}%`,
                  backgroundColor: accentBand,
                  borderLeft:  cpPct < fvPct ? `2px solid ${accentAlpha}` : 'none',
                  borderRight: cpPct > fvPct ? `2px solid ${accentAlpha}` : 'none',
                }}
              />

              {/* Fair value marker — white disc with slate ring + diamond tick */}
              <div
                className="absolute top-1/2 -translate-y-1/2 z-10"
                style={{ left: `calc(${fvPct}% - 7px)` }}
              >
                <div
                  className="w-[14px] h-[14px] rounded-full bg-card"
                  style={{ border: '2.5px solid var(--muted-foreground)', boxShadow: '0 1px 4px rgba(0,0,0,0.12)' }}
                />
              </div>

              {/* ⑤ Current price marker — refined glow, tighter halo */}
              <div
                className="absolute top-1/2 -translate-y-1/2 z-20"
                style={{ left: `calc(${cpPct}% - 10px)` }}
              >
                <div
                  className="w-[20px] h-[20px] rounded-full"
                  style={{
                    backgroundColor: accent,
                    border: '2.5px solid white',
                    boxShadow: `0 0 0 4px ${accentHalo}, 0 1px 6px rgba(0,0,0,0.22)`,
                  }}
                />
              </div>
            </div>

            {/* ── Tick labels below ruler ── */}
            <div className="relative h-12">
              {/* Fair value label */}
              <div
                className="absolute top-0 flex flex-col items-center"
                style={{
                  left: `${fvPct}%`,
                  transform: tooClose && !cpBelow ? 'translateX(-100%)' : 'translateX(-50%)',
                }}
              >
                <div className="w-px h-2 bg-muted-foreground" />
                <div className="text-[10px] text-muted-foreground whitespace-nowrap mt-0.5">Valor estimado</div>
                <div className="text-[12px] font-semibold text-muted-foreground tabular-nums">
                  R$ {(fairValue ?? 0).toFixed(2)}
                </div>
              </div>

              {/* Current price label */}
              <div
                className="absolute top-0 flex flex-col items-center"
                style={{
                  left: `${cpPct}%`,
                  transform: tooClose && cpBelow ? 'translateX(0%)' : 'translateX(-50%)',
                }}
              >
                <div className="w-px h-2" style={{ backgroundColor: accent }} />
                <div className="text-[10px] font-semibold whitespace-nowrap mt-0.5" style={{ color: accent }}>
                  Preço atual
                </div>
                <div className="text-[12px] font-bold tabular-nums" style={{ color: accent }}>
                  R$ {(currentPrice ?? 0).toFixed(2)}
                </div>
              </div>
            </div>
          </div>

          {/* ── Compact value row ── */}
          <div
            className="flex items-center justify-between rounded-xl px-4 py-3"
            style={{ backgroundColor: 'var(--muted)', border: '1px solid var(--border)' }}
          >
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: accent }} />
              <span className="text-[12px] text-muted-foreground">Preço atual</span>
              <span className="text-[13px] font-semibold text-foreground tabular-nums">
                R$ {(currentPrice ?? 0).toFixed(2)}
              </span>
            </div>
            {/* ④ Self-explanatory pill */}
            <div
              className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full"
              style={{ backgroundColor: chipBg, color: chipColor }}
            >
              {pillText}
            </div>
            <div className="flex items-center gap-3">
              <span className="text-[12px] text-muted-foreground">Valor estimado</span>
              <span className="text-[13px] font-semibold text-foreground tabular-nums">
                R$ {(fairValue ?? 0).toFixed(2)}
              </span>
              <div className="w-2 h-2 rounded-full bg-muted-foreground" />
            </div>
          </div>

          {/* ── Footnote ── */}
          <div className="text-[10.5px] text-muted-foreground leading-relaxed">
            Estimativa baseada em fluxo de caixa descontado. Sujeita a revisão conforme novas projeções.
          </div>
        </div>
      </div>
    </div>
  );
}

function ValuationReadingCard({ data }: { data: AnalysisData }) {
  const dim   = data.snowflake?.find(d => d.dimension === 'value') ?? { checks: [], score: 0, summary: '', displayName: 'Valuation', dimension: 'value', max: 6 };
  const v     = data.valuation ?? {} as typeof data.valuation;
  const rv    = data.relativeValuation ?? {} as typeof data.relativeValuation;
  const disc  = v.discountPercent ?? 0;

  const fmt   = (n: number | null | undefined, dec = 1) =>
    n == null ? '—' : n.toFixed(dec).replace('.', ',');

  // ── Thesis strength from discount + score ──
  type Strength = 'strong' | 'moderate' | 'limited' | 'premium';
  const strength: Strength =
    disc >= 35                   ? 'strong'   :
    disc >= 15 && dim.score >= 3 ? 'moderate' :
    disc >= 0                    ? 'limited'  : 'premium';

  const thesis = {
    strong: {
      headline:  'O preço está bem abaixo do valor estimado',
      sub:       `A ação negocia ${fmt(disc)}% abaixo do valor estimado. O preço parece atrativo em múltiplas comparações.`,
      badge:     'Atrativo',
      badgeBg:   'var(--brand-surface)',
      badgeColor:'#1D4ED8',
      badgeDot:  '#3B82F6',
      synthesis: `A ação negocia com desconto em múltiplas referências: valor calculado por fluxo de caixa, múltiplo de lucro e múltiplo de patrimônio. Existe margem de segurança relevante, mas ela não é garantia de retorno.`,
    },
    moderate: {
      headline:  'O preço parece atrativo, mas sem desconto extremo',
      sub:       `A ação negocia ${fmt(disc)}% abaixo do valor estimado, com indicadores abaixo da média do mercado e do setor.`,
      badge:     'Com desconto',
      badgeBg:   'var(--success-surface)',
      badgeColor:'var(--success-text)',
      badgeDot:  '#14B8A6',
      synthesis: `Existe desconto em múltiplas comparações, mas sem sinal claro de grande oportunidade. O crescimento e os indicadores de preço merecem acompanhamento.`,
    },
    limited: {
      headline:  'O preço está próximo do valor estimado',
      sub:       'Desconto moderado frente ao valor estimado. Indicadores próximos da média das empresas comparáveis.',
      badge:     'Neutro',
      badgeBg:   'var(--muted)',
      badgeColor:'var(--muted-foreground)',
      badgeDot:  'var(--muted-foreground)',
      synthesis: `O preço não parece excessivo, mas o desconto não é grande o suficiente para uma oportunidade evidente. Acompanhe a evolução dos resultados.`,
    },
    premium: {
      headline:  'O preço está acima do valor estimado',
      sub:       'O preço atual supera o valor calculado. A empresa precisaria crescer muito para justificar o preço pago.',
      badge:     'Com prêmio',
      badgeBg:   'var(--warning-surface)',
      badgeColor:'var(--warning-text)',
      badgeDot:  '#F97316',
      synthesis: `O mercado está pagando um prêmio sobre o valor estimado. Qualquer revisão negativa nas expectativas de crescimento pode pressionar o preço.`,
    },
  }[strength];

  // ── Evidence rows ──
  // v3 + v4 are merged into one grouped item to avoid visual redundancy
  type EvidenceRow = { criterion: string; observed: string; reference: string; micro: string; grouped?: { label: string; val: string; ref: string }[] };
  type LimitRow    = { criterion: string; observed: string; reference: string; micro: string };

  const evidenceMap: Partial<Record<string, EvidenceRow>> = {
    v1: {
      criterion: 'Desconto vs. valor estimado',
      observed:  `${fmt(disc)}% abaixo`,
      reference: v.fairValue != null ? `Estimado R$ ${(v.fairValue ?? 0).toFixed(2)}` : 'Estimado R$ —',
      micro:     'Preço abaixo do valor estimado pelo DCF.',
    },
    // v3 + v4 merged: only v3 triggers; shows both references inline
    v3: {
      criterion: 'Múltiplos abaixo das referências',
      observed:  `P/L ${fmt(rv.peRatio)}x`,
      reference: '',
      micro:     'Abaixo do mercado e da indústria.',
      grouped: [
        { label: 'Mercado',   val: `${fmt(rv.peRatio)}x`, ref: `vs. ${fmt(rv.peMarket)}x` },
        { label: 'Indústria', val: `${fmt(rv.peRatio)}x`, ref: `vs. ${fmt(rv.peIndustry)}x` },
      ],
    },
    v4: null as unknown as EvidenceRow, // absorbed into v3
    v6: {
      criterion: 'P/VP vs. indústria',
      observed:  `${fmt(rv.pbRatio)}x`,
      reference: `Indústria ${fmt(rv.pbIndustry)}x`,
      micro:     'Múltiplo de patrimônio abaixo da média setorial.',
    },
  };

  const limitMap: Partial<Record<string, LimitRow>> = {
    v2: {
      criterion: 'Desconto ainda abaixo do patamar de oportunidade forte',
      observed:  `${fmt(disc)}% observado`,
      reference: 'Necessário ≥ 40%',
      micro:     'Relevante, mas insuficiente para barganha inequívoca.',
    },
    v5: {
      criterion: 'PEG acima do intervalo razoável',
      observed:  `${fmt(rv.pegRatio)}x`,
      reference: 'Ideal 0–1,0x',
      micro:     'Crescimento implícito no múltiplo ainda exige cautela.',
    },
  };

  const evidences = dim.checks
    .filter(c => c.passed && c.id !== 'v4') // v4 merged into v3
    .slice(0, 3)
    .map(c => evidenceMap[c.id])
    .filter((e): e is EvidenceRow => Boolean(e));

  const limitations = dim.checks
    .filter(c => !c.passed)
    .slice(0, 2)
    .map(c => limitMap[c.id])
    .filter((e): e is LimitRow => Boolean(e));

  return (
    <div className="space-y-4">

      {/* ── 1. Main reading block ── */}
      <div className="analysis-card overflow-hidden">
        <div className="px-7 pt-7 pb-6 flex items-start justify-between gap-6">
          <div className="flex-1 min-w-0">
            <h2 className="text-[22px] font-bold text-foreground leading-snug mb-2">
              {thesis.headline}
            </h2>
            <p className="text-[14px] text-muted-foreground leading-relaxed max-w-xl">
              {thesis.sub}
            </p>
          </div>
          {/* State badge */}
          <div
            className="shrink-0 flex items-center gap-2 px-3.5 py-2 rounded-full text-[12px] font-semibold mt-1"
            style={{ backgroundColor: thesis.badgeBg, color: thesis.badgeColor }}
          >
            <span className="relative flex w-2 h-2">
              {strength === 'moderate' && (
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

        {/* ── 2 + 3. Evidences + Limitations — equal-weight grid ── */}
        <div className="border-t border-border grid grid-cols-2 divide-x divide-border">

          {/* Left: evidences */}
          <div className="px-7 py-6">
            <div className="text-[10.5px] font-semibold text-muted-foreground uppercase mb-5">
              O que reforça essa conclusão
            </div>
            <div className="space-y-5">
              {evidences.map((e, i) => (
                <div key={i} className="flex gap-3.5">
                  <div className="w-[3px] rounded-full bg-[#355CDE] shrink-0 self-stretch" />
                  <div className="flex-1 min-w-0">
                    {/* Grouped reference (P/L vs mercado + indústria) */}
                    {e.grouped ? (
                      <>
                        <div className="text-[12px] font-semibold text-foreground mb-1.5">{e.criterion}</div>
                        <div className="flex gap-4">
                          {e.grouped.map((g, gi) => (
                            <div key={gi} className="flex items-baseline gap-1.5">
                              <span className="text-[11px] text-muted-foreground">{g.label}</span>
                              <span className="text-[13px] font-bold text-foreground tabular-nums">{g.val}</span>
                              <span className="text-[11px] text-muted-foreground tabular-nums">{g.ref}</span>
                            </div>
                          ))}
                        </div>
                        <div className="text-[11px] text-muted-foreground mt-1">{e.micro}</div>
                      </>
                    ) : (
                      <>
                        <div className="flex items-baseline gap-2 flex-wrap">
                          <span className="text-[15px] font-bold text-foreground tabular-nums">{e.observed}</span>
                          {e.reference && <span className="text-[11px] text-muted-foreground">{e.reference}</span>}
                        </div>
                        <div className="text-[12px] font-medium text-muted-foreground mt-0.5">{e.criterion}</div>
                        <div className="text-[11px] text-muted-foreground mt-0.5">{e.micro}</div>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: limitations — same spacing, same typographic weight */}
          <div className="px-7 py-6">
            <div className="text-[10.5px] font-semibold text-muted-foreground uppercase mb-5">
              O que limita essa leitura
            </div>
            <div className="space-y-5">
              {limitations.map((l, i) => (
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
                <div className="text-[12px] text-muted-foreground italic">Nenhuma limitação relevante identificada.</div>
              )}
            </div>
          </div>
        </div>

        {/* ── 4. Synthesis — dense, editorial ── */}
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

// ─── Value Tab ───────────────────────────────────────────────────────────────

export function ValueTab({ data, state }: { data: AnalysisData; state: ValueTabState }) {
  const v  = data.valuation ?? {} as typeof data.valuation;
  const { activeTab, setActiveTab, activeRatio, setActiveRatio, activePeriod, setActivePeriod } = state;

  return (
    <div className="space-y-6">
      <ValuationReadingCard data={data} />
      <DimensionCheckCard dimension="value" data={data} />

      <SectionCard
        title="O preço atual está caro ou barato?"
        subtitle="Comparação entre o preço de mercado e o valor estimado da empresa"
        info={
          <>
            A barra mostra duas marcas: o <b>preço de mercado</b> e o <b>valor justo</b> estimado pelo modelo de fluxo de caixa descontado.
            Quanto mais o preço estiver à esquerda do valor justo, mais descontada a ação tende a estar.
          </>
        }
      >
        <SharePriceVsFairValue currentPrice={v.currentPrice} fairValue={v.fairValue} />
      </SectionCard>

      <SectionCard
        id="val-scenarios"
        title="Quanto a ação poderia valer?"
        subtitle="Três cenários possíveis: otimista, base e conservador. Cada um usa premissas diferentes de crescimento."
        info={
          <>
            Cada barra é um <b>cenário</b> do mesmo modelo, variando premissas de crescimento e margem.
            O <b>base</b> reflete a expectativa central; <b>otimista</b> e <b>conservador</b> mostram a faixa de incerteza.
          </>
        }
      >
        <ValuationScenariosChart data={data} />
      </SectionCard>

      <SectionCard
        id="val-pe"
        title="Qual indicador usar para avaliar o preço?"
        subtitle="P/L, P/Receita e P/Patrimônio: cada um serve para um tipo de empresa. Veja qual faz mais sentido aqui."
        info={
          <>
            Cada aba traz um múltiplo diferente. <b>P/L</b> serve para empresas lucrativas, <b>P/Receita</b> para as que ainda não dão lucro
            e <b>P/VP</b> para bancos e seguradoras. A barra mostra como a empresa se posiciona contra a média.
          </>
        }
      >
        <KeyValuationMetric data={data} activeTab={activeTab} setActiveTab={setActiveTab} />
      </SectionCard>

      <SectionCard
        title="O preço está alto comparado a empresas parecidas?"
        subtitle={`Como o P/L (Preço sobre Lucro) da ${data.company.ticker} se compara com concorrentes diretas`}
        info={
          <>
            Cada ponto é uma concorrente direta. A linha de referência marca a mediana do grupo —
            pontos acima dela indicam ações negociadas a múltiplos mais altos do que os pares.
          </>
        }
      >
        <PEVsPeersChart data={data} />
      </SectionCard>

      {data.ratioTrends && data.ratioTrends.length > 0 && (
        <SectionCard
          title="Como o múltiplo evoluiu ao longo do tempo?"
          subtitle="Evolução histórica mensal do P/L e P/VP com dados reais da B3."
          info={
            <>
              A linha mostra o múltiplo mês a mês. Use para entender se o nível atual está
              <b> acima ou abaixo</b> da própria média histórica da empresa — útil para identificar reprecificações.
            </>
          }
        >
          <HistoricalRatioChartExact data={data} activeRatio={activeRatio} setActiveRatio={setActiveRatio} activePeriod={activePeriod} setActivePeriod={setActivePeriod} />
        </SectionCard>
      )}

      <SectionCard
        title="Como o preço se compara ao setor inteiro?"
        subtitle={`Distribuição do P/L entre todas as empresas do setor ${data.company.industry}. Mostra onde a ${data.company.ticker} se posiciona.`}
        info={
          <>
            O histograma agrupa todas as empresas do setor por faixa de P/L. A barra destacada é onde
            a {data.company.ticker} se encaixa — barras à esquerda são mais baratas, à direita mais caras.
          </>
        }
      >
        <PEVsIndustryChart data={data} />
      </SectionCard>

      <SectionCard
        title="O P/L atual é justo para essa empresa?"
        subtitle={`Compara o P/L real da ${data.company.ticker} com o P/L esperado, considerando o crescimento projetado e o risco do negócio.`}
        info={
          <>
            O ponteiro indica o P/L atual; a faixa colorida mostra o intervalo "justo" calculado a partir
            do crescimento esperado e do risco. Ponteiro <b>à esquerda</b> da faixa = barato; <b>à direita</b> = caro.
          </>
        }
      >
        <FairPEGauge data={data} />
      </SectionCard>
    </div>
  );
}

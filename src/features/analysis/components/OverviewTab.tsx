'use client';

import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { ArrowLeft, Calendar, ArrowUpRight, ArrowDownRight, Minus, ChevronRight, MoreHorizontal } from 'lucide-react';
import {
  AreaChart as TremorArea,
  BarChart as TremorBar,
  LineChart as TremorLine,
  DonutChart,
  type CustomTooltipProps,
} from '@tremor/react';
import type {
  AnalysisData, AnalysisTab, MetricDistribution, TimelineEvent,
  DCFSensitivityCell, RatioTrend, MarginSeries, ReturnComparison, DividendVsEarnings,
  RewardRisk, Competitor, AnalystTarget, EarningsRevenueSeries, CommunityFairValue,
} from '../interfaces';
import { COLORS, DIMENSION_COLORS, TABS, SECTION_IDS } from '../constants/colors';
import { safeN, safeNbr, formatNumber, fmtBRL, timeAgo, formatDate } from '../utils/formatters';
import { FavoriteButton, SectionCard, SWSDonut } from './AnalysisShared';
import { LuizAvatar } from '@/src/features/luiz/components';



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
    differential: `Destaque em ; pede cuidado em .`,
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
  const myTicker = data.company.ticker;
  const myPE     = data.relativeValuation.peRatio ?? 0;
  const myGrowth = data.growth.earningsGrowthRate ?? 0;

  // Use real competitors or synthetic industry/market PE as fallback
  let peerPEs = data.competitors.filter(c => c.pe != null).map(c => c.pe as number);
  if (peerPEs.length === 0) {
    const rv = data.relativeValuation;
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
        <p className="text-[13px] font-semibold text-neutral-800 leading-snug">{headline}</p>
        <p className="mt-0.5 text-[11.5px] text-neutral-400">
          {allPEs.length} empresas · setor {data.company.industry}
        </p>
      </div>

      <div className="rounded-2xl border border-neutral-100 bg-white p-4">
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
        <div className="mt-2 grid grid-cols-4 gap-3 border-t border-neutral-100 pt-3">
          {[
            { label: 'P/L ' + myTicker, value: myPE.toFixed(1) + 'x', accent: true },
            { label: 'Faixa mais comum', value: modalBinLabel },
            { label: 'Média do setor',   value: industryAvg.toFixed(1) + 'x' },
            { label: 'Cresc. lucro',     value: (myGrowth >= 0 ? '+' : '') + myGrowth.toFixed(0) + '%' },
          ].map(s => (
            <div key={s.label} className="flex flex-col gap-1">
              <span className="text-[10px] uppercase tracking-wide text-neutral-400 leading-none">
                {s.label}
              </span>
              <span className={`text-[13px] font-semibold leading-none ${s.accent ? 'text-[#355CDE]' : 'text-neutral-700'}`}>
                {s.value}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Footer — leitura fechada, não nota de rodapé */}
      <div className="mt-4 rounded-r-xl bg-neutral-50 px-4 py-3"
        style={{ borderLeft: '2.5px solid #355CDE' }}>
        <p className="text-[12px] text-neutral-600 leading-relaxed">{footerText}</p>
      </div>
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
                R$ {safeN(s.value, 2)} ({isUpside ? '+' : ''}{safeN(s.gap)}%)
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
                    {formatDate(event.date)}
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
        <h4 className="text-sm font-semibold text-neutral-700 mb-3 flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 flex-shrink-0" />
          Pontos fortes
        </h4>
        <div className="space-y-3">
          {rewards.map((r, i) => (
            <div key={i} className="flex items-start gap-3">
              <div className="w-[3px] self-stretch rounded-full bg-emerald-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-neutral-800 font-medium">{r.text}</p>
                {r.detail && <p className="text-xs text-neutral-500 mt-0.5">{r.detail}</p>}
              </div>
            </div>
          ))}
        </div>
      </div>
      <div>
        <h4 className="text-sm font-semibold text-neutral-700 mb-3 flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-amber-400 flex-shrink-0" />
          Pontos de atenção
        </h4>
        <div className="space-y-3">
          {risks.map((r, i) => (
            <div key={i} className="flex items-start gap-3">
              <div className="w-[3px] self-stretch rounded-full bg-amber-400 flex-shrink-0 mt-0.5" />
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
        const avg = Object.values(comp.scores).reduce((a, b) => a + b, 0) / 5;
        const status = avg >= 60 ? 'healthy' : avg >= 40 ? 'attention' : 'risk';
        const summary = getCompetitorSummary(comp);

        return (
          <div key={comp.ticker} className="bg-neutral-50 rounded-xl p-4 hover:bg-neutral-100 transition-colors cursor-pointer border border-transparent hover:border-neutral-200">
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
          <p className="text-xs text-neutral-600 leading-relaxed">
            <span className="font-semibold text-neutral-800">Métrica principal: </span>
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

    </div>
  );
}


/**
 * PE VS PEERS — SWS-style horizontal bar chart comparing PE ratio with peers.
 */
function HistoricalRatioChartExact({ data }: { data: AnalysisData }) {
  // Map tab key → backend metric name; ps has no backend data yet
  const METRIC_MAP: Record<'pe' | 'ps' | 'pb', string | null> = {
    pe: 'P/L',
    ps: null,
    pb: 'P/VP',
  };

  // Determine default tab: first one that has real data, fallback to 'pe'
  const defaultRatio = useMemo((): 'pe' | 'ps' | 'pb' => {
    const order: ('pe' | 'ps' | 'pb')[] = ['pe', 'pb'];
    for (const key of order) {
      const metric = METRIC_MAP[key];
      if (metric && data.ratioTrends?.find(t => t.metric === metric && t.series.length >= 3)) return key;
    }
    return 'pe';
  }, [data.ratioTrends]);

  const [activeRatio, setActiveRatio] = useState<'pe' | 'ps' | 'pb'>(defaultRatio);
  const [activePeriod, setActivePeriod] = useState<'3M' | '1Y' | '3Y' | '5Y'>('5Y');

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
      <p className="text-sm leading-relaxed text-neutral-600">
        O índice histórico compara o preço da ação com seus fundamentos ao longo do tempo. Valores mais altos indicam que o mercado está pagando mais caro pelo papel.
      </p>

      <div className="mt-4 rounded-2xl border border-neutral-200 bg-neutral-50/70 p-4">
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
                    ? 'border-neutral-900 bg-neutral-900 text-white'
                    : 'border-neutral-300 bg-white text-neutral-600 hover:bg-neutral-50'
                }`}
              >
                {ratioLabels[key]}
              </button>
            ))}
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
            <span className="inline-flex items-center rounded-md border border-neutral-200 bg-neutral-100 px-3 py-1.5 text-[11px] font-medium text-neutral-600">
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
  const myPE   = data.relativeValuation.peRatio ?? 0;
  const myName = data.company.ticker;
  const myEG   = data.growth.earningsGrowthRate ?? 0;

  // Build peer rows: real competitors + synthetic industry/market if no competitors
  const realPeers = data.competitors
    .filter(c => c.pe != null)
    .map(c => ({ name: c.ticker, pe: c.pe as number, eg: c.earningsGrowth ?? null, isMain: false }));

  const syntheticPeers: typeof realPeers = [];
  if (realPeers.length === 0) {
    const rv = data.relativeValuation;
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
      <p className="text-[13px] font-semibold text-neutral-800 leading-snug mb-5">{headline}</p>

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
      <div className="flex flex-wrap items-center gap-5 mt-3 text-[10px] text-neutral-400">
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
      <div className="mt-4 pt-3 border-t border-neutral-100 pl-3" style={{ borderLeftWidth: 2, borderLeftColor: '#355CDE', borderLeftStyle: 'solid', paddingLeft: 10 }}>
        <p className="text-[11.5px] text-neutral-500 leading-relaxed">{footer}</p>
      </div>
    </div>
  );
}

/**
 * FAIR PE GAUGE — SWS-style semicircular gauge comparing current PE vs fair PE.
 * Uses the same translate(cx, cy) coordinate system as the original SWS SVG.
 */
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
 * VALUATION SCENARIOS — Thin editorial ruler, Base as protagonist, compact scenario cols.
 */
function ValuationScenariosChart({ data }: { data: AnalysisData }) {
  const cp  = data.valuation.currentPrice ?? 0;
  const scn = [...data.priceScenarios].sort((a, b) => a.estimatedValue - b.estimatedValue);

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
        <p className="text-[13.5px] font-semibold text-[#0F172A] leading-snug">{closingSentence}</p>
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
        <div className="pr-6 border-r border-neutral-100">
          <div className="flex items-center gap-1.5 mb-2">
            <div className="w-1.5 h-1.5 rounded-full bg-slate-400" />
            <span className="text-[10.5px] font-semibold text-slate-500">Conservador</span>
          </div>
          <div className="text-[19px] font-bold tabular-nums text-[#0F172A]">
            R$ {fmt(scn[0].estimatedValue)}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">
            {fmtPct(scn[0].gapVsCurrent)} vs. atual
          </div>
          {scn[0].wacc && (
            <div className="text-[10.5px] text-slate-500 mt-2">
              WACC {fmt(scn[0].wacc, 1)}% · g {fmt(scn[0].growthRate ?? 0, 1)}%
            </div>
          )}
          {scn[0].note && (
            <div className="text-[11px] text-slate-600 mt-1 leading-snug">{scn[0].note}</div>
          )}
        </div>

        {/* Base — protagonist */}
        <div className="px-6 border-r border-neutral-100">
          <div className="flex items-center gap-1.5 mb-2">
            <div className="w-2 h-2 rounded-full bg-[#355CDE]" />
            <span className="text-[10.5px] font-semibold text-[#355CDE]">Base</span>
          </div>
          <div className="text-[24px] font-bold tabular-nums text-[#0F172A]">
            R$ {fmt(scn[1].estimatedValue)}
          </div>
          <div
            className="inline-flex text-[11px] font-semibold px-2 py-0.5 rounded-full mt-1"
            style={{ backgroundColor: '#EFF6FF', color: '#355CDE' }}
          >
            {fmtPct(scn[1].gapVsCurrent)} vs. atual
          </div>
          {scn[1].wacc && (
            <div className="text-[10.5px] text-slate-500 mt-2">
              WACC {fmt(scn[1].wacc, 1)}% · g {fmt(scn[1].growthRate ?? 0, 1)}%
            </div>
          )}
          {scn[1].note && (
            <div className="text-[11px] text-slate-600 mt-1 leading-snug">{scn[1].note}</div>
          )}
        </div>

        {/* Otimista — secondary */}
        <div className="pl-6">
          <div className="flex items-center gap-1.5 mb-2">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span className="text-[10.5px] font-medium text-slate-400">Otimista</span>
          </div>
          <div className="text-[19px] font-bold tabular-nums text-[#0F172A]">
            R$ {fmt(scn[2].estimatedValue)}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">
            {fmtPct(scn[2].gapVsCurrent)} vs. atual
          </div>
          {scn[2].wacc && (
            <div className="text-[10.5px] text-slate-500 mt-2">
              WACC {fmt(scn[2].wacc, 1)}% · g {fmt(scn[2].growthRate ?? 0, 1)}%
            </div>
          )}
          {scn[2].note && (
            <div className="text-[11px] text-slate-600 mt-1 leading-snug">{scn[2].note}</div>
          )}
        </div>
      </div>

      {/* ── Footnote ── ⑤ contrast raised */}
      <div className="text-[10.5px] text-slate-400 border-t border-neutral-100 pt-3">
        Estimativas baseadas em DCF com variação de WACC e crescimento terminal. Sujeitas a revisão.
      </div>

    </div>
  );
}

/**
 * DCF WIDGET — Premium clean chart: price history line vs fair value reference.
 * Headline-first, teal price line, dashed slate fair value, subtle zone wash.
 */
function DCFWidget({ data }: { data: AnalysisData }) {
  const v        = data.valuation;
  const fv       = v.fairValue ?? 0;
  const isUnder  = (v.discountPercent ?? 0) > 0;   // positive = stock below fair value
  const fmt      = (n: number | null | undefined, dec = 1) =>
    n == null ? '—' : n.toFixed(dec).replace('.', ',');

  const monthsPt = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
  const fmtDate  = (d: string) => {
    if (d === 'Atual') return 'Atual';
    const [y, m] = d.split('-');
    return `${monthsPt[parseInt(m, 10) - 1]} '${y.slice(2)}`;
  };

  // Series: monthly snapshots → current price as final point
  const currentPrice = v.currentPrice ?? 0;
  const pts = [
    ...data.analystTargets.map(t => ({ label: t.date, price: t.price ?? 0 })),
    { label: 'Atual', price: currentPrice },
  ];

  // Scale with breathing room
  const allV   = pts.map(p => p.price).filter(p => p > 0);
  const rawMin = Math.min(...(allV.length ? allV : [0]), fv || 0);
  const rawMax = Math.max(...allV, fv);
  const vPad   = (rawMax - rawMin) * 0.18;
  const vMin   = rawMin - vPad;
  const vMax   = rawMax + vPad;

  const VW = 720, VH = 164;
  const P  = { top: 22, right: 80, bottom: 30, left: 6 };
  const W  = VW - P.left - P.right;
  const H  = VH - P.top - P.bottom;

  const xS = (i: number) => P.left + (i / (pts.length - 1)) * W;
  const yS = (val: number) => P.top + H * (1 - (val - vMin) / (vMax - vMin));

  const fvY      = yS(fv);
  const fvTopY   = yS(fv * 1.10);
  const fvBotY   = yS(fv * 0.90);
  const lastX    = xS(pts.length - 1);
  const lastY    = yS(currentPrice);
  const firstX   = xS(0);

  const linePath = pts
    .map((p, i) => `${i === 0 ? 'M' : 'L'}${xS(i).toFixed(1)},${yS(p.price).toFixed(1)}`)
    .join(' ');
  const fillPath = `${linePath} L${lastX.toFixed(1)},${(P.top + H).toFixed(1)} L${firstX.toFixed(1)},${(P.top + H).toFixed(1)} Z`;

  const priceColor = isUnder ? '#0F766E' : '#B91C1C';
  const priceHalo  = isUnder ? 'rgba(15,118,110,0.14)' : 'rgba(185,28,28,0.14)';

  // X labels: show up to 4 + always last
  const xLabelIdx = pts.reduce<number[]>((acc, _, i) => {
    const step = Math.max(1, Math.floor(pts.length / 4));
    if (i % step === 0 || i === pts.length - 1) acc.push(i);
    return acc;
  }, []);

  return (
    <div className="space-y-6">

      {/* ── Headline + KPIs ── */}
      <div className="flex items-start justify-between gap-6 flex-wrap">
        <div>
          <div className="text-[11px] font-medium text-neutral-400 mb-1.5">Valor intrínseco via fluxo de caixa descontado</div>
          <div className="text-[20px] font-bold text-[#0F172A] leading-snug">
            Preço negocia{' '}
            <span style={{ color: priceColor }}>
              {fmt(Math.abs(v.discountPercent))}% {isUnder ? 'abaixo' : 'acima'}
            </span>
            {' '}do valor justo estimado
          </div>
        </div>

        {/* KPI trio */}
        <div className="flex items-center gap-0 divide-x divide-neutral-100 shrink-0">
          {[
            { label: 'Preço atual',      value: `R$ ${fmt(v.currentPrice, 2)}`,  color: priceColor },
            { label: 'Valor justo (DCF)', value: `R$ ${fmt(fv, 2)}`,              color: '#0F172A'   },
            { label: 'Desconto',         value: `−${fmt(v.discountPercent)}%`,    color: priceColor },
          ].map((k, i) => (
            <div key={i} className="px-5 first:pl-0 last:pr-0 text-right">
              <div className="text-[10.5px] text-neutral-400 mb-0.5 whitespace-nowrap">{k.label}</div>
              <div className="text-[16px] font-bold tabular-nums whitespace-nowrap" style={{ color: k.color }}>
                {k.value}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Chart ── */}
      <div className="w-full rounded-xl" style={{ backgroundColor: '#FAFBFC' }}>
        <svg
          width="100%"
          viewBox={`0 0 ${VW} ${VH}`}
          style={{ display: 'block', overflow: 'visible' }}
        >
          <defs>
            <clipPath id="dcfClip">
              <rect x={P.left} y={P.top} width={W} height={H} />
            </clipPath>
            <linearGradient id="dcfFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%"   stopColor={priceColor} stopOpacity={0.10} />
              <stop offset="100%" stopColor={priceColor} stopOpacity={0.00} />
            </linearGradient>
          </defs>

          {/* Zone: below fair value — faint green wash */}
          <rect
            x={P.left} y={fvY}
            width={W} height={Math.max(0, P.top + H - fvY)}
            fill="rgba(15,118,110,0.035)"
            clipPath="url(#dcfClip)"
          />

          {/* Near-value band ±10% — barely perceptible */}
          <rect
            x={P.left} y={fvTopY}
            width={W} height={Math.max(0, fvBotY - fvTopY)}
            fill="rgba(100,116,139,0.045)"
            clipPath="url(#dcfClip)"
          />

          {/* Fair value line — dashed slate */}
          <line
            x1={P.left} y1={fvY}
            x2={VW - P.right + 6} y2={fvY}
            stroke="#CBD5E1" strokeWidth={1.5} strokeDasharray="5,4"
          />
          {/* FV label floating right */}
          <text x={VW - P.right + 12} y={fvY - 5} fontSize={9.5} fill="#94A3B8">Valor justo</text>
          <text x={VW - P.right + 12} y={fvY + 8} fontSize={11} fill="#64748B" fontWeight="600">
            R$ {fmt(fv, 2)}
          </text>

          {/* Price area fill — very subtle */}
          <path d={fillPath} fill="url(#dcfFill)" clipPath="url(#dcfClip)" />

          {/* Price line — protagonist */}
          <path
            d={linePath}
            fill="none"
            stroke={priceColor}
            strokeWidth={2.5}
            strokeLinecap="round"
            strokeLinejoin="round"
            clipPath="url(#dcfClip)"
          />

          {/* Current price endpoint */}
          <circle cx={lastX} cy={lastY} r={9}  fill={priceHalo} />
          <circle cx={lastX} cy={lastY} r={4.5} fill={priceColor} stroke="white" strokeWidth={2.5} />
          {/* Floating price label above dot */}
          <text
            x={lastX} y={lastY - 16}
            fontSize={11} fill={priceColor} fontWeight="700"
            textAnchor="middle"
          >
            R$ {fmt(v.currentPrice, 2)}
          </text>

          {/* X-axis baseline */}
          <line
            x1={P.left} y1={P.top + H}
            x2={VW - P.right} y2={P.top + H}
            stroke="#E5E7EB" strokeWidth={1}
          />

          {/* X-axis labels */}
          {xLabelIdx.map(i => (
            <text
              key={i}
              x={xS(i)} y={P.top + H + 18}
              fontSize={10} fill="#94A3B8"
              textAnchor={i === pts.length - 1 ? 'end' : i === 0 ? 'start' : 'middle'}
            >
              {fmtDate(pts[i].label)}
            </text>
          ))}
        </svg>
      </div>

      {/* ── Zone state + legend ── */}
      <div className="flex items-center justify-between flex-wrap gap-3">

        {/* Zone pills — only active one has presence */}
        <div className="flex items-center gap-2">
          {([
            { key: 'under', label: 'Abaixo do valor justo',  active: isUnder,  activeBg: 'bg-teal-50',   activeText: 'text-teal-700',  dot: 'bg-teal-500'  },
            { key: 'near',  label: 'Próximo do valor justo', active: !isUnder && v.discountPercent > -10, activeBg: 'bg-slate-100', activeText: 'text-slate-600', dot: 'bg-slate-400' },
            { key: 'over',  label: 'Acima do valor justo',   active: !isUnder && v.discountPercent <= -10, activeBg: 'bg-red-50', activeText: 'text-red-700', dot: 'bg-red-500' },
          ] as const).map(z => (
            <div
              key={z.key}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium ${
                z.active ? `${z.activeBg} ${z.activeText}` : 'text-neutral-300'
              }`}
            >
              {z.active && <div className={`w-1.5 h-1.5 rounded-full ${z.dot}`} />}
              {z.label}
            </div>
          ))}
        </div>

        {/* Legend + model params */}
        <div className="flex items-center gap-4 text-[10.5px] text-neutral-400">
          <div className="flex items-center gap-1.5">
            <div className="w-5 h-[2.5px] rounded-full" style={{ backgroundColor: priceColor }} />
            <span>Preço histórico</span>
          </div>
          <div className="flex items-center gap-1.5">
            <svg width="18" height="6" style={{ display: 'inline' }}>
              <line x1="0" y1="3" x2="18" y2="3" stroke="#CBD5E1" strokeWidth="1.5" strokeDasharray="4,3" />
            </svg>
            <span>Valor justo (DCF)</span>
          </div>
          <span className="text-neutral-200">·</span>
          <span>WACC {fmt(v.discountRate)}% · crescimento terminal {fmt(v.terminalGrowthRate)}%</span>
        </div>
      </div>

    </div>
  );
}

/**
 * SHARE PRICE vs FAIR VALUE — SWS-style horizontal bar chart.
 * Premium institutional card: full-sentence headline, dominant ruler with gap highlight, compact value tags.
 */
function SharePriceVsFairValue({ currentPrice, fairValue }: { currentPrice: number | null; fairValue: number | null }) {
  const cp         = currentPrice ?? 0;
  const fv         = fairValue ?? 0;
  const diffPct    = fv > 0 ? (cp - fv) / fv * 100 : 0;
  const absDiffPct = Math.abs(diffPct);
  const isOver     = diffPct > 10;
  const isUnder    = diffPct < -10;

  // ── Design tokens ──
  const accent      = isUnder ? '#0F766E' : isOver ? '#B91C1C' : '#475569';
  const accentAlpha = isUnder ? 'rgba(15,118,110,0.12)' : isOver ? 'rgba(185,28,28,0.10)' : 'rgba(71,85,105,0.08)';
  const accentBand  = isUnder ? 'rgba(15,118,110,0.18)' : isOver ? 'rgba(185,28,28,0.18)' : 'rgba(71,85,105,0.12)';
  const accentHalo  = isUnder ? 'rgba(20,184,166,0.25)' : isOver ? 'rgba(185,28,28,0.20)' : 'rgba(71,85,105,0.15)';

  const chipBg    = isUnder ? '#F0FDF4' : isOver ? '#FEF2F2' : '#F1F5F9';
  const chipColor = isUnder ? '#0F766E' : isOver ? '#B91C1C' : '#475569';
  const chipDot   = isUnder ? '#14B8A6' : isOver ? '#B91C1C' : '#94A3B8';
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
        style={{ background: isUnder ? 'linear-gradient(160deg, #F0FDF4 0%, #ffffff 55%)' : isOver ? 'linear-gradient(160deg, #FEF2F2 0%, #ffffff 55%)' : 'linear-gradient(160deg, #F8FAFC 0%, #ffffff 55%)' }}
      >
        {/* ③ Top stripe — removed (was ornamental, not informational) */}

        <div className="p-6 space-y-7">

          {/* ── Headline block ── */}
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="text-[11px] font-medium text-neutral-400 mb-2 uppercase">
                Posicionamento de preço
              </div>
              {/* Full-sentence headline with % bold */}
              <div className="text-[22px] font-bold leading-snug text-[#0F172A]">
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
            <div className="relative h-[10px] rounded-full" style={{ backgroundColor: '#E2E8F0' }}>

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
                  className="w-[14px] h-[14px] rounded-full bg-white"
                  style={{ border: '2.5px solid #94A3B8', boxShadow: '0 1px 4px rgba(0,0,0,0.12)' }}
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
                <div className="w-px h-2 bg-slate-300" />
                <div className="text-[10px] text-slate-400 whitespace-nowrap mt-0.5">Valor estimado</div>
                <div className="text-[12px] font-semibold text-slate-500 tabular-nums">
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
            style={{ backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0' }}
          >
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: accent }} />
              <span className="text-[12px] text-slate-500">Preço atual</span>
              <span className="text-[13px] font-semibold text-[#0F172A] tabular-nums">
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
              <span className="text-[12px] text-slate-500">Valor estimado</span>
              <span className="text-[13px] font-semibold text-[#0F172A] tabular-nums">
                R$ {(fairValue ?? 0).toFixed(2)}
              </span>
              <div className="w-2 h-2 rounded-full bg-slate-300" />
            </div>
          </div>

          {/* ── Footnote ── */}
          <div className="text-[10.5px] text-slate-400 leading-relaxed">
            Estimativa baseada em fluxo de caixa descontado. Sujeita a revisão conforme novas projeções.
          </div>
        </div>
      </div>
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

// ─── Shared helpers ───────────────────────────────────────────────────────────


// ─── Overview Tab ────────────────────────────────────────────────────────────

export function OverviewTab({ data, onSelectTab, companyCardRef, navAlignRef }: { data: AnalysisData; onSelectTab: (tab: AnalysisTab) => void; companyCardRef?: React.RefObject<HTMLDivElement | null>; navAlignRef?: React.RefObject<HTMLDivElement | null> }) {
  const headline = data.company.name + " — análise fundamentalista";
  const [descExpanded, setDescExpanded] = React.useState(false);

  const rewards = data.rewardsAndRisks.filter((r) => r.type === 'reward').slice(0, 3);
  const risks   = data.rewardsAndRisks.filter((r) => r.type === 'risk').slice(0, 3);

  // ─── Starting point ────────────────────────────────────────────────────────
  const startingTab: AnalysisTab = (() => {
    if (data.valuation.discountPercent > 20) return 'value';
    return 'value';
  })();

  const startingMeta: Record<AnalysisTab, { tab: string; reason: string }> = {
    overview:  { tab: 'Resumo',           reason: '' },
    value:     { tab: 'Preço justo',      reason: 'O preço atual pode estar abaixo do que a empresa vale. Comece entendendo essa diferença.' },
    future:    { tab: 'Crescimento Futuro', reason: 'O crescimento esperado é um dos fatores que mais influenciam o preço.' },
    past:      { tab: 'Histórico',        reason: 'O histórico de resultados mostra se a empresa entrega o que promete. Veja os números.' },
    health:    { tab: 'Saúde financeira', reason: 'Antes de tudo, é importante saber se a empresa está em boa situação financeira.' },
    dividend:  { tab: 'Dividendos',       reason: 'Os dividendos são uma parte importante do retorno. Veja se são sustentáveis.' },
  };

  const priceUp = data.priceHistory.return1y >= 0;

  return (
    <div className="space-y-5">

      {/* ── 1. Identidade da empresa ────────────────────────────────────── */}
      <div ref={companyCardRef} className="bg-white rounded-2xl shadow-sm p-6">
        <div className="flex items-start justify-between gap-6 flex-wrap">
          <div className="flex items-start gap-4 min-w-0">
            <div className="flex flex-col items-center gap-2 flex-shrink-0">
              <div className="w-14 h-14 rounded-xl bg-neutral-100 flex items-center justify-center overflow-hidden">
                {data.company.logo ? (
                  <img
                    src={data.company.logo}
                    alt={data.company.ticker}
                    className="w-11 h-11 object-contain"
                    onError={(e) => {
                      const el = e.currentTarget;
                      el.style.display = 'none';
                      el.nextElementSibling?.removeAttribute('style');
                    }}
                  />
                ) : null}
                <span
                  className="text-[11px] font-bold text-neutral-500 font-mono tracking-tight"
                  style={{ display: data.company.logo ? 'none' : undefined }}
                >
                  {data.company.ticker.slice(0, 4)}
                </span>
              </div>
              <FavoriteButton ticker={data.company.ticker} />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-xl font-bold text-neutral-900 leading-tight">{data.company.name}</h1>
                <span className="text-[11px] font-mono text-neutral-400 bg-neutral-100 px-2 py-0.5 rounded-md whitespace-nowrap">
                  {data.company.exchange}:{data.company.ticker}
                </span>
              </div>
              <p className="text-[11px] text-neutral-400 mt-0.5">
                Capitalização de mercado {fmtBRL(Number(data.company.marketCap)).replace('bi', ' bilhões').replace('mi', ' milhões')}
              </p>
              {data.generatedAt && (
                <p className="text-[11px] text-neutral-400 mt-0.5">{timeAgo(data.generatedAt)}</p>
              )}
              <p className="text-[12px] text-neutral-500 mt-1 leading-5">
                {data.company.sector}
                <span className="mx-1.5 text-neutral-300">·</span>
                {data.company.industry}
              </p>
            </div>
          </div>
          <div className="text-right flex-shrink-0">
            <div className="text-2xl font-bold text-neutral-900 tabular-nums">R$ {safeN(data.valuation.currentPrice, 2)}</div>
            <div className={`text-[12px] font-medium mt-0.5 tabular-nums ${priceUp ? 'text-emerald-600' : 'text-rose-600'}`}>
              {priceUp ? '+' : ''}{data.priceHistory.return1y}% em 12 meses
            </div>
          </div>
        </div>
        {data.company.longDescription && (
          <div className="mt-5 pt-5 border-t border-neutral-100">
            <p className={`text-[13.5px] leading-7 text-neutral-600 max-w-3xl ${descExpanded ? '' : 'line-clamp-3'}`}>
              {data.company.longDescription}
            </p>
            <button
              onClick={() => setDescExpanded(v => !v)}
              className="mt-1.5 text-[12px] font-medium text-teal-600 hover:text-teal-700 transition-colors"
            >
              {descExpanded ? 'Ver menos ↑' : 'Ver mais ↓'}
            </button>
          </div>
        )}
      </div>

      {/* ── 2. Leitura atual ────────────────────────────────────────────── */}
      <div ref={navAlignRef} className="bg-[#F8FAFC] border border-neutral-200/80 rounded-2xl px-6 py-5">
        <div className="text-[12px] font-semibold text-neutral-500 mb-2.5">Resumo da análise</div>
        {data.company.summaryText
          ? <p className="text-[15px] leading-7 text-neutral-700 max-w-3xl">{data.company.summaryText}</p>
          : <p className="text-[17px] font-semibold leading-relaxed text-neutral-800 max-w-3xl">{headline}</p>
        }
      </div>

      {/* ── 3 + 4. Sustenta a tese / Merece atenção ─────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

        {/* O que sustenta */}
        <div className="bg-white rounded-2xl shadow-sm p-5">
          <div className="flex items-center gap-2 mb-5">
            <div className="w-1 h-4 rounded-full bg-emerald-400 flex-shrink-0" />
            <span className="text-[12px] font-semibold text-neutral-600">Pontos fortes</span>
          </div>
          <div className="flex flex-col divide-y divide-neutral-100">
            {rewards.map((r, i) => {
              const RAW_SENTINEL = /^(attention|negative|positive|neutral|good|bad|reward|risk)$/i;
              const showTitle = r.text && !RAW_SENTINEL.test(r.text.trim());
              return (
                <div key={i} className={i > 0 ? 'pt-3.5 pb-0.5' : 'pb-3.5'}>
                  {showTitle && (
                    <div className="text-[13.5px] font-semibold text-neutral-800 leading-snug">{r.text}</div>
                  )}
                  {r.detail && (
                    <div className={`text-[12px] text-neutral-500 leading-[1.65] ${showTitle ? 'mt-1' : ''}`}>{r.detail}</div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* O que merece atenção */}
        <div className="bg-white rounded-2xl shadow-sm p-5">
          <div className="flex items-center gap-2 mb-5">
            <div className="w-1 h-4 rounded-full bg-amber-400 flex-shrink-0" />
            <span className="text-[12px] font-semibold text-neutral-600">Pontos de atenção</span>
          </div>
          <div className="flex flex-col divide-y divide-neutral-100">
            {risks.map((r, i) => {
              const RAW_SENTINEL = /^(attention|negative|positive|neutral|good|bad|reward|risk)$/i;
              const showTitle = r.text && !RAW_SENTINEL.test(r.text.trim());
              return (
                <div key={i} className={i > 0 ? 'pt-3.5 pb-0.5' : 'pb-3.5'}>
                  {showTitle && (
                    <div className="text-[13.5px] font-semibold text-neutral-800 leading-snug">{r.text}</div>
                  )}
                  {r.detail && (
                    <div className={`text-[12px] text-neutral-500 leading-[1.65] ${showTitle ? 'mt-1' : ''}`}>{r.detail}</div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── 5. Luiz — insight da análise ────────────────────────────────── */}
      <div className="rounded-2xl p-4 flex items-center gap-4 border border-border" style={{ background: 'linear-gradient(135deg, rgba(236,72,153,0.06) 0%, rgba(168,85,247,0.06) 35%, rgba(99,102,241,0.06) 68%, rgba(6,182,212,0.06) 100%)' }}>
        {/* Avatar */}
        <div className="flex-shrink-0">
          <LuizAvatar size="md" shape="circle" />
        </div>

        {/* Texto */}
        <div className="flex-1 min-w-0">
          {/* Nome + badge IA */}
          <div className="flex items-center gap-1.5 mb-1">
            <span className="text-[12px] font-bold text-foreground">Luiz</span>
            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full leading-none tracking-wide text-white" style={{ background: 'linear-gradient(135deg, #EC4899 0%, #A855F7 35%, #6366F1 68%, #06B6D4 100%)' }}>
              IA
            </span>
          </div>
          <p className="text-[13px] font-semibold text-foreground leading-snug">
            {startingMeta[startingTab].tab === 'Preço justo'
              ? `O preço de ${data.company.ticker} pode estar abaixo do valor estimado.`
              : startingMeta[startingTab].tab === 'Dividendos'
              ? `${data.company.ticker} distribui dividendos consistentemente. Veja a sustentabilidade.`
              : `O ponto mais relevante desta análise está em ${startingMeta[startingTab].tab}.`}
          </p>
          <p className="text-[12px] text-muted-foreground mt-0.5 leading-relaxed">
            {startingMeta[startingTab].reason}
          </p>
        </div>

        {/* CTA */}
        <button
          type="button"
          onClick={() => onSelectTab(startingTab)}
          className="flex-shrink-0 flex items-center gap-2 text-[13px] font-medium text-foreground bg-white/90 hover:bg-white px-4 py-2 rounded-full transition-colors whitespace-nowrap shadow-sm"
        >
          <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24" fill="none">
            <path d="M12 2L15.5 8.5L22 12L15.5 15.5L12 22L8.5 15.5L2 12L8.5 8.5L12 2Z" fill="url(#luiz-btn-grad)" />
            <defs>
              <linearGradient id="luiz-btn-grad" x1="2" y1="2" x2="22" y2="22" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#EC4899" />
                <stop offset="40%" stopColor="#A855F7" />
                <stop offset="75%" stopColor="#6366F1" />
                <stop offset="100%" stopColor="#06B6D4" />
              </linearGradient>
            </defs>
          </svg>
          Análise completa
        </button>
      </div>

      {/* ── 6. O que mudou desde a última atualização ───────────────────── */}
      {data.recentChanges.length > 0 && (() => {
        const PILLAR_LABEL: Record<string, string> = {
          value: 'Preço justo', future: 'Futuro',
          past: 'Histórico', health: 'Saúde financeira', dividend: 'Dividendos',
        };
        return (
          <div>
            <div className="text-[13px] font-semibold text-neutral-600 mb-3 px-0.5">
              O que mudou desde a última atualização
            </div>
            <div className="flex flex-col gap-2.5">
              {data.recentChanges.map((change, i) => {
                const isWorse   = change.direction === 'worse';
                const isBetter  = change.direction === 'better';
                const arrowColor = isBetter ? 'text-emerald-500' : isWorse ? 'text-rose-500' : 'text-slate-400';
                const arrowPath  = isBetter
                  ? 'M8 12V4M4 8l4-4 4 4'     // up
                  : isWorse
                  ? 'M8 4v8M4 8l4 4 4-4'      // down
                  : 'M4 8h8';                  // right
                return (
                  <div
                    key={i}
                    className="bg-white rounded-2xl shadow-sm px-5 py-4 flex items-start gap-4"
                  >
                    {/* Direction arrow */}
                    <div className={`flex-shrink-0 mt-0.5 ${arrowColor}`}>
                      <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                        <path d={arrowPath} />
                      </svg>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3 flex-wrap">
                        <div>
                          {/* Pillar badge */}
                          <span className="inline-block text-[11px] font-semibold text-neutral-500 bg-neutral-100 px-2 py-0.5 rounded-md mb-1.5">
                            {PILLAR_LABEL[change.pillar] ?? change.pillar}
                          </span>
                          {/* Summary */}
                          <div className="text-[13.5px] font-semibold text-neutral-800 leading-snug">
                            {change.summary}
                          </div>
                          {/* Detail */}
                          <div className="text-[12px] text-neutral-500 leading-[1.6] mt-0.5">
                            {change.detail}
                          </div>
                        </div>
                        {/* Date */}
                        <span className="flex-shrink-0 text-[11px] text-neutral-400 mt-0.5 whitespace-nowrap">
                          {formatDate(change.date)}
                        </span>
                      </div>

                      {/* Before → After */}
                      <div className="flex items-center gap-2 mt-2.5">
                        <span className="text-[11px] font-mono text-neutral-500 bg-neutral-100 px-2 py-0.5 rounded">
                          {change.before}
                        </span>
                        <svg className="w-3.5 h-3.5 text-neutral-400 flex-shrink-0" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M3 8h10M9 4l4 4-4 4" />
                        </svg>
                        <span className={`text-[11px] font-mono font-semibold px-2 py-0.5 rounded ${isBetter ? 'text-emerald-700 bg-emerald-50' : isWorse ? 'text-rose-700 bg-rose-50' : 'text-slate-600 bg-slate-100'}`}>
                          {change.after}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })()}

      {/* ── 7. Preço em contexto + Eventos ──────────────────────────────── */}
      <PriceContextSection data={data} onSelectTab={onSelectTab} />
      <BaseSection data={data} onSelectTab={onSelectTab} />

    </div>
  );
}

// ─── Price Context Section ────────────────────────────────────────────────────

function PriceContextSection({
  data,
  onSelectTab,
}: {
  data: AnalysisData;
  onSelectTab: (tab: AnalysisTab) => void;
}) {
  const [period, setPeriod] = useState<'6m' | '1y' | '3y' | '5y'>('1y');
  const [eventsDrawer, setEventsDrawer] = useState(false);

  const MONTH_ABBR = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];

  const PILLAR_LABEL: Record<string, string> = {
    value: 'Valuation', future: 'Crescimento Futuro',
    past: 'Performance Passada', health: 'Saúde Financeira', dividend: 'Dividendos',
  };

  const impactCfg = {
    positive:  { dot: 'bg-emerald-400', text: 'text-emerald-700', bg: 'bg-emerald-50' },
    neutral:   { dot: 'bg-slate-300',   text: 'text-slate-600',   bg: 'bg-slate-100'  },
    attention: { dot: 'bg-amber-400',   text: 'text-amber-700',   bg: 'bg-amber-50'   },
  };

  const PERIODS = [
    { id: '6m' as const, label: '6M' },
    { id: '1y' as const, label: '1A' },
    { id: '3y' as const, label: '3A' },
    { id: '5y' as const, label: '5A' },
  ];

  // ── Slice + re-index ─────────────────────────────────────────────────────
  const all    = data.priceContextSeries;
  const cutoff = period === '6m' ? 6 : period === '1y' ? 12 : period === '3y' ? 36 : 60;
  const sliced = all.slice(Math.max(0, all.length - cutoff));

  const baseStock = sliced[0]?.stock ?? 100;
  const baseIbov  = sliced[0]?.ibov  ?? 100;
  const indexed   = sliced.map(p => ({
    date:  p.date,
    stock: (p.stock / baseStock) * 100,
    ibov:  (p.ibov  / baseIbov)  * 100,
  }));

  // ── KPIs ─────────────────────────────────────────────────────────────────
  const last     = indexed[indexed.length - 1] ?? { stock: 100, ibov: 100 };
  const stockVar = last.stock - 100;
  const ibovVar  = last.ibov  - 100;
  const vsMkt    = stockVar - ibovVar;
  const discount = data.valuation.discountPercent;

  // ── Chart geometry ────────────────────────────────────────────────────────
  const VW = 880, VH = 220;
  const PAD = { top: 16, right: 20, bottom: 34, left: 42 };
  const W   = VW - PAD.left - PAD.right;
  const H   = VH - PAD.top  - PAD.bottom;
  const n   = indexed.length;

  const allVals = indexed.flatMap(p => [p.stock, p.ibov]);
  const rawMin  = Math.min(...allVals);
  const rawMax  = Math.max(...allVals);
  const pad     = (rawMax - rawMin) * 0.1;
  const yMin    = rawMin - pad;
  const yMax    = rawMax + pad;

  const xS = (i: number) => PAD.left + (n > 1 ? (i / (n - 1)) * W : W / 2);
  const yS = (v: number) => PAD.top  + H - ((v - yMin) / (yMax - yMin)) * H;

  const toPath = (key: 'stock' | 'ibov') =>
    indexed.map((p, i) => `${i === 0 ? 'M' : 'L'}${xS(i).toFixed(1)},${yS(p[key]).toFixed(1)}`).join(' ');

  const stockPath = toPath('stock');
  const ibovPath  = toPath('ibov');
  const fillPath  = `${stockPath} L${xS(n - 1).toFixed(1)},${(PAD.top + H).toFixed(1)} L${PAD.left},${(PAD.top + H).toFixed(1)} Z`;

  // ── Y-axis ticks ──────────────────────────────────────────────────────────
  const yTicks = [0, 0.33, 0.67, 1].map(t => yMax - (yMax - yMin) * t);

  // ── X-axis labels ─────────────────────────────────────────────────────────
  const xLabels: { i: number; label: string }[] = [];
  if (n <= 6) {
    indexed.forEach((p, i) => {
      const m = parseInt(p.date.split('-')[1]) - 1;
      xLabels.push({ i, label: MONTH_ABBR[m] });
    });
  } else if (n <= 13) {
    indexed.forEach((p, i) => {
      if (i % 3 === 0 || i === n - 1) {
        const [y, m] = p.date.split('-');
        xLabels.push({ i, label: `${MONTH_ABBR[parseInt(m) - 1]} '${y.slice(2)}` });
      }
    });
  } else {
    let lastYear = '';
    indexed.forEach((p, i) => {
      const year = p.date.slice(0, 4);
      if (year !== lastYear) { xLabels.push({ i, label: year }); lastYear = year; }
    });
  }

  return (
    <div className="space-y-5">

      {/* ── Block 1: Preço em contexto ─────────────────────────────────── */}
      <div className="bg-white rounded-2xl shadow-sm p-5">

        {/* Header */}
        <div className="flex items-start justify-between gap-4 mb-5 flex-wrap">
          <div>
            <h2 className="text-base font-semibold text-neutral-900">Preço em contexto</h2>
            <p className="text-[12px] text-neutral-500 mt-0.5">
              Movimento da ação no período e relação com o valor justo estimado
            </p>
          </div>
          {/* Period tabs */}
          <div className="flex items-center gap-0.5 bg-neutral-100 rounded-lg p-0.5 flex-shrink-0">
            {PERIODS.map(p => (
              <button
                key={p.id}
                type="button"
                onClick={() => setPeriod(p.id)}
                className={`text-[11px] font-semibold px-3 py-1.5 rounded-md transition-all ${
                  period === p.id
                    ? 'bg-white text-neutral-900 shadow-sm'
                    : 'text-neutral-500 hover:text-neutral-700'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* KPI strip */}
        <div className="flex items-center gap-5 mb-6 flex-wrap">
          <div>
            <div className="text-[11px] text-neutral-500 mb-0.5">Variação no período</div>
            <div className={`text-[20px] font-bold tabular-nums leading-none ${stockVar >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
              {stockVar >= 0 ? '+' : ''}{stockVar.toFixed(1)}%
            </div>
          </div>
          <div className="w-px h-8 bg-neutral-100 flex-shrink-0" />
          <div>
            <div className="text-[11px] text-neutral-500 mb-0.5">vs. IBOVESPA</div>
            <div className={`text-[20px] font-bold tabular-nums leading-none ${vsMkt >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
              {vsMkt >= 0 ? '+' : ''}{vsMkt.toFixed(1)}{' '}
              <span className="text-[13px] font-medium">pp</span>
            </div>
          </div>
          <div className="w-px h-8 bg-neutral-100 flex-shrink-0" />
          <div>
            <div className="text-[11px] text-neutral-500 mb-0.5">Distância ao valor justo</div>
            <div className={`text-[20px] font-bold tabular-nums leading-none ${discount >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
              {discount >= 0 ? '−' : '+'}{Math.abs(discount).toFixed(0)}%
              <span className="text-[12px] font-normal text-neutral-400 ml-1.5">{discount >= 0 ? 'desconto' : 'prêmio'}</span>
            </div>
          </div>
        </div>

        {/* SVG line chart */}
        <svg viewBox={`0 0 ${VW} ${VH}`} className="w-full overflow-visible" style={{ height: VH }}>
          <defs>
            <linearGradient id="priceGradOv" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%"   stopColor="#355CDE" stopOpacity="0.09" />
              <stop offset="100%" stopColor="#355CDE" stopOpacity="0.00" />
            </linearGradient>
          </defs>

          {/* Gridlines */}
          {yTicks.map((v, ti) => (
            <g key={ti}>
              <line x1={PAD.left} x2={PAD.left + W} y1={yS(v)} y2={yS(v)} stroke="#f1f5f9" strokeWidth="1" />
              <text x={PAD.left - 6} y={yS(v) + 3.5} textAnchor="end" fontSize="9" fill="#94a3b8">
                {v.toFixed(0)}
              </text>
            </g>
          ))}

          {/* Baseline at 100 */}
          {yS(100) >= PAD.top && yS(100) <= PAD.top + H && (
            <line
              x1={PAD.left} x2={PAD.left + W}
              y1={yS(100)}   y2={yS(100)}
              stroke="#e2e8f0" strokeWidth="1" strokeDasharray="4 3"
            />
          )}

          {/* Fill under stock */}
          <path d={fillPath} fill="url(#priceGradOv)" />

          {/* IBOV line — subtle dashed */}
          <path d={ibovPath} fill="none" stroke="#cbd5e1" strokeWidth="1.5" strokeDasharray="5 3" />

          {/* Stock line */}
          <path d={stockPath} fill="none" stroke="#355CDE" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />

          {/* Endpoint dot */}
          {n > 0 && (
            <circle cx={xS(n - 1)} cy={yS(last.stock)} r="3.5" fill="#355CDE" />
          )}

          {/* X-axis labels */}
          {xLabels.map(({ i, label }) => (
            <text
              key={`xl-${i}`}
              x={xS(i)} y={PAD.top + H + 18}
              textAnchor="middle" fontSize="10" fill="#64748b" fontWeight="500"
            >
              {label}
            </text>
          ))}
        </svg>

        {/* Legend */}
        <div className="flex items-center gap-5 mt-1" style={{ paddingLeft: PAD.left }}>
          <div className="flex items-center gap-1.5">
            <div className="w-5 h-0.5 bg-[#355CDE] rounded-full" />
            <span className="text-[11px] text-neutral-600 font-medium">{data.company.ticker}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <svg width="18" height="3" viewBox="0 0 18 3">
              <line x1="0" y1="1.5" x2="18" y2="1.5" stroke="#cbd5e1" strokeWidth="1.5" strokeDasharray="5 3" />
            </svg>
            <span className="text-[11px] text-neutral-400">IBOVESPA</span>
          </div>
          <span className="text-[10px] text-neutral-300 ml-auto">indexado a 100 no início do período</span>
        </div>
      </div>

      {/* ── Block 2: Eventos que explicam o movimento ─────────────────── */}
      {data.contextEvents.length > 0 && (() => {
        const visible  = data.contextEvents.slice(0, 3);
        const overflow = data.contextEvents.slice(3);

        // Reusable event row
        const EventRow = ({ evt, isLast }: { evt: typeof data.contextEvents[0]; isLast: boolean }) => {
          // Parse "22 Out 2024" → day="22", month="OUT"
          const parts = evt.date.split(' ');
          const day   = parts[0] ?? '';
          const month = (parts[1] ?? '').toUpperCase();

          return (
            <div className={`flex items-start gap-4 py-4 ${!isLast ? 'border-b border-neutral-100' : ''}`}>

              {/* Calendar tile */}
              <div className="flex-shrink-0 w-10 rounded-lg overflow-hidden border border-blue-100 shadow-sm">
                <div className="bg-[#3b82f6] flex items-center justify-center py-1.5">
                  <span className="text-[15px] font-bold text-white leading-none">{day}</span>
                </div>
                <div className="bg-[#dbeafe] flex items-center justify-center py-1">
                  <span className="text-[9px] font-bold text-blue-500 tracking-widest">{month}</span>
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="text-[13.5px] font-semibold text-neutral-800 leading-snug mb-2">{evt.title}</div>
                {evt.pillar && (
                  <button
                    type="button"
                    onClick={() => onSelectTab(evt.pillar!)}
                    className="inline-flex items-center text-[11px] font-semibold text-neutral-500 bg-neutral-100 hover:bg-blue-50 hover:text-[#355CDE] px-2 py-0.5 rounded-md transition-colors mb-2"
                  >
                    {PILLAR_LABEL[evt.pillar]}
                  </button>
                )}
                <p className="text-[12px] text-neutral-500 leading-[1.65]">{evt.explanation}</p>
              </div>
            </div>
          );
        };

        return (
          <>
            <div className="bg-white rounded-2xl shadow-sm p-5">
              <div className="mb-5">
                <h2 className="text-base font-semibold text-neutral-900">Eventos que ajudam a explicar o movimento</h2>
                <p className="text-[12px] text-neutral-500 mt-0.5">Fatos que alteraram ou podem alterar a leitura da empresa</p>
              </div>

              <div className="flex flex-col">
                {visible.map((evt, idx) => (
                  <EventRow key={evt.id} evt={evt} isLast={idx === visible.length - 1 && overflow.length === 0} />
                ))}
              </div>

              {overflow.length > 0 && (
                <div className="mt-4 pt-4 border-t border-neutral-100">
                  <button
                    type="button"
                    onClick={() => setEventsDrawer(true)}
                    className="flex items-center gap-2 text-[12px] font-semibold text-blue-800 bg-blue-50 hover:bg-blue-100 px-4 py-2.5 rounded-xl transition-colors"
                  >
                    Ver mais atualizações
                    <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M3 8h10M9 4l4 4-4 4" />
                    </svg>
                  </button>
                </div>
              )}
            </div>

            {/* Drawer overlay */}
            {eventsDrawer && (
              <div className="fixed inset-0 z-50 flex justify-end">
                {/* Backdrop */}
                <div
                  className="absolute inset-0 bg-black/20 backdrop-blur-[1px]"
                  onClick={() => setEventsDrawer(false)}
                />
                {/* Panel */}
                <div className="relative w-full max-w-md bg-white shadow-2xl flex flex-col h-full overflow-hidden">
                  {/* Drawer header */}
                  <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-100">
                    <div>
                      <h3 className="text-[15px] font-semibold text-neutral-900">Todas as atualizações</h3>
                      <p className="text-[11px] text-neutral-500 mt-0.5">{data.contextEvents.length} eventos relevantes</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setEventsDrawer(false)}
                      className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-neutral-100 transition-colors text-neutral-400 hover:text-neutral-600"
                    >
                      <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                        <path d="M3 3l10 10M13 3L3 13" />
                      </svg>
                    </button>
                  </div>

                  {/* Drawer body */}
                  <div className="flex-1 overflow-y-auto px-5 py-2">
                    {data.contextEvents.map((evt, idx) => (
                      <EventRow
                        key={evt.id}
                        evt={evt}
                        isLast={idx === data.contextEvents.length - 1}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}
          </>
        );
      })()}

    </div>
  );
}

// ─── About Section ───────────────────────────────────────────────────────────

function AboutSection({ data }: { data: AnalysisData }) {
  const c = data.company;

  const meta: { label: string; value: string; href?: string }[] = [
    { label: 'Fundação',     value: c.founded   ?? '—' },
    { label: 'Funcionários', value: c.employees  ?? '—' },
    { label: 'CEO',          value: c.ceo        ?? '—' },
    { label: 'Site',         value: c.website    ?? '—', href: c.website ? `https://${c.website}` : undefined },
  ];

  if (!c.longDescription && meta.every(m => m.value === '—')) return null;

  return (
    <div className="bg-white rounded-2xl shadow-sm p-5">
      <h2 className="text-base font-semibold text-neutral-900 mb-5">Sobre a empresa</h2>

      {/* Meta row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-y-4 gap-x-6 mb-5 pb-5 border-b border-neutral-100">
        {meta.map(({ label, value, href }) => (
          <div key={label}>
            <div className="text-[11px] text-neutral-400 mb-0.5">{label}</div>
            {href ? (
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[13px] font-semibold text-[#355CDE] hover:underline break-all"
              >
                {value}
              </a>
            ) : (
              <div className="text-[13px] font-semibold text-neutral-800">{value}</div>
            )}
          </div>
        ))}
      </div>

      {/* Long description */}
      {c.longDescription && (
        <p className="text-[13.5px] leading-7 text-neutral-600 max-w-3xl">
          {c.longDescription}
        </p>
      )}
    </div>
  );
}

// ─── Base da Leitura Section ─────────────────────────────────────────────────

function BaseSection({
  data,
  onSelectTab,
}: {
  data: AnalysisData;
  onSelectTab: (tab: AnalysisTab) => void;
}) {
  const v  = data.valuation;
  const rv = data.relativeValuation;
  const g  = data.growth;
  const p  = data.pastPerformance;
  const h  = data.health;
  const dv = data.dividend;
  const cov = (h.ebit != null && h.interestExpense != null && h.interestExpense !== 0) ? safeN(h.ebit / h.interestExpense) : '—';
  const fmt$ = (n: number | null | undefined, d = 1) => n == null ? '—' : `${n.toFixed(d)}%`;

  type Module = {
    pillar: string;
    tab: AnalysisTab;
    name: string;
    state: string;
    stateColor: string;
    primary: string;
    primaryLabel: string;
    secondary: string;
    micro: string;
  };

  // Growth gap for visual clarity
  const growthGap = Math.abs((g.earningsGrowthRate ?? 0) - (g.industryEarningsGrowth ?? 0)).toFixed(1);
  const growthAbove = (g.earningsGrowthRate ?? 0) >= (g.industryEarningsGrowth ?? 0);

  // Dividend state: conclusive based on yield + payout coverage
  const divState =
    dv.payoutRatio > 90  ? 'Pressionado' :
    dv.currentYield > 5 && dv.payoutRatio <= 80 ? 'Atrativo' :
    dv.currentYield >= 3 ? 'Moderado' : 'Atenção';
  const divColor =
    divState === 'Atrativo'    ? 'text-emerald-600' :
    divState === 'Pressionado' ? 'text-rose-600'    :
    divState === 'Atenção'     ? 'text-amber-600'   : 'text-slate-400';

  const modules: Module[] = [
    {
      pillar: 'value', tab: 'value',
      name: 'Valuation',
      state: (v.discountPercent ?? 0) > 10 ? 'Atrativo' : (v.discountPercent ?? 0) >= 0 ? 'Moderado' : 'Atenção',
      stateColor: (v.discountPercent ?? 0) > 10 ? 'text-emerald-600' : (v.discountPercent ?? 0) >= 0 ? 'text-slate-400' : 'text-amber-600',
      primary: `${(v.discountPercent ?? 0) >= 0 ? '−' : '+'}${Math.abs(v.discountPercent ?? 0)}%`,
      primaryLabel: (v.discountPercent ?? 0) >= 0 ? 'desconto ao valor justo' : 'prêmio ao valor justo',
      secondary: `P/L ${rv.peRatio ?? '—'}x  ·  P/VP ${rv.pbRatio ?? '—'}x`,
      micro: `Preço ${Math.abs(v.discountPercent ?? 0)}% ${(v.discountPercent ?? 0) >= 0 ? 'abaixo' : 'acima'} da estimativa de valor intrínseco pelo DCF.`,
    },
    {
      pillar: 'future', tab: 'future',
      name: 'Crescimento futuro',
      state: growthAbove ? 'Forte' : 'Atenção',
      stateColor: growthAbove ? 'text-blue-600' : 'text-amber-600',
      primary: g.earningsGrowthRate != null ? `+${g.earningsGrowthRate.toFixed(1)}%` : '—',
      primaryLabel: 'crescimento do lucro / ano',
      secondary: `vs. setor ${g.industryEarningsGrowth != null ? `+${g.industryEarningsGrowth.toFixed(1)}%` : '—'}  ·  receita ${g.revenueGrowthRate != null ? `+${g.revenueGrowthRate.toFixed(1)}%` : '—'}`,
      micro: `Lucro projetado ${growthGap}pp ${growthAbove ? 'acima' : 'abaixo'} da média do setor (${g.industryEarningsGrowth != null ? `${g.industryEarningsGrowth.toFixed(1)}%` : '—'}/ano).`,
    },
    {
      pillar: 'past', tab: 'past',
      name: 'Performance passada',
      state: p.currentROE > 18 ? 'Forte' : p.currentROE > 10 ? 'Moderado' : 'Pressionado',
      stateColor: p.currentROE > 18 ? 'text-emerald-600' : p.currentROE > 10 ? 'text-slate-400' : 'text-rose-600',
      primary: fmt$(p.currentROE),
      primaryLabel: 'retorno sobre patrimônio',
      secondary: `Margem líq. ${fmt$(p.netMargin)}  ·  ROCE ${fmt$(p.currentROCE)}`,
      micro: `ROE de ${fmt$(p.currentROE)} com margem líquida de ${fmt$(p.netMargin)} no último exercício.`,
    },
    {
      pillar: 'health', tab: 'health',
      name: 'Saúde financeira',
      state: h.debtToEquity < 0.5 ? 'Forte' : h.debtToEquity < 1 ? 'Moderado' : 'Pressionado',
      stateColor: h.debtToEquity < 0.5 ? 'text-emerald-600' : h.debtToEquity < 1 ? 'text-slate-400' : 'text-rose-600',
      primary: h.debtToEquity != null ? `${h.debtToEquity.toFixed(1)}x` : '—',
      primaryLabel: 'dívida / patrimônio',
      secondary: `Juros cobertos ${cov !== '—' ? `${cov}x` : '—'}  ·  Caixa ${fmtBRL(h.cash)}`,
      micro: `Dívida ${h.debtToEquity != null ? `${h.debtToEquity.toFixed(1)}x` : '—'} o patrimônio, com cobertura de ${cov !== '—' ? `${cov}x` : '—'} pelo EBIT.`,
    },
    {
      pillar: 'dividend', tab: 'dividend',
      name: 'Dividendos',
      state: divState,
      stateColor: divColor,
      primary: fmt$(dv.currentYield),
      primaryLabel: 'dividend yield atual',
      secondary: `Payout ${dv.payoutRatio != null ? `${dv.payoutRatio}%` : '—'}  ·  ${dv.yearsWithoutInterruption ?? '—'} anos sem corte`,
      micro: divState === 'Pressionado'
        ? `Yield de ${fmt$(dv.currentYield)} com payout de ${dv.payoutRatio != null ? `${dv.payoutRatio}%` : '—'} — pouca margem de segurança.`
        : divState === 'Atrativo'
          ? `Yield de ${fmt$(dv.currentYield)} sustentável com payout de ${dv.payoutRatio != null ? `${dv.payoutRatio}%` : '—'} nos últimos ${dv.yearsWithoutInterruption ?? '—'} anos.`
          : `Distribuição consistente há ${dv.yearsWithoutInterruption ?? '—'} anos com yield de ${fmt$(dv.currentYield)}.`,
    },
  ];

  return (
    <div className="bg-white rounded-2xl shadow-sm px-6 py-5">
      <h2 className="text-[13px] font-semibold text-neutral-900 mb-6">Base da leitura</h2>

      <div className="grid grid-cols-1 sm:grid-cols-5 divide-x divide-neutral-100">
        {modules.map((mod, idx) => (
          <button
            key={mod.pillar}
            type="button"
            onClick={() => onSelectTab(mod.tab)}
            className={`text-left flex flex-col gap-3 hover:opacity-75 transition-opacity
              ${idx === 0 ? 'pr-6' : idx === modules.length - 1 ? 'pl-6' : 'px-6'}`}
          >
            {/* Name + state */}
            <div className="flex items-baseline justify-between gap-2">
              <span className="text-[10.5px] font-semibold text-neutral-400 uppercase">{mod.name}</span>
              <span className={`text-[10px] font-semibold flex-shrink-0 ${mod.stateColor}`}>{mod.state}</span>
            </div>

            {/* Primary */}
            <div>
              <div className="text-[30px] font-bold text-neutral-900 tabular-nums leading-none">
                {mod.primary}
              </div>
              <div className="text-[10.5px] text-neutral-400 mt-1.5 leading-none">{mod.primaryLabel}</div>
            </div>

            {/* Secondary */}
            <div className="text-[11.5px] text-neutral-500 tabular-nums">{mod.secondary}</div>

            {/* Micro */}
            <p className="text-[11px] text-neutral-400 leading-[1.45] mt-0.5">{mod.micro}</p>
          </button>
        ))}
      </div>
    </div>
  );
}
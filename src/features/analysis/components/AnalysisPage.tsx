"use client";

import { useState, useMemo } from 'react';
import { useParams } from 'next/navigation';
import { motion } from 'motion/react';
import {
  TrendingUp, Shield, DollarSign, BarChart3,
  CheckCircle2, XCircle, ArrowLeft, Users, Activity, Info,
  Calendar, ArrowUpRight, ArrowDownRight, Minus,
} from 'lucide-react';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, ReferenceLine, Cell, Area, AreaChart,
  Legend,
} from 'recharts';

/* eslint-disable @typescript-eslint/no-explicit-any */
const fmtBRL = (suffix: string) => (v: any) => [`R$ ${Number(v).toFixed(2)}`, suffix];
const fmtBRLM = (suffix: string) => (v: any) => [`R$ ${formatNumber(Number(v))}M`, suffix];
const fmtPct = (suffix: string) => (v: any) => [`${v}%`, suffix];
const fmtX = (suffix: string) => (v: any) => [`${v}x`, suffix];
/* eslint-enable @typescript-eslint/no-explicit-any */
import Link from 'next/link';
import { SnowflakeChart, type SnowflakeDimension } from '@/src/components/shared/SnowflakeChart';
import { getAnalysisData } from '../services';
import type {
  AnalysisData, AnalysisTab, DimensionScore, MetricDistribution, TimelineEvent,
  DCFSensitivityCell, RatioTrend, MarginSeries, ReturnComparison, InsiderSentimentPoint, DividendVsEarnings,
} from '../interfaces';

// ─── Colors ──────────────────────────────────────────────────────────────────

const COLORS = {
  value: '#6366f1',
  future: '#3b82f6',
  past: '#10b981',
  health: '#f59e0b',
  dividend: '#8b5cf6',
  positive: '#16a34a',
  negative: '#dc2626',
  neutral: '#6b7280',
  muted: '#e5e7eb',
  forecast: '#93c5fd',
  historical: '#3b82f6',
  bg: '#f8fafc',
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
  { id: 'value', label: 'Valor', icon: <DollarSign className="w-4 h-4" /> },
  { id: 'future', label: 'Futuro', icon: <TrendingUp className="w-4 h-4" /> },
  { id: 'past', label: 'Passado', icon: <BarChart3 className="w-4 h-4" /> },
  { id: 'health', label: 'Saúde', icon: <Shield className="w-4 h-4" /> },
  { id: 'dividend', label: 'Dividendos', icon: <DollarSign className="w-4 h-4" /> },
  { id: 'ownership', label: 'Composição', icon: <Users className="w-4 h-4" /> },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatNumber(n: number): string {
  if (n >= 1e6) return `${(n / 1e6).toFixed(1)}M`;
  if (n >= 1e3) return `${(n / 1e3).toFixed(1)}K`;
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

function SectionCard({ title, subtitle, children, className = '' }: { title: string; subtitle?: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-white rounded-2xl border border-neutral-200 p-6 ${className}`}>
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-neutral-900">{title}</h3>
        {subtitle && <p className="text-xs text-neutral-400 mt-0.5">{subtitle}</p>}
      </div>
      {children}
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
          <div className="h-full bg-red-100" style={{ width: `${pct(ranges[0])}%` }} />
          <div className="h-full bg-yellow-100" style={{ width: `${pct(ranges[1]) - pct(ranges[0])}%` }} />
          <div className="h-full bg-green-100" style={{ width: `${100 - pct(ranges[1])}%` }} />
        </div>
        {/* Actual value bar */}
        <div
          className="absolute top-1.5 left-0 h-5 rounded bg-neutral-800"
          style={{ width: `${Math.min(pct(value), 100)}%` }}
        />
        {/* Target marker */}
        <div
          className="absolute top-0 w-0.5 h-full bg-red-500"
          style={{ left: `${pct(target)}%` }}
        />
        <div
          className="absolute -top-0.5 w-2 h-2 bg-red-500 rounded-full transform -translate-x-1/2"
          style={{ left: `${pct(target)}%` }}
        />
      </div>
      <div className="flex justify-between text-[10px] text-neutral-400">
        <span>{min}{unit}</span>
        <span className="text-red-500 font-medium">Alvo: {target}{unit}</span>
        <span>{max}{unit}</span>
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
          <div className="w-2.5 h-2.5 rounded-full bg-indigo-600" />
          <span className="text-neutral-600">{distribution.metric} da empresa: <strong>{distribution.currentValue}x</strong></span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
          <span className="text-neutral-600">Mediana setor: <strong>{distribution.sectorMedian}x</strong></span>
        </div>
      </div>
      <div className="h-44">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={distribution.buckets} barCategoryGap="15%">
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
            <XAxis dataKey="label" tick={{ fontSize: 10 }} />
            <YAxis tick={{ fontSize: 10 }} label={{ value: 'Empresas', angle: -90, position: 'insideLeft', fontSize: 10, fill: '#9ca3af' }} />
            <Tooltip formatter={fmtX('empresas')} />
            <Bar dataKey="value" radius={[3, 3, 0, 0]}>
              {distribution.buckets.map((b, i) => (
                <Cell key={i} fill={b.isCurrent ? '#6366f1' : b.isMedian ? '#f59e0b' : '#e2e8f0'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
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
              <span className={`font-mono font-bold ${isUpside ? 'text-green-600' : 'text-red-600'}`}>
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
                  backgroundColor: isUpside ? '#bbf7d0' : '#fecaca',
                }}
              />
              {/* Current price dot */}
              <div
                className="absolute top-0.5 w-4 h-4 rounded-full bg-neutral-700 border-2 border-white shadow"
                style={{ left: `calc(${pct(currentPrice)}% - 8px)` }}
              />
              {/* Scenario dot */}
              <div
                className="absolute top-0.5 w-4 h-4 rounded-full border-2 border-white shadow"
                style={{
                  left: `calc(${pct(s.value)}% - 8px)`,
                  backgroundColor: isUpside ? '#16a34a' : '#dc2626',
                }}
              />
            </div>
          </div>
        );
      })}
      <div className="flex items-center gap-4 text-xs text-neutral-400 mt-2">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-neutral-700" />
          <span>Preço atual</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-green-600" />
          <span>Upside</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-red-600" />
          <span>Downside</span>
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
                <span className="text-[10px] text-neutral-400 mt-1 block">Fonte: {event.source}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/**
 * SENSITIVITY LOLLIPOP — data-to-viz: Horizontal lollipop ordered by impact.
 * Color encodes severity (high/medium/low). Ordered = key data-to-viz rule.
 */
function SensitivityChart({ drivers }: { drivers: { key: string; label: string; impact: 'high' | 'medium' | 'low' }[] }) {
  const impactWeight = { high: 3, medium: 2, low: 1 };
  const impactColor = { high: '#dc2626', medium: '#f59e0b', low: '#6b7280' };
  const impactLabel = { high: 'Alto', medium: 'Médio', low: 'Baixo' };
  const sorted = [...drivers].sort((a, b) => impactWeight[b.impact] - impactWeight[a.impact]);

  return (
    <div className="space-y-2.5">
      {sorted.map((d) => (
        <div key={d.key} className="flex items-center gap-3">
          <span className="text-sm text-neutral-700 w-48 text-right truncate">{d.label}</span>
          <div className="flex-1 relative h-5 flex items-center">
            <div
              className="h-1 rounded"
              style={{
                width: `${impactWeight[d.impact] / 3 * 100}%`,
                backgroundColor: impactColor[d.impact],
              }}
            />
            <div
              className="absolute w-4 h-4 rounded-full border-2 border-white shadow"
              style={{
                left: `calc(${impactWeight[d.impact] / 3 * 100}% - 8px)`,
                backgroundColor: impactColor[d.impact],
              }}
            />
          </div>
          <span
            className="text-xs font-medium px-2 py-0.5 rounded-full"
            style={{
              backgroundColor: `${impactColor[d.impact]}15`,
              color: impactColor[d.impact],
            }}
          >
            {impactLabel[d.impact]}
          </span>
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
  const allFV = cells.map(c => c.fairValue);
  const minFV = Math.min(...allFV);
  const maxFV = Math.max(...allFV);

  const getColor = (fv: number) => {
    if (fv >= currentPrice * 1.2) return { bg: 'bg-green-200', text: 'text-green-900' };
    if (fv >= currentPrice) return { bg: 'bg-green-100', text: 'text-green-800' };
    if (fv >= currentPrice * 0.9) return { bg: 'bg-yellow-100', text: 'text-yellow-800' };
    return { bg: 'bg-red-100', text: 'text-red-800' };
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr>
            <th className="p-2 text-left text-neutral-500 text-xs">WACC ↓ / Cresc. →</th>
            {growthValues.map(g => (
              <th key={g} className={`p-2 text-center text-xs ${g === baseGrowth ? 'font-bold text-indigo-700 bg-indigo-50' : 'text-neutral-500'}`}>
                {g}%
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {waccValues.map(w => (
            <tr key={w}>
              <td className={`p-2 text-xs font-mono ${w === baseWacc ? 'font-bold text-indigo-700 bg-indigo-50' : 'text-neutral-600'}`}>
                {w}%
              </td>
              {growthValues.map(g => {
                const cell = cells.find(c => c.wacc === w && c.terminalGrowth === g);
                const fv = cell?.fairValue ?? 0;
                const { bg, text } = getColor(fv);
                const isBase = w === baseWacc && g === baseGrowth;
                return (
                  <td key={g} className={`p-2 text-center font-mono text-xs ${bg} ${text} ${isBase ? 'ring-2 ring-indigo-500 ring-inset font-bold' : ''}`}>
                    R${fv.toFixed(0)}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
      <div className="flex items-center gap-4 mt-3 text-xs text-neutral-500">
        <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded bg-green-200" />Acima do preço (+20%)</div>
        <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded bg-green-100" />Acima do preço</div>
        <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded bg-yellow-100" />Próximo (-10%)</div>
        <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded bg-red-100" />Abaixo do preço</div>
        <div className="flex items-center gap-1.5"><div className="w-4 h-4 rounded ring-2 ring-indigo-500" />Cenário base</div>
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
          <div className="h-36">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trend.series}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                <XAxis dataKey="year" tick={{ fontSize: 9 }} />
                <YAxis tick={{ fontSize: 9 }} tickFormatter={(v: any) => `${v}x`} domain={['auto', 'auto']} />
                <Tooltip formatter={fmtX('')} />
                <Line type="monotone" dataKey="company" stroke={COLORS.value} strokeWidth={2.5} dot={{ r: 3, fill: COLORS.value }} name="Empresa" />
                <Line type="monotone" dataKey="industry" stroke="#94a3b8" strokeWidth={1.5} strokeDasharray="4 4" dot={{ r: 2, fill: '#94a3b8' }} name="Indústria" />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="flex items-center gap-3 mt-2 text-[10px] text-neutral-500">
            <div className="flex items-center gap-1"><div className="w-3 h-0.5 bg-indigo-500 rounded" />Empresa</div>
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
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={series}>
          <defs>
            <linearGradient id="grossGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10b981" stopOpacity={0.15} />
              <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="opGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.15} />
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="netGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.15} />
              <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
          <XAxis dataKey="year" tick={{ fontSize: 11 }} />
          <YAxis tick={{ fontSize: 11 }} tickFormatter={(v: any) => `${v}%`} />
          <Tooltip formatter={fmtPct('')} />
          <Legend wrapperStyle={{ fontSize: 11 }} />
          <Area type="monotone" dataKey="grossMargin" name="Margem Bruta" stroke="#10b981" strokeWidth={2} fill="url(#grossGrad)" dot={{ r: 3 }} />
          <Area type="monotone" dataKey="operatingMargin" name="Margem Operacional" stroke="#3b82f6" strokeWidth={2} fill="url(#opGrad)" dot={{ r: 3 }} />
          <Area type="monotone" dataKey="netMargin" name="Margem Líquida" stroke="#8b5cf6" strokeWidth={2} fill="url(#netGrad)" dot={{ r: 3 }} />
        </AreaChart>
      </ResponsiveContainer>
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
    gap: d.stock - d.market,
  }));

  return (
    <div className="h-72">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} layout="vertical" barCategoryGap="20%">
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
          <XAxis type="number" tick={{ fontSize: 10 }} tickFormatter={(v: any) => `${v}%`} />
          <YAxis type="category" dataKey="period" tick={{ fontSize: 11, fontWeight: 600 }} width={35} />
          <Tooltip
            formatter={(v: any, name: any) => [`${Number(v).toFixed(1)}%`, name === 'stock' ? 'Ação' : 'Ibovespa']}
          />
          <Legend wrapperStyle={{ fontSize: 11 }} formatter={(v: any) => v === 'stock' ? 'Ação' : 'Ibovespa'} />
          <ReferenceLine x={0} stroke="#374151" strokeWidth={1} />
          <Bar dataKey="stock" fill={COLORS.value} radius={[0, 4, 4, 0]} name="stock">
            {chartData.map((entry, idx) => (
              <Cell key={idx} fill={entry.stock >= 0 ? '#6366f1' : '#ef4444'} />
            ))}
          </Bar>
          <Bar dataKey="market" fill="#94a3b8" radius={[0, 4, 4, 0]} name="market" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

/**
 * INSIDER SENTIMENT BAR — data-to-viz: Diverging bar for net insider trading.
 * Positive = net buying (bullish), Negative = net selling (bearish).
 */
function InsiderSentimentChart({ data }: { data: InsiderSentimentPoint[] }) {
  return (
    <div className="h-56">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} barCategoryGap="15%">
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
          <XAxis dataKey="quarter" tick={{ fontSize: 10 }} />
          <YAxis tick={{ fontSize: 10 }} tickFormatter={(v: any) => `${(Number(v) / 1e6).toFixed(0)}M`} />
          <Tooltip formatter={(v: any) => [`R$ ${(Number(v) / 1e6).toFixed(1)}M`, '']} />
          <ReferenceLine y={0} stroke="#374151" strokeWidth={1} />
          <Bar dataKey="netValue" radius={[4, 4, 4, 4]} name="Saldo Líquido">
            {data.map((entry, idx) => (
              <Cell key={idx} fill={entry.netValue >= 0 ? '#16a34a' : '#dc2626'} fillOpacity={0.85} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

/**
 * DIVIDEND vs EARNINGS — data-to-viz: Grouped Bar Chart.
 * Shows dividend sustainability: earnings should always cover dividends.
 */
function DividendVsEarningsChart({ data }: { data: DividendVsEarnings[] }) {
  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} barCategoryGap="20%">
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
          <XAxis dataKey="year" tick={{ fontSize: 10 }} />
          <YAxis tick={{ fontSize: 10 }} tickFormatter={(v: any) => `R$${v}`} />
          <Tooltip formatter={(v: any, name: any) => [`R$ ${Number(v).toFixed(2)}`, name === 'earnings' ? 'LPA' : 'DPA']} />
          <Legend wrapperStyle={{ fontSize: 11 }} formatter={(v: any) => v === 'earnings' ? 'Lucro por Ação (LPA)' : 'Dividendo por Ação (DPA)'} />
          <Bar dataKey="earnings" fill="#3b82f6" radius={[4, 4, 0, 0]} name="earnings" />
          <Bar dataKey="dividend" fill="#8b5cf6" radius={[4, 4, 0, 0]} name="dividend" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

// ─── Overview Tab ────────────────────────────────────────────────────────────

function OverviewTab({ data }: { data: AnalysisData }) {
  const snowflakeDims: SnowflakeDimension[] = data.snowflake.map((d) => ({
    label: d.displayName,
    value: d.normalizedScore,
    color: DIMENSION_COLORS[d.dimension],
    why: d.summary,
    metric: `${d.score}/6 checks`,
  }));

  const totalScore = data.snowflake.reduce((sum, d) => sum + d.score, 0);
  const overallStatus = totalScore >= 20 ? 'healthy' : totalScore >= 12 ? 'attention' : 'risk';

  return (
    <div className="space-y-6">
      {/* Company Header */}
      <div className="bg-white rounded-2xl border border-neutral-200 p-6">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center text-white font-bold text-lg">
            {data.company.ticker.slice(0, 2)}
          </div>
          <div className="flex-1">
            <div className="flex items-baseline gap-3">
              <h1 className="text-2xl font-bold text-neutral-900">{data.company.name}</h1>
              <span className="text-sm font-mono text-neutral-500 bg-neutral-100 px-2 py-0.5 rounded">
                {data.company.exchange}:{data.company.ticker}
              </span>
            </div>
            <p className="text-sm text-neutral-600 mt-1">{data.company.sector} — {data.company.industry}</p>
            <p className="text-sm text-neutral-500 mt-1">Market Cap: {data.company.marketCap}</p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-neutral-900">
              R$ {data.valuation.currentPrice.toFixed(2)}
            </div>
            <div className={`text-sm font-medium ${data.priceHistory.return1y >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {data.priceHistory.return1y >= 0 ? '+' : ''}{data.priceHistory.return1y}% (1 ano)
            </div>
          </div>
        </div>
      </div>

      {/* Snowflake + Score Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SectionCard title="Snowflake" className="flex flex-col items-center">
          <SnowflakeChart
            dimensions={snowflakeDims}
            size="large"
            status={overallStatus}
          />
          <div className="mt-4 text-center">
            <div className="text-3xl font-bold text-neutral-900">{totalScore}/30</div>
            <p className="text-sm text-neutral-500">Score geral</p>
          </div>
        </SectionCard>

        <SectionCard title="Resumo por Dimensão">
          <div className="space-y-4">
            {data.snowflake.map((dim) => (
              <div key={dim.dimension} className="p-4 rounded-xl bg-neutral-50 hover:bg-neutral-100 transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-neutral-900">{dim.displayName}</span>
                  <ScoreBar score={dim.score} color={DIMENSION_COLORS[dim.dimension]} />
                </div>
                <p className="text-sm text-neutral-600">{dim.summary}</p>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>

      {/* Price Chart with Timeline Annotations */}
      <SectionCard title="Histórico de Preço (1 ano)" subtitle="data-to-viz: Area Chart com anotações de eventos — evita gráficos sem contexto (caveat #32)">
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data.priceHistory.series}>
              <defs>
                <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#14b8a6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" tickFormatter={(v: any) => String(v).slice(5, 7) + '/' + String(v).slice(2, 4)} tick={{ fontSize: 11 }} interval={20} />
              <YAxis domain={[0, 'auto']} tick={{ fontSize: 11 }} tickFormatter={(v: any) => `R$${v}`} />
              <Tooltip
                formatter={fmtBRL('Preço')}
                labelFormatter={(label: any) => `Data: ${label}`}
              />
              {/* Fair value reference line */}
              <ReferenceLine y={data.valuation.fairValue} stroke="#16a34a" strokeDasharray="8 4" label={{ value: `Fair value: R$${data.valuation.fairValue}`, position: 'right', fontSize: 10, fill: '#16a34a' }} />
              <Area type="monotone" dataKey="price" stroke="#14b8a6" strokeWidth={2} fill="url(#priceGradient)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="flex gap-6 mt-4 text-sm">
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
      </SectionCard>

      {/* NEW: Stock Return vs Market Return */}
      <SectionCard
        title="Retorno: Ação vs Ibovespa"
        subtitle="data-to-viz: Diverging Bar — eixo central em 0% mostra outperformance/underperformance claramente"
      >
        <ReturnComparisonChart data={data.returnComparison} />
        <div className="mt-3 p-3 rounded-lg bg-neutral-50 text-sm text-neutral-600">
          <strong>Leitura:</strong> Barras à direita do 0 = retorno positivo. Quando a ação (roxo) ultrapassa o mercado (cinza), há outperformance.
          Em horizontes curtos ({data.returnComparison[0].period}–{data.returnComparison[2].period}) a ação está underperformando,
          mas em 5 anos supera o Ibovespa.
        </div>
      </SectionCard>

      {/* Timeline Events */}
      <SectionCard title="Eventos Recentes" subtitle="data-to-viz: Timeline vertical com impacto color-coded">
        <EventTimeline events={data.timelineEvents.slice(0, 4)} />
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
      {/* Dimension Header */}
      <div className="bg-white rounded-2xl border border-neutral-200 p-6">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${COLORS.value}15` }}>
              <DollarSign className="w-5 h-5" style={{ color: COLORS.value }} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-neutral-900">Valor (Valuation)</h2>
              <p className="text-sm text-neutral-500">{dim.summary}</p>
            </div>
          </div>
          <ScoreBar score={dim.score} color={COLORS.value} />
        </div>
        <CheckList checks={dim.checks} />
      </div>

      {/* BULLET CHART — Fair Value (replaces gauge/progress bar) */}
      <SectionCard
        title="DCF — Valor Justo vs Preço Atual"
        subtitle="data-to-viz: Bullet Chart — posição é o encoding mais preciso. Faixas mostram cenários."
      >
        <div className="flex items-center gap-8 mb-6">
          <div className="text-center">
            <div className="text-sm text-neutral-500 mb-1">Preço Atual</div>
            <div className="text-3xl font-bold text-neutral-900">R$ {v.currentPrice.toFixed(2)}</div>
          </div>
          <div className="flex-shrink-0">
            <div className="w-16 h-16 rounded-full flex items-center justify-center bg-green-50 border-2 border-green-200">
              <span className="text-lg font-bold text-green-700">{v.discountPercent.toFixed(0)}%</span>
            </div>
            <div className="text-xs text-green-600 text-center mt-1">abaixo</div>
          </div>
          <div className="text-center">
            <div className="text-sm text-neutral-500 mb-1">Valor Justo (DCF)</div>
            <div className="text-3xl font-bold text-green-700">R$ {v.fairValue.toFixed(2)}</div>
          </div>
        </div>

        <BulletChart
          value={v.currentPrice}
          target={v.fairValue}
          ranges={[data.priceScenarios[0].estimatedValue, v.currentPrice * 1.2, data.priceScenarios[2].estimatedValue]}
          label="Preço vs Valor Justo"
          unit=""
          domain={[0, data.priceScenarios[2].estimatedValue * 1.15]}
        />

        <div className="mt-4 grid grid-cols-3 gap-4 text-sm">
          <div className="p-3 rounded-lg bg-neutral-50">
            <div className="text-neutral-500">Modelo</div>
            <div className="font-semibold">{v.model}</div>
          </div>
          <div className="p-3 rounded-lg bg-neutral-50">
            <div className="text-neutral-500">Taxa de Desconto</div>
            <div className="font-semibold">{v.discountRate}%</div>
          </div>
          <div className="p-3 rounded-lg bg-neutral-50">
            <div className="text-neutral-500">Crescimento Terminal</div>
            <div className="font-semibold">{v.terminalGrowthRate}%</div>
          </div>
        </div>
      </SectionCard>

      {/* DUMBBELL CHART — Price Scenarios */}
      <SectionCard
        title="Cenários de Preço"
        subtitle="data-to-viz: Dumbbell/Range Chart — mostra distância entre preço atual e cenários"
      >
        <DumbbellScenarios
          scenarios={data.priceScenarios.map(s => ({ label: s.label, value: s.estimatedValue, gap: s.gapVsCurrent }))}
          currentPrice={v.currentPrice}
        />
      </SectionCard>

      {/* FCF with trend line — data-to-viz: bar + line combo for series */}
      <SectionCard
        title="Fluxo de Caixa Livre Projetado (10 anos)"
        subtitle="data-to-viz: BarChart com linha de tendência (não barras puras para série temporal)"
      >
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={v.projectedFCF}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
              <XAxis dataKey="year" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} tickFormatter={(val: any) => formatNumber(Number(val))} />
              <Tooltip formatter={fmtBRLM('FCF')} />
              <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                {v.projectedFCF.map((_, idx) => (
                  <Cell key={idx} fill={idx < 3 ? COLORS.value : '#a5b4fc'} fillOpacity={1 - idx * 0.05} />
                ))}
              </Bar>
              <Line type="monotone" dataKey="value" stroke="#1e1b4b" strokeWidth={1.5} strokeDasharray="4 4" dot={false} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </SectionCard>

      {/* LOLLIPOP CHARTS — PE and PB comparison (replaces horizontal bars) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <SectionCard
          title="P/L — Comparação"
          subtitle="data-to-viz: Lollipop > barras (evita efeito Moiré, caveat #33)"
        >
          <LollipopComparison
            items={[
              { name: data.company.ticker, value: rv.peRatio, color: COLORS.value, isHighlight: true },
              { name: 'Indústria', value: rv.peIndustry, color: '#a5b4fc' },
              { name: 'Mercado', value: rv.peMarket, color: '#c7d2fe' },
            ]}
          />
          <div className="mt-4 p-3 rounded-lg bg-green-50 text-sm text-green-700">
            P/L de {rv.peRatio}x está abaixo da média do mercado ({rv.peMarket}x) e da indústria ({rv.peIndustry}x).
          </div>
        </SectionCard>

        <SectionCard
          title="P/VP — Comparação"
          subtitle="data-to-viz: Lollipop horizontal — labels legíveis sem rotação"
        >
          <LollipopComparison
            items={[
              { name: data.company.ticker, value: rv.pbRatio, color: COLORS.value, isHighlight: true },
              { name: 'Indústria', value: rv.pbIndustry, color: '#a5b4fc' },
            ]}
          />
          <div className="mt-4 p-3 rounded-lg bg-green-50 text-sm text-green-700">
            P/VP de {rv.pbRatio}x está abaixo da média da indústria ({rv.pbIndustry}x).
          </div>
        </SectionCard>
      </div>

      {/* DISTRIBUTION HISTOGRAMS */}
      <SectionCard
        title="Distribuição de Múltiplos no Setor"
        subtitle="data-to-viz: Histogram com marcadores — mostra posição da empresa na distribuição"
      >
        <div className="space-y-6">
          {data.distributions.map((dist) => (
            <div key={dist.metric}>
              <h4 className="text-sm font-semibold text-neutral-700 mb-2">{dist.metric}</h4>
              <DistributionHistogram distribution={dist} />
            </div>
          ))}
        </div>
      </SectionCard>

      {/* BULLET CHART — PEG Ratio (replaces gauge) */}
      <SectionCard
        title="PEG Ratio"
        subtitle="data-to-viz: Bullet Chart substitui gauge (encoding por área é impreciso, caveat #24)"
      >
        <BulletChart
          value={rv.pegRatio}
          target={1.0}
          ranges={[0.5, 1.0, 2.0]}
          label="PEG Ratio"
          domain={[0, 2.5]}
        />
        <p className="mt-3 text-sm text-neutral-600">
          Um PEG entre 0 e 1 indica que a ação pode estar subvalorizada considerando seu crescimento.
          Valor atual de {rv.pegRatio} sugere {rv.pegRatio <= 1 ? 'boa relação preço/crescimento' : 'preço acima do crescimento esperado'}.
        </p>
      </SectionCard>

      {/* SENSITIVITY — Horizontal Lollipop */}
      <SectionCard
        title="Sensibilidade da Estimativa"
        subtitle="data-to-viz: Lollipop horizontal ordenado por impacto — regra #1: sempre ordenar dados"
      >
        <SensitivityChart drivers={data.sensitivityDrivers} />
      </SectionCard>

      {/* NEW: DCF Sensitivity Heatmap */}
      <SectionCard
        title="Matriz de Sensibilidade DCF"
        subtitle="data-to-viz: Heatmap — ideal para matriz numérica. Cor codifica fair value vs preço atual."
      >
        <DCFSensitivityHeatmap
          cells={data.dcfSensitivity}
          currentPrice={data.valuation.currentPrice}
          baseWacc={data.valuation.discountRate}
          baseGrowth={data.valuation.terminalGrowthRate}
        />
        <p className="mt-3 text-sm text-neutral-600">
          A célula destacada é o cenário base (WACC {data.valuation.discountRate}%, crescimento terminal {data.valuation.terminalGrowthRate}%).
          Verde = fair value acima do preço atual de R$ {data.valuation.currentPrice.toFixed(2)}.
        </p>
      </SectionCard>

      {/* NEW: Ratio Trends Small Multiples */}
      <SectionCard
        title="Evolução de Múltiplos (5 anos)"
        subtitle="data-to-viz: Small Multiples evitam spaghetti chart (caveat #3) — 1 mini gráfico por métrica"
      >
        <RatioTrendSmallMultiples trends={data.ratioTrends} />
        <p className="mt-3 text-sm text-neutral-600">
          Linha contínua = empresa, linha tracejada = média da indústria. Quando a linha da empresa está abaixo, indica desconto relativo.
        </p>
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
      <div className="bg-white rounded-2xl border border-neutral-200 p-6">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${COLORS.future}15` }}>
              <TrendingUp className="w-5 h-5" style={{ color: COLORS.future }} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-neutral-900">Crescimento Futuro</h2>
              <p className="text-sm text-neutral-500">{dim.summary}</p>
            </div>
          </div>
          <ScoreBar score={dim.score} color={COLORS.future} />
        </div>
        <CheckList checks={dim.checks} />
      </div>

      {/* Growth Rate Comparison — Lollipop */}
      <SectionCard
        title="Taxas de Crescimento — Empresa vs Mercado"
        subtitle="data-to-viz: Lollipop pareado — comparação direta sem barras redundantes"
      >
        <div className="grid grid-cols-2 gap-8">
          <div>
            <h4 className="text-sm font-medium text-neutral-500 mb-4">Crescimento de Lucro (a.a.)</h4>
            <LollipopComparison
              items={[
                { name: data.company.ticker, value: g.earningsGrowthRate, color: COLORS.future, isHighlight: true },
                { name: 'Mercado', value: g.marketEarningsGrowth, color: '#94a3b8' },
              ]}
            />
          </div>
          <div>
            <h4 className="text-sm font-medium text-neutral-500 mb-4">Crescimento de Receita (a.a.)</h4>
            <LollipopComparison
              items={[
                { name: data.company.ticker, value: g.revenueGrowthRate, color: COLORS.future, isHighlight: true },
                { name: 'Mercado', value: g.marketRevenueGrowth, color: '#94a3b8' },
              ]}
            />
          </div>
        </div>
      </SectionCard>

      {/* Earnings Forecast — Bar + Reference Line for historical/forecast split */}
      <SectionCard
        title="Projeção de Lucro Líquido"
        subtitle="data-to-viz: BarChart com cores distintas histório/forecast + separador visual"
      >
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={g.earningsSeries}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
              <XAxis dataKey="year" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} tickFormatter={(val: any) => formatNumber(Number(val))} />
              <Tooltip formatter={fmtBRLM('Lucro')} />
              <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                {g.earningsSeries.map((entry, idx) => (
                  <Cell
                    key={idx}
                    fill={entry.type === 'historical' ? COLORS.historical : COLORS.forecast}
                    strokeDasharray={entry.type === 'forecast' ? '4 2' : undefined}
                    stroke={entry.type === 'forecast' ? COLORS.historical : undefined}
                    strokeWidth={entry.type === 'forecast' ? 1 : 0}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="flex items-center gap-4 mt-2 text-xs text-neutral-500">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded" style={{ backgroundColor: COLORS.historical }} />
            <span>Histórico</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded border border-blue-400" style={{ backgroundColor: COLORS.forecast }} />
            <span>Projetado (consensus)</span>
          </div>
        </div>
      </SectionCard>

      {/* Revenue Forecast */}
      <SectionCard title="Projeção de Receita">
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={g.revenueSeries}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
              <XAxis dataKey="year" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} tickFormatter={(val: any) => formatNumber(Number(val))} />
              <Tooltip formatter={fmtBRLM('Receita')} />
              <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                {g.revenueSeries.map((entry, idx) => (
                  <Cell key={idx} fill={entry.type === 'historical' ? '#10b981' : '#6ee7b7'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </SectionCard>

      {/* Future ROE — Bullet Chart (replaces gauge) */}
      <SectionCard
        title="ROE Estimado (3 anos)"
        subtitle="data-to-viz: Bullet Chart substitui barra de progresso circular/gauge"
      >
        <BulletChart
          value={g.futureROE}
          target={20}
          ranges={[10, 20, 40]}
          label="ROE estimado em 3 anos"
          unit="%"
          domain={[0, 45]}
        />
        <p className="mt-3 text-sm text-neutral-600">
          ROE de {g.futureROE}% {g.futureROE >= 20 ? 'está acima' : 'está abaixo'} do benchmark de 20%.
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
      <div className="bg-white rounded-2xl border border-neutral-200 p-6">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${COLORS.past}15` }}>
              <BarChart3 className="w-5 h-5" style={{ color: COLORS.past }} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-neutral-900">Performance Passada</h2>
              <p className="text-sm text-neutral-500">{dim.summary}</p>
            </div>
          </div>
          <ScoreBar score={dim.score} color={COLORS.past} />
        </div>
        <CheckList checks={dim.checks} />
      </div>

      {/* EPS — Area Chart (correct per data-to-viz for time series) */}
      <SectionCard title="Evolução do LPA (Lucro por Ação)" subtitle="data-to-viz: Area Chart — ideal para série temporal contínua">
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={p.epsSeries}>
              <defs>
                <linearGradient id="epsGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={COLORS.past} stopOpacity={0.2} />
                  <stop offset="95%" stopColor={COLORS.past} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
              <XAxis dataKey="year" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} tickFormatter={(val: any) => `R$${Number(val).toFixed(1)}`} />
              <Tooltip formatter={fmtBRL('LPA')} />
              <Area type="monotone" dataKey="value" stroke={COLORS.past} strokeWidth={2.5} fill="url(#epsGradient)" dot={{ r: 4, fill: COLORS.past }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </SectionCard>

      {/* ROE — Bar with benchmark (correct: categorical comparison per year) */}
      <SectionCard title="ROE — Retorno sobre Patrimônio Líquido" subtitle="data-to-viz: BarChart com Reference Line de benchmark — cor semântica (verde=bom)">
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={p.roeSeries}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
              <XAxis dataKey="year" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} tickFormatter={(val: any) => `${val}%`} />
              <Tooltip formatter={fmtPct('ROE')} />
              <ReferenceLine y={20} stroke="#ef4444" strokeDasharray="5 5" label={{ value: '20% benchmark', position: 'right', fontSize: 10, fill: '#ef4444' }} />
              <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                {p.roeSeries.map((entry, idx) => (
                  <Cell key={idx} fill={entry.value >= 20 ? COLORS.past : '#6ee7b7'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </SectionCard>

      {/* ROCE — Line Chart with confidence band */}
      <SectionCard title="ROCE — Retorno sobre Capital Empregado" subtitle="data-to-viz: Line Chart com benchmark — connected dots para tendência">
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={p.roceSeries}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
              <XAxis dataKey="year" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} tickFormatter={(val: any) => `${val}%`} />
              <Tooltip formatter={fmtPct('ROCE')} />
              <ReferenceLine y={20} stroke="#f59e0b" strokeDasharray="5 5" label={{ value: '20%', position: 'right', fontSize: 10, fill: '#f59e0b' }} />
              <Line type="monotone" dataKey="value" stroke={COLORS.past} strokeWidth={2.5} dot={{ r: 5, fill: COLORS.past, stroke: '#fff', strokeWidth: 2 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </SectionCard>

      {/* Key Metrics — KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'ROE Atual', value: `${p.currentROE}%`, color: p.currentROE >= 20 ? COLORS.positive : COLORS.negative },
          { label: 'ROCE Atual', value: `${p.currentROCE}%`, color: p.currentROCE >= 20 ? COLORS.positive : COLORS.health },
          { label: 'ROA Atual', value: `${p.currentROA}%`, color: p.currentROA >= p.industryROA ? COLORS.positive : COLORS.negative },
          { label: 'Cresc. LPA 5a', value: `${p.epsGrowth5y}% a.a.`, color: COLORS.past },
        ].map((m) => (
          <div key={m.label} className="bg-white rounded-xl border border-neutral-200 p-4 text-center">
            <div className="text-2xl font-bold" style={{ color: m.color }}>{m.value}</div>
            <div className="text-xs text-neutral-500 mt-1">{m.label}</div>
          </div>
        ))}
      </div>

      {/* NEW: Margin Evolution */}
      <SectionCard
        title="Evolução das Margens (5 anos)"
        subtitle="data-to-viz: Multi-line Area Chart — mostra 3 séries sem empilhar (cada margem tem significado independente)"
      >
        <MarginEvolution series={data.marginSeries} />
        <div className="mt-3 grid grid-cols-3 gap-3">
          {[
            { label: 'Margem Bruta', value: data.marginSeries[data.marginSeries.length - 1]?.grossMargin, color: '#10b981' },
            { label: 'Margem Operacional', value: data.marginSeries[data.marginSeries.length - 1]?.operatingMargin, color: '#3b82f6' },
            { label: 'Margem Líquida', value: data.marginSeries[data.marginSeries.length - 1]?.netMargin, color: '#8b5cf6' },
          ].map(m => (
            <div key={m.label} className="p-2 rounded-lg bg-neutral-50 text-center">
              <div className="text-lg font-bold" style={{ color: m.color }}>{m.value}%</div>
              <div className="text-[10px] text-neutral-500">{m.label} (atual)</div>
            </div>
          ))}
        </div>
      </SectionCard>

      {/* NEW: ROE/ROCE/ROA Comparative */}
      <SectionCard
        title="Comparação de Retornos: Empresa vs Benchmark"
        subtitle="data-to-viz: Lollipop Chart agrupado — compara 3 métricas de retorno contra benchmarks"
      >
        <LollipopComparison
          items={[
            { name: `ROE (${p.currentROE}%)`, value: p.currentROE, color: p.currentROE >= 20 ? COLORS.positive : COLORS.negative, isHighlight: true },
            { name: 'ROE benchmark', value: 20, color: '#94a3b8' },
            { name: `ROCE (${p.currentROCE}%)`, value: p.currentROCE, color: p.currentROCE >= 20 ? COLORS.positive : COLORS.health, isHighlight: true },
            { name: 'ROCE benchmark', value: 20, color: '#94a3b8' },
            { name: `ROA (${p.currentROA}%)`, value: p.currentROA, color: p.currentROA >= p.industryROA ? COLORS.positive : COLORS.negative, isHighlight: true },
            { name: `ROA indústria (${p.industryROA}%)`, value: p.industryROA, color: '#94a3b8' },
          ]}
        />
      </SectionCard>
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
      <div className="bg-white rounded-2xl border border-neutral-200 p-6">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${COLORS.health}15` }}>
              <Shield className="w-5 h-5" style={{ color: COLORS.health }} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-neutral-900">Saúde Financeira</h2>
              <p className="text-sm text-neutral-500">{dim.summary}</p>
            </div>
          </div>
          <ScoreBar score={dim.score} color={COLORS.health} />
        </div>
        <CheckList checks={dim.checks} />
      </div>

      {/* Assets vs Liabilities — GROUPED BAR (data-to-viz: grouped bar for paired comparison) */}
      <SectionCard
        title="Ativos vs Passivos"
        subtitle="data-to-viz: Barras agrupadas — comparação direta entre pares (caveat #25: barras próximas)"
      >
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={balanceGrouped} barCategoryGap="25%">
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 11 }} tickFormatter={(val: any) => formatNumber(Number(val))} />
              <Tooltip formatter={fmtBRLM('')} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Bar name="Ativos" dataKey="ativos" fill="#22c55e" radius={[4, 4, 0, 0]} />
              <Bar name="Passivos" dataKey="passivos" fill="#ef4444" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-3 grid grid-cols-2 gap-4">
          <div className="p-3 rounded-lg bg-green-50">
            <div className="text-sm text-green-700 font-medium">Total Ativos</div>
            <div className="text-lg font-bold text-green-800">
              R$ {formatNumber(h.assetsVsLiabilities.shortTermAssets + h.assetsVsLiabilities.longTermAssets)}M
            </div>
          </div>
          <div className="p-3 rounded-lg bg-red-50">
            <div className="text-sm text-red-700 font-medium">Total Passivos</div>
            <div className="text-lg font-bold text-red-800">
              R$ {formatNumber(h.assetsVsLiabilities.shortTermLiabilities + h.assetsVsLiabilities.longTermLiabilities)}M
            </div>
          </div>
        </div>
      </SectionCard>

      {/* D/E Trend — Area Chart with danger zone */}
      <SectionCard title="Dívida/Patrimônio — Evolução (5 anos)" subtitle="data-to-viz: Area Chart com threshold — linha de referência contextualiza o dado">
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={h.debtToEquitySeries}>
              <defs>
                <linearGradient id="deGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={COLORS.health} stopOpacity={0.2} />
                  <stop offset="95%" stopColor={COLORS.health} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
              <XAxis dataKey="year" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} tickFormatter={(val: any) => `${val}%`} />
              <Tooltip formatter={fmtPct('D/E')} />
              <ReferenceLine y={40} stroke="#ef4444" strokeDasharray="5 5" label={{ value: '40% limite', position: 'right', fontSize: 10, fill: '#ef4444' }} />
              <Area type="monotone" dataKey="value" stroke={COLORS.health} strokeWidth={2.5} fill="url(#deGradient)" dot={{ r: 4, fill: COLORS.health }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-3 p-3 rounded-lg bg-green-50 text-sm text-green-700">
          D/E caiu de {h.debtToEquity5yAgo}% para {h.debtToEquity}% nos últimos 5 anos — tendência positiva.
        </div>
      </SectionCard>

      {/* Coverage Metrics — Bullet Charts (replaces progress bars) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <SectionCard title="Cobertura de Dívida (FCO/Dívida)" subtitle="data-to-viz: Bullet Chart">
          <BulletChart
            value={Math.round((h.operatingCashFlow / h.totalDebt) * 100)}
            target={20}
            ranges={[10, 20, 50]}
            label="FCO / Dívida Total"
            unit="%"
            domain={[0, 60]}
          />
        </SectionCard>

        <SectionCard title="Cobertura de Juros (EBIT/Juros)" subtitle="data-to-viz: Bullet Chart">
          <BulletChart
            value={Number((h.ebit / h.interestExpense).toFixed(1))}
            target={5}
            ranges={[2, 5, 15]}
            label="EBIT / Despesa de Juros"
            unit="x"
            domain={[0, 16]}
          />
        </SectionCard>
      </div>

      {/* NEW: Beta Risk Profile */}
      <SectionCard
        title="Perfil de Risco (Beta)"
        subtitle="data-to-viz: Bullet Chart — mostra volatilidade relativa ao mercado (beta=1 é o benchmark)"
      >
        <BulletChart
          value={data.priceHistory.volatilityBeta}
          target={1.0}
          ranges={[0.5, 1.0, 2.0]}
          label="Beta (volatilidade vs Ibovespa)"
          domain={[0, 2.5]}
        />
        <p className="mt-3 text-sm text-neutral-600">
          Beta de <strong>{data.priceHistory.volatilityBeta}</strong> indica que a ação é{' '}
          {data.priceHistory.volatilityBeta > 1.2 ? 'significativamente mais volátil' :
           data.priceHistory.volatilityBeta > 1.0 ? 'ligeiramente mais volátil' :
           data.priceHistory.volatilityBeta > 0.8 ? 'próxima' : 'menos volátil'}
          {' '}que o Ibovespa. Beta {'>'} 1 amplifica movimentos de mercado (risco e retorno).
        </p>
      </SectionCard>
    </div>
  );
}

// ─── Dividend Tab ────────────────────────────────────────────────────────────

function DividendTab({ data }: { data: AnalysisData }) {
  const dim = data.snowflake.find(d => d.dimension === 'dividend')!;
  const d = data.dividend;

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-neutral-200 p-6">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${COLORS.dividend}15` }}>
              <DollarSign className="w-5 h-5" style={{ color: COLORS.dividend }} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-neutral-900">Dividendos</h2>
              <p className="text-sm text-neutral-500">{dim.summary}</p>
            </div>
          </div>
          <ScoreBar score={dim.score} color={COLORS.dividend} />
        </div>
        <CheckList checks={dim.checks} />
      </div>

      {/* Yield — Bullet Chart with market percentiles (replaces gauge) */}
      <SectionCard
        title="Dividend Yield — Posição no Mercado"
        subtitle="data-to-viz: Bullet Chart com faixas de percentil — substitui gauge (encoding por posição > ângulo)"
      >
        <div className="flex items-center gap-6 mb-4">
          <div className="text-center">
            <div className="text-4xl font-bold" style={{ color: COLORS.dividend }}>
              {d.currentYield}%
            </div>
            <div className="text-sm text-neutral-500 mt-1">Yield atual</div>
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

      {/* Dividend History — Bar with color-coded drops */}
      <SectionCard title="Histórico de Dividendos por Ação (10 anos)" subtitle="data-to-viz: BarChart com cor semântica — vermelho = queda >10% (caveat #17: cor = informação)">
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={d.dividendSeries}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
              <XAxis dataKey="year" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} tickFormatter={(val: any) => `R$${Number(val).toFixed(1)}`} />
              <Tooltip formatter={fmtBRL('DPA')} />
              <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                {d.dividendSeries.map((entry, idx) => {
                  const prevValue = idx > 0 ? d.dividendSeries[idx - 1].value : entry.value;
                  const dropped = entry.value < prevValue * 0.9;
                  return <Cell key={idx} fill={dropped ? '#ef4444' : COLORS.dividend} />;
                })}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        {!d.isStable && (
          <div className="mt-3 p-3 rounded-lg bg-amber-50 text-sm text-amber-700">
            Atenção: houve queda superior a 10% em algum dos últimos 10 anos, indicando instabilidade.
          </div>
        )}
      </SectionCard>

      {/* Payout Ratio — Area with danger zone */}
      <SectionCard title="Payout Ratio — Evolução" subtitle="data-to-viz: Area Chart com zona de perigo">
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={d.payoutSeries}>
              <defs>
                <linearGradient id="payoutGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={COLORS.dividend} stopOpacity={0.2} />
                  <stop offset="95%" stopColor={COLORS.dividend} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
              <XAxis dataKey="year" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} tickFormatter={(val: any) => `${val}%`} domain={[0, 100]} />
              <Tooltip formatter={fmtPct('Payout')} />
              <ReferenceLine y={90} stroke="#ef4444" strokeDasharray="5 5" label={{ value: '90% limite', position: 'right', fontSize: 10, fill: '#ef4444' }} />
              <Area type="monotone" dataKey="value" stroke={COLORS.dividend} strokeWidth={2.5} fill="url(#payoutGradient)" dot={{ r: 4, fill: COLORS.dividend }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-3 grid grid-cols-2 gap-4">
          <div className="p-3 rounded-lg bg-green-50">
            <div className="text-sm text-green-700 font-medium">Payout Atual</div>
            <div className="text-lg font-bold text-green-800">{d.payoutRatio}%</div>
          </div>
          <div className={`p-3 rounded-lg ${d.futurePayoutRatio <= 90 ? 'bg-green-50' : 'bg-red-50'}`}>
            <div className={`text-sm font-medium ${d.futurePayoutRatio <= 90 ? 'text-green-700' : 'text-red-700'}`}>Payout Estimado (3a)</div>
            <div className={`text-lg font-bold ${d.futurePayoutRatio <= 90 ? 'text-green-800' : 'text-red-800'}`}>{d.futurePayoutRatio}%</div>
          </div>
        </div>
      </SectionCard>

      {/* NEW: Dividend vs Earnings sustainability */}
      <SectionCard
        title="Dividendo vs Lucro por Ação (10 anos)"
        subtitle="data-to-viz: Grouped Bar — mostra se o lucro cobre o dividendo (sustentabilidade)"
      >
        <DividendVsEarningsChart data={data.dividendVsEarnings} />
        <div className="mt-3 p-3 rounded-lg bg-blue-50 text-sm text-blue-800">
          <strong>Como ler:</strong> A barra azul (LPA) deve sempre ser maior que a roxa (DPA).
          Quando o dividendo se aproxima do lucro, o payout fica insustentável.
          Em anos de lucro extraordinário (ex: 2021), dividendos sobem mas podem recuar depois.
        </div>
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
        subtitle="data-to-viz: Stacked Horizontal Bar substitui Pie Chart — humanos leem posição/comprimento melhor que ângulo (caveat #4)"
      >
        <StackedOwnershipBar items={ownershipItems} />
      </SectionCard>

      {/* Top Shareholders — Table (best for precise values per data-to-viz) */}
      <SectionCard title="Maiores Acionistas" subtitle="data-to-viz: Tabela para valores precisos — gráficos não substituem dados exatos">
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
        subtitle="data-to-viz: Diverging Bar — saldo positivo (verde) = insiders comprando mais que vendendo"
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
      case 'overview': return <OverviewTab data={data} />;
      case 'value': return <ValueTab data={data} />;
      case 'future': return <FutureTab data={data} />;
      case 'past': return <PastTab data={data} />;
      case 'health': return <HealthTab data={data} />;
      case 'dividend': return <DividendTab data={data} />;
      case 'ownership': return <OwnershipTab data={data} />;
      default: return <OverviewTab data={data} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Top Bar */}
      <div className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-neutral-200">
        <div className="max-w-6xl mx-auto px-4 py-3">
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

      {/* Tab Navigation */}
      <div className="sticky top-[57px] z-20 bg-white border-b border-neutral-200">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex gap-1 overflow-x-auto py-1 -mb-px">
            {TABS.map((tab) => {
              const isActive = activeTab === tab.id;
              const dim = data.snowflake.find(d => d.dimension === tab.id);
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg transition-all whitespace-nowrap ${
                    isActive
                      ? 'bg-neutral-900 text-white'
                      : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
                  }`}
                >
                  {tab.icon}
                  {tab.label}
                  {dim && (
                    <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                      isActive ? 'bg-white/20 text-white' : 'bg-neutral-100 text-neutral-500'
                    }`}>
                      {dim.score}/6
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <div className="max-w-6xl mx-auto px-4 py-6">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          {renderTab()}
        </motion.div>
      </div>

      {/* Footer */}
      <div className="max-w-6xl mx-auto px-4 py-8 border-t border-neutral-200 mt-8">
        <div className="flex items-start gap-3 p-4 rounded-xl bg-blue-50 border border-blue-100">
          <Info className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-blue-800">
            <p className="font-medium mb-1">Sobre este modelo</p>
            <p>
              Análise baseada no modelo SimplyWall.St com 30 checks (6 por dimensão) em 5 eixos:
              Valor, Crescimento Futuro, Performance Passada, Saúde Financeira e Dividendos.
              Gráficos otimizados conforme recomendações do <strong>data-to-viz.com</strong>.
              Os dados apresentados são <strong>mocks para demonstração</strong> e não constituem recomendação de investimento.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

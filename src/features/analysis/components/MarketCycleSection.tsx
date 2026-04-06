'use client';

import React, { useState } from 'react';
import type { MarketCycle, MarketCyclePhase } from '../interfaces';
import { CYCLE_PHASE_COLORS, ALIGNMENT_CONFIG } from '../constants/colors';

// ─── Phase metadata ──────────────────────────────────────────────────────────

const PHASE_META: Record<MarketCyclePhase, { label: string; hint: string }> = {
  RECOVERY: {
    label: 'Recupera\u00e7\u00e3o',
    hint: 'Crescimento acima da tend\u00eancia e infla\u00e7\u00e3o caindo. Juros em queda estimulam cr\u00e9dito. Setores c\u00edclicos e financeiro lideram.',
  },
  OVERHEAT: {
    label: 'Superaquecimento',
    hint: 'Crescimento forte com infla\u00e7\u00e3o subindo. BC eleva juros. Commodities e ativos reais se valorizam.',
  },
  STAGFLATION: {
    label: 'Estagfla\u00e7\u00e3o',
    hint: 'Crescimento fraco e infla\u00e7\u00e3o alta. Cen\u00e1rio mais dif\u00edcil. Setores defensivos oferecem prote\u00e7\u00e3o.',
  },
  REFLATION: {
    label: 'Refla\u00e7\u00e3o',
    hint: 'Economia fraca, mas infla\u00e7\u00e3o cede. Espa\u00e7o para cortes de juros. Fase de transi\u00e7\u00e3o para recupera\u00e7\u00e3o.',
  },
};

const PHASE_ORDER: MarketCyclePhase[] = ['RECOVERY', 'OVERHEAT', 'STAGFLATION', 'REFLATION'];

// ─── Cycle Clock SVG ─────────────────────────────────────────────────────────

function CycleClockSVG({ currentPhase }: { currentPhase: MarketCyclePhase }) {
  const [hovered, setHovered] = useState<MarketCyclePhase | null>(null);

  const width = 340;
  const height = 280;
  const cx = width / 2;
  const cy = height / 2;
  const r = 95;

  // Arc angles (SVG: 0°=right, clockwise) + label position (% of container)
  const quadrants: Record<MarketCyclePhase, {
    startDeg: number; endDeg: number;
    lx: number; ly: number;          // SVG label coords
    tipX: string; tipY: string;      // CSS tooltip position (%)
    tipAlign: 'left' | 'right';      // tooltip alignment
  }> = {
    RECOVERY:    { startDeg: 180, endDeg: 270, lx: cx - 47, ly: cy - 38, tipX: '2%',  tipY: '2%',  tipAlign: 'left' },
    OVERHEAT:    { startDeg: 270, endDeg: 360, lx: cx + 47, ly: cy - 38, tipX: '52%', tipY: '2%',  tipAlign: 'right' },
    STAGFLATION: { startDeg: 0,   endDeg: 90,  lx: cx + 47, ly: cy + 45, tipX: '52%', tipY: '55%', tipAlign: 'right' },
    REFLATION:   { startDeg: 90,  endDeg: 180, lx: cx - 47, ly: cy + 45, tipX: '2%',  tipY: '55%', tipAlign: 'left' },
  };

  const toRad = (deg: number) => (deg * Math.PI) / 180;

  return (
    <div className="relative w-full max-w-[380px] mx-auto">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full" role="img" aria-label={`Rel\u00f3gio do ciclo de mercado - fase atual: ${PHASE_META[currentPhase].label}`}>
        {/* Quadrant fills + labels */}
        {PHASE_ORDER.map((phase) => {
          const isActive = phase === currentPhase;
          const isHovered = hovered === phase;
          const color = CYCLE_PHASE_COLORS[phase];
          const q = quadrants[phase];

          const x1 = cx + r * Math.cos(toRad(q.startDeg));
          const y1 = cy + r * Math.sin(toRad(q.startDeg));
          const x2 = cx + r * Math.cos(toRad(q.endDeg));
          const y2 = cy + r * Math.sin(toRad(q.endDeg));

          return (
            <g
              key={phase}
              className="cursor-pointer"
              onMouseEnter={() => setHovered(phase)}
              onMouseLeave={() => setHovered(null)}
            >
              <path
                d={`M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 0 1 ${x2} ${y2} Z`}
                fill={isActive ? color : isHovered ? color : '#D1D5DB'}
                opacity={isActive ? 0.45 : isHovered ? 0.25 : 0.12}
                stroke={isActive ? color : 'transparent'}
                strokeWidth={isActive ? 1.5 : 0}
                strokeOpacity={isActive ? 0.4 : 0}
                className="transition-all duration-300"
              />
              {(() => {
                const label = PHASE_META[phase].label;
                const fontSize = isActive ? 11.5 : 10;
                const fill = isActive || isHovered ? color : '#6B7280';
                const op = isActive ? 1 : isHovered ? 0.9 : 0.6;
                const fw = isActive || isHovered ? 700 : 600;
                // Break labels longer than 12 chars
                const LABEL_BREAKS: Record<string, string[]> = {
                  'Superaquecimento': ['Super-', 'aquecimento'],
                };
                const lines = LABEL_BREAKS[label] ?? [label];
                const lineHeight = fontSize * 1.3;
                const startY = q.ly - ((lines.length - 1) * lineHeight) / 2;
                return (
                  <text
                    textAnchor="middle"
                    style={{ fontSize, fontWeight: fw, letterSpacing: '-0.01em' }}
                    className="transition-all duration-200 pointer-events-none"
                    fill={fill}
                    opacity={op}
                  >
                    {lines.map((line, i) => (
                      <tspan key={i} x={q.lx} y={startY + i * lineHeight}>{line}</tspan>
                    ))}
                  </text>
                );
              })()}
            </g>
          );
        })}

        {/* Axis lines */}
        <line x1={cx} y1={cy - r} x2={cx} y2={cy + r} stroke="#D1D5DB" className="pointer-events-none" strokeWidth="1.25" />
        <line x1={cx - r} y1={cy} x2={cx + r} y2={cy} stroke="#D1D5DB" className="pointer-events-none" strokeWidth="1.25" />


        {/* Outer circle */}
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="#D1D5DB" className="pointer-events-none" strokeWidth="1.75" />

        {/* Axis labels */}
        <text x={cx} y={18} textAnchor="middle" className="pointer-events-none" style={{ fontSize: 9.5, fontWeight: 600, fill: '#6B7280' }}>Crescimento ↑</text>
        <text x={cx} y={height - 6} textAnchor="middle" className="pointer-events-none" style={{ fontSize: 9.5, fontWeight: 600, fill: '#6B7280' }}>Crescimento ↓</text>
        <text x={width - 8} y={cy + 4} textAnchor="end" className="pointer-events-none" style={{ fontSize: 9.5, fontWeight: 600, fill: '#6B7280' }}>Inflação ↑</text>
        <text x={8} y={cy + 4} textAnchor="start" className="pointer-events-none" style={{ fontSize: 9.5, fontWeight: 600, fill: '#6B7280' }}>Inflação ↓</text>
      </svg>

      {/* Tooltip card */}
      {hovered && (() => {
        const q = quadrants[hovered];
        const color = CYCLE_PHASE_COLORS[hovered];
        return (
          <div
            className="absolute z-10 w-[46%] rounded-lg border border-border bg-card shadow-lg px-3 py-2.5 pointer-events-none animate-in fade-in duration-150"
            style={{ left: q.tipX, top: q.tipY }}
          >
            <div className="flex items-center gap-1.5 mb-1">
              <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
              <span className="text-[11px] font-bold" style={{ color }}>{PHASE_META[hovered].label}</span>
            </div>
            <p className="text-[10px] text-muted-foreground leading-relaxed">{PHASE_META[hovered].hint}</p>
          </div>
        );
      })()}
    </div>
  );
}

// ─── Macro Indicator Cards ───────────────────────────────────────────────────

function TrendArrow({ direction }: { direction: 'up' | 'down' | 'stable' }) {
  if (direction === 'stable') {
    return (
      <svg className="w-3.5 h-3.5 text-muted-foreground" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 8h10" />
      </svg>
    );
  }
  const isUp = direction === 'up';
  return (
    <svg className={`w-3.5 h-3.5 ${isUp ? 'text-danger-text' : 'text-success-text'}`} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d={isUp ? 'M8 12V4M4 8l4-4 4 4' : 'M8 4v8M4 8l4 4 4-4'} />
    </svg>
  );
}

function MacroIndicatorCards({ indicators, selicStatus, inflationStatus }: {
  indicators: MarketCycle['indicators'];
  selicStatus: MarketCycle['selicStatus'];
  inflationStatus: MarketCycle['inflationStatus'];
}) {
  const selicDir = selicStatus === 'RISING' ? 'up' : selicStatus === 'FALLING' ? 'down' : 'stable';
  const ipcaDir = inflationStatus === 'RISING' ? 'up' : 'down';
  const ibcDir = indicators.ibcBrYoy > indicators.ibcBrTrend ? 'up' : 'down';

  const cards = [
    {
      label: 'Selic',
      value: `${indicators.selicCurrent.toFixed(2)}%`,
      sub: `${indicators.selic6mAgo.toFixed(2)}% h\u00e1 6m`,
      direction: selicDir as 'up' | 'down' | 'stable',
    },
    {
      label: 'IPCA 12m',
      value: `${indicators.ipca12m.toFixed(2)}%`,
      sub: `${indicators.ipca12m3mAgo.toFixed(2)}% h\u00e1 3m`,
      direction: ipcaDir as 'up' | 'down',
    },
    {
      label: 'IBC-Br YoY',
      value: `${indicators.ibcBrYoy >= 0 ? '+' : ''}${indicators.ibcBrYoy.toFixed(1)}%`,
      sub: `Tend\u00eancia: ${indicators.ibcBrTrend >= 0 ? '+' : ''}${indicators.ibcBrTrend.toFixed(1)}%`,
      direction: ibcDir as 'up' | 'down',
    },
  ];

  return (
    <div className="grid grid-cols-3 gap-3">
      {cards.map((c) => (
        <div key={c.label} className="bg-muted/50 rounded-lg px-3 py-3 flex flex-col items-center">
          <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">{c.label}</span>
          <div className="relative mt-1.5">
            <span className="text-[17px] font-semibold text-foreground tabular-nums">{c.value}</span>
            <span className="absolute -right-5 top-1/2 -translate-y-1/2">
              <TrendArrow direction={c.direction} />
            </span>
          </div>
          <span className="text-[10px] text-muted-foreground mt-1">{c.sub}</span>
        </div>
      ))}
    </div>
  );
}

// ─── Confidence Badge ────────────────────────────────────────────────────────

function SelicSignalBadge({ confidence }: { confidence: string }) {
  const cfg: Record<string, { label: string; color: string; bg: string }> = {
    high:   { label: 'Selic confirma a fase', color: '#2D9F6F', bg: '#F0FDF4' },
    medium: { label: 'Selic ainda neutra',    color: '#8A8F9C', bg: '#F3F4F6' },
    low:    { label: 'Selic contradiz a fase', color: '#D4913B', bg: '#FFFBEB' },
  };
  const c = cfg[confidence] ?? cfg.medium;
  return (
    <span
      className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full"
      style={{ color: c.color, backgroundColor: c.bg }}
    >
      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: c.color }} />
      {c.label}
    </span>
  );
}

// ─── Sector Alignment Card ───────────────────────────────────────────────────

function SectorAlignmentCard({ ticker, sectorAlignment }: {
  ticker: string;
  sectorAlignment: MarketCycle['sectorAlignment'];
}) {
  const cfg = ALIGNMENT_CONFIG[sectorAlignment.alignment] ?? ALIGNMENT_CONFIG.NEUTRAL;

  return (
    <div className="rounded-lg border border-border overflow-hidden">
      <div className="px-4 py-3 flex items-center justify-between" style={{ backgroundColor: cfg.bg }}>
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-[12px] font-semibold text-foreground font-mono">{ticker}</span>
          <span className="text-[11px] text-muted-foreground">&mdash;</span>
          <span className="text-[11px] text-muted-foreground truncate">{sectorAlignment.sector}</span>
        </div>
        <span
          className="inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full flex-shrink-0"
          style={{ color: cfg.color, backgroundColor: `color-mix(in srgb, ${cfg.color} 12%, transparent)` }}
        >
          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: cfg.color }} />
          {cfg.label} nesta fase
        </span>
      </div>
      <div className="px-4 py-3">
        <p className="text-[12px] text-muted-foreground leading-relaxed">{sectorAlignment.reason}</p>
      </div>
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────

export function MarketCycleSection({ marketCycle, ticker }: { marketCycle: MarketCycle; ticker: string }) {
  const phaseColor = CYCLE_PHASE_COLORS[marketCycle.phaseKey] ?? '#8A8F9C';

  return (
    <div className="analysis-card overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 md:px-7 flex items-center justify-between" style={{ backgroundColor: `color-mix(in srgb, ${phaseColor} 8%, transparent)` }}>
        <div className="flex items-center gap-3">
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: `color-mix(in srgb, ${phaseColor} 18%, transparent)` }}
          >
            {/* Clock icon */}
            <svg className="w-4 h-4" style={{ color: phaseColor }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
          </div>
          <div>
            <span className="text-[12px] font-semibold uppercase tracking-wide" style={{ color: phaseColor }}>
              Ciclo de Mercado
            </span>
            <p className="text-[10px] text-muted-foreground mt-0.5">
              Investment Clock &mdash; Merrill Lynch / BofA
            </p>
          </div>
        </div>
        <SelicSignalBadge confidence={marketCycle.confidence} />
      </div>

      {/* Body */}
      <div className="px-6 py-5 md:px-7 space-y-6">

        {/* Phase badge + Clock layout */}
        <div className="grid grid-cols-1 md:grid-cols-[380px_1fr] items-start gap-4 md:gap-8">
          {/* Clock SVG */}
          <div className="mx-auto md:mx-0">
            <CycleClockSVG currentPhase={marketCycle.phaseKey} />
          </div>

          {/* Phase info */}
          <div className="text-center md:text-left md:pt-4">
            <div className="flex items-center justify-center md:justify-start gap-2 mb-3">
              <span
                className="inline-flex items-center gap-1.5 text-[13px] font-bold px-3 py-1 rounded-lg"
                style={{ color: phaseColor, backgroundColor: `color-mix(in srgb, ${phaseColor} 12%, transparent)` }}
              >
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: phaseColor }} />
                {marketCycle.phaseLabel}
              </span>
            </div>
            <p className="text-[13px] text-muted-foreground leading-[1.75]">
              {marketCycle.description}
            </p>
          </div>
        </div>

        {/* Macro Indicators */}
        <MacroIndicatorCards
          indicators={marketCycle.indicators}
          selicStatus={marketCycle.selicStatus}
          inflationStatus={marketCycle.inflationStatus}
        />

        {/* Sector Alignment */}
        <SectorAlignmentCard ticker={ticker} sectorAlignment={marketCycle.sectorAlignment} />
      </div>

      {/* Footer meta */}
      <div className="px-6 py-3 md:px-7 border-t border-border">
        <span className="text-[10px] text-muted-foreground">{marketCycle.metaLine}</span>
      </div>
    </div>
  );
}

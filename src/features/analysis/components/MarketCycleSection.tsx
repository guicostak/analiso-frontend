'use client';

import React from 'react';
import type { MarketCycle, MarketCyclePhase } from '../interfaces';
import { CYCLE_PHASE_COLORS, ALIGNMENT_CONFIG } from '../constants/colors';
import { MarketCycleClock } from '@/src/components/shared/MarketCycleClock';


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
          {/* Clock SVG — usa o componente shared (mesmo da tela /mercado).
              Single source of truth pro Investment Clock — mudanças visuais
              propagam pra todas as telas. */}
          <div className="mx-auto md:mx-0">
            <MarketCycleClock currentPhase={marketCycle.phaseKey} maxWidth={380} />
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

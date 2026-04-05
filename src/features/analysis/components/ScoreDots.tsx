'use client';

/**
 * Score visual components:
 *
 * - ScoreChecks: row of ✓ and ✗ SVG icons (for section dividers, overview cards)
 * - ScoreIndicator: colored icon for sidebar (check/warning/x based on score)
 * - DimensionCheckCard: compact card with all 6 checks listed with ✓/✗
 * - getScoreColor / getScoreBg: shared helpers
 */

import React from 'react';
import type { DimensionScore } from '../interfaces';
import { DIMENSION_COLORS } from '../constants/colors';

/* ── Shared color helpers ────────────────────────────────────────────────── */

export function getScoreColor(score: number, total = 6): string {
  const ratio = score / total;
  if (ratio <= 0.25) return 'var(--danger-text)';
  if (ratio <= 0.5) return 'var(--warning-text)';
  return 'var(--success-text)';
}

export function getScoreBg(score: number, total = 6): string {
  const ratio = score / total;
  if (ratio <= 0.25) return 'var(--danger-surface)';
  if (ratio <= 0.5) return 'var(--warning-surface)';
  return 'var(--success-surface)';
}

/* ── SVG micro-icons ─────────────────────────────────────────────────────── */

function CheckIcon({ size = 12, color = 'currentColor' }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" style={{ color, flexShrink: 0 }}>
      <path d="M3.5 8.5L6.5 11.5L12.5 4.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function XIcon({ size = 12, color = 'currentColor' }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" style={{ color, flexShrink: 0 }}>
      <path d="M4.5 4.5L11.5 11.5M11.5 4.5L4.5 11.5" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
    </svg>
  );
}

/* ── ScoreChecks — row of ✓ and ✗ icons ──────────────────────────────────── */

interface ScoreChecksProps {
  score: number;
  total?: number;
  size?: 'xs' | 'sm' | 'md';
  showLabel?: boolean;
  className?: string;
}

const ICON_SIZES = { xs: 10, sm: 12, md: 14 };
const GAP_SIZES = { xs: 1, sm: 2, md: 3 };

export function ScoreChecks({
  score,
  total = 6,
  size = 'sm',
  showLabel = false,
  className = '',
}: ScoreChecksProps) {
  const iconPx = ICON_SIZES[size];
  const gap = GAP_SIZES[size];
  const labelColor = getScoreColor(score, total);

  return (
    <span className={`inline-flex items-center ${className}`} style={{ gap: showLabel ? 6 : gap }}>
      <span className="inline-flex items-center" style={{ gap }}>
        {Array.from({ length: total }, (_, i) => {
          const passed = i < score;
          return passed
            ? <CheckIcon key={i} size={iconPx} color="var(--success-text)" />
            : <XIcon key={i} size={iconPx} color="var(--danger-text)" />;
        })}
      </span>
      {showLabel && (
        <span className="tabular-nums whitespace-nowrap"
          style={{ fontSize: size === 'xs' ? 9 : size === 'sm' ? 10 : 11, color: labelColor }}>
          {score} de {total}
        </span>
      )}
    </span>
  );
}

/* ── ScoreIndicator — colored icon for sidebar ───────────────────────────── */

interface ScoreIndicatorProps {
  score: number;
  total?: number;
  size?: number;
}

export function ScoreIndicator({ score, total = 6, size = 14 }: ScoreIndicatorProps) {
  const ratio = score / total;

  // 0-25%: X icon red, 26-50%: warning triangle amber, 51-100%: check green
  if (ratio <= 0.25) {
    return (
      <svg width={size} height={size} viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0, color: 'var(--danger-text)' }}>
        <circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="1.25" opacity="0.3" />
        <path d="M5.75 5.75L10.25 10.25M10.25 5.75L5.75 10.25" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    );
  }

  if (ratio <= 0.5) {
    return (
      <svg width={size} height={size} viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0, color: 'var(--warning-text)' }}>
        <circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="1.25" opacity="0.3" />
        <path d="M8 5V9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <circle cx="8" cy="11.25" r="0.75" fill="currentColor" />
      </svg>
    );
  }

  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0, color: 'var(--success-text)' }}>
      <circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="1.25" opacity="0.3" />
      <path d="M5.25 8.25L7 10.25L10.75 5.75" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/* ── DimensionCheckCard — compact card listing all checks with ✓/✗ ──────── */

interface DimensionCheckCardProps {
  dimension: string;
  data: { snowflake?: DimensionScore[] };
}

export function DimensionCheckCard({ dimension, data }: DimensionCheckCardProps) {
  const dim = data.snowflake?.find(d => d.dimension === dimension);
  if (!dim || dim.checks.length === 0) return null;

  const dimColor = DIMENSION_COLORS[dimension] ?? 'var(--muted-foreground)';
  const scoreColor = getScoreColor(dim.score, dim.checks.length);

  return (
    <div className="analysis-card overflow-hidden">
      {/* Accent top line */}
      <div className="h-[2px]" style={{ background: `linear-gradient(90deg, ${dimColor}, ${dimColor}30)` }} />

      {/* Header */}
      <div className="px-5 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">
            Critérios de avaliação
          </span>
        </div>
        <div className="flex items-center gap-2">
          <ScoreChecks score={dim.score} total={dim.checks.length} size="sm" />
          <span className="text-[11px] font-semibold tabular-nums" style={{ color: scoreColor }}>
            {dim.score}/{dim.checks.length}
          </span>
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-border/50 mx-5" />

      {/* Check list */}
      <div className="px-5 py-2">
        {dim.checks.map((check) => (
          <div key={check.id} className="flex items-start gap-3 py-2.5">
            {/* Icon */}
            <div className="mt-0.5 flex-shrink-0">
              {check.passed
                ? <CheckIcon size={14} color="var(--success-text)" />
                : <XIcon size={14} color="var(--danger-text)" />
              }
            </div>
            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`text-[13px] ${check.passed ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>
                  {check.label}
                </span>
                {check.value && (
                  <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                    check.passed ? 'bg-success-surface text-success-text' : 'bg-muted text-muted-foreground'
                  }`}>
                    {formatCheckValue(check.value)}
                  </span>
                )}
              </div>
              {check.description && (
                <p className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed">{check.description}</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Format raw check values (big numbers, decimals) ─────────────────────── */

function formatCheckValue(raw: string): string {
  // Split by ";" to handle multi-value strings like "100645000000.0000; 87320000000.0000"
  const parts = raw.split(';').map(s => s.trim());
  return parts.map(formatSingleValue).join(';  ');
}

function formatSingleValue(val: string): string {
  // Handle arrays like "['2018-12-31→...']"
  if (val.startsWith('[') || val.startsWith("'")) return val;

  // Already formatted (contains letters like "x", "%", "bi", "mi", etc.)
  if (/[a-zA-Z%]/.test(val)) return val;

  const num = parseFloat(val);
  if (isNaN(num)) return val;

  const abs = Math.abs(num);

  // Very small decimals (ratios like 0.0475, 0.1210) → percentage or keep short
  if (abs < 1 && abs > 0) {
    // If it looks like a ratio (0.xxxx), show as percentage
    if (abs < 0.0001) return num.toFixed(4);
    // Common ratios — show as percentage
    return `${(num * 100).toFixed(1)}%`;
  }

  // Large numbers → abbreviate
  const sign = num < 0 ? '-' : '';
  if (abs >= 1e12) return `${sign}R$ ${(abs / 1e12).toFixed(2)} tri`;
  if (abs >= 1e9)  return `${sign}R$ ${(abs / 1e9).toFixed(2)} bi`;
  if (abs >= 1e6)  return `${sign}R$ ${(abs / 1e6).toFixed(1)} mi`;

  // Medium numbers with excessive decimals
  if (abs >= 100) return num.toFixed(1).replace('.0', '');
  if (abs >= 10)  return num.toFixed(1);

  // Small numbers
  return num.toFixed(2);
}

/* ── Legacy alias ────────────────────────────────────────────────────────── */
export { ScoreChecks as ScoreDots };

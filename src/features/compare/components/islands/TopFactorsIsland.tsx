"use client";

import { TrendingUp } from "lucide-react";
import type {
  CompareEnrichedCompany,
  ComparePillar,
  ComparePillarDiff,
} from "../../interfaces";

/* ── Types ────────────────────────────────────────────────────────────────── */

interface TopFactorsIslandProps {
  a: CompareEnrichedCompany;
  b: CompareEnrichedCompany;
  topPillarDiffs: ComparePillarDiff[];
  PILLAR_LABEL: Record<ComparePillar, string>;
  formatNumber: (value: number, digits?: number) => string;
  pillarInsight: (pillar: ComparePillar, winner: string) => string;
  trendContext: (trend: "melhorando" | "estavel" | "piorando") => string;
  activePillar: ComparePillar;
  onSelectPillar: (p: ComparePillar) => void;
}

/* ── PillarDumbbell ───────────────────────────────────────────────────────── */

function PillarDumbbell({
  scoreA,
  scoreB,
  tickerA,
  tickerB,
}: {
  scoreA: number;
  scoreB: number;
  tickerA: string;
  tickerB: string;
}) {
  const max = 10;
  const posA = Math.min(Math.max((scoreA / max) * 100, 2), 98);
  const posB = Math.min(Math.max((scoreB / max) * 100, 2), 98);

  return (
    <div className="space-y-2">
      {/* Track */}
      <div className="relative h-12 w-full rounded-xl bg-muted">
        {/* Connecting line */}
        <div
          className="absolute top-1/2 h-0.5 -translate-y-1/2 bg-border"
          style={{
            left: `${Math.min(posA, posB)}%`,
            width: `${Math.abs(posA - posB)}%`,
          }}
        />
        {/* Dot A */}
        <div
          className="absolute top-1/2 h-5 w-5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow-sm"
          style={{ left: `${posA}%`, backgroundColor: "var(--brand)" }}
        />
        {/* Dot B */}
        <div
          className="absolute top-1/2 h-5 w-5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow-sm"
          style={{ left: `${posB}%`, backgroundColor: "var(--compare-b)" }}
        />
      </div>

      {/* Score cards */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 rounded-lg border border-brand-border bg-brand-surface px-2 py-1">
          <span className="text-[10px] font-medium text-brand-text">
            {tickerA}
          </span>
          <span className="text-[11px] font-semibold text-brand-text">
            {scoreA.toFixed(1)}
          </span>
        </div>
        <div className="flex items-center gap-1.5 rounded-lg border border-compare-b-border bg-compare-b-surface px-2 py-1">
          <span className="text-[10px] font-medium text-compare-b-text">
            {tickerB}
          </span>
          <span className="text-[11px] font-semibold text-compare-b-text">
            {scoreB.toFixed(1)}
          </span>
        </div>
      </div>
    </div>
  );
}

/* ── Trend Badge ──────────────────────────────────────────────────────────── */

function TrendBadge({ trend }: { trend: "melhorando" | "estavel" | "piorando" }) {
  const cls =
    trend === "melhorando"
      ? "border-success-border bg-success-surface text-success-text"
      : trend === "piorando"
        ? "border-danger-border bg-danger-surface text-danger-text"
        : "border-border bg-muted text-muted-foreground";

  const label =
    trend === "melhorando"
      ? "Melhorando"
      : trend === "piorando"
        ? "Piorando"
        : "Estável";

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium ${cls}`}
    >
      {label}
    </span>
  );
}

/* ── Main Component ───────────────────────────────────────────────────────── */

export function TopFactorsIsland({
  a,
  b,
  topPillarDiffs,
  PILLAR_LABEL,
  formatNumber,
  pillarInsight,
  trendContext,
  activePillar,
  onSelectPillar,
}: TopFactorsIslandProps) {
  const top3 = topPillarDiffs.slice(0, 3);

  return (
    <div className="compare-island compare-surface p-6 scroll-mt-[160px] space-y-5">
      <h3 className="text-base font-semibold text-foreground">
        Top 3 fatores separadores
      </h3>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {top3.map((diff, idx) => {
          const isFirst = idx === 0;
          const winnerTicker = diff.winner.ticker;
          const insight = pillarInsight(diff.p, winnerTicker);
          const trend = trendContext(diff.winnerTrend);

          return (
            <button
              key={diff.p}
              onClick={() => onSelectPillar(diff.p)}
              className={`text-left rounded-2xl border p-5 transition-colors ${
                activePillar === diff.p
                  ? "border-brand bg-brand-surface/50"
                  : "border-border bg-card hover:bg-muted/50"
              } ${isFirst ? "lg:col-span-2" : ""}`}
            >
              <div className="space-y-4">
                {/* Header */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1 rounded-full border border-border bg-card px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                      #{idx + 1}
                    </span>
                    <span className="text-sm font-semibold text-foreground">
                      {PILLAR_LABEL[diff.p]}
                    </span>
                  </div>
                  <div className={`flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold ${
                    winnerTicker === a.ticker
                      ? "border-brand-border bg-brand-surface text-brand-text"
                      : "border-compare-b-border bg-compare-b-surface text-compare-b-text"
                  }`}>
                    <TrendingUp className="h-3 w-3" />
                    {winnerTicker}
                  </div>
                </div>

                {/* Insight text */}
                <p className="text-[12px] leading-relaxed text-muted-foreground">
                  {insight}
                </p>

                {/* Dumbbell */}
                <PillarDumbbell
                  scoreA={diff.da.score}
                  scoreB={diff.db.score}
                  tickerA={a.ticker}
                  tickerB={b.ticker}
                />

                {/* Diferença chip + trend */}
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1 rounded-full border border-danger-border bg-danger-surface px-2.5 py-0.5 text-[10px] font-medium text-danger-text">
                    Diferença {formatNumber(diff.delta, 1)} pts
                  </span>
                  <TrendBadge trend={diff.winnerTrend} />
                </div>

                {/* Trend context */}
                <p className="text-[10px] text-muted-foreground">{trend}</p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

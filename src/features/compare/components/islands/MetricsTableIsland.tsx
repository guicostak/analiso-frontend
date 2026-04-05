"use client";

import { FileText } from "lucide-react";
import type {
  CompareEnrichedCompany,
  ComparePillar,
  CompareTableRow,
} from "../../interfaces";

/* ── Types ────────────────────────────────────────────────────────────────── */

interface MetricsTableIslandProps {
  a: CompareEnrichedCompany;
  b: CompareEnrichedCompany;
  tableRows: CompareTableRow[];
  activePillar: ComparePillar;
  PILLAR_LABEL: Record<ComparePillar, string>;
  formatMetric: (value: number | null, unit: string) => string;
  formatNumber: (value: number, digits?: number) => string;
  metricWinner: (
    direction: "higher-better" | "lower-better",
    a: number | null,
    b: number | null,
  ) => "a" | "b" | "tie";
  metricDelta: (a: number | null, b: number | null) => number | null;
  evidenceReadLabel: (delta: number | null) => string;
  openEvidence: (row: CompareTableRow) => void;
  activePillarWinnerSummary: string | null;
}

/* ── Sub-components ───────────────────────────────────────────────────────── */

function GradientBar({
  winner,
  delta,
  maxDelta,
}: {
  winner: "a" | "b" | "tie";
  delta: number | null;
  maxDelta: number;
}) {
  if (delta === null || winner === "tie" || maxDelta === 0) {
    return <div className="h-2 w-full rounded-full bg-muted" />;
  }

  const pct = Math.min((delta / maxDelta) * 100, 100);
  const color = winner === "a" ? "var(--brand)" : "var(--compare-b)";

  return (
    <div className="relative h-2 w-full rounded-full bg-muted">
      {winner === "a" ? (
        <div
          className="absolute right-1/2 top-0 h-full rounded-l-full"
          style={{ width: `${pct / 2}%`, backgroundColor: color, opacity: 0.6 }}
        />
      ) : (
        <div
          className="absolute left-1/2 top-0 h-full rounded-r-full"
          style={{ width: `${pct / 2}%`, backgroundColor: color, opacity: 0.6 }}
        />
      )}
      {/* Center marker */}
      <div className="absolute left-1/2 top-1/2 h-3 w-px -translate-x-1/2 -translate-y-1/2 bg-border" />
    </div>
  );
}

function MetricComparisonRow({
  row,
  a,
  b,
  formatMetric,
  formatNumber,
  metricWinner: getWinner,
  metricDelta: getDelta,
  evidenceReadLabel: getReadLabel,
  openEvidence,
  maxDelta,
}: {
  row: CompareTableRow;
  a: CompareEnrichedCompany;
  b: CompareEnrichedCompany;
  formatMetric: (value: number | null, unit: string) => string;
  formatNumber: (value: number, digits?: number) => string;
  metricWinner: MetricsTableIslandProps["metricWinner"];
  metricDelta: MetricsTableIslandProps["metricDelta"];
  evidenceReadLabel: MetricsTableIslandProps["evidenceReadLabel"];
  openEvidence: MetricsTableIslandProps["openEvidence"];
  maxDelta: number;
}) {
  const valA = row.a?.value ?? null;
  const valB = row.b?.value ?? null;
  const winner = getWinner(row.direction, valA, valB);
  const delta = getDelta(valA, valB);
  const readLabel = getReadLabel(delta);

  const winnerChipClass =
    winner === "a"
      ? "border-brand-border bg-brand-surface text-brand-text"
      : winner === "b"
        ? "border-compare-b-border bg-compare-b-surface text-compare-b-text"
        : "border-border bg-muted text-muted-foreground";

  const winnerLabel =
    winner === "a" ? a.ticker : winner === "b" ? b.ticker : "Empate";

  return (
    <div className="space-y-2 rounded-xl border border-border bg-card p-4">
      {/* Metric name + definition */}
      <div>
        <h4 className="text-[13px] font-semibold text-foreground">
          {row.name}
        </h4>
        <p className="text-[11px] text-muted-foreground">{row.definition}</p>
      </div>

      {/* Values row: A | bar | B */}
      <div className="grid grid-cols-[80px_1fr_80px] items-center gap-3">
        <div
          className={`text-right text-sm font-medium ${
            winner === "a" ? "text-brand-text" : "text-foreground"
          }`}
        >
          {formatMetric(valA, row.unit)}
        </div>
        <GradientBar winner={winner} delta={delta} maxDelta={maxDelta} />
        <div
          className={`text-left text-sm font-medium ${
            winner === "b" ? "text-compare-b-text" : "text-foreground"
          }`}
        >
          {formatMetric(valB, row.unit)}
        </div>
      </div>

      {/* Chips row */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Winner chip */}
        <span
          className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[10px] font-medium ${winnerChipClass}`}
        >
          {winnerLabel}
        </span>

        {/* Diferença */}
        {delta !== null && (
          <span className="inline-flex items-center gap-1 rounded-full border border-danger-border bg-danger-surface px-2.5 py-0.5 text-[10px] font-medium text-danger-text">
            Dif. {formatNumber(delta, row.unit === "x" ? 2 : 1)} {row.unit}
          </span>
        )}

        {/* Evidence read label */}
        <span className="inline-flex items-center gap-1 rounded-full border border-border bg-muted px-2.5 py-0.5 text-[10px] font-medium text-muted-foreground">
          {readLabel}
        </span>

        {/* Source button */}
        <button
          onClick={() => openEvidence(row)}
          className="ml-auto inline-flex items-center gap-1 rounded-full border border-border bg-card px-2.5 py-1 text-[10px] font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <FileText className="h-3 w-3" />
          Fonte
        </button>
      </div>
    </div>
  );
}

/* ── Main Component ───────────────────────────────────────────────────────── */

export function MetricsTableIsland({
  a,
  b,
  tableRows,
  activePillar,
  PILLAR_LABEL,
  formatMetric,
  formatNumber,
  metricWinner,
  metricDelta,
  evidenceReadLabel,
  openEvidence,
  activePillarWinnerSummary,
}: MetricsTableIslandProps) {
  // Calculate max delta for bar scaling
  const deltas = tableRows.map((r) => {
    const valA = r.a?.value ?? null;
    const valB = r.b?.value ?? null;
    return metricDelta(valA, valB);
  });
  const maxDelta = Math.max(...deltas.filter((d): d is number => d !== null), 1);

  return (
    <div className="compare-island compare-surface p-6 scroll-mt-[160px] space-y-5">
      {/* Title */}
      <div>
        <h3 className="text-base font-semibold text-foreground">
          Metricas detalhadas: {PILLAR_LABEL[activePillar]}
        </h3>
        {activePillarWinnerSummary && (
          <p className="mt-1 text-[12px] leading-relaxed text-muted-foreground">
            {activePillarWinnerSummary}
          </p>
        )}
      </div>

      {/* Header */}
      <div className="grid grid-cols-[80px_1fr_80px] gap-3 px-4">
        <span className="text-right text-[10px] font-medium text-brand-text">
          {a.ticker}
        </span>
        <span className="text-center text-[10px] font-medium text-muted-foreground">
          Comparacao
        </span>
        <span className="text-left text-[10px] font-medium text-compare-b-text">
          {b.ticker}
        </span>
      </div>

      {/* Rows */}
      <div className="space-y-3">
        {tableRows.map((row) => (
          <MetricComparisonRow
            key={row.name}
            row={row}
            a={a}
            b={b}
            formatMetric={formatMetric}
            formatNumber={formatNumber}
            metricWinner={metricWinner}
            metricDelta={metricDelta}
            evidenceReadLabel={evidenceReadLabel}
            openEvidence={openEvidence}
            maxDelta={maxDelta}
          />
        ))}
      </div>
    </div>
  );
}

"use client";

import { Check } from "lucide-react";
import { SnowflakeChart } from "@/src/components/shared/SnowflakeChart";
import type {
  CompareEnrichedCompany,
  CompareScoreboard,
  CompareSnowflakeScore,
} from "../../interfaces";
import { formatNumber } from "../../services";

/* ── Dimension color map ─────────────────────────────────────────────────── */

const DIMENSION_COLORS: Record<string, string> = {
  value: "#5B6AC0",
  future: "#3E8ED0",
  past: "#2EAA8A",
  health: "#D4913B",
  dividend: "#8B6CDB",
};

const DIMENSION_LABELS: Record<string, string> = {
  value: "Valor",
  future: "Futuro",
  past: "Passado",
  health: "Saúde",
  dividend: "Dividendo",
};

/* ── Helpers ──────────────────────────────────────────────────────────────── */

function mapSnowflake(scores: CompareSnowflakeScore[]) {
  return scores.map((s) => ({
    label: DIMENSION_LABELS[s.dimension] || s.label || s.dimension,
    value: s.normalized,
    color: DIMENSION_COLORS[s.dimension] ?? "#5B6AC0",
  }));
}

function avgScore(scores: CompareSnowflakeScore[]): number {
  if (!scores.length) return 0;
  return scores.reduce((sum, s) => sum + s.normalized, 0) / scores.length;
}

function statusFromAvg(avg: number): "healthy" | "attention" | "risk" {
  if (avg >= 60) return "healthy";
  if (avg >= 35) return "attention";
  return "risk";
}

/* ── Score Row (3 columns: A | Dimension | B) ────────────────────────────── */

function ScoreRow({
  label,
  scoreA,
  scoreB,
  tickerA,
  tickerB,
  isLast,
}: {
  label: string;
  scoreA: number;
  scoreB: number;
  tickerA: string;
  tickerB: string;
  isLast: boolean;
}) {
  const isABetter = scoreA > scoreB;
  const isBBetter = scoreB > scoreA;

  return (
    <div
      className={`grid items-center ${
        !isLast ? "border-b border-border/60" : ""
      }`}
      style={{ gridTemplateColumns: "1fr 80px 1fr" }}
    >
      {/* Cell A */}
      <div
        className="flex h-11 items-center justify-center gap-1.5 rounded-l-lg px-2"
        style={isABetter ? { backgroundColor: "var(--brand-surface)" } : undefined}
      >
        {isABetter && (
          <Check className="h-4 w-4 text-brand-text" />
        )}
      </div>

      {/* Dimension label (center) */}
      <div className="flex h-11 items-center justify-center">
        <span className="text-[12px] font-normal text-muted-foreground whitespace-nowrap">
          {label}
        </span>
      </div>

      {/* Cell B */}
      <div
        className="flex h-11 items-center justify-center rounded-r-lg px-2"
        style={isBBetter ? { backgroundColor: "var(--compare-b-surface)" } : undefined}
      >
        {isBBetter && (
          <Check className="h-4 w-4 text-compare-b-text" />
        )}
      </div>
    </div>
  );
}

/* ── Main Component ───────────────────────────────────────────────────────── */

interface SnowflakeDualProps {
  a: CompareEnrichedCompany;
  b: CompareEnrichedCompany;
  scoreboard: CompareScoreboard;
}

export function SnowflakeDual({ a, b, scoreboard }: SnowflakeDualProps) {
  const dimsA = mapSnowflake(a.snowflake);
  const dimsB = mapSnowflake(b.snowflake);
  const avgA = avgScore(a.snowflake);
  const avgB = avgScore(b.snowflake);

  const dimensions: { key: string; label: string }[] = [
    { key: "value", label: "Valor" },
    { key: "future", label: "Futuro" },
    { key: "past", label: "Passado" },
    { key: "health", label: "Saúde" },
    { key: "dividend", label: "Dividendo" },
  ];

  // Count wins
  let winsA = 0;
  let winsB = 0;
  for (const dim of dimensions) {
    const sA = a.snowflake.find((s) => s.dimension === dim.key)?.normalized ?? 0;
    const sB = b.snowflake.find((s) => s.dimension === dim.key)?.normalized ?? 0;
    if (sA > sB) winsA++;
    else if (sB > sA) winsB++;
  }

  const winnerTicker = scoreboard.winner.ticker;
  const isAWinner = winnerTicker === a.ticker;

  return (
    <div className="compare-island compare-surface p-6 scroll-mt-[160px]">
      <div className="grid grid-cols-1 items-center gap-6 xl:grid-cols-[1fr_auto_1fr]">
        {/* ── Snowflake A ── */}
        <div className="flex flex-col items-center gap-3">
          <span className="text-xs font-semibold text-brand-text">
            {a.ticker}
          </span>
          <SnowflakeChart
            dimensions={dimsA}
            size="small"
            status={statusFromAvg(avgA)}
          />
          <span className="text-[11px] text-muted-foreground">
            Média: {formatNumber(avgA, 0)}
          </span>
        </div>

        {/* ── Tabela comparativa central ── */}
        <div className="w-full max-w-xs">
          {/* Cabeçalho */}
          <div
            className="grid items-center border-b border-border-strong pb-2"
            style={{ gridTemplateColumns: "1fr 80px 1fr" }}
          >
            <span className="text-center text-[10px] font-semibold uppercase tracking-wider text-brand-text">
              {a.ticker}
            </span>
            <span className="text-center text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Dimensão
            </span>
            <span className="text-center text-[10px] font-semibold uppercase tracking-wider text-compare-b-text">
              {b.ticker}
            </span>
          </div>

          {/* Linhas por dimensão */}
          <div className="mt-1">
            {dimensions.map((dim, i) => {
              const sA =
                a.snowflake.find((s) => s.dimension === dim.key)?.normalized ?? 0;
              const sB =
                b.snowflake.find((s) => s.dimension === dim.key)?.normalized ?? 0;
              return (
                <ScoreRow
                  key={dim.key}
                  label={dim.label}
                  scoreA={sA}
                  scoreB={sB}
                  tickerA={a.ticker}
                  tickerB={b.ticker}
                  isLast={i === dimensions.length - 1}
                />
              );
            })}
          </div>

          {/* Placar resumo */}
          <div className="mt-4 rounded-xl border border-border bg-muted/60 px-4 py-3">
            <div className="flex items-center justify-center gap-3">
              <span className="text-[13px] font-semibold text-brand-text">
                {a.ticker}
              </span>
              <span className="text-[18px] font-bold tabular-nums text-foreground">
                {winsA} × {winsB}
              </span>
              <span className="text-[13px] font-semibold text-compare-b-text">
                {b.ticker}
              </span>
            </div>
            <p className="mt-1 text-center text-[11px] text-muted-foreground">
              {formatNumber(avgA, 0)} pts vs {formatNumber(avgB, 0)} pts
            </p>
          </div>
        </div>

        {/* ── Snowflake B ── */}
        <div className="flex flex-col items-center gap-3">
          <span className="text-xs font-semibold text-compare-b-text">
            {b.ticker}
          </span>
          <SnowflakeChart
            dimensions={dimsB}
            size="small"
            status={statusFromAvg(avgB)}
          />
          <span className="text-[11px] text-muted-foreground">
            Média: {formatNumber(avgB, 0)}
          </span>
        </div>
      </div>
    </div>
  );
}

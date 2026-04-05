"use client";

import { TrendingUp } from "lucide-react";
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

/* ── Score Row ────────────────────────────────────────────────────────────── */

function ScoreRow({
  label,
  scoreA,
  scoreB,
  color,
  isLast,
}: {
  label: string;
  scoreA: number;
  scoreB: number;
  color: string;
  isLast: boolean;
}) {
  const total = scoreA + scoreB || 1;
  const pctA = (scoreA / total) * 100;
  const isABetter = scoreA > scoreB;
  const isTie = scoreA === scoreB;

  return (
    <div className={`grid grid-cols-[56px_1fr_56px] items-center gap-3 py-2.5 px-1 ${!isLast ? "border-b border-border" : ""}`}>
      {/* Score A */}
      <span className={`text-right text-[13px] font-semibold tabular-nums ${isABetter ? "text-brand-text" : "text-foreground"}`}>
        {formatNumber(scoreA, 0)}
      </span>

      {/* Bar — proporção A vs B */}
      <div className="relative flex flex-col items-center gap-1">
        <span className="text-[10px] font-medium text-muted-foreground leading-none">
          {label}
        </span>
        <div className="flex h-2 w-full overflow-hidden rounded-full">
          <div
            className="h-full rounded-l-full transition-all"
            style={{
              width: `${pctA}%`,
              backgroundColor: isTie ? "var(--muted)" : isABetter ? "var(--brand)" : "var(--muted)",
              opacity: isTie ? 1 : isABetter ? 0.7 : 0.35,
            }}
          />
          <div
            className="h-full rounded-r-full transition-all"
            style={{
              width: `${100 - pctA}%`,
              backgroundColor: isTie ? "var(--muted)" : !isABetter ? "var(--compare-b)" : "var(--muted)",
              opacity: isTie ? 1 : !isABetter ? 0.7 : 0.35,
            }}
          />
        </div>
      </div>

      {/* Score B */}
      <span className={`text-left text-[13px] font-semibold tabular-nums ${!isABetter && !isTie ? "text-compare-b-text" : "text-foreground"}`}>
        {formatNumber(scoreB, 0)}
      </span>
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

  const dimensions: { key: string; label: string; color: string }[] = [
    { key: "value", label: "Valor", color: DIMENSION_COLORS.value },
    { key: "future", label: "Futuro", color: DIMENSION_COLORS.future },
    { key: "past", label: "Passado", color: DIMENSION_COLORS.past },
    { key: "health", label: "Saúde", color: DIMENSION_COLORS.health },
    { key: "dividend", label: "Dividendo", color: DIMENSION_COLORS.dividend },
  ];

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
          <div className="grid grid-cols-[56px_1fr_56px] gap-3 border-b border-border-strong pb-2 px-1">
            <span className="text-right text-[10px] font-semibold uppercase tracking-wider text-brand-text">
              {a.ticker}
            </span>
            <span className="text-center text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Diferença
            </span>
            <span className="text-left text-[10px] font-semibold uppercase tracking-wider text-compare-b-text">
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
                  color={dim.color}
                  isLast={i === dimensions.length - 1}
                />
              );
            })}
          </div>

          {/* Destaque do vencedor */}
          <div className="mt-4 rounded-xl border border-border bg-muted/60 px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-brand" />
                <span className="text-[13px] font-semibold text-foreground">
                  {winnerTicker}
                </span>
                <span className="text-[11px] text-muted-foreground">
                  lidera no agregado
                </span>
              </div>
              <span className="text-[13px] font-semibold tabular-nums text-foreground">
                {formatNumber(isAWinner ? avgA : avgB, 0)} pts
              </span>
            </div>
            <p className="mt-1.5 text-[11px] leading-relaxed text-muted-foreground">
              Confiança dos dados: baseada na cobertura e atualização das fontes oficiais (CVM, B3, RI) para ambas as empresas.
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

"use client";

/**
 * CurvaDiIsland (6×3)
 *
 * Curva DI Pre Anbima (ETTJ) — pricing dos juros futuros por vencimento.
 * Mostra: chip de forma da curva (Inclinada/Achatada/Invertida), mini-chart
 * área com pontos por tenor, labels (1A/2A/5A/10A) abaixo, e nota da
 * variação mais relevante do dia.
 *
 * Por que importa:
 *   - Curva inclinada (longo > curto) = expectativa de juros estáveis/queda
 *   - Curva achatada = mercado precifica fim de ciclo
 *   - Curva invertida = expectativa de queda forte de juros (recessão na ótica)
 *
 * Útil pra renda fixa e bancos. Empty state com "Em breve" quando pipeline
 * ainda não rodou (mantém ilha visível pra usuário descobrir o que vem).
 */

import { useEffect, useState } from "react";
import { LineChart as LineIcon } from "lucide-react";

import { cn } from "@/src/components/ui/utils";
import { getExplore } from "@/src/features/explore/services";
import type { ExploreResponse } from "@/src/features/explore/services";
import { mapRiskPanel } from "@/src/features/explore/mappers/market.mappers";

import type { IslandProps } from "../../interfaces/island.types";
import { IslandShell } from "../shared/IslandShell";

const W = 280;
const H = 70;

function summaryTone(summary: string | null): string {
  if (summary === "Invertida") return "bg-danger-surface border-danger-border text-danger-text";
  if (summary === "Achatada")  return "bg-warning-surface border-warning-border text-warning-text";
  if (summary === "Inclinada") return "bg-success-surface border-success-border text-success-text";
  return "bg-muted border-border text-muted-foreground";
}

export function CurvaDiIsland(_props: IslandProps) {
  const [explore, setExplore] = useState<ExploreResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getExplore()
      .then((d) => { if (!cancelled) setExplore(d); })
      .catch(() => { /* silencia */ })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  const curve = mapRiskPanel(explore?.marketExtras?.riskPanel ?? null)?.diCurve ?? null;
  const hasData = curve && curve.points.length >= 2;

  return (
    <IslandShell
      icon={<LineIcon className="h-4 w-4 text-muted-foreground" />}
      title="Curva DI · PRE"
      info="Estrutura a termo dos juros (ETTJ Anbima). Pricing dos DI futuros por vencimento — mostra o que o mercado espera dos juros: inclinada = juros estáveis/queda; achatada = fim de ciclo; invertida = queda forte (recessão precificada)."
    >
      {loading ? (
        <div className="flex flex-1 flex-col gap-3">
          <div className="h-5 w-24 animate-pulse rounded-full bg-muted" />
          <div className="flex-1 animate-pulse rounded bg-muted" />
        </div>
      ) : !hasData ? (
        <div className="flex flex-1 flex-col items-start justify-center gap-3 px-1">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-muted px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            <span className="h-1 w-1 rounded-full bg-muted-foreground/60" />
            Em breve
          </span>
          <p className="max-w-xs text-[11.5px] leading-relaxed text-muted-foreground">
            Pipeline da curva DI ETTJ Anbima ainda não disponível pra esta data.
          </p>
          <svg viewBox="0 0 280 50" className="w-full text-muted-foreground/30" aria-hidden="true">
            <path
              d="M 0 36 C 24 28, 48 18, 80 22 S 144 32, 200 18 S 256 8, 280 14"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeDasharray="4 4"
              strokeLinecap="round"
            />
          </svg>
        </div>
      ) : (() => {
        const pts = curve!.points;
        const yields = pts.map((p) => p.yieldPct);
        const yMin = Math.min(...yields);
        const yMax = Math.max(...yields);
        const yPad = (yMax - yMin) * 0.15 || 0.1;
        const yLo = yMin - yPad;
        const yHi = yMax + yPad;
        const stepX = pts.length > 1 ? W / (pts.length - 1) : W;
        const scaleY = (y: number) => H - ((y - yLo) / (yHi - yLo || 1)) * H;

        // Vértice que mais se moveu vs D-1 — destacado visualmente.
        const biggestMove = pts.reduce<{ idx: number; mag: number } | null>(
          (acc, p, i) => {
            if (p.changeBps == null) return acc;
            const m = Math.abs(p.changeBps);
            if (!acc || m > acc.mag) return { idx: i, mag: m };
            return acc;
          },
          null,
        );

        const linePath = pts
          .map(
            (p, i) =>
              `${i === 0 ? "M" : "L"} ${(i * stepX).toFixed(2)} ${scaleY(p.yieldPct).toFixed(2)}`,
          )
          .join(" ");
        const areaPath = `${linePath} L ${((pts.length - 1) * stepX).toFixed(2)} ${H} L 0 ${H} Z`;

        const lastPoint = pts[pts.length - 1];

        return (
          <div className="flex flex-1 flex-col gap-2.5">
            {/* Header com chip de forma + asOfDate */}
            <div className="flex items-center justify-between gap-2">
              {curve!.summary && (
                <span
                  className={cn(
                    "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider",
                    summaryTone(curve!.summary),
                  )}
                >
                  <span className="h-1 w-1 rounded-full bg-current" />
                  {curve!.summary}
                </span>
              )}
              {curve!.asOfDate && (
                <span className="text-[10px] text-muted-foreground">
                  ETTJ Anbima · {curve!.asOfDate}
                </span>
              )}
            </div>

            {/* Mini-chart */}
            <svg viewBox={`0 0 ${W} ${H}`} className="w-full flex-1" aria-hidden="true">
              <defs>
                <linearGradient id="di-curve-island-grad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%"  stopColor="var(--brand)" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="var(--brand)" stopOpacity="0" />
                </linearGradient>
              </defs>
              <path d={areaPath} fill="url(#di-curve-island-grad)" />
              <path
                d={linePath}
                fill="none"
                stroke="var(--brand)"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              {pts.map((p, i) => {
                const cx = i * stepX;
                const cy = scaleY(p.yieldPct);
                const isBiggest = biggestMove?.idx === i;
                return (
                  <circle
                    key={p.tenorDays}
                    cx={cx}
                    cy={cy}
                    r={isBiggest ? 3 : 1.75}
                    fill={isBiggest ? "var(--brand)" : "var(--card)"}
                    stroke="var(--brand)"
                    strokeWidth={1}
                  />
                );
              })}
              <circle
                cx={(pts.length - 1) * stepX}
                cy={scaleY(lastPoint.yieldPct)}
                r={3}
                fill="var(--brand)"
              />
            </svg>

            {/* Tenor labels */}
            <div className="flex justify-between text-[9.5px] font-medium uppercase tracking-wider text-muted-foreground tabular-nums">
              {pts.map((p) => (
                <span key={p.tenorDays}>{p.tenorLabel}</span>
              ))}
            </div>

            {/* Variação mais relevante */}
            {biggestMove && pts[biggestMove.idx].changeLabel && (
              <p className="text-[10.5px] leading-snug text-muted-foreground">
                <span className="font-semibold text-foreground">
                  {pts[biggestMove.idx].tenorLabel}
                </span>{" "}
                moveu{" "}
                <span
                  className={cn(
                    "font-semibold",
                    pts[biggestMove.idx].trend === "up"
                      ? "text-danger-text"
                      : pts[biggestMove.idx].trend === "down"
                        ? "text-success-text"
                        : "text-muted-foreground",
                  )}
                >
                  {pts[biggestMove.idx].changeLabel}
                </span>
              </p>
            )}
          </div>
        );
      })()}
    </IslandShell>
  );
}

"use client";

/**
 * PerformanceVsIbovIsland (6×3)
 *
 * Mini-versão do card "Performance da watchlist" da tela /watchlist:
 * variação % da watchlist no período + variação do IBOV + alpha em pp.
 * Reusa o mesmo endpoint `/api/me/watchlist/performance?range=90d`,
 * cacheado server-side (TTL 1h).
 *
 * Sem o gráfico SVG completo (não cabe em 6×3 confortavelmente) — só os
 * 3 números + uma linha sutil de sparkline da watchlist. Pro gráfico
 * detalhado com IBOV o usuário vai pra /watchlist.
 */

import { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronRight, LineChart as LineChartIcon } from "lucide-react";

import { useAuth } from "@/src/features/auth/AuthContext";
import { getWatchlistPerformance } from "@/src/features/watchlist/services";
import type { WatchlistPerformance } from "@/src/features/watchlist/interfaces";
import type { IslandProps } from "../../interfaces/island.types";
import { IslandShell } from "../shared/IslandShell";

function fmtSignedPct(n: number | null | undefined): string {
  if (n == null || !Number.isFinite(n)) return "—";
  const sign = n >= 0 ? "+" : "";
  return `${sign}${n.toFixed(1).replace(".", ",")}%`;
}

function fmtSignedPp(n: number | null | undefined): string {
  if (n == null || !Number.isFinite(n)) return "—";
  const sign = n >= 0 ? "+" : "";
  return `${sign}${n.toFixed(1).replace(".", ",")}pp`;
}

export function PerformanceVsIbovIsland(_props: IslandProps) {
  const { token } = useAuth();
  const [data, setData] = useState<WatchlistPerformance | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;
    let cancelled = false;
    setLoading(true);
    getWatchlistPerformance("90d", token)
      .then((d) => { if (!cancelled) setData(d); })
      .catch(() => { /* silencia */ })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [token]);

  const summary = data?.summary;
  const hasData = !!summary && data!.series.length >= 2;
  const watchlistChg = summary?.watchlistChangePct ?? null;
  const ibovChg = summary?.ibovChangePct ?? null;
  const alpha = summary?.alphaPp ?? null;

  return (
    <IslandShell
      icon={<LineChartIcon className="h-4 w-4 text-muted-foreground" />}
      title="Watchlist vs IBOV (90d)"
      right={
        <Link
          href="/watchlist"
          className="inline-flex items-center gap-1 text-[11px] font-semibold text-brand hover:underline"
        >
          Detalhes
          <ChevronRight className="h-3 w-3" />
        </Link>
      }
      info="Variação % da sua watchlist (índice equal-weight) vs IBOV nos últimos 90 dias. Alpha = sua watchlist menos o IBOV em pontos percentuais — positivo significa que você bateu o índice no período."
    >
      {loading ? (
        <div className="space-y-3">
          <div className="h-7 w-32 animate-pulse rounded bg-muted" />
          <div className="h-20 animate-pulse rounded bg-muted" />
        </div>
      ) : !hasData ? (
        <div className="flex flex-1 items-center justify-center text-center">
          <p className="px-4 text-[12px] text-muted-foreground">
            Histórico insuficiente para o período.
          </p>
        </div>
      ) : (
        <>
          <div className="flex items-baseline gap-4">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                Watchlist
              </p>
              <p className={`text-[22px] font-bold leading-none tracking-tight ${
                (watchlistChg ?? 0) >= 0 ? "text-success-text" : "text-danger-text"
              }`}>
                {fmtSignedPct(watchlistChg)}
              </p>
            </div>
            <div className="border-l border-border pl-4">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                IBOV
              </p>
              <p className="text-[15px] font-semibold leading-none text-foreground">
                {fmtSignedPct(ibovChg)}
              </p>
            </div>
            <div className="border-l border-border pl-4">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                Alpha
              </p>
              <p className={`text-[15px] font-semibold leading-none ${
                (alpha ?? 0) >= 0 ? "text-success-text" : "text-danger-text"
              }`}>
                {fmtSignedPp(alpha)}
              </p>
            </div>
          </div>

          {/* Mini sparkline */}
          <div className="mt-4 flex-1 min-h-0">
            <MiniSparkline series={data!.series.map((p) => p.watchlist)} />
          </div>

          {summary && summary.tickersIncluded.length > 0 && (
            <p className="mt-2 truncate text-[10.5px] text-muted-foreground">
              <span className="text-foreground">Inclui:</span>{" "}
              {summary.tickersIncluded.join(" · ")}
            </p>
          )}
        </>
      )}
    </IslandShell>
  );
}

/** Sparkline simples de 1 série, normalizada na altura disponível. */
function MiniSparkline({ series }: { series: (number | null)[] }) {
  const valid = series.filter((v): v is number => v != null && Number.isFinite(v));
  if (valid.length < 2) {
    return <div className="h-full w-full rounded bg-muted/40" />;
  }
  const min = Math.min(...valid, 100);
  const max = Math.max(...valid, 100);
  const range = max - min || 1;
  const W = 600; // viewBox; SVG escala via preserveAspectRatio
  const H = 60;

  const pts = valid.map((v, i) => {
    const x = (i / (valid.length - 1)) * W;
    const y = H - ((v - min) / range) * H;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });

  const last = valid[valid.length - 1];
  const isPositive = last >= 100;

  return (
    <svg
      width="100%"
      height={H}
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="none"
      role="img"
      aria-label="Sparkline da watchlist"
      style={{ display: "block" }}
    >
      {/* linha base 100 */}
      <line
        x1={0}
        y1={H - ((100 - min) / range) * H}
        x2={W}
        y2={H - ((100 - min) / range) * H}
        stroke="currentColor"
        strokeOpacity={0.15}
        strokeWidth={1}
        strokeDasharray="3 3"
      />
      <polyline
        fill="none"
        stroke={isPositive ? "#14B8A6" : "#EF4444"}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        points={pts.join(" ")}
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}

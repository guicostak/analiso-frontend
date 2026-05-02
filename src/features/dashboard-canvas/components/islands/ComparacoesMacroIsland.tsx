"use client";

/**
 * ComparacoesMacroIsland (6×3)
 *
 * Visões comparativas: IBOV em USD, IBOV vs S&P YTD, etc. Cards com label,
 * valor + change% e mini-sparkline. Detecta "rotação" — quando dois ativos
 * que costumam andar juntos divergem (sinal de mudança de cenário).
 *
 * Layout vertical de até 4 comparações (lista compacta), em vez do grid
 * 3-cols do /mercado — caber em 6×3 do dashboard pede formato lista.
 */

import { useEffect, useState } from "react";
import { GitCompare } from "lucide-react";

import { cn } from "@/src/components/ui/utils";
import { MiniSparkline } from "@/src/components/shared/MiniSparkline";
import { getExplore } from "@/src/features/explore/services";
import type { ExploreResponse } from "@/src/features/explore/services";
import { mapComparison } from "@/src/features/explore/mappers/market.mappers";
import type { Comparison } from "@/src/features/explore/interfaces/market.interfaces";

import type { IslandProps } from "../../interfaces/island.types";
import { IslandShell } from "../shared/IslandShell";

function trendTone(trend: Comparison["trend"]): string {
  if (trend === "up") return "text-success-text";
  if (trend === "down") return "text-danger-text";
  return "text-muted-foreground";
}

function trendStatus(trend: Comparison["trend"]): "healthy" | "risk" | "attention" {
  if (trend === "up") return "healthy";
  if (trend === "down") return "risk";
  return "attention";
}

function ComparisonRow({ comp }: { comp: Comparison }) {
  return (
    <article className="flex items-center justify-between gap-2 rounded-[10px] border border-border bg-muted/20 px-2.5 py-2">
      {/* Left: label + value */}
      <div className="min-w-0 flex-1">
        <p className="truncate text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          {comp.label}
        </p>
        <div className="mt-0.5 flex items-baseline gap-1.5">
          <span className="text-[15px] font-semibold leading-none tracking-[-0.01em] text-foreground tabular-nums">
            {comp.valuePrefix && (
              <span className="mr-0.5 text-[10px] font-medium text-muted-foreground">
                {comp.valuePrefix}
              </span>
            )}
            {comp.value ?? "—"}
            {comp.valueSuffix && (
              <span className="ml-0.5 text-[9px] font-medium uppercase tracking-wider text-muted-foreground">
                {comp.valueSuffix}
              </span>
            )}
          </span>
          {comp.changePct && (
            <span className={cn("text-[10.5px] font-medium tabular-nums", trendTone(comp.trend))}>
              {comp.changePct}
            </span>
          )}
        </div>
      </div>

      {/* Right: sparkline */}
      {comp.sparkline && comp.sparkline.length > 1 && (
        <div className="shrink-0">
          <MiniSparkline
            data={comp.sparkline}
            status={trendStatus(comp.trend)}
            width={64}
            height={24}
            strokeWidth={1.25}
            lineOpacity={0.85}
          />
        </div>
      )}
    </article>
  );
}

export function ComparacoesMacroIsland(_props: IslandProps) {
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

  const comparisons = (explore?.marketExtras?.comparisons ?? []).map(mapComparison);

  return (
    <IslandShell
      icon={<GitCompare className="h-4 w-4 text-muted-foreground" />}
      title="Comparações"
      info="Cruzamentos clássicos pra detectar 'rotação' — IBOV em dólar (visão estrangeira), IBOV vs S&P (diferencial vs USA), ouro/petróleo (commodity ratios). Quando ativos que costumam andar juntos divergem, costuma ser sinal de mudança de cenário."
    >
      {loading ? (
        <div className="flex flex-1 flex-col gap-2">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="h-[44px] animate-pulse rounded-[10px] bg-muted" />
          ))}
        </div>
      ) : comparisons.length === 0 ? (
        <div className="flex flex-1 items-center justify-center text-center text-[12px] text-muted-foreground">
          Comparações indisponíveis.
        </div>
      ) : (
        <div className="flex flex-1 flex-col gap-2 overflow-y-auto pr-1">
          {comparisons.map((c) => (
            <ComparisonRow key={c.key} comp={c} />
          ))}
        </div>
      )}
    </IslandShell>
  );
}

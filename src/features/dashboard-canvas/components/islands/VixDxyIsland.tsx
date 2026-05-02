"use client";

/**
 * VixDxyIsland (4×2)
 *
 * 2 indicadores externos lado-a-lado: VIX (volatilidade implícita S&P 500
 * — "índice do medo") e DXY (índice do dólar contra cesta de moedas).
 *
 * Drivers de fluxo estrangeiro pra mercado brasileiro:
 *   - VIX alto = aversão global a risco → estrangeiro saca de EM
 *   - DXY alto = dólar forte → pressiona moedas EM, pode atrapalhar
 *     empresas exportadoras de commodity (PETR, VALE)
 *
 * Layout 2 colunas pra caber em 4 cells de largura — só valor + change%.
 */

import { useEffect, useState } from "react";
import { Activity } from "lucide-react";

import { cn } from "@/src/components/ui/utils";
import { getExplore } from "@/src/features/explore/services";
import type { ExploreResponse } from "@/src/features/explore/services";
import { mapRiskPanel } from "@/src/features/explore/mappers/market.mappers";
import type { IndexMini } from "@/src/features/explore/interfaces/market.interfaces";

import type { IslandProps } from "../../interfaces/island.types";
import { IslandShell } from "../shared/IslandShell";

function trendTone(trend: IndexMini["trend"]): string {
  if (trend === "up") return "text-success-text";
  if (trend === "down") return "text-danger-text";
  return "text-muted-foreground";
}

function MiniIndex({
  label,
  hint,
  data,
}: {
  label: string;
  hint: string;
  data: IndexMini | null;
}) {
  if (!data || !data.value) {
    return (
      <div className="flex flex-1 flex-col justify-between gap-1 rounded-[10px] border border-border bg-muted/20 p-2.5">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          {label}
        </p>
        <span className="text-[12px] text-muted-foreground/70">—</span>
        <p className="text-[9.5px] text-muted-foreground/70">{hint}</p>
      </div>
    );
  }
  return (
    <div className="flex flex-1 flex-col justify-between gap-1 rounded-[10px] border border-border bg-muted/20 p-2.5">
      <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      <div className="flex items-baseline gap-1.5">
        <span className="text-[20px] font-semibold leading-none tracking-[-0.02em] text-foreground tabular-nums">
          {data.value}
        </span>
        {data.changePct && (
          <span className={cn("text-[11px] font-medium tabular-nums", trendTone(data.trend))}>
            {data.changePct}
          </span>
        )}
      </div>
      <p className="truncate text-[9.5px] text-muted-foreground">{hint}</p>
    </div>
  );
}

export function VixDxyIsland(_props: IslandProps) {
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

  const riskPanel = mapRiskPanel(explore?.marketExtras?.riskPanel ?? null);

  return (
    <IslandShell
      icon={<Activity className="h-4 w-4 text-muted-foreground" />}
      title="VIX & DXY"
      info="VIX (CBOE) mede volatilidade implícita do S&P 500 — alta = aversão global a risco, estrangeiro tende a sair de EM. DXY mede o dólar vs cesta de moedas — alta = dólar forte pressiona moedas emergentes e empresas exportadoras de commodity."
    >
      {loading ? (
        <div className="flex flex-1 gap-2">
          <div className="flex-1 animate-pulse rounded-[10px] bg-muted" />
          <div className="flex-1 animate-pulse rounded-[10px] bg-muted" />
        </div>
      ) : (
        <div className="flex flex-1 gap-2">
          <MiniIndex
            label="VIX"
            hint="Volatilidade S&P 500"
            data={riskPanel?.vix ?? null}
          />
          <MiniIndex
            label="DXY"
            hint="Índice do dólar"
            data={riskPanel?.dxy ?? null}
          />
        </div>
      )}
    </IslandShell>
  );
}

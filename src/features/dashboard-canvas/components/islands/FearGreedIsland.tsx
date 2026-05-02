"use client";

/**
 * FearGreedIsland (4×2)
 *
 * Indicador externo CNN Fear & Greed: score 0-100 + label (Extreme Fear,
 * Fear, Neutral, Greed, Extreme Greed) + barra horizontal.
 *
 * Complementa volatilidade — volatilidade mede preço, fear/greed mede
 * sentiment de mercado USA. Útil pra leitura macro de risco global.
 */

import { useEffect, useState } from "react";
import { Gauge } from "lucide-react";

import { cn } from "@/src/components/ui/utils";
import { getExplore } from "@/src/features/explore/services";
import type { ExploreResponse } from "@/src/features/explore/services";
import { mapRiskPanel } from "@/src/features/explore/mappers/market.mappers";

import type { IslandProps } from "../../interfaces/island.types";
import { IslandShell } from "../shared/IslandShell";

/** Tom semântico baseado no score 0-100. */
function scoreColor(score: number): { text: string; bar: string } {
  if (score >= 70) return { text: "text-success-text", bar: "bg-success-text" };
  if (score <= 30) return { text: "text-danger-text",  bar: "bg-danger-text"  };
  return { text: "text-warning-text", bar: "bg-warning-text" };
}

export function FearGreedIsland(_props: IslandProps) {
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

  const fng = mapRiskPanel(explore?.marketExtras?.riskPanel ?? null)?.fearGreed ?? null;
  const score = fng ? Math.max(0, Math.min(100, fng.score)) : null;

  return (
    <IslandShell
      icon={<Gauge className="h-4 w-4 text-muted-foreground" />}
      title="Fear & Greed"
      info="Indicador CNN de sentimento do mercado USA — 0=medo extremo (oportunidade pra contrários), 100=ganância extrema (cuidado com complacência). Complementa volatilidade: preço x sentimento, em conjunto contam a história completa."
    >
      {loading ? (
        <div className="flex flex-1 flex-col gap-3">
          <div className="h-10 w-24 animate-pulse rounded bg-muted" />
          <div className="h-2 w-full animate-pulse rounded-full bg-muted" />
          <div className="h-3 w-1/2 animate-pulse rounded bg-muted" />
        </div>
      ) : score == null || !fng ? (
        <div className="flex flex-1 items-center justify-center text-center text-[12px] text-muted-foreground">
          Fear & Greed indisponível.
        </div>
      ) : (
        <div className="flex flex-1 flex-col justify-between gap-2">
          {/* Score + label */}
          <div className="flex items-baseline gap-2">
            <span className="text-[36px] font-semibold leading-none tracking-[-0.025em] text-foreground tabular-nums">
              {score}
            </span>
            <span className={cn("text-[12px] font-medium", scoreColor(score).text)}>
              {fng.label}
            </span>
          </div>

          {/* Barra de gauge */}
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
            <span
              className={cn("block h-full transition-all duration-500", scoreColor(score).bar)}
              style={{ width: `${score}%` }}
              aria-label={`Score ${score} de 100`}
            />
          </div>

          {/* Footer */}
          <p className="truncate text-[10px] text-muted-foreground">
            Fonte: {fng.source}
            {fng.asOfDate && ` · ${fng.asOfDate}`}
          </p>
        </div>
      )}
    </IslandShell>
  );
}

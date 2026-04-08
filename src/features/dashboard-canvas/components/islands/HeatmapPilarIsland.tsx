"use client";

/**
 * HeatmapPilarIsland (6×2)
 *
 * Distribuição por pilar (saudável/atenção/risco). Reaproveita o markup
 * de barras segmentadas do `heatmap-mudancas-card` mas em versão compacta
 * para o canvas.
 */

import { Grid3x3 } from "lucide-react";
import type { IslandProps } from "../../interfaces/island.types";
import { useIslandData } from "../../hooks/useIslandData";

export function HeatmapPilarIsland(_props: IslandProps) {
  const { pillarMovements, applySinglePillarFilter } = useIslandData();

  return (
    /* Viés: Pattern Recognition — barras coloridas mostram de relance
       onde está concentrada a pressão sem precisar ler números. */
    <article className="flex h-full w-full flex-col rounded-[20px] border border-border bg-card p-5">
      <div className="flex items-center gap-2">
        <Grid3x3 className="h-4 w-4 text-muted-foreground" />
        <h3 className="text-[13px] font-semibold text-foreground">Heatmap por pilar</h3>
      </div>

      <div className="mt-3 grid flex-1 grid-cols-1 gap-2 sm:grid-cols-2">
        {pillarMovements.map((movement) => {
          const total = Math.max(movement.healthy + movement.attention + movement.risk, 1);
          return (
            <button
              key={movement.pillar}
              type="button"
              onClick={() => applySinglePillarFilter(movement.pillar)}
              className="rounded-[14px] bg-muted px-3 py-2 text-left transition hover:bg-hover"
            >
              <div className="flex items-center justify-between">
                <p className="text-[12px] font-semibold text-foreground">{movement.pillar}</p>
                <p className="text-[11px] text-muted-foreground">{movement.events} ev.</p>
              </div>
              <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-card">
                <div className="flex h-full">
                  <div className="h-full bg-emerald-500" style={{ width: `${(movement.healthy / total) * 100}%` }} />
                  <div className="h-full bg-amber-400" style={{ width: `${(movement.attention / total) * 100}%` }} />
                  <div className="h-full bg-rose-400" style={{ width: `${(movement.risk / total) * 100}%` }} />
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </article>
  );
}

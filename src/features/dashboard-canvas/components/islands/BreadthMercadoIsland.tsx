"use client";

/**
 * BreadthMercadoIsland (4×2)
 *
 * "Fôlego" do mercado: % de empresas em alta vs em baixa hoje. Indicador
 * clássico pra detectar quando rali é saudável (breadth alto) vs quando
 * sobe puxado por poucas (breadth baixo).
 *
 * Mostra: % em alta (número grande), barra dividida verde/vermelho,
 * absoluto "X em alta · Y em baixa".
 */

import { useEffect, useState } from "react";
import { Scale } from "lucide-react";

import { getExplore } from "@/src/features/explore/services";
import type { ExploreResponse } from "@/src/features/explore/services";
import { mapRiskPanel } from "@/src/features/explore/mappers/market.mappers";

import type { IslandProps } from "../../interfaces/island.types";
import { IslandShell } from "../shared/IslandShell";

export function BreadthMercadoIsland(_props: IslandProps) {
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

  const breadth = mapRiskPanel(explore?.marketExtras?.riskPanel ?? null)?.breadth ?? null;
  const upPct = breadth && breadth.total > 0 ? Math.round(breadth.ratioUp * 100) : null;

  return (
    <IslandShell
      icon={<Scale className="h-4 w-4 text-muted-foreground" />}
      title="Breadth"
      info="% de empresas em alta no IBrX hoje. >60% = rali saudável e disseminado; <40% = pressão generalizada; meio-termo = movimento concentrado em poucos nomes (cuidado com narrativa puxada por 1-2 ações)."
    >
      {loading ? (
        <div className="flex flex-1 flex-col gap-3">
          <div className="h-10 w-20 animate-pulse rounded bg-muted" />
          <div className="h-2 w-full animate-pulse rounded-full bg-muted" />
          <div className="h-3 w-3/4 animate-pulse rounded bg-muted" />
        </div>
      ) : upPct == null || !breadth ? (
        <div className="flex flex-1 items-center justify-center text-center text-[12px] text-muted-foreground">
          Breadth indisponível.
        </div>
      ) : (
        <div className="flex flex-1 flex-col justify-between gap-2">
          {/* Topo: número grande + label */}
          <div className="flex items-baseline gap-2">
            <span className="text-[36px] font-semibold leading-none tracking-[-0.025em] text-foreground tabular-nums">
              {upPct}%
            </span>
            <span className="text-[11px] font-medium text-muted-foreground">em alta</span>
          </div>

          {/* Barra dividida verde/vermelho */}
          <div className="flex h-1.5 w-full overflow-hidden rounded-full bg-muted">
            <span
              className="h-full bg-success-text transition-all duration-500"
              style={{ width: `${upPct}%` }}
              aria-label={`${upPct}% em alta`}
            />
            <span
              className="h-full bg-danger-text transition-all duration-500"
              style={{ width: `${100 - upPct}%` }}
            />
          </div>

          {/* Footer: contagem absoluta */}
          <p className="text-[10px] text-muted-foreground tabular-nums">
            <span className="text-success-text font-medium">{breadth.up}</span> em alta ·{" "}
            <span className="text-danger-text font-medium">{breadth.down}</span> em baixa
            {breadth.unchanged > 0 && <> · {breadth.unchanged} estáveis</>}
          </p>
        </div>
      )}
    </IslandShell>
  );
}

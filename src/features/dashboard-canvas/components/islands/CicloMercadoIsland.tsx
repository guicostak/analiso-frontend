"use client";

/**
 * CicloMercadoIsland (3×1) — premium
 *
 * Onde estamos no ciclo macro. Ilha premium: backend é o gate real.
 */

import { Compass } from "lucide-react";
import type { IslandProps } from "../../interfaces/island.types";
import { useIslandData } from "../../hooks/useIslandData";

export function CicloMercadoIsland(_props: IslandProps) {
  const { leadingPillarMovement } = useIslandData();

  return (
    /* Viés: Authority — pista macro vinda do dado da plataforma reduz a
       sensação de "estou decidindo no escuro". */
    <article className="flex h-full w-full items-center gap-3 rounded-[20px] border border-border bg-card px-4 py-3">
      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300">
        <Compass className="h-4 w-4" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-[12px] font-medium uppercase text-muted-foreground">Ciclo de mercado</p>
        <p className="truncate text-[13px] font-semibold text-foreground">
          Pressão concentrada em {leadingPillarMovement.pillar.toLowerCase()}
        </p>
      </div>
    </article>
  );
}

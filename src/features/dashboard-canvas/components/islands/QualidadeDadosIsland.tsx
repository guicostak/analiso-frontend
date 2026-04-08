"use client";

/**
 * QualidadeDadosIsland (3×1)
 *
 * Sinaliza frescor/cobertura dos dados. Versão compacta — detalhes ficam
 * para a tela /qualidade-dados.
 */

import { Database } from "lucide-react";
import type { IslandProps } from "../../interfaces/island.types";
import { useIslandData } from "../../hooks/useIslandData";

export function QualidadeDadosIsland(_props: IslandProps) {
  const { dashboardData } = useIslandData();
  const manifest = dashboardData?.manifestVersion ?? "—";

  return (
    /* Viés: Trust — declarar o manifesto/origem dos dados aumenta a
       confiança do usuário no que está vendo. */
    <article className="flex h-full w-full items-center gap-3 rounded-[20px] border border-border bg-card px-4 py-3">
      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-muted text-muted-foreground">
        <Database className="h-4 w-4" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-[12px] font-medium uppercase text-muted-foreground">Qualidade dos dados</p>
        <p className="truncate text-[13px] font-semibold text-foreground">
          Manifesto {manifest} · cobertura completa
        </p>
      </div>
    </article>
  );
}

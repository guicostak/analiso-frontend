"use client";

/**
 * CicloMercadoIsland (4×2)
 *
 * Mostra o Investment Clock compacto (4 quadrantes + ponteiro) e o nome
 * da fase atual ao lado. Reaproveita o endpoint público `/api/explore`
 * (mesmo da tela /mercado) — busca o ciclo de `marketExtras.macroBr.economicCycle`.
 *
 * Quando a fase é desconhecida ou indisponível, a ilha mostra fallback
 * textual com leadingPillarMovement.
 */

import { useEffect, useState } from "react";
import { Compass } from "lucide-react";

import { getExplore } from "@/src/features/explore/services";
import type { ExploreResponse } from "@/src/features/explore/services";
import {
  MarketCycleClockMini,
} from "@/src/components/shared/MarketCycleClockMini";
import {
  PHASE_META,
  type MarketCyclePhase,
} from "@/src/components/shared/MarketCycleClock";
import type { IslandProps } from "../../interfaces/island.types";
import { useIslandData } from "../../hooks/useIslandData";
import { IslandShell } from "../shared/IslandShell";

const VALID_PHASES: readonly MarketCyclePhase[] = [
  "RECOVERY",
  "OVERHEAT",
  "STAGFLATION",
  "REFLATION",
] as const;

function isValidPhase(key: string | null | undefined): key is MarketCyclePhase {
  return !!key && (VALID_PHASES as readonly string[]).includes(key);
}

export function CicloMercadoIsland(_props: IslandProps) {
  const { leadingPillarMovement } = useIslandData();
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

  const cycle = explore?.marketExtras?.macroBr?.economicCycle ?? null;
  const phaseKey = isValidPhase(cycle?.phaseKey) ? cycle!.phaseKey : null;

  return (
    <IslandShell
      icon={<Compass className="h-4 w-4 text-muted-foreground" />}
      title="Ciclo de mercado"
      info="Em qual fase do Investment Clock (Merrill Lynch) o Brasil está agora — combinação de crescimento e inflação. O quadrante destacado é a fase atual."
    >
      {loading ? (
        <div className="flex flex-1 items-center gap-3">
          <div className="h-[100px] w-[100px] flex-shrink-0 animate-pulse rounded-full bg-muted" />
          <div className="flex-1 space-y-2">
            <div className="h-2.5 w-20 animate-pulse rounded bg-muted" />
            <div className="h-5 w-24 animate-pulse rounded bg-muted" />
            <div className="h-2 w-32 animate-pulse rounded bg-muted" />
          </div>
        </div>
      ) : phaseKey ? (
        <div className="flex flex-1 items-center gap-4">
          {/* Mini clock à esquerda */}
          <MarketCycleClockMini currentPhase={phaseKey} size={100} />

          {/* Info à direita */}
          <div className="min-w-0 flex-1">
            <p className="text-[9.5px] font-semibold uppercase tracking-wider text-muted-foreground">
              Fase atual
            </p>
            <p
              className="mt-0.5 truncate text-[18px] font-semibold leading-tight tracking-tight"
              style={{ color: PHASE_META[phaseKey].color }}
            >
              {PHASE_META[phaseKey].label}
            </p>
            <p className="mt-2 line-clamp-3 text-[10.5px] leading-snug text-muted-foreground">
              {cycle?.description ?? PHASE_META[phaseKey].hint}
            </p>
          </div>
        </div>
      ) : (
        // Fallback: ciclo indisponível, usa leadingPillarMovement
        <div className="flex flex-1 items-center gap-3">
          <span
            className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300"
            aria-hidden
          >
            <Compass className="h-5 w-5" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Pressão concentrada em
            </p>
            <p className="mt-0.5 text-[15px] font-semibold leading-[1.3] tracking-[-0.01em] text-foreground">
              {leadingPillarMovement.pillar.toLowerCase()}
            </p>
          </div>
        </div>
      )}
    </IslandShell>
  );
}

"use client";

/**
 * MoodMercadoIsland (4×1)
 *
 * Tile compacto que mostra o "tom de mercado" do dia: BULLISH / NEUTRAL /
 * BEARISH com badge colorido + 1 highlight curto (o mais relevante das 3).
 *
 * Tom = composição de breadth + volatilidade + tendência de índices-âncora
 * (cálculo no backend, vem pronto via `marketTone`).
 *
 * Filler ideal pra rows com gap de 4 cols. Cresce até 6 com texto de
 * highlight expandido.
 */

import { useEffect, useState } from "react";

import { cn } from "@/src/components/ui/utils";
import { getExplore } from "@/src/features/explore/services";
import type { ExploreResponse } from "@/src/features/explore/services";
import { mapMarketTone } from "@/src/features/explore/mappers/market.mappers";

import type { IslandProps } from "../../interfaces/island.types";
import { IslandShell } from "../shared/IslandShell";

function toneTheme(tone: "BULLISH" | "NEUTRAL" | "BEARISH" | null): {
  bg: string;
  border: string;
  text: string;
  dot: string;
} {
  if (tone === "BULLISH") {
    return {
      bg: "bg-success-surface",
      border: "border-success-border",
      text: "text-success-text",
      dot: "bg-success-text",
    };
  }
  if (tone === "BEARISH") {
    return {
      bg: "bg-danger-surface",
      border: "border-danger-border",
      text: "text-danger-text",
      dot: "bg-danger-text",
    };
  }
  return {
    bg: "bg-warning-surface",
    border: "border-warning-border",
    text: "text-warning-text",
    dot: "bg-warning-text",
  };
}

export function MoodMercadoIsland(_props: IslandProps) {
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

  const tone = mapMarketTone(explore?.marketExtras?.marketTone ?? null);
  const theme = toneTheme(tone?.tone ?? null);

  return (
    <IslandShell
      title="Tom do mercado"
      info="Tom composto do dia: combina breadth (% empresas em alta), volatilidade e tendência dos índices-âncora. Bullish = ambiente favorável ao risco; Bearish = aversão; Neutral = sem direção clara."
    >
      {loading ? (
        <div className="flex flex-1 items-center gap-3">
          <div className="h-7 w-24 animate-pulse rounded-full bg-muted" />
          <div className="h-3 w-32 animate-pulse rounded bg-muted" />
        </div>
      ) : !tone ? (
        <div className="flex flex-1 items-center text-[12px] text-muted-foreground">
          Tom indisponível.
        </div>
      ) : (
        <div className="flex flex-1 items-center gap-3 min-w-0">
          <span
            className={cn(
              "inline-flex shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10.5px] font-semibold uppercase tracking-wide",
              theme.bg,
              theme.border,
              theme.text,
            )}
          >
            <span className={cn("h-1.5 w-1.5 rounded-full animate-pulse", theme.dot)} />
            {tone.label}
          </span>
          {tone.highlights[0] && (
            <p className="min-w-0 truncate text-[11.5px] leading-snug text-muted-foreground">
              {tone.highlights[0]}
            </p>
          )}
        </div>
      )}
    </IslandShell>
  );
}

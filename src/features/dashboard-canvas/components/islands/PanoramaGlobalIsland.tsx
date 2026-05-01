"use client";

/**
 * PanoramaGlobalIsland (12×1 — 88px de altura)
 *
 * Versão dashboard do "Panorama global" da tela /mercado. Mostra a mesma
 * fita de tickers (índices, câmbio, commodities, cripto) com scroll
 * contínuo + status pill (Mercado aberto/fechado/pré-abertura).
 *
 * Densidade visual: cabeçalho compacto (px-4 py-2 ~36px) + tape (~52px)
 * cabe certinho em 1 linha do grid (88px). Usar 12×2 deixava ~100px de
 * espaço vazio embaixo — desproporcional ao conteúdo da tape.
 *
 * Renderiza direto como `<article>` (sem `IslandShell`) pra controlar a
 * altura ao pixel — o shell padrão tem `p-5` que comeria ~40px e quebraria
 * o ajuste em 88px.
 */

import { useEffect, useState } from "react";
import { Globe } from "lucide-react";

import { getExplore } from "@/src/features/explore/services";
import type { ExploreResponse } from "@/src/features/explore/services";
import {
  MarketTickerTape,
  MarketStatusPill,
} from "@/src/features/explore/components/market/ExploreMarketRibbon";
import { mapRibbon } from "@/src/features/explore/mappers/market.mappers";
import type { IslandProps } from "../../interfaces/island.types";
import { IslandInfoHint } from "../shared/IslandShell";

export function PanoramaGlobalIsland(_props: IslandProps) {
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

  const ribbon = mapRibbon(explore?.marketExtras?.ribbon ?? null);
  const tickers = ribbon?.tickers ?? [];

  return (
    <article
      className="flex h-full w-full flex-col overflow-hidden rounded-[24px] border border-border bg-card shadow-[0_14px_30px_rgba(15,23,40,0.04)] dark:shadow-none"
    >
      {/* Header compacto — não usa IslandShell pra evitar p-5 (40px) */}
      <header className="flex flex-shrink-0 items-center justify-between gap-2 border-b border-border px-4 py-2">
        <div className="flex min-w-0 items-center gap-2">
          <Globe className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
          <h3 className="truncate text-[13px] font-semibold text-foreground">
            Panorama global
          </h3>
        </div>
        <div className="flex flex-shrink-0 items-center gap-1.5">
          <MarketStatusPill status={ribbon?.marketStatus ?? null} />
          <IslandInfoHint text="Tickers globais (índices, câmbio, commodities e cripto) com último fechamento. O carrossel rola sozinho — pause o mouse em cima pra ler com calma." />
        </div>
      </header>

      {/* Tape ocupa o resto da altura */}
      <div className="flex flex-1 min-h-0 items-center">
        <div className="w-full">
          <MarketTickerTape tickers={tickers} isLoading={loading} />
        </div>
      </div>
    </article>
  );
}

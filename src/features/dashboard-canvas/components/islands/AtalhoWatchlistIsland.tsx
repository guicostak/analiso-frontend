"use client";

/**
 * AtalhoWatchlistIsland (4×1)
 *
 * Tile compacto de navegação rápida pra `/watchlist`. Tamanho 4×1 (88px de
 * altura) é proposital — é o ÚNICO ilha desse tamanho no registry, então
 * funciona como "filler" pro packing algorithm em rows com gap de 4 cols.
 *
 * UX: ícone à esquerda + label + chevron à direita, com hover acentuado
 * brand. Ao clicar, navega pra a feature da watchlist (atalho mais rápido
 * que abrir sidebar).
 */

import Link from "next/link";
import { ChevronRight, Wallet } from "lucide-react";

import { useFavorites } from "@/src/features/favoritas";
import { IslandShell } from "../shared/IslandShell";
import type { IslandProps } from "../../interfaces/island.types";

export function AtalhoWatchlistIsland(_props: IslandProps) {
  const { tickers } = useFavorites();
  const count = tickers.size;

  return (
    <IslandShell
      icon={<Wallet className="h-4 w-4 text-muted-foreground" />}
      title="Sua watchlist"
      info="Atalho rápido pra abrir a watchlist completa com filtros, comparações e métricas detalhadas."
    >
      <Link
        href="/watchlist"
        className="
          group/atalho flex flex-1 items-center justify-between gap-3
          -m-1 rounded-lg p-1
          transition-colors hover:bg-muted/40
        "
        aria-label={`Abrir watchlist com ${count} empresa${count === 1 ? "" : "s"}`}
      >
        <div className="min-w-0 flex-1">
          <p className="text-[15px] font-semibold text-foreground tabular-nums">
            {count} <span className="text-[12px] font-medium text-muted-foreground">
              empresa{count === 1 ? "" : "s"}
            </span>
          </p>
          <p className="mt-0.5 truncate text-[10.5px] text-muted-foreground">
            Abrir lista completa
          </p>
        </div>
        <ChevronRight
          className="h-4 w-4 flex-shrink-0 text-muted-foreground transition-transform group-hover/atalho:translate-x-0.5 group-hover/atalho:text-brand"
          aria-hidden
        />
      </Link>
    </IslandShell>
  );
}

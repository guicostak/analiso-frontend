"use client";

/**
 * HeatmapSetorialIsland (6×3, esticável até 12×4)
 *
 * Espelho dashboard do bloco "Heatmap setorial" da tela /mercado: grid de
 * setores B3 colorizados pela variação média do dia. Cada célula mostra
 * nome do setor, % média, qtd de empresas e top tickers.
 *
 * Por que adicionar ao dashboard: leitura rápida de "onde tá o capital
 * fluindo hoje" sem precisar abrir /mercado. Em conjunto com a watchlist,
 * ajuda a contextualizar movimentos individuais ("minha PETR4 caiu, mas
 * o setor todo caiu também").
 *
 * Layout:
 *   - 6×3 default → grid 2×N (cabe ~4-6 setores visíveis, scroll vertical
 *     pro resto). Compacto pra coexistir com outras ilhas.
 *   - growable até 12×4 → grid 4×3 mostra todos os 11 setores B3 sem
 *     scroll, ideal pra rows full-width.
 *
 * Reaproveita o lógica de cellClass do `ExploreSectorHeatmap` (mesma
 * paleta semântica via tokens).
 */

import { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronRight, BarChart3 } from "lucide-react";

import { cn } from "@/src/components/ui/utils";
import { getExplore } from "@/src/features/explore/services";
import type { ExploreResponse } from "@/src/features/explore/services";
import { mapSectorHeatmap } from "@/src/features/explore/mappers/market.mappers";
import type { SectorHeatmapItem } from "@/src/features/explore/interfaces/market.interfaces";

import type { IslandProps } from "../../interfaces/island.types";
import { IslandShell } from "../shared/IslandShell";

/**
 * Classifica intensidade do tint em 3 níveis (forte/leve/neutro) baseado
 * em |pct|. Mantém tokens semânticos — sem hex direto.
 */
function cellClass(pct: number | null): { bg: string; text: string; border: string } {
  if (pct == null || pct === 0) {
    return {
      bg: "bg-muted/40",
      text: "text-muted-foreground",
      border: "border-border",
    };
  }
  const strong = Math.abs(pct) >= 2;
  if (pct > 0) {
    return {
      bg: strong ? "bg-success-surface" : "bg-success-surface/50",
      text: "text-success-text",
      border: "border-success-border",
    };
  }
  return {
    bg: strong ? "bg-danger-surface" : "bg-danger-surface/50",
    text: "text-danger-text",
    border: "border-danger-border",
  };
}

function fmtPct(pct: number | null): string {
  if (pct == null) return "—";
  const sign = pct > 0 ? "+" : "";
  return `${sign}${pct.toFixed(2)}%`;
}

function SectorCell({ item }: { item: SectorHeatmapItem }) {
  const cls = cellClass(item.avgChangePct);
  return (
    <article
      className={cn(
        "flex flex-col gap-1.5 rounded-[12px] border p-2.5 transition-colors",
        cls.bg,
        cls.border,
      )}
      aria-label={`Setor ${item.sector}: variação média ${fmtPct(item.avgChangePct)}, ${item.companiesCount ?? 0} empresas`}
    >
      <div className="flex items-start justify-between gap-2">
        <h4 className="min-w-0 truncate text-[11.5px] font-semibold leading-tight text-foreground">
          {item.sector}
        </h4>
        <span className={cn("text-[12px] font-semibold tabular-nums", cls.text)}>
          {fmtPct(item.avgChangePct)}
        </span>
      </div>
      <div className="flex items-center justify-between gap-2 text-[9.5px] text-muted-foreground">
        <span>{item.companiesCount ?? 0} empresas</span>
        {item.topTickers.length > 0 && (
          <span className="truncate font-mono">
            {item.topTickers.slice(0, 2).join(" · ")}
          </span>
        )}
      </div>
    </article>
  );
}

export function HeatmapSetorialIsland(_props: IslandProps) {
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

  const heatmap = mapSectorHeatmap(explore?.marketExtras?.sectorHeatmap ?? null);
  const sectors = heatmap?.sectors ?? [];

  return (
    <IslandShell
      icon={<BarChart3 className="h-4 w-4 text-muted-foreground" />}
      title="Heatmap setorial"
      right={
        <Link
          href="/mercado"
          className="inline-flex items-center gap-1 text-[11px] font-semibold text-brand hover:underline"
        >
          Ver tudo
          <ChevronRight className="h-3 w-3" />
        </Link>
      }
      info="Variação média do dia por setor B3, colorida proporcional ao módulo do %. Verde forte = setor bombando, vermelho forte = pressão. Útil pra contextualizar movimentos individuais da watchlist (sua ação caiu sozinha ou o setor todo caiu?)."
    >
      {loading ? (
        <div className="grid flex-1 grid-cols-2 gap-2">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="animate-pulse rounded-[12px] bg-muted" />
          ))}
        </div>
      ) : sectors.length === 0 ? (
        <div className="flex flex-1 items-center justify-center px-3 py-6 text-center text-[12px] text-muted-foreground">
          Heatmap setorial indisponível.
        </div>
      ) : (
        <div
          className={cn(
            // Grid auto-fill: cada célula tem mín 140px, distribui o
            // espaço disponível em colunas. Em 6×3 (largura ~488px) cabem
            // 3 cols de 140px+; em 12×3 (largura ~1024px) cabem 7 cols.
            // `auto-rows-fr` mantém células com altura igual (mesmo com
            // qtd ímpar de setores).
            "grid flex-1 auto-rows-fr gap-2 overflow-y-auto pr-1",
            "grid-cols-[repeat(auto-fill,minmax(140px,1fr))]",
          )}
        >
          {sectors.map((s) => (
            <SectorCell key={s.sector} item={s} />
          ))}
        </div>
      )}
    </IslandShell>
  );
}

"use client";

/**
 * Heatmap setorial — grid de setores B3 colorizados pela variação média do dia.
 *
 * Cada célula mostra: nome do setor, variação média %, quantidade de empresas,
 * top 3 tickers representativos. Intensidade do tint varia proporcional ao
 * módulo da variação (mais forte = mais saturado).
 */

import { Globe } from "lucide-react";
import type { SectorHeatmap, SectorHeatmapItem } from "../../interfaces/market.interfaces";
import { InfoTooltip } from "@/src/components/shared/InfoTooltip";
import { SECTOR_HEATMAP_INFO } from "../../utils/marketInfoCopy";
import { SectionCategoryTag } from "./SectionCategoryTag";

interface ExploreSectorHeatmapProps {
  heatmap: SectorHeatmap | null;
}

/**
 * Classifica a intensidade do tint em 3 níveis absolutos, baseado em |pct|.
 * Mantemos os tokens semânticos (sem hex) — variação de intensidade por opacidade.
 */
function cellClass(pct: number | null): { bg: string; text: string; border: string } {
  if (pct == null) {
    return {
      bg: "bg-muted",
      text: "text-muted-foreground",
      border: "border-border",
    };
  }
  if (pct > 0) {
    const strong = Math.abs(pct) >= 2;
    return {
      bg: strong ? "bg-success-surface" : "bg-success-surface/60",
      text: "text-success-text",
      border: "border-success-border",
    };
  }
  if (pct < 0) {
    const strong = Math.abs(pct) >= 2;
    return {
      bg: strong ? "bg-danger-surface" : "bg-danger-surface/60",
      text: "text-danger-text",
      border: "border-danger-border",
    };
  }
  return {
    bg: "bg-muted",
    text: "text-muted-foreground",
    border: "border-border",
  };
}

function SectorCell({ item }: { item: SectorHeatmapItem }) {
  const cls = cellClass(item.avgChangePct);
  const pctLabel =
    item.avgChangePct == null
      ? "—"
      : `${item.avgChangePct > 0 ? "+" : ""}${item.avgChangePct.toFixed(2)}%`;

  return (
    <article
      className={`
        group relative flex flex-col justify-between gap-2 rounded-xl border p-3
        transition-all duration-200
        hover:shadow-md dark:hover:shadow-none
        ${cls.bg} ${cls.border}
      `}
      aria-label={`Setor ${item.sector}: variação média ${pctLabel}, ${item.companiesCount ?? 0} empresas`}
    >
      <div className="flex items-start justify-between gap-2">
        <h4 className="text-[12px] font-semibold leading-tight text-foreground">
          {item.sector}
        </h4>
        <span className={`text-sm font-semibold tabular-nums ${cls.text}`}>
          {pctLabel}
        </span>
      </div>
      <div className="flex items-center justify-between gap-2 text-[10px] text-muted-foreground">
        <span>{item.companiesCount ?? 0} empresas</span>
        {item.topTickers.length > 0 && (
          <span className="truncate font-mono">
            {item.topTickers.slice(0, 3).join(" · ")}
          </span>
        )}
      </div>
    </article>
  );
}

export function ExploreSectorHeatmap({ heatmap }: ExploreSectorHeatmapProps) {
  const sectors = heatmap?.sectors ?? [];

  return (
    <section className="space-y-4" aria-label="Heatmap setorial">
      <header className="flex items-end justify-between">
        <div className="space-y-1.5">
          <SectionCategoryTag icon={Globe} label="Contexto" categoryId="contexto-mercado" />
          <p className="inline-flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
            Performance por setor
            <InfoTooltip label="Heatmap setorial" content={SECTOR_HEATMAP_INFO} />
          </p>
          <h3 className="text-lg font-semibold tracking-tight text-foreground">
            Heatmap setorial
          </h3>
        </div>
        {heatmap?.asOfLabel && (
          <span className="text-[11px] text-muted-foreground">
            {heatmap.asOfLabel}
          </span>
        )}
      </header>

      {sectors.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-card p-8 text-center text-sm text-muted-foreground">
          Sem dados setoriais agregados para esta data.
        </div>
      ) : (
        <div
          className="
            grid gap-3
            grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4
          "
        >
          {sectors.map((s) => (
            <SectorCell key={s.sector} item={s} />
          ))}
        </div>
      )}
    </section>
  );
}

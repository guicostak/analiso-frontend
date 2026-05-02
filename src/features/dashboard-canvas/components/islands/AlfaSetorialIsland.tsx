"use client";

/**
 * AlfaSetorialIsland (6×3, esticável até 12×4)
 *
 * "Quem destoou do próprio setor hoje?" — diferencial Analiso pra distinguir
 * tese idiossincrática de movimento de maré. Ação subir 4% num setor que
 * subiu 3% é pouco (efeito setor); subir 4% num setor que caiu 1% é evento
 * específico.
 *
 * Layout 2 cols (positivos | negativos) com top 3-4 itens cada. Linkam pra
 * /analysis/{ticker} pra abrir leitura imediatamente.
 */

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { TrendingUp, ArrowUpRight, ArrowDownRight } from "lucide-react";

import { cn } from "@/src/components/ui/utils";
import { getExplore } from "@/src/features/explore/services";
import type { ExploreResponse } from "@/src/features/explore/services";
import type { ExploreMarketExtrasDto } from "@/src/features/explore/services";
import type { SectorAlphaItem } from "@/src/features/explore/interfaces/market.interfaces";

import type { IslandProps } from "../../interfaces/island.types";
import { IslandShell } from "../shared/IslandShell";

function fmtPct(n: number): string {
  const sign = n > 0 ? "+" : "";
  return `${sign}${n.toFixed(1).replace(".", ",")}%`;
}
function fmtAlpha(n: number): string {
  const sign = n > 0 ? "+" : "";
  return `${sign}${n.toFixed(1).replace(".", ",")}pp`;
}

// Mapper inline simplificado (não exportado pelo market.mappers).
function mapSectorAlphaItem(d: NonNullable<ExploreMarketExtrasDto["sectorAlpha"]>["positive"][number]): SectorAlphaItem {
  return {
    ticker:         d.ticker,
    companyName:    d.companyName ?? null,
    sector:         d.sector ?? null,
    stockChangePct: d.stockChangePct,
    sectorAvgPct:   d.sectorAvgPct,
    alphaPct:       d.alphaPct,
    direction:      d.direction === "negative" ? "negative" : "positive",
    logoUrl:        d.logoUrl ?? null,
  };
}

function AlphaRow({ item }: { item: SectorAlphaItem }) {
  const positive = item.direction === "positive";
  const tone = positive ? "text-success-text" : "text-danger-text";
  const Icon = positive ? ArrowUpRight : ArrowDownRight;
  return (
    <Link
      href={`/analysis/${item.ticker}`}
      className="flex items-center gap-2 rounded-[10px] border border-border bg-muted/20 px-2 py-1.5 transition-colors hover:bg-muted/40"
    >
      {item.logoUrl ? (
        <Image
          src={item.logoUrl}
          alt=""
          width={24}
          height={24}
          className="h-6 w-6 shrink-0 rounded-full border border-border bg-card object-contain"
          unoptimized
        />
      ) : (
        <div className="h-6 w-6 shrink-0 rounded-full border border-border bg-muted" />
      )}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1">
          <span className="truncate text-[12px] font-semibold text-foreground">
            {item.ticker}
          </span>
          <Icon className={cn("h-3 w-3 shrink-0", tone)} aria-hidden />
        </div>
        <p className="truncate text-[10px] text-muted-foreground">
          <span className={cn("font-semibold tabular-nums", tone)}>{fmtAlpha(item.alphaPct)}</span>
          {" "}vs setor
        </p>
      </div>
      <span className={cn("shrink-0 text-[12px] font-semibold tabular-nums", tone)}>
        {fmtPct(item.stockChangePct)}
      </span>
    </Link>
  );
}

export function AlfaSetorialIsland(_props: IslandProps) {
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

  const bundle = explore?.marketExtras?.sectorAlpha;
  const positive = (bundle?.positive ?? []).slice(0, 4).map(mapSectorAlphaItem);
  const negative = (bundle?.negative ?? []).slice(0, 4).map(mapSectorAlphaItem);
  const isEmpty = !loading && positive.length === 0 && negative.length === 0;

  return (
    <IslandShell
      icon={<TrendingUp className="h-4 w-4 text-muted-foreground" />}
      title="Alfa setorial"
      info="Variação da ação − variação média do setor (em pp). Destaca movimentos idiossincráticos — quem destoou do próprio setor sinaliza tese específica da empresa, não efeito de maré. Click no ticker abre a análise."
    >
      {loading ? (
        <div className="grid flex-1 grid-cols-2 gap-2">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-[44px] animate-pulse rounded-[10px] bg-muted" />
          ))}
        </div>
      ) : isEmpty ? (
        <div className="flex flex-1 items-center justify-center text-center text-[12px] text-muted-foreground">
          Alfa setorial indisponível.
        </div>
      ) : (
        <div className="grid flex-1 grid-cols-2 gap-2 overflow-hidden">
          {/* Positivos */}
          <div className="flex flex-col gap-1.5 overflow-y-auto pr-0.5">
            <p className="text-[9.5px] font-semibold uppercase tracking-wider text-success-text">
              Acima do setor
            </p>
            {positive.length > 0 ? (
              positive.map((item) => <AlphaRow key={`p-${item.ticker}`} item={item} />)
            ) : (
              <p className="text-[10.5px] text-muted-foreground">—</p>
            )}
          </div>
          {/* Negativos */}
          <div className="flex flex-col gap-1.5 overflow-y-auto pr-0.5">
            <p className="text-[9.5px] font-semibold uppercase tracking-wider text-danger-text">
              Abaixo do setor
            </p>
            {negative.length > 0 ? (
              negative.map((item) => <AlphaRow key={`n-${item.ticker}`} item={item} />)
            ) : (
              <p className="text-[10.5px] text-muted-foreground">—</p>
            )}
          </div>
        </div>
      )}
    </IslandShell>
  );
}

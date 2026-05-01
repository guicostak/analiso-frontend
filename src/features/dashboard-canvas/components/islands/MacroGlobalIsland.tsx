"use client";

/**
 * MacroGlobalIsland (12×2)
 *
 * Espelho dashboard do bloco "Macro global" da tela /mercado: 5 mini cards
 * com commodities e cripto — Brent, WTI, Ouro, Minério, Bitcoin. Tudo
 * cotado em US$ pra leitura comparativa direta.
 *
 * Por que esses 5? São os preços que mais movem PETR4 (Brent/WTI), VALE3
 * (Minério), tese inflacionária (Ouro) e apetite por risco (Bitcoin). Pra
 * um investidor PF brasileiro, é o "macro lá fora" mais acionável.
 *
 * Tamanho 12×2 (196px) acomoda os 5 cards numa linha horizontal — mesmo
 * formato visual do /mercado. Em mobile encolhe pra 2 colunas (3 linhas).
 *
 * Complementa as outras ilhas de contexto:
 *   - `panorama_global` (12×1): fita rolante com TUDO (broad scan)
 *   - `pulso_mercado`   (4×2):  índices B3 (IBOV, SMLL, IFIX)
 *   - `resumo_indices`  (6×3):  cenário externo financeiro (US equities + FX + VIX + BTC)
 *   - `macro_global`    (12×2): commodities + cripto ← esta ilha
 */

import { useEffect, useMemo, useState } from "react";
import { Globe } from "lucide-react";

import { getExplore } from "@/src/features/explore/services";
import type { ExploreResponse } from "@/src/features/explore/services";
import { mapGlobalMacro } from "@/src/features/explore/mappers/market.mappers";
import type { IndexCard } from "@/src/features/explore/interfaces";
import { unitFor, sparklineValueFormatter } from "@/src/features/explore/utils/tickerUnits";
import { MiniSparkline } from "@/src/components/shared/MiniSparkline";

import type { IslandProps } from "../../interfaces/island.types";
import { IslandShell } from "../shared/IslandShell";

const trendTone: Record<IndexCard["trend"], string> = {
  up: "text-success-text",
  down: "text-danger-text",
  neutral: "text-warning-text",
};

const trendStatus: Record<IndexCard["trend"], "healthy" | "attention" | "risk"> = {
  up: "healthy",
  down: "risk",
  neutral: "attention",
};

// ─── Sub-componente: card único ─────────────────────────────────────────────

function MacroCard({ card }: { card: IndexCard }) {
  const unit = unitFor(card.symbol);
  return (
    <div className="flex min-w-0 flex-col rounded-2xl border border-border bg-card/60 px-3 py-2.5">
      {/* Linha 1: nome + sparkline */}
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p className="truncate text-[12px] font-semibold tracking-[-0.01em] text-foreground">
            {card.name}
          </p>
          <p className="truncate text-[9.5px] font-medium uppercase tracking-wider text-muted-foreground">
            {card.symbol}
          </p>
        </div>
        {card.sparkline && card.sparkline.length > 1 && (
          <div className="flex-shrink-0">
            <MiniSparkline
              data={card.sparkline}
              valueFormatter={sparklineValueFormatter(card.symbol)}
              status={trendStatus[card.trend]}
              width={56}
              height={20}
              strokeWidth={1.25}
              lineOpacity={0.9}
            />
          </div>
        )}
      </div>

      {/* Linha 2: valor */}
      <p className="mt-2 text-[14.5px] font-semibold leading-none tracking-[-0.02em] text-foreground tabular-nums">
        {unit?.prefix && (
          <span className="mr-1 text-[10.5px] font-medium text-muted-foreground">
            {unit.prefix}
          </span>
        )}
        {card.value}
        {unit?.suffix && (
          <span className="ml-1 text-[9px] font-medium uppercase tracking-wider text-muted-foreground">
            {unit.suffix}
          </span>
        )}
      </p>

      {/* Linha 3: variação */}
      <p className={`mt-1 text-[10.5px] font-medium tabular-nums ${trendTone[card.trend]}`}>
        {card.changeAbs} ({card.changePct})
      </p>
    </div>
  );
}

// ─── Componente principal ───────────────────────────────────────────────────

export function MacroGlobalIsland(_props: IslandProps) {
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

  // Ordem fixa: petróleo (Brent → WTI), metal monetário (Ouro), insumo
  // industrial (Minério), risk-on (Bitcoin). Mesma sequência de /mercado.
  const cards = useMemo<IndexCard[]>(() => {
    const macro = mapGlobalMacro(explore?.marketExtras?.macroGlobal ?? null);
    if (!macro) return [];
    return [macro.brent, macro.wti, macro.gold, macro.ironOre, macro.bitcoin]
      .filter((c): c is IndexCard => c !== null);
  }, [explore]);

  return (
    <IslandShell
      icon={<Globe className="h-4 w-4 text-muted-foreground" />}
      title="Commodities e cripto"
      info="Brent e WTI (petróleo), Ouro, Minério de ferro e Bitcoin — todos em US$. São os preços que mais mexem com PETR4 (petróleo), VALE3 (minério), tese inflacionária (ouro) e apetite por risco (cripto)."
    >
      {loading ? (
        <div className="grid flex-1 grid-cols-2 gap-2 sm:grid-cols-5">
          {[0, 1, 2, 3, 4].map((i) => (
            <div key={i} className="animate-pulse rounded-2xl bg-muted" />
          ))}
        </div>
      ) : cards.length === 0 ? (
        <div className="flex flex-1 items-center justify-center px-3 py-6 text-center text-[12px] text-muted-foreground">
          Macro global indisponível.
        </div>
      ) : (
        <div className="grid flex-1 grid-cols-2 gap-2 sm:grid-cols-5">
          {cards.map((c) => (
            <MacroCard key={c.symbol} card={c} />
          ))}
        </div>
      )}
    </IslandShell>
  );
}

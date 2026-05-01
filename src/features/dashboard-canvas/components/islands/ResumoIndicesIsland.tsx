"use client";

/**
 * ResumoIndicesIsland (6×3)
 *
 * Versão dashboard do "Resumo dos índices" da tela /mercado. Diferenças
 * vs. o bloco de /mercado:
 *
 *   - Curado: 6 tickers de mercados financeiros (S&P 500, Nasdaq, Dow
 *     Jones, USD/BRL, VIX, DXY) em vez dos 11 da /mercado. Tudo
 *     equities + FX + risco — sem commodities, sem cripto.
 *     Commodities/cripto têm ilha própria (`macro_global`) pra evitar
 *     misturar leituras (financeiro ≠ ativos reais).
 *
 *   - Layout: grid 3×2 (6 cards) compacto, padding reduzido. Encaixa
 *     em ilha 6×3 (~304px), padronizando com `sinais_watchlist` e
 *     `performance_vs_ibov`.
 *
 *   - Sem texto de descrição ("mini cards para sentir direção…") — o
 *     header da ilha + tooltip "i" já explicam.
 *
 * Reaproveita `MiniSparkline`, `unitFor`, `sparklineValueFormatter` e o
 * mapper `mapIndexCardDto` — zero código novo de visualização.
 *
 * Setor de mercado complementar à `pulso_mercado` (que mostra IBOV/SMLL/IFIX —
 * índices BR) e à `macro_global` (commodities + cripto). Aqui é o
 * "mercados financeiros lá fora que movem o Brasil".
 */

import { useEffect, useMemo, useState } from "react";
import { Globe } from "lucide-react";

import { getExplore } from "@/src/features/explore/services";
import type { ExploreResponse } from "@/src/features/explore/services";
import { mapIndexCardDto } from "@/src/features/explore/services";
import type { IndexCard } from "@/src/features/explore/interfaces";
import { unitFor, sparklineValueFormatter } from "@/src/features/explore/utils/tickerUnits";
import { MiniSparkline } from "@/src/components/shared/MiniSparkline";

import type { IslandProps } from "../../interfaces/island.types";
import { IslandShell } from "../shared/IslandShell";

// ─── Curadoria ───────────────────────────────────────────────────────────────
// Ordem de exibição importa: começa pelos US equities (mais correlacionados
// com risk appetite), depois câmbio (impacto direto), VIX (gatilho de risco),
// DXY (força global do dólar — fecha o conjunto FX + risco).
//
// BTC ficou de fora intencionalmente: cripto vai pra ilha `macro_global`
// junto com commodities, pra manter aqui um recorte só de mercados
// financeiros tradicionais.
const PRIORITY_SYMBOLS: readonly string[] = [
  "^GSPC",   // S&P 500
  "^IXIC",   // Nasdaq
  "^DJI",    // Dow Jones
  "USDBRL",  // Câmbio US$/R$
  "^VIX",    // VIX (medo)
  "DXY",     // Dollar Index (força do dólar globalmente)
] as const;

// Símbolos B3 que aparecem no `indexCards` mas pertencem à ilha "Pulso do
// mercado" — filtramos pra não duplicar contexto entre ilhas.
const B3_SYMBOLS = new Set(["^BVSP", "^IBRX", "^SMLL", "^IFIX", "^IVBX2"]);

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

function IndexMiniCard({ card }: { card: IndexCard }) {
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

export function ResumoIndicesIsland(_props: IslandProps) {
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

  // Curadoria: filtra para os símbolos prioritários + ordena conforme
  // PRIORITY_SYMBOLS. Símbolos não encontrados são silenciosamente
  // omitidos — ilha encolhe naturalmente em vez de vazar placeholder.
  const cards = useMemo<IndexCard[]>(() => {
    const raw = explore?.indexCards ?? [];
    if (raw.length === 0) return [];

    // Indexa por symbol (case-sensitive — backend é consistente)
    const bySymbol = new Map<string, IndexCard>();
    for (const dto of raw) {
      if (B3_SYMBOLS.has(dto.indexTicker)) continue; // BR: ilha "pulso_mercado"
      bySymbol.set(dto.indexTicker, mapIndexCardDto(dto));
    }

    return PRIORITY_SYMBOLS
      .map((s) => bySymbol.get(s))
      .filter((c): c is IndexCard => Boolean(c));
  }, [explore]);

  return (
    <IslandShell
      icon={<Globe className="h-4 w-4 text-muted-foreground" />}
      title="Cenário externo"
      info="Mercados financeiros fora do Brasil que pesam na bolsa: ações dos EUA (S&P 500, Nasdaq, Dow), câmbio US$/R$, VIX (medo) e DXY (força do dólar global). Para B3, veja 'Pulso do mercado'; para commodities e cripto, veja 'Commodities e cripto'."
    >
      {loading ? (
        <div className="grid flex-1 grid-cols-2 grid-rows-3 gap-2 sm:grid-cols-3 sm:grid-rows-2">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="animate-pulse rounded-2xl bg-muted" />
          ))}
        </div>
      ) : cards.length === 0 ? (
        <div className="flex flex-1 items-center justify-center px-3 py-6 text-center text-[12px] text-muted-foreground">
          Resumo de índices indisponível.
        </div>
      ) : (
        <div className="grid flex-1 grid-cols-2 grid-rows-3 gap-2 sm:grid-cols-3 sm:grid-rows-2">
          {cards.map((c) => (
            <IndexMiniCard key={c.symbol} card={c} />
          ))}
        </div>
      )}
    </IslandShell>
  );
}

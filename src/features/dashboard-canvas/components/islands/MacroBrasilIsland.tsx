"use client";

/**
 * MacroBrasilIsland (6×3)
 *
 * Espelho dashboard do bloco "Macro Brasil" da tela /mercado: 3 indicadores
 * macroeconômicos do Brasil — Selic, IPCA, IBC-Br. Mostra valor atual,
 * delta vs período anterior e sparkline mensal dos últimos 24 meses.
 *
 * Por que esses 3? São os pilares do tripé macro brasileiro que o investidor
 * PF precisa monitorar:
 *   - SELIC: taxa básica de juros (define benchmark de renda fixa)
 *   - IPCA: inflação oficial (corrói retorno real)
 *   - IBC-Br: proxy mensal do PIB (sinaliza crescimento)
 *
 * Tamanho 6×3 (half-width, 304px) com 3 linhas empilhadas — pareia com
 * `Cenário externo` (também 6×3) numa única linha do grid: macro BR à
 * esquerda, macro externo à direita. Layout horizontal-list em vez de
 * mini-cards quadrados pra caber o sparkline + delta no mesmo nível,
 * sem espremer texto.
 *
 * Reaproveita o tooltip `MACRO_BR_INFO` do /mercado pra explicação
 * detalhada de cada indicador no hover do "i".
 */

import { useEffect, useState } from "react";
import { Globe } from "lucide-react";

import { getExplore } from "@/src/features/explore/services";
import type { ExploreResponse } from "@/src/features/explore/services";
import { mapMacroBr } from "@/src/features/explore/mappers/market.mappers";
import type { MacroIndicator } from "@/src/features/explore/interfaces/market.interfaces";
import { MACRO_BR_INFO } from "@/src/features/explore/utils/marketInfoCopy";
import { MiniSparkline } from "@/src/components/shared/MiniSparkline";
import { InfoTooltip } from "@/src/components/shared/InfoTooltip";
import { useElementWidth } from "@/src/hooks";

import type { IslandProps } from "../../interfaces/island.types";
import { IslandShell } from "../shared/IslandShell";

// Limites pra width dinâmico do sparkline na MacroRow.
// Min: garante legibilidade (24m pontos não comprimem demais).
// Max: cap em ~50% da largura da row pra texto continuar com espaço.
const SPARK_MIN_WIDTH = 72;
const SPARK_MAX_WIDTH = 240;

const trendTone: Record<MacroIndicator["trend"], string> = {
  up: "text-success-text",
  down: "text-danger-text",
  neutral: "text-muted-foreground",
};

const trendStatus: Record<MacroIndicator["trend"], "healthy" | "attention" | "risk"> = {
  up: "healthy",
  down: "risk",
  neutral: "attention",
};

// ─── Sub-componente: linha única ─────────────────────────────────────────────

function MacroRow({ indicator }: { indicator: MacroIndicator }) {
  const isIbc = indicator.key === "IBC_BR";
  const valueFormatter = (v: number) => {
    const n = v.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    if (indicator.key === "SELIC" || indicator.key === "IPCA") return `${n}%`;
    if (isIbc) return `${n} pts`;
    return n;
  };

  // Coluna do sparkline mede a largura RENDERIZADA via ResizeObserver e
  // passa pro MiniSparkline. Quando a ilha é esticada (growConstraints),
  // o sparkline acompanha — antes ficava preso em 72px e parecia
  // desproporcional em larguras maiores.
  const [sparkRef, sparkWidth] = useElementWidth<HTMLDivElement>();
  const dynamicWidth = Math.max(
    SPARK_MIN_WIDTH,
    Math.min(SPARK_MAX_WIDTH, Math.round(sparkWidth || SPARK_MIN_WIDTH)),
  );

  return (
    <article className="flex items-center justify-between gap-3 rounded-2xl border border-border bg-card/60 px-3 py-2.5">
      {/* Coluna texto */}
      <div className="min-w-0 flex-1">
        <p className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          {indicator.label}
          {MACRO_BR_INFO[indicator.key] && (
            <InfoTooltip label={indicator.label} content={MACRO_BR_INFO[indicator.key]} />
          )}
        </p>
        <p className="mt-0.5 flex items-baseline gap-1.5 text-[15.5px] font-semibold leading-none tracking-[-0.02em] text-foreground tabular-nums">
          <span>
            {indicator.value ?? "—"}
            {isIbc && (
              <span className="ml-0.5 text-[9.5px] font-medium uppercase tracking-wider text-muted-foreground">
                pts
              </span>
            )}
          </span>
          {indicator.changeLabel && (
            <span className={`text-[10.5px] font-medium ${trendTone[indicator.trend]}`}>
              {indicator.changeLabel}
            </span>
          )}
        </p>
        {indicator.subtitle && (
          <p className="mt-1 truncate text-[10px] leading-snug text-muted-foreground">
            {indicator.subtitle}
          </p>
        )}
      </div>

      {/* Coluna sparkline — width responsiva (clamp 72-240px). */}
      {indicator.sparkline.length > 1 && (
        <div
          ref={sparkRef}
          className="flex w-[24%] min-w-[72px] max-w-[240px] flex-col items-end gap-1"
        >
          <span className="rounded-full border border-border bg-muted/40 px-1.5 py-px text-[8.5px] font-medium uppercase tracking-wider text-muted-foreground">
            Últ. 24m
          </span>
          <MiniSparkline
            data={indicator.sparkline}
            valueFormatter={valueFormatter}
            status={trendStatus[indicator.trend]}
            width={dynamicWidth}
            height={24}
            strokeWidth={1.25}
            lineOpacity={0.9}
          />
        </div>
      )}
    </article>
  );
}

// ─── Componente principal ───────────────────────────────────────────────────

export function MacroBrasilIsland(_props: IslandProps) {
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

  const macroBr = mapMacroBr(explore?.marketExtras?.macroBr ?? null);
  // Ordem editorial: juros (input do BC) → inflação (objetivo) → atividade
  // (resultado). Mesma sequência narrativa do /mercado.
  const indicators: MacroIndicator[] = [
    macroBr?.selic,
    macroBr?.ipca,
    macroBr?.ibcBr,
  ].filter((i): i is MacroIndicator => i !== null && i !== undefined);

  return (
    <IslandShell
      icon={<Globe className="h-4 w-4 text-muted-foreground" />}
      title="Macro Brasil"
      info="Os 3 indicadores que ditam o ambiente macro local: Selic (juros básicos), IPCA (inflação oficial) e IBC-Br (proxy mensal do PIB). É o que o BC olha pra calibrar política monetária — e o que mais mexe com bolsa, renda fixa e câmbio."
    >
      {loading ? (
        <div className="flex flex-1 flex-col gap-2">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-[76px] animate-pulse rounded-2xl bg-muted" />
          ))}
        </div>
      ) : indicators.length === 0 ? (
        <div className="flex flex-1 items-center justify-center px-3 py-6 text-center text-[12px] text-muted-foreground">
          Macro Brasil indisponível.
        </div>
      ) : (
        <div className="flex flex-1 flex-col gap-2">
          {indicators.map((ind) => (
            <MacroRow key={ind.key} indicator={ind} />
          ))}
        </div>
      )}
    </IslandShell>
  );
}

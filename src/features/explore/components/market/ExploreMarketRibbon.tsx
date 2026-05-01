"use client";

/**
 * Market ribbon — ticker tape estilo Wall Street.
 *
 * Marquee infinito seamless (conteúdo duplicado + translateX(-50%) em loop).
 * - Pausa on hover (o usuário pode ler sem chase)
 * - Respeita prefers-reduced-motion (sem animação)
 * - Fades nas bordas indicam scroll contínuo
 * - Status pill fixa no canto direito (não vai com o scroll)
 *
 * SRP: apresentação + animação. Zero lógica de negócio.
 */

import { Globe } from "lucide-react";
import type { MarketRibbon } from "../../interfaces/market.interfaces";
import type { IndexCard } from "../../interfaces";
import { unitFor } from "../../utils/tickerUnits";
import { InfoTooltip } from "@/src/components/shared/InfoTooltip";
import { RIBBON_INFO, TICKER_INFO } from "../../utils/marketInfoCopy";
import { SectionCategoryTag } from "./SectionCategoryTag";

interface ExploreMarketRibbonProps {
  ribbon:     MarketRibbon | null;
  isLoading?: boolean;
}

const STATUS_CONFIG: Record<string, { label: string; tone: string }> = {
  OPEN:       { label: "Mercado aberto",   tone: "success" },
  CLOSED:     { label: "Mercado fechado",  tone: "neutral" },
  PRE_MARKET: { label: "Pré-abertura",     tone: "warning" },
};

/**
 * Pill de status do mercado (aberto/fechado/pré-abertura). Exportado
 * pra ser reusado fora do ribbon — ex: ilha "Panorama global" no
 * dashboard, que monta o mesmo conteúdo num shell diferente.
 */
export function MarketStatusPill({ status }: { status: string | null }) {
  const cfg = (status && STATUS_CONFIG[status]) || STATUS_CONFIG.CLOSED;
  const toneClass =
    cfg.tone === "success"
      ? "bg-success-surface border-success-border text-success-text"
      : cfg.tone === "warning"
      ? "bg-warning-surface border-warning-border text-warning-text"
      : "bg-muted border-border text-muted-foreground";

  return (
    <span
      className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-medium uppercase tracking-wide ${toneClass}`}
      role="status"
      aria-live="polite"
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${
          cfg.tone === "success"
            ? "bg-success-text animate-pulse"
            : cfg.tone === "warning"
            ? "bg-warning-text"
            : "bg-muted-foreground/50"
        }`}
      />
      {cfg.label}
    </span>
  );
}

function RibbonCell({ ticker }: { ticker: IndexCard }) {
  const toneClass =
    ticker.trend === "up"
      ? "text-success-text"
      : ticker.trend === "down"
      ? "text-danger-text"
      : "text-muted-foreground";

  const arrow =
    ticker.trend === "up" ? "▲" : ticker.trend === "down" ? "▼" : "●";

  const unit = unitFor(ticker.symbol);

  return (
    <div
      className="
        flex shrink-0 items-baseline gap-3 border-r border-border/60 px-6 py-2.5
      "
      aria-label={`${ticker.symbol}: ${ticker.value}${unit?.suffix ? ` ${unit.suffix}` : ""}${unit?.prefix ? ` (${unit.prefix})` : ""}, variação ${ticker.changePct}`}
    >
      <span className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
        {ticker.symbol}
      </span>
      <span className="text-sm font-semibold tabular-nums text-foreground">
        {unit?.prefix && (
          <span className="mr-0.5 text-[10px] font-medium text-muted-foreground">{unit.prefix}</span>
        )}
        {ticker.value || "—"}
        {unit?.suffix && (
          <span className="ml-0.5 text-[9px] font-medium uppercase tracking-wider text-muted-foreground">{unit.suffix}</span>
        )}
      </span>
      <span className={`text-xs font-medium tabular-nums ${toneClass}`}>
        <span className="mr-0.5 text-[10px]" aria-hidden="true">{arrow}</span>
        {ticker.changePct || "—"}
      </span>
    </div>
  );
}

function Skeleton() {
  return (
    <div className="flex animate-pulse">
      {Array.from({ length: 8 }).map((_, i) => (
        <div
          key={i}
          className="flex shrink-0 items-baseline gap-3 border-r border-border/60 px-6 py-2.5"
        >
          <div className="h-2.5 w-12 rounded bg-muted" />
          <div className="h-3.5 w-20 rounded bg-muted" />
          <div className="h-2.5 w-10 rounded bg-muted" />
        </div>
      ))}
    </div>
  );
}

/**
 * Tape interna do ribbon — apenas a faixa de marquee + skeleton/empty state.
 * Sem card, sem header. Exportado pra ser embutido em outras telas (ex:
 * ilha "Panorama global" no dashboard) sem produzir cards aninhados.
 */
export function MarketTickerTape({
  tickers,
  isLoading,
}: {
  tickers: IndexCard[];
  isLoading?: boolean;
}) {
  const hasTickers = tickers.length > 0;

  // Duração proporcional à quantidade: ~5s por ticker. Garante legibilidade
  // independente de ter 5 ou 15 itens.
  const durationSec = Math.max(30, tickers.length * 5);

  return (
    <div
      className="
        relative overflow-hidden
        [mask-image:linear-gradient(to_right,transparent,#000_6%,#000_94%,transparent)]
        [-webkit-mask-image:linear-gradient(to_right,transparent,#000_6%,#000_94%,transparent)]
      "
      aria-label="Tickers globais em scroll contínuo"
    >
      {isLoading && !hasTickers ? (
        <Skeleton />
      ) : hasTickers ? (
        <div
          className="
            mercado-ticker-track flex w-max
            group-hover:[animation-play-state:paused] hover:[animation-play-state:paused]
            motion-reduce:animate-none
          "
          style={{ animation: `mercado-ticker-scroll ${durationSec}s linear infinite` }}
        >
          {/* Dois sets idênticos — quando o primeiro sai de cena,
              o segundo já está exatamente no lugar → loop invisível. */}
          {tickers.map((t) => (
            <RibbonCell key={`a-${t.symbol}`} ticker={t} />
          ))}
          {tickers.map((t) => (
            <RibbonCell key={`b-${t.symbol}`} ticker={t} />
          ))}
        </div>
      ) : (
        <div className="flex min-h-[58px] w-full items-center justify-center px-4 py-2 text-xs text-muted-foreground">
          Dados em ingestão — confira novamente em breve.
        </div>
      )}
    </div>
  );
}

export function ExploreMarketRibbon({ ribbon, isLoading }: ExploreMarketRibbonProps) {
  const tickers = ribbon?.tickers ?? [];

  return (
    <div className="mercado-elev-sm overflow-hidden rounded-2xl border border-border bg-card">
      <div className="flex items-center justify-between border-b border-border px-4 py-2">
        <span className="inline-flex items-center gap-2 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
          <SectionCategoryTag icon={Globe} label="Contexto" categoryId="contexto-mercado" />
          Panorama global
          <InfoTooltip label="Panorama global" content={RIBBON_INFO.panorama} />
        </span>
        <div className="flex items-center gap-1.5">
          <MarketStatusPill status={ribbon?.marketStatus ?? null} />
          <InfoTooltip label="Status do mercado" content={RIBBON_INFO.marketStatus} />
        </div>
      {/* Fim do header */}
      </div>

      <MarketTickerTape tickers={tickers} isLoading={isLoading} />
    </div>
  );
}

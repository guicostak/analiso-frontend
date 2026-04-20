"use client";

/**
 * Market ribbon — faixa horizontal de tickers globais (até 10) no topo da aba
 * Contexto. Scroll-x em mobile, grid em desktop.
 *
 * Responsabilidade única: apresentação. Recebe dados já mapeados.
 * Sem lógica de negócio, sem HTTP.
 */

import type { MarketRibbon } from "../../interfaces/market.interfaces";
import type { IndexCard } from "../../interfaces";

interface ExploreMarketRibbonProps {
  ribbon:     MarketRibbon | null;
  isLoading?: boolean;
}

const STATUS_CONFIG: Record<string, { label: string; tone: string }> = {
  OPEN:       { label: "Mercado aberto",   tone: "success" },
  CLOSED:     { label: "Mercado fechado",  tone: "neutral" },
  PRE_MARKET: { label: "Pré-abertura",     tone: "warning" },
};

function StatusPill({ status }: { status: string | null }) {
  const cfg = (status && STATUS_CONFIG[status]) || STATUS_CONFIG.CLOSED;
  const toneClass =
    cfg.tone === "success"
      ? "bg-success-surface border-success-border text-success-text"
      : cfg.tone === "warning"
      ? "bg-warning-surface border-warning-border text-warning-text"
      : "bg-muted border-border text-muted-foreground";

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-medium uppercase tracking-wide ${toneClass}`}
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

  return (
    <div
      className="
        flex min-w-[160px] shrink-0 snap-start items-baseline justify-between gap-3
        border-r border-border px-4 py-2.5 last:border-r-0
      "
    >
      <div className="flex flex-col">
        <span className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
          {ticker.symbol}
        </span>
        <span className="text-sm font-semibold tabular-nums text-foreground">
          {ticker.value || "—"}
        </span>
      </div>
      <span className={`text-xs font-medium tabular-nums ${toneClass}`}>
        {ticker.changePct || "—"}
      </span>
    </div>
  );
}

function Skeleton() {
  return (
    <div className="flex animate-pulse">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="flex min-w-[160px] shrink-0 items-baseline justify-between gap-3 border-r border-border px-4 py-2.5 last:border-r-0"
        >
          <div className="flex flex-col gap-1.5">
            <div className="h-2.5 w-12 rounded bg-muted" />
            <div className="h-3.5 w-16 rounded bg-muted" />
          </div>
          <div className="h-2.5 w-10 rounded bg-muted" />
        </div>
      ))}
    </div>
  );
}

export function ExploreMarketRibbon({ ribbon, isLoading }: ExploreMarketRibbonProps) {
  const tickers = ribbon?.tickers ?? [];
  const hasTickers = tickers.length > 0;

  return (
    <div className="rounded-[20px] border border-border bg-card shadow-sm dark:shadow-none overflow-hidden">
      <div className="flex items-center justify-between border-b border-border px-4 py-2">
        <span className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
          Panorama global
        </span>
        <StatusPill status={ribbon?.marketStatus ?? null} />
      </div>

      <div className="relative">
        <div
          className="
            flex snap-x snap-mandatory overflow-x-auto scroll-smooth scrollbar-none
            sm:snap-none
          "
          aria-label="Tickers globais"
        >
          {isLoading && !hasTickers ? (
            <Skeleton />
          ) : hasTickers ? (
            tickers.map((t) => <RibbonCell key={t.symbol} ticker={t} />)
          ) : (
            <div className="flex min-h-[58px] w-full items-center justify-center px-4 py-2 text-xs text-muted-foreground">
              Dados em ingestão — confira novamente em breve.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

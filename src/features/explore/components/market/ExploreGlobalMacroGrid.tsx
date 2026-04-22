"use client";

/**
 * Grid "Macro Global" — Brent, WTI, Ouro, Minério, Bitcoin.
 * Reusa o shape de IndexCard com uma apresentação compacta.
 */

import { MiniSparkline } from "@/src/components/shared/MiniSparkline";
import type { IndexCard } from "../../interfaces";
import type { GlobalMacroBundle, MarketTimeRange } from "../../interfaces/market.interfaces";
import { SparklineRangeBadge } from "./SparklineRangeBadge";
import { resolveSparklineLabels } from "../../utils/sparklineLabels";
import { unitFor, sparklineValueFormatter } from "../../utils/tickerUnits";
import { InfoTooltip } from "@/src/components/shared/InfoTooltip";
import { GLOBAL_MACRO_INFO } from "../../utils/marketInfoCopy";

interface ExploreGlobalMacroGridProps {
  bundle: GlobalMacroBundle | null;
  range?: MarketTimeRange;
}

interface GlobalCardProps {
  label: string;
  card:  IndexCard | null;
  range?: MarketTimeRange;
  info?: string;
}

function GlobalCard({ label, card, range, info }: GlobalCardProps) {
  if (!card) {
    return (
      <article className="flex min-h-[120px] flex-col justify-between rounded-2xl border border-dashed border-border bg-card p-4">
        <p className="inline-flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
          {label}
          {info && <InfoTooltip label={label} content={info} />}
        </p>
        <p className="text-sm text-muted-foreground">Indisponível</p>
      </article>
    );
  }

  const toneClass =
    card.trend === "up"
      ? "text-success-text"
      : card.trend === "down"
      ? "text-danger-text"
      : "text-muted-foreground";

  const sparklineStatus =
    card.trend === "up" ? "healthy" : card.trend === "down" ? "risk" : "attention";

  const unit = unitFor(card.symbol);

  return (
    <article
      className="
        flex min-h-[120px] flex-col gap-2 rounded-2xl border border-border bg-card p-4
        shadow-sm dark:shadow-none
        transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md dark:hover:shadow-none
      "
    >
      {/* Header: label + badge (sparkline fica na base, com mais respiro) */}
      <div className="flex items-start justify-between gap-2">
        <p className="inline-flex min-w-0 items-center gap-1.5 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
          <span className="truncate">{label}</span>
          {info && <InfoTooltip label={label} content={info} />}
        </p>
        {card.sparkline?.length > 1 && (
          <SparklineRangeBadge range={range} />
        )}
      </div>

      {/* Valor + variação empilhados (dá espaço p/ "US$ 75.872,52") */}
      <div className="flex flex-col gap-0.5 min-w-0">
        <span className="text-lg font-semibold tabular-nums text-foreground truncate">
          {unit?.prefix && (
            <span className="mr-1 text-[12px] font-medium text-muted-foreground">{unit.prefix}</span>
          )}
          {card.value || "—"}
          {unit?.suffix && (
            <span className="ml-1 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">{unit.suffix}</span>
          )}
        </span>
        <span className={`text-xs font-medium tabular-nums ${toneClass}`}>
          {card.changePct || "—"}
        </span>
      </div>

      {/* Sparkline full-width na base */}
      {card.sparkline?.length > 1 && (
        <div className="mt-auto flex justify-end">
          <MiniSparkline
            data={card.sparkline}
            labels={resolveSparklineLabels({
              dates: card.sparklineDates,
              range,
              count: card.sparkline.length,
            })}
            valueFormatter={sparklineValueFormatter(card.symbol)}
            status={sparklineStatus}
            width={96}
            height={28}
          />
        </div>
      )}
    </article>
  );
}

export function ExploreGlobalMacroGrid({ bundle, range }: ExploreGlobalMacroGridProps) {
  if (!bundle) return null;
  return (
    <section className="space-y-4" aria-label="Macro global">
      <header>
        <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
          Commodities e cripto
        </p>
        <h3 className="text-lg font-semibold tracking-tight text-foreground">
          Macro global
        </h3>
      </header>
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        <GlobalCard label="Brent"   card={bundle.brent}   range={range} info={GLOBAL_MACRO_INFO.brent}   />
        <GlobalCard label="WTI"     card={bundle.wti}     range={range} info={GLOBAL_MACRO_INFO.wti}     />
        <GlobalCard label="Ouro"    card={bundle.gold}    range={range} info={GLOBAL_MACRO_INFO.gold}    />
        <GlobalCard label="Minério" card={bundle.ironOre} range={range} info={GLOBAL_MACRO_INFO.ironOre} />
        <GlobalCard label="Bitcoin" card={bundle.bitcoin} range={range} info={GLOBAL_MACRO_INFO.bitcoin} />
      </div>
    </section>
  );
}

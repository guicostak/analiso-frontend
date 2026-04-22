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

interface ExploreGlobalMacroGridProps {
  bundle: GlobalMacroBundle | null;
  range?: MarketTimeRange;
}

interface GlobalCardProps {
  label: string;
  card:  IndexCard | null;
  range?: MarketTimeRange;
}

function GlobalCard({ label, card, range }: GlobalCardProps) {
  if (!card) {
    return (
      <article className="flex min-h-[120px] flex-col justify-between rounded-2xl border border-dashed border-border bg-card p-4">
        <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
          {label}
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

  return (
    <article
      className="
        flex min-h-[120px] flex-col gap-2 rounded-2xl border border-border bg-card p-4
        shadow-sm dark:shadow-none
        transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md dark:hover:shadow-none
      "
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
            {label}
          </p>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-lg font-semibold tabular-nums text-foreground">
              {card.value || "—"}
            </span>
            <span className={`text-xs font-medium tabular-nums ${toneClass}`}>
              {card.changePct || "—"}
            </span>
          </div>
        </div>
        {card.sparkline?.length > 1 && (
          <div className="flex shrink-0 flex-col items-end gap-1">
            <SparklineRangeBadge range={range} />
            <MiniSparkline
              data={card.sparkline}
              labels={resolveSparklineLabels({
                dates: card.sparklineDates,
                range,
                count: card.sparkline.length,
              })}
              status={sparklineStatus}
              width={64}
              height={28}
            />
          </div>
        )}
      </div>
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
        <GlobalCard label="Brent"   card={bundle.brent}   range={range} />
        <GlobalCard label="WTI"     card={bundle.wti}     range={range} />
        <GlobalCard label="Ouro"    card={bundle.gold}    range={range} />
        <GlobalCard label="Minério" card={bundle.ironOre} range={range} />
        <GlobalCard label="Bitcoin" card={bundle.bitcoin} range={range} />
      </div>
    </section>
  );
}

"use client";

/**
 * Card genérico de indicador macro (Selic, IPCA, IBC-Br).
 * Reusado pelos 3 indicadores — SRP: apenas apresentação.
 */

import { MiniSparkline } from "@/src/components/shared/MiniSparkline";
import type { MacroIndicator } from "../../interfaces/market.interfaces";
import { SparklineRangeBadge } from "./SparklineRangeBadge";
import { resolveSparklineLabels } from "../../utils/sparklineLabels";
import { InfoTooltip } from "@/src/components/shared/InfoTooltip";
import { MACRO_BR_INFO } from "../../utils/marketInfoCopy";

interface ExploreMacroCardProps {
  indicator: MacroIndicator | null;
  /**
   * Label do range temporal da sparkline. Macro BR é mensal com janela fixa —
   * default "Últ. 24m". Passe outro valor só se a janela mudar.
   */
  rangeLabel?: string;
}

export function ExploreMacroCard({ indicator, rangeLabel = "Últ. 24m" }: ExploreMacroCardProps) {
  if (!indicator) {
    return (
      <article className="flex min-h-[140px] flex-col justify-center rounded-2xl border border-dashed border-border bg-card p-5 text-center">
        <p className="text-sm text-muted-foreground">
          Dado macro indisponível
        </p>
      </article>
    );
  }

  const toneClass =
    indicator.trend === "up"
      ? "text-success-text"
      : indicator.trend === "down"
      ? "text-danger-text"
      : "text-muted-foreground";

  const sparklineStatus =
    indicator.trend === "up"
      ? "healthy"
      : indicator.trend === "down"
      ? "risk"
      : "attention";

  return (
    <article
      className="
        flex min-h-[160px] flex-col gap-3 rounded-2xl border border-border bg-card p-5
        shadow-sm dark:shadow-none
        transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md dark:hover:shadow-none
      "
    >
      <header className="flex items-start justify-between gap-3">
        <div>
          <p className="inline-flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
            {indicator.label}
            {MACRO_BR_INFO[indicator.key] && (
              <InfoTooltip label={indicator.label} content={MACRO_BR_INFO[indicator.key]} />
            )}
          </p>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-2xl font-semibold tabular-nums text-foreground">
              {indicator.value ?? "—"}
              {indicator.key === "IBC_BR" && (
                <span className="ml-1 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">pts</span>
              )}
            </span>
            {indicator.changeLabel && (
              <span className={`text-xs font-medium tabular-nums ${toneClass}`}>
                {indicator.changeLabel}
              </span>
            )}
          </div>
        </div>
        {indicator.sparkline.length > 1 && (
          <div className="flex shrink-0 flex-col items-end gap-1">
            <SparklineRangeBadge fixed={rangeLabel} />
            <MiniSparkline
              data={indicator.sparkline}
              labels={resolveSparklineLabels({
                dates: indicator.sparklineDates,
                range: null,
                count: indicator.sparkline.length,
                flavor: "monthly",
              })}
              valueFormatter={(v) => {
                const n = v.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
                if (indicator.key === "SELIC" || indicator.key === "IPCA") return `${n}%`;
                if (indicator.key === "IBC_BR") return `${n} pts`;
                return n;
              }}
              status={sparklineStatus}
              width={80}
              height={32}
            />
          </div>
        )}
      </header>

      {indicator.subtitle && (
        <p className="text-[11px] leading-relaxed text-muted-foreground">
          {indicator.subtitle}
        </p>
      )}

      {indicator.asOfDate && (
        <footer className="mt-auto text-[10px] uppercase tracking-wide text-muted-foreground/70">
          Ref: {indicator.asOfDate}
        </footer>
      )}
    </article>
  );
}

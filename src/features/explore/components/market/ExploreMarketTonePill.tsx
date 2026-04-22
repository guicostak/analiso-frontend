"use client";

/**
 * Pill do "tom de mercado" exibida no hero do contexto.
 * Mostra BULLISH/NEUTRAL/BEARISH + bullets do que mudou desde ontem.
 */

import type { MarketToneHighlights } from "../../interfaces/market.interfaces";
import { InfoTooltip } from "@/src/components/shared/InfoTooltip";
import { TONE_INFO } from "../../utils/marketInfoCopy";

interface ExploreMarketTonePillProps {
  tone: MarketToneHighlights | null;
}

export function ExploreMarketTonePill({ tone }: ExploreMarketTonePillProps) {
  if (!tone) return null;

  const toneClass =
    tone.tone === "BULLISH"
      ? "bg-success-surface border-success-border text-success-text"
      : tone.tone === "BEARISH"
      ? "bg-danger-surface border-danger-border text-danger-text"
      : "bg-warning-surface border-warning-border text-warning-text";

  const dotClass =
    tone.tone === "BULLISH"
      ? "bg-success-text"
      : tone.tone === "BEARISH"
      ? "bg-danger-text"
      : "bg-warning-text";

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-1.5">
        <span
          className={`inline-flex w-fit items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-medium uppercase tracking-wide ${toneClass}`}
        >
          <span className={`h-1.5 w-1.5 rounded-full ${dotClass} animate-pulse`} />
          {tone.label}
        </span>
        <InfoTooltip label="Tom de mercado" content={TONE_INFO} />
      </div>
      {tone.highlights.length > 0 && (
        <ul className="flex flex-col gap-0.5 text-[11px] text-muted-foreground">
          {tone.highlights.slice(0, 3).map((h, i) => (
            <li key={i} className="flex items-start gap-1.5">
              <span className="mt-1 h-1 w-1 shrink-0 rounded-full bg-muted-foreground/40" />
              <span>{h}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

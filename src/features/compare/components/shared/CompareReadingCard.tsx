"use client";

import type {
  CompareDimensionKey,
  CompareDimensionReading,
  CompareReadingEvidence,
  CompareReadingLimitation,
} from "../../interfaces";

interface CompareReadingCardProps {
  a: CompareDimensionReading;
  b: CompareDimensionReading;
  tickerA: string;
  tickerB: string;
  dimension: CompareDimensionKey;
}

type Side = "a" | "b";

function sideBorderClass(side: Side) {
  return side === "a" ? "border-brand-border" : "border-compare-b-border";
}

function sideSurfaceClass(side: Side) {
  return side === "a" ? "bg-brand-surface" : "bg-compare-b-surface";
}

function sideTextClass(side: Side) {
  return side === "a" ? "text-brand-text" : "text-compare-b-text";
}

const DIMENSION_LABEL: Record<CompareDimensionKey, string> = {
  value: "Valuation",
  future: "Crescimento Futuro",
  past: "Performance Passada",
  health: "Saude Financeira",
  dividend: "Dividendos",
};

function badgeTone(badge: string): string {
  const upper = (badge ?? "").toUpperCase();
  if (
    upper.includes("ATRA") ||
    upper.includes("FORTE") ||
    upper.includes("SAUD") ||
    upper.includes("BOM") ||
    upper.includes("DESC")
  ) {
    return "bg-success-surface text-success-text border-success-border";
  }
  if (
    upper.includes("RISC") ||
    upper.includes("PREMI") ||
    upper.includes("FRACO") ||
    upper.includes("CARO")
  ) {
    return "bg-danger-surface text-danger-text border-danger-border";
  }
  if (upper.includes("ATEN") || upper.includes("PRESS") || upper.includes("MODER")) {
    return "bg-warning-surface text-warning-text border-warning-border";
  }
  return "bg-muted text-muted-foreground border-border";
}

function ReadingColumn({
  reading,
  ticker,
  side,
}: {
  reading: CompareDimensionReading;
  ticker: string;
  side: Side;
}) {
  const evidences = reading.evidences ?? [];
  const limitations = reading.limitations ?? [];

  return (
    <div
      className={`rounded-2xl border ${sideBorderClass(side)} ${sideSurfaceClass(side)} p-4 space-y-3`}
    >
      <div className="flex items-center justify-between gap-2">
        <span className={`text-xs font-bold uppercase tracking-wider ${sideTextClass(side)}`}>
          {ticker}
        </span>
        {reading.badge && (
          <span
            className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${badgeTone(
              reading.badge,
            )}`}
          >
            {reading.badge}
          </span>
        )}
      </div>

      <div className="space-y-1">
        <p className="text-sm font-semibold text-foreground leading-snug">
          {reading.headline}
        </p>
        {reading.subtitle && (
          <p className="text-[11px] text-muted-foreground leading-snug">
            {reading.subtitle}
          </p>
        )}
      </div>

      {evidences.length > 0 && (
        <div className="space-y-1.5">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Evidencias
          </p>
          <ul className="space-y-1.5">
            {evidences.map((ev: CompareReadingEvidence, i: number) => (
              <li
                key={`ev-${i}`}
                className={`relative rounded-md bg-card/60 border-l-2 ${
                  side === "a" ? "border-l-[var(--brand)]" : "border-l-[var(--compare-b)]"
                } px-2.5 py-1.5`}
              >
                <p className="text-[11px] font-medium text-foreground leading-tight">
                  {ev.criterion}
                </p>
                <p className="text-[10px] text-muted-foreground leading-tight mt-0.5">
                  {ev.observed}
                  {ev.reference ? ` vs ${ev.reference}` : ""}
                </p>
                {ev.microText && (
                  <p className="text-[10px] text-muted-foreground/80 italic mt-0.5">
                    {ev.microText}
                  </p>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      {limitations.length > 0 && (
        <div className="space-y-1.5">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Limitacoes
          </p>
          <ul className="space-y-1.5">
            {limitations.map((lim: CompareReadingLimitation, i: number) => (
              <li
                key={`lim-${i}`}
                className="relative rounded-md bg-card/60 border-l-2 border-l-amber-500 px-2.5 py-1.5"
              >
                <p className="text-[11px] font-medium text-foreground leading-tight">
                  {lim.criterion}
                </p>
                <p className="text-[10px] text-muted-foreground leading-tight mt-0.5">
                  {lim.observed}
                  {lim.reference ? ` vs ${lim.reference}` : ""}
                </p>
                {lim.microText && (
                  <p className="text-[10px] text-muted-foreground/80 italic mt-0.5">
                    {lim.microText}
                  </p>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      {reading.synthesis && (
        <p className="text-[11px] text-muted-foreground leading-snug border-t border-border/50 pt-2">
          {reading.synthesis}
        </p>
      )}
    </div>
  );
}

export function CompareReadingCard({
  a,
  b,
  tickerA,
  tickerB,
  dimension,
}: CompareReadingCardProps) {
  if (!a && !b) return null;

  return (
    <div className="space-y-2">
      <h4 className="text-[12px] font-semibold text-muted-foreground uppercase tracking-wider">
        Leitura — {DIMENSION_LABEL[dimension]}
      </h4>
      <div className="compare-side-grid">
        <ReadingColumn reading={a} ticker={tickerA} side="a" />
        <ReadingColumn reading={b} ticker={tickerB} side="b" />
      </div>
    </div>
  );
}

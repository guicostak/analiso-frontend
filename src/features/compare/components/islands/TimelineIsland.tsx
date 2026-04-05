"use client";

import { Calendar } from "lucide-react";
import type {
  CompareEnrichedCompany,
  ComparePillar,
  CompareEventItem,
} from "../../interfaces";

/* ── Types ────────────────────────────────────────────────────────────────── */

interface TimelineIslandProps {
  a: CompareEnrichedCompany;
  b: CompareEnrichedCompany;
  events: CompareEventItem[];
  PILLAR_LABEL: Record<ComparePillar, string>;
}

/* ── Event Card ───────────────────────────────────────────────────────────── */

function EventCard({
  event,
  side,
  PILLAR_LABEL,
}: {
  event: CompareEventItem;
  side: "a" | "b";
  PILLAR_LABEL: Record<ComparePillar, string>;
}) {
  const borderClass =
    side === "a" ? "border-brand-border" : "border-compare-b-border";
  const dotColor = side === "a" ? "bg-brand" : "bg-compare-b";
  const accentText = side === "a" ? "text-brand-text" : "text-compare-b-text";

  return (
    <div className={`rounded-xl border ${borderClass} bg-card p-3 space-y-2`}>
      {/* Date + type */}
      <div className="flex items-center gap-2">
        <Calendar className="h-3 w-3 text-muted-foreground" />
        <span className="text-[10px] text-muted-foreground">{event.date}</span>
        <span
          className={`inline-flex items-center rounded-full border border-border bg-muted px-2 py-0.5 text-[9px] font-medium text-muted-foreground`}
        >
          {event.type}
        </span>
      </div>

      {/* Summary */}
      <p className="text-[12px] leading-relaxed text-foreground">
        {event.summary}
      </p>

      {/* Impact pillar badge */}
      <div className="flex items-center gap-1.5">
        <div className={`h-1.5 w-1.5 rounded-full ${dotColor}`} />
        <span className={`text-[10px] font-medium ${accentText}`}>
          {PILLAR_LABEL[event.impact]}
        </span>
      </div>
    </div>
  );
}

/* ── Main Component ───────────────────────────────────────────────────────── */

export function TimelineIsland({
  a,
  b,
  events,
  PILLAR_LABEL,
}: TimelineIslandProps) {
  // Sort events by date descending
  const sorted = [...events].sort((x, y) => {
    // Try dd/mm/yyyy parsing
    const parseDate = (d: string) => {
      const parts = d.split("/").map(Number);
      if (parts.length === 3) {
        return new Date(parts[2], parts[1] - 1, parts[0]).getTime();
      }
      return new Date(d).getTime();
    };
    return parseDate(y.date) - parseDate(x.date);
  });

  return (
    <div className="compare-island compare-surface p-6 scroll-mt-[160px] space-y-5">
      <h3 className="text-base font-semibold text-foreground">
        Timeline de eventos (90 dias)
      </h3>

      {sorted.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Nenhum evento encontrado no periodo.
        </p>
      ) : (
        <div className="relative">
          {/* Center line (desktop only) */}
          <div className="absolute left-1/2 top-0 hidden h-full w-px -translate-x-1/2 bg-border md:block" />

          <div className="space-y-4">
            {sorted.map((event, idx) => {
              const isA = event.ticker === a.ticker;
              const side = isA ? "a" : "b";

              return (
                <div
                  key={event.id}
                  className={`relative flex ${
                    isA
                      ? "md:flex-row md:pr-[52%]"
                      : "md:flex-row-reverse md:pl-[52%]"
                  }`}
                >
                  {/* Dot on center line (desktop) */}
                  <div
                    className={`absolute left-1/2 top-4 hidden h-3 w-3 -translate-x-1/2 rounded-full border-2 border-white shadow-sm md:block ${
                      isA ? "bg-brand" : "bg-compare-b"
                    }`}
                  />

                  {/* Card */}
                  <div className="w-full">
                    <EventCard
                      event={event}
                      side={side}
                      PILLAR_LABEL={PILLAR_LABEL}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

"use client";

import type {
  CompareDimensionCheck,
  CompareDimensionCheckItem,
} from "../../interfaces";

interface CompareDimensionCheckCardProps {
  a: CompareDimensionCheck;
  b: CompareDimensionCheck;
  tickerA: string;
  tickerB: string;
}

function CheckIcon({ passes }: { passes: boolean }) {
  return (
    <span
      className={`inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${
        passes
          ? "bg-success-surface text-success-text border border-success-border"
          : "bg-danger-surface text-danger-text border border-danger-border"
      }`}
      aria-label={passes ? "passa" : "nao passa"}
    >
      {passes ? "✓" : "✗"}
    </span>
  );
}

function CheckCell({
  item,
  side,
}: {
  item: CompareDimensionCheckItem | undefined;
  side: "a" | "b";
}) {
  if (!item) {
    return (
      <div className="text-center text-[10px] text-muted-foreground/50">—</div>
    );
  }
  return (
    <div className="flex items-center justify-center gap-1.5 text-[11px]">
      <CheckIcon passes={item.passes} />
      <div className="text-left leading-tight">
        <div className="font-semibold text-foreground">{item.observed}</div>
        {item.reference && (
          <div className="text-[9px] text-muted-foreground">
            ref {item.reference}
          </div>
        )}
      </div>
    </div>
  );
}

export function CompareDimensionCheckCard({
  a,
  b,
  tickerA,
  tickerB,
}: CompareDimensionCheckCardProps) {
  // Build a unified row list keyed by label, preserving order from A
  const rows: { label: string; aItem?: CompareDimensionCheckItem; bItem?: CompareDimensionCheckItem }[] = [];
  const seen = new Set<string>();

  for (const it of a?.items ?? []) {
    rows.push({
      label: it.label,
      aItem: it,
      bItem: b?.items?.find((x) => x.label === it.label),
    });
    seen.add(it.label);
  }
  for (const it of b?.items ?? []) {
    if (seen.has(it.label)) continue;
    rows.push({ label: it.label, bItem: it });
  }

  if (rows.length === 0) return null;

  return (
    <div className="space-y-2">
      <h4 className="text-[12px] font-semibold text-muted-foreground uppercase tracking-wider">
        Criterios da Dimensao
      </h4>
      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        <div className="grid grid-cols-[1fr_2fr_1fr] gap-0 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground bg-muted/50 px-4 py-2.5">
          <span className="text-center">{tickerA}</span>
          <span className="text-center">Criterio</span>
          <span className="text-center">{tickerB}</span>
        </div>

        {rows.map((row, i) => (
          <div
            key={`${row.label}-${i}`}
            className={`grid grid-cols-[1fr_2fr_1fr] gap-0 px-4 py-2.5 items-center ${
              i % 2 === 0 ? "" : "bg-muted/20"
            }`}
          >
            <CheckCell item={row.aItem} side="a" />
            <div className="text-center text-[11px] font-medium text-foreground leading-tight px-2">
              {row.label}
              {(row.aItem?.microText || row.bItem?.microText) && (
                <div className="text-[9px] text-muted-foreground/80 italic mt-0.5">
                  {row.aItem?.microText || row.bItem?.microText}
                </div>
              )}
            </div>
            <CheckCell item={row.bItem} side="b" />
          </div>
        ))}

        <div className="grid grid-cols-[1fr_2fr_1fr] gap-0 px-4 py-2 items-center border-t border-border bg-muted/30 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          <span className="text-center text-brand-text">
            {a?.passed ?? 0}/{a?.total ?? 0}
          </span>
          <span className="text-center">aprovados</span>
          <span className="text-center text-compare-b-text">
            {b?.passed ?? 0}/{b?.total ?? 0}
          </span>
        </div>
      </div>
    </div>
  );
}

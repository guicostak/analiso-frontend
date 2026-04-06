"use client";

import type { CompareSectionCriteriaItem } from "../../interfaces";

interface CompareSectionCriteriaProps {
  a: CompareSectionCriteriaItem[];
  b: CompareSectionCriteriaItem[];
  tickerA: string;
  tickerB: string;
  title?: string;
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

function CriteriaCell({ item }: { item: CompareSectionCriteriaItem | undefined }) {
  if (!item) {
    return <div className="text-center text-[10px] text-muted-foreground/50">—</div>;
  }
  return (
    <div className="flex items-start gap-1.5">
      <CheckIcon passes={item.passes} />
      <p className="text-[10px] leading-tight text-muted-foreground">
        {item.statement}
      </p>
    </div>
  );
}

export function CompareSectionCriteria({
  a,
  b,
  tickerA,
  tickerB,
  title,
}: CompareSectionCriteriaProps) {
  const rows: { label: string; aItem?: CompareSectionCriteriaItem; bItem?: CompareSectionCriteriaItem }[] = [];
  const seen = new Set<string>();

  for (const it of a ?? []) {
    rows.push({
      label: it.label,
      aItem: it,
      bItem: (b ?? []).find((x) => x.label === it.label),
    });
    seen.add(it.label);
  }
  for (const it of b ?? []) {
    if (seen.has(it.label)) continue;
    rows.push({ label: it.label, bItem: it });
  }

  if (rows.length === 0) return null;

  return (
    <div className="rounded-xl border border-border bg-card/50 overflow-hidden">
      {title && (
        <div className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground bg-muted/40 border-b border-border">
          {title}
        </div>
      )}
      <div className="grid grid-cols-[1fr_1.4fr_1fr] gap-0 text-[9px] font-semibold uppercase tracking-wider text-muted-foreground bg-muted/30 px-3 py-1.5">
        <span className="text-left">{tickerA}</span>
        <span className="text-center">Criterio</span>
        <span className="text-left">{tickerB}</span>
      </div>
      {rows.map((row, i) => (
        <div
          key={`${row.label}-${i}`}
          className={`grid grid-cols-[1fr_1.4fr_1fr] gap-2 px-3 py-2 items-start ${
            i % 2 === 0 ? "" : "bg-muted/15"
          }`}
        >
          <CriteriaCell item={row.aItem} />
          <div className="text-center text-[10px] font-medium text-foreground leading-tight">
            {row.label}
          </div>
          <CriteriaCell item={row.bItem} />
        </div>
      ))}
    </div>
  );
}

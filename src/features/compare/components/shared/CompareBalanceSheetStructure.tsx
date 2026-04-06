"use client";

import type { CompareBalanceSheet, CompareBalanceSegment } from "../../interfaces";

interface CompareBalanceSheetStructureProps {
  a: CompareBalanceSheet | undefined;
  b: CompareBalanceSheet | undefined;
  tickerA: string;
  tickerB: string;
  formatNumber: (v: number, d?: number) => string;
}

const ASSET_COLORS: Record<string, string> = {
  cash: "#10b981",
  receivables: "#34d399",
  inventory: "#6ee7b7",
  physical: "#a7f3d0",
  longTermOther: "#d1fae5",
};

const LIAB_COLORS: Record<string, string> = {
  payables: "#f87171",
  debt: "#ef4444",
  otherLiab: "#fca5a5",
  equity: "#60a5fa",
};

function colorFor(side: "asset" | "liab", key: string, fallback: string): string {
  const map = side === "asset" ? ASSET_COLORS : LIAB_COLORS;
  return map[key] ?? fallback;
}

function StackedBar({
  segments,
  side,
  total,
}: {
  segments: CompareBalanceSegment[];
  side: "asset" | "liab";
  total: number;
}) {
  if (!segments.length || total === 0) {
    return (
      <div className="h-6 w-full rounded-md bg-muted/40 flex items-center justify-center text-[9px] text-muted-foreground/60">
        sem dados
      </div>
    );
  }
  return (
    <div className="flex h-6 w-full overflow-hidden rounded-md border border-border">
      {segments.map((s, i) => {
        const pct = (s.value / total) * 100;
        if (pct <= 0) return null;
        return (
          <div
            key={`${s.key}-${i}`}
            style={{
              width: `${pct}%`,
              backgroundColor: colorFor(side, s.key, side === "asset" ? "#10b981" : "#ef4444"),
            }}
            title={`${s.label}: ${pct.toFixed(1)}%`}
          />
        );
      })}
    </div>
  );
}

function CompanyBalance({
  ticker,
  sheet,
  formatNumber,
}: {
  ticker: string;
  sheet: CompareBalanceSheet | undefined;
  formatNumber: (v: number, d?: number) => string;
}) {
  const assets = sheet?.assets ?? [];
  const liabilities = sheet?.liabilities ?? [];
  const totalAssets = assets.reduce((acc, s) => acc + (s.value || 0), 0);
  const totalLiab = liabilities.reduce((acc, s) => acc + (s.value || 0), 0);
  const total = Math.max(totalAssets, totalLiab, 1);

  return (
    <div className="rounded-2xl border border-border bg-card p-4 space-y-3">
      <div className="text-xs font-semibold text-foreground">{ticker}</div>

      <div className="space-y-1">
        <div className="flex items-center justify-between text-[10px] text-muted-foreground">
          <span>Ativos</span>
          <span>{formatNumber(totalAssets, 0)}</span>
        </div>
        <StackedBar segments={assets} side="asset" total={total} />
      </div>

      <div className="space-y-1">
        <div className="flex items-center justify-between text-[10px] text-muted-foreground">
          <span>Passivos + PL</span>
          <span>{formatNumber(totalLiab, 0)}</span>
        </div>
        <StackedBar segments={liabilities} side="liab" total={total} />
      </div>

      <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[9px] pt-1">
        {assets.map((s) => (
          <div key={`a-${s.key}`} className="flex items-center gap-1.5 min-w-0">
            <span
              className="inline-block h-2 w-2 rounded-sm shrink-0"
              style={{ backgroundColor: colorFor("asset", s.key, "#10b981") }}
            />
            <span className="text-muted-foreground truncate">{s.label}</span>
            <span className="ml-auto text-foreground font-medium">
              {(s.percent * 100).toFixed(0)}%
            </span>
          </div>
        ))}
        {liabilities.map((s) => (
          <div key={`l-${s.key}`} className="flex items-center gap-1.5 min-w-0">
            <span
              className="inline-block h-2 w-2 rounded-sm shrink-0"
              style={{ backgroundColor: colorFor("liab", s.key, "#ef4444") }}
            />
            <span className="text-muted-foreground truncate">{s.label}</span>
            <span className="ml-auto text-foreground font-medium">
              {(s.percent * 100).toFixed(0)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function CompareBalanceSheetStructure({
  a,
  b,
  tickerA,
  tickerB,
  formatNumber,
}: CompareBalanceSheetStructureProps) {
  return (
    <div className="space-y-2">
      <h4 className="text-[12px] font-semibold text-muted-foreground uppercase tracking-wider">
        Estrutura do Balanco
      </h4>
      <div className="compare-side-grid">
        <CompanyBalance ticker={tickerA} sheet={a} formatNumber={formatNumber} />
        <CompanyBalance ticker={tickerB} sheet={b} formatNumber={formatNumber} />
      </div>
    </div>
  );
}

"use client";

import type {
  CompareEnrichedCompany,
  ComparePillar,
  CompareRangeKey,
  CompareRangeOption,
  CompareCategorySlug,
  CompareCategoryDef,
} from "../../interfaces";

/* ── Types ────────────────────────────────────────────────────────────────── */

interface CompareHeaderProps {
  a: CompareEnrichedCompany;
  b: CompareEnrichedCompany;
  activePillar: ComparePillar;
  categoria: CompareCategorySlug;
  range: CompareRangeKey;
  onSelectPillar: (p: ComparePillar) => void;
  onSetCategoria: (c: CompareCategorySlug) => void;
  onSetRange: (r: CompareRangeKey) => void;
  PILLAR_LABEL: Record<ComparePillar, string>;
  RANGES: CompareRangeOption[];
  PILLARS: ComparePillar[];
  CATEGORIES: CompareCategoryDef[];
  compactSticky?: boolean;
}

/* ── Sub-components ───────────────────────────────────────────────────────── */

function CompanyBadge({
  company,
  side,
}: {
  company: CompareEnrichedCompany;
  side: "a" | "b";
}) {
  const changeColor =
    company.change1d >= 0 ? "text-success-text" : "text-danger-text";
  const changeSign = company.change1d >= 0 ? "+" : "";
  const bgClass =
    side === "a"
      ? "bg-brand-surface text-brand-text"
      : "bg-compare-b-surface text-compare-b-text";

  return (
    <div className="flex items-center gap-3">
      {company.logo ? (
        <img
          src={company.logo}
          alt={company.ticker}
          className="h-8 w-8 rounded-full border border-border bg-muted object-cover"
        />
      ) : (
        <div
          className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold ${bgClass}`}
        >
          {company.ticker.charAt(0)}
        </div>
      )}

      <div className="flex flex-col">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-foreground">
            {company.ticker}
          </span>
          <span className="text-[11px] text-muted-foreground">
            {company.sector}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-foreground">
            R$ {company.price.toFixed(2)}
          </span>
          <span className={`text-[11px] font-medium ${changeColor}`}>
            {changeSign}
            {company.change1d.toFixed(2)}%
          </span>
        </div>
      </div>
    </div>
  );
}

/* ── Main Component ───────────────────────────────────────────────────────── */

export function CompareHeader({
  a,
  b,
  activePillar,
  categoria,
  range,
  onSelectPillar,
  onSetCategoria,
  onSetRange,
  PILLAR_LABEL,
  RANGES,
  PILLARS,
  CATEGORIES,
  compactSticky = false,
}: CompareHeaderProps) {
  return (
    <header
      className="sticky top-14 z-10 mb-6 rounded-[28px] border border-border bg-card/80 py-8 backdrop-blur-lg"
    >
      <div className="mx-auto max-w-7xl px-4">
        {/* ── Top row: A  [periods]  B ── */}
        <div className="flex items-center justify-between gap-4">
          {/* Company A */}
          <CompanyBadge company={a} side="a" />

          {/* Center controls */}
          <div className="flex flex-col items-center gap-2">
            {/* Period selector pills */}
            <div className="flex flex-wrap items-center justify-center gap-1">
              {RANGES.filter((r) => r.key !== "custom").map((r) => (
                <button
                  key={r.key}
                  onClick={() => onSetRange(r.key)}
                  className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-medium transition-colors ${
                    range === r.key
                      ? "bg-foreground text-card"
                      : "border border-border bg-card text-muted-foreground hover:bg-muted"
                  }`}
                >
                  {r.label}
                </button>
              ))}
            </div>
          </div>

          {/* Company B */}
          <CompanyBadge company={b} side="b" />
        </div>

        {/* ── Category navigation tabs ── */}
        <div
          className="flex items-center justify-center gap-1 overflow-x-auto scrollbar-hide mt-6"
        >
          {CATEGORIES.map((c) => (
            <button
              key={c.slug}
              onClick={() => onSetCategoria(c.slug)}
              className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-[12px] font-medium transition-colors whitespace-nowrap ${
                categoria === c.slug
                  ? "bg-brand text-white"
                  : "border border-border bg-card text-muted-foreground hover:bg-muted"
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>
    </header>
  );
}

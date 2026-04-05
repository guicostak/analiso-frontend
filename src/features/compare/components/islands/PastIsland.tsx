"use client";

import type { CompareEnrichedCompany } from "../../interfaces";

/* ── Types ────────────────────────────────────────────────────────────────── */

interface PastIslandProps {
  a: CompareEnrichedCompany;
  b: CompareEnrichedCompany;
  formatNumber: (value: number, digits?: number) => string;
}

/* ── Revenue & Earnings Trend (SVG bar + line) ────────────────────────────── */

function RevEarningsChart({
  company,
  side,
  formatNumber,
}: {
  company: CompareEnrichedCompany;
  side: "a" | "b";
  formatNumber: (value: number, digits?: number) => string;
}) {
  const { revenueSeries, earningsSeries } = company.pastData;
  if (!revenueSeries.length) return null;

  const svgW = 280;
  const svgH = 140;
  const padX = 28;
  const padY = 16;
  const padBottom = 20;
  const plotW = svgW - padX * 2;
  const plotH = svgH - padY - padBottom;

  const allValues = [
    ...revenueSeries.map((s) => s.value),
    ...earningsSeries.map((s) => s.value),
  ];
  const maxVal = Math.max(...allValues, 1);
  const minVal = Math.min(0, ...allValues);
  const range = maxVal - minVal || 1;

  const barWidth = plotW / revenueSeries.length - 4;
  const barColor = side === "a" ? "var(--brand)" : "var(--compare-b)";
  const lineColor = side === "a" ? "#0B7A6E" : "#3965B8";

  function valToY(v: number): number {
    return padY + plotH - ((v - minVal) / range) * plotH;
  }

  // Line path for earnings
  const earningsPath = earningsSeries
    .map((s, i) => {
      const x = padX + (i / Math.max(earningsSeries.length - 1, 1)) * plotW;
      const y = valToY(s.value);
      return `${i === 0 ? "M" : "L"} ${x},${y}`;
    })
    .join(" ");

  return (
    <div className="space-y-2">
      <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
        {company.ticker} - Receita & Lucro
      </span>
      <svg
        viewBox={`0 0 ${svgW} ${svgH}`}
        className="w-full"
        preserveAspectRatio="xMidYMid meet"
      >
        {/* Revenue bars */}
        {revenueSeries.map((s, i) => {
          const x = padX + (i / revenueSeries.length) * plotW + 2;
          const barH = ((s.value - minVal) / range) * plotH;
          const y = padY + plotH - barH;
          return (
            <rect
              key={`bar-${i}`}
              x={x}
              y={y}
              width={barWidth}
              height={barH}
              rx={3}
              fill={barColor}
              opacity={0.35}
            />
          );
        })}

        {/* Earnings line */}
        {earningsPath && (
          <path
            d={earningsPath}
            fill="none"
            stroke={lineColor}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )}

        {/* Earnings dots */}
        {earningsSeries.map((s, i) => {
          const x =
            padX + (i / Math.max(earningsSeries.length - 1, 1)) * plotW;
          const y = valToY(s.value);
          return (
            <circle key={`dot-${i}`} cx={x} cy={y} r="2.5" fill={lineColor} />
          );
        })}

        {/* Year labels */}
        {revenueSeries.map((s, i) => {
          const x =
            padX + (i / revenueSeries.length) * plotW + barWidth / 2 + 2;
          return (
            <text
              key={`yr-${i}`}
              x={x}
              y={svgH - 4}
              textAnchor="middle"
              className="fill-muted-foreground"
              style={{ fontSize: 8 }}
            >
              {s.year}
            </text>
          );
        })}
      </svg>
      {/* Legend */}
      <div className="flex items-center gap-4 text-[10px] text-muted-foreground">
        <span className="flex items-center gap-1">
          <span
            className="inline-block h-2.5 w-2.5 rounded-sm"
            style={{ backgroundColor: barColor, opacity: 0.35 }}
          />
          Receita
        </span>
        <span className="flex items-center gap-1">
          <span
            className="inline-block h-0.5 w-3 rounded-full"
            style={{ backgroundColor: lineColor }}
          />
          Lucro
        </span>
      </div>
    </div>
  );
}

/* ── Margins Comparison ───────────────────────────────────────────────────── */

function MarginsComparison({
  a,
  b,
  formatNumber,
}: {
  a: CompareEnrichedCompany;
  b: CompareEnrichedCompany;
  formatNumber: (value: number, digits?: number) => string;
}) {
  const margins = [
    {
      label: "Bruta",
      aVal: a.pastData.grossMargin,
      bVal: b.pastData.grossMargin,
    },
    {
      label: "Operacional",
      aVal: a.pastData.operatingMargin,
      bVal: b.pastData.operatingMargin,
    },
    {
      label: "Liquida",
      aVal: a.pastData.netMargin,
      bVal: b.pastData.netMargin,
    },
  ];

  const maxVal = Math.max(
    ...margins.map((m) => Math.max(Math.abs(m.aVal), Math.abs(m.bVal))),
    1,
  );

  return (
    <div className="space-y-3">
      <h4 className="text-[12px] font-semibold text-foreground uppercase tracking-wider">
        Margens
      </h4>
      {margins.map((m) => (
        <div key={m.label} className="space-y-1">
          <span className="text-[11px] text-muted-foreground">{m.label}</span>
          <div className="space-y-1">
            {/* Bar A */}
            <div className="flex items-center gap-2">
              <span className="w-10 text-right text-[10px] text-brand-text">
                {a.ticker}
              </span>
              <div className="flex-1 h-3 rounded bg-muted">
                <div
                  className="h-full rounded"
                  style={{
                    width: `${(Math.abs(m.aVal) / maxVal) * 100}%`,
                    backgroundColor: "var(--brand)",
                    opacity: 0.6,
                  }}
                />
              </div>
              <span className="w-12 text-left text-[10px] font-medium text-foreground">
                {formatNumber(m.aVal, 1)}%
              </span>
            </div>
            {/* Bar B */}
            <div className="flex items-center gap-2">
              <span className="w-10 text-right text-[10px] text-compare-b-text">
                {b.ticker}
              </span>
              <div className="flex-1 h-3 rounded bg-muted">
                <div
                  className="h-full rounded"
                  style={{
                    width: `${(Math.abs(m.bVal) / maxVal) * 100}%`,
                    backgroundColor: "var(--compare-b)",
                    opacity: 0.6,
                  }}
                />
              </div>
              <span className="w-12 text-left text-[10px] font-medium text-foreground">
                {formatNumber(m.bVal, 1)}%
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ── ROE/ROCE Cards ───────────────────────────────────────────────────────── */

function ReturnCards({
  company,
  side,
  formatNumber,
}: {
  company: CompareEnrichedCompany;
  side: "a" | "b";
  formatNumber: (value: number, digits?: number) => string;
}) {
  const borderClass =
    side === "a" ? "border-brand-border" : "border-compare-b-border";
  const accentClass =
    side === "a" ? "text-brand-text" : "text-compare-b-text";

  return (
    <div className="space-y-2">
      <span className={`text-[11px] font-medium ${accentClass} uppercase tracking-wider`}>
        {company.ticker}
      </span>
      <div className="grid grid-cols-2 gap-2">
        <div className={`rounded-xl border ${borderClass} bg-card p-3`}>
          <p className="text-[10px] text-muted-foreground">ROE</p>
          <p className="text-lg font-semibold text-foreground">
            {formatNumber(company.pastData.roe, 1)}%
          </p>
        </div>
        <div className={`rounded-xl border ${borderClass} bg-card p-3`}>
          <p className="text-[10px] text-muted-foreground">ROCE</p>
          <p className="text-lg font-semibold text-foreground">
            {formatNumber(company.pastData.roce, 1)}%
          </p>
        </div>
      </div>
    </div>
  );
}

/* ── Main Component ───────────────────────────────────────────────────────── */

export function PastIsland({ a, b, formatNumber }: PastIslandProps) {
  return (
    <div className="compare-island compare-surface p-6 scroll-mt-[160px] space-y-6">
      <h3 className="text-base font-semibold text-foreground">
        Desempenho passado
      </h3>

      {/* ── Revenue & Earnings trend ── */}
      <div className="compare-side-grid">
        <RevEarningsChart company={a} side="a" formatNumber={formatNumber} />
        <RevEarningsChart company={b} side="b" formatNumber={formatNumber} />
      </div>

      {/* ── Margins comparison ── */}
      <MarginsComparison a={a} b={b} formatNumber={formatNumber} />

      {/* ── ROE / ROCE ── */}
      <div className="compare-side-grid">
        <ReturnCards company={a} side="a" formatNumber={formatNumber} />
        <ReturnCards company={b} side="b" formatNumber={formatNumber} />
      </div>
    </div>
  );
}

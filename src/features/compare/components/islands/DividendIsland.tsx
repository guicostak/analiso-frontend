"use client";

import type { CompareEnrichedCompany } from "../../interfaces";

/* ── Types ────────────────────────────────────────────────────────────────── */

interface DividendIslandProps {
  a: CompareEnrichedCompany;
  b: CompareEnrichedCompany;
  formatNumber: (value: number, digits?: number) => string;
}

/* ── KPI Strip ────────────────────────────────────────────────────────────── */

function KpiStrip({
  company,
  side,
  formatNumber,
}: {
  company: CompareEnrichedCompany;
  side: "a" | "b";
  formatNumber: (value: number, digits?: number) => string;
}) {
  const d = company.dividendData;
  const borderClass =
    side === "a" ? "border-brand-border" : "border-compare-b-border";
  const accentText = side === "a" ? "text-brand-text" : "text-compare-b-text";

  const kpis = [
    { label: "Anos sem interrupcao", value: `${d.yearsWithoutInterruption}` },
    { label: "CAGR 5a", value: `${formatNumber(d.cagr5y, 1)}%` },
    { label: "Payout medio", value: `${formatNumber(d.avgPayout5y, 0)}%` },
    { label: "Yield atual", value: `${formatNumber(d.currentYield, 2)}%` },
  ];

  return (
    <div className="space-y-2">
      <span className={`text-[11px] font-medium ${accentText} uppercase tracking-wider`}>
        {company.ticker}
      </span>
      <div className="grid grid-cols-2 gap-2">
        {kpis.map((k) => (
          <div
            key={k.label}
            className={`rounded-xl border ${borderClass} bg-card p-3`}
          >
            <p className="text-[10px] text-muted-foreground">{k.label}</p>
            <p className="text-sm font-semibold text-foreground">{k.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── DPA History Chart (SVG) ──────────────────────────────────────────────── */

function DpaChart({
  company,
  side,
}: {
  company: CompareEnrichedCompany;
  side: "a" | "b";
}) {
  const series = company.dividendData.dpaSeries;
  if (!series.length) return null;

  const svgW = 280;
  const svgH = 120;
  const padX = 24;
  const padY = 12;
  const padBottom = 20;
  const plotW = svgW - padX * 2;
  const plotH = svgH - padY - padBottom;

  const maxDpa = Math.max(...series.map((s) => s.dpa), 0.01);
  const maxPayout = Math.max(
    ...series.filter((s) => s.payout !== null).map((s) => s.payout!),
    1,
  );

  const barW = plotW / series.length - 4;
  const barColor = side === "a" ? "var(--brand)" : "var(--compare-b)";
  const lineColor = "#D4913B";

  return (
    <div className="space-y-2">
      <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
        {company.ticker} - DPA
      </span>
      <svg
        viewBox={`0 0 ${svgW} ${svgH}`}
        className="w-full"
        preserveAspectRatio="xMidYMid meet"
      >
        {/* DPA bars */}
        {series.map((s, i) => {
          const x = padX + (i / series.length) * plotW + 2;
          const barH = (s.dpa / maxDpa) * plotH;
          const y = padY + plotH - barH;
          const isForecast = s.type === "forecast";
          return (
            <rect
              key={`bar-${i}`}
              x={x}
              y={y}
              width={barW}
              height={barH}
              rx={3}
              fill={barColor}
              opacity={isForecast ? 0.3 : 0.6}
              strokeDasharray={isForecast ? "4 2" : undefined}
              stroke={isForecast ? barColor : "none"}
              strokeWidth={isForecast ? 1 : 0}
            />
          );
        })}

        {/* Payout line overlay */}
        {(() => {
          const pts = series
            .map((s, i) => {
              if (s.payout === null) return null;
              const x =
                padX + (i / series.length) * plotW + barW / 2 + 2;
              const y =
                padY + plotH - (s.payout / maxPayout) * plotH;
              return { x, y };
            })
            .filter(Boolean) as { x: number; y: number }[];

          if (pts.length < 2) return null;

          const d = pts
            .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x},${p.y}`)
            .join(" ");

          return (
            <>
              <path
                d={d}
                fill="none"
                stroke={lineColor}
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                opacity="0.7"
              />
              {pts.map((p, i) => (
                <circle
                  key={`pdot-${i}`}
                  cx={p.x}
                  cy={p.y}
                  r="2"
                  fill={lineColor}
                />
              ))}
            </>
          );
        })()}

        {/* Year labels */}
        {series.map((s, i) => {
          const x =
            padX + (i / series.length) * plotW + barW / 2 + 2;
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
            style={{ backgroundColor: barColor, opacity: 0.6 }}
          />
          DPA
        </span>
        <span className="flex items-center gap-1">
          <span
            className="inline-block h-0.5 w-3 rounded-full"
            style={{ backgroundColor: lineColor }}
          />
          Payout
        </span>
      </div>
    </div>
  );
}

/* ── Yield vs Market Lollipop ─────────────────────────────────────────────── */

function YieldLollipop({
  a,
  b,
  formatNumber,
}: {
  a: CompareEnrichedCompany;
  b: CompareEnrichedCompany;
  formatNumber: (value: number, digits?: number) => string;
}) {
  const yieldA = a.dividendData.currentYield;
  const yieldB = b.dividendData.currentYield;
  const median = a.dividendData.marketMedianYield;
  const maxVal = Math.max(yieldA, yieldB, median, 1);

  const items = [
    { label: a.ticker, value: yieldA, color: "var(--brand)" },
    { label: b.ticker, value: yieldB, color: "var(--compare-b)" },
    { label: "Mercado", value: median, color: "#94A3B8" },
  ];

  return (
    <div className="space-y-3">
      <h4 className="text-[12px] font-semibold text-foreground uppercase tracking-wider">
        Yield vs Mercado
      </h4>
      {items.map((item) => {
        const pct = (item.value / maxVal) * 100;
        return (
          <div key={item.label} className="flex items-center gap-3">
            <span className="w-16 text-right text-[11px] text-muted-foreground">
              {item.label}
            </span>
            <div className="relative flex-1 h-5">
              {/* Stem */}
              <div
                className="absolute top-1/2 h-0.5 -translate-y-1/2 rounded-full"
                style={{
                  width: `${pct}%`,
                  backgroundColor: item.color,
                  opacity: 0.4,
                }}
              />
              {/* Head */}
              <div
                className="absolute top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white"
                style={{
                  left: `${pct}%`,
                  backgroundColor: item.color,
                }}
              />
            </div>
            <span className="w-12 text-left text-[11px] font-medium text-foreground">
              {formatNumber(item.value, 2)}%
            </span>
          </div>
        );
      })}
    </div>
  );
}

/* ── Main Component ───────────────────────────────────────────────────────── */

export function DividendIsland({ a, b, formatNumber }: DividendIslandProps) {
  return (
    <div className="compare-island compare-surface p-6 scroll-mt-[160px] space-y-6">
      <h3 className="text-base font-semibold text-foreground">Proventos</h3>

      {/* ── KPI strips ── */}
      <div className="compare-side-grid">
        <KpiStrip company={a} side="a" formatNumber={formatNumber} />
        <KpiStrip company={b} side="b" formatNumber={formatNumber} />
      </div>

      {/* ── DPA History ── */}
      <div className="compare-side-grid">
        <DpaChart company={a} side="a" />
        <DpaChart company={b} side="b" />
      </div>

      {/* ── Yield vs Market ── */}
      <YieldLollipop a={a} b={b} formatNumber={formatNumber} />
    </div>
  );
}

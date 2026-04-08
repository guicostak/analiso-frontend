'use client';

import React from 'react';
import { createPortal } from 'react-dom';
import type { DividendTabState } from '../hooks/useAnalysisPageState';
import type { AnalysisData } from '../interfaces';
import { COLORS } from '../constants/colors';
import { safeN, safeNbr, formatNumber, formatDate } from '../utils/formatters';
import { SectionCard, CheckList } from './AnalysisShared';
import { DimensionCheckCard } from './ScoreDots';

function DividendHistorySection({ data, hovered, setHovered }: {
  data: AnalysisData;
  hovered: number | null;
  setHovered: React.Dispatch<React.SetStateAction<number | null>>;
}) {
  const d = data.dividend ?? {} as typeof data.dividend;
  const series = d.dividendQualitySeries ?? [];

  // Layout constants
  const PAD = { top: 32, right: 52, bottom: 38, left: 56 };
  const VW = 920, VH = 460;
  const CW = VW - PAD.left - PAD.right;
  const CH = VH - PAD.top - PAD.bottom;

  // Scales
  const rawMax = Math.max(...series.map(s => s.dpa));
  const maxDPA = Math.ceil(rawMax + 0.5);
  const N = series.length;
  const slotW = CW / N;
  const barW = Math.max(slotW * 0.50, 10);

  const xOf = (i: number) => PAD.left + slotW * i + slotW / 2;
  const yDPA = (v: number) => PAD.top + CH - (v / maxDPA) * CH;
  const yPayout = (v: number) => Math.max(PAD.top, Math.min(PAD.top + CH, PAD.top + CH - (v / 100) * CH));

  const mkPath = (pts: { x: number; y: number }[]) =>
    pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');

  // Forecast boundary
  const firstFcstIdx = series.findIndex(s => s.type === 'forecast');
  const dividerX = firstFcstIdx > 0 ? PAD.left + slotW * firstFcstIdx : null;

  // Payout line segments
  const histPayPts = series
    .map((s, i) => s.payout !== null && s.type === 'historical' ? { x: xOf(i), y: yPayout(s.payout!) } : null)
    .filter(Boolean) as { x: number; y: number }[];

  const fcstPayPts = series
    .map((s, i) => s.payout !== null && s.type === 'forecast' ? { x: xOf(i), y: yPayout(s.payout!) } : null)
    .filter(Boolean) as { x: number; y: number }[];

  const fcstLinePts = histPayPts.length > 0 ? [histPayPts[histPayPts.length - 1], ...fcstPayPts] : fcstPayPts;

  const allPayPts = series
    .map((s, i) => s.payout !== null ? { x: xOf(i), y: yPayout(s.payout!), isFcst: s.type === 'forecast' } : null)
    .filter(Boolean) as { x: number; y: number; isFcst: boolean }[];

  // Left-axis ticks — 4 levels, clean round numbers
  const dpaTicks = [0, 1, 2, 3, 4, 5].filter(v => v <= maxDPA);

  // Payout reference: 90% threshold
  const y90 = yPayout(90);

  const kpis = [
    { label: 'Anos sem interrupção', value: `${d.yearsWithoutInterruption ?? 0} anos`, color: 'var(--brand)', primary: true },
    { label: 'CAGR dividendo (5a)', value: `+${safeN(d.cagr5y)}%`, color: 'var(--brand)', primary: true },
    { label: 'Payout médio (5a)', value: `${safeN(d.avgPayout5y)}%`, color: 'var(--warning-text)', primary: true },
    { label: 'Yield atual', value: `${safeN(d.currentYield)}%`, color: 'var(--muted-foreground)', primary: false },
  ];

  const hovItem = hovered !== null ? series[hovered] : null;

  return (
    <SectionCard
      title="A empresa paga dividendos de forma consistente?"
      subtitle="Valor pago por ação ao longo dos anos. A linha mostra qual percentual do lucro foi distribuído (payout)."
      info={
        <>
          As barras são o <b>dividendo por ação</b> em cada ano e a linha é o <b>payout</b>
          (percentual do lucro distribuído). Barras crescentes e payout estável indicam consistência;
          payout acima de 100% sugere que a empresa está distribuindo mais do que lucra.
        </>
      }
    >
      {/* KPI strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-5 pb-5 border-b border-border">
        {kpis.map(kpi => (
          <div key={kpi.label} className="flex gap-2 items-start">
            <div className="w-0.5 self-stretch rounded-full mt-0.5" style={{ backgroundColor: kpi.color }} />
            <div>
              <p className={kpi.primary ? 'text-sm font-bold text-foreground' : 'text-xs font-medium text-muted-foreground'}>
                {kpi.value}
              </p>
              <p className="text-[11px] text-muted-foreground leading-4 mt-0.5">{kpi.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Chart */}
      <div className="relative select-none">
        <svg viewBox={`0 0 ${VW} ${VH}`} className="w-full overflow-visible" style={{ height: 460 }}>

          <defs>
            <clipPath id="chartArea">
              <rect x={PAD.left} y={PAD.top} width={CW} height={CH} />
            </clipPath>
          </defs>

          {/* ── Forecast area background ── */}
          {dividerX !== null && (
            <rect
              x={dividerX} y={PAD.top}
              width={VW - PAD.right - dividerX} height={CH}
              fill="#f8fafc"
            />
          )}

          {/* ── Grid lines (left-axis aligned) ── */}
          {dpaTicks.map(tick => (
            <line key={tick}
              x1={PAD.left} x2={VW - PAD.right}
              y1={yDPA(tick)} y2={yDPA(tick)}
              stroke={tick === 0 ? '#e5e7eb' : '#f1f5f9'} strokeWidth="1"
            />
          ))}

          {/* ── Bars ── */}
          {series.map((s, i) => {
            const x = xOf(i) - barW / 2;
            const barH = (s.dpa / maxDPA) * CH;
            const y = PAD.top + CH - barH;
            const isHov = hovered === i;
            const isFcst = s.type === 'forecast';
            return (
              <g key={s.year}>
                {isFcst ? (
                  <rect
                    x={x} y={y} width={barW} height={barH} rx="2"
                    fill="#bfdbfe" stroke="#3b82f6" strokeWidth="1"
                    strokeDasharray="3 2"
                    opacity={isHov ? 0.90 : 0.70}
                  />
                ) : (
                  <rect
                    x={x} y={y} width={barW} height={barH} rx="2"
                    fill={isHov ? '#1e3a5f' : '#1d4ed8'}
                    opacity={isHov ? 1 : 0.90}
                  />
                )}
                {/* hit zone */}
                <rect
                  x={xOf(i) - slotW / 2} y={PAD.top} width={slotW} height={CH}
                  fill="transparent" style={{ cursor: 'default' }}
                  onMouseEnter={() => setHovered(i)}
                  onMouseLeave={() => setHovered(null)}
                />
              </g>
            );
          })}

          {/* ── Forecast divider ── */}
          {dividerX !== null && (
            <>
              <line
                x1={dividerX} x2={dividerX}
                y1={PAD.top - 12} y2={PAD.top + CH}
                stroke="#cbd5e1" strokeWidth="1"
              />
              <text x={dividerX + 5} y={PAD.top - 3}
                fontSize="9" fill="#94a3b8" textAnchor="start" letterSpacing="0.04em">
                ESTIMATIVA
              </text>
            </>
          )}

          {/* ── Payout line — historical (solid) ── */}
          {histPayPts.length > 1 && (
            <path d={mkPath(histPayPts)} fill="none" clipPath="url(#chartArea)"
              stroke="#92400e" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round"
            />
          )}
          {/* ── Payout line — forecast (dashed) ── */}
          {fcstLinePts.length > 1 && (
            <path d={mkPath(fcstLinePts)} fill="none" clipPath="url(#chartArea)"
              stroke="#92400e" strokeWidth="2.5" strokeDasharray="5 3"
              strokeLinejoin="round" strokeLinecap="round"
            />
          )}
          {/* ── Payout circles ── */}
          {allPayPts.map((p, i) => (
            <circle key={i} cx={p.x} cy={p.y} r="3.5" clipPath="url(#chartArea)"
              fill="white" stroke="#92400e" strokeWidth="2"
            />
          ))}

          {/* ── Hover crosshair ── */}
          {hovered !== null && (
            <line
              x1={xOf(hovered)} x2={xOf(hovered)}
              y1={PAD.top} y2={PAD.top + CH}
              stroke="#1d4ed8" strokeWidth="1" strokeDasharray="3 2" opacity="0.25"
            />
          )}

          {/* ── Left Y-axis (DPA) ── */}
          <line x1={PAD.left} x2={PAD.left} y1={PAD.top} y2={PAD.top + CH} stroke="#e2e8f0" strokeWidth="1" />
          {dpaTicks.map(tick => (
            <text key={tick} x={PAD.left - 7} y={yDPA(tick) + 4}
              textAnchor="end" fontSize="10" fill="#94a3b8">
              {tick === 0 ? '' : `R$${tick}`}
            </text>
          ))}

          {/* ── X-axis labels ── */}
          {series.map((s, i) => (
            <text key={s.year} x={xOf(i)} y={VH - 8}
              textAnchor="middle" fontSize="11" fontWeight="500"
              fill={s.type === 'forecast' ? '#94a3b8' : '#4b5563'}>
              {s.year}
            </text>
          ))}

          {/* ── Tooltip ── */}
          {hovItem !== null && hovered !== null && (() => {
            const x = xOf(hovered);
            const flip = x > VW * 0.68;
            const tx = flip ? x - 138 : x + 12;
            const ty = PAD.top + 4;
            const hasP = hovItem.payout !== null;
            const bh = hasP ? 58 : 44;
            return (
              <g style={{ pointerEvents: 'none' }}>
                <rect x={tx} y={ty} width={126} height={bh} rx="5"
                  fill="white" stroke="#e2e8f0" strokeWidth="1"
                  style={{ filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.09))' }}
                />
                <text x={tx + 10} y={ty + 16} fontSize="10.5" fontWeight="600" fill="#0f172a">
                  {hovItem.year}{hovItem.type === 'forecast' ? ' · est.' : ''}
                </text>
                <text x={tx + 10} y={ty + 31} fontSize="10" fill="#1d4ed8">
                  DPA  R$ {safeN(hovItem.dpa, 3)}
                </text>
                {hasP && (
                  <text x={tx + 10} y={ty + 47} fontSize="10" fill="#92400e">
                    Payout  {hovItem.payout}%
                  </text>
                )}
              </g>
            );
          })()}
        </svg>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-6 mt-2 pl-[56px]">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-sm bg-[#1d4ed8]" />
          <span className="text-[11px] text-muted-foreground">DPA (R$/ação)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-sm bg-[#bfdbfe] border border-[#3b82f6] border-dashed" />
          <span className="text-[11px] text-muted-foreground">Estimativa de consenso</span>
        </div>
        <div className="flex items-center gap-2">
          <svg width="22" height="10" viewBox="0 0 22 10">
            <line x1="0" y1="5" x2="22" y2="5" stroke="#92400e" strokeWidth="2.5" />
            <circle cx="11" cy="5" r="3" fill="white" stroke="#92400e" strokeWidth="2" />
          </svg>
          <span className="text-[11px] text-muted-foreground">Payout ratio</span>
        </div>
      </div>
    </SectionCard>
  );
}

function DividendYieldVsMarketSection({ data }: { data: AnalysisData }) {
  const d = data.dividend ?? {} as typeof data.dividend;

  const PAD = { top: 52, right: 108, bottom: 44, left: 168 };
  const VW = 920, VH = 460;
  const CW = VW - PAD.left - PAD.right; // 644
  const CH = VH - PAD.top - PAD.bottom; // 364
  const LANE_H = CH / 3;                // ~121
  const DMAX = 13;

  const xS  = (v: number) => PAD.left + (v / DMAX) * CW;
  const yOf = (i: number) => PAD.top + i * LANE_H + LANE_H / 2;

  const rows = [
    {
      id: 'company',
      name: data.company.ticker,
      sub: 'Empresa',
      value: d.currentYield,
      color: '#355CDE',
      r: 13,
      bold: true,
      delta: null, // empresa é a referência principal
    },
    {
      id: 'sector',
      name: 'Setor',
      sub: data.company.sector,
      value: d.sectorMedianYield,
      color: '#9DB5FF',
      r: 9,
      bold: false,
      delta: +((d.currentYield ?? 0) - (d.sectorMedianYield ?? 0)).toFixed(1), // empresa vs setor
    },
    {
      id: 'market',
      name: 'Mercado',
      sub: 'IBOVESPA · mediana',
      value: d.marketMedianYield,
      color: '#64748B',
      r: 7,
      bold: false,
      delta: +((d.currentYield ?? 0) - (d.marketMedianYield ?? 0)).toFixed(1), // empresa vs mercado
    },
  ];

  const xTicks = [0, 2, 4, 6, 8, 10, 12];
  const p25x = xS(d.marketYield25th);
  const p75x = xS(d.marketYield75th);

  const kpis = [
    { label: 'Posição no mercado', value: `Acima de ${d.marketPercentile ?? 0}% do IBOVESPA`, color: '#355CDE', primary: true },
    { label: 'Versus mediana do mercado', value: `+${safeN((d.currentYield ?? 0) - (d.marketMedianYield ?? 0))} pp`, color: '#355CDE', primary: true },
    { label: 'Versus mediana do setor', value: `+${safeN((d.currentYield ?? 0) - (d.sectorMedianYield ?? 0))} pp`, color: '#355CDE', primary: true },
    { label: 'Yield atual da empresa', value: `${safeN(d.currentYield)}%`, color: '#355CDE', primary: true },
  ];

  return (
    <SectionCard
      title="O rendimento dos dividendos é bom?"
      subtitle="Comparação do rendimento (dividend yield) da empresa com a mediana do setor e do mercado"
      info={
        <>
          O marcador é o <b>yield atual</b> da empresa. As linhas atrás representam a faixa em que
          a maioria das ações do mercado se encontra (do <b>25º ao 75º percentil</b>) — quanto mais
          à direita o marcador, melhor é o rendimento relativo.
        </>
      }
    >
      {/* KPI strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-5 pb-5 border-b border-border">
        {kpis.map(kpi => (
          <div key={kpi.label} className="flex gap-2 items-start">
            <div className="w-0.5 self-stretch rounded-full mt-0.5" style={{ backgroundColor: kpi.color }} />
            <div>
              <p className={kpi.primary ? 'text-sm font-bold text-foreground' : 'text-xs font-medium text-muted-foreground'}>
                {kpi.value}
              </p>
              <p className="text-[11px] text-muted-foreground leading-4 mt-0.5">{kpi.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Chart */}
      <div className="relative select-none">
        <svg viewBox={`0 0 ${VW} ${VH}`} className="w-full overflow-visible" style={{ height: 460 }}>

          {/* ── P25–P75 distribution band — very subtle background context ── */}
          <rect
            x={p25x} y={PAD.top}
            width={p75x - p25x} height={CH}
            fill="#f1f5f9" rx="2" opacity="0.5"
          />
          {/* Discrete label centered above band */}
          <text x={(p25x + p75x) / 2} y={PAD.top - 10}
            textAnchor="middle" fontSize="9.5" fill="#d1d5db">
            intervalo típico
          </text>

          {/* ── Market median reference vertical rule ── */}
          <line
            x1={xS(d.marketMedianYield)} x2={xS(d.marketMedianYield)}
            y1={PAD.top - 6} y2={PAD.top + CH}
            stroke="#cbd5e1" strokeWidth="1" strokeDasharray="3 2"
          />

          {/* ── Row track lines ── */}
          {rows.map((row, i) => (
            <line key={row.id}
              x1={PAD.left} x2={VW - PAD.right}
              y1={yOf(i)} y2={yOf(i)}
              stroke="#e2e8f0" strokeWidth="1"
            />
          ))}

          {/* ── Dots + labels ── */}
          {rows.map((row, i) => {
            const cx = xS(row.value);
            const cy = yOf(i);
            return (
              <g key={row.id}>
                {/* Halo for company */}
                {row.bold && (
                  <circle cx={cx} cy={cy} r={row.r + 6} fill="#355CDE" opacity="0.10" />
                )}
                {/* Main dot */}
                <circle cx={cx} cy={cy} r={row.r} fill={row.color} />
                {/* Value label */}
                <text
                  x={cx + row.r + 10} y={cy + 5}
                  fontSize={row.bold ? 17 : 14}
                  fontWeight={row.bold ? '700' : '500'}
                  fill={row.bold ? '#0f172a' : '#374151'}
                >
                  {safeN(row.value)}%
                </text>
                {/* Natural language percentile label above company dot */}
                {row.bold && (
                  <text x={cx} y={cy - row.r - 8}
                    textAnchor="middle" fontSize="11" fontWeight="500"
                    fill="#355CDE" opacity="0.75">
                    yield acima de {d.marketPercentile}% das ações do IBOVESPA
                  </text>
                )}
              </g>
            );
          })}

          {/* ── Left labels ── */}
          {rows.map((row, i) => (
            <g key={`lbl-${row.id}`}>
              <text x={PAD.left - 14} y={yOf(i) - 6}
                textAnchor="end"
                fontSize={row.bold ? 16 : 14}
                fontWeight={row.bold ? '700' : '500'}
                fill={row.bold ? '#0f172a' : '#374151'}
              >
                {row.name}
              </text>
              <text x={PAD.left - 14} y={yOf(i) + 12}
                textAnchor="end" fontSize="11.5" fill="#94a3b8">
                {row.sub}
              </text>
            </g>
          ))}

          {/* ── Right delta labels (all deltas = empresa vs esta referência) ── */}
          {rows.map((row, i) => {
            if (row.delta === null) {
              return (
                <text key={`d-${row.id}`}
                  x={VW - PAD.right + 10} y={yOf(i) + 5}
                  textAnchor="start" fontSize="13" fontWeight="600" fill="#355CDE">
                  yield atual
                </text>
              );
            }
            const pos = row.delta > 0;
            return (
              <g key={`d-${row.id}`}>
                <text
                  x={VW - PAD.right + 10} y={yOf(i) + 2}
                  textAnchor="start" fontSize="13" fontWeight="600"
                  fill={pos ? '#355CDE' : '#dc2626'}
                >
                  {pos ? '+' : ''}{safeN(row.delta)} pp
                </text>
                <text
                  x={VW - PAD.right + 10} y={yOf(i) + 17}
                  textAnchor="start" fontSize="10" fill="#94a3b8">
                  empresa acima
                </text>
              </g>
            );
          })}

          {/* ── X-axis ── */}
          <line x1={PAD.left} x2={VW - PAD.right} y1={PAD.top + CH} y2={PAD.top + CH} stroke="#e2e8f0" strokeWidth="1" />
          {xTicks.map(tick => (
            <g key={tick}>
              <line x1={xS(tick)} x2={xS(tick)} y1={PAD.top + CH} y2={PAD.top + CH + 4} stroke="#e2e8f0" strokeWidth="1" />
              <text x={xS(tick)} y={VH - 8} textAnchor="middle" fontSize="12" fill="#94a3b8">
                {tick}%
              </text>
            </g>
          ))}

          {/* ── Left axis ── */}
          <line x1={PAD.left} x2={PAD.left} y1={PAD.top - 4} y2={PAD.top + CH} stroke="#e2e8f0" strokeWidth="1" />

          {/* ── X-axis title ── */}
          <text x={PAD.left + CW / 2} y={VH + 18}
            textAnchor="middle" fontSize="11" fill="#94a3b8">
            Dividend Yield (%)
          </text>
        </svg>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-5 mt-6 pl-[168px]">
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-[#355CDE]" />
          <span className="text-[11px] text-muted-foreground">{data.company.ticker} — yield atual</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-[#9DB5FF]" />
          <span className="text-[11px] text-muted-foreground">Mediana do setor</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-[#64748B]" />
          <span className="text-[11px] text-muted-foreground">Mediana do mercado</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-3 rounded-sm bg-[#f8fafc] border border-border" />
          <span className="text-[11px] text-muted-foreground">Intervalo típico do mercado</span>
        </div>
      </div>
    </SectionCard>
  );
}

function CoverageBarCard({
  title,
  subtitle,
  value,
  contextLabel,
  diagTexts,
}: {
  title: string;
  subtitle: string;
  value: number | null | undefined;
  contextLabel: string;
  diagTexts: { ok: string; warn: string; risk: string };
}) {
  const MAX = 150;
  const VW = 480, VH = 80;
  const TH = 22;
  const TY = 24;
  const TW = VW;

  // Render a "not available" state when value is null/undefined
  if (value == null) {
    return (
      <div className="analysis-card p-5 flex flex-col gap-4">
        <div>
          <h3 className="text-sm font-semibold text-foreground">{title}</h3>
          <p className="text-[11px] text-muted-foreground mt-0.5">{subtitle}</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-xs font-medium bg-muted text-muted-foreground">
          <svg className="w-3.5 h-3.5 flex-shrink-0" viewBox="0 0 16 16" fill="currentColor">
            <path d="M8 1a7 7 0 1 0 0 14A7 7 0 0 0 8 1Zm0 12A5 5 0 1 1 8 3a5 5 0 0 1 0 10Zm.75-7.25a.75.75 0 0 0-1.5 0v2.5a.75.75 0 0 0 1.5 0v-2.5Zm0 4.5a.75.75 0 1 0-1.5 0 .75.75 0 0 0 1.5 0Z"/>
          </svg>
          <span>Dado não disponível para esta empresa</span>
        </div>
      </div>
    );
  }

  const xS = (v: number) => Math.min((v / MAX) * TW, TW);
  const x75  = xS(75);
  const x100 = xS(100);
  const xVal = xS(value);

  const zone = value <= 75 ? 'ok' : value <= 100 ? 'warn' : 'risk';
  const barColor   = zone === 'ok' ? '#2E7D62' : zone === 'warn' ? '#B86A1F' : '#C0545A';
  const diagText   = diagTexts[zone];
  const diagBg     = zone === 'ok' ? 'bg-success-surface' : zone === 'warn' ? 'bg-warning-surface' : 'bg-danger-surface';
  const diagTxt    = zone === 'ok' ? 'text-success-text' : zone === 'warn' ? 'text-warning-text' : 'text-danger-text';
  const diagIcon   = zone === 'ok' ? (
    <svg className="w-3.5 h-3.5 flex-shrink-0" viewBox="0 0 16 16" fill="currentColor">
      <path fillRule="evenodd" clipRule="evenodd" d="M13.78 4.22a.75.75 0 0 1 0 1.06l-7.25 7.25a.75.75 0 0 1-1.06 0L2.22 9.28a.75.75 0 0 1 1.06-1.06L6 10.94l6.72-6.72a.75.75 0 0 1 1.06 0Z"/>
    </svg>
  ) : zone === 'warn' ? (
    <svg className="w-3.5 h-3.5 flex-shrink-0" viewBox="0 0 16 16" fill="currentColor">
      <path fillRule="evenodd" clipRule="evenodd" d="M6.457 1.047c.659-1.234 2.427-1.234 3.086 0l6.082 11.378A1.75 1.75 0 0 1 14.082 15H1.918a1.75 1.75 0 0 1-1.543-2.575Zm1.763.707a.25.25 0 0 0-.44 0L1.698 13.132a.25.25 0 0 0 .22.368h12.164a.25.25 0 0 0 .22-.368ZM9 11a1 1 0 1 1-2 0 1 1 0 0 1 2 0Zm-.25-5.25a.75.75 0 0 0-1.5 0v2.5a.75.75 0 0 0 1.5 0Z"/>
    </svg>
  ) : (
    <svg className="w-3.5 h-3.5 flex-shrink-0" viewBox="0 0 16 16" fill="currentColor">
      <path d="M2.343 13.657A8 8 0 1 1 13.657 2.343 8 8 0 0 1 2.343 13.657ZM6.03 4.97a.75.75 0 0 0-1.06 1.06L6.94 8 4.97 9.97a.75.75 0 1 0 1.06 1.06L8 9.06l1.97 1.97a.75.75 0 1 0 1.06-1.06L9.06 8l1.97-1.97a.75.75 0 1 0-1.06-1.06L8 6.94Z"/>
    </svg>
  );

  return (
    <div className="analysis-card p-5 flex flex-col gap-4">
      {/* Header */}
      <div>
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
        <p className="text-[11px] text-muted-foreground mt-0.5">{subtitle}</p>
      </div>

      {/* Primary metric */}
      <div className="flex items-baseline gap-2">
        <span className="text-4xl font-bold tabular-nums" style={{ color: barColor }}>
          {value != null ? `${Math.round(value)}%` : '—'}
        </span>
        <span className="text-xs text-muted-foreground leading-4">{contextLabel}</span>
      </div>

      {/* Coverage bar */}
      <div className="select-none">
        <svg viewBox={`0 0 ${VW} ${VH}`} className="w-full overflow-visible" style={{ height: VH }}>

          {/* Zone backgrounds */}
          <rect x={0}     y={TY} width={x75}        height={TH} fill="#F0FDF4" />
          <rect x={x75}   y={TY} width={x100 - x75} height={TH} fill="#FFFBEB" />
          <rect x={x100}  y={TY} width={TW - x100}  height={TH} fill="#FFF1F2" />

          {/* Track outline */}
          <rect x={0} y={TY} width={TW} height={TH} fill="none" stroke="#E5E7EB" strokeWidth="1" rx="3" />

          {/* Value fill */}
          <rect x={0} y={TY} width={xVal} height={TH} fill={barColor} opacity="0.82" rx="3" />

          {/* Zone dividers */}
          <line x1={x75}  x2={x75}  y1={TY} y2={TY + TH} stroke="#E5E7EB" strokeWidth="1.5" />
          <line x1={x100} x2={x100} y1={TY - 2} y2={TY + TH + 2} stroke="#94a3b8" strokeWidth="1.5" />

          {/* Value needle */}
          <line x1={xVal} x2={xVal} y1={TY - 6} y2={TY + TH + 6} stroke={barColor} strokeWidth="2.5" />

          {/* Scale labels */}
          <text x={0}    y={TY - 9} textAnchor="start"  fontSize="9" fill="#CBD5E1">0%</text>
          <text x={x75}  y={TY - 9} textAnchor="middle" fontSize="9" fill="#94a3b8">75%</text>
          <text x={x100} y={TY - 9} textAnchor="middle" fontSize="9" fill="#64748B" fontWeight="500">100%</text>
          <text x={TW}   y={TY - 9} textAnchor="end"    fontSize="9" fill="#CBD5E1">{MAX}%</text>

          {/* Zone labels */}
          <text x={x75 / 2}          y={TY + TH + 14} textAnchor="middle" fontSize="9" fontWeight="500" fill="#4B7A68">Coberto</text>
          <text x={(x75 + x100) / 2} y={TY + TH + 14} textAnchor="middle" fontSize="9" fontWeight="500" fill="#92570F">Pressionado</text>
          <text x={(x100 + TW) / 2}  y={TY + TH + 14} textAnchor="middle" fontSize="9" fontWeight="500" fill="#9C3F44">Não coberto</text>
        </svg>
      </div>

      {/* Diagnosis */}
      <div className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-xs font-medium ${diagBg} ${diagTxt}`}>
        {diagIcon}
        <span>{diagText}</span>
      </div>
    </div>
  );
}

function DividendCoverageSection({ data }: { data: AnalysisData }) {
  const d = data.dividend ?? {} as typeof data.dividend;
  return (
    <div className="flex flex-col gap-4">
      <CoverageBarCard
        title="Quanto do lucro é distribuído como dividendo?"
        subtitle="Dividendos distribuídos em relação ao lucro líquido do período"
        value={d.payoutRatio}
        contextLabel="do lucro líquido"
        diagTexts={{
          ok:   'Dividendos bem cobertos — empresa distribui menos do que gera de lucro.',
          warn: 'Payout próximo ao limite — pouca margem para crescimento do dividendo.',
          risk: 'Dividendos não cobertos pelo lucro — distribuição acima do resultado.',
        }}
      />
      <CoverageBarCard
        title="Quanto do caixa gerado vai para dividendos?"
        subtitle="Dividendos distribuídos em relação ao fluxo de caixa livre gerado no período"
        value={d.cashPayoutRatio}
        contextLabel="do fluxo de caixa livre"
        diagTexts={{
          ok:   'Pagamento sustentado — caixa gerado supera com folga os dividendos pagos.',
          warn: 'Dividendos consomem grande parte do caixa livre — atenção à sustentabilidade.',
          risk: 'Pagamento acima da geração de caixa — empresa pode estar usando reservas.',
        }}
      />
    </div>
  );
}

function DividendReadingCard({ data }: { data: AnalysisData }) {
  const d   = data.dividend ?? {} as typeof data.dividend;
  const dcy = d.currentYield ?? 0;
  const dmm = d.marketMedianYield ?? 0;
  const dpr = d.payoutRatio ?? 0;

  type Strength = 'atrativo' | 'moderado' | 'fraco';
  const strength: Strength =
    dcy > dmm * 1.5 && d.isStable && dpr < 75
      ? 'atrativo'
      : dcy > dmm && dpr < 90
        ? 'moderado'
        : 'fraco';

  const thesis = {
    atrativo: {
      headline:  'Dividendo atrativo, sustentável e acima do mercado',
      sub:       `Rendimento de ${safeN(dcy)}%, que é ${safeN(dmm > 0 ? dcy / dmm : 0)}x a mediana do mercado. O percentual do lucro distribuído é de ${dpr}%, com histórico estável de pagamentos.`,
      badge:     'Dividendo atrativo',
      badgeBg:   'var(--brand-surface)',
      badgeColor:'#1D4ED8',
      badgeDot:  '#3B82F6',
      synthesis: `Rendimento acima do mercado, percentual distribuído sustentável e histórico consistente de pagamentos. Bom perfil para quem busca renda regular.`,
    },
    moderado: {
      headline:  'Dividendo razoável, sem vantagem clara sobre o mercado',
      sub:       `Rendimento de ${safeN(dcy)}%, próximo à mediana do mercado de ${safeN(dmm)}%. Percentual do lucro distribuído de ${dpr}%.`,
      badge:     'Dividendo moderado',
      badgeBg:   '#F0FDF4',
      badgeColor:'#0F766E',
      badgeDot:  '#14B8A6',
      synthesis: `Dividendo positivo, mas sem diferencial claro frente ao mercado. A vantagem para o investidor de renda depende do crescimento do rendimento ou da manutenção do histórico consistente.`,
    },
    fraco: {
      headline:  'Dividendo com limitações, rendimento baixo ou sustentabilidade em dúvida',
      sub:       `Rendimento de ${safeN(dcy)}%, abaixo da mediana do mercado, ou percentual distribuído de ${dpr}% em nível elevado.`,
      badge:     'Dividendo fraco',
      badgeBg:   '#FFF7ED',
      badgeColor:'#C2410C',
      badgeDot:  '#F97316',
      synthesis: `O dividendo atual não oferece vantagem clara para o investidor de renda. Acompanhe a evolução do percentual distribuído e a consistência dos pagamentos antes de tomar uma decisão com base nessa tese.`,
    },
  }[strength];

  type EvidenceRow = { criterion: string; observed: string; reference: string; micro: string };
  type LimitRow    = { criterion: string; observed: string; reference: string; micro: string };

  const dcpr = d.cashPayoutRatio ?? 0;

  const evidences: EvidenceRow[] = [];
  if (dcy > dmm) {
    evidences.push({
      criterion: 'Yield acima da mediana do mercado',
      observed:  `${safeN(dcy)}%`,
      reference: `Mercado ${safeN(dmm)}%`,
      micro:     'Rendimento superior à mediana do mercado.',
    });
  }
  if (d.isStable) {
    evidences.push({
      criterion: 'Dividendo estável e previsível',
      observed:  `${d.yearsWithoutInterruption ?? 0} anos sem interrupção`,
      reference: 'Histórico consistente',
      micro:     'Pagamentos ininterruptos indicam compromisso com a remuneração ao acionista.',
    });
  }
  if (d.years10Growth) {
    evidences.push({
      criterion: 'Crescimento de dividendos em 10 anos',
      observed:  `CAGR ${safeN(d.cagr5y)}% (5a)`,
      reference: 'Crescimento consistente',
      micro:     'Dividendo em tendência de crescimento sustentado.',
    });
  }
  if (dcpr > 0) {
    evidences.push({
      criterion: 'Payout sobre caixa (FCL)',
      observed:  `${safeN(dcpr, 0)}%`,
      reference: 'Referência < 100%',
      micro:     'Percentual dos dividendos pagos em relação ao fluxo de caixa livre gerado.',
    });
  }

  const limitations: LimitRow[] = [];
  if (dpr > 80) {
    limitations.push({
      criterion: 'Payout ratio elevado',
      observed:  `${dpr}%`,
      reference: 'Ideal < 80%',
      micro:     'Alta proporção do lucro distribuída pode comprometer reinvestimento.',
    });
  }
  if (dcy < dmm) {
    limitations.push({
      criterion: 'Yield abaixo da mediana do mercado',
      observed:  `${safeN(dcy)}%`,
      reference: `Mercado ${safeN(dmm)}%`,
      micro:     'Rendimento não compensa o risco em comparação com alternativas.',
    });
  }
  if (!d.isStable) {
    limitations.push({
      criterion: 'Histórico de dividendos instável',
      observed:  'Instável',
      reference: 'Pagamentos irregulares',
      micro:     'Histórico de interrupções reduz a confiabilidade da renda.',
    });
  }

  return (
    <div className="space-y-4">
      <div className="analysis-card overflow-hidden">

        {/* ── 1. Header ── */}
        <div className="px-7 pt-7 pb-6 flex items-start justify-between gap-6">
          <div className="flex-1 min-w-0">
            <h2 className="text-[22px] font-bold text-foreground leading-snug mb-2">
              {thesis.headline}
            </h2>
            <p className="text-[14px] text-muted-foreground leading-relaxed max-w-xl">
              {thesis.sub}
            </p>
          </div>
          <div
            className="shrink-0 flex items-center gap-2 px-3.5 py-2 rounded-full text-[12px] font-semibold mt-1"
            style={{ backgroundColor: thesis.badgeBg, color: thesis.badgeColor }}
          >
            <span className="relative flex w-2 h-2">
              {strength === 'moderado' && (
                <span
                  className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"
                  style={{ backgroundColor: thesis.badgeDot }}
                />
              )}
              <span
                className="relative inline-flex rounded-full w-2 h-2"
                style={{ backgroundColor: thesis.badgeDot }}
              />
            </span>
            {thesis.badge}
          </div>
        </div>

        {/* ── 2. Evidences + Limitations ── */}
        <div className="border-t border-border grid grid-cols-2 divide-x divide-border">
          <div className="px-7 py-6">
            <div className="text-[10.5px] font-semibold text-muted-foreground uppercase mb-5">
              O que reforça essa conclusão
            </div>
            <div className="space-y-5">
              {evidences.slice(0, 3).map((e, i) => (
                <div key={i} className="flex gap-3.5">
                  <div className="w-[3px] rounded-full bg-[#355CDE] shrink-0 self-stretch" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-2 flex-wrap">
                      <span className="text-[15px] font-bold text-foreground tabular-nums">{e.observed}</span>
                      {e.reference && <span className="text-[11px] text-muted-foreground">{e.reference}</span>}
                    </div>
                    <div className="text-[12px] font-medium text-muted-foreground mt-0.5">{e.criterion}</div>
                    <div className="text-[11px] text-muted-foreground mt-0.5">{e.micro}</div>
                  </div>
                </div>
              ))}
              {evidences.length === 0 && (
                <div className="text-[12px] text-muted-foreground italic">Sem evidências de dividendo diferenciado.</div>
              )}
            </div>
          </div>
          <div className="px-7 py-6">
            <div className="text-[10.5px] font-semibold text-muted-foreground uppercase mb-5">
              O que limita essa leitura
            </div>
            <div className="space-y-5">
              {limitations.slice(0, 2).map((l, i) => (
                <div key={i} className="flex gap-3.5">
                  <div className="w-[3px] rounded-full bg-amber-400 shrink-0 self-stretch" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-2 flex-wrap">
                      <span className="text-[15px] font-bold text-foreground tabular-nums">{l.observed}</span>
                      <span className="text-[11px] text-muted-foreground">{l.reference}</span>
                    </div>
                    <div className="text-[12px] font-medium text-muted-foreground mt-0.5">{l.criterion}</div>
                    <div className="text-[11px] text-muted-foreground mt-0.5">{l.micro}</div>
                  </div>
                </div>
              ))}
              {limitations.length === 0 && (
                <div className="text-[12px] text-muted-foreground italic">Nenhum limitador relevante identificado.</div>
              )}
            </div>
          </div>
        </div>

        {/* ── 3. Synthesis ── */}
        <div className="border-t border-border px-7 py-4 bg-muted/50 flex items-center gap-3">
          <div className="w-1 h-5 rounded-full bg-border shrink-0" />
          <p className="text-[12.5px] text-muted-foreground leading-relaxed">
            {thesis.synthesis}
          </p>
        </div>
      </div>
    </div>
  );
}

export function DividendTab({ data, state }: { data: AnalysisData; state: DividendTabState }) {
  const d = data.dividend ?? {} as typeof data.dividend;
  const { drawerOpen, setDrawerOpen, hovered, setHovered } = state;
  const nf  = (n: number | null | undefined, dec = 1) => n == null ? '—' : n.toFixed(dec);
  const nfp = (n: number | null | undefined, dec = 1) => n == null ? '—' : `${n.toFixed(dec)}%`;

  return (
    <div className="space-y-6">

      {/* ── Reading Card — same pattern as ValuationReadingCard ── */}
      <DividendReadingCard data={data} />
      <DimensionCheckCard dimension="dividend" data={data} />

      {/* Key Information + Recent Updates — side by side */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

        {/* Key Information */}
        <div className="analysis-card p-5">
          <h3 className="text-sm font-semibold text-foreground mb-4">Informações chave</h3>
          <div className="flex gap-6 mb-4">
            <div className="flex gap-2 items-start">
              <div className="w-1 rounded-full bg-violet-500 self-stretch mt-0.5" />
              <div>
                <p className="text-lg font-bold text-foreground">{nfp(d.currentYield)}</p>
                <p className="text-xs text-muted-foreground">Rendimento de dividendos</p>
              </div>
            </div>
            <div className="flex gap-2 items-start">
              <div className="w-1 rounded-full bg-violet-500 self-stretch mt-0.5" />
              <div>
                <p className="text-lg font-bold text-foreground">
                  {d.buybackYield == null ? '—' : ((d.buybackYield < 0 ? nf(d.buybackYield, 3) : `+${nf(d.buybackYield, 3)}`) + '%')}
                </p>
                <p className="text-xs text-muted-foreground">Rendimento de recompra</p>
              </div>
            </div>
          </div>
          <table className="w-full text-xs">
            <tbody>
              {[
                { label: 'Retorno total ao acionista', value: d.totalShareholderReturn != null ? `${nf(d.totalShareholderReturn)}%` : '—' },
                { label: 'Rendimento futuro de dividendos', value: d.futureDividendYield != null ? `${nf(d.futureDividendYield)}%` : '—' },
                { label: 'Crescimento de dividendos (10a)', value: d.dividendGrowth != null ? `${nf(d.dividendGrowth)}%` : '—' },
                { label: 'Próximo pagamento', value: d.nextPaymentDate ? formatDate(d.nextPaymentDate) : 'Não divulgado' },
                { label: 'Data ex-dividendo', value: formatDate(d.exDividendDate) },
                { label: 'Dividendo por ação', value: `R$ ${nf(d.dividendPerShare, 3)}` },
                { label: 'Payout ratio atual', value: `${d.payoutRatio ?? 0}%` },
              ].map((row) => (
                <tr key={row.label} className="border-t border-border">
                  <td className="py-2 text-muted-foreground pr-4">{row.label}</td>
                  <td className="py-2 text-right font-medium text-foreground">{row.value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Recent Dividend Updates */}
        <div className="analysis-card p-5 flex flex-col">
          <h3 className="text-sm font-semibold text-foreground mb-3">Atualizações recentes de dividendos</h3>
          <div className="flex-1">
            <ul className="space-y-0">
              {(data.dividendUpdates ?? []).slice(0, 5).map((item) => {
                const iconColor = item.sentiment === 'good' ? 'text-teal-500' : item.sentiment === 'bad' ? 'text-rose-500' : 'text-muted-foreground';
                const bgColor = item.sentiment === 'good' ? 'bg-success-surface' : item.sentiment === 'bad' ? 'bg-danger-surface' : 'bg-muted';
                return (
                  <li key={item.id} className="flex items-start gap-3 py-2.5 border-b border-border/50">
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${bgColor}`}>
                      {item.sentiment === 'good' && (
                        <svg className={`w-5 h-5 ${iconColor}`} viewBox="0 0 24 24" fill="currentColor"><path fillRule="evenodd" clipRule="evenodd" d="M17 3a.5.5 0 000 1h2.207l-4.2 3.817A6.478 6.478 0 0011 6.02V4.5a.5.5 0 00-1 0v1.519A6.501 6.501 0 004.019 12H2.5a.5.5 0 000 1h1.519A6.501 6.501 0 0010 18.981V20.5a.5.5 0 001 0v-1.519A6.501 6.501 0 0016.981 13H18.5a.5.5 0 000-1h-1.519a6.467 6.467 0 00-1.308-3.436L20 4.63V7a.5.5 0 001 0V3h-4z" /></svg>
                      )}
                      {item.sentiment === 'bad' && (
                        <svg className={`w-5 h-5 ${iconColor}`} viewBox="0 0 24 24" fill="currentColor"><path fillRule="evenodd" clipRule="evenodd" d="M10 3.5a.5.5 0 011 0v1.519A6.501 6.501 0 0116.981 11H18.5a.5.5 0 010 1h-1.519a6.468 6.468 0 01-1.308 3.436L20 19.37V17a.5.5 0 011 0v4h-4a.5.5 0 010-1h2.207l-4.2-3.817A6.478 6.478 0 0111 17.98V19.5a.5.5 0 01-1 0v-1.519A6.501 6.501 0 014.019 12H2.5a.5.5 0 010-1h1.519A6.501 6.501 0 0110 5.019V3.5z" /></svg>
                      )}
                      {item.sentiment === 'neutral' && (
                        <svg className={`w-5 h-5 ${iconColor}`} viewBox="0 0 24 24" fill="currentColor"><path fillRule="evenodd" clipRule="evenodd" d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10zm-1-7h2V7h-2v8zm0 4h2v-2h-2v2z" /></svg>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-foreground leading-5 line-clamp-2">{item.title}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{formatDate(item.date)}</p>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
          <button
            onClick={() => setDrawerOpen(true)}
            className="mt-3 w-full rounded-lg bg-brand-surface hover:bg-brand-surface/80 text-brand-text text-xs font-semibold py-2 text-center transition-colors"
          >
            Mostrar todas as atualizações
          </button>
        </div>
      </div>

      {/* ── Drawer lateral de atualizações ── */}
      {drawerOpen && typeof document !== 'undefined' && createPortal(
        <>
          <div
            className="fixed inset-0 bg-black/30 z-40"
            onClick={() => setDrawerOpen(false)}
          />
          <div className="fixed right-0 top-0 h-full w-full max-w-md bg-card shadow-2xl z-50 flex flex-col">
            <div className="flex items-center justify-between px-6 py-5 border-b border-border">
              <h2 className="text-sm font-semibold text-foreground">Atualizações recentes de dividendos</h2>
              <button
                onClick={() => setDrawerOpen(false)}
                className="p-1.5 rounded hover:bg-hover transition-colors text-muted-foreground hover:text-foreground"
                aria-label="Fechar"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-6 py-2">
              <ul className="space-y-0">
                {(data.dividendUpdates ?? []).map((item) => {
                  const iconColor = item.sentiment === 'good' ? 'text-teal-500' : item.sentiment === 'bad' ? 'text-rose-500' : 'text-muted-foreground';
                  const bgColor = item.sentiment === 'good' ? 'bg-success-surface' : item.sentiment === 'bad' ? 'bg-danger-surface' : 'bg-muted';
                  return (
                    <li key={item.id} className="flex items-start gap-3 py-3 border-b border-border/50 last:border-0">
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${bgColor}`}>
                        {item.sentiment === 'good' && (
                          <svg className={`w-5 h-5 ${iconColor}`} viewBox="0 0 24 24" fill="currentColor"><path fillRule="evenodd" clipRule="evenodd" d="M17 3a.5.5 0 000 1h2.207l-4.2 3.817A6.478 6.478 0 0011 6.02V4.5a.5.5 0 00-1 0v1.519A6.501 6.501 0 004.019 12H2.5a.5.5 0 000 1h1.519A6.501 6.501 0 0010 18.981V20.5a.5.5 0 001 0v-1.519A6.501 6.501 0 0016.981 13H18.5a.5.5 0 000-1h-1.519a6.467 6.467 0 00-1.308-3.436L20 4.63V7a.5.5 0 001 0V3h-4z" /></svg>
                        )}
                        {item.sentiment === 'bad' && (
                          <svg className={`w-5 h-5 ${iconColor}`} viewBox="0 0 24 24" fill="currentColor"><path fillRule="evenodd" clipRule="evenodd" d="M10 3.5a.5.5 0 011 0v1.519A6.501 6.501 0 0116.981 11H18.5a.5.5 0 010 1h-1.519a6.468 6.468 0 01-1.308 3.436L20 19.37V17a.5.5 0 011 0v4h-4a.5.5 0 010-1h2.207l-4.2-3.817A6.478 6.478 0 0111 17.98V19.5a.5.5 0 01-1 0v-1.519A6.501 6.501 0 014.019 12H2.5a.5.5 0 010-1h1.519A6.501 6.501 0 0110 5.019V3.5z" /></svg>
                        )}
                        {item.sentiment === 'neutral' && (
                          <svg className={`w-5 h-5 ${iconColor}`} viewBox="0 0 24 24" fill="currentColor"><path fillRule="evenodd" clipRule="evenodd" d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10zm-1-7h2V7h-2v8zm0 4h2v-2h-2v2z" /></svg>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-foreground leading-5">{item.title}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{formatDate(item.date)}</p>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        </>,
        document.body
      )}

      {/* Histórico e qualidade dos dividendos */}
      <DividendHistorySection data={data} hovered={hovered} setHovered={setHovered} />

      <DividendYieldVsMarketSection data={data} />
      <DividendCoverageSection data={data} />

    </div>
  );
}

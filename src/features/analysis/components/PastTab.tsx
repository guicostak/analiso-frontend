'use client';

import React, { useState } from 'react';
import {
  AreaChart as TremorArea,
  BarChart as TremorBar,
  LineChart as TremorLine,
} from '@tremor/react';
import type { AnalysisData } from '../interfaces';
import { COLORS } from '../constants/colors';
import { safeN, safeNbr, formatNumber } from '../utils/formatters';
import { SectionCard, DimensionIntroCard, DimensionScoreCard, CheckList, GrowthBarChart, GaugeCard, GAUGE_SEGMENT_PATHS, gaugeSegmentColor, gaugePolar, gaugeSectorPath, GAUGE_AXIS_TICKS } from './AnalysisShared';
import { SankeySection } from './SankeySection';

const HISTORICO_CHART_SERIES: { key: string; color: string; hex: string }[] = [
  { key: 'Receita',                                              color: 'blue',   hex: '#3b82f6' },
  { key: 'Ganhos',                                               color: 'teal',   hex: '#14b8a6' },
  { key: 'Fluxo de Caixa Livre',                                 color: 'orange', hex: '#f97316' },
  { key: 'Fluxo de Caixa das Atividades Operacionais (FCO)',     color: 'violet', hex: '#8b5cf6' },
  { key: 'Despesas Operacionais',                                color: 'rose',   hex: '#f43f5e' },
];

function HistoricoGanhosSection({ data }: { data: AnalysisData }) {
  const g = data.growth;
  const [activeKeys, setActiveKeys] = useState<Set<string>>(
    new Set(HISTORICO_CHART_SERIES.map(s => s.key))
  );

  const eS = (g.earningsSeries ?? []).filter(e => e.type === 'historical');
  const rS = (g.revenueSeries ?? []).filter(r => r.type === 'historical');
  const fS = (g.freeCashFlowSeries ?? []).filter(r => r.type === 'historical');
  const cS = (g.cashFromOpSeries ?? []).filter(r => r.type === 'historical');
  const oS = (g.operatingExpensesSeries ?? []).filter(r => r.type === 'historical');

  const chartData = eS.map((e, i) => ({
      year: e.year,
      'Receita':                                              rS[i]?.value ?? 0,
      'Ganhos':                                               e.value,
      'Fluxo de Caixa Livre':                                fS[i]?.value ?? 0,
      'Fluxo de Caixa das Atividades Operacionais (FCO)':    cS[i]?.value ?? 0,
      'Despesas Operacionais':                               oS[i]?.value ?? 0,
    }));

  const activeSeries = HISTORICO_CHART_SERIES.filter(s => activeKeys.has(s.key));

  const toggleKey = (key: string) =>
    setActiveKeys(prev => {
      const next = new Set(prev);
      if (next.has(key)) { if (next.size > 1) next.delete(key); }
      else next.add(key);
      return next;
    });

  return (
    <section>
      <h3 className="text-base font-semibold text-neutral-900 mb-4" style={{ fontFamily: 'Inter, sans-serif' }}>
        Histórico de ganhos e receitas
      </h3>
      <div className="bg-white rounded-2xl shadow-sm p-5">
        <div className="h-[360px] [&_.recharts-cartesian-axis-tick_text]:text-[10px] [&_.recharts-cartesian-axis-tick_text]:fill-neutral-400">
          <TremorArea
            data={chartData}
            index="year"
            categories={activeSeries.map(s => s.key)}
            colors={activeSeries.map(s => s.color)}
            valueFormatter={(v: number) => { const a = Math.abs(v); return a >= 1e9 ? `R$ ${(v/1e9).toFixed(1)}bi` : a >= 1e6 ? `R$ ${(v/1e6).toFixed(1)}mi` : `R$ ${v.toFixed(0)}`; }}
            showLegend={false}
            showGridLines={true}
            yAxisWidth={56}
            /* fill="gradient" */
            curveType="monotone"
          />
        </div>
        <div className="flex gap-2 flex-wrap mt-3">
          {HISTORICO_CHART_SERIES.map(s => (
            <button
              key={s.key}
              onClick={() => toggleKey(s.key)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all border border-neutral-200 bg-neutral-100 text-neutral-700 hover:bg-neutral-200 ${
                activeKeys.has(s.key) ? 'opacity-100' : 'opacity-40'
              }`}
            >
              <span
                className="w-2.5 h-2.5 rounded-full flex-shrink-0 border"
                style={activeKeys.has(s.key)
                  ? { backgroundColor: s.hex, borderColor: s.hex }
                  : { backgroundColor: 'transparent', borderColor: s.hex }}
              />
              {s.key}
            </button>
          ))}
        </div>

        <div className="mt-4">
          {[
            { id: 'quality-earnings', passed: true,  label: 'Qualidade dos Lucros:', content: 'WEGE3 possui lucros de alta qualidade.' },
            { id: 'profit-margin',    passed: false, label: 'Margem de Lucro Crescente:', content: 'As margens de lucro líquido atuais da VALE3 (15,6%) são menores do que no ano passado (15,9%).' },
          ].map(check => (
            <blockquote key={check.id} className="flex items-start gap-3 py-2.5 border-t border-neutral-100 first:border-0">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-0.5">
                  <CriteriaIcon passed={check.passed} size={24} />
                </div>
                <p className="text-xs leading-5 text-neutral-700">
                  <span className={`font-semibold ${check.passed ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {check.label}{' '}
                  </span>
                  {check.content}
                </p>
              </div>
            </blockquote>
          ))}
        </div>
      </div>
    </section>
  );
}

function FreeCashFlowSection({ data }: { data: AnalysisData }) {
  const wf = data.pastPerformance?.cashFlowWaterfall;
  if (!wf) return null;
  const TOP_PAD = 28;
  const CHART_H = 280;
  const BASELINE = TOP_PAD + CHART_H;

  type Bar = { label: string; value: number; type: 'base' | 'positive' | 'negative' | 'result' };
  // depreciation = CFO - NI (all non-cash adjustments); others = Capex (negative outflow)
  const cfoAdj = wf.depreciation ?? 0;
  const bars: Bar[] = [
    { label: 'Lucros',                         value: wf.earnings ?? 0,   type: 'base'                              },
    { label: 'Ajustes ao FCO',                 value: cfoAdj,             type: cfoAdj >= 0 ? 'positive' : 'negative' },
    { label: 'Capex / Investimentos',          value: wf.others ?? 0,     type: 'negative'                          },
    { label: 'Fluxo de Caixa Livre',           value: wf.freeCashFlow ?? 0, type: 'result'                          },
  ];

  // compute running totals for waterfall positioning
  const positives = bars.filter(b => b.type !== 'result');
  const maxVal = positives.reduce((acc, b) => {
    if (b.type === 'base' || b.type === 'positive') return acc + b.value;
    return acc;
  }, 0);
  const scale = CHART_H / maxVal;

  let running = 0;
  const computed = bars.map(b => {
    if (b.type === 'result') {
      const h = Math.max(b.value * scale, 2);
      return { ...b, y: BASELINE - h, h };
    }
    const absVal = Math.abs(b.value);
    const h = Math.max(absVal * scale, 2);
    let y: number;
    if (b.type === 'negative') {
      y = BASELINE - running * scale;
    } else {
      y = BASELINE - (running + absVal) * scale;
    }
    running += b.type === 'negative' ? -absVal : absVal;
    return { ...b, y, h };
  });

  const fmtWF = (v: number) => {
    const abs = Math.abs(v);
    let str: string;
    if (abs >= 1e9) str = `R$${(abs / 1e9).toFixed(2)}b`;
    else if (abs >= 1e6) str = `R$${(abs / 1e6).toFixed(2)}m`;
    else if (abs >= 1e3) str = `R$${(abs / 1e3).toFixed(1)}k`;
    else str = `R$${abs.toFixed(0)}`;
    return v < 0 ? `-${str}` : str;
  };

  const COLOR: Record<string, string> = {
    base:     '#6366f1',
    positive: '#14b8a6',
    negative: '#f43f5e',
    result:   '#3b82f6',
  };

  const DESCRIPTIONS: Record<string, string> = {
    'Lucros':                    'É o lucro líquido declarado pela empresa. Lucro contábil não é o mesmo que caixa — por isso precisamos dos ajustes abaixo para chegar ao dinheiro real gerado.',
    'Ajustes ao FCO':            'Diferença entre o Fluxo de Caixa Operacional (FCO) e o lucro líquido. Inclui D&A (despesas não-caixa somadas de volta), variações no capital de giro e outros ajustes operacionais. Positivo significa mais caixa do que o lucro; negativo, menos.',
    'Capex / Investimentos':     'Dinheiro gasto em aquisição de ativos imobilizados e intangíveis (máquinas, equipamentos, propriedades). Sempre é uma saída de caixa, pois são investimentos necessários para manter e expandir a operação.',
    'Fluxo de Caixa Livre':      'O resultado final: caixa operacional gerado menos os investimentos necessários para operar. É o dinheiro real disponível para pagar dividendos, reduzir dívidas ou investir em crescimento.',
  };

  const [hoveredBar, setHoveredBar] = useState<{ label: string; mouseX: number; mouseY: number } | null>(null);

  // Dynamic checks based on actual waterfall values
  const fcf = wf.freeCashFlow ?? 0;
  const ni  = wf.earnings ?? 0;
  const fcfFmt = (v: number) => {
    const abs = Math.abs(v);
    if (abs >= 1e9) return `R$${(abs / 1e9).toFixed(2)}b`;
    if (abs >= 1e6) return `R$${(abs / 1e6).toFixed(2)}m`;
    return `R$${abs.toFixed(0)}`;
  };
  const fcfIsPositive = fcf > 0;
  const fcfRatio = ni > 0 ? fcf / ni : null;
  const checks = [
    {
      id: 'fcf-quality',
      passed: fcfIsPositive,
      label: 'FCL Positivo:',
      content: fcfIsPositive
        ? `A empresa gerou ${fcfFmt(fcf)} de fluxo de caixa livre — sinal de que a operação converte lucros em caixa real.`
        : `O fluxo de caixa livre foi negativo (${fcfFmt(fcf)}), indicando que os investimentos superaram o caixa operacional gerado no período.`,
    },
    {
      id: 'fcf-growing',
      passed: fcfRatio !== null && fcfRatio >= 0.7,
      label: 'FCL vs. Lucro:',
      content: fcfRatio !== null
        ? `O fluxo de caixa livre (${fcfFmt(fcf)}) representa ${(fcfRatio * 100).toFixed(0)}% do lucro líquido (${fcfFmt(ni)}). ${fcfRatio >= 0.7 ? 'Alta conversão de lucro em caixa — sinal de qualidade de resultados.' : 'Conversão abaixo de 70% pode indicar alta necessidade de reinvestimento ou variações de capital de giro.'}`
        : 'Não foi possível calcular a relação FCL/Lucro.',
    },
  ];

  return (
    <section data-cy-id="report-sub-section-free-cash-flow-vs-earnings-analysis" data-section="past">
      <h3 className="text-base font-semibold text-neutral-900 mb-4" style={{ fontFamily: 'Inter, sans-serif' }}>
        Análise de Fluxo de Caixa Livre vs. Lucros
      </h3>
      <div className="bg-white rounded-2xl shadow-sm p-5">
        <div style={{ width: '100%', overflowX: 'auto', position: 'relative' }}>
          {/* Tooltip */}
          {hoveredBar && (
            <div style={{
              position: 'fixed',
              left: hoveredBar.mouseX - 110,
              top: hoveredBar.mouseY - 90,
              background: '#1f2937',
              color: '#f9fafb',
              borderRadius: 8,
              padding: '8px 12px',
              fontSize: 11,
              width: 220,
              lineHeight: '1.5',
              pointerEvents: 'none',
              zIndex: 9999,
              boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
            }}>
              <p style={{ fontWeight: 600, marginBottom: 2, color: '#fff' }}>{hoveredBar.label}</p>
              <p style={{ color: '#d1d5db' }}>{DESCRIPTIONS[hoveredBar.label]}</p>
            </div>
          )}
          <svg width="100%" viewBox={`0 0 700 ${TOP_PAD + CHART_H + 100}`} style={{ display: 'block', minWidth: 480, overflow: 'visible' }}>
            {/* Baseline */}
            <line x1="0" y1={BASELINE} x2="700" y2={BASELINE} stroke="#e5e7eb" strokeWidth="1" />

            {computed.map((b, i) => {
              const colW = 700 / bars.length;
              const barX = i * colW;
              const barW = colW * 0.72;
              const barPad = (colW - barW) / 2;
              const cx = barX + colW / 2;

              return (
                <g key={b.label}>
                  {/* Bar */}
                  <rect x={barX + barPad} y={b.y} width={barW} height={b.h} fill={COLOR[b.type]} rx={3} />
                  {/* Connector line to next bar (not for result) */}
                  {i < computed.length - 2 && (
                    <line
                      x1={barX + barPad + barW} y1={b.y}
                      x2={(i + 1) * colW + barPad} y2={b.y}
                      stroke="#d1d5db" strokeWidth="1" strokeDasharray="3,2"
                    />
                  )}
                  {/* Value label above bar */}
                  <text
                    x={cx} y={b.y - 6}
                    textAnchor="middle" fontSize={10} fontWeight="600"
                    fill={b.type === 'negative' ? '#f43f5e' : '#374151'}
                    fontFamily="Inter, system-ui, sans-serif"
                  >
                    {fmtWF(b.value)}
                  </text>
                  {/* Column label below baseline with dashed underline + hover tooltip */}
                  {(() => {
                    const lines = b.label.split(' ').reduce<string[][]>((acc, word) => {
                      const last = acc[acc.length - 1];
                      if (last && last.join(' ').length + word.length < 14) { last.push(word); }
                      else acc.push([word]);
                      return acc;
                    }, []);
                    const lastLineY = BASELINE + 16 + (lines.length - 1) * 13;
                    const labelW = Math.max(...lines.map(l => l.join(' ').length)) * 5.5;
                    return (
                      <g
                        style={{ cursor: 'help' }}
                        onMouseEnter={(e) => setHoveredBar({ label: b.label, mouseX: (e as unknown as MouseEvent).clientX, mouseY: (e as unknown as MouseEvent).clientY })}
                        onMouseLeave={() => setHoveredBar(null)}
                      >
                        {lines.map((line, li) => (
                          <text
                            key={li}
                            x={cx} y={BASELINE + 16 + li * 13}
                            textAnchor="middle" fontSize={9.5} fontWeight="500"
                            fill="#111827" fontFamily="Inter, system-ui, sans-serif"
                          >
                            {line.join(' ')}
                          </text>
                        ))}
                        {/* Dashed underline below last line */}
                        <line
                          x1={cx - labelW / 2} y1={lastLineY + 3}
                          x2={cx + labelW / 2} y2={lastLineY + 3}
                          stroke="#6b7280" strokeWidth="1" strokeDasharray="3,2"
                        />
                      </g>
                    );
                  })()}
                </g>
              );
            })}
          </svg>
        </div>

        <div className="mt-2">
          {checks.map(check => (
            <blockquote key={check.id} className="flex items-start gap-3 py-2.5 border-t border-neutral-100 first:border-0">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-0.5">
                  <CriteriaIcon passed={check.passed} size={24} />
                </div>
                <p className="text-xs leading-5 text-neutral-700">
                  <span className={`font-semibold ${check.passed ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {check.label}{' '}
                  </span>
                  {check.content}
                </p>
              </div>
            </blockquote>
          ))}
        </div>
      </div>
    </section>
  );
}

function PastEarningsGrowthSection({ data }: { data: AnalysisData }) {
  const p = data.pastPerformance;
  const ticker = data.company.ticker;

  const earningsBars = [
    { label: 'Empresa', value: p.earningsGrowthRate,           color: '#3b82f6', textColor: '#FFFFFF' },
    { label: 'Setor',   value: p.industryGrowth,               color: '#bae6fd', textColor: '#262E3A' },
    { label: 'Mercado', value: data.growth.marketEarningsGrowth, color: '#6366f1', textColor: '#FFFFFF' },
  ];

  const revenueBars = [
    { label: 'Empresa', value: p.revenueGrowthRate,            color: '#3b82f6', textColor: '#FFFFFF' },
    { label: 'Setor',   value: p.industryGrowth,               color: '#bae6fd', textColor: '#262E3A' },
    { label: 'Mercado', value: data.growth.marketRevenueGrowth, color: '#6366f1', textColor: '#FFFFFF' },
  ];

  const checks: { id: string; passed: boolean; label: string; content: React.ReactNode }[] = [
    {
      id: 'past-earnings-vs-industry',
      passed: p.earningsGrowthRate > p.industryGrowth,
      label: 'Lucros vs Setor:',
      content: (
        <span>O crescimento de lucros de {ticker} ({p.earningsGrowthRate}% ao ano) foi {p.earningsGrowthRate > p.industryGrowth ? 'acima' : 'abaixo'} da média do setor ({p.industryGrowth}% ao ano) nos últimos anos.</span>
      ),
    },
    {
      id: 'past-earnings-high',
      passed: p.earningsGrowthRate > 20,
      label: 'Alto Crescimento Histórico:',
      content: p.earningsGrowthRate > 20
        ? <span>{ticker} apresentou crescimento de lucros expressivo no histórico recente, acima de 20% ao ano.</span>
        : <span>O crescimento histórico de lucros de {ticker} ({p.earningsGrowthRate}% ao ano) foi positivo, mas abaixo de 20% ao ano.</span>,
    },
    {
      id: 'past-revenue-vs-industry',
      passed: p.revenueGrowthRate > p.industryGrowth,
      label: 'Receita vs Setor:',
      content: (
        <span>A receita de {ticker} ({p.revenueGrowthRate}% ao ano) cresceu {p.revenueGrowthRate > p.industryGrowth ? 'mais rápido' : 'mais devagar'} que o setor ({p.industryGrowth}% ao ano) no período analisado.</span>
      ),
    },
  ];

  return (
    <section data-section="past">
      <h3 className="text-base font-semibold text-neutral-900 mb-4" style={{ fontFamily: 'Inter, sans-serif' }}>
        Análise do crescimento dos lucros passados
      </h3>
      <div className="bg-white rounded-2xl shadow-sm p-6">
        <div className="flex gap-6">
          <GrowthBarChart title="Crescimento Anual de Lucros (Histórico)" bars={earningsBars} />
          <GrowthBarChart title="Crescimento Anual de Receita (Histórico)" bars={revenueBars} />
        </div>
        <div className="mt-4">
          {checks.map(check => (
            <blockquote key={check.id} className="flex items-start gap-3 py-2.5 border-t border-neutral-100 first:border-0">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-0.5">
                  <CriteriaIcon passed={check.passed} size={24} />
                </div>
                <p className="text-xs leading-5 text-neutral-700">
                  <span className={`font-semibold ${check.passed ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {check.label}{' '}
                  </span>
                  {check.content}
                </p>
              </div>
            </blockquote>
          ))}
        </div>
      </div>
    </section>
  );
}

function PastROESection({ data }: { data: AnalysisData }) {
  const p           = data.pastPerformance;
  const companyROE  = p.currentROE;
  const industryROE = p.industryROE ?? 0;

  const toAngle = (pct: number) => -90 + (pct / 40) * 180;
  const companyAngle  = toAngle(Math.min(companyROE, 40));
  const industryAngle = toAngle(Math.min(industryROE, 40));

  const companySector  = gaugeSectorPath(102, 90, companyAngle);
  const industrySector = gaugeSectorPath(84,  72, industryAngle);

  const passed = companyROE > industryROE;

  return (
    <section className="bg-white rounded-2xl shadow-sm overflow-hidden">
      <div className="px-6 pt-5 pb-4">
        <h3 style={{ fontFamily: 'Inter, sans-serif' }} className="text-base font-semibold text-neutral-900">
          Retorno sobre o Patrimônio Líquido
        </h3>
      </div>

      <div className="px-6 pb-6">
        <div className="flex flex-row items-stretch gap-6">

          {/* Left: gauge + legend */}
          <div className="flex flex-col items-center flex-shrink-0">
            <div className="w-[320px]">
              <svg
                width="100%"
                height="240"
                viewBox="0 0 300 158"
                role="document"
                aria-label="ROE"
                style={{ display: 'block' }}
              >
                <defs>
                  <path
                    id="past-roe-pin-large"
                    d="M2.91895 2.99891C2.96406 1.32971 4.33019 0 6 0C7.66981 0 9.03594 1.32971 9.08105 2.9989L11.8379 105.002C11.9267 108.288 9.28716 111 6 111C2.71284 111 0.0732933 108.288 0.162103 105.002L2.91895 2.99891Z"
                  />
                  <path
                    id="past-roe-pin-medium"
                    d="M2.43209 2.49908C2.46989 1.10803 3.60844 0 5 0C6.39156 0 7.53011 1.10803 7.56791 2.49908L9.86418 87.0018C9.93859 89.74 7.73918 92 5 92C2.26082 92 0.0614128 89.74 0.135819 87.0018L2.43209 2.49908Z"
                  />
                </defs>

                <g transform="translate(150 150)">
                  <path
                    d="M0,-120A120,120,0,0,0,-97.082,70.534L-87.374,63.481A108,108,0,0,1,0,-108Z"
                    fill="hsl(0,77%,58%)"
                    fillOpacity="0.5"
                  />
                  <path
                    d="M0,-120A120,120,0,0,1,97.082,70.534L87.374,63.481A108,108,0,0,0,0,-108Z"
                    fill="hsl(151,63%,48%)"
                    fillOpacity="0.5"
                  />
                  {GAUGE_SEGMENT_PATHS.map((d, i) => (
                    <path key={i} d={d} fill={gaugeSegmentColor(i)} />
                  ))}

                  <path d={companySector}  fill="#3b82f6" fillOpacity="0.12" />
                  <path d={industrySector} fill="#14b8a6" fillOpacity="0.12" />

                  <circle cx="0" cy="0" r="12" fill="#d1d5db" fillOpacity="0.35" />

                  <g transform={`translate(-6,-104.5) rotate(${companyAngle.toFixed(3)}, 6, 104.5)`}>
                    <use href="#past-roe-pin-large" fill="#3b82f6" />
                  </g>

                  <g transform={`translate(-5,-86.5) rotate(${industryAngle.toFixed(3)}, 5, 86.5)`}>
                    <use href="#past-roe-pin-medium" fill="#14b8a6" />
                  </g>

                  {GAUGE_AXIS_TICKS.map(({ label, angleDeg }) => {
                    const lp = gaugePolar(angleDeg, 136);
                    const to = gaugePolar(angleDeg, 120);
                    const ti = gaugePolar(angleDeg, 106);
                    return (
                      <g key={angleDeg}>
                        <text
                          x={lp.x}
                          y={lp.y}
                          textAnchor="middle"
                          dominantBaseline="middle"
                          fontSize="9.5"
                          fill="#9ca3af"
                          fontFamily="Inter, sans-serif"
                        >
                          {label}
                        </text>
                        <line
                          x1={to.x} y1={to.y}
                          x2={ti.x} y2={ti.y}
                          stroke="#d1d5db"
                          strokeWidth="1.5"
                          strokeOpacity="0.8"
                        />
                      </g>
                    );
                  })}
                </g>
              </svg>
            </div>

            <div className="-mt-5 w-[160px]">
              <table className="text-xs border-collapse w-full">
                <thead>
                  <tr>
                    <th colSpan={2} className="pb-1.5 text-left font-semibold text-neutral-600 text-[11px] whitespace-nowrap">
                      ROE
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="pr-6 py-0.5 text-[11px]" style={{ color: '#3b82f6' }}>Empresa</td>
                    <td className="font-semibold text-neutral-800 text-[11px]">{companyROE}%</td>
                  </tr>
                  <tr>
                    <td className="pr-6 py-0.5 text-[11px]" style={{ color: '#14b8a6' }}>Indústria</td>
                    <td className="font-semibold text-neutral-800 text-[11px]">{industryROE}%</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Right: statement */}
          <div className="flex-1 flex items-center self-stretch">
            <blockquote className="w-full flex items-start gap-3 rounded-xl border border-neutral-100 bg-neutral-50/60 px-4 py-4">
              <div
                className="rounded-full flex-shrink-0 mt-1.5"
                style={{ width: 8, height: 8, backgroundColor: passed ? '#2EAA8A' : '#D1D5DB' }}
              />
              <p className="text-sm text-neutral-700 leading-6 break-words">
                <span className="font-semibold text-neutral-800">Alto ROE: </span>
                <span className="font-medium">{data.company.ticker}</span>
                {' '}Retorno sobre o Patrimônio Líquido ({companyROE.toFixed(1).replace('.', ',')}%) é considerado alto.
              </p>
            </blockquote>
          </div>

        </div>
      </div>
    </section>
  );
}

function PastROAROCESection({ data }: { data: AnalysisData }) {
  const p      = data.pastPerformance;
  const ticker = data.company.ticker;

  return (
    <div className="flex gap-6">
      <GaugeCard
        title="Retorno sobre Ativos"
        ariaLabel="ROA"
        value1={p.currentROA}   color1="#3b82f6"
        value2={p.industryROA}  color2="#14b8a6"
        legendTitle="ROA"
        legend1Label="Empresa"
        legend2Label="Indústria"
        statementLabel="ROA:"
        statementText={`${ticker} tem retorno sobre ativos de ${safeNbr(p.currentROA)}%, ${(p.currentROA ?? 0) > (p.industryROA ?? 0) ? 'acima' : 'abaixo'} da média da indústria (${safeNbr(p.industryROA)}%).`}
      />
      <GaugeCard
        title="Retorno sobre o Capital Empregado"
        ariaLabel="ROCE"
        value1={p.currentROCE}  color1="#3b82f6"
        value2={p.roce3yAgo}    color2="#14b8a6"
        legendTitle="ROCE"
        legend1Label="ano passado"
        legend2Label="3 anos atrás"
        statementLabel="ROCE:"
        statementText={`${ticker} tem retorno sobre capital empregado de ${safeNbr(p.currentROCE)}%, ${(p.currentROCE ?? 0) > (p.roce3yAgo ?? 0) ? 'superior' : 'inferior'} ao de 3 anos atrás (${safeNbr(p.roce3yAgo)}%).`}
      />
    </div>
  );
}

function PastReadingCard({ data }: { data: AnalysisData }) {
  const p   = data.pastPerformance;
  const peg = p.earningsGrowthRate ?? 0;
  const pig = p.industryGrowth ?? 0;
  const proe = p.currentROE ?? 0;
  const pnm  = p.netMargin ?? 0;
  const pepsg = p.epsGrowthRate ?? 0;
  const proce = p.currentROCE ?? 0;
  const proce3 = p.roce3yAgo ?? 0;

  type Strength = 'forte' | 'moderado' | 'fraco';
  const strength: Strength =
    peg > pig * 1.5 && proe > 15
      ? 'forte'
      : peg > 0 && proe > 0
        ? 'moderado'
        : 'fraco';

  const thesis = {
    forte: {
      headline:  'Histórico operacional sólido, acima do setor',
      sub:       `Os lucros cresceram ${safeN(peg)}% ao ano, acima da média da indústria de ${safeN(pig)}%.`,
      badge:     'Desempenho forte',
      badgeBg:   '#EFF6FF',
      badgeColor:'#1D4ED8',
      badgeDot:  '#3B82F6',
      synthesis: `O histórico de resultados mostra crescimento acima do setor, com margens e retornos saudáveis. É uma base sólida, mas o passado não garante resultados futuros.`,
    },
    moderado: {
      headline:  'Histórico de resultados positivo, com variações',
      sub:       `Crescimento de lucros de ${safeN(peg)}% ao ano. Retorno sobre patrimônio de ${safeN(proe)}%.`,
      badge:     'Desempenho moderado',
      badgeBg:   '#F0FDF4',
      badgeColor:'#0F766E',
      badgeDot:  '#14B8A6',
      synthesis: `Resultados históricos positivos, mas sem consistência suficiente para uma tese de alta qualidade sem ressalvas. Acompanhe a evolução dos próximos trimestres.`,
    },
    fraco: {
      headline:  'Histórico operacional abaixo do esperado',
      sub:       `Crescimento de lucros de ${safeN(peg)}%, abaixo da média da indústria de ${safeN(pig)}%.`,
      badge:     'Desempenho fraco',
      badgeBg:   '#FFF7ED',
      badgeColor:'#C2410C',
      badgeDot:  '#F97316',
      synthesis: `O histórico recente não mostra qualidade operacional diferenciada. Acompanhe uma reversão consistente antes de aumentar a exposição.`,
    },
  }[strength];

  type EvidenceRow = { criterion: string; observed: string; reference: string; micro: string };
  type LimitRow    = { criterion: string; observed: string; reference: string; micro: string };

  const evidences: EvidenceRow[] = [];
  if (peg > pig) {
    evidences.push({
      criterion: 'Crescimento do lucro acima do setor',
      observed:  `${safeN(peg)}% ao ano`,
      reference: `Setor ${safeN(pig)}%`,
      micro:     'Lucros históricos superam a média da indústria.',
    });
  }
  if (proe > 10) {
    evidences.push({
      criterion: 'Retorno sobre patrimônio saudável',
      observed:  `${safeN(proe)}%`,
      reference: 'Referência > 10%',
      micro:     'ROE indica retorno consistente sobre o capital próprio.',
    });
  }
  if (pnm > 5) {
    evidences.push({
      criterion: 'Margem líquida positiva',
      observed:  `${safeN(pnm)}%`,
      reference: 'Acima de 5%',
      micro:     'Margem líquida indica operação rentável.',
    });
  }
  if (evidences.length < 2 && pepsg > 0) {
    evidences.push({
      criterion: 'LPA em crescimento',
      observed:  `${safeN(pepsg)}% ao ano`,
      reference: 'LPA positivo',
      micro:     'Crescimento do lucro por ação confirma geração de valor.',
    });
  }

  const limitations: LimitRow[] = [];
  if (peg < pig) {
    limitations.push({
      criterion: 'Crescimento do lucro abaixo do setor',
      observed:  `${safeN(peg)}% ao ano`,
      reference: `Setor ${safeN(pig)}%`,
      micro:     'Crescimento histórico não acompanhou a indústria.',
    });
  }
  if (!p.epsAccelerating) {
    limitations.push({
      criterion: 'Aceleração do LPA não confirmada',
      observed:  'Sem aceleração',
      reference: 'Tendência estável ou queda',
      micro:     'Crescimento por ação não está acelerando.',
    });
  }
  if (proce < proce3) {
    limitations.push({
      criterion: 'ROCE em declínio',
      observed:  `${safeN(proce)}%`,
      reference: `3a atrás ${safeN(proce3)}%`,
      micro:     'Retorno sobre capital empregado em queda nos últimos anos.',
    });
  }

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">

        {/* ── 1. Header ── */}
        <div className="px-7 pt-7 pb-6 flex items-start justify-between gap-6">
          <div className="flex-1 min-w-0">
            <h2 className="text-[22px] font-bold text-[#0F172A] leading-snug mb-2">
              {thesis.headline}
            </h2>
            <p className="text-[14px] text-slate-500 leading-relaxed max-w-xl">
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
        <div className="border-t border-neutral-100 grid grid-cols-2 divide-x divide-neutral-100">
          <div className="px-7 py-6">
            <div className="text-[10.5px] font-semibold text-neutral-400 uppercase mb-5">
              O que reforça essa conclusão
            </div>
            <div className="space-y-5">
              {evidences.slice(0, 3).map((e, i) => (
                <div key={i} className="flex gap-3.5">
                  <div className="w-[3px] rounded-full bg-[#355CDE] shrink-0 self-stretch" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-2 flex-wrap">
                      <span className="text-[15px] font-bold text-[#0F172A] tabular-nums">{e.observed}</span>
                      {e.reference && <span className="text-[11px] text-slate-400">{e.reference}</span>}
                    </div>
                    <div className="text-[12px] font-medium text-slate-600 mt-0.5">{e.criterion}</div>
                    <div className="text-[11px] text-slate-400 mt-0.5">{e.micro}</div>
                  </div>
                </div>
              ))}
              {evidences.length === 0 && (
                <div className="text-[12px] text-slate-400 italic">Sem evidências de desempenho diferenciado.</div>
              )}
            </div>
          </div>
          <div className="px-7 py-6">
            <div className="text-[10.5px] font-semibold text-neutral-400 uppercase mb-5">
              O que limita essa leitura
            </div>
            <div className="space-y-5">
              {limitations.slice(0, 2).map((l, i) => (
                <div key={i} className="flex gap-3.5">
                  <div className="w-[3px] rounded-full bg-amber-400 shrink-0 self-stretch" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-2 flex-wrap">
                      <span className="text-[15px] font-bold text-[#0F172A] tabular-nums">{l.observed}</span>
                      <span className="text-[11px] text-slate-400">{l.reference}</span>
                    </div>
                    <div className="text-[12px] font-medium text-slate-600 mt-0.5">{l.criterion}</div>
                    <div className="text-[11px] text-slate-400 mt-0.5">{l.micro}</div>
                  </div>
                </div>
              ))}
              {limitations.length === 0 && (
                <div className="text-[12px] text-slate-400 italic">Nenhum limitador relevante identificado.</div>
              )}
            </div>
          </div>
        </div>

        {/* ── 3. Synthesis ── */}
        <div className="border-t border-neutral-100 px-7 py-4 bg-neutral-50/50 flex items-center gap-3">
          <div className="w-1 h-5 rounded-full bg-neutral-300 shrink-0" />
          <p className="text-[12.5px] text-slate-500 leading-relaxed">
            {thesis.synthesis}
          </p>
        </div>
      </div>
    </div>
  );
}

export function PastTab({ data }: { data: AnalysisData }) {
  const p = data.pastPerformance;
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const nf = (n: number | null | undefined, d = 1) => (n ?? 0).toFixed(d);

  return (
    <div className="space-y-6">

      {/* ── Reading Card — same pattern as ValuationReadingCard ── */}
      <PastReadingCard data={data} />

      {/* Key Information + Recent Updates — side by side */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

        {/* Key Information */}
        <div className="bg-white rounded-2xl shadow-sm p-5">
          <h3 className="text-sm font-semibold text-neutral-800 mb-4">Informações chave</h3>
          <div className="flex gap-6 mb-4">
            <div className="flex gap-2 items-start">
              <div className="w-1 rounded-full bg-amber-500 self-stretch mt-0.5" />
              <div>
                <p className="text-lg font-bold text-neutral-900">{nf(p.earningsGrowthRate, 2)}%</p>
                <p className="text-xs text-neutral-400">Crescimento do lucro (% ao ano)</p>
              </div>
            </div>
            <div className="flex gap-2 items-start">
              <div className="w-1 rounded-full bg-amber-500 self-stretch mt-0.5" />
              <div>
                <p className="text-lg font-bold text-neutral-900">{nf(p.epsGrowthRate, 2)}%</p>
                <p className="text-xs text-neutral-400">Lucro por ação (% ao ano)</p>
              </div>
            </div>
          </div>
          <table className="w-full text-xs">
            <tbody>
              {[
                { label: 'Média do setor', value: `${nf(p.industryGrowth)}%` },
                { label: 'Crescimento da receita (% ao ano)', value: `${nf(p.revenueGrowthRate)}%` },
                { label: 'Retorno sobre patrimônio (ROE)', value: `${nf(p.currentROE)}%` },
                { label: 'Margem líquida', value: `${nf(p.netMargin)}%` },
                { label: 'Próximo balanço', value: p.nextEarningsDate },
              ].map((row) => (
                <tr key={row.label} className="border-t border-neutral-100">
                  <td className="py-2 text-neutral-500 pr-4">{row.label}</td>
                  <td className="py-2 text-right font-medium text-neutral-800">{row.value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Recent Past Performance Updates */}
        <div className="bg-white rounded-2xl shadow-sm p-5 flex flex-col">
          <h3 className="text-sm font-semibold text-neutral-800 mb-3">Atualizações recentes</h3>
          <div className="flex-1">
            <ul className="space-y-0">
              {/* 2 itens completos */}
              {data.pastUpdates.slice(0, 2).map((item) => {
                const iconColor = item.sentiment === 'good' ? 'text-teal-500' : item.sentiment === 'bad' ? 'text-rose-500' : 'text-neutral-400';
                const bgColor = item.sentiment === 'good' ? 'bg-teal-50' : item.sentiment === 'bad' ? 'bg-rose-50' : 'bg-neutral-50';
                return (
                  <li key={item.id} className="flex items-start gap-3 py-2.5 border-b border-neutral-50">
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${bgColor}`}>
                      {item.sentiment === 'good' && (
                        <svg className={`w-3.5 h-3.5 ${iconColor}`} viewBox="0 0 24 24" fill="currentColor"><path fillRule="evenodd" clipRule="evenodd" d="M17 3a.5.5 0 000 1h2.207l-4.2 3.817A6.478 6.478 0 0011 6.02V4.5a.5.5 0 00-1 0v1.519A6.501 6.501 0 004.019 12H2.5a.5.5 0 000 1h1.519A6.501 6.501 0 0010 18.981V20.5a.5.5 0 001 0v-1.519A6.501 6.501 0 0016.981 13H18.5a.5.5 0 000-1h-1.519a6.467 6.467 0 00-1.308-3.436L20 4.63V7a.5.5 0 001 0V3h-4z" /></svg>
                      )}
                      {item.sentiment === 'bad' && (
                        <svg className={`w-3.5 h-3.5 ${iconColor}`} viewBox="0 0 24 24" fill="currentColor"><path fillRule="evenodd" clipRule="evenodd" d="M10 3.5a.5.5 0 011 0v1.519A6.501 6.501 0 0116.981 11H18.5a.5.5 0 010 1h-1.519a6.468 6.468 0 01-1.308 3.436L20 19.37V17a.5.5 0 011 0v4h-4a.5.5 0 010-1h2.207l-4.2-3.817A6.478 6.478 0 0111 17.98V19.5a.5.5 0 01-1 0v-1.519A6.501 6.501 0 014.019 12H2.5a.5.5 0 010-1h1.519A6.501 6.501 0 0110 5.019V3.5z" /></svg>
                      )}
                      {item.sentiment === 'neutral' && (
                        <svg className={`w-3.5 h-3.5 ${iconColor}`} viewBox="0 0 24 24" fill="currentColor"><path fillRule="evenodd" clipRule="evenodd" d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10zm-1-7h2V7h-2v8zm0 4h2v-2h-2v2z" /></svg>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-neutral-800 leading-4 line-clamp-2">{item.title}</p>
                      <p className="text-[10px] text-neutral-400 mt-0.5">{item.date}</p>
                    </div>
                  </li>
                );
              })}
              {/* 3º item cortado */}
              {data.pastUpdates[2] && (() => {
                const item = data.pastUpdates[2];
                const iconColor = item.sentiment === 'good' ? 'text-teal-500' : item.sentiment === 'bad' ? 'text-rose-500' : 'text-neutral-400';
                const bgColor = item.sentiment === 'good' ? 'bg-teal-50' : item.sentiment === 'bad' ? 'bg-rose-50' : 'bg-neutral-50';
                return (
                  <li className="relative flex items-start gap-3 py-2.5 overflow-hidden" style={{ maxHeight: '2rem' }}>
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${bgColor}`}>
                      {item.sentiment === 'bad' && (
                        <svg className={`w-3.5 h-3.5 ${iconColor}`} viewBox="0 0 24 24" fill="currentColor"><path fillRule="evenodd" clipRule="evenodd" d="M10 3.5a.5.5 0 011 0v1.519A6.501 6.501 0 0116.981 11H18.5a.5.5 0 010 1h-1.519a6.468 6.468 0 01-1.308 3.436L20 19.37V17a.5.5 0 011 0v4h-4a.5.5 0 010-1h2.207l-4.2-3.817A6.478 6.478 0 0111 17.98V19.5a.5.5 0 01-1 0v-1.519A6.501 6.501 0 014.019 12H2.5a.5.5 0 010-1h1.519A6.501 6.501 0 0110 5.019V3.5z" /></svg>
                      )}
                      {item.sentiment === 'good' && (
                        <svg className={`w-3.5 h-3.5 ${iconColor}`} viewBox="0 0 24 24" fill="currentColor"><path fillRule="evenodd" clipRule="evenodd" d="M17 3a.5.5 0 000 1h2.207l-4.2 3.817A6.478 6.478 0 0011 6.02V4.5a.5.5 0 00-1 0v1.519A6.501 6.501 0 004.019 12H2.5a.5.5 0 000 1h1.519A6.501 6.501 0 0010 18.981V20.5a.5.5 0 001 0v-1.519A6.501 6.501 0 0016.981 13H18.5a.5.5 0 000-1h-1.519a6.467 6.467 0 00-1.308-3.436L20 4.63V7a.5.5 0 001 0V3h-4z" /></svg>
                      )}
                      {item.sentiment === 'neutral' && (
                        <svg className={`w-3.5 h-3.5 ${iconColor}`} viewBox="0 0 24 24" fill="currentColor"><path fillRule="evenodd" clipRule="evenodd" d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10zm-1-7h2V7h-2v8zm0 4h2v-2h-2v2z" /></svg>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-neutral-800 leading-5 line-clamp-1">{item.title}</p>
                    </div>
                    <div className="absolute inset-x-0 bottom-0 h-6 bg-gradient-to-t from-white to-transparent pointer-events-none" />
                  </li>
                );
              })()}
            </ul>
          </div>
          <button
            onClick={() => setDrawerOpen(true)}
            className="mt-3 w-full rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-semibold py-2 text-center transition-colors"
          >
            Mostrar todas as atualizações
          </button>
        </div>
      </div>

      {/* ── Drawer lateral de atualizações ── */}
      {drawerOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/30 z-40"
            onClick={() => setDrawerOpen(false)}
          />
          <div className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl z-50 flex flex-col">
            <div className="flex items-center justify-between px-6 py-5 border-b border-neutral-100">
              <h2 className="text-sm font-semibold text-neutral-800">Atualizações de desempenho recentes</h2>
              <button
                onClick={() => setDrawerOpen(false)}
                className="p-1.5 rounded hover:bg-neutral-100 transition-colors text-neutral-400 hover:text-neutral-600"
                aria-label="Fechar"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-6 py-2">
              <ul className="space-y-0">
                {data.pastUpdates.map((item) => {
                  const iconColor = item.sentiment === 'good' ? 'text-teal-500' : item.sentiment === 'bad' ? 'text-rose-500' : 'text-neutral-400';
                  const bgColor = item.sentiment === 'good' ? 'bg-teal-50' : item.sentiment === 'bad' ? 'bg-rose-50' : 'bg-neutral-50';
                  return (
                    <li key={item.id} className="flex items-start gap-3 py-3 border-b border-neutral-50 last:border-0">
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${bgColor}`}>
                        {item.sentiment === 'good' && (
                          <svg className={`w-3.5 h-3.5 ${iconColor}`} viewBox="0 0 24 24" fill="currentColor"><path fillRule="evenodd" clipRule="evenodd" d="M17 3a.5.5 0 000 1h2.207l-4.2 3.817A6.478 6.478 0 0011 6.02V4.5a.5.5 0 00-1 0v1.519A6.501 6.501 0 004.019 12H2.5a.5.5 0 000 1h1.519A6.501 6.501 0 0010 18.981V20.5a.5.5 0 001 0v-1.519A6.501 6.501 0 0016.981 13H18.5a.5.5 0 000-1h-1.519a6.467 6.467 0 00-1.308-3.436L20 4.63V7a.5.5 0 001 0V3h-4z" /></svg>
                        )}
                        {item.sentiment === 'bad' && (
                          <svg className={`w-3.5 h-3.5 ${iconColor}`} viewBox="0 0 24 24" fill="currentColor"><path fillRule="evenodd" clipRule="evenodd" d="M10 3.5a.5.5 0 011 0v1.519A6.501 6.501 0 0116.981 11H18.5a.5.5 0 010 1h-1.519a6.468 6.468 0 01-1.308 3.436L20 19.37V17a.5.5 0 011 0v4h-4a.5.5 0 010-1h2.207l-4.2-3.817A6.478 6.478 0 0111 17.98V19.5a.5.5 0 01-1 0v-1.519A6.501 6.501 0 014.019 12H2.5a.5.5 0 010-1h1.519A6.501 6.501 0 0110 5.019V3.5z" /></svg>
                        )}
                        {item.sentiment === 'neutral' && (
                          <svg className={`w-3.5 h-3.5 ${iconColor}`} viewBox="0 0 24 24" fill="currentColor"><path fillRule="evenodd" clipRule="evenodd" d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10zm-1-7h2V7h-2v8zm0 4h2v-2h-2v2z" /></svg>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-neutral-800 leading-5">{item.title}</p>
                        <p className="text-xs text-neutral-400 mt-0.5">{item.date}</p>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        </>
      )}

      {/* Detalhamento de Receitas e Despesas — Sankey */}
      <SankeySection data={data.incomeBreakdown} />

      {/* Histórico de ganhos e receitas */}
      <HistoricoGanhosSection data={data} />

      {expanded ? (
        <>
          {/* Análise de Fluxo de Caixa Livre vs. Lucros */}
          <FreeCashFlowSection data={data} />

          {/* Análise do crescimento dos lucros passados */}
          <PastEarningsGrowthSection data={data} />

          {/* Retorno sobre o Patrimônio Líquido */}
          <PastROESection data={data} />

          {/* Retorno sobre Ativos + Retorno sobre Capital Empregado */}
          <PastROAROCESection data={data} />

          <button
            onClick={() => setExpanded(false)}
            className="w-full flex items-center justify-center gap-2 py-3 text-sm font-medium text-neutral-500 hover:text-neutral-700 transition-colors"
          >
            <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
              <path d="M3 10L8 5L13 10" />
            </svg>
            Recolher análise
          </button>
        </>
      ) : (
        <button
          onClick={() => setExpanded(true)}
          className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl border-2 border-dashed border-neutral-200 text-sm font-medium text-neutral-500 hover:border-teal-400 hover:text-teal-600 transition-colors bg-white"
        >
          <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
            <path d="M3 6L8 11L13 6" />
          </svg>
          Aprofundar análise de performance
        </button>
      )}

    </div>
  );
}

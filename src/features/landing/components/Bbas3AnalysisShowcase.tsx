"use client";

/**
 * Bbas3AnalysisShowcase — high-resolution preview of the /analysis screen
 * using real data from the BBAS3 (Banco do Brasil) API response.
 *
 * Tabbed showcase rendered on the landing page, light-mode only.
 */

import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import {
  ArrowDownRight,
  ArrowUpRight,
  BarChart3,
  CalendarDays,
  CheckCircle2,
  Coins,
  DollarSign,
  ExternalLink,
  Gauge,
  Heart,
  Info,
  LineChart as LineChartIcon,
  Newspaper,
  Shield,
  Sparkles,
  TrendingDown,
  TrendingUp,
  TriangleAlert,
} from "lucide-react";

// ─── Data extracted from the real BBAS3 API response ─────────────────────────

const COMPANY = {
  ticker: "BBAS3",
  name: "Banco do Brasil S.A.",
  sector: "Financeiro e Outros",
  industry: "Intermediários Financeiros",
  exchange: "B3",
  marketCapLabel: "R$ 133,52 bi",
  logo: "https://s3-symbol-logo.tradingview.com/banco-do-brasil--big.svg",
  updatedAt: "05 abr 2026",
  summary:
    "Banco do Brasil segue com leitura mais equilibrada, com destaque em Dívida (Dívida Líquida R$ -19,74 bi). Proventos é o principal ponto de atenção, com payout de 40,2%, e pede acompanhamento nos próximos fechamentos para confirmar se a pressão é pontual ou persistente.",
};

const SNOWFLAKE = [
  { dimension: "value", label: "Valor", score: 2, normalized: 33, summary: "Valuation misto — P/VP 0,7x abaixo da indústria (1,9x)." },
  { dimension: "future", label: "Futuro", score: 2, normalized: 33, summary: "Receita projetada +26,2% a.a., lucro -4,0%." },
  { dimension: "past", label: "Passado", score: 0, normalized: 0, summary: "Lucro caiu -42,5% no último ciclo, margem 5,3%." },
  { dimension: "health", label: "Saúde", score: 1, normalized: 17, summary: "Liquidez curto prazo OK; dívida longa elevada." },
  { dimension: "dividend", label: "Dividendos", score: 2, normalized: 33, summary: "Yield 1,18%, payout 40,2%, CAGR 5a -8,8%." },
];

const PRICE = {
  current: 23.39,
  fairValue: 16.86,
  discountPercent: -38.8, // price is above fair value (premium)
  peRatio: 8.0,
  peIndustry: 9.3,
  peMarket: 9.8,
  pbRatio: 0.7,
  pbIndustry: 1.9,
  return1y: -13.0,
  return5y: -15.2,
  marketReturn1y: 54.8,
};

const DIVIDEND = {
  currentYield: 1.18,
  marketYield: 4.5,
  payout: 40.2,
  futureYield: 4.61,
  growthCagr: -8.8,
  yearsWithoutInterruption: 5,
  dps: 1.1829,
  series: [
    { year: "2021", value: 1.71 },
    { year: "2022", value: 2.31 },
    { year: "2023", value: 2.42 },
    { year: "2024", value: 3.2 },
    { year: "2025", value: 1.18 },
  ],
  vsEarnings: [
    { year: "2021", div: 1.71, eps: 3.46 },
    { year: "2022", div: 2.31, eps: 5.23 },
    { year: "2023", div: 2.42, eps: 5.81 },
    { year: "2024", div: 3.2, eps: 5.11 },
    { year: "2025", div: 1.18, eps: 2.94 },
  ],
  news: [
    { date: "02 mar 2026", title: "Banco do Brasil (BBAS3) atualiza valor de JCPs; veja o que muda" },
    { date: "19 fev 2026", title: "Banco do Brasil aprova distribuição de R$ 400,4 mi em JCP" },
    { date: "19 jan 2026", title: "BBAS3 aprova payout de 30% para 2026 e define calendário" },
  ],
};

const HEALTH = {
  cash: "R$ 19,74 bi",
  equity: "R$ 193,57 bi",
  netDebt: "R$ -19,74 bi",
  shortAssets: "R$ 59,64 bi",
  shortLiab: "R$ 4,47 bi",
  longLiab: "R$ 2,15 tri",
  checks: [
    { label: "Liquidez curto prazo", passed: true, detail: "Ativo Circulante > Passivo Circulante (R$ 59,64 bi vs R$ 4,47 bi)." },
    { label: "Cobertura de dívida", passed: true, detail: "Dívida líquida negativa, posição de caixa confortável." },
    { label: "Liquidez longo prazo", passed: false, detail: "Passivo Não Circulante elevado frente ao Circulante." },
    { label: "Cobertura de juros", passed: false, detail: "EBIT / Despesa Financeira não identificados." },
  ],
};

const FUTURE = {
  epsGrowth: -4.0,
  revenueGrowth: 26.2,
  marketEpsGrowth: 12.0,
  marketRevGrowth: 6.9,
  futureRoe: 8.9,
  industryRoe: 8.7,
  earningsRevenue: [
    { year: "2022", revenue: 236.55, earnings: 29.85, type: "historical" as const },
    { year: "2023", revenue: 265.44, earnings: 33.17, type: "historical" as const },
    { year: "2024", revenue: 273.5, earnings: 29.17, type: "historical" as const },
    { year: "2025", revenue: 319.46, earnings: 16.78, type: "historical" as const },
    { year: "2026", revenue: 353.12, earnings: 13.85, type: "forecast" as const },
    { year: "2027", revenue: 390.32, earnings: 11.43, type: "forecast" as const },
    { year: "2028", revenue: 431.44, earnings: 9.44, type: "forecast" as const },
  ],
};

const MARKET_CYCLE = {
  phaseLabel: "Reflação",
  sectorLabel: "Favorecido",
  sector: "Financeiro e Outros",
  description:
    "O Brasil está em fase de Reflação. A economia está fraca, mas a inflação cede, abrindo espaço para cortes de juros. O Financeiro se fortalece com a expectativa de reaceleração do crédito.",
  selic: "14,75%",
  ipca: "3,81%",
};

const REWARDS_RISKS = [
  {
    type: "reward" as const,
    title: "Dívida líquida negativa",
    detail: "R$ -19,74 bi no último fechamento — menor pressão de capital no momento.",
  },
  {
    type: "risk" as const,
    title: "Payout elevado",
    detail: "40,2% no último fechamento — reduz espaço para retenção e reinvestimento.",
  },
];

// ─── Shared UI helpers ───────────────────────────────────────────────────────

const TABS = [
  { id: "overview", label: "Resumo", icon: Gauge },
  { id: "dividend", label: "Dividendos", icon: Coins },
  { id: "health", label: "Saúde", icon: Heart },
  { id: "future", label: "Futuro", icon: TrendingUp },
  { id: "value", label: "Valor", icon: DollarSign },
] as const;

type TabId = (typeof TABS)[number]["id"];

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

// ─── Snowflake dark radar (matches analysis screen "Visão geral dos pilares") ─

function SnowflakeDarkRadar() {
  const cx0 = 140;
  const cy0 = 140;
  const radius = 84;
  // Order matches the analysis screen: Valor (top), Futuro (right),
  // Saúde (bottom-right), Dividendos (bottom-left), Passado (left).
  const items: { label: string; key: (typeof SNOWFLAKE)[number]["dimension"] }[] = [
    { label: "VALOR", key: "value" },
    { label: "FUTURO", key: "future" },
    { label: "SAÚDE", key: "health" },
    { label: "DIVIDENDOS", key: "dividend" },
    { label: "PASSADO", key: "past" },
  ];
  const byKey = Object.fromEntries(SNOWFLAKE.map((s) => [s.dimension, s]));

  const points = items.map((_, i) => {
    const angle = (Math.PI * 2 * i) / items.length - Math.PI / 2;
    return { x: cx0 + Math.cos(angle) * radius, y: cy0 + Math.sin(angle) * radius };
  });

  const filled = items.map((it, i) => {
    const v = (byKey[it.key]?.normalized ?? 0) / 100;
    const vv = Math.max(v, 0.14); // small floor so the shape is always visible
    const angle = (Math.PI * 2 * i) / items.length - Math.PI / 2;
    return { x: cx0 + Math.cos(angle) * radius * vv, y: cy0 + Math.sin(angle) * radius * vv };
  });

  return (
    <svg viewBox="0 0 280 300" className="h-full w-full">
      <defs>
        <radialGradient id="snow-bg" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#f1fcf9" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#f1fcf9" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="snow-fill" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#0f9f8f" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#0f9f8f" stopOpacity="0.18" />
        </radialGradient>
      </defs>

      {/* soft radial glow */}
      <circle cx={cx0} cy={cy0} r={radius + 18} fill="url(#snow-bg)" />

      {/* concentric circles */}
      {[0.25, 0.5, 0.75, 1].map((level) => (
        <circle
          key={level}
          cx={cx0}
          cy={cy0}
          r={radius * level}
          fill="none"
          stroke="#e4ebeb"
          strokeWidth="1"
        />
      ))}

      {/* filled polygon */}
      <polygon
        points={filled.map((p) => `${p.x},${p.y}`).join(" ")}
        fill="url(#snow-fill)"
        stroke="#0f9f8f"
        strokeWidth="1.75"
        strokeLinejoin="round"
      />
      {filled.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r={3.5} fill="#0f9f8f" />
      ))}

      {/* labels */}
      {points.map((p, i) => {
        const dx = p.x - cx0;
        const dy = p.y - cy0;
        const len = Math.sqrt(dx * dx + dy * dy);
        const lx = cx0 + (dx / len) * (radius + 26);
        const ly = cy0 + (dy / len) * (radius + 26);
        return (
          <text
            key={i}
            x={lx}
            y={ly}
            textAnchor="middle"
            dominantBaseline="central"
            fontSize="10"
            fontWeight={700}
            fill="#5d6a66"
            letterSpacing="0.8"
          >
            {items[i].label}
          </text>
        );
      })}
    </svg>
  );
}

// ─── Overview tab ────────────────────────────────────────────────────────────

function OverviewScreen() {
  return (
    <div className="flex h-full flex-col gap-5 p-6">
      {/* Linha 1: Síntese + KPIs  ↔  Pilares */}
      <div className="grid gap-5 md:grid-cols-[1.15fr_0.85fr] md:items-stretch">
        <div className="flex flex-col gap-4">
          <div className="rounded-2xl border border-[#eceff0] bg-[#fbfcfb] p-5">
            <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#7b8683]">
              <Sparkles className="h-3.5 w-3.5 text-[#0f9f8f]" />
              Síntese
            </div>
            <p className="mt-3 text-[14px] leading-6 text-[#23302d]">{COMPANY.summary}</p>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            {[
              { label: "Preço", value: `R$ ${PRICE.current.toFixed(2).replace(".", ",")}`, trend: `${PRICE.return1y}% 1a`, down: true },
              { label: "P/L", value: `${PRICE.peRatio.toFixed(1).replace(".", ",")}x`, trend: `setor ${PRICE.peIndustry}x`, down: false },
              { label: "Valor justo", value: `R$ ${PRICE.fairValue.toFixed(2).replace(".", ",")}`, trend: `${PRICE.discountPercent}%`, down: true },
            ].map((k) => (
              <div key={k.label} className="rounded-2xl border border-[#eceff0] bg-card p-4">
                <div className="text-[11px] font-medium text-[#85918d]">{k.label}</div>
                <div className="mt-1 text-[20px] font-semibold text-[#18202f]">{k.value}</div>
                <div className={cx("mt-1 flex items-center gap-1 text-[11px] font-medium", k.down ? "text-[#c23a3a]" : "text-[#4b5563]")}>
                  {k.down ? <ArrowDownRight className="h-3 w-3" /> : <ArrowUpRight className="h-3 w-3" />}
                  {k.trend}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex h-full min-h-0 flex-col rounded-2xl border border-[#eceff0] bg-card p-4">
          <div className="text-[12px] font-semibold text-[#18202f]">Visão geral dos pilares</div>
          <div className="mt-1 flex min-h-0 flex-1 items-center justify-center">
            <SnowflakeDarkRadar />
          </div>
        </div>
      </div>

      {/* Linha 2: Rewards/Risks  ↔  Ciclo de mercado */}
      <div className="grid flex-1 gap-5 md:grid-cols-[1.15fr_0.85fr] md:items-stretch">
        <div className="flex flex-col gap-2.5">
          {REWARDS_RISKS.map((item) => (
            <div
              key={item.title}
              className={cx(
                "flex flex-1 items-start gap-3 rounded-2xl border p-4",
                item.type === "reward" ? "border-[#cdefe8] bg-[#f1fcf9]" : "border-[#f6dea9] bg-[#fffbeb]",
              )}
            >
              <div
                className={cx(
                  "flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
                  item.type === "reward" ? "bg-[#0f9f8f] text-white" : "bg-[#d97706] text-white",
                )}
              >
                {item.type === "reward" ? <CheckCircle2 className="h-4 w-4" /> : <TriangleAlert className="h-4 w-4" />}
              </div>
              <div>
                <div className="text-[13px] font-semibold text-[#18202f]">{item.title}</div>
                <div className="mt-0.5 text-[12px] leading-5 text-[#5f6b68]">{item.detail}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="flex h-full flex-col rounded-2xl border border-[#dbe7f2] bg-gradient-to-br from-[#eff6ff] to-[#f7faff] p-5">
          <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#3c6ba7]">
            <BarChart3 className="h-3.5 w-3.5" />
            Ciclo de mercado
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <div className="text-[18px] font-bold text-[#1b2421]">{MARKET_CYCLE.phaseLabel}</div>
            <div className="rounded-full border border-[#cdefe8] bg-[#f1fcf9] px-2 py-0.5 text-[10px] font-semibold text-[#0f9f8f]">
              Setor {MARKET_CYCLE.sectorLabel}
            </div>
          </div>
          <div className="mt-2 text-[11px] leading-5 text-[#4a5568]">{MARKET_CYCLE.description}</div>
          <div className="mt-auto flex items-center gap-3 pt-3 text-[11px] text-[#4a5568]">
            <span className="rounded-full bg-card px-2 py-0.5 font-semibold">Selic {MARKET_CYCLE.selic}</span>
            <span className="rounded-full bg-card px-2 py-0.5 font-semibold">IPCA {MARKET_CYCLE.ipca}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Dividend tab ────────────────────────────────────────────────────────────

function DividendScreen() {
  const maxDps = Math.max(...DIVIDEND.series.map((d) => d.value));
  const maxEps = Math.max(...DIVIDEND.vsEarnings.map((d) => d.eps));

  return (
    <div className="grid h-full gap-5 p-6 md:grid-cols-[1.1fr_0.9fr] md:items-stretch">
      <div className="flex h-full flex-col gap-4">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { label: "Yield atual", value: `${DIVIDEND.currentYield}%`, hint: "mercado 4,5%" },
            { label: "Payout", value: `${DIVIDEND.payout}%`, hint: "OK" },
            { label: "DPA 2025", value: `R$ ${DIVIDEND.dps.toFixed(2).replace(".", ",")}`, hint: "anual" },
            { label: "CAGR 5a", value: `${DIVIDEND.growthCagr}%`, hint: "queda" },
          ].map((k) => (
            <div key={k.label} className="rounded-2xl border border-[#eceff0] bg-card p-3">
              <div className="text-[10px] font-medium text-[#85918d]">{k.label}</div>
              <div className="mt-1 text-[18px] font-bold text-[#18202f]">{k.value}</div>
              <div className="text-[10px] text-[#9aa5a2]">{k.hint}</div>
            </div>
          ))}
        </div>

        <div className="flex flex-1 flex-col rounded-2xl border border-[#eceff0] bg-card p-5">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#7b8683]">
                Dividendo por ação
              </div>
              <div className="text-[16px] font-bold text-[#18202f]">Últimos 5 anos (R$)</div>
            </div>
            <div className="flex items-center gap-1 text-[11px] font-semibold text-[#c23a3a]">
              <TrendingDown className="h-3.5 w-3.5" />
              {DIVIDEND.growthCagr}% CAGR
            </div>
          </div>
          <div className="mt-5 flex h-[160px] flex-1 items-end gap-3">
            {DIVIDEND.series.map((d) => {
              const h = (d.value / maxDps) * 100;
              const isLast = d.year === "2025";
              return (
                <div key={d.year} className="flex flex-1 flex-col items-center gap-2">
                  <div className="flex h-[120px] w-full items-end">
                    <div
                      className="relative w-full rounded-t-lg"
                      style={{
                        height: `${h}%`,
                        background: isLast
                          ? "linear-gradient(180deg, #0f9f8f 0%, #0a7a6e 100%)"
                          : "linear-gradient(180deg, #a7ebe1 0%, #7dd8ca 100%)",
                      }}
                    >
                      <div
                        className={cx(
                          "absolute -top-5 left-1/2 -translate-x-1/2 text-[11px] font-bold",
                          isLast ? "text-[#0f9f8f]" : "text-[#4b5563]",
                        )}
                      >
                        {d.value.toFixed(2).replace(".", ",")}
                      </div>
                    </div>
                  </div>
                  <div className="text-[10px] font-medium text-[#85918d]">{d.year}</div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="rounded-2xl border border-[#eceff0] bg-card p-5">
          <div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#7b8683]">
            Dividendos vs Lucro por ação
          </div>
          <div className="mt-3 space-y-2.5">
            {DIVIDEND.vsEarnings.map((row) => (
              <div key={row.year} className="grid grid-cols-[44px_1fr_50px] items-center gap-3">
                <span className="text-[10px] font-medium text-[#85918d]">{row.year}</span>
                <div className="relative h-5 rounded-full bg-[#f3f5f6]">
                  <div
                    className="absolute inset-y-0 left-0 rounded-full bg-[#cbe9e3]"
                    style={{ width: `${(row.eps / maxEps) * 100}%` }}
                  />
                  <div
                    className="absolute inset-y-0 left-0 rounded-full bg-[#0f9f8f]"
                    style={{ width: `${(row.div / maxEps) * 100}%` }}
                  />
                </div>
                <span className="text-right text-[10px] font-semibold text-[#18202f]">
                  {((row.div / row.eps) * 100).toFixed(0)}%
                </span>
              </div>
            ))}
          </div>
          <div className="mt-3 flex items-center gap-4 text-[10px] text-[#85918d]">
            <span className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-[#0f9f8f]" /> Dividendo
            </span>
            <span className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-[#cbe9e3]" /> Lucro
            </span>
          </div>
        </div>
      </div>

      <div className="flex h-full flex-col rounded-2xl border border-[#eceff0] bg-card p-5">
        <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#7b8683]">
          <Newspaper className="h-3.5 w-3.5 text-[#0f9f8f]" />
          Atualizações recentes
        </div>
        <div className="mt-4 space-y-3">
          {DIVIDEND.news.map((n) => (
            <div key={n.title} className="rounded-xl border border-[#eceff0] bg-[#fbfcfb] p-3">
              <div className="flex items-center gap-2 text-[10px] font-medium text-[#85918d]">
                <CalendarDays className="h-3 w-3" />
                {n.date}
              </div>
              <div className="mt-1 text-[12px] font-medium leading-5 text-[#18202f]">{n.title}</div>
              <div className="mt-1.5 inline-flex items-center gap-1 text-[10px] font-semibold text-[#0f9f8f]">
                Ler nota <ExternalLink className="h-3 w-3" />
              </div>
            </div>
          ))}
        </div>

        <div className="mt-auto rounded-xl border border-[#cdefe8] bg-[#f1fcf9] p-4">
          <div className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#0f9f8f]">
            Política
          </div>
          <div className="mt-1 text-[12px] leading-5 text-[#23302d]">
            {DIVIDEND.yearsWithoutInterruption} anos sem interrupção. Yield projetado próximo dos {DIVIDEND.futureYield}%.
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Health tab ──────────────────────────────────────────────────────────────

function HealthScreen() {
  return (
    <div className="grid h-full gap-5 p-6 md:grid-cols-[0.9fr_1.1fr] md:items-stretch">
      <div className="flex h-full flex-col gap-4">
        <div className="rounded-2xl border border-[#cdefe8] bg-gradient-to-br from-[#f1fcf9] to-[#fbfcfb] p-5">
          <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#0f9f8f]">
            <Shield className="h-3.5 w-3.5" />
            Posição financeira
          </div>
          <div className="mt-3 text-[13px] text-[#5f6b68]">Dívida líquida</div>
          <div className="mt-1 text-[28px] font-bold text-[#0f9f8f]">{HEALTH.netDebt}</div>
          <div className="mt-2 text-[11px] text-[#5f6b68]">Caixa {HEALTH.cash} · PL {HEALTH.equity}</div>
        </div>

        <div className="flex flex-1 flex-col rounded-2xl border border-[#eceff0] bg-card p-5">
          <div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#7b8683]">Liquidez</div>
          <div className="mt-3 space-y-3">
            <div>
              <div className="flex items-center justify-between text-[11px]">
                <span className="font-medium text-[#5f6b68]">Ativo Circulante</span>
                <span className="font-bold text-[#18202f]">{HEALTH.shortAssets}</span>
              </div>
              <div className="mt-1 h-2 rounded-full bg-[#f3f5f6]">
                <div className="h-full w-[96%] rounded-full bg-[#0f9f8f]" />
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between text-[11px]">
                <span className="font-medium text-[#5f6b68]">Passivo Circulante</span>
                <span className="font-bold text-[#18202f]">{HEALTH.shortLiab}</span>
              </div>
              <div className="mt-1 h-2 rounded-full bg-[#f3f5f6]">
                <div className="h-full w-[8%] rounded-full bg-[#d97706]" />
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between text-[11px]">
                <span className="font-medium text-[#5f6b68]">Passivo Longo Prazo</span>
                <span className="font-bold text-[#18202f]">{HEALTH.longLiab}</span>
              </div>
              <div className="mt-1 h-2 rounded-full bg-[#f3f5f6]">
                <div className="h-full w-full rounded-full bg-[#c23a3a]" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex h-full flex-col rounded-2xl border border-[#eceff0] bg-card p-5">
        <div className="flex items-center justify-between">
          <div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#7b8683]">
            Checagens de saúde
          </div>
          <div className="rounded-full border border-[#f6dea9] bg-[#fffbeb] px-2.5 py-0.5 text-[10px] font-semibold text-[#b45309]">
            2 atenção
          </div>
        </div>
        <div className="mt-4 flex flex-1 flex-col gap-2.5">
          {HEALTH.checks.map((check) => (
            <div
              key={check.label}
              className={cx(
                "flex flex-1 items-start gap-3 rounded-xl border p-3",
                check.passed ? "border-[#cdefe8] bg-[#f1fcf9]" : "border-[#f6dea9] bg-[#fffbeb]",
              )}
            >
              <div
                className={cx(
                  "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full",
                  check.passed ? "bg-[#0f9f8f] text-white" : "bg-[#d97706] text-white",
                )}
              >
                {check.passed ? <CheckCircle2 className="h-3 w-3" /> : <Info className="h-3 w-3" />}
              </div>
              <div>
                <div className="text-[12px] font-semibold text-[#18202f]">{check.label}</div>
                <div className="mt-0.5 text-[11px] leading-5 text-[#5f6b68]">{check.detail}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Future tab ──────────────────────────────────────────────────────────────

function FutureScreen() {
  const maxRev = Math.max(...FUTURE.earningsRevenue.map((d) => d.revenue));

  return (
    <div className="grid h-full gap-5 p-6 md:grid-cols-[1.1fr_0.9fr] md:items-stretch">
      <div className="flex h-full flex-col rounded-2xl border border-[#eceff0] bg-card p-5">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#7b8683]">
              Receita & lucro projetados
            </div>
            <div className="text-[15px] font-bold text-[#18202f]">Histórico e projeções (R$ bi)</div>
          </div>
          <div className="flex items-center gap-3 text-[10px]">
            <span className="flex items-center gap-1 text-[#5f6b68]">
              <span className="h-2 w-2 rounded-full bg-[#0f9f8f]" /> Receita
            </span>
            <span className="flex items-center gap-1 text-[#5f6b68]">
              <span className="h-2 w-2 rounded-full bg-[#6ea8ff]" /> Lucro
            </span>
          </div>
        </div>

        <div className="mt-5 flex h-[200px] flex-1 items-end gap-2">
          {FUTURE.earningsRevenue.map((d) => {
            const revH = (d.revenue / maxRev) * 100;
            const earnH = (d.earnings / maxRev) * 100;
            const isForecast = d.type === "forecast";
            return (
              <div key={d.year} className="flex flex-1 flex-col items-center gap-1.5">
                <div className="relative flex h-[160px] w-full items-end justify-center gap-0.5">
                  <div
                    className={cx("w-[48%] rounded-t", isForecast && "opacity-60")}
                    style={{
                      height: `${revH}%`,
                      background: "linear-gradient(180deg, #0f9f8f 0%, #0a7a6e 100%)",
                      borderTopLeftRadius: isForecast ? 0 : undefined,
                      borderStyle: isForecast ? "dashed" : "none",
                      borderWidth: isForecast ? 1 : 0,
                      borderColor: isForecast ? "#0f9f8f" : "transparent",
                    }}
                  />
                  <div
                    className={cx("w-[48%] rounded-t", isForecast && "opacity-60")}
                    style={{
                      height: `${earnH}%`,
                      background: "linear-gradient(180deg, #6ea8ff 0%, #497dd6 100%)",
                    }}
                  />
                </div>
                <div className={cx("text-[10px] font-medium", isForecast ? "text-[#9aa5a2]" : "text-[#18202f]")}>
                  {d.year}
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3">
          <div className="rounded-xl border border-[#cdefe8] bg-[#f1fcf9] p-3">
            <div className="text-[10px] font-medium text-[#5f6b68]">Crescimento receita</div>
            <div className="mt-0.5 flex items-center gap-1 text-[16px] font-bold text-[#0f9f8f]">
              <TrendingUp className="h-4 w-4" />+{FUTURE.revenueGrowth}%
            </div>
            <div className="text-[10px] text-[#5f6b68]">vs mercado {FUTURE.marketRevGrowth}%</div>
          </div>
          <div className="rounded-xl border border-[#f6dea9] bg-[#fffbeb] p-3">
            <div className="text-[10px] font-medium text-[#5f6b68]">Crescimento lucro</div>
            <div className="mt-0.5 flex items-center gap-1 text-[16px] font-bold text-[#b45309]">
              <TrendingDown className="h-4 w-4" />
              {FUTURE.epsGrowth}%
            </div>
            <div className="text-[10px] text-[#5f6b68]">vs mercado {FUTURE.marketEpsGrowth}%</div>
          </div>
        </div>
      </div>

      <div className="flex h-full flex-col gap-4">
        <div className="rounded-2xl border border-[#eceff0] bg-card p-5">
          <div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#7b8683]">ROE futuro</div>
          <div className="mt-3 flex items-end gap-4">
            <div>
              <div className="text-[11px] text-[#5f6b68]">Empresa</div>
              <div className="text-[28px] font-bold text-[#18202f]">{FUTURE.futureRoe}%</div>
            </div>
            <div className="h-12 w-px bg-[#eceff0]" />
            <div>
              <div className="text-[11px] text-[#5f6b68]">Indústria</div>
              <div className="text-[22px] font-semibold text-[#5f6b68]">{FUTURE.industryRoe}%</div>
            </div>
          </div>
          <div className="mt-4 h-2 rounded-full bg-[#f3f5f6]">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[#6ea8ff] to-[#0f9f8f]"
              style={{ width: `${(FUTURE.futureRoe / 20) * 100}%` }}
            />
          </div>
          <div className="mt-1 flex justify-between text-[9px] text-[#9aa5a2]">
            <span>0%</span>
            <span>Alvo 20%</span>
          </div>
        </div>

        <div className="flex flex-1 flex-col rounded-2xl border border-[#dbe7f2] bg-gradient-to-br from-[#eff6ff] to-[#f7faff] p-5">
          <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#3c6ba7]">
            <LineChartIcon className="h-3.5 w-3.5" />
            Leitura do futuro
          </div>
          <p className="mt-2 text-[12px] leading-5 text-[#23302d]">
            Receita acelera acima do mercado, mas o lucro ainda recua sob pressão de provisões no agro. A inflexão de rentabilidade é o principal vetor a monitorar nos próximos trimestres.
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── Value tab ───────────────────────────────────────────────────────────────

function ValueScreen() {
  return (
    <div className="grid h-full gap-5 p-6 md:grid-cols-[1fr_1fr] md:items-stretch">
      <div className="flex h-full flex-col rounded-2xl border border-[#eceff0] bg-card p-5">
        <div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#7b8683]">
          Preço vs Valor justo (DCF)
        </div>
        <div className="mt-4 flex items-end justify-between gap-4">
          <div>
            <div className="text-[11px] text-[#5f6b68]">Preço atual</div>
            <div className="text-[26px] font-bold text-[#18202f]">R$ {PRICE.current.toFixed(2).replace(".", ",")}</div>
          </div>
          <div className="text-right">
            <div className="text-[11px] text-[#5f6b68]">Valor justo</div>
            <div className="text-[26px] font-bold text-[#0f9f8f]">R$ {PRICE.fairValue.toFixed(2).replace(".", ",")}</div>
          </div>
        </div>

        <div className="relative mt-6 h-3 rounded-full bg-[#f3f5f6]">
          <div className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-[#0f9f8f] to-[#cbe9e3]" style={{ width: "42%" }} />
          <div className="absolute -top-1 h-5 w-1 rounded-full bg-[#0f9f8f]" style={{ left: "42%" }} />
          <div className="absolute -top-1 h-5 w-1 rounded-full bg-[#c23a3a]" style={{ left: "70%" }} />
        </div>
        <div className="mt-2 flex justify-between text-[10px] text-[#85918d]">
          <span>Justo (R$ 16,86)</span>
          <span>Atual (R$ 23,39)</span>
        </div>

        <div className="mt-auto rounded-xl border border-[#fde1e1] bg-[#fef4f4] p-4">
          <div className="flex items-center gap-2 text-[11px] font-semibold text-[#c23a3a]">
            <TriangleAlert className="h-3.5 w-3.5" />
            Premium de 38,8% sobre o valor justo
          </div>
          <div className="mt-1 text-[11px] leading-5 text-[#5f6b68]">
            Modelo: DCF · Preço está acima do valor intrínseco estimado.
          </div>
        </div>
      </div>

      <div className="flex h-full flex-col gap-4">
        <div className="flex flex-1 flex-col rounded-2xl border border-[#eceff0] bg-card p-5">
          <div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#7b8683]">
            Múltiplos relativos
          </div>
          <div className="mt-4 space-y-4">
            {[
              { label: "P/L", value: PRICE.peRatio, market: PRICE.peMarket, industry: PRICE.peIndustry, suffix: "x" },
              { label: "P/VP", value: PRICE.pbRatio, market: null, industry: PRICE.pbIndustry, suffix: "x" },
            ].map((m) => (
              <div key={m.label}>
                <div className="flex items-baseline justify-between">
                  <span className="text-[12px] font-semibold text-[#18202f]">{m.label}</span>
                  <span className="text-[16px] font-bold text-[#0f9f8f]">
                    {m.value.toFixed(1).replace(".", ",")}
                    {m.suffix}
                  </span>
                </div>
                <div className="mt-2 flex items-center gap-3 text-[10px] text-[#5f6b68]">
                  <span>
                    Indústria <b className="text-[#18202f]">{m.industry}{m.suffix}</b>
                  </span>
                  {m.market !== null && (
                    <span>
                      Mercado <b className="text-[#18202f]">{m.market}{m.suffix}</b>
                    </span>
                  )}
                </div>
                <div className="relative mt-2 h-1.5 rounded-full bg-[#f3f5f6]">
                  <div
                    className="absolute inset-y-0 left-0 rounded-full bg-[#0f9f8f]"
                    style={{ width: `${(m.value / (m.industry * 1.5)) * 100}%` }}
                  />
                  <div
                    className="absolute -top-0.5 h-2.5 w-0.5 bg-[#5f6b68]"
                    style={{ left: `${(m.industry / (m.industry * 1.5)) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-[#eceff0] bg-card p-5">
          <div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#7b8683]">
            Retorno da ação
          </div>
          <div className="mt-3 grid grid-cols-3 gap-3">
            <div>
              <div className="text-[10px] text-[#85918d]">1 ano</div>
              <div className="text-[16px] font-bold text-[#c23a3a]">{PRICE.return1y}%</div>
            </div>
            <div>
              <div className="text-[10px] text-[#85918d]">5 anos</div>
              <div className="text-[16px] font-bold text-[#c23a3a]">{PRICE.return5y}%</div>
            </div>
            <div>
              <div className="text-[10px] text-[#85918d]">Ibov 1a</div>
              <div className="text-[16px] font-bold text-[#0f9f8f]">+{PRICE.marketReturn1y}%</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Screen switcher ─────────────────────────────────────────────────────────

function ScreenByTab({ tab }: { tab: TabId }) {
  if (tab === "overview") return <OverviewScreen />;
  if (tab === "dividend") return <DividendScreen />;
  if (tab === "health") return <HealthScreen />;
  if (tab === "future") return <FutureScreen />;
  return <ValueScreen />;
}

// ─── Main showcase ───────────────────────────────────────────────────────────

export function Bbas3AnalysisShowcase() {
  const [active, setActive] = useState<TabId>("overview");
  const [isHovered, setIsHovered] = useState(false);
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    if (shouldReduceMotion || isHovered) return;
    const interval = window.setInterval(() => {
      setActive((current) => {
        const idx = TABS.findIndex((t) => t.id === current);
        return TABS[(idx + 1) % TABS.length].id;
      });
    }, 5200);
    return () => window.clearInterval(interval);
  }, [isHovered, shouldReduceMotion]);

  return (
    <section className="px-20 pb-16 pt-8 max-lg:px-10 max-md:px-6 max-sm:px-4">
      <div className="mx-auto max-w-[1430px]">
        <div className="flex flex-col items-center gap-6">
          <span className="rounded-full border border-[#d8eee9] bg-[#f1fcf9] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#0f9f8f]">
            Preview com dados reais · BBAS3
          </span>

          <h2 className="max-w-[780px] text-center text-[40px] font-semibold leading-[44px] tracking-[-0.4px] text-[#1b2421] max-sm:text-[28px] max-sm:leading-[32px]">
            A tela de análise, com os números reais do Banco do Brasil.
          </h2>

          <p className="max-w-[620px] text-center text-lg leading-6 text-primary-gray-500 max-md:text-base max-md:leading-5">
            Navegue pelas abas da análise carregadas com a última chamada real: preço, dividendos, saúde, projeções e valor justo.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
            {TABS.map((tab) => {
              const isActive = tab.id === active;
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActive(tab.id)}
                  className={cx(
                    "inline-flex items-center gap-1.5 rounded-full border px-4 py-2 text-[13px] font-semibold transition-all duration-300",
                    isActive
                      ? "border-[#caefe6] bg-[#e7fbf7] text-[#0f9f8f] shadow-[0_8px_24px_-16px_rgba(15,159,143,0.3)]"
                      : "border-[#e8eceb] bg-white text-[#65716d]",
                  )}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        <motion.div
          className="relative mx-auto mt-10 max-w-[1160px]"
          onHoverStart={() => setIsHovered(true)}
          onHoverEnd={() => setIsHovered(false)}
        >
          <div
            className="pointer-events-none absolute inset-x-16 top-0 h-[320px] rounded-[48px] blur-3xl"
            style={{
              background:
                "radial-gradient(circle at 50% 10%, rgba(15,159,143,0.16) 0%, rgba(15,159,143,0.05) 36%, rgba(255,255,255,0) 72%)",
            }}
          />

          <div className="relative overflow-hidden rounded-[28px] border border-[#e5eceb] bg-white shadow-[0_40px_100px_rgba(16,24,40,0.09)]">
            {/* Browser-like chrome */}
            <div className="flex items-center gap-2 border-b border-[#eceff0] bg-[#fbfcfb] px-5 py-3">
              <div className="flex gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
                <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
                <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
              </div>
              <div className="ml-3 flex-1 truncate rounded-md border border-[#eceff0] bg-white px-3 py-1 text-[11px] text-[#85918d]">
                analiso.com.br/analysis/BBAS3
              </div>
            </div>

            {/* Company header */}
            <div className="border-b border-[#eceff0] bg-white px-6 py-5">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-2xl border border-[#eceff0] bg-[#fbfcfb]">
                    <img src={COMPANY.logo} alt={COMPANY.name} className="h-10 w-10 object-contain" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-[20px] font-bold text-[#18202f]">{COMPANY.name}</h3>
                      <span className="rounded-full border border-[#eceff0] bg-[#fbfcfb] px-2 py-0.5 text-[10px] font-semibold text-[#5d6a66]">
                        {COMPANY.ticker}
                      </span>
                    </div>
                    <div className="mt-0.5 text-[12px] text-[#85918d]">
                      {COMPANY.sector} · {COMPANY.exchange} · Atualizado em {COMPANY.updatedAt}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <div className="text-[10px] uppercase tracking-wide text-[#85918d]">Market Cap</div>
                    <div className="text-[14px] font-bold text-[#18202f]">{COMPANY.marketCapLabel}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] uppercase tracking-wide text-[#85918d]">Preço</div>
                    <div className="text-[14px] font-bold text-[#18202f]">
                      R$ {PRICE.current.toFixed(2).replace(".", ",")}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Tab strip inside the "browser" */}
            <div className="flex items-center gap-0 overflow-x-auto border-b border-[#eceff0] bg-white px-6">
              {TABS.map((tab) => {
                const Icon = tab.icon;
                const isActive = tab.id === active;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActive(tab.id)}
                    className={cx(
                      "flex flex-shrink-0 items-center gap-1.5 border-b-2 px-4 py-3.5 text-[13px] font-medium transition-all duration-150",
                      isActive ? "border-[#0f9f8f] text-[#18202f]" : "border-transparent text-[#8494a9]",
                    )}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    {tab.label}
                  </button>
                );
              })}
            </div>

            {/* Content — todas as 5 telas empilhadas no mesmo grid cell, então o
                container adota a altura da maior e nunca pula ao trocar de tab. */}
            <div className="relative grid bg-[#fafcfc] [&>*]:[grid-area:1/1]">
              {TABS.map((tab) => {
                const isActive = tab.id === active;
                return (
                  <motion.div
                    key={tab.id}
                    initial={false}
                    animate={
                      shouldReduceMotion
                        ? { opacity: isActive ? 1 : 0 }
                        : { opacity: isActive ? 1 : 0, y: isActive ? 0 : 8 }
                    }
                    transition={{ duration: 0.35, ease: "easeOut" }}
                    className={cx(
                      "min-w-0 h-full",
                      isActive ? "pointer-events-auto" : "pointer-events-none",
                    )}
                    aria-hidden={!isActive}
                  >
                    <ScreenByTab tab={tab.id} />
                  </motion.div>
                );
              })}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

"use client";

/**
 * Bbas3SankeyDark — dark-themed Sankey mock ("De onde vem o dinheiro
 * e para onde vai?") injected inside the DarkCapabilities section of the
 * landing page. Data mirrors the reference chart from the product.
 */

import { useState } from "react";

// ─── Data ────────────────────────────────────────────────────────────────────

type YearKey = "2022" | "2023" | "2024" | "2025";

type FlowData = {
  revenue: number;
  grossProfit: number;
  cogs: number;
  ebit: number;
  opex: number;
  netIncome: number;
  finTax: number;
};

const YEAR_DATA: Record<YearKey, FlowData> = {
  2022: { revenue: 188.4, grossProfit: 62.1, cogs: 126.3, ebit: 28.2, opex: 33.9, netIncome: 11.9, finTax: 16.3 },
  2023: { revenue: 199.7, grossProfit: 68.4, cogs: 131.3, ebit: 30.1, opex: 38.3, netIncome: 12.6, finTax: 17.5 },
  2024: { revenue: 206.2, grossProfit: 71.8, cogs: 134.4, ebit: 31.0, opex: 40.8, netIncome: 13.1, finTax: 17.9 },
  2025: { revenue: 213.6, grossProfit: 74.7, cogs: 138.9, ebit: 32.0, opex: 42.7, netIncome: 13.8, finTax: 18.2 },
};

const YEARS: YearKey[] = ["2022", "2023", "2024", "2025"];

// ─── Layout helpers ──────────────────────────────────────────────────────────

const VIEW_W = 1100;
const VIEW_H = 380;
const GAP_MAJOR = 22;
const GAP_MINOR = 13;

function buildLayout(data: FlowData) {
  // pixels-per-billion so the Receita bar fills a healthy portion of the height
  const scale = 250 / data.revenue;
  const cy = 190;

  // Stage 1 — Receita Líquida (centered on cy)
  const revH = data.revenue * scale;
  const revTop = cy - revH / 2;
  const revBot = revTop + revH;

  // Stage 2 — Lucro Bruto (top) + Custo dos Produtos (bottom)
  // Centered on rev center, with GAP_MAJOR between — creates the y-delta
  // that makes the ribbon curves visible.
  const grossH = data.grossProfit * scale;
  const cogsH = data.cogs * scale;
  const s2H = grossH + GAP_MAJOR + cogsH;
  const grossTop = cy - s2H / 2;
  const grossBot = grossTop + grossH;
  const cogsTop = grossBot + GAP_MAJOR;
  const cogsBot = cogsTop + cogsH;
  const grossCy = (grossTop + grossBot) / 2;

  // Stage 3 — EBIT (top) + Despesas Operacionais (bottom). Both flow from Lucro Bruto.
  // Centered on the Lucro Bruto center, with GAP_MINOR between.
  const ebitH = data.ebit * scale;
  const opexH = data.opex * scale;
  const s3H = ebitH + GAP_MINOR + opexH;
  const ebitTop = grossCy - s3H / 2;
  const ebitBot = ebitTop + ebitH;
  const opexTop = ebitBot + GAP_MINOR;
  const opexBot = opexTop + opexH;
  const ebitCy = (ebitTop + ebitBot) / 2;

  // Stage 4 — Lucro Líquido + Financeiro + IR. Both flow from EBIT.
  // Centered on the EBIT center, with GAP_MINOR between.
  const netH = data.netIncome * scale;
  const finH = data.finTax * scale;
  const s4H = netH + GAP_MINOR + finH;
  const netTop = ebitCy - s4H / 2;
  const netBot = netTop + netH;
  const finTop = netBot + GAP_MINOR;
  const finBot = finTop + finH;

  // Source split bands on Receita Líquida — gross on top, cogs below (no gap on source)
  const recGrossTop = revTop;
  const recGrossBot = recGrossTop + grossH;
  const recCogsTop = recGrossBot;
  const recCogsBot = recCogsTop + cogsH;

  // Source split bands on Lucro Bruto — ebit on top, opex below
  const gbEbitTop = grossTop;
  const gbEbitBot = gbEbitTop + ebitH;
  const gbOpexTop = gbEbitBot;
  const gbOpexBot = gbOpexTop + opexH;

  // Source split bands on EBIT — netIncome on top, finTax below
  const ebitNetTop = ebitTop;
  const ebitNetBot = ebitNetTop + netH;
  const ebitFinTop = ebitNetBot;
  const ebitFinBot = ebitFinTop + finH;

  return {
    nodes: {
      rev: { x: 130, top: revTop, bot: revBot },
      gross: { x: 420, top: grossTop, bot: grossBot },
      cogs: { x: 420, top: cogsTop, bot: cogsBot },
      ebit: { x: 710, top: ebitTop, bot: ebitBot },
      opex: { x: 710, top: opexTop, bot: opexBot },
      net: { x: 960, top: netTop, bot: netBot },
      fin: { x: 960, top: finTop, bot: finBot },
    },
    ribbons: {
      recToGross: { sTop: recGrossTop, sBot: recGrossBot, tTop: grossTop, tBot: grossBot },
      recToCogs: { sTop: recCogsTop, sBot: recCogsBot, tTop: cogsTop, tBot: cogsBot },
      grossToEbit: { sTop: gbEbitTop, sBot: gbEbitBot, tTop: ebitTop, tBot: ebitBot },
      grossToOpex: { sTop: gbOpexTop, sBot: gbOpexBot, tTop: opexTop, tBot: opexBot },
      ebitToNet: { sTop: ebitNetTop, sBot: ebitNetBot, tTop: netTop, tBot: netBot },
      ebitToFin: { sTop: ebitFinTop, sBot: ebitFinBot, tTop: finTop, tBot: finBot },
    },
  };
}

function ribbonPath(x0: number, x1: number, sTop: number, sBot: number, tTop: number, tBot: number) {
  const xm = (x0 + x1) / 2;
  return [
    `M${x0},${sTop}`,
    `C${xm},${sTop} ${xm},${tTop} ${x1},${tTop}`,
    `L${x1},${tBot}`,
    `C${xm},${tBot} ${xm},${sBot} ${x0},${sBot}`,
    "Z",
  ].join(" ");
}

function formatBi(value: number) {
  return `R$${value.toFixed(1).replace(".", ",")}b`;
}

// ─── Component ───────────────────────────────────────────────────────────────

export function Bbas3SankeyDark() {
  const [year, setYear] = useState<YearKey>("2025");
  const data = YEAR_DATA[year];
  const layout = buildLayout(data);
  const { nodes, ribbons } = layout;
  const nodeW = 16;

  const COLORS = {
    revenue: "#3b82f6",
    gross: "#0f9f8f",
    cogs: "#d97706",
    ebit: "#0f9f8f",
    opex: "#c79548",
    net: "#0f9f8f",
    fin: "#ef4444",
  };

  return (
    <div className="relative mx-[60px] mt-16 overflow-hidden rounded-[24px] border border-[#1a1a1a] bg-gradient-to-b from-[#0a0a0a] to-[#050505] p-6 max-md:mx-4 max-md:mt-12 max-md:p-5 max-sm:mx-2">
      <div className="pointer-events-none absolute -left-32 -top-24 h-[280px] w-[280px] rounded-full bg-[#0f9f8f] opacity-[0.06] blur-[100px]" />
      <div className="pointer-events-none absolute -right-24 bottom-0 h-[240px] w-[240px] rounded-full bg-[#3b82f6] opacity-[0.05] blur-[100px]" />

      <div className="relative flex flex-wrap items-start justify-between gap-6">
        <div className="max-w-[620px]">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#1f3a35] bg-[#0b2b26] px-2.5 py-1">
            <span className="h-1.5 w-1.5 rounded-full bg-[#58d6c6]" />
            <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#58d6c6]">
              Fluxo financeiro · BBAS3
            </span>
          </div>
          <h3 className="mt-4 text-[28px] font-semibold leading-[32px] tracking-[-0.3px] text-white max-md:text-[22px] max-md:leading-[26px]">
            De onde vem o dinheiro e para onde vai?
          </h3>
          <p className="mt-3 max-w-[560px] text-[14px] leading-6 text-[#8a8a8a] max-md:text-[13px]">
            Este diagrama mostra como a receita se divide entre custos, despesas e lucro. Cada faixa representa um fluxo de dinheiro — quanto mais larga, maior o valor. Selecione o ano para comparar.
          </p>
        </div>

        <div className="inline-flex items-center gap-1 rounded-full border border-[#1a1a1a] bg-[#050505] p-1">
          {YEARS.map((y) => {
            const active = y === year;
            return (
              <button
                key={y}
                type="button"
                onClick={() => setYear(y)}
                className={`rounded-full px-4 py-1.5 text-[12px] font-semibold transition-all duration-200 ${
                  active
                    ? "border border-[#1f3a35] bg-[#0b2b26] text-[#58d6c6]"
                    : "text-[#707070] hover:text-[#c0c0c0]"
                }`}
              >
                {y}
              </button>
            );
          })}
        </div>
      </div>

      <div className="relative mx-auto mt-6 w-full max-w-[900px]">
        <svg viewBox={`0 0 ${VIEW_W} ${VIEW_H}`} className="h-auto w-full">
          <defs>
            <linearGradient id="ribbon-rev-gross" x1="0" x2="1" y1="0" y2="0">
              <stop offset="0%" stopColor={COLORS.revenue} stopOpacity="0.45" />
              <stop offset="100%" stopColor={COLORS.gross} stopOpacity="0.45" />
            </linearGradient>
            <linearGradient id="ribbon-rev-cogs" x1="0" x2="1" y1="0" y2="0">
              <stop offset="0%" stopColor={COLORS.revenue} stopOpacity="0.45" />
              <stop offset="100%" stopColor={COLORS.cogs} stopOpacity="0.45" />
            </linearGradient>
            <linearGradient id="ribbon-gross-ebit" x1="0" x2="1" y1="0" y2="0">
              <stop offset="0%" stopColor={COLORS.gross} stopOpacity="0.45" />
              <stop offset="100%" stopColor={COLORS.ebit} stopOpacity="0.45" />
            </linearGradient>
            <linearGradient id="ribbon-gross-opex" x1="0" x2="1" y1="0" y2="0">
              <stop offset="0%" stopColor={COLORS.gross} stopOpacity="0.45" />
              <stop offset="100%" stopColor={COLORS.opex} stopOpacity="0.45" />
            </linearGradient>
            <linearGradient id="ribbon-ebit-net" x1="0" x2="1" y1="0" y2="0">
              <stop offset="0%" stopColor={COLORS.ebit} stopOpacity="0.5" />
              <stop offset="100%" stopColor={COLORS.net} stopOpacity="0.5" />
            </linearGradient>
            <linearGradient id="ribbon-ebit-fin" x1="0" x2="1" y1="0" y2="0">
              <stop offset="0%" stopColor={COLORS.ebit} stopOpacity="0.45" />
              <stop offset="100%" stopColor={COLORS.fin} stopOpacity="0.45" />
            </linearGradient>
          </defs>

          {/* Ribbons */}
          <path
            d={ribbonPath(nodes.rev.x + nodeW, nodes.gross.x, ribbons.recToGross.sTop, ribbons.recToGross.sBot, ribbons.recToGross.tTop, ribbons.recToGross.tBot)}
            fill="url(#ribbon-rev-gross)"
          />
          <path
            d={ribbonPath(nodes.rev.x + nodeW, nodes.cogs.x, ribbons.recToCogs.sTop, ribbons.recToCogs.sBot, ribbons.recToCogs.tTop, ribbons.recToCogs.tBot)}
            fill="url(#ribbon-rev-cogs)"
          />
          <path
            d={ribbonPath(nodes.gross.x + nodeW, nodes.ebit.x, ribbons.grossToEbit.sTop, ribbons.grossToEbit.sBot, ribbons.grossToEbit.tTop, ribbons.grossToEbit.tBot)}
            fill="url(#ribbon-gross-ebit)"
          />
          <path
            d={ribbonPath(nodes.gross.x + nodeW, nodes.opex.x, ribbons.grossToOpex.sTop, ribbons.grossToOpex.sBot, ribbons.grossToOpex.tTop, ribbons.grossToOpex.tBot)}
            fill="url(#ribbon-gross-opex)"
          />
          <path
            d={ribbonPath(nodes.ebit.x + nodeW, nodes.net.x, ribbons.ebitToNet.sTop, ribbons.ebitToNet.sBot, ribbons.ebitToNet.tTop, ribbons.ebitToNet.tBot)}
            fill="url(#ribbon-ebit-net)"
          />
          <path
            d={ribbonPath(nodes.ebit.x + nodeW, nodes.fin.x, ribbons.ebitToFin.sTop, ribbons.ebitToFin.sBot, ribbons.ebitToFin.tTop, ribbons.ebitToFin.tBot)}
            fill="url(#ribbon-ebit-fin)"
          />

          {/* Nodes */}
          {[
            { k: "rev", color: COLORS.revenue },
            { k: "gross", color: COLORS.gross },
            { k: "cogs", color: COLORS.cogs },
            { k: "ebit", color: COLORS.ebit },
            { k: "opex", color: COLORS.opex },
            { k: "net", color: COLORS.net },
            { k: "fin", color: COLORS.fin },
          ].map((n) => {
            const node = (nodes as Record<string, { x: number; top: number; bot: number }>)[n.k]!;
            return (
              <rect
                key={n.k}
                x={node.x}
                y={node.top}
                width={nodeW}
                height={node.bot - node.top}
                rx={3}
                fill={n.color}
              />
            );
          })}

          {/* Labels — Receita (left of node) */}
          <text x={nodes.rev.x - 14} y={(nodes.rev.top + nodes.rev.bot) / 2 - 8} textAnchor="end" fill="#9a9a9a" fontSize="16">
            Receita Líquida
          </text>
          <text x={nodes.rev.x - 14} y={(nodes.rev.top + nodes.rev.bot) / 2 + 14} textAnchor="end" fill="#ffffff" fontSize="17" fontWeight="700">
            {formatBi(data.revenue)}
          </text>

          {/* Lucro Bruto (top) */}
          <text x={nodes.gross.x + nodeW / 2} y={nodes.gross.top - 22} textAnchor="middle" fill="#9a9a9a" fontSize="15">
            Lucro Bruto
          </text>
          <text x={nodes.gross.x + nodeW / 2} y={nodes.gross.top - 4} textAnchor="middle" fill="#ffffff" fontSize="16" fontWeight="700">
            {formatBi(data.grossProfit)}
          </text>

          {/* Custo dos Produtos (bottom) */}
          <text x={nodes.cogs.x + nodeW / 2} y={nodes.cogs.bot + 22} textAnchor="middle" fill="#9a9a9a" fontSize="15">
            Custo dos Produtos
          </text>
          <text x={nodes.cogs.x + nodeW / 2} y={nodes.cogs.bot + 42} textAnchor="middle" fill="#ffffff" fontSize="16" fontWeight="700">
            {formatBi(data.cogs)}
          </text>

          {/* EBIT chip */}
          <rect
            x={nodes.ebit.x - 40}
            y={nodes.ebit.top - 42}
            width={68}
            height={22}
            rx={11}
            fill="#0b2b26"
            stroke="#1f3a35"
          />
          <text x={nodes.ebit.x - 6} y={nodes.ebit.top - 27} textAnchor="middle" fill="#58d6c6" fontSize="13" fontWeight="700">
            EBIT
          </text>
          <text x={nodes.ebit.x + nodeW / 2} y={nodes.ebit.top - 4} textAnchor="middle" fill="#ffffff" fontSize="16" fontWeight="700">
            {formatBi(data.ebit)}
          </text>

          {/* Despesas Operacionais (under opex node) */}
          <text x={nodes.opex.x + nodeW / 2} y={nodes.opex.bot + 22} textAnchor="middle" fill="#9a9a9a" fontSize="15">
            Despesas Operacionais
          </text>
          <text x={nodes.opex.x + nodeW / 2} y={nodes.opex.bot + 42} textAnchor="middle" fill="#ffffff" fontSize="16" fontWeight="700">
            {formatBi(data.opex)}
          </text>

          {/* Lucro Líquido (right of node, top) */}
          <text x={nodes.net.x + nodeW + 12} y={(nodes.net.top + nodes.net.bot) / 2 - 4} fill="#9a9a9a" fontSize="15">
            Lucro Líquido
          </text>
          <text x={nodes.net.x + nodeW + 12} y={(nodes.net.top + nodes.net.bot) / 2 + 16} fill="#ffffff" fontSize="16" fontWeight="700">
            {formatBi(data.netIncome)}
          </text>

          {/* Financeiro + IR (right of node, bottom) */}
          <text x={nodes.fin.x + nodeW + 12} y={(nodes.fin.top + nodes.fin.bot) / 2 - 4} fill="#9a9a9a" fontSize="15">
            Financeiro + IR
          </text>
          <text x={nodes.fin.x + nodeW + 12} y={(nodes.fin.top + nodes.fin.bot) / 2 + 16} fill="#ef4444" fontSize="16" fontWeight="700">
            {formatBi(data.finTax)}
          </text>
        </svg>
      </div>

      <div className="relative mt-6 flex flex-wrap items-center gap-4 border-t border-[#141414] pt-5 text-[11px] text-[#707070]">
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-[#3b82f6]" /> Entrada
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-[#0f9f8f]" /> Retido como lucro
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-[#d97706]" /> Custos e despesas
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-[#ef4444]" /> Saída financeira
        </span>
      </div>
    </div>
  );
}

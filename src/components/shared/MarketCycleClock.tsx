"use client";

/**
 * Relógio do ciclo econômico (Merrill Lynch Investment Clock).
 *
 * SVG interativo 2×2 em forma de círculo com 4 quadrantes (fases):
 *   - RECOVERY    (Recuperação)     — crescimento ↑ · inflação ↓
 *   - OVERHEAT    (Superaquecimento)— crescimento ↑ · inflação ↑
 *   - STAGFLATION (Estagflação)      — crescimento ↓ · inflação ↑
 *   - REFLATION   (Reflação)         — crescimento ↓ · inflação ↓
 *
 * Componente shared/: extraído de features/analysis pra ser reusado na tela
 * /mercado sem criar dependência cruzada entre features (arquitetura_skill
 * §"componentes globais nunca importam de features/").
 *
 * SRP: apenas o relógio SVG + tooltip de fase. Sem cards de indicador,
 * sem confiança — isso fica no container que compõe.
 */

import { useState } from "react";

export type MarketCyclePhase = "RECOVERY" | "OVERHEAT" | "STAGFLATION" | "REFLATION";

interface PhaseMeta { label: string; hint: string; color: string; }

const PHASE_META: Record<MarketCyclePhase, PhaseMeta> = {
  RECOVERY: {
    label: "Recuperação",
    hint: "Crescimento acima da tendência e inflação caindo. Juros em queda estimulam crédito. Setores cíclicos e financeiro lideram.",
    color: "#2D9F6F",
  },
  OVERHEAT: {
    label: "Superaquecimento",
    hint: "Crescimento forte com inflação subindo. BC eleva juros. Commodities e ativos reais se valorizam.",
    color: "#D4913B",
  },
  STAGFLATION: {
    label: "Estagflação",
    hint: "Crescimento fraco e inflação alta. Cenário mais difícil. Setores defensivos oferecem proteção.",
    color: "#C74B4B",
  },
  REFLATION: {
    label: "Reflação",
    hint: "Economia fraca, mas inflação cede. Espaço para cortes de juros. Fase de transição para recuperação.",
    color: "#3E8ED0",
  },
};

const PHASE_ORDER: MarketCyclePhase[] = ["RECOVERY", "OVERHEAT", "STAGFLATION", "REFLATION"];

interface Props {
  currentPhase: MarketCyclePhase;
  /** Largura máx do container (default 380). Diminui proporcionalmente quando o pai limita. */
  maxWidth?: number;
}

export function MarketCycleClock({ currentPhase, maxWidth = 380 }: Props) {
  const [hovered, setHovered] = useState<MarketCyclePhase | null>(null);

  const width = 340;
  const height = 280;
  const cx = width / 2;
  const cy = height / 2;
  const r = 95;

  // SVG: 0° à direita, sentido horário.
  const quadrants: Record<MarketCyclePhase, {
    startDeg: number; endDeg: number;
    lx: number; ly: number;
    tipX: string; tipY: string;
    tipAlign: "left" | "right";
  }> = {
    RECOVERY:    { startDeg: 180, endDeg: 270, lx: cx - 47, ly: cy - 38, tipX: "2%",  tipY: "2%",  tipAlign: "left" },
    OVERHEAT:    { startDeg: 270, endDeg: 360, lx: cx + 47, ly: cy - 38, tipX: "52%", tipY: "2%",  tipAlign: "right" },
    STAGFLATION: { startDeg: 0,   endDeg: 90,  lx: cx + 47, ly: cy + 45, tipX: "52%", tipY: "55%", tipAlign: "right" },
    REFLATION:   { startDeg: 90,  endDeg: 180, lx: cx - 47, ly: cy + 45, tipX: "2%",  tipY: "55%", tipAlign: "left" },
  };

  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const currentMeta = PHASE_META[currentPhase];

  return (
    <div
      className="relative mx-auto w-full"
      style={{ maxWidth }}
    >
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full"
        role="img"
        aria-label={`Relógio do ciclo de mercado - fase atual: ${currentMeta.label}`}
      >
        {PHASE_ORDER.map((phase) => {
          const meta = PHASE_META[phase];
          const isActive = phase === currentPhase;
          const isHovered = hovered === phase;
          const q = quadrants[phase];

          const x1 = cx + r * Math.cos(toRad(q.startDeg));
          const y1 = cy + r * Math.sin(toRad(q.startDeg));
          const x2 = cx + r * Math.cos(toRad(q.endDeg));
          const y2 = cy + r * Math.sin(toRad(q.endDeg));

          const fontSize = isActive ? 11.5 : 10;
          const fill = isActive || isHovered ? meta.color : "#6B7280";
          const op = isActive ? 1 : isHovered ? 0.9 : 0.6;
          const fw = isActive || isHovered ? 700 : 600;
          const LABEL_BREAKS: Record<string, string[]> = {
            "Superaquecimento": ["Super-", "aquecimento"],
          };
          const lines = LABEL_BREAKS[meta.label] ?? [meta.label];
          const lineHeight = fontSize * 1.3;
          const startY = q.ly - ((lines.length - 1) * lineHeight) / 2;

          return (
            <g
              key={phase}
              className="cursor-pointer"
              onMouseEnter={() => setHovered(phase)}
              onMouseLeave={() => setHovered(null)}
            >
              <path
                d={`M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 0 1 ${x2} ${y2} Z`}
                fill={isActive ? meta.color : isHovered ? meta.color : "#D1D5DB"}
                opacity={isActive ? 0.45 : isHovered ? 0.25 : 0.12}
                stroke={isActive ? meta.color : "transparent"}
                strokeWidth={isActive ? 1.5 : 0}
                strokeOpacity={isActive ? 0.4 : 0}
                className="transition-all duration-300"
              />
              <text
                textAnchor="middle"
                style={{ fontSize, fontWeight: fw, letterSpacing: "-0.01em" }}
                className="pointer-events-none transition-all duration-200"
                fill={fill}
                opacity={op}
              >
                {lines.map((line, i) => (
                  <tspan key={i} x={q.lx} y={startY + i * lineHeight}>{line}</tspan>
                ))}
              </text>
            </g>
          );
        })}

        {/* Eixos */}
        <line x1={cx} y1={cy - r} x2={cx} y2={cy + r} stroke="#D1D5DB" strokeWidth="1.25" className="pointer-events-none" />
        <line x1={cx - r} y1={cy} x2={cx + r} y2={cy} stroke="#D1D5DB" strokeWidth="1.25" className="pointer-events-none" />
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="#D1D5DB" strokeWidth="1.75" className="pointer-events-none" />

        {/* Labels dos eixos */}
        <text x={cx} y={18}         textAnchor="middle" className="pointer-events-none" style={{ fontSize: 9.5, fontWeight: 600, fill: "#6B7280" }}>Crescimento ↑</text>
        <text x={cx} y={height - 6} textAnchor="middle" className="pointer-events-none" style={{ fontSize: 9.5, fontWeight: 600, fill: "#6B7280" }}>Crescimento ↓</text>
        <text x={width - 8} y={cy + 4} textAnchor="end"    className="pointer-events-none" style={{ fontSize: 9.5, fontWeight: 600, fill: "#6B7280" }}>Inflação ↑</text>
        <text x={8}         y={cy + 4} textAnchor="start"  className="pointer-events-none" style={{ fontSize: 9.5, fontWeight: 600, fill: "#6B7280" }}>Inflação ↓</text>
      </svg>

      {hovered && (() => {
        const q = quadrants[hovered];
        const meta = PHASE_META[hovered];
        return (
          <div
            className="absolute z-10 w-[46%] rounded-lg border border-border bg-card px-3 py-2.5 shadow-lg pointer-events-none animate-in fade-in duration-150"
            style={{ left: q.tipX, top: q.tipY }}
          >
            <div className="mb-1 flex items-center gap-1.5">
              <span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: meta.color }} />
              <span className="text-[11px] font-bold" style={{ color: meta.color }}>{meta.label}</span>
            </div>
            <p className="text-[10px] leading-relaxed text-muted-foreground">{meta.hint}</p>
          </div>
        );
      })()}
    </div>
  );
}

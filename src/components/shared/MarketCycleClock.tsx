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

  // Viewport ampliado para acomodar labels fora do círculo com respiro.
  const width = 380;
  const height = 320;
  const cx = width / 2;
  const cy = height / 2;
  const r = 110;
  const axisPad = 22;   // quanto os eixos estendem além do círculo
  const chipPad = 38;   // distância do chip de label ao círculo

  // SVG: 0° à direita, sentido horário.
  const quadrants: Record<MarketCyclePhase, {
    startDeg: number; endDeg: number;
    lx: number; ly: number;
    tipX: string; tipY: string;
    tipAlign: "left" | "right";
  }> = {
    RECOVERY:    { startDeg: 180, endDeg: 270, lx: cx - 55, ly: cy - 42, tipX: "2%",  tipY: "2%",  tipAlign: "left" },
    OVERHEAT:    { startDeg: 270, endDeg: 360, lx: cx + 55, ly: cy - 42, tipX: "52%", tipY: "2%",  tipAlign: "right" },
    STAGFLATION: { startDeg: 0,   endDeg: 90,  lx: cx + 55, ly: cy + 50, tipX: "52%", tipY: "55%", tipAlign: "right" },
    REFLATION:   { startDeg: 90,  endDeg: 180, lx: cx - 55, ly: cy + 50, tipX: "2%",  tipY: "55%", tipAlign: "left" },
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

        {/* Eixos cruzados — estendem ALÉM do círculo com traço tracejado
            para reforçar visualmente os parâmetros (crescimento × inflação).
            Segmento dentro do círculo é sólido, fora é dashed. */}
        {/* Eixo vertical (crescimento) */}
        <line x1={cx} y1={cy - r}           x2={cx} y2={cy + r}
              stroke="#9CA3AF" strokeWidth="1.5"
              className="pointer-events-none" />
        <line x1={cx} y1={cy - r - axisPad} x2={cx} y2={cy - r}
              stroke="#9CA3AF" strokeWidth="1.5" strokeDasharray="3 3"
              className="pointer-events-none" />
        <line x1={cx} y1={cy + r}           x2={cx} y2={cy + r + axisPad}
              stroke="#9CA3AF" strokeWidth="1.5" strokeDasharray="3 3"
              className="pointer-events-none" />

        {/* Eixo horizontal (inflação) */}
        <line x1={cx - r}           y1={cy} x2={cx + r}           y2={cy}
              stroke="#9CA3AF" strokeWidth="1.5"
              className="pointer-events-none" />
        <line x1={cx - r - axisPad} y1={cy} x2={cx - r}           y2={cy}
              stroke="#9CA3AF" strokeWidth="1.5" strokeDasharray="3 3"
              className="pointer-events-none" />
        <line x1={cx + r}           y1={cy} x2={cx + r + axisPad} y2={cy}
              stroke="#9CA3AF" strokeWidth="1.5" strokeDasharray="3 3"
              className="pointer-events-none" />

        {/* Círculo externo */}
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="#D1D5DB" strokeWidth="1.75" className="pointer-events-none" />

        {/* Ponto central reforçando a origem dos eixos */}
        <circle cx={cx} cy={cy} r={2.25} fill="#6B7280" className="pointer-events-none" />

        {/* Axis labels em "chip" com fundo — maior presença visual.
            Usa foreignObject pra aproveitar tokens CSS do tema.
            whitespace-nowrap garante que o label fique em linha única
            mesmo quando a tipografia do locale o faça caber por pouco. */}
        {/* Crescimento ↑ (topo) */}
        <foreignObject x={cx - 72} y={0} width="144" height="22" className="pointer-events-none">
          <div className="flex h-full items-center justify-center whitespace-nowrap rounded-full border border-border bg-muted px-3 text-[10px] font-semibold uppercase tracking-wider text-foreground">
            Crescimento ↑
          </div>
        </foreignObject>
        {/* Crescimento ↓ (base) */}
        <foreignObject x={cx - 72} y={height - 22} width="144" height="22" className="pointer-events-none">
          <div className="flex h-full items-center justify-center whitespace-nowrap rounded-full border border-border bg-muted px-3 text-[10px] font-semibold uppercase tracking-wider text-foreground">
            Crescimento ↓
          </div>
        </foreignObject>
        {/* Inflação ↓ (esquerda) */}
        <foreignObject x={0} y={cy - 11} width="96" height="22" className="pointer-events-none">
          <div className="flex h-full items-center justify-center whitespace-nowrap rounded-full border border-border bg-muted px-3 text-[10px] font-semibold uppercase tracking-wider text-foreground">
            Inflação ↓
          </div>
        </foreignObject>
        {/* Inflação ↑ (direita) */}
        <foreignObject x={width - 96} y={cy - 11} width="96" height="22" className="pointer-events-none">
          <div className="flex h-full items-center justify-center whitespace-nowrap rounded-full border border-border bg-muted px-3 text-[10px] font-semibold uppercase tracking-wider text-foreground">
            Inflação ↑
          </div>
        </foreignObject>
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

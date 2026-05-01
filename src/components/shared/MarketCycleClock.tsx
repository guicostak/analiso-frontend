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
 * Design moderno:
 *  - Quadrantes com gradient radial (centro mais claro → borda saturada)
 *  - Quadrante ativo: glow colored + stroke + tipografia em destaque
 *  - Quadrantes inativos: bg sutil, texto muted (recuam)
 *  - Ponteiro do clock apontando do centro para o setor ativo
 *  - Pulse animation no ponto central
 *  - Pills dos eixos com ícones de tendência (TrendingUp/Down)
 *
 * Componente shared/: extraído de features/analysis pra ser reusado na tela
 * /mercado sem criar dependência cruzada entre features.
 */

import { useState } from "react";
import { motion } from "motion/react";
import { TrendingUp, TrendingDown } from "lucide-react";

export type MarketCyclePhase = "RECOVERY" | "OVERHEAT" | "STAGFLATION" | "REFLATION";

export interface PhaseMeta {
  label: string;
  hint: string;
  color: string;
  /** Versão clara da cor para o gradient radial (centro). */
  colorLight: string;
}

/**
 * Paleta "Jewel tones balanced" — saturação ~60% com luminância ~55%.
 * Princípio Refactoring UI: cores ricas em personalidade sem cair em
 * Crayola (saturação max) nem em pastel/cinza (saturação min). Todas
 * compartilham luminância similar, então harmonizam quando vistas juntas.
 *
 * Referência: tons HSL controlados em vez de cores hex aleatórias.
 *   - emerald   hsl(160, 60%, 45%)
 *   - amber     hsl(35,  65%, 58%)
 *   - rose-coral hsl(345, 55%, 62%)
 *   - sapphire  hsl(220, 50%, 60%)
 */
export const PHASE_META: Record<MarketCyclePhase, PhaseMeta> = {
  RECOVERY: {
    label: "Recuperação",
    hint: "Crescimento acima da tendência e inflação caindo. Juros em queda estimulam crédito. Setores cíclicos e financeiro lideram.",
    color: "#2EAE83",      // emerald jade
    colorLight: "#A5DBC5",
  },
  OVERHEAT: {
    label: "Superaquecimento",
    hint: "Crescimento forte com inflação subindo. BC eleva juros. Commodities e ativos reais se valorizam.",
    color: "#DDA251",      // golden amber
    colorLight: "#F0CFA0",
  },
  STAGFLATION: {
    label: "Estagflação",
    hint: "Crescimento fraco e inflação alta. Cenário mais difícil. Setores defensivos oferecem proteção.",
    color: "#D17085",      // rose coral
    colorLight: "#E8B0BD",
  },
  REFLATION: {
    label: "Reflação",
    hint: "Economia fraca, mas inflação cede. Espaço para cortes de juros. Fase de transição para recuperação.",
    color: "#6F88C2",      // sapphire blue
    colorLight: "#B5C2DD",
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

  const width = 380;
  const height = 320;
  const cx = width / 2;
  const cy = height / 2;
  const r = 115;
  const axisPad = 22;

  // SVG: 0° à direita, sentido horário.
  // tip* = posicionamento absoluto do tooltip de hover (em % do container).
  // midDeg = ângulo do CENTRO de cada quadrante (usado pro ponteiro).
  const quadrants: Record<MarketCyclePhase, {
    startDeg: number; endDeg: number;
    midDeg: number;
    lx: number; ly: number;
    tipX: string; tipY: string;
  }> = {
    RECOVERY:    { startDeg: 180, endDeg: 270, midDeg: 225, lx: cx - 58, ly: cy - 44, tipX: "2%",  tipY: "2%"  },
    OVERHEAT:    { startDeg: 270, endDeg: 360, midDeg: 315, lx: cx + 58, ly: cy - 44, tipX: "52%", tipY: "2%"  },
    STAGFLATION: { startDeg: 0,   endDeg: 90,  midDeg: 45,  lx: cx + 58, ly: cy + 52, tipX: "52%", tipY: "55%" },
    REFLATION:   { startDeg: 90,  endDeg: 180, midDeg: 135, lx: cx - 58, ly: cy + 52, tipX: "2%",  tipY: "55%" },
  };

  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const currentMeta = PHASE_META[currentPhase];
  const currentQ = quadrants[currentPhase];

  // Ponteiro do clock: vai do centro até ~72% do raio, na direção do
  // centro do quadrante ativo. Coordenadas calculadas só para o ativo.
  const handLength = r * 0.72;
  const handX = cx + handLength * Math.cos(toRad(currentQ.midDeg));
  const handY = cy + handLength * Math.sin(toRad(currentQ.midDeg));

  // 12 tick marks ao redor (a cada 30°). Os 4 cardinais (0/90/180/270 → 6/3/12/9
  // horas) são mais grossos pra reforçar os pontos de referência.
  const tickAngles = Array.from({ length: 12 }, (_, i) => i * 30);

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
        <defs>
          {/* Drop-shadow direcional discreto — simula elevação do quadrante
              ativo. Diferente do `Gaussian blur` anterior (que parecia glow
              de PowerPoint), aqui é uma sombra projetada pra baixo, sutil,
              dando sensação de "card levantado" da superfície. */}
          <filter id="mcc-elevation" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="3" stdDeviation="3" floodOpacity="0.18" />
          </filter>
        </defs>

        {/* ─── Quadrantes ─────────────────────────────────────────── */}
        {PHASE_ORDER.map((phase, idx) => {
          const meta = PHASE_META[phase];
          const isActive = phase === currentPhase;
          const isHovered = hovered === phase;
          const q = quadrants[phase];

          const x1 = cx + r * Math.cos(toRad(q.startDeg));
          const y1 = cy + r * Math.sin(toRad(q.startDeg));
          const x2 = cx + r * Math.cos(toRad(q.endDeg));
          const y2 = cy + r * Math.sin(toRad(q.endDeg));

          const fontSize = isActive ? 13 : 11;
          const fw = isActive ? 700 : 600;
          // Texto BRANCO em todos os quadrantes — agora todos têm fill
          // colorido forte o suficiente pra dar contraste. Ativa fica em
          // opacity 1; inativas levemente atenuadas pra manter hierarquia.
          const textColor = "#ffffff";
          const textOpacity = isActive ? 1 : isHovered ? 1 : 0.92;

          // Quebras manuais quando o nome da fase é grande
          const LABEL_BREAKS: Record<string, string[]> = {
            "Superaquecimento": ["Super-", "aquecimento"],
          };
          const lines = LABEL_BREAKS[meta.label] ?? [meta.label];
          const lineHeight = fontSize * 1.3;
          const startY = q.ly - ((lines.length - 1) * lineHeight) / 2;

          return (
            <motion.g
              key={phase}
              className="cursor-pointer"
              onMouseEnter={() => setHovered(phase)}
              onMouseLeave={() => setHovered(null)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3, delay: idx * 0.05, ease: "easeOut" }}
            >
              {/* Quadrante: fill sólido em todos. Hierarquia visual da
                  ativa vem de:
                    - opacity máxima (1 vs 0.55 dos inativos)
                    - filter: drop-shadow direcional (sensação de elevação)
                    - tipografia 2px maior + bold
                  Texto branco em TODOS pra contraste consistente. */}
              <path
                d={`M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 0 1 ${x2} ${y2} Z`}
                fill={meta.color}
                fillOpacity={isActive ? 1 : isHovered ? 0.78 : 0.55}
                filter={isActive ? "url(#mcc-elevation)" : undefined}
                className="transition-all duration-300 ease-out"
              />

              {/* Label do quadrante */}
              <text
                textAnchor="middle"
                style={{
                  fontSize,
                  fontWeight: fw,
                  letterSpacing: isActive ? "-0.015em" : "-0.005em",
                }}
                className="pointer-events-none transition-all duration-200"
                fill={textColor}
                opacity={textOpacity}
              >
                {lines.map((line, i) => (
                  <tspan key={i} x={q.lx} y={startY + i * lineHeight}>
                    {line}
                  </tspan>
                ))}
              </text>
            </motion.g>
          );
        })}

        {/* ─── Eixos cruzados ─────────────────────────────────────── */}
        {/* Vertical (crescimento) */}
        <line x1={cx} y1={cy - r}           x2={cx} y2={cy + r}
              stroke="currentColor" strokeWidth="1.25"
              className="text-foreground/15 pointer-events-none" />
        <line x1={cx} y1={cy - r - axisPad} x2={cx} y2={cy - r}
              stroke="currentColor" strokeWidth="1.25" strokeDasharray="3 3"
              className="text-foreground/20 pointer-events-none" />
        <line x1={cx} y1={cy + r}           x2={cx} y2={cy + r + axisPad}
              stroke="currentColor" strokeWidth="1.25" strokeDasharray="3 3"
              className="text-foreground/20 pointer-events-none" />

        {/* Horizontal (inflação) */}
        <line x1={cx - r}           y1={cy} x2={cx + r}           y2={cy}
              stroke="currentColor" strokeWidth="1.25"
              className="text-foreground/15 pointer-events-none" />
        <line x1={cx - r - axisPad} y1={cy} x2={cx - r}           y2={cy}
              stroke="currentColor" strokeWidth="1.25" strokeDasharray="3 3"
              className="text-foreground/20 pointer-events-none" />
        <line x1={cx + r}           y1={cy} x2={cx + r + axisPad} y2={cy}
              stroke="currentColor" strokeWidth="1.25" strokeDasharray="3 3"
              className="text-foreground/20 pointer-events-none" />

        {/* Anel externo do relógio (moldura) — duplo aro pra reforçar a
            silhueta de um relógio analógico clássico */}
        <circle cx={cx} cy={cy} r={r}
                fill="none" stroke="currentColor" strokeWidth="2"
                className="text-foreground/25 pointer-events-none" />
        <circle cx={cx} cy={cy} r={r + 5}
                fill="none" stroke="currentColor" strokeWidth="1"
                className="text-foreground/15 pointer-events-none" />

        {/* Tick marks horários — 12 traços ao redor (a cada 30°). Os 4
            cardinais (12/3/6/9 horas) ficam mais longos e grossos pra dar
            âncora visual. */}
        {tickAngles.map((deg) => {
          const isCardinal = deg % 90 === 0;
          const tickInner = isCardinal ? r - 6 : r - 3;
          const tickOuter = r + 1;
          const x1 = cx + tickInner * Math.cos(toRad(deg));
          const y1 = cy + tickInner * Math.sin(toRad(deg));
          const x2 = cx + tickOuter * Math.cos(toRad(deg));
          const y2 = cy + tickOuter * Math.sin(toRad(deg));
          return (
            <line
              key={deg}
              x1={x1} y1={y1} x2={x2} y2={y2}
              stroke="currentColor"
              strokeWidth={isCardinal ? 1.75 : 1}
              strokeLinecap="round"
              className={`pointer-events-none ${isCardinal ? "text-foreground/45" : "text-foreground/25"}`}
            />
          );
        })}

        {/* Ponteiro do relógio — anima da posição "12 horas" (topo) até o
            quadrante ativo. Spring suave dá sensação de "ponteiro de relógio
            real" se acomodando na posição. Reanima quando `currentPhase` muda. */}
        <motion.g
          style={{ transformOrigin: `${cx}px ${cy}px` }}
          initial={{ rotate: -90 - currentQ.midDeg }}      // começa em "12h" relativo ao alvo
          animate={{ rotate: 0 }}                            // chega na rotação 0 = posição correta
          transition={{ type: "spring", stiffness: 60, damping: 12, delay: 0.2 }}
        >
          {/* Halo branco por baixo — contraste quando passa sobre quadrantes */}
          <line
            x1={cx} y1={cy} x2={handX} y2={handY}
            stroke="white"
            strokeWidth={3.5}
            strokeLinecap="round"
            className="pointer-events-none"
          />
          <line
            x1={cx} y1={cy} x2={handX} y2={handY}
            stroke={currentMeta.color}
            strokeWidth={1.75}
            strokeLinecap="round"
            className="pointer-events-none"
          />
          {/* Cabeça do ponteiro — círculo pequeno na ponta (estilo "minute hand"
              dos relógios analógicos clássicos com bola decorativa) */}
          <circle
            cx={handX} cy={handY} r={3.5}
            fill={currentMeta.color}
            stroke="white"
            strokeWidth={1.5}
            className="pointer-events-none"
          />
        </motion.g>

        {/* Pino central do relógio — círculo branco com borda da cor ativa.
            Anima a entrada com scale suave. */}
        <motion.circle
          cx={cx} cy={cy} r={5.5}
          fill="white"
          stroke={currentMeta.color} strokeWidth={2}
          className="pointer-events-none"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.3 }}
          style={{ transformOrigin: `${cx}px ${cy}px` }}
        />
        <circle cx={cx} cy={cy} r={1.5}
                fill={currentMeta.color}
                className="pointer-events-none" />

        {/* ─── Pills dos eixos (com ícones de tendência) ──────────── */}
        {/* Crescimento ↑ (topo) */}
        <foreignObject x={cx - 78} y={-2} width="156" height="24" className="pointer-events-none">
          <div className="flex h-full items-center justify-center gap-1 whitespace-nowrap rounded-full bg-foreground/[0.06] backdrop-blur-sm px-3 text-[10.5px] font-semibold uppercase tracking-wider text-foreground/85">
            <TrendingUp className="h-3 w-3" strokeWidth={2.5} />
            Crescimento
          </div>
        </foreignObject>
        {/* Crescimento ↓ (base) */}
        <foreignObject x={cx - 78} y={height - 22} width="156" height="24" className="pointer-events-none">
          <div className="flex h-full items-center justify-center gap-1 whitespace-nowrap rounded-full bg-foreground/[0.06] backdrop-blur-sm px-3 text-[10.5px] font-semibold uppercase tracking-wider text-foreground/85">
            <TrendingDown className="h-3 w-3" strokeWidth={2.5} />
            Crescimento
          </div>
        </foreignObject>
        {/* Inflação ↓ (esquerda) */}
        <foreignObject x={-2} y={cy - 12} width="106" height="24" className="pointer-events-none">
          <div className="flex h-full items-center justify-center gap-1 whitespace-nowrap rounded-full bg-foreground/[0.06] backdrop-blur-sm px-3 text-[10.5px] font-semibold uppercase tracking-wider text-foreground/85">
            <TrendingDown className="h-3 w-3" strokeWidth={2.5} />
            Inflação
          </div>
        </foreignObject>
        {/* Inflação ↑ (direita) */}
        <foreignObject x={width - 104} y={cy - 12} width="106" height="24" className="pointer-events-none">
          <div className="flex h-full items-center justify-center gap-1 whitespace-nowrap rounded-full bg-foreground/[0.06] backdrop-blur-sm px-3 text-[10.5px] font-semibold uppercase tracking-wider text-foreground/85">
            <TrendingUp className="h-3 w-3" strokeWidth={2.5} />
            Inflação
          </div>
        </foreignObject>
      </svg>

      {/* Tooltip de hover sobre quadrante */}
      {hovered && (() => {
        const q = quadrants[hovered];
        const meta = PHASE_META[hovered];
        return (
          <div
            className="absolute z-10 w-[46%] rounded-xl border border-border bg-card px-3 py-2.5 shadow-md pointer-events-none animate-in fade-in zoom-in-95 duration-150"
            style={{ left: q.tipX, top: q.tipY }}
          >
            <div className="mb-1 flex items-center gap-1.5">
              <span
                className="h-2 w-2 shrink-0 rounded-full"
                style={{ backgroundColor: meta.color }}
              />
              <span className="text-[11px] font-bold" style={{ color: meta.color }}>
                {meta.label}
              </span>
            </div>
            <p className="text-[10px] leading-relaxed text-muted-foreground">{meta.hint}</p>
          </div>
        );
      })()}
    </div>
  );
}

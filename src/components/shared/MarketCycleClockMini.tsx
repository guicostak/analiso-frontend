"use client";

/**
 * MarketCycleClockMini — versão compacta do Investment Clock.
 *
 * Pra uso em ilhas de dashboard onde o espaço é restrito. Mostra apenas:
 *   - 4 quadrantes coloridos (mesma paleta do MarketCycleClock full)
 *   - Ponteiro animado apontando pro quadrante ativo
 *   - Pino central
 *   - Anel externo
 *
 * NÃO inclui (intencional — não cabe e seria ilegível em tamanho pequeno):
 *   - Tick marks horários
 *   - Labels de quadrante
 *   - Pills de eixos (Crescimento/Inflação)
 *   - Tooltip de hover
 *
 * O contexto vai no card que usa o mini (ex: "REFLAÇÃO" ao lado).
 */

import { motion } from "motion/react";
import { PHASE_META, type MarketCyclePhase } from "./MarketCycleClock";

const PHASE_ORDER: MarketCyclePhase[] = ["RECOVERY", "OVERHEAT", "STAGFLATION", "REFLATION"];

// Mesma topologia do full: 0° à direita, sentido horário, 4 quadrantes.
const QUADRANT_ANGLES: Record<MarketCyclePhase, { startDeg: number; endDeg: number; midDeg: number }> = {
  RECOVERY:    { startDeg: 180, endDeg: 270, midDeg: 225 },
  OVERHEAT:    { startDeg: 270, endDeg: 360, midDeg: 315 },
  STAGFLATION: { startDeg: 0,   endDeg: 90,  midDeg: 45  },
  REFLATION:   { startDeg: 90,  endDeg: 180, midDeg: 135 },
};

interface Props {
  currentPhase: MarketCyclePhase;
  /** Tamanho do SVG em pixels (sempre quadrado). Default 120. */
  size?: number;
}

export function MarketCycleClockMini({ currentPhase, size = 120 }: Props) {
  const cx = size / 2;
  const cy = size / 2;
  const r = size * 0.42;          // 42% do tamanho — deixa espaço pra borda
  const handLen = r * 0.7;

  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const currentMeta = PHASE_META[currentPhase];
  const currentQ = QUADRANT_ANGLES[currentPhase];

  const handX = cx + handLen * Math.cos(toRad(currentQ.midDeg));
  const handY = cy + handLen * Math.sin(toRad(currentQ.midDeg));

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      role="img"
      aria-label={`Ciclo de mercado: ${currentMeta.label}`}
      style={{ display: "block" }}
    >
      {/* Quadrantes */}
      {PHASE_ORDER.map((phase) => {
        const meta = PHASE_META[phase];
        const isActive = phase === currentPhase;
        const q = QUADRANT_ANGLES[phase];

        const x1 = cx + r * Math.cos(toRad(q.startDeg));
        const y1 = cy + r * Math.sin(toRad(q.startDeg));
        const x2 = cx + r * Math.cos(toRad(q.endDeg));
        const y2 = cy + r * Math.sin(toRad(q.endDeg));

        return (
          <path
            key={phase}
            d={`M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 0 1 ${x2} ${y2} Z`}
            fill={meta.color}
            fillOpacity={isActive ? 1 : 0.55}
            className="transition-all duration-300 ease-out"
          />
        );
      })}

      {/* Anel externo (moldura) */}
      <circle cx={cx} cy={cy} r={r}
              fill="none" stroke="currentColor" strokeWidth="1.25"
              className="text-foreground/20 pointer-events-none" />

      {/* Ponteiro animado — gira da posição "12h" pra fase atual */}
      <motion.g
        style={{ transformOrigin: `${cx}px ${cy}px` }}
        initial={{ rotate: -90 - currentQ.midDeg }}
        animate={{ rotate: 0 }}
        transition={{ type: "spring", stiffness: 80, damping: 14, delay: 0.15 }}
      >
        {/* Halo branco pra contrastar com o fill colorido */}
        <line
          x1={cx} y1={cy} x2={handX} y2={handY}
          stroke="white"
          strokeWidth={2.5}
          strokeLinecap="round"
        />
        <line
          x1={cx} y1={cy} x2={handX} y2={handY}
          stroke={currentMeta.color}
          strokeWidth={1.25}
          strokeLinecap="round"
        />
        {/* Cabeça do ponteiro */}
        <circle
          cx={handX} cy={handY} r={2.5}
          fill={currentMeta.color}
          stroke="white"
          strokeWidth={1}
        />
      </motion.g>

      {/* Pino central */}
      <circle cx={cx} cy={cy} r={3.5}
              fill="white"
              stroke={currentMeta.color} strokeWidth={1.5} />
      <circle cx={cx} cy={cy} r={1}
              fill={currentMeta.color} />
    </svg>
  );
}

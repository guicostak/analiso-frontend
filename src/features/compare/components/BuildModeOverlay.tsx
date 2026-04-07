"use client";

/**
 * BuildModeOverlay
 *
 * Card flutuante exibido enquanto o "Modo Lego" monta a tela de comparação.
 * Mostra o avatar do Luiz, a etapa atual e uma barra de progresso fina.
 *
 * - Posicionado fixo no canto inferior direito
 * - Fade in/out via motion/AnimatePresence
 * - aria-live="polite" para leitores de tela
 * - Auto-esconde 600ms depois de `isComplete`
 */

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { LuizAvatar } from "@/src/features/luiz/components/LuizAvatar";

interface BuildModeOverlayProps {
  /** Visível enquanto a sequência está em andamento. */
  isBuilding: boolean;
  /** True quando todas as ilhas já foram reveladas. */
  isComplete: boolean;
  /** Progresso 0–1. */
  progress: number;
  /** Rótulo amigável da etapa atual (vem do `beatLabel` do BuildStep). */
  currentStepLabel: string | null;
}

export function BuildModeOverlay({
  isBuilding,
  isComplete,
  progress,
  currentStepLabel,
}: BuildModeOverlayProps) {
  const [visible, setVisible] = useState(false);

  // Mostra enquanto monta; some 600ms após completar
  useEffect(() => {
    if (isBuilding) {
      setVisible(true);
      return;
    }
    if (isComplete) {
      const t = setTimeout(() => setVisible(false), 600);
      return () => clearTimeout(t);
    }
  }, [isBuilding, isComplete]);

  const stepLabel = currentStepLabel ?? "Iniciando";
  const pct = Math.round(progress * 100);

  return (
    <AnimatePresence>
      {visible && (
        <div className="pointer-events-none fixed inset-0 z-40 flex items-end justify-end p-5">
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.98 }}
            transition={{ type: "spring", stiffness: 260, damping: 24 }}
            role="status"
            aria-live="polite"
            className="pointer-events-auto w-[280px] overflow-hidden rounded-[18px] border border-border bg-card shadow-[0_24px_48px_rgba(15,23,40,0.18)]"
          >
            <div className="flex items-center gap-3 px-4 py-3">
              <LuizAvatar size="sm" showStatus />
              <div className="min-w-0 flex-1">
                <p className="truncate text-[12px] font-semibold text-foreground">
                  {isComplete ? "Pronto!" : "Luiz está montando sua comparação"}
                </p>
                <p className="truncate text-[11px] text-muted-foreground">
                  {isComplete ? "Tela montada" : `Encaixando: ${stepLabel}`}
                </p>
              </div>
              <span className="shrink-0 text-[10px] font-semibold tabular-nums text-muted-foreground">
                {pct}%
              </span>
            </div>
            {/* Barra de progresso */}
            <div className="h-[3px] w-full bg-muted">
              <motion.div
                className="h-full bg-gradient-to-r from-[#EC4899] via-[#A855F7] to-[#06B6D4]"
                initial={{ width: 0 }}
                animate={{ width: `${pct}%` }}
                transition={{ type: "tween", duration: 0.4, ease: "easeOut" }}
              />
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

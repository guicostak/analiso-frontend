"use client";

/**
 * useBuildMode
 *
 * Hook orquestrador da animação cinematográfica "Modo Lego" da página de
 * comparação. Recebe uma sequência de "steps" (ilhas) com delays customizados
 * por etapa, permitindo agrupar revelações em beats narrativos:
 *
 *   Beat 1 — palco       (revelações simultâneas, delay curto)
 *   Beat 2 — vencedor    (drama, pausa antes + scroll anchor)
 *   Beat 3 — pilares     (cascata acelerando)
 *   Beat 4 — detalhes    (finale)
 *
 * Cada step pode marcar `scrollAnchor: true` para disparar auto-scroll quando
 * for revelado. O callback `onStepReveal` é chamado a cada etapa, permitindo
 * que o consumidor (ComparePage) execute side-effects como scroll.
 *
 * - Respeita prefers-reduced-motion (revela tudo imediatamente)
 * - Não inicia até `enabled === true`
 * - Cleanup completo de timers no unmount
 * - "Fire once" via ref — não reinicia se enabled oscilar
 */

import { useCallback, useEffect, useRef, useState } from "react";

/** Definição de uma etapa da sequência de revelação. */
export interface BuildStep {
  /** ID da ilha (deve bater com o id do DOM e/ou helper renderIsland). */
  id: string;
  /** Atraso desde a etapa anterior (ou desde initialDelay para a primeira). */
  delay: number;
  /** Se true, dispara auto-scroll quando a ilha for revelada. */
  scrollAnchor?: boolean;
  /** Rótulo amigável para o overlay de progresso. */
  beatLabel?: string;
}

interface UseBuildModeOptions {
  /** Quando true, inicia a sequência (uma única vez por mount). */
  enabled: boolean;
  /** Sequência ordenada de steps. */
  steps: readonly BuildStep[];
  /** Atraso antes do primeiro reveal (default 200ms). */
  initialDelay?: number;
  /** Hold final entre o último reveal e o onComplete (default 600ms). */
  finishHold?: number;
  /** Callback chamado a cada step revelado, com índice. */
  onStepReveal?: (step: BuildStep, index: number) => void;
  /** Callback chamado quando a sequência termina. */
  onComplete?: () => void;
}

interface UseBuildModeResult {
  /** True se a ilha já foi revelada. */
  isRevealed: (id: string) => boolean;
  /** Índice da etapa atual (0-based; -1 antes de começar). */
  currentStep: number;
  /** Step atual (ou null). */
  currentStepData: BuildStep | null;
  /** Progresso 0–1. */
  progress: number;
  /** True enquanto a sequência está em andamento. */
  isBuilding: boolean;
  /** True após a última etapa ser revelada. */
  isComplete: boolean;
}

export function useBuildMode({
  enabled,
  steps,
  initialDelay = 200,
  finishHold = 600,
  onStepReveal,
  onComplete,
}: UseBuildModeOptions): UseBuildModeResult {
  const [revealedCount, setRevealedCount] = useState(0);
  const [hasStarted, setHasStarted] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  // Refs para evitar reinício quando callbacks/props mudam
  const startedRef = useRef(false);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const onStepRevealRef = useRef(onStepReveal);
  const onCompleteRef = useRef(onComplete);
  onStepRevealRef.current = onStepReveal;
  onCompleteRef.current = onComplete;

  const totalSteps = steps.length;

  const clearAllTimers = useCallback(() => {
    timersRef.current.forEach((t) => clearTimeout(t));
    timersRef.current = [];
  }, []);

  useEffect(() => {
    if (startedRef.current) return;
    if (!enabled) return;
    if (totalSteps === 0) return;

    startedRef.current = true;
    setHasStarted(true);

    // Reduced motion: revela tudo de uma vez
    const reduced =
      typeof window !== "undefined" &&
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reduced) {
      setRevealedCount(totalSteps);
      setIsComplete(true);
      const t = setTimeout(() => onCompleteRef.current?.(), 0);
      timersRef.current.push(t);
      return;
    }

    // Calcula timestamps absolutos cumulativos baseado em initialDelay + steps[i].delay
    let cumulative = initialDelay;
    for (let i = 0; i < totalSteps; i++) {
      cumulative += steps[i].delay;
      const stepIndex = i;
      const stepData = steps[i];
      const t = setTimeout(() => {
        setRevealedCount(stepIndex + 1);
        onStepRevealRef.current?.(stepData, stepIndex);
        if (stepIndex === totalSteps - 1) {
          // Hold final para o último spring assentar antes de marcar completo
          const finishT = setTimeout(() => {
            setIsComplete(true);
            onCompleteRef.current?.();
          }, finishHold);
          timersRef.current.push(finishT);
        }
      }, cumulative);
      timersRef.current.push(t);
    }

    return () => {
      clearAllTimers();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, totalSteps]);

  // Cleanup global no unmount
  useEffect(() => {
    return () => clearAllTimers();
  }, [clearAllTimers]);

  const isRevealed = useCallback(
    (id: string) => {
      // O(n) mas n <= 11 — irrelevante. Evita criar Set a cada render.
      for (let i = 0; i < revealedCount; i++) {
        if (steps[i].id === id) return true;
      }
      return false;
    },
    [revealedCount, steps],
  );

  const currentStep = revealedCount - 1;
  const currentStepData =
    currentStep >= 0 && currentStep < totalSteps ? steps[currentStep] : null;
  const progress = totalSteps > 0 ? revealedCount / totalSteps : 0;
  const isBuilding = hasStarted && !isComplete;

  return {
    isRevealed,
    currentStep,
    currentStepData,
    progress,
    isBuilding,
    isComplete,
  };
}

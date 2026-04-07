"use client";

/**
 * BuildModeTypingIntro
 *
 * Overlay cinematográfico que abre o "Modo Lego". Simula o Luiz "digitando" os
 * dois tickers escolhidos pelo usuário antes da sequência de revelação começar.
 *
 * - Aparece sobre o conteúdo (z-30) com um backdrop blur sutil
 * - Cada ticker é digitado char-a-char (~70ms por caractere)
 * - Tickers digitados em paralelo (não em série) → ~600ms total de digitação
 * - Hold final de 350ms para o usuário registrar o momento
 * - Total: ~1000ms, depois chama onComplete e desaparece com fade
 * - Respeita prefers-reduced-motion: pula direto para onComplete
 */

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { LuizAvatar } from "@/src/features/luiz/components/LuizAvatar";

interface BuildModeTypingIntroProps {
  /** Tickers a "digitar". Espera-se exatamente 2. */
  tickers: readonly string[];
  /** Nome amigável de cada empresa, indexado por ticker. */
  companyNames?: Record<string, string>;
  /** Logos por ticker (URL). */
  companyLogos?: Record<string, string>;
  /** Chamado quando a animação termina (ou imediatamente em reduced motion). */
  onComplete: () => void;
}

const CHAR_INTERVAL_MS = 110;
const HOLD_AFTER_TYPING_MS = 700;
const FADE_OUT_MS = 320;

export function BuildModeTypingIntro({
  tickers,
  companyNames,
  companyLogos,
  onComplete,
}: BuildModeTypingIntroProps) {
  const [typed, setTyped] = useState<string[]>(() => tickers.map(() => ""));
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    // Reduced motion: pula direto
    const reduced =
      typeof window !== "undefined" &&
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reduced) {
      setTyped(tickers.map((t) => t));
      const t = setTimeout(() => {
        setVisible(false);
        onComplete();
      }, 0);
      return () => clearTimeout(t);
    }

    const timers: ReturnType<typeof setTimeout>[] = [];
    const longestLen = tickers.reduce((m, t) => Math.max(m, t.length), 0);

    // Digita char-a-char em paralelo para todos os tickers
    for (let i = 0; i < longestLen; i++) {
      const t = setTimeout(() => {
        setTyped((prev) =>
          prev.map((cur, idx) => {
            const target = tickers[idx] ?? "";
            return target.slice(0, Math.min(i + 1, target.length));
          }),
        );
      }, (i + 1) * CHAR_INTERVAL_MS);
      timers.push(t);
    }

    // Hold + onComplete + fade out
    const totalTyping = longestLen * CHAR_INTERVAL_MS;
    const completeT = setTimeout(() => {
      setVisible(false);
      // Aguarda o fade-out antes de avisar o consumidor para iniciar o build,
      // dando ao olho do usuário tempo de transição entre os dois momentos.
      const finishT = setTimeout(() => onComplete(), FADE_OUT_MS);
      timers.push(finishT);
    }, totalTyping + HOLD_AFTER_TYPING_MS);
    timers.push(completeT);

    return () => {
      timers.forEach((t) => clearTimeout(t));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="typing-intro"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.28, ease: "easeOut" }}
          className="pointer-events-none fixed inset-0 z-[60] flex items-center justify-center"
          aria-hidden="true"
        >
          {/* Backdrop forte para o card destacar */}
          <div className="absolute inset-0 bg-background/75 backdrop-blur-[6px]" />

          {/* Card central */}
          <motion.div
            initial={{ y: -20, scale: 0.94, opacity: 0 }}
            animate={{ y: 0, scale: 1, opacity: 1 }}
            exit={{ y: -10, scale: 0.97, opacity: 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 24 }}
            className="relative flex w-[520px] max-w-[92vw] items-center gap-5 rounded-[26px] border border-border bg-card px-6 py-5 shadow-[0_40px_80px_rgba(15,23,40,0.32)]"
          >
            <LuizAvatar size="lg" showStatus />
            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                Luiz está montando sua tela
              </p>
              <p className="mt-1 truncate text-[16px] font-semibold text-foreground">
                Selecionando as empresas…
              </p>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                {tickers.map((ticker, idx) => {
                  const shown = typed[idx] ?? "";
                  const isFull = shown.length === ticker.length;
                  const logo = companyLogos?.[ticker];
                  return (
                    <span key={ticker} className="inline-flex items-center gap-2">
                      {idx > 0 && (
                        <span className="text-[13px] font-semibold text-muted-foreground">vs</span>
                      )}
                      <span
                        className={`inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-[14px] font-semibold tabular-nums transition-all ${
                          isFull
                            ? "border-brand bg-brand/10 text-brand shadow-[0_0_0_3px_rgba(91,141,239,0.10)]"
                            : "border-dashed border-border bg-muted text-foreground"
                        }`}
                      >
                        {isFull && logo ? (
                          <img
                            src={logo}
                            alt={ticker}
                            className="h-[20px] w-[20px] rounded-full border border-border bg-muted object-cover"
                          />
                        ) : null}
                        <span className="font-mono">
                          {shown}
                          {!isFull && (
                            <span className="ml-[1px] inline-block h-[14px] w-[2px] animate-pulse bg-current align-middle" />
                          )}
                        </span>
                      </span>
                    </span>
                  );
                })}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

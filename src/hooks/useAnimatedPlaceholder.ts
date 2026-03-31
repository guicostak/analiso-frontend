"use client";

import { useEffect, useRef, useState } from "react";

const PLACEHOLDER_TEXTS = [
  "PETR4",
  "Vale3",
  "Petrobras",
  "ITUB4",
  "Magazine Luiza",
  "Banco do Brasil",
  "MGLU3",
  "Nubank",
];

const TYPING_SPEED   = 80;   // ms por caractere ao digitar
const DELETING_SPEED = 40;   // ms por caractere ao apagar
const PAUSE_AFTER    = 1500; // ms após texto completo
const PAUSE_BEFORE   = 300;  // ms antes do próximo texto

/**
 * useAnimatedPlaceholder
 *
 * Retorna um texto que simula estar sendo digitado/apagado em sequência.
 * Ativo apenas quando `isActive === true` (input vazio e sem foco).
 */
export function useAnimatedPlaceholder(isActive: boolean): string {
  const [displayed,    setDisplayed]    = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isDeleting,   setIsDeleting]   = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    if (!isActive) {
      setDisplayed("");
      clearTimeout(timeoutRef.current);
      return;
    }

    const current = PLACEHOLDER_TEXTS[currentIndex];

    if (!isDeleting && displayed === current) {
      timeoutRef.current = setTimeout(() => setIsDeleting(true), PAUSE_AFTER);
      return;
    }

    if (isDeleting && displayed === "") {
      timeoutRef.current = setTimeout(() => {
        setIsDeleting(false);
        setCurrentIndex((i) => (i + 1) % PLACEHOLDER_TEXTS.length);
      }, PAUSE_BEFORE);
      return;
    }

    const next = isDeleting
      ? current.slice(0, displayed.length - 1)
      : current.slice(0, displayed.length + 1);

    timeoutRef.current = setTimeout(
      () => setDisplayed(next),
      isDeleting ? DELETING_SPEED : TYPING_SPEED,
    );

    return () => clearTimeout(timeoutRef.current);
  }, [displayed, isDeleting, currentIndex, isActive]);

  return displayed;
}

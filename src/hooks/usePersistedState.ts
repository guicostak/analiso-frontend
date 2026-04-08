"use client";

/**
 * usePersistedState
 *
 * `useLocalStorageState<T>` — variante de `useState` cujo valor é persistido
 * em `window.localStorage`. SSR-safe: na primeira renderização devolve o
 * `initial`, e só lê do storage dentro de um `useEffect` (após hidratação),
 * evitando mismatches.
 *
 * Uso:
 *   const [value, setValue] = useLocalStorageState("my-key", { foo: 1 });
 */

import { useCallback, useEffect, useRef, useState } from "react";

type Updater<T> = T | ((prev: T) => T);

export function useLocalStorageState<T>(
  key: string,
  initial: T,
): [T, (next: Updater<T>) => void] {
  const [value, setValue] = useState<T>(initial);
  const hasHydratedRef = useRef(false);

  // Carrega do storage uma única vez, após o mount.
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(key);
      if (raw !== null) {
        setValue(JSON.parse(raw) as T);
      }
    } catch {
      // ignore parse/storage errors
    } finally {
      hasHydratedRef.current = true;
    }
    // Apenas no mount — mudanças posteriores na key não recarregam.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Persiste qualquer alteração após a hidratação inicial.
  useEffect(() => {
    if (!hasHydratedRef.current) return;
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // ignore storage errors
    }
  }, [key, value]);

  const update = useCallback((next: Updater<T>) => {
    setValue((prev) =>
      typeof next === "function" ? (next as (prev: T) => T)(prev) : next,
    );
  }, []);

  return [value, update];
}

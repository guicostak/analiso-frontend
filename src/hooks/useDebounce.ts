"use client";

import { useEffect, useState } from "react";

/**
 * useDebounce
 *
 * Retorna o valor atrasado em `delay` ms após a última mudança.
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}

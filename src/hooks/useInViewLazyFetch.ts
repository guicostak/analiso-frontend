"use client";

/**
 * useInViewLazyFetch
 *
 * Dispara um fetcher uma única vez quando o elemento referenciado entra na
 * viewport (threshold 0.1). Útil para ilhas do dashboard que devem postergar
 * sua carga inicial até serem visíveis.
 *
 * Uso:
 *   const ref = useRef<HTMLDivElement>(null);
 *   useInViewLazyFetch(ref, async () => { ... });
 */

import { useEffect, useRef } from "react";

export function useInViewLazyFetch<E extends Element>(
  ref: React.RefObject<E | null>,
  fetcher: () => void | Promise<void>,
): void {
  const triggeredRef = useRef(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    if (triggeredRef.current) return;
    if (typeof window === "undefined" || typeof IntersectionObserver === "undefined") {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting && !triggeredRef.current) {
            triggeredRef.current = true;
            void fetcher();
            observer.disconnect();
            break;
          }
        }
      },
      { threshold: 0.1 },
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [ref, fetcher]);
}

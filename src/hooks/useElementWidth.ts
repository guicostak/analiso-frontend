"use client";

/**
 * useElementWidth
 *
 * Mede a largura RENDERIZADA de um elemento via ResizeObserver. Útil pra
 * componentes que precisam saber seu tamanho efetivo (ex: SVGs com
 * `width` declarado, charts que escalam por viewBox, etc).
 *
 * Uso:
 *   const [ref, width] = useElementWidth();
 *   return <div ref={ref}>{width > 0 && <Chart width={width} />}</div>;
 *
 * Retorna 0 antes da primeira medição — o caller pode esperar até `width > 0`
 * pra renderizar conteúdo dependente de tamanho.
 */

import { useEffect, useRef, useState } from "react";

export function useElementWidth<T extends HTMLElement = HTMLDivElement>(): readonly [
  React.RefObject<T | null>,
  number,
] {
  const ref = useRef<T | null>(null);
  const [width, setWidth] = useState<number>(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Inicializa com o tamanho atual antes do primeiro callback do observer
    // (evita 1 frame com width=0 → flicker em conteúdo dependente).
    setWidth(el.getBoundingClientRect().width);

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) return;
      // contentRect ignora padding/border — usamos border-box pra incluir
      // bordas se houver. `inlineSize` é o eixo horizontal (largura em LTR).
      const w =
        entry.borderBoxSize?.[0]?.inlineSize ?? entry.contentRect.width;
      setWidth(w);
    });
    observer.observe(el);

    return () => observer.disconnect();
  }, []);

  return [ref, width] as const;
}

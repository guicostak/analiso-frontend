"use client";

/**
 * IslandSkeleton
 *
 * Placeholder genérico exibido enquanto o chunk JS de uma ilha é baixado
 * via `next/dynamic` (loading state). Ocupa a célula inteira do grid
 * pra manter o layout estável — sem CLS (Cumulative Layout Shift) quando
 * a ilha real renderiza.
 *
 * Pulse sutil pra sinalizar carregamento. Sem branding/ícone — o skeleton
 * é genérico e deve sumir rápido (chunks pré-warmados durante a tela de
 * loading do dashboard).
 */
export function IslandSkeleton() {
  return (
    <div
      className="
        h-full w-full animate-pulse rounded-[24px] border border-border
        bg-card/60 shadow-[0_14px_30px_rgba(15,23,40,0.04)] dark:shadow-none
      "
      aria-hidden="true"
    />
  );
}

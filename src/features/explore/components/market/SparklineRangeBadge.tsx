"use client";

/**
 * Badge pequeno, neutro, que acompanha uma sparkline indicando o range
 * temporal que ela representa.
 *
 * Dois modos:
 *  • dynamic — recebe o range atual controlado pelo toggle (1D/1S/1M/YTD/1A)
 *  • fixed   — recebe um label literal para gráficos que não seguem o toggle
 *              (ex.: indicadores macro mensais com janela estática de 24m)
 *
 * Segue design_skill:
 *  - tokens semânticos (sem hex)
 *  - label em uppercase com tracking-wider (padrão metadata/caption)
 *  - hierarquia baixa: não rouba atenção do valor principal
 *  - tabular-nums para consistência em grids
 *  - border + bg-muted sutil → "etiqueta neutra"
 */

import type { MarketTimeRange } from "../../interfaces/market.interfaces";

interface SparklineRangeBadgeProps {
  /** Range atual do toggle. Ignorado se `fixed` estiver setado. */
  range?: MarketTimeRange | null;
  /** Label literal para gráficos não controlados pelo toggle. */
  fixed?: string;
  /** Tamanho visual. `xs` é o default e serve pra grids densos. */
  size?: "xs" | "sm";
  /** Classe extra opcional para controle de posicionamento pelo pai. */
  className?: string;
}

const RANGE_LABEL: Record<MarketTimeRange, string> = {
  "1D":  "1D",
  "1W":  "1S",
  "1M":  "1M",
  "YTD": "YTD",
  "1Y":  "1A",
};

const SIZE_CLASS: Record<"xs" | "sm", string> = {
  xs: "text-[9px] px-1.5 py-[1px]",
  sm: "text-[10px] px-2 py-0.5",
};

export function SparklineRangeBadge({
  range,
  fixed,
  size = "xs",
  className = "",
}: SparklineRangeBadgeProps) {
  const label = fixed ?? (range ? RANGE_LABEL[range] : null);
  if (!label) return null;

  return (
    <span
      className={`
        inline-flex shrink-0 items-center rounded-full border border-border bg-muted/70
        font-medium uppercase tracking-wider text-muted-foreground tabular-nums
        ${SIZE_CLASS[size]} ${className}
      `}
      aria-label={`Janela temporal do gráfico: ${label}`}
    >
      {label}
    </span>
  );
}

"use client";

/**
 * Ícone "i" discreto que revela uma explicação curta do dado em hover/foco/tap.
 *
 * - Usa a primitiva Radix do projeto (components/ui/tooltip) — a11y grátis
 * - Ícone muted-foreground em tamanho pequeno; não rouba atenção do valor
 * - Conteúdo em max-w-[260px] pra não esticar em explicações longas
 * - Trigger é <button> → focus ring nativo do projeto, keyboard OK
 *
 * Uso:
 *   <InfoTooltip label="VIX" content="Volatilidade implícita de 30d do S&P..." />
 */

import type { ReactNode } from "react";
import { Info } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/src/components/ui/tooltip";

interface InfoTooltipProps {
  /** Texto ou JSX exibido no tooltip. */
  content: ReactNode;
  /** aria-label do botão — default "Mais informações". Use label do dado p/ contexto. */
  label?: string;
  /** Tamanho do ícone (default 12). */
  size?: number;
  /** Classe extra pra ajuste fino de posicionamento. */
  className?: string;
  /** Lado do tooltip (default 'top'). */
  side?: "top" | "right" | "bottom" | "left";
  /** Classe aplicada ao TooltipContent — útil pra sobrescrever max-width em conteúdos ricos. */
  contentClassName?: string;
}

export function InfoTooltip({
  content,
  label = "Mais informações",
  size = 12,
  className = "",
  side = "top",
  contentClassName = "max-w-[260px] whitespace-normal text-balance leading-relaxed",
}: InfoTooltipProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          aria-label={label}
          className={`
            inline-flex shrink-0 items-center justify-center
            text-muted-foreground/70 hover:text-foreground
            transition-colors duration-150
            focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring
            rounded-full
            ${className}
          `}
        >
          <Info size={size} />
        </button>
      </TooltipTrigger>
      <TooltipContent side={side} className={contentClassName}>
        {content}
      </TooltipContent>
    </Tooltip>
  );
}

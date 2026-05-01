"use client";

/**
 * IslandShell — Card padrão para todas as ilhas do `DashboardCanvas`.
 *
 * Replica o template visual usado nas ilhas da Watchlist (rounded-[24px],
 * header com `<icon/> + <h3/>`, slot direito opcional para controles, e
 * tooltip "i" para explicar o conteúdo). Centraliza o layout para que toda
 * ilha seja consistente — basta o desenvolvedor passar título e conteúdo.
 *
 * Variantes:
 *  - default: padding `p-5`, header padronizado.
 *  - flush:   sem padding interno; útil quando a ilha tem header próprio
 *             com `border-b` (ex: feed com cabeçalho-banner).
 */

import { ReactNode } from "react";
import { Info } from "lucide-react";
import { cn } from "@/src/components/ui/utils";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/src/components/ui/tooltip";

export interface IslandShellProps {
  /** Ícone do header — geralmente um `LucideIcon` `h-4 w-4 text-muted-foreground`. */
  icon?: ReactNode;
  /** Título da ilha (h3, 13px semibold). */
  title: ReactNode;
  /** Conteúdo do slot direito do header (controles, link "Ver tudo", etc).
   *  Quando presente, o `info` não é renderizado automaticamente — passe-o
   *  manualmente dentro do `right` se quiser. */
  right?: ReactNode;
  /** Texto curto pra tooltip do "i". Se ausente, o ícone não aparece. */
  info?: string;
  /** Conteúdo principal da ilha. */
  children: ReactNode;
  /** Sem padding interno + sem header automático (ilha controla layout). */
  flush?: boolean;
  /** Classes extras pro article externo. */
  className?: string;
}

export function IslandShell({
  icon,
  title,
  right,
  info,
  children,
  flush = false,
  className,
}: IslandShellProps) {
  return (
    <article
      className={cn(
        "flex h-full w-full flex-col rounded-[24px] border border-border bg-card shadow-[0_14px_30px_rgba(15,23,40,0.04)] dark:shadow-none",
        flush ? "overflow-hidden" : "p-5",
        className,
      )}
    >
      {!flush && (
        <header className="mb-4 flex items-start justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            {icon}
            <h3 className="truncate text-[13px] font-semibold text-foreground">{title}</h3>
          </div>
          <div className="flex flex-shrink-0 items-center gap-2">
            {right}
            {info && <IslandInfoHint text={info} />}
          </div>
        </header>
      )}
      {children}
    </article>
  );
}

/** Ícone "i" com tooltip funcional. Reutilizado entre ilhas e cards. */
export function IslandInfoHint({
  text,
  label = "Mais informações",
}: {
  text: string;
  label?: string;
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          aria-label={label}
          className="inline-flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full text-muted-foreground/60 transition-colors hover:bg-muted hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-brand/40"
        >
          <Info className="h-3.5 w-3.5" strokeWidth={2} />
        </button>
      </TooltipTrigger>
      <TooltipContent
        side="top"
        align="end"
        sideOffset={6}
        className="max-w-[280px] whitespace-normal text-left leading-relaxed"
      >
        {text}
      </TooltipContent>
    </Tooltip>
  );
}

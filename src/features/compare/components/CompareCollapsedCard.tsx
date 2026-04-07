"use client";

/**
 * CompareCollapsedCard
 *
 * Versão "slim" de uma ilha da tela de comparação. Usado pelo modo de
 * Progressive Disclosure após o build mode terminar (categoria "todas"):
 * em vez de manter 7 cards densos abertos simultaneamente, mostramos
 * apenas as 4 ilhas core expandidas e colapsamos as secundárias em
 * cards de ~80px que o usuário expande sob demanda.
 *
 * Vieses ativados:
 *  - Lei de Hick ↓ (menos opções visíveis simultaneamente)
 *  - Curiosity Gap (cada card colapsado é uma promessa de leitura)
 *  - Progressive Disclosure (Nielsen)
 */

import { ChevronRight, type LucideIcon } from "lucide-react";

interface CompareCollapsedCardProps {
  id: string;
  title: string;
  icon: LucideIcon;
  /** Frase curta de resumo (geralmente vem do narrative.headline). */
  summary: string;
  onExpand: () => void;
}

export function CompareCollapsedCard({
  id,
  title,
  icon: Icon,
  summary,
  onExpand,
}: CompareCollapsedCardProps) {
  return (
    <button
      id={id}
      onClick={onExpand}
      className="group flex w-full items-center gap-4 rounded-[20px] border border-border bg-card px-5 py-4 text-left transition-all hover:-translate-y-0.5 hover:border-brand hover:shadow-[0_8px_20px_rgba(15,23,40,0.06)] dark:hover:shadow-none scroll-mt-[160px]"
    >
      <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-brand-surface">
        <Icon className="h-5 w-5 text-brand-text" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[14px] font-semibold text-foreground">{title}</p>
        <p className="mt-0.5 truncate text-[12px] text-muted-foreground">
          {summary}
        </p>
      </div>
      <span className="inline-flex shrink-0 items-center gap-1 text-[12px] font-medium text-muted-foreground transition group-hover:gap-1.5 group-hover:text-brand-text">
        Ver detalhes
        <ChevronRight className="h-3.5 w-3.5" />
      </span>
    </button>
  );
}

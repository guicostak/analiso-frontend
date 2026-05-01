"use client";

/**
 * SectionCategoryTag
 *
 * Marcador semântico + visual aplicado no topo de cada "ilha" (card/panel)
 * para indicar a que categoria de seção ela pertence — ex: todas as ilhas
 * da aba "Contexto de mercado" levam o globo + label.
 *
 * Objetivos:
 * 1. **Visual**: reforça pro usuário que widgets aparentemente independentes
 *    (ribbon, risk panel, macro BR, etc.) são parte de um mesmo "chapéu" —
 *    a seção Contexto — mesmo quando consumidos isoladamente.
 * 2. **Rastreamento**: o `data-section-category` permite no futuro (dashboard,
 *    analytics, customização) agrupar/filtrar widgets pela sua categoria de
 *    origem sem hardcoding de listas em cada caller.
 *
 * Padronizado via ícone Lucide + label curto. Super discreto — não compete
 * com o título da ilha, serve como contexto sutil.
 */

import type { LucideIcon } from "lucide-react";

interface SectionCategoryTagProps {
  /** Ícone Lucide da categoria (ex: Globe para "Contexto", TrendingUp para "Movimentos"). */
  icon: LucideIcon;
  /**
   * Label semântico — NÃO é renderizado visualmente (decisão de design: visual minimalista
   * com ícone-only). Permanece como `aria-label` e `title` pra acessibilidade/leitor de tela.
   */
  label: string;
  /** Identificador estável da categoria (vai no data-attr). Ex: "contexto-mercado". */
  categoryId: string;
  /** Classe adicional pra ajuste fino de margin/spacing no caller. */
  className?: string;
  /**
   * Modo "silent": preserva `data-section-category` pra rastreamento/analytics
   * sem renderizar visual ou expor texto pra leitor de tela. Usado em sub-células
   * onde o marcador já está presente no header da ilha, evitando ruído visual
   * (e repetição do label em screen readers).
   *
   * UX heuristics: "Signal-to-noise ratio determines usability — when everything
   * screams for attention, nothing stands out". Um tag por seção basta.
   */
  silent?: boolean;
}

export function SectionCategoryTag({
  icon: Icon,
  label,
  categoryId,
  className = "",
  silent = false,
}: SectionCategoryTagProps) {
  if (silent) {
    return (
      <span
        data-section-category={categoryId}
        aria-hidden="true"
        className="hidden"
      />
    );
  }
  return (
    <span
      data-section-category={categoryId}
      aria-label={label}
      title={label}
      className={`inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-border bg-muted/40 text-muted-foreground ${className}`}
    >
      <Icon className="h-3 w-3" aria-hidden="true" />
    </span>
  );
}

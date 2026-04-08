/**
 * Tipos da camada de layout personalizável da tela de Comparação.
 *
 * A "customização" aqui é deliberadamente simples: uma lista ordenada de IDs
 * de ilha e um conjunto de IDs ocultos. Não há grid 2D, não há resize manual.
 * Esse formato é:
 *   1) suficiente para a Fase 1 (reorder + ocultar manualmente via drawer)
 *   2) suficiente para a Fase 3 (Luiz aplica templates e patches via tools)
 *   3) 100% reaproveitado entre as duas fases — templates são só presets de
 *      {order, hidden}, sem nenhum conceito novo de posicionamento.
 */

/** ID estável de uma ilha da tela de comparação. */
export type CompareIslandId =
  | "narrative"
  | "snowflake"
  | "verdict"
  | "top-factors"
  | "valuation"
  | "growth"
  | "past"
  | "health"
  | "dividend"
  | "metrics"
  | "timeline";

/**
 * Estado persistido do layout do usuário.
 *
 * `version` existe para permitir migrações futuras sem quebrar layouts salvos
 * quando o registry ganhar/perder ilhas. Na leitura, qualquer ID desconhecido
 * é descartado e qualquer ID conhecido que não esteja em `order` é adicionado
 * ao final automaticamente — o usuário nunca perde acesso a uma ilha nova.
 */
export interface CompareLayoutState {
  version: 1;
  /** Ordem atual das ilhas (IDs válidos, sem duplicatas). */
  order: CompareIslandId[];
  /** IDs ocultados pelo usuário. */
  hidden: CompareIslandId[];
  /** Nome do template atualmente aplicado, se houver. `null` = layout custom. */
  templateId: string | null;
}

/**
 * Template pré-fabricado de layout, escolhido pelo desenvolvedor para
 * representar uma "intenção" (foco em valuation, foco em dividendos, etc).
 *
 * Um template NÃO é um layout 2D — é simplesmente um preset de `order`
 * e uma lista de IDs visíveis. Quem consome um template materializa ele
 * em `CompareLayoutState` via `applyTemplate` do hook.
 */
export interface CompareTemplate {
  id: string;
  name: string;
  description: string;
  /** Ordem das ilhas visíveis. Qualquer ilha fora dessa lista fica oculta. */
  visibleOrder: CompareIslandId[];
}

/**
 * Templates de layout pré-fabricados.
 *
 * Cada template é uma combinação curada de ordem + visibilidade, desenhada
 * para um "foco" específico de análise. Eles servem duas frentes:
 *
 *  1) O drawer de customização pode oferecer como "pontos de partida"
 *  2) O Luiz pode aplicar via tool `apply_compare_template(templateId)`
 *     quando o usuário diz "reorganiza a tela pra focar em dividendos"
 *
 * IMPORTANTE: templates só listam as ilhas VISÍVEIS, na ordem desejada.
 * Ilhas fora da lista ficam ocultas automaticamente quando o template
 * é aplicado. Isso torna trivial construir presets "limpos".
 */

import type { CompareTemplate, CompareIslandId } from "./types";
import { DEFAULT_ISLAND_ORDER } from "./islandRegistry";

export const COMPARE_TEMPLATES: Record<string, CompareTemplate> = {
  default: {
    id: "default",
    name: "Visão completa",
    description: "Todas as ilhas na ordem narrativa clássica",
    visibleOrder: [...DEFAULT_ISLAND_ORDER],
  },

  valuationFocus: {
    id: "valuationFocus",
    name: "Foco em valuation",
    description: "Ideal pra decidir se está barato ou caro",
    visibleOrder: [
      "narrative",
      "valuation",
      "verdict",
      "snowflake",
      "metrics",
      "past",
    ],
  },

  dividendFocus: {
    id: "dividendFocus",
    name: "Foco em dividendos",
    description: "Pra quem busca renda passiva e consistência",
    visibleOrder: [
      "narrative",
      "dividend",
      "health",
      "verdict",
      "past",
      "metrics",
    ],
  },

  quickCompare: {
    id: "quickCompare",
    name: "Comparação rápida",
    description: "Só o essencial em menos de 1 minuto",
    visibleOrder: ["narrative", "verdict", "snowflake", "top-factors"],
  },

  deepDive: {
    id: "deepDive",
    name: "Análise profunda",
    description: "Tudo, com ênfase em fundamentos e histórico",
    visibleOrder: [
      "narrative",
      "verdict",
      "top-factors",
      "valuation",
      "growth",
      "past",
      "health",
      "dividend",
      "snowflake",
      "metrics",
      "timeline",
    ],
  },
};

/** Ordem em que os templates aparecem na UI. */
export const TEMPLATE_ORDER: readonly string[] = [
  "default",
  "quickCompare",
  "valuationFocus",
  "dividendFocus",
  "deepDive",
];

/** Recupera um template pelo ID (ou `null` se não existir). */
export function getTemplate(id: string): CompareTemplate | null {
  return COMPARE_TEMPLATES[id] ?? null;
}

/**
 * Cria um template DINÂMICO a partir de "focos" semânticos.
 *
 * Usado pelo Luiz quando o usuário pede algo que não bate em nenhum preset
 * fixo (ex: "foca em valuation e crescimento"). O Luiz passa as categorias
 * e a ordem prioritária das ilhas; o resto vira hidden.
 *
 * Essa função intencionalmente não deixa o Luiz "quebrar" a tela: ela só
 * compõe a partir de IDs válidos que já existem.
 */
export function buildDynamicTemplate(
  visibleOrder: CompareIslandId[],
  options: { name?: string; description?: string } = {},
): CompareTemplate {
  // Dedup preservando ordem de primeira aparição
  const seen = new Set<CompareIslandId>();
  const dedup: CompareIslandId[] = [];
  for (const id of visibleOrder) {
    if (seen.has(id)) continue;
    seen.add(id);
    dedup.push(id);
  }
  return {
    id: "custom",
    name: options.name ?? "Layout personalizado",
    description: options.description ?? "Configuração montada sob medida",
    visibleOrder: dedup,
  };
}

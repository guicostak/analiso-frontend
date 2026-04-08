/**
 * Registry central das ilhas da tela de Comparação.
 *
 * Mapeia cada ID de ilha para:
 *   - `label`: nome amigável exibido no drawer de customização e em comandos
 *   - `shortLabel`: versão curta usada no `beatLabel` do BuildMode
 *   - `category`: usada pelo Luiz para mapear "focos" semânticos
 *                 ("foco em valuation" -> ilhas com category "valuation")
 *
 * IMPORTANTE: a ordem das entradas neste objeto é a ORDEM PADRÃO (default)
 * em que as ilhas aparecem quando o usuário ainda não personalizou nada.
 * Manter em sincronia com a ordem narrativa desejada do produto.
 */

import type { CompareIslandId } from "./types";

/** Categoria semântica de uma ilha — usada pelo Luiz para montar presets dinâmicos. */
export type CompareIslandCategory =
  | "overview" // narrativa, verdict, top-factors, snowflake — visão geral
  | "valuation" // valuation
  | "growth" // growth
  | "past" // past
  | "health" // health
  | "dividend" // dividend
  | "metrics" // metrics
  | "timeline"; // timeline

export interface CompareIslandMeta {
  id: CompareIslandId;
  label: string;
  shortLabel: string;
  category: CompareIslandCategory;
  /** Descrição curta usada no drawer, abaixo do nome. */
  hint: string;
}

/**
 * ORDEM PADRÃO — é a ordem narrativa clássica da tela de Compare.
 * Quando o usuário clica "Restaurar padrão" no drawer, é isso que volta.
 */
export const COMPARE_ISLAND_REGISTRY: readonly CompareIslandMeta[] = [
  {
    id: "narrative",
    label: "Introdução narrativa",
    shortLabel: "Preparando",
    category: "overview",
    hint: "Resumo executivo da comparação em linguagem natural",
  },
  {
    id: "snowflake",
    label: "Visão geral (Snowflake)",
    shortLabel: "Visão geral",
    category: "overview",
    hint: "Radar com os pilares das duas empresas sobrepostos",
  },
  {
    id: "verdict",
    label: "Veredito",
    shortLabel: "Veredito",
    category: "overview",
    hint: "Quem vence em cada pilar e o resumo final",
  },
  {
    id: "top-factors",
    label: "Principais fatores",
    shortLabel: "Principais fatores",
    category: "overview",
    hint: "Os 3 pilares com maior diferença entre A e B",
  },
  {
    id: "valuation",
    label: "Valuation",
    shortLabel: "Valuation",
    category: "valuation",
    hint: "P/L, P/VP, EV/EBITDA e margem de segurança",
  },
  {
    id: "growth",
    label: "Crescimento",
    shortLabel: "Crescimento",
    category: "growth",
    hint: "CAGR de receita, lucro e projeções futuras",
  },
  {
    id: "past",
    label: "Histórico",
    shortLabel: "Histórico",
    category: "past",
    hint: "Retorno histórico e consistência operacional",
  },
  {
    id: "health",
    label: "Saúde financeira",
    shortLabel: "Saúde financeira",
    category: "health",
    hint: "Dívida, liquidez e cobertura de juros",
  },
  {
    id: "dividend",
    label: "Dividendos",
    shortLabel: "Dividendos",
    category: "dividend",
    hint: "DY, payout e consistência de pagamento",
  },
  {
    id: "metrics",
    label: "Métricas detalhadas",
    shortLabel: "Métricas",
    category: "metrics",
    hint: "Tabela completa de indicadores lado a lado",
  },
  {
    id: "timeline",
    label: "Eventos recentes",
    shortLabel: "Eventos recentes",
    category: "timeline",
    hint: "Linha do tempo com resultados e fatos relevantes",
  },
] as const;

/** Lookup rápido por ID. */
const REGISTRY_BY_ID: Record<CompareIslandId, CompareIslandMeta> =
  COMPARE_ISLAND_REGISTRY.reduce(
    (acc, meta) => {
      acc[meta.id] = meta;
      return acc;
    },
    {} as Record<CompareIslandId, CompareIslandMeta>,
  );

/** Ordem padrão das ilhas (IDs). */
export const DEFAULT_ISLAND_ORDER: readonly CompareIslandId[] =
  COMPARE_ISLAND_REGISTRY.map((m) => m.id);

/** Conjunto de todos os IDs válidos — usado para validar layouts persistidos. */
export const KNOWN_ISLAND_IDS: ReadonlySet<CompareIslandId> = new Set(
  DEFAULT_ISLAND_ORDER,
);

/** Retorna o metadado da ilha pelo ID. */
export function getIslandMeta(id: CompareIslandId): CompareIslandMeta {
  return REGISTRY_BY_ID[id];
}

/** Retorna a label amigável pelo ID. */
export function getIslandLabel(id: CompareIslandId): string {
  return REGISTRY_BY_ID[id]?.label ?? id;
}

/** Valida se uma string é um ID de ilha conhecido. */
export function isKnownIslandId(id: string): id is CompareIslandId {
  return KNOWN_ISLAND_IDS.has(id as CompareIslandId);
}

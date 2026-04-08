/**
 * Layout default do `DashboardCanvas`.
 *
 * Lista canônica das 17 ilhas, ordenadas para um usuário sem layout salvo.
 * O endowment desta lista é criado já no primeiro login (Sunk Cost) — assim
 * o usuário começa com algo "seu", não com tela vazia.
 */

import type { DashboardLayout, LayoutItem, IslandKind } from "../interfaces/layout.types";

export const DEFAULT_LAYOUT_VERSION = 1;

const DEFAULT_KINDS: IslandKind[] = [
  "resumo_dia",
  "maior_atencao",
  "maior_melhora",
  "prioridade_dia",
  "watchlist_resumo",
  "feed_mudancas",
  "continue",
  "agenda",
  "sinais_watchlist",
  "heatmap_pilar",
  "alertas_recentes",
  "empresas_recentes",
  "buscas_recentes",
  "comparacoes_recentes",
  "ciclo_mercado",
  "qualidade_dados",
  "editorial_dia",
];

function buildDefaultItems(): LayoutItem[] {
  return DEFAULT_KINDS.map((kind, index) => ({
    id: `default-${kind}`,
    kind,
    order: index,
    config: {},
  }));
}

export const defaultLayout: DashboardLayout = {
  version: DEFAULT_LAYOUT_VERSION,
  items: buildDefaultItems(),
};

export function buildDefaultLayout(): DashboardLayout {
  return {
    version: DEFAULT_LAYOUT_VERSION,
    items: buildDefaultItems(),
  };
}

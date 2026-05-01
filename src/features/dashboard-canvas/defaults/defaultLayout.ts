/**
 * Layout default do `DashboardCanvas`.
 *
 * Pós-MVP: o default contém TODAS as ilhas mantidas — usuário remove o que
 * não usa via modo edição. Isso é proposital: dá parâmetro pra avaliar o
 * que cada ilha entrega antes de decidir manter ou descartar.
 *
 * Versão do schema bumpada para v4 — modelo com sections (containers).
 */

import type {
  DashboardLayout,
  LayoutItem,
  IslandKind,
  Section,
} from "../interfaces/layout.types";
import {
  DEFAULT_SECTION_ID,
  DEFAULT_SECTION_TITLE,
} from "../interfaces/layout.types";

export const DEFAULT_LAYOUT_VERSION = 4;

/**
 * Ordem proposta — todas as ilhas vão pra section default (sem título).
 * Usuário pode criar sections nomeadas e arrastar ilhas pra dentro depois.
 */
const DEFAULT_KINDS: IslandKind[] = [
  // Linha 1 (full-width): panorama global rolante — abre o dashboard com
  // contexto macro de cara, igual ao topo da tela /mercado.
  "panorama_global",
  // Linha 2: contexto curto + prioridade + performance
  "prioridade_dia",
  "ciclo_mercado",
  "agenda",
  "performance_vs_ibov",
  // Linha 4: macro interno x macro externo (financeiro) lado a lado
  "macro_brasil",
  "resumo_indices",
  // Linha 5: feed full-width
  "feed_mudancas",
  // Linha 6: sinais (sozinho — auto-flow:dense backfilla)
  "sinais_watchlist",
  // Linha 7: commodities + cripto (full-width)
  "macro_global",
  // Linha 8: notícias + sugeridos (paralelos, ambos 6×5/6×3)
  "noticias_mercado",
  "sugeridos",
  // Linha 9: notificações
  "notificacoes",
];

function buildDefaultItems(): LayoutItem[] {
  return DEFAULT_KINDS.map((kind, index) => ({
    id: `default-${kind}`,
    kind,
    order: index,
    sectionId: DEFAULT_SECTION_ID,
    config: {},
  }));
}

function buildDefaultSections(): Section[] {
  return [
    {
      id: DEFAULT_SECTION_ID,
      title: DEFAULT_SECTION_TITLE,
      order: 0,
    },
  ];
}

export const defaultLayout: DashboardLayout = {
  version: DEFAULT_LAYOUT_VERSION,
  items: buildDefaultItems(),
  sections: buildDefaultSections(),
};

export function buildDefaultLayout(): DashboardLayout {
  return {
    version: DEFAULT_LAYOUT_VERSION,
    items: buildDefaultItems(),
    sections: buildDefaultSections(),
  };
}

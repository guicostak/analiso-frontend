/**
 * Presets de layout do `DashboardCanvas`.
 *
 * Há dois tipos de presets compartilhando a mesma interface:
 *   - **Built-in:** definidos em código (`LAYOUT_PRESETS` abaixo). Vêm
 *     com a aplicação, todos os usuários veem.
 *   - **Custom (user-defined):** o usuário salva o layout atual como
 *     preset com um nome livre. Persiste em `localStorage`. Distinguidos
 *     pelo flag `isCustom`.
 *
 * Pra suportar customs, mudamos o schema: em vez de só `kinds: IslandKind[]`,
 * presets agora carregam `items: { kind, config }[]`. Isso permite
 * preservar configurações por ilha (ex: `itemCount` do `sinais_watchlist`)
 * quando o usuário salva e reaplica.
 */

import type {
  DashboardLayout,
  IslandKind,
  LayoutItem,
  Section,
} from "../interfaces/layout.types";
import {
  DEFAULT_SECTION_ID,
  DEFAULT_SECTION_TITLE,
} from "../interfaces/layout.types";
import type { IslandConfig } from "../interfaces/island.types";
import { DEFAULT_LAYOUT_VERSION } from "./defaultLayout";

/**
 * IDs dos presets built-in. Custom presets têm IDs dinâmicos (string),
 * por isso `LayoutPreset.id` é apenas `string`.
 */
export type BuiltInPresetId = "foco_watchlist";

/**
 * Snapshot de uma ilha dentro de um preset. Não tem `id` nem `order` —
 * são gerados na hora de aplicar (`buildLayoutFromPreset`).
 */
export interface PresetItem {
  kind: IslandKind;
  config: IslandConfig;
}

export interface LayoutPreset {
  /** Built-in: chave literal (ex: "foco_watchlist"). Custom: ID gerado. */
  id: string;
  label: string;
  /** Frase curta. Built-ins explicam o "perfil"; customs podem omitir. */
  description?: string;
  /** Frase de "para quem é" — exibida nos cards built-in. */
  audience?: string;
  /** Composição do preset. Ordem do array = ordem de exibição. */
  items: PresetItem[];
  /** True quando o usuário criou via "Salvar layout atual". */
  isCustom?: boolean;
  /** ISO date — só preenchido em presets custom. */
  createdAt?: string;
}

/** Built-ins atuais. Adicionar novos é só estender este array. */
export const LAYOUT_PRESETS: LayoutPreset[] = [
  {
    id: "foco_watchlist",
    label: "Foco watchlist",
    description:
      "Mantém apenas o essencial pra acompanhar a watchlist: prioridade, sinais, agenda e feed.",
    audience: "Quem quer um dashboard enxuto, sem distrações.",
    items: [
      { kind: "prioridade_dia",    config: {} },
      { kind: "agenda",            config: {} },
      { kind: "sinais_watchlist",  config: {} },
      { kind: "feed_mudancas",     config: {} },
    ],
  },
];

/**
 * Constrói um `DashboardLayout` a partir de um preset, gerando IDs únicos
 * e propagando `order` segundo a ordem do array `items`.
 *
 * IDs incluem timestamp + sufixo de índice — assim aplicar o mesmo preset
 * duas vezes seguidas não gera conflito de chaves React (cada apply
 * regenera o conjunto de IDs).
 */
export function buildLayoutFromPreset(preset: LayoutPreset): DashboardLayout {
  const ts = Date.now().toString(36);
  const items: LayoutItem[] = preset.items.map((it, index) => ({
    id: `preset-${preset.id}-${ts}-${index}`,
    kind: it.kind,
    order: index,
    sectionId: DEFAULT_SECTION_ID,
    config: { ...it.config },
  }));
  // Presets sempre criam uma section default. Usuário pode adicionar
  // mais sections depois e arrastar items pra dentro.
  const sections: Section[] = [
    {
      id: DEFAULT_SECTION_ID,
      title: DEFAULT_SECTION_TITLE,
      order: 0,
    },
  ];
  return { version: DEFAULT_LAYOUT_VERSION, items, sections };
}

/** Helper pra criar um preset custom a partir do layout atual. */
export function buildCustomPresetFromLayout(
  label: string,
  layout: DashboardLayout,
): LayoutPreset {
  const id = `custom-${Date.now().toString(36)}-${Math.random()
    .toString(36)
    .slice(2, 6)}`;
  return {
    id,
    label,
    isCustom: true,
    createdAt: new Date().toISOString(),
    items: layout.items.map((item) => ({
      kind: item.kind,
      config: { ...item.config },
    })),
  };
}

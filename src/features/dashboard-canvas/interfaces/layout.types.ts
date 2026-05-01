/**
 * Tipos do layout do `DashboardCanvas`.
 *
 * O layout descreve QUAIS ilhas estão presentes, em que ORDEM, em que
 * TAMANHO base, com qual CONFIGURAÇÃO runtime, E em qual SEÇÃO vivem
 * (sections funcionam como pastas/containers).
 *
 * Modelo: items são flat com `sectionId` apontando pra section pai.
 * Sections vivem num array separado e ordenado. Items sem sectionId
 * caem na primeira section (ou são auto-promovidos pra default ao parsear).
 */

import type { IslandConfig } from "./island.types";

/**
 * Section: container nomeado que agrupa items. O usuário pode renomear,
 * deletar (items vão pra default) e reordenar via drag.
 */
export interface Section {
  /** ID único, estável entre persist/load. Ex: "section-{ts}-{rand}". */
  id: string;
  /** Título exibido. Vazio renderiza placeholder. */
  title: string;
  /** Posição na lista de sections (0-based). */
  order: number;
}

/** ID convencional pra section default — criada lazy pelo mapper. */
export const DEFAULT_SECTION_ID = "section-default";
/**
 * Título da section default. **Vazio por design** — sections sem nome
 * ficam visualmente "transparentes" (header inteiro escondido em view
 * mode pelo guard `isEditing || hasTitle` em `SectionContainer`). Em edit
 * mode o placeholder "Título da seção" do input já comunica o estado.
 *
 * **Histórico**: Antes era "Sem título" — gerava bug onde, ao apagar o
 * título de uma section, o texto "Sem título" reaparecia ao recarregar
 * (vinha plantado pelos defaults, não pelo dado do usuário).
 */
export const DEFAULT_SECTION_TITLE = "";

/**
 * Identificador do tipo de uma ilha (chave registrada no `IslandRegistry`).
 *
 * Conjunto enxuto pós-MVP (v3 do schema). Removidos da v2:
 *   resumo_dia, editorial_dia, continue, maior_atencao, maior_melhora,
 *   watchlist_resumo (saúde), heatmap_pilar, qualidade_dados, atividade_recente
 * Os 4 últimos foram fundidos em "feed_mudancas"; "atividade_recente"
 * (mega-tab) foi decomposta em 4 ilhas focadas: empresas/buscas/compar/notif.
 */
export type IslandKind =
  | "prioridade_dia"
  | "feed_mudancas"
  | "agenda"
  | "sinais_watchlist"
  | "ciclo_mercado"
  | "sugeridos"
  | "notificacoes"
  // **DEPRECATED** — substituídos pela ilha unificada `sugeridos` (6×5).
  // Mapper migra automaticamente layouts antigos. Mantidos no union pra
  // o filter de retrocompat em `dtoToLayout`.
  | "empresas_recentes"
  | "buscas_recentes"
  | "comparacoes_recentes"
  // Fase 3 — previews de outras features
  | "performance_vs_ibov"
  | "noticias_mercado"
  | "panorama_global"
  | "resumo_indices"
  | "macro_global"
  | "macro_brasil"
  // Tile compacto 4×1 — o ÚNICO desse tamanho. Útil pro packer
  // preencher gaps de 4 cols em rows com 6+4+ ou 4+4 incompletas.
  | "atalho_watchlist"
  // **DEPRECATED**: kind antigo que era um divisor inline. Migrado pelo
  // mapper (`dtoToLayout`) pra entries do `sections[]` no novo modelo.
  // Mantido no union pra TypeScript permitir o filter de retrocompat,
  // mas nenhum item novo deve ter esse kind.
  | "section_header";

/**
 * Item do layout: instância concreta de uma ilha no canvas do usuário.
 */
export interface LayoutItem {
  /** Identificador único da instância (estável entre reorderings). */
  id: string;
  /** Tipo da ilha — referência para o `IslandRegistry`. */
  kind: IslandKind;
  /** Posição de ordenação DENTRO da section (0-based). */
  order: number;
  /**
   * ID da section onde este item vive. Quando ausente/null, o item é
   * adotado pela section default no parse (`dtoToLayout`).
   */
  sectionId?: string | null;
  /** Configuração runtime desta instância. */
  config: IslandConfig;
}

/** Layout completo do dashboard de um usuário. */
export interface DashboardLayout {
  /** Versão do schema do layout — usada para migrações futuras. */
  version: number;
  /** Lista ordenada de ilhas presentes no canvas (flat, com sectionId). */
  items: LayoutItem[];
  /**
   * Lista ordenada de sections. Garantido pelo mapper que sempre tem
   * pelo menos uma section default (com título vazio — header escondido
   * em view mode). Items órfãos são adotados por essa default na hora
   * do parse.
   */
  sections: Section[];
}

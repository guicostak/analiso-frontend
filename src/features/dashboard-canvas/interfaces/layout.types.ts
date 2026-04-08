/**
 * Tipos do layout do `DashboardCanvas`.
 *
 * O layout descreve QUAIS ilhas estão presentes, em que ORDEM, em que
 * TAMANHO base e com qual CONFIGURAÇÃO runtime.
 */

import type { IslandConfig } from "./island.types";

/** Identificador do tipo de uma ilha (chave registrada no `IslandRegistry`). */
export type IslandKind =
  | "resumo_dia"
  | "prioridade_dia"
  | "maior_atencao"
  | "maior_melhora"
  | "watchlist_resumo"
  | "feed_mudancas"
  | "continue"
  | "empresas_recentes"
  | "buscas_recentes"
  | "comparacoes_recentes"
  | "agenda"
  | "alertas_recentes"
  | "sinais_watchlist"
  | "ciclo_mercado"
  | "heatmap_pilar"
  | "qualidade_dados"
  | "editorial_dia";

/**
 * Item do layout: instância concreta de uma ilha no canvas do usuário.
 */
export interface LayoutItem {
  /** Identificador único da instância (estável entre reorderings). */
  id: string;
  /** Tipo da ilha — referência para o `IslandRegistry`. */
  kind: IslandKind;
  /** Posição de ordenação na lista (0-based). */
  order: number;
  /** Configuração runtime desta instância. */
  config: IslandConfig;
}

/** Layout completo do dashboard de um usuário. */
export interface DashboardLayout {
  /** Versão do schema do layout — usada para migrações futuras. */
  version: number;
  /** Lista ordenada de ilhas presentes no canvas. */
  items: LayoutItem[];
}

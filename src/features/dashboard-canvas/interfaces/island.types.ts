/**
 * Tipos das ilhas que compõem o `DashboardCanvas`.
 *
 * Cada ilha é uma unidade independente do canvas, com tamanho no grid de
 * 12 colunas, metadados, configuração runtime e props padronizadas.
 */

import type { ComponentType } from "react";

/** Tamanho de uma ilha no grid de 12 colunas (w) por linhas auto (h). */
export interface IslandSize {
  /** Largura em colunas (1..12). */
  w: number;
  /** Altura em "linhas" do grid. */
  h: number;
}

/** Categoria de uma ilha — usada pelo catálogo da Fase 3. */
export type IslandCategory = "core" | "acumulo" | "contexto" | "premium";

/**
 * Configuração runtime de uma ilha — chaves opcionais aceitas pelas ilhas
 * que possuem opções (ex.: `itemCount` para listas).
 */
export interface IslandConfig {
  /** Quantos itens mostrar em ilhas listadas (sinais, etc). */
  itemCount?: number;
}

/** Esquema de configuração — quais chaves uma ilha aceita. */
export interface IslandConfigSchema {
  itemCount?: {
    label: string;
    options: number[];
    default: number;
  };
}

/**
 * Metadados estáticos de uma ilha. Usados pelo `IslandRegistry` para
 * descrever cada ilha disponível no canvas.
 */
export interface IslandMeta {
  /** Identificador único e estável da ilha. */
  kind: string;
  /** Título exibido para o usuário ao mover/configurar a ilha. */
  label: string;
  /** Descrição curta — usada em tooltips e na biblioteca de ilhas. */
  description: string;
  /** Ícone (nome lucide) da ilha — usado no catálogo. */
  icon: string;
  /** Tamanho base da ilha quando adicionada pela primeira vez. */
  baseSize: IslandSize;
  /** Categoria da ilha — agrupamento no catálogo. */
  category: IslandCategory;
  /** Plano necessário para usar a ilha (gate visual; backend é o gate real). */
  requiresPlan?: "premium";
  /** Esquema de configuração desta ilha. */
  configSchema?: IslandConfigSchema;
  /** Computa o tamanho efetivo dada a configuração runtime. */
  computeSize?: (config: IslandConfig) => IslandSize;
}

/**
 * Props comuns recebidas por todo componente de ilha.
 */
export interface IslandProps {
  /** Identificador da instância da ilha no layout do usuário. */
  islandId: string;
  /** Configuração atual da instância. */
  config: IslandConfig;
}

/** Componente React que renderiza uma ilha. */
export type IslandComponent = ComponentType<IslandProps>;

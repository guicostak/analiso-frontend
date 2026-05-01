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

/** Categoria de uma ilha — usada pelo catálogo. */
export type IslandCategory = "core" | "acumulo" | "contexto";

/**
 * Configuração runtime de uma ilha — chaves opcionais aceitas pelas ilhas
 * que possuem opções (ex.: `itemCount` para listas).
 */
export interface IslandConfig {
  /** Quantos itens mostrar em ilhas listadas (sinais, etc). */
  itemCount?: number;
  /** Título do divisor de seção (`section_header` kind). */
  title?: string;
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
 * Restrições de growth pra packing inteligente. Usado pelo algoritmo
 * `packSection` que estica items "growable" pra preencher gaps na linha.
 *
 * Default (sem `growConstraints`): item NÃO cresce — fica em `baseSize`.
 *
 * **`w` (horizontal)**: estica colunas pra fechar gaps na linha atual.
 * Algoritmo: gap residual da linha é distribuído pelos growable, último
 * primeiro (preserva visual de "items à esquerda mantêm tamanho").
 *
 * **`h` (vertical)**: estica linhas pra acompanhar o item mais alto da
 * row. Útil quando 4×2 fica ao lado de 6×3 — sem h-grow, sobra um buraco
 * 4×1 abaixo do 4×2; com h-grow ele cresce pra 4×3 e fecha o buraco.
 */
export interface GrowConstraints {
  /**
   * Largura máxima que o item pode esticar (cols). Default = `baseSize.w`.
   * Pra permitir crescimento, este valor precisa ser > `baseSize.w`.
   */
  maxW?: number;
  /**
   * Altura máxima que o item pode esticar (rows). Default = `baseSize.h`.
   */
  maxH?: number;
  /**
   * Eixos que o packer pode esticar. `"w"` ativa h-pack, `"h"` ativa
   * v-pack. Os dois podem coexistir — independentes.
   */
  growable?: Array<"w" | "h">;
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
  /** Esquema de configuração desta ilha. */
  configSchema?: IslandConfigSchema;
  /** Computa o tamanho efetivo dada a configuração runtime. */
  computeSize?: (config: IslandConfig) => IslandSize;
  /**
   * Permite que o packer estique o item horizontalmente pra preencher
   * gaps na linha. Sem isto, o item fica em `baseSize` fixo.
   *
   * Pré-requisito: o componente da ilha precisa ser visualmente OK em
   * larguras `[baseSize.w .. growConstraints.maxW]`. Itens com gráficos
   * de aspect-ratio sensível devem ser conservadores.
   */
  growConstraints?: GrowConstraints;
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

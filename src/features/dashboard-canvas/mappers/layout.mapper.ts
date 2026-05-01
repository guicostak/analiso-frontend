/**
 * Mappers entre o DTO de layout vindo da API e o tipo `DashboardLayout`
 * usado internamente pelo canvas. Faz normalização de versão, defaults
 * de configuração, descarte de `kind`s desconhecidos, e migração de
 * `section_header` (kind antigo) → entries do `sections[]` (novo modelo).
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
import type { IslandConfig } from "../interfaces/island.types";
import { islandRegistry } from "../registry/IslandRegistry";
import { DEFAULT_LAYOUT_VERSION } from "../defaults/defaultLayout";

export interface LayoutItemDTO {
  id: string;
  kind: string;
  order: number;
  /** Novo: ID da section onde o item vive. Optional pra retrocompat. */
  sectionId?: string | null;
  config?: IslandConfig | null;
}

export interface LayoutSectionDTO {
  id: string;
  title: string;
  order: number;
}

export interface LayoutDTO {
  version: number;
  items: LayoutItemDTO[];
  /** Novo: array de sections. Optional pra retrocompat com layouts antigos. */
  sections?: LayoutSectionDTO[];
}

function isKnownKind(kind: string): kind is IslandKind {
  return islandRegistry.has(kind as IslandKind);
}

/** Kinds antigos que foram consolidados em `sugeridos`. */
const SUGERIDOS_LEGACY_KINDS = new Set<string>([
  "empresas_recentes",
  "buscas_recentes",
  "comparacoes_recentes",
]);

/**
 * Migra DTO de items pra consolidar os 3 kinds antigos
 * (`empresas_recentes`, `buscas_recentes`, `comparacoes_recentes`) num
 * único `sugeridos`. Substitui a PRIMEIRA ocorrência por sugeridos
 * (preserva posição) e descarta as outras 2.
 *
 * Idempotente: se nenhum kind antigo aparece, retorna o array original.
 */
function migrateSugeridosKinds(items: LayoutItemDTO[]): LayoutItemDTO[] {
  const hasLegacy = items.some((it) => SUGERIDOS_LEGACY_KINDS.has(it.kind));
  if (!hasLegacy) return items;

  const result: LayoutItemDTO[] = [];
  let sugeridosInserted = false;
  for (const item of items) {
    if (SUGERIDOS_LEGACY_KINDS.has(item.kind)) {
      if (!sugeridosInserted) {
        // Substitui a primeira occurrence por sugeridos, preservando
        // posição e sectionId. Gera novo ID pra evitar colisão se o
        // usuário re-adicionar empresas_recentes manualmente depois
        // (não vai ter, mas defensivo).
        result.push({
          ...item,
          id: `sugeridos-migrated-${item.id}`,
          kind: "sugeridos",
          // Limpa config (chaves do legacy não se aplicam ao novo).
          config: {},
        });
        sugeridosInserted = true;
      }
      // Outras occurrences são descartadas — sugeridos absorve as 3.
      continue;
    }
    result.push(item);
  }
  return result;
}

/**
 * Migra layout antigo (sem sections, com `section_header` items inline)
 * pro novo modelo (sections[] + items com sectionId).
 *
 * Algoritmo:
 *   1. Itera items na ordem
 *   2. Quando encontra um `section_header`, cria uma section nova com o
 *      `title` extraído do config. Items seguintes pertencem a essa section.
 *   3. Items antes do PRIMEIRO section_header pertencem à section default
 *   4. Se não houver nenhum section_header, todos os items vão pra default
 *   5. `section_header` items são CONSUMIDOS (não vão pro array final de items)
 *
 * Retorna { items, sections } compatíveis com o novo modelo.
 */
function migrateFromLegacy(rawItems: LayoutItem[]): {
  items: LayoutItem[];
  sections: Section[];
} {
  const sections: Section[] = [];
  const items: LayoutItem[] = [];

  // Section default sempre existe — receberá os órfãos.
  const defaultSection: Section = {
    id: DEFAULT_SECTION_ID,
    title: DEFAULT_SECTION_TITLE,
    order: 0,
  };
  sections.push(defaultSection);

  let currentSectionId = DEFAULT_SECTION_ID;
  let orderInSection = 0;
  let nextSectionOrder = 1;

  for (const raw of rawItems) {
    if (raw.kind === "section_header") {
      // Cria section a partir do header.
      const newSection: Section = {
        id: raw.id, // reusa o ID do antigo header pra estabilidade
        title: (raw.config.title ?? "").trim() || DEFAULT_SECTION_TITLE,
        order: nextSectionOrder++,
      };
      sections.push(newSection);
      currentSectionId = newSection.id;
      orderInSection = 0;
      // NÃO inclui o section_header em items — foi convertido em section.
      continue;
    }

    // Item normal — adota current section.
    items.push({
      ...raw,
      sectionId: currentSectionId,
      order: orderInSection++,
    });
  }

  return { items, sections };
}

export function dtoToLayout(dto: LayoutDTO): DashboardLayout {
  // 0. Pré-processa: consolida kinds legados (`empresas_recentes` etc.)
  // em `sugeridos`. Roda ANTES do filter de unknown porque os kinds
  // antigos NÃO estão mais no registry, seriam filtrados out se chegassem
  // direto.
  const dtoItemsRaw = dto.items ?? [];
  const dtoItemsMigrated = migrateSugeridosKinds(dtoItemsRaw);

  // 1. Filter unknown kinds + normalize.
  const rawItems: LayoutItem[] = dtoItemsMigrated
    .filter((item) => isKnownKind(item.kind))
    .map((item) => ({
      id: item.id,
      kind: item.kind as IslandKind,
      order: item.order,
      sectionId: item.sectionId ?? null,
      config: item.config ?? {},
    }))
    .sort((a, b) => a.order - b.order);

  // 2. Decide entre migração legacy ou parse direto.
  const dtoSections = dto.sections;
  const hasModernSections = Array.isArray(dtoSections) && dtoSections.length > 0;

  let items: LayoutItem[];
  let sections: Section[];

  if (!hasModernSections) {
    // Layout no modelo antigo (sem sections[]) — migra section_header inline.
    const migrated = migrateFromLegacy(rawItems);
    items = migrated.items;
    sections = migrated.sections;
  } else {
    // Layout no modelo novo. Filtra section_header residuais (não devem
    // existir, mas defensivo) e usa sections[] do DTO.
    const cleanItems = rawItems.filter((it) => it.kind !== "section_header");
    sections = [...(dtoSections ?? [])]
      .map((s) => ({ id: s.id, title: s.title ?? "", order: s.order }))
      .sort((a, b) => a.order - b.order);

    // Garante que existe pelo menos uma section default.
    if (sections.length === 0) {
      sections.push({
        id: DEFAULT_SECTION_ID,
        title: DEFAULT_SECTION_TITLE,
        order: 0,
      });
    }

    // Items órfãos (sectionId null/undefined ou apontando pra section
    // que não existe mais) são adotados pela primeira section.
    const validSectionIds = new Set(sections.map((s) => s.id));
    const fallbackSectionId = sections[0].id;
    items = cleanItems.map((it) => ({
      ...it,
      sectionId:
        it.sectionId && validSectionIds.has(it.sectionId)
          ? it.sectionId
          : fallbackSectionId,
    }));
  }

  // 3. Reindexa `order` por section pra evitar gaps.
  const itemsBySection = new Map<string, LayoutItem[]>();
  for (const it of items) {
    const sid = it.sectionId ?? sections[0].id;
    if (!itemsBySection.has(sid)) itemsBySection.set(sid, []);
    itemsBySection.get(sid)!.push(it);
  }
  const reindexedItems: LayoutItem[] = [];
  for (const [sid, list] of itemsBySection) {
    list
      .sort((a, b) => a.order - b.order)
      .forEach((it, idx) => reindexedItems.push({ ...it, sectionId: sid, order: idx }));
  }

  // 4. Reindexa `order` das sections.
  sections = sections
    .sort((a, b) => a.order - b.order)
    .map((s, idx) => ({ ...s, order: idx }));

  return {
    version: dto.version || DEFAULT_LAYOUT_VERSION,
    items: reindexedItems,
    sections,
  };
}

export function layoutToDto(layout: DashboardLayout): LayoutDTO {
  return {
    version: layout.version,
    items: layout.items.map((item) => ({
      id: item.id,
      kind: item.kind,
      order: item.order,
      sectionId: item.sectionId ?? null,
      config: item.config,
    })),
    sections: layout.sections.map((s) => ({
      id: s.id,
      title: s.title,
      order: s.order,
    })),
  };
}

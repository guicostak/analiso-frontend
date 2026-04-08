/**
 * Mappers entre o DTO de layout vindo da API e o tipo `DashboardLayout`
 * usado internamente pelo canvas. Faz normalização de versão, defaults
 * de configuração e descarte de `kind`s desconhecidos.
 */

import type { DashboardLayout, LayoutItem, IslandKind } from "../interfaces/layout.types";
import type { IslandConfig } from "../interfaces/island.types";
import { islandRegistry } from "../registry/IslandRegistry";
import { DEFAULT_LAYOUT_VERSION } from "../defaults/defaultLayout";

export interface LayoutItemDTO {
  id: string;
  kind: string;
  order: number;
  config?: IslandConfig | null;
}

export interface LayoutDTO {
  version: number;
  items: LayoutItemDTO[];
}

function isKnownKind(kind: string): kind is IslandKind {
  return islandRegistry.has(kind as IslandKind);
}

export function dtoToLayout(dto: LayoutDTO): DashboardLayout {
  const items: LayoutItem[] = dto.items
    .filter((item) => isKnownKind(item.kind))
    .map((item) => ({
      id:     item.id,
      kind:   item.kind as IslandKind,
      order:  item.order,
      config: item.config ?? {},
    }))
    .sort((a, b) => a.order - b.order)
    .map((item, index) => ({ ...item, order: index }));

  return {
    version: dto.version || DEFAULT_LAYOUT_VERSION,
    items,
  };
}

export function layoutToDto(layout: DashboardLayout): LayoutDTO {
  return {
    version: layout.version,
    items: layout.items.map((item) => ({
      id:     item.id,
      kind:   item.kind,
      order:  item.order,
      config: item.config,
    })),
  };
}

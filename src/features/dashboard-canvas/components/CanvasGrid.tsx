"use client";

/**
 * CanvasGrid
 *
 * Grid de 12 colunas que renderiza as ilhas do `DashboardCanvas` via dnd-kit.
 *   - `DndContext` + `closestCenter`
 *   - `SortableContext` + `rectSortingStrategy`
 *   - `KeyboardSensor` para acessibilidade
 *   - Snap em colunas inteiras (auto-flow:dense + grid-column span)
 *
 * No mobile (< xl, 1280px) o `DndContext` NÃO é inicializado e as ilhas
 * caem em coluna única — ver `MobileFallbackBanner`.
 */

import { useEffect, useState } from "react";
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  rectSortingStrategy,
  sortableKeyboardCoordinates,
} from "@dnd-kit/sortable";

import { useEditMode } from "../hooks/useEditMode";
import { useDashboardLayoutContext } from "../hooks/DashboardLayoutContext";
import { getIsland } from "../registry/IslandRegistry";

import { IslandFrame } from "./IslandFrame";
import { MobileFallbackBanner } from "./MobileFallbackBanner";

const MOBILE_BREAKPOINT_PX = 1280;

function useIsDesktop(): boolean {
  const [isDesktop, setIsDesktop] = useState<boolean>(true);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia(`(min-width: ${MOBILE_BREAKPOINT_PX}px)`);
    const update = () => setIsDesktop(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  return isDesktop;
}

export function CanvasGrid() {
  const { layout, reorderItems, removeItem, updateItemConfig } = useDashboardLayoutContext();
  const { isEditing } = useEditMode();
  const isDesktop = useIsDesktop();

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const knownItems = layout.items.filter((item) => getIsland(item.kind));
  const itemIds = knownItems.map((item) => item.id);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = itemIds.indexOf(String(active.id));
    const newIndex = itemIds.indexOf(String(over.id));
    if (oldIndex < 0 || newIndex < 0) return;

    const next = [...itemIds];
    next.splice(oldIndex, 1);
    next.splice(newIndex, 0, String(active.id));
    reorderItems(next);
  };

  // ── Mobile: stack vertical, sem dnd ──────────────────────────────────────
  if (!isDesktop) {
    return (
      <div className="space-y-4">
        <MobileFallbackBanner />
        <div className="grid grid-cols-1 gap-4">
          {knownItems.map((item) => {
            const entry = getIsland(item.kind);
            if (!entry) return null;
            const Component = entry.component;
            return (
              <div key={item.id} className="min-w-0">
                <Component islandId={item.id} config={item.config} />
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // ── Desktop: grid 12 cols + dnd ──────────────────────────────────────────
  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={itemIds} strategy={rectSortingStrategy}>
        <div
          className="grid auto-rows-[88px] grid-cols-12 gap-5"
          data-edit-mode={isEditing ? "on" : "off"}
        >
          {knownItems.map((item) => {
            const entry = getIsland(item.kind);
            if (!entry) return null;
            return (
              <IslandFrame
                key={item.id}
                item={item}
                entry={entry}
                onRemove={removeItem}
                onConfigChange={updateItemConfig}
              />
            );
          })}
        </div>
      </SortableContext>
    </DndContext>
  );
}

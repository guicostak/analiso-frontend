"use client";

/**
 * IslandFrame
 *
 * Shell de cada ilha no `CanvasGrid`. Responsabilidades:
 *   - registrar a ilha como sortable (`useSortable` do dnd-kit)
 *   - aplicar o tamanho efetivo no grid (`grid-column: span W; grid-row: span H`)
 *   - mostrar drag-handle, botão remover (com confirmação inline amber) e
 *     popover de configuração SOMENTE em modo edição
 *   - desabilitar interações do conteúdo enquanto o usuário arrasta
 *
 * Loss Aversion: a confirmação de remoção usa amber, nunca red gritante.
 */

import { useState } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, X, Settings2 } from "lucide-react";

import { cn } from "@/src/components/ui/utils";
import { Popover, PopoverContent, PopoverTrigger } from "@/src/components/ui/popover";

import { useEditMode } from "../hooks/useEditMode";
import { resolveIslandSize, type IslandRegistryEntry } from "../registry/IslandRegistry";
import type { LayoutItem } from "../interfaces/layout.types";
import type { IslandConfig } from "../interfaces/island.types";

export interface IslandFrameProps {
  item: LayoutItem;
  entry: IslandRegistryEntry;
  onRemove: (id: string) => void;
  onConfigChange: (id: string, config: IslandConfig) => void;
}

export function IslandFrame({ item, entry, onRemove, onConfigChange }: IslandFrameProps) {
  const { isEditing } = useEditMode();
  const [confirmingRemove, setConfirmingRemove] = useState(false);

  const size = resolveIslandSize(entry, item.config);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id, disabled: !isEditing });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    gridColumn: `span ${size.w} / span ${size.w}`,
    gridRow:    `span ${size.h} / span ${size.h}`,
    opacity: isDragging ? 0.6 : 1,
    zIndex:  isDragging ? 10 : undefined,
  };

  const Component = entry.component;
  const hasConfig = Boolean(entry.meta.configSchema?.itemCount);

  return (
    <div
      ref={setNodeRef}
      style={style}
      data-island-id={item.id}
      data-island-kind={item.kind}
      className={cn(
        "relative min-w-0",
        isEditing && "rounded-[20px] outline outline-2 outline-dashed outline-border",
      )}
    >
      <div className={cn("h-full w-full", isEditing && "pointer-events-none select-none")}>
        <Component islandId={item.id} config={item.config} />
      </div>

      {isEditing && (
        <div className="absolute inset-x-0 top-0 z-20 flex items-center justify-between gap-1 p-1.5">
          <button
            type="button"
            aria-label="Mover ilha"
            className="flex h-7 w-7 items-center justify-center rounded-full bg-card/90 text-muted-foreground shadow-sm transition hover:text-foreground"
            {...attributes}
            {...listeners}
          >
            <GripVertical className="h-3.5 w-3.5" />
          </button>

          <div className="flex items-center gap-1">
            {hasConfig && (
              <Popover>
                <PopoverTrigger asChild>
                  <button
                    type="button"
                    aria-label="Configurar ilha"
                    className="flex h-7 w-7 items-center justify-center rounded-full bg-card/90 text-muted-foreground shadow-sm transition hover:text-foreground"
                  >
                    <Settings2 className="h-3.5 w-3.5" />
                  </button>
                </PopoverTrigger>
                <PopoverContent align="end" className="w-56 p-3">
                  {entry.meta.configSchema?.itemCount && (
                    <div className="space-y-2">
                      <p className="text-[12px] font-medium text-muted-foreground">
                        {entry.meta.configSchema.itemCount.label}
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {entry.meta.configSchema.itemCount.options.map((opt) => {
                          const current = item.config.itemCount ?? entry.meta.configSchema?.itemCount?.default;
                          const isOn = current === opt;
                          return (
                            <button
                              key={opt}
                              type="button"
                              onClick={() => onConfigChange(item.id, { itemCount: opt })}
                              className={cn(
                                "rounded-full px-3 py-1 text-[12px] font-medium transition",
                                isOn ? "bg-brand text-white" : "bg-muted text-muted-foreground hover:text-foreground",
                              )}
                            >
                              {opt}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </PopoverContent>
              </Popover>
            )}

            {confirmingRemove ? (
              <div className="flex items-center gap-1 rounded-full bg-amber-50 dark:bg-amber-950/40 px-2 py-1 text-[11px] font-semibold text-amber-700 dark:text-amber-300 shadow-sm">
                <span>Remover?</span>
                <button
                  type="button"
                  onClick={() => onRemove(item.id)}
                  className="rounded-full bg-amber-200 dark:bg-amber-900/60 px-2 py-0.5 text-amber-900 dark:text-amber-100"
                >
                  Sim
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmingRemove(false)}
                  className="rounded-full px-2 py-0.5 text-amber-700 dark:text-amber-300"
                >
                  Não
                </button>
              </div>
            ) : (
              <button
                type="button"
                aria-label="Remover ilha"
                onClick={() => setConfirmingRemove(true)}
                className="flex h-7 w-7 items-center justify-center rounded-full bg-card/90 text-muted-foreground shadow-sm transition hover:text-amber-600"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

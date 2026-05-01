"use client";

/**
 * DraggingPreview
 *
 * Clone "flutuante" da ilha que segue o cursor durante o drag — renderizado
 * dentro do `<DragOverlay>` do dnd-kit, fora do grid principal.
 *
 * Por que isso existe? O pattern anterior aplicava transform direto no
 * elemento original que estava no grid. O conflito entre transform por
 * frame (cursor-driven) e reflow do grid (layout-driven) gerava jitter
 * visível em ilhas grandes. `DragOverlay` é um portal absoluto fora do
 * grid — sem layout pra disputar, o movimento fica liso.
 *
 * Visual diferencia ele do estado parado:
 *   - shadow grande (elevação)
 *   - ring colorido brand (sinal "isso tá sendo movido")
 *   - cursor grabbing
 *   - sem controles de edit (sem botão remover/configurar)
 *
 * O `DragOverlay` automaticamente aplica width/height iguais ao do item
 * original (medido no `dragStart`) — não precisamos calcular.
 */

import type { LayoutItem } from "../interfaces/layout.types";
import { type IslandRegistryEntry } from "../registry/IslandRegistry";

export interface DraggingPreviewProps {
  item: LayoutItem;
  entry: IslandRegistryEntry;
}

export function DraggingPreview({ item, entry }: DraggingPreviewProps) {
  const Component = entry.component;
  return (
    <div
      className="
        relative h-full w-full cursor-grabbing rounded-[24px]
        ring-2 ring-brand/60 ring-offset-2 ring-offset-background
        shadow-[0_24px_48px_rgba(15,23,40,0.18)]
        transition-shadow duration-150
      "
    >
      {/* O conteúdo da ilha em si — o `IslandShell` interno já traz seu
          próprio rounded-[24px] + bg-card, então o ring fica perfeitamente
          alinhado com a borda do card. */}
      <div className="pointer-events-none h-full w-full select-none">
        <Component islandId={item.id} config={item.config} />
      </div>
    </div>
  );
}

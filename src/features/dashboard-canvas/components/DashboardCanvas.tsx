"use client";

/**
 * DashboardCanvas
 *
 * Ponto de entrada do canvas de ilhas do dashboard.
 *   - Wrap em `DashboardLayoutProvider` para que `CanvasGrid`, FAB e
 *     `ResetLayoutDialog` compartilhem a mesma instância de layout.
 *   - Recebe o `useDashboardInbox` já consumido pelo `DashboardPage` via
 *     prop (zero double-fetch) e o expõe pelas ilhas via `useIslandData`.
 *   - Renderiza `CanvasGrid` (DnD) + ações de edição (Adicionar ilha,
 *     Restaurar padrão) visíveis somente em modo edição.
 */

import { useState } from "react";
import { Plus, RotateCcw } from "lucide-react";

import { cn } from "@/src/components/ui/utils";
import type { UseDashboardInboxReturn } from "@/src/features/dashboard/hooks/useDashboardInbox";

import { useEditMode } from "../hooks/useEditMode";
import { DashboardCanvasDataProvider } from "../hooks/useIslandData";
import {
  DashboardLayoutProvider,
  useDashboardLayoutContext,
} from "../hooks/DashboardLayoutContext";
import type { IslandKind, LayoutItem } from "../interfaces/layout.types";

import { AddIslandSheet } from "./AddIslandSheet";
import { CanvasGrid } from "./CanvasGrid";
import { ResetLayoutDialog } from "./ResetLayoutDialog";

export interface DashboardCanvasProps {
  inbox: UseDashboardInboxReturn;
}

export function DashboardCanvas({ inbox }: DashboardCanvasProps) {
  return (
    <DashboardLayoutProvider>
      <DashboardCanvasDataProvider inbox={inbox}>
        <CanvasShell />
      </DashboardCanvasDataProvider>
    </DashboardLayoutProvider>
  );
}

function CanvasShell() {
  const { isEditing } = useEditMode();
  const { layout, addItem, resetLayout } = useDashboardLayoutContext();

  const [addOpen,   setAddOpen]   = useState(false);
  const [resetOpen, setResetOpen] = useState(false);

  const handleAddIsland = (kind: IslandKind) => {
    const item: Omit<LayoutItem, "order"> = {
      id: `${kind}-${Date.now().toString(36)}`,
      kind,
      config: {},
    };
    addItem(item);
  };

  const handleConfirmReset = () => {
    setResetOpen(false);
    void resetLayout();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-[12px] font-medium uppercase text-muted-foreground">
          {isEditing ? "Modo edição — arraste, configure ou remova ilhas" : "Seu painel"}
        </p>
        {isEditing && (
          <button
            type="button"
            onClick={() => setResetOpen(true)}
            className="inline-flex h-9 items-center gap-2 rounded-full border border-amber-300 bg-amber-50 px-4 text-[12px] font-semibold text-amber-800 transition hover:bg-amber-100 dark:border-amber-900/60 dark:bg-amber-950/30 dark:text-amber-300 dark:hover:bg-amber-950/50"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Restaurar padrão
          </button>
        )}
      </div>

      <div
        className={cn(
          "relative rounded-[24px] transition",
          isEditing && "bg-muted/30 p-3 dark:bg-muted/20",
        )}
      >
        <CanvasGrid />

        {isEditing && (
          <button
            type="button"
            onClick={() => setAddOpen(true)}
            aria-label="Adicionar ilha"
            className="fixed bottom-6 right-6 z-30 inline-flex h-12 items-center gap-2 rounded-full bg-brand px-5 text-[13px] font-semibold text-white shadow-[0_8px_24px_rgba(0,0,0,0.18)] transition hover:bg-brand-hover xl:absolute xl:bottom-4 xl:right-4"
          >
            <Plus className="h-4 w-4" />
            Adicionar ilha
          </button>
        )}
      </div>

      <AddIslandSheet
        open={addOpen}
        onOpenChange={setAddOpen}
        layout={layout}
        onAddIsland={handleAddIsland}
      />

      <ResetLayoutDialog
        open={resetOpen}
        onOpenChange={setResetOpen}
        onConfirm={handleConfirmReset}
      />
    </div>
  );
}

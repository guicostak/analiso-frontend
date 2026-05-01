"use client";

/**
 * DashboardCanvas
 *
 * Ponto de entrada do canvas de ilhas do dashboard.
 *   - Wrap em `DashboardLayoutProvider` para que `CanvasGrid` e seus filhos
 *     compartilhem a mesma instância de layout.
 *   - Recebe o `useDashboardInbox` já consumido pelo `DashboardPage` via
 *     prop (zero double-fetch) e o expõe pelas ilhas via `useIslandData`.
 *   - View mode: render simples com PresetSelect + EditModeToggle no header.
 *   - Edit mode: `EditModeNavbar` sticky no topo agrupa TODOS os controles
 *     (preset, +ilha, restaurar, descartar, concluir) — visível enquanto
 *     o usuário rola o canvas.
 *
 * **Snapshot pra "Descartar alterações":** ao entrar no edit mode, captura
 * o layout + activePresetId. "Descartar" reaplica esse snapshot via
 * `replaceLayout` (que dispara um PUT debounced com o estado original) e
 * sai do edit mode. "Concluir" só sai do edit mode — as mudanças já foram
 * persistidas pelo auto-save.
 */

import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import { cn } from "@/src/components/ui/utils";
import type { UseDashboardInboxReturn } from "@/src/features/dashboard/hooks/useDashboardInbox";

import { useEditMode } from "../hooks/useEditMode";
import { DashboardCanvasDataProvider } from "../hooks/useIslandData";
import {
  DashboardLayoutProvider,
  useDashboardLayoutContext,
} from "../hooks/DashboardLayoutContext";
import { useCustomPresets } from "../hooks/useCustomPresets";
import type { DashboardLayout, IslandKind, LayoutItem } from "../interfaces/layout.types";
import type { LayoutPreset } from "../defaults/presets";

import { AddIslandSheet } from "./AddIslandSheet";
import { CanvasGrid } from "./CanvasGrid";
import { EditModeNavbar } from "./EditModeNavbar";
import { EditModeToggle } from "./EditModeToggle";
import { PresetSelect } from "./PresetSelect";
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
  const { isEditing, exit: exitEditMode } = useEditMode();
  const {
    layout,
    activePresetId,
    addItems,
    addSection,
    applyPreset,
    replaceLayout,
    resetLayout,
  } = useDashboardLayoutContext();
  const customPresets = useCustomPresets();

  const [addOpen,   setAddOpen]   = useState(false);
  const [resetOpen, setResetOpen] = useState(false);

  // ── Snapshot pra "Descartar alterações" ─────────────────────────────────
  // Refs sempre-atualizados com o estado mais recente. Necessários pra
  // capturar o valor EXATO no momento que `isEditing` flipa pra true —
  // sem isso o useEffect veria valor stale.
  const latestLayoutRef = useRef(layout);
  const latestActivePresetIdRef = useRef(activePresetId);
  useEffect(() => { latestLayoutRef.current = layout; });
  useEffect(() => { latestActivePresetIdRef.current = activePresetId; });

  // Snapshot capturado ao entrar no edit mode. Limpo ao sair.
  const layoutSnapshotRef = useRef<DashboardLayout | null>(null);
  const activePresetSnapshotRef = useRef<string | null>(null);

  useEffect(() => {
    if (isEditing) {
      // Deep clone do layout (items + sections) pra que mutações
      // posteriores não alterem o snapshot por referência.
      const current = latestLayoutRef.current;
      layoutSnapshotRef.current = {
        version: current.version,
        items: current.items.map((item) => ({
          ...item,
          config: { ...item.config },
        })),
        sections: current.sections.map((s) => ({ ...s })),
      };
      activePresetSnapshotRef.current = latestActivePresetIdRef.current;
    } else {
      layoutSnapshotRef.current = null;
      activePresetSnapshotRef.current = null;
    }
  }, [isEditing]);

  // ── Handlers ─────────────────────────────────────────────────────────────

  const handleAddIslands = (kinds: IslandKind[]) => {
    if (kinds.length === 0) return;
    // Mesma timestamp base + sufixo do índice → IDs únicos garantidos
    // mesmo se múltiplas ilhas forem adicionadas no mesmo tick.
    const base = Date.now().toString(36);
    const items: Omit<LayoutItem, "order">[] = kinds.map((kind, i) => ({
      id: `${kind}-${base}-${i}`,
      kind,
      config: {},
    }));
    addItems(items);
  };

  /**
   * Adiciona uma section nova POSICIONADA inteligentemente:
   *
   *   - Se o usuário tá scrolled na METADE SUPERIOR da página → cria no
   *     INÍCIO do layout (a seção nova vira a primeira). Faz mais sentido
   *     adicionar perto de onde o usuário está olhando.
   *   - Se tá na METADE INFERIOR → cria no FIM (anexa). Mesma intenção.
   *
   * Após criar, scrolla suavemente até a nova section pra que o usuário
   * tenha feedback imediato de "criei aqui" e possa começar a editar
   * o título sem caçar onde a section foi parar.
   *
   * Compensação de offset: AppTopBar (56px) + EditModeNavbar sticky (64px
   * de top-16 + ~72px de altura) = ~140px de chrome no topo. Scrollamos
   * o elemento pra y=140 da viewport pra que ele apareça abaixo de tudo.
   */
  const handleAddSection = () => {
    // Detecta posição relativa do scroll do documento (0 = topo, 1 = fim).
    const scrollY = typeof window !== "undefined" ? window.scrollY : 0;
    const docHeight =
      typeof document !== "undefined" ? document.documentElement.scrollHeight : 0;
    const viewportHeight =
      typeof window !== "undefined" ? window.innerHeight : 0;
    const maxScroll = Math.max(1, docHeight - viewportHeight);
    const scrollProgress = scrollY / maxScroll;
    const position: "start" | "end" = scrollProgress >= 0.5 ? "end" : "start";

    const newId = addSection(undefined, position);

    // Espera 2 RAFs pra garantir que o React re-renderizou e a nova
    // section tá no DOM. Sem isso, querySelector retorna null.
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        const el = document.querySelector<HTMLElement>(
          `[data-section-id="${newId}"]`,
        );
        if (!el) return;
        const rect = el.getBoundingClientRect();
        // Offset = altura do AppTopBar + EditModeNavbar + breathing.
        const STICKY_OFFSET = 140;
        // scrollBy desloca relativamente — coloca a section a STICKY_OFFSET
        // do topo da viewport. Smooth dá feedback de "scrollou ali".
        window.scrollBy({
          top: rect.top - STICKY_OFFSET,
          behavior: "smooth",
        });
      });
    });
  };

  const handleConfirmReset = () => {
    // Snapshot do layout atual ANTES de resetar — pra permitir undo.
    const snapshot: DashboardLayout = {
      version: layout.version,
      items: layout.items.map((item) => ({ ...item, config: { ...item.config } })),
      sections: layout.sections.map((s) => ({ ...s })),
    };
    const previousActivePresetId = activePresetId;
    setResetOpen(false);
    void resetLayout();
    toast("Painel restaurado ao padrão", {
      description: `${snapshot.items.length} ilha${snapshot.items.length === 1 ? "" : "s"} foram substituídas pelo layout default.`,
      duration: 5000,
      action: {
        label: "Desfazer",
        onClick: () => replaceLayout(snapshot, previousActivePresetId),
      },
    });
  };

  // Aplica preset (built-in ou custom) com toast de undo. Snapshot do
  // layout E do `activePresetId` ANTES de aplicar — assim o undo restaura
  // tanto o layout quanto o indicador de "qual preset estava ativo".
  const handleApplyPreset = (preset: LayoutPreset) => {
    if (preset.id === activePresetId) return; // já está ativo, no-op
    const snapshot: DashboardLayout = {
      version: layout.version,
      items: layout.items.map((item) => ({ ...item, config: { ...item.config } })),
      sections: layout.sections.map((s) => ({ ...s })),
    };
    const previousActivePresetId = activePresetId;
    applyPreset(preset);
    toast(`Preset "${preset.label}" aplicado`, {
      description: `${preset.items.length} ilha${preset.items.length === 1 ? "" : "s"} carregadas.`,
      duration: 5000,
      action: {
        label: "Desfazer",
        onClick: () => replaceLayout(snapshot, previousActivePresetId),
      },
    });
  };

  const handleSaveCustomPreset = (label: string) => {
    const preset = customPresets.save(label, layout);
    if (!preset) {
      toast.error("Não consegui salvar o preset", {
        description: "Verifique se o nome não está vazio e se há ilhas no painel.",
      });
      return;
    }
    toast(`Preset "${preset.label}" salvo`, {
      description: `${preset.items.length} ilha${preset.items.length === 1 ? "" : "s"} congeladas neste preset.`,
      duration: 4000,
    });
  };

  // Soft delete com undo via toast — mesmo padrão de remover ilha.
  const handleDeleteCustomPreset = (preset: LayoutPreset) => {
    customPresets.remove(preset.id);
    toast(`Preset "${preset.label}" removido`, {
      duration: 5000,
      action: {
        label: "Desfazer",
        onClick: () => customPresets.restore(preset),
      },
    });
  };

  // "Descartar" = reverte ao snapshot do início da edição + sai do mode.
  // Não há toast undo aqui (intencional — descartar JÁ é o undo). Se o
  // usuário descartar por engano, ele entra de novo no edit mode e refaz.
  const handleDiscardChanges = () => {
    const snapshot = layoutSnapshotRef.current;
    const presetId = activePresetSnapshotRef.current;
    if (snapshot) {
      replaceLayout(snapshot, presetId);
    }
    exitEditMode();
  };

  const handleConcludeEdit = () => {
    // Mudanças já foram persistidas pelo debounced PUT. Apenas sai.
    exitEditMode();
  };

  return (
    <div className="space-y-4">
      {isEditing ? (
        // Edit mode: navbar sticky agrupa TODOS os controles num só lugar.
        <EditModeNavbar
          customPresets={customPresets.presets}
          activePresetId={activePresetId}
          layoutItemCount={layout.items.length}
          onApplyPreset={handleApplyPreset}
          onSaveCustomPreset={handleSaveCustomPreset}
          onDeleteCustomPreset={handleDeleteCustomPreset}
          onAddIsland={() => setAddOpen(true)}
          onAddSection={handleAddSection}
          onResetLayout={() => setResetOpen(true)}
          onDiscardChanges={handleDiscardChanges}
          onConcludeEdit={handleConcludeEdit}
        />
      ) : (
        // View mode: header simples com indicador de preset + Personalizar.
        // `items-end` no cluster da direita alinha o trigger do PresetSelect
        // (que tem label "PRESET" acima) com o botão "Personalizar".
        <div className="flex items-end justify-between gap-3">
          <p className="pb-2 text-[12px] font-medium uppercase text-muted-foreground">
            Seu painel
          </p>
          <div className="flex items-end gap-2">
            <PresetSelect
              customPresets={customPresets.presets}
              activePresetId={activePresetId}
              layoutItemCount={layout.items.length}
              allowMutations={false}
              onApplyPreset={handleApplyPreset}
              onSaveCustomPreset={handleSaveCustomPreset}
              onDeleteCustomPreset={handleDeleteCustomPreset}
            />
            <EditModeToggle />
          </div>
        </div>
      )}

      <div
        className={cn(
          "relative rounded-[24px] transition-colors duration-200",
          // CRÍTICO: NÃO usar `padding` aqui pra sinalizar edit mode.
          // Padding muda layout (empurra o grid 12px+12px) e o
          // `transition` do Tailwind não anima padding por padrão →
          // shift instantâneo das ilhas (bug "mexendo" reportado).
          //
          // Em vez disso usamos `outline` (não toma layout space, fica
          // fora da box) + bg sutil pelos gaps do grid. Visual cue sem
          // deslocamento.
          isEditing &&
            "bg-muted/15 outline-dashed outline-2 outline-offset-4 outline-border/60 dark:bg-muted/10 dark:outline-border/50",
        )}
      >
        <CanvasGrid />
      </div>

      <AddIslandSheet
        open={addOpen}
        onOpenChange={setAddOpen}
        layout={layout}
        onAddIslands={handleAddIslands}
      />

      <ResetLayoutDialog
        open={resetOpen}
        onOpenChange={setResetOpen}
        onConfirm={handleConfirmReset}
        currentCount={layout.items.length}
      />
    </div>
  );
}

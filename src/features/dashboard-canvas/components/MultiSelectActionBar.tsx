"use client";

/**
 * MultiSelectActionBar
 *
 * Barra contextual fixa no bottom da viewport — aparece quando há ≥1
 * ilha selecionada na seleção múltipla. Permite bulk-actions sem precisar
 * abrir menu/dialog.
 *
 * Padrão de design: "contextual command bar" (Gmail, Linear, Notion).
 * Reduz fricção pra ações em lote — single click = remove todas.
 *
 * Microinteractions (Saffer):
 *   - **Trigger**: aparece automaticamente quando `selectedCount > 0`
 *   - **Rules**: bloqueia fora do edit mode (controlado pelo caller)
 *   - **Feedback**: contador atualiza em real-time, animação slide-up
 *     na entrada, slide-down ao limpar
 *   - **Loop**: enquanto selectedCount > 0 → visível; cai a 0 → desaparece
 */

import { Trash2, X } from "lucide-react";

import { cn } from "@/src/components/ui/utils";

export interface MultiSelectActionBarProps {
  selectedCount: number;
  onClearSelection: () => void;
  onRemoveSelected: () => void;
}

export function MultiSelectActionBar({
  selectedCount,
  onClearSelection,
  onRemoveSelected,
}: MultiSelectActionBarProps) {
  const visible = selectedCount > 0;

  return (
    <div
      className={cn(
        // Posição: fixed bottom-center, z acima do FAB (z-30) e abaixo
        // de toasts (z-50).
        "fixed bottom-6 left-1/2 z-40 -translate-x-1/2",
        // Animação: slide up + fade quando aparece, slide down ao sair.
        // pointer-events-none enquanto invisível pra não bloquear clicks
        // no canvas que tá embaixo.
        "transition-[transform,opacity] duration-200 ease-out",
        visible
          ? "translate-y-0 opacity-100"
          : "pointer-events-none translate-y-4 opacity-0",
      )}
      role="toolbar"
      aria-label="Ações para ilhas selecionadas"
      aria-hidden={!visible}
    >
      <div
        className={cn(
          "flex items-center gap-2 rounded-full px-3 py-2",
          // Surface: dark high-contrast (estilo "command bar"), independente
          // do tema do dashboard. Garante legibilidade sobre qualquer canvas.
          "bg-foreground text-background shadow-[0_8px_32px_rgba(15,23,40,0.24)]",
          "ring-1 ring-foreground/20",
        )}
      >
        {/* Counter chip — destaca o número, lê como label */}
        <span className="inline-flex items-center gap-1.5 rounded-full bg-background/10 px-3 py-1 text-[12px] font-semibold">
          <span className="tabular-nums">{selectedCount}</span>
          <span className="text-background/80">
            {selectedCount === 1 ? "selecionada" : "selecionadas"}
          </span>
        </span>

        {/* Action: remove em massa */}
        <button
          type="button"
          onClick={onRemoveSelected}
          className={cn(
            "inline-flex h-9 items-center gap-1.5 rounded-full px-3.5",
            "text-[12.5px] font-semibold",
            "bg-background/10 text-background transition-colors duration-150",
            "hover:bg-background/20",
          )}
        >
          <Trash2 className="h-3.5 w-3.5" />
          Remover {selectedCount === 1 ? "ilha" : `${selectedCount} ilhas`}
        </button>

        {/* Clear selection — ícone X, tooltip claro */}
        <button
          type="button"
          onClick={onClearSelection}
          aria-label="Limpar seleção"
          title="Limpar seleção"
          className="
            flex h-9 w-9 items-center justify-center rounded-full
            text-background/60 transition-colors hover:bg-background/10
            hover:text-background
          "
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}

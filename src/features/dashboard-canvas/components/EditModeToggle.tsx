"use client";

/**
 * EditModeToggle
 *
 * Botão "Personalizar painel" / "Concluir personalização" exibido no topo
 * do `DashboardCanvas`. Em Fase 2 fica acima do grid; a Fase 3 também o
 * coloca no `AppTopBar`.
 *
 * Importante: NÃO escondemos no menu hamburger — descoberta importa.
 */

import { Pencil, Check } from "lucide-react";

import { cn } from "@/src/components/ui/utils";
import { useEditMode } from "../hooks/useEditMode";

export function EditModeToggle({ className }: { className?: string }) {
  const { isEditing, toggle } = useEditMode();

  return (
    <button
      type="button"
      onClick={toggle}
      className={cn(
        "inline-flex h-9 items-center gap-2 rounded-full border border-border px-4 text-[13px] font-semibold transition",
        isEditing
          ? "bg-brand text-white shadow-sm hover:bg-brand-hover"
          : "bg-card text-foreground hover:bg-hover",
        className,
      )}
      aria-pressed={isEditing}
    >
      {isEditing ? <Check className="h-4 w-4" /> : <Pencil className="h-4 w-4" />}
      {isEditing ? "Concluir personalização" : "Personalizar painel"}
    </button>
  );
}

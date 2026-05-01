"use client";

/**
 * SectionContainer
 *
 * Container nomeado que agrupa items do dashboard. Funciona como uma
 * "pasta" — items vivem dentro de uma section via `sectionId`. Drag-drop
 * permite mover items entre sections.
 *
 * Visual:
 *   - Header com título editável (edit mode) + delete button
 *   - Container interno com grid de 12 colunas que recebe os items
 *   - Em edit mode, ganha visual de "drop zone" quando outros items
 *     passam por cima
 *
 * Drag-drop:
 *   - O container é um `useDroppable` (pra detectar quando algo é solto
 *     em uma área vazia da section)
 *   - Os items dentro usam `useSortable` — todos no mesmo `SortableContext`
 *     da seção pai (single context, scope é controlado pela detecção
 *     de drop sobre this section)
 */

import { useEffect, useRef, useState } from "react";
import { useDroppable } from "@dnd-kit/core";
import { Trash2 } from "lucide-react";

import { cn } from "@/src/components/ui/utils";

import type { Section } from "../interfaces/layout.types";

const TITLE_MAX_LENGTH = 64;
const TITLE_PLACEHOLDER = "Título da seção";

export interface SectionContainerProps {
  section: Section;
  isEditing: boolean;
  /** True se mais de 1 section existe (deletar fica disponível). */
  canDelete: boolean;
  onRenameSection: (id: string, title: string) => void;
  onRemoveSection: (id: string) => void;
  /** Children = grid de items dessa section (já renderizados pelo pai). */
  children: React.ReactNode;
}

export function SectionContainer({
  section,
  isEditing,
  canDelete,
  onRenameSection,
  onRemoveSection,
  children,
}: SectionContainerProps) {
  // Droppable pra section inteira — recebe items quando soltos numa área
  // vazia (sem item embaixo). Items passa pelo useSortable padrão.
  const { setNodeRef: setDroppableRef, isOver } = useDroppable({
    id: `section-droppable-${section.id}`,
    data: { type: "section", sectionId: section.id },
  });

  // Estado local do título editável.
  const [draft, setDraft] = useState(section.title);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setDraft(section.title);
  }, [section.title]);

  const commitTitle = () => {
    const trimmed = draft.trim();
    if (trimmed === section.title) return;
    onRenameSection(section.id, trimmed);
  };

  const onTitleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      inputRef.current?.blur();
    } else if (e.key === "Escape") {
      e.preventDefault();
      setDraft(section.title);
      inputRef.current?.blur();
    }
  };

  const displayTitle = section.title.trim() || TITLE_PLACEHOLDER;
  const hasTitle = Boolean(section.title.trim());

  return (
    <section
      className={cn(
        "rounded-[20px] border border-transparent transition-colors",
        // Hover/over feedback durante drag — borda fica brand pra deixar
        // claro que é alvo de drop válido.
        isEditing && "border-border/30",
        isOver && isEditing && "border-brand/60 bg-brand/5",
      )}
      data-section-id={section.id}
    >
      {/* Header da section: título + delete (edit mode).
          Removido o ícone "Heading2" à esquerda — visualmente lia como
          badge de markup ("H2") e poluía o título sem agregar info, já
          que o input/h2 abaixo já comunica que é título de seção.

          **Header NÃO renderiza em view mode quando o título está vazio**
          — sections sem nome ficam visualmente "transparentes" (só o
          espaçamento do `space-y-6` entre sections separa elas). Isso
          permite o usuário deixar sections sem título sem poluir o
          dashboard com placeholder ("Título da seção"). */}
      {(isEditing || hasTitle) && (
        <header
          className={cn(
            "mb-3 flex items-center gap-3 px-1",
            isEditing ? "pb-2 border-b border-dashed border-border/60" : "pb-1",
          )}
        >
          {isEditing ? (
            <input
              ref={inputRef}
              type="text"
              value={draft}
              onChange={(e) =>
                setDraft(e.target.value.slice(0, TITLE_MAX_LENGTH))
              }
              onBlur={commitTitle}
              onKeyDown={onTitleKeyDown}
              maxLength={TITLE_MAX_LENGTH}
              placeholder={TITLE_PLACEHOLDER}
              aria-label="Título da seção"
              className={cn(
                "flex-1 bg-transparent text-[18px] font-semibold leading-tight",
                "text-foreground placeholder:text-muted-foreground/50",
                "focus:outline-none rounded px-1 py-0.5",
                "focus:bg-muted/50",
              )}
            />
          ) : (
            // Em view mode só renderiza h2 se houver título — caso contrário,
            // este branch nem é alcançado (header inteiro escondido pelo guard).
            <h2 className="flex-1 truncate text-[18px] font-semibold leading-tight px-1 text-foreground">
              {section.title}
            </h2>
          )}

          {/* Delete section — edit mode only, e só se houver mais de 1 section */}
          {isEditing && canDelete && (
            <button
              type="button"
              onClick={() => onRemoveSection(section.id)}
              aria-label={`Remover seção ${displayTitle}`}
              title={`Remover seção "${displayTitle}" (items vão pra primeira section)`}
              className="
                flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg
                text-muted-foreground/70 transition-colors
                hover:bg-red-50 hover:text-red-700
                dark:hover:bg-red-950/40 dark:hover:text-red-300
              "
            >
              <Trash2 className="h-4 w-4" />
            </button>
          )}
        </header>
      )}

      {/* Container dos items — grid 12 cols. ref do droppable garante
          que solta na área vazia ainda registra essa section como alvo. */}
      <div
        ref={setDroppableRef}
        className={cn(
          "grid auto-rows-[88px] grid-cols-12 gap-5",
          // Empty state em edit mode pra não ficar invisível e dar alvo
          // de drop — gradient sutil indica "área de drop".
          isEditing && "min-h-[88px] rounded-xl",
          // **Dense packing em view mode**: browser reordena visualmente
          // items menores pra preencher gaps deixados por items maiores
          // (ex: linha `[6][4]` com gap de 2 cols pode receber um 4×2
          // posterior se ele couber em outra brecha de 4).
          // SÓ em view mode — durante edit, row-flow predictable evita
          // que items "pulem" enquanto o usuário arruma. O reflow visual
          // acontece naturalmente quando o usuário conclui a edição.
          !isEditing && "grid-flow-row-dense",
        )}
      >
        {children}
      </div>
    </section>
  );
}

"use client";

/**
 * SectionHeaderIsland (12×1)
 *
 * Divisor visual no dashboard que separa grupos de ilhas com um título.
 * NÃO é uma ilha de dados — é um layout primitive que reusa o sistema
 * de drag-drop/persistência das ilhas reais.
 *
 * Comportamento:
 *   - View mode: renderiza título grande + linha sutil abaixo
 *   - Edit mode: o título vira um `<input>` editável inline. Blur ou
 *     Enter salva via `onConfigChange`.
 *
 * Tamanho fixo 12×1 (full-width, 88px) — não negociável: header tem que
 * preencher a linha inteira pra cumprir o papel de divisor.
 *
 * Por que kind separado e não data tipo "isSection"?
 *   - Reusa drag-drop, persistência, multi-select sem código novo
 *   - Backend só precisa do `kind` no enum (uma string a mais)
 *   - Validação no IslandRegistry trata como qualquer ilha com config
 */

import { useEffect, useRef, useState } from "react";
import { Heading2 } from "lucide-react";

import { cn } from "@/src/components/ui/utils";

import type { IslandProps } from "../../interfaces/island.types";
import { useEditMode } from "../../hooks/useEditMode";
import { useDashboardLayoutContext } from "../../hooks/DashboardLayoutContext";

const TITLE_MAX_LENGTH = 64;
const PLACEHOLDER = "Título da seção";

export function SectionHeaderIsland({ islandId, config }: IslandProps) {
  const { isEditing } = useEditMode();
  const { updateItemConfig } = useDashboardLayoutContext();
  const inputRef = useRef<HTMLInputElement>(null);

  // Mantém o valor digitado em estado local (controlled input). Sincroniza
  // de volta no `onBlur` ou Enter — evita um PUT a cada keystroke (o
  // debounce do hook já cobre, mas sync por evento dá feedback mais
  // claro de "salvei").
  const [draft, setDraft] = useState(config.title ?? "");

  // Mantém o draft em sincronia se a config mudar de fora (ex: undo).
  useEffect(() => {
    setDraft(config.title ?? "");
  }, [config.title]);

  const commit = () => {
    const trimmed = draft.trim();
    if (trimmed === (config.title ?? "")) return;
    updateItemConfig(islandId, { title: trimmed });
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      inputRef.current?.blur();
    } else if (e.key === "Escape") {
      e.preventDefault();
      // Reverte ao último valor salvo
      setDraft(config.title ?? "");
      inputRef.current?.blur();
    }
  };

  const displayTitle = config.title?.trim() || PLACEHOLDER;
  const hasTitle = Boolean(config.title?.trim());

  return (
    <div className="flex h-full w-full items-center gap-3 px-2">
      {/* Ícone discreto à esquerda — identifica o "tipo" do bloco sem
          competir com o texto. */}
      <span
        className={cn(
          "flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg",
          "bg-muted text-muted-foreground",
        )}
        aria-hidden
      >
        <Heading2 className="h-4 w-4" />
      </span>

      {/* Título — editável em edit mode, plain heading em view mode.
          IslandFrame aplica `pointer-events-none` no content em edit mode
          pra travar interação com data-ilhas. Section_header precisa
          burlar isso porque o input É a interação de edit mode — daí o
          `pointer-events-auto` explícito. */}
      {isEditing ? (
        <input
          ref={inputRef}
          type="text"
          value={draft}
          onChange={(e) => setDraft(e.target.value.slice(0, TITLE_MAX_LENGTH))}
          onBlur={commit}
          onKeyDown={onKeyDown}
          maxLength={TITLE_MAX_LENGTH}
          placeholder={PLACEHOLDER}
          aria-label="Título da seção"
          className={cn(
            "pointer-events-auto select-text",
            "flex-1 bg-transparent text-[20px] font-semibold leading-tight",
            "text-foreground placeholder:text-muted-foreground/50",
            "focus:outline-none",
            // Border-bottom visível em edit mode pra dar affordance de
            // "isso é um campo editável"
            "border-b border-dashed border-border focus:border-brand/60",
            "px-1 py-1.5",
          )}
        />
      ) : (
        <h2
          className={cn(
            "flex-1 truncate border-b border-border/40 px-1 py-1.5",
            "text-[20px] font-semibold leading-tight",
            hasTitle ? "text-foreground" : "text-muted-foreground/50 italic",
          )}
        >
          {displayTitle}
        </h2>
      )}
    </div>
  );
}

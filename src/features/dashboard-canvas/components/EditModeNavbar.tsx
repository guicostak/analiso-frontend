"use client";

/**
 * EditModeNavbar
 *
 * Barra **sticky** que reúne todos os controles de edição num só lugar:
 *   - PresetSelect (esquerda) — qual preset está ativo + apply/save/delete
 *   - "+ Adicionar ilha" — abre o sheet de catálogo
 *   - "+ Nova seção" — adiciona divisor de seção (título editável)
 *   - "Restaurar padrão" — volta pro layout default (com toast undo)
 *   - "Descartar alterações" — reverte ao snapshot + sai do edit mode
 *   - "Concluir personalização" — só sai do edit mode (mudanças já foram
 *     persistidas pelo debounced PUT)
 *
 * Visual hierarchy aplicada (Refactoring UI):
 *   - **Primary** (1): Concluir — filled brand, levemente maior, shadow
 *   - **Secondary** (2): Adicionar ilha, Nova seção — default ghost com
 *     ícone solid (ações construtivas)
 *   - **Tertiary** (3): PresetSelect — destaque pelo label flutuante acima
 *   - **Quartenary** (4): Descartar, Restaurar — text-button minimalistas
 *     com ícone discreto (ações destrutivas, mas reversíveis)
 *
 * Spacing scale: gap-1 dentro de grupos, gap-3 entre grupos, dividers
 * verticais sutis em md+ pra reforçar agrupamento sem ruído.
 *
 * Surface: pill flutuante com `rounded-2xl` em todos os cantos + shadow
 * de elevação. Anchored em `top-3` (não top-0) pra dar respiro do topo
 * da viewport — sensação de "barra flutuando" em vez de "barra colada".
 */

import { useEffect, useRef } from "react";
import { Check, FolderPlus, Plus, RotateCcw, Undo2 } from "lucide-react";

import { cn } from "@/src/components/ui/utils";

import type { LayoutPreset } from "../defaults/presets";
import { PresetSelect } from "./PresetSelect";

export interface EditModeNavbarProps {
  customPresets: LayoutPreset[];
  activePresetId: string | null;
  layoutItemCount: number;
  onApplyPreset: (preset: LayoutPreset) => void;
  onSaveCustomPreset: (label: string) => void;
  onDeleteCustomPreset: (preset: LayoutPreset) => void;
  onAddIsland: () => void;
  onAddSection: () => void;
  onResetLayout: () => void;
  onDiscardChanges: () => void;
  onConcludeEdit: () => void;
}

export function EditModeNavbar({
  customPresets,
  activePresetId,
  layoutItemCount,
  onApplyPreset,
  onSaveCustomPreset,
  onDeleteCustomPreset,
  onAddIsland,
  onAddSection,
  onResetLayout,
  onDiscardChanges,
  onConcludeEdit,
}: EditModeNavbarProps) {
  const navbarRef = useRef<HTMLDivElement | null>(null);

  // Quando entra no edit mode, se o usuário estava scrolled DEBAIXO da
  // posição natural da navbar, o `position: sticky` faz a navbar grudar
  // logo abaixo do AppTopBar e o conteúdo das ilhas onde o usuário
  // estava continua atrás dela — percepção de "sobreposição".
  //
  // Fix: ao montar a navbar (entrar edit mode), scrolla pra ela ficar
  // visível ABAIXO do AppTopBar. Threshold de 64px = altura do AppTopBar
  // (56) + respiro (8). Se a navbar já está visível abaixo desse limiar,
  // não precisa scroll.
  useEffect(() => {
    const el = navbarRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    // 64 = mesmo valor do `top-16` da sticky. Mantém em sincronia.
    const STICKY_TOP_OFFSET = 64;
    if (rect.top < STICKY_TOP_OFFSET) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
    // Roda só uma vez no mount (= entrar em edit mode). Não precisa de
    // deps — o componente sempre desmonta ao sair do edit mode.
  }, []);

  return (
    <div
      ref={navbarRef}
      className={cn(
        // Sticky: desce com o scroll, mas COLA logo abaixo do AppTopBar
        // (que é fixed top:0 com h-14 = 56px). Usar top:64 (= 56 + 8 de
        // respiro) garante que a navbar nunca sobreponha o topbar do app.
        // Antes era top-3 (12px) e a navbar caía dentro da área do
        // AppTopBar — overlap visual.
        "sticky top-16 z-40 py-2.5 px-3",
        // Pill flutuante: rounded full nos cantos pra todos os lados,
        // border completa, padding interno generoso. Refactoring UI #5
        // (Depth & Shadows): shadow-md pra deixar claro que tá elevada
        // acima do canvas que rola atrás.
        "rounded-2xl border border-border/80",
        // **Bg 100% opaco** — usar gradient com transparência (`to-card/95`)
        // deixava conteúdo das ilhas vazar pela borda inferior da pill
        // durante scroll, criando percepção de "sobreposição". Solid
        // bg-card mascara perfeitamente.
        "bg-card backdrop-blur-md",
        "shadow-[0_4px_16px_-6px_rgba(15,23,40,0.12),0_12px_32px_-12px_rgba(15,23,40,0.08)]",
        "dark:shadow-[0_4px_16px_-6px_rgba(0,0,0,0.4)] dark:border-border",
      )}
      role="toolbar"
      aria-label="Controles de edição do dashboard"
    >
      {/* items-end alinha o trigger do PresetSelect (que tem label acima)
          com os outros botões pelo eixo da base. */}
      <div className="flex flex-wrap items-end gap-3">
        {/* ─── Grupo 1: Contexto (qual preset estou editando) ─── */}
        <PresetSelect
          customPresets={customPresets}
          activePresetId={activePresetId}
          layoutItemCount={layoutItemCount}
          allowMutations
          onApplyPreset={onApplyPreset}
          onSaveCustomPreset={onSaveCustomPreset}
          onDeleteCustomPreset={onDeleteCustomPreset}
        />

        {/* Divider visual entre contexto e ações construtivas — só aparece
            em telas largas (md+). Em mobile o flex-wrap já dá a quebra. */}
        <span className="hidden h-6 w-px bg-border/70 md:block" aria-hidden />

        {/* ─── Grupo 2: Ações construtivas (+ ilha, + seção) ─── */}
        <div className="flex items-center gap-1">
          {/* Adicionar ilha — variante `emerald` destaca como ação
              construtiva primária dentro deste grupo. Verde casa com a
              semântica universal de "+" / "criar". */}
          <button
            type="button"
            onClick={onAddIsland}
            className={navButtonClass("emerald")}
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Adicionar ilha</span>
          </button>

          <button
            type="button"
            onClick={onAddSection}
            className={navButtonClass("ghost")}
            title="Adiciona um divisor de seção com título editável"
          >
            <FolderPlus className="h-3.5 w-3.5" />
            <span>Nova seção</span>
          </button>
        </div>

        {/* Spacer */}
        <div className="ml-auto flex flex-wrap items-center gap-3">
          {/* ─── Grupo 3: Ações destrutivas (text-button minimal) ─── */}
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={onResetLayout}
              className={navButtonClass("text")}
              title="Restaura o layout default da Analiso"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Restaurar padrão</span>
            </button>

            <button
              type="button"
              onClick={onDiscardChanges}
              className={navButtonClass("text")}
              title="Reverte para o estado anterior à sessão de edição"
            >
              <Undo2 className="h-3.5 w-3.5" />
              <span>Descartar alterações</span>
            </button>
          </div>

          {/* Divider entre ações secundárias e CTA primário */}
          <span className="hidden h-6 w-px bg-border/70 md:block" aria-hidden />

          {/* ─── Grupo 4: Primary CTA — filled brand, único destaque máximo ─── */}
          <button
            type="button"
            onClick={onConcludeEdit}
            className={cn(
              "inline-flex h-9 items-center gap-1.5 rounded-full px-4",
              "bg-brand text-[12.5px] font-semibold text-white",
              "shadow-[0_2px_8px_-2px_rgba(36,127,255,0.4)]",
              "transition-all duration-150",
              "hover:bg-brand-hover hover:shadow-[0_4px_12px_-2px_rgba(36,127,255,0.5)]",
              "active:scale-[0.98]",
            )}
          >
            <Check className="h-3.5 w-3.5" />
            Concluir personalização
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * Classes compartilhadas pelos botões secundários da navbar. 3 variantes:
 *   - `ghost`: card neutro com border, hover acentua (ações construtivas
 *     genéricas; usado por "Nova seção")
 *   - `text`: sem border/bg, só hover sutil (ações destrutivas reversíveis)
 *   - `emerald`: tint verde — semântica de "criar/adicionar" (universal
 *     "+", positivo, construtivo). Distinta do brand-blue do Concluir e
 *     do amber das ações destrutivas. Usado por "Adicionar ilha".
 *
 * Manter a fonte/altura iguais entre variantes preserva o ritmo horizontal.
 */
function navButtonClass(variant: "ghost" | "text" | "emerald"): string {
  const base =
    "inline-flex h-9 items-center gap-1.5 rounded-full px-3 text-[12.5px] font-semibold transition-colors duration-150";
  if (variant === "ghost") {
    return cn(
      base,
      "border border-border bg-card text-foreground hover:border-brand/40 hover:bg-hover",
    );
  }
  if (variant === "emerald") {
    return cn(
      base,
      "border border-emerald-300 bg-emerald-50 text-emerald-800",
      "hover:border-emerald-400 hover:bg-emerald-100",
      "dark:border-emerald-900/60 dark:bg-emerald-950/30 dark:text-emerald-300",
      "dark:hover:bg-emerald-950/50",
    );
  }
  return cn(
    base,
    "text-muted-foreground hover:bg-muted hover:text-foreground",
  );
}

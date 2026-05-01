"use client";

/**
 * PresetSelect
 *
 * Dropdown único pra selecionar/aplicar/criar/deletar presets. Substitui
 * o chip strip horizontal — formato de select casa melhor com o mental
 * model de "qual preset estou usando agora" (single choice, sempre 1
 * ativo) e ocupa muito menos espaço.
 *
 * Trigger mostra:
 *   - Eyebrow "PRESET" pequeno (label de campo)
 *   - Ícone + nome do preset ativo, OU "● Personalizado" se layout diverge
 *   - Chevron pra deixar claro que é dropdown
 *
 * Conteúdo do dropdown:
 *   - Lista vertical de todos presets (built-in primeiro, custom depois)
 *   - Cada item: ícone + nome + meta (audience pra built-in, "N ilhas" pra custom)
 *   - Item ativo tem checkmark à direita (Recognition over Recall)
 *   - Custom items têm trash sempre-visível (não hover-only — anti-pattern)
 *   - Footer: "+ Salvar layout atual" com inline-form ao clicar
 */

import { useEffect, useRef, useState } from "react";
import {
  Bookmark,
  Check,
  ChevronDown,
  Edit3,
  Plus,
  Sparkles,
  Trash2,
  Wallet,
  X,
  type LucideIcon,
} from "lucide-react";

import { cn } from "@/src/components/ui/utils";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/src/components/ui/popover";

import { LAYOUT_PRESETS, type BuiltInPresetId, type LayoutPreset } from "../defaults/presets";

const SAVE_NAME_MAX_LENGTH = 32;

const BUILT_IN_PRESET_ICONS: Record<BuiltInPresetId, LucideIcon> = {
  foco_watchlist: Wallet,
};

function getPresetIcon(preset: LayoutPreset | null | undefined): LucideIcon {
  if (!preset) return Sparkles;
  if (preset.isCustom) return Bookmark;
  return BUILT_IN_PRESET_ICONS[preset.id as BuiltInPresetId] ?? Sparkles;
}

export interface PresetSelectProps {
  customPresets: LayoutPreset[];
  activePresetId: string | null;
  /** Quantidade de ilhas no layout — desabilita save quando 0. */
  layoutItemCount: number;
  /**
   * Permite criar novos presets e deletar customs. View mode passa false
   * pra esconder essas affordances; edit mode passa true.
   */
  allowMutations: boolean;
  onApplyPreset: (preset: LayoutPreset) => void;
  onSaveCustomPreset: (label: string) => void;
  onDeleteCustomPreset: (preset: LayoutPreset) => void;
}

export function PresetSelect({
  customPresets,
  activePresetId,
  layoutItemCount,
  allowMutations,
  onApplyPreset,
  onSaveCustomPreset,
  onDeleteCustomPreset,
}: PresetSelectProps) {
  const [open, setOpen] = useState(false);
  const [savingMode, setSavingMode] = useState(false);
  const [presetName, setPresetName] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  // Reset do save form quando o popover fecha — evita vazar estado.
  useEffect(() => {
    if (!open) {
      setSavingMode(false);
      setPresetName("");
    }
  }, [open]);

  // Sai do save mode se `allowMutations` virar false (ex: usuário sai do
  // edit mode com o popover aberto).
  useEffect(() => {
    if (!allowMutations) {
      setSavingMode(false);
      setPresetName("");
    }
  }, [allowMutations]);

  // Auto-foco no input quando entra em modo de salvar.
  useEffect(() => {
    if (savingMode) {
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [savingMode]);

  const allPresets = [...LAYOUT_PRESETS, ...customPresets];
  const activePreset = allPresets.find((p) => p.id === activePresetId) ?? null;
  const ActiveIcon = getPresetIcon(activePreset);
  const canSave = layoutItemCount > 0;

  const handleApply = (preset: LayoutPreset) => {
    onApplyPreset(preset);
    setOpen(false);
  };

  const beginSaving = () => {
    setSavingMode(true);
    setPresetName("");
  };

  const cancelSaving = () => {
    setSavingMode(false);
    setPresetName("");
  };

  const commitSave = () => {
    const trimmed = presetName.trim();
    if (!trimmed) return;
    onSaveCustomPreset(trimmed);
    setSavingMode(false);
    setPresetName("");
    setOpen(false);
  };

  const onPresetNameKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      commitSave();
    } else if (e.key === "Escape") {
      e.preventDefault();
      cancelSaving();
    }
  };

  // Label "PRESET" vive acima do trigger, no padrão de form field —
  // clareza maior pra UX heuristic "Match Real World" (Nielsen #2): o
  // usuário reconhece o padrão "campo + valor" instantaneamente.
  const isPersonalizado = !activePreset;
  const triggerLabel = activePreset ? activePreset.label : "Personalizado";
  const TriggerIcon = isPersonalizado ? Edit3 : ActiveIcon;

  return (
    <div className="flex flex-col items-start gap-1">
      <span
        className="ml-1 select-none text-[9.5px] font-semibold uppercase tracking-[0.08em] text-muted-foreground"
        id="preset-select-label"
      >
        Preset
      </span>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            type="button"
            aria-labelledby="preset-select-label"
            aria-label={`Preset ativo: ${triggerLabel}`}
            className={cn(
              "inline-flex h-9 items-center gap-2 rounded-full px-3.5 text-[13px] font-semibold transition-colors",
              "border focus:outline-none focus-visible:ring-2 focus-visible:ring-brand/40",
              // Estado "Personalizado" recebe tom mais sutil (border dashed
              // + texto muted) pra comunicar "ainda não foi salvo" sem
              // gritar. Estado com preset ativo usa tom solid normal.
              isPersonalizado
                ? "border-dashed border-border bg-card/60 text-muted-foreground hover:border-brand/40 hover:bg-card hover:text-foreground"
                : "border-border bg-card text-foreground hover:bg-hover",
            )}
          >
            <TriggerIcon
              className={cn(
                "h-3.5 w-3.5",
                isPersonalizado && "text-muted-foreground/80",
              )}
            />
            <span className="max-w-[160px] truncate">{triggerLabel}</span>
            <ChevronDown
              className={cn(
                "h-3.5 w-3.5 text-muted-foreground transition-transform",
                open && "rotate-180",
              )}
            />
          </button>
        </PopoverTrigger>

      <PopoverContent
        align="start"
        sideOffset={8}
        className="w-[320px] overflow-hidden p-0"
      >
        <div className="border-b border-border px-4 py-2.5">
          <p className="text-[10.5px] font-semibold uppercase tracking-wide text-muted-foreground">
            Aplicar um preset
          </p>
          <p className="mt-0.5 text-[11px] text-muted-foreground/80">
            Substitui o layout atual (5s pra desfazer).
          </p>
        </div>

        <div className="max-h-[280px] overflow-y-auto py-1">
          {allPresets.length === 0 ? (
            <p className="px-4 py-6 text-center text-[12px] text-muted-foreground">
              Nenhum preset disponível.
            </p>
          ) : (
            allPresets.map((preset) => {
              const Icon = getPresetIcon(preset);
              const isActive = preset.id === activePresetId;
              const meta = preset.isCustom
                ? `${preset.items.length} ilha${preset.items.length === 1 ? "" : "s"}`
                : preset.audience;
              return (
                <div
                  key={preset.id}
                  className="flex items-center gap-1 px-2 py-0.5"
                >
                  <button
                    type="button"
                    onClick={() => handleApply(preset)}
                    className={cn(
                      "flex flex-1 items-center gap-2.5 rounded-lg px-2 py-2 text-left transition-colors hover:bg-muted focus:bg-muted focus:outline-none",
                      isActive && "bg-muted/60",
                    )}
                  >
                    <span
                      className={cn(
                        "flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg",
                        preset.isCustom
                          ? "bg-brand/10 text-brand"
                          : "bg-muted text-foreground",
                      )}
                    >
                      <Icon className="h-3.5 w-3.5" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[12.5px] font-semibold text-foreground">
                        {preset.label}
                      </span>
                      {meta && (
                        <span className="block truncate text-[10.5px] text-muted-foreground">
                          {meta}
                        </span>
                      )}
                    </span>
                    {isActive && (
                      <Check
                        className="h-3.5 w-3.5 flex-shrink-0 text-brand"
                        aria-label="Preset ativo"
                      />
                    )}
                  </button>

                  {/* Trash sempre visível em customs (edit mode). Em view
                      mode (`allowMutations=false`), oculto. */}
                  {allowMutations && preset.isCustom && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteCustomPreset(preset);
                      }}
                      aria-label={`Deletar preset ${preset.label}`}
                      title="Deletar preset"
                      className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg text-muted-foreground/60 transition-colors hover:bg-amber-50 hover:text-amber-700 dark:hover:bg-amber-950/40 dark:hover:text-amber-400"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Footer: salvar layout atual — apenas em edit mode. */}
        {allowMutations && (
          <div className="border-t border-border bg-muted/40 p-2">
            {savingMode ? (
              <div className="flex items-center gap-1.5">
                <input
                  ref={inputRef}
                  type="text"
                  value={presetName}
                  onChange={(e) =>
                    setPresetName(e.target.value.slice(0, SAVE_NAME_MAX_LENGTH))
                  }
                  onKeyDown={onPresetNameKeyDown}
                  placeholder="Nome do preset"
                  maxLength={SAVE_NAME_MAX_LENGTH}
                  className="flex-1 rounded-md border border-border bg-card px-2.5 py-1.5 text-[12px] text-foreground placeholder:text-muted-foreground/60 focus:border-brand/40 focus:outline-none focus:ring-2 focus:ring-brand/20"
                />
                <button
                  type="button"
                  onClick={commitSave}
                  disabled={!presetName.trim()}
                  aria-label="Salvar preset"
                  className={cn(
                    "flex h-7 w-7 items-center justify-center rounded-md bg-brand text-white transition hover:bg-brand-hover",
                    !presetName.trim() &&
                      "cursor-not-allowed opacity-50 hover:bg-brand",
                  )}
                >
                  <Check className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={cancelSaving}
                  aria-label="Cancelar"
                  className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={beginSaving}
                disabled={!canSave}
                title={
                  canSave
                    ? "Salvar layout atual como preset"
                    : "Adicione pelo menos uma ilha primeiro"
                }
                className={cn(
                  "flex w-full items-center justify-center gap-1.5 rounded-md border border-dashed border-border bg-card py-2 text-[11.5px] font-semibold text-muted-foreground transition-colors hover:border-brand/40 hover:bg-card hover:text-brand",
                  !canSave &&
                    "cursor-not-allowed opacity-50 hover:border-border hover:text-muted-foreground",
                )}
              >
                <Plus className="h-3.5 w-3.5" />
                Salvar layout atual como preset
              </button>
            )}
          </div>
        )}
      </PopoverContent>
      </Popover>
    </div>
  );
}

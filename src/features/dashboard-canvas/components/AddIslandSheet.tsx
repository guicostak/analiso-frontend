"use client";

/**
 * AddIslandSheet
 *
 * Catálogo lateral (Sheet à direita) para o usuário adicionar novas ilhas
 * ao seu canvas. Usa `cmdk` (Command) para search e agrupa por categoria
 * (Núcleo / Acúmulo / Contexto).
 *
 * Escopo: APENAS adicionar ilhas individuais. Gestão de presets (aplicar,
 * salvar layout atual, deletar custom) vive no `PresetSelect` dentro da
 * `EditModeNavbar` sticky — separação por job-to-be-done (adicionar peça
 * vs. trocar cena inteira são mental models distintos).
 *
 * Cada item exibe:
 *   - ícone (lucide), label, descrição curta
 *   - marcador "Adicionada" se já estiver no layout atual (disabled)
 *   - check colorido quando o usuário marca pra incluir nesta sessão
 *
 * **Multi-select:** click em uma ilha disponível adiciona à seleção (não
 * adiciona imediatamente ao layout). Footer sticky mostra contador e CTA
 * "Adicionar N ilhas" — uma única commitada, um único PUT no servidor.
 * Pra adicionar uma só ilha continua valendo: marca + confirma. ESC ou
 * fechar sheet descarta a seleção.
 */

import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  AlertTriangle,
  BarChart3,
  Bell,
  Building2,
  Calendar,
  Check,
  Compass,
  Database,
  GitCompare,
  Globe,
  Grid3x3,
  Heading2,
  Heart,
  History,
  LineChart,
  Newspaper,
  PlayCircle,
  Plus,
  Radio,
  Search,
  Settings2,
  Sparkles,
  Sun,
  Target,
  TrendingUp,
  Wallet,
  type LucideIcon,
} from "lucide-react";

import { cn } from "@/src/components/ui/utils";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/src/components/ui/sheet";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/src/components/ui/command";

import { listIslands, type IslandRegistryEntry } from "../registry/IslandRegistry";
import type { IslandCategory } from "../interfaces/island.types";
import type { DashboardLayout, IslandKind } from "../interfaces/layout.types";

const ICONS: Record<string, LucideIcon> = {
  Sun,
  Target,
  AlertTriangle,
  TrendingUp,
  Heart,
  Activity,
  BarChart3,
  PlayCircle,
  Building2,
  Search,
  GitCompare,
  Calendar,
  Bell,
  Radio,
  Compass,
  Grid3x3,
  Database,
  Newspaper,
  Sparkles,
  Settings2,
  Globe,
  Heading2,
  History,
  LineChart,
  Wallet,
};

const CATEGORY_LABEL: Record<IslandCategory, string> = {
  core:     "Núcleo",
  acumulo:  "Acúmulo",
  contexto: "Contexto",
};

const CATEGORY_ORDER: IslandCategory[] = ["core", "acumulo", "contexto"];

export interface AddIslandSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  layout: DashboardLayout;
  /**
   * Confirma a inclusão de UMA OU VÁRIAS ilhas. Recebe a lista de kinds
   * selecionados — o caller é responsável por gerar IDs únicos e despachar
   * o `addItems` agregado (uma única atualização de estado, um único PUT).
   */
  onAddIslands: (kinds: IslandKind[]) => void;
}

interface CatalogItem {
  entry: IslandRegistryEntry;
  alreadyInLayout: boolean;
}

export function AddIslandSheet({
  open,
  onOpenChange,
  layout,
  onAddIslands,
}: AddIslandSheetProps) {
  const presentKinds = useMemo(
    () => new Set(layout.items.map((item) => item.kind)),
    [layout.items],
  );

  // Seleção transitória — vive só enquanto o sheet está aberto. Fechar
  // (ESC, click fora, cancelar) descarta tudo. Confirmar dispara onAddIslands
  // e também limpa.
  const [selected, setSelected] = useState<Set<IslandKind>>(new Set());

  // Reset da seleção sempre que o sheet abre/fecha. Sem isso, abrir o sheet
  // depois de cancelar manteria o estado da sessão anterior — confuso.
  useEffect(() => {
    if (!open) {
      setSelected(new Set());
    }
  }, [open]);

  const itemsByCategory = useMemo(() => {
    const all = listIslands();
    const groups = new Map<IslandCategory, CatalogItem[]>();
    for (const cat of CATEGORY_ORDER) groups.set(cat, []);
    for (const entry of all) {
      // section_header é layout primitive — não aparece no catálogo
      // de "Adicionar ilha". É adicionada via "+ Nova seção" do navbar.
      if (entry.meta.kind === "section_header") continue;
      const bucket = groups.get(entry.meta.category);
      if (!bucket) continue;
      bucket.push({
        entry,
        alreadyInLayout: presentKinds.has(entry.meta.kind as IslandKind),
      });
    }
    return groups;
  }, [presentKinds]);

  const toggleSelected = (kind: IslandKind) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(kind)) next.delete(kind);
      else next.add(kind);
      return next;
    });
  };

  const handleSelect = (kind: IslandKind, alreadyInLayout: boolean) => {
    if (alreadyInLayout) return;  // disabled — não faz nada
    toggleSelected(kind);
  };

  const handleConfirm = () => {
    if (selected.size === 0) return;
    onAddIslands(Array.from(selected));
    onOpenChange(false);
  };

  const handleClearSelection = () => {
    setSelected(new Set());
  };

  const selectedCount = selected.size;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="flex w-full flex-col p-0 sm:max-w-md"
      >
        <SheetHeader className="border-b border-border p-5">
          <SheetTitle className="text-[16px] font-semibold text-foreground">
            Adicionar ilhas
          </SheetTitle>
          <SheetDescription className="text-[12px] text-muted-foreground">
            Marque quantas quiser e confirme abaixo. Você pode reordenar ou
            remover depois.
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-hidden">
          <Command className="h-full">
            <CommandInput placeholder="Buscar ilha..." />
            <CommandList
              className={cn(
                // Reduz a altura quando o footer aparece pra não cortar
                // os últimos itens da lista (footer ~64px). Sem preset
                // section no topo, a altura padrão é maior que antes.
                selectedCount > 0
                  ? "max-h-[calc(100vh-18rem)]"
                  : "max-h-[calc(100vh-14rem)]",
              )}
            >
              <CommandEmpty>Nenhuma ilha encontrada.</CommandEmpty>
              {CATEGORY_ORDER.map((category) => {
                const items = itemsByCategory.get(category) ?? [];
                if (items.length === 0) return null;
                return (
                  <CommandGroup
                    key={category}
                    heading={CATEGORY_LABEL[category]}
                  >
                    {items.map(({ entry, alreadyInLayout }) => {
                      const Icon = ICONS[entry.meta.icon] ?? Sparkles;
                      const kind = entry.meta.kind as IslandKind;
                      const isSelected = selected.has(kind);
                      return (
                        <CommandItem
                          key={entry.meta.kind}
                          value={`${entry.meta.label} ${entry.meta.description}`}
                          onSelect={() => handleSelect(kind, alreadyInLayout)}
                          disabled={alreadyInLayout}
                          className={cn(
                            "items-start gap-3 py-3 transition-colors",
                            alreadyInLayout && "opacity-60",
                            isSelected &&
                              "border border-brand/40 bg-brand/5 data-[selected=true]:bg-brand/10",
                          )}
                        >
                          <span
                            className={cn(
                              "mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-colors",
                              isSelected
                                ? "bg-brand text-white"
                                : "bg-muted text-foreground",
                            )}
                          >
                            <Icon className="h-4 w-4" />
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="flex items-center gap-2">
                              <span className="truncate text-[13px] font-semibold text-foreground">
                                {entry.meta.label}
                              </span>
                              {alreadyInLayout && (
                                <span className="inline-flex items-center gap-0.5 rounded-full bg-muted px-1.5 py-0.5 text-[9px] font-semibold text-muted-foreground">
                                  <Check className="h-2.5 w-2.5" />
                                  Adicionada
                                </span>
                              )}
                            </span>
                            <span className="mt-0.5 block text-[11px] leading-snug text-muted-foreground">
                              {entry.meta.description}
                            </span>
                          </span>
                          {!alreadyInLayout &&
                            (isSelected ? (
                              <Check className="h-4 w-4 shrink-0 text-brand" />
                            ) : (
                              <Plus className="h-4 w-4 shrink-0 text-muted-foreground" />
                            ))}
                        </CommandItem>
                      );
                    })}
                  </CommandGroup>
                );
              })}
            </CommandList>
          </Command>
        </div>

        {/* Footer sticky — aparece só quando há seleção. Visualmente
            estável: sempre 64px de altura, fade-in suave em vez de
            jumpcut do layout quando aparece. */}
        {selectedCount > 0 && (
          <div className="border-t border-border bg-card p-4">
            <div className="flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={handleClearSelection}
                className="text-[12px] font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                Limpar seleção
              </button>
              <button
                type="button"
                onClick={handleConfirm}
                className="inline-flex items-center gap-1.5 rounded-full bg-brand px-4 py-2 text-[12.5px] font-semibold text-white shadow-sm transition hover:bg-brand-hover active:scale-[0.98]"
              >
                <Plus className="h-3.5 w-3.5" />
                Adicionar {selectedCount} ilha{selectedCount === 1 ? "" : "s"}
              </button>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}

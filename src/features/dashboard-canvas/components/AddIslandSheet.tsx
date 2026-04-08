"use client";

/**
 * AddIslandSheet
 *
 * Catálogo lateral (Sheet à direita) para o usuário adicionar novas ilhas
 * ao seu canvas. Usa `cmdk` (Command) para search e agrupa por categoria
 * (Core / Acúmulo / Contexto / Premium).
 *
 * Cada item exibe:
 *   - ícone (lucide), label, descrição curta
 *   - badge de categoria
 *   - badge "Pro" quando `requiresPlan === "premium"` e usuário não-pago
 *     (apenas visual — backend é o gate real)
 *   - marcador "Adicionada" se já estiver no layout atual
 *
 * Click adiciona a ilha ao primeiro slot livre via `addItem`.
 */

import { useMemo } from "react";
import {
  Activity,
  AlertTriangle,
  Bell,
  Building2,
  Calendar,
  Check,
  Compass,
  Database,
  GitCompare,
  Grid3x3,
  Heart,
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
};

const CATEGORY_LABEL: Record<IslandCategory, string> = {
  core:     "Núcleo",
  acumulo:  "Acúmulo",
  contexto: "Contexto",
  premium:  "Premium",
};

const CATEGORY_ORDER: IslandCategory[] = ["core", "acumulo", "contexto", "premium"];

export interface AddIslandSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  layout: DashboardLayout;
  onAddIsland: (kind: IslandKind) => void;
  /** Plano do usuário — quando false, ilhas premium ganham badge "Pro". */
  isPaid?: boolean;
}

interface CatalogItem {
  entry: IslandRegistryEntry;
  alreadyInLayout: boolean;
  showProBadge: boolean;
}

export function AddIslandSheet({
  open,
  onOpenChange,
  layout,
  onAddIsland,
  isPaid = false,
}: AddIslandSheetProps) {
  const presentKinds = useMemo(
    () => new Set(layout.items.map((item) => item.kind)),
    [layout.items],
  );

  const itemsByCategory = useMemo(() => {
    const all = listIslands();
    const groups = new Map<IslandCategory, CatalogItem[]>();
    for (const cat of CATEGORY_ORDER) groups.set(cat, []);
    for (const entry of all) {
      const cat: IslandCategory =
        entry.meta.requiresPlan === "premium" ? "premium" : entry.meta.category;
      const bucket = groups.get(cat);
      if (!bucket) continue;
      bucket.push({
        entry,
        alreadyInLayout: presentKinds.has(entry.meta.kind as IslandKind),
        showProBadge: entry.meta.requiresPlan === "premium" && !isPaid,
      });
    }
    return groups;
  }, [presentKinds, isPaid]);

  const handleSelect = (kind: IslandKind, alreadyInLayout: boolean) => {
    if (alreadyInLayout) {
      onOpenChange(false);
      return;
    }
    onAddIsland(kind);
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full p-0 sm:max-w-md"
      >
        <SheetHeader className="border-b border-border p-5">
          <SheetTitle className="text-[16px] font-semibold text-foreground">
            Adicionar ilha
          </SheetTitle>
          <SheetDescription className="text-[12px] text-muted-foreground">
            Escolha uma ilha para incluir no seu painel. Você pode reordenar
            ou remover depois.
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-hidden">
          <Command className="h-full">
            <CommandInput placeholder="Buscar ilha..." />
            <CommandList className="max-h-[calc(100vh-11rem)]">
              <CommandEmpty>Nenhuma ilha encontrada.</CommandEmpty>
              {CATEGORY_ORDER.map((category) => {
                const items = itemsByCategory.get(category) ?? [];
                if (items.length === 0) return null;
                return (
                  <CommandGroup
                    key={category}
                    heading={CATEGORY_LABEL[category]}
                  >
                    {items.map(({ entry, alreadyInLayout, showProBadge }) => {
                      const Icon = ICONS[entry.meta.icon] ?? Sparkles;
                      return (
                        <CommandItem
                          key={entry.meta.kind}
                          value={`${entry.meta.label} ${entry.meta.description}`}
                          onSelect={() =>
                            handleSelect(
                              entry.meta.kind as IslandKind,
                              alreadyInLayout,
                            )
                          }
                          disabled={alreadyInLayout}
                          className={cn(
                            "items-start gap-3 py-3",
                            alreadyInLayout && "opacity-60",
                          )}
                        >
                          <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted text-foreground">
                            <Icon className="h-4 w-4" />
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="flex items-center gap-2">
                              <span className="truncate text-[13px] font-semibold text-foreground">
                                {entry.meta.label}
                              </span>
                              {showProBadge && (
                                <span className="rounded-full bg-amber-100 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-amber-800 dark:bg-amber-950/60 dark:text-amber-300">
                                  Pro
                                </span>
                              )}
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
                          {!alreadyInLayout && (
                            <Plus className="h-4 w-4 shrink-0 text-muted-foreground" />
                          )}
                        </CommandItem>
                      );
                    })}
                  </CommandGroup>
                );
              })}
            </CommandList>
          </Command>
        </div>
      </SheetContent>
    </Sheet>
  );
}

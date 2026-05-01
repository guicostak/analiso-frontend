"use client";

/**
 * useCustomPresets
 *
 * Gerencia presets customizados criados pelo usuário (nome livre, snapshot
 * do layout atual). Persiste em `localStorage` — escolha consciente:
 *
 *   - O layout principal já sincroniza via backend, então o usuário não
 *     "perde" o dashboard se trocar de máquina.
 *   - Presets custom são atalhos pessoais (estilo "modo trade", "fim de
 *     semana") — útil mas não crítico se ficar local.
 *   - Evita criar endpoints REST adicionais nesta primeira versão.
 *
 * Pra mover pro backend depois: trocar `useLocalStorageState` por um hook
 * que faz GET/PUT, mantendo a mesma API pública.
 */

import { useCallback, useMemo } from "react";

import { useLocalStorageState } from "@/src/hooks";

import {
  buildCustomPresetFromLayout,
  type LayoutPreset,
} from "../defaults/presets";
import type { DashboardLayout } from "../interfaces/layout.types";

const CUSTOM_PRESETS_KEY = "analiso:dashboard-custom-presets:v1";

export interface UseCustomPresetsReturn {
  /** Lista de presets custom, mais recente primeiro. */
  presets: LayoutPreset[];
  /**
   * Salva o `layout` informado como um novo preset com `label`.
   * `label` é trimado e validado (não vazio). Retorna o preset criado
   * pra o caller dar feedback (toast, etc.) ou `null` se inválido.
   */
  save: (label: string, layout: DashboardLayout) => LayoutPreset | null;
  /** Remove um preset por ID. Idempotente — ID inexistente é no-op. */
  remove: (id: string) => void;
  /**
   * Restaura um preset previamente removido — usado pelo undo via toast.
   * Insere mantendo a ordem por `createdAt` (mais novo primeiro).
   */
  restore: (preset: LayoutPreset) => void;
}

export function useCustomPresets(): UseCustomPresetsReturn {
  const [stored, setStored] = useLocalStorageState<LayoutPreset[]>(
    CUSTOM_PRESETS_KEY,
    [],
  );

  // Ordena: mais recente primeiro (UX: o que acabou de salvar aparece no
  // topo). Memoizado pra não recalcular a cada render quando o array
  // referência não mudou.
  const presets = useMemo(() => {
    return [...stored].sort((a, b) => {
      const ta = a.createdAt ? Date.parse(a.createdAt) : 0;
      const tb = b.createdAt ? Date.parse(b.createdAt) : 0;
      return tb - ta;
    });
  }, [stored]);

  const save = useCallback(
    (label: string, layout: DashboardLayout): LayoutPreset | null => {
      const trimmed = label.trim();
      if (!trimmed) return null;
      if (layout.items.length === 0) return null;

      const preset = buildCustomPresetFromLayout(trimmed, layout);
      setStored((prev) => [...prev, preset]);
      return preset;
    },
    [setStored],
  );

  const remove = useCallback(
    (id: string) => {
      setStored((prev) => prev.filter((p) => p.id !== id));
    },
    [setStored],
  );

  const restore = useCallback(
    (preset: LayoutPreset) => {
      setStored((prev) => {
        // Idempotente: se já existir um com mesmo ID, não duplica.
        if (prev.some((p) => p.id === preset.id)) return prev;
        return [...prev, preset];
      });
    },
    [setStored],
  );

  return { presets, save, remove, restore };
}

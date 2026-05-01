"use client";

/**
 * useDashboardLayout
 *
 * Carrega e gerencia o layout do `DashboardCanvas`:
 *   - GET /api/me/dashboard-layout no mount
 *   - 404 ou layout vazio → usa `defaultLayout` local + dispara PUT imediato
 *     (cria endowment desde o login — Sunk Cost)
 *   - mudanças locais (drag, config, remove) → setState otimista + debounced
 *     PUT (500ms)
 *   - cache otimista em `localStorage` (chave `analiso:dashboard-layout:v1`)
 *     usado APENAS como fallback offline. Nunca como source of truth.
 *   - expõe `resetLayout()` para a Fase 3.
 *
 * **Garantia de persistência em F5/close tab/SPA-nav:**
 *
 * O debounce de PUT de 500ms tem uma janela onde a mudança vive só na
 * memória + localStorage. Se o usuário recarregar a página dentro dessa
 * janela, o componente desmonta e o setTimeout é cancelado — antes era
 * isso que causava "alteração sumiu após F5".
 *
 * Mitigação em 3 camadas:
 *   1. `pagehide` listener → `putLayoutKeepalive` com `fetch keepalive=true`
 *      garante que o PUT é enviado mesmo durante unload (F5, fechar aba).
 *   2. Unmount cleanup → `putLayout` async pra navegação SPA dentro do app
 *      (clica num link interno antes do debounce expirar).
 *   3. Debounce reduzido pra 500ms → encurta a janela de risco.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { useAuth } from "@/src/features/auth/AuthContext";
import { useLocalStorageState } from "@/src/hooks";

import { buildDefaultLayout } from "../defaults/defaultLayout";
import { buildLayoutFromPreset, type LayoutPreset } from "../defaults/presets";
import type { DashboardLayout, LayoutItem, Section } from "../interfaces/layout.types";
import {
  DEFAULT_SECTION_ID,
  DEFAULT_SECTION_TITLE,
} from "../interfaces/layout.types";
import type { IslandConfig } from "../interfaces/island.types";
import {
  getLayout,
  putLayout,
  putLayoutKeepalive,
  resetLayout as resetLayoutService,
  LayoutNotFoundError,
} from "../services/dashboard-layout.service";

const LOCAL_CACHE_KEY = "analiso:dashboard-layout:v1";
const ACTIVE_PRESET_KEY = "analiso:dashboard-active-preset:v1";
const PERSIST_DEBOUNCE_MS = 500;

export interface UseDashboardLayoutReturn {
  layout: DashboardLayout;
  isLoading: boolean;
  error: string | null;

  // ── Items ────────────────────────────────────────────────────────────
  removeItem: (id: string) => void;
  /**
   * Restaura uma instância removida na posição original (dentro da section
   * em que vivia). Usada pelo soft-delete com Undo via toast.
   */
  restoreItem: (item: LayoutItem) => void;
  updateItemConfig: (id: string, config: IslandConfig) => void;
  addItem: (item: Omit<LayoutItem, "order">) => void;
  /**
   * Adiciona vários items numa única atualização de estado. Importante usar
   * isso (em vez de `addItem` em loop) pra que o debounce de persistência
   * dispare UM único PUT.
   */
  addItems: (items: Omit<LayoutItem, "order">[]) => void;
  /**
   * Reordena items DENTRO de uma section. Usado pelo drag-drop quando o
   * item permanece na mesma section.
   */
  reorderItemsInSection: (sectionId: string, orderedIds: string[]) => void;
  /**
   * Move um item pra outra section (ou pra mesma section em outro índice).
   * Atomicamente: tira do source, insere no target em `targetIndex`,
   * reindexa orders nas duas sections afetadas.
   */
  moveItem: (itemId: string, targetSectionId: string, targetIndex: number) => void;

  // ── Sections ─────────────────────────────────────────────────────────
  /**
   * Cria nova section. Por default vai pro FIM do array; passe
   * `position: "start"` pra inserir no início (todas as outras sections
   * são empurradas pra frente). Retorna ID pra caller poder scroll-to.
   */
  addSection: (title?: string, position?: "start" | "end") => string;
  /** Remove section. Items órfãos são adotados pela primeira section restante. */
  removeSection: (id: string) => void;
  renameSection: (id: string, title: string) => void;
  reorderSections: (orderedIds: string[]) => void;

  // ── Layout-level ─────────────────────────────────────────────────────
  /**
   * Substitui o layout por um snapshot — usada pelo Undo de "Restaurar padrão"
   * e "Aplicar preset". O segundo arg restaura também o `activePresetId`.
   */
  replaceLayout: (next: DashboardLayout, activePresetId?: string | null) => void;
  applyPreset: (preset: LayoutPreset) => void;
  resetLayout: () => Promise<void>;
  /**
   * ID do preset ativo. null = layout não corresponde a nenhum preset
   * ("Personalizado"). Qualquer mutação manual zera; só `applyPreset` seta.
   */
  activePresetId: string | null;
}

/** Reindexa items dentro de uma section específica (orders 0..N). */
function reindexSection(items: LayoutItem[], sectionId: string): LayoutItem[] {
  const inSection = items
    .filter((it) => it.sectionId === sectionId)
    .sort((a, b) => a.order - b.order)
    .map((it, idx) => ({ ...it, sectionId, order: idx }));
  const others = items.filter((it) => it.sectionId !== sectionId);
  return [...others, ...inSection];
}

/** Reindexa items em TODAS as sections. Usado em operações grandes (preset, restore). */
function reindexAll(items: LayoutItem[]): LayoutItem[] {
  const bySection = new Map<string, LayoutItem[]>();
  for (const it of items) {
    const sid = it.sectionId ?? DEFAULT_SECTION_ID;
    if (!bySection.has(sid)) bySection.set(sid, []);
    bySection.get(sid)!.push(it);
  }
  const result: LayoutItem[] = [];
  for (const [sid, list] of bySection) {
    list
      .sort((a, b) => a.order - b.order)
      .forEach((it, idx) => result.push({ ...it, sectionId: sid, order: idx }));
  }
  return result;
}

export function useDashboardLayout(): UseDashboardLayoutReturn {
  const { token } = useAuth();

  const [cachedLayout, setCachedLayout] = useLocalStorageState<DashboardLayout | null>(
    LOCAL_CACHE_KEY,
    null,
  );

  const [layout, setLayout]   = useState<DashboardLayout>(() => cachedLayout ?? buildDefaultLayout());
  const [isLoading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);

  // Preset ativo — null = "Personalizado". Persistido em localStorage pra
  // sobreviver a F5. Nunca vai pro backend (consistente com `customPresets`,
  // que também é local-only).
  const [activePresetId, setActivePresetId] = useLocalStorageState<string | null>(
    ACTIVE_PRESET_KEY,
    null,
  );

  // Debounce de persistência
  const persistTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const skipNextPersistRef = useRef(true); // não persiste o estado inicial sincronizado do servidor

  // Layout pendente (escrito mas ainda não persistido). Usado pelo unmount
  // cleanup e pelo pagehide handler pra flushar o último valor antes da
  // página descarregar. Null quando o último PUT já foi enviado.
  const pendingLayoutRef = useRef<DashboardLayout | null>(null);

  // Token corrente espelhado num ref pra que handlers de pagehide e unmount
  // (que rodam fora do ciclo de render) leiam o valor atual sem depender
  // de closure capturado.
  const tokenRef = useRef(token);
  useEffect(() => { tokenRef.current = token; }, [token]);

  // ─── Mount: GET layout ─────────────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;

    setLoading(true);
    setError(null);

    getLayout(token)
      .then((fetched) => {
        if (cancelled) return;
        if (fetched.items.length === 0) {
          // Layout vazio → endowment imediato (Sunk Cost)
          const fresh = buildDefaultLayout();
          skipNextPersistRef.current = false;
          setLayout(fresh);
          // Dispara PUT imediato sem debounce
          putLayout(token, fresh).catch(() => {});
        } else {
          skipNextPersistRef.current = true;
          setLayout(fetched);
        }
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        if (err instanceof LayoutNotFoundError) {
          // 404 → endowment imediato
          const fresh = buildDefaultLayout();
          skipNextPersistRef.current = false;
          setLayout(fresh);
          putLayout(token, fresh).catch(() => {});
        } else {
          // Erro real: mantém o cache local (ou default) e sinaliza
          setError(err instanceof Error ? err.message : "layout_error");
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, [token]);

  // ─── Cache local + debounced PUT após mudanças locais ──────────────────────
  // Atenção: este effect NÃO tem cleanup que cancela o timer. O cancelamento
  // acontece no início do próximo render (linha clearTimeout). Manter o
  // timer vivo no unmount permite que o effect de unmount (abaixo) detecte
  // pendência e flushe — antes esse cleanup matava o PUT no F5.
  useEffect(() => {
    setCachedLayout(layout);

    if (skipNextPersistRef.current) {
      skipNextPersistRef.current = false;
      return;
    }

    pendingLayoutRef.current = layout;

    if (persistTimerRef.current) {
      clearTimeout(persistTimerRef.current);
    }

    persistTimerRef.current = setTimeout(() => {
      const toSave = pendingLayoutRef.current;
      pendingLayoutRef.current = null;
      persistTimerRef.current = null;
      if (toSave) {
        putLayout(tokenRef.current, toSave).catch((err) => {
          // Antes era silenciado — agora logamos pra debug. O cache local
          // continua coerente (usuário não perde a UI), mas o servidor pode
          // ficar dessincronizado.
          if (typeof console !== "undefined") {
            console.warn("[dashboard-layout] PUT falhou", err);
          }
        });
      }
    }, PERSIST_DEBOUNCE_MS);
    // setCachedLayout é estável (do useLocalStorageState)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [layout, token]);

  // ─── Flush pendente em unmount (SPA navigation) ────────────────────────────
  // Quando o usuário sai da página por navegação dentro do app (clica num
  // link interno, troca de aba do menu, etc.), o componente desmonta antes
  // do debounce expirar. Sem este effect, o PUT pendente seria perdido.
  // Aqui disparamos um PUT async — a página ainda tá viva, então o request
  // completa normalmente.
  useEffect(() => {
    return () => {
      if (persistTimerRef.current) {
        clearTimeout(persistTimerRef.current);
        persistTimerRef.current = null;
      }
      const toSave = pendingLayoutRef.current;
      pendingLayoutRef.current = null;
      if (toSave) {
        putLayout(tokenRef.current, toSave).catch((err) => {
          if (typeof console !== "undefined") {
            console.warn("[dashboard-layout] PUT no unmount falhou", err);
          }
        });
      }
    };
    // Apenas na desmontagem real do hook — nunca no token change (o cleanup
    // não pode pegar `token` por closure; o tokenRef.current cobre).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ─── Flush pendente em pagehide (F5, fechar aba, navegação externa) ────────
  // `pagehide` é o evento mais confiável pra detectar que a página vai
  // descarregar (mais que `beforeunload`, que tem quirks no mobile). Aqui
  // usamos `putLayoutKeepalive` pra que o request sobreviva ao unload.
  useEffect(() => {
    if (typeof window === "undefined") return;

    const flush = () => {
      if (persistTimerRef.current) {
        clearTimeout(persistTimerRef.current);
        persistTimerRef.current = null;
      }
      const toSave = pendingLayoutRef.current;
      pendingLayoutRef.current = null;
      if (toSave) {
        putLayoutKeepalive(tokenRef.current, toSave);
      }
    };

    window.addEventListener("pagehide", flush);
    return () => window.removeEventListener("pagehide", flush);
  }, []);

  // ─── Ações ──────────────────────────────────────────────────────────────────
  // Convenção: TODA mutação manual zera `activePresetId` — assim que o
  // usuário desvia do baseline do preset, o estado vira "Personalizado"
  // e a UI reflete isso. Só `applyPreset` e `replaceLayout` (no path de
  // undo) reescrevem o ID.

  const removeItem = useCallback((id: string) => {
    setLayout((prev) => {
      const target = prev.items.find((it) => it.id === id);
      if (!target) return prev;
      const remaining = prev.items.filter((it) => it.id !== id);
      const sectionId = target.sectionId ?? prev.sections[0]?.id ?? DEFAULT_SECTION_ID;
      return { ...prev, items: reindexSection(remaining, sectionId) };
    });
    setActivePresetId(null);
  }, [setActivePresetId]);

  const restoreItem = useCallback((item: LayoutItem) => {
    setLayout((prev) => {
      if (prev.items.some((existing) => existing.id === item.id)) return prev;
      const sectionId = (item.sectionId && prev.sections.some((s) => s.id === item.sectionId))
        ? item.sectionId
        : prev.sections[0]?.id ?? DEFAULT_SECTION_ID;
      // Insere na ordem original dentro da section.
      const inSection = prev.items
        .filter((it) => it.sectionId === sectionId)
        .sort((a, b) => a.order - b.order);
      const targetIdx = Math.min(item.order, inSection.length);
      inSection.splice(targetIdx, 0, { ...item, sectionId });
      const reindexed = inSection.map((it, idx) => ({ ...it, order: idx, sectionId }));
      const others = prev.items.filter((it) => it.sectionId !== sectionId);
      return { ...prev, items: [...others, ...reindexed] };
    });
    setActivePresetId(null);
  }, [setActivePresetId]);

  // `replaceLayout` aceita o `activePresetId` opcional pra restaurar o
  // estado do indicador junto com o layout — usado no undo de "Aplicar
  // preset" (volta layout + volta o preset que estava ativo antes).
  const replaceLayout = useCallback(
    (next: DashboardLayout, presetId: string | null = null) => {
      setLayout({ ...next, items: reindexAll(next.items) });
      setActivePresetId(presetId);
    },
    [setActivePresetId],
  );

  const applyPreset = useCallback(
    (preset: LayoutPreset) => {
      const built = buildLayoutFromPreset(preset);
      setLayout({ ...built, items: reindexAll(built.items) });
      setActivePresetId(preset.id);
    },
    [setActivePresetId],
  );

  const updateItemConfig = useCallback(
    (id: string, config: IslandConfig) => {
      setLayout((prev) => ({
        ...prev,
        items: prev.items.map((item) =>
          item.id === id ? { ...item, config: { ...item.config, ...config } } : item,
        ),
      }));
      setActivePresetId(null);
    },
    [setActivePresetId],
  );

  const addItem = useCallback(
    (item: Omit<LayoutItem, "order">) => {
      setLayout((prev) => {
        const sectionId = item.sectionId ?? prev.sections[0]?.id ?? DEFAULT_SECTION_ID;
        const inSection = prev.items.filter((it) => it.sectionId === sectionId);
        const newItem: LayoutItem = {
          ...item,
          sectionId,
          order: inSection.length,
        };
        return { ...prev, items: [...prev.items, newItem] };
      });
      setActivePresetId(null);
    },
    [setActivePresetId],
  );

  const addItems = useCallback(
    (items: Omit<LayoutItem, "order">[]) => {
      if (items.length === 0) return;
      setLayout((prev) => {
        const fallback = prev.sections[0]?.id ?? DEFAULT_SECTION_ID;
        // Conta items por section pra atribuir orders sequenciais corretas.
        const countsBySection = new Map<string, number>();
        for (const it of prev.items) {
          const sid = it.sectionId ?? fallback;
          countsBySection.set(sid, (countsBySection.get(sid) ?? 0) + 1);
        }
        const newItems: LayoutItem[] = items.map((it) => {
          const sid = it.sectionId ?? fallback;
          const order = countsBySection.get(sid) ?? 0;
          countsBySection.set(sid, order + 1);
          return { ...it, sectionId: sid, order };
        });
        return { ...prev, items: [...prev.items, ...newItems] };
      });
      setActivePresetId(null);
    },
    [setActivePresetId],
  );

  // Reordena items DENTRO de uma section. Idempotente: items não listados
  // mantêm sua ordem relativa.
  const reorderItemsInSection = useCallback(
    (sectionId: string, orderedIds: string[]) => {
      setLayout((prev) => {
        const indexMap = new Map(orderedIds.map((id, idx) => [id, idx]));
        const inSection = prev.items
          .filter((it) => it.sectionId === sectionId)
          .map((it) => ({
            ...it,
            order: indexMap.get(it.id) ?? it.order + orderedIds.length,
          }))
          .sort((a, b) => a.order - b.order)
          .map((it, idx) => ({ ...it, order: idx }));
        const others = prev.items.filter((it) => it.sectionId !== sectionId);
        return { ...prev, items: [...others, ...inSection] };
      });
      setActivePresetId(null);
    },
    [setActivePresetId],
  );

  // Move um item entre sections (ou pra outro índice na mesma section).
  // `targetIndex` é a posição final desejada DENTRO da target section.
  const moveItem = useCallback(
    (itemId: string, targetSectionId: string, targetIndex: number) => {
      setLayout((prev) => {
        const item = prev.items.find((it) => it.id === itemId);
        if (!item) return prev;
        if (!prev.sections.some((s) => s.id === targetSectionId)) return prev;

        const remaining = prev.items.filter((it) => it.id !== itemId);
        const inTarget = remaining
          .filter((it) => it.sectionId === targetSectionId)
          .sort((a, b) => a.order - b.order);
        const clampedIndex = Math.max(0, Math.min(targetIndex, inTarget.length));
        inTarget.splice(clampedIndex, 0, { ...item, sectionId: targetSectionId });
        const targetReindexed = inTarget.map((it, idx) => ({
          ...it,
          sectionId: targetSectionId,
          order: idx,
        }));

        // Reindexa a source section também (item saiu, gaps possíveis).
        const sourceSectionId = item.sectionId ?? prev.sections[0]?.id ?? DEFAULT_SECTION_ID;
        let sourceReindexed: LayoutItem[] = [];
        if (sourceSectionId !== targetSectionId) {
          sourceReindexed = remaining
            .filter((it) => it.sectionId === sourceSectionId)
            .sort((a, b) => a.order - b.order)
            .map((it, idx) => ({ ...it, sectionId: sourceSectionId, order: idx }));
        }

        const untouchedSections = remaining.filter(
          (it) =>
            it.sectionId !== targetSectionId &&
            it.sectionId !== sourceSectionId,
        );

        return {
          ...prev,
          items: [...untouchedSections, ...sourceReindexed, ...targetReindexed],
        };
      });
      setActivePresetId(null);
    },
    [setActivePresetId],
  );

  // ── Section CRUD ─────────────────────────────────────────────────────────
  const addSection = useCallback(
    (title?: string, position: "start" | "end" = "end"): string => {
      const id = `section-${Date.now().toString(36)}-${Math.random()
        .toString(36)
        .slice(2, 6)}`;
      setLayout((prev) => {
        const newSection: Section = {
          id,
          title: title ?? "",
          // `order` é setado abaixo via reindex.
          order: 0,
        };
        const newSections =
          position === "start"
            ? [newSection, ...prev.sections]
            : [...prev.sections, newSection];
        // Reindexa orders sequencialmente pra garantir ordenação correta.
        return {
          ...prev,
          sections: newSections.map((s, idx) => ({ ...s, order: idx })),
        };
      });
      setActivePresetId(null);
      return id;
    },
    [setActivePresetId],
  );

  const removeSection = useCallback(
    (id: string) => {
      setLayout((prev) => {
        // Não remove se for a única section (sempre precisa ter ao menos 1).
        if (prev.sections.length <= 1) return prev;
        const remaining = prev.sections.filter((s) => s.id !== id);
        const fallbackSectionId = remaining[0].id;

        // Items órfãos vão pro fim da fallback section.
        const orphans = prev.items.filter((it) => it.sectionId === id);
        const inFallback = prev.items
          .filter((it) => it.sectionId === fallbackSectionId)
          .sort((a, b) => a.order - b.order);
        const adopted = [...inFallback, ...orphans].map((it, idx) => ({
          ...it,
          sectionId: fallbackSectionId,
          order: idx,
        }));
        const others = prev.items.filter(
          (it) => it.sectionId !== id && it.sectionId !== fallbackSectionId,
        );

        return {
          ...prev,
          sections: remaining.map((s, idx) => ({ ...s, order: idx })),
          items: [...others, ...adopted],
        };
      });
      setActivePresetId(null);
    },
    [setActivePresetId],
  );

  const renameSection = useCallback(
    (id: string, title: string) => {
      setLayout((prev) => ({
        ...prev,
        sections: prev.sections.map((s) => (s.id === id ? { ...s, title } : s)),
      }));
      setActivePresetId(null);
    },
    [setActivePresetId],
  );

  const reorderSections = useCallback(
    (orderedIds: string[]) => {
      setLayout((prev) => {
        const byId = new Map(prev.sections.map((s) => [s.id, s]));
        const reordered = orderedIds
          .map((id) => byId.get(id))
          .filter((s): s is Section => Boolean(s))
          .map((s, idx) => ({ ...s, order: idx }));
        // Append any sections that weren't in orderedIds (defensive).
        const seen = new Set(orderedIds);
        const remaining = prev.sections
          .filter((s) => !seen.has(s.id))
          .map((s, idx) => ({ ...s, order: reordered.length + idx }));
        return { ...prev, sections: [...reordered, ...remaining] };
      });
      setActivePresetId(null);
    },
    [setActivePresetId],
  );

  const resetLayout = useCallback(async () => {
    try {
      const fresh = await resetLayoutService(token);
      skipNextPersistRef.current = true;
      setLayout(fresh.items.length > 0 ? fresh : buildDefaultLayout());
    } catch {
      const fresh = buildDefaultLayout();
      skipNextPersistRef.current = false;
      setLayout(fresh);
    }
    // Reset volta ao default — não corresponde a nenhum preset
    setActivePresetId(null);
  }, [token, setActivePresetId]);

  return useMemo(
    () => ({
      layout,
      isLoading,
      error,
      removeItem,
      restoreItem,
      updateItemConfig,
      addItem,
      addItems,
      reorderItemsInSection,
      moveItem,
      addSection,
      removeSection,
      renameSection,
      reorderSections,
      replaceLayout,
      applyPreset,
      resetLayout,
      activePresetId,
    }),
    [
      layout,
      isLoading,
      error,
      removeItem,
      restoreItem,
      updateItemConfig,
      addItem,
      addItems,
      reorderItemsInSection,
      moveItem,
      addSection,
      removeSection,
      renameSection,
      reorderSections,
      replaceLayout,
      applyPreset,
      resetLayout,
      activePresetId,
    ],
  );
}

"use client";

/**
 * useDashboardLayout
 *
 * Carrega e gerencia o layout do `DashboardCanvas`:
 *   - GET /api/me/dashboard-layout no mount
 *   - 404 ou layout vazio → usa `defaultLayout` local + dispara PUT imediato
 *     (cria endowment desde o login — Sunk Cost)
 *   - mudanças locais (drag, config, remove) → setState otimista + debounced
 *     PUT (1s)
 *   - cache otimista em `localStorage` (chave `analiso:dashboard-layout:v1`)
 *     usado APENAS como fallback offline. Nunca como source of truth.
 *   - expõe `resetLayout()` para a Fase 3.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { useAuth } from "@/src/features/auth/AuthContext";
import { useLocalStorageState } from "@/src/hooks";

import { buildDefaultLayout } from "../defaults/defaultLayout";
import type { DashboardLayout, LayoutItem } from "../interfaces/layout.types";
import type { IslandConfig } from "../interfaces/island.types";
import {
  getLayout,
  putLayout,
  resetLayout as resetLayoutService,
  LayoutNotFoundError,
} from "../services/dashboard-layout.service";

const LOCAL_CACHE_KEY = "analiso:dashboard-layout:v1";
const PERSIST_DEBOUNCE_MS = 1000;

export interface UseDashboardLayoutReturn {
  layout: DashboardLayout;
  isLoading: boolean;
  error: string | null;
  reorderItems: (orderedIds: string[]) => void;
  removeItem: (id: string) => void;
  updateItemConfig: (id: string, config: IslandConfig) => void;
  addItem: (item: Omit<LayoutItem, "order">) => void;
  resetLayout: () => Promise<void>;
}

function reindex(items: LayoutItem[]): LayoutItem[] {
  return items.map((item, index) => ({ ...item, order: index }));
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

  // Debounce de persistência
  const persistTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const skipNextPersistRef = useRef(true); // não persiste o estado inicial sincronizado do servidor

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
  useEffect(() => {
    setCachedLayout(layout);

    if (skipNextPersistRef.current) {
      skipNextPersistRef.current = false;
      return;
    }

    if (persistTimerRef.current) {
      clearTimeout(persistTimerRef.current);
    }

    persistTimerRef.current = setTimeout(() => {
      putLayout(token, layout).catch(() => {
        // Silenciamos: o cache local cobre o caso offline.
      });
    }, PERSIST_DEBOUNCE_MS);

    return () => {
      if (persistTimerRef.current) clearTimeout(persistTimerRef.current);
    };
    // setCachedLayout é estável (do useLocalStorageState)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [layout, token]);

  // ─── Ações ──────────────────────────────────────────────────────────────────
  const reorderItems = useCallback((orderedIds: string[]) => {
    setLayout((prev) => {
      const byId = new Map(prev.items.map((item) => [item.id, item]));
      const next: LayoutItem[] = [];
      for (const id of orderedIds) {
        const item = byId.get(id);
        if (item) next.push(item);
      }
      return { ...prev, items: reindex(next) };
    });
  }, []);

  const removeItem = useCallback((id: string) => {
    setLayout((prev) => ({
      ...prev,
      items: reindex(prev.items.filter((item) => item.id !== id)),
    }));
  }, []);

  const updateItemConfig = useCallback((id: string, config: IslandConfig) => {
    setLayout((prev) => ({
      ...prev,
      items: prev.items.map((item) =>
        item.id === id ? { ...item, config: { ...item.config, ...config } } : item,
      ),
    }));
  }, []);

  const addItem = useCallback((item: Omit<LayoutItem, "order">) => {
    setLayout((prev) => ({
      ...prev,
      items: reindex([...prev.items, { ...item, order: prev.items.length }]),
    }));
  }, []);

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
  }, [token]);

  return useMemo(
    () => ({
      layout,
      isLoading,
      error,
      reorderItems,
      removeItem,
      updateItemConfig,
      addItem,
      resetLayout,
    }),
    [layout, isLoading, error, reorderItems, removeItem, updateItemConfig, addItem, resetLayout],
  );
}

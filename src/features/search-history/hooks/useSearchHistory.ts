"use client";

/**
 * useSearchHistory
 *
 * Gerencia o histórico de buscas do usuário.
 * Carrega do banco ao montar, adiciona com debounce, permite remover itens.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import type { SearchHistoryItem } from "../interfaces";
import { searchHistoryService } from "../services";

const ADD_DEBOUNCE_MS = 1500; // só salva se o usuário parou de digitar

export function useSearchHistory() {
  const [items, setItems] = useState<SearchHistoryItem[]>([]);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Carrega histórico ao montar
  useEffect(() => {
    searchHistoryService
      .list()
      .then((data) => setItems(data))
      .catch(() => {});
  }, []);

  /** Registra uma busca (com debounce para evitar muitas chamadas enquanto digita) */
  const recordSearch = useCallback((query: string) => {
    if (!query || query.trim().length < 2) return;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      const created = await searchHistoryService.add(query.trim());
      if (created) {
        setItems((prev) => {
          // remove duplicata, coloca o novo no topo
          const deduped = prev.filter((i) => i.query.toLowerCase() !== query.trim().toLowerCase());
          return [created, ...deduped].slice(0, 20);
        });
      }
    }, ADD_DEBOUNCE_MS);
  }, []);

  const removeItem = useCallback(async (id: number) => {
    setItems((prev) => prev.filter((i) => i.id !== id)); // otimista
    await searchHistoryService.remove(id).catch(() => {});
  }, []);

  const clearAll = useCallback(async () => {
    setItems([]);
    await searchHistoryService.clearAll().catch(() => {});
  }, []);

  return { items, recordSearch, removeItem, clearAll };
}

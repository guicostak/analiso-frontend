"use client";

/**
 * useSavedSearches
 *
 * Hook para gerenciar pesquisas salvas do usuário.
 * Busca lista ao montar, permite criar e deletar com update otimista.
 * Segue architecture_skill.md: lógica isolada em hook, service para HTTP.
 */

import { useCallback, useEffect, useState } from "react";
import type { SavedSearch } from "../interfaces";
import { savedSearchesService } from "../services";

export function useSavedSearches() {
  const [items, setItems] = useState<SavedSearch[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    savedSearchesService
      .list()
      .then((data) => {
        if (!cancelled) setItems(data);
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  const create = useCallback(async (name: string, filters: string) => {
    try {
      const created = await savedSearchesService.create(name, filters);
      setItems((prev) => [created, ...prev]);
      return created;
    } catch {
      return null;
    }
  }, []);

  const remove = useCallback(async (id: number) => {
    const prev = items;
    setItems((curr) => curr.filter((s) => s.id !== id));
    try {
      await savedSearchesService.remove(id);
    } catch {
      setItems(prev); // rollback
    }
  }, [items]);

  return { items, isLoading, create, remove };
}

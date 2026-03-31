"use client";

/**
 * useCompanySearch
 *
 * Hook para busca avançada de empresas com filtros e paginação.
 * Segue architecture_skill.md: lógica isolada em hook, service para HTTP.
 *
 * updateFilters usa debounce de 500ms para evitar chamadas excessivas
 * à API enquanto o usuário digita nos filtros de métricas.
 */

import { useCallback, useRef, useState } from "react";
import {
  searchService,
  type CompanySearchFilters,
  type CompanySearchItem,
} from "../services/search.service";

const FILTER_DEBOUNCE_MS = 800;

interface UseCompanySearchState {
  items: CompanySearchItem[];
  page: number;
  totalPages: number;
  totalItems: number;
  isLoading: boolean;
  error: string | null;
}

export function useCompanySearch() {
  const [state, setState] = useState<UseCompanySearchState>({
    items: [],
    page: 0,
    totalPages: 0,
    totalItems: 0,
    isLoading: false,
    error: null,
  });

  const [filters, setFilters] = useState<CompanySearchFilters>({});
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const search = useCallback(
    async (newFilters?: CompanySearchFilters) => {
      const currentFilters = newFilters ?? filters;
      if (newFilters) setFilters(newFilters);

      setState((prev) => ({ ...prev, isLoading: true, error: null }));

      try {
        const response = await searchService.search(currentFilters);
        setState({
          items: response.items,
          page: response.page,
          totalPages: response.totalPages,
          totalItems: response.totalItems,
          isLoading: false,
          error: null,
        });
      } catch (err) {
        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: err instanceof Error ? err.message : "Erro na busca",
        }));
      }
    },
    [filters],
  );

  /** Paginação — sem debounce, resposta imediata. */
  const goToPage = useCallback(
    (page: number) => {
      search({ ...filters, page });
    },
    [filters, search],
  );

  /**
   * Atualiza filtros com debounce.
   * O estado dos filtros atualiza imediatamente (UI responsiva),
   * mas a chamada à API espera o usuário parar de digitar.
   */
  const updateFilters = useCallback(
    (partial: Partial<CompanySearchFilters>) => {
      const merged = { ...filters, ...partial, page: 0 };

      // Atualiza state imediatamente — inputs refletem o valor digitado
      setFilters(merged);

      // Cancela timer anterior e agenda nova busca
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        search(merged);
      }, FILTER_DEBOUNCE_MS);
    },
    [filters, search],
  );

  /** Limpa todos os filtros — sem debounce, ação explícita do usuário. */
  const clearFilters = useCallback(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    search({ page: 0 });
  }, [search]);

  return {
    ...state,
    filters,
    search,
    goToPage,
    updateFilters,
    clearFilters,
  };
}

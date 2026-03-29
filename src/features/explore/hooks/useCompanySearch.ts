"use client";

/**
 * useCompanySearch
 *
 * Hook para busca avançada de empresas com filtros e paginação.
 * Segue architecture_skill.md: lógica isolada em hook, service para HTTP.
 */

import { useCallback, useState } from "react";
import {
  searchService,
  type CompanySearchFilters,
  type CompanySearchItem,
} from "../services/search.service";

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

  const goToPage = useCallback(
    (page: number) => {
      search({ ...filters, page });
    },
    [filters, search],
  );

  const updateFilters = useCallback(
    (partial: Partial<CompanySearchFilters>) => {
      const merged = { ...filters, ...partial, page: 0 };
      search(merged);
    },
    [filters, search],
  );

  const clearFilters = useCallback(() => {
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

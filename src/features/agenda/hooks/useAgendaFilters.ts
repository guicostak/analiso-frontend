import { useState, useCallback } from 'react';
import type { AgendaFiltersState, AgendaEventFilterType } from '../interfaces/agenda.interfaces';

export interface AgendaFiltersReturn {
  filters: AgendaFiltersState;
  setEventType: (type: AgendaEventFilterType) => void;
  toggleTicker: (ticker: string) => void;
  clearFilters: () => void;
  hasActiveFilters: boolean;
}

const DEFAULT_FILTERS: AgendaFiltersState = {
  eventType: 'todos',
  tickers: [],
};

/**
 * Gerencia o estado de filtros da agenda.
 * Toda a lógica de filtro fica aqui — componentes recebem apenas callbacks.
 */
export function useAgendaFilters(): AgendaFiltersReturn {
  const [filters, setFilters] = useState<AgendaFiltersState>(DEFAULT_FILTERS);

  const setEventType = useCallback((type: AgendaEventFilterType) => {
    setFilters((prev) => ({ ...prev, eventType: type }));
  }, []);

  const toggleTicker = useCallback((ticker: string) => {
    setFilters((prev) => {
      const exists = prev.tickers.includes(ticker);
      return {
        ...prev,
        tickers: exists
          ? prev.tickers.filter((t) => t !== ticker)
          : [...prev.tickers, ticker],
      };
    });
  }, []);

  const clearFilters = useCallback(() => {
    setFilters(DEFAULT_FILTERS);
  }, []);

  const hasActiveFilters =
    filters.eventType !== 'todos' || filters.tickers.length > 0;

  return { filters, setEventType, toggleTicker, clearFilters, hasActiveFilters };
}

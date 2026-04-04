import { useState, useEffect, useMemo, useCallback } from 'react';
import { useAuth } from '@/src/features/auth/AuthContext';
import { getAgenda } from '../services/agenda.service';
import { mapAgendaEvents } from '../mappers/agenda.mapper';
import type { AgendaEvent } from '../interfaces/agenda.interfaces';
import { useAgendaNavigation, type AgendaNavigationReturn } from './useAgendaNavigation';
import { useAgendaFilters, type AgendaFiltersReturn } from './useAgendaFilters';

export interface UseAgendaReturn {
  allEvents: AgendaEvent[];
  filteredEvents: AgendaEvent[];
  loading: boolean;
  error: string | null;
  selectedEvent: AgendaEvent | null;
  setSelectedEvent: (event: AgendaEvent | null) => void;
  uniqueTickers: string[];
  navigation: AgendaNavigationReturn;
  filters: AgendaFiltersReturn;
}

/**
 * Hook principal da agenda.
 * Orquestra: busca de dados, estado de seleção, filtros e navegação.
 */
export function useAgenda(): UseAgendaReturn {
  const { token } = useAuth();

  const [allEvents, setAllEvents]       = useState<AgendaEvent[]>([]);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState<string | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<AgendaEvent | null>(null);

  const navigation = useAgendaNavigation();
  const filters    = useAgendaFilters();

  // ─── Fetch ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    getAgenda(token)
      .then((dto) => {
        if (!cancelled) setAllEvents(mapAgendaEvents(dto.events));
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          const msg = err instanceof Error ? err.message : 'Erro ao carregar agenda';
          setError(msg);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, [token]);

  // ─── Filtros ─────────────────────────────────────────────────────────────────
  const filteredEvents = useMemo(() => {
    let events = allEvents;

    // Filtro por tipo de evento
    if (filters.filters.eventType !== 'todos') {
      events = events.filter((e) => e.eventType === filters.filters.eventType);
    }

    // Filtro por ticker
    if (filters.filters.tickers.length > 0) {
      events = events.filter((e) => filters.filters.tickers.includes(e.ticker));
    }

    return events;
  }, [allEvents, filters.filters]);

  // ─── Tickers únicos ──────────────────────────────────────────────────────────
  const uniqueTickers = useMemo(
    () => [...new Set(allEvents.map((e) => e.ticker))].sort(),
    [allEvents],
  );

  // ─── Seleção ─────────────────────────────────────────────────────────────────
  const handleSetSelectedEvent = useCallback((event: AgendaEvent | null) => {
    setSelectedEvent(event);
  }, []);

  return {
    allEvents,
    filteredEvents,
    loading,
    error,
    selectedEvent,
    setSelectedEvent: handleSetSelectedEvent,
    uniqueTickers,
    navigation,
    filters,
  };
}

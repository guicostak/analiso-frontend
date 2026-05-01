import { useState, useEffect, useMemo, useCallback } from 'react';
import { toast } from 'sonner';
import { useAuth } from '@/src/features/auth/AuthContext';
import { useFavorites } from '@/src/features/favoritas';
import { normalizeApiError } from '@/src/lib/errors';
import { getAgenda } from '../services/agenda.service';
import { mapAgendaFromGroups } from '../mappers/agenda.mapper';
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
  /** True quando o usuário tem ao menos 1 ticker na watchlist. */
  hasWatchlist: boolean;
  navigation: AgendaNavigationReturn;
  filters: AgendaFiltersReturn;
}

/**
 * Hook principal da agenda.
 * Orquestra: busca de dados, estado de seleção, filtros e navegação.
 */
export function useAgenda(): UseAgendaReturn {
  // **Importante**: `isLoading` do AuthContext é true enquanto a sessão é
  // restaurada do localStorage. Disparar `getAgenda` antes disso fazia o
  // request sair sem token → 401 → o `apiFetch` chamava `redirectToLogin`
  // (porque `getSession()` ainda estava vazio) e o usuário era expulso
  // pra tela de login. O guard abaixo evita esse race.
  const { token, isLoading: authLoading } = useAuth();

  const [allEvents, setAllEvents]         = useState<AgendaEvent[]>([]);
  const [loading, setLoading]             = useState(true);
  const [error, setError]                 = useState<string | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<AgendaEvent | null>(null);

  const navigation = useAgendaNavigation();
  const filters    = useAgendaFilters();
  // A agenda backend retorna `groups: []` em DOIS cenários distintos:
  //   1. Watchlist vazia (sem tickers pra consultar)
  //   2. Watchlist cheia, mas sem eventos no período
  // O DTO não distingue. Pegamos o estado da watchlist daqui pra o empty
  // state escolher a mensagem correta ("Adicione empresas" vs "Sem
  // eventos no período"). Antes era inferido errado a partir só do
  // `hasEvents` — mostrava "adicione empresas" mesmo com watchlist cheia.
  const favorites = useFavorites();

  // ─── Fetch ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    // Espera a restauração da sessão. Sem isso, o primeiro render dispara
    // GET /api/agenda com token=null → 401 → redirectToLogin (race).
    if (authLoading) return;
    // ProtectedRoute deveria garantir token válido aqui, mas defensivo:
    // sem token, não tenta — apenas para o spinner.
    if (!token) {
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    getAgenda(token)
      .then((dto) => {
        if (!cancelled) setAllEvents(mapAgendaFromGroups(dto.groups));
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          const { message } = normalizeApiError(err);
          setError(message);
          toast.error(`Não foi possível carregar a agenda. ${message}`);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, [token, authLoading]);

  // ─── Filtros ─────────────────────────────────────────────────────────────────
  const filteredEvents = useMemo(() => {
    let events = allEvents;

    if (filters.filters.eventType !== 'todos') {
      events = events.filter((e) => e.eventType === filters.filters.eventType);
    }

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
    hasWatchlist: favorites.tickers.size > 0,
    navigation,
    filters,
  };
}

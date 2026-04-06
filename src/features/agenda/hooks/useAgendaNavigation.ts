import { useState, useCallback } from 'react';
import type { AgendaViewMode } from '../interfaces/agenda.interfaces';
import { getWeekStart, getWeekDates, formatWeekRange, formatMonthHeader } from '../utils/agenda.utils';

export interface AgendaNavigationReturn {
  viewMode: AgendaViewMode;
  referenceDate: Date;
  weekDates: Date[];
  rangeLabel: string;
  setViewMode: (mode: AgendaViewMode) => void;
  goNext: () => void;
  goPrev: () => void;
  goToToday: () => void;
}

/**
 * Gerencia o estado de navegação da agenda:
 * - viewMode: 'semana' | 'mes' | 'lista'
 * - referenceDate: início da semana (Dom) ou 1° do mês
 * - Ações de navegação: goNext / goPrev / goToToday
 */
export function useAgendaNavigation(): AgendaNavigationReturn {
  const [viewMode, setViewModeState] = useState<AgendaViewMode>('semana');
  const [referenceDate, setReferenceDate] = useState<Date>(() => getWeekStart(new Date()));

  const setViewMode = useCallback((mode: AgendaViewMode) => {
    setViewModeState(mode);
    if (mode === 'semana') {
      setReferenceDate(getWeekStart(new Date()));
    } else if (mode === 'mes') {
      const now = new Date();
      setReferenceDate(new Date(now.getFullYear(), now.getMonth(), 1));
    }
    // 'lista' não altera referenceDate
  }, []);

  const goNext = useCallback(() => {
    setReferenceDate((prev) => {
      const d = new Date(prev);
      if (viewMode === 'semana') {
        d.setDate(d.getDate() + 7);
      } else if (viewMode === 'mes') {
        d.setMonth(d.getMonth() + 1);
      }
      return d;
    });
  }, [viewMode]);

  const goPrev = useCallback(() => {
    setReferenceDate((prev) => {
      const d = new Date(prev);
      if (viewMode === 'semana') {
        d.setDate(d.getDate() - 7);
      } else if (viewMode === 'mes') {
        d.setMonth(d.getMonth() - 1);
      }
      return d;
    });
  }, [viewMode]);

  const goToToday = useCallback(() => {
    if (viewMode === 'semana') {
      setReferenceDate(getWeekStart(new Date()));
    } else if (viewMode === 'mes') {
      const now = new Date();
      setReferenceDate(new Date(now.getFullYear(), now.getMonth(), 1));
    }
  }, [viewMode]);

  const weekDates = getWeekDates(referenceDate);

  const rangeLabel =
    viewMode === 'semana'
      ? formatWeekRange(weekDates[0], weekDates[6])
      : viewMode === 'mes'
        ? formatMonthHeader(referenceDate.getFullYear(), referenceDate.getMonth())
        : 'Todos os eventos';

  return {
    viewMode,
    referenceDate,
    weekDates,
    rangeLabel,
    setViewMode,
    goNext,
    goPrev,
    goToToday,
  };
}

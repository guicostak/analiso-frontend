"use client";

import { Sidebar } from '@/src/components/layout/Sidebar';
import { AppTopBar } from '@/src/components/layout/AppTopBar';
import { MainContent } from '@/src/components/layout/MainContent';
import { useAgenda } from '../hooks/useAgenda';
import { AgendaHeader } from './AgendaHeader';
import { AgendaWeekView } from './AgendaWeekView';
import { AgendaMonthView } from './AgendaMonthView';
import { AgendaEventDetail } from './AgendaEventDetail';
import { AgendaSkeleton } from './AgendaSkeleton';
import { AgendaEmptyState } from './AgendaEmptyState';
import { getEventsForDate } from '../utils/agenda.utils';

/**
 * Página principal da Agenda financeira.
 *
 * Segue o padrão de layout da aplicação:
 *  - Sidebar: fixed (fora do fluxo)
 *  - AppTopBar: fixed h-14, renderizado fora do MainContent
 *  - MainContent: ml-[240px|64px] (gerenciado pelo componente), pt-14 para compensar o AppTopBar
 *
 * Layout:
 * ┌──────────────────────────────────────────────┐
 * │ [AppTopBar — fixed, h-14]                    │
 * ├──────────────────────────────────────────────┤
 * │ Sidebar │ AgendaHeader (nav + filtros)        │
 * │ (fixed) ├──────────────────┬─────────────────┤
 * │         │ Calendar View    │ Event Detail    │
 * │         │ (Week ou Month)  │ (se selecionado)│
 * └──────────────────────────────────────────────┘
 */
export function AgendaPage() {
  const {
    filteredEvents,
    loading,
    error,
    selectedEvent,
    setSelectedEvent,
    uniqueTickers,
    navigation,
    filters,
  } = useAgenda();

  const hasEvents = filteredEvents.length > 0;

  // Verifica se há eventos visíveis na janela atual de navegação
  const eventsInCurrentView = (() => {
    if (navigation.viewMode === 'semana') {
      return navigation.weekDates.some(
        (d) => getEventsForDate(filteredEvents, d).length > 0,
      );
    }
    return filteredEvents.some((e) => {
      const [y, m] = e.date.split('-').map(Number);
      return (
        y === navigation.referenceDate.getFullYear() &&
        m - 1 === navigation.referenceDate.getMonth()
      );
    });
  })();

  return (
    <div className="min-h-screen bg-background">
      <Sidebar currentPage="agenda" />

      {/* AppTopBar é fixed — renderizado fora do MainContent, igual às outras páginas */}
      <AppTopBar sidebarOffsetClassName="left-0 xl:left-[240px]" />

      {/* pt-14 compensa o AppTopBar fixed (h-14 = 56px) */}
      <MainContent className="flex h-screen flex-col overflow-hidden pt-14">

        {loading ? (
          <AgendaSkeleton />
        ) : error ? (
          <div className="flex flex-1 items-center justify-center p-8">
            <p className="text-sm text-danger-text">{error}</p>
          </div>
        ) : (
          <div className="flex flex-1 flex-col overflow-hidden">
            {/* Header com navegação + filtros + toggle de view */}
            <AgendaHeader
              navigation={navigation}
              filters={filters}
              uniqueTickers={uniqueTickers}
            />

            {/* Corpo: calendário + painel de detalhes */}
            <div className="flex flex-1 overflow-hidden">

              {/* Calendário */}
              <div className="flex flex-1 flex-col overflow-hidden min-w-0">
                {!eventsInCurrentView ? (
                  <AgendaEmptyState reason={hasEvents ? 'no-events' : 'no-watchlist'} />
                ) : navigation.viewMode === 'semana' ? (
                  <AgendaWeekView
                    weekDates={navigation.weekDates}
                    events={filteredEvents}
                    selectedEvent={selectedEvent}
                    onSelectEvent={setSelectedEvent}
                  />
                ) : (
                  <AgendaMonthView
                    year={navigation.referenceDate.getFullYear()}
                    month={navigation.referenceDate.getMonth()}
                    events={filteredEvents}
                    selectedEvent={selectedEvent}
                    onSelectEvent={setSelectedEvent}
                  />
                )}
              </div>

            </div>
          </div>
        )}

      </MainContent>
    </div>
  );
}

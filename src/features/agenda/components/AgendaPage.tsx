"use client";

import { Sidebar } from '@/src/components/layout/Sidebar';
import { AppTopBar } from '@/src/components/layout/AppTopBar';
import { MainContent } from '@/src/components/layout/MainContent';
import { useAgenda } from '../hooks/useAgenda';
import { AgendaHeader } from './AgendaHeader';
import { AgendaWeekView } from './AgendaWeekView';
import { AgendaMonthView } from './AgendaMonthView';
import { AgendaListView } from './AgendaListView';
import { AgendaEventDetail } from './AgendaEventDetail';
import { AgendaSkeleton } from './AgendaSkeleton';
import { AgendaEmptyState } from './AgendaEmptyState';

export function AgendaPage() {
  const {
    filteredEvents,
    loading,
    error,
    selectedEvent,
    setSelectedEvent,
    uniqueTickers,
    hasWatchlist,
    navigation,
    filters,
  } = useAgenda();

  const hasEvents = filteredEvents.length > 0;

  /**
   * Decide se mostra o empty state em vez do grid/lista.
   *
   * **Lógica:**
   *   - Sem watchlist → empty state "adicione empresas" (qualquer view)
   *   - Modo lista vazia → empty state "sem eventos no período"
   *   - Modos `semana` e `mês` → SEMPRE mostra o grid, mesmo sem eventos
   *
   * **Por que sempre mostrar o grid em semana/mês:** o calendário em si é
   * o instrumento de navegação. Quando o mês atual está vazio, o usuário
   * PRECISA ver o grid pra (a) entender qual mês está ativo, (b) navegar
   * pra outros meses procurando eventos, (c) ler os dias vazios como
   * informação válida ("não tem evento aqui mesmo"). Antes a página
   * fazia render do empty state cobrindo o grid, e o usuário ficava sem
   * saber como sair daquela tela.
   */
  const showEmptyState =
    !hasWatchlist ||
    (navigation.viewMode === 'lista' && !hasEvents);

  const emptyStateReason: 'no-watchlist' | 'no-events' =
    !hasWatchlist ? 'no-watchlist' : 'no-events';

  return (
    <div className="min-h-screen bg-background">
      <Sidebar currentPage="agenda" />

      <AppTopBar sidebarOffsetClassName="left-0 xl:left-[240px]" />

      <MainContent className="flex h-screen flex-col overflow-hidden pt-14">

        {loading ? (
          <AgendaSkeleton />
        ) : error ? (
          <div className="flex flex-1 items-center justify-center p-8">
            <p className="text-sm text-danger-text">{error}</p>
          </div>
        ) : (
          <div className="flex flex-1 flex-col overflow-hidden">
            {/* Título da página */}
            <div className="shrink-0 px-5 pt-5 pb-3">
              <h1 className="text-2xl font-bold tracking-tight text-foreground">Agenda</h1>
            </div>

            {/* Barra de controles */}
            <AgendaHeader
              navigation={navigation}
              filters={filters}
              uniqueTickers={uniqueTickers}
            />

            {/* Corpo: calendário/lista + painel de detalhes */}
            <div className="flex flex-1 overflow-hidden">

              {/* Conteúdo principal */}
              <div className="flex flex-1 flex-col overflow-hidden min-w-0">
                {showEmptyState ? (
                  <AgendaEmptyState reason={emptyStateReason} />
                ) : navigation.viewMode === 'semana' ? (
                  <AgendaWeekView
                    weekDates={navigation.weekDates}
                    events={filteredEvents}
                    selectedEvent={selectedEvent}
                    onSelectEvent={setSelectedEvent}
                  />
                ) : navigation.viewMode === 'mes' ? (
                  <AgendaMonthView
                    year={navigation.referenceDate.getFullYear()}
                    month={navigation.referenceDate.getMonth()}
                    events={filteredEvents}
                    selectedEvent={selectedEvent}
                    onSelectEvent={setSelectedEvent}
                  />
                ) : (
                  <AgendaListView
                    events={filteredEvents}
                    selectedEvent={selectedEvent}
                    onSelectEvent={setSelectedEvent}
                  />
                )}
              </div>

              {/* Painel de detalhes (view lista) */}
              {navigation.viewMode === 'lista' && selectedEvent && (
                <div className="w-80 shrink-0 border-l border-border overflow-hidden">
                  <AgendaEventDetail
                    event={selectedEvent}
                    onClose={() => setSelectedEvent(null)}
                  />
                </div>
              )}

            </div>
          </div>
        )}

      </MainContent>
    </div>
  );
}

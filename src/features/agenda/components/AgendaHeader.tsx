"use client";

import { useState, useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight, SlidersHorizontal, ChevronDown, Check, CalendarDays, List } from 'lucide-react';
import { AGENDA_FILTER_OPTIONS } from '../constants/agenda.constants';
import type { AgendaViewMode, AgendaEventFilterType } from '../interfaces/agenda.interfaces';
import type { AgendaFiltersReturn } from '../hooks/useAgendaFilters';
import type { AgendaNavigationReturn } from '../hooks/useAgendaNavigation';

interface AgendaHeaderProps {
  navigation: AgendaNavigationReturn;
  filters: AgendaFiltersReturn;
  uniqueTickers: string[];
}

const CALENDAR_VIEWS: { mode: AgendaViewMode; label: string }[] = [
  { mode: 'semana', label: 'Semana' },
  { mode: 'mes',    label: 'Mês'    },
];

export function AgendaHeader({ navigation, filters, uniqueTickers }: AgendaHeaderProps) {
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [viewOpen, setViewOpen]       = useState(false);
  const filtersRef = useRef<HTMLDivElement>(null);
  const viewRef    = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (filtersRef.current && !filtersRef.current.contains(e.target as Node)) {
        setFiltersOpen(false);
      }
      if (viewRef.current && !viewRef.current.contains(e.target as Node)) {
        setViewOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const activeFilterCount =
    (filters.filters.eventType !== 'todos' ? 1 : 0) +
    filters.filters.tickers.length;

  const isLista       = navigation.viewMode === 'lista';
  const calendarLabel = CALENDAR_VIEWS.find((o) => o.mode === navigation.viewMode)?.label ?? 'Semana';

  return (
    <div className="flex shrink-0 items-center gap-4 border-b border-border bg-card px-5 py-3">

      {/* ── Tabs: Agenda / Lista ─────────────────────────────────────────── */}
      <div className="flex items-center gap-1">
        <button
          onClick={() => { if (isLista) navigation.setViewMode('semana'); }}
          className={`flex items-center gap-1.5 rounded-lg px-4 py-1.5 text-sm font-medium transition-all duration-150
            ${!isLista
              ? 'border border-border bg-card text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
            }
          `}
        >
          <CalendarDays size={14} />
          Calendário
        </button>
        <button
          onClick={() => navigation.setViewMode('lista')}
          className={`flex items-center gap-1.5 rounded-lg px-4 py-1.5 text-sm font-medium transition-all duration-150
            ${isLista
              ? 'border border-border bg-card text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
            }
          `}
        >
          <List size={14} />
          Lista
        </button>
      </div>

      {/* ── Navegação de período ──────────────────────────────────────────── */}
      <div className="flex items-center gap-0.5">
        <button
          onClick={navigation.goPrev}
          aria-label="Período anterior"
          className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors duration-150 hover:bg-hover hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <ChevronLeft size={16} />
        </button>

        <button
          onClick={navigation.goToToday}
          className="px-2 text-sm font-medium text-foreground transition-colors hover:text-brand focus-visible:outline-none rounded"
          aria-label="Ir para hoje"
        >
          {navigation.rangeLabel}
        </button>

        <button
          onClick={navigation.goNext}
          aria-label="Próximo período"
          className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors duration-150 hover:bg-hover hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <ChevronRight size={16} />
        </button>
      </div>

      <div className="flex-1" />

      {/* ── Filtrar ──────────────────────────────────────────────────────── */}
      <div ref={filtersRef} className="relative">
        <button
          onClick={() => setFiltersOpen((o) => !o)}
          aria-expanded={filtersOpen}
          aria-label="Abrir filtros"
          className={`flex items-center gap-2 rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors duration-150
            focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring
            ${filtersOpen || activeFilterCount > 0
              ? 'border-brand bg-brand-surface text-brand-text'
              : 'border-border bg-card text-foreground hover:bg-hover'
            }
          `}
        >
          <SlidersHorizontal size={14} />
          Filtrar
          {activeFilterCount > 0 && (
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-brand text-[10px] font-bold text-white">
              {activeFilterCount}
            </span>
          )}
        </button>

        {filtersOpen && (
          <div className="absolute right-0 top-full z-50 mt-2 w-64 rounded-xl border border-border bg-card shadow-lg dark:shadow-none animate-in fade-in-0 slide-in-from-top-2 duration-150">
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
              <p className="text-xs font-semibold text-foreground">Filtros</p>
              {activeFilterCount > 0 && (
                <button
                  onClick={filters.clearFilters}
                  className="text-[11px] text-brand-text hover:text-brand transition-colors"
                >
                  Limpar tudo
                </button>
              )}
            </div>

            <div className="px-4 py-3">
              <p className="mb-2 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                Tipo de evento
              </p>
              <div className="space-y-0.5">
                {AGENDA_FILTER_OPTIONS.map((opt) => {
                  const active = filters.filters.eventType === opt.value;
                  return (
                    <button
                      key={opt.value}
                      onClick={() => filters.setEventType(opt.value as AgendaEventFilterType)}
                      className={`flex w-full items-center justify-between rounded-md px-2.5 py-1.5 text-xs transition-colors duration-100
                        ${active ? 'bg-brand-surface text-brand-text font-medium' : 'text-foreground hover:bg-hover'}
                      `}
                    >
                      {opt.label}
                      {active && <Check size={12} className="text-brand" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {uniqueTickers.length > 0 && (
              <div className="border-t border-border px-4 py-3">
                <p className="mb-2 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                  Empresas
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {uniqueTickers.map((ticker) => {
                    const active = filters.filters.tickers.includes(ticker);
                    return (
                      <button
                        key={ticker}
                        onClick={() => filters.toggleTicker(ticker)}
                        className={`rounded-full border px-2.5 py-0.5 text-[11px] font-medium transition-colors duration-100
                          ${active
                            ? 'border-brand bg-brand-surface text-brand-text'
                            : 'border-border bg-muted text-muted-foreground hover:border-border-strong hover:text-foreground'
                          }
                        `}
                      >
                        {ticker}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Semana / Mês ─────────────────────────────────────────────────── */}
      <div ref={viewRef} className="relative">
        <button
          onClick={() => setViewOpen((o) => !o)}
          aria-expanded={viewOpen}
          aria-label="Mudar modo de visualização"
          className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-1.5 text-sm font-medium text-foreground transition-colors duration-150 hover:bg-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <CalendarDays size={14} className="text-muted-foreground" />
          {calendarLabel}
          <ChevronDown size={13} className={`text-muted-foreground transition-transform duration-150 ${viewOpen ? 'rotate-180' : ''}`} />
        </button>

        {viewOpen && (
          <div className="absolute right-0 top-full z-50 mt-2 w-32 overflow-hidden rounded-xl border border-border bg-card shadow-lg dark:shadow-none animate-in fade-in-0 slide-in-from-top-2 duration-150">
            {CALENDAR_VIEWS.map(({ mode, label }) => {
              const active = navigation.viewMode === mode;
              return (
                <button
                  key={mode}
                  onClick={() => { navigation.setViewMode(mode); setViewOpen(false); }}
                  className={`flex w-full items-center justify-between px-4 py-2.5 text-sm transition-colors duration-100
                    ${active ? 'bg-brand-surface text-brand-text font-medium' : 'text-foreground hover:bg-hover'}
                  `}
                >
                  {label}
                  {active && <Check size={13} className="text-brand" />}
                </button>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
}

"use client";

import { useState } from 'react';
import { WEEK_DAY_LABELS, AGENDA_EVENT_CONFIG } from '../constants/agenda.constants';
import { getEventsForDate, isToday } from '../utils/agenda.utils';
import type { AgendaEvent } from '../interfaces/agenda.interfaces';
import { AgendaEventPopover } from './AgendaEventPopover';

const ROWS       = 14;
const ROW_HEIGHT = 48;

interface AgendaWeekViewProps {
  weekDates: Date[];
  events: AgendaEvent[];
  selectedEvent: AgendaEvent | null;
  onSelectEvent: (event: AgendaEvent | null) => void;
}

export function AgendaWeekView({ weekDates, events, selectedEvent, onSelectEvent }: AgendaWeekViewProps) {
  const [anchorRect, setAnchorRect] = useState<DOMRect | null>(null);

  function handleCardClick(event: AgendaEvent, btn: HTMLButtonElement) {
    const isSelected = selectedEvent !== null && selectedEvent.id === event.id;
    if (isSelected) {
      onSelectEvent(null);
      setAnchorRect(null);
    } else {
      onSelectEvent(event);
      setAnchorRect(btn.getBoundingClientRect());
    }
  }

  function handleClose() {
    onSelectEvent(null);
    setAnchorRect(null);
  }

  return (
    <div className="flex flex-1 flex-col overflow-hidden bg-card">

      {/* ── Linha de cabeçalho dos dias ──────────────────────────────────── */}
      <div className="flex shrink-0 border-b border-border">
        {weekDates.map((date, idx) => {
          const today   = isToday(date);
          const dayAbbr = WEEK_DAY_LABELS[date.getDay()];
          const dayNum  = date.getDate();

          return (
            <div
              key={idx}
              className={`flex flex-1 flex-col items-center justify-center py-3 border-r border-border last:border-r-0
                ${today ? 'bg-brand-surface/40' : 'bg-card'}
              `}
            >
              {today ? (
                <span className="flex items-center gap-1 rounded-lg border border-brand bg-brand-surface px-2.5 py-0.5">
                  <span className="text-sm font-bold text-brand">{dayNum}</span>
                  <span className="text-xs font-medium text-brand">{dayAbbr}</span>
                </span>
              ) : (
                <span className="flex items-center gap-1">
                  <span className="text-sm font-bold text-foreground">{dayNum}</span>
                  <span className="text-xs font-medium text-muted-foreground">{dayAbbr}</span>
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* ── Grid + eventos ───────────────────────────────────────────────── */}
      <div className="flex-1 min-h-0 overflow-y-auto">
        <div
          className="flex"
          style={{ height: '100%', minHeight: `${ROWS * ROW_HEIGHT}px` }}
        >
          {weekDates.map((date, idx) => {
            const dayEvents = getEventsForDate(events, date);
            const today     = isToday(date);

            return (
              <div
                key={idx}
                className={`relative flex-1 border-r border-border last:border-r-0
                  ${today ? 'bg-brand-surface/10' : ''}
                `}
                style={{
                  backgroundImage: `repeating-linear-gradient(
                    to bottom,
                    transparent 0px,
                    transparent ${ROW_HEIGHT - 1}px,
                    var(--border) ${ROW_HEIGHT - 1}px,
                    var(--border) ${ROW_HEIGHT}px
                  )`,
                }}
              >
                {/* Eventos sobrepostos no topo da coluna */}
                <div className="absolute inset-x-0 top-0 flex flex-col gap-1 px-1.5 py-2">
                  {dayEvents.map((event) => {
                    const config   = AGENDA_EVENT_CONFIG[event.eventType];
                    const selected = selectedEvent?.id === event.id;

                    return (
                      <button
                        key={event.id}
                        onClick={(e) => handleCardClick(event, e.currentTarget)}
                        className={`w-full rounded-lg border border-border/60 text-left shadow-sm
                          overflow-hidden transition-all duration-150
                          active:scale-[0.98]
                          focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring
                          ${config.bgClass}
                          ${selected ? 'ring-2 ring-brand shadow-md' : 'hover:shadow-md hover:-translate-y-px'}
                        `}
                        aria-pressed={selected}
                        aria-label={`${event.title} — ${event.companyName}`}
                      >
                        <div className="flex items-stretch gap-2 p-2">
                          <span
                            className="w-[3px] shrink-0 rounded-full my-0.5"
                            style={{ backgroundColor: config.borderColor }}
                          />
                          <div className="min-w-0 flex-1">
                            <div className="flex items-start justify-between gap-1">
                              <p className="truncate text-[11px] font-semibold text-foreground leading-tight">
                                {event.ticker}
                              </p>
                              <span
                                className="mt-0.5 h-2 w-2 shrink-0 rounded-full"
                                style={{ backgroundColor: config.dotColor }}
                              />
                            </div>
                            <p className="truncate text-[10px] text-muted-foreground leading-tight mt-0.5">
                              {event.title}
                            </p>
                            {event.formattedValue && (
                              <p className="text-[10px] font-semibold leading-tight mt-0.5"
                                style={{ color: config.borderColor }}>
                                {event.formattedValue}
                              </p>
                            )}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Popover flutuante ao lado do card selecionado */}
      {selectedEvent && anchorRect && (
        <AgendaEventPopover
          event={selectedEvent}
          anchorRect={anchorRect}
          onClose={handleClose}
        />
      )}
    </div>
  );
}

"use client";

import { useState } from 'react';
import { WEEK_DAY_LABELS, AGENDA_EVENT_CONFIG } from '../constants/agenda.constants';
import { getMonthGrid, getEventsForDate, isToday } from '../utils/agenda.utils';
import type { AgendaEvent } from '../interfaces/agenda.interfaces';
import { AgendaEventPopover } from './AgendaEventPopover';

interface AgendaMonthViewProps {
  year: number;
  month: number;
  events: AgendaEvent[];
  selectedEvent: AgendaEvent | null;
  onSelectEvent: (event: AgendaEvent | null) => void;
}

export function AgendaMonthView({
  year,
  month,
  events,
  selectedEvent,
  onSelectEvent,
}: AgendaMonthViewProps) {
  const weeks = getMonthGrid(year, month);
  const [anchorRect, setAnchorRect] = useState<DOMRect | null>(null);

  function handleCardClick(event: AgendaEvent, btn: HTMLButtonElement) {
    const isSelected = selectedEvent?.id === event.id;
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
    <div className="flex flex-1 flex-col overflow-hidden">
      {/* ── Header dos dias da semana ─────────────────────────────────────── */}
      <div className="grid grid-cols-7 border-b border-border bg-muted/50">
        {WEEK_DAY_LABELS.map((label) => (
          <div
            key={label}
            className="py-2 text-center text-[10px] font-medium uppercase tracking-wider text-muted-foreground"
          >
            {label}
          </div>
        ))}
      </div>

      {/* ── Grid de semanas ──────────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto">
        {weeks.map((week, wi) => (
          <div key={wi} className="grid grid-cols-7 border-b border-border last:border-b-0">
            {week.map((date, di) => {
              if (!date) {
                // Célula fora do mês
                return (
                  <div
                    key={di}
                    className="min-h-[100px] border-r border-border last:border-r-0 bg-muted/20 p-1"
                  />
                );
              }

              const dayEvents   = getEventsForDate(events, date);
              const today       = isToday(date);
              const MAX_VISIBLE = 3;
              const visible     = dayEvents.slice(0, MAX_VISIBLE);
              const overflow    = dayEvents.length - MAX_VISIBLE;

              return (
                <div
                  key={di}
                  className={`min-h-[100px] border-r border-border last:border-r-0 p-1.5 flex flex-col
                    ${today ? 'bg-brand-surface/30' : 'bg-card hover:bg-hover/40'}
                    transition-colors duration-100
                  `}
                >
                  {/* Número do dia */}
                  <span className={`mb-1 flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold self-center
                    ${today ? 'bg-brand text-white' : 'text-foreground'}
                  `}>
                    {date.getDate()}
                  </span>

                  {/* Chips de eventos */}
                  <div className="space-y-0.5">
                    {visible.map((event) => {
                      const config    = AGENDA_EVENT_CONFIG[event.eventType];
                      const selected  = selectedEvent?.id === event.id;
                      return (
                        <button
                          key={event.id}
                          onClick={(e) => handleCardClick(event, e.currentTarget)}
                          className={`w-full rounded flex items-center gap-1 px-1.5 py-0.5 text-left transition-all duration-100
                            hover:opacity-90 active:scale-[0.98]
                            focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring
                            ${config.bgClass}
                            ${selected ? 'ring-2 ring-brand' : ''}
                          `}
                          style={{ borderLeft: `3px solid ${config.borderColor}` }}
                          aria-label={`${event.title} — ${event.ticker}`}
                          aria-pressed={selected}
                        >
                          <span
                            className="h-1.5 w-1.5 shrink-0 rounded-full"
                            style={{ backgroundColor: config.dotColor }}
                          />
                          <span className="truncate text-[10px] font-medium text-foreground">
                            {event.ticker}
                          </span>
                        </button>
                      );
                    })}

                    {overflow > 0 && (
                      <p className="text-[9px] text-muted-foreground pl-1">
                        +{overflow} evento{overflow > 1 ? 's' : ''}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </div>

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

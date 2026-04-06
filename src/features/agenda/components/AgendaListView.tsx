"use client";

import { useMemo } from 'react';
import { MONTH_NAMES_SHORT, AGENDA_EVENT_CONFIG } from '../constants/agenda.constants';
import { parseDateLocal } from '../utils/agenda.utils';
import type { AgendaEvent } from '../interfaces/agenda.interfaces';

interface AgendaListViewProps {
  events: AgendaEvent[];
  selectedEvent: AgendaEvent | null;
  onSelectEvent: (event: AgendaEvent | null) => void;
}

export function AgendaListView({ events, selectedEvent, onSelectEvent }: AgendaListViewProps) {
  const groups = useMemo(() => {
    const map = new Map<string, AgendaEvent[]>();
    for (const event of events) {
      const list = map.get(event.date) ?? [];
      list.push(event);
      map.set(event.date, list);
    }
    return Array.from(map.entries()).sort(([a], [b]) => a.localeCompare(b));
  }, [events]);

  function handleClick(event: AgendaEvent) {
    onSelectEvent(selectedEvent !== null && selectedEvent.id === event.id ? null : event);
  }

  return (
    <div className="flex-1 overflow-y-auto px-5 py-5">
      <div className="space-y-3">
        {groups.map(([date, groupEvents]) => {
          const first      = groupEvents[0];
          const d          = parseDateLocal(date);
          const dayNum     = d.getDate();
          const month      = MONTH_NAMES_SHORT[d.getMonth()].toUpperCase();
          const dateConfig = AGENDA_EVENT_CONFIG[first.eventType];

          return (
            <div key={date} className="flex gap-4 items-start">

              {/* ── Date card ──────────────────────────────────────────── */}
              <div className="shrink-0 flex flex-col w-14 rounded-xl overflow-hidden">
                {/* Card do número */}
                <div
                  className="flex items-center justify-center py-2"
                  style={{ backgroundColor: dateConfig.borderColor, opacity: 0.75 }}
                >
                  <span className="text-lg font-bold leading-none tabular-nums text-white">
                    {dayNum}
                  </span>
                </div>
                {/* Card do mês */}
                <div className={`flex items-center justify-center py-1 ${dateConfig.bgClass}`}>
                  <span
                    className="text-[10px] font-semibold tracking-wide"
                    style={{ color: dateConfig.dotColor }}
                  >
                    {month}
                  </span>
                </div>
              </div>

              {/* ── Event rows ─────────────────────────────────────────── */}
              <div className="flex-1 min-w-0 divide-y divide-border rounded-xl border border-border bg-card overflow-hidden">
                {groupEvents.map((event) => {
                  const isSelected = selectedEvent !== null && selectedEvent.id === event.id;

                  return (
                    <button
                      key={event.id}
                      onClick={() => handleClick(event)}
                      aria-pressed={isSelected}
                      aria-label={`${event.ticker} — ${event.title}`}
                      className={`w-full text-left px-4 py-3 transition-colors duration-100
                        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring
                        ${isSelected ? 'bg-brand-surface' : 'hover:bg-hover'}
                      `}
                    >
                      <p className="text-sm text-foreground leading-snug">
                        <span className="font-semibold">{event.ticker}</span>
                        {' — '}
                        {event.title}
                      </p>
                      {event.description && (
                        <p className="mt-0.5 text-xs text-muted-foreground line-clamp-1">
                          {event.description}
                        </p>
                      )}
                    </button>
                  );
                })}
              </div>

            </div>
          );
        })}
      </div>
    </div>
  );
}

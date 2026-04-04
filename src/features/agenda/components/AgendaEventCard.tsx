"use client";

import { AgendaEventBadge } from './AgendaEventBadge';
import { AGENDA_EVENT_CONFIG } from '../constants/agenda.constants';
import type { AgendaEvent } from '../interfaces/agenda.interfaces';

interface AgendaEventCardProps {
  event: AgendaEvent;
  isSelected: boolean;
  onClick: (event: AgendaEvent) => void;
  /** Compact = usado na view semanal dentro de colunas */
  compact?: boolean;
}

/**
 * Card de evento no calendário.
 * Layout inspirado no design da referência visual (Clinic Up),
 * adaptado para o contexto financeiro.
 */
export function AgendaEventCard({ event, isSelected, onClick, compact = false }: AgendaEventCardProps) {
  const config = AGENDA_EVENT_CONFIG[event.eventType];

  return (
    <button
      onClick={() => onClick(event)}
      className={`w-full text-left rounded-lg border-l-4 transition-all duration-150
        active:scale-[0.98]
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring
        ${compact ? 'px-2 py-1.5' : 'px-3 py-2.5'}
        ${isSelected
          ? 'bg-brand-surface border-border shadow-sm'
          : `${config.bgClass} border-border hover:shadow-sm hover:border-border-strong`
        }
      `}
      style={{ borderLeftColor: config.borderColor }}
      aria-pressed={isSelected}
      aria-label={`${event.title} — ${event.companyName} — ${event.formattedDate}`}
    >
      {/* Topo: ticker + dot + badge */}
      <div className="flex items-center justify-between gap-1 mb-0.5">
        <span className="text-xs font-semibold text-foreground truncate">
          {event.ticker}
        </span>
        <span
          className="h-2 w-2 rounded-full shrink-0"
          style={{ backgroundColor: config.dotColor }}
        />
      </div>

      {/* Título */}
      <p className={`font-medium text-foreground leading-tight truncate
        ${compact ? 'text-[11px]' : 'text-xs'}
      `}>
        {event.title}
      </p>

      {/* Badge de tipo (só no modo não-compacto) */}
      {!compact && (
        <div className="mt-1.5">
          <AgendaEventBadge eventType={event.eventType} size="sm" />
        </div>
      )}

      {/* Valor (dividendos / JCP) — modo não-compacto */}
      {!compact && event.formattedValue && (
        <p className="mt-1 text-[10px] font-semibold text-success-text truncate">
          {event.formattedValue}
        </p>
      )}

      {/* Countdown — modo não-compacto */}
      {!compact && (
        <p className={`mt-0.5 text-[10px] ${event.isPast ? 'text-muted-foreground' : 'text-brand-text font-medium'}`}>
          {event.isPast
            ? event.formattedDate
            : event.isToday
              ? 'Hoje'
              : event.daysUntil === 1
                ? 'Amanhã'
                : `Em ${event.daysUntil} dias`
          }
        </p>
      )}
    </button>
  );
}

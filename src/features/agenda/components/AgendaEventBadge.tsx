"use client";

import { AGENDA_EVENT_CONFIG } from '../constants/agenda.constants';
import type { AgendaEventType } from '../interfaces/agenda.interfaces';

interface AgendaEventBadgeProps {
  eventType: AgendaEventType;
  size?: 'sm' | 'md';
}

/**
 * Badge colorido para identificar o tipo de evento.
 * Usa apenas tokens semânticos do design system — zero cores hardcoded.
 */
export function AgendaEventBadge({ eventType, size = 'sm' }: AgendaEventBadgeProps) {
  const config = AGENDA_EVENT_CONFIG[eventType];

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border font-medium
        ${config.badgeClass}
        ${size === 'sm' ? 'px-1.5 py-0.5 text-[10px]' : 'px-2 py-0.5 text-xs'}
      `}
    >
      <span
        className="h-1.5 w-1.5 rounded-full"
        style={{ backgroundColor: config.dotColor }}
      />
      {config.label}
    </span>
  );
}

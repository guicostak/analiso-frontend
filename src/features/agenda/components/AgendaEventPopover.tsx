"use client";

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { X, Building2, Tag, CalendarDays, TrendingUp, Layers, ExternalLink } from 'lucide-react';
import { AGENDA_EVENT_CONFIG, PILLAR_LABELS, TICKER_LOGOS } from '../constants/agenda.constants';
import type { AgendaEvent } from '../interfaces/agenda.interfaces';

interface AgendaEventPopoverProps {
  event: AgendaEvent;
  anchorRect: DOMRect;
  onClose: () => void;
}

const POPOVER_WIDTH = 288;

export function AgendaEventPopover({ event, anchorRect, onClose }: AgendaEventPopoverProps) {
  const router = useRouter();
  const popoverRef = useRef<HTMLDivElement>(null);
  const config = AGENDA_EVENT_CONFIG[event.eventType];

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        onClose();
      }
    }
    const timer = setTimeout(() => {
      document.addEventListener('mousedown', handleClick);
    }, 0);
    return () => {
      clearTimeout(timer);
      document.removeEventListener('mousedown', handleClick);
    };
  }, [onClose]);

  const margin = 10;
  const viewportWidth = typeof window !== 'undefined' ? window.innerWidth : 1200;
  const left = anchorRect.right + margin + POPOVER_WIDTH > viewportWidth - 16
    ? anchorRect.left - POPOVER_WIDTH - margin
    : anchorRect.right + margin;
  const top = Math.max(8, Math.min(anchorRect.top, window.innerHeight - 400));

  const rows: { icon: React.ElementType; label: string; value: string }[] = [
    { icon: Building2,    label: 'Empresa', value: `${event.companyName} (${event.ticker})` },
    { icon: Tag,          label: 'Tipo',    value: config.label },
    { icon: CalendarDays, label: 'Data',    value: event.formattedDateLong },
    ...(event.formattedValue
      ? [{ icon: TrendingUp, label: 'Valor', value: event.formattedValue }]
      : []),
    ...(event.pillar
      ? [{ icon: Layers, label: 'Pilar', value: PILLAR_LABELS[event.pillar] ?? event.pillar }]
      : []),
  ];

  return (
    <div
      ref={popoverRef}
      className="fixed z-50 rounded-2xl border border-border bg-card shadow-xl"
      style={{ top, left, width: POPOVER_WIDTH }}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2 border-b border-border px-4 py-3">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-foreground leading-snug">{event.title}</p>
          <div className="mt-1 flex flex-wrap items-center gap-1.5">
            <span
              className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold"
              style={{
                backgroundColor: `color-mix(in srgb, ${config.borderColor} 15%, transparent)`,
                color: config.borderColor,
              }}
            >
              <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: config.dotColor }} />
              {config.label}
            </span>
            <span className="text-[11px] text-muted-foreground">{event.formattedDateLong}</span>
          </div>
        </div>
        <button
          onClick={onClose}
          className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-hover hover:text-foreground"
        >
          <X size={13} />
        </button>
      </div>

      {/* Linhas de info */}
      <div className="space-y-4 px-4 py-4">
        {rows.map(({ icon: Icon, label, value }) => (
          <div key={label} className="flex items-center gap-3">
            <Icon size={14} className="shrink-0 text-muted-foreground" />
            <span className="w-12 shrink-0 text-[11px] text-muted-foreground">{label}</span>
            <div className="flex min-w-0 flex-1 items-center gap-1.5">
              {label === 'Empresa' && TICKER_LOGOS[event.ticker] && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={TICKER_LOGOS[event.ticker]}
                  alt={event.ticker}
                  className="h-4 w-4 shrink-0 rounded-full object-contain"
                  onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
                />
              )}
              <span className="min-w-0 flex-1 truncate text-[12px] font-medium text-foreground">{value}</span>
            </div>
          </div>
        ))}

        {event.description && (
          <p className="mt-1 border-t border-border pt-2.5 text-[11px] leading-relaxed text-muted-foreground">
            {event.description}
          </p>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between border-t border-border px-4 py-3">
        {event.sourceUrl ? (
          <a
            href={event.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-[11px] text-muted-foreground transition-colors hover:text-foreground"
          >
            <ExternalLink size={12} />
            Abrir doc
          </a>
        ) : (
          <span />
        )}

        <button
          onClick={() => router.push(`/analysis/${event.ticker}`)}
          className="rounded-lg bg-brand px-4 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-brand/90"
        >
          Ver análise
        </button>
      </div>
    </div>
  );
}

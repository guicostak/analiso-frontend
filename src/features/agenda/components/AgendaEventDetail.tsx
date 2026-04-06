"use client";

import { X, ExternalLink, ArrowRight, Building2, Tag, BarChart2, FileText, Banknote } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { AgendaEventBadge } from './AgendaEventBadge';
import { PILLAR_LABELS } from '../constants/agenda.constants';
import type { AgendaEvent } from '../interfaces/agenda.interfaces';

interface AgendaEventDetailProps {
  event: AgendaEvent;
  onClose: () => void;
}

export function AgendaEventDetail({ event, onClose }: AgendaEventDetailProps) {
  const router = useRouter();

  function handleViewAnalysis() {
    router.push(`/analysis/${event.ticker}`);
  }

  const pillarLabel = event.pillar ? (PILLAR_LABELS[event.pillar] ?? event.pillar) : null;

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-xl border border-border bg-card shadow-lg dark:shadow-none animate-in slide-in-from-right-4 duration-200">

      {/* ── Header ── */}
      <div className="flex items-start justify-between gap-3 border-b border-border px-5 py-4">
        <div className="min-w-0 flex-1">
          <h3 className="text-sm font-semibold text-foreground leading-snug truncate">
            {event.title}
          </h3>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {event.formattedDateLong}
          </p>
        </div>
        <button
          onClick={onClose}
          aria-label="Fechar detalhes"
          className="shrink-0 flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition-colors duration-150 hover:bg-hover hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <X size={16} />
        </button>
      </div>

      <div className="px-5 pt-3 pb-1">
        <AgendaEventBadge eventType={event.eventType} size="md" />
      </div>

      {/* ── Campos de detalhe ── */}
      <div className="flex-1 overflow-y-auto px-5 py-3 space-y-3">
        <DetailRow
          icon={<Building2 size={14} />}
          label="Empresa"
          value={`${event.ticker} — ${event.companyName}`}
        />

        {event.formattedValue && (
          <DetailRow
            icon={<Banknote size={14} />}
            label="Valor"
            value={event.formattedValue}
            valueClassName="font-semibold text-success-text"
          />
        )}

        <DetailRow
          icon={<Tag size={14} />}
          label="Data"
          value={`${event.formattedDate}${event.isToday ? ' — Hoje' : event.daysUntil === 1 ? ' — Amanhã' : event.daysUntil !== null ? ` — Em ${event.daysUntil} dias` : ''}`}
        />

        {pillarLabel && (
          <DetailRow
            icon={<BarChart2 size={14} />}
            label="Pilar"
            value={pillarLabel}
          />
        )}

        {event.sourceLabel && (
          <DetailRow
            icon={<FileText size={14} />}
            label="Fonte"
            value={event.sourceLabel}
          />
        )}

        {event.description && (
          <div className="pt-1">
            <p className="mb-1 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
              Descrição
            </p>
            <p className="text-xs text-foreground leading-relaxed">
              {event.description}
            </p>
          </div>
        )}
      </div>

      {/* ── Actions ── */}
      <div className="flex items-center gap-2 border-t border-border bg-muted px-5 py-3">
        {event.sourceUrl && (
          <a
            href={event.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-1 items-center justify-center gap-1.5 rounded-md border border-border bg-card px-3 py-2 text-xs font-medium text-foreground transition-colors duration-150 hover:bg-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <ExternalLink size={13} />
            Abrir doc
          </a>
        )}
        <button
          onClick={handleViewAnalysis}
          className="flex flex-1 items-center justify-center gap-1.5 rounded-md bg-brand px-3 py-2 text-xs font-medium text-white transition-colors duration-150 hover:bg-brand-hover active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          Ver análise
          <ArrowRight size={13} />
        </button>
      </div>
    </div>
  );
}

interface DetailRowProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  valueClassName?: string;
}

function DetailRow({ icon, label, value, valueClassName }: DetailRowProps) {
  return (
    <div className="flex items-start gap-3">
      <span className="mt-0.5 shrink-0 text-muted-foreground">{icon}</span>
      <div className="min-w-0 flex-1">
        <p className="text-[11px] text-muted-foreground">{label}</p>
        <p className={`text-xs font-medium text-foreground ${valueClassName ?? ''}`}>
          {value}
        </p>
      </div>
    </div>
  );
}

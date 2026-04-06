// ─── Tipos de evento ──────────────────────────────────────────────────────────

export type AgendaEventType =
  | 'balanco'
  | 'dividendo'
  | 'ex_dividendo'
  | 'jcp'
  | 'fato_relevante'
  | 'conference_call'
  | 'subscricao';

export type AgendaViewMode = 'semana' | 'mes' | 'lista';

export type AgendaEventFilterType =
  | 'todos'
  | 'balanco'
  | 'dividendo'
  | 'ex_dividendo'
  | 'jcp'
  | 'fato_relevante'
  | 'conference_call'
  | 'subscricao';

// ─── DTOs (formato da API) ─────────────────────────────────────────────────────

/** Evento individual retornado pelo backend dentro de um grupo de data. */
export interface AgendaEventDTO {
  id: string;
  date: string;         // YYYY-MM-DD
  ticker: string;
  eventType: string;    // tipo bruto do pipeline: "reports", "provent_payment", etc.
  eventTypeLabel: string;
  title: string;
  description: string | null;
  severity: string;
  sourceUrl: string | null;
}

/** Grupo de eventos por data retornado pelo backend. */
export interface AgendaGroupDTO {
  date: string;     // YYYY-MM-DD
  dayLabel: string; // "Hoje", "Amanhã" ou "Seg, 07 abr"
  events: AgendaEventDTO[];
}

/** Resposta completa de GET /api/agenda */
export interface AgendaDTO {
  dateFrom: string;
  dateTo: string;
  totalEvents: number;
  groups: AgendaGroupDTO[];
}

// ─── Models (formato de UI) ────────────────────────────────────────────────────

export interface AgendaEvent {
  id: string;
  ticker: string;
  companyName: string;
  logoUrl: string | null;
  eventType: AgendaEventType;
  title: string;
  date: string;           // YYYY-MM-DD — usado para cálculos de data
  formattedDate: string;  // DD/MM/YYYY — exibição ao usuário
  formattedDateLong: string; // ex: "Qui, 24 de Abr de 2026"
  description: string | null;
  value: number | null;
  formattedValue: string | null; // ex: "R$ 0,52 / ação"
  pillar: string | null;
  sourceLabel: string | null;
  sourceUrl: string | null;
  severity: 'low' | 'medium' | 'high' | 'critical';
  isPast: boolean;
  isToday: boolean;
  daysUntil: number | null; // null se já passou
}

// ─── Estado de filtros ─────────────────────────────────────────────────────────

export interface AgendaFiltersState {
  eventType: AgendaEventFilterType;
  tickers: string[]; // vazio = todas as empresas
}

// ─── Estado de navegação ───────────────────────────────────────────────────────

export interface AgendaNavigationState {
  viewMode: AgendaViewMode;
  referenceDate: Date; // domingo da semana ativa (week) ou 1° do mês (month)
}

// ─── Tipos de evento ──────────────────────────────────────────────────────────

export type AgendaEventType =
  | 'balanco'
  | 'dividendo'
  | 'ex_dividendo'
  | 'jcp'
  | 'fato_relevante'
  | 'conference_call'
  | 'subscricao';

export type AgendaViewMode = 'semana' | 'mes';

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

export interface AgendaEventDTO {
  id: string;
  ticker: string;
  companyName: string;
  logoUrl: string | null;
  eventType: AgendaEventType;
  title: string;
  date: string; // YYYY-MM-DD
  description: string | null;
  value: number | null;       // DPS, valor do JCP, etc.
  valueUnit: string | null;   // 'BRL/ação', '%', etc.
  pillar: string | null;
  sourceLabel: string | null; // 'CVM', 'B3', 'RI', etc.
  sourceUrl: string | null;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

export interface AgendaDTO {
  events: AgendaEventDTO[];
  generatedAt: string;
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

import type { AgendaEventType, AgendaEventFilterType } from '../interfaces/agenda.interfaces';

// ─── Labels legíveis por tipo de evento ───────────────────────────────────────

export const AGENDA_EVENT_LABELS: Record<AgendaEventType, string> = {
  balanco:          'Balanço',
  dividendo:        'Dividendo',
  ex_dividendo:     'Ex-Dividendo',
  jcp:              'JCP',
  fato_relevante:   'Fato Relevante',
  conference_call:  'Conference Call',
  subscricao:       'Subscrição',
};

// ─── Configuração visual por tipo de evento ────────────────────────────────────
// Usa variáveis CSS do design system — nunca valores hardcoded

export const AGENDA_EVENT_CONFIG: Record<
  AgendaEventType,
  {
    label: string;
    badgeClass: string;         // classes Tailwind para o badge
    borderColor: string;        // valor de CSS var para border-left
    dotColor: string;           // valor de CSS var para o dot colorido
    bgClass: string;            // fundo suave na view semanal
  }
> = {
  balanco: {
    label: 'Balanço',
    badgeClass: 'bg-brand-surface border-brand-border text-brand-text',
    borderColor: 'var(--brand)',
    dotColor: 'var(--brand)',
    bgClass: 'bg-brand-surface',
  },
  dividendo: {
    label: 'Dividendo',
    badgeClass: 'bg-success-surface border-success-border text-success-text',
    borderColor: 'var(--success-text)',
    dotColor: 'var(--success-text)',
    bgClass: 'bg-success-surface',
  },
  ex_dividendo: {
    label: 'Ex-Dividendo',
    badgeClass: 'bg-warning-surface border-warning-border text-warning-text',
    borderColor: 'var(--warning-text)',
    dotColor: 'var(--warning-text)',
    bgClass: 'bg-warning-surface',
  },
  jcp: {
    label: 'JCP',
    badgeClass: 'bg-brand-surface border-brand-border text-brand-text',
    borderColor: 'var(--brand)',
    dotColor: 'var(--brand)',
    bgClass: 'bg-brand-surface',
  },
  fato_relevante: {
    label: 'Fato Relevante',
    badgeClass: 'bg-danger-surface border-danger-border text-danger-text',
    borderColor: 'var(--danger-text)',
    dotColor: 'var(--danger-text)',
    bgClass: 'bg-danger-surface',
  },
  conference_call: {
    label: 'Conference Call',
    badgeClass: 'bg-muted border-border text-muted-foreground',
    borderColor: 'var(--muted-foreground)',
    dotColor: 'var(--muted-foreground)',
    bgClass: 'bg-muted',
  },
  subscricao: {
    label: 'Subscrição',
    badgeClass: 'bg-warning-surface border-warning-border text-warning-text',
    borderColor: 'var(--warning-text)',
    dotColor: 'var(--warning-text)',
    bgClass: 'bg-warning-surface',
  },
};

// ─── Opções de filtro ──────────────────────────────────────────────────────────

export const AGENDA_FILTER_OPTIONS: Array<{ value: AgendaEventFilterType; label: string }> = [
  { value: 'todos',           label: 'Todos os eventos' },
  { value: 'balanco',         label: 'Balanços' },
  { value: 'dividendo',       label: 'Dividendos' },
  { value: 'ex_dividendo',    label: 'Ex-Dividendo' },
  { value: 'jcp',             label: 'JCP' },
  { value: 'fato_relevante',  label: 'Fatos Relevantes' },
  { value: 'conference_call', label: 'Conference Calls' },
  { value: 'subscricao',      label: 'Subscrições' },
];

// ─── Datas ─────────────────────────────────────────────────────────────────────

export const WEEK_DAY_LABELS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'] as const;

export const WEEK_DAY_LABELS_FULL = [
  'Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado',
] as const;

export const MONTH_NAMES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
] as const;

export const MONTH_NAMES_SHORT = [
  'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun',
  'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez',
] as const;

export const TICKER_LOGOS: Record<string, string> = {
  BBDC4:  'https://s3-symbol-logo.tradingview.com/bradesco--big.svg',
  BBAS3:  'https://s3-symbol-logo.tradingview.com/banco-do-brasil--big.svg',
  PETR4:  'https://s3-symbol-logo.tradingview.com/petrobras--big.svg',
  VALE3:  'https://s3-symbol-logo.tradingview.com/vale--big.svg',
  ITUB4:  'https://s3-symbol-logo.tradingview.com/itau-unibanco--big.svg',
  WEGE3:  'https://s3-symbol-logo.tradingview.com/weg--big.svg',
  ABEV3:  'https://s3-symbol-logo.tradingview.com/ambev--big.svg',
  FLRY3:  'https://s3-symbol-logo.tradingview.com/fleury--big.svg',
  TAEE11: 'https://s3-symbol-logo.tradingview.com/taesa--big.svg',
  CSAN3:  'https://s3-symbol-logo.tradingview.com/cosan--big.svg',
};

export const PILLAR_LABELS: Record<string, string> = {
  growth:          'Crescimento',
  profitability:   'Rentabilidade',
  dividends:       'Proventos',
  debt:            'Dívida',
  cash:            'Caixa',
  valuation:       'Valuation',
  business:        'Negócio',
};

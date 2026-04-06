import {
  WEEK_DAY_LABELS,
  MONTH_NAMES,
  MONTH_NAMES_SHORT,
} from '../constants/agenda.constants';
import type { AgendaEvent } from '../interfaces/agenda.interfaces';

// ─── Helpers de data ───────────────────────────────────────────────────────────

/** Retorna a data de hoje no formato YYYY-MM-DD sem problemas de timezone. */
export function todayString(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/** Converte YYYY-MM-DD → Date local (sem problemas de timezone). */
export function parseDateLocal(dateStr: string): Date {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day);
}

/** Formata Date → DD/MM/YYYY */
export function formatDateShort(date: Date): string {
  const d = String(date.getDate()).padStart(2, '0');
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const y = date.getFullYear();
  return `${d}/${m}/${y}`;
}

/** Formata Date → "Qui, 24 de Abr de 2026" */
export function formatDateLong(date: Date): string {
  const dayAbbr = WEEK_DAY_LABELS[date.getDay()];
  const dayNum  = date.getDate();
  const month   = MONTH_NAMES_SHORT[date.getMonth()];
  const year    = date.getFullYear();
  return `${dayAbbr}, ${dayNum} de ${month} de ${year}`;
}

/** Verifica se duas Dates são o mesmo dia. */
export function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth()    === b.getMonth()    &&
    a.getDate()     === b.getDate()
  );
}

/** Verifica se a date é hoje. */
export function isToday(date: Date): boolean {
  return isSameDay(date, new Date());
}

/** Retorna o Domingo da semana à qual `date` pertence. */
export function getWeekStart(date: Date): Date {
  const d = new Date(date);
  d.setDate(d.getDate() - d.getDay()); // subtrai o número do dia da semana (0=Dom)
  d.setHours(0, 0, 0, 0);
  return d;
}

/** Retorna os 7 dias da semana começando em `weekStart` (Domingo). */
export function getWeekDates(weekStart: Date): Date[] {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + i);
    return d;
  });
}

/** Retorna o 1° dia do mês. */
export function getMonthStart(year: number, month: number): Date {
  return new Date(year, month, 1);
}

/**
 * Retorna as semanas do mês no formato de grid (6 linhas × 7 colunas).
 * Células fora do mês são `null`.
 */
export function getMonthGrid(year: number, month: number): Array<Array<Date | null>> {
  const firstDay    = new Date(year, month, 1).getDay(); // 0-6 (Dom-Sáb)
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells: Array<Date | null> = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => new Date(year, month, i + 1)),
  ];

  // Completa até múltiplo de 7
  while (cells.length % 7 !== 0) cells.push(null);

  // Divide em semanas
  const weeks: Array<Array<Date | null>> = [];
  for (let i = 0; i < cells.length; i += 7) {
    weeks.push(cells.slice(i, i + 7));
  }
  return weeks;
}

/** Retorna os eventos de um determinado dia. */
export function getEventsForDate(events: AgendaEvent[], date: Date): AgendaEvent[] {
  const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  return events.filter((e) => e.date === dateStr);
}

/** Calcula quantos dias faltam para a data (negativo se já passou). */
export function daysUntil(dateStr: string): number {
  const today    = new Date();
  today.setHours(0, 0, 0, 0);
  const target   = parseDateLocal(dateStr);
  const diffMs   = target.getTime() - today.getTime();
  return Math.round(diffMs / (1000 * 60 * 60 * 24));
}

// ─── Formatação de range ───────────────────────────────────────────────────────

/**
 * Formata o range da semana: "30 mar — 5 abr / 2026"
 * Se tudo no mesmo mês: "6 — 12 abr / 2026"
 */
export function formatWeekRange(start: Date, end: Date): string {
  const startDay   = start.getDate();
  const endDay     = end.getDate();
  const startMonth = MONTH_NAMES_SHORT[start.getMonth()].toLowerCase();
  const endMonth   = MONTH_NAMES_SHORT[end.getMonth()].toLowerCase();
  const year       = end.getFullYear();

  if (start.getMonth() === end.getMonth() && start.getFullYear() === end.getFullYear()) {
    return `${startDay} — ${endDay} ${endMonth} / ${year}`;
  }
  return `${startDay} ${startMonth} — ${endDay} ${endMonth} / ${year}`;
}

/** Formata header do mês: "Abril / 2026" */
export function formatMonthHeader(year: number, month: number): string {
  return `${MONTH_NAMES[month]} / ${year}`;
}

// ─── Contador de dias ──────────────────────────────────────────────────────────

/** Texto humanizado do countdown: "Hoje", "Amanhã", "Em 5 dias", "Há 3 dias" */
export function formatCountdown(dateStr: string): string {
  const days = daysUntil(dateStr);
  if (days === 0)  return 'Hoje';
  if (days === 1)  return 'Amanhã';
  if (days === -1) return 'Ontem';
  if (days > 1)    return `Em ${days} dias`;
  return `Há ${Math.abs(days)} dias`;
}

// ─── Valor formatado ───────────────────────────────────────────────────────────

/** Formata valor numérico + unidade para exibição. */
export function formatEventValue(value: number | null, unit: string | null): string | null {
  if (value === null) return null;
  const formatted = value.toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 4,
  });
  if (unit === 'BRL/ação') return `R$ ${formatted} / ação`;
  if (unit === '%')        return `${formatted}%`;
  if (unit)                return `${formatted} ${unit}`;
  return `R$ ${formatted}`;
}

import type { AgendaEventDTO, AgendaGroupDTO, AgendaEvent, AgendaEventType } from '../interfaces/agenda.interfaces';
import {
  parseDateLocal,
  formatDateShort,
  formatDateLong,
  daysUntil,
  isToday,
} from '../utils/agenda.utils';

/**
 * Mapeia o tipo bruto do pipeline para o tipo de evento do frontend.
 * Tipos do pipeline: reports, provent_payment, provents, meetings, ipo,
 *                   conference_call, jcp, ex_date
 */
function mapEventType(raw: string): AgendaEventType {
  switch (raw) {
    case 'report':          return 'balanco';
    case 'provent_payment': return 'dividendo';
    case 'provent':         return 'ex_dividendo';
    case 'jcp':             return 'jcp';
    case 'meeting':         return 'fato_relevante';
    case 'manual':          return 'fato_relevante';
    case 'conference_call': return 'conference_call';
    case 'ipo':             return 'subscricao';
    default:                return 'fato_relevante';
  }
}

/**
 * Transforma um AgendaEventDTO (formato da API) em AgendaEvent (formato de UI).
 */
export function mapAgendaEvent(dto: AgendaEventDTO): AgendaEvent {
  const date  = parseDateLocal(dto.date);
  const days  = daysUntil(dto.date);

  return {
    id:               dto.id,
    ticker:           dto.ticker,
    companyName:      dto.ticker, // backend não retorna companyName; usa ticker como fallback
    logoUrl:          null,
    eventType:        mapEventType(dto.eventType),
    title:            dto.title,
    date:             dto.date,
    formattedDate:    formatDateShort(date),
    formattedDateLong: formatDateLong(date),
    description:      dto.description,
    value:            null,
    formattedValue:   null,
    pillar:           null,
    sourceLabel:      dto.eventTypeLabel ?? null,
    sourceUrl:        dto.sourceUrl,
    severity:         (dto.severity as AgendaEvent['severity']) ?? 'low',
    isPast:           days < 0,
    isToday:          isToday(date),
    daysUntil:        days < 0 ? null : days,
  };
}

/**
 * Mapeia os grupos retornados pelo backend para uma lista plana de AgendaEvent.
 * Preserva a ordem cronológica (grupos já chegam ordenados pelo backend).
 *
 * Gera id e date de fallback caso o backend ainda não os retorne,
 * garantindo que o id seja sempre uma string única e não-nula.
 */
export function mapAgendaFromGroups(groups: AgendaGroupDTO[]): AgendaEvent[] {
  return groups.flatMap((group) =>
    group.events.map((dto, index) => {
      const date = dto.date || group.date;
      const id   = dto.id  || `${date}-${dto.ticker}-${dto.eventType}-${index}`;
      return mapAgendaEvent({ ...dto, id, date });
    })
  );
}

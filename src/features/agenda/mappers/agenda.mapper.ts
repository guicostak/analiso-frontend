import type { AgendaEventDTO, AgendaEvent } from '../interfaces/agenda.interfaces';
import {
  parseDateLocal,
  formatDateShort,
  formatDateLong,
  formatEventValue,
  daysUntil,
  isToday,
} from '../utils/agenda.utils';

/**
 * Transforma um AgendaEventDTO (formato da API) em AgendaEvent (formato de UI).
 * Toda a derivação de campos computados acontece aqui — nunca nos componentes.
 */
export function mapAgendaEvent(dto: AgendaEventDTO): AgendaEvent {
  const date          = parseDateLocal(dto.date);
  const days          = daysUntil(dto.date);
  const formattedVal  = formatEventValue(dto.value, dto.valueUnit);

  return {
    id:              dto.id,
    ticker:          dto.ticker,
    companyName:     dto.companyName,
    logoUrl:         dto.logoUrl,
    eventType:       dto.eventType,
    title:           dto.title,
    date:            dto.date,
    formattedDate:   formatDateShort(date),
    formattedDateLong: formatDateLong(date),
    description:     dto.description,
    value:           dto.value,
    formattedValue:  formattedVal,
    pillar:          dto.pillar,
    sourceLabel:     dto.sourceLabel,
    sourceUrl:       dto.sourceUrl,
    severity:        dto.severity,
    isPast:          days < 0,
    isToday:         isToday(date),
    daysUntil:       days < 0 ? null : days,
  };
}

/** Mapeia um array de DTOs. */
export function mapAgendaEvents(dtos: AgendaEventDTO[]): AgendaEvent[] {
  return dtos
    .map(mapAgendaEvent)
    .sort((a, b) => a.date.localeCompare(b.date)); // ordena por data
}

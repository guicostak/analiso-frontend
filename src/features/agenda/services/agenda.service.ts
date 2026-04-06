import { apiFetch } from '@/src/lib/api';
import type { AgendaDTO } from '../interfaces/agenda.interfaces';

/**
 * Busca a agenda do usuário autenticado.
 *
 * O backend retorna eventos das empresas da watchlist do usuário,
 * agrupados por data, para o intervalo informado.
 *
 * Padrão do backend: dateFrom = hoje, dateTo = hoje + 90 dias.
 */
export async function getAgenda(token?: string | null): Promise<AgendaDTO> {
  const today = new Date();
  const future = new Date(today);
  future.setDate(today.getDate() + 90);

  const dateFrom = today.toISOString().slice(0, 10);
  const dateTo   = future.toISOString().slice(0, 10);

  return apiFetch<AgendaDTO>(
    `/api/agenda?dateFrom=${dateFrom}&dateTo=${dateTo}`,
    {},
    token,
  );
}

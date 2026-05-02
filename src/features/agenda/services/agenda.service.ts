import { apiFetch } from '@/src/lib/api';
import { cacheable } from '@/src/lib/request-cache';
import type { AgendaDTO } from '../interfaces/agenda.interfaces';

/**
 * Busca a agenda do usuário autenticado.
 *
 * O backend retorna eventos das empresas da watchlist do usuário,
 * agrupados por data, para o intervalo informado.
 *
 * Padrão do backend: dateFrom = hoje, dateTo = hoje + 90 dias.
 *
 * Wrapper em `cacheable` deduplica entre o prefetch do dashboard e a
 * página /agenda — quando ambos rodam na mesma sessão de browser, é
 * 1 request única. TTL de 90s mantém freshness razoável.
 */
export async function getAgenda(token?: string | null): Promise<AgendaDTO> {
  const today = new Date();
  const future = new Date(today);
  future.setDate(today.getDate() + 90);

  const dateFrom = today.toISOString().slice(0, 10);
  const dateTo   = future.toISOString().slice(0, 10);

  return cacheable(
    `agenda:${dateFrom}:${dateTo}`,
    () => apiFetch<AgendaDTO>(
      `/api/agenda?dateFrom=${dateFrom}&dateTo=${dateTo}`,
      {},
      token,
    ),
  );
}

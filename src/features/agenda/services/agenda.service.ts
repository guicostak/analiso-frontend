import { apiFetch } from '@/src/lib/api';
import { cacheable } from '@/src/lib/request-cache';
import type { AgendaDTO } from '../interfaces/agenda.interfaces';

/**
 * Janela de eventos buscada de uma vez. Inclui passado e futuro pra que
 * a navegação semana-a-semana / mês-a-mês funcione sem re-fetch quando
 * o usuário volta no tempo.
 *
 * **Por que esses números:**
 *   - 90 dias passados: cobre ~1 trimestre — usuário revisita proventos
 *     pagos recentes, datas-ex, assembleias do tri anterior.
 *   - 180 dias futuros: ~6 meses — agenda de proventos declarados com
 *     antecedência (alguns bancos publicam JCP até 6m à frente).
 *
 * Total ~270 dias, payload típico 50-150KB (eventos ~150B × N × tickers).
 *
 * Pra ajustar: edite só essas constantes — o backend aceita qualquer
 * range via query string.
 */
const DAYS_BACK = 90;
const DAYS_FORWARD = 180;

/**
 * Busca a agenda do usuário autenticado.
 *
 * O backend retorna eventos das empresas da watchlist do usuário,
 * agrupados por data, para o intervalo informado.
 *
 * Wrapper em `cacheable` deduplica entre o prefetch do dashboard e a
 * página /agenda — quando ambos rodam na mesma sessão de browser, é
 * 1 request única. TTL de 90s mantém freshness razoável.
 */
export async function getAgenda(token?: string | null): Promise<AgendaDTO> {
  const today = new Date();
  const past = new Date(today);
  past.setDate(today.getDate() - DAYS_BACK);
  const future = new Date(today);
  future.setDate(today.getDate() + DAYS_FORWARD);

  const dateFrom = past.toISOString().slice(0, 10);
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

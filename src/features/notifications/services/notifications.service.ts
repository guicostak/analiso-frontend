/**
 * notifications.service
 *
 * Camada de HTTP para notificações do usuário.
 * Atualmente retorna dados mockados — para integrar, descomente os blocos
 * marcados com "TODO: integrar" e remova o bloco de mock.
 *
 * Segue architecture_skill.md: zero lógica de negócio, apenas I/O.
 */

import type { Notification, NotificationsResponse } from "../interfaces";

// TODO: integrar — usar env var quando o backend estiver pronto
// const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";

// ─── Mock ────────────────────────────────────────────────────────────────────

function ago(minutes: number): string {
  return new Date(Date.now() - minutes * 60 * 1000).toISOString();
}

const MOCK_ITEMS: Notification[] = [
  {
    id:        "n1",
    type:      "alerta",
    title:     "MGLU3 mudou para Risco",
    body:      "A empresa entrou em estado de atenção elevada. Confira os pilares impactados.",
    ticker:    "MGLU3",
    timestamp: ago(12),
    read:      false,
  },
  {
    id:        "n2",
    type:      "alerta",
    title:     "VALE3 mudou para Atenção",
    body:      "Dívida/EBITDA acima do limite histórico. Pilar Dívida com sinal de pressão.",
    ticker:    "VALE3",
    timestamp: ago(47),
    read:      false,
  },
  {
    id:        "n3",
    type:      "agenda",
    title:     "Resultado ITUB4 amanhã",
    body:      "Divulgação do 4T24 prevista para amanhã às 18h. Prepare sua análise.",
    ticker:    "ITUB4",
    timestamp: ago(120),
    read:      false,
  },
  {
    id:        "n4",
    type:      "atualizacao",
    title:     "WEGE3 atualizado",
    body:      "Novos dados de margens e retorno disponíveis. Pilar em destaque: Retorno.",
    ticker:    "WEGE3",
    timestamp: ago(300),
    read:      false,
  },
  {
    id:        "n5",
    type:      "atualizacao",
    title:     "PETR4 atualizado",
    body:      "Métricas do último trimestre incorporadas. P/L e EV/EBITDA revisados.",
    ticker:    "PETR4",
    timestamp: ago(720),
    read:      true,
  },
  {
    id:        "n6",
    type:      "sistema",
    title:     "Filtros avançados disponíveis",
    body:      "Agora você pode filtrar empresas por P/L, ROE, ROIC e mais na busca.",
    timestamp: ago(1440),
    read:      true,
  },
];

// ─── Service ─────────────────────────────────────────────────────────────────

export const notificationsService = {
  async getNotifications(
    _token: string | null,
  ): Promise<NotificationsResponse> {
    // TODO: integrar
    // const res = await fetch(`${BASE_URL}/api/notifications`, {
    //   headers: _token ? { Authorization: `Bearer ${_token}` } : {},
    // });
    // if (!res.ok) throw new Error("Erro ao buscar notificações");
    // return res.json() as Promise<NotificationsResponse>;

    await new Promise((r) => setTimeout(r, 350)); // simula latência
    return {
      items:       MOCK_ITEMS,
      unreadCount: MOCK_ITEMS.filter((n) => !n.read).length,
    };
  },

  async markAsRead(
    _token: string | null,
    _id: string,
  ): Promise<void> {
    // TODO: integrar
    // await fetch(`${BASE_URL}/api/notifications/${_id}/read`, {
    //   method: "PATCH",
    //   headers: _token ? { Authorization: `Bearer ${_token}` } : {},
    // });

    await new Promise((r) => setTimeout(r, 80));
  },

  async markAllAsRead(
    _token: string | null,
  ): Promise<void> {
    // TODO: integrar
    // await fetch(`${BASE_URL}/api/notifications/read-all`, {
    //   method: "PATCH",
    //   headers: _token ? { Authorization: `Bearer ${_token}` } : {},
    // });

    await new Promise((r) => setTimeout(r, 80));
  },
};

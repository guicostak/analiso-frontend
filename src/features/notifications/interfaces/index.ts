// ─── Tipos ────────────────────────────────────────────────────────────────────

/**
 * Categorias de notificação visíveis ao usuário.
 *
 * Toda notificação é tratada como "alerta" do usuário, agrupada por contexto:
 *   - noticias              : notícias relacionadas a empresas/setores
 *   - contexto_mercado      : contexto macroeconômico, ciclos, índices
 *   - movimentacoes_mercado : variações relevantes de preço/volume
 *
 * Backend: coluna `category` em analiso.notifications (CHECK constraint).
 */
export type NotificationCategory =
  | "noticias"
  | "contexto_mercado"
  | "movimentacoes_mercado";

export interface Notification {
  id:        number;
  category:  NotificationCategory | null;
  title:     string;
  body:      string;
  ticker?:   string | null;
  timestamp: string; // ISO 8601
  read:      boolean;
}

export interface NotificationsResponse {
  items:       Notification[];
  unreadCount: number;
}

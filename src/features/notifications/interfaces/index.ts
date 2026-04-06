// ─── Tipos ────────────────────────────────────────────────────────────────────

export type NotificationType = "alerta" | "atualizacao" | "agenda" | "sistema";

export interface Notification {
  id:        number;
  type:      NotificationType;
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

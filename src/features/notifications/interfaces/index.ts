// ─── Tipos ────────────────────────────────────────────────────────────────────

export type NotificationType = "alerta" | "atualizacao" | "agenda" | "sistema";

export interface Notification {
  id:        string;
  type:      NotificationType;
  title:     string;
  body:      string;
  ticker?:   string;
  timestamp: string; // ISO 8601
  read:      boolean;
}

export interface NotificationsResponse {
  items:       Notification[];
  unreadCount: number;
}

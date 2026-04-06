/**
 * notifications.service
 *
 * Camada de HTTP para notificações do usuário.
 * Segue architecture_skill.md: zero lógica de negócio, apenas I/O.
 */

import { API_BASE_URL } from "@/src/lib/api-base";
import { apiFetch } from "@/src/lib/api";
import type { NotificationsResponse } from "../interfaces";

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** PATCH que retorna 204 No Content — não tenta parsear JSON. */
async function patchVoid(path: string, token: string | null): Promise<void> {
  const headers: Record<string, string> = {};
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE_URL}${path}`, { method: "PATCH", headers });
  if (!res.ok) throw new Error(`PATCH ${path} failed: ${res.status}`);
}

// ─── Service ─────────────────────────────────────────────────────────────────

export const notificationsService = {
  async getNotifications(
    token: string | null,
  ): Promise<NotificationsResponse> {
    return apiFetch<NotificationsResponse>("/api/me/notifications", {}, token);
  },

  async markAsRead(
    token: string | null,
    id: number,
  ): Promise<void> {
    await patchVoid(`/api/me/notifications/${id}/read`, token);
  },

  async markAllAsRead(
    token: string | null,
  ): Promise<void> {
    await patchVoid("/api/me/notifications/read-all", token);
  },
};

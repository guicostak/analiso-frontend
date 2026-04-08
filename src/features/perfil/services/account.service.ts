/**
 * account.service
 *
 * Camada HTTP para operações de conta do usuário autenticado.
 */

import { API_BASE_URL } from "@/src/lib/api-base";
import { ApiError } from "@/src/lib/api";

export interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
}

export const accountService = {
  /** PUT /api/me/password — 204 No Content em sucesso. */
  async changePassword(payload: ChangePasswordPayload, token: string | null): Promise<void> {
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (token) headers["Authorization"] = `Bearer ${token}`;

    const res = await fetch(`${API_BASE_URL}/api/me/password`, {
      method: "PUT",
      headers,
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      let code = "unknown_error";
      try {
        const body = (await res.json()) as { code?: string };
        code = body.code ?? code;
      } catch {
        // ignore
      }
      throw new ApiError(res.status, code, `PUT /api/me/password failed: ${res.status}`);
    }
  },
};

/**
 * Service de pesquisas salvas.
 * Consome os endpoints do backend:
 *   GET    /api/me/saved-searches
 *   POST   /api/me/saved-searches   { name, filters }
 *   DELETE /api/me/saved-searches/:id
 *
 * Segue architecture_skill.md: chamadas HTTP isoladas em services/.
 */

import type { SavedSearch } from "../interfaces";
import { API_BASE_URL as API_BASE } from "@/src/lib/api-base";

function authHeaders(): HeadersInit {
  const token = typeof window !== "undefined" ? localStorage.getItem("analiso_token") : null;
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export const savedSearchesService = {
  async list(): Promise<SavedSearch[]> {
    const res = await fetch(`${API_BASE}/api/me/saved-searches`, {
      headers: authHeaders(),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  },

  async create(name: string, filters: string): Promise<SavedSearch> {
    const res = await fetch(`${API_BASE}/api/me/saved-searches`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify({ name, filters }),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  },

  async remove(id: number): Promise<void> {
    const res = await fetch(`${API_BASE}/api/me/saved-searches/${id}`, {
      method: "DELETE",
      headers: authHeaders(),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
  },
};

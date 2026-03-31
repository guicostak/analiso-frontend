/**
 * Service de histórico de buscas.
 * Endpoints:
 *   GET    /api/me/search-history
 *   POST   /api/me/search-history   { query }
 *   DELETE /api/me/search-history/:id
 *   DELETE /api/me/search-history          (limpar tudo)
 */

import type { SearchHistoryItem } from "../interfaces";
import { API_BASE_URL as API_BASE } from "@/src/lib/api-base";

function authHeaders(): HeadersInit {
  const token = typeof window !== "undefined" ? localStorage.getItem("analiso_token") : null;
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export const searchHistoryService = {
  async list(): Promise<SearchHistoryItem[]> {
    const res = await fetch(`${API_BASE}/api/me/search-history`, {
      headers: authHeaders(),
    });
    if (!res.ok) return [];
    return res.json();
  },

  async add(query: string): Promise<SearchHistoryItem | null> {
    const res = await fetch(`${API_BASE}/api/me/search-history`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify({ query }),
    });
    if (!res.ok) return null;
    return res.json();
  },

  async remove(id: number): Promise<void> {
    await fetch(`${API_BASE}/api/me/search-history/${id}`, {
      method: "DELETE",
      headers: authHeaders(),
    });
  },

  async clearAll(): Promise<void> {
    await fetch(`${API_BASE}/api/me/search-history`, {
      method: "DELETE",
      headers: authHeaders(),
    });
  },
};

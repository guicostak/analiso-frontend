/**
 * Service de favoritos.
 * Consome os endpoints de watchlist do backend:
 *   GET    /api/me/watchlist
 *   POST   /api/me/watchlist       { ticker }
 *   DELETE /api/me/watchlist/:ticker
 *
 * Segue architecture_skill.md: chamadas HTTP isoladas em services/.
 */

import type { FavoriteItem } from "../interfaces";
import { API_BASE_URL as API_BASE } from "@/src/lib/api-base";

function authHeaders(): HeadersInit {
  const token = typeof window !== "undefined" ? localStorage.getItem("analiso_token") : null;
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export const favoritesService = {
  /** Lista todos os tickers favoritados do usuário. */
  async list(): Promise<FavoriteItem[]> {
    const res = await fetch(`${API_BASE}/api/me/watchlist`, {
      headers: authHeaders(),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  },

  /** Adiciona um ticker aos favoritos. */
  async add(ticker: string): Promise<void> {
    const res = await fetch(`${API_BASE}/api/me/watchlist`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify({ ticker }),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
  },

  /** Remove um ticker dos favoritos. */
  async remove(ticker: string): Promise<void> {
    const res = await fetch(`${API_BASE}/api/me/watchlist/${ticker}`, {
      method: "DELETE",
      headers: authHeaders(),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
  },
};

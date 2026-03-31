/**
 * Interfaces do módulo de favoritos.
 * Reutiliza os endpoints de watchlist do backend (/api/me/watchlist).
 */

export interface FavoriteItem {
  ticker: string;
  createdAt: string; // ISO-8601
}

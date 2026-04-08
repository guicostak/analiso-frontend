/**
 * watchlist-signals.service
 *
 * Stub do service que servirá a ilha de "Sinais da watchlist".
 */

export interface WatchlistSignal {
  ticker: string;
  signal: string;
  raisedAt: string;
}

export async function getSignals(): Promise<WatchlistSignal[]> {
  return [];
}

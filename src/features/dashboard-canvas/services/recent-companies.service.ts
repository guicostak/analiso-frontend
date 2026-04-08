/**
 * recent-companies.service
 *
 * Histórico das últimas empresas visitadas pelo usuário. Persistido em
 * `localStorage` (escopo do dispositivo) para alimentar a ilha
 * `EmpresasRecentesIsland` — fonte secundária ao backend.
 *
 * O backend continua sendo a fonte canônica; este store local existe para
 * (1) permitir trabalho offline e (2) pré-popular a ilha enquanto o backend
 * de tracking não está disponível.
 */

const STORAGE_KEY = "analiso:recent-companies:v1";
const MAX_ENTRIES = 12;

export interface RecentCompany {
  ticker: string;
  visitedAt: string;
}

function safeRead(): RecentCompany[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((item): item is RecentCompany =>
        Boolean(item) &&
        typeof item === "object" &&
        typeof (item as RecentCompany).ticker === "string" &&
        typeof (item as RecentCompany).visitedAt === "string",
      )
      .map((item) => ({ ticker: item.ticker.toUpperCase(), visitedAt: item.visitedAt }));
  } catch {
    return [];
  }
}

function safeWrite(items: RecentCompany[]): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    // quota / privacy mode — silencioso
  }
}

export async function getRecent(): Promise<RecentCompany[]> {
  return safeRead();
}

export async function trackVisit(ticker: string): Promise<void> {
  const normalized = (ticker ?? "").trim().toUpperCase();
  if (!normalized) return;
  const existing = safeRead().filter((item) => item.ticker !== normalized);
  const next: RecentCompany[] = [
    { ticker: normalized, visitedAt: new Date().toISOString() },
    ...existing,
  ].slice(0, MAX_ENTRIES);
  safeWrite(next);
}

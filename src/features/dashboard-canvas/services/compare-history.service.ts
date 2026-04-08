/**
 * compare-history.service
 *
 * Histórico de comparações criadas pelo usuário. Persistido em `localStorage`
 * para alimentar a ilha `ComparacoesRecentesIsland`. Mesmo racional do
 * `recent-companies.service`: store local até o backend de tracking estar
 * disponível.
 */

const STORAGE_KEY = "analiso:compare-history:v1";
const MAX_ENTRIES = 12;

export interface CompareHistoryEntry {
  id: string;
  tickers: string[];
  createdAt: string;
}

function safeRead(): CompareHistoryEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((item): item is CompareHistoryEntry =>
      Boolean(item) &&
      typeof item === "object" &&
      typeof (item as CompareHistoryEntry).id === "string" &&
      Array.isArray((item as CompareHistoryEntry).tickers) &&
      typeof (item as CompareHistoryEntry).createdAt === "string",
    );
  } catch {
    return [];
  }
}

function safeWrite(items: CompareHistoryEntry[]): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    // silencioso
  }
}

function makeId(tickers: string[]): string {
  return [...tickers].sort().join("-").toLowerCase();
}

export async function getHistory(): Promise<CompareHistoryEntry[]> {
  return safeRead();
}

export async function track(
  entry: Omit<CompareHistoryEntry, "id" | "createdAt">,
): Promise<void> {
  const tickers = (entry.tickers ?? [])
    .map((t) => (t ?? "").trim().toUpperCase())
    .filter(Boolean);
  if (tickers.length < 2) return;

  const id = makeId(tickers);
  const existing = safeRead().filter((item) => item.id !== id);
  const next: CompareHistoryEntry[] = [
    { id, tickers, createdAt: new Date().toISOString() },
    ...existing,
  ].slice(0, MAX_ENTRIES);
  safeWrite(next);
}

export async function deleteEntry(id: string): Promise<void> {
  const next = safeRead().filter((item) => item.id !== id);
  safeWrite(next);
}

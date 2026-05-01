/**
 * News-read service.
 *
 * Persistência server-side de "já visto" pra notícias. Substitui o
 * tracking puramente localStorage do `useReadNews` original — agora
 * sincroniza entre devices.
 *
 * Endpoints:
 *   GET  /api/news/read       → lista de URLs já lidas pelo usuário
 *   POST /api/news/read       → marca uma URL como lida (idempotente)
 *
 * Ambos exigem JWT. Auth é gerenciado pelo `apiFetch` (lê do session-store).
 */

import { apiFetch } from "@/src/lib/api";

/** GET /api/news/read — retorna todas as URLs lidas pelo usuário. */
export async function getReadNews(): Promise<string[]> {
  return apiFetch<string[]>("/api/news/read", { method: "GET" });
}

/** POST /api/news/read — marca uma notícia como lida (server-side). */
export async function markNewsAsRead(url: string): Promise<void> {
  await apiFetch<void>("/api/news/read", {
    method: "POST",
    body: JSON.stringify({ url }),
  });
}

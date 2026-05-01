/**
 * request-cache
 *
 * Cache module-scoped de Promises identificadas por chave string. Resolve
 * dois problemas:
 *
 *   1. **In-flight dedup**: chamadas simultâneas pra mesma chave retornam
 *      a MESMA Promise. Útil quando várias ilhas do dashboard pedem o
 *      mesmo dado — só uma request bate o backend.
 *
 *   2. **Short-TTL cache**: o resultado fica disponível por `ttlMs` (default
 *      90s). Dentro dessa janela, novos consumidores recebem o valor
 *      resolvido imediatamente (sem nova request).
 *
 * O TTL curto é proposital: bate com o uso típico de "carrega dashboard,
 * navega entre ilhas, talvez F5 imediato". Não substitui um SWR/React Query
 * — é um shim leve pra eliminar fetches duplicados durante a montagem.
 *
 * **Quando uma promise REJEITA**, ela é removida do cache imediatamente —
 * próximos callers vão tentar de novo (sem perpetuar erro transitório).
 *
 * **Não persiste** entre reloads. Sem storage, sem memory leak (Map em
 * módulo permanece pelo lifetime da aba — aceitável).
 */

interface CacheEntry<T> {
  promise: Promise<T>;
  expiresAt: number;
}

const DEFAULT_TTL_MS = 90_000; // 1m30s — cobre loading screen + mount inicial

const cache = new Map<string, CacheEntry<unknown>>();

export function cacheable<T>(
  key: string,
  factory: () => Promise<T>,
  ttlMs: number = DEFAULT_TTL_MS,
): Promise<T> {
  const now = Date.now();
  const existing = cache.get(key) as CacheEntry<T> | undefined;
  if (existing && existing.expiresAt > now) {
    return existing.promise;
  }

  // Cria nova entry. O `.catch` desativa a entry em caso de erro pra
  // próxima chamada poder tentar de novo, mas re-lança pro caller.
  const promise = factory().catch((err) => {
    if (cache.get(key)?.promise === promise) {
      cache.delete(key);
    }
    throw err;
  });

  cache.set(key, { promise, expiresAt: now + ttlMs });
  return promise;
}

/** Remove uma entry específica (ex: após mutação que invalida o dado). */
export function invalidate(key: string): void {
  cache.delete(key);
}

/** Limpa todo o cache. Útil em logout pra evitar leak de dados entre sessões. */
export function invalidateAll(): void {
  cache.clear();
}

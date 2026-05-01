"use client";

/**
 * useReadNews
 *
 * Rastreia quais notícias o usuário já clicou/visualizou.
 *
 * **Storage strategy (defense in depth):**
 *   1. **Backend** (`/api/news/read`) — fonte da verdade. Sincroniza entre
 *      devices. Lê no PC → aparece como lida no celular.
 *   2. **localStorage** (`analiso:read-news:v1`) — cache local pra render
 *      instantâneo no mount (sem flicker enquanto o GET roda) e fallback
 *      offline/no-token.
 *
 * **Fluxo:**
 *   - Mount: hidrata com localStorage (instant). Em paralelo, GET ao backend
 *     pra mergear URLs do server (caso usuário tenha lido em outro device).
 *   - markAsRead: optimistic update local + POST fire-and-forget. Se o POST
 *     falhar silenciosamente, o estado local fica consistente (próxima
 *     sessão re-tenta sync via GET).
 *
 * **Cap de tamanho:** mantém só os últimos `MAX_TRACKED` URLs no localStorage
 * pra evitar crescimento ilimitado. Backend não tem cap (~5M rows/ano nem é
 * perto de problema).
 */

import { useCallback, useEffect, useMemo, useRef } from "react";

import { useLocalStorageState } from "@/src/hooks";
import { useAuth } from "@/src/features/auth";
import { getReadNews, markNewsAsRead } from "@/src/features/news-read/services";

const STORAGE_KEY = "analiso:read-news:v1";
const MAX_TRACKED = 500;

export interface UseReadNewsReturn {
  /** True se a URL já foi marcada como visualizada. */
  isRead: (url: string) => boolean;
  /** Marca uma URL como visualizada. Idempotente. */
  markAsRead: (url: string) => void;
}

export function useReadNews(): UseReadNewsReturn {
  // Persiste como ARRAY no localStorage (Set não serializa em JSON).
  // No render, derivamos um Set pra lookup O(1).
  const [readUrls, setReadUrls] = useLocalStorageState<string[]>(
    STORAGE_KEY,
    [],
  );
  const { token } = useAuth();

  // Hidrata do servidor no mount (best-effort). URLs vindas do servidor são
  // mergeadas com as locais — se uma URL existe só no server, é adicionada
  // localmente (e vice-versa, embora a sync inversa só rola via POST).
  //
  // `hydratedRef` previne re-execução em re-renders (a deps `[token]`
  // já cobre a maior parte, mas defensive guard em caso de logout/login).
  const hydratedRef = useRef(false);
  useEffect(() => {
    if (!token) {
      hydratedRef.current = false;
      return;
    }
    if (hydratedRef.current) return;
    hydratedRef.current = true;

    let cancelled = false;
    getReadNews()
      .then((serverUrls) => {
        if (cancelled) return;
        setReadUrls((local) => {
          // Merge: server ∪ local. Cap respeitado mantendo os MAIS RECENTES
          // (assumindo que local tá em ordem de inserção; URLs do server vão
          // pro fim — não temos timestamp, então isso é heurística).
          const merged = new Set<string>(local);
          for (const u of serverUrls) merged.add(u);
          const arr = Array.from(merged);
          return arr.length > MAX_TRACKED ? arr.slice(arr.length - MAX_TRACKED) : arr;
        });
      })
      .catch(() => {
        // Silencia — UX local continua funcionando mesmo sem sync.
        // Reset do guard pra próxima oportunidade (ex: token refresh).
        hydratedRef.current = false;
      });

    return () => { cancelled = true; };
  }, [token, setReadUrls]);

  const readSet = useMemo(() => new Set(readUrls), [readUrls]);

  const isRead = useCallback(
    (url: string) => readSet.has(url),
    [readSet],
  );

  const markAsRead = useCallback(
    (url: string) => {
      if (!url) return;
      // Optimistic local update — UX não espera o roundtrip.
      setReadUrls((prev) => {
        if (prev.includes(url)) return prev; // idempotente
        const next = [...prev, url];
        if (next.length > MAX_TRACKED) {
          return next.slice(next.length - MAX_TRACKED);
        }
        return next;
      });

      // Fire-and-forget pro backend. Sem token, fica só local — graceful
      // degradation pra anônimo/expirado. Erros silenciados (a próxima
      // sessão hidrata via GET de qualquer jeito).
      if (token) {
        markNewsAsRead(url).catch(() => { /* silencioso */ });
      }
    },
    [setReadUrls, token],
  );

  return { isRead, markAsRead };
}

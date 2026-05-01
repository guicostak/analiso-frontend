"use client";

/**
 * useDashboardPrefetch
 *
 * Dispara em PARALELO todas as chamadas de rede que as ilhas do dashboard
 * vão precisar, durante a tela de loading. Quando todas resolvem (ou falham),
 * marca `prefetched = true` — o `DashboardPage` usa esse flag pra fechar a
 * loading screen apenas quando os dados estão prontos.
 *
 * **Por que vale a pena:** sem prefetch, cada ilha só dispara seu fetch
 * quando entra em viewport (`useInViewLazyFetch`). Resultado típico: usuário
 * vê dashboard com várias skeletons piscando enquanto cada ilha busca seu
 * dado individualmente. Com prefetch, tudo chega quase junto.
 *
 * **Como as ilhas reaproveitam:** os services (getMarketNews, getExplore,
 * getWatchlistPerformance) são wrappers em `cacheable` (ver
 * `src/lib/request-cache.ts`). Quando a ilha chama o service, ela hita o
 * cache populado pelo prefetch — sem nova request. As ilhas continuam com
 * `useInViewLazyFetch` intacto; só fica ~instantâneo.
 *
 * **Falhas:** usamos `Promise.allSettled` — uma falha individual NÃO bloqueia
 * a transição pra dashboard. As ilhas que falharam mostram seus próprios
 * empty states, e o usuário pode interagir com o resto.
 *
 * **Auth-aware:** chamadas que precisam de token (`getWatchlistPerformance`,
 * `getReadNews`) só rodam quando há token. As públicas (`getExplore`,
 * `getMarketNews`) sempre rodam.
 */

import { useEffect, useState } from "react";

import { useAuth } from "@/src/features/auth";
import { getMarketNews, getExplore } from "@/src/features/explore/services";
import { getWatchlistPerformance } from "@/src/features/watchlist/services";
import { getReadNews } from "@/src/features/news-read/services";

export interface UseDashboardPrefetchReturn {
  /** True quando TODAS as chamadas em paralelo terminaram (ok ou erro). */
  prefetched: boolean;
}

export function useDashboardPrefetch(): UseDashboardPrefetchReturn {
  const { token } = useAuth();
  const [prefetched, setPrefetched] = useState(false);

  useEffect(() => {
    let cancelled = false;

    // Lista de promises a aguardar. Cada chamada é envolvida pelo seu
    // service, que já usa `cacheable` — então qualquer chamada subsequente
    // (de uma ilha entrando em viewport) reaproveita o resultado.
    const tasks: Promise<unknown>[] = [
      getMarketNews(50),
      getExplore(),
    ];

    // Auth-gated: só dispara se houver token (caso contrário, 401 garantido).
    if (token) {
      tasks.push(getWatchlistPerformance("90d", token));
      tasks.push(getReadNews());
    }

    Promise.allSettled(tasks).finally(() => {
      if (!cancelled) setPrefetched(true);
    });

    return () => { cancelled = true; };
    // `token` muda na sessão login/logout; re-roda intencionalmente nesses
    // casos. Em renders normais, não muda → effect roda 1× só.
  }, [token]);

  return { prefetched };
}

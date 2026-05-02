"use client";

/**
 * useDashboardPrefetch
 *
 * Orquestra o carregamento do dashboard em **2 fases** durante a tela de
 * loading, esperando TUDO antes de fechar:
 *
 *   Fase 1 (paralelo, sem dependência):
 *     - getLayout(token) — descobre quais ilhas o usuário tem
 *     - getMarketNews, getExplore — dados de mercado (sempre úteis)
 *     - getReadNews — estado "já visto" pra news
 *
 *   Fase 2 (depois do layout chegar — depende dos kinds):
 *     - getWatchlistPerformance se tem `performance_vs_ibov`
 *     - getAgenda se tem `agenda`
 *     - getNotifications se tem `notificacoes`
 *     - **Pré-warm de chunks JS** das ilhas presentes (next/dynamic
 *       baixa em paralelo aos dados — quando a ilha renderiza, o JS
 *       já está disponível, sem flash de skeleton)
 *
 * Quando todas as fases settle (ok ou erro via `Promise.allSettled`),
 * marca `prefetched=true`. O `DashboardPage` espera por isso E pelo
 * `dashboardLoading=false` antes de transitar pro painel.
 *
 * **Por que 2 fases vs 1**: evita disparar agenda/notifications/perf
 * pra usuários que não têm essas ilhas no layout — economia real de
 * round-trips e payload (notif e agenda são >1MB combinados).
 *
 * **Pré-warm de chunks**: as ilhas viraram `next/dynamic` no registry.
 * Aqui chamamos `preload()` em cada uma — baixa o JS chunk sem montar
 * o componente. Tempo total da loading screen vira o `max(dados, JS)`,
 * não a soma. Network paralelo = ~free.
 */

import { useEffect, useState } from "react";

import { useAuth } from "@/src/features/auth";
import { getMarketNews, getExplore } from "@/src/features/explore/services";
import { getWatchlistPerformance } from "@/src/features/watchlist/services";
import { getReadNews } from "@/src/features/news-read/services";
import { getAgenda } from "@/src/features/agenda/services/agenda.service";
import { notificationsService } from "@/src/features/notifications/services/notifications.service";
import {
  getLayout,
  LayoutNotFoundError,
} from "@/src/features/dashboard-canvas/services/dashboard-layout.service";
import {
  islandRegistry,
  type IslandRegistryEntry,
} from "@/src/features/dashboard-canvas/registry/IslandRegistry";
import type { IslandKind } from "@/src/features/dashboard-canvas/interfaces/layout.types";

export interface UseDashboardPrefetchReturn {
  /** True quando TODAS as chamadas em paralelo terminaram (ok ou erro). */
  prefetched: boolean;
}

/**
 * Pré-baixa o chunk JS de uma ilha sem montar o componente. Usa o
 * `preload` exposto pelos componentes `next/dynamic` (não-bloqueante).
 *
 * Componentes não-dynamic (importados estaticamente) não têm `preload` —
 * o early-return cobre isso.
 */
function preloadIslandChunk(entry: IslandRegistryEntry): void {
  const comp = entry.component as { preload?: () => Promise<unknown> };
  if (typeof comp.preload === "function") {
    // Fire-and-forget. Erros de network no chunk são tratados pelo
    // próprio next/dynamic na hora do render real (com retry).
    comp.preload().catch(() => { /* silencioso */ });
  }
}

export function useDashboardPrefetch(): UseDashboardPrefetchReturn {
  const { token } = useAuth();
  const [prefetched, setPrefetched] = useState(false);

  useEffect(() => {
    let cancelled = false;

    // ── Fase 1: paralelo, sem dependência ───────────────────────────
    // Inclui o getLayout — assim que o useDashboardLayout monta logo
    // depois (dentro do DashboardCanvas), hita o cache em vez de fazer
    // segunda request. Pré-fetch e canvas mount competem por nada.
    const phase1Tasks: Array<Promise<unknown>> = [
      getMarketNews(50),
      getExplore(),
    ];

    if (token) {
      phase1Tasks.push(getReadNews().catch(() => null));
    }

    // Fetch de layout: pode 404 (usuário novo). Tratamos esse caso
    // como "no layout" — ainda assim o canvas vai criar default.
    const layoutPromise: Promise<{ kinds: Set<IslandKind> } | null> = token
      ? getLayout(token)
          .then((layout) => ({
            kinds: new Set(layout.items.map((it) => it.kind)),
          }))
          .catch((err) => {
            if (err instanceof LayoutNotFoundError) {
              // Layout default: todas as kinds defaults. O canvas vai
              // criar o default na hora — pré-warm baseado na lista
              // canônica reduz flash.
              return { kinds: new Set<IslandKind>() };
            }
            return null;
          })
      : Promise.resolve(null);

    phase1Tasks.push(layoutPromise);

    // ── Phase 2: depende do layout (kinds presentes) ────────────────
    // Resolve depois do phase1 → dispara fetches específicos das ilhas
    // realmente presentes no painel do usuário, mais pre-warm dos
    // chunks JS pra render instantâneo.
    const phase2Promise = layoutPromise.then((layoutInfo) => {
      const kinds = layoutInfo?.kinds ?? new Set<IslandKind>();
      const phase2Tasks: Array<Promise<unknown>> = [];

      // Data prefetches gated por presença da ilha no layout.
      if (token && kinds.has("performance_vs_ibov")) {
        phase2Tasks.push(getWatchlistPerformance("90d", token));
      }
      if (token && kinds.has("agenda")) {
        phase2Tasks.push(getAgenda(token));
      }
      if (token && kinds.has("notificacoes")) {
        phase2Tasks.push(notificationsService.getNotifications(token));
      }

      // Pre-warm de chunks JS das ilhas presentes. Se o layout veio
      // vazio (404 / novo usuário), pré-warma TODAS — usuário novo vai
      // ver default layout completo, melhor já ter os chunks na mão.
      const targetEntries: IslandRegistryEntry[] =
        kinds.size > 0
          ? Array.from(kinds)
              .map((k) => islandRegistry.get(k))
              .filter((e): e is IslandRegistryEntry => Boolean(e))
          : Array.from(islandRegistry.values());

      for (const entry of targetEntries) {
        preloadIslandChunk(entry);
      }

      return Promise.allSettled(phase2Tasks);
    });

    // ── Aguarda tudo ─────────────────────────────────────────────────
    Promise.allSettled([...phase1Tasks, phase2Promise]).finally(() => {
      if (!cancelled) setPrefetched(true);
    });

    return () => { cancelled = true; };
    // `token` muda na sessão login/logout; re-roda intencionalmente.
  }, [token]);

  return { prefetched };
}

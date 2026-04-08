"use client";

/**
 * useFavorites
 *
 * Hook para gerenciar favoritos do usuário.
 * Busca lista ao montar, permite toggle otimista com rollback.
 * Segue architecture_skill.md: lógica isolada em hook, service para HTTP.
 */

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { favoritesService } from "../services";

export function useFavorites() {
  const [tickers, setTickers] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Busca favoritos ao montar
  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    setError(null);
    favoritesService
      .list()
      .then((items) => {
        if (!cancelled) setTickers(new Set(items.map((i) => i.ticker)));
      })
      .catch((err: unknown) => {
        if (!cancelled) setError(err instanceof Error ? err : new Error(String(err)));
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  const isFavorite = useCallback((ticker: string) => tickers.has(ticker), [tickers]);

  const toggle = useCallback(
    async (ticker: string) => {
      const was = tickers.has(ticker);

      // Otimista: atualiza UI imediatamente
      setTickers((prev) => {
        const next = new Set(prev);
        if (was) next.delete(ticker);
        else next.add(ticker);
        return next;
      });

      try {
        if (was) {
          await favoritesService.remove(ticker);
          toast.success(`${ticker} removido da watchlist`);
        } else {
          await favoritesService.add(ticker);
          toast.success(`${ticker} adicionado à watchlist`);
        }
      } catch {
        // Rollback em caso de erro
        setTickers((prev) => {
          const next = new Set(prev);
          if (was) next.add(ticker);
          else next.delete(ticker);
          return next;
        });
        toast.error(
          was
            ? `Não foi possível remover ${ticker} da watchlist`
            : `Não foi possível adicionar ${ticker} à watchlist`,
        );
      }
    },
    [tickers],
  );

  return { tickers, isLoading, error, isFavorite, toggle };
}

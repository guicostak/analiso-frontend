"use client";

/**
 * useFavoriteCompanies
 *
 * Busca dados das empresas favoritadas via search API.
 * Recebe os tickers do useFavorites e retorna CompanySearchItem[].
 * Busca cada ticker individualmente para evitar depender de listagem total.
 */

import { useEffect, useMemo, useState } from "react";
import {
  searchService,
  type CompanySearchItem,
} from "@/src/features/explore/services/search.service";

export function useFavoriteCompanies(tickers: Set<string>) {
  const [companies, setCompanies] = useState<CompanySearchItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Serializa o Set em string ordenada para usar como dependency estável
  const tickerKey = useMemo(() => Array.from(tickers).sort().join(","), [tickers]);

  useEffect(() => {
    if (!tickerKey) {
      setCompanies([]);
      return;
    }

    let cancelled = false;
    setIsLoading(true);

    const tickerList = tickerKey.split(",");

    // Busca cada ticker individualmente via query param
    Promise.all(
      tickerList.map((ticker) =>
        searchService
          .search({ query: ticker, size: 5 })
          .then((res) => res.items.find((item) => item.ticker === ticker) ?? null)
          .catch(() => null),
      ),
    )
      .then((results) => {
        if (!cancelled) {
          const found = results.filter((r): r is CompanySearchItem => r !== null);
          setCompanies(found);
        }
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => { cancelled = true; };
  }, [tickerKey]);

  return { companies, isLoading };
}

"use client";

/**
 * ComparacoesRecentesIsland (4×2 — sempre 3 itens)
 *
 * Últimas comparações entre empresas. Fetch lazy via `compare-history.service`.
 */

import { useRef, useState, useCallback } from "react";
import Link from "next/link";
import { GitCompare } from "lucide-react";

import { useInViewLazyFetch } from "@/src/hooks";
import type { IslandProps } from "../../interfaces/island.types";
import { getHistory, type CompareHistoryEntry } from "../../services/compare-history.service";

const VISIBLE_COUNT = 3;

export function ComparacoesRecentesIsland(_props: IslandProps) {
  const ref = useRef<HTMLElement>(null);
  const [items, setItems] = useState<CompareHistoryEntry[]>([]);
  const [loaded, setLoaded] = useState(false);

  const load = useCallback(async () => {
    try {
      const list = await getHistory();
      setItems(list.slice(0, VISIBLE_COUNT));
    } catch {
      // silencia
    } finally {
      setLoaded(true);
    }
  }, []);

  useInViewLazyFetch(ref, load);

  return (
    /* Viés: Sunk Cost — comparações já criadas são "trabalho do usuário" e
       reaparecer aqui resgata esse investimento. */
    <article ref={ref} className="flex h-full w-full flex-col rounded-[20px] border border-border bg-card p-5">
      <div className="flex items-center gap-2">
        <GitCompare className="h-4 w-4 text-muted-foreground" />
        <h3 className="text-[13px] font-semibold text-foreground">Comparações recentes</h3>
      </div>

      <ul className="mt-3 flex-1 space-y-2">
        {!loaded && [0, 1, 2].map((i) => (
          <li key={i} className="h-10 animate-pulse rounded-[12px] bg-muted" />
        ))}
        {loaded && items.length === 0 && (
          <p className="py-4 text-[12px] text-muted-foreground">
            Suas comparações mais recentes vão aparecer aqui.
          </p>
        )}
        {loaded && items.map((entry) => (
          <li key={entry.id}>
            <Link
              href={`/comparar?a=${entry.tickers[0] ?? ""}&b=${entry.tickers[1] ?? ""}`}
              className="flex items-center justify-between rounded-[12px] bg-muted px-3 py-2 text-[13px] font-semibold text-foreground transition hover:bg-hover"
            >
              <span>{entry.tickers.join(" × ")}</span>
              <span className="text-[11px] font-medium text-muted-foreground">
                {new Date(entry.createdAt).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </article>
  );
}

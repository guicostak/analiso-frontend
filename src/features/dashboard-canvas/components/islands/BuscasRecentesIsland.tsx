"use client";

/**
 * BuscasRecentesIsland (4×2 — sempre 3 itens)
 *
 * Últimos termos de busca usados. Reaproveita `useSearchHistory()`.
 */

import Link from "next/link";
import { Search } from "lucide-react";
import { useSearchHistory } from "@/src/features/search-history";
import type { IslandProps } from "../../interfaces/island.types";

const VISIBLE_COUNT = 3;

export function BuscasRecentesIsland(_props: IslandProps) {
  const { items } = useSearchHistory();
  const visible = items.slice(0, VISIBLE_COUNT);

  return (
    /* Viés: Recognition over Recall — mostrar termos já usados é mais
       barato cognitivamente do que pedir ao usuário lembrar. */
    <article className="flex h-full w-full flex-col rounded-[20px] border border-border bg-card p-5">
      <div className="flex items-center gap-2">
        <Search className="h-4 w-4 text-muted-foreground" />
        <h3 className="text-[13px] font-semibold text-foreground">Buscas recentes</h3>
      </div>

      <ul className="mt-3 flex-1 space-y-2">
        {visible.length === 0 ? (
          <p className="py-4 text-[12px] text-muted-foreground">
            Suas buscas mais usadas vão aparecer aqui.
          </p>
        ) : (
          visible.map((entry) => (
            <li key={entry.id}>
              <Link
                href={`/buscar?q=${encodeURIComponent(entry.query)}`}
                className="block truncate rounded-[12px] bg-muted px-3 py-2 text-[13px] font-medium text-foreground transition hover:bg-hover"
              >
                {entry.query}
              </Link>
            </li>
          ))
        )}
      </ul>
    </article>
  );
}

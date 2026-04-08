"use client";

/**
 * EmpresasRecentesIsland (4×2 — sempre 3 itens)
 *
 * Lista as 3 últimas empresas visitadas. Fetch lazy via service próprio
 * (recent-companies.service) usando `useInViewLazyFetch`.
 */

import { useRef, useState, useCallback } from "react";
import Link from "next/link";
import { Building2 } from "lucide-react";

import { useInViewLazyFetch } from "@/src/hooks";
import type { IslandProps } from "../../interfaces/island.types";
import { getRecent, type RecentCompany } from "../../services/recent-companies.service";

const VISIBLE_COUNT = 3;

export function EmpresasRecentesIsland(_props: IslandProps) {
  const ref = useRef<HTMLElement>(null);
  const [items, setItems] = useState<RecentCompany[]>([]);
  const [loaded, setLoaded] = useState(false);

  const load = useCallback(async () => {
    try {
      const list = await getRecent();
      setItems(list.slice(0, VISIBLE_COUNT));
    } catch {
      // silencia — fonte secundária
    } finally {
      setLoaded(true);
    }
  }, []);

  useInViewLazyFetch(ref, load);

  return (
    /* Viés: Sunk Cost + IKEA Effect — empresas que o usuário já dedicou
       atenção ficam visíveis, recompensando o investimento prévio. */
    <article ref={ref} className="flex h-full w-full flex-col rounded-[20px] border border-border bg-card p-5">
      <div className="flex items-center gap-2">
        <Building2 className="h-4 w-4 text-muted-foreground" />
        <h3 className="text-[13px] font-semibold text-foreground">Empresas recentes</h3>
      </div>

      <ul className="mt-3 flex-1 space-y-2">
        {!loaded && [0, 1, 2].map((i) => (
          <li key={i} className="h-10 animate-pulse rounded-[12px] bg-muted" />
        ))}
        {loaded && items.length === 0 && (
          <p className="py-4 text-[12px] text-muted-foreground">
            Suas próximas visitas a empresas vão aparecer aqui.
          </p>
        )}
        {loaded && items.map((company) => (
          <li key={company.ticker}>
            <Link
              href={`/analysis/${company.ticker}`}
              className="flex items-center justify-between rounded-[12px] bg-muted px-3 py-2 text-[13px] font-semibold text-foreground transition hover:bg-hover"
            >
              <span>{company.ticker}</span>
              <span className="text-[11px] font-medium text-muted-foreground">
                {new Date(company.visitedAt).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </article>
  );
}

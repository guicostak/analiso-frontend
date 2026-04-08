"use client";

/**
 * SinaisWatchlistIsland (6×3 base, cresce vertical com `itemCount`)
 *
 * Sinais técnicos com fonte. Fetch lazy via service próprio. Toda linha
 * mostra a fonte (Confidence Building).
 */

import { useRef, useState, useCallback } from "react";
import { Radio } from "lucide-react";

import { useInViewLazyFetch } from "@/src/hooks";
import type { IslandProps } from "../../interfaces/island.types";
import { getSignals, type WatchlistSignal } from "../../services/watchlist-signals.service";

export function SinaisWatchlistIsland({ config }: IslandProps) {
  const ref = useRef<HTMLElement>(null);
  const [items, setItems] = useState<WatchlistSignal[]>([]);
  const [loaded, setLoaded] = useState(false);
  const limit = config.itemCount ?? 5;

  const load = useCallback(async () => {
    try {
      const list = await getSignals();
      setItems(list);
    } catch {
      // silencia
    } finally {
      setLoaded(true);
    }
  }, []);

  useInViewLazyFetch(ref, load);

  const visible = items.slice(0, limit);

  return (
    /* Viés: Confidence Building — toda linha mostra fonte e timestamp,
       reforçando que cada sinal é rastreável. */
    <article ref={ref} className="flex h-full w-full flex-col rounded-[20px] border border-border bg-card p-5">
      <div className="flex items-center gap-2">
        <Radio className="h-4 w-4 text-muted-foreground" />
        <h3 className="text-[13px] font-semibold text-foreground">Sinais da watchlist</h3>
      </div>

      <ul className="mt-3 flex-1 space-y-2 overflow-y-auto">
        {!loaded && Array.from({ length: limit }).map((_, i) => (
          <li key={i} className="h-11 animate-pulse rounded-[12px] bg-muted" />
        ))}
        {loaded && visible.length === 0 && (
          <p className="py-4 text-[12px] text-muted-foreground">
            Nenhum sinal técnico recente.
          </p>
        )}
        {loaded && visible.map((signal, i) => (
          <li key={`${signal.ticker}-${i}`} className="rounded-[12px] bg-muted px-3 py-2">
            <p className="text-[13px] font-semibold text-foreground">
              {signal.ticker} · {signal.signal}
            </p>
            <p className="text-[11px] text-muted-foreground">
              Fonte interna · {new Date(signal.raisedAt).toLocaleString("pt-BR")}
            </p>
          </li>
        ))}
      </ul>
    </article>
  );
}

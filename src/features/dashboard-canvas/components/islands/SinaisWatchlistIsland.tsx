"use client";

/**
 * SinaisWatchlistIsland (6×3 base, cresce vertical com `itemCount`)
 *
 * Sinais técnicos detectados nas empresas da watchlist, com fonte e
 * timestamp visíveis em cada linha (Confidence Building). Fetch lazy via
 * service próprio.
 */

import { useRef, useState, useCallback } from "react";
import { Radio } from "lucide-react";

import { useInViewLazyFetch } from "@/src/hooks";
import type { IslandProps } from "../../interfaces/island.types";
import { getSignals, type WatchlistSignal } from "../../services/watchlist-signals.service";
import { IslandShell } from "../shared/IslandShell";

export function SinaisWatchlistIsland({ config }: IslandProps) {
  const ref = useRef<HTMLDivElement>(null);
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
    <IslandShell
      icon={<Radio className="h-4 w-4 text-muted-foreground" />}
      title="Sinais da watchlist"
      info="Sinais técnicos detectados nas empresas que você acompanha. Cada linha mostra a fonte e o momento em que o sinal foi gerado."
    >
      <div ref={ref} className="flex-1 min-h-0 overflow-y-auto pr-1">
        <ul className="space-y-2">
          {!loaded && Array.from({ length: limit }).map((_, i) => (
            <li key={i} className="h-12 animate-pulse rounded-[10px] bg-muted" />
          ))}
          {loaded && visible.length === 0 && (
            <li className="px-1 py-3 text-[12px] text-muted-foreground">
              Nenhum sinal técnico recente.
            </li>
          )}
          {loaded && visible.map((signal, i) => (
            <li key={`${signal.ticker}-${i}`} className="rounded-[10px] bg-muted px-3 py-2">
              <p className="text-[12.5px] font-semibold text-foreground">
                {signal.ticker} · {signal.signal}
              </p>
              <p className="mt-0.5 text-[10.5px] text-muted-foreground">
                Fonte interna · {new Date(signal.raisedAt).toLocaleString("pt-BR")}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </IslandShell>
  );
}

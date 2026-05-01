"use client";

import { useEffect, useRef, useState } from "react";
import { useDebounce } from "@/src/hooks/useDebounce";
import { getCompanyLogo } from "@/src/features/explore/services";

// ─── Tipos ────────────────────────────────────────────────────────────────────

export interface SuggestResult {
  ticker:      string;
  companyName: string;
  exchange:    string;
  type:        string;
  logoUrl?:    string | null;
}

interface Props {
  query:    string;
  onSelect: (item: SuggestResult) => void;
  onClose:  () => void;
}

// ─── Highlight ────────────────────────────────────────────────────────────────

function highlightMatch(
  text: string,
  query: string,
): Array<{ text: string; isMatch: boolean }> {
  if (!query.trim()) return [{ text, isMatch: false }];

  const regex = new RegExp(
    `(${query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`,
    "gi",
  );
  const parts = text.split(regex);

  return parts.map((part) => ({
    text:    part,
    isMatch: part.toLowerCase() === query.toLowerCase(),
  }));
}

function HighlightedText({
  text,
  query,
}: {
  text:  string;
  query: string;
}) {
  const parts = highlightMatch(text, query);
  return (
    <span>
      {parts.map((part, i) =>
        part.isMatch ? (
          <strong key={i} className="font-semibold text-foreground">
            {part.text}
          </strong>
        ) : (
          <span key={i} className="text-muted-foreground">
            {part.text}
          </span>
        ),
      )}
    </span>
  );
}

// ─── Componente principal ─────────────────────────────────────────────────────

export function SearchAutocomplete({ query, onSelect, onClose }: Props) {
  const [results,     setResults]     = useState<SuggestResult[]>([]);
  const [loading,     setLoading]     = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  const debouncedQuery = useDebounce(query, 300);
  const containerRef   = useRef<HTMLDivElement>(null);
  const abortRef       = useRef<AbortController | null>(null);

  // Busca sugestões quando query debounced muda
  useEffect(() => {
    if (!debouncedQuery.trim()) {
      setResults([]);
      return;
    }

    abortRef.current?.abort();
    abortRef.current = new AbortController();

    setLoading(true);
    setActiveIndex(-1);

    fetch(
      `/api/search/suggest?q=${encodeURIComponent(debouncedQuery)}&limit=8`,
      { signal: abortRef.current.signal },
    )
      .then((r) => r.json())
      .then((data: { results?: SuggestResult[] }) => {
        setResults(data.results ?? []);
        setLoading(false);
      })
      .catch((err) => {
        if ((err as Error).name !== "AbortError") setLoading(false);
      });

    return () => abortRef.current?.abort();
  }, [debouncedQuery]);

  // Fecha ao clicar fora
  useEffect(() => {
    function handlePointerDown(e: PointerEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        onClose();
      }
    }
    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [onClose]);

  // Navegação por teclado.
  // Importante: ouvimos em FASE DE CAPTURA no document para rodar antes do
  // onKeyDown do input pai (que pode navegar para uma URL de busca). Assim,
  // quando há exatamente 1 resultado e o usuário pressiona Enter, conseguimos
  // selecionar esse resultado E bloquear o handler do pai via stopPropagation.
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (!results.length) return;

      if (e.key === "ArrowDown") {
        e.preventDefault();
        e.stopPropagation();
        setActiveIndex((i) => Math.min(i + 1, results.length - 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        e.stopPropagation();
        setActiveIndex((i) => Math.max(i - 1, -1));
      } else if (e.key === "Enter") {
        // 1) Item destacado via setas → seleciona ele
        if (activeIndex >= 0) {
          e.preventDefault();
          e.stopImmediatePropagation();
          onSelect(results[activeIndex]);
          return;
        }
        // 2) Apenas 1 resultado na lista → seleciona automaticamente
        if (results.length === 1) {
          e.preventDefault();
          e.stopImmediatePropagation();
          onSelect(results[0]);
          return;
        }
        // Caso contrário, deixa o handler do input pai decidir.
      } else if (e.key === "Escape") {
        onClose();
      }
    }
    // capture=true → roda antes dos listeners do React no root container
    document.addEventListener("keydown", handleKeyDown, true);
    return () => document.removeEventListener("keydown", handleKeyDown, true);
  }, [results, activeIndex, onSelect, onClose]);

  if (!loading && results.length === 0) return null;

  return (
    <div
      ref={containerRef}
      role="listbox"
      aria-label="Sugestões de busca"
      className="absolute left-0 right-0 top-[calc(100%+4px)] z-50 overflow-hidden rounded-xl border border-border bg-card shadow-[0_8px_32px_rgba(0,0,0,0.12)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.5)] animate-[dropdown-in_150ms_cubic-bezier(0.16,1,0.3,1)]"
    >
      {loading && (
        <div className="flex items-center gap-2 px-4 py-3">
          <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground [animation-delay:0ms]" />
          <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground [animation-delay:150ms]" />
          <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground [animation-delay:300ms]" />
        </div>
      )}

      {results.map((item, i) => (
        <button
          key={item.ticker}
          role="option"
          aria-selected={i === activeIndex}
          onPointerDown={(e) => {
            e.preventDefault();
            onSelect(item);
          }}
          className={`flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors ${
            i === activeIndex ? "bg-muted" : "hover:bg-muted/60"
          }`}
        >
          {(() => {
            const logo = item.logoUrl ?? getCompanyLogo(item.ticker);
            return logo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={logo}
                alt=""
                className="h-6 w-6 shrink-0 rounded-[8px] border border-border bg-muted object-cover"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).style.display = "none";
                }}
              />
            ) : (
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-[8px] border border-border bg-muted text-[10px] font-medium text-muted-foreground">
                {item.ticker.charAt(0)}
              </span>
            );
          })()}
          <span className="min-w-[56px] font-mono text-[13px] font-medium text-foreground">
            <HighlightedText text={item.ticker} query={query} />
          </span>
          <span className="flex-1 truncate text-[13px] text-muted-foreground">
            <HighlightedText text={item.companyName} query={query} />
          </span>
          <span className="font-mono text-[11px] text-muted-foreground/60">
            {item.exchange}
          </span>
        </button>
      ))}
    </div>
  );
}

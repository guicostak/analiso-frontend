"use client";

import { useEffect, useRef, useState } from "react";
import { useDebounce } from "@/src/hooks/useDebounce";

// ─── Tipos ────────────────────────────────────────────────────────────────────

export interface SuggestResult {
  ticker:      string;
  companyName: string;
  exchange:    string;
  type:        string;
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
      .then((r) => {
        if (!r.ok) throw new Error("suggest_failed");
        return r.json();
      })
      .then((data: { results?: SuggestResult[] }) => {
        setResults(data.results ?? []);
        setLoading(false);
      })
      .catch((err) => {
        // Aborts are expected when the user keeps typing — silently ignore.
        if ((err as Error).name === "AbortError") return;
        // Other failures: keep the dropdown empty so it gracefully closes,
        // and stop the spinner. Don't toast — autocomplete failures are too
        // frequent and not actionable for the user.
        console.error("[SearchAutocomplete] suggest failed", err);
        setResults([]);
        setLoading(false);
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

  // Navegação por teclado (gerida no input pai via onKeyDown)
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (!results.length) return;

      if (e.key === "ArrowDown") {
        e.preventDefault();
        setActiveIndex((i) => Math.min(i + 1, results.length - 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setActiveIndex((i) => Math.max(i - 1, -1));
      } else if (e.key === "Enter" && activeIndex >= 0) {
        e.preventDefault();
        onSelect(results[activeIndex]);
      } else if (e.key === "Escape") {
        onClose();
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
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
            // Evita blur do input antes do click ser processado
            e.preventDefault();
            onSelect(item);
          }}
          className={`flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors ${
            i === activeIndex
              ? "bg-muted"
              : "hover:bg-muted/60"
          }`}
        >
          {/* Ticker */}
          <span className="min-w-[56px] font-mono text-[13px] font-medium text-foreground">
            <HighlightedText text={item.ticker} query={query} />
          </span>

          {/* Nome da empresa */}
          <span className="flex-1 truncate text-[13px] text-muted-foreground">
            <HighlightedText text={item.companyName} query={query} />
          </span>

          {/* Bolsa */}
          <span className="font-mono text-[11px] text-muted-foreground/60">
            {item.exchange}
          </span>
        </button>
      ))}
    </div>
  );
}

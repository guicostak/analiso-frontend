"use client";

/**
 * AddCompanyModal
 *
 * Modal genérico para buscar e selecionar uma empresa.
 * Usado tanto em Favoritas quanto em Comparar.
 */

import { useEffect, useRef, useState } from "react";
import { Search, X } from "lucide-react";
import { useDebounce } from "@/src/hooks/useDebounce";
import { getCompanyLogo } from "@/src/features/explore/services";
import { API_BASE_URL_URL } from "@/src/lib/api-base";

interface SuggestResult {
  ticker: string;
  companyName: string;
  exchange: string;
  type: string;
}

interface AddCompanyModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** Chamado ao clicar em uma empresa da lista */
  onSelect: (ticker: string, companyName: string) => void;
  /** Tickers a serem ocultados da lista (ex: já favoritados ou já na comparação) */
  excludeTickers?: Set<string>;
  /** Texto exibido no rodapé do modal */
  footerText?: string;
  /** Placeholder do campo de busca */
  searchPlaceholder?: string;
}

export function AddCompanyModal({
  isOpen,
  onClose,
  onSelect,
  excludeTickers,
  footerText,
  searchPlaceholder = "Buscar por nome ou ticker...",
}: AddCompanyModalProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SuggestResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const debouncedQuery = useDebounce(query, 300);

  // Foca no input ao abrir
  useEffect(() => {
    if (isOpen) {
      setQuery("");
      setResults([]);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  // Busca sugestões (ou carrega lista inicial ao abrir)
  useEffect(() => {
    if (!isOpen) return;

    if (!debouncedQuery || debouncedQuery.length < 1) {
      setIsLoading(true);
      fetch(`${API_BASE_URL}/api/search?size=20`)
        .then((res) => (res.ok ? res.json() : { items: [] }))
        .then((data: { items?: Array<{ ticker: string; companyName: string; cdCvm: number }> }) => {
          setResults(
            (data.items ?? []).map((item) => ({
              ticker: item.ticker,
              companyName: item.companyName,
              exchange: "B3",
              type: "ON",
            })),
          );
        })
        .catch(() => setResults([]))
        .finally(() => setIsLoading(false));
      return;
    }

    setIsLoading(true);
    fetch(`${API_BASE_URL}/api/search/suggest?q=${encodeURIComponent(debouncedQuery)}&limit=12`)
      .then((res) => (res.ok ? res.json() : { results: [] }))
      .then((data: { results?: SuggestResult[] }) => {
        setResults(data.results ?? []);
      })
      .catch(() => setResults([]))
      .finally(() => setIsLoading(false));
  }, [debouncedQuery, isOpen]);

  // Fecha com ESC
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const visibleResults = excludeTickers
    ? results.filter((item) => !excludeTickers.has(item.ticker))
    : results;

  return (
    <div className="fixed inset-0 z-[9999] flex items-start justify-center pt-[72px]">
      {/* Backdrop — começa após a navbar (top-14 = 56px) */}
      <div
        className="absolute inset-0 top-14 bg-foreground/10 backdrop-blur-[2px]"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-[520px] rounded-2xl border border-border bg-card shadow-[0_24px_64px_rgba(15,23,40,0.16)] dark:shadow-[0_24px_64px_rgba(0,0,0,0.4)]">
        {/* Header com input */}
        <div className="flex items-center gap-3 border-b border-border px-4 py-3">
          <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
          <input
            ref={inputRef}
            type="text"
            placeholder={searchPlaceholder}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
          />
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-muted-foreground transition hover:bg-muted hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Lista de resultados */}
        <div className="max-h-[400px] overflow-y-auto p-2">
          {isLoading && (
            <div className="space-y-2 p-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-3 rounded-xl p-3">
                  <div className="h-9 w-9 rounded-lg bg-muted animate-pulse" />
                  <div className="flex-1 space-y-1.5">
                    <div className="h-3.5 w-32 rounded bg-muted animate-pulse" />
                    <div className="h-3 w-20 rounded bg-muted animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {!isLoading && visibleResults.length === 0 && (
            <p className="px-3 py-6 text-center text-sm text-muted-foreground">
              {query ? `Nenhuma empresa encontrada para "${query}"` : "Nenhuma empresa disponível"}
            </p>
          )}

          {!isLoading && visibleResults.map((item) => {
            const logo = getCompanyLogo(item.ticker);

            return (
              <button
                key={item.ticker}
                onClick={() => {
                  onSelect(item.ticker, item.companyName);
                  onClose();
                }}
                className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition hover:bg-muted"
              >
                {logo ? (
                  <img
                    src={logo}
                    alt={item.ticker}
                    className="h-9 w-9 rounded-lg border border-border bg-muted object-cover p-0.5"
                  />
                ) : (
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-muted text-xs font-semibold text-muted-foreground">
                    {item.ticker.slice(0, 2)}
                  </div>
                )}

                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm text-foreground">
                    {item.companyName}
                    <span className="ml-1.5 text-muted-foreground">{item.ticker}</span>
                  </p>
                  <p className="text-xs text-muted-foreground">{item.exchange}</p>
                </div>
              </button>
            );
          })}
        </div>

        {/* Footer opcional */}
        {footerText && (
          <div className="border-t border-border px-4 py-2.5 text-xs text-muted-foreground">
            {footerText}
          </div>
        )}
      </div>
    </div>
  );
}

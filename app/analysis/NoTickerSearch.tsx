"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import {
  SearchAutocomplete,
  type SuggestResult,
} from "@/src/components/shared";

export function NoTickerSearch() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);

  function handleSelect(item: SuggestResult) {
    setShowDropdown(false);
    router.push(`/analysis/${item.ticker.toUpperCase()}`);
  }

  function handleSubmit() {
    const q = query.trim();
    if (!q) return;
    router.push(`/analysis/${q.toUpperCase()}`);
  }

  return (
    <div className="relative w-full max-w-[420px]">
      <div className="flex h-11 w-full items-center rounded-lg border border-border bg-muted px-3">
        <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
        <input
          ref={inputRef}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setShowDropdown(true);
          }}
          onFocus={() => {
            if (query) setShowDropdown(true);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSubmit();
            if (e.key === "Escape") setShowDropdown(false);
          }}
          className="h-full w-full border-0 bg-transparent px-2 text-sm text-foreground outline-none placeholder:text-muted-foreground"
          placeholder="Procurar por ticker ou empresa"
          autoComplete="off"
          autoFocus
        />
        <button
          type="button"
          onClick={handleSubmit}
          className="ml-2 shrink-0 rounded-md bg-brand px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-brand-hover"
        >
          Buscar
        </button>
      </div>

      {showDropdown && (
        <SearchAutocomplete
          query={query}
          onSelect={handleSelect}
          onClose={() => setShowDropdown(false)}
        />
      )}
    </div>
  );
}

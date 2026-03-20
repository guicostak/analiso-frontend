"use client";

import { X } from "lucide-react";

interface ExploreCompareBarProps {
  compareTickers: string[];
  toggleCompare: (ticker: string) => void;
}

export function ExploreCompareBar({ compareTickers, toggleCompare }: ExploreCompareBarProps) {
  if (compareTickers.length === 0) return null;

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-card border border-border shadow-lg rounded-2xl px-4 py-3 flex items-center gap-4">
      <div className="flex items-center gap-2">
        <span className="text-xs text-muted-foreground">Comparar:</span>
        {compareTickers.map((ticker) => (
          <span key={ticker} className="flex items-center gap-1 px-2 py-1 rounded-full bg-muted text-xs text-foreground/80">
            {ticker}
            <button onClick={() => toggleCompare(ticker)}>
              <X className="w-3 h-3" />
            </button>
          </span>
        ))}
      </div>
      <button className="px-3 py-2 rounded-xl bg-mint-500 text-white text-xs font-medium hover:bg-mint-600">
        Comparar ({compareTickers.length}/4)
      </button>
    </div>
  );
}

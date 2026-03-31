"use client";

import { X } from "lucide-react";
import Link from "next/link";
import { Button } from "@/src/components/ui/button";

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
            <Button
              variant="ghost"
              onClick={() => toggleCompare(ticker)}
              className="h-auto w-auto p-0 [&_svg]:size-3"
            >
              <X />
            </Button>
          </span>
        ))}
      </div>
      <Button variant="mint" size="xs" className="rounded-xl" asChild>
        <Link href={`/comparar?tickers=${compareTickers.join(",")}`}>
          Comparar ({compareTickers.length}/4)
        </Link>
      </Button>
    </div>
  );
}

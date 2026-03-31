"use client";

import { useMemo } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationBarProps {
  page: number;
  totalPages: number;
  onGoToPage: (p: number) => void;
}

export function PaginationBar({ page, totalPages, onGoToPage }: PaginationBarProps) {
  const pages = useMemo(() => {
    const result: (number | "ellipsis")[] = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible + 2) {
      for (let i = 0; i < totalPages; i++) result.push(i);
    } else {
      result.push(0);

      let start = Math.max(1, page - 1);
      let end = Math.min(totalPages - 2, page + 1);

      if (page <= 2) {
        start = 1;
        end = maxVisible - 2;
      } else if (page >= totalPages - 3) {
        start = totalPages - maxVisible + 1;
        end = totalPages - 2;
      }

      if (start > 1) result.push("ellipsis");
      for (let i = start; i <= end; i++) result.push(i);
      if (end < totalPages - 2) result.push("ellipsis");

      result.push(totalPages - 1);
    }

    return result;
  }, [page, totalPages]);

  return (
    <nav
      role="navigation"
      aria-label="Paginação dos resultados"
      className="mt-6 flex items-center justify-center gap-1"
    >
      <button
        type="button"
        onClick={() => onGoToPage(page - 1)}
        disabled={page === 0}
        aria-label="Página anterior"
        className="flex h-9 w-9 items-center justify-center rounded-lg border border-border text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:cursor-not-allowed disabled:opacity-40"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>

      {pages.map((p, i) =>
        p === "ellipsis" ? (
          <span
            key={`e-${i}`}
            className="flex h-9 w-9 items-center justify-center text-[12px] text-muted-foreground"
            aria-hidden
          >
            ...
          </span>
        ) : (
          <button
            key={p}
            type="button"
            onClick={() => onGoToPage(p)}
            aria-current={p === page ? "page" : undefined}
            className={`flex h-9 min-w-9 items-center justify-center rounded-lg px-2 text-[12px] font-medium transition-colors ${
              p === page
                ? "border border-brand bg-brand-surface text-brand"
                : "border border-transparent text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            {p + 1}
          </button>
        ),
      )}

      <button
        type="button"
        onClick={() => onGoToPage(page + 1)}
        disabled={page >= totalPages - 1}
        aria-label="Próxima página"
        className="flex h-9 w-9 items-center justify-center rounded-lg border border-border text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:cursor-not-allowed disabled:opacity-40"
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    </nav>
  );
}

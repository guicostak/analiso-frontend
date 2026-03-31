"use client";

/**
 * BuscaResultsGrid
 *
 * Grid de resultados da busca avançada com paginação.
 * Exibe cards de empresas vindos da API com métricas e links para análise.
 *
 * Segue design_skill.md: tokens semânticos, micro-interações, acessibilidade.
 * Segue responsive_skill.md: grid 1col → 2col → 3col conforme breakpoint.
 */

import { AlertCircle, SearchX } from "lucide-react";
import { Skeleton } from "@/src/components/ui/skeleton";
import { PaginationBar } from "@/src/components/shared/PaginationBar";
import { CompanyCard } from "@/src/components/shared/CompanyCard";
import type { CompanySearchItem } from "@/src/features/explore/services/search.service";

// ─── Props ───────────────────────────────────────────────────────────────────

interface BuscaResultsGridProps {
  items: CompanySearchItem[];
  page: number;
  totalPages: number;
  totalItems: number;
  isLoading: boolean;
  error: string | null;
  onGoToPage: (page: number) => void;
  onRetry: () => void;
}

// ─── Componente ──────────────────────────────────────────────────────────────

export function BuscaResultsGrid({
  items,
  page,
  totalPages,
  totalItems,
  isLoading,
  error,
  onGoToPage,
  onRetry,
}: BuscaResultsGridProps) {
  // ─── Estado de erro ──────────────────────────────────────────────────────
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-danger-border bg-danger-surface/30 px-6 py-16 text-center">
        <AlertCircle className="mb-3 h-8 w-8 text-danger-text" />
        <p className="mb-1 text-[14px] font-semibold text-foreground">Erro na busca</p>
        <p className="mb-4 text-[12px] text-muted-foreground">{error}</p>
        <button
          type="button"
          onClick={onRetry}
          className="rounded-lg bg-brand px-4 py-2 text-[12px] font-medium text-white transition-colors hover:bg-brand-hover"
        >
          Tentar novamente
        </button>
      </div>
    );
  }

  // ─── Estado de loading ───────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div>
        <div className="mb-4 flex items-center justify-between">
          <Skeleton className="h-5 w-40" />
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="rounded-xl border border-border bg-card p-4">
              <Skeleton className="mb-3 h-5 w-28" />
              <Skeleton className="mb-2 h-4 w-16" />
              <div className="mt-4 grid grid-cols-2 gap-2">
                <Skeleton className="h-9 w-full" />
                <Skeleton className="h-9 w-full" />
                <Skeleton className="h-9 w-full" />
                <Skeleton className="h-9 w-full" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ─── Vazio ───────────────────────────────────────────────────────────────
  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-border bg-card px-6 py-16 text-center">
        <SearchX className="mb-3 h-8 w-8 text-muted-foreground" />
        <p className="mb-1 text-[14px] font-semibold text-foreground">Nenhuma empresa encontrada</p>
        <p className="text-[12px] text-muted-foreground">
          Tente ajustar os filtros para ampliar os resultados.
        </p>
      </div>
    );
  }

  // ─── Resultados ──────────────────────────────────────────────────────────
  return (
    <div>
      {/* Cabeçalho dos resultados */}
      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-[13px] text-muted-foreground">
          <span className="font-semibold text-foreground">{totalItems}</span>{" "}
          {totalItems === 1 ? "empresa encontrada" : "empresas encontradas"}
        </p>
        {totalPages > 1 && (
          <p className="text-[12px] text-muted-foreground">
            Página {page + 1} de {totalPages}
          </p>
        )}
      </div>

      {/* Grid de cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {items.map((item) => (
          <CompanyCard
            key={item.ticker}
            ticker={item.ticker}
            companyName={item.companyName}
            metrics={item.metrics ?? {}}
          />
        ))}
      </div>

      {/* Paginação */}
      {totalPages > 1 && (
        <PaginationBar
          page={page}
          totalPages={totalPages}
          onGoToPage={onGoToPage}
        />
      )}
    </div>
  );
}

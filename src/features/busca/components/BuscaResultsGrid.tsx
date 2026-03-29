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

import { useMemo } from "react";
import Link from "next/link";
import {
  AlertCircle,
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  SearchX,
} from "lucide-react";
import { Skeleton } from "@/src/components/ui/skeleton";
import type { CompanySearchItem } from "@/src/features/explore/services/search.service";

// ─── Métricas exibidas no card ───────────────────────────────────────────────

interface DisplayMetric {
  keys: string[];  // aceita múltiplas chaves (snake_case e display)
  label: string;
  unit: string;
  format: (v: number) => string;
}

const DISPLAY_METRICS: DisplayMetric[] = [
  { keys: ["pl", "P/L"], label: "P/L", unit: "x", format: (v) => v.toFixed(1) },
  { keys: ["pvp", "P/VP"], label: "P/VP", unit: "x", format: (v) => v.toFixed(2) },
  { keys: ["dy", "Dividend Yield"], label: "DY", unit: "%", format: (v) => v.toFixed(1) },
  { keys: ["roe", "ROE"], label: "ROE", unit: "%", format: (v) => v.toFixed(1) },
  { keys: ["roic", "ROIC"], label: "ROIC", unit: "%", format: (v) => v.toFixed(1) },
  { keys: ["margem_liquida", "Margem Líquida"], label: "Margem Líq.", unit: "%", format: (v) => v.toFixed(1) },
  { keys: ["divida_ebitda", "Dívida Líquida/EBITDA"], label: "Dív/EBITDA", unit: "x", format: (v) => v.toFixed(1) },
  { keys: ["ev_ebitda", "EV/EBITDA"], label: "EV/EBITDA", unit: "x", format: (v) => v.toFixed(1) },
];

/** Resolve o valor de uma métrica tentando múltiplas chaves. */
function resolveMetric(metrics: Record<string, number>, keys: string[]): number | undefined {
  for (const k of keys) {
    if (metrics[k] != null) return metrics[k];
  }
  return undefined;
}

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
          <CompanyResultCard key={item.ticker} item={item} />
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

// ─── Card de resultado ───────────────────────────────────────────────────────

function CompanyResultCard({ item }: { item: CompanySearchItem }) {
  const metrics = item.metrics ?? {};

  const visibleMetrics = useMemo(
    () => DISPLAY_METRICS.filter((m) => resolveMetric(metrics, m.keys) != null),
    [metrics],
  );

  return (
    <div className="group rounded-xl border border-border bg-card p-4 transition-shadow hover:shadow-md">
      {/* Header */}
      <div className="mb-3 flex items-start justify-between">
        <div className="min-w-0 flex-1">
          <p className="truncate text-[14px] font-semibold text-foreground">
            {item.companyName}
          </p>
          <p className="text-[12px] font-medium text-brand">{item.ticker}</p>
        </div>
        <Link
          href={`/empresa/${item.ticker}`}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-border text-muted-foreground transition-colors hover:border-brand hover:bg-brand-surface hover:text-brand"
          aria-label={`Abrir análise de ${item.ticker}`}
        >
          <ArrowUpRight className="h-4 w-4" />
        </Link>
      </div>

      {/* Métricas */}
      {visibleMetrics.length > 0 ? (
        <div className="grid grid-cols-2 gap-x-3 gap-y-2">
          {visibleMetrics.map((m) => {
            const value = resolveMetric(metrics, m.keys)!;
            return (
              <div
                key={m.keys[0]}
                className="flex items-baseline justify-between rounded-md bg-muted/50 px-2.5 py-1.5"
              >
                <span className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                  {m.label}
                </span>
                <span className="text-[12px] font-semibold tabular-nums text-foreground">
                  {m.format(value)}{m.unit}
                </span>
              </div>
            );
          })}
        </div>
      ) : (
        <p className="text-[11px] italic text-muted-foreground">
          Métricas não disponíveis
        </p>
      )}

      {/* Link para análise */}
      <Link
        href={`/empresa/${item.ticker}`}
        className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-lg border border-border py-2 text-[12px] font-medium text-foreground transition-colors hover:border-brand hover:bg-brand-surface hover:text-brand"
      >
        Abrir análise
        <ArrowUpRight className="h-3.5 w-3.5" />
      </Link>
    </div>
  );
}

// ─── Paginação ───────────────────────────────────────────────────────────────

function PaginationBar({
  page,
  totalPages,
  onGoToPage,
}: {
  page: number;
  totalPages: number;
  onGoToPage: (p: number) => void;
}) {
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
      {/* Anterior */}
      <button
        type="button"
        onClick={() => onGoToPage(page - 1)}
        disabled={page === 0}
        aria-label="Página anterior"
        className="flex h-9 w-9 items-center justify-center rounded-lg border border-border text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:cursor-not-allowed disabled:opacity-40"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>

      {/* Números */}
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

      {/* Próximo */}
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

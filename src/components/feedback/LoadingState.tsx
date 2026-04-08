"use client";

/**
 * LoadingState — full-screen page loader padronizado.
 *
 * Visual baseado no carregamento da tela de Análise: barras de skeleton
 * animadas + linha de varredura na cor brand + duas linhas shimmer + label.
 * Use este componente em qualquer tela que precise de um loading entre rotas.
 *
 * As classes utilitárias (analysis-skeleton-bar/-line/-shimmer e analysis-enter)
 * são definidas em src/styles/globals.css.
 */

interface LoadingStateProps {
  /** Texto sob o skeleton. Default: "Carregando…" */
  label?: string;
  /** Quando true, ocupa apenas o espaço do pai (sem min-h-screen). */
  inline?: boolean;
}

export function LoadingState({ label = "Carregando…", inline = false }: LoadingStateProps) {
  return (
    <div
      className={
        inline
          ? "flex w-full items-center justify-center py-16"
          : "min-h-screen bg-background flex items-center justify-center"
      }
    >
      <div className="text-center space-y-8 analysis-enter" style={{ width: 320 }}>
        {/* Skeleton chart bars */}
        <div className="relative flex items-end justify-center gap-2.5" style={{ height: 120 }}>
          {[65, 85, 45, 100, 55, 75, 90].map((h, i) => (
            <div
              key={i}
              className="analysis-skeleton-bar"
              style={{ width: 24, height: `${h}%`, transformOrigin: 'bottom' }}
            />
          ))}
          <div className="analysis-skeleton-line" />
        </div>

        {/* Skeleton text lines */}
        <div className="space-y-3 px-4">
          <div className="analysis-skeleton-shimmer mx-auto" style={{ height: 14, width: '70%' }} />
          <div className="analysis-skeleton-shimmer mx-auto" style={{ height: 10, width: '50%' }} />
        </div>

        <p className="text-sm text-muted-foreground font-medium">{label}</p>
      </div>
    </div>
  );
}

export function SkeletonCard({ className = '' }: { className?: string }) {
  return (
    <div className={`bg-card border border-neutral-200 dark:border-neutral-700 rounded-3xl p-8 ${className}`}>
      <div className="animate-pulse">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-xl bg-neutral-200" />
          <div className="flex-1">
            <div className="h-4 bg-neutral-200 rounded w-32 mb-2" />
            <div className="h-3 bg-neutral-200 rounded w-24" />
          </div>
        </div>
        <div className="space-y-3">
          <div className="h-3 bg-neutral-200 rounded w-full" />
          <div className="h-3 bg-neutral-200 rounded w-5/6" />
          <div className="h-3 bg-neutral-200 rounded w-4/6" />
        </div>
      </div>
    </div>
  );
}

"use client";

/**
 * Skeleton de loading da agenda.
 * Replica a estrutura da view semanal com elementos animados.
 */
export function AgendaSkeleton() {
  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      {/* Header skeleton */}
      <div className="flex shrink-0 items-center justify-between border-b border-border bg-card px-5 py-3">
        <div className="h-5 w-20 animate-pulse rounded bg-muted" />
        <div className="flex items-center gap-2">
          <div className="h-8 w-48 animate-pulse rounded-lg bg-muted" />
          <div className="h-8 w-20 animate-pulse rounded-lg bg-muted" />
          <div className="h-8 w-24 animate-pulse rounded-lg bg-muted" />
        </div>
      </div>

      {/* Calendar grid skeleton */}
      <div className="flex flex-1 overflow-hidden">
        {Array.from({ length: 7 }, (_, i) => (
          <div key={i} className="flex flex-1 flex-col border-r border-border last:border-r-0">
            {/* Column header */}
            <div className="flex flex-col items-center border-b border-border bg-muted/50 py-2.5 gap-1.5">
              <div className="h-3 w-6 animate-pulse rounded bg-muted" />
              <div className="h-7 w-7 animate-pulse rounded-full bg-muted" />
            </div>

            {/* Event skeletons */}
            <div className="p-1.5 space-y-1.5">
              {i % 3 === 0 && (
                <>
                  <div className="h-12 animate-pulse rounded-lg bg-muted" />
                  <div className="h-10 animate-pulse rounded-lg bg-muted" />
                </>
              )}
              {i % 3 === 1 && (
                <div className="h-12 animate-pulse rounded-lg bg-muted" />
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

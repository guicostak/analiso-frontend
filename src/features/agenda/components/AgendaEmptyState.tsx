"use client";

import { CalendarX2, Radar } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface AgendaEmptyStateProps {
  /** 'no-watchlist': usuário não tem nenhuma empresa na watchlist */
  /** 'no-events':    tem watchlist mas sem eventos no período visível */
  reason?: 'no-watchlist' | 'no-events';
}

export function AgendaEmptyState({ reason = 'no-events' }: AgendaEmptyStateProps) {
  const router = useRouter();

  if (reason === 'no-watchlist') {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 p-8 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-surface border border-brand-border">
          <Radar size={28} className="text-brand" />
        </div>
        <div>
          <h3 className="text-base font-semibold text-foreground">
            Adicione empresas à sua watchlist
          </h3>
          <p className="mt-1.5 text-sm text-muted-foreground max-w-xs">
            A agenda exibe os próximos eventos das empresas da sua watchlist — balanços, dividendos, fatos relevantes e mais.
          </p>
        </div>
        <button
          onClick={() => router.push('/watchlist')}
          className="mt-2 flex items-center gap-2 rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-hover active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <Radar size={15} />
          Ir para Watchlist
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 p-8 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted border border-border">
        <CalendarX2 size={28} className="text-muted-foreground" />
      </div>
      <div>
        <h3 className="text-base font-semibold text-foreground">
          Nenhum evento neste período
        </h3>
        <p className="mt-1.5 text-sm text-muted-foreground max-w-xs">
          Não há eventos agendados para as empresas da sua watchlist no período selecionado. Tente navegar para outro período ou remover filtros.
        </p>
      </div>
    </div>
  );
}

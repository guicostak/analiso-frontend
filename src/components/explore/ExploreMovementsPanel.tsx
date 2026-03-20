"use client";

import { Dot, ExternalLink } from "lucide-react";
import Link from "next/link";
import type { MoverRow, MovementInsight, MoverType } from "../../types/explore";

interface ExploreMovementsPanelProps {
  selectedTab: MoverType;
  movers: MoverRow[];
  movementInsights: Record<string, MovementInsight>;
  showAllMovements: boolean;
  compact?: boolean;
  getCompanyLogo: (ticker: string) => string | undefined;
  setSelectedTab: (tab: MoverType) => void;
  setShowAllMovements: (fn: ((prev: boolean) => boolean) | boolean) => void;
}

export function ExploreMovementsPanel({
  selectedTab,
  movers,
  movementInsights,
  showAllMovements,
  compact = false,
  getCompanyLogo,
  setSelectedTab,
  setShowAllMovements,
}: ExploreMovementsPanelProps) {
  return (
    <section className={`bg-card rounded-2xl border border-border ${compact ? "p-4" : "p-5"}`}>
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold text-foreground">Movimentos que pedem contexto hoje</h3>
          <p className="text-xs text-muted-foreground">Use como apoio: primeiro a interpretação, depois o movimento de preço.</p>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Dot className="w-4 h-4 text-amber-400" />
          Interpretado pela Analiso
        </div>
      </div>
      <div className="flex items-center gap-2 mb-4">
        {[
          { label: "Altas", value: "altas" },
          { label: "Baixas", value: "baixas" },
          { label: "Fluxo", value: "negociadas" },
        ].map((tab) => (
          <button
            key={tab.value}
            onClick={() => {
              setSelectedTab(tab.value as MoverType);
              setShowAllMovements(false);
            }}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
              selectedTab === tab.value ? "bg-brand-surface text-brand-text" : "text-muted-foreground hover:text-foreground hover:bg-hover"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className="space-y-3">
        {movers
          .filter((row) => row.type === selectedTab)
          .slice(0, showAllMovements ? 6 : compact ? 4 : 3)
          .map((row) => {
            const insight = movementInsights[row.ticker];
            const impactPillars = insight?.impactPillars ?? "Caixa e Margens";
            const whyOpenNow = insight?.why ?? "Vale confirmar se o movimento altera a leitura dos fundamentos.";
            return (
              <article key={`${row.ticker}-${row.type}`} className="w-full rounded-xl border border-border p-3">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      {getCompanyLogo(row.ticker) && (
                        <img
                          src={getCompanyLogo(row.ticker)}
                          alt={`Logo ${row.ticker}`}
                          className="h-7 w-7 rounded-full border border-border object-cover bg-card"
                        />
                      )}
                      <span className="text-sm font-semibold text-foreground">{row.ticker}</span>
                      <span className="text-xs text-muted-foreground">{row.name}</span>
                    </div>
                    <p className="mt-1 text-sm font-medium text-foreground">{row.note}</p>
                    <p className="mt-1 text-xs text-foreground/70">Por que merece leitura: {whyOpenNow}</p>
                    <p className="mt-1 text-xs text-muted-foreground">Pilares afetados: {impactPillars}</p>
                  </div>
                  <div className="min-w-[72px] text-right pt-1">
                    <p className="text-[10px] text-muted-foreground/40">Preço</p>
                    <p className="text-[11px] text-muted-foreground/40">{row.price}</p>
                    <p className="text-[11px] font-normal text-muted-foreground/40">{row.changePct}</p>
                  </div>
                </div>
                <div className="mt-3 flex items-center gap-2">
                  <Link href={`/empresa/${row.ticker}`} className="px-3 py-1.5 rounded-xl bg-[#0E9384] text-white text-xs font-medium hover:opacity-90">
                    Abrir análise
                  </Link>
                  <button className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground/80">
                    <ExternalLink className="w-3 h-3" />
                    Ver contexto
                  </button>
                </div>
              </article>
            );
          })}
      </div>
      {movers.filter((row) => row.type === selectedTab).length > 3 ? (
        <button onClick={() => setShowAllMovements((prev) => !prev)} className="mt-3 text-xs text-muted-foreground hover:text-foreground/80">
          {showAllMovements ? "Ver menos movimentos" : "Ver mais movimentos"}
        </button>
      ) : null}
      <div className="mt-4 text-[11px] text-muted-foreground/60">Fonte: B3 . Atualizado em 05/02</div>
    </section>
  );
}

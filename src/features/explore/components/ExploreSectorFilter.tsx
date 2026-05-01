"use client";

/**
 * ExploreSectorFilter — filtro de movimentações por setor B3.
 *
 * Substitui a ilha decorativa anterior "Lente da curadoria" (que tinha
 * toggle Mercado/Setor mas NÃO filtrava nada). Agora cada chip é um
 * setor real derivado dos movers do dia, com contagem de empresas.
 * Click = filtra; re-click no ativo = volta pra "Todos".
 *
 * Skills aplicadas:
 * - 10-ux-principles: filtro só aparece se há setores pra filtrar
 *   (empty state seria frio — ilha se esconde sozinha).
 * - 30-component-rubrics (filter bar): chips com nome claro, contagem,
 *   estado ativo evidente. Sem dropdown pesado nem "Todas" ambíguo.
 * - 50-copy-system: "Filtrar por setor", "Todos os setores", "{N} empresas".
 */

import { useMemo } from "react";
import { Filter, X } from "lucide-react";

export interface SectorFilterItem {
  /** Identificador canônico do setor (ex: "Financeiro"). Null = "Todos". */
  sector: string;
  /** Quantas empresas com esse setor aparecem nos movers do dia. */
  count: number;
}

interface ExploreSectorFilterProps {
  /** Setores presentes nos movers, com contagem. Vazio = ilha não renderiza. */
  sectors: SectorFilterItem[];
  /** Setor ativo — null = filtro desligado ("Todos"). */
  activeSector: string | null;
  /** Handler: null = limpar filtro. */
  onSelect: (sector: string | null) => void;
  /** Total de empresas cobertas (para o chip "Todos"). */
  totalCount: number;
}

export function ExploreSectorFilter({
  sectors,
  activeSector,
  onSelect,
  totalCount,
}: ExploreSectorFilterProps) {
  // Ordena por contagem DESC; estabilidade por nome do setor.
  const sortedSectors = useMemo(() => {
    return [...sectors].sort((a, b) => {
      if (b.count !== a.count) return b.count - a.count;
      return a.sector.localeCompare(b.sector);
    });
  }, [sectors]);

  if (sortedSectors.length === 0) return null;

  const isAll = activeSector == null;
  const activeLabel = activeSector ?? "Todos os setores";

  return (
    <section
      aria-label="Filtrar por setor"
      className="mercado-elev-sm rounded-3xl border border-border bg-card p-5"
    >
      <header className="mb-3 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="inline-flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
            <Filter className="h-3 w-3" aria-hidden="true" />
            Filtrar por setor
          </p>
          <h3 className="mt-1 text-base font-semibold leading-6 text-foreground">
            {activeLabel}
          </h3>
          <p className="mt-1 text-xs leading-5 text-muted-foreground">
            {isAll
              ? "Mostrando todas as movimentações cobertas pela Analiso."
              : "Só movimentações do setor — curadoria, movers e lista completa."}
          </p>
        </div>
        {!isAll && (
          <button
            type="button"
            onClick={() => onSelect(null)}
            className="
              inline-flex shrink-0 items-center gap-1 rounded-full border border-border bg-card
              px-2.5 py-1 text-[11px] font-medium text-muted-foreground
              transition-colors duration-200 hover:text-foreground hover:bg-accent
            "
            aria-label="Limpar filtro de setor"
          >
            <X className="h-3 w-3" aria-hidden="true" />
            Limpar
          </button>
        )}
      </header>

      <div className="flex flex-wrap gap-1.5">
        {/* Chip "Todos" fica primeiro como reset visível. */}
        <SectorChip
          label="Todos"
          count={totalCount}
          active={isAll}
          onClick={() => onSelect(null)}
        />
        {sortedSectors.map((item) => (
          <SectorChip
            key={item.sector}
            label={item.sector}
            count={item.count}
            active={activeSector === item.sector}
            onClick={() => onSelect(activeSector === item.sector ? null : item.sector)}
          />
        ))}
      </div>
    </section>
  );
}

interface SectorChipProps {
  label: string;
  count: number;
  active: boolean;
  onClick: () => void;
}

function SectorChip({ label, count, active, onClick }: SectorChipProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`
        inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium
        transition-colors duration-200
        ${active
          ? "border-foreground bg-foreground text-primary-foreground"
          : "border-border bg-card text-muted-foreground hover:text-foreground hover:bg-accent"}
      `}
    >
      <span>{label}</span>
      <span
        className={`
          rounded-full px-1.5 py-0.5 text-[10px] font-semibold tabular-nums
          ${active ? "bg-primary-foreground/20 text-primary-foreground" : "bg-muted text-muted-foreground"}
        `}
      >
        {count}
      </span>
    </button>
  );
}

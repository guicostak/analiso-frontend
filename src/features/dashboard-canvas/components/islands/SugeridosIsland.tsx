"use client";

/**
 * SugeridosIsland (6×5) — exibida como "Recentes"
 *
 * Ilha consolidada que substitui as 3 ilhas separadas (4×2 cada) que
 * existiam antes:
 *   - empresas_recentes — últimas empresas visitadas
 *   - buscas_recentes — últimos termos buscados
 *   - comparacoes_recentes — últimas comparações de tickers
 *
 * **Layout:** 3 sub-seções de altura IGUAL via `flex-1 min-h-0` — cada
 * sub-seção ocupa exatamente 1/3 do espaço interno disponível, indepen-
 * dentemente da quantidade de items que tem. Isso evita o "salto" visual
 * que o `space-y-4` flexível causava (uma seção vazia colapsava e outra
 * crescia).
 *
 * **Cap de items:** cada sub-seção mostra no máximo `MAX_ITEMS` entries.
 * Pra ver mais, o usuário clica em "Ver todos →" no header da sub-seção,
 * que linka pra a página relevante (`/buscar`, `/comparar`).
 *
 * Internamente: o `id` do kind continua sendo `"sugeridos"` (chave estável
 * persistida no backend). Só o label visível mudou pra "Recentes".
 */

import { useCallback, useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Building2,
  GitCompare,
  History,
  Search,
  type LucideIcon,
} from "lucide-react";

import { useInViewLazyFetch } from "@/src/hooks";
import { useSearchHistory } from "@/src/features/search-history";
import { cn } from "@/src/components/ui/utils";

import type { IslandProps } from "../../interfaces/island.types";
import { getRecent, type RecentCompany } from "../../services/recent-companies.service";
import { getHistory, type CompareHistoryEntry } from "../../services/compare-history.service";
import { IslandShell } from "../shared/IslandShell";

/**
 * Cap de items por sub-seção. Calculado pra caber sem scroll interno
 * dentro de ~110px disponíveis (440px - header da ilha - paddings) ÷ 3:
 *   header sub-seção (~22px) + 3 items × (item-height + gap) ~= 110px
 */
const MAX_ITEMS = 3;

function fmtDate(value: string | number | Date) {
  return new Date(value).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
}

// ─── Sub-seção (1/3 da ilha) ────────────────────────────────────────────────

interface SubsectionProps {
  icon: LucideIcon;
  title: string;
  /** Link "Ver todos →" — quando ausente, o link não aparece. */
  seeAllHref?: string;
  emptyHint: string;
  loaded: boolean;
  count: number;
  children: ReactNode;
}

function Subsection({
  icon: Icon,
  title,
  seeAllHref,
  emptyHint,
  loaded,
  count,
  children,
}: SubsectionProps) {
  return (
    <section className={cn("flex min-h-0 flex-1 flex-col gap-1.5")}>
      {/* Header fixo da sub-seção */}
      <header className="flex flex-shrink-0 items-center justify-between gap-2 px-0.5">
        <h3 className="inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          <Icon className="h-3 w-3" />
          {title}
          {loaded && count > 0 && (
            <span className="ml-0.5 rounded-full bg-muted px-1.5 py-px text-[9.5px] font-medium tabular-nums text-muted-foreground/80">
              {count}
            </span>
          )}
        </h3>

        {seeAllHref && loaded && count > 0 && (
          <Link
            href={seeAllHref}
            className="inline-flex items-center gap-0.5 text-[10px] font-medium text-muted-foreground transition-colors hover:text-brand"
          >
            Ver todos
            <ArrowRight className="h-2.5 w-2.5" />
          </Link>
        )}
      </header>

      {/* Conteúdo — empty state ou lista */}
      <div className="flex-1 min-h-0">
        {!loaded ? (
          <ul className="space-y-1.5">
            {[0, 1].map((i) => (
              <li key={i} className="h-7 animate-pulse rounded-[8px] bg-muted" />
            ))}
          </ul>
        ) : count === 0 ? (
          <p className="px-1 py-1 text-[11px] leading-snug text-muted-foreground/70">
            {emptyHint}
          </p>
        ) : (
          <ul className="space-y-1">{children}</ul>
        )}
      </div>
    </section>
  );
}

// ─── Componente principal ───────────────────────────────────────────────────

export function SugeridosIsland(_props: IslandProps) {
  const ref = useRef<HTMLDivElement>(null);

  const [empresas, setEmpresas] = useState<RecentCompany[]>([]);
  const [empresasLoaded, setEmpresasLoaded] = useState(false);

  const [comparacoes, setComparacoes] = useState<CompareHistoryEntry[]>([]);
  const [comparacoesLoaded, setComparacoesLoaded] = useState(false);

  const { items: buscaItems } = useSearchHistory();
  const buscaVisible = buscaItems.slice(0, MAX_ITEMS);

  const loadAll = useCallback(async () => {
    const [empresasResult, comparacoesResult] = await Promise.allSettled([
      getRecent(),
      getHistory(),
    ]);
    if (empresasResult.status === "fulfilled") {
      setEmpresas(empresasResult.value.slice(0, MAX_ITEMS));
    }
    if (comparacoesResult.status === "fulfilled") {
      setComparacoes(comparacoesResult.value.slice(0, MAX_ITEMS));
    }
    setEmpresasLoaded(true);
    setComparacoesLoaded(true);
  }, []);

  useInViewLazyFetch(ref, loadAll);

  return (
    <IslandShell
      icon={<History className="h-4 w-4 text-muted-foreground" />}
      title="Recentes"
      info="Atalhos pra retomar onde você parou: empresas visitadas, buscas feitas e comparações criadas. Clique em 'Ver todos' pra ver o histórico completo."
    >
      {/* Container interno: 3 sub-seções de altura igual via flex-1.
          `min-h-0` é crítico — sem ele, sub-seções não shrink e overflow
          quebra o layout. */}
      <div ref={ref} className="flex flex-1 min-h-0 flex-col gap-3">
        {/* ─── 1. Empresas ─── */}
        <Subsection
          icon={Building2}
          title="Empresas recentes"
          seeAllHref="/buscar"
          emptyHint="Suas próximas visitas vão aparecer aqui."
          loaded={empresasLoaded}
          count={empresas.length}
        >
          {empresas.map((company) => (
            <li key={company.ticker}>
              <Link
                href={`/analysis/${company.ticker}`}
                className="flex items-center justify-between gap-2 rounded-[8px] bg-muted px-2.5 py-1.5 text-[12px] font-semibold text-foreground transition-colors duration-150 ease-out hover:bg-hover"
              >
                <span className="truncate">{company.ticker}</span>
                <span className="flex-shrink-0 text-[10px] font-medium text-muted-foreground">
                  {fmtDate(company.visitedAt)}
                </span>
              </Link>
            </li>
          ))}
        </Subsection>

        {/* ─── 2. Buscas ─── */}
        <Subsection
          icon={Search}
          title="Buscas recentes"
          seeAllHref="/buscar"
          emptyHint="Suas buscas mais usadas vão aparecer aqui."
          loaded
          count={buscaVisible.length}
        >
          {buscaVisible.map((entry) => (
            <li key={entry.id}>
              <Link
                href={`/buscar?q=${encodeURIComponent(entry.query)}`}
                className="block truncate rounded-[8px] bg-muted px-2.5 py-1.5 text-[12px] font-medium text-foreground transition-colors duration-150 ease-out hover:bg-hover"
              >
                {entry.query}
              </Link>
            </li>
          ))}
        </Subsection>

        {/* ─── 3. Comparações ─── */}
        <Subsection
          icon={GitCompare}
          title="Comparações recentes"
          seeAllHref="/comparar"
          emptyHint="Suas comparações recentes vão aparecer aqui."
          loaded={comparacoesLoaded}
          count={comparacoes.length}
        >
          {comparacoes.map((entry) => (
            <li key={entry.id}>
              <Link
                href={`/comparar?a=${entry.tickers[0] ?? ""}&b=${entry.tickers[1] ?? ""}`}
                className="flex items-center justify-between gap-2 rounded-[8px] bg-muted px-2.5 py-1.5 text-[12px] font-semibold text-foreground transition-colors duration-150 ease-out hover:bg-hover"
              >
                <span className="truncate">{entry.tickers.join(" × ")}</span>
                <span className="flex-shrink-0 text-[10px] font-medium text-muted-foreground">
                  {fmtDate(entry.createdAt)}
                </span>
              </Link>
            </li>
          ))}
        </Subsection>
      </div>
    </IslandShell>
  );
}

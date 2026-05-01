"use client";

/**
 * ExploreAllMoversList — lista compacta (row) de todas as movimentações do dia
 * que a Analiso cobre, dedupada entre os três grupos (altas/baixas/negociadas).
 *
 * <b>Por que existe (produto):</b> a aba Movimentos prioriza CURADORIA — top 5
 * por grupo com contexto, pilares e "por que abrir". Mas o usuário que já
 * conhece a tela e quer varrer "o que mais mexeu hoje" precisa de uma porta
 * pra ver tudo sem sair da tela. Essa lista é essa porta — secondary,
 * sempre visível e paginada para não competir com a curadoria acima.
 *
 * <b>Por que compacta e sóbria (skill 10-ux-principles + 30-component-rubrics):</b>
 * - Uma linha por ticker (logo, ticker, empresa, preço, variação%).
 * - Sem badge, sem "por que abrir", sem pilar — propositalmente.
 * - CTA implícito no hover (card inteiro é link pra /analysis/{ticker}).
 *
 * <b>Paginação local</b> — default 10 visíveis, "Carregar mais 10" / "Mostrar
 * todos" / "Mostrar menos". Padrão consistente com o MovementsPanel da mesma
 * aba. Linhas com ticker/nome inválidos são filtradas antes da renderização.
 */

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ArrowUpRight, ArrowDownRight, ChevronLeft, ChevronRight, Minus, TrendingUp } from "lucide-react";
import type { MoverRow } from "../interfaces";
import { SectionCategoryTag } from "./market/SectionCategoryTag";

interface ExploreAllMoversListProps {
  /** Todos os movers da aba Movimentos (altas + baixas + negociadas, com duplicatas). */
  movers: MoverRow[];
}

type SortKey = "changeDesc" | "changeAsc" | "tickerAsc";

const MOVIMENTOS_CATEGORY_ID = "movimentos";

/** Quantos registros aparecem ao abrir; "Carregar mais" soma em múltiplos disso. */
const PAGE_SIZE = 10;

/**
 * Filtra linhas com ticker/nome inválidos vindas do backend.
 * Casos observados: "None", "None None", null, string vazia — são registros
 * sujos (sem metadata da empresa) que o usuário via como "None None R$ 24,71".
 * Produto: melhor esconder do que exibir lixo rotulado como oportunidade.
 */
function isValidMover(m: MoverRow): boolean {
  const ticker = (m.ticker ?? "").trim();
  const name = (m.name ?? "").trim();
  if (!ticker || !name) return false;
  const lowerT = ticker.toLowerCase();
  const lowerN = name.toLowerCase();
  if (lowerT === "none" || lowerT === "null" || lowerT === "undefined") return false;
  if (lowerN === "none" || lowerN === "null" || lowerN === "undefined") return false;
  return true;
}

/**
 * Extrai o valor numérico do changePct serializado como string do backend
 * (ex: "+3,20%", "-0,50%", "3.2%"). Usado só para ordenação — o display
 * continua usando a string original do backend (respeita formatação BR).
 *
 * @returns Number finito ou NaN quando não der pra parsear.
 */
function parseChangePct(raw: string | null | undefined): number {
  if (!raw) return NaN;
  const cleaned = raw
    .replace(/\s/g, "")
    .replace(/%/g, "")
    .replace(/\+/g, "")
    .replace(/\./g, "")   // remove separador de milhar
    .replace(/,/g, ".");  // vírgula decimal → ponto
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : NaN;
}

/** Trend do row: 'up' se change > 0, 'down' se < 0, 'flat' caso contrário. */
function trendOf(changePct: string): "up" | "down" | "flat" {
  const n = parseChangePct(changePct);
  if (!Number.isFinite(n)) return "flat";
  if (n > 0) return "up";
  if (n < 0) return "down";
  return "flat";
}

/**
 * Dedupe preserva a primeira ocorrência (um ticker em múltiplos grupos
 * mantém o registro do primeiro grupo — tipicamente 'altas' ou 'baixas'
 * vem antes de 'negociadas' na ordem do hook).
 */
function dedupeByTicker(list: MoverRow[]): MoverRow[] {
  const seen = new Set<string>();
  const out: MoverRow[] = [];
  for (const m of list) {
    const key = m.ticker.toUpperCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(m);
  }
  return out;
}

function sortMovers(list: MoverRow[], key: SortKey): MoverRow[] {
  const copy = list.slice();
  if (key === "tickerAsc") {
    copy.sort((a, b) => a.ticker.localeCompare(b.ticker));
    return copy;
  }
  copy.sort((a, b) => {
    const na = parseChangePct(a.changePct);
    const nb = parseChangePct(b.changePct);
    // NaN vai pro fim
    const ia = Number.isFinite(na) ? na : key === "changeDesc" ? -Infinity : Infinity;
    const ib = Number.isFinite(nb) ? nb : key === "changeDesc" ? -Infinity : Infinity;
    return key === "changeDesc" ? ib - ia : ia - ib;
  });
  return copy;
}

function TrendIcon({ t }: { t: "up" | "down" | "flat" }) {
  if (t === "up") return <ArrowUpRight className="h-3.5 w-3.5 text-success-text" aria-hidden="true" />;
  if (t === "down") return <ArrowDownRight className="h-3.5 w-3.5 text-danger-text" aria-hidden="true" />;
  return <Minus className="h-3.5 w-3.5 text-muted-foreground" aria-hidden="true" />;
}

/**
 * Constrói a sequência de páginas a mostrar no rodapé: sempre primeira/última,
 * janela em torno da atual, e "ellipsis" (null) quando há gaps.
 *
 * Exemplos com current=5, total=20 → [1, "...", 4, 5, 6, "...", 20]
 * Com total ≤ 7, retorna todas (sem ellipsis) — evita UI inútil.
 */
type PageToken = number | "ellipsis-left" | "ellipsis-right";
function buildPageRange(current: number, totalPages: number): PageToken[] {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }
  const pages: PageToken[] = [1];
  const start = Math.max(2, current - 1);
  const end = Math.min(totalPages - 1, current + 1);
  if (start > 2) pages.push("ellipsis-left");
  for (let p = start; p <= end; p++) pages.push(p);
  if (end < totalPages - 1) pages.push("ellipsis-right");
  pages.push(totalPages);
  return pages;
}

function MoverRowItem({ m }: { m: MoverRow }) {
  const t = trendOf(m.changePct);
  const toneClass =
    t === "up" ? "text-success-text" : t === "down" ? "text-danger-text" : "text-muted-foreground";
  return (
    <Link
      href={`/analysis/${m.ticker}`}
      className="
        group relative flex items-center gap-3 rounded-xl border border-border bg-card px-3 py-2.5
        transition-colors duration-200 hover:border-border hover:bg-accent
      "
    >
      {/* Tag silenciosa — seção Movimentos já identificada no header da ilha */}
      <SectionCategoryTag icon={TrendingUp} label="Movimentos" categoryId={MOVIMENTOS_CATEGORY_ID} silent />
      {m.logoUrl ? (
        <Image
          src={m.logoUrl}
          alt=""
          width={28}
          height={28}
          className="h-7 w-7 shrink-0 rounded-full border border-border bg-card object-contain"
          unoptimized
        />
      ) : (
        <div className="h-7 w-7 shrink-0 rounded-full border border-border bg-muted" />
      )}
      <div className="flex min-w-0 flex-1 items-baseline gap-2">
        <span className="shrink-0 text-sm font-semibold text-foreground">{m.ticker}</span>
        <span className="truncate text-xs text-muted-foreground">{m.name}</span>
      </div>
      <span className="shrink-0 text-xs tabular-nums text-muted-foreground">{m.price}</span>
      <span className={`flex shrink-0 items-center gap-1 text-sm font-semibold tabular-nums ${toneClass}`}>
        <TrendIcon t={t} />
        {m.changePct}
      </span>
    </Link>
  );
}

export function ExploreAllMoversList({ movers }: ExploreAllMoversListProps) {
  const [sortKey, setSortKey] = useState<SortKey>("changeDesc");
  const [page, setPage] = useState<number>(1);

  /**
   * Pipeline de transformação:
   *   1. filtra linhas com metadata inválida ("None None")
   *   2. deduplica por ticker (uma empresa pode estar em múltiplos grupos)
   *   3. ordena pelo sortKey atual
   */
  const deduped = useMemo(() => dedupeByTicker(movers.filter(isValidMover)), [movers]);
  const sorted = useMemo(() => sortMovers(deduped, sortKey), [deduped, sortKey]);

  const total = sorted.length;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  // Corrige página caso a lista encolha (filtro/deduplicação reduziu total).
  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  const safePage = Math.min(page, totalPages);
  const startIdx = (safePage - 1) * PAGE_SIZE;
  const endIdx = Math.min(startIdx + PAGE_SIZE, total);
  const visible = sorted.slice(startIdx, endIdx);
  const pageTokens = buildPageRange(safePage, totalPages);

  if (total === 0) return null;

  return (
    <section aria-label="Todas as movimentações do dia" className="space-y-4 pt-2">
      <header className="flex items-start gap-2">
        <SectionCategoryTag icon={TrendingUp} label="Movimentos" categoryId={MOVIMENTOS_CATEGORY_ID} className="mt-1" />
        <div>
          <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
            Lista completa
          </p>
          <h3 className="text-lg font-semibold tracking-[-0.015em] text-foreground">
            Todas as movimentações do dia
          </h3>
          <p className="mt-1 max-w-[680px] text-xs leading-relaxed text-muted-foreground">
            Varredura compacta das empresas cobertas pela Analiso com movimento no pregão.
            Para leitura com contexto, use os destaques e o painel de movimentos acima.
          </p>
        </div>
      </header>

      {/* Ordenação — mantida mínima. Sem filtro de setor/grupo (evita virar screener). */}
      <div className="flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground">
        <span className="uppercase tracking-wide">Ordenar por</span>
        {[
          { k: "changeDesc", label: "Maior alta" },
          { k: "changeAsc",  label: "Maior queda" },
          { k: "tickerAsc",  label: "Ticker" },
        ].map((opt) => {
          const active = sortKey === (opt.k as SortKey);
          return (
            <button
              key={opt.k}
              type="button"
              onClick={() => {
                setSortKey(opt.k as SortKey);
                setPage(1); // Troca de ordenação volta pra pg 1 — evita "estou em pg 3 de uma outra lista"
              }}
              aria-pressed={active}
              className={`
                rounded-full border px-2.5 py-0.5 text-[11px] font-medium transition-colors duration-200
                ${active
                  ? "border-foreground bg-foreground text-primary-foreground"
                  : "border-border bg-card text-muted-foreground hover:text-foreground hover:bg-accent"}
              `}
            >
              {opt.label}
            </button>
          );
        })}
      </div>

      {/* Lista compacta — 1 linha por ticker. */}
      <div className="grid gap-1.5">
        {visible.map((m) => (
          <MoverRowItem key={m.ticker.toUpperCase()} m={m} />
        ))}
      </div>

      {/*
        Paginação numerada — página 1, 2, 3, ..., N com prev/next.
        Aparece só quando há mais de uma página. Janela ao redor da atual +
        first/last sempre visíveis + ellipsis nos gaps (ver buildPageRange).
      */}
      {totalPages > 1 && (
        <nav
          aria-label="Paginação da lista de movimentações"
          className="flex flex-wrap items-center justify-between gap-3 pt-1"
        >
          <p className="text-xs tabular-nums text-muted-foreground">
            {startIdx + 1}–{endIdx} de {total}
          </p>

          <div className="flex flex-wrap items-center gap-1">
            <button
              type="button"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={safePage === 1}
              aria-label="Página anterior"
              className="
                inline-flex h-8 w-8 items-center justify-center rounded-full border border-border bg-card
                text-muted-foreground transition-colors duration-200
                hover:text-foreground hover:bg-accent
                disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-card disabled:hover:text-muted-foreground
              "
            >
              <ChevronLeft className="h-4 w-4" aria-hidden="true" />
            </button>

            {pageTokens.map((tok, idx) => {
              if (tok === "ellipsis-left" || tok === "ellipsis-right") {
                return (
                  <span
                    key={`${tok}-${idx}`}
                    aria-hidden="true"
                    className="inline-flex h-8 w-6 items-center justify-center text-xs text-muted-foreground"
                  >
                    …
                  </span>
                );
              }
              const active = tok === safePage;
              return (
                <button
                  key={tok}
                  type="button"
                  onClick={() => setPage(tok)}
                  aria-current={active ? "page" : undefined}
                  aria-label={`Ir para página ${tok}`}
                  className={`
                    inline-flex h-8 min-w-8 items-center justify-center rounded-full border px-2.5 text-xs font-semibold tabular-nums transition-colors duration-200
                    ${active
                      ? "border-foreground bg-foreground text-primary-foreground"
                      : "border-border bg-card text-muted-foreground hover:text-foreground hover:bg-accent"}
                  `}
                >
                  {tok}
                </button>
              );
            })}

            <button
              type="button"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={safePage === totalPages}
              aria-label="Próxima página"
              className="
                inline-flex h-8 w-8 items-center justify-center rounded-full border border-border bg-card
                text-muted-foreground transition-colors duration-200
                hover:text-foreground hover:bg-accent
                disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-card disabled:hover:text-muted-foreground
              "
            >
              <ChevronRight className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        </nav>
      )}
    </section>
  );
}

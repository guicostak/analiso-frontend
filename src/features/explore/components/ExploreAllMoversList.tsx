"use client";

/**
 * ExploreAllMoversList — lista compacta (row) de todas as movimentações do dia
 * que a Analiso cobre, dedupada entre os três grupos (altas/baixas/negociadas).
 *
 * <b>Por que existe (produto):</b> a aba Movimentos prioriza CURADORIA — top 5
 * por grupo com contexto, pilares e "por que abrir". Mas o usuário que já
 * conhece a tela e quer varrer "o que mais mexeu hoje" precisa de uma porta
 * pra ver tudo sem sair da tela. Essa lista é essa porta — secondary, opt-in,
 * discreta. Nunca compete com a curadoria.
 *
 * <b>Por que compacta e sóbria (skill 10-ux-principles + 30-component-rubrics):</b>
 * - Uma linha por ticker (logo, ticker, empresa, preço, variação%).
 * - Sem badge, sem "por que abrir", sem pilar — propositalmente.
 * - CTA implícito no hover (card inteiro é link pra /analysis/{ticker}).
 *
 * <b>Sem paginação explícita</b> — hoje a Analiso cobre ~15 tickers únicos
 * nos 3 grupos juntos; a lista cabe na tela. Quando o pipeline for ampliado
 * pra top 50, aí sim virtualize/paginate.
 */

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowUpRight, ArrowDownRight, ChevronDown, ChevronUp, Minus, TrendingUp } from "lucide-react";
import type { MoverRow } from "../interfaces";
import { SectionCategoryTag } from "./market/SectionCategoryTag";

interface ExploreAllMoversListProps {
  /** Todos os movers da aba Movimentos (altas + baixas + negociadas, com duplicatas). */
  movers: MoverRow[];
}

type SortKey = "changeDesc" | "changeAsc" | "tickerAsc";

const MOVIMENTOS_CATEGORY_ID = "movimentos";

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

function MoverRowItem({ m }: { m: MoverRow }) {
  const t = trendOf(m.changePct);
  const toneClass =
    t === "up" ? "text-success-text" : t === "down" ? "text-danger-text" : "text-muted-foreground";
  return (
    <Link
      href={`/analysis/${m.ticker}`}
      className="
        group flex items-center gap-3 rounded-xl border border-border bg-card px-3 py-2.5
        transition-all duration-150 hover:border-border hover:bg-hover
      "
    >
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
        <SectionCategoryTag icon={TrendingUp} label="Movimentos" categoryId={MOVIMENTOS_CATEGORY_ID} />
        <span className="shrink-0 text-[13px] font-semibold text-foreground">{m.ticker}</span>
        <span className="truncate text-[12px] text-muted-foreground">{m.name}</span>
      </div>
      <span className="shrink-0 text-[12px] tabular-nums text-muted-foreground">{m.price}</span>
      <span className={`flex shrink-0 items-center gap-1 text-[13px] font-semibold tabular-nums ${toneClass}`}>
        <TrendIcon t={t} />
        {m.changePct}
      </span>
    </Link>
  );
}

export function ExploreAllMoversList({ movers }: ExploreAllMoversListProps) {
  const [open, setOpen] = useState(false);
  const [sortKey, setSortKey] = useState<SortKey>("changeDesc");

  const deduped = useMemo(() => dedupeByTicker(movers), [movers]);
  const sorted = useMemo(() => sortMovers(deduped, sortKey), [deduped, sortKey]);

  if (deduped.length === 0) return null;

  return (
    <section aria-label="Todas as movimentações do dia" className="pt-2">
      {/*
        Toggle discreto (secondary). Estilo "ver mais sóbrio" — não é CTA
        primário, é um disclosure opt-in pra quem quer cavar.
      */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="
          inline-flex items-center gap-1.5 rounded-full border border-border bg-card
          px-3 py-1.5 text-[12px] font-medium text-muted-foreground
          transition-colors duration-150 hover:text-foreground
        "
      >
        {open ? (
          <ChevronUp className="h-3.5 w-3.5" aria-hidden="true" />
        ) : (
          <ChevronDown className="h-3.5 w-3.5" aria-hidden="true" />
        )}
        {open ? "Recolher" : `Ver todas as movimentações (${deduped.length})`}
      </button>

      {open && (
        <div className="mt-4 space-y-3">
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
                  onClick={() => setSortKey(opt.k as SortKey)}
                  className={`
                    rounded-full border px-2.5 py-0.5 text-[11px] font-medium transition-colors duration-150
                    ${active
                      ? "border-foreground bg-foreground text-primary-foreground"
                      : "border-border bg-card text-muted-foreground hover:text-foreground"}
                  `}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>

          {/* Lista compacta — 1 linha por ticker. Sem empty state frio: se chegou aqui é pq deduped > 0. */}
          <div className="grid gap-1.5">
            {sorted.map((m) => (
              <MoverRowItem key={m.ticker.toUpperCase()} m={m} />
            ))}
          </div>

          <p className="pt-1 text-[11px] text-muted-foreground">
            Lista de {deduped.length} empresas cobertas pela Analiso com movimento no pregão.
            Para leitura com contexto, use os destaques e o painel de movimentos acima.
          </p>
        </div>
      )}
    </section>
  );
}

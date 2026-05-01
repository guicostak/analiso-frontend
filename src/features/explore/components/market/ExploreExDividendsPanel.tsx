"use client";

/**
 * Ilha "Ex-dividendos" — aba Movimentos de /mercado.
 *
 * Diferencial Analiso: contextualiza quedas "suspeitas". O usuário vê ABEV3
 * caindo 5% e, em vez de achar que é ruptura, lê aqui que é ajuste técnico
 * de ex-dividendo — educação no momento certo (skill: empty states = onboarding,
 * tooltip = aprofundar, card = contexto + implicação + CTA).
 *
 * Hierarquia visual (skill 30-component-rubrics):
 *   1. "Hoje" — primary, card destaque com borda sutil (se existir; senão esconde)
 *   2. "Próximos 30 dias" — secondary, lista compacta
 *
 * Segue convenções: zero hex, tokens semânticos, dark-mode ready, globe data-tag.
 */

import Image from "next/image";
import Link from "next/link";
import { TrendingUp } from "lucide-react";
import type { ExDividendBundle, ExDividendItem } from "../../interfaces/market.interfaces";
import { InfoTooltip } from "@/src/components/shared/InfoTooltip";
import { SectionCategoryTag } from "./SectionCategoryTag";

interface ExploreExDividendsPanelProps {
  bundle: ExDividendBundle | null;
}

const MOVIMENTOS_CATEGORY_ID = "movimentos";

const EX_DIV_INFO =
  "Na data ex-dividendo (\"ex-date\") a ação passa a ser negociada SEM direito ao próximo provento. " +
  "O preço tipicamente cai aproximadamente pelo valor do dividendo — é ajuste técnico, não ruptura.";

function formatDate(iso: string): string {
  try {
    const d = new Date(`${iso}T12:00:00-03:00`);
    return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
  } catch {
    return iso;
  }
}

function formatDps(dps: number | null): string | null {
  if (dps == null) return null;
  return dps.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
    maximumFractionDigits: 4,
  });
}

function formatYield(dy: number | null): string | null {
  if (dy == null) return null;
  return `${dy.toLocaleString("pt-BR", { minimumFractionDigits: 1, maximumFractionDigits: 1 })}%`;
}

function daysLabel(days: number): string {
  if (days === 0) return "Hoje";
  if (days === 1) return "Amanhã";
  return `em ${days} dias`;
}

function ExDividendRow({ item, highlight = false }: { item: ExDividendItem; highlight?: boolean }) {
  const dpsLabel = formatDps(item.dpsTtm);
  const yieldLabel = formatYield(item.dividendYield);
  const dateLabel = formatDate(item.exDate);
  const daysText = daysLabel(item.daysUntilEx);
  return (
    <Link
      href={`/analysis/${item.ticker}`}
      className={`
        mercado-island-hover group relative flex items-center gap-3 rounded-2xl border bg-card p-3
        ${highlight ? "border-brand/40" : "border-border"}
      `}
    >
      {/* Tag silenciosa — seção já identificada */}
      <SectionCategoryTag icon={TrendingUp} label="Movimentos" categoryId={MOVIMENTOS_CATEGORY_ID} silent />
      {item.logoUrl ? (
        <Image
          src={item.logoUrl}
          alt=""
          width={32}
          height={32}
          className="h-8 w-8 shrink-0 rounded-full border border-border bg-card object-contain"
          unoptimized
        />
      ) : (
        <div className="h-8 w-8 shrink-0 rounded-full border border-border bg-muted" />
      )}
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline gap-2">
          <span className="truncate text-sm font-semibold text-foreground">{item.ticker}</span>
          <span className="truncate text-[11px] text-muted-foreground">{item.companyName ?? "—"}</span>
        </div>
        <p className="mt-0.5 text-[11px] text-muted-foreground">
          {dateLabel} · {daysText}
          {dpsLabel && <> · <span className="text-foreground">{dpsLabel}</span> por ação</>}
          {yieldLabel && <> · DY {yieldLabel}</>}
        </p>
      </div>
      <span className="shrink-0 text-[11px] font-medium text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100">
        Abrir análise →
      </span>
    </Link>
  );
}

export function ExploreExDividendsPanel({ bundle }: ExploreExDividendsPanelProps) {
  if (!bundle) return null;
  const hasToday = bundle.today.length > 0;
  const hasUpcoming = bundle.upcoming.length > 0;
  if (!hasToday && !hasUpcoming) return null;

  return (
    <section className="space-y-4" aria-label="Ex-dividendos">
      <header className="flex items-start gap-2">
        <SectionCategoryTag icon={TrendingUp} label="Movimentos" categoryId={MOVIMENTOS_CATEGORY_ID} className="mt-1" />
        <div>
          <p className="inline-flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
            Proventos na agenda
            <InfoTooltip label="Ex-dividendos" content={EX_DIV_INFO} />
          </p>
          <h3 className="text-lg font-semibold tracking-[-0.015em] text-foreground">
            Ex-dividendos
          </h3>
          <p className="mt-1 max-w-[680px] text-xs leading-relaxed text-muted-foreground">
            Empresas que passam a negociar sem direito ao próximo provento.
            Quedas nessas ações hoje costumam ser ajuste técnico, não ruptura.
          </p>
        </div>
      </header>

      {hasToday && (
        <div className="space-y-2">
          <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
            Hoje
          </p>
          <div className="grid gap-2 md:grid-cols-2">
            {bundle.today.map((item) => (
              <ExDividendRow key={item.ticker} item={item} highlight />
            ))}
          </div>
        </div>
      )}

      {hasUpcoming && (
        <div className="space-y-2">
          <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
            Próximos 30 dias
          </p>
          <div className="grid gap-2 md:grid-cols-2">
            {bundle.upcoming.map((item) => (
              <ExDividendRow key={`${item.ticker}-${item.exDate}`} item={item} />
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

"use client";

/**
 * Ilha "Alfa setorial" — aba Movimentos de /mercado.
 *
 * Responde a pergunta: "quem destoou do próprio setor hoje?"
 *
 * Diferencial Analiso: movimento sem contexto é ruído. Uma ação subir 4%
 * num dia em que o setor inteiro sobe 3% é pouco; subir 4% num setor que
 * caiu 1% é tese idiossincrática — evento específico da empresa.
 *
 * Hierarquia (skill: cards bons têm contexto + implicação + CTA):
 *   - card mostra ticker + variação + setor + delta
 *   - delta em pp é a *implicação* (não só o número bruto)
 *   - CTA implícito: clicar vai pra /analysis/{ticker}
 *
 * Segue convenções: tokens semânticos, dark-mode, globe data-tag.
 */

import Image from "next/image";
import Link from "next/link";
import { TrendingUp, ArrowUpRight, ArrowDownRight } from "lucide-react";
import type { SectorAlphaBundle, SectorAlphaItem } from "../../interfaces/market.interfaces";
import { InfoTooltip } from "@/src/components/shared/InfoTooltip";
import { SectionCategoryTag } from "./SectionCategoryTag";

interface ExploreSectorAlphaPanelProps {
  bundle: SectorAlphaBundle | null;
}

const MOVIMENTOS_CATEGORY_ID = "movimentos";

const ALPHA_INFO =
  "Alfa setorial = variação da ação − variação média do setor, em pontos percentuais. " +
  "Destaca ações cujo movimento não é efeito de maré do setor — sinaliza tese específica da empresa.";

function formatPct(n: number): string {
  const sign = n > 0 ? "+" : "";
  return `${sign}${n.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}%`;
}

function formatAlpha(n: number): string {
  const sign = n > 0 ? "+" : "";
  return `${sign}${n.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}pp`;
}

function AlphaCard({ item }: { item: SectorAlphaItem }) {
  const positive = item.direction === "positive";
  const toneText = positive ? "text-success-text" : "text-danger-text";
  const toneBorder = positive ? "border-success-border/40" : "border-danger-border/40";
  const toneBg = positive ? "bg-success-surface/30" : "bg-danger-surface/30";
  const Icon = positive ? ArrowUpRight : ArrowDownRight;

  return (
    <Link
      href={`/analysis/${item.ticker}`}
      className={`
        group flex items-start gap-3 rounded-xl border ${toneBorder} ${toneBg} p-3.5
        transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md dark:hover:shadow-none
      `}
    >
      {item.logoUrl ? (
        <Image
          src={item.logoUrl}
          alt=""
          width={36}
          height={36}
          className="h-9 w-9 shrink-0 rounded-full border border-border bg-card object-contain"
          unoptimized
        />
      ) : (
        <div className="h-9 w-9 shrink-0 rounded-full border border-border bg-card" />
      )}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <SectionCategoryTag icon={TrendingUp} label="Movimentos" categoryId={MOVIMENTOS_CATEGORY_ID} />
          <span className="truncate text-[13px] font-semibold text-foreground">{item.ticker}</span>
          <Icon className={`h-3.5 w-3.5 ${toneText}`} aria-hidden="true" />
        </div>
        <p className="mt-0.5 truncate text-[11px] text-muted-foreground">
          {item.companyName ?? "—"}
        </p>
        <div className="mt-2 flex flex-wrap items-baseline gap-x-3 gap-y-0.5">
          <span className={`text-[15px] font-semibold tabular-nums ${toneText}`}>
            {formatPct(item.stockChangePct)}
          </span>
          <span className="text-[11px] text-muted-foreground">
            setor {formatPct(item.sectorAvgPct)}
          </span>
        </div>
        <p className="mt-1 text-[11px] text-muted-foreground">
          <span className={`font-semibold ${toneText}`}>{formatAlpha(item.alphaPct)}</span>
          {" "}vs. {item.sector ?? "setor"}
        </p>
      </div>
    </Link>
  );
}

export function ExploreSectorAlphaPanel({ bundle }: ExploreSectorAlphaPanelProps) {
  if (!bundle) return null;
  const hasPositive = bundle.positive.length > 0;
  const hasNegative = bundle.negative.length > 0;
  if (!hasPositive && !hasNegative) return null;

  return (
    <section className="space-y-4" aria-label="Alfa setorial">
      <header>
        <p className="inline-flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
          Fora da curva do setor
          <InfoTooltip label="Alfa setorial" content={ALPHA_INFO} />
        </p>
        <h3 className="text-lg font-semibold tracking-tight text-foreground">
          Alfa setorial do dia
        </h3>
        <p className="mt-1 max-w-[680px] text-[12px] leading-relaxed text-muted-foreground">
          Ações que destoaram do setor — quem subiu ou caiu bem mais do que a média.
          Movimento idiossincrático é sinal pra abrir a leitura.
        </p>
      </header>

      <div className="grid gap-4 lg:grid-cols-2">
        {hasPositive && (
          <div className="space-y-2">
            <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
              Destaques positivos
            </p>
            <div className="grid gap-2">
              {bundle.positive.map((item) => (
                <AlphaCard key={`pos-${item.ticker}`} item={item} />
              ))}
            </div>
          </div>
        )}
        {hasNegative && (
          <div className="space-y-2">
            <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
              Destaques negativos
            </p>
            <div className="grid gap-2">
              {bundle.negative.map((item) => (
                <AlphaCard key={`neg-${item.ticker}`} item={item} />
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

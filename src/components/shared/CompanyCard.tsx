"use client";

/**
 * CompanyCard
 *
 * Card presentacional reutilizável para exibir uma empresa com métricas,
 * status, botões de ação e data de atualização.
 *
 * Usado em: Buscar Mercado (Explore), Busca Avançada, Watchlist.
 */

import { useMemo } from "react";
import Link from "next/link";
import { Bell, GitCompare, Radar } from "lucide-react";

// ─── Mapeamento de chaves conhecidas para display ────────────────────────────

interface MetricDisplay {
  label: string;
  unit: string;
  format: (v: number) => string;
  order: number;
}

const KNOWN_METRICS: Record<string, MetricDisplay> = {
  pl:              { label: "P/L",        unit: "x", format: (v) => v.toFixed(1),  order: 1 },
  pvp:             { label: "P/VP",       unit: "x", format: (v) => v.toFixed(2),  order: 2 },
  ev_ebitda:       { label: "EV/EBITDA",  unit: "x", format: (v) => v.toFixed(1),  order: 3 },
  dy:              { label: "DY",         unit: "%", format: (v) => v.toFixed(1),  order: 4 },
  roe:             { label: "ROE",        unit: "%", format: (v) => v.toFixed(1),  order: 5 },
  roic:            { label: "ROIC",       unit: "%", format: (v) => v.toFixed(1),  order: 6 },
  margem_liquida:  { label: "Margem Líq.", unit: "%", format: (v) => v.toFixed(1), order: 7 },
  divida_ebitda:   { label: "Dív/EBITDA", unit: "x", format: (v) => v.toFixed(1), order: 8 },
};

// Mantido para compatibilidade com código externo que usa resolveMetricValue
export const COMPANY_CARD_METRICS = Object.entries(KNOWN_METRICS).map(([key, m]) => ({
  keys: [key],
  label: m.label,
  unit: m.unit,
  format: m.format,
}));

export function resolveMetricValue(
  metrics: Record<string, number>,
  keys: string[],
): number | undefined {
  for (const k of keys) {
    if (metrics[k] != null) return metrics[k];
  }
  return undefined;
}

// ─── Status colors ───────────────────────────────────────────────────────────

type CompanyStatus = "Saudável" | "Atenção" | "Risco";

const statusColors: Record<CompanyStatus, string> = {
  Saudável: "border-success-border bg-success-surface text-success-text",
  Atenção: "border-warning-border bg-warning-surface text-warning-text",
  Risco: "border-danger-border bg-danger-surface text-danger-text",
};

const statusBorderLeft: Record<CompanyStatus, string> = {
  Saudável: "border-l-emerald-400 dark:border-l-emerald-500",
  Atenção: "border-l-amber-400 dark:border-l-amber-500",
  Risco: "border-l-rose-400 dark:border-l-rose-500",
};

// ─── Props ────────────────────────────────────────────────────────────────────

export interface CompanyCardProps {
  ticker: string;
  companyName: string;
  logoUrl?: string | null;
  price?: number | null;
  status?: CompanyStatus;
  sector?: string;
  metrics?: Record<string, number>;
  /** Data de atualização dos dados (ex: "2024-12-15" ou "há 3 dias") */
  updatedAt?: string;
  /** Rota de destino ao clicar no card. Padrão: /empresa/:ticker */
  href?: string;

  // ─── Campos contextuais (do /api/explore) ────────────────────────────────
  /** Título curto da situação (ex: "Retorno sob pressão") */
  headline?: string | null;
  /** Motivo resumido / diagnóstico (ex: "Retorno: 35/100 na leitura atual") */
  shortDiagnosis?: string | null;
  /** Por que vale abrir agora (ex: "Vale abrir para avaliar se a queda de retorno afeta a tese.") */
  whyOpen?: string | null;

  // ─── Botões de ação (aparecem apenas quando callback é fornecido) ────────
  isComparing?: boolean;
  isFavorite?: boolean;
  /** Quando true, o card inteiro vira o botão de comparar (primeiro clique). */
  compareIsFirstAction?: boolean;
  onToggleCompare?: () => void;
  onToggleFavorite?: () => void;
  onAlert?: () => void;
}

// ─── Componente ───────────────────────────────────────────────────────────────

export function CompanyCard({
  ticker,
  companyName,
  logoUrl,
  price,
  status,
  sector,
  metrics = {},
  updatedAt,
  href,
  headline,
  shortDiagnosis,
  whyOpen,
  isComparing,
  isFavorite,
  compareIsFirstAction,
  onToggleCompare,
  onToggleFavorite,
  onAlert,
}: CompanyCardProps) {
  const destination = href ?? `/empresa/${ticker}`;
  const cardIsCompareTarget = compareIsFirstAction && onToggleCompare && !isComparing;

  const visibleMetrics = useMemo(() => {
    return Object.entries(KNOWN_METRICS).map(([key, meta]) => ({
      key,
      value: metrics[key] ?? null,
      label: meta.label,
      unit: meta.unit,
      format: meta.format,
      order: meta.order,
    }));
  }, [metrics]);

  const hasActions = onToggleCompare || onToggleFavorite || onAlert;

  const cardClassName = `group flex cursor-pointer flex-col gap-4 rounded-[18px] border border-border bg-card p-5 shadow-[0_2px_8px_rgba(15,23,40,0.04)] dark:shadow-none ${
    cardIsCompareTarget ? "ring-1 ring-brand/20 hover:ring-brand/40" : ""
  }`;

  const cardContent = (
    <>
      {/* ── Header: logo + info + badges ── */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 items-start gap-3.5">
          {logoUrl ? (
            <img
              src={logoUrl}
              alt={`Logo ${ticker}`}
              className="h-10 w-10 shrink-0 rounded-[14px] border border-border bg-muted object-cover p-0.5"
            />
          ) : (
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[14px] border border-border bg-muted text-[12px] font-semibold text-muted-foreground">
              {ticker.slice(0, 2)}
            </span>
          )}
          <div className="min-w-0">
            <div className="flex items-baseline gap-2">
              <h3 className="truncate text-[15px] font-semibold leading-5 text-foreground">
                {companyName}
              </h3>
              <span className="shrink-0 text-[13px] font-medium text-muted-foreground">
                {ticker}
              </span>
            </div>
            {price != null && (
              <p className="mt-0.5 text-[13px] tabular-nums text-foreground">
                R$ {price.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            )}
          </div>
        </div>

        {status && (
          <span
            className={`inline-flex shrink-0 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${statusColors[status]}`}
          >
            {status}
          </span>
        )}
      </div>

      {/* ── Contexto: headline, diagnóstico e motivo para abrir ── */}
      {(headline || shortDiagnosis || whyOpen) && (
        <div className="space-y-1.5 border-t border-border pt-3">
          {headline && (
            <p className="text-[13px] font-semibold leading-5 text-foreground">
              {headline}
            </p>
          )}
          {shortDiagnosis && (
            <p className="text-[12px] leading-[1.4] text-muted-foreground">
              {shortDiagnosis}
            </p>
          )}
          {whyOpen && (
            <p className="text-[12px] leading-[1.4] text-brand">
              {whyOpen}
            </p>
          )}
        </div>
      )}

      {/* ── Métricas financeiras + setor ── */}
      {(visibleMetrics.length > 0 || sector != null) && (
        <div className="flex flex-wrap items-center gap-y-2 border-t border-border pt-3">
          {visibleMetrics.map((m) => (
            <div
              key={m.key}
              className="flex flex-col border-r border-border pr-5 mr-5 last:border-r-0 last:mr-0 last:pr-0"
            >
              <span className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                {m.label}
              </span>
              <span className="text-[13px] tabular-nums text-foreground">
                {m.value != null ? `${m.format(m.value)}${m.unit}` : "—"}
              </span>
            </div>
          ))}
          {sector && (
            <div className="flex flex-col">
              <span className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                Setor
              </span>
              <span className="text-[13px] text-foreground">{sector}</span>
            </div>
          )}
        </div>
      )}

      {/* ── Data de atualização ── */}
      {updatedAt && (
        <p className="text-[11px] text-muted-foreground">
          Atualizado em{" "}
          {new Date(updatedAt).toLocaleString("pt-BR", {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })}
        </p>
      )}

      {/* ── Botões de ação ── */}
      {hasActions && (
        <div className="flex items-center gap-2">
          {onToggleCompare && (
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onToggleCompare();
              }}
              className={`group/btn inline-flex items-center gap-0 rounded-[10px] border p-2 text-[12px] font-medium transition-[color,background-color,border-color,box-shadow] duration-150 ease-[var(--ease-out)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 ${
                isComparing
                  ? "border-brand bg-brand text-white"
                  : "border-border bg-card text-foreground shadow-[0_1px_2px_rgba(15,23,40,0.05)] hover:border-brand hover:bg-brand/5 hover:text-brand dark:shadow-none"
              }`}
            >
              <GitCompare className="h-3.5 w-3.5 shrink-0" />
              <span className="pointer-events-none max-w-0 overflow-hidden whitespace-nowrap opacity-0 transition-[max-width,opacity,margin] duration-200 ease-[var(--ease-out)] group-hover/btn:ml-1.5 group-hover/btn:max-w-[80px] group-hover/btn:opacity-100">
                {isComparing ? "Comparando" : "Comparar"}
              </span>
            </button>
          )}
          {onToggleFavorite && (
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onToggleFavorite();
              }}
              className={`group/fav inline-flex items-center gap-0 rounded-[10px] border p-2 text-[12px] font-medium transition-[color,background-color,border-color,box-shadow] duration-150 ease-[var(--ease-out)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 ${
                isFavorite
                  ? "border-brand bg-brand text-white hover:border-danger-border hover:bg-danger-surface hover:text-danger-text"
                  : "border-border bg-card text-foreground shadow-[0_1px_2px_rgba(15,23,40,0.05)] hover:border-brand hover:bg-brand/5 hover:text-brand dark:shadow-none"
              }`}
            >
              <Radar className="h-3.5 w-3.5 shrink-0" />
              <span className="pointer-events-none max-w-0 overflow-hidden whitespace-nowrap opacity-0 transition-[max-width,opacity,margin] duration-200 ease-[var(--ease-out)] group-hover/fav:ml-1.5 group-hover/fav:max-w-[80px] group-hover/fav:opacity-100">
                {isFavorite ? "Remover" : "Watchlist"}
              </span>
            </button>
          )}
          {onAlert && (
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onAlert();
              }}
              className="group/bell inline-flex items-center gap-0 rounded-[10px] border border-border bg-card p-2 text-[12px] font-medium text-foreground shadow-[0_1px_2px_rgba(15,23,40,0.05)] transition-[color,background-color,border-color,box-shadow] duration-150 ease-[var(--ease-out)] hover:border-brand hover:bg-brand/5 hover:text-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 dark:shadow-none"
            >
              <Bell className="h-3.5 w-3.5 shrink-0" />
              <span className="pointer-events-none max-w-0 overflow-hidden whitespace-nowrap opacity-0 transition-[max-width,opacity,margin] duration-200 ease-[var(--ease-out)] group-hover/bell:ml-1.5 group-hover/bell:max-w-[80px] group-hover/bell:opacity-100">
                Notificar
              </span>
            </button>
          )}
        </div>
      )}

    </>
  );

  if (cardIsCompareTarget) {
    return (
      <div
        role="button"
        tabIndex={0}
        onClick={() => onToggleCompare!()}
        onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onToggleCompare!(); } }}
        className={cardClassName}
      >
        {cardContent}
      </div>
    );
  }

  return (
    <Link href={destination} className={cardClassName}>
      {cardContent}
    </Link>
  );
}

"use client";

/**
 * CompareEmptyState
 *
 * Empty state da tela de comparação. Substitui o texto-de-manual antigo por
 * 3 sugestões clicáveis pré-prontas — corta TTV (Time to Value) de minutos
 * para ~3 segundos e ativa Default Effect + reduz Paradox of Choice.
 *
 * Cada sugestão dispara `onSelectSuggestion`, que liga o "Modo Lego"
 * automaticamente (via lógica de primeira visita no useCompare).
 */

import { useEffect } from "react";
import { ArrowRight, Plus, Sparkles } from "lucide-react";
import { getCompanyLogo } from "@/src/features/explore/services";
import { COMPARE_SUGGESTIONS, trackCompare, type CompareSuggestion } from "../services";

interface CompareEmptyStateProps {
  /** Chamado quando o usuário escolhe um par sugerido. */
  onSelectSuggestion: (tickers: readonly string[], label: string) => void;
  /** Chamado quando o usuário prefere escolher manualmente (abre o modal). */
  onPickManually: () => void;
}

export function CompareEmptyState({
  onSelectSuggestion,
  onPickManually,
}: CompareEmptyStateProps) {
  // Telemetria: registra que o empty state foi visto. Isso permite calcular
  // taxa de clique nas sugestões (CTR) vs total de impressões.
  useEffect(() => {
    trackCompare("compare_empty_state_viewed");
  }, []);

  return (
    <section className="compare-island compare-surface p-10">
      <div className="mx-auto max-w-[760px] text-center">
        <div className="mx-auto mb-4 inline-flex h-10 w-10 items-center justify-center rounded-full bg-brand-surface">
          <Sparkles className="h-5 w-5 text-brand-text" />
        </div>
        <h2 className="text-[28px] font-semibold tracking-[-0.02em] text-foreground">
          Compare duas empresas em 5 segundos
        </h2>
        <p className="mx-auto mt-3 max-w-[560px] text-[15px] leading-7 text-muted-foreground">
          Escolha um dos confrontos abaixo e a Analiso monta a comparação para
          você — pilar por pilar, com leitura guiada.
        </p>

        {/* Sugestões */}
        <div className="mt-8 grid gap-3 sm:grid-cols-3">
          {COMPARE_SUGGESTIONS.map((suggestion) => (
            <SuggestionCard
              key={suggestion.tickers.join("-")}
              suggestion={suggestion}
              onClick={() =>
                onSelectSuggestion(suggestion.tickers, suggestion.label)
              }
            />
          ))}
        </div>

        {/* Escape hatch — escolher manualmente */}
        <button
          onClick={onPickManually}
          className="mt-6 inline-flex items-center gap-1.5 rounded-full border border-dashed border-border bg-card px-4 py-2 text-[13px] font-medium text-muted-foreground transition hover:border-brand hover:text-foreground"
        >
          <Plus className="h-3.5 w-3.5" />
          Escolher outras empresas
        </button>
      </div>
    </section>
  );
}

/* ── Card de sugestão individual ─────────────────────────────────────────── */

function SuggestionCard({
  suggestion,
  onClick,
}: {
  suggestion: CompareSuggestion;
  onClick: () => void;
}) {
  const [tickerA, tickerB] = suggestion.tickers;
  const logoA = getCompanyLogo(tickerA);
  const logoB = getCompanyLogo(tickerB);

  return (
    <button
      onClick={onClick}
      className="group flex h-full flex-col items-start gap-3 rounded-[20px] border border-border bg-card p-4 text-left transition-all hover:-translate-y-0.5 hover:border-brand hover:shadow-[0_12px_28px_rgba(15,23,40,0.10)]"
    >
      {/* Logos lado a lado */}
      <div className="flex items-center gap-2">
        <TickerBadge ticker={tickerA} logo={logoA} />
        <span className="text-[11px] font-semibold text-muted-foreground">vs</span>
        <TickerBadge ticker={tickerB} logo={logoB} />
      </div>

      <div className="flex-1">
        <p className="text-[14px] font-semibold text-foreground">
          {suggestion.label}
        </p>
        <p className="mt-1 text-[12px] leading-5 text-muted-foreground">
          {suggestion.description}
        </p>
      </div>

      <span className="inline-flex items-center gap-1 text-[12px] font-medium text-brand-text transition group-hover:gap-1.5">
        Comparar
        <ArrowRight className="h-3.5 w-3.5" />
      </span>
    </button>
  );
}

function TickerBadge({ ticker, logo }: { ticker: string; logo: string | undefined }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-muted px-2 py-1 text-[11px] font-semibold text-foreground">
      {logo ? (
        <img
          src={logo}
          alt={ticker}
          className="h-[18px] w-[18px] rounded-full border border-border bg-muted object-cover"
        />
      ) : (
        <span className="inline-flex h-[18px] w-[18px] items-center justify-center rounded-full bg-background text-[9px] font-bold text-muted-foreground">
          {ticker.slice(0, 1)}
        </span>
      )}
      {ticker}
    </span>
  );
}

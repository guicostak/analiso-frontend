"use client";

/**
 * AnalysisVerdictIsland
 *
 * Resolve a maior dor da tela /analysis/[ticker]: o usuário entrava e não
 * tinha headline. Precisava scrollar 3 telas montando o veredito sozinho —
 * violando Primacy Effect e Serial Position.
 *
 * Essa ilha fica imediatamente abaixo da Company Card, ACIMA do Luiz AI,
 * e responde as 3 perguntas que o usuário tem em 7 segundos:
 *   1. É boa?        → headline auto-gerado dos scores.
 *   2. Por quê?      → 2 pilares mais fortes + 1 ponto de atenção.
 *   3. E agora?      → 3 chips de ação (Prompt do Modelo Fogg).
 *
 * Vieses ativados:
 *  - Primacy Effect (o headline ancora toda a leitura seguinte).
 *  - Prompt Fogg (ação oferecida no pico de motivação).
 *  - Labor Illusion (mostramos que os scores vieram de trabalho de análise).
 *  - Default Effect (os chips dão rota padrão, reduz Paradox of Choice).
 *
 * A Analiso NÃO recomenda compra/venda — os chips guiam a LEITURA, não a
 * decisão. Textos são informativos, nunca prescritivos.
 */

import { TrendingUp, ArrowRight, Bookmark, GitCompareArrows } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import type { AnalysisData, DimensionScore, SnowflakeDimension, AnalysisTab } from "../interfaces";
import { trackAnalysis } from "../services";

/* ── Labels localizados por pilar ─────────────────────────────────────────── */

const PILLAR_LABEL: Record<SnowflakeDimension, string> = {
  value: "Valuation",
  future: "Crescimento futuro",
  past: "Performance passada",
  health: "Saúde financeira",
  dividend: "Dividendos",
};

/** Adjetivo curto usado na montagem do headline. */
const PILLAR_STRENGTH: Record<SnowflakeDimension, string> = {
  value: "preço atraente",
  future: "crescimento projetado",
  past: "histórico consistente",
  health: "saúde financeira sólida",
  dividend: "bons dividendos",
};

const PILLAR_WEAKNESS: Record<SnowflakeDimension, string> = {
  value: "preço pouco atraente",
  future: "crescimento fraco",
  past: "performance histórica fraca",
  health: "saúde financeira frágil",
  dividend: "dividendos limitados",
};

/* ── Headline auto-gerado ─────────────────────────────────────────────────── */

type RankedPillar = DimensionScore & { normalized: number };

function rankPillars(snowflake: DimensionScore[]): RankedPillar[] {
  return [...snowflake]
    .map((d) => ({
      ...d,
      normalized: d.checks?.length ? d.score / d.checks.length : 0,
    }))
    .sort((a, b) => b.normalized - a.normalized);
}

function buildHeadline(companyName: string, ranked: RankedPillar[]): string {
  if (ranked.length === 0) return `${companyName} ainda não tem dados suficientes para um veredito.`;

  const top = ranked[0];
  const second = ranked[1];
  const bottom = ranked[ranked.length - 1];

  const topStrong = top.normalized >= 0.6;
  const bottomWeak = bottom.normalized < 0.4;

  // Caso 1: Tem pilar forte e pilar fraco — narrativa dual.
  if (topStrong && bottomWeak && top.dimension !== bottom.dimension) {
    const strong = PILLAR_STRENGTH[top.dimension];
    const weak = PILLAR_WEAKNESS[bottom.dimension];
    return `${companyName} se destaca por ${strong}, mas tem ${weak}.`;
  }

  // Caso 2: Tudo forte.
  if (topStrong && (!second || second.normalized >= 0.5)) {
    return `${companyName} apresenta indicadores sólidos em múltiplos pilares.`;
  }

  // Caso 3: Tudo fraco.
  if (!topStrong && bottomWeak) {
    return `${companyName} mostra fragilidades em vários pilares — interprete com cautela.`;
  }

  // Caso 4: Médio.
  return `${companyName} tem desempenho misto — alguns pilares à frente, outros atrás.`;
}

/* ── Confiança dos dados ───────────────────────────────────────────────────── */

function assessConfidence(snowflake: DimensionScore[]): {
  label: "Alta" | "Media" | "Baixa";
  explanation: string;
} {
  const totalChecks = snowflake.reduce((acc, p) => acc + (p.checks?.length ?? 0), 0);
  const pillarsWithData = snowflake.filter((p) => (p.checks?.length ?? 0) > 0).length;

  if (pillarsWithData >= 5 && totalChecks >= 25) {
    return {
      label: "Alta",
      explanation: "Cobertura completa dos 5 pilares com dados atualizados",
    };
  }
  if (pillarsWithData >= 3) {
    return {
      label: "Media",
      explanation: "Alguns pilares com dados parciais",
    };
  }
  return {
    label: "Baixa",
    explanation: "Dados limitados — interprete com cautela",
  };
}

/* ── Main component ────────────────────────────────────────────────────────── */

interface AnalysisVerdictIslandProps {
  data: AnalysisData;
  /** Navegar para uma seção específica da página (clique em pilar ou chip). */
  onSelectTab: (tab: AnalysisTab) => void;
}

const FAV_KEY = (ticker: string) => `fav:${ticker}`;

export function AnalysisVerdictIsland({
  data,
  onSelectTab,
}: AnalysisVerdictIslandProps) {
  const router = useRouter();
  const [faved, setFaved] = useState(false);

  const ticker = data.company.ticker;

  useEffect(() => {
    trackAnalysis("analysis_viewed", { ticker });
    if (typeof window === "undefined") return;
    try {
      setFaved(window.localStorage.getItem(FAV_KEY(ticker)) === "1");
    } catch {
      /* noop */
    }
  }, [ticker]);

  const snowflake = data.snowflake ?? [];
  const ranked = rankPillars(snowflake);
  const headline = buildHeadline(data.company.name, ranked);
  const confidence = assessConfidence(snowflake);

  const confClass =
    confidence.label === "Alta"
      ? "border-success-border bg-success-surface text-success-text"
      : confidence.label === "Media"
        ? "border-warning-border bg-warning-surface text-warning-text"
        : "border-danger-border bg-danger-surface text-danger-text";

  // CTA principal do veredito: leva o user ao pilar MAIS FORTE — onde a
  // história positiva está e onde a leitura tende a começar.
  const topPillar = ranked[0];

  const handleSeeFactors = () => {
    if (!topPillar) return;
    trackAnalysis("analysis_verdict_action", {
      ticker,
      action: "see-factors",
      pillar: topPillar.dimension,
    });
    onSelectTab(topPillar.dimension as AnalysisTab);
  };

  const handleSave = () => {
    const next = !faved;
    setFaved(next);
    try {
      if (next) window.localStorage.setItem(FAV_KEY(ticker), "1");
      else window.localStorage.removeItem(FAV_KEY(ticker));
    } catch {
      /* noop */
    }
    trackAnalysis("analysis_verdict_action", {
      ticker,
      action: "save",
      added: next,
    });
  };

  const handleCompare = () => {
    trackAnalysis("analysis_verdict_action", { ticker, action: "compare" });
    router.push(`/comparar?a=${encodeURIComponent(ticker)}`);
  };

  return (
    <div className="analysis-card relative overflow-hidden p-6 md:p-7">
      {/* Gradientes radiais decorativos (brand + atenção) */}
      <div
        className="pointer-events-none absolute -top-24 -right-24 h-64 w-64 rounded-full opacity-[0.06]"
        style={{
          background:
            "radial-gradient(circle, var(--brand) 0%, transparent 70%)",
        }}
      />
      <div
        className="pointer-events-none absolute -bottom-16 -left-16 h-48 w-48 rounded-full opacity-[0.04]"
        style={{
          background:
            "radial-gradient(circle, var(--compare-b, var(--brand)) 0%, transparent 70%)",
        }}
      />

      <div className="relative space-y-5">
        {/* ── Título ── */}
        <div>
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-brand-surface">
              <TrendingUp className="h-4 w-4 text-brand-text" />
            </div>
            <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
              {ticker} em uma frase
            </span>
          </div>
          <h2 className="mt-3 text-[18px] font-semibold leading-snug text-foreground md:text-[19px]">
            {headline}
          </h2>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span
              className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[11px] font-medium ${confClass}`}
            >
              Confiança dos dados: {confidence.label}
            </span>
            <span className="text-[11px] text-muted-foreground">
              — {confidence.explanation}
            </span>
          </div>
        </div>

        {/* ── Próximas ações (Prompt do Modelo Fogg) ──
            Os scores por pilar NÃO são renderizados aqui — o radar + mini-cards
            do BaseSection ("Visão geral dos pilares") já fazem esse trabalho
            visual mais abaixo. Duplicar seria redundante. Aqui oferecemos
            apenas o próximo passo de leitura no momento de motivação alta. */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          {topPillar && (
            <button
              onClick={handleSeeFactors}
              className="inline-flex items-center gap-1.5 rounded-full border border-brand bg-brand/10 px-3.5 py-1.5 text-[12px] font-semibold text-brand-text transition hover:bg-brand/15"
            >
              Ver por que {PILLAR_LABEL[topPillar.dimension].toLowerCase()}
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          )}
          <button
            onClick={handleSave}
            className={`inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-[12px] font-medium transition ${
              faved
                ? "border-brand bg-brand-surface text-brand-text"
                : "border-border bg-card text-muted-foreground hover:border-brand hover:text-foreground"
            }`}
          >
            <Bookmark className="h-3.5 w-3.5" fill={faved ? "currentColor" : "none"} />
            {faved ? "Salva" : "Salvar"}
          </button>
          <button
            onClick={handleCompare}
            className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3.5 py-1.5 text-[12px] font-medium text-muted-foreground transition hover:border-brand hover:text-foreground"
          >
            <GitCompareArrows className="h-3.5 w-3.5" />
            Comparar {ticker} com outra
          </button>
        </div>
      </div>
    </div>
  );
}

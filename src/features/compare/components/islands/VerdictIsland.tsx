"use client";

import { CheckCircle2, AlertTriangle, TrendingUp, Bookmark, Repeat, ArrowRight } from "lucide-react";
import type {
  CompareVerdict,
  CompareScoreboard,
  CompareSummary,
} from "../../interfaces";
import { PILLAR_LABEL, trackCompare } from "../../services";

/* ── Dumbbell Visual ─────────────────────────────────────────────────────── */

function PillarDumbbell({
  label,
  scoreA,
  scoreB,
  tickerA,
  tickerB,
}: {
  label: string;
  scoreA: number;
  scoreB: number;
  tickerA: string;
  tickerB: string;
}) {
  const max = 10;
  const posA = (scoreA / max) * 100;
  const posB = (scoreB / max) * 100;

  return (
    <div className="space-y-2">
      <span className="text-[11px] font-medium text-muted-foreground">
        {label}
      </span>
      <div className="relative h-3 w-full rounded-full bg-muted">
        <div
          className="absolute top-1/2 h-0.5 -translate-y-1/2 bg-border"
          style={{
            left: `${Math.min(posA, posB)}%`,
            width: `${Math.abs(posA - posB)}%`,
          }}
        />
        <div
          className="absolute top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white"
          style={{ left: `${posA}%`, backgroundColor: "var(--brand)" }}
          title={`${tickerA}: ${scoreA}`}
        />
        <div
          className="absolute top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white"
          style={{ left: `${posB}%`, backgroundColor: "var(--compare-b)" }}
          title={`${tickerB}: ${scoreB}`}
        />
      </div>
      <div className="flex justify-between text-[10px] text-muted-foreground">
        <span>
          {tickerA}: {scoreA.toFixed(1)}
        </span>
        <span>
          {tickerB}: {scoreB.toFixed(1)}
        </span>
      </div>
    </div>
  );
}

/* ── Main Component ───────────────────────────────────────────────────────── */

interface VerdictIslandProps {
  verdict: CompareVerdict;
  scoreboard: CompareScoreboard;
  summary?: CompareSummary | null;
  formatNumber: (value: number, digits?: number) => string;
  /** Próximas ações (Prompt Fogg). Quando ausentes, os chips não renderizam. */
  onSeeFactors?: () => void;
  onSave?: () => void;
  onSwapAndPick?: (winnerTicker: string) => void;
}

export function VerdictIsland({
  verdict,
  scoreboard,
  summary,
  formatNumber,
  onSeeFactors,
  onSave,
  onSwapAndPick,
}: VerdictIslandProps) {
  const { winner, loser, biggestGap, keyRisk, reasons, consequence, confidence } =
    verdict;

  const confClass =
    confidence === "Alta"
      ? "border-success-border bg-success-surface text-success-text"
      : confidence === "Media"
        ? "border-warning-border bg-warning-surface text-warning-text"
        : "border-danger-border bg-danger-surface text-danger-text";

  const confExplanation =
    confidence === "Alta"
      ? "Dados atualizados e cobertura completa nas fontes oficiais"
      : confidence === "Media"
        ? "Algumas lacunas nos dados ou atualização parcial"
        : "Dados limitados — interprete com cautela";

  return (
    <div className="compare-island compare-surface relative overflow-hidden p-6 scroll-mt-[160px]">
      {/* Radial gradient decorations */}
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
            "radial-gradient(circle, var(--compare-b) 0%, transparent 70%)",
        }}
      />

      <div className="relative space-y-6">
        {/* ── Título ── */}
        <div>
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-brand-surface">
              <TrendingUp className="h-4 w-4 text-brand-text" />
            </div>
            <h2 className="text-lg font-semibold text-foreground">
              {winner.ticker} é a escolha mais forte
            </h2>
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span
              className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[11px] font-medium ${confClass}`}
            >
              Confiança dos dados: {confidence}
            </span>
            <span className="text-[11px] text-muted-foreground">
              — {confExplanation}
            </span>
            {summary ? (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1 text-[11px] font-medium text-muted-foreground">
                Pilares —
                <span className="font-semibold text-brand-text">
                  {summary.tickerA} {summary.pillarsWonByA}
                </span>
                <span aria-hidden="true">·</span>
                <span className="font-semibold" style={{ color: "var(--compare-b-text, var(--compare-b))" }}>
                  {summary.tickerB} {summary.pillarsWonByB}
                </span>
                {summary.pillarsTied > 0 ? (
                  <>
                    <span aria-hidden="true">·</span>
                    <span>Empates {summary.pillarsTied}</span>
                  </>
                ) : null}
              </span>
            ) : null}
          </div>
        </div>

        {/* ── Razões ── */}
        <div className="space-y-3">
          {reasons.map((reason, i) => (
            <div key={i} className="flex items-start gap-3">
              <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-success-surface">
                <CheckCircle2 className="h-3.5 w-3.5 text-success-text" />
              </div>
              <p className="text-sm leading-relaxed text-foreground">
                {reason}
              </p>
            </div>
          ))}
        </div>

        {/* ── Maior diferença + Risco chave ── */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {/* Maior diferença */}
          <div className="space-y-3 rounded-2xl border border-border bg-muted/50 p-4">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                Maior diferença entre pilares
              </span>
              <span className="inline-flex items-center gap-1 rounded-full border border-border bg-card px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                {PILLAR_LABEL[biggestGap.p]}
              </span>
            </div>
            <PillarDumbbell
              label={PILLAR_LABEL[biggestGap.p]}
              scoreA={biggestGap.da.score}
              scoreB={biggestGap.db.score}
              tickerA={biggestGap.winner.ticker === winner.ticker ? winner.ticker : loser.ticker}
              tickerB={biggestGap.winner.ticker === winner.ticker ? loser.ticker : winner.ticker}
            />
            <span className="inline-flex items-center gap-1.5 rounded-full border border-danger-border bg-danger-surface px-3 py-1 text-[11px] font-medium text-danger-text">
              Diferença de {formatNumber(biggestGap.delta, 1)} pts
            </span>
          </div>

          {/* Risco chave */}
          <div className="space-y-3 rounded-2xl border border-warning-border bg-warning-surface/30 p-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-warning-text" />
              <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                Ponto de atenção
              </span>
            </div>
            <p className="text-sm text-foreground">
              <span className="font-semibold">{keyRisk.loser.ticker}</span> tem
              o menor score em{" "}
              <span className="font-semibold">
                {PILLAR_LABEL[keyRisk.p]}
              </span>
            </p>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-warning-border bg-warning-surface px-3 py-1 text-[11px] font-medium text-warning-text">
              Score: {formatNumber(keyRisk.lowestScore, 1)}/10
            </span>
          </div>
        </div>

        {/* ── Consequência ── */}
        <p className="text-sm leading-relaxed text-muted-foreground">
          {consequence}
        </p>

        {/* ── Próximas ações (Prompt do Modelo Fogg) ──
            Sem essas, o usuário lê o veredito e fica órfão de próxima ação.
            Cada chip é um caminho natural de continuação da leitura — a Analiso
            NÃO recomenda compra/venda, só guia a próxima leitura. */}
        {(onSeeFactors || onSave || onSwapAndPick) && (
          <div className="flex flex-wrap items-center gap-2 pt-1">
            {onSeeFactors && (
              <button
                onClick={() => {
                  trackCompare("compare_verdict_action", { action: "see-factors" });
                  onSeeFactors();
                }}
                className="inline-flex items-center gap-1.5 rounded-full border border-brand bg-brand/10 px-3.5 py-1.5 text-[12px] font-semibold text-brand-text transition hover:bg-brand/15"
              >
                Por que {winner.ticker} venceu?
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            )}
            {onSave && (
              <button
                onClick={() => {
                  trackCompare("compare_verdict_action", { action: "save" });
                  onSave();
                }}
                className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3.5 py-1.5 text-[12px] font-medium text-muted-foreground transition hover:border-brand hover:text-foreground"
              >
                <Bookmark className="h-3.5 w-3.5" />
                Salvar comparação
              </button>
            )}
            {onSwapAndPick && (
              <button
                onClick={() => {
                  trackCompare("compare_verdict_action", { action: "swap" });
                  onSwapAndPick(winner.ticker);
                }}
                className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3.5 py-1.5 text-[12px] font-medium text-muted-foreground transition hover:border-brand hover:text-foreground"
              >
                <Repeat className="h-3.5 w-3.5" />
                Comparar {winner.ticker} com outra
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

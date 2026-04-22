"use client";

/**
 * Painel de risco / humor — 6 mini-cards uniformes:
 *   Volatilidade · Breadth · Fear & Greed · VIX · DXY · Curva DI (em breve)
 *
 * Recebe dados já mapeados (RiskPanel). Zero lógica de negócio.
 * Cada mini-card trata ausência (null) com estado informativo.
 */

import { Activity, Gauge, Scale, TrendingUp, DollarSign, LineChart as LineIcon } from "lucide-react";
import type { ReactNode } from "react";
import type {
  RiskPanel,
  VolatilityMini,
  BreadthIndicator,
  FearGreedIndicator,
  IndexMini,
} from "../../interfaces/market.interfaces";

interface ExploreRiskPanelProps {
  riskPanel: RiskPanel | null;
}

interface MiniCardProps {
  icon:     ReactNode;
  label:    string;
  children: ReactNode;
  hint?:    string;
}

function MiniCard({ icon, label, children, hint }: MiniCardProps) {
  return (
    <article
      className="
        flex min-h-[120px] flex-col gap-2 rounded-2xl border border-border bg-card p-4
        shadow-sm dark:shadow-none
        transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md dark:hover:shadow-none
      "
    >
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
          {label}
        </span>
        <span className="text-muted-foreground/60">{icon}</span>
      </div>
      <div className="flex-1">{children}</div>
      {hint && <p className="text-[11px] leading-relaxed text-muted-foreground">{hint}</p>}
    </article>
  );
}

function EmptyValue({ text }: { text?: string }) {
  return (
    <span className="text-sm text-muted-foreground">
      {text ?? "Dado indisponível"}
    </span>
  );
}

// ── Sub-cards ─────────────────────────────────────────────────────────────

function VolatilityCard({ vol }: { vol: VolatilityMini | null }) {
  if (!vol || vol.score == null) {
    return (
      <MiniCard icon={<Activity size={14} />} label="Volatilidade">
        <EmptyValue />
      </MiniCard>
    );
  }
  const toneClass =
    vol.statusKey === "low"
      ? "text-success-text"
      : vol.statusKey === "high"
      ? "text-danger-text"
      : "text-warning-text";

  return (
    <MiniCard
      icon={<Activity size={14} />}
      label="Volatilidade"
      hint={vol.metaLine ?? undefined}
    >
      <div className="flex items-baseline gap-2">
        <span className="text-2xl font-semibold tabular-nums text-foreground">
          {vol.score}
        </span>
        <span className={`text-xs font-medium ${toneClass}`}>
          {vol.statusLabel ?? "—"}
        </span>
      </div>
      {vol.indexLabel && (
        <span className="mt-0.5 block text-[11px] text-muted-foreground">
          Ancorado em {vol.indexLabel}
        </span>
      )}
    </MiniCard>
  );
}

function BreadthCard({ breadth }: { breadth: BreadthIndicator | null }) {
  if (!breadth || breadth.total === 0) {
    return (
      <MiniCard icon={<Scale size={14} />} label="Breadth">
        <EmptyValue />
      </MiniCard>
    );
  }
  const upPct = Math.round(breadth.ratioUp * 100);

  return (
    <MiniCard
      icon={<Scale size={14} />}
      label="Breadth"
      hint={`${breadth.up} em alta · ${breadth.down} em baixa`}
    >
      <div className="flex items-baseline gap-2">
        <span className="text-2xl font-semibold tabular-nums text-foreground">
          {upPct}%
        </span>
        <span className="text-xs font-medium text-muted-foreground">em alta</span>
      </div>
      <div className="mt-2 flex h-1.5 w-full overflow-hidden rounded-full bg-muted">
        <span
          className="h-full bg-success-text"
          style={{ width: `${upPct}%` }}
          aria-label={`${upPct}% em alta`}
        />
        <span
          className="h-full bg-danger-text"
          style={{ width: `${100 - upPct}%` }}
        />
      </div>
    </MiniCard>
  );
}

function FearGreedCard({ fng }: { fng: FearGreedIndicator | null }) {
  if (!fng) {
    return (
      <MiniCard icon={<Gauge size={14} />} label="Fear & Greed">
        <EmptyValue />
      </MiniCard>
    );
  }
  const score = Math.max(0, Math.min(100, fng.score));
  const toneClass =
    score >= 70 ? "text-success-text"
    : score <= 30 ? "text-danger-text"
    : "text-warning-text";

  return (
    <MiniCard
      icon={<Gauge size={14} />}
      label="Fear & Greed"
      hint={`Fonte: ${fng.source}`}
    >
      <div className="flex items-baseline gap-2">
        <span className="text-2xl font-semibold tabular-nums text-foreground">
          {score}
        </span>
        <span className={`text-xs font-medium ${toneClass}`}>{fng.label}</span>
      </div>
      <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-muted">
        <span
          className={`block h-full ${
            score >= 70 ? "bg-success-text"
            : score <= 30 ? "bg-danger-text"
            : "bg-warning-text"
          }`}
          style={{ width: `${score}%` }}
        />
      </div>
    </MiniCard>
  );
}

function IndexMiniCard({
  icon, label, hint, data,
}: {
  icon: ReactNode; label: string; hint?: string; data: IndexMini | null;
}) {
  if (!data || !data.value) {
    return (
      <MiniCard icon={icon} label={label}>
        <EmptyValue />
      </MiniCard>
    );
  }
  const toneClass =
    data.trend === "up" ? "text-success-text"
    : data.trend === "down" ? "text-danger-text"
    : "text-muted-foreground";
  return (
    <MiniCard icon={icon} label={label} hint={hint}>
      <div className="flex items-baseline gap-2">
        <span className="text-2xl font-semibold tabular-nums text-foreground">
          {data.value}
        </span>
        {data.changePct && (
          <span className={`text-xs font-medium tabular-nums ${toneClass}`}>
            {data.changePct}
          </span>
        )}
      </div>
    </MiniCard>
  );
}

function DiPlaceholderCard({ text }: { text: string | null }) {
  // Sparkline decorativa com linha tracejada sugerindo "dado em breve"
  // sem fingir ser um valor real. Gera uma curva suave levemente ondulada.
  const decorativePath = "M 0 22 C 12 18, 22 14, 34 16 S 56 20, 68 14 S 90 8, 104 12 S 126 16, 138 10";

  return (
    <MiniCard
      icon={<LineIcon size={14} />}
      label="Curva DI"
      hint="Estrutura a termo dos juros (DI1F B3)"
    >
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <span
            className="
              inline-flex items-center gap-1 rounded-full border
              border-border bg-muted px-2 py-0.5
              text-[10px] font-semibold uppercase tracking-wider text-muted-foreground
            "
          >
            <span className="h-1 w-1 rounded-full bg-muted-foreground/60" />
            Em breve
          </span>
        </div>
        <svg
          viewBox="0 0 140 32"
          className="w-full text-muted-foreground/40"
          aria-hidden="true"
        >
          <path
            d={decorativePath}
            fill="none"
            stroke="currentColor"
            strokeWidth="1.25"
            strokeDasharray="3 3"
            strokeLinecap="round"
          />
          {/* 4 pontos discretos sinalizando vértices (curto/médio/longo) */}
          {[
            [10, 20], [50, 16], [90, 11], [130, 11],
          ].map(([x, y], i) => (
            <circle
              key={i}
              cx={x}
              cy={y}
              r={1.75}
              fill="currentColor"
              opacity={0.55}
            />
          ))}
        </svg>
      </div>
    </MiniCard>
  );
}

// ── Grid ──────────────────────────────────────────────────────────────────

export function ExploreRiskPanel({ riskPanel }: ExploreRiskPanelProps) {
  if (!riskPanel) return null;

  return (
    <section className="space-y-4" aria-label="Painel de risco e humor">
      <header>
        <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
          Risco e humor
        </p>
        <h3 className="text-lg font-semibold tracking-tight text-foreground">
          Painel de risco
        </h3>
      </header>
      <div
        className="
          grid gap-4
          grid-cols-1 sm:grid-cols-2 lg:grid-cols-3
        "
      >
        <VolatilityCard vol={riskPanel.volatility} />
        <BreadthCard   breadth={riskPanel.breadth} />
        <FearGreedCard fng={riskPanel.fearGreed} />
        <IndexMiniCard
          icon={<TrendingUp size={14} />}
          label="VIX"
          hint="Volatilidade implícita — CBOE"
          data={riskPanel.vix}
        />
        <IndexMiniCard
          icon={<DollarSign size={14} />}
          label="DXY"
          hint="Índice do dólar"
          data={riskPanel.dxy}
        />
        <DiPlaceholderCard text={riskPanel.diCurvePlaceholder} />
      </div>
    </section>
  );
}

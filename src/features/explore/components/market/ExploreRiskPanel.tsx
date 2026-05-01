"use client";

/**
 * Painel de risco / humor — 6 mini-cards uniformes:
 *   Volatilidade · Breadth · Fear & Greed · VIX · DXY · Curva DI (em breve)
 *
 * Recebe dados já mapeados (RiskPanel). Zero lógica de negócio.
 * Cada mini-card trata ausência (null) com estado informativo.
 */

import { Activity, Gauge, Scale, TrendingUp, DollarSign, Globe, LineChart as LineIcon } from "lucide-react";
import type { ReactNode } from "react";
import type {
  RiskPanel,
  VolatilityMini,
  BreadthIndicator,
  FearGreedIndicator,
  IndexMini,
  DiCurve,
} from "../../interfaces/market.interfaces";
import { InfoTooltip } from "@/src/components/shared/InfoTooltip";
import { RISK_PANEL_INFO } from "../../utils/marketInfoCopy";
import { SectionCategoryTag } from "./SectionCategoryTag";

interface ExploreRiskPanelProps {
  riskPanel: RiskPanel | null;
}

interface MiniCardProps {
  icon:     ReactNode;
  label:    string;
  children: ReactNode;
  hint?:    string;
  /** Explicação exibida no ícone "i" ao lado do label. */
  info?:    string;
}

function MiniCard({ icon, label, children, hint, info }: MiniCardProps) {
  return (
    <article className="mercado-elev-sm mercado-island-hover flex min-h-[120px] flex-col gap-2 rounded-2xl border border-border bg-card p-4">
      {/* Tag silenciosa — mantém data-attr p/ analytics, sem duplicar no visual (o header do Risk Panel já sinaliza a seção) */}
      <SectionCategoryTag icon={Globe} label="Contexto" categoryId="contexto-mercado" silent />
      <div className="flex items-center justify-between">
        <span className="inline-flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
          {label}
          {info && <InfoTooltip label={label} content={info} />}
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
      <MiniCard icon={<Activity size={14} />} label="Volatilidade" info={RISK_PANEL_INFO.volatility}>
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
      info={RISK_PANEL_INFO.volatility}
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
      <MiniCard icon={<Scale size={14} />} label="Breadth" info={RISK_PANEL_INFO.breadth}>
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
      info={RISK_PANEL_INFO.breadth}
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
      <MiniCard icon={<Gauge size={14} />} label="Fear & Greed" info={RISK_PANEL_INFO.fearGreed}>
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
      info={RISK_PANEL_INFO.fearGreed}
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
  icon, label, hint, data, info,
}: {
  icon: ReactNode; label: string; hint?: string; data: IndexMini | null; info?: string;
}) {
  if (!data || !data.value) {
    return (
      <MiniCard icon={icon} label={label} info={info}>
        <EmptyValue />
      </MiniCard>
    );
  }
  const toneClass =
    data.trend === "up" ? "text-success-text"
    : data.trend === "down" ? "text-danger-text"
    : "text-muted-foreground";
  return (
    <MiniCard icon={icon} label={label} hint={hint} info={info}>
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

function DiCurveCard({ curve }: { curve: DiCurve | null }) {
  // Sem dados → placeholder "em breve" com sparkline decorativa.
  if (!curve || curve.points.length < 2) {
    const decorativePath =
      "M 0 22 C 12 18, 22 14, 34 16 S 56 20, 68 14 S 90 8, 104 12 S 126 16, 138 10";
    return (
      <MiniCard
        icon={<LineIcon size={14} />}
        label="Curva DI"
        hint="Estrutura a termo dos juros (ETTJ Anbima)"
        info={RISK_PANEL_INFO.diCurve}
      >
        <div className="flex flex-col gap-2">
          <span className="inline-flex w-fit items-center gap-1 rounded-full border border-border bg-muted px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            <span className="h-1 w-1 rounded-full bg-muted-foreground/60" />
            Em breve
          </span>
          <svg viewBox="0 0 140 32" className="w-full text-muted-foreground/40" aria-hidden="true">
            <path d={decorativePath} fill="none" stroke="currentColor" strokeWidth="1.25" strokeDasharray="3 3" strokeLinecap="round" />
          </svg>
        </div>
      </MiniCard>
    );
  }

  // Mini-chart real — x = ordinal do tenor, y = yield. Normaliza p/ viewBox 140×40.
  const pts = curve.points;
  const yields = pts.map((p) => p.yieldPct);
  const yMin = Math.min(...yields);
  const yMax = Math.max(...yields);
  const yPad = (yMax - yMin) * 0.15 || 0.1;
  const yLo = yMin - yPad;
  const yHi = yMax + yPad;
  const W = 140;
  const H = 40;
  const stepX = pts.length > 1 ? W / (pts.length - 1) : W;

  const scaleY = (y: number) =>
    H - ((y - yLo) / (yHi - yLo || 1)) * H;

  // Destaque: vértice que mais moveu vs D-1 (em bps)
  const biggestMove = pts.reduce<{ idx: number; mag: number } | null>((acc, p, i) => {
    if (p.changeBps == null) return acc;
    const m = Math.abs(p.changeBps);
    if (!acc || m > acc.mag) return { idx: i, mag: m };
    return acc;
  }, null);

  const linePath = pts
    .map((p, i) => `${i === 0 ? "M" : "L"} ${(i * stepX).toFixed(2)} ${scaleY(p.yieldPct).toFixed(2)}`)
    .join(" ");

  // Último ponto pra endpoint dot
  const last = pts[pts.length - 1];

  // Summary → cor/tom do chip
  const summaryTone =
    curve.summary === "Invertida" ? "bg-danger-surface border-danger-border text-danger-text"
    : curve.summary === "Achatada" ? "bg-warning-surface border-warning-border text-warning-text"
    : curve.summary === "Inclinada" ? "bg-success-surface border-success-border text-success-text"
    : "bg-muted border-border text-muted-foreground";

  return (
    <MiniCard
      icon={<LineIcon size={14} />}
      label="Curva DI · PRE"
      hint={`ETTJ Anbima · ${curve.asOfDate ?? ""}`}
      info={RISK_PANEL_INFO.diCurve}
    >
      <div className="flex flex-col gap-2">
        {/* Chip de forma da curva */}
        {curve.summary && (
          <span className={`inline-flex w-fit items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${summaryTone}`}>
            <span className="h-1 w-1 rounded-full bg-current" />
            {curve.summary}
          </span>
        )}

        {/* Mini-chart */}
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full" aria-hidden="true">
          <defs>
            <linearGradient id="di-curve-grad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%"   stopColor="var(--brand)" stopOpacity="0.22" />
              <stop offset="100%" stopColor="var(--brand)" stopOpacity="0" />
            </linearGradient>
          </defs>
          {/* Fill area */}
          <path
            d={`${linePath} L ${((pts.length - 1) * stepX).toFixed(2)} ${H} L 0 ${H} Z`}
            fill="url(#di-curve-grad)"
          />
          {/* Linha */}
          <path d={linePath} fill="none" stroke="var(--brand)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          {/* Pontos */}
          {pts.map((p, i) => {
            const cx = i * stepX;
            const cy = scaleY(p.yieldPct);
            const isBiggest = biggestMove?.idx === i;
            return (
              <circle
                key={p.tenorDays}
                cx={cx}
                cy={cy}
                r={isBiggest ? 2.5 : 1.5}
                fill={isBiggest ? "var(--brand)" : "var(--card)"}
                stroke="var(--brand)"
                strokeWidth={1}
              />
            );
          })}
          {/* Endpoint dot solid */}
          <circle
            cx={(pts.length - 1) * stepX}
            cy={scaleY(last.yieldPct)}
            r={2.5}
            fill="var(--brand)"
          />
        </svg>

        {/* Tenor labels abaixo do chart */}
        <div className="flex justify-between text-[9px] font-medium uppercase tracking-wider text-muted-foreground">
          {pts.map((p) => (
            <span key={p.tenorDays} className="tabular-nums">{p.tenorLabel}</span>
          ))}
        </div>

        {/* Resumo da última variação relevante */}
        {biggestMove && pts[biggestMove.idx].changeLabel && (
          <p className="text-[10px] text-muted-foreground">
            <span className="font-medium text-foreground">{pts[biggestMove.idx].tenorLabel}</span>{" "}
            moveu{" "}
            <span className={`font-semibold ${pts[biggestMove.idx].trend === "up" ? "text-danger-text" : pts[biggestMove.idx].trend === "down" ? "text-success-text" : "text-muted-foreground"}`}>
              {pts[biggestMove.idx].changeLabel}
            </span>
          </p>
        )}
      </div>
    </MiniCard>
  );
}

// ── Grid ──────────────────────────────────────────────────────────────────

export function ExploreRiskPanel({ riskPanel }: ExploreRiskPanelProps) {
  if (!riskPanel) return null;

  return (
    <section className="space-y-4" aria-label="Painel de risco e humor">
      <header className="flex items-center gap-2">
        <SectionCategoryTag icon={Globe} label="Contexto" categoryId="contexto-mercado" />
        <div>
          <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
            Risco e humor
          </p>
          <h3 className="text-lg font-semibold tracking-[-0.015em] text-foreground">
            Painel de risco
          </h3>
        </div>
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
          info={RISK_PANEL_INFO.vix}
        />
        <IndexMiniCard
          icon={<DollarSign size={14} />}
          label="DXY"
          hint="Índice do dólar"
          data={riskPanel.dxy}
          info={RISK_PANEL_INFO.dxy}
        />
        <DiCurveCard curve={riskPanel.diCurve} />
      </div>
    </section>
  );
}

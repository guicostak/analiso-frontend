"use client";

import {
  ArrowDown,
  ArrowRightLeft,
  ArrowUp,
  Bell,
  Bookmark,
  Check,
  ChevronDown,
  ChevronUp,
  Crown,
  FileText,
  Minus,
  Plus,
  Search,
  Share2,
  TriangleAlert,
  X,
} from "lucide-react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceArea,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Sidebar } from "./dashboard/sidebar";
import { AppTopBar } from "./app-top-bar";
import wegLogo from "../assets/logos/weg.jpeg";
import valeLogo from "../assets/logos/vale.png";
import { useCompare } from "../hooks/useCompare";
import { pillarCopy } from "../services/compare";
import type { CompareTrend, CompareEvidence } from "../types/compare";

// ─── UI-only style maps ───────────────────────────────────────────────────────

const TOKENS = {
  brand600: "#0E9384",
  brand700: "#0B7A6E",
  brand100: "#D9FBEF",
  bg: "#F7F8FA",
  border: "#E7EAEE",
  text900: "#0F172A",
  text600: "#475569",
  text400: "#94A3B8",
  companyA: "#0E9384",
  companyB: "#3F5F7D",
  companyB100: "#ECF3F9",
};

const SLOT_COLORS = [TOKENS.companyA, TOKENS.companyB, "#64748B", "#94A3B8"];

const trendLabel: Record<CompareTrend, string> = {
  melhorando: "Melhorando",
  estavel: "Estavel",
  piorando: "Piorando",
};

const TICKER_LOGOS: Record<string, string> = {
  WEGE3: wegLogo.src,
  VALE3: valeLogo.src,
};

// ─── Sub-components ───────────────────────────────────────────────────────────

function TickerLogo({ ticker, size = 18 }: { ticker: string; size?: number }) {
  const logo = TICKER_LOGOS[ticker];
  if (!logo) {
    return (
      <span
        className="inline-flex items-center justify-center rounded-full border border-border bg-card text-[10px] font-semibold text-muted-foreground"
        style={{ width: size, height: size }}
      >
        {ticker.slice(0, 1)}
      </span>
    );
  }
  return (
    <img
      src={logo}
      alt={`Logo ${ticker}`}
      className="rounded-full border border-border bg-card object-cover"
      style={{ width: size, height: size }}
    />
  );
}

function EvidenceDrawer({
  data,
  onClose,
  formatMetric,
}: {
  data: CompareEvidence | null;
  onClose: () => void;
  formatMetric: (value: number | null, unit: string) => string;
}) {
  if (!data) return null;
  return (
    <div className="fixed inset-0 z-50">
      <button onClick={onClose} className="absolute inset-0 bg-black/30" />
      <aside className="absolute inset-y-0 right-0 w-full max-w-[460px] overflow-y-auto border-l border-border bg-card p-6 shadow-2xl">
        <div className="mb-6 flex items-start justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.08em] text-muted-foreground">
              Evidence drawer
            </p>
            <h3 className="mt-1 text-lg font-semibold text-foreground">{data.metricName}</h3>
          </div>
          <button
            onClick={onClose}
            className="rounded-full border border-border p-1.5 text-muted-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="space-y-4 text-sm">
          <div className="rounded-xl border border-border bg-muted p-4">
            <p className="text-[12px] font-semibold text-muted-foreground">Valor atual A/B</p>
            <div className="mt-2 grid grid-cols-2 gap-3">
              <div>
                <p className="text-xs text-muted-foreground">{data.aTicker}</p>
                <p className="font-semibold">{formatMetric(data.aValue, data.unit)}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">{data.bTicker}</p>
                <p className="font-semibold">{formatMetric(data.bValue, data.unit)}</p>
              </div>
            </div>
          </div>
          <div>
            <p className="text-[12px] font-semibold text-muted-foreground">Definicao simples</p>
            <p className="mt-1 text-foreground">{data.definition}</p>
          </div>
          <div>
            <p className="text-[12px] font-semibold text-muted-foreground">Como calculamos</p>
            <p className="mt-1 text-foreground">{data.source.method}</p>
          </div>
          <div>
            <p className="text-[12px] font-semibold text-muted-foreground">Fonte</p>
            <p className="mt-1 text-foreground">
              {data.source.provider} / {data.source.document}
            </p>
          </div>
          <div>
            <p className="text-[12px] font-semibold text-muted-foreground">
              Data de atualizacao
            </p>
            <p className="mt-1 text-foreground">{data.source.updatedAt}</p>
          </div>
          {data.source.reference ? (
            <div>
              <p className="text-[12px] font-semibold text-muted-foreground">
                Trecho/identificador
              </p>
              <p className="mt-1 text-foreground">{data.source.reference}</p>
            </div>
          ) : null}
          <a
            href={data.source.link}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-xl border border-border px-3 py-2 text-sm font-medium text-foreground hover:bg-hover"
          >
            Abrir documento <Share2 className="h-3.5 w-3.5" />
          </a>
        </div>
      </aside>
    </div>
  );
}

const LoadingBlocks = () => (
  <div className="space-y-8">
    <div className="h-[160px] animate-pulse rounded-2xl border border-border bg-card" />
    <div className="h-[220px] animate-pulse rounded-2xl border border-border bg-card" />
    <div className="h-[300px] animate-pulse rounded-2xl border border-border bg-card" />
  </div>
);

const trendIcon = (t: CompareTrend) =>
  t === "melhorando" ? (
    <ArrowUp className="h-3 w-3" />
  ) : t === "piorando" ? (
    <ArrowDown className="h-3 w-3" />
  ) : (
    <Minus className="h-3 w-3" />
  );

// ─── Page component ───────────────────────────────────────────────────────────

export function ComparePage() {
  const {
    detailRef,
    verdictRef,
    selectedTickers,
    search,
    openPicker,
    activePillar,
    range,
    eventsOpen,
    qualityOpen,
    refreshing,
    evidence,
    toast,
    compactSticky,
    actionsOpen,
    selected,
    pair,
    a,
    b,
    canCompare,
    available,
    chartData,
    scoreboard,
    topPillarDiffs,
    otherPillarDiffs,
    verdict,
    tableRows,
    activePillarWinnerSummary,
    recentEvents,
    eventsOnActivePillar,
    mainExplainer,
    latestChartDelta,
    latestChartLeader,
    scoreVsChartContext,
    qualityTone,
    setSearch,
    setOpenPicker,
    setSelectedTickers,
    addTicker,
    selectPillar,
    setRange,
    setEventsOpen,
    setQualityOpen,
    setEvidence,
    setActionsOpen,
    openEvidence,
    copyShareLink,
    saveComparison,
    createAlert,
    PILLARS,
    PILLAR_LABEL,
    RANGES,
    formatMetric,
    metricDelta,
    metricWinner,
    evidenceReadLabel,
    pillarInsight,
    pillarConsequence,
    trendContext,
    formatNumber,
  } = useCompare();

  return (
    <div className="min-h-screen bg-background text-foreground" style={{ fontFamily: "Inter, sans-serif" }}>
      <div className="hidden lg:block">
        <Sidebar currentPage="comparar" />
      </div>
      <AppTopBar />
      <main className="pt-12 lg:ml-[88px]">
        <div className="px-8 py-8">
          <section className={`sticky top-12 z-30 mb-6 rounded-[18px] border border-border bg-card/95 shadow-[0_10px_24px_rgba(15,23,42,0.06)] backdrop-blur transition-all ${compactSticky ? "p-2" : "p-2.5"}`}>
            <div className="grid grid-cols-1 gap-2 xl:grid-cols-12">
              <article className="rounded-2xl border border-border bg-muted p-2.5 xl:col-span-7">
                <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
                  Setup da comparacao
                </p>
                <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                  {selected.map((c, i) => (
                    <span
                      key={c.ticker}
                      className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-3 py-1.5 text-xs font-medium text-foreground"
                    >
                      <span
                        className="h-1.5 w-1.5 rounded-full"
                        style={{ backgroundColor: SLOT_COLORS[i] }}
                      />
                      <TickerLogo ticker={c.ticker} size={16} />
                      {i === 0 ? "Empresa A" : i === 1 ? "Empresa B" : `Empresa ${i + 1}`}:{" "}
                      {c.ticker}
                      <button
                        onClick={() =>
                          setSelectedTickers((p) => p.filter((t) => t !== c.ticker))
                        }
                        className="rounded-full p-0.5 hover:bg-hover"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </span>
                  ))}
                </div>
                <div className="mt-2 flex flex-wrap items-center gap-1.5">
                  {selected.length < 4 ? (
                    <button
                      onClick={() => setOpenPicker((v) => !v)}
                      className="inline-flex items-center gap-1 rounded-xl border border-dashed border-border bg-card px-2.5 py-1.5 text-xs font-medium text-muted-foreground hover:border-brand"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      Adicionar empresa
                    </button>
                  ) : null}
                  {selected.length >= 2 ? (
                    <button
                      onClick={() =>
                        setSelectedTickers((v) =>
                          v.length < 2 ? v : [v[1], v[0], ...v.slice(2)],
                        )
                      }
                      className="inline-flex items-center gap-1 rounded-xl border border-border bg-card px-2.5 py-1.5 text-xs font-medium text-muted-foreground"
                    >
                      <ArrowRightLeft className="h-3.5 w-3.5" />
                      Trocar A/B
                    </button>
                  ) : null}
                </div>
                <div className="relative mt-2.5 w-full max-w-[420px]">
                  <Search className="pointer-events-none absolute left-3 top-2 h-3.5 w-3.5 text-muted-foreground" />
                  <input
                    value={search}
                    onFocus={() => setOpenPicker(true)}
                    onChange={(e) => {
                      setSearch(e.target.value);
                      setOpenPicker(true);
                    }}
                    className="h-8 w-full rounded-xl border border-border bg-card pl-8 pr-3 text-xs"
                    placeholder="Buscar ticker ou nome (opcional)"
                  />
                  {openPicker && selected.length < 4 ? (
                    <div className="absolute z-40 mt-2 w-full rounded-xl border border-border bg-card p-1 shadow-xl">
                      {available.length ? (
                        available.map((c) => (
                          <button
                            key={c.ticker}
                            onClick={() => addTicker(c.ticker)}
                            className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left hover:bg-hover"
                          >
                            <div>
                              <p className="text-xs font-semibold">{c.ticker}</p>
                              <p className="text-[11px] text-muted-foreground">{c.name}</p>
                            </div>
                            <span className="text-[11px] text-muted-foreground">{c.sector}</span>
                          </button>
                        ))
                      ) : (
                        <p className="px-3 py-2 text-xs text-muted-foreground">
                          Nenhuma empresa encontrada.
                        </p>
                      )}
                    </div>
                  ) : null}
                </div>
              </article>
              <article className="rounded-2xl border border-border bg-card p-2.5 xl:col-span-5">
                <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
                  Leitura da comparacao
                </p>
                <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                  <div className="flex items-center rounded-xl border border-border bg-muted p-0.5">
                    {RANGES.map((r) => (
                      <button
                        key={r.key}
                        onClick={() => setRange(r.key)}
                        className={`rounded-lg px-2.5 py-1 text-xs font-medium ${range === r.key ? "bg-brand text-white" : "text-muted-foreground"}`}
                      >
                        {r.label}
                      </button>
                    ))}
                  </div>
                  {canCompare ? (
                    <button
                      onClick={() =>
                        verdictRef.current?.scrollIntoView({
                          behavior: "smooth",
                          block: "start",
                        })
                      }
                      className="inline-flex h-8 items-center gap-1.5 rounded-xl bg-brand px-3 text-xs font-semibold text-white"
                    >
                      Ver veredito
                    </button>
                  ) : null}
                  {canCompare ? (
                    <span className="rounded-lg border border-border bg-muted px-2 py-1 text-[11px] text-muted-foreground">
                      Pilar em foco: {PILLAR_LABEL[activePillar]}
                    </span>
                  ) : null}
                </div>
                <div className="relative mt-2.5">
                  <button
                    onClick={() => setActionsOpen((v) => !v)}
                    className="inline-flex h-8 items-center gap-1.5 rounded-xl border border-border bg-card px-2.5 text-xs font-medium text-muted-foreground"
                  >
                    Opcoes da comparacao <ChevronDown className="h-3.5 w-3.5" />
                  </button>
                  {actionsOpen ? (
                    <div className="absolute left-0 z-40 mt-2 w-[220px] rounded-xl border border-border bg-card p-1.5 shadow-xl">
                      <button
                        onClick={saveComparison}
                        className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-xs text-dim hover:bg-hover"
                      >
                        <Bookmark className="h-3.5 w-3.5" />
                        Salvar comparacao
                      </button>
                      <button
                        onClick={copyShareLink}
                        className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-xs text-dim hover:bg-hover"
                      >
                        <Share2 className="h-3.5 w-3.5" />
                        Compartilhar
                      </button>
                      {canCompare ? (
                        <button
                          onClick={createAlert}
                          className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-xs text-brand-text hover:bg-brand-surface"
                        >
                          <Bell className="h-3.5 w-3.5" />
                          Acompanhar mudancas
                        </button>
                      ) : null}
                    </div>
                  ) : null}
                </div>
              </article>
            </div>
          </section>

          {!canCompare ? (
            <section className="rounded-2xl border border-border bg-card p-8 text-center">
              <h2 className="text-xl font-semibold">Selecione duas empresas para comparar</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Adicione Empresa A e Empresa B para ver quem esta melhor hoje, onde esta o risco e
                como confirmar.
              </p>
              <div className="mt-5 flex flex-wrap justify-center gap-2">
                {["WEGE3", "VALE3", "ITUB4"].map((t) => (
                  <button
                    key={t}
                    onClick={() => addTicker(t)}
                    className="rounded-xl border border-border bg-muted px-3 py-1.5 text-xs font-medium"
                  >
                    {t}
                  </button>
                ))}
              </div>
            </section>
          ) : refreshing ? (
            <LoadingBlocks />
          ) : (
            <div className="space-y-8">
              {verdict && a && b ? (
                <section
                  ref={verdictRef}
                  className="scroll-mt-[160px] grid grid-cols-1 gap-4 xl:grid-cols-12"
                >
                  <article className="rounded-3xl border border-border bg-card p-6 shadow-[0_18px_45px_rgba(15,23,42,0.06)] xl:col-span-8">
                    <p className="text-xs font-semibold uppercase tracking-[0.12em] text-brand">
                      Veredito da comparacao
                    </p>
                    <h2 className="mt-2 text-[28px] font-semibold leading-tight">
                      {verdict.winner.ticker} aparece mais solida que {verdict.loser.ticker} hoje.
                    </h2>
                    <p className="mt-2 text-[15px] font-medium text-foreground">
                      {verdict.consequence}
                    </p>
                    <div className="mt-2 inline-flex items-center gap-2 rounded-full bg-muted px-3 py-1.5 text-xs font-medium text-dim">
                      <Check className="h-3.5 w-3.5 text-brand" />
                      Confianca da leitura: {verdict.confidence}
                    </div>
                    <p className="mt-3 text-sm text-muted-foreground">
                      Baseado em 5 pilares | Dados oficiais de CVM, B3 e RI | Atualizado em{" "}
                      {verdict.latestUpdate}
                    </p>
                    <div className="mt-4 rounded-2xl border border-border bg-muted p-3">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                        Score de apoio da leitura
                      </p>
                      <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-3">
                        <div className="rounded-xl bg-card px-3 py-2">
                          <p className="text-[11px] text-muted-foreground">{a.ticker}</p>
                          <p className="text-base font-semibold text-brand">
                            {formatNumber(scoreboard?.avgA ?? 0, 1)}
                          </p>
                        </div>
                        <div className="rounded-xl bg-card px-3 py-2">
                          <p className="text-[11px] text-muted-foreground">{b.ticker}</p>
                          <p className="text-base font-semibold text-dim">
                            {formatNumber(scoreboard?.avgB ?? 0, 1)}
                          </p>
                        </div>
                        <div className="rounded-xl bg-card px-3 py-2">
                          <p className="text-[11px] text-muted-foreground">Diferenca</p>
                          <p className="text-base font-semibold text-foreground">
                            {formatNumber(
                              Math.abs((scoreboard?.avgA ?? 0) - (scoreboard?.avgB ?? 0)),
                              1,
                            )}{" "}
                            pts
                          </p>
                        </div>
                      </div>
                      <p className="mt-2 text-[12px] text-muted-foreground">
                        Use o score para calibrar intensidade, nao para substituir o contexto dos
                        pilares.
                      </p>
                    </div>
                    <ul className="mt-4 space-y-2 text-sm text-dim">
                      {verdict.reasons.slice(0, 3).map((reason) => (
                        <li key={reason} className="flex items-start gap-2">
                          <Check className="mt-0.5 h-4 w-4 text-brand" />
                          <span>{reason}</span>
                        </li>
                      ))}
                    </ul>
                    <button
                      onClick={() => {
                        if (verdict.biggestGap) selectPillar(verdict.biggestGap.p);
                      }}
                      className="mt-5 inline-flex items-center gap-1.5 rounded-lg border border-brand/20 bg-brand-surface px-3 py-1.5 text-xs font-semibold text-brand-text"
                    >
                      Ver por que ela vence <ChevronDown className="h-3.5 w-3.5" />
                    </button>
                  </article>
                  <div className="space-y-4 xl:col-span-4">
                    <article className="rounded-2xl border border-border bg-card p-5">
                      <p className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.08em] text-foreground">
                        <TriangleAlert className="h-3.5 w-3.5 text-warning-text" />
                        Onde olhar com mais cuidado
                      </p>
                      <p className="mt-2 text-sm text-foreground">
                        {verdict.keyRisk?.loser.ticker} exige mais atencao em{" "}
                        {PILLAR_LABEL[verdict.keyRisk?.p ?? "Divida"]}.
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        Pior score identificado:{" "}
                        {formatNumber(verdict.keyRisk?.lowestScore ?? 0, 1)}/10
                      </p>
                    </article>
                    <article className="rounded-2xl border border-border bg-card p-5">
                      <p className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.08em] text-foreground">
                        <ArrowRightLeft className="h-3.5 w-3.5 text-dim" />
                        Onde a diferenca realmente aparece
                      </p>
                      <p className="mt-2 text-sm text-foreground">
                        {PILLAR_LABEL[verdict.biggestGap?.p ?? "Divida"]} e o pilar que mais separa
                        as empresas.
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        Delta de score: {formatNumber(verdict.biggestGap?.delta ?? 0, 1)}/10
                      </p>
                    </article>
                  </div>
                </section>
              ) : null}

              <section className="rounded-2xl border border-border bg-card p-6">
                <h2 className="text-[22px] font-semibold">
                  Os 3 fatores que mais separam essas empresas
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Comece por aqui para decidir onde focar primeiro.
                </p>
                <div className="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-3">
                  {topPillarDiffs.map((item) => (
                    <button
                      key={item.p}
                      onClick={() => selectPillar(item.p)}
                      className={`rounded-2xl border p-4 text-left transition-all ${item.p === activePillar ? "border-brand bg-brand-surface shadow-[0_8px_16px_rgba(14,147,132,0.08)]" : "border-border bg-card hover:border-brand/20"}`}
                    >
                      <p className="text-sm font-semibold">{PILLAR_LABEL[item.p]}</p>
                      {item.p === activePillar ? (
                        <p className="mt-1 text-[11px] font-medium text-brand">Pilar em foco</p>
                      ) : null}
                      <p className="mt-2 text-[13px] font-medium text-foreground">
                        {item.winner.ticker} leva vantagem.
                      </p>
                      <p className="mt-1 text-xs text-dim">
                        {pillarInsight(item.p, item.winner.ticker)}
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        Score: {formatNumber(item.da.score, 1)} ({a?.ticker}) vs{" "}
                        {formatNumber(item.db.score, 1)} ({b?.ticker}) | Delta{" "}
                        {formatNumber(item.delta, 1)}
                      </p>
                      <p className="mt-2 text-xs text-dim">{trendContext(item.winnerTrend)}.</p>
                      <div className="mt-2 inline-flex items-center gap-1 rounded-lg border border-border bg-muted px-2 py-1 text-[11px] text-muted-foreground">
                        {trendIcon(item.winnerTrend)} {trendLabel[item.winnerTrend]}
                      </div>
                    </button>
                  ))}
                </div>
              </section>

              <section className="rounded-2xl border border-border bg-card p-6">
                <h2 className="text-[20px] font-semibold">Todos os pilares</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Veja quem vence, quanto separa e por que isso importa na tese.
                </p>
                <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-5">
                  {otherPillarDiffs.map((item) => (
                    <button
                      key={item.p}
                      onClick={() => selectPillar(item.p)}
                      className={`group rounded-xl border px-4 py-4 text-left transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand/20 ${item.p === activePillar ? "border-brand bg-brand-surface shadow-[0_12px_24px_rgba(14,147,132,0.14)]" : "border-border bg-card hover:-translate-y-1 hover:border-brand hover:shadow-[0_14px_24px_rgba(15,23,42,0.12)]"}`}
                    >
                      <p
                        className={`text-sm ${item.p === activePillar ? "font-bold text-brand-text" : "font-semibold text-foreground"}`}
                      >
                        {PILLAR_LABEL[item.p]}
                      </p>
                      {item.p === activePillar ? (
                        <p className="mt-1 text-[11px] font-semibold text-brand">Pilar em foco</p>
                      ) : null}
                      <p className="mt-1 text-xs text-muted-foreground">
                        Vence: {item.winner.ticker}
                      </p>
                      <p className="mt-2 text-xs font-semibold text-foreground">
                        Delta {formatNumber(item.delta, 1)}/10
                      </p>
                      <p className="mt-2 text-[11px] text-dim">
                        {pillarConsequence(item.p, item.delta, item.winner.ticker)}
                      </p>
                      <p className="mt-2 text-[11px] font-semibold text-brand-text transition-colors group-hover:text-brand">
                        Ver detalhe
                      </p>
                    </button>
                  ))}
                </div>
              </section>

              <section
                ref={detailRef}
                className="scroll-mt-[160px] rounded-2xl border border-border bg-card p-6"
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <h2 className="text-[22px] font-semibold">
                    Detalhe guiado do pilar: {PILLAR_LABEL[activePillar]}
                  </h2>
                  {a && b ? (
                    <button
                      onClick={() => {
                        const m = a.pillars[activePillar].metrics[0];
                        const mb = b.pillars[activePillar].metrics.find(
                          (x) => x.name === m.name,
                        );
                        setEvidence({
                          metricName: m.name,
                          definition: m.definition,
                          unit: m.unit,
                          source: m.source,
                          aTicker: a.ticker,
                          bTicker: b.ticker,
                          aValue: m.value,
                          bValue: mb?.value ?? null,
                        });
                      }}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-border px-2.5 py-1.5 text-[11px] font-medium text-muted-foreground"
                    >
                      <FileText className="h-3.5 w-3.5" />
                      Confirmar na fonte
                    </button>
                  ) : null}
                </div>
                <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-12">
                  <article className="rounded-2xl border border-border bg-muted p-5 xl:col-span-4">
                    <div className="space-y-4 text-sm">
                      {a && b ? (
                        <div>
                          <p className="text-[12px] font-semibold text-muted-foreground">
                            Resumo do pilar
                          </p>
                          <p className="mt-1.5 text-foreground">
                            {a.pillars[activePillar].score >= b.pillars[activePillar].score
                              ? a.ticker
                              : b.ticker}{" "}
                            esta melhor neste pilar hoje.
                          </p>
                        </div>
                      ) : null}
                      <div>
                        <p className="text-[12px] font-semibold text-muted-foreground">
                          O que isso quer dizer
                        </p>
                        <p className="mt-1.5 text-foreground">
                          {pillarCopy[activePillar].what}
                        </p>
                      </div>
                      <div>
                        <p className="text-[12px] font-semibold text-muted-foreground">
                          Por que isso pesa na analise
                        </p>
                        <p className="mt-1.5 text-foreground">
                          {pillarCopy[activePillar].why}
                        </p>
                      </div>
                      <div>
                        <p className="text-[12px] font-semibold text-muted-foreground">
                          O que observar com atencao
                        </p>
                        <p className="mt-1.5 text-foreground">
                          {pillarCopy[activePillar].how}
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {pillarCopy[activePillar].ranges.map((r) => (
                          <span
                            key={r}
                            className="rounded-xl border border-border bg-card px-2 py-1 text-[11px]"
                          >
                            {r}
                          </span>
                        ))}
                      </div>
                    </div>
                  </article>
                  <article className="rounded-2xl border border-border bg-muted p-5 xl:col-span-8">
                    {a && b ? (
                      <>
                        <div className="mb-3 rounded-xl border border-border bg-muted px-3 py-2">
                          <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                            Leitura do periodo
                          </p>
                          <p className="mt-1 text-sm font-medium text-dim">
                            {a.pillars[activePillar].score >= b.pillars[activePillar].score
                              ? a.ticker
                              : b.ticker}{" "}
                            mostra trajetoria mais favoravel, enquanto{" "}
                            {a.pillars[activePillar].score >= b.pillars[activePillar].score
                              ? b.ticker
                              : a.ticker}{" "}
                            perdeu tracao relativa.
                          </p>
                          <div className="mt-2 flex flex-wrap gap-2 text-[11px]">
                            <span className="rounded-lg border border-border bg-card px-2 py-1 text-dim">
                              Regra: {a.pillars[activePillar].thresholdLabel}
                            </span>
                            <span className="rounded-lg border border-border bg-card px-2 py-1 text-dim">
                              Direcao desejavel:{" "}
                              {a.pillars[activePillar].thresholdLabel
                                .toLowerCase()
                                .includes("menor")
                                ? "linha descendente"
                                : "linha ascendente"}
                            </span>
                            {latestChartLeader ? (
                              <span className="rounded-lg border border-brand-border bg-brand-surface px-2 py-1 font-medium text-brand-text">
                                Vantagem atual: {latestChartLeader}
                              </span>
                            ) : null}
                            {latestChartDelta !== null ? (
                              <span className="rounded-lg border border-border bg-card px-2 py-1 text-dim">
                                Delta final: {formatNumber(latestChartDelta, 1)}
                              </span>
                            ) : null}
                          </div>
                          {scoreVsChartContext ? (
                            <p className="mt-2 rounded-lg border border-warning-border bg-warning-surface px-2.5 py-2 text-[12px] text-warning-text">
                              {scoreVsChartContext}
                            </p>
                          ) : null}
                        </div>
                        <div className="mb-2 flex items-center gap-4 text-xs text-muted-foreground">
                          <span className="inline-flex items-center gap-1">
                            <span className="h-2.5 w-2.5 rounded-full bg-brand" />
                            {a.ticker}
                          </span>
                          <span className="inline-flex items-center gap-1">
                            <span className="h-2.5 w-2.5 rounded-full bg-dim" />
                            {b.ticker}
                          </span>
                        </div>
                        <div className="h-[280px] rounded-xl border border-border bg-card p-3">
                          <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={chartData}>
                              <CartesianGrid
                                stroke="#EDF2F7"
                                strokeDasharray="2 3"
                                vertical={false}
                              />
                              <ReferenceArea
                                y1={a.pillars[activePillar].bands.safe[0]}
                                y2={a.pillars[activePillar].bands.safe[1]}
                                fill="#DCFCE7"
                                fillOpacity={0.18}
                              />
                              <ReferenceArea
                                y1={a.pillars[activePillar].bands.warning[0]}
                                y2={a.pillars[activePillar].bands.warning[1]}
                                fill="#FFEDD5"
                                fillOpacity={0.16}
                              />
                              <ReferenceArea
                                y1={a.pillars[activePillar].bands.risk[0]}
                                y2={a.pillars[activePillar].bands.risk[1]}
                                fill="#FEE2E2"
                                fillOpacity={0.18}
                              />
                              <XAxis
                                dataKey="year"
                                tick={{ fontSize: 11, fill: "#94A3B8" }}
                                axisLine={false}
                                tickLine={false}
                              />
                              <YAxis
                                domain={a.pillars[activePillar].domain}
                                tick={{ fontSize: 11, fill: "#94A3B8" }}
                                axisLine={false}
                                tickLine={false}
                                width={30}
                              />
                              <Tooltip
                                content={({ active, payload, label }) =>
                                  !active || !payload?.length ? null : (
                                    <div className="rounded-lg border border-border bg-card p-2 text-xs shadow-lg">
                                      <p className="font-semibold">Ano: {label}</p>
                                      {payload.map((item) => (
                                        <p
                                          key={`${item.name}-${label}`}
                                          style={{ color: item.color as string }}
                                        >
                                          {item.name}: {formatNumber(Number(item.value), 2)}
                                        </p>
                                      ))}
                                    </div>
                                  )
                                }
                              />
                              <Line
                                type="monotone"
                                dataKey="a"
                                name={a.ticker}
                                stroke={TOKENS.companyA}
                                strokeWidth={2.6}
                                dot={{ r: 2 }}
                              />
                              <Line
                                type="monotone"
                                dataKey="b"
                                name={b.ticker}
                                stroke={TOKENS.companyB}
                                strokeWidth={2.2}
                                dot={{ r: 2 }}
                              />
                            </LineChart>
                          </ResponsiveContainer>
                        </div>
                      </>
                    ) : null}
                  </article>
                </div>
              </section>

              <section className="scroll-mt-[160px] rounded-2xl border border-border bg-card p-6">
                <h2 className="text-[20px] font-semibold">Evidencias por metrica</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Compare numeros completos, tendencia e winner por item.
                </p>
                {activePillarWinnerSummary ? (
                  <p className="mt-2 text-sm font-medium text-dim">{activePillarWinnerSummary}</p>
                ) : null}
                {a && b ? (
                  <div className="mt-4 overflow-x-auto rounded-2xl border border-border">
                    <table className="min-w-full divide-y divide-[#E7EAEE] text-sm">
                      <thead className="bg-muted text-xs font-semibold text-dim">
                        <tr>
                          <th className="px-3 py-3 text-left">Metrica</th>
                          <th className="px-3 py-3 text-left">{a.ticker}</th>
                          <th className="px-3 py-3 text-left">{b.ticker}</th>
                          <th className="px-3 py-3 text-left">Delta</th>
                          <th className="px-3 py-3 text-left">Winner</th>
                          <th className="px-3 py-3 text-left">Leitura</th>
                          <th className="px-3 py-3 text-left">Fonte</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#E7EAEE]">
                        {tableRows.map((row) => {
                          const w = metricWinner(
                            row.direction,
                            row.a?.value ?? null,
                            row.b?.value ?? null,
                          );
                          const d = metricDelta(row.a?.value ?? null, row.b?.value ?? null);
                          return (
                            <tr key={row.name}>
                              <td className="px-3 py-3 align-top">
                                <p className="font-medium">{row.name}</p>
                                <p className="mt-1 text-[11px] text-muted-foreground">
                                  {row.definition}
                                </p>
                              </td>
                              <td className="px-3 py-3 align-top">
                                <p
                                  className={`text-brand ${w === "a" ? "font-semibold" : "font-medium"}`}
                                >
                                  {formatMetric(row.a?.value ?? null, row.unit)}
                                </p>
                                {row.a ? (
                                  <p className="mt-1 inline-flex items-center gap-1 text-[11px] font-medium text-muted-foreground">
                                    {trendIcon(row.a.trend)}
                                    {trendLabel[row.a.trend]}
                                  </p>
                                ) : (
                                  <p className="mt-1 text-[11px] text-danger-text">
                                    Dados indisponiveis
                                  </p>
                                )}
                              </td>
                              <td className="px-3 py-3 align-top">
                                <p
                                  className={`text-dim ${w === "b" ? "font-semibold" : "font-medium"}`}
                                >
                                  {formatMetric(row.b?.value ?? null, row.unit)}
                                </p>
                                {row.b ? (
                                  <p className="mt-1 inline-flex items-center gap-1 text-[11px] font-medium text-muted-foreground">
                                    {trendIcon(row.b.trend)}
                                    {trendLabel[row.b.trend]}
                                  </p>
                                ) : (
                                  <p className="mt-1 text-[11px] text-danger-text">
                                    Dados indisponiveis
                                  </p>
                                )}
                              </td>
                              <td className="px-3 py-3 align-top">
                                <span className="inline-flex rounded-md border border-border bg-muted px-2 py-1 text-xs font-semibold text-foreground">
                                  {d === null
                                    ? "Dados indisponiveis"
                                    : `${formatNumber(d, row.unit === "x" ? 2 : 1)} ${row.unit}`}
                                </span>
                              </td>
                              <td className="px-3 py-3 align-top">
                                {w === "a" ? (
                                  <span className="inline-flex items-center gap-1 rounded-lg border border-brand-border bg-brand-surface px-2 py-1 text-xs font-semibold text-brand">
                                    <Crown className="h-3 w-3" />
                                    {a.ticker}
                                  </span>
                                ) : w === "b" ? (
                                  <span className="inline-flex items-center gap-1 rounded-lg border border-border bg-muted px-2 py-1 text-xs font-semibold text-dim">
                                    <Check className="h-3 w-3" />
                                    {b.ticker}
                                  </span>
                                ) : (
                                  <span className="inline-flex rounded-md border border-border bg-muted px-2 py-1 text-[12px] font-semibold text-muted-foreground">
                                    Empate
                                  </span>
                                )}
                              </td>
                              <td className="px-3 py-3 align-top">
                                <p
                                  className={`inline-flex rounded-md px-2 py-1 text-xs font-semibold ${d !== null && d >= 1.2 ? "bg-brand-surface text-brand-text" : "bg-muted text-dim"}`}
                                >
                                  {evidenceReadLabel(d)}
                                </p>
                                <p className="mt-1 text-[11px] text-muted-foreground">
                                  {w === "tie"
                                    ? "Sem separacao decisiva."
                                    : `${w === "a" ? a.ticker : b.ticker} com leitura mais favoravel neste item.`}
                                </p>
                              </td>
                              <td className="px-3 py-3 align-top">
                                <button
                                  title="Ver fonte"
                                  onClick={() => openEvidence(row)}
                                  className="inline-flex items-center gap-1 rounded-lg border border-border px-2 py-1.5 text-[11px] text-muted-foreground hover:bg-hover"
                                >
                                  <FileText className="h-3.5 w-3.5" />
                                  Fonte
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                ) : null}
              </section>

              <section className="rounded-2xl border border-border bg-card p-6">
                <h2 className="text-[20px] font-semibold">O que pode explicar essa diferenca</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Contexto recente + como verificamos os dados.
                </p>
                <div className="mt-3 rounded-xl border border-brand-border bg-brand-surface px-3.5 py-3 shadow-[0_6px_14px_rgba(14,147,132,0.08)]">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                    Sintese principal (90 dias)
                  </p>
                  <p className="mt-1 text-sm text-foreground">{mainExplainer}</p>
                </div>
                <div className="mt-3 flex flex-wrap items-center gap-2 rounded-xl border border-border bg-muted px-3 py-2 text-[12px] text-muted-foreground">
                  <span>
                    Atualizado em{" "}
                    {pair
                      .map((c) => c.updatedAt)
                      .sort((x, y) => {
                        const [ddX, mmX, yyyyX] = x.split("/").map(Number);
                        const [ddY, mmY, yyyyY] = y.split("/").map(Number);
                        return (
                          new Date(yyyyY, mmY - 1, ddY).getTime() -
                          new Date(yyyyX, mmX - 1, ddX).getTime()
                        );
                      })[0] ?? "-"}
                  </span>
                  <span>| Fontes CVM/B3/RI</span>
                  <span>| {recentEvents.length} eventos recentes</span>
                  <span>
                    | {eventsOnActivePillar} impactam {PILLAR_LABEL[activePillar]}
                  </span>
                </div>
                <div className="mt-4 space-y-3">
                  <button
                    onClick={() => setEventsOpen((v) => !v)}
                    className="flex w-full items-center justify-between rounded-2xl border border-border bg-muted px-4 py-3 text-left"
                  >
                    <span className="text-sm font-semibold">
                      Eventos recentes (90 dias){" "}
                      <span className="font-normal text-muted-foreground">
                        - {recentEvents.length} eventos - {eventsOnActivePillar} impactam{" "}
                        {PILLAR_LABEL[activePillar]}
                      </span>
                    </span>
                    {eventsOpen ? (
                      <ChevronUp className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    )}
                  </button>
                  {eventsOpen ? (
                    <div className="space-y-2">
                      {recentEvents.length ? (
                        recentEvents.map((e) => (
                          <article
                            key={e.id}
                            className="rounded-2xl border border-border bg-card p-4"
                          >
                            <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                              <span>{e.date}</span>
                              <span
                                className={`rounded-xl px-2 py-0.5 ${e.type === "Fato relevante" ? "bg-warning-surface text-warning-text" : "border border-border"}`}
                              >
                                {e.type}
                              </span>
                              <span className="rounded-xl border border-border px-2 py-0.5">
                                {PILLAR_LABEL[e.impact]}
                              </span>
                              <span className="rounded-xl border border-border px-2 py-0.5">
                                {e.ticker}
                              </span>
                            </div>
                            <p className="mt-2 text-sm">{e.summary}</p>
                            <button
                              onClick={() =>
                                setEvidence({
                                  metricName: `Evento: ${e.type}`,
                                  definition: e.summary,
                                  unit: "",
                                  source: e.source,
                                  aTicker: a?.ticker ?? "A",
                                  bTicker: b?.ticker ?? "B",
                                  aValue: null,
                                  bValue: null,
                                })
                              }
                              className="mt-3 inline-flex items-center gap-2 rounded-xl border border-border px-2.5 py-1.5 text-xs text-muted-foreground"
                            >
                              <FileText className="h-3.5 w-3.5" />
                              Ver fonte
                            </button>
                          </article>
                        ))
                      ) : (
                        <div className="rounded-2xl border border-border bg-card p-4 text-sm text-muted-foreground">
                          Nenhum evento relevante encontrado para as empresas selecionadas.
                        </div>
                      )}
                    </div>
                  ) : null}
                  <button
                    onClick={() => setQualityOpen((v) => !v)}
                    className="flex w-full items-center justify-between rounded-2xl border border-border bg-muted px-4 py-3 text-left"
                  >
                    <span className="text-sm font-semibold inline-flex items-center gap-2">
                      <span className={`h-2.5 w-2.5 rounded-full ${qualityTone.dot}`} />
                      Como verificamos os dados{" "}
                      <span className="font-normal text-muted-foreground">
                        - Atualizado em{" "}
                        {pair
                          .map((c) => c.updatedAt)
                          .sort((x, y) => {
                            const [ddX, mmX, yyyyX] = x.split("/").map(Number);
                            const [ddY, mmY, yyyyY] = y.split("/").map(Number);
                            return (
                              new Date(yyyyY, mmY - 1, ddY).getTime() -
                              new Date(yyyyX, mmX - 1, ddX).getTime()
                            );
                          })[0] ?? "-"}{" "}
                        - Fontes: CVM/B3/RI
                      </span>
                    </span>
                    {qualityOpen ? (
                      <ChevronUp className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    )}
                  </button>
                  {qualityOpen ? (
                    <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
                      {pair.map((c, i) => (
                        <article
                          key={c.ticker}
                          className="rounded-2xl border border-border bg-card p-4 text-sm"
                        >
                          <p className="font-semibold">
                            {i === 0 ? "Empresa A" : "Empresa B"}: {c.ticker}
                          </p>
                          <p className="mt-1 text-muted-foreground">
                            Fonte primaria: {c.primarySource}
                          </p>
                          <p className="mt-1 text-muted-foreground">
                            Ultima atualizacao: {c.updatedAt}
                          </p>
                          <p
                            className="mt-2 text-xs text-muted-foreground"
                            title="Confiabilidade baseada em cobertura, recorrencia e completude"
                          >
                            Confianca: {c.confidence}
                          </p>
                          {c.gaps.length ? (
                            <div className="mt-2 rounded-xl border border-warning-border bg-warning-surface px-3 py-2 text-xs text-warning-text">
                              <p className="inline-flex items-center gap-1 font-medium">
                                <TriangleAlert className="h-3.5 w-3.5" />
                                Gap identificado
                              </p>
                              <p className="mt-1.5 text-foreground">{c.gaps.join(" ")}</p>
                            </div>
                          ) : (
                            <div className="mt-2 rounded-xl border border-success-border bg-success-surface px-3 py-2 text-xs text-success-text">
                              Nenhum gap relevante reportado.
                            </div>
                          )}
                        </article>
                      ))}
                    </div>
                  ) : null}
                </div>
              </section>
            </div>
          )}

          <p className="mt-8 text-xs text-muted-foreground">
            Conteudo educacional. Nao constitui recomendacao de compra ou venda.
          </p>
        </div>
      </main>
      {toast ? (
        <div className="fixed bottom-5 right-5 z-50 rounded-xl border border-brand/20 bg-brand-surface px-3 py-2 text-xs font-medium text-brand-text shadow-lg">
          {toast}
        </div>
      ) : null}
      <EvidenceDrawer
        data={evidence}
        onClose={() => setEvidence(null)}
        formatMetric={formatMetric}
      />
    </div>
  );
}

export default ComparePage;

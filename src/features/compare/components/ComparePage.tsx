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
  LabelList,
  Line,
  LineChart,
  ReferenceArea,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Sidebar } from "@/src/components/layout/Sidebar";
import { AppTopBar } from "@/src/components/layout/AppTopBar";
import wegLogo from "@/src/assets/logos/weg.jpeg";
import valeLogo from "@/src/assets/logos/vale.png";
import { useCompare } from "../hooks/useCompare";
import { pillarCopy } from "../services";
import type { CompareTableRow, CompareTrend } from "../interfaces";
import { CompareEvidenceDrawer } from "./CompareEvidenceDrawer";

const TOKENS = {
  companyA: "#12A594",
  companyB: "#5B8DEF",
};

const surfaceClass =
  "rounded-[28px] border border-[#E7EEF5] bg-white shadow-[0_18px_40px_rgba(15,23,40,0.04)]";
const cardClass =
  "rounded-[24px] border border-[#E7EEF5] bg-white shadow-[0_12px_28px_rgba(15,23,40,0.035)]";
const chipClass =
  "inline-flex items-center gap-2 rounded-full border border-[#E7EEF5] bg-white px-3 py-1.5 text-[11px] font-medium text-[#667085]";

const trendLabel: Record<CompareTrend, string> = {
  melhorando: "Melhorando",
  estavel: "Estavel",
  piorando: "Piorando",
};

const TICKER_LOGOS: Record<string, string> = {
  WEGE3: wegLogo.src,
  VALE3: valeLogo.src,
};

function TickerLogo({ ticker, size = 18 }: { ticker: string; size?: number }) {
  const logo = TICKER_LOGOS[ticker];
  if (!logo) {
    return (
      <span
        className="inline-flex items-center justify-center rounded-full border border-[#E7EEF5] bg-white text-[10px] font-semibold text-[#667085]"
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
      className="rounded-full border border-[#E7EEF5] bg-white object-cover"
      style={{ width: size, height: size }}
    />
  );
}

const LoadingBlocks = () => (
  <div className="space-y-8">
    <div className="h-[160px] animate-pulse rounded-[28px] border border-[#E7EEF5] bg-white" />
    <div className="h-[280px] animate-pulse rounded-[28px] border border-[#E7EEF5] bg-white" />
    <div className="h-[360px] animate-pulse rounded-[28px] border border-[#E7EEF5] bg-white" />
  </div>
);

const trendIcon = (trend: CompareTrend) =>
  trend === "melhorando" ? (
    <ArrowUp className="h-3 w-3" />
  ) : trend === "piorando" ? (
    <ArrowDown className="h-3 w-3" />
  ) : (
    <Minus className="h-3 w-3" />
  );

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function getRelativePosition(value: number | null | undefined, domain: [number, number]) {
  if (value === null || value === undefined) return 50;
  const [min, max] = domain;
  if (max === min) return 50;
  return clamp(((value - min) / (max - min)) * 100, 0, 100);
}

function PillarDumbbell({
  leftTicker,
  rightTicker,
  leftScore,
  rightScore,
  winner,
  emphasis = false,
}: {
  leftTicker: string;
  rightTicker: string;
  leftScore: number;
  rightScore: number;
  winner: string;
  emphasis?: boolean;
}) {
  const left = getRelativePosition(leftScore, [0, 10]);
  const right = getRelativePosition(rightScore, [0, 10]);
  const start = Math.min(left, right);
  const width = Math.max(Math.abs(right - left), 2.5);
  const aWins = winner === leftTicker;

  return (
    <div className="space-y-2">
      <div className="relative h-12 rounded-[18px] border border-[#EEF2F6] bg-[#F8FBFD] px-3">
        <div className="absolute left-3 right-3 top-1/2 h-[2px] -translate-y-1/2 rounded-full bg-[#DCE5EE]" />
        <div
          className="absolute top-1/2 h-[4px] -translate-y-1/2 rounded-full bg-[linear-gradient(90deg,rgba(18,165,148,0.22),rgba(91,141,239,0.26))]"
          style={{ left: `calc(${start}% + 12px)`, width: `${width}%` }}
        />
        <div className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2" style={{ left: `calc(${left}% + 12px)` }}>
          <div className="h-4 w-4 rounded-full border-2 border-white bg-[#12A594] shadow-[0_6px_16px_rgba(15,23,40,0.12)]" />
        </div>
        <div className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2" style={{ left: `calc(${right}% + 12px)` }}>
          <div className={`h-4 w-4 rounded-full border-2 border-white bg-[#5B8DEF] shadow-[0_6px_16px_rgba(15,23,40,0.12)] ${emphasis ? "ring-4 ring-[#EEF6FF]" : ""}`} />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2 text-[11px]">
        <div className={`rounded-[16px] border px-3 py-2 ${aWins ? "border-[#DDF6F0] bg-[#EFFAF6]" : "border-[#E7EEF5] bg-white"}`}>
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-[#12A594]" />
            <span className="font-semibold text-[#0F1728]">{leftTicker}</span>
          </div>
          <p className="mt-1 text-[15px] font-semibold text-[#0F1728]">{leftScore.toFixed(1)}</p>
        </div>
        <div className={`rounded-[16px] border px-3 py-2 ${!aWins ? "border-[#D9E8FF] bg-[#EEF6FF]" : "border-[#E7EEF5] bg-white"}`}>
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-[#5B8DEF]" />
            <span className="font-semibold text-[#0F1728]">{rightTicker}</span>
          </div>
          <p className="mt-1 text-[15px] font-semibold text-[#0F1728]">{rightScore.toFixed(1)}</p>
        </div>
      </div>
    </div>
  );
}

function MetricComparisonRow({
  row,
  aTicker,
  bTicker,
  formatMetric,
  formatNumber,
  metricWinner,
  metricDelta,
  evidenceReadLabel,
  openEvidence,
}: {
  row: CompareTableRow;
  aTicker: string;
  bTicker: string;
  formatMetric: (value: number | null, unit: string) => string;
  formatNumber: (value: number, digits?: number) => string;
  metricWinner: (
    direction: "higher-better" | "lower-better",
    a: number | null,
    b: number | null,
  ) => "a" | "b" | "tie";
  metricDelta: (a: number | null, b: number | null) => number | null;
  evidenceReadLabel: (delta: number | null) => string;
  openEvidence: (row: CompareTableRow) => void;
}) {
  const winner = metricWinner(row.direction, row.a?.value ?? null, row.b?.value ?? null);
  const delta = metricDelta(row.a?.value ?? null, row.b?.value ?? null);
  const values = [row.a?.value, row.b?.value].filter((value): value is number => value !== null && value !== undefined);
  const min = values.length ? Math.min(...values) : 0;
  const max = values.length ? Math.max(...values) : 1;
  const safeMax = max === min ? min + 1 : max;
  const posA = row.a?.value === null || row.a?.value === undefined ? 50 : ((row.a.value - min) / (safeMax - min)) * 100;
  const posB = row.b?.value === null || row.b?.value === undefined ? 50 : ((row.b.value - min) / (safeMax - min)) * 100;
  const start = Math.min(posA, posB);
  const width = Math.max(Math.abs(posB - posA), 3);
  const winnerTone =
    winner === "a"
      ? "from-[#EFFAF6] via-[#F8FFFC] to-white"
      : winner === "b"
        ? "from-[#EEF6FF] via-[#F8FBFF] to-white"
        : "from-[#F8FBFD] to-white";
  const winnerChipTone =
    winner === "a"
      ? "border-[#DDF6F0] bg-[#EFFAF6] text-[#0F8C7D]"
      : winner === "b"
        ? "border-[#D9E8FF] bg-[#EEF6FF] text-[#3965B8]"
        : "";
  const aWinner = winner === "a";
  const bWinner = winner === "b";

  return (
    <article className={`rounded-[24px] border border-[#E7EEF5] bg-gradient-to-br ${winnerTone} p-5 shadow-[0_10px_26px_rgba(15,23,40,0.03)]`}>
      <div className="grid gap-4 xl:grid-cols-[1.3fr_1fr]">
        <div>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-[16px] font-semibold text-[#0F1728]">{row.name}</p>
              <p className="mt-1 max-w-[58ch] text-[13px] leading-6 text-[#667085]">{row.definition}</p>
            </div>
            <button
              title="Ver fonte"
              onClick={() => openEvidence(row)}
              className="inline-flex items-center gap-1.5 rounded-full border border-[#E7EEF5] bg-white px-3 py-2 text-[11px] font-medium text-[#667085]"
            >
              <FileText className="h-3.5 w-3.5" />
              Fonte
            </button>
          </div>

          <div className="mt-4 rounded-[20px] border border-[#EEF2F6] bg-[#F8FBFD] p-4">
            <div className="mb-3 flex flex-wrap items-center gap-3 text-[11px] text-[#667085]">
              <span className={`${chipClass} ${winnerChipTone}`}>{winner === "a" ? aTicker : winner === "b" ? bTicker : "Empate"}</span>
              <span className={`${chipClass} border-[#FDE7EC] bg-[#FDEFF2] px-3.5 text-[#B54768]`}>{delta === null ? "Dados indisponiveis" : `${formatNumber(delta, row.unit === "x" ? 2 : 1)} ${row.unit}`}</span>
              <span className={chipClass}>{evidenceReadLabel(delta)}</span>
            </div>
            <div className={`relative h-16 rounded-[16px] ${aWinner ? "bg-[linear-gradient(90deg,rgba(18,165,148,0.10),rgba(255,255,255,0))]" : bWinner ? "bg-[linear-gradient(90deg,rgba(255,255,255,0),rgba(91,141,239,0.10))]" : ""}`}>
              <div className="absolute left-0 right-0 top-1/2 h-[2px] -translate-y-1/2 rounded-full bg-[#DCE5EE]" />
              <div className="absolute top-1/2 h-[8px] -translate-y-1/2 rounded-full bg-[linear-gradient(90deg,rgba(18,165,148,0.22),rgba(91,141,239,0.26))] shadow-[0_8px_18px_rgba(15,23,40,0.06)]" style={{ left: `${start}%`, width: `${width}%` }} />
              <div className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2" style={{ left: `${clamp(posA, 0, 100)}%` }}>
                <div className={`rounded-full border-2 border-white px-2.5 py-1 text-[10px] font-semibold text-white shadow-[0_8px_18px_rgba(18,165,148,0.22)] ${aWinner ? "bg-[#0F8C7D] ring-4 ring-[#DDF6F0]" : "bg-[#12A594]"}`}>{aTicker}</div>
              </div>
              <div className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2" style={{ left: `${clamp(posB, 0, 100)}%` }}>
                <div className={`rounded-full border-2 border-white px-2.5 py-1 text-[10px] font-semibold text-white shadow-[0_8px_18px_rgba(91,141,239,0.22)] ${bWinner ? "bg-[#3965B8] ring-4 ring-[#D9E8FF]" : "bg-[#5B8DEF]"}`}>{bTicker}</div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
          <div className={`rounded-[20px] border p-4 ${aWinner ? "border-[#DDF6F0] bg-[#F6FEFB]" : "border-[#E7EEF5] bg-white"}`}>
            <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#98A2B3]">{aTicker}</p>
            <p className={`mt-2 text-[20px] font-semibold ${winner === "a" ? "text-[#12A594]" : "text-[#0F1728]"}`}>
              {formatMetric(row.a?.value ?? null, row.unit)}
            </p>
            {row.a ? (
              <p className="mt-2 inline-flex items-center gap-1 text-[11px] font-medium text-[#667085]">
                {trendIcon(row.a.trend)}
                {trendLabel[row.a.trend]}
              </p>
            ) : (
              <p className="mt-2 text-[11px] text-[#B54768]">Dados indisponiveis</p>
            )}
          </div>
          <div className={`rounded-[20px] border p-4 ${bWinner ? "border-[#D9E8FF] bg-[#F8FBFF]" : "border-[#E7EEF5] bg-white"}`}>
            <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#98A2B3]">{bTicker}</p>
            <p className={`mt-2 text-[20px] font-semibold ${winner === "b" ? "text-[#5B8DEF]" : "text-[#0F1728]"}`}>
              {formatMetric(row.b?.value ?? null, row.unit)}
            </p>
            {row.b ? (
              <p className="mt-2 inline-flex items-center gap-1 text-[11px] font-medium text-[#667085]">
                {trendIcon(row.b.trend)}
                {trendLabel[row.b.trend]}
              </p>
            ) : (
              <p className="mt-2 text-[11px] text-[#B54768]">Dados indisponiveis</p>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}

export function ComparePage() {
  const {
    detailRef,
    verdictRef,
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

  const activeIsLowerBetter = a?.pillars[activePillar].thresholdLabel.toLowerCase().includes("menor");
  const latestUpdate = [...pair]
    .map((company) => company.updatedAt)
    .sort((x, y) => {
      const [dx, mx, yx] = x.split("/").map(Number);
      const [dy, my, yy] = y.split("/").map(Number);
      return new Date(yy, my - 1, dy).getTime() - new Date(yx, mx - 1, dx).getTime();
    })[0];

  return (
    <div className="min-h-screen bg-[#F6FAFC] text-[#0F1728]" style={{ fontFamily: "Inter, sans-serif" }}>
      <Sidebar currentPage="comparar" contextLabel="Comparar empresas" />
      <AppTopBar sidebarOffsetClassName="left-0 xl:left-[240px]" />
      <main className="relative overflow-hidden pt-20 xl:ml-[240px]">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-[8%] top-0 h-80 w-80 rounded-full bg-[radial-gradient(circle,rgba(91,141,239,0.10)_0%,rgba(91,141,239,0)_72%)]" />
          <div className="absolute right-[6%] top-40 h-[24rem] w-[24rem] rounded-full bg-[radial-gradient(circle,rgba(18,165,148,0.09)_0%,rgba(18,165,148,0)_72%)]" />
        </div>
        <div className="relative px-8 pb-12 pt-6">
          <div className="mx-auto max-w-[1560px]">
            <div className="mb-6">
              <h1 className="text-[32px] font-semibold tracking-[-0.03em] text-[#0F1728]">Comparar</h1>
              <p className="mt-2 text-[15px] text-[#667085]">Compare empresas lado a lado por pilar.</p>
            </div>
            <section
              className={`sticky top-12 z-30 mb-8 border border-[#E7EEF5] bg-[rgba(255,255,255,0.94)] shadow-[0_16px_36px_rgba(15,23,40,0.07)] backdrop-blur transition-all ${compactSticky ? "rounded-[24px] p-3" : "rounded-[28px] p-4"}`}
            >
              <div className="grid gap-3 xl:grid-cols-12">
                <article className="rounded-[24px] border border-[#E7EEF5] bg-[#F8FBFD] p-4 xl:col-span-8">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[#98A2B3]">Setup da comparacao</p>
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    {selected.map((company, index) => (
                      <span
                        key={company.ticker}
                        className="inline-flex items-center gap-2 rounded-full border border-[#E7EEF5] bg-white px-3 py-2 text-[12px] font-medium text-[#0F1728]"
                      >
                        <span className="h-2 w-2 rounded-full" style={{ backgroundColor: index === 0 ? TOKENS.companyA : "#5B8DEF" }} />
                        <TickerLogo ticker={company.ticker} size={18} />
                        {index === 0 ? "Empresa A" : index === 1 ? "Empresa B" : `Empresa ${index + 1}`}: {company.ticker}
                        <button
                          onClick={() => setSelectedTickers((current) => current.filter((ticker) => ticker !== company.ticker))}
                          className="rounded-full p-0.5 text-[#98A2B3] transition hover:bg-[#F3F6F9] hover:text-[#0F1728]"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </span>
                    ))}
                    {selected.length < 4 ? (
                      <button
                        onClick={() => setOpenPicker((value) => !value)}
                        className="inline-flex items-center gap-1.5 rounded-full border border-dashed border-[#C9D6E2] bg-white px-3 py-2 text-[12px] font-medium text-[#667085] transition hover:border-[#12A594] hover:text-[#0F1728]"
                      >
                        <Plus className="h-3.5 w-3.5" />
                        Adicionar empresa
                      </button>
                    ) : null}
                    {selected.length >= 2 ? (
                      <button
                        onClick={() => setSelectedTickers((current) => (current.length < 2 ? current : [current[1], current[0], ...current.slice(2)]))}
                        className="inline-flex items-center gap-1.5 rounded-full border border-[#E7EEF5] bg-white px-3 py-2 text-[12px] font-medium text-[#667085]"
                      >
                        <ArrowRightLeft className="h-3.5 w-3.5" />
                        Trocar A/B
                      </button>
                    ) : null}
                  </div>
                  <div className="relative mt-3 max-w-[440px]">
                    <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#98A2B3]" />
                    <input
                      value={search}
                      onFocus={() => setOpenPicker(true)}
                      onChange={(event) => {
                        setSearch(event.target.value);
                        setOpenPicker(true);
                      }}
                      className="h-11 w-full rounded-[18px] border border-[#E7EEF5] bg-white pl-9 pr-3 text-[13px] text-[#0F1728] outline-none transition focus:ring-2 focus:ring-[#DDF6F0]"
                      placeholder="Buscar ticker ou nome (opcional)"
                    />
                    {openPicker && selected.length < 4 ? (
                      <div className="absolute z-40 mt-2 w-full rounded-[20px] border border-[#E7EEF5] bg-white p-2 shadow-[0_24px_50px_rgba(15,23,40,0.12)]">
                        {available.length ? (
                          available.map((company) => (
                            <button
                              key={company.ticker}
                              onClick={() => addTicker(company.ticker)}
                              className="flex w-full items-center justify-between rounded-[16px] px-3 py-3 text-left transition hover:bg-[#F8FBFD]"
                            >
                              <div>
                                <p className="text-[13px] font-semibold text-[#0F1728]">{company.ticker}</p>
                                <p className="mt-0.5 text-[12px] text-[#667085]">{company.name}</p>
                              </div>
                              <span className="text-[11px] text-[#98A2B3]">{company.sector}</span>
                            </button>
                          ))
                        ) : (
                          <p className="px-3 py-3 text-[12px] text-[#667085]">Nenhuma empresa encontrada.</p>
                        )}
                      </div>
                    ) : null}
                  </div>
                </article>

                <article className="rounded-[24px] border border-[#E7EEF5] bg-white p-4 xl:col-span-4">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[#98A2B3]">Leitura da comparacao</p>
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <div className="flex items-center rounded-full border border-[#E7EEF5] bg-[#F8FBFD] p-1">
                      {RANGES.map((option) => (
                        <button
                          key={option.key}
                          onClick={() => setRange(option.key)}
                          className={`rounded-full px-3 py-1.5 text-[12px] font-semibold transition ${range === option.key ? "bg-[#12A594] text-white shadow-[0_10px_20px_rgba(18,165,148,0.2)]" : "text-[#667085]"}`}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                    {canCompare ? (
                      <button
                        onClick={() => verdictRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })}
                        className="inline-flex h-10 items-center gap-1.5 rounded-full bg-[#12A594] px-4 text-[12px] font-semibold text-white shadow-[0_14px_28px_rgba(18,165,148,0.18)]"
                      >
                        Ver veredito
                      </button>
                    ) : null}
                  </div>
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    {canCompare ? <span className={chipClass}>Pilar em foco: {PILLAR_LABEL[activePillar]}</span> : null}
                    {canCompare ? (
                      <span className={`${chipClass} border-[#DDF6F0] bg-[#EFFAF6] text-[#0F8C7D]`}>
                        <span className={`h-2 w-2 rounded-full ${qualityTone.dot}`} />
                        {qualityTone.label}
                      </span>
                    ) : null}
                  </div>
                  <div className="relative mt-4">
                    <button
                      onClick={() => setActionsOpen((value) => !value)}
                      className="inline-flex h-11 items-center gap-1.5 rounded-full border border-[#E7EEF5] bg-white px-4 text-[12px] font-medium text-[#667085]"
                    >
                      Opcoes da comparacao <ChevronDown className="h-3.5 w-3.5" />
                    </button>
                    {actionsOpen ? (
                      <div className="absolute left-0 z-40 mt-2 w-[240px] rounded-[20px] border border-[#E7EEF5] bg-white p-2 shadow-[0_24px_50px_rgba(15,23,40,0.12)]">
                        <button onClick={saveComparison} className="flex w-full items-center gap-2 rounded-[14px] px-3 py-3 text-left text-[12px] text-[#667085] transition hover:bg-[#F8FBFD]">
                          <Bookmark className="h-3.5 w-3.5" />
                          Salvar comparacao
                        </button>
                        <button onClick={copyShareLink} className="flex w-full items-center gap-2 rounded-[14px] px-3 py-3 text-left text-[12px] text-[#667085] transition hover:bg-[#F8FBFD]">
                          <Share2 className="h-3.5 w-3.5" />
                          Compartilhar
                        </button>
                        {canCompare ? (
                          <button onClick={createAlert} className="flex w-full items-center gap-2 rounded-[14px] px-3 py-3 text-left text-[12px] text-[#0F8C7D] transition hover:bg-[#EFFAF6]">
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
              <section className={`${surfaceClass} p-10 text-center`}>
                <h2 className="text-[28px] font-semibold tracking-[-0.02em] text-[#0F1728]">Selecione duas empresas para comparar</h2>
                <p className="mx-auto mt-3 max-w-[640px] text-[15px] leading-7 text-[#667085]">
                  Adicione Empresa A e Empresa B para ver quem esta melhor hoje, onde esta o risco e como confirmar.
                </p>
                <div className="mt-6 flex flex-wrap justify-center gap-2">
                  {["WEGE3", "VALE3", "ITUB4"].map((ticker) => (
                    <button key={ticker} onClick={() => addTicker(ticker)} className="rounded-full border border-[#E7EEF5] bg-[#F8FBFD] px-4 py-2 text-[12px] font-medium text-[#667085] transition hover:bg-white">
                      {ticker}
                    </button>
                  ))}
                </div>
              </section>
            ) : refreshing ? (
              <LoadingBlocks />
            ) : (
              <div className="space-y-8">
                {verdict && a && b ? (
                  <section ref={verdictRef} className="scroll-mt-[160px] grid gap-6 xl:grid-cols-12">
                    <article className={`${surfaceClass} relative overflow-hidden p-6 xl:col-span-8`}>
                      <div className="absolute inset-0 bg-[radial-gradient(circle_at_12%_18%,rgba(18,165,148,0.20),transparent_28%),radial-gradient(circle_at_82%_26%,rgba(91,141,239,0.18),transparent_30%),radial-gradient(circle_at_58%_88%,rgba(253,239,242,0.8),transparent_24%),linear-gradient(135deg,rgba(255,255,255,0.84),rgba(248,251,253,0.96))]" />
                      <div className="absolute -left-10 top-10 h-40 w-40 rounded-full bg-[radial-gradient(circle,rgba(18,165,148,0.18),rgba(18,165,148,0))] blur-2xl" />
                      <div className="absolute right-6 top-14 h-44 w-44 rounded-full bg-[radial-gradient(circle,rgba(91,141,239,0.18),rgba(91,141,239,0))] blur-2xl" />
                      <div className="relative">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#12A594]">Veredito da comparacao</p>
                        <div className="mt-4 grid gap-5 xl:grid-cols-[1.2fr_0.8fr]">
                          <div>
                            <h2 className="max-w-[14ch] text-[38px] font-semibold leading-[1.02] tracking-[-0.04em] text-[#0F1728]">
                              {verdict.winner.ticker} aparece mais solida que {verdict.loser.ticker} hoje.
                            </h2>
                            <p className="mt-4 max-w-[62ch] text-[16px] leading-7 text-[#334155]">{verdict.consequence}</p>
                            <div className="mt-5 flex flex-wrap gap-2">
                              <span className="inline-flex items-center gap-2 rounded-full border border-[#DDF6F0] bg-[#EFFAF6] px-4 py-2 text-[12px] font-semibold text-[#0F8C7D]">
                                <Check className="h-3.5 w-3.5" />
                                Confianca da leitura: {verdict.confidence}
                              </span>
                              <span className={chipClass}>Baseado em 5 pilares</span>
                              <span className={chipClass}>Dados oficiais de CVM, B3 e RI</span>
                              <span className={chipClass}>Atualizado em {verdict.latestUpdate}</span>
                            </div>
                            <ul className="mt-6 space-y-3">
                              {verdict.reasons.slice(0, 3).map((reason) => (
                                <li key={reason} className="flex items-start gap-3 rounded-[20px] border border-[#E7EEF5] bg-white/90 px-4 py-3 text-[14px] leading-6 text-[#334155]">
                                  <span className="mt-0.5 grid h-6 w-6 place-items-center rounded-full bg-[#EFFAF6] text-[#12A594]">
                                    <Check className="h-3.5 w-3.5" />
                                  </span>
                                  <span>{reason}</span>
                                </li>
                              ))}
                            </ul>
                            <button
                              onClick={() => {
                                if (verdict.biggestGap) selectPillar(verdict.biggestGap.p);
                              }}
                              className="mt-6 inline-flex items-center gap-1.5 rounded-full border border-[#DDF6F0] bg-[#EFFAF6] px-4 py-2 text-[12px] font-semibold text-[#0F8C7D]"
                            >
                              Ver por que ela vence <ChevronDown className="h-3.5 w-3.5" />
                            </button>
                          </div>

                          <div className="grid gap-4">
                            <div className="rounded-[28px] border border-white/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(248,251,255,0.96))] p-4 shadow-[0_20px_38px_rgba(15,23,40,0.08)] backdrop-blur-sm">
                              <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#98A2B3]">Score de apoio da leitura</p>
                              <div className="mt-4 rounded-[24px] border border-[#E7EEF5] bg-white p-3">
                                <div className="grid gap-3 md:grid-cols-[1fr_1fr_auto]">
                                  <div className="grid grid-cols-[1fr_auto] items-end gap-3 rounded-[20px] border border-[#DDF6F0] bg-[#EFFAF6] px-4 py-4">
                                    <div>
                                      <p className="text-[11px] text-[#667085]">{a.ticker}</p>
                                      <p className="mt-1 text-[26px] font-semibold tracking-[-0.03em] text-[#0F1728]">{formatNumber(scoreboard?.avgA ?? 0, 1)}</p>
                                    </div>
                                    <TickerLogo ticker={a.ticker} size={28} />
                                  </div>
                                  <div className="grid grid-cols-[1fr_auto] items-end gap-3 rounded-[20px] border border-[#D9E8FF] bg-[#EEF6FF] px-4 py-4">
                                    <div>
                                      <p className="text-[11px] text-[#667085]">{b.ticker}</p>
                                      <p className="mt-1 text-[26px] font-semibold tracking-[-0.03em] text-[#0F1728]">{formatNumber(scoreboard?.avgB ?? 0, 1)}</p>
                                    </div>
                                    <TickerLogo ticker={b.ticker} size={28} />
                                  </div>
                                  <div className="flex items-center justify-center">
                                    <div className="hidden h-px w-8 bg-[#DCE5EE] md:block" />
                                  </div>
                                </div>
                              </div>
                              <div className="mt-4 rounded-[22px] border border-[#FDE7EC] bg-[linear-gradient(180deg,#FDEFF2_0%,#FFF8FA_100%)] px-4 py-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.75)]">
                                <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#B54768]">Diferenca</p>
                                <p className="mt-2 text-[34px] font-semibold tracking-[-0.05em] text-[#0F1728]">
                                  {formatNumber(Math.abs((scoreboard?.avgA ?? 0) - (scoreboard?.avgB ?? 0)), 1)} pts
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </article>

                    <aside className="space-y-4 xl:col-span-4">
                      <article className={`${cardClass} bg-[linear-gradient(180deg,#FFF6E8_0%,#FFFFFF_100%)] p-5`}>
                        <p className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-[#B27300]">
                          <TriangleAlert className="h-3.5 w-3.5" />
                          Onde olhar com mais cuidado
                        </p>
                        <p className="mt-3 text-[16px] font-semibold leading-7 text-[#0F1728]">
                          {verdict.keyRisk?.loser.ticker} exige mais atencao em {PILLAR_LABEL[verdict.keyRisk?.p ?? "Divida"]}.
                        </p>
                        <div className="mt-4 flex flex-wrap gap-2">
                          <span className="rounded-full border border-[#F8E1B1] bg-[#FFF6E8] px-3 py-1.5 text-[11px] font-medium text-[#B27300]">
                            Pior score identificado: {formatNumber(verdict.keyRisk?.lowestScore ?? 0, 1)}/10
                          </span>
                        </div>
                      </article>

                      <article className={`${cardClass} bg-[linear-gradient(180deg,#EEF6FF_0%,#FFFFFF_100%)] p-5`}>
                        <p className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-[#3965B8]">
                          <ArrowRightLeft className="h-3.5 w-3.5" />
                          Onde a diferenca realmente aparece
                        </p>
                        <p className="mt-3 text-[16px] font-semibold leading-7 text-[#0F1728]">
                          {PILLAR_LABEL[verdict.biggestGap?.p ?? "Divida"]} e o pilar que mais separa as empresas.
                        </p>
                        <div className="mt-4 rounded-[20px] border border-[#D9E8FF] bg-white/80 px-4 py-4">
                          <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#98A2B3]">Delta de score</p>
                          <p className="mt-1 text-[30px] font-semibold tracking-[-0.04em] text-[#0F1728]">
                            {formatNumber(verdict.biggestGap?.delta ?? 0, 1)}/10
                          </p>
                        </div>
                      </article>
                    </aside>
                  </section>
                ) : null}
                <section className={`${surfaceClass} p-6`}>
                  <div>
                    <h2 className="text-[28px] font-semibold tracking-[-0.03em] text-[#0F1728]">Os 3 fatores que mais separam essas empresas</h2>
                    <p className="mt-2 text-[15px] text-[#667085]">Comece por aqui para decidir onde focar primeiro.</p>
                  </div>
                  <div className="mt-6 grid gap-4 lg:grid-cols-5">
                    {topPillarDiffs.map((item, index) => (
                      <button key={item.p} onClick={() => selectPillar(item.p)} className={`text-left ${index === 0 ? "lg:col-span-2" : "lg:col-span-1"}`}>
                        <article
                          className={`h-full rounded-[28px] border p-5 ${index === 0 ? "min-h-[360px] bg-[linear-gradient(180deg,#EAF4FF_0%,#F7FBFF_42%,#FFFFFF_100%)]" : index === 1 ? "bg-[linear-gradient(180deg,#EFFAF6_0%,#FFFFFF_100%)]" : "bg-[linear-gradient(180deg,#FDEFF2_0%,#FFFFFF_100%)]"} ${item.p === activePillar ? "border-[#9FC5FF] shadow-[0_24px_42px_rgba(91,141,239,0.16)]" : "border-[#E7EEF5] shadow-[0_14px_32px_rgba(15,23,40,0.04)]"}`}
                        >
                          <div className="flex flex-wrap items-start justify-between gap-3">
                            <div>
                              <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#98A2B3]">{PILLAR_LABEL[item.p]}</p>
                              {item.p === activePillar ? <p className="mt-1 text-[11px] font-semibold text-[#3965B8]">Pilar em foco</p> : null}
                            </div>
                            <span className={`${chipClass} ${item.winner.ticker === a?.ticker ? "border-[#DDF6F0] bg-[#EFFAF6] text-[#0F8C7D]" : "border-[#D9E8FF] bg-[#EEF6FF] text-[#3965B8]"}`}>
                              <Crown className="h-3 w-3" />
                              {item.winner.ticker}
                            </span>
                          </div>
                          <div className="mt-4">
                            <p className="text-[13px] font-medium leading-6 text-[#334155]">{item.winner.ticker} leva vantagem.</p>
                            <p className="mt-2 text-[13px] leading-6 text-[#667085]">{pillarInsight(item.p, item.winner.ticker)}</p>
                          </div>
                          <div className="mt-5 rounded-[22px] border border-white/70 bg-white/90 p-4">
                            <PillarDumbbell
                              leftTicker={a!.ticker}
                              rightTicker={b!.ticker}
                              leftScore={item.da.score}
                              rightScore={item.db.score}
                              winner={item.winner.ticker}
                              emphasis={item.p === activePillar}
                            />
                          </div>
                          <div className="mt-4 flex flex-wrap gap-2">
                            <span className={`${chipClass} border-[#FDE7EC] bg-[#FDEFF2] text-[#B54768] ${index === 0 ? "px-4 py-2 text-[12px] font-semibold" : ""}`}>Delta {formatNumber(item.delta, 1)}</span>
                            <span className={chipClass}>
                              {trendIcon(item.winnerTrend)}
                              {trendLabel[item.winnerTrend]}
                            </span>
                          </div>
                          <p className="mt-4 text-[12px] leading-6 text-[#667085]">{trendContext(item.winnerTrend)}.</p>
                        </article>
                      </button>
                    ))}
                  </div>
                </section>

                <section className={`${surfaceClass} p-6`}>
                  <div>
                    <h2 className="text-[24px] font-semibold tracking-[-0.02em] text-[#0F1728]">Todos os pilares</h2>
                    <p className="mt-2 text-[15px] text-[#667085]">Veja quem vence, quanto separa e por que isso importa na tese.</p>
                  </div>
                  <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
                    {[...topPillarDiffs, ...otherPillarDiffs].map((item) => (
                      <button key={item.p} onClick={() => selectPillar(item.p)} className="text-left">
                        <article
                          className={`h-full rounded-[24px] border p-4 transition ${item.p === activePillar ? "border-[#BFD8FF] bg-[#FCFEFF] shadow-[0_16px_32px_rgba(91,141,239,0.10)]" : "border-[#E7EEF5] bg-white shadow-[0_10px_26px_rgba(15,23,40,0.03)] hover:-translate-y-1"}`}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <p className="text-[15px] font-semibold text-[#0F1728]">{PILLAR_LABEL[item.p]}</p>
                              {item.p === activePillar ? <p className="mt-1 text-[11px] font-semibold text-[#3965B8]">Pilar em foco</p> : null}
                            </div>
                            <span className={`${chipClass} ${item.winner.ticker === a?.ticker ? "border-[#DDF6F0] bg-[#EFFAF6] text-[#0F8C7D]" : "border-[#D9E8FF] bg-[#EEF6FF] text-[#3965B8]"}`}>{item.winner.ticker}</span>
                          </div>
                          <div className="mt-4">
                            <PillarDumbbell
                              leftTicker={a!.ticker}
                              rightTicker={b!.ticker}
                              leftScore={item.da.score}
                              rightScore={item.db.score}
                              winner={item.winner.ticker}
                              emphasis={item.p === activePillar}
                            />
                          </div>
                          <div className="mt-4 flex flex-wrap gap-2">
                            <span className={`${chipClass} border-[#FDE7EC] bg-[#FDEFF2] text-[#B54768]`}>Delta {formatNumber(item.delta, 1)}/10</span>
                          </div>
                          <p className="mt-4 text-[12px] leading-6 text-[#667085]">{pillarConsequence(item.p, item.delta, item.winner.ticker)}</p>
                        </article>
                      </button>
                    ))}
                  </div>
                </section>

                <section ref={detailRef} className={`${surfaceClass} scroll-mt-[160px] p-6`}>
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <h2 className="text-[28px] font-semibold tracking-[-0.03em] text-[#0F1728]">Detalhe guiado do pilar: {PILLAR_LABEL[activePillar]}</h2>
                    {a && b ? (
                      <button
                        onClick={() => {
                          const metricA = a.pillars[activePillar].metrics[0];
                          const metricB = b.pillars[activePillar].metrics.find((metric) => metric.name === metricA.name);
                          setEvidence({
                            metricName: metricA.name,
                            definition: metricA.definition,
                            unit: metricA.unit,
                            source: metricA.source,
                            aTicker: a.ticker,
                            bTicker: b.ticker,
                            aValue: metricA.value,
                            bValue: metricB?.value ?? null,
                          });
                        }}
                        className="inline-flex items-center gap-1.5 rounded-full border border-[#E7EEF5] bg-white px-4 py-2 text-[12px] font-medium text-[#667085]"
                      >
                        <FileText className="h-3.5 w-3.5" />
                        Confirmar na fonte
                      </button>
                    ) : null}
                  </div>

                  <div className="mt-6 grid gap-5 xl:grid-cols-12">
                    <article className="space-y-4 xl:col-span-4">
                      <div className={`${cardClass} bg-[linear-gradient(180deg,#EEF6FF_0%,#FFFFFF_100%)] p-5`}>
                        {a && b ? (
                          <div>
                            <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#98A2B3]">Resumo do pilar</p>
                            <p className="mt-3 text-[18px] font-semibold leading-7 text-[#0F1728]">
                              {a.pillars[activePillar].score >= b.pillars[activePillar].score ? a.ticker : b.ticker} esta melhor neste pilar hoje.
                            </p>
                          </div>
                        ) : null}
                        <div className="mt-5 grid gap-3">
                          <div className="rounded-[20px] border border-[#E7EEF5] bg-white px-4 py-4">
                            <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#98A2B3]">O que isso quer dizer</p>
                            <p className="mt-2 text-[14px] leading-6 text-[#334155]">{pillarCopy[activePillar].what}</p>
                          </div>
                          <div className="rounded-[20px] border border-[#E7EEF5] bg-white px-4 py-4">
                            <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#98A2B3]">Por que isso pesa na analise</p>
                            <p className="mt-2 text-[14px] leading-6 text-[#334155]">{pillarCopy[activePillar].why}</p>
                          </div>
                          <div className="rounded-[20px] border border-[#E7EEF5] bg-white px-4 py-4">
                            <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#98A2B3]">O que observar com atencao</p>
                            <p className="mt-2 text-[14px] leading-6 text-[#334155]">{pillarCopy[activePillar].how}</p>
                            <div className="mt-4 flex flex-wrap gap-2">
                              {pillarCopy[activePillar].ranges.map((rangeItem) => (
                                <span key={rangeItem} className={chipClass}>{rangeItem}</span>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </article>

                    <article className={`${cardClass} overflow-hidden p-5 xl:col-span-8`}>
                      {a && b ? (
                        <>
                          <div className="rounded-[24px] border border-[#E7EEF5] bg-[#FCFEFF] p-4">
                            <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
                              <div>
                                <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#98A2B3]">Leitura do periodo</p>
                                <p className="mt-3 text-[16px] font-medium leading-7 text-[#334155]">
                                  {a.pillars[activePillar].score >= b.pillars[activePillar].score ? a.ticker : b.ticker} mostra trajetoria mais favoravel, enquanto {a.pillars[activePillar].score >= b.pillars[activePillar].score ? b.ticker : a.ticker} perdeu tracao relativa.
                                </p>
                                {scoreVsChartContext ? (
                                  <p className="mt-4 rounded-[18px] border border-[#F8E1B1] bg-[#FFF6E8] px-4 py-3 text-[13px] leading-6 text-[#B27300]">{scoreVsChartContext}</p>
                                ) : null}
                              </div>
                              <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
                                <div className="rounded-[20px] border border-[#DDF6F0] bg-[#EFFAF6] px-4 py-4">
                                  <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#0F8C7D]">Direcao desejavel</p>
                                  <p className="mt-2 text-[16px] font-semibold text-[#0F1728]">{activeIsLowerBetter ? "linha descendente" : "linha ascendente"}</p>
                                </div>
                                {latestChartLeader ? (
                                  <div className="rounded-[20px] border border-[#D9E8FF] bg-[#EEF6FF] px-4 py-4">
                                    <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#3965B8]">Vantagem atual</p>
                                    <p className="mt-2 text-[16px] font-semibold text-[#0F1728]">{latestChartLeader}</p>
                                  </div>
                                ) : null}
                                {latestChartDelta !== null ? (
                                  <div className="rounded-[20px] border border-[#FDE7EC] bg-[#FDEFF2] px-4 py-4">
                                    <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#B54768]">Delta final</p>
                                    <p className="mt-2 text-[16px] font-semibold text-[#0F1728]">{formatNumber(latestChartDelta, 1)}</p>
                                  </div>
                                ) : null}
                              </div>
                            </div>
                            <div className="mt-4 flex flex-wrap gap-2 text-[11px] text-[#667085]">
                              <span className={chipClass}>Regra: {a.pillars[activePillar].thresholdLabel}</span>
                              <span className={chipClass}><span className="h-2 w-2 rounded-full bg-[#12A594]" />{a.ticker}</span>
                              <span className={chipClass}><span className="h-2 w-2 rounded-full bg-[#5B8DEF]" />{b.ticker}</span>
                            </div>
                          </div>

                          <div className="mt-5 h-[340px] rounded-[24px] border border-[#E7EEF5] bg-white p-4">
                            <ResponsiveContainer width="100%" height="100%">
                              <LineChart data={chartData}>
                                <CartesianGrid stroke="#E8EEF5" strokeDasharray="3 4" vertical={false} />
                                <ReferenceArea y1={a.pillars[activePillar].bands.safe[0]} y2={a.pillars[activePillar].bands.safe[1]} fill="#EEF6FF" fillOpacity={0.65} />
                                <ReferenceArea y1={a.pillars[activePillar].bands.warning[0]} y2={a.pillars[activePillar].bands.warning[1]} fill="#FFF6E8" fillOpacity={0.6} />
                                <ReferenceArea y1={a.pillars[activePillar].bands.risk[0]} y2={a.pillars[activePillar].bands.risk[1]} fill="#FDEFF2" fillOpacity={0.62} />
                                <XAxis dataKey="year" tick={{ fontSize: 11, fill: "#98A2B3" }} axisLine={false} tickLine={false} />
                                <YAxis domain={a.pillars[activePillar].domain} tick={{ fontSize: 11, fill: "#98A2B3" }} axisLine={false} tickLine={false} width={34} />
                                <Tooltip
                                  content={({ active, payload, label }) =>
                                    !active || !payload?.length ? null : (
                                      <div className="rounded-[16px] border border-[#E7EEF5] bg-white p-3 text-[12px] shadow-[0_18px_32px_rgba(15,23,40,0.12)]">
                                        <p className="font-semibold text-[#0F1728]">Ano: {label}</p>
                                        {payload.map((item) => (
                                          <p key={`${item.name}-${label}`} style={{ color: item.color as string }}>
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
                                  strokeWidth={3.2}
                                  dot={({ cx, cy, index: pointIndex, payload }) => {
                                    if (cx == null || cy == null) return null;
                                    const isLast = pointIndex === chartData.length - 1;
                                    return (
                                      <g>
                                        <circle cx={cx} cy={cy} r={isLast ? 6 : 3} fill={TOKENS.companyA} stroke="#fff" strokeWidth={isLast ? 3 : 2} />
                                        {isLast ? (
                                          <>
                                            <circle cx={cx} cy={cy} r={11} fill="rgba(18,165,148,0.10)" />
                                            <rect x={cx + 10} y={cy - 16} rx={10} ry={10} width={58} height={22} fill="#EFFAF6" stroke="#DDF6F0" />
                                            <text x={cx + 39} y={cy - 2} textAnchor="middle" fontSize="11" fontWeight="700" fill="#0F8C7D">
                                              {payload?.a != null ? `${a.ticker}` : ""}
                                            </text>
                                          </>
                                        ) : null}
                                      </g>
                                    );
                                  }}
                                  activeDot={{ r: 6 }}
                                >
                                  <LabelList
                                    dataKey="a"
                                    content={({ x, y, index: pointIndex, value }) =>
                                      pointIndex === chartData.length - 1 && x != null && y != null && value != null ? (
                                        <text x={Number(x) + 39} y={Number(y) + 13} textAnchor="middle" fontSize="11" fill="#0F8C7D">
                                          {formatNumber(Number(value), 1)}
                                        </text>
                                      ) : null
                                    }
                                  />
                                </Line>
                                <Line
                                  type="monotone"
                                  dataKey="b"
                                  name={b.ticker}
                                  stroke={TOKENS.companyB}
                                  strokeWidth={3.2}
                                  dot={({ cx, cy, index: pointIndex, payload }) => {
                                    if (cx == null || cy == null) return null;
                                    const isLast = pointIndex === chartData.length - 1;
                                    return (
                                      <g>
                                        <circle cx={cx} cy={cy} r={isLast ? 6 : 3} fill={TOKENS.companyB} stroke="#fff" strokeWidth={isLast ? 3 : 2} />
                                        {isLast ? (
                                          <>
                                            <circle cx={cx} cy={cy} r={11} fill="rgba(91,141,239,0.10)" />
                                            <rect x={cx + 10} y={cy + 6} rx={10} ry={10} width={58} height={22} fill="#EEF6FF" stroke="#D9E8FF" />
                                            <text x={cx + 39} y={cy + 20} textAnchor="middle" fontSize="11" fontWeight="700" fill="#3965B8">
                                              {payload?.b != null ? `${b.ticker}` : ""}
                                            </text>
                                          </>
                                        ) : null}
                                      </g>
                                    );
                                  }}
                                  activeDot={{ r: 6 }}
                                >
                                  <LabelList
                                    dataKey="b"
                                    content={({ x, y, index: pointIndex, value }) =>
                                      pointIndex === chartData.length - 1 && x != null && y != null && value != null ? (
                                        <text x={Number(x) + 39} y={Number(y) + 40} textAnchor="middle" fontSize="11" fill="#3965B8">
                                          {formatNumber(Number(value), 1)}
                                        </text>
                                      ) : null
                                    }
                                  />
                                </Line>
                              </LineChart>
                            </ResponsiveContainer>
                          </div>
                        </>
                      ) : null}
                    </article>
                  </div>
                </section>
                <section className={`${surfaceClass} p-6`}>
                  <div>
                    <h2 className="text-[24px] font-semibold tracking-[-0.02em] text-[#0F1728]">Evidencias por metrica</h2>
                    <p className="mt-2 text-[15px] text-[#667085]">Compare numeros completos, tendencia e winner por item.</p>
                    {activePillarWinnerSummary ? <p className="mt-3 text-[14px] font-medium text-[#334155]">{activePillarWinnerSummary}</p> : null}
                  </div>
                  {a && b ? (
                    <div className="mt-6 space-y-4">
                      {tableRows.map((row) => (
                        <MetricComparisonRow
                          key={row.name}
                          row={row}
                          aTicker={a.ticker}
                          bTicker={b.ticker}
                          formatMetric={formatMetric}
                          formatNumber={formatNumber}
                          metricWinner={metricWinner}
                          metricDelta={metricDelta}
                          evidenceReadLabel={evidenceReadLabel}
                          openEvidence={openEvidence}
                        />
                      ))}
                    </div>
                  ) : null}
                </section>

                <section className={`${surfaceClass} p-6`}>
                  <div>
                    <h2 className="text-[24px] font-semibold tracking-[-0.02em] text-[#0F1728]">O que pode explicar essa diferenca</h2>
                    <p className="mt-2 text-[15px] text-[#667085]">Contexto recente + como verificamos os dados.</p>
                  </div>

                  <div className="mt-6 grid gap-5 xl:grid-cols-12">
                    <article className="space-y-4 xl:col-span-8">
                      <div className="rounded-[28px] border border-[#DDF6F0] bg-[linear-gradient(180deg,#EFFAF6_0%,#FFFFFF_100%)] p-5 shadow-[0_16px_30px_rgba(18,165,148,0.07)]">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#0F8C7D]">Sintese principal (90 dias)</p>
                        <p className="mt-3 text-[16px] leading-7 text-[#334155]">{mainExplainer}</p>
                      </div>

                      <div className="rounded-[24px] border border-[#E7EEF5] bg-white p-4">
                        <button onClick={() => setEventsOpen((value) => !value)} className="flex w-full items-center justify-between gap-3 text-left">
                          <span className="text-[15px] font-semibold text-[#0F1728]">
                            Eventos recentes (90 dias)
                            <span className="ml-2 text-[13px] font-normal text-[#667085]">
                              {recentEvents.length} eventos - {eventsOnActivePillar} impactam {PILLAR_LABEL[activePillar]}
                            </span>
                          </span>
                          {eventsOpen ? <ChevronUp className="h-4 w-4 text-[#98A2B3]" /> : <ChevronDown className="h-4 w-4 text-[#98A2B3]" />}
                        </button>

                        {eventsOpen ? (
                          <div className="mt-5 space-y-4">
                            {recentEvents.length ? (
                              recentEvents.map((event, index) => (
                                <article key={event.id} className="grid gap-3 md:grid-cols-[28px_1fr]">
                                  <div className="relative flex items-start justify-center">
                                    <span className="mt-1 h-3 w-3 rounded-full border-2 border-white bg-[#12A594] shadow-[0_0_0_6px_rgba(18,165,148,0.08)]" />
                                    {index < recentEvents.length - 1 ? <span className="absolute top-5 h-[calc(100%+8px)] w-px bg-[#E7EEF5]" /> : null}
                                  </div>
                                  <div className="rounded-[20px] border border-[#E7EEF5] bg-[#FBFDFF] p-4">
                                    <div className="flex flex-wrap items-center gap-2 text-[11px] text-[#667085]">
                                      <span className={chipClass}>{event.date}</span>
                                      <span className={event.type === "Fato relevante" ? "rounded-full border border-[#F8E1B1] bg-[#FFF6E8] px-3 py-1.5 text-[11px] font-medium text-[#B27300]" : chipClass}>{event.type}</span>
                                      <span className={chipClass}>{PILLAR_LABEL[event.impact]}</span>
                                      <span className={chipClass}>{event.ticker}</span>
                                    </div>
                                    <p className="mt-3 text-[14px] leading-6 text-[#334155]">{event.summary}</p>
                                  </div>
                                </article>
                              ))
                            ) : null}
                          </div>
                        ) : null}
                      </div>
                    </article>

                    <aside className="space-y-4 xl:col-span-4">
                      <article className={`${cardClass} bg-[radial-gradient(circle_at_top_left,rgba(91,141,239,0.14),transparent_42%),linear-gradient(180deg,#F7FBFF_0%,#FFFFFF_100%)] p-5`}>
                        <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#3965B8]">Contexto recente + como verificamos os dados</p>
                        <div className="mt-4 rounded-[22px] border border-[#E7EEF5] bg-white/90 p-3">
                          <div className="flex flex-wrap gap-2 text-[11px] text-[#667085]">
                            <span className={`${chipClass} border-[#D9E8FF] bg-[#EEF6FF] text-[#3965B8]`}>Atualizado em {latestUpdate ?? "-"}</span>
                            <span className={`${chipClass} border-[#DDF6F0] bg-[#EFFAF6] text-[#0F8C7D]`}>Fontes CVM/B3/RI</span>
                            <span className={chipClass}>{recentEvents.length} eventos recentes</span>
                            <span className={`${chipClass} border-[#FFF0CF] bg-[#FFF6E8] text-[#B27300]`}>{eventsOnActivePillar} impactam {PILLAR_LABEL[activePillar]}</span>
                          </div>
                        </div>

                        <button
                          onClick={() => setQualityOpen((value) => !value)}
                          className="mt-4 inline-flex items-center gap-1.5 rounded-full border border-[#E7EEF5] bg-white px-4 py-2 text-[12px] font-medium text-[#667085]"
                        >
                          Fonte
                          {qualityOpen ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                        </button>

                        {qualityOpen ? (
                          <div className="mt-4 space-y-3">
                            <div className="rounded-[20px] border border-[#E7EEF5] bg-white px-4 py-4">
                              <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#98A2B3]">Fonte</p>
                              <p className="mt-2 text-[14px] leading-6 text-[#334155]">{pair.map((company) => company.primarySource).join(" | ")}</p>
                            </div>
                            <div className="rounded-[20px] border border-[#E7EEF5] bg-white px-4 py-4">
                              <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#98A2B3]">Como calculamos</p>
                              <p className="mt-2 text-[14px] leading-6 text-[#334155]">{a?.pillars[activePillar].metrics[0]?.source.method ?? "-"}</p>
                            </div>
                          </div>
                        ) : null}
                      </article>
                    </aside>
                  </div>
                </section>
              </div>
            )}
          </div>
        </div>
      </main>

      <CompareEvidenceDrawer data={evidence} onClose={() => setEvidence(null)} formatMetric={formatMetric} />

      {toast ? (
        <div className="fixed bottom-5 right-5 z-50 rounded-full border border-[#DDF6F0] bg-white px-4 py-2 text-[12px] font-medium text-[#0F8C7D] shadow-[0_18px_36px_rgba(15,23,40,0.12)]">
          {toast}
        </div>
      ) : null}
    </div>
  );
}

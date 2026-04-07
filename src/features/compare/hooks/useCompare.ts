"use client";

/**
 * useCompare
 *
 * Centraliza todo o estado e a lógica da página de Comparação:
 *  - Seleção de tickers e busca no picker
 *  - Pilar ativo e intervalo de tempo
 *  - Controle de UI (sticky, toast, drawers, refresh)
 *  - Dados derivados (scoreboard, pillarDiffs, verdict, tableRows, chartData, etc.)
 *  - Callbacks (addTicker, selectPillar, openEvidence, copyShareLink, etc.)
 *
 * O componente ComparePage só precisa destructurar o retorno e renderizar o JSX.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";

import {
  PILLARS,
  PILLAR_LABEL,
  RANGES,
  CATEGORIES,
  companies,
  enrichedCompanies,
  events,
  deriveScoreboard,
  derivePillarDiffs,
  deriveVerdict,
  trendFromSeries,
  metricWinner,
  metricDelta,
  evidenceReadLabel,
  formatMetric,
  formatNumber,
  pillarInsight,
  pillarConsequence,
  trendContext,
  trendNarrative,
  parseDate,
  confidenceLabel,
  fetchCompareData,
  fetchAndMergeCompareSection,
  buildCompareEnrichedStub,
  type CompareSectionKey,
} from "../services";

import type {
  ComparePillar,
  CompareRangeKey,
  CompareCategorySlug,
  CompareCompany,
  CompareEnrichedCompany,
  CompareEvidence,
  CompareEventItem,
  CompareMetric,
  ComparePillarDiff,
  CompareScoreboard,
  CompareSummary,
  CompareTableRow,
  CompareVerdict,
  CompareQualityTone,
  CompareNarrativeBundle,
} from "../interfaces";

const EMPTY_NARRATIVES: CompareNarrativeBundle = {
  summary: null,
  value: null,
  future: null,
  past: null,
  health: null,
  dividend: null,
};

// ─── Tipo de retorno do hook ──────────────────────────────────────────────────

export interface UseCompareReturn {
  // Refs
  detailRef: React.RefObject<HTMLDivElement | null>;
  verdictRef: React.RefObject<HTMLElement | null>;

  // Estado de seleção
  selectedTickers: string[];
  search: string;
  openPicker: boolean;

  // Estado do painel principal
  categoria: CompareCategorySlug;
  activePillar: ComparePillar;
  range: CompareRangeKey;
  eventsOpen: boolean;
  qualityOpen: boolean;
  refreshing: boolean;
  loadingApi: boolean;
  evidence: CompareEvidence | null;
  toast: string;
  compactSticky: boolean;
  actionsOpen: boolean;
  customFrom: string;
  setCustomFrom: (v: string) => void;
  customTo: string;
  setCustomTo: (v: string) => void;
  comparisonHistory: Array<{ tickers: string[]; label: string; savedAt: string }>;
  historyOpen: boolean;
  setHistoryOpen: (v: boolean | ((prev: boolean) => boolean)) => void;

  // Dados derivados de empresas
  selected: CompareCompany[];
  pair: CompareCompany[];
  a: CompareCompany | undefined;
  b: CompareCompany | undefined;
  enrichedA: CompareEnrichedCompany | undefined;
  enrichedB: CompareEnrichedCompany | undefined;
  canCompare: boolean;
  available: CompareCompany[];

  // Dados derivados de cálculo
  chartData: Array<{ year: number; a: number | null; b: number | null }>;
  scoreboard: CompareScoreboard | null;
  summary: CompareSummary | null;
  narratives: CompareNarrativeBundle;
  compareError: "ticker-not-found" | "invalid-compare-params" | "compare-failed" | null;
  pillarDiffs: ComparePillarDiff[];
  topPillarDiffs: ComparePillarDiff[];
  otherPillarDiffs: ComparePillarDiff[];
  verdict: CompareVerdict | null;
  tableRows: CompareTableRow[];
  activePillarWinnerSummary: string | null;
  recentEvents: CompareEventItem[];
  eventsOnActivePillar: number;
  mainExplainer: string;
  latestChartDelta: number | null;
  latestChartLeader: string | null;
  activePillarScoreWinner: string | null;
  scoreVsChartContext: string | null;
  qualityTone: CompareQualityTone;

  // Ações de seleção
  setSearch: (s: string) => void;
  setOpenPicker: (v: boolean | ((prev: boolean) => boolean)) => void;
  setSelectedTickers: (v: string[] | ((prev: string[]) => string[])) => void;
  addTicker: (ticker: string, companyName?: string, logoUrl?: string | null) => void;
  companyNames: Record<string, string>;
  companyLogos: Record<string, string>;
  swapCompanies: () => void;

  // Ações do painel
  setCategoria: (c: CompareCategorySlug) => void;
  selectPillar: (pillar: ComparePillar) => void;
  setRange: (r: CompareRangeKey) => void;
  setEventsOpen: (v: boolean | ((prev: boolean) => boolean)) => void;
  setQualityOpen: (v: boolean | ((prev: boolean) => boolean)) => void;
  setEvidence: (e: CompareEvidence | null) => void;
  setToast: (msg: string) => void;
  setActionsOpen: (v: boolean | ((prev: boolean) => boolean)) => void;
  openEvidence: (row: CompareTableRow) => void;
  copyShareLink: () => Promise<void>;
  saveComparison: () => void;
  createAlert: () => void;

  // Helpers expostos (usados no JSX)
  PILLARS: typeof PILLARS;
  PILLAR_LABEL: typeof PILLAR_LABEL;
  RANGES: typeof RANGES;
  CATEGORIES: typeof CATEGORIES;
  formatMetric: typeof formatMetric;
  metricDelta: typeof metricDelta;
  metricWinner: typeof metricWinner;
  evidenceReadLabel: typeof evidenceReadLabel;
  pillarInsight: typeof pillarInsight;
  pillarConsequence: typeof pillarConsequence;
  trendContext: typeof trendContext;
  formatNumber: typeof formatNumber;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useCompare(): UseCompareReturn {
  const searchParams = useSearchParams();
  const router = useRouter();
  const detailRef = useRef<HTMLDivElement | null>(null);
  const verdictRef = useRef<HTMLElement | null>(null);
  const mounted = useRef(false);

  // — Estado de seleção (inicializa da URL) —
  const [selectedTickers, setSelectedTickers] = useState<string[]>(() => {
    const param = searchParams.get("tickers");
    if (!param) return [];
    return param.split(",").map((t) => t.trim().toUpperCase()).filter(Boolean).slice(0, 2);
  });
  const [search, setSearch] = useState("");
  const [openPicker, setOpenPicker] = useState(false);
  const [companyNames, setCompanyNames] = useState<Record<string, string>>({});
  const [companyLogos, setCompanyLogos] = useState<Record<string, string>>({});

  // — Estado do painel —
  const [categoria, setCategoriaState] = useState<CompareCategorySlug>(() => {
    const param = searchParams.get("categoria");
    if (param && CATEGORIES.some((c) => c.slug === param)) return param as CompareCategorySlug;
    return "todas";
  });
  const [activePillar, setActivePillar] = useState<ComparePillar>("Divida");
  const [range, setRange] = useState<CompareRangeKey>("1m");
  const [eventsOpen, setEventsOpen] = useState(false);
  const [qualityOpen, setQualityOpen] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [evidence, setEvidence] = useState<CompareEvidence | null>(null);
  const [toast, setToast] = useState("");
  const [compactSticky, setCompactSticky] = useState(false);
  const [actionsOpen, setActionsOpen] = useState(false);
  const [customFrom, setCustomFrom] = useState("");
  const [customTo, setCustomTo] = useState("");
  const [comparisonHistory, setComparisonHistory] = useState<Array<{
    tickers: string[];
    label: string;
    savedAt: string;
  }>>([]);
  const [historyOpen, setHistoryOpen] = useState(false);

  // — Sincroniza tickers + categoria → URL —
  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());
    if (selectedTickers.length > 0) {
      params.set("tickers", selectedTickers.join(","));
    } else {
      params.delete("tickers");
    }
    if (categoria !== "todas") {
      params.set("categoria", categoria);
    } else {
      params.delete("categoria");
    }
    const newUrl = `${window.location.pathname}?${params.toString()}`;
    if (newUrl !== `${window.location.pathname}${window.location.search}`) {
      router.replace(newUrl, { scroll: false });
    }
  }, [selectedTickers, categoria, router, searchParams]);

  // — Dados derivados básicos —
  const tickerA = selectedTickers[0] ?? null;
  const tickerB = selectedTickers[1] ?? null;
  const canCompare = selectedTickers.length >= 2;

  // Fetched enriched data from API
  const [enrichedA, setEnrichedA] = useState<CompareEnrichedCompany | undefined>(undefined);
  const [enrichedB, setEnrichedB] = useState<CompareEnrichedCompany | undefined>(undefined);
  const [summary, setSummary] = useState<CompareSummary | null>(null);
  const [narratives, setNarratives] = useState<CompareNarrativeBundle>(EMPTY_NARRATIVES);
  const [compareError, setCompareError] = useState<
    "ticker-not-found" | "invalid-compare-params" | "compare-failed" | null
  >(null);
  const [loadingApi, setLoadingApi] = useState(false);

  // Tracks which slices of the enriched object are already populated with REAL
  // server data (vs. stub defaults). The literal "full" means the overview
  // endpoint already hydrated everything (header, snowflake, summary, all 5
  // sections). Otherwise individual section keys may be present.
  type LoadedKey = "full" | CompareSectionKey;
  const [loadedSections, setLoadedSections] = useState<Set<LoadedKey>>(() => new Set());

  // Maps the user-facing categoria slug to the data slice required to render
  // it. Categories that depend on globals (snowflake, scoreboard, metric tables,
  // timeline) require the full payload because the section endpoints don't
  // expose them. Section-only categories can be served by /section/{key}.
  const SECTION_BY_CATEGORIA: Record<CompareCategorySlug, CompareSectionKey | "full"> = {
    todas: "full",
    "visao-geral": "full",
    metricas: "full",
    timeline: "full",
    valuation: "value",
    crescimento: "future",
    passado: "past",
    saude: "health",
    dividendos: "dividend",
  };

  // Reset all loaded data when the ticker pair changes — loaded sections from
  // a previous pair are not valid for the new one.
  useEffect(() => {
    setEnrichedA(undefined);
    setEnrichedB(undefined);
    setSummary(null);
    setNarratives(EMPTY_NARRATIVES);
    setLoadedSections(new Set());
    setCompareError(null);
  }, [tickerA, tickerB]);

  // Lazy-load: fetch only the slice required by the current categoria. The
  // first load on a section-only categoria pulls just `/section/{key}` (~30KB)
  // instead of the full ~180KB compare payload. Switching tabs incurs another
  // small section fetch only for slices not yet loaded. Once the user lands on
  // (or starts on) an overview-style category we upgrade to the full payload,
  // which marks every slice as loaded so subsequent tab switches are free.
  useEffect(() => {
    if (!tickerA || !tickerB) return;
    const target = SECTION_BY_CATEGORIA[categoria] ?? "full";
    // Full payload supersedes anything sectional — skip if already fetched.
    if (loadedSections.has("full")) return;
    if (target !== "full" && loadedSections.has(target)) return;

    let cancelled = false;
    setLoadingApi(true);
    setCompareError(null);

    const handleError = (err: unknown) => {
      if (cancelled) return;
      const msg =
        err && typeof err === "object" && "message" in err
          ? String((err as { message: unknown }).message)
          : "";
      if (msg === "ticker-not-found") setCompareError("ticker-not-found");
      else if (msg === "invalid-compare-params") setCompareError("invalid-compare-params");
      else setCompareError("compare-failed");
      setEnrichedA(undefined);
      setEnrichedB(undefined);
      setSummary(null);
      setNarratives(EMPTY_NARRATIVES);
    };

    if (target === "full") {
      fetchCompareData(tickerA, tickerB)
        .then(({ a: dataA, b: dataB, summary: srvSummary, narratives: srvNarratives }) => {
          if (cancelled) return;
          setEnrichedA(dataA);
          setEnrichedB(dataB);
          setSummary(srvSummary);
          setNarratives(srvNarratives);
          setLoadedSections(
            new Set<LoadedKey>(["full", "value", "future", "past", "health", "dividend"]),
          );
        })
        .catch(handleError)
        .finally(() => { if (!cancelled) setLoadingApi(false); });
    } else {
      // Bootstrap stubs on first load so the islands have something to render
      // while only one section is hydrated. Stubs use safe defaults from
      // `withCompareDefaults`, and only the visible island for `target` will
      // expose real data — other islands aren't rendered for this categoria.
      const baseA = enrichedA ?? buildCompareEnrichedStub(tickerA, {
        name: companyNames[tickerA],
        logo: companyLogos[tickerA],
      });
      const baseB = enrichedB ?? buildCompareEnrichedStub(tickerB, {
        name: companyNames[tickerB],
        logo: companyLogos[tickerB],
      });
      fetchAndMergeCompareSection(target, tickerA, tickerB, baseA, baseB)
        .then(({ a: dataA, b: dataB, narrative }) => {
          if (cancelled) return;
          setEnrichedA(dataA);
          setEnrichedB(dataB);
          setNarratives((prev) => ({ ...prev, [target]: narrative }));
          setLoadedSections((prev) => {
            const next = new Set(prev);
            next.add(target);
            return next;
          });
        })
        .catch(handleError)
        .finally(() => { if (!cancelled) setLoadingApi(false); });
    }

    return () => { cancelled = true; };
    // We intentionally include `loadedSections` so the effect re-runs after a
    // section is added (it'll early-return when nothing new is needed). The
    // SECTION_BY_CATEGORIA constant is stable.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tickerA, tickerB, categoria, loadedSections]);

  // Derive CompareCompany from enriched (for backward compat with scoreboard/verdict)
  const a: CompareCompany | undefined = enrichedA;
  const b: CompareCompany | undefined = enrichedB;

  const selected = useMemo(
    () => [enrichedA, enrichedB].filter(Boolean) as CompareCompany[],
    [enrichedA, enrichedB],
  );

  const pair = selected.slice(0, 2);

  const available = useMemo(
    () =>
      companies.filter(
        (c) =>
          !selectedTickers.includes(c.ticker) &&
          (!search ||
            `${c.ticker} ${c.name}`.toLowerCase().includes(search.toLowerCase())),
      ),
    [selectedTickers, search],
  );

  // — Efeitos —

  // Trigger de refresh visual ao trocar seleção/pilar/range
  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true;
      return;
    }
    setRefreshing(true);
    const t = window.setTimeout(() => setRefreshing(false), 350);
    return () => window.clearTimeout(t);
  }, [selectedTickers, activePillar, range, customFrom, customTo]);

  // Auto-dismiss do toast
  useEffect(() => {
    if (!toast) return;
    const t = window.setTimeout(() => setToast(""), 2200);
    return () => window.clearTimeout(t);
  }, [toast]);

  // Fecha actions dropdown ao fazer scroll
  useEffect(() => {
    if (!actionsOpen) return;
    const close = () => setActionsOpen(false);
    window.addEventListener("scroll", close, { passive: true });
    return () => window.removeEventListener("scroll", close);
  }, [actionsOpen]);

  // Sticky compacto ao passar de 110px de scroll
  useEffect(() => {
    const onScroll = () => setCompactSticky(window.scrollY > 110);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // — Dados derivados de cálculo —

  const rangeOpt = RANGES.find((r) => r.key === range);
  const years = rangeOpt?.years ?? null;
  const months = rangeOpt?.months ?? null;

  const chartData = useMemo(() => {
    if (!a || !b) return [];
    const sliceCount = years ? years : months ? Math.ceil(months / 12) : null;
    const as = sliceCount
      ? a.pillars[activePillar].series.slice(-sliceCount)
      : a.pillars[activePillar].series;
    const bs = sliceCount
      ? b.pillars[activePillar].series.slice(-sliceCount)
      : b.pillars[activePillar].series;
    return as.map((p, i) => ({ year: p.year, a: p.value, b: bs[i]?.value ?? null }));
  }, [a, b, activePillar, years, months]);

  const scoreboard = useMemo<CompareScoreboard | null>(() => {
    if (!a || !b) return null;
    return deriveScoreboard(a, b);
  }, [a, b]);

  const pillarDiffs = useMemo<ComparePillarDiff[]>(() => {
    if (!a || !b) return [];
    return derivePillarDiffs(a, b);
  }, [a, b]);

  const topPillarDiffs = pillarDiffs.slice(0, 3);
  const otherPillarDiffs = pillarDiffs.slice(3);

  const verdict = useMemo<CompareVerdict | null>(() => {
    if (!a || !b || !scoreboard) return null;
    return deriveVerdict(a, b, pair, scoreboard, pillarDiffs, topPillarDiffs);
  }, [a, b, pair, scoreboard, pillarDiffs, topPillarDiffs]);

  const tableRows = useMemo<CompareTableRow[]>(() => {
    if (!a || !b) return [];
    const ma = a.pillars[activePillar].metrics;
    const mb = b.pillars[activePillar].metrics;
    const names = Array.from(new Set([...ma.map((m) => m.name), ...mb.map((m) => m.name)]));
    return names.map((name) => {
      const am = ma.find((m) => m.name === name) ?? null;
      const bm = mb.find((m) => m.name === name) ?? null;
      return {
        name,
        definition: am?.definition ?? bm?.definition ?? "Sem definicao",
        unit: am?.unit ?? bm?.unit ?? "",
        direction: am?.direction ?? bm?.direction ?? "higher-better",
        a: am,
        b: bm,
      };
    });
  }, [a, b, activePillar]);

  const activePillarWinnerSummary = useMemo<string | null>(() => {
    if (!a || !b || !tableRows.length) return null;
    const winsA = tableRows.filter(
      (row) => metricWinner(row.direction, row.a?.value ?? null, row.b?.value ?? null) === "a",
    ).length;
    const winsB = tableRows.filter(
      (row) => metricWinner(row.direction, row.a?.value ?? null, row.b?.value ?? null) === "b",
    ).length;
    const leader = winsA >= winsB ? a.ticker : b.ticker;
    const wins = Math.max(winsA, winsB);
    return `${leader} vence em ${wins} de ${tableRows.length} metricas deste pilar.`;
  }, [a, b, tableRows]);

  const recentEvents = useMemo<CompareEventItem[]>(() => {
    if (!a || !b) return [];
    const now = new Date(2026, 2, 6).getTime();
    const d90 = 90 * 24 * 60 * 60 * 1000;
    return events.filter(
      (e) => [a.ticker, b.ticker].includes(e.ticker) && now - parseDate(e.date) <= d90,
    );
  }, [a, b]);

  const eventsOnActivePillar = useMemo(
    () => recentEvents.filter((event) => event.impact === activePillar).length,
    [recentEvents, activePillar],
  );

  const mainExplainer = useMemo(() => {
    if (!a || !b) return "";
    const aScore = a.pillars[activePillar].score;
    const bScore = b.pillars[activePillar].score;
    const winner = aScore >= bScore ? a : b;
    const loser = winner.ticker === a.ticker ? b : a;
    const winnerTrend = trendFromSeries(winner.pillars[activePillar].series);
    const loserTrend = trendFromSeries(loser.pillars[activePillar].series);
    const ranked = [...recentEvents].sort((x, y) => parseDate(y.date) - parseDate(x.date));
    const head = ranked[0];
    const eventClause = head
      ? ` O evento mais relevante foi ${head.summary.toLowerCase()} (${head.ticker}, ${head.date}).`
      : "";
    return `Nos ultimos 90 dias, a diferenca em ${PILLAR_LABEL[activePillar]} ampliou porque ${trendNarrative(winnerTrend, winner.ticker)}, enquanto ${trendNarrative(loserTrend, loser.ticker)}.${eventClause}`;
  }, [a, b, activePillar, recentEvents]);

  const latestChartDelta = useMemo<number | null>(() => {
    if (!chartData.length) return null;
    const last = chartData[chartData.length - 1];
    if (
      last?.a === null ||
      last?.b === null ||
      last?.a === undefined ||
      last?.b === undefined
    )
      return null;
    return Math.abs(Number(last.a) - Number(last.b));
  }, [chartData]);

  const latestChartLeader = useMemo<string | null>(() => {
    if (!a || !b || !chartData.length) return null;
    const last = chartData[chartData.length - 1];
    if (
      last?.a === null ||
      last?.b === null ||
      last?.a === undefined ||
      last?.b === undefined
    )
      return null;
    const betterIsHigher = a.pillars[activePillar].thresholdLabel
      .toLowerCase()
      .includes("maior");
    if (last.a === last.b) return null;
    const winnerIsA = betterIsHigher
      ? Number(last.a) > Number(last.b)
      : Number(last.a) < Number(last.b);
    return winnerIsA ? a.ticker : b.ticker;
  }, [a, b, activePillar, chartData]);

  const activePillarScoreWinner = useMemo<string | null>(() => {
    if (!a || !b) return null;
    return a.pillars[activePillar].score >= b.pillars[activePillar].score
      ? a.ticker
      : b.ticker;
  }, [a, b, activePillar]);

  const scoreVsChartContext = useMemo<string | null>(() => {
    if (!a || !b || !latestChartLeader || !activePillarScoreWinner) return null;
    if (latestChartLeader === activePillarScoreWinner) return null;
    const scoreWinner = activePillarScoreWinner === a.ticker ? a : b;
    const chartWinner = latestChartLeader === a.ticker ? a : b;
    return `Apesar de ${chartWinner.ticker} liderar no ponto mais recente do grafico, ${scoreWinner.ticker} fecha melhor o pilar por combinacao entre metricas, estabilidade e leitura agregada.`;
  }, [a, b, latestChartLeader, activePillarScoreWinner]);

  const qualityTone = useMemo<CompareQualityTone>(() => {
    const latest = pair
      .map((c) => c.updatedAt)
      .sort((x, y) => parseDate(y) - parseDate(x))[0];
    const hasCriticalGap = pair.some((c) =>
      c.gaps.some((g) => g.toLowerCase().includes("critico")),
    );
    const hasGap = pair.some((c) => c.gaps.length > 0);
    if (hasCriticalGap) return { dot: "bg-danger-text", label: "Risco" };
    if (hasGap) return { dot: "bg-warning-text", label: "Atencao" };
    if (latest && Date.now() - parseDate(latest) < 60 * 24 * 60 * 60 * 1000)
      return { dot: "bg-success-text", label: "Saudavel" };
    return { dot: "bg-warning-text", label: "Atencao" };
  }, [pair]);

  // — Callbacks —

  const setCategoria = useCallback((slug: CompareCategorySlug) => {
    setCategoriaState(slug);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const addTicker = useCallback(
    (ticker: string, companyName?: string, logoUrl?: string | null) => {
      if (selectedTickers.includes(ticker) || selectedTickers.length >= 2) return;
      setSelectedTickers((prev) => [...prev, ticker]);
      if (companyName) {
        setCompanyNames((prev) => ({ ...prev, [ticker]: companyName }));
      }
      if (logoUrl) {
        setCompanyLogos((prev) => ({ ...prev, [ticker]: logoUrl }));
      }
      setOpenPicker(false);
      setSearch("");
    },
    [selectedTickers],
  );

  const swapCompanies = useCallback(() => {
    setSelectedTickers((prev) => {
      if (prev.length < 2) return prev;
      const swapped = [...prev];
      [swapped[0], swapped[1]] = [swapped[1], swapped[0]];
      return swapped;
    });
  }, []);

  const selectPillar = useCallback(
    (pillar: ComparePillar) => {
      setActivePillar(pillar);
      if (
        detailRef.current &&
        detailRef.current.getBoundingClientRect().top < 0
      ) {
        detailRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    },
    [],
  );

  const openEvidence = useCallback(
    (row: CompareTableRow) => {
      if (!a || !b) return;
      const src = row.a?.source ?? row.b?.source;
      if (!src) return;
      setEvidence({
        metricName: row.name,
        definition: row.definition,
        unit: row.unit,
        source: src,
        aTicker: a.ticker,
        bTicker: b.ticker,
        aValue: row.a?.value ?? null,
        bValue: row.b?.value ?? null,
      });
    },
    [a, b],
  );

  const copyShareLink = useCallback(async () => {
    const qs = new URLSearchParams({
      tickers: selectedTickers.join(","),
      range,
      pilar: activePillar,
    });
    const link = `${window.location.origin}/comparar?${qs.toString()}`;
    try {
      await navigator.clipboard.writeText(link);
      setToast("Link copiado.");
    } catch {
      setToast(link);
    }
    setActionsOpen(false);
  }, [selectedTickers, range, activePillar]);

  const saveComparison = useCallback(() => {
    if (!canCompare) return;
    const label = selectedTickers.join(" vs ");
    const savedAt = new Date().toLocaleDateString("pt-BR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });
    setComparisonHistory((prev) => [
      { tickers: [...selectedTickers], label, savedAt },
      ...prev.slice(0, 9),
    ]);
    setToast("Comparação salva no histórico!");
  }, [canCompare, selectedTickers]);

  const createAlert = useCallback(() => {
    setToast(`Alerta criado para ${PILLAR_LABEL[activePillar]}.`);
    setActionsOpen(false);
  }, [activePillar]);

  return {
    // Refs
    detailRef,
    verdictRef,

    // Estado de seleção
    selectedTickers,
    search,
    openPicker,

    // Estado do painel
    categoria,
    activePillar,
    range,
    eventsOpen,
    qualityOpen,
    refreshing,
    loadingApi,
    evidence,
    toast,
    compactSticky,
    actionsOpen,
    customFrom,
    setCustomFrom,
    customTo,
    setCustomTo,
    comparisonHistory,
    historyOpen,
    setHistoryOpen,

    // Dados derivados de empresas
    selected,
    pair,
    a,
    b,
    enrichedA,
    enrichedB,
    canCompare,
    available,

    // Dados derivados de cálculo
    chartData,
    scoreboard,
    summary,
    narratives,
    compareError,
    pillarDiffs,
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
    activePillarScoreWinner,
    scoreVsChartContext,
    qualityTone,

    // Ações de seleção
    setSearch,
    setOpenPicker,
    setSelectedTickers,
    addTicker,
    companyNames,
    companyLogos,
    swapCompanies,

    // Ações do painel
    setCategoria,
    selectPillar,
    setRange,
    setEventsOpen,
    setQualityOpen,
    setEvidence,
    setToast,
    setActionsOpen,
    openEvidence,
    copyShareLink,
    saveComparison,
    createAlert,

    // Helpers expostos
    PILLARS,
    PILLAR_LABEL,
    RANGES,
    CATEGORIES,
    formatMetric,
    metricDelta,
    metricWinner,
    evidenceReadLabel,
    pillarInsight,
    pillarConsequence,
    trendContext,
    formatNumber,
  };
}

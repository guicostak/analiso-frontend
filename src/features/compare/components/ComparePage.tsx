"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { motion } from "motion/react";
import {
  Bookmark,
  Coins,
  History,
  Link2,
  Plus,
  Share2,
  TrendingUp,
  Heart,
  Calendar,
  Table2,
  X,
} from "lucide-react";
import { Sidebar } from "@/src/components/layout/Sidebar";
import { AppTopBar } from "@/src/components/layout/AppTopBar";
import { MainContent } from "@/src/components/layout/MainContent";
import { AddCompanyModal } from "@/src/features/watchlist/components/AddCompanyModal";
import { getCompanyLogo } from "@/src/features/explore/services";
import { useCompare } from "../hooks/useCompare";
import { useBuildMode, type BuildStep } from "../hooks/useBuildMode";
import { PILLARS, trackCompare } from "../services";
import type { CompareCategorySlug } from "../interfaces";
import { CompareEvidenceDrawer } from "./CompareEvidenceDrawer";
import { BuildModeOverlay } from "./BuildModeOverlay";
import { BuildModeTypingIntro } from "./BuildModeTypingIntro";
import { CompareEmptyState } from "./CompareEmptyState";
import { CompareCollapsedCard } from "./CompareCollapsedCard";
import { CompareNarrativeBlock } from "./shared/CompareNarrativeBlock";
import {
  CompareHeader,
  SnowflakeDual,
  VerdictIsland,
  TopFactorsIsland,
  MetricsTableIsland,
} from "./islands";

/* ── "Modo Lego": sequência cinematográfica em 4 beats narrativos ────────── */
// Delays foram calibrados para que cada scroll automático seja perceptível
// (smooth scroll do navegador leva ~400-700ms em si).
// Total: ~7.5s + 400ms initialDelay + 800ms finishHold ≈ 8.7s
const BUILD_SEQUENCE: readonly BuildStep[] = [
  // Beat 1 — "O palco" (entram a partir do topo, sem scroll)
  { id: "narrative",   delay: 0,   scrollAnchor: true, beatLabel: "Preparando" },
  { id: "snowflake",   delay: 600, beatLabel: "Visão geral" },

  // Beat 2 — "O vencedor" (pausa dramática + scroll para Verdict)
  { id: "verdict",     delay: 950, scrollAnchor: true, beatLabel: "Veredito" },
  { id: "top-factors", delay: 600, beatLabel: "Principais fatores" },

  // Beat 3 — "Os pilares" (cascata)
  { id: "valuation",   delay: 850, scrollAnchor: true, beatLabel: "Valuation" },
  { id: "growth",      delay: 500, scrollAnchor: true, beatLabel: "Crescimento" },
  { id: "past",        delay: 500, scrollAnchor: true, beatLabel: "Histórico" },
  { id: "health",      delay: 500, scrollAnchor: true, beatLabel: "Saúde financeira" },

  // Beat 4 — "Os detalhes" (finale)
  { id: "dividend",    delay: 600, scrollAnchor: true, beatLabel: "Dividendos" },
  { id: "metrics",     delay: 600, scrollAnchor: true, beatLabel: "Métricas" },
  { id: "timeline",    delay: 500, scrollAnchor: true, beatLabel: "Eventos recentes" },
];

/* ── Animação spring "encaixe de Lego" para cada ilha em build mode ─────────
 * O delay (em segundos) segura o início visual do spring por um tempo
 * suficiente para que o auto-scroll suave já tenha chegado no card. Assim
 * o usuário vê o card SE MONTANDO no centro da tela, em vez de ver o card
 * já pronto quando o scroll chega. */
const LEGO_REVEAL_DELAY_S = 0.42; // ~420ms — sincronizado com o scroll lead
const LEGO_INITIAL = { opacity: 0, scale: 0.88, y: -56 };
const LEGO_ANIMATE = { opacity: 1, scale: 1, y: 0 };
const LEGO_TRANSITION = {
  type: "spring" as const,
  stiffness: 240,
  damping: 22,
  mass: 0.9,
  delay: LEGO_REVEAL_DELAY_S,
};

/* ── Auto-scroll utilities ───────────────────────────────────────────────── */
const SCROLL_OFFSET_PX = 180; // sticky header + breathing room

/**
 * Scroll suave para o topo de uma ilha. Como a ilha pode ter acabado de ser
 * inserida no DOM (motion.section recém-revelada), tentamos com um pequeno
 * retry caso o elemento ainda não exista no primeiro frame.
 */
function scrollIslandIntoView(id: string, attempt = 0) {
  if (typeof window === "undefined") return;
  const el = document.getElementById(id);
  if (!el) {
    if (attempt < 5) {
      setTimeout(() => scrollIslandIntoView(id, attempt + 1), 60);
    }
    return;
  }
  const top = el.getBoundingClientRect().top + window.scrollY - SCROLL_OFFSET_PX;
  window.scrollTo({ top: Math.max(0, top), behavior: "smooth" });
}

// Lazy-load heavier islands below the fold
const ValuationIsland = dynamic(
  () => import("./islands/ValuationIsland").then((m) => ({ default: m.ValuationIsland })),
  { ssr: false },
);
const GrowthIsland = dynamic(
  () => import("./islands/GrowthIsland").then((m) => ({ default: m.GrowthIsland })),
  { ssr: false },
);
const PastIsland = dynamic(
  () => import("./islands/PastIsland").then((m) => ({ default: m.PastIsland })),
  { ssr: false },
);
const HealthIsland = dynamic(
  () => import("./islands/HealthIsland").then((m) => ({ default: m.HealthIsland })),
  { ssr: false },
);
const DividendIsland = dynamic(
  () => import("./islands/DividendIsland").then((m) => ({ default: m.DividendIsland })),
  { ssr: false },
);
const TimelineIsland = dynamic(
  () => import("./islands/TimelineIsland").then((m) => ({ default: m.TimelineIsland })),
  { ssr: false },
);

/* ── Progressive Disclosure: ilhas "core" vs "secundárias" ──────────────────
 * Após o build mode terminar (ou em revisitas, quando build não roda), as
 * ilhas secundárias colapsam em cards slim que o usuário expande sob demanda.
 * As 4 ilhas core permanecem sempre expandidas porque carregam o "veredito +
 * por quê" — se o usuário só lê isso, já entendeu a comparação. */
const CORE_ISLAND_IDS = new Set([
  "narrative",
  "snowflake",
  "verdict",
  "top-factors",
]);

const COLLAPSED_META: Record<
  string,
  { title: string; icon: typeof Bookmark; fallbackSummary: string }
> = {
  valuation: {
    title: "Valuation",
    icon: Coins,
    fallbackSummary: "Como o mercado precifica cada empresa hoje.",
  },
  growth: {
    title: "Crescimento",
    icon: TrendingUp,
    fallbackSummary: "O ritmo de expansão das duas empresas.",
  },
  past: {
    title: "Histórico",
    icon: History,
    fallbackSummary: "O que aconteceu nos últimos anos.",
  },
  health: {
    title: "Saúde financeira",
    icon: Heart,
    fallbackSummary: "Endividamento, liquidez e risco de balanço.",
  },
  dividend: {
    title: "Dividendos",
    icon: Coins,
    fallbackSummary: "Distribuição e consistência dos proventos.",
  },
  metrics: {
    title: "Métricas detalhadas",
    icon: Table2,
    fallbackSummary: "Tabela completa com todas as métricas do pilar ativo.",
  },
  timeline: {
    title: "Eventos recentes",
    icon: Calendar,
    fallbackSummary: "Os fatos relevantes dos últimos 90 dias.",
  },
};

/* ── Visibility helper ───────────────────────────────────────────────────── */

function showSection(categoria: CompareCategorySlug, ...slugs: CompareCategorySlug[]): boolean {
  return categoria === "todas" || slugs.includes(categoria);
}

/* ── Loading skeleton ────────────────────────────────────────────────────── */

function LoadingBlocks() {
  return (
    <div className="space-y-8">
      <div className="h-[160px] animate-pulse rounded-[28px] border border-border bg-card" />
      <div className="h-[280px] animate-pulse rounded-[28px] border border-border bg-card" />
      <div className="h-[360px] animate-pulse rounded-[28px] border border-border bg-card" />
    </div>
  );
}

/* ── Main page ───────────────────────────────────────────────────────────── */

export function ComparePage() {
  const {
    detailRef,
    verdictRef,
    categoria,
    buildModeRequested,
    clearBuildFlag,
    markBuildComplete,
    selectSuggestion,
    activePillar,
    range,
    refreshing,
    loadingApi,
    evidence,
    toast,
    compactSticky,
    comparisonHistory,
    historyOpen,
    setHistoryOpen,
    selected,
    pair,
    a,
    b,
    enrichedA,
    enrichedB,
    canCompare,
    scoreboard,
    summary,
    narratives,
    compareError,
    topPillarDiffs,
    otherPillarDiffs,
    verdict,
    tableRows,
    activePillarWinnerSummary,
    recentEvents,
    selectedTickers,
    setSelectedTickers,
    addTicker,
    companyNames,
    companyLogos,
    swapCompanies,
    setCategoria,
    selectPillar,
    setRange,
    setEvidence,
    setToast,
    openEvidence,
    copyShareLink,
    saveComparison,
    PILLAR_LABEL,
    RANGES,
    CATEGORIES,
    formatMetric,
    metricDelta,
    metricWinner,
    evidenceReadLabel,
    pillarInsight,
    trendContext,
    formatNumber,
  } = useCompare();

  const [showAddModal, setShowAddModal] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [saveAnimating, setSaveAnimating] = useState(false);

  // Progressive Disclosure: ilhas secundárias colapsadas após o build mode.
  // Estado: Set dos IDs INDIVIDUALMENTE expandidos pelo usuário (override).
  // Computado abaixo: se a categoria for "todas" E (build já completou OU
  // build nem foi requisitado), as ilhas secundárias renderizam slim.
  const [expandedSecondary, setExpandedSecondary] = useState<Set<string>>(new Set());
  const [collapsedAfterBuild, setCollapsedAfterBuild] = useState<boolean>(() => {
    // Se a página abre sem build mode (ex: revisita do par já visto), começa
    // direto no modo colapsado. Se com build mode, espera o onComplete.
    if (typeof window === "undefined") return false;
    const params = new URLSearchParams(window.location.search);
    if (params.get("build") === "1") return false;
    // Não há tickers OU build não requisitado → modo colapsado vale para
    // revisitas mas é inofensivo no empty state (não há ilhas pra colapsar).
    return true;
  });

  const toggleIslandExpand = (id: string) => {
    setExpandedSecondary((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
        trackCompare("compare_island_expanded", { island: id });
      }
      return next;
    });
  };

  // Handlers das próximas ações do Verdict (Prompt Fogg)
  const handleSeeFactors = () => {
    if (typeof window === "undefined") return;
    // Se top-factors estiver colapsado, expande primeiro
    if (collapsedAfterBuild && !CORE_ISLAND_IDS.has("top-factors")) {
      setExpandedSecondary((prev) => new Set(prev).add("top-factors"));
    }
    window.setTimeout(() => {
      const el = document.getElementById("top-factors");
      if (!el) return;
      const top = el.getBoundingClientRect().top + window.scrollY - 160;
      window.scrollTo({ top: Math.max(0, top), behavior: "smooth" });
    }, 80);
  };

  const handleSwapAndPick = (winnerTicker: string) => {
    // Mantém o vencedor, remove o perdedor, abre o modal pra escolher novo par
    setSelectedTickers((prev) => prev.filter((t) => t === winnerTicker));
    setShowAddModal(true);
  };

  // Side-effect SÍNCRONO no primeiro render: se chegamos com ?build=1, força
  // scroll restoration manual e topo IMEDIATAMENTE, antes do React commitar
  // qualquer DOM. Isso evita o "flash" da posição restaurada.
  useState(() => {
    if (typeof window === "undefined") return null;
    if (!buildModeRequested) return null;
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }
    window.scrollTo(0, 0);
    return null;
  });

  // ── "Modo Lego": typing intro + orquestrador de revelação progressiva ────
  // Typing intro aparece IMEDIATAMENTE quando o usuário chega via Luiz, mesmo
  // antes dos dados carregarem. Build mode só começa quando typing terminou
  // E os dados estão prontos.
  const [typingIntroDone, setTypingIntroDone] = useState(false);
  const dataReady =
    buildModeRequested && canCompare && !loadingApi && !!enrichedA && !!enrichedB;
  const buildModeEnabled = dataReady && typingIntroDone;


  // Detecta scroll manual do usuário para abortar o auto-scroll cinematográfico.
  // IMPORTANTE: só ativa o detector DEPOIS que o build sequence começou e após
  // um pequeno grace period — caso contrário, o scroll-restore automático do
  // Next.js ou um wheel acidental durante o typing intro abortaria tudo.
  const userScrolledRef = useRef(false);
  useEffect(() => {
    if (!buildModeEnabled) return;
    let armed = false;
    const armT = setTimeout(() => {
      armed = true;
    }, 400);
    const onWheel = () => {
      if (armed) userScrolledRef.current = true;
    };
    const onTouch = () => {
      if (armed) userScrolledRef.current = true;
    };
    window.addEventListener("wheel", onWheel, { passive: true });
    window.addEventListener("touchstart", onTouch, { passive: true });
    return () => {
      clearTimeout(armT);
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("touchstart", onTouch);
    };
  }, [buildModeEnabled]);

  // Preload das ilhas lazy enquanto o usuário ainda nem viu o build começar
  useEffect(() => {
    if (!buildModeRequested) return;
    const idle = (cb: () => void) => {
      if (typeof window === "undefined") return;
      const ric = (window as Window & { requestIdleCallback?: (cb: () => void) => number }).requestIdleCallback;
      if (typeof ric === "function") ric(cb);
      else setTimeout(cb, 200);
    };
    idle(() => {
      void import("./islands/ValuationIsland");
      void import("./islands/GrowthIsland");
      void import("./islands/PastIsland");
      void import("./islands/HealthIsland");
      void import("./islands/DividendIsland");
      void import("./islands/TimelineIsland");
    });
  }, [buildModeRequested]);

  // SCROLL LOCK durante o "Modo Lego":
  // 1) Desabilita scroll-restoration do browser ANTES do paint
  // 2) Trava o scroll em 0 enquanto o typing intro roda (o usuário começa
  //    sempre do topo, mesmo que o browser tente restaurar a posição antiga)
  // 3) O lock libera quando o build sequence começa, e a partir daí o
  //    auto-scroll cinematográfico controla a posição.
  useEffect(() => {
    if (!buildModeRequested) return;
    if (typeof window === "undefined") return;
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }
    // Força o topo imediatamente, sem smooth (instant)
    window.scrollTo(0, 0);
  }, [buildModeRequested]);

  // Enquanto o typing intro está rodando (e até o primeiro reveal do build),
  // mantém o scroll travado em 0. Usa um RAF loop curto que abortamos quando
  // o build começa. Isso elimina qualquer competição com smooth-scroll do
  // browser ou com scroll-restoration tardia.
  useEffect(() => {
    if (!buildModeRequested) return;
    if (typingIntroDone) return;
    if (typeof window === "undefined") return;
    let cancelled = false;
    const loop = () => {
      if (cancelled) return;
      if (window.scrollY !== 0) window.scrollTo(0, 0);
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
    return () => {
      cancelled = true;
    };
  }, [buildModeRequested, typingIntroDone]);

  const buildMode = useBuildMode({
    enabled: buildModeEnabled,
    steps: BUILD_SEQUENCE,
    initialDelay: 400,
    finishHold: 800,
    onStepReveal: (step) => {
      // Auto-scroll cinematográfico apenas em steps marcados como anchor
      if (!step.scrollAnchor) return;
      if (userScrolledRef.current) return;
      // Dispara o scroll IMEDIATAMENTE no próximo frame (após o React commitar
      // o motion.section no DOM). Não usamos setTimeout maior porque o spring
      // do motion tem um delay próprio (LEGO_REVEAL_DELAY_S ≈ 420ms): durante
      // esse delay o card está em opacity:0 mas JÁ ocupa sua posição final de
      // layout, então o smooth-scroll do navegador pode "correr" até lá. Quando
      // o scroll chega, o spring começa a tocar — o usuário VÊ o card se
      // montando bem na frente dele, em vez de chegar num card já pronto.
      requestAnimationFrame(() => {
        if (userScrolledRef.current) return;
        scrollIslandIntoView(step.id);
      });
    },
    onComplete: () => {
      // Hold breve no último beat (timeline) para o usuário registrar o final,
      // depois scroll suave de volta ao topo — devolvendo o controle visual
      // ao início da história. Só rola se o usuário não tiver feito scroll
      // manual durante a sequência.
      window.setTimeout(() => {
        if (!userScrolledRef.current) {
          window.scrollTo({ top: 0, behavior: "smooth" });
        }
        clearBuildFlag();
        markBuildComplete();
        // Após o scroll-back, ativa Progressive Disclosure: colapsa secundárias
        // em cards slim. Delay extra (~600ms) para o scroll suave terminar antes
        // que o layout mude — evita salto visual brusco.
        window.setTimeout(() => {
          setCollapsedAfterBuild(true);
        }, 700);
      }, 900);
    },
  });

  // Quando NÃO está em build mode, considera tudo "revelado" (comportamento atual).
  const isRevealed = (id: string): boolean => {
    if (!buildModeRequested) return true;
    return buildMode.isRevealed(id);
  };

  /**
   * Decide se uma ilha está em modo "slim" (colapsada). Regras:
   *  - Categoria diferente de "todas" → sempre expandida (foco em uma seção)
   *  - Ilha core (narrative/snowflake/verdict/top-factors) → sempre expandida
   *  - Build mode em andamento → sempre expandida (deixa o build animar)
   *  - Caso contrário, depende de `expandedSecondary`
   */
  const isCollapsedSlim = (id: string): boolean => {
    if (categoria !== "todas") return false;
    if (CORE_ISLAND_IDS.has(id)) return false;
    if (!collapsedAfterBuild) return false;
    if (buildModeRequested && !buildMode.isComplete) return false;
    return !expandedSecondary.has(id);
  };

  // Resumo curto para o card slim — usa narrative.headline quando disponível
  const narrativeSummaryFor = (key: keyof typeof narratives): string => {
    const n = narratives[key];
    if (n && typeof n === "object" && "headline" in n && typeof n.headline === "string") {
      return n.headline;
    }
    return "";
  };

  /**
   * Wrapper de seção que decide entre:
   *  - <section> normal (animação CSS legada compare-stagger-N)
   *  - <motion.section> com spring "Lego" quando em build mode
   * Quando em build mode e a etapa ainda não foi revelada, retorna null.
   */
  const renderIsland = (
    id: string,
    stagger: number | null,
    surface: boolean,
    children: React.ReactNode,
    extraRef?: React.RefObject<HTMLElement | null> | React.RefObject<HTMLDivElement | null>,
    slimSummary?: string,
  ) => {
    const baseClass = `compare-island scroll-mt-[160px]${stagger ? ` compare-stagger-${stagger}` : ""}${surface ? " compare-surface p-6" : ""}`;

    // Modo slim (Progressive Disclosure): renderiza card colapsado em vez do
    // conteúdo completo. Disponível apenas para ilhas secundárias na visão
    // "todas" depois que o build mode terminou.
    if (isCollapsedSlim(id)) {
      const meta = COLLAPSED_META[id];
      if (meta) {
        return (
          <CompareCollapsedCard
            id={id}
            title={meta.title}
            icon={meta.icon}
            summary={slimSummary || meta.fallbackSummary}
            onExpand={() => toggleIslandExpand(id)}
          />
        );
      }
    }

    if (!buildModeRequested) {
      // Caminho legado — render direto, animação CSS dispara via classes
      return (
        <section
          id={id}
          ref={extraRef as React.RefObject<HTMLElement | null> | undefined}
          className={baseClass}
        >
          {children}
        </section>
      );
    }

    if (!isRevealed(id)) return null;

    return (
      <motion.section
        id={id}
        ref={extraRef as React.RefObject<HTMLElement | null> | undefined}
        className={baseClass}
        initial={LEGO_INITIAL}
        animate={LEGO_ANIMATE}
        transition={LEGO_TRANSITION}
      >
        {children}
      </motion.section>
    );
  };

  return (
    <div
      className={`min-h-screen bg-background text-foreground ${buildModeRequested ? "compare-build-mode" : ""}`}
      style={{ fontFamily: "Inter, sans-serif" }}
    >
      <Sidebar currentPage="comparar" />
      <AppTopBar sidebarOffsetClassName="left-0 xl:left-[240px]" />
      <AddCompanyModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSelect={(ticker, companyName, logoUrl) => addTicker(ticker, companyName, logoUrl)}
        excludeTickers={new Set(selectedTickers)}
        searchPlaceholder="Buscar empresa para comparar..."
        footerText={`${selectedTickers.length} de 2 empresas selecionadas`}
      />
      <MainContent className="relative overflow-hidden pt-20">
        {/* Background gradients */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-[8%] top-0 h-80 w-80 rounded-full bg-[radial-gradient(circle,rgba(91,141,239,0.10)_0%,rgba(91,141,239,0)_72%)]" />
          <div className="absolute right-[6%] top-40 h-[24rem] w-[24rem] rounded-full bg-[radial-gradient(circle,rgba(18,165,148,0.09)_0%,rgba(18,165,148,0)_72%)]" />
        </div>

        <div className="relative px-8 pb-12 pt-6">
          <div className="mx-auto max-w-[1560px]">
            {/* ── Page title ── */}
            <div className="mb-6 space-y-3">
              <p className="text-[12px] font-medium uppercase text-muted-foreground">Análise comparativa</p>
              <h1 className="text-[32px] font-semibold tracking-[-0.03em] text-foreground">Comparar empresas</h1>
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[15px] text-muted-foreground">
                <span>Compare empresas lado a lado por pilar.</span>
                {/* Contador de Sunk Cost: torna visível o "patrimônio" do
                    usuário na plataforma. Aparece só quando há histórico. */}
                {comparisonHistory.length > 0 && (
                  <span className="inline-flex items-center gap-1 text-[12px] font-medium text-muted-foreground">
                    <span className="text-border">·</span>
                    <span>
                      <span className="font-semibold text-foreground">{comparisonHistory.length}</span>
                      {" "}
                      {comparisonHistory.length === 1 ? "comparação salva" : "comparações salvas"} no seu histórico
                    </span>
                  </span>
                )}
              </div>
            </div>

            {/* ── Header island (sticky) ── */}
            {enrichedA && enrichedB ? (
              <CompareHeader
                a={enrichedA}
                b={enrichedB}
                activePillar={activePillar}
                categoria={categoria}
                range={range}
                onSelectPillar={selectPillar}
                onSetCategoria={setCategoria}
                onSetRange={setRange}
                PILLAR_LABEL={PILLAR_LABEL}
                RANGES={RANGES}
                PILLARS={PILLARS}
                CATEGORIES={CATEGORIES}
                compactSticky={compactSticky}
              />
            ) : (
              /* Fallback: company selector only */
              <section className="sticky top-14 z-10 mb-2 rounded-[28px] border border-border bg-[rgba(255,255,255,0.94)] p-6 shadow-[0_16px_36px_rgba(15,23,40,0.07)] backdrop-blur dark:bg-[rgba(15,23,40,0.94)] dark:shadow-none">
                <div className="flex flex-wrap items-center gap-2">
                  {selectedTickers.map((ticker) => {
                    const logo = companyLogos[ticker] || getCompanyLogo(ticker);
                    const name = companyNames[ticker];
                    return (
                      <span
                        key={ticker}
                        className="inline-flex shrink-0 items-center gap-2 rounded-full border border-border bg-card px-3.5 py-2 text-[13px] font-medium text-foreground"
                      >
                        {logo ? (
                          <img
                            src={logo}
                            alt={ticker}
                            className="h-[22px] w-[22px] rounded-full border border-border bg-muted object-cover"
                          />
                        ) : (
                          <span className="inline-flex h-[22px] w-[22px] items-center justify-center rounded-full border border-border bg-muted text-[10px] font-semibold text-muted-foreground">
                            {ticker.slice(0, 1)}
                          </span>
                        )}
                        {name ? `${name} (${ticker})` : ticker}
                        <button
                          onClick={() => setSelectedTickers((c) => c.filter((t) => t !== ticker))}
                          className="rounded-full p-0.5 text-muted-foreground transition hover:bg-hover hover:text-foreground"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </span>
                    );
                  })}
                  {selectedTickers.length < 2 && (
                    <button
                      onClick={() => setShowAddModal(true)}
                      className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-dashed border-border bg-card px-3.5 py-2 text-[13px] font-medium text-muted-foreground transition hover:border-brand hover:text-foreground"
                    >
                      <Plus className="h-4 w-4" />
                      Adicionar
                    </button>
                  )}
                </div>
              </section>
            )}

            {/* ── Secondary actions ── */}
            {canCompare && (
              <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
                <div>
                  <button
                    onClick={() => {
                      setHistoryOpen((v) => {
                        const next = !v;
                        if (next) trackCompare("compare_history_opened");
                        return next;
                      });
                    }}
                    className={`inline-flex h-8 items-center gap-1.5 rounded-full border px-3 text-[12px] font-medium transition ${historyOpen ? "border-brand bg-brand/10 text-brand" : "border-border bg-card text-muted-foreground hover:border-brand hover:text-foreground"}`}
                  >
                    <History className="h-3.5 w-3.5" />
                    Histórico
                    {comparisonHistory.length > 0 && (
                      <span className="inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-brand px-1 text-[10px] font-bold text-white">
                        {comparisonHistory.length}
                      </span>
                    )}
                  </button>
                  {historyOpen && (
                    <div className="mt-2 rounded-[18px] border border-border bg-card p-4 shadow-[0_8px_24px_rgba(15,23,40,0.06)] dark:shadow-none">
                      <p className="mb-3 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Comparações recentes</p>
                      {comparisonHistory.length === 0 ? (
                        <p className="py-2 text-[12px] text-muted-foreground">Nenhuma comparação salva ainda</p>
                      ) : (
                        <div className="flex flex-wrap gap-2">
                          {comparisonHistory.slice(0, 4).map((item, i) => (
                            <button
                              key={i}
                              onClick={() => {
                                trackCompare("compare_history_item_selected", { tickers: item.tickers });
                                setSelectedTickers(item.tickers);
                                setHistoryOpen(false);
                              }}
                              className="flex flex-col rounded-[12px] border border-border bg-muted px-3.5 py-2.5 text-left transition hover:border-brand hover:bg-brand/5"
                            >
                              <span className="text-[13px] font-medium text-foreground">{item.label}</span>
                              <span className="text-[11px] text-muted-foreground">{item.savedAt}</span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {/* Botão Salvar destacado: a microconversão de retenção mais
                      barata. Estilo brand-filled + animação de "encaixe" no
                      clique reforça percepção de propriedade (Endowment). */}
                  <motion.button
                    onClick={() => {
                      saveComparison();
                      setSaveAnimating(true);
                      window.setTimeout(() => setSaveAnimating(false), 800);
                    }}
                    animate={saveAnimating ? { scale: [1, 0.94, 1.04, 1] } : { scale: 1 }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                    className="inline-flex h-8 items-center gap-1.5 rounded-full border border-brand bg-brand px-3.5 text-[12px] font-semibold text-white shadow-[0_4px_12px_rgba(91,141,239,0.25)] transition hover:bg-brand/90"
                  >
                    <Bookmark className="h-3.5 w-3.5" fill="currentColor" />
                    {saveAnimating ? "Salva!" : "Salvar comparação"}
                  </motion.button>
                  <div className="relative">
                    <button
                      onClick={() => {
                        setShareOpen((v) => {
                          const next = !v;
                          if (next) trackCompare("compare_share_clicked");
                          return next;
                        });
                      }}
                      className="inline-flex h-8 items-center gap-1.5 rounded-full border border-border bg-card px-3 text-[12px] font-medium text-muted-foreground transition hover:border-brand hover:text-foreground"
                    >
                      <Share2 className="h-3.5 w-3.5" />
                      Compartilhar
                    </button>
                    {shareOpen && (
                      <div className="absolute right-0 z-40 mt-2 w-[200px] rounded-[18px] border border-border bg-card p-2 shadow-[0_20px_40px_rgba(15,23,40,0.12)]">
                        <button
                          onClick={() => { const text = `Comparei ${selectedTickers.join(" vs ")} no Analiso! `; window.open(`https://wa.me/?text=${encodeURIComponent(text + window.location.href)}`, "_blank"); setShareOpen(false); }}
                          className="flex w-full items-center gap-2 rounded-[12px] px-3 py-2 text-left text-[12px] text-muted-foreground transition hover:bg-muted"
                        >
                          WhatsApp
                        </button>
                        <button
                          onClick={() => { navigator.clipboard.writeText(`Comparei ${selectedTickers.join(" vs ")} no Analiso!\n${window.location.href}`).then(() => { setShareOpen(false); setToast("Link copiado!"); }); }}
                          className="flex w-full items-center gap-2 rounded-[12px] px-3 py-2 text-left text-[12px] text-muted-foreground transition hover:bg-muted"
                        >
                          <Link2 className="h-3.5 w-3.5" />
                          Copiar link
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* ── Empty state ── */}
            {!canCompare ? (
              <CompareEmptyState
                onSelectSuggestion={(tickers, label) =>
                  selectSuggestion(tickers, label)
                }
                onPickManually={() => setShowAddModal(true)}
              />
            ) : compareError ? (
              <section className="compare-island compare-surface p-10 text-center">
                <h2 className="text-[24px] font-semibold tracking-[-0.02em] text-foreground">
                  {compareError === "ticker-not-found"
                    ? "Não encontramos uma das empresas"
                    : compareError === "invalid-compare-params"
                      ? "Selecione duas empresas diferentes"
                      : "Não foi possível carregar a comparação"}
                </h2>
                <p className="mx-auto mt-3 max-w-[560px] text-[14px] leading-6 text-muted-foreground">
                  {compareError === "ticker-not-found"
                    ? `Verifique se os tickers ${selectedTickers.join(" e ")} estão corretos e tente novamente.`
                    : compareError === "invalid-compare-params"
                      ? "Os tickers A e B precisam ser distintos para comparação."
                      : "Tente recarregar a página em alguns instantes."}
                </p>
              </section>
            ) : loadingApi || refreshing || !enrichedA || !enrichedB ? (
              <LoadingBlocks />
            ) : enrichedA && enrichedB && a && b ? (
              <div className="space-y-8">
                {/* ── Visão geral: Snowflake + Veredito + Fatores ── */}
                {showSection(categoria, "visao-geral") && (
                  <>
                    {/* CompareNarrativeBlock — envolto em wrapper condicional para
                        participar do "Modo Lego" como primeira peça */}
                    {isRevealed("narrative") && (
                      buildModeRequested ? (
                        <motion.div
                          id="narrative"
                          className="scroll-mt-[180px]"
                          initial={LEGO_INITIAL}
                          animate={LEGO_ANIMATE}
                          transition={LEGO_TRANSITION}
                        >
                          <CompareNarrativeBlock narrative={narratives.summary} variant="hero" />
                        </motion.div>
                      ) : (
                        <CompareNarrativeBlock narrative={narratives.summary} variant="hero" />
                      )
                    )}
                    {scoreboard && renderIsland("snowflake", 1, false, (
                      <SnowflakeDual a={enrichedA} b={enrichedB} scoreboard={scoreboard} />
                    ))}
                    {verdict && scoreboard && renderIsland("verdict", 2, false, (
                      <VerdictIsland
                        verdict={verdict}
                        scoreboard={scoreboard}
                        summary={summary}
                        formatNumber={formatNumber}
                        onSeeFactors={handleSeeFactors}
                        onSave={saveComparison}
                        onSwapAndPick={handleSwapAndPick}
                      />
                    ), verdictRef)}
                    {renderIsland("top-factors", 3, false, (
                      <TopFactorsIsland
                        a={enrichedA}
                        b={enrichedB}
                        topPillarDiffs={topPillarDiffs}
                        PILLAR_LABEL={PILLAR_LABEL}
                        formatNumber={formatNumber}
                        pillarInsight={pillarInsight}
                        trendContext={trendContext}
                        activePillar={activePillar}
                        onSelectPillar={selectPillar}
                      />
                    ))}
                  </>
                )}

                {/* ── Valuation ── */}
                {showSection(categoria, "valuation") && renderIsland("valuation", 4, true, (
                  <ValuationIsland a={enrichedA} b={enrichedB} formatNumber={formatNumber} narrative={narratives.value} />
                ), undefined, narrativeSummaryFor("value"))}

                {/* ── Crescimento ── */}
                {showSection(categoria, "crescimento") && renderIsland("growth", 5, true, (
                  <GrowthIsland a={enrichedA} b={enrichedB} formatNumber={formatNumber} narrative={narratives.future} />
                ), undefined, narrativeSummaryFor("future"))}

                {/* ── Passado ── */}
                {showSection(categoria, "passado") && renderIsland("past", 6, true, (
                  <PastIsland a={enrichedA} b={enrichedB} formatNumber={formatNumber} narrative={narratives.past} />
                ), undefined, narrativeSummaryFor("past"))}

                {/* ── Saúde ── */}
                {showSection(categoria, "saude") && renderIsland("health", null, true, (
                  <HealthIsland a={enrichedA} b={enrichedB} formatNumber={formatNumber} narrative={narratives.health} />
                ), undefined, narrativeSummaryFor("health"))}

                {/* ── Dividendos ── */}
                {showSection(categoria, "dividendos") && renderIsland("dividend", null, true, (
                  <DividendIsland a={enrichedA} b={enrichedB} formatNumber={formatNumber} narrative={narratives.dividend} />
                ), undefined, narrativeSummaryFor("dividend"))}

                {/* ── Métricas ── */}
                {showSection(categoria, "metricas") && renderIsland("metrics", null, true, (
                  <MetricsTableIsland
                    a={enrichedA}
                    b={enrichedB}
                    tableRows={tableRows}
                    activePillar={activePillar}
                    PILLAR_LABEL={PILLAR_LABEL}
                    formatMetric={formatMetric}
                    formatNumber={formatNumber}
                    metricWinner={metricWinner}
                    metricDelta={metricDelta}
                    evidenceReadLabel={evidenceReadLabel}
                    openEvidence={openEvidence}
                    activePillarWinnerSummary={activePillarWinnerSummary}
                  />
                ), detailRef, activePillarWinnerSummary ?? undefined)}

                {/* ── Timeline ── */}
                {showSection(categoria, "timeline") && renderIsland("timeline", null, true, (
                  <TimelineIsland
                    a={enrichedA}
                    b={enrichedB}
                    events={recentEvents}
                    PILLAR_LABEL={PILLAR_LABEL}
                  />
                ), undefined, recentEvents.length > 0 ? `${recentEvents.length} eventos relevantes nos últimos 90 dias.` : undefined)}


              </div>
            ) : null}
          </div>
        </div>
      </MainContent>

      <CompareEvidenceDrawer data={evidence} onClose={() => setEvidence(null)} formatMetric={formatMetric} />

      {/* "Modo Lego" — typing intro do Luiz (Beat 0)
          Aparece IMEDIATAMENTE na chegada na página, mesmo enquanto os dados
          ainda estão carregando. Some quando a animação termina (~1.4s). */}
      {buildModeRequested && selectedTickers.length >= 2 && !typingIntroDone && (
        <BuildModeTypingIntro
          tickers={selectedTickers}
          companyNames={companyNames}
          companyLogos={companyLogos}
          onComplete={() => setTypingIntroDone(true)}
        />
      )}

      {/* "Modo Lego" — overlay flutuante de progresso */}
      {buildModeRequested && typingIntroDone && (
        <BuildModeOverlay
          isBuilding={buildMode.isBuilding}
          isComplete={buildMode.isComplete}
          progress={buildMode.progress}
          currentStepLabel={buildMode.currentStepData?.beatLabel ?? null}
        />
      )}

      {toast ? (
        <div className="fixed bottom-5 right-5 z-50 rounded-full border border-brand-border bg-card px-4 py-2 text-[12px] font-medium text-brand-text shadow-[0_18px_36px_rgba(15,23,40,0.12)] dark:shadow-none">
          {toast}
        </div>
      ) : null}
    </div>
  );
}

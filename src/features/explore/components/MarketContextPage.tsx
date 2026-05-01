"use client";

import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ExternalLink, Globe, Newspaper, TrendingUp } from "lucide-react";
import { Sidebar } from "@/src/components/layout/Sidebar";
import { AppTopBar } from "@/src/components/layout/AppTopBar";
import { MainContent } from "@/src/components/layout/MainContent";
import { useExplore } from "../hooks/useExplore";
import { ExploreHighlightsSection } from "./ExploreHighlightsSection";
import { ExploreMarketContext } from "./ExploreMarketContext";
import { ExploreMovementsPanel } from "./ExploreMovementsPanel";
import { ExploreDrawer } from "./ExploreDrawer";
import { getMarketNews, type ExploreNewsItem } from "../services";
// ── Market extras (Fase 2) ──
import { ExploreMarketRibbon } from "./market/ExploreMarketRibbon";
import { ExploreTimeRangeToggle } from "./market/ExploreTimeRangeToggle";
import { ExploreMarketTonePill } from "./market/ExploreMarketTonePill";
import { ExploreRiskPanel } from "./market/ExploreRiskPanel";
import { ExploreSectorHeatmap } from "./market/ExploreSectorHeatmap";
import { ExploreMacroBrGrid } from "./market/ExploreMacroBrGrid";
import { ExploreGlobalMacroGrid } from "./market/ExploreGlobalMacroGrid";
import { ExploreComparisonsGrid } from "./market/ExploreComparisonsGrid";
import { ExploreExDividendsPanel } from "./market/ExploreExDividendsPanel";
import { ExploreSectorAlphaPanel } from "./market/ExploreSectorAlphaPanel";
import { ExploreMarketNewsSection } from "./market/ExploreMarketNewsSection";
import { ExploreAllMoversList } from "./ExploreAllMoversList";
import { ExploreSectorFilter, type SectorFilterItem } from "./ExploreSectorFilter";

type MarketSectionId = "contexto" | "movimentos" | "noticias";

const marketSections: { id: MarketSectionId; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: "contexto", label: "Contexto de mercado", icon: Globe },
  { id: "movimentos", label: "Movimentos", icon: TrendingUp },
  { id: "noticias", label: "Notícias", icon: Newspaper },
];

const MARKET_SECTION_IDS = new Set<MarketSectionId>(["contexto", "movimentos", "noticias"]);
const MARKET_SECTION_QUERY = "sec";
const DEFAULT_MARKET_SECTION: MarketSectionId = "contexto";

function isMarketSectionId(raw: string | null): raw is MarketSectionId {
  return raw != null && MARKET_SECTION_IDS.has(raw as MarketSectionId);
}

export function MarketContextPage() {
  /**
   * Seção ativa é sincronizada com a query string (?sec=contexto|movimentos|noticias).
   * Assim:
   *   - URL compartilhada abre direto na aba certa.
   *   - Botão "voltar" do navegador volta pra seção anterior.
   *   - Deep link funciona (ex: /mercado?sec=noticias).
   *
   * Usamos router.replace pra não empilhar histórico a cada clique (UX de tabs),
   * mas a URL é totalmente compartilhável.
   */
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const sectionFromUrl = useMemo<MarketSectionId>(() => {
    const raw = searchParams?.get(MARKET_SECTION_QUERY) ?? null;
    return isMarketSectionId(raw) ? raw : DEFAULT_MARKET_SECTION;
  }, [searchParams]);

  const [activeSection, setActiveSectionState] = useState<MarketSectionId>(sectionFromUrl);

  // Sincroniza estado local com URL quando a query muda externamente (back/forward, link).
  useEffect(() => {
    setActiveSectionState((current) => (current === sectionFromUrl ? current : sectionFromUrl));
  }, [sectionFromUrl]);

  function setActiveSection(next: MarketSectionId) {
    setActiveSectionState(next);
    const params = new URLSearchParams(searchParams?.toString() ?? "");
    if (next === DEFAULT_MARKET_SECTION) {
      params.delete(MARKET_SECTION_QUERY); // URL mais limpa pra seção padrão
    } else {
      params.set(MARKET_SECTION_QUERY, next);
    }
    const qs = params.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  }
  const [news, setNews]       = useState<ExploreNewsItem[]>([]);
  const [newsLoading, setNewsLoading] = useState(false);
  const [newsFetched, setNewsFetched] = useState(false);

  /**
   * Filtro por setor aplicado à aba Movimentos.
   * `null` = desligado (default); string = setor canônico B3.
   * State local porque é UI puro: não persiste e não vai pro backend.
   */
  const [activeSector, setActiveSector] = useState<string | null>(null);

  // Lazy-load: busca só quando a aba é aberta pela primeira vez
  useEffect(() => {
    if (activeSection !== "noticias" || newsFetched) return;
    setNewsLoading(true);
    setNewsFetched(true);
    getMarketNews(20)
      .then(setNews)
      .catch(() => setNews([]))
      .finally(() => setNewsLoading(false));
  }, [activeSection, newsFetched]);
  const {
    summaryScope,
    summaryState,
    hasSectorSelected,
    hasWatchlist,
    sortedHighlights,
    highlights,
    showAllHighlights,
    getCompanyLogo,
    setSummaryScope,
    setSummaryState,
    setSelectedSource,
    setShowAllHighlights,
    applyHighlightPreset,
    selectedSource,
    isLoading,
    showVolatilityInfo,
    indexCards,
    volatility,
    volatilityIsStale,
    marketContextDto,
    setShowVolatilityInfo,
    showVolatilityDetails,
    setShowVolatilityDetails,
    selectedTab,
    movers,
    movementInsights,
    showAllMovements,
    movementSummary,
    movementDominant,
    setSelectedTab,
    setShowAllMovements,
    // Market extras (Fase 2)
    timeRange,
    setTimeRange,
    marketExtras,
  } = useExplore();

  /**
   * Setores presentes nos movers do dia, com contagem. Derivado 1x por
   * mudança de movers. Universo = dedupado por ticker (um ticker em múltiplos
   * grupos conta uma vez só).
   */
  const sectorsForFilter = useMemo<SectorFilterItem[]>(() => {
    if (!Array.isArray(movers)) return [];
    const seenTickers = new Set<string>();
    const counts = new Map<string, number>();
    for (const m of movers) {
      if (!m.ticker || !m.sector) continue;
      const up = m.ticker.toUpperCase();
      if (seenTickers.has(up)) continue;
      seenTickers.add(up);
      counts.set(m.sector, (counts.get(m.sector) ?? 0) + 1);
    }
    return Array.from(counts.entries()).map(([sector, count]) => ({ sector, count }));
  }, [movers]);

  /** Total de tickers únicos (base do chip "Todos"). */
  const totalMoversCount = useMemo(() => {
    if (!Array.isArray(movers)) return 0;
    return new Set(movers.map((m) => m.ticker.toUpperCase())).size;
  }, [movers]);

  /**
   * Aplica filtro por setor aos destaques da curadoria.
   * Item sem sector conhecido NÃO é mostrado quando filtro ativo
   * (evita exibir dado incompleto como se pertencesse ao setor).
   */
  const filteredHighlights = useMemo(() => {
    if (!activeSector) return sortedHighlights;
    return sortedHighlights.filter((h) => h.sector === activeSector);
  }, [sortedHighlights, activeSector]);

  /** Aplica filtro por setor aos movers (Altas/Baixas/Negociadas + Ver todas). */
  const filteredMovers = useMemo(() => {
    if (!activeSector) return movers;
    return movers.filter((m) => m.sector === activeSector);
  }, [movers, activeSector]);

  /**
   * Quando o usuário sai da aba Movimentos, faz sentido limpar o filtro
   * pra evitar estado "invisível" que confunde ao voltar.
   */
  useEffect(() => {
    if (activeSection !== "movimentos" && activeSector !== null) {
      setActiveSector(null);
    }
  }, [activeSection, activeSector]);

  /**
   * Keyboard nav nas tabs (WAI-ARIA tablist): seta esquerda/direita navegam
   * circularmente, Home/End pulam pra primeira/última. Complementa o padrão
   * visual com semântica correta pra screen readers e navegação por teclado.
   */
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);
  function handleTabKeyDown(e: KeyboardEvent<HTMLButtonElement>, idx: number) {
    const count = marketSections.length;
    let next = idx;
    if (e.key === "ArrowRight") next = (idx + 1) % count;
    else if (e.key === "ArrowLeft") next = (idx - 1 + count) % count;
    else if (e.key === "Home") next = 0;
    else if (e.key === "End") next = count - 1;
    else return;
    e.preventDefault();
    const target = tabRefs.current[next];
    if (target) {
      target.focus();
      setActiveSection(marketSections[next].id);
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Sidebar currentPage="mercado" />

      <AppTopBar sidebarOffsetClassName="left-0 xl:left-[240px]" />

      <MainContent className="relative overflow-hidden pt-20">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-[18%] top-0 h-80 w-80 rounded-full bg-[radial-gradient(circle,rgba(91,141,239,0.10)_0%,rgba(91,141,239,0)_72%)]" />
          <div className="absolute right-[10%] top-40 h-72 w-72 rounded-full bg-[radial-gradient(circle,rgba(18,165,148,0.08)_0%,rgba(18,165,148,0)_72%)]" />
        </div>

        <div className="relative px-6 pb-20 pt-5">
          <div className="mx-auto max-w-[1380px]">
            <header className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div className="max-w-[680px] space-y-3">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Leitura de ambiente</p>
                <div className="flex flex-wrap items-center gap-3">
                  <h1 className="text-4xl font-semibold leading-[1.05] tracking-[-0.035em] text-foreground md:text-[44px] md:leading-[48px]">
                    Mercado
                  </h1>
                  <ExploreMarketTonePill tone={marketExtras?.marketTone ?? null} />
                </div>
                <p className="max-w-[620px] text-sm leading-6 text-muted-foreground">
                  Acompanhe o panorama macro, os movimentos das empresas e as principais notícias do dia em um só lugar.
                </p>
              </div>
            </header>

            {/* === Navegação por seção (WAI-ARIA tablist) === */}
            <div className="mb-10 border-b border-border">
              <div
                role="tablist"
                aria-label="Seções da tela de mercado"
                className="flex flex-wrap gap-1.5"
              >
                {marketSections.map((sec, idx) => {
                  const Icon = sec.icon;
                  const isActive = sec.id === activeSection;
                  return (
                    <button
                      key={sec.id}
                      ref={(el) => {
                        tabRefs.current[idx] = el;
                      }}
                      role="tab"
                      id={`mercado-tab-${sec.id}`}
                      aria-selected={isActive}
                      aria-controls={`mercado-panel-${sec.id}`}
                      tabIndex={isActive ? 0 : -1}
                      onKeyDown={(e) => handleTabKeyDown(e, idx)}
                      onClick={() => setActiveSection(sec.id)}
                      className={`relative inline-flex items-center gap-2 px-3.5 py-3.5 text-sm transition-colors duration-200 outline-none focus-visible:text-foreground ${
                        isActive
                          ? "font-semibold text-foreground"
                          : "font-medium text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      <Icon className="h-[15px] w-[15px]" aria-hidden="true" />
                      {sec.label}
                      {isActive && (
                        <span
                          aria-hidden="true"
                          className="mercado-tab-indicator absolute bottom-0 left-2 right-2 h-[3px] rounded-full bg-brand"
                        />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="space-y-12">
              {/* === Contexto de mercado === */}
              {activeSection === "contexto" && (
              <section
                role="tabpanel"
                id="mercado-panel-contexto"
                aria-labelledby="mercado-tab-contexto"
                tabIndex={0}
                className="mercado-section-enter space-y-6 outline-none"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                  <div className="max-w-[720px] space-y-2">
                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Visão geral</p>
                    <h2 className="text-2xl font-semibold leading-tight tracking-[-0.025em] text-foreground">
                      Contexto de mercado
                    </h2>
                    <p className="text-sm leading-6 text-muted-foreground">
                      Panorama macro, índices globais e volatilidade para entender o ambiente antes de olhar empresa a empresa.
                    </p>
                  </div>
                  <ExploreTimeRangeToggle value={timeRange} onChange={setTimeRange} disabled={isLoading} />
                </div>

                {/* === Ribbon global: ticker tape dentro da seção Contexto === */}
                <ExploreMarketRibbon ribbon={marketExtras?.ribbon ?? null} isLoading={isLoading} />

                <ExploreMarketContext
                  isLoading={isLoading}
                  showVolatilityInfo={showVolatilityInfo}
                  indexCards={indexCards}
                  volatility={volatility}
                  volatilityIsStale={volatilityIsStale}
                  marketContextDto={marketContextDto}
                  setShowVolatilityInfo={setShowVolatilityInfo}
                  setShowVolatilityDetails={setShowVolatilityDetails}
                  hideHeader
                  timeRange={timeRange}
                />

                {/* === Novos blocos da aba Contexto (Fase 2) === */}
                {marketExtras && (
                  <div className="mt-8 space-y-12">
                    <ExploreRiskPanel       riskPanel={marketExtras.riskPanel} />
                    <ExploreSectorHeatmap   heatmap={marketExtras.sectorHeatmap} />
                    <ExploreMacroBrGrid     bundle={marketExtras.macroBr} />
                    <ExploreGlobalMacroGrid bundle={marketExtras.macroGlobal} range={timeRange} />
                    <ExploreComparisonsGrid comparisons={marketExtras.comparisons} range={timeRange} />
                  </div>
                )}
              </section>
              )}

              {/* === Movimentos === */}
              {activeSection === "movimentos" && (
              <section
                role="tabpanel"
                id="mercado-panel-movimentos"
                aria-labelledby="mercado-tab-movimentos"
                tabIndex={0}
                className="mercado-section-enter space-y-6 outline-none"
              >
                <div className="max-w-[720px] space-y-2">
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Empresas em destaque</p>
                  <h2 className="text-2xl font-semibold leading-tight tracking-[-0.025em] text-foreground">
                    Movimentos
                  </h2>
                  <p className="text-sm leading-6 text-muted-foreground">
                    Empresas específicas em foco — altas, baixas e curadoria de prioridades para abrir primeiro.
                  </p>
                </div>

                {/*
                 * Filtro por setor — substitui a antiga ilha "Lente da curadoria"
                 * (decorativa). Derivado dos movers do dia; aplica cascata em
                 * highlights + movers + Ver todas.
                 */}
                <ExploreSectorFilter
                  sectors={sectorsForFilter}
                  activeSector={activeSector}
                  onSelect={setActiveSector}
                  totalCount={totalMoversCount}
                />

                <ExploreHighlightsSection
                  summaryScope={summaryScope}
                  summaryState={summaryState}
                  hasSectorSelected={hasSectorSelected}
                  hasWatchlist={hasWatchlist}
                  sortedHighlights={filteredHighlights}
                  highlights={highlights}
                  showAllHighlights={showAllHighlights}
                  getCompanyLogo={getCompanyLogo}
                  setSummaryScope={setSummaryScope}
                  setSummaryState={setSummaryState}
                  setShowAllHighlights={setShowAllHighlights}
                  applyHighlightPreset={applyHighlightPreset}
                />

                <div className="pt-2">
                  <ExploreMovementsPanel
                    selectedTab={selectedTab}
                    movers={filteredMovers}
                    movementInsights={movementInsights}
                    getCompanyLogo={getCompanyLogo}
                    setSelectedTab={setSelectedTab}
                  />
                </div>

                {/*
                 * Ilhas Sprint 1 — rollout incremental. Cada componente esconde
                 * a si mesmo quando não há dado (no-op), então a integração é
                 * segura mesmo em backends antigos sem esses bundles.
                 *
                 * Ordem escolhida: alfa setorial antes (leitura ativa do dia),
                 * ex-dividendos depois (contextualização de quedas técnicas).
                 */}
                {marketExtras?.sectorAlpha && (
                  <div className="pt-2">
                    <ExploreSectorAlphaPanel bundle={marketExtras.sectorAlpha} />
                  </div>
                )}

                {marketExtras?.exDividends && (
                  <div className="pt-2">
                    <ExploreExDividendsPanel bundle={marketExtras.exDividends} />
                  </div>
                )}

                {/*
                 * Disclosure: "Ver todas as movimentações do dia".
                 * Fica POR ÚLTIMO intencionalmente — é secondary, pra quem
                 * quer cavar depois de ler a curadoria. Nunca compete com os
                 * destaques acima. Esconde a si quando não há movers.
                 */}
                <ExploreAllMoversList movers={filteredMovers} />
              </section>
              )}

              {/* === Notícias === */}
              {activeSection === "noticias" && (
                <section
                  role="tabpanel"
                  id="mercado-panel-noticias"
                  aria-labelledby="mercado-tab-noticias"
                  tabIndex={0}
                  className="mercado-section-enter outline-none"
                >
                  <ExploreMarketNewsSection news={news} loading={newsLoading} />
                </section>
              )}
            </div>
          </div>
        </div>
      </MainContent>

      {/* Source drawer */}
      <ExploreDrawer open={!!selectedSource} onClose={() => setSelectedSource(null)} title="Detalhes da fonte">
        {selectedSource && (
          <div className="space-y-4 text-sm text-foreground/80">
            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Fonte</p>
              <p className="mt-1 font-medium text-foreground">{selectedSource.source.name}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Documento</p>
              <p className="mt-1 font-medium text-foreground">{selectedSource.source.docLabel}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Data de referência</p>
              <p className="mt-1 font-medium text-foreground">{selectedSource.source.updatedAt}</p>
            </div>
            {selectedSource.source.url && (
              <a
                href={selectedSource.source.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm font-medium text-brand transition-colors duration-200 hover:text-foreground"
              >
                Ver documento externo
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            )}
          </div>
        )}
      </ExploreDrawer>

      {/* Volatility drawer */}
      <ExploreDrawer open={showVolatilityDetails} onClose={() => setShowVolatilityDetails(false)} title="Detalhes da volatilidade">
        <div className="space-y-4 text-sm leading-6 text-foreground/80">
          <p>Volatilidade é a medida de quanto os preços oscilam em um período. Níveis mais altos indicam variações maiores no curto prazo.</p>
          <p>O score combina amplitude média de movimentos e dispersão diária, com referência à mediana dos últimos 12 meses.</p>
          <div>
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Fontes e atualização</p>
            <p className="mt-1 font-medium text-foreground">B3 · Atualização diária (D+1)</p>
          </div>
          <p className="text-xs leading-5 text-muted-foreground">
            Este indicador é educacional e não representa recomendação de compra ou venda.
          </p>
        </div>
      </ExploreDrawer>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { ArrowUpRight, ExternalLink, Globe, Newspaper, TrendingUp } from "lucide-react";
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

function cardImage(item: ExploreNewsItem): { type: "photo"; src: string } | { type: "logo"; src: string } | null {
  if (item.imageUrl) return { type: "photo", src: item.imageUrl };
  if (item.logoUrl)  return { type: "logo",  src: item.logoUrl };
  return null;
}
function newsSource(url: string): string {
  try {
    const host = new URL(url).hostname.replace(/^www\./, "");
    if (host.includes("infomoney"))   return "InfoMoney";
    if (host.includes("reuters"))     return "Reuters";
    if (host.includes("tradingview")) return "Reuters";
    if (host.includes("valor"))       return "Valor Econômico";
    if (host.includes("exame"))       return "Exame";
    if (host.includes("globo"))       return "Globo";
    if (host.includes("uol"))         return "UOL";
    if (host.includes("estadao"))     return "Estadão";
    if (host.includes("folha"))       return "Folha";
    return host.split(".")[0].charAt(0).toUpperCase() + host.split(".")[0].slice(1);
  } catch {
    return "Notícia";
  }
}

function formatNewsDate(iso: string | null): string {
  if (!iso) return "";
  try {
    return new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
  } catch { return iso; }
}

type MarketSectionId = "contexto" | "movimentos" | "noticias";

const marketSections: { id: MarketSectionId; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: "contexto", label: "Contexto de mercado", icon: Globe },
  { id: "movimentos", label: "Movimentos", icon: TrendingUp },
  { id: "noticias", label: "Notícias", icon: Newspaper },
];

export function MarketContextPage() {
  const [activeSection, setActiveSection] = useState<MarketSectionId>("contexto");
  const [news, setNews]       = useState<ExploreNewsItem[]>([]);
  const [newsLoading, setNewsLoading] = useState(false);
  const [newsFetched, setNewsFetched] = useState(false);

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
            {/* === Ribbon global (Fase 2) === */}
            <div className="mb-4">
              <ExploreMarketRibbon ribbon={marketExtras?.ribbon ?? null} isLoading={isLoading} />
            </div>

            <header className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div className="max-w-[680px] space-y-2">
                <p className="text-[12px] font-medium uppercase text-muted-foreground">Leitura de ambiente</p>
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-3">
                    <h1 className="text-[30px] font-semibold leading-[34px] tracking-[-0.04em] text-foreground">Mercado</h1>
                    <ExploreMarketTonePill tone={marketExtras?.marketTone ?? null} />
                  </div>
                  <p className="text-[13px] leading-6 text-muted-foreground">
                    Acompanhe o panorama macro, os movimentos das empresas e as principais notícias do dia em um só lugar.
                  </p>
                </div>
              </div>
              <ExploreTimeRangeToggle value={timeRange} onChange={setTimeRange} disabled={isLoading} />
            </header>

            {/* === Navegação por seção === */}
            <div className="mb-8 border-b border-border">
              <div className="flex flex-wrap gap-1.5">
                {marketSections.map((sec) => {
                  const Icon = sec.icon;
                  const isActive = sec.id === activeSection;
                  return (
                    <button
                      key={sec.id}
                      onClick={() => setActiveSection(sec.id)}
                      className={`relative inline-flex items-center gap-1.5 px-3 py-3.5 text-[14px] transition ${
                        isActive ? "font-semibold text-foreground" : "font-medium text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      <Icon className="h-[14px] w-[14px]" />
                      {sec.label}
                      {isActive && (
                        <span className="absolute bottom-0 left-0 right-0 h-[3px] rounded-full bg-brand" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="space-y-12">
              {/* === Contexto de mercado === */}
              {activeSection === "contexto" && (
              <section className="space-y-4">
                <div className="max-w-[720px] space-y-2">
                  <p className="text-[12px] font-medium uppercase text-muted-foreground">Visão geral</p>
                  <h2 className="text-[24px] font-semibold leading-7 tracking-[-0.03em] text-foreground">Contexto de mercado</h2>
                  <p className="text-[13px] leading-6 text-muted-foreground">
                    Panorama macro, índices globais e volatilidade para entender o ambiente antes de olhar empresa a empresa.
                  </p>
                </div>

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
                />

                {/* === Novos blocos da aba Contexto (Fase 2) === */}
                {marketExtras && (
                  <div className="mt-8 space-y-10">
                    <ExploreRiskPanel      riskPanel={marketExtras.riskPanel} />
                    <ExploreSectorHeatmap  heatmap={marketExtras.sectorHeatmap} />
                    <ExploreMacroBrGrid    bundle={marketExtras.macroBr} />
                    <ExploreGlobalMacroGrid bundle={marketExtras.macroGlobal} />
                    <ExploreComparisonsGrid comparisons={marketExtras.comparisons} />
                  </div>
                )}
              </section>
              )}

              {/* === Movimentos === */}
              {activeSection === "movimentos" && (
              <section className="space-y-5">
                <div className="max-w-[720px] space-y-2">
                  <p className="text-[12px] font-medium uppercase text-muted-foreground">Empresas em destaque</p>
                  <h2 className="text-[24px] font-semibold leading-7 tracking-[-0.03em] text-foreground">Movimentos</h2>
                  <p className="text-[13px] leading-6 text-muted-foreground">
                    Empresas específicas em foco — altas, baixas e curadoria de prioridades para abrir primeiro.
                  </p>
                </div>

                <ExploreHighlightsSection
                  summaryScope={summaryScope}
                  summaryState={summaryState}
                  hasSectorSelected={hasSectorSelected}
                  hasWatchlist={hasWatchlist}
                  sortedHighlights={sortedHighlights}
                  highlights={highlights}
                  showAllHighlights={showAllHighlights}
                  getCompanyLogo={getCompanyLogo}
                  setSummaryScope={setSummaryScope}
                  setSummaryState={setSummaryState}
                  setSelectedSource={setSelectedSource}
                  setShowAllHighlights={setShowAllHighlights}
                  applyHighlightPreset={applyHighlightPreset}
                />

                <div className="pt-2">
                  <ExploreMovementsPanel
                    selectedTab={selectedTab}
                    movers={movers}
                    movementInsights={movementInsights}
                    showAllMovements={showAllMovements}
                    movementSummary={movementSummary}
                    movementDominant={movementDominant}
                    getCompanyLogo={getCompanyLogo}
                    setSelectedTab={setSelectedTab}
                    setShowAllMovements={setShowAllMovements}
                  />
                </div>
              </section>
              )}

              {/* === Notícias === */}
              {activeSection === "noticias" && (
              <section className="space-y-5">
                <div className="max-w-[720px] space-y-2">
                  <p className="text-[12px] font-medium uppercase text-muted-foreground">Cobertura do dia</p>
                  <h2 className="text-[24px] font-semibold leading-7 tracking-[-0.03em] text-foreground">Notícias</h2>
                  <p className="text-[13px] leading-6 text-muted-foreground">
                    Manchetes selecionadas para complementar a leitura de contexto e movimentos.
                  </p>
                </div>

                {/* Skeleton */}
                {newsLoading && (
                  <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                    {Array.from({ length: 6 }).map((_, i) => (
                      <div key={i} className="h-64 animate-pulse rounded-[24px] bg-muted" />
                    ))}
                  </div>
                )}

                {/* Empty */}
                {!newsLoading && news.length === 0 && (
                  <div className="rounded-[24px] border border-border bg-card px-6 py-10 text-center text-[14px] text-muted-foreground">
                    Nenhuma notícia disponível no momento.
                  </div>
                )}

                {/* Cards */}
                {!newsLoading && news.length > 0 && (
                  <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                    {news.map((item, i) => {
                      const cover = cardImage(item);
                      return (
                        <article
                          key={i}
                          className="group flex flex-col overflow-hidden rounded-[24px] border border-border bg-card shadow-[0_18px_40px_rgba(15,23,40,0.05)] dark:shadow-none transition hover:-translate-y-0.5 hover:shadow-[0_24px_50px_rgba(15,23,40,0.08)]"
                        >
                          <div className="relative h-44 w-full overflow-hidden bg-muted">
                            {cover?.type === "photo" && (
                              <img
                                src={cover.src}
                                alt={item.title}
                                className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.04]"
                                onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
                              />
                            )}
                            {cover?.type === "logo" && (
                              <div className="flex h-full w-full items-center justify-center">
                                <img
                                  src={cover.src}
                                  alt={item.ticker ?? ""}
                                  className="h-16 w-16 rounded-[18px] border border-border bg-card object-cover p-2 shadow"
                                />
                              </div>
                            )}
                            {item.ticker && (
                              <span className="absolute left-4 top-4 inline-flex items-center gap-1.5 rounded-full bg-card/90 px-3 py-1 text-[11px] font-medium uppercase text-blue-700 dark:text-blue-300 backdrop-blur">
                                {item.logoUrl && (
                                  <img src={item.logoUrl} alt={item.ticker} className="h-4 w-4 rounded object-cover" />
                                )}
                                {item.ticker}
                              </span>
                            )}
                          </div>
                          <div className="flex flex-1 flex-col gap-4 p-5">
                            <div>
                              <p className="text-[12px] font-medium uppercase text-muted-foreground">
                                {newsSource(item.url)}{item.date ? ` · ${formatNewsDate(item.date)}` : ""}
                              </p>
                              <h3 className="mt-2 text-[16px] font-semibold leading-6 tracking-[-0.01em] text-foreground line-clamp-3">
                                {item.title}
                              </h3>
                            </div>
                            <a
                              href={item.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="mt-auto inline-flex items-center gap-1.5 text-[13px] font-semibold text-brand transition group-hover:gap-2"
                            >
                              Ler matéria
                              <ArrowUpRight className="h-4 w-4" />
                            </a>
                          </div>
                        </article>
                      );
                    })}
                  </div>
                )}
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
              <p className="text-xs text-muted-foreground">Fonte</p>
              <p className="font-medium text-foreground">{selectedSource.source.name}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Documento</p>
              <p className="font-medium text-foreground">{selectedSource.source.docLabel}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Data de referência</p>
              <p className="font-medium text-foreground">{selectedSource.source.updatedAt}</p>
            </div>
            {selectedSource.source.url && (
              <a href={selectedSource.source.url} className="inline-flex items-center gap-2 text-xs text-brand hover:text-foreground">
                Ver documento externo
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
          </div>
        )}
      </ExploreDrawer>

      {/* Volatility drawer */}
      <ExploreDrawer open={showVolatilityDetails} onClose={() => setShowVolatilityDetails(false)} title="Detalhes da volatilidade">
        <div className="space-y-4 text-sm text-foreground/80">
          <p>Volatilidade é a medida de quanto os preços oscilam em um período. Níveis mais altos indicam variações maiores no curto prazo.</p>
          <p>O score combina amplitude média de movimentos e dispersão diária, com referência à mediana dos últimos 12 meses.</p>
          <div>
            <p className="text-xs text-muted-foreground">Fontes e atualização</p>
            <p className="font-medium text-foreground">B3 . Atualização diária (D+1)</p>
          </div>
          <p className="text-xs text-muted-foreground">Este indicador é educacional e não representa recomendação de compra ou venda.</p>
        </div>
      </ExploreDrawer>
    </div>
  );
}

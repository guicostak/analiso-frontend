"use client";

import { useState } from "react";
import { ArrowUpRight, ExternalLink, Globe, Newspaper, TrendingUp } from "lucide-react";
import { Sidebar } from "@/src/components/layout/Sidebar";
import { AppTopBar } from "@/src/components/layout/AppTopBar";
import { MainContent } from "@/src/components/layout/MainContent";
import { useExplore } from "../hooks/useExplore";
import { ExploreHighlightsSection } from "./ExploreHighlightsSection";
import { ExploreMarketContext } from "./ExploreMarketContext";
import { ExploreMovementsPanel } from "./ExploreMovementsPanel";
import { ExploreDrawer } from "./ExploreDrawer";

const mockNews = [
  {
    id: "n1",
    headline: "Copom mantem Selic em 10,75% e sinaliza cautela com fiscal",
    source: "Valor Economico",
    publishedAt: "Ha 2h",
    category: "Macro",
    url: "https://valor.globo.com",
    image:
      "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=1200&q=60",
  },
  {
    id: "n2",
    headline: "Petrobras anuncia novo plano de investimentos de US$ 111 bilhoes",
    source: "Reuters",
    publishedAt: "Ha 4h",
    category: "Empresas",
    url: "https://www.reuters.com",
    image:
      "https://images.unsplash.com/photo-1518186285589-2f7649de83e0?auto=format&fit=crop&w=1200&q=60",
  },
  {
    id: "n3",
    headline: "Vale acelera projetos de minerio verde para atender demanda asiatica",
    source: "InfoMoney",
    publishedAt: "Ha 6h",
    category: "Commodities",
    url: "https://www.infomoney.com.br",
    image:
      "https://images.unsplash.com/photo-1473042904451-00171c69419d?auto=format&fit=crop&w=1200&q=60",
  },
];

type MarketSectionId = "contexto" | "movimentos" | "noticias";

const marketSections: { id: MarketSectionId; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: "contexto", label: "Contexto de mercado", icon: Globe },
  { id: "movimentos", label: "Movimentos", icon: TrendingUp },
  { id: "noticias", label: "Notícias", icon: Newspaper },
];

export function MarketContextPage() {
  const [activeSection, setActiveSection] = useState<MarketSectionId>("contexto");
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
            <header className="mb-4 space-y-2">
              <p className="text-[12px] font-medium uppercase text-muted-foreground">Leitura de ambiente</p>
              <div className="max-w-[680px] space-y-2">
                <h1 className="text-[30px] font-semibold leading-[34px] tracking-[-0.04em] text-foreground">Mercado</h1>
                <p className="text-[13px] leading-6 text-muted-foreground">
                  Acompanhe o panorama macro, os movimentos das empresas e as principais notícias do dia em um só lugar.
                </p>
              </div>
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

                <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                  {mockNews.map((news) => (
                    <article
                      key={news.id}
                      className="group flex flex-col overflow-hidden rounded-[24px] border border-border bg-card shadow-[0_18px_40px_rgba(15,23,40,0.05)] dark:shadow-none transition hover:-translate-y-0.5 hover:shadow-[0_24px_50px_rgba(15,23,40,0.08)]"
                    >
                      <div className="relative h-44 w-full overflow-hidden">
                        <img
                          src={news.image}
                          alt={news.headline}
                          className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.04]"
                        />
                        <span className="absolute left-4 top-4 inline-flex rounded-full bg-card/90 px-3 py-1 text-[11px] font-medium uppercase text-blue-700 dark:text-blue-300 backdrop-blur">
                          {news.category}
                        </span>
                      </div>
                      <div className="flex flex-1 flex-col gap-4 p-5">
                        <div>
                          <p className="text-[12px] font-medium uppercase text-muted-foreground">
                            {news.source} · {news.publishedAt}
                          </p>
                          <h3 className="mt-2 text-[17px] font-semibold leading-6 tracking-[-0.01em] text-foreground">
                            {news.headline}
                          </h3>
                        </div>
                        <a
                          href={news.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-auto inline-flex items-center gap-1.5 text-[13px] font-semibold text-brand transition group-hover:gap-2"
                        >
                          Ler matéria
                          <ArrowUpRight className="h-4 w-4" />
                        </a>
                      </div>
                    </article>
                  ))}
                </div>
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

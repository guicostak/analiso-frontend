"use client";

import { ExternalLink } from "lucide-react";
import { Sidebar } from "@/src/components/layout/Sidebar";
import { AppTopBar } from "@/src/components/layout/AppTopBar";
import { MainContent } from "@/src/components/layout/MainContent";
import { useExplore } from "../hooks/useExplore";
import { ExploreHighlightsSection } from "./ExploreHighlightsSection";
import { ExploreMovementsPanel } from "./ExploreMovementsPanel";
import { ExploreDrawer } from "./ExploreDrawer";

export function NoticiasPage() {
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
      <Sidebar currentPage="noticias" />

      <AppTopBar sidebarOffsetClassName="left-0 xl:left-[240px]" />

      <MainContent className="relative overflow-hidden pt-20">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-[18%] top-0 h-80 w-80 rounded-full bg-[radial-gradient(circle,rgba(91,141,239,0.10)_0%,rgba(91,141,239,0)_72%)]" />
          <div className="absolute right-[10%] top-40 h-72 w-72 rounded-full bg-[radial-gradient(circle,rgba(18,165,148,0.08)_0%,rgba(18,165,148,0)_72%)]" />
        </div>

        <div className="relative px-6 pb-20 pt-5">
          <div className="mx-auto max-w-[1380px]">
            <header className="mb-4 space-y-2">
              <p className="text-[12px] font-medium uppercase text-muted-foreground">Movimentos do mercado</p>
              <div className="max-w-[640px] space-y-2">
                <h1 className="text-[30px] font-semibold leading-[34px] tracking-[-0.04em] text-foreground">Notícias</h1>
                <p className="text-[13px] leading-6 text-muted-foreground">
                  Acompanhe as maiores altas, baixas e os ativos mais negociados do pregão.
                </p>
              </div>
            </header>

            <div className="space-y-4">
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

              <div className="pt-6">
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
    </div>
  );
}

"use client";

import { useMemo, useState } from "react";
import { ExploreHighlightsSection } from "@/src/features/explore/components/ExploreHighlightsSection";
import { ExploreCompanyCatalog } from "@/src/features/explore/components/ExploreCompanyCatalog";
import { ExploreMarketContext } from "@/src/features/explore/components/ExploreMarketContext";
import {
  companies,
  getCompanyLogo,
  getPresetChipLabels,
  getSortedHighlights,
  highlights,
  indexCards,
  pillarLabelMap,
  thesisCollections,
  volatility,
} from "@/src/features/explore/services";
import type {
  Filters,
  HighlightItem,
  HighlightPreset,
  HighlightScopeLabel,
  SummaryState,
} from "@/src/features/explore/interfaces";

const DEFAULT_FILTERS: Filters = {
  sector: "Todos",
  size: "Todos",
  status: "Todos",
  freshness: "Todos",
  pillar: "Todos",
  sort: "Mais atualizadas",
};

export function CompanyExploreMock() {
  const [selectedEntryPoints, setSelectedEntryPoints] = useState<string[]>([]);
  const [compareTickers, setCompareTickers] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [summaryScope, setSummaryScope] = useState<HighlightScopeLabel>("Mercado");
  const [summaryState, setSummaryState] = useState<SummaryState>("ready");
  const [activePreset, setActivePreset] = useState<HighlightPreset | null>(null);
  const [appliedChips, setAppliedChips] = useState<string[]>([]);
  const [selectedSource, setSelectedSource] = useState<HighlightItem | null>(null);
  const [showAllHighlights, setShowAllHighlights] = useState(false);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [showVolatilityInfo, setShowVolatilityInfo] = useState(false);
  const [showContextPanel, setShowContextPanel] = useState(false);
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);

  const sortedHighlights = useMemo(() => getSortedHighlights(highlights), []);
  const filteredCompanies = useMemo(() => {
    return companies.filter((company) => {
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        if (
          !company.name.toLowerCase().includes(query) &&
          !company.ticker.toLowerCase().includes(query)
        ) {
          return false;
        }
      }

      if (filters.sector !== "Todos" && company.sector !== filters.sector) return false;
      if (filters.size !== "Todos" && company.size !== filters.size) return false;
      if (filters.status !== "Todos" && company.status !== filters.status) return false;
      if (filters.freshness !== "Todos" && company.freshnessStatus !== filters.freshness) return false;
      if (filters.pillar !== "Todos" && company.highlightPillar !== filters.pillar) return false;

      return true;
    });
  }, [activePreset, filters, searchQuery, sortedHighlights]);

  const staleCount = filteredCompanies.filter((company) => company.freshnessStatus === "Antigo").length;
  const showStaleBanner = staleCount >= 2;
  const hasSectorSelected = filters.sector !== "Todos";
  const hasWatchlist = false;
  const compactCompanies = filteredCompanies.slice(0, 4);

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-[20px] border border-border bg-[#F6FAFC] shadow-[0px_1px_2px_0px_rgba(228,229,231,0.24)]">
      <div className="flex-1 overflow-y-auto px-5 py-5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <style jsx>{`
          :global(.company-explore-filters .xl\:flex-row) {
            flex-direction: row !important;
            align-items: center !important;
          }
          :global(.company-explore-filters .xl\:min-w-\[260px\]) {
            min-width: 220px !important;
          }
          :global(.company-explore-filters .xl\:flex-1) {
            flex: 0 0 220px !important;
          }
          :global(.company-explore-filters .flex-1.flex-wrap.items-center.gap-3) {
            flex-wrap: nowrap !important;
          }
          :global(.company-explore-filters .relative.min-w-\[152px\].flex-1) {
            min-width: 0 !important;
            flex: 1 1 0 !important;
          }
        `}</style>
        <header className="mb-4 space-y-2">
          <p className="text-[12px] font-medium uppercase text-muted-foreground">Explorar mercado</p>
          <div className="max-w-[640px] space-y-2">
            <div className="text-[26px] font-semibold leading-[30px] tracking-[-0.04em] text-foreground">Explorar</div>
            <p className="text-[13px] leading-6 text-muted-foreground">
              Descubra empresas e movimentos com uma leitura guiada, priorizando o que merece abertura agora e deixando a exploração mais leve ao longo da página.
            </p>
          </div>
        </header>

        <div className="space-y-4">
          <ExploreHighlightsSection
            summaryScope={summaryScope}
            summaryState={summaryState}
            hasSectorSelected={hasSectorSelected}
            hasWatchlist={true}
            hideSummaryCard
            sortedHighlights={sortedHighlights}
            highlights={highlights}
            showAllHighlights={showAllHighlights}
            getCompanyLogo={getCompanyLogo}
            setSummaryScope={setSummaryScope}
            setSummaryState={setSummaryState}
            setSelectedSource={setSelectedSource}
            setShowAllHighlights={setShowAllHighlights}
            applyHighlightPreset={(preset) => {
              setActivePreset(preset);
              setAppliedChips(getPresetChipLabels(preset));
              setFilters((current) => ({ ...current, pillar: pillarLabelMap[preset.pillar] }));
            }}
          />

          <div className="company-explore-filters grid grid-cols-1 gap-5">
            <ExploreCompanyCatalog
              isLoading={false}
              filteredCompanies={compactCompanies}
              filters={filters}
              searchQuery={searchQuery}
              showAdvancedFilters={showAdvancedFilters}
              activePreset={activePreset}
              appliedChips={appliedChips}
              showStaleBanner={showStaleBanner}
              staleCount={staleCount}
              selectedEntryPoints={selectedEntryPoints}
              thesisCollections={thesisCollections}
              compareTickers={compareTickers}
              getCompanyLogo={getCompanyLogo}
              setSearchQuery={setSearchQuery}
              setFilters={setFilters}
              setShowAdvancedFilters={setShowAdvancedFilters}
              toggleEntryPoint={(entry) =>
                setSelectedEntryPoints((current) =>
                  current.includes(entry) ? current.filter((item) => item !== entry) : [...current, entry],
                )
              }
              clearEntryPoints={() => setSelectedEntryPoints([])}
              clearPreset={() => {
                setActivePreset(null);
                setAppliedChips([]);
              }}
              toggleCompare={(ticker) =>
                setCompareTickers((current) =>
                  current.includes(ticker) ? current.filter((item) => item !== ticker) : [...current, ticker].slice(0, 2),
                )
              }
              resetFilters={() => {
                setFilters(DEFAULT_FILTERS);
                setSearchQuery("");
                setSelectedEntryPoints([]);
                setActivePreset(null);
                setAppliedChips([]);
              }}
              isSearchActive={false}
              totalItems={0}
              totalPages={0}
              page={0}
              companySearchFilters={{}}
              goToPage={() => {}}
              updateFilters={() => {}}
              clearApiFilters={() => {}}
              favoriteTickers={new Set()}
              onToggleFavorite={() => {}}
            />

            <ExploreMarketContext
              isLoading={false}
              showContextPanel={showContextPanel}
              showVolatilityInfo={showVolatilityInfo}
              indexCards={indexCards}
              volatility={volatility}
              volatilityIsStale={false}
              setShowContextPanel={setShowContextPanel}
              setShowVolatilityInfo={setShowVolatilityInfo}
              setShowVolatilityDetails={() => {}}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

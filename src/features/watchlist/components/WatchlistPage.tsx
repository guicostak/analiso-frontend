"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import { Sidebar } from "@/src/components/layout/Sidebar";
import { AppTopBar } from "@/src/components/layout/AppTopBar";
import { MainContent } from "@/src/components/layout/MainContent";
import { useWatchlist } from "../hooks/useWatchlist";
import { useFavorites } from "@/src/features/favoritas";
import { useFavoriteCompanies } from "../hooks/useFavoriteCompanies";
import { getCompanyLogo } from "@/src/features/explore/services";
import { WatchlistHeader } from "./WatchlistHeader";
import { AddCompanyModal } from "./AddCompanyModal";
import { WatchlistSummarySection } from "./WatchlistSummarySection";
import { CompanyCard } from "@/src/components/shared/CompanyCard";

export function WatchlistPage() {
  const {
    uiState,
    pageHeader,
  } = useWatchlist();

  const favorites = useFavorites();
  const { companies: favoriteCompanies, isLoading: favCompaniesLoading } = useFavoriteCompanies(favorites.tickers);
  const [showAddModal, setShowAddModal] = useState(false);
  const [compareTickers, setCompareTickers] = useState<string[]>([]);

  function toggleCompare(ticker: string) {
    setCompareTickers((prev) =>
      prev.includes(ticker) ? prev.filter((t) => t !== ticker) : [...prev, ticker]
    );
  }

  const favoritesAuthError = favorites.error && favorites.error.message.includes("401");

  // Se o pipeline está vazio mas o usuário tem favoritos, mostra como "ready"
  // Enquanto favoritos carrega, mantém "loading" para não flashar o CTA vazio
  const hasFavorites = favorites.tickers.size > 0;
  const effectiveUiState =
    uiState === "empty" && favorites.isLoading ? "loading" :
    uiState === "empty" && hasFavorites ? "ready" :
    uiState;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Sidebar currentPage="watchlist" />
      <AppTopBar sidebarOffsetClassName="left-0 xl:left-[240px]" />

      <MainContent className="relative overflow-hidden pt-20">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-[14%] top-0 h-80 w-80 rounded-full bg-[radial-gradient(circle,rgba(91,141,239,0.09)_0%,rgba(91,141,239,0)_72%)]" />
          <div className="absolute right-[10%] top-44 h-72 w-72 rounded-full bg-[radial-gradient(circle,rgba(18,165,148,0.08)_0%,rgba(18,165,148,0)_72%)]" />
        </div>

        <div className="relative px-7 pb-8 pt-5">
          <div className="mx-auto max-w-[1480px]">
            <WatchlistHeader
              activeTab="list"
              title={pageHeader?.title ?? "Watchlist"}
              subtitle={pageHeader?.subtitle ?? "Acompanhe suas ações e receba notificações de mudanças."}
            />

            <AddCompanyModal
              isOpen={showAddModal}
              onClose={() => setShowAddModal(false)}
              onSelect={(ticker) => favorites.toggle(ticker)}
              excludeTickers={favorites.tickers}
              footerText={`${favorites.tickers.size} ${favorites.tickers.size === 1 ? "ação na watchlist" : "ações na watchlist"}`}
            />

            <div className="mt-5">
              <section className="space-y-5">
                {effectiveUiState === "empty" ? (
                  favoritesAuthError ? (
                    <div className="flex flex-col items-center rounded-[24px] border border-border bg-card px-7 py-12 text-center shadow-[0_14px_30px_rgba(15,23,40,0.04)] dark:shadow-none">
                      <h2 className="text-[22px] font-semibold leading-[28px] tracking-[-0.02em] text-foreground">
                        Sessão expirada
                      </h2>
                      <p className="mt-2 max-w-md text-[14px] leading-6 text-muted-foreground">
                        Não foi possível carregar sua watchlist. Faça login novamente para continuar.
                      </p>
                    </div>
                  ) : (
                  <div className="flex flex-col items-center rounded-[24px] border border-border bg-card px-7 py-12 text-center shadow-[0_14px_30px_rgba(15,23,40,0.04)] dark:shadow-none">
                    <h2 className="text-[22px] font-semibold leading-[28px] tracking-[-0.02em] text-foreground">
                      Comece adicionando ações à sua watchlist
                    </h2>
                    <p className="mt-2 max-w-md text-[14px] leading-6 text-muted-foreground">
                      Adicione empresas para acompanhar mudanças sem ruído.
                    </p>
                    <button
                      onClick={() => setShowAddModal(true)}
                      className="mt-6 inline-flex h-11 items-center gap-2 rounded-[18px] bg-brand px-6 text-[13px] font-semibold text-white shadow-[0_12px_24px_rgba(18,165,148,0.18)] transition hover:bg-brand/90 active:scale-[0.98] dark:shadow-none"
                    >
                      <Search className="h-4 w-4" />
                      Adicionar empresa
                    </button>
                  </div>
                  )
                ) : effectiveUiState === "loading" ? (
                  <div className="space-y-4">
                    <div className="space-y-4 rounded-[24px] border border-border bg-card p-5 shadow-[0_14px_30px_rgba(15,23,40,0.04)] dark:shadow-none">
                      <div className="h-4 w-32 rounded bg-muted" />
                      <div className="h-10 w-4/5 rounded-full bg-muted" />
                      <div className="h-4 w-3/4 rounded-full bg-muted" />
                    </div>
                    <div className="space-y-4 rounded-[24px] border border-border bg-card p-5 shadow-[0_14px_30px_rgba(15,23,40,0.04)] dark:shadow-none">
                      <div className="h-4 w-40 rounded bg-muted" />
                      <div className="h-20 w-full rounded-[20px] bg-muted" />
                    </div>
                    <div className="rounded-[24px] border border-border bg-card p-5 shadow-[0_14px_30px_rgba(15,23,40,0.04)] dark:shadow-none">
                      <div className="h-14 w-full rounded-[18px] bg-muted" />
                    </div>
                  </div>
                ) : uiState === "empty" && hasFavorites ? (
                  /* Pipeline vazio mas o user tem favoritos — cards padronizados */
                  <div className="space-y-6">
                    <WatchlistSummarySection
                      hasFavorites={hasFavorites}
                      watchlistTickers={favorites.tickers}
                    />

                    <div className="flex items-center justify-between">
                      <p className="text-sm text-muted-foreground">
                        {favorites.tickers.size} {favorites.tickers.size === 1 ? "ação na watchlist" : "ações na watchlist"}
                      </p>
                      <button
                        onClick={() => setShowAddModal(true)}
                        className="inline-flex cursor-pointer items-center gap-1.5 rounded-[10px] border border-border bg-card px-3.5 py-2 text-[12px] font-medium text-foreground shadow-[0_1px_2px_rgba(15,23,40,0.05)] transition-[color,background-color,border-color,transform,box-shadow] duration-150 hover:border-brand hover:bg-brand/5 hover:text-brand active:scale-[0.97] dark:shadow-none"
                      >
                        <Search className="h-3.5 w-3.5" />
                        Adicionar
                      </button>
                    </div>

                    {favCompaniesLoading ? (
                      <div className="grid grid-cols-1 gap-5">
                        {[1, 2, 3].map((i) => (
                          <div key={i} className="space-y-4 rounded-[18px] border border-l-[3px] border-border bg-card p-5">
                            <div className="flex items-start gap-3.5">
                              <div className="h-10 w-10 animate-pulse rounded-[14px] bg-muted" />
                              <div className="flex-1 space-y-1.5">
                                <div className="h-4 w-40 animate-pulse rounded bg-muted" />
                                <div className="h-3 w-20 animate-pulse rounded bg-muted" />
                              </div>
                            </div>
                            <div className="flex gap-6 border-t border-border pt-3">
                              {[1, 2, 3, 4, 5].map((m) => (
                                <div key={m} className="space-y-1">
                                  <div className="h-2.5 w-10 animate-pulse rounded bg-muted" />
                                  <div className="h-3.5 w-14 animate-pulse rounded bg-muted" />
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 gap-5">
                        {favoriteCompanies.map((company) => {
                          const m = company.metrics ?? {};
                          return (
                            <CompanyCard
                              key={company.ticker}
                              ticker={company.ticker}
                              companyName={company.companyName}
                              logoUrl={company.logoUrl || getCompanyLogo(company.ticker)}
                              price={m.price}
                              sector={typeof m.sector === "string" ? m.sector : undefined}
                              metrics={m}
                              isComparing={compareTickers.includes(company.ticker)}
                              isFavorite={favorites.tickers.has(company.ticker)}
                              compareIsFirstAction={compareTickers.length === 0}
                              onToggleCompare={() => toggleCompare(company.ticker)}
                              onToggleFavorite={() => favorites.toggle(company.ticker)}
                              onAlert={() => {}}
                            />
                          );
                        })}
                      </div>
                    )}
                  </div>
                ) : null}
              </section>
            </div>
          </div>
        </div>
      </MainContent>
    </div>
  );
}

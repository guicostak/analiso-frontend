"use client";

/**
 * NoticiasMercadoIsland (6×5)
 *
 * Duas seções verticais:
 *   1. "Da sua watchlist" — manchetes filtradas pelos tickers da watchlist
 *   2. "Do mercado"        — manchetes gerais (sem ticker ou de outras empresas)
 *
 * Priorizamos itens com imagem real (não-placeholder) ao formar o top de
 * cada seção — o pipeline tem ~27% de notícias com foto verdadeira, e elas
 * pesam mais visualmente. Se a watchlist está vazia OU não houver matches,
 * a primeira seção é omitida e mostramos só "Do mercado".
 *
 * Reaproveita `getMarketNews(limit)` (endpoint público `/api/explore/news`)
 * — buscamos 50 itens e separamos client-side. Sem backend novo.
 */

import { useCallback, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { ChevronRight, ExternalLink, Newspaper } from "lucide-react";

import { useInViewLazyFetch } from "@/src/hooks";
import { getMarketNews, type ExploreNewsItem } from "@/src/features/explore/services";
import { useFavorites } from "@/src/features/favoritas";
import { cn } from "@/src/components/ui/utils";
import { Eye } from "lucide-react";
import type { IslandProps } from "../../interfaces/island.types";
import { useReadNews } from "../../hooks/useReadNews";
import { IslandShell } from "../shared/IslandShell";

const FETCH_LIMIT = 50;
const PER_SECTION = 3;
const PLACEHOLDER_IMG_TOKEN = "news-story.jpg";

function fmtDate(iso: string | null): string {
  if (!iso) return "";
  try {
    return new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
  } catch {
    return iso;
  }
}

function hasRealImage(url: string | null | undefined): boolean {
  if (!url) return false;
  if (url.includes(PLACEHOLDER_IMG_TOKEN)) return false;
  return true;
}

function validImage(url: string | null | undefined): string | null {
  return hasRealImage(url) ? (url as string) : null;
}

/** Resolve a melhor imagem possível pra notícia, na ordem:
 *   1. imageUrl real (não placeholder)
 *   2. logoUrl da empresa (quando há ticker associado)
 *   3. null → cai no fallback textual com ticker */
function resolveThumbnail(item: ExploreNewsItem): { src: string; isLogo: boolean } | null {
  const real = validImage(item.imageUrl);
  if (real) return { src: real, isLogo: false };
  if (item.logoUrl) return { src: item.logoUrl, isLogo: true };
  return null;
}

/**
 * Ordena priorizando itens com thumbnail (imagem real OU logo da empresa).
 * Mantém ordem cronológica relativa dentro de cada grupo. Notícias sem
 * nenhum visual ficam no fim e mostram fallback textual com ticker.
 */
function prioritizeByImage(items: ExploreNewsItem[]): ExploreNewsItem[] {
  const withVisual: ExploreNewsItem[] = [];
  const withoutVisual: ExploreNewsItem[] = [];
  for (const it of items) {
    if (hasRealImage(it.imageUrl) || it.logoUrl) withVisual.push(it);
    else withoutVisual.push(it);
  }
  return [...withVisual, ...withoutVisual];
}

export function NoticiasMercadoIsland(_props: IslandProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [allItems, setAllItems] = useState<ExploreNewsItem[]>([]);
  const [loaded, setLoaded] = useState(false);
  const favorites = useFavorites();

  const watchlistTickers = useMemo(
    () => new Set(Array.from(favorites.tickers).map((t) => t.toUpperCase())),
    [favorites.tickers],
  );
  const hasWatchlist = watchlistTickers.size > 0;

  const load = useCallback(async () => {
    try {
      const list = await getMarketNews(FETCH_LIMIT);
      setAllItems(list);
    } catch {
      // silencia — feed externo, falha tolerável
    } finally {
      setLoaded(true);
    }
  }, []);
  useInViewLazyFetch(ref, load);

  // Separa em 2 listas. Quando watchlist está vazia, watchlistNews fica []
  // e cai no fallback de mostrar só "geral".
  const { watchlistNews, generalNews } = useMemo(() => {
    if (!hasWatchlist) {
      return {
        watchlistNews: [] as ExploreNewsItem[],
        generalNews: prioritizeByImage(allItems).slice(0, PER_SECTION * 2),
      };
    }
    const matched: ExploreNewsItem[] = [];
    const rest: ExploreNewsItem[] = [];
    for (const n of allItems) {
      if (n.ticker && watchlistTickers.has(n.ticker.toUpperCase())) matched.push(n);
      else rest.push(n);
    }
    return {
      watchlistNews: prioritizeByImage(matched).slice(0, PER_SECTION),
      generalNews:   prioritizeByImage(rest).slice(0, PER_SECTION),
    };
  }, [allItems, watchlistTickers, hasWatchlist]);

  const showWatchlistSection = watchlistNews.length > 0;
  const isEmpty = loaded && allItems.length === 0;

  return (
    <IslandShell
      icon={<Newspaper className="h-4 w-4 text-muted-foreground" />}
      title="Notícias"
      right={
        <Link
          href="/mercado"
          className="inline-flex items-center gap-1 text-[11px] font-semibold text-brand hover:underline"
        >
          Ver tudo
          <ChevronRight className="h-3 w-3" />
        </Link>
      }
      info="Manchetes recentes — primeiro as relacionadas a empresas da sua watchlist, depois as gerais do mercado. Notícias já lidas ficam com texto mais sutil; clique pra abrir a fonte."
    >
      <div ref={ref} className="flex-1 min-h-0 overflow-y-auto pr-1">
        {!loaded && (
          <ul className="space-y-2.5">
            {[0, 1, 2, 3].map((i) => (
              <NewsRowSkeleton key={i} />
            ))}
          </ul>
        )}

        {isEmpty && (
          <p className="px-1 py-3 text-[12px] text-muted-foreground">
            Sem notícias disponíveis no momento.
          </p>
        )}

        {loaded && !isEmpty && (
          <div>
            {showWatchlistSection && (
              <section>
                <SectionHeader label="Da sua watchlist" />
                <ul className="space-y-2.5">
                  {watchlistNews.map((item, i) => (
                    <NewsRow key={`w-${item.url}-${i}`} item={item} />
                  ))}
                </ul>
              </section>
            )}

            {generalNews.length > 0 && (
              <section
                className={
                  showWatchlistSection
                    ? "mt-5 border-t border-border/60 pt-4"
                    : ""
                }
              >
                <SectionHeader
                  label={showWatchlistSection ? "Do mercado" : (hasWatchlist ? "Do mercado" : "Manchetes recentes")}
                />
                <ul className="space-y-2.5">
                  {generalNews.map((item, i) => (
                    <NewsRow key={`g-${item.url}-${i}`} item={item} />
                  ))}
                </ul>
              </section>
            )}
          </div>
        )}
      </div>
    </IslandShell>
  );
}

function SectionHeader({ label }: { label: string }) {
  return (
    <p className="mb-2.5 text-[12px] font-semibold uppercase tracking-wider text-foreground/80">
      {label}
    </p>
  );
}

function NewsRowSkeleton() {
  return (
    <li className="flex gap-3">
      <div className="h-16 w-20 flex-shrink-0 animate-pulse rounded-[10px] bg-muted" />
      <div className="flex-1 space-y-1.5 pt-1">
        <div className="h-3 w-3/4 animate-pulse rounded bg-muted" />
        <div className="h-3 w-1/2 animate-pulse rounded bg-muted" />
        <div className="h-2.5 w-1/3 animate-pulse rounded bg-muted" />
      </div>
    </li>
  );
}

/** Card individual de notícia — thumbnail + título + meta.
 *
 * Removido o sentiment dot (verde/vermelho/cinza no canto da thumb) que
 * não tinha utilidade clara. No lugar, agora exibe **indicador de leitura**:
 *   - Não lida: dot brand azul ao lado do título + título em peso normal
 *   - Lida: sem dot, título em texto muted (peso e cor reduzidos)
 *
 * Click marca como lida via `useReadNews` (persiste em localStorage).
 * Estado é local-only; sem sync entre devices.
 */
function NewsRow({ item }: { item: ExploreNewsItem }) {
  const { isRead, markAsRead } = useReadNews();
  const wasRead = isRead(item.url);
  const thumb = resolveThumbnail(item);

  return (
    <li>
      <a
        href={item.url}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => markAsRead(item.url)}
        className={cn(
          // Wrapper volta a ser `flex` simples — strip "já visto" agora
          // é OVERLAY absoluto (não toma layout space). `relative` é o
          // anchor pro absolute do strip + `overflow-hidden` previne o
          // gradient vazar pelos cantos arredondados.
          "group relative flex gap-3 overflow-hidden rounded-[12px] p-2 transition-colors duration-150 ease-out",
          wasRead
            ? "bg-muted/30 hover:bg-muted/60"
            : "bg-muted/50 hover:bg-muted",
        )}
      >
        <div className="relative h-16 w-20 flex-shrink-0 overflow-hidden rounded-[8px] bg-muted">
          {thumb ? (
            <img
              src={thumb.src}
              alt=""
              className={cn(
                "h-full w-full object-cover transition duration-300 group-hover:scale-[1.04]",
                wasRead && "opacity-70",
              )}
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).style.display = "none";
              }}
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-[10px] font-mono font-semibold text-muted-foreground/50">
              {item.ticker ?? "—"}
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1">
          {/* Sem dot indicador — o contraste de read/unread vem APENAS de:
              - peso do texto (semibold → medium quando lida)
              - cor (foreground → muted quando lida)
              - opacity da thumbnail (100 → 70 quando lida)
              - bg do card (muted/50 → muted/30 quando lida)
              Conjunto suficiente sem precisar de marcador visual extra. */}
          <p
            className={cn(
              "line-clamp-2 text-[12.5px] leading-snug",
              wasRead
                ? "font-medium text-muted-foreground"
                : "font-semibold text-foreground",
            )}
          >
            {item.title}
          </p>
          <p
            className={cn(
              "mt-1 truncate text-[10.5px]",
              wasRead ? "text-muted-foreground/70" : "text-muted-foreground",
            )}
          >
            {item.ticker ? (
              <>
                <span
                  className={cn(
                    "font-mono font-medium",
                    wasRead ? "text-foreground/50" : "text-foreground/80",
                  )}
                >
                  {item.ticker}
                </span>
                <span className="mx-1">·</span>
              </>
            ) : (
              <>
                <span>geral</span>
                <span className="mx-1">·</span>
              </>
            )}
            {fmtDate(item.date)}
          </p>
        </div>

        <ExternalLink
          className={cn(
            "mt-0.5 h-3 w-3 flex-shrink-0 self-start transition-colors",
            wasRead
              ? "text-muted-foreground/30 group-hover:text-muted-foreground/60"
              : "text-muted-foreground/40 group-hover:text-brand",
          )}
          aria-hidden
        />

        {/* Indicador "já visto" — sem fundo, só ícone + texto no canto
            inferior direito. Cor `muted-foreground` se mistura com o
            card sem precisar de gradient/overlay escuro. */}
        {wasRead && (
          <div
            className="pointer-events-none absolute bottom-1 right-2 inline-flex items-center gap-1 text-[9.5px] font-semibold text-muted-foreground"
            aria-hidden
          >
            <Eye className="h-2.5 w-2.5" />
            já visto
          </div>
        )}
      </a>
    </li>
  );
}

"use client";

import { useEffect, useState } from "react";
import { ExternalLink } from "lucide-react";
import Link from "next/link";
import { getMarketNews, type ExploreNewsItem } from "../services";

const _PLACEHOLDER = "news-story.jpg";

function validImage(url: string | null | undefined): string | null {
  if (!url) return null;
  if (url.includes(_PLACEHOLDER)) return null;
  return url;
}

function formatDate(iso: string | null): string {
  if (!iso) return "";
  try {
    const d = new Date(iso);
    return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" });
  } catch {
    return iso;
  }
}

function sentimentDot(s: string) {
  if (s === "good")    return "bg-teal-500";
  if (s === "bad")     return "bg-rose-500";
  return "bg-muted-foreground/40";
}

function NewsCard({ item, featured = false }: { item: ExploreNewsItem; featured?: boolean }) {
  const img = validImage(item.imageUrl);

  return (
    <a
      href={item.url}
      target="_blank"
      rel="noopener noreferrer"
      className={`group flex flex-col overflow-hidden rounded-[22px] border border-border bg-card shadow-[0_14px_34px_rgba(15,23,40,0.04)] dark:shadow-none transition hover:shadow-[0_18px_40px_rgba(15,23,40,0.08)] dark:hover:shadow-none ${
        featured ? "" : ""
      }`}
    >
      {/* Imagem */}
      {img && (
        <div className={`w-full overflow-hidden ${featured ? "h-48" : "h-36"}`}>
          <img
            src={img}
            alt={item.title}
            className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.02]"
            onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
          />
        </div>
      )}

      <div className={`flex flex-1 flex-col gap-2 ${featured ? "p-5" : "p-4"}`}>
        {/* Company badge */}
        {item.ticker && (
          <div className="flex items-center gap-2">
            {item.logoUrl && (
              <img
                src={item.logoUrl}
                alt={item.ticker}
                className="h-5 w-5 rounded-md border border-border bg-card object-cover p-0.5"
                onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
              />
            )}
            <span className="text-[11px] font-semibold text-muted-foreground">{item.ticker}</span>
            <span className={`h-1.5 w-1.5 rounded-full ${sentimentDot(item.sentiment)}`} />
          </div>
        )}

        {/* Título */}
        <p className={`font-semibold leading-snug text-foreground line-clamp-3 ${featured ? "text-[16px]" : "text-[14px]"}`}>
          {item.title}
        </p>

        {/* Footer */}
        <div className="mt-auto flex items-center justify-between pt-1">
          <span className="text-[11px] text-muted-foreground">{formatDate(item.date)}</span>
          <ExternalLink className="h-3.5 w-3.5 text-muted-foreground opacity-0 transition group-hover:opacity-100" />
        </div>
      </div>
    </a>
  );
}

function NewsCardCompact({ item }: { item: ExploreNewsItem }) {
  const img = validImage(item.imageUrl);

  return (
    <a
      href={item.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex items-start gap-3 rounded-[18px] border border-border bg-card px-4 py-3.5 shadow-[0_12px_28px_rgba(15,23,40,0.03)] dark:shadow-none transition hover:shadow-[0_14px_32px_rgba(15,23,40,0.06)] dark:hover:shadow-none"
    >
      {img && (
        <img
          src={img}
          alt={item.title}
          className="h-14 w-20 flex-shrink-0 rounded-[10px] object-cover"
          onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
        />
      )}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5 mb-1">
          {item.ticker && (
            <span className="text-[11px] font-semibold text-muted-foreground">{item.ticker}</span>
          )}
          <span className={`h-1.5 w-1.5 rounded-full ${sentimentDot(item.sentiment)}`} />
        </div>
        <p className="text-[13px] font-medium leading-5 text-foreground line-clamp-2">{item.title}</p>
        <p className="mt-1 text-[11px] text-muted-foreground">{formatDate(item.date)}</p>
      </div>
      <ExternalLink className="mt-1 h-3.5 w-3.5 flex-shrink-0 text-muted-foreground opacity-0 transition group-hover:opacity-100" />
    </a>
  );
}

export function ExploreNewsPanel() {
  const [news, setNews]       = useState<ExploreNewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(false);

  useEffect(() => {
    getMarketNews(20)
      .then(setNews)
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  const featured   = news[0] ?? null;
  const grid       = news.slice(1, 4);
  const compact    = news.slice(4);

  return (
    <section className="space-y-5">
      {/* Header */}
      <div>
        <p className="text-[12px] font-medium uppercase text-muted-foreground">Notícias</p>
        <h2 className="mt-2 text-[24px] font-semibold leading-7 tracking-[-0.03em] text-foreground">
          Últimas notícias do mercado
        </h2>
        <p className="mt-2.5 max-w-[720px] text-[14px] leading-6 text-muted-foreground">
          Notícias recentes das empresas analisadas, organizadas por relevância e data.
        </p>
      </div>

      {/* Loading */}
      {loading && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-48 animate-pulse rounded-[22px] bg-muted" />
          ))}
        </div>
      )}

      {/* Error */}
      {!loading && error && (
        <div className="rounded-[22px] border border-border bg-card px-6 py-8 text-center text-[14px] text-muted-foreground">
          Não foi possível carregar as notícias.
        </div>
      )}

      {/* Empty */}
      {!loading && !error && news.length === 0 && (
        <div className="rounded-[22px] border border-border bg-card px-6 py-8 text-center text-[14px] text-muted-foreground">
          Nenhuma notícia disponível no momento.
        </div>
      )}

      {/* Content */}
      {!loading && !error && news.length > 0 && (
        <div className="grid gap-5 xl:grid-cols-12">
          {/* Main column */}
          <div className="space-y-4 xl:col-span-8">
            {featured && <NewsCard item={featured} featured />}

            {grid.length > 0 && (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {grid.map((item, i) => (
                  <NewsCard key={i} item={item} />
                ))}
              </div>
            )}

            {compact.length > 0 && (
              <div className="space-y-3">
                {compact.map((item, i) => (
                  <NewsCardCompact key={i} item={item} />
                ))}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <aside className="space-y-4 xl:col-span-4 xl:sticky xl:top-24 xl:self-start">
            <div className="rounded-[22px] border border-border bg-card p-4 shadow-[0_14px_34px_rgba(15,23,40,0.04)] dark:shadow-none">
              <p className="text-[12px] font-medium uppercase text-blue-700 dark:text-blue-300">Como ler</p>
              <p className="mt-3 text-[15px] font-semibold leading-6 text-foreground">
                Notícia não é sinal de compra
              </p>
              <p className="mt-2.5 text-[13px] leading-5 text-muted-foreground">
                Use as notícias como contexto para entender o movimento do dia. Confirme sempre nos fundamentos antes de agir.
              </p>
            </div>

            <div className="rounded-[22px] border border-border bg-card p-4 shadow-[0_14px_34px_rgba(15,23,40,0.04)] dark:shadow-none">
              <p className="text-[12px] font-medium uppercase text-brand">Próximo passo</p>
              <p className="mt-3 text-[15px] font-semibold leading-6 text-foreground">
                Abra a análise da empresa
              </p>
              <p className="mt-2.5 text-[13px] leading-5 text-muted-foreground">
                Cada notícia está associada a uma empresa. Clique no ticker para ver a leitura completa dos fundamentos.
              </p>
            </div>
          </aside>
        </div>
      )}
    </section>
  );
}

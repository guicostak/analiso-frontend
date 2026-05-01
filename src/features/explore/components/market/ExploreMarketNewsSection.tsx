"use client";

/**
 * Seção de Notícias da tela de Mercado.
 *
 * Layout híbrido: 1 hero no topo + stream denso agrupado por data.
 *   - Diferença intencional para o grid uniforme anterior: ajudar o olho a
 *     priorizar (hero = destaque, stream = escaneio).
 *
 * Dados nativos de notícia exibidos (não duplicam Movimentos/Contexto):
 *   - sentimento EDITORIAL da matéria (good/bad/neutral) — fita lateral
 *   - fonte (InfoMoney, Reuters, Valor…) — filtro + label
 *   - timestamp relativo ("2h atrás", "ontem 14h")
 *
 * Intencionalmente NÃO exibe variação %, sparkline, setor ou "altas/quedas"
 * — isso já está nas outras seções da tela de Mercado.
 */

import { useMemo, useState } from "react";
import { ArrowUpRight, Newspaper } from "lucide-react";
import type { ExploreNewsItem } from "../../services";
import {
  formatRelativeTime,
  bucketByDate,
  BUCKET_LABEL,
  type NewsTimeBucket,
} from "../../utils/relativeTime";

const PLACEHOLDER_MARKERS = ["news-story.jpg", "placeholder", "default-image"];

function validImage(url: string | null | undefined): string | null {
  if (!url) return null;
  const lower = url.toLowerCase();
  if (PLACEHOLDER_MARKERS.some((m) => lower.includes(m))) return null;
  return url;
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
    const base = host.split(".")[0] ?? host;
    return base.charAt(0).toUpperCase() + base.slice(1);
  } catch {
    return "Notícia";
  }
}

type Sentiment = ExploreNewsItem["sentiment"];
type SentimentFilter = "all" | "good" | "bad" | "neutral";

const SENTIMENT_FILTERS: Array<{ id: SentimentFilter; label: string }> = [
  { id: "all",     label: "Todas" },
  { id: "good",    label: "Positivas" },
  { id: "bad",     label: "Negativas" },
  { id: "neutral", label: "Neutras" },
];

function sentimentStripe(s: Sentiment): string {
  if (s === "good") return "bg-success-text";
  if (s === "bad")  return "bg-danger-text";
  return "bg-border";
}

function sentimentLabel(s: Sentiment): string {
  if (s === "good") return "Positiva";
  if (s === "bad")  return "Negativa";
  return "Neutra";
}

function sentimentChip(s: Sentiment): string {
  if (s === "good") return "bg-success-surface text-success-text border-success-border";
  if (s === "bad")  return "bg-danger-surface text-danger-text border-danger-border";
  return "bg-muted text-muted-foreground border-border";
}

/* ───────────────────────── Hero card ───────────────────────── */

function NewsHero({ item }: { item: ExploreNewsItem }) {
  const img = validImage(item.imageUrl);
  const logo = item.logoUrl;
  const source = newsSource(item.url);
  const rel = formatRelativeTime(item.date);

  return (
    <a
      href={item.url}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={item.title}
      className="mercado-elev-md mercado-island-hover group relative flex flex-col overflow-hidden rounded-3xl border border-border bg-card md:flex-row md:min-h-[280px]"
    >
      {/* Fita lateral de sentimento */}
      <span
        aria-hidden
        className={`absolute left-0 top-0 h-full w-[3px] ${sentimentStripe(item.sentiment)}`}
      />

      {/* Mídia */}
      <div className="relative h-56 w-full overflow-hidden bg-muted md:h-auto md:w-1/2 md:min-h-[280px]">
        {img ? (
          <img
            src={img}
            alt=""
            className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.04]"
            onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
          />
        ) : (
          <HeroImageFallback logoUrl={logo} ticker={item.ticker} />
        )}
      </div>

      {/* Conteúdo */}
      <div className="flex flex-1 flex-col gap-4 p-6 md:p-8">
        <div className="flex flex-wrap items-center gap-2 text-[11px] uppercase tracking-wide">
          <span className="font-semibold text-foreground">{source}</span>
          {item.ticker && (
            <>
              <span className="text-muted-foreground">·</span>
              <span className="inline-flex items-center gap-1.5 font-medium text-foreground/80">
                {logo && (
                  <img
                    src={logo}
                    alt=""
                    className="h-4 w-4 rounded object-cover"
                    onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
                  />
                )}
                {item.ticker}
              </span>
            </>
          )}
          <span
            className={`ml-1 inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-medium ${sentimentChip(item.sentiment)}`}
          >
            {sentimentLabel(item.sentiment)}
          </span>
          {rel && (
            <>
              <span className="text-muted-foreground">·</span>
              <span className="text-muted-foreground">{rel}</span>
            </>
          )}
        </div>

        <h3 className="line-clamp-4 text-2xl font-semibold leading-tight tracking-[-0.02em] text-foreground md:text-[28px] md:leading-9">
          {item.title}
        </h3>

        <span className="mt-auto inline-flex items-center gap-1.5 text-sm font-semibold text-brand transition-all duration-200 group-hover:gap-2">
          Ler matéria
          <ArrowUpRight className="h-4 w-4" />
        </span>
      </div>
    </a>
  );
}

function HeroImageFallback({ logoUrl, ticker }: { logoUrl: string | null; ticker: string | null }) {
  return (
    <div className="relative flex h-full w-full items-center justify-center bg-gradient-to-br from-muted via-muted/60 to-card">
      <Newspaper className="absolute right-6 bottom-6 h-16 w-16 text-border" strokeWidth={1} />
      {logoUrl ? (
        <img
          src={logoUrl}
          alt={ticker ?? ""}
          className="h-20 w-20 rounded-[20px] border border-border bg-card object-cover p-3 shadow-sm"
          onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
        />
      ) : (
        <Newspaper className="h-14 w-14 text-muted-foreground/40" strokeWidth={1.25} />
      )}
    </div>
  );
}

/* ─────────────────────── Stream item (denso) ─────────────────────── */

function NewsStreamItem({ item }: { item: ExploreNewsItem }) {
  const img = validImage(item.imageUrl);
  const logo = item.logoUrl;
  const source = newsSource(item.url);
  const rel = formatRelativeTime(item.date);

  return (
    <a
      href={item.url}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={item.title}
      className="mercado-elev-sm mercado-island-hover group relative flex items-start gap-4 overflow-hidden rounded-2xl border border-border bg-card px-4 py-4"
    >
      {/* Fita lateral de sentimento */}
      <span
        aria-hidden
        className={`absolute left-0 top-0 h-full w-[3px] ${sentimentStripe(item.sentiment)}`}
      />

      {/* Thumb */}
      <div className="relative ml-1 h-20 w-20 flex-shrink-0 overflow-hidden rounded-xl bg-muted">
        {img ? (
          <img
            src={img}
            alt=""
            className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.05]"
            onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
          />
        ) : logo ? (
          <div className="flex h-full w-full items-center justify-center">
            <img
              src={logo}
              alt=""
              className="h-10 w-10 rounded-lg border border-border bg-card object-cover p-1"
              onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
            />
          </div>
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <Newspaper className="h-8 w-8 text-muted-foreground/40" strokeWidth={1.25} />
          </div>
        )}
      </div>

      {/* Texto */}
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-1.5 text-[11px] uppercase tracking-wide">
          <span className="font-semibold text-foreground">{source}</span>
          {item.ticker && (
            <>
              <span className="text-muted-foreground">·</span>
              <span className="font-medium text-foreground/80">{item.ticker}</span>
            </>
          )}
          <span
            className={`inline-flex items-center rounded-full border px-1.5 py-0.5 text-[10px] font-medium ${sentimentChip(item.sentiment)}`}
          >
            {sentimentLabel(item.sentiment)}
          </span>
        </div>
        <p className="mt-1.5 line-clamp-2 text-sm font-semibold leading-5 text-foreground transition-colors duration-200 group-hover:text-brand">
          {item.title}
        </p>
        {rel && (
          <p className="mt-1.5 text-[11px] text-muted-foreground">{rel}</p>
        )}
      </div>

      <ArrowUpRight className="mt-1 h-4 w-4 flex-shrink-0 text-muted-foreground opacity-0 transition group-hover:opacity-100" />
    </a>
  );
}

/* ───────────────────────── Filtros ───────────────────────── */

interface NewsFiltersProps {
  sentiment: SentimentFilter;
  onSentimentChange: (s: SentimentFilter) => void;
  source: string | "all";
  onSourceChange: (s: string | "all") => void;
  availableSources: string[];
  counts: Record<SentimentFilter, number>;
}

function NewsFilters({
  sentiment,
  onSentimentChange,
  source,
  onSourceChange,
  availableSources,
  counts,
}: NewsFiltersProps) {
  return (
    <div className="flex flex-col gap-3">
      {/* Sentimento */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
          Sentimento
        </span>
        {SENTIMENT_FILTERS.map((f) => {
          const active = sentiment === f.id;
          const n = counts[f.id];
          return (
            <button
              key={f.id}
              type="button"
              onClick={() => onSentimentChange(f.id)}
              aria-pressed={active}
              className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition-colors duration-200 ${
                active
                  ? "border-foreground bg-foreground text-background"
                  : "border-border bg-card text-foreground/80 hover:bg-accent"
              }`}
            >
              {f.label}
              <span className={`text-[10px] tabular-nums ${active ? "text-background/70" : "text-muted-foreground"}`}>
                {n}
              </span>
            </button>
          );
        })}
      </div>

      {/* Fonte — só aparece quando há mais de 1 fonte */}
      {availableSources.length > 1 && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
            Fonte
          </span>
          <button
            type="button"
            onClick={() => onSourceChange("all")}
            aria-pressed={source === "all"}
            className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors duration-200 ${
              source === "all"
                ? "border-foreground bg-foreground text-background"
                : "border-border bg-card text-foreground/80 hover:bg-accent"
            }`}
          >
            Todas
          </button>
          {availableSources.map((s) => {
            const active = source === s;
            return (
              <button
                key={s}
                type="button"
                onClick={() => onSourceChange(s)}
                aria-pressed={active}
                className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors duration-200 ${
                  active
                    ? "border-foreground bg-foreground text-background"
                    : "border-border bg-card text-foreground/80 hover:bg-accent"
                }`}
              >
                {s}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ───────────────────────── Section ───────────────────────── */

interface ExploreMarketNewsSectionProps {
  news: ExploreNewsItem[];
  loading: boolean;
}

export function ExploreMarketNewsSection({ news, loading }: ExploreMarketNewsSectionProps) {
  const [sentiment, setSentiment] = useState<SentimentFilter>("all");
  const [source, setSource] = useState<string | "all">("all");

  // Contagens por sentimento para exibir nos pills (sempre sobre o universo
  // total, independente do filtro de fonte — evita "zera" na UX ao alternar)
  const sentimentCounts = useMemo<Record<SentimentFilter, number>>(() => {
    const base = { all: news.length, good: 0, bad: 0, neutral: 0 };
    for (const n of news) base[n.sentiment] = (base[n.sentiment] ?? 0) + 1;
    return base as Record<SentimentFilter, number>;
  }, [news]);

  const availableSources = useMemo(() => {
    const set = new Set<string>();
    for (const n of news) set.add(newsSource(n.url));
    return Array.from(set).sort();
  }, [news]);

  const filtered = useMemo(() => {
    return news.filter((n) => {
      if (sentiment !== "all" && n.sentiment !== sentiment) return false;
      if (source !== "all" && newsSource(n.url) !== source) return false;
      return true;
    });
  }, [news, sentiment, source]);

  const hero = filtered[0] ?? null;
  const stream = filtered.slice(1);

  // Agrupa o stream por bucket temporal preservando a ordem original (que já
  // vem do backend ordenado por data desc).
  const grouped = useMemo(() => {
    const groups: Record<NewsTimeBucket, ExploreNewsItem[]> = {
      today: [], yesterday: [], thisWeek: [], older: [],
    };
    for (const item of stream) groups[bucketByDate(item.date)].push(item);
    return groups;
  }, [stream]);

  const bucketOrder: NewsTimeBucket[] = ["today", "yesterday", "thisWeek", "older"];

  return (
    <section className="space-y-6">
      {/* Header */}
      <div className="max-w-[720px] space-y-2">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Cobertura do dia</p>
        <h2 className="text-2xl font-semibold leading-tight tracking-[-0.025em] text-foreground">Notícias</h2>
        <p className="text-sm leading-6 text-muted-foreground">
          Manchetes selecionadas para complementar a leitura de contexto e movimentos.
        </p>
      </div>

      {/* Skeleton */}
      {loading && (
        <div className="space-y-4">
          <div className="h-[280px] animate-pulse rounded-3xl bg-muted" />
          <div className="grid gap-3 md:grid-cols-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-28 animate-pulse rounded-2xl bg-muted" />
            ))}
          </div>
        </div>
      )}

      {/* Empty (sem dados) */}
      {!loading && news.length === 0 && (
        <div className="mercado-elev-sm rounded-3xl border border-border bg-card px-6 py-10 text-center text-sm text-muted-foreground">
          Nenhuma notícia disponível no momento.
        </div>
      )}

      {/* Conteúdo */}
      {!loading && news.length > 0 && (
        <>
          <NewsFilters
            sentiment={sentiment}
            onSentimentChange={setSentiment}
            source={source}
            onSourceChange={setSource}
            availableSources={availableSources}
            counts={sentimentCounts}
          />

          {/* Filtro vazio (há dados mas nenhum bate o filtro) */}
          {filtered.length === 0 && (
            <div className="mercado-elev-sm rounded-3xl border border-border bg-card px-6 py-10 text-center text-sm text-muted-foreground">
              Nenhuma notícia com esse filtro.
            </div>
          )}

          {hero && <NewsHero item={hero} />}

          {stream.length > 0 && (
            <div className="space-y-6">
              {bucketOrder.map((bucket) => {
                const items = grouped[bucket];
                if (items.length === 0) return null;
                return (
                  <div key={bucket} className="space-y-3">
                    <div className="flex items-center gap-3">
                      <span className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                        {BUCKET_LABEL[bucket]}
                      </span>
                      <span className="h-px flex-1 bg-border" />
                      <span className="text-[11px] text-muted-foreground">{items.length}</span>
                    </div>
                    <div className="grid gap-3 md:grid-cols-2">
                      {items.map((item, i) => (
                        <NewsStreamItem key={`${bucket}-${i}`} item={item} />
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </section>
  );
}

"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { LandingNav } from "@/src/components/layout/LandingNav";
import { BLOG_POSTS, type BlogPost } from "../data/posts";
import { BookOpen, Clock, ArrowRight, Search, X } from "lucide-react";

const CATEGORY_COLORS: Record<string, { idle: string; active: string }> = {
  Fundamentos:   { idle: "bg-brand-surface text-brand-text border-brand-border",       active: "bg-brand text-white border-brand" },
  Valuation:     { idle: "bg-blue-50 text-blue-700 border-blue-200",                   active: "bg-blue-600 text-white border-blue-600" },
  Proventos:     { idle: "bg-emerald-50 text-emerald-700 border-emerald-200",           active: "bg-emerald-600 text-white border-emerald-600" },
  Rentabilidade: { idle: "bg-violet-50 text-violet-700 border-violet-200",             active: "bg-violet-600 text-white border-violet-600" },
  Resultados:    { idle: "bg-amber-50 text-amber-700 border-amber-200",                active: "bg-amber-500 text-white border-amber-500" },
  Endividamento: { idle: "bg-rose-50 text-rose-700 border-rose-200",                   active: "bg-rose-600 text-white border-rose-600" },
  Análises:      { idle: "bg-orange-50 text-orange-700 border-orange-200",              active: "bg-orange-600 text-white border-orange-600" },
};

const IDLE_FALLBACK  = "bg-muted text-muted-foreground border-border";
const ACTIVE_FALLBACK = "bg-foreground text-background border-foreground";

function categoryIdle(cat: string)   { return CATEGORY_COLORS[cat]?.idle   ?? IDLE_FALLBACK; }
function categoryActive(cat: string) { return CATEGORY_COLORS[cat]?.active ?? ACTIVE_FALLBACK; }

function PostCard({ post }: { post: BlogPost }) {
  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group flex flex-col rounded-2xl border border-border bg-card p-6 shadow-[0_2px_8px_rgba(0,0,0,0.04)] transition-all duration-200 hover:-translate-y-0.5 hover:border-brand-border hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)]"
    >
      <div className="mb-4 flex items-center gap-2">
        <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${categoryIdle(post.category)}`}>
          {post.category}
        </span>
        <span className="flex items-center gap-1 text-xs text-muted-foreground">
          <Clock className="h-3 w-3" />
          {post.readTime} min de leitura
        </span>
      </div>

      <h2 className="mb-2 text-[17px] font-bold leading-snug text-foreground transition-colors group-hover:text-brand">
        {post.title}
      </h2>

      <p className="mb-4 flex-1 text-sm leading-relaxed text-muted-foreground">
        {post.description}
      </p>

      <div className="flex items-center gap-1 text-sm font-semibold text-brand">
        Ler artigo
        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
      </div>
    </Link>
  );
}

export function BlogListPage() {
  const [query, setQuery]             = useState("");
  const [activeCategory, setCategory] = useState<string | null>(null);

  const categories = useMemo(
    () => [...new Set(BLOG_POSTS.map((p) => p.category))],
    [],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return BLOG_POSTS.filter((p) => {
      const matchCat = activeCategory === null || p.category === activeCategory;
      const matchQ   = q === "" || (
        p.title.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.keywords.some((k) => k.toLowerCase().includes(q))
      );
      return matchCat && matchQ;
    });
  }, [query, activeCategory]);

  const hasFilters = query.trim() !== "" || activeCategory !== null;

  function clearFilters() {
    setQuery("");
    setCategory(null);
  }

  return (
    <div className="min-h-screen bg-card text-foreground">
      <LandingNav forceSolid />

      {/* Hero */}
      <section className="mx-auto max-w-[1430px] px-8 pb-12 pt-16 max-md:px-4 max-md:pt-10">
        <div className="max-w-2xl">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-brand-border bg-brand-surface px-3 py-1 text-sm font-semibold text-brand-text">
            <BookOpen className="h-3.5 w-3.5" />
            Blog de Educação Financeira
          </div>
          <h1 className="mb-4 text-4xl font-bold leading-tight tracking-tight text-foreground max-md:text-3xl">
            Aprenda análise de ações do{" "}
            <span className="text-brand">zero ao avançado</span>
          </h1>
          <p className="text-lg leading-relaxed text-muted-foreground">
            Indicadores, conceitos e análises de ações da B3 — escritos de
            forma clara, sem jargões desnecessários, para você investir com
            mais segurança.
          </p>
        </div>
      </section>

      {/* Filtros */}
      <section className="mx-auto max-w-[1430px] px-8 pb-8 max-md:px-4">
        {/* Campo de busca */}
        <div className="relative mb-6 max-w-md">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="search"
            placeholder="Buscar artigos…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="h-11 w-full rounded-[10px] border border-border bg-card pl-10 pr-10 text-sm text-foreground placeholder:text-muted-foreground focus:border-brand-border focus:outline-none focus:ring-2 focus:ring-brand-surface"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              aria-label="Limpar busca"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Pílulas de categoria */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setCategory(null)}
            className={`rounded-full border px-3 py-1 text-xs font-semibold transition-colors ${
              activeCategory === null
                ? "border-foreground bg-foreground text-background"
                : "border-border bg-muted text-muted-foreground hover:border-border-strong hover:text-foreground"
            }`}
          >
            Todos
          </button>

          {categories.map((cat) => {
            const isActive = activeCategory === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setCategory(isActive ? null : cat)}
                className={`rounded-full border px-3 py-1 text-xs font-semibold transition-colors ${
                  isActive ? categoryActive(cat) : categoryIdle(cat)
                }`}
              >
                {cat}
              </button>
            );
          })}

          {hasFilters && (
            <button
              type="button"
              onClick={clearFilters}
              className="flex items-center gap-1 rounded-full border border-border px-3 py-1 text-xs font-semibold text-muted-foreground hover:text-foreground"
            >
              <X className="h-3 w-3" />
              Limpar filtros
            </button>
          )}
        </div>
      </section>

      {/* Posts grid */}
      <section className="mx-auto max-w-[1430px] px-8 pb-24 max-md:px-4">
        {filtered.length > 0 ? (
          <>
            {hasFilters && (
              <p className="mb-6 text-sm text-muted-foreground">
                {filtered.length} {filtered.length === 1 ? "artigo encontrado" : "artigos encontrados"}
              </p>
            )}
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((post) => (
                <PostCard key={post.slug} post={post} />
              ))}
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center gap-3 py-24 text-center">
            <Search className="h-10 w-10 text-muted-foreground/40" />
            <p className="text-base font-semibold text-foreground">Nenhum artigo encontrado</p>
            <p className="text-sm text-muted-foreground">
              Tente buscar por outro termo ou{" "}
              <button type="button" onClick={clearFilters} className="text-brand underline-offset-2 hover:underline">
                limpar os filtros
              </button>
            </p>
          </div>
        )}
      </section>

      {/* CTA */}
      <section className="border-t border-border bg-brand-surface">
        <div className="mx-auto flex max-w-[1430px] flex-col items-center gap-4 px-8 py-16 text-center max-md:px-4">
          <h2 className="text-2xl font-bold text-foreground">
            Pronto para analisar ações na prática?
          </h2>
          <p className="max-w-md text-muted-foreground">
            A Analiso reúne todos esses indicadores em um único lugar, com
            leitura guiada e linguagem clara.
          </p>
          <Link
            href="/login"
            className="inline-flex h-11 items-center justify-center rounded-[10px] bg-brand px-6 text-sm font-semibold text-white transition-colors hover:bg-brand-hover"
          >
            Começar gratuitamente
          </Link>
        </div>
      </section>
    </div>
  );
}

import Link from "next/link";
import { notFound } from "next/navigation";
import { JsonLd } from "@/src/components/seo/JsonLd";
import { LandingNav } from "@/src/components/layout/LandingNav";
import {
  getPostBySlug,
  getRelatedPosts,
  type BlogPost,
  type ContentBlock,
} from "../data/posts";
import {
  ArrowLeft,
  ArrowRight,
  Clock,
  Calendar,
  Lightbulb,
  AlertTriangle,
  Info,
} from "lucide-react";

/* ── Content block renderers ─────────────────────────────────────────── */

function renderBlock(block: ContentBlock, idx: number) {
  switch (block.type) {
    case "intro":
      return (
        <p
          key={idx}
          className="mb-6 text-lg leading-relaxed text-foreground/90 [&:first-of-type]:font-medium"
        >
          {block.text}
        </p>
      );

    case "h2":
      return (
        <h2
          key={idx}
          className="mb-3 mt-8 text-xl font-bold text-foreground first:mt-0"
        >
          {block.text}
        </h2>
      );

    case "h3":
      return (
        <h3
          key={idx}
          className="mb-2 mt-6 text-base font-bold text-foreground"
        >
          {block.text}
        </h3>
      );

    case "p":
      return (
        <p key={idx} className="mb-4 leading-relaxed text-foreground/85">
          {block.text}
        </p>
      );

    case "ul":
      return (
        <ul key={idx} className="mb-4 space-y-1.5 pl-1">
          {block.items.map((item, i) => (
            <li key={i} className="flex items-start gap-2 text-foreground/85">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand" />
              <span className="leading-relaxed">{item}</span>
            </li>
          ))}
        </ul>
      );

    case "ol":
      return (
        <ol key={idx} className="mb-4 space-y-2 pl-1">
          {block.items.map((item, i) => (
            <li key={i} className="flex items-start gap-3 text-foreground/85">
              <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand text-[11px] font-bold text-white">
                {i + 1}
              </span>
              <span className="leading-relaxed">{item}</span>
            </li>
          ))}
        </ol>
      );

    case "formula":
      return (
        <div
          key={idx}
          className="mb-6 overflow-hidden rounded-2xl border border-brand-border bg-brand-surface"
        >
          <div className="border-b border-brand-border px-5 py-2.5">
            <span className="text-xs font-bold uppercase tracking-wider text-brand-text">
              Fórmula: {block.label}
            </span>
          </div>
          <div className="px-5 py-4">
            <p className="mb-1 font-mono text-base font-semibold text-foreground">
              {block.expression}
            </p>
            {block.description && (
              <p className="text-sm text-muted-foreground">{block.description}</p>
            )}
          </div>
        </div>
      );

    case "callout": {
      const styles = {
        tip: {
          bg: "bg-brand-surface border-brand-border",
          icon: <Lightbulb className="h-4 w-4 text-brand" />,
          label: "Dica",
          labelColor: "text-brand-text",
        },
        warning: {
          bg: "bg-amber-50 border-amber-200",
          icon: <AlertTriangle className="h-4 w-4 text-amber-600" />,
          label: "Atenção",
          labelColor: "text-amber-700",
        },
        info: {
          bg: "bg-blue-50 border-blue-200",
          icon: <Info className="h-4 w-4 text-blue-600" />,
          label: "Saiba mais",
          labelColor: "text-blue-700",
        },
      };
      const s = styles[block.variant];
      return (
        <div
          key={idx}
          className={`mb-5 rounded-2xl border px-5 py-4 ${s.bg}`}
        >
          <div className={`mb-1 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider ${s.labelColor}`}>
            {s.icon}
            {s.label}
          </div>
          <p className="text-sm leading-relaxed text-foreground/85">
            {block.text}
          </p>
        </div>
      );
    }

    case "table":
      return (
        <div key={idx} className="mb-6 overflow-x-auto rounded-2xl border border-border">
          <table className="w-full min-w-[480px] text-sm">
            <thead>
              <tr className="border-b border-border bg-muted">
                {block.headers.map((h, i) => (
                  <th
                    key={i}
                    className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-muted-foreground"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {block.rows.map((row, ri) => (
                <tr
                  key={ri}
                  className="border-b border-border last:border-0 odd:bg-card even:bg-muted/40"
                >
                  {row.map((cell, ci) => (
                    <td key={ci} className="px-4 py-3 text-foreground/85">
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );

    default:
      return null;
  }
}

/* ── Related post card ────────────────────────────────────────────────── */

function RelatedCard({ post }: { post: BlogPost }) {
  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group flex flex-col gap-2 rounded-2xl border border-border bg-card p-5 transition-all hover:border-brand-border hover:shadow-md"
    >
      <span className="text-xs font-semibold text-brand">{post.category}</span>
      <h3 className="text-sm font-semibold leading-snug text-foreground group-hover:text-brand">
        {post.title}
      </h3>
      <span className="mt-auto flex items-center gap-1 text-xs font-semibold text-brand">
        Ler artigo <ArrowRight className="h-3 w-3" />
      </span>
    </Link>
  );
}

/* ── JSON-LD Article structured data ─────────────────────────────────── */

function ArticleJsonLd({ post }: { post: BlogPost }) {
  const data = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.description,
    image: ["https://www.analiso.com.br/logo.png"],
    keywords: post.keywords.join(", "),
    datePublished: post.publishedAt,
    dateModified: post.updatedAt ?? post.publishedAt,
    author: {
      "@type": "Organization",
      name: "Analiso",
      url: "https://www.analiso.com.br",
    },
    publisher: {
      "@type": "Organization",
      name: "Analiso",
      url: "https://www.analiso.com.br",
      logo: {
        "@type": "ImageObject",
        url: "https://www.analiso.com.br/logo.png",
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `https://www.analiso.com.br/blog/${post.slug}`,
    },
  };

  return <JsonLd data={data} />;
}

function BreadcrumbJsonLd({ post }: { post: BlogPost }) {
  const data = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://www.analiso.com.br" },
      { "@type": "ListItem", position: 2, name: "Blog", item: "https://www.analiso.com.br/blog" },
      { "@type": "ListItem", position: 3, name: post.title, item: `https://www.analiso.com.br/blog/${post.slug}` },
    ],
  };
  return <JsonLd data={data} />;
}

/* ── Page component ───────────────────────────────────────────────────── */

export function BlogPostPage({ slug }: { slug: string }) {
  const post = getPostBySlug(slug);
  if (!post) notFound();

  const related = getRelatedPosts(slug, 3);

  const formattedDate = new Intl.DateTimeFormat("pt-BR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(post.publishedAt + "T00:00:00"));

  return (
    <>
      <ArticleJsonLd post={post} />
      <BreadcrumbJsonLd post={post} />

      <div className="min-h-screen bg-card text-foreground">
        <LandingNav />

        {/* Breadcrumb */}
        <nav
          aria-label="Breadcrumb"
          className="mx-auto max-w-[1430px] px-8 pt-6 max-md:px-4"
        >
          <ol className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <li>
              <Link href="/" className="hover:text-foreground">
                Home
              </Link>
            </li>
            <li aria-hidden>/</li>
            <li>
              <Link href="/blog" className="hover:text-foreground">
                Blog
              </Link>
            </li>
            <li aria-hidden>/</li>
            <li className="truncate font-medium text-foreground">
              {post.category}
            </li>
          </ol>
        </nav>

        {/* Article */}
        <article className="mx-auto max-w-[1430px] px-8 max-md:px-4">
          <div className="mx-auto max-w-2xl py-10">
            {/* Header */}
            <header className="mb-10">
              <div className="mb-4 flex flex-wrap items-center gap-3">
                <span className="rounded-full border border-brand-border bg-brand-surface px-3 py-1 text-xs font-bold text-brand-text">
                  {post.category}
                </span>
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  {post.readTime} min de leitura
                </span>
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Calendar className="h-3 w-3" />
                  {formattedDate}
                </span>
              </div>

              <h1 className="mb-4 text-3xl font-bold leading-tight tracking-tight text-foreground max-md:text-2xl">
                {post.title}
              </h1>
              <p className="text-lg leading-relaxed text-muted-foreground">
                {post.description}
              </p>
            </header>

            {/* Content */}
            <div>{post.content.map((block, idx) => renderBlock(block, idx))}</div>

            {/* Back link */}
            <div className="mt-12 border-t border-border pt-8">
              <Link
                href="/blog"
                className="inline-flex items-center gap-2 text-sm font-semibold text-brand hover:text-brand-hover"
              >
                <ArrowLeft className="h-4 w-4" />
                Ver todos os artigos
              </Link>
            </div>
          </div>
        </article>

        {/* Related posts */}
        {related.length > 0 && (
          <section className="border-t border-border bg-background">
            <div className="mx-auto max-w-[1430px] px-8 py-16 max-md:px-4">
              <h2 className="mb-6 text-xl font-bold text-foreground">
                Artigos relacionados
              </h2>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {related.map((p) => (
                  <RelatedCard key={p.slug} post={p} />
                ))}
              </div>
            </div>
          </section>
        )}

        {/* CTA */}
        <section className="border-t border-border bg-brand-surface">
          <div className="mx-auto flex max-w-[1430px] flex-col items-center gap-4 px-8 py-16 text-center max-md:px-4">
            <h2 className="text-2xl font-bold text-foreground">
              Coloque em prática o que você aprendeu
            </h2>
            <p className="max-w-md text-muted-foreground">
              Analise qualquer empresa da B3 com todos esses indicadores
              organizados em um único lugar — com linguagem clara e sem
              complicação.
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
    </>
  );
}

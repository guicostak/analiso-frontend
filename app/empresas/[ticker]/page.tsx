import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, Lock } from "lucide-react";
import { LandingNav } from "@/src/components/layout/LandingNav";
import { JsonLd } from "@/src/components/seo/JsonLd";
import { SnowflakeChart, type SnowflakeDimension } from "@/src/components/shared/SnowflakeChart";
import { ScoreChecks } from "@/src/features/analysis/components/ScoreDots";
import {
  fetchPublicCompanyAnalysis,
  fetchPublicCompanySummary,
  fetchRelatedCompanies,
  type PublicCompanyAnalysis,
} from "@/src/features/empresa/services/public";
import { BLOG_POSTS } from "@/src/features/blog/data/posts";

export const revalidate = 604800;

interface PageProps {
  params: Promise<{ ticker: string }>;
}

function normalizeTicker(raw: string): string {
  return raw.trim().toUpperCase();
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { ticker } = await params;
  const upper = normalizeTicker(ticker);
  const summary = await fetchPublicCompanySummary(upper);

  if (!summary) {
    return {
      title: `${upper} — Empresa não encontrada`,
      robots: { index: false, follow: false },
    };
  }

  const title = `${summary.companyName} (${upper}) — Análise fundamentalista`;
  const description = `Análise de ${summary.companyName}: lucratividade, endividamento, eficiência, crescimento e valuation. Dados oficiais CVM, sem opinião especulativa.`;

  return {
    title,
    description,
    alternates: { canonical: `/empresas/${upper}` },
    openGraph: {
      url: `/empresas/${upper}`,
      type: "website",
      title,
      description,
    },
  };
}

const PILLAR_TONES: Record<string, { bg: string; text: string; ring: string; label: string }> = {
  Saudavel: { bg: "bg-emerald-50", text: "text-emerald-700", ring: "ring-emerald-200", label: "Saudável" },
  Saudável: { bg: "bg-emerald-50", text: "text-emerald-700", ring: "ring-emerald-200", label: "Saudável" },
  Atencao: { bg: "bg-amber-50", text: "text-amber-800", ring: "ring-amber-200", label: "Atenção" },
  Atenção: { bg: "bg-amber-50", text: "text-amber-800", ring: "ring-amber-200", label: "Atenção" },
  Risco: { bg: "bg-rose-50", text: "text-rose-700", ring: "ring-rose-200", label: "Risco" },
};

function pillarTone(status?: string) {
  if (!status) return PILLAR_TONES.Atencao;
  return PILLAR_TONES[status] ?? PILLAR_TONES.Atencao;
}

export default async function EmpresaPublicPage({ params }: PageProps) {
  const { ticker } = await params;
  const upper = normalizeTicker(ticker);

  const [summary, analysis] = await Promise.all([
    fetchPublicCompanySummary(upper),
    fetchPublicCompanyAnalysis(upper),
  ]);

  if (!summary) notFound();

  const related = await fetchRelatedCompanies(summary.sectorLabel, upper, 4);
  const relatedPosts = BLOG_POSTS.slice(0, 3);

  const pillars = (analysis?.pillars ?? []).slice(0, 5);
  const visiblePillars = pillars.slice(0, 2);
  const lockedPillars = pillars.slice(2);

  // Build radar dimensions from all 5 pillars (the visual teaser).
  const radarDimensions: SnowflakeDimension[] = pillars
    .filter((p) => typeof p.score === "number")
    .map((p) => ({
      label: p.displayName ?? p.name,
      value: Math.max(0, Math.min(100, p.score as number)),
    }));

  // Derive overall status from average score (healthy ≥70, attention ≥40, else risk).
  const avgScore =
    radarDimensions.length > 0
      ? radarDimensions.reduce((acc, d) => acc + d.value, 0) / radarDimensions.length
      : 0;
  const radarStatus: "healthy" | "attention" | "risk" =
    avgScore >= 70 ? "healthy" : avgScore >= 40 ? "attention" : "risk";

  function scoreToChecks(score: number): number {
    return Math.max(0, Math.min(6, Math.round((score / 100) * 6)));
  }

  const headline =
    analysis?.diagnosisHeadline ??
    `Visão fundamentalista de ${summary.companyName} estruturada nos 5 pilares.`;

  const summaryText =
    analysis?.summaryText ??
    `Estamos atualizando a análise pública de ${summary.companyName}. Crie sua conta gratuita para acessar o resumo completo do trimestre.`;

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://analiso.com.br" },
      { "@type": "ListItem", position: 2, name: "Empresas", item: "https://analiso.com.br/empresas" },
      {
        "@type": "ListItem",
        position: 3,
        name: upper,
        item: `https://analiso.com.br/empresas/${upper}`,
      },
    ],
  };

  const corporationJsonLd = {
    "@context": "https://schema.org",
    "@type": "Corporation",
    name: summary.companyName,
    tickerSymbol: upper,
    url: `https://analiso.com.br/empresas/${upper}`,
  };

  return (
    <div className="min-h-screen bg-background">
      <JsonLd data={breadcrumbJsonLd} />
      <JsonLd data={corporationJsonLd} />
      <LandingNav />

      <main className="mx-auto max-w-[1100px] px-6 pb-24 pt-16 md:px-10 md:pt-20">
        {/* Breadcrumb visível */}
        <nav className="mb-6 flex items-center gap-2 text-sm text-muted-foreground" aria-label="Breadcrumb">
          <Link href="/" className="hover:text-foreground">Home</Link>
          <span>/</span>
          <Link href="/empresas" className="hover:text-foreground">Empresas</Link>
          <span>/</span>
          <span className="text-foreground">{upper}</span>
        </nav>

        {/* Hero */}
        <header className="mb-10 flex flex-col gap-4">
          {summary.sectorLabel ? (
            <span className="w-fit rounded-lg bg-brand-surface px-2 py-1 text-xs font-semibold leading-[18px] text-brand-text">
              {summary.sectorLabel}
            </span>
          ) : null}
          <h1 className="text-[36px] font-semibold leading-[42px] tracking-[-0.36px] text-foreground md:text-[44px] md:leading-[50px]">
            Análise de {summary.companyName} ({upper})
          </h1>
          <p className="max-w-[720px] text-base leading-7 text-muted-foreground md:text-lg">
            {headline}
          </p>
        </header>

        {/* Radar visual — todos os 5 pilares (teaser) */}
        {radarDimensions.length >= 3 ? (
          <section className="mb-12 rounded-[20px] border border-border bg-card p-6 shadow-[0_1px_3px_rgba(0,0,0,0.05)] md:p-8">
            <div className="flex flex-col items-center gap-6 md:flex-row md:items-center md:gap-10">
              <div className="flex shrink-0 justify-center">
                <SnowflakeChart
                  dimensions={radarDimensions}
                  size="large"
                  status={radarStatus}
                  showTooltip={false}
                />
              </div>
              <div className="flex-1">
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Visão geral dos 5 pilares
                </span>
                <h2 className="mt-2 text-[22px] font-semibold leading-[28px] tracking-[-0.22px] text-foreground">
                  Como {upper} se comporta nos fundamentos
                </h2>
                <p className="mt-3 text-sm leading-6 text-muted-foreground md:text-base md:leading-7">
                  O radar acima sintetiza o desempenho de {summary.companyName} em
                  Lucratividade, Endividamento, Eficiência, Crescimento e Valuation.
                  Quanto maior a área preenchida, mais saudável o pilar. Crie sua conta
                  para ver o detalhamento completo de cada um.
                </p>
                <div className="mt-5 flex flex-wrap gap-2">
                  {radarDimensions.map((d) => (
                    <span
                      key={d.label}
                      className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-2.5 py-1 text-[11px] font-medium text-muted-foreground"
                    >
                      <span className="font-semibold text-foreground">{d.label}</span>
                      <span className="tabular-nums">{Math.round(d.value)}</span>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </section>
        ) : null}

        {/* Resumo do trimestre */}
        <section className="mb-12 rounded-[20px] border border-border bg-card p-6 shadow-[0_1px_3px_rgba(0,0,0,0.05)] md:p-8">
          <div className="mb-3 flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Resumo do trimestre
            </span>
            {analysis?.summaryMeta?.updatedAt ? (
              <span className="text-xs text-muted-foreground">
                · Atualizado em {analysis.summaryMeta.updatedAt}
              </span>
            ) : null}
          </div>
          <p className="text-base leading-7 text-foreground md:text-lg">{summaryText}</p>
          {analysis?.summaryMeta?.source ? (
            <p className="mt-3 text-xs text-muted-foreground">
              Fonte: {analysis.summaryMeta.source}
            </p>
          ) : null}
        </section>

        {/* Pilares — 2 visíveis + 3 bloqueados */}
        <section className="mb-12">
          <h2 className="mb-5 text-[22px] font-semibold leading-[28px] tracking-[-0.22px] text-foreground">
            Os 5 pilares de {upper}
          </h2>

          {visiblePillars.length > 0 ? (
            <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-2">
              {visiblePillars.map((p) => {
                const tone = pillarTone(p.status);
                const display = p.displayName ?? p.name;
                return (
                  <article
                    key={p.name}
                    className="rounded-[16px] border border-border bg-card p-6 shadow-[0_1px_3px_rgba(0,0,0,0.05)]"
                  >
                    <div className="mb-3 flex items-center justify-between gap-3">
                      <h3 className="text-base font-semibold text-foreground">{display}</h3>
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${tone.bg} ${tone.text} ${tone.ring}`}
                      >
                        {tone.label}
                      </span>
                    </div>
                    {typeof p.score === "number" ? (
                      <div className="mb-3 flex items-end justify-between gap-3">
                        <div className="text-3xl font-semibold tracking-tight text-foreground">
                          {p.score}
                          <span className="text-base text-muted-foreground">/100</span>
                        </div>
                        <ScoreChecks
                          score={scoreToChecks(p.score)}
                          total={6}
                          size="md"
                        />
                      </div>
                    ) : null}
                    {p.summary ? (
                      <p className="text-sm leading-6 text-muted-foreground">{p.summary}</p>
                    ) : null}
                  </article>
                );
              })}
            </div>
          ) : (
            <p className="mb-4 text-sm text-muted-foreground">
              Os pilares de {upper} ficam disponíveis após criar conta.
            </p>
          )}

          {/* Locked pillars */}
          {(lockedPillars.length > 0 || visiblePillars.length === 0) && (
            <div className="relative">
              <div
                className="pointer-events-none grid grid-cols-1 gap-4 opacity-60 md:grid-cols-3"
                aria-hidden="true"
              >
                {(lockedPillars.length > 0
                  ? lockedPillars
                  : [{ name: "Caixa" }, { name: "Margens" }, { name: "Retorno" }]
                ).map((p, i) => (
                  <div
                    key={`${p.name}-${i}`}
                    className="rounded-[16px] border border-border bg-card p-6 shadow-[0_1px_3px_rgba(0,0,0,0.05)]"
                    style={{ filter: "blur(3px)" }}
                  >
                    <div className="mb-3 h-4 w-24 rounded bg-muted" />
                    <div className="mb-2 h-8 w-20 rounded bg-muted" />
                    <div className="h-3 w-full rounded bg-muted" />
                    <div className="mt-1.5 h-3 w-2/3 rounded bg-muted" />
                  </div>
                ))}
              </div>
              <div className="absolute inset-0 flex items-center justify-center">
                <Link
                  href="/login"
                  className="group flex items-center gap-2 rounded-[12px] bg-foreground px-5 py-3 text-sm font-semibold text-background shadow-[0_8px_24px_rgba(0,0,0,0.18)] transition-transform hover:scale-[1.02]"
                >
                  <Lock className="h-4 w-4" />
                  Crie conta para ver os outros pilares
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </Link>
              </div>
            </div>
          )}
        </section>

        {/* CTA banner */}
        <section className="mb-14 overflow-hidden rounded-[20px] bg-[linear-gradient(180deg,#FFFFFF_0%,#E8F8F4_60%,#B7E9DD_100%)] p-10 text-center md:p-14">
          <h2 className="mb-3 text-[28px] font-semibold leading-[34px] tracking-[-0.28px] text-foreground md:text-[36px] md:leading-[42px]">
            Quer ir mais fundo em {upper}?
          </h2>
          <p className="mx-auto mb-7 max-w-[520px] text-base leading-7 text-muted-foreground md:text-lg">
            Crie sua conta gratuita e desbloqueie histórico, mudanças trimestrais, alertas e
            comparações com outras empresas do setor.
          </p>
          <Link
            href="/login"
            className="inline-flex h-12 items-center justify-center gap-2 rounded-[10px] bg-brand px-6 text-sm font-semibold text-white transition-colors hover:bg-brand-hover"
          >
            Criar conta gratuita
            <ArrowRight className="h-4 w-4" />
          </Link>
        </section>

        {/* Empresas relacionadas */}
        {related.length > 0 ? (
          <section className="mb-14">
            <h2 className="mb-5 text-[22px] font-semibold leading-[28px] tracking-[-0.22px] text-foreground">
              Empresas relacionadas{summary.sectorLabel ? ` — ${summary.sectorLabel}` : ""}
            </h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {related.map((r) => (
                <Link
                  key={r.ticker}
                  href={`/empresas/${r.ticker}`}
                  className="group flex flex-col gap-2 rounded-[16px] border border-border bg-card p-5 transition-all hover:border-brand-border hover:shadow-md"
                >
                  <span className="text-xs font-semibold text-brand">{r.ticker}</span>
                  <h3 className="text-sm font-semibold leading-snug text-foreground group-hover:text-brand">
                    {r.companyName}
                  </h3>
                  <span className="mt-auto flex items-center gap-1 text-xs font-semibold text-brand">
                    Ver análise <ArrowRight className="h-3 w-3" />
                  </span>
                </Link>
              ))}
            </div>
          </section>
        ) : null}

        {/* Posts do blog */}
        <section>
          <h2 className="mb-5 text-[22px] font-semibold leading-[28px] tracking-[-0.22px] text-foreground">
            Aprenda fundamentos antes de investir
          </h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {relatedPosts.map((p) => (
              <Link
                key={p.slug}
                href={`/blog/${p.slug}`}
                className="group flex flex-col gap-2 rounded-2xl border border-border bg-card p-5 transition-all hover:border-brand-border hover:shadow-md"
              >
                <span className="text-xs font-semibold text-brand">{p.category}</span>
                <h3 className="text-sm font-semibold leading-snug text-foreground group-hover:text-brand">
                  {p.title}
                </h3>
                <span className="mt-auto flex items-center gap-1 text-xs font-semibold text-brand">
                  Ler artigo <ArrowRight className="h-3 w-3" />
                </span>
              </Link>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}

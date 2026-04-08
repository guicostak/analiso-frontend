import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, Lock } from "lucide-react";
import { LandingNav } from "@/src/components/layout/LandingNav";
import { JsonLd } from "@/src/components/seo/JsonLd";
import { DIMENSION_COLORS, DIMENSION_INTRO } from "@/src/features/analysis/constants/colors";
import {
  fetchPublicCompanySummary,
  fetchRelatedCompanies,
  type PublicCompanyMetrics,
  type PublicCompanySummary,
} from "@/src/features/empresas/services/public";
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
  const description = `Análise de ${summary.companyName}: valuation, crescimento, performance, saúde financeira e dividendos. Dados oficiais CVM, sem opinião especulativa.`;

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

/* ── Status chip ──────────────────────────────────────────────────────────── */

const STATUS_TONE: Record<
  string,
  { bg: string; text: string; ring: string; label: string }
> = {
  Saudavel: { bg: "bg-emerald-50", text: "text-emerald-700", ring: "ring-emerald-200", label: "Saudável" },
  Saudável: { bg: "bg-emerald-50", text: "text-emerald-700", ring: "ring-emerald-200", label: "Saudável" },
  Atencao: { bg: "bg-amber-50", text: "text-amber-800", ring: "ring-amber-200", label: "Atenção" },
  Atenção: { bg: "bg-amber-50", text: "text-amber-800", ring: "ring-amber-200", label: "Atenção" },
  Risco: { bg: "bg-rose-50", text: "text-rose-700", ring: "ring-rose-200", label: "Risco" },
};

function statusTone(status?: string | null) {
  if (!status) return null;
  return STATUS_TONE[status] ?? null;
}

/* ── Metric formatters & qualitative thresholds ───────────────────────────── */

function fmtNum(value: number | undefined, opts?: { decimals?: number; suffix?: string }) {
  if (value == null || !Number.isFinite(value)) return "—";
  const decimals = opts?.decimals ?? 2;
  return `${value.toFixed(decimals)}${opts?.suffix ?? ""}`;
}

function fmtPercent(value: number | undefined, decimals = 1) {
  if (value == null || !Number.isFinite(value)) return "—";
  // ROE/ROIC vêm como ratios (0.17) ou já em pontos percentuais (17). Heurística simples:
  const pct = Math.abs(value) <= 2 ? value * 100 : value;
  return `${pct.toFixed(decimals)}%`;
}

type Quality = "good" | "neutral" | "bad";

function qualityTone(q: Quality) {
  if (q === "good") return { color: "var(--success-text)", bg: "var(--success-surface)" };
  if (q === "bad") return { color: "var(--danger-text)", bg: "var(--danger-surface)" };
  return { color: "var(--muted-foreground)", bg: "var(--muted)" };
}

function judgePL(v?: number): Quality {
  if (v == null || !Number.isFinite(v)) return "neutral";
  if (v <= 0) return "bad";
  if (v < 12) return "good";
  if (v < 22) return "neutral";
  return "bad";
}
function judgePVP(v?: number): Quality {
  if (v == null || !Number.isFinite(v)) return "neutral";
  if (v <= 0) return "bad";
  if (v < 1.5) return "good";
  if (v < 3) return "neutral";
  return "bad";
}
function judgeEV(v?: number): Quality {
  if (v == null || !Number.isFinite(v)) return "neutral";
  if (v <= 0) return "bad";
  if (v < 8) return "good";
  if (v < 14) return "neutral";
  return "bad";
}
function judgeRoe(v?: number): Quality {
  if (v == null || !Number.isFinite(v)) return "neutral";
  const pct = Math.abs(v) <= 2 ? v * 100 : v;
  if (pct >= 15) return "good";
  if (pct >= 8) return "neutral";
  return "bad";
}
function judgeRoic(v?: number): Quality {
  if (v == null || !Number.isFinite(v)) return "neutral";
  const pct = Math.abs(v) <= 2 ? v * 100 : v;
  if (pct >= 12) return "good";
  if (pct >= 6) return "neutral";
  return "bad";
}

interface MetricCardData {
  label: string;
  value: string;
  hint: string;
  quality: Quality;
}

function buildMetrics(m: PublicCompanyMetrics): MetricCardData[] {
  return [
    {
      label: "P/L",
      value: fmtNum(m.pl, { decimals: 1 }),
      hint: "Preço sobre lucro",
      quality: judgePL(m.pl),
    },
    {
      label: "P/VP",
      value: fmtNum(m.pvp, { decimals: 2 }),
      hint: "Preço sobre valor patrimonial",
      quality: judgePVP(m.pvp),
    },
    {
      label: "EV/EBITDA",
      value: fmtNum(m.evEbitda, { decimals: 1 }),
      hint: "Valor da firma sobre EBITDA",
      quality: judgeEV(m.evEbitda),
    },
    {
      label: "ROE",
      value: fmtPercent(m.roe, 1),
      hint: "Retorno sobre patrimônio",
      quality: judgeRoe(m.roe),
    },
    {
      label: "ROIC",
      value: fmtPercent(m.roic, 1),
      hint: "Retorno sobre capital investido",
      quality: judgeRoic(m.roic),
    },
  ];
}

/* ── Pillars (mirrors /analysis dimensions) ───────────────────────────────── */

const PILLARS: Array<{ id: keyof typeof DIMENSION_COLORS; label: string; teaser: string }> = [
  {
    id: "value",
    label: "Valuation",
    teaser: "Fluxo de caixa descontado, múltiplos e referência setorial — para entender se o preço atual reflete o valor real.",
  },
  {
    id: "future",
    label: "Crescimento Futuro",
    teaser: "Projeções de lucro e receita feitas por analistas profissionais. A previsibilidade do crescimento sustenta a tese de longo prazo.",
  },
  {
    id: "past",
    label: "Performance Passada",
    teaser: "Histórico de lucros, margens e retorno gerado pela operação. Empresas com padrão consistente tendem a manter a qualidade.",
  },
  {
    id: "health",
    label: "Saúde Financeira",
    teaser: "Endividamento, capacidade de pagar juros e geração de caixa operacional. O alicerce que separa empresas resilientes das frágeis.",
  },
  {
    id: "dividend",
    label: "Dividendos",
    teaser: "Yield, payout sustentável e histórico de distribuição. Dividendo alto sem lucro por trás é sinal de alerta — a análise mostra a foto completa.",
  },
];

/* ── Page ─────────────────────────────────────────────────────────────────── */

export default async function EmpresaPublicPage({ params }: PageProps) {
  const { ticker } = await params;
  const upper = normalizeTicker(ticker);

  const summary = await fetchPublicCompanySummary(upper);
  if (!summary) notFound();

  const related = await fetchRelatedCompanies(summary.sectorLabel, upper, 4);
  const relatedPosts = BLOG_POSTS.slice(0, 3);
  const metrics = buildMetrics(summary.metrics);
  const tone = statusTone(summary.status);

  const headline =
    summary.headline ??
    `Visão fundamentalista de ${summary.companyName} estruturada nos 5 pilares.`;
  const supportLine = summary.supportLine;

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://www.analiso.com.br" },
      { "@type": "ListItem", position: 2, name: "Empresas", item: "https://www.analiso.com.br/empresas" },
      {
        "@type": "ListItem",
        position: 3,
        name: upper,
        item: `https://www.analiso.com.br/empresas/${upper}`,
      },
    ],
  };

  const corporationJsonLd = {
    "@context": "https://schema.org",
    "@type": "Corporation",
    name: summary.companyName,
    tickerSymbol: upper,
    url: `https://www.analiso.com.br/empresas/${upper}`,
    ...(summary.logoUrl ? { logo: summary.logoUrl } : {}),
  };

  return (
    <div className="min-h-screen bg-background">
      <JsonLd data={breadcrumbJsonLd} />
      <JsonLd data={corporationJsonLd} />
      <LandingNav />

      <main className="mx-auto max-w-[1100px] px-4 pb-24 pt-16 md:px-8 md:pt-20">
        {/* Breadcrumb */}
        <nav
          className="mb-8 flex items-center gap-2 text-sm text-muted-foreground"
          aria-label="Breadcrumb"
        >
          <Link href="/" className="hover:text-foreground">
            Home
          </Link>
          <span>/</span>
          <Link href="/empresas" className="hover:text-foreground">
            Empresas
          </Link>
          <span>/</span>
          <span className="font-mono text-foreground">{upper}</span>
        </nav>

        {/* ── Hero / Company card ─────────────────────────────────────────── */}
        <header className="analysis-card mb-10 p-6 md:p-8">
          <div className="flex flex-col gap-6 md:flex-row md:items-start">
            {/* Logo */}
            <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-border bg-muted/40">
              {summary.logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={summary.logoUrl}
                  alt={summary.companyName}
                  className="h-full w-full object-contain"
                />
              ) : (
                <span className="font-mono text-xs font-bold text-muted-foreground">
                  {upper.slice(0, 4)}
                </span>
              )}
            </div>

            <div className="min-w-0 flex-1">
              <div className="mb-2 flex flex-wrap items-center gap-2">
                {summary.sectorLabel ? (
                  <span className="rounded-md border border-border bg-muted/40 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                    {summary.sectorLabel}
                  </span>
                ) : null}
                {tone ? (
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ring-1 ${tone.bg} ${tone.text} ${tone.ring}`}
                  >
                    {tone.label}
                  </span>
                ) : null}
              </div>

              <h1 className="text-[28px] font-semibold leading-[34px] tracking-tight text-foreground md:text-[36px] md:leading-[42px]">
                {summary.companyName}
                <span className="ml-3 align-middle font-mono text-base font-medium text-muted-foreground">
                  {upper}
                </span>
              </h1>

              <p className="mt-3 max-w-[680px] text-sm leading-6 text-muted-foreground md:text-base md:leading-7">
                {headline}
              </p>

              {supportLine ? (
                <p className="mt-2 max-w-[680px] text-sm leading-6 text-muted-foreground/90">
                  {supportLine}
                </p>
              ) : null}
            </div>

            {/* Price (if available) */}
            {summary.metrics.price != null ? (
              <div className="flex flex-col items-start md:items-end">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Preço atual
                </span>
                <span className="mt-1 font-mono text-2xl font-semibold tabular-nums text-foreground">
                  R$ {summary.metrics.price.toFixed(2)}
                </span>
              </div>
            ) : null}
          </div>
        </header>

        {/* ── Indicadores principais ──────────────────────────────────────── */}
        <section className="mb-14">
          <div className="analysis-divider mb-6">
            <div
              className="analysis-section-accent"
              style={{ backgroundColor: DIMENSION_COLORS.value }}
            />
            <h2
              className="whitespace-nowrap text-base font-bold uppercase tracking-wide md:text-lg"
              style={{ color: DIMENSION_COLORS.value, letterSpacing: "0.06em" }}
            >
              Indicadores principais
            </h2>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {metrics.map((m) => {
              const t = qualityTone(m.quality);
              return (
                <div
                  key={m.label}
                  className="analysis-card flex flex-col gap-2 p-4"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                      {m.label}
                    </span>
                    <span
                      className="inline-flex h-1.5 w-1.5 rounded-full"
                      style={{ backgroundColor: t.color }}
                      aria-hidden="true"
                    />
                  </div>
                  <span
                    className="font-mono text-2xl font-semibold tabular-nums tracking-tight"
                    style={{ color: m.quality === "neutral" ? "var(--foreground)" : t.color }}
                  >
                    {m.value}
                  </span>
                  <span className="text-[11px] leading-snug text-muted-foreground">
                    {m.hint}
                  </span>
                </div>
              );
            })}
          </div>

          <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
            Indicadores extraídos do último balanço público disponível. As cores são
            apenas referências de leitura — os 5 pilares completos analisam cada
            métrica em contexto histórico e setorial.
          </p>
        </section>

        {/* ── Os 5 pilares — todos bloqueados (teaser do /analysis) ───────── */}
        <section className="mb-14">
          <div className="mb-2 flex flex-col gap-2">
            <h2 className="text-[22px] font-semibold leading-[28px] tracking-[-0.22px] text-foreground md:text-[26px] md:leading-[32px]">
              Os 5 pilares de {upper}
            </h2>
            <p className="max-w-[640px] text-sm leading-6 text-muted-foreground">
              Cada pilar é analisado em até 6 critérios objetivos com dados oficiais
              da CVM. Crie sua conta gratuita para desbloquear a análise completa.
            </p>
          </div>

          <div className="relative mt-6">
            {/* Grid de pilares (visual base, blur sutil para denotar bloqueio) */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3" aria-hidden="true">
              {PILLARS.map((pillar) => {
                const color = DIMENSION_COLORS[pillar.id];
                const intro = DIMENSION_INTRO[pillar.id] ?? pillar.teaser;
                return (
                  <article
                    key={pillar.id}
                    className="analysis-card relative overflow-hidden p-6"
                  >
                    {/* Top accent */}
                    <div
                      className="absolute left-0 right-0 top-0 h-[2px]"
                      style={{ background: `linear-gradient(90deg, ${color}, ${color}40)` }}
                    />

                    <div className="mb-3 flex items-center gap-3">
                      <div
                        className="flex h-9 w-9 items-center justify-center rounded-xl"
                        style={{ backgroundColor: `${color}14` }}
                      >
                        <Lock className="h-4 w-4" style={{ color }} />
                      </div>
                      <h3
                        className="text-[15px] font-semibold tracking-tight"
                        style={{ color }}
                      >
                        {pillar.label}
                      </h3>
                    </div>

                    <p className="text-sm leading-6 text-muted-foreground">{intro}</p>

                    {/* Skeleton score row to give visual rhythm */}
                    <div className="mt-5 flex items-center gap-1.5" aria-hidden="true">
                      {Array.from({ length: 6 }).map((_, i) => (
                        <span
                          key={i}
                          className="h-1.5 flex-1 rounded-full"
                          style={{ backgroundColor: `${color}25` }}
                        />
                      ))}
                    </div>
                  </article>
                );
              })}
            </div>

            {/* CTA flutuante centralizado */}
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
              <Link
                href="/login"
                className="pointer-events-auto group flex items-center gap-2 rounded-[12px] bg-foreground px-5 py-3 text-sm font-semibold text-background shadow-[0_12px_32px_rgba(0,0,0,0.22)] transition-transform hover:scale-[1.02]"
              >
                <Lock className="h-4 w-4" />
                Crie conta para desbloquear a análise completa
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </div>
          </div>
        </section>

        {/* ── CTA banner ──────────────────────────────────────────────────── */}
        <section className="mb-14 overflow-hidden rounded-[20px] bg-[linear-gradient(180deg,#FFFFFF_0%,#E8F8F4_60%,#B7E9DD_100%)] p-10 text-center md:p-14">
          <h2 className="mb-3 text-[28px] font-semibold leading-[34px] tracking-[-0.28px] text-foreground md:text-[36px] md:leading-[42px]">
            Quer ir mais fundo em {upper}?
          </h2>
          <p className="mx-auto mb-7 max-w-[520px] text-base leading-7 text-muted-foreground md:text-lg">
            Crie sua conta gratuita e desbloqueie histórico, mudanças trimestrais,
            alertas e comparações com outras empresas do setor.
          </p>
          <Link
            href="/login"
            className="inline-flex h-12 items-center justify-center gap-2 rounded-[10px] bg-brand px-6 text-sm font-semibold text-white transition-colors hover:bg-brand-hover"
          >
            Criar conta gratuita
            <ArrowRight className="h-4 w-4" />
          </Link>
        </section>

        {/* ── Empresas relacionadas ───────────────────────────────────────── */}
        {related.length > 0 ? (
          <section className="mb-14">
            <div className="analysis-divider mb-6">
              <div
                className="analysis-section-accent"
                style={{ backgroundColor: DIMENSION_COLORS.past }}
              />
              <h2
                className="whitespace-nowrap text-base font-bold uppercase tracking-wide md:text-lg"
                style={{ color: DIMENSION_COLORS.past, letterSpacing: "0.06em" }}
              >
                Empresas relacionadas
                {summary.sectorLabel ? ` — ${summary.sectorLabel}` : ""}
              </h2>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {related.map((r: PublicCompanySummary) => (
                <Link
                  key={r.ticker}
                  href={`/empresas/${r.ticker}`}
                  className="analysis-card group flex flex-col gap-2 p-5"
                >
                  <span className="font-mono text-xs font-semibold text-brand">
                    {r.ticker}
                  </span>
                  <h3 className="text-sm font-semibold leading-snug text-foreground group-hover:text-brand">
                    {r.companyName}
                  </h3>
                  <span className="mt-auto inline-flex items-center gap-1 text-xs font-semibold text-brand">
                    Ver análise <ArrowRight className="h-3 w-3" />
                  </span>
                </Link>
              ))}
            </div>
          </section>
        ) : null}

        {/* ── Posts do blog ───────────────────────────────────────────────── */}
        <section>
          <div className="analysis-divider mb-6">
            <div
              className="analysis-section-accent"
              style={{ backgroundColor: DIMENSION_COLORS.dividend }}
            />
            <h2
              className="whitespace-nowrap text-base font-bold uppercase tracking-wide md:text-lg"
              style={{ color: DIMENSION_COLORS.dividend, letterSpacing: "0.06em" }}
            >
              Aprenda fundamentos antes de investir
            </h2>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {relatedPosts.map((p) => (
              <Link
                key={p.slug}
                href={`/blog/${p.slug}`}
                className="analysis-card group flex flex-col gap-2 p-5"
              >
                <span className="text-xs font-semibold text-brand">{p.category}</span>
                <h3 className="text-sm font-semibold leading-snug text-foreground group-hover:text-brand">
                  {p.title}
                </h3>
                <span className="mt-auto inline-flex items-center gap-1 text-xs font-semibold text-brand">
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

import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { LandingNav } from "@/src/components/layout/LandingNav";
import { JsonLd } from "@/src/components/seo/JsonLd";
import { fetchAllIndexableCompanies } from "@/src/features/empresas/services/public";

export const revalidate = 604800;

export const metadata: Metadata = {
  title: "Empresas da B3 — Análise fundamentalista por setor",
  description:
    "Navegue pelas empresas brasileiras listadas na B3 organizadas por setor. Análise estruturada em 5 pilares com dados oficiais da CVM.",
  alternates: { canonical: "/empresas" },
  openGraph: { url: "/empresas", type: "website" },
};

const breadcrumbJsonLd = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: "https://www.analiso.com.br" },
    { "@type": "ListItem", position: 2, name: "Empresas", item: "https://www.analiso.com.br/empresas" },
  ],
};

export default async function EmpresasHubPage() {
  const companies = await fetchAllIndexableCompanies();

  const bySector = new Map<string, typeof companies>();
  for (const company of companies) {
    const sector = company.sectorLabel?.trim() || "Outros";
    const list = bySector.get(sector) ?? [];
    list.push(company);
    bySector.set(sector, list);
  }
  const sectors = Array.from(bySector.entries()).sort(([a], [b]) => a.localeCompare(b, "pt-BR"));

  return (
    <div className="min-h-screen bg-background">
      <JsonLd data={breadcrumbJsonLd} />
      <LandingNav />

      <main className="mx-auto max-w-[1100px] px-6 pb-24 pt-16 md:px-10 md:pt-20">
        <nav className="mb-6 flex items-center gap-2 text-sm text-muted-foreground" aria-label="Breadcrumb">
          <Link href="/" className="hover:text-foreground">Home</Link>
          <span>/</span>
          <span className="text-foreground">Empresas</span>
        </nav>

        <header className="mb-12 flex flex-col gap-4">
          <span className="w-fit rounded-lg bg-brand-surface px-2 py-1 text-xs font-semibold leading-[18px] text-brand-text">
            Catálogo
          </span>
          <h1 className="text-[36px] font-semibold leading-[42px] tracking-[-0.36px] text-foreground md:text-[44px] md:leading-[50px]">
            Empresas da B3 com análise fundamentalista
          </h1>
          <p className="max-w-[720px] text-base leading-7 text-muted-foreground md:text-lg">
            {companies.length > 0
              ? `${companies.length} empresas listadas, organizadas por setor. Cada análise traz os 5 pilares — Lucratividade, Endividamento, Eficiência, Crescimento e Valuation — com dados oficiais da CVM.`
              : "Estamos atualizando o catálogo de empresas. Volte em breve."}
          </p>
        </header>

        {sectors.length > 0 ? (
          <div className="flex flex-col gap-12">
            {sectors.map(([sector, list]) => (
              <section key={sector}>
                <h2 className="mb-4 text-[13px] font-semibold uppercase tracking-widest text-muted-foreground">
                  {sector}
                </h2>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {list.map((c) => (
                    <Link
                      key={c.ticker}
                      href={`/empresas/${c.ticker}`}
                      className="group flex items-center justify-between gap-3 rounded-[14px] border border-border bg-card px-4 py-3.5 transition-all hover:border-brand-border hover:shadow-sm"
                    >
                      <div className="min-w-0">
                        <div className="text-xs font-semibold text-brand">{c.ticker}</div>
                        <div className="truncate text-sm font-medium text-foreground group-hover:text-brand">
                          {c.companyName}
                        </div>
                      </div>
                      <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-brand" />
                    </Link>
                  ))}
                </div>
              </section>
            ))}
          </div>
        ) : null}
      </main>
    </div>
  );
}

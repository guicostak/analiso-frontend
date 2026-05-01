import type { Metadata } from "next";
import Link from "next/link";
import { AlertCircle, ArrowLeft } from "lucide-react";
import { LandingNav } from "@/src/components/layout/LandingNav";
import { NoTickerSearch } from "./NoTickerSearch";

export const metadata: Metadata = {
  title: "Ticker não informado — Analiso",
  description:
    "Nenhum ticker foi informado. Busque uma empresa da B3 para ver a análise fundamentalista completa.",
  alternates: { canonical: "/analysis" },
  robots: { index: false, follow: true },
};

/**
 * /analysis (no ticker) — error state.
 *
 * Acesso direto a /analysis sem um ticker não é suportado. Mostramos uma
 * mensagem de erro curta, o mesmo componente de busca usado na tela logada e
 * um link de volta para a home.
 */
export default function AnalysisNoTickerPage() {
  return (
    <div className="min-h-screen bg-background">
      <LandingNav forceSolid />

      <main className="mx-auto flex max-w-[560px] flex-col items-center px-6 pb-24 pt-16 text-center md:pt-24">
        <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-full bg-destructive/10 text-destructive">
          <AlertCircle className="h-5 w-5" aria-hidden="true" />
        </div>

        <h1 className="text-xl font-semibold tracking-tight text-foreground md:text-2xl">
          Nenhum ticker informado
        </h1>

        <p className="mt-2 text-sm text-muted-foreground">
          Procure uma empresa para ver a análise.
        </p>

        <div className="mt-6 flex w-full justify-center">
          <NoTickerSearch />
        </div>

        <Link
          href="/"
          className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Voltar para a home
        </Link>
      </main>
    </div>
  );
}

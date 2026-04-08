import type { Metadata } from "next";
import { LandingPage } from "@/src/features/landing/components";

export const metadata: Metadata = {
  title: "Análise fundamentalista guiada de ações da B3",
  description:
    "Transforme dados financeiros em leitura clara: 5 pilares, contexto histórico e pontos de atenção identificados automaticamente. Comece grátis.",
  alternates: { canonical: "/" },
  openGraph: { url: "/", type: "website" },
};

export default function MarketingPage() {
  return <LandingPage />;
}

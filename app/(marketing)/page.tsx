import type { Metadata } from "next";
import { LandingPage } from "@/src/features/landing/components";

export const metadata: Metadata = {
  title: "Analiso — Análise fundamentalista guiada da B3 | Lançamento 01/05",
  description:
    "Entre na lista de espera e seja um dos primeiros a usar o Analiso: análise fundamentalista guiada das ações da B3. Vagas limitadas para fundadores com benefícios exclusivos.",
  alternates: { canonical: "/" },
  openGraph: { url: "/", type: "website" },
};

export default function MarketingPage() {
  return <LandingPage />;
}

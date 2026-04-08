import type { Metadata } from "next";
import { BlogListPage } from "@/src/features/blog/components/BlogListPage";

export const metadata: Metadata = {
  title: "Blog de Análise de Ações | Indicadores Fundamentalistas | Analiso",
  description:
    "Aprenda os principais conceitos de análise fundamentalista de ações: P/L, P/VP, ROE, Dividend Yield, EBITDA e muito mais. Artigos claros para investidores.",
  keywords: [
    "análise de ações",
    "análise fundamentalista",
    "indicadores financeiros",
    "P/L",
    "dividend yield",
    "ROE",
    "EBITDA",
    "como investir em ações",
    "bolsa de valores",
    "B3",
  ],
  alternates: {
    canonical: "https://www.analiso.com.br/blog",
  },
  openGraph: {
    title: "Blog de Análise de Ações | Analiso",
    description:
      "Aprenda análise fundamentalista com artigos claros sobre P/L, P/VP, ROE, Dividend Yield e os principais indicadores da B3.",
    url: "https://www.analiso.com.br/blog",
    siteName: "Analiso",
    locale: "pt_BR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Blog de Análise de Ações | Analiso",
    description:
      "Aprenda análise fundamentalista com artigos claros sobre P/L, P/VP, ROE, Dividend Yield e os principais indicadores da B3.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
};

export default function BlogPage() {
  return <BlogListPage />;
}

import type { Metadata } from "next";
import Script from "next/script";
import "../src/styles/globals.css";
import { Providers } from "./providers";
import { JsonLd } from "@/src/components/seo/JsonLd";

const rootJsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": "https://www.analiso.com.br/#organization",
      name: "Analiso",
      url: "https://www.analiso.com.br",
      logo: "https://www.analiso.com.br/logo.png",
    },
    {
      "@type": "WebSite",
      "@id": "https://www.analiso.com.br/#website",
      url: "https://www.analiso.com.br",
      name: "Analiso",
      publisher: { "@id": "https://www.analiso.com.br/#organization" },
      inLanguage: "pt-BR",
    },
  ],
};

export const metadata: Metadata = {
  metadataBase: new URL("https://www.analiso.com.br"),
  title: {
    default: "Analiso — Análise fundamentalista de ações da B3",
    template: "%s | Analiso",
  },
  description:
    "Análise guiada de empresas brasileiras listadas na B3 em 5 pilares: Lucratividade, Endividamento, Eficiência, Crescimento e Valuation.",
  icons: {
    icon: "/favicon.ico",
    apple: "/logo.png",
  },
  openGraph: {
    type: "website",
    locale: "pt_BR",
    siteName: "Analiso",
    url: "https://www.analiso.com.br",
  },
  twitter: { card: "summary_large_image" },
  other: {
    "google-adsense-account": "ca-pub-3249317765900933",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        <Script
          id="adsense"
          async
          strategy="afterInteractive"
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-3249317765900933"
          crossOrigin="anonymous"
        />
      </head>
      <body>
        <JsonLd data={rootJsonLd} />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import {
  AnalysisPreviewPage,
  DEFAULT_PREVIEW_TICKER,
} from "@/src/features/analysis/components/AnalysisPreviewPage";

export const metadata: Metadata = {
  title: "Análise fundamentalista de ações — prévia gratuita",
  description:
    "Veja uma prévia real da análise fundamentalista da Analiso: 5 pilares, gráficos e leitura guiada. Crie sua conta grátis para analisar qualquer ação da B3.",
  alternates: { canonical: "/analysis" },
  openGraph: { url: "/analysis", type: "website" },
};

/**
 * /analysis (no ticker) — showcase entry that always renders the preview for
 * the default ticker. Authenticated users are redirected by the preview itself
 * to /analysis/{ticker}.
 */
export default function AnalysisPreviewRoute() {
  return <AnalysisPreviewPage ticker={DEFAULT_PREVIEW_TICKER} />;
}

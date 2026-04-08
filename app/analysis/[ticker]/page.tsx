"use client";

import { useParams } from "next/navigation";
import { AnalysisPage } from "@/src/features/analysis/components";
import { AnalysisPreviewPage } from "@/src/features/analysis/components/AnalysisPreviewPage";
import { useAuth } from "@/src/features/auth/AuthContext";

/**
 * /analysis/[ticker]
 *
 * - Authenticated visitors → real, full analysis page
 * - Anonymous visitors     → preview (real data, deeper sections blurred)
 */
export default function AnalysisTickerPage() {
  const params = useParams();
  const ticker = (params?.ticker as string ?? "").toUpperCase();
  const { isAuthenticated, isLoading } = useAuth();

  // Wait for auth restoration before deciding which view to render —
  // otherwise we'd flash the preview to a logged-in user.
  if (isLoading) return null;

  if (!isAuthenticated) {
    return <AnalysisPreviewPage ticker={ticker} />;
  }

  return <AnalysisPage />;
}

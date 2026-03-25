"use client";

import { AnalysisPage } from "@/src/features/analysis/components";
import { ProtectedRoute } from "@/src/components/layout";

export default function AnalysisTickerPage() {
  return (
    <ProtectedRoute>
      <AnalysisPage />
    </ProtectedRoute>
  );
}

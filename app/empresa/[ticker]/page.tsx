"use client";

import { CompanyAnalysis } from "../../../src/components/company-analysis";
import { ProtectedRoute } from "../../../src/components/ProtectedRoute";

export default function EmpresaPage() {
  return (
    <ProtectedRoute>
      <CompanyAnalysis />
    </ProtectedRoute>
  );
}

"use client";

import { CompanyAnalysis } from "../../../src/components/empresa";
import { ProtectedRoute } from "../../../src/components/shared";

export default function EmpresaPage() {
  return (
    <ProtectedRoute>
      <CompanyAnalysis />
    </ProtectedRoute>
  );
}

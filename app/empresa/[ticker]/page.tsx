"use client";

import { CompanyAnalysis } from "../../../src/features/empresa/components";
import { ProtectedRoute } from "@/src/components/layout";

export default function EmpresaPage() {
  return (
    <ProtectedRoute>
      <CompanyAnalysis />
    </ProtectedRoute>
  );
}

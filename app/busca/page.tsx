"use client";

import { ProtectedRoute } from "@/src/components/layout";
import { BuscaPage } from "@/src/features/busca/components";

export default function Busca() {
  return (
    <ProtectedRoute>
      <BuscaPage />
    </ProtectedRoute>
  );
}

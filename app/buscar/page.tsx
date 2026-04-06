"use client";

import { BuscarAcoesPage } from "@/src/features/explore/components/BuscarAcoesPage";
import { ProtectedRoute } from "@/src/components/layout";

export default function Buscar() {
  return (
    <ProtectedRoute>
      <BuscarAcoesPage />
    </ProtectedRoute>
  );
}

"use client";

import { NoticiasPage } from "@/src/features/explore/components/NoticiasPage";
import { ProtectedRoute } from "@/src/components/layout";

export default function Noticias() {
  return (
    <ProtectedRoute>
      <NoticiasPage />
    </ProtectedRoute>
  );
}

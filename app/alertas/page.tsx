"use client";

import { ProtectedRoute } from "@/src/components/layout";
import { AlertsPage } from "@/src/features/alertas/components/AlertsPage";

export default function AlertasPage() {
  return (
    <ProtectedRoute>
      <AlertsPage />
    </ProtectedRoute>
  );
}

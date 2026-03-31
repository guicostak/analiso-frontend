"use client";

import { Dashboard } from "../../src/features/dashboard/components";
import { ProtectedRoute } from "@/src/components/layout";

export default function PainelPage() {
  return (
    <ProtectedRoute>
      <Dashboard />
    </ProtectedRoute>
  );
}

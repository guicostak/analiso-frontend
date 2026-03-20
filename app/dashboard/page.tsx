"use client";

import { Dashboard } from "../../src/components/dashboard";
import { ProtectedRoute } from "../../src/components/shared";

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <Dashboard />
    </ProtectedRoute>
  );
}

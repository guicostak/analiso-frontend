"use client";

import { ComparePage } from "../../src/components/compare-page";
import { ProtectedRoute } from "../../src/components/ProtectedRoute";

export default function Comparar() {
  return (
    <ProtectedRoute>
      <ComparePage />
    </ProtectedRoute>
  );
}

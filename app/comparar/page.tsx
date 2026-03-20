"use client";

import { ComparePage } from "../../src/components/compare";
import { ProtectedRoute } from "../../src/components/shared";

export default function Comparar() {
  return (
    <ProtectedRoute>
      <ComparePage />
    </ProtectedRoute>
  );
}

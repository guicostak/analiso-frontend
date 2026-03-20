"use client";

import { ComparePage } from "../../src/features/compare/components";
import { ProtectedRoute } from "@/src/components/layout";

export default function Comparar() {
  return (
    <ProtectedRoute>
      <ComparePage />
    </ProtectedRoute>
  );
}

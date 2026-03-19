"use client";

import { ExplorePage } from "../../src/components/explore";
import { ProtectedRoute } from "../../src/components/ProtectedRoute";

export default function Explorar() {
  return (
    <ProtectedRoute>
      <ExplorePage />
    </ProtectedRoute>
  );
}

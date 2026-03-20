"use client";

import { ExplorePage } from "../../src/components/explore";
import { ProtectedRoute } from "../../src/components/shared";

export default function Explorar() {
  return (
    <ProtectedRoute>
      <ExplorePage />
    </ProtectedRoute>
  );
}

"use client";

import { ExplorePage } from "../../src/features/explore/components";
import { ProtectedRoute } from "@/src/components/layout";

export default function Explorar() {
  return (
    <ProtectedRoute>
      <ExplorePage />
    </ProtectedRoute>
  );
}

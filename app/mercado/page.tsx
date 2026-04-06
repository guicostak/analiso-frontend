"use client";

import { MarketContextPage } from "@/src/features/explore/components/MarketContextPage";
import { ProtectedRoute } from "@/src/components/layout";

export default function Mercado() {
  return (
    <ProtectedRoute>
      <MarketContextPage />
    </ProtectedRoute>
  );
}

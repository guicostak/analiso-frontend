"use client";

import { WatchlistPage } from "../../src/features/watchlist/components";
import { ProtectedRoute } from "@/src/components/layout";

export default function Favoritas() {
  return (
    <ProtectedRoute>
      <WatchlistPage />
    </ProtectedRoute>
  );
}

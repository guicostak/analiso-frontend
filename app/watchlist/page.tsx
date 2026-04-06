"use client";

import { WatchlistPage } from "../../src/features/watchlist/components";
import { ProtectedRoute } from "@/src/components/layout";

export default function Watchlist() {
  return (
    <ProtectedRoute>
      <WatchlistPage />
    </ProtectedRoute>
  );
}

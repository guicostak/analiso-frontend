"use client";

import { WatchlistPage } from "../../src/components/watchlist";
import { ProtectedRoute } from "../../src/components/ProtectedRoute";

export default function Watchlist() {
  return (
    <ProtectedRoute>
      <WatchlistPage />
    </ProtectedRoute>
  );
}

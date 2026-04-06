"use client";

import { AgendaPage } from "../../src/features/agenda/components";
import { ProtectedRoute } from "@/src/components/layout";

export default function Agenda() {
  return (
    <ProtectedRoute>
      <AgendaPage />
    </ProtectedRoute>
  );
}

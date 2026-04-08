"use client";

import { NotificationsPage } from "@/src/features/notifications/components/NotificationsPage";
import { ProtectedRoute } from "@/src/components/layout";

export default function Notifications() {
  return (
    <ProtectedRoute>
      <NotificationsPage />
    </ProtectedRoute>
  );
}

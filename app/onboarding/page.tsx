"use client";

import { OnboardingPage } from "../../src/features/onboarding/components";
import { ProtectedRoute } from "@/src/components/layout";

export default function Onboarding() {
  return (
    <ProtectedRoute>
      <OnboardingPage />
    </ProtectedRoute>
  );
}

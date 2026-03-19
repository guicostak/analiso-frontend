"use client";

import { OnboardingPage } from "../../src/components/onboarding/onboarding-page";
import { ProtectedRoute } from "../../src/components/ProtectedRoute";

export default function Onboarding() {
  return (
    <ProtectedRoute>
      <OnboardingPage />
    </ProtectedRoute>
  );
}

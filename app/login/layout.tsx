"use client";

import { ForceLightTheme } from "../../src/components/layout/ForceLightTheme";
import { GuestRoute } from "../../src/components/layout/GuestRoute";

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <GuestRoute>
      <ForceLightTheme />
      {children}
    </GuestRoute>
  );
}

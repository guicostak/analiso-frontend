"use client";

import { ForceLightTheme } from "../../src/components/layout/ForceLightTheme";

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <ForceLightTheme />
      {children}
    </>
  );
}

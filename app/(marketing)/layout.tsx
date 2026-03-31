"use client";

import { ForceLightTheme } from "../../src/components/layout/ForceLightTheme";

export default function MarketingLayout({
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

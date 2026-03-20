"use client";

import { ThemeProvider } from "next-themes";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { AuthProvider } from "../src/contexts/AuthContext";
import { GlossaryProvider } from "../src/components/glossary/glossary-context";

const GOOGLE_CLIENT_ID =
  process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ??
  "443722990095-fssh39e39fr204tuphhlbnfu2rde3t7m.apps.googleusercontent.com";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      storageKey="analiso-theme"
    >
      <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
        <AuthProvider>
          <GlossaryProvider>
            {children}
          </GlossaryProvider>
        </AuthProvider>
      </GoogleOAuthProvider>
    </ThemeProvider>
  );
}

"use client";

import { ThemeProvider } from "next-themes";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { AuthProvider } from "../src/features/auth/AuthContext";
import { GlossaryProvider } from "../src/features/glossary/components/glossary-context";
import { ChatbotPanelProvider } from "../src/components/layout/ChatbotContext";
import { SidebarProvider } from "../src/components/layout/SidebarContext";
import { LuizProvider } from "../src/components/layout/LuizContext";
import { SubscriptionProvider } from "../src/features/assinatura/hooks";
import { ChatbotPanel } from "../src/features/chatbot/components";
import { LuizChatPanel } from "../src/features/luiz/components";

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
          <SubscriptionProvider>
            <GlossaryProvider>
              <SidebarProvider>
                <ChatbotPanelProvider>
                  <LuizProvider>
                    {children}
                    {/* Painel legado — mantido para compatibilidade */}
                    <ChatbotPanel />
                    {/* Luiz — assistente principal, sempre montado */}
                    <LuizChatPanel />
                  </LuizProvider>
                </ChatbotPanelProvider>
              </SidebarProvider>
            </GlossaryProvider>
          </SubscriptionProvider>
        </AuthProvider>
      </GoogleOAuthProvider>
    </ThemeProvider>
  );
}

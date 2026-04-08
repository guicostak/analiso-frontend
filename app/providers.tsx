"use client";

import dynamic from "next/dynamic";
import { ThemeProvider } from "next-themes";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { AuthProvider } from "../src/features/auth/AuthContext";
import { GlossaryProvider } from "../src/features/glossary/components/glossary-context";
import { ChatbotPanelProvider } from "../src/components/layout/ChatbotContext";
import { SidebarProvider } from "../src/components/layout/SidebarContext";
import { LuizProvider } from "../src/components/layout/LuizContext";
import { SubscriptionProvider } from "../src/features/assinatura/hooks";
import { Toaster } from "../src/components/ui/sonner";

// Lazy-load chat panels — they are heavy and not needed on initial render
const ChatbotPanel = dynamic(
  () => import("../src/features/chatbot/components").then(m => ({ default: m.ChatbotPanel })),
  { ssr: false }
);
const LuizChatPanel = dynamic(
  () => import("../src/features/luiz/components").then(m => ({ default: m.LuizChatPanel })),
  { ssr: false }
);

const GOOGLE_CLIENT_ID =
  process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ??
  "443722990095-fssh39e39fr204tuphhlbnfu2rde3t7m.apps.googleusercontent.com";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="dark"
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
                    <Toaster position="bottom-right" richColors />
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

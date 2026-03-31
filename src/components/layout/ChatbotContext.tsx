"use client";

/**
 * Context global para controle de abertura/fechamento do painel do Assistente.
 * Fica em components/layout (camada global) para que tanto o Sidebar quanto
 * a feature chatbot possam importar sem violar a regra de dependência unidirecional.
 */

import { createContext, useContext, useState } from "react";

interface ChatbotPanelCtx {
  isOpen: boolean;
  open: () => void;
  close: () => void;
}

const ChatbotPanelContext = createContext<ChatbotPanelCtx | null>(null);

export function ChatbotPanelProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <ChatbotPanelContext.Provider
      value={{ isOpen, open: () => setIsOpen(true), close: () => setIsOpen(false) }}
    >
      {children}
    </ChatbotPanelContext.Provider>
  );
}

export function useChatbotPanel() {
  const ctx = useContext(ChatbotPanelContext);
  if (!ctx) throw new Error("useChatbotPanel must be used within ChatbotPanelProvider");
  return ctx;
}

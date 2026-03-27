"use client";

/**
 * useLuizAssistant
 *
 * Hook central do assistente Luiz:
 * - Estado de mensagens e digitação
 * - Envio/recebimento via luizService (real ou mock)
 * - Execução de comandos da plataforma (navigate)
 * - Saudação automática na primeira abertura
 *
 * isOpen/open/close/toggle vêm do LuizContext (layout layer).
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useLuizContext } from "@/src/components/layout/LuizContext";
import { luizService } from "../services/luiz.service";
import type { LuizHistoryEntry, LuizMessage } from "../interfaces";

// ─── Saudação inicial ──────────────────────────────────────────────────────

const buildGreeting = (): LuizMessage => ({
  id: "luiz-greeting",
  role: "luiz",
  content:
    "Oi! Sou o **Luiz**, seu assistente de análise.\n\nPosso te ajudar a entender indicadores, usar filtros de busca ou tirar dúvidas sobre qualquer empresa. Por onde começamos?",
  timestamp: new Date(),
  suggestions: [
    "Como funciona o P/L?",
    "Filtrar ações com DY acima de 5%",
    "O que é ROE?",
    "Ir para Explorar",
  ],
});

// ─── Hook ──────────────────────────────────────────────────────────────────

export function useLuizAssistant() {
  const { isOpen, open, close, toggle } = useLuizContext();
  const router = useRouter();

  const [messages, setMessages] = useState<LuizMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const hasGreetedRef  = useRef(false);
  const typingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Saudação na primeira abertura ────────────────────────────────────────

  useEffect(() => {
    if (!isOpen || hasGreetedRef.current) return;
    hasGreetedRef.current = true;
    setIsTyping(true);

    typingTimerRef.current = setTimeout(() => {
      setIsTyping(false);
      setMessages([buildGreeting()]);
    }, 900);

    return () => clearTimeout(typingTimerRef.current ?? undefined);
  }, [isOpen]);

  // ── Histórico no formato da API ────────────────────────────────────────

  const buildHistory = useCallback(
    (msgs: LuizMessage[]): LuizHistoryEntry[] =>
      msgs
        .filter((m) => m.id !== "luiz-greeting") // omite saudação automática
        .map((m) => ({
          role: m.role === "user" ? "user" : "assistant",
          content: m.content,
        })),
    [],
  );

  // ── Enviar mensagem ────────────────────────────────────────────────────

  const sendMessage = useCallback(
    async (content: string) => {
      const trimmed = content.trim();
      if (!trimmed) return;

      const userMsg: LuizMessage = {
        id: `u-${Date.now()}`,
        role: "user",
        content: trimmed,
        timestamp: new Date(),
      };

      setMessages((prev) => {
        const next = [...prev, userMsg];
        // inicia digitação após atualização de estado
        return next;
      });
      setIsTyping(true);

      try {
        // Pega histórico atual + mensagem nova para enviar à API
        const history = buildHistory([...messages, userMsg]);
        const response = await luizService.getResponse(trimmed, history);

        setIsTyping(false);
        setMessages((prev) => [
          ...prev,
          {
            id:          `l-${Date.now()}`,
            role:        "luiz",
            content:     response.content,
            timestamp:   new Date(),
            suggestions: response.suggestions,
            command:     response.command,
          },
        ]);

        // Executar comando de navegação se retornado
        if (response.command?.type === "navigate" && response.command.href) {
          // Pequeno delay para o usuário ler a resposta antes de navegar
          setTimeout(() => {
            close();
            router.push(response.command!.href);
          }, 1200);
        }
      } catch {
        setIsTyping(false);
        setMessages((prev) => [
          ...prev,
          {
            id:        `l-err-${Date.now()}`,
            role:      "luiz",
            content:   "Ops, tive um problema ao processar sua mensagem. Tente novamente! 😅",
            timestamp: new Date(),
          },
        ]);
      }
    },
    [messages, buildHistory, close, router],
  );

  // ── Limpar conversa ────────────────────────────────────────────────────

  const clear = useCallback(() => {
    hasGreetedRef.current = false;
    clearTimeout(typingTimerRef.current ?? undefined);
    setMessages([]);
    setIsTyping(false);
  }, []);

  return {
    isOpen,
    open,
    close,
    toggle,
    messages,
    isTyping,
    sendMessage,
    clear,
  };
}

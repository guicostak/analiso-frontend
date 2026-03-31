"use client";

import { ArrowUp, RotateCcw, Sparkles } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useChatbotPanel } from "@/src/components/layout/ChatbotContext";
import {
  Sheet,
  SheetContent,
} from "@/src/components/ui/sheet";
import { useChatbot } from "../hooks/useChatbot";
import { ChatbotMessage, TypingIndicator } from "./ChatbotMessage";

// ─── Sugestões de entrada (empty state) ──────────────────────────────────────

const STARTER_SUGGESTIONS = [
  "O que é P/L e como interpretar?",
  "Como analisar Dividend Yield?",
  "O que é ROIC e por que importa?",
  "Como ler a alavancagem de uma empresa?",
  "O que é margem EBITDA?",
  "Como está a Petrobras hoje?",
];

// ─── Painel principal ─────────────────────────────────────────────────────────

export function ChatbotPanel() {
  const { isOpen, close } = useChatbotPanel();
  const { messages, isTyping, sendMessage, clear } = useChatbot();
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const isEmpty = messages.length === 0;

  // Scroll automático para a última mensagem
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isTyping]);

  // Foca o input ao abrir
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen]);

  function handleSend() {
    if (!input.trim() || isTyping) return;
    sendMessage(input.trim());
    setInput("");
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  function handleSuggestion(text: string) {
    sendMessage(text);
  }

  return (
    <Sheet open={isOpen} onOpenChange={(v) => !v && close()}>
      <SheetContent
        side="right"
        className="flex w-full flex-col gap-0 border-l border-border bg-background p-0 sm:max-w-[440px]"
      >
        {/* ── Header ── */}
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-[10px] bg-[#0E9384]/12">
              <Sparkles className="h-4 w-4 text-[#0E9384]" />
            </div>
            <div>
              <p className="text-[14px] font-semibold text-foreground">Assistente</p>
              <p className="text-[11px] text-muted-foreground">Pergunte sobre ações e métricas</p>
            </div>
          </div>

          {!isEmpty && (
            <button
              onClick={clear}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-hover hover:text-foreground"
              title="Limpar conversa"
            >
              <RotateCcw className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* ── Área de mensagens ── */}
        <div className="flex-1 overflow-y-auto px-4 py-4">
          {isEmpty ? (
            <EmptyState onSuggestion={handleSuggestion} />
          ) : (
            <div className="space-y-4">
              {messages.map((msg) => (
                <ChatbotMessage
                  key={msg.id}
                  message={msg}
                  onSuggestion={handleSuggestion}
                />
              ))}
              {isTyping && <TypingIndicator />}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* ── Aviso ético ── */}
        <div className="border-t border-border bg-muted/40 px-4 py-2">
          <p className="text-center text-[10px] text-muted-foreground/70">
            Sem recomendação de compra ou venda. Apenas contexto e educação financeira.
          </p>
        </div>

        {/* ── Input ── */}
        <div className="border-t border-border p-4">
          <div className="flex items-end gap-2 rounded-[14px] border border-border bg-muted px-4 py-3 transition-colors focus-within:border-[#0E9384]/40 focus-within:bg-background">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Pergunte sobre P/L, DY, margens, empresas..."
              rows={1}
              disabled={isTyping}
              className="max-h-24 flex-1 resize-none border-0 bg-transparent text-[13px] text-foreground outline-none placeholder:text-muted-foreground/60 disabled:opacity-50"
              style={{ scrollbarWidth: "none" }}
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || isTyping}
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#0E9384] text-white shadow-sm transition-all hover:opacity-90 disabled:opacity-30"
            >
              <ArrowUp className="h-3.5 w-3.5" />
            </button>
          </div>
          <p className="mt-2 text-center text-[10px] text-muted-foreground/50">
            Enter para enviar · Shift+Enter para nova linha
          </p>
        </div>
      </SheetContent>
    </Sheet>
  );
}

// ─── Empty state ──────────────────────────────────────────────────────────────

function EmptyState({ onSuggestion }: { onSuggestion: (text: string) => void }) {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-6 py-8">
      {/* Ícone central */}
      <div className="flex h-14 w-14 items-center justify-center rounded-[18px] bg-[#0E9384]/10">
        <Sparkles className="h-6 w-6 text-[#0E9384]" />
      </div>

      {/* Texto de boas-vindas */}
      <div className="space-y-1.5 text-center">
        <p className="text-[15px] font-semibold text-foreground">Entenda ações com clareza</p>
        <p className="max-w-[280px] text-[12px] leading-relaxed text-muted-foreground">
          Pergunte sobre indicadores, métricas ou empresas. Sem jargão desnecessário, sem ruído.
        </p>
      </div>

      {/* Sugestões */}
      <div className="w-full space-y-2">
        <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground/60">
          Por onde começar
        </p>
        <div className="grid grid-cols-1 gap-2">
          {STARTER_SUGGESTIONS.map((s) => (
            <button
              key={s}
              onClick={() => onSuggestion(s)}
              className="flex items-center justify-between rounded-[12px] border border-border bg-card px-4 py-2.5 text-left text-[12px] font-medium text-foreground transition-colors hover:border-[#0E9384]/30 hover:bg-[#0E9384]/4 hover:text-[#0E9384]"
            >
              <span>{s}</span>
              <ArrowUp className="h-3 w-3 rotate-90 opacity-30" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

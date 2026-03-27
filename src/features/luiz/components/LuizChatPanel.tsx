"use client";

/**
 * LuizChatPanel — drawer lateral direito, altura total.
 *
 * Design Workers AI / Claude:
 * - Header limpo com avatar neon + badge online
 * - Faixa neon multicolor abaixo do header
 * - Mensagens bot: sem bolha, avatar neon + texto fluido
 * - Mensagens user: pill gradiente neon à direita
 * - Input moderno com glow neon ao focar
 * - Fundo desfocado leve ao abrir
 */

import { ArrowUp, RotateCcw, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useLuizAssistant } from "../hooks/useLuizAssistant";
import { LuizAvatar } from "./LuizAvatar";
import { LuizBubble } from "./LuizBubble";
import { LuizTyping } from "./LuizTyping";

// ─── Constantes ────────────────────────────────────────────────────────────

const NEON = "linear-gradient(135deg, #EC4899 0%, #A855F7 35%, #6366F1 68%, #06B6D4 100%)";

const INITIAL_SUGGESTIONS = [
  { icon: "📊", text: "O que é P/L?" },
  { icon: "💸", text: "Como calcular o Dividend Yield?" },
  { icon: "🎯", text: "O que é ROE?" },
  { icon: "🔍", text: "Filtrar ações por indicadores" },
];

// ─── Componente ───────────────────────────────────────────────────────────

export function LuizChatPanel() {
  const { isOpen, open, close, messages, isTyping, sendMessage, clear } =
    useLuizAssistant();

  const [input, setInput]     = useState("");
  const [focused, setFocused] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef    = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping, isOpen]);

  useEffect(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = "auto";
    ta.style.height = `${Math.min(ta.scrollHeight, 120)}px`;
  }, [input]);

  const handleSend = () => {
    const trimmed = input.trim();
    if (!trimmed || isTyping) return;
    setInput("");
    sendMessage(trimmed);
  };

  const handleKey = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  // ── FAB mobile ─────────────────────────────────────────────────────────

  if (!isOpen) {
    return (
      <button
        onClick={open}
        aria-label="Falar com Luiz"
        className="fixed bottom-5 right-5 z-50 flex h-14 w-14 items-center justify-center rounded-full transition-transform hover:scale-105 active:scale-95 md:hidden"
        style={{
          background: NEON,
          boxShadow: "0 8px 32px rgba(168,85,247,0.50), 0 2px 8px rgba(236,72,153,0.30)",
        }}
      >
        <LuizAvatar size="md" />
      </button>
    );
  }

  // ── Painel ──────────────────────────────────────────────────────────────

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40"
        style={{
          background: "rgba(10,10,20,0.10)",
          backdropFilter: "blur(1px)",
          WebkitBackdropFilter: "blur(1px)",
        }}
        onClick={close}
        aria-hidden
      />

      {/* Drawer */}
      <div
        className="fixed inset-y-0 right-0 z-50 flex w-full flex-col bg-white md:w-[440px] md:rounded-l-[20px]"
        style={{
          boxShadow: "-12px 0 64px rgba(0,0,0,0.10), -1px 0 0 rgba(0,0,0,0.04)",
          animation: "luizSlideIn 240ms cubic-bezier(0.22,1,0.36,1) both",
        }}
        role="dialog"
        aria-label="Chat com Luiz"
      >

        {/* ── Header ── */}
        <div className="flex shrink-0 items-center gap-3 border-b border-[#F0F0F4] px-5 py-4">
          {/* Avatar neon com glow */}
          <LuizAvatar size="sm" showStatus />

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="text-[15px] font-bold tracking-[-0.02em] text-[#0D0D0D]">
                Luiz
              </span>
              {/* Badge online com dot verde */}
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10.5px] font-semibold text-emerald-700">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                online
              </span>
            </div>
            <p className="mt-0.5 text-[12px] text-[#9898AA]">
              assistente de análise fundamentalista
            </p>
          </div>

          <div className="flex items-center gap-0.5">
            {messages.length > 0 && (
              <button
                onClick={clear}
                title="Nova conversa"
                className="flex h-8 items-center gap-1.5 rounded-lg px-2.5 text-[12px] font-medium text-[#9898AA] transition hover:bg-[#F5F5FA] hover:text-[#444]"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Recomeçar</span>
              </button>
            )}
            <button
              onClick={close}
              title="Fechar"
              className="flex h-8 w-8 items-center justify-center rounded-lg text-[#C0C0CC] transition hover:bg-[#F5F5FA] hover:text-[#444]"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* ── Faixa neon multicolor ── */}
        <div
          className="h-[4px] w-full shrink-0"
          style={{ background: "linear-gradient(90deg, #F43F5E 0%, #EC4899 18%, #A855F7 42%, #6366F1 62%, #06B6D4 82%, #10B981 100%)" }}
        />

        {/* ── Área de mensagens ── */}
        <div className="flex-1 overflow-y-auto scroll-smooth bg-white">
          {messages.length === 0 && !isTyping ? (

            /* ── Empty state ── */
            <div className="flex flex-col px-6 pt-10 pb-6">

              {/* Ícone neon grande com glow */}
              <div className="mb-6 flex justify-center">
                <div
                  className="flex h-[72px] w-[72px] items-center justify-center"
                  style={{
                    borderRadius: 20,
                    background: NEON,
                    boxShadow:
                      "0 0 0 6px rgba(168,85,247,0.10), 0 12px 40px rgba(168,85,247,0.40), 0 4px 16px rgba(236,72,153,0.25)",
                  }}
                >
                  <LuizAvatar size="xl" />
                </div>
              </div>

              <h2 className="text-center text-[22px] font-bold tracking-[-0.03em] text-[#0D0D0D]">
                Olá, eu sou o Luiz
              </h2>
              <p className="mx-auto mt-2 max-w-[280px] text-center text-[13.5px] leading-snug text-[#9090A0]">
                Seu assistente de análise fundamentalista. Como posso ajudar hoje?
              </p>

              {/* Cards de sugestão */}
              <div className="mt-8 flex flex-col gap-2">
                {INITIAL_SUGGESTIONS.map((s) => (
                  <button
                    key={s.text}
                    onClick={() => sendMessage(s.text)}
                    className="group flex items-center gap-3 rounded-[14px] border border-[#EBEBF0] bg-[#FAFAFA] px-4 py-3.5 text-left transition-all hover:border-transparent hover:shadow-[0_0_0_1.5px_rgba(168,85,247,0.35)] active:scale-[0.99]"
                  >
                    <span className="text-[18px] leading-none">{s.icon}</span>
                    <span className="text-[13.5px] font-medium text-[#2A2A3A] group-hover:text-[#6D28D9]">
                      {s.text}
                    </span>
                  </button>
                ))}
              </div>
            </div>

          ) : (

            /* ── Mensagens ── */
            <div className="flex flex-col gap-5 px-5 py-6">
              {messages.map((msg) => (
                <LuizBubble key={msg.id} message={msg} onSuggestion={sendMessage} />
              ))}
              {isTyping && <LuizTyping />}
              <div ref={messagesEndRef} />
            </div>

          )}
        </div>

        {/* ── Input ── */}
        <div className="shrink-0 border-t border-[#F0F0F4] bg-white px-4 pb-6 pt-3">
          <div
            className="flex items-end gap-2 rounded-[16px] border px-4 py-3 transition-all duration-150"
            style={{
              borderColor: focused ? "rgba(168,85,247,0.50)" : "#E5E5EA",
              boxShadow:   focused
                ? "0 0 0 3px rgba(168,85,247,0.10), 0 0 12px rgba(168,85,247,0.08)"
                : "none",
              background: focused ? "#fff" : "#FAFAFA",
            }}
          >
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKey}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              placeholder="Como posso ajudar hoje?"
              rows={1}
              className="flex-1 resize-none bg-transparent text-[14px] leading-relaxed text-[#0D0D0D] outline-none placeholder:text-[#B8B8C4]"
              style={{ maxHeight: 120 }}
              aria-label="Mensagem"
            />

            {/* Botão enviar — neon quando ativo */}
            <button
              onClick={handleSend}
              disabled={!input.trim() || isTyping}
              aria-label="Enviar"
              className="mb-[1px] flex h-8 w-8 shrink-0 items-center justify-center rounded-xl transition-all duration-150"
              style={{
                background: input.trim() && !isTyping ? NEON : "#EBEBF0",
                boxShadow:  input.trim() && !isTyping
                  ? "0 2px 12px rgba(168,85,247,0.45), 0 1px 4px rgba(236,72,153,0.25)"
                  : "none",
                cursor: input.trim() && !isTyping ? "pointer" : "not-allowed",
              }}
            >
              <ArrowUp
                className="h-4 w-4"
                style={{ color: input.trim() && !isTyping ? "#fff" : "#B0B0BE" }}
              />
            </button>
          </div>

          <p className="mt-2 text-center text-[11px] text-[#C4C4CC]">
            Luiz não recomenda compra ou venda de ativos
          </p>
        </div>
      </div>

      <style>{`
        @keyframes luizSlideIn {
          from { transform: translateX(100%); }
          to   { transform: translateX(0); }
        }
      `}</style>
    </>
  );
}

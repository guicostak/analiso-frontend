"use client";

import { ArrowUp, ChevronRight, Mic, Paperclip, PenSquare, Search, X, Zap } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/src/features/auth/AuthContext";
import { useLuizAssistant } from "../hooks/useLuizAssistant";
import { LuizAvatar } from "./LuizAvatar";
import { LuizBubble } from "./LuizBubble";
import { LuizTyping } from "./LuizTyping";

const NEON = "linear-gradient(135deg, #EC4899 0%, #A855F7 35%, #6366F1 68%, #06B6D4 100%)";

const SUGGESTION = "Como calcular o Dividend Yield?";

const MOCK_CHATS = [
  "Novo chat",
  "O que é P/L?",
  "Como calcular o Dividend Yield?",
  "O que é ROE?",
  "Filtrar ações por indicadores",
];

export function LuizChatPanel() {
  const { isOpen, open, close, messages, isTyping, sendMessage, clear } =
    useLuizAssistant();
  const { user } = useAuth();
  const firstName = user?.name?.split(" ")[0] ?? "";

  const [input, setInput]       = useState("");
  const [focused, setFocused]   = useState(false);
  const [activeChat, setActive] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef    = useRef<HTMLTextAreaElement>(null);

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

  const renderInput = () => (
    <>
      <div
        className="rounded-xl border bg-card px-4 pb-3 pt-3 transition-[border-color,box-shadow] duration-150"
        style={{
          borderColor: focused ? "rgba(168,85,247,0.45)" : "var(--border)",
          boxShadow: focused ? "0 0 0 3px rgba(168,85,247,0.08)" : "none",
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
          className="w-full resize-none bg-transparent text-[13px] leading-relaxed text-foreground outline-none placeholder:text-muted-foreground/70"
          style={{ maxHeight: 100 }}
          aria-label="Mensagem"
        />
        <div className="mt-2 flex items-center justify-between">
          <button className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-[12px] font-medium text-foreground transition hover:bg-hover">
            <Paperclip className="h-3.5 w-3.5" />
            Anexar
          </button>
          <div className="flex items-center gap-1.5">
            <button className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition hover:bg-hover">
              <Mic className="h-4 w-4" />
            </button>
            <button
              onClick={handleSend}
              disabled={!input.trim() || isTyping}
              aria-label="Enviar"
              className="flex h-8 w-8 items-center justify-center rounded-lg transition-[background-color] duration-150"
              style={{
                background: input.trim() && !isTyping ? "#2563EB" : "var(--muted)",
                cursor: input.trim() && !isTyping ? "pointer" : "not-allowed",
              }}
            >
              <ArrowUp className="h-4 w-4" style={{ color: input.trim() && !isTyping ? "#fff" : "var(--muted-foreground)" }} />
            </button>
          </div>
        </div>
      </div>
      <button
        onClick={() => sendMessage(SUGGESTION)}
        className="mt-2 flex w-full items-center gap-2 rounded-xl border border-border bg-card px-3.5 py-2.5 text-left text-[12px] text-muted-foreground transition hover:bg-hover"
      >
        <Zap className="h-3.5 w-3.5 shrink-0" />
        <span className="flex-1 truncate">Sugestões: {SUGGESTION}</span>
        <ChevronRight className="h-3.5 w-3.5 shrink-0" />
      </button>
    </>
  );

  /* ── FAB mobile ─────────────────────────────────────────────────────── */
  if (!isOpen) {
    return (
      <button
        onClick={open}
        aria-label="Falar com Luiz"
        className="fixed bottom-5 right-5 z-50 flex h-14 w-14 items-center justify-center rounded-full transition-transform hover:scale-105 active:scale-95 md:hidden"
        style={{ background: NEON, boxShadow: "0 8px 32px rgba(168,85,247,0.50)" }}
      >
        <LuizAvatar size="md" />
      </button>
    );
  }

  /* ── Painel ─────────────────────────────────────────────────────────── */
  return (
    <>
      {/* Backdrop com desfoque */}
      <div
        className="fixed inset-0 z-40"
        style={{ backdropFilter: "blur(4px)", WebkitBackdropFilter: "blur(4px)", background: "rgba(0,0,0,0.15)" }}
        onClick={close}
        aria-hidden
      />

      {/* Container dois painéis */}
      <div
        className="fixed top-3 bottom-3 right-3 z-50 flex gap-1"
        style={{
          width: 760,
          animation: "luizSlideIn 220ms cubic-bezier(0.22,1,0.36,1) both",
        }}
        role="dialog"
        aria-label="Chat com Luiz"
      >

        {/* ══ Coluna esquerda — lista de chats ══════════════════════════ */}
        <div className="flex w-[260px] shrink-0 flex-col overflow-hidden rounded-xl border border-border bg-card" style={{ boxShadow: "-12px 0 48px rgba(0,0,0,0.12)" }}>

          {/* Header chats */}
          <div className="flex items-center justify-between border-b border-border px-4 py-3.5">
            <span className="text-[14px] font-semibold text-foreground">Chats</span>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </div>

          {/* Ações */}
          <div className="border-b border-border px-3 py-2">
            <button
              onClick={() => { clear(); setActive(0); }}
              className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13px] text-foreground transition hover:bg-hover"
            >
              <PenSquare className="h-4 w-4 text-muted-foreground" />
              Novo Chat
            </button>
            <button className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13px] text-foreground transition hover:bg-hover">
              <Search className="h-4 w-4 text-muted-foreground" />
              Buscar por chats
            </button>
          </div>

          {/* Lista */}
          <div className="flex-1 overflow-y-auto px-3 py-3">
            <p className="mb-2 px-2.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Seus chats
            </p>
            <div className="space-y-0.5">
              {MOCK_CHATS.map((chat, i) => (
                <button
                  key={i}
                  onClick={() => { setActive(i); if (i === 0) clear(); }}
                  className={`flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-[13px] transition
                    ${activeChat === i
                      ? "font-semibold text-foreground"
                      : "text-muted-foreground hover:bg-hover hover:text-foreground"
                    }
                  `}
                >
                  {activeChat === i && (
                    <span className="h-4 w-[3px] shrink-0 rounded-full bg-brand" />
                  )}
                  <span className="truncate">{chat}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ══ Coluna direita — chat ════════════════════════════════════ */}
        <div className="flex flex-1 flex-col overflow-hidden rounded-xl border border-border bg-card" style={{ boxShadow: "-12px 0 48px rgba(0,0,0,0.12)" }}>

          {/* Header */}
          <div className="flex shrink-0 items-center justify-between border-b border-border px-4 py-3">
            <div className="flex items-center gap-1.5">
              <span className="text-[15px] font-bold text-foreground">Luiz</span>
              <span
                className="inline-flex items-center rounded-[4px] px-1 py-px text-[9px] font-bold text-white leading-none"
                style={{ background: NEON }}
              >
                IA
              </span>
            </div>
            <button
              onClick={close}
              className="flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground transition hover:bg-hover hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Área de mensagens / empty state */}
          <div className="relative flex-1 overflow-y-auto">
            {/* Gradient aurora — efeito dobra */}
            <div aria-hidden style={{ position: "absolute", left: 0, right: 0, top: 0, height: 56, overflow: "hidden", pointerEvents: "none", zIndex: 1 }}>
              {/* lateral esquerda */}
              <div style={{
                position: "absolute", width: "55%", height: "100%", left: "-10%",
                background: "radial-gradient(ellipse at 30% 0%, rgba(236,72,153,0.50) 0%, rgba(168,85,247,0.35) 50%, transparent 80%)",
                borderRadius: "0 0 60% 0 / 0 0 100% 0",
                filter: "blur(10px)",
                animation: "luizBlobMove1 6s ease-in-out infinite alternate",
              }} />
              {/* lateral direita */}
              <div style={{
                position: "absolute", width: "55%", height: "100%", right: "-10%",
                background: "radial-gradient(ellipse at 70% 0%, rgba(6,182,212,0.45) 0%, rgba(99,102,241,0.32) 50%, transparent 80%)",
                borderRadius: "0 0 0 60% / 0 0 0 100%",
                filter: "blur(10px)",
                animation: "luizBlobMove3 8s ease-in-out infinite alternate",
              }} />
              {/* centro — dobra suave */}
              <div style={{
                position: "absolute", width: "50%", height: "100%", left: "25%",
                background: "radial-gradient(ellipse at 50% 100%, rgba(255,255,255,0.60) 0%, transparent 70%)",
                filter: "blur(6px)",
              }} />
            </div>
            {messages.length === 0 ? (

              /* ── Empty state: greeting centralizado + input logo abaixo ── */
              <div className="flex h-full flex-col items-center justify-center px-8">
                <LuizAvatar size="lg" shape="rounded" />
                <h2 className="mt-4 text-[20px] font-bold tracking-tight text-foreground">
                  Olá{firstName ? `, ${firstName}` : ""}!
                </h2>
                <p className="mt-1 text-[13px] text-muted-foreground">
                  Seja muito bem-vindo(a)!
                </p>
                <div className="mt-6 w-full max-w-md">
                  {renderInput()}
                </div>
              </div>

            ) : (

              /* ── Mensagens ── */
              <div className="flex flex-col gap-4 px-5 py-5">
                {messages.map((msg) => (
                  <LuizBubble key={msg.id} message={msg} onSuggestion={sendMessage} />
                ))}
                {isTyping && <LuizTyping />}
                <div ref={messagesEndRef} />
              </div>

            )}
          </div>

          {/* Input fixo — visível apenas quando há mensagens */}
          {messages.length > 0 && (
            <div className="shrink-0 px-4 pt-3 pb-12">
              {renderInput()}
            </div>
          )}

        </div>

        {/* Disclaimer — fixo no fundo */}
        <div className="absolute bottom-2 left-[260px] right-0 px-4">
          <p className="text-center text-[11px] text-muted-foreground/50">
            Luiz pode cometer erros e não faz recomendação de compra e venda.
          </p>
        </div>
      </div>

      <style>{`
        @keyframes luizSlideIn {
          from { transform: translateX(100%); }
          to   { transform: translateX(0); }
        }
        .luiz-aurora {
          position: absolute;
          inset-x: 0;
          top: 0;
          height: 56px;
          pointer-events: none;
          overflow: hidden;
        }
        .luiz-aurora-left {
          position: absolute;
          width: 55%;
          height: 100%;
          left: -10%;
          background: radial-gradient(ellipse at 30% 0%, rgba(236,72,153,0.45) 0%, rgba(168,85,247,0.30) 50%, transparent 80%);
          border-radius: 0 0 60% 0 / 0 0 100% 0;
          filter: blur(10px);
          animation: luizBlobMove1 6s ease-in-out infinite alternate;
        }
        .luiz-aurora-right {
          position: absolute;
          width: 55%;
          height: 100%;
          right: -10%;
          background: radial-gradient(ellipse at 70% 0%, rgba(6,182,212,0.40) 0%, rgba(99,102,241,0.28) 50%, transparent 80%);
          border-radius: 0 0 0 60% / 0 0 0 100%;
          filter: blur(10px);
          animation: luizBlobMove3 8s ease-in-out infinite alternate;
        }
        .luiz-aurora-center {
          position: absolute;
          width: 50%;
          height: 100%;
          left: 25%;
          background: radial-gradient(ellipse at 50% 100%, rgba(255,255,255,0.55) 0%, transparent 70%);
          filter: blur(6px);
        }
        @keyframes luizBlobMove1 {
          from { transform: translateX(0px) scaleX(1); }
          to   { transform: translateX(18px) scaleX(1.06); }
        }
        @keyframes luizBlobMove3 {
          from { transform: translateX(0px) scaleX(1); }
          to   { transform: translateX(-18px) scaleX(1.06); }
        }
      `}</style>
    </>
  );
}

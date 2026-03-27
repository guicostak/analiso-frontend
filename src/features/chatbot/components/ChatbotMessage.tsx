"use client";

import type { ChatMessage } from "../interfaces";

// ─── Render de bold simples (**texto**) ───────────────────────────────────────

function renderContent(raw: string) {
  return raw.split("\n").map((line, li) => {
    const parts = line.split(/(\*\*[^*]+\*\*)/g);
    return (
      <span key={li} className="block">
        {parts.map((part, pi) =>
          part.startsWith("**") && part.endsWith("**") ? (
            <strong key={pi} className="font-semibold text-foreground">
              {part.slice(2, -2)}
            </strong>
          ) : (
            <span key={pi}>{part}</span>
          ),
        )}
      </span>
    );
  });
}

// ─── Bolha de mensagem ────────────────────────────────────────────────────────

interface Props {
  message: ChatMessage;
  onSuggestion: (text: string) => void;
}

export function ChatbotMessage({ message, onSuggestion }: Props) {
  const isUser = message.role === "user";

  if (isUser) {
    return (
      <div className="flex justify-end">
        <div className="max-w-[80%] rounded-[16px] rounded-tr-[4px] bg-[#0E9384] px-4 py-2.5">
          <p className="text-[13px] leading-[1.55] text-white">{message.content}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-start gap-2.5">
      {/* Avatar Assistente */}
      <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#0E9384]/12 text-[11px] font-bold text-[#0E9384]">
        A
      </div>

      <div className="min-w-0 flex-1 space-y-2">
        {/* Bolha */}
        <div className="rounded-[16px] rounded-tl-[4px] border border-border bg-card px-4 py-3">
          <div className="space-y-0.5 text-[13px] leading-[1.65] text-muted-foreground">
            {renderContent(message.content)}
          </div>
        </div>

        {/* Sugestões de follow-up */}
        {message.suggestions && message.suggestions.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {message.suggestions.map((s) => (
              <button
                key={s}
                onClick={() => onSuggestion(s)}
                className="rounded-full border border-border bg-muted px-3 py-1 text-[11px] font-medium text-muted-foreground transition-colors hover:border-[#0E9384]/30 hover:bg-[#0E9384]/6 hover:text-[#0E9384]"
              >
                {s}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Indicador de digitação ───────────────────────────────────────────────────

export function TypingIndicator() {
  return (
    <div className="flex items-start gap-2.5">
      <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#0E9384]/12 text-[11px] font-bold text-[#0E9384]">
        A
      </div>
      <div className="rounded-[16px] rounded-tl-[4px] border border-border bg-card px-4 py-3">
        <div className="flex items-center gap-1">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground/50"
              style={{ animationDelay: `${i * 0.15}s` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

"use client";

/**
 * LuizBubble — design Workers AI.
 *
 * Usuário → pill gradiente neon à direita
 * Luiz    → avatar neon + texto fluido, sem fundo de bolha
 * Quick replies + chip de navegação
 */

import { ArrowRight } from "lucide-react";
import type { LuizCommand, LuizMessage } from "../interfaces";
import { LuizAvatar } from "./LuizAvatar";

const NEON = "linear-gradient(135deg, #EC4899 0%, #A855F7 35%, #6366F1 68%, #06B6D4 100%)";

// ─── Parser bold + newline ─────────────────────────────────────────────────

function parseContent(content: string): React.ReactElement[] {
  const chunks = content.split(/(\*\*[^*]+\*\*)/g);
  const result: React.ReactElement[] = [];
  chunks.forEach((chunk, ci) => {
    if (chunk.startsWith("**") && chunk.endsWith("**")) {
      result.push(
        <strong key={`b-${ci}`} className="font-semibold text-foreground">
          {chunk.slice(2, -2)}
        </strong>,
      );
    } else {
      chunk.split("\n").forEach((line, li, arr) => {
        result.push(<span key={`t-${ci}-${li}`}>{line}</span>);
        if (li < arr.length - 1) result.push(<br key={`br-${ci}-${li}`} />);
      });
    }
  });
  return result;
}

// ─── Label do chip de ação ──────────────────────────────────────────────────

function getCommandLabel(command: LuizCommand): string {
  switch (command.type) {
    case "navigate": {
      const page = command.href.split("?")[0].replace("/", "") || "início";
      return `Navegando para ${page}…`;
    }
    case "theme":
      return command.href === "dark" ? "Ativando modo escuro…" : "Ativando modo claro…";
    case "glossary":
      return "Abrindo glossário…";
    case "watchlist_add":
      return `Adicionando ${command.href} na watchlist…`;
    case "watchlist_remove":
      return `Removendo ${command.href} da watchlist…`;
    default:
      return "Executando…";
  }
}

// ─── Componente ────────────────────────────────────────────────────────────

interface LuizBubbleProps {
  message: LuizMessage;
  onSuggestion?: (text: string) => void;
}

export function LuizBubble({ message, onSuggestion }: LuizBubbleProps) {
  const isUser = message.role === "user";

  // ── Mensagem do usuário — pill neon ──
  if (isUser) {
    return (
      <div className="flex justify-end">
        <div
          className="max-w-[78%] rounded-2xl rounded-br-[5px] px-4 py-2.5 text-[13.5px] leading-relaxed text-white"
          style={{ background: NEON }}
        >
          {parseContent(message.content)}
        </div>
      </div>
    );
  }

  // ── Mensagem do Luiz — sem bolha ──
  return (
    <div className="flex items-start gap-3">
      <div className="mt-0.5 shrink-0">
        <LuizAvatar size="xs" />
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-2.5">
        {/* Texto limpo, sem fundo */}
        <p className="text-[13.5px] leading-relaxed text-foreground">
          {parseContent(message.content)}
        </p>

        {/* Chip de ação */}
        {message.command && (
          <div className="inline-flex w-fit items-center gap-1.5 rounded-full border border-purple-200 bg-purple-50 px-3 py-1.5 text-[12px] font-medium text-purple-700 dark:border-purple-800 dark:bg-purple-950/40 dark:text-purple-300">
            <ArrowRight className="h-3 w-3" />
            {getCommandLabel(message.command)}
          </div>
        )}

        {/* Quick replies */}
        {message.suggestions && message.suggestions.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {message.suggestions.map((s) => (
              <button
                key={s}
                onClick={() => onSuggestion?.(s)}
                className="rounded-full border border-border bg-card px-3 py-1 text-[12px] font-medium text-muted-foreground shadow-[0_1px_3px_rgba(0,0,0,0.05)] transition hover:border-purple-300 hover:bg-purple-50 hover:text-purple-700 active:scale-95"
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

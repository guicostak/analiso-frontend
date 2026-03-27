"use client";

/**
 * LuizNavbarButton — botão pill neon no navbar.
 * Sempre tem borda e fundo visíveis para deixar claro que é clicável.
 */

import { useLuizContext } from "@/src/components/layout/LuizContext";
import { LuizAvatar } from "./LuizAvatar";
import { Sparkles } from "lucide-react";

const NEON = "linear-gradient(135deg, #EC4899 0%, #A855F7 50%, #6366F1 100%)";

export function LuizNavbarButton() {
  const { isOpen, toggle } = useLuizContext();

  return (
    <button
      onClick={toggle}
      aria-label="Falar com Luiz"
      aria-expanded={isOpen}
      className="hidden md:flex h-8 items-center gap-1.5 rounded-full px-3 text-[12px] font-semibold transition-all duration-150 hover:scale-[1.03] active:scale-[0.97]"
      style={
        isOpen
          ? {
              background: "linear-gradient(135deg, rgba(236,72,153,0.15) 0%, rgba(168,85,247,0.15) 50%, rgba(99,102,241,0.15) 100%)",
              border: "1.5px solid rgba(168,85,247,0.50)",
              color: "#7C3AED",
              boxShadow: "0 0 0 3px rgba(168,85,247,0.10)",
            }
          : {
              background: "linear-gradient(135deg, rgba(236,72,153,0.08) 0%, rgba(168,85,247,0.08) 50%, rgba(99,102,241,0.08) 100%)",
              border: "1.5px solid rgba(168,85,247,0.25)",
              color: "#7C3AED",
            }
      }
    >
      {/* Ícone neon pequeno */}
      <span
        className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full"
        style={{ background: NEON }}
      >
        <Sparkles className="h-3 w-3 text-white" />
      </span>
      <span>Luiz</span>
    </button>
  );
}

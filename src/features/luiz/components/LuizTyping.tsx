"use client";

/**
 * LuizTyping — indicador com dots neon animados.
 */

import { LuizAvatar } from "./LuizAvatar";

export function LuizTyping() {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-0.5 shrink-0">
        <LuizAvatar size="xs" />
      </div>
      <div
        className="inline-flex items-center gap-[5px] rounded-full px-4 py-2.5"
        style={{ background: "#F5F3FF" }}
        aria-label="Luiz está digitando"
      >
        {[0, 150, 300].map((delay) => (
          <span
            key={delay}
            className="h-[7px] w-[7px] rounded-full animate-bounce"
            style={{
              background:
                delay === 0
                  ? "#EC4899"
                  : delay === 150
                  ? "#A855F7"
                  : "#6366F1",
              animationDelay: `${delay}ms`,
              animationDuration: "1s",
            }}
          />
        ))}
      </div>
    </div>
  );
}

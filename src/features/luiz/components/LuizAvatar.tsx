"use client";

/**
 * LuizAvatar — ícone com gradiente neon multicolor.
 * Inspirado no design Workers AI: rosa → violeta → índigo → ciano.
 * showStatus exibe o ponto verde de "online".
 */

import { Sparkles } from "lucide-react";

interface LuizAvatarProps {
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  showStatus?: boolean;
  /** "circle" (padrão) ou "rounded" para bordas arredondadas quadradas */
  shape?: "circle" | "rounded";
  className?: string;
}

const SIZE_PX: Record<NonNullable<LuizAvatarProps["size"]>, number> = {
  xs: 24,
  sm: 32,
  md: 40,
  lg: 48,
  xl: 64,
};

const ICON_PX: Record<NonNullable<LuizAvatarProps["size"]>, number> = {
  xs: 11,
  sm: 14,
  md: 17,
  lg: 20,
  xl: 27,
};

const STATUS_SIZE: Record<NonNullable<LuizAvatarProps["size"]>, string> = {
  xs: "h-2   w-2   ring-[1.5px]",
  sm: "h-2.5 w-2.5 ring-2",
  md: "h-3   w-3   ring-2",
  lg: "h-3.5 w-3.5 ring-2",
  xl: "h-4   w-4   ring-[3px]",
};

// Gradiente neon multicolor — rosa → violeta → índigo → ciano
const NEON_GRADIENT =
  "linear-gradient(135deg, #EC4899 0%, #A855F7 35%, #6366F1 68%, #06B6D4 100%)";

// Glow por tamanho
const GLOW: Record<NonNullable<LuizAvatarProps["size"]>, string> = {
  xs: "0 0 8px rgba(168,85,247,0.45)",
  sm: "0 0 12px rgba(168,85,247,0.45)",
  md: "0 0 16px rgba(168,85,247,0.45)",
  lg: "0 0 20px rgba(168,85,247,0.50)",
  xl: "0 0 28px rgba(168,85,247,0.55), 0 0 56px rgba(99,102,241,0.25)",
};

export function LuizAvatar({
  size = "md",
  showStatus = false,
  shape = "circle",
  className = "",
}: LuizAvatarProps) {
  const px      = SIZE_PX[size];
  const iconPx  = ICON_PX[size];
  const radius  = shape === "rounded" ? Math.round(px * 0.28) : px;

  return (
    <div
      className={`relative shrink-0 ${className}`}
      style={{ width: px, height: px }}
    >
      <div
        className="h-full w-full flex items-center justify-center select-none"
        style={{
          borderRadius: radius,
          background: NEON_GRADIENT,
          boxShadow: GLOW[size],
        }}
        aria-label="Luiz"
      >
        <Sparkles
          style={{ width: iconPx, height: iconPx, color: "white", opacity: 0.95 }}
          strokeWidth={1.75}
        />
      </div>

      {showStatus && (
        <span
          className={`absolute bottom-0 right-0 ${STATUS_SIZE[size]} rounded-full bg-emerald-400 ring-white`}
          aria-label="Online"
        />
      )}
    </div>
  );
}

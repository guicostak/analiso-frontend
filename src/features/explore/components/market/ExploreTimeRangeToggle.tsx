"use client";

/**
 * Pill-group para selecionar o range temporal da aba Contexto.
 *
 * SRP: apenas apresenta os botões e dispara o callback. Zero lógica de fetch.
 */

import type { MarketTimeRange } from "../../interfaces/market.interfaces";

interface Option {
  value: MarketTimeRange;
  label: string;
}

const OPTIONS: Option[] = [
  { value: "1D",  label: "1D"  },
  { value: "1W",  label: "1S"  },
  { value: "1M",  label: "1M"  },
  { value: "YTD", label: "YTD" },
  { value: "1Y",  label: "1A"  },
];

interface ExploreTimeRangeToggleProps {
  value:    MarketTimeRange;
  onChange: (next: MarketTimeRange) => void;
  disabled?: boolean;
}

export function ExploreTimeRangeToggle({ value, onChange, disabled }: ExploreTimeRangeToggleProps) {
  return (
    <div
      role="radiogroup"
      aria-label="Selecionar período"
      className="inline-flex items-center gap-0.5 rounded-full border border-border bg-card p-0.5"
    >
      {OPTIONS.map((opt) => {
        const isActive = opt.value === value;
        return (
          <button
            key={opt.value}
            type="button"
            role="radio"
            aria-checked={isActive}
            onClick={() => !disabled && onChange(opt.value)}
            disabled={disabled}
            className={`
              min-h-[32px] min-w-[44px] rounded-full px-3 text-[12px] font-medium
              transition-all duration-150
              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-0
              disabled:opacity-50 disabled:cursor-not-allowed
              ${isActive
                ? "bg-foreground text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground hover:bg-hover"}
            `}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

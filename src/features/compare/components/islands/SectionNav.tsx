"use client";

import { ChevronUp, ChevronDown } from "lucide-react";

/* ── Types ────────────────────────────────────────────────────────────────── */

export interface CompareSection {
  id: string;
  label: string;
  shortLabel: string;
}

interface SectionNavProps {
  sections: CompareSection[];
  activeSection: string;
  onNavigate: (id: string) => void;
}

/* ── Component ───────────────────────────────────────────────────────────── */

export function SectionNav({ sections, activeSection, onNavigate }: SectionNavProps) {
  const activeIndex = sections.findIndex((s) => s.id === activeSection);

  const goPrev = () => {
    if (activeIndex > 0) onNavigate(sections[activeIndex - 1].id);
  };

  const goNext = () => {
    if (activeIndex < sections.length - 1) onNavigate(sections[activeIndex + 1].id);
  };

  return (
    <nav className="fixed right-6 top-1/2 z-30 hidden -translate-y-1/2 xl:flex">
      <div className="flex flex-col items-center gap-1 rounded-2xl border border-border bg-card/95 px-2 py-3 shadow-[0_12px_28px_rgba(15,23,40,0.08)] backdrop-blur-sm dark:shadow-none">
        {/* Up arrow */}
        <button
          onClick={goPrev}
          disabled={activeIndex <= 0}
          className="flex h-6 w-6 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-30"
        >
          <ChevronUp className="h-3.5 w-3.5" />
        </button>

        {/* Section dots */}
        <div className="flex flex-col items-center gap-1.5 py-1">
          {sections.map((section) => {
            const isActive = section.id === activeSection;
            return (
              <button
                key={section.id}
                onClick={() => onNavigate(section.id)}
                title={section.label}
                className="group relative flex items-center"
              >
                <div
                  className={`h-2 rounded-full transition-all ${
                    isActive
                      ? "w-5 bg-brand"
                      : "w-2 bg-border group-hover:bg-muted-foreground"
                  }`}
                />
                {/* Tooltip on hover */}
                <span className="pointer-events-none absolute right-full mr-3 whitespace-nowrap rounded-lg border border-border bg-card px-2.5 py-1 text-[10px] font-medium text-foreground opacity-0 shadow-sm transition-opacity group-hover:opacity-100">
                  {section.shortLabel}
                </span>
              </button>
            );
          })}
        </div>

        {/* Down arrow */}
        <button
          onClick={goNext}
          disabled={activeIndex >= sections.length - 1}
          className="flex h-6 w-6 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-30"
        >
          <ChevronDown className="h-3.5 w-3.5" />
        </button>

        {/* Current label */}
        <span className="mt-1 max-w-[60px] text-center text-[9px] font-medium leading-tight text-muted-foreground">
          {sections[activeIndex]?.shortLabel ?? ""}
        </span>
      </div>
    </nav>
  );
}

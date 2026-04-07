"use client";

import type { CompareNarrative, CompareNarrativeTone } from "../../interfaces";

interface CompareNarrativeBlockProps {
  narrative: CompareNarrative | null;
  variant?: "hero" | "section";
  align?: "left" | "center";
}

function bulletToneClass(tone: CompareNarrativeTone): string {
  switch (tone) {
    case "positive":
      return "border-success-border bg-success-surface text-success-text";
    case "negative":
      return "border-danger-border bg-danger-surface text-danger-text";
    case "warning":
      return "border-warning-border bg-warning-surface text-warning-text";
    case "neutral":
    default:
      return "border-border bg-muted/40 text-muted-foreground";
  }
}

export function CompareNarrativeBlock({
  narrative,
  variant = "section",
  align = "left",
}: CompareNarrativeBlockProps) {
  if (!narrative || !narrative.headline) return null;

  const isHero = variant === "hero";
  const headlineClass = isHero
    ? "text-[22px] font-semibold tracking-[-0.01em] text-foreground"
    : "text-[18px] font-semibold tracking-[-0.01em] text-foreground";
  const subtitleClass = isHero
    ? "text-[14px] text-muted-foreground mt-1"
    : "text-[13px] text-muted-foreground mt-1";

  const alignClass = align === "center" ? "text-center" : "text-left";
  const containerClass = isHero
    ? `compare-island compare-surface p-6 ${alignClass}`
    : `compare-island compare-surface p-5 ${alignClass}`;

  return (
    <section aria-label="Análise comparativa" className={containerClass}>
      <h3 className={headlineClass}>{narrative.headline}</h3>
      {narrative.subtitle ? <p className={subtitleClass}>{narrative.subtitle}</p> : null}

      {narrative.paragraphs.length > 0 ? (
        <div className="mt-3 space-y-2">
          {narrative.paragraphs.map((paragraph, index) => (
            <p key={index} className="text-[13.5px] leading-6 text-foreground/85">
              {paragraph}
            </p>
          ))}
        </div>
      ) : null}

      {narrative.bullets.length > 0 ? (
        <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
          {narrative.bullets.map((bullet, index) => (
            <div
              key={index}
              className={`rounded-2xl border p-3 ${bulletToneClass(bullet.tone)}`}
            >
              <p className="text-[10px] uppercase font-semibold tracking-wider opacity-80">
                {bullet.label}
              </p>
              <p className="text-[12.5px] leading-5 mt-1">{bullet.text}</p>
            </div>
          ))}
        </div>
      ) : null}
    </section>
  );
}

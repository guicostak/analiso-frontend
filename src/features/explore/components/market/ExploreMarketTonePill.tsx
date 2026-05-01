"use client";

/**
 * Pill do "tom de mercado" exibida no hero do contexto.
 *
 * Render SEMPRE inline (uma linha só) — zero empilhamento vertical, pra não
 * empurrar título/subtítulo ao lado. Os highlights "o que mudou desde ontem"
 * ficam dentro do tooltip do "i" (junto com a tabela explicativa dos tons).
 */

import type { MarketToneHighlights } from "../../interfaces/market.interfaces";
import { InfoTooltip } from "@/src/components/shared/InfoTooltip";

const TONE_ROWS: Array<{
  key: "BULLISH" | "NEUTRAL" | "BEARISH";
  label: string;
  dot: string;
  chip: string;
  desc: string;
  trigger: string;
}> = [
  {
    key: "BULLISH",
    label: "Bullish",
    dot: "bg-success-text",
    chip: "bg-success-surface border-success-border text-success-text",
    desc: "Mercado otimista — dia favorável ao risco.",
    trigger: "Breadth > 60%, volatilidade sob controle e índices-âncora em alta.",
  },
  {
    key: "NEUTRAL",
    label: "Neutral",
    dot: "bg-warning-text",
    chip: "bg-warning-surface border-warning-border text-warning-text",
    desc: "Mercado misto — sem direção clara.",
    trigger: "Breadth entre 40–60% ou sinais conflitantes entre os pilares.",
  },
  {
    key: "BEARISH",
    label: "Bearish",
    dot: "bg-danger-text",
    chip: "bg-danger-surface border-danger-border text-danger-text",
    desc: "Mercado pessimista — aversão a risco.",
    trigger: "Breadth < 40%, volatilidade elevada e/ou índices-âncora em queda.",
  },
];

function ToneInfoTable({ tone }: { tone: MarketToneHighlights }) {
  const activeRow = TONE_ROWS.find((r) => r.key === tone.tone);
  return (
    <div className="flex flex-col gap-2.5">
      <p className="text-[11px] leading-relaxed text-muted-foreground">
        Tom composto do mercado — combina breadth (altas × baixas), volatilidade e tendência dos índices-âncora.
      </p>
      {tone.highlights.length > 0 && (
        <div className="rounded-lg border border-border bg-muted/30 p-2.5">
          <div className="mb-1 flex items-center gap-1.5">
            <span className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
              Hoje
            </span>
            {activeRow && (
              <span
                className={`inline-flex items-center gap-1 rounded-full border px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide ${activeRow.chip}`}
              >
                <span className={`h-1.5 w-1.5 rounded-full ${activeRow.dot}`} />
                {activeRow.label}
              </span>
            )}
          </div>
          <ul className="flex flex-col gap-1 text-[11px] text-foreground">
            {tone.highlights.slice(0, 3).map((h, i) => (
              <li key={i} className="flex items-start gap-1.5">
                <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-muted-foreground/50" />
                <span>{h}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
      <div className="overflow-hidden rounded-lg border border-border">
        <table className="w-full border-collapse text-left text-[11px]">
          <thead className="bg-muted/40 text-muted-foreground">
            <tr>
              <th className="px-2 py-1.5 font-medium">Tom</th>
              <th className="px-2 py-1.5 font-medium">O que significa</th>
              <th className="px-2 py-1.5 font-medium">Gatilho</th>
            </tr>
          </thead>
          <tbody>
            {TONE_ROWS.map((row) => (
              <tr key={row.key} className="border-t border-border align-top">
                <td className="px-2 py-1.5">
                  <span
                    className={`inline-flex items-center gap-1 rounded-full border px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide ${row.chip}`}
                  >
                    <span className={`h-1.5 w-1.5 rounded-full ${row.dot}`} />
                    {row.label}
                  </span>
                </td>
                <td className="px-2 py-1.5 text-foreground">{row.desc}</td>
                <td className="px-2 py-1.5 text-muted-foreground">{row.trigger}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

interface ExploreMarketTonePillProps {
  tone: MarketToneHighlights | null;
}

export function ExploreMarketTonePill({ tone }: ExploreMarketTonePillProps) {
  if (!tone) return null;

  const toneClass =
    tone.tone === "BULLISH"
      ? "bg-success-surface border-success-border text-success-text"
      : tone.tone === "BEARISH"
      ? "bg-danger-surface border-danger-border text-danger-text"
      : "bg-warning-surface border-warning-border text-warning-text";

  const dotClass =
    tone.tone === "BULLISH"
      ? "bg-success-text"
      : tone.tone === "BEARISH"
      ? "bg-danger-text"
      : "bg-warning-text";

  return (
    <div className="inline-flex items-center gap-1.5">
      <span
        className={`inline-flex w-fit items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-medium uppercase tracking-wide ${toneClass}`}
      >
        <span className={`h-1.5 w-1.5 rounded-full ${dotClass} animate-pulse`} />
        {tone.label}
      </span>
      <InfoTooltip
        label="Tom de mercado"
        content={<ToneInfoTable tone={tone} />}
        contentClassName="max-w-[480px] whitespace-normal leading-relaxed p-3 bg-popover text-popover-foreground border border-border shadow-lg"
      />
    </div>
  );
}

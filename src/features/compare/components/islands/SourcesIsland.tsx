"use client";

import { ShieldCheck, AlertCircle, Clock } from "lucide-react";
import type {
  CompareEnrichedCompany,
  CompareQualityTone,
} from "../../interfaces";

/* ── Types ────────────────────────────────────────────────────────────────── */

interface SourcesIslandProps {
  a: CompareEnrichedCompany;
  b: CompareEnrichedCompany;
  qualityTone: CompareQualityTone;
}

/* ── Confidence Badge ─────────────────────────────────────────────────────── */

function ConfidenceBadge({
  confidence,
}: {
  confidence: "Alta" | "Media" | "Baixa";
}) {
  const config = {
    Alta: {
      cls: "border-success-border bg-success-surface text-success-text",
      icon: <ShieldCheck className="h-3.5 w-3.5" />,
    },
    Media: {
      cls: "border-warning-border bg-warning-surface text-warning-text",
      icon: <AlertCircle className="h-3.5 w-3.5" />,
    },
    Baixa: {
      cls: "border-danger-border bg-danger-surface text-danger-text",
      icon: <AlertCircle className="h-3.5 w-3.5" />,
    },
  };

  const { cls, icon } = config[confidence];

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[11px] font-medium ${cls}`}
    >
      {icon}
      Confiança dos dados: {confidence}
    </span>
  );
}

/* ── Company Source Card ──────────────────────────────────────────────────── */

function CompanySourceCard({
  company,
  side,
}: {
  company: CompareEnrichedCompany;
  side: "a" | "b";
}) {
  const borderClass =
    side === "a" ? "border-brand-border" : "border-compare-b-border";
  const accentText = side === "a" ? "text-brand-text" : "text-compare-b-text";
  const sources = ["CVM", "B3", "RI"];

  return (
    <div className={`rounded-2xl border ${borderClass} bg-card p-5 space-y-4`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <span className={`text-sm font-semibold ${accentText}`}>
          {company.ticker}
        </span>
        <ConfidenceBadge confidence={company.confidence} />
      </div>

      {/* Data gaps */}
      {company.gaps.length > 0 && (
        <div className="space-y-2">
          <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
            Lacunas nos dados
          </span>
          <ul className="space-y-1">
            {company.gaps.map((gap, i) => (
              <li
                key={i}
                className="flex items-start gap-2 text-[12px] text-muted-foreground"
              >
                <span className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-warning-text" />
                {gap}
              </li>
            ))}
          </ul>
        </div>
      )}

      {company.gaps.length === 0 && (
        <p className="text-[12px] text-success-text flex items-center gap-1.5">
          <ShieldCheck className="h-3.5 w-3.5" />
          Sem lacunas identificadas
        </p>
      )}

      {/* Last updated */}
      <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
        <Clock className="h-3 w-3" />
        Atualizado em {company.updatedAt}
      </div>

      {/* Sources */}
      <div className="space-y-2">
        <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
          Fontes
        </span>
        <div className="flex flex-wrap gap-1.5">
          {sources.map((src) => (
            <span
              key={src}
              className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-[11px] font-medium text-muted-foreground"
            >
              {src}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── Main Component ───────────────────────────────────────────────────────── */

export function SourcesIsland({ a, b, qualityTone }: SourcesIslandProps) {
  return (
    <div className="compare-island compare-surface p-6 scroll-mt-[160px] space-y-5">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold text-foreground">
          Fontes & Qualidade
        </h3>
        <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5 text-[11px] font-medium text-muted-foreground">
          <span
            className="h-2 w-2 rounded-full"
            style={{ backgroundColor: qualityTone.dot }}
          />
          {qualityTone.label}
        </span>
      </div>

      <div className="compare-side-grid">
        <CompanySourceCard company={a} side="a" />
        <CompanySourceCard company={b} side="b" />
      </div>
    </div>
  );
}

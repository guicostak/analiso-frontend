"use client";

import { FileText } from "lucide-react";
import Link from "next/link";
import type { HighlightItem, HighlightPreset } from "../../types/explore";

const severityStyles: Record<HighlightItem["severity"], string> = {
  Leve:     "bg-muted text-foreground/80 border-border",
  Moderada: "bg-amber-50 text-amber-700 border-amber-100",
  Forte:    "bg-rose-50 text-rose-700 border-rose-100",
};

const priorityLabelMap: Record<HighlightItem["severity"], string> = {
  Leve:     "Prioridade baixa",
  Moderada: "Prioridade média",
  Forte:    "Prioridade alta",
};

type SummaryScope = "Mercado" | "Setor" | "Minha watchlist";
type SummaryState = "loading" | "error" | "empty" | "ready";

interface ExploreHighlightsSectionProps {
  summaryScope: SummaryScope;
  summaryState: SummaryState;
  hasSectorSelected: boolean;
  hasWatchlist: boolean;
  sortedHighlights: HighlightItem[];
  highlights: HighlightItem[];
  showAllHighlights: boolean;
  getCompanyLogo: (ticker: string) => string | undefined;
  setSummaryScope: (scope: SummaryScope) => void;
  setSummaryState: (state: SummaryState) => void;
  setSelectedSource: (item: HighlightItem | null) => void;
  setShowAllHighlights: (fn: ((prev: boolean) => boolean) | boolean) => void;
  applyHighlightPreset: (preset: HighlightPreset) => void;
}

export function ExploreHighlightsSection({
  summaryScope,
  summaryState,
  hasSectorSelected,
  hasWatchlist,
  sortedHighlights,
  highlights,
  showAllHighlights,
  getCompanyLogo,
  setSummaryScope,
  setSummaryState,
  setSelectedSource,
  setShowAllHighlights,
  applyHighlightPreset,
}: ExploreHighlightsSectionProps) {
  return (
    <section className="bg-card rounded-2xl border border-border p-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h3 className="text-base font-semibold text-foreground">O que vale ver hoje</h3>
          <p className="text-xs text-muted-foreground">Curadoria com contexto para priorizar empresas que merecem análise hoje.</p>
          <p className="mt-1 text-xs text-foreground/80">Eixo principal do dia: o que mudou, por que importa e qual pilar merece atenção primeiro.</p>
        </div>

        <div className="rounded-xl border border-border bg-background px-3 py-2">
          <p className="mb-1 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">Lente da curadoria</p>
          <p className="mb-2 text-[11px] text-muted-foreground">
            {summaryScope === "Setor" ? "Mostra destaques do setor selecionado." : "Mostra os destaques mais relevantes do mercado."}
          </p>
          <div className="flex items-center gap-1.5">
            {[
              { label: "Mercado", enabled: true },
              { label: "Setor", enabled: hasSectorSelected, tooltip: "Selecione um setor para ativar." },
              { label: "Minha watchlist", enabled: hasWatchlist, tooltip: "Adicione empresas à watchlist para ativar." },
            ]
              .filter((option) => option.label !== "Minha watchlist" || hasWatchlist)
              .map((option) => (
                <button
                  key={option.label}
                  onClick={() => option.enabled && setSummaryScope(option.label as SummaryScope)}
                  title={!option.enabled ? option.tooltip : undefined}
                  className={`px-2.5 py-1 rounded-full text-[11px] font-medium border transition-colors ${
                    summaryScope === option.label
                      ? "border-[#0E9384] bg-[#E7F6F3] text-[#0E9384]"
                      : option.enabled
                      ? "border-border text-foreground/80 hover:border-[#D0D5DD]"
                      : "border-border text-muted-foreground/60 cursor-not-allowed"
                  }`}
                >
                  {option.label}
                </button>
              ))}
          </div>
        </div>
      </div>

      <div className="mt-4 flex flex-col gap-3">
        {summaryState === "loading" && (
          <div className="space-y-3">
            <div className="h-4 w-40 bg-muted rounded" />
            {[1, 2, 3].map((item) => (
              <div key={item} className="h-16 rounded-2xl bg-muted" />
            ))}
          </div>
        )}

        {summaryState === "error" && (
          <div className="rounded-2xl border border-border bg-background p-4 text-sm text-foreground/80">
            <p>Não foi possível carregar os destaques agora. Tente novamente.</p>
            <button
              onClick={() => setSummaryState("ready")}
              className="mt-3 inline-flex items-center gap-2 text-xs font-medium text-[#0E9384] focus:outline-none focus:ring-2 focus:ring-[#0E9384]/30"
            >
              Tentar novamente
            </button>
          </div>
        )}

        {summaryState === "empty" && (
          <div className="rounded-2xl border border-border bg-background p-4 text-sm text-foreground/80">
            <p>Ainda não temos destaques para exibir hoje.</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <button className="px-3 py-2 rounded-xl border border-border text-xs text-foreground/80 hover:border-[#D0D5DD] focus:outline-none focus:ring-2 focus:ring-[#0E9384]/30">
                Explorar por tese
              </button>
              <button className="px-3 py-2 rounded-xl bg-[#0E9384] text-white text-xs hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-[#0E9384]/30">
                Ver empresas para analisar
              </button>
            </div>
          </div>
        )}

        {summaryState === "ready" && (
          <>
            <div className="space-y-3">
              {sortedHighlights.map((item, index) => (
                <div
                  key={item.id}
                  className={`flex flex-col gap-4 rounded-2xl border border-border p-4 md:flex-row md:items-center md:justify-between ${
                    !showAllHighlights && index >= 3 ? "hidden" : ""
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {getCompanyLogo(item.ticker) && (
                      <img
                        src={getCompanyLogo(item.ticker)}
                        alt={`Logo ${item.ticker}`}
                        className="h-9 w-9 rounded-full border border-border object-cover bg-card self-center"
                      />
                    )}
                    <div className="flex flex-col gap-1">
                      <span className={`inline-flex w-fit items-center rounded-full border px-2 py-0.5 text-[11px] font-medium ${severityStyles[item.severity]}`}>
                        {priorityLabelMap[item.severity]}
                      </span>
                      <p className="text-sm font-semibold text-foreground">
                        {item.companyName} ({item.ticker})
                      </p>
                      <p className="text-xs text-muted-foreground">Entrou hoje porque: {item.changeTitle}</p>
                      <p className="text-xs text-foreground/80">Ganho ao abrir agora: {item.whyItMatters}</p>
                      <p className="text-xs text-muted-foreground">
                        Impacta: {item.pillar} . {item.timeframeLabel}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col items-start gap-2 md:items-end">
                    <Link
                      href={`/empresa/${item.ticker}`}
                      className="px-3 py-2 rounded-xl bg-[#0E9384] text-white text-xs font-medium hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-[#0E9384]/30"
                    >
                      Abrir análise
                    </Link>

                    <button
                      onClick={() => setSelectedSource(item)}
                      className="inline-flex items-center gap-1 text-[11px] text-muted-foreground/60 hover:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[#0E9384]/20"
                    >
                      <FileText className="h-3 w-3" />
                      Ver fonte
                    </button>

                    <button onClick={() => applyHighlightPreset(item.filterPreset)} className="text-xs text-foreground/80 hover:text-foreground">
                      Ver empresas relacionadas
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {highlights.length > 3 && (
              <button onClick={() => setShowAllHighlights((prev) => !prev)} className="self-start text-xs text-foreground/80 hover:text-foreground">
                {showAllHighlights ? "Ver menos" : "Ver mais"}
              </button>
            )}
          </>
        )}
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground">
        <span>Última atualização: 05/02</span>
        <span>.</span>
        <span>Fontes: CVM, B3, RI</span>
      </div>
      <p className="mt-3 text-[11px] text-muted-foreground">Isto é um resumo educacional. Não é recomendação de compra ou venda.</p>
    </section>
  );
}

"use client";

/**
 * BuscaFiltersPanel
 *
 * Painel lateral de filtros avançados por métricas fundamentalistas.
 * Cada métrica tem campos min/max com labels explicativos.
 *
 * Segue design_skill.md: espaçamento 4px, tokens semânticos, acessibilidade.
 * Segue responsive_skill.md: no mobile fica acima dos resultados, no lg+ fica lateral.
 */

import { useCallback, useState } from "react";
import { ChevronDown, RotateCcw, SlidersHorizontal } from "lucide-react";
import type { CompanySearchFilters } from "@/src/features/explore/services/search.service";

// ─── Definição das métricas ──────────────────────────────────────────────────

interface MetricDef {
  label: string;
  tooltip: string;
  minKey: keyof CompanySearchFilters;
  maxKey?: keyof CompanySearchFilters;
  unit?: string;
}

const METRIC_GROUPS: { title: string; metrics: MetricDef[] }[] = [
  {
    title: "Valuation",
    metrics: [
      { label: "P/L", tooltip: "Preço / Lucro", minKey: "plMin", maxKey: "plMax", unit: "x" },
      { label: "P/VP", tooltip: "Preço / Valor Patrimonial", minKey: "pvpMin", maxKey: "pvpMax", unit: "x" },
      { label: "EV/EBITDA", tooltip: "Enterprise Value / EBITDA", minKey: "evEbitdaMax", unit: "x" },
    ],
  },
  {
    title: "Rentabilidade",
    metrics: [
      { label: "ROE", tooltip: "Retorno sobre Patrimônio Líquido", minKey: "roeMin", maxKey: "roeMax", unit: "%" },
      { label: "ROIC", tooltip: "Retorno sobre Capital Investido", minKey: "roicMin", unit: "%" },
      { label: "Margem Líquida", tooltip: "Margem Líquida", minKey: "margemMin", unit: "%" },
    ],
  },
  {
    title: "Dividendos",
    metrics: [
      { label: "Dividend Yield", tooltip: "Rendimento de dividendos", minKey: "dyMin", maxKey: "dyMax", unit: "%" },
    ],
  },
  {
    title: "Endividamento",
    metrics: [
      { label: "Dívida / EBITDA", tooltip: "Dívida Líquida / EBITDA", minKey: "dividaEbitdaMax", unit: "x" },
    ],
  },
];

// ─── Props ───────────────────────────────────────────────────────────────────

interface BuscaFiltersPanelProps {
  filters: CompanySearchFilters;
  isLoading: boolean;
  onUpdateFilters: (partial: Partial<CompanySearchFilters>) => void;
  onClearFilters: () => void;
}

// ─── Componente ──────────────────────────────────────────────────────────────

export function BuscaFiltersPanel({
  filters,
  isLoading,
  onUpdateFilters,
  onClearFilters,
}: BuscaFiltersPanelProps) {
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    for (const group of METRIC_GROUPS) initial[group.title] = true;
    return initial;
  });

  // No mobile, painel pode ser recolhido
  const [isOpen, setIsOpen] = useState(true);

  const toggleGroup = useCallback((title: string) => {
    setExpandedGroups((prev) => ({ ...prev, [title]: !prev[title] }));
  }, []);

  const handleInputChange = useCallback(
    (key: keyof CompanySearchFilters, rawValue: string) => {
      const value = rawValue === "" ? undefined : Number(rawValue);
      onUpdateFilters({ [key]: value });
    },
    [onUpdateFilters],
  );

  const getFilterValue = (key: keyof CompanySearchFilters): string => {
    const v = filters[key];
    return v != null ? String(v) : "";
  };

  const activeCount = Object.entries(filters).filter(
    ([key, val]) => val != null && val !== "" && key !== "page" && key !== "size" && key !== "sortBy" && key !== "sortOrder" && key !== "query",
  ).length;

  return (
    <div className="rounded-xl border border-border bg-card">
      {/* Header */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex w-full items-center justify-between px-4 py-3 lg:cursor-default"
      >
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="h-4 w-4 text-muted-foreground" />
          <span className="text-[13px] font-semibold text-foreground">Filtros</span>
          {activeCount > 0 && (
            <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-brand px-1.5 text-[10px] font-bold text-white">
              {activeCount}
            </span>
          )}
        </div>
        <ChevronDown
          className={`h-4 w-4 text-muted-foreground transition-transform lg:hidden ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {/* Conteúdo dos filtros */}
      <div className={`${isOpen ? "block" : "hidden"} lg:block`}>
        <div className="border-t border-border px-4 pb-4 pt-3">
          {/* Setor */}
          <div className="mb-4">
            <label className="mb-1.5 block text-[11px] font-medium uppercase tracking-[0.06em] text-muted-foreground">
              Setor
            </label>
            <input
              type="text"
              placeholder="Ex: Financeiro"
              value={filters.sector ?? ""}
              onChange={(e) => onUpdateFilters({ sector: e.target.value || undefined })}
              className="h-9 w-full rounded-lg border border-border bg-background px-3 text-[12px] text-foreground placeholder:text-muted-foreground focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
            />
          </div>

          {/* Grupos de métricas */}
          {METRIC_GROUPS.map((group) => (
            <div key={group.title} className="mb-3">
              <button
                type="button"
                onClick={() => toggleGroup(group.title)}
                className="mb-2 flex w-full items-center justify-between"
              >
                <span className="text-[11px] font-medium uppercase tracking-[0.06em] text-muted-foreground">
                  {group.title}
                </span>
                <ChevronDown
                  className={`h-3.5 w-3.5 text-muted-foreground transition-transform ${
                    expandedGroups[group.title] ? "rotate-180" : ""
                  }`}
                />
              </button>

              {expandedGroups[group.title] && (
                <div className="space-y-3">
                  {group.metrics.map((metric) => (
                    <MetricInput
                      key={metric.label}
                      metric={metric}
                      minValue={metric.minKey ? getFilterValue(metric.minKey) : ""}
                      maxValue={metric.maxKey ? getFilterValue(metric.maxKey) : ""}
                      onMinChange={(v) => handleInputChange(metric.minKey, v)}
                      onMaxChange={metric.maxKey ? (v) => handleInputChange(metric.maxKey!, v) : undefined}
                      disabled={isLoading}
                    />
                  ))}
                </div>
              )}
            </div>
          ))}

          {/* Botão limpar */}
          <button
            type="button"
            onClick={onClearFilters}
            disabled={isLoading || activeCount === 0}
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg border border-border bg-background px-4 py-2 text-[12px] font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:cursor-not-allowed disabled:opacity-50"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Limpar filtros
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Componente de input de métrica ──────────────────────────────────────────

function MetricInput({
  metric,
  minValue,
  maxValue,
  onMinChange,
  onMaxChange,
  disabled,
}: {
  metric: MetricDef;
  minValue: string;
  maxValue: string;
  onMinChange: (v: string) => void;
  onMaxChange?: (v: string) => void;
  disabled: boolean;
}) {
  const hasMaxField = !!onMaxChange;

  return (
    <div>
      <div className="mb-1 flex items-baseline gap-1.5">
        <span className="text-[12px] font-medium text-foreground">{metric.label}</span>
        {metric.unit && (
          <span className="text-[10px] text-muted-foreground">({metric.unit})</span>
        )}
      </div>

      {hasMaxField ? (
        <div className="flex items-center gap-2">
          <input
            type="number"
            placeholder="Mín"
            value={minValue}
            onChange={(e) => onMinChange(e.target.value)}
            disabled={disabled}
            className="h-8 w-full rounded-md border border-border bg-background px-2.5 text-[12px] text-foreground placeholder:text-muted-foreground focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand disabled:opacity-50"
            aria-label={`${metric.label} mínimo`}
          />
          <span className="text-[11px] text-muted-foreground">a</span>
          <input
            type="number"
            placeholder="Máx"
            value={maxValue}
            onChange={(e) => onMaxChange(e.target.value)}
            disabled={disabled}
            className="h-8 w-full rounded-md border border-border bg-background px-2.5 text-[12px] text-foreground placeholder:text-muted-foreground focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand disabled:opacity-50"
            aria-label={`${metric.label} máximo`}
          />
        </div>
      ) : (
        <input
          type="number"
          placeholder={metric.minKey.includes("Max") ? "Máx" : "Mín"}
          value={minValue}
          onChange={(e) => onMinChange(e.target.value)}
          disabled={disabled}
          className="h-8 w-full rounded-md border border-border bg-background px-2.5 text-[12px] text-foreground placeholder:text-muted-foreground focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand disabled:opacity-50"
          aria-label={`${metric.label} ${metric.minKey.includes("Max") ? "máximo" : "mínimo"}`}
        />
      )}
    </div>
  );
}

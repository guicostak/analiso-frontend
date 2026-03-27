"use client";

import { ChevronDown, ChevronUp, RotateCcw, Search, SlidersHorizontal, X } from "lucide-react";
import { useState } from "react";
import type { AdvancedSearchFilters } from "../interfaces";

interface MetricFilterConfig {
  key: string;
  label: string;
  minKey: keyof AdvancedSearchFilters;
  maxKey: keyof AdvancedSearchFilters;
  unit: string;
  step: number;
  placeholder: { min: string; max: string };
  description: string;
}

const METRIC_GROUPS: { title: string; metrics: MetricFilterConfig[] }[] = [
  {
    title: "Valuation",
    metrics: [
      {
        key: "pl",
        label: "P/L",
        minKey: "plMin",
        maxKey: "plMax",
        unit: "x",
        step: 0.5,
        placeholder: { min: "Ex: 5", max: "Ex: 20" },
        description: "Preço / Lucro",
      },
      {
        key: "pvp",
        label: "P/VP",
        minKey: "pvpMin",
        maxKey: "pvpMax",
        unit: "x",
        step: 0.1,
        placeholder: { min: "Ex: 0.5", max: "Ex: 3" },
        description: "Preço / Valor Patrimonial",
      },
      {
        key: "evEbitda",
        label: "EV/EBITDA",
        minKey: "evEbitdaMin",
        maxKey: "evEbitdaMax",
        unit: "x",
        step: 0.5,
        placeholder: { min: "Ex: 4", max: "Ex: 15" },
        description: "Enterprise Value / EBITDA",
      },
      {
        key: "lpa",
        label: "LPA",
        minKey: "lpaMin",
        maxKey: "lpaMax",
        unit: "R$",
        step: 0.1,
        placeholder: { min: "Ex: 0", max: "Ex: 10" },
        description: "Lucro por Ação",
      },
    ],
  },
  {
    title: "Rentabilidade",
    metrics: [
      {
        key: "dividendYield",
        label: "Dividend Yield",
        minKey: "dividendYieldMin",
        maxKey: "dividendYieldMax",
        unit: "%",
        step: 0.5,
        placeholder: { min: "Ex: 3", max: "Ex: 12" },
        description: "Rendimento de dividendos",
      },
      {
        key: "roe",
        label: "ROE",
        minKey: "roeMin",
        maxKey: "roeMax",
        unit: "%",
        step: 1,
        placeholder: { min: "Ex: 10", max: "Ex: 30" },
        description: "Retorno sobre Patrimônio",
      },
      {
        key: "roic",
        label: "ROIC",
        minKey: "roicMin",
        maxKey: "roicMax",
        unit: "%",
        step: 1,
        placeholder: { min: "Ex: 8", max: "Ex: 25" },
        description: "Retorno sobre Capital Investido",
      },
    ],
  },
  {
    title: "Margens",
    metrics: [
      {
        key: "margemLiquida",
        label: "Margem Líquida",
        minKey: "margemLiquidaMin",
        maxKey: "margemLiquidaMax",
        unit: "%",
        step: 1,
        placeholder: { min: "Ex: 5", max: "Ex: 30" },
        description: "Lucro líquido / Receita",
      },
      {
        key: "margemEbitda",
        label: "Margem EBITDA",
        minKey: "margemEbitdaMin",
        maxKey: "margemEbitdaMax",
        unit: "%",
        step: 1,
        placeholder: { min: "Ex: 10", max: "Ex: 40" },
        description: "EBITDA / Receita",
      },
    ],
  },
  {
    title: "Endividamento",
    metrics: [
      {
        key: "dividaLiquidaEbitda",
        label: "Dív. Líq. / EBITDA",
        minKey: "dividaLiquidaEbitdaMin",
        maxKey: "dividaLiquidaEbitdaMax",
        unit: "x",
        step: 0.5,
        placeholder: { min: "Ex: 0", max: "Ex: 3" },
        description: "Dívida Líquida / EBITDA",
      },
    ],
  },
];

interface ExploreAdvancedSearchProps {
  advancedSearchFilters: AdvancedSearchFilters;
  setAdvancedSearchFilters: (
    fn: ((prev: AdvancedSearchFilters) => AdvancedSearchFilters) | AdvancedSearchFilters,
  ) => void;
  resetAdvancedSearch: () => void;
  activeFilterCount: number;
}

export function ExploreAdvancedSearch({
  advancedSearchFilters,
  setAdvancedSearchFilters,
  resetAdvancedSearch,
  activeFilterCount,
}: ExploreAdvancedSearchProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState<string[]>(["Valuation"]);

  const toggleGroup = (title: string) => {
    setExpandedGroups((prev) =>
      prev.includes(title) ? prev.filter((g) => g !== title) : [...prev, title],
    );
  };

  const handleInputChange = (key: keyof AdvancedSearchFilters, rawValue: string) => {
    const value = rawValue === "" ? null : parseFloat(rawValue);
    if (rawValue !== "" && isNaN(value as number)) return;
    setAdvancedSearchFilters((prev) => ({ ...prev, [key]: value }));
  };

  const clearMetric = (minKey: keyof AdvancedSearchFilters, maxKey: keyof AdvancedSearchFilters) => {
    setAdvancedSearchFilters((prev) => ({ ...prev, [minKey]: null, [maxKey]: null }));
  };

  const hasActiveFilter = (minKey: keyof AdvancedSearchFilters, maxKey: keyof AdvancedSearchFilters) => {
    return advancedSearchFilters[minKey] !== null || advancedSearchFilters[maxKey] !== null;
  };

  return (
    <div className="rounded-[22px] border border-[#E7EEF5] bg-white shadow-[0_18px_40px_rgba(15,23,40,0.04)]">
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex w-full items-center justify-between px-5 py-4 transition hover:bg-[#FAFCFE]"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-[12px] bg-[#EEF6FF]">
            <SlidersHorizontal className="h-4 w-4 text-[#3965B8]" />
          </div>
          <div className="text-left">
            <p className="text-[14px] font-semibold text-[#0F1728]">Pesquisa avançada por métricas</p>
            <p className="text-[12px] text-[#667085]">
              Filtre por P/L, Dividend Yield, ROE, margens e mais
            </p>
          </div>
          {activeFilterCount > 0 && (
            <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-[#0E9384] px-1.5 text-[11px] font-semibold text-white">
              {activeFilterCount}
            </span>
          )}
        </div>
        {isOpen ? (
          <ChevronUp className="h-5 w-5 text-[#98A2B3]" />
        ) : (
          <ChevronDown className="h-5 w-5 text-[#98A2B3]" />
        )}
      </button>

      {isOpen && (
        <div className="border-t border-[#EEF3F7] px-5 pb-5 pt-4">
          {activeFilterCount > 0 && (
            <div className="mb-4 flex flex-wrap items-center gap-2">
              <span className="text-[12px] font-medium text-[#98A2B3]">Filtros ativos:</span>
              {METRIC_GROUPS.flatMap((group) =>
                group.metrics
                  .filter((m) => hasActiveFilter(m.minKey, m.maxKey))
                  .map((m) => {
                    const min = advancedSearchFilters[m.minKey];
                    const max = advancedSearchFilters[m.maxKey];
                    const rangeLabel =
                      min !== null && max !== null
                        ? `${min}${m.unit} – ${max}${m.unit}`
                        : min !== null
                        ? `≥ ${min}${m.unit}`
                        : `≤ ${max}${m.unit}`;
                    return (
                      <span
                        key={m.key}
                        className="inline-flex items-center gap-1.5 rounded-full border border-[#D9E8FF] bg-[#EEF6FF] px-3 py-1.5 text-[11px] font-medium text-[#3965B8]"
                      >
                        {m.label}: {rangeLabel}
                        <button
                          onClick={() => clearMetric(m.minKey, m.maxKey)}
                          className="text-[#667085] transition hover:text-[#0F1728]"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    );
                  }),
              )}
              <button
                onClick={resetAdvancedSearch}
                className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-[#0E9384] transition hover:text-[#0F1728]"
              >
                <RotateCcw className="h-3 w-3" />
                Limpar todos
              </button>
            </div>
          )}

          <div className="space-y-3">
            {METRIC_GROUPS.map((group) => {
              const isExpanded = expandedGroups.includes(group.title);
              const groupActiveCount = group.metrics.filter((m) =>
                hasActiveFilter(m.minKey, m.maxKey),
              ).length;

              return (
                <div
                  key={group.title}
                  className="rounded-[16px] border border-[#EFF3F8] bg-[#FAFCFE]"
                >
                  <button
                    onClick={() => toggleGroup(group.title)}
                    className="flex w-full items-center justify-between px-4 py-3"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-[13px] font-semibold text-[#0F1728]">{group.title}</span>
                      {groupActiveCount > 0 && (
                        <span className="inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-[#0E9384] px-1 text-[10px] font-semibold text-white">
                          {groupActiveCount}
                        </span>
                      )}
                    </div>
                    {isExpanded ? (
                      <ChevronUp className="h-4 w-4 text-[#98A2B3]" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-[#98A2B3]" />
                    )}
                  </button>

                  {isExpanded && (
                    <div className="border-t border-[#EFF3F8] px-4 pb-4 pt-3">
                      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        {group.metrics.map((metric) => (
                          <div key={metric.key} className="space-y-2">
                            <div className="flex items-center justify-between">
                              <div>
                                <span className="text-[12px] font-semibold text-[#0F1728]">
                                  {metric.label}
                                </span>
                                <span className="ml-1.5 text-[11px] text-[#98A2B3]">
                                  ({metric.description})
                                </span>
                              </div>
                              {hasActiveFilter(metric.minKey, metric.maxKey) && (
                                <button
                                  onClick={() => clearMetric(metric.minKey, metric.maxKey)}
                                  className="text-[11px] font-medium text-[#667085] transition hover:text-[#0F1728]"
                                >
                                  Limpar
                                </button>
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="relative flex-1">
                                <input
                                  type="number"
                                  step={metric.step}
                                  value={advancedSearchFilters[metric.minKey] ?? ""}
                                  onChange={(e) => handleInputChange(metric.minKey, e.target.value)}
                                  placeholder={metric.placeholder.min}
                                  className="h-9 w-full rounded-[10px] border border-[#EFF3F8] bg-white px-3 text-[12px] text-[#0F1728] outline-none transition placeholder:text-[#C0C8D4] focus:border-[#D9E8FF] focus:ring-1 focus:ring-[#D9E8FF]"
                                />
                                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[11px] text-[#98A2B3]">
                                  {metric.unit}
                                </span>
                              </div>
                              <span className="text-[11px] font-medium text-[#98A2B3]">até</span>
                              <div className="relative flex-1">
                                <input
                                  type="number"
                                  step={metric.step}
                                  value={advancedSearchFilters[metric.maxKey] ?? ""}
                                  onChange={(e) => handleInputChange(metric.maxKey, e.target.value)}
                                  placeholder={metric.placeholder.max}
                                  className="h-9 w-full rounded-[10px] border border-[#EFF3F8] bg-white px-3 text-[12px] text-[#0F1728] outline-none transition placeholder:text-[#C0C8D4] focus:border-[#D9E8FF] focus:ring-1 focus:ring-[#D9E8FF]"
                                />
                                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[11px] text-[#98A2B3]">
                                  {metric.unit}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="mt-4 flex items-center justify-between border-t border-[#EEF3F7] pt-4">
            <p className="text-[11px] text-[#98A2B3]">
              Empresas sem dados em uma métrica filtrada serão omitidas do resultado.
            </p>
            <button
              onClick={() => setIsOpen(false)}
              className="inline-flex h-9 items-center rounded-[12px] bg-[#0E9384] px-4 text-[13px] font-semibold text-white transition hover:opacity-90"
            >
              <Search className="mr-2 h-3.5 w-3.5" />
              Aplicar filtros
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

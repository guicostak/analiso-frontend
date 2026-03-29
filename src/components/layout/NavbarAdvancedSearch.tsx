"use client";

import { ChevronDown, RotateCcw, Search, SlidersHorizontal, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

// ─── Tipos locais ─────────────────────────────────────────────────────────────

interface RangeFilter {
  min: string;
  max: string;
}

interface NavAdvancedFilters {
  pl: RangeFilter;
  pvp: RangeFilter;
  dividendYield: RangeFilter;
  roe: RangeFilter;
  roic: RangeFilter;
  margemLiquida: RangeFilter;
  margemEbitda: RangeFilter;
  dividaEbitda: RangeFilter;
  evEbitda: RangeFilter;
  lpa: RangeFilter;
}

const DEFAULT_FILTERS: NavAdvancedFilters = {
  pl:            { min: "", max: "" },
  pvp:           { min: "", max: "" },
  dividendYield: { min: "", max: "" },
  roe:           { min: "", max: "" },
  roic:          { min: "", max: "" },
  margemLiquida: { min: "", max: "" },
  margemEbitda:  { min: "", max: "" },
  dividaEbitda:  { min: "", max: "" },
  evEbitda:      { min: "", max: "" },
  lpa:           { min: "", max: "" },
};

interface MetricConfig {
  key: keyof NavAdvancedFilters;
  label: string;
  unit: string;
  phMin: string;
  phMax: string;
  group: string;
}

const METRICS: MetricConfig[] = [
  { key: "pl",            label: "P/L",              unit: "x",  phMin: "mín", phMax: "máx", group: "Valuation" },
  { key: "pvp",           label: "P/VP",             unit: "x",  phMin: "mín", phMax: "máx", group: "Valuation" },
  { key: "evEbitda",      label: "EV/EBITDA",        unit: "x",  phMin: "mín", phMax: "máx", group: "Valuation" },
  { key: "lpa",           label: "LPA",              unit: "R$", phMin: "mín", phMax: "máx", group: "Valuation" },
  { key: "dividendYield", label: "Dividend Yield",   unit: "%",  phMin: "mín", phMax: "máx", group: "Rentabilidade" },
  { key: "roe",           label: "ROE",              unit: "%",  phMin: "mín", phMax: "máx", group: "Rentabilidade" },
  { key: "roic",          label: "ROIC",             unit: "%",  phMin: "mín", phMax: "máx", group: "Rentabilidade" },
  { key: "margemLiquida", label: "Margem Líquida",   unit: "%",  phMin: "mín", phMax: "máx", group: "Margens" },
  { key: "margemEbitda",  label: "Margem EBITDA",    unit: "%",  phMin: "mín", phMax: "máx", group: "Margens" },
  { key: "dividaEbitda",  label: "Dív./EBITDA",      unit: "x",  phMin: "mín", phMax: "máx", group: "Endividamento" },
];

const GROUPS = ["Valuation", "Rentabilidade", "Margens", "Endividamento"];

// ─── Componente ───────────────────────────────────────────────────────────────

export function NavbarAdvancedSearch() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [filters, setFilters] = useState<NavAdvancedFilters>(DEFAULT_FILTERS);
  const [activeGroup, setActiveGroup] = useState("Valuation");
  const containerRef = useRef<HTMLDivElement>(null);

  // Fecha ao clicar fora
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  // Fecha com Escape
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") setIsOpen(false);
    }
    if (isOpen) document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [isOpen]);

  const activeCount = Object.values(filters).filter(
    (f) => f.min !== "" || f.max !== "",
  ).length;

  const setRange = (key: keyof NavAdvancedFilters, side: "min" | "max", value: string) => {
    setFilters((prev) => ({ ...prev, [key]: { ...prev[key], [side]: value } }));
  };

  const clearMetric = (key: keyof NavAdvancedFilters) => {
    setFilters((prev) => ({ ...prev, [key]: { min: "", max: "" } }));
  };

  const reset = () => setFilters(DEFAULT_FILTERS);

  const apply = () => {
    const params = new URLSearchParams();
    for (const metric of METRICS) {
      const f = filters[metric.key];
      if (f.min !== "") params.set(`${metric.key}Min`, f.min);
      if (f.max !== "") params.set(`${metric.key}Max`, f.max);
    }
    const qs = params.toString();
    router.push(qs ? `/explorar?${qs}` : "/explorar");
    setIsOpen(false);
  };

  const groupMetrics = (group: string) => METRICS.filter((m) => m.group === group);

  return (
    <div ref={containerRef} className="relative hidden md:block">
      {/* Trigger */}
      <button
        onClick={() => setIsOpen((p) => !p)}
        className={`flex h-9 items-center gap-1.5 rounded-lg border px-3 text-[12px] font-medium transition-colors ${
          isOpen || activeCount > 0
            ? "border-brand/30 bg-brand/8 text-brand"
            : "border-border bg-muted text-muted-foreground hover:bg-hover hover:text-foreground"
        }`}
        aria-label="Busca avançada"
      >
        <SlidersHorizontal className="h-3.5 w-3.5" />
        <span className="hidden lg:inline">Busca avançada</span>
        {activeCount > 0 && (
          <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-brand px-1 text-[10px] font-bold text-white">
            {activeCount}
          </span>
        )}
        <ChevronDown
          className={`h-3 w-3 transition-transform ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute left-0 top-full z-50 mt-2 w-[540px] max-w-[calc(100vw-2rem)] rounded-[18px] border border-border bg-card shadow-[0_20px_60px_rgba(0,0,0,0.12)]">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-border px-5 py-3.5">
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="h-4 w-4 text-brand" />
              <span className="text-[13px] font-semibold text-foreground">Busca avançada por métricas</span>
              {activeCount > 0 && (
                <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-brand px-1.5 text-[10px] font-bold text-white">
                  {activeCount}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              {activeCount > 0 && (
                <button
                  onClick={reset}
                  className="flex items-center gap-1 text-[11px] font-medium text-muted-foreground transition hover:text-foreground"
                >
                  <RotateCcw className="h-3 w-3" />
                  Limpar
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="flex h-6 w-6 items-center justify-center rounded-md text-muted-foreground transition hover:bg-hover hover:text-foreground"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          {/* Tabs de grupos */}
          <div className="flex gap-0.5 border-b border-border px-4 pt-3">
            {GROUPS.map((group) => {
              const groupCount = groupMetrics(group).filter(
                (m) => filters[m.key].min !== "" || filters[m.key].max !== "",
              ).length;
              return (
                <button
                  key={group}
                  onClick={() => setActiveGroup(group)}
                  className={`flex items-center gap-1.5 rounded-t-lg px-3 py-2 text-[12px] font-medium transition-colors ${
                    activeGroup === group
                      ? "border-b-2 border-brand text-brand"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {group}
                  {groupCount > 0 && (
                    <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-brand px-1 text-[10px] font-bold text-white">
                      {groupCount}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Campos do grupo ativo */}
          <div className="grid grid-cols-2 gap-3 p-4">
            {groupMetrics(activeGroup).map((metric) => {
              const f = filters[metric.key];
              const hasValue = f.min !== "" || f.max !== "";
              return (
                <div key={metric.key} className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-semibold text-foreground">
                      {metric.label}
                      <span className="ml-1 font-normal text-muted-foreground">({metric.unit})</span>
                    </span>
                    {hasValue && (
                      <button
                        onClick={() => clearMetric(metric.key)}
                        className="text-[10px] text-muted-foreground transition hover:text-foreground"
                      >
                        Limpar
                      </button>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="number"
                      value={f.min}
                      onChange={(e) => setRange(metric.key, "min", e.target.value)}
                      placeholder={metric.phMin}
                      className="h-8 w-full rounded-[8px] border border-border bg-background px-2.5 text-[12px] text-foreground outline-none transition placeholder:text-muted-foreground/60 focus:border-brand/50 focus:ring-1 focus:ring-brand/20"
                    />
                    <span className="shrink-0 text-[11px] text-muted-foreground">–</span>
                    <input
                      type="number"
                      value={f.max}
                      onChange={(e) => setRange(metric.key, "max", e.target.value)}
                      placeholder={metric.phMax}
                      className="h-8 w-full rounded-[8px] border border-border bg-background px-2.5 text-[12px] text-foreground outline-none transition placeholder:text-muted-foreground/60 focus:border-brand/50 focus:ring-1 focus:ring-brand/20"
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Chips de filtros ativos */}
          {activeCount > 0 && (
            <div className="flex flex-wrap gap-1.5 border-t border-border px-4 py-3">
              {METRICS.filter((m) => filters[m.key].min !== "" || filters[m.key].max !== "").map((m) => {
                const f = filters[m.key];
                const label =
                  f.min !== "" && f.max !== ""
                    ? `${f.min}–${f.max}${m.unit}`
                    : f.min !== ""
                    ? `≥${f.min}${m.unit}`
                    : `≤${f.max}${m.unit}`;
                return (
                  <span
                    key={m.key}
                    className="inline-flex items-center gap-1 rounded-full border border-brand/20 bg-brand/8 px-2.5 py-1 text-[11px] font-medium text-brand"
                  >
                    {m.label}: {label}
                    <button onClick={() => clearMetric(m.key)} className="opacity-60 transition hover:opacity-100">
                      <X className="h-2.5 w-2.5" />
                    </button>
                  </span>
                );
              })}
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between border-t border-border px-4 py-3">
            <p className="text-[11px] text-muted-foreground">
              Empresas sem dados em uma métrica serão omitidas.
            </p>
            <button
              onClick={apply}
              className="flex h-8 items-center gap-1.5 rounded-[10px] bg-brand px-4 text-[12px] font-semibold text-white shadow-[0_4px_14px_rgba(14,147,132,0.25)] transition hover:opacity-90"
            >
              <Search className="h-3.5 w-3.5" />
              Buscar empresas
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

"use client";

import { ChevronDown } from "lucide-react";
import { useHeatmapMudancas } from "../hooks/useHeatmapMudancas";
import { toneForCell, cellCount } from "../services";
import type { HeatmapNivel, HeatmapPeriodoSegment, HeatmapSelection } from "../interfaces";

type HeatmapMudancasCardProps = {
  stale?: boolean;
  onCellSelect?: (selection: HeatmapSelection) => void;
  externalNivelFilter?: HeatmapNivel | null;
};

function cx(...classes: Array<string | null | false | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export function HeatmapMudancasCard({ stale = false, onCellSelect, externalNivelFilter = null }: HeatmapMudancasCardProps) {
  const {
    segmento,
    setSegmento,
    periodo,
    setPeriodo,
    importantesApenas,
    setImportantesApenas,
    selectedNiveis,
    setSelectedNiveis,
    activeDates,
    niveisAtivos,
    chipsCount,
    maxRiskDate,
    mobileRows,
    heatmapData,
  } = useHeatmapMudancas(externalNivelFilter);

  return (
    <section className={cx("rounded-[20px] border border-[#E5E7EB] bg-white p-6 shadow-[0_1px_2px_rgba(0,0,0,0.06)]", stale && "border-[#D97706]/35")}>
      <header className="mb-4 flex items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-semibold text-neutral-900">Mapa de calor de mudancas</h2>
          <p className="text-sm text-neutral-500">Onde sua watchlist mudou no periodo selecionado.</p>
        </div>
        <button className="rounded-full border border-[#E5E7EB] px-3 py-1 text-[12px] font-medium text-[#6B7280]">
          Limpar filtros
        </button>
      </header>

      <div className="flex flex-wrap items-center gap-2">
        <div className="inline-flex rounded-full bg-[#EFEFF4] p-1">
          {(["Diario", "Semanal", "Mensal", "Anual"] as HeatmapPeriodoSegment[]).map((item) => (
            <button
              key={item}
              onClick={() => setSegmento(item)}
              className={cx(
                "rounded-full px-3 py-1 text-[12px] font-semibold transition",
                item === segmento ? "bg-white text-[#111827] shadow-[0_1px_2px_rgba(0,0,0,0.08)]" : "text-[#6B7280]",
              )}
            >
              {item}
            </button>
          ))}
        </div>

        <div className="relative inline-flex h-8 items-center gap-1 rounded-full border border-[#E5E7EB] bg-white px-3 text-[12px] font-medium text-[#6B7280]">
          {periodo}
          <ChevronDown className="h-3.5 w-3.5" />
          <select
            value={periodo}
            onChange={(e) => setPeriodo(e.target.value)}
            className="absolute inset-0 opacity-0"
            aria-label="Selecionar janela de tempo"
          >
            <option>Ultimos 7 dias</option>
            <option>Ultimos 30 dias</option>
            <option>Ultimos 90 dias</option>
          </select>
        </div>

        <button onClick={() => setImportantesApenas((v) => !v)} className="inline-flex items-center gap-2 rounded-full border border-[#E5E7EB] px-3 py-1 text-[12px] font-medium text-[#6B7280]">
          <span className={cx("relative h-5 w-9 rounded-full transition-colors", importantesApenas ? "bg-[#0E9CB2]" : "bg-[#D1D5DB]")}>
            <span className={cx("absolute top-0.5 h-4 w-4 rounded-full bg-white transition-all", importantesApenas ? "left-[18px]" : "left-0.5")} />
          </span>
          Importantes apenas
        </button>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        {(["Saudavel", "Atencao", "Risco"] as HeatmapNivel[]).map((nivel) => {
          const isOn = niveisAtivos.includes(nivel);
          const tone =
            nivel === "Saudavel"
              ? "text-[#166534] bg-[rgba(22,163,74,0.10)]"
              : nivel === "Atencao"
                ? "text-[#92400E] bg-[rgba(217,119,6,0.12)]"
                : "text-[#991B1B] bg-[rgba(220,38,38,0.10)]";
          return (
            <button
              key={nivel}
              disabled={importantesApenas && nivel === "Saudavel"}
              onClick={() =>
                setSelectedNiveis((prev) =>
                  prev.includes(nivel) ? (prev.length > 1 ? prev.filter((item) => item !== nivel) : prev) : [...prev, nivel],
                )
              }
              className={cx(
                "inline-flex items-center gap-1 rounded-full px-3 py-1 text-[12px] font-semibold transition",
                isOn ? tone : "text-[#6B7280] bg-[#F3F4F6]",
              )}
            >
              <span className={cx("h-1.5 w-1.5 rounded-full", isOn ? "bg-current" : "bg-[#9CA3AF]")} />
              {nivel} ({chipsCount[nivel]})
            </button>
          );
        })}
      </div>

      <div className="mt-4 hidden overflow-x-auto md:block">
        <div className="min-w-[760px]">
          <div className="grid gap-2" style={{ gridTemplateColumns: `132px repeat(${activeDates.length}, minmax(64px, 1fr))` }}>
            <div className="h-8 px-2 text-[12px] leading-8 font-medium text-[#6B7280]">Empresa</div>
            {activeDates.map((date) => (
              <div key={date} className="h-8 rounded-full bg-[#F3F4F6] text-center text-[12px] leading-8 font-medium text-[#6B7280]">
                {date}
              </div>
            ))}

            {Object.keys(heatmapData).map((ticker) => (
              <div key={ticker} className="contents">
                <div className="flex h-12 items-center px-2 text-[13px] font-semibold text-[#111827]">{ticker}</div>
                {activeDates.map((date) => {
                  const cell = heatmapData[ticker][date];
                  const count = cellCount(cell, niveisAtivos);
                  const tone = toneForCell(cell, niveisAtivos);
                  return (
                    <button
                      key={`${ticker}-${date}`}
                      onClick={() => onCellSelect?.({ ticker, date, pillar: cell.detalhe.pilar })}
                      className={cx(
                        "group relative h-12 rounded-xl border text-[12px] font-semibold transition hover:-translate-y-0.5 hover:border-[#D1D5DB] hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)]",
                        tone.bg,
                        tone.border,
                        tone.text,
                      )}
                    >
                      {count > 0 ? count : "—"}
                      <div className="pointer-events-none absolute bottom-14 left-1/2 z-20 hidden w-[280px] -translate-x-1/2 rounded-2xl border border-[#E5E7EB] bg-white p-3 text-left shadow-[0_8px_24px_rgba(0,0,0,0.08)] group-hover:block">
                        <p className="text-[12px] font-semibold text-[#111827]">
                          Pilar: {cell.detalhe.pilar} • Severidade: {cell.detalhe.severidade}
                        </p>
                        <p className="mt-1 text-[12px] font-medium text-[#6B7280]">Evento: {cell.detalhe.evento}</p>
                        <p className="mt-1 text-[12px] font-medium text-[#6B7280]">Fonte: {cell.detalhe.fonte}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-4 space-y-3 md:hidden">
        {mobileRows.map((row) => (
          <article key={row.ticker} className="rounded-2xl border border-[#E5E7EB] p-3">
            <div className="flex items-center justify-between">
              <p className="text-[14px] font-semibold text-[#111827]">{row.ticker}</p>
              <span className="rounded-full bg-[#F3F4F6] px-2 py-0.5 text-[12px] font-semibold text-[#6B7280]">{row.total} mudancas</span>
            </div>
            <p className="mt-1 text-[12px] font-medium text-[#6B7280]">{row.top.pilar}: {row.top.evento}</p>
            <button className="mt-2 text-[12px] font-semibold text-[#0E9CB2]">Ver detalhes</button>
          </article>
        ))}
      </div>

      <footer className="mt-4 flex flex-wrap items-center justify-between gap-2">
        <p className="text-[12px] font-medium text-[#6B7280]">
          Pilar mais ativo na semana: <span className="font-semibold text-[#111827]">Caixa</span>
        </p>
        <p className="text-[12px] font-medium text-[#6B7280]">
          Dia com mais risco: <span className="font-semibold text-[#111827]">{maxRiskDate.date}</span>
        </p>
      </footer>
    </section>
  );
}

export default HeatmapMudancasCard;

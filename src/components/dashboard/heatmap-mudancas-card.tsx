import { ChevronDown } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

type Nivel = "Saudavel" | "Atencao" | "Risco";
type PeriodoSegment = "Diario" | "Semanal" | "Mensal" | "Anual";

type Celula = {
  saudavel: number;
  atencao: number;
  risco: number;
  detalhe: {
    pilar: "Divida" | "Caixa" | "Margens" | "Retorno" | "Proventos";
    severidade: Nivel;
    evento: string;
    fonte: "CVM" | "B3" | "RI";
  };
};

export type HeatmapSelection = {
  ticker: string;
  date: string;
  pillar: "Divida" | "Caixa" | "Margens" | "Retorno" | "Proventos";
};

type HeatmapMudancasCardProps = {
  stale?: boolean;
  onCellSelect?: (selection: HeatmapSelection) => void;
  externalNivelFilter?: Nivel | null;
};

const datas = ["01/02", "02/02", "03/02", "04/02", "05/02", "06/02", "07/02"];
const empresas = ["VALE3", "LREN3", "ITUB4", "WEGE3", "MRVE3"];

const heatmapData: Record<string, Record<string, Celula>> = {
  VALE3: {
    "01/02": { saudavel: 0, atencao: 1, risco: 0, detalhe: { pilar: "Divida", severidade: "Atencao", evento: "Divida liq./EBITDA subiu", fonte: "CVM" } },
    "02/02": { saudavel: 0, atencao: 1, risco: 0, detalhe: { pilar: "Margens", severidade: "Atencao", evento: "Custos unitarios em alta", fonte: "RI" } },
    "03/02": { saudavel: 0, atencao: 0, risco: 1, detalhe: { pilar: "Divida", severidade: "Risco", evento: "Cobertura de juros enfraqueceu", fonte: "CVM" } },
    "04/02": { saudavel: 0, atencao: 1, risco: 0, detalhe: { pilar: "Retorno", severidade: "Atencao", evento: "ROIC desacelerou", fonte: "RI" } },
    "05/02": { saudavel: 1, atencao: 0, risco: 0, detalhe: { pilar: "Proventos", severidade: "Saudavel", evento: "Politica de payout mantida", fonte: "RI" } },
    "06/02": { saudavel: 0, atencao: 0, risco: 1, detalhe: { pilar: "Divida", severidade: "Risco", evento: "Divida liq./EBITDA subiu", fonte: "CVM" } },
    "07/02": { saudavel: 0, atencao: 1, risco: 0, detalhe: { pilar: "Caixa", severidade: "Atencao", evento: "Caixa operacional pressionado", fonte: "B3" } },
  },
  LREN3: {
    "01/02": { saudavel: 1, atencao: 0, risco: 0, detalhe: { pilar: "Margens", severidade: "Saudavel", evento: "Mix comercial melhorou", fonte: "RI" } },
    "02/02": { saudavel: 0, atencao: 1, risco: 0, detalhe: { pilar: "Margens", severidade: "Atencao", evento: "Margem bruta recuou", fonte: "CVM" } },
    "03/02": { saudavel: 0, atencao: 1, risco: 0, detalhe: { pilar: "Caixa", severidade: "Atencao", evento: "Consumo de caixa cresceu", fonte: "RI" } },
    "04/02": { saudavel: 0, atencao: 1, risco: 0, detalhe: { pilar: "Retorno", severidade: "Atencao", evento: "Retorno sobre capital caiu", fonte: "B3" } },
    "05/02": { saudavel: 0, atencao: 1, risco: 0, detalhe: { pilar: "Margens", severidade: "Atencao", evento: "Custo de vendas acelerou", fonte: "CVM" } },
    "06/02": { saudavel: 0, atencao: 0, risco: 1, detalhe: { pilar: "Margens", severidade: "Risco", evento: "Margem critica no trimestre", fonte: "CVM" } },
    "07/02": { saudavel: 1, atencao: 0, risco: 0, detalhe: { pilar: "Proventos", severidade: "Saudavel", evento: "Distribuicao confirmada", fonte: "RI" } },
  },
  ITUB4: {
    "01/02": { saudavel: 1, atencao: 0, risco: 0, detalhe: { pilar: "Retorno", severidade: "Saudavel", evento: "ROE estavel", fonte: "CVM" } },
    "02/02": { saudavel: 1, atencao: 0, risco: 0, detalhe: { pilar: "Caixa", severidade: "Saudavel", evento: "Liquidez robusta", fonte: "B3" } },
    "03/02": { saudavel: 1, atencao: 0, risco: 0, detalhe: { pilar: "Proventos", severidade: "Saudavel", evento: "Payout recorrente", fonte: "RI" } },
    "04/02": { saudavel: 1, atencao: 0, risco: 0, detalhe: { pilar: "Divida", severidade: "Saudavel", evento: "Capitacao equilibrada", fonte: "CVM" } },
    "05/02": { saudavel: 1, atencao: 0, risco: 0, detalhe: { pilar: "Retorno", severidade: "Saudavel", evento: "Rentabilidade consistente", fonte: "RI" } },
    "06/02": { saudavel: 0, atencao: 1, risco: 0, detalhe: { pilar: "Margens", severidade: "Atencao", evento: "Spread menor no dia", fonte: "B3" } },
    "07/02": { saudavel: 1, atencao: 0, risco: 0, detalhe: { pilar: "Caixa", severidade: "Saudavel", evento: "Folga de liquidez", fonte: "RI" } },
  },
  WEGE3: {
    "01/02": { saudavel: 1, atencao: 0, risco: 0, detalhe: { pilar: "Caixa", severidade: "Saudavel", evento: "Geracao de caixa forte", fonte: "CVM" } },
    "02/02": { saudavel: 1, atencao: 0, risco: 0, detalhe: { pilar: "Margens", severidade: "Saudavel", evento: "Eficiencia operacional", fonte: "RI" } },
    "03/02": { saudavel: 0, atencao: 1, risco: 0, detalhe: { pilar: "Retorno", severidade: "Atencao", evento: "ROIC abaixo da media", fonte: "B3" } },
    "04/02": { saudavel: 1, atencao: 0, risco: 0, detalhe: { pilar: "Proventos", severidade: "Saudavel", evento: "Politica mantida", fonte: "RI" } },
    "05/02": { saudavel: 1, atencao: 0, risco: 0, detalhe: { pilar: "Divida", severidade: "Saudavel", evento: "Alavancagem em linha", fonte: "CVM" } },
    "06/02": { saudavel: 1, atencao: 0, risco: 0, detalhe: { pilar: "Caixa", severidade: "Saudavel", evento: "Conversao melhorou", fonte: "RI" } },
    "07/02": { saudavel: 0, atencao: 1, risco: 0, detalhe: { pilar: "Margens", severidade: "Atencao", evento: "Pressao em insumos", fonte: "B3" } },
  },
  MRVE3: {
    "01/02": { saudavel: 0, atencao: 1, risco: 0, detalhe: { pilar: "Caixa", severidade: "Atencao", evento: "Caixa abaixo da media", fonte: "B3" } },
    "02/02": { saudavel: 0, atencao: 1, risco: 0, detalhe: { pilar: "Divida", severidade: "Atencao", evento: "Custo de divida subiu", fonte: "CVM" } },
    "03/02": { saudavel: 0, atencao: 0, risco: 1, detalhe: { pilar: "Divida", severidade: "Risco", evento: "Alavancagem em nivel critico", fonte: "CVM" } },
    "04/02": { saudavel: 0, atencao: 1, risco: 0, detalhe: { pilar: "Retorno", severidade: "Atencao", evento: "Retorno em queda", fonte: "RI" } },
    "05/02": { saudavel: 0, atencao: 1, risco: 0, detalhe: { pilar: "Margens", severidade: "Atencao", evento: "Margem operacional comprimida", fonte: "CVM" } },
    "06/02": { saudavel: 0, atencao: 0, risco: 1, detalhe: { pilar: "Caixa", severidade: "Risco", evento: "Queima de caixa acelerou", fonte: "B3" } },
    "07/02": { saudavel: 0, atencao: 1, risco: 0, detalhe: { pilar: "Proventos", severidade: "Atencao", evento: "Distribuicao reduzida", fonte: "RI" } },
  },
};

function cx(...classes: Array<string | null | false | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function toneFor(cell: Celula, selected: Nivel[]) {
  const s = selected.includes("Saudavel") ? cell.saudavel : 0;
  const a = selected.includes("Atencao") ? cell.atencao : 0;
  const r = selected.includes("Risco") ? cell.risco : 0;

  if (r > 0) return { bg: "bg-[rgba(220,38,38,0.10)]", border: "border-[rgba(220,38,38,0.22)]", text: "text-[#991B1B]" };
  if (a > 0) return { bg: "bg-[rgba(217,119,6,0.12)]", border: "border-[rgba(217,119,6,0.25)]", text: "text-[#92400E]" };
  if (s > 0) return { bg: "bg-[rgba(22,163,74,0.10)]", border: "border-[rgba(22,163,74,0.22)]", text: "text-[#166534]" };
  return { bg: "bg-[#F3F4F6]", border: "border-[#E5E7EB]", text: "text-[#9CA3AF]" };
}

export function HeatmapMudancasCard({ stale = false, onCellSelect, externalNivelFilter = null }: HeatmapMudancasCardProps) {
  const [segmento, setSegmento] = useState<PeriodoSegment>("Semanal");
  const [periodo, setPeriodo] = useState("Ultimos 7 dias");
  const [importantesApenas, setImportantesApenas] = useState(false);
  const [selectedNiveis, setSelectedNiveis] = useState<Nivel[]>(["Saudavel", "Atencao", "Risco"]);

  useEffect(() => {
    if (!externalNivelFilter) {
      setSelectedNiveis(["Saudavel", "Atencao", "Risco"]);
      return;
    }
    setImportantesApenas(false);
    setSelectedNiveis([externalNivelFilter]);
  }, [externalNivelFilter]);

  const activeDates = useMemo(() => {
    if (segmento === "Diario") return [datas[datas.length - 1]];
    if (segmento === "Mensal") return datas.slice(0, 5);
    if (segmento === "Anual") return datas.slice(0, 3);
    return datas;
  }, [segmento]);

  const niveisAtivos = useMemo(() => {
    if (importantesApenas) return ["Atencao", "Risco"] as Nivel[];
    return selectedNiveis;
  }, [importantesApenas, selectedNiveis]);

  const cellCount = (cell: Celula) => {
    const s = niveisAtivos.includes("Saudavel") ? cell.saudavel : 0;
    const a = niveisAtivos.includes("Atencao") ? cell.atencao : 0;
    const r = niveisAtivos.includes("Risco") ? cell.risco : 0;
    return s + a + r;
  };

  const chipsCount = useMemo(() => {
    let saudavel = 0;
    let atencao = 0;
    let risco = 0;
    empresas.forEach((ticker) => {
      activeDates.forEach((date) => {
        const cell = heatmapData[ticker][date];
        saudavel += cell.saudavel;
        atencao += cell.atencao;
        risco += cell.risco;
      });
    });
    return { Saudavel: saudavel, Atencao: atencao, Risco: risco };
  }, [activeDates]);

  const maxRiskDate = useMemo(() => {
    return activeDates.reduce(
      (best, date) => {
        const risk = empresas.reduce((acc, ticker) => acc + heatmapData[ticker][date].risco, 0);
        if (risk > best.risk) return { date, risk };
        return best;
      },
      { date: activeDates[0], risk: -1 },
    );
  }, [activeDates]);

  const mobileRows = useMemo(() => {
    return empresas.map((ticker) => {
      const total = activeDates.reduce((acc, date) => acc + cellCount(heatmapData[ticker][date]), 0);
      return { ticker, total, top: heatmapData[ticker][activeDates[activeDates.length - 1]].detalhe };
    });
  }, [activeDates, niveisAtivos]);

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
          {(["Diario", "Semanal", "Mensal", "Anual"] as PeriodoSegment[]).map((item) => (
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
        {(["Saudavel", "Atencao", "Risco"] as Nivel[]).map((nivel) => {
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

            {empresas.map((ticker) => (
              <div key={ticker} className="contents">
                <div className="flex h-12 items-center px-2 text-[13px] font-semibold text-[#111827]">{ticker}</div>
                {activeDates.map((date) => {
                  const cell = heatmapData[ticker][date];
                  const count = cellCount(cell);
                  const tone = toneFor(cell, niveisAtivos);
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

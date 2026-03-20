import { useEffect, useMemo, useState, type Dispatch, type SetStateAction } from "react";
import {
  getHeatmapData,
  cellCount,
} from "../services";
import type {
  HeatmapNivel,
  HeatmapPeriodoSegment,
} from "../interfaces";

const { datas, empresas, data: heatmapData } = getHeatmapData();

export interface UseHeatmapMudancasReturn {
  // State
  segmento: HeatmapPeriodoSegment;
  setSegmento: (s: HeatmapPeriodoSegment) => void;
  periodo: string;
  setPeriodo: (p: string) => void;
  importantesApenas: boolean;
  setImportantesApenas: Dispatch<SetStateAction<boolean>>;
  selectedNiveis: HeatmapNivel[];
  setSelectedNiveis: Dispatch<SetStateAction<HeatmapNivel[]>>;

  // Derived
  activeDates: string[];
  niveisAtivos: HeatmapNivel[];
  chipsCount: Record<HeatmapNivel, number>;
  maxRiskDate: { date: string; risk: number };
  mobileRows: {
    ticker: string;
    total: number;
    top: { pilar: string; severidade: HeatmapNivel; evento: string; fonte: string };
  }[];

  // Static data needed by the view
  datas: string[];
  empresas: string[];
  heatmapData: typeof heatmapData;
}

export function useHeatmapMudancas(
  externalNivelFilter: HeatmapNivel | null = null,
): UseHeatmapMudancasReturn {
  const [segmento, setSegmento] = useState<HeatmapPeriodoSegment>("Semanal");
  const [periodo, setPeriodo] = useState("Ultimos 7 dias");
  const [importantesApenas, setImportantesApenas] = useState(false);
  const [selectedNiveis, setSelectedNiveis] = useState<HeatmapNivel[]>(["Saudavel", "Atencao", "Risco"]);

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

  const niveisAtivos = useMemo<HeatmapNivel[]>(() => {
    if (importantesApenas) return ["Atencao", "Risco"];
    return selectedNiveis;
  }, [importantesApenas, selectedNiveis]);

  const chipsCount = useMemo<Record<HeatmapNivel, number>>(() => {
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
      const total = activeDates.reduce(
        (acc, date) => acc + cellCount(heatmapData[ticker][date], niveisAtivos),
        0,
      );
      return {
        ticker,
        total,
        top: heatmapData[ticker][activeDates[activeDates.length - 1]].detalhe,
      };
    });
  }, [activeDates, niveisAtivos]);

  return {
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
    datas,
    empresas,
    heatmapData,
  };
}

/**
 * Gera labels temporais aproximadas para pontos de uma sparkline.
 *
 * Limitação: o backend ainda não envia as datas reais dos pontos. Enquanto
 * isso, compomos labels no front a partir do range + quantidade de pontos.
 * É uma aproximação (ignora feriados/fds B3), suficiente para o tooltip.
 *
 * Quando a Fase 3-bis do backend expuser `sparklineDates: string[]`, basta
 * trocar o uso desta função pelas datas reais.
 */

import type { MarketTimeRange } from "../interfaces/market.interfaces";

export type SparklineLabelFlavor = "daily" | "monthly" | "intraday" | "none";

/** Mapeia o range do toggle para o flavor de label apropriado. */
export function flavorForRange(range: MarketTimeRange | null | undefined): SparklineLabelFlavor {
  if (!range) return "daily";
  return range === "1D" ? "intraday" : "daily";
}

/**
 * Gera `count` labels terminando em hoje (ou em `referenceDate`).
 *
 * - `daily`    → "DD/MM" (ex.: "19/04")
 * - `monthly`  → "mmm/yy" (ex.: "abr/26")
 * - `intraday` → [] (sem timestamps reais; tooltip mostra só valor)
 * - `none`     → []
 */
export function makeSparklineLabels(
  flavor: SparklineLabelFlavor,
  count: number,
  referenceDate: Date = new Date(),
): string[] {
  if (flavor === "none" || flavor === "intraday" || !count) return [];

  const out: string[] = [];

  if (flavor === "daily") {
    for (let i = count - 1; i >= 0; i--) {
      const d = new Date(referenceDate);
      d.setDate(d.getDate() - i);
      out.push(
        d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" }),
      );
    }
    return out;
  }

  if (flavor === "monthly") {
    for (let i = count - 1; i >= 0; i--) {
      const d = new Date(
        referenceDate.getFullYear(),
        referenceDate.getMonth() - i,
        1,
      );
      out.push(
        d.toLocaleDateString("pt-BR", { month: "short", year: "2-digit" }),
      );
    }
    return out;
  }

  return out;
}

/**
 * Conveniência para quando o caller só quer os labels do toggle atual.
 */
export function labelsFromRange(
  range: MarketTimeRange | null | undefined,
  count: number,
): string[] {
  return makeSparklineLabels(flavorForRange(range), count);
}

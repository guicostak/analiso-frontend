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

/**
 * Formata datas ISO (yyyy-MM-dd) como labels de sparkline.
 * - daily   → "DD/MM"
 * - monthly → "mmm/yy"
 */
export function formatSparklineDates(
  isoDates: string[] | null | undefined,
  flavor: SparklineLabelFlavor,
): string[] {
  if (!Array.isArray(isoDates) || !isoDates.length) return [];
  if (flavor === "intraday" || flavor === "none") return [];

  return isoDates.map((iso) => {
    const parsed = parseIsoDateLocal(iso);
    if (!parsed) return iso;
    if (flavor === "monthly") {
      return parsed.toLocaleDateString("pt-BR", { month: "short", year: "2-digit" });
    }
    return parsed.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
  });
}

/**
 * Escolhe a melhor fonte de labels para a sparkline:
 *  1. Se o backend mandou sparklineDates alinhado com os valores, usa.
 *  2. Caso contrário, cai na aproximação por range + count.
 *
 * Para 1D sem datas reais, retorna [] (tooltip mostra só valor).
 */
export function resolveSparklineLabels(args: {
  dates?: string[] | null;
  range: MarketTimeRange | null | undefined;
  count: number;
  flavor?: SparklineLabelFlavor;
}): string[] {
  const flavor = args.flavor ?? flavorForRange(args.range);
  if (Array.isArray(args.dates) && args.dates.length === args.count) {
    return formatSparklineDates(args.dates, flavor);
  }
  return makeSparklineLabels(flavor, args.count);
}

/** Parse "yyyy-MM-dd" em Date local (sem desloc. timezone). */
function parseIsoDateLocal(iso: string): Date | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!m) {
    const d = new Date(iso);
    return Number.isNaN(d.getTime()) ? null : d;
  }
  return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
}

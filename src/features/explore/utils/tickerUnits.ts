/**
 * Mapeamento canonical_ticker → unidade/moeda de exibição.
 *
 * Convenção:
 *  - `prefix`: vem antes do valor (moedas: "US$", "R$")
 *  - `suffix`: vem depois do valor (pontos/índices: "pts")
 *  - `hint`:   texto curto com a denominação completa para tooltip
 *              (ex.: "US$/barril") — exibido no formatter quando útil.
 */

export interface TickerUnit {
  prefix?: string;
  suffix?: string;
  hint?: string;
}

export const UNIT_BY_TICKER: Record<string, TickerUnit> = {
  // ─── Índices B3 ──────────────────────────────────────────────
  "^BVSP":  { suffix: "pts", hint: "pontos" },
  "^IBRX":  { suffix: "pts", hint: "pontos" },
  "^SMLL":  { suffix: "pts", hint: "pontos" },
  "^IFIX":  { suffix: "pts", hint: "pontos" },
  "^IVBX2": { suffix: "pts", hint: "pontos" },
  // ─── Índices globais ─────────────────────────────────────────
  "^GSPC":  { suffix: "pts", hint: "pontos" },
  "^IXIC":  { suffix: "pts", hint: "pontos" },
  "^DJI":   { suffix: "pts", hint: "pontos" },
  "^VIX":   { suffix: "pts", hint: "% anual. (índice)" },
  "DXY":    { suffix: "pts", hint: "índice do dólar" },
  // ─── Câmbio / commodities / cripto ───────────────────────────
  "USDBRL": { prefix: "R$",  hint: "reais por dólar" },
  "BTC":    { prefix: "US$", hint: "dólar por Bitcoin" },
  "BRENT":  { prefix: "US$", hint: "dólar por barril" },
  "WTI":    { prefix: "US$", hint: "dólar por barril" },
  "GOLD":   { prefix: "US$", hint: "dólar por onça-troy" },
  "IRONORE":{ prefix: "US$", hint: "dólar por tonelada" },
};

/** Busca a unidade do ticker, sendo case-insensitive no prefixo `^`. */
export function unitFor(ticker: string | null | undefined): TickerUnit | undefined {
  if (!ticker) return undefined;
  return UNIT_BY_TICKER[ticker];
}

/**
 * Formata um valor já pré-formatado (string pt-BR) aplicando prefixo/sufixo.
 * Ex.: formatWithUnit("^BVSP", "192.485") → "192.485 pts"
 *      formatWithUnit("GOLD",  "4.761,30") → "US$ 4.761,30"
 */
export function formatWithUnit(ticker: string | null | undefined, formattedValue: string): string {
  const u = unitFor(ticker);
  if (!u) return formattedValue;
  if (u.prefix) return `${u.prefix} ${formattedValue}`;
  if (u.suffix) return `${formattedValue} ${u.suffix}`;
  return formattedValue;
}

/**
 * Formatter para a MiniSparkline — recebe number e devolve string com unidade.
 * Usado no tooltip: cada ponto é formatado respeitando a unidade do ticker.
 */
export function sparklineValueFormatter(ticker: string | null | undefined) {
  const u = unitFor(ticker);
  return (v: number) => {
    const s = v.toLocaleString("pt-BR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
    if (!u) return s;
    if (u.prefix) return `${u.prefix} ${s}`;
    if (u.suffix) return `${s} ${u.suffix}`;
    return s;
  };
}

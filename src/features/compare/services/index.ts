/**
 * Compare service.
 *
 * Responsabilidades:
 *  1. Dados mock (companies, events)
 *  2. Constantes de domínio (PILLARS, PILLAR_LABEL, RANGES, pillarCopy)
 *  3. Funções puras de formatação, cálculo e derivação
 *
 * Independente de React — sem imports de hooks ou JSX.
 * Preparado para substituição por chamadas HTTP reais.
 */

import type {
  ComparePillar,
  CompareTrend,
  CompareRangeKey,
  CompareConfidence,
  CompareProvider,
  CompareSource,
  ComparePoint,
  CompareCompany,
  CompareEventItem,
  CompareRangeOption,
  ComparePillarDiff,
  CompareScoreboard,
  CompareVerdict,
  CompareEnrichedCompany,
  CompareCategoryDef,
} from "../interfaces";

// ─── Constantes de domínio ────────────────────────────────────────────────────

export const PILLARS: ComparePillar[] = [
  "Divida",
  "CaixaFCF",
  "Margens",
  "Retorno",
  "Proventos",
];

export const PILLAR_LABEL: Record<ComparePillar, string> = {
  Divida: "Divida",
  CaixaFCF: "Caixa/FCF",
  Margens: "Margens",
  Retorno: "Retorno",
  Proventos: "Proventos",
};

export const RANGES: CompareRangeOption[] = [
  { key: "6m",     label: "6M",   years: null, months: 6  },
  { key: "1a",     label: "1A",   years: 1               },
  { key: "2a",     label: "2A",   years: 2               },
  { key: "3a",     label: "3A",   years: 3               },
  { key: "5a",     label: "5A",   years: 5               },
  { key: "10a",    label: "10A",  years: 10              },
  { key: "max",    label: "Máx",  years: null            },
  { key: "custom", label: "Período personalizado", years: null },
];

export const CATEGORIES: CompareCategoryDef[] = [
  { slug: "todas",       label: "Todas" },
  { slug: "visao-geral", label: "Visão geral" },
  { slug: "valuation",   label: "Valuation" },
  { slug: "crescimento", label: "Crescimento" },
  { slug: "passado",     label: "Passado" },
  { slug: "saude",       label: "Saúde" },
  { slug: "dividendos",  label: "Dividendos" },
  { slug: "metricas",    label: "Métricas" },
  { slug: "timeline",    label: "Timeline" },
  { slug: "fontes",      label: "Fontes" },
];

export const pillarCopy: Record<
  ComparePillar,
  { what: string; how: string; why: string; ranges: [string, string, string] }
> = {
  Divida: {
    what: "Mede pressao de alavancagem.",
    how: "Menor e mais estavel tende a ser melhor.",
    why: "Reduz risco de estresse financeiro.",
    ranges: ["< 1,5x confortavel", "1,5-2,2x atencao", "> 2,2x risco"],
  },
  CaixaFCF: {
    what: "Mede geracao de caixa livre.",
    how: "Maior e menos volatil tende a ser melhor.",
    why: "Sustenta execucao e investimento.",
    ranges: ["> 10% saudavel", "6%-10% atencao", "< 6% risco"],
  },
  Margens: {
    what: "Mede eficiencia operacional.",
    how: "Margens altas e estaveis sao melhores.",
    why: "Preserva resultado em ciclos ruins.",
    ranges: ["> 18% saudavel", "14%-18% atencao", "< 14% risco"],
  },
  Retorno: {
    what: "Mede retorno sobre capital.",
    how: "Retorno maior com boa tendencia e melhor.",
    why: "Mostra qualidade estrutural.",
    ranges: ["> 14% forte", "10%-14% atencao", "< 10% fraco"],
  },
  Proventos: {
    what: "Mede consistencia de distribuicao.",
    how: "Consistencia vale mais que pico.",
    why: "Aumenta previsibilidade ao acionista.",
    ranges: ["Payout 35%-60% saudavel", "< 35% atencao", "> 60% atencao"],
  },
};

// ─── Funções puras auxiliares ─────────────────────────────────────────────────

export const buildSeries = (list: number[]): ComparePoint[] =>
  list.map((value, i) => ({ year: 2021 + i, value }));

export const mkSource = (
  provider: CompareProvider,
  document: string,
  updatedAt: string,
  link: string,
  reference?: string,
): CompareSource => ({
  provider,
  document,
  updatedAt,
  link,
  reference,
  method: "Padronizacao de metricas a partir de documentos oficiais.",
});

export const formatMetric = (value: number | null, unit: string): string =>
  value === null
    ? "Dados indisponiveis"
    : `${new Intl.NumberFormat("pt-BR", {
        minimumFractionDigits: unit === "x" ? 2 : 1,
        maximumFractionDigits: unit === "x" ? 2 : 1,
      }).format(value)} ${unit}`;

export const metricDelta = (
  a: number | null,
  b: number | null,
): number | null => (a === null || b === null ? null : Math.abs(a - b));

export const metricWinner = (
  direction: "higher-better" | "lower-better",
  a: number | null,
  b: number | null,
): "a" | "b" | "tie" => {
  if (a === null && b === null) return "tie";
  if (a === null) return "b";
  if (b === null) return "a";
  if (direction === "higher-better") return a > b ? "a" : b > a ? "b" : "tie";
  return a < b ? "a" : b < a ? "b" : "tie";
};

export const trendFromSeries = (series: ComparePoint[]): CompareTrend => {
  if (!series.length) return "estavel";
  const first = series[0]?.value ?? 0;
  const last = series[series.length - 1]?.value ?? 0;
  const delta = last - first;
  if (Math.abs(delta) <= Math.max(0.2, Math.abs(first) * 0.03)) return "estavel";
  return delta > 0 ? "melhorando" : "piorando";
};

export const parseDate = (value: string): number => {
  const [dd, mm, yyyy] = value.split("/").map(Number);
  return new Date(yyyy, mm - 1, dd).getTime();
};

export const confidenceLabel = (pair: CompareCompany[]): CompareConfidence => {
  if (pair.every((c) => c.confidence === "Alta")) return "Alta";
  if (pair.some((c) => c.confidence === "Baixa")) return "Baixa";
  return "Media";
};

export const pillarInsight = (pillar: ComparePillar, winner: string): string => {
  if (pillar === "CaixaFCF")
    return `${winner} converte melhor resultado em caixa e sustenta execucao com mais folga.`;
  if (pillar === "Divida")
    return `${winner} opera com alavancagem mais controlada no periodo.`;
  if (pillar === "Margens")
    return `${winner} preserva eficiencia operacional com mais consistencia.`;
  if (pillar === "Retorno")
    return `${winner} extrai mais resultado do capital investido.`;
  return `${winner} mostra distribuicao mais previsivel para o acionista.`;
};

export const trendContext = (trend: CompareTrend): string => {
  if (trend === "melhorando") return "Tendencia recente reforca a leitura";
  if (trend === "piorando") return "Tendencia recente pede cautela";
  return "Tendencia recente esta estavel";
};

export const trendNarrative = (trend: CompareTrend, ticker: string): string => {
  if (trend === "melhorando") return `${ticker} ganhou tracao recente`;
  if (trend === "piorando") return `${ticker} perdeu tracao recente`;
  return `${ticker} ficou estavel no periodo`;
};

export const summarizeWinners = (
  items: Array<{ p: ComparePillar; winner: CompareCompany }>,
): string => {
  const bucket = new Map<string, ComparePillar[]>();
  items.forEach((item) => {
    const current = bucket.get(item.winner.ticker) ?? [];
    current.push(item.p);
    bucket.set(item.winner.ticker, current);
  });
  const leader = [...bucket.entries()].sort((x, y) => y[1].length - x[1].length)[0];
  if (!leader) return "";
  const [ticker, pillars] = leader;
  const labels = pillars.slice(0, 3).map((p) => PILLAR_LABEL[p]);
  return `${ticker} abre vantagem em ${labels.join(", ")}.`;
};

export const pillarConsequence = (
  pillar: ComparePillar,
  delta: number,
  winner: string,
): string => {
  const intensity =
    delta >= 1.5
      ? "diferenca relevante"
      : delta >= 0.8
        ? "diferenca moderada"
        : "diferenca pequena";
  if (pillar === "Divida")
    return `${intensity}: ${winner} opera com menor pressao financeira hoje.`;
  if (pillar === "CaixaFCF")
    return `${intensity}: ${winner} tem mais folga para investir sem estresse de caixa.`;
  if (pillar === "Margens")
    return `${intensity}: ${winner} sustenta melhor eficiencia operacional no ciclo atual.`;
  if (pillar === "Retorno")
    return `${intensity}: ${winner} converte capital em resultado com mais consistencia.`;
  return `${intensity}: ${winner} mostra previsibilidade maior na distribuicao ao acionista.`;
};

export const evidenceReadLabel = (delta: number | null): string => {
  if (delta === null) return "Dados insuficientes";
  if (delta >= 3) return "Vantagem clara";
  if (delta >= 1.2) return "Vantagem relevante";
  if (delta >= 0.5) return "Vantagem leve";
  return "Diferenca pequena";
};

/** Formata número com pt-BR, dígitos configuráveis */
export const formatNumber = (value: number, digits = 1): string =>
  new Intl.NumberFormat("pt-BR", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(value);

// ─── Funções de derivação (usadas pelo hook) ──────────────────────────────────

export function derivePillarDiffs(
  a: CompareCompany,
  b: CompareCompany,
): ComparePillarDiff[] {
  return PILLARS.map((p) => {
    const da = a.pillars[p];
    const db = b.pillars[p];
    const winner = da.score >= db.score ? a : b;
    const loser = winner.ticker === a.ticker ? b : a;
    const winnerTrend =
      winner.ticker === a.ticker
        ? trendFromSeries(da.series)
        : trendFromSeries(db.series);
    const loserTrend =
      loser.ticker === a.ticker
        ? trendFromSeries(da.series)
        : trendFromSeries(db.series);
    return {
      p,
      da,
      db,
      winner,
      loser,
      delta: Math.abs(da.score - db.score),
      lowestScore: Math.min(da.score, db.score),
      winnerTrend,
      loserTrend,
    };
  }).sort((x, y) => y.delta - x.delta);
}

export function deriveScoreboard(
  a: CompareCompany,
  b: CompareCompany,
): CompareScoreboard {
  const avgA = PILLARS.reduce((acc, p) => acc + a.pillars[p].score, 0) / PILLARS.length;
  const avgB = PILLARS.reduce((acc, p) => acc + b.pillars[p].score, 0) / PILLARS.length;
  const winner = avgA >= avgB ? a : b;
  const attention = [
    ...PILLARS.map((p) => ({ c: a, p, s: a.pillars[p].score })),
    ...PILLARS.map((p) => ({ c: b, p, s: b.pillars[p].score })),
  ].sort((x, y) => x.s - y.s)[0];
  const spread = PILLARS.map((p) => ({
    p,
    d: Math.abs(a.pillars[p].score - b.pillars[p].score),
  })).sort((x, y) => y.d - x.d)[0];
  return { winner, score: Math.max(avgA, avgB), attention, spread, avgA, avgB };
}

export function deriveVerdict(
  a: CompareCompany,
  b: CompareCompany,
  pair: CompareCompany[],
  scoreboard: CompareScoreboard,
  pillarDiffs: ComparePillarDiff[],
  topPillarDiffs: ComparePillarDiff[],
): CompareVerdict {
  const winner = scoreboard.avgA >= scoreboard.avgB ? a : b;
  const loser = winner.ticker === a.ticker ? b : a;
  const biggestGap = pillarDiffs[0];
  const keyRisk = [...pillarDiffs].sort((x, y) => x.lowestScore - y.lowestScore)[0];
  const reasons = topPillarDiffs.map((item) => {
    if (item.p === "CaixaFCF")
      return `${item.winner.ticker} converte melhor resultado em caixa e sustenta execucao.`;
    if (item.p === "Divida")
      return `${item.winner.ticker} opera com alavancagem mais controlada no periodo.`;
    if (item.p === "Margens")
      return `${item.winner.ticker} preserva eficiencia operacional com mais consistencia.`;
    if (item.p === "Retorno")
      return `${item.winner.ticker} entrega retorno mais robusto sobre o capital.`;
    return `${item.winner.ticker} mostra distribuicao mais previsivel aos acionistas.`;
  });
  return {
    winner,
    loser,
    biggestGap,
    keyRisk,
    reasons,
    consequence: summarizeWinners(topPillarDiffs),
    confidence: confidenceLabel(pair),
    latestUpdate: pair
      .map((c) => c.updatedAt)
      .sort((x, y) => parseDate(y) - parseDate(x))[0],
  };
}

// ─── Dados mock ───────────────────────────────────────────────────────────────

const weg: CompareCompany = {
  ticker: "WEGE3",
  name: "WEG",
  sector: "Industria",
  updatedAt: "06/02/2026",
  primarySource: "CVM / B3 / RI",
  confidence: "Alta",
  gaps: [],
  pillars: {
    Divida: {
      score: 8.4,
      status: "Saudavel",
      thresholdLabel: "Quanto menor, melhor.",
      domain: [0, 3],
      bands: { safe: [0, 1.5], warning: [1.5, 2.2], risk: [2.2, 3] },
      series: buildSeries([1.1, 1.0, 0.9, 0.9, 0.8]),
      metrics: [
        {
          name: "Divida liquida/EBITDA",
          definition: "Anos de EBITDA para quitar divida.",
          unit: "x",
          direction: "lower-better",
          value: 0.8,
          trend: "estavel",
          source: mkSource("CVM", "DFP 2025", "06/02/2026", "https://www.cvm.gov.br/"),
        },
        {
          name: "Cobertura de juros",
          definition: "EBIT sobre despesa financeira.",
          unit: "x",
          direction: "higher-better",
          value: 8.4,
          trend: "melhorando",
          source: mkSource("CVM", "DFP 2025", "06/02/2026", "https://www.cvm.gov.br/"),
        },
      ],
    },
    CaixaFCF: {
      score: 8.6,
      status: "Saudavel",
      thresholdLabel: "Quanto maior, melhor.",
      domain: [0, 20],
      bands: { safe: [10, 20], warning: [6, 10], risk: [0, 6] },
      series: buildSeries([10.1, 10.9, 11.5, 12.2, 12.8]),
      metrics: [
        {
          name: "FCF/Receita",
          definition: "Receita convertida em caixa livre.",
          unit: "%",
          direction: "higher-better",
          value: 12.8,
          trend: "melhorando",
          source: mkSource("RI", "Release 4T25", "06/02/2026", "https://ri.weg.net/"),
        },
        {
          name: "Capex/FCF",
          definition: "Investimento sobre caixa livre.",
          unit: "x",
          direction: "lower-better",
          value: 0.52,
          trend: "estavel",
          source: mkSource("RI", "Release 4T25", "06/02/2026", "https://ri.weg.net/"),
        },
      ],
    },
    Margens: {
      score: 7.8,
      status: "Saudavel",
      thresholdLabel: "Quanto maior, melhor.",
      domain: [8, 30],
      bands: { safe: [18, 30], warning: [14, 18], risk: [8, 14] },
      series: buildSeries([19, 19.4, 19.8, 20, 20.1]),
      metrics: [
        {
          name: "Margem EBITDA",
          definition: "EBITDA/Receita.",
          unit: "%",
          direction: "higher-better",
          value: 20.1,
          trend: "estavel",
          source: mkSource("CVM", "ITR 4T25", "06/02/2026", "https://www.cvm.gov.br/"),
        },
        {
          name: "Margem liquida",
          definition: "Lucro liquido/Receita.",
          unit: "%",
          direction: "higher-better",
          value: 14.9,
          trend: "estavel",
          source: mkSource("CVM", "ITR 4T25", "06/02/2026", "https://www.cvm.gov.br/"),
        },
      ],
    },
    Retorno: {
      score: 8.2,
      status: "Saudavel",
      thresholdLabel: "Quanto maior, melhor.",
      domain: [5, 24],
      bands: { safe: [14, 24], warning: [10, 14], risk: [5, 10] },
      series: buildSeries([14.2, 14.9, 15.5, 16.1, 16.5]),
      metrics: [
        {
          name: "ROIC",
          definition: "Retorno sobre capital investido.",
          unit: "%",
          direction: "higher-better",
          value: 16.5,
          trend: "melhorando",
          source: mkSource("CVM", "DFP 2025", "06/02/2026", "https://www.cvm.gov.br/"),
        },
        {
          name: "ROE",
          definition: "Retorno sobre patrimonio.",
          unit: "%",
          direction: "higher-better",
          value: 23.2,
          trend: "melhorando",
          source: mkSource("CVM", "DFP 2025", "06/02/2026", "https://www.cvm.gov.br/"),
        },
      ],
    },
    Proventos: {
      score: 6.9,
      status: "Atencao",
      thresholdLabel: "Faixa saudavel: 35% a 60%.",
      domain: [10, 90],
      bands: { safe: [35, 60], warning: [25, 35], risk: [10, 25] },
      series: buildSeries([39, 41, 43, 45, 44]),
      metrics: [
        {
          name: "Payout",
          definition: "Lucro distribuido.",
          unit: "%",
          direction: "higher-better",
          value: 44,
          trend: "estavel",
          source: mkSource("RI", "Politica 2025", "05/02/2026", "https://ri.weg.net/"),
        },
        {
          name: "Dividend Yield",
          definition: "Provento/Preco.",
          unit: "%",
          direction: "higher-better",
          value: 2.3,
          trend: "estavel",
          source: mkSource("B3", "Historico", "05/02/2026", "https://www.b3.com.br/"),
        },
      ],
    },
  },
};

const vale: CompareCompany = {
  ticker: "VALE3",
  name: "Vale",
  sector: "Mineracao",
  updatedAt: "05/02/2026",
  primarySource: "CVM / B3 / RI",
  confidence: "Media",
  gaps: ["Sem guidance trimestral de prazo medio da divida em 2025."],
  pillars: {
    Divida: {
      ...weg.pillars.Divida,
      score: 6.1,
      status: "Atencao",
      series: buildSeries([1.2, 1.3, 1.4, 1.6, 1.7]),
      metrics: [
        {
          ...weg.pillars.Divida.metrics[0],
          value: 1.7,
          trend: "piorando",
          source: mkSource("CVM", "DFP 2024", "05/02/2026", "https://www.cvm.gov.br/"),
        },
        {
          ...weg.pillars.Divida.metrics[1],
          value: 4.8,
          trend: "estavel",
          source: mkSource("CVM", "DFP 2024", "05/02/2026", "https://www.cvm.gov.br/"),
        },
      ],
    },
    CaixaFCF: {
      ...weg.pillars.CaixaFCF,
      score: 5.9,
      status: "Atencao",
      series: buildSeries([10.8, 9.7, 8.8, 7.8, 7.2]),
      metrics: [
        {
          ...weg.pillars.CaixaFCF.metrics[0],
          value: 7.2,
          trend: "piorando",
          source: mkSource("RI", "Release 4T24", "05/02/2026", "https://ri.vale.com/"),
        },
        {
          ...weg.pillars.CaixaFCF.metrics[1],
          value: 1.12,
          trend: "piorando",
          source: mkSource("RI", "Release 4T24", "05/02/2026", "https://ri.vale.com/"),
        },
      ],
    },
    Margens: {
      ...weg.pillars.Margens,
      score: 6.5,
      status: "Atencao",
      series: buildSeries([26.2, 25.8, 24.9, 23.9, 23.4]),
      metrics: [
        {
          ...weg.pillars.Margens.metrics[0],
          value: 23.4,
          source: mkSource("CVM", "ITR 4T24", "05/02/2026", "https://www.cvm.gov.br/"),
        },
        {
          ...weg.pillars.Margens.metrics[1],
          value: 14.1,
          trend: "piorando",
          source: mkSource("CVM", "ITR 4T24", "05/02/2026", "https://www.cvm.gov.br/"),
        },
      ],
    },
    Retorno: {
      ...weg.pillars.Retorno,
      score: 6.6,
      status: "Atencao",
      series: buildSeries([13.1, 12.8, 12.4, 12.1, 11.8]),
      metrics: [
        {
          ...weg.pillars.Retorno.metrics[0],
          value: 11.8,
          trend: "estavel",
          source: mkSource("CVM", "DFP 2024", "05/02/2026", "https://www.cvm.gov.br/"),
        },
        {
          ...weg.pillars.Retorno.metrics[1],
          value: null,
          trend: "estavel",
          source: mkSource(
            "CVM",
            "DFP 2024",
            "05/02/2026",
            "https://www.cvm.gov.br/",
            "Campo nao reportado no consolidado.",
          ),
        },
      ],
    },
    Proventos: {
      ...weg.pillars.Proventos,
      score: 7.1,
      status: "Saudavel",
      series: buildSeries([41, 44, 47, 50, 52]),
      metrics: [
        {
          ...weg.pillars.Proventos.metrics[0],
          value: 52,
          trend: "melhorando",
          source: mkSource("RI", "Politica 2024", "05/02/2026", "https://ri.vale.com/"),
        },
        {
          ...weg.pillars.Proventos.metrics[1],
          value: 7.2,
          source: mkSource("B3", "Historico", "05/02/2026", "https://www.b3.com.br/"),
        },
      ],
    },
  },
};

const itub: CompareCompany = {
  ticker: "ITUB4",
  name: "Itau Unibanco",
  sector: "Bancos",
  updatedAt: "07/02/2026",
  primarySource: "CVM / B3 / RI",
  confidence: "Alta",
  gaps: [],
  pillars: {
    Divida: { ...weg.pillars.Divida, score: 7.5 },
    CaixaFCF: { ...weg.pillars.CaixaFCF, score: 7.3 },
    Margens: { ...weg.pillars.Margens, score: 7.2 },
    Retorno: { ...weg.pillars.Retorno, score: 8.1 },
    Proventos: { ...weg.pillars.Proventos, score: 7.8 },
  },
};

export const companies: CompareCompany[] = [weg, vale, itub];

// ─── Enriched mock data for side-by-side islands ─────────────────────────────

const wegEnriched: CompareEnrichedCompany = {
  ...weg,
  price: 52.34,
  change1d: 1.24,
  snowflake: [
    { dimension: "value", label: "Valor", score: 2, normalized: 33 },
    { dimension: "future", label: "Futuro", score: 5, normalized: 83 },
    { dimension: "past", label: "Passado", score: 5, normalized: 83 },
    { dimension: "health", label: "Saude", score: 6, normalized: 100 },
    { dimension: "dividend", label: "Dividendo", score: 3, normalized: 50 },
  ],
  valuation: {
    fairValue: 38.50,
    currentPrice: 52.34,
    discountPercent: -35.9,
    model: "2-Stage FCF",
    pe: 32.1,
    peIndustry: 18.4,
    evEbitda: 22.8,
    pvp: 8.9,
  },
  priceScenarios: [
    { key: "conservador", label: "Conservador", value: 34.20, gapPercent: -34.7 },
    { key: "base", label: "Base", value: 38.50, gapPercent: -26.4 },
    { key: "otimista", label: "Otimista", value: 48.80, gapPercent: -6.8 },
  ],
  growthData: {
    earningsGrowth: 18.2,
    revenueGrowth: 14.5,
    industryEarningsGrowth: 12.0,
    marketEarningsGrowth: 10.8,
    epsSeries: [
      { year: "2022", value: 1.12, type: "historical" },
      { year: "2023", value: 1.28, type: "historical" },
      { year: "2024", value: 1.45, type: "historical" },
      { year: "2025", value: 1.62, type: "forecast" },
      { year: "2026", value: 1.88, type: "forecast" },
      { year: "2027", value: 2.18, type: "forecast" },
    ],
    revenueSeries: [
      { year: "2022", value: 29800, type: "historical" },
      { year: "2023", value: 32500, type: "historical" },
      { year: "2024", value: 36200, type: "historical" },
      { year: "2025", value: 40800, type: "forecast" },
      { year: "2026", value: 46100, type: "forecast" },
      { year: "2027", value: 52400, type: "forecast" },
    ],
  },
  pastData: {
    earningsGrowthRate: 22.4,
    revenueGrowthRate: 18.1,
    roe: 23.2,
    roce: 19.8,
    netMargin: 14.9,
    grossMargin: 34.2,
    operatingMargin: 20.1,
    revenueSeries: [
      { year: "2020", value: 19600 },
      { year: "2021", value: 23400 },
      { year: "2022", value: 29800 },
      { year: "2023", value: 32500 },
      { year: "2024", value: 36200 },
    ],
    earningsSeries: [
      { year: "2020", value: 2840 },
      { year: "2021", value: 3520 },
      { year: "2022", value: 4680 },
      { year: "2023", value: 4980 },
      { year: "2024", value: 5390 },
    ],
    marginSeries: [
      { year: "2020", gross: 33.0, operating: 18.2, net: 14.5 },
      { year: "2021", gross: 33.5, operating: 18.8, net: 15.0 },
      { year: "2022", gross: 33.8, operating: 19.4, net: 15.7 },
      { year: "2023", gross: 34.0, operating: 19.8, net: 15.3 },
      { year: "2024", gross: 34.2, operating: 20.1, net: 14.9 },
    ],
    roeSeries: [
      { year: "2020", value: 19.2 }, { year: "2021", value: 20.8 },
      { year: "2022", value: 22.1 }, { year: "2023", value: 22.8 },
      { year: "2024", value: 23.2 },
    ],
    roceSeries: [
      { year: "2020", value: 16.1 }, { year: "2021", value: 17.2 },
      { year: "2022", value: 18.5 }, { year: "2023", value: 19.2 },
      { year: "2024", value: 19.8 },
    ],
  },
  healthData: {
    shortTermAssets: 18200,
    shortTermLiabilities: 9800,
    longTermLiabilities: 5600,
    debtToEquity: 24.5,
    debtToEquity5yAgo: 28.1,
    cash: 8400,
    totalDebt: 6200,
    ebit: 7800,
    interestExpense: 420,
    operatingCashFlow: 6900,
    debtSeries: [
      { year: "2020", debt: 7800, equity: 24200, cash: 5600 },
      { year: "2021", debt: 7200, equity: 26800, cash: 6200 },
      { year: "2022", debt: 6800, equity: 29400, cash: 7100 },
      { year: "2023", debt: 6500, equity: 31200, cash: 7800 },
      { year: "2024", debt: 6200, equity: 33800, cash: 8400 },
    ],
  },
  dividendData: {
    currentYield: 2.3,
    marketMedianYield: 4.8,
    payoutRatio: 44,
    yearsWithoutInterruption: 28,
    cagr5y: 14.2,
    avgPayout5y: 42.5,
    dpaSeries: [
      { year: "2020", dpa: 0.48, payout: 38, type: "historical" },
      { year: "2021", dpa: 0.56, payout: 40, type: "historical" },
      { year: "2022", dpa: 0.68, payout: 43, type: "historical" },
      { year: "2023", dpa: 0.74, payout: 45, type: "historical" },
      { year: "2024", dpa: 0.82, payout: 44, type: "historical" },
      { year: "2025", dpa: 0.92, payout: 43, type: "forecast" },
      { year: "2026", dpa: 1.04, payout: 42, type: "forecast" },
    ],
  },
};

const valeEnriched: CompareEnrichedCompany = {
  ...vale,
  price: 58.92,
  change1d: -0.87,
  snowflake: [
    { dimension: "value", label: "Valor", score: 5, normalized: 83 },
    { dimension: "future", label: "Futuro", score: 2, normalized: 33 },
    { dimension: "past", label: "Passado", score: 3, normalized: 50 },
    { dimension: "health", label: "Saude", score: 4, normalized: 67 },
    { dimension: "dividend", label: "Dividendo", score: 5, normalized: 83 },
  ],
  valuation: {
    fairValue: 82.40,
    currentPrice: 58.92,
    discountPercent: 28.5,
    model: "2-Stage FCF",
    pe: 6.8,
    peIndustry: 9.2,
    evEbitda: 4.1,
    pvp: 1.2,
  },
  priceScenarios: [
    { key: "conservador", label: "Conservador", value: 64.50, gapPercent: 9.5 },
    { key: "base", label: "Base", value: 82.40, gapPercent: 39.9 },
    { key: "otimista", label: "Otimista", value: 98.20, gapPercent: 66.7 },
  ],
  growthData: {
    earningsGrowth: 4.8,
    revenueGrowth: 3.2,
    industryEarningsGrowth: 8.5,
    marketEarningsGrowth: 10.8,
    epsSeries: [
      { year: "2022", value: 8.42, type: "historical" },
      { year: "2023", value: 7.18, type: "historical" },
      { year: "2024", value: 6.82, type: "historical" },
      { year: "2025", value: 7.14, type: "forecast" },
      { year: "2026", value: 7.48, type: "forecast" },
      { year: "2027", value: 7.84, type: "forecast" },
    ],
    revenueSeries: [
      { year: "2022", value: 198400, type: "historical" },
      { year: "2023", value: 178200, type: "historical" },
      { year: "2024", value: 168500, type: "historical" },
      { year: "2025", value: 172400, type: "forecast" },
      { year: "2026", value: 178100, type: "forecast" },
      { year: "2027", value: 184200, type: "forecast" },
    ],
  },
  pastData: {
    earningsGrowthRate: -8.2,
    revenueGrowthRate: -5.4,
    roe: 18.6,
    roce: 14.2,
    netMargin: 14.1,
    grossMargin: 42.8,
    operatingMargin: 23.4,
    revenueSeries: [
      { year: "2020", value: 208600 },
      { year: "2021", value: 293800 },
      { year: "2022", value: 198400 },
      { year: "2023", value: 178200 },
      { year: "2024", value: 168500 },
    ],
    earningsSeries: [
      { year: "2020", value: 26400 },
      { year: "2021", value: 121500 },
      { year: "2022", value: 42800 },
      { year: "2023", value: 32600 },
      { year: "2024", value: 23700 },
    ],
    marginSeries: [
      { year: "2020", gross: 48.2, operating: 32.1, net: 12.7 },
      { year: "2021", gross: 55.8, operating: 44.2, net: 41.4 },
      { year: "2022", gross: 44.6, operating: 28.4, net: 21.6 },
      { year: "2023", gross: 43.2, operating: 25.8, net: 18.3 },
      { year: "2024", gross: 42.8, operating: 23.4, net: 14.1 },
    ],
    roeSeries: [
      { year: "2020", value: 12.4 }, { year: "2021", value: 42.8 },
      { year: "2022", value: 24.2 }, { year: "2023", value: 20.1 },
      { year: "2024", value: 18.6 },
    ],
    roceSeries: [
      { year: "2020", value: 10.8 }, { year: "2021", value: 38.2 },
      { year: "2022", value: 20.4 }, { year: "2023", value: 16.8 },
      { year: "2024", value: 14.2 },
    ],
  },
  healthData: {
    shortTermAssets: 62400,
    shortTermLiabilities: 48200,
    longTermLiabilities: 82400,
    debtToEquity: 62.8,
    debtToEquity5yAgo: 48.2,
    cash: 28400,
    totalDebt: 68200,
    ebit: 42800,
    interestExpense: 8200,
    operatingCashFlow: 38400,
    debtSeries: [
      { year: "2020", debt: 52800, equity: 124200, cash: 42600 },
      { year: "2021", debt: 48200, equity: 168800, cash: 58200 },
      { year: "2022", debt: 54800, equity: 142400, cash: 38100 },
      { year: "2023", debt: 62400, equity: 128200, cash: 32800 },
      { year: "2024", debt: 68200, equity: 108600, cash: 28400 },
    ],
  },
  dividendData: {
    currentYield: 7.2,
    marketMedianYield: 4.8,
    payoutRatio: 52,
    yearsWithoutInterruption: 12,
    cagr5y: 8.4,
    avgPayout5y: 48.2,
    dpaSeries: [
      { year: "2020", dpa: 2.18, payout: 42, type: "historical" },
      { year: "2021", dpa: 8.24, payout: 68, type: "historical" },
      { year: "2022", dpa: 4.12, payout: 48, type: "historical" },
      { year: "2023", dpa: 3.86, payout: 50, type: "historical" },
      { year: "2024", dpa: 4.24, payout: 52, type: "historical" },
      { year: "2025", dpa: 4.48, payout: 50, type: "forecast" },
      { year: "2026", dpa: 4.72, payout: 48, type: "forecast" },
    ],
  },
};

const itubEnriched: CompareEnrichedCompany = {
  ...itub,
  price: 34.82,
  change1d: 0.42,
  snowflake: [
    { dimension: "value", label: "Valor", score: 3, normalized: 50 },
    { dimension: "future", label: "Futuro", score: 3, normalized: 50 },
    { dimension: "past", label: "Passado", score: 5, normalized: 83 },
    { dimension: "health", label: "Saude", score: 4, normalized: 67 },
    { dimension: "dividend", label: "Dividendo", score: 4, normalized: 67 },
  ],
  valuation: {
    fairValue: 38.20,
    currentPrice: 34.82,
    discountPercent: 8.8,
    model: "Excess Returns",
    pe: 8.2,
    peIndustry: 9.8,
    evEbitda: 0,
    pvp: 1.8,
  },
  priceScenarios: [
    { key: "conservador", label: "Conservador", value: 32.40, gapPercent: -7.0 },
    { key: "base", label: "Base", value: 38.20, gapPercent: 9.7 },
    { key: "otimista", label: "Otimista", value: 44.80, gapPercent: 28.7 },
  ],
  growthData: {
    earningsGrowth: 11.2,
    revenueGrowth: 8.4,
    industryEarningsGrowth: 10.5,
    marketEarningsGrowth: 10.8,
    epsSeries: [
      { year: "2022", value: 3.12, type: "historical" },
      { year: "2023", value: 3.48, type: "historical" },
      { year: "2024", value: 3.82, type: "historical" },
      { year: "2025", value: 4.12, type: "forecast" },
      { year: "2026", value: 4.52, type: "forecast" },
      { year: "2027", value: 4.98, type: "forecast" },
    ],
    revenueSeries: [
      { year: "2022", value: 142800, type: "historical" },
      { year: "2023", value: 156200, type: "historical" },
      { year: "2024", value: 168400, type: "historical" },
      { year: "2025", value: 182400, type: "forecast" },
      { year: "2026", value: 198200, type: "forecast" },
      { year: "2027", value: 214800, type: "forecast" },
    ],
  },
  pastData: {
    earningsGrowthRate: 16.8,
    revenueGrowthRate: 12.4,
    roe: 21.4,
    roce: 0,
    netMargin: 24.8,
    grossMargin: 0,
    operatingMargin: 0,
    revenueSeries: [
      { year: "2020", value: 112400 }, { year: "2021", value: 124800 },
      { year: "2022", value: 142800 }, { year: "2023", value: 156200 },
      { year: "2024", value: 168400 },
    ],
    earningsSeries: [
      { year: "2020", value: 18200 }, { year: "2021", value: 22400 },
      { year: "2022", value: 28600 }, { year: "2023", value: 32800 },
      { year: "2024", value: 38400 },
    ],
    marginSeries: [],
    roeSeries: [
      { year: "2020", value: 16.8 }, { year: "2021", value: 18.2 },
      { year: "2022", value: 19.8 }, { year: "2023", value: 20.6 },
      { year: "2024", value: 21.4 },
    ],
    roceSeries: [],
  },
  healthData: {
    shortTermAssets: 0, shortTermLiabilities: 0, longTermLiabilities: 0,
    debtToEquity: 0, debtToEquity5yAgo: 0,
    cash: 0, totalDebt: 0, ebit: 0, interestExpense: 0, operatingCashFlow: 0,
    debtSeries: [],
  },
  dividendData: {
    currentYield: 5.4,
    marketMedianYield: 4.8,
    payoutRatio: 38,
    yearsWithoutInterruption: 22,
    cagr5y: 18.2,
    avgPayout5y: 36.8,
    dpaSeries: [
      { year: "2020", dpa: 0.82, payout: 32, type: "historical" },
      { year: "2021", dpa: 1.04, payout: 34, type: "historical" },
      { year: "2022", dpa: 1.28, payout: 36, type: "historical" },
      { year: "2023", dpa: 1.48, payout: 37, type: "historical" },
      { year: "2024", dpa: 1.88, payout: 38, type: "historical" },
      { year: "2025", dpa: 2.12, payout: 38, type: "forecast" },
      { year: "2026", dpa: 2.38, payout: 37, type: "forecast" },
    ],
  },
};

export const enrichedCompanies: CompareEnrichedCompany[] = [wegEnriched, valeEnriched, itubEnriched];

export const events: CompareEventItem[] = [
  {
    id: "1",
    ticker: "VALE3",
    date: "24/01/2026",
    type: "Fato relevante",
    summary: "Atualizacao de capex com pressao de caixa no curto prazo.",
    impact: "CaixaFCF",
    source: mkSource(
      "B3",
      "Fato relevante 24-01",
      "24/01/2026",
      "https://www.b3.com.br/",
    ),
  },
  {
    id: "2",
    ticker: "WEGE3",
    date: "30/01/2026",
    type: "Resultado",
    summary: "Resultado trimestral com margem operacional estavel.",
    impact: "Margens",
    source: mkSource("RI", "Release 4T25", "30/01/2026", "https://ri.weg.net/"),
  },
  {
    id: "3",
    ticker: "VALE3",
    date: "17/12/2025",
    type: "Emissao",
    summary: "Captacao para refinanciamento de curto prazo.",
    impact: "Divida",
    source: mkSource(
      "CVM",
      "Comunicado de emissao",
      "17/12/2025",
      "https://www.cvm.gov.br/",
    ),
  },
];

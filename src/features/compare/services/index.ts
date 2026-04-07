/**
 * Compare service.
 *
 * Responsabilidades:
 *  1. Dados mock (companies, events)
 *  2. Constantes de domínio (PILLARS, PILLAR_LABEL, RANGES, pillarCopy)
 *  3. Funções puras de formatação, cálculo e derivação
 *  4. Fetch de dados reais via API de análise
 *
 * Independente de React — sem imports de hooks ou JSX.
 */

import { API_BASE_URL } from "@/src/lib/api-base";
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
  CompareDimensionKey,
  CompareDimensionReading,
  CompareDimensionReadings,
  CompareDimensionCheck,
  CompareDimensionChecks,
  CompareSectionCriteriaItem,
  CompareBalanceSheet,
  CompareDiagnosis,
  CompareSummary,
  CompareNarrative,
  CompareNarrativeBullet,
  CompareNarrativeTone,
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
  { key: "1m",     label: "1M",   years: null, months: 1  },
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

// ─── Helpers para gerar Reading/Check/Criteria/Balance/Diagnosis defaults ────

function badgeFromScore(dim: CompareDimensionKey, score: number): string {
  if (dim === "value") {
    if (score >= 5) return "ATRATIVO";
    if (score >= 4) return "DESCONTO";
    if (score >= 2) return "NEUTRO";
    return "PREMIO";
  }
  if (score >= 5) return "FORTE";
  if (score >= 4) return "BOM";
  if (score >= 2) return "MODERADO";
  return "FRACO";
}

function headlineFromScore(dim: CompareDimensionKey, score: number): { headline: string; subtitle: string } {
  const strong = score >= 5;
  const ok = score >= 3;
  switch (dim) {
    case "value":
      return strong
        ? { headline: "Negociado abaixo do valor justo estimado", subtitle: "Multiplos atrativos vs setor" }
        : ok
        ? { headline: "Valuation proximo do justo", subtitle: "Multiplos alinhados com a media" }
        : { headline: "Negociado acima do valor justo", subtitle: "Multiplos esticados vs setor" };
    case "future":
      return strong
        ? { headline: "Crescimento projetado robusto", subtitle: "Projecao acima da media setorial" }
        : ok
        ? { headline: "Crescimento projetado moderado", subtitle: "Em linha com setor" }
        : { headline: "Crescimento projetado fraco", subtitle: "Abaixo da media setorial" };
    case "past":
      return strong
        ? { headline: "Historico solido de crescimento", subtitle: "Lucros e margens consistentes" }
        : ok
        ? { headline: "Historico estavel", subtitle: "Crescimento moderado" }
        : { headline: "Historico irregular", subtitle: "Volatilidade nos resultados" };
    case "health":
      return strong
        ? { headline: "Balanco saudavel e bem capitalizado", subtitle: "Cobertura de juros confortavel" }
        : ok
        ? { headline: "Balanco em nivel adequado", subtitle: "Alavancagem controlada" }
        : { headline: "Balanco pressionado", subtitle: "Alavancagem elevada" };
    case "dividend":
      return strong
        ? { headline: "Pagador consistente de dividendos", subtitle: "Yield acima da media" }
        : ok
        ? { headline: "Distribuicao moderada", subtitle: "Yield em linha com mercado" }
        : { headline: "Dividendos limitados", subtitle: "Distribuicao abaixo do mercado" };
  }
}

function defaultReading(dim: CompareDimensionKey, score: number): CompareDimensionReading {
  const { headline, subtitle } = headlineFromScore(dim, score);
  return {
    headline,
    subtitle,
    badge: badgeFromScore(dim, score),
    evidences: [],
    limitations: [],
    synthesis: undefined,
  };
}

function defaultDimensionCheck(
  dim: CompareDimensionKey,
  score: number,
): CompareDimensionCheck {
  const total = 6;
  const passed = Math.max(0, Math.min(total, Math.round(score)));
  const labels: Record<CompareDimensionKey, string[]> = {
    value: [
      "P/L abaixo da industria",
      "P/L abaixo do mercado",
      "P/VP razoavel",
      "PEG abaixo de 1",
      "DCF mostra desconto",
      "EV/EBITDA atrativo",
    ],
    future: [
      "Lucro projetado em alta",
      "Receita projetada em alta",
      "Crescimento acima do setor",
      "Crescimento acima do mercado",
      "ROE futuro forte",
      "Cobertura de analistas adequada",
    ],
    past: [
      "Lucros crescentes",
      "Receita crescente",
      "Margens estaveis",
      "ROE saudavel",
      "ROCE saudavel",
      "Lucros de qualidade",
    ],
    health: [
      "Ativos CP cobrem passivos CP",
      "Ativos CP cobrem passivos LP",
      "Divida em reducao",
      "Cobertura de juros confortavel",
      "Divida bem coberta por FCO",
      "D/E moderado",
    ],
    dividend: [
      "Yield acima do mercado",
      "Pagamentos sem interrupcao",
      "Pagamentos crescentes",
      "Payout sustentavel",
      "Cash payout sustentavel",
      "Buyback adicional",
    ],
  };
  const items = labels[dim].map((label, i) => ({
    label,
    passes: i < passed,
    observed: i < passed ? "OK" : "—",
    reference: "",
    microText: "",
  }));
  return { dimension: dim, passed, total, items };
}

function defaultReadings(
  snowflake: { dimension: string; score: number }[],
): CompareDimensionReadings {
  const score = (d: CompareDimensionKey) =>
    snowflake.find((s) => s.dimension === d)?.score ?? 3;
  return {
    value: defaultReading("value", score("value")),
    future: defaultReading("future", score("future")),
    past: defaultReading("past", score("past")),
    health: defaultReading("health", score("health")),
    dividend: defaultReading("dividend", score("dividend")),
  };
}

function defaultDimensionChecks(
  snowflake: { dimension: string; score: number }[],
): CompareDimensionChecks {
  const score = (d: CompareDimensionKey) =>
    snowflake.find((s) => s.dimension === d)?.score ?? 3;
  return {
    value: defaultDimensionCheck("value", score("value")),
    future: defaultDimensionCheck("future", score("future")),
    past: defaultDimensionCheck("past", score("past")),
    health: defaultDimensionCheck("health", score("health")),
    dividend: defaultDimensionCheck("dividend", score("dividend")),
  };
}

function defaultBalanceSheetFromHealth(
  shortTermAssets: number,
  shortTermLiabilities: number,
  longTermAssets: number,
  longTermLiabilities: number,
  cash: number,
  totalDebt: number,
  equity: number,
): CompareBalanceSheet {
  const cashVal = Math.max(0, cash);
  const receivables = Math.max(0, shortTermAssets * 0.45);
  const inventory = Math.max(0, shortTermAssets * 0.25);
  const physical = Math.max(0, longTermAssets * 0.6);
  const longTermOther = Math.max(0, longTermAssets * 0.4);
  const totalAssets =
    cashVal + receivables + inventory + physical + longTermOther || 1;

  const payables = Math.max(0, shortTermLiabilities * 0.6);
  const debt = Math.max(0, totalDebt);
  const otherLiab = Math.max(0, longTermLiabilities * 0.4);
  const equityVal = Math.max(0, equity);
  const totalLiab = payables + debt + otherLiab + equityVal || 1;

  return {
    assets: [
      { key: "cash", label: "Caixa & CP", value: cashVal, percent: cashVal / totalAssets },
      { key: "receivables", label: "Recebiveis", value: receivables, percent: receivables / totalAssets },
      { key: "inventory", label: "Estoques", value: inventory, percent: inventory / totalAssets },
      { key: "physical", label: "Fisicos", value: physical, percent: physical / totalAssets },
      { key: "longTermOther", label: "LP & Outros", value: longTermOther, percent: longTermOther / totalAssets },
    ],
    liabilities: [
      { key: "payables", label: "Contas a Pagar", value: payables, percent: payables / totalLiab },
      { key: "debt", label: "Divida", value: debt, percent: debt / totalLiab },
      { key: "otherLiab", label: "Outros Passivos", value: otherLiab, percent: otherLiab / totalLiab },
      { key: "equity", label: "PL", value: equityVal, percent: equityVal / totalLiab },
    ],
  };
}

function defaultDiagnosisFromRatio(
  ratio: number,
  goodMax: number,
  warnMax: number,
  goodText: string,
  warnText: string,
  badText: string,
): CompareDiagnosis {
  if (ratio <= goodMax) return { status: "COVERED", text: goodText };
  if (ratio <= warnMax) return { status: "PRESSURED", text: warnText };
  return { status: "NOT_COVERED", text: badText };
}

function defaultSectionCriteria(
  pairs: { label: string; passes: boolean; statement: string }[],
): CompareSectionCriteriaItem[] {
  return pairs.map((p) => ({ ...p }));
}

type EnrichedNoExtras = Omit<CompareEnrichedCompany, "readings" | "dimensionChecks">;

function withCompareDefaults(c: EnrichedNoExtras): CompareEnrichedCompany {
  // Auto-generate balance sheet from health data if not provided
  const healthAny = c.healthData as any;
  const balanceSheet: CompareBalanceSheet =
    healthAny.balanceSheet ??
    defaultBalanceSheetFromHealth(
      c.healthData.shortTermAssets ?? 0,
      c.healthData.shortTermLiabilities ?? 0,
      c.healthData.longTermAssets ?? 0,
      c.healthData.longTermLiabilities ?? 0,
      c.healthData.cash ?? 0,
      c.healthData.totalDebt ?? 0,
      c.healthData.equity ?? 0,
    );

  // Auto-generate diagnoses for dividend coverage
  const dividendAny = c.dividendData as any;
  const payoutRatioDiagnosis: CompareDiagnosis =
    dividendAny.payoutRatioDiagnosis ??
    defaultDiagnosisFromRatio(
      c.dividendData.payoutRatio ?? 0,
      60,
      85,
      "Payout coberto pelos lucros",
      "Payout pressionado",
      "Payout acima dos lucros",
    );
  const cashPayoutRatioDiagnosis: CompareDiagnosis =
    dividendAny.cashPayoutRatioDiagnosis ??
    defaultDiagnosisFromRatio(
      c.dividendData.cashPayoutRatio ?? 0,
      70,
      95,
      "Cash payout coberto pelo FCO",
      "Cash payout pressionado",
      "Cash payout acima do FCO",
    );

  // Interest coverage diagnosis
  const interestCoverage =
    (c.healthData.interestExpense ?? 0) > 0
      ? (c.healthData.ebit ?? 0) / (c.healthData.interestExpense ?? 1)
      : 99;
  const interestCoverageDiagnosis: CompareDiagnosis =
    healthAny.interestCoverageDiagnosis ??
    (interestCoverage >= 5
      ? { status: "OK", text: `Cobertura de ${interestCoverage.toFixed(1)}x` }
      : interestCoverage >= 2
      ? { status: "WARN", text: `Cobertura ajustada de ${interestCoverage.toFixed(1)}x` }
      : { status: "RISK", text: `Cobertura fraca de ${interestCoverage.toFixed(1)}x` });

  // Default section criteria stubs (used by Phase 4 islands)
  const score = (d: CompareDimensionKey) =>
    c.snowflake.find((s) => s.dimension === d)?.score ?? 3;
  const futureScore = score("future");
  const pastScore = score("past");
  const healthScore = score("health");

  const analystForecastCriteria =
    (c.growthData as any).analystForecastCriteria ??
    defaultSectionCriteria([
      { label: "Lucro projetado em alta", passes: futureScore >= 3, statement: `Projecao de lucro ${futureScore >= 3 ? "positiva" : "negativa"}` },
      { label: "Receita projetada em alta", passes: futureScore >= 3, statement: `Projecao de receita ${futureScore >= 3 ? "positiva" : "negativa"}` },
      { label: "Crescimento acima do setor", passes: futureScore >= 4, statement: "Comparacao vs media setorial" },
      { label: "ROE futuro forte", passes: futureScore >= 4, statement: "ROE projetado vs setor" },
      { label: "Cobertura de analistas", passes: true, statement: "Cobertura disponivel" },
    ]);

  const earningsQualityCriteria =
    (c.pastData as any).earningsQualityCriteria ??
    defaultSectionCriteria([
      { label: "Lucros de qualidade", passes: pastScore >= 3, statement: "Lucros sustentados por geracao de caixa" },
      { label: "Margem crescente", passes: pastScore >= 4, statement: "Trajetoria de margem" },
    ]);

  const fcfCriteria =
    (c.pastData as any).fcfCriteria ??
    defaultSectionCriteria([
      { label: "FCL positivo", passes: ((c.pastData.cashFlowWaterfall?.freeCashFlow ?? 0) > 0), statement: "Fluxo de caixa livre" },
      { label: "FCL vs Lucro", passes: pastScore >= 3, statement: "Conversao de lucro em caixa" },
    ]);

  const growthCriteria =
    (c.pastData as any).growthCriteria ??
    defaultSectionCriteria([
      { label: "Lucros vs setor", passes: (c.pastData.earningsGrowthRate ?? 0) > (c.pastData.industryGrowth ?? 0), statement: "Crescimento de lucros vs setor" },
      { label: "Alto crescimento", passes: (c.pastData.earningsGrowthRate ?? 0) > 10, statement: "Acima do limite de 10%" },
      { label: "Receita vs setor", passes: (c.pastData.revenueGrowthRate ?? 0) > (c.pastData.industryGrowth ?? 0), statement: "Crescimento de receita vs setor" },
    ]);

  const positionCriteria =
    (c.healthData as any).positionCriteria ??
    defaultSectionCriteria([
      { label: "Passivos CP cobertos", passes: (c.healthData.shortTermAssets ?? 0) > (c.healthData.shortTermLiabilities ?? 0), statement: "Ativos CP vs Passivos CP" },
      { label: "Passivos LP cobertos", passes: (c.healthData.shortTermAssets ?? 0) > (c.healthData.longTermLiabilities ?? 0), statement: "Ativos CP vs Passivos LP" },
    ]);

  const debtCriteria =
    (c.healthData as any).debtCriteria ??
    defaultSectionCriteria([
      { label: "Nivel de endividamento", passes: healthScore >= 3, statement: `D/E em ${(c.healthData.debtToEquity ?? 0).toFixed(0)}%` },
      { label: "Reducao da divida", passes: (c.healthData.debtToEquity ?? 0) < (c.healthData.debtToEquity5yAgo ?? 0), statement: "Trajetoria 5 anos" },
      { label: "Cobertura da divida", passes: ((c.healthData.operatingCashFlow ?? 0) / Math.max(1, c.healthData.totalDebt ?? 1)) > 0.2, statement: "FCO vs Divida total" },
      { label: "Cobertura de juros", passes: interestCoverage >= 5, statement: `${interestCoverage.toFixed(1)}x EBIT/juros` },
    ]);

  return {
    ...c,
    healthData: {
      ...c.healthData,
      balanceSheet,
      interestCoverageDiagnosis,
      positionCriteria,
      debtCriteria,
    },
    pastData: {
      ...c.pastData,
      balanceSheet:
        (c.pastData as any).balanceSheet ?? balanceSheet,
      earningsQualityCriteria,
      fcfCriteria,
      growthCriteria,
    },
    growthData: {
      ...c.growthData,
      analystForecastCriteria,
    },
    dividendData: {
      ...c.dividendData,
      payoutRatioDiagnosis,
      cashPayoutRatioDiagnosis,
    },
    readings: defaultReadings(c.snowflake),
    dimensionChecks: defaultDimensionChecks(c.snowflake),
  };
}

// ─── Enriched mock data for side-by-side islands ─────────────────────────────

const wegEnriched: CompareEnrichedCompany = withCompareDefaults({
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
    fairValue: 38.50, currentPrice: 52.34, discountPercent: -35.9, model: "2-Stage FCF",
    discountRate: 9.5, terminalGrowthRate: 3.0,
    pe: 32.1, peIndustry: 18.4, peMarket: 15.2, pegRatio: 1.76, evEbitda: 22.8, pvp: 8.9, pvpIndustry: 3.2,
  },
  priceScenarios: [
    { key: "conservador", label: "Conservador", value: 34.20, gapPercent: -34.7, wacc: 11.0, growthRate: 2.0 },
    { key: "base", label: "Base", value: 38.50, gapPercent: -26.4, wacc: 9.5, growthRate: 3.0 },
    { key: "otimista", label: "Otimista", value: 48.80, gapPercent: -6.8, wacc: 8.0, growthRate: 4.0 },
  ],
  ratioTrends: [],
  dcfSensitivity: [],
  competitors: [],
  growthData: {
    earningsGrowth: 18.2,
    revenueGrowth: 14.5,
    industryEarningsGrowth: 12.0,
    marketEarningsGrowth: 10.8,
    industryRevenueGrowth: 10.0,
    marketRevenueGrowth: 8.5,
    futureROE: 25.0,
    futureROEIndustry: 18.0,
    epsSeries: [
      { year: "2022", value: 1.12, type: "historical" },
      { year: "2023", value: 1.28, type: "historical" },
      { year: "2024", value: 1.45, type: "historical" },
      { year: "2025", value: 1.62, type: "forecast" },
      { year: "2026", value: 1.88, type: "forecast" },
      { year: "2027", value: 2.18, type: "forecast" },
    ],
    earningsSeries: [
      { year: "2022", value: 4680, type: "historical" as const },
      { year: "2023", value: 4980, type: "historical" as const },
      { year: "2024", value: 5390, type: "historical" as const },
      { year: "2025", value: 6200, type: "forecast" as const },
      { year: "2026", value: 7100, type: "forecast" as const },
    ],
    revenueSeries: [
      { year: "2022", value: 29800, type: "historical" },
      { year: "2023", value: 32500, type: "historical" },
      { year: "2024", value: 36200, type: "historical" },
      { year: "2025", value: 40800, type: "forecast" },
      { year: "2026", value: 46100, type: "forecast" },
      { year: "2027", value: 52400, type: "forecast" },
    ],
    freeCashFlowSeries: [
      { year: "2022", value: 3800, type: "historical" as const },
      { year: "2023", value: 4200, type: "historical" as const },
      { year: "2024", value: 4600, type: "historical" as const },
    ],
  },
  pastData: {
    earningsGrowthRate: 22.4,
    revenueGrowthRate: 18.1,
    industryGrowth: 12.0,
    roe: 23.2,
    roce: 19.8,
    roa: 12.4,
    industryROE: 18.0,
    industryROCE: 14.5,
    industryROA: 9.2,
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
    cashFlowWaterfall: { earnings: 5390, depreciation: 1200, stockBasedComp: 80, netWorkingCapital: -320, others: 150, freeCashFlow: 4600 },
  },
  healthData: {
    shortTermAssets: 18200,
    shortTermLiabilities: 9800,
    longTermAssets: 22000,
    longTermLiabilities: 5600,
    debtToEquity: 24.5,
    debtToEquity5yAgo: 28.1,
    cash: 8400,
    totalDebt: 6200,
    equity: 33800,
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
    debtToEquitySeries: [
      { year: "2020", value: 32.2 }, { year: "2021", value: 26.9 },
      { year: "2022", value: 23.1 }, { year: "2023", value: 20.8 },
      { year: "2024", value: 18.3 },
    ],
  },
  dividendData: {
    currentYield: 2.3,
    sectorMedianYield: 3.2,
    marketMedianYield: 4.8,
    marketYield25th: 2.5,
    marketYield75th: 7.2,
    marketPercentile: 22,
    payoutRatio: 44,
    cashPayoutRatio: 40,
    yearsWithoutInterruption: 28,
    cagr5y: 14.2,
    avgPayout5y: 42.5,
    buybackYield: 0.8,
    totalShareholderReturn: 3.1,
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
});

const valeEnriched: CompareEnrichedCompany = withCompareDefaults({
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
    fairValue: 82.40, currentPrice: 58.92, discountPercent: 28.5, model: "2-Stage FCF",
    discountRate: 10.0, terminalGrowthRate: 2.5,
    pe: 6.8, peIndustry: 9.2, peMarket: 15.2, pegRatio: 1.42, evEbitda: 4.1, pvp: 1.2, pvpIndustry: 1.8,
  },
  priceScenarios: [
    { key: "conservador", label: "Conservador", value: 64.50, gapPercent: 9.5, wacc: 12.0, growthRate: 1.5 },
    { key: "base", label: "Base", value: 82.40, gapPercent: 39.9, wacc: 10.0, growthRate: 2.5 },
    { key: "otimista", label: "Otimista", value: 98.20, gapPercent: 66.7, wacc: 8.5, growthRate: 3.5 },
  ],
  ratioTrends: [],
  dcfSensitivity: [],
  competitors: [],
  growthData: {
    earningsGrowth: 4.8,
    revenueGrowth: 3.2,
    industryEarningsGrowth: 8.5,
    marketEarningsGrowth: 10.8,
    industryRevenueGrowth: 6.0,
    marketRevenueGrowth: 8.5,
    futureROE: 16.0,
    futureROEIndustry: 14.0,
    epsSeries: [
      { year: "2022", value: 8.42, type: "historical" },
      { year: "2023", value: 7.18, type: "historical" },
      { year: "2024", value: 6.82, type: "historical" },
      { year: "2025", value: 7.14, type: "forecast" },
      { year: "2026", value: 7.48, type: "forecast" },
      { year: "2027", value: 7.84, type: "forecast" },
    ],
    earningsSeries: [
      { year: "2022", value: 42800, type: "historical" as const },
      { year: "2023", value: 32600, type: "historical" as const },
      { year: "2024", value: 23700, type: "historical" as const },
      { year: "2025", value: 25200, type: "forecast" as const },
    ],
    revenueSeries: [
      { year: "2022", value: 198400, type: "historical" },
      { year: "2023", value: 178200, type: "historical" },
      { year: "2024", value: 168500, type: "historical" },
      { year: "2025", value: 172400, type: "forecast" },
      { year: "2026", value: 178100, type: "forecast" },
      { year: "2027", value: 184200, type: "forecast" },
    ],
    freeCashFlowSeries: [
      { year: "2022", value: 28000, type: "historical" as const },
      { year: "2023", value: 22000, type: "historical" as const },
      { year: "2024", value: 18000, type: "historical" as const },
    ],
  },
  pastData: {
    earningsGrowthRate: -8.2,
    revenueGrowthRate: -5.4,
    industryGrowth: 6.0,
    roe: 18.6,
    roce: 14.2,
    roa: 8.4,
    industryROE: 14.0,
    industryROCE: 11.0,
    industryROA: 7.2,
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
    cashFlowWaterfall: { earnings: 23700, depreciation: 8200, stockBasedComp: 0, netWorkingCapital: -2800, others: -1100, freeCashFlow: 18000 },
  },
  healthData: {
    shortTermAssets: 62400,
    shortTermLiabilities: 48200,
    longTermAssets: 180000,
    longTermLiabilities: 82400,
    debtToEquity: 62.8,
    debtToEquity5yAgo: 48.2,
    cash: 28400,
    totalDebt: 68200,
    equity: 108600,
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
    debtToEquitySeries: [
      { year: "2020", value: 42.5 }, { year: "2021", value: 28.6 },
      { year: "2022", value: 38.5 }, { year: "2023", value: 48.7 },
      { year: "2024", value: 62.8 },
    ],
  },
  dividendData: {
    currentYield: 7.2,
    sectorMedianYield: 5.5,
    marketMedianYield: 4.8,
    marketYield25th: 2.5,
    marketYield75th: 7.2,
    marketPercentile: 78,
    payoutRatio: 52,
    cashPayoutRatio: 48,
    yearsWithoutInterruption: 12,
    cagr5y: 8.4,
    avgPayout5y: 48.2,
    buybackYield: 2.4,
    totalShareholderReturn: 9.6,
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
});

const itubEnriched: CompareEnrichedCompany = withCompareDefaults({
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
    fairValue: 38.20, currentPrice: 34.82, discountPercent: 8.8, model: "Excess Returns",
    discountRate: 12.0, terminalGrowthRate: 3.0,
    pe: 8.2, peIndustry: 9.8, peMarket: 15.2, pegRatio: 0.73, evEbitda: 0, pvp: 1.8, pvpIndustry: 1.5,
  },
  priceScenarios: [
    { key: "conservador", label: "Conservador", value: 32.40, gapPercent: -7.0, wacc: 14.0, growthRate: 2.0 },
    { key: "base", label: "Base", value: 38.20, gapPercent: 9.7, wacc: 12.0, growthRate: 3.0 },
    { key: "otimista", label: "Otimista", value: 44.80, gapPercent: 28.7, wacc: 10.0, growthRate: 4.0 },
  ],
  ratioTrends: [],
  dcfSensitivity: [],
  competitors: [],
  growthData: {
    earningsGrowth: 11.2,
    revenueGrowth: 8.4,
    industryEarningsGrowth: 10.5,
    marketEarningsGrowth: 10.8,
    industryRevenueGrowth: 7.0,
    marketRevenueGrowth: 8.5,
    futureROE: 22.0,
    futureROEIndustry: 16.0,
    epsSeries: [
      { year: "2022", value: 3.12, type: "historical" },
      { year: "2023", value: 3.48, type: "historical" },
      { year: "2024", value: 3.82, type: "historical" },
      { year: "2025", value: 4.12, type: "forecast" },
      { year: "2026", value: 4.52, type: "forecast" },
      { year: "2027", value: 4.98, type: "forecast" },
    ],
    earningsSeries: [
      { year: "2022", value: 28600, type: "historical" as const },
      { year: "2023", value: 32800, type: "historical" as const },
      { year: "2024", value: 38400, type: "historical" as const },
      { year: "2025", value: 42000, type: "forecast" as const },
    ],
    revenueSeries: [
      { year: "2022", value: 142800, type: "historical" },
      { year: "2023", value: 156200, type: "historical" },
      { year: "2024", value: 168400, type: "historical" },
      { year: "2025", value: 182400, type: "forecast" },
      { year: "2026", value: 198200, type: "forecast" },
      { year: "2027", value: 214800, type: "forecast" },
    ],
    freeCashFlowSeries: [],
  },
  pastData: {
    earningsGrowthRate: 16.8,
    revenueGrowthRate: 12.4,
    industryGrowth: 10.5,
    roe: 21.4,
    roce: 0,
    roa: 1.8,
    industryROE: 16.0,
    industryROCE: 0,
    industryROA: 1.2,
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
    cashFlowWaterfall: null,
  },
  healthData: {
    shortTermAssets: 0, shortTermLiabilities: 0, longTermAssets: 0, longTermLiabilities: 0,
    debtToEquity: 0, debtToEquity5yAgo: 0,
    cash: 0, totalDebt: 0, equity: 0, ebit: 0, interestExpense: 0, operatingCashFlow: 0,
    debtSeries: [],
    debtToEquitySeries: [],
  },
  dividendData: {
    currentYield: 5.4,
    sectorMedianYield: 4.2,
    marketMedianYield: 4.8,
    marketYield25th: 2.5,
    marketYield75th: 7.2,
    marketPercentile: 58,
    payoutRatio: 38,
    cashPayoutRatio: 35,
    yearsWithoutInterruption: 22,
    cagr5y: 18.2,
    avgPayout5y: 36.8,
    buybackYield: 1.2,
    totalShareholderReturn: 6.6,
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
});

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

// ─── Fetch real data from analysis API ──────────────────────────────────────

/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * Maps a raw AnalysisResponse JSON to CompareEnrichedCompany.
 */
function mapRawReading(raw: any): CompareDimensionReading | undefined {
  if (!raw) return undefined;
  return {
    headline: raw.headline ?? "",
    subtitle: raw.subtitle ?? "",
    badge: raw.badge ?? "",
    evidences: ((raw.evidences ?? []) as any[]).map((e: any) => ({
      observed: e.observed ?? "",
      reference: e.reference ?? "",
      criterion: e.criterion ?? "",
      microText: e.microText ?? "",
    })),
    limitations: ((raw.limitations ?? []) as any[]).map((e: any) => ({
      observed: e.observed ?? "",
      reference: e.reference ?? "",
      criterion: e.criterion ?? "",
      microText: e.microText ?? "",
    })),
    synthesis: raw.synthesis ?? undefined,
  };
}

function mapAnalysisToEnriched(raw: any, ticker: string): CompareEnrichedCompany {
  const company = raw.company ?? {};
  const snowflakeRaw: any[] = raw.snowflake ?? [];
  const valuation = raw.valuation ?? {};
  const relVal = raw.relativeValuation ?? {};
  const growth = raw.growth ?? {};
  const past = raw.pastPerformance ?? {};
  const health = raw.health ?? {};
  const dividend = raw.dividend ?? {};
  const priceHistory = raw.priceHistory ?? {};
  const priceSeries: { date: string; price: number }[] =
    priceHistory.series ?? [];

  const currentPrice =
    valuation.currentPrice ??
    (priceSeries.length > 0
      ? priceSeries[priceSeries.length - 1].price
      : 0);
  const prevPrice =
    priceSeries.length > 1
      ? priceSeries[priceSeries.length - 2].price
      : currentPrice;
  const change1d =
    prevPrice !== 0 ? ((currentPrice - prevPrice) / prevPrice) * 100 : 0;

  type ComparePillarData = CompareCompany["pillars"][ComparePillar];

  const stubPillarData = (score: number): ComparePillarData => ({
    score,
    status: score >= 7 ? "Saudavel" : score >= 4 ? "Atencao" : "Risco",
    thresholdLabel: "Maior melhor",
    domain: [0, 10] as [number, number],
    bands: {
      safe: [7, 10] as [number, number],
      warning: [4, 7] as [number, number],
      risk: [0, 4] as [number, number],
    },
    series: [],
    metrics: [],
  });

  const dimScore = (dim: string): number => {
    const found = snowflakeRaw.find((s: any) => s.dimension === dim);
    return found ? (found.score ?? 0) : 0;
  };

  const pillars: Record<ComparePillar, ComparePillarData> = {
    Divida: stubPillarData(dimScore("health")),
    CaixaFCF: stubPillarData(dimScore("health")),
    Margens: stubPillarData(dimScore("past")),
    Retorno: stubPillarData(dimScore("past")),
    Proventos: stubPillarData(dimScore("dividend")),
  };

  const marginSeries: any[] = raw.marginSeries ?? [];

  const base: EnrichedNoExtras = {
    ticker: company.ticker ?? ticker.toUpperCase(),
    name: company.name ?? ticker.toUpperCase(),
    sector: company.sector ?? "",
    updatedAt: raw.generatedAt ?? new Date().toLocaleDateString("pt-BR"),
    primarySource: "CVM / B3 / RI",
    confidence: "Alta" as CompareConfidence,
    gaps: [],
    pillars,
    logo: company.logo ?? undefined,
    price: currentPrice,
    change1d,
    snowflake: snowflakeRaw.map((s: any) => ({
      dimension: s.dimension,
      label: s.displayName ?? s.dimension,
      score: s.score ?? 0,
      normalized: s.normalizedScore ?? 0,
    })),
    valuation: {
      fairValue: valuation.fairValue ?? 0,
      currentPrice,
      discountPercent: valuation.discountPercent ?? 0,
      model: valuation.model ?? "DCF",
      discountRate: valuation.discountRate ?? 0,
      terminalGrowthRate: valuation.terminalGrowthRate ?? 0,
      pe: relVal.peRatio ?? 0,
      peIndustry: relVal.peIndustry ?? 0,
      peMarket: relVal.peMarket ?? 0,
      pegRatio: relVal.pegRatio ?? 0,
      evEbitda: 0,
      pvp: relVal.pbRatio ?? 0,
      pvpIndustry: relVal.pbIndustry ?? 0,
    },
    priceScenarios: ((raw.priceScenarios ?? []) as any[]).map((s: any) => ({
      key: s.key ?? "",
      label: s.label ?? "",
      value: s.estimatedValue ?? 0,
      gapPercent: s.gapVsCurrent ?? 0,
      wacc: s.wacc ?? 0,
      growthRate: s.growthRate ?? 0,
    })),
    ratioTrends: ((raw.ratioTrends ?? []) as any[]).map((rt: any) => ({
      metric: rt.metric ?? "",
      series: ((rt.series ?? []) as any[]).map((p: any) => ({
        year: p.year ?? "",
        company: p.company ?? 0,
        industry: p.industry ?? 0,
      })),
    })),
    dcfSensitivity: ((raw.dcfSensitivity ?? []) as any[]).map((c: any) => ({
      wacc: c.wacc ?? 0,
      terminalGrowth: c.terminalGrowth ?? 0,
      fairValue: c.fairValue ?? 0,
    })),
    competitors: ((raw.competitors ?? []) as any[]).map((c: any) => ({
      ticker: c.ticker ?? "",
      name: c.name ?? "",
      pe: c.pe ?? 0,
      earningsGrowth: c.earningsGrowth ?? 0,
    })),
    growthData: {
      earningsGrowth: growth.earningsGrowthRate ?? 0,
      revenueGrowth: growth.revenueGrowthRate ?? 0,
      industryEarningsGrowth: growth.industryEarningsGrowth ?? 0,
      marketEarningsGrowth: growth.marketEarningsGrowth ?? 0,
      industryRevenueGrowth: growth.industryRevenueGrowth ?? 0,
      marketRevenueGrowth: growth.marketRevenueGrowth ?? 0,
      futureROE: growth.futureROE ?? 0,
      futureROEIndustry: growth.futureROEIndustry ?? 0,
      epsSeries: ((growth.epsCombinedSeries ?? growth.earningsSeries ?? []) as any[]).map(
        (e: any) => ({
          year: e.year ?? "",
          value: e.value ?? 0,
          type: e.type ?? "historical",
        }),
      ),
      earningsSeries: ((growth.earningsSeries ?? []) as any[]).map((e: any) => ({
        year: e.year ?? "",
        value: e.value ?? 0,
        type: e.type ?? "historical",
      })),
      revenueSeries: ((growth.revenueSeries ?? []) as any[]).map((e: any) => ({
        year: e.year ?? "",
        value: e.value ?? 0,
        type: e.type ?? "historical",
      })),
      freeCashFlowSeries: ((growth.freeCashFlowSeries ?? []) as any[]).map((e: any) => ({
        year: e.year ?? "",
        value: e.value ?? 0,
        type: e.type ?? "historical",
      })),
    },
    pastData: {
      earningsGrowthRate: past.earningsGrowthRate ?? 0,
      revenueGrowthRate: past.revenueGrowthRate ?? 0,
      industryGrowth: past.industryGrowth ?? 0,
      roe: past.currentROE ?? 0,
      roce: past.currentROCE ?? 0,
      roa: past.currentROA ?? 0,
      industryROE: past.industryROE ?? 0,
      industryROCE: past.industryROCE ?? 0,
      industryROA: past.industryROA ?? 0,
      netMargin: past.netMargin ?? 0,
      grossMargin: marginSeries.length > 0 ? marginSeries[marginSeries.length - 1].grossMargin ?? 0 : 0,
      operatingMargin: marginSeries.length > 0 ? marginSeries[marginSeries.length - 1].operatingMargin ?? 0 : 0,
      revenueSeries: ((raw.earningsRevenueSeries ?? []) as any[]).map(
        (e: any) => ({ year: e.year ?? "", value: e.revenue ?? 0 }),
      ),
      earningsSeries: ((raw.earningsRevenueSeries ?? []) as any[]).map(
        (e: any) => ({ year: e.year ?? "", value: e.earnings ?? 0 }),
      ),
      marginSeries: marginSeries.map((m: any) => ({
        year: m.year ?? "",
        gross: m.grossMargin ?? 0,
        operating: m.operatingMargin ?? 0,
        net: m.netMargin ?? 0,
      })),
      roeSeries: ((past.roeSeries ?? []) as any[]).map((e: any) => ({
        year: e.year ?? "",
        value: e.value ?? 0,
      })),
      roceSeries: ((past.roceSeries ?? []) as any[]).map((e: any) => ({
        year: e.year ?? "",
        value: e.value ?? 0,
      })),
      cashFlowWaterfall: past.cashFlowWaterfall ? {
        earnings: past.cashFlowWaterfall.earnings ?? 0,
        depreciation: past.cashFlowWaterfall.depreciation ?? 0,
        stockBasedComp: past.cashFlowWaterfall.stockBasedComp ?? 0,
        netWorkingCapital: past.cashFlowWaterfall.netWorkingCapital ?? 0,
        others: past.cashFlowWaterfall.others ?? 0,
        freeCashFlow: past.cashFlowWaterfall.freeCashFlow ?? 0,
      } : null,
    },
    healthData: {
      shortTermAssets: health.shortTermAssets ?? 0,
      shortTermLiabilities: health.shortTermLiabilities ?? 0,
      longTermAssets: health.assetsVsLiabilities?.longTermAssets ?? 0,
      longTermLiabilities: health.longTermLiabilities ?? 0,
      debtToEquity: health.debtToEquity ?? 0,
      debtToEquity5yAgo: health.debtToEquity5yAgo ?? 0,
      cash: health.cash ?? 0,
      totalDebt: health.totalDebt ?? 0,
      equity: health.equity ?? 0,
      ebit: health.ebit ?? 0,
      interestExpense: health.interestExpense ?? 0,
      operatingCashFlow: health.operatingCashFlow ?? 0,
      debtSeries: ((health.debtHistorySeries ?? []) as any[]).map(
        (e: any) => ({
          year: e.year ?? "",
          debt: e.debt ?? 0,
          equity: e.equity ?? 0,
          cash: e.cash ?? 0,
        }),
      ),
      debtToEquitySeries: ((health.debtToEquitySeries ?? []) as any[]).map(
        (e: any) => ({
          year: e.year ?? "",
          value: e.value ?? 0,
        }),
      ),
    },
    dividendData: {
      currentYield: dividend.currentYield ?? 0,
      sectorMedianYield: dividend.sectorMedianYield ?? 0,
      marketMedianYield: dividend.marketMedianYield ?? 0,
      marketYield25th: dividend.marketYield25th ?? 0,
      marketYield75th: dividend.marketYield75th ?? 0,
      marketPercentile: dividend.marketPercentile ?? 0,
      payoutRatio: dividend.payoutRatio ?? 0,
      cashPayoutRatio: dividend.cashPayoutRatio ?? 0,
      yearsWithoutInterruption: dividend.yearsWithoutInterruption ?? 0,
      cagr5y: dividend.cagr5y ?? 0,
      avgPayout5y: dividend.avgPayout5y ?? 0,
      buybackYield: dividend.buybackYield ?? 0,
      totalShareholderReturn: dividend.totalShareholderReturn ?? 0,
      dpaSeries: ((dividend.dividendQualitySeries ?? []) as any[]).map(
        (e: any) => ({
          year: e.year ?? "",
          dpa: e.dpa ?? 0,
          payout: e.payout ?? null,
          type: e.type ?? "historical",
        }),
      ),
    },
  };

  const enriched = withCompareDefaults(base);

  // Override defaults with backend-provided readings if present
  const valueReading = mapRawReading(raw.valueReading);
  const futureReading = mapRawReading(raw.futureReading);
  const pastReading = mapRawReading(raw.pastReading);
  const healthReading = mapRawReading(raw.healthReading);
  const dividendReading = mapRawReading(raw.dividendReading);
  if (valueReading) enriched.readings.value = valueReading;
  if (futureReading) enriched.readings.future = futureReading;
  if (pastReading) enriched.readings.past = pastReading;
  if (healthReading) enriched.readings.health = healthReading;
  if (dividendReading) enriched.readings.dividend = dividendReading;

  return enriched;
}

/**
 * Error class for compare endpoint failures. Carries the original status so
 * callers can branch on 400 (bad params) vs 404 (ticker not found) vs other.
 */
export class CompareApiError extends Error {
  status: number;
  tickerA: string;
  tickerB: string;
  constructor(message: string, status: number, tickerA: string, tickerB: string) {
    super(message);
    this.name = "CompareApiError";
    this.status = status;
    this.tickerA = tickerA;
    this.tickerB = tickerB;
  }
}

function normalizeCompareNarrative(raw: any): CompareNarrative | null {
  if (!raw || typeof raw !== "object") return null;
  const headline = typeof raw.headline === "string" ? raw.headline : "";
  const subtitle = typeof raw.subtitle === "string" ? raw.subtitle : "";
  const paragraphs: string[] = Array.isArray(raw.paragraphs)
    ? raw.paragraphs.filter((p: unknown): p is string => typeof p === "string" && p.length > 0)
    : [];
  const rawBullets: any[] = Array.isArray(raw.bullets) ? raw.bullets : [];
  const bullets: CompareNarrativeBullet[] = rawBullets
    .map((b) => {
      const label = typeof b?.label === "string" ? b.label : "";
      const text = typeof b?.text === "string" ? b.text : "";
      const toneRaw = b?.tone;
      const tone: CompareNarrativeTone =
        toneRaw === "positive" || toneRaw === "negative" || toneRaw === "warning"
          ? toneRaw
          : "neutral";
      return { label, text, tone };
    })
    .filter((b) => b.label.length > 0 && b.text.length > 0);
  if (!headline && !subtitle && paragraphs.length === 0 && bullets.length === 0) return null;
  return { headline, subtitle, paragraphs, bullets };
}

function normalizeCompareSummary(raw: any): CompareSummary | null {
  if (!raw || typeof raw !== "object") return null;
  const winner = raw.overallWinner === "A" || raw.overallWinner === "B" ? raw.overallWinner : "TIE";
  const deltas: any[] = Array.isArray(raw.pillarDeltas) ? raw.pillarDeltas : [];
  return {
    tickerA: String(raw.tickerA ?? "").toUpperCase(),
    tickerB: String(raw.tickerB ?? "").toUpperCase(),
    pillarsWonByA: Number(raw.pillarsWonByA ?? 0),
    pillarsWonByB: Number(raw.pillarsWonByB ?? 0),
    pillarsTied: Number(raw.pillarsTied ?? 0),
    overallWinner: winner,
    pillarDeltas: deltas.map((d) => ({
      dimension: String(d?.dimension ?? ""),
      displayName: String(d?.displayName ?? d?.dimension ?? ""),
      scoreA: d?.scoreA == null ? null : Number(d.scoreA),
      scoreB: d?.scoreB == null ? null : Number(d.scoreB),
      delta: d?.delta == null ? null : Number(d.delta),
      winner:
        d?.winner === "A" || d?.winner === "B" || d?.winner === "TIE" ? d.winner : null,
    })),
    narrative: normalizeCompareNarrative(raw.narrative),
  };
}

/**
 * Fetches both companies in a single request via `GET /api/v2/compare`.
 *
 * The backend response shape is:
 *   { companyA: AnalysisResponse, companyB: AnalysisResponse, summary, generatedAt }
 *
 * Older deployments returned `{ a, b }` — we accept both shapes for safety.
 */
export async function fetchCompareData(
  tickerA: string,
  tickerB: string,
): Promise<{
  a: CompareEnrichedCompany;
  b: CompareEnrichedCompany;
  summary: CompareSummary | null;
  narratives: {
    summary: CompareNarrative | null;
    value: CompareNarrative | null;
    future: CompareNarrative | null;
    past: CompareNarrative | null;
    health: CompareNarrative | null;
    dividend: CompareNarrative | null;
  };
  generatedAt: string | null;
}> {
  const a = tickerA.toUpperCase();
  const b = tickerB.toUpperCase();
  const res = await fetch(`${API_BASE_URL}/api/v2/compare?tickerA=${a}&tickerB=${b}`);
  if (!res.ok) {
    const message =
      res.status === 404
        ? "ticker-not-found"
        : res.status === 400
          ? "invalid-compare-params"
          : `compare-failed-${res.status}`;
    throw new CompareApiError(message, res.status, a, b);
  }
  const json: any = await res.json();
  const rawA = json.companyA ?? json.a;
  const rawB = json.companyB ?? json.b;
  const summary = normalizeCompareSummary(json.summary);
  return {
    a: mapAnalysisToEnriched(rawA, tickerA),
    b: mapAnalysisToEnriched(rawB, tickerB),
    summary,
    narratives: {
      summary: summary?.narrative ?? null,
      value: normalizeCompareNarrative(json.sectionNarratives?.value),
      future: normalizeCompareNarrative(json.sectionNarratives?.future),
      past: normalizeCompareNarrative(json.sectionNarratives?.past),
      health: normalizeCompareNarrative(json.sectionNarratives?.health),
      dividend: normalizeCompareNarrative(json.sectionNarratives?.dividend),
    },
    generatedAt: typeof json.generatedAt === "string" ? json.generatedAt : null,
  };
}

/**
 * Lazy-load a single comparison section. Each section is independently cached
 * server-side (TTL 6h), so calling this on tab switch is cheap after the first hit.
 *
 * Response shape (for any section):
 *   { tickerA, tickerB, companyA: AnalysisXxxResponse, companyB: AnalysisXxxResponse, generatedAt }
 *
 * The generic `T` is the per-section payload type the caller expects.
 */
export type CompareSectionKey = "value" | "future" | "past" | "health" | "dividend";

export async function fetchCompareSection<T = unknown>(
  section: CompareSectionKey,
  tickerA: string,
  tickerB: string,
): Promise<{
  tickerA: string;
  tickerB: string;
  companyA: T;
  companyB: T;
  narrative: CompareNarrative | null;
  generatedAt: string | null;
}> {
  const a = tickerA.toUpperCase();
  const b = tickerB.toUpperCase();
  const res = await fetch(
    `${API_BASE_URL}/api/v2/compare/section/${section}?tickerA=${a}&tickerB=${b}`,
  );
  if (!res.ok) {
    const message =
      res.status === 404
        ? "ticker-not-found"
        : res.status === 400
          ? "invalid-compare-params"
          : `compare-section-failed-${res.status}`;
    throw new CompareApiError(message, res.status, a, b);
  }
  const json: any = await res.json();
  return {
    tickerA: String(json.tickerA ?? a),
    tickerB: String(json.tickerB ?? b),
    companyA: json.companyA as T,
    companyB: json.companyB as T,
    narrative: normalizeCompareNarrative(json.narrative),
    generatedAt: typeof json.generatedAt === "string" ? json.generatedAt : null,
  };
}

/**
 * Builds a placeholder `CompareEnrichedCompany` populated only with safe defaults.
 *
 * Used as the initial scaffold during lazy loading: the hook starts with this
 * stub for each company, then merges real section data on top as the user
 * navigates between tabs (or as the full payload arrives).
 */
export function buildCompareEnrichedStub(
  ticker: string,
  meta?: { name?: string; sector?: string; logo?: string },
): CompareEnrichedCompany {
  const stub = mapAnalysisToEnriched({}, ticker);
  if (meta?.name) stub.name = meta.name;
  if (meta?.sector) stub.sector = meta.sector;
  if (meta?.logo) stub.logo = meta.logo;
  return stub;
}

/**
 * Merges a section payload (already mapped via `mapAnalysisToEnriched`) into
 * an existing enriched company, preserving all unrelated fields.
 *
 * The full mapper is called on the section raw because each section endpoint
 * mirrors the same field names as the full `AnalysisResponse` for its slice
 * (e.g. the `value` section returns `{ valuation, relativeValuation,
 * priceScenarios, ratioTrends, dcfSensitivity, competitors, valueReading }`).
 * Fields outside the section come back as defaults from `withCompareDefaults`,
 * which we discard.
 */
function mergeSectionIntoEnriched(
  base: CompareEnrichedCompany,
  section: CompareSectionKey,
  raw: any,
  ticker: string,
): CompareEnrichedCompany {
  const partial = mapAnalysisToEnriched(raw ?? {}, ticker);
  // Preserve company metadata if the section payload happens to include it.
  const meta = {
    name: raw?.company?.name ?? base.name,
    sector: raw?.company?.sector ?? base.sector,
    logo: raw?.company?.logo ?? base.logo,
  };
  switch (section) {
    case "value":
      return {
        ...base,
        ...meta,
        valuation: partial.valuation,
        priceScenarios: partial.priceScenarios,
        ratioTrends: partial.ratioTrends,
        dcfSensitivity: partial.dcfSensitivity,
        competitors: partial.competitors,
        readings: { ...base.readings, value: partial.readings.value },
        dimensionChecks: { ...base.dimensionChecks, value: partial.dimensionChecks.value },
      };
    case "future":
      return {
        ...base,
        ...meta,
        growthData: partial.growthData,
        readings: { ...base.readings, future: partial.readings.future },
        dimensionChecks: { ...base.dimensionChecks, future: partial.dimensionChecks.future },
      };
    case "past":
      return {
        ...base,
        ...meta,
        pastData: partial.pastData,
        readings: { ...base.readings, past: partial.readings.past },
        dimensionChecks: { ...base.dimensionChecks, past: partial.dimensionChecks.past },
      };
    case "health":
      return {
        ...base,
        ...meta,
        healthData: partial.healthData,
        readings: { ...base.readings, health: partial.readings.health },
        dimensionChecks: { ...base.dimensionChecks, health: partial.dimensionChecks.health },
      };
    case "dividend":
      return {
        ...base,
        ...meta,
        dividendData: partial.dividendData,
        readings: { ...base.readings, dividend: partial.readings.dividend },
        dimensionChecks: { ...base.dimensionChecks, dividend: partial.dimensionChecks.dividend },
      };
  }
}

/**
 * One-shot helper for the lazy-loading flow in `useCompare`: fetches a single
 * section and returns merged copies of the existing enriched companies.
 */
export async function fetchAndMergeCompareSection(
  section: CompareSectionKey,
  tickerA: string,
  tickerB: string,
  baseA: CompareEnrichedCompany,
  baseB: CompareEnrichedCompany,
): Promise<{
  a: CompareEnrichedCompany;
  b: CompareEnrichedCompany;
  narrative: CompareNarrative | null;
}> {
  const { companyA, companyB, narrative } = await fetchCompareSection<any>(section, tickerA, tickerB);
  return {
    a: mergeSectionIntoEnriched(baseA, section, companyA, tickerA),
    b: mergeSectionIntoEnriched(baseB, section, companyB, tickerB),
    narrative,
  };
}

/**
 * Invalidates the server-side cache for a specific compare pair (full + 5 sections).
 * Useful for an admin/dev "refresh" button.
 */
export async function deleteCompareCache(
  tickerA: string,
  tickerB: string,
): Promise<void> {
  const a = tickerA.toUpperCase();
  const b = tickerB.toUpperCase();
  const res = await fetch(
    `${API_BASE_URL}/api/v2/compare/cache?tickerA=${a}&tickerB=${b}`,
    { method: "DELETE" },
  );
  if (!res.ok) {
    throw new CompareApiError(
      `compare-cache-delete-failed-${res.status}`,
      res.status,
      a,
      b,
    );
  }
}

/**
 * Fetches the full analysis for a single ticker and converts to CompareEnrichedCompany.
 */
export async function fetchCompareCompany(
  ticker: string,
): Promise<CompareEnrichedCompany> {
  const res = await fetch(
    `${API_BASE_URL}/api/v2/company-analysis/${ticker.toUpperCase()}`,
  );
  if (!res.ok) throw new Error(`Failed to fetch analysis for ${ticker}`);
  const raw: any = await res.json();
  return mapAnalysisToEnriched(raw, ticker);
}
/* eslint-enable @typescript-eslint/no-explicit-any */

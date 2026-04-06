/**
 * Tipos de UI da página Comparar.
 *
 * Tipos que espelham dados mock ou futuros DTOs da API ficam em src/services/compare.ts.
 * Aqui ficam os tipos que representam o estado e os dados da camada de UI.
 */

export type ComparePillar = "Divida" | "CaixaFCF" | "Margens" | "Retorno" | "Proventos";
export type CompareTrend = "melhorando" | "estavel" | "piorando";
export type CompareStatus = "Saudavel" | "Atencao" | "Risco";
export type CompareRangeKey = "6m" | "1a" | "2a" | "3a" | "5a" | "10a" | "max" | "custom";
export type CompareConfidence = "Alta" | "Media" | "Baixa";
export type CompareProvider = "CVM" | "B3" | "RI";

export type CompareSource = {
  provider: CompareProvider;
  document: string;
  updatedAt: string;
  method: string;
  link: string;
  reference?: string;
};

export type ComparePoint = { year: number; value: number };

export type CompareMetric = {
  name: string;
  definition: string;
  unit: string;
  direction: "higher-better" | "lower-better";
  value: number | null;
  trend: CompareTrend;
  source: CompareSource;
};

export type ComparePillarData = {
  score: number;
  status: CompareStatus;
  thresholdLabel: string;
  domain: [number, number];
  bands: {
    safe: [number, number];
    warning: [number, number];
    risk: [number, number];
  };
  series: ComparePoint[];
  metrics: CompareMetric[];
};

export type CompareCompany = {
  ticker: string;
  name: string;
  sector: string;
  updatedAt: string;
  primarySource: string;
  confidence: CompareConfidence;
  gaps: string[];
  pillars: Record<ComparePillar, ComparePillarData>;
};

export type CompareEventItem = {
  id: string;
  ticker: string;
  date: string;
  type: string;
  summary: string;
  impact: ComparePillar;
  source: CompareSource;
};

export type CompareEvidence = {
  metricName: string;
  definition: string;
  unit: string;
  source: CompareSource;
  aTicker: string;
  bTicker: string;
  aValue: number | null;
  bValue: number | null;
};

export type CompareRangeOption = {
  key: CompareRangeKey;
  label: string;
  years: number | null;
  months?: number;
};

export type ComparePillarDiff = {
  p: ComparePillar;
  da: ComparePillarData;
  db: ComparePillarData;
  winner: CompareCompany;
  loser: CompareCompany;
  delta: number;
  lowestScore: number;
  winnerTrend: CompareTrend;
  loserTrend: CompareTrend;
};

export type CompareScoreboard = {
  winner: CompareCompany;
  score: number;
  attention: { c: CompareCompany; p: ComparePillar; s: number };
  spread: { p: ComparePillar; d: number };
  avgA: number;
  avgB: number;
};

export type CompareVerdict = {
  winner: CompareCompany;
  loser: CompareCompany;
  biggestGap: ComparePillarDiff;
  keyRisk: ComparePillarDiff;
  reasons: string[];
  consequence: string;
  confidence: CompareConfidence;
  latestUpdate: string;
};

export type CompareTableRow = {
  name: string;
  definition: string;
  unit: string;
  direction: "higher-better" | "lower-better";
  a: CompareMetric | null;
  b: CompareMetric | null;
};

export type CompareQualityTone = {
  dot: string;
  label: string;
};

// ─── Category-based navigation ─────────────────────────────────────────────

export type CompareCategorySlug =
  | "todas"
  | "visao-geral"
  | "valuation"
  | "crescimento"
  | "passado"
  | "saude"
  | "dividendos"
  | "metricas"
  | "timeline"
  | "fontes";

export type CompareCategoryDef = {
  slug: CompareCategorySlug;
  label: string;
};

// ─── Enriched data for side-by-side islands ──────────────────────────────────

export type CompareSnowflakeScore = {
  dimension: "value" | "future" | "past" | "health" | "dividend";
  label: string;
  score: number;       // 0-6
  normalized: number;  // 0-100
};

export type CompareValuation = {
  fairValue: number;
  currentPrice: number;
  discountPercent: number;
  model: string;
  pe: number;
  peIndustry: number;
  evEbitda: number;
  pvp: number;
};

export type ComparePriceScenario = {
  key: string;
  label: string;
  value: number;
  gapPercent: number;
};

export type CompareGrowth = {
  earningsGrowth: number;
  revenueGrowth: number;
  industryEarningsGrowth: number;
  marketEarningsGrowth: number;
  epsSeries: { year: string; value: number; type: "historical" | "forecast" }[];
  revenueSeries: { year: string; value: number; type: "historical" | "forecast" }[];
};

export type ComparePastPerformance = {
  earningsGrowthRate: number;
  revenueGrowthRate: number;
  roe: number;
  roce: number;
  netMargin: number;
  grossMargin: number;
  operatingMargin: number;
  revenueSeries: { year: string; value: number }[];
  earningsSeries: { year: string; value: number }[];
  marginSeries: { year: string; gross: number; operating: number; net: number }[];
  roeSeries: { year: string; value: number }[];
  roceSeries: { year: string; value: number }[];
};

export type CompareHealth = {
  shortTermAssets: number;
  shortTermLiabilities: number;
  longTermLiabilities: number;
  debtToEquity: number;
  debtToEquity5yAgo: number;
  cash: number;
  totalDebt: number;
  ebit: number;
  interestExpense: number;
  operatingCashFlow: number;
  debtSeries: { year: string; debt: number; equity: number; cash: number }[];
};

export type CompareDividend = {
  currentYield: number;
  marketMedianYield: number;
  payoutRatio: number;
  yearsWithoutInterruption: number;
  cagr5y: number;
  avgPayout5y: number;
  dpaSeries: { year: string; dpa: number; payout: number | null; type: "historical" | "forecast" }[];
};

export type CompareEnrichedCompany = CompareCompany & {
  price: number;
  change1d: number;
  snowflake: CompareSnowflakeScore[];
  valuation: CompareValuation;
  priceScenarios: ComparePriceScenario[];
  growthData: CompareGrowth;
  pastData: ComparePastPerformance;
  healthData: CompareHealth;
  dividendData: CompareDividend;
};

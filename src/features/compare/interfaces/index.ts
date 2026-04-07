/**
 * Tipos de UI da página Comparar.
 *
 * Tipos que espelham dados mock ou futuros DTOs da API ficam em src/services/compare.ts.
 * Aqui ficam os tipos que representam o estado e os dados da camada de UI.
 */

export type ComparePillar = "Divida" | "CaixaFCF" | "Margens" | "Retorno" | "Proventos";
export type CompareTrend = "melhorando" | "estavel" | "piorando";
export type CompareStatus = "Saudavel" | "Atencao" | "Risco";
export type CompareRangeKey = "1m" | "6m" | "1a" | "2a" | "3a" | "5a" | "10a" | "max" | "custom";
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

/**
 * Server-provided comparison summary, returned by `GET /api/v2/compare`.
 * The backend already orders pillarDeltas by |delta| desc.
 */
export type CompareWinnerSide = "A" | "B" | "TIE";

export type ComparePillarDelta = {
  dimension: string;
  displayName: string;
  scoreA: number | null;
  scoreB: number | null;
  delta: number | null;
  winner: CompareWinnerSide | null;
};

export type CompareNarrativeTone = "positive" | "negative" | "neutral" | "warning";

export type CompareNarrativeBullet = {
  label: string;
  text: string;
  tone: CompareNarrativeTone;
};

export type CompareNarrative = {
  headline: string;
  subtitle: string;
  paragraphs: string[];
  bullets: CompareNarrativeBullet[];
};

export type CompareNarrativeBundle = {
  summary: CompareNarrative | null;
  value: CompareNarrative | null;
  future: CompareNarrative | null;
  past: CompareNarrative | null;
  health: CompareNarrative | null;
  dividend: CompareNarrative | null;
};

export type CompareSummary = {
  tickerA: string;
  tickerB: string;
  pillarDeltas: ComparePillarDelta[];
  pillarsWonByA: number;
  pillarsWonByB: number;
  pillarsTied: number;
  overallWinner: CompareWinnerSide;
  narrative: CompareNarrative | null;
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
  discountRate: number;
  terminalGrowthRate: number;
  pe: number;
  peIndustry: number;
  peMarket: number;
  pegRatio: number;
  evEbitda: number;
  pvp: number;
  pvpIndustry: number;
};

export type ComparePriceScenario = {
  key: string;
  label: string;
  value: number;
  gapPercent: number;
  wacc: number;
  growthRate: number;
};

export type CompareRatioTrend = {
  metric: string;
  series: { year: string; company: number; industry: number }[];
};

export type CompareDCFSensitivityCell = {
  wacc: number;
  terminalGrowth: number;
  fairValue: number;
};

export type CompareCompetitor = {
  ticker: string;
  name: string;
  pe: number;
  earningsGrowth: number;
};

export type CompareGrowth = {
  earningsGrowth: number;
  revenueGrowth: number;
  industryEarningsGrowth: number;
  marketEarningsGrowth: number;
  industryRevenueGrowth: number;
  marketRevenueGrowth: number;
  futureROE: number;
  futureROEIndustry: number;
  epsSeries: { year: string; value: number; type: "historical" | "forecast" }[];
  earningsSeries: { year: string; value: number; type: "historical" | "forecast" }[];
  revenueSeries: { year: string; value: number; type: "historical" | "forecast" }[];
  freeCashFlowSeries: { year: string; value: number; type: "historical" | "forecast" }[];
};

export type ComparePastPerformance = {
  earningsGrowthRate: number;
  revenueGrowthRate: number;
  industryGrowth: number;
  roe: number;
  roce: number;
  roa: number;
  industryROE: number;
  industryROCE: number;
  industryROA: number;
  netMargin: number;
  grossMargin: number;
  operatingMargin: number;
  revenueSeries: { year: string; value: number }[];
  earningsSeries: { year: string; value: number }[];
  marginSeries: { year: string; gross: number; operating: number; net: number }[];
  roeSeries: { year: string; value: number }[];
  roceSeries: { year: string; value: number }[];
  cashFlowWaterfall: {
    earnings: number;
    depreciation: number;
    stockBasedComp: number;
    netWorkingCapital: number;
    others: number;
    freeCashFlow: number;
  } | null;
};

export type CompareHealth = {
  shortTermAssets: number;
  shortTermLiabilities: number;
  longTermAssets: number;
  longTermLiabilities: number;
  debtToEquity: number;
  debtToEquity5yAgo: number;
  cash: number;
  totalDebt: number;
  equity: number;
  ebit: number;
  interestExpense: number;
  operatingCashFlow: number;
  debtSeries: { year: string; debt: number; equity: number; cash: number }[];
  debtToEquitySeries: { year: string; value: number }[];
};

export type CompareDividend = {
  currentYield: number;
  sectorMedianYield: number;
  marketMedianYield: number;
  marketYield25th: number;
  marketYield75th: number;
  marketPercentile: number;
  payoutRatio: number;
  cashPayoutRatio: number;
  yearsWithoutInterruption: number;
  cagr5y: number;
  avgPayout5y: number;
  buybackYield: number;
  totalShareholderReturn: number;
  dpaSeries: { year: string; dpa: number; payout: number | null; type: "historical" | "forecast" }[];
};

// ─── Reading Cards / Dimension Checks (Phase 1) ──────────────────────────────

export type CompareDimensionKey = "value" | "future" | "past" | "health" | "dividend";

export interface CompareReadingEvidence {
  observed: string;
  reference: string;
  criterion: string;
  microText: string;
}

export interface CompareReadingLimitation {
  observed: string;
  reference: string;
  criterion: string;
  microText: string;
}

export interface CompareDimensionReading {
  headline: string;
  subtitle: string;
  badge: string;
  evidences: CompareReadingEvidence[];
  limitations: CompareReadingLimitation[];
  synthesis?: string;
}

export interface CompareDimensionCheckItem {
  label: string;
  passes: boolean;
  observed: string;
  reference: string;
  microText: string;
}

export interface CompareDimensionCheck {
  dimension: CompareDimensionKey;
  passed: number;
  total: number;
  items: CompareDimensionCheckItem[];
}

export interface CompareDimensionReadings {
  value: CompareDimensionReading;
  future: CompareDimensionReading;
  past: CompareDimensionReading;
  health: CompareDimensionReading;
  dividend: CompareDimensionReading;
}

export interface CompareDimensionChecks {
  value: CompareDimensionCheck;
  future: CompareDimensionCheck;
  past: CompareDimensionCheck;
  health: CompareDimensionCheck;
  dividend: CompareDimensionCheck;
}

// ─── Section Criteria (Phase 4) ─────────────────────────────────────────────

export interface CompareSectionCriteriaItem {
  label: string;
  passes: boolean;
  statement: string;
}

// ─── Balance Sheet Structure (Phase 2) ──────────────────────────────────────

export interface CompareBalanceSegment {
  key: string;
  label: string;
  value: number;
  percent: number;
}

export interface CompareBalanceSheet {
  assets: CompareBalanceSegment[];
  liabilities: CompareBalanceSegment[];
}

// ─── Diagnoses (Phase 3.5) ──────────────────────────────────────────────────

export type CompareDiagnosisStatus = "COVERED" | "PRESSURED" | "NOT_COVERED" | "OK" | "WARN" | "RISK";

export interface CompareDiagnosis {
  status: CompareDiagnosisStatus;
  text: string;
}

// ─── Histogram (Phase 3.1.1) ────────────────────────────────────────────────

export interface CompareHistogramBin {
  lower: number;
  upper: number;
  count: number;
}

export interface ComparePEIndustryDistribution {
  bins: CompareHistogramBin[];
  companyPE: number;
  industryMedian: number;
  p25: number;
  p75: number;
}

export type CompareEnrichedCompany = CompareCompany & {
  logo?: string;
  price: number;
  change1d: number;
  snowflake: CompareSnowflakeScore[];
  valuation: CompareValuation & {
    fairPE?: number;
    ps?: number;
    peIndustryDistribution?: ComparePEIndustryDistribution;
  };
  priceScenarios: ComparePriceScenario[];
  ratioTrends: CompareRatioTrend[];
  dcfSensitivity: CompareDCFSensitivityCell[];
  competitors: CompareCompetitor[];
  growthData: CompareGrowth & {
    operatingCashFlowSeries?: { year: string; value: number; type: "historical" | "forecast" }[];
    projectedEPS?: number;
    analystCoverage?: string;
    lastUpdated?: string;
    analystForecastCriteria?: CompareSectionCriteriaItem[];
  };
  pastData: ComparePastPerformance & {
    freeCashFlowSeries?: { year: string; value: number }[];
    operatingCashFlowSeries?: { year: string; value: number }[];
    operatingExpensesSeries?: { year: string; value: number }[];
    balanceSheet?: CompareBalanceSheet;
    earningsQualityCriteria?: CompareSectionCriteriaItem[];
    fcfCriteria?: CompareSectionCriteriaItem[];
    growthCriteria?: CompareSectionCriteriaItem[];
  };
  healthData: CompareHealth & {
    balanceSheet?: CompareBalanceSheet;
    interestCoverageDiagnosis?: CompareDiagnosis;
    positionCriteria?: CompareSectionCriteriaItem[];
    debtCriteria?: CompareSectionCriteriaItem[];
  };
  dividendData: CompareDividend & {
    payoutRatioDiagnosis?: CompareDiagnosis;
    cashPayoutRatioDiagnosis?: CompareDiagnosis;
  };
  readings: CompareDimensionReadings;
  dimensionChecks: CompareDimensionChecks;
};

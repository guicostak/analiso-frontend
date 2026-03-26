/**
 * Tipos de domínio para a tela de análise estilo SimplyWall.St.
 *
 * Modelo: 5 dimensões × 6 checks cada = 30 checks totais.
 * Dimensões: Value, Future, Past, Health, Dividend.
 */

// ─── Snowflake Dimensions ────────────────────────────────────────────────────

export type SnowflakeDimension = 'value' | 'future' | 'past' | 'health' | 'dividend';

export type CheckResult = {
  id: string;
  label: string;
  description: string;
  passed: boolean;
  value?: string;
  threshold?: string;
};

export type DimensionScore = {
  dimension: SnowflakeDimension;
  displayName: string;
  score: number; // 0-6 (checks passed)
  normalizedScore: number; // 0-100 for chart
  checks: CheckResult[];
  summary: string;
};

// ─── Value / Valuation ───────────────────────────────────────────────────────

export type DCFValuation = {
  fairValue: number;
  currentPrice: number;
  discountPercent: number;
  model: string; // '2-Stage FCF' | 'DDM' | 'Excess Returns'
  discountRate: number;
  terminalGrowthRate: number;
  projectedFCF: { year: string; value: number }[];
};

export type RelativeValuation = {
  peRatio: number;
  peIndustry: number;
  peMarket: number;
  pegRatio: number;
  pbRatio: number;
  pbIndustry: number;
};

// ─── Future Growth ───────────────────────────────────────────────────────────

export type GrowthForecast = {
  earningsGrowthRate: number;
  revenueGrowthRate: number;
  marketEarningsGrowth: number;
  marketRevenueGrowth: number;
  futureROE: number;
  earningsSeries: { year: string; value: number; type: 'historical' | 'forecast' }[];
  revenueSeries: { year: string; value: number; type: 'historical' | 'forecast' }[];
};

// ─── Past Performance ────────────────────────────────────────────────────────

export type PastPerformance = {
  epsGrowth5y: number;
  epsCurrentVs5yAgo: boolean;
  epsAccelerating: boolean;
  currentROE: number;
  currentROCE: number;
  roce3yAgo: number;
  currentROA: number;
  industryROA: number;
  epsSeries: { year: string; value: number }[];
  roeSeries: { year: string; value: number }[];
  roceSeries: { year: string; value: number }[];
};

// ─── Financial Health ────────────────────────────────────────────────────────

export type FinancialHealth = {
  shortTermAssets: number;
  shortTermLiabilities: number;
  longTermLiabilities: number;
  debtToEquity: number;
  debtToEquity5yAgo: number;
  operatingCashFlow: number;
  totalDebt: number;
  interestExpense: number;
  ebit: number;
  debtToEquitySeries: { year: string; value: number }[];
  assetsVsLiabilities: {
    shortTermAssets: number;
    longTermAssets: number;
    shortTermLiabilities: number;
    longTermLiabilities: number;
  };
};

// ─── Dividends ───────────────────────────────────────────────────────────────

export type DividendData = {
  currentYield: number;
  marketYield25th: number;
  marketYield75th: number;
  payoutRatio: number;
  futurePayoutRatio: number;
  isStable: boolean;
  years10Growth: boolean;
  dividendSeries: { year: string; value: number }[];
  payoutSeries: { year: string; value: number }[];
};

// ─── Ownership / Insider ─────────────────────────────────────────────────────

export type OwnershipData = {
  insiderBuys: number;
  insiderSells: number;
  institutionalOwnership: number;
  publicOwnership: number;
  insiderOwnership: number;
  topShareholders: { name: string; percentage: number; type: 'insider' | 'institution' | 'public' }[];
  insiderTransactions: { date: string; name: string; type: 'buy' | 'sell'; shares: number; value: number }[];
};

// ─── Price History ───────────────────────────────────────────────────────────

export type PriceHistory = {
  series: { date: string; price: number }[];
  return1y: number;
  return5y: number;
  marketReturn1y: number;
  volatilityBeta: number;
};

// ─── Company Info ────────────────────────────────────────────────────────────

export type CompanyInfo = {
  ticker: string;
  name: string;
  sector: string;
  industry: string;
  marketCap: string;
  description: string;
  exchange: string;
  currency: string;
  logo?: string;
};

// ─── Price Scenarios (Backend: price_scenarios + price_ranges) ───────────────

export type PriceScenario = {
  key: string; // 'pessimista' | 'base' | 'otimista'
  label: string;
  estimatedValue: number;
  gapVsCurrent: number; // percentage
};

// ─── Distribution Histogram (Backend: price_distribution) ────────────────────

export type DistributionBucket = {
  label: string;
  value: number;
  isCurrent: boolean;
  isMedian: boolean;
};

export type MetricDistribution = {
  metric: string; // 'P/L' | 'EV/EBITDA' | 'P/VP'
  buckets: DistributionBucket[];
  currentValue: number;
  sectorMedian: number;
};

// ─── Timeline Events (Backend: company_analysis_timeline_events) ─────────────

export type TimelineEvent = {
  date: string;
  title: string;
  source: string;
  expectedImpact: 'positive' | 'negative' | 'neutral';
  description?: string;
};

// ─── Sensitivity Drivers (Backend: price_sensitivity_drivers) ────────────────

export type SensitivityDriver = {
  key: string;
  label: string;
  impact: 'high' | 'medium' | 'low';
};

// ─── DCF Sensitivity Matrix (Backend: derivado de price_sensitivity) ─────────

export type DCFSensitivityCell = {
  wacc: number;
  terminalGrowth: number;
  fairValue: number;
};

// ─── Valuation Ratio Trends (Backend: company_market_series over time) ───────

export type RatioTrendPoint = {
  year: string;
  company: number;
  industry: number;
};

export type RatioTrend = {
  metric: string; // 'P/L' | 'EV/EBITDA' | 'P/VP'
  series: RatioTrendPoint[];
};

// ─── Margin Data (Backend: pillar_metrics for Margens pillar) ────────────────

export type MarginSeries = {
  year: string;
  grossMargin: number;
  operatingMargin: number;
  netMargin: number;
};

// ─── Return Comparison (multiple return periods) ─────────────────────────────

export type ReturnComparison = {
  period: string; // '1M' | '3M' | '6M' | '1A' | '3A' | '5A'
  stock: number;
  market: number;
};

// ─── Insider Sentiment Trend (quarterly buy/sell) ────────────────────────────

export type InsiderSentimentPoint = {
  quarter: string;
  buys: number;
  sells: number;
  netValue: number;
};

// ─── Dividend vs Earnings Comparison ─────────────────────────────────────────

export type DividendVsEarnings = {
  year: string;
  dividend: number;
  earnings: number;
};

// ─── Rewards & Risk Analysis (SimplyWall.St overview) ────────────────────────

export type RewardRisk = {
  type: 'reward' | 'risk';
  text: string;
  detail?: string;
};

// ─── Competitor Snowflakes (SimplyWall.St competitors section) ───────────────

export type Competitor = {
  ticker: string;
  name: string;
  exchange: string;
  marketCap: string;
  scores: { value: number; future: number; past: number; health: number; dividend: number };
};

// ─── Analyst Price Target (SimplyWall.St valuation) ──────────────────────────

export type AnalystTarget = {
  date: string;
  price: number;
  consensusTarget: number;
  low: number;
  high: number;
};

// ─── Market Cap Composition (SimplyWall.St overview donut) ───────────────────

export type MarketCapComposition = {
  earnings: number;
  revenue: number;
  marketCap: number;
  peRatio: number;
  psRatio: number;
};

// ─── Earnings & Revenue History (SimplyWall.St past tab) ─────────────────────

export type EarningsRevenueSeries = {
  year: string;
  revenue: number;
  earnings: number;
  type: 'historical' | 'forecast';
};

// ─── Price Event Category (SimplyWall.St price chart overlay) ────────────────

export type PriceEvent = {
  date: string;
  category: 'dividend' | 'financial' | 'management' | 'strategy' | 'other';
  title: string;
};

// ─── Community Fair Values (SimplyWall.St community histogram) ───────────────

export type CommunityFairValue = {
  priceRange: string;
  count: number;
};

// ─── Full Analysis Data ──────────────────────────────────────────────────────

export type AnalysisData = {
  company: CompanyInfo;
  snowflake: DimensionScore[];
  valuation: DCFValuation;
  relativeValuation: RelativeValuation;
  growth: GrowthForecast;
  pastPerformance: PastPerformance;
  health: FinancialHealth;
  dividend: DividendData;
  ownership: OwnershipData;
  priceHistory: PriceHistory;
  // Data-to-viz optimized fields
  priceScenarios: PriceScenario[];
  distributions: MetricDistribution[];
  timelineEvents: TimelineEvent[];
  sensitivityDrivers: SensitivityDriver[];
  // New chart data
  dcfSensitivity: DCFSensitivityCell[];
  ratioTrends: RatioTrend[];
  marginSeries: MarginSeries[];
  returnComparison: ReturnComparison[];
  insiderSentiment: InsiderSentimentPoint[];
  dividendVsEarnings: DividendVsEarnings[];
  // SimplyWall.St specific charts
  rewardsAndRisks: RewardRisk[];
  competitors: Competitor[];
  analystTargets: AnalystTarget[];
  marketCapComposition: MarketCapComposition;
  earningsRevenueSeries: EarningsRevenueSeries[];
  priceEvents: PriceEvent[];
  communityFairValues: CommunityFairValue[];
};

// ─── Active tab ──────────────────────────────────────────────────────────────

export type AnalysisTab = 'overview' | 'value' | 'future' | 'past' | 'health' | 'dividend' | 'ownership';

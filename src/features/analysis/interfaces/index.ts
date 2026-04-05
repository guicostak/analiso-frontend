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
  epsGrowthRate: number;
  industryEarningsGrowth: number;
  revenueGrowthRate: number;
  marketEarningsGrowth: number;
  marketRevenueGrowth: number;
  futureROE: number;
  futureROEIndustry: number;
  analystCoverage: 'Good' | 'Fair' | 'Poor';
  lastUpdated: string;
  earningsSeries: { year: string; value: number; type: 'historical' | 'forecast' }[];
  revenueSeries: { year: string; value: number; type: 'historical' | 'forecast' }[];
  freeCashFlowSeries: { year: string; value: number; type: 'historical' | 'forecast' }[];
  cashFromOpSeries: { year: string; value: number; type: 'historical' | 'forecast' }[];
  operatingExpensesSeries: { year: string; value: number; type: 'historical' | 'forecast' }[];
  industryRevenueGrowth: number;
  savingsRate: number;
  epsCombinedSeries: {
    year: string;
    value: number;
    low: number;
    high: number;
    analysts: number;
    confirmedDate: string;
    type: 'historical' | 'forecast';
    forecastSource?: 'analyst' | 'sgr'; // 'sgr' = projeção modelo sem cobertura de analistas
  }[];
  forecastEndDate: string;
  revenueAtForecast: number;
  earningsAtForecast: number;
  revenueAnalysts: number;
  earningsAnalysts: number;
  revenueLastUpdated: string;
  earningsLastUpdated: string;
};

export type FutureUpdate = {
  id: string;
  sentiment: 'good' | 'bad' | 'neutral';
  type: 'price' | 'earnings' | 'article' | 'event' | 'risk' | 'dividend';
  title: string;
  date: string;
  url?: string;
  imageUrl?: string;
};

// ─── Past Performance ────────────────────────────────────────────────────────

export type PastPerformance = {
  earningsGrowthRate: number;
  epsGrowthRate: number;
  industryGrowth: number;
  revenueGrowthRate: number;
  currentROE: number;
  netMargin: number;
  nextEarningsDate: string;
  epsGrowth5y: number;
  epsCurrentVs5yAgo: boolean;
  epsAccelerating: boolean;
  currentROCE: number;
  roce3yAgo: number;
  currentROA: number;
  industryROA: number;
  industryROE: number;
  lastUpdated: string;
  epsSeries: { year: string; value: number }[];
  roeSeries: { year: string; value: number }[];
  roceSeries: { year: string; value: number }[];
  cashFlowWaterfall: {
    earnings: number;
    depreciation: number;
    stockBasedComp: number;
    netWorkingCapital: number;
    others: number;
    freeCashFlow: number;
  };
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
  cash: number;
  equity: number;
  debtToEquitySeries: { year: string; value: number }[];
  debtHistorySeries: { year: string; debt: number; equity: number; cash: number }[];
  assetsVsLiabilities: {
    shortTermAssets: number;
    longTermAssets: number;
    shortTermLiabilities: number;
    longTermLiabilities: number;
  };
  balanceSheet: {
    assets: {
      cash: number;
      receivables: number;
      inventory: number;
      physicalAssets: number;
      longTermAssets: number;
    };
    liabilities: {
      accountsPayable: number;
      debt: number;
      otherLiabilities: number;
      equity: number;
    };
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
  buybackYield: number | null;
  totalShareholderReturn: number | null;
  futureDividendYield: number | null;
  dividendGrowth: number | null;
  nextPaymentDate: string;
  exDividendDate: string;
  dividendPerShare: number;
  yearsWithoutInterruption: number;
  cagr5y: number;
  avgPayout5y: number;
  dividendQualitySeries: { year: string; dpa: number; payout: number | null; type: 'historical' | 'forecast' }[];
  marketMedianYield: number;
  sectorMedianYield: number;
  marketPercentile: number;
  cashPayoutRatio: number;
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
  founded?: string;
  employees?: string;
  ceo?: string;
  website?: string;
  longDescription?: string;
  summaryText?: string;
};

// ─── Price Scenarios (Backend: price_scenarios + price_ranges) ───────────────

export type PriceScenario = {
  key: string; // 'conservador' | 'base' | 'otimista'
  label: string;
  estimatedValue: number;
  gapVsCurrent: number; // percentage vs current price (positive = upside)
  wacc?: number;        // WACC assumption used
  growthRate?: number;  // terminal/FCF growth assumption
  note?: string;        // one-liner on the hypothesis
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

// ─── Recent Changes (Overview delta section) ──────────────────────────────────

export type RecentChange = {
  pillar: SnowflakeDimension;
  direction: 'better' | 'worse' | 'neutral';
  summary: string;   // "Valuation ficou mais atrativo"
  detail: string;    // "Desconto ao valor justo subiu de 10% para 16%"
  before: string;    // "10% de desconto"
  after: string;     // "16% de desconto"
  date: string;      // "Mar 2026"
};

// ─── Price Context (indexed chart + events) ───────────────────────────────────

export type PriceContextPoint = {
  date: string;   // 'YYYY-MM'
  stock: number;  // raw indexed value (100 = first month)
  ibov: number;   // raw indexed value (100 = first month)
};

export type ContextEvent = {
  id: string;
  date: string;
  title: string;
  impact: 'positive' | 'neutral' | 'attention';
  pillar: SnowflakeDimension | null;
  explanation: string;
};

// ─── Competitor Snowflakes (SimplyWall.St competitors section) ───────────────

export type Competitor = {
  ticker: string;
  name: string;
  exchange: string;
  marketCap: string;
  scores: { value: number; future: number; past: number; health: number; dividend: number };
  pe?: number;
  earningsGrowth?: number;
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

// ─── Income Breakdown (Sankey DRE) ───────────────────────────────────────────

export type IncomeBreakdownYear = {
  year: string;
  receita: number;
  cpv: number;
  lucroBruto: number;
  despesasOp: number;
  ebit: number;
  financeiroIR: number;
  lucroLiquido: number;
};

// ─── Full Analysis Data ──────────────────────────────────────────────────────

export type AnalysisData = {
  company: CompanyInfo;
  snowflake: DimensionScore[];
  valuation: DCFValuation;
  relativeValuation: RelativeValuation;
  growth: GrowthForecast;
  recentChanges: RecentChange[];
  priceContextSeries: PriceContextPoint[];
  contextEvents: ContextEvent[];
  futureUpdates: FutureUpdate[];
  pastUpdates: FutureUpdate[];
  healthUpdates: FutureUpdate[];
  dividendUpdates: FutureUpdate[];
  pastPerformance: PastPerformance;
  health: FinancialHealth;
  dividend: DividendData;
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
  dividendVsEarnings: DividendVsEarnings[];
  // SimplyWall.St specific charts
  rewardsAndRisks: RewardRisk[];
  competitors: Competitor[];
  analystTargets: AnalystTarget[];
  marketCapComposition: MarketCapComposition;
  earningsRevenueSeries: EarningsRevenueSeries[];
  priceEvents: PriceEvent[];
  communityFairValues: CommunityFairValue[];
  incomeBreakdown: IncomeBreakdownYear[];
  generatedAt?: string;
};

// ─── Active tab ──────────────────────────────────────────────────────────────

export type AnalysisTab = 'overview' | 'value' | 'future' | 'past' | 'health' | 'dividend' | 'sources';

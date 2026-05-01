/**
 * Tipos de UI da Watchlist.
 */

export type Pillar = "Dívida" | "Caixa" | "Margens" | "Retorno" | "Proventos";

export type PriorityBadge = "Risco" | "Atenção" | "Saudável";
export type FeedSeverity = "Risco" | "Atenção" | "Saudável";
export type FeedSource = "CVM" | "RI" | "B3";
export type FeedRange = "7d" | "30d" | "90d";
export type FeedRangeOrAll = FeedRange | "Todos";
export type WatchlistStatus = "Risco" | "Atenção" | "Saudável";
export type WatchlistDensity = "Compacto" | "Detalhado";
export type WatchlistSortBy = "Mudou recentemente" | "Atenção primeiro" | "Pilar crítico";
export type DataFreshness = "Atual" | "Falha" | "Sem dados";

export interface PriorityItem {
  id: string;
  company: string;
  ticker: string;
  /** null quando o backend retorna sectorLabel: null — não renderizar a linha do setor */
  sector: string | null;
  /** Badge display do endpoint — pode ser "Prioridade 1", "Risco", "Atenção", etc. */
  badge: string;
  /** topTag do endpoint — null quando o item não é o primeiro da lista */
  topTag: string | null;
  /** contextLine do endpoint */
  contextLine: string;
  /** whatChangedLabel do endpoint */
  changeLabel: string;
  /** whatChanged do endpoint */
  change: string;
  /** whyMattersLabel do endpoint */
  whyLabel: string;
  /** whyMatters do endpoint */
  why: string;
  /** metaLine do endpoint */
  evidence: string;
  /** ctaLabel do endpoint */
  ctaLabel: string;
  /**
   * Pilar para navegação deep-link.
   * O endpoint priorityItems não envia pillar — valor padrão "Dívida" é usado
   * até que o backend exponha esse campo.
   */
  pillar: Pillar;
  evidenceId?: string;
}

export interface FeedItem {
  id: string;
  headline: string;
  detail: string;
  detailTwo: string;
  pillar: Pillar;
  evidence: string;
  ticker: string;
  severity: FeedSeverity;
  source: FeedSource;
  range: FeedRange;
  /** ctaLabel do endpoint updatesSection.items[i].ctaLabel */
  ctaLabel: string;
  evidenceId?: string;
}

export interface WatchlistCompany {
  name: string;
  ticker: string;
  sector: string;
  scores: number[];
  lastChangeDays: number;
  freshness: DataFreshness;
  volatility?: "Baixa" | "Moderada" | "Alta";
  attentionPillar: Pillar;
  tags: string[];
}

export interface AlertItem {
  id: string;
  title: string;
  summary: string;
  time: string;
  severity: FeedSeverity;
}

export interface WatchlistFilters {
  sector: string;
  tags: string;
  pillar: string;
}

// ─── Sector catalog (referência cross-watchlist) ─────────────────────────────

export interface SectorCatalogItem {
  sector: string;
  companyCount: number;
}

// ─── Summary (agregação da watchlist) ─────────────────────────────────────────

export type SnowflakeDimensionKey = "value" | "future" | "past" | "health" | "dividend";

export interface WatchlistSummaryKpis {
  /** P/L considerando apenas empresas com lucro (peRatio > 0) */
  peAverage:           number | null;
  peMedian:            number | null;
  /** Quantas empresas com P/L positivo entraram no cálculo */
  peValidCount:        number;
  /** P/VP considerando apenas empresas com patrimônio positivo (pbRatio > 0) */
  pbAverage:           number | null;
  pbMedian:            number | null;
  /** Quantas empresas com P/VP positivo entraram no cálculo */
  pbValidCount:        number;
  /** DY considerando apenas empresas pagadoras (yield > 0) */
  dyAverage:           number | null;
  dyMedian:            number | null;
  /** Número de empresas da watchlist que entraram no cálculo de DY */
  dividendPayerCount:  number;
  roeAverage:          number | null;
  roeMedian:           number | null;
  roceAverage:         number | null;
  netMarginAverage:    number | null;
  debtToEquityAverage: number | null;
  qualityAverage:      number | null;
}

export interface WatchlistSummarySectorBucket {
  sector: string;
  count: number;
  percent: number;
}

export interface WatchlistSummaryPillarBucket {
  dimension: SnowflakeDimensionKey | string;
  label: string;
  count: number;
  percent: number;
}

export interface WatchlistSummarySnowflakeAggregate {
  value:    number | null;
  future:   number | null;
  past:     number | null;
  health:   number | null;
  dividend: number | null;
}

export interface WatchlistSlimPricePoint {
  date: string;
  price: number | null;
}

export interface WatchlistSummarySlimItem {
  ticker:           string;
  name:             string | null;
  sector:           string | null;
  industry:         string | null;
  logo:             string | null;
  currency:         string | null;
  currentPrice:     number | null;
  return1y:         number | null;
  return5y:         number | null;
  peRatio:          number | null;
  pbRatio:          number | null;
  dividendYield:    number | null;
  payoutRatio:      number | null;
  roe:              number | null;
  roce:             number | null;
  netMargin:        number | null;
  debtToEquity:     number | null;
  fairValue:        number | null;
  discountPercent:  number | null;
  snowflake: {
    value:    number | null;
    future:   number | null;
    past:     number | null;
    health:   number | null;
    dividend: number | null;
  } | null;
  weakestDimension: SnowflakeDimensionKey | string | null;
  qualityScore:     number | null;
  priceSparkline:   WatchlistSlimPricePoint[];
  missing:          boolean;
}

// ─── Performance histórica (equal-weight vs IBOV) ────────────────────────────

export type WatchlistPerformanceRange = "30d" | "90d" | "180d" | "1y" | "max";

export interface WatchlistPerformancePoint {
  date:      string;
  watchlist: number | null;
  ibov:      number | null;
}

export interface WatchlistPerformanceSummary {
  watchlistChangePct:   number | null;
  ibovChangePct:        number | null;
  alphaPp:              number | null;
  watchlistVolatility:  number | null;
  tickersIncluded:      string[];
  tickersExcluded:      string[];
}

export interface WatchlistPerformance {
  range:    string;
  baseDate: string | null;
  asOf:     string | null;
  series:   WatchlistPerformancePoint[];
  summary:  WatchlistPerformanceSummary;
}

export interface WatchlistSummary {
  totalCompanies:     number;
  withData:           number;
  withoutData:        number;
  freshnessPercent:   number;
  kpis:               WatchlistSummaryKpis;
  sectorAllocation:   WatchlistSummarySectorBucket[];
  pillarBreakdown:    WatchlistSummaryPillarBucket[];
  snowflakeAggregate: WatchlistSummarySnowflakeAggregate;
  items:              WatchlistSummarySlimItem[];
}

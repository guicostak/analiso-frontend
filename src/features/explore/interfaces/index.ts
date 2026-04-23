/**
 * Tipos de UI da página Explore.
 *
 * Tipos que espelham DTOs da API ficam em src/services/explore.ts.
 * Aqui ficam os tipos que representam o estado e os dados da camada de UI.
 */

export type IndexCardTrend = "up" | "down" | "neutral";

export type MoverType = "altas" | "baixas" | "negociadas";

export type VolatilityLabel = "Baixa" | "Moderada" | "Alta";

export type HighlightSeverity = "Leve" | "Moderada" | "Forte";

export type HighlightPillarKey = "divida" | "caixa" | "margens" | "retorno" | "proventos";

export type HighlightPillar = "Dívida" | "Caixa" | "Margens" | "Retorno" | "Proventos";

export type HighlightTimeframe = "7d" | "30d" | "90d" | "2q" | "12m";

export type HighlightScope = "mercado" | "setor" | "watchlist";

export type HighlightScopeLabel = "Mercado" | "Setor" | "Minha watchlist";

export type CompanyStatus = "Saudável" | "Atenção" | "Risco";

export type CompanySize = "Grande" | "Média" | "Pequena";

export type FreshnessStatus = "Atualizado" | "Antigo";

export type FilterKey = "sector" | "size" | "status" | "freshness" | "pillar";

export type ExploreTab = "mercado" | "encontrar" | "colecoes";

export type SummaryState = "loading" | "ready" | "empty" | "error";

export interface Filters extends Record<FilterKey, string> {
  sort: string;
}

export interface IndexCard {
  name: string;
  symbol: string;
  value: string;
  changeAbs: string;
  changePct: string;
  trend: IndexCardTrend;
  sparkline: number[];
  /** Datas ISO yyyy-MM-dd paralelas à sparkline (vem do backend quando disponível). */
  sparklineDates?: string[];
}

export interface MoverRow {
  ticker: string;
  name: string;
  price: string;
  changePct: string;
  note: string;
  updatedAt: string;
  source: string;
  type: MoverType;
  logoUrl?: string | null;
  /** Últimos ~30 pontos de PRICE_CLOSE (ordem ASC). Null quando não há histórico. */
  sparkline?: number[] | null;
}

export interface MovementInsight {
  why: string;
  impactPillars: string;
}

export interface Volatility {
  value: number;
  label: VolatilityLabel;
  updatedAt: string;
  source: string;
}

export interface HighlightPreset {
  pillar: HighlightPillarKey;
  signal: string;
  severity: "leve" | "moderada" | "forte";
  timeframe: HighlightTimeframe;
  scope: HighlightScope;
}

export interface HighlightSourceDetail {
  pillar:           string;
  currentScore:     number;
  catalogState:     string;   // "RISK" | "ATTENTION" | "HEALTHY"
  periodLabel:      string;   // ex: "3T24"
  sourceRecencyDays: number;
  sourceName:       string;   // ex: "CVM"
}

export interface HighlightItem {
  id: string;
  companyName: string;
  ticker: string;
  logoUrl?: string | null;
  changeTitle: string;
  whyItMatters: string;
  openNowBenefit?: string | null;
  sourceDetail?: HighlightSourceDetail | null;
  pillar: HighlightPillar;
  severity: HighlightSeverity;
  timeframeLabel: string;
  scope: HighlightScopeLabel;
  source: {
    name: string;
    updatedAt: string;
    docLabel: string;
    url?: string;
  };
  filterPreset: HighlightPreset;
  /** Sparkline PRICE_CLOSE (ordem ASC). Null quando não há histórico. */
  sparkline?: number[] | null;
}

export interface CompanyFinancials {
  pl: number | null;           // P/L (Preço/Lucro)
  pvp: number | null;          // P/VP (Preço/Valor Patrimonial)
  dividendYield: number | null; // Dividend Yield (%)
  roe: number | null;          // ROE (%)
  roic: number | null;         // ROIC (%)
  margemLiquida: number | null; // Margem Líquida (%)
  margemEbitda: number | null;  // Margem EBITDA (%)
  dividaLiquidaEbitda: number | null; // Dívida Líquida / EBITDA
  evEbitda: number | null;     // EV/EBITDA
  lpa: number | null;          // LPA (Lucro por Ação)
  price: number | null;        // Preço atual da ação (R$)
}

export interface CompanyCard {
  name: string;
  ticker: string;
  sector: string;
  size: CompanySize;
  status: CompanyStatus;
  pillarsScores: number[];
  headline: string;
  shortDiagnosis: string;
  whyOpen?: string | null;
  freshnessStatus: FreshnessStatus;
  updatedAt: string;
  source: string;
  highlightPillar: HighlightPillar;
  logoUrl?: string | null;
  financials: CompanyFinancials;
}

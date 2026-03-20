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

export interface HighlightItem {
  id: string;
  companyName: string;
  ticker: string;
  changeTitle: string;
  whyItMatters: string;
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
}

export interface CompanyCard {
  name: string;
  ticker: string;
  sector: string;
  size: CompanySize;
  status: CompanyStatus;
  pillarsScores: number[];
  shortDiagnosis: string;
  freshnessStatus: FreshnessStatus;
  updatedAt: string;
  source: string;
  highlightPillar: HighlightPillar;
}

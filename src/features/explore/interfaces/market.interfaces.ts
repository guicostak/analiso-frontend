/**
 * UI types for the new "market extras" module (Fase 2).
 * Separado de interfaces/index.ts por SRP — tipos exclusivos das novas ilhas
 * da aba Contexto da tela /mercado.
 */

import type { IndexCard, IndexCardTrend } from "./index";

/** Chaves de range que o hook expõe ao componente. */
export type MarketTimeRange = "1D" | "1W" | "1M" | "YTD" | "1Y";

/** Status do mercado B3 derivado pelo backend. */
export type MarketStatus = "OPEN" | "CLOSED" | "PRE_MARKET";

/** Tom de mercado composto. */
export type MarketTone = "BULLISH" | "NEUTRAL" | "BEARISH";

/** Ticker da ribbon — reusa o shape de IndexCard. */
export type RibbonTicker = IndexCard;

/** Breadth (N altas vs N baixas). */
export interface BreadthIndicator {
  up:        number;
  down:      number;
  unchanged: number;
  total:     number;
  /** 0..1 — razão de altas. */
  ratioUp:   number;
}

/** Classificação textual do Fear & Greed. */
export type FearGreedLabel =
  | "Extreme Fear"
  | "Fear"
  | "Neutral"
  | "Greed"
  | "Extreme Greed"
  | string; // permissivo para futuras fontes

export interface FearGreedIndicator {
  score:     number;          // 0..100
  label:     FearGreedLabel;
  source:    string;
  sourceUrl: string | null;
  asOfDate:  string | null;   // ISO yyyy-MM-dd
}

export interface VolatilityMini {
  score:       number | null;
  statusKey:   string | null;
  statusLabel: string | null;
  metaLine:    string | null;
  indexLabel:  string | null;
}

export interface IndexMini {
  value:     string | null;
  changePct: string | null;
  trend:     IndexCardTrend;
}

export interface DiCurvePoint {
  tenorDays:       number;
  tenorLabel:      string;
  yieldPct:        number;
  yieldFormatted:  string;
  changeBps:       number | null;
  changeLabel:     string | null;
  trend:           IndexCardTrend;
}

export interface DiCurve {
  curveType: string;
  label:     string;
  asOfDate:  string | null;
  points:    DiCurvePoint[];
  source:    string | null;
  sourceUrl: string | null;
  summary:   string | null;
}

export interface RiskPanel {
  volatility: VolatilityMini     | null;
  breadth:    BreadthIndicator   | null;
  fearGreed:  FearGreedIndicator | null;
  vix:        IndexMini          | null;
  dxy:        IndexMini          | null;
  diCurve:    DiCurve            | null;
}

export interface MarketToneHighlights {
  tone:       MarketTone;
  label:      string;           // "Bullish" / "Neutro" / "Bearish"
  highlights: string[];         // até 3 bullets
}

export interface MarketRibbon {
  tickers:       RibbonTicker[];
  marketStatus:  MarketStatus | null;
  lastUpdatedAt: string | null;
}

/** Card único de indicador macro (Selic, IPCA, IBC-Br). */
export interface MacroIndicator {
  key:            string;
  label:          string;
  value:          string | null;
  changeLabel:    string | null;
  trend:          IndexCardTrend;
  asOfDate:       string | null;
  sparkline:      number[];
  /** Datas ISO paralelas à sparkline (do backend, quando disponíveis). */
  sparklineDates?: string[];
  subtitle:       string | null;
}

/** Fase do ciclo econômico (Merrill Lynch Clock). */
export type CyclePhase = "RECOVERY" | "OVERHEAT" | "STAGFLATION" | "REFLATION" | string;

export interface EconomicCycle {
  phaseKey:        CyclePhase;
  phaseLabel:      string;
  growthStatus:    string;   // 'ABOVE_TREND' | 'BELOW_TREND'
  inflationStatus: string;   // 'RISING' | 'FALLING'
  confidence:      string;   // 'high' | 'medium' | 'low'
  description:     string | null;
  metaLine:        string | null;
}

export interface MacroIndicatorsBundle {
  selic:         MacroIndicator | null;
  ipca:          MacroIndicator | null;
  ibcBr:         MacroIndicator | null;
  economicCycle: EconomicCycle  | null;
}

export interface SectorHeatmapItem {
  sector:         string;
  avgChangePct:   number | null;
  companiesCount: number | null;
  topTickers:     string[];
}

export interface SectorHeatmap {
  sectors:   SectorHeatmapItem[];
  asOfLabel: string | null;
}

export interface Comparison {
  key:             string;
  label:           string;
  value:           string | null;
  changePct:       string | null;
  trend:           IndexCardTrend;
  sparkline:       number[] | null;
  sparklineDates?: string[];
  /** Fórmula/métrica ("IBOV ÷ USDBRL") — exibida próximo ao valor. */
  formula?:        string;
  /** Prefixo de unidade antes do valor ("US$", "R$"). */
  valuePrefix?:    string;
  /** Sufixo de unidade depois do valor ("pts", "×", "/oz"). */
  valueSuffix?:    string;
  description:     string | null;
}

/** Macro global — commodities + cripto (shape = IndexCard). */
export interface GlobalMacroBundle {
  brent:   IndexCard | null;
  wti:     IndexCard | null;
  gold:    IndexCard | null;
  ironOre: IndexCard | null;
  bitcoin: IndexCard | null;
}

/**
 * Ilha "Ex-dividendos" da aba Movimentos.
 * Contextualiza quedas técnicas (ex-date de hoje) e oferece agenda curta (próximos 30d).
 */
export interface ExDividendItem {
  ticker:        string;
  companyName:   string | null;
  sector:        string | null;
  /** Data ex-dividendo — ISO yyyy-MM-dd. */
  exDate:        string;
  /** 0 = hoje; positivo = dias à frente. */
  daysUntilEx:   number;
  /** Dividendo por ação TTM (R$/ação), quando disponível. */
  dpsTtm:        number | null;
  /** Dividend yield anual (%), quando disponível. */
  dividendYield: number | null;
  logoUrl:       string | null;
}

export interface ExDividendBundle {
  today:    ExDividendItem[];
  upcoming: ExDividendItem[];
  asOfDate: string | null;
}

/**
 * Ilha "Alfa setorial" da aba Movimentos.
 * Destaca ações que destoaram (pra mais ou pra menos) do comportamento médio do seu setor.
 */
export interface SectorAlphaItem {
  ticker:         string;
  companyName:    string | null;
  sector:         string | null;
  /** Variação % da ação no pregão. */
  stockChangePct: number;
  /** Variação média % do setor no mesmo pregão. */
  sectorAvgPct:   number;
  /** stockChangePct - sectorAvgPct, em pp. Positivo = destaque positivo. */
  alphaPct:       number;
  direction:      "positive" | "negative";
  logoUrl:        string | null;
}

export interface SectorAlphaBundle {
  positive: SectorAlphaItem[];
  negative: SectorAlphaItem[];
  asOfDate: string | null;
}

/** Bundle UI-side dos extras do contexto. */
export interface MarketExtras {
  ribbon:        MarketRibbon          | null;
  marketTone:    MarketToneHighlights  | null;
  riskPanel:     RiskPanel             | null;
  sectorHeatmap: SectorHeatmap         | null;
  macroBr:       MacroIndicatorsBundle | null;
  macroGlobal:   GlobalMacroBundle     | null;
  comparisons:   Comparison[];
  /** Ilhas da aba Movimentos (Fase 2 — rollout incremental). */
  exDividends:   ExDividendBundle      | null;
  sectorAlpha:   SectorAlphaBundle     | null;
}

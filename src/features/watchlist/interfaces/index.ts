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
  sector: string;
  badge: PriorityBadge;
  change: string;
  why: string;
  evidence: string;
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

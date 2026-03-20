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

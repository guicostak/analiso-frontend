/**
 * Watchlist service.
 *
 * Responsabilidades:
 *  1. Tipos que espelham os DTOs do backend
 *  2. Funções de chamada HTTP (getWatchlist, getUserWatchlist, etc.)
 *  3. Funções puras de transformação/cálculo de status
 *  4. Mapeamentos auxiliares (sourceByTicker)
 *
 * Independente de React — sem imports de hooks ou JSX.
 */

import { apiFetch } from "./api";
import type {
  PriorityItem,
  FeedItem,
  WatchlistCompany,
  AlertItem,
  WatchlistStatus,
  Pillar,
  FeedSeverity,
  FeedSource,
} from "../types/watchlist";

// ─── DTOs do backend ──────────────────────────────────────────────────────────

export interface WatchlistPriorityItemDto {
  ticker: string;
  companyName: string;
  /** Pode ser null — não renderizar a linha do setor quando null */
  sectorLabel: string | null;
  /** Label de destaque do card, ex: "Comece por aqui". Null quando não é o primeiro item. */
  topTag: string | null;
  badge: string;
  contextLine: string;
  whatChangedLabel: string;
  whatChanged: string;
  whyMattersLabel: string;
  whyMatters: string;
  metaLine: string;
  ctaLabel: string;
}

export interface WatchlistFeedItemDto {
  badge: string;
  pillarBadge: string;
  title: string;
  body: string;
  watchLine: string;
  metaLine: string;
  ctaLabel: string;
}

export interface WatchlistListItemDto {
  ticker: string;
  companyName: string;
  sectorLabel: string;
  badge: string;
  headline: string;
  supportLine: string;
  metaLine: string;
  statusChip: string;
  unseenChip: string | null;
  pendingDataBadge: string | null;
  ctaPrimary: string;
  ctaSecondary: string | null;
}

export interface WatchlistAlertItemDto {
  badge: string;
  title: string;
  body: string;
  timeLabel: string;
}

export interface WatchlistHeaderDto {
  title: string;
  subtitle: string;
}

export interface WatchlistPrioritySectionDto {
  title: string;
  body: string;
  countLabel: string;
}

export interface WatchlistUpdatesSectionDto {
  title: string;
  body: string;
  items: WatchlistFeedItemDto[];
}

export interface WatchlistListSectionDto {
  title: string;
  sortOrder: string;
  items: WatchlistListItemDto[];
}

export interface WatchlistAlertsPanelDto {
  title: string;
  body: string;
  ctaLabel: string;
  items: WatchlistAlertItemDto[];
}

export interface WatchlistStateBlockDto {
  eyebrow: string;
  headline: string;
  body: string;
  pill: string;
}

export interface WatchlistQuickOverviewMetricDto {
  label: string;
  value: string | number;
}

export interface WatchlistQuickOverviewDto {
  title: string;
  body: string;
  metrics: WatchlistQuickOverviewMetricDto[];
}

export interface WatchlistSessionClosingDto {
  title: string;
  body: string;
}

export interface WatchlistTabBarItemDto {
  label: string;
  key: string;
}

export interface WatchlistTabBarDto {
  activeTab: string;
  items: WatchlistTabBarItemDto[];
}

export interface WatchlistResponse {
  referenceDate: string;
  mode: string;
  pageTemplate: string;
  header: WatchlistHeaderDto;
  tabBar: WatchlistTabBarDto | null;
  stateBlock: WatchlistStateBlockDto | null;
  prioritySection: WatchlistPrioritySectionDto | null;
  priorityItems: WatchlistPriorityItemDto[];
  updatesSection: WatchlistUpdatesSectionDto | null;
  listSection: WatchlistListSectionDto | null;
  quickOverview: WatchlistQuickOverviewDto | null;
  alertsPanel: WatchlistAlertsPanelDto | null;
  sessionClosing: WatchlistSessionClosingDto | null;
  manifestVersion: string;
  renderedAt: string;
}

export interface WatchlistItemResponse {
  ticker: string;
  createdAt: string;
}

export interface AddWatchlistItemsBatchResponse {
  added: string[];
  skipped: string[];
  invalid: string[];
}

// ─── Chamadas HTTP ────────────────────────────────────────────────────────────

export async function getWatchlist(
  mode: "UPDATES" | "LIST",
  token?: string | null,
  date?: string,
): Promise<WatchlistResponse> {
  const params = new URLSearchParams({ mode });
  if (date) params.set("date", date);
  return apiFetch<WatchlistResponse>(`/api/watchlist?${params.toString()}`, {}, token);
}

export async function getUserWatchlist(token?: string | null): Promise<WatchlistItemResponse[]> {
  return apiFetch<WatchlistItemResponse[]>("/api/me/watchlist", {}, token);
}

export async function addWatchlistItem(
  ticker: string,
  token?: string | null,
): Promise<WatchlistItemResponse> {
  return apiFetch<WatchlistItemResponse>(
    "/api/me/watchlist",
    { method: "POST", body: JSON.stringify({ ticker }) },
    token,
  );
}

export async function addWatchlistItemsBatch(
  tickers: string[],
  token?: string | null,
): Promise<AddWatchlistItemsBatchResponse> {
  return apiFetch<AddWatchlistItemsBatchResponse>(
    "/api/me/watchlist/batch",
    { method: "POST", body: JSON.stringify({ tickers }) },
    token,
  );
}

export async function removeWatchlistItem(ticker: string, token?: string | null): Promise<void> {
  return apiFetch<void>(`/api/me/watchlist/${ticker}`, { method: "DELETE" }, token);
}

// ─── Mapeamentos ──────────────────────────────────────────────────────────────

export const sourceByTicker: Record<string, "CVM" | "B3" | "RI"> = {
  WEGE3:  "CVM",
  ITUB4:  "B3",
  TAEE11: "RI",
  CSAN3:  "CVM",
  FLRY3:  "CVM",
  MRVE3:  "CVM",
  PETR4:  "B3",
  ABEV3:  "CVM",
  GGBR4:  "CVM",
  MGLU3:  "B3",
  RADL3:  "RI",
  VBBR3:  "RI",
};

export const suggestedCompanies = ["BBAS3", "SUZB3", "EQTL3", "LREN3", "RAIL3", "RADL3"];

// ─── Funções puras ────────────────────────────────────────────────────────────

export function getStatusFromScores(scores: number[]): WatchlistStatus {
  const minScore = Math.min(...scores);
  if (minScore < 50) return "Risco";
  if (minScore < 70) return "Atenção";
  return "Saudável";
}

// ─── Helpers internos de parsing ──────────────────────────────────────────────

function parseBadgeAsSeverity(badge: string): FeedSeverity {
  if (badge === "Risco" || badge === "Atenção" || badge === "Saudável") return badge as FeedSeverity;
  return "Saudável";
}

function parsePillar(pillarBadge: string): Pillar {
  const pillars: Pillar[] = ["Dívida", "Caixa", "Margens", "Retorno", "Proventos"];
  return pillars.includes(pillarBadge as Pillar) ? (pillarBadge as Pillar) : "Dívida";
}

function parseSourceFromMeta(metaLine: string): FeedSource {
  if (metaLine.includes("CVM")) return "CVM";
  if (metaLine.includes(" RI") || metaLine.includes("• RI") || metaLine.startsWith("RI")) return "RI";
  if (metaLine.includes("B3")) return "B3";
  return "CVM";
}

function scoreFromBadge(badge: string): number[] {
  if (badge === "Risco") return [30];
  if (badge === "Atenção") return [65];
  return [80];
}

// ─── Funções de transformação API → UI ───────────────────────────────────────

export function mapPriorityItemDto(dto: WatchlistPriorityItemDto, index: number): PriorityItem {
  return {
    id: dto.ticker || `p-${index}`,
    company:     dto.companyName,
    ticker:      dto.ticker,
    // sectorLabel pode ser null — o componente deve checar antes de renderizar
    sector:      dto.sectorLabel,
    badge:       dto.badge,
    // topTag é o label de destaque do card ("Comece por aqui", etc.)
    // NÃO deve ser interpretado como pilar
    topTag:      dto.topTag,
    contextLine: dto.contextLine,
    changeLabel: dto.whatChangedLabel,
    change:      dto.whatChanged,
    whyLabel:    dto.whyMattersLabel,
    why:         dto.whyMatters,
    evidence:    dto.metaLine,
    ctaLabel:    dto.ctaLabel,
    // O endpoint priorityItems não envia pillar; mantém "Dívida" como fallback
    // para não quebrar o deep-link de navegação até o backend expor o campo
    pillar:      "Dívida",
  };
}

export function mapFeedItemDto(dto: WatchlistFeedItemDto, index: number): FeedItem {
  return {
    id: `f-${index}`,
    headline:  dto.title,
    detail:    dto.body,
    detailTwo: dto.watchLine,
    pillar:    parsePillar(dto.pillarBadge),
    evidence:  dto.metaLine,
    ctaLabel:  dto.ctaLabel,
    ticker:    "",     // updatesSection.items não carrega ticker
    severity:  parseBadgeAsSeverity(dto.badge),
    source:    parseSourceFromMeta(dto.metaLine),
    range:     "30d",  // updatesSection.items não carrega range
  };
}

export function mapListItemDto(dto: WatchlistListItemDto): WatchlistCompany {
  return {
    name: dto.companyName,
    ticker: dto.ticker,
    sector: dto.sectorLabel,
    scores: scoreFromBadge(dto.badge),
    lastChangeDays: 0,
    freshness: dto.pendingDataBadge ? "Falha" : "Atual",
    attentionPillar: "Dívida",
    tags: [],
  };
}

export function mapAlertItemDto(dto: WatchlistAlertItemDto, index: number): AlertItem {
  return {
    id: `a-${index}`,
    title: dto.title,
    summary: dto.body,
    time: dto.timeLabel,
    severity: parseBadgeAsSeverity(dto.badge),
  };
}

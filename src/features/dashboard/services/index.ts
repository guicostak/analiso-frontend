/**
 * Dashboard service.
 *
 * Responsabilidades:
 *  1. Tipos que espelham os DTOs do backend (DashboardResponse e relacionados)
 *  2. Funções de transformação entre formato da API e formato de UI
 *  3. Chamadas HTTP (getDashboard)
 *
 * Independente de React — sem imports de hooks ou JSX.
 */

import { apiFetch } from "@/src/lib/api";
import type {
  Status,
  Pillar,
  InboxSource,
  InboxEventType,
  InboxSeedItem,
  ChangeFeedItem,
  FeedPillar,
  HeatmapCelula,
  HeatmapNivel,
} from "../interfaces";

// ─── DTOs do backend ──────────────────────────────────────────────────────────

export interface DashboardSummary {
  headline: string;
  body: string | null;
  ctaPrimary: string;
}

export interface DashboardNextStep {
  headline: string;
  body: string | null;
}

export interface DashboardSessionClosing {
  headline: string;
  body: string | null;
}

export interface DashboardCard {
  badge: string;
  title: string;
  whyItMatters: string;
  ctaLabel: string;
}

export interface DashboardDetail {
  entryReason: string;
  benefitNow: string;
}

export interface DashboardExtra {
  badge: string | null;
  line: string | null;
}

export interface DashboardItem {
  ticker: string;
  pillar: string;
  priorityScore: number;
  priorityRank: number;
  primaryTemplate: string;
  overlays: string[];
  card: DashboardCard;
  detail: DashboardDetail;
  extra: DashboardExtra;
  logoUrl: string | null;
}

export interface DashboardResponse {
  referenceDate: string;
  dayTemplate: string;
  summary: DashboardSummary;
  nextStep: DashboardNextStep;
  sessionClosing: DashboardSessionClosing;
  items: DashboardItem[];
  manifestVersion: string;
  renderedAt: string;
}

// ─── Chamada HTTP ─────────────────────────────────────────────────────────────

export async function getDashboard(token?: string | null): Promise<DashboardResponse> {
  return apiFetch<DashboardResponse>("/api/dashboard", {}, token);
}

// ─── Mapeamentos ──────────────────────────────────────────────────────────────

export const companyNameByTicker: Record<string, string> = {
  VALE3: "Vale",
  PETR4: "Petrobras",
  PETR3: "Petrobras",
  ITUB4: "Itaú Unibanco",
  ITUB3: "Itaú Unibanco",
  BBAS3: "Banco do Brasil",
  BBDC4: "Bradesco",
  BBDC3: "Bradesco",
  ABEV3: "Ambev",
  WEGE3: "WEG",
  RENT3: "Localiza",
  LREN3: "Lojas Renner",
  MGLU3: "Magazine Luiza",
  MRVE3: "MRV Engenharia",
  TAEE11: "Taesa",
  FLRY3: "Fleury",
  CSAN3: "Cosan",
};

// ─── Funções de transformação API → UI ────────────────────────────────────────

export function apiPillarToDashboard(apiPillar: string): Pillar | undefined {
  const map: Record<string, Pillar> = {
    debt: "Dívida",
    cash: "Caixa",
    profitability: "Margens",
    growth: "Retorno",
    dividends: "Proventos",
  };
  return map[apiPillar];
}

export function apiTemplateToSeverity(template: string): Status {
  if (
    template === "ITEM_HIGH_RISK_ACTIONABLE" ||
    template === "ITEM_HIGH_RISK_VALIDATE"
  )
    return "Risco";
  if (
    template === "ITEM_MEDIUM_RISK_MONITOR" ||
    template === "ITEM_EVENT_AHEAD" ||
    template === "ITEM_MIXED_SIGNALS"
  )
    return "Atenção";
  return "Saudável";
}

/**
 * Converte os itens da resposta da API para o formato InboxSeedItem usado pela UI.
 */
export function mapApiItemsToInboxSeed(
  items: DashboardItem[],
): InboxSeedItem[] {
  return items.map((item, idx) => ({
    id: `api-${item.ticker}-${item.pillar}-${item.priorityRank}`,
    companyId: item.ticker,
    ticker: item.ticker,
    companyName: companyNameByTicker[item.ticker] ?? item.ticker,
    logoUrl: item.logoUrl,
    badge: item.card.badge,
    title: item.card.title,
    whyItMatters: item.card.whyItMatters,
    ctaLabel: item.card.ctaLabel,
    entryReason: item.detail.entryReason,
    benefitNow: item.detail.benefitNow,
    extraBadge: item.extra.badge,
    extraLine: item.extra.line,
    overlays: item.overlays,
    primaryTemplate: item.primaryTemplate,
    priorityRank: item.priorityRank,
    severity: apiTemplateToSeverity(item.primaryTemplate),
    pillarKey: apiPillarToDashboard(item.pillar),
    source: undefined as InboxSource | undefined,
    ageMinutes: (item.priorityRank - 1) * 8 + 1,
    impactScore: item.priorityScore || Math.max(1, 100 - idx * 7),
    eventType: "mudanca" as InboxEventType,
  }));
}

// ─── Changes-Feed helpers ─────────────────────────────────────────────────────

export const feedPillarLabels: Record<FeedPillar, string> = {
  crescimento: 'Crescimento',
  rentabilidade: 'Rentabilidade',
  'saude-financeira': 'Saúde Financeira',
  valuation: 'Valuation',
  momentum: 'Momentum',
};

export const feedPillarColors: Record<FeedPillar, string> = {
  crescimento: 'text-blue-600 bg-blue-50 border-blue-200',
  rentabilidade: 'text-emerald-600 bg-emerald-50 border-emerald-200',
  'saude-financeira': 'text-purple-600 bg-purple-50 border-purple-200',
  valuation: 'text-orange-600 bg-orange-50 border-orange-200',
  momentum: 'text-pink-600 bg-pink-50 border-pink-200',
};

export function getChangeFeed(): ChangeFeedItem[] {
  return [];
}

// ─── Heatmap helpers ──────────────────────────────────────────────────────────

export function getHeatmapData(): {
  datas: string[];
  empresas: string[];
  data: Record<string, Record<string, HeatmapCelula>>;
} {
  return { datas: [], empresas: [], data: {} };
}

export function toneForCell(
  cell: HeatmapCelula,
  selected: HeatmapNivel[],
): { bg: string; border: string; text: string } {
  const s = selected.includes("Saudavel") ? cell.saudavel : 0;
  const a = selected.includes("Atencao") ? cell.atencao : 0;
  const r = selected.includes("Risco") ? cell.risco : 0;

  if (r > 0) return { bg: "bg-[rgba(220,38,38,0.10)]", border: "border-[rgba(220,38,38,0.22)]", text: "text-[#991B1B]" };
  if (a > 0) return { bg: "bg-[rgba(217,119,6,0.12)]", border: "border-[rgba(217,119,6,0.25)]", text: "text-[#92400E]" };
  if (s > 0) return { bg: "bg-[rgba(22,163,74,0.10)]", border: "border-[rgba(22,163,74,0.22)]", text: "text-[#166534]" };
  return { bg: "bg-[#F3F4F6]", border: "border-[#E5E7EB]", text: "text-[#9CA3AF]" };
}

export function cellCount(cell: HeatmapCelula, niveisAtivos: HeatmapNivel[]): number {
  const s = niveisAtivos.includes("Saudavel") ? cell.saudavel : 0;
  const a = niveisAtivos.includes("Atencao") ? cell.atencao : 0;
  const r = niveisAtivos.includes("Risco") ? cell.risco : 0;
  return s + a + r;
}

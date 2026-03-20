/**
 * Tipos de UI do Dashboard.
 *
 * Tipos que espelham DTOs da API ficam em src/services/dashboard.ts.
 * Aqui ficam os tipos que representam o estado e os dados da camada de UI.
 */

export type Status = "Saudável" | "Atenção" | "Risco";
export type Pillar = "Dívida" | "Caixa" | "Margens" | "Retorno" | "Proventos";
export type WindowRange = "24h" | "7d" | "30d";
export type InboxSource = "CVM" | "B3" | "RI";
export type InboxSort = "Impacto" | "Mais recente";
export type InboxEventType = "mudanca" | "evento_futuro";
export type InboxMode = "top-impacto" | "tempo-real";

// ─── Changes-Feed types ───────────────────────────────────────────────────────

export type FeedSeverity = 'leve' | 'moderada' | 'forte';
export type CompanyStatus = 'saudavel' | 'atencao' | 'risco';
export type FeedPillar = 'crescimento' | 'rentabilidade' | 'saude-financeira' | 'valuation' | 'momentum';
export type DataFreshness = 'atualizado' | 'recente' | 'antigo';

export interface ChangeFeedItem {
  id: string;
  ticker: string;
  companyName: string;
  severity: FeedSeverity;
  status: CompanyStatus;
  whatChanged: string;
  whyMatters: string;
  pillar: FeedPillar;
  date: string;
  source: string;
  freshness: DataFreshness;
  freshnessLabel: string;
}

// ─── Heatmap types ────────────────────────────────────────────────────────────

export type HeatmapNivel = "Saudavel" | "Atencao" | "Risco";
export type HeatmapPeriodoSegment = "Diario" | "Semanal" | "Mensal" | "Anual";
export type HeatmapPilar = "Divida" | "Caixa" | "Margens" | "Retorno" | "Proventos";
export type HeatmapFonte = "CVM" | "B3" | "RI";

export interface HeatmapCelula {
  saudavel: number;
  atencao: number;
  risco: number;
  detalhe: {
    pilar: HeatmapPilar;
    severidade: HeatmapNivel;
    evento: string;
    fonte: HeatmapFonte;
  };
}

export interface HeatmapSelection {
  ticker: string;
  date: string;
  pillar: HeatmapPilar;
}

export interface PillarMovement {
  pillar: Pillar;
  events: number;
  trendLabel: string;
  trendUp: boolean;
  risk: number;
  attention: number;
  healthy: number;
}

export interface InboxSeedItem {
  id: string;
  companyId: string;
  ticker: string;
  companyName: string;
  title: string;
  whyItMatters: string;
  severity: Status;
  pillarKey?: Pillar;
  source?: InboxSource;
  ageMinutes: number;
  impactScore: number;
  eventType: InboxEventType;
}

export type InboxItem = Omit<InboxSeedItem, "ageMinutes"> & {
  timestamp: string;
  relativeTime: string;
  ageMinutes: number;
};

export interface InboxFilters {
  period: WindowRange;
  severities: Status[];
  pillars: Pillar[];
  sources: InboxSource[];
  sortBy: InboxSort;
}

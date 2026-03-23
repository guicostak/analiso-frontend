/**
 * Dashboard service.
 *
 * Responsabilidades:
 *  1. Tipos que espelham os DTOs do backend (DashboardResponse e relacionados)
 *  2. Dados mock usados enquanto a API real não está disponível (inboxSeed, pillarMovements)
 *  3. Funções de transformação entre formato da API e formato de UI
 *  4. Chamadas HTTP (getDashboard)
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
  PillarMovement,
  ChangeFeedItem,
  FeedPillar,
  HeatmapCelula,
  HeatmapNivel,
  HeatmapPilar,
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

// ─── Dados mock (fallback enquanto API não está disponível) ───────────────────

export const inboxSeed: InboxSeedItem[] = [
  {
    id: "evt-vale-divida-1",
    companyId: "VALE3",
    ticker: "VALE3",
    companyName: "Vale",
    title: "Dívida líquida/EBITDA acima do limite interno",
    whyItMatters: "Aumento da alavancagem pode reduzir flexibilidade financeira.",
    severity: "Risco",
    pillarKey: "Dívida",
    source: "CVM",
    ageMinutes: 3,
    impactScore: 99,
    eventType: "mudanca",
  },
  {
    id: "evt-lren-margens-1",
    companyId: "LREN3",
    ticker: "LREN3",
    companyName: "Lojas Renner",
    title: "Margens pressionadas no trimestre",
    whyItMatters: "Compressão de margem pode limitar revisão positiva de lucro.",
    severity: "Atenção",
    pillarKey: "Margens",
    source: "RI",
    ageMinutes: 11,
    impactScore: 84,
    eventType: "mudanca",
  },
  {
    id: "evt-mrve-caixa-1",
    companyId: "MRVE3",
    ticker: "MRVE3",
    companyName: "MRV Engenharia",
    title: "Queda em caixa livre no período",
    whyItMatters: "Menor geração de caixa aumenta risco de execução no curto prazo.",
    severity: "Atenção",
    pillarKey: "Caixa",
    source: "B3",
    ageMinutes: 17,
    impactScore: 81,
    eventType: "mudanca",
  },
  {
    id: "evt-taee-retorno-1",
    companyId: "TAEE11",
    ticker: "TAEE11",
    companyName: "Taesa",
    title: "Retorno segue resiliente",
    whyItMatters: "Indicadores estáveis sinalizam consistência operacional.",
    severity: "Saudável",
    pillarKey: "Retorno",
    source: "RI",
    ageMinutes: 44,
    impactScore: 58,
    eventType: "mudanca",
  },
  {
    id: "evt-itub-proventos-1",
    companyId: "ITUB4",
    ticker: "ITUB4",
    companyName: "Itaú Unibanco",
    title: "Proventos em trajetória estável",
    whyItMatters: "Consistência em distribuição reforça previsibilidade de retorno.",
    severity: "Saudável",
    pillarKey: "Proventos",
    source: "RI",
    ageMinutes: 130,
    impactScore: 49,
    eventType: "mudanca",
  },
  {
    id: "evt-weg-evento-1",
    companyId: "WEGE3",
    ticker: "WEGE3",
    companyName: "WEG",
    title: "Resultado 4T25 agendado para esta semana",
    whyItMatters: "Evento futuro pode alterar diagnóstico de Margens e Retorno.",
    severity: "Atenção",
    pillarKey: "Margens",
    source: "RI",
    ageMinutes: 260,
    impactScore: 76,
    eventType: "evento_futuro",
  },
  {
    id: "evt-vale-caixa-2",
    companyId: "VALE3",
    ticker: "VALE3",
    companyName: "Vale",
    title: "Geração de caixa abaixo da referência",
    whyItMatters: "Pode elevar dependência de financiamento no curto prazo.",
    severity: "Risco",
    pillarKey: "Caixa",
    source: "CVM",
    ageMinutes: 1220,
    impactScore: 90,
    eventType: "mudanca",
  },
  {
    id: "evt-weg-margens-2",
    companyId: "WEGE3",
    ticker: "WEGE3",
    companyName: "WEG",
    title: "Margem bruta cedeu no trimestre",
    whyItMatters: "Pode reduzir ganho operacional se o mix piorar.",
    severity: "Atenção",
    pillarKey: "Margens",
    source: "CVM",
    ageMinutes: 3160,
    impactScore: 73,
    eventType: "mudanca",
  },
  {
    id: "evt-itub-retorno-2",
    companyId: "ITUB4",
    ticker: "ITUB4",
    companyName: "Itaú Unibanco",
    title: "ROE mantém acima da referência",
    whyItMatters: "Sinaliza eficiência de alocação de capital no ciclo.",
    severity: "Saudável",
    pillarKey: "Retorno",
    source: "B3",
    ageMinutes: 7420,
    impactScore: 52,
    eventType: "mudanca",
  },
];

// ─── Changes-Feed mock data ───────────────────────────────────────────────────

export const mockChangeFeed: ChangeFeedItem[] = [
  {
    id: '1',
    ticker: 'WEGE3',
    companyName: 'WEG S.A.',
    severity: 'moderada',
    status: 'saudavel',
    whatChanged: 'ROE subiu 2,4 p.p. para 22,5%',
    whyMatters: 'Maior retorno sobre patrimônio em 5 anos, sinalizando eficiência crescente na alocação de capital',
    pillar: 'rentabilidade',
    date: '2024-02-05',
    source: 'Divulgação de Resultados T1 2024',
    freshness: 'atualizado',
    freshnessLabel: 'há 2 horas',
  },
  {
    id: '2',
    ticker: 'VALE3',
    companyName: 'Vale S.A.',
    severity: 'forte',
    status: 'atencao',
    whatChanged: 'Dívida líquida aumentou R$ 8,2B no trimestre',
    whyMatters: 'Alavancagem subiu para 1,8x EBITDA, próxima do limite de 2x estabelecido pela gestão',
    pillar: 'saude-financeira',
    date: '2024-02-04',
    source: 'Relatório Trimestral (ITR)',
    freshness: 'atualizado',
    freshnessLabel: 'ontem',
  },
  {
    id: '3',
    ticker: 'ITUB4',
    companyName: 'Itaú Unibanco',
    severity: 'leve',
    status: 'saudavel',
    whatChanged: 'Guidance de crescimento de carteira elevado para 8-11%',
    whyMatters: 'Aumento reflete confiança na recuperação do crédito e expansão controlada',
    pillar: 'crescimento',
    date: '2024-02-03',
    source: 'Apresentação de Resultados',
    freshness: 'recente',
    freshnessLabel: 'há 2 dias',
  },
  {
    id: '4',
    ticker: 'PETR4',
    companyName: 'Petrobras',
    severity: 'moderada',
    status: 'saudavel',
    whatChanged: 'Anunciou dividendos extraordinários de R$ 18B',
    whyMatters: 'Representa dividend yield de 4,2%, reforçando política de retorno ao acionista',
    pillar: 'rentabilidade',
    date: '2024-02-02',
    source: 'Fato Relevante',
    freshness: 'recente',
    freshnessLabel: 'há 3 dias',
  },
  {
    id: '5',
    ticker: 'BBDC4',
    companyName: 'Bradesco',
    severity: 'forte',
    status: 'risco',
    whatChanged: 'Inadimplência PF subiu para 5,8% (+0,6 p.p.)',
    whyMatters: 'Deterioração da qualidade de crédito acima da média do setor, pode pressionar provisões',
    pillar: 'saude-financeira',
    date: '2024-02-01',
    source: 'Relatório Trimestral (ITR)',
    freshness: 'recente',
    freshnessLabel: 'há 4 dias',
  },
  {
    id: '6',
    ticker: 'BBAS3',
    companyName: 'Banco do Brasil',
    severity: 'leve',
    status: 'saudavel',
    whatChanged: 'Margem financeira expandiu 180 bps',
    whyMatters: 'Melhora na rentabilidade core impulsionada por mix de crédito favorável',
    pillar: 'rentabilidade',
    date: '2024-01-31',
    source: 'Divulgação de Resultados',
    freshness: 'recente',
    freshnessLabel: 'há 5 dias',
  },
  {
    id: '7',
    ticker: 'ABEV3',
    companyName: 'Ambev',
    severity: 'moderada',
    status: 'atencao',
    whatChanged: 'Volume Brasil caiu 3,2% vs ano anterior',
    whyMatters: 'Queda acima do esperado indica perda de market share e desafios competitivos',
    pillar: 'crescimento',
    date: '2024-01-30',
    source: 'Relatório Operacional',
    freshness: 'antigo',
    freshnessLabel: 'há 6 dias',
  },
  {
    id: '8',
    ticker: 'RAIL3',
    companyName: 'Rumo S.A.',
    severity: 'leve',
    status: 'saudavel',
    whatChanged: 'Volume transportado cresceu 12% a/a',
    whyMatters: 'Crescimento robusto sustentado por safra forte e ganhos de participação',
    pillar: 'crescimento',
    date: '2024-01-29',
    source: 'Divulgação Operacional',
    freshness: 'antigo',
    freshnessLabel: 'há 7 dias',
  },
];

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
  return mockChangeFeed;
}

// ─── Pillar movements mock data ───────────────────────────────────────────────

export const pillarMovements: PillarMovement[] = [
  { pillar: "Dívida",    events: 12, trendLabel: "up 18%",  trendUp: true,  risk: 3, attention: 7, healthy: 2 },
  { pillar: "Margens",   events: 9,  trendLabel: "up 10%",  trendUp: true,  risk: 2, attention: 6, healthy: 1 },
  { pillar: "Caixa",     events: 7,  trendLabel: "down 6%", trendUp: false, risk: 1, attention: 2, healthy: 4 },
  { pillar: "Proventos", events: 5,  trendLabel: "up 4%",   trendUp: true,  risk: 0, attention: 2, healthy: 3 },
  { pillar: "Retorno",   events: 4,  trendLabel: "up 3%",   trendUp: true,  risk: 0, attention: 1, healthy: 3 },
];

// ─── Heatmap mock data ────────────────────────────────────────────────────────

export const heatmapDatas: string[] = ["01/02", "02/02", "03/02", "04/02", "05/02", "06/02", "07/02"];
export const heatmapEmpresas: string[] = ["VALE3", "LREN3", "ITUB4", "WEGE3", "MRVE3"];

export const heatmapData: Record<string, Record<string, HeatmapCelula>> = {
  VALE3: {
    "01/02": { saudavel: 0, atencao: 1, risco: 0, detalhe: { pilar: "Divida", severidade: "Atencao", evento: "Divida liq./EBITDA subiu", fonte: "CVM" } },
    "02/02": { saudavel: 0, atencao: 1, risco: 0, detalhe: { pilar: "Margens", severidade: "Atencao", evento: "Custos unitarios em alta", fonte: "RI" } },
    "03/02": { saudavel: 0, atencao: 0, risco: 1, detalhe: { pilar: "Divida", severidade: "Risco", evento: "Cobertura de juros enfraqueceu", fonte: "CVM" } },
    "04/02": { saudavel: 0, atencao: 1, risco: 0, detalhe: { pilar: "Retorno", severidade: "Atencao", evento: "ROIC desacelerou", fonte: "RI" } },
    "05/02": { saudavel: 1, atencao: 0, risco: 0, detalhe: { pilar: "Proventos", severidade: "Saudavel", evento: "Politica de payout mantida", fonte: "RI" } },
    "06/02": { saudavel: 0, atencao: 0, risco: 1, detalhe: { pilar: "Divida", severidade: "Risco", evento: "Divida liq./EBITDA subiu", fonte: "CVM" } },
    "07/02": { saudavel: 0, atencao: 1, risco: 0, detalhe: { pilar: "Caixa", severidade: "Atencao", evento: "Caixa operacional pressionado", fonte: "B3" } },
  },
  LREN3: {
    "01/02": { saudavel: 1, atencao: 0, risco: 0, detalhe: { pilar: "Margens", severidade: "Saudavel", evento: "Mix comercial melhorou", fonte: "RI" } },
    "02/02": { saudavel: 0, atencao: 1, risco: 0, detalhe: { pilar: "Margens", severidade: "Atencao", evento: "Margem bruta recuou", fonte: "CVM" } },
    "03/02": { saudavel: 0, atencao: 1, risco: 0, detalhe: { pilar: "Caixa", severidade: "Atencao", evento: "Consumo de caixa cresceu", fonte: "RI" } },
    "04/02": { saudavel: 0, atencao: 1, risco: 0, detalhe: { pilar: "Retorno", severidade: "Atencao", evento: "Retorno sobre capital caiu", fonte: "B3" } },
    "05/02": { saudavel: 0, atencao: 1, risco: 0, detalhe: { pilar: "Margens", severidade: "Atencao", evento: "Custo de vendas acelerou", fonte: "CVM" } },
    "06/02": { saudavel: 0, atencao: 0, risco: 1, detalhe: { pilar: "Margens", severidade: "Risco", evento: "Margem critica no trimestre", fonte: "CVM" } },
    "07/02": { saudavel: 1, atencao: 0, risco: 0, detalhe: { pilar: "Proventos", severidade: "Saudavel", evento: "Distribuicao confirmada", fonte: "RI" } },
  },
  ITUB4: {
    "01/02": { saudavel: 1, atencao: 0, risco: 0, detalhe: { pilar: "Retorno", severidade: "Saudavel", evento: "ROE estavel", fonte: "CVM" } },
    "02/02": { saudavel: 1, atencao: 0, risco: 0, detalhe: { pilar: "Caixa", severidade: "Saudavel", evento: "Liquidez robusta", fonte: "B3" } },
    "03/02": { saudavel: 1, atencao: 0, risco: 0, detalhe: { pilar: "Proventos", severidade: "Saudavel", evento: "Payout recorrente", fonte: "RI" } },
    "04/02": { saudavel: 1, atencao: 0, risco: 0, detalhe: { pilar: "Divida", severidade: "Saudavel", evento: "Capitacao equilibrada", fonte: "CVM" } },
    "05/02": { saudavel: 1, atencao: 0, risco: 0, detalhe: { pilar: "Retorno", severidade: "Saudavel", evento: "Rentabilidade consistente", fonte: "RI" } },
    "06/02": { saudavel: 0, atencao: 1, risco: 0, detalhe: { pilar: "Margens", severidade: "Atencao", evento: "Spread menor no dia", fonte: "B3" } },
    "07/02": { saudavel: 1, atencao: 0, risco: 0, detalhe: { pilar: "Caixa", severidade: "Saudavel", evento: "Folga de liquidez", fonte: "RI" } },
  },
  WEGE3: {
    "01/02": { saudavel: 1, atencao: 0, risco: 0, detalhe: { pilar: "Caixa", severidade: "Saudavel", evento: "Geracao de caixa forte", fonte: "CVM" } },
    "02/02": { saudavel: 1, atencao: 0, risco: 0, detalhe: { pilar: "Margens", severidade: "Saudavel", evento: "Eficiencia operacional", fonte: "RI" } },
    "03/02": { saudavel: 0, atencao: 1, risco: 0, detalhe: { pilar: "Retorno", severidade: "Atencao", evento: "ROIC abaixo da media", fonte: "B3" } },
    "04/02": { saudavel: 1, atencao: 0, risco: 0, detalhe: { pilar: "Proventos", severidade: "Saudavel", evento: "Politica mantida", fonte: "RI" } },
    "05/02": { saudavel: 1, atencao: 0, risco: 0, detalhe: { pilar: "Divida", severidade: "Saudavel", evento: "Alavancagem em linha", fonte: "CVM" } },
    "06/02": { saudavel: 1, atencao: 0, risco: 0, detalhe: { pilar: "Caixa", severidade: "Saudavel", evento: "Conversao melhorou", fonte: "RI" } },
    "07/02": { saudavel: 0, atencao: 1, risco: 0, detalhe: { pilar: "Margens", severidade: "Atencao", evento: "Pressao em insumos", fonte: "B3" } },
  },
  MRVE3: {
    "01/02": { saudavel: 0, atencao: 1, risco: 0, detalhe: { pilar: "Caixa", severidade: "Atencao", evento: "Caixa abaixo da media", fonte: "B3" } },
    "02/02": { saudavel: 0, atencao: 1, risco: 0, detalhe: { pilar: "Divida", severidade: "Atencao", evento: "Custo de divida subiu", fonte: "CVM" } },
    "03/02": { saudavel: 0, atencao: 0, risco: 1, detalhe: { pilar: "Divida", severidade: "Risco", evento: "Alavancagem em nivel critico", fonte: "CVM" } },
    "04/02": { saudavel: 0, atencao: 1, risco: 0, detalhe: { pilar: "Retorno", severidade: "Atencao", evento: "Retorno em queda", fonte: "RI" } },
    "05/02": { saudavel: 0, atencao: 1, risco: 0, detalhe: { pilar: "Margens", severidade: "Atencao", evento: "Margem operacional comprimida", fonte: "CVM" } },
    "06/02": { saudavel: 0, atencao: 0, risco: 1, detalhe: { pilar: "Caixa", severidade: "Risco", evento: "Queima de caixa acelerou", fonte: "B3" } },
    "07/02": { saudavel: 0, atencao: 1, risco: 0, detalhe: { pilar: "Proventos", severidade: "Atencao", evento: "Distribuicao reduzida", fonte: "RI" } },
  },
};

export function getHeatmapData(): {
  datas: string[];
  empresas: string[];
  data: Record<string, Record<string, HeatmapCelula>>;
} {
  return { datas: heatmapDatas, empresas: heatmapEmpresas, data: heatmapData };
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

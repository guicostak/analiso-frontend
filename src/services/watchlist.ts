/**
 * Watchlist service.
 *
 * Responsabilidades:
 *  1. Dados mock (priorityItems, feedItems, watchlistCompanies, alerts)
 *  2. Mapeamentos auxiliares (sourceByTicker)
 *  3. Funções puras de transformação/cálculo de status
 *
 * Independente de React — sem imports de hooks ou JSX.
 * Preparado para substituição por chamadas HTTP reais.
 */

import type {
  PriorityItem,
  FeedItem,
  WatchlistCompany,
  AlertItem,
  WatchlistStatus,
} from "../types/watchlist";

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

// ─── Funções puras ────────────────────────────────────────────────────────────

export function getStatusFromScores(scores: number[]): WatchlistStatus {
  const minScore = Math.min(...scores);
  if (minScore < 50) return "Risco";
  if (minScore < 70) return "Atenção";
  return "Saudável";
}

// ─── Dados mock ───────────────────────────────────────────────────────────────

export const priorityItems: PriorityItem[] = [
  {
    id: "p1",
    company: "Cosan",
    ticker: "CSAN3",
    sector: "Consumo",
    badge: "Risco",
    change: "Dívida líquida subiu 18% em 90 dias.",
    why: "Aumenta pressão sobre caixa e pode limitar investimento.",
    evidence: "Fonte: CVM • ITR 3T25 • 04/02",
    pillar: "Dívida",
    evidenceId: "divida-1",
  },
  {
    id: "p2",
    company: "MRV",
    ticker: "MRVE3",
    sector: "Construção",
    badge: "Atenção",
    change: "Margens pressionadas no último trimestre reportado.",
    why: "Pode limitar recuperação de resultado e pede monitoramento de custos.",
    evidence: "Fonte: CVM • ITR 2T25 • 12/11",
    pillar: "Margens",
    evidenceId: "margens-1",
  },
  {
    id: "p3",
    company: "Taesa",
    ticker: "TAEE11",
    sector: "Energia",
    badge: "Atenção",
    change: "Proventos abaixo do histórico de 12 meses.",
    why: "Reduz previsibilidade de renda no curto prazo.",
    evidence: "Fonte: RI • Comunicado • 02/02",
    pillar: "Proventos",
    evidenceId: "proventos-1",
  },
  {
    id: "p4",
    company: "Azul",
    ticker: "AZUL4",
    sector: "Transportes",
    badge: "Atenção",
    change: "Caixa líquido caiu para o menor nível em 4 trimestres.",
    why: "Menos flexibilidade para atravessar períodos de alta de custos.",
    evidence: "Fonte: CVM • ITR 3T25 • 03/02",
    pillar: "Caixa",
    evidenceId: "caixa-1",
  },
];

export const feedItems: FeedItem[] = [
  {
    id: "f1",
    headline: "Dívida subiu acima da média setorial.",
    detail: "Comparado ao setor, a alavancagem ficou 1,3x acima.",
    detailTwo: "O que observar: renegociação e cronograma de amortização.",
    pillar: "Dívida",
    evidence: "Fonte: CVM • ITR 3T25 • 04/02",
    ticker: "CSAN3",
    severity: "Risco",
    source: "CVM",
    range: "30d",
    evidenceId: "divida-1",
  },
  {
    id: "f2",
    headline: "Caixa voltou para faixa confortável.",
    detail: "Liquidez recuperou após duas captações recentes.",
    detailTwo: "O que observar: manutenção do ritmo de geração de caixa.",
    pillar: "Caixa",
    evidence: "Fonte: RI • 05/02",
    ticker: "WEGE3",
    severity: "Saudável",
    source: "RI",
    range: "7d",
    evidenceId: "caixa-1",
  },
  {
    id: "f3",
    headline: "Margens operacionais melhoraram 0,8 p.p.",
    detail: "Recuperação gradual de custos de insumos.",
    detailTwo: "O que observar: impacto em fluxo de caixa livre.",
    pillar: "Margens",
    evidence: "Fonte: CVM • ITR 3T25 • 04/02",
    ticker: "FLRY3",
    severity: "Atenção",
    source: "CVM",
    range: "30d",
    evidenceId: "margens-1",
  },
  {
    id: "f4",
    headline: "Retorno sobre capital ficou abaixo do histórico.",
    detail: "ROIC caiu pelo segundo trimestre consecutivo.",
    detailTwo: "O que observar: eficiência operacional e reinvestimento.",
    pillar: "Retorno",
    evidence: "Fonte: CVM • ITR 3T25 • 02/02",
    ticker: "ABEV3",
    severity: "Atenção",
    source: "CVM",
    range: "90d",
    evidenceId: "retorno-1",
  },
  {
    id: "f5",
    headline: "Proventos mais estáveis após 2 trimestres.",
    detail: "Payout normalizado acima do mínimo histórico.",
    detailTwo: "O que observar: guidance de distribuição.",
    pillar: "Proventos",
    evidence: "Fonte: RI • 01/02",
    ticker: "ITUB4",
    severity: "Saudável",
    source: "RI",
    range: "30d",
    evidenceId: "proventos-1",
  },
  {
    id: "f6",
    headline: "Dívida em moeda estrangeira aumentou.",
    detail: "Mais exposição cambial no curto prazo.",
    detailTwo: "O que observar: hedge e sensibilidade ao câmbio.",
    pillar: "Dívida",
    evidence: "Fonte: CVM • ITR 3T25 • 04/02",
    ticker: "GGBR4",
    severity: "Risco",
    source: "CVM",
    range: "90d",
    evidenceId: "divida-2",
  },
];

export const watchlistCompanies: WatchlistCompany[] = [
  { name: "WEG",             ticker: "WEGE3",  sector: "Indústria",   scores: [78, 84, 72, 80, 64], lastChangeDays: 2,  freshness: "Atual",     volatility: "Baixa",    attentionPillar: "Margens",   tags: ["Qualidade", "Defensiva"] },
  { name: "Itaú Unibanco",   ticker: "ITUB4",  sector: "Bancos",      scores: [72, 78, 70, 76, 74], lastChangeDays: 4,  freshness: "Atual",     volatility: "Baixa",    attentionPillar: "Retorno",   tags: ["Dividendos"] },
  { name: "Taesa",           ticker: "TAEE11", sector: "Energia",     scores: [56, 62, 60, 64, 82], lastChangeDays: 6,  freshness: "Atual",     volatility: "Moderada", attentionPillar: "Proventos", tags: ["Renda"] },
  { name: "Cosan",           ticker: "CSAN3",  sector: "Consumo",     scores: [42, 58, 46, 52, 48], lastChangeDays: 1,  freshness: "Falha",     volatility: "Alta",     attentionPillar: "Dívida",    tags: ["Cíclica"] },
  { name: "Fleury",          ticker: "FLRY3",  sector: "Saúde",       scores: [70, 74, 68, 72, 58], lastChangeDays: 3,  freshness: "Atual",     volatility: "Baixa",    attentionPillar: "Margens",   tags: ["Qualidade"] },
  { name: "MRV",             ticker: "MRVE3",  sector: "Construção",  scores: [32, 44, 30, 36, 40], lastChangeDays: 12, freshness: "Falha",     volatility: "Alta",     attentionPillar: "Dívida",    tags: ["Risco"] },
  { name: "Petrobras",       ticker: "PETR4",  sector: "Energia",     scores: [60, 66, 58, 64, 70], lastChangeDays: 5,  freshness: "Atual",     volatility: "Moderada", attentionPillar: "Proventos", tags: ["Dividendos"] },
  { name: "Ambev",           ticker: "ABEV3",  sector: "Consumo",     scores: [68, 72, 54, 50, 62], lastChangeDays: 9,  freshness: "Atual",     volatility: "Baixa",    attentionPillar: "Retorno",   tags: ["Defensiva"] },
  { name: "Gerdau",          ticker: "GGBR4",  sector: "Siderurgia",  scores: [50, 60, 56, 58, 52], lastChangeDays: 7,  freshness: "Atual",     volatility: "Moderada", attentionPillar: "Dívida",    tags: ["Cíclica"] },
  { name: "Magazine Luiza",  ticker: "MGLU3",  sector: "Varejo",      scores: [38, 48, 40, 34, 30], lastChangeDays: 14, freshness: "Falha",     volatility: "Alta",     attentionPillar: "Caixa",     tags: ["Risco"] },
  { name: "RaiaDrogasil",    ticker: "RADL3",  sector: "Saúde",       scores: [66, 70, 62, 68, 54], lastChangeDays: 4,  freshness: "Atual",     volatility: "Baixa",    attentionPillar: "Margens",   tags: ["Qualidade"] },
  { name: "Vibra",           ticker: "VBBR3",  sector: "Energia",     scores: [48, 54, 50, 52, 46], lastChangeDays: 8,  freshness: "Sem dados", attentionPillar: "Caixa",     tags: ["Atenção"] },
];

export const watchlistAlerts: AlertItem[] = [
  {
    id: "a1",
    title: "Dívida em atenção (CSAN3)",
    summary: "Alavancagem acima do limite definido na watchlist.",
    time: "Hoje • 10:12",
    severity: "Risco",
  },
  {
    id: "a2",
    title: "Margens em atenção (MRVE3)",
    summary: "Pressão de custos manteve margens abaixo da média setorial.",
    time: "Ontem • 19:40",
    severity: "Atenção",
  },
  {
    id: "a3",
    title: "Proventos abaixo do esperado (TAEE11)",
    summary: "Distribuição ficou 12% abaixo da média 12m.",
    time: "02/02 • 08:30",
    severity: "Atenção",
  },
];

export const suggestedCompanies = ["BBAS3", "SUZB3", "EQTL3", "LREN3", "RAIL3", "RADL3"];

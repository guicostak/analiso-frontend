/**
 * Explore service.
 *
 * Responsabilidades:
 *  1. Dados mock (indexCards, movers, highlights, companies, etc.)
 *  2. Mapeamentos auxiliares (movementInsights, companyLogos)
 *  3. Funções puras de transformação/derivação
 *
 * Independente de React — sem imports de hooks ou JSX.
 * Preparado para substituição por chamadas HTTP reais.
 */

import logoCogna from "@/src/assets/logos/cogna.png";
import logoCosan from "@/src/assets/logos/cosan.png";
import logoEztec from "@/src/assets/logos/eztec.jpg";
import logoFleury from "@/src/assets/logos/fleury.png";
import logoIrb from "@/src/assets/logos/irbbrasil.png";
import logoItau from "@/src/assets/logos/itau.png";
import logoMrv from "@/src/assets/logos/mrv.jpg";
import logoPetrobras from "@/src/assets/logos/petrobras.webp";
import logoRenner from "@/src/assets/logos/renner.png";
import logoRumo from "@/src/assets/logos/rumo.png";
import logoTaesa from "@/src/assets/logos/taesa.png";
import logoVale from "@/src/assets/logos/vale.png";
import logoWeg from "@/src/assets/logos/weg.jpeg";

import type {
  IndexCard,
  IndexCardTrend,
  MoverRow,
  MoverType,
  MovementInsight,
  Volatility,
  HighlightItem,
  HighlightPreset,
  HighlightPillarKey,
  HighlightPillar,
  HighlightSeverity,
  HighlightScopeLabel,
  CompanyCard,
  CompanyStatus,
  CompanySize,
} from "../interfaces";

// ─── DTOs do backend (/api/explore) ──────────────────────────────────────────

export interface ExploreMovementItemDto {
  template:     string;
  badge:        string;
  headline:     string;
  supportLine:  string;
  whyItMatters: string;
  metaLine:     string;
  ctaLabel:     string;
}

export interface ExploreMovementGroupDto {
  title: string;
  items: ExploreMovementItemDto[];
}

export interface ExploreMovementGroupsDto {
  highs:       ExploreMovementGroupDto;
  lows:        ExploreMovementGroupDto;
  mostTraded:  ExploreMovementGroupDto;
}

export interface ExploreMovementInsightsSummaryDto {
  template:  string;
  title:     string;
  body:      string;
  ctaLabel:  string;
}

export interface ExploreMovementInsightsDominantDto {
  template:  string;
  title:     string;
  body:      string;
  ctaLabel:  string;
}

export interface ExploreMovementInsightsDto {
  summary:         ExploreMovementInsightsSummaryDto  | null;
  dominantInsight: ExploreMovementInsightsDominantDto | null;
  groups:          ExploreMovementGroupsDto           | null;
  emptyState:      unknown;
}

export interface ExploreResponse {
  movementInsights: ExploreMovementInsightsDto | null;
}

// ─── Mapeamentos ──────────────────────────────────────────────────────────────

export const companyLogos: Record<string, string> = {
  COGN3:  logoCogna.src,
  CSAN3:  logoCosan.src,
  EZTC3:  logoEztec.src,
  FLRY3:  logoFleury.src,
  IRBR3:  logoIrb.src,
  ITUB4:  logoItau.src,
  LREN3:  logoRenner.src,
  MRVE3:  logoMrv.src,
  PETR4:  logoPetrobras.src,
  RAIL3:  logoRumo.src,
  TAEE11: logoTaesa.src,
  VALE3:  logoVale.src,
  WEGE3:  logoWeg.src,
};

export const pillarLabelMap: Record<HighlightPillarKey, HighlightPillar> = {
  divida:    "Dívida",
  caixa:     "Caixa",
  margens:   "Margens",
  retorno:   "Retorno",
  proventos: "Proventos",
};

export const movementInsights: Record<string, MovementInsight> = {
  EZTC3: {
    why: "Volume acima da média pode antecipar revisão de expectativa para lançamentos e margens.",
    impactPillars: "Margens e Retorno",
  },
  LREN3: {
    why: "Reação pós-resultado pede validar se a melhora é recorrente ou apenas ajuste pontual.",
    impactPillars: "Margens e Caixa",
  },
  RAIL3: {
    why: "Fluxo comprador consistente pode refletir leitura mais positiva sobre eficiência operacional.",
    impactPillars: "Retorno e Margens",
  },
  COGN3: {
    why: "Correção forte exige separar ruído de preço de possível deterioração nos fundamentos recentes.",
    impactPillars: "Caixa e Margens",
  },
  IRBR3: {
    why: "Oscilação intradia elevada pede checar exposição a eventos e sustentabilidade do resultado.",
    impactPillars: "Retorno e Caixa",
  },
  PETR4: {
    why: "Volume líder do dia pode indicar mudança de narrativa; vale confirmar impactos operacionais.",
    impactPillars: "Proventos e Caixa",
  },
  ITUB4: {
    why: "Fluxo estável em bancos sugere leitura de continuidade; confirme qualidade do retorno.",
    impactPillars: "Retorno e Proventos",
  },
  VALE3: {
    why: "Negociação consistente com queda leve pode sinalizar reprecificação gradual de cenário.",
    impactPillars: "Caixa e Retorno",
  },
};

// ─── Funções puras ────────────────────────────────────────────────────────────

export function getCompanyLogo(ticker: string): string | undefined {
  return companyLogos[ticker];
}

export function getPresetChipLabels(preset: HighlightPreset): string[] {
  const severityLabel =
    preset.severity === "leve"
      ? "Prioridade baixa"
      : preset.severity === "moderada"
      ? "Prioridade média"
      : "Prioridade alta";
  const timeframeLabelMap: Record<HighlightPreset["timeframe"], string> = {
    "7d":  "últimos 7 dias",
    "30d": "últimos 30 dias",
    "90d": "últimos 90 dias",
    "2q":  "últimos 2 trimestres",
    "12m": "últimos 12 meses",
  };
  return [pillarLabelMap[preset.pillar], severityLabel, timeframeLabelMap[preset.timeframe]];
}

export function getSortedHighlights(items: HighlightItem[]): HighlightItem[] {
  const rank: Record<HighlightItem["severity"], number> = { Forte: 0, Moderada: 1, Leve: 2 };
  return [...items].sort((a, b) => rank[a.severity] - rank[b.severity]);
}

export function mapMovementItemToMoverRow(item: ExploreMovementItemDto): MoverRow {
  return {
    ticker:    item.headline,
    name:      item.headline,
    price:     '—',
    changePct: '—',
    note:      item.whyItMatters,
    updatedAt: '',
    source:    'B3',
    type:      'altas',
  };
}

export function mapMoversFromInsights(
  dto: ExploreMovementInsightsDto | null,
  bucket: 'highs' | 'lows' | 'mostTraded',
): MoverRow[] {
  if (!dto?.groups) return [];
  const typeMap: Record<'highs' | 'lows' | 'mostTraded', MoverType> = {
    highs:      'altas',
    lows:       'baixas',
    mostTraded: 'negociadas',
  };
  return (dto.groups[bucket]?.items ?? []).map(item => ({
    ...mapMovementItemToMoverRow(item),
    type: typeMap[bucket],
  }));
}

// ─── Dados mock ───────────────────────────────────────────────────────────────

export const indexCards: IndexCard[] = [
  {
    name: "Ibovespa",
    symbol: "IBOV",
    value: "127.540",
    changeAbs: "+680",
    changePct: "+0,54%",
    trend: "up",
    sparkline: [120, 122, 121, 124, 126, 127, 126, 128, 127, 129],
  },
  {
    name: "IBrX 100",
    symbol: "IBRX",
    value: "54.280",
    changeAbs: "-120",
    changePct: "-0,22%",
    trend: "down",
    sparkline: [55, 54.6, 54.4, 54.2, 54.3, 54.1, 54, 54.2, 54.1, 54],
  },
  {
    name: "Small Caps",
    symbol: "SMLL",
    value: "2.145",
    changeAbs: "+6",
    changePct: "+0,28%",
    trend: "up",
    sparkline: [2.05, 2.06, 2.08, 2.07, 2.09, 2.1, 2.12, 2.11, 2.13, 2.145],
  },
  {
    name: "IFIX",
    symbol: "IFIX",
    value: "3.267",
    changeAbs: "+2",
    changePct: "+0,06%",
    trend: "neutral",
    sparkline: [3.24, 3.25, 3.26, 3.25, 3.26, 3.27, 3.265, 3.268, 3.266, 3.267],
  },
  {
    name: "Volatilidade",
    symbol: "IVBX2",
    value: "18,4",
    changeAbs: "-0,3",
    changePct: "-1,6%",
    trend: "down",
    sparkline: [19, 18.8, 18.6, 18.9, 18.5, 18.4, 18.7, 18.3, 18.5, 18.4],
  },
];

export const movers: MoverRow[] = [
  {
    ticker: "EZTC3",
    name: "EZTEC",
    price: "R$ 17,80",
    changePct: "+3,4%",
    note: "Volume acima da média semanal.",
    updatedAt: "05/02",
    source: "B3",
    type: "altas",
  },
  {
    ticker: "LREN3",
    name: "Lojas Renner",
    price: "R$ 15,12",
    changePct: "+2,6%",
    note: "Reação após resultado trimestral.",
    updatedAt: "05/02",
    source: "B3",
    type: "altas",
  },
  {
    ticker: "RAIL3",
    name: "Rumo",
    price: "R$ 18,42",
    changePct: "+2,1%",
    note: "Fluxo comprador consistente.",
    updatedAt: "05/02",
    source: "B3",
    type: "altas",
  },
  {
    ticker: "COGN3",
    name: "Cogna",
    price: "R$ 2,84",
    changePct: "-3,8%",
    note: "Correção após alta recente.",
    updatedAt: "05/02",
    source: "B3",
    type: "baixas",
  },
  {
    ticker: "IRBR3",
    name: "IRB Brasil",
    price: "R$ 46,20",
    changePct: "-2,9%",
    note: "Oscilação elevada no intradia.",
    updatedAt: "05/02",
    source: "B3",
    type: "baixas",
  },
  {
    ticker: "PETR4",
    name: "Petrobras",
    price: "R$ 41,30",
    changePct: "+0,4%",
    note: "Maior volume negociado do dia.",
    updatedAt: "05/02",
    source: "B3",
    type: "negociadas",
  },
  {
    ticker: "ITUB4",
    name: "Itaú Unibanco",
    price: "R$ 33,15",
    changePct: "+0,1%",
    note: "Fluxo estável em bancos.",
    updatedAt: "05/02",
    source: "B3",
    type: "negociadas",
  },
  {
    ticker: "VALE3",
    name: "Vale",
    price: "R$ 63,90",
    changePct: "-0,2%",
    note: "Negociação consistente no dia.",
    updatedAt: "05/02",
    source: "B3",
    type: "negociadas",
  },
];

export const volatility: Volatility = {
  value: 64,
  label: "Moderada",
  updatedAt: "05/02",
  source: "B3",
};

export const highlights: HighlightItem[] = [
  {
    id: "margens-wege3",
    companyName: "WEG",
    ticker: "WEGE3",
    changeTitle: "Margens pressionadas recentemente",
    whyItMatters: "Pode reduzir lucro mesmo com receita estável.",
    pillar: "Margens",
    severity: "Moderada",
    timeframeLabel: "últimos 2 trimestres",
    scope: "Mercado",
    source: {
      name: "CVM",
      updatedAt: "04/02",
      docLabel: "Formulário de Referência",
      url: "https://www.gov.br/cvm",
    },
    filterPreset: {
      pillar: "margens",
      signal: "margem_caindo",
      severity: "moderada",
      timeframe: "2q",
      scope: "mercado",
    },
  },
  {
    id: "proventos-itub4",
    companyName: "Itaú Unibanco",
    ticker: "ITUB4",
    changeTitle: "Proventos mais consistentes",
    whyItMatters: "Melhora previsibilidade de caixa e retorno ao acionista.",
    pillar: "Proventos",
    severity: "Leve",
    timeframeLabel: "últimos 12 meses",
    scope: "Mercado",
    source: {
      name: "RI",
      updatedAt: "05/02",
      docLabel: "Comunicado ao Mercado",
      url: "https://www.itau.com.br/relacoes-com-investidores",
    },
    filterPreset: {
      pillar: "proventos",
      signal: "payout_subindo",
      severity: "leve",
      timeframe: "12m",
      scope: "mercado",
    },
  },
  {
    id: "divida-petr4",
    companyName: "Petrobras",
    ticker: "PETR4",
    changeTitle: "Dívida líquida aumentou",
    whyItMatters: "Aumenta pressão no caixa e pode limitar investimento.",
    pillar: "Dívida",
    severity: "Forte",
    timeframeLabel: "últimos 90 dias",
    scope: "Mercado",
    source: {
      name: "B3",
      updatedAt: "05/02",
      docLabel: "Fato Relevante",
      url: "https://www.b3.com.br",
    },
    filterPreset: {
      pillar: "divida",
      signal: "divida_subindo",
      severity: "forte",
      timeframe: "90d",
      scope: "mercado",
    },
  },
];

export const thesisCollections: string[] = [
  "Dívida sob controle",
  "Caixa forte",
  "Margens melhorando",
  "Retorno consistente",
  "Proventos estáveis",
  "Dados atualizados",
];

export const sectorCollections: string[] = [
  "Bancos",
  "Energia",
  "Consumo",
  "Saúde",
  "Indústria",
  "Construção",
];

export const pillars = ["Dívida", "Caixa", "Margens", "Retorno", "Proventos"] as const;

export const companies: CompanyCard[] = [
  {
    name: "WEG",
    ticker: "WEGE3",
    sector: "Indústria",
    size: "Grande",
    status: "Saudável",
    pillarsScores: [82, 78, 74, 80, 62],
    shortDiagnosis: "Consistência operacional com margens sólidas.",
    freshnessStatus: "Atualizado",
    updatedAt: "05/02",
    source: "CVM/B3/RI",
    highlightPillar: "Margens",
    financials: {
      pl: 32.5,
      pvp: 9.8,
      dividendYield: 1.4,
      roe: 30.2,
      roic: 22.5,
      margemLiquida: 15.8,
      margemEbitda: 22.4,
      dividaLiquidaEbitda: 0.3,
      evEbitda: 24.1,
      lpa: 1.42,
    },
  },
  {
    name: "Itaú Unibanco",
    ticker: "ITUB4",
    sector: "Bancos",
    size: "Grande",
    status: "Saudável",
    pillarsScores: [70, 76, 68, 74, 72],
    shortDiagnosis: "Retorno estável e caixa resiliente.",
    freshnessStatus: "Atualizado",
    updatedAt: "05/02",
    source: "CVM/B3/RI",
    highlightPillar: "Retorno",
    financials: {
      pl: 8.2,
      pvp: 1.9,
      dividendYield: 5.8,
      roe: 20.8,
      roic: null,
      margemLiquida: 24.6,
      margemEbitda: null,
      dividaLiquidaEbitda: null,
      evEbitda: null,
      lpa: 4.05,
    },
  },
  {
    name: "Taesa",
    ticker: "TAEE11",
    sector: "Energia",
    size: "Média",
    status: "Atenção",
    pillarsScores: [56, 64, 52, 60, 78],
    shortDiagnosis: "Proventos consistentes, mas dívida em atenção.",
    freshnessStatus: "Atualizado",
    updatedAt: "05/02",
    source: "CVM/B3/RI",
    highlightPillar: "Proventos",
    financials: {
      pl: 7.4,
      pvp: 2.1,
      dividendYield: 9.2,
      roe: 28.4,
      roic: 12.8,
      margemLiquida: 52.3,
      margemEbitda: 78.5,
      dividaLiquidaEbitda: 3.8,
      evEbitda: 8.6,
      lpa: 4.72,
    },
  },
  {
    name: "Cosan",
    ticker: "CSAN3",
    sector: "Consumo",
    size: "Média",
    status: "Atenção",
    pillarsScores: [44, 58, 41, 52, 48],
    shortDiagnosis: "Oscilações recentes em alavancagem.",
    freshnessStatus: "Antigo",
    updatedAt: "22/01",
    source: "CVM/B3/RI",
    highlightPillar: "Dívida",
    financials: {
      pl: 15.6,
      pvp: 1.2,
      dividendYield: 2.8,
      roe: 7.9,
      roic: 5.4,
      margemLiquida: 4.2,
      margemEbitda: 18.7,
      dividaLiquidaEbitda: 4.5,
      evEbitda: 7.2,
      lpa: 0.89,
    },
  },
  {
    name: "Fleury",
    ticker: "FLRY3",
    sector: "Saúde",
    size: "Média",
    status: "Saudável",
    pillarsScores: [68, 72, 66, 70, 54],
    shortDiagnosis: "Margens e retorno dentro do esperado.",
    freshnessStatus: "Atualizado",
    updatedAt: "04/02",
    source: "CVM/B3/RI",
    highlightPillar: "Margens",
    financials: {
      pl: 18.3,
      pvp: 3.4,
      dividendYield: 3.1,
      roe: 18.6,
      roic: 14.2,
      margemLiquida: 10.4,
      margemEbitda: 28.9,
      dividaLiquidaEbitda: 1.8,
      evEbitda: 11.5,
      lpa: 1.15,
    },
  },
  {
    name: "MRV",
    ticker: "MRVE3",
    sector: "Construção",
    size: "Média",
    status: "Risco",
    pillarsScores: [30, 42, 28, 34, 36],
    shortDiagnosis: "Alavancagem elevada e retorno pressionado.",
    freshnessStatus: "Antigo",
    updatedAt: "18/01",
    source: "CVM/B3/RI",
    highlightPillar: "Dívida",
    financials: {
      pl: -12.4,
      pvp: 0.6,
      dividendYield: 0,
      roe: -5.2,
      roic: 2.1,
      margemLiquida: -3.8,
      margemEbitda: 8.2,
      dividaLiquidaEbitda: 6.2,
      evEbitda: 14.8,
      lpa: -1.32,
    },
  },
];

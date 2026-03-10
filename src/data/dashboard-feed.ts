export type FeedSeverity = 'leve' | 'moderada' | 'forte';
export type CompanyStatus = 'saudavel' | 'atencao' | 'risco';
export type Pillar = 'crescimento' | 'rentabilidade' | 'saude-financeira' | 'valuation' | 'momentum';
export type DataFreshness = 'atualizado' | 'recente' | 'antigo';

export interface ChangeFeedItem {
  id: string;
  ticker: string;
  companyName: string;
  severity: FeedSeverity;
  status: CompanyStatus;
  whatChanged: string;
  whyMatters: string;
  pillar: Pillar;
  date: string;
  source: string;
  freshness: DataFreshness;
  freshnessLabel: string;
}

export interface AttentionCompany {
  ticker: string;
  companyName: string;
  reason: string;
  pillar: Pillar;
  status: CompanyStatus;
}

export interface ActiveAlert {
  id: string;
  ticker: string;
  condition: string;
  triggeredAt: string;
}

export interface DataQualityWarning {
  severity: 'warning' | 'info';
  message: string;
  affectedCount: number;
}

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

export const mockAttentionCompanies: AttentionCompany[] = [
  {
    ticker: 'BBDC4',
    companyName: 'Bradesco',
    reason: 'Inadimplência acelerando',
    pillar: 'saude-financeira',
    status: 'risco',
  },
  {
    ticker: 'VALE3',
    companyName: 'Vale S.A.',
    reason: 'Alavancagem aumentou',
    pillar: 'saude-financeira',
    status: 'atencao',
  },
  {
    ticker: 'ABEV3',
    companyName: 'Ambev',
    reason: 'Volume Brasil em queda',
    pillar: 'crescimento',
    status: 'atencao',
  },
];

export const mockActiveAlerts: ActiveAlert[] = [
  {
    id: 'a1',
    ticker: 'VALE3',
    condition: 'Dívida/EBITDA > 1,5x',
    triggeredAt: 'há 1 dia',
  },
  {
    id: 'a2',
    ticker: 'BBDC4',
    condition: 'Score saúde < 60',
    triggeredAt: 'há 2 dias',
  },
];

export const mockDataQualityWarnings: DataQualityWarning[] = [
  {
    severity: 'warning',
    message: 'Dados de 3 empresas não atualizados há mais de 7 dias',
    affectedCount: 3,
  },
  {
    severity: 'info',
    message: 'Balanço anual de 2 empresas aguardando publicação',
    affectedCount: 2,
  },
];

export const pillarLabels: Record<Pillar, string> = {
  crescimento: 'Crescimento',
  rentabilidade: 'Rentabilidade',
  'saude-financeira': 'Saúde Financeira',
  valuation: 'Valuation',
  momentum: 'Momentum',
};

export const pillarColors: Record<Pillar, string> = {
  crescimento: 'text-blue-600 bg-blue-50 border-blue-200',
  rentabilidade: 'text-emerald-600 bg-emerald-50 border-emerald-200',
  'saude-financeira': 'text-purple-600 bg-purple-50 border-purple-200',
  valuation: 'text-orange-600 bg-orange-50 border-orange-200',
  momentum: 'text-pink-600 bg-pink-50 border-pink-200',
};

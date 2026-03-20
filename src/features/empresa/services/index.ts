/**
 * Company service.
 *
 * Responsabilidades:
 *  1. Dados mock (queueItems, pillars, changes, timelineEvents, priceData, sourceRows, mockDataByCompany)
 *  2. Funções puras de normalização, adaptação de payload e helpers de texto
 *  3. Chamada HTTP fetchCompanyData
 *
 * Independente de React — sem imports de hooks ou JSX.
 * Preparado para substituição por chamadas HTTP reais.
 */

import type {
  Status,
  MainTab,
  PillarName,
  ChangePillarTag,
  ChangePriorityLevel,
  FeedWindow,
  CompanyContext,
  CompanyQueueItem,
  CompanyData,
  CompanyPreferences,
  PillarData,
  PillarEvidence,
  PillarMetric,
  PriceBulletChart,
  PriceValuationScenario,
  PriceSensitivityDriver,
  PriceRow,
  SourceRow,
  ChangeItem,
  TimelineEvent,
  Contextual,
} from '../interfaces';

import logoWeg from '@/src/assets/logos/weg.jpeg';
import logoVale from '@/src/assets/logos/vale.png';
import logoRenner from '@/src/assets/logos/renner.png';
import logoMrv from '@/src/assets/logos/mrv.jpg';
import logoTaesa from '@/src/assets/logos/taesa.png';
import logoItau from '@/src/assets/logos/itau.png';
import logoPetrobras from '@/src/assets/logos/petrobras.webp';

// ─── Constantes ───────────────────────────────────────────────────────────────

export const EMPTY_RADAR_SCORES: Record<PillarName, number> = {
  Divida: 0,
  Caixa: 0,
  Margens: 0,
  Retorno: 0,
  Proventos: 0,
};

export const pillarOrder: PillarName[] = ['Divida', 'Caixa', 'Margens', 'Retorno', 'Proventos'];

export const mainTabs: MainTab[] = ['Resumo', 'Pilares', 'Mudancas', 'Eventos', 'Preço', 'Fontes'];

export const changesFocusFilters = ['Mais relevantes', 'Rotina', 'Estruturais'] as const;
export const eventsFocusFilters = ['Mais relevantes', 'Rotina', 'Principais'] as const;

export const changeLevelRank: Record<ChangePriorityLevel, number> = {
  Estrutural: 0,
  Relevante: 1,
  Rotina: 2,
};

export const pillarFilterOptions: Array<ChangePillarTag | 'Todos'> = [
  'Todos',
  'Divida',
  'Margens',
  'Caixa',
  'Retorno',
  'Proventos',
  'A classificar',
];

const RAW_API_BASE_URL = String(process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8080').trim();
export const API_BASE_URL = RAW_API_BASE_URL.replace(/\/$/, '');

// ─── Dados mock: fila de empresas ─────────────────────────────────────────────

export const queueItems: CompanyQueueItem[] = [
  { companyId: 'VALE3', ticker: 'VALE3', name: 'Vale', status: 'Risco', logo: logoVale.src, description: 'Mineradora global com forte exposição a minério de ferro.' },
  { companyId: 'PETR4', ticker: 'PETR4', name: 'Petrobras', status: 'Atencao', logo: logoPetrobras.src, description: 'Empresa integrada de energia, com foco em exploração, produção e refino.' },
  { companyId: 'LREN3', ticker: 'LREN3', name: 'Lojas Renner', status: 'Atencao', logo: logoRenner.src, description: 'Varejo de moda com foco em omnichannel e escala nacional.' },
  { companyId: 'MRVE3', ticker: 'MRVE3', name: 'MRV Engenharia', status: 'Atencao', logo: logoMrv.src, description: 'Construtora focada no segmento residencial de média e baixa renda.' },
  { companyId: 'TAEE11', ticker: 'TAEE11', name: 'Transmissão Paulista', status: 'Saudavel', logo: logoTaesa.src, description: 'Empresa de transmissão de energia com receita regulada.' },
  { companyId: 'WEGE3', ticker: 'WEGE3', name: 'WEG', status: 'Atencao', logo: logoWeg.src, description: 'Empresa de equipamentos elétricos e automação industrial com presença global.' },
  { companyId: 'ITUB4', ticker: 'ITUB4', name: 'Itaú Unibanco', status: 'Saudavel', logo: logoItau.src, description: 'Banco universal com foco em crédito, serviços e seguros.' },
  { companyId: 'BBAS3', ticker: 'BBAS3', name: 'Banco do Brasil', status: 'Saudavel', initials: 'BB', description: 'Banco com forte exposição ao agronegócio e setor público.' },
];

// ─── Dados mock: pilares base ─────────────────────────────────────────────────

const pillars: PillarData[] = [
  {
    name: 'Divida',
    status: 'Atencao',
    score: 58,
    trend: '? 3 vs último trimestre',
    summary: 'Atenção porque a alavancagem subiu e exige acompanhamento de caixa.',
    trust: { source: 'CVM', updatedAt: '04/02', status: 'Atualizado' },
    chart: {
      title: 'Evidencia: Dívida Líq./EBITDA por ano',
      years5: ['2021', '2022', '2023', '2024', '2025'],
      years10: ['2016', '2017', '2018', '2019', '2020', '2021', '2022', '2023', '2024', '2025'],
      series5: [0.6, 0.8, 1.1, 1.4, 1.6],
      series10: [0.4, 0.5, 0.6, 0.7, 0.7, 0.6, 0.8, 1.1, 1.4, 1.6],
    },
    metrics: [
      { label: 'Dívida Líq./EBITDA', value: '1,6x', period: '12m +0,2x', source: { name: 'CVM', docLabel: 'ITR 3T25', date: '04/02' } },
      { label: 'Cobertura de juros', value: '6,8x', period: '12m', source: { name: 'RI', docLabel: 'Release 3T25', date: '04/02' } },
      { label: 'Caixa vs dívida CP', value: '1,3x', period: 'Trimestre', source: { name: 'CVM', docLabel: 'ITR 3T25', date: '04/02' } },
      { label: 'Prazo médio', value: '3,8 anos', period: 'Atual', source: { name: 'RI', docLabel: 'Release 3T25', date: '04/02' } },
    ],
    evidences: [
      {
        id: 'divida-1',
        label: 'Ponto de atenção',
        intensity: 'Moderada',
        title: 'Dívida bruta subiu no trimestre',
        value: '1,6x',
        metric: 'Dívida Líq./EBITDA',
        why: 'Pode pressionar caixa em juros altos.',
        source: { name: 'CVM', docLabel: 'ITR 3T25', date: '04/02', url: 'https://www.gov.br/cvm' },
      },
      {
        id: 'divida-2',
        label: 'Ponto forte',
        intensity: 'Leve',
        title: 'Prazo de dívida alongado',
        value: '68%',
        metric: 'Longo prazo',
        why: 'Reduz risco de refinanciamento no curto prazo.',
        source: { name: 'CVM', docLabel: 'DFP 2024', date: '04/02', url: 'https://www.gov.br/cvm' },
      },
    ],
  },
  {
    name: 'Caixa',
    status: 'Saudavel',
    score: 72,
    trend: '? 2 vs 12m',
    summary: 'Está saudável porque o fluxo de caixa livre segue positivo.',
    trust: { source: 'CVM', updatedAt: '04/02', status: 'Atualizado' },
    chart: {
      title: 'Evidencia: FCF por ano',
      years5: ['2021', '2022', '2023', '2024', '2025'],
      years10: ['2016', '2017', '2018', '2019', '2020', '2021', '2022', '2023', '2024', '2025'],
      series5: [2.1, 2.4, 2.2, 2.6, 2.7],
      series10: [1.2, 1.4, 1.7, 2.0, 1.9, 2.1, 2.4, 2.2, 2.6, 2.7],
    },
    metrics: [
      { label: 'FCL', value: 'R$ 2,7 bi', period: '12m +0,2 bi', source: { name: 'CVM', docLabel: 'DFP 2024', date: '04/02' } },
      { label: 'Conversão de caixa', value: '82%', period: '12m', source: { name: 'RI', docLabel: 'Release 3T25', date: '04/02' } },
      { label: 'Liquidez corrente', value: '1,6x', period: 'Trimestre', source: { name: 'CVM', docLabel: 'ITR 3T25', date: '04/02' } },
      { label: 'Capex/Receita', value: '4,2%', period: '12m', source: { name: 'RI', docLabel: 'Release 3T25', date: '04/02' } },
    ],
    evidences: [
      {
        id: 'caixa-1',
        label: 'Ponto forte',
        intensity: 'Leve',
        title: 'Caixa confortável para investimentos',
        value: '18%',
        metric: 'Caixa/Receita',
        why: 'Mantém flexibilidade para crescimento orgânico.',
        source: { name: 'RI', docLabel: 'Release 3T25', date: '04/02', url: 'https://www.weg.net/ri' },
      },
      {
        id: 'caixa-2',
        label: 'Ponto de atenção',
        intensity: 'Moderada',
        title: 'Capital de giro pressionou',
        value: '+6%',
        metric: 'Capital de giro',
        why: 'Pode reduzir liquidez no curto prazo.',
        source: { name: 'RI', docLabel: 'Release 3T25', date: '04/02', url: 'https://www.weg.net/ri' },
      },
    ],
  },
  {
    name: 'Margens',
    status: 'Saudavel',
    score: 70,
    trend: '? 0 vs 12m',
    summary: 'Está saudável porque margens permaneceram proximas da media histórica.',
    trust: { source: 'CVM', updatedAt: '04/02', status: 'Atualizado' },
    chart: {
      title: 'Evidencia: Margem EBITDA',
      years5: ['2021', '2022', '2023', '2024', '2025'],
      years10: ['2016', '2017', '2018', '2019', '2020', '2021', '2022', '2023', '2024', '2025'],
      series5: [19.2, 20.1, 19.8, 20.4, 20.0],
      series10: [18.1, 18.7, 19.2, 19.4, 19.0, 19.2, 20.1, 19.8, 20.4, 20.0],
    },
    metrics: [
      { label: 'Margem EBITDA', value: '20,0%', period: '12m', source: { name: 'CVM', docLabel: 'DFP 2024', date: '04/02' } },
      { label: 'Margem líquida', value: '14,1%', period: '12m', source: { name: 'RI', docLabel: 'Release 3T25', date: '04/02' } },
      { label: 'Preço vs custo', value: '1,2x', period: 'Trimestre', source: { name: 'RI', docLabel: 'Release 3T25', date: '04/02' } },
      { label: 'Margem bruta', value: '33,8%', period: '12m', source: { name: 'CVM', docLabel: 'DFP 2024', date: '04/02' } },
    ],
    evidences: [
      {
        id: 'margens-1',
        label: 'Ponto forte',
        intensity: 'Leve',
        title: 'Margens resilientes em ciclo desafiador',
        value: '20,0%',
        metric: 'EBITDA (12m)',
        why: 'Sustenta lucro mesmo com custos pressionados.',
        source: { name: 'CVM', docLabel: 'ITR 3T25', date: '04/02', url: 'https://www.gov.br/cvm' },
      },
      {
        id: 'margens-2',
        label: 'Ponto de atenção',
        intensity: 'Moderada',
        title: 'Custos diretos em alta',
        value: '58%',
        metric: 'Custo/Receita',
        why: 'Pode comprimir margem no próximo trimestre.',
        source: { name: 'CVM', docLabel: 'ITR 3T25', date: '04/02', url: 'https://www.gov.br/cvm' },
      },
    ],
  },
  {
    name: 'Retorno',
    status: 'Saudavel',
    score: 76,
    trend: '? 1 vs 12m',
    summary: 'Está saudável porque ROIC se mantém acima da referência.',
    trust: { source: 'CVM', updatedAt: '04/02', status: 'Atualizado' },
    chart: {
      title: 'Evidencia: ROIC',
      years5: ['2021', '2022', '2023', '2024', '2025'],
      years10: ['2016', '2017', '2018', '2019', '2020', '2021', '2022', '2023', '2024', '2025'],
      series5: [13.2, 14.1, 15.0, 15.6, 16.1],
      series10: [10.8, 11.3, 11.9, 12.4, 12.7, 13.2, 14.1, 15.0, 15.6, 16.1],
    },
    metrics: [
      { label: 'ROIC', value: '16,1%', period: '12m', source: { name: 'CVM', docLabel: 'DFP 2024', date: '04/02' } },
      { label: 'ROE', value: '18,3%', period: '12m', source: { name: 'RI', docLabel: 'Release 3T25', date: '04/02' } },
      { label: 'Giro do ativo', value: '0,72x', period: '12m', source: { name: 'CVM', docLabel: 'DFP 2024', date: '04/02' } },
      { label: 'Referência de retorno', value: '12,0%', period: 'proxy', source: { name: 'Analiso', docLabel: 'Estimativa interna', date: '04/02' } },
    ],
    evidences: [
      {
        id: 'retorno-1',
        label: 'Ponto forte',
        intensity: 'Leve',
        title: 'Retorno acima da referencia',
        value: '16,1%',
        metric: 'ROIC (12m)',
        why: 'Indica eficiência na alocação de capital.',
        source: { name: 'CVM', docLabel: 'DFP 2024', date: '04/02', url: 'https://www.gov.br/cvm' },
      },
      {
        id: 'retorno-2',
        label: 'Ponto de atenção',
        intensity: 'Moderada',
        title: 'ROA recuou no trimestre',
        value: '6,1%',
        metric: 'ROA (12m)',
        why: 'Pode sinalizar menor eficiência operacional.',
        source: { name: 'CVM', docLabel: 'ITR 3T25', date: '04/02', url: 'https://www.gov.br/cvm' },
      },
    ],
  },
  {
    name: 'Proventos',
    status: 'Atencao',
    score: 62,
    trend: '? 2 vs último trimestre',
    summary: 'Atenção porque a distribuição segue volátil em ciclos de investimento.',
    trust: { source: 'RI', updatedAt: '05/02', status: 'Antigo' },
    chart: {
      title: 'Evidência: Dividendos por ação',
      years5: ['2021', '2022', '2023', '2024', '2025'],
      years10: ['2016', '2017', '2018', '2019', '2020', '2021', '2022', '2023', '2024', '2025'],
      series5: [0.9, 1.1, 1.0, 1.3, 1.2],
      series10: [0.6, 0.7, 0.8, 0.9, 0.8, 0.9, 1.1, 1.0, 1.3, 1.2],
    },
    metrics: [
      { label: 'Payout', value: '42%', period: '12m', source: { name: 'RI', docLabel: 'Comunicado', date: '05/02' } },
      { label: 'Dividend yield', value: '3,1%', period: '12m', source: { name: 'B3', docLabel: 'Dados de mercado', date: '05/02' } },
      { label: 'Proventos por ação', value: 'R$ 1,2', period: '12m', source: { name: 'RI', docLabel: 'Comunicado', date: '05/02' } },
      { label: 'Cobertura de proventos', value: '2,4x', period: '12m', source: { name: 'CVM', docLabel: 'DFP 2024', date: '04/02' } },
    ],
    evidences: [
      {
        id: 'proventos-1',
        label: 'Ponto de atenção',
        intensity: 'Moderada',
        title: 'Payout mais volátil',
        value: '42%',
        metric: 'Payout (12m)',
        why: 'Pode mudar previsibilidade de proventos.',
        source: { name: 'RI', docLabel: 'Comunicado', date: '05/02', url: 'https://www.weg.net/ri' },
      },
      {
        id: 'proventos-2',
        label: 'Ponto forte',
        intensity: 'Leve',
        title: 'Historico de distribuição estável',
        value: '3,1%',
        metric: 'Dividend yield',
        why: 'Reforça previsibilidade para o acionista.',
        source: { name: 'RI', docLabel: 'Comunicado', date: '05/02', url: 'https://www.weg.net/ri' },
      },
    ],
  },
];

// ─── Dados mock: mudanças ─────────────────────────────────────────────────────

const changes: ChangeItem[] = [
  {
    type: 'Resultado',
    date: '04/02',
    severity: 'Leve',
    impact: 'Margens',
    title: 'Divulgação de resultados do 3T25 com margem estável.',
    impactLine: 'Impacto principal: Margens',
    unchangedLine: 'Não alterou Caixa nem Dívida no curto prazo.',
    source: { docLabel: 'ITR 3T25', url: 'https://www.gov.br/cvm' },
  },
  {
    type: 'Divida',
    date: '03/02',
    severity: 'Moderada',
    impact: 'Divida',
    title: 'Emissão de debêntures para alongamento de prazo.',
    impactLine: 'Impacto principal: Dívida (perfil de vencimento mais longo).',
    unchangedLine: 'Sem mudança material em Margens.',
    source: { docLabel: 'Fato Relevante', url: 'https://www.b3.com.br' },
  },
  {
    type: 'Proventos',
    date: '28/01',
    severity: 'Leve',
    impact: 'Proventos',
    title: 'Aprovação de juros sobre capital próprio.',
    impactLine: 'Impacto principal: Proventos',
    unchangedLine: 'Não altera o diagnóstico de Retorno por ora.',
    source: { docLabel: 'Comunicado', url: 'https://www.weg.net/ri' },
  },
];

// ─── Dados mock: agenda ───────────────────────────────────────────────────────

const timelineEvents: TimelineEvent[] = [
  {
    date: '13/02',
    title: 'WEGE3 Resultado 4T25',
    source: 'RI / B3 / CVM',
    why: 'Pode alterar Caixa, Margens e Retorno.',
    expectedImpact: 'Alto',
    pillars: ['Caixa', 'Margens', 'Retorno'],
  },
  {
    date: '14/02',
    title: 'WEGE3 Dividendos/JCP',
    source: 'RI',
    why: 'Pode mexer em Proventos e leitura de distribuição.',
    expectedImpact: 'Moderado',
    pillars: ['Proventos'],
  },
  {
    date: '16/02',
    title: 'WEGE3 Teleconferencia RI',
    source: 'RI / B3',
    why: 'Pode sinalizar mudanças de guidance para Margens e Dívida.',
    expectedImpact: 'Leve',
    pillars: ['Margens', 'Divida'],
  },
];

// ─── Dados mock: preço ────────────────────────────────────────────────────────

const priceData = {
  current: 'R$ 42,60',
  summary: 'Leitura de valuation por DCF com cenários conservador, base e otimista.',
  estimatedFairValue: 'R$ 45,80',
  differenceVsCurrent: '+7,5%',
  valuationSummary: 'O cenário-base de valuation sugere valor estimado acima do preço atual, com alta sensibilidade a WACC e crescimento terminal.',
  valuationStateChip: { label: 'Abaixo do preço justo estimado', tone: 'teal' },
  valuationScenarios: [
    { scenario: 'Conservador', estimatedValue: 'R$ 39,20', differenceVsCurrent: '-8,0%', reading: 'Valuation mais pressionado por premissas conservadoras de crescimento e margem.' },
    { scenario: 'Base', estimatedValue: 'R$ 45,80', differenceVsCurrent: '+7,5%', reading: 'Cenário-base com premissas centrais de crescimento e reinvestimento.' },
    { scenario: 'Otimista', estimatedValue: 'R$ 51,30', differenceVsCurrent: '+20,4%', reading: 'Cenário com execução operacional mais favorável e menor custo de capital.' },
  ] as PriceValuationScenario[],
  bulletChart: {
    conservativeMin: 37.5,
    conservativeMax: 41,
    baseMin: null,
    baseMax: null,
    baseValue: 45.8,
    optimisticMin: 49.2,
    optimisticMax: 53.4,
    currentPrice: 42.6,
    min: 35,
    max: 56,
    conservativeLabel: 'Faixa conservadora',
    baseLabel: 'Cenário-base',
    optimisticLabel: 'Faixa otimista',
    currentLabel: 'Preço atual',
  } as PriceBulletChart,
  sensitivityDrivers: [
    { driver: 'Crescimento terminal', value: '3,0%', impact: 'Maior crescimento terminal eleva o valor estimado.' },
    { driver: 'WACC', value: '10,8%', impact: 'WACC mais alto reduz valor presente dos fluxos futuros.' },
    { driver: 'Margem operacional', value: '19,5%', impact: 'Margem sustentável mais alta amplia geração de caixa no cenário-base.' },
    { driver: 'Capex / reinvestimento', value: '5,2% da receita', impact: 'Maior reinvestimento reduz FCF no curto prazo e impacta o valuation.' },
  ] as PriceSensitivityDriver[],
  multiplesSummary: 'Múltiplos são bloco de apoio para comparação relativa e não substituem o cenário-base de valuation.',
  labels: ['12x', '14x', '16x', '18x', '20x', '22x'],
  values: [4, 6, 9, 7, 5, 2],
  currentMarker: 4,
  medianMarker: 2,
  rows: [
    { metric: 'P/L', current: '20,1x', sector: '17,8x', histórical: '16,4x', insight: 'Acima da mediana histórica.' },
    { metric: 'EV/EBITDA', current: '13,5x', sector: '12,1x', histórical: '11,8x', insight: 'Leve prêmio vs setor.' },
    { metric: 'P/VP', current: '4,2x', sector: '3,6x', histórical: '3,4x', insight: 'Mais caro que a média 5a.' },
  ] as PriceRow[],
};

// ─── Dados mock: fontes ───────────────────────────────────────────────────────

const sourceRows: SourceRow[] = [
  { category: 'Financeiro', source: 'CVM', doc: 'DFP 2024', date: '04/02', status: 'Atualizado', link: 'https://www.gov.br/cvm' },
  { category: 'Eventos', source: 'B3', doc: 'Fato Relevante', date: '03/02', status: 'Atualizado', link: 'https://www.b3.com.br' },
  { category: 'Preço', source: 'B3', doc: 'Dados de mercado', date: '05/02', status: 'Atualizado', link: 'https://www.b3.com.br' },
  { category: 'RI', source: 'RI', doc: 'Comunicado', date: '05/02', status: 'Antigo', link: 'https://www.weg.net/ri' },
];

// ─── Funções puras auxiliares ─────────────────────────────────────────────────

export function contextualize<T>(items: T[], companyId: string, ticker: string): Array<Contextual<T>> {
  return items.map((item) => ({ ...item, companyId, ticker }));
}

export function companyContextFromTicker(tickerParam?: string): CompanyContext {
  const normalizedTicker = (tickerParam ?? 'WEGE3').toUpperCase();
  const company = queueItems.find((item) => item.ticker === normalizedTicker) ?? queueItems[4];
  return {
    companyId: company.companyId,
    ticker: company.ticker,
    name: company.name,
  };
}

export function periodToDays(period: FeedWindow) {
  if (period === '30 dias') return 30;
  if (period === '60 dias') return 60;
  return 90;
}

export function parseChangeDate(dateValue?: string) {
  if (!dateValue) return null;
  const match = dateValue.match(/^(\d{1,2})\/(\d{1,2})$/);
  if (!match) return null;
  const day = Number.parseInt(match[1], 10);
  const month = Number.parseInt(match[2], 10);
  if (!Number.isFinite(day) || !Number.isFinite(month) || day < 1 || day > 31 || month < 1 || month > 12) return null;
  const now = new Date();
  const candidate = new Date(now.getFullYear(), month - 1, day);
  if (candidate.getTime() > now.getTime() + (1000 * 60 * 60 * 24 * 14)) {
    candidate.setFullYear(candidate.getFullYear() - 1);
  }
  return candidate;
}

export function getChangeDateSortValue(dateValue?: string) {
  const parsed = parseChangeDate(dateValue);
  return parsed ? parsed.getTime() : 0;
}

export function normalizeChangePillar(impact?: string): ChangePillarTag {
  const raw = (impact ?? '').toLowerCase();
  if (!raw.trim()) return 'A classificar';
  if (raw.includes('dvida') || raw.includes('divida')) return 'Divida';
  if (raw.includes('caixa')) return 'Caixa';
  if (raw.includes('marg')) return 'Margens';
  if (raw.includes('retorno')) return 'Retorno';
  if (raw.includes('provent')) return 'Proventos';
  return 'A classificar';
}

export function getChangeLevel(change: { type?: string; severity?: string; impact?: string }): ChangePriorityLevel {
  const type = (change.type ?? '').toLowerCase();
  const severity = (change.severity ?? '').toLowerCase();
  const impact = normalizeChangePillar(change.impact);

  const isStructuralType =
    type.includes('guidance') ||
    type.includes('societ') ||
    type.includes('lucro') ||
    type.includes('resultado') ||
    type.includes('divida');
  const isStructuralSeverity = severity.includes('alta') || severity.includes('estrutural');
  const isStructuralPillar = impact === 'Divida' || impact === 'Margens' || impact === 'Retorno';
  if (isStructuralSeverity || (severity.includes('moderada') && (isStructuralType || isStructuralPillar))) return 'Estrutural';

  const isRoutineType =
    type.includes('provento') ||
    type.includes('dividendo') ||
    type.includes('jcp') ||
    type.includes('comunicado');
  if (severity.includes('leve') && isRoutineType) return 'Rotina';

  return 'Relevante';
}

export function buildInterpretationLine(change: { impact?: string; impactLine?: string; unchangedLine?: string; beforeAfter?: string; level: ChangePriorityLevel }) {
  const impact = normalizeChangePillar(change.impact);
  if (change.level === 'Estrutural') {
    if (impact === 'Divida') return 'Ainda não muda a leitura estrutural da empresa hoje, mas merece acompanhamento porque pode alterar o perfil da divida nos próximos fechamentos.';
    if (impact === 'Margens') return 'Ainda não muda a leitura estrutural hoje, mas adiciona um ponto de monitoramento para as margens nos próximos resultados.';
    if (impact === 'Retorno') return 'Ainda não muda a leitura estrutural hoje, mas merece acompanhamento porque pode alterar a qualidade do retorno nos próximos fechamentos.';
    return 'Ainda não muda a leitura estrutural hoje, mas adiciona um ponto de monitoramento para os próximos fechamentos.';
  }
  if (change.level === 'Relevante') {
    if (impact === 'Divida') return 'Ainda não muda a leitura estrutural da empresa, mas merece acompanhamento pelo efeito potencial no perfil da divida.';
    if (impact === 'Margens') return 'Ainda não muda a leitura estrutural, mas adiciona um sinal para acompanhar a evolução operacional.';
    return 'Ainda não muda a leitura estrutural da empresa, mas merece acompanhamento no próximo ciclo de resultados.';
  }
  if (impact === 'Proventos') {
    return 'Distribuicao anunciada sem impacto estrutural relevante na leitura atual da empresa.';
  }
  if (change.unchangedLine && change.unchangedLine.trim().length > 0) {
    return 'Atualização recorrente, sem impacto estrutural relevante na leitura atual da empresa.';
  }
  return 'Evento de rotina com efeito informacional, mantendo o diagnóstico estrutural no período.';
}

export function buildWhyItMatters(change: { impact?: string; impactLine?: string; level: ChangePriorityLevel }) {
  const impact = normalizeChangePillar(change.impact);
  if (change.level === 'Estrutural' && change.impactLine && change.impactLine.trim().length > 0) {
    const cleaned = change.impactLine.replace(/^Impacto principal:\s*/i, '').trim();
    if (cleaned.length > 0) {
      return `Pode afetar o pilar de ${cleaned} nos próximos acompanhamentos.`;
    }
  }
  if (change.level === 'Estrutural') {
    if (impact === 'Divida') return 'Pode afetar o pilar de Divida ao alterar perfil de vencimento e custo financeiro.';
    if (impact === 'Margens') return 'Pode afetar o pilar de Margens se a pressao operacional persistir nos próximos trimestres.';
    if (impact === 'Retorno') return 'Pode afetar o pilar de Retorno ao mudar a eficiencia da alocacao de capital.';
    return 'Pode afetar a leitura estrutural da empresa no próximo ciclo de confirmação.';
  }
  if (change.level === 'Relevante') {
    if (impact === 'Divida') return 'Merece monitoramento em Divida, mas ainda sem deterioração estrutural confirmada.';
    if (impact === 'Margens') return 'Merece monitoramento em Margens, mas ainda sem deterioração estrutural confirmada.';
    if (impact === 'Caixa') return 'Merece monitoramento em Caixa para confirmar se o movimento ganha tração.';
    if (impact === 'Retorno') return 'Merece monitoramento em Retorno para validar continuidade da tendencia.';
    return 'Merece monitoramento no pilar afetado antes de revisão de diagnóstico.';
  }
  if (impact === 'Proventos') return 'Reforça o acompanhamento de Proventos, sem alteracao relevante nos demais pilares no momento.';
  return 'Reforça acompanhamento pontual, sem gerar alerta estrutural neste momento.';
}

export function getTimelineEventTypeLabel(title?: string) {
  const raw = (title ?? '').toLowerCase();
  if (raw.includes('resultado')) return 'Resultado';
  if (raw.includes('guidance')) return 'Guidance';
  if (raw.includes('teleconfer')) return 'Teleconferencia';
  if (raw.includes('dividend') || raw.includes('jcp') || raw.includes('provento')) return 'Proventos';
  if (raw.includes('assembleia') || raw.includes('societ')) return 'Societario';
  return 'Atualização';
}

export function getTimelineQuarterLabel(title?: string) {
  const raw = title ?? '';
  const match = raw.match(/(\dT\d{2})/i);
  if (!match) return null;
  return match[1].toUpperCase();
}

export function buildTimelineHeadlineLine(
  event: { title?: string; typeLabel: string; mainPillar: ChangePillarTag },
  windowLabel: FeedWindow
) {
  const quarter = getTimelineQuarterLabel(event.title);
  if (event.typeLabel === 'Resultado' && quarter) {
    return `Nos próximos ${windowLabel.replace(' dias', '')} dias, o principal gatilho esperado e o resultado do ${quarter}, com possível efeito em ${event.mainPillar}.`;
  }
  return `Nos próximos ${windowLabel.replace(' dias', '')} dias, o principal gatilho esperado e ${event.title?.toLowerCase() ?? 'um evento relevante'}, com possível efeito em ${event.mainPillar}.`;
}

export function getTimelineEventLevel(event: { expectedImpact?: string; title?: string; pillars?: string[] }): ChangePriorityLevel {
  const impact = (event.expectedImpact ?? '').toLowerCase();
  const type = getTimelineEventTypeLabel(event.title).toLowerCase();
  const mainPillar = normalizeChangePillar(event.pillars?.[0]);
  if (impact.includes('alto')) return 'Estrutural';
  if (impact.includes('moderado')) return 'Relevante';
  if (type.includes('proventos') || type.includes('teleconferencia')) return 'Rotina';
  if (mainPillar === 'Proventos') return 'Rotina';
  return 'Relevante';
}

export function buildTimelineInterpretationLine(event: {
  title?: string;
  typeLabel: string;
  level: ChangePriorityLevel;
  mainPillar: ChangePillarTag;
  pillars?: string[];
}) {
  if (event.level === 'Estrutural') {
    const supportingPillars = (event.pillars ?? [])
      .map((pillar) => normalizeChangePillar(pillar))
      .filter((pillar) => pillar !== event.mainPillar && pillar !== 'A classificar');
    const supportingText = supportingPillars.length > 0 ? ` e influenciar também ${supportingPillars.join(' e ')}` : '';
    const quarter = getTimelineQuarterLabel(event.title);
    if (event.typeLabel === 'Resultado' && quarter) {
      return `O resultado do ${quarter} pode mudar primeiro a leitura de ${event.mainPillar}${supportingText}, dependendo da qualidade do trimestre.`;
    }
    if (event.mainPillar === 'Divida') return `Este gatilho pode mudar primeiro a leitura de Divida${supportingText} nos próximos fechamentos.`;
    if (event.mainPillar === 'Margens') return `Este gatilho pode mudar primeiro a leitura de Margens${supportingText} nos próximos resultados.`;
    if (event.mainPillar === 'Retorno') return `Este gatilho pode mudar primeiro a leitura de Retorno${supportingText} nos próximos fechamentos.`;
    return `Este gatilho de ${event.typeLabel.toLowerCase()} pode mudar primeiro a leitura de ${event.mainPillar}${supportingText} nos próximos fechamentos.`;
  }
  if (event.level === 'Relevante') {
    if (event.mainPillar === 'Divida') return 'Ainda não muda a leitura estrutural da empresa, mas merece acompanhamento pelo efeito potencial no perfil da divida.';
    if (event.mainPillar === 'Margens') return 'Ainda não muda a leitura estrutural, mas adiciona sinal para acompanhar a evolução operacional.';
    if (event.mainPillar === 'Caixa') return 'Ainda não muda a leitura estrutural, mas merece monitoramento para confirmar continuidade do movimento de caixa.';
    if (event.mainPillar === 'Retorno') return 'Ainda não muda a leitura estrutural, mas pode alterar a leitura de retorno nos próximos fechamentos.';
    return `Ainda não muda a leitura estrutural, mas o evento de ${event.typeLabel.toLowerCase()} merece acompanhamento.`;
  }
  if (event.mainPillar === 'Proventos') return 'Atualização recorrente de distribuição, sem impacto estrutural relevante na leitura atual da empresa.';
  return `Atualização recorrente de ${event.typeLabel.toLowerCase()}, sem impacto estrutural relevante na leitura atual da empresa.`;
}

export function buildTimelineWhyItMatters(event: {
  why?: string;
  level: ChangePriorityLevel;
  mainPillar: ChangePillarTag;
  pillars?: string[];
}) {
  const cleanedWhy = (event.why ?? '').trim();
  if (event.level === 'Estrutural') {
    return 'E o principal gatilho de curto prazo para revisar a leitura da empresa.';
  }
  if (cleanedWhy.length > 0) return cleanedWhy;
  if (event.level === 'Relevante') {
    if (event.mainPillar === 'Divida') return 'Merece monitoramento em Divida, mas ainda sem deterioração estrutural confirmada.';
    if (event.mainPillar === 'Margens') return 'Merece monitoramento em Margens, mas ainda sem deterioração estrutural confirmada.';
    if (event.mainPillar === 'Caixa') return 'Merece monitoramento em Caixa para confirmar se o movimento ganha tração.';
    if (event.mainPillar === 'Retorno') return 'Merece monitoramento em Retorno para validar continuidade da tendencia.';
    return 'Merece monitoramento no pilar afetado antes de revisão de diagnóstico.';
  }
  if (event.mainPillar === 'Proventos') return 'Reforça o acompanhamento de Proventos, sem alteracao relevante nos demais pilares no momento.';
  return 'Reforça acompanhamento pontual, sem gerar alerta estrutural neste momento.';
}

export function timelineSourceUrl(source?: string) {
  const raw = (source ?? '').toLowerCase();
  if (raw.includes('cvm')) return 'https://www.gov.br/cvm';
  if (raw.includes('b3')) return 'https://www.b3.com.br';
  if (raw.includes('ri')) return 'https://ri.analiso.com.br';
  return 'https://www.analiso.com.br/fontes';
}

export function resolvePillarName(value?: string | null): PillarName | null {
  const raw = (value ?? '').toLowerCase();
  if (!raw.trim()) return null;
  if (raw.includes('dvida') || raw.includes('divida') || raw.includes('debt')) return 'Divida';
  if (raw.includes('caixa') || raw.includes('cash')) return 'Caixa';
  if (raw.includes('marg') || raw.includes('margin')) return 'Margens';
  if (raw.includes('retorno') || raw.includes('return')) return 'Retorno';
  if (raw.includes('provent') || raw.includes('shareholder')) return 'Proventos';
  return null;
}

export function normalizePillarName(value?: string): PillarName {
  return resolvePillarName(value) ?? 'Proventos';
}

export function normalizeEvidenceParam(value?: string | null) {
  if (!value) return null;
  return value.trim().toLowerCase();
}

export function normalizeMainTabParam(value?: string | null): MainTab | null {
  const raw = (value ?? '').trim().toLowerCase();
  if (raw === 'resumo') return 'Resumo';
  if (raw === 'pilares') return 'Pilares';
  if (raw === 'mudancas' || raw === 'mudanças' || raw === 'mudanas') return 'Mudancas';
  if (raw === 'eventos') return 'Eventos';
  if (raw === 'preco' || raw === 'preço') return 'Preço';
  if (raw === 'fontes') return 'Fontes';
  return null;
}

export function getEvidenceAnchorId(pillarName: string, evidence: PillarEvidence, index: number) {
  const evidenceKey = (evidence.id ?? `${pillarName.toLowerCase()}-${index + 1}`).toLowerCase();
  return `evidence-${pillarName.toLowerCase()}-${evidenceKey}`;
}

export function getDefaultPreferences(): CompanyPreferences {
  return {
    activeTab: 'Resumo',
    changesWindow: '90 dias',
    eventsWindow: '30 dias',
    lastOpenPillar: null,
  };
}

export function loadPreferences(companyId: string): CompanyPreferences {
  const fallback = getDefaultPreferences();
  try {
    const raw = window.localStorage.getItem(`company-analysis-preferences:${companyId}`);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw) as Partial<CompanyPreferences>;
    return { ...fallback, ...parsed };
  } catch {
    return fallback;
  }
}

export function savePreferences(companyId: string, preferences: CompanyPreferences) {
  try {
    window.localStorage.setItem(`company-analysis-preferences:${companyId}`, JSON.stringify(preferences));
  } catch {
    // ignore storage errors
  }
}

// ─── Helpers de texto/display ─────────────────────────────────────────────────

export function shortDateDisplay(value?: string | null) {
  if (!value) return '';
  const iso = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (iso) return `${iso[3]}/${iso[2]}`;
  const br = value.match(/^(\d{2})\/(\d{2})\/\d{4}$/);
  if (br) return `${br[1]}/${br[2]}`;
  return value;
}

export function asDisplayValue(value: unknown) {
  if (!value || typeof value !== 'object') return '';
  const raw = value as { display?: string; formatted?: string; raw?: string | number | null };
  if (typeof raw.display === 'string' && raw.display.length > 0) return raw.display;
  if (typeof raw.formatted === 'string' && raw.formatted.length > 0) return raw.formatted;
  if (typeof raw.raw === 'string') return raw.raw;
  if (typeof raw.raw === 'number') return String(raw.raw);
  return '';
}

export function asTextValue(value: unknown) {
  if (typeof value === 'string') return value;
  if (typeof value === 'number') return String(value);
  const display = asDisplayValue(value);
  if (display) return display;
  return '';
}

export function asNumericValue(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  const text = asTextValue(value).trim();
  if (!text) return null;
  const normalized = text
    .replace(/[R$\s%]/g, '')
    .replace(/\./g, '')
    .replace(',', '.')
    .replace(/[^0-9.-]/g, '');
  const parsed = Number.parseFloat(normalized);
  return Number.isFinite(parsed) ? parsed : null;
}

export function normalizeMojibakeText(value: string) {
  if (!value) return value;
  return value
    .replace(/\u00C3\u00A1/g, 'a')
    .replace(/\u00C3\u00A2/g, 'a')
    .replace(/\u00C3\u00A3/g, 'a')
    .replace(/\u00C3\u00AA/g, 'e')
    .replace(/\u00C3\u00A9/g, 'e')
    .replace(/\u00C3\u00AD/g, 'i')
    .replace(/\u00C3\u00B3/g, 'o')
    .replace(/\u00C3\u00B5/g, 'o')
    .replace(/\u00C3\u00BA/g, 'u')
    .replace(/\u00C3\u00A7/g, 'c')
    .replace(/\u00E2\u20AC\u201D/g, '-')
    .replace(/\u00E2\u20AC\u201C/g, '-')
    .replace(/\u00E2\u2020\u2019/g, '->')
    .replace(/\u00E2\u2020\u2018/g, '<-')
    .replace(/\u00E2\u2020\u201C/g, '^')
    .replace(/\u00E2\u2020\u201D/g, 'v')
    .replace(/\uFFFD/g, '');
}

export function sanitizePayloadText<T>(value: T): T {
  if (typeof value === 'string') return normalizeMojibakeText(value) as T;
  if (Array.isArray(value)) return value.map((item) => sanitizePayloadText(item)) as T;
  if (value && typeof value === 'object') {
    const out: Record<string, unknown> = {};
    for (const [key, item] of Object.entries(value as Record<string, unknown>)) {
      out[key] = sanitizePayloadText(item);
    }
    return out as T;
  }
  return value;
}

export function normalizeMojibake(text: string) {
  if (!/[\u00C2\u00C3]/.test(text)) return text;
  try {
    const bytes = Uint8Array.from(text, (char) => char.charCodeAt(0) & 0xFF);
    const decoded = new TextDecoder('utf-8').decode(bytes);
    return decoded && decoded !== text ? decoded : text;
  } catch {
    return text;
  }
}

export function toDisplayText(value: unknown): string {
  if (typeof value === 'string') return value;
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);
  if (value && typeof value === 'object') {
    return asDisplayValue(value);
  }
  return '';
}

export function safeMeta(value?: unknown) {
  const text = toDisplayText(value).trim();
  if (!text || text.toLowerCase() === '[object object]') return '';
  return normalizeMojibake(text);
}

export function normalizeStatusLabel(value?: string, fallback: Status = 'Atencao'): Status {
  const raw = (value ?? '').trim().toLowerCase();
  if (!raw) return fallback;
  if (raw.includes('ris')) return 'Risco';
  if (raw.includes('aten') || raw.includes('monitor')) return 'Atencao';
  if (raw.includes('saud') || raw.includes('fort')) return 'Saudavel';
  return fallback;
}

export function normalizeRadarScores(
  value: Record<string, number> | undefined,
  fallback: Record<PillarName, number> = { Divida: 50, Caixa: 50, Margens: 50, Retorno: 50, Proventos: 50 }
): Record<PillarName, number> {
  const next = { ...fallback };
  if (!value) return next;
  Object.entries(value).forEach(([key, score]) => {
    const pillar = resolvePillarName(key);
    if (!pillar) return;
    const numeric = Number(score);
    if (Number.isFinite(numeric)) next[pillar] = numeric;
  });
  return next;
}

export function mapFairValueStateTone(stateRaw: unknown) {
  const state = String(stateRaw ?? '').toLowerCase();
  if (state.includes('below')) return 'teal';
  if (state.includes('above')) return 'amber';
  if (state.includes('over')) return 'coral';
  return '';
}

export function mapSensitivityImpactLabel(impactRaw: unknown) {
  const impact = String(impactRaw ?? '').toLowerCase();
  if (impact.includes('high')) return 'Impacto alto';
  if (impact.includes('medium')) return 'Impacto médio';
  if (impact.includes('low')) return 'Impacto baixo';
  return safeMeta(impactRaw);
}

export function formatCurrencyBRL(value: number | null | undefined) {
  if (value == null || !Number.isFinite(value)) return '--';
  return value.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

// ─── Adaptadores de payload da API ────────────────────────────────────────────

export function adaptV1Payload(raw: Record<string, unknown>, companyId: string, ticker: string): CompanyData | null {
  const overview = (raw.overview as Record<string, unknown> | undefined) ?? {};
  const radar = (raw.radar as Record<string, unknown> | undefined) ?? {};
  const radarCurrent = (radar.current as Record<string, number | null> | undefined) ?? {};
  const radarPrevious = (radar.previous as Record<string, number | null> | undefined) ?? {};
  const pillarsMap = (raw.pillars as Record<string, Record<string, unknown>> | undefined) ?? {};
  const changesBlock = (raw.changes as Record<string, unknown> | undefined) ?? {};
  const agenda = (raw.agenda as Record<string, unknown> | undefined) ?? {};
  const fairValueAnalysis = (raw.fairValueAnalysis as Record<string, unknown> | undefined) ?? {};
  const sources = (raw.sources as Record<string, unknown> | undefined) ?? {};

  const radarScores: Record<PillarName, number> = {
    Divida: Number(radarCurrent.divida ?? 50),
    Caixa: Number(radarCurrent.caixa ?? 50),
    Margens: Number(radarCurrent.margens ?? 50),
    Retorno: Number(radarCurrent.retorno ?? 50),
    Proventos: Number(radarCurrent.proventos ?? 50),
  };
  const radarPreviousScores: Record<PillarName, number> = {
    Divida: Number(radarPrevious.divida ?? radarScores.Divida),
    Caixa: Number(radarPrevious.caixa ?? radarScores.Caixa),
    Margens: Number(radarPrevious.margens ?? radarScores.Margens),
    Retorno: Number(radarPrevious.retorno ?? radarScores.Retorno),
    Proventos: Number(radarPrevious.proventos ?? radarScores.Proventos),
  };

  const pillarEntries = Object.values(pillarsMap).filter(Boolean);
  const adaptedPillars = pillarEntries
    .map((pillar) => {
      const name = resolvePillarName(String(pillar.name ?? pillar.displayName ?? '')) ?? null;
      if (!name || !pillarOrder.includes(name)) return null;
      const primaryMetric = (pillar.primaryMetric as Record<string, unknown> | undefined) ?? {};
      const currentMetric = (primaryMetric.current as Record<string, unknown> | undefined) ?? {};
      const reference5y = (primaryMetric.reference5y as Record<string, unknown> | undefined) ?? {};
      const primarySignal = (pillar.primarySignal as Record<string, unknown> | undefined) ?? {};
      const signalLabel = (primarySignal.label as Record<string, unknown> | undefined) ?? {};
      const signalIntensity = (primarySignal.intensity as Record<string, unknown> | undefined) ?? {};
      const signalSource = (primarySignal.source as Record<string, unknown> | undefined) ?? {};
      const watchItemsRaw = Array.isArray(pillar.watchItems) ? pillar.watchItems as Array<Record<string, unknown>> : [];
      const chart = (pillar.chart as Record<string, unknown> | undefined) ?? {};
      const chartSeries = (chart.series as Record<string, Record<string, unknown>> | undefined) ?? {};
      const chart5y = (chartSeries['5y'] as Record<string, unknown> | undefined) ?? {};
      const chart10y = (chartSeries['10y'] as Record<string, unknown> | undefined) ?? {};
      const trust = (pillar.trust as Record<string, unknown> | undefined) ?? {};
      const trustUpdated = (trust.updatedAt as Record<string, unknown> | undefined) ?? {};
      const trustStatus = (trust.status as Record<string, unknown> | undefined) ?? {};
      const meaning = (pillar.meaning as Record<string, unknown> | undefined) ?? {};
      const explainer = (pillar.explainer as Record<string, unknown> | undefined) ?? {};
      const ctaRaw = pillar.cta;
      const ctaObj = (ctaRaw && typeof ctaRaw === 'object') ? (ctaRaw as Record<string, unknown>) : {};
      const ctaPrimaryObj = (ctaObj.primary && typeof ctaObj.primary === 'object') ? (ctaObj.primary as Record<string, unknown>) : {};

      const metricLabel = safeMeta(primaryMetric.displayLabel) || safeMeta(primaryMetric.label);
      const currentFormatted = safeMeta(currentMetric.formatted);
      const refFormatted = safeMeta(reference5y.formatted);
      const metricDate = asDisplayValue(currentMetric.date) || shortDateDisplay(safeMeta(currentMetric.raw));

      const evidences: PillarEvidence[] = [
        {
          id: safeMeta(pillar.key) || name,
          label: safeMeta(signalLabel.display) || safeMeta(signalLabel.key),
          intensity: safeMeta(signalIntensity.display) || safeMeta(signalIntensity.key),
          title: safeMeta(primarySignal.title),
          value: safeMeta(primarySignal.value) || currentFormatted,
          metric: safeMeta(primarySignal.metric) || metricLabel,
          why: safeMeta(primarySignal.why),
          source: {
            name: safeMeta(signalSource.displaySource),
            docLabel: safeMeta(signalSource.displayDoc),
            date: asDisplayValue(signalSource.date) || shortDateDisplay(safeMeta(signalSource.date)),
            url: safeMeta(signalSource.url),
          },
        },
        ...watchItemsRaw.map((item, index) => {
          const itemIntensity = (item.intensity as Record<string, unknown> | undefined) ?? {};
          const itemLabel = (item.label as Record<string, unknown> | undefined) ?? {};
          return {
            id: `${safeMeta(pillar.key) || name}-watch-${index + 1}`,
            label: safeMeta(itemLabel.display) || safeMeta(itemLabel.key),
            intensity: safeMeta(itemIntensity.display) || safeMeta(itemIntensity.key),
            title: safeMeta(item.title),
            value: '',
            metric: metricLabel,
            why: safeMeta(item.why),
            source: { name: '', docLabel: '', date: '', url: '' },
          } as PillarEvidence;
        }),
      ];

      const watchItems = watchItemsRaw.map((item) => {
        const intensity = (item.intensity as Record<string, unknown> | undefined) ?? {};
        return {
          title: safeMeta(item.title),
          why: safeMeta(item.why),
          intensity: safeMeta(intensity.key) || safeMeta(intensity.display),
        };
      });

      const statusObj = (pillar.status as Record<string, unknown> | undefined) ?? {};
      const trendObj = (pillar.trend as Record<string, unknown> | undefined) ?? {};
      const scoreObj = (pillar.score as Record<string, unknown> | undefined) ?? {};

      return {
        companyId,
        ticker,
        name,
        displayName: safeMeta(pillar.displayName),
        status: normalizeStatusLabel(safeMeta(statusObj.display) || safeMeta(statusObj.key), 'Atencao'),
        score: Number(scoreObj.raw ?? 50),
        trend: safeMeta(trendObj.display),
        summary: safeMeta(pillar.summary) || safeMeta(meaning.text),
        meaningText: safeMeta(meaning.text),
        trust: {
          source: safeMeta(trust.sourceDisplay),
          updatedAt: asDisplayValue(trustUpdated) || shortDateDisplay(safeMeta(trustUpdated.raw)),
          status: safeMeta(trustStatus.display).toLowerCase().includes('antig') ? 'Antigo' : 'Atualizado',
        },
        chart: {
          title: safeMeta(chart.title),
          years5: Array.isArray(chart5y.years) ? chart5y.years as string[] : [],
          years10: Array.isArray(chart10y.years) ? chart10y.years as string[] : (Array.isArray(chart5y.years) ? chart5y.years as string[] : []),
          series5: Array.isArray(chart5y.values) ? chart5y.values as number[] : [],
          series10: Array.isArray(chart10y.values) ? chart10y.values as number[] : (Array.isArray(chart5y.values) ? chart5y.values as number[] : []),
        },
        metrics: [
          { label: metricLabel, value: currentFormatted, period: '', source: { name: safeMeta(signalSource.displaySource), docLabel: safeMeta(signalSource.displayDoc), date: metricDate, url: safeMeta(signalSource.url) } },
          { label: `${metricLabel} (ref. 5a)`, value: refFormatted, period: '', source: { name: safeMeta(signalSource.displaySource), docLabel: safeMeta(signalSource.displayDoc), date: metricDate, url: safeMeta(signalSource.url) } },
        ] as PillarMetric[],
        evidences,
        primarySignal: {
          title: safeMeta(primarySignal.title),
          value: safeMeta(primarySignal.value) || currentFormatted,
          metric: safeMeta(primarySignal.metric) || metricLabel,
          why: safeMeta(primarySignal.why),
          intensity: safeMeta(signalIntensity.key) || safeMeta(signalIntensity.display),
          label: safeMeta(signalLabel.display) || safeMeta(signalLabel.key),
        },
        watchItems,
        explainer: { text: safeMeta(explainer.text) },
        cta: {
          title: safeMeta(ctaObj.subtitle) || safeMeta(ctaObj.title) || safeMeta(pillar.ctaTitle) || safeMeta(pillar.cta_title),
          button: safeMeta(ctaPrimaryObj.label) || safeMeta(ctaObj.button) || safeMeta(ctaObj.text) || safeMeta(pillar.ctaText) || safeMeta(pillar.cta_text) || (typeof ctaRaw === 'string' ? safeMeta(ctaRaw) : ''),
        },
      } as Contextual<PillarData>;
    })
    .filter((pillar): pillar is Contextual<PillarData> => pillar !== null);

  const changesItemsRaw = Array.isArray(changesBlock.items) ? changesBlock.items as Array<Record<string, unknown>> : [];
  const adaptedChanges = changesItemsRaw.map((item) => {
    const date = (item.date as Record<string, unknown> | undefined) ?? {};
    const type = (item.type as Record<string, unknown> | undefined) ?? {};
    const severity = (item.severity as Record<string, unknown> | undefined) ?? {};
    const impact = (item.impact as Record<string, unknown> | undefined) ?? {};
    const source = (item.source as Record<string, unknown> | undefined) ?? {};
    const beforeAfter = (item.beforeAfter as Record<string, unknown> | undefined) ?? {};
    const shortDate = asDisplayValue(date) || shortDateDisplay(String(date.raw ?? ''));
    const compactDate = shortDate.includes('/') ? shortDate.split('/').slice(0, 2).join('/') : shortDate;
    return {
      companyId: String(item.companyId ?? companyId),
      ticker: String(item.ticker ?? ticker),
      type: String(type.display ?? type.key ?? ''),
      date: compactDate,
      severity: String(severity.display ?? severity.key ?? ''),
      impact: String(impact.display ?? impact.key ?? ''),
      title: String(item.title ?? ''),
      impactLine: String(item.impactLine ?? item.whyItMatters ?? ''),
      unchangedLine: '',
      beforeAfter: (String(beforeAfter.before ?? '') || String(beforeAfter.after ?? '')) ? `Antes: ${String(beforeAfter.before ?? '')} Depois: ${String(beforeAfter.after ?? '')}` : undefined,
      source: {
        docLabel: String(source.displaySource ?? ''),
        url: String(source.url ?? ''),
      },
    };
  });

  const summaryByWindow = (changesBlock.summaryByWindow as Record<string, Record<string, unknown>> | undefined) ?? {};
  const changesSummaryByWindow = Object.fromEntries(
    Object.entries(summaryByWindow).map(([window, summary]) => {
      const counts = (summary.counts as Record<string, unknown> | undefined) ?? {};
      const principal = (summary.principalChange as Record<string, unknown> | undefined) ?? {};
      const principalImpact = (principal.impact as Record<string, unknown> | undefined) ?? {};
      return [window, {
        windowDays: Number(summary.windowDays ?? Number(window)),
        summaryText: String(summary.summaryText ?? ''),
        mostAffectedPillar: String((summary.mostAffectedPillar as Record<string, unknown> | undefined)?.display ?? ''),
        structuralCount: Number(counts.structural ?? 0),
        relevantCount: Number(counts.relevant ?? 0),
        routineCount: Number(counts.routine ?? 0),
        isWindowFallback: Boolean(summary.isWindowFallback),
        principalChange: {
          title: String(principal.title ?? ''),
          type: String((principal.type as Record<string, unknown> | undefined)?.display ?? ''),
          impact: String(principalImpact.display ?? principalImpact.key ?? ''),
          whyItMatters: String(principal.whyItMatters ?? ''),
        },
      }];
    })
  ) as CompanyData['changesSummaryByWindow'];

  const agendaEvents = Array.isArray(agenda.events) ? agenda.events as Array<Record<string, unknown>> : [];
  const adaptedTimeline = agendaEvents.map((item) => {
    const date = (item.date as Record<string, unknown> | undefined) ?? {};
    const expectedImpact = (item.expectedImpact as Record<string, unknown> | undefined) ?? {};
    const pillarsRaw = Array.isArray(item.pillars) ? item.pillars as Array<Record<string, unknown>> : [];
    const shortDate = asDisplayValue(date) || shortDateDisplay(String(date.raw ?? ''));
    const compactDate = shortDate.includes('/') ? shortDate.split('/').slice(0, 2).join('/') : shortDate;
    return {
      companyId: String(item.companyId ?? companyId),
      ticker: String(item.ticker ?? ticker),
      date: compactDate,
      title: String(item.title ?? ''),
      source: safeMeta(item.sourceDisplay),
      why: String(item.why ?? ''),
      expectedImpact: String(expectedImpact.display ?? expectedImpact.key ?? ''),
      pillars: pillarsRaw.map((pillar) => String(pillar.display ?? pillar.key ?? '')).filter(Boolean),
    };
  });

  const distribution = (fairValueAnalysis.distributionByMetric as Record<string, Record<string, unknown>> | undefined) ?? {};
  const priceRowsRaw = Array.isArray(fairValueAnalysis.rows) ? fairValueAnalysis.rows as Array<Record<string, unknown>> : [];
  const priceRows = priceRowsRaw.map((row) => ({
    companyId,
    ticker,
    metric: String(row.metric ?? ''),
    current: String(row.current ?? ''),
    sector: String(row.sector ?? ''),
    histórical: String(row.histórical ?? ''),
    insight: String(row.insight ?? ''),
  }));
  const fairMeta = (fairValueAnalysis.meta as Record<string, unknown> | undefined) ?? {};
  const fairCards = (fairValueAnalysis.cards as Record<string, unknown> | undefined) ?? {};
  const fairCurrentCard = (fairCards.currentPrice as Record<string, unknown> | undefined) ?? {};
  const fairValueCard = (fairCards.fairValue as Record<string, unknown> | undefined) ?? {};
  const fairGapCard = (fairCards.gap as Record<string, unknown> | undefined) ?? {};
  const valuationState = {
    label: safeMeta(fairValueAnalysis.label),
    tone: mapFairValueStateTone(fairValueAnalysis.state),
  };
  const scenariosRaw = Array.isArray(fairValueAnalysis.scenarios) ? fairValueAnalysis.scenarios as Array<Record<string, unknown>> : [];
  const fairSensitivity = (fairValueAnalysis.sensitivity as Record<string, unknown> | undefined) ?? {};
  const sensitivityRaw = Array.isArray(fairSensitivity.drivers) ? fairSensitivity.drivers as Array<Record<string, unknown>> : [];
  const fairChart = (fairValueAnalysis.chart as Record<string, unknown> | undefined) ?? {};
  const fairRanges = (fairChart.ranges as Record<string, unknown> | undefined) ?? {};
  const fairConservativeRange = (fairRanges.conservative as Record<string, unknown> | undefined) ?? {};
  const fairBaseRange = (fairRanges.base as Record<string, unknown> | undefined) ?? {};
  const fairOptimisticRange = (fairRanges.optimistic as Record<string, unknown> | undefined) ?? {};
  const fairCurrentChart = (fairChart.currentPrice as Record<string, unknown> | undefined) ?? {};
  const conservativeRaw = fairConservativeRange;
  const baseRaw = fairBaseRange;
  const optimisticRaw = fairOptimisticRange;
  const currentRaw = fairCurrentChart;
  const inferredMin = [
    asNumericValue(conservativeRaw.min), asNumericValue(conservativeRaw.max),
    asNumericValue(baseRaw.min), asNumericValue(baseRaw.max),
    asNumericValue(baseRaw.fairValue ?? baseRaw.value),
    asNumericValue(optimisticRaw.min), asNumericValue(optimisticRaw.max),
    asNumericValue(currentRaw.value), asNumericValue(fairCurrentCard.value),
  ].filter((value): value is number => value != null && Number.isFinite(value));
  const bulletChart: PriceBulletChart = {
    conservativeMin: asNumericValue(conservativeRaw.min),
    conservativeMax: asNumericValue(conservativeRaw.max),
    baseMin: asNumericValue(baseRaw.min),
    baseMax: asNumericValue(baseRaw.max),
    baseValue: asNumericValue(baseRaw.fairValue ?? baseRaw.value),
    optimisticMin: asNumericValue(optimisticRaw.min),
    optimisticMax: asNumericValue(optimisticRaw.max),
    currentPrice: asNumericValue(currentRaw.value) ?? asNumericValue(fairCurrentCard.value),
    min: asNumericValue(fairConservativeRange.min) ?? (inferredMin.length > 0 ? Math.min(...inferredMin) : null),
    max: asNumericValue(fairOptimisticRange.max) ?? (inferredMin.length > 0 ? Math.max(...inferredMin) : null),
    conservativeLabel: safeMeta(conservativeRaw.label) || 'Faixa conservadora',
    baseLabel: safeMeta(baseRaw.label) || 'Cenário-base',
    optimisticLabel: safeMeta(optimisticRaw.label) || 'Faixa otimista',
    currentLabel: safeMeta(currentRaw.label) || 'Preço atual',
    sourceNote: safeMeta((fairChart as Record<string, unknown>).sourceNote),
  };
  const valuationScenarios = scenariosRaw.map((scenario) => ({
    scenario: safeMeta(scenario.label),
    estimatedValue: asTextValue(scenario.displayEstimatedValue ?? scenario.estimatedValue),
    differenceVsCurrent: asTextValue(scenario.displayGapVsCurrent ?? scenario.gapVsCurrentPct),
    reading: asTextValue(scenario.reading),
  })).filter((s) => s.scenario || s.estimatedValue || s.differenceVsCurrent || s.reading);
  const sensitivityDrivers = sensitivityRaw.map((driver) => ({
    driver: safeMeta(driver.key),
    value: safeMeta(driver.label),
    impact: mapSensitivityImpactLabel(driver.impact),
  })).filter((d) => d.driver || d.value || d.impact);

  const sourceRowsRaw = Array.isArray(sources.rows) ? sources.rows as Array<Record<string, unknown>> : [];
  const adaptedSourceRows = sourceRowsRaw.map((row) => {
    const date = (row.date as Record<string, unknown> | undefined) ?? {};
    const status = (row.status as Record<string, unknown> | undefined) ?? {};
    const shortDate = asDisplayValue(date) || shortDateDisplay(String(date.raw ?? ''));
    const compactDate = shortDate.includes('/') ? shortDate.split('/').slice(0, 2).join('/') : shortDate;
    return {
      companyId,
      ticker,
      category: String(row.category ?? ''),
      source: String(row.displaySource ?? ''),
      doc: String(row.displayDoc ?? ''),
      date: compactDate,
      status: String(status.display ?? status.key ?? ''),
      link: String(row.link ?? ''),
      displaySource: String(row.displaySource ?? ''),
      displayDoc: String(row.displayDoc ?? ''),
      displayStatus: String(status.display ?? status.key ?? ''),
    };
  });
  const confidenceSummary = (sources.confidenceSummary as Record<string, unknown> | undefined) ?? {};
  const confidenceLevel = (confidenceSummary.level as Record<string, unknown> | undefined) ?? {};

  const strongest = (overview.strongest as Record<string, unknown> | undefined) ?? {};
  const watchout = (overview.watchout as Record<string, unknown> | undefined) ?? {};
  const monitor = (overview.monitor as Record<string, unknown> | undefined) ?? {};
  const summaryScan = (overview.summaryScan as Record<string, unknown> | undefined) ?? {};
  const summaryMeta = (overview.summaryMeta as Record<string, unknown> | undefined) ?? {};
  const strongestBadge = (strongest.badge as Record<string, unknown> | undefined) ?? {};
  const watchoutBadge = (watchout.badge as Record<string, unknown> | undefined) ?? {};
  const strongestTrend = (strongest.trend as Record<string, unknown> | undefined) ?? {};
  const watchoutTrend = (watchout.trend as Record<string, unknown> | undefined) ?? {};
  const strongestScore = (strongest.score as Record<string, unknown> | undefined) ?? {};
  const watchoutScore = (watchout.score as Record<string, unknown> | undefined) ?? {};

  return {
    companyId,
    ticker,
    radarScores,
    radarPreviousScores,
    diagnosisHeadline: safeMeta(overview.diagnosisHeadline),
    strongest: {
      title: resolvePillarName(String(strongest.title ?? strongest.pillarKey ?? '')) ?? String(strongest.title ?? ''),
      score: safeMeta(strongestScore.display),
      badge: normalizeStatusLabel(String(strongestBadge.display ?? strongestBadge.key ?? ''), 'Atencao'),
      trend: safeMeta(strongestTrend.display) || safeMeta(strongestTrend.key),
      summary: safeMeta(strongest.summary),
    },
    watchout: {
      title: resolvePillarName(String(watchout.title ?? watchout.pillarKey ?? '')) ?? String(watchout.title ?? ''),
      score: safeMeta(watchoutScore.display),
      badge: normalizeStatusLabel(String(watchoutBadge.display ?? watchoutBadge.key ?? ''), 'Atencao'),
      trend: safeMeta(watchoutTrend.display) || safeMeta(watchoutTrend.key),
      summary: safeMeta(watchout.summary),
    },
    monitor: {
      pillar: resolvePillarName(String(monitor.pillarDisplay ?? monitor.pillarKey ?? '')) ?? String(monitor.pillarDisplay ?? ''),
      text: safeMeta(monitor.text),
    },
    summaryScan: {
      motherLine: safeMeta(summaryScan.motherLine),
      strength: {
        pillar: resolvePillarName(String(((summaryScan.strength as Record<string, unknown> | undefined) ?? {}).pillarDisplay ?? '')) ?? String(((summaryScan.strength as Record<string, unknown> | undefined) ?? {}).pillarDisplay ?? ''),
        text: safeMeta(((summaryScan.strength as Record<string, unknown> | undefined) ?? {}).text),
      },
      attention: {
        pillar: resolvePillarName(String(((summaryScan.attention as Record<string, unknown> | undefined) ?? {}).pillarDisplay ?? '')) ?? String(((summaryScan.attention as Record<string, unknown> | undefined) ?? {}).pillarDisplay ?? ''),
        text: safeMeta(((summaryScan.attention as Record<string, unknown> | undefined) ?? {}).text),
      },
      monitor: {
        pillar: resolvePillarName(String(((summaryScan.monitor as Record<string, unknown> | undefined) ?? {}).pillarDisplay ?? '')) ?? String(((summaryScan.monitor as Record<string, unknown> | undefined) ?? {}).pillarDisplay ?? ''),
        text: safeMeta(((summaryScan.monitor as Record<string, unknown> | undefined) ?? {}).text),
      },
    },
    summaryText: safeMeta(overview.summaryText),
    summaryMeta: {
      updatedAt: asDisplayValue(summaryMeta.updatedAt),
      source: safeMeta(summaryMeta.sourcesDisplay),
    },
    pillars: adaptedPillars as CompanyData['pillars'],
    changes: adaptedChanges as CompanyData['changes'],
    timelineEvents: adaptedTimeline as CompanyData['timelineEvents'],
    priceData: {
      companyId,
      ticker,
      current: asTextValue(fairCurrentCard.displayValue ?? fairCurrentChart.displayValue),
      summary: String(fairValueAnalysis.summary ?? fairValueAnalysis.headline ?? ''),
      labels: [],
      values: [],
      currentMarker: 0,
      medianMarker: 0,
      rows: priceRows as CompanyData['priceData']['rows'],
      source: safeMeta(fairMeta.source),
      updatedAt: asTextValue(fairMeta.updatedAt),
      estimatedFairValue: asTextValue(fairValueCard.displayValue ?? fairBaseRange.displayFairValue),
      differenceVsCurrent: asTextValue(fairGapCard.displayValue),
      valuationSummary: asTextValue(fairValueAnalysis.whyItMatters ?? fairValueAnalysis.meaning),
      valuationStateChip: { label: safeMeta(valuationState.label), tone: safeMeta(valuationState.tone) },
      valuationScenarios,
      bulletChart,
      sensitivityDrivers,
      multiplesSummary: asTextValue(fairSensitivity.summary ?? fairValueAnalysis.takeaway ?? fairValueAnalysis.summary),
      metricSeries: Object.fromEntries(Object.entries(distribution).map(([metric, dist]) => {
        const labels = Array.isArray(dist.labels) ? dist.labels as string[] : [];
        const values = Array.isArray(dist.values) ? dist.values as number[] : [];
        const currentMarker = Number(dist.currentMarker ?? 0);
        const medianMarker = Number(dist.medianMarker ?? 0);
        return [metric, { labels, values, currentMarker, medianMarker }];
      })) as CompanyData['priceData']['metricSeries'],
    } as CompanyData['priceData'],
    sourceRows: adaptedSourceRows as CompanyData['sourceRows'],
    sourceConfidence: {
      title: String(confidenceSummary.title ?? ''),
      level: String(confidenceLevel.display ?? confidenceLevel.key ?? ''),
      summary: String(confidenceSummary.summary ?? ''),
    },
    changesSummaryByWindow,
    changesSummary: changesSummaryByWindow?.['90'],
  };
}

export function normalizeLegacyCompanyData(raw: unknown, companyId: string, ticker: string): CompanyData | null {
  if (!raw || typeof raw !== 'object') return null;
  const payload = sanitizePayloadText(raw as Partial<CompanyData>);
  if (!payload.radarScores || !payload.priceData) return null;

  const applyContext = <T extends object>(items: T[] | undefined): Array<T & { companyId: string; ticker: string }> =>
    (items ?? []).map((item) => ({
      ...item,
      companyId: (item as { companyId?: string }).companyId ?? companyId,
      ticker: (item as { ticker?: string }).ticker ?? ticker,
    }));

  const normalizedRadarScores = normalizeRadarScores(payload.radarScores as Record<string, number> | undefined, EMPTY_RADAR_SCORES);
  const normalizedPreviousScores = normalizeRadarScores(payload.radarPreviousScores as Record<string, number> | undefined, normalizedRadarScores);
  const normalizedPillars = applyContext(payload.pillars as CompanyData['pillars'] | undefined).map((pillar) => {
    const parsedScore = Number((pillar as { score?: number }).score ?? 50);
    const score = Number.isFinite(parsedScore) ? parsedScore : 50;
    const pillarName = resolvePillarName((pillar as { name?: string }).name) ?? 'Divida';
    const trust = (pillar as { trust?: { source?: string; updatedAt?: string; status?: string } }).trust;
    const rawStatus = (pillar as { status?: string }).status;
    return {
      ...pillar,
      name: pillarName,
      score,
      status: normalizeStatusLabel(rawStatus, 'Atencao'),
      trust: {
        source: trust?.source ?? '',
        updatedAt: trust?.updatedAt ?? '',
        status: (trust?.status ?? '').toLowerCase().includes('antig') ? 'Antigo' : 'Atualizado',
      },
    };
  }) as CompanyData['pillars'];

  return {
    companyId,
    ticker,
    radarScores: normalizedRadarScores,
    radarPreviousScores: normalizedPreviousScores,
    diagnosisHeadline: payload.diagnosisHeadline ?? '',
    strongest: {
      ...(payload.strongest ?? { title: '', score: '', badge: '', trend: '', summary: '' }),
      title: resolvePillarName(payload.strongest?.title) ?? (payload.strongest?.title ?? ''),
      badge: normalizeStatusLabel(payload.strongest?.badge, 'Saudavel'),
    },
    watchout: {
      ...(payload.watchout ?? { title: '', score: '', badge: '', trend: '', summary: '' }),
      title: resolvePillarName(payload.watchout?.title) ?? (payload.watchout?.title ?? ''),
      badge: normalizeStatusLabel(payload.watchout?.badge, 'Atencao'),
    },
    monitor: {
      ...(payload.monitor ?? { pillar: '', text: '' }),
      pillar: resolvePillarName(payload.monitor?.pillar) ?? (payload.monitor?.pillar ?? ''),
    },
    summaryScan: {
      ...(payload.summaryScan ?? {
        motherLine: '',
        strength: { pillar: '', text: '' },
        attention: { pillar: '', text: '' },
        monitor: { pillar: '', text: '' },
      }),
      strength: {
        ...(payload.summaryScan?.strength ?? { pillar: '', text: '' }),
        pillar: resolvePillarName(payload.summaryScan?.strength?.pillar) ?? (payload.summaryScan?.strength?.pillar ?? ''),
      },
      attention: {
        ...(payload.summaryScan?.attention ?? { pillar: '', text: '' }),
        pillar: resolvePillarName(payload.summaryScan?.attention?.pillar) ?? (payload.summaryScan?.attention?.pillar ?? ''),
      },
      monitor: {
        ...(payload.summaryScan?.monitor ?? { pillar: '', text: '' }),
        pillar: resolvePillarName(payload.summaryScan?.monitor?.pillar) ?? (payload.summaryScan?.monitor?.pillar ?? ''),
      },
    },
    summaryText: payload.summaryText ?? '',
    summaryMeta: payload.summaryMeta ?? {},
    pillars: normalizedPillars,
    changes: applyContext(payload.changes as CompanyData['changes'] | undefined),
    timelineEvents: applyContext(payload.timelineEvents as CompanyData['timelineEvents'] | undefined),
    priceData: {
      ...payload.priceData,
      companyId,
      ticker,
      rows: applyContext(payload.priceData?.rows as CompanyData['priceData']['rows'] | undefined),
      metricSeries: payload.priceData?.metricSeries,
    },
    sourceRows: applyContext(payload.sourceRows as CompanyData['sourceRows'] | undefined),
  };
}

export function normalizeCompanyData(raw: unknown, companyId: string, ticker: string): CompanyData | null {
  if (!raw || typeof raw !== 'object') return null;
  const payload = sanitizePayloadText(raw as Record<string, unknown>);
  if (String(payload.version ?? '') === '1.0' && payload.overview && payload.radar && payload.pillars) {
    return adaptV1Payload(payload, companyId, ticker);
  }
  return normalizeLegacyCompanyData(payload, companyId, ticker);
}

// ─── Chamada HTTP ─────────────────────────────────────────────────────────────

export async function fetchCompanyData(companyId: string, ticker: string): Promise<CompanyData | null> {
  try {
    const endpoint = `${API_BASE_URL}/api/company-analysis/${encodeURIComponent(ticker)}`;
    const response = await fetch(endpoint, {
      headers: { Accept: 'application/json' },
    });
    if (!response.ok) return null;
    const data = await response.json();
    return normalizeCompanyData(data, companyId, ticker);
  } catch {
    return null;
  }
}

// ─── Dados mock por empresa ───────────────────────────────────────────────────

export const mockDataByCompany: Record<string, CompanyData> = {
  WEGE3: {
    companyId: 'WEGE3',
    ticker: 'WEGE3',
    radarScores: EMPTY_RADAR_SCORES,
    radarPreviousScores: EMPTY_RADAR_SCORES,
    diagnosisHeadline: 'WEG segue forte em caixa e retorno, mas a divida exige acompanhamento neste trimestre.',
    strongest: {
      title: 'Caixa',
      score: '72/100',
      badge: 'Saudavel',
      trend: '? +2 vs 12m',
      summary: 'Fluxo de caixa livre segue positivo e sustenta investimentos sem dvida adicional.',
    },
    watchout: {
      title: 'Dívida',
      score: '58/100',
      badge: 'Atencao',
      trend: '? -3 vs último trimestre',
      summary: 'Alavancagem subiu e exige acompanhamento de caixa em cenrio de juros altos.',
    },
    monitor: {
      pillar: 'Divida',
      text: 'Monitorar Dívida Lq./EBITDA e cobertura de juros no prximo resultado.',
    },
    summaryScan: {
      motherLine: 'Atenção: alavancagem subiu no trimestre; caixa ainda sustenta.',
      strength: { pillar: 'Caixa', text: 'gerao de caixa livre permanece positiva.' },
      attention: { pillar: 'Divida', text: 'alavancagem avanou e exige disciplina financeira.' },
      monitor: { pillar: 'Divida', text: 'acompanhar Dívida Lq./EBITDA e cobertura de juros.' },
    },
    summaryText:
      'A WEG mantém posição financeira sólida com geração de caixa positiva e margens consistentes próximas à média histórica. O ponto de ateno a alavancagem, que subiu 0,2x no trimestre e exige monitoramento em um cenário de juros elevados. Proventos seguem estáveis, mas com distribuição volátil dependente do ciclo de investimento.',
    summaryMeta: { updatedAt: '05/02', source: 'CVM/B3/RI' },
    pillars: contextualize(pillars, 'WEGE3', 'WEGE3'),
    changes: contextualize(
      changes.map((item, index) => ({
        ...item,
        beforeAfter: index === 0 ? 'Antes: 19,6% ? Depois: 20,0% na margem EBITDA' : undefined,
      })),
      'WEGE3',
      'WEGE3'
    ),
    timelineEvents: contextualize(timelineEvents, 'WEGE3', 'WEGE3'),
    priceData: {
      ...priceData,
      companyId: 'WEGE3',
      ticker: 'WEGE3',
      source: 'B3',
      updatedAt: '05/02',
      rows: contextualize(priceData.rows, 'WEGE3', 'WEGE3'),
      metricSeries: {
        'P/L': { labels: ['12x', '14x', '16x', '18x', '20x', '22x'], values: [4, 6, 9, 7, 5, 2], currentMarker: 4, medianMarker: 2 },
        'EV/EBITDA': { labels: ['8x', '10x', '12x', '14x', '16x', '18x'], values: [2, 4, 7, 8, 5, 2], currentMarker: 3, medianMarker: 2 },
        'P/VP': { labels: ['2x', '2.5x', '3x', '3.5x', '4x', '4.5x'], values: [2, 3, 6, 8, 7, 4], currentMarker: 4, medianMarker: 2 },
      },
    } as CompanyData['priceData'],
    sourceRows: contextualize(sourceRows, 'WEGE3', 'WEGE3'),
  },
  VALE3: {
    companyId: 'VALE3',
    ticker: 'VALE3',
    radarScores: { Divida: 64, Caixa: 68, Margens: 66, Retorno: 62, Proventos: 70 },
    radarPreviousScores: { Divida: 65, Caixa: 70, Margens: 68, Retorno: 64, Proventos: 69 },
    diagnosisHeadline: 'Vale segue com caixa resiliente, mas retorno pede maior ateno no curto prazo.',
    strongest: {
      title: 'Proventos',
      score: '70/100',
      badge: 'Saudavel',
      trend: '? +1 vs 12m',
      summary: 'Distribuio permaneceu estvel e suportada por gerao de caixa.',
    },
    watchout: {
      title: 'Retorno',
      score: '62/100',
      badge: 'Atencao',
      trend: '? -2 vs último trimestre',
      summary: 'Retorno recuou no trimestre com pressão de preços de minério.',
    },
    monitor: {
      pillar: 'Retorno',
      text: 'Monitorar ROIC e margem EBITDA no prximo release.',
    },
    summaryScan: {
      motherLine: 'Atenção: retorno recuou no trimestre; caixa segue resiliente.',
      strength: { pillar: 'Proventos', text: 'distribuição permaneceu estável no ciclo recente.' },
      attention: { pillar: 'Retorno', text: 'eficiência caiu com pressão de preços de minério.' },
      monitor: { pillar: 'Retorno', text: 'acompanhar ROIC e evolução de margens.' },
    },
    summaryText:
      'A Vale mantm caixa robusto, porm com maior volátilidade de retorno no curto prazo devido ao ciclo de commodities e ao contexto macro global.',
    summaryMeta: { updatedAt: '06/02', source: 'RI/B3/CVM' },
    pillars: contextualize(
      pillars.map((pillar) => ({
        ...pillar,
        summary:
          pillar.name === 'Retorno'
            ? 'Atenção porque o retorno recuou no trimestre em função do ciclo de preços.'
            : pillar.summary,
      })),
      'VALE3',
      'VALE3'
    ),
    changes: contextualize(
      changes.map((item, index) => ({
        ...item,
        title: index === 0 ? 'Atualização de guidance e sensibilidade ao preço de minério.' : item.title,
        beforeAfter: index === 0 ? 'Antes: guidance neutro ? Depois: viés mais cauteloso' : undefined,
      })),
      'VALE3',
      'VALE3'
    ),
    timelineEvents: contextualize(
      timelineEvents.map((event, index) => ({
        ...event,
        title: index === 0 ? 'VALE3 Resultado 4T25' : event.title.replace('WEGE3', 'VALE3'),
      })),
      'VALE3',
      'VALE3'
    ),
    priceData: {
      ...priceData,
      companyId: 'VALE3',
      ticker: 'VALE3',
      current: 'R$ 66,20',
      summary: 'Hoje o preço reflete maior sensibilidade ao ciclo de minério e China.',
      source: 'B3',
      updatedAt: '06/02',
      rows: contextualize(
        priceData.rows.map((row, index) => ({
          ...row,
          metric: index === 0 ? 'EV/EBITDA' : row.metric,
        })),
        'VALE3',
        'VALE3'
      ),
      metricSeries: {
        'P/L': { labels: ['8x', '10x', '12x', '14x', '16x', '18x'], values: [2, 4, 8, 7, 4, 2], currentMarker: 3, medianMarker: 2 },
        'EV/EBITDA': { labels: ['4x', '5x', '6x', '7x', '8x', '9x'], values: [3, 6, 8, 6, 3, 1], currentMarker: 2, medianMarker: 2 },
      },
    } as CompanyData['priceData'],
    sourceRows: contextualize(
      sourceRows.map((row) => ({
        ...row,
        link: row.source === 'RI' ? 'https://www.vale.com/pt/investidores' : row.link,
      })),
      'VALE3',
      'VALE3'
    ),
  },
};

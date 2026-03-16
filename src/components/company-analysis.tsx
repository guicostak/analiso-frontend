import { useEffect, useMemo, useRef, useState } from 'react';
import {
 Activity,
 BarChart3,
 Bell,
 Bookmark,
 Building2,
 CalendarDays,
 Check,
 ChevronDown,
 ChevronLeft,
 ChevronUp,
 CircleHelp,
 Database,
 ExternalLink,
 LayoutGrid,
 MoreHorizontal,
 Search,
 Settings,
 Share2,
 TriangleAlert,
} from 'lucide-react';
import {
 PolarAngleAxis,
 PolarGrid,
 PolarRadiusAxis,
 Radar,
 RadarChart as RechartsRadarChart,
 ResponsiveContainer,
} from 'recharts';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { Sidebar } from './dashboard/sidebar';
import logoWeg from '../assets/logos/weg.jpeg';
import logoVale from '../assets/logos/vale.png';
import logoRenner from '../assets/logos/renner.png';
import logoMrv from '../assets/logos/mrv.jpg';
import logoTaesa from '../assets/logos/taesa.png';
import logoItau from '../assets/logos/itau.png';
import logoPetrobras from '../assets/logos/petrobras.webp';

type Status = 'Risco' | 'Atencao' | 'Saudavel';
type MainTab = 'Resumo' | 'Pilares' | 'Mudancas' | 'Eventos' | 'Preço' | 'Fontes';
type QueueFilter = 'Todas' | 'Atencao' | 'Risco';
type WindowSize = '5a' | '10a';
type FeedWindow = '30 dias' | '60 dias' | '90 dias';
type ChangesFocusFilter = 'Mais relevantes' | 'Rotina' | 'Estruturais';
type EventsFocusFilter = 'Mais relevantes' | 'Rotina' | 'Principais';
type EvidenceTab = 'Fonte' | 'Trecho' | 'Como calculamos';
type PillarName = 'Divida' | 'Caixa' | 'Margens' | 'Retorno' | 'Proventos';
type ChangePriorityLevel = 'Estrutural' | 'Relevante' | 'Rotina';
type ChangePillarTag = PillarName | 'A classificar';

type CompanyContext = {
 companyId: string;
 ticker: string;
 name: string;
};

type PriceValuationStateChip = {
 label: string;
 tone?: string;
};

type PriceValuationScenario = {
 scenario: string;
 estimatedValue: string;
 differenceVsCurrent: string;
 reading: string;
};

type PriceSensitivityDriver = {
 driver: string;
 value: string;
 impact: string;
};

type PriceBulletChart = {
 conservativeMin: number | null;
 conservativeMax: number | null;
 baseMin: number | null;
 baseMax: number | null;
 baseValue: number | null;
 optimisticMin: number | null;
 optimisticMax: number | null;
 currentPrice: number | null;
 min: number | null;
 max: number | null;
 conservativeLabel?: string;
 baseLabel?: string;
 optimisticLabel?: string;
 currentLabel?: string;
 sourceNote?: string;
};

type Contextual<T> = T & {
 companyId: string;
 ticker: string;
};

type CompanyQueueItem = {
 companyId: string;
 ticker: string;
 name: string;
 status: Status;
 logo?: string;
 initials?: string;
 description: string;
};

type Source = {
 name: string;
 docLabel: string;
 date: string;
 url?: string;
};

type PillarMetric = {
 label: string;
 value: string;
 period: string;
 source: Source;
};

type PillarEvidence = {
 id?: string;
 label: string;
 intensity: string;
 title: string;
 value: string;
 metric: string;
 why: string;
 source: Source;
};

type PillarPrimarySignal = {
 title: string;
 value: string;
 metric: string;
 why: string;
 intensity: string;
 label: string;
};

type PillarWatchItem = {
 title: string;
 why: string;
 intensity: string;
};

type PillarData = {
 name: 'Divida' | 'Caixa' | 'Margens' | 'Retorno' | 'Proventos';
 displayName?: string;
 status: Status;
 score: number;
 trend: string;
 summary: string;
 trust: { source: string; updatedAt: string; status: 'Atualizado' | 'Antigo' };
 chart: { title: string; series5: number[]; series10: number[]; years5: string[]; years10: string[] };
 metrics: PillarMetric[];
 evidences: PillarEvidence[];
 primarySignal?: PillarPrimarySignal;
 watchItems?: PillarWatchItem[];
 explainer?: { text: string };
 cta?: { title: string; button: string };
 meaningText?: string;
};
const queueItems: CompanyQueueItem[] = [
 { companyId: 'VALE3', ticker: 'VALE3', name: 'Vale', status: 'Risco', logo: logoVale, description: 'Mineradora global com forte exposição a minério de ferro.' },
 { companyId: 'PETR4', ticker: 'PETR4', name: 'Petrobras', status: 'Atencao', logo: logoPetrobras, description: 'Empresa integrada de energia, com foco em exploração, produção e refino.' },
 { companyId: 'LREN3', ticker: 'LREN3', name: 'Lojas Renner', status: 'Atencao', logo: logoRenner, description: 'Varejo de moda com foco em omnichannel e escala nacional.' },
 { companyId: 'MRVE3', ticker: 'MRVE3', name: 'MRV Engenharia', status: 'Atencao', logo: logoMrv, description: 'Construtora focada no segmento residencial de média e baixa renda.' },
 { companyId: 'TAEE11', ticker: 'TAEE11', name: 'Transmissão Paulista', status: 'Saudavel', logo: logoTaesa, description: 'Empresa de transmissão de energia com receita regulada.' },
 { companyId: 'WEGE3', ticker: 'WEGE3', name: 'WEG', status: 'Atencao', logo: logoWeg, description: 'Empresa de equipamentos elétricos e automação industrial com presença global.' },
 { companyId: 'ITUB4', ticker: 'ITUB4', name: 'Itaú Unibanco', status: 'Saudavel', logo: logoItau, description: 'Banco universal com foco em crédito, serviços e seguros.' },
 { companyId: 'BBAS3', ticker: 'BBAS3', name: 'Banco do Brasil', status: 'Saudavel', initials: 'BB', description: 'Banco com forte exposição ao agronegócio e setor público.' },
];

const mainTabs: MainTab[] = ['Resumo', 'Pilares', 'Mudancas', 'Eventos', 'Preço', 'Fontes'];
const EMPTY_RADAR_SCORES: Record<PillarName, number> = { Divida: 0, Caixa: 0, Margens: 0, Retorno: 0, Proventos: 0 };

const pillars: PillarData[] = [
 {
 name: 'Divida',
 status: 'Atencao',
 score: 58,
 trend: '? 3 vs úúltimo trimestre',
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
 trend: '? 2 vs úúltimo trimestre',
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

const changes = [
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

const timelineEvents = [
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
 ],
 bulletChart: {
 conservativeMin: 37.5,
 conservativeMax: 41,
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
 },
 sensitivityDrivers: [
 { driver: 'Crescimento terminal', value: '3,0%', impact: 'Maior crescimento terminal eleva o valor estimado.' },
 { driver: 'WACC', value: '10,8%', impact: 'WACC mais alto reduz valor presente dos fluxos futuros.' },
 { driver: 'Margem operacional', value: '19,5%', impact: 'Margem sustentável mais alta amplia geração de caixa no cenário-base.' },
 { driver: 'Capex / reinvestimento', value: '5,2% da receita', impact: 'Maior reinvestimento reduz FCF no curto prazo e impacta o valuation.' },
 ],
 multiplesSummary: 'Múltiplos são bloco de apoio para comparação relativa e não substituem o cenário-base de valuation.',
 labels: ['12x', '14x', '16x', '18x', '20x', '22x'],
 values: [4, 6, 9, 7, 5, 2],
 currentMarker: 4,
 medianMarker: 2,
 rows: [
 { metric: 'P/L', current: '20,1x', sector: '17,8x', histórical: '16,4x', insight: 'Acima da mediana histórica.' },
 { metric: 'EV/EBITDA', current: '13,5x', sector: '12,1x', histórical: '11,8x', insight: 'Leve prêmio vs setor.' },
 { metric: 'P/VP', current: '4,2x', sector: '3,6x', histórical: '3,4x', insight: 'Mais caro que a média 5a.' },
 ],
};

const sourceRows = [
 { category: 'Financeiro', source: 'CVM', doc: 'DFP 2024', date: '04/02', status: 'Atualizado', link: 'https://www.gov.br/cvm' },
 { category: 'Eventos', source: 'B3', doc: 'Fato Relevante', date: '03/02', status: 'Atualizado', link: 'https://www.b3.com.br' },
 { category: 'Preço', source: 'B3', doc: 'Dados de mercado', date: '05/02', status: 'Atualizado', link: 'https://www.b3.com.br' },
 { category: 'RI', source: 'RI', doc: 'Comunicado', date: '05/02', status: 'Antigo', link: 'https://www.weg.net/ri' },
];

type CompanyData = {
 companyId: string;
 ticker: string;
 radarScores: Record<PillarName, number>;
 radarPreviousScores?: Record<PillarName, number>;
 diagnosisHeadline: string;
 strongest: { title: string; score: string; badge: string; trend: string; summary: string };
 watchout: { title: string; score: string; badge: string; trend: string; summary: string };
 monitor: { pillar: string; text: string };
 summaryScan: {
 motherLine: string;
 strength: { pillar: string; text: string };
 attention: { pillar: string; text: string };
 monitor: { pillar: string; text: string };
 };
 summaryText: string;
 summaryMeta: { updatedAt?: string; source?: string };
 pillars: Array<Contextual<PillarData>>;
 changes: Array<Contextual<(typeof changes)[number]> & { beforeAfter?: string }>;
 timelineEvents: Array<Contextual<(typeof timelineEvents)[number]>>;
 priceData: Contextual<typeof priceData> & {
 rows: Array<Contextual<(typeof priceData.rows)[number]>>;
 source?: string;
 updatedAt?: string;
 metricSeries?: Record<string, { labels: string[]; values: number[]; currentMarker: number; medianMarker: number }>;
 estimatedFairValue?: string;
 differenceVsCurrent?: string;
 valuationSummary?: string;
 valuationStateChip?: PriceValuationStateChip;
 valuationScenarios?: PriceValuationScenario[];
 bulletChart?: PriceBulletChart;
 sensitivityDrivers?: PriceSensitivityDriver[];
 multiplesSummary?: string;
 };
 sourceRows: Array<Contextual<(typeof sourceRows)[number]> & { displaySource?: string; displayDoc?: string; displayStatus?: string }>;
 sourceConfidence?: { title?: string; level?: string; summary?: string };
};

type TabPayload =
 | { status: 'ready'; companyId: string; data: CompanyData }
 | { status: 'empty'; companyId: string; ticker: string };

type CompanyPreferences = {
 activeTab: MainTab;
 changesWindow: FeedWindow;
 eventsWindow: FeedWindow;
 lastOpenPillar: 'Divida' | 'Caixa' | 'Margens' | 'Retorno' | 'Proventos' | null;
};

const RAW_API_BASE_URL = String(import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080').trim();
const API_BASE_URL = RAW_API_BASE_URL.replace(/\/$/, '');

function contextualize<T>(items: T[], companyId: string, ticker: string): Array<Contextual<T>> {
 return items.map((item) => ({ ...item, companyId, ticker }));
}

function companyContextFromTicker(tickerParam?: string): CompanyContext {
 const normalizedTicker = (tickerParam ?? 'WEGE3').toUpperCase();
 const company = queueItems.find((item) => item.ticker === normalizedTicker) ?? queueItems[4];
 return {
 companyId: company.companyId,
 ticker: company.ticker,
 name: company.name,
 };
}

function toDisplayText(value: unknown): string {
 if (typeof value === 'string') return value;
 if (typeof value === 'number' || typeof value === 'boolean') return String(value);
 if (value && typeof value === 'object') {
  return asDisplayValue(value);
 }
 return '';
}

function normalizeMojibake(text: string) {
 if (!/[\u00C2\u00C3]/.test(text)) return text;
 try {
  const bytes = Uint8Array.from(text, (char) => char.charCodeAt(0) & 0xFF);
  const decoded = new TextDecoder('utf-8').decode(bytes);
  return decoded && decoded !== text ? decoded : text;
 } catch {
  return text;
 }
}

function safeMeta(value?: unknown) {
 const text = toDisplayText(value).trim();
 if (!text || text.toLowerCase() === '[object object]') return '';
 return normalizeMojibake(text);
}

const changesFocusFilters: ChangesFocusFilter[] = ['Mais relevantes', 'Rotina', 'Estruturais'];
const eventsFocusFilters: EventsFocusFilter[] = ['Mais relevantes', 'Rotina', 'Principais'];
const changeLevelRank: Record<ChangePriorityLevel, number> = { Estrutural: 0, Relevante: 1, Rotina: 2 };
const pillarFilterOptions: Array<ChangePillarTag | 'Todos'> = ['Todos', 'Divida', 'Margens', 'Caixa', 'Retorno', 'Proventos', 'A classificar'];

function periodToDays(period: FeedWindow) {
 if (period === '30 dias') return 30;
 if (period === '60 dias') return 60;
 return 90;
}

function parseChangeDate(dateValue?: string) {
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

function normalizeChangePillar(impact?: string): ChangePillarTag {
 const raw = (impact ?? '').toLowerCase();
 if (!raw.trim()) return 'A classificar';
 if (raw.includes('dvida') || raw.includes('divida')) return 'Divida';
 if (raw.includes('caixa')) return 'Caixa';
 if (raw.includes('marg')) return 'Margens';
 if (raw.includes('retorno')) return 'Retorno';
 if (raw.includes('provent')) return 'Proventos';
 return 'A classificar';
}

function getChangeLevel(change: { type?: string; severity?: string; impact?: string }): ChangePriorityLevel {
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

 return severity.includes('leve') ? 'Relevante' : 'Relevante';
}

function getChangeDateSortValue(dateValue?: string) {
 const parsed = parseChangeDate(dateValue);
 return parsed ? parsed.getTime() : 0;
}

function buildInterpretationLine(change: { impact?: string; impactLine?: string; unchangedLine?: string; beforeAfter?: string; level: ChangePriorityLevel }) {
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

function buildWhyItMatters(change: { impact?: string; impactLine?: string; level: ChangePriorityLevel }) {
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

function getTimelineEventTypeLabel(title?: string) {
 const raw = (title ?? '').toLowerCase();
 if (raw.includes('resultado')) return 'Resultado';
 if (raw.includes('guidance')) return 'Guidance';
 if (raw.includes('teleconfer')) return 'Teleconferencia';
 if (raw.includes('dividend') || raw.includes('jcp') || raw.includes('provento')) return 'Proventos';
 if (raw.includes('assembleia') || raw.includes('societ')) return 'Societario';
 return 'Atualização';
}

function getTimelineQuarterLabel(title?: string) {
 const raw = title ?? '';
 const match = raw.match(/(\dT\d{2})/i);
 if (!match) return null;
 return match[1].toUpperCase();
}

function buildTimelineHeadlineLine(event: { title?: string; typeLabel: string; mainPillar: ChangePillarTag }, windowLabel: FeedWindow) {
 const quarter = getTimelineQuarterLabel(event.title);
 if (event.typeLabel === 'Resultado' && quarter) {
  return `Nos próximos ${windowLabel.replace(' dias', '')} dias, o principal gatilho esperado e o resultado do ${quarter}, com possível efeito em ${event.mainPillar}.`;
 }
 return `Nos próximos ${windowLabel.replace(' dias', '')} dias, o principal gatilho esperado e ${event.title?.toLowerCase() ?? 'um evento relevante'}, com possível efeito em ${event.mainPillar}.`;
}

function getTimelineEventLevel(event: { expectedImpact?: string; title?: string; pillars?: string[] }): ChangePriorityLevel {
 const impact = (event.expectedImpact ?? '').toLowerCase();
 const type = getTimelineEventTypeLabel(event.title).toLowerCase();
 const mainPillar = normalizeChangePillar(event.pillars?.[0]);
 if (impact.includes('alto')) return 'Estrutural';
 if (impact.includes('moderado')) return 'Relevante';
 if (type.includes('proventos') || type.includes('teleconferencia')) return 'Rotina';
 if (mainPillar === 'Proventos') return 'Rotina';
 return 'Relevante';
}

function buildTimelineInterpretationLine(event: { title?: string; typeLabel: string; level: ChangePriorityLevel; mainPillar: ChangePillarTag; pillars?: string[] }) {
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

function buildTimelineWhyItMatters(event: { why?: string; level: ChangePriorityLevel; mainPillar: ChangePillarTag; pillars?: string[] }) {
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

function timelineSourceUrl(source?: string) {
 const raw = (source ?? '').toLowerCase();
 if (raw.includes('cvm')) return 'https://www.gov.br/cvm';
 if (raw.includes('b3')) return 'https://www.b3.com.br';
 if (raw.includes('ri')) return 'https://ri.analiso.com.br';
 return 'https://www.analiso.com.br/fontes';
}

function resolvePillarName(value?: string | null): PillarName | null {
 const raw = (value ?? '').toLowerCase();
 if (!raw.trim()) return null;
 if (raw.includes('dvida') || raw.includes('divida') || raw.includes('debt')) return 'Divida';
 if (raw.includes('caixa') || raw.includes('cash')) return 'Caixa';
 if (raw.includes('marg') || raw.includes('margin')) return 'Margens';
 if (raw.includes('retorno') || raw.includes('return')) return 'Retorno';
 if (raw.includes('provent') || raw.includes('shareholder')) return 'Proventos';
 return null;
}

function normalizePillarName(value?: string): 'Divida' | 'Caixa' | 'Margens' | 'Retorno' | 'Proventos' {
 return resolvePillarName(value) ?? 'Proventos';
}

function normalizeEvidenceParam(value?: string | null) {
 if (!value) return null;
 return value.trim().toLowerCase();
}

function normalizeMojibakeText(value: string) {
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

function sanitizePayloadText<T>(value: T): T {
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

function normalizeStatusLabel(value?: string, fallback: Status = 'Atencao'): Status {
 const raw = (value ?? '').trim().toLowerCase();
 if (!raw) return fallback;
 if (raw.includes('ris')) return 'Risco';
 if (raw.includes('aten') || raw.includes('monitor')) return 'Atencao';
 if (raw.includes('saud') || raw.includes('fort')) return 'Saudavel';
 return fallback;
}

function normalizeRadarScores(
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

function normalizeMainTabParam(value?: string | null): MainTab | null {
 const raw = (value ?? '').trim().toLowerCase();
 if (raw === 'resumo') return 'Resumo';
 if (raw === 'pilares') return 'Pilares';
 if (raw === 'mudancas' || raw === 'mudanças' || raw === 'mudanas') return 'Mudancas';
 if (raw === 'eventos') return 'Eventos';
 if (raw === 'preco' || raw === 'preço') return 'Preço';
 if (raw === 'fontes') return 'Fontes';
 return null;
}

function getEvidenceAnchorId(pillarName: string, evidence: PillarEvidence, index: number) {
 const evidenceKey = (evidence.id ?? `${pillarName.toLowerCase()}-${index + 1}`).toLowerCase();
 return `evidence-${pillarName.toLowerCase()}-${evidenceKey}`;
}

function getDefaultPreferences(): CompanyPreferences {
 return {
 activeTab: 'Resumo',
 changesWindow: '90 dias',
 eventsWindow: '30 dias',
 lastOpenPillar: null,
 };
}

function loadPreferences(companyId: string): CompanyPreferences {
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

function savePreferences(companyId: string, preferences: CompanyPreferences) {
 try {
 window.localStorage.setItem(`company-analysis-preferences:${companyId}`, JSON.stringify(preferences));
 } catch {
 // ignore storage errors
 }
}

const mockDataByCompany: Record<string, CompanyData> = {
 WEGE3: {
 companyId: 'WEGE3',
 ticker: 'WEGE3',
 radarScores: EMPTY_RADAR_SCORES,
 radarPreviousScores: EMPTY_RADAR_SCORES,
 diagnosisHeadline: 'WEG segue forte em caixa e retorno, mas a divida exige acompanhamento neste trimestre.',
 strongest: {
 title: 'Caixa',
 score: '72/100',
 badge: 'Saudável',
 trend: '? +2 vs 12m',
 summary: 'Fluxo de caixa livre segue positivo e sustenta investimentos sem dvida adicional.',
 },
 watchout: {
 title: 'Dívida',
 score: '58/100',
 badge: 'Atenção',
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
 },
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
 badge: 'Saudável',
 trend: '? +1 vs 12m',
 summary: 'Distribuio permaneceu estvel e suportada por gerao de caixa.',
 },
 watchout: {
 title: 'Retorno',
 score: '62/100',
 badge: 'Atenção',
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
 title:
 index === 0
 ? 'Atualização de guidance e sensibilidade ao preço de minério.'
 : item.title,
 beforeAfter: index === 0 ? 'Antes: guidance neutro ? Depois: viés mais cauteloso' : undefined,
 })),
 'VALE3',
 'VALE3'
 ),
 timelineEvents: contextualize(
 timelineEvents.map((event, index) => ({
 ...event,
 title:
 index === 0
 ? 'VALE3 Resultado 4T25'
 : event.title.replace('WEGE3', 'VALE3'),
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
 },
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

function shortDateDisplay(value?: string | null) {
 if (!value) return '';
 const iso = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
 if (iso) return `${iso[3]}/${iso[2]}`;
 const br = value.match(/^(\d{2})\/(\d{2})\/\d{4}$/);
 if (br) return `${br[1]}/${br[2]}`;
 return value;
}

function asDisplayValue(value: unknown) {
 if (!value || typeof value !== 'object') return '';
 const raw = value as { display?: string; formatted?: string; raw?: string | number | null };
 if (typeof raw.display === 'string' && raw.display.length > 0) return raw.display;
 if (typeof raw.formatted === 'string' && raw.formatted.length > 0) return raw.formatted;
 if (typeof raw.raw === 'string') return raw.raw;
 if (typeof raw.raw === 'number') return String(raw.raw);
 return '';
}

function asTextValue(value: unknown) {
 if (typeof value === 'string') return value;
 if (typeof value === 'number') return String(value);
 const display = asDisplayValue(value);
 if (display) return display;
 return '';
}

function asNumericValue(value: unknown): number | null {
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

function mapFairValueStateTone(stateRaw: unknown) {
 const state = String(stateRaw ?? '').toLowerCase();
 if (state.includes('below')) return 'teal';
 if (state.includes('above')) return 'amber';
 if (state.includes('over')) return 'coral';
 return '';
}

function mapSensitivityImpactLabel(impactRaw: unknown) {
 const impact = String(impactRaw ?? '').toLowerCase();
 if (impact.includes('high')) return 'Impacto alto';
 if (impact.includes('medium')) return 'Impacto médio';
 if (impact.includes('low')) return 'Impacto baixo';
 return safeMeta(impactRaw);
}

function formatCurrencyBRL(value: number | null | undefined) {
 if (value == null || !Number.isFinite(value)) return '--';
 return value.toLocaleString('pt-BR', {
 style: 'currency',
 currency: 'BRL',
 minimumFractionDigits: 2,
 maximumFractionDigits: 2,
 });
}

function adaptV1Payload(raw: Record<string, unknown>, companyId: string, ticker: string): CompanyData | null {
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
 const pillars = pillarEntries
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
  ],
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
 const changes = changesItemsRaw.map((item) => {
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
 const timelineEvents = agendaEvents.map((item) => {
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
 const scenariosRaw = Array.isArray(fairValueAnalysis.scenarios)
 ? fairValueAnalysis.scenarios as Array<Record<string, unknown>>
 : [];
 const fairSensitivity = (fairValueAnalysis.sensitivity as Record<string, unknown> | undefined) ?? {};
 const sensitivityRaw = Array.isArray(fairSensitivity.drivers)
 ? fairSensitivity.drivers as Array<Record<string, unknown>>
 : [];
 const fairChart = (fairValueAnalysis.chart as Record<string, unknown> | undefined) ?? {};
 const fairRanges = (fairChart.ranges as Record<string, unknown> | undefined) ?? {};
 const fairConservativeRange = (fairRanges.conservative as Record<string, unknown> | undefined) ?? {};
 const fairBaseRange = (fairRanges.base as Record<string, unknown> | undefined) ?? {};
 const fairOptimisticRange = (fairRanges.optimistic as Record<string, unknown> | undefined) ?? {};
 const fairCurrentChart = (fairChart.currentPrice as Record<string, unknown> | undefined) ?? {};
 const bulletRaw = {
  conservative: fairConservativeRange,
  base: fairBaseRange,
  optimistic: fairOptimisticRange,
  current: fairCurrentChart,
  min: fairConservativeRange.min,
  max: fairOptimisticRange.max,
 };
 const conservativeRaw = (bulletRaw.conservative as Record<string, unknown> | undefined) ?? {};
 const baseRaw = (bulletRaw.base as Record<string, unknown> | undefined) ?? {};
 const optimisticRaw = (bulletRaw.optimistic as Record<string, unknown> | undefined) ?? {};
 const currentRaw = (bulletRaw.current as Record<string, unknown> | undefined) ?? {};
 const inferredMin = [
 asNumericValue(conservativeRaw.min),
 asNumericValue(conservativeRaw.max),
 asNumericValue(baseRaw.min),
 asNumericValue(baseRaw.max),
 asNumericValue(baseRaw.fairValue ?? baseRaw.value),
 asNumericValue(optimisticRaw.min),
 asNumericValue(optimisticRaw.max),
 asNumericValue(currentRaw.value),
 asNumericValue(fairCurrentCard.value),
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
 min: asNumericValue(bulletRaw.min) ?? (inferredMin.length > 0 ? Math.min(...inferredMin) : null),
 max: asNumericValue(bulletRaw.max) ?? (inferredMin.length > 0 ? Math.max(...inferredMin) : null),
 conservativeLabel: safeMeta(conservativeRaw.label) || 'Faixa conservadora',
 baseLabel: safeMeta(baseRaw.label) || 'Cenário-base',
 optimisticLabel: safeMeta(optimisticRaw.label) || 'Faixa otimista',
 currentLabel: safeMeta(currentRaw.label) || 'Preço atual',
 sourceNote: safeMeta(bulletRaw.sourceNote),
 };
 const valuationScenarios = scenariosRaw.map((scenario) => ({
 scenario: safeMeta(scenario.label),
 estimatedValue: asTextValue(scenario.displayEstimatedValue ?? scenario.estimatedValue),
 differenceVsCurrent: asTextValue(scenario.displayGapVsCurrent ?? scenario.gapVsCurrentPct),
 reading: asTextValue(scenario.reading),
 })).filter((scenario) => scenario.scenario || scenario.estimatedValue || scenario.differenceVsCurrent || scenario.reading);
 const sensitivityDrivers = sensitivityRaw.map((driver) => ({
 driver: safeMeta(driver.key),
 value: safeMeta(driver.label),
 impact: mapSensitivityImpactLabel(driver.impact),
 })).filter((driver) => driver.driver || driver.value || driver.impact);

 const sourceRowsRaw = Array.isArray(sources.rows) ? sources.rows as Array<Record<string, unknown>> : [];
 const sourceRows = sourceRowsRaw.map((row) => {
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
 pillars: pillars as CompanyData['pillars'],
 changes: changes as CompanyData['changes'],
 timelineEvents: timelineEvents as CompanyData['timelineEvents'],
 priceData: {
  companyId,
  ticker,
  current: asTextValue(
   fairCurrentCard.displayValue
   ?? fairCurrentChart.displayValue
  ),
  summary: String(fairValueAnalysis.summary ?? fairValueAnalysis.headline ?? ''),
  labels: [],
  values: [],
  currentMarker: 0,
  medianMarker: 0,
  rows: priceRows as CompanyData['priceData']['rows'],
  source: safeMeta(fairMeta.source),
  updatedAt: asTextValue(fairMeta.updatedAt),
  estimatedFairValue: asTextValue(
   fairValueCard.displayValue
   ?? fairBaseRange.displayFairValue
  ),
  differenceVsCurrent: asTextValue(
   fairGapCard.displayValue
  ),
  valuationSummary: asTextValue(
   fairValueAnalysis.whyItMatters
   ?? fairValueAnalysis.meaning
  ),
  valuationStateChip: {
   label: safeMeta(valuationState.label),
   tone: safeMeta(valuationState.tone),
  },
  valuationScenarios,
  bulletChart,
  sensitivityDrivers,
  multiplesSummary: asTextValue(
   fairSensitivity.summary
   ?? fairValueAnalysis.takeaway
   ?? fairValueAnalysis.summary
  ),
  metricSeries: Object.fromEntries(Object.entries(distribution).map(([metric, dist]) => {
   const labels = Array.isArray(dist.labels) ? dist.labels as string[] : [];
   const values = Array.isArray(dist.values) ? dist.values as number[] : [];
   const currentMarker = Number(dist.currentMarker ?? 0);
   const medianMarker = Number(dist.medianMarker ?? 0);
   return [metric, { labels, values, currentMarker, medianMarker }];
  })) as CompanyData['priceData']['metricSeries'],
 },
 sourceRows: sourceRows as CompanyData['sourceRows'],
 sourceConfidence: {
  title: String(confidenceSummary.title ?? ''),
  level: String(confidenceLevel.display ?? confidenceLevel.key ?? ''),
  summary: String(confidenceSummary.summary ?? ''),
 },
 changesSummaryByWindow,
 changesSummary: changesSummaryByWindow?.['90'],
 };
}

function normalizeLegacyCompanyData(raw: unknown, companyId: string, ticker: string): CompanyData | null {
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

function normalizeCompanyData(raw: unknown, companyId: string, ticker: string): CompanyData | null {
 if (!raw || typeof raw !== 'object') return null;
 const payload = sanitizePayloadText(raw as Record<string, unknown>);
 if (String(payload.version ?? '') === '1.0' && payload.overview && payload.radar && payload.pillars) {
 return adaptV1Payload(payload, companyId, ticker);
 }
 return normalizeLegacyCompanyData(payload, companyId, ticker);
}

async function fetchCompanyData(companyId: string, ticker: string): Promise<CompanyData | null> {
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

const statusTone = {
 Risco: { dot: 'bg-[#DC2626]', badge: 'border-[#FECACA] bg-[#FEF2F2] text-[#DC2626]' },
 Atencao: { dot: 'bg-[#D97706]', badge: 'border-[#FDE68A] bg-[#FFFBEB] text-[#D97706]' },
 Saudavel: { dot: 'bg-[#0E9384]', badge: 'border-[#99F6E4] bg-[#F0FDFA] text-[#0E9384]' },
} as const;

const pillarOrder: PillarName[] = ['Divida', 'Caixa', 'Margens', 'Retorno', 'Proventos'];

function pillarLabel(pillar: PillarName) {
 return pillar === 'Divida' ? 'Dívida' : pillar;
}

function statusLabel(status: Status) {
 if (status === 'Atencao') return 'Atenção';
 if (status === 'Saudavel') return 'Saudável';
 return status;
}

type PillarMapStatus = 'risco' | 'atencao' | 'saudavel';

type PillarMapDatum = {
 pillar: PillarName;
 pillarLabel: string;
 score: number;
 status: PillarMapStatus;
 delta?: number;
 reason?: string;
};

const pillarMapStatusTone: Record<PillarMapStatus, { stroke: string; fill: string; label: string; chip: string }> = {
 risco: {
 stroke: '#D9735E',
 fill: '#D9735E',
 label: 'Risco',
 chip: 'border-[#F7C9C0] bg-[#FFF5F3] text-[#B54935]',
 },
 atencao: {
 stroke: '#C78D21',
 fill: '#C78D21',
 label: 'Atenção',
 chip: 'border-[#F6DEA9] bg-[#FFF9ED] text-[#9A6A0F]',
 },
 saudavel: {
 stroke: '#168E7D',
 fill: '#168E7D',
 label: 'Saudável',
 chip: 'border-[#AEE3D8] bg-[#F1FCF9] text-[#0F6F61]',
 },
};

function pillarDisplayLabel(pillar: PillarName) {
 return pillar === 'Divida' ? 'Dívida' : pillar;
}

function mapStatusFromCompanyStatus(status: Status): PillarMapStatus {
 if (status === 'Risco') return 'risco';
 if (status === 'Atencao') return 'atencao';
 return 'saudavel';
}

function parseTrendDelta(trend?: string) {
 if (!trend) return undefined;
 const normalized = trend.replace(',', '.');
 const explicitMatch = normalized.match(/([+-]\s*\d+(?:\.\d+)?)/);
 if (explicitMatch) {
 const value = Number.parseFloat(explicitMatch[1].replace(/\s+/g, ''));
 return Number.isFinite(value) ? value : undefined;
 }
 const directionalMatch = normalized.match(/([??])\s*(\d+(?:\.\d+)?)/);
 if (!directionalMatch) return undefined;
 const magnitude = Number.parseFloat(directionalMatch[2]);
 if (!Number.isFinite(magnitude)) return undefined;
 return directionalMatch[1] === '?' ? magnitude : -magnitude;
}

function cx(...classes: Array<string | false | null | undefined>) {
 return classes.filter(Boolean).join(' ');
}

function hexToRgba(hex: string, alpha: number) {
 const normalized = hex.replace('#', '');
 const fullHex = normalized.length === 3
 ? normalized.split('').map((char) => `${char}${char}`).join('')
 : normalized;
 if (!/^[0-9a-fA-F]{6}$/.test(fullHex)) return hex;
 const r = Number.parseInt(fullHex.slice(0, 2), 16);
 const g = Number.parseInt(fullHex.slice(2, 4), 16);
 const b = Number.parseInt(fullHex.slice(4, 6), 16);
 return `rgba(${r},${g},${b},${alpha})`;
}

function QueueLogo({ company }: { company: CompanyQueueItem }) {
 if (company.logo) {
 return <img src={company.logo} alt={company.ticker} className="h-9 w-9 rounded-lg border border-[#E5E7EB] object-cover" />;
 }
 return (
 <div className="grid h-9 w-9 place-items-center rounded-lg bg-[#0E9384] text-xs font-semibold text-white">
 {company.initials}
 </div>
 );
}

function PillarMapTooltip({ datum }: { datum: PillarMapDatum }) {
 const tone = pillarMapStatusTone[datum.status];
 const hasDelta = typeof datum.delta === 'number' && Number.isFinite(datum.delta);
 const deltaArrow = hasDelta ? (datum.delta! > 0 ? '?' : datum.delta! < 0 ? '?' : '?') : null;
 const deltaText = hasDelta ? `${deltaArrow} ${Math.abs(datum.delta!)} vs trimestre anterior` : null;

 return (
 <div className="max-w-[240px] rounded-xl border border-[#E5E7EB] bg-white p-3.5 shadow-[0_10px_22px_-18px_rgba(2,6,23,0.7)]">
 <p className="text-[13px] font-semibold text-[#111827]">{datum.pillarLabel}</p>
 <p className="mt-1 text-[15px] font-semibold" style={{ color: '#1F2937' }}>{datum.score}/100 {tone.label}</p>
 {deltaText && <p className="mt-1 text-[12px] text-[#4B5563]">{deltaText}</p>}
 {datum.reason && <p className="mt-1 text-[12px] text-[#6B7280]">{datum.reason}</p>}
 </div>
 );
}

function PillarMap({
 data,
 companyStatus,
 onSelectPillar,
}: {
 data: PillarMapDatum[];
 companyStatus: Status;
 onSelectPillar?: (pillar: PillarName) => void;
}) {
 const tone = pillarMapStatusTone[mapStatusFromCompanyStatus(companyStatus)];
 const [activePillar, setActivePillar] = useState<PillarName | null>(null);
 const [tooltipAnchor, setTooltipAnchor] = useState<{ x: number; y: number } | null>(null);
 const [tooltipDatum, setTooltipDatum] = useState<PillarMapDatum | null>(null);
 const chartShellRef = useRef<HTMLDivElement | null>(null);
 const [chartSize, setChartSize] = useState({ width: 0, height: 0 });
 const dotCoordsRef = useRef<Partial<Record<PillarName, { x: number; y: number }>>>({});
 const activeIndex = activePillar ? data.findIndex((entry) => entry.pillar === activePillar) : -1;
 const hasActivePillar = activeIndex >= 0;

 useEffect(() => {
 const element = chartShellRef.current;
 if (!element) return;
 const syncSize = () => setChartSize({ width: element.clientWidth, height: element.clientHeight });
 syncSize();
 const observer = new ResizeObserver(syncSize);
 observer.observe(element);
 return () => observer.disconnect();
 }, []);

 const focusPillar = (pillar: PillarName, anchor?: { x: number; y: number } | null) => {
 const datum = data.find((entry) => entry.pillar === pillar) ?? null;
 setActivePillar(pillar);
 setTooltipDatum(datum);
 setTooltipAnchor(anchor ?? dotCoordsRef.current[pillar] ?? null);
 };

 const clearPillarFocus = () => {
 setActivePillar(null);
 setTooltipDatum(null);
 setTooltipAnchor(null);
 };

 const centerX = chartSize.width / 2;
 const centerY = chartSize.height / 2;
 const outerRadius = Math.min(chartSize.width, chartSize.height) * 0.36;
 const sectorRadius = outerRadius * 1.02;
 const sectorBoundary = 360 / Math.max(data.length, 1);
 const polarToCartesian = (angleDeg: number, radius: number) => {
 const angleRad = (angleDeg * Math.PI) / 180;
 return {
 x: centerX + Math.cos(angleRad) * radius,
 y: centerY + Math.sin(angleRad) * radius,
 };
 };

 const sectorPath = (index: number) => {
 const axisAngle = -90 + index * sectorBoundary;
 const startAngle = axisAngle - sectorBoundary / 2;
 const endAngle = axisAngle + sectorBoundary / 2;
 const start = polarToCartesian(startAngle, sectorRadius);
 const end = polarToCartesian(endAngle, sectorRadius);
 return `M ${centerX} ${centerY} L ${start.x} ${start.y} A ${sectorRadius} ${sectorRadius} 0 0 1 ${end.x} ${end.y} Z`;
 };
 return (
 <div>
 <div className="text-center">
 <h3 className="text-[15px] font-semibold tracking-[-0.01em] text-[#111827]">Mapa dos 5 pilares</h3>
 <p className="mt-1 text-[12px] text-[#667085]">Uma leitura rapida da saude estrutural da empresa.</p>
 </div>
 <div ref={chartShellRef} className="relative isolate mt-2 h-[245px] sm:h-[285px]">
 <div className="absolute inset-0 z-[15]">
 <ResponsiveContainer width="100%" height="100%">
 <RechartsRadarChart
 data={data}
 outerRadius="72%"
 >
 <PolarGrid gridType="polygon" radialLines={false} polarRadius={[20, 40]} stroke="#DCE2EA" strokeOpacity={0.22} />
 <PolarGrid gridType="polygon" radialLines={false} polarRadius={[60, 80]} stroke="#D6DEE8" strokeOpacity={0.38} />
 <PolarGrid gridType="polygon" radialLines={false} polarRadius={[100]} stroke="#CED8E4" strokeOpacity={0.6} />
 <PolarGrid gridType="polygon" polarRadius={[100]} stroke="#D3DBE5" strokeOpacity={0.38} />
 <PolarAngleAxis
 dataKey="pillarLabel"
 tick={({ payload, x, y, textAnchor }: any) => {
 const pillar = data.find((entry) => entry.pillarLabel === payload?.value)?.pillar;
 const isActive = pillar && pillar === activePillar;
 return (
 <text
 x={x}
 y={y}
 textAnchor={textAnchor}
 fill={isActive ? '#0F172A' : '#667085'}
 fontSize={13}
 fontWeight={isActive ? 700 : 600}
 className={pillar ? 'cursor-pointer' : undefined}
 onClick={() => {
 if (!pillar) return;
 setActivePillar(pillar);
 onSelectPillar?.(pillar);
 }}
 >
 {String(payload?.value ?? '').toUpperCase()}
 </text>
 );
 }}
 />
 <PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} />
 <Radar
 dataKey="score"
 stroke={tone.stroke}
 fill="none"
 strokeWidth={5}
 strokeOpacity={hasActivePillar ? 0.2 : 0.26}
 isAnimationActive
 animationDuration={380}
 animationEasing="ease-out"
 />
 <Radar
 dataKey="score"
 stroke={tone.stroke}
 fill={tone.fill}
 strokeWidth={activePillar ? 3.6 : 3.2}
 fillOpacity={hasActivePillar ? 0.72 : 0.66}
 isAnimationActive
 animationDuration={360}
 animationEasing="ease-out"
 dot={(dotProps: any) => {
 const pillar = dotProps?.payload?.pillar as PillarName | undefined;
 if (!pillar) return null;
 const isActiveDot = pillar === activePillar;
 if (typeof dotProps.cx === 'number' && typeof dotProps.cy === 'number') {
 dotCoordsRef.current[pillar] = { x: dotProps.cx, y: dotProps.cy };
 }
 return (
 <circle
 cx={dotProps.cx}
 cy={dotProps.cy}
 r={isActiveDot ? 5.6 : 4.2}
 fill={tone.stroke}
 stroke={tone.stroke}
 strokeWidth={isActiveDot ? 2.6 : 1.8}
 style={{ transition: 'all 180ms ease-out', opacity: hasActivePillar && !isActiveDot ? 0.45 : 1 }}
 onMouseEnter={() => {
 focusPillar(pillar);
 if (typeof dotProps.cx === 'number' && typeof dotProps.cy === 'number') {
 setTooltipAnchor({ x: dotProps.cx, y: dotProps.cy });
 }
 }}
 onMouseLeave={clearPillarFocus}
 />
 );
 }}
 onClick={(state: unknown) => {
 const payloadData = state && typeof state === 'object' && 'payload' in state ? state.payload : null;
 const pillar = payloadData && typeof payloadData === 'object' && 'pillar' in payloadData ? (payloadData.pillar as PillarName) : null;
 if (pillar) {
 setActivePillar(pillar);
 onSelectPillar?.(pillar);
 }
 }}
 />
 </RechartsRadarChart>
 </ResponsiveContainer>
 </div>
 {chartSize.width > 0 && chartSize.height > 0 && (
 <svg
 className="absolute inset-0 z-20"
 viewBox={`0 0 ${chartSize.width} ${chartSize.height}`}
 onMouseLeave={clearPillarFocus}
 >
 {data.map((entry, index) => {
 const isActiveSector = activePillar === entry.pillar;
 const axisAngle = -90 + index * sectorBoundary;
 const anchor = polarToCartesian(axisAngle, outerRadius * 0.82);
 return (
 <path
 key={`sector-${entry.pillar}`}
 d={sectorPath(index)}
 fill={
 hasActivePillar
 ? (isActiveSector ? hexToRgba(tone.stroke, 0.24) : 'rgba(0,0,0,0.28)')
 : 'rgba(0,0,0,0)'
 }
 stroke={isActiveSector ? hexToRgba(tone.stroke, 0.45) : 'rgba(0,0,0,0)'}
 strokeWidth={isActiveSector ? 1.4 : 1}
 style={{ transition: 'fill 180ms ease-out, stroke 180ms ease-out' }}
 onMouseEnter={() => focusPillar(entry.pillar, anchor)}
 onClick={() => onSelectPillar?.(entry.pillar)}
 />
 );
 })}
 </svg>
 )}
 {tooltipDatum && tooltipAnchor && (
 <div
 className="pointer-events-none absolute z-30"
 style={{
 left: tooltipAnchor.x,
 top: tooltipAnchor.y,
 transform: 'translate(12px, -50%)',
 }}
 >
 <PillarMapTooltip datum={tooltipDatum} />
 </div>
 )}
 </div>
 <div className="mt-1.5 flex flex-wrap justify-center gap-2">
 {data.map((entry) => (
 <button
 key={entry.pillar}
 onClick={() => onSelectPillar?.(entry.pillar)}
 onMouseEnter={() => focusPillar(entry.pillar)}
 onMouseLeave={clearPillarFocus}
 className={cx(
 'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold transition-all duration-200',
 pillarMapStatusTone[entry.status].chip,
 activePillar === entry.pillar ? 'scale-[1.03] shadow-[0_8px_16px_-14px_rgba(2,6,23,0.9)] ring-1 ring-[#D1D5DB]' : ''
 )}
 aria-pressed={activePillar === entry.pillar}
 >
 <span className={cx('h-1.5 w-1.5 rounded-full transition-all duration-200', activePillar === entry.pillar ? 'scale-125' : '')} style={{ backgroundColor: pillarMapStatusTone[entry.status].stroke }} />
 {entry.pillarLabel} {entry.score}
 </button>
 ))}
 </div>
 {activeIndex >= 0 && (
 <p className="mt-2 text-center text-[11px] text-[#667085]">
 Foco atual: <span className="font-semibold text-[#344054]">{data[activeIndex].pillarLabel}</span> ({data[activeIndex].score}/100)
 </p>
 )}
 </div>
 );
}

function MiniLineChart({
 values,
 labels,
 tone,
 highlightIndex,
 variant = 'line',
 referenceValue,
 referenceLabel,
}: {
 values: number[];
 labels: string[];
 tone: 'teal' | 'amber';
 highlightIndex?: number;
 variant?: 'line' | 'bar';
 referenceValue?: number;
 referenceLabel?: string;
}) {
 const width = 620;
 const height = 54;
 const padding = 10;
 const min = Math.min(...values);
 const max = Math.max(...values);
 const span = max - min || 1;

 const points = values
 .map((value, index) => {
 const x = padding + (index * (width - padding * 2)) / Math.max(values.length - 1, 1);
 const y = height - padding - ((value - min) / span) * (height - padding * 2);
 return `${x},${y}`;
 })
 .join(' ');

 const markerX =
 variant === 'line' &&
 highlightIndex !== undefined
 ? padding + (Math.max(Math.min(highlightIndex, Math.max(values.length - 1, 0)), 0) * (width - padding * 2)) / Math.max(values.length - 1, 1)
 : null;
 const markerY =
 variant === 'line' &&
 highlightIndex !== undefined && values[highlightIndex] !== undefined
 ? height - padding - ((values[highlightIndex] - min) / span) * (height - padding * 2)
 : null;
 const hasReference = variant === 'line' && typeof referenceValue === 'number' && Number.isFinite(referenceValue);
 const refY = hasReference ? height - padding - (((referenceValue as number) - min) / span) * (height - padding * 2) : null;
 const safeRefY = refY === null ? null : Math.max(padding, Math.min(height - padding, refY));
 const latestValue = values[Math.max(values.length - 1, 0)];
 const isAboveReference = hasReference && typeof latestValue === 'number' ? latestValue >= (referenceValue as number) : null;

 return (
 <div className="space-y-1.5">
 <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
 <line x1="0" y1="42" x2={width} y2="42" stroke="#D1D5DB" strokeWidth="1" strokeDasharray="4 4" />
 {safeRefY !== null && (
 <>
 <line x1={padding} y1={safeRefY} x2={width - padding} y2={safeRefY} stroke="#64748B" strokeWidth="1.4" strokeDasharray="2 2" />
 {referenceLabel && (
 <text x={width - padding} y={Math.max(safeRefY - 3, 9)} textAnchor="end" fill="#475569" fontSize="10" fontWeight={600}>
 {referenceLabel}
 </text>
 )}
 </>
 )}
 {variant === 'bar' ? (
 values.map((value, index) => {
 const barWidth = (width - padding * 2) / Math.max(values.length, 1) - 6;
 const x = padding + index * ((width - padding * 2) / Math.max(values.length, 1)) + 3;
 const y = height - padding - ((value - min) / span) * (height - padding * 2);
 const barHeight = Math.max(height - padding - y, 2);
 return (
 <rect
 key={`bar-${labels[index] ?? index}`}
 x={x}
 y={y}
 width={Math.max(barWidth, 2)}
 height={barHeight}
 rx={3}
 fill={tone === 'teal' ? '#99F6E4' : '#FDE68A'}
 />
 );
 })
 ) : (
 <polyline points={points} fill="none" stroke={tone === 'teal' ? '#0E9384' : '#D97706'} strokeWidth="2.2" strokeLinejoin="round" strokeLinecap="round" />
 )}
 {markerX !== null && markerY !== null && (
 <>
 <circle cx={markerX} cy={markerY} r="4.5" fill="#0E9384" stroke="white" strokeWidth="1.5" />
 <text x={Math.min(markerX + 8, width - 24)} y={Math.max(markerY - 7, 10)} fill="#0F766E" fontSize="9" fontWeight={600}>
 Hoje
 </text>
 </>
 )}
 </svg>
 {isAboveReference !== null && (
 <p className={cx('text-[10px]', isAboveReference ? 'text-[#0F766E]' : 'text-[#9A3412]')}>
 {isAboveReference ? 'Acima da refer\u00EAncia hist\u00F3rica' : 'Abaixo da refer\u00EAncia hist\u00F3rica, sob press\u00E3o'}
 </p>
 )}
 <div className="flex items-center justify-between text-[10px] text-[#9CA3AF]">
 {labels.map((label) => (
 <span key={label}>{label}</span>
 ))}
 </div>
 </div>
 );
}

function toNumeric(value: string) {
 const lower = value.toLowerCase();
 let multiplier = 1;
 if (/\bbi\b/.test(lower)) {
  multiplier = 1_000_000_000;
 } else if (/\bmi\b/.test(lower)) {
  multiplier = 1_000_000;
 } else if (/\bmil\b/.test(lower)) {
  multiplier = 1_000;
 }

 const raw = value.replace(/[^\d,.-]/g, '');
 if (!raw) return null;
 const lastComma = raw.lastIndexOf(',');
 const lastDot = raw.lastIndexOf('.');
 let normalized = raw;
 if (lastComma >= 0 && lastDot >= 0) {
 const decimalSep = lastComma > lastDot ? ',' : '.';
 const thousandSep = decimalSep === ',' ? '.' : ',';
 normalized = raw.split(thousandSep).join('');
 normalized = normalized.replace(decimalSep, '.');
 } else if (lastComma >= 0) {
 normalized = raw.replace(/\./g, '').replace(',', '.');
 } else {
 normalized = raw.replace(/,/g, '');
 }
 const parsed = Number.parseFloat(normalized);
 return Number.isFinite(parsed) ? parsed * multiplier : null;
}

function formatNumberBr(value: number, decimals = 2) {
 return new Intl.NumberFormat('pt-BR', {
 minimumFractionDigits: decimals,
 maximumFractionDigits: decimals,
 }).format(value);
}

function trimTrailingZerosBr(value: string) {
 return value.replace(/,?0+$/, '');
}

function formatCompactCurrencyBr(value: number) {
 const abs = Math.abs(value);
 if (abs >= 1_000_000_000) {
 const scaled = formatNumberBr(value / 1_000_000_000, 2);
 return `R$ ${scaled} bi`;
 }
 if (abs >= 1_000_000) {
 const scaled = formatNumberBr(value / 1_000_000, 2);
 return `R$ ${scaled} mi`;
 }
 if (abs >= 1_000) {
 const scaled = formatNumberBr(value / 1_000, 2);
 return `R$ ${scaled} mil`;
 }
 return `R$ ${formatNumberBr(value, 2)}`;
}

function isCurrencyMetricLabel(label: string) {
 const normalized = label
 .toLowerCase()
 .normalize('NFD')
 .replace(/[\u0300-\u036f]/g, '');
 return (
 normalized.includes('divida') ||
 normalized.includes('caixa') ||
 normalized.includes('receita') ||
 normalized.includes('lucro') ||
 normalized.includes('ebitda') ||
 normalized.includes('ebit') ||
 normalized.includes('fcf') ||
 normalized.includes('proventos') ||
 normalized.includes('capital')
 );
}

function formatMetricValue(value: string, label?: string) {
 const numeric = toNumeric(value);
 if (numeric === null) return value;
 const hasPercent = value.includes('%');
 const hasMultiple = /x/i.test(value);
 const hasCurrency = value.includes('R$') || (label ? isCurrencyMetricLabel(label) : false);
 const formatted = formatNumberBr(numeric, 2);
 if (hasCurrency) return formatCompactCurrencyBr(numeric);
 if (hasPercent) return `${formatted}%`;
 if (hasMultiple) return `${formatted}x`;
 return formatted;
}

function baseIndicatorLabel(pillar: PillarData, metric?: PillarMetric, value?: number | null) {
 return metric?.label ?? pillar.chart.title.replace('Evidencia: ', '');
}

function verdictSummary(pillar: PillarData, todayText: string, referenceText: string) {
 if (pillar.summary && pillar.summary.trim().length > 0) return pillar.summary;
 return `${todayText} frente à referência histórica de ${referenceText}.`;
}

function _normalizeSemanticText(value?: string) {
 return safeMeta(value)
 .toLowerCase()
 .normalize('NFD')
 .replace(/[\u0300-\u036f]/g, '')
 .replace(/[^\w\s]/g, ' ')
 .replace(/\s+/g, ' ')
 .trim();
}

function meaningCopy(pillar: PillarData, fallbackConsequence?: string) {
 const meaning = safeMeta(pillar.meaningText);
 const summary = safeMeta(pillar.summary);
 if (meaning) return meaning;
 if (summary) return summary;
 const fallback = safeMeta(fallbackConsequence);
 if (fallback) return fallback;
 return '';
}

function monitorItemsFromPillar(pillar: PillarData) {
 if (pillar.watchItems && pillar.watchItems.length > 0) {
  return pillar.watchItems.map((item) => item.title).filter((item) => item && item.trim().length > 0);
 }
 return pillar.evidences
 .filter((item) => String(item.label).toLowerCase().includes('aten') || String(item.intensity).toLowerCase().includes('high') || String(item.intensity).toLowerCase().includes('moder'))
 .map((item) => item.title)
 .filter((item) => item && item.trim().length > 0)
 .slice(0, 3);
}

function metricValueLabel(metric: string, value: string, pillarName?: PillarName) {
 const normalizedMetric = metric.trim().toLowerCase();
 if (!normalizedMetric || !value.trim()) return `${metric}: ${value}`;
 if (normalizedMetric === 'roe' || (pillarName === 'Retorno' && normalizedMetric.includes('roe'))) {
  return `${metric} de ${value}`;
 }
 return `${metric}: ${value}`;
}

function signalCardCopy(pillar: PillarData, indicatorLabel: string, fallbackWhy: string) {
 const signal = pillar.primarySignal;
 const title = signal?.title?.trim() || indicatorLabel;
 const body = signal?.value?.trim() && signal?.metric?.trim()
 ? metricValueLabel(signal.metric, signal.value, pillar.name)
 : signal?.value?.trim() || pillar.summary || '';
 const why = signal?.why?.trim() || fallbackWhy || pillar.summary || '';
 const badgeLabel = safeMeta(signal?.label);
 const badgeRaw = badgeLabel.toLowerCase();
 const intensityRaw = safeMeta(signal?.intensity).toLowerCase();
 const isRisk = intensityRaw.includes('critical') || intensityRaw.includes('alto') || badgeRaw.includes('ris');
 const isAttention = !isRisk && (
 intensityRaw.includes('high') ||
 intensityRaw.includes('medium') ||
 intensityRaw.includes('moder') ||
 badgeRaw.includes('aten') ||
 badgeRaw.includes('press')
 );
 const fallbackTone = pillar.status === 'Risco' ? 'risk' : pillar.status === 'Atencao' ? 'attention' : 'positive';
 const badgeTone = isRisk ? 'risk' as const : isAttention ? 'attention' as const : (badgeLabel ? 'positive' as const : fallbackTone);
 return {
 title,
 body,
 why,
 badgeLabel: badgeLabel || '',
 badgeTone,
 };
}

function evidenceSourceText(evidence: PillarEvidence | undefined, pillar: PillarData) {
 const doc = safeMeta(evidence?.source?.docLabel);
 const date = safeMeta(evidence?.source?.date);
 if (doc && date) return `${doc} · ${date}`;
 if (doc) return doc;
 const trustSource = safeMeta(pillar.trust.source);
 const trustDate = safeMeta(pillar.trust.updatedAt);
 if (trustSource && trustDate) return `${trustSource} · ${trustDate}`;
 return trustSource || trustDate || 'dado não informado';
}
function ctaCopyByPillar(pillar: PillarData) {
 const rawPillar = pillar as unknown as Record<string, unknown>;
 const ctaRaw = rawPillar.cta;
 const ctaObj = (ctaRaw && typeof ctaRaw === 'object') ? (ctaRaw as Record<string, unknown>) : {};
 const ctaPrimaryObj = (ctaObj.primary && typeof ctaObj.primary === 'object') ? (ctaObj.primary as Record<string, unknown>) : {};
 return {
 title: safeMeta(pillar.cta?.title) || safeMeta(ctaObj.subtitle) || safeMeta(ctaObj.title) || safeMeta(rawPillar.ctaTitle) || safeMeta(rawPillar.cta_title),
 button: safeMeta(pillar.cta?.button) || safeMeta(ctaPrimaryObj.label) || safeMeta(ctaObj.button) || safeMeta(ctaObj.text) || safeMeta(rawPillar.ctaText) || safeMeta(rawPillar.cta_text) || (typeof ctaRaw === 'string' ? safeMeta(ctaRaw) : ''),
 };
}

function debtPrimaryNarrative(value: number | null, template: string, label?: string) {
 if (value === null || !Number.isFinite(value)) return '';
 const hasCurrency = template.includes('R$') || (label ? isCurrencyMetricLabel(label) : false);
 if (hasCurrency) return formatCompactCurrencyBr(value);
 return formatComparableValue(value, template, label);
}

function formatDeltaForPillar(trend?: string) {
 const delta = parseTrendDelta(trend);
 if (typeof delta !== 'number' || !Number.isFinite(delta) || delta === 0) return 'Estável vs. período anterior';
 const sign = delta > 0 ? '+' : '-';
 return `${sign}${Math.abs(delta).toFixed(1).replace('.', ',')} vs. período anterior`;
}

function baseMetricReadingHint(pillar: PillarData, metric?: PillarMetric) {
 return safeMeta(pillar.explainer?.text);
}

function formatComparableValue(value: number | null, template: string, label?: string) {
 if (value === null || !Number.isFinite(value)) return '-';
 const hasPercent = template.includes('%');
 const hasMultiple = /x/i.test(template);
 const hasCurrency = template.includes('R$') || (label ? isCurrencyMetricLabel(label) : false);
 if (hasCurrency) return formatCompactCurrencyBr(value);
 if (hasPercent) return `${formatNumberBr(value, 1)}%`;
 if (hasMultiple) return `${formatNumberBr(value, 2)}x`;
 return formatNumberBr(value, 2);
}

function median(values: number[]) {
 if (values.length === 0) return 0;
 const sorted = [...values].sort((a, b) => a - b);
 const middle = Math.floor(sorted.length / 2);
 if (sorted.length % 2 === 0) return (sorted[middle - 1] + sorted[middle]) / 2;
 return sorted[middle];
}

function SkeletonBlock({ className }: { className: string }) {
 return <div className={cx('rounded-md bg-[#F3F4F6] skeleton-shimmer', className)} />;
}

export function CompanyAnalysis() {
 const navigate = useNavigate();
 const { ticker } = useParams();
 const [searchParams] = useSearchParams();

 const [queueFilter, setQueueFilter] = useState<QueueFilter>('Todas');
 const [activeTab, setActiveTab] = useState<MainTab>('Resumo');
 const [contentVisible, setContentVisible] = useState(true);
 const [companyContext, setCompanyContext] = useState<CompanyContext>(() => companyContextFromTicker(ticker));
 const [loadingCompany, setLoadingCompany] = useState(true);
 const [loadingTab, setLoadingTab] = useState(true);
 const [tabCache, setTabCache] = useState<Record<string, TabPayload>>({});
 const [actionError, setActionError] = useState<string | null>(null);
 const [watchlistCollapsed, setWatchlistCollapsed] = useState(true);
 const [showScoreInfo, setShowScoreInfo] = useState(false);
 const [showHeaderUpdateDetails, setShowHeaderUpdateDetails] = useState(false);
 const [showHeaderMenu, setShowHeaderMenu] = useState(false);
 const [changesWindow, setChangesWindow] = useState<FeedWindow>('90 dias');
 const [changesFocus, setChangesFocus] = useState<ChangesFocusFilter>('Mais relevantes');
 const [changesPillarFilter, setChangesPillarFilter] = useState<ChangePillarTag | 'Todos'>('Todos');
 const [expandedRoutineGroups, setExpandedRoutineGroups] = useState<Record<string, boolean>>({});
 const [eventsWindow, setEventsWindow] = useState<FeedWindow>('30 dias');
 const [eventsFocus, setEventsFocus] = useState<EventsFocusFilter>('Mais relevantes');
 const [eventsPillarFilter, setEventsPillarFilter] = useState<ChangePillarTag | 'Todos'>('Todos');
 const [expandedEventRoutineGroups, setExpandedEventRoutineGroups] = useState<Record<string, boolean>>({});
 const [showValuationMethodologyDrawer, setShowValuationMethodologyDrawer] = useState(false);
 const [evidenceModal, setEvidenceModal] = useState<{
 pillarName: string;
 evidence: PillarEvidence;
 } | null>(null);
 const [evidenceTab, setEvidenceTab] = useState<EvidenceTab>('Fonte');
 const [highlightedEvidenceId, setHighlightedEvidenceId] = useState<string | null>(null);
 const lastAppliedDeepLinkRef = useRef<string>("");
 const [expandedPillars, setExpandedPillars] = useState<Record<string, boolean>>({
 Divida: false,
 Caixa: false,
 Margens: false,
 Retorno: false,
 Proventos: false,
 });
 const [windowByPillar, setWindowByPillar] = useState<Record<string, WindowSize>>({
 Divida: '5a',
 Caixa: '5a',
 Margens: '5a',
 Retorno: '5a',
 Proventos: '5a',
 });

 useEffect(() => {
 setContentVisible(false);
 const timer = window.setTimeout(() => setContentVisible(true), 150);
 return () => window.clearTimeout(timer);
 }, [activeTab, companyContext.companyId]);

 useEffect(() => {
 const nextContext = companyContextFromTicker(ticker);
 if (nextContext.companyId !== companyContext.companyId) {
 setCompanyContext(nextContext);
 }
 }, [ticker, companyContext.companyId]);

 useEffect(() => {
 const prefs = loadPreferences(companyContext.companyId);
 setLoadingCompany(true);
 setLoadingTab(true);
 const requestedTab = normalizeMainTabParam(searchParams.get('tab'));
 setActiveTab(requestedTab ?? 'Resumo');
 setChangesWindow(prefs.changesWindow);
 setChangesFocus('Mais relevantes');
 setChangesPillarFilter('Todos');
 setExpandedRoutineGroups({});
 setEventsWindow(prefs.eventsWindow);
 setShowValuationMethodologyDrawer(false);
 setEvidenceModal(null);
 setEvidenceTab('Fonte');
 setExpandedPillars({
 Divida: false,
 Caixa: false,
 Margens: false,
 Retorno: false,
 Proventos: false,
 });
 setWindowByPillar({
 Divida: '5a',
 Caixa: '5a',
 Margens: '5a',
 Retorno: '5a',
 Proventos: '5a',
 });
 setTabCache({});

 const timer = window.setTimeout(() => setLoadingCompany(false), 300);
 return () => window.clearTimeout(timer);
 }, [companyContext.companyId]);

 const filteredQueue = useMemo(() => {
 if (queueFilter === 'Todas') return queueItems;
 return queueItems.filter((item) => item.status === queueFilter);
 }, [queueFilter]);

 const activeCompany = queueItems.find((item) => item.companyId === companyContext.companyId) ?? queueItems[4];
 const tabKey = companyContext.companyId;
 const hasCachedTab = Boolean(tabCache[tabKey]);

 useEffect(() => {
 if (hasCachedTab) {
 setLoadingTab(false);
 return;
 }
 setLoadingTab(true);
 let cancelled = false;
 (async () => {
 const fetched = await fetchCompanyData(companyContext.companyId, companyContext.ticker);
 const companyData = fetched;
 if (cancelled) return;
 setTabCache((prev) => ({
 ...prev,
 [tabKey]: companyData
 ? { status: 'ready', companyId: companyContext.companyId, data: companyData }
 : { status: 'empty', companyId: companyContext.companyId, ticker: companyContext.ticker },
 }));
 setLoadingTab(false);
 })();
 return () => {
 cancelled = true;
 };
 }, [companyContext.companyId, companyContext.ticker, hasCachedTab, tabKey]);

 const activePayload = tabCache[tabKey];
 const mismatch = activePayload ? activePayload.companyId !== companyContext.companyId : false;
 const showSkeleton = loadingCompany || loadingTab || !activePayload || mismatch;
 const activeData =
 activePayload && activePayload.status === 'ready' && activePayload.companyId === companyContext.companyId
 ? activePayload.data
 : null;
 const scoreAverage = activeData
 ? Math.round((activeData.radarScores.Divida + activeData.radarScores.Caixa + activeData.radarScores.Margens + activeData.radarScores.Retorno + activeData.radarScores.Proventos) / 5)
 : 0;
 const mapScores = activeData?.radarScores ?? EMPTY_RADAR_SCORES;
 const mapPreviousScores = activeData?.radarPreviousScores ?? EMPTY_RADAR_SCORES;
 const pillarDataByName = new Map((activeData?.pillars ?? []).map((pillar) => [pillar.name, pillar]));
 const mapPillarEntries = pillarOrder.map((pillar) => ({
 pillar,
 score: mapScores[pillar],
 status: pillarDataByName.get(pillar)?.status ?? 'Atencao',
 }));
 const companyStatus: Status = mapPillarEntries.some((entry) => entry.status === 'Risco')
 ? 'Risco'
 : mapPillarEntries.some((entry) => entry.status === 'Atencao')
 ? 'Atencao'
 : 'Saudavel';
 const mapPillarData: PillarMapDatum[] = pillarOrder.map((pillar) => {
 const score = mapScores[pillar];
 const status = pillarDataByName.get(pillar)?.status ?? 'Atencao';
 const pillarData = pillarDataByName.get(pillar);
 const previousScore = mapPreviousScores[pillar];
 const deltaFromSeries = Number.isFinite(previousScore) ? score - previousScore : undefined;
 const parsedDelta = parseTrendDelta(pillarData?.trend);
 const delta = typeof deltaFromSeries === 'number' ? deltaFromSeries : parsedDelta;

 return {
 pillar,
 pillarLabel: pillarDisplayLabel(pillar),
 score,
 status: mapStatusFromCompanyStatus(status),
 delta,
 reason: pillarData?.summary,
 };
 });
 const healthyPillars = mapPillarEntries.filter((entry) => entry.status === 'Saudavel');
 const attentionPillars = mapPillarEntries.filter((entry) => entry.status === 'Atencao');
 const riskPillars = mapPillarEntries.filter((entry) => entry.status === 'Risco');
 const mostCriticalPillar = [...mapPillarEntries].sort((a, b) => a.score - b.score)[0];
 const strongestPillar = [...mapPillarEntries].sort((a, b) => b.score - a.score)[0];
 const actionsDisabled = showSkeleton;
 const companyPriceRows = (activeData?.priceData.rows ?? []).filter((row) => row.companyId === companyContext.companyId);
 const valuationStateChipLabel = safeMeta(activeData?.priceData.valuationStateChip?.label);
 const valuationStateChipToneRaw = safeMeta(activeData?.priceData.valuationStateChip?.tone).toLowerCase();
 const valuationStateChipTone = valuationStateChipToneRaw.includes('coral')
 ? 'border-[#F6C9BF] bg-[#FFF4F1] text-[#B54834]'
 : valuationStateChipToneRaw.includes('amber')
 ? 'border-[#F6DEA9] bg-[#FFF9ED] text-[#9A6A0F]'
 : valuationStateChipToneRaw.includes('teal')
 ? 'border-[#99F6E4] bg-[#F0FDFA] text-[#0F766E]'
 : 'border-[#DDE3EA] bg-[#F8FAFC] text-[#475569]';
const valuationSummaryLine = (activeData?.priceData.valuationSummary ?? activeData?.priceData.summary ?? '').trim();
const valuationScenarios = (activeData?.priceData.valuationScenarios ?? []).filter((scenario) => scenario.scenario || scenario.estimatedValue || scenario.differenceVsCurrent || scenario.reading);
const sensitivityDrivers = (activeData?.priceData.sensitivityDrivers ?? []).filter((driver) => driver.driver || driver.value || driver.impact);
const valuationBullet = activeData?.priceData.bulletChart ?? null;
 const fairValue = valuationBullet?.baseValue ?? asNumericValue(activeData?.priceData.estimatedFairValue);
 const currentPriceForRuler = valuationBullet?.currentPrice ?? asNumericValue(activeData?.priceData.current);
 const semanticThresholdPct = 0.1;
 const semanticRangePct = 0.3;
 const rulerMin = fairValue != null ? fairValue * (1 - semanticRangePct) : null;
 const rulerMax = fairValue != null ? fairValue * (1 + semanticRangePct) : null;
 const hasSemanticDomain = rulerMin != null && rulerMax != null && rulerMax > rulerMin;
 const toRulerPercent = (value: number | null | undefined) => {
 if (!hasSemanticDomain || value == null) return null;
 const pct = ((value - rulerMin) / (rulerMax - rulerMin)) * 100;
 return Math.min(100, Math.max(0, pct));
 };
 const fairMarker = hasSemanticDomain ? 50 : null;
 const currentMarkerRaw = toRulerPercent(currentPriceForRuler);
 const currentMarker = currentMarkerRaw != null ? Math.min(98, Math.max(2, currentMarkerRaw)) : null;
 const nearZoneMin = fairValue != null ? fairValue * (1 - semanticThresholdPct) : null;
 const nearZoneMax = fairValue != null ? fairValue * (1 + semanticThresholdPct) : null;
 const nearZoneMinPct = toRulerPercent(nearZoneMin);
 const nearZoneMaxPct = toRulerPercent(nearZoneMax);
 const hasNearZone = nearZoneMinPct != null && nearZoneMaxPct != null && nearZoneMaxPct > nearZoneMinPct;
 const belowZoneWidthPct = hasNearZone ? Math.max((nearZoneMinPct ?? 0), 0) : 0;
 const nearZoneWidthPct = hasNearZone ? Math.max((nearZoneMaxPct ?? 0) - (nearZoneMinPct ?? 0), 0) : 0;
 const aboveZoneWidthPct = hasNearZone ? Math.max(100 - (nearZoneMaxPct ?? 100), 0) : 0;
 const currentMarkerLabelClass = currentMarker == null
 ? 'left-1/2 -translate-x-1/2'
 : currentMarker <= 14
 ? 'left-0'
 : currentMarker >= 86
 ? 'right-0'
 : 'left-1/2 -translate-x-1/2';
 const companySourceRows = (activeData?.sourceRows ?? []).filter((row) => row.companyId === companyContext.companyId);
 const sourceRowsWithRelevance = companySourceRows.map((row) => {
 const displaySource = (row as { displaySource?: string }).displaySource ?? row.source;
 const displayDoc = (row as { displayDoc?: string }).displayDoc ?? row.doc;
 const displayStatus = (row as { displayStatus?: string }).displayStatus ?? row.status;
 const isPrimary = row.category === 'Financeiro' || row.category === 'Eventos' || row.category === 'Preço';
 const statusLabel = displayStatus === 'Atualizado' ? 'Atualizado' : isPrimary ? 'Desatualizada' : 'Mais antiga';
 const consequence = displayStatus === 'Atualizado'
 ? isPrimary
  ? 'Sustenta a leitura atual.'
  : 'Complementar atualizada.'
 : isPrimary
 ? 'Desatualizada; leitura pede cautela.'
 : 'Complementar; não altera a leitura principal.';
 return { ...row, source: displaySource, doc: displayDoc, status: displayStatus, isPrimary, consequence, statusLabel };
 });
 const primarySourceRows = sourceRowsWithRelevance.filter((row) => row.isPrimary);
 const complementarySourceRows = sourceRowsWithRelevance.filter((row) => !row.isPrimary);
 const updatedPrimarySources = primarySourceRows.filter((row) => row.status === 'Atualizado').length;
 const outdatedPrimarySources = primarySourceRows.filter((row) => row.status !== 'Atualizado').length;
 const outdatedComplementarySources = complementarySourceRows.filter((row) => row.status !== 'Atualizado').length;
 const latestSourceDate = sourceRowsWithRelevance
 .map((row) => ({ date: row.date, sort: getChangeDateSortValue(row.date) }))
 .sort((a, b) => b.sort - a.sort)[0]?.date ?? safeMeta(activeData?.summaryMeta.updatedAt);
 const sourceConfidenceLabel = outdatedPrimarySources > 0
 ? 'Moderada'
 : updatedPrimarySources >= 2
 ? (outdatedComplementarySources > 0 ? 'Alta no núcleo da leitura' : 'Alta')
 : 'Em revisão';
 const sourceConfidenceTone = sourceConfidenceLabel === 'Alta'
 ? 'border-[#99F6E4] bg-[#F0FDFA] text-[#0E9384]'
 : sourceConfidenceLabel === 'Moderada'
 ? 'border-[#FDE68A] bg-[#FFFBEB] text-[#D97706]'
 : 'border-[#E5E7EB] bg-[#F9FAFB] text-[#64748B]';
 const sourceConfidenceSummary = outdatedPrimarySources > 0
 ? `A leitura atual tem ${outdatedPrimarySources} fonte principal desatualizada e pede cautela em parte do diagnóstico.`
 : `A leitura atual está apoiada em fontes principais atualizadas. ${outdatedComplementarySources > 0 ? `Há ${outdatedComplementarySources} fonte complementar mais antiga, sem comprometer a leitura central neste momento.` : 'Não há alerta de desatualização relevante no conjunto principal.'}`;
 const resolvedSourceConfidenceLabel = (activeData?.sourceConfidence?.level ?? '').trim() || sourceConfidenceLabel;
 const resolvedSourceConfidenceSummary = (activeData?.sourceConfidence?.summary ?? '').trim() || sourceConfidenceSummary;
const allCompanyChanges = (activeData?.changes ?? []).filter((change) => change.companyId === companyContext.companyId);
const eventsCount = (activeData?.timelineEvents ?? []).filter((event) => event.companyId === companyContext.companyId).length;
const changesBySelectedWindow = allCompanyChanges.filter((change) => {
 const parsed = parseChangeDate(change.date);
 if (!parsed) return true;
 const now = new Date();
 const diff = Math.floor((now.getTime() - parsed.getTime()) / (1000 * 60 * 60 * 24));
 return diff <= periodToDays(changesWindow);
});
const changesCount = changesBySelectedWindow.length;
 const strongestHumanLine = (() => {
 const base = activeData?.strongest.summary?.trim();
 if (base) return base;
 return 'Sem resumo de força disponível neste fechamento.';
 })();
 const watchoutHumanLine = (() => {
 const base = activeData?.watchout.summary?.trim();
 if (base) return base;
 return 'Sem ponto de atenção detalhado neste fechamento.';
 })();
 const watchoutBadgeLabel = (() => {
 const raw = (activeData?.watchout.badge ?? '').toLowerCase();
 if (!raw) return 'Monitorar';
 if (raw.includes('saud')) return 'Em observação';
 if (raw.includes('aten')) return 'Monitorar';
 if (raw.includes('ris')) return 'Em observação';
 return activeData?.watchout.badge ?? 'Monitorar';
 })();
 const summaryNarrative = (() => {
 const summary = activeData?.summaryText?.trim();
 if (summary) return summary;
 const motherLine = activeData?.summaryScan.motherLine?.trim();
 if (motherLine) return motherLine;
 const headline = activeData?.diagnosisHeadline?.trim();
 return headline || 'Sem resumo narrativo disponivel neste fechamento.';
 })();
 const enrichedChanges = useMemo(() => {
 return changesBySelectedWindow
 .map((change) => {
  const level = getChangeLevel(change);
  const pillar = normalizeChangePillar(change.impact);
  const interpretation = buildInterpretationLine({ ...change, level });
  const whyItMatters = buildWhyItMatters({ ...change, level });
  const severityLabel = level === 'Estrutural' ? 'Estrutural' : change.severity;
  const routineKey = `${pillar}:${(change.type ?? 'geral').toLowerCase()}`;
  return {
  ...change,
  level,
  pillar,
  interpretation,
  whyItMatters,
  severityLabel,
  routineKey,
  dateSortValue: getChangeDateSortValue(change.date),
  };
 })
 .sort((a, b) => {
  const levelDiff = changeLevelRank[a.level] - changeLevelRank[b.level];
  if (levelDiff !== 0) return levelDiff;
  return b.dateSortValue - a.dateSortValue;
 });
 }, [changesBySelectedWindow]);

 const visibleChangesByPillar = useMemo(() => {
 if (changesPillarFilter === 'Todos') return enrichedChanges;
 return enrichedChanges.filter((change) => change.pillar === changesPillarFilter);
 }, [changesPillarFilter, enrichedChanges]);

 const structuralChanges = visibleChangesByPillar.filter((change) => change.level === 'Estrutural');
 const relevantChanges = visibleChangesByPillar.filter((change) => change.level === 'Relevante');
 const routineChanges = visibleChangesByPillar.filter((change) => change.level === 'Rotina');

 const routineGroupsMap = useMemo(() => {
 const map = new Map<string, typeof routineChanges>();
 routineChanges.forEach((change) => {
  const current = map.get(change.routineKey) ?? [];
  current.push(change);
  map.set(change.routineKey, current);
 });
 return map;
 }, [routineChanges]);

 const routineGroups = useMemo(() => {
 return Array.from(routineGroupsMap.entries())
 .filter(([, items]) => items.length >= 2)
 .map(([groupKey, items]) => {
  const newest = [...items].sort((a, b) => b.dateSortValue - a.dateSortValue)[0];
  const pillar = newest?.pillar ?? 'A classificar';
  const type = newest?.type ?? 'Atualização';
  const groupTitle = `${pillar} - ${items.length} atualizações rotineiras no período`;
  return {
  groupKey,
  items: items.sort((a, b) => b.dateSortValue - a.dateSortValue),
  pillar,
  type,
  groupTitle,
  summary: `Eventos recorrentes de ${type.toLowerCase()}, sem mudança estrutural relevante na leitura atual da empresa.`,
  };
 })
 .sort((a, b) => b.items[0].dateSortValue - a.items[0].dateSortValue);
 }, [routineGroupsMap]);

 const groupedRoutineKeys = new Set(routineGroups.map((group) => group.groupKey));
 const routineSingles = routineChanges.filter((change) => !groupedRoutineKeys.has(change.routineKey));
 const isCompactScreen = typeof window !== 'undefined' ? window.innerWidth < 768 : false;
 const compactRoutineSingles = isCompactScreen && routineSingles.length > 2 ? routineSingles.slice(0, 2) : routineSingles;
 const overflowRoutineSingles = isCompactScreen && routineSingles.length > 2 ? routineSingles.slice(2) : [];

 const overflowRoutineGroup = overflowRoutineSingles.length > 0
 ? {
  groupKey: 'rotina-overflow',
  items: overflowRoutineSingles,
  pillar: 'A classificar' as ChangePillarTag,
  type: 'Outras rotinas',
  groupTitle: `Outras rotinas - ${overflowRoutineSingles.length} atualizações`,
  summary: 'Atualizações recorrentes agrupadas para reduzir ruido na leitura mobile.',
 }
 : null;

 const routineRenderItems = [
 ...routineGroups.map((group) => ({ type: 'group' as const, payload: group })),
 ...compactRoutineSingles.map((change) => ({ type: 'single' as const, payload: change })),
 ...(overflowRoutineGroup ? [{ type: 'group' as const, payload: overflowRoutineGroup }] : []),
 ].sort((a, b) => {
 const aDate = a.type === 'group' ? a.payload.items[0].dateSortValue : a.payload.dateSortValue;
 const bDate = b.type === 'group' ? b.payload.items[0].dateSortValue : b.payload.dateSortValue;
 return bDate - aDate;
 });

 const displayedStructural = changesFocus === 'Rotina' ? [] : structuralChanges;
 const displayedRelevant = changesFocus === 'Estruturais' || changesFocus === 'Rotina' ? [] : relevantChanges;
 const displayedRoutine = changesFocus === 'Estruturais' || changesFocus === 'Mais relevantes' ? [] : routineRenderItems;

 const hasVisibleChanges = displayedStructural.length > 0 || displayedRelevant.length > 0 || displayedRoutine.length > 0;
 const backendWindowKey = String(periodToDays(changesWindow));
 const backendChangesSummary = activeData?.changesSummaryByWindow?.[backendWindowKey] ?? activeData?.changesSummary;
 const principalChange = backendChangesSummary?.principalChange
 ? {
 title: backendChangesSummary.principalChange.title ?? 'Mudanca relevante',
 pillar: normalizeChangePillar(backendChangesSummary.principalChange.impact),
 companyId: companyContext.companyId,
 }
 : (structuralChanges[0] ?? null);

 const periodMostAffected = backendChangesSummary?.mostAffectedPillar
 ? normalizeChangePillar(backendChangesSummary.mostAffectedPillar)
 : (() => {
 const counter = new Map<ChangePillarTag, number>();
 visibleChangesByPillar.forEach((change) => {
  counter.set(change.pillar, (counter.get(change.pillar) ?? 0) + 1);
 });
 if (counter.size === 0) return 'A classificar' as ChangePillarTag;
 return [...counter.entries()].sort((a, b) => b[1] - a[1])[0][0];
 })();

 const routineCount = backendChangesSummary?.routineCount ?? enrichedChanges.filter((change) => change.level === 'Rotina').length;
 const structuralCount = backendChangesSummary?.structuralCount ?? enrichedChanges.filter((change) => change.level === 'Estrutural').length;
 const changesSummaryText = backendChangesSummary?.summaryText
 ?? (principalChange
 ? `Nos úúltimos ${changesWindow.replace(' dias', '')} dias, a principal mudança identificada foi ${principalChange.title.toLowerCase()}, com possível efeito no pilar de ${principalChange.pillar}. Fora isso, o período teve atualizações mais rotineiras, sem alteracao estrutural relevante na leitura geral da empresa.`
 : `Nos úúltimos ${changesWindow.replace(' dias', '')} dias, o período foi marcado por atualizações de acompanhamento, sem mudança estrutural dominante na leitura geral da empresa.`);
 const availablePillarsForFilter = pillarFilterOptions;
 const allCompanyTimelineEvents = (activeData?.timelineEvents ?? []).filter((timelineEvent) => timelineEvent.companyId === companyContext.companyId);
 const timelineEventsBySelectedWindow = useMemo(() => {
 const thresholdDays = periodToDays(eventsWindow);
 const now = new Date();
 const withDiff = allCompanyTimelineEvents.map((timelineEvent) => {
  const parsed = parseChangeDate(timelineEvent.date);
  if (!parsed) return { timelineEvent, diff: 0 };
  const diff = Math.floor(Math.abs(now.getTime() - parsed.getTime()) / (1000 * 60 * 60 * 24));
  return { timelineEvent, diff };
 });
 const filtered = withDiff.filter((entry) => entry.diff <= thresholdDays).map((entry) => entry.timelineEvent);
 return filtered.length > 0 ? filtered : allCompanyTimelineEvents;
 }, [allCompanyTimelineEvents, eventsWindow]);

 const enrichedTimelineEvents = useMemo(() => {
 return timelineEventsBySelectedWindow
 .map((timelineEvent) => {
  const mainPillar = normalizeChangePillar(timelineEvent.pillars?.[0]);
  const level = getTimelineEventLevel(timelineEvent);
  const typeLabel = getTimelineEventTypeLabel(timelineEvent.title);
  const interpretation = buildTimelineInterpretationLine({
  title: timelineEvent.title,
  typeLabel,
  level,
  mainPillar,
  pillars: timelineEvent.pillars,
  });
  const whyItMatters = buildTimelineWhyItMatters({
  why: timelineEvent.why,
  level,
  mainPillar,
  pillars: timelineEvent.pillars,
  });
  const severityLabel = level === 'Estrutural' ? 'Principal' : level === 'Relevante' ? 'Relevante' : 'Rotina';
  const dateSortValue = getChangeDateSortValue(timelineEvent.date);
  const routineKey = `${mainPillar}:${typeLabel.toLowerCase()}`;
  return {
  ...timelineEvent,
  level,
  typeLabel,
  mainPillar,
  interpretation,
  whyItMatters,
  severityLabel,
  dateSortValue,
  routineKey,
  sourceUrl: timelineSourceUrl(timelineEvent.source),
  };
 })
 .sort((a, b) => {
  const levelDiff = changeLevelRank[a.level] - changeLevelRank[b.level];
  if (levelDiff !== 0) return levelDiff;
  return b.dateSortValue - a.dateSortValue;
 });
 }, [timelineEventsBySelectedWindow]);

 const visibleTimelineEventsByPillar = useMemo(() => {
 if (eventsPillarFilter === 'Todos') return enrichedTimelineEvents;
 return enrichedTimelineEvents.filter((event) => event.mainPillar === eventsPillarFilter);
 }, [enrichedTimelineEvents, eventsPillarFilter]);

 const structuralTimelineEvents = visibleTimelineEventsByPillar.filter((event) => event.level === 'Estrutural');
 const relevantTimelineEvents = visibleTimelineEventsByPillar.filter((event) => event.level === 'Relevante');
 const routineTimelineEvents = visibleTimelineEventsByPillar.filter((event) => event.level === 'Rotina');

 const timelineRoutineGroupsMap = useMemo(() => {
 const map = new Map<string, typeof routineTimelineEvents>();
 routineTimelineEvents.forEach((event) => {
  const current = map.get(event.routineKey) ?? [];
  current.push(event);
  map.set(event.routineKey, current);
 });
 return map;
 }, [routineTimelineEvents]);

 const timelineRoutineGroups = useMemo(() => {
 return Array.from(timelineRoutineGroupsMap.entries())
 .filter(([, items]) => items.length >= 2)
 .map(([groupKey, items]) => {
  const newest = [...items].sort((a, b) => b.dateSortValue - a.dateSortValue)[0];
  const pillar = newest?.mainPillar ?? 'A classificar';
  const type = newest?.typeLabel ?? 'Atualização';
  return {
  groupKey,
  items: items.sort((a, b) => b.dateSortValue - a.dateSortValue),
  pillar,
  groupTitle: `${pillar} - ${items.length} atualizações nos úúltimos ${eventsWindow.replace(' dias', '')} dias`,
  summary: `Eventos recorrentes de ${type.toLowerCase()}, sem mudança estrutural relevante na leitura atual da empresa.`,
  };
 })
 .sort((a, b) => b.items[0].dateSortValue - a.items[0].dateSortValue);
 }, [eventsWindow, timelineRoutineGroupsMap]);

 const groupedTimelineRoutineKeys = new Set(timelineRoutineGroups.map((group) => group.groupKey));
 const timelineRoutineSingles = routineTimelineEvents.filter((event) => !groupedTimelineRoutineKeys.has(event.routineKey));
 const compactTimelineRoutineSingles = isCompactScreen && timelineRoutineSingles.length > 2 ? timelineRoutineSingles.slice(0, 2) : timelineRoutineSingles;
 const overflowTimelineRoutineSingles = isCompactScreen && timelineRoutineSingles.length > 2 ? timelineRoutineSingles.slice(2) : [];

 const overflowTimelineRoutineGroup = overflowTimelineRoutineSingles.length > 0
 ? {
  groupKey: 'agenda-rotina-overflow',
  items: overflowTimelineRoutineSingles,
  pillar: 'A classificar' as ChangePillarTag,
  groupTitle: `Outras rotinas - ${overflowTimelineRoutineSingles.length} atualizações`,
  summary: 'Atualizações recorrentes agrupadas para reduzir ruido na leitura mobile.',
 }
 : null;

 const timelineRoutineRenderItems = [
 ...timelineRoutineGroups.map((group) => ({ type: 'group' as const, payload: group })),
 ...compactTimelineRoutineSingles.map((event) => ({ type: 'single' as const, payload: event })),
 ...(overflowTimelineRoutineGroup ? [{ type: 'group' as const, payload: overflowTimelineRoutineGroup }] : []),
 ].sort((a, b) => {
 const aDate = a.type === 'group' ? a.payload.items[0].dateSortValue : a.payload.dateSortValue;
 const bDate = b.type === 'group' ? b.payload.items[0].dateSortValue : b.payload.dateSortValue;
 return bDate - aDate;
 });

 const displayedTimelineStructural = eventsFocus === 'Rotina' ? [] : structuralTimelineEvents;
 const displayedTimelineRelevant = eventsFocus === 'Principais' || eventsFocus === 'Rotina' ? [] : relevantTimelineEvents;
 const displayedTimelineRoutine = eventsFocus === 'Principais' || eventsFocus === 'Mais relevantes' ? [] : timelineRoutineRenderItems;
 const hasVisibleTimelineEvents = displayedTimelineStructural.length > 0 || displayedTimelineRelevant.length > 0 || displayedTimelineRoutine.length > 0;
 const principalTimelineChange = structuralTimelineEvents[0] ?? null;
 const timelineStructuralCount = enrichedTimelineEvents.filter((event) => event.level === 'Estrutural').length;
 const timelineRoutineCount = enrichedTimelineEvents.filter((event) => event.level === 'Rotina').length;
 const timelineMostAffectedPillar = (() => {
 const counter = new Map<ChangePillarTag, number>();
 visibleTimelineEventsByPillar.forEach((event) => {
  counter.set(event.mainPillar, (counter.get(event.mainPillar) ?? 0) + 1);
 });
 if (counter.size === 0) return 'A classificar' as ChangePillarTag;
 return [...counter.entries()].sort((a, b) => b[1] - a[1])[0][0];
 })();

 const switchCompany = (nextTicker: string) => {
 if (nextTicker === companyContext.ticker) return;
 const nextContext = companyContextFromTicker(nextTicker);
 setCompanyContext(nextContext);
 navigate(`/empresa/${nextTicker}`);
 };

 const guardAction = (event?: React.MouseEvent, itemCompanyId?: string) => {
 if (!actionsDisabled && (!itemCompanyId || itemCompanyId === companyContext.companyId)) return false;
 event?.preventDefault();
 setActionError('Atualizando dados da empresa. Tente novamente em instantes.');
 return true;
 };

 const goToPillar = (pillarName: string, openEvidence = false) => {
 const normalizedPillar = normalizePillarName(pillarName);
 setActiveTab('Pilares');
 setExpandedPillars({
 Divida: normalizedPillar === 'Divida',
 Caixa: normalizedPillar === 'Caixa',
 Margens: normalizedPillar === 'Margens',
 Retorno: normalizedPillar === 'Retorno',
 Proventos: normalizedPillar === 'Proventos',
 });
 if (openEvidence) {
 const evidence = activeData?.pillars.find((pillar) => pillar.name === normalizedPillar)?.evidences[0];
 if (evidence) {
 setEvidenceModal({ pillarName: normalizedPillar, evidence });
 setEvidenceTab('Fonte');
 }
 }
 window.setTimeout(() => {
 const target = document.getElementById(`pillar-${normalizedPillar}`);
 target?.scrollIntoView({ behavior: 'smooth', block: 'start' });
 }, 120);
 };

 const openSummaryEvidence = () => {
 if (!activeData) return;
 goToPillar(activeData.summaryScan.attention.pillar, true);
 };

 const renderChangeCard = (change: (typeof enrichedChanges)[number], nested = false) => (
 <article key={`${change.type}-${change.date}-${change.title}`} className={cx('rounded-xl border bg-white p-4', nested ? 'border-[#E5E7EB]' : 'border-[#DDE3EA]')}>
  <p className="flex flex-wrap items-center gap-1.5 text-[11px] text-[#5B6472]">
  <span className="rounded-full border border-[#DDE3EA] bg-[#F8FAFC] px-2 py-0.5">{change.pillar}</span>
  <span>|</span>
  <span>{change.date}</span>
  <span>|</span>
  <span className={cx('rounded-full px-2 py-0.5', change.level === 'Estrutural' ? 'border border-[#F6C9BF] bg-[#FFF4F1] text-[#B54834]' : change.level === 'Relevante' ? 'border border-[#F6DEA9] bg-[#FFF9ED] text-[#9A6A0F]' : 'border border-[#CFEAE4] bg-[#F2FCF9] text-[#0F6F61]')}>
   {change.severityLabel}
  </span>
  </p>
  <h3 className="mt-2 text-[15px] font-semibold text-[#111827]">{change.title}</h3>
  <p className="mt-2 text-[13px] text-[#374151]">{change.interpretation}</p>
  <p className="mt-2 text-[12px] font-semibold uppercase tracking-wide text-[#64748B]">Por que isso importa:</p>
  <p className="text-[13px] text-[#475569]">{change.whyItMatters}</p>
  <p className="mt-3 text-[11px] text-[#8B95A5]">
   Fonte: {safeMeta(change.source.docLabel)} | Atualizado em {safeMeta(change.date)} | Status: Atualizado
  </p>
  <div className="mt-3 flex flex-wrap items-center gap-2">
   <button
   className={cx('rounded-md border border-[#0E9384] bg-[#0E9384] px-3 py-1.5 text-[12px] font-semibold text-white', actionsDisabled ? 'cursor-not-allowed opacity-50' : '')}
   disabled={actionsDisabled}
   onClick={(event) => {
    if (guardAction(event, change.companyId)) return;
    if (change.pillar !== 'A classificar') goToPillar(change.pillar);
   }}
   >
   Ver impacto no pilar
   </button>
   <a
   href={change.source.url}
   target="_blank"
   rel="noreferrer"
   onClick={(event) => {
    if (guardAction(event, change.companyId)) return;
   }}
   className={cx('inline-flex items-center gap-1 rounded-md border border-[#DDE3EA] px-3 py-1.5 text-[12px] text-[#5B6472]', actionsDisabled ? 'cursor-not-allowed opacity-50' : '')}
   >
   Abrir documento original
   <ExternalLink className="h-3.5 w-3.5" />
   </a>
  </div>
 </article>
 );

 const renderAgendaEventCard = (timelineEvent: (typeof enrichedTimelineEvents)[number], nested = false) => (
 <article key={`${timelineEvent.title}-${timelineEvent.date}-${timelineEvent.mainPillar}`} className={cx('rounded-xl border bg-white p-4', nested ? 'border-[#E5E7EB]' : 'border-[#DDE3EA]')}>
  <p className="flex flex-wrap items-center gap-1.5 text-[11px] text-[#5B6472]">
  <span className="rounded-full border border-[#DDE3EA] bg-[#F8FAFC] px-2 py-0.5">{timelineEvent.mainPillar}</span>
  <span>|</span>
  <span>{timelineEvent.date}</span>
  <span>|</span>
  <span className={cx('rounded-full px-2 py-0.5', timelineEvent.level === 'Estrutural' ? 'border border-[#F6C9BF] bg-[#FFF4F1] text-[#B54834]' : timelineEvent.level === 'Relevante' ? 'border border-[#F6DEA9] bg-[#FFF9ED] text-[#9A6A0F]' : 'border border-[#CFEAE4] bg-[#F2FCF9] text-[#0F6F61]')}>
   {timelineEvent.severityLabel}
  </span>
  </p>
  <h3 className="mt-2 text-[15px] font-semibold text-[#111827]">{timelineEvent.title}</h3>
  <p className="mt-2 text-[13px] text-[#374151]">{timelineEvent.interpretation}</p>
  <p className="mt-2 text-[12px] font-semibold uppercase tracking-wide text-[#64748B]">Por que isso importa:</p>
  <p className="text-[13px] text-[#475569]">{timelineEvent.whyItMatters}</p>
  <p className="mt-3 text-[11px] text-[#8B95A5]">
   Fonte: {safeMeta(timelineEvent.source)} | Atualizado em {safeMeta(timelineEvent.date)} | Status: Monitorado
  </p>
  <div className="mt-3 flex flex-wrap items-center gap-2">
   <button
   className={cx('rounded-md border border-[#0E9384] bg-[#0E9384] px-3 py-1.5 text-[12px] font-semibold text-white', actionsDisabled ? 'cursor-not-allowed opacity-50' : '')}
   disabled={actionsDisabled}
   onClick={(event) => {
    if (guardAction(event, timelineEvent.companyId)) return;
    if (timelineEvent.mainPillar !== 'A classificar') goToPillar(timelineEvent.mainPillar);
   }}
   >
   Ver impacto no pilar
   </button>
   <button
   className={cx('rounded-md border border-[#DDE3EA] bg-white px-3 py-1.5 text-[12px] font-medium text-[#374151]', actionsDisabled ? 'cursor-not-allowed opacity-50' : '')}
   disabled={actionsDisabled}
   onClick={(event) => guardAction(event, timelineEvent.companyId)}
   >
   Me lembrar desse gatilho
   </button>
  </div>
  <a
  href={timelineEvent.sourceUrl}
  target="_blank"
  rel="noreferrer"
  onClick={(event) => {
   if (guardAction(event, timelineEvent.companyId)) return;
  }}
  className={cx('mt-2 inline-flex items-center gap-1 text-[12px] text-[#5B6472] hover:underline', actionsDisabled ? 'cursor-not-allowed opacity-50' : '')}
  >
  Abrir documento original
  <ExternalLink className="h-3.5 w-3.5" />
  </a>
 </article>
 );

 useEffect(() => {
 if (!activeData) return;
 const pillarParam = searchParams.get('pilar');
 if (!pillarParam) return;

 const evidenceParam = normalizeEvidenceParam(searchParams.get('evidencia'));
 const deepLinkKey = `${companyContext.companyId}:${pillarParam}:${evidenceParam ?? ''}`;
 if (lastAppliedDeepLinkRef.current === deepLinkKey) return;
 lastAppliedDeepLinkRef.current = deepLinkKey;

 const targetPillar = normalizePillarName(pillarParam);
 setActiveTab('Pilares');
 setExpandedPillars({
 Divida: targetPillar === 'Divida',
 Caixa: targetPillar === 'Caixa',
 Margens: targetPillar === 'Margens',
 Retorno: targetPillar === 'Retorno',
 Proventos: targetPillar === 'Proventos',
 });
 setHighlightedEvidenceId(null);

 window.setTimeout(() => {
 const pillarData = activeData.pillars.find((pillar) => pillar.companyId === companyContext.companyId && pillar.name === targetPillar);
 if (!pillarData) return;

 const matchedEvidenceIndex = evidenceParam
 ? pillarData.evidences.findIndex((evidence, index) => {
 const byId = (evidence.id ?? '').toLowerCase() === evidenceParam;
 const byOrdinal = `${targetPillar.toLowerCase()}-${index + 1}` === evidenceParam || `${index + 1}` === evidenceParam;
 return byId || byOrdinal;
 })
 : -1;

 if (matchedEvidenceIndex >= 0) {
 const matchedEvidence = pillarData.evidences[matchedEvidenceIndex];
 const anchorId = getEvidenceAnchorId(targetPillar, matchedEvidence, matchedEvidenceIndex);
 setHighlightedEvidenceId(anchorId);
 setEvidenceModal({ pillarName: targetPillar, evidence: matchedEvidence });
 setEvidenceTab('Fonte');
 const evidenceTarget = document.getElementById(anchorId);
 evidenceTarget?.scrollIntoView({ behavior: 'smooth', block: 'center' });
 return;
 }

 const pillarTarget = document.getElementById(`pillar-${targetPillar}`);
 pillarTarget?.scrollIntoView({ behavior: 'smooth', block: 'start' });
 }, 150);
 }, [activeData, companyContext.companyId, searchParams]);

 useEffect(() => {
 if (!actionError) return;
 const timer = window.setTimeout(() => setActionError(null), 2400);
 return () => window.clearTimeout(timer);
 }, [actionError]);

 useEffect(() => {
 const openPillar =
 (Object.entries(expandedPillars).find(([, isOpen]) => isOpen)?.[0] as Exclude<CompanyPreferences['lastOpenPillar'], null> | undefined) ??
 null;
 savePreferences(companyContext.companyId, {
 activeTab,
 changesWindow,
 eventsWindow,
 lastOpenPillar: openPillar,
 });
 }, [activeTab, changesWindow, companyContext.companyId, eventsWindow, expandedPillars]);

 return (
 <div className="h-screen overflow-hidden bg-[#F7F8FA] font-['Plus_Jakarta_Sans','DM_Sans',system-ui,sans-serif] text-[#111827]">
 <style>{`
 .skeleton-shimmer {
 background-image: linear-gradient(90deg, #F3F4F6 0%, #E5E7EB 40%, #F3F4F6 80%);
 background-size: 200% 100%;
 animation: shimmer 1.5s linear infinite;
 }
 @keyframes shimmer {
 0% { background-position: 200% 0; }
 100% { background-position: -200% 0; }
 }
 `}</style>
 <div className="relative flex h-full">
 <div className="w-[88px] flex-shrink-0 opacity-90">
 <Sidebar currentPage="explorar" />
 </div>

 <aside
 className={cx(
 'relative h-full flex-shrink-0 overflow-hidden bg-[#FCFDFC] transition-all duration-200',
 watchlistCollapsed ? 'w-0 border-r-0 p-0' : 'w-[228px] border-r border-[#F3F4F6] p-3.5'
 )}
 >
 {!watchlistCollapsed && (
 <button
 className="absolute -right-3 top-1/2 z-20 grid h-7 w-7 -translate-y-1/2 place-items-center rounded-full border border-[#E5E7EB] bg-white text-[#6B7280] shadow-sm hover:bg-[#F9FAFB]"
 onClick={() => setWatchlistCollapsed(true)}
 aria-label="Retrair watchlist"
 title="Retrair watchlist"
 >
 <ChevronLeft className="h-4 w-4 transition-transform" />
 </button>
 )}
 {!watchlistCollapsed && (
 <div className="flex items-center justify-between">
 <h2 className="text-[14px] font-semibold text-[#374151]">Watchlist</h2>
 <div className="flex items-center gap-2">
 <Search className="h-4 w-4 text-[#9CA3AF]" />
 </div>
 </div>
 )}
 {!watchlistCollapsed && (
 <div className="mt-3 flex items-center gap-1.5">
 {(['Todas', 'Atencao', 'Risco'] as QueueFilter[]).map((filter) => (
 <button
 key={filter}
 onClick={() => setQueueFilter(filter)}
 className={cx(
 'h-7 rounded-full px-3.5 text-[13px]',
 queueFilter === filter ? 'border border-[#E5E7EB] bg-white font-semibold text-[#111827]' : 'text-[#6B7280]'
 )}
 >
 {filter === 'Atencao' ? 'Atenção' : filter}
 </button>
 ))}
 </div>
 )}
 {!watchlistCollapsed && (
 <div className="mt-4 divide-y divide-[#F3F4F6]">
 {filteredQueue.map((company) => {
 const selected = company.companyId === companyContext.companyId;
 return (
 <button
 key={company.ticker}
 onClick={() => switchCompany(company.ticker)}
 className={cx(
 'group flex w-full items-center gap-2.5 text-left',
 selected ? 'rounded-[10px] border border-[#BEEDE6] bg-[#F4FCFA] p-2.5' : 'px-2 py-2.5'
 )}
 >
 <QueueLogo company={company} />
 <div className="min-w-0 flex-1">
 <p className="truncate text-[13px] font-bold text-[#111827]">{company.ticker}</p>
 <p className="truncate text-[11px] text-[#9CA3AF]">{company.name}</p>
 </div>
 <span className={cx('h-[7px] w-[7px] rounded-full', statusTone[company.status].dot)} />
 <MoreHorizontal className={cx('h-3.5 w-3.5 text-[#9CA3AF] transition-opacity', selected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100')} />
 </button>
 );
 })}
 </div>
 )}
 </aside>

 {watchlistCollapsed && (
 <button
 className="absolute left-[88px] top-1/2 z-30 grid h-7 w-7 -translate-y-1/2 place-items-center rounded-full border border-[#D1D5DB] bg-white text-[#6B7280] shadow-sm hover:bg-[#F9FAFB]"
 onClick={() => setWatchlistCollapsed(false)}
 aria-label="Expandir watchlist"
 title="Expandir watchlist"
 >
 <ChevronLeft className="h-4 w-4 rotate-180 transition-transform" />
 </button>
 )}

 <main className="h-full flex-1 overflow-y-auto bg-[#F7F8FA]">
 <header className="sticky top-0 z-10 border-b border-[#EFEFEF] bg-white px-6 py-3">
 <div className="flex min-w-0 items-start justify-between gap-4">
 <div className="flex min-w-0 items-start gap-4">
 <QueueLogo company={activeCompany} />
 <div className="min-w-0">
 <div className="flex flex-wrap items-center gap-2">
 <h1 className="text-[30px] font-bold leading-none text-[#0B1220]">{activeCompany.name === 'WEG' ? 'WEG' : activeCompany.name}</h1>
 <span className="rounded-full border border-[#D1D5DB] px-2.5 py-1 text-[13px] font-medium text-[#374151]">{activeCompany.ticker}</span>
 <span className={cx('rounded-full border px-2.5 py-1 text-[12px] font-semibold', statusTone[companyStatus].badge)}>
 {statusLabel(companyStatus)} - {scoreAverage}/100
 </span>
 <span className="rounded-full border border-[#E5E7EB] bg-[#F9FAFB] px-2.5 py-1 text-[11px] font-medium text-[#6B7280]">
 Preço atual: {safeMeta(activeData?.priceData.current)} <span className="text-[#9CA3AF]">+0,8%</span>
 </span>
 </div>
 <p className="mt-1 truncate text-[13px] text-[#6B7280]">{activeCompany.description}</p>
 <div className="mt-2 flex flex-wrap items-center gap-3 text-[12px] text-[#6B7280]">
 <span>Atualizado em {safeMeta(activeData?.summaryMeta.updatedAt)}</span>
 <span>Setor: Industria | Bens de capital</span>
 <span title="Ver fontes na aba Fontes">Fontes: CVM, B3 e RI</span>
 <div className="relative">
 <button className="text-[12px] text-[#6B7280] hover:text-[#374151] hover:underline" onClick={() => setShowHeaderUpdateDetails((prev) => !prev)}>
 Ver detalhes da atualização
 </button>
 {showHeaderUpdateDetails && (
 <div className="absolute left-0 top-6 z-30 min-w-[220px] rounded-lg border border-[#E5E7EB] bg-white p-3 text-[12px] text-[#4B5563] shadow-lg">
 <p>Financeiro: {safeMeta(activeData?.summaryMeta.updatedAt)}</p>
 <p>Eventos: {safeMeta(activeData?.summaryMeta.updatedAt)}</p>
 <p>Preço: {safeMeta(activeData?.priceData.updatedAt)}</p>
 <p>Fontes: {safeMeta(activeData?.summaryMeta.updatedAt)}</p>
 </div>
 )}
 </div>
 </div>
 </div>
 </div>

 <div className="relative flex flex-wrap items-center gap-2">
 <button
 className={cx('inline-flex items-center gap-1.5 rounded-lg border border-[#0E9384] bg-[#E9F8F5] px-3.5 py-2 text-[13px] font-semibold text-[#0E9384]', actionsDisabled ? 'cursor-not-allowed opacity-50' : '')}
 disabled={actionsDisabled}
 onClick={(event) => guardAction(event)}
 >
 <Check className="h-4 w-4" />
 Na Watchlist
 </button>
 <button className={cx('rounded-lg border border-[#D1D5DB] bg-white px-3.5 py-2 text-[13px] font-medium text-[#1F2937]', actionsDisabled ? 'cursor-not-allowed opacity-50' : '')} disabled={actionsDisabled} onClick={(event) => guardAction(event)}>Criar alerta</button>
 <button className={cx('rounded-lg border border-[#E5E7EB] bg-white px-3.5 py-2 text-[13px] text-[#4B5563]', actionsDisabled ? 'cursor-not-allowed opacity-50' : '')} disabled={actionsDisabled} onClick={(event) => guardAction(event)}>Comparar</button>
 <button
 className={cx('grid h-9 w-9 place-items-center rounded-full border border-[#D1D5DB] text-[#374151]', actionsDisabled ? 'cursor-not-allowed opacity-50' : '')}
 disabled={actionsDisabled}
 onClick={() => setShowHeaderMenu((prev) => !prev)}
 >
 <MoreHorizontal className="h-[18px] w-[18px]" />
 </button>
 {showHeaderMenu && (
 <div className="absolute right-0 top-11 z-30 w-40 rounded-lg border border-[#E5E7EB] bg-white p-1.5 shadow-lg">
 <button className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-[12px] text-[#374151] hover:bg-[#F9FAFB]" onClick={(event) => guardAction(event)}>
 <Bell className="h-4 w-4" />
 Notificações
 </button>
 <button className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-[12px] text-[#374151] hover:bg-[#F9FAFB]" onClick={(event) => guardAction(event)}>
 <Share2 className="h-4 w-4" />
 Compartilhar
 </button>
 </div>
 )}
 </div>
 </div>

 <div className="mt-3 flex items-center gap-5 border-t border-[#E5E7EB] pt-2.5">
 {mainTabs.map((tab) => (
 <button
 key={tab}
 onClick={() => setActiveTab(tab)}
 className={cx(
 'pb-2 text-[13px] font-medium transition-colors duration-150',
 activeTab === tab ? 'border-b-2 border-[#9EDFD5] text-[#0B1220]' : 'text-[#6B7280] hover:text-[#374151]'
 )}
 >
 {tab === 'Mudancas'
 ? `O que mudou (90 dias) (${changesCount})`
 : tab === 'Eventos'
 ? `Agenda (próximos eventos) (${eventsCount})`
 : tab === 'Preço'
 ? 'Preço'
 : tab}
 </button>
 ))}
 </div>
 </header>

 <section className={cx('px-6 py-5 transition-opacity duration-150', contentVisible ? 'opacity-100' : 'opacity-0')}>
 {actionError && (
 <div className="mb-4 rounded-lg border border-[#FDE68A] bg-[#FFFBEB] px-3 py-2 text-[13px] text-[#B45309]">
 {actionError}
 </div>
 )}
 {showScoreInfo && (
 <div className="mb-4 rounded-xl border border-[#E8EAED] bg-white p-4">
 <div className="flex items-center justify-between">
 <h3 className="text-[14px] font-semibold text-[#111827]">Como calculamos o placar</h3>
 <button className="text-[12px] text-[#0E9384] hover:underline" onClick={() => setShowScoreInfo(false)}>Fechar</button>
 </div>
 <p className="mt-2 text-[12px] text-[#6B7280]">Pesos: Dívida 25%, Caixa 20%, Margens 20%, Retorno 20%, Proventos 15%.</p>
 <p className="mt-1 text-[12px] text-[#6B7280]">Status exibido conforme informado no endpoint de cada pilar.</p>
 <p className="mt-1 text-[12px] text-[#6B7280]">Fontes: CVM, B3 e RI da empresa.</p>
 </div>
 )}
 {evidenceModal && (
 <div className="mb-4 rounded-xl border border-[#E8EAED] bg-white p-4">
 <div className="flex items-center justify-between">
 <h3 className="text-[14px] font-semibold text-[#111827]">Painel de fonte {evidenceModal.pillarName}</h3>
 <button className="text-[12px] text-[#0E9384] hover:underline" onClick={() => setEvidenceModal(null)}>Fechar</button>
 </div>
 <div className="mt-3 inline-flex rounded-full bg-[#F9FAFB] p-1">
 {(['Fonte', 'Trecho', 'Como calculamos'] as EvidenceTab[]).map((tab) => (
 <button
 key={tab}
 onClick={() => setEvidenceTab(tab)}
 className={cx('rounded-full px-2.5 py-1 text-[11px]', evidenceTab === tab ? 'border border-[#99F6E4] bg-[#F0FDFA] font-semibold text-[#0E9384]' : 'text-[#6B7280]')}
 >
 {tab}
 </button>
 ))}
 </div>
 {evidenceTab === 'Fonte' && (
 <div className="mt-3 space-y-1 text-[12px] text-[#6B7280]">
 <p>Documento: {safeMeta(evidenceModal.evidence.source.docLabel)}</p>
 <p>Atualizado em: {safeMeta(evidenceModal.evidence.source.date)}</p>
 <a href={evidenceModal.evidence.source.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-[#0E9384] hover:underline">
 Abrir fonte externa
 <ExternalLink className="h-3.5 w-3.5" />
 </a>
 </div>
 )}
 {evidenceTab === 'Trecho' && (
 <div className="mt-3 rounded-md border border-[#E5E7EB] bg-[#F9FAFB] p-3 text-[12px] text-[#6B7280]">
 Trecho relevante: {evidenceModal.evidence.why}
 </div>
 )}
 {evidenceTab === 'Como calculamos' && (
 <div className="mt-3 space-y-1 text-[12px] text-[#6B7280]">
 <p>Fórmula base: valor atual vs histórico de 5 anos.</p>
 <p>Notas: sinalizamos ponto forte/atenção conforme direção do pilar.</p>
 <p>Limitações: sujeito a revisão após novo release da companhia.</p>
 </div>
 )}
 </div>
 )}
 {showSkeleton ? (
 <div className="space-y-4">
 <div className="grid grid-cols-12 gap-4">
 <div className="col-span-5 rounded-xl border border-[#E8EAED] bg-white p-5"><SkeletonBlock className="h-5 w-40" /><SkeletonBlock className="mt-4 h-[220px] w-full" /><SkeletonBlock className="mt-4 h-8 w-full" /></div>
 <div className="col-span-3 rounded-xl border border-[#E8EAED] bg-white p-5"><SkeletonBlock className="h-5 w-32" /><SkeletonBlock className="mt-6 h-8 w-24" /><SkeletonBlock className="mt-3 h-16 w-full" /></div>
 <div className="col-span-4 rounded-xl border border-[#E8EAED] bg-white p-5"><SkeletonBlock className="h-5 w-40" /><SkeletonBlock className="mt-6 h-8 w-20" /><SkeletonBlock className="mt-3 h-16 w-full" /></div>
 </div>
 <div className="rounded-xl border border-[#E8EAED] bg-white p-5"><SkeletonBlock className="h-5 w-48" /><SkeletonBlock className="mt-4 h-4 w-full" /><SkeletonBlock className="mt-2 h-4 w-10/12" /><SkeletonBlock className="mt-4 h-9 w-56" /></div>
 </div>
 ) : activePayload?.status === 'empty' ? (
 <article className="rounded-xl border border-[#E8EAED] bg-white p-5">
 <h2 className="text-[15px] font-semibold text-[#111827]">Sem dados ainda para está empresa (em ingestão)</h2>
 </article>
 ) : (
 <>
{activeTab === 'Resumo' && (
<div className="space-y-4">
<article className="rounded-xl border border-[#E8EAED] bg-white p-5">
 <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#6B7280]">Diagnóstico rápido</p>
 <h2 className="mt-2 text-[20px] font-semibold leading-tight text-[#0B1220]">
 {activeData?.diagnosisHeadline ?? 'A empresa permanece estruturalmente saudável, com um ponto de atenção concentrado em dívida.'}
 </h2>
 <p className="mt-2 text-[13px] text-[#6B7280]">Entenda o que sustenta a empresa hoje, o que mudou e o que vale monitorar daqui para frente.</p>
 <div className="mt-4 flex flex-wrap items-center gap-2">
 <button
 className="rounded-lg border border-[#0E9384] bg-[#0E9384] px-3.5 py-2 text-[13px] font-semibold text-white"
 onClick={() => goToPillar(activeData?.strongest.title ?? 'Divida')}
 >
 Ver principal força
 </button>
 <button
 className="rounded-lg border border-[#F6DEA9] bg-[#FFFBEB] px-3.5 py-2 text-[13px] font-semibold text-[#9A6A0F]"
 onClick={() => goToPillar(activeData?.watchout.title ?? 'Margens')}
 >
 Ver principal atenção
 </button>
 </div>
 </article>

 <div className="grid grid-cols-12 gap-4">
 <div className="col-span-12 space-y-4 xl:col-span-8">
 <article className="rounded-xl border border-[#E8EAED] border-l-[3px] border-l-[#0E9384] bg-white p-4">
 <div className="flex items-center gap-2">
 <BarChart3 className="h-4 w-4 text-[#0E9384]" />
 <h3 className="text-[14px] font-semibold text-[#111827]">Principal Força</h3>
 </div>
 <div className="mt-4">
 <p className="text-[24px] font-bold text-[#0E9384]">{activeData?.strongest.title ?? 'Divida'}</p>
 <p className="mt-3 text-[14px] leading-relaxed text-[#4B5563]">
 {strongestHumanLine}
 </p>
 <div className="mt-3 flex flex-wrap items-center gap-2 text-[12px]">
 <span className="rounded-full border border-[#D1D5DB] bg-white px-2.5 py-1 font-semibold text-[#374151]">{activeData?.strongest.score ?? '95/100'}</span>
 <span className="rounded-full border border-[#99F6E4] bg-[#F0FDFA] px-2.5 py-1 font-semibold text-[#0E9384]">{activeData?.strongest.badge ?? ''}</span>
 <span className="rounded-full border border-[#E5E7EB] bg-[#F9FAFB] px-2.5 py-1 text-[#6B7280]">Variação: {activeData?.strongest.trend ?? 'estável'}</span>
 </div>
 <div className="mt-3 flex items-center gap-2">
 <button className="rounded-md border border-[#E5E7EB] px-3 py-1.5 text-[12px] text-[#6B7280]" onClick={() => goToPillar(activeData?.strongest.title ?? 'Caixa')}>
 Ver pilar
 </button>
 <button className="rounded-md border border-[#E5E7EB] px-3 py-1.5 text-[12px] text-[#6B7280]" onClick={() => goToPillar(activeData?.strongest.title ?? 'Caixa', true)}>
 Ver fonte
 </button>
 </div>
 </div>
 </article>

 <article className="rounded-xl border border-[#E8EAED] border-l-[3px] border-l-[#F59E0B] bg-white p-4">
 <div className="flex items-center gap-2">
 <TriangleAlert className="h-4 w-4 text-[#D97706]" />
 <h3 className="text-[14px] font-semibold text-[#111827]">Principal Atenção</h3>
 </div>
 <div className="mt-4">
 <p className="text-[24px] font-bold text-[#D97706]">{activeData?.watchout.title ?? 'Margens'}</p>
 <p className="mt-3 text-[14px] leading-relaxed text-[#4B5563]">
 {watchoutHumanLine}
 </p>
 <div className="mt-3 flex flex-wrap items-center gap-2 text-[12px]">
 <span className="rounded-full border border-[#D1D5DB] bg-white px-2.5 py-1 font-semibold text-[#374151]">{activeData?.watchout.score ?? '61/100'}</span>
 <span className="rounded-full border border-[#FDE68A] bg-[#FFFBEB] px-2.5 py-1 font-semibold text-[#D97706]">{watchoutBadgeLabel}</span>
 <span className="rounded-full border border-[#E5E7EB] bg-[#F9FAFB] px-2.5 py-1 text-[#6B7280]">Variação: {activeData?.watchout.trend ?? 'piora'}</span>
 </div>
 <div className="mt-3 flex items-center gap-2">
 <button className="rounded-md border border-[#E5E7EB] px-3 py-1.5 text-[12px] text-[#6B7280]" onClick={() => goToPillar(activeData?.watchout.title ?? 'Divida')}>
 Ver pilar
 </button>
 <button className="rounded-md border border-[#E5E7EB] px-3 py-1.5 text-[12px] text-[#6B7280]" onClick={() => goToPillar(activeData?.watchout.title ?? 'Divida', true)}>
 Ver fonte
 </button>
 </div>
 </div>
 </article>

 </div>

 <article className="col-span-12 rounded-xl border border-[#E8EAED] bg-white p-5 xl:col-span-4">
 <div className="flex items-center justify-between">
 <h2 className="text-[15px] font-semibold text-[#111827]">Mapa dos 5 pilares</h2>
 <button className="text-[11px] text-[#667085] hover:text-[#475467] hover:underline" onClick={() => setShowScoreInfo(true)}>
 Como calculamos
 </button>
 </div>
 <p className="mt-1 text-[12px] text-[#667085]">Visão geral para apoiar a leitura inicial, sem substituir o diagnóstico.</p>
 <div className="mt-2">
 <PillarMap
 data={mapPillarData}
 companyStatus={companyStatus}
 onSelectPillar={(pillar) => goToPillar(pillar)}
 />
 </div>
 <p className="mt-3 rounded-lg border border-[#E5E7EB] bg-[#F9FAFB] px-3 py-2 text-[12px] text-[#475467]">
 Atenção principal em {activeData?.watchout.title ?? 'Margens'}; força relativa em {activeData?.strongest.title ?? 'Dívida'}.
 </p>
 </article>
 </div>

 <article className="rounded-xl border border-[#E8EAED] bg-white p-4">
 <div className="flex items-center justify-between">
 <div>
 <h2 className="text-[15px] font-semibold text-[#111827]">Resumo em 60s</h2>
 <p className="text-[12px] text-[#9CA3AF]">Uma visão simples do que sustenta a empresa hoje e do que merece acompanhamento.</p>
 </div>
 <button className="text-[12px] text-[#0E9384] hover:underline" onClick={openSummaryEvidence}>Ver fonte</button>
 </div>
 <p className="mt-4 text-[14px] leading-relaxed text-[#1F2937]">
 {summaryNarrative}
 </p>
 <div className="mt-3 space-y-1 text-[13px] text-[#374151]">
 <p><span className="font-semibold">Força principal:</span> {activeData?.summaryScan.strength.pillar ?? activeData?.strongest.title ?? 'Dívida'}</p>
 <p><span className="font-semibold">Atenção principal:</span> {activeData?.summaryScan.attention.pillar ?? activeData?.watchout.title ?? 'Margens'}</p>
 <p><span className="font-semibold">O que monitorar:</span> {activeData?.summaryScan.monitor.text ?? 'Evolução das margens no próximo fechamento.'}</p>
 </div>
 <div className="mt-3 flex flex-wrap items-center gap-2 text-[11px]">
 <span className="rounded-full bg-[#F3F4F6] px-2.5 py-1 text-[#6B7280]">Atualizado em {safeMeta(activeData?.summaryMeta.updatedAt)}</span>
 <span className="rounded-full bg-[#F3F4F6] px-2.5 py-1 text-[#6B7280]">Fonte: {safeMeta(activeData?.summaryMeta.source)}</span>
 <span className="rounded-full border border-[#99F6E4] bg-[#F0FDFA] px-2.5 py-1 text-[#0E9384]">Confiança: Alta</span>
 </div>
 </article>

 <article className="rounded-xl border border-[#D6F5EE] bg-[#F4FFFC] p-5">
 <div className="flex items-center justify-between gap-3">
 <h2 className="text-[15px] font-semibold text-[#111827]">Próximas ações</h2>
 <button className="text-[12px] text-[#0E9384] hover:underline" onClick={openSummaryEvidence}>Ver fonte</button>
 </div>
 <p className="mt-1 text-[12px] text-[#667085]">Feche a leitura com um próximo passo útil e verificável.</p>
 <div className="mt-3 flex flex-wrap items-center gap-2">
 <button className={cx('rounded-lg border border-[#0E9384] bg-[#0E9384] px-3.5 py-2 text-[13px] font-semibold text-white', actionsDisabled ? 'cursor-not-allowed opacity-50' : '')} disabled={actionsDisabled} onClick={(event) => guardAction(event)}>
 Criar alerta da principal atenção
 </button>
 <button className="rounded-lg border border-[#E5E7EB] bg-white px-3.5 py-2 text-[13px] font-medium text-[#1F2937]" onClick={() => setActiveTab('Pilares')}>
 Ver pilares completos
 </button>
 <button className={cx('rounded-lg border border-[#E5E7EB] bg-white px-3.5 py-2 text-[13px] font-medium text-[#1F2937]', actionsDisabled ? 'cursor-not-allowed opacity-50' : '')} disabled={actionsDisabled} onClick={(event) => guardAction(event)}>
 Comparar com outra empresa
 </button>
 </div>
 </article>
 </div>
 )}

 {activeTab === 'Pilares' && (
 <div className="space-y-3">
 <article className="rounded-xl border border-[#E8EAED] bg-white p-4">
 <h2 className="text-[15px] font-semibold text-[#111827]">Síntese do diagnóstico por pilares</h2>
 <p className="mt-1 text-[13px] text-[#6B7280]">
 {healthyPillars.length} pilares saudáveis, {attentionPillars.length} em atenção e {riskPillars.length} em risco.
 </p>
 <div className="mt-3 flex flex-wrap gap-2 text-[12px] text-[#374151]">
 <span className="rounded-full border border-[#E5E7EB] bg-[#F9FAFB] px-2.5 py-1">Principal risco: {mostCriticalPillar ? pillarLabel(mostCriticalPillar.pillar) : ''}</span>
 <span className="rounded-full border border-[#E5E7EB] bg-[#F9FAFB] px-2.5 py-1">Principal sustentação: {strongestPillar ? pillarLabel(strongestPillar.pillar) : ''}</span>
 </div>
 </article>
 {(activeData?.pillars ?? []).filter((p) => p.companyId === companyContext.companyId).length === 0 && (
 <article className="rounded-xl border border-[#E8EAED] bg-white p-5">
 <p className="text-[14px] text-[#6B7280]">Ainda não temos dados suficientes para este indicador.</p>
 <p className="mt-1 text-[12px] text-[#9CA3AF]">Última tentativa: {safeMeta(activeData?.summaryMeta.updatedAt)}</p>
 <p className="text-[12px] text-[#9CA3AF]">Fonte esperada: CVM/RI</p>
 </article>
 )}
 {(activeData?.pillars ?? []).filter((pillar) => pillar.companyId === companyContext.companyId).map((pillar) => {
 const expanded = expandedPillars[pillar.name];
 const windowSize = windowByPillar[pillar.name];
 const values = windowSize === '5a' ? pillar.chart.series5 : pillar.chart.series10;
 const labels = windowSize === '5a' ? pillar.chart.years5 : pillar.chart.years10;
 const chartTone = pillar.status === 'Saudavel' ? 'teal' : 'amber';
 const accent = pillar.status === 'Saudavel' ? 'border-l-[#0E9384]' : pillar.status === 'Atencao' ? 'border-l-[#F59E0B]' : 'border-l-[#DC2626]';
 const pillarName = pillarLabel(pillar.name);
 const deltaLabel = formatDeltaForPillar(pillar.trend);
 const normalizedChartTitle = _normalizeSemanticText(pillar.chart.title);
 const baseMetric = pillar.name === 'Proventos'
 ? (
  pillar.metrics.find((metric) => {
   const normalizedLabel = _normalizeSemanticText(metric.label);
   if (!normalizedLabel) return false;
   if (normalizedChartTitle.includes('acao')) return normalizedLabel.includes('acao');
   if (normalizedChartTitle.includes('payout')) return normalizedLabel.includes('payout');
   if (normalizedChartTitle.includes('yield')) return normalizedLabel.includes('yield');
   return false;
  }) ?? pillar.metrics[0]
 )
 : pillar.metrics[0];
 const baseMetricValue = baseMetric ? toNumeric(baseMetric.value) : null;
 const baseMetricRef = median(pillar.chart.series5);
 const todayText = formatComparableValue(baseMetricValue, baseMetric?.value ?? '', baseMetric?.label);
 const evidenceHeadline = metricValueLabel(baseIndicatorLabel(pillar, baseMetric, baseMetricValue), todayText, pillar.name);
 const referenceText = formatComparableValue(baseMetricRef, baseMetric?.value ?? '', baseMetric?.label);
 const indicatorLabel = baseIndicatorLabel(pillar, baseMetric, baseMetricValue);
 const verdictLine = verdictSummary(pillar, todayText, referenceText);
 const monitorItems = monitorItemsFromPillar(pillar);
 const mainEvidence = pillar.evidences.find((item) => item.title === pillar.primarySignal?.title)
  ?? pillar.evidences.find((item) => {
   const label = String(item.label).toLowerCase();
   return label.includes('suporte') || label.includes('forte') || label.includes('press');
  })
  ?? pillar.evidences[0];
 const ctaCopy = ctaCopyByPillar(pillar);
 const signalCopy = signalCardCopy(pillar, indicatorLabel, mainEvidence?.why ?? '');
 const whatItMeans = meaningCopy(pillar, mainEvidence?.why ?? signalCopy.why);
 const mainEvidenceSource = evidenceSourceText(mainEvidence, pillar);
 const chartVariant: 'line' | 'bar' = 'line';

 return (
 <article id={`pillar-${pillar.name}`} key={pillar.name} className={cx('rounded-xl border border-[#E8EAED] border-l-[3px] bg-white p-5', accent)}>
 <button
 onClick={() => {
 const isCurrentlyOpen = expandedPillars[pillar.name];
 if (isCurrentlyOpen) {
 setExpandedPillars({
 Divida: false,
 Caixa: false,
 Margens: false,
 Retorno: false,
 Proventos: false,
 });
 return;
 }
 setExpandedPillars({
 Divida: pillar.name === 'Divida',
 Caixa: pillar.name === 'Caixa',
 Margens: pillar.name === 'Margens',
 Retorno: pillar.name === 'Retorno',
 Proventos: pillar.name === 'Proventos',
 });
 }}
 className="flex w-full items-start justify-between text-left"
 >
 <div>
 <div className="flex flex-wrap items-center gap-2">
 <h2 className="text-[17px] font-bold text-[#111827]">{pillarName}</h2>
 <span className={cx('rounded-full border px-2.5 py-1 text-[12px] font-semibold', statusTone[pillar.status].badge)}>{statusLabel(pillar.status)}</span>
 <span className="text-[12px] text-[#6B7280]">{deltaLabel}</span>
 <span className="text-[10px] font-normal tracking-tight text-[#E2E8F0]">Score {pillar.score}/100</span>
 </div>
 <p className="mt-2 text-[14px] text-[#374151]">{verdictLine}</p>
 <p className="mt-1 text-[12px] text-[#9CA3AF]">Fonte: {pillar.trust.source} | Atualizado em {pillar.trust.updatedAt} | Status: {pillar.trust.status}</p>
 </div>
 <div className="ml-3 flex items-center">
 <span className="text-[#6B7280] transition-transform duration-200">{expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}</span>
 </div>
 </button>

 <div className={cx('overflow-hidden transition-all duration-300', expanded ? 'max-h-[1800px] opacity-100' : 'max-h-0 opacity-0')}>
 <div className="my-4 border-t border-[#F3F4F6]" />
 <div className="space-y-2.5">
 <section className="rounded-lg border border-[#E8EAED] bg-[#FCFDFD] p-2.5">
 <div className="grid gap-2.5 lg:grid-cols-2">
 <div>
 <p className="text-[12px] font-semibold text-[#475569]">Evidência principal</p>
 <p className="mt-1 text-[13px] text-[#6B7280]">Indicador-base: {indicatorLabel}</p>
 <p className="mt-2 text-[28px] font-bold text-[#111827]">{evidenceHeadline}</p>
 <p className="text-[12px] text-[#6B7280]">Data: {baseMetric?.source.date ?? pillar.trust.updatedAt}</p>
 <p className="mt-2 text-[13px] text-[#1F2937]"><span className="font-semibold text-[#0F172A]">Referência de 5 anos:</span> <span className="font-medium">{referenceText}</span></p>
 {baseMetricReadingHint(pillar, baseMetric) && (
  <p className="mt-1 text-[12px] text-[#6B7280]">Como ler: {baseMetricReadingHint(pillar, baseMetric)}</p>
 )}
 </div>
 <div>
 <div className="mb-2 flex justify-end">
 <div className="inline-flex rounded-full bg-[#F9FAFB] p-1">
 {(['5a', '10a'] as WindowSize[]).map((windowOption) => (
 <button
 key={windowOption}
 onClick={() => setWindowByPillar((prev) => ({ ...prev, [pillar.name]: windowOption }))}
 className={cx('rounded-full px-2.5 py-1 text-[11px]', windowSize === windowOption ? 'border border-[#99F6E4] bg-[#F0FDFA] font-semibold text-[#0E9384]' : 'text-[#6B7280]')}
 >
 {windowOption}
 </button>
 ))}
 </div>
 </div>
 <MiniLineChart
 values={values}
 labels={labels}
 tone={chartTone}
 highlightIndex={values.length - 1}
 variant={chartVariant}
 referenceValue={baseMetricRef}
 referenceLabel="Ref. histórica"
 />
 </div>
 </div>
 </section>

 <section className="rounded-lg border border-[#E8EAED] bg-white p-2.5">
 <h3 className="text-[13px] font-semibold text-[#111827]">O que isso significa</h3>
 <p className="mt-1 text-[14px] text-[#4B5563]">{whatItMeans}</p>
 </section>

 <section className="rounded-lg border border-[#E8EAED] bg-white p-2.5">
 <h3 className="text-[13px] font-semibold text-[#111827]">O que monitorar daqui para frente</h3>
 <ul className="mt-2 space-y-1.5 text-[14px] text-[#4B5563]">
 {monitorItems.map((item) => (
 <li key={item} className="flex items-start gap-2">
 <span className="mt-[7px] h-1.5 w-1.5 rounded-full bg-[#64748B]" />
 <span>{item}</span>
 </li>
 ))}
 </ul>
 </section>

 {mainEvidence && (
<section className="rounded-lg border border-[#E8EAED] bg-white p-2.5">
<h3 className="text-[13px] font-semibold text-[#111827]">Sinal principal</h3>
<div
 className={cx(
 'mt-2 rounded-lg border p-2.5',
 signalCopy.badgeTone === 'risk'
 ? 'border-[#FECACA] bg-[#FEF2F2]'
 : signalCopy.badgeTone === 'attention'
 ? 'border-[#FDE68A] bg-[#FFFBEB]'
 : 'border-[#D6F5EE] bg-[#F4FFFC]'
 )}
>
{signalCopy.badgeLabel && (
 <span
  className={cx(
  'rounded-full border px-2.5 py-1 text-[12px] font-semibold',
  signalCopy.badgeTone === 'risk'
  ? 'border-[#DC2626] bg-[#DC2626] text-white'
  : signalCopy.badgeTone === 'attention'
  ? 'border-[#F59E0B] bg-[#F59E0B] text-white'
  : 'border-[#99F6E4] bg-[#F0FDFA] text-[#0E9384]'
  )}
 >
 {signalCopy.badgeLabel}
 </span>
)}
 <p className="mt-2 text-[14px] font-semibold text-[#111827]">{signalCopy.title}</p>
 <p className="mt-1 text-[13px] text-[#4B5563]">{signalCopy.body}</p>
 {signalCopy.why && <p className="mt-1 text-[13px] text-[#4B5563]">Por que importa: {signalCopy.why}</p>}
 <div className="mt-2 flex items-center justify-between">
 <span className="text-[12px] text-[#94A3B8]">Fonte: {mainEvidenceSource}</span>
 <button
 onClick={(event) => {
 if (guardAction(event, mainEvidence.companyId)) return;
 setEvidenceModal({ pillarName: pillar.name, evidence: mainEvidence });
 setEvidenceTab('Fonte');
 }}
 className={cx('text-[13px] text-[#0E9384] hover:underline', actionsDisabled ? 'cursor-not-allowed opacity-50' : '')}
 disabled={actionsDisabled || mainEvidence.companyId !== companyContext.companyId}
 >
 Ver fonte
 </button>
 </div>
 </div>
 </section>
 )}

 {(ctaCopy.title || ctaCopy.button) && (
 <section className="rounded-lg border border-[#D6F5EE] bg-[#F4FFFC] p-2.5">
 <p className="text-[13px] text-[#374151]">{ctaCopy.title}</p>
 <button className={cx('mt-2 rounded-md border border-[#0E9384] bg-[#0E9384] px-3 py-1.5 text-[13px] font-semibold text-white', actionsDisabled ? 'cursor-not-allowed opacity-50' : '')} disabled={actionsDisabled} onClick={(event) => guardAction(event, pillar.companyId)}>
 {ctaCopy.button}
 </button>
 </section>
 )}
 </div>
 </div>
 </article>
 );
 })}
 <p className="py-2 text-center text-[13px] text-[#6B7280]">Sentiu falta de algum indicador? <button type="button" className={cx('text-[12px] font-medium text-[#0E9384] hover:underline', actionsDisabled ? 'cursor-not-allowed opacity-50' : '')} disabled={actionsDisabled} onClick={(event) => guardAction(event)}>Sugerir indicador</button></p>
 </div>
 )}

 {activeTab === 'Mudancas' && (
 <div>
 <section className="mb-4 rounded-xl border border-[#DDE3EA] bg-white p-4">
  <h2 className="text-[15px] font-semibold text-[#111827]">O que mudou ({changesWindow})</h2>
  <p className="mt-1 text-[13px] text-[#5B6472]">Vejá o que teve impacto real, o que foi rotina e quais pilares foram mais afetados.</p>
 <div className="mt-3 border-t border-[#EEF2F6] pt-3">
  <p className="text-[12px] font-semibold uppercase tracking-wide text-[#64748B]">Resumo do período</p>
  <p className="mt-2 max-w-[840px] text-[13px] leading-relaxed text-[#374151]">
   {changesSummaryText}
  </p>
  <div className="mt-2 space-y-1.5 text-[13px] text-[#374151]">
   <p className="font-semibold text-[#0F766E]">Pilar mais afetado: {periodMostAffected}</p>
   <p>Mudanças estruturais: {structuralCount}</p>
   <p>Atualizações de rotina: {routineCount}</p>
  </div>
  </div>
 </section>
<div className="mb-4 space-y-2">
  <div className="flex flex-wrap items-center gap-2">
  {(['30 dias', '60 dias', '90 dias'] as FeedWindow[]).map((period) => (
   <button key={period} onClick={() => setChangesWindow(period)} className={cx('h-7 rounded-full px-3.5 text-[13px]', period === changesWindow ? 'border border-[#DDE3EA] bg-white font-semibold text-[#111827]' : 'text-[#6B7280]')}>
   {period}
   </button>
  ))}
  </div>
  <div className="flex flex-wrap items-center gap-2">
  {changesFocusFilters.map((filter) => (
   <button
   key={filter}
   onClick={() => setChangesFocus(filter)}
   className={cx('rounded-full border px-3 py-1.5 text-[12px]', changesFocus === filter ? 'border-[#0E9384] bg-[#F0FDFA] font-semibold text-[#0E9384]' : 'border-[#DDE3EA] bg-white text-[#5B6472]')}
   >
   {filter}
   </button>
  ))}
  </div>
  <div className="flex items-center gap-2">
   <label htmlFor="changes-pillar-filter" className="text-[12px] font-medium text-[#5B6472]">Por pilar:</label>
   <select
   id="changes-pillar-filter"
   value={changesPillarFilter}
   onChange={(event) => setChangesPillarFilter(event.target.value as ChangePillarTag | 'Todos')}
   className="rounded-md border border-[#DDE3EA] bg-white px-2.5 py-1.5 text-[12px] text-[#334155]"
   >
   {availablePillarsForFilter.map((pillar) => (
    <option key={pillar} value={pillar}>{pillar}</option>
   ))}
   </select>
  </div>
 </div>

 {principalChange && (
 <section className="mb-4 rounded-xl border border-[#F6C9BF] bg-[#FFF7F5] p-3">
  <div className="flex items-end justify-between gap-3">
  <div>
   <p className="text-[12px] font-semibold uppercase tracking-wide text-[#9F4636]">Principal mudança do período</p>
   <p className="mt-1 text-[13px] text-[#1F2937]">
   {`${principalChange.title}, com possível efeito no pilar de ${principalChange.pillar} nos próximos fechamentos.`}
   </p>
  </div>
  <button
  className={cx('whitespace-nowrap rounded-md border border-[#0E9384] bg-[#0E9384] px-2.5 py-1.5 text-[12px] font-semibold text-white', actionsDisabled ? 'cursor-not-allowed opacity-50' : '')}
  disabled={actionsDisabled}
  onClick={(event) => {
   if (guardAction(event, principalChange.companyId)) return;
   if (principalChange.pillar !== 'A classificar') goToPillar(principalChange.pillar);
  }}
  >
  Ver impacto no pilar
  </button>
  </div>
 </section>
 )}

 <div className="space-y-3">
  {!hasVisibleChanges && (
  <article className="rounded-xl border border-[#E8EAED] bg-white p-4">
   <p className="text-[13px] text-[#5B6472]">Sem eventos para os filtros atuais. Ajuste os filtros para ampliar o contexto.</p>
   <p className="mt-1 text-[11px] text-[#9CA3AF]">Última atualização: {safeMeta(activeData?.summaryMeta.updatedAt)}</p>
  </article>
  )}

  {displayedStructural.length > 0 && (
  <section className="space-y-2">
   <p className="text-[12px] font-semibold uppercase tracking-wide text-[#9F4636]">Mudanças estruturais</p>
   {displayedStructural.map((change) => renderChangeCard(change))}
  </section>
  )}

  {displayedRelevant.length > 0 && (
  <section className="space-y-2">
   <p className="text-[12px] font-semibold uppercase tracking-wide text-[#9A6A0F]">Mudanças relevantes</p>
   {displayedRelevant.map((change) => renderChangeCard(change))}
  </section>
  )}

  {displayedRoutine.length > 0 && (
  <section className="space-y-2">
   <p className="text-[12px] font-semibold uppercase tracking-wide text-[#0F6F61]">Nível 3 | Rotina</p>
   {displayedRoutine.map((item) => {
   if (item.type === 'single') return renderChangeCard(item.payload);
   const isOpen = Boolean(expandedRoutineGroups[item.payload.groupKey]);
   return (
    <article key={item.payload.groupKey} className="rounded-xl border border-[#DDE3EA] bg-white p-4">
    <p className="text-[15px] font-semibold text-[#111827]">{item.payload.groupTitle}</p>
    <p className="mt-2 text-[13px] text-[#475569]">{item.payload.summary}</p>
    <p className="mt-2 text-[12px] text-[#5B6472]">Pilar afetado: {item.payload.pillar}</p>
    <div className="mt-3 flex flex-wrap items-center gap-2">
     <button
     className={cx('rounded-md border border-[#0E9384] bg-[#0E9384] px-3 py-1.5 text-[12px] font-semibold text-white', actionsDisabled ? 'cursor-not-allowed opacity-50' : '')}
     disabled={actionsDisabled}
     onClick={(event) => {
      if (guardAction(event, item.payload.items[0].companyId)) return;
      if (item.payload.pillar !== 'A classificar') goToPillar(item.payload.pillar);
     }}
     >
     Ver impacto no pilar
     </button>
     <button
     className="inline-flex items-center gap-1 rounded-md border border-[#DDE3EA] px-3 py-1.5 text-[12px] text-[#5B6472]"
     onClick={() => setExpandedRoutineGroups((prev) => ({ ...prev, [item.payload.groupKey]: !isOpen }))}
     >
     Ver eventos
     {isOpen ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
     </button>
    </div>
    {isOpen && <div className="mt-3 space-y-2">{item.payload.items.map((change) => renderChangeCard(change, true))}</div>}
    </article>
   );
   })}
  </section>
  )}
 </div>
 </div>
 )}

 {activeTab === 'Eventos' && (
 <div>
 <section className="mb-4 rounded-xl border border-[#DDE3EA] bg-white p-4">
  <h2 className="text-[15px] font-semibold text-[#111827]">Agenda (próximos eventos) ({eventsWindow})</h2>
  <p className="mt-1 text-[13px] text-[#5B6472]">Vejá o que pode ter impacto real, o que e rotina e quais pilares podem ser mais afetados.</p>
  <div className="mt-3 border-t border-[#EEF2F6] pt-3">
  <p className="text-[12px] font-semibold uppercase tracking-wide text-[#64748B]">Resumo do período</p>
  <p className="mt-2 max-w-[840px] text-[13px] leading-relaxed text-[#374151]">
   {principalTimelineChange
   ? `${buildTimelineHeadlineLine({ title: principalTimelineChange.title, typeLabel: principalTimelineChange.typeLabel, mainPillar: principalTimelineChange.mainPillar }, eventsWindow)} Fora isso, o período traz eventos mais recorrentes, sem outro gatilho dominante na leitura geral.`
   : `Nos próximos ${eventsWindow.replace(' dias', '')} dias, a agenda está concentrada em eventos de acompanhamento, sem gatilho dominante previsto.`}
  </p>
  <div className="mt-2 space-y-1.5 text-[13px] text-[#374151]">
   <p className="font-semibold text-[#0F766E]">Pilar mais sensivel: {timelineMostAffectedPillar}</p>
   <p>Gatilhos principais: {timelineStructuralCount}</p>
   <p>Atualizações de rotina: {timelineRoutineCount}</p>
  </div>
  </div>
 </section>

 <div className="mb-4 space-y-2">
  <div className="flex flex-wrap items-center gap-2">
  {(['30 dias', '60 dias', '90 dias'] as FeedWindow[]).map((period) => (
   <button key={period} onClick={() => setEventsWindow(period)} className={cx('h-7 rounded-full px-3.5 text-[13px]', period === eventsWindow ? 'border border-[#DDE3EA] bg-white font-semibold text-[#111827]' : 'text-[#6B7280]')}>
   {period}
   </button>
  ))}
  </div>
  <div className="flex flex-wrap items-center gap-2">
  {eventsFocusFilters.map((filter) => (
   <button
   key={filter}
   onClick={() => setEventsFocus(filter)}
   className={cx('rounded-full border px-3 py-1.5 text-[12px]', eventsFocus === filter ? 'border-[#0E9384] bg-[#F0FDFA] font-semibold text-[#0E9384]' : 'border-[#DDE3EA] bg-white text-[#5B6472]')}
   >
   {filter}
   </button>
  ))}
  </div>
  <div className="flex items-center gap-2">
   <label htmlFor="events-pillar-filter" className="text-[12px] font-medium text-[#5B6472]">Por pilar:</label>
   <select
   id="events-pillar-filter"
   value={eventsPillarFilter}
   onChange={(event) => setEventsPillarFilter(event.target.value as ChangePillarTag | 'Todos')}
   className="rounded-md border border-[#DDE3EA] bg-white px-2.5 py-1.5 text-[12px] text-[#334155]"
   >
   {availablePillarsForFilter.map((pillar) => (
    <option key={pillar} value={pillar}>{pillar}</option>
   ))}
   </select>
  </div>
 </div>

 {principalTimelineChange && (
 <section className="mb-4 rounded-xl border border-[#F6C9BF] bg-[#FFF7F5] p-3">
  <div className="flex items-end justify-between gap-3">
  <div>
   <p className="text-[12px] font-semibold uppercase tracking-wide text-[#9F4636]">Principal mudança do período</p>
   <p className="mt-1 text-[13px] text-[#1F2937]">
   {`${principalTimelineChange.title}, com possível efeito no pilar de ${principalTimelineChange.mainPillar} nos próximos fechamentos.`}
   </p>
  </div>
  <button
  className={cx('whitespace-nowrap rounded-md border border-[#0E9384] bg-[#0E9384] px-2.5 py-1.5 text-[12px] font-semibold text-white', actionsDisabled ? 'cursor-not-allowed opacity-50' : '')}
  disabled={actionsDisabled}
  onClick={(event) => {
   if (guardAction(event, principalTimelineChange.companyId)) return;
   if (principalTimelineChange.mainPillar !== 'A classificar') goToPillar(principalTimelineChange.mainPillar);
  }}
  >
  Ver impacto no pilar
  </button>
  </div>
 </section>
 )}

 <div className="space-y-3">
  {!hasVisibleTimelineEvents && (
  <article className="rounded-xl border border-[#E8EAED] bg-white p-4">
   <p className="text-[13px] text-[#5B6472]">Sem eventos para os filtros atuais. Ajuste os filtros para ampliar o contexto.</p>
   <p className="mt-1 text-[11px] text-[#9CA3AF]">Última atualização: {safeMeta(activeData?.summaryMeta.updatedAt)}</p>
  </article>
  )}

  {displayedTimelineStructural.length > 0 && (
  <section className="space-y-2">
   <p className="text-[12px] font-semibold uppercase tracking-wide text-[#9F4636]">Gatilhos principais</p>
   {displayedTimelineStructural.map((timelineEvent) => renderAgendaEventCard(timelineEvent))}
  </section>
  )}

  {displayedTimelineRelevant.length > 0 && (
  <section className="space-y-2">
   <p className="text-[12px] font-semibold uppercase tracking-wide text-[#9A6A0F]">Eventos relevantes</p>
   {displayedTimelineRelevant.map((timelineEvent) => renderAgendaEventCard(timelineEvent))}
  </section>
  )}

  {displayedTimelineRoutine.length > 0 && (
  <section className="space-y-2">
   <p className="text-[12px] font-semibold uppercase tracking-wide text-[#0F6F61]">Nível 3 | Rotina</p>
   {displayedTimelineRoutine.map((item) => {
   if (item.type === 'single') return renderAgendaEventCard(item.payload);
   const isOpen = Boolean(expandedEventRoutineGroups[item.payload.groupKey]);
   return (
    <article key={item.payload.groupKey} className="rounded-xl border border-[#DDE3EA] bg-white p-4">
    <p className="text-[15px] font-semibold text-[#111827]">{item.payload.groupTitle}</p>
    <p className="mt-2 text-[13px] text-[#475569]">{item.payload.summary}</p>
    <p className="mt-2 text-[12px] text-[#5B6472]">Pilar afetado: {item.payload.pillar}</p>
    <div className="mt-3 flex flex-wrap items-center gap-2">
     <button
     className={cx('rounded-md border border-[#0E9384] bg-[#0E9384] px-3 py-1.5 text-[12px] font-semibold text-white', actionsDisabled ? 'cursor-not-allowed opacity-50' : '')}
     disabled={actionsDisabled}
     onClick={(event) => {
      if (guardAction(event, item.payload.items[0].companyId)) return;
      if (item.payload.pillar !== 'A classificar') goToPillar(item.payload.pillar);
     }}
     >
     Ver impacto no pilar
     </button>
     <button
     className="inline-flex items-center gap-1 rounded-md border border-[#DDE3EA] px-3 py-1.5 text-[12px] text-[#5B6472]"
     onClick={() => setExpandedEventRoutineGroups((prev) => ({ ...prev, [item.payload.groupKey]: !isOpen }))}
     >
     Ver eventos
     {isOpen ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
     </button>
    </div>
    {isOpen && <div className="mt-3 space-y-2">{item.payload.items.map((timelineEvent) => renderAgendaEventCard(timelineEvent, true))}</div>}
    </article>
   );
   })}
  </section>
  )}

  {hasVisibleTimelineEvents && (
  <section className="rounded-xl border border-[#D6F5EE] bg-[#F4FFFC] p-4">
   <p className="text-[13px] text-[#1F2937]">Feche a leitura com o próximo passo: acompanhe o impacto esperado ou garanta lembrete dos principais gatilhos.</p>
   <div className="mt-3 flex flex-wrap items-center gap-2">
    <button
    className={cx('rounded-md border border-[#0E9384] bg-[#0E9384] px-3 py-1.5 text-[12px] font-semibold text-white', actionsDisabled ? 'cursor-not-allowed opacity-50' : '')}
    disabled={actionsDisabled}
    onClick={(event) => {
     if (guardAction(event, companyContext.companyId)) return;
     setActiveTab('Pilares');
    }}
    >
    Ver todos os impactos esperados nos pilares
    </button>
    <button
    className={cx('rounded-md border border-[#DDE3EA] bg-white px-3 py-1.5 text-[12px] font-medium text-[#374151]', actionsDisabled ? 'cursor-not-allowed opacity-50' : '')}
    disabled={actionsDisabled}
    onClick={(event) => guardAction(event, companyContext.companyId)}
    >
    Me lembrar dos principais gatilhos
    </button>
   </div>
  </section>
  )}
 </div>
 </div>
 )}

 {activeTab === 'Preço' && (
 <article className="rounded-xl border border-[#E8EAED] bg-white p-5">
 <div className="flex flex-wrap items-start justify-between gap-2">
 <div>
 <h2 className="text-[15px] font-semibold text-[#111827]">Preço vs valor estimado</h2>
 <p className="mt-1 text-[14px] text-[#64748B]">Leitura por cenário-base de valuation (DCF). Não é recomendação de compra ou venda.</p>
 </div>
 <div className="flex items-center gap-2">
 {valuationStateChipLabel && (
 <span className={cx('rounded-full border px-2.5 py-1 text-[14px] font-semibold', valuationStateChipTone)}>{valuationStateChipLabel}</span>
 )}
 <button
 type="button"
 onClick={(event) => {
 event.preventDefault();
 event.stopPropagation();
 setShowValuationMethodologyDrawer(true);
 }}
 className="relative z-10 inline-flex cursor-pointer items-center gap-1 rounded-md px-1.5 py-1 text-[12px] text-[#64748B] transition-colors hover:bg-[#F5F7FA] hover:text-[#334155]"
 aria-label="Aprender como calculamos o valuation"
 title="Aprender"
 >
 <CircleHelp className="h-3.5 w-3.5" />
 Aprender
 </button>
 </div>
 </div>
 <p className="mt-2 text-[14px] text-[#9CA3AF]">Fonte: {safeMeta(activeData?.priceData.source)} | Atualizado em: {safeMeta(activeData?.priceData.updatedAt)}</p>

 <div className="mt-4 grid gap-2 sm:grid-cols-3">
 <div className="rounded-lg border border-[#E5EAF1] bg-[#F8FAFD] px-3 py-2">
 <p className="text-[14px] text-[#64748B]">Preço atual</p>
 <p className="text-[14px] font-semibold text-[#1E293B]">{safeMeta(activeData?.priceData.current) || '--'}</p>
 </div>
 <div className="rounded-lg border border-[#E5EAF1] bg-[#F8FAFD] px-3 py-2">
 <p className="text-[14px] text-[#64748B]">Preço justo estimado</p>
 <p className="text-[14px] font-semibold text-[#1E293B]">{safeMeta(activeData?.priceData.estimatedFairValue) || '--'}</p>
 </div>
 <div className="rounded-lg border border-[#E5EAF1] bg-[#F8FAFD] px-3 py-2">
 <p className="text-[14px] text-[#64748B]">Diferença vs preço atual</p>
 <p className="text-[14px] font-semibold text-[#1E293B]">{safeMeta(activeData?.priceData.differenceVsCurrent) || '--'}</p>
 </div>
 </div>

 {valuationSummaryLine && (
 <section className="mt-3 rounded-lg border border-[#D6F5EE] bg-[#F4FFFC] p-3">
 <p className="text-[11px] font-semibold uppercase tracking-wide text-[#0F766E]">Por que isso importa</p>
 <p className="mt-1 text-[14px] text-[#334155]">{valuationSummaryLine}</p>
 </section>
 )}

 <section className="mt-4 rounded-lg border border-[#E5EAF1] bg-[#FCFDFE] p-4">
 <p className="text-[12px] font-semibold uppercase tracking-wide text-[#64748B]">Régua de valuation</p>
 {!hasSemanticDomain && (
 <div className="py-3 text-[14px] text-[#9CA3AF]">Sem base suficiente para exibir a régua de valuation neste momento.</div>
 )}
 {hasSemanticDomain && (
 <>
 <div className="mt-3 rounded-lg border border-[#E6ECF2] bg-white p-3">
 <div className="mb-2 flex items-center justify-between text-[14px] font-medium text-[#94A3B8]">
 <span>{formatCurrencyBRL(rulerMin)}</span>
 <span>Posição do preço atual vs. preço justo estimado</span>
 <span>{formatCurrencyBRL(rulerMax)}</span>
 </div>
 <div className="relative pt-9">
 {fairValue != null && fairMarker != null && (
 <div className="pointer-events-none absolute left-0 right-0 top-0">
 <div className="absolute left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md border border-[#CFE9E1] bg-white px-2 py-1 text-[14px] font-semibold text-[#0F766E] shadow-sm">
 Preço justo estimado {formatCurrencyBRL(fairValue)}
 </div>
 </div>
 )}
 {currentMarker != null && (
 <div className="pointer-events-none absolute bottom-0 top-0 z-[1]" style={{ left: `${currentMarker}%` }}>
 <div className="-ml-[1.5px] h-full w-[3px] rounded-full bg-[#0B1220]/95 shadow-[0_0_0_2px_#ffffff]" />
 <div className={`absolute -top-5 whitespace-nowrap rounded-md border border-[#CBD5E1] bg-white px-2 py-1 text-[14px] font-semibold text-[#0B1220] shadow-sm ${currentMarkerLabelClass}`}>
 <span>{safeMeta(valuationBullet?.currentLabel) || 'Preço atual'}</span>
 <span className="ml-1 text-[#475569]">{formatCurrencyBRL(currentPriceForRuler)}</span>
 </div>
 </div>
 )}
 <div className="h-9 overflow-hidden rounded-full border border-[#DCE4EE] bg-[#F8FAFD]">
 {hasNearZone ? (
 <div className="flex h-full w-full">
 <div className="h-full bg-[#E9F8F4]" style={{ width: `${belowZoneWidthPct}%` }} />
 <div className="h-full border-x border-[#F2D28A] bg-[#FFF4DB]" style={{ width: `${nearZoneWidthPct}%` }} />
 <div className="h-full bg-[#FDEBE7]" style={{ width: `${aboveZoneWidthPct}%` }} />
 </div>
 ) : (
 <div className="h-full w-full bg-[#EEF2F6]" />
 )}
 </div>
 </div>
 <div className="mt-3 grid gap-2 text-[14px] text-[#5B6472] sm:grid-cols-3">
 <p><span className="inline-block h-2 w-2 rounded-full bg-[#A6E7D6]" /> <span className="ml-1 font-medium text-[#334155]">Abaixo do preço justo estimado</span></p>
 <p><span className="inline-block h-2 w-2 rounded-full bg-[#F2C86B]" /> <span className="ml-1 font-medium text-[#334155]">Próximo do preço justo estimado</span></p>
 <p><span className="inline-block h-2 w-2 rounded-full bg-[#F1B4A8]" /> <span className="ml-1 font-medium text-[#334155]">Acima do preço justo estimado</span></p>
 </div>
 <div className="mt-2">
 <p className="text-[14px] font-medium text-[#334155]">A régua mostra em qual zona o preço atual cai em relação ao preço justo estimado.</p>
 <button
 type="button"
 onClick={(event) => {
 event.preventDefault();
 event.stopPropagation();
 setShowValuationMethodologyDrawer(true);
 }}
 className="mt-1 inline-flex items-center gap-1 rounded-md px-1 py-0.5 text-[12px] text-[#64748B] transition-colors hover:bg-[#F5F7FA] hover:text-[#334155]"
 >
 <CircleHelp className="h-3.5 w-3.5" />
 Entender cálculo do valuation
 </button>
 </div>
 </div>
 </>
 )}
</section>

 <section className="mt-5 rounded-lg border border-[#EEF2F6] bg-[#FBFCFE] p-3">
 <p className="mb-2 text-[11px] uppercase tracking-wide text-[#94A3B8]">Cenários do valuation</p>
 <div className="grid grid-cols-4 border-b border-[#EEF2F6] pb-2 text-[11px] font-semibold text-[#94A3B8]">
 <span>Cenário</span>
 <span>Valor estimado</span>
 <span>Diferença vs preço atual</span>
 <span>Leitura</span>
 </div>
 {valuationScenarios.map((scenario, index) => (
 <div key={`${scenario.scenario}-${index}`} className="grid grid-cols-4 border-b border-[#EEF2F6] py-2.5 text-[14px] text-[#334155]">
 <span className="font-medium">{scenario.scenario || '--'}</span>
 <span>{scenario.estimatedValue || '--'}</span>
 <span>{scenario.differenceVsCurrent || '--'}</span>
 <span className="text-[#64748B]">{scenario.reading || '--'}</span>
 </div>
 ))}
 {valuationScenarios.length === 0 && <div className="py-3 text-[14px] text-[#9CA3AF]">Sem cenários de valuation disponíveis.</div>}
 </section>

 <section className="mt-4 rounded-lg border border-[#E5EAF1] bg-white p-3">
 <p className="text-[11px] font-semibold uppercase tracking-wide text-[#64748B]">Sensibilidade do valuation</p>
 <p className="mt-1 text-[14px] text-[#6B7280]">Drivers principais: crescimento terminal, WACC, margem operacional e capex/reinvestimento.</p>
 <div className="mt-3 grid gap-2 sm:grid-cols-2">
 {sensitivityDrivers.map((driver, index) => (
 <div key={`${driver.driver}-${index}`} className="rounded-md border border-[#E6EAF0] bg-[#FBFCFE] p-2.5">
 <p className="text-[14px] font-semibold text-[#0F172A]">{driver.driver || '--'}</p>
 <p className="mt-1 text-[14px] text-[#475569]">{driver.value || '--'}</p>
 <p className="mt-1 text-[14px] text-[#6B7280]">{driver.impact || '--'}</p>
 </div>
 ))}
 {sensitivityDrivers.length === 0 && <p className="text-[14px] text-[#9CA3AF]">Sem drivers de sensibilidade disponíveis.</p>}
 </div>
 </section>

 <section className="mt-5 rounded-lg border border-[#EEF2F6] bg-[#FBFCFE] p-3">
 <p className="mb-2 text-[11px] uppercase tracking-wide text-[#94A3B8]">Múltiplos de apoio</p>
 <div className="grid grid-cols-5 border-b border-[#EEF2F6] pb-2 text-[11px] font-semibold text-[#94A3B8]">
 <span>Métrica</span>
 <span>Atual</span>
 <span>Setor</span>
 <span>Histórico 5a</span>
 <span>Leitura</span>
 </div>
 {companyPriceRows.map((row) => (
 <div key={`${row.metric}-${row.companyId}`} className="grid grid-cols-5 border-b border-[#EEF2F6] py-2.5 text-[14px] text-[#334155]">
 <span className="font-medium">{row.metric}</span>
 <span>{row.current}</span>
 <span>{row.sector}</span>
 <span>{row.histórical}</span>
 <span className="text-[#64748B]">{row.insight}</span>
 </div>
 ))}
 {companyPriceRows.length === 0 && <div className="py-3 text-[14px] text-[#9CA3AF]">Sem múltiplos de apoio disponíveis.</div>}
 <p className="mt-3 text-[14px] italic text-[#6B7280]">{safeMeta(activeData?.priceData.multiplesSummary) || 'Múltiplos ajudam a contextualizar a leitura de valuation, sem substituir o cenário-base de DCF.'}</p>
 </section>
 </article>
 )}

 {activeTab === 'Fontes' && (
 <article className="rounded-xl border border-[#E8EAED] bg-white p-5">
 <h2 className="text-[15px] font-semibold text-[#111827]">Fontes & Metodologia</h2>
 <p className="mt-1 text-[13px] text-[#6B7280]">Transparência da leitura: veja de onde vem os dados e quão atualizadas estão as fontes que sustentam esta análise.</p>

 {sourceRowsWithRelevance.length === 0 && (
 <div className="mt-4 rounded-lg border border-[#F3F4F6] px-4 py-3 text-[12px] text-[#9CA3AF]">
 Ainda não temos dados suficientes para este indicador. Última tentativa: {safeMeta(activeData?.summaryMeta.updatedAt)}. Fonte esperada: CVM/RI
 </div>
 )}

 {sourceRowsWithRelevance.length > 0 && (
 <>
 <section className="mt-4 rounded-xl border border-[#DDE3EA] bg-[#FCFDFE] p-4">
  <div className="flex flex-wrap items-center justify-between gap-2">
  <div>
   <p className="text-[12px] font-semibold uppercase tracking-wide text-[#64748B]">Confiabilidade das fontes</p>
  <p className="mt-1 text-[14px] font-semibold text-[#111827]">{resolvedSourceConfidenceLabel}</p>
 </div>
  <span className={cx('rounded-full border px-2.5 py-1 text-[11px] font-semibold', sourceConfidenceTone)}>{resolvedSourceConfidenceLabel}</span>
 </div>
  <p className="mt-2 text-[13px] text-[#475569]">{resolvedSourceConfidenceSummary}</p>
  <div className="mt-3 space-y-1 text-[12px] text-[#374151]">
  <p>Fontes principais atualizadas: {updatedPrimarySources}</p>
  <p>Fontes complementares antigas: {outdatedComplementarySources}</p>
  <p>Última atualização mais recente: {safeMeta(latestSourceDate)}</p>
  </div>
 </section>

 <section className="mt-4 overflow-hidden rounded-lg border border-[#F3F4F6]">
  <p className="border-b border-[#F3F4F6] bg-[#F9FAFB] px-4 py-2 text-[12px] font-semibold text-[#475467]">Fontes principais da leitura</p>
  <div className="grid grid-cols-9 border-b border-[#F3F4F6] bg-white px-4 py-2.5 text-[11px] font-semibold text-[#94A3B8]">
  <span>Categoria</span>
  <span>Fonte</span>
  <span>Documento</span>
  <span>Data</span>
  <span>Status</span>
  <span className="col-span-2">Consequencia</span>
  <span className="col-span-2">Link</span>
  </div>
  {primarySourceRows.map((row) => (
  <div key={`${row.category}-${row.doc}`} className="grid grid-cols-9 items-center border-b border-[#F3F4F6] px-4 py-3 text-[12px] text-[#334155]">
   <span>{row.category}</span>
   <span>{safeMeta(row.source)}</span>
   <span>{row.doc}</span>
   <span>{safeMeta(row.date)}</span>
   <span>
   <span className={cx('rounded-full border px-2 py-0.5 text-[10px] font-semibold', row.status === 'Atualizado' ? 'border-[#99F6E4] bg-[#F0FDFA] text-[#0E9384]' : 'border-[#FDE68A] bg-[#FFFBEB] text-[#D97706]')}>
    {row.statusLabel}
   </span>
   </span>
   <span className="col-span-2 text-[11px] text-[#64748B]">{row.consequence}</span>
   <a
   href={row.link}
   target="_blank"
   rel="noreferrer"
   onClick={(event) => {
    if (guardAction(event, row.companyId)) return;
   }}
   className={cx('col-span-2 mt-1 inline-flex items-center gap-1 text-[11px] text-[#0E9384] hover:underline', actionsDisabled ? 'opacity-50' : '')}
   >
   Abrir documento original
   <ExternalLink className="h-3.5 w-3.5" />
   </a>
  </div>
  ))}
 </section>

 <section className="mt-4 overflow-hidden rounded-lg border border-[#F3F4F6]">
  <p className="border-b border-[#F3F4F6] bg-[#F9FAFB] px-4 py-2 text-[12px] font-semibold text-[#475467]">Fontes complementares</p>
  <div className="grid grid-cols-9 border-b border-[#F3F4F6] bg-white px-4 py-2.5 text-[11px] font-semibold text-[#94A3B8]">
  <span>Categoria</span>
  <span>Fonte</span>
  <span>Documento</span>
  <span>Data</span>
  <span>Status</span>
  <span className="col-span-2">Consequencia</span>
  <span className="col-span-2">Link</span>
  </div>
  {complementarySourceRows.map((row) => (
  <div key={`${row.category}-${row.doc}`} className="grid grid-cols-9 items-center border-b border-[#F3F4F6] px-4 py-3 text-[12px] text-[#334155]">
   <span>{row.category}</span>
   <span>{safeMeta(row.source)}</span>
   <span>{row.doc}</span>
   <span>{safeMeta(row.date)}</span>
   <span>
   <span className={cx('rounded-full border px-2 py-0.5 text-[10px] font-semibold', row.status === 'Atualizado' ? 'border-[#99F6E4] bg-[#F0FDFA] text-[#0E9384]' : 'border-[#FDE68A] bg-[#FFFBEB] text-[#D97706]')}>
    {row.statusLabel}
   </span>
   </span>
   <span className="col-span-2 text-[11px] text-[#64748B]">{row.consequence}</span>
   <a
   href={row.link}
   target="_blank"
   rel="noreferrer"
   onClick={(event) => {
    if (guardAction(event, row.companyId)) return;
   }}
   className={cx('col-span-2 mt-1 inline-flex items-center gap-1 text-[11px] text-[#0E9384] hover:underline', actionsDisabled ? 'opacity-50' : '')}
   >
   Abrir documento original
   <ExternalLink className="h-3.5 w-3.5" />
   </a>
  </div>
  ))}
 </section>

 <section className="mt-4 rounded-lg border border-[#EEF2F6] bg-[#FBFCFE] p-3">
  <p className="text-[12px] font-semibold text-[#475569]">Como usamos essas fontes</p>
  <ul className="mt-2 space-y-1 text-[12px] text-[#64748B]">
  <li>Dados financeiros sustentam os pilares estruturais da leitura.</li>
  <li>Eventos e comunicados complementam o contexto recente da empresa.</li>
  <li>Fontes complementares não substituem as fontes principais da análise.</li>
  </ul>
 </section>
 </>
 )}
 </article>
 )}
 </>
 )}
 </section>
 </main>
 {showValuationMethodologyDrawer && (
 <div className="absolute inset-0 z-40">
 <button
 type="button"
 aria-label="Fechar painel de metodologia"
 className="absolute inset-0 bg-[#0B1220]/20"
 onClick={() => setShowValuationMethodologyDrawer(false)}
 />
 <aside className="absolute inset-y-0 right-0 w-full max-w-[460px] overflow-y-auto border-l border-[#E7EAEE] bg-white p-6 shadow-2xl">
 <div className="flex items-start justify-between gap-3">
 <div>
 <p className="text-[11px] uppercase tracking-wide text-[#94A3B8]">Metodologia</p>
 <h3 className="mt-1 text-[16px] font-semibold text-[#111827]">Como calculamos o valuation</h3>
 </div>
 <button
 type="button"
 className="rounded-md border border-[#E5E7EB] px-2.5 py-1 text-[12px] text-[#475569] hover:bg-[#F8FAFC]"
 onClick={() => setShowValuationMethodologyDrawer(false)}
 >
 Fechar
 </button>
 </div>
 <div className="mt-4 space-y-4 text-[13px] text-[#475569]">
 <p>Nosso valuation busca responder uma pergunta simples: quanto uma empresa vale hoje com base no caixa que ela pode gerar no futuro?</p>
 <p>Para isso, usamos um modelo de Fluxo de Caixa Descontado (DCF).</p>

 <section className="rounded-lg border border-[#EEF2F6] bg-[#FBFCFE] p-3">
 <p className="font-semibold text-[#0F172A]">Em termos simples</p>
 <p className="mt-1">Projetamos a geração de caixa futura da empresa, trazemos esses valores para o presente com uma taxa de desconto e chegamos a uma estimativa de valor por ação.</p>
 </section>

 <section className="rounded-lg border border-[#EEF2F6] bg-[#FBFCFE] p-3">
 <p className="font-semibold text-[#0F172A]">A lógica central</p>
 <p className="mt-1">Uma empresa vale o quanto consegue gerar de caixa ao longo do tempo. Como o dinheiro no futuro vale menos do que hoje, descontamos esses fluxos usando uma taxa que reflete risco, custo de capital e estrutura financeira.</p>
 </section>

 <section className="rounded-lg border border-[#EEF2F6] bg-[#FBFCFE] p-3">
 <p className="font-semibold text-[#0F172A]">Como fazemos isso</p>
 <ul className="mt-2 list-disc space-y-1 pl-5">
 <li>Partimos dos dados atuais da empresa, como receita, EBIT, imposto, dívida, caixa e número de ações.</li>
 <li>Projetamos crescimento, margem operacional e reinvestimento para os próximos anos.</li>
 <li>Calculamos o fluxo de caixa livre da firma (FCFF).</li>
 <li>Trazemos esses fluxos ao valor presente usando o WACC.</li>
 <li>Ajustamos dívida, caixa e outros itens para chegar ao valor do patrimônio.</li>
 <li>Dividimos pelo número de ações para estimar o preço justo por ação.</li>
 </ul>
 </section>

 <section className="rounded-lg border border-[#EEF2F6] bg-[#FBFCFE] p-3">
 <p className="font-semibold text-[#0F172A]">O que mais influencia o resultado</p>
 <p className="mt-1">O valuation depende principalmente de crescimento da receita, margem operacional, reinvestimento, WACC, crescimento terminal e número de ações.</p>
 <p className="mt-1">Pequenas mudanças nessas premissas podem alterar de forma relevante o preço justo estimado.</p>
 </section>

 <section className="rounded-lg border border-[#EEF2F6] bg-[#FBFCFE] p-3">
 <p className="font-semibold text-[#0F172A]">O que esse cálculo faz bem</p>
 <p className="mt-1">Ele ajuda a enxergar o valor econômico do negócio, comparar preço de mercado com valor estimado e entender quais premissas sustentam a tese.</p>
 </section>

 <section className="rounded-lg border border-[#EEF2F6] bg-[#FBFCFE] p-3">
 <p className="font-semibold text-[#0F172A]">O que esse cálculo não faz</p>
 <p className="mt-1">Ele não prevê o preço da ação no curto prazo, não garante retorno e não substitui a análise qualitativa do negócio.</p>
 </section>

 <section className="rounded-lg border border-[#E6EEF9] bg-[#F7FBFF] p-3">
 <p className="font-semibold text-[#0F172A]">Em resumo</p>
 <p className="mt-1">Projetamos a operação da empresa, estimamos o caixa que ela pode gerar, trazemos esse caixa para o valor de hoje e chegamos a um preço justo por ação.</p>
 </section>
 </div>
 </aside>
 </div>
 )}
 </div>
 </div>
 );
}







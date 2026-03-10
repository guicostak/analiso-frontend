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

type Status = 'Risco' | 'Atencao' | 'Saudavel';
type MainTab = 'Resumo' | 'Pilares' | 'Mudancas' | 'Eventos' | 'Preco' | 'Fontes';
type QueueFilter = 'Todas' | 'Atencao' | 'Risco';
type WindowSize = '5a' | '10a';
type PriceMetric = 'P/L' | 'EV/EBITDA' | 'P/VP';
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
 label: 'Ponto de atencao' | 'Ponto forte';
 intensity: 'Moderada' | 'Leve';
 title: string;
 value: string;
 metric: string;
 why: string;
 source: Source;
};

type PillarData = {
 name: 'Divida' | 'Caixa' | 'Margens' | 'Retorno' | 'Proventos';
 status: Status;
 score: number;
 trend: string;
 summary: string;
 trust: { source: string; updatedAt: string; status: 'Atualizado' | 'Antigo' };
 chart: { title: string; series5: number[]; series10: number[]; years5: string[]; years10: string[] };
 metrics: PillarMetric[];
 evidences: PillarEvidence[];
};

const queueItems: CompanyQueueItem[] = [
 { companyId: 'VALE3', ticker: 'VALE3', name: 'Vale', status: 'Risco', logo: logoVale, description: 'Mineradora global com forte exposicao a minerio de ferro.' },
 { companyId: 'LREN3', ticker: 'LREN3', name: 'Lojas Renner', status: 'Atencao', logo: logoRenner, description: 'Varejo de moda com foco em omnichannel e escala nacional.' },
 { companyId: 'MRVE3', ticker: 'MRVE3', name: 'MRV Engenharia', status: 'Atencao', logo: logoMrv, description: 'Construtora focada no segmento residencial de media e baixa renda.' },
 { companyId: 'TAEE11', ticker: 'TAEE11', name: 'Transmissao Paulista', status: 'Saudavel', logo: logoTaesa, description: 'Empresa de transmissao de energia com receita regulada.' },
 { companyId: 'WEGE3', ticker: 'WEGE3', name: 'WEG', status: 'Atencao', logo: logoWeg, description: 'Empresa de equipamentos eletricos e automacao industrial com presenca global.' },
 { companyId: 'ITUB4', ticker: 'ITUB4', name: 'Itau Unibanco', status: 'Saudavel', logo: logoItau, description: 'Banco universal com foco em credito, servicos e seguros.' },
 { companyId: 'BBAS3', ticker: 'BBAS3', name: 'Banco do Brasil', status: 'Saudavel', initials: 'BB', description: 'Banco com forte exposicao ao agronegocio e setor publico.' },
];

const mainTabs: MainTab[] = ['Resumo', 'Pilares', 'Mudancas', 'Eventos', 'Preco', 'Fontes'];
const radarScores: Record<PillarName, number> = { Divida: 58, Caixa: 72, Margens: 70, Retorno: 76, Proventos: 62 };
const radarPreviousScores: Record<PillarName, number> = { Divida: 61, Caixa: 69, Margens: 69, Retorno: 75, Proventos: 64 };

const pillars: PillarData[] = [
 {
 name: 'Divida',
 status: 'Atencao',
 score: 58,
 trend: '? 3 vs ultimo trimestre',
 summary: 'Atencao porque a alavancagem subiu e exige acompanhamento de caixa.',
 trust: { source: 'CVM', updatedAt: '04/02', status: 'Atualizado' },
 chart: {
 title: 'Evidencia: Divida Liq./EBITDA por ano',
 years5: ['2021', '2022', '2023', '2024', '2025'],
 years10: ['2016', '2017', '2018', '2019', '2020', '2021', '2022', '2023', '2024', '2025'],
 series5: [0.6, 0.8, 1.1, 1.4, 1.6],
 series10: [0.4, 0.5, 0.6, 0.7, 0.7, 0.6, 0.8, 1.1, 1.4, 1.6],
 },
 metrics: [
 { label: 'Divida Liq./EBITDA', value: '1,6x', period: '12m +0,2x', source: { name: 'CVM', docLabel: 'ITR 3T25', date: '04/02' } },
 { label: 'Cobertura de juros', value: '6,8x', period: '12m', source: { name: 'RI', docLabel: 'Release 3T25', date: '04/02' } },
 { label: 'Caixa vs divida CP', value: '1,3x', period: 'Trimestre', source: { name: 'CVM', docLabel: 'ITR 3T25', date: '04/02' } },
 { label: 'Prazo medio', value: '3,8 anos', period: 'Atual', source: { name: 'RI', docLabel: 'Release 3T25', date: '04/02' } },
 ],
 evidences: [
 {
 id: 'divida-1',
 label: 'Ponto de atencao',
 intensity: 'Moderada',
 title: 'Divida bruta subiu no trimestre',
 value: '1,6x',
 metric: 'Divida Liq./EBITDA',
 why: 'Pode pressionar caixa em juros altos.',
 source: { name: 'CVM', docLabel: 'ITR 3T25', date: '04/02', url: 'https://www.gov.br/cvm' },
 },
 {
 id: 'divida-2',
 label: 'Ponto forte',
 intensity: 'Leve',
 title: 'Prazo de divida alongado',
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
 summary: 'Esta saudavel porque o fluxo de caixa livre segue positivo.',
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
 { label: 'Conversao de caixa', value: '82%', period: '12m', source: { name: 'RI', docLabel: 'Release 3T25', date: '04/02' } },
 { label: 'Liquidez corrente', value: '1,6x', period: 'Trimestre', source: { name: 'CVM', docLabel: 'ITR 3T25', date: '04/02' } },
 { label: 'Capex/Receita', value: '4,2%', period: '12m', source: { name: 'RI', docLabel: 'Release 3T25', date: '04/02' } },
 ],
 evidences: [
 {
 id: 'caixa-1',
 label: 'Ponto forte',
 intensity: 'Leve',
 title: 'Caixa confortavel para investimentos',
 value: '18%',
 metric: 'Caixa/Receita',
 why: 'Mantem flexibilidade para crescimento organico.',
 source: { name: 'RI', docLabel: 'Release 3T25', date: '04/02', url: 'https://www.weg.net/ri' },
 },
 {
 id: 'caixa-2',
 label: 'Ponto de atencao',
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
 summary: 'Esta saudavel porque margens permaneceram proximas da media historica.',
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
 { label: 'Margem liquida', value: '14,1%', period: '12m', source: { name: 'RI', docLabel: 'Release 3T25', date: '04/02' } },
 { label: 'Preco vs custo', value: '1,2x', period: 'Trimestre', source: { name: 'RI', docLabel: 'Release 3T25', date: '04/02' } },
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
 label: 'Ponto de atencao',
 intensity: 'Moderada',
 title: 'Custos diretos em alta',
 value: '58%',
 metric: 'Custo/Receita',
 why: 'Pode comprimir margem no proximo trimestre.',
 source: { name: 'CVM', docLabel: 'ITR 3T25', date: '04/02', url: 'https://www.gov.br/cvm' },
 },
 ],
 },
 {
 name: 'Retorno',
 status: 'Saudavel',
 score: 76,
 trend: '? 1 vs 12m',
 summary: 'Esta saudavel porque ROIC se mantem acima da referencia.',
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
 { label: 'Referencia de retorno', value: '12,0%', period: 'proxy', source: { name: 'Analiso', docLabel: 'Estimativa interna', date: '04/02' } },
 ],
 evidences: [
 {
 id: 'retorno-1',
 label: 'Ponto forte',
 intensity: 'Leve',
 title: 'Retorno acima da referencia',
 value: '16,1%',
 metric: 'ROIC (12m)',
 why: 'Indica eficiencia na alocacao de capital.',
 source: { name: 'CVM', docLabel: 'DFP 2024', date: '04/02', url: 'https://www.gov.br/cvm' },
 },
 {
 id: 'retorno-2',
 label: 'Ponto de atencao',
 intensity: 'Moderada',
 title: 'ROA recuou no trimestre',
 value: '6,1%',
 metric: 'ROA (12m)',
 why: 'Pode sinalizar menor eficiencia operacional.',
 source: { name: 'CVM', docLabel: 'ITR 3T25', date: '04/02', url: 'https://www.gov.br/cvm' },
 },
 ],
 },
 {
 name: 'Proventos',
 status: 'Atencao',
 score: 62,
 trend: '? 2 vs ultimo trimestre',
 summary: 'Atencao porque a distribuicao segue volatil em ciclos de investimento.',
 trust: { source: 'RI', updatedAt: '05/02', status: 'Antigo' },
 chart: {
 title: 'Evidencia: Dividendos por acao',
 years5: ['2021', '2022', '2023', '2024', '2025'],
 years10: ['2016', '2017', '2018', '2019', '2020', '2021', '2022', '2023', '2024', '2025'],
 series5: [0.9, 1.1, 1.0, 1.3, 1.2],
 series10: [0.6, 0.7, 0.8, 0.9, 0.8, 0.9, 1.1, 1.0, 1.3, 1.2],
 },
 metrics: [
 { label: 'Payout', value: '42%', period: '12m', source: { name: 'RI', docLabel: 'Comunicado', date: '05/02' } },
 { label: 'Dividend yield', value: '3,1%', period: '12m', source: { name: 'B3', docLabel: 'Dados de mercado', date: '05/02' } },
 { label: 'Proventos por acao', value: 'R$ 1,2', period: '12m', source: { name: 'RI', docLabel: 'Comunicado', date: '05/02' } },
 { label: 'Cobertura de proventos', value: '2,4x', period: '12m', source: { name: 'CVM', docLabel: 'DFP 2024', date: '04/02' } },
 ],
 evidences: [
 {
 id: 'proventos-1',
 label: 'Ponto de atencao',
 intensity: 'Moderada',
 title: 'Payout mais volatil',
 value: '42%',
 metric: 'Payout (12m)',
 why: 'Pode mudar previsibilidade de proventos.',
 source: { name: 'RI', docLabel: 'Comunicado', date: '05/02', url: 'https://www.weg.net/ri' },
 },
 {
 id: 'proventos-2',
 label: 'Ponto forte',
 intensity: 'Leve',
 title: 'Historico de distribuicao estavel',
 value: '3,1%',
 metric: 'Dividend yield',
 why: 'Reforca previsibilidade para o acionista.',
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
 title: 'Divulgacao de resultados do 3T25 com margem estavel.',
 impactLine: 'Impacto principal: Margens',
 unchangedLine: 'Nao alterou Caixa nem Divida no curto prazo.',
 source: { docLabel: 'ITR 3T25', url: 'https://www.gov.br/cvm' },
 },
 {
 type: 'Divida',
 date: '03/02',
 severity: 'Moderada',
 impact: 'Divida',
 title: 'Emissao de debentures para alongamento de prazo.',
 impactLine: 'Impacto principal: Divida (perfil de vencimento mais longo).',
 unchangedLine: 'Sem mudanca material em Margens.',
 source: { docLabel: 'Fato Relevante', url: 'https://www.b3.com.br' },
 },
 {
 type: 'Proventos',
 date: '28/01',
 severity: 'Leve',
 impact: 'Proventos',
 title: 'Aprovacao de juros sobre capital proprio.',
 impactLine: 'Impacto principal: Proventos',
 unchangedLine: 'Nao altera o diagnostico de Retorno por ora.',
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
 why: 'Pode mexer em Proventos e leitura de distribuicao.',
 expectedImpact: 'Moderado',
 pillars: ['Proventos'],
 },
 {
 date: '16/02',
 title: 'WEGE3 Teleconferencia RI',
 source: 'RI / B3',
 why: 'Pode sinalizar mudancas de guidance para Margens e Divida.',
 expectedImpact: 'Leve',
 pillars: ['Margens', 'Divida'],
 },
];

const priceData = {
 current: 'R$ 42,60',
 summary: 'Hoje o preco esta mais perto de premio vs historico, mas depende do ciclo e dos resultados.',
 labels: ['12x', '14x', '16x', '18x', '20x', '22x'],
 values: [4, 6, 9, 7, 5, 2],
 currentMarker: 4,
 medianMarker: 2,
 rows: [
 { metric: 'P/L', current: '20,1x', sector: '17,8x', historical: '16,4x', insight: 'Acima da mediana historica.' },
 { metric: 'EV/EBITDA', current: '13,5x', sector: '12,1x', historical: '11,8x', insight: 'Leve premio vs setor.' },
 { metric: 'P/VP', current: '4,2x', sector: '3,6x', historical: '3,4x', insight: 'Mais caro que a media 5a.' },
 ],
};

const sourceRows = [
 { category: 'Financeiro', source: 'CVM', doc: 'DFP 2024', date: '04/02', status: 'Atualizado', link: 'https://www.gov.br/cvm' },
 { category: 'Eventos', source: 'B3', doc: 'Fato Relevante', date: '03/02', status: 'Atualizado', link: 'https://www.b3.com.br' },
 { category: 'Preco', source: 'B3', doc: 'Dados de mercado', date: '05/02', status: 'Atualizado', link: 'https://www.b3.com.br' },
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
 metricSeries?: Partial<Record<PriceMetric, { labels: string[]; values: number[]; currentMarker: number; medianMarker: number }>>;
 };
 sourceRows: Array<Contextual<(typeof sourceRows)[number]>>;
};

type TabPayload =
 | { status: 'ready'; companyId: string; data: CompanyData }
 | { status: 'empty'; companyId: string; ticker: string };

type CompanyPreferences = {
 activeTab: MainTab;
 changesWindow: FeedWindow;
 eventsWindow: FeedWindow;
 priceMetric: PriceMetric;
 lastOpenPillar: 'Divida' | 'Caixa' | 'Margens' | 'Retorno' | 'Proventos' | null;
};

const API_BASE_URL = String(import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080').replace(/\/$/, '');
// Temporario: manter a tela desacoplada do backend durante iteracoes de UX/copy.
const FORCE_COMPANY_ANALYSIS_MOCK = true;

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

function safeMeta(value?: string) {
 return value && value.trim().length > 0 ? value : '';
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
  if (impact === 'Divida') return 'Ainda nao muda a leitura estrutural da empresa hoje, mas merece acompanhamento porque pode alterar o perfil da divida nos proximos fechamentos.';
  if (impact === 'Margens') return 'Ainda nao muda a leitura estrutural hoje, mas adiciona um ponto de monitoramento para as margens nos proximos resultados.';
  if (impact === 'Retorno') return 'Ainda nao muda a leitura estrutural hoje, mas merece acompanhamento porque pode alterar a qualidade do retorno nos proximos fechamentos.';
  return 'Ainda nao muda a leitura estrutural hoje, mas adiciona um ponto de monitoramento para os proximos fechamentos.';
 }
 if (change.level === 'Relevante') {
  if (impact === 'Divida') return 'Ainda nao muda a leitura estrutural da empresa, mas merece acompanhamento pelo efeito potencial no perfil da divida.';
  if (impact === 'Margens') return 'Ainda nao muda a leitura estrutural, mas adiciona um sinal para acompanhar a evolucao operacional.';
  return 'Ainda nao muda a leitura estrutural da empresa, mas merece acompanhamento no proximo ciclo de resultados.';
 }
 if (impact === 'Proventos') {
  return 'Distribuicao anunciada sem impacto estrutural relevante na leitura atual da empresa.';
 }
 if (change.unchangedLine && change.unchangedLine.trim().length > 0) {
  return 'Atualizacao recorrente, sem impacto estrutural relevante na leitura atual da empresa.';
 }
 return 'Evento de rotina com efeito informacional, mantendo o diagnostico estrutural no periodo.';
}

function buildWhyItMatters(change: { impact?: string; impactLine?: string; level: ChangePriorityLevel }) {
 const impact = normalizeChangePillar(change.impact);
 if (change.level === 'Estrutural' && change.impactLine && change.impactLine.trim().length > 0) {
  const cleaned = change.impactLine.replace(/^Impacto principal:\s*/i, '').trim();
  if (cleaned.length > 0) {
   return `Pode afetar o pilar de ${cleaned} nos proximos acompanhamentos.`;
  }
 }
 if (change.level === 'Estrutural') {
  if (impact === 'Divida') return 'Pode afetar o pilar de Divida ao alterar perfil de vencimento e custo financeiro.';
  if (impact === 'Margens') return 'Pode afetar o pilar de Margens se a pressao operacional persistir nos proximos trimestres.';
  if (impact === 'Retorno') return 'Pode afetar o pilar de Retorno ao mudar a eficiencia da alocacao de capital.';
  return 'Pode afetar a leitura estrutural da empresa no proximo ciclo de confirmacao.';
 }
 if (change.level === 'Relevante') {
  if (impact === 'Divida') return 'Merece monitoramento em Divida, mas ainda sem deterioracao estrutural confirmada.';
  if (impact === 'Margens') return 'Merece monitoramento em Margens, mas ainda sem deterioracao estrutural confirmada.';
  if (impact === 'Caixa') return 'Merece monitoramento em Caixa para confirmar se o movimento ganha tracao.';
  if (impact === 'Retorno') return 'Merece monitoramento em Retorno para validar continuidade da tendencia.';
  return 'Merece monitoramento no pilar afetado antes de revisao de diagnostico.';
 }
 if (impact === 'Proventos') return 'Reforca o acompanhamento de Proventos, sem alteracao relevante nos demais pilares no momento.';
 return 'Reforca acompanhamento pontual, sem gerar alerta estrutural neste momento.';
}

function getTimelineEventTypeLabel(title?: string) {
 const raw = (title ?? '').toLowerCase();
 if (raw.includes('resultado')) return 'Resultado';
 if (raw.includes('guidance')) return 'Guidance';
 if (raw.includes('teleconfer')) return 'Teleconferencia';
 if (raw.includes('dividend') || raw.includes('jcp') || raw.includes('provento')) return 'Proventos';
 if (raw.includes('assembleia') || raw.includes('societ')) return 'Societario';
 return 'Atualizacao';
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
  return `Nos proximos ${windowLabel.replace(' dias', '')} dias, o principal gatilho esperado e o resultado do ${quarter}, com possivel efeito em ${event.mainPillar}.`;
 }
 return `Nos proximos ${windowLabel.replace(' dias', '')} dias, o principal gatilho esperado e ${event.title?.toLowerCase() ?? 'um evento relevante'}, com possivel efeito em ${event.mainPillar}.`;
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
  const supportingText = supportingPillars.length > 0 ? ` e influenciar tambem ${supportingPillars.join(' e ')}` : '';
  const quarter = getTimelineQuarterLabel(event.title);
  if (event.typeLabel === 'Resultado' && quarter) {
   return `O resultado do ${quarter} pode mudar primeiro a leitura de ${event.mainPillar}${supportingText}, dependendo da qualidade do trimestre.`;
  }
  if (event.mainPillar === 'Divida') return `Este gatilho pode mudar primeiro a leitura de Divida${supportingText} nos proximos fechamentos.`;
  if (event.mainPillar === 'Margens') return `Este gatilho pode mudar primeiro a leitura de Margens${supportingText} nos proximos resultados.`;
  if (event.mainPillar === 'Retorno') return `Este gatilho pode mudar primeiro a leitura de Retorno${supportingText} nos proximos fechamentos.`;
  return `Este gatilho de ${event.typeLabel.toLowerCase()} pode mudar primeiro a leitura de ${event.mainPillar}${supportingText} nos proximos fechamentos.`;
 }
 if (event.level === 'Relevante') {
  if (event.mainPillar === 'Divida') return 'Ainda nao muda a leitura estrutural da empresa, mas merece acompanhamento pelo efeito potencial no perfil da divida.';
  if (event.mainPillar === 'Margens') return 'Ainda nao muda a leitura estrutural, mas adiciona sinal para acompanhar a evolucao operacional.';
  if (event.mainPillar === 'Caixa') return 'Ainda nao muda a leitura estrutural, mas merece monitoramento para confirmar continuidade do movimento de caixa.';
  if (event.mainPillar === 'Retorno') return 'Ainda nao muda a leitura estrutural, mas pode alterar a leitura de retorno nos proximos fechamentos.';
  return `Ainda nao muda a leitura estrutural, mas o evento de ${event.typeLabel.toLowerCase()} merece acompanhamento.`;
 }
 if (event.mainPillar === 'Proventos') return 'Atualizacao recorrente de distribuicao, sem impacto estrutural relevante na leitura atual da empresa.';
 return `Atualizacao recorrente de ${event.typeLabel.toLowerCase()}, sem impacto estrutural relevante na leitura atual da empresa.`;
}

function buildTimelineWhyItMatters(event: { why?: string; level: ChangePriorityLevel; mainPillar: ChangePillarTag; pillars?: string[] }) {
 const cleanedWhy = (event.why ?? '').trim();
 if (event.level === 'Estrutural') {
  return 'E o principal gatilho de curto prazo para revisar a leitura da empresa.';
 }
 if (cleanedWhy.length > 0) return cleanedWhy;
 if (event.level === 'Relevante') {
  if (event.mainPillar === 'Divida') return 'Merece monitoramento em Divida, mas ainda sem deterioracao estrutural confirmada.';
  if (event.mainPillar === 'Margens') return 'Merece monitoramento em Margens, mas ainda sem deterioracao estrutural confirmada.';
  if (event.mainPillar === 'Caixa') return 'Merece monitoramento em Caixa para confirmar se o movimento ganha tracao.';
  if (event.mainPillar === 'Retorno') return 'Merece monitoramento em Retorno para validar continuidade da tendencia.';
  return 'Merece monitoramento no pilar afetado antes de revisao de diagnostico.';
 }
 if (event.mainPillar === 'Proventos') return 'Reforca o acompanhamento de Proventos, sem alteracao relevante nos demais pilares no momento.';
 return 'Reforca acompanhamento pontual, sem gerar alerta estrutural neste momento.';
}

function timelineSourceUrl(source?: string) {
 const raw = (source ?? '').toLowerCase();
 if (raw.includes('cvm')) return 'https://www.gov.br/cvm';
 if (raw.includes('b3')) return 'https://www.b3.com.br';
 if (raw.includes('ri')) return 'https://ri.analiso.com.br';
 return 'https://www.analiso.com.br/fontes';
}

function normalizePillarName(value?: string): 'Divida' | 'Caixa' | 'Margens' | 'Retorno' | 'Proventos' {
 const raw = (value ?? 'Divida').toLowerCase();
 if (raw.includes('dvida') || raw.includes('divida')) return 'Divida';
 if (raw.includes('caixa')) return 'Caixa';
 if (raw.includes('marg')) return 'Margens';
 if (raw.includes('retorno')) return 'Retorno';
 return 'Proventos';
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

function normalizeMainTabParam(value?: string | null): MainTab | null {
 const raw = (value ?? '').trim().toLowerCase();
 if (raw === 'resumo') return 'Resumo';
 if (raw === 'pilares') return 'Pilares';
 if (raw === 'mudancas' || raw === 'mudanas') return 'Mudancas';
 if (raw === 'eventos') return 'Eventos';
 if (raw === 'preco' || raw === 'preo') return 'Preco';
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
 priceMetric: 'P/L',
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
 radarScores,
 radarPreviousScores,
 diagnosisHeadline: 'WEG segue forte em caixa e retorno, mas a divida exige acompanhamento neste trimestre.',
 strongest: {
 title: 'Caixa',
 score: '72/100',
 badge: 'Saudvel',
 trend: '? +2 vs 12m',
 summary: 'Fluxo de caixa livre segue positivo e sustenta investimentos sem dvida adicional.',
 },
 watchout: {
 title: 'Dvida',
 score: '58/100',
 badge: 'Ateno',
 trend: '? -3 vs ltimo trimestre',
 summary: 'Alavancagem subiu e exige acompanhamento de caixa em cenrio de juros altos.',
 },
 monitor: {
 pillar: 'Divida',
 text: 'Monitorar Dvida Lq./EBITDA e cobertura de juros no prximo resultado.',
 },
 summaryScan: {
 motherLine: 'Ateno: alavancagem subiu no trimestre; caixa ainda sustenta.',
 strength: { pillar: 'Caixa', text: 'gerao de caixa livre permanece positiva.' },
 attention: { pillar: 'Divida', text: 'alavancagem avanou e exige disciplina financeira.' },
 monitor: { pillar: 'Divida', text: 'acompanhar Dvida Lq./EBITDA e cobertura de juros.' },
 },
 summaryText:
 'A WEG mantm posio financeira slida com gerao de caixa positiva e margens consistentes prximas mdia histrica. O ponto de ateno a alavancagem, que subiu 0,2x no trimestre e exige monitoramento em um cenrio de juros elevados. Proventos seguem estveis, mas com distribuio voltil dependente do ciclo de investimento.',
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
 badge: 'Saudvel',
 trend: '? +1 vs 12m',
 summary: 'Distribuio permaneceu estvel e suportada por gerao de caixa.',
 },
 watchout: {
 title: 'Retorno',
 score: '62/100',
 badge: 'Ateno',
 trend: '? -2 vs ltimo trimestre',
 summary: 'Retorno recuou no trimestre com presso de preos de minrio.',
 },
 monitor: {
 pillar: 'Retorno',
 text: 'Monitorar ROIC e margem EBITDA no prximo release.',
 },
 summaryScan: {
 motherLine: 'Ateno: retorno recuou no trimestre; caixa segue resiliente.',
 strength: { pillar: 'Proventos', text: 'distribuio permaneceu estvel no ciclo recente.' },
 attention: { pillar: 'Retorno', text: 'eficincia caiu com presso de preos de minrio.' },
 monitor: { pillar: 'Retorno', text: 'acompanhar ROIC e evoluo de margens.' },
 },
 summaryText:
 'A Vale mantm caixa robusto, porm com maior volatilidade de retorno no curto prazo devido ao ciclo de commodities e ao contexto macro global.',
 summaryMeta: { updatedAt: '06/02', source: 'RI/B3/CVM' },
 pillars: contextualize(
 pillars.map((pillar) => ({
 ...pillar,
 summary:
 pillar.name === 'Retorno'
 ? 'Ateno porque o retorno recuou no trimestre em funo do ciclo de preos.'
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
 ? 'Atualizao de guidance e sensibilidade ao preo de minrio.'
 : item.title,
 beforeAfter: index === 0 ? 'Antes: guidance neutro ? Depois: vis mais cauteloso' : undefined,
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
 summary: 'Hoje o preo reflete maior sensibilidade ao ciclo de minrio e China.',
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

function normalizeCompanyData(raw: unknown, companyId: string, ticker: string): CompanyData | null {
 if (!raw || typeof raw !== 'object') return null;
 const payload = sanitizePayloadText(raw as Partial<CompanyData>);
 if (!payload.radarScores || !payload.priceData) return null;

 const applyContext = <T extends object>(items: T[] | undefined): Array<T & { companyId: string; ticker: string }> =>
 (items ?? []).map((item) => ({
 ...item,
 companyId: (item as { companyId?: string }).companyId ?? companyId,
 ticker: (item as { ticker?: string }).ticker ?? ticker,
 }));

 return {
 companyId,
 ticker,
 radarScores: payload.radarScores,
 radarPreviousScores: payload.radarPreviousScores,
 diagnosisHeadline: payload.diagnosisHeadline ?? '',
 strongest: payload.strongest ?? { title: '', score: '', badge: '', trend: '', summary: '' },
 watchout: payload.watchout ?? { title: '', score: '', badge: '', trend: '', summary: '' },
 monitor: payload.monitor ?? { pillar: '', text: '' },
 summaryScan: payload.summaryScan ?? {
 motherLine: '',
 strength: { pillar: '', text: '' },
 attention: { pillar: '', text: '' },
 monitor: { pillar: '', text: '' },
 },
 summaryText: payload.summaryText ?? '',
 summaryMeta: payload.summaryMeta ?? {},
 pillars: applyContext(payload.pillars as CompanyData['pillars'] | undefined),
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

async function fetchCompanyData(companyId: string, ticker: string): Promise<CompanyData | null> {
 const mockSource = mockDataByCompany[companyId] ?? mockDataByCompany[ticker] ?? null;
 if (FORCE_COMPANY_ANALYSIS_MOCK) {
 return mockSource ? normalizeCompanyData(mockSource, companyId, ticker) : null;
 }
 try {
 const endpoint = `${API_BASE_URL}/api/company-analysis/${encodeURIComponent(ticker)}`;
 const response = await fetch(endpoint, {
 headers: { Accept: 'application/json' },
 });
 if (!response.ok) return mockSource ? normalizeCompanyData(mockSource, companyId, ticker) : null;
 const data = await response.json();
 return normalizeCompanyData(data, companyId, ticker) ?? (mockSource ? normalizeCompanyData(mockSource, companyId, ticker) : null);
 } catch {
 return mockSource ? normalizeCompanyData(mockSource, companyId, ticker) : null;
 }
}

const statusTone = {
 Risco: { dot: 'bg-[#DC2626]', badge: 'border-[#FECACA] bg-[#FEF2F2] text-[#DC2626]' },
 Atencao: { dot: 'bg-[#D97706]', badge: 'border-[#FDE68A] bg-[#FFFBEB] text-[#D97706]' },
 Saudavel: { dot: 'bg-[#0E9384]', badge: 'border-[#99F6E4] bg-[#F0FDFA] text-[#0E9384]' },
} as const;

const pillarOrder: PillarName[] = ['Divida', 'Caixa', 'Margens', 'Retorno', 'Proventos'];

function pillarLabel(pillar: PillarName) {
 return pillar === 'Divida' ? 'Divida' : pillar;
}

function statusFromScore(score: number): Status {
 if (score < 50) return 'Risco';
 if (score < 70) return 'Atencao';
 return 'Saudavel';
}

function statusLabel(status: Status) {
 return status === 'Atencao' ? 'Atencao' : status;
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
 label: 'Ateno',
 chip: 'border-[#F6DEA9] bg-[#FFF9ED] text-[#9A6A0F]',
 },
 saudavel: {
 stroke: '#168E7D',
 fill: '#168E7D',
 label: 'Saudvel',
 chip: 'border-[#AEE3D8] bg-[#F1FCF9] text-[#0F6F61]',
 },
};

function pillarDisplayLabel(pillar: PillarName) {
 return pillar === 'Divida' ? 'Dvida' : pillar;
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
 highlightIndex !== undefined
 ? padding + (Math.max(Math.min(highlightIndex, Math.max(values.length - 1, 0)), 0) * (width - padding * 2)) / Math.max(values.length - 1, 1)
 : null;
 const markerY =
 highlightIndex !== undefined && values[highlightIndex] !== undefined
 ? height - padding - ((values[highlightIndex] - min) / span) * (height - padding * 2)
 : null;
 const hasReference = typeof referenceValue === 'number' && Number.isFinite(referenceValue);
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
 {isAboveReference ? 'Acima da referencia historica' : 'Abaixo da referencia historica - monitorar tendencia'}
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
 return Number.isFinite(parsed) ? parsed : null;
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
 const scaled = trimTrailingZerosBr(formatNumberBr(value / 1_000_000_000, 2));
 return `R$ ${scaled} bi`;
 }
 if (abs >= 1_000_000) {
 const scaled = trimTrailingZerosBr(formatNumberBr(value / 1_000_000, 2));
 return `R$ ${scaled} mi`;
 }
 if (abs >= 1_000) {
 const scaled = trimTrailingZerosBr(formatNumberBr(value / 1_000, 1));
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

const monitorListByPillar: Record<PillarName, string[]> = {
 Divida: ['Perda da posicao de caixa liquido', 'Aumento da alavancagem', 'Queda da cobertura de juros'],
 Caixa: ['Conversao de caixa em queda', 'Pressao de capital de giro', 'Necessidade de capex acima do esperado'],
 Margens: ['Pressao de custos', 'Queda de repasse de precos', 'Perda de eficiencia operacional'],
 Retorno: ['Queda de ROIC/ROE', 'Aumento de capital sem retorno', 'Desaceleracao de produtividade'],
 Proventos: ['Aumento de volatilidade do payout', 'Queda de cobertura de proventos', 'Mudanca de politica de distribuicao'],
};

function baseIndicatorLabel(pillar: PillarData, metric?: PillarMetric, value?: number | null) {
 if (pillar.name === 'Divida') return 'Caixa liquido';
 return metric?.label ?? pillar.chart.title.replace('Evidencia: ', '');
}

function verdictSummary(pillar: PillarData, todayText: string, referenceText: string) {
 const comparison = (() => {
 if (pillar.name === 'Divida') return `acima da referencia historica de 5 anos de ${referenceText}`;
 if (pillar.name === 'Caixa') return `com referencia historica de 5 anos em ${referenceText}`;
 if (pillar.name === 'Margens') return `com referencia historica de 5 anos em ${referenceText}`;
 if (pillar.name === 'Retorno') return `com referencia historica de 5 anos em ${referenceText}`;
 return `com referencia historica de 5 anos em ${referenceText}`;
 })();
 return `A empresa encerrou o periodo com ${todayText}, ${comparison}.`;
}

function meaningCopy(pillar: PillarData, todayText: string) {
 if (pillar.name === 'Divida') {
 return 'A empresa mantem caixa liquido, o que reduz a pressao financeira e indica uma estrutura de capital mais confortavel no momento.';
 }
 if (pillar.name === 'Caixa') return 'A geracao de caixa sustenta execucao e reduz necessidade de financiamento externo.';
 if (pillar.name === 'Margens') return 'A eficiencia operacional segue como principal determinante da qualidade do resultado.';
 if (pillar.name === 'Retorno') return 'O retorno indica quao bem a empresa transforma capital em resultado.';
 return 'A consistencia de proventos ajuda a reduzir surpresa na remuneracao ao acionista.';
}

function signalCardCopy(pillar: PillarData, indicatorLabel: string, todayText: string, referenceText: string, fallbackWhy: string) {
 if (pillar.name === 'Divida') {
 return {
 title: 'Caixa liquido',
 body: 'A empresa encerrou o periodo com caixa liquido acima da sua referencia historica.',
 why: 'isso reduz a pressao financeira e aumenta a margem de seguranca.',
 };
 }
 return {
 title: indicatorLabel,
 body: `A empresa encerrou o periodo com ${todayText}, frente a referencia historica de ${referenceText}.`,
 why: fallbackWhy,
 };
}

function ctaCopyByPillar(pillar: PillarData) {
 if (pillar.name === 'Divida') {
 return {
 title: 'Quer acompanhar esse risco sem revisar balanco manualmente?',
 button: 'Me avise se a divida piorar',
 };
 }
 return {
 title: 'Quer ser avisado se este pilar sair da faixa saudavel?',
 button: `Criar alerta de deterioracao de ${pillarLabel(pillar.name)}`,
 };
}

function debtPrimaryNarrative(value: number | null, template: string, label?: string) {
 if (value === null || !Number.isFinite(value)) return 'caixa liquido sem dado atualizado';
 const hasCurrency = template.includes('R$') || (label ? isCurrencyMetricLabel(label) : false);
 if (hasCurrency) return `caixa liquido de ${formatCompactCurrencyBr(Math.abs(value))}`;
 return `caixa liquido em ${formatComparableValue(Math.abs(value), template, label)}`;
}

function formatDeltaForPillar(trend?: string) {
 const delta = parseTrendDelta(trend);
 if (typeof delta !== 'number' || !Number.isFinite(delta) || delta === 0) return 'Estavel vs periodo anterior';
 const sign = delta > 0 ? '+' : '-';
 return `${sign}${Math.abs(delta).toFixed(1).replace('.', ',')} vs periodo anterior`;
}

function baseMetricReadingHint(pillar: PillarData, metric?: PillarMetric) {
 const label = (metric?.label ?? '').toLowerCase();
 if (pillar.name === 'Divida') {
 return 'Caixa liquido tende a indicar uma estrutura financeira mais confortavel.';
 }
 if (pillar.name === 'Caixa') return 'Quanto maior e mais estavel, melhor.';
 if (pillar.name === 'Margens') return 'Quanto maior e mais consistente, melhor.';
 if (pillar.name === 'Retorno') return 'Quanto maior acima da referencia, melhor.';
 return 'Consistencia importa mais que picos isolados.';
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

function parseMultipleValue(value?: string | null) {
 if (!value) return null;
 const cleaned = value.replace(/\s+/g, '').replace('x', '').replace(',', '.');
 const parsed = Number.parseFloat(cleaned);
 return Number.isFinite(parsed) ? parsed : null;
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
 const [selectedPriceMetric, setSelectedPriceMetric] = useState<PriceMetric>('P/L');
 const [changesWindow, setChangesWindow] = useState<FeedWindow>('90 dias');
 const [changesFocus, setChangesFocus] = useState<ChangesFocusFilter>('Mais relevantes');
 const [changesPillarFilter, setChangesPillarFilter] = useState<ChangePillarTag | 'Todos'>('Todos');
 const [expandedRoutineGroups, setExpandedRoutineGroups] = useState<Record<string, boolean>>({});
 const [eventsWindow, setEventsWindow] = useState<FeedWindow>('30 dias');
 const [eventsFocus, setEventsFocus] = useState<EventsFocusFilter>('Mais relevantes');
 const [eventsPillarFilter, setEventsPillarFilter] = useState<ChangePillarTag | 'Todos'>('Todos');
 const [expandedEventRoutineGroups, setExpandedEventRoutineGroups] = useState<Record<string, boolean>>({});
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
 setSelectedPriceMetric(prefs.priceMetric);
 setChangesWindow(prefs.changesWindow);
 setChangesFocus('Mais relevantes');
 setChangesPillarFilter('Todos');
 setExpandedRoutineGroups({});
 setEventsWindow(prefs.eventsWindow);
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
 const companyStatus: Status = scoreAverage < 50 ? 'Risco' : scoreAverage < 70 ? 'Atencao' : 'Saudavel';
 const mapScores = activeData?.radarScores ?? radarScores;
 const mapPreviousScores = activeData?.radarPreviousScores ?? radarPreviousScores;
 const pillarDataByName = new Map((activeData?.pillars ?? []).map((pillar) => [pillar.name, pillar]));
 const mapPillarData: PillarMapDatum[] = pillarOrder.map((pillar) => {
 const score = mapScores[pillar];
 const status = statusFromScore(score);
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
 const mapPillarEntries = pillarOrder.map((pillar) => ({ pillar, score: mapScores[pillar], status: statusFromScore(mapScores[pillar]) }));
 const healthyPillars = mapPillarEntries.filter((entry) => entry.status === 'Saudavel');
 const attentionPillars = mapPillarEntries.filter((entry) => entry.status === 'Atencao');
 const riskPillars = mapPillarEntries.filter((entry) => entry.status === 'Risco');
 const mostCriticalPillar = [...mapPillarEntries].sort((a, b) => a.score - b.score)[0];
 const strongestPillar = [...mapPillarEntries].sort((a, b) => b.score - a.score)[0];
 const actionsDisabled = showSkeleton;
 const availablePriceMetrics = (Object.keys(activeData?.priceData.metricSeries ?? {}) as PriceMetric[]);
const activePriceSeries =
 (activeData?.priceData.metricSeries && activeData.priceData.metricSeries[selectedPriceMetric]) ||
 (activeData?.priceData.metricSeries && availablePriceMetrics.length > 0 ? activeData.priceData.metricSeries[availablePriceMetrics[0]] : undefined) ||
 null;
const activePriceRows = (activeData?.priceData.rows ?? []).filter((row) => row.companyId === companyContext.companyId && row.metric === selectedPriceMetric);
const activePriceRow = activePriceRows[0] ?? (activeData?.priceData.rows ?? []).find((row) => row.companyId === companyContext.companyId);
 const currentMultipleValue = parseMultipleValue(activePriceRow?.current);
 const historicalMultipleValue = parseMultipleValue(activePriceRow?.historical);
 const sectorMultipleValue = parseMultipleValue(activePriceRow?.sector);
 const premiumVsHistorical = currentMultipleValue != null && historicalMultipleValue != null && historicalMultipleValue > 0
 ? ((currentMultipleValue / historicalMultipleValue) - 1) * 100
 : null;
 const premiumVsSector = currentMultipleValue != null && sectorMultipleValue != null && sectorMultipleValue > 0
 ? ((currentMultipleValue / sectorMultipleValue) - 1) * 100
 : null;
 const priceContextPosition = (() => {
 if (premiumVsHistorical == null) return 'Sem base suficiente para classificar a faixa historica agora.';
 if (premiumVsHistorical <= 5) return 'Hoje o mercado esta pagando um premio leve sobre o historico recente.';
 if (premiumVsHistorical <= 15) return 'Hoje o mercado esta pagando um premio moderado sobre o historico recente.';
 return 'O multiplo esta acima do historico e ja exige continuidade de qualidade e crescimento para se sustentar.';
 })();
 const priceReadingLine = (() => {
 if (!activePriceRow) return 'Sem dados suficientes para leitura de valuation neste momento.';
 if (historicalMultipleValue == null) return `O ativo negocia em ${activePriceRow.current} no indicador ${selectedPriceMetric}.`;
 if (currentMultipleValue != null && historicalMultipleValue != null && currentMultipleValue >= historicalMultipleValue) {
  return `O ativo negocia acima da sua mediana historica em ${selectedPriceMetric}.`;
 }
 return `O ativo negocia abaixo da sua mediana historica em ${selectedPriceMetric}.`;
 })();
 const priceContextLine = (() => {
 if (!activePriceRow) return 'Sem comparativo historico e setorial para qualificar a leitura.';
 if (historicalMultipleValue == null || sectorMultipleValue == null) return `Hoje esta em ${activePriceRow.current} em ${selectedPriceMetric}.`;
 return `Hoje esta em ${activePriceRow.current}, acima da mediana de 5 anos (${activePriceRow.historical}) e tambem acima do setor (${activePriceRow.sector}). Isso sugere premio sobre o historico recente e exige continuidade de qualidade e crescimento para se sustentar, mas nao significa automaticamente que o ativo esteja caro.`;
 })();
 const pricePremiumProfile = (() => {
 const comparisons = [premiumVsHistorical, premiumVsSector].filter((value): value is number => value != null);
 if (comparisons.length === 0) return 'Sem base suficiente para classificar o premio.';
 return 'Negocia com premio sobre historico e setor.';
 })();
 const companySourceRows = (activeData?.sourceRows ?? []).filter((row) => row.companyId === companyContext.companyId);
 const sourceRowsWithRelevance = companySourceRows.map((row) => {
 const isPrimary = row.category === 'Financeiro' || row.category === 'Eventos' || row.category === 'Preco';
 const statusLabel = row.status === 'Atualizado' ? 'Atualizado' : isPrimary ? 'Desatualizada' : 'Mais antiga';
 const consequence = row.status === 'Atualizado'
 ? isPrimary
  ? 'Sustenta a leitura atual.'
  : 'Complementar atualizada.'
 : isPrimary
 ? 'Desatualizada; leitura pede cautela.'
 : 'Complementar; nao altera a leitura principal.';
 return { ...row, isPrimary, consequence, statusLabel };
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
 ? (outdatedComplementarySources > 0 ? 'Alta no nucleo da leitura' : 'Alta')
 : 'Em revisao';
 const sourceConfidenceTone = sourceConfidenceLabel === 'Alta'
 ? 'border-[#99F6E4] bg-[#F0FDFA] text-[#0E9384]'
 : sourceConfidenceLabel === 'Moderada'
 ? 'border-[#FDE68A] bg-[#FFFBEB] text-[#D97706]'
 : 'border-[#E5E7EB] bg-[#F9FAFB] text-[#64748B]';
 const sourceConfidenceSummary = outdatedPrimarySources > 0
 ? `A leitura atual tem ${outdatedPrimarySources} fonte principal desatualizada e pede cautela em parte do diagnostico.`
 : `A leitura atual esta apoiada em fontes principais atualizadas. ${outdatedComplementarySources > 0 ? `Ha ${outdatedComplementarySources} fonte complementar mais antiga, sem comprometer a leitura central neste momento.` : 'Nao ha alerta de desatualizacao relevante no conjunto principal.'}`;
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
 if (base && base.split(' ').length >= 10) return base;
 const pillar = (activeData?.strongest.title ?? '').toLowerCase();
 if (pillar.includes('divid') || pillar.includes('caixa')) {
 return 'A empresa mantem caixa liquido, o que reduz a pressao financeira e sustenta uma estrutura de capital mais confortavel no momento.';
 }
 return `A principal forca hoje esta em ${activeData?.strongest.title ?? 'este pilar'}, sustentando a leitura de curto prazo da empresa.`;
 })();
 const watchoutHumanLine = (() => {
 const base = activeData?.watchout.summary?.trim();
 const fallback = 'As margens pedem acompanhamento nos proximos fechamentos para confirmar se a pressao e pontual ou persistente.';
 if (!base) return fallback;
 const normalized = base.toLowerCase();
 if (normalized.includes('forte') || normalized.includes('saudavel') || normalized.includes('muito bom')) {
 return fallback;
 }
 return base;
 })();
 const watchoutBadgeLabel = (() => {
 const raw = (activeData?.watchout.badge ?? '').toLowerCase();
 if (!raw) return 'Monitorar';
 if (raw.includes('saud')) return 'Em observacao';
 if (raw.includes('aten')) return 'Monitorar';
 if (raw.includes('ris')) return 'Em observacao';
 return activeData?.watchout.badge ?? 'Monitorar';
 })();
 const summaryNarrative = (() => {
 const base = activeData?.summaryScan.motherLine?.trim();
 if (base && base.length > 120) return base;
 const strength = activeData?.summaryScan.strength.pillar ?? activeData?.strongest.title ?? 'Divida';
 const attention = activeData?.summaryScan.attention.pillar ?? activeData?.watchout.title ?? 'Margens';
 return `${activeCompany.name} segue com estrutura financeira mais confortavel, com destaque em ${strength}. O principal ponto de atencao esta em ${attention}, que merece acompanhamento nos proximos fechamentos para confirmar se a pressao e pontual ou persistente.`;
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
  const type = newest?.type ?? 'Atualizacao';
  const groupTitle = `${pillar} - ${items.length} atualizacoes rotineiras no periodo`;
  return {
  groupKey,
  items: items.sort((a, b) => b.dateSortValue - a.dateSortValue),
  pillar,
  type,
  groupTitle,
  summary: `Eventos recorrentes de ${type.toLowerCase()}, sem mudanca estrutural relevante na leitura atual da empresa.`,
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
  groupTitle: `Outras rotinas - ${overflowRoutineSingles.length} atualizacoes`,
  summary: 'Atualizacoes recorrentes agrupadas para reduzir ruido na leitura mobile.',
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
 const principalChange = structuralChanges[0] ?? null;

 const periodMostAffected = (() => {
 const counter = new Map<ChangePillarTag, number>();
 visibleChangesByPillar.forEach((change) => {
  counter.set(change.pillar, (counter.get(change.pillar) ?? 0) + 1);
 });
 if (counter.size === 0) return 'A classificar' as ChangePillarTag;
 return [...counter.entries()].sort((a, b) => b[1] - a[1])[0][0];
 })();

 const routineCount = enrichedChanges.filter((change) => change.level === 'Rotina').length;
 const structuralCount = enrichedChanges.filter((change) => change.level === 'Estrutural').length;
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
  const type = newest?.typeLabel ?? 'Atualizacao';
  return {
  groupKey,
  items: items.sort((a, b) => b.dateSortValue - a.dateSortValue),
  pillar,
  groupTitle: `${pillar} - ${items.length} atualizacoes nos ultimos ${eventsWindow.replace(' dias', '')} dias`,
  summary: `Eventos recorrentes de ${type.toLowerCase()}, sem mudanca estrutural relevante na leitura atual da empresa.`,
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
  groupTitle: `Outras rotinas - ${overflowTimelineRoutineSingles.length} atualizacoes`,
  summary: 'Atualizacoes recorrentes agrupadas para reduzir ruido na leitura mobile.',
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
  <span>·</span>
  <span>{change.date}</span>
  <span>·</span>
  <span className={cx('rounded-full px-2 py-0.5', change.level === 'Estrutural' ? 'border border-[#F6C9BF] bg-[#FFF4F1] text-[#B54834]' : change.level === 'Relevante' ? 'border border-[#F6DEA9] bg-[#FFF9ED] text-[#9A6A0F]' : 'border border-[#CFEAE4] bg-[#F2FCF9] text-[#0F6F61]')}>
   {change.severityLabel}
  </span>
  </p>
  <h3 className="mt-2 text-[15px] font-semibold text-[#111827]">{change.title}</h3>
  <p className="mt-2 text-[13px] text-[#374151]">{change.interpretation}</p>
  <p className="mt-2 text-[12px] font-semibold uppercase tracking-wide text-[#64748B]">Por que isso importa:</p>
  <p className="text-[13px] text-[#475569]">{change.whyItMatters}</p>
  <p className="mt-3 text-[11px] text-[#8B95A5]">
   Fonte: {safeMeta(change.source.docLabel)} · Atualizado em {safeMeta(change.date)} · Status: Atualizado
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
  <span>·</span>
  <span>{timelineEvent.date}</span>
  <span>·</span>
  <span className={cx('rounded-full px-2 py-0.5', timelineEvent.level === 'Estrutural' ? 'border border-[#F6C9BF] bg-[#FFF4F1] text-[#B54834]' : timelineEvent.level === 'Relevante' ? 'border border-[#F6DEA9] bg-[#FFF9ED] text-[#9A6A0F]' : 'border border-[#CFEAE4] bg-[#F2FCF9] text-[#0F6F61]')}>
   {timelineEvent.severityLabel}
  </span>
  </p>
  <h3 className="mt-2 text-[15px] font-semibold text-[#111827]">{timelineEvent.title}</h3>
  <p className="mt-2 text-[13px] text-[#374151]">{timelineEvent.interpretation}</p>
  <p className="mt-2 text-[12px] font-semibold uppercase tracking-wide text-[#64748B]">Por que isso importa:</p>
  <p className="text-[13px] text-[#475569]">{timelineEvent.whyItMatters}</p>
  <p className="mt-3 text-[11px] text-[#8B95A5]">
   Fonte: {safeMeta(timelineEvent.source)} · Atualizado em {safeMeta(timelineEvent.date)} · Status: Monitorado
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
 if (!activeData?.priceData.metricSeries) return;
 const metrics = Object.keys(activeData.priceData.metricSeries) as PriceMetric[];
 if (metrics.length > 0 && !metrics.includes(selectedPriceMetric)) {
 setSelectedPriceMetric(metrics[0]);
 }
 }, [activeData, selectedPriceMetric]);

 useEffect(() => {
 const openPillar =
 (Object.entries(expandedPillars).find(([, isOpen]) => isOpen)?.[0] as Exclude<CompanyPreferences['lastOpenPillar'], null> | undefined) ??
 null;
 savePreferences(companyContext.companyId, {
 activeTab,
 changesWindow,
 eventsWindow,
 priceMetric: selectedPriceMetric,
 lastOpenPillar: openPillar,
 });
 }, [activeTab, changesWindow, companyContext.companyId, eventsWindow, expandedPillars, selectedPriceMetric]);

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
 {filter === 'Atencao' ? 'Ateno' : filter}
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
 Preco atual: {safeMeta(activeData?.priceData.current)} <span className="text-[#9CA3AF]">+0,8%</span>
 </span>
 </div>
 <p className="mt-1 truncate text-[13px] text-[#6B7280]">{activeCompany.description}</p>
 <div className="mt-2 flex flex-wrap items-center gap-3 text-[12px] text-[#6B7280]">
 <span>Atualizado em {safeMeta(activeData?.summaryMeta.updatedAt)}</span>
 <span>Setor: Industria | Bens de capital</span>
 <span title="Ver fontes na aba Fontes">Fontes: CVM, B3 e RI</span>
 <div className="relative">
 <button className="text-[12px] text-[#6B7280] hover:text-[#374151] hover:underline" onClick={() => setShowHeaderUpdateDetails((prev) => !prev)}>
 Ver detalhes da atualizacao
 </button>
 {showHeaderUpdateDetails && (
 <div className="absolute left-0 top-6 z-30 min-w-[220px] rounded-lg border border-[#E5E7EB] bg-white p-3 text-[12px] text-[#4B5563] shadow-lg">
 <p>Financeiro: {safeMeta(activeData?.summaryMeta.updatedAt)}</p>
 <p>Eventos: {safeMeta(activeData?.summaryMeta.updatedAt)}</p>
 <p>Preco: {safeMeta(activeData?.priceData.updatedAt)}</p>
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
 Notificaes
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
 ? `Agenda (prximos eventos) (${eventsCount})`
 : tab === 'Preco'
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
 <p className="mt-2 text-[12px] text-[#6B7280]">Pesos: Dvida 25%, Caixa 20%, Margens 20%, Retorno 20%, Proventos 15%.</p>
 <p className="mt-1 text-[12px] text-[#6B7280]">Regra: score 0-100 por pilar com cortes em saudvel, ateno e risco.</p>
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
 <p>Frmula base: valor atual vs histrico de 5 anos.</p>
 <p>Notas: sinalizamos ponto forte/ateno conforme direo do pilar.</p>
 <p>Limitaes: sujeito a reviso aps novo release da companhia.</p>
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
 <h2 className="text-[15px] font-semibold text-[#111827]">Sem dados ainda para esta empresa (em ingesto)</h2>
 </article>
 ) : (
 <>
{activeTab === 'Resumo' && (
<div className="space-y-4">
<article className="rounded-xl border border-[#E8EAED] bg-white p-5">
 <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#6B7280]">Diagnostico rapido</p>
 <h2 className="mt-2 text-[20px] font-semibold leading-tight text-[#0B1220]">
 {activeData?.diagnosisHeadline ?? 'A empresa permanece estruturalmente saudavel, com um ponto de atencao concentrado em divida.'}
 </h2>
 <p className="mt-2 text-[13px] text-[#6B7280]">Entenda o que sustenta a empresa hoje, o que mudou e o que vale monitorar daqui para frente.</p>
 <div className="mt-4 flex flex-wrap items-center gap-2">
 <button
 className="rounded-lg border border-[#0E9384] bg-[#0E9384] px-3.5 py-2 text-[13px] font-semibold text-white"
 onClick={() => goToPillar(activeData?.strongest.title ?? 'Divida')}
 >
 Ver principal forca
 </button>
 <button
 className="rounded-lg border border-[#F6DEA9] bg-[#FFFBEB] px-3.5 py-2 text-[13px] font-semibold text-[#9A6A0F]"
 onClick={() => goToPillar(activeData?.watchout.title ?? 'Margens')}
 >
 Ver principal atencao
 </button>
 </div>
 </article>

 <div className="grid grid-cols-12 gap-4">
 <div className="col-span-12 space-y-4 xl:col-span-8">
 <article className="rounded-xl border border-[#E8EAED] border-l-[3px] border-l-[#0E9384] bg-white p-4">
 <div className="flex items-center gap-2">
 <BarChart3 className="h-4 w-4 text-[#0E9384]" />
 <h3 className="text-[14px] font-semibold text-[#111827]">Principal Forca</h3>
 </div>
 <div className="mt-4">
 <p className="text-[24px] font-bold text-[#0E9384]">{activeData?.strongest.title ?? 'Divida'}</p>
 <p className="mt-3 text-[14px] leading-relaxed text-[#4B5563]">
 {strongestHumanLine}
 </p>
 <div className="mt-3 flex flex-wrap items-center gap-2 text-[12px]">
 <span className="rounded-full border border-[#D1D5DB] bg-white px-2.5 py-1 font-semibold text-[#374151]">{activeData?.strongest.score ?? '95/100'}</span>
 <span className="rounded-full border border-[#99F6E4] bg-[#F0FDFA] px-2.5 py-1 font-semibold text-[#0E9384]">{activeData?.strongest.badge ?? ''}</span>
 <span className="rounded-full border border-[#E5E7EB] bg-[#F9FAFB] px-2.5 py-1 text-[#6B7280]">Variacao: {activeData?.strongest.trend ?? 'estavel'}</span>
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
 <h3 className="text-[14px] font-semibold text-[#111827]">Principal Atencao</h3>
 </div>
 <div className="mt-4">
 <p className="text-[24px] font-bold text-[#D97706]">{activeData?.watchout.title ?? 'Margens'}</p>
 <p className="mt-3 text-[14px] leading-relaxed text-[#4B5563]">
 {watchoutHumanLine}
 </p>
 <div className="mt-3 flex flex-wrap items-center gap-2 text-[12px]">
 <span className="rounded-full border border-[#D1D5DB] bg-white px-2.5 py-1 font-semibold text-[#374151]">{activeData?.watchout.score ?? '61/100'}</span>
 <span className="rounded-full border border-[#FDE68A] bg-[#FFFBEB] px-2.5 py-1 font-semibold text-[#D97706]">{watchoutBadgeLabel}</span>
 <span className="rounded-full border border-[#E5E7EB] bg-[#F9FAFB] px-2.5 py-1 text-[#6B7280]">Variacao: {activeData?.watchout.trend ?? 'piora'}</span>
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
 <p className="mt-1 text-[12px] text-[#667085]">Visao geral para apoiar a leitura inicial, sem substituir o diagnostico.</p>
 <div className="mt-2">
 <PillarMap
 data={mapPillarData}
 companyStatus={companyStatus}
 onSelectPillar={(pillar) => goToPillar(pillar)}
 />
 </div>
 <p className="mt-3 rounded-lg border border-[#E5E7EB] bg-[#F9FAFB] px-3 py-2 text-[12px] text-[#475467]">
 Atencao principal em {activeData?.watchout.title ?? 'Margens'}; forca relativa em {activeData?.strongest.title ?? 'Divida'}.
 </p>
 </article>
 </div>

 <article className="rounded-xl border border-[#E8EAED] bg-white p-4">
 <div className="flex items-center justify-between">
 <div>
 <h2 className="text-[15px] font-semibold text-[#111827]">Resumo em 60s</h2>
 <p className="text-[12px] text-[#9CA3AF]">Uma visao simples do que sustenta a empresa hoje e do que merece acompanhamento.</p>
 </div>
 <button className="text-[12px] text-[#0E9384] hover:underline" onClick={openSummaryEvidence}>Ver fonte</button>
 </div>
 <p className="mt-4 text-[14px] leading-relaxed text-[#1F2937]">
 {summaryNarrative}
 </p>
 <div className="mt-3 space-y-1 text-[13px] text-[#374151]">
 <p><span className="font-semibold">Forca principal:</span> {activeData?.summaryScan.strength.pillar ?? activeData?.strongest.title ?? 'Divida'}</p>
 <p><span className="font-semibold">Atencao principal:</span> {activeData?.summaryScan.attention.pillar ?? activeData?.watchout.title ?? 'Margens'}</p>
 <p><span className="font-semibold">O que monitorar:</span> {activeData?.summaryScan.monitor.text ?? 'Evolucao das margens no proximo fechamento.'}</p>
 </div>
 <div className="mt-3 flex flex-wrap items-center gap-2 text-[11px]">
 <span className="rounded-full bg-[#F3F4F6] px-2.5 py-1 text-[#6B7280]">Atualizado em {safeMeta(activeData?.summaryMeta.updatedAt)}</span>
 <span className="rounded-full bg-[#F3F4F6] px-2.5 py-1 text-[#6B7280]">Fonte: {safeMeta(activeData?.summaryMeta.source)}</span>
 <span className="rounded-full border border-[#99F6E4] bg-[#F0FDFA] px-2.5 py-1 text-[#0E9384]">Confianca: Alta</span>
 </div>
 </article>

 <article className="rounded-xl border border-[#D6F5EE] bg-[#F4FFFC] p-5">
 <div className="flex items-center justify-between gap-3">
 <h2 className="text-[15px] font-semibold text-[#111827]">Proximas acoes</h2>
 <button className="text-[12px] text-[#0E9384] hover:underline" onClick={openSummaryEvidence}>Ver fonte</button>
 </div>
 <p className="mt-1 text-[12px] text-[#667085]">Feche a leitura com um proximo passo util e verificavel.</p>
 <div className="mt-3 flex flex-wrap items-center gap-2">
 <button className={cx('rounded-lg border border-[#0E9384] bg-[#0E9384] px-3.5 py-2 text-[13px] font-semibold text-white', actionsDisabled ? 'cursor-not-allowed opacity-50' : '')} disabled={actionsDisabled} onClick={(event) => guardAction(event)}>
 Criar alerta da principal atencao
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
 <h2 className="text-[15px] font-semibold text-[#111827]">Sintese do diagnostico por pilares</h2>
 <p className="mt-1 text-[13px] text-[#6B7280]">
 {healthyPillars.length} pilares saudaveis, {attentionPillars.length} em atencao e {riskPillars.length} em risco.
 </p>
 <div className="mt-3 flex flex-wrap gap-2 text-[12px] text-[#374151]">
 <span className="rounded-full border border-[#E5E7EB] bg-[#F9FAFB] px-2.5 py-1">Principal risco: {mostCriticalPillar ? pillarLabel(mostCriticalPillar.pillar) : ''}</span>
 <span className="rounded-full border border-[#E5E7EB] bg-[#F9FAFB] px-2.5 py-1">Principal sustentacao: {strongestPillar ? pillarLabel(strongestPillar.pillar) : ''}</span>
 </div>
 </article>
 {(activeData?.pillars ?? []).filter((p) => p.companyId === companyContext.companyId).length === 0 && (
 <article className="rounded-xl border border-[#E8EAED] bg-white p-5">
 <p className="text-[14px] text-[#6B7280]">Ainda no temos dados suficientes para este indicador.</p>
 <p className="mt-1 text-[12px] text-[#9CA3AF]">ltima tentativa: {safeMeta(activeData?.summaryMeta.updatedAt)}</p>
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
 const baseMetric = pillar.metrics[0];
 const baseMetricValue = baseMetric ? toNumeric(baseMetric.value) : null;
 const baseMetricRef = median(pillar.chart.series5);
 const todayText = pillar.name === 'Divida'
 ? debtPrimaryNarrative(baseMetricValue, baseMetric?.value ?? '', baseMetric?.label)
 : formatComparableValue(baseMetricValue, baseMetric?.value ?? '', baseMetric?.label);
 const evidenceHeadline = pillar.name === 'Divida' ? todayText.replace(/^caixa liquido/, 'Caixa liquido') : todayText;
 const referenceText = pillar.name === 'Divida'
 ? formatComparableValue(Math.abs(baseMetricRef), baseMetric?.value ?? '', baseMetric?.label)
 : formatComparableValue(baseMetricRef, baseMetric?.value ?? '', baseMetric?.label);
 const indicatorLabel = baseIndicatorLabel(pillar, baseMetric, baseMetricValue);
 const verdictLine = verdictSummary(pillar, todayText, referenceText);
 const monitorItems = monitorListByPillar[pillar.name];
 const whatItMeans = meaningCopy(pillar, todayText);
 const mainEvidence = pillar.evidences.find((item) => item.label === 'Ponto forte') ?? pillar.evidences[0];
 const ctaCopy = ctaCopyByPillar(pillar);
 const signalCopy = signalCardCopy(pillar, indicatorLabel, todayText, referenceText, mainEvidence?.why ?? '');
 const chartVariant: 'line' | 'bar' = pillar.name === 'Proventos' ? 'bar' : 'line';

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
 <span className="text-[12px] text-[#6B7280]">{pillar.name === 'Divida' ? 'Estavel vs periodo anterior' : deltaLabel}</span>
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
 <p className="text-[12px] font-semibold text-[#475569]">Evidencia principal</p>
 <p className="mt-1 text-[13px] text-[#6B7280]">Indicador-base: {indicatorLabel}</p>
 <p className="mt-2 text-[28px] font-bold text-[#111827]">{evidenceHeadline}</p>
 <p className="text-[12px] text-[#6B7280]">Data: {baseMetric?.source.date ?? pillar.trust.updatedAt}</p>
 <p className="mt-2 text-[13px] text-[#1F2937]"><span className="font-semibold text-[#0F172A]">Referencia de 5 anos:</span> <span className="font-medium">{referenceText}</span></p>
 <p className="mt-1 text-[12px] text-[#6B7280]">Como ler: {baseMetricReadingHint(pillar, baseMetric)}</p>
 <details className="mt-1">
 <summary className="cursor-pointer text-[11px] text-[#94A3B8] hover:text-[#64748B]">Entender termo tecnico</summary>
 <p className="mt-1 text-[11px] text-[#94A3B8]">
 {pillar.name === 'Divida'
 ? 'Tecnicamente, isso representa uma posicao de divida liquida negativa.'
 : 'Leitura tecnica disponivel para quem quiser validar o calculo detalhado do indicador-base.'}
 </p>
 </details>
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
 referenceLabel="Ref. historica"
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
 <div className="mt-2 rounded-lg border border-[#D6F5EE] bg-[#F4FFFC] p-2.5">
 <span className={cx('rounded-full border px-2.5 py-1 text-[12px] font-semibold', mainEvidence.label === 'Ponto de atencao' ? 'border-[#FDE68A] bg-[#FFFBEB] text-[#D97706]' : 'border-[#99F6E4] bg-[#F0FDFA] text-[#0E9384]')}>
 {mainEvidence.label === 'Ponto de atencao' ? 'Ponto de atencao' : 'Ponto forte'}
 </span>
 <p className="mt-2 text-[14px] font-semibold text-[#111827]">{signalCopy.title}</p>
 <p className="mt-1 text-[13px] text-[#4B5563]">{signalCopy.body}</p>
 <p className="mt-1 text-[13px] text-[#4B5563]">Por que importa: {signalCopy.why}</p>
 <div className="mt-2 flex items-center justify-between">
 <span className="text-[12px] text-[#94A3B8]">Fonte: {mainEvidence.source.docLabel} {mainEvidence.source.date}</span>
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

 <section className="rounded-lg border border-[#D6F5EE] bg-[#F4FFFC] p-2.5">
 <p className="text-[13px] text-[#374151]">{ctaCopy.title}</p>
 <button className={cx('mt-2 rounded-md border border-[#0E9384] bg-[#0E9384] px-3 py-1.5 text-[13px] font-semibold text-white', actionsDisabled ? 'cursor-not-allowed opacity-50' : '')} disabled={actionsDisabled} onClick={(event) => guardAction(event, pillar.companyId)}>
 {ctaCopy.button}
 </button>
 </section>
 </div>
 </div>
 </article>
 );
 })}
 <p className="py-2 text-center text-[13px] text-[#6B7280]">Sentiu falta de algum indicador? <button className="text-[#0E9384] hover:underline">Sugerir indicador</button></p>
 </div>
 )}

 {activeTab === 'Mudancas' && (
 <div>
 <section className="mb-4 rounded-xl border border-[#DDE3EA] bg-white p-4">
  <h2 className="text-[15px] font-semibold text-[#111827]">O que mudou ({changesWindow})</h2>
  <p className="mt-1 text-[13px] text-[#5B6472]">Veja o que teve impacto real, o que foi rotina e quais pilares foram mais afetados.</p>
 <div className="mt-3 border-t border-[#EEF2F6] pt-3">
  <p className="text-[12px] font-semibold uppercase tracking-wide text-[#64748B]">Resumo do periodo</p>
  <p className="mt-2 max-w-[840px] text-[13px] leading-relaxed text-[#374151]">
   {principalChange
   ? `Nos ultimos ${changesWindow.replace(' dias', '')} dias, a principal mudanca identificada foi ${principalChange.title.toLowerCase()}, com possivel efeito no pilar de ${principalChange.pillar}. Fora isso, o periodo teve atualizacoes mais rotineiras, sem alteracao estrutural relevante na leitura geral da empresa.`
   : `Nos ultimos ${changesWindow.replace(' dias', '')} dias, o periodo foi marcado por atualizacoes de acompanhamento, sem mudanca estrutural dominante na leitura geral da empresa.`}
  </p>
  <div className="mt-2 space-y-1.5 text-[13px] text-[#374151]">
   <p className="font-semibold text-[#0F766E]">→ Pilar mais afetado: {periodMostAffected}</p>
   <p>→ Mudancas estruturais: {structuralCount}</p>
   <p>→ Atualizacoes de rotina: {routineCount}</p>
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
   <p className="text-[12px] font-semibold uppercase tracking-wide text-[#9F4636]">Principal mudanca do periodo</p>
   <p className="mt-1 text-[13px] text-[#1F2937]">
   {`${principalChange.title}, com possivel efeito no pilar de ${principalChange.pillar} nos proximos fechamentos.`}
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
   <p className="mt-1 text-[11px] text-[#9CA3AF]">Ultima atualizacao: {safeMeta(activeData?.summaryMeta.updatedAt)}</p>
  </article>
  )}

  {displayedStructural.length > 0 && (
  <section className="space-y-2">
   <p className="text-[12px] font-semibold uppercase tracking-wide text-[#9F4636]">Mudancas estruturais</p>
   {displayedStructural.map((change) => renderChangeCard(change))}
  </section>
  )}

  {displayedRelevant.length > 0 && (
  <section className="space-y-2">
   <p className="text-[12px] font-semibold uppercase tracking-wide text-[#9A6A0F]">Mudancas relevantes</p>
   {displayedRelevant.map((change) => renderChangeCard(change))}
  </section>
  )}

  {displayedRoutine.length > 0 && (
  <section className="space-y-2">
   <p className="text-[12px] font-semibold uppercase tracking-wide text-[#0F6F61]">Nivel 3 · Rotina</p>
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
  <h2 className="text-[15px] font-semibold text-[#111827]">Agenda (proximos eventos) ({eventsWindow})</h2>
  <p className="mt-1 text-[13px] text-[#5B6472]">Veja o que pode ter impacto real, o que e rotina e quais pilares podem ser mais afetados.</p>
  <div className="mt-3 border-t border-[#EEF2F6] pt-3">
  <p className="text-[12px] font-semibold uppercase tracking-wide text-[#64748B]">Resumo do periodo</p>
  <p className="mt-2 max-w-[840px] text-[13px] leading-relaxed text-[#374151]">
   {principalTimelineChange
   ? `${buildTimelineHeadlineLine({ title: principalTimelineChange.title, typeLabel: principalTimelineChange.typeLabel, mainPillar: principalTimelineChange.mainPillar }, eventsWindow)} Fora isso, o periodo traz eventos mais recorrentes, sem outro gatilho dominante na leitura geral.`
   : `Nos proximos ${eventsWindow.replace(' dias', '')} dias, a agenda esta concentrada em eventos de acompanhamento, sem gatilho dominante previsto.`}
  </p>
  <div className="mt-2 space-y-1.5 text-[13px] text-[#374151]">
   <p className="font-semibold text-[#0F766E]">→ Pilar mais sensivel: {timelineMostAffectedPillar}</p>
   <p>→ Gatilhos principais: {timelineStructuralCount}</p>
   <p>→ Atualizacoes de rotina: {timelineRoutineCount}</p>
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
   <p className="text-[12px] font-semibold uppercase tracking-wide text-[#9F4636]">Principal mudanca do periodo</p>
   <p className="mt-1 text-[13px] text-[#1F2937]">
   {`${principalTimelineChange.title}, com possivel efeito no pilar de ${principalTimelineChange.mainPillar} nos proximos fechamentos.`}
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
   <p className="mt-1 text-[11px] text-[#9CA3AF]">Ultima atualizacao: {safeMeta(activeData?.summaryMeta.updatedAt)}</p>
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
   <p className="text-[12px] font-semibold uppercase tracking-wide text-[#0F6F61]">Nivel 3 · Rotina</p>
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
   <p className="text-[13px] text-[#1F2937]">Feche a leitura com o proximo passo: acompanhe o impacto esperado ou garanta lembrete dos principais gatilhos.</p>
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

 {activeTab === 'Preco' && (
 <article className="rounded-xl border border-[#E8EAED] bg-white p-5">
 <div className="flex items-center justify-between">
 <h2 className="text-[15px] font-semibold text-[#111827]">Preo em contexto</h2>
 <div className="inline-flex rounded-full bg-[#F9FAFB] p-1">
 {(['P/L', 'EV/EBITDA', 'P/VP'] as PriceMetric[]).map((metric) => {
 const hasMetric = availablePriceMetrics.includes(metric);
 return (
 <button
 key={metric}
 onClick={() => hasMetric && setSelectedPriceMetric(metric)}
 disabled={!hasMetric}
 className={cx(
 'rounded-full px-2.5 py-1 text-[11px]',
 selectedPriceMetric === metric ? 'border border-[#99F6E4] bg-[#F0FDFA] font-semibold text-[#0E9384]' : 'text-[#6B7280]',
 !hasMetric ? 'cursor-not-allowed opacity-40' : ''
 )}
 >
 {metric}
 </button>
 );
 })}
 </div>
 </div>
 <div className="mt-2 space-y-1.5">
 <p className="text-[12px] font-semibold uppercase tracking-wide text-[#64748B]">Leitura atual</p>
 <p className="text-[14px] font-medium text-[#111827]">{priceReadingLine}</p>
 <p className="text-[12px] font-semibold uppercase tracking-wide text-[#64748B]">Contexto</p>
 <p className="text-[13px] text-[#6B7280]">{priceContextLine}</p>
 </div>
 <p className="mt-1 text-[11px] text-[#9CA3AF]">Fonte: {safeMeta(activeData?.priceData.source)} Atualizado em: {safeMeta(activeData?.priceData.updatedAt)}</p>
 <p className="mt-1 text-[11px] text-[#9CA3AF]">Preco nominal: {safeMeta(activeData?.priceData.current)} (apoio de contexto, nao sinal principal).</p>

 <div className="mt-4 grid gap-2 sm:grid-cols-3">
 <div className="rounded-lg border border-[#E5EAF1] bg-[#F8FAFD] px-3 py-2">
 <p className="text-[11px] text-[#64748B]">Hoje ({selectedPriceMetric})</p>
 <p className="text-[15px] font-semibold text-[#1E293B]">{activePriceRow?.current ?? '--'}</p>
 </div>
 <div className="rounded-lg border border-[#E5EAF1] bg-[#F8FAFD] px-3 py-2">
 <p className="text-[11px] text-[#64748B]">Mediana 5a</p>
 <p className="text-[15px] font-semibold text-[#1E293B]">{activePriceRow?.historical ?? '--'}</p>
 </div>
 <div className="rounded-lg border border-[#E5EAF1] bg-[#F8FAFD] px-3 py-2">
 <p className="text-[11px] text-[#64748B]">Setor</p>
 <p className="text-[15px] font-semibold text-[#1E293B]">{activePriceRow?.sector ?? '--'}</p>
 </div>
 </div>

 <div className="mt-4 rounded-lg border border-[#E5EAF1] bg-[#FCFDFE] p-4">
 {!activePriceSeries && (
 <div className="py-3 text-[12px] text-[#9CA3AF]">
 Ainda no temos dados suficientes para este indicador. ltima tentativa: {safeMeta(activeData?.priceData.updatedAt)}. Fonte esperada: CVM/RI
 </div>
 )}
 <div className="flex h-28 items-end gap-2">
 {(activePriceSeries?.values ?? []).map((value, index) => (
 <div key={activePriceSeries?.labels[index]} className="flex flex-1 flex-col items-center gap-1">
 <div className={cx('w-full rounded-md', index === activePriceSeries?.currentMarker ? 'bg-[#6B7F9E]' : 'bg-[#D7DFEA]')} style={{ height: `${value * 8}px` }} />
 <span className="text-[11px] text-[#9CA3AF]">{activePriceSeries?.labels[index]}</span>
 </div>
 ))}
 </div>
 <div className="relative mt-3 h-6">
 <div className="absolute inset-x-0 top-3 h-px bg-[#E5E7EB]" />
 <div className="absolute top-0 h-6 w-px bg-[#475569]" style={{ left: `${(((activePriceSeries?.currentMarker ?? 0) / Math.max((activePriceSeries?.labels.length ?? 1) - 1, 1)) * 100)}%` }} />
 <div className="absolute top-0 h-6 w-px border-l-2 border-[#475569]" style={{ left: `${(((activePriceSeries?.medianMarker ?? 0) / Math.max((activePriceSeries?.labels.length ?? 1) - 1, 1)) * 100)}%` }} />
 <span
 className="absolute top-0 -translate-x-1/2 rounded bg-[#EEF2F7] px-1.5 py-0.5 text-[10px] font-medium text-[#475569]"
 style={{ left: `${(((activePriceSeries?.medianMarker ?? 0) / Math.max((activePriceSeries?.labels.length ?? 1) - 1, 1)) * 100)}%` }}
 >
 Mediana
 </span>
 </div>
 <div className="mt-1 flex items-center justify-between text-[10px]">
 <span className="text-[#475569]">Hoje ({activePriceRow?.current ?? '--'})</span>
 <span className="text-[#6B7280]">Mediana 5a ({activePriceRow?.historical ?? '--'})</span>
 </div>
 <p className="mt-2 text-[12px] text-[#6B7280]">
 Distribuicao historica do multiplo: este grafico mostra frequencia por faixa, nao sinal de compra ou venda.
 </p>
 {(premiumVsHistorical != null || premiumVsSector != null) && (
 <p className="mt-1 text-[12px] text-[#475569]">
 Takeaway rapido:
 {premiumVsHistorical != null ? ` ${selectedPriceMetric} hoje esta ${premiumVsHistorical >= 0 ? `${premiumVsHistorical.toFixed(1)}% acima` : `${Math.abs(premiumVsHistorical).toFixed(1)}% abaixo`} da mediana historica.` : ''}
 {premiumVsSector != null ? ` Em relacao ao setor, esta ${premiumVsSector >= 0 ? `${premiumVsSector.toFixed(1)}% acima` : `${Math.abs(premiumVsSector).toFixed(1)}% abaixo`}.` : ''}
 </p>
 )}
 <p className="mt-1 text-[12px] font-medium text-[#475569]">{priceContextPosition} {pricePremiumProfile}</p>
 </div>

 <div className="mt-5 rounded-lg border border-[#EEF2F6] bg-[#FBFCFE] p-3">
 <p className="mb-2 text-[11px] uppercase tracking-wide text-[#94A3B8]">Comparacao resumida</p>
 <div className="grid grid-cols-5 border-b border-[#EEF2F6] pb-2 text-[11px] font-semibold text-[#94A3B8]">
 <span>Mtrica</span>
 <span>Atual</span>
 <span>Setor</span>
 <span>Histrico 5a</span>
 <span>Interpretao</span>
 </div>
 {(activeData?.priceData.rows ?? []).filter((row) => row.companyId === companyContext.companyId && row.metric === selectedPriceMetric).map((row) => (
 <div key={row.metric} className="grid grid-cols-5 border-b border-[#EEF2F6] py-2.5 text-[12px] text-[#334155]">
 <span className="font-medium">{row.metric}</span>
 <span>{row.current}</span>
 <span>{row.sector}</span>
 <span>{row.historical}</span>
 <span className="text-[#64748B]">{row.insight}</span>
 </div>
 ))}
 {((activeData?.priceData.rows ?? []).filter((row) => row.companyId === companyContext.companyId && row.metric === selectedPriceMetric).length === 0) && (
 <div className="py-3 text-[12px] text-[#9CA3AF]">Sem dados para este indicador.</div>
 )}
 </div>
 <p className="mt-4 text-[12px] italic text-[#6B7280]">Multiplicadores ajudam a comparar contexto de valuation, mas nao sao recomendacao de compra ou venda.</p>
 </article>
 )}

 {activeTab === 'Fontes' && (
 <article className="rounded-xl border border-[#E8EAED] bg-white p-5">
 <h2 className="text-[15px] font-semibold text-[#111827]">Fontes & Metodologia</h2>
 <p className="mt-1 text-[13px] text-[#6B7280]">Transparencia da leitura: veja de onde vem os dados e quao atualizadas estao as fontes que sustentam esta analise.</p>

 {sourceRowsWithRelevance.length === 0 && (
 <div className="mt-4 rounded-lg border border-[#F3F4F6] px-4 py-3 text-[12px] text-[#9CA3AF]">
 Ainda no temos dados suficientes para este indicador. ltima tentativa: {safeMeta(activeData?.summaryMeta.updatedAt)}. Fonte esperada: CVM/RI
 </div>
 )}

 {sourceRowsWithRelevance.length > 0 && (
 <>
 <section className="mt-4 rounded-xl border border-[#DDE3EA] bg-[#FCFDFE] p-4">
  <div className="flex flex-wrap items-center justify-between gap-2">
  <div>
   <p className="text-[12px] font-semibold uppercase tracking-wide text-[#64748B]">Confiabilidade das fontes</p>
   <p className="mt-1 text-[14px] font-semibold text-[#111827]">{sourceConfidenceLabel}</p>
  </div>
  <span className={cx('rounded-full border px-2.5 py-1 text-[11px] font-semibold', sourceConfidenceTone)}>{sourceConfidenceLabel}</span>
  </div>
  <p className="mt-2 text-[13px] text-[#475569]">{sourceConfidenceSummary}</p>
  <div className="mt-3 space-y-1 text-[12px] text-[#374151]">
  <p>→ Fontes principais atualizadas: {updatedPrimarySources}</p>
  <p>→ Fontes complementares antigas: {outdatedComplementarySources}</p>
  <p>→ Ultima atualizacao mais recente: {safeMeta(latestSourceDate)}</p>
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
  <li>Fontes complementares nao substituem as fontes principais da analise.</li>
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
 </div>
 </div>
 );
}












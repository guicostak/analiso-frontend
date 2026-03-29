"use client";

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
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import { Sidebar } from '@/src/components/layout/Sidebar';
import { API_BASE_URL } from '@/src/lib/api-base';

type Status = 'Risco' | 'Atencao' | 'Saudavel';
type MainTab = 'Resumo' | 'Pilares' | 'Mudancas' | 'Eventos' | 'Preço' | 'Fontes';
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
 companyId?: string;
 ticker?: string;
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
 companyName?: string;
 logoUrl?: string;
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
 changesSummaryByWindow?: Record<string, ChangesSummaryEntry>;
 changesSummary?: ChangesSummaryEntry;
};

type ChangesSummaryEntry = {
 windowDays?: number;
 summaryText?: string;
 mostAffectedPillar?: string;
 structuralCount?: number;
 relevantCount?: number;
 routineCount?: number;
 isWindowFallback?: boolean;
 principalChange?: {
  title?: string;
  type?: string;
  impact?: string;
  pillar?: string;
  whyItMatters?: string;
 };
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

function contextualize<T>(items: T[], companyId: string, ticker: string): Array<Contextual<T>> {
 return items.map((item) => ({ ...item, companyId, ticker }));
}

function companyContextFromTicker(tickerParam?: string): CompanyContext {
 const normalizedTicker = (tickerParam ?? '').toUpperCase();
 return {
  companyId: normalizedTicker,
  ticker: normalizedTicker,
  name: normalizedTicker,
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
 if (!/[ÂÃ]/.test(text)) return text;
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
 if (raw.includes('ris') || raw === 'negative') return 'Risco';
 if (raw.includes('aten') || raw.includes('monitor') || raw === 'attention') return 'Atencao';
 if (raw.includes('saud') || raw.includes('fort') || raw === 'positive') return 'Saudavel';
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
 ...(priceData as Omit<typeof priceData, 'bulletChart'> & { bulletChart: PriceBulletChart }),
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

  // Java backend returns these fields as plain primitives; handle both plain and object shapes
  const statusRaw = typeof pillar.status === 'string'
   ? pillar.status
   : safeMeta(statusObj.display) || safeMeta(statusObj.key);
  const scoreRaw = typeof pillar.score === 'number'
   ? pillar.score
   : Number(scoreObj.raw ?? 50);
  const trendRaw = typeof pillar.trend === 'string'
   ? pillar.trend
   : safeMeta(trendObj.display);

  return {
  companyId,
  ticker,
  name,
  displayName: safeMeta(pillar.displayName),
  status: normalizeStatusLabel(statusRaw, 'Atencao'),
  score: scoreRaw,
  trend: trendRaw,
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
 sourceNote: safeMeta((bulletRaw as Record<string, unknown>).sourceNote),
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

 const companyBlock = (raw.company as Record<string, unknown> | undefined) ?? {};

 return {
 companyId,
 ticker,
 companyName: safeMeta(companyBlock.name) || safeMeta(companyBlock.displayName) || undefined,
 logoUrl: safeMeta(companyBlock.logoUrl) || undefined,
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
  bulletChart: bulletChart as PriceBulletChart,
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
 } as CompanyData['priceData'],
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
 companyName: (payload as Record<string, unknown>).companyName as string | undefined,
 logoUrl: (payload as Record<string, unknown>).logoUrl as string | undefined,
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
 Risco: { dot: 'bg-danger-text', badge: 'border-danger-border bg-danger-surface text-danger-text' },
 Atencao: { dot: 'bg-warning-text', badge: 'border-warning-border bg-warning-surface text-warning-text' },
 Saudavel: { dot: 'bg-brand', badge: 'border-brand-border bg-brand-surface text-brand' },
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
 stroke: 'var(--danger-text)',
 fill: 'var(--danger-text)',
 label: 'Risco',
 chip: 'border-danger-border bg-danger-surface text-danger-text',
 },
 atencao: {
 stroke: 'var(--warning-text)',
 fill: 'var(--warning-text)',
 label: 'Atenção',
 chip: 'border-warning-border bg-warning-surface text-warning-text',
 },
 saudavel: {
 stroke: 'var(--brand)',
 fill: 'var(--brand)',
 label: 'Saudável',
 chip: 'border-brand-border bg-brand-surface text-brand',
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
 return <img src={company.logo} alt={company.ticker} className="h-9 w-9 rounded-lg border border-border object-cover" />;
 }
 return (
 <div className="grid h-9 w-9 place-items-center rounded-lg bg-brand text-xs font-semibold text-white">
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
 <div className="max-w-[240px] rounded-xl border border-border bg-card p-3.5 shadow-[0_10px_22px_-18px_rgba(2,6,23,0.7)]">
 <p className="text-[13px] font-semibold text-foreground">{datum.pillarLabel}</p>
 <p className="mt-1 text-[15px] font-semibold text-foreground">{datum.score}/100 {tone.label}</p>
 {deltaText && <p className="mt-1 text-[12px] text-dim">{deltaText}</p>}
 {datum.reason && <p className="mt-1 text-[12px] text-muted-foreground">{datum.reason}</p>}
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
 const [activePillar, setActivePillar] = useState<PillarName | null>(null);

 return (
 <div className="space-y-1.5">
 {data.map((entry) => {
  const tone = pillarMapStatusTone[entry.status];
  const isActive = activePillar === entry.pillar;
  const hasDelta = typeof entry.delta === 'number' && Number.isFinite(entry.delta);
  const deltaPositive = hasDelta && entry.delta! > 0;
  const deltaNegative = hasDelta && entry.delta! < 0;
  return (
  <button
   key={entry.pillar}
   onClick={() => onSelectPillar?.(entry.pillar)}
   onMouseEnter={() => setActivePillar(entry.pillar)}
   onMouseLeave={() => setActivePillar(null)}
   className={cx(
   'flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-all duration-150',
   isActive ? 'ring-1 ring-brand-border' : '',
   )}
   style={{ background: isActive ? 'var(--brand-surface)' : 'transparent' }}
  >
   <div
   className="h-9 w-9 flex-shrink-0 rounded-xl flex items-center justify-center"
   style={{ backgroundColor: `color-mix(in srgb, ${tone.stroke} 10%, transparent)` }}
   >
   <span className="text-[13px] font-bold tabular-nums" style={{ color: tone.stroke }}>
    {entry.score}
   </span>
   </div>
   <div className="flex-1 min-w-0">
   <div className="flex items-center justify-between gap-2 mb-1.5">
    <span className="text-[12px] font-semibold text-foreground">{entry.pillarLabel}</span>
    <div className="flex items-center gap-1.5">
    {hasDelta && (
     <span className={cx('text-[10px] font-medium tabular-nums', deltaPositive ? 'text-brand' : deltaNegative ? 'text-danger-text' : 'text-muted-foreground')}>
     {deltaPositive ? '+' : ''}{entry.delta!.toFixed(0)}
     </span>
    )}
    <span className={cx('rounded-full border px-1.5 py-0.5 text-[9px] font-semibold tracking-[0.04em]', tone.chip)}>
     {tone.label.toUpperCase()}
    </span>
    </div>
   </div>
   <div className="h-1 w-full rounded-full bg-muted overflow-hidden">
    <div
    className="h-full rounded-full transition-all duration-500"
    style={{ width: `${entry.score}%`, backgroundColor: tone.stroke, opacity: isActive ? 1 : 0.6 }}
    />
   </div>
   </div>
  </button>
  );
 })}
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
 const height = 72;
 const paddingX = 8;
 const paddingTop = 8;
 const paddingBottom = 14;
 const chartH = height - paddingTop - paddingBottom;
 const min = Math.min(...values);
 const max = Math.max(...values);
 const span = max - min || 1;
 const strokeColor = tone === 'teal' ? 'var(--brand)' : 'var(--warning-text)';
 const fillColor = tone === 'teal' ? 'color-mix(in srgb, var(--brand) 12%, transparent)' : 'color-mix(in srgb, var(--warning-text) 10%, transparent)';
 const refLineColor = tone === 'teal' ? 'var(--brand)' : 'var(--warning-text)';

 const toX = (index: number) => paddingX + (index * (width - paddingX * 2)) / Math.max(values.length - 1, 1);
 const toY = (value: number) => paddingTop + chartH - ((value - min) / span) * chartH;

 const points = values.map((value, index) => `${toX(index)},${toY(value)}`).join(' ');
 const areaPoints = [
 `${toX(0)},${height - paddingBottom}`,
 ...values.map((value, index) => `${toX(index)},${toY(value)}`),
 `${toX(values.length - 1)},${height - paddingBottom}`,
 ].join(' ');

 const markerX = highlightIndex !== undefined && variant === 'line'
 ? toX(Math.max(Math.min(highlightIndex, values.length - 1), 0))
 : null;
 const markerY = highlightIndex !== undefined && values[highlightIndex] !== undefined && variant === 'line'
 ? toY(values[highlightIndex])
 : null;

 const hasReference = variant === 'line' && typeof referenceValue === 'number' && Number.isFinite(referenceValue);
 const refYRaw = hasReference ? toY(referenceValue as number) : null;
 const safeRefY = refYRaw === null ? null : Math.max(paddingTop + 2, Math.min(height - paddingBottom - 2, refYRaw));
 const latestValue = values[Math.max(values.length - 1, 0)];
 const isAboveReference = hasReference && typeof latestValue === 'number' ? latestValue >= (referenceValue as number) : null;

 return (
 <div className="space-y-1">
 <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
  {/* Area fill */}
  {variant === 'line' && (
  <polygon points={areaPoints} fill={fillColor} />
  )}
  {/* Reference zone: shade between ref and bottom */}
  {safeRefY !== null && (
  <rect x={paddingX} y={safeRefY} width={width - paddingX * 2} height={height - paddingBottom - safeRefY} fill={refLineColor} fillOpacity={0.05} />
  )}
  {/* Reference dashed line */}
  {safeRefY !== null && (
  <>
  <line x1={paddingX} y1={safeRefY} x2={width - paddingX} y2={safeRefY} stroke={refLineColor} strokeWidth="1.5" strokeDasharray="4 3" strokeOpacity={0.5} />
  {referenceLabel && (
   <text x={paddingX + 4} y={safeRefY - 3} fill={refLineColor} fontSize="9" fontWeight={600} fillOpacity={0.7}>
   {referenceLabel}
   </text>
  )}
  </>
  )}
  {/* Bar variant */}
  {variant === 'bar' && values.map((value, index) => {
  const barW = (width - paddingX * 2) / Math.max(values.length, 1) - 5;
  const bx = paddingX + index * ((width - paddingX * 2) / Math.max(values.length, 1)) + 2.5;
  const by = toY(value);
  const bh = Math.max(height - paddingBottom - by, 2);
  return (
   <rect key={`bar-${labels[index] ?? index}`} x={bx} y={by} width={Math.max(barW, 2)} height={bh} rx={3} fill={strokeColor} fillOpacity={0.35} />
  );
  })}
  {/* Line */}
  {variant === 'line' && (
  <polyline points={points} fill="none" stroke={strokeColor} strokeWidth="2.6" strokeLinejoin="round" strokeLinecap="round" />
  )}
  {/* Data point dots */}
  {variant === 'line' && values.map((value, index) => {
  const isLast = index === values.length - 1;
  const isHighlight = index === highlightIndex;
  if (!isLast && !isHighlight) return null;
  return (
   <circle key={`dot-${index}`} cx={toX(index)} cy={toY(value)} r={isLast ? 5 : 3.5} fill={strokeColor} stroke="white" strokeWidth={isLast ? 2 : 1.5} />
  );
  })}
  {/* Latest value label */}
  {markerX !== null && markerY !== null && (
  <text x={Math.min(markerX + 8, width - 40)} y={Math.max(markerY - 8, paddingTop + 8)} fill={strokeColor} fontSize="10" fontWeight={700}>
   {values[highlightIndex!] !== undefined ? String(values[highlightIndex!]) : ''}
  </text>
  )}
 </svg>
 {isAboveReference !== null && (
  <p className={cx('text-[10px] font-medium', isAboveReference ? 'text-brand' : 'text-warning-text')}>
  {isAboveReference ? '↑ Acima da referência histórica' : '↓ Abaixo da referência histórica'}
  </p>
 )}
 <div className="flex items-center justify-between text-[10px] text-muted-foreground">
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
 return <div className={cx('rounded-md bg-muted skeleton-shimmer', className)} />;
}

export function CompanyAnalysis() {
 const router = useRouter();
 const { ticker } = useParams() as { ticker: string };
 const searchParams = useSearchParams();

 const [activeTab, setActiveTab] = useState<MainTab>('Resumo');
 const [contentVisible, setContentVisible] = useState(true);
 const [companyContext, setCompanyContext] = useState<CompanyContext>(() => companyContextFromTicker(ticker));
 const [loadingCompany, setLoadingCompany] = useState(true);
 const [loadingTab, setLoadingTab] = useState(true);
 const [tabCache, setTabCache] = useState<Record<string, TabPayload>>({});
 const [actionError, setActionError] = useState<string | null>(null);
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
 const companyStatus: Status = scoreAverage < 45
 ? 'Risco'
 : scoreAverage < 65
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
 const companyPriceRows = ((activeData?.priceData.rows ?? []) as Array<{ companyId: string; ticker: string; metric: string; current: string; sector: string; histórical: string; insight: string }>).filter((row) => row.companyId === companyContext.companyId);
 const valuationStateChipLabel = safeMeta(activeData?.priceData.valuationStateChip?.label);
 const valuationStateChipToneRaw = safeMeta(activeData?.priceData.valuationStateChip?.tone).toLowerCase();
 const valuationStateChipTone = valuationStateChipToneRaw.includes('coral')
 ? 'border-danger-border bg-danger-surface text-danger-text'
 : valuationStateChipToneRaw.includes('amber')
 ? 'border-warning-border bg-warning-surface text-warning-text'
 : valuationStateChipToneRaw.includes('teal')
 ? 'border-brand-border bg-brand-surface text-brand-text'
 : 'border-border bg-background text-dim';
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
 ? 'border-brand-border bg-brand-surface text-brand'
 : sourceConfidenceLabel === 'Moderada'
 ? 'border-warning-border bg-warning-surface text-warning-text'
 : 'border-border bg-muted text-muted-foreground';
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
 router.push(`/empresa/${nextTicker}`);
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
 <article key={`${change.type}-${change.date}-${change.title}`} className={cx('rounded-2xl border bg-card shadow-sm', nested ? 'border-border' : 'border-border')}>
  <div className="p-4">
   <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
    <span className="rounded-full border border-border bg-muted px-2.5 py-0.5 font-medium text-dim">{change.pillar}</span>
    <span className="text-border-strong">·</span>
    <span className="text-muted-foreground">{change.date}</span>
    <span className="text-border-strong">·</span>
    <span className={cx('rounded-full px-2.5 py-0.5 font-semibold', change.level === 'Estrutural' ? 'border border-danger-border bg-danger-surface text-danger-text' : change.level === 'Relevante' ? 'border border-warning-border bg-warning-surface text-warning-text' : 'border border-brand-border bg-brand-surface text-brand')}>
     {change.severityLabel}
    </span>
   </div>
   <h3 className="mt-2 text-[15px] font-semibold text-foreground">{change.title}</h3>
   <p className="mt-2 text-[13px] leading-relaxed text-foreground">{change.interpretation}</p>
   <div className="mt-3 rounded-xl border border-border bg-muted px-3 py-2.5">
    <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">Por que isso importa</p>
    <p className="mt-1 text-[13px] text-dim">{change.whyItMatters}</p>
   </div>
   <p className="mt-3 text-[11px] text-muted-foreground">
    Fonte: {safeMeta(change.source.docLabel)} · {safeMeta(change.date)} · Atualizado
   </p>
   <div className="mt-3 flex flex-wrap items-center gap-2">
    <button
     className={cx('rounded-xl border border-brand bg-brand px-3 py-1.5 text-[12px] font-semibold text-white transition-opacity hover:opacity-90', actionsDisabled ? 'cursor-not-allowed opacity-50' : '')}
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
     className={cx('inline-flex items-center gap-1 rounded-xl border border-border px-3 py-1.5 text-[12px] text-muted-foreground hover:bg-muted', actionsDisabled ? 'cursor-not-allowed opacity-50' : '')}
    >
     Abrir documento original
     <ExternalLink className="h-3.5 w-3.5" />
    </a>
   </div>
  </div>
 </article>
 );

 const renderAgendaEventCard = (timelineEvent: (typeof enrichedTimelineEvents)[number], nested = false) => (
 <article key={`${timelineEvent.title}-${timelineEvent.date}-${timelineEvent.mainPillar}`} className={cx('rounded-2xl border bg-card shadow-sm', nested ? 'border-border' : 'border-border')}>
  <div className="p-4">
   <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
    <span className="rounded-full border border-border bg-muted px-2.5 py-0.5 font-medium text-dim">{timelineEvent.mainPillar}</span>
    <span className="text-border-strong">·</span>
    <span className="text-muted-foreground">{timelineEvent.date}</span>
    <span className="text-border-strong">·</span>
    <span className={cx('rounded-full px-2.5 py-0.5 font-semibold', timelineEvent.level === 'Estrutural' ? 'border border-danger-border bg-danger-surface text-danger-text' : timelineEvent.level === 'Relevante' ? 'border border-warning-border bg-warning-surface text-warning-text' : 'border border-brand-border bg-brand-surface text-brand')}>
     {timelineEvent.severityLabel}
    </span>
   </div>
   <h3 className="mt-2 text-[15px] font-semibold text-foreground">{timelineEvent.title}</h3>
   <p className="mt-2 text-[13px] leading-relaxed text-foreground">{timelineEvent.interpretation}</p>
   <div className="mt-3 rounded-xl border border-border bg-muted px-3 py-2.5">
    <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">Por que isso importa</p>
    <p className="mt-1 text-[13px] text-dim">{timelineEvent.whyItMatters}</p>
   </div>
   <p className="mt-3 text-[11px] text-muted-foreground">
    Fonte: {safeMeta(timelineEvent.source)} · {safeMeta(timelineEvent.date)} · Monitorado
   </p>
   <div className="mt-3 flex flex-wrap items-center gap-2">
    <button
     className={cx('rounded-xl border border-brand bg-brand px-3 py-1.5 text-[12px] font-semibold text-white transition-opacity hover:opacity-90', actionsDisabled ? 'cursor-not-allowed opacity-50' : '')}
     disabled={actionsDisabled}
     onClick={(event) => {
      if (guardAction(event, timelineEvent.companyId)) return;
      if (timelineEvent.mainPillar !== 'A classificar') goToPillar(timelineEvent.mainPillar);
     }}
    >
     Ver impacto no pilar
    </button>
    <button
     className={cx('rounded-xl border border-border bg-card px-3 py-1.5 text-[12px] font-medium text-foreground hover:bg-muted', actionsDisabled ? 'cursor-not-allowed opacity-50' : '')}
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
    className={cx('mt-3 inline-flex items-center gap-1 text-[12px] text-brand hover:underline', actionsDisabled ? 'cursor-not-allowed opacity-50' : '')}
   >
    Abrir documento original
    <ExternalLink className="h-3.5 w-3.5" />
   </a>
  </div>
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
 <div className="h-screen overflow-hidden bg-muted font-['Plus_Jakarta_Sans','DM_Sans',system-ui,sans-serif] text-foreground">
 <style>{`
 .skeleton-shimmer {
 background-image: linear-gradient(90deg, var(--muted) 0%, var(--border) 40%, var(--muted) 80%);
 background-size: 200% 100%;
 animation: shimmer 1.5s linear infinite;
 }
 @keyframes shimmer {
 0% { background-position: 200% 0; }
 100% { background-position: -200% 0; }
 }
 `}</style>
 <div className="relative flex h-full">
 <div className="hidden w-[240px] flex-shrink-0 xl:block">
 <Sidebar currentPage="explorar" />
 </div>

 <aside
 className={cx(
 'relative h-full flex-shrink-0 overflow-hidden bg-card transition-all duration-200',
 watchlistCollapsed ? 'w-0 border-r-0 p-0' : 'w-[228px] border-r border-border p-3.5'
 )}
 >
 {!watchlistCollapsed && (
 <button
 className="absolute -right-3 top-1/2 z-20 grid h-7 w-7 -translate-y-1/2 place-items-center rounded-full border border-border bg-card text-muted-foreground shadow-sm hover:bg-muted"
 onClick={() => setWatchlistCollapsed(true)}
 aria-label="Retrair watchlist"
 title="Retrair watchlist"
 >
 <ChevronLeft className="h-4 w-4 transition-transform" />
 </button>
 )}
 {!watchlistCollapsed && (
 <div className="flex items-center justify-between">
 <h2 className="text-[14px] font-semibold text-foreground">Watchlist</h2>
 <div className="flex items-center gap-2">
 <Search className="h-4 w-4 text-muted-foreground" />
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
 queueFilter === filter ? 'border border-border bg-card font-semibold text-foreground' : 'text-muted-foreground'
 )}
 >
 {filter === 'Atencao' ? 'Atenção' : filter}
 </button>
 ))}
 </div>
 )}
 {!watchlistCollapsed && (
 <div className="mt-4 divide-y divide-border">
 {filteredQueue.map((company) => {
 const selected = company.companyId === companyContext.companyId;
 return (
 <button
 key={company.ticker}
 onClick={() => switchCompany(company.ticker)}
 className={cx(
 'group flex w-full items-center gap-2.5 text-left',
 selected ? 'rounded-[10px] border border-brand-border bg-brand-surface p-2.5' : 'px-2 py-2.5'
 )}
 >
 <QueueLogo company={company} />
 <div className="min-w-0 flex-1">
 <p className="truncate text-[13px] font-bold text-foreground">{company.ticker}</p>
 <p className="truncate text-[11px] text-muted-foreground">{company.name}</p>
 </div>
 <span className={cx('h-[7px] w-[7px] rounded-full', statusTone[company.status].dot)} />
 <MoreHorizontal className={cx('h-3.5 w-3.5 text-muted-foreground transition-opacity', selected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100')} />
 </button>
 );
 })}
 </div>
 )}
 </aside>

 {watchlistCollapsed && (
 <button
 className="absolute left-0 top-1/2 z-30 hidden h-7 w-7 -translate-y-1/2 place-items-center rounded-full border border-border-strong bg-card text-muted-foreground shadow-sm hover:bg-muted xl:grid xl:left-[240px]"
 onClick={() => setWatchlistCollapsed(false)}
 aria-label="Expandir watchlist"
 title="Expandir watchlist"
 >
 <ChevronLeft className="h-4 w-4 rotate-180 transition-transform" />
 </button>
 )}

 <main className="h-full flex-1 overflow-y-auto bg-muted">
 <header className="sticky top-0 z-10 border-b border-border bg-card shadow-[0_1px_6px_-2px_rgba(2,6,23,0.05)]">
 {/* Hero strip */}
 <div className="px-6 pt-4 pb-3" style={{ background: 'linear-gradient(160deg, var(--muted) 0%, var(--card) 60%)' }}>
 <div className="flex min-w-0 items-start justify-between gap-4">
 <div className="flex min-w-0 items-start gap-3.5">
 {activeData?.logoUrl
           ? <img src={activeData.logoUrl} alt={companyContext.ticker} className="h-9 w-9 rounded-lg border border-[#E2EDF5] object-cover" />
           : <div className="grid h-9 w-9 place-items-center rounded-lg bg-[#0E9384] text-xs font-semibold text-white">{companyContext.ticker.slice(0, 2)}</div>
         }
 <div className="min-w-0">
 <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[#A0AEC0]">{companyContext.ticker}</p>
 <h1 className="mt-0.5 text-[24px] font-bold leading-tight tracking-tight text-[#0B1220]">
 {activeData?.companyName ?? companyContext.ticker}
 <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">{activeCompany.ticker}</p>
 <h1 className="mt-0.5 text-[24px] font-bold leading-tight tracking-tight text-foreground">
 {activeCompany.name === 'WEG' ? 'WEG' : activeCompany.name}
 </h1>
 <p className="mt-0.5 max-w-[480px] truncate text-[12px] text-muted-foreground">{activeCompany.description}</p>
 <div className="mt-2.5 flex flex-wrap items-center gap-2">
 <span className={cx('rounded-full border px-2.5 py-1 text-[11px] font-semibold', statusTone[companyStatus].badge)}>
 {statusLabel(companyStatus)} · {scoreAverage}/100
 </span>
 {safeMeta(activeData?.priceData.current) && (
 <span className="rounded-full border border-border bg-muted px-2.5 py-1 text-[11px] font-medium text-foreground">
 {safeMeta(activeData?.priceData.current)}
 </span>
 )}
 <span className="text-[11px] text-muted-foreground">Indústria · Bens de capital</span>
 <div className="relative">
 <button className="text-[11px] text-muted-foreground hover:text-foreground transition-colors" onClick={() => setShowHeaderUpdateDetails((prev) => !prev)}>
 Atualizado em {safeMeta(activeData?.summaryMeta.updatedAt)}
 </button>
 {showHeaderUpdateDetails && (
 <div className="absolute left-0 top-6 z-30 min-w-[220px] rounded-xl border border-border bg-card p-3.5 text-[12px] text-dim shadow-[0_8px_24px_-8px_rgba(2,6,23,0.14)]">
 <p className="font-semibold text-foreground mb-1.5">Detalhes da atualização</p>
 <p className="text-muted-foreground">Financeiro: {safeMeta(activeData?.summaryMeta.updatedAt)}</p>
 <p className="text-muted-foreground">Eventos: {safeMeta(activeData?.summaryMeta.updatedAt)}</p>
 <p className="text-muted-foreground">Preço: {safeMeta(activeData?.priceData.updatedAt)}</p>
 <p className="text-muted-foreground">Fontes: CVM, B3 e RI</p>
 </div>
 )}
 </div>
 </div>
 </div>
 </div>

 <div className="relative flex flex-wrap items-center gap-2">
 <button
 className={cx('inline-flex items-center gap-1.5 rounded-xl border border-brand bg-brand px-3.5 py-2 text-[12px] font-semibold text-white transition-all', actionsDisabled ? 'cursor-not-allowed opacity-50' : 'hover:opacity-90')}
 disabled={actionsDisabled}
 onClick={(event) => guardAction(event)}
 >
 <Check className="h-3.5 w-3.5" />
 Na Watchlist
 </button>
 <button className={cx('rounded-xl border border-border bg-card px-3.5 py-2 text-[12px] font-medium text-foreground transition-all', actionsDisabled ? 'cursor-not-allowed opacity-50' : 'hover:bg-muted')} disabled={actionsDisabled} onClick={(event) => guardAction(event)}>Criar alerta</button>
 <button className={cx('rounded-xl border border-border bg-card px-3.5 py-2 text-[12px] text-muted-foreground transition-all', actionsDisabled ? 'cursor-not-allowed opacity-50' : 'hover:bg-muted')} disabled={actionsDisabled} onClick={(event) => guardAction(event)}>Comparar</button>
 <button
 className={cx('grid h-9 w-9 place-items-center rounded-full border border-border bg-card text-muted-foreground transition-all', actionsDisabled ? 'cursor-not-allowed opacity-50' : 'hover:bg-muted')}
 disabled={actionsDisabled}
 onClick={() => setShowHeaderMenu((prev) => !prev)}
 >
 <MoreHorizontal className="h-4 w-4" />
 </button>
 {showHeaderMenu && (
 <div className="absolute right-0 top-11 z-30 w-44 rounded-xl border border-border bg-card p-1.5 shadow-[0_8px_24px_-8px_rgba(2,6,23,0.14)]">
 <button className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-[12px] text-foreground hover:bg-muted" onClick={(event) => guardAction(event)}>
 <Bell className="h-3.5 w-3.5 text-muted-foreground" />
 Notificações
 </button>
 <button className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-[12px] text-foreground hover:bg-muted" onClick={(event) => guardAction(event)}>
 <Share2 className="h-3.5 w-3.5 text-muted-foreground" />
 Compartilhar
 </button>
 </div>
 )}
 </div>
 </div>
 </div>

 {/* Tab bar */}
 <div className="flex items-center gap-0 px-6 overflow-x-auto">
 {mainTabs.map((tab) => (
 <button
 key={tab}
 onClick={() => setActiveTab(tab)}
 className={cx(
 'flex-shrink-0 py-3.5 px-4 text-[13px] font-medium border-b-2 transition-all duration-150',
 activeTab === tab
 ? 'border-brand text-foreground'
 : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
 )}
 >
 {tab === 'Mudancas'
 ? `O que mudou (${changesCount})`
 : tab === 'Eventos'
 ? `Agenda (${eventsCount})`
 : tab === 'Preço'
 ? 'Preço'
 : tab}
 </button>
 ))}
 </div>
 </header>

 <section className={cx('px-6 py-5 transition-opacity duration-150', contentVisible ? 'opacity-100' : 'opacity-0')}>
 {actionError && (
 <div className="mb-4 rounded-xl border border-warning-border bg-warning-surface px-4 py-3 text-[13px] text-warning-text">
 {actionError}
 </div>
 )}
 {showScoreInfo && (
 <div className="mb-4 rounded-2xl border border-border bg-card p-5 shadow-sm">
 <div className="flex items-center justify-between">
 <div>
 <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">Metodologia</p>
 <h3 className="mt-0.5 text-[15px] font-semibold text-foreground">Como calculamos o placar</h3>
 </div>
 <button className="rounded-lg border border-border px-3 py-1.5 text-[12px] text-muted-foreground hover:bg-muted" onClick={() => setShowScoreInfo(false)}>Fechar</button>
 </div>
 <div className="mt-3 space-y-1 text-[13px] text-muted-foreground">
 <p>Pesos: Dívida 25%, Caixa 20%, Margens 20%, Retorno 20%, Proventos 15%.</p>
 <p>Status exibido conforme informado no endpoint de cada pilar.</p>
 <p>Fontes: CVM, B3 e RI da empresa.</p>
 </div>
 </div>
 )}
 {evidenceModal && (
 <div className="mb-4 rounded-2xl border border-border bg-card p-5 shadow-sm">
 <div className="flex items-center justify-between">
 <div>
 <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">Evidência</p>
 <h3 className="mt-0.5 text-[15px] font-semibold text-foreground">Painel de fonte · {evidenceModal.pillarName}</h3>
 </div>
 <button className="rounded-lg border border-border px-3 py-1.5 text-[12px] text-muted-foreground hover:bg-muted" onClick={() => setEvidenceModal(null)}>Fechar</button>
 </div>
 <div className="mt-3 inline-flex rounded-xl bg-muted p-1">
 {(['Fonte', 'Trecho', 'Como calculamos'] as EvidenceTab[]).map((tab) => (
 <button
 key={tab}
 onClick={() => setEvidenceTab(tab)}
 className={cx('rounded-lg px-3 py-1.5 text-[12px] transition-all', evidenceTab === tab ? 'bg-card border border-border font-semibold text-brand shadow-sm' : 'text-muted-foreground hover:text-foreground')}
 >
 {tab}
 </button>
 ))}
 </div>
 {evidenceTab === 'Fonte' && (
 <div className="mt-3 space-y-1.5 text-[13px] text-muted-foreground">
 <p><span className="font-medium text-foreground">Documento:</span> {safeMeta(evidenceModal.evidence.source.docLabel)}</p>
 <p><span className="font-medium text-foreground">Atualizado em:</span> {safeMeta(evidenceModal.evidence.source.date)}</p>
 <a href={evidenceModal.evidence.source.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-brand hover:underline">
 Abrir fonte externa
 <ExternalLink className="h-3.5 w-3.5" />
 </a>
 </div>
 )}
 {evidenceTab === 'Trecho' && (
 <div className="mt-3 rounded-xl border border-border bg-muted p-3.5 text-[13px] text-muted-foreground italic">
 "{evidenceModal.evidence.why}"
 </div>
 )}
 {evidenceTab === 'Como calculamos' && (
 <div className="mt-3 space-y-1 text-[13px] text-muted-foreground">
 <p>Fórmula base: valor atual vs histórico de 5 anos.</p>
 <p>Notas: sinalizamos ponto forte/atenção conforme direção do pilar.</p>
 <p>Limitações: sujeito a revisão após novo release da companhia.</p>
 </div>
 )}
 </div>
 )}
 {showSkeleton ? (
 <div className="space-y-4">
 <div className="rounded-2xl border border-border bg-card p-6"><SkeletonBlock className="h-5 w-48" /><SkeletonBlock className="mt-3 h-8 w-full" /><SkeletonBlock className="mt-2 h-5 w-4/5" /><SkeletonBlock className="mt-5 h-10 w-48" /></div>
 <div className="grid grid-cols-12 gap-4">
 <div className="col-span-6 rounded-2xl border border-border bg-card p-5"><SkeletonBlock className="h-4 w-28" /><SkeletonBlock className="mt-4 h-7 w-20" /><SkeletonBlock className="mt-3 h-14 w-full" /></div>
 <div className="col-span-6 rounded-2xl border border-border bg-card p-5"><SkeletonBlock className="h-4 w-28" /><SkeletonBlock className="mt-4 h-7 w-20" /><SkeletonBlock className="mt-3 h-14 w-full" /></div>
 </div>
 <div className="rounded-2xl border border-border bg-card p-5"><SkeletonBlock className="h-5 w-40" /><SkeletonBlock className="mt-4 h-4 w-full" /><SkeletonBlock className="mt-2 h-4 w-10/12" /></div>
 </div>
 ) : activePayload?.status === 'empty' ? (
 <article className="rounded-2xl border border-border bg-card p-8 text-center">
 <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-muted">
 <Database className="h-5 w-5 text-muted-foreground" />
 </div>
 <h2 className="text-[16px] font-semibold text-foreground">Empresa em processamento</h2>
 <p className="mt-1.5 text-[13px] text-muted-foreground">Os dados desta empresa estão sendo ingeridos. Em breve a leitura estará disponível.</p>
 </article>
 ) : (
 <>
{activeTab === 'Resumo' && (
<div className="space-y-5">

<article className="rounded-2xl border border-border bg-card p-6 shadow-sm">
 <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">Diagnóstico rápido</p>
 <h2 className="mt-2 text-[22px] font-bold leading-snug text-foreground">
  {activeData?.diagnosisHeadline ?? 'A empresa permanece estruturalmente saudável, com um ponto de atenção concentrado em dívida.'}
 </h2>
 <p className="mt-2 text-[13px] leading-relaxed text-muted-foreground">Entenda o que sustenta a empresa hoje, o que mudou e o que vale monitorar daqui para frente.</p>
 <div className="mt-5 flex flex-wrap items-center gap-2">
  <button
   className="rounded-xl border border-brand bg-brand px-4 py-2 text-[13px] font-semibold text-white transition-opacity hover:opacity-90"
   onClick={() => goToPillar(activeData?.strongest.title ?? 'Divida')}
  >
   Ver principal força
  </button>
  <button
   className="rounded-xl border border-warning-border bg-warning-surface px-4 py-2 text-[13px] font-semibold text-warning-text transition-opacity hover:opacity-80"
   onClick={() => goToPillar(activeData?.watchout.title ?? 'Margens')}
  >
   Ver principal atenção
  </button>
 </div>
</article>

<div className="grid grid-cols-12 gap-4">
 <div className="col-span-12 space-y-4 xl:col-span-8">

  <article className="rounded-2xl border border-border bg-card p-5 shadow-sm" style={{ borderTopWidth: '3px', borderTopColor: 'var(--brand)' }}>
   <div className="flex items-center gap-2">
    <BarChart3 className="h-4 w-4 text-brand" />
    <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-brand">Principal Força</p>
   </div>
   <div className="mt-3">
    <p className="text-[26px] font-bold leading-none text-brand">{activeData?.strongest.title ?? 'Divida'}</p>
    <p className="mt-2.5 text-[14px] leading-relaxed text-dim">
     {strongestHumanLine}
    </p>
    <div className="mt-3 flex flex-wrap items-center gap-2 text-[12px]">
     <span className="rounded-full border border-brand-border bg-brand-surface px-2.5 py-1 font-semibold text-brand">{activeData?.strongest.score ?? '95/100'}</span>
     <span className="rounded-full border border-brand-border bg-brand-surface px-2.5 py-1 font-semibold text-brand">{activeData?.strongest.badge ?? ''}</span>
     <span className="rounded-full border border-border bg-muted px-2.5 py-1 text-muted-foreground">Variação: {activeData?.strongest.trend ?? 'estável'}</span>
    </div>
    <div className="mt-3 flex items-center gap-2">
     <button className="rounded-lg border border-border px-3 py-1.5 text-[12px] text-muted-foreground hover:bg-muted" onClick={() => goToPillar(activeData?.strongest.title ?? 'Caixa')}>
      Ver pilar
     </button>
     <button className="rounded-lg border border-border px-3 py-1.5 text-[12px] text-muted-foreground hover:bg-muted" onClick={() => goToPillar(activeData?.strongest.title ?? 'Caixa', true)}>
      Ver fonte
     </button>
    </div>
   </div>
  </article>

  <article className="rounded-2xl border border-border bg-card p-5 shadow-sm" style={{ borderTopWidth: '3px', borderTopColor: 'var(--warning-text)' }}>
   <div className="flex items-center gap-2">
    <TriangleAlert className="h-4 w-4 text-warning-text" />
    <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-warning-text">Principal Atenção</p>
   </div>
   <div className="mt-3">
    <p className="text-[26px] font-bold leading-none text-warning-text">{activeData?.watchout.title ?? 'Margens'}</p>
    <p className="mt-2.5 text-[14px] leading-relaxed text-dim">
     {watchoutHumanLine}
    </p>
    <div className="mt-3 flex flex-wrap items-center gap-2 text-[12px]">
     <span className="rounded-full border border-warning-border bg-warning-surface px-2.5 py-1 font-semibold text-warning-text">{activeData?.watchout.score ?? '61/100'}</span>
     <span className="rounded-full border border-warning-border bg-warning-surface px-2.5 py-1 font-semibold text-warning-text">{watchoutBadgeLabel}</span>
     <span className="rounded-full border border-border bg-muted px-2.5 py-1 text-muted-foreground">Variação: {activeData?.watchout.trend ?? 'piora'}</span>
    </div>
    <div className="mt-3 flex items-center gap-2">
     <button className="rounded-lg border border-border px-3 py-1.5 text-[12px] text-muted-foreground hover:bg-muted" onClick={() => goToPillar(activeData?.watchout.title ?? 'Divida')}>
      Ver pilar
     </button>
     <button className="rounded-lg border border-border px-3 py-1.5 text-[12px] text-muted-foreground hover:bg-muted" onClick={() => goToPillar(activeData?.watchout.title ?? 'Divida', true)}>
      Ver fonte
     </button>
    </div>
   </div>
  </article>

 </div>

 <article className="col-span-12 rounded-2xl border border-border bg-card p-5 shadow-sm xl:col-span-4">
  <div className="flex items-center justify-between">
   <h2 className="text-[15px] font-semibold text-foreground">Mapa dos 5 pilares</h2>
   <button className="text-[11px] text-muted-foreground hover:text-dim hover:underline" onClick={() => setShowScoreInfo(true)}>
    Como calculamos
   </button>
  </div>
  <p className="mt-1 text-[12px] text-muted-foreground">Visão geral para apoiar a leitura inicial, sem substituir o diagnóstico.</p>
  <div className="mt-3">
   <PillarMap
    data={mapPillarData}
    companyStatus={companyStatus}
    onSelectPillar={(pillar) => goToPillar(pillar)}
   />
  </div>
  <p className="mt-3 rounded-xl border border-border bg-muted px-3 py-2.5 text-[12px] text-dim">
   Atenção principal em {activeData?.watchout.title ?? 'Margens'}; força relativa em {activeData?.strongest.title ?? 'Dívida'}.
  </p>
 </article>
</div>

<article className="rounded-2xl border border-border bg-card p-6 shadow-sm">
 <div className="flex items-center justify-between">
  <div>
   <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">Resumo em 60s</p>
   <h2 className="mt-1 text-[16px] font-semibold text-foreground">Uma visão simples do que sustenta a empresa hoje e do que merece acompanhamento.</h2>
  </div>
  <button className="text-[12px] text-brand hover:underline" onClick={openSummaryEvidence}>Ver fonte</button>
 </div>
 <p className="mt-4 text-[14px] leading-relaxed text-foreground">
  {summaryNarrative}
 </p>
 <div className="mt-4 grid grid-cols-3 gap-3">
  <div className="rounded-xl border border-border bg-muted p-3">
   <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">Força principal</p>
   <p className="mt-1 text-[13px] font-semibold text-foreground">{activeData?.summaryScan.strength.pillar ?? activeData?.strongest.title ?? 'Dívida'}</p>
  </div>
  <div className="rounded-xl border border-border bg-muted p-3">
   <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">Atenção principal</p>
   <p className="mt-1 text-[13px] font-semibold text-foreground">{activeData?.summaryScan.attention.pillar ?? activeData?.watchout.title ?? 'Margens'}</p>
  </div>
  <div className="rounded-xl border border-border bg-muted p-3">
   <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">O que monitorar</p>
   <p className="mt-1 text-[13px] font-semibold text-foreground">{activeData?.summaryScan.monitor.text ?? 'Evolução das margens no próximo fechamento.'}</p>
  </div>
 </div>
 <div className="mt-4 flex flex-wrap items-center gap-2 text-[11px]">
  <span className="rounded-full border border-border bg-muted px-2.5 py-1 text-muted-foreground">Atualizado em {safeMeta(activeData?.summaryMeta.updatedAt)}</span>
  <span className="rounded-full border border-border bg-muted px-2.5 py-1 text-muted-foreground">Fonte: {safeMeta(activeData?.summaryMeta.source)}</span>
  <span className="rounded-full border border-brand-border bg-brand-surface px-2.5 py-1 text-brand">Confiança: Alta</span>
 </div>
</article>

<article className="rounded-2xl border border-brand-border bg-gradient-to-br from-brand-surface to-muted p-6">
 <div className="flex items-center justify-between gap-3">
  <div>
   <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-brand">Próximas ações</p>
   <h2 className="mt-1 text-[15px] font-semibold text-foreground">Feche a leitura com um próximo passo útil e verificável.</h2>
  </div>
  <button className="text-[12px] text-brand hover:underline" onClick={openSummaryEvidence}>Ver fonte</button>
 </div>
 <div className="mt-4 flex flex-wrap items-center gap-2">
  <button className={cx('rounded-xl border border-brand bg-brand px-4 py-2 text-[13px] font-semibold text-white transition-opacity hover:opacity-90', actionsDisabled ? 'cursor-not-allowed opacity-50' : '')} disabled={actionsDisabled} onClick={(event) => guardAction(event)}>
   Criar alerta da principal atenção
  </button>
  <button className="rounded-xl border border-brand-border bg-card px-4 py-2 text-[13px] font-medium text-foreground hover:bg-brand-surface" onClick={() => setActiveTab('Pilares')}>
   Ver pilares completos
  </button>
  <button className={cx('rounded-xl border border-brand-border bg-card px-4 py-2 text-[13px] font-medium text-foreground hover:bg-brand-surface', actionsDisabled ? 'cursor-not-allowed opacity-50' : '')} disabled={actionsDisabled} onClick={(event) => guardAction(event)}>
   Comparar com outra empresa
  </button>
 </div>
</article>

</div>
)}

 {activeTab === 'Pilares' && (
 <div className="space-y-4">

 <article className="rounded-2xl border border-border bg-card p-5 shadow-sm">
  <div className="flex flex-wrap items-start justify-between gap-3">
   <div>
    <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">Síntese dos pilares</p>
    <h2 className="mt-1 text-[18px] font-bold text-foreground">Diagnóstico por pilares</h2>
   </div>
   <div className="flex flex-wrap items-center gap-2 text-[12px]">
    {healthyPillars.length > 0 && <span className="inline-flex items-center gap-1.5 rounded-full border border-brand-border bg-brand-surface px-3 py-1 text-[12px] font-semibold text-brand">{healthyPillars.length} saudável{healthyPillars.length !== 1 ? 's' : ''}</span>}
    {attentionPillars.length > 0 && <span className="rounded-full border border-warning-border bg-warning-surface px-3 py-1 font-semibold text-warning-text">{attentionPillars.length} atenção</span>}
    {riskPillars.length > 0 && <span className="rounded-full border border-danger-border bg-danger-surface px-3 py-1 font-semibold text-danger-text">{riskPillars.length} risco</span>}
   </div>
  </div>
  <div className="mt-3 flex flex-wrap gap-2 text-[12px] text-foreground">
   <span className="rounded-full border border-border bg-muted px-2.5 py-1">Principal risco: {mostCriticalPillar ? pillarLabel(mostCriticalPillar.pillar) : '—'}</span>
   <span className="rounded-full border border-border bg-muted px-2.5 py-1">Principal sustentação: {strongestPillar ? pillarLabel(strongestPillar.pillar) : '—'}</span>
  </div>
 </article>

 {(activeData?.pillars ?? []).filter((p) => p.companyId === companyContext.companyId).length === 0 && (
 <article className="rounded-2xl border border-border bg-card p-6 shadow-sm">
  <div className="flex flex-col items-center gap-3 py-4 text-center">
   <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-muted">
    <BarChart3 className="h-5 w-5 text-muted-foreground" />
   </div>
   <p className="text-[14px] font-medium text-muted-foreground">Ainda não temos dados suficientes para este indicador.</p>
   <p className="text-[12px] text-muted-foreground">Última tentativa: {safeMeta(activeData?.summaryMeta.updatedAt)} · Fonte esperada: CVM/RI</p>
  </div>
 </article>
 )}

 {(activeData?.pillars ?? []).filter((pillar) => pillar.companyId === companyContext.companyId).map((pillar) => {
 const expanded = expandedPillars[pillar.name];
 const windowSize = windowByPillar[pillar.name];
 const values = windowSize === '5a' ? pillar.chart.series5 : pillar.chart.series10;
 const labels = windowSize === '5a' ? pillar.chart.years5 : pillar.chart.years10;
 const chartTone = pillar.status === 'Saudavel' ? 'teal' : 'amber';
 const accent = pillar.status === 'Saudavel' ? 'var(--brand)' : pillar.status === 'Atencao' ? 'var(--warning-text)' : 'var(--danger-text)';
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
 <article id={`pillar-${pillar.name}`} key={pillar.name} className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden" style={{ borderTopWidth: '3px', borderTopColor: accent }}>
  <button
   onClick={() => {
    const isCurrentlyOpen = expandedPillars[pillar.name];
    if (isCurrentlyOpen) {
     setExpandedPillars({ Divida: false, Caixa: false, Margens: false, Retorno: false, Proventos: false });
     return;
    }
    setExpandedPillars({ Divida: pillar.name === 'Divida', Caixa: pillar.name === 'Caixa', Margens: pillar.name === 'Margens', Retorno: pillar.name === 'Retorno', Proventos: pillar.name === 'Proventos' });
   }}
   className="flex w-full items-center justify-between gap-3 p-5 text-left"
  >
   <div className="flex flex-1 flex-wrap items-center gap-x-3 gap-y-1">
    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl" style={{ backgroundColor: `color-mix(in srgb, ${accent} 10%, transparent)` }}>
     <span className="text-[13px] font-bold tabular-nums" style={{ color: accent }}>{pillar.score}</span>
    </div>
    <div className="min-w-0">
     <div className="flex flex-wrap items-center gap-2">
      <h2 className="text-[16px] font-bold text-foreground">{pillarName}</h2>
      <span className={cx('rounded-full border px-2.5 py-0.5 text-[11px] font-semibold', statusTone[pillar.status].badge)}>{statusLabel(pillar.status)}</span>
      {deltaLabel && <span className="text-[12px] text-muted-foreground">{deltaLabel}</span>}
     </div>
     <p className="mt-0.5 text-[13px] text-muted-foreground">{verdictLine}</p>
    </div>
   </div>
   <div className="ml-2 flex-shrink-0">
    {expanded ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
   </div>
  </button>

  <div className={cx('overflow-hidden transition-all duration-300', expanded ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0')}>
   <div className="border-t border-border" />
   <div className="grid gap-0 lg:grid-cols-12">

    {/* Left: meaning + monitor */}
    <div className="space-y-0 border-b border-border p-5 lg:col-span-4 lg:border-b-0 lg:border-r">
     <div>
      <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">O que isso significa</p>
      <p className="mt-2 text-[14px] leading-relaxed text-foreground">{whatItMeans}</p>
     </div>
     <div className="mt-4 pt-4 border-t border-border">
      <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">O que monitorar</p>
      <ul className="mt-2 space-y-2">
       {monitorItems.map((item) => (
        <li key={item} className="flex items-start gap-2 text-[13px] text-dim">
         <span className="mt-[5px] h-1.5 w-1.5 flex-shrink-0 rounded-full bg-muted-foreground" />
         <span>{item}</span>
        </li>
       ))}
      </ul>
     </div>
     <p className="mt-4 text-[11px] text-muted-foreground">Fonte: {pillar.trust.source} · {pillar.trust.updatedAt} · {pillar.trust.status}</p>
    </div>

    {/* Right: evidence + chart + signal */}
    <div className="p-5 lg:col-span-8">
     <section className="rounded-xl border border-border bg-muted p-4">
      <div className="grid gap-4 lg:grid-cols-2">
       <div>
        <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">Evidência principal</p>
        <p className="mt-1 text-[12px] text-muted-foreground">Indicador: {indicatorLabel}</p>
        <p className="mt-2 text-[32px] font-bold leading-none text-foreground">{evidenceHeadline}</p>
        <p className="mt-1 text-[12px] text-muted-foreground">Data: {baseMetric?.source.date ?? pillar.trust.updatedAt}</p>
        <p className="mt-2 text-[13px] text-foreground"><span className="font-semibold">Ref. 5 anos:</span> <span className="font-medium text-muted-foreground">{referenceText}</span></p>
        {baseMetricReadingHint(pillar, baseMetric) && (
         <p className="mt-1 text-[12px] text-muted-foreground">Como ler: {baseMetricReadingHint(pillar, baseMetric)}</p>
        )}
       </div>
       <div>
        <div className="mb-2 flex justify-end">
         <div className="inline-flex rounded-full bg-muted p-0.5">
          {(['5a', '10a'] as WindowSize[]).map((windowOption) => (
           <button
            key={windowOption}
            onClick={() => setWindowByPillar((prev) => ({ ...prev, [pillar.name]: windowOption }))}
            className={cx('rounded-full px-3 py-1 text-[11px]', windowSize === windowOption ? 'border border-brand-border bg-brand-surface font-semibold text-brand' : 'text-muted-foreground')}
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

     {mainEvidence && (
      <section className={cx('mt-3 rounded-xl border p-4', signalCopy.badgeTone === 'risk' ? 'border-danger-border bg-danger-surface' : signalCopy.badgeTone === 'attention' ? 'border-warning-border bg-warning-surface' : 'border-brand-border bg-brand-surface')}>
       <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
         {signalCopy.badgeLabel && (
          <span className={cx('rounded-full border px-2.5 py-0.5 text-[11px] font-semibold', signalCopy.badgeTone === 'risk' ? 'border-danger-border bg-danger-surface text-danger-text' : signalCopy.badgeTone === 'attention' ? 'border-warning-border bg-warning-surface text-warning-text' : 'border-brand-border bg-brand-surface text-brand')}>
           {signalCopy.badgeLabel}
          </span>
         )}
         <p className="mt-2 text-[14px] font-semibold text-foreground">{signalCopy.title}</p>
         <p className="mt-1 text-[13px] text-dim">{signalCopy.body}</p>
         {signalCopy.why && <p className="mt-1 text-[13px] text-muted-foreground">Por que importa: {signalCopy.why}</p>}
        </div>
        <button
         onClick={(event) => {
          if (guardAction(event, mainEvidence.companyId)) return;
          setEvidenceModal({ pillarName: pillar.name, evidence: mainEvidence });
          setEvidenceTab('Fonte');
         }}
         className={cx('flex-shrink-0 text-[12px] text-brand hover:underline', actionsDisabled ? 'cursor-not-allowed opacity-50' : '')}
         disabled={actionsDisabled || mainEvidence.companyId !== companyContext.companyId}
        >
         Ver fonte
        </button>
       </div>
       <p className="mt-2 text-[11px] text-muted-foreground">Fonte: {mainEvidenceSource}</p>
      </section>
     )}

     {(ctaCopy.title || ctaCopy.button) && (
      <section className="mt-3 rounded-xl border border-brand-border bg-gradient-to-br from-brand-surface to-muted p-4">
       <p className="text-[13px] text-foreground">{ctaCopy.title}</p>
       <button className={cx('mt-2 rounded-xl border border-brand bg-brand px-4 py-2 text-[13px] font-semibold text-white transition-opacity hover:opacity-90', actionsDisabled ? 'cursor-not-allowed opacity-50' : '')} disabled={actionsDisabled} onClick={(event) => guardAction(event, pillar.companyId)}>
        {ctaCopy.button}
       </button>
      </section>
     )}
    </div>

   </div>
  </div>
 </article>
 );
 })}
 <p className="py-2 text-center text-[13px] text-muted-foreground">Sentiu falta de algum indicador? <button type="button" className={cx('text-[12px] font-medium text-brand hover:underline', actionsDisabled ? 'cursor-not-allowed opacity-50' : '')} disabled={actionsDisabled} onClick={(event) => guardAction(event)}>Sugerir indicador</button></p>
 </div>
 )}

 {activeTab === 'Mudancas' && (
 <div className="space-y-4">

  <section className="rounded-2xl border border-border bg-card p-5 shadow-sm">
   <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">O que mudou ({changesWindow})</p>
   <h2 className="mt-1 text-[18px] font-bold text-foreground">Mudanças do período</h2>
   <p className="mt-1 text-[13px] text-muted-foreground">Veja o que teve impacto real, o que foi rotina e quais pilares foram mais afetados.</p>
   <div className="mt-4 border-t border-border pt-4">
    <p className="max-w-[840px] text-[13px] leading-relaxed text-foreground">{changesSummaryText}</p>
    <div className="mt-3 grid grid-cols-3 gap-3 text-[13px]">
     <div className="rounded-xl border border-border bg-muted p-3">
      <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">Pilar mais afetado</p>
      <p className="mt-1 font-semibold text-brand-text">{periodMostAffected}</p>
     </div>
     <div className="rounded-xl border border-border bg-muted p-3">
      <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">Estruturais</p>
      <p className="mt-1 font-semibold text-foreground">{structuralCount}</p>
     </div>
     <div className="rounded-xl border border-border bg-muted p-3">
      <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">Rotina</p>
      <p className="mt-1 font-semibold text-foreground">{routineCount}</p>
     </div>
    </div>
   </div>
  </section>

  <div className="space-y-2">
   <div className="flex flex-wrap items-center gap-2">
    {(['30 dias', '60 dias', '90 dias'] as FeedWindow[]).map((period) => (
     <button key={period} onClick={() => setChangesWindow(period)} className={cx('h-8 rounded-full px-4 text-[13px]', period === changesWindow ? 'border border-border bg-card font-semibold text-foreground shadow-sm' : 'text-muted-foreground')}>
      {period}
     </button>
    ))}
   </div>
   <div className="flex flex-wrap items-center gap-2">
    {changesFocusFilters.map((filter) => (
     <button
      key={filter}
      onClick={() => setChangesFocus(filter)}
      className={cx('rounded-full border px-3 py-1.5 text-[12px]', changesFocus === filter ? 'border-brand bg-brand-surface font-semibold text-brand' : 'border-border bg-card text-muted-foreground hover:bg-muted')}
     >
      {filter}
     </button>
    ))}
   </div>
   <div className="flex items-center gap-2">
    <label htmlFor="changes-pillar-filter" className="text-[12px] font-medium text-muted-foreground">Por pilar:</label>
    <select
     id="changes-pillar-filter"
     value={changesPillarFilter}
     onChange={(event) => setChangesPillarFilter(event.target.value as ChangePillarTag | 'Todos')}
     className="rounded-xl border border-border bg-card px-2.5 py-1.5 text-[12px] text-foreground"
    >
     {availablePillarsForFilter.map((pillar) => (
      <option key={pillar} value={pillar}>{pillar}</option>
     ))}
    </select>
   </div>
  </div>

  {principalChange && (
   <section className="rounded-2xl border border-danger-border bg-danger-surface p-5">
    <div className="flex items-start justify-between gap-3">
     <div>
      <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-danger-text">Principal mudança do período</p>
      <p className="mt-2 text-[14px] font-semibold text-foreground">{principalChange.title}</p>
      <p className="mt-1 text-[13px] text-dim">Com possível efeito no pilar de {principalChange.pillar} nos próximos fechamentos.</p>
     </div>
     <button
      className={cx('flex-shrink-0 rounded-xl border border-brand bg-brand px-3 py-1.5 text-[12px] font-semibold text-white transition-opacity hover:opacity-90', actionsDisabled ? 'cursor-not-allowed opacity-50' : '')}
      disabled={actionsDisabled}
      onClick={(event) => {
       if (guardAction(event, principalChange.companyId)) return;
       if (principalChange.pillar !== 'A classificar') goToPillar(principalChange.pillar);
      }}
     >
      Ver impacto
     </button>
    </div>
   </section>
  )}

  <div className="space-y-3">
   {!hasVisibleChanges && (
    <article className="rounded-2xl border border-border bg-card p-6 shadow-sm">
     <div className="flex flex-col items-center gap-2 py-4 text-center">
      <p className="text-[13px] text-muted-foreground">Sem eventos para os filtros atuais. Ajuste os filtros para ampliar o contexto.</p>
      <p className="text-[11px] text-muted-foreground">Última atualização: {safeMeta(activeData?.summaryMeta.updatedAt)}</p>
     </div>
    </article>
   )}

   {displayedStructural.length > 0 && (
    <section className="space-y-2">
     <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-danger-text">Mudanças estruturais</p>
     {displayedStructural.map((change) => renderChangeCard(change))}
    </section>
   )}

   {displayedRelevant.length > 0 && (
    <section className="space-y-2">
     <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-warning-text">Mudanças relevantes</p>
     {displayedRelevant.map((change) => renderChangeCard(change))}
    </section>
   )}

   {displayedRoutine.length > 0 && (
    <section className="space-y-2">
     <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-brand">Rotina</p>
     {displayedRoutine.map((item) => {
      if (item.type === 'single') return renderChangeCard(item.payload);
      const isOpen = Boolean(expandedRoutineGroups[item.payload.groupKey]);
      return (
       <article key={item.payload.groupKey} className="rounded-2xl border border-border bg-card p-4 shadow-sm">
        <p className="text-[15px] font-semibold text-foreground">{item.payload.groupTitle}</p>
        <p className="mt-2 text-[13px] text-dim">{item.payload.summary}</p>
        <p className="mt-2 text-[12px] text-muted-foreground">Pilar afetado: {item.payload.pillar}</p>
        <div className="mt-3 flex flex-wrap items-center gap-2">
         <button
          className={cx('rounded-xl border border-brand bg-brand px-3 py-1.5 text-[12px] font-semibold text-white transition-opacity hover:opacity-90', actionsDisabled ? 'cursor-not-allowed opacity-50' : '')}
          disabled={actionsDisabled}
          onClick={(event) => {
           if (guardAction(event, item.payload.items[0].companyId)) return;
           if (item.payload.pillar !== 'A classificar') goToPillar(item.payload.pillar);
          }}
         >
          Ver impacto no pilar
         </button>
         <button
          className="inline-flex items-center gap-1 rounded-xl border border-border px-3 py-1.5 text-[12px] text-muted-foreground hover:bg-muted"
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
 <div className="space-y-4">

  <section className="rounded-2xl border border-border bg-card p-5 shadow-sm">
   <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">Agenda ({eventsWindow})</p>
   <h2 className="mt-1 text-[18px] font-bold text-foreground">Próximos eventos</h2>
   <p className="mt-1 text-[13px] text-muted-foreground">Veja o que pode ter impacto real, o que é rotina e quais pilares podem ser mais afetados.</p>
   <div className="mt-4 border-t border-border pt-4">
    <p className="max-w-[840px] text-[13px] leading-relaxed text-foreground">
     {principalTimelineChange
      ? `${buildTimelineHeadlineLine({ title: principalTimelineChange.title, typeLabel: principalTimelineChange.typeLabel, mainPillar: principalTimelineChange.mainPillar }, eventsWindow)} Fora isso, o período traz eventos mais recorrentes, sem outro gatilho dominante na leitura geral.`
      : `Nos próximos ${eventsWindow.replace(' dias', '')} dias, a agenda está concentrada em eventos de acompanhamento, sem gatilho dominante previsto.`}
    </p>
    <div className="mt-3 grid grid-cols-3 gap-3 text-[13px]">
     <div className="rounded-xl border border-border bg-muted p-3">
      <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">Pilar mais sensível</p>
      <p className="mt-1 font-semibold text-brand-text">{timelineMostAffectedPillar}</p>
     </div>
     <div className="rounded-xl border border-border bg-muted p-3">
      <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">Gatilhos principais</p>
      <p className="mt-1 font-semibold text-foreground">{timelineStructuralCount}</p>
     </div>
     <div className="rounded-xl border border-border bg-muted p-3">
      <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">Rotina</p>
      <p className="mt-1 font-semibold text-foreground">{timelineRoutineCount}</p>
     </div>
    </div>
   </div>
  </section>

  <div className="space-y-2">
   <div className="flex flex-wrap items-center gap-2">
    {(['30 dias', '60 dias', '90 dias'] as FeedWindow[]).map((period) => (
     <button key={period} onClick={() => setEventsWindow(period)} className={cx('h-8 rounded-full px-4 text-[13px]', period === eventsWindow ? 'border border-border bg-card font-semibold text-foreground shadow-sm' : 'text-muted-foreground')}>
      {period}
     </button>
    ))}
   </div>
   <div className="flex flex-wrap items-center gap-2">
    {eventsFocusFilters.map((filter) => (
     <button
      key={filter}
      onClick={() => setEventsFocus(filter)}
      className={cx('rounded-full border px-3 py-1.5 text-[12px]', eventsFocus === filter ? 'border-brand bg-brand-surface font-semibold text-brand' : 'border-border bg-card text-muted-foreground hover:bg-muted')}
     >
      {filter}
     </button>
    ))}
   </div>
   <div className="flex items-center gap-2">
    <label htmlFor="events-pillar-filter" className="text-[12px] font-medium text-muted-foreground">Por pilar:</label>
    <select
     id="events-pillar-filter"
     value={eventsPillarFilter}
     onChange={(event) => setEventsPillarFilter(event.target.value as ChangePillarTag | 'Todos')}
     className="rounded-xl border border-border bg-card px-2.5 py-1.5 text-[12px] text-foreground"
    >
     {availablePillarsForFilter.map((pillar) => (
      <option key={pillar} value={pillar}>{pillar}</option>
     ))}
    </select>
   </div>
  </div>

  {principalTimelineChange && (
   <section className="rounded-2xl border border-danger-border bg-danger-surface p-5">
    <div className="flex items-start justify-between gap-3">
     <div>
      <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-danger-text">Principal gatilho do período</p>
      <p className="mt-2 text-[14px] font-semibold text-foreground">{principalTimelineChange.title}</p>
      <p className="mt-1 text-[13px] text-dim">Com possível efeito no pilar de {principalTimelineChange.mainPillar} nos próximos fechamentos.</p>
     </div>
     <button
      className={cx('flex-shrink-0 rounded-xl border border-brand bg-brand px-3 py-1.5 text-[12px] font-semibold text-white transition-opacity hover:opacity-90', actionsDisabled ? 'cursor-not-allowed opacity-50' : '')}
      disabled={actionsDisabled}
      onClick={(event) => {
       if (guardAction(event, principalTimelineChange.companyId)) return;
       if (principalTimelineChange.mainPillar !== 'A classificar') goToPillar(principalTimelineChange.mainPillar);
      }}
     >
      Ver impacto
     </button>
    </div>
   </section>
  )}

  <div className="space-y-3">
   {!hasVisibleTimelineEvents && (
    <article className="rounded-2xl border border-border bg-card p-6 shadow-sm">
     <div className="flex flex-col items-center gap-2 py-4 text-center">
      <p className="text-[13px] text-muted-foreground">Sem eventos para os filtros atuais. Ajuste os filtros para ampliar o contexto.</p>
      <p className="text-[11px] text-muted-foreground">Última atualização: {safeMeta(activeData?.summaryMeta.updatedAt)}</p>
     </div>
    </article>
   )}

   {displayedTimelineStructural.length > 0 && (
    <section className="space-y-2">
     <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-danger-text">Gatilhos principais</p>
     {displayedTimelineStructural.map((timelineEvent) => renderAgendaEventCard(timelineEvent))}
    </section>
   )}

   {displayedTimelineRelevant.length > 0 && (
    <section className="space-y-2">
     <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-warning-text">Eventos relevantes</p>
     {displayedTimelineRelevant.map((timelineEvent) => renderAgendaEventCard(timelineEvent))}
    </section>
   )}

   {displayedTimelineRoutine.length > 0 && (
    <section className="space-y-2">
     <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-brand">Rotina</p>
     {displayedTimelineRoutine.map((item) => {
      if (item.type === 'single') return renderAgendaEventCard(item.payload);
      const isOpen = Boolean(expandedEventRoutineGroups[item.payload.groupKey]);
      return (
       <article key={item.payload.groupKey} className="rounded-2xl border border-border bg-card p-4 shadow-sm">
        <p className="text-[15px] font-semibold text-foreground">{item.payload.groupTitle}</p>
        <p className="mt-2 text-[13px] text-dim">{item.payload.summary}</p>
        <p className="mt-2 text-[12px] text-muted-foreground">Pilar afetado: {item.payload.pillar}</p>
        <div className="mt-3 flex flex-wrap items-center gap-2">
         <button
          className={cx('rounded-xl border border-brand bg-brand px-3 py-1.5 text-[12px] font-semibold text-white transition-opacity hover:opacity-90', actionsDisabled ? 'cursor-not-allowed opacity-50' : '')}
          disabled={actionsDisabled}
          onClick={(event) => {
           if (guardAction(event, item.payload.items[0].companyId)) return;
           if (item.payload.pillar !== 'A classificar') goToPillar(item.payload.pillar);
          }}
         >
          Ver impacto no pilar
         </button>
         <button
          className="inline-flex items-center gap-1 rounded-xl border border-border px-3 py-1.5 text-[12px] text-muted-foreground hover:bg-muted"
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
    <section className="rounded-2xl border border-brand-border bg-gradient-to-br from-brand-surface to-muted p-5">
     <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-brand">Fechar a leitura</p>
     <p className="mt-1 text-[14px] text-foreground">Acompanhe o impacto esperado ou garanta lembrete dos principais gatilhos.</p>
     <div className="mt-3 flex flex-wrap items-center gap-2">
      <button
       className={cx('rounded-xl border border-brand bg-brand px-4 py-2 text-[13px] font-semibold text-white transition-opacity hover:opacity-90', actionsDisabled ? 'cursor-not-allowed opacity-50' : '')}
       disabled={actionsDisabled}
       onClick={(event) => {
        if (guardAction(event, companyContext.companyId)) return;
        setActiveTab('Pilares');
       }}
      >
       Ver todos os impactos esperados nos pilares
      </button>
      <button
       className={cx('rounded-xl border border-brand-border bg-card px-4 py-2 text-[13px] font-medium text-foreground hover:bg-brand-surface', actionsDisabled ? 'cursor-not-allowed opacity-50' : '')}
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
 <div className="space-y-4">

  <article className="rounded-2xl border border-border bg-card p-6 shadow-sm">
   <div className="flex flex-wrap items-start justify-between gap-3">
    <div>
     <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">Preço vs valor estimado</p>
     <h2 className="mt-1 text-[18px] font-bold text-foreground">Leitura por DCF</h2>
     <p className="mt-1 text-[13px] text-muted-foreground">Não é recomendação de compra ou venda.</p>
    </div>
    <div className="flex items-center gap-2">
     {valuationStateChipLabel && (
      <span className={cx('rounded-full border px-3 py-1 text-[13px] font-semibold', valuationStateChipTone)}>{valuationStateChipLabel}</span>
     )}
     <button
      type="button"
      onClick={(event) => { event.preventDefault(); event.stopPropagation(); setShowValuationMethodologyDrawer(true); }}
      className="inline-flex cursor-pointer items-center gap-1 rounded-xl border border-border px-2.5 py-1.5 text-[12px] text-muted-foreground hover:bg-muted"
      aria-label="Aprender como calculamos o valuation"
     >
      <CircleHelp className="h-3.5 w-3.5" />
      Aprender
     </button>
    </div>
   </div>
   <p className="mt-3 text-[11px] text-muted-foreground">Fonte: {safeMeta(activeData?.priceData.source)} · Atualizado em: {safeMeta(activeData?.priceData.updatedAt)}</p>

   <div className="mt-4 grid gap-3 sm:grid-cols-3">
    <div className="rounded-2xl border border-border bg-muted p-4">
     <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">Preço atual</p>
     <p className="mt-1 text-[22px] font-bold text-foreground">{safeMeta(activeData?.priceData.current) || '—'}</p>
    </div>
    <div className="rounded-2xl border border-border bg-muted p-4">
     <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">Preço justo estimado</p>
     <p className="mt-1 text-[22px] font-bold text-foreground">{safeMeta(activeData?.priceData.estimatedFairValue) || '—'}</p>
    </div>
    <div className="rounded-2xl border border-border bg-muted p-4">
     <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">Diferença vs atual</p>
     <p className="mt-1 text-[22px] font-bold text-foreground">{safeMeta(activeData?.priceData.differenceVsCurrent) || '—'}</p>
    </div>
   </div>

   {valuationSummaryLine && (
    <div className="mt-4 rounded-xl border border-brand-border bg-brand-surface p-4">
     <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-brand-text">Por que isso importa</p>
     <p className="mt-1 text-[14px] text-foreground">{valuationSummaryLine}</p>
    </div>
   )}
  </article>

  <section className="rounded-2xl border border-border bg-card p-5 shadow-sm">
   <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">Régua de valuation</p>
   {!hasSemanticDomain && (
    <div className="py-6 text-center text-[14px] text-muted-foreground">Sem base suficiente para exibir a régua de valuation neste momento.</div>
   )}
   {hasSemanticDomain && (
   <>
    <div className="mt-3 rounded-xl border border-border bg-muted p-4">
     <div className="mb-2 flex items-center justify-between text-[12px] font-medium text-muted-foreground">
      <span>{formatCurrencyBRL(rulerMin)}</span>
      <span>Posição do preço atual vs. preço justo estimado</span>
      <span>{formatCurrencyBRL(rulerMax)}</span>
     </div>
     <div className="relative pt-9">
      {fairValue != null && fairMarker != null && (
       <div className="pointer-events-none absolute left-0 right-0 top-0">
        <div className="absolute left-1/2 -translate-x-1/2 whitespace-nowrap rounded-xl border border-brand-border bg-card px-2 py-1 text-[13px] font-semibold text-brand-text shadow-sm">
         Preço justo estimado {formatCurrencyBRL(fairValue)}
        </div>
       </div>
      )}
      {currentMarker != null && (
       <div className="pointer-events-none absolute bottom-0 top-0 z-[1]" style={{ left: `${currentMarker}%` }}>
        <div className="-ml-[1.5px] h-full w-[3px] rounded-full bg-foreground/95 shadow-[0_0_0_2px_var(--card)]" />
        <div className={`absolute -top-5 whitespace-nowrap rounded-xl border border-border-strong bg-card px-2 py-1 text-[13px] font-semibold text-foreground shadow-sm ${currentMarkerLabelClass}`}>
         <span>{safeMeta(valuationBullet?.currentLabel) || 'Preço atual'}</span>
         <span className="ml-1 text-dim">{formatCurrencyBRL(currentPriceForRuler)}</span>
        </div>
       </div>
      )}
      <div className="h-9 overflow-hidden rounded-full border border-border bg-muted">
       {hasNearZone ? (
        <div className="flex h-full w-full">
         <div className="h-full bg-brand-surface" style={{ width: `${belowZoneWidthPct}%` }} />
         <div className="h-full border-x border-warning-border bg-warning-surface" style={{ width: `${nearZoneWidthPct}%` }} />
         <div className="h-full bg-danger-surface" style={{ width: `${aboveZoneWidthPct}%` }} />
        </div>
       ) : (
        <div className="h-full w-full bg-muted" />
       )}
      </div>
     </div>
     <div className="mt-3 grid gap-2 text-[12px] text-muted-foreground sm:grid-cols-3">
      <p><span className="inline-block h-2 w-2 rounded-full bg-brand-border" /> <span className="ml-1 font-medium text-foreground">Abaixo do preço justo estimado</span></p>
      <p><span className="inline-block h-2 w-2 rounded-full bg-warning-border" /> <span className="ml-1 font-medium text-foreground">Próximo do preço justo estimado</span></p>
      <p><span className="inline-block h-2 w-2 rounded-full bg-danger-border" /> <span className="ml-1 font-medium text-foreground">Acima do preço justo estimado</span></p>
     </div>
     <div className="mt-2">
      <p className="text-[13px] font-medium text-foreground">A régua mostra em qual zona o preço atual cai em relação ao preço justo estimado.</p>
      <button
       type="button"
       onClick={(event) => { event.preventDefault(); event.stopPropagation(); setShowValuationMethodologyDrawer(true); }}
       className="mt-1 inline-flex items-center gap-1 rounded-xl px-1 py-0.5 text-[12px] text-muted-foreground hover:bg-hover"
      >
       <CircleHelp className="h-3.5 w-3.5" />
       Entender cálculo do valuation
      </button>
     </div>
    </div>
   </>
   )}
  </section>

  <section className="rounded-2xl border border-border bg-card p-5 shadow-sm">
   <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">Cenários do valuation</p>
   <div className="mt-3 grid grid-cols-4 border-b border-border pb-2.5 text-[10px] font-semibold uppercase tracking-[0.06em] text-muted-foreground">
    <span>Cenário</span>
    <span>Valor estimado</span>
    <span>Diferença vs atual</span>
    <span>Leitura</span>
   </div>
   {valuationScenarios.map((scenario, index) => (
    <div key={`${scenario.scenario}-${index}`} className="grid grid-cols-4 border-b border-border py-3.5 text-[13px] text-foreground">
     <span className="font-medium">{scenario.scenario || '—'}</span>
     <span>{scenario.estimatedValue || '—'}</span>
     <span>{scenario.differenceVsCurrent || '—'}</span>
     <span className="text-muted-foreground">{scenario.reading || '—'}</span>
    </div>
   ))}
   {valuationScenarios.length === 0 && <div className="py-4 text-center text-[13px] text-muted-foreground">Sem cenários de valuation disponíveis.</div>}
  </section>

  <section className="rounded-2xl border border-border bg-card p-5 shadow-sm">
   <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">Sensibilidade do valuation</p>
   <p className="mt-1 text-[13px] text-muted-foreground">Drivers principais: crescimento terminal, WACC, margem operacional e capex/reinvestimento.</p>
   <div className="mt-3 grid gap-3 sm:grid-cols-2">
    {sensitivityDrivers.map((driver, index) => (
     <div key={`${driver.driver}-${index}`} className="rounded-xl border border-border bg-muted p-3">
      <p className="text-[13px] font-semibold text-foreground">{driver.driver || '—'}</p>
      <p className="mt-1 text-[13px] text-dim">{driver.value || '—'}</p>
      <p className="mt-1 text-[12px] text-muted-foreground">{driver.impact || '—'}</p>
     </div>
    ))}
    {sensitivityDrivers.length === 0 && <p className="text-[13px] text-muted-foreground">Sem drivers de sensibilidade disponíveis.</p>}
   </div>
  </section>

  <section className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
   <div className="border-b border-border bg-muted px-5 py-3">
    <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">Múltiplos de apoio</p>
   </div>
   <div className="grid grid-cols-5 border-b border-border px-5 py-2.5 text-[10px] font-semibold uppercase tracking-[0.06em] text-muted-foreground">
    <span>Métrica</span>
    <span>Atual</span>
    <span>Setor</span>
    <span>Histórico 5a</span>
    <span>Leitura</span>
   </div>
   {companyPriceRows.map((row) => (
    <div key={`${row.metric}-${row.companyId}`} className="grid grid-cols-5 border-b border-border px-5 py-3 text-[13px] text-foreground hover:bg-muted">
     <span className="font-medium">{row.metric}</span>
     <span>{row.current}</span>
     <span>{row.sector}</span>
     <span>{row.histórical}</span>
     <span className="text-muted-foreground">{row.insight}</span>
    </div>
   ))}
   {companyPriceRows.length === 0 && <div className="px-5 py-4 text-center text-[13px] text-muted-foreground">Sem múltiplos de apoio disponíveis.</div>}
   <div className="border-t border-border px-5 py-3">
    <p className="text-[12px] italic text-muted-foreground">{safeMeta(activeData?.priceData.multiplesSummary) || 'Múltiplos ajudam a contextualizar a leitura de valuation, sem substituir o cenário-base de DCF.'}</p>
   </div>
  </section>

 </div>
 )}

 {activeTab === 'Fontes' && (
 <div className="space-y-4">

  <article className="rounded-2xl border border-border bg-card p-6 shadow-sm">
   <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">Fontes & Metodologia</p>
   <h2 className="mt-1 text-[18px] font-bold text-foreground">Transparência da leitura</h2>
   <p className="mt-1 text-[13px] text-muted-foreground">Veja de onde vem os dados e quão atualizadas estão as fontes que sustentam esta análise.</p>
  </article>

  {sourceRowsWithRelevance.length === 0 && (
   <article className="rounded-2xl border border-border bg-card p-6 shadow-sm">
    <div className="flex flex-col items-center gap-3 py-4 text-center">
     <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-muted">
      <Database className="h-5 w-5 text-muted-foreground" />
     </div>
     <p className="text-[14px] font-medium text-muted-foreground">Ainda não temos dados suficientes para este indicador.</p>
     <p className="text-[12px] text-muted-foreground">Última tentativa: {safeMeta(activeData?.summaryMeta.updatedAt)} · Fonte esperada: CVM/RI</p>
    </div>
   </article>
  )}

  {sourceRowsWithRelevance.length > 0 && (
  <>
   <section className="rounded-2xl border border-border bg-card p-5 shadow-sm">
    <div className="flex flex-wrap items-center justify-between gap-3">
     <div>
      <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">Confiabilidade das fontes</p>
      <h3 className="mt-1 text-[16px] font-bold text-foreground">{resolvedSourceConfidenceLabel}</h3>
     </div>
     <span className={cx('rounded-full border px-3 py-1 text-[12px] font-semibold', sourceConfidenceTone)}>{resolvedSourceConfidenceLabel}</span>
    </div>
    <p className="mt-2 text-[13px] text-dim">{resolvedSourceConfidenceSummary}</p>
    <div className="mt-3 grid grid-cols-3 gap-3 text-[13px]">
     <div className="rounded-xl border border-border bg-muted p-3">
      <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">Fontes atualizadas</p>
      <p className="mt-1 font-semibold text-foreground">{updatedPrimarySources}</p>
     </div>
     <div className="rounded-xl border border-border bg-muted p-3">
      <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">Fontes complementares antigas</p>
      <p className="mt-1 font-semibold text-foreground">{outdatedComplementarySources}</p>
     </div>
     <div className="rounded-xl border border-border bg-muted p-3">
      <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">Última atualização</p>
      <p className="mt-1 font-semibold text-foreground">{safeMeta(latestSourceDate)}</p>
     </div>
    </div>
   </section>

   <section className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
    <div className="border-b border-border bg-muted px-5 py-3">
     <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">Fontes principais da leitura</p>
    </div>
    <div className="grid grid-cols-9 border-b border-border px-5 py-2.5 text-[10px] font-semibold uppercase tracking-[0.06em] text-muted-foreground">
     <span>Categoria</span>
     <span>Fonte</span>
     <span>Documento</span>
     <span>Data</span>
     <span>Status</span>
     <span className="col-span-2">Consequência</span>
     <span className="col-span-2">Link</span>
    </div>
    {primarySourceRows.map((row) => (
    <div key={`${row.category}-${row.doc}`} className="grid grid-cols-9 items-center border-b border-border px-5 py-3.5 text-[12px] text-foreground hover:bg-muted">
     <span className="font-medium">{row.category}</span>
     <span className="text-muted-foreground">{safeMeta(row.source)}</span>
     <span>{row.doc}</span>
     <span className="text-muted-foreground">{safeMeta(row.date)}</span>
     <span>
      <span className={cx('rounded-full border px-2 py-0.5 text-[10px] font-semibold', row.status === 'Atualizado' ? 'border-brand-border bg-brand-surface text-brand' : 'border-warning-border bg-warning-surface text-warning-text')}>
       {row.statusLabel}
      </span>
     </span>
     <span className="col-span-2 text-[11px] text-muted-foreground">{row.consequence}</span>
     <a
      href={row.link}
      target="_blank"
      rel="noreferrer"
      onClick={(event) => {
       if (guardAction(event, row.companyId)) return;
      }}
      className={cx('col-span-2 inline-flex items-center gap-1 text-[11px] text-brand hover:underline', actionsDisabled ? 'opacity-50' : '')}
     >
      Abrir documento
      <ExternalLink className="h-3 w-3" />
     </a>
    </div>
    ))}
   </section>

   <section className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
    <div className="border-b border-border bg-muted px-5 py-3">
     <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">Fontes complementares</p>
    </div>
    <div className="grid grid-cols-9 border-b border-border px-5 py-2.5 text-[10px] font-semibold uppercase tracking-[0.06em] text-muted-foreground">
     <span>Categoria</span>
     <span>Fonte</span>
     <span>Documento</span>
     <span>Data</span>
     <span>Status</span>
     <span className="col-span-2">Consequência</span>
     <span className="col-span-2">Link</span>
    </div>
    {complementarySourceRows.map((row) => (
    <div key={`${row.category}-${row.doc}`} className="grid grid-cols-9 items-center border-b border-border px-5 py-3.5 text-[12px] text-foreground hover:bg-muted">
     <span className="font-medium">{row.category}</span>
     <span className="text-muted-foreground">{safeMeta(row.source)}</span>
     <span>{row.doc}</span>
     <span className="text-muted-foreground">{safeMeta(row.date)}</span>
     <span>
      <span className={cx('rounded-full border px-2 py-0.5 text-[10px] font-semibold', row.status === 'Atualizado' ? 'border-brand-border bg-brand-surface text-brand' : 'border-warning-border bg-warning-surface text-warning-text')}>
       {row.statusLabel}
      </span>
     </span>
     <span className="col-span-2 text-[11px] text-muted-foreground">{row.consequence}</span>
     <a
      href={row.link}
      target="_blank"
      rel="noreferrer"
      onClick={(event) => {
       if (guardAction(event, row.companyId)) return;
      }}
      className={cx('col-span-2 inline-flex items-center gap-1 text-[11px] text-brand hover:underline', actionsDisabled ? 'opacity-50' : '')}
     >
      Abrir documento
      <ExternalLink className="h-3 w-3" />
     </a>
    </div>
    ))}
   </section>

   <section className="rounded-2xl border border-border bg-card p-5 shadow-sm">
    <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">Como usamos essas fontes</p>
    <ul className="mt-3 space-y-2">
     <li className="flex items-start gap-2 text-[13px] text-dim"><span className="mt-[5px] h-1.5 w-1.5 flex-shrink-0 rounded-full bg-muted-foreground" /><span>Dados financeiros sustentam os pilares estruturais da leitura.</span></li>
     <li className="flex items-start gap-2 text-[13px] text-dim"><span className="mt-[5px] h-1.5 w-1.5 flex-shrink-0 rounded-full bg-muted-foreground" /><span>Eventos e comunicados complementam o contexto recente da empresa.</span></li>
     <li className="flex items-start gap-2 text-[13px] text-dim"><span className="mt-[5px] h-1.5 w-1.5 flex-shrink-0 rounded-full bg-muted-foreground" /><span>Fontes complementares não substituem as fontes principais da análise.</span></li>
    </ul>
   </section>
  </>
  )}
 </div>
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
 className="absolute inset-0 bg-foreground/20"
 onClick={() => setShowValuationMethodologyDrawer(false)}
 />
 <aside className="absolute inset-y-0 right-0 w-full max-w-[460px] overflow-y-auto border-l border-border bg-card p-6 shadow-2xl">
 <div className="flex items-start justify-between gap-3">
 <div>
 <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Metodologia</p>
 <h3 className="mt-1 text-[16px] font-semibold text-foreground">Como calculamos o valuation</h3>
 </div>
 <button
 type="button"
 className="rounded-md border border-border px-2.5 py-1 text-[12px] text-dim hover:bg-background"
 onClick={() => setShowValuationMethodologyDrawer(false)}
 >
 Fechar
 </button>
 </div>
 <div className="mt-4 space-y-4 text-[13px] text-dim">
 <p>Nosso valuation busca responder uma pergunta simples: quanto uma empresa vale hoje com base no caixa que ela pode gerar no futuro?</p>
 <p>Para isso, usamos um modelo de Fluxo de Caixa Descontado (DCF).</p>

 <section className="rounded-lg border border-border bg-muted p-3">
 <p className="font-semibold text-foreground">Em termos simples</p>
 <p className="mt-1">Projetamos a geração de caixa futura da empresa, trazemos esses valores para o presente com uma taxa de desconto e chegamos a uma estimativa de valor por ação.</p>
 </section>

 <section className="rounded-lg border border-border bg-muted p-3">
 <p className="font-semibold text-foreground">A lógica central</p>
 <p className="mt-1">Uma empresa vale o quanto consegue gerar de caixa ao longo do tempo. Como o dinheiro no futuro vale menos do que hoje, descontamos esses fluxos usando uma taxa que reflete risco, custo de capital e estrutura financeira.</p>
 </section>

 <section className="rounded-lg border border-border bg-muted p-3">
 <p className="font-semibold text-foreground">Como fazemos isso</p>
 <ul className="mt-2 list-disc space-y-1 pl-5">
 <li>Partimos dos dados atuais da empresa, como receita, EBIT, imposto, dívida, caixa e número de ações.</li>
 <li>Projetamos crescimento, margem operacional e reinvestimento para os próximos anos.</li>
 <li>Calculamos o fluxo de caixa livre da firma (FCFF).</li>
 <li>Trazemos esses fluxos ao valor presente usando o WACC.</li>
 <li>Ajustamos dívida, caixa e outros itens para chegar ao valor do patrimônio.</li>
 <li>Dividimos pelo número de ações para estimar o preço justo por ação.</li>
 </ul>
 </section>

 <section className="rounded-lg border border-border bg-muted p-3">
 <p className="font-semibold text-foreground">O que mais influencia o resultado</p>
 <p className="mt-1">O valuation depende principalmente de crescimento da receita, margem operacional, reinvestimento, WACC, crescimento terminal e número de ações.</p>
 <p className="mt-1">Pequenas mudanças nessas premissas podem alterar de forma relevante o preço justo estimado.</p>
 </section>

 <section className="rounded-lg border border-border bg-muted p-3">
 <p className="font-semibold text-foreground">O que esse cálculo faz bem</p>
 <p className="mt-1">Ele ajuda a enxergar o valor econômico do negócio, comparar preço de mercado com valor estimado e entender quais premissas sustentam a tese.</p>
 </section>

 <section className="rounded-lg border border-border bg-muted p-3">
 <p className="font-semibold text-foreground">O que esse cálculo não faz</p>
 <p className="mt-1">Ele não prevê o preço da ação no curto prazo, não garante retorno e não substitui a análise qualitativa do negócio.</p>
 </section>

 <section className="rounded-lg border border-border bg-muted p-3">
 <p className="font-semibold text-foreground">Em resumo</p>
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







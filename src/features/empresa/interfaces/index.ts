/**
 * Tipos de domínio para a análise de empresa (company-analysis).
 */

// ─── Tipos primitivos ─────────────────────────────────────────────────────────

export type Status = 'Risco' | 'Atencao' | 'Saudavel';
export type MainTab = 'Resumo' | 'Pilares' | 'Mudancas' | 'Eventos' | 'Preço' | 'Fontes';
export type QueueFilter = 'Todas' | 'Atencao' | 'Risco';
export type WindowSize = '5a' | '10a';
export type FeedWindow = '30 dias' | '60 dias' | '90 dias';
export type ChangesFocusFilter = 'Mais relevantes' | 'Rotina' | 'Estruturais';
export type EventsFocusFilter = 'Mais relevantes' | 'Rotina' | 'Principais';
export type EvidenceTab = 'Fonte' | 'Trecho' | 'Como calculamos';
export type PillarName = 'Divida' | 'Caixa' | 'Margens' | 'Retorno' | 'Proventos';
export type ChangePriorityLevel = 'Estrutural' | 'Relevante' | 'Rotina';
export type ChangePillarTag = PillarName | 'A classificar';

// ─── Contexto ─────────────────────────────────────────────────────────────────

export type CompanyContext = {
  companyId: string;
  ticker: string;
  name: string;
};

export type Contextual<T> = T & {
  companyId: string;
  ticker: string;
};

// ─── Fila de empresas ─────────────────────────────────────────────────────────

export type CompanyQueueItem = {
  companyId: string;
  ticker: string;
  name: string;
  status: Status;
  logo?: string;
  initials?: string;
  description: string;
};

// ─── Fonte ────────────────────────────────────────────────────────────────────

export type Source = {
  name: string;
  docLabel: string;
  date: string;
  url?: string;
};

// ─── Pilares ──────────────────────────────────────────────────────────────────

export type PillarMetric = {
  label: string;
  value: string;
  period: string;
  source: Source;
};

export type PillarEvidence = {
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

export type PillarPrimarySignal = {
  title: string;
  value: string;
  metric: string;
  why: string;
  intensity: string;
  label: string;
};

export type PillarWatchItem = {
  title: string;
  why: string;
  intensity: string;
};

export type PillarData = {
  name: PillarName;
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

// ─── Mudanças ─────────────────────────────────────────────────────────────────

export type ChangeItem = {
  type: string;
  date: string;
  severity: string;
  impact: string;
  title: string;
  impactLine: string;
  unchangedLine: string;
  source: { docLabel: string; url: string };
  beforeAfter?: string;
};

// ─── Eventos / Agenda ─────────────────────────────────────────────────────────

export type TimelineEvent = {
  date: string;
  title: string;
  source: string;
  why: string;
  expectedImpact: string;
  pillars: string[];
};

// ─── Preço / Valuation ────────────────────────────────────────────────────────

export type PriceValuationStateChip = {
  label: string;
  tone?: string;
};

export type PriceValuationScenario = {
  scenario: string;
  estimatedValue: string;
  differenceVsCurrent: string;
  reading: string;
};

export type PriceSensitivityDriver = {
  driver: string;
  value: string;
  impact: string;
};

export type PriceBulletChart = {
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

export type PriceRow = {
  metric: string;
  current: string;
  sector: string;
  histórical: string;
  insight: string;
};

export type SourceRow = {
  category: string;
  source: string;
  doc: string;
  date: string;
  status: string;
  link: string;
  displaySource?: string;
  displayDoc?: string;
  displayStatus?: string;
};

// ─── Dados completos da empresa ───────────────────────────────────────────────

export type CompanyData = {
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
  changes: Array<Contextual<ChangeItem>>;
  timelineEvents: Array<Contextual<TimelineEvent>>;
  priceData: Contextual<{
    current: string;
    summary: string;
    labels: string[];
    values: number[];
    currentMarker: number;
    medianMarker: number;
    rows: Array<Contextual<PriceRow>>;
    source?: string;
    updatedAt?: string;
    estimatedFairValue?: string;
    differenceVsCurrent?: string;
    valuationSummary?: string;
    valuationStateChip?: PriceValuationStateChip;
    valuationScenarios?: PriceValuationScenario[];
    bulletChart?: PriceBulletChart;
    sensitivityDrivers?: PriceSensitivityDriver[];
    multiplesSummary?: string;
    metricSeries?: Record<string, { labels: string[]; values: number[]; currentMarker: number; medianMarker: number }>;
  }>;
  sourceRows: Array<Contextual<SourceRow>>;
  sourceConfidence?: { title?: string; level?: string; summary?: string };
  changesSummaryByWindow?: Record<string, Record<string, unknown>>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  changesSummary?: any;
};

// ─── Tab payload ──────────────────────────────────────────────────────────────

export type TabPayload =
  | { status: 'ready'; companyId: string; data: CompanyData }
  | { status: 'empty'; companyId: string; ticker: string };

// ─── Preferências ─────────────────────────────────────────────────────────────

export type CompanyPreferences = {
  activeTab: MainTab;
  changesWindow: FeedWindow;
  eventsWindow: FeedWindow;
  lastOpenPillar: PillarName | null;
};

// ─── Pillar map ───────────────────────────────────────────────────────────────

export type PillarMapStatus = 'risco' | 'atencao' | 'saudavel';

export type PillarMapDatum = {
  pillar: PillarName;
  pillarLabel: string;
  score: number;
  status: PillarMapStatus;
  delta?: number;
  reason?: string;
};

// ─── Tipos enriquecidos derivados em runtime ──────────────────────────────────

export type EnrichedChange = Contextual<ChangeItem> & {
  level: ChangePriorityLevel;
  pillar: ChangePillarTag;
  interpretation: string;
  whyItMatters: string;
  severityLabel: string;
  routineKey: string;
  dateSortValue: number;
};

export type EnrichedTimelineEvent = Contextual<TimelineEvent> & {
  level: ChangePriorityLevel;
  typeLabel: string;
  mainPillar: ChangePillarTag;
  interpretation: string;
  whyItMatters: string;
  severityLabel: string;
  dateSortValue: number;
  routineKey: string;
  sourceUrl: string;
};

export type RoutineGroup = {
  groupKey: string;
  items: EnrichedChange[];
  pillar: ChangePillarTag;
  type: string;
  groupTitle: string;
  summary: string;
};

export type TimelineRoutineGroup = {
  groupKey: string;
  items: EnrichedTimelineEvent[];
  pillar: ChangePillarTag;
  groupTitle: string;
  summary: string;
};

export type RoutineRenderItem =
  | { type: 'group'; payload: RoutineGroup }
  | { type: 'single'; payload: EnrichedChange };

export type TimelineRoutineRenderItem =
  | { type: 'group'; payload: TimelineRoutineGroup }
  | { type: 'single'; payload: EnrichedTimelineEvent };

'use client';

import { useState } from 'react';

// ─── Types ────────────────────────────────────────────────────────────────────

export type OverviewTabState = {
  descExpanded: boolean;
  setDescExpanded: React.Dispatch<React.SetStateAction<boolean>>;
  period: '6m' | '1y' | '3y' | '5y';
  setPeriod: React.Dispatch<React.SetStateAction<'6m' | '1y' | '3y' | '5y'>>;
  eventsDrawer: boolean;
  setEventsDrawer: React.Dispatch<React.SetStateAction<boolean>>;
};

export type ValueTabState = {
  activeTab: 'pe' | 'ps' | 'pb';
  setActiveTab: React.Dispatch<React.SetStateAction<'pe' | 'ps' | 'pb'>>;
  activeRatio: 'pe' | 'ps' | 'pb';
  setActiveRatio: React.Dispatch<React.SetStateAction<'pe' | 'ps' | 'pb'>>;
  activePeriod: '3M' | '1Y' | '3Y' | '5Y';
  setActivePeriod: React.Dispatch<React.SetStateAction<'3M' | '1Y' | '3Y' | '5Y'>>;
};

export type FutureTabState = {
  earningsActiveKeys: Set<string>;
  setEarningsActiveKeys: React.Dispatch<React.SetStateAction<Set<string>>>;
  lpaActive: boolean;
  setLpaActive: React.Dispatch<React.SetStateAction<boolean>>;
  drawerOpen: boolean;
  setDrawerOpen: React.Dispatch<React.SetStateAction<boolean>>;
};

export type PastTabState = {
  activeKeys: Set<string>;
  setActiveKeys: React.Dispatch<React.SetStateAction<Set<string>>>;
  drawerOpen: boolean;
  setDrawerOpen: React.Dispatch<React.SetStateAction<boolean>>;
};

export type HealthTabState = {
  activeKeys: Set<string>;
  setActiveKeys: React.Dispatch<React.SetStateAction<Set<string>>>;
  drawerOpen: boolean;
  setDrawerOpen: React.Dispatch<React.SetStateAction<boolean>>;
};

export type DividendTabState = {
  hovered: number | null;
  setHovered: React.Dispatch<React.SetStateAction<number | null>>;
  drawerOpen: boolean;
  setDrawerOpen: React.Dispatch<React.SetStateAction<boolean>>;
};

export type AnalysisPageState = {
  overview: OverviewTabState;
  value: ValueTabState;
  future: FutureTabState;
  past: PastTabState;
  health: HealthTabState;
  dividend: DividendTabState;
};

// ─── Default active keys ──────────────────────────────────────────────────────

const FUTURE_EARNINGS_DEFAULT_KEYS: ReadonlySet<string> = new Set([
  'Receita',
  'Ganhos',
  'Fluxo de Caixa Livre',
  'Fluxo de Caixa das Atividades Operacionais (FCO)',
]);

const PAST_HISTORICO_DEFAULT_KEYS: ReadonlySet<string> = new Set([
  'Receita',
  'Ganhos',
  'Fluxo de Caixa Livre',
  'Fluxo de Caixa das Atividades Operacionais (FCO)',
  'Despesas Operacionais',
]);

const HEALTH_DEBT_DEFAULT_KEYS: ReadonlySet<string> = new Set([
  'Dívida',
  'Patrimônio Líquido',
  'Dinheiro e equivalentes',
]);

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useAnalysisPageState(): AnalysisPageState {
  // Overview
  const [descExpanded, setDescExpanded] = useState(false);
  const [period, setPeriod] = useState<'6m' | '1y' | '3y' | '5y'>('1y');
  const [eventsDrawer, setEventsDrawer] = useState(false);

  // Value
  const [valueActiveTab, setValueActiveTab] = useState<'pe' | 'ps' | 'pb'>('pe');
  const [valueActiveRatio, setValueActiveRatio] = useState<'pe' | 'ps' | 'pb'>('pe');
  const [valueActivePeriod, setValueActivePeriod] = useState<'3M' | '1Y' | '3Y' | '5Y'>('5Y');

  // Future
  const [earningsActiveKeys, setEarningsActiveKeys] = useState<Set<string>>(
    () => new Set(FUTURE_EARNINGS_DEFAULT_KEYS),
  );
  const [lpaActive, setLpaActive] = useState(true);
  const [futureDrawerOpen, setFutureDrawerOpen] = useState(false);

  // Past
  const [pastActiveKeys, setPastActiveKeys] = useState<Set<string>>(
    () => new Set(PAST_HISTORICO_DEFAULT_KEYS),
  );
  const [pastDrawerOpen, setPastDrawerOpen] = useState(false);

  // Health
  const [healthActiveKeys, setHealthActiveKeys] = useState<Set<string>>(
    () => new Set(HEALTH_DEBT_DEFAULT_KEYS),
  );
  const [healthDrawerOpen, setHealthDrawerOpen] = useState(false);

  // Dividend
  const [dividendHovered, setDividendHovered] = useState<number | null>(null);
  const [dividendDrawerOpen, setDividendDrawerOpen] = useState(false);

  return {
    overview: {
      descExpanded,
      setDescExpanded,
      period,
      setPeriod,
      eventsDrawer,
      setEventsDrawer,
    },
    value: {
      activeTab: valueActiveTab,
      setActiveTab: setValueActiveTab,
      activeRatio: valueActiveRatio,
      setActiveRatio: setValueActiveRatio,
      activePeriod: valueActivePeriod,
      setActivePeriod: setValueActivePeriod,
    },
    future: {
      earningsActiveKeys,
      setEarningsActiveKeys,
      lpaActive,
      setLpaActive,
      drawerOpen: futureDrawerOpen,
      setDrawerOpen: setFutureDrawerOpen,
    },
    past: {
      activeKeys: pastActiveKeys,
      setActiveKeys: setPastActiveKeys,
      drawerOpen: pastDrawerOpen,
      setDrawerOpen: setPastDrawerOpen,
    },
    health: {
      activeKeys: healthActiveKeys,
      setActiveKeys: setHealthActiveKeys,
      drawerOpen: healthDrawerOpen,
      setDrawerOpen: setHealthDrawerOpen,
    },
    dividend: {
      hovered: dividendHovered,
      setHovered: setDividendHovered,
      drawerOpen: dividendDrawerOpen,
      setDrawerOpen: setDividendDrawerOpen,
    },
  };
}

"use client";

import { useMemo, useState } from "react";
import {
  Bell,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  MoreHorizontal,
  Plus,
  Search,
  Settings,
  GitCompare,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { GlossaryText } from "./glossary/glossary-text";

import { Sidebar } from "./dashboard/sidebar";

type Pillar = "Dívida" | "Caixa" | "Margens" | "Retorno" | "Proventos";

type PriorityItem = {
  id: string;
  company: string;
  ticker: string;
  sector: string;
  badge: "Risco" | "Atenção" | "Saudável";
  change: string;
  why: string;
  evidence: string;
  pillar: Pillar;
  evidenceId?: string;
};

type FeedItem = {
  id: string;
  headline: string;
  detail: string;
  detailTwo: string;
  pillar: Pillar;
  evidence: string;
  ticker: string;
  severity: "Risco" | "Atenção" | "Saudável";
  source: "CVM" | "RI";
  range: "7d" | "30d" | "90d";
  evidenceId?: string;
};

type WatchlistCompany = {
  name: string;
  ticker: string;
  sector: string;
  scores: number[];
  lastChangeDays: number;
  freshness: "Atual" | "Falha" | "Sem dados";
  volatility?: "Baixa" | "Moderada" | "Alta";
  attentionPillar: Pillar;
  tags: string[];
};

type AlertItem = {
  id: string;
  title: string;
  summary: string;
  time: string;
  severity: "Risco" | "Atenção" | "Saudável";
};

const pillars: Pillar[] = ["Dívida", "Caixa", "Margens", "Retorno", "Proventos"];

const priorityItems: PriorityItem[] = [
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

const feedItems: FeedItem[] = [
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

const watchlistCompanies: WatchlistCompany[] = [
  {
    name: "WEG",
    ticker: "WEGE3",
    sector: "Indústria",
    scores: [78, 84, 72, 80, 64],
    lastChangeDays: 2,
    freshness: "Atual",
    volatility: "Baixa",
    attentionPillar: "Margens",
    tags: ["Qualidade", "Defensiva"],
  },
  {
    name: "Itaú Unibanco",
    ticker: "ITUB4",
    sector: "Bancos",
    scores: [72, 78, 70, 76, 74],
    lastChangeDays: 4,
    freshness: "Atual",
    volatility: "Baixa",
    attentionPillar: "Retorno",
    tags: ["Dividendos"],
  },
  {
    name: "Taesa",
    ticker: "TAEE11",
    sector: "Energia",
    scores: [56, 62, 60, 64, 82],
    lastChangeDays: 6,
    freshness: "Atual",
    volatility: "Moderada",
    attentionPillar: "Proventos",
    tags: ["Renda"],
  },
  {
    name: "Cosan",
    ticker: "CSAN3",
    sector: "Consumo",
    scores: [42, 58, 46, 52, 48],
    lastChangeDays: 1,
    freshness: "Falha",
    volatility: "Alta",
    attentionPillar: "Dívida",
    tags: ["Cíclica"],
  },
  {
    name: "Fleury",
    ticker: "FLRY3",
    sector: "Saúde",
    scores: [70, 74, 68, 72, 58],
    lastChangeDays: 3,
    freshness: "Atual",
    volatility: "Baixa",
    attentionPillar: "Margens",
    tags: ["Qualidade"],
  },
  {
    name: "MRV",
    ticker: "MRVE3",
    sector: "Construção",
    scores: [32, 44, 30, 36, 40],
    lastChangeDays: 12,
    freshness: "Falha",
    volatility: "Alta",
    attentionPillar: "Dívida",
    tags: ["Risco"],
  },
  {
    name: "Petrobras",
    ticker: "PETR4",
    sector: "Energia",
    scores: [60, 66, 58, 64, 70],
    lastChangeDays: 5,
    freshness: "Atual",
    volatility: "Moderada",
    attentionPillar: "Proventos",
    tags: ["Dividendos"],
  },
  {
    name: "Ambev",
    ticker: "ABEV3",
    sector: "Consumo",
    scores: [68, 72, 54, 50, 62],
    lastChangeDays: 9,
    freshness: "Atual",
    volatility: "Baixa",
    attentionPillar: "Retorno",
    tags: ["Defensiva"],
  },
  {
    name: "Gerdau",
    ticker: "GGBR4",
    sector: "Siderurgia",
    scores: [50, 60, 56, 58, 52],
    lastChangeDays: 7,
    freshness: "Atual",
    volatility: "Moderada",
    attentionPillar: "Dívida",
    tags: ["Cíclica"],
  },
  {
    name: "Magazine Luiza",
    ticker: "MGLU3",
    sector: "Varejo",
    scores: [38, 48, 40, 34, 30],
    lastChangeDays: 14,
    freshness: "Falha",
    volatility: "Alta",
    attentionPillar: "Caixa",
    tags: ["Risco"],
  },
  {
    name: "RaiaDrogasil",
    ticker: "RADL3",
    sector: "Saúde",
    scores: [66, 70, 62, 68, 54],
    lastChangeDays: 4,
    freshness: "Atual",
    volatility: "Baixa",
    attentionPillar: "Margens",
    tags: ["Qualidade"],
  },
  {
    name: "Vibra",
    ticker: "VBBR3",
    sector: "Energia",
    scores: [48, 54, 50, 52, 46],
    lastChangeDays: 8,
    freshness: "Sem dados",
    attentionPillar: "Caixa",
    tags: ["Atenção"],
  },
];

const alerts: AlertItem[] = [
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

const suggestedCompanies = ["BBAS3", "SUZB3", "EQTL3", "LREN3", "RAIL3", "RADL3"];

const badgeStyles: Record<PriorityItem["badge"], string> = {
  Risco: "bg-rose-100 text-rose-900 border-rose-300",
  "Atenção": "bg-amber-100 text-amber-900 border-amber-300",
  "Saudável": "bg-emerald-100 text-emerald-900 border-emerald-300",
};

const clickableItemStyles: Record<PriorityItem["badge"], string> = {
  Risco: "border-l-rose-400 hover:bg-rose-50/40",
  Atenção: "border-l-amber-400 hover:bg-amber-50/40",
  Saudável: "border-l-emerald-400 hover:bg-emerald-50/40",
};

const alertStyles: Record<AlertItem["severity"], string> = {
  Risco: "bg-rose-100 text-rose-900 border-rose-300",
  "Atenção": "bg-amber-100 text-amber-900 border-amber-300",
  "Saudável": "bg-emerald-100 text-emerald-900 border-emerald-300",
};

const freshnessBadgeStyles: Record<"Atualizado" | "Dados pendentes" | "Sem dados", string> = {
  Atualizado: "bg-emerald-50 text-emerald-700 border-emerald-100",
  "Dados pendentes": "bg-amber-50 text-amber-700 border-amber-100",
  "Sem dados": "bg-neutral-100 text-neutral-700 border-neutral-200",
};

const pillarTagStyles: Record<Pillar, string> = {
  "Dívida": "bg-rose-50 text-rose-700 border-rose-100",
  Caixa: "bg-amber-50 text-amber-700 border-amber-100",
  Margens: "bg-emerald-50 text-emerald-700 border-emerald-100",
  Retorno: "bg-sky-50 text-sky-700 border-sky-100",
  Proventos: "bg-teal-50 text-teal-700 border-teal-100",
};

const rangeOptions: Array<"7d" | "30d" | "90d" | "Todos"> = ["7d", "30d", "90d", "Todos"];
const priorityRankingLabels = ["Maior piora relativa do dia", "Maior pressão estrutural", "Maior sinal de atenção"] as const;

export function WatchlistPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"updates" | "list">("updates");
  const [activeRange, setActiveRange] = useState<"7d" | "30d" | "90d" | "Todos">("30d");
  const [activePillars, setActivePillars] = useState<Pillar[]>([]);
  const [severityFilter, setSeverityFilter] = useState<"Todos" | "Risco" | "Atenção" | "Saudável">("Todos");
  const [sourceFilter, setSourceFilter] = useState<"Todas" | "CVM" | "B3" | "RI">("Todas");
  const [showAdvancedFeedFilters, setShowAdvancedFeedFilters] = useState(false);
  const [listSearch, setListSearch] = useState("");
  const [sortBy, setSortBy] = useState("Mudou recentemente");
  const [filters, setFilters] = useState({
    sector: "Todos",
    tags: "Todos",
    pillar: "Todos",
  });
  const [showListFilters, setShowListFilters] = useState(false);
  const [listSeverityFilter, setListSeverityFilter] = useState<"Todos" | "Risco" | "Atenção" | "Saudável">("Todos");
  const [listSourceFilter, setListSourceFilter] = useState<"Todas" | "CVM" | "B3" | "RI">("Todas");
  const [listDensity, setListDensity] = useState<"Compacto" | "Detalhado">("Compacto");
  const [unseenOnly, setUnseenOnly] = useState(true);
  const [seenTickers, setSeenTickers] = useState<string[]>([]);
  const [showAlertActionOnly, setShowAlertActionOnly] = useState(true);
  const [expandedTicker, setExpandedTicker] = useState<string | null>(null);
  const [quickActionsTicker, setQuickActionsTicker] = useState<string | null>(null);

  const [uiState] = useState<"ready" | "loading" | "empty">("ready");

  const getStatusFromScores = (scores: number[]): "Risco" | "Atenção" | "Saudável" => {
    const minScore = Math.min(...scores);
    if (minScore < 50) return "Risco";
    if (minScore < 70) return "Atenção";
    return "Saudável";
  };

  const sourceByTicker: Record<string, "CVM" | "B3" | "RI"> = {
    WEGE3: "CVM",
    ITUB4: "B3",
    TAEE11: "RI",
    CSAN3: "CVM",
    FLRY3: "CVM",
    MRVE3: "CVM",
    PETR4: "B3",
    ABEV3: "CVM",
    GGBR4: "CVM",
    MGLU3: "B3",
    RADL3: "RI",
    VBBR3: "RI",
  };

  const filteredFeedItems = useMemo(() => {
    return feedItems.filter((item) => {
      if (activeRange !== "Todos" && item.range !== activeRange) return false;
      if (activePillars.length > 0 && !activePillars.includes(item.pillar)) return false;
      if (severityFilter !== "Todos" && item.severity !== severityFilter) return false;
      if (sourceFilter !== "Todas" && item.source !== sourceFilter) return false;
      return true;
    });
  }, [activePillars, activeRange, severityFilter, sourceFilter]);

  const filteredCompanies = useMemo(() => {
    return watchlistCompanies
      .filter((company) => {
        const companyStatus = getStatusFromScores(company.scores);
        const companySource = sourceByTicker[company.ticker] ?? "CVM";
        const query = listSearch.toLowerCase();
        if (query && !company.name.toLowerCase().includes(query) && !company.ticker.toLowerCase().includes(query)) {
          return false;
        }
        if (unseenOnly && seenTickers.includes(company.ticker)) return false;
        if (filters.sector !== "Todos" && company.sector !== filters.sector) return false;
        if (filters.tags !== "Todos" && !company.tags.includes(filters.tags)) return false;
        if (filters.pillar !== "Todos" && company.attentionPillar !== filters.pillar) return false;
        if (listSeverityFilter !== "Todos" && companyStatus !== listSeverityFilter) return false;
        if (listSourceFilter !== "Todas" && companySource !== listSourceFilter) return false;
        return true;
      })
      .sort((a, b) => {
        const statusWeight = { Risco: 0, Atenção: 1, Saudável: 2 } as const;
        const statusA = getStatusFromScores(a.scores);
        const statusB = getStatusFromScores(b.scores);
        if (sortBy === "Mudou recentemente") return a.lastChangeDays - b.lastChangeDays;
        if (sortBy === "Atenção primeiro") return statusWeight[statusA] - statusWeight[statusB];
        if (sortBy === "Melhor qualidade (score geral)") {
          const scoreA = a.scores.reduce((sum, value) => sum + value, 0);
          const scoreB = b.scores.reduce((sum, value) => sum + value, 0);
          return scoreB - scoreA;
        }
        return 0;
      });
  }, [filters, listSearch, listSeverityFilter, listSourceFilter, seenTickers, sortBy, unseenOnly]);

  const activeListFiltersCount = useMemo(() => {
    let count = 0;
    if (filters.sector !== "Todos") count += 1;
    if (filters.tags !== "Todos") count += 1;
    if (filters.pillar !== "Todos") count += 1;
    if (listSeverityFilter !== "Todos") count += 1;
    if (listSourceFilter !== "Todas") count += 1;
    return count;
  }, [filters, listSeverityFilter, listSourceFilter]);

  const summaryAttentionCount = watchlistCompanies.filter((company) => {
    const status = getStatusFromScores(company.scores);
    return status === "Risco" || status === "Atenção";
  }).length;
  const summaryRiskCount = watchlistCompanies.filter((company) => getStatusFromScores(company.scores) === "Risco").length;
  const summaryHealthyCount = watchlistCompanies.filter((company) => getStatusFromScores(company.scores) === "Saudável").length;
  const summaryChanges30dCount = watchlistCompanies.filter((company) => company.lastChangeDays <= 30).length;
  const alertsToShow = showAlertActionOnly ? alerts.filter((alert) => alert.severity !== "Saudável") : alerts;
  const watchlistExecutiveSummary =
    summaryAttentionCount > summaryHealthyCount
      ? "Hoje sua watchlist concentra mais sinais de atenção do que de estabilidade."
      : "Hoje sua watchlist está mais estável, com menos sinais críticos na triagem.";

  const pillarToSlug = (pillar: Pillar) => {
    if (pillar === "Dívida") return "divida";
    if (pillar === "Caixa") return "caixa";
    if (pillar === "Margens") return "margens";
    if (pillar === "Retorno") return "retorno";
    return "proventos";
  };

  const buildCompanyDeepLink = (ticker: string, pillar: Pillar, evidenceId?: string) => {
    const params = new URLSearchParams({ pilar: pillarToSlug(pillar) });
    if (evidenceId) params.set("evidencia", evidenceId);
    return `/empresa/${ticker}?${params.toString()}`;
  };

  const defaultEvidenceByPillar: Record<Pillar, string> = {
    Dívida: "divida-1",
    Caixa: "caixa-1",
    Margens: "margens-1",
    Retorno: "retorno-1",
    Proventos: "proventos-1",
  };

  const getWhyItMatters = (company: WatchlistCompany) => {
    const minScore = Math.min(...company.scores);
    const minIndex = company.scores.findIndex((score) => score === minScore);
    const pillar = pillars[minIndex];
    if (minScore < 50) return `${pillar} em risco pode pressionar o plano da empresa no curto prazo.`;
    if (minScore < 70) return `${pillar} pede monitoramento para evitar piora dos próximos trimestres.`;
    return "Sem sinais críticos no momento; mantenha o acompanhamento periódico.";
  };

  const togglePillar = (pillar: Pillar) => {
    setActivePillars((prev) =>
      prev.includes(pillar) ? prev.filter((item) => item !== pillar) : [...prev, pillar]
    );
  };

  const applySummaryAttentionFilter = () => {
    setActiveTab("list");
    setListSeverityFilter("Atenção");
  };

  const applySummaryRiskFilter = () => {
    setActiveTab("list");
    setListSeverityFilter("Risco");
  };

  const applySummaryChangesWindow = () => {
    setActiveTab("updates");
    setActiveRange("30d");
  };

  const toggleSeenTicker = (ticker: string) => {
    setSeenTickers((prev) => (prev.includes(ticker) ? prev.filter((item) => item !== ticker) : [...prev, ticker]));
  };

  const getFeedCTA = (item: FeedItem) => (item.source === "CVM" ? "Ver evidência" : "Ver análise");

  return (
    <div className="min-h-screen bg-neutral-50">
      <Sidebar currentPage="watchlist" />

      <header className="fixed top-0 left-[88px] right-0 h-16 bg-white border-b border-neutral-200 z-10">
        <div className="h-full px-8 flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm">
            <span className="font-medium text-neutral-900">Watchlist</span>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative hidden lg:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
              <input
                type="text"
                placeholder="Buscar empresa ou ticker..."
                className="w-80 pl-10 pr-4 py-2 bg-neutral-50/70 border border-neutral-100 rounded-xl text-sm text-neutral-800 placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-mint-200 focus:border-transparent transition-all"
              />
            </div>

            <button className="px-4 py-2 rounded-xl border border-neutral-200 bg-white text-neutral-700 text-sm font-medium hover:bg-neutral-50">
              <Plus className="w-4 h-4 inline-block mr-2" />
              Adicionar empresa
            </button>
            <button className="px-4 py-2 rounded-xl border border-neutral-200 text-sm text-neutral-600 hover:bg-neutral-50">
              <GitCompare className="w-4 h-4 inline-block mr-2" />
              Comparar
            </button>

            <button
              title="Notificações"
              aria-label="Notificações"
              className="relative w-9 h-9 flex items-center justify-center rounded-lg hover:bg-neutral-50 transition-colors"
            >
              <Bell className="w-5 h-5 text-neutral-600" />
            </button>

            <button
              title="Configurações"
              aria-label="Configurações"
              className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-neutral-50 transition-colors"
            >
              <Settings className="w-5 h-5 text-neutral-600" />
            </button>
          </div>
        </div>
      </header>

      <main className="ml-[88px] pt-16">
        <div className="px-8 py-6">
          <div className="flex flex-col gap-0.5">
            <h1 className="text-2xl font-semibold text-neutral-900">Watchlist</h1>
            <p className="text-sm text-neutral-500">
              {activeTab === "updates"
                ? "Triagem primeiro, organização depois. Foque no que mudou."
                : "Organize sua watchlist e acompanhe o estado atual de cada empresa."}
            </p>
          </div>

          <div className="mt-4 grid grid-cols-1 lg:grid-cols-12 gap-6">
            <section className="lg:col-span-9 space-y-3">
              <div className="flex items-center gap-2">
                {[
                  { key: "updates", label: "Atualizações" },
                  { key: "list", label: "Lista" },
                ].map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key as "updates" | "list")}
                    className={`px-4 py-2 rounded-xl text-sm font-medium border transition-colors ${
                      activeTab === tab.key
                        ? "border-mint-200 bg-mint-50 text-mint-700"
                        : "border-neutral-200 text-neutral-600 hover:bg-neutral-50"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {uiState === "empty" ? (
                <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm p-8">
                  <h2 className="text-lg font-semibold text-neutral-900">Comece pela sua primeira watchlist</h2>
                  <p className="text-sm text-neutral-500 mt-2">
                    Escolha 3 empresas para acompanhar mudanças sem ruído.
                  </p>
                  <div className="mt-6 flex flex-col sm:flex-row gap-3">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                      <input
                        type="text"
                        placeholder="Buscar empresa ou ticker..."
                        className="w-full pl-10 pr-3 py-2 rounded-xl border border-neutral-200 text-sm text-neutral-700 focus:outline-none focus:ring-2 focus:ring-mint-100"
                      />
                    </div>
                    <Link
                      to="/explorar"
                      className="px-4 py-2 rounded-xl bg-mint-500 text-white text-sm font-medium text-center"
                    >
                      Explorar mercado
                    </Link>
                  </div>
                  <div className="mt-6 flex flex-wrap gap-2">
                    {suggestedCompanies.map((ticker) => (
                      <button
                        key={ticker}
                        className="px-3 py-2 rounded-xl border border-neutral-200 text-xs text-neutral-600 hover:bg-neutral-50"
                      >
                        {ticker}
                      </button>
                    ))}
                  </div>
                </div>
              ) : uiState === "loading" ? (
                <div className="space-y-4">
                  <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm p-5 space-y-3">
                    <div className="h-4 w-32 bg-neutral-100 rounded" />
                    <div className="h-3 w-full bg-neutral-100 rounded" />
                    <div className="h-3 w-3/4 bg-neutral-100 rounded" />
                  </div>
                  <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm p-5 space-y-3">
                    <div className="h-4 w-40 bg-neutral-100 rounded" />
                    <div className="h-3 w-full bg-neutral-100 rounded" />
                    <div className="h-3 w-2/3 bg-neutral-100 rounded" />
                  </div>
                  <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm p-5">
                    <div className="h-10 w-full bg-neutral-100 rounded" />
                  </div>
                </div>
              ) : activeTab === "updates" ? (
                <div className="space-y-5">
                  <section className="rounded-2xl border border-mint-200 bg-mint-50/60 p-3.5">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-[11px] font-semibold uppercase tracking-wide text-mint-800">Estado da watchlist hoje</p>
                        <p className="mt-1 text-sm font-semibold text-neutral-900">{watchlistExecutiveSummary}</p>
                        <p className="mt-1 text-xs text-neutral-700">
                          {summaryRiskCount} em risco, {summaryAttentionCount - summaryRiskCount} em atenção e {summaryHealthyCount} saudáveis.
                        </p>
                      </div>
                      <span className="rounded-full border border-mint-300 bg-white px-2 py-1 text-[11px] font-medium text-mint-800">
                        {summaryChanges30dCount} mudanças em 30d
                      </span>
                    </div>
                  </section>

                  <section className="bg-white rounded-2xl border border-neutral-200 shadow-sm p-5">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h2 className="text-base font-semibold text-neutral-900">Prioridade</h2>
                        <p className="text-xs text-neutral-500">
                          Ordenado pelo que mais merece sua atenção agora: severidade, recência e impacto potencial.
                        </p>
                      </div>
                      <span className="text-xs text-neutral-400">{Math.min(priorityItems.length, 3)} itens</span>
                    </div>

                    <div className="space-y-2">
                      {priorityItems.slice(0, 3).map((item, index) => (
                        <div
                          key={item.id}
                          role="button"
                          tabIndex={0}
                          onClick={() => navigate(buildCompanyDeepLink(item.ticker, item.pillar))}
                          onKeyDown={(event) => {
                            if (event.key === "Enter" || event.key === " ") {
                              event.preventDefault();
                              navigate(buildCompanyDeepLink(item.ticker, item.pillar));
                            }
                          }}
                          className={`rounded-xl border border-neutral-200 border-l-4 bg-neutral-50 p-3 flex flex-col gap-2 cursor-pointer transition-colors ${clickableItemStyles[item.badge]} ${
                            index === 0 ? "border-mint-200 bg-white shadow-[0_6px_16px_rgba(16,185,129,0.08)]" : ""
                          }`}
                        >
                          {index === 0 && (
                            <div className="mb-1 flex items-center justify-between rounded-lg border border-mint-200 bg-mint-50 px-2 py-1 text-[11px] text-mint-800">
                              <span className="font-semibold">Comece por aqui</span>
                              <span className="rounded-full border border-mint-300 bg-white px-2 py-0.5 font-semibold">Prioridade 1</span>
                            </div>
                          )}
                          <div className="flex items-center justify-between gap-3">
                            <div>
                              <p className="text-sm font-semibold text-neutral-900">
                                {item.company} <span className="text-neutral-400">({item.ticker})</span>
                              </p>
                              <p className="text-xs text-neutral-500">{item.sector}</p>
                              <p className="mt-1 text-[11px] font-medium text-neutral-700">{priorityRankingLabels[index]}</p>
                            </div>
                            <span
                              className={`px-2 py-1 rounded-full border text-[11px] font-medium ${badgeStyles[item.badge]}`}
                            >
                              {item.badge}
                            </span>
                          </div>
                          <div className="grid gap-1">
                            <div>
                              <p className="text-[11px] text-neutral-600">O que mudou</p>
                              <p className="text-sm text-neutral-900">{item.change}</p>
                            </div>
                            <p className="text-xs text-neutral-700">
                              <span className="font-medium">Por que importa:</span> {item.why}
                            </p>
                          </div>
                          <div className="flex items-center justify-between gap-3 text-[11px] text-neutral-600">
                            <span>{item.evidence}</span>
                            <Link
                              to={buildCompanyDeepLink(item.ticker, item.pillar, item.evidenceId)}
                              onClick={(event) => event.stopPropagation()}
                              className="inline-flex items-center rounded-md border border-mint-200 bg-mint-50 px-2 py-1 text-xs font-medium text-mint-700 hover:text-neutral-900"
                            >
                              {getFeedCTA(item)}
                            </Link>
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>

                  <section className="bg-white rounded-2xl border border-neutral-200 shadow-sm p-5">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h2 className="text-base font-semibold text-neutral-900">Atualizações</h2>
                        <p className="text-xs text-neutral-500">Feed contínuo com foco no que pede ação agora.</p>
                      </div>
                      <span className="text-xs text-neutral-400">{filteredFeedItems.length} atualizações</span>
                    </div>

                    <div className="sticky top-20 z-0 bg-white">
                      <div className="flex flex-wrap items-center gap-2 pb-3">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[11px] font-medium text-neutral-500">Período:</span>
                          {rangeOptions.map((range) => (
                            <button
                              key={range}
                              onClick={() => setActiveRange(range)}
                              className={`px-3 py-2 rounded-xl text-xs font-medium border ${
                                activeRange === range
                                  ? "border-mint-200 bg-mint-50 text-mint-700"
                                  : "border-neutral-200 text-neutral-600"
                              }`}
                            >
                              {range === "Todos" ? "Todos" : range}
                            </button>
                          ))}
                        </div>

                        <div className="flex items-center gap-1.5">
                          <span className="text-[11px] font-medium text-neutral-500">Severidade:</span>
                          {(["Risco", "Atenção", "Saudável"] as const).map((option) => (
                            <button
                              key={option}
                              onClick={() => setSeverityFilter(option)}
                              className={`px-3 py-2 rounded-xl text-xs font-medium border ${
                                severityFilter === option
                                  ? "border-mint-200 bg-mint-50 text-mint-700"
                                  : "border-neutral-200 text-neutral-600"
                              }`}
                            >
                              {option}
                            </button>
                          ))}
                          <button
                            onClick={() => setSeverityFilter("Todos")}
                            className={`px-3 py-2 rounded-xl text-xs font-medium border ${
                              severityFilter === "Todos"
                                ? "border-mint-200 bg-mint-50 text-mint-700"
                                : "border-neutral-200 text-neutral-600"
                            }`}
                          >
                            Todas
                          </button>
                        </div>
                        <button
                          onClick={() => setShowAdvancedFeedFilters((prev) => !prev)}
                          className={`px-3 py-2 rounded-xl text-xs font-medium border ${
                            showAdvancedFeedFilters
                              ? "border-mint-200 bg-mint-50 text-mint-700"
                              : "border-neutral-200 text-neutral-600"
                          }`}
                        >
                          Filtros avançados: {showAdvancedFeedFilters ? "ON" : "OFF"}
                        </button>
                      </div>

                      <div className="border-y border-neutral-200 py-2 text-xs text-neutral-600">
                        {filteredFeedItems.length} atualizações · Fonte: {sourceFilter.toLowerCase()}
                      </div>

                      {showAdvancedFeedFilters && (
                        <div className="mt-2 rounded-xl border border-neutral-200 bg-neutral-50 p-2.5">
                          <div className="flex flex-col gap-2">
                          <div className="flex items-center gap-2">
                            <span className="text-[11px] font-medium text-neutral-500">Fonte:</span>
                            {(["Todas", "CVM", "B3", "RI"] as const).map((option) => (
                              <button
                                key={option}
                                onClick={() => setSourceFilter(option)}
                                className={`px-3 py-2 rounded-xl text-xs font-medium border ${
                                  sourceFilter === option
                                    ? "border-mint-200 bg-mint-50 text-mint-700"
                                    : "border-neutral-200 text-neutral-600"
                                }`}
                              >
                                {option}
                              </button>
                            ))}
                          </div>

                          <div className="flex flex-wrap gap-2">
                            <span className="self-center text-[11px] font-medium text-neutral-500">Pilar:</span>
                            {pillars.map((pillar) => (
                              <button
                                key={pillar}
                                onClick={() => togglePillar(pillar)}
                                className={`px-3 py-2 rounded-xl text-xs font-medium border ${
                                  activePillars.includes(pillar)
                                    ? "border-mint-200 bg-mint-50 text-mint-700"
                                    : "border-neutral-200 text-neutral-600 hover:bg-neutral-50"
                                }`}
                              >
                                {pillar}
                              </button>
                            ))}
                          </div>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="mt-4 space-y-3">
                      {filteredFeedItems.map((item) => (
                        <div
                          key={item.id}
                          role="button"
                          tabIndex={0}
                          onClick={() => navigate(buildCompanyDeepLink(item.ticker, item.pillar))}
                          onKeyDown={(event) => {
                            if (event.key === "Enter" || event.key === " ") {
                              event.preventDefault();
                              navigate(buildCompanyDeepLink(item.ticker, item.pillar));
                            }
                          }}
                          className={`rounded-xl border border-neutral-200 border-l-4 bg-neutral-50 cursor-pointer transition-colors ${clickableItemStyles[item.severity]} ${
                            item.severity === "Risco"
                              ? "p-3 space-y-2"
                              : item.severity === "Atenção"
                                ? "p-2.5 space-y-1.5"
                                : "p-2 space-y-1"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <h3 className="text-sm font-semibold text-neutral-950">{item.headline}</h3>
                            <div className="flex items-center gap-2">
                              <span
                                className={`px-2 py-1 rounded-full border text-[11px] font-medium ${badgeStyles[item.severity]}`}
                              >
                                {item.severity}
                              </span>
                              <span
                                className={`px-2 py-1 rounded-full border text-[11px] font-medium ${pillarTagStyles[item.pillar]}`}
                              >
                                {item.pillar}
                              </span>
                            </div>
                          </div>
                          <div className="text-sm text-neutral-800">
                            <GlossaryText text={item.detail} />
                            {item.severity !== "Saudável" && (
                              <p className="mt-1 text-neutral-700">
                                <GlossaryText text={item.detailTwo} />
                              </p>
                            )}
                          </div>
                          <div className="flex items-center justify-between text-[11px] text-neutral-600">
                            <span>{item.evidence}</span>
                            <Link
                              to={buildCompanyDeepLink(item.ticker, item.pillar, item.evidenceId)}
                              onClick={(event) => event.stopPropagation()}
                              className="inline-flex items-center rounded-md border border-mint-200 bg-mint-50 px-2 py-1 text-xs font-medium text-mint-700 hover:text-neutral-900"
                            >
                              Ver análise
                            </Link>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="mt-4 rounded-xl border border-neutral-200 bg-neutral-50 p-3">
                      <p className="text-xs font-medium text-neutral-900">Fechamento da sessão</p>
                      <p className="mt-1 text-xs text-neutral-700">
                        Nas próximas horas, acompanhe CSAN3 e MRVE3 para confirmar se a pressão em dívida e margens persiste.
                      </p>
                    </div>
                  </section>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm p-4">
                    <div className="flex flex-col lg:flex-row lg:items-center gap-3">
                      <div className="relative flex-[1.8]">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                        <input
                          type="text"
                          placeholder="Buscar empresa ou ticker..."
                          value={listSearch}
                          onChange={(event) => setListSearch(event.target.value)}
                          className="w-full pl-10 pr-3 py-2 rounded-xl border border-neutral-200 text-sm text-neutral-700 focus:outline-none focus:ring-2 focus:ring-mint-100"
                        />
                      </div>
                      <div className="relative flex-1">
                        <select
                          value={sortBy}
                          onChange={(event) => setSortBy(event.target.value)}
                          className="w-full px-3 py-2 rounded-xl border border-neutral-200 text-xs text-neutral-600 bg-white focus:outline-none focus:ring-2 focus:ring-mint-100"
                        >
                          {[
                            "Mudou recentemente",
                            "Atenção primeiro",
                            "Melhor qualidade (score geral)",
                              ].map((option) => (
                                <option key={option} value={option}>
                                  Ordenar: {option}
                            </option>
                          ))}
                        </select>
                        <ChevronDown className="w-3.5 h-3.5 text-neutral-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                      </div>
                      <div className="flex items-center gap-2 flex-wrap">
                        {(["Compacto", "Detalhado"] as const).map((mode) => (
                          <button
                            key={mode}
                            onClick={() => setListDensity(mode)}
                            className={`px-3 py-2 rounded-xl text-xs font-medium border ${
                              listDensity === mode
                                ? "border-mint-200 bg-mint-50 text-mint-700"
                                : "border-neutral-200 bg-white text-neutral-600"
                            }`}
                          >
                            {mode}
                          </button>
                        ))}
                        <button
                          onClick={() => setShowListFilters((prev) => !prev)}
                          className={`px-3 py-2 rounded-xl text-xs font-medium border ${
                            showListFilters
                              ? "border-neutral-300 bg-neutral-100 text-neutral-700"
                              : "border-neutral-200 bg-white text-neutral-600"
                          }`}
                        >
                          Filtros ({activeListFiltersCount})
                        </button>
                        <button
                          onClick={() => setUnseenOnly((prev) => !prev)}
                          className={`px-3 py-2 rounded-xl text-xs font-medium border ${
                            unseenOnly
                              ? "border-neutral-300 bg-neutral-100 text-neutral-700"
                              : "border-neutral-200 bg-white text-neutral-600"
                          }`}
                        >
                          Não vistos
                        </button>
                      </div>
                    </div>

                    {showListFilters && (
                      <div className="mt-3 grid grid-cols-1 gap-2 md:grid-cols-2 xl:grid-cols-3">
                        {[
                          {
                            label: "Setor",
                            key: "sector",
                            options: ["Todos", "Bancos", "Energia", "Indústria", "Saúde", "Consumo", "Construção", "Varejo"],
                          },
                          {
                            label: "Tags",
                            key: "tags",
                            options: ["Todos", "Qualidade", "Defensiva", "Dividendos", "Risco", "Cíclica", "Renda", "Atenção"],
                          },
                          {
                            label: "Pilar em atenção",
                            key: "pillar",
                            options: ["Todos", ...pillars],
                          },
                        ].map((filter) => (
                          <div key={filter.key} className="relative">
                            <select
                              value={filters[filter.key as keyof typeof filters]}
                              onChange={(event) =>
                                setFilters((prev) => ({ ...prev, [filter.key]: event.target.value }))
                              }
                              className="w-full px-3 py-2 rounded-xl border border-neutral-200 text-xs text-neutral-700 bg-white focus:outline-none focus:ring-2 focus:ring-mint-100"
                            >
                              {filter.options.map((option) => (
                                <option key={option} value={option}>
                                  {filter.label}: {option}
                                </option>
                              ))}
                            </select>
                            <ChevronDown className="w-3.5 h-3.5 text-neutral-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                          </div>
                        ))}
                        <div className="relative">
                          <select
                            value={listSeverityFilter}
                            onChange={(event) => setListSeverityFilter(event.target.value as typeof listSeverityFilter)}
                            className="w-full px-3 py-2 rounded-xl border border-neutral-200 text-xs text-neutral-700 bg-white focus:outline-none focus:ring-2 focus:ring-mint-100"
                          >
                            {["Todos", "Risco", "Atenção", "Saudável"].map((option) => (
                              <option key={option} value={option}>
                                Severidade: {option}
                              </option>
                            ))}
                          </select>
                          <ChevronDown className="w-3.5 h-3.5 text-neutral-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                        </div>
                        <div className="relative">
                          <select
                            value={listSourceFilter}
                            onChange={(event) => setListSourceFilter(event.target.value as typeof listSourceFilter)}
                            className="w-full px-3 py-2 rounded-xl border border-neutral-200 text-xs text-neutral-700 bg-white focus:outline-none focus:ring-2 focus:ring-mint-100"
                          >
                            {["Todas", "CVM", "B3", "RI"].map((option) => (
                              <option key={option} value={option}>
                                Fonte: {option}
                              </option>
                            ))}
                          </select>
                          <ChevronDown className="w-3.5 h-3.5 text-neutral-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="space-y-3">
                    {filteredCompanies.map((company) => {
                      const isExpanded = expandedTicker === company.ticker;
                      const showDetails = listDensity === "Detalhado" || isExpanded;
                      const isCompactCard = listDensity === "Compacto" && !isExpanded;
                      const scoreTotal = Math.round(
                        company.scores.reduce((sum, value) => sum + value, 0) / company.scores.length
                      );
                      const status = getStatusFromScores(company.scores);
                      const minScore = Math.min(...company.scores);
                      const minIndex = company.scores.findIndex((score) => score === minScore);
                      const keyPillar = pillars[minIndex];
                      const freshnessBadge =
                        company.freshness === "Atual"
                          ? "Atualizado"
                          : company.freshness === "Falha"
                            ? "Dados pendentes"
                            : "Sem dados";
                      const whyItMatters = getWhyItMatters(company);
                      return (
                        <div
                          key={company.ticker}
                          role="button"
                          tabIndex={0}
                          onClick={() => navigate(buildCompanyDeepLink(company.ticker, company.attentionPillar))}
                          onKeyDown={(event) => {
                            if (event.key === "Enter" || event.key === " ") {
                              event.preventDefault();
                              navigate(buildCompanyDeepLink(company.ticker, company.attentionPillar));
                            }
                          }}
                          className={`bg-white rounded-2xl border border-neutral-200 border-l-4 shadow-sm cursor-pointer transition-colors ${clickableItemStyles[status]} ${
                            isCompactCard ? "p-2.5" : "p-3.5"
                          }`}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0 flex-1">
                              <div className="flex items-start gap-3">
                                <div className="h-9 w-9 rounded-full border border-neutral-200 bg-neutral-50 text-xs font-semibold text-neutral-600 flex items-center justify-center">
                                  {company.ticker.slice(0, 2)}
                                </div>
                                <div className="min-w-0">
                                  <p className="text-sm font-semibold text-neutral-900 truncate">
                                    {company.name} <span className="text-neutral-400">({company.ticker})</span>
                                  </p>
                                  <p className="text-xs text-neutral-500">{company.sector}</p>
                                  <div className="mt-1.5 flex items-center gap-2">
                                    <span className={`px-2 py-1 rounded-full border text-[11px] font-medium ${badgeStyles[status]}`}>
                                      {status}
                                    </span>
                                  </div>
                                  <p className="mt-1 text-sm font-medium text-neutral-900">
                                    {minScore >= 70 ? "Sem pilar crítico no momento" : `${keyPillar} em atenção`}{" "}
                                    <span className="text-neutral-500">({minScore}/100)</span>
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="mt-2.5 flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              {!isCompactCard && <p className="text-xs text-neutral-600">{whyItMatters}</p>}
                              <p className="mt-1 text-[11px] text-neutral-500">
                                Fonte: {sourceByTicker[company.ticker] ?? "CVM"} • Última mudança: {company.lastChangeDays}d
                                <span
                                  className={`ml-2 inline-flex px-1.5 py-0.5 rounded-full border text-[10px] font-medium align-middle ${freshnessBadgeStyles[freshnessBadge]}`}
                                >
                                  {freshnessBadge}
                                </span>
                              </p>
                            </div>
                            <div className="relative flex items-center gap-1.5 flex-wrap justify-end">
                              <button
                                onClick={(event) => {
                                  event.stopPropagation();
                                  navigate(buildCompanyDeepLink(company.ticker, company.attentionPillar));
                                }}
                                className="inline-flex items-center rounded-lg bg-mint-500 px-2.5 py-1.5 text-xs font-medium text-white hover:bg-mint-600 whitespace-nowrap"
                              >
                                Ver detalhes
                              </button>
                              {!isCompactCard && (
                                <Link
                                  to={buildCompanyDeepLink(company.ticker, company.attentionPillar, defaultEvidenceByPillar[company.attentionPillar])}
                                  onClick={(event) => event.stopPropagation()}
                                  className="inline-flex items-center rounded-md border border-mint-200 bg-mint-50 px-2 py-1 text-xs font-medium text-mint-700 hover:text-neutral-900 whitespace-nowrap"
                                >
                                  Ver evidência
                                </Link>
                              )}
                              <button
                                title={seenTickers.includes(company.ticker) ? "Marcar como não visto" : "Marcar visto"}
                                onClick={(event) => {
                                  event.stopPropagation();
                                  toggleSeenTicker(company.ticker);
                                }}
                                className={`inline-flex items-center gap-1 rounded-md border px-2 py-1 text-xs whitespace-nowrap ${
                                  seenTickers.includes(company.ticker)
                                    ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                                    : "border-neutral-200 bg-neutral-50 text-neutral-500 hover:text-neutral-800"
                                }`}
                              >
                                <CheckCircle2 className="h-3.5 w-3.5" />
                                {seenTickers.includes(company.ticker) ? "Visto" : isCompactCard ? "Marcar" : "Marcar visto"}
                              </button>
                              <button
                                title="Mais ações"
                                aria-label="Mais ações"
                                onClick={(event) => {
                                  event.stopPropagation();
                                  setQuickActionsTicker((prev) => (prev === company.ticker ? null : company.ticker));
                                }}
                                className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-neutral-200 bg-neutral-50 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-600"
                              >
                                <MoreHorizontal className="h-3.5 w-3.5" />
                              </button>
                              {quickActionsTicker === company.ticker && (
                                <div
                                  onClick={(event) => event.stopPropagation()}
                                  className="absolute right-0 top-8 z-10 w-44 rounded-lg border border-neutral-200 bg-white p-1.5 shadow-lg"
                                >
                                  <button
                                    title="Favoritar"
                                    onClick={() => {
                                      setQuickActionsTicker(null);
                                    }}
                                    className="w-full rounded-md px-2 py-1.5 text-left text-xs text-neutral-700 hover:bg-neutral-50"
                                  >
                                    Favoritar
                                  </button>
                                  <button
                                    title="Criar alerta"
                                    onClick={() => {
                                      setQuickActionsTicker(null);
                                    }}
                                    className="w-full rounded-md px-2 py-1.5 text-left text-xs text-neutral-700 hover:bg-neutral-50"
                                  >
                                    Criar alerta
                                  </button>
                                  <button
                                    title={isExpanded ? "Recolher detalhes" : "Expandir detalhes"}
                                    onClick={() => {
                                      setQuickActionsTicker(null);
                                      setExpandedTicker((prev) => (prev === company.ticker ? null : company.ticker));
                                    }}
                                    className="w-full rounded-md px-2 py-1.5 text-left text-xs text-neutral-700 hover:bg-neutral-50"
                                  >
                                    {isExpanded ? "Recolher detalhes" : "Expandir detalhes"}
                                  </button>
                                  <button
                                    title="Marcar visto"
                                    onClick={() => {
                                      setQuickActionsTicker(null);
                                      toggleSeenTicker(company.ticker);
                                    }}
                                    className="w-full rounded-md px-2 py-1.5 text-left text-xs text-neutral-700 hover:bg-neutral-50"
                                  >
                                    {seenTickers.includes(company.ticker) ? "Marcar como não visto" : "Marcar visto"}
                                  </button>
                                  <button
                                    title="Remover da watchlist"
                                    onClick={() => setQuickActionsTicker(null)}
                                    className="w-full rounded-md px-2 py-1.5 text-left text-xs text-rose-600 hover:bg-rose-50"
                                  >
                                    Remover da watchlist
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>

                          {showDetails && (
                            <div className="mt-4 rounded-xl border border-neutral-200 bg-neutral-50 p-3 space-y-3">
                              <div className="flex items-center justify-between text-xs text-neutral-500">
                                <span>Diagnóstico por pilar</span>
                                <span>Score geral: {scoreTotal}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                {company.scores.map((score, index) => (
                                  <div key={`${company.ticker}-${pillars[index]}`} className="flex-1">
                                    <div
                                      className={`h-2 rounded-full ${
                                        score >= 70 ? "bg-emerald-400" : score >= 50 ? "bg-amber-400" : "bg-rose-400"
                                      }`}
                                    />
                                    <div className="mt-1 text-[10px] text-neutral-500 flex items-center justify-between">
                                      <span>{pillars[index]}</span>
                                      <span>{score}</span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-neutral-600">
                                <div className="flex items-center justify-between rounded-lg border border-neutral-200 bg-white px-2 py-1.5">
                                  <span>Última mudança</span>
                                  <span>{company.lastChangeDays} dias</span>
                                </div>
                                {company.volatility && (
                                  <div className="flex items-center justify-between rounded-lg border border-neutral-200 bg-white px-2 py-1.5 sm:col-span-2">
                                    <span>Volatilidade</span>
                                    <span>{company.volatility}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </section>

            <aside className="lg:col-span-3 space-y-3">
              <div className="lg:sticky lg:top-20 space-y-4">
              <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-3">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xs font-semibold uppercase tracking-wide text-neutral-600">Panorama rápido</h3>
                  <span className="text-[11px] text-neutral-400">Hoje</span>
                </div>
                <p className="text-[11px] text-neutral-700">
                  Hoje a watchlist segue mais carregada em atenção do que em estabilidade.
                </p>
                <div className="mt-1.5 grid grid-cols-3 gap-1 text-[11px] text-neutral-600">
                  <button
                    onClick={applySummaryAttentionFilter}
                    className="rounded-md border border-neutral-200 bg-white p-1 text-center hover:bg-neutral-100 transition-colors"
                  >
                    <p className="text-sm font-semibold text-neutral-900">{summaryAttentionCount}</p>
                    <p>em atenção</p>
                  </button>
                  <button
                    onClick={applySummaryRiskFilter}
                    className="rounded-md border border-neutral-200 bg-white p-1 text-center hover:bg-neutral-100 transition-colors"
                  >
                    <p className="text-sm font-semibold text-neutral-900">{summaryRiskCount}</p>
                    <p>em risco</p>
                  </button>
                  <button
                    onClick={applySummaryChangesWindow}
                    className="rounded-md border border-neutral-200 bg-white p-1 text-center hover:bg-neutral-100 transition-colors"
                  >
                    <p className="text-sm font-semibold text-neutral-900">{summaryChanges30dCount}</p>
                    <p>mudanças 30d</p>
                  </button>
                </div>
              </div>

              <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-3.5">
                <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-semibold text-neutral-900">Alertas</h3>
                  <button
                    onClick={() => setShowAlertActionOnly((prev) => !prev)}
                  className={`text-xs px-2 py-1 rounded-full border ${
                    showAlertActionOnly
                      ? "border-mint-200 bg-mint-50 text-mint-700"
                      : "border-neutral-200 text-neutral-600"
                  }`}
                >
                    {showAlertActionOnly ? "Filtro ativo · Ação agora" : "Mostrando todos"}
                  </button>
                </div>
                <div className="space-y-2">
                  {alertsToShow.map((alert) => (
                    <div key={alert.id} className={`rounded-xl border p-3 ${alert.severity === "Risco" ? "border-rose-200 bg-rose-50/40" : "border-neutral-200 bg-neutral-50"}`}>
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-semibold text-neutral-900">{alert.title}</p>
                        <span className={`px-2 py-0.5 rounded-full border text-[10px] ${alertStyles[alert.severity]}`}>
                          {alert.severity}
                        </span>
                      </div>
                      <p className="text-xs text-neutral-600 mt-1">{alert.summary}</p>
                      <p className="text-[11px] text-neutral-400 mt-2">{alert.time}</p>
                    </div>
                  ))}
                </div>
                <button className="mt-3 w-full px-3 py-2 rounded-xl border border-neutral-200 text-xs text-neutral-600 hover:bg-neutral-50">
                  Configurar alertas
                </button>
              </div>
              </div>
            </aside>
          </div>
        </div>
      </main>

    </div>
  );
}

export default WatchlistPage;

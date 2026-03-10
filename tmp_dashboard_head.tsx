import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Activity,
  Bell,
  Bookmark,
  ChevronDown,
  ChevronRight,
  Compass,
  Database,
  Ellipsis,
  FileText,
  LayoutGrid,
  Menu,
  Moon,
  PanelLeft,
  Search,
  Settings,
  Sun,
  UserCircle2,
} from "lucide-react";

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Sheet, SheetContent, SheetTrigger } from "./ui/sheet";
import { cn } from "./ui/utils";
import { Sidebar } from "./dashboard/sidebar";

import logoItau from "../assets/logos/itau.png";
import logoMrv from "../assets/logos/mrv.jpg";
import logoRenner from "../assets/logos/renner.png";
import logoTaesa from "../assets/logos/taesa.png";
import logoVale from "../assets/logos/vale.png";
import logoWeg from "../assets/logos/weg.jpeg";

type Status = "Saudável" | "Atenção" | "Risco";
type Pillar = "Dívida" | "Caixa" | "Margens" | "Retorno" | "Proventos";
type WindowRange = "24h" | "7d" | "30d";
type InboxSource = "CVM" | "B3" | "RI";
type InboxSort = "Impacto" | "Mais recente";
type InboxEventType = "mudanca" | "evento_futuro";
type InboxMode = "top-impacto" | "tempo-real";

type PillarMovement = {
  pillar: Pillar;
  events: number;
  trendLabel: string;
  trendUp: boolean;
  risk: number;
  attention: number;
  healthy: number;
};

type InboxSeedItem = {
  id: string;
  companyId: string;
  ticker: string;
  companyName: string;
  title: string;
  whyItMatters: string;
  severity: Status;
  pillarKey?: Pillar;
  source?: InboxSource;
  ageMinutes: number;
  impactScore: number;
  eventType: InboxEventType;
};

type InboxItem = Omit<InboxSeedItem, "ageMinutes"> & {
  timestamp: string;
  relativeTime: string;
  ageMinutes: number;
};

type InboxFilters = {
  period: WindowRange;
  severities: Status[];
  pillars: Pillar[];
  sources: InboxSource[];
  sortBy: InboxSort;
};

const INBOX_FILTERS_STORAGE_KEY = "dashboard-inbox-filters:v1";
const INBOX_MODE_STORAGE_KEY = "dashboard-inbox-mode:v1";
const NEW_ITEM_HIGHLIGHT_MS = 10_000;

const allStatuses: Status[] = ["Risco", "Atenção", "Saudável"];
const allPillars: Pillar[] = ["Dívida", "Caixa", "Margens", "Retorno", "Proventos"];
const allSources: InboxSource[] = ["CVM", "B3", "RI"];

const logoByTicker: Record<string, string> = {
  VALE3: logoVale,
  LREN3: logoRenner,
  ITUB4: logoItau,
  MRVE3: logoMrv,
  TAEE11: logoTaesa,
  WEGE3: logoWeg,
};

const statusClasses: Record<Status, string> = {
  Saudável: "border-emerald-300 bg-emerald-100 text-emerald-900",
  Atenção: "border-amber-300 bg-amber-100 text-amber-900",
  Risco: "border-rose-300 bg-rose-100 text-rose-900",
};

const inboxSeed: InboxSeedItem[] = [
  {
    id: "evt-vale-divida-1",
    companyId: "VALE3",
    ticker: "VALE3",
    companyName: "Vale",
    title: "Dívida líquida/EBITDA acima do limite interno",
    whyItMatters: "Aumento da alavancagem pode reduzir flexibilidade financeira.",
    severity: "Risco",
    pillarKey: "Dívida",
    source: "CVM",
    ageMinutes: 3,
    impactScore: 99,
    eventType: "mudanca",
  },
  {
    id: "evt-lren-margens-1",
    companyId: "LREN3",
    ticker: "LREN3",
    companyName: "Lojas Renner",
    title: "Margens pressionadas no trimestre",
    whyItMatters: "Compressão de margem pode limitar revisão positiva de lucro.",
    severity: "Atenção",
    pillarKey: "Margens",
    source: "RI",
    ageMinutes: 11,
    impactScore: 84,
    eventType: "mudanca",
  },
  {
    id: "evt-mrve-caixa-1",
    companyId: "MRVE3",
    ticker: "MRVE3",
    companyName: "MRV Engenharia",
    title: "Queda em caixa livre no período",
    whyItMatters: "Menor geração de caixa aumenta risco de execução no curto prazo.",
    severity: "Atenção",
    pillarKey: "Caixa",
    source: "B3",
    ageMinutes: 17,
    impactScore: 81,
    eventType: "mudanca",
  },
  {
    id: "evt-taee-retorno-1",
    companyId: "TAEE11",
    ticker: "TAEE11",
    companyName: "Taesa",
    title: "Retorno segue resiliente",
    whyItMatters: "Indicadores estáveis sinalizam consistência operacional.",
    severity: "Saudável",
    pillarKey: "Retorno",
    source: "RI",
    ageMinutes: 44,
    impactScore: 58,
    eventType: "mudanca",
  },
  {
    id: "evt-itub-proventos-1",
    companyId: "ITUB4",
    ticker: "ITUB4",
    companyName: "Itaú Unibanco",
    title: "Proventos em trajetória estável",
    whyItMatters: "Consistência em distribuição reforça previsibilidade de retorno.",
    severity: "Saudável",
    pillarKey: "Proventos",
    source: "RI",
    ageMinutes: 130,
    impactScore: 49,
    eventType: "mudanca",
  },
  {
    id: "evt-weg-evento-1",
    companyId: "WEGE3",
    ticker: "WEGE3",
    companyName: "WEG",
    title: "Resultado 4T25 agendado para esta semana",
    whyItMatters: "Evento futuro pode alterar diagnóstico de Margens e Retorno.",
    severity: "Atenção",
    pillarKey: "Margens",
    source: "RI",
    ageMinutes: 260,
    impactScore: 76,
    eventType: "evento_futuro",
  },
  {
    id: "evt-vale-caixa-2",
    companyId: "VALE3",
    ticker: "VALE3",
    companyName: "Vale",
    title: "Geração de caixa abaixo da referência",
    whyItMatters: "Pode elevar dependência de financiamento no curto prazo.",
    severity: "Risco",
    pillarKey: "Caixa",
    source: "CVM",
    ageMinutes: 1220,
    impactScore: 90,
    eventType: "mudanca",
  },
  {
    id: "evt-weg-margens-2",
    companyId: "WEGE3",
    ticker: "WEGE3",
    companyName: "WEG",
    title: "Margem bruta cedeu no trimestre",
    whyItMatters: "Pode reduzir ganho operacional se o mix piorar.",
    severity: "Atenção",
    pillarKey: "Margens",
    source: "CVM",
    ageMinutes: 3160,
    impactScore: 73,
    eventType: "mudanca",
  },
  {
    id: "evt-itub-retorno-2",
    companyId: "ITUB4",
    ticker: "ITUB4",
    companyName: "Itaú Unibanco",
    title: "ROE mantém acima da referência",
    whyItMatters: "Sinaliza eficiência de alocação de capital no ciclo.",
    severity: "Saudável",
    pillarKey: "Retorno",
    source: "B3",
    ageMinutes: 7420,
    impactScore: 52,
    eventType: "mudanca",
  },
];

const pillarMovements: PillarMovement[] = [
  { pillar: "Dívida", events: 12, trendLabel: "up 18%", trendUp: true, risk: 3, attention: 7, healthy: 2 },
  { pillar: "Margens", events: 9, trendLabel: "up 10%", trendUp: true, risk: 2, attention: 6, healthy: 1 },
  { pillar: "Caixa", events: 7, trendLabel: "down 6%", trendUp: false, risk: 1, attention: 2, healthy: 4 },
  { pillar: "Proventos", events: 5, trendLabel: "up 4%", trendUp: true, risk: 0, attention: 2, healthy: 3 },
  { pillar: "Retorno", events: 4, trendLabel: "up 3%", trendUp: true, risk: 0, attention: 1, healthy: 3 },
];

function toggleInArray<T>(arr: T[], value: T) {
  return arr.includes(value) ? arr.filter((entry) => entry !== value) : [...arr, value];
}

function includesAll<T>(selected: T[], all: T[]) {
  if (selected.length === 0) return true;
  return selected.length === all.length && all.every((item) => selected.includes(item));
}

function defaultInboxFilters(): InboxFilters {
  return {
    period: "24h",
    severities: allStatuses,
    pillars: allPillars,
    sources: allSources,
    sortBy: "Impacto",
  };
}

function loadInboxFilters(): InboxFilters {
  const fallback = defaultInboxFilters();
  try {
    const raw = window.localStorage.getItem(INBOX_FILTERS_STORAGE_KEY);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw) as Partial<InboxFilters>;
    return {
      period: parsed.period ?? fallback.period,
      severities: parsed.severities?.length ? parsed.severities : fallback.severities,
      pillars: parsed.pillars?.length ? parsed.pillars : fallback.pillars,
      sources: parsed.sources?.length ? parsed.sources : fallback.sources,
      sortBy: parsed.sortBy ?? fallback.sortBy,
    };
  } catch {
    return fallback;
  }
}

function loadInboxMode(): InboxMode {
  try {
    const raw = window.localStorage.getItem(INBOX_MODE_STORAGE_KEY);
    if (raw === "tempo-real" || raw === "top-impacto") return raw;
  } catch {
    // ignore storage errors
  }
  return loadInboxFilters().sortBy === "Mais recente" ? "tempo-real" : "top-impacto";
}

function getPeriodLimitMinutes(period: WindowRange) {
  if (period === "24h") return 24 * 60;
  if (period === "7d") return 7 * 24 * 60;
  return 30 * 24 * 60;
}

function relativeFromMinutes(minutes: number) {
  if (minutes < 60) return `há ${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `há ${hours} h`;
  const days = Math.floor(hours / 24);
  return `há ${days} d`;
}

function relativeFromTimestamp(timestamp: number) {
  const deltaMs = Date.now() - timestamp;
  const minutes = Math.max(0, Math.floor(deltaMs / 60_000));
  if (minutes < 1) return "há 0 min";
  if (minutes < 60) return `há ${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `há ${hours} h`;
  const days = Math.floor(hours / 24);
  return `há ${days} d`;
}

function pluralize(value: number, singular: string, plural: string) {
  return `${value} ${value === 1 ? singular : plural}`;
}

function toPillarQueryKey(pillar?: Pillar) {
  if (!pillar) return "";
  if (pillar === "Dívida") return "divida";
  if (pillar === "Caixa") return "caixa";
  if (pillar === "Margens") return "margens";
  if (pillar === "Retorno") return "retorno";
  return "proventos";
}

function StatusBadge({ status }: { status: Status }) {
  return (
    <Badge className={cn("inline-flex h-7 min-w-[82px] items-center justify-center rounded-full border px-3 text-xs font-semibold", statusClasses[status])}>
      {status}
    </Badge>
  );
}

function SegmentedHealthBar({ healthy, attention, risk }: { healthy: number; attention: number; risk: number }) {
  const total = Math.max(healthy + attention + risk, 1);
  const healthyW = (healthy / total) * 100;
  const attentionW = (attention / total) * 100;
  const riskW = (risk / total) * 100;

  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-[#F2F4F7]">
      <div className="h-full bg-emerald-500" style={{ width: `${healthyW}%`, float: "left" }} />
      <div className="h-full bg-amber-400" style={{ width: `${attentionW}%`, float: "left" }} />
      <div className="h-full bg-rose-500" style={{ width: `${riskW}%`, float: "left" }} />
    </div>
  );
}

export function Dashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const [inboxError, setInboxError] = useState(false);
  const [inboxFilters, setInboxFilters] = useState<InboxFilters>(() => loadInboxFilters());
  const [inboxMode, setInboxMode] = useState<InboxMode>(() => loadInboxMode());
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [lastRefreshAt, setLastRefreshAt] = useState(() => Date.now());
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshError, setRefreshError] = useState<string | null>(null);
  const [clockTick, setClockTick] = useState(0);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [realtimeItems, setRealtimeItems] = useState<InboxSeedItem[]>([]);
  const [newBadgeUntil, setNewBadgeUntil] = useState<Record<string, number>>({});
  const inboxRef = useRef<HTMLElement | null>(null);
  const refreshSequenceRef = useRef(0);

  const isLoading = false;
  const sourceFailed = false;
  const activeSeverities = inboxFilters.severities.length ? inboxFilters.severities : allStatuses;
  const activePillars = inboxFilters.pillars.length ? inboxFilters.pillars : allPillars;
  const activeSources = inboxFilters.sources.length ? inboxFilters.sources : allSources;
  const hasSeverityFilter = !includesAll(inboxFilters.severities, allStatuses);
  const hasPillarFilter = !includesAll(inboxFilters.pillars, allPillars);
  const hasSourceFilter = !includesAll(inboxFilters.sources, allSources);
  const hasPeriodFilter = inboxFilters.period !== "24h";
  const hasAnyFilterOverride = hasSeverityFilter || hasPillarFilter || hasSourceFilter || hasPeriodFilter;
  const advancedFiltersCount = Number(hasSeverityFilter) + Number(hasPillarFilter) + Number(hasSourceFilter);
  const showFiltersCount = advancedFiltersCount > 0;

  const inboxItems = useMemo<InboxItem[]>(
    () =>
      [...realtimeItems, ...inboxSeed].map((item) => ({
        ...item,
        ageMinutes: item.ageMinutes,
        timestamp: new Date(lastRefreshAt - item.ageMinutes * 60_000).toISOString(),
        relativeTime: relativeFromMinutes(item.ageMinutes),
      })),
    [lastRefreshAt, realtimeItems],
  );

  useEffect(() => {
    try {
      window.localStorage.setItem(INBOX_FILTERS_STORAGE_KEY, JSON.stringify(inboxFilters));
    } catch {
      // ignore storage errors
    }
  }, [inboxFilters]);

  useEffect(() => {
    try {
      window.localStorage.setItem(INBOX_MODE_STORAGE_KEY, inboxMode);
    } catch {
      // ignore storage errors
    }
  }, [inboxMode]);

  useEffect(() => {
    try {
      const savedTheme = window.localStorage.getItem("analiso-theme");
      const shouldUseDark =
        savedTheme === "dark" ||
        (!savedTheme && window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches);
      setIsDarkMode(shouldUseDark);
      document.documentElement.classList.toggle("dark", shouldUseDark);
    } catch {
      // ignore theme storage errors
    }
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDarkMode);
    try {
      window.localStorage.setItem("analiso-theme", isDarkMode ? "dark" : "light");
    } catch {
      // ignore theme storage errors
    }
  }, [isDarkMode]);

  useEffect(() => {
    setInboxFilters((prev) => {
      const expectedSort: InboxSort = inboxMode === "tempo-real" ? "Mais recente" : "Impacto";
      if (prev.sortBy === expectedSort) return prev;
      return { ...prev, sortBy: expectedSort };
    });
  }, [inboxMode]);

  useEffect(() => {
    const timer = window.setInterval(() => setClockTick((prev) => prev + 1), 1_000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    const now = Date.now();
    setNewBadgeUntil((prev) => {
      const next = Object.fromEntries(Object.entries(prev).filter(([, expiresAt]) => expiresAt > now));
      return Object.keys(next).length === Object.keys(prev).length ? prev : next;
    });
  }, [clockTick]);

  useEffect(() => {
    const clearNewBadgesOnInteraction = () => {
      setNewBadgeUntil((prev) => (Object.keys(prev).length ? {} : prev));
    };

    window.addEventListener("scroll", clearNewBadgesOnInteraction, { passive: true });
    window.addEventListener("pointerdown", clearNewBadgesOnInteraction, { passive: true });
    window.addEventListener("keydown", clearNewBadgesOnInteraction);
    window.addEventListener("touchstart", clearNewBadgesOnInteraction, { passive: true });

    return () => {
      window.removeEventListener("scroll", clearNewBadgesOnInteraction);
      window.removeEventListener("pointerdown", clearNewBadgesOnInteraction);
      window.removeEventListener("keydown", clearNewBadgesOnInteraction);
      window.removeEventListener("touchstart", clearNewBadgesOnInteraction);
    };
  }, []);

  const inboxRows = useMemo(() => {
    const limit = getPeriodLimitMinutes(inboxFilters.period);
    return inboxItems
      .filter((item) => item.ageMinutes <= limit)
      .filter((item) => activeSeverities.includes(item.severity))
      .filter((item) => (item.pillarKey ? activePillars.includes(item.pillarKey) : true))
      .filter((item) => (item.source ? activeSources.includes(item.source) : true))
      .sort((a, b) => {
        if (inboxFilters.sortBy === "Impacto") {
          return b.impactScore - a.impactScore;
        }
        return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
      });
  }, [activePillars, activeSeverities, activeSources, inboxFilters, inboxItems]);

  const refreshInboxNow = () => {
    try {
      setIsRefreshing(true);
      const now = Date.now();
      setLastRefreshAt(now);
      if (inboxMode === "tempo-real") {
        const template = inboxSeed[refreshSequenceRef.current % inboxSeed.length];
        refreshSequenceRef.current += 1;
        const realtimeItem: InboxSeedItem = {
          ...template,
          id: `${template.id}-rt-${now}`,
          ageMinutes: 0,
          impactScore: Math.min(100, template.impactScore + 3),
        };
        setRealtimeItems((prev) => [realtimeItem, ...prev].slice(0, 12));
        setNewBadgeUntil((prev) => ({ ...prev, [realtimeItem.id]: now + NEW_ITEM_HIGHLIGHT_MS }));
      }
      setRefreshError(null);
      setInboxError(false);
    } catch {
      setRefreshError("Falha ao atualizar. Tentar novamente.");
      setInboxError(true);
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    if (inboxMode !== "tempo-real") return;
    const timer = window.setInterval(() => {
      if (document.visibilityState !== "visible") return;
      refreshInboxNow();
    }, 30_000);
    return () => window.clearInterval(timer);
  }, [inboxMode]);

  const openInboxItem = (item: InboxItem) => {
    const params = new URLSearchParams();
    if (item.pillarKey) {
      params.set("pilar", toPillarQueryKey(item.pillarKey));
      params.set("expand", toPillarQueryKey(item.pillarKey));
    }

    if (item.eventType === "evento_futuro") {
      params.set("tab", "eventos");
      params.set("foco", "agenda");
    } else if (item.pillarKey) {
      params.set("tab", "pilares");
      params.set("foco", "pilar");
    } else {
      params.set("tab", "mudancas");
      params.set("foco", "mudancas");
    }

    navigate(`/empresa/${item.ticker}?${params.toString()}`);
  };

  const applySinglePillarFilter = (pillar: Pillar) => {
    setInboxFilters((prev) => ({ ...prev, pillars: [pillar] }));
    inboxRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const focusInboxRecentImpact = () => {
    setInboxMode("top-impacto");
    setInboxFilters((prev) => ({ ...prev, period: "24h", sortBy: "Impacto" }));
    inboxRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const setImpactMode = () => {
    setInboxMode("top-impacto");
    setInboxFilters((prev) => ({ ...prev, period: "24h", sortBy: "Impacto" }));
  };

  const setRealTimeMode = () => {
    setInboxMode("tempo-real");
    setInboxFilters((prev) => ({ ...prev, period: "24h", sortBy: "Mais recente" }));
    refreshInboxNow();
  };

  const clearInboxFilters = () => {
    setInboxMode("top-impacto");
    setInboxFilters(defaultInboxFilters());
    setRealtimeItems([]);
    setNewBadgeUntil({});
  };

  const focusedPillar = inboxFilters.pillars.length === 1 ? inboxFilters.pillars[0] : pillarMovements[0].pillar;
  const todayItems = useMemo(() => inboxItems.filter((item) => item.ageMinutes <= 24 * 60), [inboxItems]);
  const priorityItem = inboxRows[0];
  const leadingPillarMovement = [...pillarMovements].sort((a, b) => b.events - a.events)[0];
  const visiblePillarMovements = [...pillarMovements].sort((a, b) => b.events - a.events).slice(0, 4);

  const todayRiskCount = todayItems.filter((item) => item.severity === "Risco").length;
  const todayAttentionCount = todayItems.filter((item) => item.severity === "Atenção").length;
  const todayHealthyCount = todayItems.filter((item) => item.severity === "Saudável").length;

  const topRiskItem = todayItems.filter((item) => item.severity === "Risco").sort((a, b) => b.impactScore - a.impactScore)[0];
  const topImproveItem = todayItems.filter((item) => item.severity === "Saudável").sort((a, b) => b.impactScore - a.impactScore)[0];
  const healthyWatchlistCount = 12;
  const totalWatchlistCount = 20;

  const pillarInsight: Record<Pillar, string> = {
    Dívida: "concentrou mais sinais de pressão hoje",
    Margens: "teve volume alto de mudanças com viés de atenção",
    Caixa: "perdeu força em parte da watchlist",
    Proventos: "seguiu mais estável, com poucos sinais de risco",
    Retorno: "ficou mais estável e com baixa dispersão",
  };

  const feedCtaLabel = (item: InboxItem, isPriority: boolean) => {
    if (isPriority || item.severity === "Risco") return "Ver análise completa";
    return "Entender impacto";
  };

  const supportCards = [
    {
      title: "Maior risco hoje",
      value: topRiskItem ? topRiskItem.ticker : "Sem risco novo",
      logoTicker: topRiskItem ? topRiskItem.ticker : null,
      subtitle: topRiskItem
        ? `${topRiskItem.title}`
        : "Nenhum sinal crítico novo nas últimas 24h",
      delta: topRiskItem
        ? `${pluralize(todayRiskCount, "sinal crítico", "sinais críticos")} nas últimas 24h`
        : "Watchlist sem piora crítica nova hoje",
      ctaLabel: "Ver análise completa",
      action: () => (topRiskItem ? openInboxItem(topRiskItem) : focusInboxRecentImpact()),
      accent: "border-rose-200 bg-rose-50 text-rose-800",
    },
    {
      title: "Maior melhora",
      value: topImproveItem ? topImproveItem.ticker : "Sem melhora nova",
      logoTicker: topImproveItem ? topImproveItem.ticker : null,
      subtitle: topImproveItem
        ? `${topImproveItem.title}`
        : "Sem recuperação relevante registrada hoje",
      delta: `${pluralize(todayHealthyCount, "sinal positivo", "sinais positivos")} relevantes hoje`,
      ctaLabel: "Entender impacto",
      action: () => (topImproveItem ? openInboxItem(topImproveItem) : focusInboxRecentImpact()),
      accent: "border-emerald-200 bg-emerald-50 text-emerald-800",
    },
    {
      title: "Pilar mais movimentado",
      value: leadingPillarMovement.pillar,
      logoTicker: null,
      subtitle: `${leadingPillarMovement.pillar} concentrou a maior parte das mudanças do dia`,
      delta: `${leadingPillarMovement.events} eventos · maioria em atenção`,
      ctaLabel: "Filtrar por pilar",
      action: () => applySinglePillarFilter(leadingPillarMovement.pillar),
      accent: "border-amber-200 bg-amber-50 text-amber-800",
    },
    {
      title: "Saúde da watchlist",
      value: `${healthyWatchlistCount} de ${totalWatchlistCount}`,
      logoTicker: null,
      subtitle: "empresas seguem sem sinais relevantes hoje",
      delta: "+2,1 p.p. vs semana passada",
      ctaLabel: "Ver composição",
      action: () => navigate("/watchlist?filtro=saude"),
      accent: "border-[#D0D5DD] bg-[#F8FAFC] text-[#344054]",
    },
  ];

  const activeFilterChips = [
    hasSeverityFilter ? activeSeverities : [],
    hasPillarFilter ? activePillars : [],
    hasSourceFilter ? activeSources : [],
    hasPeriodFilter ? [`${inboxFilters.period}`] : [],
  ].flat();

  const refreshLabel = useMemo(() => relativeFromTimestamp(lastRefreshAt), [lastRefreshAt, clockTick]);
  const orderLabel = inboxMode === "tempo-real" ? "tempo real" : "impacto";

  return (
    <div className={cn("min-h-screen", isDarkMode ? "bg-[#020617] text-[#E5E7EB]" : "bg-[#F8FAFC] text-[#101828]")}>
      <div className="hidden md:fixed md:inset-y-0 md:left-0 md:z-30 md:block md:w-[88px]">
        <Sidebar currentPage="dashboard" />
      </div>

      <div className="md:pl-[88px]">
        <header className={cn("sticky top-0 z-20 h-12 border-b", isDarkMode ? "border-[#1F2937] bg-[#0B1220]" : "border-[#EAECF0] bg-white")}>
          <div className="flex h-full items-center justify-between px-6">
            <div className="flex min-w-0 flex-1 items-center gap-2">
              <div className="md:hidden" />
              <div className={cn("hidden h-8 w-full max-w-[430px] items-center rounded-lg border px-3 md:flex", isDarkMode ? "border-[#334155] bg-[#0F172A]" : "border-[#E4E7EC] bg-[#FCFCFD]")}>
                <Search className={cn("h-4 w-4", isDarkMode ? "text-[#9CA3AF]" : "text-[#98A2B3]")} />
                <Input
                  className={cn("h-7 border-0 bg-transparent px-2 text-[13px] shadow-none ring-0 focus-visible:ring-0", isDarkMode ? "text-[#E5E7EB] placeholder:text-[#9CA3AF]" : "")}
                  placeholder="Busque empresa ou ticker..."
                />
              </div>
            </div>

            <div className="flex items-center gap-1">
              <Button variant="ghost" size="icon" className="relative h-8 w-8 rounded-full">
                <Bell className={cn("h-[30px] w-[30px]", isDarkMode ? "text-[#9CA3AF]" : "text-[#667085]")} />
                <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-[#DC2626]" />
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                <Settings className={cn("h-[30px] w-[30px]", isDarkMode ? "text-[#9CA3AF]" : "text-[#667085]")} />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-full"
                onClick={() => setIsDarkMode((prev) => !prev)}
                aria-label={isDarkMode ? "Ativar modo claro" : "Ativar modo escuro"}
                title={isDarkMode ? "Modo claro" : "Modo escuro"}
              >
                {isDarkMode ? <Sun className="h-5 w-5 text-[#FBBF24]" /> : <Moon className="h-5 w-5 text-[#667085]" />}
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                <UserCircle2 className={cn("h-5 w-5", isDarkMode ? "text-[#9CA3AF]" : "text-[#667085]")} />
              </Button>
            </div>
          </div>
        </header>

        <main className="space-y-6 px-6 pb-10 pt-6">
          <section className="flex flex-wrap items-start justify-between gap-3">
            <div className="space-y-1">
              <div className="flex items-center gap-3">
                <h1 className={cn("text-[24px] font-semibold", isDarkMode ? "text-[#F3F4F6]" : "text-[#101828]")}>Sua watchlist hoje</h1>
                <span className={cn("rounded-full border px-2.5 py-1 text-[12px]", isDarkMode ? "border-[#374151] bg-[#111827] text-[#9CA3AF]" : "border-[#EAECF0] bg-white text-[#667085]")}>Atualizado {refreshLabel}</span>
              </div>
              <p className={cn("text-[13px]", isDarkMode ? "text-[#9CA3AF]" : "text-[#667085]")}>Leitura das últimas 24h</p>
            </div>
            <Button
              variant="outline"
              className={cn(
                "h-8 rounded-lg border px-3 text-[12px] font-medium",
                isDarkMode ? "border-[#334155] bg-[#0F172A] text-[#9CA3AF] hover:bg-[#1F2937]" : "border-[#D0D5DD] bg-[#FCFCFD] text-[#475467] hover:bg-white",
              )}
            >
              + Criar alerta
            </Button>
          </section>

          <section>
            <Card className={cn("rounded-2xl border", isDarkMode ? "border-[#134E48] bg-[#0B2A2A]" : "border-[#BFEAE4] bg-gradient-to-r from-[#ECFDF9] to-white")}>
              <CardContent className="space-y-3 p-4">
                <div className="space-y-1.5">
                  <p className={cn("text-[12px] font-semibold uppercase tracking-[0.08em]", isDarkMode ? "text-[#5EEAD4]" : "text-[#0E9384]")}>Resumo do dia</p>
                  <p className={cn("text-[20px] font-semibold leading-tight", isDarkMode ? "text-[#F3F4F6]" : "text-[#101828]")}>
                    {todayRiskCount > 0 || todayAttentionCount > 0
                      ? `Hoje sua watchlist teve ${pluralize(todayRiskCount, "mudança de risco", "mudanças de risco")} e ${pluralize(todayHealthyCount, "melhora importante", "melhoras importantes")}.`
                      : "Sua watchlist está estável hoje, sem pioras críticas novas."}
                  </p>
                  <p className={cn("text-[14px]", isDarkMode ? "text-[#C5D4D4]" : "text-[#475467]")}>
                    {priorityItem
                      ? `Comece por ${priorityItem.ticker}: ${priorityItem.title.toLowerCase()}. Pilar mais pressionado: ${leadingPillarMovement.pillar}.`
                      : "Comece pelas atualizações mais recentes para confirmar se houve mudanças de contexto."}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Button onClick={focusInboxRecentImpact} className="h-9 rounded-lg bg-[#0E9384] px-3 text-[12px] font-semibold text-white hover:bg-[#0B7F74]">
                    Ver prioridades do dia
                  </Button>
                  <Button
                    variant="outline"
                    onClick={focusInboxRecentImpact}
                    className={cn(
                      "h-9 rounded-lg border px-3 text-[12px] font-semibold",
                      isDarkMode ? "border-[#2DD4BF]/40 bg-transparent text-[#CCFBF1] hover:bg-[#0F3A39]" : "border-[#99DFD7] bg-white text-[#0E9384] hover:bg-[#F0FDFA]",
                    )}
                  >
                    Ver atualizações
                  </Button>
                  <span
                    className={cn(
                      "inline-flex items-center gap-1.5 rounded-full border px-2 py-1 text-[11px]",
                      isDarkMode ? "border-[#334155] bg-[#0F172A] text-[#9CA3AF]" : "border-[#D0D5DD] bg-white text-[#667085]",
                    )}
                  >
                    <Database className="h-3 w-3" />
                    Dados oficiais · CVM / B3 / RI
                  </span>
                </div>
              </CardContent>
            </Card>
          </section>

          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {supportCards.map((card) => (
              <button
                key={card.title}
                onClick={card.action}
                className={cn(
                  "group rounded-2xl border p-3.5 text-left transition-all duration-150",
                  isDarkMode
                    ? "border-[#1F2937] bg-[#0F172A] hover:border-[#334155] hover:shadow-[0_2px_10px_rgba(0,0,0,0.35)]"
                    : "border-[#EAECF0] bg-white hover:border-[#D0D5DD] hover:shadow-[0_2px_10px_rgba(16,24,40,0.06)]",
                )}
              >
                <p className={cn("mb-2 text-[12px] font-medium", isDarkMode ? "text-[#9CA3AF]" : "text-[#667085]")}>{card.title}</p>
                <div className="flex items-center gap-2">
                  {card.logoTicker && logoByTicker[card.logoTicker] ? (
                    <Avatar className="h-7 w-7 rounded-md">
                      <AvatarImage src={logoByTicker[card.logoTicker]} alt={card.logoTicker} className="object-cover" />
                      <AvatarFallback className="rounded-md text-[10px]">{card.logoTicker.slice(0, 2)}</AvatarFallback>
                    </Avatar>
                  ) : null}
                  <p className={cn("text-[17px] font-semibold", isDarkMode ? "text-[#F3F4F6]" : "text-[#101828]")}>{card.value}</p>
                </div>
                <p className={cn("mt-1.5 text-[12px] leading-snug", isDarkMode ? "text-[#CBD5E1]" : "text-[#344054]")}>{card.subtitle}</p>
                <p className={cn("mt-2.5 rounded-lg border px-2.5 py-1.5 text-[11px] font-medium", card.accent)}>{card.delta}</p>
                <div className="mt-2.5 flex items-center justify-between">
                  <span className="text-[12px] font-semibold text-[#0E9384]">{card.ctaLabel}</span>
                  <ChevronRight className={cn("h-4 w-4", isDarkMode ? "text-[#94A3B8]" : "text-[#98A2B3]")} />
                </div>
              </button>
            ))}
          </section>

          <section ref={inboxRef} className="grid gap-4 xl:grid-cols-3">
            <Card className={cn("rounded-2xl border xl:col-span-2", isDarkMode ? "border-[#1F2937] bg-[#0F172A]" : "border-[#EAECF0] bg-white")}>
              <CardHeader className="space-y-3 px-4 pt-4">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <CardTitle className={cn("text-[16px] font-semibold", isDarkMode ? "text-[#F3F4F6]" : "text-[#101828]")}>Atualizações da watchlist</CardTitle>
                    <CardDescription className={cn("text-[14px]", isDarkMode ? "text-[#9CA3AF]" : "text-[#667085]")}>
                      Comece pelas mudanças com maior impacto e entenda por que elas importam.
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className={cn("inline-flex rounded-lg border p-0.5", isDarkMode ? "border-[#374151] bg-[#0F172A]" : "border-[#D0D5DD] bg-white")}>
                      <button
                        onClick={setImpactMode}
                        className={cn(
                          "rounded-md px-2.5 py-1.5 text-[12px] font-semibold transition",
                          inboxMode === "top-impacto" ? "bg-[#0E9384] text-white" : isDarkMode ? "text-[#9CA3AF] hover:bg-[#1F2937]" : "text-[#667085] hover:bg-[#F2F4F7]",
                        )}
                      >
                        Top impacto
                      </button>
                      <button
                        onClick={setRealTimeMode}
                        className={cn(
                          "rounded-md px-2.5 py-1.5 text-[12px] font-semibold transition",
                          inboxMode === "tempo-real" ? "bg-[#0E9384] text-white" : isDarkMode ? "text-[#9CA3AF] hover:bg-[#1F2937]" : "text-[#667085] hover:bg-[#F2F4F7]",
                        )}
                      >
                        Tempo real
                      </button>
                    </div>
                  </div>
                </div>

                <div className={cn("rounded-xl border p-3", isDarkMode ? "border-[#1F2937] bg-[#111827]" : "border-[#EAECF0] bg-[#FCFCFD]")}>
                  <div className="flex flex-wrap items-center gap-2">
                    <p className={cn("text-[12px] font-medium", isDarkMode ? "text-[#9CA3AF]" : "text-[#667085]")}>Período</p>
                    {(["24h", "7d", "30d"] as WindowRange[]).map((range) => (
                      <button
                        key={range}
                        onClick={() => setInboxFilters((prev) => ({ ...prev, period: range }))}
                        className={cn(
                          "h-7 rounded-full border px-3 text-[11px] font-medium",
                          inboxFilters.period === range
                            ? "border-[#0E9384] bg-[#0E9384] text-white"
                            : isDarkMode
                              ? "border-[#374151] bg-[#0F172A] text-[#9CA3AF] hover:bg-[#1F2937]"
                              : "border-[#EAECF0] bg-white text-[#667085] hover:bg-[#F9FAFB]",
                        )}
                      >
                        {range}
                      </button>
                    ))}
                    <button
                      onClick={() => setFiltersOpen((prev) => !prev)}
                      className={cn(
                        "ml-auto rounded-lg border px-3 py-1.5 text-[12px] font-medium",
                        isDarkMode ? "border-[#374151] bg-[#0F172A] text-[#D1D5DB] hover:bg-[#1F2937]" : "border-[#D0D5DD] bg-white text-[#475467] hover:bg-[#F9FAFB]",
                      )}
                    >
                      {showFiltersCount ? `Filtros (${advancedFiltersCount})` : "Filtros"}
                    </button>
                  </div>

                  <div className="mt-2 flex items-center justify-between gap-2 text-[12px]">
                    <p className={cn(isDarkMode ? "text-[#9CA3AF]" : "text-[#667085]")}>
                      {inboxRows.length} atualizações · ordenado por {orderLabel}
                    </p>
                    <div className={cn("flex items-center gap-2", isDarkMode ? "text-[#9CA3AF]" : "text-[#667085]")}>
                      <span>Atualizado {refreshLabel}</span>
                      <button onClick={refreshInboxNow} className="font-semibold text-[#0E9384] hover:text-[#0B7F74]" disabled={isRefreshing}>
                        {isRefreshing ? "Atualizando..." : "Atualizar agora"}
                      </button>
                    </div>
                  </div>

                  {refreshError && <p className="mt-2 text-[12px] font-medium text-[#B42318]">{refreshError}</p>}

                  {filtersOpen && (
                    <div className="mt-3 space-y-2 rounded-lg border border-[#EAECF0] bg-white p-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-[12px] font-medium text-[#667085]">Severidade</p>
                        {allStatuses.map((status) => (
                          <button
                            key={status}
                            onClick={() => setInboxFilters((prev) => ({ ...prev, severities: toggleInArray(prev.severities, status) }))}
                            className={cn(
                              "h-7 rounded-full border px-3 text-[11px] font-medium",
                              activeSeverities.includes(status)
                                ? "border-[#0E9384] bg-[#E6FFFB] text-[#0E9384]"
                                : "border-[#EAECF0] bg-white text-[#667085] hover:bg-[#F9FAFB]",
                            )}
                          >
                            {status}
                          </button>
                        ))}
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-[12px] font-medium text-[#667085]">Pilar</p>
                        {allPillars.map((pillar) => (
                          <button
                            key={pillar}
                            onClick={() => setInboxFilters((prev) => ({ ...prev, pillars: toggleInArray(prev.pillars, pillar) }))}
                            className={cn(
                              "h-7 rounded-full border px-3 text-[11px] font-medium",
                              activePillars.includes(pillar)
                                ? "border-[#0E9384] bg-[#E6FFFB] text-[#0E9384]"
                                : "border-[#EAECF0] bg-white text-[#667085] hover:bg-[#F9FAFB]",
                            )}
                          >
                            {pillar}
                          </button>
                        ))}
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-[12px] font-medium text-[#667085]">Fonte</p>
                        {allSources.map((source) => (
                          <button
                            key={source}
                            onClick={() => setInboxFilters((prev) => ({ ...prev, sources: toggleInArray(prev.sources, source) }))}
                            className={cn(
                              "h-7 rounded-full border px-3 text-[11px] font-medium",
                              activeSources.includes(source)
                                ? "border-[#0E9384] bg-[#E6FFFB] text-[#0E9384]"
                                : "border-[#EAECF0] bg-white text-[#667085] hover:bg-[#F9FAFB]",
                            )}
                          >
                            {source}
                          </button>
                        ))}
                      </div>

                      <div className="flex justify-end">
                        <button onClick={clearInboxFilters} className="text-[12px] font-semibold text-[#0E9384] hover:text-[#0B7F74]">
                          Limpar
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </CardHeader>

              <CardContent className="space-y-2 px-4 pb-4">
                {hasAnyFilterOverride && (
                  <div className={cn("rounded-xl border px-3 py-2", isDarkMode ? "border-[#374151] bg-[#111827]" : "border-[#E4E7EC] bg-[#F8FAFC]")}>
                    <div className="flex flex-wrap items-center gap-2">
                      {activeFilterChips.map((chip) => (
                        <span key={chip} className={cn("inline-flex h-[22px] items-center rounded-full border px-2 text-[11px]", isDarkMode ? "border-[#475467] bg-[#0F172A] text-[#CBD5E1]" : "border-[#E4E7EC] bg-white text-[#475467]")}>
                          {chip}
                        </span>
                      ))}
                      <button onClick={clearInboxFilters} className="ml-auto text-[12px] font-semibold text-[#0E9384] hover:text-[#0B7F74]">
                        Limpar filtros
                      </button>
                    </div>
                  </div>
                )}

                {isLoading ? (
                  <div className="space-y-2">
                    {[1, 2, 3, 4].map((item) => (
                      <div key={item} className="h-16 animate-pulse rounded-xl border border-[#EAECF0] bg-[#F8FAFC]" />
                    ))}
                  </div>
                ) : inboxError ? (
                  <div className="rounded-xl border border-[#FECACA] bg-[#FEF2F2] px-3 py-4">
                    <p className="text-[14px] font-medium text-[#B42318]">Não foi possível carregar atualizações.</p>
                    <button onClick={() => setInboxError(false)} className="mt-2 text-[12px] font-medium text-[#B42318] underline">
                      Tentar novamente
                    </button>
                  </div>
                ) : inboxRows.length === 0 ? (
                  <div className="rounded-xl border border-[#EAECF0] bg-[#F8FAFC] px-3 py-4">
                    <p className="text-[14px] text-[#667085]">Nenhuma atualização relevante no período.</p>
                    <button
                      onClick={() => setInboxFilters((prev) => ({ ...prev, period: "7d" }))}
                      className="mt-2 text-[12px] font-medium text-[#0E9384] hover:text-[#0B7F74]"
                    >
                      Ampliar para 7 dias
                    </button>
                  </div>
                ) : (
                  <>
                    {inboxMode === "top-impacto" && priorityItem && (
                      <div className={cn("rounded-xl border px-3 py-2", isDarkMode ? "border-[#134E48] bg-[#0F2B2A]" : "border-[#99DFD7] bg-[#F0FDFA]")}>
                        <p className={cn("text-[12px] font-semibold", isDarkMode ? "text-[#99F6E4]" : "text-[#0E9384]")}>
                          Maior impacto hoje: {priorityItem.ticker}
                          {priorityItem.pillarKey ? ` em ${priorityItem.pillarKey}` : ""}
                        </p>
                      </div>
                    )}
                    {inboxRows.map((item, index) => {
                      const isNew = (newBadgeUntil[item.id] ?? 0) > Date.now();
                      const isPriority = index === 0 && inboxMode === "top-impacto";
                      return (
                        <button
                          key={item.id}
                        onClick={() => openInboxItem(item)}
                        className={cn(
                          "w-full cursor-pointer rounded-xl border border-transparent p-3 text-left transition hover:border-[#D0D5DD] hover:bg-[#F2F4F7] hover:shadow-[inset_3px_0_0_#0E9384]",
                          isNew && "border-[#B2DDFF] bg-[#F0F9FF]",
                          isPriority && "border-[#99DFD7] bg-[#F0FDFA] hover:bg-[#ECFDF9] hover:border-[#6ED4C7]",
                        )}
                      >
                        <div className="flex items-start justify-between gap-3">
                            <div className="flex min-w-0 flex-1 items-start gap-2.5">
                              <Avatar className="h-8 w-8 rounded-md">
                                <AvatarImage src={logoByTicker[item.ticker]} alt={item.ticker} className="object-cover" />
                                <AvatarFallback className="rounded-md text-[10px]">{item.ticker.slice(0, 2)}</AvatarFallback>
                              </Avatar>
                              <div className="min-w-0">
                                {isPriority && (
                                  <span className={cn("mb-1 inline-flex h-[22px] items-center rounded-full border px-2 text-[11px] font-semibold", isDarkMode ? "border-[#2DD4BF]/40 bg-[#134E48] text-[#CCFBF1]" : "border-[#99DFD7] bg-[#E6FFFB] text-[#0E9384]")}>
                                    Prioridade 1
                                  </span>
                                )}
                                <p className="truncate text-[13px] font-semibold text-[#344054]">
                                  {item.ticker} · {item.companyName}
                                </p>
                                <p className="truncate text-[14px] font-semibold text-[#101828]">{item.title}</p>
                                <p className="mt-1 line-clamp-1 text-[12px] text-[#475467]">Por que isso importa: {item.whyItMatters}</p>
                                <div className="mt-1 flex flex-wrap gap-1">
                                  {item.pillarKey && (
                                    <span className="inline-flex h-[22px] items-center rounded-full border border-[#E4E7EC] bg-[#F9FAFB] px-2 text-[11px] text-[#475467]">
                                      {item.pillarKey}
                                    </span>
                                  )}
                                  {item.source && (
                                    <span className="inline-flex h-[22px] items-center rounded-full border border-[#E4E7EC] bg-[#F9FAFB] px-2 text-[11px] text-[#475467]">
                                      {item.source}
                                    </span>
                                  )}
                                  <span className="inline-flex h-[22px] items-center rounded-full border border-[#E4E7EC] bg-[#F9FAFB] px-2 text-[11px] text-[#475467]">
                                    {item.relativeTime}
                                  </span>
                                  {isNew && <span className="inline-flex h-[22px] items-center rounded-full border border-sky-300 bg-sky-100 px-2 text-[11px] font-semibold text-sky-900">Novo</span>}
                                </div>
                              </div>
                            </div>

                            <div className="flex shrink-0 flex-col items-end gap-2">
                              <StatusBadge status={item.severity} />
                              <div className="flex items-center gap-1.5">
                                <span className="text-[12px] font-semibold text-[#0E9384]">{feedCtaLabel(item, isPriority)}</span>
                                <ChevronRight className="h-4 w-4 text-[#98A2B3]" />
                              </div>
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </>
                )}
              </CardContent>
            </Card>

            <Card className={cn("rounded-2xl border", isDarkMode ? "border-[#1F2937] bg-[#0F172A]" : "border-[#EAECF0] bg-white")}>
              <CardHeader className="px-4 pt-4">
                <CardTitle className={cn("text-[16px] font-semibold", isDarkMode ? "text-[#F3F4F6]" : "text-[#101828]")}>Pilares em movimento</CardTitle>
                <CardDescription className={cn("text-[14px]", isDarkMode ? "text-[#9CA3AF]" : "text-[#667085]")}>
                  Veja quais temas concentraram mudanças hoje e clique para filtrar a inbox.
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-1 px-4">
                {isLoading ? (
                  <div className="space-y-2">
                    {[1, 2, 3, 4, 5].map((item) => (
                      <div key={item} className="h-12 animate-pulse rounded-xl border border-[#EAECF0] bg-[#F8FAFC]" />
                    ))}
                  </div>
                ) : (
                  visiblePillarMovements.map((item, idx) => (
                    <button
                      key={item.pillar}
                      onClick={() => applySinglePillarFilter(item.pillar)}
                      className={cn(
                        "w-full cursor-pointer rounded-xl border border-transparent p-2.5 text-left transition hover:border-[#D0D5DD] hover:bg-[#F8FAFC]",
                        idx > 0 && "border-t border-t-[#F2F4F7]",
                      )}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="min-w-0">
                          <p className="text-[14px] font-medium text-[#101828]">{item.pillar}</p>
                          <p className="mt-0.5 text-[12px] text-[#475467]">{item.pillar} {pillarInsight[item.pillar]}.</p>
                          <div className="mt-1.5">
                            <SegmentedHealthBar healthy={item.healthy} attention={item.attention} risk={item.risk} />
                            <div className="mt-1 flex flex-wrap items-center gap-3 text-[10px]">
                              <span className="text-[#667085]">{item.events} eventos</span>
                              <span className="text-rose-600">Risco {item.risk}</span>
                              <span className="text-amber-600">Atenção {item.attention}</span>
                              <span className="text-emerald-600">Saudável {item.healthy}</span>
                            </div>
                          </div>
                        </div>
                        <ChevronRight className="h-4 w-4 text-[#98A2B3]" />
                      </div>
                    </button>
                  ))
                )}
              </CardContent>

              <CardFooter className="justify-between border-t border-[#F2F4F7] px-4 pt-3 pb-3.5">
                <div>
                  <p className="text-[12px] text-[#667085]">Atualizado {refreshLabel} · Fontes: CVM / B3 / RI</p>
                  {sourceFailed && <p className="text-[12px] text-amber-700">1 fonte falhou hoje; tentaremos novamente.</p>}
                </div>
                <button onClick={() => applySinglePillarFilter(focusedPillar)} className="text-[12px] font-semibold text-[#0E9384] hover:text-[#0B7F74]">
                  Filtrar empresas afetadas
                </button>
              </CardFooter>
            </Card>
          </section>
        </main>
      </div>
    </div>
  );
}

export default Dashboard;

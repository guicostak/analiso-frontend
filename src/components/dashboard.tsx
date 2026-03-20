"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useTheme } from "next-themes";
import { useRouter } from "next/navigation";
import { useAuth } from "../contexts/AuthContext";
import { getDashboard, type DashboardResponse } from "../services/dashboard";
import { ApiError } from "../services/api";
import { AppTopBar } from "./app-top-bar";
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
const READING_PROGRESS_STORAGE_KEY = "dashboard-reading-progress:v1";
const NEW_ITEM_HIGHLIGHT_MS = 10_000;

const allStatuses: Status[] = ["Risco", "Atenção", "Saudável"];
const allPillars: Pillar[] = ["Dívida", "Caixa", "Margens", "Retorno", "Proventos"];
const allSources: InboxSource[] = ["CVM", "B3", "RI"];

const logoByTicker: Record<string, string> = {
  VALE3: logoVale.src,
  LREN3: logoRenner.src,
  ITUB4: logoItau.src,
  MRVE3: logoMrv.src,
  TAEE11: logoTaesa.src,
  WEGE3: logoWeg.src,
};

// -------------------------------------------------------
// API → Dashboard mappings
// -------------------------------------------------------

const companyNameByTicker: Record<string, string> = {
  VALE3: "Vale", PETR4: "Petrobras", PETR3: "Petrobras",
  ITUB4: "Itaú Unibanco", ITUB3: "Itaú Unibanco",
  BBAS3: "Banco do Brasil", BBDC4: "Bradesco", BBDC3: "Bradesco",
  ABEV3: "Ambev", WEGE3: "WEG", RENT3: "Localiza",
  LREN3: "Lojas Renner", MGLU3: "Magazine Luiza",
  MRVE3: "MRV Engenharia", TAEE11: "Taesa",
  FLRY3: "Fleury", CSAN3: "Cosan",
};

function apiPillarToDashboard(apiPillar: string): Pillar | undefined {
  const map: Record<string, Pillar> = {
    debt: "Dívida",
    cash: "Caixa",
    profitability: "Margens",
    growth: "Retorno",
    dividends: "Proventos",
  };
  return map[apiPillar];
}

function apiTemplateToSeverity(template: string): Status {
  if (template === "ITEM_HIGH_RISK_ACTIONABLE" || template === "ITEM_HIGH_RISK_VALIDATE") return "Risco";
  if (template === "ITEM_MEDIUM_RISK_MONITOR" || template === "ITEM_EVENT_AHEAD" || template === "ITEM_MIXED_SIGNALS") return "Atenção";
  return "Saudável";
}

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

function loadViewedInboxItemIds() {
  try {
    const raw = window.localStorage.getItem(READING_PROGRESS_STORAGE_KEY);
    if (!raw) return [] as string[];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === "string") : [];
  } catch {
    return [];
  }
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

function ReadingProgressStep({
  label,
  status,
  isDarkMode,
}: {
  label: string;
  status: "done" | "current" | "upcoming";
  isDarkMode: boolean;
}) {
  return (
    <div
      className={cn(
        "rounded-xl border px-3 py-2",
        status === "current"
          ? isDarkMode
            ? "border-[#2DD4BF]/40 bg-[#0F2B2A]"
            : "border-mint-200 bg-mint-50"
          : status === "done"
            ? isDarkMode
              ? "border-[#334155] bg-[#111827]"
              : "border-slate-200 bg-slate-50"
            : isDarkMode
              ? "border-[#1F2937] bg-[#0B1220]"
              : "border-slate-200 bg-white",
      )}
    >
      <div className="flex items-center gap-2">
        <span
          className={cn(
            "inline-flex h-5 w-5 items-center justify-center rounded-full border text-[10px] font-semibold",
            status === "current"
              ? "border-mint-600 bg-mint-600 text-white"
              : status === "done"
                ? isDarkMode
                  ? "border-[#475467] bg-[#0F172A] text-[#CCFBF1]"
                  : "border-mint-200 bg-white text-mint-600"
                : isDarkMode
                  ? "border-[#334155] bg-[#0F172A] text-slate-400"
                  : "border-slate-200 bg-slate-50 text-slate-500",
          )}
        >
          {status === "done" ? "OK" : ""}
        </span>
        <p
          className={cn(
            "text-[12px] font-medium",
            status === "current"
              ? isDarkMode
                ? "text-[#F3F4F6]"
                : "text-slate-900"
              : isDarkMode
                ? "text-slate-400"
                : "text-slate-600",
          )}
        >
          {label}
        </p>
      </div>
    </div>
  );
}

export function Dashboard() {
  const router = useRouter();
  const { token, user, logout } = useAuth();

  // API state
  const [dashboardData, setDashboardData]       = useState<DashboardResponse | null>(null);
  const [dashboardLoading, setDashboardLoading] = useState(true);
  const [dashboardError, setDashboardError]     = useState<string | null>(null);
  const retryTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    let cancelled = false;

    const fetchDashboard = () => {
      setDashboardLoading(true);
      setDashboardError(null);

      getDashboard(token)
        .then((data) => {
          if (!cancelled) {
            setDashboardData(data);
            setDashboardLoading(false);
          }
        })
        .catch((err: unknown) => {
          if (cancelled) return;
          setDashboardLoading(false);
          if (err instanceof ApiError && err.code === "dashboard_not_ready") {
            setDashboardError("not_ready");
            // Worker ainda processando — tenta de novo em 5s
            retryTimeoutRef.current = setTimeout(() => {
              if (!cancelled) fetchDashboard();
            }, 5000);
          } else if (err instanceof ApiError && err.status === 401) {
            logout();
          } else {
            setDashboardError("error");
          }
        });
    };

    fetchDashboard();

    return () => {
      cancelled = true;
      if (retryTimeoutRef.current) clearTimeout(retryTimeoutRef.current);
    };
  }, [token]);

  // Map API items → InboxSeedItem[] to feed the existing UI
  const apiInboxItems = useMemo<InboxSeedItem[]>(() => {
    if (!dashboardData) return [];
    return dashboardData.items.map((item, idx) => ({
      id: `api-${item.ticker}-${item.pillar}-${item.priorityRank}`,
      companyId: item.ticker,
      ticker: item.ticker,
      companyName: companyNameByTicker[item.ticker] ?? item.ticker,
      title: item.card.title,
      whyItMatters: item.card.whyItMatters,
      severity: apiTemplateToSeverity(item.primaryTemplate),
      pillarKey: apiPillarToDashboard(item.pillar),
      source: undefined,
      // rank 1 = most recent feel: rank * 8 minutes ago
      ageMinutes: (item.priorityRank - 1) * 8 + 1,
      impactScore: Math.max(1, 100 - idx * 7),
      eventType: "mudanca" as const,
    }));
  }, [dashboardData]);

  const [inboxError, setInboxError] = useState(false);
  const [inboxFilters, setInboxFilters] = useState<InboxFilters>(() => loadInboxFilters());
  const [inboxMode, setInboxMode] = useState<InboxMode>(() => loadInboxMode());
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [lastRefreshAt, setLastRefreshAt] = useState(() => Date.now());
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshError, setRefreshError] = useState<string | null>(null);
  const [clockTick, setClockTick] = useState(0);
  const { resolvedTheme, setTheme } = useTheme();
  const isDarkMode = resolvedTheme === "dark";
  const [realtimeItems, setRealtimeItems] = useState<InboxSeedItem[]>([]);
  const [newBadgeUntil, setNewBadgeUntil] = useState<Record<string, number>>({});
  const [viewedInboxItemIds, setViewedInboxItemIds] = useState<string[]>(() => loadViewedInboxItemIds());
  const inboxRef = useRef<HTMLElement | null>(null);
  const refreshSequenceRef = useRef(0);

  const isLoading = false;
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

  // Use API items when available; fall back to mock seed while loading or on error
  const baseInboxItems = apiInboxItems.length > 0 ? apiInboxItems : inboxSeed;

  const inboxItems = useMemo<InboxItem[]>(
    () =>
      [...realtimeItems, ...baseInboxItems].map((item) => ({
        ...item,
        ageMinutes: item.ageMinutes,
        timestamp: new Date(lastRefreshAt - item.ageMinutes * 60_000).toISOString(),
        relativeTime: relativeFromMinutes(item.ageMinutes),
      })),
    [lastRefreshAt, realtimeItems, baseInboxItems],
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
      window.localStorage.setItem(READING_PROGRESS_STORAGE_KEY, JSON.stringify(viewedInboxItemIds));
    } catch {
      // ignore storage errors
    }
  }, [viewedInboxItemIds]);


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
    setViewedInboxItemIds((prev) => (prev.includes(item.id) ? prev : [...prev, item.id]));
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

    router.push(`/empresa/${item.ticker}?${params.toString()}`);
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
  const visiblePillarMovements = [...pillarMovements].sort((a, b) => b.events - a.events).slice(0, 2);
  const secondPillarMovement = [...pillarMovements].sort((a, b) => b.events - a.events)[1];

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
    if (isPriority) return "Abrir prioridade";
    if (item.eventType === "evento_futuro") return "Entender impacto";
    if (item.severity === "Risco" || item.severity === "Atenção") return "Ler analise";
    return "Ver contexto";
  };

  const supportCards = [
    {
      title: "Maior risco hoje",
      value: topRiskItem ? topRiskItem.ticker : "Sem risco novo",
      logoTicker: topRiskItem ? topRiskItem.ticker : null,
      subtitle: topRiskItem
        ? "A alavancagem subiu alem do limite interno e virou o principal ponto de pressao do dia."
        : "Nenhum sinal critico novo nas ultimas 24h.",
      delta: topRiskItem
        ? `${pluralize(todayRiskCount, "sinal critico", "sinais criticos")} nas ultimas 24h`
        : "Watchlist sem piora critica nova hoje",
      ctaLabel: "Ver análise completa",
      action: () => (topRiskItem ? openInboxItem(topRiskItem) : focusInboxRecentImpact()),
      accent: "border-rose-200 bg-rose-50 text-rose-800",
    },
    {
      title: "Maior melhora",
      value: topImproveItem ? topImproveItem.ticker : "Sem melhora nova",
      logoTicker: topImproveItem ? topImproveItem.ticker : null,
      subtitle: topImproveItem
        ? "O retorno segue estavel mesmo com ruido no dia e sustenta a leitura positiva do pilar."
        : "Sem recuperacao relevante registrada hoje.",
      delta: `${pluralize(todayHealthyCount, "sinal positivo", "sinais positivos")} relevantes hoje`,
      ctaLabel: "Ver análise completa",
      action: () => (topImproveItem ? openInboxItem(topImproveItem) : focusInboxRecentImpact()),
      accent: "border-emerald-200 bg-emerald-50 text-emerald-800",
    },
    {
      title: "Pilar mais movimentado",
      value: leadingPillarMovement.pillar,
      logoTicker: null,
      subtitle: `${leadingPillarMovement.pillar} concentrou os principais sinais do dia e merece prioridade de leitura.`,
      delta: `${leadingPillarMovement.events} eventos no dia`,
      ctaLabel: "Filtrar por pilar",
      action: () => applySinglePillarFilter(leadingPillarMovement.pillar),
      accent: "border-amber-200 bg-amber-50 text-amber-800",
    },
    {
      title: "Saúde da watchlist",
      value: `${healthyWatchlistCount} de ${totalWatchlistCount} estáveis`,
      logoTicker: null,
      subtitle: "A maior parte da watchlist segue estável hoje, com pressão concentrada em poucos nomes.",
      delta: `${healthyWatchlistCount} de ${totalWatchlistCount} sem sinais relevantes · +2,1 p.p. vs semana passada`,
      ctaLabel: "Ver composição por grupo",
      action: () => router.push("/watchlist?filtro=saude"),
      accent: "border-slate-300 bg-slate-50 text-slate-700",
    },
  ];

  const feedSectionLabel = (item: InboxItem, index: number) => {
    if (index === 0) return "Prioridade do dia";
    if (item.severity === "Risco" || item.severity === "Atenção" || item.eventType === "evento_futuro") return "Acompanhamento relevante";
    return "Estaveis e positivos";
  };

  const hasDominantPillar = leadingPillarMovement.events - (secondPillarMovement?.events ?? 0) >= 3;
  const hasClearPriority = Boolean(priorityItem && priorityItem.impactScore >= 85);
  const hasNearTermFollowUp = todayItems.some((item) => item.eventType === "evento_futuro");
  const showSessionClosing = hasClearPriority || hasDominantPillar || hasNearTermFollowUp;
  const followUpItem = inboxRows.find((item, index) => feedSectionLabel(item, index) === "Acompanhamento relevante");
  const stableItem = inboxRows.find((item, index) => feedSectionLabel(item, index) === "Estaveis e positivos");
  const progressStates = [
    { label: "Prioridade do dia", done: priorityItem ? viewedInboxItemIds.includes(priorityItem.id) : true },
    { label: "Acompanhamentos relevantes", done: followUpItem ? viewedInboxItemIds.includes(followUpItem.id) : false },
    { label: "Itens estaveis", done: stableItem ? viewedInboxItemIds.includes(stableItem.id) : false },
  ];
  const completedSteps = progressStates.filter((item) => item.done).length;
  const currentProgressStep = progressStates.findIndex((item) => !item.done);
  const progressHeadlineStep = currentProgressStep === -1 ? progressStates.length : currentProgressStep + 1;

  const activeFilterChips = [
    hasSeverityFilter ? activeSeverities : [],
    hasPillarFilter ? activePillars : [],
    hasSourceFilter ? activeSources : [],
    hasPeriodFilter ? [`${inboxFilters.period}`] : [],
  ].flat();

  const refreshLabel = useMemo(() => relativeFromTimestamp(lastRefreshAt), [lastRefreshAt, clockTick]);
  const orderLabel = inboxMode === "tempo-real" ? "tempo real" : "impacto";

  return (
    <div
      className={cn("min-h-screen", isDarkMode ? "bg-[#020617] text-[#E5E7EB]" : "bg-slate-50 text-slate-900")}
      style={{ fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif' }}
    >
      <div className="hidden md:fixed md:inset-y-0 md:left-0 md:z-30 md:block md:w-[88px]">
        <Sidebar currentPage="dashboard" />
      </div>

      <div className="md:pl-[88px]">
              <AppTopBar />


        <main className="space-y-5 px-6 pb-10 pt-5">
          <section className="flex flex-wrap items-start justify-between gap-3">
            <div className="space-y-1">
              <div className="flex items-center gap-3">
                <h1 className={cn("text-[24px] font-semibold", isDarkMode ? "text-[#F3F4F6]" : "text-slate-900")}>Sua watchlist hoje</h1>
                <span className={cn("rounded-full border px-2.5 py-1 text-[12px]", isDarkMode ? "border-[#374151] bg-[#111827] text-slate-400" : "border-slate-200 bg-white text-slate-500")}>Atualizado {refreshLabel}</span>
              </div>
              <p className={cn("text-[13px]", isDarkMode ? "text-slate-400" : "text-slate-500")}>Leitura das últimas 24h</p>
            </div>
            <Button variant="ghost" className={cn("h-8 rounded-lg px-2 text-[12px] font-medium", isDarkMode ? "text-slate-400 hover:bg-[#0F172A]" : "text-slate-600 hover:bg-slate-100")}>
              + Criar alerta
            </Button>
          </section>

          <section>
            <Card className={cn("rounded-2xl border", isDarkMode ? "border-[#134E48] bg-[#0B2A2A]" : "border-mint-200 bg-gradient-to-r from-[#ECFDF9] to-white")}>
              <CardContent className="p-4">
                {dashboardLoading ? (
                  /* Skeleton while API loads */
                  <div className="space-y-2 animate-pulse">
                    <div className={cn("h-3 w-24 rounded", isDarkMode ? "bg-[#134E48]" : "bg-mint-100")} />
                    <div className={cn("h-6 w-3/4 rounded", isDarkMode ? "bg-[#134E48]" : "bg-mint-100")} />
                    <div className={cn("h-4 w-1/2 rounded", isDarkMode ? "bg-[#134E48]" : "bg-mint-100")} />
                  </div>
                ) : dashboardError === "not_ready" ? (
                  <div className="space-y-2">
                    <p className={cn("text-[11px] font-semibold uppercase tracking-[0.08em]", isDarkMode ? "text-[#5EEAD4]" : "text-mint-600")}>Resumo de hoje</p>
                    <p className={cn("text-[20px] font-semibold leading-tight", isDarkMode ? "text-[#F3F4F6]" : "text-slate-900")}>
                      Preparando seu dashboard...
                    </p>
                    <p className={cn("text-[14px] leading-relaxed", isDarkMode ? "text-[#C5D4D4]" : "text-slate-600")}>
                      Estamos analisando sua watchlist pela primeira vez. Isso leva menos de um minuto.
                    </p>
                    <div className="flex items-center gap-2 pt-1">
                      <div className="w-4 h-4 border-2 border-[#0E9384] border-t-transparent rounded-full animate-spin" />
                      <span className={cn("text-[13px]", isDarkMode ? "text-[#5EEAD4]" : "text-mint-600")}>
                        Atualizando automaticamente...
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                    <div className="max-w-3xl space-y-1.5">
                      <p className={cn("text-[11px] font-semibold uppercase tracking-[0.08em]", isDarkMode ? "text-[#5EEAD4]" : "text-mint-600")}>Resumo de hoje</p>
                      <p className={cn("text-[20px] font-semibold leading-tight", isDarkMode ? "text-[#F3F4F6]" : "text-slate-900")}>
                        {dashboardData?.summary.headline ??
                          (todayRiskCount > 0 || todayAttentionCount > 0
                            ? `Hoje sua watchlist teve ${pluralize(todayRiskCount, "mudança de risco", "mudanças de risco")} e ${pluralize(todayHealthyCount, "melhora importante", "melhoras importantes")}.`
                            : "Sua watchlist está estável hoje, sem pioras críticas novas.")}
                      </p>
                      <p className={cn("text-[14px] leading-relaxed", isDarkMode ? "text-[#C5D4D4]" : "text-slate-600")}>
                        {dashboardData?.summary.body ??
                          dashboardData?.nextStep.headline ??
                          (priorityItem
                            ? `Comece por ${priorityItem.ticker} e valide o impacto antes de revisar os acompanhamentos relevantes e os itens estaveis.`
                            : "Revise primeiro os itens de maior impacto para confirmar se o contexto da watchlist segue estável.")}
                      </p>
                    </div>
                    <div className="flex flex-col items-start gap-2 lg:items-end">
                      <Button onClick={focusInboxRecentImpact} className="h-9 rounded-lg bg-mint-600 px-3 text-[12px] font-semibold text-white hover:bg-mint-700">
                        {dashboardData?.summary.ctaPrimary ?? "Abrir prioridade 1"}
                      </Button>
                      <button onClick={focusInboxRecentImpact} className={cn("text-[12px] font-medium", isDarkMode ? "text-[#CCFBF1] hover:text-white" : "text-mint-700 hover:text-mint-800")}>
                        Ver todas as atualizações
                      </button>
                      <span
                        className={cn(
                          "inline-flex items-center gap-1.5 rounded-full border px-2 py-1 text-[11px]",
                          isDarkMode ? "border-[#334155] bg-[#0F172A] text-slate-400" : "border-white/70 bg-white/70 text-slate-500",
                        )}
                      >
                        <Database className="h-3 w-3" />
                        Dados oficiais · CVM / B3 / RI
                      </span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </section>

          <section ref={inboxRef} className="space-y-3">
            <Card className={cn("rounded-2xl border", isDarkMode ? "border-[#1F2937] bg-[#0B1220]" : "border-slate-200 bg-white")}>
              <CardContent className="space-y-3 p-4">
                <div className="flex flex-col gap-1">
                  <p className={cn("text-[12px] font-semibold uppercase tracking-[0.08em]", isDarkMode ? "text-[#5EEAD4]" : "text-mint-600")}>
                    Leitura de hoje: {progressHeadlineStep} de {progressStates.length} etapas
                  </p>
                  <p className={cn("text-[13px]", isDarkMode ? "text-slate-400" : "text-slate-500")}>
                    {completedSteps === progressStates.length
                      ? "Fluxo principal concluido. Se quiser, revise os blocos de apoio antes de encerrar."
                      : "Siga a ordem sugerida para reduzir ruido e concluir a sessao com mais contexto."}
                  </p>
                </div>
                <div className="grid gap-2 md:grid-cols-3">
                  {progressStates.map((step, index) => (
                    <ReadingProgressStep
                      key={step.label}
                      label={step.label}
                      isDarkMode={isDarkMode}
                      status={step.done ? "done" : index === currentProgressStep ? "current" : "upcoming"}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className={cn("rounded-2xl border", isDarkMode ? "border-[#1F2937] bg-[#0F172A]" : "border-slate-200 bg-white")}>
              <CardHeader className="space-y-3 px-4 pt-4">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                  <div className="max-w-2xl">
                    <CardTitle className={cn("text-[16px] font-semibold", isDarkMode ? "text-[#F3F4F6]" : "text-slate-900")}>Atualizações da watchlist</CardTitle>
                    <CardDescription className={cn("text-[14px]", isDarkMode ? "text-slate-400" : "text-slate-500")}>
                      Fluxo guiado: comece pelo primeiro item, avance nos relevantes e finalize nos estaveis.
                    </CardDescription>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 text-[12px]">
                    <div className={cn("inline-flex rounded-lg border p-0.5", isDarkMode ? "border-[#374151] bg-[#0F172A]" : "border-slate-300 bg-white")}>
                      <button
                        onClick={setImpactMode}
                        className={cn(
                          "rounded-md px-2.5 py-1.5 text-[12px] font-semibold transition",
                          inboxMode === "top-impacto" ? "bg-mint-600 text-white" : isDarkMode ? "text-slate-400 hover:bg-[#1F2937]" : "text-slate-500 hover:bg-slate-100",
                        )}
                      >
                        Top impacto
                      </button>
                      <button
                        onClick={setRealTimeMode}
                        className={cn(
                          "rounded-md px-2.5 py-1.5 text-[12px] font-semibold transition",
                          inboxMode === "tempo-real" ? "bg-mint-600 text-white" : isDarkMode ? "text-slate-400 hover:bg-[#1F2937]" : "text-slate-500 hover:bg-slate-100",
                        )}
                      >
                        Tempo real
                      </button>
                    </div>
                    <button
                      onClick={refreshInboxNow}
                      className={cn("font-medium", isDarkMode ? "text-slate-400 hover:text-slate-200" : "text-slate-500 hover:text-slate-700")}
                      disabled={isRefreshing}
                    >
                      {isRefreshing ? "Atualizando..." : "Atualizar agora"}
                    </button>
                  </div>
                </div>

                <div className={cn("rounded-xl border p-3", isDarkMode ? "border-[#1F2937] bg-[#111827]" : "border-slate-200 bg-slate-50")}>
                  <div className="flex flex-wrap items-center gap-2">
                    <p className={cn("text-[12px] font-medium", isDarkMode ? "text-slate-400" : "text-slate-500")}>Período</p>
                    {(["24h", "7d", "30d"] as WindowRange[]).map((range) => (
                      <button
                        key={range}
                        onClick={() => setInboxFilters((prev) => ({ ...prev, period: range }))}
                        className={cn(
                          "h-7 rounded-full border px-3 text-[11px] font-medium",
                          inboxFilters.period === range
                            ? "border-[#0E9384] bg-mint-600 text-white"
                            : isDarkMode
                              ? "border-[#374151] bg-[#0F172A] text-slate-400 hover:bg-[#1F2937]"
                              : "border-slate-200 bg-white text-slate-500 hover:bg-slate-50",
                        )}
                      >
                        {range}
                      </button>
                    ))}
                    <button
                      onClick={() => setFiltersOpen((prev) => !prev)}
                      className={cn(
                        "ml-auto rounded-lg border px-3 py-1.5 text-[12px] font-medium",
                        isDarkMode ? "border-[#374151] bg-[#0F172A] text-[#D1D5DB] hover:bg-[#1F2937]" : "border-slate-300 bg-white text-slate-600 hover:bg-slate-50",
                      )}
                    >
                      {showFiltersCount ? `Filtros (${advancedFiltersCount})` : "Filtros"}
                    </button>
                  </div>

                  <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-[12px]">
                    <p className={cn(isDarkMode ? "text-slate-400" : "text-slate-500")}>
                      {inboxRows.length} atualizações · ordenado por {orderLabel}
                    </p>
                    <p className={cn(isDarkMode ? "text-slate-400" : "text-slate-500")}>Última leitura sincronizada {refreshLabel}</p>
                  </div>

                  {refreshError && <p className="mt-2 text-[12px] font-medium text-[#B42318]">{refreshError}</p>}

                  {filtersOpen && (
                    <div className={cn("mt-3 space-y-2 rounded-lg border p-3", isDarkMode ? "border-[#374151] bg-[#0F172A]" : "border-slate-200 bg-white")}>
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-[12px] font-medium text-slate-500">Severidade</p>
                        {allStatuses.map((status) => (
                          <button
                            key={status}
                            onClick={() => setInboxFilters((prev) => ({ ...prev, severities: toggleInArray(prev.severities, status) }))}
                            className={cn(
                              "h-7 rounded-full border px-3 text-[11px] font-medium",
                              activeSeverities.includes(status)
                                ? "border-[#0E9384] bg-mint-50 text-mint-600"
                                : "border-slate-200 bg-white text-slate-500 hover:bg-slate-50",
                            )}
                          >
                            {status}
                          </button>
                        ))}
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-[12px] font-medium text-slate-500">Pilar</p>
                        {allPillars.map((pillar) => (
                          <button
                            key={pillar}
                            onClick={() => setInboxFilters((prev) => ({ ...prev, pillars: toggleInArray(prev.pillars, pillar) }))}
                            className={cn(
                              "h-7 rounded-full border px-3 text-[11px] font-medium",
                              activePillars.includes(pillar)
                                ? "border-[#0E9384] bg-mint-50 text-mint-600"
                                : "border-slate-200 bg-white text-slate-500 hover:bg-slate-50",
                            )}
                          >
                            {pillar}
                          </button>
                        ))}
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-[12px] font-medium text-slate-500">Fonte</p>
                        {allSources.map((source) => (
                          <button
                            key={source}
                            onClick={() => setInboxFilters((prev) => ({ ...prev, sources: toggleInArray(prev.sources, source) }))}
                            className={cn(
                              "h-7 rounded-full border px-3 text-[11px] font-medium",
                              activeSources.includes(source)
                                ? "border-[#0E9384] bg-mint-50 text-mint-600"
                                : "border-slate-200 bg-white text-slate-500 hover:bg-slate-50",
                            )}
                          >
                            {source}
                          </button>
                        ))}
                      </div>

                      <div className="flex justify-end">
                        <button onClick={clearInboxFilters} className="text-[12px] font-semibold text-mint-600 hover:text-mint-700">
                          Limpar
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </CardHeader>

              <CardContent className="space-y-2 px-4 pb-4">
                {hasAnyFilterOverride && (
                  <div className={cn("rounded-xl border px-3 py-2", isDarkMode ? "border-[#374151] bg-[#111827]" : "border-slate-200 bg-slate-50")}>
                    <div className="flex flex-wrap items-center gap-2">
                      {activeFilterChips.map((chip) => (
                        <span key={chip} className={cn("inline-flex h-[22px] items-center rounded-full border px-2 text-[11px]", isDarkMode ? "border-[#475467] bg-[#0F172A] text-[#CBD5E1]" : "border-slate-200 bg-white text-slate-600")}>
                          {chip}
                        </span>
                      ))}
                      <button onClick={clearInboxFilters} className="ml-auto text-[12px] font-semibold text-mint-600 hover:text-mint-700">
                        Limpar filtros
                      </button>
                    </div>
                  </div>
                )}

                {isLoading ? (
                  <div className="space-y-2">
                    {[1, 2, 3, 4].map((item) => (
                      <div key={item} className="h-16 animate-pulse rounded-xl border border-slate-200 bg-slate-50" />
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
                  <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-4">
                    <p className="text-[14px] text-slate-500">Nenhuma atualização relevante no período.</p>
                    <button
                      onClick={() => setInboxFilters((prev) => ({ ...prev, period: "7d" }))}
                      className="mt-2 text-[12px] font-medium text-mint-600 hover:text-mint-700"
                    >
                      Ampliar para 7 dias
                    </button>
                  </div>
                ) : (
                  <>
                    {inboxMode === "top-impacto" && priorityItem && (
                      <div className={cn("rounded-xl border px-3 py-2", isDarkMode ? "border-[#134E48] bg-[#0F2B2A]" : "border-mint-200 bg-mint-50")}>
                        <p className={cn("text-[12px] font-semibold", isDarkMode ? "text-[#99F6E4]" : "text-mint-700")}>
                          Comece por aqui: {priorityItem.ticker}
                          {priorityItem.pillarKey ? ` em ${priorityItem.pillarKey}` : ""}
                        </p>
                      </div>
                    )}
                    {inboxRows.map((item, index) => {
                      const isNew = (newBadgeUntil[item.id] ?? 0) > Date.now();
                      const isPriority = index === 0 && inboxMode === "top-impacto";
                      const sectionLabel = feedSectionLabel(item, index);
                      const isStablePositive = sectionLabel === "Estaveis e positivos";
                      return (
                        <button
                          key={item.id}
                        onClick={() => openInboxItem(item)}
                        className={cn(
                          "w-full cursor-default rounded-xl border border-transparent text-left transition hover:border-slate-300 hover:bg-slate-100 hover:shadow-[inset_3px_0_0_#0E9384]",
                          isStablePositive ? "p-1.5" : "p-3",
                          isNew && (isDarkMode ? "border-[#1D4ED8] bg-[#0F172A]" : "border-[#B2DDFF] bg-[#F0F9FF]"),
                          isPriority && (isDarkMode ? "border-mint-500/40 bg-[#0F2B2A] hover:bg-[#0F3A39] hover:border-mint-500/60" : "border-mint-200 bg-mint-50 hover:bg-[#ECFDF9] hover:border-[#6ED4C7]"),
                        )}
                      >
                        <div className={cn("flex items-start justify-between", isStablePositive ? "gap-1" : "gap-3")}>
                            <div className={cn("flex min-w-0 flex-1 items-start", isStablePositive ? "gap-1.5" : "gap-2.5")}>
                              <Avatar className={cn("rounded-md", isStablePositive ? "h-6 w-6" : "h-8 w-8")}>
                                <AvatarImage src={logoByTicker[item.ticker]} alt={item.ticker} className="object-cover" />
                                <AvatarFallback className="rounded-md text-[10px]">{item.ticker.slice(0, 2)}</AvatarFallback>
                              </Avatar>
                              <div className="min-w-0">
                                {isPriority && (
                                  <span className={cn("mb-1 inline-flex h-[22px] items-center rounded-full border px-2 text-[10px] font-semibold uppercase tracking-[0.04em]", isDarkMode ? "border-[#2DD4BF]/40 bg-[#134E48] text-[#CCFBF1]" : "border-mint-200 bg-mint-50 text-mint-700")}>
                                    Comece por aqui
                                  </span>
                                )}
                                {!isPriority && !isStablePositive && (
                                  <span className={cn("mb-1 inline-flex h-[20px] items-center rounded-full border px-2 text-[10px] font-semibold uppercase tracking-[0.04em]", isDarkMode ? "border-[#334155] bg-[#111827] text-slate-300" : "border-slate-200 bg-slate-50 text-slate-600")}>
                                    {sectionLabel}
                                  </span>
                                )}
                                <p className={cn("truncate font-semibold", isStablePositive ? "text-[12px]" : "text-[13px]", isDarkMode ? "text-slate-300" : "text-slate-700")}>
                                  {isStablePositive ? item.ticker : `${item.ticker} · ${item.companyName}`}
                                </p>
                                <p className={cn(isStablePositive ? "text-[12px]" : "text-[14px]", "truncate font-semibold", isDarkMode ? "text-slate-100" : "text-slate-900")}>{item.title}</p>
                                {!isStablePositive && (
                                  <p className={cn("mt-1 line-clamp-1 text-[12px]", isDarkMode ? "text-slate-400" : "text-slate-600")}>Por que isso importa: {item.whyItMatters}</p>
                                )}
                                <div className={cn("flex flex-wrap gap-1", isStablePositive ? "mt-0" : "mt-1")}>
                                  {item.pillarKey && (
                                    <span className={cn("inline-flex h-[22px] items-center rounded-full border px-2 text-[11px]", isDarkMode ? "border-[#374151] bg-[#111827] text-slate-300" : "border-slate-200 bg-slate-50 text-slate-600")}>
                                      {item.pillarKey}
                                    </span>
                                  )}
                                  {item.source && (
                                    <span className={cn("inline-flex h-[22px] items-center rounded-full border px-2 text-[11px]", isDarkMode ? "border-[#374151] bg-[#111827] text-slate-300" : "border-slate-200 bg-slate-50 text-slate-600")}>
                                      {item.source}
                                    </span>
                                  )}
                                  <span className={cn("inline-flex h-[22px] items-center rounded-full border px-2 text-[11px]", isDarkMode ? "border-[#374151] bg-[#111827] text-slate-300" : "border-slate-200 bg-slate-50 text-slate-600")}>
                                    {item.relativeTime}
                                  </span>
                                  {isNew && <span className="inline-flex h-[22px] items-center rounded-full border border-sky-300 bg-sky-100 px-2 text-[11px] font-semibold text-sky-900">Novo</span>}
                                </div>
                              </div>
                            </div>

                            <div className="flex shrink-0 flex-col items-end gap-1.5">
                              {!isStablePositive && <StatusBadge status={item.severity} />}
                              <div className="flex items-center gap-1.5">
                                <span className={cn("font-semibold text-mint-600", isStablePositive ? "text-[11px]" : "text-[12px]")}>{feedCtaLabel(item, isPriority)}</span>
                                <ChevronRight className={cn("h-4 w-4", isDarkMode ? "text-slate-500" : "text-slate-400")} />
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

          </section>

          <section className="grid items-start gap-4 xl:grid-cols-[minmax(0,1.6fr)_minmax(300px,0.8fr)]">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className={cn("text-[14px] font-semibold", isDarkMode ? "text-slate-300" : "text-slate-700")}>Blocos de apoio</h2>
                <p className={cn("text-[12px]", isDarkMode ? "text-slate-500" : "text-slate-500")}>Apoiam a leitura, mas nao substituem o fluxo principal.</p>
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                {supportCards.map((card) => (
                  <button
                    key={card.title}
                    onClick={card.action}
                    className={cn(
                      "group rounded-2xl border p-3 text-left transition-all duration-150",
                      isDarkMode
                        ? "border-[#1F2937] bg-[#0F172A] hover:border-[#334155] hover:shadow-[0_2px_10px_rgba(0,0,0,0.25)]"
                        : "border-slate-200 bg-white hover:border-slate-300 hover:shadow-[0_2px_10px_rgba(16,24,40,0.05)]",
                    )}
                  >
                    <p className={cn("mb-2 text-[11px] font-medium", isDarkMode ? "text-slate-400" : "text-slate-500")}>{card.title}</p>
                    <div className="flex min-h-[36px] items-center gap-2">
                      {card.logoTicker && logoByTicker[card.logoTicker] ? (
                        <Avatar className="h-7 w-7 rounded-md">
                          <AvatarImage src={logoByTicker[card.logoTicker]} alt={card.logoTicker} className="object-cover" />
                          <AvatarFallback className="rounded-md text-[10px]">{card.logoTicker.slice(0, 2)}</AvatarFallback>
                        </Avatar>
                      ) : null}
                      <p className={cn("text-[16px] font-semibold", isDarkMode ? "text-[#F3F4F6]" : "text-slate-900")}>{card.value}</p>
                    </div>
                    <p className={cn("mt-1.5 line-clamp-2 min-h-[34px] text-[12px] leading-snug", isDarkMode ? "text-[#CBD5E1]" : "text-slate-700")}>{card.subtitle}</p>
                    <p className={cn("mt-2.5 rounded-lg border px-2.5 py-1.5 text-[11px] font-medium", card.accent)}>{card.delta}</p>
                    <div className="mt-2.5 flex items-center justify-between">
                      <span className="text-[12px] font-semibold text-mint-600">{card.ctaLabel}</span>
                      <ChevronRight className={cn("h-4 w-4", isDarkMode ? "text-[#94A3B8]" : "text-slate-400")} />
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <Card className={cn("rounded-2xl border", isDarkMode ? "border-[#1F2937] bg-[#0B1220]" : "border-slate-200 bg-white")}>
              <CardHeader className="space-y-1 px-4 pt-4">
                <CardTitle className={cn("text-[14px] font-semibold", isDarkMode ? "text-[#E5E7EB]" : "text-slate-800")}>Pilares em movimento</CardTitle>
                <CardDescription className={cn("text-[12px]", isDarkMode ? "text-slate-500" : "text-slate-500")}>
                  Apoio de leitura. Use depois da prioridade e do feed principal.
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-1 px-4 pb-3">
                {isLoading ? (
                  <div className="space-y-2">
                    {[1, 2].map((item) => (
                      <div key={item} className="h-12 animate-pulse rounded-xl border border-slate-200 bg-slate-50" />
                    ))}
                  </div>
                ) : (
                  visiblePillarMovements.map((item, idx) => (
                    <button
                      key={item.pillar}
                      onClick={() => applySinglePillarFilter(item.pillar)}
                      className={cn(
                        "w-full rounded-xl border border-transparent p-2 text-left transition",
                        isDarkMode ? "hover:border-[#334155] hover:bg-[#111827]" : "hover:border-slate-200 hover:bg-slate-50",
                        idx > 0 && "border-t border-t-[#F2F4F7]",
                      )}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="min-w-0">
                          <p className={cn("text-[13px] font-medium", isDarkMode ? "text-slate-200" : "text-slate-900")}>{item.pillar}</p>
                          <p className={cn("mt-0.5 text-[11px]", isDarkMode ? "text-slate-400" : "text-slate-600")}>{item.pillar} {pillarInsight[item.pillar]}.</p>
                          <div className="mt-1.5">
                            <SegmentedHealthBar healthy={item.healthy} attention={item.attention} risk={item.risk} />
                            <div className="mt-1 flex flex-wrap items-center gap-3 text-[10px]">
                              <span className={cn(isDarkMode ? "text-slate-500" : "text-slate-500")}>{item.events} eventos</span>
                              <span className="text-rose-600">Risco {item.risk}</span>
                              <span className="text-amber-600">Atenção {item.attention}</span>
                              <span className="text-emerald-600">Saudável {item.healthy}</span>
                            </div>
                          </div>
                        </div>
                        <ChevronRight className={cn("h-4 w-4", isDarkMode ? "text-slate-500" : "text-slate-400")} />
                      </div>
                    </button>
                  ))
                )}
              </CardContent>

              <CardFooter className={cn("flex items-center justify-between border-t px-4 py-3", isDarkMode ? "border-[#1F2937]" : "border-[#F2F4F7]")}>
                <p className={cn("text-[11px]", isDarkMode ? "text-slate-500" : "text-slate-500")}>Fontes: CVM / B3 / RI</p>
                <button onClick={() => applySinglePillarFilter(focusedPillar)} className="text-[12px] font-semibold text-mint-600 hover:text-mint-700">
                  Filtrar pilar
                </button>
              </CardFooter>
            </Card>
          </section>

          {showSessionClosing && (
            <section>
              <Card className={cn("rounded-2xl border", isDarkMode ? "border-[#1F2937] bg-[#0B1220]" : "border-slate-200 bg-white")}>
                <CardContent className="space-y-2 p-4">
                  <p className={cn("text-[12px] font-semibold uppercase tracking-[0.08em]", isDarkMode ? "text-[#5EEAD4]" : "text-mint-600")}>Fechamento da sessao</p>
                  <p className={cn("text-[14px] font-semibold", isDarkMode ? "text-[#F3F4F6]" : "text-slate-900")}>
                    {priorityItem
                      ? `Nas proximas horas, acompanhe ${priorityItem.ticker} e os sinais em ${leadingPillarMovement.pillar} para confirmar se a pressao persiste.`
                      : `O pilar ${leadingPillarMovement.pillar} segue como principal frente de monitoramento nas proximas horas.`}
                  </p>
                  <p className={cn("text-[12px]", isDarkMode ? "text-slate-400" : "text-slate-500")}>Reveja o feed por impacto antes de encerrar sua leitura.</p>
                </CardContent>
              </Card>
            </section>
          )}
        </main>
      </div>
    </div>
  );
}

export default Dashboard;






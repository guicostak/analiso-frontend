import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowDown,
  ArrowRightLeft,
  ArrowUp,
  Bell,
  Bookmark,
  Check,
  ChevronDown,
  ChevronUp,
  Crown,
  FileText,
  Minus,
  Plus,
  Search,
  Share2,
  TriangleAlert,
  X,
} from "lucide-react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceArea,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Sidebar } from "./dashboard/sidebar";
import { TopBar } from "./dashboard/top-bar";
import wegLogo from "../assets/logos/weg.jpeg";
import valeLogo from "../assets/logos/vale.png";

type Pillar = "Divida" | "CaixaFCF" | "Margens" | "Retorno" | "Proventos";
type Trend = "melhorando" | "estavel" | "piorando";
type Status = "Saudavel" | "Atencao" | "Risco";
type RangeKey = "5a" | "10a" | "max";
type Source = {
  provider: "CVM" | "B3" | "RI";
  document: string;
  updatedAt: string;
  method: string;
  link: string;
  reference?: string;
};
type Point = { year: number; value: number };
type Metric = {
  name: string;
  definition: string;
  unit: string;
  direction: "higher-better" | "lower-better";
  value: number | null;
  trend: Trend;
  source: Source;
};
type PillarData = {
  score: number;
  status: Status;
  thresholdLabel: string;
  domain: [number, number];
  bands: { safe: [number, number]; warning: [number, number]; risk: [number, number] };
  series: Point[];
  metrics: Metric[];
};
type Company = {
  ticker: string;
  name: string;
  sector: string;
  updatedAt: string;
  primarySource: string;
  confidence: "Alta" | "Media" | "Baixa";
  gaps: string[];
  pillars: Record<Pillar, PillarData>;
};
type EventItem = {
  id: string;
  ticker: string;
  date: string;
  type: string;
  summary: string;
  impact: Pillar;
  source: Source;
};
type Evidence = {
  metricName: string;
  definition: string;
  unit: string;
  source: Source;
  aTicker: string;
  bTicker: string;
  aValue: number | null;
  bValue: number | null;
};

const TOKENS = {
  brand600: "#0E9384",
  brand700: "#0B7A6E",
  brand100: "#D9FBEF",
  bg: "#F7F8FA",
  border: "#E7EAEE",
  text900: "#0F172A",
  text600: "#475569",
  text400: "#94A3B8",
  companyA: "#0E9384",
  companyB: "#3F5F7D",
  companyB100: "#ECF3F9",
};

const SLOT_COLORS = [TOKENS.companyA, TOKENS.companyB, "#64748B", "#94A3B8"];
const PILLARS: Pillar[] = ["Divida", "CaixaFCF", "Margens", "Retorno", "Proventos"];
const PILLAR_LABEL: Record<Pillar, string> = {
  Divida: "Divida",
  CaixaFCF: "Caixa/FCF",
  Margens: "Margens",
  Retorno: "Retorno",
  Proventos: "Proventos",
};

const trendLabel: Record<Trend, string> = {
  melhorando: "Melhorando",
  estavel: "Estavel",
  piorando: "Piorando",
};
const RANGES: Array<{ key: RangeKey; label: string; years: number | null }> = [
  { key: "5a", label: "5 anos", years: 5 },
  { key: "10a", label: "10 anos", years: 10 },
  { key: "max", label: "Max", years: null },
];
const pillarCopy: Record<Pillar, { what: string; how: string; why: string; ranges: [string, string, string] }> = {
  Divida: {
    what: "Mede pressao de alavancagem.",
    how: "Menor e mais estavel tende a ser melhor.",
    why: "Reduz risco de estresse financeiro.",
    ranges: ["< 1,5x confortavel", "1,5-2,2x atencao", "> 2,2x risco"],
  },
  CaixaFCF: {
    what: "Mede geracao de caixa livre.",
    how: "Maior e menos volatil tende a ser melhor.",
    why: "Sustenta execucao e investimento.",
    ranges: ["> 10% saudavel", "6%-10% atencao", "< 6% risco"],
  },
  Margens: {
    what: "Mede eficiencia operacional.",
    how: "Margens altas e estaveis sao melhores.",
    why: "Preserva resultado em ciclos ruins.",
    ranges: ["> 18% saudavel", "14%-18% atencao", "< 14% risco"],
  },
  Retorno: {
    what: "Mede retorno sobre capital.",
    how: "Retorno maior com boa tendencia e melhor.",
    why: "Mostra qualidade estrutural.",
    ranges: ["> 14% forte", "10%-14% atencao", "< 10% fraco"],
  },
  Proventos: {
    what: "Mede consistencia de distribuicao.",
    how: "Consistencia vale mais que pico.",
    why: "Aumenta previsibilidade ao acionista.",
    ranges: ["Payout 35%-60% saudavel", "< 35% atencao", "> 60% atencao"],
  },
};

const n = (value: number, digits = 1) =>
  new Intl.NumberFormat("pt-BR", { minimumFractionDigits: digits, maximumFractionDigits: digits }).format(value);
const parseDate = (value: string) => {
  const [dd, mm, yyyy] = value.split("/").map(Number);
  return new Date(yyyy, mm - 1, dd).getTime();
};
const buildSeries = (list: number[]) => list.map((value, i) => ({ year: 2021 + i, value }));
const mkSource = (
  provider: "CVM" | "B3" | "RI",
  document: string,
  updatedAt: string,
  link: string,
  reference?: string,
): Source => ({
  provider,
  document,
  updatedAt,
  link,
  reference,
  method: "Padronizacao de metricas a partir de documentos oficiais.",
});

const weg: Company = {
  ticker: "WEGE3",
  name: "WEG",
  sector: "Industria",
  updatedAt: "06/02/2026",
  primarySource: "CVM / B3 / RI",
  confidence: "Alta",
  gaps: [],
  pillars: {
    Divida: {
      score: 8.4,
      status: "Saudavel",
      thresholdLabel: "Quanto menor, melhor.",
      domain: [0, 3],
      bands: { safe: [0, 1.5], warning: [1.5, 2.2], risk: [2.2, 3] },
      series: buildSeries([1.1, 1.0, 0.9, 0.9, 0.8]),
      metrics: [
        { name: "Divida liquida/EBITDA", definition: "Anos de EBITDA para quitar divida.", unit: "x", direction: "lower-better", value: 0.8, trend: "estavel", source: mkSource("CVM", "DFP 2025", "06/02/2026", "https://www.cvm.gov.br/") },
        { name: "Cobertura de juros", definition: "EBIT sobre despesa financeira.", unit: "x", direction: "higher-better", value: 8.4, trend: "melhorando", source: mkSource("CVM", "DFP 2025", "06/02/2026", "https://www.cvm.gov.br/") },
      ],
    },
    CaixaFCF: {
      score: 8.6,
      status: "Saudavel",
      thresholdLabel: "Quanto maior, melhor.",
      domain: [0, 20],
      bands: { safe: [10, 20], warning: [6, 10], risk: [0, 6] },
      series: buildSeries([10.1, 10.9, 11.5, 12.2, 12.8]),
      metrics: [
        { name: "FCF/Receita", definition: "Receita convertida em caixa livre.", unit: "%", direction: "higher-better", value: 12.8, trend: "melhorando", source: mkSource("RI", "Release 4T25", "06/02/2026", "https://ri.weg.net/") },
        { name: "Capex/FCF", definition: "Investimento sobre caixa livre.", unit: "x", direction: "lower-better", value: 0.52, trend: "estavel", source: mkSource("RI", "Release 4T25", "06/02/2026", "https://ri.weg.net/") },
      ],
    },
    Margens: {
      score: 7.8,
      status: "Saudavel",
      thresholdLabel: "Quanto maior, melhor.",
      domain: [8, 30],
      bands: { safe: [18, 30], warning: [14, 18], risk: [8, 14] },
      series: buildSeries([19, 19.4, 19.8, 20, 20.1]),
      metrics: [
        { name: "Margem EBITDA", definition: "EBITDA/Receita.", unit: "%", direction: "higher-better", value: 20.1, trend: "estavel", source: mkSource("CVM", "ITR 4T25", "06/02/2026", "https://www.cvm.gov.br/") },
        { name: "Margem liquida", definition: "Lucro liquido/Receita.", unit: "%", direction: "higher-better", value: 14.9, trend: "estavel", source: mkSource("CVM", "ITR 4T25", "06/02/2026", "https://www.cvm.gov.br/") },
      ],
    },
    Retorno: {
      score: 8.2,
      status: "Saudavel",
      thresholdLabel: "Quanto maior, melhor.",
      domain: [5, 24],
      bands: { safe: [14, 24], warning: [10, 14], risk: [5, 10] },
      series: buildSeries([14.2, 14.9, 15.5, 16.1, 16.5]),
      metrics: [
        { name: "ROIC", definition: "Retorno sobre capital investido.", unit: "%", direction: "higher-better", value: 16.5, trend: "melhorando", source: mkSource("CVM", "DFP 2025", "06/02/2026", "https://www.cvm.gov.br/") },
        { name: "ROE", definition: "Retorno sobre patrimonio.", unit: "%", direction: "higher-better", value: 23.2, trend: "melhorando", source: mkSource("CVM", "DFP 2025", "06/02/2026", "https://www.cvm.gov.br/") },
      ],
    },
    Proventos: {
      score: 6.9,
      status: "Atencao",
      thresholdLabel: "Faixa saudavel: 35% a 60%.",
      domain: [10, 90],
      bands: { safe: [35, 60], warning: [25, 35], risk: [10, 25] },
      series: buildSeries([39, 41, 43, 45, 44]),
      metrics: [
        { name: "Payout", definition: "Lucro distribuido.", unit: "%", direction: "higher-better", value: 44, trend: "estavel", source: mkSource("RI", "Politica 2025", "05/02/2026", "https://ri.weg.net/") },
        { name: "Dividend Yield", definition: "Provento/Preco.", unit: "%", direction: "higher-better", value: 2.3, trend: "estavel", source: mkSource("B3", "Historico", "05/02/2026", "https://www.b3.com.br/") },
      ],
    },
  },
};

const vale: Company = {
  ticker: "VALE3",
  name: "Vale",
  sector: "Mineracao",
  updatedAt: "05/02/2026",
  primarySource: "CVM / B3 / RI",
  confidence: "Media",
  gaps: ["Sem guidance trimestral de prazo medio da divida em 2025."],
  pillars: {
    Divida: { ...weg.pillars.Divida, score: 6.1, status: "Atencao", series: buildSeries([1.2, 1.3, 1.4, 1.6, 1.7]), metrics: [{ ...weg.pillars.Divida.metrics[0], value: 1.7, trend: "piorando", source: mkSource("CVM", "DFP 2024", "05/02/2026", "https://www.cvm.gov.br/") }, { ...weg.pillars.Divida.metrics[1], value: 4.8, trend: "estavel", source: mkSource("CVM", "DFP 2024", "05/02/2026", "https://www.cvm.gov.br/") }] },
    CaixaFCF: { ...weg.pillars.CaixaFCF, score: 5.9, status: "Atencao", series: buildSeries([10.8, 9.7, 8.8, 7.8, 7.2]), metrics: [{ ...weg.pillars.CaixaFCF.metrics[0], value: 7.2, trend: "piorando", source: mkSource("RI", "Release 4T24", "05/02/2026", "https://ri.vale.com/") }, { ...weg.pillars.CaixaFCF.metrics[1], value: 1.12, trend: "piorando", source: mkSource("RI", "Release 4T24", "05/02/2026", "https://ri.vale.com/") }] },
    Margens: { ...weg.pillars.Margens, score: 6.5, status: "Atencao", series: buildSeries([26.2, 25.8, 24.9, 23.9, 23.4]), metrics: [{ ...weg.pillars.Margens.metrics[0], value: 23.4, source: mkSource("CVM", "ITR 4T24", "05/02/2026", "https://www.cvm.gov.br/") }, { ...weg.pillars.Margens.metrics[1], value: 14.1, trend: "piorando", source: mkSource("CVM", "ITR 4T24", "05/02/2026", "https://www.cvm.gov.br/") }] },
    Retorno: { ...weg.pillars.Retorno, score: 6.6, status: "Atencao", series: buildSeries([13.1, 12.8, 12.4, 12.1, 11.8]), metrics: [{ ...weg.pillars.Retorno.metrics[0], value: 11.8, trend: "estavel", source: mkSource("CVM", "DFP 2024", "05/02/2026", "https://www.cvm.gov.br/") }, { ...weg.pillars.Retorno.metrics[1], value: null, trend: "estavel", source: mkSource("CVM", "DFP 2024", "05/02/2026", "https://www.cvm.gov.br/", "Campo nao reportado no consolidado.") }] },
    Proventos: { ...weg.pillars.Proventos, score: 7.1, status: "Saudavel", series: buildSeries([41, 44, 47, 50, 52]), metrics: [{ ...weg.pillars.Proventos.metrics[0], value: 52, trend: "melhorando", source: mkSource("RI", "Politica 2024", "05/02/2026", "https://ri.vale.com/") }, { ...weg.pillars.Proventos.metrics[1], value: 7.2, source: mkSource("B3", "Historico", "05/02/2026", "https://www.b3.com.br/") }] },
  },
};

const itub: Company = {
  ticker: "ITUB4",
  name: "Itau Unibanco",
  sector: "Bancos",
  updatedAt: "07/02/2026",
  primarySource: "CVM / B3 / RI",
  confidence: "Alta",
  gaps: [],
  pillars: {
    Divida: { ...weg.pillars.Divida, score: 7.5 },
    CaixaFCF: { ...weg.pillars.CaixaFCF, score: 7.3 },
    Margens: { ...weg.pillars.Margens, score: 7.2 },
    Retorno: { ...weg.pillars.Retorno, score: 8.1 },
    Proventos: { ...weg.pillars.Proventos, score: 7.8 },
  },
};

const companies: Company[] = [weg, vale, itub];
const events: EventItem[] = [
  { id: "1", ticker: "VALE3", date: "24/01/2026", type: "Fato relevante", summary: "Atualizacao de capex com pressao de caixa no curto prazo.", impact: "CaixaFCF", source: mkSource("B3", "Fato relevante 24-01", "24/01/2026", "https://www.b3.com.br/") },
  { id: "2", ticker: "WEGE3", date: "30/01/2026", type: "Resultado", summary: "Resultado trimestral com margem operacional estavel.", impact: "Margens", source: mkSource("RI", "Release 4T25", "30/01/2026", "https://ri.weg.net/") },
  { id: "3", ticker: "VALE3", date: "17/12/2025", type: "Emissao", summary: "Captacao para refinanciamento de curto prazo.", impact: "Divida", source: mkSource("CVM", "Comunicado de emissao", "17/12/2025", "https://www.cvm.gov.br/") },
];

const formatMetric = (value: number | null, unit: string) => (value === null ? "Dados indisponiveis" : `${n(value, unit === "x" ? 2 : 1)} ${unit}`);
const metricDelta = (a: number | null, b: number | null) => (a === null || b === null ? null : Math.abs(a - b));
const metricWinner = (direction: "higher-better" | "lower-better", a: number | null, b: number | null) => {
  if (a === null && b === null) return "tie";
  if (a === null) return "b";
  if (b === null) return "a";
  if (direction === "higher-better") return a > b ? "a" : b > a ? "b" : "tie";
  return a < b ? "a" : b < a ? "b" : "tie";
};
const trendIcon = (t: Trend) => (t === "melhorando" ? <ArrowUp className="h-3 w-3" /> : t === "piorando" ? <ArrowDown className="h-3 w-3" /> : <Minus className="h-3 w-3" />);
const trendFromSeries = (series: Point[]): Trend => {
  if (!series.length) return "estavel";
  const first = series[0]?.value ?? 0;
  const last = series[series.length - 1]?.value ?? 0;
  const delta = last - first;
  if (Math.abs(delta) <= Math.max(0.2, Math.abs(first) * 0.03)) return "estavel";
  return delta > 0 ? "melhorando" : "piorando";
};
const confidenceLabel = (pair: Company[]) => {
  if (pair.every((c) => c.confidence === "Alta")) return "Alta";
  if (pair.some((c) => c.confidence === "Baixa")) return "Baixa";
  return "Media";
};
const pillarInsight = (pillar: Pillar, winner: string) => {
  if (pillar === "CaixaFCF") return `${winner} converte melhor resultado em caixa e sustenta execucao com mais folga.`;
  if (pillar === "Divida") return `${winner} opera com alavancagem mais controlada no periodo.`;
  if (pillar === "Margens") return `${winner} preserva eficiencia operacional com mais consistencia.`;
  if (pillar === "Retorno") return `${winner} extrai mais resultado do capital investido.`;
  return `${winner} mostra distribuicao mais previsivel para o acionista.`;
};
const trendContext = (trend: Trend) => {
  if (trend === "melhorando") return "Tendencia recente reforca a leitura";
  if (trend === "piorando") return "Tendencia recente pede cautela";
  return "Tendencia recente esta estavel";
};
const trendNarrative = (trend: Trend, ticker: string) => {
  if (trend === "melhorando") return `${ticker} ganhou tracao recente`;
  if (trend === "piorando") return `${ticker} perdeu tracao recente`;
  return `${ticker} ficou estavel no periodo`;
};
const summarizeWinners = (items: Array<{ p: Pillar; winner: Company }>) => {
  const bucket = new Map<string, Pillar[]>();
  items.forEach((item) => {
    const current = bucket.get(item.winner.ticker) ?? [];
    current.push(item.p);
    bucket.set(item.winner.ticker, current);
  });
  const leader = [...bucket.entries()].sort((x, y) => y[1].length - x[1].length)[0];
  if (!leader) return "";
  const [ticker, pillars] = leader;
  const labels = pillars.slice(0, 3).map((p) => PILLAR_LABEL[p]);
  return `${ticker} abre vantagem em ${labels.join(", ")}.`;
};
const pillarConsequence = (pillar: Pillar, delta: number, winner: string) => {
  const intensity = delta >= 1.5 ? "diferenca relevante" : delta >= 0.8 ? "diferenca moderada" : "diferenca pequena";
  if (pillar === "Divida") return `${intensity}: ${winner} opera com menor pressao financeira hoje.`;
  if (pillar === "CaixaFCF") return `${intensity}: ${winner} tem mais folga para investir sem estresse de caixa.`;
  if (pillar === "Margens") return `${intensity}: ${winner} sustenta melhor eficiencia operacional no ciclo atual.`;
  if (pillar === "Retorno") return `${intensity}: ${winner} converte capital em resultado com mais consistencia.`;
  return `${intensity}: ${winner} mostra previsibilidade maior na distribuicao ao acionista.`;
};
const evidenceReadLabel = (delta: number | null) => {
  if (delta === null) return "Dados insuficientes";
  if (delta >= 3) return "Vantagem clara";
  if (delta >= 1.2) return "Vantagem relevante";
  if (delta >= 0.5) return "Vantagem leve";
  return "Diferenca pequena";
};
const TICKER_LOGOS: Record<string, string> = {
  WEGE3: wegLogo,
  VALE3: valeLogo,
};

function TickerLogo({ ticker, size = 18 }: { ticker: string; size?: number }) {
  const logo = TICKER_LOGOS[ticker];
  if (!logo) {
    return (
      <span
        className="inline-flex items-center justify-center rounded-full border border-[#E7EAEE] bg-white text-[10px] font-semibold text-[#475569]"
        style={{ width: size, height: size }}
      >
        {ticker.slice(0, 1)}
      </span>
    );
  }
  return (
    <img
      src={logo}
      alt={`Logo ${ticker}`}
      className="rounded-full border border-[#E7EAEE] bg-white object-cover"
      style={{ width: size, height: size }}
    />
  );
}

function EvidenceDrawer({ data, onClose }: { data: Evidence | null; onClose: () => void }) {
  if (!data) return null;
  return (
    <div className="fixed inset-0 z-50">
      <button onClick={onClose} className="absolute inset-0 bg-black/30" />
      <aside className="absolute inset-y-0 right-0 w-full max-w-[460px] overflow-y-auto border-l border-[#E7EAEE] bg-white p-6 shadow-2xl">
        <div className="mb-6 flex items-start justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.08em] text-[#94A3B8]">Evidence drawer</p>
            <h3 className="mt-1 text-lg font-semibold text-[#0F172A]">{data.metricName}</h3>
          </div>
          <button onClick={onClose} className="rounded-full border border-[#E7EAEE] p-1.5 text-[#475569]">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="space-y-4 text-sm">
          <div className="rounded-xl border border-[#E7EAEE] bg-[#F8FAFC] p-4">
            <p className="text-[12px] font-semibold text-[#475569]">Valor atual A/B</p>
            <div className="mt-2 grid grid-cols-2 gap-3">
              <div>
                <p className="text-xs text-[#475569]">{data.aTicker}</p>
                <p className="font-semibold">{formatMetric(data.aValue, data.unit)}</p>
              </div>
              <div>
                <p className="text-xs text-[#475569]">{data.bTicker}</p>
                <p className="font-semibold">{formatMetric(data.bValue, data.unit)}</p>
              </div>
            </div>
          </div>
          <div>
            <p className="text-[12px] font-semibold text-[#475569]">Definicao simples</p>
            <p className="mt-1 text-[#0F172A]">{data.definition}</p>
          </div>
          <div>
            <p className="text-[12px] font-semibold text-[#475569]">Como calculamos</p>
            <p className="mt-1 text-[#0F172A]">{data.source.method}</p>
          </div>
          <div>
            <p className="text-[12px] font-semibold text-[#475569]">Fonte</p>
            <p className="mt-1 text-[#0F172A]">
              {data.source.provider} / {data.source.document}
            </p>
          </div>
          <div>
            <p className="text-[12px] font-semibold text-[#475569]">Data de atualizacao</p>
            <p className="mt-1 text-[#0F172A]">{data.source.updatedAt}</p>
          </div>
          {data.source.reference ? (
            <div>
              <p className="text-[12px] font-semibold text-[#475569]">Trecho/identificador</p>
              <p className="mt-1 text-[#0F172A]">{data.source.reference}</p>
            </div>
          ) : null}
          <a
            href={data.source.link}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-xl border border-[#E7EAEE] px-3 py-2 text-sm font-medium text-[#0F172A] hover:bg-[#F8FAFC]"
          >
            Abrir documento <Share2 className="h-3.5 w-3.5" />
          </a>
        </div>
      </aside>
    </div>
  );
}

const LoadingBlocks = () => (
  <div className="space-y-8">
    <div className="h-[160px] animate-pulse rounded-2xl border border-[#E7EAEE] bg-white" />
    <div className="h-[220px] animate-pulse rounded-2xl border border-[#E7EAEE] bg-white" />
    <div className="h-[300px] animate-pulse rounded-2xl border border-[#E7EAEE] bg-white" />
  </div>
);

export function ComparePage() {
  const detailRef = useRef<HTMLDivElement | null>(null);
  const verdictRef = useRef<HTMLElement | null>(null);
  const mounted = useRef(false);
  const [selectedTickers, setSelectedTickers] = useState<string[]>(["WEGE3", "VALE3"]);
  const [search, setSearch] = useState("");
  const [openPicker, setOpenPicker] = useState(false);
  const [activePillar, setActivePillar] = useState<Pillar>("Divida");
  const [range, setRange] = useState<RangeKey>("5a");
  const [eventsOpen, setEventsOpen] = useState(false);
  const [qualityOpen, setQualityOpen] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [evidence, setEvidence] = useState<Evidence | null>(null);
  const [toast, setToast] = useState("");
  const [compactSticky, setCompactSticky] = useState(false);
  const [actionsOpen, setActionsOpen] = useState(false);

  const selected = useMemo(
    () => selectedTickers.map((t) => companies.find((c) => c.ticker === t)).filter(Boolean) as Company[],
    [selectedTickers],
  );
  const pair = selected.slice(0, 2);
  const a = pair[0];
  const b = pair[1];
  const canCompare = pair.length >= 2;
  const available = useMemo(
    () =>
      companies.filter(
        (c) =>
          !selectedTickers.includes(c.ticker) &&
          (!search || `${c.ticker} ${c.name}`.toLowerCase().includes(search.toLowerCase())),
      ),
    [selectedTickers, search],
  );

  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true;
      return;
    }
    setRefreshing(true);
    const t = window.setTimeout(() => setRefreshing(false), 350);
    return () => window.clearTimeout(t);
  }, [selectedTickers, activePillar, range]);

  useEffect(() => {
    if (!toast) return;
    const t = window.setTimeout(() => setToast(""), 2200);
    return () => window.clearTimeout(t);
  }, [toast]);

  useEffect(() => {
    if (!actionsOpen) return;
    const close = () => setActionsOpen(false);
    window.addEventListener("scroll", close, { passive: true });
    return () => window.removeEventListener("scroll", close);
  }, [actionsOpen]);

  useEffect(() => {
    const onScroll = () => setCompactSticky(window.scrollY > 110);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const years = RANGES.find((r) => r.key === range)?.years ?? null;
  const chartData = useMemo(() => {
    if (!a || !b) return [];
    const as = years ? a.pillars[activePillar].series.slice(-years) : a.pillars[activePillar].series;
    const bs = years ? b.pillars[activePillar].series.slice(-years) : b.pillars[activePillar].series;
    return as.map((p, i) => ({ year: p.year, a: p.value, b: bs[i]?.value ?? null }));
  }, [a, b, activePillar, years]);

  const scoreboard = useMemo(() => {
    if (!a || !b) return null;
    const avgA = PILLARS.reduce((acc, p) => acc + a.pillars[p].score, 0) / PILLARS.length;
    const avgB = PILLARS.reduce((acc, p) => acc + b.pillars[p].score, 0) / PILLARS.length;
    const winner = avgA >= avgB ? a : b;
    const attention = [
      ...PILLARS.map((p) => ({ c: a, p, s: a.pillars[p].score })),
      ...PILLARS.map((p) => ({ c: b, p, s: b.pillars[p].score })),
    ].sort((x, y) => x.s - y.s)[0];
    const spread = PILLARS.map((p) => ({ p, d: Math.abs(a.pillars[p].score - b.pillars[p].score) })).sort(
      (x, y) => y.d - x.d,
    )[0];
    return { winner, score: Math.max(avgA, avgB), attention, spread, avgA, avgB };
  }, [a, b]);

  const pillarDiffs = useMemo(() => {
    if (!a || !b) return [];
    return PILLARS.map((p) => {
      const da = a.pillars[p];
      const db = b.pillars[p];
      const winner = da.score >= db.score ? a : b;
      const loser = winner.ticker === a.ticker ? b : a;
      const winnerTrend = winner.ticker === a.ticker ? trendFromSeries(da.series) : trendFromSeries(db.series);
      const loserTrend = loser.ticker === a.ticker ? trendFromSeries(da.series) : trendFromSeries(db.series);
      return {
        p,
        da,
        db,
        winner,
        loser,
        delta: Math.abs(da.score - db.score),
        lowestScore: Math.min(da.score, db.score),
        winnerTrend,
        loserTrend,
      };
    }).sort((x, y) => y.delta - x.delta);
  }, [a, b]);

  const topPillarDiffs = pillarDiffs.slice(0, 3);
  const otherPillarDiffs = pillarDiffs.slice(3);

  const verdict = useMemo(() => {
    if (!a || !b || !scoreboard) return null;
    const winner = scoreboard.avgA >= scoreboard.avgB ? a : b;
    const loser = winner.ticker === a.ticker ? b : a;
    const biggestGap = pillarDiffs[0];
    const keyRisk = [...pillarDiffs].sort((x, y) => x.lowestScore - y.lowestScore)[0];
    const reasons = topPillarDiffs.map((item) => {
      if (item.p === "CaixaFCF") return `${item.winner.ticker} converte melhor resultado em caixa e sustenta execucao.`;
      if (item.p === "Divida") return `${item.winner.ticker} opera com alavancagem mais controlada no periodo.`;
      if (item.p === "Margens") return `${item.winner.ticker} preserva eficiencia operacional com mais consistencia.`;
      if (item.p === "Retorno") return `${item.winner.ticker} entrega retorno mais robusto sobre o capital.`;
      return `${item.winner.ticker} mostra distribuicao mais previsivel aos acionistas.`;
    });
    return {
      winner,
      loser,
      biggestGap,
      keyRisk,
      reasons,
      consequence: summarizeWinners(topPillarDiffs),
      confidence: confidenceLabel(pair),
      latestUpdate: pair.map((c) => c.updatedAt).sort((x, y) => parseDate(y) - parseDate(x))[0],
    };
  }, [a, b, pair, pillarDiffs, scoreboard, topPillarDiffs]);

  const tableRows = useMemo(() => {
    if (!a || !b) return [];
    const ma = a.pillars[activePillar].metrics;
    const mb = b.pillars[activePillar].metrics;
    const names = Array.from(new Set([...ma.map((m) => m.name), ...mb.map((m) => m.name)]));
    return names.map((name) => {
      const am = ma.find((m) => m.name === name) ?? null;
      const bm = mb.find((m) => m.name === name) ?? null;
      return {
        name,
        definition: am?.definition ?? bm?.definition ?? "Sem definicao",
        unit: am?.unit ?? bm?.unit ?? "",
        direction: am?.direction ?? bm?.direction ?? "higher-better",
        a: am,
        b: bm,
      };
    });
  }, [a, b, activePillar]);

  const activePillarWinnerSummary = useMemo(() => {
    if (!a || !b || !tableRows.length) return null;
    const winsA = tableRows.filter((row) => metricWinner(row.direction, row.a?.value ?? null, row.b?.value ?? null) === "a").length;
    const winsB = tableRows.filter((row) => metricWinner(row.direction, row.a?.value ?? null, row.b?.value ?? null) === "b").length;
    const leader = winsA >= winsB ? a.ticker : b.ticker;
    const wins = Math.max(winsA, winsB);
    return `${leader} vence em ${wins} de ${tableRows.length} metricas deste pilar.`;
  }, [a, b, tableRows]);

  const recentEvents = useMemo(() => {
    if (!a || !b) return [];
    const now = new Date(2026, 2, 6).getTime();
    const d90 = 90 * 24 * 60 * 60 * 1000;
    return events.filter((e) => [a.ticker, b.ticker].includes(e.ticker) && now - parseDate(e.date) <= d90);
  }, [a, b]);

  const eventsOnActivePillar = useMemo(
    () => recentEvents.filter((event) => event.impact === activePillar).length,
    [recentEvents, activePillar],
  );
  const mainExplainer = useMemo(() => {
    if (!a || !b) return "";
    const aScore = a.pillars[activePillar].score;
    const bScore = b.pillars[activePillar].score;
    const winner = aScore >= bScore ? a : b;
    const loser = winner.ticker === a.ticker ? b : a;
    const winnerTrend = trendFromSeries(winner.pillars[activePillar].series);
    const loserTrend = trendFromSeries(loser.pillars[activePillar].series);
    const ranked = [...recentEvents].sort((x, y) => parseDate(y.date) - parseDate(x.date));
    const head = ranked[0];
    const eventClause = head ? ` O evento mais relevante foi ${head.summary.toLowerCase()} (${head.ticker}, ${head.date}).` : "";
    return `Nos ultimos 90 dias, a diferenca em ${PILLAR_LABEL[activePillar]} ampliou porque ${trendNarrative(winnerTrend, winner.ticker)}, enquanto ${trendNarrative(loserTrend, loser.ticker)}.${eventClause}`;
  }, [a, b, activePillar, recentEvents]);
  const latestChartDelta = useMemo(() => {
    if (!chartData.length) return null;
    const last = chartData[chartData.length - 1];
    if (last?.a === null || last?.b === null || last?.a === undefined || last?.b === undefined) return null;
    return Math.abs(Number(last.a) - Number(last.b));
  }, [chartData]);
  const latestChartLeader = useMemo(() => {
    if (!a || !b || !chartData.length) return null;
    const last = chartData[chartData.length - 1];
    if (last?.a === null || last?.b === null || last?.a === undefined || last?.b === undefined) return null;
    const betterIsHigher = a.pillars[activePillar].thresholdLabel.toLowerCase().includes("maior");
    if (last.a === last.b) return null;
    const winnerIsA = betterIsHigher ? Number(last.a) > Number(last.b) : Number(last.a) < Number(last.b);
    return winnerIsA ? a.ticker : b.ticker;
  }, [a, b, activePillar, chartData]);
  const activePillarScoreWinner = useMemo(() => {
    if (!a || !b) return null;
    return a.pillars[activePillar].score >= b.pillars[activePillar].score ? a.ticker : b.ticker;
  }, [a, b, activePillar]);
  const scoreVsChartContext = useMemo(() => {
    if (!a || !b || !latestChartLeader || !activePillarScoreWinner || latestChartLeader === activePillarScoreWinner) return null;
    const scoreWinner = activePillarScoreWinner === a.ticker ? a : b;
    const chartWinner = latestChartLeader === a.ticker ? a : b;
    return `Apesar de ${chartWinner.ticker} liderar no ponto mais recente do grafico, ${scoreWinner.ticker} fecha melhor o pilar por combinacao entre metricas, estabilidade e leitura agregada.`;
  }, [a, b, latestChartLeader, activePillarScoreWinner]);
  const qualityTone = useMemo(() => {
    const latest = pair.map((c) => c.updatedAt).sort((x, y) => parseDate(y) - parseDate(x))[0];
    const hasCriticalGap = pair.some((c) => c.gaps.some((g) => g.toLowerCase().includes("critico")));
    const hasGap = pair.some((c) => c.gaps.length > 0);
    if (hasCriticalGap) return { dot: "bg-[#B91C1C]", label: "Risco" };
    if (hasGap) return { dot: "bg-[#B45309]", label: "Atencao" };
    if (latest && Date.now() - parseDate(latest) < 60 * 24 * 60 * 60 * 1000) return { dot: "bg-[#16A34A]", label: "Saudavel" };
    return { dot: "bg-[#B45309]", label: "Atencao" };
  }, [pair]);

  const openEvidence = (row: { name: string; definition: string; unit: string; a: Metric | null; b: Metric | null }) => {
    if (!a || !b) return;
    const src = row.a?.source ?? row.b?.source;
    if (!src) return;
    setEvidence({
      metricName: row.name,
      definition: row.definition,
      unit: row.unit,
      source: src,
      aTicker: a.ticker,
      bTicker: b.ticker,
      aValue: row.a?.value ?? null,
      bValue: row.b?.value ?? null,
    });
  };

  const addTicker = (ticker: string) => {
    if (selectedTickers.includes(ticker) || selectedTickers.length >= 4) return;
    setSelectedTickers((prev) => [...prev, ticker]);
    setOpenPicker(false);
    setSearch("");
  };

  const selectPillar = (pillar: Pillar) => {
    setActivePillar(pillar);
    if (detailRef.current && detailRef.current.getBoundingClientRect().top < 0) {
      detailRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F8FA] text-[#0F172A]" style={{ fontFamily: "Inter, sans-serif" }}>
      <div className="hidden lg:block">
        <Sidebar currentPage="comparar" />
      </div>
      <TopBar updatedAt="07/02/2026" />
      <main className="pt-16 lg:ml-[88px]">
        <div className="px-8 py-8">
          <section className={`sticky top-16 z-30 mb-6 rounded-[18px] border border-[#DCE3EA] bg-[#FDFEFE]/95 shadow-[0_10px_24px_rgba(15,23,42,0.06)] backdrop-blur transition-all ${compactSticky ? "p-2" : "p-2.5"}`}>
            <div className="grid grid-cols-1 gap-2 xl:grid-cols-12">
              <article className="rounded-2xl border border-[#D5DEE7] bg-[#F4F8FB] p-2.5 xl:col-span-7">
                <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[#64748B]">Setup da comparacao</p>
                <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                  {selected.map((c, i) => (
                    <span
                      key={c.ticker}
                      className="inline-flex items-center gap-2 rounded-xl border border-[#E7EAEE] bg-white px-3 py-1.5 text-xs font-medium text-[#0F172A]"
                    >
                      <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: SLOT_COLORS[i] }} />
                      <TickerLogo ticker={c.ticker} size={16} />
                      {i === 0 ? "Empresa A" : i === 1 ? "Empresa B" : `Empresa ${i + 1}`}: {c.ticker}
                      <button onClick={() => setSelectedTickers((p) => p.filter((t) => t !== c.ticker))} className="rounded-full p-0.5 hover:bg-black/5">
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </span>
                  ))}
                </div>
                <div className="mt-2 flex flex-wrap items-center gap-1.5">
                  {selected.length < 4 ? (
                    <button
                      onClick={() => setOpenPicker((v) => !v)}
                      className="inline-flex items-center gap-1 rounded-xl border border-dashed border-[#E7EAEE] bg-white px-2.5 py-1.5 text-xs font-medium text-[#475569] hover:border-[#0E9384]"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      Adicionar empresa
                    </button>
                  ) : null}
                  {selected.length >= 2 ? (
                    <button
                      onClick={() => setSelectedTickers((v) => (v.length < 2 ? v : [v[1], v[0], ...v.slice(2)]))}
                      className="inline-flex items-center gap-1 rounded-xl border border-[#E7EAEE] bg-white px-2.5 py-1.5 text-xs font-medium text-[#475569]"
                    >
                      <ArrowRightLeft className="h-3.5 w-3.5" />
                      Trocar A/B
                    </button>
                  ) : null}
                </div>
                <div className="relative mt-2.5 w-full max-w-[420px]">
                  <Search className="pointer-events-none absolute left-3 top-2 h-3.5 w-3.5 text-[#94A3B8]" />
                  <input
                    value={search}
                    onFocus={() => setOpenPicker(true)}
                    onChange={(e) => {
                      setSearch(e.target.value);
                      setOpenPicker(true);
                    }}
                    className="h-8 w-full rounded-xl border border-[#E7EAEE] bg-white pl-8 pr-3 text-xs"
                    placeholder="Buscar ticker ou nome (opcional)"
                  />
                  {openPicker && selected.length < 4 ? (
                    <div className="absolute z-40 mt-2 w-full rounded-xl border border-[#E7EAEE] bg-white p-1 shadow-xl">
                      {available.length ? (
                        available.map((c) => (
                          <button key={c.ticker} onClick={() => addTicker(c.ticker)} className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left hover:bg-[#F8FAFC]">
                            <div>
                              <p className="text-xs font-semibold">{c.ticker}</p>
                              <p className="text-[11px] text-[#475569]">{c.name}</p>
                            </div>
                            <span className="text-[11px] text-[#94A3B8]">{c.sector}</span>
                          </button>
                        ))
                      ) : (
                        <p className="px-3 py-2 text-xs text-[#94A3B8]">Nenhuma empresa encontrada.</p>
                      )}
                    </div>
                  ) : null}
                </div>
              </article>
              <article className="rounded-2xl border border-[#D5DEE7] bg-[#FAFCFE] p-2.5 xl:col-span-5">
                <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[#64748B]">Leitura da comparacao</p>
                <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                  <div className="flex items-center rounded-xl border border-[#E7EAEE] bg-[#F8FAFC] p-0.5">
                    {RANGES.map((r) => (
                      <button
                        key={r.key}
                        onClick={() => setRange(r.key)}
                        className={`rounded-lg px-2.5 py-1 text-xs font-medium ${range === r.key ? "bg-[#0E9384] text-white" : "text-[#475569]"}`}
                      >
                        {r.label}
                      </button>
                    ))}
                  </div>
                  {canCompare ? (
                    <button
                      onClick={() => verdictRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })}
                      className="inline-flex h-8 items-center gap-1.5 rounded-xl bg-[#0E9384] px-3 text-xs font-semibold text-white"
                    >
                      Ver veredito
                    </button>
                  ) : null}
                  {canCompare ? <span className="rounded-lg border border-[#E7EAEE] bg-[#F8FAFC] px-2 py-1 text-[11px] text-[#475569]">Pilar em foco: {PILLAR_LABEL[activePillar]}</span> : null}
                </div>
                <div className="relative mt-2.5">
                  <button
                    onClick={() => setActionsOpen((v) => !v)}
                    className="inline-flex h-8 items-center gap-1.5 rounded-xl border border-[#E7EAEE] bg-white px-2.5 text-xs font-medium text-[#475569]"
                  >
                    Opcoes da comparacao <ChevronDown className="h-3.5 w-3.5" />
                  </button>
                  {actionsOpen ? (
                    <div className="absolute left-0 z-40 mt-2 w-[220px] rounded-xl border border-[#E7EAEE] bg-white p-1.5 shadow-xl">
                      <button
                        onClick={() => {
                          setToast("Comparacao salva.");
                          setActionsOpen(false);
                        }}
                        className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-xs text-[#334155] hover:bg-[#F8FAFC]"
                      >
                        <Bookmark className="h-3.5 w-3.5" />
                        Salvar comparacao
                      </button>
                      <button
                        onClick={async () => {
                          const qs = new URLSearchParams({ tickers: selectedTickers.join(","), range, pilar: activePillar });
                          const link = `${window.location.origin}/comparar?${qs.toString()}`;
                          try {
                            await navigator.clipboard.writeText(link);
                            setToast("Link copiado.");
                          } catch {
                            setToast(link);
                          }
                          setActionsOpen(false);
                        }}
                        className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-xs text-[#334155] hover:bg-[#F8FAFC]"
                      >
                        <Share2 className="h-3.5 w-3.5" />
                        Compartilhar
                      </button>
                      {canCompare ? (
                        <button
                          onClick={() => {
                            setToast(`Alerta criado para ${PILLAR_LABEL[activePillar]}.`);
                            setActionsOpen(false);
                          }}
                          className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-xs text-[#0B7A6E] hover:bg-[#F3FBF8]"
                        >
                          <Bell className="h-3.5 w-3.5" />
                          Acompanhar mudancas
                        </button>
                      ) : null}
                    </div>
                  ) : null}
                </div>
              </article>
            </div>
          </section>

          {!canCompare ? (
            <section className="rounded-2xl border border-[#E7EAEE] bg-white p-8 text-center">
              <h2 className="text-xl font-semibold">Selecione duas empresas para comparar</h2>
              <p className="mt-2 text-sm text-[#475569]">Adicione Empresa A e Empresa B para ver quem esta melhor hoje, onde esta o risco e como confirmar.</p>
              <div className="mt-5 flex flex-wrap justify-center gap-2">
                {["WEGE3", "VALE3", "ITUB4"].map((t) => (
                  <button key={t} onClick={() => addTicker(t)} className="rounded-xl border border-[#E7EAEE] bg-[#F8FAFC] px-3 py-1.5 text-xs font-medium">{t}</button>
                ))}
              </div>
            </section>
          ) : refreshing ? (
            <LoadingBlocks />
          ) : (
            <div className="space-y-8">
              {verdict && a && b ? (
                <section ref={verdictRef} className="scroll-mt-[160px] grid grid-cols-1 gap-4 xl:grid-cols-12">
                  <article className="rounded-3xl border border-[#DDE3EA] bg-white p-6 shadow-[0_18px_45px_rgba(15,23,42,0.06)] xl:col-span-8">
                    <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#0E9384]">Veredito da comparacao</p>
                    <h2 className="mt-2 text-[28px] font-semibold leading-tight">
                      {verdict.winner.ticker} aparece mais solida que {verdict.loser.ticker} hoje.
                    </h2>
                    <p className="mt-2 text-[15px] font-medium text-[#0F172A]">{verdict.consequence}</p>
                    <div className="mt-2 inline-flex items-center gap-2 rounded-full bg-[#F1F5F9] px-3 py-1.5 text-xs font-medium text-[#334155]">
                      <Check className="h-3.5 w-3.5 text-[#0E9384]" />
                      Confianca da leitura: {verdict.confidence}
                    </div>
                    <p className="mt-3 text-sm text-[#475569]">Baseado em 5 pilares | Dados oficiais de CVM, B3 e RI | Atualizado em {verdict.latestUpdate}</p>
                    <div className="mt-4 rounded-2xl border border-[#E7EAEE] bg-[#F8FAFC] p-3">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#64748B]">Score de apoio da leitura</p>
                      <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-3">
                        <div className="rounded-xl bg-white px-3 py-2">
                          <p className="text-[11px] text-[#64748B]">{a.ticker}</p>
                          <p className="text-base font-semibold text-[#0E9384]">{n(scoreboard?.avgA ?? 0, 1)}</p>
                        </div>
                        <div className="rounded-xl bg-white px-3 py-2">
                          <p className="text-[11px] text-[#64748B]">{b.ticker}</p>
                          <p className="text-base font-semibold text-[#3F5F7D]">{n(scoreboard?.avgB ?? 0, 1)}</p>
                        </div>
                        <div className="rounded-xl bg-white px-3 py-2">
                          <p className="text-[11px] text-[#64748B]">Diferenca</p>
                          <p className="text-base font-semibold text-[#0F172A]">{n(Math.abs((scoreboard?.avgA ?? 0) - (scoreboard?.avgB ?? 0)), 1)} pts</p>
                        </div>
                      </div>
                      <p className="mt-2 text-[12px] text-[#475569]">Use o score para calibrar intensidade, nao para substituir o contexto dos pilares.</p>
                    </div>
                    <ul className="mt-4 space-y-2 text-sm text-[#334155]">
                      {verdict.reasons.slice(0, 3).map((reason) => (
                        <li key={reason} className="flex items-start gap-2">
                          <Check className="mt-0.5 h-4 w-4 text-[#0E9384]" />
                          <span>{reason}</span>
                        </li>
                      ))}
                    </ul>
                    <button
                      onClick={() => {
                        if (verdict.biggestGap) selectPillar(verdict.biggestGap.p);
                      }}
                      className="mt-5 inline-flex items-center gap-1.5 rounded-lg border border-[#0E938433] bg-[#ECFDF6] px-3 py-1.5 text-xs font-semibold text-[#0B7A6E]"
                    >
                      Ver por que ela vence <ChevronDown className="h-3.5 w-3.5" />
                    </button>
                  </article>
                  <div className="space-y-4 xl:col-span-4">
                    <article className="rounded-2xl border border-[#E7EAEE] bg-white p-5">
                      <p className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.08em] text-[#0F172A]"><TriangleAlert className="h-3.5 w-3.5 text-[#B45309]" />Onde olhar com mais cuidado</p>
                      <p className="mt-2 text-sm text-[#0F172A]">
                        {verdict.keyRisk?.loser.ticker} exige mais atencao em {PILLAR_LABEL[verdict.keyRisk?.p ?? "Divida"]}.
                      </p>
                      <p className="mt-1 text-xs text-[#64748B]">Pior score identificado: {n(verdict.keyRisk?.lowestScore ?? 0, 1)}/10</p>
                    </article>
                    <article className="rounded-2xl border border-[#E7EAEE] bg-white p-5">
                      <p className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.08em] text-[#0F172A]"><ArrowRightLeft className="h-3.5 w-3.5 text-[#3F5F7D]" />Onde a diferenca realmente aparece</p>
                      <p className="mt-2 text-sm text-[#0F172A]">
                        {PILLAR_LABEL[verdict.biggestGap?.p ?? "Divida"]} e o pilar que mais separa as empresas.
                      </p>
                      <p className="mt-1 text-xs text-[#64748B]">Delta de score: {n(verdict.biggestGap?.delta ?? 0, 1)}/10</p>
                    </article>
                  </div>
                </section>
              ) : null}

              <section className="rounded-2xl border border-[#E7EAEE] bg-white p-6">
                <h2 className="text-[22px] font-semibold">Os 3 fatores que mais separam essas empresas</h2>
                <p className="mt-1 text-sm text-[#475569]">Comece por aqui para decidir onde focar primeiro.</p>
                <div className="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-3">
                  {topPillarDiffs.map((item) => (
                    <button
                      key={item.p}
                      onClick={() => selectPillar(item.p)}
                      className={`rounded-2xl border p-4 text-left transition-all ${item.p === activePillar ? "border-[#0E9384] bg-[#F4FBF8] shadow-[0_8px_16px_rgba(14,147,132,0.08)]" : "border-[#E7EAEE] bg-white hover:border-[#0E938433]"}`}
                    >
                      <p className="text-sm font-semibold">{PILLAR_LABEL[item.p]}</p>{item.p === activePillar ? <p className="mt-1 text-[11px] font-medium text-[#0E9384]">Pilar em foco</p> : null}
                      <p className="mt-2 text-[13px] font-medium text-[#0F172A]">{item.winner.ticker} leva vantagem.</p><p className="mt-1 text-xs text-[#334155]">{pillarInsight(item.p, item.winner.ticker)}</p>
                      <p className="mt-1 text-xs text-[#475569]">
                        Score: {n(item.da.score, 1)} ({a?.ticker}) vs {n(item.db.score, 1)} ({b?.ticker}) | Delta {n(item.delta, 1)}
                      </p>
                      <p className="mt-2 text-xs text-[#334155]">
                        {trendContext(item.winnerTrend)}.
                      </p>
                      <div className="mt-2 inline-flex items-center gap-1 rounded-lg border border-[#E7EAEE] bg-[#F8FAFC] px-2 py-1 text-[11px] text-[#475569]">
                        {trendIcon(item.winnerTrend)} {trendLabel[item.winnerTrend]}
                      </div>
                    </button>
                  ))}
                </div>
              </section>

              <section className="rounded-2xl border border-[#E7EAEE] bg-white p-6">
                <h2 className="text-[20px] font-semibold">Todos os pilares</h2>
                <p className="mt-1 text-sm text-[#475569]">Veja quem vence, quanto separa e por que isso importa na tese.</p>
                <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-5">
                  {otherPillarDiffs.map((item) => (
                    <button
                      key={item.p}
                      onClick={() => selectPillar(item.p)}
                      className={`group rounded-xl border px-4 py-4 text-left transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0E938433] ${item.p === activePillar ? "border-[#0E9384] bg-[#ECFDF6] shadow-[0_12px_24px_rgba(14,147,132,0.14)]" : "border-[#D8E1E9] bg-white hover:-translate-y-1 hover:border-[#0E9384] hover:shadow-[0_14px_24px_rgba(15,23,42,0.12)]"}`}
                    >
                      <p className={`text-sm ${item.p === activePillar ? "font-bold text-[#0B7A6E]" : "font-semibold text-[#0F172A]"}`}>{PILLAR_LABEL[item.p]}</p>{item.p === activePillar ? <p className="mt-1 text-[11px] font-semibold text-[#0E9384]">Pilar em foco</p> : null}
                      <p className="mt-1 text-xs text-[#475569]">Vence: {item.winner.ticker}</p>
                      <p className="mt-2 text-xs font-semibold text-[#0F172A]">Delta {n(item.delta, 1)}/10</p>
                      <p className="mt-2 text-[11px] text-[#334155]">{pillarConsequence(item.p, item.delta, item.winner.ticker)}</p>
                      <p className="mt-2 text-[11px] font-semibold text-[#0B7A6E] transition-colors group-hover:text-[#0E9384]">Ver detalhe</p>
                    </button>
                  ))}
                </div>
              </section>

              <section ref={detailRef} className="scroll-mt-[160px] rounded-2xl border border-[#E7EAEE] bg-white p-6">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <h2 className="text-[22px] font-semibold">Detalhe guiado do pilar: {PILLAR_LABEL[activePillar]}</h2>
                  {a && b ? (
                    <button onClick={() => {
                      const m = a.pillars[activePillar].metrics[0];
                      const mb = b.pillars[activePillar].metrics.find((x) => x.name === m.name);
                      setEvidence({ metricName: m.name, definition: m.definition, unit: m.unit, source: m.source, aTicker: a.ticker, bTicker: b.ticker, aValue: m.value, bValue: mb?.value ?? null });
                    }} className="inline-flex items-center gap-1.5 rounded-lg border border-[#E7EAEE] px-2.5 py-1.5 text-[11px] font-medium text-[#475569]">
                      <FileText className="h-3.5 w-3.5" />Confirmar na fonte
                    </button>
                  ) : null}
                </div>
                <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-12">
                  <article className="rounded-2xl border border-[#D9E2EC] bg-[#F3F7FB] p-5 xl:col-span-4">
                    <div className="space-y-4 text-sm">
                      {a && b ? (
                        <div>
                          <p className="text-[12px] font-semibold text-[#475569]">Resumo do pilar</p>
                          <p className="mt-1.5 text-[#0F172A]">
                            {a.pillars[activePillar].score >= b.pillars[activePillar].score ? a.ticker : b.ticker} esta melhor neste pilar hoje.
                          </p>
                        </div>
                      ) : null}
                      <div><p className="text-[12px] font-semibold text-[#475569]">O que isso quer dizer</p><p className="mt-1.5 text-[#0F172A]">{pillarCopy[activePillar].what}</p></div>
                      <div><p className="text-[12px] font-semibold text-[#475569]">Por que isso pesa na analise</p><p className="mt-1.5 text-[#0F172A]">{pillarCopy[activePillar].why}</p></div>
                      <div><p className="text-[12px] font-semibold text-[#475569]">O que observar com atencao</p><p className="mt-1.5 text-[#0F172A]">{pillarCopy[activePillar].how}</p></div>
                      <div className="flex flex-wrap gap-2">{pillarCopy[activePillar].ranges.map((r) => <span key={r} className="rounded-xl border border-[#E7EAEE] bg-white px-2 py-1 text-[11px]">{r}</span>)}</div>
                    </div>
                  </article>
                  <article className="rounded-2xl border border-[#E7EAEE] bg-[#F8FAFC] p-5 xl:col-span-8">
                    {a && b ? (
                      <>
                        <div className="mb-3 rounded-xl border border-[#E3E8EF] bg-[#F1F5F9] px-3 py-2">
                          <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#64748B]">Leitura do periodo</p>
                          <p className="mt-1 text-sm font-medium text-[#334155]">
                            {a.pillars[activePillar].score >= b.pillars[activePillar].score ? a.ticker : b.ticker} mostra trajetoria mais favoravel, enquanto{" "}
                            {a.pillars[activePillar].score >= b.pillars[activePillar].score ? b.ticker : a.ticker} perdeu tracao relativa.
                          </p>
                          <div className="mt-2 flex flex-wrap gap-2 text-[11px]">
                            <span className="rounded-lg border border-[#D9E2EC] bg-white px-2 py-1 text-[#334155]">Regra: {a.pillars[activePillar].thresholdLabel}</span>
                            <span className="rounded-lg border border-[#D9E2EC] bg-white px-2 py-1 text-[#334155]">Direcao desejavel: {a.pillars[activePillar].thresholdLabel.toLowerCase().includes("menor") ? "linha descendente" : "linha ascendente"}</span>
                            {latestChartLeader ? <span className="rounded-lg border border-[#BFE7DF] bg-[#ECFDF6] px-2 py-1 font-medium text-[#0B7A6E]">Vantagem atual: {latestChartLeader}</span> : null}
                            {latestChartDelta !== null ? <span className="rounded-lg border border-[#D9E2EC] bg-white px-2 py-1 text-[#334155]">Delta final: {n(latestChartDelta, 1)}</span> : null}
                          </div>
                          {scoreVsChartContext ? (
                            <p className="mt-2 rounded-lg border border-[#FDE68A] bg-[#FFFBEB] px-2.5 py-2 text-[12px] text-[#92400E]">{scoreVsChartContext}</p>
                          ) : null}
                        </div>
                        <div className="mb-2 flex items-center gap-4 text-xs text-[#475569]">
                          <span className="inline-flex items-center gap-1"><span className="h-2.5 w-2.5 rounded-full bg-[#0E9384]" />{a.ticker}</span>
                          <span className="inline-flex items-center gap-1"><span className="h-2.5 w-2.5 rounded-full bg-[#3F5F7D]" />{b.ticker}</span>
                        </div>
                        <div className="h-[280px] rounded-xl border border-[#E7EAEE] bg-white p-3">
                          <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={chartData}>
                              <CartesianGrid stroke="#EDF2F7" strokeDasharray="2 3" vertical={false} />
                              <ReferenceArea y1={a.pillars[activePillar].bands.safe[0]} y2={a.pillars[activePillar].bands.safe[1]} fill="#DCFCE7" fillOpacity={0.18} />
                              <ReferenceArea y1={a.pillars[activePillar].bands.warning[0]} y2={a.pillars[activePillar].bands.warning[1]} fill="#FFEDD5" fillOpacity={0.16} />
                              <ReferenceArea y1={a.pillars[activePillar].bands.risk[0]} y2={a.pillars[activePillar].bands.risk[1]} fill="#FEE2E2" fillOpacity={0.18} />
                              <XAxis dataKey="year" tick={{ fontSize: 11, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
                              <YAxis domain={a.pillars[activePillar].domain} tick={{ fontSize: 11, fill: "#94A3B8" }} axisLine={false} tickLine={false} width={30} />
                              <Tooltip content={({ active, payload, label }) => !active || !payload?.length ? null : <div className="rounded-lg border border-[#E7EAEE] bg-white p-2 text-xs shadow-lg"><p className="font-semibold">Ano: {label}</p>{payload.map((item) => <p key={`${item.name}-${label}`} style={{ color: item.color as string }}>{item.name}: {n(Number(item.value), 2)}</p>)}</div>} />
                              <Line type="monotone" dataKey="a" name={a.ticker} stroke={TOKENS.companyA} strokeWidth={2.6} dot={{ r: 2 }} />
                              <Line type="monotone" dataKey="b" name={b.ticker} stroke={TOKENS.companyB} strokeWidth={2.2} dot={{ r: 2 }} />
                            </LineChart>
                          </ResponsiveContainer>
                        </div>
                      </>
                    ) : null}
                  </article>
                </div>
              </section>

              <section className="scroll-mt-[160px] rounded-2xl border border-[#E7EAEE] bg-white p-6">
                <h2 className="text-[20px] font-semibold">Evidencias por metrica</h2>
                <p className="mt-1 text-sm text-[#475569]">Compare numeros completos, tendencia e winner por item.</p>
                {activePillarWinnerSummary ? <p className="mt-2 text-sm font-medium text-[#334155]">{activePillarWinnerSummary}</p> : null}
                {a && b ? (
                  <div className="mt-4 overflow-x-auto rounded-2xl border border-[#E7EAEE]">
                    <table className="min-w-full divide-y divide-[#E7EAEE] text-sm">
                      <thead className="bg-[#F8FAFC] text-xs font-semibold text-[#334155]"><tr><th className="px-3 py-3 text-left">Metrica</th><th className="px-3 py-3 text-left">{a.ticker}</th><th className="px-3 py-3 text-left">{b.ticker}</th><th className="px-3 py-3 text-left">Delta</th><th className="px-3 py-3 text-left">Winner</th><th className="px-3 py-3 text-left">Leitura</th><th className="px-3 py-3 text-left">Fonte</th></tr></thead>
                      <tbody className="divide-y divide-[#E7EAEE]">
                        {tableRows.map((row) => {
                          const w = metricWinner(row.direction, row.a?.value ?? null, row.b?.value ?? null);
                          const d = metricDelta(row.a?.value ?? null, row.b?.value ?? null);
                          return (
                            <tr key={row.name}>
                              <td className="px-3 py-3 align-top"><p className="font-medium">{row.name}</p><p className="mt-1 text-[11px] text-[#475569]">{row.definition}</p></td>
                              <td className="px-3 py-3 align-top"><p className={`text-[#0E9384] ${w === "a" ? "font-semibold" : "font-medium"}`}>{formatMetric(row.a?.value ?? null, row.unit)}</p>{row.a ? <p className="mt-1 inline-flex items-center gap-1 text-[11px] font-medium text-[#64748B]">{trendIcon(row.a.trend)}{trendLabel[row.a.trend]}</p> : <p className="mt-1 text-[11px] text-[#EF4444]">Dados indisponiveis</p>}</td>
                              <td className="px-3 py-3 align-top"><p className={`text-[#3F5F7D] ${w === "b" ? "font-semibold" : "font-medium"}`}>{formatMetric(row.b?.value ?? null, row.unit)}</p>{row.b ? <p className="mt-1 inline-flex items-center gap-1 text-[11px] font-medium text-[#64748B]">{trendIcon(row.b.trend)}{trendLabel[row.b.trend]}</p> : <p className="mt-1 text-[11px] text-[#EF4444]">Dados indisponiveis</p>}</td>
                              <td className="px-3 py-3 align-top"><span className="inline-flex rounded-md border border-[#D5DEE7] bg-[#F8FAFC] px-2 py-1 text-xs font-semibold text-[#0F172A]">{d === null ? "Dados indisponiveis" : `${n(d, row.unit === "x" ? 2 : 1)} ${row.unit}`}</span></td>
                              <td className="px-3 py-3 align-top">{w === "a" ? <span className="inline-flex items-center gap-1 rounded-lg border border-[#9FE3CF] bg-[#D9FBEF] px-2 py-1 text-xs font-semibold text-[#0E9384]"><Crown className="h-3 w-3" />{a.ticker}</span> : w === "b" ? <span className="inline-flex items-center gap-1 rounded-lg border border-[#C9DDF0] bg-[#ECF3F9] px-2 py-1 text-xs font-semibold text-[#3F5F7D]"><Check className="h-3 w-3" />{b.ticker}</span> : <span className="inline-flex rounded-md border border-[#D5DEE7] bg-[#F8FAFC] px-2 py-1 text-[12px] font-semibold text-[#475569]">Empate</span>}</td>
                              <td className="px-3 py-3 align-top"><p className={`inline-flex rounded-md px-2 py-1 text-xs font-semibold ${d !== null && d >= 1.2 ? "bg-[#ECFDF6] text-[#0B7A6E]" : "bg-[#F8FAFC] text-[#334155]"}`}>{evidenceReadLabel(d)}</p><p className="mt-1 text-[11px] text-[#64748B]">{w === "tie" ? "Sem separacao decisiva." : `${w === "a" ? a.ticker : b.ticker} com leitura mais favoravel neste item.`}</p></td>
                              <td className="px-3 py-3 align-top"><button title="Ver fonte" onClick={() => openEvidence(row)} className="inline-flex items-center gap-1 rounded-lg border border-[#E7EAEE] px-2 py-1.5 text-[11px] text-[#475569] hover:bg-[#F8FAFC]"><FileText className="h-3.5 w-3.5" />Fonte</button></td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                ) : null}
              </section>
              <section className="rounded-2xl border border-[#E7EAEE] bg-white p-6">
                <h2 className="text-[20px] font-semibold">O que pode explicar essa diferenca</h2>
                <p className="mt-1 text-sm text-[#475569]">Contexto recente + como verificamos os dados.</p>
                <div className="mt-3 rounded-xl border border-[#BFE7DF] bg-[#ECFDF6] px-3.5 py-3 shadow-[0_6px_14px_rgba(14,147,132,0.08)]">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#64748B]">Sintese principal (90 dias)</p>
                  <p className="mt-1 text-sm text-[#0F172A]">{mainExplainer}</p>
                </div>
                <div className="mt-3 flex flex-wrap items-center gap-2 rounded-xl border border-[#E7EAEE] bg-[#F8FAFC] px-3 py-2 text-[12px] text-[#475569]">
                  <span>Atualizado em {pair.map((c) => c.updatedAt).sort((x, y) => parseDate(y) - parseDate(x))[0] ?? "-"}</span>
                  <span>| Fontes CVM/B3/RI</span>
                  <span>| {recentEvents.length} eventos recentes</span>
                  <span>| {eventsOnActivePillar} impactam {PILLAR_LABEL[activePillar]}</span>
                </div>
                <div className="mt-4 space-y-3">
                  <button onClick={() => setEventsOpen((v) => !v)} className="flex w-full items-center justify-between rounded-2xl border border-[#E7EAEE] bg-[#F8FAFC] px-4 py-3 text-left"><span className="text-sm font-semibold">Eventos recentes (90 dias) <span className="font-normal text-[#475569]">- {recentEvents.length} eventos - {eventsOnActivePillar} impactam {PILLAR_LABEL[activePillar]}</span></span>{eventsOpen ? <ChevronUp className="h-4 w-4 text-[#475569]" /> : <ChevronDown className="h-4 w-4 text-[#475569]" />}</button>
                  {eventsOpen ? <div className="space-y-2">{recentEvents.length ? recentEvents.map((e) => <article key={e.id} className="rounded-2xl border border-[#E7EAEE] bg-white p-4"><div className="flex flex-wrap items-center gap-2 text-xs text-[#475569]"><span>{e.date}</span><span className={`rounded-xl px-2 py-0.5 ${e.type === "Fato relevante" ? "bg-[#FFEDD5] text-[#B45309]" : "border border-[#E7EAEE]"}`}>{e.type}</span><span className="rounded-xl border border-[#E7EAEE] px-2 py-0.5">{PILLAR_LABEL[e.impact]}</span><span className="rounded-xl border border-[#E7EAEE] px-2 py-0.5">{e.ticker}</span></div><p className="mt-2 text-sm">{e.summary}</p><button onClick={() => setEvidence({ metricName: `Evento: ${e.type}`, definition: e.summary, unit: "", source: e.source, aTicker: a?.ticker ?? "A", bTicker: b?.ticker ?? "B", aValue: null, bValue: null })} className="mt-3 inline-flex items-center gap-2 rounded-xl border border-[#E7EAEE] px-2.5 py-1.5 text-xs text-[#475569]"><FileText className="h-3.5 w-3.5" />Ver fonte</button></article>) : <div className="rounded-2xl border border-[#E7EAEE] bg-white p-4 text-sm text-[#475569]">Nenhum evento relevante encontrado para as empresas selecionadas.</div>}</div> : null}
                  <button onClick={() => setQualityOpen((v) => !v)} className="flex w-full items-center justify-between rounded-2xl border border-[#E7EAEE] bg-[#F8FAFC] px-4 py-3 text-left"><span className="text-sm font-semibold inline-flex items-center gap-2"><span className={`h-2.5 w-2.5 rounded-full ${qualityTone.dot}`} />Como verificamos os dados <span className="font-normal text-[#475569]">- Atualizado em {pair.map((c) => c.updatedAt).sort((x, y) => parseDate(y) - parseDate(x))[0] ?? "-"} - Fontes: CVM/B3/RI</span></span>{qualityOpen ? <ChevronUp className="h-4 w-4 text-[#475569]" /> : <ChevronDown className="h-4 w-4 text-[#475569]" />}</button>
                  {qualityOpen ? <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">{pair.map((c, i) => <article key={c.ticker} className="rounded-2xl border border-[#E7EAEE] bg-white p-4 text-sm"><p className="font-semibold">{i === 0 ? "Empresa A" : "Empresa B"}: {c.ticker}</p><p className="mt-1 text-[#475569]">Fonte primaria: {c.primarySource}</p><p className="mt-1 text-[#475569]">Ultima atualizacao: {c.updatedAt}</p><p className="mt-2 text-xs text-[#475569]" title="Confiabilidade baseada em cobertura, recorrencia e completude">Confianca: {c.confidence}</p>{c.gaps.length ? <div className="mt-2 rounded-xl border border-[#FDE68A] bg-[#FFF7ED] px-3 py-2 text-xs text-[#B45309]"><p className="inline-flex items-center gap-1 font-medium"><TriangleAlert className="h-3.5 w-3.5" />Gap identificado</p><p className="mt-1.5 text-[#0F172A]">{c.gaps.join(" ")}</p></div> : <div className="mt-2 rounded-xl border border-[#BBF7D0] bg-[#F0FDF4] px-3 py-2 text-xs text-[#166534]">Nenhum gap relevante reportado.</div>}</article>)}</div> : null}
                </div>
              </section>
            </div>
          )}

          <p className="mt-8 text-xs text-[#64748B]">Conteudo educacional. Nao constitui recomendacao de compra ou venda.</p>
        </div>
      </main>
      {toast ? <div className="fixed bottom-5 right-5 z-50 rounded-xl border border-[#0E938433] bg-[#D9FBEF] px-3 py-2 text-xs font-medium text-[#0B7A6E] shadow-lg">{toast}</div> : null}
      <EvidenceDrawer data={evidence} onClose={() => setEvidence(null)} />
    </div>
  );
}

export default ComparePage;



import { useEffect, useMemo, useRef, useState, type RefObject } from "react";
import { Link } from "react-router-dom";
import { Building2, ChevronDown, ChevronLeft, ChevronRight, FileText, ShieldCheck, Waves, X } from "lucide-react";

type Health = "Saudavel" | "Atencao" | "Risco";
type Severity = "Leve" | "Moderada" | "Forte";
type PillarId = "divida" | "caixa" | "margens" | "retorno" | "proventos";

type Source = { fonte: "CVM" | "B3" | "RI"; documento: string; data: string; comoUsamos: string };
type Evidence = {
  id: PillarId;
  nome: string;
  status: Health;
  resumo: string;
  importancia: string;
  metrica: string;
  valor: number;
  unidade: string;
  periodo: string;
  domain: [number, number];
  historico: Array<{ label: string; value: number }>;
  ensino: string[];
  metodologia: string;
  source: Source;
};
type Feed = { id: string; sev: Severity; status?: Health; titulo: string; impacto: string; pilar: string; data: string; source: Source };
type Company = {
  ticker: "WEGE3" | "VALE3" | "ITUB4" | "PETR4";
  nome: string;
  setor: string;
  saude: Health;
  conf: "Alta" | "Media";
  atualizado: string;
  forte: string;
  atencao: string;
  observar: string;
  radar: [number, number, number, number, number];
  evidencias: Evidence[];
  feed: Feed[];
};

type DrawerState =
  | { kind: null }
  | { kind: "fontes" }
  | { kind: "source"; source: Source }
  | { kind: "metodologia"; nome: string; texto: string }
  | { kind: "trust"; title: string; lines: string[] };

const PILLARS: Array<{ id: PillarId; nome: string; hint: string }> = [
  { id: "divida", nome: "Dívida", hint: "Mostra pressão financeira e folga de alavancagem." },
  { id: "caixa", nome: "Caixa/FCF", hint: "Capacidade de gerar caixa de forma recorrente." },
  { id: "margens", nome: "Margens", hint: "Eficiência operacional ao longo do ciclo." },
  { id: "retorno", nome: "Retorno", hint: "Qualidade da alocação de capital." },
  { id: "proventos", nome: "Proventos", hint: "Sustentabilidade da distribuição ao acionista." },
];

const STATUS_STYLE: Record<Health, string> = {
  Saudavel: "border-emerald-200 bg-emerald-50 text-emerald-700",
  Atencao: "border-amber-200 bg-amber-50 text-amber-700",
  Risco: "border-rose-200 bg-rose-50 text-rose-700",
};
const HEALTH_LABEL: Record<Health, string> = { Saudavel: "Saudável", Atencao: "Atenção", Risco: "Risco" };
const SEV_STYLE: Record<Severity, string> = {
  Leve: "border-emerald-200 bg-emerald-50 text-emerald-700",
  Moderada: "border-amber-200 bg-amber-50 text-amber-700",
  Forte: "border-rose-200 bg-rose-50 text-rose-700",
};

function mkCompany(ticker: Company["ticker"], nome: string, setor: string, radar: Company["radar"], saude: Health): Company {
  const src: Source = {
    fonte: ticker === "PETR4" ? "B3" : "CVM",
    documento: ticker === "WEGE3" ? "DFP 2025" : "Demonstracoes consolidadas",
    data: ticker === "PETR4" ? "05/02/2026" : "06/02/2026",
    comoUsamos: "Extraimos metrica primaria, normalizamos periodos e comparamos com historico.",
  };
  const evidencias: Evidence[] = PILLARS.map((p, i) => ({
    id: p.id,
    nome: p.nome,
    status: radar[i] >= 70 ? "Saudavel" : radar[i] >= 55 ? "Atencao" : "Risco",
    resumo: `${p.nome} em ${radar[i] >= 70 ? "faixa estavel" : radar[i] >= 55 ? "faixa mista" : "faixa pressionada"}.`,
    importancia: "Ajuda a evitar leitura superficial de um unico indicador.",
    metrica: p.id === "divida" ? "Dívida Líq/EBITDA" : p.id === "caixa" ? "Fluxo de Caixa Livre" : p.id === "margens" ? "Margem EBIT" : p.id === "retorno" ? "ROIC" : "Payout Ajustado",
    valor: p.id === "divida" ? Number((4 - radar[i] / 30).toFixed(1)) : Number((radar[i] / 1.2).toFixed(1)),
    unidade: p.id === "divida" ? "x" : p.id === "caixa" ? "R$ bi" : "%",
    periodo: "2025",
    domain: p.id === "divida" ? [0, 4] : p.id === "caixa" ? [0, 10] : [0, 100],
    historico: [
      { label: "2022", value: Math.max(0, radar[i] - 10) },
      { label: "2023", value: Math.max(0, radar[i] - 6) },
      { label: "2024", value: Math.max(0, radar[i] - 3) },
      { label: "2025", value: radar[i] },
    ],
    ensino: [
      "Historico importa mais do que um ponto isolado.",
      "Compare o pilar com a tendencia do setor.",
      "Mudanca persistente tende a sinalizar virada real.",
    ],
    metodologia: `Usamos regra fixa para ${p.nome.toLowerCase()} com ajustes de comparabilidade anual.`,
    source: src,
  }));
  const feed: Feed[] = [
    { id: `${ticker}-1`, sev: "Moderada", status: saude, titulo: `${ticker} - Ajuste recente em Margens`, impacto: "Pode reduzir ritmo de lucro se persistir.", pilar: "Margens", data: src.data, source: src },
    { id: `${ticker}-2`, sev: "Leve", status: "Saudavel", titulo: `${ticker} - Sinal positivo em Caixa/FCF`, impacto: "Aumenta flexibilidade para investir e amortizar.", pilar: "Caixa/FCF", data: src.data, source: src },
    { id: `${ticker}-3`, sev: saude === "Atencao" ? "Forte" : "Moderada", status: saude, titulo: `${ticker} - Variação em Dívida`, impacto: "Pode mudar o status geral no próximo ciclo.", pilar: "Dívida", data: src.data, source: src },
    { id: `${ticker}-4`, sev: "Leve", titulo: `${ticker} - Novo documento consolidado`, impacto: "Melhora confiabilidade da leitura historica.", pilar: "Fontes", data: src.data, source: src },
  ];
  return { ticker, nome, setor, saude, conf: ticker === "PETR4" ? "Media" : "Alta", atualizado: src.data, forte: "Retorno consistente e disciplina de capital.", atencao: "Oscilação recente de margens e proventos.", observar: "Evolução de caixa livre e alavancagem no próximo trimestre.", radar, evidencias, feed };
}

const COMPANIES: Company[] = [
  mkCompany("WEGE3", "WEG", "Bens Industriais", [71, 78, 62, 84, 67], "Saudavel"),
  mkCompany("VALE3", "Vale", "Materiais Basicos", [58, 73, 65, 69, 48], "Atencao"),
  mkCompany("ITUB4", "Itau Unibanco", "Financeiro", [67, 74, 63, 81, 72], "Saudavel"),
  mkCompany("PETR4", "Petrobras", "Petroleo e Gas", [52, 66, 61, 64, 54], "Atencao"),
];

const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));

function AppLogo() {
  return (
    <span className="inline-flex items-center gap-2">
      <span className="grid size-8 place-items-center rounded-xl border border-[#CFE9E5] bg-[#E7F6F3] text-[#0E9384]">
        <span className="size-3 rounded-[3px] border-2 border-current" />
      </span>
      <span className="text-[16px] font-semibold text-[#0B1220]">Analiso</span>
    </span>
  );
}

function DrawerPanel({ drawer, onClose }: { drawer: DrawerState; onClose: () => void }) {
  if (drawer.kind === null) return null;
  const title = drawer.kind === "fontes" ? "Fontes oficiais" : drawer.kind === "source" ? "Detalhes da fonte" : drawer.kind === "metodologia" ? "Metodologia" : drawer.title;
  return (
    <div className="fixed inset-0 z-[90]">
      <button className="absolute inset-0 bg-[#0B1220]/30" onClick={onClose} aria-label="Fechar" />
      <aside className="absolute top-0 right-0 h-full w-[420px] border-l border-[#EAECF0] bg-white p-6 shadow-[-24px_0_60px_-40px_rgba(11,18,32,0.45)]">
        <div className="mb-6 flex items-center justify-between">
          <h3 className="text-[16px] font-semibold">{title}</h3>
          <button onClick={onClose} className="grid size-8 place-items-center rounded-full border border-[#EAECF0] text-[#475467] hover:border-[#0E9384] hover:text-[#0E9384]">
            <X className="size-4" />
          </button>
        </div>
        {drawer.kind === "fontes" ? (
          <div className="space-y-3 text-[14px] text-[#475467]">
            <p>Fontes primárias deste demo: CVM, B3 e RI.</p>
            <p>Todo card exibe documento e data coletada.</p>
            <p>Confiabilidade combina frescor e completude dos dados.</p>
          </div>
        ) : null}
        {drawer.kind === "source" ? (
          <div className="space-y-3 text-[14px] text-[#475467]">
            <p><span className="text-[12px] text-[#667085]">Fonte</span><br />{drawer.source.fonte}</p>
            <p><span className="text-[12px] text-[#667085]">Documento</span><br />{drawer.source.documento}</p>
            <p><span className="text-[12px] text-[#667085]">Data coletada</span><br />{drawer.source.data}</p>
            <p><span className="text-[12px] text-[#667085]">Como usamos</span><br />{drawer.source.comoUsamos}</p>
          </div>
        ) : null}
        {drawer.kind === "metodologia" ? (
          <div className="space-y-3 text-[14px] text-[#475467]">
            <p className="font-semibold text-[#0B1220]">{drawer.nome}</p>
            <p>{drawer.texto}</p>
            <p>Aplicamos a mesma regra entre empresas para comparacao consistente.</p>
          </div>
        ) : null}
        {drawer.kind === "trust" ? (
          <div className="space-y-3 text-[14px] text-[#475467]">
            {drawer.lines.map((line) => <p key={line}>{line}</p>)}
          </div>
        ) : null}
      </aside>
    </div>
  );
}

function BulletChart({ e }: { e: Evidence }) {
  const [min, max] = e.domain;
  const p = clamp(((e.valor - min) / (max - min)) * 100, 0, 100);
  return (
    <div>
      <div className="mb-2 flex items-center justify-between text-[12px] text-[#475467]">
        <span>{e.metrica}</span>
        <span>{e.valor} {e.unidade}</span>
      </div>
      <div className="relative h-3 overflow-hidden rounded-full border border-[#EAECF0]">
        <div className="absolute inset-y-0 left-0 w-1/3 bg-emerald-50" />
        <div className="absolute inset-y-0 left-1/3 w-1/3 bg-amber-50" />
        <div className="absolute inset-y-0 left-2/3 w-1/3 bg-rose-50" />
        <div className="absolute top-1/2 h-6 w-[2px] -translate-y-1/2 bg-[#0E9384]" style={{ left: `calc(${p}% - 1px)` }} />
      </div>
      <div className="mt-1 flex justify-between text-[11px] text-[#667085]"><span>Saudável</span><span>Atenção</span><span>Risco</span></div>
    </div>
  );
}

function HistoryChart({ e }: { e: Evidence }) {
  const w = 720;
  const h = 260;
  const px = 36;
  const py = 24;
  const min = Math.min(...e.historico.map((x) => x.value));
  const max = Math.max(...e.historico.map((x) => x.value));
  const lo = min === max ? min - 1 : min;
  const hi = min === max ? max + 1 : max;
  const pts = e.historico.map((v, i) => ({ ...v, x: px + (i / Math.max(e.historico.length - 1, 1)) * (w - px * 2), y: py + (1 - (v.value - lo) / (hi - lo)) * (h - py * 2) }));
  return (
    <div className="overflow-hidden rounded-xl border border-[#EAECF0] bg-white p-3">
      <svg viewBox={`0 0 ${w} ${h}`} className="h-[260px] w-full">
        {[0.2, 0.4, 0.6, 0.8].map((lv) => <line key={String(lv)} x1={px} y1={py + lv * (h - py * 2)} x2={w - px} y2={py + lv * (h - py * 2)} stroke="#EAECF0" strokeDasharray="4 6" />)}
        <polyline points={pts.map((p) => `${p.x},${p.y}`).join(" ")} fill="none" stroke="#0E9384" strokeWidth="3" />
        {pts.map((p) => (
          <g key={p.label}>
            <circle cx={p.x} cy={p.y} r="4.5" fill="#fff" stroke="#0E9384" strokeWidth="2" />
            <text x={p.x} y={h - 6} textAnchor="middle" fontSize="12" fill="#667085">{p.label}</text>
          </g>
        ))}
      </svg>
    </div>
  );
}

function Radar({ values, active, onActive }: { values: [number, number, number, number, number]; active: number; onActive: (n: number) => void }) {
  const s = 340;
  const c = s / 2;
  const r = 112;
  const step = (Math.PI * 2) / PILLARS.length;
  const axis = PILLARS.map((_, i) => {
    const a = -Math.PI / 2 + i * step;
    return { x: c + Math.cos(a) * r, y: c + Math.sin(a) * r, lx: c + Math.cos(a) * (r + 30), ly: c + Math.sin(a) * (r + 30) };
  });
  const poly = values.map((v, i) => {
    const a = -Math.PI / 2 + i * step;
    const rr = (clamp(v, 0, 100) / 100) * r;
    return `${c + Math.cos(a) * rr},${c + Math.sin(a) * rr}`;
  }).join(" ");
  return (
    <div className="overflow-hidden rounded-2xl border border-[#EAECF0] bg-[radial-gradient(circle_at_top,#f5fffd,#ffffff_65%)] p-4">
      <svg viewBox={`0 0 ${s} ${s}`} className="h-[300px] w-full">
        {[0.25, 0.5, 0.75, 1].map((lv) => {
          const p = PILLARS.map((_, i) => {
            const a = -Math.PI / 2 + i * step;
            return `${c + Math.cos(a) * r * lv},${c + Math.sin(a) * r * lv}`;
          }).join(" ");
          return <polygon key={String(lv)} points={p} fill="none" stroke="#D9E5E2" strokeWidth="1" />;
        })}
        {axis.map((pt, i) => <line key={PILLARS[i].id} x1={c} y1={c} x2={pt.x} y2={pt.y} stroke={active === i ? "#0E9384" : "#D9E5E2"} strokeWidth={active === i ? 2 : 1} />)}
        <polygon points={poly} fill="rgba(14,147,132,0.22)" stroke="#0E9384" strokeWidth="2.2" />
        {axis.map((pt, i) => (
          <g key={`l-${PILLARS[i].id}`}>
            <circle cx={pt.lx} cy={pt.ly - 5} r={18} fill="transparent" onMouseEnter={() => onActive(i)} onClick={() => onActive(i)} />
            <text x={pt.lx} y={pt.ly} textAnchor="middle" fontSize="12" fill={active === i ? "#0E9384" : "#475467"} fontWeight={active === i ? 700 : 500}>{PILLARS[i].nome}</text>
          </g>
        ))}
      </svg>
      <div className="mt-2 rounded-xl border border-[#D9EEEA] bg-[#F4FBF9] px-3 py-2 text-[12px] text-[#475467]">
        <p className="font-semibold text-[#0B1220]">{PILLARS[active].nome}</p>
        <p>{PILLARS[active].hint}</p>
      </div>
    </div>
  );
}

export function DemoPage() {
  const coreRef = useRef<HTMLElement | null>(null);
  const summaryRef = useRef<HTMLElement | null>(null);
  const evidRef = useRef<HTMLElement | null>(null);
  const changesRef = useRef<HTMLElement | null>(null);

  const [query, setQuery] = useState("WEGE3 - WEG");
  const [ticker, setTicker] = useState<Company["ticker"]>("WEGE3");
  const [loading, setLoading] = useState(false);
  const [axis, setAxis] = useState(0);
  const [step, setStep] = useState<"resumo" | "evidencias" | "mudancas">("resumo");
  const [expanded, setExpanded] = useState<PillarId | null>(null);
  const [drawer, setDrawer] = useState<DrawerState>({ kind: null });
  const [faq, setFaq] = useState(0);

  const company = useMemo(() => COMPANIES.find((c) => c.ticker === ticker) ?? COMPANIES[0], [ticker]);

  useEffect(() => {
    const maps: Array<{ ref: RefObject<HTMLElement | null>; key: "resumo" | "evidencias" | "mudancas" }> = [
      { ref: summaryRef, key: "resumo" },
      { ref: evidRef, key: "evidencias" },
      { ref: changesRef, key: "mudancas" },
    ];
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          const m = maps.find((x) => x.ref.current === e.target);
          if (m) setStep(m.key);
        }
      });
    }, { rootMargin: "-35% 0px -55% 0px", threshold: 0.01 });
    maps.forEach((m) => m.ref.current && io.observe(m.ref.current));
    return () => io.disconnect();
  }, []);

  const generateDemo = () => {
    const next = COMPANIES.find((c) => query.toUpperCase().includes(c.ticker) || query.toUpperCase().includes(c.nome.toUpperCase())) ?? COMPANIES[0];
    setLoading(true);
    window.setTimeout(() => {
      setTicker(next.ticker);
      setQuery(`${next.ticker} - ${next.nome}`);
      setAxis(0);
      setExpanded(null);
      setLoading(false);
      coreRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 850);
  };

  return (
    <div className="min-h-screen bg-white text-[#0B1220]">
      <header className="sticky top-0 z-50 border-b border-[#EAECF0] bg-white/95 backdrop-blur-sm">
        <div className="mx-auto flex h-16 w-full max-w-[1200px] items-center justify-between px-10">
          <div className="flex items-center gap-5">
            <AppLogo />
            <Link to="/" className="inline-flex items-center gap-1 text-[12px] text-[#475467] hover:text-[#0E9384]">
              <ChevronLeft className="size-3.5" />
              Voltar
            </Link>
          </div>
          <Link to="/login" className="inline-flex h-10 items-center justify-center rounded-full bg-[#0E9384] px-5 text-[14px] font-semibold text-white transition-colors hover:bg-[#0A7D72] active:bg-[#07665D]">
            Criar conta grátis
          </Link>
        </div>
      </header>

      <main className="pb-14">
        <section className="border-b border-[#EAECF0] px-10 py-14">
          <div className="mx-auto max-w-[1200px]">
            <div className="text-center">
              <h1 className="text-[38px] leading-tight font-semibold tracking-[-0.03em]">Veja um diagnóstico em 60 segundos.</h1>
              <p className="mx-auto mt-4 max-w-[740px] text-[14px] text-[#475467]">5 pilares fixos + fontes oficiais. Sem se perder em indicadores.</p>
            </div>
            <div className="mx-auto mt-9 w-full max-w-[760px] rounded-2xl border border-[#EAECF0] bg-white p-6 shadow-[0_20px_40px_-34px_rgba(11,18,32,0.45)]">
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Busque uma empresa ou ticker..."
                className="h-12 w-full rounded-xl border border-[#D0D5DD] px-4 text-[14px] text-[#0B1220] placeholder:text-[#667085] focus:border-[#0E9384] focus:outline-none focus:ring-2 focus:ring-[#0E9384]/15"
              />
              <div className="mt-4 flex flex-wrap gap-2">
                {COMPANIES.map((c) => (
                  <button
                    key={c.ticker}
                    onClick={() => setQuery(`${c.ticker} - ${c.nome}`)}
                    className={`rounded-full border px-3 py-1.5 text-[12px] transition-colors ${
                      query.toUpperCase().includes(c.ticker) ? "border-[#0E9384] bg-[#E7F6F3] text-[#0E9384]" : "border-[#EAECF0] text-[#475467] hover:border-[#0E9384]/40 hover:text-[#0E9384]"
                    }`}
                  >
                    {c.ticker}
                  </button>
                ))}
              </div>
              <button onClick={generateDemo} className="mt-5 inline-flex h-11 items-center justify-center rounded-full bg-[#0E9384] px-6 text-[14px] font-semibold text-white transition-colors hover:bg-[#0A7D72] active:bg-[#07665D]">
                Gerar demo
              </button>
            </div>
          </div>
        </section>

        <section ref={coreRef} className="px-10 py-12">
          <div className="mx-auto grid max-w-[1200px] grid-cols-12 gap-6">
            <aside className="col-span-3">
              <div className="sticky top-24 rounded-2xl border border-[#EAECF0] bg-white p-4">
                <p className="text-[12px] font-semibold">Progresso da demo</p>
                <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-[#EAECF0]">
                  <div className="h-full rounded-full bg-[#0E9384] transition-all duration-500" style={{ width: step === "resumo" ? "33%" : step === "evidencias" ? "66%" : "100%" }} />
                </div>
                <div className="mt-4 space-y-2 text-[12px]">
                  <button onClick={() => summaryRef.current?.scrollIntoView({ behavior: "smooth" })} className={`flex w-full items-center justify-between rounded-lg px-2 py-1.5 ${step === "resumo" ? "bg-[#E7F6F3] text-[#0E9384]" : "text-[#475467] hover:bg-[#F9FAFB]"}`}><span>1) Resumo (60s)</span><ChevronRight className="size-3.5" /></button>
                  <button onClick={() => evidRef.current?.scrollIntoView({ behavior: "smooth" })} className={`flex w-full items-center justify-between rounded-lg px-2 py-1.5 ${step === "evidencias" ? "bg-[#E7F6F3] text-[#0E9384]" : "text-[#475467] hover:bg-[#F9FAFB]"}`}><span>2) Evidências</span><ChevronRight className="size-3.5" /></button>
                  <button onClick={() => changesRef.current?.scrollIntoView({ behavior: "smooth" })} className={`flex w-full items-center justify-between rounded-lg px-2 py-1.5 ${step === "mudancas" ? "bg-[#E7F6F3] text-[#0E9384]" : "text-[#475467] hover:bg-[#F9FAFB]"}`}><span>3) Mudanças</span><ChevronRight className="size-3.5" /></button>
                </div>
              </div>
            </aside>

            <div className="col-span-9 space-y-9">
              <section ref={summaryRef} className="space-y-4">
                <div className="grid grid-cols-2 gap-6 rounded-2xl border border-[#EAECF0] bg-white p-6">
                  {loading ? (
                    <>
                      <div className="space-y-3">
                        <div className="h-5 w-2/3 animate-pulse rounded bg-[#EAECF0]" />
                        <div className="h-4 w-1/2 animate-pulse rounded bg-[#EAECF0]" />
                        <div className="h-4 w-4/5 animate-pulse rounded bg-[#EAECF0]" />
                        <div className="h-4 w-3/4 animate-pulse rounded bg-[#EAECF0]" />
                      </div>
                      <div className="h-[300px] animate-pulse rounded-2xl border border-[#EAECF0] bg-[#F9FAFB]" />
                    </>
                  ) : (
                    <>
                      <div>
                        <p className="text-[16px] font-semibold">{company.nome} ({company.ticker}) • {company.setor}</p>
                        <div className="mt-3 flex items-center gap-2">
                          <span className="text-[12px] text-[#475467]">Saúde geral</span>
                          <span className={`inline-flex rounded-full border px-2.5 py-1 text-[12px] font-semibold ${STATUS_STYLE[company.saude]}`}>{HEALTH_LABEL[company.saude]}</span>
                        </div>
                        <ul className="mt-5 space-y-2 text-[14px] text-[#475467]">
                          <li><span className="font-semibold text-[#0B1220]">Ponto forte:</span> {company.forte}</li>
                          <li><span className="font-semibold text-[#0B1220]">Atenção:</span> {company.atencao}</li>
                          <li><span className="font-semibold text-[#0B1220]">O que observar:</span> {company.observar}</li>
                        </ul>
                      </div>
                      <Radar values={company.radar} active={axis} onActive={setAxis} />
                    </>
                  )}
                </div>
                <div className="flex items-center justify-between rounded-xl border border-[#EAECF0] bg-[#FCFDFD] px-4 py-3 text-[12px] text-[#475467]">
                  <span>Atualizado em {company.atualizado} • Fonte primária: CVM/B3/RI • Confiabilidade: {company.conf === "Media" ? "Média" : "Alta"}</span>
                  <button onClick={() => setDrawer({ kind: "fontes" })} className="font-semibold text-[#0E9384] hover:text-[#0A7D72]">Ver fontes</button>
                </div>
              </section>

              <section ref={evidRef} className="space-y-4">
                <div>
                  <h2 className="text-[20px] font-semibold">Evidências (sem enrolação)</h2>
                  <p className="mt-1 text-[14px] text-[#475467]">Cada pilar tem um resumo didático + um gráfico pequeno que prova o ponto.</p>
                </div>
                <div className="space-y-4">
                  {company.evidencias.map((e) => {
                    const open = expanded === e.id;
                    return (
                      <article key={e.id} className="rounded-2xl border border-[#EAECF0] bg-white p-4">
                        <button onClick={() => setExpanded((x) => x === e.id ? null : e.id)} className="w-full text-left">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <h3 className="text-[16px] font-semibold">{e.nome}</h3>
                              <span className={`inline-flex rounded-full border px-2 py-1 text-[11px] font-semibold ${STATUS_STYLE[e.status]}`}>{HEALTH_LABEL[e.status]}</span>
                            </div>
                            <ChevronDown className={`size-4 text-[#667085] transition-transform ${open ? "rotate-180" : "rotate-0"}`} />
                          </div>
                          <p className="mt-2 text-[14px] text-[#475467]"><span className="font-medium text-[#0B1220]">Resumo:</span> {e.resumo}</p>
                          <p className="mt-1 text-[14px] text-[#475467]"><span className="font-medium text-[#0B1220]">Por que importa:</span> {e.importancia}</p>
                          <div className="mt-4"><BulletChart e={e} /></div>
                        </button>
                        <div className="mt-4 flex items-center justify-between border-t border-[#EAECF0] pt-3 text-[12px] text-[#667085]">
                          <span>Fonte: {e.source.fonte} • Documento: {e.source.documento} • Data: {e.source.data}</span>
                          <button onClick={() => setDrawer({ kind: "source", source: e.source })} className="font-semibold text-[#0E9384] hover:text-[#0A7D72]">Fonte</button>
                        </div>
                        <div className={`grid transition-all duration-300 ${open ? "mt-4 grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}>
                          <div className="overflow-hidden">
                            <HistoryChart e={e} />
                            <div className="mt-4 grid gap-2 text-[14px] text-[#475467]">{e.ensino.map((line) => <p key={line}>• {line}</p>)}</div>
                            <div className="mt-3 rounded-xl border border-[#EAECF0] bg-[#FCFDFD] p-3 text-[13px] text-[#475467]">
                              <p style={{ display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{e.metodologia}</p>
                              <button onClick={() => setDrawer({ kind: "metodologia", nome: e.nome, texto: e.metodologia })} className="mt-2 text-[12px] font-semibold text-[#0E9384] hover:text-[#0A7D72]">Ver metodologia</button>
                            </div>
                          </div>
                        </div>
                      </article>
                    );
                  })}
                </div>
              </section>

              <section ref={changesRef} className="space-y-4">
                <h2 className="text-[20px] font-semibold">Mudanças que importam</h2>
                <div className="space-y-3">
                  {company.feed.slice(0, 6).map((f) => (
                    <article key={f.id} className="rounded-2xl border border-[#EAECF0] bg-white p-4">
                      <div className="grid grid-cols-[1fr_auto] gap-4">
                        <div>
                          <div className="mb-2 flex items-center gap-2">
                            <span className={`inline-flex rounded-full border px-2 py-1 text-[11px] font-semibold ${SEV_STYLE[f.sev]}`}>{f.sev}</span>
                            {f.status ? <span className={`inline-flex rounded-full border px-2 py-1 text-[11px] font-semibold ${STATUS_STYLE[f.status]}`}>{HEALTH_LABEL[f.status]}</span> : null}
                          </div>
                          <p className="text-[14px] font-semibold">{f.titulo}</p>
                          <p className="mt-1 text-[14px] text-[#475467]">Por que importa: {f.impacto}</p>
                          <p className="mt-2 text-[12px] text-[#667085]">Impacta: {f.pilar} • {f.data}</p>
                        </div>
                        <div className="flex min-w-[210px] flex-col items-end justify-between">
                          <button onClick={() => setDrawer({ kind: "source", source: f.source })} className="inline-flex items-center gap-1 text-[12px] text-[#475467] hover:text-[#0E9384]"><FileText className="size-3.5" />Fonte: {f.source.fonte} • Atualizado</button>
                          <button className="mt-4 inline-flex h-8 items-center rounded-full border border-[#D0D5DD] px-3 text-[12px] font-semibold hover:border-[#0E9384] hover:text-[#0E9384]">Abrir analise completa</button>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              </section>
            </div>
          </div>
        </section>

        <section className="px-10 py-8">
          <div className="mx-auto max-w-[1200px] rounded-2xl border border-[#CFE9E5] bg-[#E7F6F3] p-7">
            <h3 className="text-[28px] leading-tight font-semibold">Quer acompanhar isso automaticamente?</h3>
            <ul className="mt-4 space-y-2 text-[14px]">
              <li>• Alertas quando algum pilar mudar</li>
              <li>• Watchlist com status (Saudável/Atenção/Risco)</li>
              <li>• Rastreabilidade por documento e data</li>
            </ul>
            <div className="mt-6 flex gap-3">
              <Link to="/login" className="inline-flex h-11 items-center justify-center rounded-full bg-[#0E9384] px-6 text-[14px] font-semibold text-white transition-colors hover:bg-[#0A7D72] active:bg-[#07665D]">Criar conta grátis</Link>
              <button className="inline-flex h-11 items-center justify-center rounded-full border border-[#0E9384] bg-white px-6 text-[14px] font-semibold text-[#0E9384] hover:bg-[#F4FBF9]">Ver planos</button>
            </div>
          </div>
        </section>

        <section className="px-10 py-8">
          <div className="mx-auto max-w-[1200px]">
            <h3 className="text-[24px] font-semibold">Transparência que dá confiança</h3>
            <div className="mt-4 grid grid-cols-3 gap-4">
              {[
                { title: "Fontes oficiais", subtitle: "CVM/B3/RI", icon: Building2, lines: ["A leitura usa fontes primárias públicas.", "Cada evidência aponta documento e data.", "Sem agregadores opacos."] },
                { title: "Atualização por documento", subtitle: "Com data visível", icon: Waves, lines: ["Quando entra documento novo, o card atualiza.", "Frescor aparece junto de cada insight.", "Você entende o que mudou rapidamente."] },
                { title: "Metodologia clara", subtitle: "Sem caixa-preta", icon: ShieldCheck, lines: ["Cada pilar tem regra curta e explicada.", "Metricas sao normalizadas para comparacao justa.", "Interpretacao em linguagem simples."] },
              ].map((card) => (
                <button key={card.title} onClick={() => setDrawer({ kind: "trust", title: card.title, lines: card.lines })} className="rounded-2xl border border-[#EAECF0] bg-white p-5 text-left hover:border-[#0E9384]/45">
                  <span className="grid size-10 place-items-center rounded-xl border border-[#CFE9E5] bg-[#E7F6F3] text-[#0E9384]"><card.icon className="size-5" /></span>
                  <p className="mt-3 text-[16px] font-semibold">{card.title}</p>
                  <p className="mt-1 text-[14px] text-[#475467]">{card.subtitle}</p>
                </button>
              ))}
            </div>
          </div>
        </section>

        <section className="px-10 py-8">
          <div className="mx-auto max-w-[1200px]">
            <h3 className="text-[24px] font-semibold">FAQ rápido</h3>
            <div className="mt-4 rounded-2xl border border-[#EAECF0]">
              {[
                { q: "Isso é recomendação de compra/venda?", a: "Não. O Analiso é educacional e organiza contexto para apoiar seu estudo." },
                { q: "De onde vêm os dados?", a: "De fontes oficiais: CVM, B3 e RI. Cada card mostra documento e data." },
                { q: "Como vocês calculam os pilares?", a: "Usamos regras fixas por pilar, com métrica principal e histórico comparável." },
              ].map((item, i, arr) => (
                <div key={item.q} className={i === arr.length - 1 ? "" : "border-b border-[#EAECF0]"}>
                  <button onClick={() => setFaq((x) => x === i ? -1 : i)} className="flex w-full items-center justify-between px-4 py-4 text-left text-[14px] font-semibold">
                    {item.q}
                    <ChevronDown className={`size-4 text-[#667085] transition-transform ${faq === i ? "rotate-180" : ""}`} />
                  </button>
                  <div className={`grid transition-all duration-300 ${faq === i ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}><div className="overflow-hidden px-4 pb-4 text-[14px] text-[#475467]">{item.a}</div></div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <DrawerPanel drawer={drawer} onClose={() => setDrawer({ kind: null })} />
    </div>
  );
}

export default DemoPage;

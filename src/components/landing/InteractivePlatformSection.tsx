import { useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
import {
  Bell,
  Compass,
  GitCompare,
  LayoutDashboard,
  Search,
  TrendingUp,
} from "lucide-react";
import logoWeg from "../../assets/logos/weg.jpeg";
import logoVale from "../../assets/logos/vale.png";
import logoRenner from "../../assets/logos/renner.png";
import logoFleury from "../../assets/logos/fleury.png";

type PlatformTab = "dashboard" | "explorar" | "watchlist" | "comparacao";

const tabItems: { id: PlatformTab; label: string; helper: string }[] = [
  {
    id: "dashboard",
    label: "Dashboard de Clareza",
    helper: "Visão consolidada para entender o que importa rapidamente.",
  },
  {
    id: "explorar",
    label: "Explorar",
    helper: "Encontre empresas e entenda o essencial em minutos, sem se perder em indicadores.",
  },
  {
    id: "watchlist",
    label: "Watchlist",
    helper: "Acompanhe suas empresas e veja o que mudou com alertas e fonte oficial.",
  },
  {
    id: "comparacao",
    label: "Comparação",
    helper: "Compare empresas lado a lado e veja diferenças claras nos pilares que importam.",
  },
];

function ShellLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-full w-full overflow-hidden rounded-[28px] border border-[#E5E7EB] bg-white">
      <aside className="flex w-[76px] shrink-0 flex-col items-center border-r border-[#E5E7EB] bg-[#F8FAFC] py-5">
        <div className="mb-5 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[#0E9384] text-white">
          <LayoutDashboard className="h-5 w-5" />
        </div>
        <div className="flex flex-1 flex-col items-center gap-3">
          <button className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-[#E8F6F4] text-[#0E9384]">
            <LayoutDashboard className="h-4 w-4" />
          </button>
          <button className="inline-flex h-9 w-9 items-center justify-center rounded-xl text-[#94A3B8]">
            <Compass className="h-4 w-4" />
          </button>
          <button className="inline-flex h-9 w-9 items-center justify-center rounded-xl text-[#94A3B8]">
            <TrendingUp className="h-4 w-4" />
          </button>
          <button className="inline-flex h-9 w-9 items-center justify-center rounded-xl text-[#94A3B8]">
            <GitCompare className="h-4 w-4" />
          </button>
          <button className="inline-flex h-9 w-9 items-center justify-center rounded-xl text-[#94A3B8]">
            <Bell className="h-4 w-4" />
          </button>
        </div>
      </aside>

      <div className="min-w-0 flex-1 bg-[#F4F6F9] p-4">{children}</div>
    </div>
  );
}

function DashboardPanel() {
  return (
    <div className="h-full w-full">
      <header className="rounded-2xl border border-[#E5E7EB] bg-white px-4 py-3">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-[18px] font-semibold text-[#0B1220]">Bem-vindo de volta, Pablo!</p>
            <p className="mt-0.5 text-[12px] text-[#667085]">Dashboard</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#98A2B3]" />
              <input
                value=""
                readOnly
                className="h-9 w-[220px] rounded-xl border border-[#EAECF0] bg-white py-2 pl-8 pr-3 text-[12px]"
                aria-label="Buscar empresa ou ticker"
              />
            </div>
            <button className="relative inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[#EAECF0] text-[#667085]">
              <Bell className="h-4 w-4" />
              <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-rose-500" />
            </button>
          </div>
        </div>
      </header>

      <section className="mt-3 grid grid-cols-4 gap-3">
        {[
          {
            title: "Saúde da watchlist",
            value: "59%",
            subtitle: "empresas saudáveis",
            delta: "+2,1 p.p vs semana passada",
            deltaPositive: true,
            ctaLabel: "Ver detalhes",
          },
          {
            title: "Empresas monitoradas",
            value: "20",
            subtitle: "na watchlist",
            delta: "+2 este mês",
            deltaPositive: true,
            ctaLabel: "Ver lista",
          },
          {
            title: "Mudanças hoje",
            value: "14",
            subtitle: "eventos relevantes",
            delta: "-0,8 vs ontem",
            deltaPositive: false,
            ctaLabel: "Abrir inbox",
          },
          {
            title: "Alertas ativos",
            value: "9",
            subtitle: "monitoramentos em aberto",
            delta: "+20,1% este mês",
            deltaPositive: true,
            ctaLabel: "Ver alertas",
          },
        ].map((card) => (
          <article key={card.title} className="rounded-xl border border-[#E8EAED] bg-white p-3">
            <p className="text-[11px] text-[#667085]">{card.title}</p>
            {card.title === "Saúde da watchlist" ? (
              <div className="mt-1 flex items-center gap-2">
                <div
                  className="h-10 w-10 shrink-0 rounded-full"
                  style={{
                    background: "conic-gradient(#22C55E 0 59%, #F59E0B 59% 87%, #EF4444 87% 100%)",
                  }}
                >
                  <div className="m-[4px] h-8 w-8 rounded-full bg-white" />
                </div>
                <div>
                  <p className="text-[24px] font-semibold leading-none text-[#101828]">{card.value}</p>
                  <p className="mt-1 text-[10px] text-[#667085]">{card.subtitle}</p>
                </div>
              </div>
            ) : (
              <>
                <p className="mt-1 text-[24px] font-semibold leading-none text-[#101828]">{card.value}</p>
                <p className="mt-1 text-[10px] text-[#667085]">{card.subtitle}</p>
              </>
            )}
            <p className={`mt-1 text-[10px] font-medium ${card.deltaPositive ? "text-emerald-600" : "text-rose-600"}`}>{card.delta}</p>
            <p className="mt-1 text-[10px] font-semibold text-[#0E9384]">{card.ctaLabel}</p>
          </article>
        ))}
      </section>

      <div className="mt-3 grid grid-cols-12 gap-3">
        <article className="col-span-8 rounded-xl border border-[#E8EAED] bg-white p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[14px] font-semibold text-[#101828]">Atualizações da watchlist</p>
              <p className="text-[11px] text-[#667085]">Tudo que mudou na sua watchlist, com prioridade e motivo.</p>
            </div>
            <div className="inline-flex rounded-lg border border-[#D0D5DD] bg-white p-0.5 text-[11px]">
              <button className="rounded-md bg-[#0E9384] px-2 py-1 text-white">Top impacto</button>
              <button className="rounded-md px-2 py-1 text-[#667085]">Tempo real</button>
            </div>
          </div>

          <div className="mt-2 space-y-2">
            {[
              {
                t: "VALE3",
                n: "Vale",
                title: "Dívida líquida/EBITDA acima do limite interno",
                why: "Por que importa: aumento da alavancagem pode reduzir flexibilidade financeira.",
                s: "Risco",
                logo: logoVale,
              },
              {
                t: "LREN3",
                n: "Lojas Renner",
                title: "Margens pressionadas no trimestre",
                why: "Por que importa: compressão de margem pode limitar revisão positiva de lucro.",
                s: "Atenção",
                logo: logoRenner,
              },
              {
                t: "WEGE3",
                n: "WEG",
                title: "Resultado 4T25 agendado para esta semana",
                why: "Por que importa: evento pode alterar diagnóstico de margens e retorno.",
                s: "Atenção",
                logo: logoWeg,
              },
            ].map((row) => (
              <div key={row.t} className="rounded-lg border border-[#EEF2F6] bg-[#FCFDFD] p-2.5">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-2">
                    <img src={row.logo} alt={row.n} className="h-7 w-7 rounded-md object-cover" loading="lazy" />
                    <div>
                      <p className="text-[11px] font-semibold text-[#344054]">{row.t} - {row.n}</p>
                      <p className="text-[12px] font-medium text-[#101828]">{row.title}</p>
                      <p className="mt-0.5 text-[11px] text-[#667085]">{row.why}</p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1.5">
                    <span className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold ${row.s === "Risco" ? "border-rose-300 bg-rose-100 text-rose-900" : "border-amber-300 bg-amber-100 text-amber-900"}`}>
                      {row.s}
                    </span>
                    <button className="text-[11px] font-semibold text-[#0E9384] hover:text-[#0B7F74]">Abrir análise</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </article>

        <article className="col-span-4 rounded-xl border border-[#E8EAED] bg-white p-3">
          <p className="text-[14px] font-semibold text-[#101828]">Pilares em movimento</p>
          <p className="text-[11px] text-[#667085]">Onde sua watchlist mais mexeu.</p>
          <div className="mt-2 space-y-2">
            {[
              ["Dívida", "12 eventos", "up 18%", true, 3, 7, 2],
              ["Margens", "9 eventos", "up 10%", true, 2, 6, 1],
              ["Caixa", "7 eventos", "down 6%", false, 1, 2, 4],
            ].map(([pillar, events, trend, trendUp, risk, attention, healthy]) => (
              <div key={pillar} className="rounded-lg border border-[#EEF2F6] bg-[#FCFDFD] p-2.5">
                <div className="flex items-center justify-between text-[11px]">
                  <p className="font-semibold text-[#101828]">{pillar}</p>
                  <p className={`${trendUp ? "text-emerald-600" : "text-rose-600"}`}>{trend}</p>
                </div>
                <p className="text-[10px] text-[#667085]">{events}</p>
                <div className="mt-1.5 flex h-1.5 w-full overflow-hidden rounded-full bg-[#F2F4F7]">
                  <span style={{ width: `${(Number(healthy) / (Number(healthy) + Number(attention) + Number(risk))) * 100}%` }} className="bg-emerald-500" />
                  <span style={{ width: `${(Number(attention) / (Number(healthy) + Number(attention) + Number(risk))) * 100}%` }} className="bg-amber-400" />
                  <span style={{ width: `${(Number(risk) / (Number(healthy) + Number(attention) + Number(risk))) * 100}%` }} className="bg-rose-500" />
                </div>
              </div>
            ))}
          </div>
        </article>
      </div>
    </div>
  );
}

function ExplorarPanel() {
  const indexCards = [
    { name: "Ibovespa", symbol: "IBOV", value: "127.540", changeAbs: "+680", changePct: "+0,54%" },
    { name: "IFIX", symbol: "IFIX", value: "3.322", changeAbs: "+14", changePct: "+0,42%" },
    { name: "Dólar", symbol: "USDBRL", value: "R$ 4,92", changeAbs: "-0,03", changePct: "-0,61%" },
    { name: "S&P 500", symbol: "SPX", value: "5.087", changeAbs: "+19", changePct: "+0,38%" },
    { name: "Nasdaq", symbol: "IXIC", value: "16.003", changeAbs: "+87", changePct: "+0,55%" },
  ];

  const movers = [
    { ticker: "VALE3", name: "Vale", price: "R$ 66,20", changePct: "+2,3%", note: "Fluxo comprador no setor de mineração." },
    { ticker: "LREN3", name: "Lojas Renner", price: "R$ 18,40", changePct: "-1,1%", note: "Pressão em margens no trimestre." },
    { ticker: "WEGE3", name: "WEG", price: "R$ 43,90", changePct: "+1,5%", note: "Expectativa para resultado 4T25." },
  ];

  const highlights = [
    {
      severity: "Moderada",
      ticker: "VALE3",
      title: "Dívida líquida/EBITDA acima do limite interno",
      why: "Aumento da alavancagem pode reduzir flexibilidade financeira.",
    },
    {
      severity: "Leve",
      ticker: "LREN3",
      title: "Margens pressionadas no trimestre",
      why: "Compressão de margem pode limitar revisão positiva de lucro.",
    },
  ];

  const companies = [
    { name: "Vale", ticker: "VALE3", sector: "Mineração", status: "Atenção", diagnosis: "Atenção em dívida, caixa ainda resiliente.", logo: logoVale },
    { name: "Lojas Renner", ticker: "LREN3", sector: "Consumo", status: "Saudável", diagnosis: "Melhora gradual em retorno e margens.", logo: logoRenner },
    { name: "Fleury", ticker: "FLRY3", sector: "Saúde", status: "Atenção", diagnosis: "Proventos e crescimento com sinais mistos.", logo: logoFleury },
  ];

  return (
    <div className="h-full w-full rounded-2xl border border-[#E5E7EB] bg-white p-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-[18px] font-semibold text-[#111827]">Panorama do mercado</p>
          <p className="text-[12px] text-[#6B7280]">Visão rápida dos principais índices da B3.</p>
        </div>
        <button className="inline-flex items-center gap-1 rounded-lg border border-[#E5E7EB] bg-white px-2.5 py-1.5 text-[11px] text-[#374151]">
          Atualizado em 06/02
        </button>
      </div>

      <div className="mt-3 grid grid-cols-5 gap-2">
        {indexCards.map((card) => (
          <article key={card.symbol} className="rounded-lg border border-[#E8EAED] bg-[#FCFDFD] p-2.5">
            <p className="text-[10px] text-[#667085]">{card.name}</p>
            <p className="text-[11px] font-semibold text-[#111827]">{card.symbol}</p>
            <p className="mt-1 text-[16px] font-semibold leading-none text-[#101828]">{card.value}</p>
            <p className={`mt-1 text-[10px] ${card.changePct.startsWith("-") ? "text-rose-600" : "text-emerald-600"}`}>
              {card.changeAbs} ({card.changePct})
            </p>
          </article>
        ))}
      </div>

      <section className="mt-3 grid grid-cols-2 gap-3">
        <div className="rounded-xl border border-[#E8EAED] bg-white p-3">
          <p className="text-[13px] font-semibold text-[#111827]">Maiores movimentos hoje</p>
          <p className="text-[11px] text-[#6B7280]">Comparativo intradia sem recomendação.</p>
          <div className="mt-2 space-y-2">
            {movers.map((row) => (
              <article key={row.ticker} className="rounded-lg border border-[#EEF2F6] bg-[#FCFDFD] p-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <img src={row.ticker === "VALE3" ? logoVale : row.ticker === "LREN3" ? logoRenner : logoWeg} alt={row.ticker} className="h-7 w-7 rounded-full border border-neutral-200 object-cover bg-white" />
                    <div>
                      <p className="text-[12px] font-semibold text-[#111827]">{row.ticker}</p>
                      <p className="text-[10px] text-[#6B7280]">{row.name}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-[11px] text-[#6B7280]">{row.price}</p>
                    <p className={`text-[12px] font-semibold ${row.changePct.startsWith("-") ? "text-rose-600" : "text-emerald-600"}`}>{row.changePct}</p>
                  </div>
                </div>
                <p className="mt-1 text-[10px] text-[#6B7280]">{row.note}</p>
              </article>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-[#E8EAED] bg-white p-3">
          <p className="text-[13px] font-semibold text-[#111827]">Resumo do dia</p>
          <p className="text-[11px] text-[#6B7280]">Curadoria educativa com base em fontes oficiais.</p>
          <div className="mt-2 space-y-2">
            {highlights.map((item) => (
              <article key={item.ticker} className="rounded-lg border border-[#EEF2F6] bg-[#FCFDFD] p-2.5">
                <span className={`inline-flex rounded-full border px-2 py-0.5 text-[10px] ${item.severity === "Moderada" ? "border-amber-300 bg-amber-100 text-amber-900" : "border-emerald-300 bg-emerald-100 text-emerald-900"}`}>
                  {item.severity}
                </span>
                <p className="mt-1 text-[12px] font-semibold text-[#111827]">{item.ticker} - {item.title}</p>
                <p className="mt-1 text-[11px] text-[#6B7280]">Por que importa: {item.why}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="mt-3">
        <div className="flex items-center justify-between mb-2">
          <p className="text-[13px] font-semibold text-[#111827]">Explorar por</p>
          <button className="text-[11px] text-[#6B7280]">Limpar seleção</button>
        </div>
        <div className="flex flex-wrap gap-2">
          {["Dívida sob controle", "Caixa forte", "Margens melhorando", "Retorno consistente", "Dados atualizados"].map((entry, idx) => (
            <button key={entry} className={`rounded-xl border px-3 py-2 text-[11px] ${idx === 0 ? "border-[#99E3DA] bg-[#E8F6F4] text-[#0E9384]" : "border-neutral-200 text-neutral-600"}`}>
              {entry}
            </button>
          ))}
        </div>
      </section>

      <section className="mt-3 space-y-2">
        <div className="flex items-center justify-between">
          <p className="text-[13px] font-semibold text-[#111827]">Empresas para você analisar</p>
          <p className="text-[11px] text-[#6B7280]">3 empresas</p>
        </div>
        {companies.map((item) => (
          <article key={item.ticker} className="rounded-xl border border-[#E8EAED] bg-white p-3">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <img src={item.logo} alt={item.name} className="h-8 w-8 rounded-full border border-neutral-200 object-cover bg-white" loading="lazy" />
                <div>
                  <p className="text-[13px] font-semibold text-[#111827]">{item.name} • {item.ticker}</p>
                  <p className="text-[11px] text-[#6B7280]">{item.sector}</p>
                </div>
              </div>
              <span
                className={`rounded-full border px-2 py-0.5 text-[10px] ${
                  item.status === "Saudável"
                    ? "border-emerald-300 bg-emerald-100 text-emerald-900"
                    : "border-amber-300 bg-amber-100 text-amber-900"
                }`}
              >
                {item.status}
              </span>
            </div>
            <p className="mt-1.5 text-[11px] text-[#667085]">{item.diagnosis}</p>
            <div className="mt-2 flex items-center gap-2">
              <button className="rounded-xl bg-[#0E9384] px-3 py-2 text-[11px] font-medium text-white">Abrir análise</button>
              <button className="rounded-xl border border-neutral-200 px-3 py-2 text-[11px] text-neutral-600">Comparar</button>
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}

function WatchlistPanel() {
  const priorityItems = [
    {
      company: "Vale",
      ticker: "VALE3",
      sector: "Mineração",
      badge: "Risco",
      change: "Dívida líquida/EBITDA acima do limite interno",
      why: "Aumento da alavancagem pode reduzir flexibilidade financeira.",
      evidence: "Fonte: CVM • ITR 3T25 • 04/02",
    },
    {
      company: "Lojas Renner",
      ticker: "LREN3",
      sector: "Varejo",
      badge: "Atenção",
      change: "Margens pressionadas no trimestre",
      why: "Compressão de margem pode limitar revisão positiva de lucro.",
      evidence: "Fonte: CVM • ITR 2T25 • 12/11",
    },
    {
      company: "WEG",
      ticker: "WEGE3",
      sector: "Indústria",
      badge: "Atenção",
      change: "Resultado 4T25 agendado para esta semana",
      why: "Evento pode alterar diagnóstico de Margens e Retorno.",
      evidence: "Fonte: RI • Comunicado • 02/02",
    },
  ];

  const feedItems = [
    {
      headline: "VALE3 - Dívida líquida/EBITDA acima do limite interno",
      severity: "Risco",
      pillar: "Dívida",
      detail: "Alavancagem subiu no trimestre e saiu da faixa de conforto.",
      detailTwo: "Exige monitoramento de caixa e vencimentos de curto prazo.",
      evidence: "Fonte: CVM • ITR 3T25 • 04/02",
    },
    {
      headline: "LREN3 - Margens pressionadas no trimestre",
      severity: "Atenção",
      pillar: "Margens",
      detail: "Custos operacionais cresceram acima da receita no período.",
      detailTwo: "Pode afetar velocidade de recuperação do lucro.",
      evidence: "Fonte: CVM • ITR 3T25 • 02/02",
    },
  ];

  return (
    <div className="h-full w-full rounded-2xl border border-[#E5E7EB] bg-[#F8FAFC] p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold text-neutral-900">Watchlist</h2>
          <p className="text-sm text-neutral-500">Triagem primeiro, organização depois. Foque no que mudou.</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-neutral-400" />
            <input
              type="text"
              readOnly
              placeholder="Buscar empresa ou ticker..."
              className="w-72 rounded-xl border border-neutral-200 bg-neutral-50 py-2 pl-9 pr-3 text-xs text-neutral-700"
            />
          </div>
          <button className="rounded-xl bg-[#0E9384] px-3 py-2 text-xs font-medium text-white">Adicionar empresa</button>
          <button className="rounded-xl border border-neutral-200 bg-white px-3 py-2 text-xs text-neutral-600">Comparar</button>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-12 gap-4">
        <section className="col-span-8 rounded-xl border border-neutral-200 bg-white p-4">
          <div className="flex items-center gap-2">
            <button className="rounded-xl border border-mint-200 bg-mint-50 px-4 py-2 text-xs font-medium text-mint-700">Atualizações</button>
            <button className="rounded-xl border border-neutral-200 px-4 py-2 text-xs font-medium text-neutral-600">Lista</button>
          </div>

          <section className="mt-4 rounded-xl border border-neutral-200 bg-white p-4">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-neutral-900">Prioridade</h2>
              <p className="text-xs text-neutral-500">Top 3 para agir primeiro.</p>
            </div>
            <span className="text-xs text-neutral-400">3 itens</span>
          </div>
          <div className="space-y-2">
            {priorityItems.map((item) => (
              <article key={item.ticker} className={`rounded-xl border border-neutral-200 border-l-4 bg-neutral-50 p-3 ${item.badge === "Risco" ? "border-l-rose-400" : "border-l-amber-400"}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-neutral-900">{item.company} <span className="text-neutral-400">({item.ticker})</span></p>
                    <p className="text-xs text-neutral-500">{item.sector}</p>
                  </div>
                  <span className={`rounded-full border px-2 py-1 text-[11px] font-medium ${item.badge === "Risco" ? "border-rose-300 bg-rose-100 text-rose-900" : "border-amber-300 bg-amber-100 text-amber-900"}`}>{item.badge}</span>
                </div>
                <div className="mt-2">
                  <p className="text-[11px] text-neutral-600">O que mudou</p>
                  <p className="text-sm text-neutral-900">{item.change}</p>
                  <p className="mt-1 text-xs text-neutral-700"><span className="font-medium">Por que importa:</span> {item.why}</p>
                </div>
                <div className="mt-2 flex items-center justify-between text-[11px] text-neutral-600">
                  <span>{item.evidence}</span>
                  <button className="rounded-md border border-mint-200 bg-mint-50 px-2 py-1 text-xs font-medium text-mint-700">Ver evidência</button>
                </div>
              </article>
            ))}
          </div>
        </section>

          <section className="mt-4 rounded-xl border border-neutral-200 bg-white p-4">
            <div className="mb-3 flex items-center justify-between">
              <div>
                <h2 className="text-base font-semibold text-neutral-900">Atualizações</h2>
                <p className="text-xs text-neutral-500">Feed contínuo com contexto, severidade e fonte.</p>
              </div>
              <span className="text-xs text-neutral-400">{feedItems.length} atualizações</span>
            </div>
            <div className="flex flex-wrap items-center gap-2 border-b border-neutral-200 pb-3">
              {["24h", "7d", "30d", "90d"].map((range) => (
                <button key={range} className={`rounded-xl border px-3 py-2 text-xs font-medium ${range === "30d" ? "border-mint-200 bg-mint-50 text-mint-700" : "border-neutral-200 text-neutral-600"}`}>{range}</button>
              ))}
              {["Todos", "Risco", "Atenção", "Saudável"].map((option) => (
                <button key={option} className={`rounded-xl border px-3 py-2 text-xs font-medium ${option === "Todos" ? "border-mint-200 bg-mint-50 text-mint-700" : "border-neutral-200 text-neutral-600"}`}>{option}</button>
              ))}
              {["Todas", "CVM", "B3", "RI"].map((option) => (
                <button key={option} className={`rounded-xl border px-3 py-2 text-xs font-medium ${option === "Todas" ? "border-mint-200 bg-mint-50 text-mint-700" : "border-neutral-200 text-neutral-600"}`}>Fonte: {option}</button>
              ))}
            </div>
            <div className="mt-3 space-y-2">
              {feedItems.map((item) => (
                <article key={item.headline} className={`rounded-xl border border-neutral-200 border-l-4 bg-neutral-50 p-3 ${item.severity === "Risco" ? "border-l-rose-400" : "border-l-amber-400"}`}>
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-neutral-900">{item.headline}</h3>
                    <div className="flex items-center gap-2">
                      <span className={`rounded-full border px-2 py-1 text-[11px] font-medium ${item.severity === "Risco" ? "border-rose-300 bg-rose-100 text-rose-900" : "border-amber-300 bg-amber-100 text-amber-900"}`}>{item.severity}</span>
                      <span className="rounded-full border border-[#D1FAE5] bg-[#ECFDF3] px-2 py-1 text-[11px] font-medium text-[#0E9384]">{item.pillar}</span>
                    </div>
                  </div>
                  <div className="mt-2 text-sm text-neutral-700">
                    <p>{item.detail}</p>
                    <p>{item.detailTwo}</p>
                  </div>
                  <div className="mt-2 flex items-center justify-between text-[11px] text-neutral-600">
                    <span>{item.evidence}</span>
                    <button className="rounded-md border border-mint-200 bg-mint-50 px-2 py-1 text-xs font-medium text-mint-700">Ver evidência</button>
                  </div>
                </article>
              ))}
            </div>
          </section>
        </section>

        <aside className="col-span-4 space-y-4">
          <div className="rounded-xl border border-neutral-200 bg-white p-4">
            <div className="mb-2 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-neutral-900">Resumo da Watchlist em 30s</h3>
              <span className="text-[11px] text-neutral-400">Hoje</span>
            </div>
            <p className="text-sm text-neutral-700">Use os atalhos abaixo para focar no que pede ação agora.</p>
            <div className="mt-4 grid grid-cols-3 gap-2 text-xs text-neutral-600">
              <button className="rounded-xl border border-neutral-200 bg-neutral-50 p-2 text-center">
                <p className="text-lg font-semibold text-neutral-900">3</p>
                <p>em atenção</p>
              </button>
              <button className="rounded-xl border border-neutral-200 bg-neutral-50 p-2 text-center">
                <p className="text-lg font-semibold text-neutral-900">3</p>
                <p>desatualizadas</p>
              </button>
              <button className="rounded-xl border border-neutral-200 bg-neutral-50 p-2 text-center">
                <p className="text-lg font-semibold text-neutral-900">7</p>
                <p>mudanças 30d</p>
              </button>
            </div>
          </div>

          <div className="rounded-xl border border-neutral-200 bg-white p-4">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-neutral-900">Alertas</h3>
              <button className="rounded-full border border-mint-200 bg-mint-50 px-2 py-1 text-xs text-mint-700">Ação agora</button>
            </div>
            <div className="space-y-2">
              {[
                { title: "VALE3 • Dívida", severity: "Risco", summary: "Alavancagem acima do limite definido na watchlist.", time: "há 8 min" },
                { title: "LREN3 • Margens", severity: "Atenção", summary: "Pressão de custos acima do esperado no trimestre.", time: "há 21 min" },
              ].map((alert) => (
                <div key={alert.title} className="rounded-xl border border-neutral-200 bg-neutral-50 p-3">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-semibold text-neutral-900">{alert.title}</p>
                    <span className={`rounded-full border px-2 py-0.5 text-[10px] ${alert.severity === "Risco" ? "border-rose-300 bg-rose-100 text-rose-900" : "border-amber-300 bg-amber-100 text-amber-900"}`}>{alert.severity}</span>
                  </div>
                  <p className="mt-1 text-xs text-neutral-600">{alert.summary}</p>
                  <p className="mt-2 text-[11px] text-neutral-400">{alert.time}</p>
                </div>
              ))}
            </div>
            <button className="mt-3 w-full rounded-xl border border-neutral-200 px-3 py-2 text-xs text-neutral-600 hover:bg-neutral-50">
              Configurar alertas
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
}

function ComparacaoPanel() {
  return (
    <div className="h-full w-full">
      <div className="rounded-2xl border border-[#E5E7EB] bg-white p-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-[18px] font-semibold text-[#111827]">Comparar empresas</p>
            <p className="text-[12px] text-[#6B7280]">Clareza rapida: vencedor, diferenca e evidencia com fonte.</p>
          </div>
          <span className="rounded-full border border-[#E5E7EB] bg-[#F8FAFC] px-3 py-1 text-[11px] text-[#6B7280]">Comparacao atual (versao interna)</span>
        </div>

        <div className="mt-3 grid grid-cols-12 gap-3">
          <article className="col-span-12 rounded-xl border border-[#E8EAED] bg-[#F8FAFC] p-3 xl:col-span-4">
            <p className="text-[12px] font-semibold text-[#111827]">Placar 30s</p>
            <p className="mt-2 text-[12px] text-[#6B7280]">Vencedora</p>
            <p className="text-[28px] font-bold text-[#0E9384]">VALE3</p>
            <p className="mt-2 text-[12px] text-[#6B7280]">Maior atencao: Divida</p>
          </article>

          <article className="col-span-12 rounded-xl border border-[#E8EAED] bg-white p-3 xl:col-span-8">
            <p className="text-[12px] font-semibold text-[#111827]">Mapa de pilares</p>
            <div className="mt-2 grid grid-cols-3 gap-2 text-[11px]">
              {["Divida", "Caixa", "Margens", "Retorno", "Proventos", "Preco"].map((item) => (
                <span key={item} className="rounded-lg border border-[#E5E7EB] bg-[#F8FAFC] px-2 py-2 text-center text-[#475569]">{item}</span>
              ))}
            </div>
          </article>
        </div>
      </div>
    </div>
  );
}

export function InteractivePlatformSection() {
  const [activeTab, setActiveTab] = useState<PlatformTab>("dashboard");
  const [displayTab, setDisplayTab] = useState<PlatformTab>("dashboard");
  const [isTransitioning, setIsTransitioning] = useState(false);
  const transitionTimerRef = useRef<number | null>(null);

  const panel = useMemo(() => {
    if (displayTab === "explorar") return <ExplorarPanel />;
    if (displayTab === "watchlist") return <WatchlistPanel />;
    if (displayTab === "comparacao") return <ComparacaoPanel />;
    return <DashboardPanel />;
  }, [displayTab]);

  const handleTabChange = (nextTab: PlatformTab) => {
    if (nextTab === activeTab) return;

    setActiveTab(nextTab);
    setIsTransitioning(true);

    if (transitionTimerRef.current) {
      window.clearTimeout(transitionTimerRef.current);
    }

    transitionTimerRef.current = window.setTimeout(() => {
      setDisplayTab(nextTab);
      requestAnimationFrame(() => setIsTransitioning(false));
      transitionTimerRef.current = null;
    }, 170);
  };

  return (
    <section className="bg-[#F4F6F9] px-5 py-14 md:px-10 md:py-20">
      <div className="mx-auto w-full max-w-[1454px] rounded-[24px] bg-white p-6 md:p-10">
        <div className="text-center">
          <p className="text-[12px] font-medium leading-[20px] text-[#0E9384]">Navegacao guiada</p>
          <p
            className="mx-auto mt-3 max-w-[760px]"
            style={{
              fontSize: "48px",
              fontWeight: 600,
              color: "#101727",
              lineHeight: "100%",
              letterSpacing: "-0.02em",
              textWrap: "balance",
            }}
          >
            Veja a plataforma em fluxo real, da leitura ao acompanhamento.
          </p>
        </div>

        <div className="mt-8 overflow-x-auto pb-2">
          <div className="mx-auto h-[728.06px] w-[1230px] min-w-[1230px] rounded-[32px] border-[8px] border-[#14B8A6] bg-[#F4F6F9] p-4">
            <div
              className={`h-full w-full transform transition-all duration-300 ease-out ${
                isTransitioning ? "translate-y-[6px] opacity-0" : "translate-y-0 opacity-100"
              }`}
            >
              <ShellLayout>{panel}</ShellLayout>
            </div>
          </div>
        </div>

        <div className="mx-auto mt-7 grid w-full max-w-[1230px] grid-cols-1 gap-4 border-t border-[#E5E7EB] pt-4 md:grid-cols-4">
          {tabItems.map((item) => {
            const isActive = item.id === activeTab;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleTabChange(item.id)}
                className={`cursor-pointer px-[30px] py-[18px] text-center transition-all duration-300 ease-in ${
                  isActive ? "border-t border-t-[#0E9384]" : "border-t border-t-[rgba(0,0,0,0.05)]"
                }`}
              >
                <h3 className="mt-3 mb-2 text-[18px] font-semibold text-[#101727]">{item.label}</h3>
                <p className="mx-auto max-w-[250px] whitespace-normal text-[14px] font-normal leading-[18.2px] text-[#7E7E7E]">{item.helper}</p>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}




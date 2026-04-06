"use client";

import { Search } from "lucide-react";
import logoItau from "@/src/assets/logos/itau.png";
import logoRenner from "@/src/assets/logos/renner.png";
import logoVale from "@/src/assets/logos/vale.png";
import logoWeg from "@/src/assets/logos/weg.jpeg";

const feedItems = [
  {
    ticker: "WEGE3",
    title: "Margens ainda concentram a principal mudança da watchlist",
    summary: "Entenda se a pressão recente foi pontual ou sinaliza deterioração mais persistente.",
    tag: "Prioridade",
    tone: "attention",
    logo: logoWeg.src,
  },
  {
    ticker: "VALE3",
    title: "Recuperação operacional melhora o contexto recente",
    summary: "Resultado devolve fôlego à leitura, mas ainda pede confirmação nos próximos fechamentos.",
    tag: "Acompanhamento relevante",
    tone: "positive",
    logo: logoVale.src,
  },
  {
    ticker: "ITUB4",
    title: "Sem piora nova relevante desde a última revisão",
    summary: "Caso continua estável e não muda a ordem de prioridade do dia.",
    tag: "Estável",
    tone: "neutral",
    logo: logoItau.src,
  },
];

const companies = [
  {
    ticker: "WEGE3",
    name: "WEG",
    status: "Atenção",
    logo: logoWeg.src,
    why: "Margens pedem acompanhamento mais próximo.",
  },
  {
    ticker: "VALE3",
    name: "Vale",
    status: "Saudável",
    logo: logoVale.src,
    why: "Leitura melhorou com recuperação operacional.",
  },
  {
    ticker: "LREN3",
    name: "Lojas Renner",
    status: "Atenção",
    logo: logoRenner.src,
    why: "Acompanhe ritmo de rentabilidade e consumo.",
  },
];

const alerts = [
  {
    ticker: "WEGE3",
    title: "Margens perderam força no último fechamento",
    note: "Vale revisar a análise para confirmar impacto.",
  },
  {
    ticker: "LREN3",
    title: "Duas mudanças relevantes em menos de 30 dias",
    note: "Pode justificar um alerta recorrente.",
  },
];

function chip(status: string) {
  if (status === "Atenção") return "border-[#F8E1B1] bg-[#FFF4DE] text-[#B27300]";
  if (status === "Saudável") return "border-[#CDECDD] bg-[#EAF9F0] text-[#17825B]";
  return "border-border bg-muted text-muted-foreground";
}

function toneChip(tone: string) {
  if (tone === "attention") return "border-[#F8E1B1] bg-[#FFF4DE] text-[#B27300]";
  if (tone === "positive") return "border-[#CDECDD] bg-[#EAF9F0] text-[#17825B]";
  return "border-border bg-muted text-muted-foreground";
}

export function CompanyWatchlistMock() {
  return (
    <div className="flex h-full flex-col overflow-hidden rounded-[20px] border border-border bg-muted shadow-[0px_1px_2px_0px_rgba(228,229,231,0.24)]">
      <div className="border-b border-border bg-card px-6 py-4">
        <p className="text-[10px] font-semibold uppercase text-brand">Watchlist</p>
        <div className="mt-2 flex items-end justify-between gap-4">
          <div>
            <h3 className="text-[20px] font-semibold text-foreground">Veja o que mudou sem perder contexto</h3>
            <p className="mt-1 text-[13px] text-muted-foreground">
              Triagem primeiro. Organização depois. Acompanhe mudanças, prioridades e a lista monitorada com menos ruído.
            </p>
          </div>
          <button
            type="button"
            className="rounded-[18px] bg-[#12A594] px-4 py-2 text-[13px] font-semibold text-white shadow-[0_12px_24px_rgba(18,165,148,0.18)]"
          >
            Abrir watchlist
          </button>
        </div>
      </div>

      <div className="flex items-center gap-3 border-b border-border bg-card px-6 py-3">
        {["Atualizações", "Lista"].map((tab, index) => (
          <button
            key={tab}
            type="button"
            className={`rounded-full border px-4 py-2 text-[12px] font-semibold ${
              index === 0
                ? "border-[#D9E8FF] bg-[#EEF6FF] text-[#3965B8]"
                : "border-border bg-card text-muted-foreground"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <div className="grid grid-cols-12 gap-5">
          <section className="col-span-8 space-y-5">
            <article className="rounded-[24px] border border-border bg-card p-5 shadow-[0_14px_30px_rgba(15,23,40,0.04)]">
              <p className="text-[11px] font-semibold uppercase text-muted-foreground">Estado da watchlist</p>
              <h4 className="mt-1 text-[18px] font-semibold text-foreground">
                Hoje a prioridade está concentrada em WEGE3 e em mudanças de margem.
              </h4>
              <p className="mt-2 text-[13px] leading-6 text-muted-foreground">
                A leitura do dia pede uma revisão primeiro nos casos com mudança relevante e depois nos itens estáveis.
              </p>
              <div className="mt-4 grid grid-cols-3 gap-3">
                <div className="rounded-[18px] border border-border bg-muted p-3">
                  <p className="text-[10px] font-semibold uppercase text-muted-foreground">Atenção</p>
                  <p className="mt-1 text-[18px] font-semibold text-foreground">2</p>
                </div>
                <div className="rounded-[18px] border border-border bg-muted p-3">
                  <p className="text-[10px] font-semibold uppercase text-muted-foreground">Mudanças 30d</p>
                  <p className="mt-1 text-[18px] font-semibold text-foreground">4</p>
                </div>
                <div className="rounded-[18px] border border-border bg-muted p-3">
                  <p className="text-[10px] font-semibold uppercase text-muted-foreground">Watchlist</p>
                  <p className="mt-1 text-[18px] font-semibold text-foreground">12</p>
                </div>
              </div>
            </article>

            <article className="rounded-[24px] border border-border bg-card p-5 shadow-[0_14px_30px_rgba(15,23,40,0.04)]">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-semibold uppercase text-muted-foreground">Atualizações</p>
                  <h4 className="mt-1 text-[16px] font-semibold text-foreground">O que mudou e merece atenção</h4>
                </div>
                <div className="flex items-center gap-2">
                  {["7d", "30d", "90d"].map((range, index) => (
                    <button
                      key={range}
                      type="button"
                      className={`rounded-full px-3 py-1 text-[11px] font-medium ${
                        index === 1 ? "bg-[#EEF6FF] text-[#3965B8]" : "text-muted-foreground"
                      }`}
                    >
                      {range}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-4 space-y-3">
                {feedItems.map((item) => (
                  <button
                    key={item.ticker}
                    type="button"
                    className="flex w-full items-center gap-3 rounded-[18px] border border-border bg-card px-4 py-3 text-left"
                  >
                    <img src={item.logo} alt={item.ticker} className="h-10 w-10 rounded-xl object-cover" />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold ${toneChip(item.tone)}`}>
                          {item.tag}
                        </span>
                        <span className="text-[12px] font-semibold text-dim">{item.ticker}</span>
                      </div>
                      <p className="mt-1 text-[13px] font-semibold text-foreground">{item.title}</p>
                      <p className="mt-1 text-[12px] text-muted-foreground">{item.summary}</p>
                    </div>
                  </button>
                ))}
              </div>
            </article>

            <article className="rounded-[24px] border border-border bg-card p-5 shadow-[0_14px_30px_rgba(15,23,40,0.04)]">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-semibold uppercase text-muted-foreground">Lista monitorada</p>
                  <h4 className="mt-1 text-[16px] font-semibold text-foreground">Watchlist com contexto</h4>
                </div>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <input
                    readOnly
                    value=""
                    placeholder="Buscar empresa ou ticker..."
                    className="h-10 w-[240px] rounded-[16px] border border-border bg-muted pl-10 pr-3 text-[12px] text-foreground outline-none"
                  />
                </div>
              </div>

              <div className="mt-4 space-y-3">
                {companies.map((company) => (
                  <div
                    key={company.ticker}
                    className="flex items-center gap-3 rounded-[18px] border border-border bg-card px-4 py-3"
                  >
                    <img src={company.logo} alt={company.ticker} className="h-10 w-10 rounded-xl object-cover" />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="text-[13px] font-semibold text-foreground">{company.name}</p>
                        <span className="text-[12px] text-muted-foreground">{company.ticker}</span>
                        <span className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold ${chip(company.status)}`}>
                          {company.status}
                        </span>
                      </div>
                      <p className="mt-1 text-[12px] text-muted-foreground">{company.why}</p>
                    </div>
                    <button
                      type="button"
                      className="rounded-[14px] border border-border bg-card px-3 py-1.5 text-[12px] font-medium text-dim"
                    >
                      Abrir
                    </button>
                  </div>
                ))}
              </div>
            </article>
          </section>

          <aside className="col-span-4 space-y-5">
            <article className="rounded-[24px] border border-border bg-card p-5 shadow-[0_14px_30px_rgba(15,23,40,0.04)]">
              <p className="text-[11px] font-semibold uppercase text-muted-foreground">Visão rápida</p>
              <div className="mt-4 space-y-3">
                <div className="rounded-[18px] border border-border bg-muted p-3">
                  <p className="text-[12px] font-medium text-muted-foreground">Principal atenção</p>
                  <p className="mt-1 text-[14px] font-semibold text-foreground">WEGE3 em Margens</p>
                </div>
                <div className="rounded-[18px] border border-border bg-muted p-3">
                  <p className="text-[12px] font-medium text-muted-foreground">Maior melhora</p>
                  <p className="mt-1 text-[14px] font-semibold text-foreground">VALE3 com recuperação operacional</p>
                </div>
                <div className="rounded-[18px] border border-border bg-muted p-3">
                  <p className="text-[12px] font-medium text-muted-foreground">Próximo passo</p>
                  <p className="mt-1 text-[14px] font-semibold text-foreground">Abrir WEGE3 e confirmar impacto</p>
                </div>
              </div>
            </article>

            <article className="rounded-[24px] border border-border bg-card p-5 shadow-[0_14px_30px_rgba(15,23,40,0.04)]">
              <div className="flex items-center justify-between">
                <p className="text-[11px] font-semibold uppercase text-muted-foreground">Alertas</p>
                <button type="button" className="text-[12px] font-medium text-[#3965B8]">
                  Ver regras
                </button>
              </div>
              <div className="mt-4 space-y-3">
                {alerts.map((alert) => (
                  <div key={alert.ticker} className="rounded-[18px] border border-border bg-card p-3">
                    <div className="flex items-center gap-2">
                      <span className="rounded-full border border-[#F8E1B1] bg-[#FFF4DE] px-2 py-0.5 text-[10px] font-semibold text-[#B27300]">
                        Atenção
                      </span>
                      <span className="text-[12px] font-semibold text-dim">{alert.ticker}</span>
                    </div>
                    <p className="mt-2 text-[13px] font-semibold text-foreground">{alert.title}</p>
                    <p className="mt-1 text-[12px] text-muted-foreground">{alert.note}</p>
                  </div>
                ))}
              </div>
            </article>
          </aside>
        </div>
      </div>
    </div>
  );
}

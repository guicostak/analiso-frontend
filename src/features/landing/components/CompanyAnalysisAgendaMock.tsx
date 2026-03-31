"use client";

import { useState } from "react";
import { Check, ChevronDown, ChevronUp, MoreHorizontal } from "lucide-react";
import logoWeg from "@/src/assets/logos/weg.jpeg";

type EventTone = "risk" | "attention" | "routine";

type AgendaEvent = {
  title: string;
  pillar: string;
  summary: string;
  why: string;
  date: string;
  source: string;
  tag: string;
  tone: EventTone;
};

const company = {
  ticker: "WEGE3",
  name: "WEG",
  sector: "Bens Industriais",
  updatedAt: "23 mar 2026",
};

const principalEvent: AgendaEvent = {
  title: "Divulgação do próximo resultado trimestral",
  pillar: "Margens",
  summary: "É o principal gatilho do período porque deve confirmar se a pressão recente em margens foi pontual ou mais estrutural.",
  why: "Pode redefinir a leitura de qualidade do resultado e mudar a sensibilidade do valuation.",
  date: "12 mai 2026",
  source: "RI",
  tag: "Principal",
  tone: "risk",
};

const relevantEvents: AgendaEvent[] = [
  {
    title: "Teleconferência com investidores",
    pillar: "Margens",
    summary: "Pode trazer mais detalhe sobre custo, repasse de preço e ritmo operacional.",
    why: "Ajuda a separar ruído trimestral de mudança de tendência.",
    date: "13 mai 2026",
    source: "RI",
    tag: "Relevante",
    tone: "attention",
  },
  {
    title: "Atualização de guidance anual",
    pillar: "Retorno",
    summary: "Pode ajustar expectativa de crescimento, margem e reinvestimento.",
    why: "Impacta diretamente a leitura de execução e o cenário-base de valuation.",
    date: "20 jun 2026",
    source: "RI",
    tag: "Relevante",
    tone: "attention",
  },
];

const routineGroup = {
  title: "Eventos recorrentes do período",
  summary: "Compromissos de acompanhamento que mantêm contexto, mas sem alterar sozinhos o centro da leitura.",
  pillar: "Acompanhamento geral",
  items: [
    {
      title: "Atualização de mercado e participação em conferência setorial",
      pillar: "Setor",
      summary: "Ajuda a comparar ritmo de demanda e narrativa com os pares.",
      why: "Mais útil como contexto do que como gatilho principal.",
      date: "05 abr 2026",
      source: "Agenda RI",
      tag: "Rotina",
      tone: "routine" as const,
    },
    {
      title: "Pagamento de proventos programado",
      pillar: "Proventos",
      summary: "Sem surpresa relevante, mas reforça previsibilidade da companhia.",
      why: "Serve como confirmação de consistência, não como mudança estrutural.",
      date: "28 abr 2026",
      source: "RI",
      tag: "Rotina",
      tone: "routine" as const,
    },
  ],
};

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function toneStyles(tone: EventTone) {
  if (tone === "risk") {
    return {
      chip: "border-danger-border bg-danger-surface text-danger-text",
      title: "text-danger-text",
    };
  }
  if (tone === "attention") {
    return {
      chip: "border-warning-border bg-warning-surface text-warning-text",
      title: "text-warning-text",
    };
  }
  return {
    chip: "border-[#AEE3D8] bg-[#F1FCF9] text-brand",
    title: "text-brand",
  };
}

function EventCard({ item }: { item: AgendaEvent }) {
  const styles = toneStyles(item.tone);
  return (
    <article className="rounded-2xl border border-border bg-card p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <span className={cx("rounded-full border px-2.5 py-0.5 text-[11px] font-semibold", styles.chip)}>
            {item.tag}
          </span>
          <p className="mt-2 text-[15px] font-semibold text-foreground">{item.title}</p>
          <p className="mt-1 text-[13px] text-dim">{item.summary}</p>
          <p className="mt-2 text-[12px] text-muted-foreground">Pilar mais sensível: {item.pillar}</p>
          <p className="mt-2 text-[13px] text-dim">Por que importa: {item.why}</p>
        </div>
        <button
          type="button"
          className="flex-shrink-0 rounded-xl border border-brand bg-brand px-3 py-1.5 text-[12px] font-semibold text-white transition-opacity hover:opacity-90"
        >
          Ver impacto
        </button>
      </div>
      <p className="mt-3 text-[11px] text-[#B0BAC8]">
        {item.date} · Fonte: {item.source}
      </p>
    </article>
  );
}

export function CompanyAnalysisAgendaMock() {
  const [eventsWindow, setEventsWindow] = useState("60 dias");
  const [eventsFocus, setEventsFocus] = useState("Mais relevantes");
  const [routineOpen, setRoutineOpen] = useState(false);

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-[20px] border border-border bg-muted shadow-[0px_1px_2px_0px_rgba(228,229,231,0.24)]">
      <div className="border-b border-border bg-card px-6 py-4">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full border border-[#D8EEE9] bg-brand-surface px-2.5 py-1 text-[10px] font-semibold uppercase text-brand">
                Análise da empresa
              </span>
              <span className="rounded-full border border-border bg-muted px-2.5 py-1 text-[10px] font-medium text-muted-foreground">
                Atualizado em {company.updatedAt}
              </span>
            </div>
            <div className="mt-3 flex items-center gap-3">
              <div className="flex h-14 w-14 items-center justify-center overflow-hidden">
                <img src={logoWeg.src} alt="WEG" className="h-full w-full object-contain" />
              </div>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-[18px] font-semibold text-foreground">{company.name}</h3>
                  <span className="text-[12px] font-medium text-muted-foreground">{company.ticker}</span>
                </div>
                <p className="text-[12px] text-muted-foreground">{company.sector}</p>
              </div>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              className="inline-flex items-center gap-1.5 rounded-xl border border-brand bg-brand px-3.5 py-2 text-[12px] font-semibold text-white transition-all hover:opacity-90"
            >
              <Check className="h-3.5 w-3.5" />
              Na Watchlist
            </button>
            <button
              type="button"
              className="rounded-xl border border-border bg-card px-3.5 py-2 text-[12px] font-medium text-dim transition-all hover:bg-muted"
            >
              Criar alerta
            </button>
            <button
              type="button"
              className="rounded-xl border border-border bg-card px-3.5 py-2 text-[12px] text-muted-foreground transition-all hover:bg-muted"
            >
              Comparar
            </button>
            <button
              type="button"
              className="grid h-9 w-9 place-items-center rounded-full border border-border bg-card text-muted-foreground transition-all hover:bg-muted"
            >
              <MoreHorizontal className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-0 overflow-x-auto border-b border-border bg-card px-6">
        {["Resumo", "Pilares", "O que mudou (4)", "Agenda (2)", "Preço", "Fontes"].map((tab, index) => (
          <button
            key={tab}
            type="button"
            className={cx(
              "flex-shrink-0 border-b-2 px-4 py-3.5 text-[13px] font-medium transition-all duration-150",
              index === 3
                ? "border-brand text-foreground"
                : "border-transparent text-[#8494A9] hover:border-[#D0DDE8] hover:text-dim",
            )}
          >
            {tab}
          </button>
        ))}
      </div>

      <section className="flex-1 overflow-y-auto px-6 py-5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <div className="space-y-4">
          <section className="rounded-2xl border border-border bg-card p-5 shadow-sm">
            <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">Agenda ({eventsWindow})</p>
            <h2 className="mt-1 text-[18px] font-bold text-foreground">Próximos eventos</h2>
            <p className="mt-1 text-[13px] text-muted-foreground">
              Veja o que pode ter impacto real, o que é rotina e quais pilares podem ser mais afetados.
            </p>
            <div className="mt-4 border-t border-border pt-4">
              <p className="max-w-[840px] text-[13px] leading-relaxed text-dim">
                Nos próximos {eventsWindow.replace(" dias", "")} dias, o principal gatilho é o próximo resultado trimestral. Fora isso, a agenda traz eventos úteis para confirmar se a pressão em margens é pontual ou mais persistente.
              </p>
              <div className="mt-3 grid grid-cols-3 gap-3 text-[13px]">
                <div className="rounded-xl border border-border bg-muted p-3">
                  <p className="text-[10px] font-semibold uppercase text-muted-foreground">Pilar mais sensível</p>
                  <p className="mt-1 font-semibold text-[#0F766E]">Margens</p>
                </div>
                <div className="rounded-xl border border-border bg-muted p-3">
                  <p className="text-[10px] font-semibold uppercase text-muted-foreground">Gatilhos principais</p>
                  <p className="mt-1 font-semibold text-foreground">1</p>
                </div>
                <div className="rounded-xl border border-border bg-muted p-3">
                  <p className="text-[10px] font-semibold uppercase text-muted-foreground">Rotina</p>
                  <p className="mt-1 font-semibold text-foreground">2</p>
                </div>
              </div>
            </div>
          </section>

          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              {["30 dias", "60 dias", "90 dias"].map((period) => (
                <button
                  key={period}
                  type="button"
                  onClick={() => setEventsWindow(period)}
                  className={cx(
                    "h-8 rounded-full px-4 text-[13px]",
                    period === eventsWindow
                      ? "border border-border bg-card font-semibold text-foreground shadow-sm"
                      : "text-muted-foreground",
                  )}
                >
                  {period}
                </button>
              ))}
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {["Mais relevantes", "Rotina", "Principais"].map((filter) => (
                <button
                  key={filter}
                  type="button"
                  onClick={() => setEventsFocus(filter)}
                  className={cx(
                    "rounded-full border px-3 py-1.5 text-[12px]",
                    eventsFocus === filter
                      ? "border-brand bg-brand-surface font-semibold text-brand"
                      : "border-border bg-card text-[#5B6472] hover:bg-muted",
                  )}
                >
                  {filter}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <label htmlFor="events-pillar-filter-mock" className="text-[12px] font-medium text-[#5B6472]">
                Por pilar:
              </label>
              <select
                id="events-pillar-filter-mock"
                className="rounded-xl border border-border bg-card px-2.5 py-1.5 text-[12px] text-dim"
                defaultValue="Todos"
              >
                {["Todos", "Margens", "Retorno", "Proventos"].map((pillar) => (
                  <option key={pillar} value={pillar}>
                    {pillar}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <section className="rounded-2xl border border-[#FECACA] bg-[#FEF2F2] p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-danger-text">Principal gatilho do período</p>
                <p className="mt-2 text-[14px] font-semibold text-foreground">{principalEvent.title}</p>
                <p className="mt-1 text-[13px] text-dim">
                  Com possível efeito no pilar de {principalEvent.pillar} nos próximos fechamentos.
                </p>
              </div>
              <button
                type="button"
                className="flex-shrink-0 rounded-xl border border-brand bg-brand px-3 py-1.5 text-[12px] font-semibold text-white transition-opacity hover:opacity-90"
              >
                Ver impacto
              </button>
            </div>
          </section>

          <div className="space-y-3">
            <section className="space-y-2">
              <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-danger-text">Gatilhos principais</p>
              <EventCard item={principalEvent} />
            </section>

            <section className="space-y-2">
              <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-warning-text">Eventos relevantes</p>
              {relevantEvents.map((event) => (
                <EventCard key={event.title} item={event} />
              ))}
            </section>

            <section className="space-y-2">
              <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-brand">Rotina</p>
              <article className="rounded-2xl border border-border bg-card p-4 shadow-sm">
                <p className="text-[15px] font-semibold text-foreground">{routineGroup.title}</p>
                <p className="mt-2 text-[13px] text-dim">{routineGroup.summary}</p>
                <p className="mt-2 text-[12px] text-muted-foreground">Pilar afetado: {routineGroup.pillar}</p>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    className="rounded-xl border border-brand bg-brand px-3 py-1.5 text-[12px] font-semibold text-white transition-opacity hover:opacity-90"
                  >
                    Ver impacto no pilar
                  </button>
                  <button
                    type="button"
                    className="inline-flex items-center gap-1 rounded-xl border border-border px-3 py-1.5 text-[12px] text-[#5B6472] hover:bg-muted"
                    onClick={() => setRoutineOpen((value) => !value)}
                  >
                    Ver eventos
                    {routineOpen ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                  </button>
                </div>
                {routineOpen && (
                  <div className="mt-3 space-y-2">
                    {routineGroup.items.map((event) => (
                      <EventCard key={event.title} item={event} />
                    ))}
                  </div>
                )}
              </article>
            </section>

            <section className="rounded-2xl border border-[#99F6E4] bg-gradient-to-br from-[#F0FDFA] to-[#F6FAFC] p-5">
              <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-brand">Fechar a leitura</p>
              <p className="mt-1 text-[14px] text-foreground">
                Acompanhe o impacto esperado ou garanta lembrete dos principais gatilhos.
              </p>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  className="rounded-xl border border-brand bg-brand px-4 py-2 text-[13px] font-semibold text-white transition-opacity hover:opacity-90"
                >
                  Ver todos os impactos esperados nos pilares
                </button>
                <button
                  type="button"
                  className="rounded-xl border border-[#D1FAE5] bg-card px-4 py-2 text-[13px] font-medium text-foreground hover:bg-[#F0FDF4]"
                >
                  Me lembrar dos principais gatilhos
                </button>
              </div>
            </section>
          </div>
        </div>
      </section>
    </div>
  );
}

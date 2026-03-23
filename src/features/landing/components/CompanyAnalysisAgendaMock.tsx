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
      chip: "border-[#FECACA] bg-[#FEF2F2] text-[#DC2626]",
      title: "text-[#DC2626]",
    };
  }
  if (tone === "attention") {
    return {
      chip: "border-[#FDE68A] bg-[#FFFBEB] text-[#D97706]",
      title: "text-[#D97706]",
    };
  }
  return {
    chip: "border-[#AEE3D8] bg-[#F1FCF9] text-[#0E9384]",
    title: "text-[#0E9384]",
  };
}

function EventCard({ item }: { item: AgendaEvent }) {
  const styles = toneStyles(item.tone);
  return (
    <article className="rounded-2xl border border-[#E2EDF5] bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <span className={cx("rounded-full border px-2.5 py-0.5 text-[11px] font-semibold", styles.chip)}>
            {item.tag}
          </span>
          <p className="mt-2 text-[15px] font-semibold text-[#111827]">{item.title}</p>
          <p className="mt-1 text-[13px] text-[#475569]">{item.summary}</p>
          <p className="mt-2 text-[12px] text-[#94A3B8]">Pilar mais sensível: {item.pillar}</p>
          <p className="mt-2 text-[13px] text-[#4B5563]">Por que importa: {item.why}</p>
        </div>
        <button
          type="button"
          className="flex-shrink-0 rounded-xl border border-[#0E9384] bg-[#0E9384] px-3 py-1.5 text-[12px] font-semibold text-white transition-opacity hover:opacity-90"
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
    <div className="flex h-full flex-col overflow-hidden rounded-[20px] border border-[#E2EDF5] bg-[#F8FBFD] shadow-[0px_1px_2px_0px_rgba(228,229,231,0.24)]">
      <div className="border-b border-[#E2EDF5] bg-white px-6 py-4">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full border border-[#D8EEE9] bg-[#F0FDFA] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.08em] text-[#0E9384]">
                Análise da empresa
              </span>
              <span className="rounded-full border border-[#E2EDF5] bg-[#F6FAFC] px-2.5 py-1 text-[10px] font-medium text-[#64748B]">
                Atualizado em {company.updatedAt}
              </span>
            </div>
            <div className="mt-3 flex items-center gap-3">
              <div className="flex h-14 w-14 items-center justify-center overflow-hidden">
                <img src={logoWeg.src} alt="WEG" className="h-full w-full object-contain" />
              </div>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-[18px] font-semibold text-[#111827]">{company.name}</h3>
                  <span className="text-[12px] font-medium text-[#64748B]">{company.ticker}</span>
                </div>
                <p className="text-[12px] text-[#64748B]">{company.sector}</p>
              </div>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              className="inline-flex items-center gap-1.5 rounded-xl border border-[#0E9384] bg-[#0E9384] px-3.5 py-2 text-[12px] font-semibold text-white transition-all hover:opacity-90"
            >
              <Check className="h-3.5 w-3.5" />
              Na Watchlist
            </button>
            <button
              type="button"
              className="rounded-xl border border-[#E2EDF5] bg-white px-3.5 py-2 text-[12px] font-medium text-[#374151] transition-all hover:bg-[#F6FAFC]"
            >
              Criar alerta
            </button>
            <button
              type="button"
              className="rounded-xl border border-[#E2EDF5] bg-white px-3.5 py-2 text-[12px] text-[#6B7280] transition-all hover:bg-[#F6FAFC]"
            >
              Comparar
            </button>
            <button
              type="button"
              className="grid h-9 w-9 place-items-center rounded-full border border-[#E2EDF5] bg-white text-[#6B7280] transition-all hover:bg-[#F6FAFC]"
            >
              <MoreHorizontal className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-0 overflow-x-auto border-b border-[#E2EDF5] bg-white px-6">
        {["Resumo", "Pilares", "O que mudou (4)", "Agenda (2)", "Preço", "Fontes"].map((tab, index) => (
          <button
            key={tab}
            type="button"
            className={cx(
              "flex-shrink-0 border-b-2 px-4 py-3.5 text-[13px] font-medium transition-all duration-150",
              index === 3
                ? "border-[#0E9384] text-[#0B1220]"
                : "border-transparent text-[#8494A9] hover:border-[#D0DDE8] hover:text-[#374151]",
            )}
          >
            {tab}
          </button>
        ))}
      </div>

      <section className="flex-1 overflow-y-auto px-6 py-5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <div className="space-y-4">
          <section className="rounded-2xl border border-[#E2EDF5] bg-white p-5 shadow-sm">
            <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#94A3B8]">Agenda ({eventsWindow})</p>
            <h2 className="mt-1 text-[18px] font-bold text-[#111827]">Próximos eventos</h2>
            <p className="mt-1 text-[13px] text-[#64748B]">
              Veja o que pode ter impacto real, o que é rotina e quais pilares podem ser mais afetados.
            </p>
            <div className="mt-4 border-t border-[#E2EDF5] pt-4">
              <p className="max-w-[840px] text-[13px] leading-relaxed text-[#374151]">
                Nos próximos {eventsWindow.replace(" dias", "")} dias, o principal gatilho é o próximo resultado trimestral. Fora isso, a agenda traz eventos úteis para confirmar se a pressão em margens é pontual ou mais persistente.
              </p>
              <div className="mt-3 grid grid-cols-3 gap-3 text-[13px]">
                <div className="rounded-xl border border-[#E2EDF5] bg-[#F6FAFC] p-3">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-[#94A3B8]">Pilar mais sensível</p>
                  <p className="mt-1 font-semibold text-[#0F766E]">Margens</p>
                </div>
                <div className="rounded-xl border border-[#E2EDF5] bg-[#F6FAFC] p-3">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-[#94A3B8]">Gatilhos principais</p>
                  <p className="mt-1 font-semibold text-[#111827]">1</p>
                </div>
                <div className="rounded-xl border border-[#E2EDF5] bg-[#F6FAFC] p-3">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-[#94A3B8]">Rotina</p>
                  <p className="mt-1 font-semibold text-[#111827]">2</p>
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
                      ? "border border-[#E2EDF5] bg-white font-semibold text-[#111827] shadow-sm"
                      : "text-[#6B7280]",
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
                      ? "border-[#0E9384] bg-[#F0FDFA] font-semibold text-[#0E9384]"
                      : "border-[#E2EDF5] bg-white text-[#5B6472] hover:bg-[#F6FAFC]",
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
                className="rounded-xl border border-[#E2EDF5] bg-white px-2.5 py-1.5 text-[12px] text-[#334155]"
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
                <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[#DC2626]">Principal gatilho do período</p>
                <p className="mt-2 text-[14px] font-semibold text-[#111827]">{principalEvent.title}</p>
                <p className="mt-1 text-[13px] text-[#4B5563]">
                  Com possível efeito no pilar de {principalEvent.pillar} nos próximos fechamentos.
                </p>
              </div>
              <button
                type="button"
                className="flex-shrink-0 rounded-xl border border-[#0E9384] bg-[#0E9384] px-3 py-1.5 text-[12px] font-semibold text-white transition-opacity hover:opacity-90"
              >
                Ver impacto
              </button>
            </div>
          </section>

          <div className="space-y-3">
            <section className="space-y-2">
              <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[#DC2626]">Gatilhos principais</p>
              <EventCard item={principalEvent} />
            </section>

            <section className="space-y-2">
              <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[#D97706]">Eventos relevantes</p>
              {relevantEvents.map((event) => (
                <EventCard key={event.title} item={event} />
              ))}
            </section>

            <section className="space-y-2">
              <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[#0E9384]">Rotina</p>
              <article className="rounded-2xl border border-[#E2EDF5] bg-white p-4 shadow-sm">
                <p className="text-[15px] font-semibold text-[#111827]">{routineGroup.title}</p>
                <p className="mt-2 text-[13px] text-[#475569]">{routineGroup.summary}</p>
                <p className="mt-2 text-[12px] text-[#94A3B8]">Pilar afetado: {routineGroup.pillar}</p>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    className="rounded-xl border border-[#0E9384] bg-[#0E9384] px-3 py-1.5 text-[12px] font-semibold text-white transition-opacity hover:opacity-90"
                  >
                    Ver impacto no pilar
                  </button>
                  <button
                    type="button"
                    className="inline-flex items-center gap-1 rounded-xl border border-[#E2EDF5] px-3 py-1.5 text-[12px] text-[#5B6472] hover:bg-[#F6FAFC]"
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
              <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[#0E9384]">Fechar a leitura</p>
              <p className="mt-1 text-[14px] text-[#1F2937]">
                Acompanhe o impacto esperado ou garanta lembrete dos principais gatilhos.
              </p>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  className="rounded-xl border border-[#0E9384] bg-[#0E9384] px-4 py-2 text-[13px] font-semibold text-white transition-opacity hover:opacity-90"
                >
                  Ver todos os impactos esperados nos pilares
                </button>
                <button
                  type="button"
                  className="rounded-xl border border-[#D1FAE5] bg-white px-4 py-2 text-[13px] font-medium text-[#1F2937] hover:bg-[#F0FDF4]"
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

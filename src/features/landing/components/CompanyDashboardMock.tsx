"use client";

import { ArrowRight, ChevronRight } from "lucide-react";
import logoItau from "@/src/assets/logos/itau.png";
import logoRenner from "@/src/assets/logos/renner.png";
import logoVale from "@/src/assets/logos/vale.png";
import logoWeg from "@/src/assets/logos/weg.jpeg";

type Tone = "attention" | "positive" | "neutral";

const watchlistItems: Array<{
  ticker: string;
  title: string;
  note: string;
  tone: Tone;
  logo: string;
}> = [
  {
    ticker: "WEGE3",
    title: "Margens seguem como principal ponto do dia",
    note: "Entenda se a pressão recente é pontual ou mais persistente.",
    tone: "attention",
    logo: logoWeg.src,
  },
  {
    ticker: "VALE3",
    title: "Melhora operacional devolve fôlego à leitura",
    note: "Acompanhe se o ganho se sustenta no próximo trimestre.",
    tone: "positive",
    logo: logoVale.src,
  },
  {
    ticker: "ITUB4",
    title: "Sem mudança crítica nova no período",
    note: "Resultado segue estável, sem piora relevante no diagnóstico.",
    tone: "neutral",
    logo: logoItau.src,
  },
];

const feedItems: Array<{
  section: string;
  ticker: string;
  title: string;
  body: string;
  tone: Tone;
}> = [
  {
    section: "Prioridade do dia",
    ticker: "WEGE3",
    title: "Margens perderam fôlego e merecem leitura imediata",
    body: "O impacto parece concentrado, mas vale confirmar se há sinal de continuidade no próximo trimestre.",
    tone: "attention",
  },
  {
    section: "Acompanhamento relevante",
    ticker: "VALE3",
    title: "Recuperação operacional melhorou o tom da leitura",
    body: "A melhora devolve contexto positivo, mas ainda pede confirmação nos próximos números.",
    tone: "positive",
  },
  {
    section: "Estáveis e positivos",
    ticker: "ITUB4",
    title: "Sem piora relevante nova no período",
    body: "O caso segue estável e sem gatilho novo que mude a prioridade de acompanhamento.",
    tone: "neutral",
  },
];

const pillarMovements = [
  { pillar: "Margens", events: 6, color: "#D97706" },
  { pillar: "Caixa", events: 4, color: "#0E9384" },
  { pillar: "Retorno", events: 3, color: "#2F6FD6" },
];

function toneClasses(tone: Tone) {
  if (tone === "attention") {
    return {
      chip: "border-[#F8E1B1] bg-[#FFF4DE] text-[#B27300]",
      label: "Atenção",
    };
  }
  if (tone === "positive") {
    return {
      chip: "border-[#CDECDD] bg-[#EAF9F0] text-[#17825B]",
      label: "Melhora",
    };
  }
  return {
    chip: "border-[#E2EDF5] bg-[#F6FAFC] text-[#667085]",
    label: "Estável",
  };
}

export function CompanyDashboardMock() {
  return (
    <div className="flex h-full flex-col overflow-hidden rounded-[20px] border border-[#E2EDF5] bg-[#F7FAFC] shadow-[0px_1px_2px_0px_rgba(228,229,231,0.24)]">
      <div className="border-b border-[#E2EDF5] bg-white px-6 py-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <span className="rounded-full border border-[#D8EEE9] bg-[#F0FDFA] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.08em] text-[#0E9384]">
              Dashboard
            </span>
            <h3 className="mt-3 text-[20px] font-semibold leading-[1.12] text-[#0F1728]">
              Hoje sua watchlist pede atenção primeiro em WEGE3 e margens.
            </h3>
            <p className="mt-2 max-w-[680px] text-[13px] leading-6 text-[#526070]">
              Comece pelo item de maior impacto, confirme se a pressão ficou concentrada e depois revise os acompanhamentos relevantes.
            </p>
          </div>
          <div className="flex flex-col items-end gap-3">
            <span className="text-[12px] font-medium text-[#98A2B3]">Referência 23 mar 2026</span>
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-[18px] bg-[#12A594] px-4 py-2 text-[13px] font-semibold text-white shadow-[0_12px_24px_rgba(18,165,148,0.18)]"
            >
              Abrir prioridade
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <div className="grid grid-cols-12 gap-4">
        <div className="col-span-7 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <article className="relative min-h-[148px] overflow-hidden rounded-[20px] border border-[#F0CCD7] bg-white px-5 py-5">
              <div className="absolute inset-x-0 top-0 h-[44px] rounded-t-[20px] bg-[linear-gradient(180deg,#F7D9E2_0%,#FCECEF_100%)]" />
              <p className="absolute left-5 top-3 text-sm font-medium text-[#B54768]">Maior atenção</p>
              <div className="mt-9 flex items-start justify-between gap-3">
                <div>
                  <p className="text-[18px] font-semibold text-[#0F1728]">WEGE3</p>
                  <p className="mt-2 text-[13px] leading-5 text-[#5F6673]">
                    Pressão em margens concentra a principal revisão do dia.
                  </p>
                </div>
              </div>
            </article>

            <article className="relative min-h-[148px] overflow-hidden rounded-[20px] border border-[#CFE9E2] bg-white px-5 py-5">
              <div className="absolute inset-x-0 top-0 h-[44px] rounded-t-[20px] bg-[linear-gradient(180deg,#D9EFE8_0%,#ECF8F4_100%)]" />
              <p className="absolute left-5 top-3 text-sm font-medium text-[#0F9485]">Maior melhora</p>
              <div className="mt-9 flex items-start justify-between gap-3">
                <div>
                  <p className="text-[18px] font-semibold text-[#0F1728]">VALE3</p>
                  <p className="mt-2 text-[13px] leading-5 text-[#56666A]">
                    Resultado devolveu tração e melhorou o tom da leitura recente.
                  </p>
                </div>
              </div>
            </article>
          </div>

          <article className="rounded-[20px] border border-[#E8EEF5] bg-white p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#98A2B3]">
                  Feed do dia
                </p>
                <h4 className="mt-1 text-[16px] font-semibold text-[#0F1728]">O que merece leitura agora</h4>
              </div>
              <button type="button" className="text-[12px] font-medium text-[#2F6FD6]">
                Ver tudo
              </button>
            </div>

            <div className="mt-4 space-y-3">
              {watchlistItems.map((item) => {
                const tone = toneClasses(item.tone);
                return (
                  <button
                    key={item.ticker}
                    type="button"
                    className="flex w-full items-center gap-3 rounded-[18px] border border-[#E8EEF5] bg-[#FCFDFE] px-4 py-3 text-left transition hover:bg-white"
                  >
                    <img src={item.logo} alt={item.ticker} className="h-10 w-10 rounded-xl object-cover" />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="text-[13px] font-semibold text-[#0F1728]">{item.ticker}</p>
                        <span className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold ${tone.chip}`}>
                          {tone.label}
                        </span>
                      </div>
                      <p className="mt-1 text-[13px] font-medium text-[#334155]">{item.title}</p>
                      <p className="mt-1 text-[12px] text-[#667085]">{item.note}</p>
                    </div>
                    <ChevronRight className="h-4 w-4 text-[#98A2B3]" />
                  </button>
                );
              })}
            </div>
          </article>
        </div>

        <div className="col-span-5 space-y-4">
          <article className="rounded-[20px] border border-[#E8EEF5] bg-white p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#98A2B3]">
                  Feed do dia
                </p>
                <h4 className="mt-1 text-[16px] font-semibold text-[#0F1728]">Triagem rápida do que mudou</h4>
              </div>
              <button type="button" className="text-[12px] font-medium text-[#2F6FD6]">
                Ver inbox
              </button>
            </div>

            <div className="mt-4 space-y-3">
              {feedItems.map((item) => {
                const tone = toneClasses(item.tone);
                return (
                  <div
                    key={`${item.section}-${item.ticker}`}
                    className="rounded-[18px] border border-[#E8EEF5] bg-[#FCFDFE] px-4 py-3"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.06em] text-[#98A2B3]">
                        {item.section}
                      </p>
                      <span className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold ${tone.chip}`}>
                        {item.ticker}
                      </span>
                    </div>
                    <p className="mt-2 text-[13px] font-semibold text-[#334155]">{item.title}</p>
                    <p className="mt-1 text-[12px] leading-5 text-[#667085]">{item.body}</p>
                  </div>
                );
              })}
            </div>
          </article>

          <article className="rounded-[20px] border border-[#E8EEF5] bg-white p-5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#98A2B3]">
              Mapa rápido do dia
            </p>
            <h4 className="mt-1 text-[16px] font-semibold text-[#0F1728]">Onde a watchlist concentrou mudanças</h4>
            <div className="mt-4 space-y-3">
              {pillarMovements.map((item) => (
                <div key={item.pillar}>
                  <div className="mb-1.5 flex items-center justify-between text-[12px]">
                    <span className="font-medium text-[#334155]">{item.pillar}</span>
                    <span className="text-[#667085]">{item.events} sinais</span>
                  </div>
                  <div className="h-2.5 overflow-hidden rounded-full bg-[#EEF2F6]">
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${item.events * 14}%`, backgroundColor: item.color }}
                    />
                  </div>
                </div>
              ))}
            </div>
            <p className="mt-4 rounded-[16px] border border-[#E8EEF5] bg-[#F6FAFC] px-3 py-3 text-[12px] leading-5 text-[#526070]">
              Margens concentrou mais sinais relevantes hoje. Vale confirmar se a pressão ficou restrita a poucos nomes ou começou a se espalhar.
            </p>
          </article>

          <article className="rounded-[20px] border border-[#E8EEF5] bg-white p-5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#98A2B3]">
              Próximo passo
            </p>
            <h4 className="mt-1 text-[16px] font-semibold text-[#0F1728]">Feche a leitura com uma ação útil</h4>
            <div className="mt-4 space-y-3">
              <button
                type="button"
                className="flex w-full items-center justify-between rounded-[16px] border border-[#D7F3ED] bg-[#F0FDFA] px-4 py-3 text-left"
              >
                <div>
                  <p className="text-[13px] font-semibold text-[#0F1728]">Abrir WEGE3 primeiro</p>
                  <p className="mt-1 text-[12px] text-[#526070]">Entenda o impacto em margens antes de revisar o restante.</p>
                </div>
                <ChevronRight className="h-4 w-4 text-[#0E9384]" />
              </button>
              <button
                type="button"
                className="flex w-full items-center justify-between rounded-[16px] border border-[#E8EEF5] bg-white px-4 py-3 text-left"
              >
                <div>
                  <p className="text-[13px] font-semibold text-[#0F1728]">Comparar com LREN3</p>
                  <p className="mt-1 text-[12px] text-[#526070]">Veja se a pressão recente é específica ou setorial.</p>
                </div>
                <img src={logoRenner.src} alt="LREN3" className="h-8 w-8 rounded-lg object-cover" />
              </button>
            </div>
          </article>
        </div>
        </div>
      </div>
    </div>
  );
}

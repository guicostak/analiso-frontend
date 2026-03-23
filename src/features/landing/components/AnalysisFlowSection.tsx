"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ArrowRight, Check, Clock3, Layers3, ScanSearch, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";

type AnalysisState = {
  id: string;
  label: string;
  title: string;
  description: string;
  footerLabel: string;
  footerIcon: "sparkles" | "scan" | "clock";
  accent: string;
  softBg: string;
  border: string;
  glow: string;
  ring: string;
  chipBg: string;
  metrics: Array<{ label: string; value: string }>;
  highlights: string[];
};

const analysisStates: AnalysisState[] = [
  {
    id: "understand",
    label: "Entender rápido",
    title: "Comece pela leitura que reduz ruído.",
    description:
      "A Analiso traz os sinais centrais da empresa para a frente e deixa o resto em segundo plano.",
    footerLabel: "Primeira leitura guiada",
    footerIcon: "sparkles",
    accent: "#0f9f8f",
    softBg: "#e7fbf7",
    border: "#caefe6",
    glow:
      "radial-gradient(circle at 50% 18%, rgba(15,159,143,0.18) 0%, rgba(15,159,143,0.06) 36%, rgba(255,255,255,0) 72%)",
    ring: "rgba(15,159,143,0.18)",
    chipBg: "rgba(15,159,143,0.12)",
    metrics: [
      { label: "Receita", value: "+12,4%" },
      { label: "Margem", value: "17,8%" },
      { label: "Caixa", value: "Sólido" },
    ],
    highlights: [
      "Os sinais essenciais aparecem primeiro.",
      "A leitura já começa com contexto suficiente.",
      "Você entende rápido sem abrir vários blocos.",
    ],
  },
  {
    id: "deepen",
    label: "Aprofundar com contexto",
    title: "Compare períodos, setor e qualidade da leitura.",
    description:
      "A mesma empresa fica mais concreta quando os números entram em sequência, comparação e contexto setorial.",
    footerLabel: "Gestão financeira",
    footerIcon: "scan",
    accent: "#22C55E",
    softBg: "#e8fcee",
    border: "#d8f5e3",
    glow:
      "radial-gradient(circle at 50% 18%, rgba(34,197,94,0.16) 0%, rgba(34,197,94,0.05) 38%, rgba(255,255,255,0) 72%)",
    ring: "rgba(34,197,94,0.16)",
    chipBg: "rgba(34,197,94,0.1)",
    metrics: [
      { label: "Receita 3 anos", value: "+38%" },
      { label: "Margem bruta", value: "Estável" },
      { label: "Retorno", value: "Acima do setor" },
    ],
    highlights: [
      "Período, setor e qualidade aparecem na mesma leitura.",
      "O histórico explica o presente com mais clareza.",
      "Contexto entra sem virar dashboard.",
    ],
  },
  {
    id: "monitor",
    label: "Acompanhar mudanças",
    title: "A análise continua viva sem perder a lógica.",
    description:
      "Você retoma a mesma empresa com sinais do que mudou, do que pede atenção e do que segue consistente.",
    footerLabel: "Acompanhamento sem ruído",
    footerIcon: "clock",
    accent: "#c26b2c",
    softBg: "#fff3e8",
    border: "#f7dfc8",
    glow:
      "radial-gradient(circle at 50% 18%, rgba(194,107,44,0.16) 0%, rgba(194,107,44,0.05) 40%, rgba(255,255,255,0) 72%)",
    ring: "rgba(194,107,44,0.16)",
    chipBg: "rgba(194,107,44,0.1)",
    metrics: [
      { label: "Última atualização", value: "Hoje" },
      { label: "Mudanças relevantes", value: "3" },
      { label: "Prioridade", value: "Moderada" },
    ],
    highlights: [
      "Você volta direto ao que realmente mudou.",
      "A leitura preserva continuidade entre períodos.",
      "Acompanhar não vira caça a indicador solto.",
    ],
  },
];

function UnderstandMockup({ state }: { state: AnalysisState }) {
  return (
    <div className="relative h-[250px] rounded-[22px] border border-[#edf1f0] bg-white p-5 shadow-[0_18px_45px_rgba(0,0,0,0.04)] max-md:h-auto">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="rounded-full border border-[#edf1f0] bg-[#fbfcfb] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#5f6d69]">
            WEGE3 · WEG S.A.
          </div>
          <div className="mt-4 text-[24px] font-semibold tracking-[-0.03em] text-[#171717]">
            Leitura inicial da empresa
          </div>
        </div>
        <div
          className="rounded-full px-3 py-1 text-[11px] font-semibold"
          style={{ color: state.accent, backgroundColor: state.chipBg }}
        >
          Visão inicial
        </div>
      </div>

      <div className="mt-6 grid gap-3 md:grid-cols-3">
        {state.metrics.map((metric) => (
          <div key={metric.label} className="rounded-[16px] bg-[#f7f8f8] p-4">
            <div className="text-[11px] font-medium text-[#86908d]">{metric.label}</div>
            <div className="mt-2 text-[18px] font-semibold text-[#111827]">{metric.value}</div>
          </div>
        ))}
      </div>

      <div className="mt-6 grid gap-3 md:grid-cols-[1.15fr_0.85fr]">
        <div className="rounded-[18px] border border-[#eef2f1] bg-[#fbfcfb] p-4">
          <div className="flex items-center gap-2 text-[12px] font-semibold text-[#6f7a77]">
            <ScanSearch className="h-4 w-4" style={{ color: state.accent }} />
            Leitura guiada
          </div>
          <div className="mt-3 text-[14px] leading-5 text-[#2a2f2e]">
            Crescimento consistente, caixa sólido e execução disciplinada aparecem antes do detalhe.
          </div>
        </div>

        <div className="rounded-[18px] border border-[#eef2f1] bg-white p-4">
          <div className="text-[11px] font-medium text-[#7b8683]">Microinsight</div>
          <div className="mt-2 text-[14px] font-medium text-[#1f2937]">
            O essencial já fica legível na primeira leitura.
          </div>
        </div>
      </div>
    </div>
  );
}

function ContextMockup({ state }: { state: AnalysisState }) {
  return (
    <div className="relative h-[250px] rounded-[22px] border border-[#edf1f0] bg-white p-5 shadow-[0_18px_45px_rgba(0,0,0,0.04)] max-md:h-auto">
      <div className="flex items-center justify-between gap-4">
        <div>
          <div className="rounded-full border border-[#edf1f0] bg-[#fbfcfb] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#5f6d69]">
            WEGE3 · WEG S.A.
          </div>
          <div className="mt-4 text-[24px] font-semibold tracking-[-0.03em] text-[#171717]">
            Contexto em comparação
          </div>
        </div>
        <div
          className="rounded-full px-3 py-1 text-[11px] font-semibold"
          style={{ color: state.accent, backgroundColor: state.chipBg }}
        >
          Mais contexto
        </div>
      </div>

      <div className="mt-6 rounded-[18px] bg-[#f8fafc] p-4">
        <div className="flex items-center justify-between text-[11px] font-medium text-[#7d8896]">
          <span>Período</span>
          <span>Receita</span>
          <span>Margem</span>
        </div>

        <div className="mt-4 space-y-2.5">
          {[
            { period: "2022", revenue: "+9%", margin: "16,9%" },
            { period: "2023", revenue: "+13%", margin: "17,4%" },
            { period: "2024", revenue: "+12%", margin: "17,8%" },
          ].map((row) => (
            <div
              key={row.period}
              className="grid grid-cols-[72px_1fr_80px] items-center gap-3 rounded-[14px] bg-white px-3 py-2.5"
            >
              <span className="text-[11px] font-medium text-[#73808d]">{row.period}</span>
              <div className="h-2 overflow-hidden rounded-full bg-[#ebeff8]">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: row.period === "2022" ? "48%" : row.period === "2023" ? "66%" : "74%",
                    background: `linear-gradient(90deg, ${state.accent}55 0%, ${state.accent} 100%)`,
                  }}
                />
              </div>
              <span className="text-right text-[11px] font-semibold text-[#1f2937]">{row.margin}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-5 grid gap-3 md:grid-cols-[1.05fr_0.95fr]">
        <div className="rounded-[18px] border border-[#eef2f1] bg-white p-4">
          <div className="text-[11px] font-medium text-[#7b8683]">Leitura guiada</div>
          <div className="mt-2 text-[14px] font-medium text-[#1f2937]">
            Receita cresce acima do setor há 3 ciclos, com margem estável.
          </div>
        </div>
        <div className="rounded-[18px] border border-[#eef2f1] bg-white p-4">
          <div className="text-[11px] font-medium text-[#7b8683]">Comparação</div>
          <div className="mt-2 text-[14px] font-medium text-[#1f2937]">
            Histórico e setor deixam a leitura mais concreta.
          </div>
        </div>
      </div>
    </div>
  );
}

function ChangesMockup({ state }: { state: AnalysisState }) {
  return (
    <div className="relative h-[250px] rounded-[22px] border border-[#edf1f0] bg-white p-5 shadow-[0_18px_45px_rgba(0,0,0,0.04)] max-md:h-auto">
      <div className="flex items-center justify-between gap-4">
        <div>
          <div className="rounded-full border border-[#edf1f0] bg-[#fbfcfb] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#5f6d69]">
            WEGE3 · WEG S.A.
          </div>
          <div className="mt-4 text-[24px] font-semibold tracking-[-0.03em] text-[#171717]">
            O que mudou desde a última leitura
          </div>
        </div>
        <div
          className="rounded-full px-3 py-1 text-[11px] font-semibold"
          style={{ color: state.accent, backgroundColor: state.chipBg }}
        >
          Acompanhamento
        </div>
      </div>

      <div className="mt-6 space-y-3">
        {[
          {
            title: "Receita segue resiliente",
            note: "Crescimento continua, mas em ritmo menor.",
            tone: `${state.accent}22`,
          },
          {
            title: "Margem pede atenção",
            note: "Pressão recente merece acompanhamento.",
            tone: "#f5ede6",
          },
          {
            title: "Caixa continua sólido",
            note: "A empresa preserva flexibilidade operacional.",
            tone: "#eef8f6",
          },
        ].map((item, index) => (
          <div
            key={item.title}
            className="flex items-start justify-between gap-4 rounded-[18px] border border-[#eef2f1] p-4"
            style={{ backgroundColor: item.tone }}
          >
            <div>
              <div className="text-[14px] font-semibold text-[#18202f]">{item.title}</div>
              <div className="mt-1 text-[13px] text-[#5f6b68]">{item.note}</div>
            </div>
            <div className="rounded-full bg-white px-2.5 py-1 text-[11px] font-semibold text-[#6d7775]">
              {index === 0 ? "Novo" : index === 1 ? "Atenção" : "Estável"}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ContextMockupRefined({ state }: { state: AnalysisState }) {
  return (
    <div className="relative h-[250px] overflow-hidden rounded-[22px] border border-[#edf1f0] bg-white p-5 shadow-[0_18px_45px_rgba(0,0,0,0.04)] max-md:h-auto">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="rounded-full border border-[#edf1f0] bg-[#fbfcfb] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#5f6d69]">
            WEGE3 · WEG S.A.
          </div>
          <div className="mt-4 text-[24px] font-semibold tracking-[-0.03em] text-[#171717]">
            Contexto em comparação
          </div>
        </div>
        <div
          className="rounded-full px-3 py-1 text-[11px] font-semibold"
          style={{ color: state.accent, backgroundColor: state.chipBg }}
        >
          Mais contexto
        </div>
      </div>

      <div className="mt-6 overflow-hidden rounded-[20px] border border-[#edf1f0] bg-white p-5 max-md:max-h-[260px]">
        <div className="flex flex-col gap-1">
          <span className="text-[11px] font-medium leading-4 text-[#7b8683]">Comparativo central</span>
          <p className="text-[16px] font-semibold leading-[22px] tracking-[-0.16px] text-[#1f2937]">
            Histórico, setor e sequência na mesma leitura
          </p>
        </div>

        <div className="my-4 h-px w-full bg-[#edf1f0]" />

        <div className="flex flex-col gap-3">
          {[
            { label: "Histórico", width: "82%", value: "3 ciclos" },
            { label: "Setor", width: "69%", value: "acima" },
            { label: "Sequência", width: "76%", value: "consistente" },
            { label: "Margem", width: "58%", value: "estável" },
            { label: "Retorno", width: "72%", value: "forte" },
          ].map((row) => (
            <div key={row.label} className="flex items-center gap-[6px]">
              <span className="flex-1 text-[11px] font-medium leading-4 text-[#1f2937]">{row.label}</span>
              <div className="flex shrink-0 items-center gap-[6px]">
                <div className="h-2 w-[92px] overflow-hidden rounded-full bg-[#eef2f8]">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: row.width,
                      background: `linear-gradient(90deg, ${state.accent}66 0%, ${state.accent} 100%)`,
                    }}
                  />
                </div>
                <span className="w-[56px] text-right text-[11px] font-medium leading-4 text-[#667085]">
                  {row.value}
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="pointer-events-none absolute bottom-0 right-0 h-[84px] w-[70%] bg-gradient-to-b from-transparent via-white/80 to-white max-md:hidden" />
      </div>

      <div className="absolute left-[64%] top-[22px] z-10 hidden w-[168px] overflow-hidden rounded-[18px] border border-[#edf1f0] bg-white p-4 shadow-[0px_5px_36px_0px_rgba(0,0,0,0.06)] md:flex md:flex-col md:gap-[14px]">
        <div className="flex items-center gap-[6px]">
          <ScanSearch className="h-[18px] w-[18px]" style={{ color: state.accent }} />
          <p className="text-[15px] font-medium tracking-[-0.2px] text-[#1f2937]">Acima do setor</p>
        </div>
        <div className="flex flex-col gap-[10px]">
          <div className="text-[10px] leading-[14px]">
            <span className="font-semibold" style={{ color: state.accent }}>
              Histórico consistente
            </span>
            <span className="text-[#667085]"> com margem preservada.</span>
          </div>
          <button className="flex h-[24px] items-center justify-center rounded-[10px] border border-[#edf1f0] bg-white px-[8px] text-[10px] font-semibold text-[#1f2937] shadow-small">
            Ver leitura
          </button>
        </div>
      </div>

      <div className="absolute right-0 top-0 h-full w-[132px] bg-gradient-to-l from-white to-transparent max-md:hidden" />
    </div>
  );
}

function StateMockup({ state }: { state: AnalysisState }) {
  if (state.id === "understand") {
    return <UnderstandMockup state={state} />;
  }

  if (state.id === "deepen") {
    return <ContextMockupRefined state={state} />;
  }

  return <ChangesMockup state={state} />;
}

function FooterIcon({
  kind,
  color,
}: {
  kind: AnalysisState["footerIcon"];
  color: string;
}) {
  if (kind === "sparkles") {
    return <Sparkles className="h-[14px] w-[14px]" style={{ color }} />;
  }

  if (kind === "scan") {
    return <ScanSearch className="h-[14px] w-[14px]" style={{ color }} />;
  }

  return <Clock3 className="h-[14px] w-[14px]" style={{ color }} />;
}

export function AnalysisFlowSection() {
  const [activeIndex, setActiveIndex] = useState(1);
  const [isHovered, setIsHovered] = useState(false);
  const shouldReduceMotion = useReducedMotion();
  const activeState = analysisStates[activeIndex];

  useEffect(() => {
    if (shouldReduceMotion || isHovered) {
      return;
    }

    const interval = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % analysisStates.length);
    }, 4000);

    return () => window.clearInterval(interval);
  }, [isHovered, shouldReduceMotion]);

  return (
    <section id="assistentes" className="px-20 pb-8 pt-8 max-lg:px-10 max-md:px-6 max-sm:px-4 max-sm:pt-16">
      <div className="mx-auto max-w-[1430px]">
        <div className="flex flex-col items-center gap-6">
          <h2 className="max-w-[720px] text-center text-[40px] font-semibold leading-[42px] tracking-[-0.4px] text-[#1b2421] max-sm:text-[28px] max-sm:leading-[32px]">
            Entenda, aprofunde e acompanhe sem se perder nos indicadores.
          </h2>

          <p className="max-w-[610px] text-center text-lg leading-6 text-primary-gray-500 max-md:text-base max-md:leading-5">
            Etapas coordenadas que organizam a leitura inicial, o contexto e o acompanhamento.
          </p>

          <div className="flex flex-wrap items-end justify-center gap-3 pt-2">
            {analysisStates.map((state, index) => {
              const isActive = index === activeIndex;

              return (
                <div key={state.id} className="flex flex-col items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setActiveIndex(index)}
                    className="relative overflow-hidden rounded-full border px-4 py-2.5 text-sm font-semibold transition-all duration-300"
                    style={{
                      borderColor: isActive ? state.border : "#e8eceb",
                      backgroundColor: isActive ? state.softBg : "#ffffff",
                      color: isActive ? state.accent : "#65716d",
                      boxShadow: isActive ? `0 8px 24px -16px ${state.ring}` : "none",
                    }}
                  >
                    <span className="relative z-[2]">{state.label}</span>
                    {isActive && (
                      <motion.span
                        layoutId="analysis-selector-glow"
                        className="absolute inset-0 z-[1]"
                        style={{
                          background: `linear-gradient(180deg, ${state.chipBg} 0%, rgba(255,255,255,0) 100%)`,
                        }}
                      />
                    )}
                  </button>

                  <div
                    className="agent-track h-[3px] w-[27px] overflow-hidden rounded-full bg-primary-gray-50 transition-opacity duration-300"
                    style={{ opacity: isActive ? 1 : 0 }}
                  >
                    <motion.div
                      key={`${state.id}-${isActive ? "active" : "inactive"}`}
                      className="agent-bar h-full rounded-full"
                      style={{ background: state.accent }}
                      initial={{ width: "0%" }}
                      animate={{ width: isActive ? "100%" : "0%" }}
                      transition={
                        shouldReduceMotion
                          ? { duration: 0 }
                          : isActive
                            ? { duration: 4, ease: "linear" }
                            : { duration: 0.2, ease: "easeOut" }
                      }
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <motion.div
          className="relative mx-auto mt-8 max-w-[980px]"
          onHoverStart={() => setIsHovered(true)}
          onHoverEnd={() => setIsHovered(false)}
          animate={{ opacity: 1 }}
        >
          <div
            className="pointer-events-none absolute inset-x-12 top-0 h-[320px] rounded-[42px] blur-3xl transition-all duration-500"
            style={{ background: activeState.glow }}
          />

          <div
            className="pointer-events-none absolute left-1/2 top-[34px] h-[520px] w-[520px] -translate-x-1/2 rounded-full border transition-all duration-500 max-md:h-[360px] max-md:w-[360px]"
            style={{ borderColor: activeState.ring }}
          />

          <div
            className="pointer-events-none absolute left-1/2 top-[72px] h-[420px] w-[420px] -translate-x-1/2 rounded-full border transition-all duration-500 max-md:h-[280px] max-md:w-[280px]"
            style={{ borderColor: activeState.ring }}
          />

          <div className="pointer-events-none absolute left-[4%] top-[110px] hidden h-[132px] w-[182px] rounded-[22px] border border-white/70 bg-white/55 opacity-70 blur-[1px] md:block" />
          <div className="pointer-events-none absolute right-[4%] top-[148px] hidden h-[118px] w-[170px] rounded-[22px] border border-white/70 bg-white/55 opacity-70 blur-[1px] md:block" />
          <div className="pointer-events-none absolute left-[12%] top-[318px] hidden h-[108px] w-[160px] rounded-[22px] border border-white/70 bg-white/55 opacity-60 blur-[1px] md:block" />
          <div className="pointer-events-none absolute right-[12%] top-[336px] hidden h-[100px] w-[156px] rounded-[22px] border border-white/70 bg-white/55 opacity-60 blur-[1px] md:block" />

          <div
            className="relative overflow-hidden rounded-[30px] border shadow-[0_30px_80px_rgba(16,24,40,0.08)] transition-all duration-500"
            style={{ borderColor: activeState.border, backgroundColor: activeState.softBg }}
          >
            <div className="rounded-[28px] border-b border-white/60 bg-white/92 p-6 backdrop-blur-sm md:p-7">
              <div className="grid gap-6 md:grid-cols-[1.08fr_0.92fr]">
              <div className="flex flex-col justify-between gap-5">
                <div>
                  <div className="flex items-center gap-2">
                    <span
                      className="rounded-full px-3 py-1 text-[11px] font-semibold"
                      style={{ backgroundColor: activeState.chipBg, color: activeState.accent }}
                    >
                      {activeState.label}
                    </span>
                    <span className="rounded-full border border-[#e9eeec] bg-[#fbfcfb] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#5d6a66]">
                      WEGE3 · WEG S.A.
                    </span>
                  </div>

                  <AnimatePresence mode="wait">
                    <motion.div
                      key={activeState.id}
                      initial={shouldReduceMotion ? false : { opacity: 0, y: 10, filter: "blur(6px)" }}
                      animate={shouldReduceMotion ? {} : { opacity: 1, y: 0, filter: "blur(0px)" }}
                      exit={shouldReduceMotion ? {} : { opacity: 0, y: -8, filter: "blur(6px)" }}
                      transition={{ duration: 0.35, ease: "easeOut" }}
                    >
                      <h3 className="mt-4 max-w-[440px] text-[30px] font-semibold leading-[34px] tracking-[-0.04em] text-[#171717] max-md:text-[24px] max-md:leading-[28px]">
                        {activeState.title}
                      </h3>
                      <p className="mt-4 max-w-[460px] text-[16px] leading-6 text-[#66706d] max-md:text-[15px] max-md:leading-5">
                        {activeState.description}
                      </p>
                    </motion.div>
                  </AnimatePresence>
                </div>

                <div className="grid gap-3 sm:grid-cols-3">
                  {activeState.metrics.map((metric) => (
                    <div key={metric.label} className="rounded-[18px] border border-[#edf1f0] bg-[#fbfcfb] p-4">
                      <div className="text-[11px] font-medium text-[#85918d]">{metric.label}</div>
                      <div className="mt-2 text-[17px] font-semibold text-[#18202f]">{metric.value}</div>
                    </div>
                  ))}
                </div>

                <div className="rounded-[20px] border border-[#edf1f0] bg-[#fbfcfb] p-4">
                  <div className="flex items-center gap-2 text-[12px] font-semibold text-[#70807b]">
                    <Layers3 className="h-4 w-4" style={{ color: activeState.accent }} />
                    Etapa ativa
                  </div>
                  <div className="mt-3 space-y-2.5">
                    {activeState.highlights.map((item) => (
                      <div key={item} className="flex items-start gap-2 text-[14px] leading-5 text-[#24302d]">
                        <ArrowRight className="mt-0.5 h-3.5 w-3.5 shrink-0" style={{ color: activeState.accent }} />
                        {item}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <AnimatePresence mode="wait">
                <motion.div
                  key={`${activeState.id}-mockup`}
                  initial={shouldReduceMotion ? false : { opacity: 0, y: 12, scale: 0.985, filter: "blur(8px)" }}
                  animate={shouldReduceMotion ? {} : { opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
                  exit={shouldReduceMotion ? {} : { opacity: 0, y: -8, scale: 0.985, filter: "blur(8px)" }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                >
                  <StateMockup state={activeState} />
                </motion.div>
              </AnimatePresence>
              </div>
            </div>

            <div className="p-6 max-md:flex max-md:justify-center">
              <div className="flex items-center gap-2 transition-opacity duration-500">
                <FooterIcon kind={activeState.footerIcon} color={activeState.accent} />
                <span className="text-sm font-medium leading-5" style={{ color: activeState.accent }}>
                  {activeState.footerLabel}
                </span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

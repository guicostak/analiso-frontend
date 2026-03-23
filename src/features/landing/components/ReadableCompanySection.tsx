"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Check, CircleAlert, Layers3, Sparkles, TrendingUp } from "lucide-react";
import { useEffect, useState } from "react";

type LensState = {
  id: string;
  label: string;
  headline: string;
  microInsight: string;
  ticker: string;
  company: string;
  halo: string;
  glow: string;
  accent: string;
  chipTone: string;
  metrics: Array<{ label: string; value: string; tone?: "neutral" | "positive" | "attention" }>;
  summary: string[];
  sideCards: Array<{
    title: string;
    value: string;
    note: string;
    x: string;
    y: string;
    rotate: string;
    width: string;
  }>;
};

const lensStates: LensState[] = [
  {
    id: "overview",
    label: "Visão geral",
    headline: "Crescimento consistente com boa geração de caixa",
    microInsight: "A leitura geral mostra um negócio previsível, com expansão disciplinada e menos ruído na interpretação.",
    ticker: "WEGE3",
    company: "WEG S.A.",
    halo: "linear-gradient(to bottom, rgba(255,255,255,1) 0%, rgba(255,255,255,0.94) 14%, rgba(176,220,255,0.16) 38%, rgba(176,220,255,0.42) 68%, rgba(226,241,255,0.9) 100%)",
    glow: "radial-gradient(circle at center, rgba(131,188,255,0.34) 0%, rgba(131,188,255,0.14) 42%, rgba(255,255,255,0) 74%)",
    accent: "#6ea8ff",
    chipTone: "bg-[#eef5ff] text-[#497dd6] border-[#d9e7ff]",
    metrics: [
      { label: "Receita 12m", value: "R$ 37,4 bi", tone: "positive" },
      { label: "Margem EBIT", value: "18,9%", tone: "positive" },
      { label: "Caixa líquido", value: "Positivo", tone: "neutral" },
    ],
    summary: [
      "Execução consistente e leitura operacional estável.",
      "Caixa e retorno sustentam a narrativa de qualidade.",
      "A visão geral resume o caso sem excesso de triagem.",
    ],
    sideCards: [
      { title: "Receita", value: "+11,2%", note: "12 meses", x: "6%", y: "18%", rotate: "-7deg", width: "180px" },
      { title: "Retorno", value: "23,4%", note: "ROIC", x: "74%", y: "14%", rotate: "7deg", width: "168px" },
      { title: "Caixa", value: "Confortável", note: "posição financeira", x: "12%", y: "62%", rotate: "-4deg", width: "196px" },
      { title: "Dividendos", value: "Regular", note: "histórico recente", x: "72%", y: "64%", rotate: "5deg", width: "184px" },
    ],
  },
  {
    id: "results",
    label: "Resultados",
    headline: "Margem pressionada, mas receita segue resiliente",
    microInsight: "Receita, margem e lucro ganham sentido quando aparecem juntos.",
    ticker: "WEGE3",
    company: "WEG S.A.",
    halo: "linear-gradient(to bottom, rgba(255,255,255,1) 0%, rgba(255,255,255,0.94) 14%, rgba(164,241,203,0.18) 38%, rgba(164,241,203,0.42) 68%, rgba(223,248,236,0.94) 100%)",
    glow: "radial-gradient(circle at center, rgba(73,191,132,0.34) 0%, rgba(73,191,132,0.14) 42%, rgba(255,255,255,0) 74%)",
    accent: "#39a96b",
    chipTone: "bg-[#ecfaf2] text-[#2f8d58] border-[#d6f1df]",
    metrics: [
      { label: "Receita líquida", value: "R$ 10,1 bi", tone: "positive" },
      { label: "Lucro líquido", value: "R$ 1,5 bi", tone: "neutral" },
      { label: "Margem líquida", value: "15,0%", tone: "attention" },
    ],
    summary: [
      "Crescimento segue firme, com menos folga operacional.",
      "Os números centrais ajudam a separar volume de qualidade.",
      "Receita melhor não significa tese melhor por completo.",
    ],
    sideCards: [
      { title: "Receita", value: "+9,4%", note: "vs. ano anterior", x: "8%", y: "20%", rotate: "-6deg", width: "178px" },
      { title: "Margem", value: "-1,2 p.p.", note: "pressão recente", x: "74%", y: "16%", rotate: "6deg", width: "170px" },
      { title: "Lucro", value: "Estável", note: "efeito misto", x: "10%", y: "64%", rotate: "-5deg", width: "176px" },
      { title: "Capex", value: "Elevado", note: "expansão em curso", x: "74%", y: "66%", rotate: "4deg", width: "176px" },
    ],
  },
  {
    id: "changes",
    label: "Mudanças",
    headline: "Mercado reagiu à desaceleração recente",
    microInsight: "Mudanças ficam mais legíveis quando o que mudou aparece separado do que permaneceu.",
    ticker: "WEGE3",
    company: "WEG S.A.",
    halo: "linear-gradient(to bottom, rgba(255,255,255,1) 0%, rgba(255,255,255,0.94) 14%, rgba(255,220,163,0.18) 38%, rgba(255,220,163,0.42) 68%, rgba(255,245,226,0.94) 100%)",
    glow: "radial-gradient(circle at center, rgba(241,176,82,0.3) 0%, rgba(241,176,82,0.14) 42%, rgba(255,255,255,0) 74%)",
    accent: "#d5902f",
    chipTone: "bg-[#fff6e8] text-[#b97118] border-[#f6e4be]",
    metrics: [
      { label: "Mudança-chave", value: "Desaceleração", tone: "attention" },
      { label: "Reação do mercado", value: "Negativa", tone: "attention" },
      { label: "Tese estrutural", value: "Mantida", tone: "positive" },
    ],
    summary: [
      "A comparação separa evento pontual de mudança estrutural.",
      "A empresa segue sólida, mas o ritmo recente pede cautela.",
      "O foco vai para o que mudou, não para o ruído.",
    ],
    sideCards: [
      { title: "Volume", value: "Menor ritmo", note: "curto prazo", x: "7%", y: "18%", rotate: "-6deg", width: "178px" },
      { title: "Mercado", value: "Reprecificou", note: "após resultado", x: "73%", y: "15%", rotate: "7deg", width: "174px" },
      { title: "Narrativa", value: "Mais cautela", note: "sem ruptura", x: "12%", y: "65%", rotate: "-4deg", width: "190px" },
      { title: "Leitura", value: "Comparável", note: "trimestre a trimestre", x: "72%", y: "64%", rotate: "5deg", width: "186px" },
    ],
  },
  {
    id: "attention",
    label: "Pontos de atenção",
    headline: "Valuation exige execução forte daqui para frente",
    microInsight: "Os alertas ficam mais úteis quando aparecem com contexto, não como ruído.",
    ticker: "WEGE3",
    company: "WEG S.A.",
    halo: "linear-gradient(to bottom, rgba(255,255,255,1) 0%, rgba(255,255,255,0.94) 14%, rgba(214,170,172,0.16) 38%, rgba(214,170,172,0.38) 68%, rgba(247,235,236,0.94) 100%)",
    glow: "radial-gradient(circle at center, rgba(153,73,82,0.28) 0%, rgba(153,73,82,0.12) 42%, rgba(255,255,255,0) 74%)",
    accent: "#8f4c56",
    chipTone: "bg-[#f8ecee] text-[#934a55] border-[#efd8dc]",
    metrics: [
      { label: "Valuation", value: "Elevado", tone: "attention" },
      { label: "Execução", value: "Crítica", tone: "attention" },
      { label: "Folga", value: "Menor", tone: "neutral" },
    ],
    summary: [
      "A qualidade segue forte, mas o preço exige mais entrega.",
      "Os alertas aparecem conectados à tese, não como lista solta.",
      "A leitura fica mais disciplinada e menos eufórica.",
    ],
    sideCards: [
      { title: "Preço", value: "Exigente", note: "pouca folga", x: "6%", y: "19%", rotate: "-6deg", width: "166px" },
      { title: "Execução", value: "Decisiva", note: "para sustentar prêmio", x: "74%", y: "16%", rotate: "7deg", width: "192px" },
      { title: "Risco", value: "Assimetria menor", note: "no curto prazo", x: "10%", y: "66%", rotate: "-4deg", width: "190px" },
      { title: "Leitura", value: "Mais seletiva", note: "sem euforia", x: "73%", y: "65%", rotate: "5deg", width: "178px" },
    ],
  },
  {
    id: "context",
    label: "Contexto",
    headline: "Os sinais ficam mais claros quando entram em contexto",
    microInsight: "Contexto histórico e setorial reduz ruído na leitura.",
    ticker: "WEGE3",
    company: "WEG S.A.",
    halo: "linear-gradient(to bottom, rgba(255,255,255,1) 0%, rgba(255,255,255,0.94) 14%, rgba(190,197,231,0.16) 38%, rgba(190,197,231,0.38) 68%, rgba(236,239,248,0.94) 100%)",
    glow: "radial-gradient(circle at center, rgba(111,128,186,0.28) 0%, rgba(111,128,186,0.12) 42%, rgba(255,255,255,0) 74%)",
    accent: "#7280b5",
    chipTone: "bg-[#eef0fb] text-[#6070a6] border-[#dde3f6]",
    metrics: [
      { label: "Comparação", value: "Histórica", tone: "neutral" },
      { label: "Leitura", value: "Sequencial", tone: "positive" },
      { label: "Confiança", value: "Maior", tone: "positive" },
    ],
    summary: [
      "Os dados ficam mais claros quando entram em sequência.",
      "O contexto ajuda a separar tendência de ruído.",
      "A mesma empresa muda de lente sem perder continuidade.",
    ],
    sideCards: [
      { title: "Histórico", value: "Importa mais", note: "do que um ponto isolado", x: "7%", y: "18%", rotate: "-7deg", width: "190px" },
      { title: "Setor", value: "Ajuda a calibrar", note: "qualidade relativa", x: "73%", y: "16%", rotate: "6deg", width: "192px" },
      { title: "Sequência", value: "Dá sentido", note: "aos sinais", x: "11%", y: "66%", rotate: "-4deg", width: "176px" },
      { title: "Síntese", value: "Mais verificável", note: "menos ruído", x: "73%", y: "65%", rotate: "5deg", width: "182px" },
    ],
  },
];

export function ReadableCompanySection() {
  const prefersReducedMotion = useReducedMotion();
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (prefersReducedMotion) {
      return;
    }

    const interval = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % lensStates.length);
    }, 7200);

    return () => window.clearInterval(interval);
  }, [prefersReducedMotion]);

  const activeState = lensStates[activeIndex];

  return (
    <section className="relative overflow-hidden px-20 pb-[88px] pt-[72px] max-lg:px-10 max-md:px-6 max-md:pb-[56px] max-md:pt-[56px] max-sm:px-4 max-sm:pb-[40px]">
      <div className="relative z-10 flex flex-col items-center gap-5">
        <h2
          className="max-w-[760px] bg-clip-text text-center text-[56px] font-semibold leading-[56px] tracking-[-1.12px] text-transparent max-md:text-[36px] max-md:leading-[40px] max-md:tracking-[-0.72px] max-sm:text-[28px] max-sm:leading-[32px] max-sm:tracking-[-0.56px]"
          style={{
            backgroundImage: "linear-gradient(347deg, #202020 47.75%, #8F8F8F 90.57%)",
          }}
        >
          A mesma empresa, agora muito mais legível.
        </h2>

        <p className="max-w-[560px] text-center text-lg leading-6 text-[#7a7a7a] max-md:text-base max-md:leading-5">
          Veja como a Analiso transforma dados soltos em uma leitura mais clara, guiada e verificável.
        </p>

        <button className="flex h-12 cursor-pointer items-center justify-center gap-2 rounded-[10px] border border-[#ececec] bg-white px-4 py-[14px] text-sm font-semibold leading-5 text-[#171717] shadow-[0_4px_14px_rgba(0,0,0,0.04)] transition-all duration-300 ease-out hover:border-[#d9d9d9] hover:ring-2 hover:ring-[#d7f5f0] hover:ring-offset-2 hover:ring-offset-white focus:outline-none focus:ring-2 focus:ring-[#d7f5f0] focus:ring-offset-2 focus:ring-offset-white active:scale-[0.98] max-sm:h-10 max-sm:px-3 max-sm:py-2.5 max-sm:text-xs">
          Ver como funciona
        </button>
      </div>

      <div className="relative mx-auto mt-[20px] h-[620px] max-w-[1430px] max-md:mt-[18px] max-md:h-[520px] max-sm:mt-[14px] max-sm:h-[460px]">
        <AnimatePresence mode="sync">
          <motion.div
            key={activeState.id}
            className="pointer-events-none absolute inset-0"
            initial={prefersReducedMotion ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={prefersReducedMotion ? undefined : { opacity: 0 }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
            style={{ background: activeState.halo }}
          />
        </AnimatePresence>

        <AnimatePresence mode="sync">
          <motion.div
            key={`${activeState.id}-glow`}
            className="pointer-events-none absolute left-1/2 top-[58%] h-[420px] w-[840px] -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl max-md:top-[56%] max-md:h-[320px] max-md:w-[540px] max-sm:h-[220px] max-sm:w-[320px]"
            initial={prefersReducedMotion ? false : { opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={prefersReducedMotion ? undefined : { opacity: 0, scale: 1.03 }}
            transition={{ duration: 0.9, ease: "easeInOut" }}
            style={{ background: activeState.glow }}
          />
        </AnimatePresence>

        {[1, 2, 3].map((ring) => (
          <motion.div
            key={`ring-${ring}`}
            className="pointer-events-none absolute left-1/2 top-[58%] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/55 max-md:top-[56%]"
            animate={
              prefersReducedMotion
                ? undefined
                : {
                    scale: [1, 1.015, 1],
                    opacity: [0.28, 0.4, 0.28],
                  }
            }
            transition={{
              duration: 5 + ring,
              repeat: Number.POSITIVE_INFINITY,
              ease: "easeInOut",
              delay: ring * 0.25,
            }}
            style={{
              width: `${300 + ring * 140}px`,
              height: `${300 + ring * 140}px`,
            }}
          />
        ))}

        <div className="pointer-events-none absolute inset-x-0 top-0 z-[3] h-[140px] bg-gradient-to-b from-white via-white/72 to-transparent max-sm:h-[90px]" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-[3] h-[180px] bg-gradient-to-t from-white via-white/80 to-transparent max-sm:h-[120px]" />

        <div className="absolute inset-0">
          {activeState.sideCards.map((card, index) => (
            <motion.div
              key={`${activeState.id}-${card.title}`}
              className="absolute hidden rounded-[18px] border border-white/70 bg-white/74 p-4 shadow-[0_18px_40px_rgba(22,26,29,0.05)] backdrop-blur-xl md:block"
              initial={
                prefersReducedMotion
                  ? false
                  : { opacity: 0, y: 18, scale: 0.96, filter: "blur(10px)" }
              }
              animate={{
                opacity: 0.42,
                y: 0,
                scale: 1,
                filter: "blur(0px)",
              }}
              exit={
                prefersReducedMotion
                  ? undefined
                  : { opacity: 0, y: -10, scale: 0.98, filter: "blur(8px)" }
              }
              transition={{
                duration: 0.7,
                ease: "easeInOut",
                delay: index * 0.05,
              }}
              style={{
                left: card.x,
                top: card.y,
                width: card.width,
                rotate: card.rotate,
              }}
            >
              <div className="text-[11px] font-medium uppercase tracking-[0.12em] text-[#8d959d]">
                {card.title}
              </div>
              <div className="mt-2 text-[22px] font-semibold tracking-[-0.04em] text-[#1f2429]">
                {card.value}
              </div>
              <div className="mt-1 text-[12px] leading-5 text-[#7d858d]">{card.note}</div>
            </motion.div>
          ))}
        </div>

        <div className="absolute inset-x-0 bottom-[22px] z-[4] flex flex-col items-center gap-4 max-sm:bottom-[12px]">
          <motion.div
            className="relative w-full max-w-[760px] rounded-[28px] border border-white/85 bg-white/94 p-5 shadow-[0_38px_100px_rgba(29,35,41,0.14)] backdrop-blur-xl max-md:max-w-[640px] max-sm:max-w-full max-sm:rounded-[24px] max-sm:p-4"
            initial={prefersReducedMotion ? false : { opacity: 0, y: 10, scale: 0.995 }}
            animate={
              prefersReducedMotion
                ? { opacity: 1 }
                : {
                    opacity: 1,
                    y: 0,
                    scale: [1, 1.008, 1],
                  }
            }
            transition={{
              duration: prefersReducedMotion ? 0.2 : 0.7,
              ease: "easeInOut",
              scale: {
                duration: 5.2,
                repeat: Number.POSITIVE_INFINITY,
                ease: "easeInOut",
              },
            }}
          >
            <div
              className="pointer-events-none absolute inset-x-0 top-0 h-[120px] rounded-t-[28px] opacity-80 max-sm:rounded-t-[24px]"
              style={{
                background: `linear-gradient(180deg, ${activeState.accent}18 0%, rgba(255,255,255,0) 100%)`,
              }}
            />
            <AnimatePresence mode="wait">
              <motion.div
                key={activeState.id}
                className="relative"
                initial={
                  prefersReducedMotion
                    ? false
                    : { opacity: 0, y: 10, filter: "blur(6px)" }
                }
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                exit={
                  prefersReducedMotion
                    ? undefined
                    : { opacity: 0, y: -8, filter: "blur(6px)" }
                }
                transition={{ duration: 0.45, ease: "easeInOut" }}
              >
              <div className="flex items-start justify-between gap-4 max-sm:flex-col">
                <div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`inline-flex items-center rounded-full border px-3 py-1 text-[12px] font-semibold ${activeState.chipTone}`}
                    >
                      {activeState.label}
                    </span>
                    <span className="inline-flex items-center gap-2 rounded-full bg-[#f7f8f9] px-3 py-1 text-[12px] font-medium text-[#5c6670]">
                      <span className="font-semibold tracking-[0.04em] text-[#20262b]">
                        {activeState.ticker}
                      </span>
                      <span className="text-[#a2aab2]">·</span>
                      <span>{activeState.company}</span>
                    </span>
                  </div>

                  <h3 className="mt-4 max-w-[470px] text-[32px] font-semibold leading-[1.04] tracking-[-0.05em] text-[#171c20] max-sm:text-[24px]">
                    {activeState.headline}
                  </h3>
                </div>

                <div className="grid min-w-[220px] gap-2 max-sm:w-full max-sm:min-w-0">
                  {activeState.metrics.map((metric) => (
                    <div
                      key={metric.label}
                      className="rounded-[18px] border border-[#eef1f4] bg-white/82 px-3 py-3"
                    >
                      <div className="text-[11px] font-medium uppercase tracking-[0.08em] text-[#9aa1a8]">
                        {metric.label}
                      </div>
                      <div
                        className={`mt-1 text-[18px] font-semibold ${
                          metric.tone === "positive"
                            ? "text-[#21855a]"
                            : metric.tone === "attention"
                              ? "text-[#a26a18]"
                              : "text-[#1d2328]"
                        }`}
                      >
                        {metric.value}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-5 grid gap-3 md:grid-cols-[1fr_240px]">
                <div className="rounded-[22px] bg-[linear-gradient(180deg,#fbfcfd,#f5f7f8)] p-4">
                  <div className="mb-3 flex items-center gap-2 text-[12px] font-semibold text-[#7f8991]">
                    <Layers3 className="h-4 w-4" />
                    Leitura guiada
                  </div>
                  <div className="space-y-2">
                    {activeState.summary.map((line) => (
                      <div
                        key={line}
                        className="flex items-start gap-2 rounded-[16px] bg-white px-3 py-2.5 text-[12px] leading-5 text-[#293036] shadow-[0_6px_18px_rgba(28,33,36,0.03)]"
                      >
                        <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#0f9f8f]" />
                        <span>{line}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-[22px] border border-[#eef1f4] bg-white/82 p-4">
                  <div className="mb-3 flex items-center gap-2 text-[12px] font-semibold text-[#7f8991]">
                    {activeState.id === "attention" ? (
                      <CircleAlert className="h-4 w-4" />
                    ) : activeState.id === "results" ? (
                      <TrendingUp className="h-4 w-4" />
                    ) : (
                      <Sparkles className="h-4 w-4" />
                    )}
                    Microinsight
                  </div>
                  <p className="text-[13px] leading-5 text-[#2d3338]">
                    {activeState.microInsight}
                  </p>
                </div>
              </div>
              </motion.div>
            </AnimatePresence>
          </motion.div>

          <div className="flex flex-wrap items-center justify-center gap-2 px-4">
            {lensStates.map((state, index) => (
              <button
                key={state.id}
                type="button"
                onClick={() => setActiveIndex(index)}
                className={`rounded-full border px-3 py-2 text-[12px] font-semibold transition-all ${
                  index === activeIndex
                    ? "border-transparent bg-white text-[#171c20] shadow-[0_10px_24px_rgba(29,35,41,0.08)]"
                    : "border-white/70 bg-white/45 text-[#7b838b]"
                }`}
                style={
                  index === activeIndex
                    ? {
                        boxShadow: `0 10px 24px rgba(29,35,41,0.08), 0 0 0 1px ${activeState.accent}22, 0 0 18px ${activeState.accent}20`,
                        color: activeState.accent,
                      }
                    : undefined
                }
              >
                {state.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

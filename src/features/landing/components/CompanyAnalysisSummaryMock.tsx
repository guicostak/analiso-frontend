"use client";

import { useState } from "react";
import {
  BarChart3,
  Check,
  MoreHorizontal,
  Share2,
  TriangleAlert,
} from "lucide-react";
import logoWeg from "@/src/assets/logos/weg.jpeg";

type Status = "Risco" | "Atencao" | "Saudavel";
type PillarName = "Divida" | "Caixa" | "Margens" | "Retorno" | "Proventos";
type PillarMapStatus = "risco" | "atencao" | "saudavel";

type PillarMapDatum = {
  pillar: PillarName;
  pillarLabel: string;
  score: number;
  status: PillarMapStatus;
  delta?: number;
  reason?: string;
};

const summaryMock = {
  company: {
    ticker: "WEGE3",
    name: "WEG",
    sector: "Bens Industriais",
    updatedAt: "23 mar 2026",
  },
  diagnosisHeadline:
    "A empresa continua saudável, com rentabilidade e caixa sustentando o diagnóstico, enquanto margens pedem acompanhamento mais próximo.",
  strongest: {
    title: "Caixa",
    score: "92/100",
    badge: "Liquidez confortável",
    trend: "melhora",
  },
  watchout: {
    title: "Margens",
    score: "64/100",
    badge: "Compressão recente",
    trend: "piora",
  },
  summaryNarrative:
    "A leitura rápida indica uma empresa ainda sustentada por caixa robusto, retorno consistente e estrutura operacional sólida. O ponto que merece mais atenção está na pressão recente sobre margens, que reduz parte do conforto do diagnóstico e deve ser confirmado nos próximos resultados.",
  summaryScan: {
    strength: { pillar: "Caixa" },
    attention: { pillar: "Margens" },
    monitor: { text: "Evolução das margens e repasse de preço no próximo resultado." },
  },
  summaryMeta: {
    updatedAt: "23 mar 2026",
    source: "CVM + RI",
  },
  mapPillarData: [
    { pillar: "Divida", pillarLabel: "Dívida", score: 78, status: "saudavel", delta: 2, reason: "Alavancagem segue controlada." },
    { pillar: "Caixa", pillarLabel: "Caixa", score: 92, status: "saudavel", delta: 4, reason: "Liquidez segue acima da média recente." },
    { pillar: "Margens", pillarLabel: "Margens", score: 64, status: "atencao", delta: -6, reason: "Pressão operacional no trimestre." },
    { pillar: "Retorno", pillarLabel: "Retorno", score: 81, status: "saudavel", delta: 1, reason: "ROIC ainda em patamar saudável." },
    { pillar: "Proventos", pillarLabel: "Proventos", score: 72, status: "atencao", delta: -1, reason: "Distribuição segue estável, sem destaque." },
  ] satisfies PillarMapDatum[],
};

const pillarMapStatusTone: Record<
  PillarMapStatus,
  { stroke: string; fill: string; label: string; chip: string }
> = {
  risco: {
    stroke: "#D9735E",
    fill: "#D9735E",
    label: "Risco",
    chip: "border-[#F7C9C0] bg-[#FFF5F3] text-[#B54935]",
  },
  atencao: {
    stroke: "#C78D21",
    fill: "#C78D21",
    label: "Atenção",
    chip: "border-[#F6DEA9] bg-[#FFFBEB] text-warning-text",
  },
  saudavel: {
    stroke: "#168E7D",
    fill: "#168E7D",
    label: "Saudável",
    chip: "border-[#AEE3D8] bg-[#F1FCF9] text-brand",
  },
};

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function PillarMap({
  data,
}: {
  data: PillarMapDatum[];
}) {
  const [activePillar, setActivePillar] = useState<PillarName | null>(null);

  return (
    <div className="space-y-1.5">
      {data.map((entry) => {
        const tone = pillarMapStatusTone[entry.status];
        const isActive = activePillar === entry.pillar;
        const hasDelta = typeof entry.delta === "number" && Number.isFinite(entry.delta);
        const deltaPositive = hasDelta && entry.delta! > 0;
        const deltaNegative = hasDelta && entry.delta! < 0;

        return (
          <button
            key={entry.pillar}
            type="button"
            onMouseEnter={() => setActivePillar(entry.pillar)}
            onMouseLeave={() => setActivePillar(null)}
            className={cx(
              "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-all duration-150",
              isActive ? "ring-1 ring-[#C8EDE6]" : "",
            )}
            style={{ background: isActive ? "#F4FBFA" : "transparent" }}
          >
            <div
              className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl"
              style={{ backgroundColor: `${tone.fill}1A` }}
            >
              <span className="text-[13px] font-bold tabular-nums" style={{ color: tone.stroke }}>
                {entry.score}
              </span>
            </div>
            <div className="min-w-0 flex-1">
              <div className="mb-1.5 flex items-center justify-between gap-2">
                <span className="text-[12px] font-semibold text-foreground">{entry.pillarLabel}</span>
                <div className="flex items-center gap-1.5">
                  {hasDelta && (
                    <span
                      className={cx(
                        "text-[10px] font-medium tabular-nums",
                        deltaPositive
                          ? "text-brand"
                          : deltaNegative
                            ? "text-[#DC2626]"
                            : "text-[#9CA3AF]",
                      )}
                    >
                      {deltaPositive ? "+" : ""}
                      {entry.delta!.toFixed(0)}
                    </span>
                  )}
                  <span
                    className={cx(
                      "rounded-full border px-1.5 py-0.5 text-[9px] font-semibold tracking-[0.04em]",
                      tone.chip,
                    )}
                  >
                    {tone.label.toUpperCase()}
                  </span>
                </div>
              </div>
              <div className="h-1 w-full overflow-hidden rounded-full bg-[#EEF2F6]">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${entry.score}%`,
                    backgroundColor: tone.stroke,
                    opacity: isActive ? 1 : 0.6,
                  }}
                />
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}

export function CompanyAnalysisSummaryMock() {
  const [showScoreInfo, setShowScoreInfo] = useState(false);
  const [showEvidence, setShowEvidence] = useState(false);

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-[20px] border border-border bg-muted shadow-[0px_1px_2px_0px_rgba(228,229,231,0.24)]">
      <div className="border-b border-border bg-card px-6 py-4">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full border border-[#D8EEE9] bg-brand-surface px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.08em] text-brand">
                Análise da empresa
              </span>
              <span className="rounded-full border border-border bg-muted px-2.5 py-1 text-[10px] font-medium text-muted-foreground">
                Atualizado em {summaryMock.company.updatedAt}
              </span>
            </div>
            <div className="mt-3 flex items-center gap-3">
              <div className="flex h-14 w-14 items-center justify-center overflow-hidden">
                <img src={logoWeg.src} alt="WEG" className="h-full w-full object-contain" />
              </div>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-[18px] font-semibold text-foreground">{summaryMock.company.name}</h3>
                  <span className="text-[12px] font-medium text-muted-foreground">{summaryMock.company.ticker}</span>
                </div>
                <p className="text-[12px] text-muted-foreground">{summaryMock.company.sector}</p>
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
              index === 0
                ? "border-brand text-foreground"
                : "border-transparent text-[#8494A9] hover:border-[#D0DDE8] hover:text-dim",
            )}
          >
            {tab}
          </button>
        ))}
      </div>

      <section className="flex-1 overflow-y-auto px-6 py-5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {showScoreInfo && (
          <div className="mb-4 rounded-2xl border border-border bg-card p-5 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-[#A0AEC0]">Metodologia</p>
                <h3 className="mt-0.5 text-[15px] font-semibold text-foreground">Como calculamos o placar</h3>
              </div>
              <button
                type="button"
                className="rounded-lg border border-border px-3 py-1.5 text-[12px] text-muted-foreground hover:bg-muted"
                onClick={() => setShowScoreInfo(false)}
              >
                Fechar
              </button>
            </div>
            <div className="mt-3 space-y-1 text-[13px] text-muted-foreground">
              <p>Pesos: Dívida 25%, Caixa 20%, Margens 20%, Retorno 20%, Proventos 15%.</p>
              <p>Status com base em dados públicos recentes e leitura contextual.</p>
              <p>Fontes: CVM, B3 e RI da empresa.</p>
            </div>
          </div>
        )}

        {showEvidence && (
          <div className="mb-4 rounded-2xl border border-border bg-card p-5 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-[#A0AEC0]">Evidência</p>
                <h3 className="mt-0.5 text-[15px] font-semibold text-foreground">Painel de fonte · Resumo</h3>
              </div>
              <button
                type="button"
                className="rounded-lg border border-border px-3 py-1.5 text-[12px] text-muted-foreground hover:bg-muted"
                onClick={() => setShowEvidence(false)}
              >
                Fechar
              </button>
            </div>
            <div className="mt-3 space-y-1.5 text-[13px] text-muted-foreground">
              <p>
                <span className="font-medium text-dim">Documento:</span> Release de resultados e ITR mais recente
              </p>
              <p>
                <span className="font-medium text-dim">Atualizado em:</span> {summaryMock.summaryMeta.updatedAt}
              </p>
              <button type="button" className="inline-flex items-center gap-1.5 text-brand hover:underline">
                Abrir fonte externa
                <Share2 className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        )}

        <div className="space-y-5">
          <article className="rounded-2xl border border-border bg-card p-6 shadow-sm">
            <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">Diagnóstico rápido</p>
            <h2 className="mt-2 text-[22px] font-bold leading-snug text-foreground">
              {summaryMock.diagnosisHeadline}
            </h2>
            <p className="mt-2 text-[13px] leading-relaxed text-muted-foreground">
              Entenda o que sustenta a empresa hoje, o que mudou e o que vale monitorar daqui para frente.
            </p>
            <div className="mt-5 flex flex-wrap items-center gap-2">
              <button
                type="button"
                className="rounded-xl border border-brand bg-brand px-4 py-2 text-[13px] font-semibold text-white transition-opacity hover:opacity-90"
              >
                Ver principal força
              </button>
              <button
                type="button"
                className="rounded-xl border border-[#F6DEA9] bg-[#FFFBEB] px-4 py-2 text-[13px] font-semibold text-warning-text transition-opacity hover:opacity-80"
              >
                Ver principal atenção
              </button>
            </div>
          </article>

          <div className="grid grid-cols-12 gap-4">
            <div className="col-span-12 space-y-4 xl:col-span-8">
              <article
                className="rounded-2xl border border-border bg-card p-5 shadow-sm"
                style={{ borderTopWidth: "3px", borderTopColor: "#0E9384" }}
              >
                <div className="flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-brand" />
                  <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-brand">Principal Força</p>
                </div>
                <div className="mt-3">
                  <p className="text-[26px] font-bold leading-none text-brand">{summaryMock.strongest.title}</p>
                  <p className="mt-2.5 text-[14px] leading-relaxed text-dim">
                    A estrutura de caixa segue oferecendo conforto para atravessar oscilações e financiar execução com menos pressão.
                  </p>
                  <div className="mt-3 flex flex-wrap items-center gap-2 text-[12px]">
                    <span className="rounded-full border border-[#C7F5EE] bg-brand-surface px-2.5 py-1 font-semibold text-brand">
                      {summaryMock.strongest.score}
                    </span>
                    <span className="rounded-full border border-[#99F6E4] bg-brand-surface px-2.5 py-1 font-semibold text-brand">
                      {summaryMock.strongest.badge}
                    </span>
                    <span className="rounded-full border border-border bg-muted px-2.5 py-1 text-muted-foreground">
                      Variação: {summaryMock.strongest.trend}
                    </span>
                  </div>
                  <div className="mt-3 flex items-center gap-2">
                    <button type="button" className="rounded-lg border border-border px-3 py-1.5 text-[12px] text-muted-foreground hover:bg-muted">
                      Ver pilar
                    </button>
                    <button type="button" className="rounded-lg border border-border px-3 py-1.5 text-[12px] text-muted-foreground hover:bg-muted">
                      Ver fonte
                    </button>
                  </div>
                </div>
              </article>

              <article
                className="rounded-2xl border border-border bg-card p-5 shadow-sm"
                style={{ borderTopWidth: "3px", borderTopColor: "#F59E0B" }}
              >
                <div className="flex items-center gap-2">
                  <TriangleAlert className="h-4 w-4 text-warning-text" />
                  <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-warning-text">Principal Atenção</p>
                </div>
                <div className="mt-3">
                  <p className="text-[26px] font-bold leading-none text-warning-text">{summaryMock.watchout.title}</p>
                  <p className="mt-2.5 text-[14px] leading-relaxed text-dim">
                    O acompanhamento precisa se concentrar na pressão recente sobre margens para entender se foi algo pontual ou mais estrutural.
                  </p>
                  <div className="mt-3 flex flex-wrap items-center gap-2 text-[12px]">
                    <span className="rounded-full border border-warning-border bg-warning-surface px-2.5 py-1 font-semibold text-warning-text">
                      {summaryMock.watchout.score}
                    </span>
                    <span className="rounded-full border border-warning-border bg-warning-surface px-2.5 py-1 font-semibold text-warning-text">
                      {summaryMock.watchout.badge}
                    </span>
                    <span className="rounded-full border border-border bg-muted px-2.5 py-1 text-muted-foreground">
                      Variação: {summaryMock.watchout.trend}
                    </span>
                  </div>
                  <div className="mt-3 flex items-center gap-2">
                    <button type="button" className="rounded-lg border border-border px-3 py-1.5 text-[12px] text-muted-foreground hover:bg-muted">
                      Ver pilar
                    </button>
                    <button type="button" className="rounded-lg border border-border px-3 py-1.5 text-[12px] text-muted-foreground hover:bg-muted">
                      Ver fonte
                    </button>
                  </div>
                </div>
              </article>
            </div>

            <article className="col-span-12 rounded-2xl border border-border bg-card p-5 shadow-sm xl:col-span-4">
              <div className="flex items-center justify-between">
                <h2 className="text-[15px] font-semibold text-foreground">Mapa dos 5 pilares</h2>
                <button
                  type="button"
                  className="text-[11px] text-muted-foreground hover:text-[#475467] hover:underline"
                  onClick={() => setShowScoreInfo(true)}
                >
                  Como calculamos
                </button>
              </div>
              <p className="mt-1 text-[12px] text-muted-foreground">
                Visão geral para apoiar a leitura inicial, sem substituir o diagnóstico.
              </p>
              <div className="mt-3">
                <PillarMap data={summaryMock.mapPillarData} />
              </div>
              <p className="mt-3 rounded-xl border border-border bg-muted px-3 py-2.5 text-[12px] text-[#475467]">
                Atenção principal em {summaryMock.watchout.title}; força relativa em {summaryMock.strongest.title}.
              </p>
            </article>
          </div>

          <article className="rounded-2xl border border-border bg-card p-6 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">Resumo em 60s</p>
                <h2 className="mt-1 text-[16px] font-semibold text-foreground">
                  Uma visão simples do que sustenta a empresa hoje e do que merece acompanhamento.
                </h2>
              </div>
              <button
                type="button"
                className="text-[12px] text-brand hover:underline"
                onClick={() => setShowEvidence(true)}
              >
                Ver fonte
              </button>
            </div>
            <p className="mt-4 text-[14px] leading-relaxed text-foreground">{summaryMock.summaryNarrative}</p>
            <div className="mt-4 grid grid-cols-3 gap-3">
              <div className="rounded-xl border border-border bg-muted p-3">
                <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">Força principal</p>
                <p className="mt-1 text-[13px] font-semibold text-foreground">{summaryMock.summaryScan.strength.pillar}</p>
              </div>
              <div className="rounded-xl border border-border bg-muted p-3">
                <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">Atenção principal</p>
                <p className="mt-1 text-[13px] font-semibold text-foreground">{summaryMock.summaryScan.attention.pillar}</p>
              </div>
              <div className="rounded-xl border border-border bg-muted p-3">
                <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">O que monitorar</p>
                <p className="mt-1 text-[13px] font-semibold text-foreground">{summaryMock.summaryScan.monitor.text}</p>
              </div>
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-2 text-[11px]">
              <span className="rounded-full border border-border bg-muted px-2.5 py-1 text-muted-foreground">
                Atualizado em {summaryMock.summaryMeta.updatedAt}
              </span>
              <span className="rounded-full border border-border bg-muted px-2.5 py-1 text-muted-foreground">
                Fonte: {summaryMock.summaryMeta.source}
              </span>
              <span className="rounded-full border border-[#99F6E4] bg-brand-surface px-2.5 py-1 text-brand">Confiança: Alta</span>
            </div>
          </article>

          <article className="rounded-2xl border border-[#99F6E4] bg-gradient-to-br from-[#F0FDFA] to-[#F6FAFC] p-6">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-brand">Próximas ações</p>
                <h2 className="mt-1 text-[15px] font-semibold text-foreground">
                  Feche a leitura com um próximo passo útil e verificável.
                </h2>
              </div>
              <button
                type="button"
                className="text-[12px] text-brand hover:underline"
                onClick={() => setShowEvidence(true)}
              >
                Ver fonte
              </button>
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <button
                type="button"
                className="rounded-xl border border-brand bg-brand px-4 py-2 text-[13px] font-semibold text-white transition-opacity hover:opacity-90"
              >
                Criar alerta da principal atenção
              </button>
              <button
                type="button"
                className="rounded-xl border border-[#D1FAE5] bg-card px-4 py-2 text-[13px] font-medium text-foreground hover:bg-[#F0FDF4]"
              >
                Ver pilares completos
              </button>
              <button
                type="button"
                className="rounded-xl border border-[#D1FAE5] bg-card px-4 py-2 text-[13px] font-medium text-foreground hover:bg-[#F0FDF4]"
              >
                Comparar com outra empresa
              </button>
            </div>
          </article>
        </div>
      </section>
    </div>
  );
}

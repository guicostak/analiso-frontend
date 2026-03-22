"use client";

import { Dot, ExternalLink } from "lucide-react";
import Link from "next/link";
import type { MoverRow, MovementInsight, MoverType } from "../interfaces";

interface MovementInsightBlock {
  template: string;
  title: string;
  body: string;
  ctaLabel: string;
}

interface ExploreMovementsPanelProps {
  selectedTab: MoverType;
  movers: MoverRow[];
  movementInsights: Record<string, MovementInsight>;
  showAllMovements: boolean;
  compact?: boolean;
  movementSummary?: MovementInsightBlock | null;
  movementDominant?: MovementInsightBlock | null;
  getCompanyLogo: (ticker: string) => string | undefined;
  setSelectedTab: (tab: MoverType) => void;
  setShowAllMovements: (fn: ((prev: boolean) => boolean) | boolean) => void;
}

const tabLabelMap: Record<MoverType, string> = {
  altas: "Altas",
  baixas: "Baixas",
  negociadas: "Fluxo",
};

const tabEmptyStateMap: Record<MoverType, string> = {
  altas: "Nao houve destaques de alta neste pregao.",
  baixas: "Nao houve destaques de baixa neste pregao.",
  negociadas: "Nenhum ticker com fluxo relevante neste pregao.",
};

function MovementCard({
  row,
  insight,
  featured = false,
  getCompanyLogo,
}: {
  row: MoverRow;
  insight?: MovementInsight;
  featured?: boolean;
  getCompanyLogo: (ticker: string) => string | undefined;
}) {
  const impactPillars = insight?.impactPillars ?? "Caixa e Margens";
  const whyOpenNow = insight?.why ?? "Vale confirmar se o movimento altera a leitura dos fundamentos.";

  return (
    <article
      className={`rounded-[24px] border border-[#E7EEF5] ${
        featured ? "bg-[#EEF6FF] p-6 shadow-[0_18px_40px_rgba(15,23,40,0.06)]" : "bg-white p-5 shadow-[0_14px_34px_rgba(15,23,40,0.04)]"
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex items-center gap-3">
            {getCompanyLogo(row.ticker) && (
              <img
                src={getCompanyLogo(row.ticker)}
                alt={`Logo ${row.ticker}`}
                className={`${featured ? "h-12 w-12 rounded-[18px]" : "h-10 w-10 rounded-[16px]"} border border-[#EEF3F7] bg-white object-cover p-1`}
              />
            )}
            <div className="min-w-0">
              <p className={`${featured ? "text-[20px] leading-7" : "text-[16px] leading-6"} truncate font-semibold text-[#0F1728]`}>
                {row.name} <span className="text-[#98A2B3]">{row.ticker}</span>
              </p>
              <p className="text-[12px] font-medium text-[#98A2B3]">Preco {row.price} . {row.changePct}</p>
            </div>
          </div>

          <p className={`mt-4 ${featured ? "text-[18px] leading-7" : "text-[15px] leading-7"} font-medium text-[#0F1728]`}>{row.note}</p>
          <p className="mt-3 text-[14px] leading-6 text-[#475467]">Por que merece leitura: {whyOpenNow}</p>
          <p className="mt-2 text-[12px] font-medium text-[#667085]">Pilares afetados: {impactPillars}</p>
        </div>
      </div>

      <div className={featured ? "mt-6 flex flex-wrap items-center gap-3" : "mt-5 flex flex-wrap items-center gap-3"}>
        <Link
          href={`/empresa/${row.ticker}`}
          className="inline-flex h-11 items-center rounded-[16px] bg-[#0E9384] px-4 text-[14px] font-semibold text-white shadow-[0_12px_30px_rgba(14,147,132,0.18)] transition hover:opacity-90"
        >
          Abrir analise
        </Link>
        <button className="inline-flex items-center gap-2 text-[13px] font-medium text-[#667085] transition hover:text-[#0F1728]">
          <ExternalLink className="h-3.5 w-3.5" />
          Ver contexto
        </button>
      </div>

      <div className="mt-4 text-[12px] text-[#98A2B3]">
        Fonte: {row.source} . Atualizado em {row.updatedAt}
      </div>
    </article>
  );
}

export function ExploreMovementsPanel({
  selectedTab,
  movers,
  movementInsights,
  showAllMovements,
  compact = false,
  movementSummary,
  movementDominant,
  getCompanyLogo,
  setSelectedTab,
  setShowAllMovements,
}: ExploreMovementsPanelProps) {
  const currentMovers = movers.filter((row) => row.type === selectedTab);
  const featuredRow = currentMovers[0];
  const mediumRows = currentMovers.slice(1, 3);
  const compactRows = currentMovers.slice(3, showAllMovements ? 6 : compact ? 4 : 5);

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-[12px] font-medium uppercase tracking-[0.08em] text-[#98A2B3]">Exploracao principal</p>
          <h2 className="mt-2 text-[28px] font-semibold leading-8 tracking-[-0.03em] text-[#0F1728]">Movimentos que pedem contexto</h2>
          <p className="mt-3 max-w-[760px] text-[15px] leading-7 text-[#667085]">
            Primeiro a interpretacao, depois o preco. A tela organiza os movimentos do dia com tres densidades para destacar o que merece abertura imediata.
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-full bg-white px-4 py-2 text-[12px] font-medium text-[#667085] shadow-[0_10px_28px_rgba(15,23,40,0.05)]">
          <Dot className="h-4 w-4 text-[#F3B746]" />
          Interpretado pela Analiso
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {[
          { label: "Altas", value: "altas" },
          { label: "Baixas", value: "baixas" },
          { label: "Fluxo", value: "negociadas" },
        ].map((tab) => (
          <button
            key={tab.value}
            onClick={() => {
              setSelectedTab(tab.value as MoverType);
              setShowAllMovements(false);
            }}
            className={`rounded-full px-5 py-3 text-[13px] font-medium transition ${
              selectedTab === tab.value
                ? "bg-[#EEF6FF] text-[#3965B8] shadow-[0_10px_24px_rgba(15,23,40,0.05)]"
                : "bg-white text-[#667085] hover:text-[#0F1728]"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-12">
        <div className="space-y-5 xl:col-span-8">
          {currentMovers.length === 0 && (
            <div className="rounded-[24px] border border-[#E7EEF5] bg-white px-6 py-5 text-[14px] leading-6 text-[#667085] shadow-[0_14px_34px_rgba(15,23,40,0.04)]">
              {tabEmptyStateMap[selectedTab]}
            </div>
          )}

          {featuredRow && (
            <MovementCard row={featuredRow} insight={movementInsights[featuredRow.ticker]} featured getCompanyLogo={getCompanyLogo} />
          )}

          {mediumRows.length > 0 && (
            <div className="grid gap-5 lg:grid-cols-2">
              {mediumRows.map((row) => (
                <MovementCard key={`${row.ticker}-${row.type}`} row={row} insight={movementInsights[row.ticker]} getCompanyLogo={getCompanyLogo} />
              ))}
            </div>
          )}

          {compactRows.length > 0 && (
            <div className="space-y-3">
              {compactRows.map((row) => (
                <article
                  key={`${row.ticker}-${row.type}`}
                  className="rounded-[20px] border border-[#E7EEF5] bg-white px-5 py-4 shadow-[0_12px_28px_rgba(15,23,40,0.03)]"
                >
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div className="min-w-0">
                      <p className="text-[16px] font-semibold leading-6 text-[#0F1728]">
                        {row.name} <span className="text-[#98A2B3]">{row.ticker}</span>
                      </p>
                      <p className="mt-1 text-[14px] leading-6 text-[#475467]">{row.note}</p>
                      <p className="mt-2 text-[12px] font-medium text-[#667085]">
                        {movementInsights[row.ticker]?.impactPillars ?? "Caixa e Margens"} . {row.price} . {row.changePct}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-3">
                      <Link
                        href={`/empresa/${row.ticker}`}
                        className="inline-flex h-10 items-center rounded-[14px] bg-[#0E9384] px-4 text-[13px] font-semibold text-white"
                      >
                        Abrir analise
                      </Link>
                      <button className="text-[13px] font-medium text-[#667085] transition hover:text-[#0F1728]">Ver contexto</button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}

          {currentMovers.length > 5 ? (
            <button
              onClick={() => setShowAllMovements((prev) => !prev)}
              className="inline-flex rounded-full bg-[#F4F8FB] px-4 py-2 text-[12px] font-semibold text-[#0F1728] transition hover:bg-[#EAF1F7]"
            >
              {showAllMovements ? "Ver menos movimentos" : `Ver mais ${tabLabelMap[selectedTab].toLowerCase()}`}
            </button>
          ) : null}
        </div>

        <aside className="space-y-4 xl:col-span-4 xl:sticky xl:top-24 xl:self-start">
          <div className="rounded-[24px] border border-[#E7EEF5] bg-[#EEF6FF] p-5 shadow-[0_14px_34px_rgba(15,23,40,0.04)]">
            <p className="text-[12px] font-medium uppercase tracking-[0.08em] text-[#3965B8]">Leitura do mercado</p>
            <p className="mt-3 text-[18px] font-semibold leading-7 text-[#0F1728]">
              {movementSummary?.title || `Como ler ${tabLabelMap[selectedTab].toLowerCase()} hoje`}
            </p>
            <p className="mt-3 text-[14px] leading-6 text-[#475467]">
              {movementSummary?.body || "Use os movimentos como pista inicial e confirme se a narrativa aparece tambem nos pilares principais."}
            </p>
          </div>

          <div className="rounded-[24px] border border-[#E7EEF5] bg-[#EFFAF6] p-5 shadow-[0_14px_34px_rgba(15,23,40,0.04)]">
            <p className="text-[12px] font-medium uppercase tracking-[0.08em] text-[#0E9384]">Pilar mais afetado</p>
            <p className="mt-3 text-[18px] font-semibold leading-7 text-[#0F1728]">
              {movementDominant?.title || "Observe o impacto antes do ruido"}
            </p>
            <p className="mt-3 text-[14px] leading-6 text-[#475467]">
              {movementDominant?.body || "Quando o preco chama atencao, o proximo passo e verificar se caixa, margens ou retorno realmente mudaram."}
            </p>
          </div>

          <div className="relative overflow-hidden rounded-[24px] border border-[#F0D7A8] bg-[linear-gradient(180deg,#FFF5E6_0%,#FFFBF5_34%,#FFFFFF_100%)] p-5 shadow-[0_14px_34px_rgba(15,23,40,0.04)]">
            <div className="pointer-events-none absolute inset-x-0 top-0 h-14 bg-[linear-gradient(180deg,rgba(255,232,196,0.78),rgba(255,232,196,0.10))]" />
            <div className="pointer-events-none absolute left-5 top-3 h-9 w-20 rounded-[24px_16px_22px_14px/18px_22px_16px_20px] bg-[linear-gradient(135deg,rgba(255,255,255,0.56),rgba(255,255,255,0.14))]" />
            <div className="pointer-events-none absolute -right-6 -top-6 h-20 w-20 rounded-full bg-[radial-gradient(circle,rgba(243,183,70,0.18)_0%,rgba(243,183,70,0)_72%)]" />
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-[linear-gradient(180deg,rgba(255,247,232,0),rgba(255,247,232,0.36))]" />
            <p className="relative text-[12px] font-medium uppercase tracking-[0.08em] text-[#B27300]">Proximo passo</p>
            <p className="relative mt-2 text-[19px] font-semibold leading-7 text-[#0F1728]">Abra a leitura principal e confirme com fonte</p>
            <p className="relative mt-3 max-w-[92%] text-[14px] leading-6 text-[#475467]">
              Priorize os movimentos com tese clara, valide a origem do sinal e so depois compare empresas em conjunto.
            </p>
            <div className="relative mt-5 flex flex-wrap items-center gap-3 border-t border-[#F4E6C8] pt-4">
              <button className="inline-flex h-10 items-center rounded-[14px] border border-white/80 bg-[linear-gradient(180deg,#FFFFFF_0%,#FFFBF6_100%)] px-4 text-[13px] font-semibold text-[#0F1728] shadow-[0_10px_24px_rgba(15,23,40,0.06)] transition hover:bg-white">
                Ver fonte
              </button>
              <p className="text-[12px] text-[#98A2B3]">Fonte: B3 . Atualizado em 05/02</p>
            </div>
          </div>
        </aside>
      </div>
    </section>
  );
}

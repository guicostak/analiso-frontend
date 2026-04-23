"use client";

import { Dot, TrendingUp } from "lucide-react";
import Link from "next/link";
import type { MoverRow, MovementInsight, MoverType } from "../interfaces";
import { MiniSparkline } from "@/src/components/shared/MiniSparkline";
import { InfoTooltip } from "@/src/components/shared/InfoTooltip";
import { SectionCategoryTag } from "./market/SectionCategoryTag";

/**
 * Copy do tooltip "Como ler esta seção" — substitui as 3 ilhas instrutivas
 * laterais (Leitura do mercado / Pilar mais afetado / Próximo passo) que
 * ocupavam 1/3 da tela e o usuário pulava depois do primeiro uso.
 * Conteúdo denso mas estruturado em parágrafos curtos.
 */
const MOVEMENTS_SECTION_INFO = (
  <div className="space-y-2">
    <p>
      <b>Altas</b>: tickers com maior variação positiva no dia.{" "}
      <b>Baixas</b>: maior variação negativa. <b>Mais negociadas</b>: ranking
      por atividade (volume × preço).
    </p>
    <p>
      Use o movimento como <b>pista inicial</b>, não como conclusão. Abra a
      análise da empresa e confirme se caixa, margens ou retorno realmente
      mudaram antes de decidir.
    </p>
    <p className="text-muted-foreground">
      Cada card traz o pilar mais afetado e uma leitura curta do que aquele
      movimento pode estar sinalizando.
    </p>
  </div>
);

const MOVIMENTOS_CATEGORY_ID = "movimentos";

/** Trend→status do MiniSparkline a partir do delta extremos-fim vs início. */
function sparklineStatus(points: number[] | null | undefined): "healthy" | "attention" | "risk" {
  if (!points || points.length < 2) return "attention";
  const first = points[0];
  const last = points[points.length - 1];
  if (!Number.isFinite(first) || !Number.isFinite(last) || first === 0) return "attention";
  const delta = (last - first) / Math.abs(first);
  if (delta > 0.005) return "healthy";
  if (delta < -0.005) return "risk";
  return "attention";
}

interface ExploreMovementsPanelProps {
  selectedTab: MoverType;
  movers: MoverRow[];
  movementInsights: Record<string, MovementInsight>;
  showAllMovements: boolean;
  compact?: boolean;
  getCompanyLogo: (ticker: string) => string | undefined;
  setSelectedTab: (tab: MoverType) => void;
  setShowAllMovements: (fn: ((prev: boolean) => boolean) | boolean) => void;
}

const tabLabelMap: Record<MoverType, string> = {
  altas: "Altas",
  baixas: "Baixas",
  negociadas: "Mais negociadas",
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
      className={`rounded-[22px] border border-border ${
        featured ? "bg-card p-5 shadow-[0_18px_40px_rgba(15,23,40,0.06)] dark:shadow-none" : "bg-card p-4.5 shadow-[0_14px_34px_rgba(15,23,40,0.04)] dark:shadow-none"
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex items-center gap-3">
            {(row.logoUrl ?? getCompanyLogo(row.ticker)) && (
              <img
                src={row.logoUrl ?? getCompanyLogo(row.ticker)}
                alt={`Logo ${row.ticker}`}
                className={`${featured ? "h-11 w-11 rounded-[16px]" : "h-9 w-9 rounded-[14px]"} border border-border bg-card object-cover p-1`}
              />
            )}
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <SectionCategoryTag icon={TrendingUp} label="Movimentos" categoryId={MOVIMENTOS_CATEGORY_ID} />
                <p className={`${featured ? "text-[18px] leading-6" : "text-[15px] leading-6"} truncate font-semibold text-foreground`}>
                  {row.name} <span className="text-muted-foreground">{row.ticker}</span>
                </p>
              </div>
              <p className="text-[12px] font-medium text-muted-foreground">Preco {row.price} . {row.changePct}</p>
            </div>
          </div>

          <p className={`mt-3 ${featured ? "text-[16px] leading-6" : "text-[14px] leading-6"} font-medium text-foreground`}>{row.note}</p>
          <p className="mt-2.5 text-[13px] leading-5 text-muted-foreground">Por que merece leitura: {whyOpenNow}</p>
          <p className="mt-2 text-[12px] font-medium text-muted-foreground">Pilares afetados: {impactPillars}</p>
        </div>

        {row.sparkline && row.sparkline.length >= 2 && (
          <div className="shrink-0" aria-hidden="true">
            <MiniSparkline
              data={row.sparkline}
              status={sparklineStatus(row.sparkline)}
              width={featured ? 96 : 80}
              height={featured ? 36 : 30}
              strokeWidth={featured ? 1.5 : 1.25}
            />
          </div>
        )}
      </div>

      <div className={featured ? "mt-5 flex flex-wrap items-center gap-3" : "mt-4 flex flex-wrap items-center gap-3"}>
        <Link
          href={`/analysis/${row.ticker}`}
          className="inline-flex h-10 items-center rounded-[14px] bg-brand px-4 text-[13px] font-semibold text-white shadow-[0_12px_30px_rgba(14,147,132,0.18)] transition hover:opacity-90"
        >
          Abrir analise
        </Link>
      </div>

      <div className="mt-4 text-[12px] text-muted-foreground">
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
  getCompanyLogo,
  setSelectedTab,
  setShowAllMovements,
}: ExploreMovementsPanelProps) {
  const currentMovers = movers.filter((row) => row.type === selectedTab);
  const featuredRow = currentMovers[0];
  const mediumRows = currentMovers.slice(1, 3);
  const compactRows = currentMovers.slice(3, showAllMovements ? 6 : compact ? 4 : 5);

  return (
    <section className="space-y-5">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-[12px] font-medium uppercase text-muted-foreground">Exploracao principal</p>
          <h2 className="mt-2 inline-flex items-center gap-2 text-[24px] font-semibold leading-7 tracking-[-0.03em] text-foreground">
            Movimentos que pedem contexto
            <InfoTooltip
              label="Como ler esta seção"
              size={14}
              content={MOVEMENTS_SECTION_INFO}
              contentClassName="max-w-[360px] whitespace-normal leading-relaxed p-3 bg-popover text-popover-foreground border border-border shadow-lg text-[12px]"
            />
          </h2>
          <p className="mt-2.5 max-w-[720px] text-[14px] leading-6 text-muted-foreground">
            Primeiro a interpretacao, depois o preco. A tela organiza os movimentos do dia com tres densidades para destacar o que merece abertura imediata.
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-full bg-card px-4 py-2 text-[11px] font-medium text-muted-foreground shadow-[0_10px_28px_rgba(15,23,40,0.05)] dark:shadow-none">
          <Dot className="h-4 w-4 text-warning-text" />
          Interpretado pela Analiso
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {[
          { label: "Altas", value: "altas" },
          { label: "Baixas", value: "baixas" },
          { label: "Mais negociadas", value: "negociadas" },
        ].map((tab) => (
          <button
            key={tab.value}
            onClick={() => {
              setSelectedTab(tab.value as MoverType);
              setShowAllMovements(false);
            }}
            className={`rounded-full px-4 py-2.5 text-[12px] font-medium transition ${
              selectedTab === tab.value
                ? "bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 shadow-[0_10px_24px_rgba(15,23,40,0.05)] dark:shadow-none"
                : "bg-card text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Grid de 2 colunas foi removido: a aside com 3 ilhas instrutivas
          ("Leitura do mercado", "Pilar mais afetado", "Próximo passo")
          virou InfoTooltip no título da seção. Skills: tooltip aprofunda,
          não substitui hierarquia; ilhas instrutivas repetiam info que o
          usuário já absorveu após 1 sessão. */}
      <div className="space-y-4">
          {currentMovers.length === 0 && (
            <div className="rounded-[24px] border border-border bg-card px-6 py-5 text-[14px] leading-6 text-muted-foreground shadow-[0_14px_34px_rgba(15,23,40,0.04)] dark:shadow-none">
              {tabEmptyStateMap[selectedTab]}
            </div>
          )}

          {featuredRow && (
            <MovementCard row={featuredRow} insight={movementInsights[featuredRow.ticker]} featured getCompanyLogo={getCompanyLogo} />
          )}

          {mediumRows.length > 0 && (
            <div className="grid gap-4 lg:grid-cols-2">
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
                  className="rounded-[18px] border border-border bg-card px-4 py-3.5 shadow-[0_12px_28px_rgba(15,23,40,0.03)] dark:shadow-none"
                >
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <SectionCategoryTag icon={TrendingUp} label="Movimentos" categoryId={MOVIMENTOS_CATEGORY_ID} />
                        <p className="text-[15px] font-semibold leading-6 text-foreground">
                          {row.name} <span className="text-muted-foreground">{row.ticker}</span>
                        </p>
                      </div>
                      <p className="mt-1 text-[13px] leading-5 text-muted-foreground">{row.note}</p>
                      <p className="mt-2 text-[12px] font-medium text-muted-foreground">
                        {movementInsights[row.ticker]?.impactPillars ?? "Caixa e Margens"} . {row.price} . {row.changePct}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-3">
                      {row.sparkline && row.sparkline.length >= 2 && (
                        <div aria-hidden="true">
                          <MiniSparkline
                            data={row.sparkline}
                            status={sparklineStatus(row.sparkline)}
                            width={72}
                            height={26}
                            strokeWidth={1.25}
                          />
                        </div>
                      )}
                      <Link
                        href={`/analysis/${row.ticker}`}
                        className="inline-flex h-9 items-center rounded-[13px] bg-brand px-4 text-[12px] font-semibold text-white"
                      >
                        Abrir analise
                      </Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}

          {currentMovers.length > 5 ? (
            <button
              onClick={() => setShowAllMovements((prev) => !prev)}
              className="inline-flex rounded-full bg-muted px-4 py-2 text-[12px] font-semibold text-foreground transition hover:bg-muted"
            >
              {showAllMovements ? "Ver menos movimentos" : `Ver mais ${tabLabelMap[selectedTab].toLowerCase()}`}
            </button>
          ) : null}
      </div>
    </section>
  );
}

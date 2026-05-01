"use client";

import { useEffect, useState } from "react";
import { Dot, TrendingUp } from "lucide-react";
import Link from "next/link";
import type { MoverRow, MovementInsight, MoverType } from "../interfaces";
import { MiniSparkline } from "@/src/components/shared/MiniSparkline";
import { InfoTooltip } from "@/src/components/shared/InfoTooltip";
import { SectionCategoryTag } from "./market/SectionCategoryTag";

/** Tamanho da página: quantos movers são mostrados ao abrir a aba. */
const PAGE_SIZE = 10;

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
  /** Layout compacto (usado em mocks/landing) — cap fixo em 4 movers. */
  compact?: boolean;
  getCompanyLogo: (ticker: string) => string | undefined;
  setSelectedTab: (tab: MoverType) => void;
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
      className={`relative rounded-3xl border border-border bg-card ${
        featured ? "mercado-elev-md p-5 md:p-6" : "mercado-elev-sm p-4 md:p-5"
      }`}
    >
      {/* Tag silenciosa — seção "Movimentos" já identificada no header da página */}
      <SectionCategoryTag icon={TrendingUp} label="Movimentos" categoryId={MOVIMENTOS_CATEGORY_ID} silent />
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex items-center gap-3">
            {(row.logoUrl ?? getCompanyLogo(row.ticker)) && (
              <img
                src={row.logoUrl ?? getCompanyLogo(row.ticker)}
                alt={`Logo ${row.ticker}`}
                className={`${featured ? "h-11 w-11 rounded-2xl" : "h-9 w-9 rounded-xl"} border border-border bg-card object-cover p-1`}
              />
            )}
            <div className="min-w-0">
              <p className={`${featured ? "text-lg" : "text-base"} truncate font-semibold leading-6 text-foreground`}>
                {row.name} <span className="text-muted-foreground">{row.ticker}</span>
              </p>
              <p className="text-xs font-medium text-muted-foreground tabular-nums">
                Preço {row.price} · {row.changePct}
              </p>
            </div>
          </div>

          <p className={`mt-3 ${featured ? "text-base" : "text-sm"} font-medium leading-6 text-foreground`}>{row.note}</p>
          <p className="mt-2.5 text-sm leading-5 text-muted-foreground">Por que merece leitura: {whyOpenNow}</p>
          <p className="mt-2 text-xs font-medium text-muted-foreground">Pilares afetados: {impactPillars}</p>
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
          className="mercado-elev-sm inline-flex h-10 items-center rounded-xl bg-brand px-4 text-sm font-semibold text-white transition-opacity duration-200 hover:opacity-90"
        >
          Abrir análise
        </Link>
      </div>

      <div className="mt-4 text-xs text-muted-foreground">
        Fonte: {row.source} · Atualizado em {row.updatedAt}
      </div>
    </article>
  );
}

export function ExploreMovementsPanel({
  selectedTab,
  movers,
  movementInsights,
  compact = false,
  getCompanyLogo,
  setSelectedTab,
}: ExploreMovementsPanelProps) {
  /**
   * Paginação local com "Carregar mais".
   *
   * Default: PAGE_SIZE (10) movers visíveis. Cada clique em "Carregar mais"
   * soma mais PAGE_SIZE. Reset automático ao trocar de aba (altas/baixas/
   * mais negociadas) — usuário começa cada aba no estado compacto.
   *
   * Props legadas showAllMovements / setShowAllMovements ficaram órfãs
   * após essa migração; foram removidas da signature. Parent component
   * (MarketContextPage) precisa parar de passá-las.
   */
  const [visibleCount, setVisibleCount] = useState<number>(compact ? 4 : PAGE_SIZE);

  useEffect(() => {
    // Reseta paginação ao trocar de aba pra não mostrar estado residual.
    setVisibleCount(compact ? 4 : PAGE_SIZE);
  }, [selectedTab, compact]);

  const currentMovers = movers.filter((row) => row.type === selectedTab);
  const featuredRow = currentMovers[0];
  const mediumRows = currentMovers.slice(1, 3);
  // Compacts: do 3º em diante até atingir visibleCount total. visibleCount
  // inclui o featured+mediums, então compactRows vai de 3 até visibleCount.
  const compactRows = currentMovers.slice(3, visibleCount);
  const totalMovers = currentMovers.length;
  const hiddenCount = Math.max(0, totalMovers - visibleCount);
  const canLoadMore = hiddenCount > 0;

  return (
    <section className="space-y-5">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Exploração principal</p>
          <h2 className="mt-2 inline-flex items-center gap-2 text-2xl font-semibold leading-tight tracking-[-0.025em] text-foreground">
            Movimentos que pedem contexto
            <InfoTooltip
              label="Como ler esta seção"
              size={14}
              content={MOVEMENTS_SECTION_INFO}
              contentClassName="max-w-[360px] whitespace-normal leading-relaxed p-3 bg-popover text-popover-foreground border border-border shadow-lg text-xs"
            />
          </h2>
          <p className="mt-2.5 max-w-[720px] text-sm leading-6 text-muted-foreground">
            Primeiro a interpretação, depois o preço. A tela organiza os movimentos do dia com três densidades para destacar o que merece abertura imediata.
          </p>
        </div>
        <div className="mercado-elev-sm inline-flex items-center gap-1.5 self-start rounded-full border border-border bg-card px-3 py-1.5 text-[11px] font-medium text-muted-foreground">
          <Dot className="h-4 w-4 text-warning-text" aria-hidden="true" />
          Interpretado pela Analiso
        </div>
      </div>

      {/*
        Segmented control (Altas / Baixas / Mais negociadas) — visualmente
        distinto dos chips de setor (filtro): fundo único compartilhado +
        pill deslizante. Evita confusão perceptiva entre "qual é tab" e
        "qual é filtro de setor".
      */}
      <div
        role="tablist"
        aria-label="Tipo de movimento"
        className="inline-flex w-fit items-center gap-1 rounded-full border border-border bg-muted/60 p-1"
      >
        {[
          { label: "Altas", value: "altas" },
          { label: "Baixas", value: "baixas" },
          { label: "Mais negociadas", value: "negociadas" },
        ].map((tab) => {
          const isActive = selectedTab === tab.value;
          return (
            <button
              key={tab.value}
              role="tab"
              aria-selected={isActive}
              onClick={() => {
                setSelectedTab(tab.value as MoverType);
                // Reset da paginação já é feito pelo useEffect([selectedTab]).
              }}
              className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-colors duration-200 ${
                isActive
                  ? "mercado-elev-sm bg-card text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Grid de 2 colunas foi removido: a aside com 3 ilhas instrutivas
          ("Leitura do mercado", "Pilar mais afetado", "Próximo passo")
          virou InfoTooltip no título da seção. Skills: tooltip aprofunda,
          não substitui hierarquia; ilhas instrutivas repetiam info que o
          usuário já absorveu após 1 sessão. */}
      <div className="space-y-4">
          {currentMovers.length === 0 && (
            <div className="mercado-elev-sm rounded-3xl border border-border bg-card px-6 py-5 text-sm leading-6 text-muted-foreground">
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
                  className="mercado-elev-sm mercado-island-hover relative rounded-2xl border border-border bg-card px-4 py-3.5"
                >
                  {/* Tag silenciosa — seção Movimentos já identificada acima */}
                  <SectionCategoryTag icon={TrendingUp} label="Movimentos" categoryId={MOVIMENTOS_CATEGORY_ID} silent />
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div className="min-w-0">
                      <p className="text-[15px] font-semibold leading-6 text-foreground">
                        {row.name} <span className="text-muted-foreground">{row.ticker}</span>
                      </p>
                      <p className="mt-1 text-sm leading-5 text-muted-foreground">{row.note}</p>
                      <p className="mt-2 text-xs font-medium text-muted-foreground tabular-nums">
                        {movementInsights[row.ticker]?.impactPillars ?? "Caixa e Margens"} · {row.price} · {row.changePct}
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
                        className="inline-flex h-9 items-center rounded-xl bg-brand px-4 text-xs font-semibold text-white transition-opacity duration-200 hover:opacity-90"
                      >
                        Abrir análise
                      </Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}

          {/*
            Controles de paginação. Skill 30-component-rubrics: "expandir com
            cuidado" — mostrar contagem ajuda o usuário a decidir. 3 botões
            progressivos:
            - "Carregar mais 10" (+PAGE_SIZE) — default, movimento seguro
            - "Mostrar todos (N)" — atalho pra quem quer listagem completa
            - "Mostrar menos" — só quando expandiu além do default
          */}
          {!compact && totalMovers > PAGE_SIZE && (
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <p className="text-xs tabular-nums text-muted-foreground">
                Mostrando {Math.min(visibleCount, totalMovers)} de {totalMovers}
              </p>
              {canLoadMore && (
                <button
                  onClick={() => setVisibleCount((n) => n + PAGE_SIZE)}
                  className="inline-flex items-center rounded-full border border-border bg-card px-3.5 py-1.5 text-xs font-semibold text-foreground transition-colors duration-200 hover:bg-accent"
                >
                  Carregar mais {Math.min(PAGE_SIZE, hiddenCount)}
                </button>
              )}
              {canLoadMore && totalMovers > visibleCount + PAGE_SIZE && (
                <button
                  onClick={() => setVisibleCount(totalMovers)}
                  className="inline-flex items-center rounded-full border border-border bg-card px-3.5 py-1.5 text-xs font-medium text-muted-foreground transition-colors duration-200 hover:text-foreground"
                >
                  Mostrar todos ({totalMovers})
                </button>
              )}
              {visibleCount > PAGE_SIZE && (
                <button
                  onClick={() => setVisibleCount(PAGE_SIZE)}
                  className="inline-flex items-center rounded-full px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors duration-200 hover:text-foreground"
                >
                  Mostrar menos
                </button>
              )}
            </div>
          )}
      </div>
    </section>
  );
}

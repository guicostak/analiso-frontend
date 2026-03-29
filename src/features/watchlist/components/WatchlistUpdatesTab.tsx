"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { GlossaryText } from "@/src/features/glossary/components/glossary-text";
import type { FeedItem, PriorityItem, Pillar, FeedSeverity, FeedSource } from "../interfaces";
import type {
  WatchlistStateBlockDto,
  WatchlistPrioritySectionDto,
  WatchlistSessionClosingDto,
} from "../services";

const feedBadgeStyles: Record<FeedSeverity, string> = {
  Risco: "border-danger-border bg-danger-surface/80 text-danger-text",
  Atenção: "border-warning-border bg-warning-surface/80 text-warning-text",
  Saudável: "border-success-border bg-success-surface/80 text-success-text",
};

const feedShellStyles: Record<FeedSeverity, string> = {
  Risco: "border-danger-border bg-danger-surface dark:bg-danger-surface",
  Atenção: "border-warning-border bg-warning-surface dark:bg-warning-surface",
  Saudável: "border-border bg-card",
};

const pillarTagStyles: Record<Pillar, string> = {
  Dívida: "border-danger-border bg-danger-surface text-danger-text",
  Caixa: "border-warning-border bg-warning-surface text-warning-text",
  Margens: "border-success-border bg-success-surface text-success-text",
  Retorno: "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-800/50 dark:bg-blue-900/30 dark:text-blue-300",
  Proventos: "border-success-border bg-success-surface text-brand",
};

const rangeOptions: Array<"7d" | "30d" | "90d" | "Todos"> = ["7d", "30d", "90d", "Todos"];
const pillars: Pillar[] = ["Dívida", "Caixa", "Margens", "Retorno", "Proventos"];

interface WatchlistUpdatesTabProps {
  stateBlock: WatchlistStateBlockDto | null;
  prioritySection: WatchlistPrioritySectionDto | null;
  updatesSectionHeader: { title: string; body: string } | null;
  priorityItems: PriorityItem[];
  filteredFeedItems: FeedItem[];
  sessionClosing: WatchlistSessionClosingDto | null;
  activeRange: "7d" | "30d" | "90d" | "Todos";
  severityFilter: "Todos" | FeedSeverity;
  sourceFilter: "Todas" | FeedSource;
  showAdvancedFeedFilters: boolean;
  activePillars: Pillar[];
  buildCompanyDeepLink: (ticker: string, pillar: Pillar, evidenceId?: string) => string;
  setActiveRange: (range: "7d" | "30d" | "90d" | "Todos") => void;
  setSeverityFilter: (v: "Todos" | FeedSeverity) => void;
  setSourceFilter: (v: "Todas" | FeedSource) => void;
  setShowAdvancedFeedFilters: (v: boolean) => void;
  togglePillar: (pillar: Pillar) => void;
}

function getPriorityTone(badge: string) {
  if (badge === "Risco") {
    return {
      shell: "border-danger-border bg-danger-surface dark:bg-danger-surface",
      badge: "border-danger-border bg-danger-surface/80 text-danger-text",
      chip: "bg-card/80 text-danger-text",
    };
  }

  if (badge === "Atenção") {
    return {
      shell: "border-warning-border bg-warning-surface dark:bg-warning-surface",
      badge: "border-warning-border bg-warning-surface/80 text-warning-text",
      chip: "bg-card/80 text-warning-text",
    };
  }

  return {
    shell: "border-success-border bg-success-surface dark:bg-success-surface",
    badge: "border-success-border bg-success-surface/80 text-success-text",
    chip: "bg-card/80 text-success-text",
  };
}

export function WatchlistUpdatesTab({
  stateBlock,
  prioritySection,
  updatesSectionHeader,
  priorityItems,
  filteredFeedItems,
  sessionClosing,
  activeRange,
  severityFilter,
  sourceFilter,
  showAdvancedFeedFilters,
  activePillars,
  buildCompanyDeepLink,
  setActiveRange,
  setSeverityFilter,
  setSourceFilter,
  setShowAdvancedFeedFilters,
  togglePillar,
}: WatchlistUpdatesTabProps) {
  const router = useRouter();

  return (
    <div className="space-y-6">
      {stateBlock && (
        <section className="relative overflow-hidden rounded-[28px] border border-border bg-[linear-gradient(140deg,var(--brand-surface)_0%,var(--success-surface)_26%,var(--card)_58%,var(--card)_100%)] dark:bg-[linear-gradient(140deg,rgba(59,130,246,0.08)_0%,rgba(18,165,148,0.06)_26%,rgba(15,23,40,0)_58%,transparent_100%)] dark:bg-card p-7 shadow-[0_24px_50px_rgba(15,23,40,0.07)] dark:shadow-none">
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute left-[-8%] top-0 h-36 w-36 rounded-full bg-[radial-gradient(circle,rgba(91,141,239,0.18)_0%,rgba(91,141,239,0)_72%)]" />
            <div className="absolute right-0 top-10 h-32 w-40 rounded-full bg-[radial-gradient(circle,rgba(18,165,148,0.16)_0%,rgba(18,165,148,0)_72%)]" />
          </div>

          <div className="relative flex min-h-[190px] flex-col justify-between gap-6 lg:flex-row lg:items-start">
            <div className="max-w-[64rem] space-y-4 lg:pr-10">
              <p className="text-[12px] font-medium uppercase tracking-[0.08em] text-blue-500 dark:text-blue-400">{stateBlock.eyebrow}</p>
              <div className="space-y-3">
                <h2 className="max-w-[38ch] text-[28px] font-semibold leading-[32px] tracking-[-0.03em] text-foreground">
                  {stateBlock.headline}
                </h2>
                <p className="max-w-[100ch] text-[15px] leading-7 text-muted-foreground">{stateBlock.body}</p>
              </div>
            </div>

            <span className="rounded-full border border-blue-200 bg-card/80 px-4 py-2 text-[12px] font-semibold text-blue-700 dark:border-blue-800/50 dark:text-blue-300 shadow-[0_10px_24px_rgba(15,23,40,0.04)] dark:shadow-none">
              {stateBlock.pill}
            </span>
          </div>
        </section>
      )}

      <section className="rounded-[28px] border border-border bg-card p-7 shadow-[0_18px_40px_rgba(15,23,40,0.04)] dark:shadow-none">
        <div className="mb-6 flex items-center justify-between gap-4">
          <div>
            <h2 className="text-[28px] font-semibold leading-[32px] tracking-[-0.03em] text-foreground">
              {prioritySection?.title ?? "Prioridade"}
            </h2>
            <p className="mt-2 text-[15px] leading-6 text-muted-foreground">
              {prioritySection?.body ?? "Ordenado pelo que mais merece sua atenção agora."}
            </p>
          </div>
          <span className="rounded-full border border-border bg-muted px-4 py-2 text-[12px] font-medium text-muted-foreground">
            {prioritySection?.countLabel ?? `${Math.min(priorityItems.length, 3)} itens`}
          </span>
        </div>

        <div className="space-y-4">
          {priorityItems.slice(0, 3).map((item, index) => {
            const tone = getPriorityTone(item.badge);

            return (
              <article
                key={item.id}
                role="button"
                tabIndex={0}
                onClick={() => router.push(buildCompanyDeepLink(item.ticker, item.pillar))}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    router.push(buildCompanyDeepLink(item.ticker, item.pillar));
                  }
                }}
                className={`cursor-pointer border transition ${tone.shell} ${
                  index === 0
                    ? "rounded-[28px] p-7 shadow-[0_24px_52px_rgba(15,23,40,0.08)] dark:shadow-none"
                    : index === 1
                      ? "rounded-[24px] p-5 shadow-[0_14px_34px_rgba(15,23,40,0.04)] dark:shadow-none"
                      : "rounded-[22px] p-4 shadow-[0_10px_24px_rgba(15,23,40,0.03)] dark:shadow-none"
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-3">
                    <div className="flex flex-wrap items-center gap-2">
                      {item.topTag && (
                        <span className="rounded-full border border-blue-200 bg-card/80 px-3 py-1 text-[11px] font-semibold text-blue-700 dark:border-blue-800/50 dark:text-blue-300">
                          {item.topTag}
                        </span>
                      )}
                      <span className={`rounded-full border px-3 py-1 text-[11px] font-semibold ${tone.badge}`}>
                        {item.badge}
                      </span>
                      <span className={`rounded-full px-3 py-1 text-[11px] font-medium ${tone.chip}`}>
                        {item.pillar}
                      </span>
                    </div>

                    <div>
                      <p className={`${index === 0 ? "text-[24px] leading-[30px]" : index === 1 ? "text-[19px] leading-[25px]" : "text-[17px] leading-6"} font-semibold tracking-[-0.02em] text-foreground`}>
                        {item.company} <span className="text-muted-foreground">({item.ticker})</span>
                      </p>
                      {item.sector && <p className="mt-1 text-[13px] text-muted-foreground">{item.sector}</p>}
                      <p className={`mt-2 font-medium text-muted-foreground ${index === 2 ? "text-[13px] leading-5" : "text-[14px] leading-6"}`}>
                        {item.contextLine}
                      </p>
                    </div>
                  </div>

                  <div className={`shrink-0 rounded-full bg-card/65 ${index === 0 ? "h-11 w-11" : index === 1 ? "h-9 w-9" : "h-8 w-8"}`} />
                </div>

                <div className={`mt-${index === 2 ? "4" : "5"} grid gap-3 ${index === 0 ? "lg:grid-cols-[1.15fr_0.85fr]" : "lg:grid-cols-[1fr_0.8fr]"}`}>
                  <div className={`rounded-[22px] bg-card/72 ${index === 2 ? "p-3.5" : "p-4"}`}>
                    <p className="text-[12px] font-medium uppercase tracking-[0.08em] text-muted-foreground">{item.changeLabel}</p>
                    <p className={`mt-2 text-foreground ${index === 0 ? "text-[15px] leading-7" : index === 1 ? "text-[14px] leading-6" : "text-[13px] leading-6"}`}>
                      {item.change}
                    </p>
                  </div>
                  <div className={`rounded-[22px] bg-card/60 ${index === 2 ? "p-3.5" : "p-4"}`}>
                    <p className="text-[12px] font-medium uppercase tracking-[0.08em] text-muted-foreground">{item.whyLabel}</p>
                    <p className={`mt-2 text-muted-foreground ${index === 0 ? "text-[15px] leading-7" : index === 1 ? "text-[14px] leading-6" : "text-[13px] leading-6"}`}>
                      {item.why}
                    </p>
                  </div>
                </div>

                <div className={`mt-${index === 2 ? "4" : "5"} flex flex-col gap-3 border-t border-border pt-4 sm:flex-row sm:items-center sm:justify-between`}>
                  <p className="text-[12px] leading-5 text-muted-foreground">{item.evidence}</p>
                  <Link
                    href={buildCompanyDeepLink(item.ticker, item.pillar, item.evidenceId)}
                    onClick={(event) => event.stopPropagation()}
                    className={`inline-flex items-center justify-center rounded-full px-4 py-2.5 text-[13px] font-semibold transition ${
                      index === 0
                        ? "bg-brand text-white shadow-[0_14px_30px_rgba(18,165,148,0.18)] hover:bg-brand-dark"
                        : "border border-border bg-card text-foreground hover:bg-muted"
                    }`}
                  >
                    {item.ctaLabel}
                  </Link>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <section className="overflow-hidden rounded-[28px] border border-border bg-card shadow-[0_18px_40px_rgba(15,23,40,0.04)] dark:shadow-none">
        <div className="border-b border-border px-7 pb-6 pt-7">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <h2 className="text-[28px] font-semibold leading-[32px] tracking-[-0.03em] text-foreground">
                {updatesSectionHeader?.title ?? "Atualizações"}
              </h2>
              <p className="mt-2 max-w-[60ch] text-[15px] leading-6 text-muted-foreground">
                {updatesSectionHeader?.body ?? "Feed contínuo com foco no que pede ação agora."}
              </p>
            </div>
            <div className="rounded-full border border-border bg-muted px-4 py-2 text-[12px] font-medium text-muted-foreground">
              {filteredFeedItems.length} atualizações
            </div>
          </div>

          <div className="mt-5 rounded-[22px] border border-border bg-card p-4">
            <div className="flex flex-wrap items-center gap-2">
              {rangeOptions.map((range) => (
                <button
                  key={range}
                  onClick={() => setActiveRange(range)}
                  className={`rounded-full border px-4 py-2 text-[12px] font-semibold transition ${
                    activeRange === range
                      ? "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-800/50 dark:bg-blue-900/30 dark:text-blue-300"
                      : "border-border bg-card text-muted-foreground hover:bg-muted"
                  }`}
                >
                  {range}
                </button>
              ))}

              {(["Risco", "Atenção", "Saudável"] as const).map((option) => (
                <button
                  key={option}
                  onClick={() => setSeverityFilter(option)}
                  className={`rounded-full border px-4 py-2 text-[12px] font-semibold transition ${
                    severityFilter === option
                      ? "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-800/50 dark:bg-blue-900/30 dark:text-blue-300"
                      : "border-border bg-card text-muted-foreground hover:bg-muted"
                  }`}
                >
                  {option}
                </button>
              ))}

              <button
                onClick={() => setSeverityFilter("Todos")}
                className={`rounded-full border px-4 py-2 text-[12px] font-semibold transition ${
                  severityFilter === "Todos"
                    ? "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-800/50 dark:bg-blue-900/30 dark:text-blue-300"
                    : "border-border bg-card text-muted-foreground hover:bg-muted"
                }`}
              >
                Todas
              </button>

              <button
                onClick={() => setShowAdvancedFeedFilters(!showAdvancedFeedFilters)}
                className={`rounded-full border px-4 py-2 text-[12px] font-semibold transition ${
                  showAdvancedFeedFilters
                    ? "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-800/50 dark:bg-blue-900/30 dark:text-blue-300"
                    : "border-border bg-card text-muted-foreground hover:bg-muted"
                }`}
              >
                Filtros avançados: {showAdvancedFeedFilters ? "ON" : "OFF"}
              </button>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-3 border-t border-border pt-3 text-[12px] text-muted-foreground">
              <span>Período ativo: {activeRange}</span>
              <span>Fonte: {sourceFilter.toLowerCase()}</span>
            </div>
          </div>

          {showAdvancedFeedFilters && (
            <div className="mt-5 rounded-[24px] border border-border bg-muted p-5">
              <div className="flex flex-col gap-4">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[12px] font-medium uppercase tracking-[0.08em] text-muted-foreground">Fonte</span>
                  {(["Todas", "CVM", "B3", "RI"] as const).map((option) => (
                    <button
                      key={option}
                      onClick={() => setSourceFilter(option)}
                      className={`rounded-full border px-4 py-2 text-[12px] font-semibold transition ${
                        sourceFilter === option
                          ? "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-800/50 dark:bg-blue-900/30 dark:text-blue-300"
                          : "border-border bg-card text-muted-foreground hover:bg-card"
                      }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[12px] font-medium uppercase tracking-[0.08em] text-muted-foreground">Pilar</span>
                  {pillars.map((pillar) => (
                    <button
                      key={pillar}
                      onClick={() => togglePillar(pillar)}
                      className={`rounded-full border px-4 py-2 text-[12px] font-semibold transition ${
                        activePillars.includes(pillar)
                          ? "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-800/50 dark:bg-blue-900/30 dark:text-blue-300"
                          : "border-border bg-card text-muted-foreground hover:bg-card"
                      }`}
                    >
                      {pillar}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="px-7 py-7">
          {filteredFeedItems.length === 0 ? (
            <div className="flex min-h-[320px] items-center justify-center rounded-[24px] border border-border bg-card px-6 py-10">
              <div className="mx-auto flex max-w-[34rem] flex-col items-center text-center">
                <div className="relative mb-8 flex h-28 w-28 items-center justify-center">
                  <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle,rgba(91,141,239,0.14)_0%,rgba(91,141,239,0)_72%)]" />
                  <div className="absolute left-5 top-5 h-12 w-12 rounded-[16px] bg-[linear-gradient(180deg,var(--brand-surface),var(--brand))] opacity-30 shadow-[0_16px_24px_rgba(91,141,239,0.18)] dark:shadow-none" />
                  <div className="absolute right-4 top-9 h-10 w-10 rounded-[14px] bg-[linear-gradient(180deg,var(--success-surface),var(--brand-surface))] opacity-30 shadow-[0_14px_22px_rgba(18,165,148,0.14)] dark:shadow-none" />
                  <div className="absolute bottom-3 left-1/2 h-4 w-16 -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(15,23,40,0.10)_0%,rgba(15,23,40,0)_72%)]" />
                </div>

                <h3 className="text-[22px] font-semibold leading-[28px] tracking-[-0.02em] text-foreground">
                  Nada por aqui ainda
                </h3>
                <p className="mt-3 max-w-[34ch] text-[15px] leading-7 text-muted-foreground">
                  Assim que houver atualizações. elas aparecerão neste espaço.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredFeedItems.map((item, index) => (
                <div
                  key={item.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => router.push(buildCompanyDeepLink(item.ticker, item.pillar))}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      router.push(buildCompanyDeepLink(item.ticker, item.pillar));
                    }
                  }}
                  className={`cursor-pointer transition ${
                    index === 0
                      ? `rounded-[24px] border p-6 shadow-[0_18px_40px_rgba(15,23,40,0.06)] dark:shadow-none ${feedShellStyles[item.severity]}`
                      : index === 1
                        ? `rounded-[22px] border p-4.5 shadow-[0_10px_24px_rgba(15,23,40,0.03)] dark:shadow-none ${feedShellStyles[item.severity]}`
                        : item.severity === "Saudável"
                          ? "rounded-[18px] border border-border bg-card px-4 py-3"
                          : `rounded-[20px] border p-3.5 ${feedShellStyles[item.severity]}`
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`rounded-full border px-3 py-1 text-[11px] font-semibold ${feedBadgeStyles[item.severity]}`}>
                          {item.severity}
                        </span>
                        <span className={`rounded-full border px-3 py-1 text-[11px] font-medium ${pillarTagStyles[item.pillar]}`}>
                          {item.pillar}
                        </span>
                      </div>
                      <h3 className={`mt-3 font-semibold tracking-[-0.02em] text-foreground ${index === 0 ? "text-[20px] leading-[26px]" : index === 1 ? "text-[17px] leading-6" : "text-[15px] leading-6"}`}>
                        {item.headline}
                      </h3>
                      <div className={`mt-2 text-muted-foreground ${index === 0 ? "text-[15px] leading-7" : index === 1 ? "text-[14px] leading-6" : "text-[13px] leading-6"}`}>
                        <GlossaryText text={item.detail} />
                      </div>
                      {item.severity !== "Saudável" && (
                        <p className="mt-2 text-[14px] leading-6 text-muted-foreground">
                          <GlossaryText text={item.detailTwo} />
                        </p>
                      )}
                    </div>

                    <div className="shrink-0">
                      <Link
                        href={buildCompanyDeepLink(item.ticker, item.pillar, item.evidenceId)}
                        onClick={(event) => event.stopPropagation()}
                        className={`inline-flex items-center justify-center rounded-full px-4 py-2.5 text-[13px] font-semibold transition ${
                          index === 0
                            ? "bg-brand text-white shadow-[0_14px_30px_rgba(18,165,148,0.18)] hover:bg-brand-dark"
                            : "border border-border bg-card text-foreground hover:bg-muted"
                        }`}
                      >
                        {item.ctaLabel}
                      </Link>
                    </div>
                  </div>

                  <div className="mt-4 flex flex-wrap items-center gap-3 text-[12px] text-muted-foreground">
                    <span>{item.evidence}</span>
                    <span>{item.source}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {sessionClosing && (
        <section className="overflow-hidden rounded-[28px] border border-border bg-card shadow-[0_18px_40px_rgba(15,23,40,0.04)] dark:shadow-none">
          <div className="h-1 bg-[linear-gradient(90deg,var(--brand),var(--brand-surface))]" />
          <div className="px-7 py-8">
            <div className="max-w-[62ch]">
              <p className="text-[12px] font-medium uppercase tracking-[0.08em] text-muted-foreground">Fechamento da sessão</p>
              <h3 className="mt-3 text-[20px] font-semibold leading-[26px] tracking-[-0.02em] text-foreground">
                {sessionClosing.title}
              </h3>
              <p className="mt-3 text-[15px] leading-7 text-muted-foreground">{sessionClosing.body}</p>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}

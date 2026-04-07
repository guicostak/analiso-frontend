import type { AnalysisData, PriceScenario, SensitivityDriver, TimelineEvent } from '../interfaces';
import { apiFetch } from '@/src/lib/api';

export { trackAnalysis } from './telemetry';
export type { AnalysisTelemetryEvent } from './telemetry';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyObj = Record<string, any>;

/**
 * Normalises the v2 backend response to match the frontend AnalysisData shape.
 */
function normalizeV2Response(raw: AnyObj): AnalysisData {
  const priceScenarios: PriceScenario[] = ((raw.priceScenarios ?? []) as AnyObj[]).map(s => ({
    key:            s.key ?? s.scenarioKey ?? '',
    label:          s.label ?? '',
    estimatedValue: s.estimatedValue ?? 0,
    gapVsCurrent:   s.gapVsCurrent ?? 0,
    wacc:           s.wacc,
    growthRate:     s.growthRate,
    note:           s.note ?? s.reading,
  }));

  const sensitivityDrivers: SensitivityDriver[] = ((raw.sensitivityDrivers ?? []) as AnyObj[]).map(d => ({
    key:    d.key ?? d.driverKey ?? '',
    label:  d.label ?? '',
    impact: d.impact ?? 'medium',
  }));

  const timelineEvents: TimelineEvent[] = ((raw.timelineEvents ?? []) as AnyObj[]).map(e => ({
    date:           e.date ?? '',
    title:          e.title ?? '',
    source:         e.source ?? '',
    expectedImpact: e.expectedImpact === 'positive' || e.expectedImpact === 'negative'
      ? e.expectedImpact
      : 'neutral',
    description:    e.description ?? e.why,
  }));

  const rawHealth = (raw.health ?? {}) as AnyObj;
  const health = {
    ...rawHealth,
    balanceSheet: rawHealth.balanceSheet ?? {
      assets:      { cash: 0, receivables: 0, inventory: 0, physicalAssets: 0, longTermAssets: 0 },
      liabilities: { accountsPayable: 0, debt: 0, otherLiabilities: 0, equity: 0 },
    },
    assetsVsLiabilities: rawHealth.assetsVsLiabilities ?? {
      shortTermAssets: 0, longTermAssets: 0,
      shortTermLiabilities: 0, longTermLiabilities: 0,
    },
    debtToEquitySeries:  rawHealth.debtToEquitySeries  ?? [],
    debtHistorySeries:   rawHealth.debtHistorySeries   ?? [],
  };

  const rewardsAndRisks = ((raw.rewardsAndRisks ?? []) as AnyObj[]).map(r => {
    const isSentinel = r.text === 'positive' || r.text === 'negative' || r.text === 'neutral';
    const text   = isSentinel ? (r.detail ?? r.text) : (r.text ?? r.detail ?? '');
    const detail = isSentinel ? '' : (r.detail ?? '');
    return { type: r.type as 'reward' | 'risk', text, detail };
  });

  return {
    ...(raw as unknown as AnalysisData),
    priceScenarios,
    sensitivityDrivers,
    timelineEvents,
    health: health as AnalysisData['health'],
    rewardsAndRisks,
    recentChanges:        raw.recentChanges        ?? [],
    futureUpdates:        raw.futureUpdates         ?? [],
    pastUpdates:          raw.pastUpdates           ?? [],
    healthUpdates:        raw.healthUpdates         ?? [],
    dividendUpdates:      raw.dividendUpdates       ?? [],
    priceContextSeries:   raw.priceContextSeries    ?? [],
    contextEvents:        raw.contextEvents         ?? [],
    distributions:        raw.distributions         ?? [],
    dcfSensitivity:       raw.dcfSensitivity        ?? [],
    ratioTrends:          raw.ratioTrends            ?? [],
    marginSeries:         raw.marginSeries           ?? [],
    returnComparison:     raw.returnComparison       ?? [],
    dividendVsEarnings:   raw.dividendVsEarnings     ?? [],
    competitors:          raw.competitors            ?? [],
    analystTargets:       raw.analystTargets         ?? [],
    earningsRevenueSeries:raw.earningsRevenueSeries  ?? [],
    priceEvents:          raw.priceEvents            ?? [],
    communityFairValues:  raw.communityFairValues    ?? [],
    incomeBreakdown: ((raw.incomeBreakdown ?? raw.pastPerformance?.incomeBreakdown ?? []) as AnyObj[]).map((item: AnyObj) => ({
      year:         String(item.year ?? ''),
      receita:      item.receita      ?? item.netRevenue      ?? item.revenue         ?? 0,
      cpv:          item.cpv          ?? item.cogs            ?? item.costOfRevenue   ?? item.costOfGoodsSold ?? 0,
      lucroBruto:   item.lucroBruto   ?? item.grossProfit     ?? 0,
      despesasOp:   item.despesasOp   ?? item.operatingExpenses ?? item.opex          ?? 0,
      ebit:         item.ebit         ?? 0,
      financeiroIR: item.financeiroIR ?? item.financialAndTax ?? item.nonOperatingAndTax ?? item.financialResult ?? 0,
      lucroLiquido: item.lucroLiquido ?? item.netIncome       ?? item.netProfit       ?? 0,
    })),
    snowflake:            raw.snowflake              ?? [],
    marketCycle:          raw.marketCycle             ?? undefined,
  };
}

/* ── Section types (match backend section DTOs) ─────────────────────────── */

export type SectionName = 'value' | 'future' | 'past' | 'health' | 'dividend';

/* ── Fetch functions ────────────────────────────────────────────────────── */

/**
 * Fetch CORE analysis data (~10 KB) — company, snowflake, valuation, overview.
 */
export async function fetchAnalysisCoreData(
  ticker: string,
  token?: string | null,
): Promise<Partial<AnalysisData>> {
  const raw = await apiFetch<AnyObj>(
    `/api/v2/company-analysis/${ticker.toUpperCase()}/core`,
    {},
    token,
  );
  return normalizeV2Response(raw);
}

/**
 * Fetch a single section's data. Each section endpoint returns only
 * the fields relevant to that tab, keeping the payload small.
 */
export async function fetchAnalysisSection(
  ticker: string,
  section: SectionName,
  token?: string | null,
): Promise<Partial<AnalysisData>> {
  const raw = await apiFetch<AnyObj>(
    `/api/v2/company-analysis/${ticker.toUpperCase()}/section/${section}`,
    {},
    token,
  );
  return normalizeV2Response(raw);
}

/**
 * Fetch the FULL analysis data (~90 KB). Kept as fallback.
 */
export async function fetchAnalysisData(
  ticker: string,
  token?: string | null,
): Promise<AnalysisData> {
  const raw = await apiFetch<AnyObj>(
    `/api/v2/company-analysis/${ticker.toUpperCase()}`,
    {},
    token,
  );
  return normalizeV2Response(raw);
}

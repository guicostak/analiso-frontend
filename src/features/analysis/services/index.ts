import type { AnalysisData, PriceScenario, SensitivityDriver, TimelineEvent } from '../interfaces';
import { apiFetch } from '@/src/lib/api';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyObj = Record<string, any>;

/**
 * Normalises the v2 backend response to match the frontend AnalysisData shape.
 *
 * The v2 endpoint already returns the correct flat structure, but a few field
 * names differ from the TypeScript interfaces:
 *
 *  - priceScenarios[].scenarioKey  → key
 *  - sensitivityDrivers[].driverKey → key
 *  - timelineEvents[].why           → description
 *  - health.balanceSheet            may be null → safe default
 *  - rewardsAndRisks[].text         may be "positive"/"negative" → use detail
 */
function normalizeV2Response(raw: AnyObj): AnalysisData {
  // ── priceScenarios ─────────────────────────────────────────────────────────
  const priceScenarios: PriceScenario[] = ((raw.priceScenarios ?? []) as AnyObj[]).map(s => ({
    key:            s.key ?? s.scenarioKey ?? '',
    label:          s.label ?? '',
    estimatedValue: s.estimatedValue ?? 0,
    gapVsCurrent:   s.gapVsCurrent ?? 0,
    wacc:           s.wacc,
    growthRate:     s.growthRate,
    note:           s.note ?? s.reading,
  }));

  // ── sensitivityDrivers ─────────────────────────────────────────────────────
  const sensitivityDrivers: SensitivityDriver[] = ((raw.sensitivityDrivers ?? []) as AnyObj[]).map(d => ({
    key:    d.key ?? d.driverKey ?? '',
    label:  d.label ?? '',
    impact: d.impact ?? 'medium',
  }));

  // ── timelineEvents ─────────────────────────────────────────────────────────
  const timelineEvents: TimelineEvent[] = ((raw.timelineEvents ?? []) as AnyObj[]).map(e => ({
    date:           e.date ?? '',
    title:          e.title ?? '',
    source:         e.source ?? '',
    expectedImpact: e.expectedImpact === 'positive' || e.expectedImpact === 'negative'
      ? e.expectedImpact
      : 'neutral',
    description:    e.description ?? e.why,
  }));

  // ── health.balanceSheet null guard ─────────────────────────────────────────
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

  // ── rewardsAndRisks: normalise text field ──────────────────────────────────
  const rewardsAndRisks = ((raw.rewardsAndRisks ?? []) as AnyObj[]).map(r => ({
    type:   r.type as 'reward' | 'risk',
    // If text is a generic sentiment word, prefer detail as the display text
    text:   (r.text === 'positive' || r.text === 'negative' || r.text === 'neutral')
      ? (r.detail ?? r.text)
      : (r.text ?? r.detail ?? ''),
    detail: r.detail ?? '',
  }));

  // ── safe-default arrays for every optional list field ─────────────────────
  return {
    ...(raw as unknown as AnalysisData),
    priceScenarios,
    sensitivityDrivers,
    timelineEvents,
    health: health as AnalysisData['health'],
    rewardsAndRisks,
    // ensure no undefined arrays crash components
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
    incomeBreakdown:      raw.incomeBreakdown        ?? [],
    snowflake:            raw.snowflake              ?? [],
  };
}

/**
 * Fetch analysis data from the v2 backend endpoint.
 * The v2 endpoint returns a flat AnalysisData-compatible structure which is
 * then lightly normalised to fix minor field-name differences.
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

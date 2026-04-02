import type { AnalysisData, DimensionScore, SnowflakeDimension } from '../interfaces';
import { apiFetch } from '@/src/lib/api';

/**
 * Maps backend pillar keys to frontend snowflake dimensions.
 * Backend has 7 pillars; frontend groups them into 5 dimensions.
 */
const PILLAR_TO_DIMENSION: Record<string, { dimension: SnowflakeDimension; displayName: string }> = {
  valuation: { dimension: 'value', displayName: 'Valuation' },
  retorno:   { dimension: 'future', displayName: 'Futuro' },
  margens:   { dimension: 'past', displayName: 'Desempenho' },
  divida:    { dimension: 'health', displayName: 'Saúde Financeira' },
  proventos: { dimension: 'dividend', displayName: 'Dividendos' },
};

/**
 * Transforms the backend response (radar/pillars model) into the
 * frontend AnalysisData shape (snowflake/dimensions model).
 */
function transformBackendResponse(raw: Record<string, unknown>): AnalysisData {
  const radar = (raw.radar ?? {}) as Record<string, Record<string, number | null>>;
  const currentScores = radar.current ?? {};

  const snowflake: DimensionScore[] = Object.entries(PILLAR_TO_DIMENSION).map(
    ([pillarKey, { dimension, displayName }]) => {
      const rawScore = currentScores[pillarKey] ?? 0;
      // Backend scores are 0-100; convert to 0-6 for checks display
      const score = Math.round((rawScore / 100) * 6);
      return {
        dimension,
        displayName,
        score,
        normalizedScore: rawScore,
        checks: [],
        summary: '',
      };
    },
  );

  return {
    ...(raw as unknown as AnalysisData),
    snowflake,
  };
}

/**
 * Fetch analysis data from the backend endpoint.
 * Transforms the response to match the frontend AnalysisData interface.
 */
export async function fetchAnalysisData(
  ticker: string,
  token?: string | null,
): Promise<AnalysisData> {
  const raw = await apiFetch<Record<string, unknown>>(
    `/api/company-analysis/${ticker.toUpperCase()}`,
    {},
    token,
  );
  return transformBackendResponse(raw);
}

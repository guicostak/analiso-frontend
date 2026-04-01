import type { AnalysisData } from '../interfaces';
import { apiFetch } from '@/src/lib/api';

/**
 * Fetch analysis data from the V2 backend endpoint.
 * Throws on error — callers are responsible for handling loading/error state.
 */
export async function fetchAnalysisData(
  ticker: string,
  token?: string | null,
): Promise<AnalysisData> {
  return apiFetch<AnalysisData>(
    `/api/v2/company-analysis/${ticker.toUpperCase()}`,
    {},
    token,
  );
}

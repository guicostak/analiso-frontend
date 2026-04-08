/**
 * Server-side public fetchers for the freemium /empresas/[ticker] route.
 *
 * - Não usa React, não importa client-only.
 * - Todas as chamadas são públicas (sem Authorization header).
 * - Cada fetch usa ISR via `next: { revalidate }`.
 */

import { API_BASE_URL } from "@/src/lib/api-base";

const REVALIDATE_SECONDS = 604_800; // 7 dias

export interface PublicCompanySummary {
  ticker: string;
  companyName: string;
  sectorLabel: string | null;
}

export interface PublicCompanyAnalysis {
  diagnosisHeadline?: string;
  summaryText?: string;
  summaryMeta?: { updatedAt?: string; source?: string };
  radarScores?: Record<string, number>;
  pillars?: Array<{
    name: string;
    displayName?: string;
    score?: number;
    status?: string;
    summary?: string;
  }>;
}

interface SearchItem {
  ticker: string;
  companyName: string;
  sectorLabel?: string | null;
}

interface SearchResponse {
  items: SearchItem[];
  totalItems: number;
}

async function publicFetchJson<T>(path: string): Promise<T | null> {
  try {
    const res = await fetch(`${API_BASE_URL}${path}`, {
      headers: { Accept: "application/json" },
      next: { revalidate: REVALIDATE_SECONDS },
    });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

export async function fetchPublicCompanySummary(
  ticker: string,
): Promise<PublicCompanySummary | null> {
  const data = await publicFetchJson<SearchResponse>(
    `/api/search?query=${encodeURIComponent(ticker)}&size=5`,
  );
  if (!data?.items?.length) return null;
  const upper = ticker.toUpperCase();
  const match = data.items.find((i) => i.ticker?.toUpperCase() === upper) ?? data.items[0];
  return {
    ticker: match.ticker,
    companyName: match.companyName,
    sectorLabel: match.sectorLabel ?? null,
  };
}

export async function fetchPublicCompanyAnalysis(
  ticker: string,
): Promise<PublicCompanyAnalysis | null> {
  const raw = await publicFetchJson<Record<string, unknown>>(
    `/api/company-analysis/${encodeURIComponent(ticker)}`,
  );
  if (!raw) return null;

  const summary = (raw.summary ?? raw) as Record<string, unknown>;
  const pillarsRaw = (raw.pillars ?? summary.pillars ?? []) as Array<Record<string, unknown>>;

  return {
    diagnosisHeadline: pickString(raw.diagnosisHeadline ?? summary.diagnosisHeadline ?? raw.headline),
    summaryText: pickString(raw.summaryText ?? summary.summaryText ?? raw.summary),
    summaryMeta: {
      updatedAt: pickString(
        (raw.summaryMeta as Record<string, unknown> | undefined)?.updatedAt ??
          raw.updatedAt,
      ),
      source: pickString(
        (raw.summaryMeta as Record<string, unknown> | undefined)?.source ??
          raw.source,
      ),
    },
    radarScores: (raw.radarScores ?? summary.radarScores) as
      | Record<string, number>
      | undefined,
    pillars: pillarsRaw
      .map((p) => ({
        name: pickString(p.name) ?? "",
        displayName: pickString(p.displayName),
        score: typeof p.score === "number" ? p.score : undefined,
        status: pickString(p.status),
        summary: pickString(p.summary),
      }))
      .filter((p) => p.name),
  };
}

export async function fetchRelatedCompanies(
  sector: string | null,
  excludeTicker: string,
  limit = 4,
): Promise<PublicCompanySummary[]> {
  if (!sector) return [];
  const params = new URLSearchParams({ sector, size: String(limit + 1) });
  const data = await publicFetchJson<SearchResponse>(`/api/search?${params}`);
  if (!data?.items?.length) return [];
  const upper = excludeTicker.toUpperCase();
  return data.items
    .filter((i) => i.ticker?.toUpperCase() !== upper)
    .slice(0, limit)
    .map((i) => ({
      ticker: i.ticker,
      companyName: i.companyName,
      sectorLabel: i.sectorLabel ?? null,
    }));
}

export async function fetchAllIndexableCompanies(
  pageSize = 200,
): Promise<PublicCompanySummary[]> {
  const all: PublicCompanySummary[] = [];
  let page = 0;
  while (true) {
    const params = new URLSearchParams({ page: String(page), size: String(pageSize) });
    const data = await publicFetchJson<SearchResponse>(`/api/search?${params}`);
    if (!data?.items?.length) break;
    for (const item of data.items) {
      if (!item.ticker || !item.companyName) continue;
      all.push({
        ticker: item.ticker,
        companyName: item.companyName,
        sectorLabel: item.sectorLabel ?? null,
      });
    }
    if (all.length >= data.totalItems || data.items.length < pageSize) break;
    page += 1;
    if (page > 20) break;
  }
  return all;
}

function pickString(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() ? value : undefined;
}

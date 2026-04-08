/**
 * Server-side public fetchers for the freemium /empresas/[ticker] route.
 *
 * - Não usa React, não importa client-only.
 * - Todas as chamadas são públicas (sem Authorization header).
 * - Cada fetch usa ISR via `next: { revalidate }`.
 * - Único endpoint público hoje: GET /api/search.
 */

import { API_BASE_URL } from "@/src/lib/api-base";

const REVALIDATE_SECONDS = 604_800; // 7 dias

export interface PublicCompanyMetrics {
  pl?: number;
  pvp?: number;
  evEbitda?: number;
  roe?: number;
  roic?: number;
  price?: number;
}

export interface PublicCompanySummary {
  ticker: string;
  companyName: string;
  sectorLabel: string | null;
  logoUrl: string | null;
  status: string | null;
  headline: string | null;
  supportLine: string | null;
  whyOpen: string | null;
  metrics: PublicCompanyMetrics;
}

interface SearchItem {
  ticker: string;
  companyName: string;
  cdCvm?: number;
  logoUrl?: string | null;
  headline?: string | null;
  supportLine?: string | null;
  whyOpen?: string | null;
  status?: string | null;
  sectorLabel?: string | null;
  metrics?: Record<string, number> | null;
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

function toMetrics(raw?: Record<string, number> | null): PublicCompanyMetrics {
  if (!raw) return {};
  const num = (v: unknown) => (typeof v === "number" && Number.isFinite(v) ? v : undefined);
  return {
    pl: num(raw.pl),
    pvp: num(raw.pvp),
    evEbitda: num(raw.ev_ebitda),
    roe: num(raw.roe),
    roic: num(raw.roic),
    price: num(raw.price),
  };
}

function mapItem(item: SearchItem): PublicCompanySummary {
  return {
    ticker: item.ticker,
    companyName: item.companyName,
    sectorLabel: item.sectorLabel ?? null,
    logoUrl: item.logoUrl ?? null,
    status: item.status ?? null,
    headline: item.headline ?? null,
    supportLine: item.supportLine ?? null,
    whyOpen: item.whyOpen ?? null,
    metrics: toMetrics(item.metrics),
  };
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
  return mapItem(match);
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
    .map(mapItem);
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
      all.push(mapItem(item));
    }
    if (all.length >= data.totalItems || data.items.length < pageSize) break;
    page += 1;
    if (page > 20) break;
  }
  return all;
}

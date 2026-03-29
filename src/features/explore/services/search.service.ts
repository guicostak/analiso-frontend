/**
 * Serviço de busca avançada de empresas.
 * Consome GET /api/search do backend.
 *
 * Segue architecture_skill.md: chamadas HTTP isoladas em services/.
 */

// ─── Tipos ───────────────────────────────────────────────────────────────────

export interface CompanySearchFilters {
  query?: string;
  sector?: string;
  plMin?: number;
  plMax?: number;
  pvpMin?: number;
  pvpMax?: number;
  evEbitdaMax?: number;
  dyMin?: number;
  dyMax?: number;
  roeMin?: number;
  roeMax?: number;
  roicMin?: number;
  margemMin?: number;
  dividaEbitdaMax?: number;
  page?: number;
  size?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface CompanySearchItem {
  ticker: string;
  companyName: string;
  cdCvm: number;
  metrics: Record<string, number>;
}

export interface CompanySearchResponse {
  items: CompanySearchItem[];
  page: number;
  size: number;
  totalItems: number;
  totalPages: number;
}

// ─── API Base URL ────────────────────────────────────────────────────────────

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";

// ─── Service ─────────────────────────────────────────────────────────────────

export const searchService = {
  /**
   * Busca empresas com filtros avançados.
   * Converte os filtros em query params e chama GET /api/search.
   */
  async search(filters: CompanySearchFilters): Promise<CompanySearchResponse> {
    const params = new URLSearchParams();

    for (const [key, value] of Object.entries(filters)) {
      if (value != null && value !== "") {
        params.set(key, String(value));
      }
    }

    const url = `${API_BASE}/api/search?${params.toString()}`;
    const res = await fetch(url, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err?.message ?? `HTTP ${res.status}`);
    }

    return res.json();
  },
};

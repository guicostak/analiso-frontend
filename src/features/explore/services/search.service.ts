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
  logoUrl?: string | null;
  /** Título curto da situação (do catálogo explore) */
  headline?: string | null;
  /** Diagnóstico resumido */
  supportLine?: string | null;
  /** Por que vale abrir agora */
  whyOpen?: string | null;
  /** Status do catálogo explore (Saudável, Atenção, Risco) */
  status?: string | null;
  /** Setor da empresa */
  sectorLabel?: string | null;
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

import { API_BASE_URL as API_BASE } from "@/src/lib/api-base";

// ─── Service ─────────────────────────────────────────────────────────────────

export const searchService = {
  /**
   * Busca empresas com filtros avançados.
   * Converte os filtros em query params e chama GET /api/search.
   */
  async search(filters: CompanySearchFilters): Promise<CompanySearchResponse> {
    const params = new URLSearchParams();

    // Campos numéricos que o backend aceita
    const NUMERIC_KEYS = new Set([
      "plMin", "plMax", "pvpMin", "pvpMax", "evEbitdaMax",
      "dyMin", "dyMax", "roeMin", "roeMax", "roicMin",
      "margemMin", "dividaEbitdaMax", "page", "size",
    ]);

    for (const [key, value] of Object.entries(filters)) {
      if (value == null || value === "") continue;

      // Para campos numéricos, garante que é um número válido
      if (NUMERIC_KEYS.has(key)) {
        const num = Number(value);
        if (Number.isNaN(num)) continue;
        params.set(key, String(num));
      } else {
        params.set(key, String(value));
      }
    }

    const url = `${API_BASE}/api/search?${params.toString()}`;
    const res = await fetch(url, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    if (!res.ok) {
      // Erro de validação — retorna vazio em vez de estourar
      if (res.status === 400) {
        console.warn("[search] Validation error, returning empty results");
        return { items: [], page: 0, size: 20, totalItems: 0, totalPages: 0 };
      }
      const err = await res.json().catch(() => ({}));
      throw new Error(err?.message ?? `HTTP ${res.status}`);
    }

    return res.json();
  },
};

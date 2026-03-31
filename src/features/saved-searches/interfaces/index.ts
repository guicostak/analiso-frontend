/**
 * Interfaces do módulo de pesquisas salvas.
 */

export interface SavedSearch {
  id: number;
  name: string;
  filters: string; // JSON serializado dos filtros CompanySearchFilters
  createdAt: string; // ISO-8601
}

/**
 * dashboard-layout.service
 *
 * Service responsável por persistir o layout do canvas no backend.
 * Endpoints:
 *   GET    /api/me/dashboard-layout
 *   PUT    /api/me/dashboard-layout
 *   DELETE /api/me/dashboard-layout
 *
 * O contrato é tolerante: 404 indica que ainda não existe layout salvo
 * (situação normal no primeiro acesso) e o caller deve cair no
 * `defaultLayout`.
 */

import { apiFetch, ApiError } from "@/src/lib/api";
import { defaultLayout } from "../defaults/defaultLayout";
import type { DashboardLayout } from "../interfaces/layout.types";
import { dtoToLayout, layoutToDto, type LayoutDTO } from "../mappers/layout.mapper";

const ENDPOINT = "/api/me/dashboard-layout";

export class LayoutNotFoundError extends Error {
  constructor() {
    super("layout_not_found");
    this.name = "LayoutNotFoundError";
  }
}

/**
 * Busca o layout salvo do usuário. Lança `LayoutNotFoundError` quando o
 * backend devolver 404 — caller deve fallback para `defaultLayout`.
 */
export async function getLayout(token: string | null): Promise<DashboardLayout> {
  try {
    const dto = await apiFetch<LayoutDTO>(ENDPOINT, { method: "GET" }, token);
    return dtoToLayout(dto);
  } catch (err: unknown) {
    if (err instanceof ApiError && err.status === 404) {
      throw new LayoutNotFoundError();
    }
    throw err;
  }
}

/** Persiste o layout do usuário (overwrite completo). */
export async function putLayout(
  token: string | null,
  layout: DashboardLayout,
): Promise<DashboardLayout> {
  const dto = layoutToDto(layout);
  const saved = await apiFetch<LayoutDTO>(
    ENDPOINT,
    { method: "PUT", body: JSON.stringify(dto) },
    token,
  );
  return dtoToLayout(saved);
}

/** Restaura o layout default — Fase 3 expõe via `resetLayout()`. */
export async function resetLayout(token: string | null): Promise<DashboardLayout> {
  try {
    await apiFetch<void>(ENDPOINT, { method: "DELETE" }, token);
  } catch (err: unknown) {
    // 404 é ok — significa que já não havia layout salvo.
    if (!(err instanceof ApiError) || err.status !== 404) {
      throw err;
    }
  }
  return defaultLayout;
}

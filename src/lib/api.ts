/**
 * Base API fetch utility.
 *
 * - Uses NEXT_PUBLIC_API_BASE_URL env var (defaults to localhost:8080)
 * - Attaches Authorization: Bearer <token> when a token is provided
 * - Throws ApiError for non-2xx responses with the backend error code
 */
import { API_BASE_URL } from "@/src/lib/api-base";

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export async function apiFetch<T>(
  path: string,
  options: RequestInit = {},
  token?: string | null,
): Promise<T> {
  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string> | undefined),
  };

  if (options.body && !(options.body instanceof FormData) && !headers["Content-Type"]) {
    headers["Content-Type"] = "application/json";
  }

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const url = `${API_BASE_URL}${path}`;
  let response: Response;

  try {
    response = await fetch(url, { ...options, headers });
  } catch (error) {
    const reason = error instanceof Error ? error.message : "Network error";
    throw new Error(
      `Nao foi possivel conectar ao backend em ${url}. Verifique se o frontend esta em http://localhost:3000, se o backend esta acessivel em http://localhost:8080 e se nao ha bloqueio de mixed content/CORS. Motivo original: ${reason}`,
    );
  }

  if (!response.ok) {
    let code = "unknown_error";
    try {
      const body = (await response.json()) as { code?: string };
      code = body.code ?? code;
    } catch {
      // ignore parse error — keep generic code
    }
    throw new ApiError(response.status, code, `API ${response.status}: ${code}`);
  }

  return response.json() as Promise<T>;
}

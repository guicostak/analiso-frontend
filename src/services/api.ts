/**
 * Base API fetch utility.
 *
 * - Uses VITE_API_BASE_URL env var (defaults to localhost:8080)
 * - Attaches Authorization: Bearer <token> when a token is provided
 * - Throws ApiError for non-2xx responses with the backend error code
 */

const API_BASE =
  (import.meta.env.VITE_API_BASE_URL as string | undefined) ??
  "http://localhost:8080";

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
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string> | undefined),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${path}`, { ...options, headers });

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

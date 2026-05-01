/**
 * Base API fetch utility.
 *
 * - Uses NEXT_PUBLIC_API_BASE_URL env var (defaults to localhost:8080)
 * - Reads the current access token from the session store (falls back to the
 *   legacy `token` argument so callers that still pass it keep working)
 * - On 401: tries a single /api/auth/refresh (single-flight); if that works,
 *   retries the original request with the new token. If it fails the session
 *   is cleared and the user is redirected to /login.
 * - Throws ApiError for non-2xx responses with the backend error code
 */
import { API_BASE_URL } from "@/src/lib/api-base";
import {
  getSession,
  refreshSession,
  redirectToLogin,
} from "@/src/features/auth/session-store";

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

function buildHeaders(
  options: RequestInit,
  bearerToken: string | null | undefined,
): Record<string, string> {
  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string> | undefined),
  };

  if (options.body && !(options.body instanceof FormData) && !headers["Content-Type"]) {
    headers["Content-Type"] = "application/json";
  }

  if (bearerToken) {
    headers["Authorization"] = `Bearer ${bearerToken}`;
  }

  return headers;
}

async function doFetch(url: string, options: RequestInit, bearerToken: string | null | undefined) {
  const headers = buildHeaders(options, bearerToken);
  try {
    return await fetch(url, { ...options, headers });
  } catch (error) {
    if (typeof console !== "undefined") {
      console.error("[apiFetch] network failure", { url, error });
    }
    throw new ApiError(0, "network_error", "network_error");
  }
}

export async function apiFetch<T>(
  path: string,
  options: RequestInit = {},
  token?: string | null,
): Promise<T> {
  // Prefer the caller-provided token so existing call-sites that pass the
  // current token from useAuth still work. Otherwise read the live value
  // from the store — useful for fire-and-forget calls.
  const initialToken = token ?? getSession().accessToken;
  const url = `${API_BASE_URL}${path}`;

  let response = await doFetch(url, options, initialToken);

  // 401 recovery: try to refresh once, then retry the original request.
  if (response.status === 401 && !path.startsWith("/api/auth/")) {
    const session = getSession();
    if (session.refreshToken) {
      const newAccessToken = await refreshSession();
      if (newAccessToken) {
        response = await doFetch(url, options, newAccessToken);
      } else {
        // Refresh failed — session was cleared; bounce to /login.
        redirectToLogin();
      }
    } else {
      // No refresh token — nothing to do except redirect.
      redirectToLogin();
    }
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

  // Some endpoints (DELETE, 204 No Content) legitimately return an empty body.
  const contentLength = response.headers.get("Content-Length");
  if (response.status === 204 || contentLength === "0") {
    return undefined as T;
  }
  try {
    return (await response.json()) as T;
  } catch {
    return undefined as T;
  }
}

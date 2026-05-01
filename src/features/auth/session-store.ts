/**
 * Session store — single source of truth for auth state, outside of React.
 *
 * Lives outside the React tree on purpose:
 *  - `apiFetch` (src/lib/api.ts) needs to read the current access token and
 *    trigger refresh on 401, which it can't do via hooks.
 *  - Concurrent refreshes share a single in-flight promise (single-flight)
 *    so N parallel 401 requests only fire one /api/auth/refresh call.
 *  - The React `AuthContext` subscribes to changes and re-renders.
 *
 * Storage is localStorage (same as the previous single-token design). XSS is
 * the trade-off; HTTP-only cookies would be safer but require CSRF handling
 * and cross-origin cookie setup the backend doesn't have today.
 */

import { API_BASE_URL } from "@/src/lib/api-base";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface AuthUser {
  id: number;
  email: string;
  name: string;
  picture: string;
  emailVerified: boolean;
  provider: "google" | "email";
}

export interface Session {
  user: AuthUser | null;
  accessToken: string | null;
  refreshToken: string | null;
  /** Epoch ms at which the access token expires. Null when unknown. */
  expiresAt: number | null;
}

const EMPTY_SESSION: Session = {
  user: null,
  accessToken: null,
  refreshToken: null,
  expiresAt: null,
};

// ─── Storage keys ─────────────────────────────────────────────────────────────

const LS_KEYS = {
  user:       "analiso_user",
  access:     "analiso_token",
  refresh:    "analiso_refresh_token",
  expiresAt:  "analiso_token_expires_at",
} as const;

// ─── State ────────────────────────────────────────────────────────────────────

let currentSession: Session = EMPTY_SESSION;
let refreshPromise: Promise<string | null> | null = null;
const listeners = new Set<(s: Session) => void>();

function emit() {
  for (const l of listeners) l(currentSession);
}

// ─── Public API ───────────────────────────────────────────────────────────────

export function getSession(): Session {
  return currentSession;
}

export function subscribe(listener: (s: Session) => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/** Populate the store from localStorage. Safe to call multiple times. */
export function restoreSession(): Session {
  if (typeof window === "undefined") return EMPTY_SESSION;
  try {
    const storedUser     = localStorage.getItem(LS_KEYS.user);
    const storedAccess   = localStorage.getItem(LS_KEYS.access);
    const storedRefresh  = localStorage.getItem(LS_KEYS.refresh);
    const storedExpires  = localStorage.getItem(LS_KEYS.expiresAt);

    if (storedUser) {
      currentSession = {
        user:         JSON.parse(storedUser) as AuthUser,
        accessToken:  storedAccess,
        refreshToken: storedRefresh,
        expiresAt:    storedExpires ? Number(storedExpires) : null,
      };
      emit();
    }
  } catch {
    // ignore storage errors — start unauthenticated
  }
  return currentSession;
}

/** Replaces the session — both in memory and in localStorage. Emits. */
export function setSession(next: Session): void {
  currentSession = next;
  if (typeof window === "undefined") {
    emit();
    return;
  }
  try {
    if (next.user) localStorage.setItem(LS_KEYS.user, JSON.stringify(next.user));
    else           localStorage.removeItem(LS_KEYS.user);

    if (next.accessToken) localStorage.setItem(LS_KEYS.access, next.accessToken);
    else                  localStorage.removeItem(LS_KEYS.access);

    if (next.refreshToken) localStorage.setItem(LS_KEYS.refresh, next.refreshToken);
    else                   localStorage.removeItem(LS_KEYS.refresh);

    if (next.expiresAt) localStorage.setItem(LS_KEYS.expiresAt, String(next.expiresAt));
    else                localStorage.removeItem(LS_KEYS.expiresAt);
  } catch {
    // ignore storage errors
  }
  emit();
}

export function clearSession(): void {
  setSession(EMPTY_SESSION);
}

/**
 * Refreshes the access token. Single-flight — concurrent callers share the
 * same in-flight promise. Returns the new access token, or null when refresh
 * fails (in which case the session has already been cleared).
 */
export function refreshSession(): Promise<string | null> {
  if (refreshPromise) return refreshPromise;

  const refreshToken = currentSession.refreshToken;
  if (!refreshToken) return Promise.resolve(null);

  refreshPromise = performRefresh(refreshToken).finally(() => {
    refreshPromise = null;
  });
  return refreshPromise;
}

async function performRefresh(refreshToken: string): Promise<string | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    });

    if (!response.ok) {
      // Backend said "no" — any 4xx here (invalid/expired/revoked) means the
      // session is unrecoverable. 5xx we also clear to fail-closed; the user
      // can log in again.
      clearSession();
      return null;
    }

    const data = (await response.json()) as {
      accessToken: string;
      refreshToken: string;
      expiresIn: number;
      user: { id: number; email: string; name: string; avatarUrl: string; emailVerified: boolean };
    };

    const expiresAt = Date.now() + data.expiresIn * 1000;
    const existingProvider = currentSession.user?.provider ?? "email";

    setSession({
      user: {
        id:            data.user.id,
        email:         data.user.email,
        name:          data.user.name,
        picture:       data.user.avatarUrl ?? "",
        emailVerified: data.user.emailVerified,
        provider:      existingProvider,
      },
      accessToken:  data.accessToken,
      refreshToken: data.refreshToken,
      expiresAt,
    });
    return data.accessToken;
  } catch {
    clearSession();
    return null;
  }
}

/**
 * Fire-and-forget revocation on the server. Errors are swallowed: the local
 * session is cleared regardless of what the network does.
 */
export function revokeRefreshTokenAsync(refreshToken: string | null): void {
  if (!refreshToken) return;
  try {
    void fetch(`${API_BASE_URL}/api/auth/logout`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
      keepalive: true,
    }).catch(() => { /* swallow */ });
  } catch {
    /* ignore */
  }
}

/**
 * Called by `apiFetch` when a 401 survives even after a refresh attempt.
 * Redirects to /login with a returnTo param — uses window.location rather
 * than the Next router because this is invoked from non-React code.
 */
export function redirectToLogin(): void {
  if (typeof window === "undefined") return;
  const path = `${window.location.pathname}${window.location.search}${window.location.hash}`;
  // Avoid bouncing off an already-on /login (or /logout) route.
  if (path.startsWith("/login") || path.startsWith("/logout")) return;
  const qs = new URLSearchParams({ returnTo: path }).toString();
  window.location.replace(`/login?${qs}`);
}

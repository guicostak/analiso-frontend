"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
  type ReactNode,
} from "react";

import {
  type AuthUser,
  type Session,
  clearSession,
  getSession,
  redirectToLogin,
  refreshSession,
  restoreSession,
  revokeRefreshTokenAsync,
  setSession,
  subscribe,
} from "./session-store";

export type { AuthUser };

// ─── Context shape ────────────────────────────────────────────────────────────

interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  refreshToken: string | null;
  /** Epoch ms when the access token expires. Null when unknown. */
  expiresAt: number | null;
  isAuthenticated: boolean;
  /** true while the session is being restored from localStorage */
  isLoading: boolean;
  /**
   * Establish a new session after login/register/google.
   * {@code refreshToken} and {@code expiresIn} are optional so callers that
   * don't have them yet keep compiling (the proactive refresh just won't run).
   */
  login: (
    user: AuthUser,
    accessToken?: string | null,
    refreshToken?: string | null,
    expiresIn?: number | null,
  ) => void;
  /** Clear the session. Best-effort revocation on the server. */
  logout: () => void;
  /** Manually trigger a refresh. Returns the new access token or null. */
  refresh: () => Promise<string | null>;
}

// ─── Proactive refresh tuning ─────────────────────────────────────────────────

/** How close to expiry we start renewing. 5 min gives plenty of buffer even
 *  with minor clock skew between server and client. */
const RENEW_BEFORE_MS = 5 * 60 * 1000;
/** How often the proactive timer wakes up to check. 30s avoids burning
 *  cycles while still feeling instant to the user. */
const RENEW_POLL_MS   = 30 * 1000;

// ─── Context ──────────────────────────────────────────────────────────────────

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSessionState] = useState<Session>(() => getSession());
  const [isLoading, setIsLoading]  = useState(true);

  // Hydrate from localStorage + subscribe to store updates.
  useEffect(() => {
    restoreSession();
    setSessionState(getSession());
    setIsLoading(false);
    const unsub = subscribe((next) => setSessionState(next));
    return unsub;
  }, []);

  // Proactive refresh: every RENEW_POLL_MS, if expiry is within RENEW_BEFORE_MS,
  // fire a refresh (single-flight in the store deduplicates concurrent calls).
  const inFlightRef = useRef(false);
  useEffect(() => {
    const { expiresAt, refreshToken } = session;
    if (!expiresAt || !refreshToken) return;

    const tick = async () => {
      if (inFlightRef.current) return;
      const msUntilExpiry = expiresAt - Date.now();
      if (msUntilExpiry > RENEW_BEFORE_MS) return;

      inFlightRef.current = true;
      try {
        await refreshSession();
      } finally {
        inFlightRef.current = false;
      }
    };

    // Fire immediately in case the token is already close/past expiry when
    // the provider mounts (e.g. laptop woke from sleep).
    void tick();
    const interval = setInterval(() => void tick(), RENEW_POLL_MS);
    return () => clearInterval(interval);
  }, [session.expiresAt, session.refreshToken]);

  const login = useCallback(
    (
      user: AuthUser,
      accessToken?: string | null,
      refreshToken?: string | null,
      expiresIn?: number | null,
    ) => {
      const expiresAt = expiresIn && expiresIn > 0 ? Date.now() + expiresIn * 1000 : null;
      setSession({
        user,
        accessToken:  accessToken  ?? null,
        refreshToken: refreshToken ?? null,
        expiresAt,
      });
      // Default theme on login is dark — only set if user hasn't chosen yet.
      if (typeof window !== "undefined") {
        try {
          if (!localStorage.getItem("analiso-theme")) {
            localStorage.setItem("analiso-theme", "dark");
          }
        } catch {
          // ignore storage errors
        }
      }
    },
    [],
  );

  const logout = useCallback(() => {
    const { refreshToken } = getSession();
    revokeRefreshTokenAsync(refreshToken);
    clearSession();
    redirectToLogin();
  }, []);

  const refresh = useCallback((): Promise<string | null> => {
    return refreshSession();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user:            session.user,
        token:           session.accessToken,
        refreshToken:    session.refreshToken,
        expiresAt:       session.expiresAt,
        isAuthenticated: !!session.user,
        isLoading,
        login,
        logout,
        refresh,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}

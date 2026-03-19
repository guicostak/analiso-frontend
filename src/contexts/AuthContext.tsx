"use client";

import { createContext, useContext, useState, useEffect, type ReactNode } from "react";

// -------------------------------------------------------
// Types
// -------------------------------------------------------

export interface AuthUser {
  id: number;
  email: string;
  name: string;
  picture: string;
}

interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  /** true while the session is being restored from localStorage */
  isLoading: boolean;
  login: (user: AuthUser, token?: string) => void;
  logout: () => void;
}

// -------------------------------------------------------
// Storage keys
// -------------------------------------------------------

const TOKEN_KEY = "analiso_token";
const USER_KEY  = "analiso_user";

// -------------------------------------------------------
// Context
// -------------------------------------------------------

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser]       = useState<AuthUser | null>(null);
  const [token, setToken]     = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Restore session from localStorage on mount
  useEffect(() => {
    try {
      const storedUser  = localStorage.getItem(USER_KEY);
      const storedToken = localStorage.getItem(TOKEN_KEY);
      if (storedUser) {
        setUser(JSON.parse(storedUser) as AuthUser);
        setToken(storedToken); // may be null — that's fine (dev bypass mode)
      }
    } catch {
      // ignore storage errors — start unauthenticated
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = (newUser: AuthUser, newToken?: string) => {
    setUser(newUser);
    setToken(newToken ?? null);
    try {
      localStorage.setItem(USER_KEY, JSON.stringify(newUser));
      if (newToken) {
        localStorage.setItem(TOKEN_KEY, newToken);
      } else {
        // Remove stale token if backend didn't return one
        localStorage.removeItem(TOKEN_KEY);
      }
    } catch {
      // ignore storage errors
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    try {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
    } catch {
      // ignore storage errors
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
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

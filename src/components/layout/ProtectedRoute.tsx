"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/src/features/auth/AuthContext";
import { LoadingState } from "@/src/components/feedback";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

/**
 * Redirects to /login if the user is not authenticated.
 * Shows a minimal spinner while the session is being restored from localStorage
 * to prevent a flash of the login page on hard refresh.
 */
export function ProtectedRoute({ children }: ProtectedRouteProps) {
  /* DEV-ONLY bypass: ?dev=1 — remover antes de produção */
  if (typeof window !== "undefined" && new URLSearchParams(window.location.search).get("dev") === "1")
    return <>{children}</>;

  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace("/login");
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return <LoadingState label="Carregando sua sessão…" />;
  }

  if (!isAuthenticated) {
    return <LoadingState label="Redirecionando…" />;
  }

  return <>{children}</>;
}

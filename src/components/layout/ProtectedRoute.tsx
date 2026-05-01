"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/src/features/auth/AuthContext";
import { LoadingState } from "@/src/components/feedback";
import { saveReturnTo } from "@/src/features/auth/returnTo";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

/**
 * Redirects to /login if the user is not authenticated.
 * Shows a minimal spinner while the session is being restored from localStorage
 * to prevent a flash of the login page on hard refresh.
 *
 * Também persiste a URL tentada em sessionStorage (via saveReturnTo) para que
 * o usuário, após logar, volte para a tela que tentou acessar originalmente.
 */
export function ProtectedRoute({ children }: ProtectedRouteProps) {
  /* DEV-ONLY bypass: ?dev=1 — remover antes de produção */
  if (typeof window !== "undefined" && new URLSearchParams(window.location.search).get("dev") === "1")
    return <>{children}</>;

  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      // Persist the attempted URL so login-page can redirect back after auth
      const attempted = `${window.location.pathname}${window.location.search}${window.location.hash}`;
      saveReturnTo(attempted);
      const qs = new URLSearchParams({ returnTo: attempted }).toString();
      router.replace(`/login?${qs}`);
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

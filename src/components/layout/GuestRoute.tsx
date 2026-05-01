"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/src/features/auth/AuthContext";
import { LoadingState } from "@/src/components/feedback";
import { readReturnTo, clearReturnTo } from "@/src/features/auth/returnTo";

interface GuestRouteProps {
  children: React.ReactNode;
  /** Destino quando o usuário já está autenticado. Default: /dashboard */
  redirectTo?: string;
}

/**
 * Inverso do ProtectedRoute: telas exclusivas para visitantes (deslogadas).
 * Se o usuário já estiver autenticado (sessão persistida no localStorage via
 * AuthContext), redireciona para o dashboard em vez de renderizar a tela.
 */
export function GuestRoute({ children, redirectTo = "/dashboard" }: GuestRouteProps) {
  /* DEV-ONLY bypass: ?dev=1 — remover antes de produção */
  if (typeof window !== "undefined" && new URLSearchParams(window.location.search).get("dev") === "1")
    return <>{children}</>;

  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      // Se o usuário já estava logado e tinha uma rota pendente (ex.: bateu
      // em /login?returnTo=/watchlist com sessão persistida), respeitamos ela.
      const dest = readReturnTo(searchParams) ?? redirectTo;
      clearReturnTo();
      router.replace(dest);
    }
  }, [isAuthenticated, isLoading, router, redirectTo, searchParams]);

  if (isLoading) {
    return <LoadingState label="Carregando sua sessão…" />;
  }

  if (isAuthenticated) {
    return <LoadingState label="Redirecionando…" />;
  }

  return <>{children}</>;
}

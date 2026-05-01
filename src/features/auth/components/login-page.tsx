"use client";

import { useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { GoogleButton, type GoogleAuthUser } from "./GoogleButton";
import { EmailAuthForm } from "./EmailAuthForm";
import { HeroShowcase } from "./HeroShowcase";
import { LandingNav } from "@/src/components/layout/LandingNav";
import { useAuth } from "@/src/features/auth/AuthContext";
import { readReturnTo, clearReturnTo } from "@/src/features/auth/returnTo";
import type { EmailAuthUser } from "../interfaces/auth.interfaces";

const ONBOARDING_COMPLETE_KEY = "analiso_onboarding_completed";

export function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, isAuthenticated, isLoading } = useAuth();

  const justLoggedIn = useRef(false);

  useEffect(() => {
    if (!isLoading && isAuthenticated && !justLoggedIn.current) {
      const dest = readReturnTo(searchParams) ?? "/painel";
      clearReturnTo();
      router.replace(dest);
    }
  }, [isAuthenticated, isLoading, router, searchParams]);

  // While restoring session, show nothing to avoid login form flash
  if (isLoading || (!isLoading && isAuthenticated && !justLoggedIn.current)) {
    return null;
  }

  const handleSuccess = (data: GoogleAuthUser | EmailAuthUser, provider: "google" | "email") => {
    justLoggedIn.current = true;

    if (data.isNewUser) {
      localStorage.removeItem(ONBOARDING_COMPLETE_KEY);
    }

    login(
      {
        id: data.id ?? 0,
        email: data.email,
        name: data.name,
        picture: data.picture,
        emailVerified: false,
        provider,
      },
      data.token,
      data.refreshToken ?? null,
      data.expiresIn ?? null,
    );

    // Novos usuários sempre vão para onboarding; usuários existentes voltam
    // para a tela que tentaram acessar (se houver), ou para /painel.
    const dest = data.isNewUser ? "/onboarding" : (readReturnTo(searchParams) ?? "/painel");
    clearReturnTo();
    router.replace(dest);
  };

  const handleError = () => {
    console.error("[auth] google_login_error");
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <LandingNav showAuthButton={false} />
      <main className="max-w-[1200px] mx-auto px-4 sm:px-8 lg:px-12 py-16 sm:py-24 flex items-center" style={{ minHeight: "calc(100vh - 73px)" }}>
        <div className="grid grid-cols-1 lg:grid-cols-[0.4fr_0.6fr] gap-16 lg:gap-40 w-full items-center">

          {/* ── Auth panel ──────────────────────────────────────────────────── */}
          <div className="flex flex-col gap-10 w-full max-w-sm mx-auto lg:mx-0">
            <a
              href="/"
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors w-fit group"
            >
              <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
              Voltar
            </a>

            <div className="space-y-3">
              <h1 className="text-4xl sm:text-5xl font-semibold leading-tight tracking-tight">
                <span className="block">Boas vindas ao</span>
                <span className="block text-brand brand-shimmer">
                  Analiso.
                </span>
              </h1>
              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                Acesse gratuitamente e comece a analisar o mercado.
              </p>
            </div>

            {/* Google */}
            <GoogleButton onSuccess={(data) => handleSuccess(data, "google")} onError={handleError} />

            {/* Divider */}
            <div className="flex items-center gap-4">
              <hr className="flex-1 border-border" />
              <span className="text-xs text-muted-foreground/60 whitespace-nowrap tracking-wide">ou continue com e-mail</span>
              <hr className="flex-1 border-border" />
            </div>

            {/* Email form */}
            <EmailAuthForm onSuccess={(data) => handleSuccess(data, "email")} />

            <p className="text-xs text-muted-foreground leading-relaxed">
              Ao entrar, você concorda com nossos{" "}
              <a
                href="/terms"
                className="text-brand font-medium hover:underline focus:outline-none focus:ring-2 focus:ring-brand/40 focus:ring-offset-2 focus:ring-offset-background rounded"
              >
                termos e condições
              </a>
              .
            </p>
          </div>

          {/* ── Hero showcase (hidden on mobile) ───────────────────────────── */}
          <div className="hidden lg:block">
            <HeroShowcase />
          </div>
        </div>
      </main>
    </div>
  );
}

export default LoginPage;

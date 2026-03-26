"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { GoogleButton, type GoogleAuthUser } from "./GoogleButton";
import { EmailAuthForm } from "./EmailAuthForm";
import { HeroShowcase } from "./HeroShowcase";
import { LandingNav } from "@/src/components/layout/LandingNav";
import { useAuth } from "@/src/features/auth/AuthContext";
import type { EmailAuthUser } from "../interfaces/auth.interfaces";

const ONBOARDING_COMPLETE_KEY = "analiso_onboarding_completed";

export function LoginPage() {
  const router = useRouter();
  const { login, isAuthenticated, isLoading } = useAuth();

  const justLoggedIn = useRef(false);

  useEffect(() => {
    if (!isLoading && isAuthenticated && !justLoggedIn.current) {
      router.replace("/dashboard");
    }
  }, [isAuthenticated, isLoading, router]);

  const handleSuccess = (data: GoogleAuthUser | EmailAuthUser) => {
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
      },
      data.token,
    );

    router.replace(data.isNewUser ? "/onboarding" : "/dashboard");
  };

  const handleError = () => {
    console.error("[auth] google_login_error");
  };

  return (
    <div className="min-h-screen bg-[#F7F8FB] text-[#0B1220]">
      <LandingNav showAuthButton={false} />
      <main className="max-w-[1200px] mx-auto px-4 sm:px-8 lg:px-12 py-16 sm:py-24 flex items-center" style={{ minHeight: "calc(100vh - 73px)" }}>
        <div className="grid grid-cols-1 lg:grid-cols-[0.4fr_0.6fr] gap-16 lg:gap-40 w-full items-center">

          {/* ── Auth panel ──────────────────────────────────────────────────── */}
          <div className="flex flex-col gap-10 w-full max-w-sm mx-auto lg:mx-0">
            <a
              href="/"
              className="inline-flex items-center gap-2 text-sm text-[#667085] hover:text-[#0B1220] transition-colors w-fit group"
            >
              <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
              Voltar
            </a>

            <div className="space-y-3">
              <h1 className="text-4xl sm:text-5xl font-semibold leading-tight tracking-tight">
                <span className="block">Boas vindas ao</span>
                <span className="block text-[#0E9384] brand-shimmer">
                  Analiso.
                </span>
              </h1>
              <p className="text-sm sm:text-base text-[#475467] leading-relaxed">
                Acesse gratuitamente e comece a analisar o mercado.
              </p>
            </div>

            {/* Google */}
            <GoogleButton onSuccess={handleSuccess} onError={handleError} />

            {/* Divider */}
            <div className="flex items-center gap-4">
              <hr className="flex-1 border-[#EAECF0]" />
              <span className="text-xs text-[#C0C6D0] whitespace-nowrap tracking-wide">ou continue com e-mail</span>
              <hr className="flex-1 border-[#EAECF0]" />
            </div>

            {/* Email form */}
            <EmailAuthForm onSuccess={handleSuccess} />

            <p className="text-xs text-[#98A2B3] leading-relaxed">
              Ao entrar, você concorda com nossos{" "}
              <a
                href="/terms"
                className="text-[#0E9384] font-medium hover:underline focus:outline-none focus:ring-2 focus:ring-[#0E9384]/40 focus:ring-offset-2 focus:ring-offset-[#F7F8FB] rounded"
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

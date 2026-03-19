"use client";

import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { GoogleButton, type GoogleAuthUser } from "./GoogleButton";
import { HeroShowcase } from "./HeroShowcase";
import { useAuth } from "../../contexts/AuthContext";

const ONBOARDING_COMPLETE_KEY = "analiso_onboarding_completed";

export function LoginPage() {
  const navigate = useNavigate();
  const { login, isAuthenticated, isLoading } = useAuth();

  // Prevents the "already authenticated" effect from overriding the post-login
  // navigation when the user just clicked the Google button on this same render.
  const justLoggedIn = useRef(false);

  // Already authenticated on page load — bounce to dashboard
  useEffect(() => {
    if (!isLoading && isAuthenticated && !justLoggedIn.current) {
      navigate("/dashboard", { replace: true });
    }
  }, [isAuthenticated, isLoading, navigate]);

  const handleLoginSuccess = (data: GoogleAuthUser) => {
    justLoggedIn.current = true;

    console.log("[login-page] handleLoginSuccess — isNewUser:", data.isNewUser);

    // New user: wipe any leftover onboarding completion flag so the
    // onboarding page doesn't skip straight to dashboard.
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

    const destination = data.isNewUser ? "/onboarding" : "/dashboard";
    console.log("[login-page] navegando para:", destination);
    navigate(destination, { replace: true });
  };

  const handleLoginError = () => {
    console.error("[auth] google_login_error");
  };

  return (
    <div className="min-h-screen bg-[#F7F8FB] text-[#0B1220]">
      <main className="max-w-[1200px] mx-auto px-8 lg:px-12 py-12 min-h-screen flex items-center">
        <div className="grid grid-cols-1 lg:grid-cols-[0.4fr_0.6fr] gap-12 lg:gap-40 w-full items-center">
          <div className="flex flex-col gap-6">
            <div>
              <h1 className="text-4xl md:text-5xl font-semibold leading-tight">
                <span className="block">Boas vindas ao</span>
                <span className="block text-[#0E9384] relative inline-flex items-center brand-shimmer">
                  Analiso.
                </span>
              </h1>
              <p className="mt-4 text-base md:text-lg text-[#475467] max-w-md">
                Teste gratuitamente entrando com sua conta Google para começar a usar a plataforma.
              </p>
            </div>

            <GoogleButton
              onSuccess={handleLoginSuccess}
              onError={handleLoginError}
            />

            <p className="text-xs text-[#667085] max-w-md">
              Criando uma conta, você concorda com todos os nossos{" "}
              <a
                href="/terms"
                className="text-[#0E9384] font-medium hover:underline focus:outline-none focus:ring-2 focus:ring-[#0E9384]/40 focus:ring-offset-2 focus:ring-offset-[#F7F8FB] rounded"
              >
                termos e condições
              </a>
              .
            </p>
          </div>

          <HeroShowcase />
        </div>
      </main>
    </div>
  );
}

export default LoginPage;

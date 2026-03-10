"use client";

import { GoogleButton } from "./GoogleButton";
import { HeroShowcase } from "./HeroShowcase";

export function LoginPage() {
  const handleGoogleLogin = () => {
    // Placeholder de autenticação
    console.log("[auth] login_google_click");
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

            <GoogleButton onClick={handleGoogleLogin} />

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

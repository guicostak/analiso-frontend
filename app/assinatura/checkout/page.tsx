"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { ProtectedRoute } from "@/src/components/layout";
import { EmbeddedCheckout } from "@/src/features/assinatura/components/EmbeddedCheckout";
import { Sidebar } from "@/src/components/layout/Sidebar";
import { MainContent } from "@/src/components/layout/MainContent";
import { LoadingState } from "@/src/components/feedback";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

function CheckoutContent() {
  const searchParams = useSearchParams();
  const plan = searchParams.get("plan") ?? "premium";
  const billingCycle = searchParams.get("cycle") ?? "mensal";
  const returnUrl = typeof window !== "undefined"
    ? `${window.location.origin}/assinatura/checkout/return`
    : "/assinatura/checkout/return";

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Sidebar />
      <MainContent>
        <section className="px-8 pb-10 pt-[102px]">
          <div className="mx-auto max-w-[720px]">
            <Link
              href="/perfil?tab=assinatura"
              className="mb-6 inline-flex items-center gap-2 text-[13px] font-medium text-muted-foreground transition hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" />
              Voltar para planos
            </Link>

            <h2 className="text-[22px] font-semibold tracking-[-0.03em] text-foreground">
              Finalizar assinatura
            </h2>
            <p className="mt-1.5 text-[13px] text-muted-foreground">
              Plano {plan.charAt(0).toUpperCase() + plan.slice(1)} — {billingCycle === "anual" ? "Anual" : "Mensal"}
            </p>

            <div className="mt-8 overflow-hidden rounded-[20px] border border-border bg-card shadow-[0_12px_28px_rgba(15,23,40,0.04)]">
              <EmbeddedCheckout plan={plan} billingCycle={billingCycle} returnUrl={returnUrl} />
            </div>
          </div>
        </section>
      </MainContent>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <ProtectedRoute>
      <Suspense fallback={<LoadingState label="Carregando checkout…" />}>
        <CheckoutContent />
      </Suspense>
    </ProtectedRoute>
  );
}

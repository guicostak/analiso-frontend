"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { ProtectedRoute } from "@/src/components/layout";
import { Sidebar } from "@/src/components/layout/Sidebar";
import { MainContent } from "@/src/components/layout/MainContent";
import { getSessionStatus } from "@/src/features/assinatura/services";
import { Check, Loader2, XCircle } from "lucide-react";
import Link from "next/link";

function ReturnContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!sessionId) {
      setLoading(false);
      return;
    }
    getSessionStatus(sessionId)
      .then((res) => setStatus(res.status))
      .catch(() => setStatus("error"))
      .finally(() => setLoading(false));
  }, [sessionId]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Sidebar />
      <MainContent>
        <section className="px-8 pb-10 pt-[102px]">
          <div className="mx-auto max-w-[520px] text-center">
            {loading ? (
              <div className="flex flex-col items-center gap-4 py-20">
                <Loader2 className="h-10 w-10 animate-spin text-brand" />
                <p className="text-[14px] text-muted-foreground">Verificando pagamento...</p>
              </div>
            ) : status === "complete" ? (
              <div className="flex flex-col items-center gap-4 py-16">
                <div className="grid h-16 w-16 place-items-center rounded-full bg-brand text-white shadow-[0_12px_28px_rgba(18,165,148,0.25)]">
                  <Check className="h-8 w-8" />
                </div>
                <h2 className="text-[22px] font-semibold text-foreground">Assinatura confirmada!</h2>
                <p className="text-[14px] text-muted-foreground">
                  Seu plano já está ativo. Aproveite todos os recursos.
                </p>
                <Link
                  href="/perfil?tab=assinatura"
                  className="mt-4 inline-flex h-10 items-center rounded-[14px] bg-brand px-6 text-[13px] font-semibold text-white shadow-[0_10px_20px_rgba(18,165,148,0.18)] transition hover:bg-brand/90"
                >
                  Ver minha assinatura
                </Link>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-4 py-16">
                <div className="grid h-16 w-16 place-items-center rounded-full bg-red-50 text-red-600 dark:bg-red-950/30 dark:text-red-400">
                  <XCircle className="h-8 w-8" />
                </div>
                <h2 className="text-[22px] font-semibold text-foreground">Algo deu errado</h2>
                <p className="text-[14px] text-muted-foreground">
                  O pagamento não foi concluído. Tente novamente.
                </p>
                <Link
                  href="/perfil?tab=assinatura"
                  className="mt-4 inline-flex h-10 items-center rounded-[14px] border border-border bg-card px-6 text-[13px] font-semibold text-foreground shadow-[0_8px_16px_rgba(15,23,40,0.04)] transition hover:bg-muted"
                >
                  Voltar para planos
                </Link>
              </div>
            )}
          </div>
        </section>
      </MainContent>
    </div>
  );
}

export default function CheckoutReturnPage() {
  return (
    <ProtectedRoute>
      <Suspense fallback={<div className="grid min-h-screen place-items-center text-muted-foreground">Verificando...</div>}>
        <ReturnContent />
      </Suspense>
    </ProtectedRoute>
  );
}

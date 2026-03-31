"use client";

/**
 * SubscriptionTab
 *
 * Aba Assinatura dentro do perfil.
 * Busca a assinatura atual do usuário e os planos disponíveis via API.
 */

import { useState, useEffect, useCallback } from "react";
import { fetchPlans, fetchSubscription, subscribePlan, cancelSubscription } from "@/src/features/assinatura/services";
import type { SubscriptionData } from "@/src/features/assinatura/services";
import type { SubscriptionPlan, BillingCycle } from "@/src/features/assinatura/interfaces";
import { SubscriptionPlanCard } from "@/src/features/assinatura/components/SubscriptionPlanCard";
import { AccountShell } from "./AccountShell";
import { useAuth } from "@/src/features/auth";
import { Check, CreditCard, Calendar, RefreshCw } from "lucide-react";

function formatPrice(cents: number): string {
  const reais = Math.floor(cents / 100);
  return `R$ ${reais}`;
}

export function SubscriptionTab() {
  const { token } = useAuth();
  const [cycle, setCycle] = useState<BillingCycle>("Anual");
  const [subscription, setSubscription] = useState<SubscriptionData | null>(null);
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loadingAction, setLoadingAction] = useState<string | null>(null);
  const [fetchError, setFetchError] = useState(false);

  // Busca os planos disponíveis (público, sem auth)
  useEffect(() => {
    fetchPlans().then(setPlans).catch(() => setFetchError(true));
  }, []);

  // Busca a assinatura atual
  const loadSubscription = useCallback(async () => {
    if (!token) return;
    try {
      const data = await fetchSubscription(token);
      setSubscription(data);
    } catch {
      setFetchError(true);
    }
  }, [token]);

  useEffect(() => {
    void loadSubscription();
  }, [loadSubscription]);

  const handleSubscribe = async (planId: string) => {
    if (!token) return;
    setLoadingAction(planId);
    try {
      const data = await subscribePlan(token, planId, cycle.toLowerCase());
      setSubscription(data);
    } catch {
      // silently ignore — could add toast here
    } finally {
      setLoadingAction(null);
    }
  };

  const handleCancel = async () => {
    if (!token) return;
    setLoadingAction("cancel");
    try {
      const data = await cancelSubscription(token);
      setSubscription(data);
    } catch {
      // silently ignore
    } finally {
      setLoadingAction(null);
    }
  };

  const activePlanId =
    subscription?.status === "active" ? subscription.plan : null;

  const activePlan = activePlanId
    ? plans.find((p) => p.id === activePlanId)
    : null;

  return (
    <AccountShell activeTab="assinatura">
      <section className="py-8">
        {/* Header + toggle */}
        <div className="flex flex-wrap items-start justify-between gap-6">
          <div className="max-w-[560px]">
            <h2 className="text-[18px] font-semibold leading-[1.22] tracking-[-0.03em] text-foreground">
              Flexibilidade e recursos sob medida para cada investidor
            </h2>
            <p className="mt-1.5 text-[12px] text-muted-foreground">
              {activePlan
                ? `Você está no plano ${activePlan.name}.`
                : "Escolha o plano ideal para o seu perfil de investimento."}
            </p>
          </div>

          <div className="inline-flex items-center rounded-[16px] border border-border bg-muted p-1 shadow-[0_8px_18px_rgba(15,23,40,0.03)]">
            <button
              onClick={() => setCycle("Mensal")}
              className={`rounded-[12px] px-4 py-2 text-[12px] font-medium transition ${
                cycle === "Mensal"
                  ? "bg-card font-semibold text-foreground shadow-[0_4px_10px_rgba(15,23,40,0.05)]"
                  : "text-muted-foreground"
              }`}
            >
              Mensal
            </button>
            <button
              onClick={() => setCycle("Anual")}
              className={`rounded-[12px] px-4 py-2 text-[12px] font-medium transition ${
                cycle === "Anual"
                  ? "bg-card font-semibold text-foreground shadow-[0_4px_10px_rgba(15,23,40,0.05)]"
                  : "text-muted-foreground"
              }`}
            >
              Anual
            </button>
            {cycle === "Anual" && (
              <span className="ml-1.5 rounded-[10px] bg-brand-surface px-2.5 py-1.5 text-[11px] font-semibold text-brand">
                20%OFF
              </span>
            )}
          </div>
        </div>

        {fetchError && (
          <p className="mt-4 text-[12px] text-muted-foreground">
            Não foi possível carregar sua assinatura atual.
          </p>
        )}

        {/* Active subscription banner */}
        {activePlan && subscription?.status === "active" && (() => {
          const pricingEntry = activePlan.pricing.find(p => p.billingCycle === subscription.billingCycle);
          const price = pricingEntry?.price ?? 0;
          const period = subscription.billingCycle === "anual" ? "/ano" : "/mês";
          const renewDate = subscription.renewsAt
            ? new Date(subscription.renewsAt).toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" })
            : null;
          const startDate = new Date(subscription.startedAt).toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" });

          return (
            <div className="mt-7 rounded-[18px] border border-brand/30 bg-brand-surface/40 p-5 shadow-[0_12px_28px_rgba(18,165,148,0.08)]">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="grid h-10 w-10 shrink-0 place-items-center rounded-[12px] bg-brand text-white shadow-[0_8px_18px_rgba(18,165,148,0.22)]">
                    <Check className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-[15px] font-semibold text-foreground">
                        Plano {activePlan.name}
                      </h3>
                      <span className="rounded-full bg-brand/15 px-2 py-0.5 text-[10px] font-semibold text-brand">
                        Ativo
                      </span>
                    </div>
                    <p className="mt-0.5 text-[12px] text-muted-foreground">
                      {formatPrice(price)} {period}
                    </p>
                  </div>
                </div>

                <button
                  onClick={handleCancel}
                  disabled={loadingAction === "cancel"}
                  className="rounded-[10px] border border-red-200 bg-red-50 px-3.5 py-2 text-[11px] font-semibold text-red-600 transition hover:bg-red-100 disabled:opacity-60 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-400 dark:hover:bg-red-950/50"
                >
                  {loadingAction === "cancel" ? "Cancelando…" : "Cancelar assinatura"}
                </button>
              </div>

              <div className="mt-4 flex flex-wrap gap-5 border-t border-brand/15 pt-4">
                <div className="flex items-center gap-2 text-[12px] text-muted-foreground">
                  <CreditCard className="h-3.5 w-3.5 text-brand" />
                  <span>Ciclo: <span className="font-medium text-foreground">{subscription.billingCycle === "anual" ? "Anual" : "Mensal"}</span></span>
                </div>
                <div className="flex items-center gap-2 text-[12px] text-muted-foreground">
                  <Calendar className="h-3.5 w-3.5 text-brand" />
                  <span>Início: <span className="font-medium text-foreground">{startDate}</span></span>
                </div>
                {renewDate && (
                  <div className="flex items-center gap-2 text-[12px] text-muted-foreground">
                    <RefreshCw className="h-3.5 w-3.5 text-brand" />
                    <span>Renovação: <span className="font-medium text-foreground">{renewDate}</span></span>
                  </div>
                )}
              </div>
            </div>
          );
        })()}

        {/* Plan cards */}
        <div className="mt-7 grid gap-4 xl:grid-cols-3 xl:gap-3">
          {plans.map((plan) => (
            <SubscriptionPlanCard
              key={plan.id}
              plan={plan}
              cycle={cycle}
              currentPlanId={activePlanId}
              onSubscribe={handleSubscribe}
              onCancel={handleCancel}
              loading={
                loadingAction === plan.id ||
                (loadingAction === "cancel" && activePlanId === plan.id)
              }
            />
          ))}
        </div>
      </section>
    </AccountShell>
  );
}

"use client";

/**
 * SubscriptionTab
 *
 * Aba Assinatura dentro do perfil.
 * Consome o contexto global de assinatura via useSubscription.
 */

import { useState, useCallback } from "react";
import { cancelSubscription, updateAutoRenew } from "@/src/features/assinatura/services";
import type { BillingCycle } from "@/src/features/assinatura/interfaces";
import { SubscriptionPlanCard } from "@/src/features/assinatura/components/SubscriptionPlanCard";
import { AccountShell } from "./AccountShell";
import { useAuth } from "@/src/features/auth";
import { useSubscription } from "@/src/features/assinatura/hooks";
import { Check, CreditCard, Calendar, RefreshCw, Loader2 } from "lucide-react";

function formatPrice(cents: number): string {
  const reais = Math.floor(cents / 100);
  return `R$ ${reais}`;
}

export function SubscriptionTab() {
  const { token } = useAuth();
  const { plans, subscription, isActive, activePlan, error: fetchError, refresh } = useSubscription();
  const [cycle, setCycle] = useState<BillingCycle>("Anual");
  const [loadingAction, setLoadingAction] = useState<string | null>(null);

  // Sync cycle toggle when subscription loads
  const resolvedCycle: BillingCycle =
    isActive && subscription?.billingCycle
      ? subscription.billingCycle === "anual" ? "Anual" : "Mensal"
      : cycle;

  const handleSubscribe = (planId: string) => {
    const billingCycle = cycle === "Anual" ? "anual" : "mensal";
    window.location.href = `/assinatura/checkout?plan=${planId}&cycle=${billingCycle}`;
  };

  const handleCancel = useCallback(async () => {
    if (!token) return;
    setLoadingAction("cancel");
    try {
      await cancelSubscription(token);
      await refresh();
    } catch {
      // silently ignore
    } finally {
      setLoadingAction(null);
    }
  }, [token, refresh]);

  const handleToggleAutoRenew = useCallback(async () => {
    if (!token || !subscription) return;
    setLoadingAction("auto-renew");
    try {
      await updateAutoRenew(token, !subscription.autoRenew);
      await refresh();
    } catch {
      // silently ignore
    } finally {
      setLoadingAction(null);
    }
  }, [token, subscription, refresh]);

  const activePlanId = isActive ? subscription!.plan : null;
  const activeBillingCycle = isActive ? subscription!.billingCycle : null;

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
                resolvedCycle === "Mensal"
                  ? "bg-card font-semibold text-foreground shadow-[0_4px_10px_rgba(15,23,40,0.05)]"
                  : "text-muted-foreground"
              }`}
            >
              Mensal
            </button>
            <button
              onClick={() => setCycle("Anual")}
              className={`rounded-[12px] px-4 py-2 text-[12px] font-medium transition ${
                resolvedCycle === "Anual"
                  ? "bg-card font-semibold text-foreground shadow-[0_4px_10px_rgba(15,23,40,0.05)]"
                  : "text-muted-foreground"
              }`}
            >
              Anual
            </button>
            {resolvedCycle === "Anual" && (
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
          const displayPrice = subscription.billingCycle === "anual" ? Math.round(price / 12) : price;
          const renewDate = subscription.renewsAt
            ? new Date(subscription.renewsAt).toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" })
            : null;
          const startDate = new Date(subscription.startedAt!).toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" });

          return (
            <div className="mt-7 rounded-[20px] border border-brand/25 bg-brand-surface/30 p-6 shadow-[0_12px_28px_rgba(18,165,148,0.06)]">
              {/* Header */}
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <div className="grid h-11 w-11 shrink-0 place-items-center rounded-[13px] bg-brand text-white shadow-[0_8px_18px_rgba(18,165,148,0.22)]">
                    <Check className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-brand">
                      Meu Plano
                    </p>
                    <div className="mt-0.5 flex items-center gap-2">
                      <h3 className="text-[16px] font-semibold text-foreground">{activePlan.name}</h3>
                      <span className="rounded-full bg-brand/15 px-2.5 py-0.5 text-[10px] font-semibold text-brand">Ativo</span>
                    </div>
                    <p className="mt-0.5 text-[13px] text-muted-foreground">
                      {formatPrice(displayPrice)} /mês
                      {subscription.billingCycle === "anual" && (
                        <span className="ml-1 text-muted-foreground/60">
                          (total anual: {formatPrice(price)})
                        </span>
                      )}
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleCancel}
                  disabled={loadingAction === "cancel"}
                  className="rounded-[11px] border border-red-200 bg-red-50 px-4 py-2 text-[11px] font-semibold text-red-600 transition hover:bg-red-100 disabled:opacity-60 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-400 dark:hover:bg-red-950/50"
                >
                  {loadingAction === "cancel" ? "Cancelando…" : "Cancelar assinatura"}
                </button>
              </div>

              {/* Separador */}
              <div className="my-5 h-px bg-brand/15" />

              {/* Grid 2x2 de detalhes */}
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-[14px] border border-border/60 bg-card p-4">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <CreditCard className="h-3.5 w-3.5 text-brand" />
                    <span className="text-[11px] font-medium">Ciclo</span>
                  </div>
                  <p className="mt-1.5 text-[14px] font-semibold text-foreground">
                    {subscription.billingCycle === "anual" ? "Anual" : "Mensal"}
                  </p>
                </div>

                <div className="rounded-[14px] border border-border/60 bg-card p-4">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="h-3.5 w-3.5 text-brand" />
                    <span className="text-[11px] font-medium">Começou a assinar em</span>
                  </div>
                  <p className="mt-1.5 text-[14px] font-semibold text-foreground">{startDate}</p>
                </div>

                <div className="rounded-[14px] border border-border/60 bg-card p-4">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <RefreshCw className="h-3.5 w-3.5 text-brand" />
                    <span className="text-[11px] font-medium">Renova em</span>
                  </div>
                  <p className="mt-1.5 text-[14px] font-semibold text-foreground">{renewDate ?? "—"}</p>
                </div>

                <div className="rounded-[14px] border border-border/60 bg-card p-4">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <RefreshCw className="h-3.5 w-3.5 text-brand" />
                    <span className="text-[11px] font-medium">Renovação automática</span>
                  </div>
                  <div className="mt-2.5">
                    <button
                      onClick={handleToggleAutoRenew}
                      disabled={loadingAction === "auto-renew"}
                      className={`relative flex h-6 w-10 items-center rounded-full p-1 transition ${
                        subscription.autoRenew ? "bg-brand" : "bg-muted-foreground/30"
                      }`}
                    >
                      {loadingAction === "auto-renew" ? (
                        <Loader2 className="mx-auto h-3.5 w-3.5 animate-spin text-white" />
                      ) : (
                        <div
                          className={`h-4 w-4 rounded-full bg-white shadow-[0_2px_6px_rgba(0,0,0,0.12)] transition-transform ${
                            subscription.autoRenew ? "translate-x-4" : "translate-x-0"
                          }`}
                        />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })()}

        {/* Plan cards */}
        <div className="mt-7 flex flex-col gap-4 lg:flex-row lg:gap-3">
          {plans.map((plan) => (
            <SubscriptionPlanCard
              key={plan.id}
              plan={plan}
              cycle={resolvedCycle}
              currentPlanId={activePlanId}
              currentBillingCycle={activeBillingCycle}
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

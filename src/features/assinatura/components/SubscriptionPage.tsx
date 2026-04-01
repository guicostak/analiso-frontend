"use client";

import { useState, useCallback } from "react";
import { Bell, Search } from "lucide-react";
import { Sidebar } from "@/src/components/layout/Sidebar";
import { MainContent } from "@/src/components/layout/MainContent";
import { UserNavMenu } from "@/src/components/layout/UserNavMenu";
import { cancelSubscription } from "../services";
import type { BillingCycle } from "../interfaces";
import { SubscriptionPlanCard } from "./SubscriptionPlanCard";
import { useAuth } from "@/src/features/auth";
import { useSubscription } from "../hooks";

export function SubscriptionPage() {
  const { token } = useAuth();
  const { plans, subscription, isActive, refresh } = useSubscription();
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
      // ignore
    } finally {
      setLoadingAction(null);
    }
  }, [token, refresh]);

  const activePlanId = isActive ? subscription!.plan : "free";
  const activeBillingCycle = isActive ? subscription!.billingCycle : null;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Sidebar />

      <header className="fixed left-0 right-0 top-0 z-20 border-b border-border bg-card/92 backdrop-blur xl:left-[240px]">
        <div className="flex h-[64px] items-center justify-between px-8">
          <div className="flex items-center gap-4">
            <h1 className="text-[17px] font-semibold text-foreground">Assinatura</h1>
          </div>

          <div className="flex items-center gap-3">
            <button className="grid h-10 w-10 place-items-center rounded-[14px] border border-border bg-card text-foreground shadow-[0_6px_14px_rgba(15,23,40,0.04)]">
              <Search className="h-4.5 w-4.5" />
            </button>
            <button className="relative grid h-10 w-10 place-items-center rounded-[14px] border border-border bg-card text-foreground shadow-[0_6px_14px_rgba(15,23,40,0.04)]">
              <Bell className="h-4.5 w-4.5" />
              <span className="absolute right-3 top-3 h-2 w-2 rounded-full bg-brand" />
            </button>
            <UserNavMenu />
          </div>
        </div>
      </header>

      <MainContent>
        <section className="px-8 pb-10 pt-[102px]">
          <div className="mx-auto max-w-[1260px]">
            <div className="flex flex-wrap items-start justify-between gap-6">
              <div className="max-w-[560px]">
                <h2 className="text-[22px] font-semibold leading-[1.22] tracking-[-0.03em] text-foreground">
                  Flexibilidade e recursos sob medida para cada investidor
                </h2>
              </div>

              <div className="inline-flex items-center rounded-[18px] border border-border bg-muted p-1.5 shadow-[0_10px_22px_rgba(15,23,40,0.03)]">
                <button
                  onClick={() => setCycle("Mensal")}
                  className={`rounded-[14px] px-5 py-2.5 text-[13px] font-medium transition ${
                    (resolvedCycle === "Mensal")
                      ? "bg-card font-semibold text-foreground shadow-[0_6px_14px_rgba(15,23,40,0.05)]"
                      : "text-muted-foreground"
                  }`}
                >
                  Mensal
                </button>
                <button
                  onClick={() => setCycle("Anual")}
                  className={`rounded-[14px] px-5 py-2.5 text-[13px] font-medium transition ${
                    (resolvedCycle === "Anual")
                      ? "bg-card font-semibold text-foreground shadow-[0_6px_14px_rgba(15,23,40,0.05)]"
                      : "text-muted-foreground"
                  }`}
                >
                  Anual
                </button>
                {resolvedCycle === "Anual" && (
                  <span className="ml-2 rounded-[12px] bg-brand-surface px-3 py-2 text-[13px] font-semibold text-brand">
                    20%OFF
                  </span>
                )}
              </div>
            </div>

            <div className="mt-8 flex flex-col gap-5 lg:flex-row lg:gap-4">
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
          </div>
        </section>
      </MainContent>
    </div>
  );
}

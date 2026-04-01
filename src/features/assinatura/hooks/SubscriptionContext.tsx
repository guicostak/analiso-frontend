"use client";

import { createContext, useContext, useMemo, type ReactNode } from "react";
import { useSubscriptionData, type UseSubscriptionDataReturn } from "./useSubscriptionData";
import type { SubscriptionPlan } from "../interfaces";

// -------------------------------------------------------
// Derived helpers
// -------------------------------------------------------

export type PlanSlug = "free" | "essencial" | "premium" | "ilimitado";

export interface SubscriptionContextType extends UseSubscriptionDataReturn {
  /** Slug do plano ativo ("free" se nenhum ativo) */
  planSlug: PlanSlug;
  /** true quando há assinatura com status "active" */
  isActive: boolean;
  /** Objeto SubscriptionPlan correspondente ao plano ativo (null se free) */
  activePlan: SubscriptionPlan | null;
}

// -------------------------------------------------------
// Context
// -------------------------------------------------------

const SubscriptionContext = createContext<SubscriptionContextType | null>(null);

export function SubscriptionProvider({ children }: { children: ReactNode }) {
  const data = useSubscriptionData();

  const isActive = data.subscription?.status === "active";

  // Confia no plan retornado pelo backend; fallback "free" só se ainda não carregou
  const planSlug: PlanSlug = (data.subscription?.plan as PlanSlug) ?? "free";

  const activePlan =
    planSlug !== "free"
      ? data.plans.find((p) => p.id === data.subscription!.plan) ?? null
      : null;

  const value = useMemo<SubscriptionContextType>(
    () => ({ ...data, planSlug, isActive, activePlan }),
    [data, planSlug, isActive, activePlan],
  );

  return (
    <SubscriptionContext.Provider value={value}>
      {children}
    </SubscriptionContext.Provider>
  );
}

export function useSubscription(): SubscriptionContextType {
  const ctx = useContext(SubscriptionContext);
  if (!ctx) {
    throw new Error("useSubscription must be used inside <SubscriptionProvider>");
  }
  return ctx;
}

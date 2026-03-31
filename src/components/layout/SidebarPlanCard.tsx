"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useAuth } from "@/src/features/auth";
import { fetchSubscription } from "@/src/features/assinatura/services/subscription.service";
import { fetchPlans } from "@/src/features/assinatura/services";
import type { SubscriptionData } from "@/src/features/assinatura/services/subscription.service";
import type { SubscriptionPlan } from "@/src/features/assinatura/interfaces";

interface SidebarPlanCardProps {
  href?: string;
}

export function SidebarPlanCard({ href = "/perfil?tab=assinatura" }: SidebarPlanCardProps) {
  const { token } = useAuth();
  const [sub, setSub] = useState<SubscriptionData | null>(null);
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);

  useEffect(() => {
    fetchPlans().then(setPlans).catch(() => {});
  }, []);

  useEffect(() => {
    if (!token) return;
    fetchSubscription(token).then(setSub).catch(() => {});
  }, [token]);

  const isActive = sub?.status === "active";
  const activePlan = isActive ? plans.find(p => p.id === sub.plan) : null;
  const planName = activePlan?.name ?? null;
  const renewLabel = sub?.renewsAt
    ? new Date(sub.renewsAt).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" })
    : null;

  return (
    <Link href={href} className="mt-auto block">
      <div className="rounded-[16px] border border-border bg-card p-3.5 shadow-[0_8px_20px_rgba(15,23,40,0.05)] transition-[box-shadow] duration-200 ease-[var(--ease-out)] hover:shadow-[0_12px_28px_rgba(15,23,40,0.08)]">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[12px] font-semibold text-foreground">Plano</p>
            <p className="mt-0.5 text-[11px] text-muted-foreground">
              {isActive && renewLabel ? `Renovação em ${renewLabel}` : "Sem assinatura ativa"}
            </p>
          </div>
          <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold ${
            isActive
              ? "bg-brand-surface text-brand-text"
              : "bg-muted text-muted-foreground"
          }`}>
            {isActive && planName ? planName : "Free"}
          </span>
        </div>

        <span className="mt-3 inline-flex h-8 w-full items-center justify-center rounded-[10px] bg-muted text-[11px] font-semibold text-foreground transition-[background-color] duration-150 ease-[var(--ease-out)] hover:bg-hover">
          {isActive ? "Gerenciar plano" : "Assinar plano"}
        </span>
      </div>
    </Link>
  );
}

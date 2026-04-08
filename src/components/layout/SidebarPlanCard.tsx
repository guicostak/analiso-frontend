"use client";

import Link from "next/link";
import { useSubscription } from "@/src/features/assinatura/hooks";

interface SidebarPlanCardProps {
  href?: string;
}

export function SidebarPlanCard({ href = "/perfil?tab=assinatura" }: SidebarPlanCardProps) {
  const { isActive, activePlan, subscription } = useSubscription();

  const planName = activePlan?.name ?? null;
  const renewLabel = subscription?.renewsAt
    ? new Date(subscription.renewsAt).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" })
    : null;

  return (
    <Link href={href} className="mt-auto block">
      <div className="rounded-[16px] border border-border bg-card p-3.5 shadow-[0_8px_20px_rgba(15,23,40,0.05)] transition-[box-shadow] duration-200 ease-[var(--ease-out)] hover:shadow-[0_12px_28px_rgba(15,23,40,0.08)]">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[14px] font-semibold text-foreground">Plano</p>
            <p className="mt-0.5 text-[13px] text-muted-foreground">
              {isActive && renewLabel ? `Renovação em ${renewLabel}` : "Sem assinatura ativa"}
            </p>
          </div>
          <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[12px] font-semibold ${
            isActive
              ? "bg-brand-surface text-brand-text"
              : "bg-muted text-muted-foreground"
          }`}>
            {isActive && planName ? planName : "Free"}
          </span>
        </div>

        <span className="mt-3 inline-flex h-9 w-full items-center justify-center rounded-[10px] bg-muted text-[13px] font-semibold text-foreground transition-[background-color] duration-150 ease-[var(--ease-out)] hover:bg-hover">
          {isActive ? "Gerenciar plano" : "Assinar plano"}
        </span>
      </div>
    </Link>
  );
}

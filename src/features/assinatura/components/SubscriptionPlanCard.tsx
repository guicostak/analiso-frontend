"use client";

import { Check, Loader2, Sparkles, X } from "lucide-react";
import type { BillingCycle, SubscriptionPlan } from "../interfaces";

interface SubscriptionPlanCardProps {
  plan: SubscriptionPlan;
  cycle: BillingCycle;
  /** ID do plano atualmente ativo do usuário (ex: "premium") */
  currentPlanId?: string | null;
  /** Ciclo de cobrança da assinatura ativa do usuário ("mensal" | "anual") */
  currentBillingCycle?: string | null;
  onSubscribe?: (planId: string) => void;
  onCancel?: () => void;
  loading?: boolean;
}

function formatPrice(cents: number): string {
  const reais = Math.floor(cents / 100);
  return `R$ ${reais}`;
}

export function SubscriptionPlanCard({
  plan,
  cycle,
  currentPlanId,
  currentBillingCycle,
  onSubscribe,
  onCancel,
  loading = false,
}: SubscriptionPlanCardProps) {
  const cycleKey = cycle === "Anual" ? "anual" : "mensal";

  // "Seu Plano" aparece quando é o plano ativo E o ciclo selecionado bate com o ciclo da assinatura
  const isCurrentPlanOnCycle =
    currentPlanId === plan.id && currentBillingCycle === cycleKey;

  // Identifica o plano ativo independente do ciclo selecionado
  const isCurrentPlan = currentPlanId === plan.id;

  const isFree = plan.id === "free";
  const pricingEntry = plan.pricing.find(p => p.billingCycle === cycleKey);
  const price = pricingEntry?.price ?? 0;

  // Para anual: mostra o valor mensal equivalente (preço/12) como destaque
  const displayPrice = cycle === "Anual" ? Math.round(price / 12) : price;
  const period = cycle === "Anual" ? "/ por mês" : "/ por mês";

  return (
    <article
      className={`relative flex h-full flex-col rounded-[22px] border bg-card p-5 shadow-[0_12px_28px_rgba(15,23,40,0.04)] ${
        isCurrentPlanOnCycle
          ? "border-brand shadow-[0_18px_38px_rgba(18,165,148,0.14)]"
          : plan.highlighted
            ? "border-brand/40 shadow-[0_18px_38px_rgba(18,165,148,0.08)]"
            : "border-border"
      } min-h-[620px]`}
    >
      {/* Badge superior */}
      {isCurrentPlanOnCycle ? (
        <div className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-brand px-3.5 py-1.5 text-[10px] font-semibold text-white shadow-[0_10px_24px_rgba(18,165,148,0.26)]">
            Seu Plano
            <Check className="h-3 w-3" />
          </span>
        </div>
      ) : plan.badge ? (
        <div className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-foreground px-3.5 py-1.5 text-[10px] font-semibold text-background shadow-[0_10px_24px_rgba(15,23,40,0.18)]">
            {plan.badge}
            <Check className="h-3 w-3" />
          </span>
        </div>
      ) : null}

      {/* Preço */}
      <div>
        <p className="text-[13px] font-medium text-muted-foreground">{plan.name}</p>
        {isFree ? (
          <div className="mt-1 flex items-end gap-1.5">
            <p className="text-[26px] font-semibold tracking-[-0.04em] text-foreground">Grátis</p>
          </div>
        ) : (
          <>
            {cycle === "Anual" && (
              <p className="mt-2.5 text-[12px] font-medium text-muted-foreground">
                Total anual: {formatPrice(price)}
              </p>
            )}
            <div className="mt-1 flex items-end gap-1.5">
              <p className="text-[26px] font-semibold tracking-[-0.04em] text-foreground">{formatPrice(displayPrice)}</p>
              <p className="pb-0.5 text-[13px] font-medium text-muted-foreground">{period}</p>
            </div>
          </>
        )}
      </div>

      {/* Workers IA */}
      <div className="mt-5 flex items-center justify-between">
        <div className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-foreground">
          <span className="grid h-6 w-6 place-items-center rounded-[8px] bg-[linear-gradient(135deg,#58D7FF_0%,#FF5FD2_52%,#FFC54D_100%)] text-white shadow-[0_8px_14px_rgba(255,95,210,0.16)]">
            <Sparkles className="h-3 w-3" />
          </span>
          Workers
          <span className="rounded-[6px] bg-[#1B1B1B] px-1.5 py-0.5 text-[8px] font-bold text-white">IA</span>
        </div>

        <div className="flex items-center gap-2.5 text-muted-foreground/40">
          <div className="flex h-6 w-10 items-center rounded-full bg-muted p-1">
            <div className="h-4 w-4 rounded-full bg-card shadow-[0_2px_6px_rgba(0,0,0,0.08)]" />
          </div>
        </div>
      </div>

      {/* Botão principal */}
      {isFree && isCurrentPlan ? (
        <button
          disabled
          className="mt-6 h-10 rounded-[13px] border border-brand bg-brand-surface text-[13px] font-semibold text-brand"
        >
          Plano atual
        </button>
      ) : isFree ? (
        <button
          disabled
          className="mt-6 h-10 rounded-[13px] border border-border bg-muted text-[13px] font-semibold text-muted-foreground"
        >
          Plano gratuito
        </button>
      ) : isCurrentPlanOnCycle ? (
        <button
          onClick={onCancel}
          disabled={loading}
          className="mt-6 h-10 rounded-[13px] border border-red-200 bg-red-50 text-[13px] font-semibold text-red-600 transition hover:bg-red-100 disabled:opacity-60 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-400 dark:hover:bg-red-950/50"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              Cancelando…
            </span>
          ) : (
            "Cancelar assinatura"
          )}
        </button>
      ) : (
        <button
          onClick={() => onSubscribe?.(plan.id)}
          disabled={loading}
          className={`mt-6 h-10 rounded-[13px] border text-[13px] font-semibold transition disabled:opacity-60 ${
            plan.highlighted
              ? "border-brand bg-brand text-white shadow-[0_14px_26px_rgba(18,165,148,0.22)]"
              : "border-border bg-card text-foreground shadow-[0_8px_16px_rgba(15,23,40,0.04)]"
          }`}
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              Aguarde…
            </span>
          ) : (
            "Assinar"
          )}
        </button>
      )}

      <p className="mt-4 text-center text-[11px] text-muted-foreground">
        {isFree ? "Sem compromisso" : "Cancele quando quiser"}
      </p>

      <div className="my-5 h-px bg-border" />

      {/* Features */}
      <div className="space-y-3">
        <div className="space-y-3">
          {plan.features.map((feature) => (
            <div key={feature.label} className="flex items-start gap-2">
              <span className="mt-0.5 shrink-0">
                {feature.included ? (
                  <Check className="h-4 w-4 text-brand" />
                ) : (
                  <X className="h-4 w-4 text-muted-foreground/50" />
                )}
              </span>
              <span className="text-[12px] leading-5 text-foreground">{feature.label}</span>
            </div>
          ))}
        </div>
      </div>
    </article>
  );
}

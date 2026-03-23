import { Check, HelpCircle, Sparkles, X } from "lucide-react";
import type { SubscriptionPlan } from "../interfaces";

interface SubscriptionPlanCardProps {
  plan: SubscriptionPlan;
}

export function SubscriptionPlanCard({ plan }: SubscriptionPlanCardProps) {
  return (
    <article
      className={`relative flex h-full flex-col rounded-[28px] border bg-white p-6 shadow-[0_16px_34px_rgba(15,23,40,0.04)] ${
        plan.highlighted ? "border-[#12A594] shadow-[0_24px_50px_rgba(18,165,148,0.12)]" : "border-[#E7EEF5]"
      } min-h-[760px]`}
    >
      {plan.badge ? (
        <div className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2">
          <span className="inline-flex items-center gap-2 rounded-full bg-[#12A594] px-4 py-2 text-[11px] font-semibold text-white shadow-[0_14px_30px_rgba(18,165,148,0.24)]">
            {plan.badge}
            <Check className="h-3.5 w-3.5" />
          </span>
        </div>
      ) : null}

      <div>
        <p className="text-[15px] font-medium text-[#7A7A7A]">{plan.name}</p>
        {plan.monthlyInstallments ? (
          <p className="mt-3 text-[17px] font-semibold text-[#171717]">{plan.monthlyInstallments}</p>
        ) : null}
        <div className="mt-1 flex items-end gap-2">
          <p className="text-[30px] font-semibold tracking-[-0.04em] text-[#0F1728]">{plan.price}</p>
          <p className="pb-1 text-[15px] font-medium text-[#7A7A7A]">{plan.period}</p>
        </div>
      </div>

      <div className="mt-6 flex items-center justify-between">
        <div className="inline-flex items-center gap-2 text-[16px] font-semibold text-[#3A3A3A]">
          <span className="grid h-7 w-7 place-items-center rounded-[10px] bg-[linear-gradient(135deg,#58D7FF_0%,#FF5FD2_52%,#FFC54D_100%)] text-white shadow-[0_10px_18px_rgba(255,95,210,0.16)]">
            <Sparkles className="h-3.5 w-3.5" />
          </span>
          Workers
          <span className="rounded-[7px] bg-[#1B1B1B] px-1.5 py-0.5 text-[9px] font-bold text-white">IA</span>
        </div>

        <div className="flex items-center gap-3 text-[#D2D5DB]">
          <div className="flex h-7 w-11 items-center rounded-full bg-[#F1F1F1] p-1">
            <div className="h-5 w-5 rounded-full bg-white shadow-[0_2px_6px_rgba(0,0,0,0.08)]" />
          </div>
          <HelpCircle className="h-4 w-4" />
        </div>
      </div>

      <button
        className={`mt-7 h-12 rounded-[16px] border text-[15px] font-semibold transition ${
          plan.highlighted
            ? "border-[#12A594] bg-[#12A594] text-white shadow-[0_18px_32px_rgba(18,165,148,0.24)]"
            : "border-[#E5E7EB] bg-white text-[#171717] shadow-[0_10px_20px_rgba(15,23,40,0.04)]"
        }`}
      >
        Assinar
      </button>

      <p className="mt-5 text-center text-[12px] text-[#7A7A7A]">Cancele quando quiser</p>

      <div className="my-6 h-px bg-[#ECEFF3]" />

      <div className="space-y-4">
        {plan.featuresTitle ? <p className="text-[15px] font-semibold text-[#171717]">{plan.featuresTitle}</p> : null}
        <div className="space-y-3.5">
          {plan.features.map((feature) => (
            <div key={feature.label} className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <span className="mt-0.5">
                  {feature.included ? (
                    <Check className="h-4.5 w-4.5 text-[#12A594]" />
                  ) : (
                    <X className="h-4.5 w-4.5 text-[#BDBDBD]" />
                  )}
                </span>
                <span className="text-[14px] leading-6 text-[#171717]">{feature.label}</span>
              </div>
              <HelpCircle className="mt-1 h-4 w-4 shrink-0 text-[#D2D5DB]" />
            </div>
          ))}
        </div>
      </div>
    </article>
  );
}

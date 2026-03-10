"use client";

import { Link } from "react-router-dom";
import { useMemo, useState } from "react";
import { Check } from "lucide-react";
import type { BillingCycle, PricingPlan } from "../../data/landing";

interface PricingToggleClientProps {
  pricingPlans: PricingPlan[];
}

const brlFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
  maximumFractionDigits: 0,
});

export function PricingToggleClient({ pricingPlans }: PricingToggleClientProps) {
  const [billingCycle, setBillingCycle] = useState<BillingCycle>("mensal");

  const cards = useMemo(
    () =>
      pricingPlans.map((plan) => ({
        ...plan,
        displayPrice: brlFormatter.format(billingCycle === "mensal" ? plan.monthlyPrice : plan.annualPrice),
      })),
    [billingCycle, pricingPlans],
  );

  return (
    <section id="planos" className="mx-auto w-full max-w-[1454px] px-5 pb-14 pt-6 md:min-h-[948px] md:px-10 md:pb-20">
      <div className="text-center">
        <p className="text-center" style={{ color: "#0E9384", fontSize: "12px", fontWeight: 500, lineHeight: "20px" }}>
          Planos
        </p>
        <h2 className="mx-auto mt-3 max-w-[760px] text-3xl font-bold leading-[1.12] tracking-[-0.01em] text-[#0F0F14] md:text-5xl">
          Flexibilidade e recursos sob medida para cada investidor
        </h2>
        <div className="mt-6 flex items-center justify-center gap-3">
          <span className={`text-[14px] ${billingCycle === "mensal" ? "font-medium text-[#111827]" : "text-[#6B7280]"}`}>Mensal</span>

          <button
            type="button"
            onClick={() => setBillingCycle((prev) => (prev === "mensal" ? "anual" : "mensal"))}
            className={`relative h-10 w-[70px] cursor-pointer rounded-full p-1 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0E9384] focus-visible:ring-offset-2 ${billingCycle === "mensal" ? "bg-[#E5E5E5]" : "bg-[#0E9384]"}`}
            aria-label="Alternar ciclo de cobranca"
            aria-pressed={billingCycle === "anual"}
          >
            <span
              className={`block h-8 w-8 rounded-full bg-white shadow transition-transform ${
                billingCycle === "anual" ? "translate-x-[30px]" : "translate-x-0"
              }`}
            />
          </button>

          <span className={`text-[14px] ${billingCycle === "anual" ? "font-medium text-[#111827]" : "text-[#6B7280]"}`}>Anual</span>
          <span className="rounded-full bg-[#ECFDF5] px-3 py-1 text-xs font-semibold text-[#0B7F74]">Economize ate 20%</span>
        </div>
      </div>

      <div className="mt-8 flex flex-wrap justify-center gap-4">
        {cards.map((plan) => {
          const isPremium = plan.key === "premium";
          
          return (
            <article
              key={`plan-${plan.key}`}
              className={`flex h-full flex-[1_1_400px] flex-col justify-between overflow-x-hidden rounded-[12px] p-[50px] outline outline-1 outline-[rgba(0,0,0,0.07)] transition-all duration-300 ease-in-out ${
                isPremium
                  ? "scale-[1.02] bg-[#F0FDFA] shadow-[0_8px_48px_rgba(75,112,255,0.1)]"
                  : "bg-white"
              } `}
              style={{ maxWidth: "442px", minHeight: "720px" }}
            >
              <div className="flex items-start justify-between gap-2">
                <h3 className="text-[16px] font-medium text-[#101727]" style={{ fontSize: "16px", lineHeight: "20.4px" }}>
                  {plan.name}
                </h3>
                {isPremium ? (
                  <span className="rounded-full bg-[#D1FAE5] px-3 py-1 text-xs font-semibold text-[#0B7F74]">Mais escolhido</span>
                ) : null}
              </div>

              <div className="mt-4">
                <div
                  className="leading-[46.2px]"
                  style={{
                    fontSize: "42px",
                    fontWeight: 700,
                    color: isPremium ? "#0E9384" : "#101727",
                  }}
                >
                  {plan.displayPrice}
                  <span
                    className="leading-[19px]"
                    style={{
                      fontSize: "19px",
                      fontWeight: 500,
                      color: isPremium ? "#0E9384" : "#0B0B0C",
                    }}
                  >
                    {" "}/ por mes
                  </span>
                </div>
                {billingCycle === "anual" ? (<div className="mt-2" style={{ fontSize: "12px", color: "#9D9D9D", lineHeight: "16px" }}>{`${brlFormatter.format(plan.annualPrice * 12)} cobrado anualmente`}</div>) : null}
              </div>

              <p className="mt-4 font-medium tracking-[-0.64px] text-[#4B5563]" style={{ fontSize: "16px", lineHeight: "22px" }}>{plan.idealFor}</p>

              <p className="mt-6 text-[14px] font-medium leading-[19.6px] tracking-[-0.64px] text-[#0B0B0C]">O que esta incluido:</p>
              <ul className="plan-includes mt-3 space-y-2">
                {plan.bullets.map((item) => (
                  <li
                    key={`${plan.key}-${item}`}
                    className="flex items-center gap-2"
                    style={{
                      fontSize: "14px",
                      fontWeight: 500,
                      color: "#696969",
                      letterSpacing: "-0.64px",
                      lineHeight: "20.8px",
                    }}
                  >
                    <span className="inline-flex h-[18.36px] w-[18.36px] shrink-0 items-center justify-center rounded-full bg-[#0E9384]">
                      <Check className="h-[11px] w-[11px] text-white" strokeWidth={3} />
                    </span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-auto pt-6">
                <Link
                  to={plan.ctaHref}
                  className={`inline-flex w-full items-center justify-center rounded-full px-5 py-3 text-[18px] font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0E9384] focus-visible:ring-offset-2 ${
                    isPremium
                      ? "bg-[#0E9384] text-white hover:bg-[#0B7F74]"
                      : "bg-[#F3F4F6] text-[#111827] hover:bg-[#E5E7EB]"
                  }`}
                >
                  {plan.cta}
                </Link>
                <p className="mt-2 text-[12px] text-[#6B7280]">{plan.finePrint}</p>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}















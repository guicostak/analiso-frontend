"use client";

import { Bell, Search } from "lucide-react";
import { Sidebar } from "@/src/components/layout/Sidebar";
import { MainContent } from "@/src/components/layout/MainContent";
import { UserNavMenu } from "@/src/components/layout/UserNavMenu";
import { subscriptionPlans } from "../services";
import { SubscriptionPlanCard } from "./SubscriptionPlanCard";

export function SubscriptionPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Sidebar />

      <header className="fixed left-0 right-0 top-0 z-20 border-b border-border bg-card/92 backdrop-blur xl:left-[240px]">
        <div className="flex h-[64px] items-center justify-between px-8">
          <div className="flex items-center gap-4">
            <h1 className="text-[17px] font-semibold text-foreground">Assinatura</h1>
            <span className="rounded-full bg-muted px-3 py-1 text-[12px] font-semibold text-foreground">
              14 dias restantes
            </span>
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
                <button className="rounded-[14px] px-5 py-2.5 text-[13px] font-medium text-muted-foreground">Mensal</button>
                <button className="rounded-[14px] bg-card px-5 py-2.5 text-[13px] font-semibold text-foreground shadow-[0_6px_14px_rgba(15,23,40,0.05)]">Anual</button>
                <span className="ml-2 rounded-[12px] bg-brand-surface px-3 py-2 text-[13px] font-semibold text-brand">20%OFF</span>
              </div>
            </div>

            <div className="mt-8 grid gap-5 xl:grid-cols-3 xl:gap-4">
              {subscriptionPlans.map((plan) => (
                <SubscriptionPlanCard key={plan.id} plan={plan} />
              ))}
            </div>
          </div>
        </section>
      </MainContent>
    </div>
  );
}

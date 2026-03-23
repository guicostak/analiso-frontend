"use client";

import Link from "next/link";
import { Lock, Mail, Settings2, User } from "lucide-react";
import { Sidebar } from "@/src/components/layout/Sidebar";
import { UserNavMenu } from "@/src/components/layout/UserNavMenu";

type AccountTabKey = "conta" | "preferencias" | "seguranca";

const accountTabs = [
  { key: "conta" as const, label: "Minha conta", href: "/perfil", icon: User },
  { key: "preferencias" as const, label: "Preferências", href: "/perfil/preferencias", icon: Settings2 },
  { key: "seguranca" as const, label: "Segurança", href: "/perfil/seguranca", icon: Lock },
];

export function AccountShell({
  activeTab,
  children,
}: {
  activeTab: AccountTabKey;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#FCFCFD] text-[#171717]">
      <Sidebar currentPage="" contextLabel="Minha conta" />

      <header className="fixed left-0 right-0 top-0 z-20 border-b border-[#EEF2F6] bg-[rgba(255,255,255,0.94)] backdrop-blur xl:left-[240px]">
        <div className="flex h-[64px] items-center justify-between px-6">
          <h1 className="text-[17px] font-semibold text-[#171717]">Minha conta</h1>

          <div className="flex items-center gap-3">
            <button className="grid h-9 w-9 place-items-center rounded-[14px] border border-[#ECEFF3] bg-white text-[#D56AF1] shadow-[0_6px_14px_rgba(15,23,40,0.04)]">
              <Settings2 className="h-4 w-4" />
            </button>
            <button className="grid h-9 w-9 place-items-center rounded-[14px] border border-[#ECEFF3] bg-white text-[#171717] shadow-[0_6px_14px_rgba(15,23,40,0.04)]">
              <User className="h-4 w-4" />
            </button>
            <button className="relative grid h-9 w-9 place-items-center rounded-[14px] border border-[#ECEFF3] bg-white text-[#171717] shadow-[0_6px_14px_rgba(15,23,40,0.04)]">
              <Mail className="h-4 w-4" />
              <span className="absolute right-3 top-3 h-2 w-2 rounded-full bg-[#12A594]" />
            </button>
            <UserNavMenu />
          </div>
        </div>
      </header>

      <main className="px-7 pb-10 pt-[82px] xl:ml-[240px]">
        <div className="mx-auto max-w-[1460px]">
          <div className="border-b border-[#EEF2F6]">
            <div className="flex flex-wrap gap-8">
              {accountTabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = tab.key === activeTab;
                return (
                  <Link
                    key={tab.key}
                    href={tab.href}
                    className={`relative inline-flex items-center gap-2 py-4 text-[15px] ${
                      isActive ? "font-semibold text-[#171717]" : "font-medium text-[#7A7A7A]"
                    }`}
                  >
                    <Icon className="h-[18px] w-[18px]" />
                    {tab.label}
                    {isActive ? (
                      <span className="absolute bottom-0 left-0 right-0 h-[3px] rounded-full bg-[#12A594]" />
                    ) : null}
                  </Link>
                );
              })}
            </div>
          </div>

          <div className="bg-white">{children}</div>
        </div>
      </main>
    </div>
  );
}

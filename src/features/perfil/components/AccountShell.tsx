"use client";

import { Sidebar } from "@/src/components/layout/Sidebar";
import { AppTopBar } from "@/src/components/layout/AppTopBar";
import { MainContent } from "@/src/components/layout/MainContent";

export type AccountTabKey = "conta" | "preferencias" | "seguranca" | "pagamento" | "assinatura";

export function AccountShell({
  children,
}: {
  activeTab?: AccountTabKey;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Sidebar currentPage="" />
      <AppTopBar />

      <MainContent className="px-7 pb-10 pt-[82px]">
        <div className="mx-auto max-w-[1460px]">
          {children}
        </div>
      </MainContent>
    </div>
  );
}

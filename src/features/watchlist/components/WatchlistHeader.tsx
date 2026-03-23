"use client";

import { GitCompare, Plus } from "lucide-react";

interface WatchlistHeaderProps {
  activeTab: "updates" | "list";
  title?: string;
  subtitle?: string;
}

export function WatchlistHeader({ activeTab, title, subtitle }: WatchlistHeaderProps) {
  return (
    <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
      <div className="space-y-3">
        <p className="text-[12px] font-medium uppercase tracking-[0.08em] text-[#98A2B3]">Minha watchlist</p>
        <div className="max-w-[780px] space-y-3">
          <h1 className="text-[40px] font-semibold leading-[44px] tracking-[-0.04em] text-[#0F1728]">
            {title ?? "Monitorados"}
          </h1>
          <p className="text-[15px] leading-7 text-[#667085]">
            {subtitle ??
              (activeTab === "updates"
                ? "Triagem primeiro, organização depois. Foque no que mudou."
                : "Organize sua watchlist e acompanhe o estado atual de cada empresa.")}
          </p>
        </div>
      </div>

      <div className="flex shrink-0 flex-wrap items-center gap-3">
        <button className="inline-flex h-12 items-center gap-2 rounded-[18px] border border-[#E7EEF5] bg-white px-5 text-[14px] font-semibold text-[#0F1728] shadow-[0_10px_24px_rgba(15,23,40,0.04)] transition hover:bg-[#F8FBFD]">
          <Plus className="h-4 w-4" />
          Adicionar empresa
        </button>
        <button className="inline-flex h-12 items-center gap-2 rounded-[18px] border border-[#E7EEF5] bg-white px-5 text-[14px] font-medium text-[#667085] shadow-[0_10px_24px_rgba(15,23,40,0.04)] transition hover:bg-[#F8FBFD] hover:text-[#0F1728]">
          <GitCompare className="h-4 w-4" />
          Comparar
        </button>
      </div>
    </div>
  );
}

"use client";

interface WatchlistHeaderProps {
  activeTab: "updates" | "list";
  title?: string;
  subtitle?: string;
}

export function WatchlistHeader({ activeTab, title, subtitle }: WatchlistHeaderProps) {
  return (
    <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
      <div className="space-y-3">
        <p className="text-[12px] font-medium uppercase text-muted-foreground">Minhas favoritas</p>
        <div className="max-w-[780px] space-y-3">
          <h1 className="text-[30px] font-semibold leading-[34px] tracking-[-0.04em] text-foreground">
            {title ?? "Ações favoritas"}
          </h1>
          <p className="text-[15px] leading-7 text-muted-foreground">
            {subtitle ??
              (activeTab === "updates"
                ? "Triagem primeiro, organização depois. Foque no que mudou."
                : "Organize sua watchlist e acompanhe o estado atual de cada empresa.")}
          </p>
        </div>
      </div>

    </div>
  );
}

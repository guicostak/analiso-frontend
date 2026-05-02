"use client";

/**
 * ExDividendosIsland (6×3)
 *
 * Calendário de ex-dividendos próximos. Mostra ações que passam a negociar
 * sem direito ao próximo provento — quedas nessas ações no dia ex costumam
 * ser ajuste técnico, não ruptura.
 *
 * Layout lista compacta com sections "Hoje" (destaque borda brand) e
 * "Próximos 30 dias" (lista padrão). Click no item abre /analysis/{ticker}.
 */

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { CalendarDays } from "lucide-react";

import { cn } from "@/src/components/ui/utils";
import { getExplore } from "@/src/features/explore/services";
import type { ExploreResponse, ExDividendItemDto } from "@/src/features/explore/services";
import type { ExDividendItem } from "@/src/features/explore/interfaces/market.interfaces";

import type { IslandProps } from "../../interfaces/island.types";
import { IslandShell } from "../shared/IslandShell";

function mapExDividendItem(d: ExDividendItemDto): ExDividendItem {
  return {
    ticker:        d.ticker,
    companyName:   d.companyName ?? null,
    sector:        d.sector ?? null,
    exDate:        d.exDate,
    daysUntilEx:   d.daysUntilEx,
    dpsTtm:        typeof d.dpsTtm === "number" ? d.dpsTtm : null,
    dividendYield: typeof d.dividendYield === "number" ? d.dividendYield : null,
    logoUrl:       d.logoUrl ?? null,
  };
}

function fmtDate(iso: string): string {
  try {
    const d = new Date(`${iso}T12:00:00-03:00`);
    return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
  } catch {
    return iso;
  }
}
function fmtDps(dps: number | null): string | null {
  if (dps == null) return null;
  return dps.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
    maximumFractionDigits: 4,
  });
}
function fmtYield(dy: number | null): string | null {
  if (dy == null) return null;
  return `${dy.toFixed(1).replace(".", ",")}%`;
}
function daysLabel(days: number): string {
  if (days === 0) return "Hoje";
  if (days === 1) return "Amanhã";
  return `em ${days}d`;
}

function ExDivRow({ item, highlight = false }: { item: ExDividendItem; highlight?: boolean }) {
  const dps = fmtDps(item.dpsTtm);
  const dy = fmtYield(item.dividendYield);
  return (
    <Link
      href={`/analysis/${item.ticker}`}
      className={cn(
        "flex items-center gap-2 rounded-[10px] border bg-muted/20 px-2 py-1.5 transition-colors hover:bg-muted/40",
        highlight ? "border-brand/40" : "border-border",
      )}
    >
      {item.logoUrl ? (
        <Image
          src={item.logoUrl}
          alt=""
          width={24}
          height={24}
          className="h-6 w-6 shrink-0 rounded-full border border-border bg-card object-contain"
          unoptimized
        />
      ) : (
        <div className="h-6 w-6 shrink-0 rounded-full border border-border bg-muted" />
      )}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1">
          <span className="truncate text-[12px] font-semibold text-foreground">
            {item.ticker}
          </span>
          <span className="truncate text-[10px] text-muted-foreground">
            {fmtDate(item.exDate)}
          </span>
          <span className="truncate text-[10px] text-muted-foreground">·</span>
          <span className="truncate text-[10px] font-medium text-foreground">
            {daysLabel(item.daysUntilEx)}
          </span>
        </div>
        {(dps || dy) && (
          <p className="truncate text-[10px] text-muted-foreground">
            {dps && <span className="text-foreground">{dps}</span>}
            {dps && dy && " · "}
            {dy && `DY ${dy}`}
          </p>
        )}
      </div>
    </Link>
  );
}

export function ExDividendosIsland(_props: IslandProps) {
  const [explore, setExplore] = useState<ExploreResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getExplore()
      .then((d) => { if (!cancelled) setExplore(d); })
      .catch(() => { /* silencia */ })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  const bundle = explore?.marketExtras?.exDividends;
  const today = (bundle?.today ?? []).map(mapExDividendItem);
  // Cap em 6 pra não estourar a altura da ilha 6×3.
  const upcoming = (bundle?.upcoming ?? []).slice(0, 6).map(mapExDividendItem);
  const isEmpty = !loading && today.length === 0 && upcoming.length === 0;

  return (
    <IslandShell
      icon={<CalendarDays className="h-4 w-4 text-muted-foreground" />}
      title="Ex-dividendos"
      info="Empresas que passam a negociar sem direito ao próximo provento. Na data ex o preço cai aproximadamente pelo valor do dividendo — é ajuste técnico, não ruptura. Útil pra contextualizar quedas suspeitas em ações dividendeiras."
    >
      {loading ? (
        <div className="flex flex-1 flex-col gap-2">
          {[0, 1, 2, 3, 4].map((i) => (
            <div key={i} className="h-[40px] animate-pulse rounded-[10px] bg-muted" />
          ))}
        </div>
      ) : isEmpty ? (
        <div className="flex flex-1 items-center justify-center text-center text-[12px] text-muted-foreground">
          Sem ex-dividendos próximos.
        </div>
      ) : (
        <div className="flex flex-1 flex-col gap-2 overflow-y-auto pr-1">
          {today.length > 0 && (
            <>
              <p className="text-[9.5px] font-semibold uppercase tracking-wider text-brand">
                Hoje
              </p>
              <div className="flex flex-col gap-1.5">
                {today.map((item) => (
                  <ExDivRow key={item.ticker} item={item} highlight />
                ))}
              </div>
            </>
          )}
          {upcoming.length > 0 && (
            <>
              <p className={cn(
                "text-[9.5px] font-semibold uppercase tracking-wider text-muted-foreground",
                today.length > 0 && "mt-2",
              )}>
                Próximos
              </p>
              <div className="flex flex-col gap-1.5">
                {upcoming.map((item) => (
                  <ExDivRow key={`${item.ticker}-${item.exDate}`} item={item} />
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </IslandShell>
  );
}

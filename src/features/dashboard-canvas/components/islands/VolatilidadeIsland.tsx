"use client";

/**
 * VolatilidadeIsland (4×2)
 *
 * Versão compacta do bloco "Leitura de volatilidade" da tela /mercado.
 * Mostra:
 *   - Valor numérico grande (score 0-100)
 *   - Badge colorido com label (Baixa/Moderada/Alta)
 *   - Subtitle curto explicando o estado atual
 *
 * Design comprimido pra caber em 4×2 (1/3 da row, 176px de altura útil):
 * sem o card "Ver detalhes" gigante do /mercado — quem quer detalhe
 * clica no link "Ver tudo" do header da ilha.
 *
 * **Por que importa:** volatilidade é o sinal-chave pra ajustar postura.
 * Alta volatilidade = movimentos bruscos podem reverter; tese de hoje
 * pode virar contrária amanhã. Baixa = movimentos mais "limpos" pra ler.
 *
 * Reaproveita `mapVolatilityMini` do `mapRiskPanel` — mesma fonte de
 * dados que /mercado usa pro mini-card de volatilidade no Risk Panel.
 */

import { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronRight, Activity } from "lucide-react";

import { cn } from "@/src/components/ui/utils";
import { getExplore } from "@/src/features/explore/services";
import type { ExploreResponse } from "@/src/features/explore/services";
import { mapRiskPanel } from "@/src/features/explore/mappers/market.mappers";

import type { IslandProps } from "../../interfaces/island.types";
import { IslandShell } from "../shared/IslandShell";

/** Tema do badge baseado no statusKey vindo do backend. */
function badgeTheme(statusKey: string | null): { bg: string; border: string; text: string } {
  const k = (statusKey ?? "").toLowerCase();
  if (k.includes("alta") || k === "high") {
    return {
      bg: "bg-warning-surface",
      border: "border-warning-border",
      text: "text-warning-text",
    };
  }
  if (k.includes("baixa") || k === "low") {
    return {
      bg: "bg-success-surface",
      border: "border-success-border",
      text: "text-success-text",
    };
  }
  // Moderada / default
  return {
    bg: "bg-muted",
    border: "border-border",
    text: "text-muted-foreground",
  };
}

/**
 * Cor do número grande conforme severidade — alta volatilidade pinta
 * em warning pra dar peso visual ao "alerta" que o número representa.
 */
function valueColor(statusKey: string | null): string {
  const k = (statusKey ?? "").toLowerCase();
  if (k.includes("alta") || k === "high") return "text-warning-text";
  return "text-foreground";
}

export function VolatilidadeIsland(_props: IslandProps) {
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

  const riskPanel = mapRiskPanel(explore?.marketExtras?.riskPanel ?? null);
  const volatility = riskPanel?.volatility ?? null;
  const score = volatility?.score;
  const label = volatility?.statusLabel ?? "—";
  const meta = volatility?.metaLine ?? null;
  const indexLabel = volatility?.indexLabel ?? null;

  const theme = badgeTheme(volatility?.statusKey ?? null);
  const valueClass = valueColor(volatility?.statusKey ?? null);

  return (
    <IslandShell
      icon={<Activity className="h-4 w-4 text-muted-foreground" />}
      title="Volatilidade"
      right={
        <Link
          href="/mercado"
          className="inline-flex items-center gap-1 text-[11px] font-semibold text-brand hover:underline"
        >
          Detalhes
          <ChevronRight className="h-3 w-3" />
        </Link>
      }
      info="Score 0-100 de quanto os preços oscilam em relação à mediana dos últimos 12 meses. Alta volatilidade pede leitura mais cautelosa — uma alta de hoje pode virar queda amanhã, e vice-versa. Baseado em dados B3, atualizado D+1."
    >
      {loading ? (
        <div className="flex flex-1 flex-col gap-2.5">
          <div className="h-6 w-24 animate-pulse rounded-full bg-muted" />
          <div className="h-12 w-20 animate-pulse rounded bg-muted" />
          <div className="h-3 w-3/4 animate-pulse rounded bg-muted" />
        </div>
      ) : score == null ? (
        <div className="flex flex-1 items-center justify-center text-center text-[12px] text-muted-foreground">
          Volatilidade indisponível.
        </div>
      ) : (
        <div className="flex flex-1 flex-col justify-between gap-2">
          {/* Top: badge label */}
          <div>
            <span
              className={cn(
                "inline-flex rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
                theme.bg,
                theme.border,
                theme.text,
              )}
            >
              Volatilidade {label.toLowerCase()}
            </span>
          </div>

          {/* Middle: número grande */}
          <p
            className={cn(
              "text-[36px] font-semibold leading-none tracking-[-0.025em] tabular-nums",
              valueClass,
            )}
          >
            {score}
          </p>

          {/* Bottom: meta line — "Fonte: B3 · Atualizado em DD/MM" */}
          {(meta || indexLabel) && (
            <p className="truncate text-[10px] leading-snug text-muted-foreground">
              {meta ?? indexLabel}
            </p>
          )}
        </div>
      )}
    </IslandShell>
  );
}

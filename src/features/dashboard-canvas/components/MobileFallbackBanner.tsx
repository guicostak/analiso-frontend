"use client";

/**
 * MobileFallbackBanner
 *
 * Banner exibido no topo do `CanvasGrid` quando a viewport é menor que xl
 * (1280px). Comunica que a personalização só está disponível no Desktop ou
 * no app Analiso, com 2 CTAs concretos (não link genérico).
 */

import { Smartphone, Monitor } from "lucide-react";

export function MobileFallbackBanner() {
  return (
    <div className="rounded-[20px] border border-border bg-muted px-4 py-4 dark:bg-muted/50">
      <p className="text-[13px] font-semibold text-foreground">
        Personalize seu painel pelo Desktop ou pelo app Analiso
      </p>
      <p className="mt-1 text-[12px] leading-5 text-muted-foreground">
        Arrastar e reorganizar ilhas precisa de uma tela maior. Aqui você
        continua vendo as mesmas ilhas em ordem.
      </p>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <a
          href="/painel?source=mobile-banner"
          className="inline-flex items-center gap-1.5 rounded-full bg-card px-3 py-1.5 text-[12px] font-semibold text-foreground shadow-sm transition hover:bg-hover"
        >
          <Monitor className="h-3.5 w-3.5" />
          Abrir no Desktop
        </a>
        <a
          href="https://analiso.app/download"
          className="inline-flex items-center gap-1.5 rounded-full bg-brand px-3 py-1.5 text-[12px] font-semibold text-white shadow-sm transition hover:bg-brand-hover"
        >
          <Smartphone className="h-3.5 w-3.5" />
          Baixar o app
        </a>
      </div>
    </div>
  );
}

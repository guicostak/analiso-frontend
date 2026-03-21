"use client";

import { Share2, X } from "lucide-react";
import type { CompareEvidence } from "../interfaces";
import { Button } from "@/src/components/ui/button";

interface CompareEvidenceDrawerProps {
  data: CompareEvidence | null;
  onClose: () => void;
  formatMetric: (value: number | null, unit: string) => string;
}

export function CompareEvidenceDrawer({ data, onClose, formatMetric }: CompareEvidenceDrawerProps) {
  if (!data) return null;
  return (
    <div className="fixed inset-0 z-50">
      <button onClick={onClose} className="absolute inset-0 bg-black/30" />
      <aside className="absolute inset-y-0 right-0 w-full max-w-[460px] overflow-y-auto border-l border-border bg-card p-6 shadow-2xl">
        <div className="mb-6 flex items-start justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.08em] text-muted-foreground">
              Evidence drawer
            </p>
            <h3 className="mt-1 text-lg font-semibold text-foreground">{data.metricName}</h3>
          </div>
          <Button variant="ghost" size="icon-round" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        <div className="space-y-4 text-sm">
          <div className="rounded-xl border border-border bg-muted p-4">
            <p className="text-[12px] font-semibold text-muted-foreground">Valor atual A/B</p>
            <div className="mt-2 grid grid-cols-2 gap-3">
              <div>
                <p className="text-xs text-muted-foreground">{data.aTicker}</p>
                <p className="font-semibold">{formatMetric(data.aValue, data.unit)}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">{data.bTicker}</p>
                <p className="font-semibold">{formatMetric(data.bValue, data.unit)}</p>
              </div>
            </div>
          </div>
          <div>
            <p className="text-[12px] font-semibold text-muted-foreground">Definicao simples</p>
            <p className="mt-1 text-foreground">{data.definition}</p>
          </div>
          <div>
            <p className="text-[12px] font-semibold text-muted-foreground">Como calculamos</p>
            <p className="mt-1 text-foreground">{data.source.method}</p>
          </div>
          <div>
            <p className="text-[12px] font-semibold text-muted-foreground">Fonte</p>
            <p className="mt-1 text-foreground">
              {data.source.provider} / {data.source.document}
            </p>
          </div>
          <div>
            <p className="text-[12px] font-semibold text-muted-foreground">
              Data de atualizacao
            </p>
            <p className="mt-1 text-foreground">{data.source.updatedAt}</p>
          </div>
          {data.source.reference ? (
            <div>
              <p className="text-[12px] font-semibold text-muted-foreground">
                Trecho/identificador
              </p>
              <p className="mt-1 text-foreground">{data.source.reference}</p>
            </div>
          ) : null}
          <Button asChild variant="outline" className="rounded-xl">
            <a href={data.source.link} target="_blank" rel="noreferrer">
              Abrir documento <Share2 className="h-3.5 w-3.5" />
            </a>
          </Button>
        </div>
      </aside>
    </div>
  );
}

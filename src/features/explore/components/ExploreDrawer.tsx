"use client";

import { type ReactNode } from "react";
import { X } from "lucide-react";
import { Button } from "@/src/components/ui/button";

export function ExploreDrawer({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-20">
      <button className="absolute inset-0 bg-black/20" onClick={onClose} aria-label="Fechar" />
      <div
        role="dialog"
        aria-modal="true"
        className="absolute inset-0 bg-card p-6 md:inset-y-0 md:right-0 md:left-auto md:w-[420px] md:shadow-xl"
      >
        <div className="flex items-center justify-between mb-6">
          <h4 className="text-base font-semibold text-foreground">{title}</h4>
          <Button variant="outline" size="icon-round" onClick={onClose}>
            <X className="w-4 h-4 text-foreground/80" />
          </Button>
        </div>
        {children}
      </div>
    </div>
  );
}

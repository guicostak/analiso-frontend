"use client";

/**
 * ResetLayoutDialog
 *
 * Confirmação de "voltar ao painel padrão". Loss Aversion explícita:
 *   - copy enumera o que será perdido (nº de ilhas customizadas)
 *   - tom amber, nunca red gritante
 *   - depois de confirmar, quem chama deve tomar um snapshot do layout
 *     atual e oferecer Undo via toast (ver `DashboardCanvas`)
 */

import { RotateCcw, AlertTriangle } from "lucide-react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/src/components/ui/alert-dialog";

export interface ResetLayoutDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  /** Quantidade de ilhas atualmente no layout — usado pra narrar a perda. */
  currentCount: number;
}

export function ResetLayoutDialog({
  open,
  onOpenChange,
  onConfirm,
  currentCount,
}: ResetLayoutDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="border-amber-200 bg-amber-50/40 dark:border-amber-900/60 dark:bg-amber-950/20">
        <AlertDialogHeader>
          <div className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900/60 dark:text-amber-300">
              <AlertTriangle className="h-4 w-4" />
            </span>
            <AlertDialogTitle className="text-foreground">
              Voltar ao painel padrão?
            </AlertDialogTitle>
          </div>
          <AlertDialogDescription className="text-muted-foreground">
            Seu painel atual tem <strong className="text-foreground">{currentCount} ilha{currentCount === 1 ? "" : "s"}</strong>{" "}
            organizadas do seu jeito. Restaurar volta tudo pro layout default
            de 6 ilhas — você vai perder a ordem e a configuração de cada ilha.
            <br />
            <span className="mt-2 block text-[12px]">
              Você ainda tem <strong className="text-foreground">5 segundos</strong> pra desfazer depois.
            </span>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Manter meu painel</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className="bg-amber-600 text-white hover:bg-amber-700 focus-visible:ring-amber-500 dark:bg-amber-700 dark:hover:bg-amber-600"
          >
            <RotateCcw className="mr-2 h-4 w-4" />
            Restaurar mesmo assim
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

"use client";

/**
 * ResetLayoutDialog
 *
 * Confirmação de "voltar ao painel padrão". Loss Aversion: a ação destrói
 * trabalho prévio do usuário (layout customizado + configuração de cada
 * ilha), então o copy enfatiza a perda e o tom é amber — nunca red gritante.
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
}

export function ResetLayoutDialog({
  open,
  onOpenChange,
  onConfirm,
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
            Você vai perder seu layout atual e a configuração de cada ilha.
            Essa ação não pode ser desfeita.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className="bg-amber-600 text-white hover:bg-amber-700 focus-visible:ring-amber-500 dark:bg-amber-700 dark:hover:bg-amber-600"
          >
            <RotateCcw className="mr-2 h-4 w-4" />
            Sim, restaurar
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

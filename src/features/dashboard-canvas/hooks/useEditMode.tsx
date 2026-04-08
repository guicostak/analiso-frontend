"use client";

/**
 * useEditMode
 *
 * Estado global do modo edição do `DashboardCanvas`. Em Fase 3 o
 * `EditModeToggle` precisa viver fora da árvore do canvas (no `AppTopBar`),
 * então o estado é mantido em um store de módulo via `useSyncExternalStore`.
 *
 * `EditModeProvider` continua exportado como wrapper passivo (no-op) para
 * preservar compatibilidade com a Fase 2 — o estado real, porém, é global.
 */

import { useCallback, useSyncExternalStore, type ReactNode } from "react";

// ─── Store global ────────────────────────────────────────────────────────────

type Listener = () => void;

let editing = false;
const listeners = new Set<Listener>();

function emit() {
  for (const listener of listeners) listener();
}

function subscribe(listener: Listener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function getSnapshot(): boolean {
  return editing;
}

function getServerSnapshot(): boolean {
  return false;
}

function setEditing(next: boolean) {
  if (editing === next) return;
  editing = next;
  emit();
}

// ─── Hook público ────────────────────────────────────────────────────────────

export interface EditModeApi {
  isEditing: boolean;
  enter:    () => void;
  exit:     () => void;
  toggle:   () => void;
}

export function useEditMode(): EditModeApi {
  const isEditing = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const enter  = useCallback(() => setEditing(true),  []);
  const exit   = useCallback(() => setEditing(false), []);
  const toggle = useCallback(() => setEditing(!editing), []);
  return { isEditing, enter, exit, toggle };
}

/** Versão segura — idêntica a `useEditMode` agora que o store é global. */
export function useOptionalEditMode(): EditModeApi {
  return useEditMode();
}

/**
 * Wrapper passivo mantido por compatibilidade com a Fase 2. Não afeta o
 * estado — apenas renderiza os filhos.
 */
export function EditModeProvider({ children }: { children: ReactNode }) {
  return <>{children}</>;
}

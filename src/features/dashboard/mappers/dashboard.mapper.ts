import type { Status } from "../interfaces";

/**
 * Mapeia status financeiro para classes Tailwind usando tokens do design system.
 * Substitui os objetos de classe hardcoded espalhados nos componentes.
 */
export const statusBadgeClasses: Record<Status, string> = {
  Saudável: "border-success-border bg-success-surface text-success-text",
  Atenção:  "border-warning-border bg-warning-surface text-warning-text",
  Risco:    "border-danger-border  bg-danger-surface  text-danger-text",
};

/**
 * Classes base para superfícies de cards do dashboard.
 * Usa tokens do design system para suportar dark mode.
 */
export const SURFACE_BASE =
  "rounded-[24px] border border-border bg-card shadow-[0_14px_30px_rgba(15,23,40,0.04)]";

export const SURFACE_MEDIUM =
  "rounded-[20px] border border-border bg-card";

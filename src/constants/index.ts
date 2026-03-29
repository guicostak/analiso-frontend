// Constantes globais da aplicação
export const APP_NAME = "Analiso";
export const APP_DESCRIPTION = "Análise financeira guiada";

// Rotas
export const ROUTES = {
  HOME: "/",
  DASHBOARD: "/dashboard",
  EXPLORAR: "/explorar",
  WATCHLIST: "/watchlist",
  COMPARAR: "/comparar",
  ASSINATURA: "/assinatura",
  PERFIL: "/perfil",
  LOGIN: "/login",
} as const;

// API
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "";

// Constantes globais da aplicação
export const APP_NAME = "Analiso";
export const APP_DESCRIPTION = "Análise financeira guiada";

// Rotas
export const ROUTES = {
  HOME: "/",
  DASHBOARD: "/painel",
  MERCADO: "/mercado",
  BUSCAR: "/buscar",
  NOTICIAS: "/noticias",
  WATCHLIST: "/watchlist",
  COMPARAR: "/comparar",
  ASSINATURA: "/assinatura",
  PERFIL: "/perfil",
  LOGIN: "/login",
} as const;

// API — re-export from the canonical source
export { API_BASE_URL } from "@/src/lib/api-base";

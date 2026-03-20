/**
 * Tipos de domínio do Onboarding.
 *
 * Tipos de UI e estado ficam aqui.
 * Dados mock e funções puras ficam em src/services/onboarding.ts.
 */

// ─── Domínio ──────────────────────────────────────────────────────────────────

export type StartIntent =
  | "nao_sei_por_onde_comecar"
  | "muitos_indicadores"
  | "acompanhar_sem_ruido"
  | "entender_atencao_rapido";

export type OnboardingStep = 1 | 2 | 3 | 4;

export type TickerAddSource = "search" | "chip" | "grid";

// ─── Estado persistido ────────────────────────────────────────────────────────

export interface OnboardingDraft {
  startIntent: StartIntent | null;
  watchlistTickers: string[];
  onboardingCompleted: boolean;
}

// ─── Dados estáticos (espelhados via service) ─────────────────────────────────

export interface WatchlistSuggestion {
  name: string;
  ticker: string;
  tag: string;
  icon: string;
}

export interface IntentTileItem {
  id: StartIntent;
  title: string;
  helper: string;
  icon: string;
  imageSrc: string;
  imageAlt: string;
}

export interface ValueItem {
  id: string;
  title: string;
  description: string;
  icon: string;
  imageSrc: string;
}

export interface StepMeta {
  title: string;
  subtitle: string;
}

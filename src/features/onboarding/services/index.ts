/**
 * Onboarding service.
 *
 * Responsabilidades:
 *  1. Constantes de armazenamento local (chaves do localStorage)
 *  2. Dados mock: intenções de início, sugestões de watchlist, itens de valor
 *  3. Metadados de cada etapa (título e subtítulo)
 *  4. Funções puras (track, analytics placeholder)
 *
 * Independente de React — sem imports de hooks ou JSX.
 * Preparado para substituição por chamadas HTTP reais.
 */

import bussolaOnboarding from "@/src/assets/onboarding/bussola_onboarding.png";
import funilInfoOnboarding from "@/src/assets/onboarding/funil_info_onboarding.png";
import acompanharOnboarding from "@/src/assets/onboarding/acompanhar_onboarding.png";
import entenderOnboarding from "@/src/assets/onboarding/entender_onboarding.png";
import relogioOnboarding from "@/src/assets/onboarding/relogio_onboarding.png";
import pilaresOnboarding from "@/src/assets/onboarding/pilares_onboarding.png";
import feedOnboarding from "@/src/assets/onboarding/feed_onboarding.png";
import portaOnboarding from "@/src/assets/onboarding/porta_onboarding.png";
import wegLogo from "@/src/assets/logos/weg.jpeg";
import itauLogo from "@/src/assets/logos/itau.png";
import petrobrasLogo from "@/src/assets/logos/petrobras.webp";
import valeLogo from "@/src/assets/logos/vale.png";

import type {
  OnboardingDraft,
  IntentTileItem,
  ValueItem,
  WatchlistSuggestion,
  StepMeta,
} from "../interfaces";

// ─── Constantes de armazenamento ──────────────────────────────────────────────

export const DRAFT_KEY    = "analiso_onboarding_draft";
export const COMPLETE_KEY = "analiso_onboarding_completed";

export const TOTAL_STEPS = 4;

// ─── Estado padrão do rascunho ────────────────────────────────────────────────

export const defaultDraft: OnboardingDraft = {
  startIntent: null,
  watchlistTickers: [],
  onboardingCompleted: false,
};

// ─── Dados de imagem expostos como strings ────────────────────────────────────

export const companyLogoByTicker: Record<string, string> = {
  WEGE3: wegLogo.src,
  ITUB4: itauLogo.src,
  PETR4: petrobrasLogo.src,
  VALE3: valeLogo.src,
};

export const portaOnboardingSrc: string = portaOnboarding.src;

// ─── Tickers populares (chips de seleção rápida) ─────────────────────────────

export const popularTickers: string[] = [
  "WEGE3",
  "ITUB4",
  "PETR4",
  "VALE3",
  "BBDC4",
  "BBAS3",
  "ABEV3",
];

// ─── Sugestões de watchlist ───────────────────────────────────────────────────

export const watchlistSuggestions: WatchlistSuggestion[] = [
  { name: "WEG S.A.",       ticker: "WEGE3", tag: "Popular", icon: "factory"  },
  { name: "Itaú Unibanco",  ticker: "ITUB4", tag: "Grande",  icon: "bank"     },
  { name: "Petrobras",      ticker: "PETR4", tag: "Popular", icon: "oil"      },
  { name: "Vale",           ticker: "VALE3", tag: "Grande",  icon: "mine"     },
  { name: "Bradesco",       ticker: "BBDC4", tag: "Grande",  icon: "bank"     },
  { name: "Banco do Brasil",ticker: "BBAS3", tag: "Popular", icon: "bank"     },
  { name: "Ambev",          ticker: "ABEV3", tag: "Popular", icon: "factory"  },
  { name: "Magalu",         ticker: "MGLU3", tag: "Popular", icon: "store"    },
  { name: "Localiza",       ticker: "RENT3", tag: "Grande",  icon: "car"      },
  { name: "RaiaDrogasil",   ticker: "RADL3", tag: "Popular", icon: "pharmacy" },
];

// ─── Tiles da etapa 1 (intenção de início) ───────────────────────────────────

export const intentTileItems: IntentTileItem[] = [
  {
    id: "nao_sei_por_onde_comecar",
    title: "Não sei por onde começar",
    helper: "Receba um caminho claro para sair da dúvida inicial.",
    icon: "cap",
    imageSrc: bussolaOnboarding.src,
    imageAlt: "Ícone de bússola",
  },
  {
    id: "muitos_indicadores",
    title: "Vejo muitos indicadores e fico perdido",
    helper: "Foco no que importa, com contexto simples.",
    icon: "magnifier",
    imageSrc: funilInfoOnboarding.src,
    imageAlt: "Ícone de funil com informações",
  },
  {
    id: "acompanhar_sem_ruido",
    title: "Quero acompanhar minhas empresas sem ruído",
    helper: "Acompanhe mudanças relevantes sem excesso de informação.",
    icon: "bellpulse",
    imageSrc: acompanharOnboarding.src,
    imageAlt: "Ícone de watchlist",
  },
  {
    id: "entender_atencao_rapido",
    title: "Quero entender rápido quando uma empresa pede atenção",
    helper: "Veja sinais de atenção de forma direta e acionável.",
    icon: "bookmark",
    imageSrc: entenderOnboarding.src,
    imageAlt: "Ícone de atenção rápida",
  },
];

// ─── Cards de valor da etapa 2 ────────────────────────────────────────────────

export const valueItems: ValueItem[] = [
  {
    id: "v1",
    title: "Resumo em 60s",
    description: "Entenda uma empresa em minutos, sem virar analista.",
    icon: "dash",
    imageSrc: relogioOnboarding.src,
  },
  {
    id: "v2",
    title: "Principal força e principal atenção",
    description: "Veja rápido o que está bem e o que pede atenção.",
    icon: "bookmark",
    imageSrc: pilaresOnboarding.src,
  },
  {
    id: "v3",
    title: "Mudanças e fontes oficiais",
    description: "Entenda o que mudou e confirme tudo na fonte.",
    icon: "b3",
    imageSrc: feedOnboarding.src,
  },
];

// ─── Metadados de cada etapa ──────────────────────────────────────────────────

export const stepMeta: StepMeta[] = [
  {
    title: "O que mais te trava hoje ao investir?",
    subtitle: "Ajustamos a sua experiência para te levar ao valor mais rápido.",
  },
  {
    title: "Entenda uma empresa em minutos, sem virar analista",
    subtitle:
      "Te mostramos o que importa, por que importa e como confirmar direto em fontes oficiais.",
  },
  {
    title: "Escolha 3 empresas para começar",
    subtitle:
      "Com isso, seu dashboard já nasce útil e conseguimos te mostrar mudanças, contexto e prioridades logo no primeiro acesso.",
  },
  {
    title: "Tudo pronto para começar",
    subtitle: "Sua base inicial já está montada. Agora é só entrar no dashboard e começar.",
  },
];

// ─── Funções puras ────────────────────────────────────────────────────────────

/**
 * Filtra as sugestões de watchlist pelo termo de busca.
 * Corresponde ao nome da empresa ou ao ticker (case-insensitive).
 */
export function filterWatchlistSuggestions(
  suggestions: WatchlistSuggestion[],
  query: string,
): WatchlistSuggestion[] {
  const q = query.trim().toLowerCase();
  if (!q) return suggestions;
  return suggestions.filter(
    (item) =>
      item.name.toLowerCase().includes(q) || item.ticker.toLowerCase().includes(q),
  );
}

/**
 * Placeholder de analytics. Substitua por uma integração real (Amplitude, Segment, etc.).
 */
export function track(event: string, props?: Record<string, unknown>): void {
  console.log("[analytics]", event, props ?? {});
}

/**
 * Carrega o rascunho do onboarding salvo no localStorage.
 * Retorna o rascunho padrão se não houver nenhum salvo ou se houver erro de parse.
 */
export function loadDraft(): OnboardingDraft {
  if (typeof window === "undefined") return defaultDraft;
  try {
    const stored = window.localStorage.getItem(DRAFT_KEY);
    if (!stored) return defaultDraft;
    const parsed = JSON.parse(stored) as Partial<OnboardingDraft>;
    return { ...defaultDraft, ...parsed };
  } catch {
    return defaultDraft;
  }
}

/**
 * Persiste o rascunho do onboarding no localStorage.
 */
export function saveDraft(draft: OnboardingDraft): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
  } catch {
    // Ignora erros de quota ou contextos sem storage
  }
}

/**
 * Retorna true se o onboarding já foi marcado como concluído.
 */
export function isOnboardingCompleted(): boolean {
  if (typeof window === "undefined") return false;
  return window.localStorage.getItem(COMPLETE_KEY) === "true";
}

/**
 * Marca o onboarding como concluído no localStorage.
 */
export function markOnboardingCompleted(): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(COMPLETE_KEY, "true");
}

/**
 * Determina se o usuário pode avançar de uma determinada etapa.
 */
export function canAdvanceFromStep(
  step: number,
  draft: OnboardingDraft,
): boolean {
  if (step === 1) return draft.startIntent !== null;
  if (step === 2) return true;
  if (step === 3) return draft.watchlistTickers.length >= 3;
  if (step === 4) return true;
  return false;
}

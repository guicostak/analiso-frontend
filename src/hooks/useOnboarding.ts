"use client";

/**
 * useOnboarding
 *
 * Centraliza todo o estado e a lógica da página de Onboarding:
 *  - Persistência do rascunho no localStorage (substituição do useLocalDraft inline)
 *  - Navegação entre etapas
 *  - Gerenciamento da watchlist (adicionar, remover, busca)
 *  - Submissão final para a API
 *  - Rastreamento de analytics
 *  - Filtros derivados (sugestões filtradas pelo termo de busca)
 *
 * O componente OnboardingPage só precisa destructurar o retorno
 * e renderizar o JSX.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import { useAuth } from "../contexts/AuthContext";
import { apiFetch } from "../services/api";
import {
  defaultDraft,
  watchlistSuggestions,
  filterWatchlistSuggestions,
  track,
  loadDraft,
  saveDraft,
  isOnboardingCompleted,
  markOnboardingCompleted,
  canAdvanceFromStep,
  TOTAL_STEPS,
} from "../services/onboarding";

import type {
  OnboardingDraft,
  OnboardingStep,
  StartIntent,
  TickerAddSource,
  WatchlistSuggestion,
} from "../types/onboarding";

// ─── Tipo de retorno do hook ──────────────────────────────────────────────────

export interface UseOnboardingReturn {
  // Estado
  step: OnboardingStep;
  draft: OnboardingDraft;
  search: string;
  completing: boolean;
  completeError: string | null;

  // Dados derivados
  filteredSuggestions: WatchlistSuggestion[];
  canContinue: boolean;

  // Ações de navegação
  goNext: () => void;
  goBack: () => void;

  // Ações do rascunho
  setStartIntent: (intent: StartIntent) => void;
  addTicker: (ticker: string, source: TickerAddSource) => void;
  removeTicker: (ticker: string) => void;
  setSearch: (q: string) => void;
  handleSearchKeyDown: (event: React.KeyboardEvent<HTMLInputElement>) => void;

  // Submissão final
  handleComplete: () => Promise<void>;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useOnboarding(): UseOnboardingReturn {
  const router      = useRouter();
  const { token }   = useAuth();

  // — Rascunho persistido —
  const [draft, setDraft] = useState<OnboardingDraft>(defaultDraft);

  // Carrega o rascunho do localStorage apenas uma vez, no mount do cliente
  useEffect(() => {
    setDraft(loadDraft());
  }, []);

  // Persiste o rascunho sempre que ele mudar
  useEffect(() => {
    saveDraft(draft);
  }, [draft]);

  // — Etapa atual —
  const [step, setStep] = useState<OnboardingStep>(1);

  // — Busca de watchlist —
  const [search, setSearch] = useState("");

  // — Estado de submissão —
  const [completing,    setCompleting]    = useState(false);
  const [completeError, setCompleteError] = useState<string | null>(null);

  // Ref para evitar múltiplas submissões paralelas
  const completingRef = useRef(false);

  // — Efeitos de rastreamento —
  useEffect(() => {
    track("onboarding_start");
  }, []);

  useEffect(() => {
    track("onboarding_step_view", { step });
  }, [step]);

  // — Redireciona se o onboarding já estiver concluído —
  useEffect(() => {
    if (isOnboardingCompleted()) {
      router.push("/dashboard");
    }
  }, [router]);

  // — Avança automaticamente para a etapa 2 após escolher a intenção —
  useEffect(() => {
    if (draft.startIntent !== null) {
      setStep((prev) => (prev === 1 ? 2 : prev));
    }
  }, [draft.startIntent]);

  // — Helpers de atualização do rascunho —
  const updateDraft = useCallback((partial: Partial<OnboardingDraft>) => {
    setDraft((prev) => ({ ...prev, ...partial }));
  }, []);

  // — Ações de navegação —
  const goNext = useCallback(() => {
    track("onboarding_step_complete", { step });
    setStep((prev) => (Math.min(TOTAL_STEPS, prev + 1) as OnboardingStep));
  }, [step]);

  const goBack = useCallback(() => {
    setStep((prev) => (Math.max(1, prev - 1) as OnboardingStep));
  }, []);

  // — Ações do rascunho —
  const setStartIntent = useCallback(
    (intent: StartIntent) => {
      updateDraft({ startIntent: intent });
    },
    [updateDraft],
  );

  const addTicker = useCallback(
    (ticker: string, source: TickerAddSource) => {
      if (
        draft.watchlistTickers.includes(ticker) ||
        draft.watchlistTickers.length >= 10
      ) {
        return;
      }
      const next = [...draft.watchlistTickers, ticker];
      updateDraft({ watchlistTickers: next });
      track("watchlist_add", { ticker, source });
    },
    [draft.watchlistTickers, updateDraft],
  );

  const removeTicker = useCallback(
    (ticker: string) => {
      updateDraft({
        watchlistTickers: draft.watchlistTickers.filter((item) => item !== ticker),
      });
    },
    [draft.watchlistTickers, updateDraft],
  );

  // — Submissão do onboarding na Enter da busca —
  const handleSearchKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLInputElement>) => {
      if (event.key !== "Enter") return;
      event.preventDefault();
      const q = search.trim();
      if (!q) return;
      const match = watchlistSuggestions.find(
        (item) => item.ticker.toLowerCase() === q.toLowerCase(),
      );
      const ticker = match?.ticker ?? q.toUpperCase();
      addTicker(ticker, "search");
      setSearch("");
    },
    [search, addTicker],
  );

  // — Conclusão do onboarding —
  const handleComplete = useCallback(async () => {
    if (completingRef.current) return;
    completingRef.current = true;

    track("onboarding_complete", {
      startIntent: draft.startIntent,
      watchlistCount: draft.watchlistTickers.length,
    });

    setCompleting(true);
    setCompleteError(null);

    try {
      await apiFetch(
        "/api/me/watchlist/batch",
        {
          method: "POST",
          body: JSON.stringify({ tickers: draft.watchlistTickers }),
        },
        token,
      );

      updateDraft({ onboardingCompleted: true });
      markOnboardingCompleted();
      sessionStorage.setItem("onboarding_toast", "Tudo pronto. Sua watchlist já está montada.");
      router.push("/dashboard");
    } catch (err) {
      console.error("[onboarding] erro ao salvar watchlist:", err);
      setCompleteError("Não foi possível salvar sua watchlist. Tente novamente.");
      setCompleting(false);
      completingRef.current = false;
    }
  }, [draft.startIntent, draft.watchlistTickers, token, router, updateDraft]);

  // — Dados derivados —
  const filteredSuggestions = useMemo(
    () => filterWatchlistSuggestions(watchlistSuggestions, search),
    [search],
  );

  const canContinue = canAdvanceFromStep(step, draft);

  return {
    // Estado
    step,
    draft,
    search,
    completing,
    completeError,

    // Dados derivados
    filteredSuggestions,
    canContinue,

    // Ações de navegação
    goNext,
    goBack,

    // Ações do rascunho
    setStartIntent,
    addTicker,
    removeTicker,
    setSearch,
    handleSearchKeyDown,

    // Submissão
    handleComplete,
  };
}

"use client";

import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { useAuth } from "@/src/features/auth";
import { normalizeApiError } from "@/src/lib/errors";
import { fetchPlans, fetchSubscription } from "../services";
import type { SubscriptionData } from "../services";
import type { SubscriptionPlan } from "../interfaces";

export interface UseSubscriptionDataReturn {
  subscription: SubscriptionData | null;
  plans: SubscriptionPlan[];
  isLoading: boolean;
  /** Friendly error message ready for display, or null when no error. */
  error: string | null;
  /** Re-fetch subscription from API (e.g. after checkout or cancel) */
  refresh: () => Promise<void>;
}

export function useSubscriptionData(): UseSubscriptionDataReturn {
  const { token } = useAuth();

  const [subscription, setSubscription] = useState<SubscriptionData | null>(null);
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch plans (public, no auth)
  useEffect(() => {
    fetchPlans()
      .then(setPlans)
      .catch((err) => {
        const { message } = normalizeApiError(err);
        setError(message);
        toast.error(`Não foi possível carregar os planos. ${message}`);
      });
  }, []);

  // Fetch / refresh subscription
  const refresh = useCallback(async () => {
    if (!token) {
      setSubscription(null);
      setIsLoading(false);
      return;
    }
    try {
      const data = await fetchSubscription(token);
      setSubscription(data);
      setError(null);
    } catch (err) {
      const { message } = normalizeApiError(err);
      setError(message);
      toast.error(`Não foi possível carregar sua assinatura. ${message}`);
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { subscription, plans, isLoading, error, refresh };
}

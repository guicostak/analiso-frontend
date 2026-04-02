"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/src/features/auth";
import { fetchPlans, fetchSubscription } from "../services";
import type { SubscriptionData } from "../services";
import type { SubscriptionPlan } from "../interfaces";

export interface UseSubscriptionDataReturn {
  subscription: SubscriptionData | null;
  plans: SubscriptionPlan[];
  isLoading: boolean;
  error: boolean;
  /** Re-fetch subscription from API (e.g. after checkout or cancel) */
  refresh: () => Promise<void>;
}

export function useSubscriptionData(): UseSubscriptionDataReturn {
  const { token } = useAuth();

  const [subscription, setSubscription] = useState<SubscriptionData | null>(null);
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  // Fetch plans (public, no auth)
  useEffect(() => {
    fetchPlans()
      .then(setPlans)
      .catch(() => setError(true));
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
      setError(false);
    } catch {
      setError(true);
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { subscription, plans, isLoading, error, refresh };
}

import { apiFetch } from "@/src/lib/api";
import type { SubscriptionPlan } from "../interfaces";

export * from "./subscription.service";

/** GET /api/plans — public endpoint, no auth required */
export async function fetchPlans(): Promise<SubscriptionPlan[]> {
  return apiFetch<SubscriptionPlan[]>("/api/plans");
}

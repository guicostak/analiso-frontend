import { apiFetch } from "@/src/lib/api";

export interface SubscriptionData {
  id: number;
  plan: "essencial" | "premium" | "ilimitado";
  status: "active" | "cancelled" | "expired";
  billingCycle: "mensal" | "anual";
  startedAt: string;
  renewsAt: string | null;
  cancelledAt: string | null;
}

/** GET /api/me/subscription — returns null when user has no subscription */
export async function fetchSubscription(token: string): Promise<SubscriptionData | null> {
  try {
    return await apiFetch<SubscriptionData>("/api/me/subscription", {}, token);
  } catch (err: unknown) {
    // 204 No Content → no subscription
    if (err && typeof err === "object" && "status" in err && (err as { status: number }).status === 204) {
      return null;
    }
    // re-throw real errors
    throw err;
  }
}

/** POST /api/me/subscription — subscribe / change plan */
export async function subscribePlan(
  token: string,
  plan: string,
  billingCycle: string,
): Promise<SubscriptionData> {
  return apiFetch<SubscriptionData>(
    "/api/me/subscription",
    { method: "POST", body: JSON.stringify({ plan, billingCycle }) },
    token,
  );
}

/** DELETE /api/me/subscription — cancel current subscription */
export async function cancelSubscription(token: string): Promise<SubscriptionData> {
  return apiFetch<SubscriptionData>(
    "/api/me/subscription",
    { method: "DELETE" },
    token,
  );
}

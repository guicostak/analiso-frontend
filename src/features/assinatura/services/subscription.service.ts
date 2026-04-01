import { apiFetch } from "@/src/lib/api";

// ─── Backward-compatible SubscriptionData ────────────────────────────
// Keeps the same field names the existing UI components expect.
export interface SubscriptionData {
  id: number | null;
  plan: string;       // "free" | "essencial" | "premium" | "ilimitado"
  status: string;     // "active" | "cancelled" | "canceled" | "past_due" | "none" | ...
  billingCycle: string | null; // "mensal" | "anual"
  autoRenew: boolean;
  cancelAtPeriodEnd: boolean;
  startedAt: string | null;
  renewsAt: string | null;
  cancelledAt: string | null;
  stripeCustomerId?: string | null;
  stripeSubscriptionId?: string | null;
}

// ─── Billing API (new Stripe-based endpoints) ────────────────────────

/** GET /api/billing/subscription — always returns a subscription (free if none) */
export async function fetchSubscription(token: string): Promise<SubscriptionData> {
  return apiFetch<SubscriptionData>("/api/billing/subscription", {}, token);
}

/** POST /api/billing/create-checkout-session — returns clientSecret for embedded checkout */
export async function createCheckoutSession(
  token: string,
  plan: string,
  billingCycle: string,
  returnUrl: string,
): Promise<{ clientSecret: string }> {
  return apiFetch<{ clientSecret: string }>(
    "/api/billing/create-checkout-session",
    { method: "POST", body: JSON.stringify({ plan, billingCycle, returnUrl }) },
    token,
  );
}

/** POST /api/billing/create-portal-session — returns URL for Stripe billing portal */
export async function createPortalSession(
  token: string,
  returnUrl: string,
): Promise<{ url: string }> {
  return apiFetch<{ url: string }>(
    "/api/billing/create-portal-session",
    { method: "POST", body: JSON.stringify({ returnUrl }) },
    token,
  );
}

/** POST /api/billing/cancel-subscription — cancel at end of period */
export async function cancelSubscription(token: string): Promise<SubscriptionData> {
  return apiFetch<SubscriptionData>(
    "/api/billing/cancel-subscription",
    { method: "POST" },
    token,
  );
}

/** POST /api/billing/resume-subscription — resume a canceled subscription */
export async function resumeSubscription(token: string): Promise<SubscriptionData> {
  return apiFetch<SubscriptionData>(
    "/api/billing/resume-subscription",
    { method: "POST" },
    token,
  );
}

/** PATCH /api/billing/auto-renew — toggle auto-renewal */
export async function updateAutoRenew(
  token: string,
  autoRenew: boolean,
): Promise<SubscriptionData> {
  return apiFetch<SubscriptionData>(
    "/api/billing/auto-renew",
    { method: "PATCH", body: JSON.stringify({ autoRenew }) },
    token,
  );
}

/** GET /api/billing/session-status — check checkout session status (public) */
export async function getSessionStatus(sessionId: string): Promise<{ status: string }> {
  return apiFetch<{ status: string }>(`/api/billing/session-status?session_id=${sessionId}`);
}

// ─── Payment history ─────────────────────────────────────────────────

export interface PaymentHistoryItem {
  id: number;
  amount: number;
  currency: string;
  status: string;
  description: string | null;
  paidAt: string | null;
  createdAt: string;
}

/** GET /api/billing/payment-history — list user's payment records */
export async function fetchPaymentHistory(token: string): Promise<PaymentHistoryItem[]> {
  return apiFetch<PaymentHistoryItem[]>("/api/billing/payment-history", {}, token);
}

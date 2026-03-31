export type BillingCycle = "Mensal" | "Anual";

export interface SubscriptionFeature {
  label: string;
  included: boolean;
}

export interface PlanPricing {
  billingCycle: string;  // "mensal" | "anual"
  price: number;         // centavos (ex: 3900 = R$ 39)
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  badge?: string | null;
  highlighted: boolean;
  pricing: PlanPricing[];
  features: SubscriptionFeature[];
}

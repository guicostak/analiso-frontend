export type BillingCycle = "Mensal" | "Anual";

export interface SubscriptionFeature {
  label: string;
  included: boolean;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  monthlyInstallments: string;
  price: string;
  period: string;
  badge?: string;
  highlighted?: boolean;
  featuresTitle: string;
  features: SubscriptionFeature[];
}

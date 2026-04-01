"use client";

import { useCallback } from "react";
import { loadStripe } from "@stripe/stripe-js";
import {
  EmbeddedCheckoutProvider,
  EmbeddedCheckout as StripeEmbeddedCheckout,
} from "@stripe/react-stripe-js";
import { createCheckoutSession } from "../services";
import { useAuth } from "@/src/features/auth";

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? ""
);

interface EmbeddedCheckoutProps {
  plan: string;
  billingCycle: string;
  returnUrl: string;
}

export function EmbeddedCheckout({ plan, billingCycle, returnUrl }: EmbeddedCheckoutProps) {
  const { token } = useAuth();

  const fetchClientSecret = useCallback(async () => {
    if (!token) throw new Error("Not authenticated");
    const { clientSecret } = await createCheckoutSession(token, plan, billingCycle, returnUrl);
    return clientSecret;
  }, [token, plan, billingCycle, returnUrl]);

  return (
    <div id="checkout" className="w-full">
      <EmbeddedCheckoutProvider
        stripe={stripePromise}
        options={{ fetchClientSecret }}
      >
        <StripeEmbeddedCheckout />
      </EmbeddedCheckoutProvider>
    </div>
  );
}

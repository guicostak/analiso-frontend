import { ProtectedRoute } from "@/src/components/layout";
import { SubscriptionPage } from "@/src/features/assinatura/components";

export default function AssinaturaPage() {
  return (
    <ProtectedRoute>
      <SubscriptionPage />
    </ProtectedRoute>
  );
}
